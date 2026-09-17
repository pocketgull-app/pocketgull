import { describe, it, expect, beforeEach } from 'vitest';
import { LateralFlowSurveillanceService } from './lateral-flow-surveillance.service';

describe('LateralFlowSurveillanceService Suite', () => {
  let service: LateralFlowSurveillanceService;

  beforeEach(() => {
    service = new LateralFlowSurveillanceService();
  });

  function generateSyntheticStripScan(controlPeak: number, testPeak: number, length = 100): number[] {
    const scan = new Array(length).fill(0.02); // baseline background optical noise
    // Control zone is indices ~60% to 88% (peak around 75)
    const controlIdx = Math.floor(length * 0.75);
    for (let i = controlIdx - 4; i <= controlIdx + 4; i++) {
      if (i >= 0 && i < length) {
        scan[i] += controlPeak * Math.exp(-Math.pow(i - controlIdx, 2) / 4);
      }
    }
    // Test zone is indices ~28% to 55% (peak around 42)
    if (testPeak > 0) {
      const testIdx = Math.floor(length * 0.42);
      for (let i = testIdx - 4; i <= testIdx + 4; i++) {
        if (i >= 0 && i < length) {
          scan[i] += testPeak * Math.exp(-Math.pow(i - testIdx, 2) / 4);
        }
      }
    }
    return scan;
  }

  it('1. Correctly classifies a valid NEGATIVE rapid antigen strip', () => {
    // Strong control line (0.65 OD), zero test line
    const scan = generateSyntheticStripScan(0.65, 0.0);
    const result = service.analyzeStripIntensityProfile(scan);

    expect(result.isValidTest).toBe(true);
    expect(result.status).toBe('NEGATIVE');
    expect(result.controlLinePeakIntensity).toBeGreaterThan(0.5);
    expect(result.relativeIntensityRatio).toBeLessThan(0.06);
    expect(result.clinicalInterpretation).toContain('Negative');
    expect((result.fhirObservationPayload as any).resourceType).toBe('Observation');
  });

  it('2. Correctly detects a STRONG POSITIVE test line', () => {
    // Strong control line (0.60 OD), strong test line (0.45 OD) -> ratio ~0.75
    const scan = generateSyntheticStripScan(0.60, 0.45);
    const result = service.analyzeStripIntensityProfile(scan);

    expect(result.isValidTest).toBe(true);
    expect(result.status).toBe('STRONG_POSITIVE');
    expect(result.relativeIntensityRatio).toBeGreaterThanOrEqual(0.25);
    expect(result.clinicalInterpretation).toContain('Strong Positive');
  });

  it('3. Detects a WEAK / FAINT POSITIVE test line near limit of detection', () => {
    // Strong control line (0.60 OD), faint test line (0.08 OD) -> ratio ~0.13
    const scan = generateSyntheticStripScan(0.60, 0.08);
    const result = service.analyzeStripIntensityProfile(scan);

    expect(result.isValidTest).toBe(true);
    expect(result.status).toBe('WEAK_POSITIVE');
    expect(result.relativeIntensityRatio).toBeGreaterThanOrEqual(0.06);
    expect(result.relativeIntensityRatio).toBeLessThan(0.25);
    expect(result.clinicalInterpretation).toContain('Weak / Faint Positive');
  });

  it('4. Rejects assay as INVALID if control line peak is missing or below threshold', () => {
    // Control line fails to form (<0.18 OD)
    const scan = generateSyntheticStripScan(0.05, 0.20);
    const result = service.analyzeStripIntensityProfile(scan);

    expect(result.isValidTest).toBe(false);
    expect(result.status).toBe('INVALID_NO_CONTROL');
    expect(result.clinicalInterpretation).toContain('Invalid Assay');
  });
});
