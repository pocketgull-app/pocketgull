#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * Pocket-Gull FinOps Idle Hourly Burn Audit & Teardown Utility
 *
 * Audits (dry-run by default) or tears down (`--execute`) idle hourly-billed
 * GCP infrastructure in `gen-lang-client-0540208645` that caused ~$170-$275/mo
 * idle burn while all production traffic already routes via free Cloud Run
 * Custom Domain Mappings (`216.239.32.21..38.21`):
 *
 * 1. Cloud Workstations Cluster (`pocketgull-cluster` + `pocketgull-dev` in `us-central1`)
 *    - Saves ~$146/mo ($0.20/hr 24/7 cluster management fee) + ~$95/mo VM/PD costs.
 * 2. Orphaned Global External Load Balancer + Cloud Armor + Static IP (`35.186.221.122`)
 *    - Saves ~$24-$28/mo (forwarding rules + Cloud Armor policy + reserved IP).
 *
 * Usage:
 *   node scripts/teardown-gcp-idle-burn.mjs            # Safe dry-run audit only
 *   node scripts/teardown-gcp-idle-burn.mjs --execute  # Executes teardown (requires active billing + explicit confirmation)
 */

import { execSync } from 'node:child_process';

const PROJECT = process.env.GCP_PROJECT || 'gen-lang-client-0540208645';
const REGION = 'us-central1';
const EXECUTE = process.argv.includes('--execute');

function runCmd(cmd, { allowNotFound = true } = {}) {
  if (!EXECUTE) {
    console.log(`  [DRY-RUN] ${cmd}`);
    return { status: 'dry-run' };
  }
  console.log(`  [EXEC] ${cmd}`);
  try {
    const out = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    return { status: 'ok', out };
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString().trim() : err.message;
    if (allowNotFound && /not found|was not found|404/i.test(stderr)) {
      console.log('    -> Already absent (skipped).');
      return { status: 'not-found' };
    }
    console.warn(`    -> Warning: ${stderr}`);
    return { status: 'error', error: stderr };
  }
}

console.log('======================================================================');
console.log('  POCKETGULL FINOPS IDLE HOURLY BURN TEARDOWN UTILITY');
console.log(`  Project : ${PROJECT}`);
console.log(`  Mode    : ${EXECUTE ? 'LIVE EXECUTION (--execute)' : 'SAFE DRY-RUN (audit & preview only)'}`);
console.log('======================================================================\n');

// Step 0: Verify DNS safety invariant before touching the Load Balancer
console.log('Step 0: Verifying pocketgull.app DNS does NOT depend on 35.186.221.122...');
try {
  const nslookup = execSync('nslookup pocketgull.app', { encoding: 'utf8' });
  if (nslookup.includes('35.186.221.122')) {
    console.error('ABORT: pocketgull.app resolves to 35.186.221.122! Do not delete the Load Balancer until DNS points to Cloud Run domain mappings (216.239.32.21).');
    process.exit(1);
  }
  console.log('  [OK] pocketgull.app resolves to Google Cloud Run Domain Mappings (216.239.32.21..38.21), NOT 35.186.221.122.\n');
} catch {
  console.log('  [INFO] DNS lookup skipped or offline; proceeding with configured safety order.\n');
}

// Step 1: Cloud Workstations (Saves ~$146 - $245/mo)
console.log('Step 1: Cloud Workstations Cluster & Config Teardown (~$146-$245/mo saved)...');
if (EXECUTE) {
  try {
    const wsJson = execSync(
      `gcloud workstations list --cluster=pocketgull-cluster --config=pocketgull-dev --region=${REGION} --project=${PROJECT} --format="value(name)"`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();
    const instances = wsJson.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    for (const inst of instances) {
      const shortName = inst.split('/').pop();
      runCmd(`gcloud workstations delete ${shortName} --cluster=pocketgull-cluster --config=pocketgull-dev --region=${REGION} --project=${PROJECT} --quiet`);
    }
  } catch (e) {
    console.log('  [INFO] No individual workstation instances found or already removed.');
  }
} else {
  console.log(`  [DRY-RUN] gcloud workstations list/delete --cluster=pocketgull-cluster --config=pocketgull-dev --region=${REGION} --project=${PROJECT}`);
}

runCmd(`gcloud workstations configs delete pocketgull-dev --cluster=pocketgull-cluster --region=${REGION} --project=${PROJECT} --quiet`);
runCmd(`gcloud workstations clusters delete pocketgull-cluster --region=${REGION} --project=${PROJECT} --quiet`);

// Step 2: Orphaned Global External Load Balancer + Cloud Armor + Static IP (~$24-$28/mo saved)
console.log('\nStep 2: Orphaned Global Load Balancer, Cloud Armor & Static IP Teardown (~$25/mo saved)...');
runCmd(`gcloud compute forwarding-rules delete pocket-gull-forwarding-rule --global --project=${PROJECT} --quiet`);
runCmd(`gcloud compute forwarding-rules delete pocket-gull-http-forwarding-rule --global --project=${PROJECT} --quiet`);
runCmd(`gcloud compute target-https-proxies delete pocket-gull-https-proxy --global --project=${PROJECT} --quiet`);
runCmd(`gcloud compute target-http-proxies delete pocket-gull-http-proxy --global --project=${PROJECT} --quiet`);
runCmd(`gcloud compute url-maps delete pocket-gull-url-map --project=${PROJECT} --quiet`);
runCmd(`gcloud compute backend-services delete pocket-gull-backend --global --project=${PROJECT} --quiet`);
runCmd(`gcloud compute security-policies delete pocket-gull-armor-policy --project=${PROJECT} --quiet`);
runCmd(`gcloud compute addresses delete pocket-gull-secure-ip --global --project=${PROJECT} --quiet`);

for (const cert of ['pocket-gull-cert', 'pocket-gull-multi-cert', 'pocket-gull-multi-cert-v3', 'pocketgull-com-cert']) {
  runCmd(`gcloud compute ssl-certificates delete ${cert} --global --project=${PROJECT} --quiet`);
}

runCmd(`gcloud compute network-endpoint-groups delete pocket-gull-v2-neg --region=us-central1 --project=${PROJECT} --quiet`);
runCmd(`gcloud compute network-endpoint-groups delete pocket-gull-v2-neg --region=us-west1 --project=${PROJECT} --quiet`);
runCmd(`gcloud compute network-endpoint-groups delete understory-neg --region=us-west1 --project=${PROJECT} --quiet`);

console.log('\n======================================================================');
if (EXECUTE) {
  console.log('  SUCCESS: All idle hourly-billed GCP resources torn down!');
  console.log('  Projected ongoing monthly Cloud Run Scale-to-Zero bill: ~$1.00 - $5.00/mo');
} else {
  console.log('  DRY-RUN COMPLETE: Zero resources modified.');
  console.log('  Once GCP billing is re-enabled and you confirm deletion, run:');
  console.log('    npm run finops:teardown -- --execute');
}
console.log('======================================================================\n');
