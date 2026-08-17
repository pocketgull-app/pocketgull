import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { LegalConsentSovereigntyService } from './legal-consent-sovereignty.service';

describe('LegalConsentSovereigntyService (Legal Compliance & GDPR/HIPAA Sovereignty)', () => {
  let service: LegalConsentSovereigntyService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        LegalConsentSovereigntyService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(LegalConsentSovereigntyService));
  });

  it('1. Initializes default HIPAA Safe Harbor & GDPR Article 9 & 17 settings', () => {
    expect(service.consentSettings().hipaaSafeHarborVerified).toBe(true);
    expect(service.consentSettings().gdprArticle9OptIn).toBe(true);
    expect(service.legalComplianceBadges().length).toBe(4);
  });

  it('2. Supports updating electronic estate trust directives and GDPR Art. 17 data purging', () => {
    service.updateConsent({ legalEstateTrustName: 'Gear Heritage Trust' });
    expect(service.consentSettings().legalEstateTrustName).toBe('Gear Heritage Trust');

    const purged = service.purgeAllDataUnderGdprArt17();
    expect(purged).toBe(true);
  });
});
