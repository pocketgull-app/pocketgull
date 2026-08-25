import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, viewChild, ElementRef, PLATFORM_ID, NgZone, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AvsEngineService, ISolfeggioTone } from '../services/avs-engine.service';
import { BleWearablesService } from '../services/hardware/ble-wearables.service';

export type CymaticsVisualizerMode = 'chladni_cymatics' | 'lissajous_phase' | 'sacred_mandala' | 'fft_spectrogram';

interface ICymaticParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  alpha: number;
  size: number;
}

@Component({
  selector: 'app-avs-cymatics-visualizer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full overflow-hidden rounded-2xl bg-zinc-950/95 border border-teal-500/30 p-4 shadow-2xl backdrop-blur-xl text-zinc-100 font-sans">
      <!-- Header HUD Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-base shadow-inner">
            🌌
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-xs font-black uppercase tracking-wider text-teal-300">
                Cymatics &amp; Chladni Sacred Geometry Visualizer
              </h3>
              @if (avsEngine?.isPlaying()) {
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  LIVE RESONANCE
                </span>
              } @else {
                <span class="px-2 py-0.5 rounded-full text-[9px] font-mono text-zinc-400 bg-zinc-800 border border-zinc-700">
                  STANDBY
                </span>
              }
            </div>
            <p class="text-[11px] text-zinc-400">
              Chladni Plate Harmonics • {{ activeCarrierHz() }}Hz Carrier • {{ activeBeatHz() }}Hz Beat
            </p>
          </div>
        </div>

        <!-- Mode Selector Pills -->
        <div class="flex flex-wrap items-center gap-1">
          <button type="button"
                  (click)="setMode('chladni_cymatics')"
                  [class]="activeMode() === 'chladni_cymatics' ? 'bg-teal-600 text-white font-bold shadow-sm' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'"
                  class="px-2.5 py-1 text-[11px] rounded-lg border border-zinc-800 transition cursor-pointer">
            ✨ Chladni Plate
          </button>
          <button type="button"
                  (click)="setMode('lissajous_phase')"
                  [class]="activeMode() === 'lissajous_phase' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'"
                  class="px-2.5 py-1 text-[11px] rounded-lg border border-zinc-800 transition cursor-pointer">
            🌀 Lissajous Phase
          </button>
          <button type="button"
                  (click)="setMode('sacred_mandala')"
                  [class]="activeMode() === 'sacred_mandala' ? 'bg-amber-600 text-white font-bold shadow-sm' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'"
                  class="px-2.5 py-1 text-[11px] rounded-lg border border-zinc-800 transition cursor-pointer">
            ☸ Sacred Mandala
          </button>
          <button type="button"
                  (click)="setMode('fft_spectrogram')"
                  [class]="activeMode() === 'fft_spectrogram' ? 'bg-cyan-600 text-white font-bold shadow-sm' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'"
                  class="px-2.5 py-1 text-[11px] rounded-lg border border-zinc-800 transition cursor-pointer">
            📊 FFT Waterfall
          </button>
        </div>
      </div>

      <!-- Main Visualizer Canvas Container -->
      <div class="relative w-full h-64 sm:h-72 mt-3 rounded-xl bg-zinc-950 border border-zinc-800/80 overflow-hidden shadow-inner flex items-center justify-center">
        <canvas #cymaticsCanvas class="w-full h-full block"></canvas>

        <!-- Live Telemetry Watermark Overlay -->
        <div class="absolute bottom-2 left-3 pointer-events-none text-[10px] font-mono text-zinc-500/80 flex items-center gap-3">
          <span>MODE: <strong class="text-zinc-300">{{ activeMode().replace('_', ' ').toUpperCase() }}</strong></span>
          <span>N/M MODES: <strong class="text-teal-400">({{ chladniModes().n }}, {{ chladniModes().m }})</strong></span>
          @if (bleWearables?.isConnected()) {
            <span>RSA RESONANCE: <strong class="text-cyan-400">{{ bleWearables?.cardiacResonanceHz() }} Hz</strong></span>
          }
        </div>

        @if (!avsEngine?.isPlaying()) {
          <div class="absolute inset-0 bg-zinc-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-2">
            <div class="text-2xl">🌿</div>
            <p class="text-xs font-semibold text-zinc-300">AVS Studio Entrainment is Inactive</p>
            <p class="text-[11px] text-zinc-500 max-w-xs">
              Launch a Solfeggio tone or Brainwave protocol to energize real-time Chladni plate nodal patterns and Lissajous phase orbits.
            </p>
            <button type="button"
                    (click)="launchQuickSession()"
                    class="mt-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-md transition cursor-pointer">
              ⚡ Start 528Hz Entrainment
            </button>
          </div>
        }
      </div>

      <!-- Footer Quick Status -->
      <div class="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-zinc-900 text-[11px] text-zinc-400">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-teal-400"></span>
          <span>Frequency Harmonic: <strong class="text-teal-300 font-mono">{{ activeCarrierHz() }} Hz</strong> ({{ activeToneName() }})</span>
        </div>
        <div class="flex items-center gap-2 font-mono text-[10px]">
          <span class="text-zinc-500">Binaural L/R:</span>
          <span class="text-emerald-400">{{ activeCarrierHz() }}Hz</span>
          <span class="text-zinc-600">/</span>
          <span class="text-cyan-400">{{ activeRightFreq() }}Hz</span>
        </div>
      </div>
    </div>
  `
})
export class AvsCymaticsVisualizerComponent implements OnInit, OnDestroy {
  public readonly avsEngine = inject(AvsEngineService, { optional: true });
  public readonly bleWearables = inject(BleWearablesService, { optional: true });
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = (() => {
    try { return inject(NgZone, { optional: true }); } catch { return null; }
  })();
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('cymaticsCanvas');
  readonly activeMode = signal<CymaticsVisualizerMode>('chladni_cymatics');

  private animationFrameId: number | null = null;
  private timeStep = 0;
  private particles: ICymaticParticle[] = [];
  private readonly fftBuffer = new Uint8Array(64);
  private readonly timeDomainBuffer = new Uint8Array(64);

  readonly activeCarrierHz = computed<number>(() => {
    return this.avsEngine?.sessionConfig().carrierFreqHz ?? 528;
  });

  readonly activeBeatHz = computed<number>(() => {
    return this.avsEngine?.sessionConfig().binauralBeatHz ?? 6;
  });

  readonly activeRightFreq = computed<number>(() => {
    return this.activeCarrierHz() + this.activeBeatHz();
  });

  readonly activeToneName = computed<string>(() => {
    const tone = this.avsEngine?.activeSolfeggioTone();
    return tone?.name ?? 'Harmonic Resonance';
  });

  readonly chladniModes = computed<{ n: number; m: number }>(() => {
    const freq = this.activeCarrierHz();
    // Modal integer pair (n, m) mapped mathematically to carrier frequencies
    switch (freq) {
      case 174: return { n: 2, m: 3 };
      case 285: return { n: 3, m: 4 };
      case 396: return { n: 4, m: 4 };
      case 417: return { n: 4, m: 5 };
      case 432: return { n: 3, m: 5 };
      case 528: return { n: 4, m: 6 };
      case 639: return { n: 5, m: 6 };
      case 741: return { n: 6, m: 7 };
      case 852: return { n: 6, m: 8 };
      case 963: return { n: 7, m: 9 };
      default: return { n: 4, m: 6 };
    }
  });

  ngOnInit(): void {
    if (this.isBrowser) {
      this.initParticles(800);
      this.startRenderLoop();
    }
  }

  ngOnDestroy(): void {
    this.stopRenderLoop();
  }

  setMode(mode: CymaticsVisualizerMode): void {
    this.activeMode.set(mode);
  }

  launchQuickSession(): void {
    if (this.avsEngine) {
      this.avsEngine.applySolfeggioTone(528);
      this.avsEngine.toggleSession(true);
    }
  }

  private initParticles(count: number): void {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        vx: 0,
        vy: 0,
        targetX: 0,
        targetY: 0,
        alpha: 0.3 + Math.random() * 0.7,
        size: 1 + Math.random() * 1.5
      });
    }
  }

  private startRenderLoop(): void {
    const render = () => {
      this.timeStep++;
      this.renderFrame();
      this.animationFrameId = requestAnimationFrame(render);
    };

    if (this.zone) {
      this.zone.runOutsideAngular(() => {
        this.animationFrameId = requestAnimationFrame(render);
      });
    } else {
      this.animationFrameId = requestAnimationFrame(render);
    }
  }

  private stopRenderLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private renderFrame(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI / Retina responsive sizing
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = Math.floor(rect.width * dpr);
    const displayHeight = Math.floor(rect.height * dpr);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    const width = canvas.width;
    const height = canvas.height;
    const isPlaying = this.avsEngine?.isPlaying() ?? false;

    // Telemetry capture
    if (this.avsEngine) {
      this.avsEngine.getRealtimeFftData(this.fftBuffer);
      this.avsEngine.getRealtimeTimeDomainData(this.timeDomainBuffer);
    }

    // Semi-transparent fade trail
    ctx.fillStyle = 'rgba(9, 9, 11, 0.28)';
    ctx.fillRect(0, 0, width, height);

    const mode = this.activeMode();
    switch (mode) {
      case 'chladni_cymatics':
        this.renderChladniPlate(ctx, width, height, isPlaying);
        break;
      case 'lissajous_phase':
        this.renderLissajousPhase(ctx, width, height, isPlaying);
        break;
      case 'sacred_mandala':
        this.renderSacredMandala(ctx, width, height, isPlaying);
        break;
      case 'fft_spectrogram':
        this.renderFftSpectrogram(ctx, width, height, isPlaying);
        break;
    }
  }

  /**
   * 1. 2D Chladni Plate Vibration Modes Simulation:
   * w(x, y) = a * sin(n * pi * x) * sin(m * pi * y) - b * sin(m * pi * x) * sin(n * pi * y)
   */
  private renderChladniPlate(ctx: CanvasRenderingContext2D, width: number, height: number, isPlaying: boolean): void {
    const modes = this.chladniModes();
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.42;

    const n = modes.n;
    const m = modes.m;
    const energy = isPlaying ? 1.0 : 0.15;
    const pulse = 1.0 + Math.sin(this.timeStep * 0.05) * 0.05;

    ctx.save();
    ctx.translate(cx, cy);

    // Outer brass plate boundary ring
    ctx.beginPath();
    ctx.arc(0, 0, radius * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Particle displacement simulation towards nodal lines
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      if (isPlaying) {
        // Evaluate Chladni nodal gradient
        const px = p.x;
        const py = p.y;
        const val = Math.sin(n * Math.PI * px) * Math.sin(m * Math.PI * py) - Math.sin(m * Math.PI * px) * Math.sin(n * Math.PI * py);

        // Force towards w(x, y) = 0
        const gradX = n * Math.PI * Math.cos(n * Math.PI * px) * Math.sin(m * Math.PI * py) - m * Math.PI * Math.cos(m * Math.PI * px) * Math.sin(n * Math.PI * py);
        const gradY = m * Math.PI * Math.sin(n * Math.PI * px) * Math.cos(m * Math.PI * py) - n * Math.PI * Math.sin(m * Math.PI * px) * Math.cos(n * Math.PI * py);

        p.vx = (p.vx - val * gradX * 0.008 * energy) * 0.92;
        p.vy = (p.vy - val * gradY * 0.008 * energy) * 0.92;

        p.x += p.vx + (Math.random() - 0.5) * 0.012;
        p.y += p.vy + (Math.random() - 0.5) * 0.012;

        // Bounded within circular plate
        const dist = Math.hypot(p.x, p.y);
        if (dist > 0.95) {
          p.x *= 0.92;
          p.y *= 0.92;
        }
      }

      const screenX = p.x * radius * pulse;
      const screenY = p.y * radius * pulse;

      ctx.beginPath();
      ctx.arc(screenX, screenY, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(45, 212, 191, ${p.alpha * (isPlaying ? 0.9 : 0.4)})`;
      ctx.shadowColor = '#2dd4bf';
      ctx.shadowBlur = isPlaying ? 6 : 2;
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * 2. Binaural Lissajous Phase Orbit:
   * x(t) = sin(f1 * t), y(t) = cos(f2 * t + deltaPhi)
   */
  private renderLissajousPhase(ctx: CanvasRenderingContext2D, width: number, height: number, isPlaying: boolean): void {
    const cx = width / 2;
    const cy = height / 2;
    const scale = Math.min(width, height) * 0.38;

    const beatHz = this.activeBeatHz();
    const rotSpeed = beatHz * 0.04;
    const deltaPhi = this.timeStep * rotSpeed;

    const modes = this.chladniModes();
    const nx = modes.n;
    const ny = modes.m;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.beginPath();
    const totalPoints = 360;
    for (let i = 0; i <= totalPoints; i++) {
      const theta = (i / totalPoints) * Math.PI * 2;
      const x = Math.sin(nx * theta + deltaPhi) * scale;
      const y = Math.cos(ny * theta) * scale;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle = isPlaying ? 'rgba(99, 102, 241, 0.85)' : 'rgba(99, 102, 241, 0.4)';
    ctx.lineWidth = isPlaying ? 2.5 : 1.5;
    ctx.shadowColor = '#818cf8';
    ctx.shadowBlur = isPlaying ? 12 : 4;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 3. Sacred Geometry Mandala Harmonics (Golden Ratio Phi):
   */
  private renderSacredMandala(ctx: CanvasRenderingContext2D, width: number, height: number, isPlaying: boolean): void {
    const cx = width / 2;
    const cy = height / 2;
    const baseRadius = Math.min(width, height) * 0.12;
    const phi = 1.6180339887;
    const petals = this.chladniModes().m * 2;
    const rot = this.timeStep * 0.01;

    ctx.save();
    ctx.translate(cx, cy);

    // Concentric Fibonacci concentric cymatic rings
    for (let r = 1; r <= 4; r++) {
      const currentRadius = baseRadius * Math.pow(phi, r * 0.5) * (1.0 + Math.sin(this.timeStep * 0.04 + r) * 0.06);

      ctx.beginPath();
      for (let p = 0; p <= petals; p++) {
        const angle = (p / petals) * Math.PI * 2 + rot * (r % 2 === 0 ? 1 : -1);
        const petalRadius = currentRadius * (1.0 + Math.sin(angle * petals * 0.5) * 0.18);
        const x = Math.cos(angle) * petalRadius;
        const y = Math.sin(angle) * petalRadius;

        if (p === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      ctx.strokeStyle = `rgba(245, 158, 11, ${0.8 - r * 0.15})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = isPlaying ? 10 : 3;
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * 4. Real-time FFT Frequency Spectrogram
   */
  private renderFftSpectrogram(ctx: CanvasRenderingContext2D, width: number, height: number, isPlaying: boolean): void {
    const barCount = this.fftBuffer.length;
    const barWidth = width / barCount;

    for (let i = 0; i < barCount; i++) {
      const val = isPlaying ? this.fftBuffer[i] : 10 + Math.sin(this.timeStep * 0.1 + i) * 8;
      const barHeight = (val / 255) * height * 0.85;
      const x = i * barWidth;
      const y = height - barHeight;

      const grad = ctx.createLinearGradient(0, height, 0, y);
      grad.addColorStop(0, 'rgba(13, 148, 136, 0.9)');
      grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.85)');
      grad.addColorStop(1, 'rgba(192, 132, 252, 0.9)');

      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, y, Math.max(1, barWidth - 2), barHeight);
    }
  }
}
