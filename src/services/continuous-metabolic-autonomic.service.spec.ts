import { TestBed } from '@angular/core/testing';
import { ContinuousMetabolicAutonomicService } from './continuous-metabolic-autonomic.service';
import { PatientStateService } from './patient-state.service';

describe('ContinuousMetabolicAutonomicService', () => {
  let service: ContinuousMetabolicAutonomicService;
  let patientState: PatientStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ContinuousMetabolicAutonomicService,
        PatientStateService
      ]
    });

    service = TestBed.inject(ContinuousMetabolicAutonomicService);
    patientState = TestBed.inject(PatientStateService);
  });

  it('should initialize with valid CGM curve and overnight autonomic sleep profile', () => {
    expect(service.activeComparison().predictedCurve.length).toBeGreaterThan(0);
    expect(service.activeComparison().actualCgmCurve.length).toBeGreaterThan(0);
    expect(service.sleepAutonomicProfile().deepNremSlowWaveHours).toBeGreaterThan(0);
    expect(service.sleepAutonomicProfile().glymphaticClearanceIndex).toBeGreaterThanOrEqual(90);
  });

  it('should log a new meal and update the postprandial CGM trajectory', () => {
    service.logMealForCgmComparison('Wild Salmon with Quinoa & Steamed Greens', 18, 92);
    expect(service.activeMealName()).toBe('Wild Salmon with Quinoa & Steamed Greens');
    expect(service.activeComparison().peakPredictedMgDl).toBe(110);
    expect(service.activeComparison().glycemicDeltaMgDl).toBeLessThanOrEqual(18);
    expect(service.timeInRangeStatus().label).toBe('Optimal Control');
  });

  it('should evaluate glycemic variability status', () => {
    expect(service.cvStatus().label).toContain('CV ≤ 36%');
  });
});
