import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SepsisShockSofaService, ISepsisPatientInputs } from '../../services/sepsis-shock-sofa.service';

@Component({
  selector: 'app-sepsis-shock-sofa-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-5 rounded-3xl bg-zinc-950/95 border border-rose-500/30 text-zinc-100 shadow-2xl font-mono backdrop-blur-xl space-y-6 mb-6">
      
      <!-- Card Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-xl text-rose-400">
            🩸
          </div>
          <div>
            <h3 class="text-sm font-extrabold uppercase tracking-widest text-rose-400 flex items-center gap-2">
              <span>Sepsis Microvascular Shock &amp; SOFA-2 Phenotyper (Clinical Model P8)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              Sepsis-3 Criteria (qSOFA &amp; ΔSOFA) • ANDROMEDA-SHOCK Microvascular Perfusion • Vasopressor Sparing Protocol
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Diagnosis Category Badge -->
          <span class="text-xs px-3 py-1 rounded-full font-extrabold border"
                [ngClass]="{
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40': sepsis.diagnosis().category === 'Non-Septic Infection / Homeostasis',
                  'bg-amber-500/20 text-amber-300 border-amber-500/40': sepsis.diagnosis().category === 'Sepsis (Organ Dysfunction Present)',
                  'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse': sepsis.diagnosis().category.includes('Septic Shock')
                }">
            {{ sepsis.diagnosis().category }}
          </span>

          <!-- qSOFA Bedside Badge -->
          <span class="text-xs px-2.5 py-1 rounded-full font-bold border"
                [ngClass]="sepsis.qsofa().isPositive ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-zinc-800 text-zinc-400 border-zinc-700'">
            qSOFA {{ sepsis.qsofa().score }}/3 {{ sepsis.qsofa().isPositive ? '(Positive Screen)' : '' }}
          </span>

          <!-- Delta SOFA Badge -->
          <span class="text-xs px-2.5 py-1 rounded-full font-bold border"
                [ngClass]="sepsis.sofa().deltaSofa >= 2 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-zinc-800 text-zinc-400 border-zinc-700'">
            ΔSOFA: +{{ sepsis.sofa().deltaSofa }} (Total: {{ sepsis.sofa().totalSofa }})
          </span>
        </div>
      </div>

      <!-- Core Telemetry Grid (4-Column Layout) -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        
        <!-- Dial 1: Total SOFA & Estimated Mortality -->
        <div class="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-1">
          <span class="text-zinc-400 text-[10px] uppercase font-bold">SOFA Organ Failure</span>
          <div class="text-xl font-black font-sans flex items-baseline gap-1"
               [ngClass]="sepsis.sofa().totalSofa >= 12 ? 'text-red-400' : (sepsis.sofa().totalSofa >= 6 ? 'text-amber-400' : 'text-emerald-400')">
            {{ sepsis.sofa().totalSofa }}
            <span class="text-[11px] font-normal text-zinc-400">/ 24</span>
          </div>
          <div class="text-[10px] text-zinc-400">
            Est. Mortality: <strong class="text-zinc-200">{{ sepsis.diagnosis().mortalityEstimatePercent }}%</strong>
          </div>
        </div>

        <!-- Dial 2: Capillary Refill Time (ANDROMEDA-SHOCK) -->
        <div class="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-1">
          <span class="text-zinc-400 text-[10px] uppercase font-bold">Capillary Refill (CRT)</span>
          <div class="text-xl font-black font-sans"
               [ngClass]="sepsis.microvascular().isCrtNormal ? 'text-emerald-400' : 'text-rose-400'">
            {{ sepsis.inputs().capillaryRefillTimeSec }} s
          </div>
          <div class="text-[10px]"
               [ngClass]="sepsis.microvascular().isCrtNormal ? 'text-emerald-400' : 'text-rose-400'">
            {{ sepsis.microvascular().isCrtNormal ? 'Pristine (<= 3.0s)' : 'Impaired Microcirculation' }}
          </div>
        </div>

        <!-- Dial 3: Lactate Clearance Velocity -->
        <div class="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-1">
          <span class="text-zinc-400 text-[10px] uppercase font-bold">Lactate Clearance (2h)</span>
          <div class="text-xl font-black font-sans"
               [ngClass]="sepsis.microvascular().isLactateClearanceAdequate ? 'text-teal-300' : 'text-amber-400'">
            {{ sepsis.microvascular().lactateClearancePercent }}%
          </div>
          <div class="text-[10px] text-zinc-400">
            Target &ge; 20% (Now: {{ sepsis.inputs().serumLactateCurrentMmolL }} mmol/L)
          </div>
        </div>

        <!-- Dial 4: Vasopressor Sparing Tier -->
        <div class="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-1">
          <span class="text-zinc-400 text-[10px] uppercase font-bold">Vasopressor Tier</span>
          <div class="text-xs font-bold text-amber-300 truncate" [title]="sepsis.vasopressorGuidance().currentTier">
            {{ sepsis.vasopressorGuidance().currentTier.split(':')[0] }}
          </div>
          <div class="text-[10px] text-zinc-400">
            NE-Eq: <strong class="text-zinc-200">{{ sepsis.vasopressorGuidance().norepinephrineEquivalentDose }} mcg/kg/min</strong>
          </div>
        </div>

      </div>

      <!-- Microvascular Uncoupling Warning Banner -->
      @if (sepsis.microvascular().isMicrovascularUncoupled) {
        <div class="p-3 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-xs flex items-center gap-2.5 text-amber-300 animate-in fade-in duration-200">
          <span class="text-lg">⚠️</span>
          <div>
            <strong>Microvascular Uncoupling Alert:</strong> Macrohemodynamic blood pressure (MAP &ge; 65 mmHg) is restored, but peripheral tissue hypoperfusion persists (CRT &gt; 3.0s or Mottling &ge; 2). Avoid excessive vasopressor vasoconstriction; evaluate volume responsiveness with Passive Leg Raise.
          </div>
        </div>
      }

      <!-- 1-Click Clinical Scenario Presets -->
      <div class="space-y-2">
        <span class="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Simulate Clinical Shock Scenarios (1-Click Presets)
        </span>
        <div class="flex flex-wrap gap-2 text-xs">
          <button type="button" (click)="applyPreset('homeostasis')"
                  class="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition cursor-pointer">
            🟢 1. Homeostatic Baseline (SOFA 0)
          </button>
          <button type="button" (click)="applyPreset('early_sepsis')"
                  class="px-3 py-1.5 rounded-xl bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-950/60 transition cursor-pointer">
            🟡 2. Early Sepsis (Pneumonia, ΔSOFA +3)
          </button>
          <button type="button" (click)="applyPreset('septic_shock_ne')"
                  class="px-3 py-1.5 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-500/30 hover:bg-rose-950/60 transition cursor-pointer">
            🔴 3. Septic Shock (NE Active, Lactate 3.8)
          </button>
          <button type="button" (click)="applyPreset('refractory_vasoplegia')"
                  class="px-3 py-1.5 rounded-xl bg-red-950/60 text-red-200 border border-red-500/50 hover:bg-red-950 transition cursor-pointer animate-pulse">
            🚨 4. Refractory Vasoplegic Shock (Add Hydrocortisone)
          </button>
          <button type="button" (click)="applyPreset('andromeda_cleared')"
                  class="px-3 py-1.5 rounded-xl bg-teal-950/40 text-teal-300 border border-teal-500/30 hover:bg-teal-950/60 transition cursor-pointer">
            ✨ 5. Resuscitation Success (CRT &le; 3.0s, Clearance 45%)
          </button>
        </div>
      </div>

      <!-- Clinical Action Directives & Prescribing Guidance -->
      <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 space-y-3 text-xs font-sans">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h4 class="font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <span>📋</span>
            <span>Surviving Sepsis &amp; ANDROMEDA-SHOCK Action Plan</span>
          </h4>
          <span class="text-[10px] font-bold text-rose-400 font-mono">
            {{ sepsis.diagnosis().severityTier }}
          </span>
        </div>

        <ul class="space-y-1.5 text-zinc-300 text-xs">
          @for (dir of sepsis.diagnosis().clinicalActionDirectives; track dir) {
            <li class="flex items-start gap-2">
              <span class="text-rose-400 font-bold shrink-0">▸</span>
              <span>{{ dir }}</span>
            </li>
          }
        </ul>

        @if (sepsis.vasopressorGuidance().recommendedInterventions.length > 0) {
          <div class="mt-3 pt-2 border-t border-zinc-800 space-y-1">
            <span class="text-[11px] font-bold font-mono text-amber-300 uppercase">Vasopressor Sparing Directive:</span>
            <ul class="space-y-1 text-xs text-zinc-300">
              @for (rec of sepsis.vasopressorGuidance().recommendedInterventions; track rec) {
                <li class="flex items-start gap-2">
                  <span class="text-amber-400 font-bold shrink-0">✓</span>
                  <span>{{ rec }}</span>
                </li>
              }
            </ul>
          </div>
        }
      </div>

    </div>
  `
})
export class SepsisShockSofaCardComponent {
  public sepsis = inject(SepsisShockSofaService);

  public applyPreset(scenario: 'homeostasis' | 'early_sepsis' | 'septic_shock_ne' | 'refractory_vasoplegia' | 'andromeda_cleared'): void {
    switch (scenario) {
      case 'homeostasis':
        this.sepsis.resetToDefault();
        break;

      case 'early_sepsis':
        this.sepsis.updateInputs({
          hasSuspectedOrConfirmedInfection: true,
          respiratoryRateBpm: 24,
          systolicBpMmhg: 104,
          meanArterialPressureMmhg: 72,
          pao2Mmhg: 72,
          fio2Percent: 35, // P/F = 205 (Resp = 2)
          plateletsKUl: 135, // Coag = 1 (Total SOFA = 3, Delta = 3)
          serumLactateInitialMmolL: 2.4,
          serumLactateCurrentMmolL: 2.2,
          capillaryRefillTimeSec: 2.8,
          norepinephrineDoseMcgKgMin: 0,
          vasopressinDoseUnitsMin: 0
        });
        break;

      case 'septic_shock_ne':
        this.sepsis.updateInputs({
          hasSuspectedOrConfirmedInfection: true,
          respiratoryRateBpm: 26,
          systolicBpMmhg: 88,
          meanArterialPressureMmhg: 62,
          pao2Mmhg: 68,
          fio2Percent: 50,
          isMechanicallyVentilated: true, // Resp = 3
          plateletsKUl: 85,  // Coag = 2
          totalBilirubinMgDl: 1.8, // Liver = 1
          serumCreatinineMgDl: 2.2, // Renal = 2
          glasgowComaScale: 12, // CNS = 2
          norepinephrineDoseMcgKgMin: 0.22, // CV = 4 (Total SOFA = 14)
          vasopressinDoseUnitsMin: 0,
          serumLactateInitialMmolL: 4.2,
          serumLactateCurrentMmolL: 3.8,
          capillaryRefillTimeSec: 4.8,
          mottlingScore: 2
        });
        break;

      case 'refractory_vasoplegia':
        this.sepsis.updateInputs({
          hasSuspectedOrConfirmedInfection: true,
          respiratoryRateBpm: 28,
          systolicBpMmhg: 82,
          meanArterialPressureMmhg: 58,
          pao2Mmhg: 60,
          fio2Percent: 70,
          isMechanicallyVentilated: true, // Resp = 4
          plateletsKUl: 40,  // Coag = 3
          totalBilirubinMgDl: 3.2, // Liver = 2
          serumCreatinineMgDl: 3.8, // Renal = 3
          glasgowComaScale: 9, // CNS = 3
          norepinephrineDoseMcgKgMin: 0.45, // CV = 4
          vasopressinDoseUnitsMin: 0.03, // Refractory Tier 4
          serumLactateInitialMmolL: 5.8,
          serumLactateCurrentMmolL: 5.2,
          capillaryRefillTimeSec: 5.5,
          mottlingScore: 3
        });
        break;

      case 'andromeda_cleared':
        this.sepsis.updateInputs({
          hasSuspectedOrConfirmedInfection: true,
          respiratoryRateBpm: 18,
          systolicBpMmhg: 115,
          meanArterialPressureMmhg: 78,
          pao2Mmhg: 90,
          fio2Percent: 30,
          isMechanicallyVentilated: false,
          plateletsKUl: 160,
          totalBilirubinMgDl: 1.1,
          serumCreatinineMgDl: 1.3,
          glasgowComaScale: 15,
          norepinephrineDoseMcgKgMin: 0.04, // Weaning
          vasopressinDoseUnitsMin: 0,
          serumLactateInitialMmolL: 4.0,
          serumLactateCurrentMmolL: 2.2, // 45% clearance
          capillaryRefillTimeSec: 2.4, // Normalized
          mottlingScore: 0
        });
        break;
    }
  }
}
