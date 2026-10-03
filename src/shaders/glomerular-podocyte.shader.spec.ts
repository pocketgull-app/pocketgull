import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  GLSL_GLOMERULAR_VERTEX,
  GLSL_GLOMERULAR_FRAGMENT,
  createGlomerularPodocyteMaterial,
  updateGlomerularUniforms
} from './glomerular-podocyte.shader';

describe('GlomerularPodocyteShader (Visual Model V5)', () => {
  it('1. Exports valid GLSL vertex and fragment source code with biophysical terms', () => {
    expect(GLSL_GLOMERULAR_VERTEX).toContain('uIntraglomerularPressure');
    expect(GLSL_GLOMERULAR_VERTEX).toContain('uEffacementRatio');
    expect(GLSL_GLOMERULAR_VERTEX).toContain('pedicelRidge');

    expect(GLSL_GLOMERULAR_FRAGMENT).toContain('uGbmChargeIntegrity');
    expect(GLSL_GLOMERULAR_FRAGMENT).toContain('uSlitDiaphragmWidthNm');
    expect(GLSL_GLOMERULAR_FRAGMENT).toContain('uAlbuminuriaLeakRate');
    expect(GLSL_GLOMERULAR_FRAGMENT).toContain('COLOR_PODOCYTE_TEAL');
    expect(GLSL_GLOMERULAR_FRAGMENT).toContain('COLOR_EFFACED_AMBER');
    expect(GLSL_GLOMERULAR_FRAGMENT).toContain('COLOR_ALBUMIN_GREEN');
    expect(GLSL_GLOMERULAR_FRAGMENT).toContain('fenestrationMask');
  });

  it('2. Initializes Three.js ShaderMaterial with physiological default parameters', () => {
    const mat = createGlomerularPodocyteMaterial();
    expect(mat).toBeInstanceOf(THREE.ShaderMaterial);
    expect(mat.side).toBe(THREE.DoubleSide);

    expect(mat.uniforms['uIntraglomerularPressure'].value).toBe(36.0);
    expect(mat.uniforms['uEffacementRatio'].value).toBe(0.0);
    expect(mat.uniforms['uGbmChargeIntegrity'].value).toBe(1.0);
    expect(mat.uniforms['uSlitDiaphragmWidthNm'].value).toBe(35.0);
    expect(mat.uniforms['uAlbuminuriaLeakRate'].value).toBe(0.0);
  });

  it('3. Initializes Three.js ShaderMaterial with custom pathophysiological inputs', () => {
    const mat = createGlomerularPodocyteMaterial({
      intraglomerularPressureMmHg: 55.0,
      effacementRatio: 0.85,
      gbmChargeIntegrity: 0.2,
      slitDiaphragmWidthNm: 8.0,
      albuminuriaLeakRate: 0.95
    });

    expect(mat.uniforms['uIntraglomerularPressure'].value).toBe(55.0);
    expect(mat.uniforms['uEffacementRatio'].value).toBe(0.85);
    expect(mat.uniforms['uGbmChargeIntegrity'].value).toBe(0.2);
    expect(mat.uniforms['uSlitDiaphragmWidthNm'].value).toBe(8.0);
    expect(mat.uniforms['uAlbuminuriaLeakRate'].value).toBe(0.95);
  });

  it('4. Updates time and biophysical options smoothly via updateGlomerularUniforms', () => {
    const mat = createGlomerularPodocyteMaterial();
    expect(mat.uniforms['uTime'].value).toBe(0.0);

    updateGlomerularUniforms(mat, 0.016, {
      effacementRatio: 0.45,
      albuminuriaLeakRate: 0.3
    });

    expect(mat.uniforms['uTime'].value).toBeCloseTo(0.016, 3);
    expect(mat.uniforms['uEffacementRatio'].value).toBe(0.45);
    expect(mat.uniforms['uAlbuminuriaLeakRate'].value).toBe(0.3);
  });

  it('5. Gracefully handles null or undefined uniforms when updating', () => {
    const dummyMat = new THREE.ShaderMaterial();
    delete (dummyMat as any).uniforms;
    expect(() => updateGlomerularUniforms(dummyMat, 0.016)).not.toThrow();
  });
});
