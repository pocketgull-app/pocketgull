import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID } from '@angular/core';
import { VibroacousticHapticService } from './vibroacoustic-haptic.service';

describe('VibroacousticHapticService Suite', () => {
  const createService = (isBrowser = true) => {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: isBrowser ? 'browser' : 'server' },
        VibroacousticHapticService
      ]
    });
    return runInInjectionContext(injector, () => injector.get(VibroacousticHapticService));
  };

  it('1. Initializes with inactive haptics and default intensity/mode', () => {
    const service = createService();
    expect(service.isHapticsActive()).toBe(false);
    expect(service.hapticIntensity()).toBe(0.75);
    expect(service.hapticMode()).toBe('isochronic_pulse');
  });

  it('2. Toggles haptic feedback state and clamps intensity within valid range (0.05 to 1.0)', () => {
    const service = createService();
    expect(service.isHapticsActive()).toBe(false);

    const active = service.toggleHaptics(true);
    expect(active).toBe(true);
    expect(service.isHapticsActive()).toBe(true);

    service.setHapticIntensity(0.5);
    expect(service.hapticIntensity()).toBe(0.5);

    // Clamping checks
    service.setHapticIntensity(1.5);
    expect(service.hapticIntensity()).toBe(1.0);

    service.setHapticIntensity(-0.2);
    expect(service.hapticIntensity()).toBe(0.05);

    service.toggleHaptics(false);
    expect(service.isHapticsActive()).toBe(false);
  });

  it('3. Switches haptic modes across isochronic_pulse, rsa_breathing, and carrier_drone', () => {
    const service = createService();
    expect(service.hapticMode()).toBe('isochronic_pulse');

    service.setHapticMode('rsa_breathing');
    expect(service.hapticMode()).toBe('rsa_breathing');

    service.setHapticMode('carrier_drone');
    expect(service.hapticMode()).toBe('carrier_drone');
  });

  it('4. Triggers haptic pulse and breathing guidance without throwing unhandled errors', () => {
    const service = createService();
    service.toggleHaptics(true);

    expect(() => service.triggerHapticPulse(40, 0.8, 'isochronic_pulse')).not.toThrow();
    expect(() => service.triggerRsaBreathingWave('inhale')).not.toThrow();
    expect(() => service.triggerRsaBreathingWave('hold')).not.toThrow();
    expect(() => service.triggerRsaBreathingWave('exhale')).not.toThrow();
    expect(() => service.stopHaptics()).not.toThrow();
  });

  it('5. Handles server-side rendering (SSR) cleanly without window/navigator exceptions', () => {
    const ssrService = createService(false);
    expect(ssrService.isHapticsActive()).toBe(false);
    expect(() => ssrService.toggleHaptics(true)).not.toThrow();
    expect(() => ssrService.triggerHapticPulse()).not.toThrow();
    expect(() => ssrService.ngOnDestroy()).not.toThrow();
  });
});
