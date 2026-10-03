import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  createAlveolarCapillaryMaterial,
  updateAlveolarCapillaryUniforms,
  computeFicksDiffusionRate,
  computeHpvResponse,
  computePeepRecruitment
} from './alveolar-capillary-gas-exchange.shader';

describe('Alveolar-Capillary Gas Exchange Shader (Visual Model V7)', () => {
  it('1. Initializes THREE.ShaderMaterial with physiological blood-air barrier defaults', () => {
    const mat = createAlveolarCapillaryMaterial();
    expect(mat).toBeInstanceOf(THREE.ShaderMaterial);
    expect(mat.uniforms.uAlveolarPaO2.value).toBe(100);
    expect(mat.uniforms.uVenousPvO2.value).toBe(40);
    expect(mat.uniforms.uMembraneThicknessUm.value).toBe(0.35);
    expect(mat.uniforms.uPeepCmH2O.value).toBe(5);
    expect(mat.uniforms.uSurfactantDepletion.value).toBe(0.0);
    expect(mat.uniforms.uAlveolarFlooding.value).toBe(0.0);
    expect(mat.uniforms.uHpvVasoconstriction.value).toBe(0.0);
    expect(mat.side).toBe(THREE.DoubleSide);
  });

  it('2. Evaluates Fick\'s Law of Diffusion under normal and pathological conditions', () => {
    // Normal resting baseline: PaO2 = 100, PvO2 = 40, thickness = 0.35 um
    const normalFlux = computeFicksDiffusionRate(100, 40, 0.35);
    expect(normalFlux).toBeGreaterThanOrEqual(240);
    expect(normalFlux).toBeLessThanOrEqual(260);

    // Thickened membrane (fibrosis / ARDS hyaline membrane): thickness = 1.4 um (4x thicker)
    const impairedFlux = computeFicksDiffusionRate(100, 40, 1.4);
    expect(impairedFlux).toBeLessThan(normalFlux / 3.5);

    // Zero gradient: PaO2 = 40, PvO2 = 40 -> 0 mL/min
    const zeroGradientFlux = computeFicksDiffusionRate(40, 40, 0.35);
    expect(zeroGradientFlux).toBe(0);
  });

  it('3. Computes Euler-Liljestrand Hypoxic Pulmonary Vasoconstriction (HPV) response', () => {
    // Well-ventilated alveolus (PaO2 = 100 mmHg): zero vasoconstriction, normal V/Q ~ 1.0
    const normoxic = computeHpvResponse(100);
    expect(normoxic.constrictionRatio).toBeLessThan(0.05);
    expect(normoxic.shuntFraction).toBeLessThan(0.06);
    expect(normoxic.vqRatio).toBeGreaterThanOrEqual(0.9);

    // Moderate alveolar hypoxia (PaO2 = 50 mmHg): inflection point of constriction
    const moderateHypoxia = computeHpvResponse(50);
    expect(moderateHypoxia.constrictionRatio).toBeCloseTo(0.5, 1);
    expect(moderateHypoxia.shuntFraction).toBeGreaterThan(0.04);

    // Severe alveolar hypoxia (PaO2 = 30 mmHg): strong vasoconstriction shunting perfusion away
    const severeHypoxia = computeHpvResponse(30);
    expect(severeHypoxia.constrictionRatio).toBeGreaterThan(0.75);
    expect(severeHypoxia.shuntFraction).toBeLessThan(0.35); // Blunted by active HPV
  });

  it('4. Evaluates PEEP recruitment along sigmoidal pressure-volume curve', () => {
    // Surfactant-depleted, flooded ARDS lung at zero PEEP (ZEEP: 0 cmH2O)
    const zeep = computePeepRecruitment(0, 0.8, 0.7);
    expect(zeep.openAlveoliPercent).toBeLessThan(35);
    expect(zeep.complianceMlCmH2O).toBeLessThan(25);
    expect(zeep.overdistended).toBe(false);

    // Optimal recruitment with therapeutic PEEP (14 cmH2O)
    const optimalPeep = computePeepRecruitment(14, 0.8, 0.7);
    expect(optimalPeep.openAlveoliPercent).toBeGreaterThanOrEqual(70);
    expect(optimalPeep.complianceMlCmH2O).toBeGreaterThan(zeep.complianceMlCmH2O);
    expect(optimalPeep.overdistended).toBe(false);

    // Excessive PEEP (22 cmH2O): overdistention warning and compliance fall
    const highPeep = computePeepRecruitment(22, 0.8, 0.7);
    expect(highPeep.overdistended).toBe(true);
    expect(highPeep.complianceMlCmH2O).toBeLessThan(optimalPeep.complianceMlCmH2O);
  });

  it('5. Dynamically updates shader uniforms with updateAlveolarCapillaryUniforms', () => {
    const mat = createAlveolarCapillaryMaterial();
    updateAlveolarCapillaryUniforms(mat, {
      alveolarPaO2: 65,
      venousPvO2: 32,
      membraneThicknessUm: 1.8,
      hpvVasoconstriction: 0.65,
      surfactantDepletion: 0.7,
      alveolarFloodingRatio: 0.5,
      peepCmH2O: 12,
      respiratoryRateBpm: 24,
      flowVelocity: 1.8
    }, 4.25);

    expect(mat.uniforms.uTime.value).toBe(4.25);
    expect(mat.uniforms.uAlveolarPaO2.value).toBe(65);
    expect(mat.uniforms.uVenousPvO2.value).toBe(32);
    expect(mat.uniforms.uMembraneThicknessUm.value).toBe(1.8);
    expect(mat.uniforms.uHpvVasoconstriction.value).toBe(0.65);
    expect(mat.uniforms.uSurfactantDepletion.value).toBe(0.7);
    expect(mat.uniforms.uAlveolarFlooding.value).toBe(0.5);
    expect(mat.uniforms.uPeepCmH2O.value).toBe(12);
    expect(mat.uniforms.uRespiratoryRate.value).toBe(24);
    expect(mat.uniforms.uFlowVelocity.value).toBe(1.8);
  });
});
