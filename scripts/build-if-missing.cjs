const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const serverFile = path.resolve(rootDir, 'dist/server/server.mjs');

if (!fs.existsSync(serverFile)) {
  console.log('⚡ dist/server/server.mjs not found. Triggering Angular SSR build...');
  const ngCli = path.resolve(rootDir, 'node_modules/@angular/cli/bin/ng.js');
  execSync(`node "${ngCli}" build`, { cwd: rootDir, stdio: 'inherit' });
}
