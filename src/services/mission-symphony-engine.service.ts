import { Injectable, signal, computed } from '@angular/core';

export type MissionPhase = 
  | 'celestial_launch'     // Deep space awe & purpose (A minor / Lydian, 55 Hz drone)
  | 'noble_healer'         // Focused exam room momentum (Dorian mode, 60 BPM pulse)
  | 'scientific_quest'     // 40 Hz Gamma arpeggiator & mathematical lucidity
  | 'triumph_of_healing'   // Epic crescendo & 528 Hz Solfeggio golden harmonic bloom
  | 'seven_gen_vigil';     // Sacred campfire cello & Persian Ney night reflection

export interface IMissionTheme {
  phase: MissionPhase;
  title: string;
  subtitle: string;
  scale: string;
  rootFreqHz: number;
  tempoBpm: number;
  binauralBeatHz: number;
  icon: string;
}

export const MISSION_THEMES: IMissionTheme[] = [
  {
    phase: 'celestial_launch',
    title: 'Interstellar Launch (The Hero’s Departure)',
    subtitle: 'Expansive cosmic pad & sub-bass resonance for embarking into the unknown',
    scale: 'C Lydian (Golden Wonder)',
    rootFreqHz: 130.81, // C3
    tempoBpm: 60,
    binauralBeatHz: 7.83, // Schumann Earth Pulse
    icon: '🚀'
  },
  {
    phase: 'noble_healer',
    title: 'The Noble Healer (Dorian Resolve)',
    subtitle: 'Steady cinematic arpeggios guiding clinical precision and quiet empathy',
    scale: 'D Dorian (Noble Duty)',
    rootFreqHz: 146.83, // D3
    tempoBpm: 64,
    binauralBeatHz: 10.0, // Alpha Focus
    icon: '🩺'
  },
  {
    phase: 'scientific_quest',
    title: 'The Scientific Quest (MIT 40 Hz Lucidity)',
    subtitle: 'Driving polyphonic synthesizers and Gamma pulses unlocking breakthrough insights',
    scale: 'E Minor Pentatonic + 40Hz',
    rootFreqHz: 164.81, // E3
    tempoBpm: 72,
    binauralBeatHz: 40.0, // Gamma Coherence
    icon: '🔬'
  },
  {
    phase: 'triumph_of_healing',
    title: 'Triumph of Healing (Solfeggio 528 Hz Climax)',
    subtitle: 'Triumphant orchestral synthesis celebrating recovered human vitality',
    scale: 'F Major (Golden Radiance)',
    rootFreqHz: 174.61, // F3
    tempoBpm: 68,
    binauralBeatHz: 5.28, // Solfeggio Harmony
    icon: '✨'
  },
  {
    phase: 'seven_gen_vigil',
    title: 'Seven Generations Vigil (The Sacred Campfire)',
    subtitle: 'Warm analog cello drone & Persian Ney breath honoring all who came before',
    scale: 'A Aeolian / Persian Shur',
    rootFreqHz: 110.0, // A2
    tempoBpm: 56,
    binauralBeatHz: 4.5, // Monroe Theta Rest
    icon: '🌲'
  }
];

@Injectable({
  providedIn: 'root'
})
export class MissionSymphonyEngineService {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private arpeggioTimer: any = null;
  private currentStep = 0;

  readonly isPlaying = signal<boolean>(false);
  readonly currentPhase = signal<MissionPhase>('celestial_launch');
  readonly masterVolume = signal<number>(0.14);

  readonly currentTheme = computed<IMissionTheme>(() => {
    return MISSION_THEMES.find(t => t.phase === this.currentPhase()) || MISSION_THEMES[0];
  });

  /**
   * Launch playback of a specific cinematic mission theme
   */
  playTheme(phase: MissionPhase): void {
    this.stop();
    this.currentPhase.set(phase);
    this.initAudioContext();
    if (!this.audioCtx || !this.masterGain) return;

    this.isPlaying.set(true);

    const theme = this.currentTheme();
    this.startMissionAtmosphere(theme);
  }

  /**
   * Toggle music engine on/off
   */
  togglePlayback(): void {
    if (this.isPlaying()) {
      this.stop();
    } else {
      this.playTheme(this.currentPhase());
    }
  }

