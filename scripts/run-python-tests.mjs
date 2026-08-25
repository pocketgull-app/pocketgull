import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const scriptPath = path.join(rootDir, 'pocketgull_api', 'run_tests.py');

const venvWin = path.join(rootDir, '.venv', 'Scripts', 'python.exe');
const venvPosix = path.join(rootDir, '.venv', 'bin', 'python');

let pythonCmd = 'python3';
if (fs.existsSync(venvWin)) {
  pythonCmd = venvWin;
} else if (fs.existsSync(venvPosix)) {
  pythonCmd = venvPosix;
}

console.log(`[Python Runner] Using binary: ${pythonCmd}`);
const result = spawnSync(pythonCmd, [scriptPath], { stdio: 'inherit', cwd: rootDir });
if (result.error) {
  console.warn(`[Python Runner] Warning: Could not run Python sidecar tests: ${result.error.message}`);
  process.exit(0);
}
process.exit(result.status ?? 0);
