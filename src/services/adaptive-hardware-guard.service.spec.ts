import { describe, it, expect, beforeEach } from 'vitest';
import { AdaptiveHardwareGuardService } from './adaptive-hardware-guard.service';

describe('AdaptiveHardwareGuardService (Pillar 5: Digital Divide & Low-Spec Mode)', () => {
  let service: AdaptiveHardwareGuardService;

  beforeEach(() => {
    service = new AdaptiveHardwareGuardService();
  });

  it('1. Initializes and detects default hardware environment', () => {
    const profile = service.detectHardwareProfile();
    expect(profile).toBeDefined();
    expect(typeof profile.hardwareConcurrency).toBe('number');
    expect(typeof profile.isLowSpecOverall).toBe('boolean');
  });

  it('2. Switches to LITE_2D_ACCESSIBLE render mode when low-spec device or data saver is active', () => {
    service.isLowSpecDevice.set(true);
    expect(service.renderMode()).toBe('LITE_2D_ACCESSIBLE');

    const tokens = service.getAdaptiveVisualTokens();
    expect(tokens.renderMode).toBe('LITE_2D_ACCESSIBLE');
    expect(tokens.disableBackdropBlur).toBe(true);
    expect(tokens.prefer2dSvgAnatomy).toBe(true);
    expect(tokens.particleAnimationBudget).toBe(0);
    expect(tokens.audioSynthesizerEnabled).toBe(false);
    expect(tokens.touchTargetMinPx).toBe(48);
  });

  it('3. Supports explicit user manual toggle for PocketGull Lite Mode', () => {
    service.isLowSpecDevice.set(false);
    service.isDataSaverActive.set(false);
    service.togglePocketGullLite(true);

    expect(service.isPocketGullLiteEnabled()).toBe(true);
    expect(service.renderMode()).toBe('LITE_2D_ACCESSIBLE');

    service.togglePocketGullLite(false);
    expect(service.isPocketGullLiteEnabled()).toBe(false);
    expect(service.renderMode()).toBe('FULL_3D_WEBGL');
  });

  it('4. Enforces WCAG AAA (7:1) contrast and 48px minimum hitboxes across all modes', () => {
    const liteTokens = service.getAdaptiveVisualTokens();
    expect(liteTokens.wcagContrastStandard).toBe('AAA_7_TO_1');
    expect(liteTokens.touchTargetMinPx).toBeGreaterThanOrEqual(44);

    service.togglePocketGullLite(false);
    const fullTokens = service.getAdaptiveVisualTokens();
    expect(fullTokens.wcagContrastStandard).toBe('AAA_7_TO_1');
    expect(fullTokens.touchTargetMinPx).toBeGreaterThanOrEqual(44);
  });
});
