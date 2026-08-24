import '@angular/compiler';

const g: any = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : global);
try {
  g.ng = g.ng || { config: { production: false } };
  if (!g.ng.config) {
    g.ng.config = { production: false };
  }
  g.ngDevMode = true;
} catch {}

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
