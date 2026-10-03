import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  createHepaticSinusoidMaterial,
  updateHepaticSinusoidUniforms,
  computeSinusoidalResistance,
  computeMetabolicClearanceEfficiency
} from './hepatic-sinusoid-space-of-disse.shader';

describe('Hepatic Sinusoid & Space of Disse Shader (Visual Model V8)', () => {
  it('1. Initializes THREE.ShaderMaterial with healthy F0 sinusoidal defaults', () => {
    const mat = createHepaticSinusoidMaterial();
    expect(mat).toBeInstanceOf(THREE.ShaderMaterial);
    expect(mat.uniforms.uFibrosisStage.value).toBe(0);
    expect(mat.uniforms.uFenestrationPorosity.value).toBe(1.0);
    expect(mat.uniforms.uCollagenDensity.value).toBe(0.0);
    expect(mat.uniforms.uHvpgMmHg.value).toBe(3.0);
    expect(mat.uniforms.uStellateActivation.value).toBe(0.0);
    expect(mat.side).toBe(THREE.DoubleSide);
  });

  it('2. Evaluates sinusoidal resistance and HVPG across progressive METAVIR stages', () => {
    // Normal healthy liver (F0, zero collagen scar)
    const f0 = computeSinusoidalResistance(0, 0.0);
    expect(f0.hvpgMmHg).toBe(3.0);
    expect(f0.csphPresent).toBe(false);
    expect(f0.varicealBleedRiskPercent).toBe(2);

    // Bridging fibrosis (F3, collagen 0.5): crosses CSPH threshold (>= 10 mmHg)
    const f3 = computeSinusoidalResistance(3, 0.5);
    expect(f3.hvpgMmHg).toBeGreaterThanOrEqual(10.0);
    expect(f3.csphPresent).toBe(true);

    // Severe Cirrhosis (F4, collagen 0.9): high risk of variceal hemorrhage
    const f4 = computeSinusoidalResistance(4, 0.9);
    expect(f4.hvpgMmHg).toBeGreaterThanOrEqual(16.0);
    expect(f4.csphPresent).toBe(true);
    expect(f4.varicealBleedRiskPercent).toBeGreaterThanOrEqual(35);
  });

  it('3. Computes metabolic clearance impairment due to sinusoidal capillarization and Disse scarring', () => {
    // Healthy open sieve plates (porosity 1.0, collagen 0.0)
    const healthy = computeMetabolicClearanceEfficiency(1.0, 0.0);
    expect(healthy.clearanceRatePercent).toBe(100);
    expect(healthy.albuminSecretoryReservePercent).toBe(100);

    // Severe defenestration and dense space of Disse collagen deposition
    const capillarized = computeMetabolicClearanceEfficiency(0.15, 0.85);
    expect(capillarized.clearanceRatePercent).toBeLessThan(20);
    expect(capillarized.albuminSecretoryReservePercent).toBeLessThan(45);
  });

  it('4. Dynamically updates shader uniforms with updateHepaticSinusoidUniforms', () => {
    const mat = createHepaticSinusoidMaterial();
    updateHepaticSinusoidUniforms(mat, {
      fibrosisStage: 3,
      fenestrationPorosity: 0.35,
      collagenDensity: 0.65,
      stellateActivationRatio: 0.80,
      hvpgMmHg: 13.5,
      sinusoidalFlowVelocity: 1.4
    }, 5.5);

    expect(mat.uniforms.uTime.value).toBe(5.5);
    expect(mat.uniforms.uFibrosisStage.value).toBe(3);
    expect(mat.uniforms.uFenestrationPorosity.value).toBe(0.35);
    expect(mat.uniforms.uCollagenDensity.value).toBe(0.65);
    expect(mat.uniforms.uStellateActivation.value).toBe(0.80);
    expect(mat.uniforms.uHvpgMmHg.value).toBe(13.5);
    expect(mat.uniforms.uFlowVelocity.value).toBe(1.4);
  });
});
