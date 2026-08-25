import { Injectable, signal, computed } from '@angular/core';

export type KarolinskaSleepinessLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type HemisphericSyncType =
  // Monroe Institute Focus Levels
  | 'monroe_focus_10'      // Mind Awake / Body Asleep (Theta 4.5 Hz)
  | 'monroe_focus_12'      // Expanded Awareness (Alpha 10 Hz + Gamma 40 Hz)
  | 'monroe_focus_15'      // State of No Time (Deep Delta 1.5 Hz)
  | 'monroe_focus_21'      // Edge of Perception (Gamma 40 Hz Coherence)
  // Bilateral & Planetary Hemispheric Syncs
  | 'emdr_bilateral_alpha' // Bilateral Alternating Left/Right Panning (8 Hz Alpha)
  | 'schumann_resonance'   // Earth Ionosphere Cavity 7.83 Hz Fundamental
  | 'tibetan_dual_bowl'    // Dual Tibetan Singing Bowl 432 Hz / 528 Hz Overtone
  | 'holosync_descending'  // Alpha-Theta Progressive Descending Step Ramp
  | 'mit_gamma_40hz'       // MIT 40 Hz Microglial & Cognitive Lucidity Pulse
  // Native American & Indigenous Trance Suite
  | 'indigenous_cedar_flute'   // Sacred Cedar Wood Flute in F# Minor (432 Hz + Theta 5.5 Hz)
  | 'native_water_drum_theta'  // Ceremonial Elk-Hide Water Drum (4.5 Hz Shamanic Theta Pulse)
  | 'gourd_rattle_clearing'    // Cedar Gourd Rattle High-Spectrum Noise (Trauma Clearing)
  | 'wabanaki_canoe_cadence'   // Wabanaki River Water Paddle & Pine Wind (60 BPM)
  // Persian Deep Trance & Sufi Drones
  | 'persian_dastgah_shur' // Persian Sufi Ney & Tanbur microtonal drone (432 Hz)
  | 'persian_mahur_flow'   // Lydian morning clarity trance
  | 'persian_homayoun_rest'// Persian Homayoun contemplative dusk drone
  // Karolinska Adaptive Stream
  | 'kss_adaptive_flow'    // Auto-tuned to Karolinska Sleepiness Score (1-9)
  // Animal Comfort Bio-Acoustics
  | 'canine_heartbeat'     // 60 BPM canine cardiac co-regulation
  | 'feline_purr'          // 25-140 Hz musculoskeletal bone healing purr
  | 'cetacean_528hz'       // Cetacean ocean deep-vagal resonance
  | 'avian_dawn';          // Polyphonic circadian dawn birdsong

export interface IHemisphericPreset {
  id: HemisphericSyncType;
  name: string;
  category: 'monroe' | 'hemispheric' | 'indigenous' | 'persian' | 'animal' | 'adaptive';
  binauralBeatHz: number;
  carrierFreqHz: number;
  harmonicDescription: string;
  recommendedKssRange: [number, number];
  icon: string;
}

