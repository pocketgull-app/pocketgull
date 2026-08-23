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

  it('1. Initializes 528Hz Solfeggio / 6Hz Theta binaural beat with 4608kbps Studio Master tier', () => {
    const cfg = service.sessionConfig();
    expect(cfg.carrierFreqHz).toBe(528);
    expect(cfg.binauralBeatHz).toBe(6);
    expect(cfg.bitrateTier).toBe('4608k_master');
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
});
