import { describe, it, expect, beforeEach } from 'vitest';
import { EnvironmentalHeatPosologyService } from './environmental-heat-posology.service';

describe('EnvironmentalHeatPosologyService Suite', () => {
  let service: EnvironmentalHeatPosologyService;

  beforeEach(() => {
    service = new EnvironmentalHeatPosologyService();
  });

  it('1. Correctly calculates Wet Bulb Globe Temperature (WBGT) from ambient temp and humidity', () => {
    // 112°F dry bulb, 18% humidity (typical Phoenix summer day in direct sunlight)
    const result = service.estimateWbgt(112, 18, true);
    expect(result.wbgtF).toBeGreaterThanOrEqual(86);
    expect(result.wbgtC).toBeGreaterThanOrEqual(30);
  });

  it('2. Flags Anticholinergics (Diphenhydramine) for sweat suppression & anhidrosis risk', () => {
    const assessment = service.evaluateHeatPosology({
      ambientTempF: 108,
      relativeHumidityPct: 22,
      isDirectSun: true,
      patientAge: 72,
      patientWeightKg: 64,
      baselineEgfr: 42,
      activeMedications: ['Diphenhydramine 50mg', 'Lisinopril 20mg']
    });

    expect(assessment.heatAcuityTier).toMatch(/SEVERE_DANGER|EXTREME_STAT|HIGH_ALERT/);
    expect(assessment.anhidrosisSweatRiskPct).toBeGreaterThanOrEqual(70);
    expect(assessment.medicationVulnerabilities.some(m => m.medication === 'Diphenhydramine')).toBe(true);
    expect(assessment.acuteKidneyInjuryRiskTier).toMatch(/HIGH|CRITICAL/);
  });

  it('3. Computes hourly hydration posology and electrolyte guidance for extreme heat', () => {
    const assessment = service.evaluateHeatPosology({
      ambientTempF: 115,
      relativeHumidityPct: 15,
      isDirectSun: true,
      patientAge: 35,
      patientWeightKg: 80,
      activeMedications: ['Furosemide 40mg']
    });

    expect(assessment.hourlyHydrationRequirementMl).toBeGreaterThanOrEqual(800);
    expect(assessment.electrolytePrescription).toContain('Oral Rehydration Salts');
    expect(assessment.clinicalAdjudication).toContain('EXTREME CLINICAL HEAT HAZARD');
  });

  it('4. Classifies low normal thermal strain under mild ambient conditions with no vulnerable meds', () => {
    const assessment = service.evaluateHeatPosology({
      ambientTempF: 72,
      relativeHumidityPct: 40,
      isDirectSun: false,
      patientAge: 28,
      patientWeightKg: 68,
      activeMedications: []
    });

    expect(assessment.heatAcuityTier).toBe('LOW_NORMAL');
    expect(assessment.medicationVulnerabilities.length).toBe(0);
    expect(assessment.anhidrosisSweatRiskPct).toBeLessThanOrEqual(20);
    expect(assessment.acuteKidneyInjuryRiskTier).toBe('LOW');
  });

  it('5. Flags Carbonic Anhydrase Inhibitor (Topiramate) for severe anhidrosis risk', () => {
    const assessment = service.evaluateHeatPosology({
      ambientTempF: 104,
      relativeHumidityPct: 20,
      isDirectSun: true,
      patientAge: 24,
      patientWeightKg: 58,
      activeMedications: ['Topiramate 100mg']
    });

    expect(assessment.anhidrosisSweatRiskPct).toBeGreaterThanOrEqual(60);
    expect(assessment.medicationVulnerabilities.some(m => m.medication === 'Topiramate')).toBe(true);
    expect(assessment.medicationVulnerabilities[0].category).toBe('Carbonic_Anhydrase_Inhibitor');
  });

  it('6. Successfully retrieves microclimatic NOAA station observations for Phoenix (KPHX)', () => {
    const obs = service.getMicroclimaticObservation('KPHX');
    expect(obs.station).toBe('KPHX');
    expect(obs.location).toContain('Maricopa County');
    expect(obs.ambientTempF).toBe(114.0);
    expect(obs.isDirectSun).toBe(true);
  });
});
