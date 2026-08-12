import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const cwd = 'c:\\Users\\philg\\Pocketgull\\pocketgull';
const outputFile = path.join(cwd, 'build_source.tgz');

console.log(`[Tar] Creating clean source archive at ${outputFile}...`);

try {
  execSync(
    `tar --exclude="node_modules" --exclude=".git" --exclude=".angular" --exclude="dist" --exclude="build" --exclude="AppData" --exclude="Documents" --exclude="Intel" --exclude="build_source.tgz" --exclude="source.tgz" --exclude="scratch" -czf "${outputFile}" .`,
    { cwd, stdio: 'inherit' }
  );
  const stat = fs.statSync(outputFile);
  console.log(`[Tar] Successfully created build_source.tgz (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
} catch (err) {
  console.error('[Tar] Failed:', err.message);
  process.exit(1);
}
