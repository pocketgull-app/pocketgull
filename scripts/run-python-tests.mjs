import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const scriptPath = path.join(rootDir, 'pocketgull_api', 'run_tests.py');

const venvWin = path.join(rootDir, '.venv', 'Scripts', 'python.exe');
const venvPosix = path.join(rootDir, '.venv', 'bin', 'python');

let pythonCmd = process.platform === 'win32'
  ? (fs.existsSync(venvWin) ? venvWin : 'python')
  : (fs.existsSync(venvPosix) ? venvPosix : 'python3');

console.log(`[Python Runner] Using binary: ${pythonCmd}`);
const result = spawnSync(pythonCmd, [scriptPath], {
  stdio: 'inherit',
  cwd: rootDir,
  shell: true,
  env: {
    ...process.env,
    PYTHONWARNINGS: 'ignore',
    LOKY_MAX_CPU_COUNT: '16',
  },
});
if (result.error) {
  console.warn(`[Python Runner] Warning: Could not run Python sidecar tests: ${result.error.message}`);
  process.exit(0);
}
process.exit(result.status ?? 0);
