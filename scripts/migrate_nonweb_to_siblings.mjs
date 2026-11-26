#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * Pocket-Gull Monorepo De-Layer-Caking Manifest & Safe Sibling Extraction Tool
 *
 * Defaults strictly to `--dry-run` (read-only audit). Enumerates non-web research,
 * contest, personal hardware, dataset, and unrelated brand sub-trees and maps each
 * to its target sibling repository under C:\Users\philg\Pocketgull\ so the web app
 * repository can be cleanly pruned with explicit architect approval.
 *
 * Usage:
 *   node scripts/migrate_nonweb_to_siblings.mjs                       # dry-run all categories
 *   node scripts/migrate_nonweb_to_siblings.mjs --execute --category=contests
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PARENT = path.resolve(ROOT, '..');

const args = process.argv.slice(2);
const EXECUTE = args.includes('--execute');
const categoryArg = args.find((a) => a.startsWith('--category='));
const SELECTED_CATEGORIES = categoryArg
  ? new Set(categoryArg.slice('--category='.length).split(',').map((s) => s.trim()).filter(Boolean))
  : null;

function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function walkStats(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return { exists: false, files: 0, bytes: 0 };
  const st = fs.statSync(full);
  if (!st.isDirectory()) return { exists: true, files: 1, bytes: st.size };
  let files = 0;
  let bytes = 0;
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        walk(p);
      } else {
        files++;
        bytes += fs.statSync(p).size;
      }
    }
  }
  walk(full);
  return { exists: true, files, bytes };
}

function assertContained(candidatePath, baseDir) {
  const resolved = path.resolve(candidatePath);
  const resolvedBase = path.resolve(baseDir);
  if (resolved !== resolvedBase && !resolved.startsWith(resolvedBase + path.sep)) {
    throw new Error(`Path traversal refused: ${resolved} is outside ${resolvedBase}`);
  }
  return resolved;
}

function moveFileSafe(srcFile, dstFile, stats) {
  fs.mkdirSync(path.dirname(dstFile), { recursive: true });
  if (fs.existsSync(dstFile)) {
    const srcHash = sha256File(srcFile);
    const dstHash = sha256File(dstFile);
    if (srcHash === dstHash) {
      fs.unlinkSync(srcFile);
      stats.deduplicated++;
      return;
    }
    const srcStat = fs.statSync(srcFile);
    const dstStat = fs.statSync(dstFile);
    if (srcStat.mtimeMs > dstStat.mtimeMs) {
      fs.copyFileSync(srcFile, dstFile);
      if (sha256File(dstFile) !== srcHash) {
        throw new Error(`SHA-256 verification failed after copying ${srcFile} -> ${dstFile}`);
      }
      fs.unlinkSync(srcFile);
      stats.updatedNewer++;
      return;
    }
    const parsed = path.parse(dstFile);
    const preserved = path.join(parsed.dir, `${parsed.name}.from-pocketgull${parsed.ext}`);
    fs.copyFileSync(srcFile, preserved);
    if (sha256File(preserved) !== srcHash) {
      throw new Error(`SHA-256 verification failed after preserving ${srcFile} -> ${preserved}`);
    }
    fs.unlinkSync(srcFile);
    stats.preservedConflict++;
    return;
  }

  try {
    fs.renameSync(srcFile, dstFile);
  } catch (err) {
    if (err && err.code === 'EXDEV') {
      const srcHash = sha256File(srcFile);
      fs.copyFileSync(srcFile, dstFile);
      if (sha256File(dstFile) !== srcHash) {
        throw new Error(`SHA-256 verification failed after EXDEV copy ${srcFile} -> ${dstFile}`);
      }
      fs.unlinkSync(srcFile);
    } else {
      throw err;
    }
  }
  stats.moved++;
}

function mergeMovePath(srcPath, dstPath, stats) {
  const st = fs.statSync(srcPath);
  if (!st.isDirectory()) {
    moveFileSafe(srcPath, dstPath, stats);
    return;
  }

  if (!fs.existsSync(dstPath)) {
    fs.mkdirSync(path.dirname(dstPath), { recursive: true });
    try {
      fs.renameSync(srcPath, dstPath);
      stats.movedDirs++;
      return;
    } catch (err) {
      if (!err || err.code !== 'EXDEV') throw err;
    }
  }

  fs.mkdirSync(dstPath, { recursive: true });
  for (const entry of fs.readdirSync(srcPath, { withFileTypes: true })) {
    const childSrc = path.join(srcPath, entry.name);
    const childDst = path.join(dstPath, entry.name);
    if (entry.isDirectory()) {
      mergeMovePath(childSrc, childDst, stats);
    } else {
      moveFileSafe(childSrc, childDst, stats);
    }
  }
  // Remove emptied source directory
  if (fs.readdirSync(srcPath).length === 0) {
    fs.rmdirSync(srcPath);
  }
}

