// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

// Server-side polyfill for Domino / SSR missing CSSStyleDeclaration.setProperty
try {
  const g = (typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : {}) as Record<string, unknown>;
  if (g) {
    const cssStyle = g['CSSStyleDeclaration'] as { prototype?: Record<string, unknown> } | undefined;
    if (cssStyle && cssStyle.prototype) {
      if (typeof cssStyle.prototype['setProperty'] !== 'function') {
        cssStyle.prototype['setProperty'] = function (name: string, value: string) {
          try { (this as Record<string, unknown>)[name] = value; } catch {}
        };
      }
    }
  }
} catch {}

import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { AppComponent } from './app.component';
import { appConfig } from './app.config';
import { AI_CONFIG, IAiProviderConfig } from './services/ai-provider.types';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    {
      provide: AI_CONFIG,
      useFactory: (): IAiProviderConfig => ({
        apiKey: process.env['GEMINI_API_KEY'] || '',
        defaultModel: { modelId: 'gemini-3.8-flash', temperature: 0.1 },
        verificationModel: { modelId: 'gemini-3.8-flash', temperature: 0.0 }
      })
    }
  ]
};

export const config: ApplicationConfig = mergeApplicationConfig(appConfig, serverConfig);

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(AppComponent, config, context);

export default bootstrap;
