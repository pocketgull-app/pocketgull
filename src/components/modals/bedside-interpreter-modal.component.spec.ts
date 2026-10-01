import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BedsideInterpreterModalComponent } from './bedside-interpreter-modal.component';
import { PatientStateService } from '../../services/patient-state.service';
import { PatientManagementService } from '../../services/patient-management.service';
import { ClinicalIntelligenceService } from '../../services/clinical-intelligence.service';
import { DictationService } from '../../services/dictation.service';
import { AdkLiveService } from '../../services/ai/adk-live.service';

describe('BedsideInterpreterModalComponent', () => {
  let component: BedsideInterpreterModalComponent;
  let mockPatientState: any;
  let mockPatientMgmt: any;
  let mockIntelligence: any;
  let mockDictation: any;
  let mockAdkLive: any;

  beforeEach(() => {
    mockPatientState = {
      getCurrentState: vi.fn().mockReturnValue({}),
      activePatientProfile: signal({ name: 'Frida Kahlo', age: 47 }),
      addClinicalNote: vi.fn()
    };
    mockPatientMgmt = {
      selectedPatient: signal({ name: 'Frida Kahlo', age: 47, id: 'p_frida_kahlo' }),
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
    mockAdkLive = {
      isConnected: signal(false),
      isListening: signal(false),
      volumeLevel: signal(0),
      latencyMs: signal(140),
      selectedVoice: signal('Aoede'),
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn(),
      startListening: vi.fn(),
      stopListening: vi.fn(),
      simulateLiveStreamResponse: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: PatientManagementService, useValue: mockPatientMgmt },
        { provide: ClinicalIntelligenceService, useValue: mockIntelligence },
        { provide: DictationService, useValue: mockDictation },
        { provide: AdkLiveService, useValue: mockAdkLive },
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

  it('6. Toggles live audio stream via AdkLiveService', async () => {
    component.ngOnInit();
    expect(mockAdkLive.isConnected()).toBe(false);

    await component.toggleLiveStream();
    expect(mockAdkLive.connect).toHaveBeenCalled();
    expect(mockAdkLive.startListening).toHaveBeenCalled();

    // Toggle again to disconnect
    mockAdkLive.isConnected.set(true);
    await component.toggleLiveStream();
    expect(mockAdkLive.disconnect).toHaveBeenCalled();
  });

  it('7. Escalates to human interpreter and appends clinical note to state', () => {
    component.ngOnInit();
    expect(component.humanEscalated()).toBe(false);

    component.escalateToHumanInterpreter();
    expect(component.humanEscalated()).toBe(true);
    expect(mockPatientState.addClinicalNote).toHaveBeenCalled();
    const noteCall = mockPatientState.addClinicalNote.mock.calls[0][0];
    expect(noteCall.text).toContain('QUALIFIED HUMAN INTERPRETER ESCALATION');
    expect(noteCall.text).toContain('Frida Kahlo');
  });

  it('8. Handles live transcript chunks received from AdkLiveService', () => {
    component.ngOnInit();
    const initialCount = component.utterances().length;

    // Simulate incoming clinician live audio transcribed chunk
    component.handleLiveTranscriptChunk('Please describe the severity of your back pain.');
    expect(component.utterances().length).toBe(initialCount + 1);
    const last = component.utterances()[component.utterances().length - 1];
    expect(last.speaker).toBe('clinician');
    expect(last.clinicalKeywords).toContain('Pain');

    // Simulate incoming patient Spanish audio transcribed chunk
    component.handleLiveTranscriptChunk('Comprendo perfectamente, doctor. El dolor ha bajado.');
    expect(component.utterances().length).toBe(initialCount + 2);
    const lastPatient = component.utterances()[component.utterances().length - 1];
    expect(lastPatient.speaker).toBe('patient');
  });
});
