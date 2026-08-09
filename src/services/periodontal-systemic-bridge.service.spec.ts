import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { PeriodontalSystemicBridgeService } from './periodontal-systemic-bridge.service';
import { TeledentistryService } from './teledentistry.service';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from './patient-state.service';

describe('PeriodontalSystemicBridgeService', () => {
  let service: PeriodontalSystemicBridgeService;
  let teledentistryService: TeledentistryService;
  let mockPatientState: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      vitals: signal({ hr: '72', spO2: '98%' })
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState },
      TeledentistryService
    ], undefined as any);

    runInInjectionContext(injector, () => {
      teledentistryService = injector.get(TeledentistryService);
      service = new PeriodontalSystemicBridgeService();
    });
  });

  it('should calculate Systemic Inflammatory Burden Index (SIBI) score correctly from TeledentistryService', () => {
    expect(service).toBeTruthy();
    expect(service.sibiScore()).toBeGreaterThan(0);
    expect(service.systemicRiskAnalysis().cardiovascularRiskMultiplier).toBeGreaterThanOrEqual(1.0);
  });

  it('should elevate cardiovascular risk multiplier and endothelial dysfunction grade when deep pockets and hs-CRP increase', () => {
    // Dynamically update additional FDI teeth to PPD >= 4mm
    teledentistryService.setProbingDepth(11, 6);
    teledentistryService.setProbingDepth(12, 6);
    teledentistryService.setProbingDepth(13, 6);
    teledentistryService.setProbingDepth(14, 6);
    teledentistryService.hsCRP.set(3.5);

    const analysis = service.systemicRiskAnalysis();
    expect(analysis.endothelialDysfunctionGrade).toBe('Critical');
    expect(analysis.cardiovascularRiskMultiplier).toBe(2.4);
    expect(analysis.predictedHba1cElevation).toBe(0.6);
  });
});
