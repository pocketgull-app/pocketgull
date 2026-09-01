
import '@angular/compiler';
import { bootstrapApplication, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { dpopAuthInterceptor } from './src/interceptors/dpop-auth.interceptor';
import { AppComponent } from './src/app.component';
import { AI_CONFIG, IAiProviderConfig } from './src/services/ai-provider.types';
import { IntelligenceProviderToken } from './src/services/ai/intelligence.provider.token';
import { HybridProvider } from './src/services/ai/hybrid.provider';
import { provideServiceWorker } from '@angular/service-worker';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from './src/environments/environment';

import { getStoredApiKey } from './src/services/secure-key';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch(), withInterceptors([dpopAuthInterceptor])),
    provideZonelessChangeDetection(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    {
      provide: AI_CONFIG,
      useFactory: () => ({
        apiKey: getStoredApiKey() || '',
        defaultModel: { modelId: 'gemini-3.7-flash', temperature: 0.1 },
        verificationModel: { modelId: 'gemini-3.7-flash', temperature: 0.0 }
      } as IAiProviderConfig)
    },
    {
      provide: IntelligenceProviderToken,
      useClass: HybridProvider
    }, provideClientHydration(withEventReplay()), provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
