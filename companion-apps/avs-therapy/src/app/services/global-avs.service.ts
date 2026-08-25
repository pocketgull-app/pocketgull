import {
  Injectable,
  inject,
  effect,
  untracked,
  PLATFORM_ID,
  NgZone,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PatientStateService } from './patient-state.service';
import { AvsUiService } from './avs-ui.service';

/**
 * GlobalAvsService — Unified AVS Engine v1.1
 *
 * Single owner of:
 *  - Web Audio API context and binaural/noise graph
 *  - requestAnimationFrame loop → drives --avs-breath-phase CSS var
 *  - body.avs-active + data-avs-wave → all CSS animations cascade
 *  - Breath duration token → --avs-breath-duration
 *
 * Consumes PatientStateService signals as the single source of truth.
 * All components receive AVS state purely through CSS — no per-component
 * changes required.
 */
@Injectable({ providedIn: 'root' })
export class GlobalAvsService {
  private readonly state = inject(PatientStateService);
  private readonly avsUi = inject(AvsUiService);
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // ── CPR Metronome ──────────────────────────────────────────────
  private cprIntervalId: any = null;
  readonly isCprMetronomeActive = signal(false);

  // ── Audio graph nodes ──────────────────────────────────────────
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private leftOsc1: OscillatorNode | null = null;
  private rightOsc1: OscillatorNode | null = null;
  private leftOsc2: OscillatorNode | null = null;
  private rightOsc2: OscillatorNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private splitter: ChannelSplitterNode | null = null;
  private merger: ChannelMergerNode | null = null;

  // ── rAF loop state ─────────────────────────────────────────────
  private rafId: number | null = null;
  private sessionStart = 0;

  // ── Gesture gate ───────────────────────────────────────────────
  private gestureUnlocked = false;
  private readonly gestureListeners: (() => void)[] = [];

  // ── Carrier / beat frequencies per brainwave ──────────────────
  private readonly WAVE_CONFIG: Record<string, { carrier1: number; beat1: number; carrier2: number; beat2: number; noiseGain: number }> = {
    delta:    { carrier1: 432, beat1: 2.5,  carrier2: 216, beat2: 1.5,  noiseGain: 0.04 },
    theta:    { carrier1: 528, beat1: 6.0,  carrier2: 264, beat2: 4.0,  noiseGain: 0.03 },
    schumann: { carrier1: 432, beat1: 7.83, carrier2: 216, beat2: 7.83, noiseGain: 0.025 },
    alpha:    { carrier1: 432, beat1: 10.0, carrier2: 216, beat2: 7.5,  noiseGain: 0.02 },
    beta:     { carrier1: 432, beat1: 18.0, carrier2: 216, beat2: 14.0, noiseGain: 0.015 },
    gamma:    { carrier1: 432, beat1: 40.0, carrier2: 216, beat2: 30.0, noiseGain: 0.01 },
  };

  readonly activeSolfeggioHz = signal<number>(528);
  readonly isHapticsActive = signal<boolean>(false);

