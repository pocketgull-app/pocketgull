#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * PocketGull Compile-Time Poka-Yoke Type Guard (Issue #276 — Expanded Epistemic Edition)
 *
 * Enforces zero-tolerance safety-critical typing across ALL Clinical Posology,
 * Vital Signs, Emergency Red-Flag, Cryptography, Safe Harbor, ISMP, and TIPPSS services.
 * Uses the TypeScript compiler AST to strictly ban:
 *  1. `as any` / `<any>` type assertions
 *  2. `: any` variable, parameter, property, and return type declarations
 *  3. `[key: string]: any` index signatures
 *  4. Nested `any` inside generics (`Record<string, any>`, `any[]`, `signal<any>`)
 *  5. `@ts-ignore` / `@ts-nocheck` / `@ts-expect-error` directives
 *
 * Includes a Popperian Falsification Self-Check proving every rule rejects bad TypeScript.
 *
 * @module scripts/poka_yoke_type_guard
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');

// Safety-critical clinical & cryptographic services subject to strict Poka-Yoke AST validation
const POKA_YOKE_TARGET_PATTERNS = [
  /clinical-posology/i,
  /exposome-posology/i,
  /deprescribing-depurator/i,
  /rx-guard\.service\.ts$/i,
  /clinical-trajectory-reader\.service\.ts$/i,
  /vitals-stream/i,
  /cardio-vitals/i,
  /physionet-acoustic/i,
  /clinical-vagal-resonant-pacing/i,
  /emergency-red-flag\.guard\.ts$/i,
  /ismp-safety-guard\.service\.ts$/i,
  /de-identification-engine\.service\.ts$/i,
  /tippss-ingestion-guard\.service\.ts$/i,
  /clinical-defense-guard\.service\.ts$/i,
  /patient\.types\.ts$/i,
  /phq9\.assessment\.ts$/i,
];

function collectTargetFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTargetFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
      const relPath = path.relative(workspaceRoot, fullPath).replace(/\\/g, '/');
      if (POKA_YOKE_TARGET_PATTERNS.some(pat => pat.test(relPath))) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

export function auditSourceTextForPokaYoke(content, filePath = '<inline.ts>') {
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const violations = [];

  function getLineCol(pos) {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
    return { line: line + 1, col: character + 1 };
  }

  // 1. Check for @ts-ignore / @ts-nocheck / @ts-expect-error in comments
  const lines = content.split('\n');
  lines.forEach((lineText, idx) => {
    if (/@ts-ignore|@ts-nocheck|@ts-expect-error/i.test(lineText)) {
      violations.push({
        file: filePath,
        line: idx + 1,
        col: 1,
        rule: 'no-ts-suppression-in-clinical',
        snippet: lineText.trim(),
        message: 'Compiler suppression directive (@ts-ignore / @ts-nocheck / @ts-expect-error) prohibited in clinical/safety code.'
      });
    }
  });

  // 2. AST Visitor covering ALL `AnyKeyword` occurrences in casts, annotations, return types, index signatures & generics
  function visit(node) {
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      const parent = node.parent;
      const { line, col } = getLineCol(node.getStart(sourceFile));
      let rule = 'no-explicit-any';
      let snippet = parent ? parent.getText(sourceFile).slice(0, 100) : 'any';

      if (parent && ts.isAsExpression(parent)) {
        rule = 'no-explicit-any-cast';
      } else if (parent && ts.isTypeAssertionExpression(parent)) {
        rule = 'no-angle-bracket-any-cast';
      } else if (parent && ts.isIndexSignatureDeclaration(parent)) {
        rule = 'no-any-index-signature';
      } else if (parent && (ts.isFunctionDeclaration(parent) || ts.isMethodDeclaration(parent) || ts.isArrowFunction(parent))) {
        rule = 'no-any-return-type';
      } else if (parent && (ts.isTypeReferenceNode(parent) || ts.isArrayTypeNode(parent))) {
        rule = 'no-any-generic-or-array';
      } else {
        rule = 'no-explicit-any-annotation';
      }

      violations.push({
        file: filePath,
        line,
        col,
        rule,
        snippet,
        message: `Untyped 'any' (${rule}) detected. Clinical & safety-critical services require explicit domain types.`
      });
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
}

export function auditFileForPokaYoke(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return auditSourceTextForPokaYoke(content, filePath);
}

function runFalsificationSelfCheck() {
  const poisoned = `
    // @ts-ignore
    interface Bad { [key: string]: any; }
    function badFn(x: Record<string, any>): any { return x as any; }
  `;
  const found = auditSourceTextForPokaYoke(poisoned, '<falsification-control.ts>');
  const rules = new Set(found.map(v => v.rule));
  const required = ['no-ts-suppression-in-clinical', 'no-any-index-signature', 'no-any-generic-or-array', 'no-any-return-type', 'no-explicit-any-cast'];
  const missing = required.filter(r => !rules.has(r));
  if (missing.length > 0) {
    console.error(`❌ [FALSIFICATION CONTROL FAILED] Poka-Yoke AST missed: ${missing.join(', ')}`);
    return false;
  }
  console.log(`✅ [Falsification Control] AST rejected all ${required.length}/${required.length} synthetic 'any'/suppression hazards.`);
  return true;
}

export function runPokaYokeGuard() {
  const servicesDir = path.join(workspaceRoot, 'src', 'services');
  const targetFiles = collectTargetFiles(servicesDir);

  console.log('🛡️  Running Compile-Time Poka-Yoke Type Guards (Expanded AST Suite)...');
  if (!runFalsificationSelfCheck()) return false;
  console.log(`📋 Scanning ${targetFiles.length} safety-critical clinical & cryptographic services:\n`);

  const allViolations = [];

  for (const file of targetFiles) {
    const relPath = path.relative(workspaceRoot, file).replace(/\\/g, '/');
    const violations = auditFileForPokaYoke(file);
    if (violations.length > 0) {
      console.error(`❌ [${relPath}]: ${violations.length} poka-yoke violation(s) found!`);
      violations.forEach(v => {
        console.error(`   line ${v.line}:${v.col} [${v.rule}]: ${v.message}`);
        console.error(`   snippet: "${v.snippet}"\n`);
      });
      allViolations.push(...violations);
    } else {
      console.log(`   ✓ ${relPath} (100% strictly typed)`);
    }
  }

  console.log('\n─────────────────────────────────────────────────────────────────');
  if (allViolations.length > 0) {
    console.error(`❌ Poka-Yoke Type Guard FAILED: ${allViolations.length} safety-critical violation(s) detected.`);
    return false;
  }

  console.log(`✅ Compile-Time Poka-Yoke Type Guards PASSED: 0 untyped 'any' casts/annotations across all ${targetFiles.length} clinical services.\n`);
  return true;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const passed = runPokaYokeGuard();
  process.exit(passed ? 0 : 1);
}
