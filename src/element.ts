import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AI_CONFIG, IAiProviderConfig } from './services/ai-provider.types';
import { IntelligenceProviderToken } from './services/ai/intelligence.provider.token';
import { HybridProvider } from './services/ai/hybrid.provider';

async function bootstrapCustomElement() {
  const app = await createApplication({
    providers: [
      provideHttpClient(withFetch()),
      provideZonelessChangeDetection(),
      {
        provide: AI_CONFIG,
        useFactory: () => ({
          apiKey: (window as any).GEMINI_API_KEY || '',
          defaultModel: { modelId: 'gemini-3.5-flash', temperature: 0.1 },
          verificationModel: { modelId: 'gemini-3.5-flash', temperature: 0.0 }
        } as IAiProviderConfig)
      },
      {
        provide: IntelligenceProviderToken,
        useClass: HybridProvider
      }
    ]
  });

  const appElement = createCustomElement(AppComponent, { injector: app.injector });
  
  if (!customElements.get('pocketgull-app-element')) {
    customElements.define('pocketgull-app-element', appElement);
    console.log('[Pocketgull] Registered Web Component <pocketgull-app-element>');
  }
}

bootstrapCustomElement().catch(err => console.error('[Pocketgull Element] Bootstrap error:', err));
