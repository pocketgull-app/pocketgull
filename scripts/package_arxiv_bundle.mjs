#!/usr/bin/env node
/**
 * @file package_arxiv_bundle.mjs
 * @description Packages, validates, and hashes the arXiv submission bundle for PocketGull's
 * Tri-Paradigm Conformal Clinical Intervals & Open Patent Pledge research paper.
 */

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const ARXIV_DIR = resolve(process.cwd(), 'arxiv');
const OUTPUT_BUNDLE = resolve(process.cwd(), 'arxiv_submission_PG_CONF_2026.tar.gz');

console.log('🔬 [arXiv Packaging] Starting arXiv preprint bundle packaging...');

const requiredFiles = ['main.tex', 'references.bib', 'main.bbl'];
for (const file of requiredFiles) {
  const filePath = resolve(ARXIV_DIR, file);
  if (!existsSync(filePath)) {
    console.error(`❌ Missing required arXiv file: ${filePath}`);
    process.exit(1);
  }
}

// Basic TeX syntax sanity check
const mainTexContent = readFileSync(resolve(ARXIV_DIR, 'main.tex'), 'utf8');
const openBraces = (mainTexContent.match(/{/g) || []).length;
const closeBraces = (mainTexContent.match(/}/g) || []).length;

if (openBraces !== closeBraces) {
  console.warn(`⚠️ Warning: Brace count mismatch in main.tex (Open: ${openBraces}, Close: ${closeBraces})`);
} else {
  console.log(`✅ LaTeX syntax check: Braces balanced (${openBraces} pairs).`);
}

// Create tar.gz bundle using native tar
try {
  execSync(`tar -czf "${OUTPUT_BUNDLE}" -C "${ARXIV_DIR}" main.tex references.bib main.bbl`, { stdio: 'inherit' });
  console.log(`📦 Successfully packaged: ${OUTPUT_BUNDLE}`);
} catch (err) {
  console.error('❌ Failed to create tar.gz bundle:', err);
  process.exit(1);
}

// Compute SHA-256
const bundleBuffer = readFileSync(OUTPUT_BUNDLE);
const sha256 = createHash('sha256').update(bundleBuffer).digest('hex');

console.log('\n================================================================');
console.log('       🚀 arXiv SUBMISSION READY MANIFEST (PG-PAT-2026-CONF)     ');
console.log('================================================================');
console.log(`📁 Bundle Path       : ${OUTPUT_BUNDLE}`);
console.log(`🔒 Bundle SHA-256   : ${sha256}`);
console.log(`📏 Bundle Size      : ${(bundleBuffer.length / 1024).toFixed(2)} KB`);
console.log('----------------------------------------------------------------');
console.log('📋 METADATA TO PASTE INTO https://arxiv.org/submit :');
console.log('----------------------------------------------------------------');
console.log('Title:');
console.log('  System and Method for Tri-Paradigm Consilience and Finite-Sample Conformal Clinical Intervals with Epistemic Abstention\n');
console.log('Authors:');
console.log('  Phil Gear, PocketGull Applied Clinical AI Consortium\n');
console.log('Primary Category:');
console.log('  cs.AI (Artificial Intelligence)\n');
console.log('Cross-List Categories:');
console.log('  cs.LG (Machine Learning), stat.ML (Machine Learning), q-bio.QM (Quantitative Methods)\n');
console.log('License:');
console.log('  arXiv.org perpetual non-exclusive license (or Creative Commons Attribution 4.0 International)\n');
console.log('Comments:');
console.log('  USPTO Provisional Patent Docket PG-PAT-2026-CONF-001 with Open Patent Pledge and 35 U.S.C. 102 Prior Art Bar. 11 pages, 1 table, 1 algorithm.\n');
console.log('Direct Submission Portal:');
console.log('  👉 https://arxiv.org/submit');
console.log('================================================================\n');
