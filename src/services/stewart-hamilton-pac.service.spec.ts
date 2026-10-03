import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { StewartHamiltonPacService } from './stewart-hamilton-pac.service';

describe('StewartHamiltonPacService (Clinical Model P13)', () => {
  let service: StewartHamiltonPacService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StewartHamiltonPacService]
    });
    service = TestBed.inject(StewartHamiltonPacService);
  });

  it('1. should initialize in euvolemic healthy state with normal CI, SVR, and Forrester Subset I', () => {
    expect(service).toBeDefined();
    expect(service.activePreset()).toBe('euvolemic_healthy');

    const out = service.hemodynamicOutput();
    expect(out.cardiacOutputLmin).toBeGreaterThan(4.5);
    expect(out.cardiacIndexLminM2).toBeGreaterThanOrEqual(2.5);
    expect(out.systemicVascularResistanceDyns).toBeGreaterThanOrEqual(800);
    expect(out.systemicVascularResistanceDyns).toBeLessThanOrEqual(1400);
    expect(out.forresterSubset).toBe('Subset I: Warm & Dry (Normal / Compensated)');
    expect(out.shockClassification).toBe('No Shock (Compensated Hemodynamics)');
  });

  it('2. should model cardiogenic shock (Forrester Subset IV) with low CI, elevated PCWP, and compensatory high SVR', () => {
    service.applyPreset('cardiogenic_shock_forrester_iv');

    const out = service.hemodynamicOutput();
    expect(out.cardiacIndexLminM2).toBeLessThan(2.2);
    expect(service.vitals().pulmonaryCapillaryWedgePressurePcwp).toBeGreaterThan(18);
    expect(out.forresterSubset).toBe('Subset IV: Cold & Wet (Cardiogenic Shock)');
    expect(out.shockClassification).toContain('Cardiogenic Shock');
    expect(out.recommendedInterventions.some(i => i.includes('Dobutamine'))).toBe(true);
  });

  it('3. should model hyperdynamic septic shock with high CI, low SVR (< 700), and high SvO2', () => {
    service.applyPreset('hyperdynamic_septic_shock');

    const out = service.hemodynamicOutput();
    expect(out.cardiacIndexLminM2).toBeGreaterThan(3.5);
    expect(out.systemicVascularResistanceDyns).toBeLessThan(700);
    expect(out.shockClassification).toContain('Distributive Shock');
    expect(out.recommendedInterventions.some(i => i.includes('Norepinephrine'))).toBe(true);
  });

  it('4. should model massive pulmonary embolism with RV uncoupling, high PVR, elevated MPAP, and high TPG', () => {
    service.applyPreset('massive_pulmonary_embolism');

    const out = service.hemodynamicOutput();
    expect(out.transpulmonaryGradientMmhg).toBeGreaterThan(15);
    expect(out.pulmonaryVascularResistanceDyns).toBeGreaterThan(250);
    expect(service.vitals().centralVenousPressureCvp).toBeGreaterThan(15);
    expect(out.shockClassification).toContain('Pulmonary Embolism');
    expect(out.recommendedInterventions.some(i => i.includes('thrombolysis'))).toBe(true);
  });

  it('5. should model cardiac tamponade with diastolic pressure equalization (CVP ~= PCWP)', () => {
    service.applyPreset('cardiac_tamponade_equalization');

    const v = service.vitals();
    const out = service.hemodynamicOutput();
    expect(Math.abs(v.centralVenousPressureCvp - v.pulmonaryCapillaryWedgePressurePcwp)).toBeLessThanOrEqual(3);
    expect(out.cardiacIndexLminM2).toBeLessThan(2.2);
    expect(out.shockClassification).toContain('Cardiac Tamponade');
    expect(out.recommendedInterventions.some(i => i.includes('pericardiocentesis'))).toBe(true);
  });

  it('6. should model hypovolemic hemorrhagic shock with low CVP, low PCWP, and Forrester Subset III', () => {
    service.applyPreset('hypovolemic_hemorrhagic_shock');

    const v = service.vitals();
    const out = service.hemodynamicOutput();
    expect(v.centralVenousPressureCvp).toBeLessThanOrEqual(4);
    expect(v.pulmonaryCapillaryWedgePressurePcwp).toBeLessThanOrEqual(8);
    expect(out.forresterSubset).toBe('Subset III: Cold & Dry (Hypovolemia / Low Output)');
    expect(out.shockClassification).toContain('Hypovolemic Shock');
    expect(out.recommendedInterventions.some(i => i.includes('MTP'))).toBe(true);
  });

  it('7. should accurately compute oxygen delivery (DO2), consumption (VO2), and extraction ratio (O2ER)', () => {
    service.applyPreset('euvolemic_healthy');

    const out = service.hemodynamicOutput();
    expect(out.arterialOxygenContentCao2Mldl).toBeGreaterThan(15);
    expect(out.oxygenDeliveryDo2Mlmin).toBeGreaterThan(700);
    expect(out.oxygenConsumptionVo2Mlmin).toBeGreaterThan(150);
    expect(out.oxygenExtractionRatioPct).toBeGreaterThanOrEqual(15);
    expect(out.oxygenExtractionRatioPct).toBeLessThanOrEqual(35);
  });
});
