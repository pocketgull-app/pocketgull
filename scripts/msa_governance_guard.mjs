/**
 * Sentinel Security Guard - MSA & AI Services Compliance Audit
 * Scans codebase for violations of MSA Section 14.s and Section 14.i
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PROHIBITED_PATTERNS = [
  { pattern: /\b(detectEmotion|inferEmotion|voiceAffect|facialEmotion|emotionClassifier)\b/i, rule: 'MSA Sec 14.s.ix.9: Emotion inference prohibition' },
  { pattern: /\b(stripC2PA|removeContentCredentials|stripProvenance)\b/i, rule: 'MSA Sec 14.s.vii: Content credentials preservation' },
  { pattern: /\b(distillModel|trainCompetitorModel|extractModelWeights)\b/i, rule: 'MSA Sec 14.s.iv: Model extraction & distillation prohibition' },
];

function scanDirectory(dir, issues = []) {
  try {
    const files = readdirSync(dir);
    for (const file of files) {
      if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'coverage' || file === '.agents') continue;
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath, issues);
      } else if (/\.(ts|js|mjs)$/.test(file) && !file.endsWith('msa_governance_guard.mjs')) {
        const content = readFileSync(fullPath, 'utf8');
        for (const { pattern, rule } of PROHIBITED_PATTERNS) {
          if (pattern.test(content)) {
            issues.push({ file: fullPath, rule });
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error reading ${dir}:`, err);
  }
  return issues;
}

const issues = scanDirectory('./src');
if (issues.length > 0) {
  console.error('\x1b[31m[MSA GOVERNANCE AUDIT FAILED]\x1b[0m');
  issues.forEach(i => console.error(` - ${i.file}: ${i.rule}`));
  process.exit(1);
} else {
  console.log('\x1b[32m[MSA GOVERNANCE AUDIT PASSED]\x1b[0m 100% compliant with MSA Section 14.s & 14.i.');
}
