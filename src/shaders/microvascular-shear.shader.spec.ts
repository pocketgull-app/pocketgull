import { createMicrovascularShearMaterial, updateMicrovascularUniforms, GLSL_MICROVASCULAR_VERTEX, GLSL_MICROVASCULAR_FRAGMENT } from './microvascular-shear.shader';

describe('Microvascular Shear & Glycocalyx Shader (Visual Model V4)', () => {
  it('1. Creates shader material with physiological baseline uniforms', () => {
    const mat = createMicrovascularShearMaterial();
    expect(mat).toBeTruthy();
    expect(mat.transparent).toBe(true);
    expect(mat.uniforms['uShearStress'].value).toBe(22.0); // 22 dyn/cm2
    expect(mat.uniforms['uGlycocalyxThickness'].value).toBe(2.2); // 2.2 um
    expect(mat.uniforms['uSheddingRatio'].value).toBe(0.15);
    expect(mat.uniforms['uIsTurbulent'].value).toBe(0.0);
    expect(mat.uniforms['uNitricOxideProduction'].value).toBeGreaterThan(0.5);
  });

  it('2. Compiles custom options for low-shear turbulent atheroprone state', () => {
    const mat = createMicrovascularShearMaterial({
      shearStressDyn: 2.5,
      glycocalyxThicknessUm: 0.3,
      sheddingRatio: 0.9,
      isTurbulent: true,
      flowVelocity: 0.4,
      nitricOxideProduction: 0.1
    });

    expect(mat.uniforms['uShearStress'].value).toBe(2.5);
    expect(mat.uniforms['uGlycocalyxThickness'].value).toBe(0.3);
    expect(mat.uniforms['uSheddingRatio'].value).toBe(0.9);
    expect(mat.uniforms['uIsTurbulent'].value).toBe(1.0);
    expect(mat.uniforms['uNitricOxideProduction'].value).toBe(0.1);
  });

  it('3. Updates shader uniforms across animation frames via updateMicrovascularUniforms', () => {
    const mat = createMicrovascularShearMaterial();
    const initialTime = mat.uniforms['uTime'].value;

    updateMicrovascularUniforms(mat, 0.016, {
      shearStressDyn: 35.0,
      glycocalyxThicknessUm: 2.8,
      sheddingRatio: 0.05
    });

    expect(mat.uniforms['uTime'].value).toBeCloseTo(initialTime + 0.016, 3);
    expect(mat.uniforms['uShearStress'].value).toBe(35.0);
    expect(mat.uniforms['uGlycocalyxThickness'].value).toBe(2.8);
    expect(mat.uniforms['uSheddingRatio'].value).toBe(0.05);
  });

  it('4. GLSL shader sources include Poiseuille shear and glycocalyx algorithms', () => {
    expect(GLSL_MICROVASCULAR_VERTEX).toContain('pulse');
    expect(GLSL_MICROVASCULAR_VERTEX).toContain('gl_Position');
    expect(GLSL_MICROVASCULAR_FRAGMENT).toContain('COLOR_PHYSIO_TEAL');
    expect(GLSL_MICROVASCULAR_FRAGMENT).toContain('COLOR_TURBULENT_RED');
    expect(GLSL_MICROVASCULAR_FRAGMENT).toContain('COLOR_GLYCOCALYX_GOLD');
    expect(GLSL_MICROVASCULAR_FRAGMENT).toContain('uGlycocalyxThickness');
    expect(GLSL_MICROVASCULAR_FRAGMENT).toContain('uNitricOxideProduction');
  });
});
