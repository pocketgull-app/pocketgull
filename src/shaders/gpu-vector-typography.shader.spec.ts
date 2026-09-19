import { describe, it, expect } from 'vitest';
import {
  WGSL_VECTOR_TYPOGRAPHY_SOURCE,
  GLSL_VECTOR_LABEL_VERTEX,
  GLSL_VECTOR_LABEL_FRAGMENT,
  createGpuVectorLabel3D
} from './gpu-vector-typography.shader';

describe('GpuVectorTypographyShader', () => {
  it('should export valid cross-platform WGSL shader source with analytical fwidth and scotopic anti-fringing', () => {
    expect(WGSL_VECTOR_TYPOGRAPHY_SOURCE).toContain('@vertex');
    expect(WGSL_VECTOR_TYPOGRAPHY_SOURCE).toContain('@fragment');
    expect(WGSL_VECTOR_TYPOGRAPHY_SOURCE).toContain('fwidth(dist)');
    expect(WGSL_VECTOR_TYPOGRAPHY_SOURCE).toContain('smoothstep');
    expect(WGSL_VECTOR_TYPOGRAPHY_SOURCE).toContain('uniforms.vagalScale');
  });

  it('should export valid Three.js GLSL shaders with screen-space derivative antialiasing', () => {
    expect(GLSL_VECTOR_LABEL_VERTEX).toContain('uVagalScale');
    expect(GLSL_VECTOR_LABEL_VERTEX).toContain('projectionMatrix');

    expect(GLSL_VECTOR_LABEL_FRAGMENT).toContain('uThreshold');
    expect(GLSL_VECTOR_LABEL_FRAGMENT).toContain('fwidth(dist)');
    expect(GLSL_VECTOR_LABEL_FRAGMENT).toContain('uScotopicMode');
    expect(GLSL_VECTOR_LABEL_FRAGMENT).toContain('gl_FragColor');
  });

  it('should instantiate a 3D vector label mesh with custom ShaderMaterial when DOM canvas is available', () => {
    if (typeof document !== 'undefined' && document.createElement) {
      const label = createGpuVectorLabel3D('Trabecular Core - 1.5% BMD', {
        color: 0xf59e0b,
        fontSize: 32
      });

      expect(label.mesh).toBeDefined();
      expect(label.material).toBeDefined();
      expect(label.material.uniforms['uVagalScale'].value).toBe(1.0);
      expect(label.material.uniforms['uScotopicMode'].value).toBe(1);

      // Verify vagal scale update
      label.updateVagalScale(1.025);
      expect(label.material.uniforms['uVagalScale'].value).toBe(1.025);
    }
  });
});
