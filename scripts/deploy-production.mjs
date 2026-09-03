#!/usr/bin/env node
/**
 * Pocket Gull — Production Google Cloud Run Deployment Script
 * Targets: gen-lang-client-0540208645
 */

import { execSync } from 'node:child_process';
import { existsSync, statSync, unlinkSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const scriptDir = dirname(__filename);
let rawRootDir = resolve(scriptDir, '..');
if (rawRootDir.match(/^[a-z]:/)) {
  rawRootDir = rawRootDir[0].toUpperCase() + rawRootDir.slice(1);
}
const rootDir = rawRootDir;
process.chdir(rootDir);

const TARGET_PROJECT = process.env.GCP_PROJECT || 'gen-lang-client-0540208645';
const SERVICE_NAME = 'pocket-gull';
const REGION = 'us-central1';
const IMAGE_TAG = `gcr.io/${TARGET_PROJECT}/${SERVICE_NAME}:latest`;

console.log('==========================================================');
console.log(`🚀 Deploying Pocket Gull to Google Cloud Run`);
console.log(`📌 Target Project: ${TARGET_PROJECT}`);
console.log(`🌐 Region: ${REGION}`);
console.log(`📦 Image Tag: ${IMAGE_TAG}`);
console.log('==========================================================');

function run(cmd, options = {}) {
  console.log(`\n▶️ ${cmd}`);
  try {
    return execSync(cmd, { cwd: rootDir, stdio: 'inherit', ...options });
  } catch (err) {
    console.error(`❌ Command failed: ${cmd}`);
    process.exit(1);
  }
}

// 0. Mandatory Pre-Flight Verification Chain (Unit Tests, Lint, Security, SBOM, W3C OTS Fonts)
console.log('\n🧪 Step 0/5: Running mandatory pre-flight test & security verification chain...');
run(`node "${join(rootDir, 'scripts/pre-commit-check.cjs')}"`);

console.log('• W3C OTS Typeface Conformance & Thomas Phinney Gate (Dart 3.11)...');
run('dart run scripts/dart/pocketgull_foundry.dart audit');
run('dart run scripts/dart/foundry/foundry_test.dart');

console.log('• CycloneDX 1.6 SBOM Verification...');
run(`node "${join(rootDir, 'scripts/generate_cyclonedx_sbom.mjs')}"`);

console.log('✅ All pre-flight tests passed successfully. Proceeding with deployment.');

// 1. Verify Project Config
console.log('\n🔍 Step 1/5: Verifying gcloud project configuration...');
run(`gcloud config set project ${TARGET_PROJECT}`);

// 2. Package Clean Deployment Source Archive
console.log('\n📦 Step 2/5: Packaging clean source archive for Cloud Build...');
const tmpDir = join(rootDir, 'tmp');
const archivePath = join(tmpDir, 'deploy_source.tar.gz');

try {
  run(`node "${join(rootDir, 'scripts/package-deploy-source.mjs')}"`);
} catch (e) {
  console.warn('⚠️ Fallback to direct directory upload...');
}

// 3. Submit Cloud Build
console.log('\n🏗️ Step 3/5: Building container image via Google Cloud Build...');
const sourceTar = join(rootDir, 'deploy_source.tar.gz');
if (existsSync(sourceTar)) {
  console.log(`Found clean source archive (${(statSync(sourceTar).size / 1024 / 1024).toFixed(2)} MB). Submitting to Cloud Build...`);
  run(`gcloud builds submit "${sourceTar}" --tag ${IMAGE_TAG} --project=${TARGET_PROJECT} --quiet`);
} else {
  run(`gcloud builds submit --tag ${IMAGE_TAG} --project=${TARGET_PROJECT} --quiet`);
}

// 4. Deploy to Google Cloud Run
console.log('\n🚀 Step 4/5: Deploying image to Google Cloud Run (Scale-to-Zero & Zero Secret Injections)...');
run(
  `gcloud run deploy ${SERVICE_NAME} ` +
  `--image ${IMAGE_TAG} ` +
  `--project=${TARGET_PROJECT} ` +
  `--platform managed ` +
  `--region ${REGION} ` +
  `--allow-unauthenticated ` +
  `--execution-environment gen2 ` +
  `--memory 2Gi ` +
  `--cpu 2 ` +
  `--min-instances 0 ` +
  `--max-instances 2 ` +
  `--clear-secrets ` +
  `--update-env-vars=OTEL_SDK_DISABLED=true,GOOGLE_CLOUD_PROJECT=${TARGET_PROJECT} ` +
  `--quiet`
);

console.log('\n🚀 Step 4b/5: Deploying to pocket-gull-v2 (Custom Domain Root pocketgull.app)...');
try {
  run(
    `gcloud run deploy pocket-gull-v2 ` +
    `--image ${IMAGE_TAG} ` +
    `--project=${TARGET_PROJECT} ` +
    `--platform managed ` +
    `--region ${REGION} ` +
    `--allow-unauthenticated ` +
    `--execution-environment gen2 ` +
    `--memory 2Gi ` +
    `--cpu 2 ` +
    `--min-instances 0 ` +
    `--max-instances 2 ` +
    `--clear-secrets ` +
    `--update-env-vars=OTEL_SDK_DISABLED=true,GOOGLE_CLOUD_PROJECT=${TARGET_PROJECT} ` +
    `--quiet`
  );
} catch (e) {
  console.warn('⚠️ pocket-gull-v2 deploy notice:', e.message);
}

// 5. Apply Lifecycle & Cost Controls
console.log('\n🧹 Step 5/5: Applying storage lifecycle and cost control policies...');
try {
  run(`node "${join(rootDir, 'scripts/apply-gcp-lifecycle-policies.mjs')}"`);
} catch (e) {
  console.warn('⚠️ Lifecycle policy application notice:', e.message);
}

// Clean up local tarball
if (existsSync(sourceTar)) {
  try {
    unlinkSync(sourceTar);
  } catch (e) {}
}

console.log('\n==========================================================');
console.log('✅ Pocket Gull Deployment to Google Cloud Run Succeeded!');
console.log(`🔗 Live URL: https://${SERVICE_NAME}-0540208645.us-central1.run.app`);
console.log('==========================================================');
