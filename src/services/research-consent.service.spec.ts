import { ResearchConsentService } from './research-consent.service';

describe('ResearchConsentService Suite', () => {
  let service: ResearchConsentService;

  beforeEach(() => {
    service = new ResearchConsentService();
  });

  it('1. Initializes with active certified disease cohorts and ethical models', () => {
    const cohorts = service.availableCohorts();
    expect(cohorts.length).toBeGreaterThanOrEqual(5);

    const diabetesCohort = cohorts.find(c => c.id === 'cohort_diabetes_cgm');
    expect(diabetesCohort).toBeDefined();
    expect(diabetesCohort?.ethicalFramework).toBe('nih_all_of_us');
    expect(diabetesCohort?.compensationPerQueryUsd).toBe(25.00);

    const oncologyCohort = cohorts.find(c => c.id === 'cohort_oncology_biomarkers');
    expect(oncologyCohort).toBeDefined();
    expect(oncologyCohort?.ethicalFramework).toBe('luna_dna_public_benefit');
    expect(oncologyCohort?.compensationPerQueryUsd).toBe(50.00);
  });

  it('2. Signs HIPAA § 164.508 Digital Research Authorization', () => {
    service.revokeAuthorizationAndPurge();
    expect(service.isHipaaAuthorized()).toBe(false);

    const sigHash = service.signHipaaAuthorization('Jane Doe');
    expect(service.isHipaaAuthorized()).toBe(true);
    expect(sigHash).toContain('sha256_');
    expect(service.enrollment().ethicalCharterAccepted).toBe(true);
  });

  it('3. Toggles disease cohort enrollment', () => {
    const cohortId = 'cohort_long_covid_autonomic';
    const initialEnrolled = service.isCohortEnrolled(cohortId);

    const nextState = service.toggleCohortEnrollment(cohortId);
    expect(nextState).toBe(!initialEnrolled);
    expect(service.isCohortEnrolled(cohortId)).toBe(nextState);

    // Toggle back
    service.toggleCohortEnrollment(cohortId);
    expect(service.isCohortEnrolled(cohortId)).toBe(initialEnrolled);
  });

  it('4. Simulates accredited study query and accrues data dividend revenue share', () => {
    const initialEarnings = service.lifetimeEarnings();
    const initialBalance = service.availableBalance();

    const entry = service.simulateDividendAccrual('cohort_diabetes_cgm', 'Mayo Clinic');
    expect(entry).not.toBeNull();
    expect(entry?.amountUsd).toBe(25.00);
    expect(entry?.patientRevenueSharePercent).toBe(85);

    expect(service.lifetimeEarnings()).toBe(initialEarnings + 25.00);
    expect(service.availableBalance()).toBe(initialBalance + 25.00);
  });

  it('5. Requests cash out via Stripe Connect and zeroes available balance', () => {
    expect(service.availableBalance()).toBeGreaterThan(0);

    const payout = service.requestCashOut();
    expect(payout.success).toBe(true);
    expect(payout.amountPaid).toBeGreaterThan(0);
    expect(payout.txId).toContain('strp_po_');
    expect(service.availableBalance()).toBe(0);

    // Further payout request with zero balance should fail
    const secondPayout = service.requestCashOut();
    expect(secondPayout.success).toBe(false);
  });

  it('6. Revokes authorization, wipes active enrollments, and disables sharing', () => {
    service.revokeAuthorizationAndPurge();
    expect(service.isHipaaAuthorized()).toBe(false);
    expect(service.enrolledCohortCount()).toBe(0);

    // Query simulation should return null if not authorized
    const entry = service.simulateDividendAccrual('cohort_diabetes_cgm', 'Stanford Medicine');
    expect(entry).toBeNull();
  });
});
