import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { TravelSportsTicketingService } from './travel-sports-ticketing.service';
import { TransitWellnessGatewayService } from './transit-wellness-gateway.service';

describe('TravelSportsTicketingService (Airline & Sports Ticket Booking Engine)', () => {
  let service: TravelSportsTicketingService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        TransitWellnessGatewayService,
        TravelSportsTicketingService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(TravelSportsTicketingService));
  });

  it('1. Initializes featured airline and sports ticket offers with estimated affiliate commissions', () => {
    expect(service.featuredFlightOffers().length).toBeGreaterThan(0);
    expect(service.featuredSportsOffers().length).toBeGreaterThan(0);
    expect(service.totalAffiliateRevenueGeneratedUsd()).toBeGreaterThan(0);
  });

  it('2. Triggers flight booking and updates affiliate revenue', () => {
    const initialRev = service.totalAffiliateRevenueGeneratedUsd();
    service.bookFlightTicket('flt_sfo_lhr_01');
    expect(service.totalAffiliateRevenueGeneratedUsd()).toBeGreaterThan(initialRev);
  });
});
