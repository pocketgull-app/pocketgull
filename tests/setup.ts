import '@angular/compiler';
import 'zone.js';
import 'zone.js/testing';

const g: any = typeof window !== 'undefined' ? window : globalThis;
Object.defineProperty(g, 'config', {
  value: { production: false },
  writable: true,
  configurable: true
});
g.ng = g.ng || {};
Object.defineProperty(g.ng, 'config', {
  value: { production: false },
  writable: true,
  configurable: true
});
g.ngDevMode = true;

import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

try {
  getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
} catch {
  // Environment already initialized
}
