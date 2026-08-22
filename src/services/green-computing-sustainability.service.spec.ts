import '@angular/compiler';
import { GreenComputingSustainabilityService } from './green-computing-sustainability.service';

describe('GreenComputingSustainabilityService Unit Suite', () => {
  let service: GreenComputingSustainabilityService;

  beforeEach(() => {
    service = new GreenComputingSustainabilityService();
  });

  it('1. Initializes default eco health & green computing recommendations', () => {
    const scorecard = service.sustainabilityScorecard();
    expect(scorecard.totalCo2SavingsKgPerYear).toBeGreaterThan(200);
    expect(scorecard.sustainabilityTier).toBe('ECO_LEADER');
    expect(scorecard.recommendations.length).toBeGreaterThanOrEqual(4);
  });

  it('2. Filters recommendations by eco category', () => {
    const computeList = service.getRecommendationsByCategory('COMPUTE_ENERGY');
    expect(computeList.length).toBeGreaterThanOrEqual(1);
    expect(computeList[0].title).toContain('WebGPU');

    const dietList = service.getRecommendationsByCategory('PLANETARY_DIET');
    expect(dietList.length).toBeGreaterThanOrEqual(1);
    expect(dietList[0].title).toContain('Planetary Health');
  });
});
