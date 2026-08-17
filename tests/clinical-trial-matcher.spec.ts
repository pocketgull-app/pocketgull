import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { ClinicalTrialMatcherService, IClinicalTrialMatch } from '../src/services/clinical-trial-matcher.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ClinicalTrialMatcherService & Eligibility Scoring Suite', () => {
  let service: ClinicalTrialMatcherService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ClinicalTrialMatcherService
      ]
    });
    service = TestBed.inject(ClinicalTrialMatcherService);
  });

  it('1. Searches mock trial catalog for Parkinson Disease correctly', () => {
    const matches = service.searchClinicalTrials({ conditionName: 'Parkinson Disease' });
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].nctId).toBe('NCT05214789');
    expect(matches[0].phase).toBe('Phase 3');
    expect(matches[0].overallStatus).toBe('RECRUITING');
  });

  it('2. Dynamically generates tailored clinical trial match for rare condition', () => {
    const matches = service.searchClinicalTrials({ conditionName: 'Amyotrophic Lateral Sclerosis' });
    expect(matches.length).toBe(1);
    expect(matches[0].condition).toBe('Amyotrophic Lateral Sclerosis');
    expect(matches[0].nctId).toMatch(/^NCT0\d+/);
    expect(matches[0].overallStatus).toBe('RECRUITING');
  });

  it('3. Computes eligibility score with positive age and gender alignment', () => {
    const trial: IClinicalTrialMatch = {
      nctId: 'NCT05214789',
      title: 'Targeted Parkinson Trial',
      condition: 'Parkinson Disease',
      phase: 'Phase 3',
      overallStatus: 'RECRUITING',
      interventionName: 'Test Interventional Agent',
      leadSponsor: 'Stanford Medicine',
      eligibilitySummary: 'Adults age 40-75',
      minAge: '40 Years',
      maxAge: '75 Years',
      sex: 'ALL',
      matchScorePercent: 90,
      clinicalTrialsGovUrl: 'https://clinicaltrials.gov/study/NCT05214789'
    };

    const assessment = service.computeEligibilityMatch(
      { age: 52, gender: 'Female', conditions: ['Parkinson Disease'] },
      trial
    );

    expect(assessment.isEligible).toBe(true);
    expect(assessment.scorePercent).toBeGreaterThanOrEqual(90);
    expect(assessment.warnings.length).toBe(0);
    expect(assessment.criteriaMet.some(c => c.includes('Patient Age (52y)'))).toBe(true);
  });

  it('4. Computes eligibility penalty and warnings when age is below minimum', () => {
    const trial: IClinicalTrialMatch = {
      nctId: 'NCT04892301',
      title: 'Adult Alzheimer Trial',
      condition: 'Alzheimer Disease',
      phase: 'Phase 2',
      overallStatus: 'RECRUITING',
      interventionName: 'TauClear',
      leadSponsor: 'Mayo Clinic',
      eligibilitySummary: 'Patients age 55-85',
      minAge: '55 Years',
      maxAge: '85 Years',
      sex: 'ALL',
      matchScorePercent: 92,
      clinicalTrialsGovUrl: 'https://clinicaltrials.gov/study/NCT04892301'
    };

    const assessment = service.computeEligibilityMatch(
      { age: 34, gender: 'Male', conditions: ['Alzheimer Disease'] },
      trial
    );

    expect(assessment.isEligible).toBe(false);
    expect(assessment.warnings.length).toBeGreaterThan(0);
    expect(assessment.warnings[0]).toContain('below minimum trial entry age (55y)');
  });

  it('5. Serializes compliant FHIR R4 Bundle containing ResearchSubject and ResearchStudy', () => {
    const trial: IClinicalTrialMatch = {
      nctId: 'NCT05214789',
      title: 'Phase 3 Parkinson Trial',
      condition: 'Parkinson Disease',
      phase: 'Phase 3',
      overallStatus: 'RECRUITING',
      interventionName: 'L-DOPA Nanoparticle',
      leadSponsor: 'Stanford Neurological Research Institute',
      eligibilitySummary: 'Adults age 40-75',
      matchScorePercent: 96,
      clinicalTrialsGovUrl: 'https://clinicaltrials.gov/study/NCT05214789'
    };

    const bundle = service.generateFhirResearchSubjectBundle('p001', trial);

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('transaction');
    expect(bundle.entry.length).toBe(2);

    const rs = bundle.entry[0].resource;
    expect(rs.resourceType).toBe('ResearchSubject');
    expect(rs.status).toBe('candidate');
    expect(rs.individual.reference).toBe('Patient/p001');

    const study = bundle.entry[1].resource;
    expect(study.resourceType).toBe('ResearchStudy');
    expect(study.id).toBe('NCT05214789');
    expect(study.sponsor.display).toBe('Stanford Neurological Research Institute');
  });
});