  constructor() {
    if (!this.isBrowser) return;

    // React to AVS session state changes
    effect(() => {
      const active = this.state.isAvsSessionActive();
      const wave = this.state.avsBrainwaveFrequency();
      const bpm = this.state.avsBreathingRate();
      const freqHz = this.state.avsBrainwaveFrequencyHz();

      untracked(() => {
        if (active) {
          if (this.leftOsc1) {
            this.updateFrequencyHz(freqHz);
          } else {
            this.activateAvsMode(wave, bpm, freqHz);
          }
        } else {
          this.deactivateAvsMode();
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════

  /** Call on first user gesture to comply with autoplay policy. */
  onUserGesture(): void {
    if (this.gestureUnlocked) return;
    this.gestureUnlocked = true;
    this.gestureListeners.forEach(fn => fn());
    this.gestureListeners.length = 0;
  }

  /** Dynamically update breathing rate during an active session. */
  updateBreathRate(bpm: number): void {
    this.setCssVar('--avs-breath-duration', `${(60 / bpm).toFixed(2)}s`);
  }

  /** Dynamically update brainwave mode during an active session. */
  updateWave(wave: string): void {
    if (!this.isBrowser) return;
    document.body.setAttribute('data-avs-wave', wave);
    const cfg = this.WAVE_CONFIG[wave];
    const freqHz = this.state.avsBrainwaveFrequencyHz();
    if (cfg && this.leftOsc1 && this.rightOsc1 && this.leftOsc2 && this.rightOsc2) {
      this.leftOsc1.frequency.exponentialRampToValueAtTime(cfg.carrier1, this.audioTime() + 2.0);
      this.rightOsc1.frequency.exponentialRampToValueAtTime(cfg.carrier1 + freqHz, this.audioTime() + 2.0);
      this.leftOsc2.frequency.exponentialRampToValueAtTime(cfg.carrier2, this.audioTime() + 2.0);
      this.rightOsc2.frequency.exponentialRampToValueAtTime(cfg.carrier2 + (freqHz * 0.66), this.audioTime() + 2.0);
    }
  }

  /** Dynamically update frequency during an active session. */
  updateFrequencyHz(freqHz: number): void {
    if (!this.isBrowser) return;
    const carrier = this.activeSolfeggioHz();
    if (this.leftOsc1 && this.rightOsc1 && this.leftOsc2 && this.rightOsc2) {
      const now = this.audioTime();
      this.leftOsc1.frequency.setTargetAtTime(carrier, now, 0.2);
      this.rightOsc1.frequency.setTargetAtTime(carrier + freqHz, now, 0.2);
      this.leftOsc2.frequency.setTargetAtTime(carrier * 0.5, now, 0.2);
      this.rightOsc2.frequency.setTargetAtTime(carrier * 0.5 + (freqHz * 0.66), now, 0.2);
    }
  }

  /** Set active Sacred Solfeggio carrier tone */
  setSolfeggioTone(hz: number): void {
    this.activeSolfeggioHz.set(hz);
    if (this.isBrowser && this.leftOsc1 && this.rightOsc1) {
      const now = this.audioTime();
      const freqHz = this.state.avsBrainwaveFrequencyHz();
      this.leftOsc1.frequency.setTargetAtTime(hz, now, 0.3);
      this.rightOsc1.frequency.setTargetAtTime(hz + freqHz, now, 0.3);
      if (this.leftOsc2 && this.rightOsc2) {
        this.leftOsc2.frequency.setTargetAtTime(hz * 0.5, now, 0.3);
        this.rightOsc2.frequency.setTargetAtTime(hz * 0.5 + (freqHz * 0.66), now, 0.3);
      }
    }
  }

  /** Toggle physical somatosensory haptics */
  toggleHaptics(forceState?: boolean): boolean {
    const next = forceState !== undefined ? forceState : !this.isHapticsActive();
    this.isHapticsActive.set(next);
    if (next) {
      this.triggerHapticPulse(45);
    }
    return next;
  }

  /** Trigger vibrotactile haptic pulse via Web Vibration or Gamepad API */
  triggerHapticPulse(durationMs: number = 40): void {
    if (!this.isBrowser || !this.isHapticsActive()) return;

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(durationMs);
      } catch {}
    }

    if (typeof navigator !== 'undefined' && navigator.getGamepads) {
      try {
        const gamepads = navigator.getGamepads();
        for (const gp of gamepads) {
          if (gp && gp.vibrationActuator && typeof gp.vibrationActuator.playEffect === 'function') {
            gp.vibrationActuator.playEffect('dual-rumble', {
              startDelay: 0,
              duration: durationMs,
              weakMagnitude: 0.5,
              strongMagnitude: 0.7
            }).catch(() => {});
          }
        }
      } catch {}
    }
  }

  // ══════════════════════════════════════════════════════════════
  // ACTIVATION
  // ══════════════════════════════════════════════════════════════

  private activateAvsMode(wave: string, bpm: number, freqHz: number): void {
    if (!this.isBrowser) return;

    // Set CSS state on body
    document.body.classList.add('avs-active');
    document.body.setAttribute('data-avs-wave', wave);
    this.setCssVar('--avs-breath-duration', `${(60 / bpm).toFixed(2)}s`);
    this.setCssVar('--avs-border-opacity', '0.35');

    // Start rAF loop (outside Angular zone for performance)
    this.sessionStart = performance.now();
    this.zone.runOutsideAngular(() => this.startRafLoop());

    // Start audio (may be gated on gesture)
    this.startAudioGraph(wave, freqHz);
  }

  private deactivateAvsMode(): void {
    if (!this.isBrowser) return;

    document.body.classList.remove('avs-active');
    document.body.removeAttribute('data-avs-wave');
    this.setCssVar('--avs-border-opacity', '0');
    this.setCssVar('--avs-breath-phase', '0');

    this.stopRafLoop();
    this.stopAudioGraph();
  }

  // ══════════════════════════════════════════════════════════════
  // requestAnimationFrame LOOP
  // Drives --avs-breath-phase (0→1) at the current BPM.
  // Running outside NgZone — no change detection overhead.
  // ══════════════════════════════════════════════════════════════

  private startRafLoop(): void {
    if (this.rafId !== null) return;

    const tick = (now: number) => {
      const bpm = this.state.avsBreathingRate();
      const cycleDurationMs = (60 / bpm) * 1000;
      const elapsed = (now - this.sessionStart) % cycleDurationMs;
      const phase = elapsed / cycleDurationMs; // 0.0 → 1.0

      this.setCssVar('--avs-breath-phase', phase.toFixed(4));
      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private stopRafLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // AUDIO GRAPH  (Web Audio API)
  // 432 Hz binaural beat + brown noise floor
  // ══════════════════════════════════════════════════════════════

  private startAudioGraph(wave: string, freqHz: number): void {
    const start = () => {
      this.buildGraph(wave, freqHz);
    };

    if (this.gestureUnlocked) {
      start();
    } else {
      this.gestureListeners.push(start);
    }
  }

  private buildGraph(wave: string, freqHz: number): void {
    this.stopAudioGraph();

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      try {
        this.ctx = new AudioContextClass({ sampleRate: 48000, latencyHint: 'playback' });
      } catch {
        this.ctx = new AudioContextClass();
      }
      const cfg = this.WAVE_CONFIG[wave] ?? this.WAVE_CONFIG['theta'];

      // Master gain (soft start)
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.20, this.ctx.currentTime + 2.5);

      // Studio Dynamics Compressor (Prevents digital clipping & warms overtones)
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-16.0, this.ctx.currentTime);
      compressor.knee.setValueAtTime(24.0, this.ctx.currentTime);
      compressor.ratio.setValueAtTime(3.2, this.ctx.currentTime);
      compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
      compressor.release.setValueAtTime(0.22, this.ctx.currentTime);

      this.masterGain.connect(compressor);
      compressor.connect(this.ctx.destination);

      // Channel Merger (Stereo Ear Separation)
      this.merger = this.ctx.createChannelMerger(2);

      // Hemi-Sync Layer 1 (Primary Carrier & Delta)
      this.leftOsc1  = this.ctx.createOscillator();
      this.rightOsc1 = this.ctx.createOscillator();
      this.leftOsc1.type  = 'sine';
      this.rightOsc1.type = 'sine';
      this.leftOsc1.frequency.value  = cfg.carrier1;
      this.rightOsc1.frequency.value = cfg.carrier1 + freqHz;

      // Hemi-Sync Layer 2 (Warm Harmonic Octave & Sub-Bass)
      this.leftOsc2  = this.ctx.createOscillator();
      this.rightOsc2 = this.ctx.createOscillator();
      this.leftOsc2.type  = 'sine';
      this.rightOsc2.type = 'sine';
      this.leftOsc2.frequency.value  = cfg.carrier2;
      this.rightOsc2.frequency.value = cfg.carrier2 + (freqHz * 0.66);

      const leftGain  = this.ctx.createGain();
      const rightGain = this.ctx.createGain();
      leftGain.gain.value  = 0.32;
      rightGain.gain.value = 0.32;

      this.leftOsc1.connect(leftGain).connect(this.merger, 0, 0);
      this.rightOsc1.connect(rightGain).connect(this.merger, 0, 1);
      
      this.leftOsc2.connect(leftGain).connect(this.merger, 0, 0);
      this.rightOsc2.connect(rightGain).connect(this.merger, 0, 1);
      
      this.merger.connect(this.masterGain);

      this.leftOsc1.start();
      this.rightOsc1.start();
      this.leftOsc2.start();
      this.rightOsc2.start();

      // Audiophile Pink noise floor (Hemi-Sync standard)
      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.value = cfg.noiseGain;
      this.noiseSource = this.createPinkNoise(this.ctx);
      this.noiseSource.connect(this.noiseGain).connect(this.masterGain);
      this.noiseSource.start();

    } catch (e) {
      console.warn('[GlobalAvsService] Audio graph failed to start:', e);
    }
  }

  private stopAudioGraph(): void {
    try {
      if (this.masterGain) {
        this.masterGain.gain.linearRampToValueAtTime(0, (this.ctx?.currentTime ?? 0) + 1.2);
      }
      setTimeout(() => {
        [this.leftOsc1, this.rightOsc1, this.leftOsc2, this.rightOsc2, this.noiseSource].forEach(node => {
          try { node?.stop(); } catch { /* already stopped */ }
        });
        this.ctx?.close();
        this.ctx = null;
        this.leftOsc1 = this.rightOsc1 = this.leftOsc2 = this.rightOsc2 = this.noiseSource = null;
        this.masterGain = this.noiseGain = null;
        this.splitter = this.merger = null;
      }, 1300);
    } catch { /* ignore */ }
  }

  /**
   * Synthesizes a 16-second seamless high-resolution pink noise buffer.
   * 1/f spectral density sounds warm, balanced, and analog-mastered.
   */
  private createPinkNoise(ctx: AudioContext): AudioBufferSourceNode {
    const sampleRate = ctx.sampleRate || 48000;
    const bufferSize = sampleRate * 16; // 16s non-repetitive loop
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      let white = Math.random() * 2 - 1;
      if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
        const buf = new Uint32Array(2);
        window.crypto.getRandomValues(buf);
        white = ((buf[0] * 4294967296.0 + buf[1]) / 9007199254740992.0) * 2.0 - 1.0;
      }

      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }
    const node = ctx.createBufferSource();
    node.buffer = buffer;
    node.loop = true;
    return node;
  }

  // ══════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════

  private setCssVar(name: string, value: string): void {
    document.documentElement.style.setProperty(name, value);
  }

  private audioTime(): number {
    return this.ctx?.currentTime ?? 0;
  }

  // ── CPR Metronome Implementation ───────────────────────────────
  startCprMetronome(): void {
    if (!this.isBrowser) return;
    if (this.cprIntervalId) return;

    this.isCprMetronomeActive.set(true);
    const intervalMs = 60000 / 110; // ~545.45 ms

    // Trigger immediately on start
    this.playCprClick();

    this.cprIntervalId = setInterval(() => {
      this.playCprClick();
    }, intervalMs);
  }

  stopCprMetronome(): void {
    if (this.cprIntervalId) {
      clearInterval(this.cprIntervalId);
      this.cprIntervalId = null;
    }
    this.isCprMetronomeActive.set(false);
    if (this.isBrowser) {
      document.body.classList.remove('cpr-flash');
    }
  }

  playCprClick(): void {
    if (!this.isBrowser) return;

    // Trigger visual flash
    document.body.classList.add('cpr-flash');
    setTimeout(() => {
      document.body.classList.remove('cpr-flash');
    }, 100);

    // Audio click
    try {
      if (!this.ctx || this.ctx.state === 'closed') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {
      console.warn('[GlobalAvsService] CPR audio click failed:', e);
    }
  }
}
