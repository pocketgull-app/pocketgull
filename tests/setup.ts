import '@angular/compiler';
import 'zone.js';
import 'zone.js/testing';

Object.defineProperty(globalThis, 'config', {
  value: { production: false },
  writable: true,
  configurable: true
});

Object.defineProperty(globalThis, 'ng', {
  value: { config: { production: false } },
  writable: true,
  configurable: true
});

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'config', {
    value: { production: false },
    writable: true,
    configurable: true
  });
  Object.defineProperty(window, 'ng', {
    value: { config: { production: false } },
    writable: true,
    configurable: true
  });
}

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
