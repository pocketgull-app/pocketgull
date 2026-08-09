import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { AudioRespiratoryVisualizerComponent } from './audio-respiratory-visualizer.component';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from '../services/patient-state.service';
import { AudioRespiratoryAnalyzerService } from '../services/audio-respiratory-analyzer.service';

describe('AudioRespiratoryVisualizerComponent', () => {
  let component: AudioRespiratoryVisualizerComponent;
  let mockPatientState: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      vitals: signal({ hr: '72', spO2: '98%' })
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState },
      { provide: AudioRespiratoryAnalyzerService, useFactory: () => new AudioRespiratoryAnalyzerService() }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new AudioRespiratoryVisualizerComponent();
    });
  });

  it('should initialize and compute FFT equalizer bars', () => {
    expect(component).toBeTruthy();
    expect(component.equalizerBars().length).toBe(24);
  });

  it('should update pattern when simulate preset is triggered', () => {
    component.simulate('stridor');
    expect(component.pattern().detectedPattern).toBe('Inspiratory Stridor');
    expect(component.pattern().severityGrade).toBe('Severe');

    component.simulate('wheeze');
    expect(component.pattern().detectedPattern).toBe('Expiratory Wheeze');
  });
});
