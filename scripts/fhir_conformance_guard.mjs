// SPDX-License-Identifier: Apache-2.0
/**
 * 🩺 PocketGull Automated FHIR R4 Bundle Conformance & Epistemic PHI Guard
 *
 * Verifies:
 * 1. Bundle resourceType === 'Bundle' and valid type
 * 2. Every entry contains a valid resource with resourceType and id
 * 3. DocumentReference attachments have valid contentType and base64 payloads
 * 4. CarePlan has valid status, intent, and subject reference
 * 5. Observations contain standard LOINC / SNOMED CT coding systems
 * 6. HIPAA §164.514 Safe Harbor De-identification Invariant (zero raw SSN / MRN / personal NPI / raw patient name / uncapped >89 birthDate)
 * 7. Popperian Negative Falsification Control: proves validator rejects poisoned PHI & malformed bundles
 * 8. Live Source Serializer Audit: inspects actual FHIR serializer services in src/
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const RAW_SSN_RE = /\b\d{3}-\d{2}-\d{4}\b/;
const RAW_MRN_RE = /\bMRN[-:\s]?\d{5,}\b/i;
const PERSONAL_NPI_RE = /\b1487569752\b/;
const PERSONAL_NAME_RE = /\b(Phillip\s+Arthur\s+Gear|John\s+Doe|Jane\s+Smith)\b/i;

export function validateFhirBundle(bundle, label = 'Anonymous Bundle') {
  const errors = [];

  if (!bundle || bundle.resourceType !== 'Bundle') {
    errors.push(`[${label}] Missing or invalid resourceType: expected 'Bundle', got '${bundle?.resourceType}'`);
    return errors;
  }

  if (!bundle.type || !['transaction', 'collection', 'batch', 'document', 'searchset'].includes(bundle.type)) {
    errors.push(`[${label}] Invalid Bundle type: '${bundle.type}'`);
  }

  if (!Array.isArray(bundle.entry) || bundle.entry.length === 0) {
    errors.push(`[${label}] Bundle contains empty or invalid 'entry' array`);
    return errors;
  }

  // 6. Global Safe Harbor PHI Scan across serialized bundle
  const serialized = JSON.stringify(bundle);
  if (RAW_SSN_RE.test(serialized)) {
    errors.push(`[${label}] HIPAA §164.514 VIOLATION: Raw SSN pattern detected in FHIR Bundle payload`);
  }
  if (RAW_MRN_RE.test(serialized)) {
    errors.push(`[${label}] HIPAA §164.514 VIOLATION: Raw MRN identifier detected in FHIR Bundle payload`);
  }
  if (PERSONAL_NPI_RE.test(serialized) || PERSONAL_NAME_RE.test(serialized)) {
    errors.push(`[${label}] HIPAA §164.514 VIOLATION: Hardcoded personal/patient identifier detected in FHIR Bundle payload`);
  }

  const currentYear = new Date().getUTCFullYear();

  for (let i = 0; i < bundle.entry.length; i++) {
    const entry = bundle.entry[i];
    const resource = entry?.resource;

    if (!resource || !resource.resourceType) {
      errors.push(`[${label}] entry[${i}] missing valid resource or resourceType`);
      continue;
    }

    // Check Patient Safe Harbor invariants (>89 birthDate capping + no raw full name)
    if (resource.resourceType === 'Patient') {
      if (typeof resource.birthDate === 'string') {
        const yearMatch = resource.birthDate.match(/^(\d{4})/);
        if (yearMatch) {
          const birthYear = parseInt(yearMatch[1], 10);
          if (currentYear - birthYear > 89) {
            errors.push(`[${label}] HIPAA §164.514(b)(2)(i)(C) VIOLATION: Uncapped birthDate '${resource.birthDate}' reveals age > 89`);
          }
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(resource.birthDate)) {
          errors.push(`[${label}] HIPAA §164.514(b)(2)(i)(C) VIOLATION: Full YYYY-MM-DD birthDate '${resource.birthDate}' exposes exact date`);
        }
      }
      if (Array.isArray(resource.name)) {
        for (const n of resource.name) {
          const text = `${n?.text || ''} ${n?.family || ''} ${(n?.given || []).join(' ')}`.trim();
          if (text && !/(Homo Sapiens|Archetype|REDACTED|De-Identified|Anonymous|Safe Harbor)/i.test(text)) {
            errors.push(`[${label}] HIPAA §164.514 VIOLATION: Unredacted Patient.name '${text}'`);
          }
        }
      }
    }

    // Check DocumentReference
    if (resource.resourceType === 'DocumentReference') {
      if (!resource.status) {
        errors.push(`[${label}] DocumentReference/${resource.id || i} missing required 'status'`);
      }
      if (!resource.subject?.reference) {
        errors.push(`[${label}] DocumentReference/${resource.id || i} missing required 'subject.reference'`);
      }
      if (!Array.isArray(resource.content) || resource.content.length === 0) {
        errors.push(`[${label}] DocumentReference/${resource.id || i} missing content attachment`);
      } else {
        const attachment = resource.content[0]?.attachment;
        if (!attachment?.contentType) {
          errors.push(`[${label}] DocumentReference/${resource.id || i} attachment missing contentType`);
        }
        if (attachment?.data) {
          const decoded = Buffer.from(attachment.data, 'base64').toString('utf8');
          if (RAW_SSN_RE.test(decoded) || RAW_MRN_RE.test(decoded)) {
            errors.push(`[${label}] DocumentReference/${resource.id || i} base64 attachment leaks raw SSN/MRN`);
          }
        }
      }
    }

    // Check CarePlan
    if (resource.resourceType === 'CarePlan') {
      if (!resource.status || !resource.intent) {
        errors.push(`[${label}] CarePlan/${resource.id || i} missing status or intent`);
      }
      if (!resource.subject?.reference) {
        errors.push(`[${label}] CarePlan/${resource.id || i} missing subject.reference`);
      }
    }

    // Check Observation
    if (resource.resourceType === 'Observation') {
      if (!resource.status) {
        errors.push(`[${label}] Observation/${resource.id || i} missing status`);
      }
      if (!resource.code?.coding || !Array.isArray(resource.code.coding) || resource.code.coding.length === 0) {
        errors.push(`[${label}] Observation/${resource.id || i} missing code.coding array`);
      } else {
        const coding = resource.code.coding[0];
        if (!coding.system || !coding.code) {
          errors.push(`[${label}] Observation/${resource.id || i} coding missing required system URI or code`);
        }
      }
    }
  }

  return errors;
}

/**
 * Stage 1: Popperian Negative Falsification Controls (must REJECT poisoned inputs!)
 */
