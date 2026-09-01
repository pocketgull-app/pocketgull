import { describe, it, expect } from 'vitest';
import {
  SOLFEGGIO_CATALOG,
  BRAINWAVE_PRESETS,
  PERSIAN_DASTGAH_SCALES,
  DEFAULT_AVS_CONFIG,
  getSolfeggioToneById,
  getBrainwavePresetById
} from '../src/catalogs';

describe('Open Sanctuary Catalogs', () => {
  it('contains exactly 10 grounded Solfeggio & Harmonic frequencies', () => {
    expect(SOLFEGGIO_CATALOG.length).toBe(10);
    const frequencies = SOLFEGGIO_CATALOG.map(t => t.carrierFreqHz);
    expect(frequencies).toEqual([174, 285, 396, 417, 432, 528, 639, 741, 852, 963]);
  });

  it('correctly looks up Solfeggio tones by ID', () => {
    const tone528 = getSolfeggioToneById('solf-528');
    expect(tone528).toBeDefined();
    expect(tone528?.carrierFreqHz).toBe(528);
    expect(tone528?.name).toContain('528 Hz');

    const invalid = getSolfeggioToneById('non-existent');
    expect(invalid).toBeUndefined();
  });

  it('contains 6 distinct brainwave frequency bands', () => {
    expect(BRAINWAVE_PRESETS.length).toBe(6);
    const waveTypes = BRAINWAVE_PRESETS.map(p => p.waveType);
    expect(waveTypes).toEqual(['delta', 'theta', 'schumann', 'alpha', 'beta', 'gamma']);
  });

  it('correctly looks up brainwave presets by ID', () => {
    const schumann = getBrainwavePresetById('schumann-resonance');
    expect(schumann).toBeDefined();
    expect(schumann?.beatFreqHz).toBe(7.83);
    expect(schumann?.recommendedCarrierHz).toBe(432);
  });

  it('defines 4 authentic Persian Dastgah modal scales tuned to 432Hz baseline', () => {
    const modes = Object.keys(PERSIAN_DASTGAH_SCALES);
    expect(modes).toEqual(['Shur', 'Homayoun', 'Segah', 'Chahargah']);

    // Check Shur frequencies end at 432Hz
    const shur = PERSIAN_DASTGAH_SCALES['Shur'];
    expect(shur.frequencies.length).toBe(12);
    expect(shur.frequencies[shur.frequencies.length - 1]).toBe(432.0);
  });

  it('defines sensible and soothing default configuration', () => {
    expect(DEFAULT_AVS_CONFIG.carrierFreqHz).toBe(528);
    expect(DEFAULT_AVS_CONFIG.beatFreqHz).toBe(7.83);
    expect(DEFAULT_AVS_CONFIG.parasympatheticPacingEnabled).toBe(true);
    expect(DEFAULT_AVS_CONFIG.volume).toBeGreaterThan(0);
    expect(DEFAULT_AVS_CONFIG.noiseProfile).toBe('pink');
  });
});
