import { ResearchConsentService } from './research-consent.service';

describe('ResearchConsentService Suite', () => {
  let service: ResearchConsentService;

  beforeEach(() => {
    service = new ResearchConsentService();
  });

  it('1. Initializes with active certified disease cohorts and ethical open science models', () => {
    const cohorts = service.availableCohorts();
    expect(cohorts.length).toBeGreaterThanOrEqual(5);

    const diabetesCohort = cohorts.find(c => c.id === 'cohort_diabetes_cgm');
    expect(diabetesCohort).toBeDefined();
    expect(diabetesCohort?.ethicalFramework).toBe('nih_all_of_us');
    expect(diabetesCohort?.studyFundingModel).toBe('open_science_commons');
    expect(diabetesCohort?.grantEscrowStatus).toBe('pure_open_science');
    expect(diabetesCohort?.compensationPerQueryUsd).toBe(0.00);

    const oncologyCohort = cohorts.find(c => c.id === 'cohort_oncology_biomarkers');
    expect(oncologyCohort).toBeDefined();
    expect(oncologyCohort?.ethicalFramework).toBe('luna_dna_public_benefit');
    expect(oncologyCohort?.studyFundingModel).toBe('open_science_commons');
    expect(oncologyCohort?.compensationPerQueryUsd).toBe(0.00);
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

  it('4. Simulates accredited study query and records open science contribution without fabricating cash', () => {
    const initialContributions = service.totalContributionsCount();
    const initialFindings = service.scientificFindings().length;

    const entry = service.simulateDividendAccrual('cohort_diabetes_cgm', 'Mayo Clinic');
    expect(entry).not.toBeNull();
    expect(entry?.amountUsd).toBe(0.00);
    expect(entry?.status).toBe('open_science_contributed');
    expect(entry?.openScienceImpactScore).toBeGreaterThanOrEqual(90);

    expect(service.totalContributionsCount()).toBe(initialContributions + 1);
    expect(service.scientificFindings().length).toBe(initialFindings + 1);
    expect(service.grantEscrowBalance()).toBe(0.00);
  });

  it('5. Blocks unfunded cash out per Belmont Report & authorizes only verified grant escrow', () => {
    expect(service.grantEscrowBalance()).toBe(0.00);

    // Attempting cash out with zero escrow must fail per Belmont Report anti-inducement policy
    const unfundedPayout = service.requestCashOut();
    expect(unfundedPayout.success).toBe(false);
    expect(unfundedPayout.error).toContain('Belmont Report Compliance');

    // Deposit verified institutional grant escrow
    service.enrollment.update(curr => ({ ...curr, grantEscrowBalanceUsd: 100.00 }));
    expect(service.grantEscrowBalance()).toBe(100.00);

    const fundedPayout = service.requestCashOut();
    expect(fundedPayout.success).toBe(true);
    expect(fundedPayout.amountPaid).toBe(100.00);
    expect(fundedPayout.txId).toContain('strp_po_');
    expect(service.grantEscrowBalance()).toBe(0);

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

  it('7. Applies Laplace Differential Privacy to continuous biomarker telemetry', () => {
    const rawGlucose = 112.5;
    const perturbedValue1 = service.applyLaplaceDifferentialPrivacy(rawGlucose, 1.0, 0.8);
    const perturbedValue2 = service.applyLaplaceDifferentialPrivacy(rawGlucose, 1.0, 0.8);

    // Perturbation should return a valid finite number
    expect(typeof perturbedValue1).toBe('number');
    expect(Number.isFinite(perturbedValue1)).toBe(true);

    // Bounded divergence under Laplace mechanism (scale = 1/0.8 = 1.25, values rarely deviate > 20)
    expect(Math.abs(perturbedValue1 - rawGlucose)).toBeLessThan(30);
  });

  it('8. Evaluates linkage attack vulnerability and enforces quarantine on high-risk cohorts (k < 5)', () => {
    const safeCohort = service.availableCohorts()[0]; // k = 12
    const safeEval = service.evaluateLinkageAttackRisk(safeCohort);
    expect(safeEval.isQuarantined).toBe(false);
    expect(safeEval.riskTier).toBe('LOW');
    expect(safeEval.allowedForEgress).toBe(true);

    // Test artificial vulnerable cohort (k = 3)
    const vulnerableCohort = {
      ...safeCohort,
      id: 'cohort_vulnerable_rare',
      kAnonymityScore: 3
    };
    const quarantinedEval = service.evaluateLinkageAttackRisk(vulnerableCohort);
    expect(quarantinedEval.isQuarantined).toBe(true);
    expect(quarantinedEval.riskTier).toBe('CRITICAL_QUARANTINE');
    expect(quarantinedEval.allowedForEgress).toBe(false);
    expect(quarantinedEval.quarantineReason).toContain('k >= 5');
  });
});