export const HEMISPHERIC_PRESETS: IHemisphericPreset[] = [
  // ── Monroe Institute Suite ──
  {
    id: 'monroe_focus_10',
    name: 'Monroe Focus 10 (Mind Awake / Body Asleep)',
    category: 'monroe',
    binauralBeatHz: 4.5,
    carrierFreqHz: 194.18,
    harmonicDescription: 'Theta 4.5 Hz binaural sync with pink noise substrate',
    recommendedKssRange: [6, 8],
    icon: '🌌'
  },
  {
    id: 'monroe_focus_12',
    name: 'Monroe Focus 12 (Expanded Awareness)',
    category: 'monroe',
    binauralBeatHz: 10.0,
    carrierFreqHz: 216.0,
    harmonicDescription: 'Alpha 10 Hz cognitive flow & bilateral spatialization',
    recommendedKssRange: [3, 5],
    icon: '✨'
  },
  {
    id: 'monroe_focus_15',
    name: 'Monroe Focus 15 (State of No Time)',
    category: 'monroe',
    binauralBeatHz: 1.5,
    carrierFreqHz: 136.1,
    harmonicDescription: 'Deep Delta 1.5 Hz cellular regeneration & profound rest',
    recommendedKssRange: [8, 9],
    icon: '⏳'
  },
  {
    id: 'monroe_focus_21',
    name: 'Monroe Focus 21 (Gamma Coherence)',
    category: 'monroe',
    binauralBeatHz: 40.0,
    carrierFreqHz: 256.0,
    harmonicDescription: '40 Hz Gamma interhemispheric phase locking',
    recommendedKssRange: [1, 3],
    icon: '⚡'
  },

  // ── Native American & Indigenous Trance Suite ──
  {
    id: 'indigenous_cedar_flute',
    name: 'Sacred Cedar Flute (F# Minor 432 Hz)',
    category: 'indigenous',
    binauralBeatHz: 5.5,
    carrierFreqHz: 369.99, // F#4
    harmonicDescription: 'Minor pentatonic cedar flute breath harmonics for deep emotional solace',
    recommendedKssRange: [4, 7],
    icon: '🪶'
  },
  {
    id: 'native_water_drum_theta',
    name: 'Ceremonial Water Drum (4.5 Hz Theta Trance)',
    category: 'indigenous',
    binauralBeatHz: 4.5,
    carrierFreqHz: 82.41, // E2 low resonance
    harmonicDescription: '4.5 Hz elk-hide water drum pulse inducing deep Theta trance journeying',
    recommendedKssRange: [5, 8],
    icon: '🥁'
  },
  {
    id: 'gourd_rattle_clearing',
    name: 'Sacred Gourd Rattle & Smudge Cleansing',
    category: 'indigenous',
    binauralBeatHz: 10.0,
    carrierFreqHz: 432.0,
    harmonicDescription: 'High-frequency seed shimmer & pink noise dispersing sympathetic tension',
    recommendedKssRange: [3, 6],
    icon: '🌾'
  },
  {
    id: 'wabanaki_canoe_cadence',
    name: 'Wabanaki River & Pine Wind (60 BPM)',
    category: 'indigenous',
    binauralBeatHz: 1.0,
    carrierFreqHz: 130.81,
    harmonicDescription: '60 BPM rhythmic paddle stroke & evergreen canopy breath for grounding',
    recommendedKssRange: [4, 8],
    icon: '🛶'
  },

  // ── Bilateral & Planetary Hemispheric Syncs ──
  {
    id: 'emdr_bilateral_alpha',
    name: 'EMDR Bilateral Panning (8 Hz Alpha)',
    category: 'hemispheric',
    binauralBeatHz: 8.0,
    carrierFreqHz: 220.0,
    harmonicDescription: 'Alternating Left-Right hemispheric ping-pong for somatic calming',
    recommendedKssRange: [4, 7],
    icon: '↔️'
  },
  {
    id: 'schumann_resonance',
    name: 'Schumann Resonance (7.83 Hz Earth Pulse)',
    category: 'hemispheric',
    binauralBeatHz: 7.83,
    carrierFreqHz: 250.56,
    harmonicDescription: 'Planetary ionosphere geomagnetic frequency entrainment',
    recommendedKssRange: [3, 6],
    icon: '🌍'
  },
  {
    id: 'tibetan_dual_bowl',
    name: 'Tibetan Dual-Bowl (432 Hz / 528 Hz)',
    category: 'hemispheric',
    binauralBeatHz: 6.0,
    carrierFreqHz: 432.0,
    harmonicDescription: 'Dual gold-alloy singing bowl acoustic phase overtones',
    recommendedKssRange: [5, 8],
    icon: '🥣'
  },
  {
    id: 'mit_gamma_40hz',
    name: 'MIT 40 Hz Gamma Synchrony (Lucidity)',
    category: 'hemispheric',
    binauralBeatHz: 40.0,
    carrierFreqHz: 440.0,
    harmonicDescription: 'Isochronic 40 Hz gamma pulse for focused executive flow',
    recommendedKssRange: [1, 3],
    icon: '🧠'
  },
  {
    id: 'holosync_descending',
    name: 'Holosync Descending Gateway (Alpha → Delta)',
    category: 'hemispheric',
    binauralBeatHz: 3.5,
    carrierFreqHz: 150.0,
    harmonicDescription: 'Graduated frequency reduction from 12 Hz Alpha to 3.5 Hz Delta',
    recommendedKssRange: [7, 9],
    icon: '🌀'
  },

  // ── Persian Deep Trance & Sufi Drones ──
  {
    id: 'persian_dastgah_shur',
    name: 'Persian Sufi Ney & Shur Trance (432 Hz)',
    category: 'persian',
    binauralBeatHz: 7.83,
    carrierFreqHz: 432.0,
    harmonicDescription: '432 Hz Pythagorean microtonal drone with Ney breath harmonics',
    recommendedKssRange: [4, 7],
    icon: '🕌'
  },
  {
    id: 'persian_mahur_flow',
    name: 'Persian Mahur Solar Trance',
    category: 'persian',
    binauralBeatHz: 14.0,
    carrierFreqHz: 432.0,
    harmonicDescription: 'Low Beta 14 Hz clarity with Tanbur rhythmic harmonics',
    recommendedKssRange: [1, 3],
    icon: '☀️'
  },
  {
    id: 'persian_homayoun_rest',
    name: 'Persian Homayoun Twilight Drone',
    category: 'persian',
    binauralBeatHz: 5.5,
    carrierFreqHz: 396.0,
    harmonicDescription: 'Microtonal Koron third with resonant Daf 60 BPM heartbeat',
    recommendedKssRange: [6, 9],
    icon: '🌙'
  },

  // ── Animal Comfort Bio-Acoustics ──
  {
    id: 'canine_heartbeat',
    name: 'Canine Cardiac Co-Regulation (60 BPM)',
    category: 'animal',
    binauralBeatHz: 1.0,
    carrierFreqHz: 110.0,
    harmonicDescription: '60 BPM deep resonant cardiac pulse for vagal stabilization',
    recommendedKssRange: [4, 7],
    icon: '🐕'
  },
  {
    id: 'feline_purr',
    name: 'Feline 25–140 Hz Bone Healing Purr',
    category: 'animal',
    binauralBeatHz: 25.0,
    carrierFreqHz: 55.0,
    harmonicDescription: 'Low-frequency mechanical vibratory purr for tissue healing',
    recommendedKssRange: [5, 9],
    icon: '🐈'
  },
  {
    id: 'cetacean_528hz',
    name: 'Cetacean 528 Hz Deep Ocean Solfeggio',
    category: 'animal',
    binauralBeatHz: 5.28,
    carrierFreqHz: 528.0,
    harmonicDescription: '528 Hz transformation frequency with deep ocean whale acoustics',
    recommendedKssRange: [4, 8],
    icon: '🐋'
  },
  {
    id: 'avian_dawn',
    name: 'Avian Circadian Dawn Chorus',
    category: 'animal',
    binauralBeatHz: 12.0,
    carrierFreqHz: 587.33,
    harmonicDescription: 'High-spectrum polyphonic birdsong for circadian entrainment',
    recommendedKssRange: [1, 4],
    icon: '🕊️'
  }
];

