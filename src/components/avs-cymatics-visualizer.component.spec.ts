import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID, signal } from '@angular/core';
import { AvsCymaticsVisualizerComponent } from './avs-cymatics-visualizer.component';
import { AvsEngineService } from '../services/avs-engine.service';
import { BleWearablesService } from '../services/hardware/ble-wearables.service';

describe('AvsCymaticsVisualizerComponent Suite', () => {
  let mockAvsEngine: any;
  let mockBleWearables: any;

  const createComponent = (isBrowser = true) => {
    mockAvsEngine = {
      isPlaying: signal(false),
      sessionConfig: signal({ carrierFreqHz: 528, binauralBeatHz: 6 }),
      activeSolfeggioTone: signal({ name: '528Hz Transformation & DNA Integrity' }),
      getRealtimeFftData: (buf: Uint8Array) => buf.fill(128),
      getRealtimeTimeDomainData: (buf: Uint8Array) => buf.fill(128),
      applySolfeggioTone: () => {},
      toggleSession: () => true
    };

    mockBleWearables = {
      isConnected: signal(true),
      cardiacResonanceHz: signal(0.10)
    };

    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: isBrowser ? 'browser' : 'server' },
        { provide: AvsEngineService, useValue: mockAvsEngine },
        { provide: BleWearablesService, useValue: mockBleWearables }
      ]
    });

    return runInInjectionContext(injector, () => new AvsCymaticsVisualizerComponent());
  };

  it('1. Initializes with default chladni_cymatics mode and computed carrier/beat frequencies', () => {
    const comp = createComponent();
    expect(comp.activeMode()).toBe('chladni_cymatics');
    expect(comp.activeCarrierHz()).toBe(528);
    expect(comp.activeBeatHz()).toBe(6);
    expect(comp.activeRightFreq()).toBe(534);
    expect(comp.chladniModes()).toEqual({ n: 4, m: 6 });
  });

  it('2. Maps carrier frequencies dynamically to Chladni modal integer pairs (n, m)', () => {
    const comp = createComponent();

    // 432 Hz Pythagorean -> (3, 5)
    mockAvsEngine.sessionConfig.set({ carrierFreqHz: 432, binauralBeatHz: 7.83 });
    expect(comp.activeCarrierHz()).toBe(432);
    expect(comp.chladniModes()).toEqual({ n: 3, m: 5 });

    // 963 Hz Crown Pineal -> (7, 9)
    mockAvsEngine.sessionConfig.set({ carrierFreqHz: 963, binauralBeatHz: 40 });
    expect(comp.activeCarrierHz()).toBe(963);
    expect(comp.chladniModes()).toEqual({ n: 7, m: 9 });
  });

  it('3. Handles mode switching cleanly across all 4 cymatic visualizer states', () => {
    const comp = createComponent();
    expect(comp.activeMode()).toBe('chladni_cymatics');

    comp.setMode('lissajous_phase');
    expect(comp.activeMode()).toBe('lissajous_phase');

    comp.setMode('sacred_mandala');
    expect(comp.activeMode()).toBe('sacred_mandala');

    comp.setMode('fft_spectrogram');
    expect(comp.activeMode()).toBe('fft_spectrogram');
  });

  it('4. Handles server-side rendering (SSR) without window/canvas crashes', () => {
    const ssrComp = createComponent(false);
    expect(() => ssrComp.ngOnInit()).not.toThrow();
    expect(() => ssrComp.ngOnDestroy()).not.toThrow();
  });
});
