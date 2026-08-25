import { Component, ChangeDetectionStrategy, signal, computed, ElementRef, viewChild, AfterViewInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-navier-stokes-viewer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full bg-slate-950 text-zinc-100 rounded-2xl border border-sky-900/50 p-4 shadow-2xl font-mono relative overflow-hidden">
      <!-- Header Bar -->
      <div class="flex items-center justify-between gap-3 mb-3 border-b border-sky-900/40 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">🌊</span>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-sky-300">
              Navier-Stokes Glymphatic Flow Model
            </h3>
            <p class="text-[10px] text-sky-400/80">
              CSF Perivascular Viscous Fluid Dynamics & Beta-Amyloid Clearance
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-sky-950 border border-sky-700/60 text-sky-300">
            Re: {{ reynoldsNumber() }} (Laminar)
          </span>
        </div>
      </div>

      <!-- Stage Selector Pill Bar -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 hide-scrollbar">
        <button (click)="setSleepStage('wake')" class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer border"
                [class.bg-sky-600]="sleepStage() === 'wake'" [class.text-white]="sleepStage() === 'wake'" [class.bg-zinc-900]="sleepStage() !== 'wake'" [class.text-zinc-400]="sleepStage() !== 'wake'" [class.border-zinc-800]="sleepStage() !== 'wake'">
          ☀️ Wake (Low Flow)
        </button>
        <button (click)="setSleepStage('n2')" class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer border"
                [class.bg-sky-600]="sleepStage() === 'n2'" [class.text-white]="sleepStage() === 'n2'" [class.bg-zinc-900]="sleepStage() !== 'n2'" [class.text-zinc-400]="sleepStage() !== 'n2'" [class.border-zinc-800]="sleepStage() !== 'n2'">
          🌙 N2 Sleep (Moderate)
        </button>
        <button (click)="setSleepStage('n3')" class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer border"
                [class.bg-sky-600]="sleepStage() === 'n3'" [class.text-white]="sleepStage() === 'n3'" [class.bg-zinc-900]="sleepStage() !== 'n3'" [class.text-zinc-400]="sleepStage() !== 'n3'" [class.border-zinc-800]="sleepStage() !== 'n3'">
          💤 N3 Slow-Wave (+600% Clearance)
        </button>
      </div>

      <!-- Fluid Dynamics Canvas -->
      <div class="flex-1 w-full relative bg-black rounded-xl overflow-hidden border border-sky-900/30 min-h-[220px]">
        <canvas #fluidCanvas class="w-full h-full block"></canvas>
      </div>

      <!-- Metrics Footer -->
      <div class="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-sky-900/30">
        <div class="flex items-center gap-4 text-[10px] text-sky-300/80">
          <span>CSF Velocity: <strong class="text-sky-200 font-bold">{{ csfVelocity() }} mm/s</strong></span>
          <span>Intercellular Expansion: <strong class="text-sky-200 font-bold">+{{ volumeExpansion() }}%</strong></span>
        </div>
        <span class="text-[10px] text-zinc-500 font-mono">Partial Differential Continuity Equation</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
  `]
})
export class NavierStokesViewerComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly fluidCanvas = viewChild<ElementRef<HTMLCanvasElement>>('fluidCanvas');

  readonly sleepStage = signal<'wake' | 'n2' | 'n3'>('n3');
  readonly csfVelocity = computed(() => this.sleepStage() === 'n3' ? '4.8' : this.sleepStage() === 'n2' ? '2.1' : '0.6');
  readonly volumeExpansion = computed(() => this.sleepStage() === 'n3' ? 60 : this.sleepStage() === 'n2' ? 20 : 0);
  readonly reynoldsNumber = computed(() => this.sleepStage() === 'n3' ? 142 : this.sleepStage() === 'n2' ? 85 : 24);

  private particles: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];
  private animId?: number;

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.initParticles();
    this.startLoop();
  }

  setSleepStage(stage: 'wake' | 'n2' | 'n3') {
    this.sleepStage.set(stage);
    this.initParticles();
  }

  private initParticles() {
    const count = this.sleepStage() === 'n3' ? 120 : this.sleepStage() === 'n2' ? 70 : 30;
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * 400,
      y: Math.random() * 240,
      vx: (Math.random() * 1.5 + 0.5) * (this.sleepStage() === 'n3' ? 2.5 : this.sleepStage() === 'n2' ? 1.2 : 0.4),
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 1
    }));
  }

  private startLoop() {
    const loop = () => {
      this.draw();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  private draw() {
    const canvas = this.fluidCanvas()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth || 360;
      canvas.height = canvas.clientHeight || 220;
    }

    ctx.fillStyle = '#030814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Vessel Walls
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.lineTo(canvas.width, 30);
    ctx.moveTo(0, canvas.height - 30);
    ctx.lineTo(canvas.width, canvas.height - 30);
    ctx.stroke();

    // Move & Render Flow Particles
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x > canvas.width) p.x = 0;
      if (p.y < 35 || p.y > canvas.height - 35) p.vy *= -1;

      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ngOnDestroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}
