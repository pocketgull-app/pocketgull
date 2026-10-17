import { describe, it, expect, beforeEach } from 'vitest';
import { FluidTonicityResuscitationService, FLUID_CATALOG } from './fluid-tonicity-resuscitation.service';

describe('FluidTonicityResuscitationService (Clinical Model P14)', () => {
  let service: FluidTonicityResuscitationService;

  beforeEach(() => {
    service = new FluidTonicityResuscitationService();
  });

  it('1. Computes standard adult male baseline compartment volumes accurately', () => {
    const sim = service.simulation();
    expect(sim.baselineVolumes.totalBodyWaterL).toBe(42.0); // 70 * 0.60
    expect(sim.baselineVolumes.intracellularL).toBe(28.0); // 2/3 of 42
    expect(sim.baselineVolumes.interstitialL).toBe(10.5); // 3/4 of 14
    expect(sim.baselineVolumes.intravascularPlasmaL).toBe(3.5); // 1/4 of 14
  });

  it('2. Evaluates balanced crystalloid (Lactated Ringers) volume distribution', () => {
    service.updateInput('fluidType', 'lactated_ringers');
    service.updateInput('infusionVolumeMl', 1000);

    const sim = service.simulation();
    // 25% IV (250 mL), 75% ISF (750 mL), 0% ICF
    expect(sim.shifts.deltaIntravascularMl).toBe(250);
    expect(sim.shifts.deltaInterstitialMl).toBe(750);
    expect(sim.shifts.deltaIntracellularMl).toBe(0);
    expect(sim.shifts.intravascularRetentionPercent).toBe(25);
    expect(sim.hyperchloremicAcidosisRisk).toBe('Low');
  });

  it('3. Flags hyperchloremic metabolic acidosis risk with large volume 0.9% Normal Saline', () => {
    service.updateInput('fluidType', 'normal_saline_09');
    service.updateInput('infusionVolumeMl', 3000);

    const sim = service.simulation();
    expect(sim.hyperchloremicAcidosisRisk).toBe('Severe');
    expect(sim.clinicalGuidance.some(g => g.includes('High Normal Saline Volume'))).toBe(true);
  });

  it('4. Simulates 3% Hypertonic Saline osmotic draw from intracellular space', () => {
    service.loadPreset('cerebral_edema_3pct');

    const sim = service.simulation();
    // 3% saline pulls water out of ICF
    expect(sim.shifts.deltaIntracellularMl).toBeLessThan(0);
    expect(sim.shifts.deltaIntravascularMl).toBeGreaterThan(150);
    expect(sim.clinicalGuidance.some(g => g.includes('Hypertonic Osmotherapy'))).toBe(true);
  });

  it('5. Simulates 25% Albumin hyper-oncotic recruitment of interstitial fluid', () => {
    service.loadPreset('cirrhotic_paracentesis');

    const sim = service.simulation();
    // 25% albumin draws fluid from ISF into IV
    expect(sim.shifts.deltaInterstitialMl).toBeLessThan(0);
    expect(sim.shifts.deltaIntravascularMl).toBeGreaterThan(900); // 200 + 4.5*200 = 1100 mL
    expect(sim.clinicalGuidance.some(g => g.includes('Hyper-Oncotic Colloid Action'))).toBe(true);
  });

  it('6. Warns against cerebral edema when D5W free water expands intracellular compartment', () => {
    service.updateInput('fluidType', 'd5w');
    service.updateInput('infusionVolumeMl', 2000);
    service.updateInput('hydrationState', 'burn_trauma');

    const sim = service.simulation();
    // D5W delivers 2/3 into ICF
    expect(sim.shifts.deltaIntracellularMl).toBeGreaterThan(1000);
    expect(sim.cerebralEdemaRisk).toBe(true);
    expect(sim.clinicalGuidance.some(g => g.includes('Cerebral Swelling Warning'))).toBe(true);
  });

  it('7. Triggers Osmotic Demyelination Syndrome (ODS) guardrail on excessive sodium rise', () => {
    service.updateInput('baselineSerumSodiumMEq', 115); // Severe hyponatremia
    service.updateInput('fluidType', 'hypertonic_saline_3');
    service.updateInput('infusionVolumeMl', 1000); // Massive 3% dose

    const sim = service.simulation();
    expect(sim.osmoticDemyelinationRisk).toBe(true);
    expect(sim.clinicalGuidance.some(g => g.includes('ODS GUARD ALERT'))).toBe(true);
  });

  it('8. Accurately calculates Parkland burn resuscitation and 4-2-1 maintenance rate', () => {
    service.loadPreset('severe_burn_parkland');

    const sim = service.simulation();
    // Parkland: 4 * 70 * 35 = 9800 mL
    expect(sim.parklandTotal24hMl).toBe(9800);
    expect(sim.parklandFirst8hMl).toBe(4900);

    // 4-2-1 rule for 70 kg: 40 + 20 + 50 = 110 mL/hr
    expect(sim.maintenanceRateMlHr).toBe(110);
    expect(sim.maintenanceVolume24hMl).toBe(2640);
  });

  it('9. Fluid catalog contains all 9 clinical fluid definitions with complete physicochemical specs', () => {
    expect(Object.keys(FLUID_CATALOG).length).toBe(9);
    expect(FLUID_CATALOG.lactated_ringers.strongIonDifference).toBe(25);
    expect(FLUID_CATALOG.albumin_25.colloidOncoticPressureMmHg).toBe(100);
    expect(FLUID_CATALOG.normal_saline_09.strongIonDifference).toBe(0);
  });

  it('10. Conserves multi-liter cation mass balance in Adrogué-Madias equation (TBW + V denominator)', () => {
    // 70 kg male (TBW = 42 L), baseline Na+ = 120 mEq/L, 4 L of 0.9% Normal Saline (Na+ = 154 mEq/L)
    // Exact mass conservation: ((154 - 120) * 4) / (42 + 4) = 136 / 46 = +3.0 mEq/L (predicted 123.0 mEq/L)
    service.updateInput('baselineSerumSodiumMEq', 120);
    service.updateInput('fluidType', 'normal_saline_09');
    service.updateInput('infusionVolumeMl', 4000);

    const sim = service.simulation();
    expect(sim.deltaSodiumMEq).toBe(3.0);
    expect(sim.predictedSodiumMEq).toBe(123.0);
  });
});
