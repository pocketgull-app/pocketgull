import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('🧪 NIH & WHO CLINICAL PIPELINE VERIFICATION SUITE');
console.log('====================================================');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    testsFailed++;
  }
}

// 1. Ingestion Pipeline Execution
console.log('\n[1/4] Running Ingestion & Preprocessing Pipeline...');
const { runNihWhoDatasetPipeline, sanitizeIsmpDecimals, verifyHipaaCompliance } = await import('./ingest_nih_who_corpus.ts');

const result = runNihWhoDatasetPipeline(path.join(projectRoot, 'scripts'));

assert(result.recordCount >= 5, `Curated corpus contains ${result.recordCount} clinical records (>= 5)`);
assert(fs.existsSync(result.geminiTuningPath), `Gemini SFT JSONL file created at ${result.geminiTuningPath}`);
assert(fs.existsSync(result.gemmaLoraPath), `Gemma LoRA JSONL file created at ${result.gemmaLoraPath}`);
assert(fs.existsSync(result.dpoPairsPath), `DPO Preference JSONL file created at ${result.dpoPairsPath}`);

// 2. ISMP Decimal Safety Rule Verification
console.log('\n[2/4] Verifying ISMP High-Risk Decimal Safety Rules...');
const ismpTests = [
  { raw: 'Administer Lisinopril 10.0 mg PO daily', expected: 'Administer Lisinopril 10 mg PO daily' },
  { raw: 'Inject .5 mg Morphine IV stat', expected: 'Inject 0.5 mg Morphine IV stat' },
  { raw: 'Infuse 500.00 mL Normal Saline over 2 hours', expected: 'Infuse 500 mL Normal Saline over 2 hours' },
  { raw: 'Titrate to .25 mcg/kg/min', expected: 'Titrate to 0.25 mcg/kg/min' },
  { raw: 'Amlodipine 5.0 mg and Losartan .5 g', expected: 'Amlodipine 5 mg and Losartan 0.5 g' }
];

for (const t of ismpTests) {
  const sanitized = sanitizeIsmpDecimals(t.raw);
  assert(sanitized === t.expected, `ISMP: "${t.raw}" -> "${sanitized}"`);
}

// 3. HIPAA §164.514 Safe Harbor De-identification Verification
console.log('\n[3/4] Verifying HIPAA Safe Harbor Scanner...');
const hipaaCleanText = 'Male (64y) presenting with Stage 1 Hypertension treated with Lisinopril 20 mg PO daily.';
const hipaaDirtyText = 'John Doe, SSN 123-45-6789, MRN: 982312, call at 555-867-5309 with blood pressure update.';

const cleanCheck = verifyHipaaCompliance(hipaaCleanText);
const dirtyCheck = verifyHipaaCompliance(hipaaDirtyText);

assert(cleanCheck.isClean === true && cleanCheck.violations.length === 0, 'Clean clinical archetype passes HIPAA audit');
assert(dirtyCheck.isClean === false && dirtyCheck.violations.length >= 3, `Dirty note correctly flags ${dirtyCheck.violations.length} violations: ${dirtyCheck.violations.join(', ')}`);

// 4. JSONL Format & Schema Verification
console.log('\n[4/4] Verifying Output JSONL Format & Structure...');

// Check Gemini Tuning JSONL
const geminiLines = fs.readFileSync(result.geminiTuningPath, 'utf-8').trim().split('\n');
let geminiValid = true;
for (const line of geminiLines) {
  const row = JSON.parse(line);
  if (!row.messages || row.messages.length !== 3 || row.messages[0].role !== 'system' || row.messages[1].role !== 'user' || row.messages[2].role !== 'model') {
    geminiValid = false;
    break;
  }
}
assert(geminiValid, `All ${geminiLines.length} Gemini SFT rows strictly conform to 3-role messages schema`);

// Check Gemma LoRA JSONL
const gemmaLines = fs.readFileSync(result.gemmaLoraPath, 'utf-8').trim().split('\n');
let gemmaValid = true;
for (const line of gemmaLines) {
  const row = JSON.parse(line);
  if (!row.instruction || !row.output) {
    gemmaValid = false;
    break;
  }
}
assert(gemmaValid, `All ${gemmaLines.length} Gemma LoRA rows conform to instruction/input/output schema`);

// Check DPO Pairs JSONL
const dpoLines = fs.readFileSync(result.dpoPairsPath, 'utf-8').trim().split('\n');
let dpoValid = true;
for (const line of dpoLines) {
  const row = JSON.parse(line);
  if (!row.prompt || !row.chosen || !row.rejected) {
    dpoValid = false;
    break;
  }
}
assert(dpoValid, `All ${dpoLines.length} DPO preference rows contain prompt, chosen, and rejected pairs`);

console.log('\n====================================================');
console.log(`🏁 VERIFICATION SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
console.log('====================================================\n');

if (testsFailed > 0) {
  process.exit(1);
}
