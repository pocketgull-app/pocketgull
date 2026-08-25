import { ProviderTreatmentNetworkService } from './provider-treatment-network.service';

describe('ProviderTreatmentNetworkService', () => {
  const service = new ProviderTreatmentNetworkService();

  it('1. Returns peer clinicians matched by active clinical measures', () => {
    const vagalPeers = service.findPeersByMeasure('Vagal');
    expect(vagalPeers.length).toBeGreaterThan(0);
    expect(vagalPeers[0].name).toContain('Vance');
  });

  it('2. Filters treatment centers by distance', () => {
    const nearbyCenters = service.findTreatmentCentersByDistance(5.0);
    expect(nearbyCenters.length).toBe(2);
    expect(nearbyCenters[0].facilityName).toContain('Androscoggin');
  });
});
