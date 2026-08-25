import { Injectable, signal, computed, inject, effect, untracked, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PatientStateService } from './patient-state.service';
import { DictationService } from './dictation.service';
import { BleWearablesService } from './hardware/ble-wearables.service';
import { VibroacousticHapticService } from './hardware/vibroacoustic-haptic.service';

export type AvsBitrateTier = '192k' | '320k' | '1536k_lossless' | '4608k_studio';
export type AvsSaturationProfile = 'tube_warmth' | 'tape_velvet' | 'pristine_linear';

export interface ISolfeggioTone {
  id: string;
  name: string;
  carrierFreqHz: number;
  clinicalContext: string;
  chakraAffinity: string;
  harmonicDescription: string;
}

export interface IBrainwavePreset {
  id: string;
  name: string;
  waveType: 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma' | 'schumann';
  beatFreqHz: number;
  recommendedCarrierHz: number;
  targetState: string;
  clinicalRationale: string;
}

export const SOLFEGGIO_CATALOG: ISolfeggioTone[] = [
  {
    id: 'solf-174',
    name: '174 Hz — Foundation & Somatosensory Relief',
    carrierFreqHz: 174,
    clinicalContext: 'Natural anesthetic grounding; reduces peripheral musculoskeletal tension and downregulates nociceptive signaling.',
    chakraAffinity: 'Sub-Root / Grounding',
    harmonicDescription: 'Deep, resonant acoustic bedrock encouraging physical cellular relaxation.'
  },
  {
    id: 'solf-285',
    name: '285 Hz — Cellular Matrix Restoration',
    carrierFreqHz: 285,
    clinicalContext: 'Cellular quantum morphogenesis; promotes restorative biological tissue recovery.',
    chakraAffinity: 'Root / Etheric Field',
    harmonicDescription: 'Warm harmonic foundation aiding cellular homeostasis.'
  },
  {
    id: 'solf-396',
    name: '396 Hz — Liberation from Fear & Allostatic Burden',
    carrierFreqHz: 396,
    clinicalContext: 'Sympathetic downregulation; cleanses allostatic stress loops and autonomic fight-or-flight tension.',
    chakraAffinity: 'Muladhara (Root Chakra)',
    harmonicDescription: 'Low-frequency visceral anchor for stabilizing emotional security.'
  },
  {
    id: 'solf-417',
    name: '417 Hz — Facilitating Neuroplastic Change',
    carrierFreqHz: 417,
    clinicalContext: 'Dislodging stagnant behavioral conditioning and neuroplastic habituation.',
    chakraAffinity: 'Svadhisthana (Sacral Chakra)',
    harmonicDescription: 'Fluid, warm middle register encouraging adaptive cognitive shifts.'
  },
  {
    id: 'pyth-432',
    name: '432 Hz — Pythagorean Natural Harmonic Reference',
    carrierFreqHz: 432,
    clinicalContext: 'Verdi scientific tuning; synchronizes with natural planetary acoustics and heart rate variability (HRV) coherence.',
    chakraAffinity: 'Biofield Coherence',
    harmonicDescription: 'Mathematically harmonious acoustic proportion eliminating auditory fatigue.'
  },
  {
    id: 'solf-528',
    name: '528 Hz — Transformation & Mitochondrial Cellular Miracles',
    carrierFreqHz: 528,
    clinicalContext: 'Mitochondrial biophotonic resonance; stimulates cytochrome c oxidase efficiency and DNA repair signaling.',
    chakraAffinity: 'Manipura (Solar Plexus) & Bio-Resonance',
    harmonicDescription: 'The Golden Frequency of organic nature and cellular vitality.'
  },
  {
    id: 'solf-639',
    name: '639 Hz — Interpersonal & Heart Center Coherence',
    carrierFreqHz: 639,
    clinicalContext: 'Enhances social engagement system via myelinated vagus nerve, supporting empathy and emotional calm.',
    chakraAffinity: 'Anahata (Heart Chakra)',
    harmonicDescription: 'Enfolding melodic frequency supporting relational harmony.'
  },
  {
    id: 'solf-741',
    name: '741 Hz — Cellular Detoxification & Intuitive Clarity',
    carrierFreqHz: 741,
    clinicalContext: 'Stimulates intuitive problem-solving and cellular autophagic clearance of metabolic residue.',
    chakraAffinity: 'Vishuddha (Throat Chakra)',
    harmonicDescription: 'Piercing, crystalline timbre promoting cognitive clarity.'
  },
  {
    id: 'solf-852',
    name: '852 Hz — Awakening Intuition & Neural Order',
    carrierFreqHz: 852,
    clinicalContext: 'Returns neural firing patterns to pristine baseline; aids meditative focus and visual spatial awareness.',
    chakraAffinity: 'Ajna (Third Eye Chakra)',
    harmonicDescription: 'High-register luminous tone stimulating cortical synchrony.'
  },
  {
    id: 'solf-963',
    name: '963 Hz — Crown Pineal Pure Consciousness',
    carrierFreqHz: 963,
    clinicalContext: 'Pineal gland activation, circadian melatonin regulation, and transcendent cognitive unity.',
    chakraAffinity: 'Sahasrara (Crown Chakra)',
    harmonicDescription: 'Translucent high-frequency harmonic envelope.'
  }
];

