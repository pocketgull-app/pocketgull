import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const tmpDir = path.join(rootDir, 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}
const outputFile = path.join(tmpDir, 'deploy.tgz');

console.log(`Packaging ${rootDir} into ${outputFile}...`);

try {
  execSync(`tar -czf "${outputFile}" --exclude="*venv*" --exclude="*node_modules*" --exclude="*dist*" --exclude="*test-results*" --exclude="*scratch*" main.ts index.html ngsw-config.json public src companion-apps docs pocketgull_api scripts package.json package-lock.json tsconfig.json angular.json Dockerfile .gcloudignore`, {
    cwd: rootDir,
    stdio: 'inherit'
  });
  console.log('Archive created successfully! Size:', fs.statSync(outputFile).size, 'bytes');
} catch (e) {
  console.error('Tar creation error:', e.message);
}
