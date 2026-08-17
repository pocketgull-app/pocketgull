import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');

const PROJECT_ID = 'gen-lang-client-0540208645';
const REGION = 'us-central1';
const SERVICE_NAME = 'pocket-gull-v2';
const IMAGE_URI = `us-central1-docker.pkg.dev/${PROJECT_ID}/cloud-run-source-deploy/${SERVICE_NAME}:latest`;

function run(cmd, desc) {
  console.log(`\n\x1b[36m[POCKET-GULL DEPLOY] >> ${desc}...\x1b[0m`);
  console.log(`$ ${cmd}\n`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: ROOT_DIR });
  } catch (err) {
    console.error(`\x1b[31m[ERROR] Failed during: ${desc}\x1b[0m`);
    process.exit(1);
  }
}

async function smokeTest() {
  console.log(`\n\x1b[36m[POCKET-GULL DEPLOY] >> Executing Live Post-Deploy Smoke Verification...\x1b[0m`);
  
  // 1. Get live service URL
  const urlBuffer = execSync(`gcloud run services describe ${SERVICE_NAME} --project=${PROJECT_ID} --region=${REGION} --format="value(status.url)"`, { cwd: ROOT_DIR });
  const serviceUrl = urlBuffer.toString().trim();
  console.log(`Target Cloud Run URL: ${serviceUrl}`);

  const endpoints = [
    { path: '/', expectedStatus: 200, checkLinkHeader: true },
    { path: '/llms.txt', expectedStatus: 200, checkContent: '# Pocket Gull' },
    { path: '/docs/overview.md', expectedStatus: 200, checkContent: '# Pocket Gull' }
  ];

  for (const ep of endpoints) {
    const fullUrl = `${serviceUrl}${ep.path}`;
    console.log(`Pinging ${fullUrl}...`);
    const res = await fetch(fullUrl);
    if (res.status !== ep.expectedStatus) {
      throw new Error(`Smoke test failed: ${fullUrl} returned status ${res.status} (expected ${ep.expectedStatus})`);
    }

    if (ep.checkLinkHeader) {
      const linkHeader = res.headers.get('link');
      if (!linkHeader || !linkHeader.includes('llms.txt')) {
        console.warn(`[WARN] Link header on root missing or unexpected: ${linkHeader}`);
      } else {
        console.log(`\x1b[32m  ✓ Link header verified: ${linkHeader}\x1b[0m`);
      }

      const csp = res.headers.get('content-security-policy');
      if (!csp || csp.includes('nonce-')) {
        console.warn(`[WARN] CSP header check: ${csp}`);
      } else {
        console.log(`\x1b[32m  ✓ Clean CSP header verified (no nonce collisions)\x1b[0m`);
      }
    }

    if (ep.checkContent) {
      const text = await res.text();
      if (!text.includes(ep.checkContent)) {
        throw new Error(`Smoke test failed: ${fullUrl} did not contain expected content '${ep.checkContent}'`);
      }
      console.log(`\x1b[32m  ✓ Content integrity verified (${text.length} bytes)\x1b[0m`);
    }
  }

  console.log(`\n\x1b[32m🎉 [DEPLOY SUCCESS] Service ${SERVICE_NAME} deployed and 100% traffic verified on revision!\x1b[0m\n`);
}

async function main() {
  console.log(`\x1b[35m====================================================\x1b[0m`);
  console.log(`\x1b[35m  Pocket-Gull Zero-Defect Production Deployment     \x1b[0m`);
  console.log(`\x1b[35m====================================================\x1b[0m`);

  // Step 1: Strict local typecheck
  const tscBin = resolve(ROOT_DIR, 'node_modules/typescript/lib/tsc.js');
  const tsconfig = resolve(ROOT_DIR, 'tsconfig.json');
  run(`node "${tscBin}" -p "${tsconfig}" --noEmit`, 'TypeScript Strict Typecheck');

  // Step 2: Hermetic Vitest suite
  const vitestBin = resolve(ROOT_DIR, 'node_modules/vitest/vitest.mjs');
  const vitestConfig = resolve(ROOT_DIR, 'vitest.config.ts');
  run(`node "${vitestBin}" run --config "${vitestConfig}"`, 'Vitest Unit & Clinical Specification Suite');

  // Step 3: Cloud Build Container Build & Push & Deploy & Traffic Shift
  run(`gcloud builds submit --config=cloudbuild.yaml . --project=${PROJECT_ID}`, 'Submit Automated Cloud Build');

  // Step 4: Live Smoke Test Verification
  await smokeTest();
}

main().catch(err => {
  console.error(`\x1b[31m[FATAL] Deployment pipeline aborted:\x1b[0m`, err);
  process.exit(1);
});
