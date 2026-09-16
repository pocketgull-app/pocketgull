import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const projectItems = [
  'main.ts',
  'Dockerfile',
  'package.json',
  'package-lock.json',
  'angular.json',
  'tsconfig.json',
  'tsconfig.app.json',
  'proxy.conf.mjs',
  'proxy.conf.json',
  'tailwind.config.js',
  'ngsw-config.json',
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
  'server.js',
  'src',
  'packages',
  'public',
  'docs',
  'scripts',
  'pocketgull_api',
  'companion-apps/avs-therapy'
].filter(item => fs.existsSync(path.resolve(rootDir, item)));

console.log(`📦 Packaging clean project source files from ${rootDir}:`);
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
  'dist',
  '*/dist/*',
  '.angular',
  '*/.angular/*',
  'tmp',
  '*/tmp/*',
  '.temp',
  '*/.temp/*',
  'test-results',
  'playwright-report',
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
  '*.dill',
  '*.apk',
  '*.dex',
  '*.so',
  '.gradle',
  '*/.gradle/*',
  'companion-apps/patient_app',
  'companion-apps/provider_app',
  'companion-apps/neuro_reader_app',
  'pocketgull_flutter',
  'e2e',
  'tests',
  'public/fonts/google_fonts_submission',
  'public/brand/fonts',
  'public/images/screenshots',
  'public/images/workflow',
  'docs/images'
].map(e => `--exclude=${e}`).join(' ');

const tarCmd = `tar -czf "${outputPath}" ${excludes} ${projectItems.join(' ')}`;
execSync(tarCmd, { cwd: rootDir, stdio: 'inherit' });

const stats = fs.statSync(outputPath);
console.log(`\n✅ Clean source archive created successfully: ${outputPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
