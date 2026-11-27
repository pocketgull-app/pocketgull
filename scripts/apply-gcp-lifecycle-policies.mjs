#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * Pocket Gull — GCP Scale-to-Zero & Storage Lifecycle Cleanup Automation
 * Enforces:
 * 1. Cloud Run scale-to-zero (`minScale: 0`).
 * 2. Artifact Registry 7-day auto-deletion policy (`olderThan: "604800s"`, `keepCount: 3`).
 * 3. GCS deployment source zip bucket 7-day object lifecycle deletion (`age: 7`).
 *
 * Fail-closed: prints actual gcloud stderr and exits non-zero on failure unless --dry-run is set.
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const scriptDir = dirname(__filename);

const TARGET_PROJECT = process.env.GCP_PROJECT || 'gen-lang-client-0540208645';
const DRY_RUN = process.argv.includes('--dry-run');

console.log('==========================================================');
console.log(`🧹 GCP Cloud Cost & Storage Lifecycle Automation (${TARGET_PROJECT})${DRY_RUN ? ' [DRY-RUN]' : ''}`);
console.log('==========================================================');

let failures = 0;

function runCmd(cmd) {
  if (DRY_RUN) {
    return { ok: true, output: `[DRY-RUN] Would execute: ${cmd}` };
  }
  try {
    const output = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    return { ok: true, output };
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString().trim() : err.message;
    return { ok: false, error: stderr };
  }
}

// 1. Verify Project
console.log(`\n📌 1. Verifying GCP Target Project (${TARGET_PROJECT})...`);
const currentProject = runCmd('gcloud config get-value project');
if (!currentProject.ok) {
  console.error(`❌ Failed to query gcloud project: ${currentProject.error}`);
  failures++;
} else {
  console.log(`Current gcloud project: ${currentProject.output}`);
}

// 2. Enforce Scale-to-Zero on Cloud Run
console.log('\n📉 2. Enforcing Scale-to-Zero on Cloud Run Service...');
const scaleRes = runCmd(
  `gcloud run services update pocket-gull --project=${TARGET_PROJECT} --region=us-central1 --min-instances=0 --quiet`
);
if (!scaleRes.ok) {
  console.error(`❌ Scale-to-Zero update failed: ${scaleRes.error}`);
  failures++;
} else {
  console.log(`✅ Scale-to-Zero Result: ${DRY_RUN ? scaleRes.output : 'Successfully set --min-instances=0'}`);
}

// 3. Apply Artifact Registry Cleanup Policy (no invalid --no-gcloudignore flag)
console.log('\n📦 3. Applying Artifact Registry 7-Day Cleanup Policy...');
const policyPath = join(scriptDir, 'artifact-cleanup-policy.json');
if (!existsSync(policyPath)) {
  console.error('❌ scripts/artifact-cleanup-policy.json not found.');
  failures++;
} else {
  const arRes = runCmd(
    `gcloud artifacts repositories set-cleanup-policies cloud-run-source-deploy --project=${TARGET_PROJECT} --location=us-central1 --policy="${policyPath}" --quiet`
  );
  if (!arRes.ok) {
    console.error(`❌ Artifact Registry policy update failed: ${arRes.error}`);
    failures++;
  } else {
    console.log(`✅ Artifact Registry Policy: ${DRY_RUN ? arRes.output : 'Applied 7-day auto-deletion + 3 build retention.'}`);
  }
}

// 4. Apply GCS Source Bucket Lifecycle Policy
console.log('\n🗄️ 4. Applying GCS Deployment Source Bucket 7-Day Lifecycle Policy...');
const gcsPolicyPath = join(scriptDir, 'gcs-lifecycle.json');
if (!existsSync(gcsPolicyPath)) {
  console.error('❌ scripts/gcs-lifecycle.json not found.');
  failures++;
} else {
  const bucketsRes = runCmd(`gcloud storage buckets list --project=${TARGET_PROJECT} --format="value(name)"`);
  if (!bucketsRes.ok) {
    console.error(`❌ Failed to list GCS buckets: ${bucketsRes.error}`);
    failures++;
  } else if (DRY_RUN) {
    console.log(`✅ ${bucketsRes.output}`);
  } else {
    const buckets = bucketsRes.output.split('\n').map(b => b.trim()).filter(b => b.includes('run-sources') || b.includes('cloudbuild'));
    console.log(`Found ${buckets.length} source deployment buckets to configure.`);
    for (const bucket of buckets) {
      const applyRes = runCmd(`gcloud storage buckets update gs://${bucket} --lifecycle-file="${gcsPolicyPath}"`);
      if (!applyRes.ok) {
        console.error(`❌ Failed to apply lifecycle policy on gs://${bucket}: ${applyRes.error}`);
        failures++;
      } else {
        console.log(`  ✅ gs://${bucket}: 7-day deletion policy active.`);
      }
    }
  }
}

console.log('\n==========================================================');
if (failures > 0) {
  console.error(`❌ Storage Lifecycle & Scale-to-Zero Automation FAILED (${failures} error(s)).`);
  console.log('==========================================================\n');
  process.exit(1);
}
console.log('✅ Storage Lifecycle & Scale-to-Zero Automation Complete!');
console.log('Target Storage Footprint: ~2–4 GB ($0.20/month baseline)');
console.log('==========================================================\n');
