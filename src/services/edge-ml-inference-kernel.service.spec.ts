import { describe, it, expect, beforeEach } from 'vitest';
import { EdgeMlInferenceKernelService } from './edge-ml-inference-kernel.service';

describe('EdgeMlInferenceKernelService', () => {
  let service: EdgeMlInferenceKernelService;

  beforeEach(() => {
    service = new EdgeMlInferenceKernelService();
  });

  it('should evaluate CYP phenoconversion in < 5ms with zero egress', () => {
    const res = service.evaluateCypPhenoconversion({
      age: 42,
      baselineCrcl: 90,
      activityScore: 2.0,
      hasBotanicalInhibitor: true,
      concomitantInhibitorCount: 1
    });

    expect(res.zeroEgressVerified).toBe(true);
    expect(res.inferenceLatencyMs).toBeLessThan(5.0);
    expect(res.result.isBlocked).toBe(true);
    expect(res.result.clearanceCapacityPct).toBeLessThan(50.0);
    expect(['POOR_METABOLIZER', 'INTERMEDIATE_METABOLIZER']).toContain(res.result.phenocopyState);
  });

  it('should flag Beers criteria violation for elder on sedatives', () => {
    const res = service.evaluateAnticholinergicRisk({
      age: 78,
      crcl: 35,
      acbScore: 4,
      sedatingAntihistamine: true,
      bladderAntispasmodic: true,
      priorFalls: 2
    });

    expect(res.result.beersCriteriaViolation).toBe(true);
    expect(res.result.acuityTier).toBe('HIGH_ALERT');
    expect(res.result.deliriumRiskProbability).toBeGreaterThan(0.5);
  });
});
