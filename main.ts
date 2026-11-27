// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { bootstrapApplication } from '@angular/platform-browser';
import { ApplicationConfig, isDevMode, mergeApplicationConfig } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { AppComponent } from './src/app.component';
import { appConfig } from './src/app.config';
import { AI_CONFIG, IAiProviderConfig } from './src/services/ai-provider.types';
import { getStoredApiKey } from './src/services/secure-key';

const browserConfig: ApplicationConfig = {
  providers: [
    {
      provide: AI_CONFIG,
      useFactory: (): IAiProviderConfig => ({
        apiKey: getStoredApiKey() || '',
        defaultModel: { modelId: 'gemini-3.8-flash', temperature: 0.1 },
        verificationModel: { modelId: 'gemini-3.8-flash', temperature: 0.0 }
      })
    },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};

bootstrapApplication(AppComponent, mergeApplicationConfig(appConfig, browserConfig)).catch(err =>
  console.error(err)
);

// AI Studio always uses an `index.tsx` file for all project types.
