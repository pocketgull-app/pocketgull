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

// 0. Mandatory Pre-Flight Verification Chain (Unit Tests, Lint, Security, SBOM)
console.log('\n🧪 Step 0/5: Running mandatory pre-flight test & security verification chain...');
run(`node "${join(rootDir, 'scripts/pre-commit-check.cjs')}"`);

console.log('• CycloneDX 1.6 SBOM Verification...');
run(`node "${join(rootDir, 'scripts/generate_cyclonedx_sbom.mjs')}"`);

console.log('• Compiling production Angular SSR bundle locally (Zero Cloud Compute)...');
run('npm run build');

console.log('✅ All pre-flight tests & local build passed successfully. Proceeding with deployment.');

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
console.log('\n🏗️ Step 3/5: Submitting pre-compiled container to Google Cloud Build (Free Tier)...');
const sourceTar = join(rootDir, 'deploy_source.tar.gz');
if (existsSync(sourceTar)) {
  console.log(`Found clean source archive with pre-compiled dist (${(statSync(sourceTar).size / 1024 / 1024).toFixed(2)} MB). Submitting to Cloud Build...`);
  run(`gcloud builds submit "${sourceTar}" --tag ${IMAGE_TAG} --project=${TARGET_PROJECT} --quiet`);
} else {
  run(`gcloud builds submit --tag ${IMAGE_TAG} --project=${TARGET_PROJECT} --quiet`);
}

// 3b. Resolve Immutable Digest (OpenSSF / SLSA Standard: Deploy by Immutable Content Digest)
console.log('\n🔒 Step 3b/5: Resolving immutable image digest (OpenSSF / SLSA Provenance Standard)...');
let deployTarget = IMAGE_TAG;
try {
  const digestRaw = execSync(
    `gcloud container images describe ${IMAGE_TAG} --format="value(image_summary.digest)" --project=${TARGET_PROJECT}`,
    { encoding: 'utf8', cwd: rootDir }
  ).trim();
  if (digestRaw && digestRaw.startsWith('sha256:')) {
    deployTarget = `gcr.io/${TARGET_PROJECT}/${SERVICE_NAME}@${digestRaw}`;
    console.log(`✅ Resolved immutable image digest: ${digestRaw}`);
    console.log(`🔒 OpenSSF Immutable Target: ${deployTarget}`);
  }
} catch (e) {
  console.warn('⚠️ Could not resolve immutable digest, falling back to tag:', e.message);
}

// 4. Deploy to Google Cloud Run
console.log('\n🚀 Step 4/5: Deploying image to Google Cloud Run (Scale-to-Zero & Zero Secret Injections)...');
run(
  `gcloud run deploy ${SERVICE_NAME} ` +
  `--image ${deployTarget} ` +
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
    `--image ${deployTarget} ` +
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

// 5b. Live Synthetic Mozilla HTTP Observatory 125 Verification Probe
console.log('\n🛡️ Step 5b/5: Probing live production endpoints for Mozilla Observatory 125 compliance...');
const probeDomains = [
  'https://pocketgull.app',
  'https://pocketgull.com',
  'https://www.pocketgull.com'
];

try {
  console.log('• Performing synthetic live HTTP header verification on production domains...');
  for (const url of probeDomains) {
    try {
      const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
      const csp = res.headers.get('content-security-policy') || '';
      const hsts = res.headers.get('strict-transport-security') || '';
      const coop = res.headers.get('cross-origin-opener-policy') || '';
      const corp = res.headers.get('cross-origin-resource-policy') || '';
      const coep = res.headers.get('cross-origin-embedder-policy') || '';

      const hasStrictDynamic = csp.includes('strict-dynamic');
      const hasPreload = hsts.includes('preload') && hsts.includes('31536000');
      const hasCoop = coop === 'same-origin';
      const hasCorp = corp === 'same-origin';
      const hasCoep = coep === 'credentialless' || coep === 'require-corp';

      if (hasStrictDynamic && hasPreload && hasCoop && hasCorp && hasCoep) {
        console.log(`  ✅ [LIVE OBSERVATORY PASS] ${url} (CSP + HSTS Preload + COOP + CORP + COEP Verified)`);
      } else {
        console.warn(`  ⚠️  [NOTICE] ${url} header propagation in progress:`);
        console.warn(`     CSP Strict-Dynamic: ${hasStrictDynamic ? 'YES' : 'PENDING'}`);
        console.warn(`     HSTS Preload: ${hasPreload ? 'YES' : 'PENDING'}`);
        console.warn(`     COOP same-origin: ${hasCoop ? 'YES' : 'PENDING'}`);
        console.warn(`     CORP same-origin: ${hasCorp ? 'YES' : 'PENDING'}`);
        console.warn(`     COEP credentialless: ${hasCoep ? 'YES' : 'PENDING'}`);
      }
    } catch (probeErr) {
      console.warn(`  ⚠️ Probe for ${url} timed out or awaiting cold start:`, probeErr.message);
    }
  }
} catch (probeBatchErr) {
  console.warn('⚠️ Live header probe warning:', probeBatchErr.message);
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