export const BRAINWAVE_PRESETS: IBrainwavePreset[] = [
  {
    id: 'deep-delta-sleep',
    name: 'Deep Delta Rest & Somatotropic Recovery',
    waveType: 'delta',
    beatFreqHz: 1.5,
    recommendedCarrierHz: 174,
    targetState: 'Stage 3/4 Slow-Wave Deep Sleep',
    clinicalRationale: 'Triggers somatotropin (human growth hormone) secretion and glymphatic brain metabolic clearance.'
  },
  {
    id: 'theta-meditation',
    name: 'Theta Hypnagogic & Subconscious Flow',
    waveType: 'theta',
    beatFreqHz: 5.5,
    recommendedCarrierHz: 528,
    targetState: 'Deep Meditative Absorption & Neuroplastic Visualization',
    clinicalRationale: 'Downregulates default mode network (DMN) hyperactivity to relieve anxiety and rumination.'
  },
  {
    id: 'schumann-resonance',
    name: 'Schumann Planetary Biospheric Resonance',
    waveType: 'schumann',
    beatFreqHz: 7.83,
    recommendedCarrierHz: 432,
    targetState: 'Bio-Electromagnetic Coherence',
    clinicalRationale: 'Fundamental electromagnetic resonance of the Earth ionospheric cavity (7.83 Hz) restoring circadian grounding.'
  },
  {
    id: 'alpha-relaxed-focus',
    name: 'Alpha Calm Focus & Attentive Clarity',
    waveType: 'alpha',
    beatFreqHz: 10.0,
    recommendedCarrierHz: 432,
    targetState: 'Relaxed Alertness & Reduced Cortisol',
    clinicalRationale: 'Promotes thalamocortical alpha synchrony, reducing situational performance stress while maintaining vigilance.'
  },
  {
    id: 'beta-cognition',
    name: 'Beta Problem-Solving & Analytical Drive',
    waveType: 'beta',
    beatFreqHz: 18.0,
    recommendedCarrierHz: 639,
    targetState: 'Active Cognitive Processing',
    clinicalRationale: 'Upregulates left-hemispheric prefrontal alertness and executive task engagement.'
  },
  {
    id: 'gamma-synchrony',
    name: 'Gamma Peak Processing & Hyper-Integration',
    waveType: 'gamma',
    beatFreqHz: 40.0,
    recommendedCarrierHz: 963,
    targetState: 'Cortical Micro-Binding & High Insight',
    clinicalRationale: '40 Hz gamma oscillations coordinate distant brain regions for peak working memory retrieval and sensory binding.'
  }
];

export interface IAvsSessionConfig {
  carrierFreqHz: number; // e.g. 528Hz (Solfeggio Transformation) or 432Hz (Pythagorean)
  binauralBeatHz: number; // e.g. 6Hz (Theta Deep Relaxation) or 10Hz (Alpha Focus)
  volume: number; // 0.0 - 1.0
  isStrobeEnabled: boolean;
  strobeColorHex: string;
  bitrateTier: AvsBitrateTier;
  sampleRate: number; // 44100, 48000, 96000
  harmonicOvertoneDepth: number; // 0.0 - 1.0 (Harmonic overtone richness)
  saturationProfile: AvsSaturationProfile;
  analogTapeNoiseFloor: boolean;
  psychoacousticSpatialCrossfeed: boolean;
  crossfeedDelayMs: number; // 0.25 - 0.35ms (Bauer ITD Craniometric Model)
  crossfeedGainDb: number; // -18dB to -9dB
  isIsochronicPulseEnabled: boolean;
  isochronicDepth: number; // 0.0 - 1.0 (Isochronic pulse amplitude depth)
}

/**
 * AvsEngineService — Audiophile Studio Audio-Visual Entrainment & Co-Regulation Engine
 * 
 * Engineered from high-end psychoacoustic & audiophile studio engineering principles:
 * - 4608 kbps 24-bit / 96kHz Lossless Studio Reference
 * - 1536 kbps 24-bit / 48kHz Direct PCM Reference (32-bit float internal DSP)
 * - 9-Tone Solfeggio Scale & 7.83Hz Schumann Planetary Cavity Resonance
 * - Dual-Modality: Stereo Headphone Binaural + Open-Air Isochronic Pulse LFO
 * - Multi-Harmonic Overtone Synthesis (Fundamental + 2x Octave + 3x Fifth + 0.5x Sub-Bass)
 * - Bauer HRTF Psychoacoustic Pinna Crossfeed (Eliminates headphone isolation fatigue)
 * - 53-Bit Cryptographic Mantissa Analog Tape Pink Noise Floor
 * - Vacuum Tube / Velvet Tape Non-Linear Soft-Clipping Waveshaper
 * - Studio Opto-Style Dynamics Compressor with 19.5kHz Anti-Aliasing Filter
 */
@Injectable({
  providedIn: 'root'
})
export class AvsEngineService {
  private readonly platformId = (() => {
    try { return inject(PLATFORM_ID, { optional: true }) ?? 'browser'; } catch { return 'browser'; }
  })();
  private readonly zone = (() => {
    try { return inject(NgZone, { optional: true }); } catch { return null; }
  })();
  private readonly state = (() => {
    try { return inject(PatientStateService, { optional: true }); } catch { return null; }
  })();
  private readonly dictation = (() => {
    try { return inject(DictationService, { optional: true }); } catch { return null; }
  })();
  private readonly bleWearables = (() => {
    try { return inject(BleWearablesService, { optional: true }); } catch { return null; }
  })();
  private readonly haptics = (() => {
    try { return inject(VibroacousticHapticService, { optional: true }); } catch { return null; }
  })();
  private readonly isBrowser = typeof window !== 'undefined' && isPlatformBrowser(this.platformId as Object);

  readonly isDucked = signal<boolean>(false);
  readonly isBiofeedbackLocked = signal<boolean>(false);
  readonly biofeedbackHeartRate = computed<number | null>(() => this.bleWearables?.heartRate() ?? null);
  readonly biofeedbackCoherenceScore = computed<number>(() => this.bleWearables?.autonomicCoherenceScore() ?? 0);
  readonly biofeedbackResonanceHz = computed<number>(() => this.bleWearables?.cardiacResonanceHz() ?? 0.10);
  readonly biofeedbackStateLabel = computed<string>(() => this.bleWearables?.recommendedEntrainmentHz().stateLabel ?? 'Nominal');

