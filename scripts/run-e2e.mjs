import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.resolve(__dirname, '..');
const cliPath = path.join(projectDir, 'node_modules/@playwright/test/cli.js');
const configPath = path.join(projectDir, 'playwright.config.ts');
const specPath = process.argv[2] || 'e2e/emergency-mode.spec.ts';

const tempDir = path.join(projectDir, '.temp');
const res = spawnSync(process.execPath, [cliPath, 'test', '--config=' + configPath, specPath], {
  cwd: projectDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    BASE_URL: process.env.BASE_URL || 'http://127.0.0.1:4000',
    TMP: tempDir,
    TEMP: tempDir,
    TMPDIR: tempDir
  }
});

process.exit(res.status ?? 0);
