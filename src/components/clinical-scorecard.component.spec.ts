import '@angular/compiler';
import { ClinicalScorecardComponent } from './clinical-scorecard.component';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from '../services/patient-state.service';
import { MedicalDecoderService } from '../services/medical-decoder.service';

describe('ClinicalScorecardComponent', () => {
  let component: ClinicalScorecardComponent;
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
      component = new ClinicalScorecardComponent();
    });
  });

  it('should initialize with default criteria and calculate CHA2DS2-VASc score', () => {
    expect(component).toBeTruthy();
    expect(component.chadsVascScore()).toBe(2); // Hypertension (+1) + Age 65-74 (+1)
    expect(component.annualStrokeRiskPercent()).toBe(2.2);
  });

  it('should update score and recommendation when criteria are toggled', () => {
    component.toggleCriterion('strokeOrTiaHistory'); // +2
    expect(component.chadsVascScore()).toBe(4);
    expect(component.antithromboticRecommendation()).toContain('strongly recommended');
  });

  it('should calculate Lee RCRI perioperative cardiac risk score and class', () => {
    expect(component.rcriScore()).toBe(0);
    expect(component.rcriClass()).toBe('I');
    expect(component.maceRiskPercent()).toBe(0.4);

    component.toggleCriterion('congestiveHeartFailure');
    expect(component.rcriScore()).toBe(1);
    expect(component.rcriClass()).toBe('II');
  });
});
