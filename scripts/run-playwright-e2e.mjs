import os from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectTemp = path.resolve(__dirname, '../.temp');

if (!fs.existsSync(projectTemp)) {
  fs.mkdirSync(projectTemp, { recursive: true });
}

os.tmpdir = () => projectTemp;
process.env.TMP = projectTemp;
process.env.TEMP = projectTemp;
process.env.TMPDIR = projectTemp;

const testFile = process.argv[2] || 'e2e/counterfactual-soap-suite.spec.ts';
process.argv = [process.argv[0], 'playwright', 'test', testFile];

import('playwright/lib/cli/cli.js').catch(async () => {
  const cliPath = path.resolve(__dirname, '../node_modules/@playwright/test/cli.js');
  await import(`file:///${cliPath.replace(/\\/g, '/')}`);
});
