import { ResearchDataDividendComponent } from './research-data-dividend.component';
import { ResearchConsentService } from '../services/research-consent.service';

describe('ResearchDataDividendComponent Suite', () => {
  let component: ResearchDataDividendComponent;
  let service: ResearchConsentService;

  beforeEach(() => {
    service = new ResearchConsentService();
    component = new ResearchDataDividendComponent(service);
  });

  it('1. Initializes cleanly with ethical research governance state', () => {
    expect(component).toBeTruthy();
    expect(component.researchService.isHipaaAuthorized()).toBe(true);
    expect(component.researchService.availableCohorts().length).toBeGreaterThanOrEqual(5);
    expect(component.activeTab()).toBe('cohorts');
  });

  it('2. Exposes all available disease cohorts with compensation rates and ethical models', () => {
    const cohorts = component.researchService.availableCohorts();
    const diabetes = cohorts.find(c => c.id === 'cohort_diabetes_cgm');
    expect(diabetes).toBeDefined();
    expect(diabetes?.compensationPerQueryUsd).toBe(25.00);
    expect(diabetes?.ethicalFramework).toBe('nih_all_of_us');
  });

  it('3. Toggles disease cohort enrollment via component method', () => {
    const cohortId = 'cohort_oncology_biomarkers';
    const wasEnrolled = service.isCohortEnrolled(cohortId);

    component.toggleCohort(cohortId);
    expect(service.isCohortEnrolled(cohortId)).toBe(!wasEnrolled);
  });

  it('4. Simulates research query and updates ledger', () => {
    const initialLifetime = service.lifetimeEarnings();
    component.simulateResearchQuery();

    expect(service.lifetimeEarnings()).toBeGreaterThan(initialLifetime);
  });

  it('5. Handles revocation and re-authorization cleanly', () => {
    component.revokeConsent();
    expect(service.isHipaaAuthorized()).toBe(false);

    component.signConsent();
    expect(service.isHipaaAuthorized()).toBe(true);
  });

  it('6. Switches to BigQuery Analytics Hub tab and inspects Google Cloud data exchange listings', () => {
    component.activeTab.set('analytics_hub');
    expect(component.activeTab()).toBe('analytics_hub');

    const listings = component.researchService.analyticsHubListings();
    expect(listings.length).toBeGreaterThanOrEqual(3);

    const diabetesListing = listings.find(l => l.category === 'metabolic_endocrine');
    expect(diabetesListing).toBeDefined();
    expect(diabetesListing?.project).toBe('gen-lang-client-0540208645');
    expect(diabetesListing?.dataExchangeId).toBe('pocketgull_data_exchange');
    expect(diabetesListing?.differentialPrivacyBudget.epsilon).toBe(0.8);
    expect(diabetesListing?.kAnonymityScore).toBe(12);
  });

  it('7. Runs BigQuery privacy-preserving dry-run with Laplace perturbation', () => {
    const listing = component.researchService.analyticsHubListings()[0];
    component.runDryRun(listing);

    const result = component.dryRunResult();
    expect(result).not.toBeNull();
    expect(result?.isValid).toBe(true);
    expect(result?.sql).toContain('pocketgull_data_exchange');
    expect(result?.differentialPrivacyEpsilonConsumed).toBeLessThanOrEqual(0.8);
    expect(result?.perturbedAggregateSample).toBeDefined();

    const metricEntries = component.getMetricEntries(result!.perturbedAggregateSample);
    expect(metricEntries.length).toBeGreaterThan(0);
    metricEntries.forEach(m => expect(typeof m.val).toBe('number'));
  });

  it('8. Executes automated Stripe Connect Express payout under standard threshold', async () => {
    vi.useFakeTimers();
    expect(component.researchService.availableBalance()).toBe(50.00);

    component.cashOut();
    expect(component.isProcessingPayout()).toBe(true);

    vi.advanceTimersByTime(650);

    expect(component.isProcessingPayout()).toBe(false);
    expect(component.researchService.availableBalance()).toBe(0);
    expect(component.latestPayout()).not.toBeNull();
    expect(component.latestPayout()?.destinationAccountMasked).toContain('acct_');
    expect(component.latestPayout()?.arrivalEstimate).toContain('Instant Transfer');
    vi.useRealTimers();
  });

  it('9. Enforces Mandiant dual-custody verification modal when cashing out >= $500', async () => {
    vi.useFakeTimers();
    // Simulate high balance
    service.enrollment.update(curr => ({ ...curr, availableBalanceUsd: 1250.00 }));
    expect(component.researchService.availableBalance()).toBe(1250.00);

    // Initial click should open dual custody modal instead of immediately transferring
    component.cashOut();
    expect(component.showDualCustodyModal()).toBe(true);

    // Confirm dual custody
    component.dualCustodyPrimary = 'Dr. Beverly Crusher, CMO';
    component.dualCustodySecondary = 'Commander Riker, VP Compliance';
    component.confirmDualCustodyCashOut();

    expect(component.showDualCustodyModal()).toBe(false);
    expect(component.isProcessingPayout()).toBe(true);

    vi.advanceTimersByTime(650);

    expect(component.isProcessingPayout()).toBe(false);
    expect(component.researchService.availableBalance()).toBe(0);
    expect(component.latestPayout()?.dualCustodyAttestation?.isAttested).toBe(true);
    expect(component.latestPayout()?.dualCustodyAttestation?.primarySigner).toBe('Dr. Beverly Crusher, CMO');
    expect(component.latestPayout()?.dualCustodyAttestation?.secondarySigner).toBe('Commander Riker, VP Compliance');
    vi.useRealTimers();
  });
});
