import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RenalClearanceService, IRenalDosingGuideline } from '../../services/renal-clearance.service';

@Component({
  selector: 'app-renal-clearance-titration-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-5 rounded-3xl bg-zinc-950/95 border border-cyan-500/30 text-zinc-100 shadow-2xl font-mono backdrop-blur-xl space-y-6 mb-6">
      
      <!-- Card Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl text-cyan-400">
            🫘
          </div>
          <div>
            <h3 class="text-sm font-extrabold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <span>Renal Clearance & Drug Dosing Titration Engine (Model P5)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              CKD-EPI 2021 Race-Free eGFR • Cockcroft-Gault CrCl • KDIGO AKI Surveillance
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          @if (renal.akiRiskFlag()) {
            <span class="text-xs px-3 py-1 rounded-full font-extrabold bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse flex items-center gap-1.5">
              <span>🚨</span>
              <span>{{ renal.akiStage() }} ACTIVE</span>
            </span>
          } @else {
            <span class="text-xs px-3 py-1 rounded-full font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <span>🛡️</span>
              <span>Renal Function Stable</span>
            </span>
          }
          <span class="text-xs px-3 py-1 rounded-full font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            CKD {{ renal.ckdStage() }}
          </span>
        </div>
      </div>

      <!-- Core Nephrology Telemetry Dials -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        
        <!-- eGFR CKD-EPI 2021 -->
        <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span class="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">eGFR (CKD-EPI 2021)</span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl font-black font-sans"
                  [ngClass]="{
                    'text-emerald-400': renal.egfrCkdEpi() >= 60,
                    'text-amber-400': renal.egfrCkdEpi() >= 30 && renal.egfrCkdEpi() < 60,
                    'text-red-400': renal.egfrCkdEpi() < 30
                  }">
              {{ renal.egfrCkdEpi() }}
            </span>
            <span class="text-[10px] text-zinc-400">mL/min/1.73m²</span>
          </div>
          <span class="text-[10px] text-zinc-400 block font-sans">
            Stage {{ renal.ckdStage() }} ({{ getCkdDescription(renal.ckdStage()) }})
          </span>
        </div>

        <!-- Cockcroft-Gault CrCl -->
        <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span class="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">CrCl (Cockcroft-Gault)</span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl font-black font-sans text-cyan-400">
              {{ renal.crClCockcroftGault() }}
            </span>
            <span class="text-[10px] text-zinc-400">mL/min</span>
          </div>
          <span class="text-[10px] text-zinc-400 block font-sans">
            {{ renal.cockcroftGaultResult().isObese ? 'Adjusted for Obesity (BMI >= 30)' : 'Actual Body Weight Basis' }}
          </span>
        </div>

        <!-- Serum Creatinine & Baseline -->
        <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div class="flex justify-between items-center">
            <span class="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Serum Creatinine</span>
            <span class="text-[10px] text-zinc-400 font-mono">Base: {{ renal.baselineCreatinine() }}</span>
          </div>
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl font-black font-sans"
                  [ngClass]="renal.serumCreatinine() >= 1.5 ? 'text-amber-400' : 'text-zinc-100'">
              {{ renal.serumCreatinine() }}
            </span>
            <span class="text-[10px] text-zinc-400">mg/dL</span>
          </div>
          <span class="text-[10px] text-zinc-400 block font-sans">
            ΔSCr: +{{ (renal.serumCreatinine() - renal.baselineCreatinine()).toFixed(2) }} mg/dL ({{ (renal.serumCreatinine() / renal.baselineCreatinine()).toFixed(2) }}x)
          </span>
        </div>

        <!-- Urine Output Diuresis -->
        <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span class="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Urine Output Kinetics</span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl font-black font-sans"
                  [class.text-emerald-400]="renal.urineOutputMlKgHr() >= 0.5"
                  [class.text-red-400]="renal.urineOutputMlKgHr() < 0.5">
              {{ renal.urineOutputMlKgHr() }}
            </span>
            <span class="text-[10px] text-zinc-400">mL/kg/hr</span>
          </div>
          <span class="text-[10px] block font-sans"
                [class.text-emerald-400]="renal.urineOutputMlKgHr() >= 0.5"
                [class.text-red-400]="renal.urineOutputMlKgHr() < 0.5">
            {{ renal.urineOutputMlKgHr() >= 0.5 ? 'Normal Perfusion' : 'Oliguric Stress (< 0.5)' }}
          </span>
        </div>

      </div>

      <!-- Acute Kidney Injury (KDIGO) Alert Banner -->
      @if (renal.akiRiskFlag()) {
        <div class="p-4 rounded-2xl bg-red-950/30 border border-red-500/50 space-y-2">
          <div class="flex items-center gap-2 text-red-300 font-bold text-xs uppercase">
            <span>⚠️</span>
            <span>KDIGO Acute Kidney Injury Warning: {{ renal.akiStage() }}</span>
          </div>
          <p class="text-xs text-red-200 font-sans leading-relaxed">
            {{ renal.akiAssessment().rationale }}
          </p>
          <div class="text-[11px] text-red-300 font-sans pt-1 border-t border-red-500/30 flex items-center justify-between">
            <span>Action: Immediate nephrology review; hold nephrotoxic agents (NSAIDs, ACEi/ARBs, Aminoglycosides).</span>
            <span class="font-bold underline cursor-pointer" (click)="resetBaseline()">Acknowledge &amp; Reset</span>
          </div>
        </div>
      }

      <!-- Interactive Clinical Scenario Simulation Bar -->
      <div class="p-3.5 bg-zinc-900/60 rounded-2xl border border-zinc-800 space-y-2 text-xs">
        <div class="flex items-center justify-between">
          <span class="font-bold text-cyan-400 uppercase text-[10px] flex items-center gap-1.5">
            <span>🧪</span> Kinetic Stress Simulation (Test Creatinine Spikes)
          </span>
          <span class="text-[10px] text-zinc-500">Fast In Silico Clearance Testing</span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button (click)="simulateScenario('normal')" type="button"
                  class="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition cursor-pointer">
            Standard (0.9 mg/dL)
          </button>
          <button (click)="simulateScenario('stage1_aki')" type="button"
                  class="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs transition cursor-pointer">
            Contrast Spike (+0.4 → 1.3 mg/dL)
          </button>
          <button (click)="simulateScenario('sepsis_aki')" type="button"
                  class="px-2.5 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs transition cursor-pointer">
            Septic AKI (2.8 mg/dL)
          </button>
          <button (click)="simulateScenario('ckd4_severe')" type="button"
                  class="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs transition cursor-pointer">
            Severe CKD G4/5 (3.6 mg/dL)
          </button>
        </div>
      </div>

      <!-- Renal Medication Posology & Deprescribing Table -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <span>💊</span> Renally Cleared Medication Titration & Deprescribing Guard
          </span>
          <span class="text-[10px] text-zinc-500">
            {{ renal.dosingTitrations().length }} Audited Medications • {{ renal.highRiskMedicationsCount() }} Requiring Adjustment
          </span>
        </div>

        <div class="space-y-3 text-xs">
          @for (item of renal.dosingTitrations(); track item.drugName) {
            <div class="p-3.5 rounded-2xl bg-zinc-900 border space-y-2"
                 [ngClass]="{
                   'border-red-500/50 bg-red-950/20': item.actionRequired === 'contraindicated',
                   'border-amber-500/40 bg-amber-950/20': item.actionRequired === 'dose_reduction',
                   'border-zinc-800': item.actionRequired === 'standard'
                 }">
              
              <!-- Card Header -->
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="font-extrabold text-white text-xs">{{ item.drugName }}</span>
                  <span class="text-[10px] text-zinc-400 font-sans">({{ item.drugClass }})</span>
                  @if (item.fdaBlackBoxWarning) {
                    <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-red-600 text-white animate-pulse">
                      BLACK BOX
                    </span>
                  }
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-[9px] font-mono text-zinc-400">Renal Clearance: {{ item.renalClearancePercent }}%</span>
                  <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                        [ngClass]="{
                          'bg-red-500/20 text-red-300 border border-red-500/40': item.actionRequired === 'contraindicated',
                          'bg-amber-500/20 text-amber-300 border border-amber-500/40': item.actionRequired === 'dose_reduction',
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40': item.actionRequired === 'standard'
                        }">
                    {{ item.actionRequired === 'contraindicated' ? 'CONTRAINDICATED' : (item.actionRequired === 'dose_reduction' ? 'DOSE ADJUSTMENT' : 'STANDARD DOSE') }}
                  </span>
                </div>
              </div>

              <!-- Titration Directive -->
              <div class="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                <span class="text-[10px] font-bold uppercase text-cyan-400 block tracking-wider">
                  Recommended Posology Directive:
                </span>
                <p class="text-xs font-semibold text-zinc-100 font-sans">
                  {{ item.recommendedDosage }}
                </p>
              </div>

              <!-- Clinical Pharmacology Rationale -->
              <p class="text-[11px] text-zinc-300 font-sans leading-relaxed">
                {{ item.clinicalRationale }}
              </p>
            </div>
          }
        </div>
      </div>

    </div>
  `
})
export class RenalClearanceTitrationCardComponent {
  readonly renal = inject(RenalClearanceService);

  getCkdDescription(stage: string): string {
    switch (stage) {
      case 'G1': return 'Normal/High Function';
      case 'G2': return 'Mild Reduction';
      case 'G3a': return 'Mild-Moderate CKD';
      case 'G3b': return 'Moderate-Severe CKD';
      case 'G4': return 'Severe Impairment';
      case 'G5': return 'Kidney Failure (ESRD)';
      default: return 'Assessing';
    }
  }

  simulateScenario(scenario: 'normal' | 'stage1_aki' | 'sepsis_aki' | 'ckd4_severe') {
    switch (scenario) {
      case 'normal':
        this.renal.setCreatinine(0.9, 0.9);
        break;
      case 'stage1_aki':
        this.renal.setCreatinine(1.3, 0.9);
        break;
      case 'sepsis_aki':
        this.renal.setCreatinine(2.8, 0.9);
        break;
      case 'ckd4_severe':
        this.renal.setCreatinine(3.6, 2.0);
        break;
    }
  }

  resetBaseline() {
    this.renal.setCreatinine(0.9, 0.9);
  }
}
