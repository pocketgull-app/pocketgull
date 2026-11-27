// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { APP_ROUTES } from './app.routes';
import { dpopAuthInterceptor } from './interceptors/dpop-auth.interceptor';
import { IntelligenceProviderToken } from './services/ai/intelligence.provider.token';
import { HybridProvider } from './services/ai/hybrid.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(APP_ROUTES, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([dpopAuthInterceptor])),
    provideClientHydration(withEventReplay()),
    {
      provide: IntelligenceProviderToken,
      useClass: HybridProvider
    }
  ]
};
