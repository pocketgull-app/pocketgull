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
});