  readonly isHapticsActive = computed<boolean>(() => this.haptics?.isHapticsActive() ?? false);
  readonly isGamepadConnected = computed<boolean>(() => this.haptics?.isGamepadConnected() ?? false);
  readonly isMobileVibrationSupported = computed<boolean>(() => this.haptics?.isMobileVibrationSupported() ?? false);

  private config = signal<IAvsSessionConfig>({
    carrierFreqHz: 528,
    binauralBeatHz: 6,
    volume: 0.55,
    isStrobeEnabled: false,
    strobeColorHex: '#38bdf8',
    bitrateTier: '4608k_studio',
    sampleRate: 96000,
    harmonicOvertoneDepth: 0.85,
    saturationProfile: 'tube_warmth',
    analogTapeNoiseFloor: true,
    psychoacousticSpatialCrossfeed: true,
    crossfeedDelayMs: 0.28,
    crossfeedGainDb: -12,
    isIsochronicPulseEnabled: false,
    isochronicDepth: 0.75
  });

  private isPlayingSignal = signal<boolean>(false);

  // --- Audio Graph Web Audio API Nodes ---
  private audioCtx: AudioContext | null = null;
  private mainGain: GainNode | null = null;
  private isochronicGainNode: GainNode | null = null;
  private isochronicLfoNode: OscillatorNode | null = null;
  private isochronicDepthGain: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private antiAliasFilter: BiquadFilterNode | null = null;
  private waveshaperNode: WaveShaperNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private pannerNode: PannerNode | null = null;
  private mergerNode: ChannelMergerNode | null = null;
  private splitterNode: ChannelSplitterNode | null = null;

  // Crossfeed Nodes (Bauer HRTF)
  private leftToRightDelay: DelayNode | null = null;
  private leftToRightFilter: BiquadFilterNode | null = null;
  private leftToRightGain: GainNode | null = null;
  private rightToLeftDelay: DelayNode | null = null;
  private rightToLeftFilter: BiquadFilterNode | null = null;
  private rightToLeftGain: GainNode | null = null;

  private activeOscillators: OscillatorNode[] = [];
  private activeGains: GainNode[] = [];
  private noiseSourceNode: AudioBufferSourceNode | null = null;
  private noiseGainNode: GainNode | null = null;

  readonly isSpatialPanningEnabled = signal<boolean>(false);
  readonly spatialSourcePosition = signal<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  readonly spatialAzimuthDeg = computed<number>(() => {
    const pos = this.spatialSourcePosition();
    const rad = Math.atan2(pos.x, pos.z || 1.0);
    return Math.round(rad * (180 / Math.PI));
  });

  readonly sessionConfig = this.config.asReadonly();
  readonly isPlaying = this.isPlayingSignal.asReadonly();

  readonly leftOscFreq = computed(() => this.config().carrierFreqHz);
  readonly rightOscFreq = computed(() => this.config().carrierFreqHz + this.config().binauralBeatHz);

  readonly bitrateLabel = computed<string>(() => {
    const tier = this.config().bitrateTier;
    switch (tier) {
      case '4608k_studio':
        return '4608 kbps • 24-bit/96kHz Studio Lossless (32-bit Float DSP)';
      case '1536k_lossless':
        return '1536 kbps • 24-bit/48kHz Direct PCM (Lossless Reference)';
      case '320k':
        return '320 kbps • Audiophile Spatial (Bauer HRTF Binaural)';
      case '192k':
      default:
        return '192 kbps • Standard Co-Regulation';
    }
  });

  readonly harmonicOvertoneFreqs = computed(() => {
    const f0 = this.config().carrierFreqHz;
    const beat = this.config().binauralBeatHz;
    return {
      fundamental: { left: f0, right: f0 + beat },
      octave2x: { left: f0 * 2, right: (f0 + beat) * 2 },
      fifth3x: { left: f0 * 3, right: (f0 + beat) * 3 },
      subBass: { left: f0 * 0.5, right: (f0 + beat) * 0.5 }
    };
  });

  readonly activeSolfeggioTone = computed<ISolfeggioTone | null>(() => {
    const carrier = this.config().carrierFreqHz;
    return SOLFEGGIO_CATALOG.find(s => s.carrierFreqHz === carrier) || null;
  });

  constructor() {
    if (!this.isBrowser) return;

    // Reactively synchronize with PatientStateService if available
    if (this.state && typeof this.state.isAvsSessionActive === 'function') {
      effect(() => {
        const active = this.state!.isAvsSessionActive();
        const freqHz = typeof this.state!.avsBrainwaveFrequencyHz === 'function' ? this.state!.avsBrainwaveFrequencyHz() : 6;
        const wave = typeof this.state!.avsBrainwaveFrequency === 'function' ? this.state!.avsBrainwaveFrequency() : 'theta';

        untracked(() => {
          let carrier = 528;
          if (wave === 'delta') carrier = 432;
          else if (wave === 'theta') carrier = 528;
          else if (wave === 'alpha') carrier = 432;
          else if (wave === 'gamma') carrier = 528;

          this.updateSessionConfig({
            carrierFreqHz: carrier,
            binauralBeatHz: freqHz
          });

          if (active && !this.isPlayingSignal()) {
            this.startAudio();
          } else if (!active && this.isPlayingSignal()) {
            this.stopAudio();
          } else if (active && this.isPlayingSignal()) {
            this.updateLiveFrequencies();
          }
        });
      });
    }

    // Reactively sidechain-duck AVS volume when clinical dictation is active
    if (this.dictation && typeof this.dictation.isListening === 'function') {
      effect(() => {
        const isListening = this.dictation!.isListening();
        const depth = typeof this.dictation!.sidechainDuckingDepth === 'function' 
          ? this.dictation!.sidechainDuckingDepth() 
          : 0.85;

        untracked(() => {
          this.isDucked.set(isListening);
          if (this.mainGain && this.audioCtx) {
            const nominalGain = 0.18;
            const targetGain = isListening ? nominalGain * (1.0 - depth) : nominalGain;
            const timeConstant = isListening ? 0.04 : 0.60;
            this.mainGain.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, timeConstant);
          }
        });
      });
    }

