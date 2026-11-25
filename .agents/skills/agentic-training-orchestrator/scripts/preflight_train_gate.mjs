// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear
/**
 * Preflight Safety Gate & Compact Log Summarizer for Agentic Machine Training.
 *
 * Usage:
 *   node .agents/skills/agentic-training-orchestrator/scripts/preflight_train_gate.mjs --dataset <path.jsonl>
 *   node .agents/skills/agentic-training-orchestrator/scripts/preflight_train_gate.mjs --log <path.log>
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const PHI_PATTERNS = [
  { label: 'US_SSN', regex: /\b\d{3}-\d{2}-\d{4}\b/ },
  { label: 'EMAIL', regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i },
  { label: 'PHONE', regex: /(?:\+?1[-.\s]?)?\(\d{3}\)[-.\s]?\d{3}[-.\s]?\d{4}\b/ },
  { label: 'MRN_TAG', regex: /\bMRN\s*[:#]\s*[A-Z0-9-]{5,}\b/i },
];

const LOG_EVENT_RE =
  /(?:fold|epoch|validation|oof|eval_loss|loss[:=]|macro-auc|saved|nan|inf\b|outofmemory|out of memory|cuda error)/i;

const LOG_FATAL_RE = /(?:outofmemory|out of memory|cuda error|\bnan\b)/i;

export function auditJsonlDataset(rawText, options = {}) {
  const maxCharsWarn = Number(options.maxCharsWarn ?? 4096);
  const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const errors = [];
  const warnings = [];
  let maxChars = 0;

  if (lines.length === 0) {
    errors.push('Dataset file is empty (0 JSONL records).');
  }

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    let parsed;
    try {
      parsed = JSON.parse(line);
    } catch (err) {
      errors.push(`Line ${lineNum}: invalid JSON (${err.message})`);
      return;
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      errors.push(`Line ${lineNum}: expected JSON object record.`);
    }

    maxChars = Math.max(maxChars, line.length);
    for (const rule of PHI_PATTERNS) {
      if (rule.regex.test(line)) {
        errors.push(`Line ${lineNum}: potential HIPAA identifier matched (${rule.label}).`);
      }
    }
  });

  if (maxChars > maxCharsWarn) {
    warnings.push(`Max record length ${maxChars} chars exceeds ${maxCharsWarn}; verify --max_seq_length 1024 truncation.`);
  }

  return {
    ok: errors.length === 0,
    recordCount: lines.length,
    maxChars,
    warnings,
    errors,
  };
}

export function summarizeTrainingLog(rawText, maxLines = 40) {
  const lines = rawText.split(/\r?\n/);
  const matched = [];
  const fatals = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (LOG_FATAL_RE.test(trimmed)) {
      fatals.push(trimmed);
    }
    if (LOG_EVENT_RE.test(trimmed)) {
      matched.push(trimmed);
    }
  }

  return {
    ok: fatals.length === 0,
    totalLines: lines.length,
    eventCount: matched.length,
    fatals,
    tailEvents: matched.slice(-maxLines),
  };
}

function parseCliArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (key === '--dataset' && argv[i + 1]) {
      out.dataset = argv[++i];
    } else if (key === '--log' && argv[i + 1]) {
      out.log = argv[++i];
    }
  }
  return out;
}

function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (!args.dataset && !args.log) {
    console.error('Usage: preflight_train_gate.mjs [--dataset <path.jsonl>] [--log <path.log>]');
    process.exit(1);
  }

  let overallOk = true;
  const report = {};

  if (args.dataset) {
    const absPath = path.resolve(args.dataset);
    if (!fs.existsSync(absPath)) {
      console.error(`[ERROR] Dataset not found: ${absPath}`);
      process.exit(1);
    }
    const res = auditJsonlDataset(fs.readFileSync(absPath, 'utf8'));
    report.dataset = { path: args.dataset, ...res };
    if (!res.ok) overallOk = false;
  }

  if (args.log) {
    const absPath = path.resolve(args.log);
    if (!fs.existsSync(absPath)) {
      console.error(`[ERROR] Log not found: ${absPath}`);
      process.exit(1);
    }
    const res = summarizeTrainingLog(fs.readFileSync(absPath, 'utf8'));
    report.log = { path: args.log, ...res };
    if (!res.ok) overallOk = false;
  }

  console.log(JSON.stringify(report, null, 2));
  process.exit(overallOk ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
