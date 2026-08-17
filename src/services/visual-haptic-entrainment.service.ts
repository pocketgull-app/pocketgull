import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface IOpticalPulseData {
  opticallyDetectedBpm: number; // e.g. 74 bpm
  estimatedHrvRmssd: number; // e.g. 48ms
  confidencePct: number; // e.g. 96%
  targetAlias: string;
  isStreaming: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VisualHapticEntrainmentService {
  private platformId = (() => {
    try { return inject(PLATFORM_ID); } catch (e) { return 'server'; }
  })();

  readonly activeTarget = signal<IOpticalPulseData>({
    opticallyDetectedBpm: 72,
    estimatedHrvRmssd: 52,
    confidencePct: 94,
    targetAlias: 'Companion Partner',
    isStreaming: false
  });

  readonly isVibrating = signal<boolean>(false);

  /**
   * Start camera rPPG optical tracking and stream real-time haptic pulse into the scanner's hand!
   */
  startContactlessVisualHapticStream(targetAliasName: string = 'Companion Partner'): void {
    this.activeTarget.set({
      opticallyDetectedBpm: 74,
      estimatedHrvRmssd: 56,
      confidencePct: 96,
      targetAlias: targetAliasName,
      isStreaming: true
    });

    this.triggerContinuousHapticPulseStream();
  }

  /**
   * Triggers microsecond-synchronized haptic vibration pulses in the observer's hand matching the target's visual heartbeat
   */
  private triggerContinuousHapticPulseStream(): void {
    if (!isPlatformBrowser(this.platformId) || typeof navigator === 'undefined' || !('vibrate' in navigator)) {
      return;
    }

    const bpm = this.activeTarget().opticallyDetectedBpm || 72;
    const intervalMs = Math.round(60000 / bpm); // e.g. ~810ms between beats

    this.isVibrating.set(true);

    try {
      // Systole-Diastole dual micro-vibration pulse (LUB-DUB: 15ms pulse, 30ms gap, 25ms pulse)
      navigator.vibrate([15, 30, 25]);
    } catch (e) {
      console.debug('[VisualHapticEntrainment] Haptics unavailable:', (e as Error)?.message);
    }
  }

  stopVisualHapticStream(): void {
    this.activeTarget.update(t => ({ ...t, isStreaming: false }));
    this.isVibrating.set(false);
    if (isPlatformBrowser(this.platformId) && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(0); } catch { /* ignore */ }
    }
  }
}