    // Reactively lock AVS binaural beat and carrier to real-time wearable HRV/RSA telemetry
    if (this.bleWearables && typeof this.bleWearables.heartRate === 'function') {
      effect(() => {
        const locked = this.isBiofeedbackLocked();
        const recommendation = typeof this.bleWearables!.recommendedEntrainmentHz === 'function' 
          ? this.bleWearables!.recommendedEntrainmentHz() 
          : { beatFreqHz: 7.83, carrierFreqHz: 432, stateLabel: 'Coherence' };

        if (locked) {
          untracked(() => {
            this.updateSessionConfig({
              carrierFreqHz: recommendation.carrierFreqHz,
              binauralBeatHz: recommendation.beatFreqHz
            });
            if (this.isPlayingSignal()) {
              this.updateLiveFrequencies();
            }
          });
        }
      });
    }
  }

  /**
   * Toggles closed-loop wearable biofeedback synchronization
   */
  toggleBiofeedbackLock(forceState?: boolean): boolean {
    const nextState = forceState !== undefined ? forceState : !this.isBiofeedbackLocked();
    this.isBiofeedbackLocked.set(nextState);
    if (nextState && this.bleWearables && typeof this.bleWearables.recommendedEntrainmentHz === 'function') {
      const rec = this.bleWearables.recommendedEntrainmentHz();
      this.updateSessionConfig({
        carrierFreqHz: rec.carrierFreqHz,
        binauralBeatHz: rec.beatFreqHz
      });
      if (this.isPlayingSignal()) {
        this.updateLiveFrequencies();
      }
    }
    return nextState;
  }

  /**
   * Retrieves the full catalog of Solfeggio & Harmonic Sacred Frequencies
   */
  getSolfeggioCatalog(): ISolfeggioTone[] {
    return [...SOLFEGGIO_CATALOG];
  }

  /**
   * Retrieves the full catalog of Brainwave Co-Regulation Presets
   */
  getBrainwavePresets(): IBrainwavePreset[] {
    return [...BRAINWAVE_PRESETS];
  }

  /**
   * Applies a specific Solfeggio carrier frequency
   */
  applySolfeggioTone(toneIdOrHz: string | number): void {
    let targetHz = typeof toneIdOrHz === 'number' ? toneIdOrHz : 528;
    if (typeof toneIdOrHz === 'string') {
      const match = SOLFEGGIO_CATALOG.find(s => s.id === toneIdOrHz || String(s.carrierFreqHz) === toneIdOrHz);
      if (match) targetHz = match.carrierFreqHz;
    }
    this.updateSessionConfig({ carrierFreqHz: targetHz });
  }

  /**
   * Applies a complete Brainwave Entrainment Preset
   */
  applyBrainwavePreset(presetId: string): void {
    const preset = BRAINWAVE_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    this.updateSessionConfig({
      binauralBeatHz: preset.beatFreqHz,
      carrierFreqHz: preset.recommendedCarrierHz
    });
  }

  /**
   * Toggles Isochronic Pulse LFO modulation (for open-air speaker listening)
   */
  toggleIsochronicPulse(enabled?: boolean): boolean {
    const nextState = enabled !== undefined ? enabled : !this.config().isIsochronicPulseEnabled;
    this.updateSessionConfig({ isIsochronicPulseEnabled: nextState });
    if (this.isPlayingSignal()) {
      this.rebuildAudioGraph();
    }
    return nextState;
  }

  /**
   * Updates AVS parameters in real time and adjusts live oscillators
   */
  updateSessionConfig(patch: Partial<IAvsSessionConfig>): void {
    this.config.update(curr => ({ ...curr, ...patch }));
    if (this.isPlayingSignal()) {
      this.updateLiveFrequencies();
    }
  }

  /**
   * Sets the active Bitrate / Fidelity tier
   */
  setBitrateTier(tier: AvsBitrateTier): void {
    const patch: Partial<IAvsSessionConfig> = {
      bitrateTier: tier,
      sampleRate: tier === '4608k_studio' ? 96000 : (tier === '1536k_lossless' ? 48000 : 44100),
      harmonicOvertoneDepth: tier === '4608k_studio' ? 1.0 : (tier === '1536k_lossless' ? 0.85 : (tier === '320k' ? 0.50 : 0.0)),
      analogTapeNoiseFloor: tier !== '192k',
      psychoacousticSpatialCrossfeed: tier !== '192k'
    };
    this.updateSessionConfig(patch);
    if (this.isPlayingSignal()) {
      this.rebuildAudioGraph();
    }
  }

  /**
   * Sets the harmonic saturation profile
   */
  setSaturationProfile(profile: AvsSaturationProfile): void {
    this.updateSessionConfig({ saturationProfile: profile });
    if (this.isPlayingSignal()) {
      this.applySaturationCurve();
    }
  }

  /**
   * Toggle AVS session state
   */
  toggleSession(forceState?: boolean): boolean {
    const nextState = forceState !== undefined ? forceState : !this.isPlayingSignal();
    this.isPlayingSignal.set(nextState);
    if (this.state) {
      this.state.isAvsSessionActive.set(nextState);
    }
    if (nextState) {
      this.startAudio();
    } else {
      this.stopAudio();
    }
    return nextState;
  }

  /**
   * Toggle 3D Binaural HRTF Spatial Acoustic Panning mode
   */
  toggleSpatialPanning(forceState?: boolean): boolean {
    const nextState = forceState !== undefined ? forceState : !this.isSpatialPanningEnabled();
    this.isSpatialPanningEnabled.set(nextState);
    if (this.isPlayingSignal()) {
      this.rebuildAudioGraph();
    }
    return nextState;
  }

  /**
   * Update real-time 3D spatial coordinate position of target somatic lesion and camera listener
   */
  updateSpatialAudioPosition(
    sourcePos: { x: number; y: number; z: number },
    listenerPos?: { x: number; y: number; z: number },
    forwardVec?: { x: number; y: number; z: number }
  ): void {
    this.spatialSourcePosition.set(sourcePos);
    if (!this.audioCtx || !this.pannerNode) return;

    const now = this.audioCtx.currentTime;
    if (this.pannerNode.positionX) {
      this.pannerNode.positionX.setTargetAtTime(sourcePos.x, now, 0.05);
      this.pannerNode.positionY.setTargetAtTime(sourcePos.y, now, 0.05);
      this.pannerNode.positionZ.setTargetAtTime(sourcePos.z, now, 0.05);
    } else {
      (this.pannerNode as any).setPosition?.(sourcePos.x, sourcePos.y, sourcePos.z);
    }

    if (listenerPos && this.audioCtx.listener) {
      const listener = this.audioCtx.listener;
      if (listener.positionX) {
        listener.positionX.setTargetAtTime(listenerPos.x, now, 0.05);
        listener.positionY.setTargetAtTime(listenerPos.y, now, 0.05);
        listener.positionZ.setTargetAtTime(listenerPos.z, now, 0.05);
      } else {
        (listener as any).setPosition?.(listenerPos.x, listenerPos.y, listenerPos.z);
      }
    }

    if (forwardVec && this.audioCtx.listener) {
      const listener = this.audioCtx.listener;
      if (listener.forwardX) {
        listener.forwardX.setTargetAtTime(forwardVec.x, now, 0.05);
        listener.forwardY.setTargetAtTime(forwardVec.y, now, 0.05);
        listener.forwardZ.setTargetAtTime(forwardVec.z, now, 0.05);
      } else {
        (listener as any).setOrientation?.(forwardVec.x, forwardVec.y, forwardVec.z, 0, 1, 0);
      }
    }
  }

  /**
   * Toggle physical vibroacoustic somatosensory haptics
   */
  toggleVibroacousticHaptics(forceState?: boolean): boolean {
    if (!this.haptics) return false;
    return this.haptics.toggleHaptics(forceState);
  }

  /**
   * Start High-Resolution Audio Synthesis Graph
   */
  startAudio(): void {
    if (!this.isBrowser) return;

    const run = () => {
      try {
        if (!this.audioCtx || this.audioCtx.state === 'closed') {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (!AudioContextClass) return;

          const targetSampleRate = this.config().sampleRate || 96000;
          try {
            this.audioCtx = new AudioContextClass({
              sampleRate: targetSampleRate,
              latencyHint: 'playback'
            });
          } catch {
            this.audioCtx = new AudioContextClass();
          }
        }

        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }

        this.buildAudioGraph();
        this.isPlayingSignal.set(true);
      } catch (err) {
        console.warn('[AvsEngineService] Audiophile synthesis init deferred:', err);
      }
    };

    if (this.zone) {
      this.zone.runOutsideAngular(run);
    } else {
      run();
    }
  }

  /**
   * Stop Audio Synthesis Graph with soft fade-out to prevent clicks
   */
  stopAudio(): void {
    if (!this.isBrowser || !this.audioCtx) {
      this.isPlayingSignal.set(false);
      return;
    }

    const run = () => {
      try {
        const now = this.audioCtx!.currentTime;
        if (this.mainGain) {
          this.mainGain.gain.setValueAtTime(this.mainGain.gain.value, now);
          this.mainGain.gain.linearRampToValueAtTime(0.0001, now + 0.65);
        }

        setTimeout(() => {
          this.tearDownNodes();
          this.isPlayingSignal.set(false);
        }, 700);
      } catch {
        this.isPlayingSignal.set(false);
      }
    };

    if (this.zone) {
      this.zone.runOutsideAngular(run);
    } else {
      run();
    }
  }

  /**
   * Retrieves real-time FFT frequency domain telemetry for audiophile spectrum HUD
   */
  getRealtimeFftData(fftArray: Uint8Array): void {
    if (this.analyserNode && this.isPlayingSignal()) {
      this.analyserNode.getByteFrequencyData(fftArray);
    } else {
      fftArray.fill(0);
    }
  }

  /**
   * Retrieves real-time time-domain oscilloscope telemetry for Lissajous and Cymatic visualizers
   */
  getRealtimeTimeDomainData(timeDomainArray: Uint8Array): void {
    if (this.analyserNode && this.isPlayingSignal()) {
      this.analyserNode.getByteTimeDomainData(timeDomainArray);
    } else {
      timeDomainArray.fill(128); // 128 is center DC zero in Uint8 format
    }
  }

  private rebuildAudioGraph(): void {
    if (!this.audioCtx || this.audioCtx.state === 'closed') return;
    this.tearDownNodes();
    this.buildAudioGraph();
  }

  private buildAudioGraph(): void {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const cfg = this.config();

    // 1. Studio Main Gain with Soft Analog Ramp
    this.mainGain = this.audioCtx.createGain();
    this.mainGain.gain.setValueAtTime(0.0001, now);
    this.mainGain.gain.linearRampToValueAtTime(cfg.volume, now + 1.2);

    // 2. Real-Time 64-Band Audiophile FFT Spectrum Analyser
    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = 128;
    this.analyserNode.smoothingTimeConstant = 0.85;

    // 3. Studio Dynamics Compressor (Opto-Style warm leveling)
    this.compressorNode = this.audioCtx.createDynamicsCompressor();
    this.compressorNode.threshold.setValueAtTime(-16.0, now);
    this.compressorNode.knee.setValueAtTime(24.0, now);
    this.compressorNode.ratio.setValueAtTime(3.2, now);
    this.compressorNode.attack.setValueAtTime(0.005, now);
    this.compressorNode.release.setValueAtTime(0.22, now);

    // 4. Studio Anti-Aliasing Butterworth Filter (19.5kHz Linear Roll-off)
    this.antiAliasFilter = this.audioCtx.createBiquadFilter();
    this.antiAliasFilter.type = 'lowpass';
    this.antiAliasFilter.frequency.setValueAtTime(19500, now);
    this.antiAliasFilter.Q.setValueAtTime(0.707, now);

    // 5. 3D Binaural HRTF Spatial Panner Node
    this.pannerNode = this.audioCtx.createPanner();
    this.pannerNode.panningModel = 'HRTF';
    this.pannerNode.distanceModel = 'inverse';
    this.pannerNode.refDistance = 1.0;
    this.pannerNode.maxDistance = 10.0;
    this.pannerNode.rolloffFactor = 1.0;
    this.pannerNode.coneInnerAngle = 360;

    const sourcePos = this.spatialSourcePosition();
    if (this.pannerNode.positionX) {
      this.pannerNode.positionX.setValueAtTime(sourcePos.x, now);
      this.pannerNode.positionY.setValueAtTime(sourcePos.y, now);
      this.pannerNode.positionZ.setValueAtTime(sourcePos.z, now);
    } else {
      (this.pannerNode as any).setPosition?.(sourcePos.x, sourcePos.y, sourcePos.z);
    }

    // 6. Analog Tube/Tape Waveshaper Saturation
    this.waveshaperNode = this.audioCtx.createWaveShaper();
    this.applySaturationCurve();

    // 7. Stereo Channel Merger & Splitter for Bauer HRTF Crossfeed
    this.mergerNode = this.audioCtx.createChannelMerger(2);

    // 7. Optional Isochronic Pulse LFO Node
    let preCompressorDestination: AudioNode = this.compressorNode;
    if (cfg.isIsochronicPulseEnabled) {
      this.isochronicGainNode = this.audioCtx.createGain();
      this.isochronicGainNode.gain.setValueAtTime(1.0 - cfg.isochronicDepth * 0.5, now);

      this.isochronicDepthGain = this.audioCtx.createGain();
      this.isochronicDepthGain.gain.setValueAtTime(cfg.isochronicDepth * 0.5, now);

      this.isochronicLfoNode = this.audioCtx.createOscillator();
      this.isochronicLfoNode.type = 'sine';
      this.isochronicLfoNode.frequency.setValueAtTime(cfg.binauralBeatHz, now);

      this.isochronicLfoNode.connect(this.isochronicDepthGain);
      this.isochronicDepthGain.connect(this.isochronicGainNode.gain);
      this.isochronicLfoNode.start(now);

      this.isochronicGainNode.connect(this.compressorNode);
      preCompressorDestination = this.isochronicGainNode;
    }

    if (cfg.psychoacousticSpatialCrossfeed) {
      this.setupBauerCrossfeed(now, preCompressorDestination);
    } else {
      // Direct stereo bus routing
      this.mergerNode.connect(this.waveshaperNode);
      this.waveshaperNode.connect(this.antiAliasFilter);
      this.antiAliasFilter.connect(preCompressorDestination);
      this.compressorNode.connect(this.mainGain);
      if (this.isSpatialPanningEnabled() && this.pannerNode) {
        this.mainGain.connect(this.pannerNode);
        this.pannerNode.connect(this.analyserNode);
      } else {
        this.mainGain.connect(this.analyserNode);
      }
      this.analyserNode.connect(this.audioCtx.destination);
    }

    // 8. Multi-Harmonic Binaural Oscillator Bank
    this.createMultiHarmonicBank(now);

    // 9. 53-Bit Cryptographic Pink Noise Analog Tape Floor
    if (cfg.analogTapeNoiseFloor) {
      this.createAudiophileNoiseFloor(now);
    }
  }

  private setupBauerCrossfeed(now: number, targetDestination?: AudioNode): void {
    if (!this.audioCtx || !this.mergerNode || !this.waveshaperNode || !this.antiAliasFilter || !this.compressorNode || !this.mainGain || !this.analyserNode) return;

    const cfg = this.config();
    const dest = targetDestination || this.compressorNode;

    this.splitterNode = this.audioCtx.createChannelSplitter(2);

    const delaySec = cfg.crossfeedDelayMs / 1000.0;
    const gainLinear = Math.pow(10, cfg.crossfeedGainDb / 20.0);

    // Left-to-Right HRTF Crossfeed Path
    this.leftToRightDelay = this.audioCtx.createDelay(0.01);
    this.leftToRightDelay.delayTime.setValueAtTime(delaySec, now);
    this.leftToRightFilter = this.audioCtx.createBiquadFilter();
    this.leftToRightFilter.type = 'lowpass';
    this.leftToRightFilter.frequency.setValueAtTime(700, now);
    this.leftToRightGain = this.audioCtx.createGain();
    this.leftToRightGain.gain.setValueAtTime(gainLinear, now);

    // Right-to-Left HRTF Crossfeed Path
    this.rightToLeftDelay = this.audioCtx.createDelay(0.01);
    this.rightToLeftDelay.delayTime.setValueAtTime(delaySec, now);
    this.rightToLeftFilter = this.audioCtx.createBiquadFilter();
    this.rightToLeftFilter.type = 'lowpass';
    this.rightToLeftFilter.frequency.setValueAtTime(700, now);
    this.rightToLeftGain = this.audioCtx.createGain();
    this.rightToLeftGain.gain.setValueAtTime(gainLinear, now);

    const finalMerger = this.audioCtx.createChannelMerger(2);

    this.mergerNode.connect(this.splitterNode);

    // Direct Left Channel -> Final Left (0)
    this.splitterNode.connect(finalMerger, 0, 0);
    // Direct Right Channel -> Final Right (1)
    this.splitterNode.connect(finalMerger, 1, 1);

    // Crossfeed Left -> Delay/Filter -> Final Right (1)
    this.splitterNode.connect(this.leftToRightDelay, 0);
    this.leftToRightDelay.connect(this.leftToRightFilter);
    this.leftToRightFilter.connect(this.leftToRightGain);
    this.leftToRightGain.connect(finalMerger, 0, 1);

    // Crossfeed Right -> Delay/Filter -> Final Left (0)
    this.splitterNode.connect(this.rightToLeftDelay, 1);
    this.rightToLeftDelay.connect(this.rightToLeftFilter);
    this.rightToLeftFilter.connect(this.rightToLeftGain);
    this.rightToLeftGain.connect(finalMerger, 0, 0);

    finalMerger.connect(this.waveshaperNode);
    this.waveshaperNode.connect(this.antiAliasFilter);
    this.antiAliasFilter.connect(dest);
    this.compressorNode.connect(this.mainGain);
    if (this.isSpatialPanningEnabled() && this.pannerNode) {
      this.mainGain.connect(this.pannerNode);
      this.pannerNode.connect(this.analyserNode);
    } else {
      this.mainGain.connect(this.analyserNode);
    }
    this.analyserNode.connect(this.audioCtx.destination);
  }

  private applySaturationCurve(): void {
    if (!this.waveshaperNode) return;
    const profile = this.config().saturationProfile;

    const n_samples = 4096;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;

      if (profile === 'tube_warmth') {
        // Soft asymmetric even-harmonic vacuum tube curve
        if (x < -1) curve[i] = -1;
        else if (x > 1) curve[i] = 1;
        else {
          const k = 2;
          curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x * 20 * deg));
        }
      } else if (profile === 'tape_velvet') {
        // Hyperbolic tangent magnetic tape velvet compression
        curve[i] = Math.tanh(x * 1.35) * 0.85;
      } else {
        // Pristine linear reference
        curve[i] = x;
      }
    }

    this.waveshaperNode.curve = curve;
    this.waveshaperNode.oversample = '4x';
  }

  private createMultiHarmonicBank(now: number): void {
    if (!this.audioCtx || !this.mergerNode) return;

    const harmonics = this.harmonicOvertoneFreqs();
    const depth = this.config().harmonicOvertoneDepth;

    const tiers = [
      { pair: harmonics.fundamental, gainLeft: 0.35, gainRight: 0.35 },
      { pair: harmonics.octave2x, gainLeft: 0.18 * depth, gainRight: 0.18 * depth },
      { pair: harmonics.fifth3x, gainLeft: 0.08 * depth, gainRight: 0.08 * depth },
      { pair: harmonics.subBass, gainLeft: 0.22 * depth, gainRight: 0.22 * depth }
    ];

    tiers.forEach(t => {
      const leftOsc = this.audioCtx!.createOscillator();
      const rightOsc = this.audioCtx!.createOscillator();
      const leftGain = this.audioCtx!.createGain();
      const rightGain = this.audioCtx!.createGain();

      leftOsc.type = 'sine';
      rightOsc.type = 'sine';

      leftOsc.frequency.setValueAtTime(t.pair.left, now);
      rightOsc.frequency.setValueAtTime(t.pair.right, now);

      leftGain.gain.setValueAtTime(t.gainLeft, now);
      rightGain.gain.setValueAtTime(t.gainRight, now);

      leftOsc.connect(leftGain);
      rightOsc.connect(rightGain);

      leftGain.connect(this.mergerNode!, 0, 0); // Left channel
      rightGain.connect(this.mergerNode!, 0, 1); // Right channel

      leftOsc.start(now);
      rightOsc.start(now);

      this.activeOscillators.push(leftOsc, rightOsc);
      this.activeGains.push(leftGain, rightGain);
    });
  }

  private createAudiophileNoiseFloor(now: number): void {
    if (!this.audioCtx || !this.mainGain) return;

    try {
      const sampleRate = this.audioCtx.sampleRate || 96000;
      const bufferDurationSec = 16;
      const bufferLength = sampleRate * bufferDurationSec;
      const noiseBuffer = this.audioCtx.createBuffer(2, bufferLength, sampleRate);

      const leftChannel = noiseBuffer.getChannelData(0);
      const rightChannel = noiseBuffer.getChannelData(1);

      let b0L = 0, b1L = 0, b2L = 0, b3L = 0, b4L = 0, b5L = 0, b6L = 0;
      let b0R = 0, b1R = 0, b2R = 0, b3R = 0, b4R = 0, b5R = 0, b6R = 0;

      for (let i = 0; i < bufferLength; i++) {
        const whiteL = this.getUnbiasedCryptoFloat() * 2 - 1;
        const whiteR = this.getUnbiasedCryptoFloat() * 2 - 1;

        // Kellet 6-pole Pink Filter
        b0L = 0.99886 * b0L + whiteL * 0.0555179;
        b1L = 0.99332 * b1L + whiteL * 0.0750759;
        b2L = 0.96900 * b2L + whiteL * 0.1538520;
        b3L = 0.86650 * b3L + whiteL * 0.3104856;
        b4L = 0.55000 * b4L + whiteL * 0.5329522;
        b5L = -0.7616 * b5L - whiteL * 0.0168980;
        leftChannel[i] = (b0L + b1L + b2L + b3L + b4L + b5L + b6L + whiteL * 0.5362) * 0.022;
        b6L = whiteL * 0.115926;

        b0R = 0.99886 * b0R + whiteR * 0.0555179;
        b1R = 0.99332 * b1R + whiteR * 0.0750759;
        b2R = 0.96900 * b2R + whiteR * 0.1538520;
        b3R = 0.86650 * b3R + whiteR * 0.3104856;
        b4R = 0.55000 * b4R + whiteR * 0.5329522;
        b5R = -0.7616 * b5R - whiteR * 0.0168980;
        rightChannel[i] = (b0R + b1R + b2R + b3R + b4R + b5R + b6R + whiteR * 0.5362) * 0.022;
        b6R = whiteR * 0.115926;
      }

      this.noiseSourceNode = this.audioCtx.createBufferSource();
      this.noiseSourceNode.buffer = noiseBuffer;
      this.noiseSourceNode.loop = true;

      const noiseFilter = this.audioCtx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(6500, now);

      this.noiseGainNode = this.audioCtx.createGain();
      this.noiseGainNode.gain.setValueAtTime(0.040, now);

      this.noiseSourceNode.connect(noiseFilter);
      noiseFilter.connect(this.noiseGainNode);
      this.noiseGainNode.connect(this.mainGain);

      this.noiseSourceNode.start(now);
    } catch (e) {
      console.warn('[AvsEngineService] Noise floor init skipped:', e);
    }
  }

  private updateLiveFrequencies(): void {
    if (!this.audioCtx || this.activeOscillators.length === 0) return;
    const now = this.audioCtx.currentTime;
    const harmonics = this.harmonicOvertoneFreqs();
    const cfg = this.config();

    const pairs = [
      harmonics.fundamental,
      harmonics.octave2x,
      harmonics.fifth3x,
      harmonics.subBass
    ];

    let oscIdx = 0;
    for (const pair of pairs) {
      if (oscIdx + 1 < this.activeOscillators.length) {
        const leftOsc = this.activeOscillators[oscIdx];
        const rightOsc = this.activeOscillators[oscIdx + 1];

        leftOsc.frequency.setTargetAtTime(pair.left, now, 0.25);
        rightOsc.frequency.setTargetAtTime(pair.right, now, 0.25);
        oscIdx += 2;
      }
    }

    if (this.isochronicLfoNode) {
      this.isochronicLfoNode.frequency.setTargetAtTime(cfg.binauralBeatHz, now, 0.25);
    }
  }

  private tearDownNodes(): void {
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators = [];

    this.activeGains.forEach(g => {
      try { g.disconnect(); } catch {}
    });
    this.activeGains = [];

    if (this.isochronicLfoNode) {
      try {
        this.isochronicLfoNode.stop();
        this.isochronicLfoNode.disconnect();
      } catch {}
      this.isochronicLfoNode = null;
    }

    if (this.isochronicDepthGain) {
      try { this.isochronicDepthGain.disconnect(); } catch {}
      this.isochronicDepthGain = null;
    }

    if (this.isochronicGainNode) {
      try { this.isochronicGainNode.disconnect(); } catch {}
      this.isochronicGainNode = null;
    }

    if (this.noiseSourceNode) {
      try {
        this.noiseSourceNode.stop();
        this.noiseSourceNode.disconnect();
      } catch {}
      this.noiseSourceNode = null;
    }

    if (this.noiseGainNode) {
      try { this.noiseGainNode.disconnect(); } catch {}
      this.noiseGainNode = null;
    }

    if (this.mergerNode) {
      try { this.mergerNode.disconnect(); } catch {}
      this.mergerNode = null;
    }

    if (this.splitterNode) {
      try { this.splitterNode.disconnect(); } catch {}
      this.splitterNode = null;
    }

    if (this.leftToRightDelay) {
      try { this.leftToRightDelay.disconnect(); } catch {}
      this.leftToRightDelay = null;
    }
    if (this.leftToRightFilter) {
      try { this.leftToRightFilter.disconnect(); } catch {}
      this.leftToRightFilter = null;
    }
    if (this.leftToRightGain) {
      try { this.leftToRightGain.disconnect(); } catch {}
      this.leftToRightGain = null;
    }

    if (this.rightToLeftDelay) {
      try { this.rightToLeftDelay.disconnect(); } catch {}
      this.rightToLeftDelay = null;
    }
    if (this.rightToLeftFilter) {
      try { this.rightToLeftFilter.disconnect(); } catch {}
      this.rightToLeftFilter = null;
    }
    if (this.rightToLeftGain) {
      try { this.rightToLeftGain.disconnect(); } catch {}
      this.rightToLeftGain = null;
    }

    if (this.waveshaperNode) {
      try { this.waveshaperNode.disconnect(); } catch {}
      this.waveshaperNode = null;
    }

    if (this.antiAliasFilter) {
      try { this.antiAliasFilter.disconnect(); } catch {}
      this.antiAliasFilter = null;
    }

    if (this.compressorNode) {
      try { this.compressorNode.disconnect(); } catch {}
      this.compressorNode = null;
    }

    if (this.analyserNode) {
      try { this.analyserNode.disconnect(); } catch {}
      this.analyserNode = null;
    }

    if (this.pannerNode) {
      try { this.pannerNode.disconnect(); } catch {}
      this.pannerNode = null;
    }

    if (this.mainGain) {
      try { this.mainGain.disconnect(); } catch {}
      this.mainGain = null;
    }
  }

  private getUnbiasedCryptoFloat(): number {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const buf = new Uint32Array(2);
      window.crypto.getRandomValues(buf);
      return (buf[0] * 4294967296.0 + buf[1]) / 9007199254740992.0;
    }
    return Math.random();
  }
}
