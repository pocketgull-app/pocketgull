const path = require('path');

// Fix Node 24 ESM interop for typescript module imports in Angular CLI workers
try {
  const ts = require('typescript');
  if (ts && !ts.default) {
    Object.defineProperty(ts, 'default', { value: ts, configurable: true, writable: true });
  }
} catch (e) {}

// Forward execution to Angular CLI bin
const ngCliBin = path.resolve(__dirname, '../node_modules/@angular/cli/bin/ng.js');
require(ngCliBin);
