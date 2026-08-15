import '@angular/compiler';
import { expect } from 'vitest';
import { WhoCdcHealthEquityService } from './who-cdc-health-equity.service';

describe('WhoCdcHealthEquityService Unit Suite', () => {
  let service: WhoCdcHealthEquityService;

  beforeEach(() => {
    service = new WhoCdcHealthEquityService();
  });

  it('1. Initializes default optimal WHO/CDC Health Equity Scorecard', () => {
    const scorecard = service.equityScorecard();
    expect(scorecard.compositeEquityIndex).toBe(100);
    expect(scorecard.equityTier).toBe('OPTIMAL');
    expect(scorecard.sdohRiskVectorCount).toBe(0);
  });

  it('2. Evaluates SDOH risk vectors and updates equity tier', () => {
    const updated = service.evaluateHealthEquity({
      foodInsecurity: true,
      transportationBarrier: true,
      housingInsecurity: true
    });

    expect(updated.sdohRiskVectorCount).toBe(3);
    expect(updated.compositeEquityIndex).toBe(55);
    expect(updated.equityTier).toBe('HIGH_VULNERABILITY');
    expect(updated.priorityDirectives.some(d => d.includes('SNAP'))).toBe(true);
  });
});
