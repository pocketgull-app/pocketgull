import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const candidates = [
  path.resolve(scriptDir, '..'),
  process.cwd(),
  'C:\\Users\\philg\\Pocketgull\\pocketgull'
];
const projectDir = candidates.find(dir => fs.existsSync(path.join(dir, 'vitest.config.ts'))) || process.cwd();
const cliPath = path.join(projectDir, 'node_modules/vitest/vitest.mjs');
const configPath = path.join(projectDir, 'vitest.config.ts');

console.log(`Executing Vitest in ${projectDir}...`);
const res = spawnSync(process.execPath, [cliPath, 'run', '--config=' + configPath], {
  cwd: projectDir,
  stdio: 'inherit'
});

process.exit(res.status ?? 0);
