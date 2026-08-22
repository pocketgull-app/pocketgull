import '@angular/compiler';
import { NOf1EngineService } from './n-of-1-engine.service';
import { IPatient } from './patient.types';

describe('NOf1EngineService - Personalized Single-Case Crossover Trial Suite', () => {
  let service: NOf1EngineService;

  const mockPatient: IPatient = {
    id: 'p001',
    name: 'Homo Sapiens (Male, Metabolic Syndrome, 58y)',
    age: 58,
    gender: 'Male',
    lastVisit: '2026-08-19',
    preexistingConditions: ['Essential Hypertension', 'Type 2 Diabetes'],
    history: [],
    bookmarks: [],
    issues: {},
    patientGoals: '',
    medications: [],
    dietarySupplements: [],
    vitals: { bp: '152/95', hr: '88', spO2: '94%', temp: '36.6', weight: '82', height: '175' }
  };

  beforeEach(() => {
    service = new NOf1EngineService();
  });

  it('1. Computes Cohen’s d effect size and categorizes magnitude as large/very large', () => {
    const baseline = [150, 152, 149, 151, 153];
    const intervention = [132, 130, 128, 134, 131];

    const result = service.calculateCohensD(baseline, intervention);
    expect(result.d).toBeLessThan(-2.0);
    expect(result.magnitude).toBe('VERY_LARGE');
  });

  it('2. Computes Bayesian posterior probability of superiority', () => {
    const baseline = [150, 152, 149, 151, 153];
    const intervention = [132, 130, 128, 134, 131];

    const bayesProb = service.calculateBayesianSuperiority(baseline, intervention, true);
    expect(bayesProb).toBeGreaterThanOrEqual(95.0);
  });

  it('3. Generates complete 56-day ABAB reversal trial plan with 4 phase blocks and FHIR ResearchStudy', () => {
    const trial = service.generateNOf1Trial(mockPatient);
    expect(trial.totalDurationDays).toBe(56);
    expect(trial.phases.length).toBe(4);
    expect(trial.designType).toBe('ABAB_REVERSAL');
    expect(trial.results[0].isStatisticallySignificant).toBe(true);
    expect(trial.fhirResearchStudyResource['resourceType']).toBe('ResearchStudy');
  });
});
