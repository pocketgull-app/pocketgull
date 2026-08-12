import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { TravelSportsTicketingHubComponent } from './travel-sports-ticketing-hub.component';
import { TravelSportsTicketingService } from '../services/travel-sports-ticketing.service';
import { TransitWellnessGatewayService } from '../services/transit-wellness-gateway.service';

describe('TravelSportsTicketingHubComponent', () => {
  let component: TravelSportsTicketingHubComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        TransitWellnessGatewayService,
        TravelSportsTicketingService,
        TravelSportsTicketingHubComponent
      ]
    });
    component = runInInjectionContext(injector, () => injector.get(TravelSportsTicketingHubComponent));
  });

  it('1. Initializes travel sports ticketing hub component with flight and sports offers', () => {
    expect(component.ticketingService.featuredFlightOffers().length).toBeGreaterThan(0);
    expect(component.ticketingService.featuredSportsOffers().length).toBeGreaterThan(0);
  });
});
