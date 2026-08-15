import '@angular/compiler';
import { expect } from 'vitest';
import { CommunityEcoLocalizationService } from './community-eco-localization.service';

describe('CommunityEcoLocalizationService Unit Suite', () => {
  let service: CommunityEcoLocalizationService;

  beforeEach(() => {
    service = new CommunityEcoLocalizationService();
  });

  it('1. Initializes localized eco-health hubs for default city', () => {
    const summary = service.localizedEcoSummary();
    expect(summary.city).toBe('San Francisco');
    expect(summary.hubs.length).toBeGreaterThanOrEqual(5);
    expect(summary.closestParkMiles).toBeLessThan(5);
  });

  it('2. Filters eco hubs by type (farmers markets, forest parks)', () => {
    const markets = service.getHubsByType('FARMERS_MARKET');
    expect(markets.length).toBeGreaterThanOrEqual(1);
    expect(markets[0].name).toContain('Farmers Market');

    const parks = service.getHubsByType('FOREST_PARK');
    expect(parks.length).toBeGreaterThanOrEqual(1);
    expect(parks[0].ecoBenefit).toContain('phytoncides');
  });
});
