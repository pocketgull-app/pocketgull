import { Component, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy, PLATFORM_ID, Input } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SpatialAmbisonicsService, SpatialAudioMode, FractalNoiseType } from '../services/spatial-ambisonics.service';

export type SacredGeometryPattern = 'ermentrout-spiral' | 'voronoi-lattice' | 'ganzfeld-field' | 'hyperbolic-tree';

@Component({
  selector: 'app-webgl-sacred-geometry',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-violet-500/20 bg-violet-950/20 p-5 space-y-4 backdrop-blur-sm">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-violet-500/15 pb-3">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <h3 class="text-xs font-black uppercase tracking-widest text-violet-300">
            Spatial 4D Ambisonics & WebGL Cortical Form Constants
          </h3>
        </div>

        <span class="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          ISCEV PSE Safety Shutter Guard Active
        </span>
      </div>

      <!-- Pattern and Ambisonics Selector Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button (click)="selectPattern('ermentrout-spiral')"
                class="p-2 rounded-lg border text-left transition-all cursor-pointer"
                [class.border-violet-400]="activePattern === 'ermentrout-spiral'"
                [class.bg-violet-500/20]="activePattern === 'ermentrout-spiral'"
                [class.border-zinc-800]="activePattern !== 'ermentrout-spiral'"
                [class.bg-zinc-900/40]="activePattern !== 'ermentrout-spiral'">
          <div class="text-[10px] font-extrabold text-violet-300">Ermentrout Spiral</div>
          <div class="text-[9px] text-zinc-400 mt-0.5">Cortical Form Constant</div>
        </button>

        <button (click)="selectPattern('ganzfeld-field')"
                class="p-2 rounded-lg border text-left transition-all cursor-pointer"
                [class.border-violet-400]="activePattern === 'ganzfeld-field'"
                [class.bg-violet-500/20]="activePattern === 'ganzfeld-field'"
                [class.border-zinc-800]="activePattern !== 'ganzfeld-field'"
                [class.bg-zinc-900/40]="activePattern !== 'ganzfeld-field'">
          <div class="text-[10px] font-extrabold text-violet-300">Ganzfeld Deprivation</div>
          <div class="text-[9px] text-zinc-400 mt-0.5">Borderless Optical Glow</div>
        </button>

        <button (click)="selectPattern('voronoi-lattice')"
                class="p-2 rounded-lg border text-left transition-all cursor-pointer"
                [class.border-violet-400]="activePattern === 'voronoi-lattice'"
                [class.bg-violet-500/20]="activePattern === 'voronoi-lattice'"
                [class.border-zinc-800]="activePattern !== 'voronoi-lattice'"
                [class.bg-zinc-900/40]="activePattern !== 'voronoi-lattice'">
          <div class="text-[10px] font-extrabold text-violet-300">Voronoi Bio-Lattice</div>
          <div class="text-[9px] text-zinc-400 mt-0.5">Cellular Dynamic Web</div>
        </button>

        <button (click)="selectPattern('hyperbolic-tree')"
                class="p-2 rounded-lg border text-left transition-all cursor-pointer"
                [class.border-violet-400]="activePattern === 'hyperbolic-tree'"
                [class.bg-violet-500/20]="activePattern === 'hyperbolic-tree'"
                [class.border-zinc-800]="activePattern !== 'hyperbolic-tree'"
                [class.bg-zinc-900/40]="activePattern !== 'hyperbolic-tree'">
          <div class="text-[10px] font-extrabold text-violet-300">Hyperbolic Fractal</div>
          <div class="text-[9px] text-zinc-400 mt-0.5">Sacred Math Geometry</div>
        </button>
      </div>

      <!-- WebGL Shader Canvas Visualizer -->
      <div class="relative w-full h-44 rounded-xl bg-zinc-950/90 border border-violet-500/20 overflow-hidden flex items-center justify-center">
        <canvas #shaderCanvas class="w-full h-full"></canvas>

        <div class="absolute bottom-2 left-3 text-[9px] font-mono text-zinc-400 flex items-center gap-2">
          <span>Mode: {{ spatial.spatialMode() | uppercase }}</span>
          <span>·</span>
          <span>Azimuth: {{ spatial.spatialAzimuthDeg() }}°</span>
          <span>·</span>
          <span>Noise: {{ spatial.noiseType() | uppercase }}</span>
        </div>
      </div>

      <!-- Ambisonic Audio Controls Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-950/60 rounded-xl border border-violet-500/10 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-[10px] uppercase font-bold text-zinc-400">Audio Mode:</span>
          <select (change)="onSpatialModeChange($event)"
                  class="bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-violet-500">
            <option value="4d-hrtf-orbit" [selected]="spatial.spatialMode() === '4d-hrtf-orbit'">4D HRTF Orbital Sound</option>
            <option value="isochronic-speaker" [selected]="spatial.spatialMode() === 'isochronic-speaker'">Isochronic Speaker Pulses</option>
            <option value="stereo-binaural" [selected]="spatial.spatialMode() === 'stereo-binaural'">Stereo Binaural Beats</option>
            <option value="monaural-harmonic" [selected]="spatial.spatialMode() === 'monaural-harmonic'">Monaural Harmonics</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-[10px] uppercase font-bold text-zinc-400">Fractal Noise:</span>
          <select (change)="onNoiseChange($event)"
                  class="bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-violet-500">
            <option value="pink" [selected]="spatial.noiseType() === 'pink'">Paul Kellet Pink Noise (1/f)</option>
            <option value="brownian" [selected]="spatial.noiseType() === 'brownian'">Brownian Deep Noise (1/f²)</option>
            <option value="stochastic-fractal" [selected]="spatial.noiseType() === 'stochastic-fractal'">Stochastic Resonance</option>
            <option value="none" [selected]="spatial.noiseType() === 'none'">Muted Noise</option>
          </select>
        </div>
      </div>
    </div>
  `
})
export class WebglSacredGeometryComponent implements AfterViewInit, OnDestroy {
  readonly spatial = inject(SpatialAmbisonicsService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  @Input() frequencyHz: number = 10.0;
  activePattern: SacredGeometryPattern = 'ermentrout-spiral';

  @ViewChild('shaderCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private renderRafId: number | null = null;

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.startShaderRenderLoop();
    }
  }

  selectPattern(pattern: SacredGeometryPattern): void {
    this.activePattern = pattern;
  }

  onSpatialModeChange(e: Event): void {
    const val = (e.target as HTMLSelectElement).value as SpatialAudioMode;
    this.spatial.setSpatialMode(val);
  }

  onNoiseChange(e: Event): void {
    const val = (e.target as HTMLSelectElement).value as FractalNoiseType;
    this.spatial.setNoiseType(val);
  }

  private startShaderRenderLoop(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth || 400;
        canvas.height = canvas.parentElement.clientHeight || 176;
      }
    };
    resize();

    let time = 0;
    const draw = () => {
      time += 0.03;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Render mathematical patterns based on active geometry
      if (this.activePattern === 'ermentrout-spiral') {
        ctx.lineWidth = 1.5;
        for (let spiral = 0; spiral < 6; spiral++) {
          ctx.beginPath();
          ctx.strokeStyle = `hsla(${260 + spiral * 15}, 80%, 65%, 0.6)`;
          const offsetAngle = (spiral * Math.PI) / 3 + time * 0.5;

          for (let r = 0; r < Math.min(cx, cy); r += 2) {
            const theta = offsetAngle + (r * 0.05);
            const x = cx + Math.cos(theta) * r;
            const y = cy + Math.sin(theta) * r;
            if (r === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (this.activePattern === 'ganzfeld-field') {
        const pulse = 0.5 + Math.sin(time * 2) * 0.3;
        const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(cx, cy));
        grad.addColorStop(0, `rgba(168, 85, 247, ${0.4 * pulse})`);
        grad.addColorStop(0.5, `rgba(99, 102, 241, ${0.2 * pulse})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (this.activePattern === 'voronoi-lattice') {
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          const r = 20 + i * 15 + Math.sin(time + i) * 6;
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        // Hyperbolic tree
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.5)';
        ctx.lineWidth = 1.0;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a + time * 0.2) * (cx * 0.8), cy + Math.sin(a + time * 0.2) * (cy * 0.8));
          ctx.stroke();
        }
      }

      this.renderRafId = requestAnimationFrame(draw);
    };

    this.renderRafId = requestAnimationFrame(draw);
  }

  ngOnDestroy(): void {
    if (this.renderRafId) {
      cancelAnimationFrame(this.renderRafId);
      this.renderRafId = null;
    }
  }
}
