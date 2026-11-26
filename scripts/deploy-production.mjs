#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * Pocket Gull — Production Google Cloud Run Deployment Script (Artifact Registry + Fail-Closed)
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
const AR_REPO = 'cloud-run-source-deploy';
const IMAGE_BASE = `${REGION}-docker.pkg.dev/${TARGET_PROJECT}/${AR_REPO}/${SERVICE_NAME}`;
const IMAGE_TAG = `${IMAGE_BASE}:latest`;

console.log('==========================================================');
console.log('🚀 Deploying Pocket Gull to Google Cloud Run (Artifact Registry)');
console.log(`📌 Target Project: ${TARGET_PROJECT}`);
console.log(`🌐 Region: ${REGION}`);
console.log(`📦 Image Base: ${IMAGE_BASE}`);
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

// 0. Mandatory 8-Gate + Epistemic Pre-Flight Verification Chain
console.log('\n🧪 Step 0/5: Running mandatory pre-flight test, security, epistemic & IAM verification chain...');
run('npm run typecheck:all');
run('npx vitest run --config vitest.config.ts');
run('node scripts/run-python-tests.mjs');
run(`node "${join(rootDir, 'scripts/sentinel_security_guard.mjs')}"`);
run(`node "${join(rootDir, 'scripts/observatory_headers_guard.mjs')}"`);
run('npm run tippss:audit');
run('npm run taint:audit');
run(`node "${join(rootDir, 'scripts/fhir_conformance_guard.mjs')}"`);
run(`node "${join(rootDir, 'scripts/msa_governance_guard.mjs')}"`);
run(`node "${join(rootDir, 'scripts/poka_yoke_type_guard.mjs')}"`);
run(`node "${join(rootDir, 'scripts/epistemic_ground_truth_audit.mjs')}"`);
run(`node "${join(rootDir, 'scripts/generate_cyclonedx_sbom.mjs')}"`);
run(`node "${join(rootDir, 'scripts/audit-gcp-security-posture.mjs')}"`);

console.log('• Compiling production Angular SSR bundle locally...');
run('npm run build');

console.log('✅ All pre-flight gates & local build passed. Proceeding with deployment.');

// 1. Verify Project Config
console.log('\n🔍 Step 1/5: Verifying gcloud project configuration...');
run(`gcloud config set project ${TARGET_PROJECT}`);

// 2. Package Clean Allowlisted Deployment Source Archive (FAIL-CLOSED — never fall back to raw workspace upload!)
console.log('\n📦 Step 2/5: Packaging clean allowlisted source archive for Cloud Build...');
run(`node "${join(rootDir, 'scripts/package-deploy-source.mjs')}"`);

const sourceTar = join(rootDir, 'deploy_source.tar.gz');
if (!existsSync(sourceTar)) {
  console.error('❌ FATAL: Allowlisted deploy_source.tar.gz was not generated. Aborting to prevent leaking local workspace files.');
  process.exit(1);
}

// 3. Submit Cloud Build
console.log(`\n🏗️ Step 3/5: Submitting allowlisted archive (${(statSync(sourceTar).size / 1024 / 1024).toFixed(2)} MB) to Google Cloud Build...`);
run(`gcloud builds submit "${sourceTar}" --config=cloudbuild.yaml --project=${TARGET_PROJECT} --quiet`);

// 3b. Resolve Immutable Digest (FAIL-CLOSED — never fall back to mutable :latest tag!)
console.log('\n🔒 Step 3b/5: Resolving immutable image digest (OpenSSF / SLSA Provenance Standard)...');
const digestRaw = execSync(
  `gcloud artifacts docker images describe ${IMAGE_TAG} --format="value(image_summary.digest)" --project=${TARGET_PROJECT}`,
  { encoding: 'utf8', cwd: rootDir }
).trim();

if (!digestRaw || !digestRaw.startsWith('sha256:')) {
  console.error(`❌ FATAL: Could not resolve immutable sha256 digest for ${IMAGE_TAG}. Aborting deployment.`);
  process.exit(1);
}
const deployTarget = `${IMAGE_BASE}@${digestRaw}`;
console.log(`✅ Resolved immutable Artifact Registry target: ${deployTarget}`);

