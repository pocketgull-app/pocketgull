import '@angular/compiler';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { InterventionsLensTabComponent } from './interventions-lens-tab.component';
import { PatientStateService } from '../../services/patient-state.service';
import { ClinicalPosologyService } from '../../services/clinical-posology.service';

describe('InterventionsLensTabComponent', () => {
  let component: InterventionsLensTabComponent;
  let mockState: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockState = {
      activePatientSummary: signal('Test Patient (34y)'),
      vitals: signal({
        bp: '120/80',
        hr: '72',
        weight: '150 lbs',
        height: "5'6\""
      })
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockState },
      ClinicalPosologyService
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new InterventionsLensTabComponent();
    });
  });

  it('instantiates with allopathic default and allows switching subtabs', () => {
    expect(component).toBeTruthy();
    expect(component.subTab()).toBe('allopathic');

    component.subTab.set('tcm');
    expect(component.subTab()).toBe('tcm');

    component.subTab.set('ayurvedic');
    expect(component.subTab()).toBe('ayurvedic');

    component.subTab.set('lifestyle');
    expect(component.subTab()).toBe('lifestyle');
  });
});
