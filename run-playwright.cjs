/**
 * Universal Playwright Launcher with EPERM shield for Windows.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const workspaceTemp = path.join(__dirname, '.playwright_temp');
if (!fs.existsSync(workspaceTemp)) {
  try { fs.mkdirSync(workspaceTemp, { recursive: true }); } catch (e) {}
}
process.env.TMP = workspaceTemp;
process.env.TEMP = workspaceTemp;

const shimPath = path.resolve(__dirname, 'scripts/playwright_shim.cjs').replace(/\\/g, '/');
require(shimPath);

// Ensure all worker threads / child processes inherit the shim
const nodeOptions = process.env.NODE_OPTIONS || '';
if (!nodeOptions.includes('playwright_shim.cjs')) {
  process.env.NODE_OPTIONS = `${nodeOptions} -r "${shimPath}"`.trim();
}

const userArgs = process.argv.slice(2);
const cliPath = path.resolve(__dirname, 'node_modules/@playwright/test/cli.js');
const configPath = path.resolve(__dirname, 'playwright.config.ts');
const hasConfig = userArgs.some(a => a.startsWith('-c') || a.startsWith('--config'));
const filteredArgs = userArgs[0] === 'test' ? userArgs.slice(1) : userArgs;
const cliArgs = ['-r', shimPath, cliPath, 'test', ...(hasConfig ? [] : ['-c', configPath]), ...filteredArgs];

const res = spawnSync(process.execPath, cliArgs, {
  stdio: 'inherit',
  env: process.env,
  cwd: __dirname
});

process.exit(res.status ?? 0);
