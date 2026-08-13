import '@angular/compiler';
import * as DOMPurify from 'dompurify';
import { vi } from 'vitest';
import { SevenGenerationsStewardshipLensTabComponent } from './seven-generations-stewardship-lens-tab.component';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from '../../services/patient-state.service';

describe('SevenGenerationsStewardshipLensTabComponent — Epigenetic Lineage Suite', () => {
  let component: SevenGenerationsStewardshipLensTabComponent;
  let mockPatientState: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      addClinicalNote: vi.fn(),
      symptoms: signal([]),
      conditions: signal([])
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new SevenGenerationsStewardshipLensTabComponent();
    });
  });

  it('should instantiate successfully', () => {
    expect(component).toBeTruthy();
  });
});
