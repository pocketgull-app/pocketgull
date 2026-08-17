import { TestBed } from '@angular/core/testing';
import { SoapNoteGeneratorComponent } from './soap-note-generator.component';
import { SoapNoteGeneratorService } from '../services/soap-note-generator.service';
import { ClinicalCodingCopilotService } from '../services/clinical-coding-copilot.service';
import { SnomedIcdCrosswalkService } from '../services/snomed-icd-crosswalk.service';

describe('SoapNoteGeneratorComponent (Ambient Clinical Scribe Workstation)', () => {
  let component: SoapNoteGeneratorComponent;
  let service: SoapNoteGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SoapNoteGeneratorComponent],
      providers: [SoapNoteGeneratorService, ClinicalCodingCopilotService, SnomedIcdCrosswalkService]
    });
    service = TestBed.inject(SoapNoteGeneratorService);
    const fixture = TestBed.createComponent(SoapNoteGeneratorComponent);
    component = fixture.componentInstance;
  });

  it('should initialize and display active scenario dialogue turns', () => {
    expect(service.selectedScenarioId()).toBe('cardiometabolic');
    expect(service.diarizedTurns().length).toBeGreaterThan(0);
    expect(service.subjective()).toBeTruthy();
    expect(service.objective()).toBeTruthy();
  });

  it('should toggle ambient scribing state', () => {
    expect(service.isScribing()).toBe(false);
    component.toggleScribing();
    expect(service.isScribing()).toBe(true);
    component.toggleScribing();
    expect(service.isScribing()).toBe(false);
  });

  it('should submit manual dialogue turn and update transcript feed', () => {
    const initialTurns = service.totalTurns();
    component.manualSpeaker = 'PATIENT';
    component.manualSpeakerName = 'Test Patient';
    component.manualTurnText = 'My left ankle is swollen.';
    component.submitManualTurn();

    expect(service.totalTurns()).toBe(initialTurns + 1);
    expect(component.manualTurnText).toBe('');
  });

  it('should copy note to clipboard without error', () => {
    component.copyNoteToClipboard();
    expect(component.copied()).toBe(true);
  });

  it('should trigger FHIR R4 Bundle and Transcript downloads without error', () => {
    expect(() => component.downloadFhirBundle()).not.toThrow();
    expect(() => component.downloadTranscript()).not.toThrow();
  });
});
