import { describe, it, expect } from 'vitest';
import { computeCoInfectionRadar } from '../src/engine/co-infection-radar.js';

describe('Co-Infection Radar Engine', () => {
  it('1. Computes baseline low risk for unattached blacklegged tick without symptoms', () => {
    const scores = computeCoInfectionRadar('ixodes_nymph', { attachmentHours: 0 });
    const lyme = scores.find(s => s.pathogenId === 'lyme_borrelia');
    const babesia = scores.find(s => s.pathogenId === 'babesiosis');

    expect(lyme?.probabilityPercent).toBeLessThan(10);
    expect(babesia?.probabilityPercent).toBeLessThan(5);
  });

  it('2. Escalates Lyme disease probability when Erythema migrans is reported', () => {
    const scores = computeCoInfectionRadar('ixodes_nymph', {
      attachmentHours: 48,
      hasErythemaMigrans: true
    });
    const lyme = scores.find(s => s.pathogenId === 'lyme_borrelia');

    expect(lyme?.probabilityPercent).toBeGreaterThanOrEqual(70);
    expect(lyme?.riskLevel).toBe('Critically Elevated');
    expect(lyme?.clinicalFlag).toContain('Erythema Migrans');
  });

  it('3. Triggers Babesiosis alert for drenching night sweats and hemolytic dark urine', () => {
    const scores = computeCoInfectionRadar('ixodes_adult', {
      attachmentHours: 48,
      hasDrenchingSweats: true,
      hasDarkUrineJaundice: true,
      hasFeverChills: true
    });
    const babesia = scores.find(s => s.pathogenId === 'babesiosis');

    expect(babesia?.probabilityPercent).toBeGreaterThanOrEqual(80);
    expect(babesia?.clinicalFlag).toContain('Hemolytic');
  });

  it('4. Correctly flags Alpha-Gal syndrome for Lone Star tick bites with red meat intolerance', () => {
    const scores = computeCoInfectionRadar('amblyomma_lonestar', {
      attachmentHours: 12,
      hasRedMeatAllergy: true
    });
    const alphaGal = scores.find(s => s.pathogenId === 'alpha_gal');

    expect(alphaGal?.probabilityPercent).toBeGreaterThanOrEqual(80);
    expect(alphaGal?.clinicalFlag).toContain('Anaphylaxis');
  });
});
