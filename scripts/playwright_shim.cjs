/**
 * Universal EPERM / EACCES Shim for Playwright child processes on Windows.
 */
const fs = require('fs');

function isPermissionError(err) {
  return err && (err.code === 'EPERM' || err.code === 'EACCES' || err.code === 'EBUSY');
}

// 1. Sync readdir
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

// 2. Callback readdir
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

// 3. Promises readdir
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

// 4. opendirSync
if (fs.opendirSync) {
  const origOpendirSync = fs.opendirSync;
  fs.opendirSync = function(p, options) {
    try {
      return origOpendirSync.call(fs, p, options);
    } catch (e) {
      if (isPermissionError(e)) {
        return {
          readSync: () => null,
          closeSync: () => {},
          [Symbol.iterator]: function* () {}
        };
      }
      throw e;
    }
  };
}

// 5. Promises opendir
if (fs.promises && fs.promises.opendir) {
  const origPromisesOpendir = fs.promises.opendir;
  fs.promises.opendir = async function(p, options) {
    try {
      return await origPromisesOpendir.call(fs.promises, p, options);
    } catch (e) {
      if (isPermissionError(e)) {
        return {
          read: async () => null,
          close: async () => {},
          async *[Symbol.asyncIterator]() {}
        };
      }
      throw e;
    }
  };
}

// 6. Hook process uncaughtException for harmless Windows EPERM scandir
const origListeners = process.listeners('uncaughtException');
process.on('uncaughtException', (err) => {
  if (isPermissionError(err) && err.path && (err.path.includes('Steam') || err.path.includes('AppData') || err.path.includes('Temp'))) {
    // Harmless Windows background scandir permission block on third-party app caches
    return;
  }
  for (const listener of origListeners) {
    listener(err);
  }
});
