/**
 * 🛡️ Pocket-Gull Sentinel Security & Egress Guard
 * Custom Step-Security Alternative & Network Boundary Auditor
 *
 * Features:
 * 1. Network Egress Boundary Auditor (Domain Whitelist Verification)
 * 2. Shannon Entropy High-Entropy Token & Secret Detector
 * 3. Multimodal Live Telemetry PHI/PII Guard
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Approved Egress Domain Whitelist for Clinical Intelligence & Cloud Engine
const APPROVED_EGRESS_DOMAINS = [
  'generativelanguage.googleapis.com',
  'googleapis.com',
  'cloudrun.app',
  'google.com',
  'ai.google.dev',
  'github.com',
  'githubusercontent.com',
  'api.github.com',
  'clamav.net',
  'www.clamav.net',
  'cerner.com',
  'authorization.cerner.com',
  'fhir-myrecord.cerner.com',
  'athenahealth.com',
  'api.platform.athenahealth.com',
  'va.gov',
  'sandbox-api.va.gov',
  'pocketgull.app',
  'www.pocketgull.app',
  'ssa.gov',
  'www.ssa.gov',
  'pocketgull.com',
  'cdn.tailwindcss.com',
  'tailwindcss.com',
  'fhir.org',
  'hl7.org',
  'loinc.org',
  'snomed.info',
  'schema.org',
  'modelcontextprotocol.io',
  'ec.europa.eu',
  'europa.eu',
  'unitsofmeasure.org',
  'epic.com',
  'fhir.epic.com',
  'ncbi.nlm.nih.gov',
  'nlm.nih.gov',
  'www.nlm.nih.gov',
  'eutils.ncbi.nlm.nih.gov',
  'pubmed.ncbi.nlm.nih.gov',
  'ama-assn.org',
  'www.ama-assn.org',
  'cdc.gov',
  'wwwn.cdc.gov',
  'orcid.org',
  'pub.orcid.org',
  'doi.org',
  'zenodo.org',
  'clinicaltrials.gov',
  'www.clinicaltrials.gov',
  'smarthealthit.org',
  'launch.smarthealthit.org',
  'caringinfo.org',
  'www.caringinfo.org',
  'foodwise.org',
  'www.foodwise.org',
  'freewill.com',
  'www.freewill.com',
  'trustandwill.com',
  'developers.zenodo.org',
  'fitbit.com',
  'api.fitbit.com',
  'stripe.com',
  'api.stripe.com',
  'amazon.com',
  'www.amazon.com',
  'pharmacy.amazon.com',
  'cpicpgx.org',
  'aws.amazon.com',
  'amazonaws.com',
  'healthlake.us-east-1.amazonaws.com',
  'azure.com',
  'azurehealthcareapis.com',
  'ohif.org',
  'viewer.ohif.org',
  'firebaseapp.com',
  'web.app',
  'reactome.org',
  'who.int',
  'www.who.int',
  'sccm.org',
  'www.sccm.org',
  'santafe.edu',
  'www.santafe.edu',
  'arizona.edu',
  'consciousness.arizona.edu',
  'stanford.edu',
  'hubermanlab.stanford.edu',
  'drmichaellevin.org',
  'www.drmichaellevin.org',
  'mit.edu',
  'biophysics.mit.edu',
  'asu.edu',
  'biodesign.asu.edu',
  'www.asu.edu',
  'uniprot.org',
  'www.uniprot.org',
  'mediawiki.org',
  'www.mediawiki.org',
  'huggingface.co',
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'cdn-lfs.huggingface.co',
  'wikimedia.org',
  'upload.wikimedia.org',
  'hooks.slack.com',
  'slack.com',
  'commons.wikimedia.org',
  'porkbun.com',
  'api.porkbun.com',
  'legalzoom.com',
  'www.legalzoom.com',
  'impact.com',
  'app.impact.com',
  'seatgeek.com',
  'developer.seatgeek.com',
  'instagram.com',
  'www.instagram.com',
  'tiktok.com',
  'www.tiktok.com',
  'facebook.com',
  'www.facebook.com',
  'x.com',
  'twitter.com',
  'example.com',
  'astro.build',
  'ieee.org',
  'acm.org',
  'cern.ch',
  'info.cern.ch',
  'opensource.org',
  'unpkg.com',
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'w3.org',
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
];

// Directories to scan
const SCAN_DIRECTORIES = ['src', 'public', 'pocketgull_api', 'scripts', 'docs'];

// File extensions to audit
const ALLOWED_EXTENSIONS = ['.ts', '.js', '.mjs', '.cjs', '.py', '.html', '.json'];

// Excluded paths
const IGNORE_PATTERNS = [
  'node_modules',
  'dist',
  'dist-ssr',
  '.git',
  '.venv',
  'python_example_2026',
  'package-lock.json',
  'audit.json',
];

/**
 * Calculate Shannon Entropy of a string
 */
