import '@angular/compiler';
import { AudioRespiratoryAnalyzerService } from './audio-respiratory-analyzer.service';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from './patient-state.service';

describe('AudioRespiratoryAnalyzerService', () => {
  let service: AudioRespiratoryAnalyzerService;
  let mockPatientState: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      vitals: signal({ hr: '72', spO2: '98%' })
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      service = new AudioRespiratoryAnalyzerService();
    });
  });

  it('should initialize with normal vesicular breathing pattern for quiet audio', () => {
    expect(service).toBeTruthy();
    service.simulateAcousticFrequency(200, -35); // quiet normal breath
    expect(service.acousticPattern().detectedPattern).toBe('Normal Breathing');
  });

  it('should detect expiratory wheezing in 400-1600Hz frequency spectrum', () => {
    service.simulateAcousticFrequency(850, -15);
    const reading = service.acousticPattern();
    expect(reading.detectedPattern).toBe('Expiratory Wheeze');
    expect(reading.severityGrade).toBe('Moderate');
  });

  it('should detect high-pitched inspiratory stridor above 2000Hz', () => {
    service.simulateAcousticFrequency(2400, -10);
    const reading = service.acousticPattern();
    expect(reading.detectedPattern).toBe('Inspiratory Stridor');
    expect(reading.severityGrade).toBe('Severe');
  });
});
