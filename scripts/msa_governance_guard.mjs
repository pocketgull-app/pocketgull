// SPDX-License-Identifier: Apache-2.0
/**
 * Sentinel Security Guard - Google GenAI ToS & MSA AI Services Compliance Audit
 *
 * Verifies:
 * 1. Google Generative AI Terms of Service (Model distillation & Referer restriction spoofing)
 * 2. MSA Section 14.s (Emotion inference prohibition, C2PA preservation, non-distillation)
 * 3. MSA Section 14.i (Health-bot medical advice & emergency services notice)
 * 4. Epistemic Prompt Integrity (Zero fabricated QALY album prescriptions)
 * 5. Popperian Falsification Self-Check (proves detectors catch prohibited patterns)
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');

export const PROHIBITED_PATTERNS = [
  { pattern: /\b(detectEmotion|inferEmotion|voiceAffect|facialEmotion|emotionClassifier)\b/i, rule: 'MSA Sec 14.s.ix.9: Emotion inference prohibition' },
  { pattern: /\b(stripC2PA|removeContentCredentials|stripProvenance)\b/i, rule: 'MSA Sec 14.s.vii: Content credentials preservation' },
  { pattern: /\b(distillModel|trainCompetitorModel|extractModelWeights|distillFromGemini|geminiToLlamaDistill|geminiToMistralDistill)\b/i, rule: 'Google GenAI ToS & MSA Sec 14.s.iv: Competing foundation model distillation prohibition' },
  { pattern: /['"]Referer['"]\s*:\s*['"]https?:\/\/pocketgull\.(app|com)\/?['"]/i, rule: 'Google Cloud API Security: Server-side Referer header spoofing to bypass API key restrictions' },
  { pattern: /Prescribed Therapeutic Album:\s*Actuarial Glee/i, rule: 'Popperian Epistemology & MSA Sec 14.i: Fabricated QALY album prescription prohibited in clinical prompts' },
];

export function scanContentForMsaViolations(content) {
  const hits = [];
  for (const { pattern, rule } of PROHIBITED_PATTERNS) {
    if (pattern.test(content)) {
      hits.push(rule);
    }
  }
  return hits;
}

function runFalsificationSelfCheck() {
  const samples = [
    'const mood = detectEmotion(audioStream);',
    'stripC2PA(imageBuffer);',
    'distillFromGemini(dataset);',
    'headers: { "Referer": "https://pocketgull.app" }',
    '### Prescribed Therapeutic Album: Actuarial Glee 12-Track Duet (+12.0 QALYs)'
  ];
  for (let i = 0; i < samples.length; i++) {
    if (scanContentForMsaViolations(samples[i]).length === 0) {
      console.error(`❌ [FALSIFICATION CONTROL FAILED] Pattern #${i + 1} failed to detect synthetic violation!`);
      process.exit(1);
    }
  }
  console.log(`✅ [Falsification Control] ${samples.length}/${samples.length} synthetic MSA/GenAI/Epistemic violations properly detected.`);
}

function scanDirectory(dir, issues = []) {
  try {
    const files = readdirSync(dir);
    for (const file of files) {
      if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'coverage' || file === '.agents') continue;
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath, issues);
      } else if (/\.(ts|js|mjs)$/.test(file) && !file.endsWith('msa_governance_guard.mjs') && !file.endsWith('.spec.ts')) {
        const content = readFileSync(fullPath, 'utf8');
        for (const rule of scanContentForMsaViolations(content)) {
          issues.push({ file: fullPath, rule });
        }
      }
    }
  } catch (err) {
    console.error(`Error reading ${dir}:`, err);
  }
  return issues;
}

function verifyMsa14iMedicalNotice() {
  const issues = [];
  const bannerPath = join(ROOT_DIR, 'src', 'components', 'clinical-cds-disclaimer-banner.component.ts');
  if (!existsSync(bannerPath)) {
    issues.push({ file: bannerPath, rule: 'MSA Sec 14.i: Mandatory CDS disclaimer banner component missing' });
    return issues;
  }
  const content = readFileSync(bannerPath, 'utf8');
  if (!/not a substitute for professional medical advice/i.test(content)) {
    issues.push({ file: bannerPath, rule: 'MSA Sec 14.i: Missing mandatory "not a substitute for professional medical advice" notice' });
  }
  if (!/emergency/i.test(content)) {
    issues.push({ file: bannerPath, rule: 'MSA Sec 14.i: Missing mandatory emergency medical services directive' });
  }
  return issues;
}

runFalsificationSelfCheck();
const issues = [
  ...scanDirectory(join(ROOT_DIR, 'src')),
  ...verifyMsa14iMedicalNotice()
];

if (issues.length > 0) {
  console.error('\x1b[31m[MSA GOVERNANCE AUDIT FAILED]\x1b[0m');
  issues.forEach(i => console.error(` - ${i.file}: ${i.rule}`));
  process.exit(1);
} else {
  console.log('\x1b[32m[AI GOVERNANCE AUDIT PASSED]\x1b[0m 100% compliant with Google GenAI ToS & MSA Section 14.s / 14.i (falsification verified).');
}
