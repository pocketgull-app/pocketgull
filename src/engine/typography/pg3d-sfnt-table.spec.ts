// SPDX-License-Identifier: Apache-2.0
import { describe, it, expect } from 'vitest';
import {
  Pg3dSfntCompiler,
  POCKETGULL_VARIABLE_AXES,
  POCKETGULL_CPAL_PALETTES,
} from './pg3d-sfnt-table';

describe('Pg3dSfntCompiler (Font-Embedded PG3D Table, GRAD/ZDEP Axes, CPAL & ISMP Guard)', () => {
  it('compiles a valid PG3D SFNT binary table with 0x50473344 magic header and 10 PUA glyphs', () => {
    const table = Pg3dSfntCompiler.compilePg3dTable();
    expect(table.magicTag).toBe('PG3D');
    expect(table.magicHex).toBe(0x50473344);
    expect(table.upm).toBe(1000);
    expect(table.glyphRecords.length).toBe(10);
    expect(table.binaryPayload[0]).toBe(0x50); // 'P'
    expect(table.binaryPayload[1]).toBe(0x47); // 'G'
    expect(table.binaryPayload[2]).toBe(0x33); // '3'
    expect(table.binaryPayload[3]).toBe(0x44); // 'D'
    expect(table.sha256Hex).toMatch(/^[0-9a-f]{64}$/);
  });

  it('defines wght, GRAD, ZDEP, CIRC (Circadian Melanopic), and BOUM (Bouma Anti-Crowding) variable font axes', () => {
    const tags = POCKETGULL_VARIABLE_AXES.map((a) => a.tag);
    expect(tags).toEqual(['wght', 'GRAD', 'ZDEP', 'CIRC', 'BOUM']);
    const gradAxis = POCKETGULL_VARIABLE_AXES.find((a) => a.tag === 'GRAD')!;
    const circAxis = POCKETGULL_VARIABLE_AXES.find((a) => a.tag === 'CIRC')!;
    expect(gradAxis.locksAdvanceWidth).toBe(true);
    expect(circAxis.locksAdvanceWidth).toBe(true);
    expect(circAxis.minValue).toBe(0);
    expect(circAxis.maxValue).toBe(1000);
  });

  it('enforces RSNA Melanopic EDI < 10 lx and CIELAB L* ~ 74 anti-chromostereopsis isoluminance in CPAL palettes', () => {
    const scotopic = POCKETGULL_CPAL_PALETTES.find((p) => p.paradigm === 'scotopic')!;
    const dicom = POCKETGULL_CPAL_PALETTES.find((p) => p.paradigm === 'dicom_gsdf')!;
    expect(scotopic.mEdiLuxCeiling).toBeLessThan(10);
    expect(dicom.mEdiLuxCeiling).toBeLessThan(10);
    for (const pal of POCKETGULL_CPAL_PALETTES) {
      expect(pal.cielabLightnessLStar).toBeGreaterThanOrEqual(73.5);
      expect(pal.cielabLightnessLStar).toBeLessThanOrEqual(74.5);
    }
  });

  it('evaluates ACR/NEMA DICOM Part 14 GSDF Barten JND LUT with lifted low-luminance shadow steps', () => {
    expect(Pg3dSfntCompiler.evaluateDicomPart14Gsdf(0)).toBe(0);
    expect(Pg3dSfntCompiler.evaluateDicomPart14Gsdf(1)).toBe(255);
    // At 1/15th normalized input (~6.7% sRGB), Barten GSDF lifts luminance to 24 (>9.4%) for dark trabecular/meniscal visibility
    expect(Pg3dSfntCompiler.evaluateDicomPart14Gsdf(1 / 15)).toBe(24);
  });

  it('computes circadian font-variation-settings and resolves Bouma peripheral callout crowding', () => {
    const nightVars = Pg3dSfntCompiler.computeCircadianFontVariationSettings({
      circadianTone: 'night',
      eccentricityNorm: 0.6,
      mayerPhaseNorm: 0.25,
    });
    expect(nightVars.wght).toBe(385);
    expect(nightVars.circ).toBe(0);
    expect(nightVars.boum).toBe(60);
    expect(nightVars.fontPalette).toBe('--scotopic-red');

    const crowded = [
      { id: 'acl', x: 200, y: 300 },
      { id: 'meniscus', x: 205, y: 308 },
    ];
    const separated = Pg3dSfntCompiler.solveBoumaCalloutRepulsion(crowded, 500, 400, 28);
    expect(Math.abs(separated[1].y - separated[0].y)).toBeGreaterThan(20);
    expect(separated[0].boumaAxisValue).toBeGreaterThan(0);
  });

  it('traps ISMP naked decimals (.5 mg), trailing zeroes (5.0 mg), and U/IU abbreviations', () => {
    const res = Pg3dSfntCompiler.enforceIsmpDosageTypography('Administer .5 mg or 5.0 mg and 10 U stat');
    expect(res.normalizedText).toBe('Administer 0.5 mg or 5 mg and 10 units stat');
    expect(res.trappedHazards).toContain('ISMP_NAKED_DECIMAL_TRAPPED');
    expect(res.trappedHazards).toContain('ISMP_TRAILING_ZERO_TRAPPED');
    expect(res.trappedHazards).toContain('ISMP_ABBREV_U_EXPANDED');
  });
});
