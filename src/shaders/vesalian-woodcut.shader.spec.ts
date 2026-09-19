import { describe, it, expect } from 'vitest';
import {
  WGSL_VESALIAN_WOODCUT_SOURCE,
  createVesalianWoodcutMaterial
} from './vesalian-woodcut.shader';

describe('VesalianWoodcutShader', () => {
  it('should export valid cross-platform WGSL shader source with pennation vectors and chiaroscuro hatching', () => {
    expect(WGSL_VESALIAN_WOODCUT_SOURCE).toContain('@vertex');
    expect(WGSL_VESALIAN_WOODCUT_SOURCE).toContain('@fragment');
    expect(WGSL_VESALIAN_WOODCUT_SOURCE).toContain('pennationAngleRad');
    expect(WGSL_VESALIAN_WOODCUT_SOURCE).toContain('hatchScale');
    expect(WGSL_VESALIAN_WOODCUT_SOURCE).toContain('muscleTension');
    expect(WGSL_VESALIAN_WOODCUT_SOURCE).toContain('activeLusterColor');
  });

  it('should instantiate Three.js ShaderMaterial with custom woodcut uniforms and scotopic defaults', () => {
    const mat = createVesalianWoodcutMaterial({
      hatchScale: 32.0,
      pennationAngleDeg: 60.0,
      muscleTension: 0.75,
      scotopicMode: true
    });

    expect(mat).toBeDefined();
    expect(mat.uniforms['uHatchScale'].value).toBe(32.0);
    expect(mat.uniforms['uMuscleTension'].value).toBe(0.75);
    expect(mat.uniforms['uScotopicMode'].value).toBe(1.0);
    expect(mat.uniforms['uReliefDepth'].value).toBe(1.8);
    expect(mat.vertexShader).toContain('vNormal');
    expect(mat.vertexShader).toContain('vPosition');
    expect(mat.fragmentShader).toContain('uPennationAngleRad');
    expect(mat.fragmentShader).toContain('uLusterColor');
    expect(mat.fragmentShader).toContain('bumpNormal');
  });

  it('should correctly support light Washi paper mode when scotopicMode is false', () => {
    const mat = createVesalianWoodcutMaterial({
      scotopicMode: false
    });

    expect(mat.uniforms['uScotopicMode'].value).toBe(0.0);
    expect(mat.uniforms['uInkColor'].value.getHex()).toBe(0x1c1917);
    expect(mat.uniforms['uPaperColor'].value.getHex()).toBe(0xfaf8f0);
  });

  it('should support smooth ecorche_cast and woodcut surfaceStyle toggling', () => {
    const defaultMat = createVesalianWoodcutMaterial();
    expect(defaultMat.uniforms['uSurfaceStyle'].value).toBe(0.0); // Default to smooth ecorche cast

    const woodcutMat = createVesalianWoodcutMaterial({
      surfaceStyle: 'woodcut'
    });
    expect(woodcutMat.uniforms['uSurfaceStyle'].value).toBe(1.0);
  });
});
