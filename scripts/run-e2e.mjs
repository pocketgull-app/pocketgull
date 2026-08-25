import { spawnSync } from 'child_process';
import path from 'path';

const projectDir = process.cwd();
const cliPath = path.join(projectDir, 'node_modules/@playwright/test/cli.js');
const configPath = path.join(projectDir, 'playwright.config.ts');
const specPath = process.argv[2] || 'e2e/emergency-mode.spec.ts';

const tempDir = path.join(projectDir, '.temp');
const res = spawnSync(process.execPath, [cliPath, 'test', '--config=' + configPath, specPath], {
  cwd: projectDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    BASE_URL: process.env.BASE_URL || 'http://localhost:4200',
    TMP: tempDir,
    TEMP: tempDir,
    TMPDIR: tempDir
  }
});

process.exit(res.status ?? 0);
