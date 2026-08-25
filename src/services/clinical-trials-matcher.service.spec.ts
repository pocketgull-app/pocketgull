import '@angular/compiler';
import { ClinicalTrialsMatcherService } from './clinical-trials-matcher.service';
import { IPatient } from './patient.types';

describe('ClinicalTrialsMatcherService - ClinicalTrials.gov Matching Suite', () => {
  let service: ClinicalTrialsMatcherService;

  const mockPostpartumPatient: IPatient = {
    id: 'p007',
    name: 'Homo Sapiens (Female, 4th-Trimester Postpartum, 29y)',
    age: 29,
    gender: 'Female',
    lastVisit: '2026-08-19',
    history: [],
    bookmarks: [],
    issues: {},
    patientGoals: '',
    medications: [],
    dietarySupplements: [],
    vitals: { bp: '120/80', hr: '72', spO2: '99%', temp: '36.6', weight: '65', height: '168' },
    preexistingConditions: ['Postpartum Mood Disturbance', 'Perinatal Anxiety']
  };

  const mockMetabolicPatient: IPatient = {
    id: 'p001',
    name: 'Homo Sapiens (Male, Metabolic Syndrome, 58y)',
    age: 58,
    gender: 'Male',
    lastVisit: '2026-08-19',
    history: [],
    bookmarks: [],
    issues: {},
    patientGoals: '',
    medications: [],
    dietarySupplements: [],
    vitals: { bp: '148/94', hr: '76', spO2: '98%', temp: '36.6', weight: '82', height: '175' },
    preexistingConditions: ['Type 2 Diabetes', 'Essential Hypertension']
  };

  beforeEach(() => {
    service = new ClinicalTrialsMatcherService();
  });

  it('1. Matches postpartum vagal biofeedback trial for postpartum patient with high confidence score', () => {
    const report = service.matchTrialsForPatient(mockPostpartumPatient, 50);
    expect(report.totalMatchesFound).toBeGreaterThanOrEqual(1);

    const topMatch = report.matches[0];
    expect(topMatch.nctId).toBe('NCT06129845');
    expect(topMatch.briefTitle).toContain('Vagal Entrainment');
    expect(topMatch.matchConfidenceScore).toBeGreaterThanOrEqual(95);
  });

  it('2. Matches NIDDK precision metabolic trial for diabetic hypertensive patient', () => {
    const report = service.matchTrialsForPatient(mockMetabolicPatient, 50);
    const metabolicMatch = report.matches.find(m => m.nctId === 'NCT05984112');
    expect(metabolicMatch).toBeDefined();
    expect(metabolicMatch?.phase).toBe('Phase 3');
    expect(metabolicMatch?.sponsor).toContain('NIDDK');
  });

  it('3. Generates valid FHIR R4 ResearchStudy collection bundle', () => {
    const report = service.matchTrialsForPatient(mockMetabolicPatient, 50);
    const fhir = report.fhirResearchStudyBundle;
    expect(fhir['resourceType']).toBe('Bundle');
    expect((fhir['entry'] as any[]).length).toBe(report.totalMatchesFound);
    expect((fhir['entry'] as any[])[0].resource.resourceType).toBe('ResearchStudy');
  });
});