  /**
   * Adjust master volume (0.0 to 1.0)
   */
  setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.masterVolume.set(clamped);
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.05);
    }
  }

  /**
   * Stop all active cinematic synthesizers, arpeggiators, and LFOs
   */
  stop(): void {
    if (this.arpeggioTimer) {
      clearInterval(this.arpeggioTimer);
      this.arpeggioTimer = null;
    }

    this.activeNodes.forEach(node => {
      try {
        if (typeof node === 'object' && 'stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
        if (typeof node === 'object' && 'disconnect' in node && typeof (node as any).disconnect === 'function') {
          (node as any).disconnect();
        }
      } catch {
        // Safe node disposal
      }
    });

    this.activeNodes = [];
    this.isPlaying.set(false);
  }

  // ── Generative Synthesis Pipeline ──

  private initAudioContext(): void {
    if (typeof window === 'undefined') return;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    if (this.audioCtx && !this.masterGain) {
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume(), this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
    }
  }

  private startMissionAtmosphere(theme: IMissionTheme): void {
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    // 1. Deep Celestial Sub-Bass Drone (The Infinite Foundation)
    const droneOsc = this.audioCtx.createOscillator();
    const droneGain = this.audioCtx.createGain();
    const droneFilter = this.audioCtx.createBiquadFilter();

    droneOsc.type = 'sawtooth';
    droneOsc.frequency.setValueAtTime(theme.rootFreqHz / 2, now); // Sub-octave

    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(220, now);
    droneFilter.Q.setValueAtTime(3.0, now);

    droneGain.gain.setValueAtTime(0.09, now);
    droneOsc.connect(droneFilter).connect(droneGain).connect(this.masterGain);
    droneOsc.start(now);

    // 2. Slow Circadian Breathing Filter LFO (0.08 Hz = 4.8 Breaths/Min)
    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.frequency.setValueAtTime(0.08, now);
    lfoGain.gain.setValueAtTime(120, now);
    lfo.connect(lfoGain);
    lfoGain.connect(droneFilter.frequency);
    lfo.start(now);

    // 3. Embedded Binaural Hemispheric Sync Carrier (Monroe / Schumann / MIT)
    const oscL = this.audioCtx.createOscillator();
    const oscR = this.audioCtx.createOscillator();
    const pannerL = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;
    const pannerR = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;
    const carrierGain = this.audioCtx.createGain();

    carrierGain.gain.setValueAtTime(0.05, now);

    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(theme.rootFreqHz - theme.binauralBeatHz / 2, now);
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(theme.rootFreqHz + theme.binauralBeatHz / 2, now);

    if (pannerL && pannerR) {
      pannerL.pan.setValueAtTime(-0.85, now);
      pannerR.pan.setValueAtTime(0.85, now);
      oscL.connect(carrierGain).connect(pannerL).connect(this.masterGain);
      oscR.connect(carrierGain).connect(pannerR).connect(this.masterGain);
      this.activeNodes.push(pannerL, pannerR);
    } else {
      oscL.connect(carrierGain).connect(this.masterGain);
      oscR.connect(carrierGain).connect(this.masterGain);
    }

    oscL.start(now);
    oscR.start(now);

    this.activeNodes.push(droneOsc, droneFilter, droneGain, lfo, lfoGain, oscL, oscR, carrierGain);

    // 4. Procedural Cinematic Arpeggio Sequence
    this.startProceduralArpeggiator(theme);
  }

  private startProceduralArpeggiator(theme: IMissionTheme): void {
    const root = theme.rootFreqHz;
    // Scale intervals relative to root (Root, Minor/Major 3rd, 5th, Major 6th/7th, Octave)
    let intervals = [1.0, 1.25, 1.5, 1.875, 2.0, 2.25]; // Major Lydian / Pentatonic
    if (theme.phase === 'noble_healer') {
      intervals = [1.0, 1.189, 1.334, 1.498, 1.681, 2.0]; // Dorian
    } else if (theme.phase === 'seven_gen_vigil') {
      intervals = [1.0, 1.2, 1.333, 1.5, 1.6, 2.0]; // Aeolian
    }

    const intervalMs = (60 / theme.tempoBpm / 2) * 1000; // 8th note rhythm

    this.arpeggioTimer = setInterval(() => {
      if (!this.audioCtx || !this.masterGain || !this.isPlaying()) return;
      const noteFreq = root * intervals[this.currentStep % intervals.length];
      this.triggerCinematicNote(noteFreq);
      this.currentStep++;
    }, intervalMs);
  }

  private triggerCinematicNote(freq: number): void {
    if (!this.audioCtx || !this.masterGain) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle'; // Warm cinematic bell tone
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.9);
    } catch {
      // Safe guard against fast teardown
    }
  }
}
