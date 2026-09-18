import { ResearchDataDividendComponent } from './research-data-dividend.component';
import { ResearchConsentService } from '../services/research-consent.service';

describe('ResearchDataDividendComponent Suite', () => {
  let component: ResearchDataDividendComponent;
  let service: ResearchConsentService;

  beforeEach(() => {
    service = new ResearchConsentService();
    component = new ResearchDataDividendComponent(service);
  });

  it('1. Initializes cleanly with ethical research governance state and zero cash liability', () => {
    expect(component).toBeTruthy();
    expect(component.researchService.isHipaaAuthorized()).toBe(true);
    expect(component.researchService.availableCohorts().length).toBeGreaterThanOrEqual(5);
    expect(component.researchService.grantEscrowBalance()).toBe(0.00);
    expect(component.researchService.isPureOpenScience()).toBe(true);
    expect(component.activeTab()).toBe('cohorts');
  });

  it('2. Exposes all available disease cohorts with open science models and Belmont safeguards', () => {
    const cohorts = component.researchService.availableCohorts();
    const diabetes = cohorts.find(c => c.id === 'cohort_diabetes_cgm');
    expect(diabetes).toBeDefined();
    expect(diabetes?.compensationPerQueryUsd).toBe(0.00);
    expect(diabetes?.studyFundingModel).toBe('open_science_commons');
    expect(diabetes?.grantEscrowStatus).toBe('pure_open_science');
    expect(diabetes?.ethicalFramework).toBe('nih_all_of_us');
  });

  it('3. Toggles disease cohort enrollment via component method', () => {
    const cohortId = 'cohort_oncology_biomarkers';
    const wasEnrolled = service.isCohortEnrolled(cohortId);

    component.toggleCohort(cohortId);
    expect(service.isCohortEnrolled(cohortId)).toBe(!wasEnrolled);
  });

  it('4. Simulates open science query and unlocks scientific findings without cash fabrication', () => {
    const initialContributions = service.totalContributionsCount();
    const initialFindings = service.scientificFindings().length;

    component.simulateResearchQuery();

    expect(service.totalContributionsCount()).toBeGreaterThan(initialContributions);
    expect(service.scientificFindings().length).toBeGreaterThan(initialFindings);
    expect(service.grantEscrowBalance()).toBe(0.00);
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

  it('8. Enforces Belmont Report (45 CFR § 46) zero cash liability and exports research dossier', () => {
    expect(component.researchService.grantEscrowBalance()).toBe(0.00);
    expect(component.researchService.isPureOpenScience()).toBe(true);

    const attestation = component.researchService.getBelmontCharterAttestation();
    expect(attestation.isNonCommercial).toBe(true);
    expect(attestation.grantEscrowBalanceUsd).toBe(0.00);
    expect(attestation.framework).toContain('Belmont Report');

    component.exportResearchDossier();
    expect(component.showDossierExportNotice()).toBe(true);
  });

  it('9. Returns 100% scientific discoveries and biomarker insights to participating patient', () => {
    const findings = component.researchService.scientificFindings();
    expect(findings.length).toBeGreaterThanOrEqual(4);
    expect(findings[0]).toContain('reduction in nocturnal hypoglycemia');
    expect(component.researchService.lifetimeEarnings()).toBe(0.00);
    expect(component.researchService.availableBalance()).toBe(0.00);
  });
});