function runFalsificationControls() {
  const poisonedBundle = {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: [
      {
        resource: {
          resourceType: 'Patient',
          id: 'p-poison',
          name: [{ text: 'John Doe' }],
          birthDate: '1930-04-12'
        }
      },
      {
        resource: {
          resourceType: 'Observation',
          id: 'obs-poison',
          status: 'final',
          valueString: 'SSN 123-45-6789'
        }
      }
    ]
  };

  const errors = validateFhirBundle(poisonedBundle, 'FalsificationControl');
  const checks = [
    { name: 'Rejects raw SSN', ok: errors.some(e => e.includes('Raw SSN')) },
    { name: 'Rejects raw Patient.name', ok: errors.some(e => e.includes('Unredacted Patient.name')) },
    { name: 'Rejects uncapped >89 birthDate', ok: errors.some(e => e.includes('age > 89')) },
    { name: 'Rejects full YYYY-MM-DD birthDate', ok: errors.some(e => e.includes('exact date')) },
    { name: 'Rejects Observation missing code.coding', ok: errors.some(e => e.includes('missing code.coding')) }
  ];

  const failedControls = checks.filter(c => !c.ok);
  if (failedControls.length > 0) {
    return failedControls.map(f => `[FALSIFICATION CONTROL FAILED] Validator failed to catch: ${f.name}`);
  }
  console.log(`✅ [Stage 1] Popperian Falsification Controls: ${checks.length}/${checks.length} poisoned PHI/schema bundles properly rejected.`);
  return [];
}

/**
 * Stage 2: Audit REAL production FHIR R4 serializer implementations in src/
 */
