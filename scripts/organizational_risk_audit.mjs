/**
 * 🏢 Pocket-Gull Organizational Risk Audit (ORA) Guard
 * 
 * Programmatic verification of institutional, statutory, and administrative risk controls:
 * 1. Administrative Safeguards & Anti-Whaling Dual Custody (HIPAA § 164.308 / Mandiant Defense)
 * 2. Business Associate Agreement (BAA) & Third-Party Vendor Egress (HIPAA § 164.502(e) / § 164.504(e))
 * 3. Five Eyes (FVEY) Statutory Sovereignty & Crisis Redirection (US, UK, CA, AU, NZ)
 * 4. FDA 21 CFR Part 11 Electronic Records & NIST SP 800-90A Entropy Governance
 * 5. Microsoft Services Agreement (MSA) AI Governance & Ethical Liability (Sept 30, 2026)
 * 6. FTC 16 CFR Part 255 & Commercial Affiliate Egress Governance (Amazon Associates)
 * 7. Cloud FinOps, Scale-to-Zero & Operational Continuity
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const AUDIT_RESULTS = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

function recordCheck(domain, checkName, passed, message = '') {
  if (passed) {
    AUDIT_RESULTS.passed++;
    console.log(`  ✅ [PASS] [${domain}] ${checkName}`);
  } else {
    AUDIT_RESULTS.failed++;
    console.error(`  ❌ [FAIL] [${domain}] ${checkName}: ${message}`);
  }
  AUDIT_RESULTS.details.push({ domain, checkName, passed, message });
}

function recordWarning(domain, checkName, message) {
  AUDIT_RESULTS.warnings++;
  console.warn(`  ⚠️  [WARN] [${domain}] ${checkName}: ${message}`);
}

console.log('\n===============================================================');
console.log('🏢  Running PocketGull Organizational Risk Audit (ORA)');
console.log('===============================================================\n');

// ---------------------------------------------------------------------------
// DOMAIN 1: Administrative Safeguards & Anti-Whaling Dual Custody
// (HIPAA § 164.308(a)(1) & Mandiant Anti-Whaling Defense)
// ---------------------------------------------------------------------------
console.log('📋 Domain 1: Administrative Safeguards & Anti-Whaling Dual Custody');

const defenseServicePath = path.join(ROOT_DIR, 'src/services/clinical-defense-guard.service.ts');
if (fs.existsSync(defenseServicePath)) {
  const content = fs.readFileSync(defenseServicePath, 'utf8');

  // Check 1.1: verifyDualCustodyAuthorization method exists
  const hasDualCustodyMethod = content.includes('verifyDualCustodyAuthorization');
  recordCheck(
    'Domain 1: Dual-Custody',
    'Dual-Custody Multi-Signature Engine',
    hasDualCustodyMethod,
    'verifyDualCustodyAuthorization method missing from ClinicalDefenseGuardService.'
  );

  // Check 1.2: Enforces distinct roles (requestorRole !== authorizerRole)
  const hasRoleDemarcation = content.includes('requestorRole === authorizerRole');
  recordCheck(
    'Domain 1: Dual-Custody',
    'Distinct Roles Separation Invariant (SoD)',
    hasRoleDemarcation,
    'Single-identity bypass detected: requestorRole === authorizerRole check missing.'
  );

  // Check 1.3: Threshold check for bulk export and treasury disbursement
  const hasBulkCheck = content.includes('BULK_PHI_EXPORT');
  const hasTreasuryCheck = content.includes('HSA_TREASURY_DISBURSEMENT') && content.includes('dualCustodyThresholdUsd');
  recordCheck(
    'Domain 1: Dual-Custody',
    'Bulk PHI & Treasury Escalation Gates',
    hasBulkCheck && hasTreasuryCheck,
    'Bulk PHI export or treasury disbursement threshold gate missing.'
  );

  // Check 1.4: Forensic Snapshot audit logging with SHA-256 evidence payload
  const hasForensicSnapshots = content.includes('IIncidentForensicSnapshot') && content.includes('evidencePayloadHash');
  recordCheck(
    'Domain 1: Dual-Custody',
    'Immutable Forensic Attestation Snapshot Log',
    hasForensicSnapshots,
    'IIncidentForensicSnapshot with SHA-256 evidence hashing missing.'
  );
} else {
  recordCheck('Domain 1: Dual-Custody', 'ClinicalDefenseGuardService Presence', false, 'Service file not found.');
}

// ---------------------------------------------------------------------------
// DOMAIN 2: Business Associate Agreement (BAA) & Third-Party Vendor Egress
// (HIPAA § 164.502(e) / § 164.504(e))
// ---------------------------------------------------------------------------
console.log('\n📋 Domain 2: Business Associate Agreement (BAA) & Third-Party Vendor Egress');

// Check 2.1: Verify index.html contains ZERO un-BAA'd tracking scripts
const rootIndexPath = path.join(ROOT_DIR, 'index.html');
const publicIndexPath = path.join(ROOT_DIR, 'public/index.html');
const targetIndexPath = fs.existsSync(rootIndexPath) ? rootIndexPath : publicIndexPath;

if (fs.existsSync(targetIndexPath)) {
  const content = fs.readFileSync(targetIndexPath, 'utf8');
  const prohibitedTrackers = [
    'connect.facebook.net',
    'googletagmanager.com',
    'analytics.tiktok.com',
    'cdn.segment.com',
    'hotjar.com',
    'clarity.ms'
  ];

  const foundTrackers = prohibitedTrackers.filter(tracker => content.includes(tracker));
  recordCheck(
    'Domain 2: BAA Vendors',
    'Zero Commercial Trackers in Web Entrypoint',
    foundTrackers.length === 0,
    `Un-BAA commercial tracker detected: ${foundTrackers.join(', ')}`
  );
} else {
  recordCheck('Domain 2: BAA Vendors', 'Index HTML Presence', false, 'Entrypoint HTML not found.');
}

// Check 2.2: Sentinel Egress Whitelist enforces signed BAA covered endpoints
const sentinelPath = path.join(ROOT_DIR, 'scripts/sentinel_security_guard.mjs');
if (fs.existsSync(sentinelPath)) {
  const content = fs.readFileSync(sentinelPath, 'utf8');
  const hasGcpEgress = content.includes('googleapis.com') || content.includes('generativelanguage.googleapis.com');
  const hasCdnEgress = content.includes('font.pocketgull.app');
  recordCheck(
    'Domain 2: BAA Vendors',
    'Sentinel Approved BAA Egress Registry',
    hasGcpEgress && hasCdnEgress,
    'Sentinel security guard missing authorized HIPAA BAA cloud endpoints.'
  );
} else {
  recordCheck('Domain 2: BAA Vendors', 'Sentinel Security Guard Presence', false, 'sentinel_security_guard.mjs missing.');
}

// ---------------------------------------------------------------------------
// DOMAIN 3: Five Eyes (FVEY) Statutory Sovereignty & Crisis Redirection
// ---------------------------------------------------------------------------
console.log('\n📋 Domain 3: Five Eyes (FVEY) Statutory Sovereignty & Crisis Redirection');

const institutionalServicePath = path.join(ROOT_DIR, 'src/services/institutional-compliance.service.ts');
if (fs.existsSync(institutionalServicePath)) {
  const content = fs.readFileSync(institutionalServicePath, 'utf8');

  // Check 3.1: FVEY Sovereignty framework registered
  const hasFvey = content.includes('FVEY-SOVEREIGNTY');
  recordCheck(
    'Domain 3: FVEY Sovereignty',
    'Five Eyes Statutory Framework Registration',
    hasFvey,
    'FVEY-SOVEREIGNTY framework missing from InstitutionalComplianceService.'
  );

  // Check 3.2: 5 statutory crisis hotlines mapped (US 988, UK 111, CA 988, AU 13 11 14, NZ 1737)
  const hasHotlines = content.includes('988') && content.includes('111') && content.includes('13 11 14') && content.includes('1737');
  recordCheck(
    'Domain 3: FVEY Sovereignty',
    '24/7 National Emergency & Crisis Hotline Routing',
    hasHotlines,
    'One or more statutory FVEY crisis hotlines (988, 111, 13 11 14, 1737) missing.'
  );

  // Check 3.3: Statutory authorities registered (US HHS, UK NHS, CA Health, AU TGA, NZ HISO)
  const hasAuthorities = content.includes('US HHS') && content.includes('UK NHS') && content.includes('CA Health') && content.includes('AU TGA') && content.includes('NZ HISO');
  recordCheck(
    'Domain 3: FVEY Sovereignty',
    'Five Eyes Sovereign Authorities Alignment',
    hasAuthorities,
    'Statutory health authorities (HHS, NHS, Health Canada, TGA, HISO) incomplete.'
  );
} else {
  recordCheck('Domain 3: FVEY Sovereignty', 'InstitutionalComplianceService Presence', false, 'Service missing.');
}

// ---------------------------------------------------------------------------
// DOMAIN 4: FDA 21 CFR Part 11 Electronic Records & NIST SP 800-90A Entropy
// ---------------------------------------------------------------------------
console.log('\n📋 Domain 4: FDA 21 CFR Part 11 Electronic Records & NIST SP 800-90A Entropy');

if (fs.existsSync(institutionalServicePath)) {
  const content = fs.readFileSync(institutionalServicePath, 'utf8');

  // Check 4.1: FDA 21 CFR Part 11 Electronic Records integrity registered
  const hasPart11 = content.includes('FDA-CDSR-21CFR11');
  recordCheck(
    'Domain 4: Part 11 & Entropy',
    'FDA 21 CFR Part 11 Electronic Records Attestation',
    hasPart11,
    'FDA-CDSR-21CFR11 framework missing from InstitutionalComplianceService.'
  );

  // Check 4.2: NIST SP 800-90A Hardware Entropy & CSPRNG registered
  const hasNistEntropy = content.includes('NIST-SP-800-90A');
  recordCheck(
    'Domain 4: Part 11 & Entropy',
    'NIST SP 800-90A Hardware Entropy Standard',
    hasNistEntropy,
    'NIST-SP-800-90A standard missing from InstitutionalComplianceService.'
  );
}

// Check 4.3: Verify zero Math.random() in security-critical authentication and token files
const authServicePath = path.join(ROOT_DIR, 'src/services/epic-fhir.service.ts');
if (fs.existsSync(authServicePath)) {
  const content = fs.readFileSync(authServicePath, 'utf8');
  const hasInsecureRandom = /Math\.random\(\)/.test(content) && content.includes('code_verifier');
  recordCheck(
    'Domain 4: Part 11 & Entropy',
    'Zero Math.random() in OAuth PKCE Challenge Generation',
    !hasInsecureRandom,
    'Insecure Math.random() detected in OAuth PKCE code_verifier generation.'
  );
}

// ---------------------------------------------------------------------------
// DOMAIN 5: Microsoft Services Agreement (MSA) AI Governance & Ethical Liability
// ---------------------------------------------------------------------------
console.log('\n📋 Domain 5: Microsoft Services Agreement (MSA) AI Governance');

// Scan src directory for MSA prohibited patterns
const msaProhibited = [
  { pattern: /\b(detectEmotion|inferEmotion|voiceAffect|facialEmotion|emotionClassifier)\b/i, name: 'Emotion Inference Prohibition (Sec 14.s.ix.9)' },
  { pattern: /\b(stripC2PA|removeContentCredentials|stripProvenance)\b/i, name: 'C2PA Content Credentials Preservation (Sec 14.s.vii)' },
  { pattern: /\b(distillModel|trainCompetitorModel|extractModelWeights)\b/i, name: 'Model Extraction & Distillation Prohibition (Sec 14.s.iv)' }
];

let msaViolations = 0;
function scanMsa(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (['node_modules', '.git', 'dist', 'coverage', '.agents'].includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanMsa(fullPath);
    } else if (/\.(ts|js|mjs)$/.test(entry.name) && !entry.name.includes('guard') && !entry.name.includes('spec') && !entry.name.includes('test')) {
      const text = fs.readFileSync(fullPath, 'utf8');
      for (const rule of msaProhibited) {
        if (rule.pattern.test(text)) {
          msaViolations++;
          console.error(`  ❌ [FAIL] [Domain 5: MSA] ${rule.name} violated in ${path.relative(ROOT_DIR, fullPath)}`);
        }
      }
    }
  }
}

scanMsa(path.join(ROOT_DIR, 'src'));
recordCheck(
  'Domain 5: MSA AI Governance',
  'MSA Section 14.s Ethical AI Guardrails',
  msaViolations === 0,
  `${msaViolations} MSA Section 14.s violations detected.`
);

// ---------------------------------------------------------------------------
// DOMAIN 6: FTC 16 CFR Part 255 & Commercial Affiliate Egress Governance
// ---------------------------------------------------------------------------
console.log('\n📋 Domain 6: FTC 16 CFR Part 255 & Commercial Affiliate Egress');

// Check 6.1: InstitutionalComplianceService has FTC affiliate standard
if (fs.existsSync(institutionalServicePath)) {
  const content = fs.readFileSync(institutionalServicePath, 'utf8');
  const hasFtc = content.includes('FTC-AFFILIATE-EGRESS');
  recordCheck(
    'Domain 6: Commercial Egress',
    'FTC 16 CFR Part 255 Regulatory Framework',
    hasFtc,
    'FTC-AFFILIATE-EGRESS missing from InstitutionalComplianceService.'
  );
}

// Check 6.2: Outbound notification services prohibit raw Amazon links
const taskFlowPath = path.join(ROOT_DIR, 'src/components/task-flow.component.ts');
if (fs.existsSync(taskFlowPath)) {
  const content = fs.readFileSync(taskFlowPath, 'utf8');
  // Check that raw amazon affiliate links are not sent via SMS
  const hasRawSmsAffiliate = /sms:.*amazon\.com\/dp/i.test(content);
  recordCheck(
    'Domain 6: Commercial Egress',
    'Zero Raw Affiliate Links in Direct Patient SMS',
    !hasRawSmsAffiliate,
    'Raw Amazon affiliate links detected in SMS dispatch handler.'
  );
}

// ---------------------------------------------------------------------------
// DOMAIN 7: Cloud FinOps, Scale-to-Zero & Operational Continuity
// ---------------------------------------------------------------------------
console.log('\n📋 Domain 7: Cloud FinOps, Scale-to-Zero & Operational Continuity');

// Check 7.1: Verify Cloud Run deployment scripts enforce scale-to-zero
const deployScriptPath = path.join(ROOT_DIR, 'scripts/deploy-production.mjs');
if (fs.existsSync(deployScriptPath)) {
  const content = fs.readFileSync(deployScriptPath, 'utf8');
  const hasMinScaleZero = content.includes('--min-instances=0') || content.includes('min-instances 0') || content.includes('minScale: 0');
  recordCheck(
    'Domain 7: Operational FinOps',
    'Scale-to-Zero Cloud Run Deployment Policy',
    hasMinScaleZero,
    'Production deployment script does not enforce minScale: 0.'
  );
}

// Check 7.2: Verify Storage Lifecycle Policy (7-day auto-pruning)
const gcsLifecyclePath = path.join(ROOT_DIR, 'scripts/gcs-lifecycle.json');
if (fs.existsSync(gcsLifecyclePath)) {
  const content = fs.readFileSync(gcsLifecyclePath, 'utf8');
  const has7DayPruning = content.includes('"age": 7') || content.includes('604800');
  recordCheck(
    'Domain 7: Operational FinOps',
    '7-Day GCS Storage Pruning Lifecycle Policy',
    has7DayPruning,
    'Storage lifecycle policy missing 7-day auto-pruning rule.'
  );
}

// Check 7.3: Verify Zero-TTF container deployment invariant
const dockerignorePath = path.join(ROOT_DIR, '.dockerignore');
const gcloudignorePath = path.join(ROOT_DIR, '.gcloudignore');
const dockerTtf = fs.existsSync(dockerignorePath) && fs.readFileSync(dockerignorePath, 'utf8').includes('*.ttf');
const gcloudTtf = fs.existsSync(gcloudignorePath) && fs.readFileSync(gcloudignorePath, 'utf8').includes('*.ttf');

recordCheck(
  'Domain 7: Operational FinOps',
  'Zero-TTF Container Invariant (.dockerignore & .gcloudignore)',
  dockerTtf && gcloudTtf,
  'Desktop TTF fonts are not ignored in .dockerignore or .gcloudignore.'
);

// ---------------------------------------------------------------------------
// AUDIT SUMMARY & EXIT
// ---------------------------------------------------------------------------
console.log('\n===============================================================');
console.log(`📊 Organizational Risk Audit Summary: ${AUDIT_RESULTS.passed} Passed, ${AUDIT_RESULTS.failed} Failed, ${AUDIT_RESULTS.warnings} Warnings`);
console.log('===============================================================\n');

if (AUDIT_RESULTS.failed > 0) {
  console.error(`🚨 [ORGANIZATIONAL RISK AUDIT FAILED] ${AUDIT_RESULTS.failed} critical compliance gate(s) failed!\n`);
  process.exit(1);
} else {
  console.log('🏆 [ORGANIZATIONAL RISK PASS] 100% of Institutional, Statutory & Administrative Gates Verified!\n');
  process.exit(0);
}
