import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  createCyp3a4HemeMaterial,
  updateCyp3a4HemeUniforms,
  computeCatalyticThermodynamics,
  CatalyticStage,
  InhibitorBindingMode
} from './cyp3a4-heme-active-site.shader';

describe('Cyp3a4HemeActiveSiteShader', () => {
  it('should instantiate ShaderMaterial with required uniforms', () => {
    const mat = createCyp3a4HemeMaterial();
    expect(mat).toBeInstanceOf(THREE.ShaderMaterial);
    expect(mat.uniforms['uTime']).toBeDefined();
    expect(mat.uniforms['uStageIndex']).toBeDefined();
    expect(mat.uniforms['uInhibitorMode']).toBeDefined();
    expect(mat.uniforms['uThiolatePush']).toBeDefined();
    expect(mat.uniforms['uMembraneFluidity']).toBeDefined();
    expect(mat.uniforms['uColorRestingHeme']).toBeDefined();
  });

  it('should update uniforms properly with options', () => {
    const mat = createCyp3a4HemeMaterial({ catalyticStage: 'resting_ferric' });
    expect(mat.uniforms['uStageIndex'].value).toBe(0.0);

    updateCyp3a4HemeUniforms(mat, 12.5, {
      catalyticStage: 'compound_i_ferryl',
      inhibitorMode: 'competitive_azole',
      substrateBindingRatio: 0.95,
      thiolatePushIntensity: 1.3
    });

    expect(mat.uniforms['uTime'].value).toBe(12.5);
    expect(mat.uniforms['uStageIndex'].value).toBe(3.0);
    expect(mat.uniforms['uInhibitorMode'].value).toBe(1.0);
    expect(mat.uniforms['uSubstrateRatio'].value).toBe(0.95);
    expect(mat.uniforms['uThiolatePush'].value).toBe(1.3);
  });

  it('should compute resting ferric thermodynamics correctly', () => {
    const thermo = computeCatalyticThermodynamics('resting_ferric', 'none');
    expect(thermo.soretPeakNm).toBe(417);
    expect(thermo.coordinationNumber).toBe(6);
    expect(thermo.ironOxidationState).toContain('Fe3+');
  });

  it('should compute high-valent Compound I ferryl-oxo thermodynamics correctly', () => {
    const thermo = computeCatalyticThermodynamics('compound_i_ferryl', 'none');
    expect(thermo.soretPeakNm).toBe(365);
    expect(thermo.ironOxidationState).toContain('Fe4+=O');
    expect(thermo.freeEnergyKcalMol).toBeLessThan(-30);
  });

  it('should reflect optical shifts for competitive azole and suicide MBI inhibitors', () => {
    const azole = computeCatalyticThermodynamics('resting_ferric', 'competitive_azole');
    expect(azole.soretPeakNm).toBe(424);
    expect(azole.spectroscopicSignature).toContain('Type II');

    const mbi = computeCatalyticThermodynamics('resting_ferric', 'suicide_inactivation');
    expect(mbi.soretPeakNm).toBe(446);
    expect(mbi.spectroscopicSignature).toContain('Metabolite-Intermediate Complex');
  });
});
