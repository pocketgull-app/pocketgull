import { describe, it, expect } from 'vitest';
import {
  scorePhq9,
  scoreGad7,
  scoreEpds,
  calculateTelemetrySignificance,
  calculatePolygenicRiskPercentile,
  createFhirR4ObservationBundle
} from '../src/index';

describe('@pocketgull/core-sdk Assessment Scorers', () => {
  it('should score PHQ-9 correctly across severities', () => {
    const minimal = scorePhq9([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(minimal.totalScore).toBe(0);
    expect(minimal.severity).toBe('None-minimal');
    expect(minimal.criticalAlert).toBe(false);

    const moderate = scorePhq9([1, 1, 2, 1, 1, 2, 1, 1, 0]);
    expect(moderate.totalScore).toBe(10);
    expect(moderate.severity).toBe('Moderate');

    const severeWithSelfHarm = scorePhq9([3, 3, 3, 3, 3, 3, 3, 3, 2]);
    expect(severeWithSelfHarm.totalScore).toBe(26);
    expect(severeWithSelfHarm.severity).toBe('Severe');
    expect(severeWithSelfHarm.criticalAlert).toBe(true);
    expect(severeWithSelfHarm.clinicalAction).toContain('CRITICAL ALERT');
  });

  it('should throw error if PHQ-9 answers length is invalid', () => {
    expect(() => scorePhq9([1, 2])).toThrow('PHQ-9 requires exactly 9 item scores');
  });

  it('should score GAD-7 anxiety scale correctly', () => {
    const mild = scoreGad7([1, 1, 1, 1, 1, 1, 0]);
    expect(mild.totalScore).toBe(6);
    expect(mild.severity).toBe('Mild Anxiety');

    const severe = scoreGad7([3, 3, 3, 3, 2, 2, 2]);
    expect(severe.totalScore).toBe(18);
    expect(severe.severity).toBe('Severe Anxiety');
  });

  it('should throw error if GAD-7 answers length is invalid', () => {
    expect(() => scoreGad7([1, 2, 3])).toThrow('GAD-7 requires exactly 7 item scores');
  });

  it('should score EPDS maternal depression scale with self-harm detection', () => {
    const low = scoreEpds([0, 0, 1, 0, 0, 1, 0, 0, 0, 0]);
    expect(low.totalScore).toBe(2);
    expect(low.severity).toBe('Low Depression Risk');
    expect(low.criticalAlert).toBe(false);

    const highRisk = scoreEpds([2, 2, 2, 1, 1, 2, 2, 1, 1, 1]);
    expect(highRisk.totalScore).toBe(15);
    expect(highRisk.severity).toBe('Probable Major Postpartum Depression');
    expect(highRisk.criticalAlert).toBe(true);
  });

  it('should throw error if EPDS answers length is invalid', () => {
    expect(() => scoreEpds([1, 2])).toThrow('EPDS requires exactly 10 item scores');
  });
});

describe('@pocketgull/core-sdk Statistical Significance & PRS', () => {
  it('should handle single sample boundary with notice', () => {
    const res = calculateTelemetrySignificance([72], 70);
    expect(res.mean).toBe(72);
    expect(res.rejectNullHypothesis).toBe(false);
    expect(res.skepticalWarningNotice).toBeDefined();
  });

  it('should throw error on empty sample', () => {
    expect(() => calculateTelemetrySignificance([], 70)).toThrow('Sample array cannot be empty');
  });

  it('should calculate statistically significant tachycardia deviation', () => {
    const res = calculateTelemetrySignificance([130, 132, 129, 131, 133], 70, 0.05);
    expect(res.rejectNullHypothesis).toBe(true);
    expect(res.pValueTwoTailed).toBeLessThan(0.001);
  });

  it('should provide skeptical warning notice when p >= alpha', () => {
    const res = calculateTelemetrySignificance([70.1, 69.9, 70.0, 70.2], 70, 0.05);
    expect(res.rejectNullHypothesis).toBe(false);
    expect(res.skepticalWarningNotice).toContain('Observation cannot reject the null hypothesis');
  });

  it('should calculate PRS percentiles and risk tiers correctly', () => {
    const median = calculatePolygenicRiskPercentile(10.0, 10.0, 2.0);
    expect(median.percentile).toBeCloseTo(50.0, 0);
    expect(median.riskTier).toBe('Average Risk');
    expect(median.oddsRatioEstimated).toBe(1.0);

    const high = calculatePolygenicRiskPercentile(14.0, 10.0, 2.0); // +2 SD
    expect(high.percentile).toBeGreaterThan(95.0);
    expect(high.riskTier).toBe('High Polygenic Risk');
    expect(high.oddsRatioEstimated).toBeGreaterThan(2.0);

    const low = calculatePolygenicRiskPercentile(6.0, 10.0, 2.0); // -2 SD
    expect(low.percentile).toBeLessThan(10.0);
    expect(low.riskTier).toBe('Low Risk');
  });

  it('should throw error if PRS population standard deviation is non-positive', () => {
    expect(() => calculatePolygenicRiskPercentile(10, 10, 0)).toThrow('strictly positive');
  });
});

describe('@pocketgull/core-sdk FHIR R4 Serialization', () => {
  it('should create a valid FHIR R4 Observation Bundle', () => {
    const bundle = createFhirR4ObservationBundle({
      patientId: 'patient-test-1',
      loincCode: '8867-4',
      loincDisplay: 'Heart rate',
      value: 72,
      unit: 'bpm'
    });

    expect(bundle['resourceType']).toBe('Bundle');
    expect(bundle['type']).toBe('collection');
    expect(bundle['entry'].length).toBe(1);

    const obs = bundle['entry'][0]['resource'];
    expect(obs['resourceType']).toBe('Observation');
    expect(obs['valueQuantity']['value']).toBe(72);
    expect(obs['valueQuantity']['unit']).toBe('bpm');
    expect(obs['subject']['reference']).toBe('Patient/patient-test-1');
  });
});
