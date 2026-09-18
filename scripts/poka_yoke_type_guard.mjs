#!/usr/bin/env node
/**
 * PocketGull Compile-Time Poka-Yoke Type Guard (Issue #276)
 *
 * Enforces zero-tolerance safety-critical typing across all Clinical Posology
 * and Vital Signs calculations. Uses the TypeScript compiler AST to strictly ban:
 *  1. `as any` type assertions
 *  2. `<any>` type assertions
 *  3. `: any` variable, parameter, or property type declarations
 *  4. `@ts-ignore` / `@ts-nocheck` suppression directives
 *
 * In clinical healthcare software (FDA CDS & ISMP safety standards), untyped
 * `any` casts in posology or vital sign services risk catastrophic dosage
 * miscalculations, unit conversions errors, and silent runtime corruption.
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

// Safety-critical clinical services subject to strict Poka-Yoke AST validation
const POKA_YOKE_TARGET_PATTERNS = [
  /clinical-posology/i,
  /exposome-posology/i,
  /deprescribing-depurator/i,
  /rx-guard\.service\.ts$/i,
  /clinical-trajectory-reader\.service\.ts$/i,
  /vitals-stream/i,
  /cardio-vitals/i,
  /physionet-acoustic/i,
  /clinical-vagal-resonant-pacing/i
];

/**
 * Recursively collects all TypeScript source files under src/services matching safety-critical criteria
 */
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
      const isTarget = POKA_YOKE_TARGET_PATTERNS.some(pat => pat.test(relPath));
      if (isTarget) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

/**
 * Audits a single TypeScript source file using AST traversal
 */
export function auditFileForPokaYoke(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const violations = [];

  function getLineCol(pos) {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
    return { line: line + 1, col: character + 1 };
  }

  // 1. Check for @ts-ignore or @ts-nocheck in comments
  const commentRanges = ts.getLeadingCommentRanges(content, 0) || [];
  // Also scan content for inline suppression directives
  const lines = content.split('\n');
  lines.forEach((lineText, idx) => {
    if (/@ts-ignore|@ts-nocheck/i.test(lineText)) {
      violations.push({
        file: filePath,
        line: idx + 1,
        col: 1,
        rule: 'no-ts-suppression-in-posology',
        snippet: lineText.trim(),
        message: 'Compiler suppression directive (@ts-ignore / @ts-nocheck) strictly prohibited in clinical posology/vitals code.'
      });
    }
  });

  // 2. AST Visitor to catch 'any' type casts and annotations
  function visit(node) {
    // Check: expr as any
    if (ts.isAsExpression(node)) {
      if (node.type && node.type.kind === ts.SyntaxKind.AnyKeyword) {
        const { line, col } = getLineCol(node.getStart(sourceFile));
        violations.push({
          file: filePath,
          line,
          col,
          rule: 'no-explicit-any-cast',
          snippet: node.getText(sourceFile),
          message: `Untyped 'as any' cast detected. Clinical posology and vitals require explicit domain interfaces.`
        });
      }
    }

    // Check: <any>expr
    if (ts.isTypeAssertionExpression(node)) {
      if (node.type && node.type.kind === ts.SyntaxKind.AnyKeyword) {
        const { line, col } = getLineCol(node.getStart(sourceFile));
        violations.push({
          file: filePath,
          line,
          col,
          rule: 'no-angle-bracket-any-cast',
          snippet: node.getText(sourceFile),
          message: `Untyped '<any>' assertion detected. Clinical calculations require explicit typing.`
        });
      }
    }

    // Check: x: any (Variable, Parameter, PropertyDeclaration)
    if (
      ts.isVariableDeclaration(node) ||
      ts.isParameter(node) ||
      ts.isPropertyDeclaration(node)
    ) {
      if (node.type && node.type.kind === ts.SyntaxKind.AnyKeyword) {
        const { line, col } = getLineCol(node.getStart(sourceFile));
        violations.push({
          file: filePath,
          line,
          col,
          rule: 'no-explicit-any-annotation',
          snippet: node.getText(sourceFile),
          message: `Declaration annotated with untyped ': any'. Use strict union or domain interface.`
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return violations;
}

/**
 * Runs the full Poka-Yoke Type Guard audit across all safety-critical services
 */
export function runPokaYokeGuard() {
  const servicesDir = path.join(workspaceRoot, 'src', 'services');
  const targetFiles = collectTargetFiles(servicesDir);

  console.log('🛡️  Running Compile-Time Poka-Yoke Type Guards (Issue #276)...');
  console.log(`📋 Scanning ${targetFiles.length} safety-critical clinical posology and vital sign services:\n`);

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
    console.error(`⚠️  Untyped 'any' casts and suppression comments are strictly banned in clinical posology & vitals.`);
    return false;
  }

  console.log(`✅ Compile-Time Poka-Yoke Type Guards PASSED: 0 untyped 'any' casts across all ${targetFiles.length} clinical services.\n`);
  return true;
}

// Direct execution entrypoint
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const passed = runPokaYokeGuard();
  process.exit(passed ? 0 : 1);
}
