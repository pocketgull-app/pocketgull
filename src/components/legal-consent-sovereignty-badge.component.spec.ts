import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { LegalConsentSovereigntyBadgeComponent } from './legal-consent-sovereignty-badge.component';
import { LegalConsentSovereigntyService } from '../services/legal-consent-sovereignty.service';

describe('LegalConsentSovereigntyBadgeComponent', () => {
  let component: LegalConsentSovereigntyBadgeComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        LegalConsentSovereigntyService,
        LegalConsentSovereigntyBadgeComponent
      ]
    });
    component = runInInjectionContext(injector, () => injector.get(LegalConsentSovereigntyBadgeComponent));
  });

  it('1. Initializes legal sovereignty badge component with legal badges', () => {
    expect(component.legalService.legalComplianceBadges().length).toBe(4);
    expect(component.legalService.consentSettings().hipaaSafeHarborVerified).toBe(true);
  });
});
