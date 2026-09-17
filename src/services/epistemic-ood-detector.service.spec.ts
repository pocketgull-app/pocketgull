import { describe, it, expect, beforeEach } from 'vitest';
import { EpistemicOodDetectorService } from './epistemic-ood-detector.service';

describe('EpistemicOodDetectorService', () => {
  let service: EpistemicOodDetectorService;

  beforeEach(() => {
    service = new EpistemicOodDetectorService();
  });

  it('should pass normal in-distribution clinical patient values', () => {
    // Normal adult metabolic: age 45, crcl 95, clearance 80%
    const res = service.evaluateInputDistribution('METABOLIC', [45, 95, 80]);
    expect(res.isOod).toBe(false);
    expect(res.action).toBe('PROCEED');
    expect(res.mahalanobisDistanceSquared).toBeLessThan(res.criticalThreshold);
  });

  it('should abstain and flag OOD on physiologically absurd or corrupted inputs', () => {
    // Corrupted input: age 190, crcl 850, clearance 999%
    const res = service.evaluateInputDistribution('METABOLIC', [190, 850, 999]);
    expect(res.isOod).toBe(true);
    expect(res.action).toBe('ABSTAIN_OUT_OF_DISTRIBUTION');
    expect(res.mahalanobisDistanceSquared).toBeGreaterThan(res.criticalThreshold);
    expect(res.clinicalAdvisory.toUpperCase()).toContain('ABSTAIN');
  });
});