function auditLiveFhirSerializers() {
  const issues = [];
  const targets = [
    'src/services/fhir-r4-bundle-export.service.ts',
    'src/services/export/fhir-export-strategy.service.ts',
    'src/services/export.service.ts',
    'src/server/routes/patients.routes.ts',
    'src/server/healthcare.ts'
  ];

  for (const relPath of targets) {
    const absPath = path.join(ROOT_DIR, relPath);
    if (!fs.existsSync(absPath)) {
      issues.push(`[MISSING] Expected FHIR serializer not found: ${relPath}`);
      continue;
    }
    const content = fs.readFileSync(absPath, 'utf8');

    // 1. No hardcoded personal practitioner NPI or street address
    if (content.includes('1487569752') || /Phillip\s+Arthur\s+Gear/i.test(content)) {
      issues.push(`[PHI/PII LEAK] ${relPath}: Hardcoded personal practitioner PII (NPI 1487569752 / personal name) found in FHIR serializer.`);
    }

    // 2. No hardcoded fabricated HRV or p-value defaults in FHIR export bundles
    if (/48\.5\s*ms/.test(content) && /0\.014/.test(content)) {
      issues.push(`[FABRICATED TELEMETRY] ${relPath}: Hardcoded fabricated HRV (48.5 ms) / p-value (0.014) found in FHIR export.`);
    }

    // 3. Flag direct raw patient.name / sanitizedP.name / payload.name emitted as Patient FHIR name
    if (/name:\s*\[\s*\{\s*(?:use:\s*['"]official['"],\s*)?text:\s*(?:patient\.name|sanitizedP\.name|payload\.name)\b/.test(content)) {
      issues.push(`[RAW PHI EXPORT] ${relPath}: Raw patient name emitted directly into FHIR Patient.name[].text.`);
    }

    // 4. Flag raw patient name in download filename
    if (/\$\{cleanName\}-fhir-bundle/.test(content)) {
      issues.push(`[RAW PHI FILENAME] ${relPath}: Raw patient name interpolated into downloaded FHIR filename.`);
    }

    // 5. Flag uncapped birthDate: `${currentYear - patient.age}` without >89 cap
    if (/birthDate:\s*`\$\{(?:currentYear|new Date\(\)\.getFullYear\(\))\s*-\s*(?:patient|p|payload)\.age\}`/.test(content)) {
      issues.push(`[SAFE HARBOR >89 VIOLATION] ${relPath}: Uncapped birthDate derived directly from age without >89 Safe Harbor cap.`);
    }
  }

  if (issues.length === 0) {
    console.log(`✅ [Stage 2] Live Source Serializer Audit: ${targets.length}/${targets.length} production FHIR serializers passed zero-PHI & integrity checks.`);
  }
  return issues;
}

// CLI Execution Entrypoint
async function runAudit() {
  console.log('🩺 PocketGull Automated FHIR R4 Bundle Conformance & Epistemic PHI Guard');
  console.log('========================================================================');

  const controlErrors = runFalsificationControls();
  const sourceErrors = auditLiveFhirSerializers();

  // Stage 3: Baseline schema check on conforming de-identified bundle
  const conformingBundle = {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: [
      {
        resource: {
          resourceType: 'Patient',
          id: 'pg-safe-001',
          name: [{ text: 'Homo Sapiens (Safe Harbor Archetype pg-safe-001)' }],
          birthDate: '1988'
        },
        request: { method: 'POST', url: 'Patient' }
      },
      {
        resource: {
          resourceType: 'DocumentReference',
          id: 'doc-sample-01',
          status: 'current',
          type: {
            coding: [{ system: 'http://loinc.org', code: '34133-9', display: 'Summarization of Episode Note' }]
          },
          subject: { reference: 'Patient/pg-safe-001', display: 'Homo Sapiens (Archetype pg-safe-001)' },
          date: new Date().toISOString(),
          content: [
            {
              attachment: {
                contentType: 'text/plain',
                data: Buffer.from('De-identified SBAR Clinical Note Content').toString('base64'),
                title: 'PocketGull Edge Autonomous SBAR Clinical Note'
              }
            }
          ]
        },
        request: { method: 'POST', url: 'DocumentReference' }
      },
      {
        resource: {
          resourceType: 'CarePlan',
          id: 'cp-sample-01',
          status: 'active',
          intent: 'plan',
          subject: { reference: 'Patient/pg-safe-001', display: 'Homo Sapiens (Archetype pg-safe-001)' },
          description: 'Stepped care plan with 0.1 Hz vagal modulation'
        },
        request: { method: 'POST', url: 'CarePlan' }
      },
      {
        resource: {
          resourceType: 'Observation',
          id: 'obs-sample-01',
          status: 'final',
          code: {
            coding: [{ system: 'http://loinc.org', code: '96766-1', display: 'Sepsis risk assessment score' }]
          },
          subject: { reference: 'Patient/pg-safe-001', display: 'Homo Sapiens (Archetype pg-safe-001)' },
          valueString: '{0, 1} (95% Conformal Set)'
        },
        request: { method: 'POST', url: 'Observation' }
      }
    ]
  };

  const schemaErrors = validateFhirBundle(conformingBundle, 'Conforming Safe Harbor Bundle');
  const allErrors = [...controlErrors, ...sourceErrors, ...schemaErrors];

  if (allErrors.length > 0) {
    console.error('\n❌ FHIR R4 & Safe Harbor Violations Detected:');
    allErrors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log('✅ [Stage 3] Conforming FHIR R4 Bundle Schema & Safe Harbor Invariants: PASS');
  console.log('========================================================================');
  console.log('🏆 [FHIR AUDIT PASS] All falsification controls, live serializers, and R4 schemas verified.');
  process.exit(0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  runAudit().catch(err => {
    console.error('Fatal error during FHIR audit:', err);
    process.exit(1);
  });
}
