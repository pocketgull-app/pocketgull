import {
  Component,
  ElementRef,
  viewChild,
  AfterViewInit,
  OnDestroy,
  signal,
  computed,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  inject
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GullRenderEngine } from '../../rendering/gull-render.engine';
import { DirectCardiacRenderer } from '../../rendering/direct-cardiac.renderer';

export type CardiacRegime = 'normal_sinus' | 'drug_induced_long_qtc' | 'severe_torsades_de_pointes' | 'hypokalemia_arrhythmia';

@Component({
  selector: 'app-gull-cardiac-lens',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full bg-[var(--pg-bg-base,#09090b)] font-mono text-[var(--pg-text-primary,#f4f4f5)] rounded-3xl border border-[var(--pg-border-default,#272732)] overflow-hidden shadow-2xl relative mb-6">
      
      <!-- Top Clinical HUD Header -->
      <div class="flex flex-wrap items-center justify-between p-4 bg-[var(--pg-surface-1,#121217)] border-b border-[var(--pg-border-subtle,#1e1e26)] gap-3 z-20 shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-3 h-3 rounded-full bg-[var(--pg-danger,#ef4444)] shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse"></span>
          <div>
            <h3 class="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--pg-text-primary,#f4f4f5)] flex items-center gap-2">
              <span>⚡</span>
              <span>GullRender™ 3D Cardiac Electrophysiology (Zero-Three.js Core)</span>
            </h3>
            <p class="text-[11px] text-[var(--pg-text-muted,#a1a1aa)] font-sans">
              Direct WebGPU / WebGL2 • 5-Phase Action Potential (I_Na, I_Ca,L, I_Kr) • 0.1 Hz Vagal Pacing
            </p>
          </div>
        </div>

        <!-- Presets Selector Tabs -->
        <div class="flex flex-wrap items-center gap-1.5 bg-[var(--pg-surface-0,#0c0c10)] p-1 rounded-2xl border border-[var(--pg-border-default,#272732)] text-xs">
          <button type="button" (click)="setRegime('normal_sinus')"
                  [class]="regime() === 'normal_sinus' ? 'bg-[var(--pg-primary-dark,#0f766e)] text-[var(--pg-text-primary)] font-bold shadow' : 'text-[var(--pg-text-muted)] hover:text-[var(--pg-text-primary)]'"
                  class="px-3 py-1.5 rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5">
            <span>🟢</span>
            <span>Normal Sinus</span>
          </button>
          <button type="button" (click)="setRegime('drug_induced_long_qtc')"
                  [class]="regime() === 'drug_induced_long_qtc' ? 'bg-[var(--pg-warning,#f59e0b)] text-zinc-950 font-bold shadow' : 'text-[var(--pg-text-muted)] hover:text-[var(--pg-text-primary)]'"
                  class="px-3 py-1.5 rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5">
            <span>💊</span>
            <span>Long QTc (hERG)</span>
          </button>
          <button type="button" (click)="setRegime('severe_torsades_de_pointes')"
                  [class]="regime() === 'severe_torsades_de_pointes' ? 'bg-[var(--pg-danger,#ef4444)] text-[var(--pg-text-primary)] font-bold shadow' : 'text-[var(--pg-text-muted)] hover:text-[var(--pg-text-primary)]'"
                  class="px-3 py-1.5 rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5">
            <span>🚨</span>
            <span>Torsades</span>
          </button>
          <button type="button" (click)="setRegime('hypokalemia_arrhythmia')"
                  [class]="regime() === 'hypokalemia_arrhythmia' ? 'bg-[var(--pg-purple,#a855f7)] text-[var(--pg-text-primary)] font-bold shadow' : 'text-[var(--pg-text-muted)] hover:text-[var(--pg-text-primary)]'"
                  class="px-3 py-1.5 rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5">
            <span>🧪</span>
            <span>Hypokalemia EAD</span>
          </button>
        </div>
      </div>

      <!-- Main Canvas Container -->
      <div class="relative w-full h-[450px] bg-[var(--pg-bg-base,#09090b)] overflow-hidden">
        <canvas #renderCanvas class="w-full h-full cursor-grab active:cursor-grabbing block"></canvas>

        <!-- Floating Telemetry HUD (Top Left) -->
        <div class="absolute top-4 left-4 z-30 bg-[var(--pg-surface-1,#121217)]/90 backdrop-blur-md p-4 rounded-2xl border border-[var(--pg-border-subtle,#1e1e26)] text-xs space-y-2 max-w-xs shadow-2xl">
          <div class="flex items-center justify-between border-b border-[var(--pg-border-subtle,#1e1e26)] pb-1.5">
            <span class="text-[10px] uppercase font-bold text-[var(--pg-primary-light,#2dd4bf)]">Hardware Engine</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--pg-surface-3,#1f1f2a)] text-[var(--pg-primary-light)]">
              {{ engineMode() | uppercase }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              <span class="text-[var(--pg-text-muted,#a1a1aa)] text-[10px] block">Heart Rate</span>
              <span class="font-bold text-[var(--pg-text-primary)] tabular-nums">{{ heartRateBpm() }} BPM</span>
            </div>
            <div>
              <span class="text-[var(--pg-text-muted,#a1a1aa)] text-[10px] block">QTc Interval</span>
              <span class="font-bold tabular-nums" [class.text-[var(--pg-danger)]]="qtcIntervalMs() > 480" [class.text-[var(--pg-success)]]="qtcIntervalMs() <= 440">
                {{ qtcIntervalMs() }} ms
              </span>
            </div>
            <div>
              <span class="text-[var(--pg-text-muted,#a1a1aa)] text-[10px] block">Conduction</span>
              <span class="font-bold text-[var(--pg-text-primary)] tabular-nums">{{ conductionVelocity() }} m/s</span>
            </div>
            <div>
              <span class="text-[var(--pg-text-muted,#a1a1aa)] text-[10px] block">EAD Flutter</span>
              <span class="font-bold tabular-nums" [class.text-[var(--pg-danger)]]="eadInstability() > 0.4" [class.text-[var(--pg-text-muted)]]="eadInstability() === 0">
                {{ (eadInstability() * 100).toFixed(0) }}%
              </span>
            </div>
          </div>

          <div class="pt-2 border-t border-[var(--pg-border-subtle,#1e1e26)] text-[10px] text-[var(--pg-text-muted)] flex items-center justify-between">
            <span>0.1 Hz Mayer Wave</span>
            <span class="text-[var(--pg-success-light,#34d399)] font-bold">Synchronized</span>
          </div>
        </div>

        <!-- Floating Controls (Top Right) -->
        <div class="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-[var(--pg-surface-1,#121217)]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[var(--pg-border-subtle,#1e1e26)] text-xs">
          <button (click)="togglePlay()" type="button"
                  class="px-3 py-1.5 rounded-xl bg-[var(--pg-primary-bg)] text-[var(--pg-primary-light)] font-bold hover:bg-[var(--pg-surface-3)] transition cursor-pointer">
            {{ isPlaying() ? '⏸ Pause' : '▶ Play' }}
          </button>
          <button (click)="resetCamera()" type="button"
                  class="px-3 py-1.5 rounded-xl bg-[var(--pg-surface-2,#181820)] text-[var(--pg-text-secondary)] font-bold hover:bg-[var(--pg-surface-3)] transition cursor-pointer">
            🎯 Reset
          </button>
        </div>
      </div>
    </div>
  `
})
export class GullCardiacLensComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('renderCanvas');

  readonly regime = signal<CardiacRegime>('normal_sinus');
  readonly isPlaying = signal<boolean>(true);
  readonly engineMode = signal<'webgpu' | 'webgl2'>('webgl2');

  readonly heartRateBpm = signal<number>(72);
  readonly qtcIntervalMs = signal<number>(410);
  readonly conductionVelocity = signal<number>(0.85);
  readonly eadInstability = signal<number>(0.0);

  private engine: GullRenderEngine | null = null;
  private renderer: DirectCardiacRenderer | null = null;
  private resizeObserver: ResizeObserver | null = null;

  public async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;

    this.engine = new GullRenderEngine({ canvas });
    const mode = await this.engine.initialize();
    this.engineMode.set(mode);

    this.renderer = new DirectCardiacRenderer(this.engine);
    this.renderer.init();

    // Setup responsive resize
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.engine?.resize(width, height);
      }
    });
    this.resizeObserver.observe(canvas.parentElement || canvas);

    // Start render loop
    this.engine.startRenderLoop(timeSec => {
      if (!this.isPlaying()) return;
      this.renderer?.render({
        timeSec,
        heartRateBpm: this.heartRateBpm(),
        conductionVelocity: this.conductionVelocity(),
        qtcIntervalMs: this.qtcIntervalMs(),
        eadInstability: this.eadInstability(),
        vagalResonance: 1.0,
        circadianTone: 0.0
      });
    });
  }

  public setRegime(regime: CardiacRegime): void {
    this.regime.set(regime);
    switch (regime) {
      case 'normal_sinus':
        this.heartRateBpm.set(72);
        this.qtcIntervalMs.set(410);
        this.conductionVelocity.set(0.85);
        this.eadInstability.set(0.0);
        break;
      case 'drug_induced_long_qtc':
        this.heartRateBpm.set(64);
        this.qtcIntervalMs.set(515);
        this.conductionVelocity.set(0.65);
        this.eadInstability.set(0.35);
        break;
      case 'severe_torsades_de_pointes':
        this.heartRateBpm.set(165);
        this.qtcIntervalMs.set(580);
        this.conductionVelocity.set(0.40);
        this.eadInstability.set(0.85);
        break;
      case 'hypokalemia_arrhythmia':
        this.heartRateBpm.set(88);
        this.qtcIntervalMs.set(495);
        this.conductionVelocity.set(0.55);
        this.eadInstability.set(0.60);
        break;
    }
  }

  public togglePlay(): void {
    this.isPlaying.update(v => !v);
  }

  public resetCamera(): void {
    if (this.engine) {
      this.engine.camera.azimuth = 0.0;
      this.engine.camera.elevation = 0.2;
      this.engine.camera.radius = 4.5;
    }
  }

  public ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.engine?.destroy();
  }
}
