import { TestBed } from '@angular/core/testing';
import { ClinicalContextModeService, ClinicalPersonaMode } from './clinical-context-mode.service';

describe('ClinicalContextModeService', () => {
  let service: ClinicalContextModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClinicalContextModeService]
    });
    service = TestBed.inject(ClinicalContextModeService);
  });

  it('should initialize with patient_family as the default persona mode', () => {
    expect(service.activeMode()).toBe('patient_family');
    expect(service.currentConfig().label).toBe('Patient & Family Sanctuary');
    expect(service.currentConfig().icon).toBe('🌿');
  });

  it('should switch modes and update currentConfig reactively', () => {
    service.setMode('school_safety');
    expect(service.activeMode()).toBe('school_safety');
    expect(service.currentConfig().label).toContain('School Nurse');
    expect(service.currentConfig().accentColor).toBe('amber');

    service.setMode('executive_governance');
    expect(service.activeMode()).toBe('executive_governance');
    expect(service.currentConfig().label).toContain('Steering Committee');

    service.setMode('clinical_specialist');
    expect(service.activeMode()).toBe('clinical_specialist');
    expect(service.currentConfig().label).toContain('Attending Clinician');
  });

  it('should infer persona mode accurately from natural language directives', () => {
    expect(service.inferModeFromSpeech('Please show the substitute teacher emergency card for school')).toBe('school_safety');
    expect(service.inferModeFromSpeech('Pull up the FDA 520o steering committee audit')).toBe('executive_governance');
    expect(service.inferModeFromSpeech('Run a multi-hop GraphQL query for Cochrane trials')).toBe('clinical_specialist');
    expect(service.inferModeFromSpeech('Take me back home')).toBe('patient_family');
  });
});
