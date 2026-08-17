import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const docsDir = path.resolve(rootDir, 'docs/study');

const cleanEnv = {
  ...process.env,
  NODE_ENV: 'production',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'placeholder-key-for-build',
  VITE_PUBLIC_API_URL: process.env.VITE_PUBLIC_API_URL || 'http://127.0.0.1:4000',
  ASTRO_TELEMETRY_DISABLED: '1'
};
delete cleanEnv.INIT_CWD;
delete cleanEnv.npm_config_local_prefix;
delete cleanEnv.npm_package_json;
delete cleanEnv.NPM_PREFIX;

console.log('🔤 Downloading Google Fonts and compiling local fonts.css...');
execSync(`node "${path.resolve(rootDir, 'scripts/download-fonts.js')}"`, {
  cwd: rootDir,
  env: cleanEnv,
  stdio: 'inherit'
});
console.log('✅ Local font asset pipeline ready.\n');

console.log('🧹 [Zero Agent] Executing Pre-Build Console Integrity & Type Safety Audit...');
execSync(`node "${path.resolve(rootDir, 'node_modules/typescript/lib/tsc.js')}" -p "${path.resolve(rootDir, 'tsconfig.json')}" --noEmit`, {
  cwd: rootDir,
  env: cleanEnv,
  stdio: 'inherit'
});
console.log('✅ [Zero Agent] TypeScript & Console Integrity Audit Passed (0 Errors).\n');

console.log('🕯️ [Beacon Agent] Running Sentinel Security & Bundle Budget Pre-Audit...');
execSync(`node "${path.resolve(rootDir, 'scripts/sentinel_security_guard.mjs')}"`, {
  cwd: rootDir,
  env: cleanEnv,
  stdio: 'inherit'
});
console.log('✅ [Beacon Agent] Pre-Build Performance & Security Guard Passed.\n');

console.log('Building Angular SSR app...');
execSync(`node "${path.resolve(rootDir, 'node_modules/@angular/cli/bin/ng.js')}" build`, {
  cwd: rootDir,
  env: cleanEnv,
  stdio: 'inherit'
});

// Post-build stylesheet optimization (removes media="print" / onload from generated HTML files)
import fs from 'fs';
const distDir = path.resolve(rootDir, 'dist');
if (fs.existsSync(distDir)) {
  const htmlFiles = [];
  function scan(dir) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) scan(full);
      else if (full.endsWith('.html')) htmlFiles.push(full);
    }
  }
  scan(distDir);
  for (const file of htmlFiles) {
    let content = fs.readFileSync(file, 'utf-8');
    const updated = content.replace(/<link\b([^>]*\brel=["']stylesheet["'][^>]*)>/gi, (_match, attrs) => {
      let cleanAttrs = attrs
        .replace(/\s+onload=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/\s+media=(?:"print"|'print')/gi, ' media="all"');
      if (!cleanAttrs.includes('media=')) {
        cleanAttrs += ' media="all"';
      }
      return `<link ${cleanAttrs.trim()}>`;
    });
    if (updated !== content) {
      fs.writeFileSync(file, updated, 'utf-8');
      console.log(`✨ Post-processed stylesheet links in ${path.relative(rootDir, file)}`);
    }
  }
}

console.log('✅ Pure Angular SSR & Docs Build Completed Successfully.\n');
