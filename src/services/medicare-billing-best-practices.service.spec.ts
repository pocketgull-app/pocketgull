import '@angular/compiler';
import { expect } from 'vitest';
import { MedicareBillingBestPracticesService } from './medicare-billing-best-practices.service';

describe('MedicareBillingBestPracticesService Unit Suite', () => {
  let service: MedicareBillingBestPracticesService;

  beforeEach(() => {
    service = new MedicareBillingBestPracticesService();
  });

  it('1. Enforces $2,000 Part D Cap and calculates MPPP monthly payment options', () => {
    const mppp = service.calculateMpppSmoothing(4500, 12);
    expect(mppp.isCapped).toBe(true);
    expect(mppp.effectiveCapAmount).toBe(2000);
    expect(mppp.monthlyMpppPayment).toBeCloseTo(166.67, 2);
    expect(mppp.savingsDescription).toContain('Protected by Inflation Reduction Act $2,000 cap');
  });

  it('2. Evaluates RPM CPT 99454 and 99457 billing compliance based on 16 days & 20 minutes thresholds', () => {
    const rpmNonCompliant = service.evaluateRpmCompliance(12, 15);
    expect(rpmNonCompliant.find(r => r.cptCode === 'CPT 99454')?.isCompliant).toBe(false);

    const rpmCompliant = service.evaluateRpmCompliance(18, 25);
    expect(rpmCompliant.find(r => r.cptCode === 'CPT 99454')?.isCompliant).toBe(true);
    expect(rpmCompliant.find(r => r.cptCode === 'CPT 99457')?.isCompliant).toBe(true);
  });

  it('3. Generates No Surprises Act Good Faith Estimate with dispute threshold', () => {
    const gfe = service.generateGoodFaithEstimate('P-101', [
      { cptCode: 'CPT 99214', description: 'Office Visit', estimatedCost: 150 },
      { cptCode: 'CPT 99454', description: 'RPM Transmission', estimatedCost: 50 }
    ]);

    expect(gfe.totalEstimatedCost).toBe(200);
    expect(gfe.disputeNoticeThreshold).toBe(600); // 200 + 400
  });

  it('4. Evaluates IRS 501(r) Charity Care FPL eligibility', () => {
    const fullDiscount = service.evaluateCharityCare(25000, 1);
    expect(fullDiscount.isEligibleFor100PercentDiscount).toBe(true);

    const partialDiscount = service.evaluateCharityCare(45000, 1);
    expect(partialDiscount.isEligibleForPartialDiscount).toBe(true);
  });

  it('5. Synthesizes complete Medicare billing assessment payload', () => {
    const assessment = service.assessMedicareBilling({
      annualRxCost: 3500,
      daysDeviceTransmitted: 18,
      clinicalMinutesLogged: 22,
      annualIncome: 28000
    });

    expect(assessment.mppp.isCapped).toBe(true);
    expect(assessment.rpmBillingCodes.filter(r => r.isCompliant).length).toBe(4);
    expect(assessment.actionableDirectives.length).toBeGreaterThan(0);
  });
});
