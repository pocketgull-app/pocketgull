import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface IPersonalThemeSong {
  userId: string;
  themeSongName: string;
  soundtrackGenre: 'SOLFEGGIO_AMBIENT' | 'HEROIC_FANFARE' | 'JAZZ_CHILL' | 'FOREST_ACOUSTIC';
  baseFrequencyHz: number; // e.g. 528Hz, 432Hz, 660Hz
  bpmPulse: number; // e.g. 72 bpm
  emojiBadge: string;
  playOnQrScan: boolean;
  hapticVibrationPattern: number[];
}

@Injectable({
  providedIn: 'root'
})
export class BioThemeSongEngineService {
  private platformId = (() => {
    try { return inject(PLATFORM_ID); } catch (e) { return 'server'; }
  })();

  readonly myThemeSong = signal<IPersonalThemeSong>({
    userId: 'user-self',
    themeSongName: 'Solfeggio Vagal Coherence Fanfare',
    soundtrackGenre: 'SOLFEGGIO_AMBIENT',
    baseFrequencyHz: 528,
    bpmPulse: 72,
    emojiBadge: '🎵🎧🌟',
    playOnQrScan: true,
    hapticVibrationPattern: [20, 50, 35, 50, 50]
  });

  /**
   * Synthesizes and plays a person's custom bio-theme song AND haptic vibration pulse when their QR code is scanned!
   */
  playPeerThemeSongOnQrScan(song?: IPersonalThemeSong): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const theme = song || this.myThemeSong();
    if (!theme.playOnQrScan) return;

    // Trigger synchronized haptic vibration pulse
    this.triggerHapticVibrationPulse(theme.bpmPulse);

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const baseFreq = theme.baseFrequencyHz || 528;
      const beatDurationSec = 60 / (theme.bpmPulse || 72);

      // Play a 3-note ascending harmonic entrance fanfare (Root -> Major 3rd -> Perfect 5th)
      const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = theme.soundtrackGenre === 'JAZZ_CHILL' ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * (beatDurationSec * 0.4));

        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * (beatDurationSec * 0.4));
        gain.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + (idx + 1) * (beatDurationSec * 0.4));

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * (beatDurationSec * 0.4));
        osc.stop(ctx.currentTime + (idx + 1) * (beatDurationSec * 0.4));
      });
    } catch (e) {
      console.debug('[BioThemeSongEngine] AudioContext unavailable:', (e as Error)?.message);
    }
  }

  /**
   * Triggers rhythmic haptic vibration pulse matching user heart rate BPM
   */
  triggerHapticVibrationPulse(bpmPulse: number = 72): void {
    if (!isPlatformBrowser(this.platformId) || typeof navigator === 'undefined' || !('vibrate' in navigator)) {
      return;
    }

    try {
      const pulseMs = Math.max(15, Math.round(60000 / bpmPulse * 0.04));
      const restMs = Math.max(30, Math.round(60000 / bpmPulse * 0.12));
      navigator.vibrate([pulseMs, restMs, pulseMs * 1.5, restMs, pulseMs * 2]);
    } catch (e) {
      console.debug('[BioThemeSongEngine] Haptic vibration unavailable:', (e as Error)?.message);
    }
  }

  /**
   * Update personal theme song settings
   */
  updateThemeSong(updated: Partial<IPersonalThemeSong>): void {
    this.myThemeSong.update(s => ({ ...s, ...updated }));
  }
}
