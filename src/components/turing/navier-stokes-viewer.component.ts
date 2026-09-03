import { Component, ChangeDetectionStrategy, signal, computed, ElementRef, viewChild, AfterViewInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { CircadianSleepinessService } from '../../services/circadian-sleepiness.service';

export type FluidModelMode = 'glymphatic' | 'morphogen' | 'shear';

interface IFluidParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  morphogenConc: number;
  shearStress: number;
}

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
            <h3 class="text-sm font-black uppercase tracking-wider text-sky-300 flex items-center gap-2">
              Navier-Stokes & Biochemical Advection Engine
              @if (patientVitals()) {
                <span class="text-[9px] px-2 py-0.5 rounded-full bg-sky-950 border border-sky-500/40 text-sky-300">
                  BP: {{ patientVitals()?.bp || '118/76' }}
                </span>
              }
            </h3>
            <p class="text-[10px] text-sky-400/80">
              Microfluidic Viscous Flow, Morphogen Reaction-Diffusion & Endothelial Wall Shear Stress
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-sky-950 border border-sky-700/60 text-sky-300">
            Re: {{ reynoldsNumber() }} (Laminar)
          </span>
        </div>
      </div>

      <!-- Mode & Stage Selector Pill Bar -->
      <div class="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-sky-900/30">
        <!-- Fluid Mode Switcher -->
        <div class="flex items-center gap-1.5">
          <button (click)="setFluidMode('glymphatic')"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer border"
                  [class.bg-sky-600]="fluidMode() === 'glymphatic'" [class.text-white]="fluidMode() === 'glymphatic'" [class.border-sky-400]="fluidMode() === 'glymphatic'"
                  [class.bg-zinc-900]="fluidMode() !== 'glymphatic'" [class.text-zinc-400]="fluidMode() !== 'glymphatic'" [class.border-zinc-800]="fluidMode() !== 'glymphatic'">
            🌊 Glymphatic CSF
          </button>
          <button (click)="setFluidMode('morphogen')"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer border"
                  [class.bg-emerald-600]="fluidMode() === 'morphogen'" [class.text-white]="fluidMode() === 'morphogen'" [class.border-emerald-400]="fluidMode() === 'morphogen'"
                  [class.bg-zinc-900]="fluidMode() !== 'morphogen'" [class.text-zinc-400]="fluidMode() !== 'morphogen'" [class.border-zinc-800]="fluidMode() !== 'morphogen'">
            🧬 Morphogen Diffusion
          </button>
          <button (click)="setFluidMode('shear')"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer border"
                  [class.bg-amber-600]="fluidMode() === 'shear'" [class.text-white]="fluidMode() === 'shear'" [class.border-amber-400]="fluidMode() === 'shear'"
                  [class.bg-zinc-900]="fluidMode() !== 'shear'" [class.text-zinc-400]="fluidMode() !== 'shear'" [class.border-zinc-800]="fluidMode() !== 'shear'">
            ⚡ Wall Shear Stress
          </button>
        </div>

        <!-- Sleep State Controls (for Glymphatic mode) -->
        <div class="flex items-center gap-1.5">
          <button (click)="setSleepStage('wake')" class="px-2 py-0.5 rounded text-[9px] font-bold uppercase transition cursor-pointer border"
                  [class.bg-sky-900]="sleepStage() === 'wake'" [class.text-sky-200]="sleepStage() === 'wake'" [class.border-sky-700]="sleepStage() === 'wake'"
                  [class.bg-zinc-950]="sleepStage() !== 'wake'" [class.text-zinc-500]="sleepStage() !== 'wake'" [class.border-zinc-800]="sleepStage() !== 'wake'">
            Wake
          </button>
          <button (click)="setSleepStage('n2')" class="px-2 py-0.5 rounded text-[9px] font-bold uppercase transition cursor-pointer border"
                  [class.bg-sky-900]="sleepStage() === 'n2'" [class.text-sky-200]="sleepStage() === 'n2'" [class.border-sky-700]="sleepStage() === 'n2'"
                  [class.bg-zinc-950]="sleepStage() !== 'n2'" [class.text-zinc-500]="sleepStage() !== 'n2'" [class.border-zinc-800]="sleepStage() !== 'n2'">
            N2
          </button>
          <button (click)="setSleepStage('n3')" class="px-2 py-0.5 rounded text-[9px] font-bold uppercase transition cursor-pointer border"
                  [class.bg-sky-900]="sleepStage() === 'n3'" [class.text-sky-200]="sleepStage() === 'n3'" [class.border-sky-700]="sleepStage() === 'n3'"
                  [class.bg-zinc-950]="sleepStage() !== 'n3'" [class.text-zinc-500]="sleepStage() !== 'n3'" [class.border-zinc-800]="sleepStage() !== 'n3'">
            N3 (+600%)
          </button>
          <button (click)="syncWithCircadianTelemetry()"
                  class="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-200 transition cursor-pointer">
            ⚡ Sync
          </button>
        </div>
      </div>

      <!-- Fluid Dynamics Canvas -->
      <div class="flex-1 w-full relative bg-black rounded-xl overflow-hidden border border-sky-900/30 min-h-[220px]">
        <canvas #fluidCanvas class="w-full h-full block"></canvas>
      </div>

      <!-- Perturbations Bar -->
      <div class="mt-2 flex items-center gap-2 overflow-x-auto py-1 hide-scrollbar">
        <span class="text-[10px] uppercase font-bold text-sky-400/90 shrink-0">Biochemical Challenges:</span>
        <button (click)="pulseHypertension()"
                class="px-2.5 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-500/50 text-amber-300 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shrink-0">
          ⚠️ Vasoconstriction
        </button>
        <button (click)="induceSlowWaveDeepSleep()"
                class="px-2.5 py-1 rounded-lg bg-sky-950/70 hover:bg-sky-900 border border-sky-500/50 text-sky-300 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shrink-0">
          💤 Glymphatic Surge
        </button>
        <button (click)="injectMorphogenPulse()"
                class="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shrink-0">
          🧬 BMP/Wnt Morphogen Pulse
        </button>
        <button (click)="pulseAtheroproneTurbulence()"
                class="px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-500/50 text-rose-300 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shrink-0">
          🌪️ Atheroprone Low Shear (<0.4 Pa)
        </button>
      </div>

      <!-- Metrics Footer -->
      <div class="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-sky-900/30">
        <div class="flex flex-wrap items-center gap-4 text-[10px] text-sky-300/80">
          <span>Velocity: <strong class="text-sky-200 font-bold">{{ csfVelocity() }} mm/s</strong></span>
          <span>Intercellular: <strong class="text-sky-200 font-bold">+{{ volumeExpansion() }}%</strong></span>
          <span>Péclet ($Pe$): <strong class="text-emerald-300 font-bold">{{ pecletNumber() }}</strong></span>
          <span>Wall Shear ($\tau$): <strong class="text-amber-300 font-bold">{{ wallShearStress() }}</strong></span>
        </div>
        <span class="text-[10px] text-zinc-500 font-mono">2D Navier-Stokes + Advection-Diffusion</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
  `]
})
export class NavierStokesViewerComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly patientState = inject(PatientStateService, { optional: true });
  private readonly circadianService = inject(CircadianSleepinessService, { optional: true });
  private readonly fluidCanvas = viewChild<ElementRef<HTMLCanvasElement>>('fluidCanvas');

  readonly fluidMode = signal<FluidModelMode>('glymphatic');
  readonly sleepStage = signal<'wake' | 'n2' | 'n3'>('n3');

  readonly csfVelocity = computed(() => this.sleepStage() === 'n3' ? '4.8' : this.sleepStage() === 'n2' ? '2.1' : '0.6');
  readonly volumeExpansion = computed(() => this.sleepStage() === 'n3' ? 60 : this.sleepStage() === 'n2' ? 20 : 0);
  readonly reynoldsNumber = computed(() => this.sleepStage() === 'n3' ? 142 : this.sleepStage() === 'n2' ? 85 : 24);
  readonly pecletNumber = computed(() => this.fluidMode() === 'morphogen' ? 48.5 : this.sleepStage() === 'n3' ? 62.4 : 12.8);
  readonly wallShearStress = computed(() => this.fluidMode() === 'shear' ? '1.42 Pa' : this.sleepStage() === 'n3' ? '1.85 Pa' : '0.45 Pa');

  readonly patientVitals = computed(() => this.patientState?.vitals() || null);

  private particles: IFluidParticle[] = [];
  private animId?: number;
  private timeStep = 0;

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.syncWithCircadianTelemetry();
    this.initParticles();
    this.startLoop();
  }

  syncWithCircadianTelemetry() {
    const kss = this.circadianService?.clinicianKss?.() || 5;
    if (kss >= 7) {
      this.setSleepStage('n3');
    } else if (kss >= 5) {
      this.setSleepStage('n2');
    } else {
      this.setSleepStage('wake');
    }
  }

  setFluidMode(mode: FluidModelMode) {
    this.fluidMode.set(mode);
    this.initParticles();
  }

  pulseHypertension() {
    this.particles.forEach(p => {
      p.vx *= 0.6; // Stiffened vessel slows clearance
      p.vy += (Math.random() - 0.5) * 1.5; // Shear turbulence
      p.shearStress = 0.35;
    });
  }

  induceSlowWaveDeepSleep() {
    this.setSleepStage('n3');
  }

  injectMorphogenPulse() {
    this.setFluidMode('morphogen');
    this.particles.forEach(p => {
      if (p.x < 100) {
        p.morphogenConc = 1.0;
      }
    });
  }

  pulseAtheroproneTurbulence() {
    this.setFluidMode('shear');
    this.particles.forEach(p => {
      p.vx = (Math.random() - 0.5) * 0.8;
      p.vy = (Math.random() - 0.5) * 2.0;
      p.shearStress = 0.22; // Low oscillating shear
    });
  }

  setSleepStage(stage: 'wake' | 'n2' | 'n3') {
    this.sleepStage.set(stage);
    this.initParticles();
  }

  private initParticles() {
    const count = this.sleepStage() === 'n3' ? 140 : this.sleepStage() === 'n2' ? 80 : 40;
    this.particles = Array.from({ length: count }, () => {
      const y = Math.random() * 200 + 20;
      // Poiseuille parabolic profile: highest velocity at center, near zero at walls
      const normalizedY = (y - 120) / 100;
      const parabolicFactor = Math.max(0.2, 1 - normalizedY * normalizedY);
      const baseVelocity = (this.sleepStage() === 'n3' ? 3.0 : this.sleepStage() === 'n2' ? 1.5 : 0.6) * parabolicFactor;

      return {
        x: Math.random() * 400,
        y,
        vx: (Math.random() * 0.5 + 0.8) * baseVelocity,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 2 + 1.2,
        morphogenConc: Math.random() * 0.8,
        shearStress: 1.4 * (1 - parabolicFactor)
      };
    });
  }

  private startLoop() {
    const loop = () => {
      this.timeStep += 0.03;
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

    const mode = this.fluidMode();

    // Render morphogen concentration wave background in morphogen mode
    if (mode === 'morphogen') {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
      gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.1)');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0.05)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 25, canvas.width, canvas.height - 50);
    }

    // Draw Endothelial Vessel Walls
    const wallColor = mode === 'shear' ? '#d97706' : mode === 'morphogen' ? '#059669' : '#1e3a8a';
    ctx.strokeStyle = wallColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 25);
    ctx.lineTo(canvas.width, 25);
    ctx.moveTo(0, canvas.height - 25);
    ctx.lineTo(canvas.width, canvas.height - 25);
    ctx.stroke();

    // Move & Render Flow Particles
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Advection-diffusion decay and dispersion
      if (mode === 'morphogen') {
        p.morphogenConc = Math.max(0.05, p.morphogenConc * 0.998);
      }

      if (p.x > canvas.width) {
        p.x = 0;
        p.morphogenConc = Math.random() * 0.9 + 0.1;
      }
      if (p.y < 30 || p.y > canvas.height - 30) {
        p.vy *= -1;
      }

      // Color based on active mode
      if (mode === 'morphogen') {
        ctx.fillStyle = p.morphogenConc > 0.5 ? '#34d399' : '#06b6d4';
        ctx.shadowColor = '#10b981';
      } else if (mode === 'shear') {
        ctx.fillStyle = p.shearStress > 1.0 ? '#fbbf24' : '#f43f5e';
        ctx.shadowColor = '#f59e0b';
      } else {
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0ea5e9';
      }

      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ngOnDestroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}
