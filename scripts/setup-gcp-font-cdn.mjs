#!/usr/bin/env node
/**
 * Pocket Gull — Google Cloud CDN & GCS Font Edge Provisioning Automation
 * Project: gen-lang-client-0540208645
 * Bucket: gs://font.pocketgull.app
 * 
 * Configures:
 * 1. GCS Bucket with Uniform Bucket-Level Access.
 * 2. Cross-Origin Resource Sharing (CORS) allowing universal web font loading.
 * 3. Syncs WOFF2 / TTF font binaries with immutable 1-year cache headers (`max-age=31536000, immutable`).
 * 4. Google Cloud CDN backend-bucket configuration for Anycast edge caching.
 */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const scriptDir = dirname(__filename);
const rootDir = resolve(scriptDir, '..');

const TARGET_PROJECT = process.env.GCP_PROJECT || 'gen-lang-client-0540208645';
const BUCKET_NAME = process.env.FONT_BUCKET || 'font.pocketgull.app';
const GCS_URI = `gs://${BUCKET_NAME}`;
const FONTS_DIR = join(rootDir, 'public', 'fonts');

const isDryRun = process.argv.includes('--dry-run');

console.log('===============================================================');
console.log('🌐 Pocket Gull — Google Cloud CDN Font Edge Provisioning');
console.log(`📌 Target Project: ${TARGET_PROJECT}`);
console.log(`🗄️  GCS Bucket:     ${GCS_URI}`);
console.log(`📁 Source Fonts:   ${FONTS_DIR}`);
console.log(`⚙️  Mode:           ${isDryRun ? 'DRY-RUN (Simulated)' : 'EXECUTE'}`);
console.log('===============================================================\n');

function runCmd(cmd) {
  console.log(`▶️  ${cmd}`);
  if (isDryRun) {
    return '[DRY-RUN] Command skipped in dry-run mode.';
  }
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : err.message;
    console.warn(`⚠️  Notice: ${stderr.trim()}`);
    return `[NOTICE] ${stderr.trim()}`;
  }
}

// 1. Verify Local Fonts Directory
if (!existsSync(FONTS_DIR)) {
  console.error(`❌ Fonts directory not found at: ${FONTS_DIR}`);
  process.exit(1);
}

const fontFiles = readdirSync(FONTS_DIR).filter(f => f.endsWith('.woff2') || f.endsWith('.ttf') || f.endsWith('.css'));
console.log(`📦 Found ${fontFiles.length} typography assets to distribute via Google Cloud CDN.\n`);

// 2. Provision GCS Bucket
console.log('--- Step 1: Provisioning GCS Bucket with Uniform Bucket-Level Access ---');
runCmd(`gcloud storage buckets create ${GCS_URI} --project=${TARGET_PROJECT} --location=us-central1 --uniform-bucket-level-access --quiet`);

// 3. Apply CORS Policy
console.log('\n--- Step 2: Applying Universal Web Font CORS Policy ---');
const corsPolicy = [
  {
    origin: ['*'],
    method: ['GET', 'HEAD', 'OPTIONS'],
    responseHeader: [
      'Content-Type',
      'Access-Control-Allow-Origin',
      'Timing-Allow-Origin',
      'Cross-Origin-Resource-Policy',
      'Cache-Control'
    ],
    maxAgeSeconds: 86400
  }
];

const tempCorsPath = join(scriptDir, 'temp-font-cors.json');
writeFileSync(tempCorsPath, JSON.stringify(corsPolicy, null, 2), 'utf-8');

try {
  runCmd(`gcloud storage buckets update ${GCS_URI} --cors-file="${tempCorsPath}" --project=${TARGET_PROJECT}`);
} finally {
  if (existsSync(tempCorsPath)) {
    unlinkSync(tempCorsPath);
  }
}

// 4. Configure Public Read Access for Web Fonts
console.log('\n--- Step 3: Granting Public Read Access to All Users (allUsers:objectViewer) ---');
runCmd(`gcloud storage buckets add-iam-policy-binding ${GCS_URI} --member=allUsers --role=roles/storage.objectViewer --project=${TARGET_PROJECT}`);

// 5. Sync Assets with Immutable Cache-Control Headers
console.log('\n--- Step 4: Syncing Fonts to GCS with Immutable Cache-Control Headers ---');
console.log('• Setting: Cache-Control: public, max-age=31536000, immutable');
runCmd(`gcloud storage rsync "${FONTS_DIR}" "${GCS_URI}/fonts" --recursive --exclude=".*\\.map$" --cache-control="public, max-age=31536000, immutable" --project=${TARGET_PROJECT}`);

// 6. Google Cloud CDN Anycast Backend Bucket Setup Instructions
console.log('\n--- Step 5: Google Cloud CDN & Load Balancer Integration Blueprint ---');
console.log(`
To attach this GCS bucket to an Anycast Google Cloud CDN backend bucket:

1. Create the Cloud CDN backend bucket:
   gcloud compute backend-buckets create font-edge-backend \\
     --gcs-bucket-name=${BUCKET_NAME} \\
     --enable-cdn \\
     --cache-mode=CACHE_ALL_STATIC \\
     --default-ttl=31536000 \\
     --client-ttl=31536000 \\
     --max-ttl=31536000 \\
     --custom-response-header="Access-Control-Allow-Origin: *" \\
     --custom-response-header="Timing-Allow-Origin: *" \\
     --custom-response-header="Cross-Origin-Resource-Policy: cross-origin" \\
     --project=${TARGET_PROJECT}

2. Attach to URL Map / Global External Load Balancer for font.pocketgull.app:
   gcloud compute url-maps add-path-matcher pocketgull-url-map \\
     --default-backend-bucket=font-edge-backend \\
     --path-matcher-name=font-matcher \\
     --new-hosts=font.pocketgull.app \\
     --project=${TARGET_PROJECT}

3. Provision Google-managed SSL Certificate:
   gcloud compute ssl-certificates create font-pocketgull-ssl \\
     --domains=font.pocketgull.app \\
     --global \\
     --project=${TARGET_PROJECT}
`);

console.log('===============================================================');
console.log('✅ Google Cloud CDN Font Edge Provisioning Script Completed');
console.log('===============================================================');
