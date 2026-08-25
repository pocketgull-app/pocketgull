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

console.log('🧹 [Zero Agent] Executing Pre-Build Console Integrity & Type Safety Audit...');
execSync('node node_modules/typescript/lib/tsc.js -p tsconfig.json --noEmit', {
  cwd: rootDir,
  env: cleanEnv,
  stdio: 'inherit'
});
console.log('✅ [Zero Agent] TypeScript & Console Integrity Audit Passed (0 Errors).\n');

console.log('🕯️ [Beacon Agent] Running Sentinel Security & Bundle Budget Pre-Audit...');
execSync('node scripts/sentinel_security_guard.mjs', {
  cwd: rootDir,
  env: cleanEnv,
  stdio: 'inherit'
});
console.log('✅ [Beacon Agent] Pre-Build Performance & Security Guard Passed.\n');

console.log('Building Angular SSR app...');
execSync('node node_modules/@angular/cli/bin/ng.js build', {
  cwd: rootDir,
  env: cleanEnv,
  stdio: 'inherit'
});
console.log('✅ Pure Angular SSR & Docs Build Completed Successfully.\n');
