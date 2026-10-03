import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KdigoAkiPhenotyperService } from '../../services/kdigo-aki-phenotyper.service';

@Component({
  selector: 'app-kdigo-aki-phenotyper-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full bg-zinc-950 font-mono text-zinc-100 rounded-3xl border border-cyan-500/30 overflow-hidden shadow-2xl relative mb-6">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 gap-3 z-20 shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)] animate-pulse"></span>
          <div>
            <h3 class="text-xs sm:text-sm font-black uppercase text-zinc-100 flex items-center gap-2">
              <span>💧</span>
              <span>Renal Glomerular Filtration & KDIGO AKI Phenotyper (Clinical Model P9)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              CKD-EPI 2021 Race-Free Composite (Cr + CysC) • Dynamic KDIGO Staging Matrix • Furosemide Stress Test (FST) • FE_Na & FE_Urea
            </p>
          </div>
        </div>

        <!-- Master Staging Badge -->
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md"
                [ngClass]="{
                  'bg-emerald-950/80 border-emerald-600/60 text-emerald-300': service.akiAssessment().stageNumeric === 0,
                  'bg-amber-950/80 border-amber-600/60 text-amber-300': service.akiAssessment().stageNumeric === 1,
                  'bg-orange-950/80 border-orange-600/60 text-orange-300': service.akiAssessment().stageNumeric === 2,
                  'bg-red-950/80 border-red-600/60 text-red-300 animate-pulse': service.akiAssessment().stageNumeric === 3
                }">
            {{ service.akiAssessment().currentStage }}
          </span>
        </div>
      </div>

      <!-- Clinical Presets Toolbar -->
      <div class="flex flex-wrap items-center gap-1.5 p-3 bg-zinc-900/60 border-b border-zinc-850 text-xs">
        <span class="text-[10px] font-bold text-zinc-400 uppercase mr-1">Presets:</span>
        <button type="button" (click)="applyPreset('homeostasis')"
                class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition cursor-pointer">
          🟢 Healthy Baseline
        </button>
        <button type="button" (click)="applyPreset('prerenal_dehydration')"
                class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition cursor-pointer">
          💧 Prerenal Azotemia
        </button>
        <button type="button" (click)="applyPreset('atn_septic_shock')"
                class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition cursor-pointer">
          🧪 Sepsis ATN
        </button>
        <button type="button" (click)="applyPreset('sarcopenic_elderly')"
                class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition cursor-pointer">
          👵 Sarcopenic Elderly
        </button>
        <button type="button" (click)="applyPreset('fst_non_responder')"
                class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition cursor-pointer">
          🚨 FST Non-Responder
        </button>
      </div>

      <!-- Sarcopenia Discrepancy Alert Banner -->
      @if (service.gfrReport().sarcopeniaWarning) {
        <div class="p-3 bg-amber-500/15 border-b border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5 px-4">
          <span class="text-base">⚠️</span>
          <span>
            <strong>Sarcopenia Discrepancy Alert:</strong> Serum Creatinine ({{ service.serumCreatinine() }} mg/dL, eGFR {{ service.gfrReport().egfrCreatinine }}) overestimates renal reserve due to muscle wasting. Cystatin C eGFR is {{ service.gfrReport().egfrCystatinC }} mL/min/1.73m2. Gold Standard Composite eGFR: <strong>{{ service.gfrReport().egfrComposite }} mL/min/1.73m2</strong>.
          </span>
        </div>
      }

      <!-- 4-Pillar Clinical Grid -->
      <div class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        
        <!-- Pillar 1: Glomerular Filtration -->
        <div class="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2">
              <span class="text-[10px] uppercase font-bold text-cyan-400">1. Glomerular Filtration</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold">
                CKD {{ service.gfrReport().ckdStage }}
              </span>
            </div>
            
            <div class="space-y-1.5">
              <div class="flex justify-between items-baseline">
                <span class="text-zinc-400">Composite eGFR:</span>
                <span class="text-base font-black text-cyan-300 font-sans">{{ service.gfrReport().egfrComposite }} <span class="text-[10px] font-mono text-zinc-500">mL/min</span></span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-zinc-500">Creatinine eGFR:</span>
                <span class="text-zinc-300 font-mono">{{ service.gfrReport().egfrCreatinine }}</span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-zinc-500">Cystatin C eGFR:</span>
                <span class="text-zinc-300 font-mono">{{ service.gfrReport().egfrCystatinC }}</span>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400">
            <span>Tier: </span><strong class="text-zinc-300">{{ service.gfrReport().confidenceTier }}</strong>
          </div>
        </div>

        <!-- Pillar 2: KDIGO Dynamic Staging -->
        <div class="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2">
              <span class="text-[10px] uppercase font-bold text-amber-400">2. KDIGO Staging Matrix</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-bold"
                    [ngClass]="service.akiAssessment().isRrtIndicated ? 'bg-red-950 text-red-300 border border-red-800/60' : 'bg-zinc-800 text-zinc-300'">
                {{ service.akiAssessment().isRrtIndicated ? 'RRT Indicated' : 'Non-Dialysis' }}
              </span>
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-baseline">
                <span class="text-zinc-400">Cr Jump Ratio:</span>
                <span class="text-base font-black font-sans"
                      [ngClass]="service.akiAssessment().creatinineRatio >= 2.0 ? 'text-red-400' : (service.akiAssessment().creatinineRatio >= 1.5 ? 'text-amber-400' : 'text-emerald-400')">
                  {{ service.akiAssessment().creatinineRatio }}x <span class="text-[10px] font-mono text-zinc-500">baseline</span>
                </span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-zinc-500">48h Absolute Rise:</span>
                <span class="text-zinc-300 font-mono">+{{ service.akiAssessment().creatinineDelta48h }} mg/dL</span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-zinc-500">Oliguria Duration:</span>
                <span class="text-zinc-300 font-mono">{{ service.oliguriaDurationHours() }}h ({{ service.urineOutputMlKgHr() }} mL/kg/h)</span>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400 truncate">
            <span>{{ service.akiAssessment().stagingRationale }}</span>
          </div>
        </div>

        <!-- Pillar 3: Furosemide Stress Test (FST) -->
        <div class="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2">
              <span class="text-[10px] uppercase font-bold text-rose-400">3. Furosemide Stress Test</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-bold"
                    [ngClass]="service.fstReport().category.includes('Non-Responder') ? 'bg-red-950 text-red-300 border border-red-800/60' : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'">
                {{ service.fstReport().urineVolume2hMl }} mL / 2h
              </span>
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-baseline">
                <span class="text-zinc-400">Stage 3 Hazard:</span>
                <span class="text-base font-black font-sans"
                      [ngClass]="service.fstReport().progressionToStage3RiskPercent > 50 ? 'text-red-400' : 'text-emerald-400'">
                  {{ service.fstReport().progressionToStage3RiskPercent }}%
                </span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-zinc-500">RRT Need Risk:</span>
                <span class="text-zinc-300 font-mono">{{ service.fstReport().rrtNeedRiskPercent }}%</span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-zinc-500">FST Category:</span>
                <span class="text-zinc-300 font-mono truncate max-w-[130px]">{{ service.fstReport().category }}</span>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400 line-clamp-1">
            <span>{{ service.fstReport().clinicalActionDirective }}</span>
          </div>
        </div>

        <!-- Pillar 4: Urinary Excretion Phenotype -->
        <div class="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2">
              <span class="text-[10px] uppercase font-bold text-teal-400">4. Excretion Phenotype</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold">
                {{ service.isLoopDiureticActive() ? 'Diuretic Active' : 'No Diuretic' }}
              </span>
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-baseline">
                <span class="text-zinc-400">FE_Na / FE_Urea:</span>
                <span class="text-base font-black font-sans text-teal-300">
                  {{ service.excretionPhenotype().feNaPercent ?? 'N/A' }}% / {{ service.excretionPhenotype().feUreaPercent ?? 'N/A' }}%
                </span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-zinc-500">BUN / Cr Ratio:</span>
                <span class="text-zinc-300 font-mono">{{ service.excretionPhenotype().bunCreatinineRatio }}:1</span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-zinc-500">Urine Osmolality:</span>
                <span class="text-zinc-300 font-mono">{{ service.urineOsmolality() }} mOsm/kg</span>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-300 truncate">
            <span>{{ service.excretionPhenotype().etiology }}</span>
          </div>
        </div>
      </div>

      <!-- Real-Time Interactive Clinical Slider Deck -->
      <div class="p-4 bg-zinc-900/90 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <!-- Serum Creatinine Slider -->
        <div class="space-y-1">
          <div class="flex justify-between text-[11px]">
            <span class="text-zinc-400 font-bold uppercase">Serum Creatinine</span>
            <span class="text-cyan-400 font-mono font-bold">{{ service.serumCreatinine() }} mg/dL</span>
          </div>
          <input type="range" min="0.5" max="5.0" step="0.05" [value]="service.serumCreatinine()"
                 (input)="onCrChange($event)" class="w-full accent-cyan-400 cursor-pointer" />
        </div>

        <!-- Serum Cystatin C Slider -->
        <div class="space-y-1">
          <div class="flex justify-between text-[11px]">
            <span class="text-zinc-400 font-bold uppercase">Serum Cystatin C</span>
            <span class="text-cyan-400 font-mono font-bold">{{ service.serumCystatinC() }} mg/L</span>
          </div>
          <input type="range" min="0.5" max="4.0" step="0.05" [value]="service.serumCystatinC()"
                 (input)="onCysChange($event)" class="w-full accent-cyan-400 cursor-pointer" />
        </div>

        <!-- Urine Output Slider -->
        <div class="space-y-1">
          <div class="flex justify-between text-[11px]">
            <span class="text-zinc-400 font-bold uppercase">Urine Output Velocity</span>
            <span class="text-cyan-400 font-mono font-bold">{{ service.urineOutputMlKgHr() }} mL/kg/h</span>
          </div>
          <input type="range" min="0.05" max="1.8" step="0.05" [value]="service.urineOutputMlKgHr()"
                 (input)="onUoChange($event)" class="w-full accent-cyan-400 cursor-pointer" />
        </div>

        <!-- FST 2h Output Slider -->
        <div class="space-y-1">
          <div class="flex justify-between text-[11px]">
            <span class="text-zinc-400 font-bold uppercase">FST 2-Hour Response</span>
            <span class="text-cyan-400 font-mono font-bold">{{ service.fstUrineVolume2hMl() }} mL</span>
          </div>
          <input type="range" min="10" max="600" step="10" [value]="service.fstUrineVolume2hMl()"
                 (input)="onFstChange($event)" class="w-full accent-cyan-400 cursor-pointer" />
        </div>
      </div>
    </div>
  `
})
export class KdigoAkiPhenotyperCardComponent {
  service = inject(KdigoAkiPhenotyperService);

  public applyPreset(preset: 'homeostasis' | 'prerenal_dehydration' | 'atn_septic_shock' | 'sarcopenic_elderly' | 'fst_non_responder'): void {
    this.service.applyPreset(preset);
  }

  public onCrChange(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.service.serumCreatinine.set(val);
  }

  public onCysChange(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.service.serumCystatinC.set(val);
  }

  public onUoChange(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.service.urineOutputMlKgHr.set(val);
  }

  public onFstChange(e: Event): void {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    this.service.fstUrineVolume2hMl.set(val);
  }
}
