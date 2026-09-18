import { Injectable, signal, computed } from '@angular/core';

export interface IDeviceHardwareProfile {
  deviceMemoryGb: number | null;
  hardwareConcurrency: number;
  effectiveConnectionType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  saveDataEnabled: boolean;
  isLowTierCpu: boolean;
  isConstrainedMemory: boolean;
  isConstrainedNetwork: boolean;
  isLowSpecOverall: boolean;
}

export interface IAdaptiveVisualTokens {
  renderMode: 'LITE_2D_ACCESSIBLE' | 'FULL_3D_WEBGL';
  disableBackdropBlur: boolean;
  prefer2dSvgAnatomy: boolean;
  particleAnimationBudget: number;
  audioSynthesizerEnabled: boolean;
  wcagContrastStandard: 'AAA_7_TO_1';
  touchTargetMinPx: number; // 48px minimum per Fitts's Law
}

@Injectable({
  providedIn: 'root'
})
export class AdaptiveHardwareGuardService {
  /** Signal for whether the user device has constrained memory/CPU/network */
  readonly isLowSpecDevice = signal<boolean>(false);

  /** Signal for whether user has Save-Data or low network bandwidth */
  readonly isDataSaverActive = signal<boolean>(false);

  /** User manual or automatic override for PocketGull Lite Mode */
  readonly isPocketGullLiteEnabled = signal<boolean>(false);

  /** Current active render mode */
  readonly renderMode = computed<'LITE_2D_ACCESSIBLE' | 'FULL_3D_WEBGL'>(() => {
    return this.isPocketGullLiteEnabled() || this.isLowSpecDevice() || this.isDataSaverActive()
      ? 'LITE_2D_ACCESSIBLE'
      : 'FULL_3D_WEBGL';
  });

  constructor() {
    this.detectHardwareProfile();
  }

  /**
   * Inspects browser navigator telemetry defensively to profile the host hardware.
   */
  detectHardwareProfile(): IDeviceHardwareProfile {
    if (typeof navigator === 'undefined') {
      return this.getDefaultDesktopProfile();
    }

    const nav = navigator as any;
    const deviceMemoryGb: number | null = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null;
    const hardwareConcurrency: number = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 4;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    const effectiveConnectionType = conn?.effectiveType || 'unknown';
    const saveDataEnabled = Boolean(conn?.saveData);

    const isLowTierCpu = hardwareConcurrency < 4;
    const isConstrainedMemory = deviceMemoryGb !== null && deviceMemoryGb < 4;
    const isConstrainedNetwork = effectiveConnectionType === 'slow-2g' || effectiveConnectionType === '2g' || effectiveConnectionType === '3g';
    const isLowSpecOverall = isLowTierCpu || isConstrainedMemory || isConstrainedNetwork || saveDataEnabled;

    this.isLowSpecDevice.set(isLowTierCpu || isConstrainedMemory);
    this.isDataSaverActive.set(saveDataEnabled || isConstrainedNetwork);
    if (isLowSpecOverall) {
      this.isPocketGullLiteEnabled.set(true);
    }

    return {
      deviceMemoryGb,
      hardwareConcurrency,
      effectiveConnectionType,
      saveDataEnabled,
      isLowTierCpu,
      isConstrainedMemory,
      isConstrainedNetwork,
      isLowSpecOverall
    };
  }

  /**
   * Toggles PocketGull Lite mode on or off.
   */
  togglePocketGullLite(enable?: boolean): void {
    if (typeof enable === 'boolean') {
      this.isPocketGullLiteEnabled.set(enable);
    } else {
      this.isPocketGullLiteEnabled.update(current => !current);
    }
  }

  /**
   * Returns tailored visual tokens that eliminate GPU and battery drain
   * on constrained devices while maintaining 100% WCAG AAA contrast and clinical accessibility.
   */
  getAdaptiveVisualTokens(): IAdaptiveVisualTokens {
    const isLite = this.renderMode() === 'LITE_2D_ACCESSIBLE';

    return {
      renderMode: this.renderMode(),
      disableBackdropBlur: isLite,
      prefer2dSvgAnatomy: isLite,
      particleAnimationBudget: isLite ? 0 : 50,
      audioSynthesizerEnabled: !isLite,
      wcagContrastStandard: 'AAA_7_TO_1',
      touchTargetMinPx: 48
    };
  }

  private getDefaultDesktopProfile(): IDeviceHardwareProfile {
    return {
      deviceMemoryGb: 8,
      hardwareConcurrency: 8,
      effectiveConnectionType: '4g',
      saveDataEnabled: false,
      isLowTierCpu: false,
      isConstrainedMemory: false,
      isConstrainedNetwork: false,
      isLowSpecOverall: false
    };
  }
}