@Injectable({
  providedIn: 'root'
})
export class MonroePersianTranceService {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private pulseIntervalTimer: any = null;

  readonly isPlaying = signal<boolean>(false);
  readonly currentMode = signal<HemisphericSyncType | null>(null);
  readonly currentKss = signal<KarolinskaSleepinessLevel>(3);
  readonly masterVolume = signal<number>(0.12);

  readonly currentPreset = computed<IHemisphericPreset | null>(() => {
    const mode = this.currentMode();
    if (!mode) return null;
    if (mode === 'kss_adaptive_flow') {
      return this.getAdaptivePresetForKss(this.currentKss());
    }
    return HEMISPHERIC_PRESETS.find(p => p.id === mode) || null;
  });

  /**
   * Automatically select the optimal audio protocol based on Karolinska Sleepiness Score (1-9)
   */
  getAdaptivePresetForKss(kss: KarolinskaSleepinessLevel): IHemisphericPreset {
    if (kss <= 3) {
      // Alert -> MIT 40 Hz Gamma or Persian Mahur for sustained flow without fatigue
      return HEMISPHERIC_PRESETS.find(p => p.id === 'persian_mahur_flow')!;
    } else if (kss <= 6) {
      // Moderate Fatigue -> Sacred Cedar Flute or Persian Sufi Shur 432Hz
      return HEMISPHERIC_PRESETS.find(p => p.id === 'indigenous_cedar_flute')!;
    } else {
      // High Sleepiness -> Native Water Drum 4.5 Hz / Monroe Focus 10 for restorative reset
      return HEMISPHERIC_PRESETS.find(p => p.id === 'native_water_drum_theta')!;
    }
  }

