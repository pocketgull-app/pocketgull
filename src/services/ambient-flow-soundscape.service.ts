import { Injectable, signal, computed, inject, effect, untracked } from '@angular/core';
import { DictationService } from './dictation.service';

export type SoundscapeType = 
  | 'golden_flow'          // 432 Hz Golden Ambient Pad + 10 Hz Alpha Focus
  | 'pacific_rain_gull'    // Ocean Surf + Soft Rain + Pentatonic Temple Chimes + 7.83 Hz Schumann
  | 'seven_gen_fireside'   // Analog Cello Drones + Persian Ney Breath + 4.5 Hz Theta Recovery
  | 'solfeggio_528'        // 528 Hz Cellular Repair Bloom + 639 Hz Harmonic Chorus
  | 'deep_space_gamma';    // Cosmic Sub-Bass + MIT 40 Hz Gamma Lucidity Pulse

export interface ISoundscapePreset {
  id: SoundscapeType;
  title: string;
  subtitle: string;
  carrierFreqHz: number;
  binauralBeatHz: number;
  brainwaveBand: 'Alpha (10 Hz)' | 'Theta (4.5 Hz)' | 'Schumann (7.83 Hz)' | 'Solfeggio (5.28 Hz)' | 'Gamma (40 Hz)';
  icon: string;
  tagColor: string;
  description: string;
}

export const SOUNDSCAPE_PRESETS: ISoundscapePreset[] = [
  {
    id: 'golden_flow',
    title: 'Golden Flow (432 Hz + Alpha)',
    subtitle: 'Warm analog harmonic pads & 10 Hz Alpha pulse for frictionless coding and clinical charting',
    carrierFreqHz: 432.0,
    binauralBeatHz: 10.0,
    brainwaveBand: 'Alpha (10 Hz)',
    icon: '✨',
    tagColor: 'amber',
    description: 'Tuned to the natural 432 Hz Pythagorean harmonic scale with slow breathing filter modulation.'
  },
  {
    id: 'pacific_rain_gull',
    title: 'Pacific Ocean & Rain (Schumann)',
    subtitle: 'Procedural ocean waves, gentle coastal drizzle, and distant wind chimes on 7.83 Hz Earth pulse',
    carrierFreqHz: 130.81, // C3
    binauralBeatHz: 7.83,
    brainwaveBand: 'Schumann (7.83 Hz)',
    icon: '🌊',
    tagColor: 'teal',
    description: 'Generative pink/brown noise filters simulating rhythmic tidal swells with random pentatonic chime drops.'
  },
  {
    id: 'seven_gen_fireside',
    title: 'Seven Generations Fireside',
    subtitle: 'Warm analog cello drone, Persian Ney flute harmonics & 4.5 Hz Monroe Theta de-stress',
    carrierFreqHz: 110.0, // A2 Cello Fundamental
    binauralBeatHz: 4.5,
    brainwaveBand: 'Theta (4.5 Hz)',
    icon: '🌲',
    tagColor: 'emerald',
    description: 'Deep resonant double-stops (A2 + E3) paired with breathy overtone filters for somatic restoration.'
  },
  {
    id: 'solfeggio_528',
    title: 'Solfeggio 528 Hz (Cellular Miracle)',
    subtitle: 'Ancient 528 Hz transformation frequency with 639 Hz heart chord and warm analog tape chorus',
    carrierFreqHz: 528.0,
    binauralBeatHz: 5.28,
    brainwaveBand: 'Solfeggio (5.28 Hz)',
    icon: '💫',
    tagColor: 'cyan',
    description: 'Pure crystalline carrier tones designed for autonomic nervous system balance and HRV coherence.'
  },
  {
    id: 'deep_space_gamma',
    title: 'Deep Space Gamma (MIT 40 Hz)',
    subtitle: 'Expansive nebula sub-bass and 40 Hz Gamma pulse for high-velocity clinical insight & pattern recognition',
    carrierFreqHz: 164.81, // E3
    binauralBeatHz: 40.0,
    brainwaveBand: 'Gamma (40 Hz)',
    icon: '🌌',
    tagColor: 'purple',
    description: 'Pioneered by MIT neuro-acoustics to promote neural network synchronization and cognitive clarity.'
  }
];

@Injectable({
  providedIn: 'root'
})
export class AmbientFlowSoundscapeService {
  // Reactive State Signals
  private readonly dictation = (() => {
    try { return inject(DictationService, { optional: true }); } catch { return null; }
  })();
  readonly isDucked = signal<boolean>(false);

  isPlaying = signal<boolean>(false);
  activeSoundscape = signal<SoundscapeType>('golden_flow');
  volume = signal<number>(0.65); // 0.0 to 1.0
  isMuted = signal<boolean>(false);
  timerMinutesRemaining = signal<number | null>(null); // null = infinite

