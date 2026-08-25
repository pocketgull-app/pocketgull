import '@angular/compiler';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { SummaryOverviewLensTabComponent } from './summary-overview-lens-tab.component';
import { PatientStateService } from '../../services/patient-state.service';
import { ClinicalIntelligenceService } from '../../services/clinical-intelligence.service';
import { AiConfidenceCalibrationService } from '../../services/ai-confidence-calibration.service';

describe('SummaryOverviewLensTabComponent', () => {
  let component: SummaryOverviewLensTabComponent;
  let mockPatientState: any;
  let mockIntel: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      symptoms: signal([]),
      conditions: signal([])
    };

    mockIntel = {
      analysisResults: signal({}),
      isLoading: signal(false)
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState },
      { provide: ClinicalIntelligenceService, useValue: mockIntel },
      { provide: AiConfidenceCalibrationService, useClass: AiConfidenceCalibrationService }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new SummaryOverviewLensTabComponent();
    });
  });

  it('should instantiate successfully with default narrative view mode', () => {
    expect(component).toBeTruthy();
    expect(component.activeViewMode()).toBe('narrative');
  });

  it('should toggle between narrative and differential review mode', () => {
    component.activeViewMode.set('differential');
    expect(component.activeViewMode()).toBe('differential');
  });
});
