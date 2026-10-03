import { describe, it, expect } from 'vitest';
import {
  computeCypCatalyticState,
  createCyp3a4HemeMaterial,
  updateCyp3a4HemeUniforms
} from './cyp3a4-heme-active-site.shader';

describe('Cyp3a4HemeActiveSiteShader (Visual Model V10)', () => {
  it('1. should compute resting Fe(III) hexacoordinate state at phase 0', () => {
    const resting = computeCypCatalyticState(0, 0);
    expect(resting.ironValence).toContain('Fe(III)');
    expect(resting.spinState).toContain('Low-Spin');
    expect(resting.soretPeakNm).toBe(418);
    expect(resting.hemeIntegrity).toBe(1.0);
    expect(resting.ferrylOxoGlow).toBeLessThan(0.3);
  });

  it('2. should model Compound I [Fe4+=O] ferryl-oxo radical cation peak at phase 4', () => {
    const compoundI = computeCypCatalyticState(4, 0);
    expect(compoundI.ironValence).toContain('[Fe(IV)=O]');
    expect(compoundI.spinState).toContain('Radical');
    expect(compoundI.soretPeakNm).toBe(450); // Canonical P450 peak
    expect(compoundI.ferrylOxoGlow).toBe(2.0); // Maximum reactive glow
    expect(compoundI.reactionDescription).toContain('Compound I Generation');
  });

  it('3. should model competitive azole inhibitor binding (Ketoconazole)', () => {
    const azole = computeCypCatalyticState(4, 1);
    expect(azole.ironValence).toContain('Fe(III)-Azole');
    expect(azole.soretPeakNm).toBe(432); // Type II spectral shift
    expect(azole.ferrylOxoGlow).toBeLessThan(0.1); // Blocks oxo formation
    expect(azole.reactionDescription).toContain('Competitive Reversible');
  });

  it('4. should model mechanism-based inactivation (MBI) covalent suicide destruction (Clarithromycin)', () => {
    const mbi = computeCypCatalyticState(4, 2, 2.0);
    expect(mbi.ironValence).toContain('Covalent Adduct');
    expect(mbi.soretPeakNm).toBeLessThan(430); // P420 degradation
    expect(mbi.hemeIntegrity).toBeLessThan(0.5); // Heme destroyed
    expect(mbi.reactionDescription).toContain('Mechanism-Based Inactivation');
  });

  it('5. should create and update Three.js ShaderMaterial cleanly', () => {
    const mat = createCyp3a4HemeMaterial();
    expect(mat).toBeDefined();
    expect(mat.uniforms['uCatalyticCyclePhase']).toBeDefined();
    expect(mat.uniforms['uFerrylOxoIntensity']).toBeDefined();
    expect(mat.transparent).toBe(true);

    updateCyp3a4HemeUniforms(mat, 2.5, 4, 0, 1.0);
    expect(mat.uniforms['uTime'].value).toBe(2.5);
    expect(mat.uniforms['uCatalyticCyclePhase'].value).toBe(4);
    expect(mat.uniforms['uFerrylOxoIntensity'].value).toBe(2.0);
    expect(mat.uniforms['uSoretAbsorbanceNm'].value).toBe(450);
  });
});
