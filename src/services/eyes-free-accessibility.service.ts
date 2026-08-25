import { Injectable, signal, computed } from '@angular/core';

export type VitalSonificationType = 'heartRate' | 'bloodPressure' | 'glucose' | 'respiration';
export type HapticPatternType = 'CONFIRM' | 'REMINDER' | 'PACED_BREATHING' | 'WARNING';

export interface ITactileMedicationGuide {
  medicationName: string;
  dosage: string;
  schedule: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'BEDTIME';
  tactileShapeDescription: string;
  audioEarconFrequencyHz: number;
}

@Injectable({
  providedIn: 'root',
})
export class EyesFreeAccessibilityService {
  readonly isEyesFreeModeActive = signal<boolean>(false);
  readonly lastScreenReaderAnnouncement = signal<string>('');
  readonly activeSonificationStatus = signal<string | null>(null);
  readonly isSpeechPlaying = signal<boolean>(false);

  private audioCtx: AudioContext | null = null;

  private readonly mockMedications: ITactileMedicationGuide[] = [
    {
      medicationName: 'Metformin HCl',
      dosage: '500 mg',
      schedule: 'MORNING',
      tactileShapeDescription: 'Large white oval tablet with a smooth glossy coating and a deep tactile centerline score.',
      audioEarconFrequencyHz: 523.25 // C5 chime
    },
    {
      medicationName: 'Atorvastatin Calcium',
      dosage: '20 mg',
      schedule: 'EVENING',
      tactileShapeDescription: 'Small round white tablet with beveled edges and embossed letter "A" on one side.',
      audioEarconFrequencyHz: 659.25 // E5 chime
    },
    {
      medicationName: 'CoQ10 Ubiquinol',
      dosage: '100 mg',
      schedule: 'MORNING',
      tactileShapeDescription: 'Soft squishy amber gelatin capsule filled with liquid gel, approximately 1.5 cm long.',
      audioEarconFrequencyHz: 783.99 // G5 chime
    }
  ];

  readonly tactileMedications = signal<ITactileMedicationGuide[]>(this.mockMedications);

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  toggleEyesFreeMode(): void {
    this.isEyesFreeModeActive.update((v) => {
      const next = !v;
      const statusText = next
        ? 'Eyes-Free Accessibility Mode is now Active. Audio telemetry and high-contrast voice navigation enabled.'
        : 'Eyes-Free Accessibility Mode turned off.';
      this.announceScreenReader(statusText, 'assertive');
      this.speakText(statusText);
      this.triggerHapticPattern('CONFIRM');
      return next;
    });
  }

  /**
   * Generates real-time audio sonification tones for biometric telemetry.
   * Maps numeric vital ranges into pleasant harmonic frequencies (220 Hz - 880 Hz).
   */
  sonifyVitalSign(vitalType: VitalSonificationType, value: number): void {
    const ctx = this.getAudioContext();
    let frequency = 440;
    let description = '';

    switch (vitalType) {
      case 'heartRate':
        // 60 bpm -> 330 Hz, 100 bpm -> 550 Hz
        frequency = 330 + ((value - 60) / 40) * 220;
        description = `Heart rate sonification: ${Math.round(value)} beats per minute (${Math.round(frequency)} Hertz tone).`;
        break;
      case 'glucose':
        // 70 mg/dL -> 350 Hz, 180 mg/dL -> 700 Hz
        frequency = 350 + ((value - 70) / 110) * 350;
        description = `Blood glucose sonification: ${Math.round(value)} milligrams per deciliter.`;
        break;
      case 'bloodPressure':
        // 120 mmHg -> 440 Hz
        frequency = 440 + ((value - 120) / 40) * 160;
        description = `Systolic blood pressure sonification: ${Math.round(value)} millimeters of mercury.`;
        break;
      case 'respiration':
        frequency = 260 + (value / 20) * 140;
        description = `Respiration cadence sonification: ${Math.round(value)} breaths per minute.`;
        break;
    }

    this.activeSonificationStatus.set(description);
    this.announceScreenReader(description, 'polite');

    if (ctx) {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(Math.max(150, Math.min(1200, frequency)), ctx.currentTime);

        // Gentle attack, sustain, decay envelope
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.45);
      } catch {
        // Fallback for restricted audio permissions
      }
    }
  }

  /**
   * Triggers distinct physical vibration patterns via Web Vibration API.
   */
  triggerHapticPattern(pattern: HapticPatternType): void {
    if (typeof window === 'undefined' || !('navigator' in window) || !('vibrate' in navigator)) {
      return;
    }

    try {
      switch (pattern) {
        case 'CONFIRM':
          navigator.vibrate(80); // 1 crisp tap
          break;
        case 'REMINDER':
          navigator.vibrate([120, 80, 120]); // 2 rhythmic pulses
          break;
        case 'PACED_BREATHING':
          navigator.vibrate([300, 200, 400, 200, 300]); // Swelling wave
          break;
        case 'WARNING':
          navigator.vibrate([200, 100, 200, 100, 300]); // Urgent alert
          break;
      }
    } catch {
      // Ignore vibration errors on unsupported hardware
    }
  }

  /**
   * Audio earcon chime for medication schedule disambiguation.
   */
  playMedicationEarcon(frequencyHz: number): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequencyHz, ctx.currentTime);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.55);
    } catch {
      // Ignore audio failure
    }
  }

  /**
   * Live screen reader ARIA announcement.
   */
  announceScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.lastScreenReaderAnnouncement.set(`[${priority.toUpperCase()}]: ${message}`);
  }

  /**
   * Warm, human-paced speech readout using Web Speech API.
   */
  speakText(text: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (this.isSpeechPlaying()) {
      window.speechSynthesis.cancel();
      this.isSpeechPlaying.set(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Friendly relaxed cadence
    utterance.pitch = 1.0;

    utterance.onend = () => this.isSpeechPlaying.set(false);
    utterance.onerror = () => this.isSpeechPlaying.set(false);

    this.isSpeechPlaying.set(true);
    window.speechSynthesis.speak(utterance);
  }

  stopSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeechPlaying.set(false);
  }
}
