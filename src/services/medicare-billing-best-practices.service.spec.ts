import '@angular/compiler';
import {
  MedicareBillingBestPracticesService,
  IRA_PART_D_CAPS
} from './medicare-billing-best-practices.service';

describe('MedicareBillingBestPracticesService Unit Suite', () => {
  let service: MedicareBillingBestPracticesService;

  beforeEach(() => {
    service = new MedicareBillingBestPracticesService();
  });

  it('1. Enforces CMS-indexed 2026 ($2,100) and 2027 ($2,400) Part D Caps with M3P monthly smoothing', () => {
    expect(IRA_PART_D_CAPS[2025]).toBe(2000);
    expect(IRA_PART_D_CAPS[2026]).toBe(2100);
    expect(IRA_PART_D_CAPS[2027]).toBe(2400);

    const mppp2026 = service.calculateMpppSmoothing(4500, 12, 2026);
    expect(mppp2026.planYear).toBe(2026);
    expect(mppp2026.statutoryCapAmount).toBe(2100);
    expect(mppp2026.isCapped).toBe(true);
    expect(mppp2026.effectiveCapAmount).toBe(2100);
    expect(mppp2026.annualSavingsUsd).toBe(2400);
    expect(mppp2026.monthlyMpppPayment).toBeCloseTo(175, 2);
    expect(mppp2026.savingsDescription).toContain('2026 Inflation Reduction Act $2,100 Part D cap');

    const mppp2027MidYear = service.calculateMpppSmoothing(5000, 6, 2027);
    expect(mppp2027MidYear.statutoryCapAmount).toBe(2400);
    expect(mppp2027MidYear.monthlyMpppPayment).toBeCloseTo(400, 2);
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

  it('4. Evaluates IRS 501(r) Charity Care eligibility using 2026 HHS FPL ($15,960 baseline)', () => {
    const fullDiscount = service.evaluateCharityCare(25000, 1);
    expect(fullDiscount.isEligibleFor100PercentDiscount).toBe(true);

    const partialDiscount = service.evaluateCharityCare(45000, 1);
    expect(partialDiscount.isEligibleForPartialDiscount).toBe(true);
  });

  it('5. Screens 2026 Part D Extra Help (LIS) and QMB/SLMB/QI Medicare Savings Programs accurately', () => {
    const qmb = service.evaluateExtraHelpAndMsp({
      annualIncomeUsd: 15600, // $1,300/mo <= $1,350 QMB limit
      maritalStatus: 'individual',
      countableResourcesUsd: 6000
    });
    expect(qmb.mspTier).toBe('QMB');
    expect(qmb.qmbBalanceBillingProtected).toBe(true);
    expect(qmb.extraHelpEligible).toBe(true);
    expect(qmb.extraHelpAutoQualified).toBe(true);
    expect(qmb.extraHelpGenericCopayCapUsd).toBe(5.10);
    expect(qmb.extraHelpBrandCopayCapUsd).toBe(12.65);

    const extraHelpOnly = service.evaluateExtraHelpAndMsp({
      annualIncomeUsd: 23000, // <= $23,940 LIS limit, above QI $1,816/mo ($21,792/yr)
      maritalStatus: 'individual',
      countableResourcesUsd: 15000
    });
    expect(extraHelpOnly.mspTier).toBe('NONE');
    expect(extraHelpOnly.extraHelpEligible).toBe(true);
    expect(extraHelpOnly.extraHelpAutoQualified).toBe(false);
  });

  it('6. Evaluates CMS APCM (G0556-G0558), G2211 Modifier 25 guard, CCM mutual exclusion, and Section 1115 Z-codes', () => {
    const qmbDual = service.evaluateApcmAndSafetyNetBilling({
      chronicConditionCount: 3,
      isQmbEnrolled: true,
      isLongitudinalFocalCare: true,
      socialNeeds: ['food-insecurity', 'transportation-barrier']
    });
    expect(qmbDual.recommendedApcmCode?.hcpcsCode).toBe('G0558');
    expect(qmbDual.recommendedApcmCode?.estReimbursementUsd).toBe(117.23);
    expect(qmbDual.recommendedApcmCode?.patientCostSharingUsd).toBe(0);
    expect(qmbDual.g2211AddOn.isEligible).toBe(true);
    expect(qmbDual.sdohAssessmentG0136.isEligible).toBe(true);
    expect(qmbDual.hrsnZCodes.map(z => z.icd10ZCode)).toEqual(['Z59.41', 'Z59.82']);
    expect(qmbDual.estimatedMonthlyClinicRevenueUsd).toBeCloseTo(152.25, 2);

    const blockedConflict = service.evaluateApcmAndSafetyNetBilling({
      chronicConditionCount: 2,
      isQmbEnrolled: false,
      hasModifier25OnBaseEm: true,
      billingCcmThisMonth: true
    });
    expect(blockedConflict.recommendedApcmCode).toBeNull();
    expect(blockedConflict.ccmExclusivityConflict).toBe(true);
    expect(blockedConflict.g2211AddOn.isEligible).toBe(false);
  });

  it('7. Synthesizes complete Medicare & safety-net billing assessment payload', () => {
    const assessment = service.assessMedicareBilling({
      annualRxCost: 3500,
      daysDeviceTransmitted: 18,
      clinicalMinutesLogged: 22,
      annualIncome: 15000,
      chronicConditionCount: 2,
      socialNeeds: ['food-insecurity']
    });

    expect(assessment.mppp.isCapped).toBe(true);
    expect(assessment.mppp.effectiveCapAmount).toBe(2100);
    expect(assessment.extraHelpMsp.mspTier).toBe('QMB');
    expect(assessment.apcmSafetyNet.recommendedApcmCode?.hcpcsCode).toBe('G0558');
    expect(assessment.rpmBillingCodes.filter(r => r.isCompliant).length).toBe(4);
    expect(assessment.actionableDirectives.length).toBeGreaterThanOrEqual(4);
  });
});
