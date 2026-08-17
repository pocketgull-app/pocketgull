import '@angular/compiler';
import { expect } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { LegalZoomPartnerHubComponent } from './legalzoom-partner-hub.component';
import { LegalZoomIntegrationService } from '../services/legalzoom-integration.service';
import { LegalConsentSovereigntyService } from '../services/legal-consent-sovereignty.service';
import { UniversalLivingWillService } from '../services/universal-living-will.service';
import { GrowThyselfLegacyEngineService } from '../services/grow-thyself-legacy-engine.service';
import { PatientStateService } from '../services/patient-state.service';

import { ThemeService } from '../services/theme.service';
import { ActuarialLongevityService } from '../services/actuarial-longevity.service';
import { StorageService } from '../services/storage.service';
import { GamificationService } from '../services/gamification.service';

describe('LegalZoomPartnerHubComponent (src/partners/)', () => {
  let component: LegalZoomPartnerHubComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        ThemeService,
        ActuarialLongevityService,
        StorageService,
        GamificationService,
        PatientStateService,
        GrowThyselfLegacyEngineService,
        LegalConsentSovereigntyService,
        LegalZoomIntegrationService,
        UniversalLivingWillService,
        LegalZoomPartnerHubComponent
      ]
    });
    component = runInInjectionContext(injector, () => injector.get(LegalZoomPartnerHubComponent));
  });

  it('1. Initializes legalzoom partner hub component inside src/partners/', () => {
    expect(component.universalWillService.partnerOptions().length).toBeGreaterThanOrEqual(3);
  });
});
