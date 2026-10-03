import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { StewartHamiltonPacService } from './stewart-hamilton-pac.service';

describe('StewartHamiltonPacService', () => {
  let service: StewartHamiltonPacService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StewartHamiltonPacService]
    });
    service = TestBed.inject(StewartHamiltonPacService);
  });

  it('should instantiate the service correctly', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate baseline normal hemodynamics accurately', () => {
    const out = service.hemodynamicOutput();
    expect(out.cardiacOutputLmin).toBeGreaterThan(5.0);
    expect(out.cardiacOutputLmin).toBeLessThan(6.5);
    expect(out.cardiacIndexLminM2).toBeGreaterThan(2.5);
    expect(out.forresterQuadrant).toBe('I_warm_and_dry');
    expect(out.shockEtiology).toBe('normal');
  });

  it('should classify septic shock with high CI and low SVR', () => {
    service.applyPreset('septic_distributive');
    const out = service.hemodynamicOutput();
    expect(out.shockEtiology).toBe('septic_distributive');
    expect(out.cardiacIndexLminM2).toBeGreaterThan(3.8);
    expect(out.systemicVascularResistanceDyns).toBeLessThan(700);
    expect(out.forresterQuadrant).toBe('I_warm_and_dry');
    expect(out.shockSeverity).toBe('High Alert');
  });

  it('should classify cardiogenic shock as Forrester IV (Cold & Wet)', () => {
    service.applyPreset('cardiogenic_pump_failure');
    const out = service.hemodynamicOutput();
    expect(out.shockEtiology).toBe('cardiogenic_pump_failure');
    expect(out.forresterQuadrant).toBe('IV_cold_and_wet');
    expect(out.cardiacIndexLminM2).toBeLessThan(2.2);
    expect(service.inputs().pulmonaryCapillaryWedgePressureMmhg).toBeGreaterThan(18);
    expect(out.shockSeverity).toBe('Critical STAT');
    expect(out.clinicalGuidance).toContain('Inotropic support');
  });

  it('should classify hypovolemic shock as Forrester III (Cold & Dry)', () => {
    service.applyPreset('hypovolemic');
    const out = service.hemodynamicOutput();
    expect(out.shockEtiology).toBe('hypovolemic');
    expect(out.forresterQuadrant).toBe('III_cold_and_dry');
    expect(out.cardiacIndexLminM2).toBeLessThan(2.2);
    expect(service.inputs().pulmonaryCapillaryWedgePressureMmhg).toBeLessThan(10);
    expect(out.shockSeverity).toBe('Emergent');
  });

  it('should detect cardiac tamponade via diastolic equalization (CVP ≈ PCWP)', () => {
    service.applyPreset('obstructive_tamponade');
    const out = service.hemodynamicOutput();
    expect(out.shockEtiology).toBe('obstructive_tamponade');
    expect(out.isEqualizationPresent).toBe(true);
    expect(out.shockSeverity).toBe('Critical STAT');
    expect(out.clinicalGuidance).toContain('pericardiocentesis');
  });

  it('should detect massive PE via elevated TPG and PVR with RV strain', () => {
    service.applyPreset('obstructive_pulmonary_embolism');
    const out = service.hemodynamicOutput();
    expect(out.shockEtiology).toBe('obstructive_pulmonary_embolism');
    expect(out.transpulmonaryGradientMmhg).toBeGreaterThanOrEqual(12);
    expect(out.pulmonaryVascularResistanceDyns).toBeGreaterThan(250);
    expect(out.shockSeverity).toBe('Critical STAT');
    expect(out.clinicalGuidance).toContain('cor pulmonale');
  });
});
