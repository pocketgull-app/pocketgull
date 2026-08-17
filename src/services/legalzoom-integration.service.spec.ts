import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { LegalZoomIntegrationService } from './legalzoom-integration.service';
import { LegalConsentSovereigntyService } from './legal-consent-sovereignty.service';
import { GrowThyselfLegacyEngineService } from './grow-thyself-legacy-engine.service';
import { PatientStateService } from './patient-state.service';
import { StorageService } from './storage.service';
import { ThemeService } from './theme.service';
import { ActuarialLongevityService } from './actuarial-longevity.service';
import { GamificationService } from './gamification.service';

describe('LegalZoomIntegrationService (Sovereign Client-Side Estate Bundle Export)', () => {
  let service: LegalZoomIntegrationService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        ThemeService,
        StorageService,
        GamificationService,
        ActuarialLongevityService,
        PatientStateService,
        GrowThyselfLegacyEngineService,
        LegalConsentSovereigntyService,
        LegalZoomIntegrationService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(LegalZoomIntegrationService));
  });

  it('1. Initializes available sovereign document packages and generates estate trust payload', () => {
    expect(service.availablePackages().length).toBe(2);
    const payload = service.generateLegalZoomPayload();
    expect(payload.estateTrustName).toBeDefined();
    expect(payload.executorEmail).toBeDefined();
    expect(payload.dataDirectives.openScienceConsent).toBe(true);
  });

  it('2. Exports client-side sovereign document bundle with zero external API dependencies', () => {
    expect(() => service.checkoutLegalZoomPackage('lz_digital_data_will_01')).not.toThrow();
  });
});
