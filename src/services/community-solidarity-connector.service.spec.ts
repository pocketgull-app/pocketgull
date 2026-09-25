import { describe, it, expect, beforeEach } from 'vitest';
import { CommunitySolidarityConnectorService } from './community-solidarity-connector.service';

describe('CommunitySolidarityConnectorService', () => {
  let service: CommunitySolidarityConnectorService;

  beforeEach(() => {
    service = new CommunitySolidarityConnectorService();
  });

  it('should initialize with solidarity hubs including Langar, Bikur Cholim, and Zakat pantries', () => {
    const hubs = service.solidarityHubs();
    expect(hubs.length).toBeGreaterThanOrEqual(5);
    const categories = hubs.map(h => h.traditionCategory);
    expect(categories).toContain('SIKH_GURDWARA_LANGAR');
    expect(categories).toContain('JEWISH_BIKUR_CHOLIM');
    expect(categories).toContain('ISLAMIC_ZAKAT_FOOD');
    expect(categories).toContain('ADVENTIST_VEG_PANTRY');
    expect(categories).toContain('BUDDHIST_COMPASSION_MEALS');
  });

  it('should find hubs within distance threshold sorted by proximity', () => {
    const nearest = service.findNearestHub(3.5);
    expect(nearest.length).toBeGreaterThan(0);
    expect(nearest[0].distanceMiles).toBeLessThanOrEqual(nearest[1]?.distanceMiles ?? 99);
  });

  it('should filter hubs by tradition category', () => {
    const langarHubs = service.getHubsByTradition('SIKH_GURDWARA_LANGAR');
    expect(langarHubs.length).toBe(1);
    expect(langarHubs[0].name).toContain('Gurdwara');
    expect(langarHubs[0].costPolicy).toContain('Free');
  });
});
