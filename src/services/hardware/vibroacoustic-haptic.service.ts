import { Injectable, signal, computed, inject, PLATFORM_ID, NgZone, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type VibroacousticHapticMode = 'isochronic_pulse' | 'rsa_breathing' | 'carrier_drone';

@Injectable({
  providedIn: 'root'
})
export class VibroacousticHapticService implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = (() => {
    try { return inject(NgZone, { optional: true }); } catch { return null; }
  })();
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly isHapticsActive = signal<boolean>(false);
  readonly isGamepadConnected = signal<boolean>(false);
  readonly isMobileVibrationSupported = signal<boolean>(
    this.isBrowser && typeof navigator !== 'undefined' && 'vibrate' in navigator
  );
  readonly hapticIntensity = signal<number>(0.75);
  readonly hapticMode = signal<VibroacousticHapticMode>('isochronic_pulse');

  private gamepadCheckTimer: any = null;

  constructor() {
    if (this.isBrowser && typeof window !== 'undefined') {
      window.addEventListener('gamepadconnected', () => this.checkGamepadConnection());
      window.addEventListener('gamepaddisconnected', () => this.checkGamepadConnection());
      this.checkGamepadConnection();
    }
  }

  ngOnDestroy(): void {
    this.stopHaptics();
    if (this.gamepadCheckTimer) {
      clearInterval(this.gamepadCheckTimer);
      this.gamepadCheckTimer = null;
    }
  }

  private checkGamepadConnection(): void {
    if (!this.isBrowser || typeof navigator === 'undefined' || !navigator.getGamepads) {
      this.isGamepadConnected.set(false);
      return;
    }

    try {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      let hasVibrationGamepad = false;
      for (const gp of gamepads) {
        if (gp && (gp.vibrationActuator || (gp as any).hapticActuators?.length > 0)) {
          hasVibrationGamepad = true;
          break;
        }
      }
      this.isGamepadConnected.set(hasVibrationGamepad);
    } catch {
      this.isGamepadConnected.set(false);
    }
  }

  /**
   * Toggles vibroacoustic somatosensory haptics
   */
  toggleHaptics(forceState?: boolean): boolean {
    const next = forceState !== undefined ? forceState : !this.isHapticsActive();
    this.isHapticsActive.set(next);
    if (!next) {
      this.stopHaptics();
    } else {
      // Trigger instant confirmation pulse
      this.triggerHapticPulse(50, this.hapticIntensity(), 'isochronic_pulse');
    }
    return next;
  }

  setHapticIntensity(intensity: number): void {
    const clamped = Math.max(0.05, Math.min(1.0, intensity));
    this.hapticIntensity.set(clamped);
  }

  setHapticMode(mode: VibroacousticHapticMode): void {
    this.hapticMode.set(mode);
  }

  /**
   * Triggers a real-time somatosensory vibrotactile pulse matching the Isochronic beat or Solfeggio carrier
   */
  triggerHapticPulse(durationMs: number = 40, intensity?: number, mode?: VibroacousticHapticMode): void {
    if (!this.isBrowser) return;

    const currentIntensity = intensity !== undefined ? intensity : this.hapticIntensity();
    const currentMode = mode || this.hapticMode();

    // 1. Dual-Motor Gamepad Haptic Actuator API (Xbox, DualSense, Switch Pro)
    if (typeof navigator !== 'undefined' && navigator.getGamepads) {
      try {
        const gamepads = navigator.getGamepads();
        for (const gp of gamepads) {
          if (gp && gp.vibrationActuator && typeof gp.vibrationActuator.playEffect === 'function') {
            const weakMag = currentMode === 'carrier_drone' ? currentIntensity * 0.8 : currentIntensity * 0.4;
            const strongMag = currentMode === 'isochronic_pulse' ? currentIntensity * 0.9 : currentIntensity * 0.5;

            gp.vibrationActuator.playEffect('dual-rumble', {
              startDelay: 0,
              duration: Math.max(20, durationMs),
              weakMagnitude: Math.min(1.0, weakMag),
              strongMagnitude: Math.min(1.0, strongMag)
            }).catch(() => {});
          }
        }
      } catch (e) {
        console.debug('[VibroacousticHapticService] Gamepad vibration error:', e);
      }
    }

    // 2. Web Vibration API for mobile devices (phones/tablets)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        const pulseTime = Math.max(10, Math.round(durationMs * currentIntensity));
        navigator.vibrate(pulseTime);
      } catch (e) {
        console.debug('[VibroacousticHapticService] Mobile vibration error:', e);
      }
    }
  }

  /**
   * Triggers a physical respiratory guidance wave for 0.10 Hz RSA cardiac coherence
   */
  triggerRsaBreathingWave(phase: 'inhale' | 'hold' | 'exhale'): void {
    if (!this.isBrowser || !this.isHapticsActive()) return;

    const intensity = this.hapticIntensity();
    if (phase === 'inhale') {
      this.triggerHapticPulse(120, intensity * 0.8, 'rsa_breathing');
    } else if (phase === 'hold') {
      this.triggerHapticPulse(40, intensity * 0.3, 'rsa_breathing');
    } else if (phase === 'exhale') {
      this.triggerHapticPulse(220, intensity * 0.6, 'rsa_breathing');
    }
  }

  /**
   * Stops all active haptic vibrations immediately
   */
  stopHaptics(): void {
    if (!this.isBrowser) return;

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch {}
    }

    if (typeof navigator !== 'undefined' && navigator.getGamepads) {
      try {
        const gamepads = navigator.getGamepads();
        for (const gp of gamepads) {
          if (gp && gp.vibrationActuator && typeof (gp.vibrationActuator as any).reset === 'function') {
            (gp.vibrationActuator as any).reset();
          }
        }
      } catch {}
    }
  }
}
