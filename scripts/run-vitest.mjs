import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, '..');
const cliPath = path.join(projectDir, 'node_modules/vitest/vitest.mjs');
const configPath = path.join(projectDir, 'vitest.config.ts');

console.log(`Executing Vitest in ${projectDir}...`);
const res = spawnSync(process.execPath, [cliPath, 'run', '--config=' + configPath], {
  cwd: projectDir,
  stdio: 'inherit'
});

process.exit(res.status ?? 0);
