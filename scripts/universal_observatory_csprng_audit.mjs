// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear
/**
 * Universal Higher-Order Audit (Observatory 125+, CSPRNG, Secrets, Foundry Provenance & Motion)
 *
 * Portable zero-dependency verifier runnable across any project repository:
 *   node C:/Users/philg/Pocketgull/pocketgull/scripts/universal_observatory_csprng_audit.mjs --root <dir>
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  BANNED_FOUNDRY_PATH_RE,
  PRIVATE_KEY_RE,
  SECURITY_CRITICAL_PATH_RE,
  hasProdUnsafeScriptCsp,
  hasUncommentedMathRandom
} from './higher_order_rules.mjs';

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.angular',
  '.vitest',
  '.playwright_temp',
  '.gradle',
  '.dart_tool',
  '.venv',
  'venv',
  '.tox',
  'site-packages',
  '__pycache__',
  'coverage',
  'tmp',
  'artifacts',
  'scratch',
  'target',
  'out-tsc'
]);

function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function checkServerCspAndHeaders(relPath, content, findings) {
  const requiredPatterns = [
    { name: 'HSTS Preload', re: /Strict-Transport-Security/i },
    { name: 'COOP', re: /Cross-Origin-Opener-Policy/i },
    { name: 'CORP', re: /Cross-Origin-Resource-Policy/i },
    { name: 'X-Content-Type-Options', re: /X-Content-Type-Options/i },
    { name: 'Referrer-Policy', re: /Referrer-Policy/i }
  ];

  const looksLikeHttpServer =
    /setHeader|Content-Security-Policy|headers/i.test(content) &&
    /(?:\.ts|\.js|\.mjs|\.cjs|firebase\.json|vercel\.json|netlify\.toml)$/i.test(relPath);
  if (!looksLikeHttpServer) return;

  for (const check of requiredPatterns) {
    if (!check.re.test(content)) {
      findings.violations.push(`${relPath}: missing Observatory baseline header check (${check.name})`);
    }
  }

  if (hasProdUnsafeScriptCsp(content)) {
    findings.violations.push(`${relPath}: potential production script-src 'unsafe-inline'/'unsafe-eval'`);
  }
}

export function auditRepository(rootDir) {
  const resolvedRoot = path.resolve(rootDir);
  const findings = {
    root: resolvedRoot,
    filesScanned: 0,
    violations: [],
    warnings: [],
    passes: []
  };

  if (!fs.existsSync(resolvedRoot)) {
    findings.violations.push(`Target root directory does not exist: ${resolvedRoot}`);
    return findings;
  }

  const allFiles = walkFiles(resolvedRoot);
  let hasKeyframes = false;
  let hasReducedMotion = false;
  let legacyMathRandomCount = 0;

  const candidateServerFiles = [
    'src/server.ts',
    'src/server.js',
    'server.js',
    'server.mjs',
    'firebase.json',
    'vercel.json',
    'netlify.toml'
  ];
  for (const rel of candidateServerFiles) {
    const p = path.join(resolvedRoot, rel);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      checkServerCspAndHeaders(rel.replace(/\\/g, '/'), content, findings);
    }
  }

  for (const fullPath of allFiles) {
    const rel = path.relative(resolvedRoot, fullPath).replace(/\\/g, '/');
    const isCode = /\.(?:ts|tsx|js|jsx|mjs|cjs|py|dart|kt|css|scss|html)$/i.test(rel);
    if (!isCode) continue;

    const isTestOrMeta =
      /\.(?:spec|test)\./i.test(rel) ||
      /^(?:\.?agents|docs|tests|e2e|scripts)\//i.test(rel);
    if (isTestOrMeta) continue;

    findings.filesScanned++;
    const content = fs.readFileSync(fullPath, 'utf8');

    if (PRIVATE_KEY_RE.test(content)) {
      findings.violations.push(`${rel}: private key literal detected`);
    }

    if (BANNED_FOUNDRY_PATH_RE.test(content)) {
      findings.violations.push(`${rel}: references deprecated v1/v2 legacy font directory`);
    }

    if (hasUncommentedMathRandom(content)) {
      if (SECURITY_CRITICAL_PATH_RE.test(rel)) {
        findings.violations.push(`${rel}: uses Math.random() in security/FHIR/server/guard path`);
      } else if (/^(?:src|app|lib)\//i.test(rel)) {
        legacyMathRandomCount++;
      }
    }

    if (/\.css$|\.scss$|\.ts$/i.test(rel)) {
      if (/@keyframes\b/.test(content)) hasKeyframes = true;
      if (/prefers-reduced-motion\s*:\s*reduce/.test(content)) hasReducedMotion = true;
    }
  }

  if (legacyMathRandomCount > 0) {
    findings.warnings.push(
      `Advisory CSPRNG debt: ${legacyMathRandomCount} non-security UI/audio/simulation source file(s) still reference Math.random()`
    );
  }

  if (hasKeyframes && !hasReducedMotion) {
    findings.warnings.push('CSS @keyframes found without matching prefers-reduced-motion: reduce rule in source styles');
  } else if (hasKeyframes) {
    findings.passes.push('Motion accessibility verified: @keyframes paired with prefers-reduced-motion: reduce');
  }

  findings.passes.push(`Scanned ${findings.filesScanned} runtime source files with ${findings.violations.length} violation(s)`);
  return findings;
}

function parseRootArg(argv) {
  const idx = argv.indexOf('--root');
  if (idx !== -1 && argv[idx + 1]) {
    return argv[idx + 1];
  }
  return process.cwd();
}

function runCli() {
  const rootArg = parseRootArg(process.argv.slice(2));
  const result = auditRepository(rootArg);
  console.log('===============================================================');
  console.log(`🌐 Universal Higher-Order Audit: ${result.root}`);
  console.log('===============================================================');
  for (const pass of result.passes) {
    console.log(`✅ [PASS] ${pass}`);
  }
  for (const warn of result.warnings) {
    console.warn(`⚠️  [WARN] ${warn}`);
  }
  for (const err of result.violations) {
    console.error(`❌ [VIOLATION] ${err}`);
  }
  if (result.violations.length > 0) {
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  runCli();
}
