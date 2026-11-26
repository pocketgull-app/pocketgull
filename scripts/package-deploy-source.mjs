// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Lean GreenOps allowlist: dist/ already contains compiled browser + SSR assets.
// Do NOT double-pack raw public/ or legacy server.js or local secrets (.env*, data/).
const projectItems = [
  'Dockerfile',
  'package.json',
  'package-lock.json',
  'ngsw-config.json',
  'cloudbuild.yaml',
  '.dockerignore',
  '.gcloudignore',
  'dist',
  'docs/openapi.json'
].filter(item => fs.existsSync(path.resolve(rootDir, item)));

if (!projectItems.includes('dist')) {
  console.error('❌ [GreenOps Packaging Error] Pre-compiled dist/ directory is missing. Run `npm run build` first.');
  process.exit(1);
}

console.log(`📦 Packaging lean GreenOps deployment archive from ${rootDir}:`);
console.log(projectItems.map(i => `  - ${i}`).join('\n'));

const outputPath = path.resolve(rootDir, 'deploy_source.tar.gz');
if (fs.existsSync(outputPath)) {
  fs.unlinkSync(outputPath);
}

const excludes = [
  'node_modules',
  '*/node_modules/*',
  '.venv',
  '*/.venv/*',
  '.angular',
  '*/.angular/*',
  '.env',
  '.env.*',
  '*/.env*',
  '*.pem',
  '*.key',
  '*service-account*.json',
  '*credentials*.json',
  'data',
  '*/data/*',
  'tmp',
  '*/tmp/*',
  '.temp',
  '*/.temp/*',
  'test-results',
  'playwright-report',
  '*.map',
  '__pycache__',
  '*.pyc',
  'contests',
  '*/contests/*',
  'scratch',
  '*/scratch/*',
  '*.tar.gz',
  '*.tgz',
  '.git',
  '.dart_tool',
  '*/.dart_tool/*',
  'build',
  '*/build/*',
  '*.ttf',
  '*.TTF',
  '*.otf',
  'dist/brand',
  'dist/browser/brand',
  'dist/browser/images/screenshots',
  'dist/browser/images/workflow',
  'public/brand',
  'public/images/screenshots',
  'public/images/workflow',
  'docs/images'
].map(e => `--exclude=${e}`).join(' ');

const tarCmd = `tar -czf "${outputPath}" ${excludes} ${projectItems.join(' ')}`;
execSync(tarCmd, { cwd: rootDir, stdio: 'inherit' });

const stats = fs.statSync(outputPath);
const sizeMb = stats.size / (1024 * 1024);
console.log(`\n✅ Clean source archive created: ${outputPath} (${sizeMb.toFixed(2)} MB)`);

const MAX_ARCHIVE_MB = Number(process.env.MAX_DEPLOY_ARCHIVE_MB || 50);
if (sizeMb > MAX_ARCHIVE_MB) {
  console.error(`❌ [GreenOps Guard] Archive size (${sizeMb.toFixed(2)} MB) exceeds ${MAX_ARCHIVE_MB} MB ceiling! Prune unused dist/ assets before deploying.`);
  process.exit(1);
}
