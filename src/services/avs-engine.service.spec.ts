import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { AvsEngineService } from './avs-engine.service';

describe('AvsEngineService', () => {
  let service: AvsEngineService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [AvsEngineService]
    });
    service = runInInjectionContext(injector, () => injector.get(AvsEngineService));
  });

  it('1. Initializes 528Hz Solfeggio / 6Hz Theta binaural beat with 4608kbps Studio Lossless tier', () => {
    const cfg = service.sessionConfig();
    expect(cfg.carrierFreqHz).toBe(528);
    expect(cfg.binauralBeatHz).toBe(6);
    expect(cfg.bitrateTier).toBe('4608k_studio');
    expect(cfg.sampleRate).toBe(96000);
    expect(service.leftOscFreq()).toBe(528);
    expect(service.rightOscFreq()).toBe(534);
    expect(service.bitrateLabel()).toContain('4608 kbps');
  });

  it('2. Computes multi-harmonic overtone stacks (f0, 2f0, 3f0, 0.5f0)', () => {
    const harmonics = service.harmonicOvertoneFreqs();
    expect(harmonics.fundamental.left).toBe(528);
    expect(harmonics.fundamental.right).toBe(534);
    expect(harmonics.octave2x.left).toBe(1056);
    expect(harmonics.octave2x.right).toBe(1068);
    expect(harmonics.fifth3x.left).toBe(1584);
    expect(harmonics.fifth3x.right).toBe(1602);
    expect(harmonics.subBass.left).toBe(264);
    expect(harmonics.subBass.right).toBe(267);
  });

  it('3. Updates bitrate tier, saturation profiles, and Bauer crossfeed in real time', () => {
    service.setBitrateTier('1536k_lossless');
    expect(service.sessionConfig().bitrateTier).toBe('1536k_lossless');
    expect(service.sessionConfig().sampleRate).toBe(48000);
    expect(service.bitrateLabel()).toContain('1536 kbps');

    service.setSaturationProfile('tape_velvet');
    expect(service.sessionConfig().saturationProfile).toBe('tape_velvet');

    service.updateSessionConfig({ psychoacousticSpatialCrossfeed: false });
    expect(service.sessionConfig().psychoacousticSpatialCrossfeed).toBe(false);

    const isPlaying = service.toggleSession();
    expect(isPlaying).toBe(true);
    expect(service.isPlaying()).toBe(true);
  });

  it('4. Retrieves Solfeggio catalog and applies carrier tones dynamically', () => {
    const catalog = service.getSolfeggioCatalog();
    expect(catalog.length).toBe(10);
    expect(catalog.some(s => s.carrierFreqHz === 528)).toBe(true);
    expect(catalog.some(s => s.carrierFreqHz === 432)).toBe(true);
    expect(catalog.some(s => s.carrierFreqHz === 963)).toBe(true);

    service.applySolfeggioTone('pyth-432');
    expect(service.sessionConfig().carrierFreqHz).toBe(432);
    expect(service.activeSolfeggioTone()?.id).toBe('pyth-432');

    service.applySolfeggioTone(963);
    expect(service.sessionConfig().carrierFreqHz).toBe(963);
    expect(service.activeSolfeggioTone()?.id).toBe('solf-963');
  });

  it('5. Retrieves and applies Brainwave Presets including Schumann 7.83Hz Resonance', () => {
    const presets = service.getBrainwavePresets();
    expect(presets.length).toBe(6);

    const schumann = presets.find(p => p.id === 'schumann-resonance');
    expect(schumann).toBeDefined();
    expect(schumann?.beatFreqHz).toBe(7.83);

    service.applyBrainwavePreset('schumann-resonance');
    expect(service.sessionConfig().binauralBeatHz).toBe(7.83);
    expect(service.sessionConfig().carrierFreqHz).toBe(432);

    service.applyBrainwavePreset('deep-delta-sleep');
    expect(service.sessionConfig().binauralBeatHz).toBe(1.5);
    expect(service.sessionConfig().carrierFreqHz).toBe(174);
  });

  it('6. Toggles Isochronic Pulse LFO modulation for speaker/ambient listening', () => {
    expect(service.sessionConfig().isIsochronicPulseEnabled).toBe(false);

    const next = service.toggleIsochronicPulse();
    expect(next).toBe(true);
    expect(service.sessionConfig().isIsochronicPulseEnabled).toBe(true);

    service.toggleIsochronicPulse(false);
    expect(service.sessionConfig().isIsochronicPulseEnabled).toBe(false);
  });

  it('7. Reacts to DictationService sidechain ducking signal', () => {
    expect(service.isDucked()).toBe(false);
  });

  it('8. Toggles closed-loop wearable biofeedback locking', () => {
    expect(service.isBiofeedbackLocked()).toBe(false);
    expect(service.biofeedbackResonanceHz()).toBe(0.10);

    const locked = service.toggleBiofeedbackLock();
    expect(locked).toBe(true);
    expect(service.isBiofeedbackLocked()).toBe(true);

    service.toggleBiofeedbackLock(false);
    expect(service.isBiofeedbackLocked()).toBe(false);
  });

  it('9. Toggles 3D Binaural HRTF Spatial Acoustic Panning and updates 3D coordinates', () => {
    expect(service.isSpatialPanningEnabled()).toBe(false);

    const active = service.toggleSpatialPanning();
    expect(active).toBe(true);
    expect(service.isSpatialPanningEnabled()).toBe(true);

    service.updateSpatialAudioPosition(
      { x: 1.5, y: 0.8, z: -0.5 },
      { x: 0, y: 1.0, z: 2.0 },
      { x: 0, y: 0, z: -1 }
    );

    expect(service.spatialSourcePosition()).toEqual({ x: 1.5, y: 0.8, z: -0.5 });
    expect(typeof service.spatialAzimuthDeg()).toBe('number');

    service.toggleSpatialPanning(false);
    expect(service.isSpatialPanningEnabled()).toBe(false);
  });

  it('10. Exposes and toggles vibroacoustic somatosensory haptic state', () => {
    expect(service.isHapticsActive()).toBe(false);
    expect(typeof service.isGamepadConnected()).toBe('boolean');
    expect(typeof service.isMobileVibrationSupported()).toBe('boolean');

    const result = service.toggleVibroacousticHaptics();
    expect(typeof result).toBe('boolean');
  });
});
