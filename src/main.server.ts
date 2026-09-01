// Server-side polyfill for Domino / SSR missing CSSStyleDeclaration.setProperty
try {
  const g = (typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : {}) as any;
  if (g) {
    if (g.CSSStyleDeclaration && g.CSSStyleDeclaration.prototype) {
      if (typeof g.CSSStyleDeclaration.prototype.setProperty !== 'function') {
        g.CSSStyleDeclaration.prototype.setProperty = function (name: string, value: string) {
          try { this[name] = value; } catch {}
        };
      }
    }
  }
} catch {}

import '@angular/compiler';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { BootstrapContext, bootstrapApplication, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { provideServerRendering } from '@angular/platform-server';
import { provideZonelessChangeDetection, ApplicationConfig } from '@angular/core';
import { AI_CONFIG, IAiProviderConfig } from './services/ai-provider.types';
import { IntelligenceProviderToken } from './services/ai/intelligence.provider.token';
import { HybridProvider } from './services/ai/hybrid.provider';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from './environments/environment';

export const config: ApplicationConfig = {
    providers: [
        provideServerRendering(),
        provideZonelessChangeDetection(),
        provideHttpClient(withFetch()),
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideFirestore(() => getFirestore()),
        {
            provide: AI_CONFIG,
            useFactory: () => ({
                apiKey: process.env['GEMINI_API_KEY'] || '',
                defaultModel: { modelId: 'gemini-3.7-flash', temperature: 0.1 },
                verificationModel: { modelId: 'gemini-3.7-flash', temperature: 0.0 }
            } as IAiProviderConfig)
        },
        {
            provide: IntelligenceProviderToken,
            useClass: HybridProvider
        },
        provideClientHydration(withEventReplay())
    ]
};

const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(AppComponent, config, context);

export default bootstrap;
