import { describe, it, expect, beforeEach } from 'vitest';
import { CausalInferenceService } from './causal-inference.service';

describe('CausalInferenceService', () => {
  let service: CausalInferenceService;

  beforeEach(() => {
    service = new CausalInferenceService();
  });

  it('should estimate positive ITE for botanical de-escalation on CYP clearance', () => {
    const result = service.estimateTreatmentEffect('DE_ESCALATE_BOTANICAL', {
      age: 48,
      crcl: 90,
      baselineInflammation: 1.5,
      hasBotanicalInhibitor: true,
      currentAcbScore: 0
    });

    expect(result.targetMetric).toBe('CYP Clearance Capacity (%)');
    expect(result.unconfoundedIteDelta).toBeGreaterThan(30);
    expect(result.isClinicallyBeneficial).toBe(true);
    expect(result.propensityScore).toBeGreaterThan(0.02);
    expect(result.propensityScore).toBeLessThan(0.98);
    expect(result.ci95[0]).toBeLessThan(result.ci95[1]);
  });

  it('should estimate significant risk reduction for anticholinergic tapering in elder patient', () => {
    const result = service.estimateTreatmentEffect('TAPERING_ANTICHOLINERGIC', {
      age: 76,
      crcl: 38,
      baselineInflammation: 3.2,
      hasBotanicalInhibitor: false,
      currentAcbScore: 3
    });

    expect(result.targetMetric).toBe('90-Day Delirium & Fall Risk (%)');
    expect(result.unconfoundedIteDelta).toBeLessThan(-20);
    expect(result.isClinicallyBeneficial).toBe(true);
  });
});
