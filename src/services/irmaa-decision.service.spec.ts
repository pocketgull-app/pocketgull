import '@angular/compiler';
import { IrmaaDecisionService } from './irmaa-decision.service';

describe('IrmaaDecisionService Unit Suite', () => {
  let service: IrmaaDecisionService;

  beforeEach(() => {
    service = new IrmaaDecisionService();
  });

  it('1. Correctly classifies standard (Tier 0) MAGI without surcharges', () => {
    const res = service.evaluateIrmaa(95000, 'single', []);
    expect(res.currentTier.tier).toBe(0);
    expect(res.annualSurcharge).toBe(0);
    expect(res.appealAssessment.isEligible).toBe(false);
  });

  it('2. Calculates Tier 1 IRMAA surcharges for single filer', () => {
    const res = service.evaluateIrmaa(120000, 'single', []);
    expect(res.currentTier.tier).toBe(1);
    expect(res.currentTier.partBSurchargeMonthly).toBe(70.00);
    expect(res.currentTier.partDSurchargeMonthly).toBe(13.70);
    expect(res.annualSurcharge).toBeCloseTo(1004.40, 2);
  });

  it('3. Calculates Tier 2 surcharges and detects tax cliff buffer', () => {
    const res = service.evaluateIrmaa(130000, 'single', []);
    expect(res.currentTier.tier).toBe(1);
    expect(res.nextTier?.tier).toBe(2);
    expect(res.cliffBufferDistance).toBe(3000); // 133000 - 130000
    expect(res.clinicalFinancialDirectives.some(d => d.includes('TAX CLIFF ALERT'))).toBe(true);
  });

  it('4. Evaluates Form SSA-44 appeal eligibility for qualifying Life-Changing Events', () => {
    const res = service.evaluateIrmaa(150000, 'single', ['WORK_REDUCTION']);
    expect(res.currentTier.tier).toBe(2);
    expect(res.appealAssessment.isEligible).toBe(true);
    expect(res.appealAssessment.estimatedAnnualSavings).toBeGreaterThan(2000);
    expect(res.appealAssessment.requiredDocuments.length).toBeGreaterThan(0);
  });

  it('5. Adjusts brackets for Married Filing Jointly', () => {
    const resSingle = service.evaluateIrmaa(180000, 'single', []);
    const resJoint = service.evaluateIrmaa(180000, 'joint', []);

    expect(resSingle.currentTier.tier).toBe(3);
    expect(resJoint.currentTier.tier).toBe(0);
  });
});
