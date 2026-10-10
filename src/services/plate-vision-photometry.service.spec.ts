import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { PlateVisionPhotometryService } from './plate-vision-photometry.service';
import { PatientStateService } from './patient-state.service';
import { signal } from '@angular/core';

describe('PlateVisionPhotometryService', () => {
  let service: PlateVisionPhotometryService;
  let mockPatientState: { anatomyViewMode: ReturnType<typeof signal> };

  beforeEach(() => {
    mockPatientState = {
      anatomyViewMode: signal('standard')
    };

    TestBed.configureTestingModule({
      providers: [
        PlateVisionPhotometryService,
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    });

    service = TestBed.inject(PlateVisionPhotometryService);
  });

  it('should initialize with a default plate analysis with zero pixel egress', () => {
    const res = service.currentPlateResult();
    expect(res).not.toBeNull();
    expect(res?.zeroEgressProof.pixelEgressBytes).toBe(0);
    expect(res?.zeroEgressProof.hipaaSafeHarborVerified).toBe(true);
    expect(res?.items.length).toBeGreaterThan(0);
    expect(res?.totalCalories).toBeGreaterThan(300);
  });

  it('should process a captured plate and compute pre-prandial glycemic forecast', async () => {
    const res = await service.processPlateImage();
    expect(res.predictedGlucoseExcursion.baselineMgDl).toBe(92);
    expect(res.predictedGlucoseExcursion.projectedPeakMgDl).toBeGreaterThan(92);
    expect(res.predictedGlucoseExcursion.minutesToPeak).toBeGreaterThanOrEqual(45);
    expect(mockPatientState.anatomyViewMode()).toBe('nutrigenomics');
  });

  it('should calculate fiber blunting on glucose excursion', () => {
    const res = service.currentPlateResult();
    expect(res?.totalFiberGrams).toBeGreaterThan(10);
    expect(res?.predictedGlucoseExcursion.projectedPeakMgDl).toBeLessThan(140);
    expect(res?.predictedGlucoseExcursion.glycemicVariabilityRisk).toBe('Low');
  });
});
