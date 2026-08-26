import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PatientStateService } from './patient-state.service';

export type DastgahScaleName = 'Shur' | 'Homayoun' | 'Segah' | 'Chahargah';
export type BinauralEntrainmentMode = 'Theta (6Hz Calm)' | 'Alpha (10Hz Focus)' | 'Gamma (40Hz Insight)' | 'Off';

export interface IDastgahScale {
  name: DastgahScaleName;
  persianName: string;
  description: string;
  emotionalAura: string;
  frequencies: number[]; // Frequencies tuned to 432Hz Pythagorean standard
}

@Injectable({
  providedIn: 'root'
})
export class BioSymphonyEngineService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private patientState = inject(PatientStateService, { optional: true });

  // --- Core Reactive Signals ---
  readonly isPlaying = signal<boolean>(false);
  readonly heartRateBpm = signal<number>(72);
  readonly respiratoryRateBpm = signal<number>(14);
  readonly stressScore = signal<number>(28); // 0 (Zen/Deep Parasympathetic) to 100 (Sympathetic Overdrive)
  readonly selectedDastgah = signal<DastgahScaleName>('Shur');
  readonly binauralMode = signal<BinauralEntrainmentMode>('Theta (6Hz Calm)');
  readonly volumeLevel = signal<number>(0.75);

  // --- Dastgah Modal Scales Tuned to 432Hz Harmonic Base ---
  readonly dastgahScales: Record<DastgahScaleName, IDastgahScale> = {
    Shur: {
      name: 'Shur',
      persianName: 'شور (Dastgāh-e Šūr)',
      description: 'The mother of all Persian modes; deeply restorative, meditative, and grounding.',
      emotionalAura: 'Parasympathetic Tranquility & Inner Stillness',
      frequencies: [108.0, 121.5, 135.0, 144.0, 162.0, 180.0, 192.0, 216.0, 243.0, 270.0, 324.0, 432.0]
    },
    Homayoun: {
      name: 'Homayoun',
      persianName: 'همایون (Dastgāh-e Homāyoun)',
      description: 'Noble, contemplative, and mystical; enhances creative focus and cognitive clarity.',
      emotionalAura: 'Regal Majesty & Introspective Flow',
      frequencies: [108.0, 114.75, 136.68, 144.0, 162.0, 172.12, 192.0, 216.0, 229.5, 273.37, 324.0, 432.0]
    },
    Segah: {
      name: 'Segah',
      persianName: 'سه‌گاه (Dastgāh-e Segāh)',
      description: 'Bright, uplifting, and rejuvenating; stimulates cellular vitality and optimism.',
      emotionalAura: 'Cellular Vitality & Spiritual Dawn',
      frequencies: [108.0, 126.56, 135.0, 151.87, 162.0, 189.84, 216.0, 253.12, 270.0, 303.75, 324.0, 432.0]
    },
    Chahargah: {
      name: 'Chahargah',
      persianName: 'چهارگاه (Dastgāh-e Chahārgāh)',
      description: 'Dynamic, courageous, and energizing; perfect for morning activation and motor entrainment.',
      emotionalAura: 'Heroic Energy & Neuromotor Awakening',
      frequencies: [108.0, 114.75, 136.68, 144.0, 162.0, 172.12, 205.03, 216.0, 229.5, 273.37, 288.0, 432.0]
    }
  };

  // --- Computed Autonomic State ---
  readonly autonomicState = computed(() => {
    const stress = this.stressScore();
    if (stress < 30) {
      return {
        label: 'Parasympathetic Coherence (Vagal Tone High)',
        mode: 'Pure 432Hz Harmonic Triads',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/20'
      };
    } else if (stress <= 60) {
      return {
        label: 'Balanced Autonomic Equilibrium',
        mode: 'Modal Persian Polyphony',
        color: 'text-teal-300',
        bg: 'bg-teal-500/20'
      };
    } else {
      return {
        label: 'Sympathetic Hyperarousal (High Tone)',
        mode: 'Dynamic Dissonance Dissolution',
        color: 'text-amber-400',
        bg: 'bg-amber-500/20'
      };
    }
  });

  // --- Web Audio Context & Nodes ---
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private respiratoryFilter: BiquadFilterNode | null = null;
  private binauralLeftOsc: OscillatorNode | null = null;
  private binauralRightOsc: OscillatorNode | null = null;
  private heartbeatIntervalTimer: number | null = null;
  private melodyIntervalTimer: number | null = null;
  private respiratorySweepTimer: number | null = null;

  constructor() {
    // Sync initial vitals if patient state service is active
    if (this.patientState) {
      const vitals = this.patientState.vitals();
      if (vitals.heartRate) this.heartRateBpm.set(vitals.heartRate);
      if (vitals.respiratoryRate) this.respiratoryRateBpm.set(vitals.respiratoryRate);
    }
  }

  /**
   * Initializes Web Audio context and starts the live generative Bio-Symphony.
   */
  async startSymphony(): Promise<void> {
    if (!this.isBrowser || this.isPlaying()) return;

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.volumeLevel(), this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      // 1. Setup Respiratory Resonant Sweeper Filter
      this.respiratoryFilter = this.audioCtx.createBiquadFilter();
      this.respiratoryFilter.type = 'lowpass';
      this.respiratoryFilter.frequency.setValueAtTime(600, this.audioCtx.currentTime);
      this.respiratoryFilter.Q.setValueAtTime(3.5, this.audioCtx.currentTime);
      this.respiratoryFilter.connect(this.masterGain);

      // 2. Setup 432Hz Sub-Bass & Harmonic Drone
      this.setupHarmonicDrones();

      // 3. Setup Binaural Entrainment Channel
      this.setupBinauralWaves();

      // 4. Start Heartbeat Rhythmic Impulse Follower
      this.startHeartbeatPulseLoop();

      // 5. Start Persian Ney & Oud Generative Melody Loop
      this.startProceduralMelodyLoop();

      // 6. Start Respiratory Filter Modulation Loop
      this.startRespiratorySweepLoop();

      this.isPlaying.set(true);
    } catch (err) {
      console.warn('[BioSymphonyEngineService] Web Audio initialization warning:', err);
    }
  }

  /**
   * Gracefully ramps down and terminates all generative audio nodes.
   */
  stopSymphony(): void {
    if (!this.isPlaying()) return;

    if (this.heartbeatIntervalTimer) clearInterval(this.heartbeatIntervalTimer);
    if (this.melodyIntervalTimer) clearInterval(this.melodyIntervalTimer);
    if (this.respiratorySweepTimer) clearInterval(this.respiratorySweepTimer);

    if (this.audioCtx && this.masterGain) {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.linearRampToValueAtTime(0.001, now + 0.6);
      setTimeout(() => {
        try {
          this.audioCtx?.close();
        } catch {
          // Closed
        }
        this.audioCtx = null;
        this.isPlaying.set(false);
      }, 650);
    } else {
      this.isPlaying.set(false);
    }
  }

  togglePlay(): void {
    if (this.isPlaying()) {
      this.stopSymphony();
    } else {
      this.startSymphony();
    }
  }

  setHeartRate(bpm: number): void {
    this.heartRateBpm.set(Math.max(40, Math.min(180, bpm)));
    if (this.isPlaying()) {
      if (this.heartbeatIntervalTimer) clearInterval(this.heartbeatIntervalTimer);
      this.startHeartbeatPulseLoop();
    }
  }

  setStressScore(score: number): void {
    this.stressScore.set(Math.max(0, Math.min(100, score)));
    if (this.isPlaying() && this.droneOsc2 && this.audioCtx) {
      // Dynamic detuning based on sympathetic stress tension
      const detuneCents = (this.stressScore() - 30) * 0.8;
      this.droneOsc2.detune.setValueAtTime(detuneCents, this.audioCtx.currentTime);
    }
  }

  setDastgah(name: DastgahScaleName): void {
    this.selectedDastgah.set(name);
  }

  setBinauralMode(mode: BinauralEntrainmentMode): void {
    this.binauralMode.set(mode);
    if (this.isPlaying()) {
      this.setupBinauralWaves();
    }
  }

  private setupHarmonicDrones(): void {
    if (!this.audioCtx || !this.respiratoryFilter) return;

    this.droneGain = this.audioCtx.createGain();
    this.droneGain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
    this.droneGain.connect(this.respiratoryFilter);

    // Root 108Hz (432Hz / 4) Sub Drone
    this.droneOsc1 = this.audioCtx.createOscillator();
    this.droneOsc1.type = 'triangle';
    this.droneOsc1.frequency.setValueAtTime(108.0, this.audioCtx.currentTime);
    this.droneOsc1.connect(this.droneGain);
    this.droneOsc1.start();

    // 216Hz Fifth Harmonic Drone
    this.droneOsc2 = this.audioCtx.createOscillator();
    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(216.0, this.audioCtx.currentTime);
    this.droneOsc2.connect(this.droneGain);
    this.droneOsc2.start();
  }

  private setupBinauralWaves(): void {
    if (!this.audioCtx || !this.masterGain) return;

    if (this.binauralLeftOsc) {
      try { this.binauralLeftOsc.stop(); } catch { /* Stop */ }
    }
    if (this.binauralRightOsc) {
      try { this.binauralRightOsc.stop(); } catch { /* Stop */ }
    }

    const mode = this.binauralMode();
    if (mode === 'Off') return;

    let deltaHz = 6.0; // Theta by default
    if (mode === 'Alpha (10Hz Focus)') deltaHz = 10.0;
    if (mode === 'Gamma (40Hz Insight)') deltaHz = 40.0;

    const baseFreq = 216.0;
    const now = this.audioCtx.currentTime;

    const binGain = this.audioCtx.createGain();
    binGain.gain.setValueAtTime(0.12, now);
    binGain.connect(this.masterGain);

    // Left Channel (Pan -1)
    const panLeft = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;
    if (panLeft) panLeft.pan.setValueAtTime(-0.85, now);

    this.binauralLeftOsc = this.audioCtx.createOscillator();
    this.binauralLeftOsc.type = 'sine';
    this.binauralLeftOsc.frequency.setValueAtTime(baseFreq, now);
    if (panLeft) {
      this.binauralLeftOsc.connect(panLeft);
      panLeft.connect(binGain);
    } else {
      this.binauralLeftOsc.connect(binGain);
    }
    this.binauralLeftOsc.start();

    // Right Channel (Pan +1)
    const panRight = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;
    if (panRight) panRight.pan.setValueAtTime(0.85, now);

    this.binauralRightOsc = this.audioCtx.createOscillator();
    this.binauralRightOsc.type = 'sine';
    this.binauralRightOsc.frequency.setValueAtTime(baseFreq + deltaHz, now);
    if (panRight) {
      this.binauralRightOsc.connect(panRight);
      panRight.connect(binGain);
    } else {
      this.binauralRightOsc.connect(binGain);
    }
    this.binauralRightOsc.start();
  }

  private startHeartbeatPulseLoop(): void {
    const bpm = this.heartRateBpm();
    const intervalMs = (60 / bpm) * 1000;

    this.heartbeatIntervalTimer = window.setInterval(() => {
      this.triggerHeartbeatKick();
    }, intervalMs);
  }

  private triggerHeartbeatKick(): void {
    if (!this.audioCtx || !this.masterGain) return;

    const now = this.audioCtx.currentTime;
    const kickOsc = this.audioCtx.createOscillator();
    const kickGain = this.audioCtx.createGain();

    kickOsc.type = 'sine';
    // Deep physiological resonant thud (75Hz dropping to 35Hz)
    kickOsc.frequency.setValueAtTime(75, now);
    kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

    kickGain.gain.setValueAtTime(0.40, now);
    kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    kickOsc.connect(kickGain);
    kickGain.connect(this.masterGain);

    kickOsc.start(now);
    kickOsc.stop(now + 0.24);
  }

  private startProceduralMelodyLoop(): void {
    // Plays algorithmic Persian Dastgah notes every 1.5 - 3.0 seconds
    const playNextNote = () => {
      if (!this.isPlaying()) return;

      const scale = this.dastgahScales[this.selectedDastgah()];
      const freqs = scale.frequencies;
      const noteFreq = freqs[Math.floor(Math.random() * freqs.length)];

      this.triggerMelodicPluck(noteFreq);

      // Rhythmically varies between 800ms and 2400ms
      const nextDelay = 800 + Math.random() * 1600;
      this.melodyIntervalTimer = window.setTimeout(playNextNote, nextDelay);
    };

    this.melodyIntervalTimer = window.setTimeout(playNextNote, 1000);
  }

  private triggerMelodicPluck(freq: number): void {
    if (!this.audioCtx || !this.respiratoryFilter) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    // Persian Ney / Oud tone: triangle + sine overtone
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Warm envelope
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.08); // soft attack
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8); // long decay

    osc.connect(gain);
    gain.connect(this.respiratoryFilter);

    osc.start(now);
    osc.stop(now + 1.9);
  }

  private startRespiratorySweepLoop(): void {
    // Sweeps filter cutoff based on breathing rhythm (e.g. 14 breaths/min = ~4.2s per breath)
    const breathPeriodSec = 60 / this.respiratoryRateBpm();
    
    let isInhale = true;
    this.respiratorySweepTimer = window.setInterval(() => {
      if (!this.audioCtx || !this.respiratoryFilter) return;

      const now = this.audioCtx.currentTime;
      const duration = breathPeriodSec / 2;

      if (isInhale) {
        // Inhale: filter opens to 1800Hz
        this.respiratoryFilter.frequency.linearRampToValueAtTime(1800, now + duration);
      } else {
        // Exhale: filter relaxes down to 350Hz (deep warmth)
        this.respiratoryFilter.frequency.linearRampToValueAtTime(350, now + duration);
      }
      isInhale = !isInhale;
    }, (breathPeriodSec / 2) * 1000);
  }
}
