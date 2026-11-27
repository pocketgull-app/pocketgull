// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { evaluateToolCall } from './agy_pre_tool_guard.mjs';
import { auditRepository } from './universal_observatory_csprng_audit.mjs';

test('PreToolUse blocks --no-verify, force-push main, OLLAMA 0.0.0.0, and unbounded BigQuery SELECT *', () => {
  assert.equal(
    evaluateToolCall({ toolCall: { name: 'run_command', args: { CommandLine: 'git commit --no-verify -m "x"' } } }).decision,
    'deny'
  );
  assert.equal(
    evaluateToolCall({ toolCall: { name: 'run_command', args: { CommandLine: 'git push origin main --force' } } }).decision,
    'deny'
  );
  assert.equal(
    evaluateToolCall({ toolCall: { name: 'run_command', args: { CommandLine: 'OLLAMA_HOST=0.0.0.0 ollama serve' } } }).decision,
    'deny'
  );
  assert.equal(
    evaluateToolCall({
      toolCall: {
        name: 'call_mcp_tool',
        args: { ServerName: 'bigquery', ToolName: 'execute_sql', Arguments: { sql: 'SELECT * FROM dataset.table' } }
      }
    }).decision,
    'deny'
  );
  assert.equal(
    evaluateToolCall({
      toolCall: {
        name: 'call_mcp_tool',
        args: { ServerName: 'bigquery', ToolName: 'execute_sql', Arguments: { sql: 'SELECT id FROM dataset.table LIMIT 10' } }
      }
    }).decision,
    'allow'
  );
});

test('PreToolUse guards write_file/edit_file against Math.random, unsafe-inline script-src, and banned font dirs', () => {
  assert.equal(
    evaluateToolCall({
      toolCall: {
        name: 'write_file',
        args: { Path: 'c:/repo/src/services/token.service.ts', Content: 'export const n = () => Math.random();' }
      }
    }).decision,
    'deny'
  );
  assert.equal(
    evaluateToolCall({
      toolCall: {
        name: 'write_file',
        args: { Path: 'c:/repo/src/services/token.service.spec.ts', Content: 'expect(Math.random()).toBeGreaterThanOrEqual(0);' }
      }
    }).decision,
    'allow'
  );
  assert.equal(
    evaluateToolCall({
      toolCall: {
        name: 'edit_file',
        args: { Path: 'c:/repo/src/server.ts', Replacement: `styleSrc = "style-src 'self' 'unsafe-inline'"` }
      }
    }).decision,
    'allow'
  );
  assert.equal(
    evaluateToolCall({
      toolCall: {
        name: 'edit_file',
        args: { Path: 'c:/repo/src/server.ts', Replacement: `scriptSrc = isProd ? "script-src 'self' 'unsafe-inline'" : "script-src 'self'"` }
      }
    }).decision,
    'deny'
  );
  assert.equal(
    evaluateToolCall({
      toolCall: {
        name: 'write_file',
        args: { Path: 'c:/repo/src/styles.css', Content: '@font-face { src: url("C:/Users/philg/Pocketgull/pg2/pocketgull/font.ttf"); }' }
      }
    }).decision,
    'deny'
  );
});

test('auditRepository detects synthetic violations and passes clean pocketgull & pocketgull-com repos', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pg-audit-'));
  try {
    fs.mkdirSync(path.join(tmpDir, 'src', 'services'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'src', 'services', 'auth-token.ts'), 'export const bad = () => Math.random();\n');
    const badResult = auditRepository(tmpDir);
    assert.ok(badResult.violations.some(v => v.includes('Math.random()')));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const pgResult = auditRepository('c:/Users/philg/Pocketgull/pocketgull');
  assert.equal(pgResult.violations.length, 0, `Expected 0 violations in pocketgull, got: ${pgResult.violations.join('; ')}`);

  const comResult = auditRepository('c:/Users/philg/Pocketgull/pocketgull-com');
  assert.equal(comResult.violations.length, 0, `Expected 0 violations in pocketgull-com, got: ${comResult.violations.join('; ')}`);
});

test('PreToolUse enforces Adobe Insiders PRA isolation, NDA staging blocks, and public egress confirmation', () => {
  // Block Adobe bridge when a Prerelease/Beta Adobe process is active
  assert.equal(
    evaluateToolCall(
      {
        toolCall: {
          name: 'call_mcp_tool',
          args: { ServerName: 'adobe-desktop-bridge', ToolName: 'dispatch_brand_to_adobe', Arguments: { targetApp: 'illustrator' } }
        }
      },
      { detectAdobePrerelease: () => 'C:\\Program Files\\Adobe\\Adobe Illustrator (Prerelease)\\Support Files\\Contents\\Windows\\Illustrator.exe' }
    ).decision,
    'deny'
  );

  // Allow Adobe bridge when only production Adobe is running
  assert.equal(
    evaluateToolCall(
      {
        toolCall: {
          name: 'call_mcp_tool',
          args: { ServerName: 'adobe-desktop-bridge', ToolName: 'dispatch_brand_to_adobe', Arguments: { targetApp: 'illustrator' } }
        }
      },
      { detectAdobePrerelease: () => null }
    ).decision,
    'allow'
  );

  // Block writing Prerelease/Beta binary paths into commercial source files
  assert.equal(
    evaluateToolCall({
      toolCall: {
        name: 'write_file',
        args: {
          Path: 'c:/repo/src/adobe.ts',
          Content: 'const exe = "C:/Program Files/Adobe/Adobe InDesign 2027 (Beta)/InDesign.exe";'
        }
      }
    }).decision,
    'deny'
  );

  // Block staging signed NDA/CIIA/PRA PDFs into git
  assert.equal(
    evaluateToolCall({
      toolCall: {
        name: 'run_command',
        args: { CommandLine: 'git add "Confidentiality Agreement.pdf"' }
      }
    }).decision,
    'deny'
  );

  // Require confirmation before making a repo public or publishing to DEV/Kaggle
  assert.equal(
    evaluateToolCall({
      toolCall: {
        name: 'run_command',
        args: { CommandLine: 'gh repo edit philgear/pocketgull --visibility public' }
      }
    }).decision,
    'force_ask'
  );
  assert.equal(
    evaluateToolCall({
      toolCall: {
        name: 'call_mcp_tool',
        args: { ServerName: 'github-mcp-server', ToolName: 'create_repository', Arguments: { name: 'demo', private: false } }
      }
    }).decision,
    'force_ask'
  );
  assert.equal(
    evaluateToolCall({
      toolCall: {
        name: 'call_mcp_tool',
        args: { ServerName: 'github-mcp-server', ToolName: 'create_repository', Arguments: { name: 'demo', private: true } }
      }
    }).decision,
    'allow'
  );
  assert.equal(
    evaluateToolCall({
      toolCall: {
        name: 'call_mcp_tool',
        args: { ServerName: 'devrelay', ToolName: 'create_article', Arguments: { title: 'Post', published: true } }
      }
    }).decision,
    'force_ask'
  );

  // Hard-block any remote add or push on local-only flex-shift-guard
  assert.equal(
    evaluateToolCall({
      cwd: 'C:\\Users\\philg\\.gemini\\antigravity\\scratch\\flex-shift-guard',
      toolCall: { name: 'run_command', args: { CommandLine: 'git push origin main' } }
    }).decision,
    'deny'
  );
  assert.equal(
    evaluateToolCall({
      toolCall: {
        name: 'call_mcp_tool',
        args: { ServerName: 'github-mcp-server', ToolName: 'create_repository', Arguments: { name: 'flex-shift-guard', private: true } }
      }
    }).decision,
    'deny'
  );
});