// 4. Deploy to Google Cloud Run
console.log('\n🚀 Step 4/5: Deploying immutable image to Google Cloud Run (Scale-to-Zero, Binary Authorization & Least-Privilege SA)...');
const commonRunArgs = [
  `--image ${deployTarget}`,
  `--project=${TARGET_PROJECT}`,
  `--service-account=pocketgull-run@${TARGET_PROJECT}.iam.gserviceaccount.com`,
  '--binary-authorization=default',
  '--platform managed',
  `--region ${REGION}`,
  '--allow-unauthenticated',
  '--execution-environment gen2',
  '--memory 2Gi',
  '--cpu 2',
  '--min-instances 0',
  '--max-instances 4',
  '--set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest',
  `--update-env-vars=NODE_ENV=production,OTEL_SDK_DISABLED=true,GOOGLE_CLOUD_PROJECT=${TARGET_PROJECT}`,
  '--quiet'
].join(' ');

run(`gcloud run deploy ${SERVICE_NAME} ${commonRunArgs}`);
run(`gcloud run deploy pocket-gull-v2 ${commonRunArgs}`);

// 5. Apply Lifecycle & Cost Controls
console.log('\n🧹 Step 5/5: Applying storage lifecycle and cost control policies...');
run(`node "${join(rootDir, 'scripts/apply-gcp-lifecycle-policies.mjs')}"`);

// 5b. Live Synthetic Mozilla HTTP Observatory 125 Verification Probe (FAIL-CLOSED)
console.log('\n🛡️ Step 5b/5: Probing live production endpoints for Mozilla Observatory 125 compliance...');
const probeDomains = [
  'https://pocketgull.app',
  'https://pocketgull.com',
  'https://www.pocketgull.com'
];

let probeFailures = 0;
for (const url of probeDomains) {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10000) });
    const csp = res.headers.get('content-security-policy') || '';
    const hsts = res.headers.get('strict-transport-security') || '';
    const coop = res.headers.get('cross-origin-opener-policy') || '';
    const corp = res.headers.get('cross-origin-resource-policy') || '';
    const coep = res.headers.get('cross-origin-embedder-policy') || '';
    const ref = res.headers.get('referrer-policy') || '';
    const xfo = res.headers.get('x-frame-options') || '';
    const xcto = res.headers.get('x-content-type-options') || '';

    const scriptSrc = (csp.match(/script-src\s+([^;]+)/i) || [])[1] || '';
    const checks = {
      cspStrictDynamic: scriptSrc.includes('strict-dynamic') && !scriptSrc.includes("'unsafe-inline'") && !scriptSrc.includes("'unsafe-eval'"),
      hstsPreload: hsts.includes('preload') && hsts.includes('31536000'),
      coop: coop === 'same-origin',
      corp: corp === 'same-origin',
      coep: coep === 'credentialless' || coep === 'require-corp',
      referrerPolicy: ref === 'strict-origin-when-cross-origin',
      xFrameOptions: xfo === 'SAMEORIGIN' || xfo === 'DENY',
      xContentTypeOptions: xcto === 'nosniff'
    };

    const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);
    if (failed.length === 0) {
      console.log(`  ✅ [LIVE OBSERVATORY 125 PASS] ${url}`);
    } else {
      probeFailures++;
      console.error(`  ❌ [LIVE OBSERVATORY FAIL] ${url} missing/degraded: ${failed.join(', ')}`);
    }
  } catch (probeErr) {
    probeFailures++;
    console.error(`  ❌ [LIVE PROBE ERROR] ${url}: ${probeErr.message}`);
  }
}

// Clean up local tarball
if (existsSync(sourceTar)) {
  unlinkSync(sourceTar);
}

if (probeFailures > 0) {
  console.error(`\n❌ Production live Observatory probe failed on ${probeFailures} domain(s).`);
  process.exit(1);
}

console.log('\n🏆 Production deployment and live Observatory 125 verification succeeded!\n');
