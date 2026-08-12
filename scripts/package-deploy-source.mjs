import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const projectItems = [
  'Dockerfile',
  'package.json',
  'package-lock.json',
  'angular.json',
  'tsconfig.json',
  'tsconfig.app.json',
  'proxy.conf.mjs',
  'index.html',
  'manifest.webmanifest',
  'favicon.svg',
  'vitest.config.ts',
  'README.md',
  'SECURITY.md',
  'PROFORMA.md',
  'CHANGELOG.md',
  '.dockerignore',
  '.gcloudignore',
  'src',
  'public',
  'docs',
  'scripts',
  'pocketgull_api',
  'companion-apps',
  'tests',
  'e2e'
].filter(item => fs.existsSync(path.resolve(rootDir, item)));

console.log(`📦 Packaging clean project source files from ${rootDir}:`);
console.log(projectItems.map(i => `  - ${i}`).join('\n'));

const outputPath = path.resolve(rootDir, 'deploy_source.tar.gz');
if (fs.existsSync(outputPath)) {
  fs.unlinkSync(outputPath);
}

const tarCmd = `tar -czf ${outputPath} ${projectItems.join(' ')}`;
execSync(tarCmd, { cwd: rootDir, stdio: 'inherit' });

const stats = fs.statSync(outputPath);
console.log(`\n✅ Clean source archive created successfully: ${outputPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
