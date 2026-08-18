import '@angular/compiler';
import 'zone.js';
import 'zone.js/testing';

const g: any = typeof window !== 'undefined' ? window : globalThis;
g.config = { production: false };
g.ng = g.ng || { config: { production: false } };
g.ng.config = { production: false };
g.ngDevMode = true;

if (typeof global !== 'undefined') {
  (global as any).config = { production: false };
  (global as any).ng = (global as any).ng || { config: { production: false } };
  (global as any).ng.config = { production: false };
  (global as any).ngDevMode = true;
}

if (typeof globalThis !== 'undefined') {
  (globalThis as any).config = { production: false };
  (globalThis as any).ng = (globalThis as any).ng || { config: { production: false } };
  (globalThis as any).ng.config = { production: false };
  (globalThis as any).ngDevMode = true;
}

import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

export function ensureTestEnvironment(): void {
  try {
    const tb = getTestBed();
    if (!tb.platform) {
      tb.initTestEnvironment(
        BrowserDynamicTestingModule,
        platformBrowserDynamicTesting(),
        { teardown: { destroyAfterEach: false } }
      );
    }
  } catch {
    // Environment already initialized
  }
}

ensureTestEnvironment();

if (typeof (globalThis as any).beforeEach === 'function') {
  (globalThis as any).beforeEach(() => {
    ensureTestEnvironment();
  });
}