const EXTRACTION_PLAN = [
  {
    id: 'contests',
    category: 'Kaggle Contests & Competition Pipelines',
    targetSibling: 'pocketgull-submissions',
    paths: ['contests']
  },
  {
    id: 'arxiv',
    category: 'ArXiv & Academic Paper Bundles',
    targetSibling: 'pocketgull-submissions',
    notes: 'Used by scripts/package_arxiv_bundle.mjs; migrate together once preprint is finalized.',
    paths: ['arxiv', 'arxiv_submission_PG_CONF_2026.tar.gz', 'pocketgull_physionet_2026_challenge_entry.ipynb']
  },
  {
    id: 'datasets',
    category: 'Training JSONL Datasets in scripts/',
    targetSibling: 'pocketgull-submissions',
    notes: 'Referenced by pocketgull_api/train_gemma_lora.py and scripts/dart/* tuning scripts.',
    paths: fs.existsSync(path.join(ROOT, 'scripts'))
      ? fs.readdirSync(path.join(ROOT, 'scripts')).filter((f) => f.endsWith('.jsonl')).map((f) => `scripts/${f}`)
      : []
  },
  {
    id: 'workstation',
    category: 'Personal Workstation / Hue / Razer / Taskbar Scripts',
    targetSibling: 'scripts',
    notes: 'Live Windows Startup shortcuts (Assistive Tray & Circadian Sync) must be re-pointed if moved.',
    paths: fs.existsSync(path.join(ROOT, 'scripts'))
      ? fs.readdirSync(path.join(ROOT, 'scripts'))
          .filter((f) => /^(check_razer|test_razer|pair_hue|sync_hue|apply_scotopic_wallpaper|generate_pocketgull_cursors|install_pocketgull_earcons|play_completion_chime|sit_stand_pacer|reflect_day|pocketgull_tray|rsna_taskbar|create_taskbar_shortcut|register_startup|sanitize_clipboard|start_sanctuary_drone|sync_peripherals|schedule_circadian_themes|start_taskbar)/i.test(f))
          .map((f) => `scripts/${f}`)
      : []
  },
  {
    id: 'clan-brands',
    category: 'Non-Clinical Personal Clan Brand Systems',
    targetSibling: 'clan-brand-systems',
    paths: ['companion-apps/clan_logan_brand_system', 'companion-apps/clan_ross_brand_system']
  }
];

const modeBanner = EXECUTE ? 'EXECUTE MODE' : 'DRY-RUN';
console.log('=========================================================================');
console.log(`🧹 POCKET-GULL DE-LAYER-CAKING EXTRACTION MANIFEST (${modeBanner})`);
console.log('=========================================================================\n');

let totalFiles = 0;
let totalBytes = 0;

for (const group of EXTRACTION_PLAN) {
  if (SELECTED_CATEGORIES && !SELECTED_CATEGORIES.has(group.id)) continue;

  let gFiles = 0;
  let gBytes = 0;
  const activePaths = [];
  for (const rel of group.paths) {
    const s = walkStats(rel);
    if (s.exists) {
      gFiles += s.files;
      gBytes += s.bytes;
      activePaths.push(rel);
    }
  }
  totalFiles += gFiles;
  totalBytes += gBytes;

  const siblingRoot = assertContained(path.join(PARENT, group.targetSibling), PARENT);
  const siblingExists = fs.existsSync(siblingRoot);

  console.log(`📦 [${group.id}] ${group.category}`);
  console.log(`   Target Sibling: ../${group.targetSibling} (${siblingExists ? 'EXISTS' : 'CREATE NEW'})`);
  console.log(`   Items: ${activePaths.length} | Files: ${gFiles} | Size: ${(gBytes / (1024 * 1024)).toFixed(2)} MB`);
  if (group.notes) {
    console.log(`   Note: ${group.notes}`);
  }
  if (activePaths.length > 0) {
    console.log(`   Sample: ${activePaths.slice(0, 5).join(', ')}${activePaths.length > 5 ? ` (+${activePaths.length - 5} more)` : ''}`);
  }

  if (EXECUTE && activePaths.length > 0) {
    fs.mkdirSync(siblingRoot, { recursive: true });
    const stats = { moved: 0, movedDirs: 0, deduplicated: 0, updatedNewer: 0, preservedConflict: 0 };
    for (const rel of activePaths) {
      const srcPath = assertContained(path.join(ROOT, rel), ROOT);
      const dstPath = assertContained(path.join(siblingRoot, rel), siblingRoot);
      mergeMovePath(srcPath, dstPath, stats);
    }
    console.log(
      `   ✅ Executed: movedFiles=${stats.moved}, movedDirs=${stats.movedDirs}, updatedNewer=${stats.updatedNewer}, deduplicated=${stats.deduplicated}, preservedConflicts=${stats.preservedConflict}`
    );
  }
  console.log('');
}

console.log('=========================================================================');
if (EXECUTE) {
  console.log(`✅ Extraction complete: ${totalFiles} files (${(totalBytes / (1024 * 1024)).toFixed(2)} MB) migrated safely.`);
} else {
  console.log(`📊 Total Reclaimable Non-Web Footprint: ${totalFiles} files (${(totalBytes / (1024 * 1024)).toFixed(2)} MB)`);
  console.log('ℹ️  Read-only dry-run complete. Re-run with --execute --category=<id> to migrate.');
}
console.log('=========================================================================\n');
