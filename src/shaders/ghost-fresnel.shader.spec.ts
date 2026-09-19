import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  WGSL_GHOST_FRESNEL_SOURCE,
  createGhostFresnelMaterial
} from './ghost-fresnel.shader';

describe('GhostFresnelShader', () => {
  it('should export valid cross-platform WGSL shader source with rim lighting and spherical cutaway', () => {
    expect(WGSL_GHOST_FRESNEL_SOURCE).toContain('@vertex');
    expect(WGSL_GHOST_FRESNEL_SOURCE).toContain('@fragment');
    expect(WGSL_GHOST_FRESNEL_SOURCE).toContain('u.rimPower');
    expect(WGSL_GHOST_FRESNEL_SOURCE).toContain('u.breatheScale');
    expect(WGSL_GHOST_FRESNEL_SOURCE).toContain('u.cutawayCenter');
    expect(WGSL_GHOST_FRESNEL_SOURCE).toContain('smoothstep');
  });

  it('should instantiate Three.js ShaderMaterial with custom ghost uniforms and default transparent depth configuration', () => {
    const mat = createGhostFresnelMaterial({
      rimColor: 0x14b8a6,
      rimPower: 3.2,
      innerAlpha: 0.05,
      rimAlpha: 0.92,
      cutawayActive: true,
      cutawayRadius: 0.40
    });

    expect(mat).toBeDefined();
    expect(mat.transparent).toBe(true);
    expect(mat.depthWrite).toBe(false);
    expect(mat.uniforms['uRimPower'].value).toBe(3.2);
    expect(mat.uniforms['uInnerAlpha'].value).toBe(0.05);
    expect(mat.uniforms['uRimAlpha'].value).toBe(0.92);
    expect(mat.uniforms['uCutawayActive'].value).toBe(1.0);
    expect(mat.uniforms['uCutawayRadius'].value).toBe(0.40);
    expect(mat.vertexShader).toContain('vViewPosition');
    expect(mat.fragmentShader).toContain('uCutawayCenter');
  });

  it('should update cutaway center coordinates accurately', () => {
    const targetLocus = new THREE.Vector3(0.14, -0.52, 0); // Patellar locus
    const mat = createGhostFresnelMaterial({
      cutawayCenter: targetLocus,
      cutawayActive: true
    });

    expect(mat.uniforms['uCutawayCenter'].value.x).toBe(0.14);
    expect(mat.uniforms['uCutawayCenter'].value.y).toBe(-0.52);
    expect(mat.uniforms['uCutawayActive'].value).toBe(1.0);
  });
});
