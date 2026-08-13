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

  it('1. Initializes 528Hz Solfeggio / 6Hz Theta binaural beat configuration', () => {
    const cfg = service.sessionConfig();
    expect(cfg.carrierFreqHz).toBe(528);
    expect(cfg.binauralBeatHz).toBe(6);
    expect(service.leftOscFreq()).toBe(528);
    expect(service.rightOscFreq()).toBe(534);
  });

  it('2. Updates session config dynamically and toggles playback state', () => {
    service.updateSessionConfig({ carrierFreqHz: 432, binauralBeatHz: 10 });
    expect(service.leftOscFreq()).toBe(432);
    expect(service.rightOscFreq()).toBe(442);

    const isPlaying = service.toggleSession();
    expect(isPlaying).toBe(true);
    expect(service.isPlaying()).toBe(true);
  });
});
