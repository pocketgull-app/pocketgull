import { describe, it, expect } from 'vitest';
import {
  validateGroundedClinicalAssertion,
  createDefaultGroundedClinicalAssertion,
  IGroundedClinicalAssertion
} from './grounded-epistemic-assertion.model';

describe('GroundedEpistemicAssertionModel', () => {
  it('should validate a complete and rigorous default assertion', () => {
    const assertion = createDefaultGroundedClinicalAssertion();
    const result = validateGroundedClinicalAssertion(assertion);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(assertion.counterHypotheses).toHaveLength(3);
    expect(assertion.pValueNullRejection).toBeLessThan(0.05);
  });

  it('should reject an assertion lacking exactly 3 counter-hypotheses (Anti-Premature Closure)', () => {
    const invalidAssertion = createDefaultGroundedClinicalAssertion({
      // Only 2 counter hypotheses provided
      counterHypotheses: [
        'Sacroiliac joint dysfunction',
        'Piriformis syndrome'
      ] as any
    });

    const result = validateGroundedClinicalAssertion(invalidAssertion);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('counterHypotheses'))).toBe(true);
  });

  it('should reject an assertion with missing disconfirming physical exams (Falsifiability Invariant)', () => {
    const invalidAssertion = createDefaultGroundedClinicalAssertion({
      disconfirmingPhysicalExams: []
    });

    const result = validateGroundedClinicalAssertion(invalidAssertion);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('disconfirmingPhysicalExams'))).toBe(true);
  });

  it('should reject uncalibrated confidence or non-numeric p-values', () => {
    const invalidAssertion = createDefaultGroundedClinicalAssertion({
      epistemicConfidence: 1.5, // invalid: > 1.0
      pValueNullRejection: NaN
    });

    const result = validateGroundedClinicalAssertion(invalidAssertion);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('epistemicConfidence'))).toBe(true);
    expect(result.errors.some(e => e.includes('pValueNullRejection'))).toBe(true);
  });

  it('should reject invalid Cochrane Risk of Bias or Evidence Tiers', () => {
    const invalidAssertion = createDefaultGroundedClinicalAssertion({
      cochraneRiskOfBias: 'Uncalibrated Risk' as any,
      evidenceTier: 'Level Z' as any
    });

    const result = validateGroundedClinicalAssertion(invalidAssertion);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('cochraneRiskOfBias'))).toBe(true);
    expect(result.errors.some(e => e.includes('evidenceTier'))).toBe(true);
  });
});
