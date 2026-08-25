/**
 * Universal EPERM / EACCES Shim for Playwright Windows execution.
 * Preloaded into all Playwright workers and parent processes via NODE_OPTIONS -r.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const workspaceTemp = path.resolve(__dirname, '../.playwright_temp');
if (!fs.existsSync(workspaceTemp)) {
  try { fs.mkdirSync(workspaceTemp, { recursive: true }); } catch (e) {}
}

os.tmpdir = () => workspaceTemp;
process.env.TMP = workspaceTemp;
process.env.TEMP = workspaceTemp;
process.env.TMPDIR = workspaceTemp;

const origReaddirSync = fs.readdirSync;
fs.readdirSync = function(p, options) {
  try {
    return origReaddirSync.call(fs, p, options);
  } catch (e) {
    if (e.code === 'EPERM' || e.code === 'EACCES' || e.code === 'ENOENT') {
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
      if (err && (err.code === 'EPERM' || err.code === 'EACCES' || err.code === 'ENOENT')) {
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
      if (e.code === 'EPERM' || e.code === 'EACCES' || e.code === 'ENOENT') {
        return [];
      }
      throw e;
    }
  };
}
