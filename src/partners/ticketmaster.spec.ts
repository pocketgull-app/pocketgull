import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { TicketmasterPartnerModuleService } from './ticketmaster';

describe('TicketmasterPartnerModuleService (src/partners/ticketmaster.ts)', () => {
  let service: TicketmasterPartnerModuleService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        TicketmasterPartnerModuleService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(TicketmasterPartnerModuleService));
  });

  it('1. Initializes SeatGeek, Ticketmaster & AXS partner module inside src/partners/', () => {
    expect(service.partnerConfig().partnerId).toBe('partner_ticketmaster_seatgeek_01');
    expect(service.partnerConfig().supportedVenues.length).toBe(4);
    expect(service.features().length).toBe(4);
  });
});
