import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BedsideInterpreterModalComponent } from './bedside-interpreter-modal.component';
import { PatientStateService } from '../../services/patient-state.service';
import { PatientManagementService } from '../../services/patient-management.service';
import { ClinicalIntelligenceService } from '../../services/clinical-intelligence.service';
import { DictationService } from '../../services/dictation.service';

describe('BedsideInterpreterModalComponent', () => {
  let component: BedsideInterpreterModalComponent;
  let mockPatientState: any;
  let mockPatientMgmt: any;
  let mockIntelligence: any;
  let mockDictation: any;

  beforeEach(() => {
    mockPatientState = {
      getCurrentState: vi.fn().mockReturnValue({}),
      activePatientProfile: signal({ name: 'Frida Kahlo', age: 47 })
    };
    mockPatientMgmt = {
      selectedPatient: signal({ name: 'Frida Kahlo', age: 47 }),
      selectedPatientId: signal('p_frida_kahlo')
    };
    mockIntelligence = {
      isLoading: signal(false)
    };
    mockDictation = {
      isListening: signal(false),
      transcript: signal(''),
      startListening: vi.fn(),
      stopListening: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: PatientManagementService, useValue: mockPatientMgmt },
        { provide: ClinicalIntelligenceService, useValue: mockIntelligence },
        { provide: DictationService, useValue: mockDictation },
        BedsideInterpreterModalComponent
      ]
    });

    component = runInInjectionContext(injector, () => injector.get(BedsideInterpreterModalComponent));
  });

  it('1. Initializes cleanly with target language for Frida Kahlo (Spanish)', () => {
    expect(component).toBeTruthy();
    component.ngOnInit();
    expect(component.targetLanguageCode).toBe('es-US');
    expect(component.utterances().length).toBeGreaterThan(0);
    expect(component.targetLanguageLabel()).toContain('Español');
  });

  it('2. Submits a clinician utterance and creates bilingual pair', async () => {
    component.ngOnInit();
    const initialCount = component.utterances().length;
    component.clinicianInputText = 'Are you experiencing any chest pain or difficulty breathing?';
    await component.submitClinicianUtterance();

    expect(component.utterances().length).toBe(initialCount + 1);
    const lastUtterance = component.utterances()[component.utterances().length - 1];
    expect(lastUtterance.speaker).toBe('clinician');
    expect(lastUtterance.sourceText).toContain('difficulty breathing');
    expect(lastUtterance.translatedText).toBeTruthy();
    expect(lastUtterance.clinicalKeywords).toContain('Respiratory');
  });

  it('3. Simulates patient response in target language with English translation', () => {
    component.ngOnInit();
    const initialCount = component.utterances().length;
    component.simulatePatientResponse();

    expect(component.utterances().length).toBe(initialCount + 1);
    const last = component.utterances()[component.utterances().length - 1];
    expect(last.speaker).toBe('patient');
    expect(last.sourceText).toBeTruthy();
    expect(last.translatedText).toBeTruthy();
  });

  it('4. Exports FHIR R4 bilingual communication transcript', () => {
    component.ngOnInit();
    const fhirBundle = component.exportFhirCommunicationBundle();
    expect(fhirBundle).toBeDefined();
    expect(fhirBundle.resourceType).toBe('Bundle');
    expect(fhirBundle.entry.length).toBeGreaterThanOrEqual(1);
    expect(fhirBundle.entry[0].resource.resourceType).toBe('Communication');
  });

  it('5. Emits close event when close output is triggered', () => {
    let closed = false;
    component.close.subscribe(() => { closed = true; });
    component.close.emit();
    expect(closed).toBe(true);
  });
});
