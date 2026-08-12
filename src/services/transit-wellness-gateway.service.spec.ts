import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { TransitWellnessGatewayService } from './transit-wellness-gateway.service';

describe('TransitWellnessGatewayService (TSA & Sports Stadium Body Scanning in Tandem)', () => {
  let service: TransitWellnessGatewayService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [TransitWellnessGatewayService]
    });
    service = runInInjectionContext(injector, () => injector.get(TransitWellnessGatewayService));
  });

  it('1. Initializes default TSA and Stadium body scan metrics', () => {
    const tsa = service.latestTransitScan();
    expect(tsa.venueType).toBe('AIRPORT_TSA');
    expect(tsa.venueNameOrIata).toContain('SFO');

    const stadium = service.latestStadiumScan();
    expect(stadium.venueType).toBe('STADIUM_ARENA');
    expect(stadium.stadiumNoiseDbLimit).toBe(108);
  });

  it('2. Imports a voluntary Sports Stadium body scan payload and updates stadium state', () => {
    const newStadiumScan = service.importVoluntaryScan({
      venueType: 'STADIUM_ARENA',
      venueNameOrIata: 'Gillette Stadium 🏈',
      postureSymmetryScore: 95
    });

    expect(newStadiumScan.venueNameOrIata).toBe('Gillette Stadium 🏈');
    expect(service.latestStadiumScan().postureSymmetryScore).toBe(95);
  });
});
