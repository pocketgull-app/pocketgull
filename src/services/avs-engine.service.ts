import { Injectable, signal, computed } from '@angular/core';

export interface IAvsSessionConfig {
  carrierFreqHz: number; // e.g. 528Hz (Solfeggio Transformation) or 432Hz (Harmonic)
  binauralBeatHz: number; // e.g. 6Hz (Theta Deep Relaxation) or 10Hz (Alpha Focus)
  volume: number; // 0.0 - 1.0
  isStrobeEnabled: boolean;
  strobeColorHex: string;
}

@Injectable({
  providedIn: 'root'
})
export class AvsEngineService {
  private config = signal<IAvsSessionConfig>({
    carrierFreqHz: 528,
    binauralBeatHz: 6,
    volume: 0.5,
    isStrobeEnabled: false,
    strobeColorHex: '#38bdf8'
  });

  private isPlayingSignal = signal<boolean>(false);

  readonly sessionConfig = this.config.asReadonly();
  readonly isPlaying = this.isPlayingSignal.asReadonly();

  readonly leftOscFreq = computed(() => this.config().carrierFreqHz);
  readonly rightOscFreq = computed(() => this.config().carrierFreqHz + this.config().binauralBeatHz);

  /**
   * Updates AVS parameters in real time
   */
  updateSessionConfig(patch: Partial<IAvsSessionConfig>): void {
    this.config.update(curr => ({ ...curr, ...patch }));
  }

  /**
   * Toggle AVS session state
   */
  toggleSession(): boolean {
    const nextState = !this.isPlayingSignal();
    this.isPlayingSignal.set(nextState);
    return nextState;
  }
}
