import { TestBed } from '@angular/core/testing';
import { SoapNoteGeneratorService } from './soap-note-generator.service';
import { ClinicalCodingCopilotService } from './clinical-coding-copilot.service';
import { SnomedIcdCrosswalkService } from './snomed-icd-crosswalk.service';

describe('SoapNoteGeneratorService (Ambient Multimodal Clinical Scribe)', () => {
  let service: SoapNoteGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SoapNoteGeneratorService, ClinicalCodingCopilotService, SnomedIcdCrosswalkService]
    });
    service = TestBed.inject(SoapNoteGeneratorService);
  });

  it('should initialize with default cardiometabolic scenario and diarized turns', () => {
    expect(service.selectedScenarioId()).toBe('cardiometabolic');
    expect(service.diarizedTurns().length).toBeGreaterThan(0);
    expect(service.clinicianTurnCount()).toBeGreaterThan(0);
    expect(service.patientTurnCount()).toBeGreaterThan(0);
    expect(service.subjective()).toContain('Type 2 Diabetes');
    expect(service.assessment()).toContain('E11.40');
  });

  it('should load heart_failure scenario and update dialogue and SOAP note', () => {
    service.loadScenario('heart_failure');
    expect(service.selectedScenarioId()).toBe('heart_failure');
    expect(service.activeScribeTitle()).toContain('HFrEF');
    expect(service.subjective()).toContain('HFrEF');
    expect(service.assessment()).toContain('I50.22');
  });

  it('should load cognitive_decline scenario with caregiver dialogue turns', () => {
    service.loadScenario('cognitive_decline');
    expect(service.selectedScenarioId()).toBe('cognitive_decline');
    expect(service.caregiverTurnCount()).toBeGreaterThan(0);
    expect(service.assessment()).toContain('G30.9');
  });

  it('should add custom multi-speaker turns and synthesize structured SOAP note', () => {
    service.clearSession();
    expect(service.diarizedTurns().length).toBe(0);

    service.addTurn('CLINICIAN', 'Dr. Smith', 'How is your knee pain today?');
    service.addTurn('PATIENT', 'John Doe', 'Severe right knee stiffness when standing up.');
    service.addTurn('CLINICIAN', 'Dr. Smith', 'We will order right knee x-rays and prescribe physical therapy.');

    expect(service.totalTurns()).toBe(3);
    expect(service.subjective()).toContain('knee stiffness');
    expect(service.assessment()).toContain('Clinical impression');
  });

  it('should auto-audit and crosswalk SOAP note into multi-system codes and RVU calculations', () => {
    service.loadScenario('cardiometabolic');
    service.autoAuditAndCrosswalk();
    const report = service.codingAuditReport();
    expect(report).toBeTruthy();
    expect(report?.suggestions.length).toBeGreaterThan(0);
    expect(report?.totalWorkRvu).toBeGreaterThan(0);
    expect(report?.totalEstimatedReimbursement).toBeGreaterThan(0);
  });

  it('should toggle ambient scribing state and audio volume', () => {
    expect(service.isScribing()).toBe(false);
    service.startAmbientScribing();
    expect(service.isScribing()).toBe(true);
    expect(service.audioVolume()).toBeGreaterThan(0);

    service.stopAmbientScribing();
    expect(service.isScribing()).toBe(false);
    expect(service.audioVolume()).toBe(0);
  });

  it('should generate FHIR R4 DocumentReference bundle with LOINC 11506-3', () => {
    const fhirJson = service.generateFhirR4DocumentReference();
    const parsed = JSON.parse(fhirJson);
    expect(parsed.resourceType).toBe('Bundle');
    expect(parsed.type).toBe('document');
    expect(parsed.entry[0].resource.resourceType).toBe('DocumentReference');
    expect(parsed.entry[0].resource.type.coding[0].code).toBe('11506-3');
  });
});
