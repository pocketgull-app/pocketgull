import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcidBaseStewartService } from '../../services/acid-base-stewart.service';

@Component({
  selector: 'app-acid-base-stewart-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-5 rounded-3xl bg-zinc-950/95 border border-emerald-500/30 text-zinc-100 shadow-2xl font-mono backdrop-blur-xl space-y-6 mb-6">
      
      <!-- Card Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl text-emerald-400">
            🧪
          </div>
          <div>
            <h3 class="text-sm font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <span>Acid-Base Stewart Physico-Chemical & Electrolyte Engine (Model P7)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              Quantitative Stewart SID • Albumin-Corrected Anion Gap & Δ-Δ Ratio • Winter's Compensation • IV Fluid Prescription
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Primary Disorder Badge -->
          <span class="text-xs px-3 py-1 rounded-full font-extrabold border"
                [ngClass]="{
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40': stewart.primaryDisorder() === 'Normal Acid-Base Homeostasis',
                  'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse': stewart.primaryDisorder().includes('HAGMA'),
                  'bg-amber-500/20 text-amber-300 border-amber-500/40': stewart.primaryDisorder().includes('NAGMA') || stewart.primaryDisorder().includes('Alkalosis'),
                  'bg-purple-500/20 text-purple-300 border-purple-500/40': stewart.primaryDisorder().includes('Mixed')
                }">
            {{ stewart.primaryDisorder() }}
          </span>

          <!-- Hyperkalemia Alert -->
          @if (stewart.hyperkalemiaPlan().severity !== 'Normal (3.5 - 5.0)') {
            <span class="text-xs px-3 py-1 rounded-full font-extrabold bg-red-600 text-white animate-pulse flex items-center gap-1">
              <span>⚡</span>
              <span>K+ {{ stewart.potassium() }} ({{ stewart.hyperkalemiaPlan().severity }})</span>
            </span>
          }

          <!-- Hyperchloremic Acidosis Warning -->
          @if (stewart.stewartParameters().hyperchloremicAcidosisRisk) {
            <span class="text-xs px-3 py-1 rounded-full font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
              <span>⚠️</span>
              <span>Hyperchloremia Risk (Cl: {{ stewart.chloride() }})</span>
            </span>
          }
        </div>
      </div>

      <!-- Core Acid-Base Telemetry Dials (4-Column Grid) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        
        <!-- pH & Arterial Blood Gas -->
        <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span class="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Arterial pH & pCO₂</span>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-black font-sans"
                  [ngClass]="{
                    'text-emerald-400': stewart.ph() >= 7.35 && stewart.ph() <= 7.45,
                    'text-amber-400': stewart.ph() > 7.45,
                    'text-red-400': stewart.ph() < 7.35
                  }">
              {{ stewart.ph() }}
            </span>
            <span class="text-[11px] text-zinc-400 font-mono">pCO₂: {{ stewart.pco2() }} mmHg</span>
          </div>
          <span class="text-[10px] text-zinc-400 block font-sans">
            HCO₃⁻: {{ stewart.bicarbonate() }} mEq/L
          </span>
        </div>

        <!-- Anion Gap & Delta-Delta -->
        <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div class="flex justify-between items-center">
            <span class="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Corrected Anion Gap</span>
            <span class="text-[10px] text-zinc-400 font-mono">Obs: {{ stewart.observedAnionGap() }}</span>
          </div>
          <div class="flex items-baseline gap-1.5">
            <span class="text-2xl font-black font-sans"
                  [ngClass]="stewart.correctedAnionGap() > 12 ? 'text-red-400' : 'text-emerald-400'">
              {{ stewart.correctedAnionGap() }}
            </span>
            <span class="text-[10px] text-zinc-400">mEq/L (Alb-Adj)</span>
          </div>
          <span class="text-[10px] text-zinc-400 block font-sans truncate">
            Δ/Δ: {{ stewart.deltaRatioResult().deltaRatio }} ({{ stewart.deltaRatioResult().interpretation }})
          </span>
        </div>

        <!-- Stewart Physico-Chemical SID & SIG -->
        <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div class="flex justify-between items-center">
            <span class="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Stewart SID & SIG</span>
            <span class="text-[10px] text-zinc-400 font-mono">Atot: {{ stewart.stewartParameters().atot }}</span>
          </div>
          <div class="flex items-baseline gap-2">
            <div>
              <span class="text-xl font-black font-sans text-cyan-400">{{ stewart.stewartParameters().sida }}</span>
              <span class="text-[9px] text-zinc-400 ml-0.5">SIDa</span>
            </div>
            <div>
              <span class="text-xl font-black font-sans"
                    [ngClass]="stewart.stewartParameters().sig > 2.0 ? 'text-amber-400' : 'text-zinc-200'">
                {{ stewart.stewartParameters().sig }}
              </span>
              <span class="text-[9px] text-zinc-400 ml-0.5">SIG</span>
            </div>
          </div>
          <span class="text-[10px] text-zinc-400 block font-sans">
            {{ stewart.stewartParameters().unmeasuredAnionsPresent ? 'Unmeasured Anions Detected (SIG > 2)' : 'Normal Electrochemical Balance' }}
          </span>
        </div>

        <!-- Electrolyte Baseline Panel -->
        <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span class="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Electrolytes & Weak Acids</span>
          <div class="text-[11px] font-mono grid grid-cols-2 gap-1 text-zinc-300">
            <span>Na⁺: <strong class="text-white">{{ stewart.sodium() }}</strong></span>
            <span>K⁺: <strong [class.text-red-400]="stewart.potassium() >= 5.5">{{ stewart.potassium() }}</strong></span>
            <span>Cl⁻: <strong [class.text-amber-400]="stewart.chloride() > 106">{{ stewart.chloride() }}</strong></span>
            <span>Lactate: <strong>{{ stewart.lactate() }}</strong></span>
          </div>
          <span class="text-[10px] text-zinc-400 block font-sans">
            Albumin: {{ stewart.albumin() }} g/dL • Phos: {{ stewart.phosphate() }} mg/dL
          </span>
        </div>
      </div>

      <!-- Winter's Formula Respiratory Compensation Strip (if metabolic acidosis) -->
      @if (stewart.wintersCompensation(); as comp) {
        <div class="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="text-cyan-400 font-bold">🌬️ Winter's Formula Check:</span>
            <span class="text-zinc-300 font-sans">
              Expected pCO₂: <strong>{{ comp.expectedPco2Min }} – {{ comp.expectedPco2Max }} mmHg</strong> (Measured: {{ comp.measuredPco2 }} mmHg)
            </span>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                [ngClass]="{
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40': comp.respiratoryStatus === 'Adequate Compensation',
                  'bg-red-500/20 text-red-300 border-red-500/50': comp.respiratoryStatus.includes('Acidosis'),
                  'bg-amber-500/20 text-amber-300 border-amber-500/40': comp.respiratoryStatus.includes('Alkalosis')
                }">
            {{ comp.respiratoryStatus }}
          </span>
        </div>
      }

      <!-- IV Fluid Prescription Guidance (SMART & SALT-ED Evidence) -->
      <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 text-xs">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-emerald-400 font-bold">💧 Resuscitation & Maintenance Fluid Order Guidance</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              SMART / SALT-ED Standard
            </span>
          </div>
          <span class="text-[11px] font-bold"
                [ngClass]="stewart.fluidGuideline().renalPerfusionImpact.includes('Renoprotective') ? 'text-emerald-400' : 'text-amber-400'">
            {{ stewart.fluidGuideline().renalPerfusionImpact }}
          </span>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 font-sans">
          <div>
            <span class="text-zinc-400 block text-[11px]">Recommended Solution:</span>
            <strong class="text-zinc-100 font-mono text-xs">{{ stewart.fluidGuideline().preferredFluid }}</strong>
          </div>
          <div class="text-right sm:text-right font-mono text-[11px] text-zinc-400">
            <span>Cl⁻ Content: <strong>{{ stewart.fluidGuideline().chlorideContentMeqL }} mEq/L</strong></span>
            <span class="ml-2">Fluid SID: <strong>{{ stewart.fluidGuideline().fluidSid }} mEq/L</strong></span>
          </div>
        </div>
        <p class="text-[11px] text-zinc-400 font-sans leading-relaxed pt-1 border-t border-zinc-800/60">
          <strong class="text-zinc-300 font-mono">Rationale:</strong> {{ stewart.fluidGuideline().clinicalRationale }}
        </p>
      </div>

      <!-- Hyperkalemia Protocol Action Card (if K >= 5.1) -->
      @if (stewart.hyperkalemiaPlan().severity !== 'Normal (3.5 - 5.0)') {
        <div class="p-4 rounded-2xl bg-red-950/30 border border-red-500/50 space-y-3 text-xs">
          <div class="flex items-center justify-between border-b border-red-500/30 pb-2">
            <h4 class="font-extrabold uppercase tracking-wider text-red-300 flex items-center gap-1.5">
              <span>🚨 Hyperkalemia Emergency Action Plan</span>
              <span class="px-2 py-0.5 rounded bg-red-600 text-white text-[10px]">
                {{ stewart.hyperkalemiaPlan().severity }}
              </span>
            </h4>
            <span class="text-[10px] text-red-400 font-sans font-bold">STAT Bedside Action Required</span>
          </div>

          <div class="space-y-1.5 font-sans">
            @for (order of stewart.hyperkalemiaPlan().orders; track $index) {
              <div class="p-2 rounded-xl bg-black/40 border border-red-900/60 text-zinc-200 text-[11px] flex items-start gap-2">
                <span class="text-red-400 font-bold font-mono text-xs">#{{ $index + 1 }}</span>
                <span>{{ order }}</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Interactive Scenario Simulation Controller -->
      <div class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <span>⚡ Clinical Simulation Scenarios</span>
          </span>
          <span class="text-[11px] text-zinc-500 font-sans">
            Recalibrate Stewart SID, corrected anion gap, and fluid orders instantly
          </span>
        </div>

        <div class="flex flex-wrap gap-2">
          <button (click)="simulateScenario('normal_homeostasis')"
                  class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer">
            Normal Homeostasis
          </button>
          <button (click)="simulateScenario('dka_hagma')"
                  class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-red-300 border border-red-500/30 transition-all cursor-pointer">
            DKA (Severe HAGMA)
          </button>
          <button (click)="simulateScenario('saline_hyperchloremic_nagma')"
                  class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-amber-300 border border-amber-500/30 transition-all cursor-pointer">
            Normal Saline Hyperchloremia
          </button>
          <button (click)="simulateScenario('triple_mixed_disorder')"
                  class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-purple-300 border border-purple-500/30 transition-all cursor-pointer">
            Triple Mixed Disorder
          </button>
          <button (click)="simulateScenario('severe_hyperkalemia_emergency')"
                  class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-rose-300 border border-rose-500/30 transition-all cursor-pointer">
            Hyperkalemia Emergency
          </button>
          <button (click)="resetBaseline()"
                  class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-400 border border-zinc-700 transition-all cursor-pointer ml-auto">
            Reset Labs
          </button>
        </div>
      </div>

    </div>
  `
})
export class AcidBaseStewartCardComponent {
  readonly stewart = inject(AcidBaseStewartService);

  public simulateScenario(
    scenario: 'normal_homeostasis' | 'dka_hagma' | 'saline_hyperchloremic_nagma' | 'triple_mixed_disorder' | 'severe_hyperkalemia_emergency'
  ) {
    this.stewart.simulateScenario(scenario);
  }

  public resetBaseline() {
    this.stewart.setLabs(7.40, 40.0, 140.0, 4.0, 102.0, 24.0, 1.0, 4.0, 3.5);
  }
}
