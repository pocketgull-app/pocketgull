import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TraumaBurn3dLensComponent } from './trauma-burn-3d-lens.component';
import { PatientStateService } from '../../services/patient-state.service';

describe('TraumaBurn3dLensComponent Unit Suite', () => {
  let component: TraumaBurn3dLensComponent;
  let mockPatientState: any;

  beforeEach(() => {
    mockPatientState = {
      getCurrentState: vi.fn().mockReturnValue({}),
      addClinicalNote: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        TraumaBurn3dLensComponent
      ]
    });

    component = runInInjectionContext(injector, () => injector.get(TraumaBurn3dLensComponent));
  });

  it('1. Initializes with 8 Wallace Rule of 9s regions totaling 100% TBSA', () => {
    expect(component).toBeTruthy();
    const regions = component.burnRegions();
    expect(regions.length).toBe(8);

    const fullSum = regions.reduce((sum, r) => sum + r.tbsaPercent, 0);
    expect(fullSum).toBe(100);
  });

  it('2. Computes initial TBSA from active burned regions (Ant Torso 18% + Right Arm 9% = 27%)', () => {
    expect(component.totalTbsa()).toBe(27);
  });

  it('3. Computes Parkland 24h crystalloid resuscitation volume accurately', () => {
    // 4 mL * 70 kg * 27% = 7560 mL
    component.patientWeightKg.set(70);
    expect(component.parklandTotal24h()).toBe(7560);
    expect(component.parklandFirst8h()).toBe(3780);
    expect(component.parklandFirst8hRate()).toBe(472.5);
    expect(component.parklandNext16h()).toBe(3780);
    expect(component.parklandNext16hRate()).toBe(236.25);
  });

  it('4. Toggles burn region dynamically and recalculates TBSA', () => {
    const initialTbsa = component.totalTbsa();
    // Toggle Head & Neck (9%) ON
    component.toggleBurnRegion('head_neck');
    expect(component.totalTbsa()).toBe(initialTbsa + 9);

    // Toggle Head & Neck OFF
    component.toggleBurnRegion('head_neck');
    expect(component.totalTbsa()).toBe(initialTbsa);
  });

  it('5. Clears all burns to 0% TBSA', () => {
    component.clearAllBurns();
    expect(component.totalTbsa()).toBe(0);
    expect(component.parklandTotal24h()).toBe(0);
  });

  it('6. Toggles high-and-tight arterial tourniquet state', () => {
    expect(component.tourniquetApplied()).toBe(false);
    component.toggleTourniquet();
    expect(component.tourniquetApplied()).toBe(true);
  });

  it('7. Attaches 3D trauma & burn record to patient clinical chart', () => {
    component.attachToClinicalRecord();
    expect(mockPatientState.addClinicalNote).toHaveBeenCalled();
  });
});
