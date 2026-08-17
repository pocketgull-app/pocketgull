const g: any = typeof window !== 'undefined' ? window : globalThis;
g.config = g.config || { production: false };
g.ng = g.ng || {};
g.ng.config = g.ng.config || { production: false };
g.ngDevMode = true;

import '@angular/compiler';
import 'zone.js';
import 'zone.js/testing';

import { getTestBed, TestBed } from '@angular/core/testing';
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
