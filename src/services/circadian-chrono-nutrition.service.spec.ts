import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { CircadianChronoNutritionService } from './circadian-chrono-nutrition.service';
import { PatientStateService } from './patient-state.service';
import { signal } from '@angular/core';

describe('CircadianChronoNutritionService', () => {
  let service: CircadianChronoNutritionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CircadianChronoNutritionService,
        { provide: PatientStateService, useValue: { anatomyViewMode: signal('standard') } }
      ]
    });

    service = TestBed.inject(CircadianChronoNutritionService);
  });

  it('should compute morning metabolic peak with high insulin sensitivity', () => {
    service.setSimulatedHour(8); // 8:00 AM
    const status = service.currentStatus();
    expect(status.circadianPhase).toBe('Morning_Metabolic_Peak');
    expect(status.insulinSensitivityMultiplier).toBe(1.8);
    expect(status.melatoninLevelEstimate).toBe('Suppressed');
    expect(status.lateNightConflictDetected).toBe(false);
  });

  it('should detect nocturnal melatonin fast window and flag late-night conflict', () => {
    service.setSimulatedHour(22); // 10:00 PM
    const status = service.currentStatus();
    expect(status.circadianPhase).toBe('Melatonin_Fast_Window');
    expect(status.insulinSensitivityMultiplier).toBe(0.4);
    expect(status.mtnr1bInterlockActive).toBe(true);
    expect(status.lateNightConflictDetected).toBe(true);
  });

  it('should contraindicate high-carb meals during nocturnal melatonin window', () => {
    service.setSimulatedHour(23); // 11:00 PM
    const evalRes = service.evaluateMealTimingRisk(50); // 50g net carbs
    expect(evalRes.approved).toBe(false);
    expect(evalRes.severity).toBe('Contraindicated');
    expect(evalRes.projectedInsulinDemandMultiplier).toBe(2.5); // 1 / 0.4
  });

  it('should approve meals during midday sustained phase', () => {
    service.setSimulatedHour(13); // 1:00 PM
    const evalRes = service.evaluateMealTimingRisk(35);
    expect(evalRes.approved).toBe(true);
    expect(evalRes.severity).toBe('Safe');
  });
});
