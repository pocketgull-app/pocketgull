import { Injectable, signal } from '@angular/core';

export type SolfeggioTone = 432 | 528 | 639 | 741;

@Injectable({
  providedIn: 'root'
})
export class BioHapticFeedbackService {
  private audioCtx: AudioContext | null = null;
  readonly isAudioToneActive = signal<boolean>(false);
  readonly currentFrequencyHz = signal<SolfeggioTone>(528);

  /**
   * Triggers a Solfeggio harmonic frequency sine wave via Web Audio API.
   */
  playSolfeggioTone(freqHz: SolfeggioTone = 528, durationMs: number = 2000): void {
    if (typeof window === 'undefined') return;

    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqHz, this.audioCtx.currentTime);

      // Smooth envelope (fade-in & fade-out)
      gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, this.audioCtx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + (durationMs / 1000));

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + (durationMs / 1000));

      this.currentFrequencyHz.set(freqHz);
      this.isAudioToneActive.set(true);

      setTimeout(() => {
        this.isAudioToneActive.set(false);
      }, durationMs);
    } catch (e) {
      console.warn('[BioHaptic] Web Audio API initialization failed:', e);
    }
  }

  /**
   * Synthesizes NASA's Cassini Saturn SKR Radio Plasma Emission soundscape (150Hz carrier + 0.2Hz LFO chorus modulation).
   */
  playNasaSaturnSkrTone(durationMs: number = 3000): void {
    if (typeof window === 'undefined') return;

    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const carrierOsc = this.audioCtx.createOscillator();
      const lfoOsc = this.audioCtx.createOscillator();
      const lfoGain = this.audioCtx.createGain();
      const masterGain = this.audioCtx.createGain();

      // Saturn SKR plasma frequency settings (FM modulation)
      carrierOsc.type = 'sawtooth';
      carrierOsc.frequency.setValueAtTime(150, this.audioCtx.currentTime);

      lfoOsc.type = 'sine';
      lfoOsc.frequency.setValueAtTime(0.2, this.audioCtx.currentTime); // 0.2 Hz slow cosmic pulse
      lfoGain.gain.setValueAtTime(45, this.audioCtx.currentTime); // +-45Hz frequency modulation depth

      lfoOsc.connect(lfoGain);
      lfoGain.connect(carrierOsc.frequency);

      masterGain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.12, this.audioCtx.currentTime + 0.2);
      masterGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + (durationMs / 1000));

      carrierOsc.connect(masterGain);
      masterGain.connect(this.audioCtx.destination);

      lfoOsc.start();
      carrierOsc.start();

      lfoOsc.stop(this.audioCtx.currentTime + (durationMs / 1000));
      carrierOsc.stop(this.audioCtx.currentTime + (durationMs / 1000));

      this.isAudioToneActive.set(true);

      setTimeout(() => {
        this.isAudioToneActive.set(false);
      }, durationMs);
    } catch (e) {
      console.warn('[BioHaptic] Saturn SKR synthesis error:', e);
    }
  }

  /**
   * Triggers Web Haptics vibration pulse patterns for breathing & somatic feedback.
   */
  triggerHapticPulse(phase: 'inhale' | 'hold' | 'exhale'): void {
    if (typeof window === 'undefined' || !navigator.vibrate) return;

    try {
      if (phase === 'inhale') {
        navigator.vibrate([100, 200, 100]);
      } else if (phase === 'hold') {
        navigator.vibrate([50, 50, 50]);
      } else if (phase === 'exhale') {
        navigator.vibrate([300, 100, 150]);
      }
    } catch (e) {
      console.debug('[BioHapticFeedback] Haptics unavailable:', (e as Error)?.message);
    }
  }

  /**
   * Triggers a dual-pulse Web Haptics vibration pattern for interactive card/tool feedback.
   */
  triggerDualPulse(firstPulseMs: number = 25, pauseMs: number = 40, secondPulseMs: number = 25): void {
    if (typeof window === 'undefined' || !navigator.vibrate) return;

    try {
      navigator.vibrate([firstPulseMs, pauseMs, secondPulseMs]);
    } catch (e) {
      console.debug('[BioHapticFeedback] Dual-pulse haptics unavailable:', (e as Error)?.message);
    }
  }
}
