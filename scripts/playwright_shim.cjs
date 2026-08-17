/**
 * Universal EPERM / EACCES Shim for Playwright child processes on Windows.
 */
const fs = require('fs');

function isPermissionError(err) {
  return err && (err.code === 'EPERM' || err.code === 'EACCES' || err.code === 'EBUSY');
}

const origReaddirSync = fs.readdirSync;
fs.readdirSync = function(p, options) {
  try {
    return origReaddirSync.call(fs, p, options);
  } catch (e) {
    if (isPermissionError(e)) {
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
      if (isPermissionError(err)) {
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
      if (isPermissionError(e)) {
        return [];
      }
      throw e;
    }
  };
}
