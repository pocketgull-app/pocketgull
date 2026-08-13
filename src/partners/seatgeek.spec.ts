import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { SeatGeekPartnerModuleService } from './seatgeek';

describe('SeatGeekPartnerModuleService (src/partners/seatgeek.ts)', () => {
  let service: SeatGeekPartnerModuleService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        SeatGeekPartnerModuleService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(SeatGeekPartnerModuleService));
  });

  it('1. Initializes SeatGeek partner module inside src/partners/', () => {
    expect(service.partnerConfig().partnerId).toBe('partner_seatgeek_official_01');
    expect(service.partnerConfig().requiresLogoAttribution).toBe(true);
    expect(service.complianceGuidelines().length).toBe(4);
  });
});