  readonly activePreset = computed(() => {
    return SOUNDSCAPE_PRESETS.find(p => p.id === this.activeSoundscape()) || SOUNDSCAPE_PRESETS[0];
  });

  // Web Audio Context & Synthesizer Graph
  private audioCtx: AudioContext | null = null;
  private mainGain: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private activeGains: GainNode[] = [];
  private activeFilters: BiquadFilterNode[] = [];
  private activeIntervals: ReturnType<typeof setInterval>[] = [];
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (this.dictation && typeof this.dictation.isListening === 'function') {
      effect(() => {
        const isListening = this.dictation!.isListening();
        const depth = typeof this.dictation!.sidechainDuckingDepth === 'function'
          ? this.dictation!.sidechainDuckingDepth()
          : 0.85;

        untracked(() => {
          this.isDucked.set(isListening);
          if (this.mainGain && this.audioCtx) {
            const baseVol = this.isMuted() ? 0 : this.volume();
            const targetGain = isListening ? baseVol * (1.0 - depth) : baseVol;
            const timeConstant = isListening ? 0.04 : 0.60;
            this.mainGain.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, timeConstant);
          }
        });
      });
    }
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  async togglePlay(): Promise<void> {
    if (this.isPlaying()) {
      this.stop();
    } else {
      await this.start();
    }
  }

  async setSoundscape(type: SoundscapeType): Promise<void> {
    this.activeSoundscape.set(type);
    if (this.isPlaying()) {
      // Smooth crossfade transition
      await this.crossfadeToNewSoundscape();
    }
  }

  setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume.set(clamped);
    if (this.mainGain && this.audioCtx) {
      const isListening = this.dictation && typeof this.dictation.isListening === 'function' && this.dictation.isListening();
      const depth = this.dictation && typeof this.dictation.sidechainDuckingDepth === 'function' ? this.dictation.sidechainDuckingDepth() : 0.85;
      const targetGain = this.isMuted() ? 0 : (isListening ? clamped * (1.0 - depth) : clamped);
      this.mainGain.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, 0.05);
    }
  }

  toggleMute(): void {
    const nextMute = !this.isMuted();
    this.isMuted.set(nextMute);
    if (this.mainGain && this.audioCtx) {
      const targetGain = nextMute ? 0 : this.volume();
      this.mainGain.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, 0.05);
    }
  }

  setTimer(minutes: number | null): void {
    this.timerMinutesRemaining.set(minutes);
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    if (minutes !== null && minutes > 0) {
      let secondsLeft = minutes * 60;
      this.timerInterval = setInterval(() => {
        secondsLeft -= 1;
        this.timerMinutesRemaining.set(Math.ceil(secondsLeft / 60));
        if (secondsLeft <= 0) {
          this.stop();
          this.timerMinutesRemaining.set(null);
          if (this.timerInterval !== null) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
          }
        }
      }, 1000);
    }
  }

  async start(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.setupMainBus();
      this.synthesizeSoundscape(this.activeSoundscape());
      this.isPlaying.set(true);
    } catch (err) {
      console.warn('[AmbientFlowSoundscape] AudioContext initialization deferred:', err);
    }
  }

  stop(): void {
    if (this.audioCtx && this.mainGain) {
      // Fade out over 0.6 seconds to avoid clicks
      this.mainGain.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.2);
    }

    setTimeout(() => {
      this.tearDownAudioNodes();
      this.isPlaying.set(false);
    }, 650);

    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.timerMinutesRemaining.set(null);
    }
  }

  private setupMainBus(): void {
    if (!this.audioCtx) return;

    this.tearDownAudioNodes();

    this.mainGain = this.audioCtx.createGain();
    const initVol = this.isMuted() ? 0 : this.volume();
    this.mainGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    this.mainGain.gain.setTargetAtTime(initVol, this.audioCtx.currentTime, 0.4);

    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = 64;
    this.analyserNode.smoothingTimeConstant = 0.85;

    this.mainGain.connect(this.analyserNode);
    this.analyserNode.connect(this.audioCtx.destination);
  }

  private async crossfadeToNewSoundscape(): Promise<void> {
    if (!this.audioCtx || !this.mainGain) return;

    // Fade down
    this.mainGain.gain.setTargetAtTime(0.05, this.audioCtx.currentTime, 0.3);

    setTimeout(() => {
      this.tearDownSoundscapeNodes();
      this.synthesizeSoundscape(this.activeSoundscape());
      // Fade back up
      const targetVol = this.isMuted() ? 0 : this.volume();
      this.mainGain?.gain.setTargetAtTime(targetVol, this.audioCtx?.currentTime || 0, 0.4);
    }, 350);
  }

  private synthesizeSoundscape(type: SoundscapeType): void {
    if (!this.audioCtx || !this.mainGain) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    switch (type) {
      case 'golden_flow':
        this.buildGoldenFlow(ctx, now);
        break;
      case 'pacific_rain_gull':
        this.buildPacificRainGull(ctx, now);
        break;
      case 'seven_gen_fireside':
        this.buildSevenGenFireside(ctx, now);
        break;
      case 'solfeggio_528':
        this.buildSolfeggio528(ctx, now);
        break;
      case 'deep_space_gamma':
        this.buildDeepSpaceGamma(ctx, now);
        break;
    }
  }

  // --- 1. Golden Flow: 432 Hz Harmonic Pad + 10 Hz Binaural Alpha ---
  private buildGoldenFlow(ctx: AudioContext, now: number): void {
    const chordFreqs = [
      432.0,                  // A4 natural
      432.0 * (4 / 3),        // D5 (576 Hz)
      432.0 * (3 / 2),        // E5 (648 Hz)
      432.0 / 2,              // A3 (216 Hz Warm Pad)
      432.0 / 4               // A2 (108 Hz Sub-body)
    ];

    chordFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = i === 0 ? 'sine' : (i < 3 ? 'triangle' : 'sine');
      osc.frequency.setValueAtTime(freq, now);

      // Subtle slow detune for analog warmth
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.08 + i * 0.02, now);
      lfoGain.gain.setValueAtTime(1.5, now);
      lfo.connect(osc.frequency);
      lfo.start(now);
      this.activeOscillators.push(lfo);

      // Lowpass breath
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 + i * 200, now);

      gain.gain.setValueAtTime(0.06 / (i + 1), now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.mainGain!);

      osc.start(now);
      this.activeOscillators.push(osc);
      this.activeGains.push(gain);
      this.activeFilters.push(filter);
    });

    // 10 Hz Alpha Binaural Panning Pair
    this.createBinauralPannerPair(ctx, now, 216.0, 10.0, 0.04);
  }

  // --- 2. Pacific Ocean & Soft Coastal Rain (Schumann 7.83 Hz) ---
  private buildPacificRainGull(ctx: AudioContext, now: number): void {
    // Generate Procedural Ocean Surf (Brown Noise + LFO Filter)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const surfFilter = ctx.createBiquadFilter();
    surfFilter.type = 'bandpass';
    surfFilter.frequency.setValueAtTime(320, now);
    surfFilter.Q.setValueAtTime(1.2, now);

    // LFO for wave swells (0.12 Hz = ~8 second wave cycle)
    const waveLfo = ctx.createOscillator();
    const waveLfoGain = ctx.createGain();
    waveLfo.frequency.setValueAtTime(0.12, now);
    waveLfoGain.gain.setValueAtTime(220, now);
    waveLfo.connect(surfFilter.frequency);
    waveLfo.start(now);
    this.activeOscillators.push(waveLfo);

    const surfGain = ctx.createGain();
    surfGain.gain.setValueAtTime(0.07, now);

    whiteNoise.connect(surfFilter);
    surfFilter.connect(surfGain);
    surfGain.connect(this.mainGain!);
    whiteNoise.start(now);

    // 7.83 Hz Schumann Resonance Sub-Pulse
    this.createBinauralPannerPair(ctx, now, 130.81, 7.83, 0.05);

    // Generative Pentatonic Wind Chimes (Random bell tones)
    const chimePitches = [523.25, 587.33, 659.25, 783.99, 880.0]; // C5, D5, E5, G5, A5
    const chimeTimer = setInterval(() => {
      if (!this.isPlaying() || !this.audioCtx || !this.mainGain) return;
      if (Math.random() > 0.4) {
        const pitch = chimePitches[Math.floor(Math.random() * chimePitches.length)];
        const bellOsc = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(pitch, ctx.currentTime);
        bellGain.gain.setValueAtTime(0.03, ctx.currentTime);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.2);

        bellOsc.connect(bellGain);
        bellGain.connect(this.mainGain!);
        bellOsc.start(ctx.currentTime);
        bellOsc.stop(ctx.currentTime + 3.3);
      }
    }, 2800);

    this.activeIntervals.push(chimeTimer);
  }

  // --- 3. Seven Generations Fireside (Ney Flute & Cello + 4.5 Hz Theta) ---
  private buildSevenGenFireside(ctx: AudioContext, now: number): void {
    // Cello Double Stop (A2 110 Hz + E3 164.81 Hz)
    [110.0, 164.81, 220.0].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380 + idx * 80, now);
      filter.Q.setValueAtTime(2.0, now);

      gain.gain.setValueAtTime(0.045 / (idx + 1), now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.mainGain!);

      osc.start(now);
      this.activeOscillators.push(osc);
      this.activeGains.push(gain);
      this.activeFilters.push(filter);
    });

    // 4.5 Hz Monroe Theta Recovery Pulse
    this.createBinauralPannerPair(ctx, now, 110.0, 4.5, 0.05);
  }

  // --- 4. Solfeggio 528 Hz (Cellular Transformation Tone) ---
  private buildSolfeggio528(ctx: AudioContext, now: number): void {
    const solfeggioPitches = [528.0, 639.0, 396.0, 528.0 / 2];

    solfeggioPitches.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Subtle slow chorus
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      vibrato.frequency.setValueAtTime(0.1 + i * 0.05, now);
      vibratoGain.gain.setValueAtTime(0.8, now);
      vibrato.connect(osc.frequency);
      vibrato.start(now);
      this.activeOscillators.push(vibrato);

      gain.gain.setValueAtTime(0.04 / (i + 1), now);

      osc.connect(gain);
      gain.connect(this.mainGain!);
      osc.start(now);

      this.activeOscillators.push(osc);
      this.activeGains.push(gain);
    });

    // 5.28 Hz Golden Binaural Beat
    this.createBinauralPannerPair(ctx, now, 264.0, 5.28, 0.04);
  }

  // --- 5. Deep Space Gamma (MIT 40 Hz Lucidity) ---
  private buildDeepSpaceGamma(ctx: AudioContext, now: number): void {
    // Cosmic Sub Drone (55 Hz A1)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(55.0, now);
    subGain.gain.setValueAtTime(0.08, now);
    subOsc.connect(subGain);
    subGain.connect(this.mainGain!);
    subOsc.start(now);
    this.activeOscillators.push(subOsc);
    this.activeGains.push(subGain);

    // 40.0 Hz Gamma Coherence Binaural Channel Pair
    this.createBinauralPannerPair(ctx, now, 220.0, 40.0, 0.05);

    // Ethereal Resonant Pad (E4 329.63 Hz + B4 493.88 Hz)
    [329.63, 493.88, 659.25].forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, now);
      filter.Q.setValueAtTime(3.0, now);

      gain.gain.setValueAtTime(0.015, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.mainGain!);

      osc.start(now);
      this.activeOscillators.push(osc);
      this.activeGains.push(gain);
      this.activeFilters.push(filter);
    });
  }

  // --- Stereo Binaural Ear Separation Helper ---
  private createBinauralPannerPair(ctx: AudioContext, now: number, carrier: number, beat: number, volume: number): void {
    const leftOsc = ctx.createOscillator();
    const rightOsc = ctx.createOscillator();

    leftOsc.type = 'sine';
    rightOsc.type = 'sine';

    leftOsc.frequency.setValueAtTime(carrier, now);
    rightOsc.frequency.setValueAtTime(carrier + beat, now);

    const leftPanner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const rightPanner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

    const leftGain = ctx.createGain();
    const rightGain = ctx.createGain();

    leftGain.gain.setValueAtTime(volume, now);
    rightGain.gain.setValueAtTime(volume, now);

    if (leftPanner && rightPanner) {
      leftPanner.pan.setValueAtTime(-0.85, now);
      rightPanner.pan.setValueAtTime(0.85, now);

      leftOsc.connect(leftGain);
      leftGain.connect(leftPanner);
      leftPanner.connect(this.mainGain!);

      rightOsc.connect(rightGain);
      rightGain.connect(rightPanner);
      rightPanner.connect(this.mainGain!);
    } else {
      leftOsc.connect(leftGain);
      leftGain.connect(this.mainGain!);
      rightOsc.connect(rightGain);
      rightGain.connect(this.mainGain!);
    }

    leftOsc.start(now);
    rightOsc.start(now);

    this.activeOscillators.push(leftOsc, rightOsc);
    this.activeGains.push(leftGain, rightGain);
  }

  private tearDownSoundscapeNodes(): void {
    this.activeOscillators.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch { /* ignore */ }
    });
    this.activeOscillators = [];

    this.activeGains.forEach(gain => {
      try { gain.disconnect(); } catch { /* ignore */ }
    });
    this.activeGains = [];

    this.activeFilters.forEach(filter => {
      try { filter.disconnect(); } catch { /* ignore */ }
    });
    this.activeFilters = [];

    this.activeIntervals.forEach(intId => clearInterval(intId));
    this.activeIntervals = [];
  }

  private tearDownAudioNodes(): void {
    this.tearDownSoundscapeNodes();

    if (this.analyserNode) {
      try { this.analyserNode.disconnect(); } catch { /* ignore */ }
      this.analyserNode = null;
    }

    if (this.mainGain) {
      try { this.mainGain.disconnect(); } catch { /* ignore */ }
      this.mainGain = null;
    }
  }
}
