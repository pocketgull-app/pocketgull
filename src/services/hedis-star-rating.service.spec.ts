import '@angular/compiler';
import { describe, it, beforeEach, expect } from 'vitest';
import { HedisStarRatingService } from './hedis-star-rating.service';

describe('HedisStarRatingService Unit Suite', () => {
  let service: HedisStarRatingService;

  beforeEach(() => {
    service = new HedisStarRatingService();
  });

  it('1. Calculates PDC percentage correctly', () => {
    const pdc = service.calculatePdc(292, 365); // 80% PDC
    expect(pdc).toBeCloseTo(80.0, 1);
  });

  it('2. Maps PDC percentages to CMS Star Ratings (1 to 5 Stars)', () => {
    expect(service.getStarRatingForPdc(88)).toBe(5);
    expect(service.getStarRatingForPdc(81)).toBe(4);
    expect(service.getStarRatingForPdc(76)).toBe(3);
    expect(service.getStarRatingForPdc(71)).toBe(2);
    expect(service.getStarRatingForPdc(65)).toBe(1);
  });

  it('3. Evaluates patient HEDIS measures and detects blood pressure care gaps', () => {
    const measures = service.evaluatePatientHedisMeasures({
      systolicBp: 148,
      diastolicBp: 92,
      hasHypertension: true
    });

    const cbp = measures.find(m => m.id === 'CBP');
    expect(cbp?.isMet).toBe(false);
    expect(cbp?.starRating).toBe(2);
    expect(cbp?.careGapDirective).toContain('BP is >= 140/90 mmHg');
  });

  it('4. Evaluates triple-weighted medication adherence gaps (MAD, MAH, MAS)', () => {
    const measures = service.evaluatePatientHedisMeasures({
      diabetesRefillDays: 250, // ~68.5% PDC (under 80%)
      hasDiabetes: true
    });

    const mad = measures.find(m => m.id === 'MAD');
    expect(mad?.isMet).toBe(false);
    expect(mad?.starRating).toBe(1);
    expect(mad?.careGapDirective).toContain('auto-refill');
  });

  it('5. Generates overall composite summary and CMS Quality Bonus Payment (QBP) status', () => {
    const summary = service.generateOverallSummary('P-101', {
      systolicBp: 124,
      diastolicBp: 78,
      hbA1c: 7.1,
      diabetesRefillDays: 320,
      hypertensionRefillDays: 330,
      statinRefillDays: 310,
      hasColorectalScreening: true,
      hasDiabeticEyeExam: true,
      hasDiabetes: true,
      hasHypertension: true
    });

    expect(summary.overallStarRating).toBeGreaterThanOrEqual(4.0);
    expect(summary.isQualityBonusEligible).toBe(true);
    expect(summary.estQbpBonusPerMemberAnnual).toBe(500);
    expect(summary.activeCareGapsCount).toBe(0);
    expect(summary.summaryDirective).toContain('EXCELLENT QUALITY');
  });
});
