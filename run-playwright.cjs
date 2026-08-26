/**
 * Playwright EPERM shim for Windows Application Control environments.
 * Patches fs.readdirSync to silently ignore EPERM (access denied) errors
 * that occur when endpoint security software locks temp inspection folders.
 */
const fs = require('fs');
const path = require('path');

const workspaceTemp = path.join(__dirname, '.playwright_temp');
if (!fs.existsSync(workspaceTemp)) {
  try { fs.mkdirSync(workspaceTemp, { recursive: true }); } catch (e) {}
}
process.env.TMP = workspaceTemp;
process.env.TEMP = workspaceTemp;

const origReaddirSync = fs.readdirSync;
fs.readdirSync = function(p, options) {
  try {
    return origReaddirSync.call(fs, p, options);
  } catch (e) {
    if (e.code === 'EPERM' || e.code === 'EACCES') {
      console.warn(`[shim] Ignoring ${e.code} on readdirSync: ${p}`);
      return [];
    }
    throw e;
  }
};

const origReaddir = fs.readdir;
fs.readdir = function(p, ...args) {
  const callback = args[args.length - 1];
  if (typeof callback === 'function') {
    const newArgs = [...args.slice(0, -1), function(err, files) {
      if (err && (err.code === 'EPERM' || err.code === 'EACCES')) {
        console.warn(`[shim] Ignoring ${err.code} on readdir: ${p}`);
        return callback(null, []);
      }
      return callback(err, files);
    }];
    return origReaddir.call(fs, p, ...newArgs);
  }
  return origReaddir.call(fs, p, ...args);
};

if (fs.promises && fs.promises.readdir) {
  const origPromisesReaddir = fs.promises.readdir;
  fs.promises.readdir = async function(p, ...args) {
    try {
      return await origPromisesReaddir.call(fs.promises, p, ...args);
    } catch (e) {
      if (e.code === 'EPERM' || e.code === 'EACCES') {
        console.warn(`[shim] Ignoring ${e.code} on promises.readdir: ${p}`);
        return [];
      }
      throw e;
    }
  };
}

// Now launch Playwright CLI with remaining args using spawnSync to ensure clean process context
const { spawnSync } = require('child_process');
const candidatePaths = [
  path.resolve(__dirname, 'node_modules/@playwright/test/cli.js'),
  path.resolve(process.cwd(), 'node_modules/@playwright/test/cli.js'),
  path.resolve('c:/Users/philg/Pocketgull/pocketgull/node_modules/@playwright/test/cli.js')
];
const cliPath = candidatePaths.find(p => fs.existsSync(p)) || candidatePaths[2];
const targetCwd = fs.existsSync(path.resolve(__dirname, 'playwright.config.ts')) ? __dirname : 'c:/Users/philg/Pocketgull/pocketgull';

const userArgs = process.argv.slice(2);
const cliArgs = userArgs[0] === 'test' ? userArgs : ['test', ...userArgs];

const res = spawnSync(process.execPath, [cliPath, ...cliArgs], {
  stdio: 'inherit',
  env: process.env,
  cwd: targetCwd
});

process.exit(res.status ?? 0);
