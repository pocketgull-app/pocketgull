import { Injectable, signal, computed, inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type SpatialAudioMode = 'stereo-binaural' | 'isochronic-speaker' | 'monaural-harmonic' | '4d-hrtf-orbit';
export type FractalNoiseType = 'none' | 'pink' | 'brownian' | 'stochastic-fractal';

@Injectable({
  providedIn: 'root'
})
export class SpatialAmbisonicsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Audio Graph State Signals
  readonly spatialMode = signal<SpatialAudioMode>('4d-hrtf-orbit');
  readonly noiseType = signal<FractalNoiseType>('pink');
  readonly noiseVolume = signal<number>(0.15); // 0.0 - 1.0
  readonly isochronicDutyCycle = signal<number>(0.5); // 0.1 - 0.9 square/sine pulse width
  
  // Real-time 4D Orbital Panning Coordinates (driven in 3D audio space)
  readonly spatialAzimuthDeg = signal<number>(0);
  readonly spatialElevationDeg = signal<number>(15);
  readonly orbitalSpeedHz = signal<number>(0.1); // Dynamic orbital revolution speed

  // Web Audio Context & Nodes
  private audioCtx: AudioContext | null = null;
  private pannerNode: PannerNode | null = null;
  private isochronicGainNode: GainNode | null = null;
  private noiseSourceNode: AudioBufferSourceNode | null = null;
  private noiseGainNode: GainNode | null = null;
  private orbitalRafId: number | null = null;

  constructor() {}

  setSpatialMode(mode: SpatialAudioMode): void {
    this.spatialMode.set(mode);
  }

  setNoiseType(type: FractalNoiseType): void {
    this.noiseType.set(type);
    this.updateNoiseGraph();
  }

  setNoiseVolume(volume: number): void {
    this.noiseVolume.set(Math.max(0, Math.min(1, volume)));
    if (this.noiseGainNode && this.audioCtx) {
      this.noiseGainNode.gain.setValueAtTime(this.noiseVolume(), this.audioCtx.currentTime);
    }
  }

  setIsochronicDutyCycle(cycle: number): void {
    this.isochronicDutyCycle.set(Math.max(0.1, Math.min(0.9, cycle)));
  }

  initAudioGraph(ctx: AudioContext, masterNode: AudioNode): void {
    if (!this.isBrowser || !ctx) return;
    this.audioCtx = ctx;

    try {
      // Create 3D HRTF Panner
      if ('createPanner' in ctx) {
        this.pannerNode = ctx.createPanner();
        this.pannerNode.panningModel = 'HRTF';
        this.pannerNode.distanceModel = 'inverse';
        this.pannerNode.refDistance = 1;
        this.pannerNode.maxDistance = 10000;
        this.pannerNode.rolloffFactor = 1;
        this.pannerNode.coneInnerAngle = 360;
        this.pannerNode.connect(masterNode);
      }

      // Create Isochronic Gain Node for speaker modulation
      this.isochronicGainNode = ctx.createGain();
      this.isochronicGainNode.gain.setValueAtTime(1.0, ctx.currentTime);
      if (this.pannerNode) {
        this.isochronicGainNode.connect(this.pannerNode);
      } else {
        this.isochronicGainNode.connect(masterNode);
      }

      // Create Noise Generator
      this.noiseGainNode = ctx.createGain();
      this.noiseGainNode.gain.setValueAtTime(this.noiseVolume(), ctx.currentTime);
      this.noiseGainNode.connect(masterNode);

      this.updateNoiseGraph();
      this.startOrbitalPanningLoop();
    } catch (e) {
      console.debug('[Ambisonics] Spatial audio graph initialization notice:', e);
    }
  }

  private updateNoiseGraph(): void {
    if (!this.isBrowser || !this.audioCtx || !this.noiseGainNode) return;

    if (this.noiseSourceNode) {
      try {
        this.noiseSourceNode.stop();
        this.noiseSourceNode.disconnect();
      } catch { /* ignore */ }
      this.noiseSourceNode = null;
    }

    const type = this.noiseType();
    if (type === 'none') return;

    const bufferSize = this.audioCtx.sampleRate * 2; // 2 seconds loop
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      if (type === 'pink') {
        // Paul Kellet's refined 1/f Pink Noise Filter
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else if (type === 'brownian') {
        // 1/f^2 Brownian/Brown Noise (Integration of white noise)
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain compensation
      } else {
        // Stochastic Fractal Noise
        output[i] = (white * Math.sin(i * 0.001) + Math.cos(i * 0.0003) * 0.5) * 0.2;
      }
    }

    this.noiseSourceNode = this.audioCtx.createBufferSource();
    this.noiseSourceNode.buffer = noiseBuffer;
    this.noiseSourceNode.loop = true;
    this.noiseSourceNode.connect(this.noiseGainNode);
    this.noiseSourceNode.start();
  }

  private startOrbitalPanningLoop(): void {
    if (!this.isBrowser) return;

    const tick = () => {
      if (this.spatialMode() === '4d-hrtf-orbit' && this.pannerNode && this.audioCtx) {
        const time = this.audioCtx.currentTime;
        const speed = this.orbitalSpeedHz();
        const angle = time * speed * Math.PI * 2;
        
        const x = Math.cos(angle) * 3;
        const y = Math.sin(angle * 0.5) * 0.8;
        const z = Math.sin(angle) * 3;

        if (this.pannerNode.positionX) {
          this.pannerNode.positionX.setValueAtTime(x, time);
          this.pannerNode.positionY.setValueAtTime(y, time);
          this.pannerNode.positionZ.setValueAtTime(z, time);
        } else {
          (this.pannerNode as any).setPosition?.(x, y, z);
        }

        const deg = Math.round(((angle * 180 / Math.PI) % 360 + 360) % 360);
        this.zone.run(() => {
          this.spatialAzimuthDeg.set(deg);
        });
      }

      this.orbitalRafId = requestAnimationFrame(tick);
    };

    this.orbitalRafId = requestAnimationFrame(tick);
  }

  stopAmbisonics(): void {
    if (this.orbitalRafId) {
      cancelAnimationFrame(this.orbitalRafId);
      this.orbitalRafId = null;
    }
    if (this.noiseSourceNode) {
      try {
        this.noiseSourceNode.stop();
        this.noiseSourceNode.disconnect();
      } catch { /* ignore */ }
      this.noiseSourceNode = null;
    }
  }
}
