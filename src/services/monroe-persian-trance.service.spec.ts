import '@angular/compiler';
import { MonroePersianTranceService, HEMISPHERIC_PRESETS } from './monroe-persian-trance.service';

describe('MonroePersianTranceService Suite with Indigenous & Native Trances', () => {
  let service: MonroePersianTranceService;

  beforeEach(() => {
    service = new MonroePersianTranceService();
  });

  it('1. Initializes with inactive audio playback and default KSS 3', () => {
    expect(service.isPlaying()).toBe(false);
    expect(service.currentMode()).toBeNull();
    expect(service.currentKss()).toBe(3);
    expect(service.masterVolume()).toBe(0.12);
  });

  it('2. Contains Monroe, Indigenous Native, Hemispherical, Persian, and Animal presets', () => {
    expect(HEMISPHERIC_PRESETS.length).toBeGreaterThanOrEqual(17);

    const monroe10 = HEMISPHERIC_PRESETS.find(p => p.id === 'monroe_focus_10');
    expect(monroe10).toBeDefined();
    expect(monroe10?.category).toBe('monroe');

    const cedarFlute = HEMISPHERIC_PRESETS.find(p => p.id === 'indigenous_cedar_flute');
    expect(cedarFlute).toBeDefined();
    expect(cedarFlute?.category).toBe('indigenous');
    expect(cedarFlute?.name).toContain('Sacred Cedar Flute');

    const waterDrum = HEMISPHERIC_PRESETS.find(p => p.id === 'native_water_drum_theta');
    expect(waterDrum).toBeDefined();
    expect(waterDrum?.binauralBeatHz).toBe(4.5); // Theta 4.5Hz

    const rattle = HEMISPHERIC_PRESETS.find(p => p.id === 'gourd_rattle_clearing');
    expect(rattle).toBeDefined();
    expect(rattle?.category).toBe('indigenous');

    const canoe = HEMISPHERIC_PRESETS.find(p => p.id === 'wabanaki_canoe_cadence');
    expect(canoe).toBeDefined();

    const emdr = HEMISPHERIC_PRESETS.find(p => p.id === 'emdr_bilateral_alpha');
    expect(emdr).toBeDefined();

    const shur = HEMISPHERIC_PRESETS.find(p => p.id === 'persian_dastgah_shur');
    expect(shur).toBeDefined();
    expect(shur?.carrierFreqHz).toBe(432.0);

    const feline = HEMISPHERIC_PRESETS.find(p => p.id === 'feline_purr');
    expect(feline).toBeDefined();
  });

  it('3. Adaptively returns the appropriate indigenous/persian/monroe protocol per KSS level', () => {
    const alertPreset = service.getAdaptivePresetForKss(2);
    expect(alertPreset.id).toBe('persian_mahur_flow');

    const midPreset = service.getAdaptivePresetForKss(5);
    expect(midPreset.id).toBe('indigenous_cedar_flute');

    const sleepyPreset = service.getAdaptivePresetForKss(8);
    expect(sleepyPreset.id).toBe('native_water_drum_theta');
  });

  it('4. Updates volume within valid bounds', () => {
    service.setVolume(0.5);
    expect(service.masterVolume()).toBe(0.5);

    service.setVolume(2.0);
    expect(service.masterVolume()).toBe(1.0);

    service.setVolume(-1.0);
    expect(service.masterVolume()).toBe(0.0);
  });
});
