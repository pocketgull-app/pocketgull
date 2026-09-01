/**
 * @pocketgull/open-sanctuary
 * Zero-dependency HTML5 Canvas 2D Cymatics, Chladni Plate, Lissajous,
 * and 0.1 Hz Rachel Nabors Parasympathetic Pacing visualizer engine.
 */

import { ICymaticOptions, ICymaticParticle, CymaticVisualizerMode, IPacingBreathingState } from './types';
import { AvsAudioEngine } from './audio-engine';

export class CymaticsRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: ICymaticOptions;
  private audioEngine: AvsAudioEngine | null = null;

  private animationFrameId: number | null = null;
  private particles: ICymaticParticle[] = [];
  private timeStep = 0;
  private readonly fftBuffer = new Uint8Array(64);
  private readonly timeDomainBuffer = new Uint8Array(64);

  // 0.1 Hz Parasympathetic cycle: 10s (4s inhale, 6s exhale)
  private breathCycleDuration = 10.0;
  private breathTime = 0;

  constructor(canvas: HTMLCanvasElement, options?: Partial<ICymaticOptions>) {
    this.canvas = canvas;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) {
      throw new Error('[CymaticsRenderer] Failed to acquire 2D Canvas Rendering Context.');
    }
    this.ctx = ctx2d;

    this.options = {
      mode: options?.mode ?? 'chladni_cymatics',
      particleCount: options?.particleCount ?? 500,
      damping: options?.damping ?? 0.94,
      plateNodalN: options?.plateNodalN ?? 4,
      plateNodalM: options?.plateNodalM ?? 3,
      colorScheme: options?.colorScheme ?? 'teal_emerald',
      bloomEffect: options?.bloomEffect ?? true,
      ...options
    };

    this.initParticles();
  }

  public connectAudioEngine(engine: AvsAudioEngine): void {
    this.audioEngine = engine;
  }

  public setMode(mode: CymaticVisualizerMode): void {
    this.options.mode = mode;
  }

  public setPlateNodalModes(n: number, m: number): void {
    this.options.plateNodalN = Math.max(1, Math.min(12, n));
    this.options.plateNodalM = Math.max(1, Math.min(12, m));
  }

  private initParticles(): void {
    this.particles = [];
    const count = this.options.particleCount ?? 500;
    const w = this.canvas.width || 600;
    const h = this.canvas.height || 400;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        targetX: Math.random() * w,
        targetY: Math.random() * h,
        alpha: 0.3 + Math.random() * 0.7,
        size: 1.2 + Math.random() * 2.2
      });
    }
  }

  /**
   * Calculates Chladni plate vibration amplitude at normalized coordinates (u, v) in [-1, 1]
   */
  public calculateChladniVibration(u: number, v: number, n: number, m: number, a = 1.0, b = 1.0): number {
    // Standard 2D boundary equation for square plate with free edges
    const term1 = a * Math.sin(n * Math.PI * u * 0.5) * Math.sin(m * Math.PI * v * 0.5);
    const term2 = b * Math.sin(m * Math.PI * u * 0.5) * Math.sin(n * Math.PI * v * 0.5);
    return term1 - term2;
  }

  /**
   * Returns current 0.1 Hz Rachel Nabors bio-rhythmic breathing state
   */
  public getBreathingState(): IPacingBreathingState {
    const cyclePos = this.breathTime % this.breathCycleDuration;
    if (cyclePos < 4.0) {
      // 4-second inhalation expansion
      const progressPct = (cyclePos / 4.0) * 100;
      return {
        phase: 'inhale',
        progressPct,
        currentSeconds: cyclePos,
        totalCycleSeconds: this.breathCycleDuration,
        instructions: 'Gently expand diaphragm (Inhale 4s)'
      };
    } else {
      // 6-second calming parasympathetic exhalation
      const progressPct = ((cyclePos - 4.0) / 6.0) * 100;
      return {
        phase: 'exhale',
        progressPct,
        currentSeconds: cyclePos,
        totalCycleSeconds: this.breathCycleDuration,
        instructions: 'Slowly release breath & soften tension (Exhale 6s)'
      };
    }
  }

  public startAnimation(): void {
    if (this.animationFrameId !== null) return;

    let lastTimestamp = performance.now();

    const loop = (currentTimestamp: number) => {
      const deltaSec = Math.min(0.1, (currentTimestamp - lastTimestamp) / 1000.0);
      lastTimestamp = currentTimestamp;

      this.timeStep += 0.025;
      this.breathTime += deltaSec;

      this.renderFrame();
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stopAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public setStereoscopicVr(enabled: boolean): void {
    this.options.stereoscopicVrEnabled = enabled;
  }

  public renderFrame(): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (!w || !h) return;

    if (this.audioEngine) {
      this.audioEngine.getByteFrequencyData(this.fftBuffer);
      this.audioEngine.getByteTimeDomainData(this.timeDomainBuffer);
    }

    // Gentle motion blur trail
    ctx.fillStyle = 'rgba(9, 9, 11, 0.22)';
    ctx.fillRect(0, 0, w, h);

    if (this.options.stereoscopicVrEnabled) {
      const halfW = w / 2;
      const ipd = this.options.interpupillaryDistancePx ?? 4;

      // --- Left Eye Viewport (Google Cardboard Left Lens) ---
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, halfW, h);
      ctx.clip();
      ctx.translate(-ipd, 0);
      this.renderScene(halfW, h, halfW / 2, h / 2);
      ctx.restore();

      // --- Right Eye Viewport (Google Cardboard Right Lens) ---
      ctx.save();
      ctx.beginPath();
      ctx.rect(halfW, 0, halfW, h);
      ctx.clip();
      ctx.translate(halfW + ipd, 0);
      this.renderScene(halfW, h, halfW / 2, h / 2);
      ctx.restore();

      // Cardboard Center Dividing Line & Crosshairs
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.moveTo(halfW, 0);
      ctx.lineTo(halfW, h);
      ctx.stroke();
    } else {
      // Standard Monoscopic Full-Width View
      this.renderScene(w, h, w / 2, h / 2);
    }
  }

  private renderScene(w: number, h: number, cx: number, cy: number): void {
    switch (this.options.mode) {
      case 'chladni_cymatics':
        this.renderChladniPlate(w, h, cx, cy);
        break;
      case 'lissajous_phase':
        this.renderLissajousPhase(w, h, cx, cy);
        break;
      case 'sacred_mandala':
        this.renderSacredMandala(w, h, cx, cy);
        break;
      case 'fft_spectrogram':
        this.renderFftSpectrogram(w, h, cx, cy);
        break;
      case 'parasympathetic_ring':
        this.renderParasympatheticRing(w, h, cx, cy);
        break;
    }
  }

  private renderChladniPlate(w: number, h: number, cx = w / 2, cy = h / 2): void {
    const ctx = this.ctx;
    const scale = Math.min(w, h) * 0.44;

    const n = this.options.plateNodalN ?? 4;
    const m = this.options.plateNodalM ?? 3;

    // Resonant energetic baseline
    let avgAmp = 0;
    for (let i = 0; i < 16; i++) avgAmp += this.fftBuffer[i] || 0;
    avgAmp = avgAmp / 16 / 255;
    const excitation = 0.5 + avgAmp * 1.8;

    for (const p of this.particles) {
      // Convert to normalized plate coordinate [-1, 1] relative to viewport center
      const u = (p.x - w / 2) / scale;
      const v = (p.y - h / 2) / scale;

      if (Math.abs(u) > 1.05 || Math.abs(v) > 1.05) {
        p.x = w / 2 + (Math.random() - 0.5) * scale * 1.8;
        p.y = h / 2 + (Math.random() - 0.5) * scale * 1.8;
        p.vx = 0;
        p.vy = 0;
        continue;
      }

      // Compute Chladni gradient force (particles drift toward zero-vibration nodal lines)
      const vib = this.calculateChladniVibration(u, v, n, m);
      const du = (this.calculateChladniVibration(u + 0.02, v, n, m) - vib) / 0.02;
      const dv = (this.calculateChladniVibration(u, v + 0.02, n, m) - vib) / 0.02;

      // Force pushes particles down the vibration gradient toward the node
      const forceMag = Math.abs(vib) * excitation * 0.6;
      p.vx = (p.vx - Math.sign(vib) * du * forceMag * 0.8) * (this.options.damping ?? 0.94);
      p.vy = (p.vy - Math.sign(vib) * dv * forceMag * 0.8) * (this.options.damping ?? 0.94);

      // Micro Brownian jitter
      p.vx += (Math.random() - 0.5) * 0.3 * excitation;
      p.vy += (Math.random() - 0.5) * 0.3 * excitation;

      p.x += p.vx;
      p.y += p.vy;

      // Draw glowing particle
      const nearNode = Math.max(0, 1.0 - Math.abs(vib) * 2.0);
      const alpha = Math.min(1.0, 0.2 + nearNode * 0.8);

      const drawX = cx + (p.x - w / 2);
      const drawY = cy + (p.y - h / 2);

      ctx.beginPath();
      ctx.arc(drawX, drawY, p.size * (1.0 + nearNode * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = nearNode > 0.6 ? `rgba(45, 212, 191, ${alpha})` : `rgba(13, 148, 136, ${alpha * 0.4})`;
      ctx.fill();
    }
  }

  private renderLissajousPhase(w: number, h: number, cx = w / 2, cy = h / 2): void {
    const ctx = this.ctx;
    const radius = Math.min(w, h) * 0.38;

    const carrier = this.audioEngine?.config.carrierFreqHz ?? 528;
    const beat = this.audioEngine?.config.beatFreqHz ?? 7.83;
    const ratioA = 3;
    const ratioB = Math.max(1, Math.round((carrier + beat) / (carrier / 3)));
    const delta = this.timeStep * (beat * 0.3);

    ctx.beginPath();
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 2.0;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#2dd4bf';

    const points = 360;
    for (let i = 0; i <= points; i++) {
      const theta = (i / points) * Math.PI * 2;
      const x = cx + radius * Math.sin(ratioA * theta + delta);
      const y = cy + radius * Math.sin(ratioB * theta);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  private renderSacredMandala(w: number, h: number, cx = w / 2, cy = h / 2): void {
    const ctx = this.ctx;
    const baseRadius = Math.min(w, h) * 0.35;

    const petals = 8;
    const phi = 1.6180339887;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.timeStep * 0.15);

    for (let layer = 1; layer <= 3; layer++) {
      const r = (baseRadius / (layer * 0.9)) * (1 + Math.sin(this.timeStep * layer) * 0.06);
      ctx.beginPath();
      ctx.strokeStyle = layer === 1 ? '#f59e0b' : layer === 2 ? '#10b981' : '#6366f1';
      ctx.lineWidth = 1.6;

      for (let i = 0; i <= petals; i++) {
        const angle = (i / petals) * Math.PI * 2;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        const cpX = (r * phi * 0.6) * Math.cos(angle + Math.PI / petals);
        const cpY = (r * phi * 0.6) * Math.sin(angle + Math.PI / petals);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.quadraticCurveTo(cpX, cpY, x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderFftSpectrogram(w: number, h: number, cx = w / 2, cy = h / 2): void {
    const ctx = this.ctx;
    const barWidth = (w / this.fftBuffer.length) * 0.9;
    const startX = cx - w / 2;

    for (let i = 0; i < this.fftBuffer.length; i++) {
      const val = this.fftBuffer[i] / 255.0;
      const barHeight = val * h * 0.75;
      const x = startX + i * (barWidth + 2);
      const y = h - barHeight;

      const grad = ctx.createLinearGradient(0, y, 0, h);
      grad.addColorStop(0, '#2dd4bf');
      grad.addColorStop(1, '#0f766e');

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }

  private renderParasympatheticRing(w: number, h: number, cx = w / 2, cy = h / 2): void {
    const ctx = this.ctx;
    const state = this.getBreathingState();

    // 0.1 Hz breathing radius: 4s inhale expands to 1.3x, 6s exhale contracts smoothly
    const baseR = Math.min(w, h) * 0.22;
    const scale = state.phase === 'inhale'
      ? 1.0 + (state.progressPct / 100) * 0.4
      : 1.4 - (state.progressPct / 100) * 0.4;

    const currentR = baseR * scale;

    // Glowing Expansion Ring
    ctx.beginPath();
    ctx.arc(cx, cy, currentR, 0, Math.PI * 2);
    ctx.strokeStyle = state.phase === 'inhale' ? '#38bdf8' : '#34d399';
    ctx.lineWidth = 3.5;
    ctx.shadowBlur = 24;
    ctx.shadowColor = state.phase === 'inhale' ? '#38bdf8' : '#34d399';
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Text Instructions in the center
    ctx.fillStyle = '#f4f4f5';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.phase === 'inhale' ? 'INHALE' : 'EXHALE', cx, cy - 8);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '10px monospace';
    ctx.fillText(`${state.currentSeconds.toFixed(1)}s / ${this.breathCycleDuration}s (0.1 Hz)`, cx, cy + 12);
  }
}
