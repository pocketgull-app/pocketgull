import { Component, ChangeDetectionStrategy, inject, signal, viewChild, ElementRef, effect, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cyp450DdiMatrixService, DdiPresetMode, CypIsoform, InhibitionMechanism } from '../../services/cyp450-ddi-matrix.service';

@Component({
  selector: 'app-cyp450-ddi-matrix-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full bg-zinc-950 font-mono text-zinc-100 rounded-3xl border border-rose-500/30 overflow-hidden shadow-2xl relative mb-6">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 gap-3 z-20 shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-3.5 h-3.5 rounded-full bg-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-pulse"></span>
          <div>
            <h3 class="text-xs sm:text-sm font-black uppercase text-zinc-100 flex items-center gap-2">
              <span>💊</span>
              <span>CYP450 Enzyme Kinetics &amp; Pharmacokinetic DDI Matrix (Clinical Model P12)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              Michaelis-Menten &amp; MBI Kinetics (k_inact, K_I) • Dynamic AUCR Exposure • ISMP High-Alert Posology Guard
            </p>
          </div>
        </div>

        <!-- Master Badges -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md"
                [ngClass]="{
                  'bg-rose-950/80 border-rose-600/60 text-rose-300 animate-pulse': service.ddiAssessment().interactionSeverity === 'Contraindicated / Severe Hazard',
                  'bg-amber-950/80 border-amber-600/60 text-amber-300': service.ddiAssessment().interactionSeverity === 'Major Interaction',
                  'bg-yellow-950/80 border-yellow-600/60 text-yellow-300': service.ddiAssessment().interactionSeverity === 'Moderate Interaction',
                  'bg-emerald-950/80 border-emerald-600/60 text-emerald-300': service.ddiAssessment().interactionSeverity === 'Minor / Insignificant'
                }">
            {{ service.ddiAssessment().interactionSeverity }}
          </span>

          <span class="px-3 py-1 rounded-xl text-xs font-bold border border-zinc-700 bg-zinc-900 text-zinc-300">
            AUCR: {{ service.ddiAssessment().aucRatio }}x
            @if (service.ddiAssessment().victim.isProdrugRequiringBioactivation) {
              <span class="text-rose-400 font-normal ml-1">(Active Drop)</span>
            } @else {
              <span class="text-amber-400 font-normal ml-1">(Exposure)</span>
            }
          </span>
        </div>
      </div>

      <!-- Presets Toolbar -->
      <div class="flex flex-wrap items-center gap-1.5 p-3 bg-zinc-900/60 border-b border-zinc-800 text-xs">
        <span class="text-[10px] font-bold text-zinc-400 uppercase mr-1">High-Hazard Presets:</span>
        <button type="button" (click)="applyPreset('simvastatin_clarithromycin')"
                [class.bg-rose-600]="service.activePreset() === 'simvastatin_clarithromycin'"
                [class.text-white]="service.activePreset() === 'simvastatin_clarithromycin'"
                [class.text-rose-400]="service.activePreset() !== 'simvastatin_clarithromycin'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Simvastatin + Clarithromycin (3A4 MBI)
        </button>
        <button type="button" (click)="applyPreset('warfarin_amiodarone')"
                [class.bg-rose-600]="service.activePreset() === 'warfarin_amiodarone'"
                [class.text-white]="service.activePreset() === 'warfarin_amiodarone'"
                [class.text-rose-400]="service.activePreset() !== 'warfarin_amiodarone'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Warfarin + Amiodarone (2C9 Narrow TI)
        </button>
        <button type="button" (click)="applyPreset('clopidogrel_omeprazole')"
                [class.bg-purple-600]="service.activePreset() === 'clopidogrel_omeprazole'"
                [class.text-white]="service.activePreset() === 'clopidogrel_omeprazole'"
                [class.text-purple-400]="service.activePreset() !== 'clopidogrel_omeprazole'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Clopidogrel + Omeprazole (2C19 Prodrug)
        </button>
        <button type="button" (click)="applyPreset('metoprolol_fluoxetine')"
                [class.bg-amber-600]="service.activePreset() === 'metoprolol_fluoxetine'"
                [class.text-white]="service.activePreset() === 'metoprolol_fluoxetine'"
                [class.text-amber-400]="service.activePreset() !== 'metoprolol_fluoxetine'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Metoprolol + Fluoxetine (2D6 MBI)
        </button>
        <button type="button" (click)="applyPreset('theophylline_ciprofloxacin')"
                [class.bg-rose-700]="service.activePreset() === 'theophylline_ciprofloxacin'"
                [class.text-white]="service.activePreset() === 'theophylline_ciprofloxacin'"
                [class.text-rose-300]="service.activePreset() !== 'theophylline_ciprofloxacin'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Theophylline + Ciprofloxacin (1A2)
        </button>
        <button type="button" (click)="applyPreset('atorvastatin_amlodipine')"
                [class.bg-blue-600]="service.activePreset() === 'atorvastatin_amlodipine'"
                [class.text-white]="service.activePreset() === 'atorvastatin_amlodipine'"
                [class.text-blue-400]="service.activePreset() !== 'atorvastatin_amlodipine'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Atorvastatin + Amlodipine (3A4 Moderate)
        </button>
      </div>

      <!-- Core Telemetry Grid -->
      <div class="p-4 sm:p-6 space-y-6">
        
        <!-- KPI Metrics Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          
          <!-- AUCR Fold Shift -->
          <div class="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
            <span class="text-[11px] font-bold text-zinc-400 uppercase">AUC Ratio (AUCR)</span>
            <div class="my-1.5 flex items-baseline gap-2">
              <span class="text-2xl font-black tabular-nums"
                    [ngClass]="{
                      'text-rose-400': service.ddiAssessment().aucRatio >= 5.0 || service.ddiAssessment().aucRatio <= 0.60,
                      'text-amber-400': (service.ddiAssessment().aucRatio >= 2.0 && service.ddiAssessment().aucRatio < 5.0) || (service.ddiAssessment().aucRatio > 0.60 && service.ddiAssessment().aucRatio <= 0.80),
                      'text-yellow-400': service.ddiAssessment().aucRatio >= 1.25 && service.ddiAssessment().aucRatio < 2.0,
                      'text-emerald-400': service.ddiAssessment().aucRatio < 1.25 && service.ddiAssessment().aucRatio > 0.80
                    }">
                {{ service.ddiAssessment().aucRatio }}x
              </span>
              <span class="text-[10px] text-zinc-500 font-sans">
                {{ service.ddiAssessment().victim.isProdrugRequiringBioactivation ? 'Active fraction' : 'Plasma exposure' }}
              </span>
            </div>
            <span class="text-[10px] text-zinc-400 font-sans">
              Baseline AUC = 1.0x
            </span>
          </div>

          <!-- Metabolic Pathway Clearance Fraction (fm) -->
          <div class="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
            <span class="text-[11px] font-bold text-zinc-400 uppercase">Pathway Clearance (f_m)</span>
            <div class="my-1.5 flex items-baseline gap-2">
              <span class="text-2xl font-black text-cyan-400 tabular-nums">
                {{ (service.victimInput().fractionMetabolizedFm * 100).toFixed(0) }}%
              </span>
              <span class="text-[10px] text-zinc-400 font-sans">via {{ service.victimInput().primaryIsoform }}</span>
            </div>
            <span class="text-[10px] text-zinc-500">
              {{ (100 - service.victimInput().fractionMetabolizedFm * 100).toFixed(0) }}% renal/biliary shunt
            </span>
          </div>

          <!-- Target CYP Isoform Match -->
          <div class="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
            <span class="text-[11px] font-bold text-zinc-400 uppercase">CYP Isoform Affinity</span>
            <div class="my-1.5 flex items-center gap-2">
              <span class="text-xl font-black"
                    [class.text-rose-400]="service.victimInput().primaryIsoform === service.perpetratorInput().targetIsoform"
                    [class.text-emerald-400]="service.victimInput().primaryIsoform !== service.perpetratorInput().targetIsoform">
                {{ service.victimInput().primaryIsoform }}
              </span>
              @if (service.victimInput().primaryIsoform === service.perpetratorInput().targetIsoform) {
                <span class="px-1.5 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800 font-bold uppercase">Target Collision</span>
              } @else {
                <span class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold uppercase">Discordant</span>
              }
            </div>
            <span class="text-[10px] text-zinc-500 truncate">
              Inhibitor: {{ service.perpetratorInput().targetIsoform }}
            </span>
          </div>

          <!-- Therapeutic Window & High-Alert -->
          <div class="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
            <span class="text-[11px] font-bold text-zinc-400 uppercase">Therapeutic Window</span>
            <div class="my-1.5">
              <span class="text-xs font-black uppercase px-2 py-0.5 rounded-md"
                    [ngClass]="{
                      'bg-rose-950 text-rose-300 border border-rose-800': service.victimInput().therapeuticWindow === 'Narrow (Critical Toxicity)',
                      'bg-amber-950 text-amber-300 border border-amber-800': service.victimInput().therapeuticWindow === 'Moderate',
                      'bg-emerald-950 text-emerald-300 border border-emerald-800': service.victimInput().therapeuticWindow === 'Wide'
                    }">
                {{ service.victimInput().therapeuticWindow }}
              </span>
            </div>
            <span class="text-[10px] text-zinc-400 font-sans truncate">
              {{ service.victimInput().name }}
            </span>
          </div>
        </div>

        <!-- 2D Pharmacokinetic Plasma Profile Canvas Curve -->
        <div class="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 relative">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-xs font-bold text-zinc-300 uppercase flex items-center gap-2">
              <span>📈</span>
              <span>Concentration-Time Profile (Pharmacokinetic Simulation 0–24h)</span>
            </h4>
            <div class="flex items-center gap-3 text-[11px] font-sans">
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-1 bg-cyan-400 rounded-full inline-block"></span>
                <span class="text-zinc-400">Baseline C(t)</span>
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-1 bg-rose-400 rounded-full inline-block"></span>
                <span class="text-zinc-400">Inhibited State C(t)</span>
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-3 h-0.5 bg-rose-500/60 border-t border-dashed border-rose-400 inline-block"></span>
                <span class="text-zinc-500">Toxic Threshold</span>
              </span>
            </div>
          </div>

          <canvas #pkCanvas class="w-full h-44 rounded-xl bg-zinc-950 border border-zinc-900 block"></canvas>
        </div>

        <!-- Dynamic Parameter Interactive Sliders -->
        <div class="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Unbound Inhibitor Conc -->
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between items-center text-xs">
              <span class="text-zinc-400">Inhibitor [I]_unbound:</span>
              <span class="text-rose-400 font-bold tabular-nums">{{ service.perpetratorInput().unboundConcentrationUm }} &mu;M</span>
            </div>
            <input type="range" min="0.05" max="10.0" step="0.05"
                   [ngModel]="service.perpetratorInput().unboundConcentrationUm"
                   (ngModelChange)="updateInhibitorConc($event)"
                   class="w-full accent-rose-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer">
            <span class="text-[10px] text-zinc-500">Steady-state hepatic systemic unbound fraction</span>
          </div>

          <!-- Victim Fraction Metabolized -->
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between items-center text-xs">
              <span class="text-zinc-400">Fraction Metabolized (f_m):</span>
              <span class="text-cyan-400 font-bold tabular-nums">{{ (service.victimInput().fractionMetabolizedFm * 100).toFixed(0) }}%</span>
            </div>
            <input type="range" min="0.10" max="0.99" step="0.01"
                   [ngModel]="service.victimInput().fractionMetabolizedFm"
                   (ngModelChange)="updateFm($event)"
                   class="w-full accent-cyan-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer">
            <span class="text-[10px] text-zinc-500">Degree of metabolic dependence on target CYP isoform</span>
          </div>

          <!-- Inhibition Constant Ki -->
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between items-center text-xs">
              <span class="text-zinc-400">Inhibition Constant (K_i):</span>
              <span class="text-amber-400 font-bold tabular-nums">{{ service.perpetratorInput().inhibitionConstantKiUm }} &mu;M</span>
            </div>
            <input type="range" min="0.01" max="5.0" step="0.01"
                   [ngModel]="service.perpetratorInput().inhibitionConstantKiUm"
                   (ngModelChange)="updateKi($event)"
                   class="w-full accent-amber-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer">
            <span class="text-[10px] text-zinc-500">Lower K_i denotes higher binding affinity/potency</span>
          </div>
        </div>

        <!-- Clinical Action Protocols & ISMP Posology -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- Left: Action Guidance & ISMP Prescription -->
          <div class="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex flex-col justify-between space-y-3">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-zinc-400 uppercase">🛡️ Clinical Decision Protocol</span>
                <span class="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800 font-bold uppercase">
                  ISMP Standard
                </span>
              </div>
              <p class="text-xs text-zinc-200 leading-relaxed font-sans mb-3">
                {{ service.ddiAssessment().clinicalActionProtocol }}
              </p>
            </div>

            <!-- ISMP Posology Strip -->
            <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] text-zinc-500 uppercase font-bold">ISMP Formatted Posology</span>
                <span class="text-[9px] text-emerald-400 font-bold">0 Trailing Zeros • 0 Naked Decimals</span>
              </div>
              <div class="text-sm font-black text-amber-300">
                {{ service.ddiAssessment().ismpValidatedDosageText }}
              </div>
              <div class="text-[11px] text-zinc-400 font-sans mt-1">
                Dose Guidance: {{ service.ddiAssessment().recommendedDoseAdjustment }}
              </div>
            </div>
          </div>

          <!-- Right: Molecular Mechanism & Toxicity Hazard -->
          <div class="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex flex-col justify-between space-y-3">
            <div>
              <span class="text-xs font-bold text-zinc-400 uppercase mb-2 block">🔬 Molecular Enzyme Mechanism</span>
              <p class="text-xs text-zinc-300 leading-relaxed font-sans mb-3">
                {{ service.ddiAssessment().mechanismDescription }}
              </p>
            </div>

            <!-- Toxicity Alert Box -->
            <div class="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60">
              <span class="text-[10px] text-rose-400 uppercase font-black block mb-1">⚠️ Clinical Hazard Warning</span>
              <p class="text-xs text-rose-200 font-sans leading-snug">
                {{ service.victimInput().toxicityConsequences }}
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  `
})
export class Cyp450DdiMatrixCardComponent implements AfterViewInit {
  readonly service = inject(Cyp450DdiMatrixService);
  private readonly pkCanvas = viewChild<ElementRef<HTMLCanvasElement>>('pkCanvas');

  constructor() {
    effect(() => {
      // Re-render PK profile whenever assessment changes
      const ddi = this.service.ddiAssessment();
      if (this.pkCanvas()?.nativeElement) {
        this.renderPkProfile(ddi.aucRatio, ddi.victim.isProdrugRequiringBioactivation);
      }
    });
  }

  ngAfterViewInit(): void {
    const ddi = this.service.ddiAssessment();
    this.renderPkProfile(ddi.aucRatio, ddi.victim.isProdrugRequiringBioactivation);
  }

  applyPreset(preset: DdiPresetMode): void {
    this.service.applyPreset(preset);
  }

  updateInhibitorConc(val: number): void {
    const current = this.service.perpetratorInput();
    this.service.perpetratorInput.set({
      ...current,
      unboundConcentrationUm: Number(val)
    });
  }

  updateFm(val: number): void {
    const current = this.service.victimInput();
    this.service.victimInput.set({
      ...current,
      fractionMetabolizedFm: Number(val)
    });
  }

  updateKi(val: number): void {
    const current = this.service.perpetratorInput();
    this.service.perpetratorInput.set({
      ...current,
      inhibitionConstantKiUm: Number(val)
    });
  }

  private renderPkProfile(aucRatio: number, isProdrug: boolean): void {
    const canvas = this.pkCanvas()?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (let x = 40; x < width - 10; x += (width - 50) / 6) {
      ctx.beginPath();
      ctx.moveTo(x, 10);
      ctx.lineTo(x, height - 25);
      ctx.stroke();
    }

    for (let y = 15; y < height - 25; y += (height - 40) / 4) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width - 10, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Axes
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, 10);
    ctx.lineTo(40, height - 25);
    ctx.lineTo(width - 10, height - 25);
    ctx.stroke();

    // Time labels (0, 4, 8, 12, 16, 20, 24h)
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 6; i++) {
      const x = 40 + i * ((width - 50) / 6);
      ctx.fillText(`${i * 4}h`, x, height - 10);
    }

    // Y axis label
    ctx.save();
    ctx.translate(12, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('C(t) mg/L', 0, 0);
    ctx.restore();

    // Simulation params
    const ka = 1.2; // absorption rate constant (/h)
    const keBaseline = 0.18; // elimination rate constant (/h)
    // Elimination rate in presence of inhibitor slows down proportional to 1/AUCR (for non-prodrug)
    const keInhibited = isProdrug ? keBaseline : Math.max(0.02, keBaseline / Math.max(1, aucRatio));

    // Toxic threshold line (at 70% height)
    const toxicY = height - 25 - (height - 40) * 0.75;
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, toxicY);
    ctx.lineTo(width - 10, toxicY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f43f5e';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('TOXICITY THRESHOLD', width - 15, toxicY - 4);

    const plotWidth = width - 50;
    const plotHeight = height - 45;
    const steps = 120;

    // Helper to calculate one-compartment oral absorption model: C(t) = A * (exp(-ke*t) - exp(-ka*t))
    const calcConc = (t: number, ke: number, scale: number) => {
      if (t <= 0) return 0;
      return scale * (Math.exp(-ke * t) - Math.exp(-ka * t));
    };

    // Baseline curve (Cyan)
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 24;
      const c = calcConc(t, keBaseline, 2.2);
      const x = 40 + (t / 24) * plotWidth;
      const y = height - 25 - (c / 3.0) * plotHeight;
      if (i === 0) ctx.moveTo(x, Math.max(10, y));
      else ctx.lineTo(x, Math.max(10, y));
    }
    ctx.stroke();

    // Inhibited curve (Rose or Diminished Purple for Prodrug)
    ctx.strokeStyle = isProdrug ? '#a855f7' : '#f43f5e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const inhibitedScale = isProdrug ? 2.2 * aucRatio : 2.2 * Math.min(2.5, 0.8 + 0.2 * aucRatio);
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 24;
      const c = calcConc(t, keInhibited, inhibitedScale);
      const x = 40 + (t / 24) * plotWidth;
      const y = height - 25 - (c / 3.0) * plotHeight;
      if (i === 0) ctx.moveTo(x, Math.max(10, y));
      else ctx.lineTo(x, Math.max(10, y));
    }
    ctx.stroke();
  }
}
