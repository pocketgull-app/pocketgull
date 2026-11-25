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
