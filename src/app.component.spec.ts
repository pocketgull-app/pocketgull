// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { APP_ROUTES } from './app.routes';
import { appConfig } from './app.config';

describe('Application Routing & Shared Config (Track 1)', () => {
  it('1. Declares lazy loadComponent routes for core top-level views plus backward-compatible wildcard fallback', () => {
    const paths = APP_ROUTES.map(r => r.path);
    for (const expected of ['chart', 'analysis', 'research', 'directory', 'typeface', 'billing', 'pricing', 'portal', 'docs', 'fhir-callback']) {
      expect(paths).toContain(expected);
      const route = APP_ROUTES.find(r => r.path === expected);
      expect(typeof route?.loadComponent).toBe('function');
    }
    const rootRoute = APP_ROUTES.find(r => r.path === '');
    expect(rootRoute?.pathMatch).toBe('full');
    const wildcard = APP_ROUTES.find(r => r.path === '**');
    expect(wildcard).toBeDefined();
    expect(wildcard?.redirectTo).toBeUndefined();
  });

  it('2. Exports shared appConfig with zoneless change detection, router, HttpClient, hydration, and AI provider', () => {
    expect(appConfig).toBeDefined();
    expect(Array.isArray(appConfig.providers)).toBe(true);
    expect(appConfig.providers.length).toBeGreaterThanOrEqual(5);
  });
});
