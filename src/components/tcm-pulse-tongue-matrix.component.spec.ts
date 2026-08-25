import '@angular/compiler';
import { TcmPulseTongueMatrixComponent } from './tcm-pulse-tongue-matrix.component';
import { runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from '../services/patient-state.service';

import { ThemeService } from '../services/theme.service';

import { PLATFORM_ID } from '@angular/core';

describe('TcmPulseTongueMatrixComponent', () => {
  let component: TcmPulseTongueMatrixComponent;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: {} }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new TcmPulseTongueMatrixComponent();
    });
  });

  it('should initialize successfully with 6 TCM pulse positions and tongue diagnosis', () => {
    expect(component).toBeTruthy();
    expect(component.pulsePositions().length).toBe(6);
    expect(component.tongueDiagnosis().bodyColor).toBe('Red (Heat/Fire)');
  });
});
