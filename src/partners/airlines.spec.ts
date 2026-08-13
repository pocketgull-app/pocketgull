import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { AirlinePartnerModuleService } from './airlines';

describe('AirlinePartnerModuleService (src/partners/airlines.ts)', () => {
  let service: AirlinePartnerModuleService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        AirlinePartnerModuleService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(AirlinePartnerModuleService));
  });

  it('1. Initializes partner airlines inside src/partners/', () => {
    expect(service.partnerAirlines().length).toBe(3);
    expect(service.totalPartnerAirlinesCount()).toBe(3);
  });
});
