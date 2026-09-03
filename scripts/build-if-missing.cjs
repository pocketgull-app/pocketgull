const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const serverFile = path.resolve(rootDir, 'dist/server/server.mjs');

let needsBuild = false;

if (!fs.existsSync(serverFile)) {
  needsBuild = true;
} else if (process.env.FORCE_BUILD === '1') {
  needsBuild = true;
} else {
  // Check if serverFile is older than key source directories
  try {
    const serverMtime = fs.statSync(serverFile).mtimeMs;
    const checkFiles = [
      path.resolve(rootDir, 'src/main.ts'),
      path.resolve(rootDir, 'src/app.component.ts'),
      path.resolve(rootDir, 'src/components/main-header-nav.component.ts')
    ];
    for (const f of checkFiles) {
      if (fs.existsSync(f) && fs.statSync(f).mtimeMs > serverMtime) {
        needsBuild = true;
        break;
      }
    }
  } catch (e) {
    // If stat fails, default to existing state
  }
}

if (needsBuild) {
  console.log('⚡ dist/server/server.mjs is missing or stale. Triggering Angular SSR build...');
  const ngCli = path.resolve(rootDir, 'node_modules/@angular/cli/bin/ng.js');
  execSync(`node "${ngCli}" build`, { cwd: rootDir, stdio: 'inherit' });
} else {
  console.log('✅ dist/server/server.mjs is fresh.');
}
