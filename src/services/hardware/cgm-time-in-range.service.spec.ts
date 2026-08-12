import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { CgmTimeInRangeService } from './cgm-time-in-range.service';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from '../patient-state.service';

describe('CgmTimeInRangeService', () => {
  let service: CgmTimeInRangeService;
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
      service = new CgmTimeInRangeService();
    });
  });

  it('should calculate Time-in-Range (TIR) and GMI estimated HbA1c', () => {
    expect(service).toBeTruthy();
    const analysis = service.cgmAnalysis();
    expect(analysis.timeInRangePercent).toBeGreaterThanOrEqual(70);
    expect(analysis.gmiEstimatedA1c).toBeGreaterThan(5.0);
  });

  it('should flag severe hypoglycemia risk when readings drop below 70 mg/dL', () => {
    service.glucoseReadingsMgDl.set([55, 62, 50, 48, 72, 80, 95]);
    const analysis = service.cgmAnalysis();
    expect(analysis.clinicalAssessment).toBe('Severe Hypoglycemia Risk');
    expect(analysis.timeBelowRangePercent).toBeGreaterThan(0);
  });
});
