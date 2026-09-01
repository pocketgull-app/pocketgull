import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { LegalZoomPartnerModuleService } from './legalzoom';

describe('LegalZoomPartnerModuleService (src/partners/legalzoom.ts)', () => {
  let service: LegalZoomPartnerModuleService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        LegalZoomPartnerModuleService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(LegalZoomPartnerModuleService));
  });

  it('1. Initializes LegalZoom partner module inside src/partners/', () => {
    expect(service.partnerConfig().partnerId).toBe('partner_legalzoom_01');
    expect(service.partnerConfig().impactChecklistId).toBe('IMPACT_CHECKLIST_ID');
    expect(service.features().length).toBe(4);
  });
});
