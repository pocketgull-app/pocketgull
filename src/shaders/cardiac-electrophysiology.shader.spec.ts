import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  GLSL_CARDIAC_VERTEX,
  GLSL_CARDIAC_FRAGMENT,
  createCardiacElectrophysiologyMaterial,
  updateCardiacUniforms
} from './cardiac-electrophysiology.shader';

describe('CardiacElectrophysiologyShader (Visual Model V6)', () => {
  it('1. Exports valid GLSL vertex and fragment source code with electrophysiology terms', () => {
    expect(GLSL_CARDIAC_VERTEX).toContain('uHeartRateBpm');
    expect(GLSL_CARDIAC_VERTEX).toContain('uQtcIntervalMs');
    expect(GLSL_CARDIAC_VERTEX).toContain('uConductionVelocity');
    expect(GLSL_CARDIAC_VERTEX).toContain('eadFlutter');

    expect(GLSL_CARDIAC_FRAGMENT).toContain('COLOR_REST_DIASTOLE');
    expect(GLSL_CARDIAC_FRAGMENT).toContain('COLOR_PHASE0_DEPOL');
    expect(GLSL_CARDIAC_FRAGMENT).toContain('COLOR_PHASE2_PLATEAU');
    expect(GLSL_CARDIAC_FRAGMENT).toContain('COLOR_PHASE3_REPOL');
    expect(GLSL_CARDIAC_FRAGMENT).toContain('COLOR_EAD_ARRHYTHMIA');
  });

  it('2. Initializes Three.js ShaderMaterial with normal physiological parameters', () => {
    const mat = createCardiacElectrophysiologyMaterial();
    expect(mat).toBeInstanceOf(THREE.ShaderMaterial);
    expect(mat.side).toBe(THREE.DoubleSide);

    expect(mat.uniforms['uHeartRateBpm'].value).toBe(72.0);
    expect(mat.uniforms['uQtcIntervalMs'].value).toBe(410.0);
    expect(mat.uniforms['uConductionVelocity'].value).toBe(1.0);
    expect(mat.uniforms['uEadInstability'].value).toBe(0.0);
    expect(mat.uniforms['uIsLongQtc'].value).toBe(0.0);
  });

  it('3. Initializes Three.js ShaderMaterial with drug-induced Long QTc inputs', () => {
    const mat = createCardiacElectrophysiologyMaterial({
      heartRateBpm: 84.0,
      qtcIntervalMs: 540.0,
      conductionVelocity: 0.8,
      eadInstability: 0.85,
      isLongQtcActive: true
    });

    expect(mat.uniforms['uHeartRateBpm'].value).toBe(84.0);
    expect(mat.uniforms['uQtcIntervalMs'].value).toBe(540.0);
    expect(mat.uniforms['uConductionVelocity'].value).toBe(0.8);
    expect(mat.uniforms['uEadInstability'].value).toBe(0.85);
    expect(mat.uniforms['uIsLongQtc'].value).toBe(1.0);
  });

  it('4. Updates time and electrophysiology uniforms via updateCardiacUniforms', () => {
    const mat = createCardiacElectrophysiologyMaterial();
    expect(mat.uniforms['uTime'].value).toBe(0.0);

    updateCardiacUniforms(mat, 0.016, {
      qtcIntervalMs: 495.0,
      eadInstability: 0.5
    });

    expect(mat.uniforms['uTime'].value).toBeCloseTo(0.016, 3);
    expect(mat.uniforms['uQtcIntervalMs'].value).toBe(495.0);
    expect(mat.uniforms['uEadInstability'].value).toBe(0.5);
  });

  it('5. Gracefully handles null or missing uniforms when updating', () => {
    const dummyMat = new THREE.ShaderMaterial();
    delete (dummyMat as any).uniforms;
    expect(() => updateCardiacUniforms(dummyMat, 0.016)).not.toThrow();
  });
});
