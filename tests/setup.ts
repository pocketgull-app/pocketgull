import '@angular/compiler';
import 'zone.js';
import 'zone.js/testing';

const g: any = typeof window !== 'undefined' ? window : globalThis;
try {
  Object.defineProperty(g, 'config', {
    value: { production: false },
    writable: true,
    configurable: true
  });
} catch {}

g.ng = g.ng || {};
try {
  Object.defineProperty(g.ng, 'config', {
    value: { production: false },
    writable: true,
    configurable: true
  });
} catch {}

g.ngDevMode = true;

import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

try {
  const testBed = getTestBed();
  if (!testBed.platform) {
    testBed.initTestEnvironment(
      BrowserDynamicTestingModule,
      platformBrowserDynamicTesting(),
      { teardown: { destroyAfterEach: true } }
    );
  }
} catch {
  try {
    getTestBed().resetTestEnvironment();
    getTestBed().initTestEnvironment(
      BrowserDynamicTestingModule,
      platformBrowserDynamicTesting(),
      { teardown: { destroyAfterEach: true } }
    );
  } catch {}
}