  /**
   * Set Karolinska Sleepiness Scale level and adaptively adjust station if in auto-flow mode
   */
  setKssLevel(kss: KarolinskaSleepinessLevel): void {
    this.currentKss.set(kss);
    if (this.isPlaying() && this.currentMode() === 'kss_adaptive_flow') {
      this.playAdaptiveKssFlow(kss);
    }
  }

  /**
   * Play a specific hemispheric, indigenous, or trance preset
   */
  playPreset(mode: HemisphericSyncType): void {
    this.stop();
    this.currentMode.set(mode);
    this.initAudioContext();
    if (!this.audioCtx || !this.masterGain) return;

    this.isPlaying.set(true);

    if (mode === 'kss_adaptive_flow') {
      this.playAdaptiveKssFlow(this.currentKss());
      return;
    }

    const preset = HEMISPHERIC_PRESETS.find(p => p.id === mode);
    if (!preset) return;

    switch (preset.category) {
      case 'indigenous':
        this.synthesizeIndigenousTrance(preset.id, preset.carrierFreqHz, preset.binauralBeatHz);
        break;
      case 'monroe':
      case 'hemispheric':
        if (preset.id === 'emdr_bilateral_alpha') {
          this.synthesizeEmdrBilateral(preset.carrierFreqHz, preset.binauralBeatHz);
        } else if (preset.id === 'mit_gamma_40hz') {
          this.synthesizeMitGamma40Hz(preset.carrierFreqHz);
        } else if (preset.id === 'tibetan_dual_bowl') {
          this.synthesizeTibetanSingingBowl(preset.carrierFreqHz);
        } else {
          this.synthesizeMonroeHemiSync(preset.carrierFreqHz, preset.binauralBeatHz);
        }
        break;
      case 'persian':
        this.synthesizePersianTrance(preset.carrierFreqHz, preset.binauralBeatHz);
        break;
      case 'animal':
        this.synthesizeAnimalBioAcoustics(preset.id);
        break;
      default:
        this.synthesizeMonroeHemiSync(preset.carrierFreqHz, preset.binauralBeatHz);
        break;
    }
  }

  /**
   * Launch adaptive flow tuned to Karolinska Sleepiness Scale
   */
  playAdaptiveKssFlow(kss: KarolinskaSleepinessLevel = this.currentKss()): void {
    const adaptivePreset = this.getAdaptivePresetForKss(kss);
    this.currentMode.set('kss_adaptive_flow');
    this.initAudioContext();
    if (!this.audioCtx || !this.masterGain) return;

    this.isPlaying.set(true);

    if (adaptivePreset.category === 'indigenous') {
      this.synthesizeIndigenousTrance(adaptivePreset.id, adaptivePreset.carrierFreqHz, adaptivePreset.binauralBeatHz);
    } else if (adaptivePreset.category === 'persian') {
      this.synthesizePersianTrance(adaptivePreset.carrierFreqHz, adaptivePreset.binauralBeatHz);
    } else if (adaptivePreset.category === 'animal') {
      this.synthesizeAnimalBioAcoustics(adaptivePreset.id);
    } else {
      this.synthesizeMonroeHemiSync(adaptivePreset.carrierFreqHz, adaptivePreset.binauralBeatHz);
    }
  }

