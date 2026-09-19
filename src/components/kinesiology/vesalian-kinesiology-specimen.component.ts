/**
 * PocketGull Vesalian Kinesiology & Movement Specimen Component
 * 
 * Synthesizes:
 * 1. Stanford University OpenSim musculoskeletal gait kinematics
 * 2. Andreas Vesalius 1543 chiaroscuro anatomical copperplate etching
 * 3. University of Tasmania Wicking/Menzies cognitive legibility & neuro-rehab standards
 * 
 * Architecture:
 * - Standalone Angular 22 Component (Signals reactivity, OnPush)
 * - Resolution-independent pure SVG vector rendering (zero bitmap bloat)
 * - Scotopic contrast optimization for #09090b obsidian clinical HUDs
 */

import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { KinesiologyBiomechanicsService } from '../../services/kinesiology-biomechanics.service';
import { BioRhythmicTypographyService } from '../../services/bio-rhythmic-typography.service';

export type ClinicalMovementPreset = 'normal_gait' | 'romberg_balance' | 'tandem_neuro' | 'upper_reach';

@Component({
  selector: 'app-vesalian-kinesiology-specimen',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-zinc-950/95 border border-amber-500/30 rounded-3xl p-6 text-zinc-100 font-mono shadow-2xl relative overflow-hidden flex flex-col gap-6">
      
      <!-- Ambient Glow -->
      <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-amber-950/20 via-zinc-950/80 to-black z-0"></div>

      <!-- Header & Badges -->
      <div class="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xl">🏃</span>
            <h3 class="text-base font-bold text-amber-300 font-sans tracking-tight">
              Vesalian Biomechanical Kinematics Engine
            </h3>
            <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40">
              Stanford OpenSim • Vesalius 1543
            </span>
          </div>
          <p class="text-xs text-zinc-400 font-sans mt-1">
            Parametric Vector Movement Simulation with Histological Cellular Cross-Hatching
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button 
            type="button"
            (click)="toggleHistology()"
            [class.bg-teal-500]="showHistology()"
            [class.text-zinc-950]="showHistology()"
            [class.text-teal-400]="!showHistology()"
            class="px-3 py-1.5 text-xs font-bold uppercase rounded-xl border border-teal-500/40 transition cursor-pointer">
            🔬 {{ showHistology() ? 'Histology: ON' : 'Histology: OFF' }}
          </button>
          
          <button 
            type="button"
            (click)="togglePlay()"
            class="px-3.5 py-1.5 text-xs font-bold uppercase rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 transition cursor-pointer flex items-center gap-1.5 shadow-md">
            <span>{{ isPlaying() ? '⏸ Pause' : '▶ Walk' }}</span>
          </button>
        </div>
      </div>

      <!-- Main Interactive Viewport & Controls Grid -->
      <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left: SVG Anatomical Etching Canvas -->
        <div class="lg:col-span-7 bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[360px] shadow-inner overflow-hidden">
          
          <!-- Phase Title Banner -->
          <div class="absolute top-3 left-4 z-10 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-xs text-amber-400 font-bold flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>{{ posture().phaseName }}</span>
          </div>

          <!-- Ground Contact Line -->
          <div class="absolute bottom-12 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>

          <!-- Dynamic SVG Vector Figure -->
          <svg class="w-full h-full max-h-[320px] select-none" viewBox="50 50 300 300">
            <!-- Rendered Vesalian Etching Group -->
            <g [innerHTML]="sanitizedSvg()"></g>
          </svg>

          <!-- Scrubbing Timeline Slider -->
          <div class="w-full mt-2 space-y-1">
            <div class="flex justify-between text-[11px] text-zinc-400">
              <span>Gait Stride Timeline</span>
              <span class="text-amber-300 font-bold tabular-nums font-biorhythmic-pulse scotopic-anti-fringing">
                {{ (gaitProgress() * 100).toFixed(0) }}% Cycle
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01"
              [value]="gaitProgress()"
              (input)="onProgressChange($event)"
              class="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
          </div>
        </div>

        <!-- Right: Clinical Telemetry & Stanford Dynamics HUD -->
        <div class="lg:col-span-5 flex flex-col justify-between gap-4">
          
          <!-- Kinematic Joint Angles Panel -->
          <div class="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
            <div class="text-xs font-bold uppercase tracking-wider text-teal-400 border-b border-zinc-800 pb-2 flex items-center justify-between">
              <span>Sagittal Joint Angles</span>
              <span class="text-[10px] text-zinc-400">Stanford OpenSim</span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/60">
                <span class="text-zinc-400 block text-[10px]">Hip Flexion/Extension:</span>
                <span class="text-base font-bold text-amber-300 font-biorhythmic-pulse scotopic-anti-fringing tabular-nums">
                  {{ posture().hipAngleDeg }}°
                </span>
              </div>

              <div class="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/60">
                <span class="text-zinc-400 block text-[10px]">Knee Flexion:</span>
                <span class="text-base font-bold text-teal-300 font-biorhythmic-pulse scotopic-anti-fringing tabular-nums">
                  {{ posture().kneeAngleDeg }}°
                </span>
              </div>

              <div class="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/60">
                <span class="text-zinc-400 block text-[10px]">Ankle Dorsi/Plantar:</span>
                <span class="text-base font-bold text-sky-300 font-biorhythmic-pulse scotopic-anti-fringing tabular-nums">
                  {{ posture().ankleAngleDeg }}°
                </span>
              </div>

              <div class="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/60">
                <span class="text-zinc-400 block text-[10px]">Ground Reaction Force:</span>
                <span class="text-base font-bold text-rose-400 font-biorhythmic-pulse scotopic-anti-fringing tabular-nums">
                  {{ posture().grfMultiplier }}x BW
                </span>
              </div>
            </div>
          </div>

          <!-- Histological Tissue Legend -->
          <div class="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-3.5 text-[11px] space-y-2">
            <div class="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
              Microscopic Histology Infill
            </div>
            <div class="text-zinc-400 leading-relaxed font-sans">
              Muscle bellies are cross-hatched with <strong class="text-amber-200">actin-myosin striations</strong>. Cortical bone stems are etched with <strong class="text-teal-200">Haversian osteon lamellae</strong> in classical copperplate chiaroscuro.
            </div>
          </div>

          <!-- Neuro-Rehab Movement Assessment Presets -->
          <div class="flex items-center gap-1.5 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800">
            <button 
              type="button" 
              (click)="setPreset('normal_gait')"
              [class.bg-amber-500]="activePreset() === 'normal_gait'"
              [class.text-zinc-950]="activePreset() === 'normal_gait'"
              [class.text-amber-400]="activePreset() !== 'normal_gait'"
              class="flex-1 py-1.5 text-[10px] font-extrabold uppercase rounded-xl transition cursor-pointer text-center">
              Normal Gait
            </button>

            <button 
              type="button" 
              (click)="setPreset('romberg_balance')"
              [class.bg-amber-500]="activePreset() === 'romberg_balance'"
              [class.text-zinc-950]="activePreset() === 'romberg_balance'"
              [class.text-amber-400]="activePreset() !== 'romberg_balance'"
              class="flex-1 py-1.5 text-[10px] font-extrabold uppercase rounded-xl transition cursor-pointer text-center">
              Romberg Test
            </button>

            <button 
              type="button" 
              (click)="setPreset('tandem_neuro')"
              [class.bg-amber-500]="activePreset() === 'tandem_neuro'"
              [class.text-zinc-950]="activePreset() === 'tandem_neuro'"
              [class.text-amber-400]="activePreset() !== 'tandem_neuro'"
              class="flex-1 py-1.5 text-[10px] font-extrabold uppercase rounded-xl transition cursor-pointer text-center">
              Tandem Walk
            </button>
          </div>

        </div>

      </div>

    </div>
  `
})
export class VesalianKinesiologySpecimenComponent implements OnDestroy {
  readonly biomechanics = inject(KinesiologyBiomechanicsService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly biorhythm = inject(BioRhythmicTypographyService, { optional: true });

  readonly showHistology = signal<boolean>(true);
  readonly isPlaying = signal<boolean>(true);
  readonly activePreset = signal<ClinicalMovementPreset>('normal_gait');

  readonly gaitProgress = computed(() => this.biomechanics.activeGaitProgress());
  readonly posture = computed(() => this.biomechanics.livePosture());

  readonly sanitizedSvg = computed<SafeHtml>(() => {
    const p = this.posture();
    const rawSvg = this.biomechanics.generateVesalianSvg(p, {
      strokeColor: '#f59e0b',
      hatchColor: 'rgba(245, 158, 11, 0.45)',
      includeHistology: this.showHistology()
    });
    return this.sanitizer.bypassSecurityTrustHtml(rawSvg);
  });

  private animFrameId?: number;
  private lastTime = 0;

  constructor() {
    this.startAnimationLoop();
  }

  toggleHistology(): void {
    this.showHistology.update(v => !v);
  }

  togglePlay(): void {
    this.isPlaying.update(v => !v);
  }

  onProgressChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.biomechanics.setGaitProgress(val);
    this.isPlaying.set(false); // Pause when user is scrubbing
  }

  setPreset(preset: ClinicalMovementPreset): void {
    this.activePreset.set(preset);
    if (preset === 'normal_gait') {
      this.isPlaying.set(true);
    } else if (preset === 'romberg_balance') {
      this.isPlaying.set(false);
      this.biomechanics.setGaitProgress(0.40); // Midstance upright stance
    } else if (preset === 'tandem_neuro') {
      this.isPlaying.set(false);
      this.biomechanics.setGaitProgress(0.05); // Heel-to-toe contact
    }
  }

  private startAnimationLoop(): void {
    if (typeof window === 'undefined') return;

    const loop = (time: number) => {
      if (this.lastTime === 0) this.lastTime = time;
      const dt = Math.min(0.05, (time - this.lastTime) / 1000);
      this.lastTime = time;

      if (this.isPlaying()) {
        this.biomechanics.advanceGait(dt, 0.9); // 0.9 Hz gentle walking cadence
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  ngOnDestroy(): void {
    if (this.animFrameId && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}