function calculateShannonEntropy(str) {
  if (!str || str.length === 0) return 0;
  const frequencies = {};
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / str.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

/**
 * Scan a single file for network egress and secret entropy
 */
function auditFile(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const issues = [];
  const content = fs.readFileSync(filePath, 'utf-8');

  // 1. Audit Network Egress URLs (http://, https://, ws://, wss://)
  const urlRegex = /(?:https?|wss?):\/\/([a-zA-Z0-9.-]+(?:\:[0-9]+)?)/gi;
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    const domain = match[1].toLowerCase().split(':')[0];
    const isApproved = APPROVED_EGRESS_DOMAINS.some(
      (approved) => domain === approved || domain.endsWith('.' + approved)
    );

    if (!isApproved) {
      issues.push({
        type: 'UNAUTHORIZED_EGRESS_DOMAIN',
        severity: 'HIGH',
        message: `Unapproved external network egress domain detected: "${domain}"`,
        line: content.substring(0, match.index).split('\n').length,
      });
    }
  }

  // 2. Audit High-Entropy Secret Tokens (Length >= 28, Entropy > 4.6)
  const stringLiteralRegex = /(?:"|'|`)([A-Za-z0-9_\-\.\/+=]{28,})(?:"|'|`)/g;
  while ((match = stringLiteralRegex.exec(content)) !== null) {
    const literal = match[1];
    
    // Ignore standard SVG paths, base64 data URLs, public checklist IDs, and import paths
    if (
      literal.startsWith('data:') ||
      literal.includes('M0 ') ||
      literal.includes('L0 ') ||
      literal.startsWith('./') ||
      literal.startsWith('../') ||
      literal.includes('/') ||
      literal.startsWith('___')
    ) {
      continue;
    }

    const entropy = calculateShannonEntropy(literal);
    if (entropy > 4.65) {
      // Check for false positives like UUID placeholders
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(literal)) {
        continue;
      }
      issues.push({
        type: 'HIGH_ENTROPY_SECRET',
        severity: 'CRITICAL',
        message: `High-entropy secret token detected (Entropy: ${entropy.toFixed(2)}): "${literal.substring(0, 8)}..."`,
        line: content.substring(0, match.index).split('\n').length,
      });
    }
  }

  // 2b. Audit GitHub Tokens (ghs_, ghp_, gho_, ghu_, ghr_ - stateless & stateful format)
  const githubTokenRegex = /gh[psuor]_[A-Za-z0-9\.\-_]{36,}/g;
  while ((match = githubTokenRegex.exec(content)) !== null) {
    issues.push({
      type: 'LEAKED_GITHUB_TOKEN',
      severity: 'CRITICAL',
      message: `Hardcoded GitHub Token detected: "${match[0].substring(0, 8)}..."`,
      line: content.substring(0, match.index).split('\n').length,
    });
  }

  // 3. Audit Telemetry Stream Sanitization in Live Multimodal Handlers
  if (
    relativePath.includes('adk-live.service.ts') ||
    relativePath.includes('live-consult') ||
    relativePath.includes('voice-assistant')
  ) {
    if (!content.includes('sanitize') && !content.includes('anonymize') && !content.includes('DOMPurify')) {
      issues.push({
        type: 'MISSING_TELEMETRY_SANITIZER',
        severity: 'MEDIUM',
        message: `Live telemetry stream component does not reference DOMPurify or HIPAA PII sanitization filters.`,
        line: 1,
      });
    }
  }

  return issues;
}

/**
 * Traverse directories recursively
 */
function walkDirectory(dirPath) {
  let fileList = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(ROOT_DIR, fullPath);

    if (IGNORE_PATTERNS.some((pattern) => relativePath.includes(pattern))) {
      continue;
    }

    if (entry.isDirectory()) {
      fileList = fileList.concat(walkDirectory(fullPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ALLOWED_EXTENSIONS.includes(ext)) {
        fileList.push(fullPath);
      }
    }
  }

  return fileList;
}

/**
 * Run Sentinel Audit Suite
 */
function runSentinelGuard() {
  console.log('\n🛡️  Running Sentinel Security & Egress Guard...\n');

  let totalFilesScanned = 0;
  const allIssues = [];

  for (const targetDir of SCAN_DIRECTORIES) {
    const fullDir = path.join(ROOT_DIR, targetDir);
    if (!fs.existsSync(fullDir)) continue;

    const files = walkDirectory(fullDir);
    for (const file of files) {
      totalFilesScanned++;
      const fileIssues = auditFile(file);
      if (fileIssues.length > 0) {
        allIssues.push({
          file: path.relative(ROOT_DIR, file),
          issues: fileIssues,
        });
      }
    }
  }

  console.log(`📊 Scanned ${totalFilesScanned} source files for egress and secret security.`);

  if (allIssues.length === 0) {
    console.log('✅ [PASS] Sentinel Security Guard passed. All network egress domains approved and 0 secret leaks found.\n');
    process.exit(0);
  } else {
    console.error('\n❌ [FAIL] Sentinel Security Guard detected potential risks:');
    for (const fileGroup of allIssues) {
      console.error(`\n📄 ${fileGroup.file}:`);
      for (const issue of fileGroup.issues) {
        console.error(`  - [${issue.severity}] Line ${issue.line}: ${issue.message}`);
      }
    }
    console.error('\n⚠️  Please review network egress domains and secret tokens before committing.\n');
    process.exit(1);
  }
}

runSentinelGuard();
