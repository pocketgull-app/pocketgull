#!/usr/bin/env node
/**
 * @file package_browser_extensions.mjs
 * @description Packages all 26 PocketGull browser themes into:
 * 1. .crx packages for Google Chrome / Chromium / Edge / Brave
 * 2. .xpi packages for Mozilla Firefox
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const THEME_ROOT = path.resolve(__dirname, '..');

const chromeBaseDir = path.join(THEME_ROOT, 'browser', 'chrome');
const firefoxBaseDir = path.join(THEME_ROOT, 'browser', 'firefox');

const chromeDistDir = path.join(chromeBaseDir, 'dist');
const firefoxDistDir = path.join(firefoxBaseDir, 'dist');

fs.mkdirSync(chromeDistDir, { recursive: true });
fs.mkdirSync(firefoxDistDir, { recursive: true });

// Locate chrome.exe or msedge.exe
const chromeCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Users\\philg\\AppData\\Local\\Google\\Chrome SxS\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];
const chromePath = chromeCandidates.find(p => fs.existsSync(p));

console.log('📦 Starting Packaging for PocketGull Browser Extensions...');

// 1. Firefox Packaging (.xpi)
console.log('\n🦊 Packaging Mozilla Firefox WebExtensions (.xpi)...');
const firefoxDirs = fs.readdirSync(firefoxBaseDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'dist');

let ffCount = 0;
for (const dir of firefoxDirs) {
  const dirPath = path.join(firefoxBaseDir, dir.name);
  const manifestPath = path.join(dirPath, 'manifest.json');
  if (!fs.existsSync(manifestPath)) continue;

  const zip = new AdmZip();
  zip.addLocalFolder(dirPath);
  const outPath = path.join(firefoxDistDir, `${dir.name}.xpi`);
  zip.writeZip(outPath);
  ffCount++;
}
console.log(`   ✓ Packaged ${ffCount} Firefox .xpi extensions in ${firefoxDistDir}`);

// 2. Chrome Packaging (.crx)
if (chromePath) {
  console.log(`\n🌐 Packaging Google Chrome / Edge Extensions (.crx) using ${path.basename(chromePath)}...`);
  const chromeDirs = fs.readdirSync(chromeBaseDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== 'dist');

  let crxCount = 0;
  for (const dir of chromeDirs) {
    const dirPath = path.join(chromeBaseDir, dir.name);
    const manifestPath = path.join(dirPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) continue;

    const crxDest = path.join(chromeDistDir, `${dir.name}.crx`);
    const pemDest = path.join(chromeDistDir, `${dir.name}.pem`);

    const generatedCrx = `${dirPath}.crx`;
    const generatedPem = `${dirPath}.pem`;

    if (fs.existsSync(generatedCrx)) fs.unlinkSync(generatedCrx);
    if (fs.existsSync(generatedPem) && !fs.existsSync(pemDest)) {
      fs.renameSync(generatedPem, pemDest);
    }

    const args = [`--pack-extension=${dirPath}`];
    if (fs.existsSync(pemDest)) {
      args.push(`--pack-extension-key=${pemDest}`);
    }

    try {
      execFileSync(chromePath, args, { stdio: 'ignore' });
      // Chrome writes <dirPath>.crx and <dirPath>.pem next to dirPath
      const generatedCrx = `${dirPath}.crx`;
      const generatedPem = `${dirPath}.pem`;

      if (fs.existsSync(generatedCrx)) {
        fs.renameSync(generatedCrx, crxDest);
      }
      if (fs.existsSync(generatedPem)) {
        fs.renameSync(generatedPem, pemDest);
      }
      crxCount++;
    } catch (e) {
      console.warn(`   ⚠ Failed to pack ${dir.name}: ${e.message}`);
    }
  }
  console.log(`   ✓ Packaged ${crxCount} Chrome .crx extensions in ${chromeDistDir}`);
} else {
  console.warn('   ⚠ No Chromium binary found to pack .crx extensions.');
}

console.log('\n🎉 Extension packaging complete!\n');
