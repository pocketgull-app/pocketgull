// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear
/**
 * Antigravity Lifecycle PreToolUse Guard (`scripts/agy_pre_tool_guard.mjs`)
 *
 * Enforces:
 * 1. BigQuery FinOps & Data Loss Prevention: Blocks unbounded `SELECT *` and destructive `DROP/TRUNCATE`
 *    in `call_mcp_tool` targeting `bigquery` / `datacloud_bigquery_remote` and `bq query` CLI calls.
 * 2. OpenSSF Two-Person Review & Git Hygiene: Blocks `--no-verify` hook bypasses and force-pushes to `main`.
 * 3. Machine Training Safety & Privacy Gates: Requires `--low_mem` (or `--dry_run`) before QLoRA launches on 8 GB GPUs
 *    and prompts before dataset/model pushes to Kaggle or Hugging Face.
 * 4. Pre-Write Code Invariants (`write_file` / `edit_file`): Blocks embedded private keys, banned v1/v2 legacy
 *    foundry font directories, production `script-src` `'unsafe-inline'`/`'unsafe-eval'`, and `Math.random()` in runtime
 *    `src/(services|server|utils|guards)` code.
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  BANNED_FOUNDRY_PATH_RE,
  PRIVATE_KEY_RE,
  hasProdUnsafeScriptCsp,
  hasUncommentedMathRandom
} from './higher_order_rules.mjs';

const DOC_OR_TEST_PATH_RE = /(?:^|[\\/])(?:\.?agents|scripts|\.gemini|docs|scratch)[\\/]|\.(?:spec|test)\.[^.]+$|\.(?:md|txt|csv|svg)$/i;
const SERVER_OR_CSP_FILE_RE = /(?:^|[\\/])(?:server\.(?:ts|js|mjs|cjs)|(?:firebase|vercel)\.json|netlify\.toml)$/i;
const RUNTIME_CORE_CODE_RE = /(?:^|[\\/])src[\\/](?:services|server|utils|guards)[\\/].*\.(?:ts|js|mjs|cjs)$/i;

function evaluateWriteOrEdit(args) {
  const targetPath = String(args.Path || args.path || '');
  const content = String(args.Content ?? args.Replacement ?? '');
  if (!targetPath || !content) {
    return { decision: 'allow' };
  }

  if (PRIVATE_KEY_RE.test(content) && !/(?:\.gemini|scripts)[\\/]/i.test(targetPath)) {
    return {
      decision: 'deny',
      reason: '[Secret Leak Guard] Embedded PRIVATE KEY material detected before file write.'
    };
  }

  if (DOC_OR_TEST_PATH_RE.test(targetPath)) {
    return { decision: 'allow' };
  }

  if (BANNED_FOUNDRY_PATH_RE.test(content)) {
    return {
      decision: 'deny',
      reason:
        '[Typeface Provenance Guard] Deprecated v1/v2 foundry paths (pg2/pocketgull or scratch/fonts/ofl/pocketgull) are prohibited. Source v4.0+ fonts from pocketgull-typeface or CDN.'
    };
  }

  if (SERVER_OR_CSP_FILE_RE.test(targetPath) && hasProdUnsafeScriptCsp(content)) {
    return {
      decision: 'deny',
      reason:
        "[Observatory 125+ CSP Guard] Production script-src must not include 'unsafe-inline' or 'unsafe-eval'. Use per-request nonces + 'strict-dynamic' or SHA-256 hashes."
    };
  }

  if (RUNTIME_CORE_CODE_RE.test(targetPath) && hasUncommentedMathRandom(content)) {
    return {
      decision: 'deny',
      reason:
        '[NIST SP 800-90A CSPRNG Guard] Math.random() is prohibited in src/(services|server|utils|guards). Use crypto.randomBytes / crypto.getRandomValues CSPRNG.'
    };
  }

  return { decision: 'allow' };
}

export function evaluateToolCall(payload) {
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

  // 2. Pre-Write / Pre-Edit Higher-Order Guard
  if (name === 'write_file' || name === 'edit_file') {
    return evaluateWriteOrEdit(args);
  }

  // 3. Terminal Command Guard (OpenSSF Git Hygiene, BigQuery CLI & Shadow IT Prevention)
  if (name === 'run_command') {
    const cmd = String(args.CommandLine || '');
    if (/\bgit\s+commit\b.*--no-verify\b/i.test(cmd)) {
      return {
        decision: 'deny',
        reason:
          '[OpenSSF Pre-Commit Guard] Bypassing git hooks with --no-verify is prohibited by .agents/AGENTS.md.',
      };
    }
    if (
      /\bgit\s+push\b.*\b(?:main|master)\b.*(?:--force\b|-f\b)/i.test(cmd) ||
      /\bgit\s+push\b.*(?:--force\b|-f\b).*\b(?:main|master)\b/i.test(cmd)
    ) {
      return {
        decision: 'deny',
        reason:
          '[OpenSSF Branch Protection] Force-pushing to main/master is strictly prohibited.',
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
    if (/\bfinetune_gemma_lora\.py\b/i.test(cmd) && !/(--dry_run|--low_mem)\b/i.test(cmd)) {
      return {
        decision: 'deny',
        reason:
          '[Edge VRAM Guard] Include --dry_run or --low_mem when running finetune_gemma_lora.py so 8 GB RX 6650 XT memory stays within the safe 3.8 GB cap (.agents/skills/local-edge-trainer).',
      };
    }
    if (/\b(kaggle_push_dataset|kaggle_push_model|huggingface_model_hub_export)\b/i.test(cmd)) {
      return {
        decision: 'force_ask',
        reason:
          '[ML Privacy Gate] Confirm HIPAA §164.514 Safe Harbor preflight passed before pushing datasets or weights to Kaggle / Hugging Face.',
      };
    }
    if (/\bbq\s+query\b/i.test(cmd) && /\bSELECT\s+\*\s+FROM\b/i.test(cmd) && !/\bLIMIT\s+\d+/i.test(cmd)) {
      return {
        decision: 'deny',
        reason:
          '[BigQuery FinOps Guard] Unbounded SELECT * without LIMIT in `bq query` is prohibited by .agents/rules/bigquery-kaggle-ml.md.',
      };
    }
  }

  return { decision: 'allow' };
}

function runCli() {
  try {
    const rawInput = fs.readFileSync(0, 'utf8').trim();
    const payload = rawInput ? JSON.parse(rawInput) : {};
    const result = evaluateToolCall(payload);
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch {
    // Fail open so malformed stdin never deadlocks the agent loop
    process.stdout.write(`${JSON.stringify({ decision: 'allow' })}\n`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  runCli();
}
