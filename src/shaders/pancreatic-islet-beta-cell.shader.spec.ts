import { describe, it, expect } from 'vitest';
import {
  computeStimulusSecretionCoupling,
  createPancreaticIsletMaterial,
  updatePancreaticIsletUniforms
} from './pancreatic-islet-beta-cell.shader';

describe('PancreaticIsletBetaCellShader', () => {
  it('should compute resting stimulus-secretion parameters at fasting glucose (5.0 mM)', () => {
    const baseline = computeStimulusSecretionCoupling(5.0, 0.0, 0.0);
    expect(baseline.atpAdpRatio).toBeLessThan(3.5);
    expect(baseline.membranePotentialMv).toBeLessThan(-55.0);
    expect(baseline.calciumInfluxUm).toBeLessThan(0.6);
    expect(baseline.exocytosisRateHz).toBeLessThan(3.0);
  });

  it('should model glucose-stimulated insulin secretion (GSIS) at postprandial glucose (16.0 mM)', () => {
    const postprandial = computeStimulusSecretionCoupling(16.0, 0.0, 0.0);
    expect(postprandial.atpAdpRatio).toBeGreaterThan(5.0);
    expect(postprandial.membranePotentialMv).toBeGreaterThan(-45.0);
    expect(postprandial.calciumInfluxUm).toBeGreaterThan(1.0);
    expect(postprandial.exocytosisRateHz).toBeGreaterThan(6.0);
    expect(postprandial.secondPhaseRpFlux).toBeGreaterThan(35);
  });

  it('should model sulfonylurea (SUR1) drug-induced depolarization at fasting glucose', () => {
    const fasting = computeStimulusSecretionCoupling(4.5, 0.0, 0.0);
    const withSulfonylurea = computeStimulusSecretionCoupling(4.5, 0.85, 0.0);

    expect(withSulfonylurea.membranePotentialMv).toBeGreaterThan(fasting.membranePotentialMv);
    expect(withSulfonylurea.calciumInfluxUm).toBeGreaterThan(fasting.calciumInfluxUm);
    expect(withSulfonylurea.exocytosisRateHz).toBeGreaterThan(fasting.exocytosisRateHz);
  });

  it('should model IAPP amyloid oligomer suppression of exocytosis', () => {
    const highGlucoseNormal = computeStimulusSecretionCoupling(18.0, 0.0, 0.0);
    const highGlucoseAmyloid = computeStimulusSecretionCoupling(18.0, 0.0, 0.8);

    expect(highGlucoseAmyloid.calciumInfluxUm).toBeCloseTo(highGlucoseNormal.calciumInfluxUm, 1);
    expect(highGlucoseAmyloid.exocytosisRateHz).toBeLessThan(highGlucoseNormal.exocytosisRateHz * 0.6);
  });

  it('should create and update ShaderMaterial uniforms cleanly', () => {
    const mat = createPancreaticIsletMaterial();
    expect(mat).toBeDefined();
    expect(mat.uniforms['uGlucoseMm']).toBeDefined();
    expect(mat.transparent).toBe(true);

    updatePancreaticIsletUniforms(mat, 1.5, 12.0, 0.2, 0.3, 0.1);
    expect(mat.uniforms['uTime'].value).toBe(1.5);
    expect(mat.uniforms['uGlucoseMm'].value).toBe(12.0);
    expect(mat.uniforms['uAtpAdpRatio'].value).toBeGreaterThan(4.0);
  });
});
