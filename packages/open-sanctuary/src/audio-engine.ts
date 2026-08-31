/**
 * @pocketgull/open-sanctuary
 * Zero-dependency Web Audio API bio-entrainment synthesis engine.
 */

import { IAvsSessionConfig, AvsWaveform, NoiseProfile, AvsSaturationProfile } from './types';
import { DEFAULT_AVS_CONFIG } from './catalogs';

export class AvsAudioEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  // Binaural Oscillators
  private leftCarrierOsc: OscillatorNode | null = null;
  private rightCarrierOsc: OscillatorNode | null = null;
  private leftGain: GainNode | null = null;
  private rightGain: GainNode | null = null;
  private mergerNode: ChannelMergerNode | null = null;

  // Isochronic Modulator
  private isochronicGain: GainNode | null = null;
  private isochronicLfo: OscillatorNode | null = null;
  private isochronicLfoGain: GainNode | null = null;

  // Noise Generator
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;

  // Parasympathetic 0.1Hz Breathing LFO (Rachel Nabors Bio-Rhythmic Pacing)
  private pacingLfo: OscillatorNode | null = null;
  private pacingFilter: BiquadFilterNode | null = null;

  // Waveshaper Saturation
  private waveShaper: WaveShaperNode | null = null;

  private _isPlaying = false;
  private _config: IAvsSessionConfig = { ...DEFAULT_AVS_CONFIG };

  public onStateChange?: (isPlaying: boolean) => void;

  constructor(config?: Partial<IAvsSessionConfig>) {
    if (config) {
      this._config = { ...this._config, ...config };
    }
  }

  public get isPlaying(): boolean {
    return this._isPlaying;
  }

  public get config(): IAvsSessionConfig {
    return { ...this._config };
  }

  public get analyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  /**
   * Initializes or returns the active AudioContext safely across browsers
   */
  private getOrCreateAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    return this.audioCtx;
  }

  /**
   * Generates a smooth soft-clipping/saturation curve
   */
  private makeDistortionCurve(profile: AvsSaturationProfile): Float32Array {
    const samples = 4096;
    const curve = new Float32Array(samples);
    const k = profile === 'tube_warmth' ? 2 : profile === 'tape_velvet' ? 1.2 : 0;

    for (let i = 0; i < samples; ++i) {
      const x = (i * 2) / samples - 1;
      if (k === 0) {
        curve[i] = x;
      } else {
        curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
      }
    }
    return curve;
  }

  /**
   * Creates a procedural pink, brown, or white noise buffer
   */
  private createNoiseBuffer(ctx: AudioContext, profile: NoiseProfile): AudioBuffer {
    const bufferSize = ctx.sampleRate * 4; // 4 second loop
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let lastOutL = 0, lastOutR = 0;

    for (let i = 0; i < bufferSize; i++) {
      const whiteL = Math.random() * 2 - 1;
      const whiteR = Math.random() * 2 - 1;

      if (profile === 'pink') {
        // Paul Kellet's filtered pink noise algorithm
        b0 = 0.99886 * b0 + whiteL * 0.0555179;
        b1 = 0.99332 * b1 + whiteL * 0.0750759;
        b2 = 0.96900 * b2 + whiteL * 0.1538520;
        b3 = 0.86650 * b3 + whiteL * 0.3104856;
        b4 = 0.55000 * b4 + whiteL * 0.5329522;
        b5 = -0.7616 * b5 - whiteL * 0.0168980;
        left[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + whiteL * 0.5362) * 0.11;
        b6 = whiteL * 0.115926;

        right[i] = left[i] * 0.95 + (Math.random() * 2 - 1) * 0.05;
      } else if (profile === 'brown') {
        // Brownian / Red 1/f^2 noise
        lastOutL = (lastOutL + 0.02 * whiteL) / 1.02;
        lastOutR = (lastOutR + 0.02 * whiteR) / 1.02;
        left[i] = lastOutL * 3.5;
        right[i] = lastOutR * 3.5;
      } else if (profile === 'rain') {
        // Gentle filtered precipitation texture
        lastOutL = (lastOutL + 0.04 * whiteL) / 1.04;
        lastOutR = (lastOutR + 0.04 * whiteR) / 1.04;
        const dropletL = Math.random() > 0.996 ? (Math.random() - 0.5) * 0.8 : 0;
        const dropletR = Math.random() > 0.996 ? (Math.random() - 0.5) * 0.8 : 0;
        left[i] = lastOutL * 2.0 + dropletL;
        right[i] = lastOutR * 2.0 + dropletR;
      }
    }

    return buffer;
  }

  /**
   * Starts the AVS session with smooth audio ramping
   */
  public async start(configUpdate?: Partial<IAvsSessionConfig>): Promise<void> {
    if (configUpdate) {
      this._config = { ...this._config, ...configUpdate };
    }

    const ctx = this.getOrCreateAudioContext();
    if (!ctx) return;

    if (this._isPlaying) {
      this.stop();
    }

    const now = ctx.currentTime;

    // 1. Master Output & Limiter Chain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, this._config.volume), now + 0.4);

    this.analyserNode = ctx.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.82;

    this.waveShaper = ctx.createWaveShaper();
    this.waveShaper.curve = this.makeDistortionCurve(this._config.saturationProfile) as any;
    this.waveShaper.oversample = '2x';

    // 2. Parasympathetic 0.1Hz Bio-Rhythmic Pacing Filter (10s cycle)
    this.pacingFilter = ctx.createBiquadFilter();
    this.pacingFilter.type = 'lowpass';
    this.pacingFilter.frequency.setValueAtTime(4200, now);
    this.pacingFilter.Q.setValueAtTime(0.707, now);

    if (this._config.parasympatheticPacingEnabled) {
      // 0.1 Hz oscillation = 10-second breath cycle
      this.pacingLfo = ctx.createOscillator();
      this.pacingLfo.frequency.setValueAtTime(0.1, now);
      const pacingDepth = ctx.createGain();
      pacingDepth.gain.setValueAtTime(1400, now);
      this.pacingLfo.connect(pacingDepth);
      pacingDepth.connect(this.pacingFilter.frequency);
      this.pacingLfo.start(now);
    }

    // 3. Binaural Beat Synthesis (Left/Right Frequency Separation)
    const carrier = Math.max(20, this._config.carrierFreqHz);
    const beat = this._config.beatFreqHz;
    const oscType: OscillatorType = this._config.waveform === 'warm_harmonic' ? 'triangle' : this._config.waveform;

    this.leftCarrierOsc = ctx.createOscillator();
    this.leftCarrierOsc.type = oscType;
    this.leftCarrierOsc.frequency.setValueAtTime(carrier, now);

    this.rightCarrierOsc = ctx.createOscillator();
    this.rightCarrierOsc.type = oscType;
    this.rightCarrierOsc.frequency.setValueAtTime(this._config.binauralEnabled ? carrier + beat : carrier, now);

    this.leftGain = ctx.createGain();
    this.rightGain = ctx.createGain();
    this.leftGain.gain.setValueAtTime(0.35, now);
    this.rightGain.gain.setValueAtTime(0.35, now);

    this.mergerNode = ctx.createChannelMerger(2);
    this.leftCarrierOsc.connect(this.leftGain);
    this.rightCarrierOsc.connect(this.rightGain);

    this.leftGain.connect(this.mergerNode, 0, 0);   // Left channel
    this.rightGain.connect(this.mergerNode, 0, 1);  // Right channel

    // 4. Isochronic Pulsing (Hann / Smooth Envelope Modulator)
    this.isochronicGain = ctx.createGain();
    if (this._config.isochronicEnabled && this._config.isochronicPulseRateHz > 0) {
      this.isochronicGain.gain.setValueAtTime(0.5, now);
      this.isochronicLfo = ctx.createOscillator();
      this.isochronicLfo.type = 'sine';
      this.isochronicLfo.frequency.setValueAtTime(this._config.isochronicPulseRateHz, now);

      this.isochronicLfoGain = ctx.createGain();
      this.isochronicLfoGain.gain.setValueAtTime(0.48, now);

      this.isochronicLfo.connect(this.isochronicLfoGain);
      this.isochronicLfoGain.connect(this.isochronicGain.gain);
      this.isochronicLfo.start(now);
    } else {
      this.isochronicGain.gain.setValueAtTime(1.0, now);
    }

    this.mergerNode.connect(this.isochronicGain);

    // 5. Ambient Masking Noise Generator
    if (this._config.noiseProfile !== 'off') {
      const noiseBuf = this.createNoiseBuffer(ctx, this._config.noiseProfile);
      this.noiseSource = ctx.createBufferSource();
      this.noiseSource.buffer = noiseBuf;
      this.noiseSource.loop = true;

      this.noiseFilter = ctx.createBiquadFilter();
      this.noiseFilter.type = 'lowpass';
      this.noiseFilter.frequency.setValueAtTime(1200, now);

      this.noiseGain = ctx.createGain();
      this.noiseGain.gain.setValueAtTime(this._config.noiseVolume, now);

      this.noiseSource.connect(this.noiseFilter);
      this.noiseFilter.connect(this.noiseGain);
      this.noiseGain.connect(this.pacingFilter);

      this.noiseSource.start(now);
    }

    // 6. Connect Processing Chain -> Limiter -> Analyser -> Master -> Output
    this.isochronicGain.connect(this.pacingFilter);
    this.pacingFilter.connect(this.waveShaper);
    this.waveShaper.connect(this.analyserNode);
    this.analyserNode.connect(this.masterGain);
    this.masterGain.connect(ctx.destination);

    this.leftCarrierOsc.start(now);
    this.rightCarrierOsc.start(now);

    this._isPlaying = true;
    this.onStateChange?.(true);
  }

  /**
   * Stops the AVS session with a gentle fade-out ramp
   */
  public stop(): void {
    if (!this._isPlaying || !this.audioCtx) {
      this._isPlaying = false;
      this.onStateChange?.(false);
      return;
    }

    const now = this.audioCtx.currentTime;

    if (this.masterGain) {
      try {
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      } catch {}
    }

    setTimeout(() => {
      try {
        this.leftCarrierOsc?.stop();
        this.rightCarrierOsc?.stop();
        this.isochronicLfo?.stop();
        this.noiseSource?.stop();
        this.pacingLfo?.stop();

        this.leftCarrierOsc?.disconnect();
        this.rightCarrierOsc?.disconnect();
        this.mergerNode?.disconnect();
        this.isochronicGain?.disconnect();
        this.noiseGain?.disconnect();
        this.pacingFilter?.disconnect();
        this.waveShaper?.disconnect();
        this.analyserNode?.disconnect();
        this.masterGain?.disconnect();
      } catch {}

      this.leftCarrierOsc = null;
      this.rightCarrierOsc = null;
      this.isochronicLfo = null;
      this.noiseSource = null;
      this.pacingLfo = null;

      this._isPlaying = false;
      this.onStateChange?.(false);
    }, 180);
  }

  /**
   * Updates frequency and volume parameters on the fly without audio dropouts
   */
  public updateConfig(config: Partial<IAvsSessionConfig>): void {
    this._config = { ...this._config, ...config };

    if (!this._isPlaying || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    if (config.carrierFreqHz !== undefined && this.leftCarrierOsc) {
      this.leftCarrierOsc.frequency.setTargetAtTime(config.carrierFreqHz, now, 0.05);
      if (this.rightCarrierOsc) {
        const rightFreq = this._config.binauralEnabled ? config.carrierFreqHz + this._config.beatFreqHz : config.carrierFreqHz;
        this.rightCarrierOsc.frequency.setTargetAtTime(rightFreq, now, 0.05);
      }
    }

    if (config.beatFreqHz !== undefined && this.rightCarrierOsc && this._config.binauralEnabled) {
      this.rightCarrierOsc.frequency.setTargetAtTime(this._config.carrierFreqHz + config.beatFreqHz, now, 0.05);
    }

    if (config.volume !== undefined && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(Math.max(0.0001, config.volume), now, 0.05);
    }

    if (config.noiseVolume !== undefined && this.noiseGain) {
      this.noiseGain.gain.setTargetAtTime(Math.max(0.0001, config.noiseVolume), now, 0.05);
    }
  }

  /**
   * Reads real-time frequency data into a Uint8Array buffer
   */
  public getByteFrequencyData(buffer: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(buffer as any);
    } else {
      buffer.fill(0);
    }
  }

  /**
   * Reads real-time time-domain waveform data into a Uint8Array buffer
   */
  public getByteTimeDomainData(buffer: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteTimeDomainData(buffer as any);
    } else {
      buffer.fill(128);
    }
  }
}
