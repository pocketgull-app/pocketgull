import '@angular/compiler';
import { expect, describe, it, beforeEach } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { ClinicOnboardingWizardComponent } from './clinic-onboarding-wizard.component';
import { PatientStateService } from '../../services/patient-state.service';

describe('ClinicOnboardingWizardComponent', () => {
  let component: ClinicOnboardingWizardComponent;
  let mockPatientState: any;

  beforeEach(() => {
    mockPatientState = {
      patientName: signal(''),
      patientAge: signal(0),
      patientGender: signal(''),
      vitals: signal({
        bp: '',
        hr: '',
        temp: '',
        spO2: '',
        weight: '',
        height: '',
        cgmGlucoseMgDl: '',
        vitC: '',
        vitD3: '',
        magnesium: '',
        zinc: '',
        b12: ''
      }),
      reasonForVisit: signal('')
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    });

    component = runInInjectionContext(injector, () => new ClinicOnboardingWizardComponent());
  });

  it('1. Initializes on Step 1 with default profile', () => {
    expect(component.currentStep()).toBe(1);
    expect(component.profile.specialty).toBe('integrative');
    expect(component.profile.ehrSystem).toBe('athenahealth');
  });

  it('2. Steps through wizard navigation and updates step signal', () => {
    component.currentStep.set(2);
    expect(component.currentStep()).toBe(2);

    component.currentStep.set(3);
    expect(component.currentStep()).toBe(3);
  });

  it('3. Loads cardiology polypharmacy sandbox scenario into patient state', () => {
    component.loadScenario('cardio_poly');
    expect(component.scenarioLoaded()).toBe('Cardiology & Polypharmacy');
    expect(mockPatientState.patientGender()).toBe('Male');
    expect(mockPatientState.vitals().bp).toBe('148/92');
  });

  it('4. Loads rare genomics sandbox scenario into patient state', () => {
    component.loadScenario('rare_genomics');
    expect(component.scenarioLoaded()).toBe('Rare Disease & Phenopackets');
    expect(mockPatientState.patientAge()).toBe(7);
    expect(mockPatientState.reasonForVisit()).toContain('Refractory focal seizures');
  });
});