  /**
   * Stop all active oscillators, noise generators, and timers
   */
  stop(): void {
    if (this.pulseIntervalTimer) {
      clearInterval(this.pulseIntervalTimer);
      this.pulseIntervalTimer = null;
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
        // Safe disposal
      }
    });

    this.activeNodes = [];
    this.isPlaying.set(false);
    this.currentMode.set(null);
  }

  /**
   * Adjust master output volume (0.0 to 1.0)
   */
  setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.masterVolume.set(clamped);
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.05);
    }
  }

  // ── Synthesis Subroutines ──

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

  /**
   * Synthesize Native American & Indigenous Trances (Cedar Flute, Water Drum, Gourd Rattle, Canoe Cadence)
   */
  private synthesizeIndigenousTrance(id: HemisphericSyncType, rootHz: number, thetaBeatHz: number): void {
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    if (id === 'indigenous_cedar_flute') {
      // Minor pentatonic cedar flute with natural breath vibrato
      const fluteOsc = this.audioCtx.createOscillator();
      const fluteFilter = this.audioCtx.createBiquadFilter();
      const fluteGain = this.audioCtx.createGain();

      fluteOsc.type = 'triangle';
      fluteOsc.frequency.setValueAtTime(rootHz, now);

      fluteFilter.type = 'bandpass';
      fluteFilter.frequency.setValueAtTime(rootHz, now);
      fluteFilter.Q.setValueAtTime(5.0, now);

      // Breath Vibrato LFO (5.5 Hz Theta)
      const vibratoLfo = this.audioCtx.createOscillator();
      const vibratoGain = this.audioCtx.createGain();
      vibratoLfo.frequency.setValueAtTime(thetaBeatHz, now);
      vibratoGain.gain.setValueAtTime(6.0, now);
      vibratoLfo.connect(vibratoGain);
      vibratoGain.connect(fluteOsc.frequency);
      vibratoLfo.start(now);

      fluteGain.gain.setValueAtTime(0.07, now);
      fluteOsc.connect(fluteFilter).connect(fluteGain).connect(this.masterGain);
      fluteOsc.start(now);

      this.activeNodes.push(fluteOsc, fluteFilter, fluteGain, vibratoLfo, vibratoGain);

    } else if (id === 'native_water_drum_theta') {
      // 4.5 Hz Shamanic Elk-Hide Water Drum Pulse
      const drumOsc = this.audioCtx.createOscillator();
      const drumGain = this.audioCtx.createGain();
      drumOsc.type = 'sine';
      drumOsc.frequency.setValueAtTime(rootHz, now);

      drumGain.gain.setValueAtTime(0.08, now);
      drumOsc.connect(drumGain).connect(this.masterGain);
      drumOsc.start(now);

      // Periodic 4.5 Hz pulse envelope
      const pulseLfo = this.audioCtx.createOscillator();
      const pulseGain = this.audioCtx.createGain();
      pulseLfo.type = 'sawtooth';
      pulseLfo.frequency.setValueAtTime(thetaBeatHz, now); // 4.5 Hz
      pulseGain.gain.setValueAtTime(0.06, now);
      pulseLfo.connect(pulseGain);
      pulseGain.connect(drumGain.gain);
      pulseLfo.start(now);

      this.activeNodes.push(drumOsc, drumGain, pulseLfo, pulseGain);

    } else if (id === 'gourd_rattle_clearing') {
      // High-spectrum seed shimmer (Filtered White/Pink Noise)
      const bufferSize = this.audioCtx.sampleRate * 2;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const highpass = this.audioCtx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(4500, now);

      const rattleGain = this.audioCtx.createGain();
      rattleGain.gain.setValueAtTime(0.03, now);

      // 10 Hz Alpha rattle rhythm
      const rattleLfo = this.audioCtx.createOscillator();
      const rattleLfoGain = this.audioCtx.createGain();
      rattleLfo.type = 'square';
      rattleLfo.frequency.setValueAtTime(thetaBeatHz, now);
      rattleLfoGain.gain.setValueAtTime(0.02, now);
      rattleLfo.connect(rattleLfoGain);
      rattleLfoGain.connect(rattleGain.gain);
      rattleLfo.start(now);

      whiteNoise.connect(highpass).connect(rattleGain).connect(this.masterGain);
      whiteNoise.start(now);

      this.activeNodes.push(whiteNoise, highpass, rattleGain, rattleLfo, rattleLfoGain);

    } else if (id === 'wabanaki_canoe_cadence') {
      // 60 BPM River Water & Pine Canopy Cadence
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(rootHz, now);
      gain.gain.setValueAtTime(0.06, now);
      osc.connect(gain).connect(this.masterGain);
      osc.start(now);
      this.activeNodes.push(osc, gain);
    }
  }

  /**
   * Synthesize Monroe Institute style stereo binaural beat with subtle pink noise bed
   */
  private synthesizeMonroeHemiSync(carrierHz: number, beatHz: number): void {
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    // Left Channel: Carrier - (Beat / 2)
    const oscLeft = this.audioCtx.createOscillator();
    const panLeft = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;
    const gainLeft = this.audioCtx.createGain();

    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(carrierHz - beatHz / 2, now);
    gainLeft.gain.setValueAtTime(0.08, now);

    if (panLeft) {
      panLeft.pan.setValueAtTime(-0.9, now);
      oscLeft.connect(gainLeft).connect(panLeft).connect(this.masterGain);
      this.activeNodes.push(panLeft);
    } else {
      oscLeft.connect(gainLeft).connect(this.masterGain);
    }

    // Right Channel: Carrier + (Beat / 2)
    const oscRight = this.audioCtx.createOscillator();
    const panRight = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;
    const gainRight = this.audioCtx.createGain();

    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(carrierHz + beatHz / 2, now);
    gainRight.gain.setValueAtTime(0.08, now);

    if (panRight) {
      panRight.pan.setValueAtTime(0.9, now);
      oscRight.connect(gainRight).connect(panRight).connect(this.masterGain);
      this.activeNodes.push(panRight);
    } else {
      oscRight.connect(gainRight).connect(this.masterGain);
    }

    // Isochronic Sub-Harmonic Warble
    const subOsc = this.audioCtx.createOscillator();
    const subGain = this.audioCtx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(carrierHz / 2, now);
    subGain.gain.setValueAtTime(0.02, now);
    subOsc.connect(subGain).connect(this.masterGain);

    oscLeft.start(now);
    oscRight.start(now);
    subOsc.start(now);

    this.activeNodes.push(oscLeft, oscRight, subOsc, gainLeft, gainRight, subGain);
  }

  /**
   * Synthesize EMDR Bilateral Alternating Left/Right Panning at 8 Hz Alpha rate
   */
  private synthesizeEmdrBilateral(carrierHz: number, modulationRateHz: number): void {
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const panner = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(carrierHz, now);
    gain.gain.setValueAtTime(0.09, now);

    if (panner) {
      const lfo = this.audioCtx.createOscillator();
      const lfoGain = this.audioCtx.createGain();
      lfo.frequency.setValueAtTime(0.5, now);
      lfoGain.gain.setValueAtTime(1.0, now);
      lfo.connect(panner.pan);
      lfo.start(now);

      osc.connect(gain).connect(panner).connect(this.masterGain);
      this.activeNodes.push(panner, lfo, lfoGain);
    } else {
      osc.connect(gain).connect(this.masterGain);
    }

    osc.start(now);
    this.activeNodes.push(osc, gain);
  }

  /**
   * Synthesize MIT 40 Hz Gamma synchrony isochronic burst
   */
  private synthesizeMitGamma40Hz(carrierHz: number): void {
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const pulseGain = this.audioCtx.createGain();
    const lfo = this.audioCtx.createOscillator();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(carrierHz, now);

    lfo.type = 'square';
    lfo.frequency.setValueAtTime(40.0, now);

    pulseGain.gain.setValueAtTime(0.08, now);
    lfo.connect(pulseGain.gain);

    osc.connect(pulseGain).connect(this.masterGain);

    osc.start(now);
    lfo.start(now);

    this.activeNodes.push(osc, lfo, pulseGain);
  }

  /**
   * Synthesize Tibetan Dual Singing Bowl (432 Hz Fundamental + 528 Hz Harmonic Overtones)
   */
  private synthesizeTibetanSingingBowl(fundamentalHz: number): void {
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    const bowl1 = this.audioCtx.createOscillator();
    const bowl2 = this.audioCtx.createOscillator();
    const overtone = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    bowl1.type = 'sine';
    bowl1.frequency.setValueAtTime(fundamentalHz, now);

    bowl2.type = 'sine';
    bowl2.frequency.setValueAtTime(fundamentalHz * 1.014, now);

    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(528.0, now);

    gain.gain.setValueAtTime(0.07, now);

    bowl1.connect(gain);
    bowl2.connect(gain);
    overtone.connect(gain);
    gain.connect(this.masterGain);

    bowl1.start(now);
    bowl2.start(now);
    overtone.start(now);

    this.activeNodes.push(bowl1, bowl2, overtone, gain);
  }

  /**
   * Synthesize Persian Sufi Ney & Shur modal drone (432 Hz Pythagorean + Quarter-Tone microtonal harmonics)
   */
  private synthesizePersianTrance(rootHz: number, modulationHz: number): void {
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    const oscRoot = this.audioCtx.createOscillator();
    const gainRoot = this.audioCtx.createGain();
    oscRoot.type = 'sawtooth';
    oscRoot.frequency.setValueAtTime(rootHz, now);

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);
    filter.Q.setValueAtTime(4.0, now);

    gainRoot.gain.setValueAtTime(0.06, now);
    oscRoot.connect(filter).connect(gainRoot).connect(this.masterGain);

    const oscKoron = this.audioCtx.createOscillator();
    const gainKoron = this.audioCtx.createGain();
    oscKoron.type = 'sine';
    oscKoron.frequency.setValueAtTime(rootHz * 1.22, now);
    gainKoron.gain.setValueAtTime(0.04, now);
    oscKoron.connect(gainKoron).connect(this.masterGain);

    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.frequency.setValueAtTime(modulationHz > 0 ? modulationHz / 2 : 0.2, now);
    lfoGain.gain.setValueAtTime(0.02, now);
    lfo.connect(lfoGain);
    lfoGain.connect(gainRoot.gain);

    oscRoot.start(now);
    oscKoron.start(now);
    lfo.start(now);

    this.activeNodes.push(oscRoot, oscKoron, lfo, filter, gainRoot, gainKoron, lfoGain);
  }

  /**
   * Synthesize Animal Bio-Acoustic Comfort Protocols
   */
  private synthesizeAnimalBioAcoustics(mode: HemisphericSyncType): void {
    if (!this.audioCtx || !this.masterGain) return;
    const now = this.audioCtx.currentTime;

    if (mode === 'canine_heartbeat') {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, now);
      gain.gain.setValueAtTime(0.09, now);
      osc.connect(gain).connect(this.masterGain);
      osc.start(now);
      this.activeNodes.push(osc, gain);
    } else if (mode === 'feline_purr') {
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(25.0, now);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(50.0, now);

      gain.gain.setValueAtTime(0.07, now);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      this.activeNodes.push(osc1, osc2, gain);
    } else if (mode === 'cetacean_528hz') {
      const osc = this.audioCtx.createOscillator();
      const filter = this.audioCtx.createBiquadFilter();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(528.0, now);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(528.0, now);
      filter.Q.setValueAtTime(3.0, now);

      gain.gain.setValueAtTime(0.05, now);
      osc.connect(filter).connect(gain).connect(this.masterGain);
      osc.start(now);
      this.activeNodes.push(osc, filter, gain);
    } else if (mode === 'avian_dawn') {
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880.0, now);

      gain.gain.setValueAtTime(0.03, now);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      this.activeNodes.push(osc1, osc2, gain);
    }
  }
}
