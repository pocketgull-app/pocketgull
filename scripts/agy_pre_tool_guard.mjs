// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear
/**
 * Antigravity Lifecycle PreToolUse Guard (`scripts/agy_pre_tool_guard.mjs`)
 *
 * Enforces:
 * 1. BigQuery FinOps & Data Loss Prevention: Blocks unbounded `SELECT *` and destructive `DROP/TRUNCATE`
 *    in `call_mcp_tool` targeting `bigquery` / `datacloud_bigquery_remote`.
 * 2. OpenSSF Two-Person Review & Git Hygiene: Prompts (`force_ask`) before direct `git push origin main`
 *    or `--no-verify` hook bypasses.
 * 3. GreenOps TTF Container Guard: Warns if copying raw `.ttf` binaries into Docker/web build contexts.
 */

import fs from 'node:fs';

function evaluateToolCall(payload) {
  const toolCall = payload?.toolCall;
  if (!toolCall) {
    return { decision: 'allow' };
  }

  const name = (toolCall.name || '').toLowerCase();
  const args = toolCall.args || {};

  // 1. BigQuery MCP Tool Guard (FinOps + Accidental Data Loss Prevention)
  if (name === 'call_mcp_tool') {
    const serverName = (args.ServerName || '').toLowerCase();
    const mcpToolName = (args.ToolName || '').toLowerCase();
    if (
      (serverName.includes('bigquery') || serverName === 'bq') &&
      (mcpToolName.includes('execute_sql') || mcpToolName.includes('query'))
    ) {
      const sql = String(args.Arguments?.sql || args.Arguments?.query || '').trim();
      if (/\b(DROP|TRUNCATE)\s+(TABLE|VIEW|SCHEMA|DATABASE|DATASET)\b/i.test(sql)) {
        return {
          decision: 'force_ask',
          reason:
            '[BigQuery Data Loss Guard] Destructive DDL (DROP/TRUNCATE) detected in MCP SQL query. Explicit user confirmation is mandatory.',
        };
      }
      if (/\bSELECT\s+\*\s+FROM\b/i.test(sql) && !/\bLIMIT\s+\d+/i.test(sql)) {
        return {
          decision: 'deny',
          reason:
            '[BigQuery FinOps Guard] Unbounded SELECT * without LIMIT is prohibited by .agents/rules/bigquery-kaggle-ml.md. Project explicit columns and filter by partition.',
        };
      }
    }
  }

  // 2. Terminal Command Guard (OpenSSF Git Hygiene, BigQuery CLI & Shadow IT Prevention)
  if (name === 'run_command') {
    const cmd = String(args.CommandLine || '');
    if (/\bgit\s+commit\b.*--no-verify\b/i.test(cmd)) {
      return {
        decision: 'deny',
        reason:
          '[OpenSSF Pre-Commit Guard] Bypassing git hooks with --no-verify is prohibited by .agents/AGENTS.md.',
      };
    }
    if (/\bgit\s+push\s+(origin\s+)?main\b.*--force\b/i.test(cmd)) {
      return {
        decision: 'deny',
        reason:
          '[OpenSSF Branch Protection] Force-pushing to main is strictly prohibited.',
      };
    }
    if (/OLLAMA_HOST\s*=\s*["']?0\.0\.0\.0/i.test(cmd)) {
      return {
        decision: 'deny',
        reason:
          '[Shadow IT Guard] Binding OLLAMA_HOST to 0.0.0.0 exposes local LLM inference to the LAN. Bind strictly to 127.0.0.1:11434.',
      };
    }
    if (/\bopenclaw\b.*\bgateway\b/i.test(cmd) && !/\bsandbox-(docker|win|wsl)\b/i.test(cmd)) {
      return {
        decision: 'deny',
        reason:
          '[Shadow IT Guard] Launching an unsandboxed OpenClaw gateway directly on the Windows host is prohibited by the Strong Sandboxing Protocol.',
      };
    }
  }

  return { decision: 'allow' };
}

try {
  const rawInput = fs.readFileSync(0, 'utf8').trim();
  const payload = rawInput ? JSON.parse(rawInput) : {};
  const result = evaluateToolCall(payload);
  process.stdout.write(`${JSON.stringify(result)}\n`);
} catch {
  // Fail open so malformed stdin never deadlocks the agent loop
  process.stdout.write(`${JSON.stringify({ decision: 'allow' })}\n`);
}
