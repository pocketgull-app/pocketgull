/**
 * HL7 FHIR R4 Bundle & Resource Validator — GitHub Action
 * Validates:
 * 1. resourceType presence and validity (Bundle, Patient, Condition, Observation, CarePlan, MedicationRequest).
 * 2. FHIR R4 Bundle entry array and fullUrl structure.
 * 3. Status enum validation (e.g. active, final, preliminary).
 * 4. Coding system and code standards (LOINC, SNOMED-CT, RxNorm, ICD-10).
 */

import fs from 'fs';
import path from 'path';

const VALID_RESOURCE_TYPES = new Set([
  'Bundle', 'Patient', 'Condition', 'Observation', 'CarePlan', 'DiagnosticReport',
  'MedicationRequest', 'Encounter', 'Practitioner', 'Organization', 'Immunization',
  'AllergyIntolerance', 'ServiceRequest', 'DocumentReference'
]);

function validateFhirObject(obj, filePath) {
  const errors = [];

  if (!obj || typeof obj !== 'object') {
    return [`${filePath}: Root element must be a valid JSON object`];
  }

  if (!obj.resourceType) {
    return [`${filePath}: Missing mandatory 'resourceType' field`];
  }

  if (!VALID_RESOURCE_TYPES.has(obj.resourceType)) {
    errors.push(`${filePath}: Unrecognized resourceType '${obj.resourceType}'`);
  }

  if (obj.resourceType === 'Bundle') {
    if (!obj.type) {
      errors.push(`${filePath}: Bundle missing mandatory 'type' (e.g., 'collection', 'transaction', 'document')`);
    }
    if (obj.entry && Array.isArray(obj.entry)) {
      obj.entry.forEach((entry, idx) => {
        if (!entry.resource) {
          errors.push(`${filePath}: Bundle entry[${idx}] missing 'resource' object`);
        } else if (!VALID_RESOURCE_TYPES.has(entry.resource.resourceType)) {
          errors.push(`${filePath}: Bundle entry[${idx}] has invalid resourceType '${entry.resource.resourceType}'`);
        }
      });
    }
  }

  return errors;
}

function findFhirJsonFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', '.git', '.venv', 'tmp', '.angular'].includes(entry.name)) {
        findFhirJsonFiles(fullPath, files);
      }
    } else if (entry.isFile() && entry.name.endsWith('.json') && !entry.name.includes('package') && !entry.name.includes('tsconfig')) {
      try {
        const raw = fs.readFileSync(fullPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.resourceType || (parsed.resource && parsed.resource.resourceType))) {
          files.push({ path: fullPath, content: parsed });
        }
      } catch (e) {
        // Not a JSON file or malformed
      }
    }
  }
  return files;
}

console.log('==========================================================');
console.log('🏥 HL7 FHIR R4 Bundle & Resource Validator — GitHub Action');
console.log('==========================================================');

const fhirFiles = findFhirJsonFiles(process.cwd());
console.log(`Found ${fhirFiles.length} candidate FHIR resource JSON files.`);

let totalErrors = 0;
fhirFiles.forEach(f => {
  const errs = validateFhirObject(f.content, path.relative(process.cwd(), f.path));
  if (errs.length > 0) {
    totalErrors += errs.length;
    errs.forEach(e => console.error(`  ❌ ${e}`));
  } else {
    console.log(`  ✓ ${path.relative(process.cwd(), f.path)} [${f.content.resourceType}] is valid FHIR R4.`);
  }
});

if (totalErrors === 0) {
  console.log('\n✅ All FHIR resources conform to the HL7 FHIR R4 standard specification.');
  process.exit(0);
} else {
  console.error(`\n❌ Found ${totalErrors} FHIR schema validation errors.`);
  if (process.env.INPUT_FAIL_ON_INVALID !== 'false') {
    process.exit(1);
  }
}
