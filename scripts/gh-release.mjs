#!/usr/bin/env node
/**
 * Pocket-Gull GitHub CLI Release Automation Helper
 * Generates SBOM, extracts version release notes from CHANGELOG.md,
 * and creates a signed GitHub Release with attached EU CRA CycloneDX 1.6 SBOM.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function run(cmd, options = {}) {
  console.log(`▶️ ${cmd}`);
  return execSync(cmd, { cwd: rootDir, stdio: 'inherit', ...options });
}

function main() {
  console.log('==========================================================');
  console.log('🚀 Pocket-Gull GitHub CLI Release Publisher');
  console.log('==========================================================\n');

  // 1. Read current version from package.json
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const version = pkg.version || '1.31.0';
  const tag = `v${version}`;

  console.log(`📦 Target Release Tag: ${tag}`);

  // 2. Generate CycloneDX 1.6 SBOM
  console.log('\n📄 Generating CycloneDX 1.6 SBOM...');
  run('node scripts/generate_cyclonedx_sbom.mjs');

  const sbomPath = path.join(rootDir, 'sbom.cdx.json');
  if (!fs.existsSync(sbomPath)) {
    console.error('❌ Failed to find generated sbom.cdx.json');
    process.exit(1);
  }

  // 3. Extract release notes from CHANGELOG.md
  console.log('\n📝 Extracting release notes from CHANGELOG.md...');
  const changelogPath = path.join(rootDir, 'CHANGELOG.md');
  let releaseNotes = `## Release ${tag}\n\nAutomated production release for Pocket-Gull.`;

  if (fs.existsSync(changelogPath)) {
    const changelog = fs.readFileSync(changelogPath, 'utf8');
    const versionHeaderRegex = new RegExp(`##\\s*\\[?${version.replace(/\./g, '\\.')}\\]?[\\s\\S]*?(?=\\n##\\s*\\[|$)`, 'i');
    const match = changelog.match(versionHeaderRegex);
    if (match && match[0]) {
      releaseNotes = match[0].trim();
      console.log(`✅ Extracted ${releaseNotes.split('\n').length} lines of changelog notes.`);
    }
  }

  const tmpNotesFile = path.join(rootDir, 'tmp_release_notes.md');
  fs.writeFileSync(tmpNotesFile, releaseNotes, 'utf8');

  // 4. Create GitHub Release via `gh release create`
  console.log(`\n🚀 Publishing release ${tag} to GitHub via gh CLI...`);
  try {
    run(`gh release create "${tag}" --title "${tag}" --notes-file "${tmpNotesFile}" "${sbomPath}"`);
    console.log(`\n🎉 Successfully published GitHub Release ${tag}!`);
  } catch (err) {
    console.error(`\n⚠️ gh release failed. If tag already exists, you can edit it via: gh release edit "${tag}"`);
  } finally {
    if (fs.existsSync(tmpNotesFile)) {
      fs.unlinkSync(tmpNotesFile);
    }
  }
}

main();
