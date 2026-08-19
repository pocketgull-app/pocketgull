import { TestBed } from '@angular/core/testing';
import { AdaptiveIntakeService } from './adaptive-intake.service';
import { PatientStateService } from './patient-state.service';
import { SnomedIcdCrosswalkService } from './snomed-icd-crosswalk.service';

describe('AdaptiveIntakeService Unit Suite', () => {
  let service: AdaptiveIntakeService;
  let patientState: PatientStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdaptiveIntakeService,
        PatientStateService,
        SnomedIcdCrosswalkService
      ]
    });
    service = TestBed.inject(AdaptiveIntakeService);
    patientState = TestBed.inject(PatientStateService);
  });

  it('1. Returns empty analysis result gracefully when given empty or whitespace narrative', () => {
    const res = service.parseNarrative('');
    expect(res.chiefConcern).toBe('No narrative provided');
    expect(res.extractedEntities.length).toBe(0);
    expect(res.socraticQuestions.length).toBe(0);
    expect(res.redFlagAlerts.length).toBe(0);
  });

  it('2. Extracts developer ergonomic & tech executive strain entities with SNOMED-CT and ICD-10 mappings', () => {
    const narrative = 'I have been coding for 10 hours a day for 3 weeks. Intense neck stiffness, wrist pain and hand tingling, dry eye strain from my monitor, and overwhelming burnout.';
    const res = service.parseNarrative(narrative, { occupation: 'Software Architect' });

    expect(res.extractedEntities.length).toBeGreaterThanOrEqual(4);

    const neck = res.extractedEntities.find(e => e.snomedCode === '81680005');
    expect(neck).toBeDefined();
    expect(neck?.icd10Code).toBe('M54.2');

    const carpal = res.extractedEntities.find(e => e.snomedCode === '4384001');
    expect(carpal).toBeDefined();
    expect(carpal?.icd10Code).toBe('G56.00');

    const eye = res.extractedEntities.find(e => e.snomedCode === '33776007');
    expect(eye).toBeDefined();
    expect(eye?.icd10Code).toBe('H53.149');

    const burnout = res.extractedEntities.find(e => e.snomedCode === '225444004');
    expect(burnout).toBeDefined();
    expect(burnout?.icd10Code).toBe('Z73.0');

    expect(res.duration).toBe('3 weeks');
  });

  it('3. Generates Calgary-Cambridge FIFE Socratic questions with patient and clinician perspectives', () => {
    const narrative = 'Chronic lower back stiffness and severe afternoon fatigue interfering with workouts.';
    const res = service.parseNarrative(narrative);

    expect(res.socraticQuestions.length).toBeGreaterThanOrEqual(3);

    const functionQ = res.socraticQuestions.find(q => q.category === 'FIFE_Function');
    expect(functionQ).toBeDefined();
    expect(functionQ?.questionPatient).toContain('what is the #1 activity or hobby');
    expect(functionQ?.questionClinician).toContain('functional impairment');
    expect(functionQ?.quickOptions?.length).toBeGreaterThan(0);

    const ideasQ = res.socraticQuestions.find(q => q.category === 'FIFE_Ideas');
    expect(ideasQ).toBeDefined();
    expect(ideasQ?.questionPatient).toContain('what have you noticed seems to trigger');

    const expectationsQ = res.socraticQuestions.find(q => q.category === 'FIFE_Expectations');
    expect(expectationsQ).toBeDefined();
    expect(expectationsQ?.questionPatient).toContain('4 weeks from today');
  });

  it('4. Detects acute red flags and generates immediate safety questions', () => {
    const cardiacNarrative = 'Sudden crushing chest pain radiating to left arm and gasping for air.';
    const cardiacRes = service.parseNarrative(cardiacNarrative);

    expect(cardiacRes.redFlagAlerts.length).toBeGreaterThanOrEqual(2);
    expect(cardiacRes.redFlagAlerts.some(f => f.includes('Cardiac'))).toBe(true);
    expect(cardiacRes.redFlagAlerts.some(f => f.includes('Respiratory'))).toBe(true);

    const safetyQ = cardiacRes.socraticQuestions.find(q => q.category === 'Safety_RedFlag');
    expect(safetyQ).toBeDefined();
    expect(safetyQ?.importance).toBe('critical');

    const psychNarrative = 'Feeling completely hopeless and having thoughts of suicide.';
    const psychRes = service.parseNarrative(psychNarrative);
    expect(psychRes.redFlagAlerts.some(f => f.includes('988'))).toBe(true);
    expect(psychRes.recommendedAssessments).toContain('C-SSRS (Columbia Suicide Severity Screen)');
  });

  it('5. Generates empowering questions for the patient to ask their doctor', () => {
    const narrative = 'Daily screen fatigue, sore wrists, and wanting to check if my diet is causing inflammation.';
    const res = service.parseNarrative(narrative);

    expect(res.doctorQuestions.length).toBeGreaterThanOrEqual(3);
    const rootCauseQ = res.doctorQuestions.find(q => q.id === 'doc_q_1');
    expect(rootCauseQ?.question).toContain('underlying root cause');
    expect(rootCauseQ?.contextWhy).toBeDefined();

    const ergoQ = res.doctorQuestions.find(q => q.id === 'doc_q_ergo');
    expect(ergoQ?.question).toContain('ergonomics');
  });

  it('6. Deduces appropriate recommended clinical assessment instruments', () => {
    const narrative = 'Severe neck strain, insomnia, and housing instability.';
    const res = service.parseNarrative(narrative);

    expect(res.recommendedAssessments).toContain('NDI (Neck Disability Index)');
    expect(res.recommendedAssessments).toContain('ISI (Insomnia Severity Index)');
    expect(res.recommendedAssessments).toContain('PRAPARE (Social Determinants of Health)');
  });

  it('7. Applies parsed intake findings to centralized PatientStateService', () => {
    const initialNotesCount = patientState.clinicalNotes().length;
    const narrative = 'Intense neck pain and right wrist numbness after long programming sessions.';
    const res = service.parseNarrative(narrative);

    service.applyIntakeToPatientState(res);

    const updatedNotes = patientState.clinicalNotes();
    expect(updatedNotes.length).toBe(initialNotesCount + 1);
    expect(updatedNotes[0].text).toContain('Adaptive Socratic Intake');

    const issues = patientState.issues();
    expect(issues['head']).toBeDefined();
    expect(issues['head'][0].symptoms[0]).toContain('Cervicalgia');
    expect(issues['r_hand']).toBeDefined();
    expect(issues['r_hand'][0].symptoms[0]).toContain('Carpal Tunnel');
  });
});
