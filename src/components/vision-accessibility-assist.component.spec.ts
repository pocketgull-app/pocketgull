import '@angular/compiler';
import { expect, vi } from 'vitest';
import { VisionAccessibilityAssistComponent } from './vision-accessibility-assist.component';
import { runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from '../services/patient-state.service';
import { DictationService } from '../services/dictation.service';

describe('VisionAccessibilityAssistComponent', () => {
  let component: VisionAccessibilityAssistComponent;
  let injector: EnvironmentInjector;
  let mockPatientState: any;
  let mockDictation: any;

  beforeEach(() => {
    mockPatientState = {
      vitals: vi.fn().mockReturnValue({ hr: 75, bp: '120/80', spo2: 98, temp: 98.6 }),
      cgmGlucoseMgDl: vi.fn().mockReturnValue(110)
    };

    mockDictation = {
      speakResponse: vi.fn()
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState },
      { provide: DictationService, useValue: mockDictation }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new VisionAccessibilityAssistComponent();
    });
  });

  it('should initialize successfully', () => {
    expect(component).toBeTruthy();
  });

  it('should narrate vitals aloud via TTS when speakStatusSummary is called', () => {
    component.speakStatusSummary();
    expect(mockDictation.speakResponse).toHaveBeenCalled();
    expect(component.lastAnnouncement()).toContain('Heart Rate is 75');
  });

  it('should scan pill and announce instructions when triggerPillScan is called', () => {
    component.triggerPillScan();
    expect(mockDictation.speakResponse).toHaveBeenCalledWith(expect.stringContaining('Metformin'));
    expect(component.lastAnnouncement()).toContain('Metformin');
  });

  it('should play acoustic vitals pitch sonification and speak announcement', () => {
    component.playVitalsSonification();
    expect(mockDictation.speakResponse).toHaveBeenCalled();
    expect(component.lastAnnouncement()).toContain('acoustic vitals tone');
  });

  it('should start voice-guided Amsler grid test when startAmslerGuidedTest is called', () => {
    component.startAmslerGuidedTest();
    expect(mockDictation.speakResponse).toHaveBeenCalledWith(expect.stringContaining('Amsler Grid test'));
    expect(component.lastAnnouncement()).toContain('Amsler Grid test');
  });
});
