// SPDX-License-Identifier: Apache-2.0
/**
 * FACTS Documentation Grounding & Zero-Drift Verifier (`npm run docs:audit`)
 *
 * Enforces the Google FACTS Search Grounding invariant across `docs/`:
 *   1. Every `file:///` citation link in active `docs/` must resolve to an existing file on disk.
 *   2. Deprecated rendering/model identifiers (`Gemini 1.5`, un-negated `Three.js`) are blocked.
 *   3. Mandatory v1.41.2 grounding anchors (`GullRenderEngine`, `pocketgull-clinical`,
 *      `DirectCurves`, `WHO ICD-11`, `IEEE P2933`, `Hybrid RRF`) must remain present.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

// Historical archive records referencing pre-extraction portal files
const ARCHIVE_PREFIXES = [
  'docs/internal/',
  'docs/cocomo_breakdown.md',
  'docs/compliance/AUDIT_REPORT.md',
  'docs/digital-hippocratic-oath.md',
  'docs/EVALUATION_SUSTAINABILITY_AND_PERFORMANCE.md',
  'docs/retroactive-prs/',
  'docs/legal/',
  'docs/rfc/',
  'docs/MISSION_STATEMENT_AND_PURPOSE.md',
  'docs/VA_COMMUNITY_CARE_INTEGRATION_GUIDE.md',
];

function collectMarkdownFiles(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectMarkdownFiles(fullPath, list);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      list.push(fullPath);
    }
  }
  return list;
}

function verifyDocsGrounding() {
  const strictArchives = process.argv.includes('--strict-archives');
  const mdFiles = collectMarkdownFiles(DOCS_DIR);
  const errors = [];
  let verifiedFileLinks = 0;

  const fileUrlRegex = /\(file:\/\/\/([^)#\s]+)(?:#L\d+(?:-L\d+)?)?\)/gi;

  for (const mdFile of mdFiles) {
    const relPath = path.relative(ROOT_DIR, mdFile).replace(/\\/g, '/');
    const isHistoricalArchive =
      !strictArchives && ARCHIVE_PREFIXES.some((prefix) => relPath.startsWith(prefix));
    if (isHistoricalArchive) continue;

    const content = fs.readFileSync(mdFile, 'utf8');

    let match;
    while ((match = fileUrlRegex.exec(content)) !== null) {
      const rawUriPath = decodeURIComponent(match[1]);
      const normalized = rawUriPath.replace(/\//g, path.sep);
      let candidatePath = normalized;

      const repoMarker = `Pocketgull${path.sep}pocketgull${path.sep}`;
      const idx = normalized.toLowerCase().indexOf(repoMarker.toLowerCase());
      if (idx !== -1) {
        const subPath = normalized.slice(idx + repoMarker.length);
        candidatePath = path.join(ROOT_DIR, subPath);
      }

      if (!fs.existsSync(candidatePath)) {
        errors.push(`[BROKEN_CITATION] ${relPath} references missing file: ${rawUriPath}`);
      } else {
        verifiedFileLinks++;
      }
    }
  }

  // Check mandatory grounding anchors & banned legacy references
  const anchorChecks = [
    {
      file: 'docs/ARCHITECTURE_ATLAS.md',
      mustInclude: ['GullRenderEngine', 'Hybrid RRF', 'v1.41.2'],
      mustExclude: [/Gemini 1\.5/i],
    },
    {
      file: 'docs/FEATURES.md',
      mustInclude: ['GullRenderEngine', 'pocketgull-clinical', 'pocketgull-edge', 'IEEE P2933'],
      mustExclude: [/Three\.js interactive/i, /Three\.js geometry/i, /WebGL Three\.js/i],
    },
    {
      file: 'docs/GEMMA4_EDGE_ARCHITECTURE.md',
      mustInclude: ['pocketgull-clinical', 'Hybrid RRF', 'Gemini 2.5 Pro / Flash'],
      mustExclude: [/Gemini 1\.5/i],
    },
    {
      file: 'docs/design/DESIGN.md',
      mustInclude: ['DirectCurves', 'PocketGull-Chiseltip', 'PocketGullMono-Regular', 'font.pocketgull.app'],
      mustExclude: [],
    },
    {
      file: 'docs/EPISTEMIC_FALSIFICATION_SUITE.md',
      mustInclude: ['NSF Open Knowledge Network', 'WHO ICD-11', 'IEEE P2933'],
      mustExclude: [],
    },
    {
      file: 'docs/TRI_PARADIGM_SYNTHESIS_INTEGRATION.md',
      mustInclude: ['GullRenderEngine', 'WHO ICD-11 ICTM TM1', 'NSF Open Knowledge Network'],
      mustExclude: [],
    },
    {
      file: 'docs/SIGGRAPH_WEBGPU_BIOPHYSICAL_RENDERING.md',
      mustInclude: ['GullRenderEngine', 'src/components/anatomy-3d/body-3d-viewer.component.ts'],
      mustExclude: [/Three\.js MeshPhysicalMaterial/i],
    },
  ];

  for (const check of anchorChecks) {
    const abs = path.join(ROOT_DIR, check.file);
    if (!fs.existsSync(abs)) {
      errors.push(`[MISSING_DOC] Required documentation file not found: ${check.file}`);
      continue;
    }
    const text = fs.readFileSync(abs, 'utf8');
    for (const token of check.mustInclude) {
      if (!text.includes(token)) {
        errors.push(`[MISSING_ANCHOR] ${check.file} is missing required grounding anchor: "${token}"`);
      }
    }
    for (const bannedRegex of check.mustExclude) {
      if (bannedRegex.test(text)) {
        errors.push(`[DRIFT_DETECTED] ${check.file} contains deprecated pattern: ${bannedRegex}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error('[FAIL] FACTS Documentation Grounding Audit failed:');
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  console.log(
    `[OK] FACTS Documentation Grounding Audit passed: ${mdFiles.length} docs scanned, ${verifiedFileLinks} file:/// citations verified, 0 drift errors.`
  );
}

verifyDocsGrounding();
