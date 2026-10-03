import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenderAffirmingCareService, TransitionRegimenType, IOrganInventory } from '../../services/gender-affirming-care.service';
import { SovereigntyHealthModelsService, GahtCompound } from '../../services/sovereignty-health-models.service';

@Component({
  selector: 'app-gender-affirming-lens-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full space-y-6 text-slate-100 font-sans">
      <!-- Main Banner -->
      <div class="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-zinc-900 to-teal-950/40 border border-teal-500/30 shadow-2xl">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="text-3xl">🪷</span>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-xl font-bold text-white tracking-tight">Gender-Affirming Healthcare & Endocrine Suite</h3>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-950 text-teal-300 border border-teal-700/50">
                  WPATH SOC8 & Endocrine Society Protocol
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                Organ Inventory Model ("anatomy over assumption"), physiological GAHT hormone target calibration, and muscle-mass independent eGFR.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="exportGenderAffirmingBundle()"
              class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition shadow-sm hover:shadow-teal-500/20 active:scale-95">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export FHIR R4 (Restricted 'R')
            </button>
          </div>
        </div>

        <!-- Telemetry HUD Grid -->
        <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span class="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Affirmed Identity</span>
            <div class="text-lg font-bold text-teal-300 truncate">{{ gac.chosenName() }}</div>
            <span class="text-[11px] text-slate-400 font-sans">Pronouns: {{ gac.affirmedPronouns() }}</span>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span class="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Endocrine Regimen</span>
            <div class="text-xs font-bold text-white truncate">{{ gac.transitionRegimen() }}</div>
            <span class="text-[11px] text-teal-400 font-sans">{{ gac.durationOnGahtMonths() }} months on GAHT</span>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1" [class.border-rose-700]="gac.gahtEvaluation().hyperkalemiaWarning || gac.gahtEvaluation().erythrocytosisWarning">
            <span class="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Endocrine Target Status</span>
            <div class="text-lg font-bold" [ngClass]="(gac.gahtEvaluation().estradiolTargetMet || gac.gahtEvaluation().testosteroneTargetMet) ? 'text-emerald-400' : 'text-amber-400'">
              {{ (gac.gahtEvaluation().estradiolTargetMet || gac.gahtEvaluation().testosteroneTargetMet) ? 'IN TARGET' : 'TITRATION REQ' }}
            </div>
            <span class="text-[11px] text-slate-400 font-sans">E2: {{ gac.serumEstradiol() }} / T: {{ gac.serumTestosterone() }}</span>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span class="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Renal eGFR (Cystatin C)</span>
            <div class="text-lg font-bold text-sky-300">{{ gac.renalEvaluation().cystatinCBasedEgfr }} mL/min</div>
            <span class="text-[11px] text-slate-400 font-sans">Muscle-Mass Independent</span>
          </div>
        </div>
      </div>

      <!-- Sub-Tabs Navigation -->
      <div class="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
        <button
          type="button"
          (click)="activeTab.set('inventory')"
          [class.bg-teal-600]="activeTab() === 'inventory'"
          [class.text-white]="activeTab() === 'inventory'"
          [class.text-slate-400]="activeTab() !== 'inventory'"
          class="px-3.5 py-1.5 rounded-lg transition font-medium">
          Organ Inventory & Cancer Screening
        </button>
        <button
          type="button"
          (click)="activeTab.set('gaht')"
          [class.bg-teal-600]="activeTab() === 'gaht'"
          [class.text-white]="activeTab() === 'gaht'"
          [class.text-slate-400]="activeTab() !== 'gaht'"
          class="px-3.5 py-1.5 rounded-lg transition font-medium">
          Hormone Targets & Safety Guards
        </button>
        <button
          type="button"
          (click)="activeTab.set('pk')"
          [class.bg-teal-600]="activeTab() === 'pk'"
          [class.text-white]="activeTab() === 'pk'"
          [class.text-slate-400]="activeTab() !== 'pk'"
          class="px-3.5 py-1.5 rounded-lg transition font-medium">
          In Silico PK Curve Simulator
        </button>
        <button
          type="button"
          (click)="activeTab.set('renal')"
          [class.bg-teal-600]="activeTab() === 'renal'"
          [class.text-white]="activeTab() === 'renal'"
          [class.text-slate-400]="activeTab() !== 'renal'"
          class="px-3.5 py-1.5 rounded-lg transition font-medium">
          eGFR Renal & Cardiovascular Calibration
        </button>
      </div>

      <!-- TAB 1: ORGAN INVENTORY & CANCER SCREENING -->
      @if (activeTab() === 'inventory') {
        <div class="space-y-6">
          <div class="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div class="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h4 class="text-base font-bold text-white">The Organ Inventory Model ("Anatomy Over Assumption")</h4>
                <p class="text-xs text-slate-400">Preventive cancer screening triggers strictly based on anatomical tissue presence rather than administrative gender markers.</p>
              </div>
              <span class="text-xs font-mono px-2 py-1 rounded bg-slate-950 border border-slate-700 text-teal-300">
                ACOG & WPATH SOC8
              </span>
            </div>

            <!-- Organ Presence Checkbox Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <label class="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span class="text-slate-300 font-medium">Cervix</span>
                <input
                  type="checkbox"
                  [ngModel]="gac.organInventory().hasCervix"
                  (ngModelChange)="gac.toggleOrgan('hasCervix')"
                  class="w-4 h-4 accent-teal-500 rounded" />
              </label>

              <label class="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span class="text-slate-300 font-medium">Uterus</span>
                <input
                  type="checkbox"
                  [ngModel]="gac.organInventory().hasUterus"
                  (ngModelChange)="gac.toggleOrgan('hasUterus')"
                  class="w-4 h-4 accent-teal-500 rounded" />
              </label>

              <label class="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span class="text-slate-300 font-medium">Ovaries</span>
                <input
                  type="checkbox"
                  [ngModel]="gac.organInventory().hasOvaries"
                  (ngModelChange)="gac.toggleOrgan('hasOvaries')"
                  class="w-4 h-4 accent-teal-500 rounded" />
              </label>

              <label class="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span class="text-slate-300 font-medium">Breast/Chest Tissue</span>
                <input
                  type="checkbox"
                  [ngModel]="gac.organInventory().hasBreastChestTissue"
                  (ngModelChange)="gac.toggleOrgan('hasBreastChestTissue')"
                  class="w-4 h-4 accent-teal-500 rounded" />
              </label>

              <label class="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span class="text-slate-300 font-medium">Prostate Gland</span>
                <input
                  type="checkbox"
                  [ngModel]="gac.organInventory().hasProstate"
                  (ngModelChange)="gac.toggleOrgan('hasProstate')"
                  class="w-4 h-4 accent-teal-500 rounded" />
              </label>

              <label class="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span class="text-slate-300 font-medium">Testes</span>
                <input
                  type="checkbox"
                  [ngModel]="gac.organInventory().hasTestes"
                  (ngModelChange)="gac.toggleOrgan('hasTestes')"
                  class="w-4 h-4 accent-teal-500 rounded" />
              </label>

              <label class="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span class="text-slate-300 font-medium">Neovagina</span>
                <input
                  type="checkbox"
                  [ngModel]="gac.organInventory().hasNeovagina"
                  (ngModelChange)="gac.toggleOrgan('hasNeovagina')"
                  class="w-4 h-4 accent-teal-500 rounded" />
              </label>

              <label class="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span class="text-slate-300 font-medium">Neophallus</span>
                <input
                  type="checkbox"
                  [ngModel]="gac.organInventory().hasNeophallusOrMetoidioplasty"
                  (ngModelChange)="gac.toggleOrgan('hasNeophallusOrMetoidioplasty')"
                  class="w-4 h-4 accent-teal-500 rounded" />
              </label>
            </div>
          </div>

          <!-- Dynamic Preventive Screening Guidelines -->
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-white uppercase tracking-wider text-teal-400">Automated Clinical Screening Indicators:</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (alert of gac.screeningAlerts(); track alert.organOrTissue) {
                <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 hover:border-teal-500/40 transition">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-white">{{ alert.organOrTissue }}</span>
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold border"
                      [ngClass]="alert.importance.includes('High') ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-teal-950 text-teal-300 border-teal-800'">
                      {{ alert.importance }}
                    </span>
                  </div>
                  <div class="text-xs font-semibold text-teal-300">{{ alert.recommendedScreening }}</div>
                  <p class="text-[11px] text-slate-400 leading-relaxed">{{ alert.clinicalGuideline }}</p>
                  <div class="text-[10px] font-mono text-slate-500 pt-1">
                    Frequency: {{ alert.frequency }}
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- TAB 2: HORMONE TARGETS & SAFETY GUARDS -->
      @if (activeTab() === 'gaht') {
        <div class="space-y-6">
          <!-- Regimen Selector & Laboratory Sliders -->
          <div class="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 class="text-base font-bold text-white">GAHT Regimen & Endocrine Laboratory Calibration</h4>
              <span class="text-xs text-slate-400 font-mono">Endocrine Society 2024</span>
            </div>

            <!-- Regimen Dropdown / Buttons -->
            <div class="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                (click)="gac.setTransitionRegimen('Feminizing (Estradiol + Anti-Androgen)')"
                [class.bg-teal-600]="gac.transitionRegimen().includes('Feminizing')"
                [class.text-white]="gac.transitionRegimen().includes('Feminizing')"
                [class.bg-slate-950]="!gac.transitionRegimen().includes('Feminizing')"
                [class.text-slate-400]="!gac.transitionRegimen().includes('Feminizing')"
                class="px-3 py-1.5 rounded-lg border border-slate-700 font-medium transition">
                Feminizing (Estradiol + Anti-Androgen)
              </button>
              <button
                type="button"
                (click)="gac.setTransitionRegimen('Masculinizing (Exogenous Testosterone)')"
                [class.bg-teal-600]="gac.transitionRegimen().includes('Masculinizing')"
                [class.text-white]="gac.transitionRegimen().includes('Masculinizing')"
                [class.bg-slate-950]="!gac.transitionRegimen().includes('Masculinizing')"
                [class.text-slate-400]="!gac.transitionRegimen().includes('Masculinizing')"
                class="px-3 py-1.5 rounded-lg border border-slate-700 font-medium transition">
                Masculinizing (Exogenous Testosterone)
              </button>
            </div>

            <!-- Lab Inputs Grid -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span class="text-slate-400 block text-[10px]">Estradiol (E2) [pg/mL]</span>
                <input
                  type="number"
                  [ngModel]="gac.serumEstradiol()"
                  (ngModelChange)="gac.serumEstradiol.set($event)"
                  class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold" />
                <span class="text-[10px] text-teal-400 block font-sans">Target: 100-200 pg/mL</span>
              </div>

              <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span class="text-slate-400 block text-[10px]">Total Testosterone (T) [ng/dL]</span>
                <input
                  type="number"
                  [ngModel]="gac.serumTestosterone()"
                  (ngModelChange)="gac.serumTestosterone.set($event)"
                  class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold" />
                <span class="text-[10px] text-teal-400 block font-sans">Target: {{ gac.transitionRegimen().includes('Feminizing') ? '< 50 ng/dL' : '400-700 ng/dL' }}</span>
              </div>

              <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1" [class.border-rose-700]="gac.serumPotassium() > 5.2">
                <span class="text-slate-400 block text-[10px]">Potassium (K+) [mEq/L]</span>
                <input
                  type="number"
                  step="0.1"
                  [ngModel]="gac.serumPotassium()"
                  (ngModelChange)="gac.serumPotassium.set($event)"
                  class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold" />
                <span class="text-[10px] text-slate-400 block font-sans">Spironolactone Guard (&le; 5.2)</span>
              </div>

              <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1" [class.border-rose-700]="gac.serumHematocrit() > 50">
                <span class="text-slate-400 block text-[10px]">Hematocrit (Hct) [%]</span>
                <input
                  type="number"
                  step="1"
                  [ngModel]="gac.serumHematocrit()"
                  (ngModelChange)="gac.serumHematocrit.set($event)"
                  class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold" />
                <span class="text-[10px] text-slate-400 block font-sans">Erythrocytosis Guard (&le; 50%)</span>
              </div>
            </div>
          </div>

          <!-- Clinical Evaluation & Dose Adjustments -->
          <div class="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 text-xs">
            <span class="font-bold text-teal-300 block uppercase tracking-wider text-[10px]">Clinical Decision Support Synthesis:</span>
            <p class="text-white font-medium">{{ gac.gahtEvaluation().clinicalSummary }}</p>

            <div class="space-y-1.5 pt-2">
              <span class="text-slate-400 uppercase text-[10px] font-bold">Actionable Posology & Safety Guidance:</span>
              <ul class="space-y-1 list-disc list-inside text-slate-300 text-[11px]">
                @for (action of gac.gahtEvaluation().actionableDoseGuidance; track action) {
                  <li [class.text-rose-300]="action.includes('ALERT')" [class.font-bold]="action.includes('ALERT')">{{ action }}</li>
                }
              </ul>
            </div>
          </div>
        </div>
      }

      <!-- TAB: IN SILICO PK CURVE SIMULATOR -->
      @if (activeTab() === 'pk') {
        <div class="space-y-6">
          <div class="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 class="text-base font-bold text-white">In Silico Pharmacokinetic (PK) Curve Simulator</h4>
                <p class="text-xs text-slate-400">Two-compartment Bateman open-depot model optimizing steady-state hormone concentrations and eliminating end-of-cycle crashes.</p>
              </div>
              <span class="text-xs font-mono px-2 py-1 rounded bg-slate-950 border border-teal-800 text-teal-300">
                Analytical Bateman Model
              </span>
            </div>

            <!-- PK Controls Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span class="text-slate-400 block text-[10px]">Hormone Compound</span>
                <select
                  [ngModel]="sovereignty.selectedGahtCompound()"
                  (ngModelChange)="sovereignty.selectedGahtCompound.set($event)"
                  class="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold text-xs">
                  <option value="Estradiol Valerate (IM/SubQ)">Estradiol Valerate (IM/SubQ)</option>
                  <option value="Estradiol Cypionate (IM/SubQ)">Estradiol Cypionate (IM/SubQ)</option>
                  <option value="Testosterone Cypionate (IM/SubQ)">Testosterone Cypionate (IM/SubQ)</option>
                  <option value="Testosterone Enanthate (IM/SubQ)">Testosterone Enanthate (IM/SubQ)</option>
                </select>
              </div>

              <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div class="flex justify-between">
                  <span class="text-slate-400 text-[10px]">Dose (mg)</span>
                  <span class="text-teal-300 font-bold">{{ sovereignty.gahtDoseMg() }} mg</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="150"
                  step="0.5"
                  [ngModel]="sovereignty.gahtDoseMg()"
                  (ngModelChange)="sovereignty.gahtDoseMg.set($event)"
                  class="w-full accent-teal-500 cursor-pointer" />
              </div>

              <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div class="flex justify-between">
                  <span class="text-slate-400 text-[10px]">Injection Interval (Days)</span>
                  <span class="text-teal-300 font-bold">Every {{ sovereignty.gahtIntervalDays() }} days</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="21"
                  step="1"
                  [ngModel]="sovereignty.gahtIntervalDays()"
                  (ngModelChange)="sovereignty.gahtIntervalDays.set($event)"
                  class="w-full accent-teal-500 cursor-pointer" />
              </div>
            </div>

            <!-- PK Telemetry Summary Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div class="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span class="text-slate-500 block text-[10px]">Peak Concentration</span>
                <span class="text-lg font-bold text-teal-300">{{ sovereignty.gahtPkSimulation().peakConcentration }}</span>
                <span class="text-[10px] text-slate-400 block font-sans">Occurs at ~24-48 hours</span>
              </div>
              <div class="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span class="text-slate-500 block text-[10px]">Trough Concentration</span>
                <span class="text-lg font-bold text-sky-300">{{ sovereignty.gahtPkSimulation().troughConcentration }}</span>
                <span class="text-[10px] text-slate-400 block font-sans">Pre-injection nadir</span>
              </div>
              <div class="p-3 bg-slate-950 rounded-xl border border-slate-800" [class.border-amber-700]="sovereignty.gahtPkSimulation().peakTroughFluctuationPercent > 180">
                <span class="text-slate-500 block text-[10px]">Peak-to-Trough Swing</span>
                <span class="text-lg font-bold" [ngClass]="sovereignty.gahtPkSimulation().peakTroughFluctuationPercent > 180 ? 'text-amber-400' : 'text-emerald-400'">
                  {{ sovereignty.gahtPkSimulation().peakTroughFluctuationPercent }}%
                </span>
                <span class="text-[10px] text-slate-400 block font-sans">{{ sovereignty.gahtPkSimulation().peakTroughFluctuationPercent > 180 ? 'High Fluctuation Risk' : 'Optimal Steady-State' }}</span>
              </div>
            </div>

            <!-- Visual Bar Chart Representation of PK Depletion -->
            <div class="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div class="flex justify-between items-center text-xs">
                <span class="font-bold text-white">Daily Concentration Decay Timeline:</span>
                <span class="text-slate-400 font-mono text-[10px]">Bateman C(t) Curve</span>
              </div>
              <div class="flex items-end gap-1 h-24 pt-4 border-b border-slate-800">
                @for (pt of sovereignty.gahtPkSimulation().simulatedCurve; track pt.day) {
                  <div
                    class="flex-1 bg-gradient-to-t from-teal-700 to-teal-400 hover:to-teal-200 rounded-t transition relative group cursor-pointer"
                    [style.height.%]="sovereignty.gahtPkSimulation().peakConcentration > 0 ? (pt.concentration / sovereignty.gahtPkSimulation().peakConcentration * 100) : 0">
                    <div class="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 p-1 bg-slate-900 border border-slate-700 rounded text-[9px] font-mono text-white whitespace-nowrap z-10">
                      Day {{ pt.day }}: {{ pt.concentration }}
                    </div>
                  </div>
                }
              </div>
              <div class="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                <span>Day 0 (Injection)</span>
                <span>Day {{ sovereignty.gahtIntervalDays() / 2 }} (Mid-Cycle)</span>
                <span>Day {{ sovereignty.gahtIntervalDays() }} (Trough)</span>
              </div>
            </div>

            <!-- Clinical Advice Box -->
            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong class="text-teal-300">Clinical Optimization:</strong> {{ sovereignty.gahtPkSimulation().clinicalOptimizationAdvice }}
            </div>
          </div>
        </div>
      }

      <!-- TAB 3: RENAL eGFR & CARDIOVASCULAR CALIBRATION -->
      @if (activeTab() === 'renal') {
        <div class="space-y-6">
          <div class="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div class="border-b border-slate-800 pb-3">
              <h4 class="text-base font-bold text-white">Muscle-Mass Independent Renal Function (Cystatin C)</h4>
              <p class="text-xs text-slate-400">Standard creatinine eGFR formulas fail during transition due to changing skeletal muscle mass and creatinine production.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <!-- Creatinine vs Cystatin C Card -->
              <div class="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <span class="font-bold text-sky-400 uppercase text-[10px]">Biomarker Comparison</span>
                <div class="flex justify-between items-center py-2 border-b border-slate-800">
                  <span class="text-slate-300">Creatinine-Based eGFR (CKD-EPI):</span>
                  <span class="font-mono font-bold text-slate-400">{{ gac.renalEvaluation().creatinineBasedEgfr }} mL/min</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-slate-800">
                  <span class="text-white font-bold">Cystatin C-Based eGFR (Gold Standard):</span>
                  <span class="font-mono font-bold text-teal-300 text-sm">{{ gac.renalEvaluation().cystatinCBasedEgfr }} mL/min</span>
                </div>
                <p class="text-[11px] text-slate-400 leading-relaxed">{{ gac.renalEvaluation().interpretationNotes }}</p>
              </div>

              <!-- Cardiovascular ASCVD Guidance -->
              <div class="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span class="font-bold text-teal-400 uppercase text-[10px]">Cardiovascular ASCVD Risk Calibration</span>
                <p class="text-slate-300 leading-relaxed text-[11px]">
                  For patients on continuous GAHT for &ge; 2-5 years, arterial stiffness, visceral adiposity, and lipid subfraction dynamics transition toward the affirmed sex profile.
                </p>
                <div class="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                  <strong>Recommendation:</strong> Use affirmed sex cardiovascular calculation, supplemented by direct ApoB and Coronary Artery Calcium (CAC) imaging when clinical uncertainty exists.
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Export Notification Toast -->
      @if (exportSuccessMessage()) {
        <div class="p-3 bg-emerald-950 border border-emerald-700/60 rounded-xl text-xs font-mono text-emerald-200 flex items-center justify-between">
          <span>{{ exportSuccessMessage() }}</span>
          <button (click)="exportSuccessMessage.set(null)" class="text-emerald-400 hover:text-white font-bold ml-2">&times;</button>
        </div>
      }
    </div>
  `
})
export class GenderAffirmingLensTabComponent {
  public gac = inject(GenderAffirmingCareService);
  public sovereignty = inject(SovereigntyHealthModelsService);
  public activeTab = signal<'inventory' | 'gaht' | 'pk' | 'renal'>('inventory');
  public exportSuccessMessage = signal<string | null>(null);

  exportGenderAffirmingBundle(): void {
    const bundle = this.gac.exportFhirR4GenderAffirmingBundle('homo-sapiens-diverse-29y');
    this.exportSuccessMessage.set(
      `Generated Gender-Affirming FHIR R4 Bundle with Confidentiality Code '${bundle['meta']?.security?.[0]?.code}' (Restricted Zero-Egress Tag).`
    );
  }
}
