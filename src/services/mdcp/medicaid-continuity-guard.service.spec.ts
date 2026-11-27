import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { MedicaidContinuityGuardService } from './medicaid-continuity-guard.service';
import { StateRegionalCrosswalkService } from './state-regional-crosswalk.service';

describe('MedicaidContinuityGuardService Unit Suite', () => {
  let service: MedicaidContinuityGuardService;

  beforeEach(() => {
    const crosswalk = new StateRegionalCrosswalkService();
    const injector = Injector.create({
      providers: [{ provide: StateRegionalCrosswalkService, useValue: crosswalk }]
    });
    service = runInInjectionContext(injector, () => new MedicaidContinuityGuardService());
  });

  it('1. Flags URGENT Aid Paid Pending window before effective termination date and resolves state agency from crosswalk', () => {
    const pkg = service.evaluateContinuityAndQmbShield({
      stateCode: 'WA',
      beneficiaryName: 'Elena Alvarez',
      medicaidCaseId: 'WA-88219',
      referenceDateIso: '2026-11-27',
      effectiveTerminationDateIso: '2026-12-05',
      addressChangedRecently: true,
      hasStatePortalAccess: false
    });

    expect(pkg.stateCode).toBe('WA');
    expect(pkg.stateName).toBe('Washington');
    expect(pkg.urgencyLevel).toBe('URGENT_AID_PAID_PENDING');
    expect(pkg.aidPaidPendingEligible).toBe(true);
    expect(pkg.aidPaidPendingDeadlineIso).toBe('2026-12-04');
    expect(pkg.reinstatement90DayDeadlineIso).toBe('2027-03-05');
    expect(pkg.churnRiskScore).toBeGreaterThanOrEqual(80);
    expect(pkg.teaspoonChecklist.length).toBeLessThanOrEqual(4);
    expect(pkg.sha256IntegrityDigest.length).toBe(64);
  });

  it('2. Activates federal 90-day procedural reconsideration window after termination without requiring a new application', () => {
    const pkg = service.evaluateContinuityAndQmbShield({
      stateCode: 'OR',
      referenceDateIso: '2026-11-27',
      effectiveTerminationDateIso: '2026-10-15',
      isDsnpEnrolled: true
    });

    expect(pkg.urgencyLevel).toBe('REINSTATEMENT_90_DAY');
    expect(pkg.reinstatement90DayEligible).toBe(true);
    expect(pkg.aidPaidPendingEligible).toBe(false);
    expect(pkg.fairHearingOrReinstatementNotice).toContain('42 C.F.R. § 435.916(a)(3)(iii)');
    expect(pkg.fairHearingOrReinstatementNotice).toContain('D-SNP');
  });

  it('3. Detects illegal QMB balance billing and generates a federal cease-billing & refund demand letter', () => {
    const pkg = service.evaluateContinuityAndQmbShield({
      stateCode: 'CA',
      beneficiaryName: 'Marcus Chen',
      isDualEligibleQmb: true,
      providerBilledAmountUsd: 284.50,
      providerBillingEntity: 'Pacific Coast Cardiology Billing'
    });

    expect(pkg.qmbShield.isProtectedQmb).toBe(true);
    expect(pkg.qmbShield.unlawfulBalanceDetected).toBe(true);
    expect(pkg.qmbShield.unlawfulBalanceAmountUsd).toBe(284.5);
    expect(pkg.qmbShield.ceaseBillingDemandLetter).toContain('42 U.S.C. § 1396a(n)(3)(B)');
    expect(pkg.qmbShield.ceaseBillingDemandLetter).toContain('$284.50');
    expect(pkg.qmbShield.ceaseBillingDemandLetter).toContain('Pacific Coast Cardiology Billing');
    expect(pkg.teaspoonChecklist.some(step => step.includes('Do NOT pay'))).toBe(true);
  });

  it('4. Resolves legacy MDCP waiver keys (e.g. TEXAS_STAR_KIDS_MDCP) cleanly to two-letter state codes', () => {
    const pkg = service.evaluateContinuityAndQmbShield({
      stateCode: 'TEXAS_STAR_KIDS_MDCP',
      referenceDateIso: '2026-11-27',
      renewalDueDateIso: '2027-02-15'
    });

    expect(pkg.stateCode).toBe('TX');
    expect(pkg.stateName).toBe('Texas');
    expect(pkg.urgencyLevel).toBe('ROUTINE');
  });
});
