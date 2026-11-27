// SPDX-License-Identifier: Apache-2.0
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const scriptPath = path.join(rootDir, 'pocketgull_api', 'run_tests.py');

const venvWin = path.join(rootDir, '.venv', 'Scripts', 'python.exe');
const venvPosix = path.join(rootDir, '.venv', 'bin', 'python');

const pythonCmd = process.platform === 'win32'
  ? (fs.existsSync(venvWin) ? venvWin : 'python')
  : (fs.existsSync(venvPosix) ? venvPosix : 'python3');

const env = {
  ...process.env,
  PYTHONWARNINGS: 'ignore',
  LOKY_MAX_CPU_COUNT: '16',
};

console.log(`[Python Runner] Using binary: ${pythonCmd}`);

// 1. Run canonical pocketgull_api/run_tests.py (now fail-closed on unittest.TestResult)
const runTestsResult = spawnSync(pythonCmd, [scriptPath], {
  stdio: 'inherit',
  cwd: rootDir,
  shell: false,
  env,
});

if (runTestsResult.error) {
  console.error(`[Python Runner] FATAL: Could not execute Python sidecar tests: ${runTestsResult.error.message}`);
  process.exit(1);
}
if ((runTestsResult.status ?? 1) !== 0) {
  console.error(`[Python Runner] FAILED: pocketgull_api/run_tests.py exited with code ${runTestsResult.status}.`);
  process.exit(runTestsResult.status ?? 1);
}

// 2. Also run pytest via `python -m pytest` to catch collection errors and unittest assertion regressions
console.log('\n[Python Runner] Running independent pytest verification (`python -m pytest pocketgull_api`)...');
const pytestResult = spawnSync(pythonCmd, ['-m', 'pytest', 'pocketgull_api', '--tb=short', '-q'], {
  stdio: 'inherit',
  cwd: rootDir,
  shell: false,
  env,
});

if (pytestResult.error) {
  console.error(`[Python Runner] FATAL: Could not invoke pytest: ${pytestResult.error.message}`);
  process.exit(1);
}
if ((pytestResult.status ?? 1) !== 0) {
  console.error(`[Python Runner] FAILED: pytest exited with code ${pytestResult.status}.`);
  process.exit(pytestResult.status ?? 1);
}

console.log('[Python Runner] ✅ Both run_tests.py and pytest passed with 0 errors and 0 failures.');
process.exit(0);
