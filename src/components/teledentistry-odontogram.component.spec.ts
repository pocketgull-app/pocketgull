import '@angular/compiler';
import { TeledentistryOdontogramComponent } from './teledentistry-odontogram.component';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from '../services/patient-state.service';
import { MedicalDecoderService } from '../services/medical-decoder.service';

describe('TeledentistryOdontogramComponent', () => {
  let component: TeledentistryOdontogramComponent;
  let mockPatientState: any;
  let mockMedicalDecoder: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      vitals: signal({ hr: '72', spO2: '98%' })
    };

    mockMedicalDecoder = {
      readingLevel: signal('patient')
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState },
      { provide: MedicalDecoderService, useValue: mockMedicalDecoder }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new TeledentistryOdontogramComponent();
    });
  });

  it('should initialize with default FDI tooth 11 selected', () => {
    expect(component).toBeTruthy();
    expect(component.selectedFdiCode()).toBe(11);
    expect(component.salivaryPh()).toBe(6.9);
    expect(component.pHStatus()).toContain('Balanced');
  });

  it('should toggle anatomical surface caries and update active tooth state', () => {
    const tooth11 = component.teeth().find(t => t.fdiCode === 11)!;
    expect(tooth11.surfaces.mesial).toBe(false);

    component.toggleSurface(11, 'mesial');
    
    const updated11 = component.teeth().find(t => t.fdiCode === 11)!;
    expect(updated11.surfaces.mesial).toBe(true);
  });

  it('should calculate deep probing sites count for teeth with PPD >= 4mm', () => {
    expect(component.deepProbingSitesCount()).toBe(2); // teeth 16 and 36 have 4mm default

    component.setProbingDepth(11, 5);
    expect(component.deepProbingSitesCount()).toBe(3);
  });
});
