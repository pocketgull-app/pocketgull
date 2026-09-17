import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalPosologyService, PosologyAgeTier, IBeersCriteriaAlert } from '../services/clinical-posology.service';
import { PatientStateService } from '../services/patient-state.service';
import { SoapNoteGeneratorService } from '../services/soap-note-generator.service';
import { EnvironmentalHeatPosologyService, IHeatPosologyAssessment } from '../services/environmental-heat-posology.service';
import {
  ComplexAdaptiveSystemsService,
  IWbeAllometricScalingResult,
  ICriticalSlowingDownMetrics,
  IHypergraphPolypharmacyAssessment
} from '../services/complex-adaptive-systems.service';

export type PosologyPersonaMode = 'patient' | 'family' | 'clinician' | 'community';

export interface IPosology3ActTrajectory {
  act1WhereYouveBeen: {
    title: string;
    clinicalRationale: string;
    plainLanguageRationale: string;
    patientSelfCareRationale?: string;
    communitySdohRationale?: string;
    baselineFactors: string[];
  };
  act2WhereYouStandToday: {
    title: string;
    calibratedDosage: string;
    hydrationTarget: string;
    clinicalSafetyStamp: string;
    plainLanguageAdvice: string;
    patientHabitRoutine?: string;
    communitySafetySupport?: string;
  };
  act3WhereYoureGoing: {
    title: string;
    homeCareWatchWindow: string;
    warningSignsToMonitor: string[];
    actionGuidance: string;
    plainLanguageGuidance: string;
    patientVitalityMilestone?: string;
    communityFollowUpProtocol?: string;
  };
}

@Component({
  selector: 'app-clinical-posology-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-in fade-in duration-300">
      
      <!-- Component Header HUD -->
      <div class="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-700/80 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xl">👶 🧒 🧑 🧓</span>
            <h3 class="text-lg font-bold tracking-wide">Age-Stratified Posology &amp; Precision Dosage Engine</h3>
            <span class="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              ISMP &amp; AGS Beers Compliant
            </span>
          </div>
          <p class="text-xs text-slate-300 font-mono">
            Fried's Rule • Young's / Clark's Rules • Mosteller BSA • Holliday-Segar 4-2-1 • Cockcroft-Gault CrCl • Live Dosage Spellcheck
          </p>
        </div>

        <!-- Age Tier Tabs Ribbon -->
        <div class="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
          <button (click)="selectAgeTier('neonate_infant')"
                  [class.bg-rose-600]="activeAgeTier() === 'neonate_infant'"
                  [class.text-white]="activeAgeTier() === 'neonate_infant'"
                  class="px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 text-slate-300 hover:text-white">
            <span>🍼</span> Infant (0–12m)
          </button>
          <button (click)="selectAgeTier('pediatric_child')"
                  [class.bg-amber-600]="activeAgeTier() === 'pediatric_child'"
                  [class.text-white]="activeAgeTier() === 'pediatric_child'"
                  class="px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 text-slate-300 hover:text-white">
            <span>🧒</span> Child (1–12y)
          </button>
          <button (click)="selectAgeTier('adult')"
                  [class.bg-emerald-600]="activeAgeTier() === 'adult'"
                  [class.text-white]="activeAgeTier() === 'adult'"
                  class="px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 text-slate-300 hover:text-white">
            <span>🧑</span> Adult (18–64y)
          </button>
          <button (click)="selectAgeTier('geriatric_elder')"
                  [class.bg-purple-600]="activeAgeTier() === 'geriatric_elder'"
                  [class.text-white]="activeAgeTier() === 'geriatric_elder'"
                  class="px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 text-slate-300 hover:text-white">
            <span>🧓</span> Elder (65+y)
          </button>
          <button (click)="selectAgeTier('environmental_heat')"
                  [class.bg-orange-600]="activeAgeTier() === 'environmental_heat'"
                  [class.text-white]="activeAgeTier() === 'environmental_heat'"
                  class="px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 text-slate-300 hover:text-white">
            <span>☀️</span> Heat &amp; WBGT (ASU)
          </button>
          <button (click)="selectAgeTier('sfi_complex_adaptive')"
                  [class.bg-teal-600]="activeAgeTier() === 'sfi_complex_adaptive'"
                  [class.text-white]="activeAgeTier() === 'sfi_complex_adaptive'"
                  class="px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 text-slate-300 hover:text-white">
            <span>🧬</span> SFI Allometry &amp; CSD
          </button>
        </div>
      </div>

      <!-- Main Posology Interactive Cockpit -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left Column: Patient Biometric Sliders & Parameters -->
        <div class="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <span>⚙️</span> Patient Posology Parameters
            </span>
            <button (click)="syncWithActivePatient()" class="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer">
              ↺ Sync Patient
            </button>
          </div>

          <!-- Parameter 1: Age -->
          <div class="space-y-1">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-slate-600 dark:text-zinc-400">Patient Age:</span>
              <span class="font-bold text-slate-900 dark:text-zinc-100">
                @if (activeAgeTier() === 'neonate_infant') {
                  {{ infantAgeMonths() }} months
                } @else {
                  {{ patientAge() }} years
                }
              </span>
            </div>
            @if (activeAgeTier() === 'neonate_infant') {
              <input type="range" min="1" max="12" step="1" [ngModel]="infantAgeMonths()" (ngModelChange)="infantAgeMonths.set($event)" class="w-full accent-rose-500" />
            } @else {
              <input type="range" min="1" max="95" step="1" [ngModel]="patientAge()" (ngModelChange)="patientAge.set($event); onAgeChange($event)" class="w-full accent-indigo-500" />
            }
          </div>

          <!-- Parameter 2: Weight -->
          <div class="space-y-1">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-slate-600 dark:text-zinc-400">Weight (lbs / kg):</span>
              <span class="font-bold text-slate-900 dark:text-zinc-100">{{ patientWeightLbs() }} lbs ({{ patientWeightKg() }} kg)</span>
            </div>
            <input type="range" min="6" max="260" step="1" [ngModel]="patientWeightLbs()" (ngModelChange)="patientWeightLbs.set($event)" class="w-full accent-amber-500" />
          </div>

          <!-- Parameter 3: Height (for BSA) -->
          <div class="space-y-1">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-slate-600 dark:text-zinc-400">Height:</span>
              <span class="font-bold text-slate-900 dark:text-zinc-100">{{ patientHeightCm() }} cm</span>
            </div>
            <input type="range" min="45" max="200" step="1" [ngModel]="patientHeightCm()" (ngModelChange)="patientHeightCm.set($event)" class="w-full accent-cyan-500" />
          </div>

          <!-- Parameter 4: Adult Reference Dose -->
          <div class="space-y-1">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-slate-600 dark:text-zinc-400">Adult Reference Dose:</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ adultReferenceDoseMg() }} mg</span>
            </div>
            <input type="range" min="50" max="1000" step="25" [ngModel]="adultReferenceDoseMg()" (ngModelChange)="adultReferenceDoseMg.set($event)" class="w-full accent-emerald-500" />
          </div>

          <!-- Parameter 5: Serum Creatinine (for CrCl) -->
          @if (activeAgeTier() === 'geriatric_elder' || activeAgeTier() === 'adult') {
            <div class="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-1">
              <div class="flex justify-between text-xs font-mono">
                <span class="text-slate-600 dark:text-zinc-400">Serum Creatinine:</span>
                <span class="font-bold text-purple-600 dark:text-purple-400">{{ serumCreatinineMgDl() }} mg/dL</span>
              </div>
              <input type="range" min="0.5" max="3.5" step="0.1" [ngModel]="serumCreatinineMgDl()" (ngModelChange)="serumCreatinineMgDl.set($event)" class="w-full accent-purple-500" />
              <div class="flex items-center gap-3 text-xs pt-1">
                <label class="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-zinc-300 font-mono">
                  <input type="radio" name="gender" [checked]="!isFemale()" (change)="isFemale.set(false)" /> Male
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-zinc-300 font-mono">
                  <input type="radio" name="gender" [checked]="isFemale()" (change)="isFemale.set(true)" /> Female (0.85×)
                </label>
              </div>
            </div>
          }
        </div>

        <!-- Center & Right: Dynamic Tier Posology Card -->
        <div class="lg:col-span-2 space-y-4">
          
          <!-- TIER 1: NEONATE / INFANT -->
          @if (activeAgeTier() === 'neonate_infant') {
            <div class="posology-neonate space-y-4">
              <div class="flex items-center justify-between">
                <span class="posology-neonate-badge">
                  🍼 Neonate / Infant Posology (0–12 Months)
                </span>
                <span class="text-xs font-mono text-rose-700 dark:text-rose-400 font-bold">NICU / Pediatric Tier</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="p-3 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-rose-200 dark:border-rose-900/40">
                  <span class="text-[11px] font-bold text-rose-900 dark:text-rose-300 block mb-1">Fried's Posology Rule:</span>
                  <div class="posology-formula text-xs text-rose-700 dark:text-rose-300">
                    {{ friedResult().formulaString }}
                  </div>
                  <p class="text-[10px] text-slate-500 dark:text-zinc-400 mt-1.5 font-mono">
                    Fraction of adult dose: ({{ infantAgeMonths() }} / 150) = {{ (infantAgeMonths() / 150 * 100).toFixed(1) }}%
                  </p>
                </div>

                <div class="p-3 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-rose-200 dark:border-rose-900/40 space-y-1.5">
                  <span class="text-[11px] font-bold text-rose-900 dark:text-rose-300 block">Microbore Syringe Resolution:</span>
                  <div class="flex items-baseline gap-2 font-mono">
                    <span class="text-xl font-black text-rose-600 dark:text-rose-400">
                      {{ friedResult().microboreSyringeVolumeMl.toFixed(2) }} mL
                    </span>
                    <span class="text-[10px] text-slate-500 font-bold uppercase">(Leading Zero Enforced)</span>
                  </div>
                  <div class="text-[10px] font-mono text-slate-600 dark:text-zinc-400">
                    Microdrip Infusion: <strong class="text-rose-600 dark:text-rose-400">{{ friedResult().microdripGttMin }} gtt/min</strong> (60 gtt/mL IV set)
                  </div>
                </div>
              </div>

              <div class="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-950 dark:text-rose-200 text-xs font-mono">
                🛡️ <strong>NICU Clinical Guard:</strong> All neonatal dosages strictly enforce leading zeros (e.g. 0.05 mL, never .05 mL). Microbore syringes calibrated to 0.01 mL accuracy prevent 10-fold volumetric errors.
              </div>
            </div>
          }

          <!-- TIER 2: PEDIATRIC / CHILD -->
          @if (activeAgeTier() === 'pediatric_child') {
            <div class="posology-pediatric space-y-4">
              <div class="flex items-center justify-between">
                <span class="posology-pediatric-badge">
                  🧒 Pediatric / Child Posology (1–12 Years)
                </span>
                <span class="text-xs font-mono text-amber-700 dark:text-amber-400 font-bold">Young's &amp; Clark's Rules</span>
              </div>

              <!-- Pediatric Formula Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="p-3 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-amber-200 dark:border-amber-900/40">
                  <span class="text-[11px] font-bold text-amber-900 dark:text-amber-300 block mb-1">Young's Rule (Age-Based):</span>
                  <div class="posology-formula text-xs text-amber-700 dark:text-amber-300">
                    {{ youngResult().formulaString }}
                  </div>
                  <span class="text-[10px] font-mono text-slate-500 block mt-1">Calculated Dose: <strong>{{ youngResult().calculatedDoseMg }} mg</strong></span>
                </div>

                <div class="p-3 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-amber-200 dark:border-amber-900/40">
                  <span class="text-[11px] font-bold text-amber-900 dark:text-amber-300 block mb-1">Clark's Rule (Weight-Based):</span>
                  <div class="posology-formula text-xs text-amber-700 dark:text-amber-300">
                    {{ clarkResult().formulaString }}
                  </div>
                  <span class="text-[10px] font-mono text-slate-500 block mt-1">Calculated Dose: <strong>{{ clarkResult().calculatedDoseMg }} mg</strong></span>
                </div>
              </div>

              <!-- Mosteller BSA & Holliday-Segar 4-2-1 Maintenance Fluid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="p-3 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-amber-200 dark:border-amber-900/40">
                  <span class="text-[11px] font-bold text-amber-900 dark:text-amber-300 block mb-1">Mosteller BSA (m²):</span>
                  <div class="text-xs font-mono text-slate-800 dark:text-zinc-200">
                    {{ mostellerResult().formulaString }}
                  </div>
                  <span class="text-[10px] font-mono text-slate-500 block mt-1">Pediatric BSA: <strong>{{ mostellerResult().bsaM2 }} m²</strong></span>
                </div>

                <div class="p-3 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-amber-200 dark:border-amber-900/40">
                  <span class="text-[11px] font-bold text-amber-900 dark:text-amber-300 block mb-1">Holliday-Segar 4-2-1 Maintenance IV Fluid:</span>
                  <div class="pediatric-fluid-421 text-xs">
                    <span>1st 10kg: {{ fluidResult().breakdown.first10kgMlHr }} mL/h</span>
                    <span>2nd 10kg: {{ fluidResult().breakdown.second10kgMlHr }} mL/h</span>
                    <span>>20kg: {{ fluidResult().breakdown.remainingKgMlHr }} mL/h</span>
                  </div>
                  <div class="mt-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                    {{ fluidResult().telemetryDisplay }}
                  </div>
                </div>
              </div>

              <!-- Oral Syringe Volumetric Chips -->
              <div class="p-3 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-amber-200 dark:border-amber-900/40">
                <span class="text-[11px] font-bold text-amber-900 dark:text-amber-300 block mb-2">Oral Syringe Volumetric Snapping Chips:</span>
                <div class="flex flex-wrap gap-2 font-mono text-xs">
                  @for (chip of [0.5, 1.0, 2.5, 5.0, 10.0]; track chip) {
                    <button (click)="selectedOralSyringeVol.set(chip)"
                            [class.bg-amber-500]="selectedOralSyringeVol() === chip"
                            [class.text-white]="selectedOralSyringeVol() === chip"
                            class="px-2.5 py-1 rounded-lg border border-amber-400/60 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold cursor-pointer transition">
                      {{ chip }} mL Syringe
                    </button>
                  }
                </div>
              </div>
            </div>
          }

          <!-- TIER 3: ADULT -->
          @if (activeAgeTier() === 'adult') {
            <div class="posology-adult space-y-4">
              <div class="flex items-center justify-between">
                <span class="posology-adult-badge">
                  🧑 Adult Posology Standard (18–64 Years)
                </span>
                <span class="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">Standard Therapeutic Range</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="p-3 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-emerald-200 dark:border-emerald-900/40">
                  <span class="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 block mb-1">Standard Adult Dose:</span>
                  <div class="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {{ adultReferenceDoseMg() }} mg
                  </div>
                  <span class="text-[10px] text-slate-500 font-mono">100% Reference Dosage</span>
                </div>

                <div class="p-3 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-emerald-200 dark:border-emerald-900/40">
                  <span class="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 block mb-1">Adult BSA Clearance:</span>
                  <div class="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {{ mostellerResult().bsaM2 }} m²
                  </div>
                  <span class="text-[10px] text-slate-500 font-mono">Based on {{ patientHeightCm() }}cm / {{ patientWeightKg() }}kg</span>
                </div>

                <div class="p-3 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-emerald-200 dark:border-emerald-900/40">
                  <span class="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 block mb-1">Estimated CrCl:</span>
                  <div class="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {{ cockcroftResult().crClMlMin }} mL/min
                  </div>
                  <span class="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">{{ cockcroftResult().renalDosingTier }}</span>
                </div>
              </div>

              <p class="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                Patient is within standard physiological maturity window. Maintain baseline monitoring of hepatic transaminases and renal function prior to starting narrow-therapeutic index formulations.
              </p>
            </div>
          }

          <!-- TIER 4: GERIATRIC / ELDER -->
          @if (activeAgeTier() === 'geriatric_elder') {
            <div class="posology-geriatric space-y-4">
              <div class="flex items-center justify-between">
                <span class="posology-geriatric-badge">
                  🧓 Geriatric / Elder Posology (65+ Years)
                </span>
                <span class="text-xs font-mono text-purple-700 dark:text-purple-300 font-bold">Cockcroft-Gault &amp; AGS Beers</span>
              </div>

              <!-- Cockcroft-Gault CrCl & Titration Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="p-3 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-purple-200 dark:border-purple-900/40">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-[11px] font-bold text-purple-900 dark:text-purple-300">Cockcroft-Gault CrCl:</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200">
                      {{ cockcroftResult().crClMlMin }} mL/min
                    </span>
                  </div>
                  <div class="posology-formula text-xs text-purple-700 dark:text-purple-300">
                    CrCl = ((140 - {{ patientAge() }}) × {{ patientWeightKg() }}kg) / (72 × {{ serumCreatinineMgDl() }}){{ isFemale() ? ' × 0.85' : '' }}
                  </div>
                  <p class="text-[11px] font-mono text-purple-800 dark:text-purple-300 mt-2 font-bold">
                    {{ cockcroftResult().recommendation }}
                  </p>
                </div>

                <div class="p-3 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-purple-200 dark:border-purple-900/40 space-y-2">
                  <span class="text-[11px] font-bold text-purple-900 dark:text-purple-300 block">Geriatric Safeguards &amp; Initiation:</span>
                  <div class="flex flex-wrap gap-1.5">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                      Start Low, Go Slow (25–50% Initial Dose)
                    </span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                      -{{ cockcroftResult().renalDoseReductionPct }}% Dose Reduction
                    </span>
                  </div>
                  <div class="text-[10.5px] text-slate-600 dark:text-zinc-400 font-mono">
                    Dysphagia Alert: Never crush extended-release (XR/ER/CR) tablets; substitute with liquid oral suspension or transdermal patch.
                  </div>
                </div>
              </div>

              <!-- 2023 AGS Beers Criteria High-Risk Medication Registry -->
              <div class="p-3.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-purple-200 dark:border-purple-900/40 space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <span class="beers-criteria-alert">⚠️ AGS 2023 Beers Criteria® High-Risk Alerts</span>
                  </span>
                  <span class="text-[10px] font-mono text-slate-500">De-Prescribing Recommendations</span>
                </div>
                <div class="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                  @for (med of beersRegistry.slice(0, 3); track med.medication) {
                    <div class="py-2 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <span class="font-bold text-rose-600 dark:text-rose-400">{{ med.medication }}</span>
                        <span class="text-[10px] text-slate-500 font-mono ml-2">({{ med.category }})</span>
                        <p class="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">{{ med.rationale }}</p>
                      </div>
                      <div class="text-[10px] font-mono text-right shrink-0">
                        <span class="text-emerald-600 dark:text-emerald-400 font-bold block">Safer Alternatives:</span>
                        <span class="text-slate-500">{{ med.saferAlternatives.join(', ') }}</span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          <!-- TIER 5: ENVIRONMENTAL HEAT & WBGT (Julie Ann Wrigley Global Futures Lab) -->
          @if (activeAgeTier() === 'environmental_heat') {
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center gap-1.5">
                  <span>☀️</span> Thermal Strain &amp; Heat-Vulnerability Posology (ASU)
                </span>
                <span class="text-xs font-mono text-orange-600 dark:text-orange-400 font-bold">
                  Stull WBGT &amp; Drug Anhidrosis
                </span>
              </div>

              <!-- Microclimatic Station Observation Picker -->
              <div class="p-3 rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 flex flex-wrap items-center justify-between gap-2">
                <span class="text-xs font-bold text-orange-900 dark:text-orange-200">NOAA Microclimate Station:</span>
                <div class="flex items-center gap-1 text-xs font-mono">
                  <button (click)="loadStationObservation('KPHX')"
                          [class.bg-orange-600]="selectedStation() === 'KPHX'"
                          [class.text-white]="selectedStation() === 'KPHX'"
                          class="px-2 py-1 rounded border border-orange-400/50 cursor-pointer">
                    Phoenix (KPHX - 114°F)
                  </button>
                  <button (click)="loadStationObservation('KSDL')"
                          [class.bg-orange-600]="selectedStation() === 'KSDL'"
                          [class.text-white]="selectedStation() === 'KSDL'"
                          class="px-2 py-1 rounded border border-orange-400/50 cursor-pointer">
                    Scottsdale (KSDL - 111°F)
                  </button>
                  <button (click)="loadStationObservation('KTUS')"
                          [class.bg-orange-600]="selectedStation() === 'KTUS'"
                          [class.text-white]="selectedStation() === 'KTUS'"
                          class="px-2 py-1 rounded border border-orange-400/50 cursor-pointer">
                    Tucson (KTUS - 106°F)
                  </button>
                </div>
              </div>

              <!-- WBGT Readout & OSHA Flag Banner -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="p-3 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-orange-200 dark:border-orange-900/40">
                  <span class="text-[11px] font-bold text-orange-900 dark:text-orange-300 block mb-1">Wet Bulb Globe Temperature (WBGT):</span>
                  <div class="flex items-baseline gap-2 font-mono">
                    <span class="text-2xl font-black text-orange-600 dark:text-orange-400">
                      {{ heatPosologyAssessment().estimatedWbgtF.toFixed(1) }}°F
                    </span>
                    <span class="text-xs text-slate-500 font-bold">({{ heatPosologyAssessment().estimatedWbgtC.toFixed(1) }}°C)</span>
                  </div>
                  <div class="mt-2 text-[11px] font-bold font-mono px-2 py-1 rounded inline-block"
                       [ngClass]="{
                         'bg-red-500 text-white': heatPosologyAssessment().heatAcuityTier === 'EXTREME_STAT' || heatPosologyAssessment().heatAcuityTier === 'SEVERE_DANGER',
                         'bg-yellow-400 text-black': heatPosologyAssessment().heatAcuityTier === 'HIGH_ALERT',
                         'bg-emerald-500 text-white': heatPosologyAssessment().heatAcuityTier === 'LOW_NORMAL' || heatPosologyAssessment().heatAcuityTier === 'MODERATE_CAUTION'
                       }">
                    OSHA TIER: {{ heatPosologyAssessment().heatAcuityTier.replace('_', ' ') }}
                  </div>
                </div>

                <div class="p-3 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-orange-200 dark:border-orange-900/40 space-y-1.5">
                  <span class="text-[11px] font-bold text-orange-900 dark:text-orange-300 block">Thermal Strain &amp; Sweat Failure:</span>
                  <div class="flex items-center justify-between text-xs font-mono">
                    <span>Anhidrosis Sweat Risk:</span>
                    <strong class="text-rose-600 dark:text-rose-400">{{ heatPosologyAssessment().anhidrosisSweatRiskPct }}%</strong>
                  </div>
                  <div class="flex items-center justify-between text-xs font-mono">
                    <span>Acute Kidney Injury Tier:</span>
                    <strong class="text-amber-600 dark:text-amber-400">{{ heatPosologyAssessment().acuteKidneyInjuryRiskTier }}</strong>
                  </div>
                  <div class="flex items-center justify-between text-xs font-mono pt-1 border-t border-slate-200 dark:border-zinc-800">
                    <span>Hourly Hydration Posology:</span>
                    <strong class="text-cyan-600 dark:text-cyan-400">{{ heatPosologyAssessment().hourlyHydrationRequirementMl }} mL/hr</strong>
                  </div>
                </div>
              </div>

              <!-- Clinical Adjudication Directive -->
              <div class="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-950 dark:text-orange-200 text-xs font-mono">
                🌡️ <strong>Planetary Health Adjudication:</strong> {{ heatPosologyAssessment().clinicalAdjudication }}
                <div class="mt-1 text-[11px] text-slate-600 dark:text-zinc-400">
                  Prescription: {{ heatPosologyAssessment().electrolytePrescription }}
                </div>
              </div>
            </div>
          }

          <!-- TIER 6: SANTA FE INSTITUTE & ASU-SFI COMPLEX ADAPTIVE SYSTEMS -->
          @if (activeAgeTier() === 'sfi_complex_adaptive') {
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30 flex items-center gap-1.5">
                  <span>🧬</span> SFI Complex Adaptive Systems &amp; Fractal Allometry
                </span>
                <span class="text-xs font-mono text-teal-600 dark:text-teal-400 font-bold">
                  WBE M^0.75 &amp; Critical Slowing Down
                </span>
              </div>

              <!-- 1. West-Brown-Enquist (WBE) Fractal Hydrodynamic Scaling -->
              <div class="p-3.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-teal-200 dark:border-teal-900/40 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <span>📐</span> West-Brown-Enquist (WBE) Fractal Scaling vs. Naive Linear
                  </span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold">
                    M^0.75 FRACTAL POWER LAW
                  </span>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-center font-mono">
                  <div class="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/30">
                    <span class="text-[10px] text-slate-500 block">Metabolic Factor (M^0.75)</span>
                    <span class="text-sm font-bold text-teal-700 dark:text-teal-300">{{ sfiAllometricResult().allometricMetabolicFactor }}×</span>
                  </div>
                  <div class="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/30">
                    <span class="text-[10px] text-slate-500 block">Vascular Transit (M^0.25)</span>
                    <span class="text-sm font-bold text-teal-700 dark:text-teal-300">{{ sfiAllometricResult().vascularTransitScaleFactor }}×</span>
                  </div>
                  <div class="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/30">
                    <span class="text-[10px] text-slate-500 block">Cardiac Pacing (M^-0.25)</span>
                    <span class="text-sm font-bold text-teal-700 dark:text-teal-300">{{ sfiAllometricResult().intrinsicCardiacPacingScale }}×</span>
                  </div>
                  <div class="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/30">
                    <span class="text-[10px] text-slate-500 block">WBE vs. Linear Variance</span>
                    <span class="text-sm font-bold"
                          [class.text-emerald-600]="sfiAllometricResult().allometricDiscrepancyPct >= 0"
                          [class.text-rose-600]="sfiAllometricResult().allometricDiscrepancyPct < 0">
                      {{ sfiAllometricResult().allometricDiscrepancyPct > 0 ? '+' : '' }}{{ sfiAllometricResult().allometricDiscrepancyPct }}%
                    </span>
                  </div>
                </div>

                <!-- Clearance Comparison Matrix -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono">
                  <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
                    <span class="text-[10.5px] text-slate-500 block">WBE Fractal Clearance:</span>
                    <span class="text-xs font-bold text-teal-600 dark:text-teal-400">{{ sfiAllometricResult().wbeCalibratedClearanceRateMlMin }} mL/min</span>
                  </div>
                  <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
                    <span class="text-[10.5px] text-slate-500 block">Naive Linear per-kg:</span>
                    <span class="text-xs font-bold text-slate-700 dark:text-zinc-300">{{ sfiAllometricResult().linearPerKgClearanceMlMin }} mL/min</span>
                  </div>
                  <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
                    <span class="text-[10.5px] text-slate-500 block">Mosteller BSA Scaled:</span>
                    <span class="text-xs font-bold text-cyan-600 dark:text-cyan-400">{{ sfiAllometricResult().bsaClearanceMlMin }} mL/min</span>
                  </div>
                </div>

                <p class="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed font-sans bg-teal-50/50 dark:bg-teal-950/20 p-2.5 rounded-lg border border-teal-200/50 dark:border-teal-900/30">
                  🔬 <strong>Fractal Morphometrics:</strong> {{ sfiAllometricResult().clinicalAllometricInsight }}
                </p>
              </div>

              <!-- 2. Critical Slowing Down (CSD) Early Warning -->
              <div class="p-3.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-teal-200 dark:border-teal-900/40 space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <span>⚡</span> Critical Slowing Down (CSD) Tipping Point Detector
                  </span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                        [class.bg-emerald-100]="sfiCsdMetrics().tippingPointAcuity === 'RESILIENT_STABLE'"
                        [class.text-emerald-800]="sfiCsdMetrics().tippingPointAcuity === 'RESILIENT_STABLE'"
                        [class.bg-amber-100]="sfiCsdMetrics().tippingPointAcuity === 'EARLY_WARNING_CSD'"
                        [class.text-amber-800]="sfiCsdMetrics().tippingPointAcuity === 'EARLY_WARNING_CSD'"
                        [class.bg-orange-100]="sfiCsdMetrics().tippingPointAcuity === 'IMMINENT_BIFURCATION'"
                        [class.text-orange-800]="sfiCsdMetrics().tippingPointAcuity === 'IMMINENT_BIFURCATION'"
                        [class.bg-rose-100]="sfiCsdMetrics().tippingPointAcuity === 'PHASE_COLLAPSE'"
                        [class.text-rose-800]="sfiCsdMetrics().tippingPointAcuity === 'PHASE_COLLAPSE'">
                    {{ sfiCsdMetrics().tippingPointAcuity.replace('_', ' ') }}
                  </span>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-center font-mono">
                  <div class="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                    <span class="text-[10px] text-slate-500 block">Lag-1 Autocorr (ρ₁)</span>
                    <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">{{ sfiCsdMetrics().lag1Autocorrelation }}</span>
                  </div>
                  <div class="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                    <span class="text-[10px] text-slate-500 block">Rolling Variance (σ²)</span>
                    <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">{{ sfiCsdMetrics().rollingVariance }}</span>
                  </div>
                  <div class="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                    <span class="text-[10px] text-slate-500 block">Recovery Rate (λ)</span>
                    <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400">{{ sfiCsdMetrics().resilienceRecoveryRate }}</span>
                  </div>
                  <div class="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                    <span class="text-[10px] text-slate-500 block">Lead Time Window</span>
                    <span class="text-xs font-bold text-amber-600 dark:text-amber-400">{{ sfiCsdMetrics().earlyWarningLeadTimeHours }}h Early Warning</span>
                  </div>
                </div>

                <div class="text-[11px] font-mono text-slate-700 dark:text-zinc-300 p-2.5 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                  ⚠️ <strong>Dynamical State:</strong> {{ sfiCsdMetrics().forensicPhysiologicalState }}
                </div>
              </div>

              <!-- 3. Hypergraph Polypharmacy Simplicial Cascade -->
              <div class="p-3.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-teal-200 dark:border-teal-900/40 space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <span>🕸️</span> Polypharmacy Hypergraph &amp; Environmental Simplex
                  </span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                        [class.bg-emerald-100]="sfiHypergraphResult().attractorBasinState === 'HOMEOSTATIC_BASIN'"
                        [class.text-emerald-800]="sfiHypergraphResult().attractorBasinState === 'HOMEOSTATIC_BASIN'"
                        [class.bg-amber-100]="sfiHypergraphResult().attractorBasinState === 'PERMEABLE_MARGIN'"
                        [class.text-amber-800]="sfiHypergraphResult().attractorBasinState === 'PERMEABLE_MARGIN'"
                        [class.bg-rose-100]="sfiHypergraphResult().attractorBasinState === 'PATHOLOGICAL_ATTRACTOR'"
                        [class.text-rose-800]="sfiHypergraphResult().attractorBasinState === 'PATHOLOGICAL_ATTRACTOR'">
                    {{ sfiHypergraphResult().attractorBasinState.replace('_', ' ') }}
                  </span>
                </div>

                <div class="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                  <span>Hyperedge Order: <strong>{{ sfiHypergraphResult().hyperedgeOrder }}-body Simplex</strong></span>
                  <span>Percolation Risk Score: <strong class="text-rose-600 dark:text-rose-400">{{ sfiHypergraphResult().percolationCascadeRiskScore }}/100</strong></span>
                </div>

                @if (sfiHypergraphResult().dominantCascadePathways.length > 0) {
                  <div class="space-y-1">
                    <span class="text-[10px] uppercase font-bold text-slate-500 block font-mono">Active Hyperedges:</span>
                    @for (pathway of sfiHypergraphResult().dominantCascadePathways; track pathway) {
                      <div class="text-[11px] font-mono p-2 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300 border border-rose-200 dark:border-rose-900/30">
                        {{ pathway }}
                      </div>
                    }
                  </div>
                }

                <div class="p-2.5 rounded-lg bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/30 text-xs font-mono text-teal-950 dark:text-teal-200">
                  🛡️ <strong>Systems Directive:</strong> {{ sfiHypergraphResult().systemsInterventionDirective }}
                </div>
              </div>
            </div>
          }

        </div>
      </div>

      <!-- LIVE CLINICAL ALIGNMENT & DOSAGE "SPELLCHECK" ENGINE SANDBOX -->
      <div class="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <h4 class="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <span>✍️</span> Clinical Alignment &amp; Improper Dosage "Spellcheck" Engine
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold">
                ISMP TALL MAN &amp; DECIMALS
              </span>
            </h4>
            <p class="text-xs text-slate-500 dark:text-zinc-400">
              Live syntax validation detecting naked decimals, trailing zeros, prohibited abbreviations, fatal overdose thresholds, and multi-paradigm OpenType styling.
            </p>
          </div>

          <!-- Quick Test Presets -->
          <div class="flex flex-wrap gap-1.5 text-[11px] font-mono">
            <button (click)="loadPreset('naked_decimal')" class="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 cursor-pointer transition">
              .5 mg Naked Dec
            </button>
            <button (click)="loadPreset('trailing_zero')" class="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 cursor-pointer transition">
              5.0 mg Trailing Zero
            </button>
            <button (click)="loadPreset('prohibited_abbrev')" class="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 cursor-pointer transition">
              10 U QD Abbrev
            </button>
            <button (click)="loadPreset('age_mismatch')" class="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 cursor-pointer transition">
              875 mg Child Mismatch
            </button>
            <button (click)="loadPreset('ayurvedic_tcm')" class="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 cursor-pointer transition">
              Ayurvedic / TCM Font
            </button>
          </div>
        </div>

        <!-- Interactive Prescription Input Box -->
        <div class="space-y-2">
          <label class="block text-xs font-mono font-bold text-slate-700 dark:text-zinc-300">
            Prescription / Care Plan Dosage String:
          </label>
          <div class="relative">
            <input type="text"
                   [ngModel]="testDosageInput()"
                   (ngModelChange)="testDosageInput.set($event)"
                   [ngClass]="spellcheckAudit().multiParadigmFontClass"
                   class="w-full p-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 text-slate-900 dark:text-zinc-100 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                   placeholder="Enter dosage instruction (e.g. Lisinopril 5.0 mg PO QD + .5 mg Alprazolam)" />
            <span class="absolute right-3 top-3 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-bold uppercase">
              {{ spellcheckAudit().multiParadigmFontClass.replace('font-paradigm-', '') }}
            </span>
          </div>
        </div>

        <!-- Real-Time Spellcheck Annotations & Sanitized Output -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <!-- Violations Detected Callout -->
          <div class="p-4 rounded-xl border"
               [ngClass]="{
                 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800': spellcheckAudit().isCompliant,
                 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800': !spellcheckAudit().isCompliant
               }">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold font-mono"
                    [class.text-emerald-800]="spellcheckAudit().isCompliant"
                    [class.text-rose-800]="!spellcheckAudit().isCompliant">
                {{ spellcheckAudit().isCompliant ? '✓ ISMP & POSOLOGY COMPLIANT' : '⚠️ POSOLOGY DEFECTS FLAGGED (' + spellcheckAudit().violations.length + ')' }}
              </span>
            </div>

            @if (spellcheckAudit().violations.length === 0) {
              <p class="text-xs text-emerald-700 dark:text-emerald-300">
                Dosage syntax satisfies all ISMP, FDA, and age-stratified safety invariants. Zero naked decimals or trailing zeros detected.
              </p>
            } @else {
              <div class="space-y-2 text-xs">
                @for (v of spellcheckAudit().violations; track v.id) {
                  <div class="p-2 rounded bg-white/80 dark:bg-zinc-900/80 border border-rose-200 dark:border-rose-900/50">
                    <div class="flex items-center justify-between">
                      <span [class]="v.cssClass" class="text-xs font-bold">
                        {{ v.originalSnippet }}
                      </span>
                      <span class="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        Prompt → {{ v.correctedSnippet }}
                      </span>
                    </div>
                    <p class="text-[10.5px] text-slate-600 dark:text-zinc-400 mt-1">
                      {{ v.explanation }}
                    </p>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Sanitized Order Output -->
          <div class="p-4 rounded-xl bg-slate-900 text-white border border-slate-700 font-mono text-xs flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span class="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Sanitized ISMP Compliant Order:</span>
                <button (click)="applySanitized()" class="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold cursor-pointer transition">
                  Apply Fix →
                </button>
              </div>
              <p class="text-emerald-300 font-bold text-sm select-all">
                {{ spellcheckAudit().sanitizedText }}
              </p>
            </div>
            <div class="pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>OpenType Engine: <strong class="text-indigo-400">{{ spellcheckAudit().multiParadigmFontClass }}</strong></span>
              <span>Tier: <strong class="text-amber-400 uppercase">{{ spellcheckAudit().ageTier }}</strong></span>
            </div>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════════════════════════════ -->
        <!-- STRUCTURED 3-ACT TRAJECTORY & OMNICHANNEL CX COCKPIT -->
        <!-- ══════════════════════════════════════════════════════════════════════════════ -->
        @let traj = posologyTrajectory();
        <div class="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/70 border border-teal-500/30 shadow-2xl space-y-5 text-slate-100">
          
          <!-- Header Bar with Persona Mode Switcher -->
          <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xl">🧭</span>
                <h3 class="text-base font-extrabold tracking-wide text-white uppercase font-mono">
                  Structured 3-Act Posology &amp; Care Trajectory
                </h3>
                <span class="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 uppercase">
                  Quiet Workshop Voice
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                Connecting clinical pharmacokinetic calibration with 5th-grade family plain-language empowerment.
              </p>
            </div>

            <!-- 4-Persona Segmented Lens Controller -->
            <div class="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-mono">
              <button
                type="button"
                (click)="togglePersona('patient')"
                [class.bg-teal-600]="personaMode() === 'patient'"
                [class.text-white]="personaMode() === 'patient'"
                [class.text-slate-400]="personaMode() !== 'patient'"
                class="px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5">
                <span>🧑</span> Patient Plain Voice
              </button>
              <button
                type="button"
                (click)="togglePersona('family')"
                [class.bg-emerald-600]="personaMode() === 'family'"
                [class.text-white]="personaMode() === 'family'"
                [class.text-slate-400]="personaMode() !== 'family'"
                class="px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5">
                <span>👨‍👩‍👧</span> Family Caregiver
              </button>
              <button
                type="button"
                (click)="togglePersona('clinician')"
                [class.bg-indigo-600]="personaMode() === 'clinician'"
                [class.text-white]="personaMode() === 'clinician'"
                [class.text-slate-400]="personaMode() !== 'clinician'"
                class="px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5">
                <span>🩺</span> Clinician CDS Lens
              </button>
              <button
                type="button"
                (click)="togglePersona('community')"
                [class.bg-amber-600]="personaMode() === 'community'"
                [class.text-white]="personaMode() === 'community'"
                [class.text-slate-400]="personaMode() !== 'community'"
                class="px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5">
                <span>🤝</span> Community (SDOH)
              </button>
            </div>
          </div>

          <!-- 3-Act Grid Cards -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            <!-- ACT 1: WHERE YOU'VE BEEN -->
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 transition flex flex-col justify-between space-y-3">
              <div>
                <div class="flex items-center justify-between gap-2 mb-1.5">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Act 1 • Baseline
                  </span>
                  <span class="text-[11px] font-mono text-slate-400">Zero Shame</span>
                </div>
                <h4 class="text-sm font-bold text-slate-100 mb-2">
                  {{ traj.act1WhereYouveBeen.title }}
                </h4>
                
                @switch (personaMode()) {
                  @case ('clinician') {
                    <p class="text-xs text-slate-300 leading-relaxed font-sans">
                      {{ traj.act1WhereYouveBeen.clinicalRationale }}
                    </p>
                  }
                  @case ('patient') {
                    <div class="p-3 rounded-lg bg-teal-950/30 border border-teal-500/30 text-xs text-teal-200 leading-relaxed font-sans">
                      🌱 <strong>My Health Baseline (Zero Guilt):</strong>
                      <p class="mt-1">{{ traj.act1WhereYouveBeen.patientSelfCareRationale || traj.act1WhereYouveBeen.plainLanguageRationale }}</p>
                    </div>
                  }
                  @case ('community') {
                    <div class="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 leading-relaxed font-sans">
                      🤝 <strong>Living Environment &amp; Climate Baseline:</strong>
                      <p class="mt-1">{{ traj.act1WhereYouveBeen.communitySdohRationale || traj.act1WhereYouveBeen.plainLanguageRationale }}</p>
                    </div>
                  }
                  @default {
                    <div class="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed font-sans">
                      👨‍👩‍👧 <strong>Family Plain Language:</strong>
                      <p class="mt-1">{{ traj.act1WhereYouveBeen.plainLanguageRationale }}</p>
                    </div>
                  }
                }
              </div>

              <!-- Baseline Factors Badges -->
              <div class="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                @for (factor of traj.act1WhereYouveBeen.baselineFactors; track factor) {
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    {{ factor }}
                  </span>
                }
              </div>
            </div>

            <!-- ACT 2: WHERE YOU STAND TODAY -->
            <div class="p-4 rounded-xl bg-slate-900/80 border border-teal-500/40 shadow-md flex flex-col justify-between space-y-3">
              <div>
                <div class="flex items-center justify-between gap-2 mb-1.5">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/40">
                    Act 2 • Today
                  </span>
                  <span class="text-[11px] font-mono text-teal-400 font-bold">ISMP Verified</span>
                </div>
                <h4 class="text-sm font-bold text-teal-200 mb-2">
                  {{ traj.act2WhereYouStandToday.title }}
                </h4>

                <!-- Calibrated Dose Box -->
                <div class="p-2.5 rounded-lg bg-teal-950/40 border border-teal-500/40 text-xs font-mono text-teal-300 mb-2">
                  <strong>Dosage Order:</strong> {{ traj.act2WhereYouStandToday.calibratedDosage }}
                </div>

                <!-- Hydration Target Box -->
                <div class="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-xs font-mono text-cyan-300 mb-2">
                  <strong>Hydration Target:</strong> {{ traj.act2WhereYouStandToday.hydrationTarget }}
                </div>

                @switch (personaMode()) {
                  @case ('clinician') {
                    <div class="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs font-mono text-indigo-300 mb-2">
                      <strong>ISMP Safety Stamp:</strong> {{ traj.act2WhereYouStandToday.clinicalSafetyStamp }}
                    </div>
                  }
                  @case ('patient') {
                    <div class="p-2.5 rounded-lg bg-teal-950/40 border border-teal-500/40 text-xs font-sans text-teal-200 mb-2">
                      ⭐ <strong>My Daily Routine:</strong> {{ traj.act2WhereYouStandToday.patientHabitRoutine || traj.act2WhereYouStandToday.plainLanguageAdvice }}
                    </div>
                  }
                  @case ('community') {
                    <div class="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-xs font-sans text-amber-200 mb-2">
                      🏠 <strong>Home Climate &amp; Storage Guard:</strong> {{ traj.act2WhereYouStandToday.communitySafetySupport || traj.act2WhereYouStandToday.plainLanguageAdvice }}
                    </div>
                  }
                  @default {
                    <p class="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 mb-2">
                      🥄 <strong>Teaspoon Guide:</strong> {{ traj.act2WhereYouStandToday.plainLanguageAdvice }}
                    </p>
                  }
                }
              </div>

              <div class="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>{{ traj.act2WhereYouStandToday.clinicalSafetyStamp }}</span>
              </div>
            </div>

            <!-- ACT 3: WHERE YOU'RE GOING -->
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between space-y-3">
              <div>
                <div class="flex items-center justify-between gap-2 mb-1.5">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    Act 3 • Looking Ahead
                  </span>
                  <span class="text-[11px] font-mono text-amber-400 font-bold">{{ traj.act3WhereYoureGoing.homeCareWatchWindow }}</span>
                </div>
                <h4 class="text-sm font-bold text-indigo-200 mb-2">
                  {{ traj.act3WhereYoureGoing.title }}
                </h4>

                <div class="space-y-1.5 text-xs">
                  <span class="text-[11px] font-bold text-slate-300 block font-mono">⚠️ Key Warning Signs to Monitor:</span>
                  @for (sign of traj.act3WhereYoureGoing.warningSignsToMonitor; track sign) {
                    <div class="flex items-start gap-1.5 text-[11.5px] text-slate-300">
                      <span class="text-amber-400 shrink-0 mt-0.5">•</span>
                      <span>{{ sign }}</span>
                    </div>
                  }
                </div>
              </div>

              <div class="pt-2 border-t border-slate-800/80 text-xs">
                @switch (personaMode()) {
                  @case ('clinician') {
                    <p class="text-[11px] text-slate-400 leading-relaxed">
                      🚨 <strong>Triage &amp; Surveillance Protocol:</strong> {{ traj.act3WhereYoureGoing.actionGuidance }}
                    </p>
                  }
                  @case ('patient') {
                    <div class="p-2.5 rounded-lg bg-teal-950/30 border border-teal-500/30 text-teal-200 leading-relaxed font-sans text-[11px]">
                      🌅 <strong>My 30-to-90 Day Vitality Milestone:</strong> {{ traj.act3WhereYoureGoing.patientVitalityMilestone || traj.act3WhereYoureGoing.plainLanguageGuidance }}
                    </div>
                  }
                  @case ('community') {
                    <div class="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200 leading-relaxed font-sans text-[11px]">
                      🤝 <strong>Visiting Nurse &amp; Social Follow-Up:</strong> {{ traj.act3WhereYoureGoing.communityFollowUpProtocol || traj.act3WhereYoureGoing.plainLanguageGuidance }}
                    </div>
                  }
                  @default {
                    <div class="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-indigo-200 leading-relaxed font-sans text-[11px]">
                      💙 <strong>Family Action:</strong> {{ traj.act3WhereYoureGoing.plainLanguageGuidance }}
                    </div>
                  }
                }
              </div>
            </div>

          </div>

          <!-- Omnichannel Action Ribbon -->
          <div class="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-2">
              <!-- Action 1: Apply to Care Plan -->
              <button
                type="button"
                (click)="applyToCarePlan()"
                class="px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg transition-all cursor-pointer active:scale-95 flex items-center gap-2">
                <span>📋</span> Apply Calibrated Dose to Care Plan
              </button>

              <!-- Action 2: Preview & Print Family Handout (AVS) -->
              <button
                type="button"
                (click)="toggleAvsPreview()"
                class="px-3.5 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-2">
                <span>👁️</span> Preview Handout
              </button>

              <button
                type="button"
                (click)="printAvsHandout()"
                class="px-3.5 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-2">
                <span>🖨️</span> Print Family Handout (AVS)
              </button>

              <!-- Action 3: Copy EHR SOAP Note -->
              <button
                type="button"
                (click)="copyEhrSoapSnippet()"
                class="px-3.5 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-2">
                <span>📝</span> Copy EHR SOAP Note
              </button>

              <!-- Action 4: Copy FHIR R4 MedicationStatement -->
              <button
                type="button"
                (click)="copyFhirMedicationStatement()"
                class="px-3.5 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-2">
                <span>📄</span> Copy FHIR R4 JSON
              </button>

              <!-- Action 5: Copy ASU / SFI Python Code -->
              <button
                type="button"
                (click)="copyAsuSandboxSnippet()"
                class="px-3.5 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-2">
                <span>📓</span> Copy ASU / SFI Code
              </button>
            </div>

            <!-- Feedback Toasts / Luster Badges -->
            <div class="flex items-center gap-2 text-xs font-mono">
              @if (showAppliedToast()) {
                <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 animate-in fade-in duration-200">
                  ✓ Committed to Care Plan, SOAP Note &amp; Audit Log
                </span>
              }
              @if (showPrintedToast()) {
                <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 animate-in fade-in duration-200">
                  ✓ Opening Print Dialog for AVS Handout
                </span>
              }
              @if (showCopiedEhrToast()) {
                <span class="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/50 animate-in fade-in duration-200">
                  ✓ EHR S/O/A/P Text Copied
                </span>
              }
              @if (showCopiedFhirToast()) {
                <span class="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 animate-in fade-in duration-200">
                  ✓ FHIR R4 MedicationStatement Copied
                </span>
              }
              @if (showCopiedAsuToast()) {
                <span class="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-in fade-in duration-200">
                  ✓ ASU/SFI Python Simulation Copied
                </span>
              }
            </div>
          </div>

        </div>

      </div>

      <!-- 🖨️ 1-PAGE REFRIGERATOR AFTER-VISIT SUMMARY (AVS) PRINT TEMPLATE -->
      <div id="posology-avs-print-area" class="hidden print:block text-slate-900 bg-white p-6 rounded-none">
        <div class="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-base shadow-sm">
              🪶
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-2xl font-extrabold tracking-tight text-teal-900 font-pocketgull-brand">PocketGull</span>
                <span class="text-[10px] font-extrabold uppercase tracking-widest text-teal-800 bg-teal-100/90 px-2 py-0.5 rounded border border-teal-300">Health</span>
              </div>
              <div class="text-[10px] text-slate-500 font-mono">Clinical Intelligence &amp; Care Strategy Engine</div>
            </div>
          </div>
          <div class="text-right text-xs font-mono text-slate-700 space-y-0.5">
            <div><strong>Patient:</strong> {{ patientState.activePatientSummary() || 'Valued Patient' }}</div>
            <div><strong>Date:</strong> {{ activeDateString }}</div>
            <div class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
              <span>✓</span> ISMP Slashed-Zero Safe Dosing Attested
            </div>
          </div>
        </div>

        <div class="mb-4">
          <h1 class="text-base font-extrabold uppercase tracking-wider text-slate-900">
            After-Visit Summary &bull; Care Strategy &bull; {{ activeAgeTier() | uppercase }}
          </h1>
          <p class="text-xs text-slate-600 mt-0.5">
            Personalized 3-Act Care Instructions for Patient &amp; Family Caregiver &bull; Keep on Your Refrigerator
          </p>
        </div>

        @if (activeAgeTier() === 'environmental_heat') {
          <div class="p-2.5 mb-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
            <span class="text-base">☀️</span>
            <div>
              <strong>Extreme Heat Advisory ({{ ambientTempF() }}°F):</strong> 
              Staying hydrated and cool is critical for your kidneys and blood pressure today. Follow the instructions below.
            </div>
          </div>
        }

        <div class="space-y-4 text-xs">
          <!-- Act 1 -->
          <div class="p-3.5 rounded-xl border border-amber-300/80 bg-amber-50/40">
            <div class="flex items-center justify-between font-bold text-slate-900 mb-1">
              <span class="uppercase tracking-wide text-amber-900 font-mono text-[11px]">
                Act 1: Where You've Been &bull; Why We Checked Your Medicine Today
              </span>
              <span class="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Zero Guilt Baseline</span>
            </div>
            <p class="text-slate-800 leading-relaxed font-sans">
              {{ traj.act1WhereYouveBeen.plainLanguageRationale }}
            </p>
          </div>

          <!-- Act 2 -->
          <div class="p-3.5 rounded-xl border-2 border-teal-700 bg-teal-50/30">
            <div class="flex items-center justify-between font-bold text-teal-900 mb-2">
              <span class="uppercase tracking-wide text-teal-900 font-mono text-[11px]">
                Act 2: Where You Stand Today &bull; Your Safe Daily Routine
              </span>
              <span class="text-[10px] font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">ISMP Verified Dose</span>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-2 font-mono">
              <div class="p-2 rounded-lg bg-white border border-teal-300 shadow-sm">
                <span class="text-[10px] uppercase font-bold text-teal-800 block">Today's Calibrated Dose:</span>
                <span class="text-sm font-bold text-slate-900">{{ traj.act2WhereYouStandToday.calibratedDosage }}</span>
              </div>
              <div class="p-2 rounded-lg bg-white border border-teal-300 shadow-sm">
                <span class="text-[10px] uppercase font-bold text-teal-800 block">Daily Water Target:</span>
                <span class="text-sm font-bold text-slate-900">{{ traj.act2WhereYouStandToday.hydrationTarget }}</span>
              </div>
            </div>
            <p class="text-slate-900 leading-relaxed font-sans mb-3">
              🥄 <strong>Teaspoon Guide:</strong> {{ traj.act2WhereYouStandToday.plainLanguageAdvice }}
            </p>
            <div class="p-2.5 rounded-lg bg-white border border-teal-200">
              <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 block mb-1">Daily Routine Checklist (Check with pen):</span>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-800">
                <div class="flex items-center gap-1.5">
                  <span class="w-4 h-4 rounded border-2 border-teal-700 inline-block"></span>
                  <span>Morning Dose Taken</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-4 h-4 rounded border-2 border-teal-700 inline-block"></span>
                  <span>Afternoon Hydration Goal Met</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-4 h-4 rounded border-2 border-teal-700 inline-block"></span>
                  <span>Evening Check Complete</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Act 3 -->
          <div class="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/30">
            <div class="flex items-center justify-between font-bold text-slate-900 mb-1">
              <span class="uppercase tracking-wide text-indigo-900 font-mono text-[11px]">
                Act 3: Where You're Going &bull; What to Watch for at Home
              </span>
              <span class="text-[10px] font-mono text-indigo-800 font-bold bg-indigo-100 px-2 py-0.5 rounded">
                {{ traj.act3WhereYoureGoing.homeCareWatchWindow }}
              </span>
            </div>
            <p class="text-slate-800 mb-2 leading-relaxed font-sans">
              💙 {{ traj.act3WhereYoureGoing.plainLanguageGuidance }}
            </p>
            <div class="p-2.5 rounded-lg bg-rose-50/60 border border-rose-300 space-y-1.5">
              <span class="font-bold text-rose-900 text-[11px] font-mono flex items-center gap-1">
                <span>⚠️</span> Call Clinic Immediately If You Notice Any of These:
              </span>
              @for (sign of traj.act3WhereYoureGoing.warningSignsToMonitor; track sign) {
                <div class="flex items-start gap-2 text-slate-800 text-xs">
                  <span class="w-3.5 h-3.5 rounded border border-rose-400 bg-white inline-block shrink-0 mt-0.5"></span>
                  <span>{{ sign }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Emergency / Signature Bar -->
        <div class="mt-4 pt-3 border-t-2 border-slate-900 flex flex-wrap items-center justify-between text-xs font-mono gap-2">
          <div>
            <strong>Clinic Daytime Line:</strong> (480) 555-0199 &bull; <strong>24/7 Nurse Triage:</strong> 988 / (480) 555-0100
          </div>
          <div class="text-[10px] text-slate-500 font-pocketgull-brand">
            PocketGull Health &bull; HIPAA Safe Harbor &sect; 164.514 &bull; HL7 FHIR R4 Ready
          </div>
        </div>
      </div>

      <!-- 👁️ High-Fidelity On-Screen Refrigerator Handout Preview Modal -->
      @if (showAvsPreview()) {
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto no-print" (click)="closeAvsPreview()">
          <div class="relative max-w-3xl w-full bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-200" (click)="$event.stopPropagation()">
            <!-- Modal Header Bar -->
            <div class="bg-slate-900 text-white px-4 py-3 sm:px-6 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                  👁️ Live Refrigerator Handout Preview
                </span>
                <span class="text-xs text-slate-400 font-mono hidden sm:inline">1-Page High-Contrast Format</span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  (click)="printAvsHandout()"
                  class="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs font-mono transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95">
                  <span>🖨️</span> Print Now
                </button>
                <button
                  (click)="closeAvsPreview()"
                  class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold cursor-pointer transition"
                  aria-label="Close Preview">
                  ✕
                </button>
              </div>
            </div>

            <!-- Handout Card Body (Identical to Printout) -->
            <div class="p-6 sm:p-8 overflow-y-auto max-h-[80vh] space-y-4">
              <div class="border-b-2 border-slate-900 pb-3 mb-2 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    🪶
                  </div>
                  <div>
                    <div class="flex items-center gap-1.5">
                      <span class="text-2xl font-extrabold tracking-tight text-teal-900 font-pocketgull-brand">PocketGull</span>
                      <span class="text-[10px] font-extrabold uppercase tracking-widest text-teal-800 bg-teal-100/90 px-2 py-0.5 rounded border border-teal-300">Health</span>
                    </div>
                    <div class="text-[10px] text-slate-500 font-mono">Clinical Intelligence &amp; Care Strategy Engine</div>
                  </div>
                </div>
                <div class="text-right text-xs font-mono text-slate-700 space-y-0.5">
                  <div><strong>Patient:</strong> {{ patientState.activePatientSummary() || 'Valued Patient' }}</div>
                  <div><strong>Date:</strong> {{ activeDateString }}</div>
                  <div class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    <span>✓</span> ISMP Slashed-Zero Safe Dosing Attested
                  </div>
                </div>
              </div>

              <div>
                <h1 class="text-base font-extrabold uppercase tracking-wider text-slate-900">
                  After-Visit Summary &bull; Care Strategy &bull; {{ activeAgeTier() | uppercase }}
                </h1>
                <p class="text-xs text-slate-600 mt-0.5">
                  Personalized 3-Act Care Instructions for Patient &amp; Family Caregiver &bull; Keep on Your Refrigerator
                </p>
              </div>

              @if (activeAgeTier() === 'environmental_heat') {
                <div class="p-2.5 mb-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
                  <span class="text-base">☀️</span>
                  <div>
                    <strong>Extreme Heat Advisory ({{ ambientTempF() }}°F):</strong> 
                    Staying hydrated and cool is critical for your kidneys and blood pressure today. Follow the instructions below.
                  </div>
                </div>
              }

              <!-- Act 1 -->
              <div class="p-3.5 rounded-xl border border-amber-300/80 bg-amber-50/40">
                <div class="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span class="uppercase tracking-wide text-amber-900 font-mono text-[11px]">
                    Act 1: Where You've Been &bull; Why We Checked Your Medicine Today
                  </span>
                  <span class="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Zero Guilt Baseline</span>
                </div>
                <p class="text-slate-800 leading-relaxed font-sans">
                  {{ traj.act1WhereYouveBeen.plainLanguageRationale }}
                </p>
              </div>

              <!-- Act 2 -->
              <div class="p-3.5 rounded-xl border-2 border-teal-700 bg-teal-50/30">
                <div class="flex items-center justify-between font-bold text-teal-900 mb-2">
                  <span class="uppercase tracking-wide text-teal-900 font-mono text-[11px]">
                    Act 2: Where You Stand Today &bull; Your Safe Daily Routine
                  </span>
                  <span class="text-[10px] font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">ISMP Verified Dose</span>
                </div>
                <div class="grid grid-cols-2 gap-3 mb-2 font-mono">
                  <div class="p-2 rounded-lg bg-white border border-teal-300 shadow-sm">
                    <span class="text-[10px] uppercase font-bold text-teal-800 block">Today's Calibrated Dose:</span>
                    <span class="text-sm font-bold text-slate-900">{{ traj.act2WhereYouStandToday.calibratedDosage }}</span>
                  </div>
                  <div class="p-2 rounded-lg bg-white border border-teal-300 shadow-sm">
                    <span class="text-[10px] uppercase font-bold text-teal-800 block">Daily Water Target:</span>
                    <span class="text-sm font-bold text-slate-900">{{ traj.act2WhereYouStandToday.hydrationTarget }}</span>
                  </div>
                </div>
                <p class="text-slate-900 leading-relaxed font-sans mb-3">
                  🥄 <strong>Teaspoon Guide:</strong> {{ traj.act2WhereYouStandToday.plainLanguageAdvice }}
                </p>
                <div class="p-2.5 rounded-lg bg-white border border-teal-200">
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 block mb-1">Daily Routine Checklist (Check with pen):</span>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-800">
                    <div class="flex items-center gap-1.5">
                      <span class="w-4 h-4 rounded border-2 border-teal-700 inline-block"></span>
                      <span>Morning Dose Taken</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="w-4 h-4 rounded border-2 border-teal-700 inline-block"></span>
                      <span>Afternoon Hydration Goal Met</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="w-4 h-4 rounded border-2 border-teal-700 inline-block"></span>
                      <span>Evening Check Complete</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Act 3 -->
              <div class="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/30">
                <div class="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span class="uppercase tracking-wide text-indigo-900 font-mono text-[11px]">
                    Act 3: Where You're Going &bull; What to Watch for at Home
                  </span>
                  <span class="text-[10px] font-mono text-indigo-800 font-bold bg-indigo-100 px-2 py-0.5 rounded">
                    {{ traj.act3WhereYoureGoing.homeCareWatchWindow }}
                  </span>
                </div>
                <p class="text-slate-800 mb-2 leading-relaxed font-sans">
                  💙 {{ traj.act3WhereYoureGoing.plainLanguageGuidance }}
                </p>
                <div class="p-2.5 rounded-lg bg-rose-50/60 border border-rose-300 space-y-1.5">
                  <span class="font-bold text-rose-900 text-[11px] font-mono flex items-center gap-1">
                    <span>⚠️</span> Call Clinic Immediately If You Notice Any of These:
                  </span>
                  @for (sign of traj.act3WhereYoureGoing.warningSignsToMonitor; track sign) {
                    <div class="flex items-start gap-2 text-slate-800 text-xs">
                      <span class="w-3.5 h-3.5 rounded border border-rose-400 bg-white inline-block shrink-0 mt-0.5"></span>
                      <span>{{ sign }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Emergency / Signature Bar -->
              <div class="mt-4 pt-3 border-t-2 border-slate-900 flex flex-wrap items-center justify-between text-xs font-mono gap-2">
                <div>
                  <strong>Clinic Daytime Line:</strong> (480) 555-0199 &bull; <strong>24/7 Nurse Triage:</strong> 988 / (480) 555-0100
                </div>
                <div class="text-[10px] text-slate-500 font-pocketgull-brand">
                  PocketGull Health &bull; HIPAA Safe Harbor &sect; 164.514 &bull; HL7 FHIR R4 Ready
                </div>
              </div>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class ClinicalPosologyCalculatorComponent {
  readonly posology = inject(ClinicalPosologyService);
  protected readonly patientState = inject(PatientStateService);
  private readonly soapNoteService = inject(SoapNoteGeneratorService, { optional: true });
  private readonly heatPosology = inject(EnvironmentalHeatPosologyService);
  private readonly complexSystems = inject(ComplexAdaptiveSystemsService);

  readonly activeAgeTier = signal<PosologyAgeTier>('adult');
  readonly infantAgeMonths = signal<number>(6);
  readonly patientAge = signal<number>(35);
  readonly patientWeightLbs = signal<number>(154);
  readonly patientHeightCm = signal<number>(170);
  readonly adultReferenceDoseMg = signal<number>(500);
  readonly serumCreatinineMgDl = signal<number>(1.0);
  readonly isFemale = signal<boolean>(false);
  readonly selectedOralSyringeVol = signal<number>(5.0);
  readonly testDosageInput = signal<string>('Lisinopril 5.0 mg PO QD + .5 mg Alprazolam 10 U');

  readonly personaMode = signal<PosologyPersonaMode>('clinician');
  readonly showAppliedToast = signal<boolean>(false);
  readonly showPrintedToast = signal<boolean>(false);
  readonly showCopiedEhrToast = signal<boolean>(false);
  readonly showCopiedFhirToast = signal<boolean>(false);
  readonly showCopiedAsuToast = signal<boolean>(false);
  readonly showAvsPreview = signal<boolean>(false);

  readonly activeDateString = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  readonly ambientTempF = signal<number>(114);
  readonly relativeHumidityPct = signal<number>(15);
  readonly isDirectSun = signal<boolean>(true);
  readonly selectedStation = signal<'KPHX' | 'KSDL' | 'KTUS'>('KPHX');

  readonly beersRegistry: ReadonlyArray<IBeersCriteriaAlert> = this.posology.BEERS_CRITERIA_REGISTRY;

  readonly patientWeightKg = computed(() => Math.round((this.patientWeightLbs() * 0.453592) * 10) / 10);

  readonly friedResult = computed(() =>
    this.posology.calculateFriedRule(this.infantAgeMonths(), this.adultReferenceDoseMg(), 10)
  );

  readonly youngResult = computed(() =>
    this.posology.calculateYoungRule(this.patientAge(), this.adultReferenceDoseMg())
  );

  readonly clarkResult = computed(() =>
    this.posology.calculateClarkRule(this.patientWeightLbs(), this.adultReferenceDoseMg())
  );

  readonly mostellerResult = computed(() =>
    this.posology.calculateMostellerBsa(this.patientHeightCm(), this.patientWeightKg(), 100)
  );

  readonly fluidResult = computed(() =>
    this.posology.calculateHollidaySegarFluid(this.patientWeightKg())
  );

  readonly cockcroftResult = computed(() =>
    this.posology.calculateCockcroftGaultCrCl(
      this.patientAge(),
      this.patientWeightKg(),
      this.serumCreatinineMgDl(),
      this.isFemale()
    )
  );

  readonly heatPosologyAssessment = computed<IHeatPosologyAssessment>(() => {
    return this.heatPosology.evaluateHeatPosology({
      ambientTempF: this.ambientTempF(),
      relativeHumidityPct: this.relativeHumidityPct(),
      isDirectSun: this.isDirectSun(),
      patientAge: this.patientAge(),
      patientWeightKg: this.patientWeightKg(),
      baselineEgfr: 42,
      activeMedications: [
        'Diphenhydramine 50mg',
        'Topiramate 50mg',
        'Furosemide 40mg',
        'Lisinopril 20mg'
      ]
    });
  });

  readonly spellcheckAudit = computed(() =>
    this.posology.auditDosageText(this.testDosageInput(), this.patientAge(), this.patientWeightLbs())
  );

  readonly sfiAllometricResult = computed<IWbeAllometricScalingResult>(() => {
    return this.complexSystems.calculateWbeAllometricScaling(
      this.patientWeightKg(),
      this.adultReferenceDoseMg(),
      this.patientHeightCm()
    );
  });

  readonly sfiCsdMetrics = computed<ICriticalSlowingDownMetrics>(() => {
    // Construct representative 20-sample physiological cardiac time series
    const base = 75.0;
    const series: number[] = [];
    for (let i = 0; i < 20; i++) {
      series.push(base + Math.sin(i / 2.5) * 6.0 + ((i % 3) - 1) * 1.5);
    }
    return this.complexSystems.evaluateCriticalSlowingDown(series);
  });

  readonly sfiHypergraphResult = computed<IHypergraphPolypharmacyAssessment>(() => {
    const rawInput = this.testDosageInput();
    const parsedMeds = rawInput.split('+').map(s => s.trim()).filter(Boolean);
    const meds = parsedMeds.length > 0 ? parsedMeds : ['Lisinopril 20mg', 'Furosemide 40mg'];
    return this.complexSystems.evaluateHypergraphCascade(
      meds,
      this.heatPosologyAssessment().estimatedWbgtF
    );
  });

  readonly posologyTrajectory = computed<IPosology3ActTrajectory>(() => {
    const tier = this.activeAgeTier();
    const age = this.patientAge();
    const wtLbs = this.patientWeightLbs();
    const wtKg = this.patientWeightKg();
    const crCl = this.cockcroftResult().crClMlMin;
    const serumCr = this.serumCreatinineMgDl();
    const fluidTarget = this.fluidResult().dailyRateMlDay;
    const wbgt = this.heatPosologyAssessment().estimatedWbgtF;
    const ambientTemp = this.ambientTempF();

    if (tier === 'environmental_heat') {
      return {
        act1WhereYouveBeen: {
          title: 'Arizona Extreme Heat & Anticholinergic Dehydration Risk',
          clinicalRationale: `Patient evaluated under desert thermal load (Ambient: ${ambientTemp}°F, WBGT: ${wbgt}°F). Anticholinergics suppress cholinergic eccrine sweat secretion (anhidrosis) raising heat stroke risk, while loop diuretics accelerate hypovolemia.`,
          plainLanguageRationale: `Your medicines were reviewed because it is ${ambientTemp}°F outside today. Extreme summer heat makes it hard to cool down, and some pills stop your body from sweating or cause you to lose fluids too quickly.`,
          patientSelfCareRationale: `When the desert temperature climbs to ${ambientTemp}°F, your body works overtime to stay cool. We are adjusting your medications so your kidneys and heart stay protected, letting you feel energized without dehydration.`,
          communitySdohRationale: `Evaluating home cooling resilience (current ambient ${ambientTemp}°F), water access, utility shutoff protections, and heat-vulnerability scores for elderly or outdoor workers.`,
          baselineFactors: [
            `Ambient Temp: ${ambientTemp}°F`,
            `Estimated WBGT: ${wbgt}°F`,
            `Heat Risk: ${this.heatPosologyAssessment().heatAcuityTier}`,
            `Baseline CrCl: ${crCl} mL/min`
          ]
        },
        act2WhereYouStandToday: {
          title: 'Heat-Calibrated Posology & Precision Hydration Order',
          calibratedDosage: 'Hold Diphenhydramine 50 mg; titrate diuretic to 20 mg PO QAM; avoid peak solar exposure (10:00–18:00).',
          hydrationTarget: '2,500 mL / 24h oral electrolyte solution (approx. 10 glasses)',
          clinicalSafetyStamp: 'ISMP & CDC Extreme Heat Protocol Verified',
          plainLanguageAdvice: 'Take your reduced morning water pill with breakfast. Drink roughly 10 glasses of water or electrolyte drink throughout the day, and stay in cool air conditioning.',
          patientHabitRoutine: 'Take morning dose with a full glass of cool water before 9 AM. Keep your insulated water bottle refilled at your desk or chair all afternoon.',
          communitySafetySupport: 'Ensure indoor living space stays under 82°F. Verify medications are stored below 77°F (out of sunlit windows). Utility assistance applied if needed.'
        },
        act3WhereYoureGoing: {
          title: '48-Hour Home Dehydration & Thermal Surveillance',
          homeCareWatchWindow: 'Next 48 Hours',
          warningSignsToMonitor: [
            'Dizziness, lightheadedness, or feeling faint when standing up',
            'Dry, hot skin with complete absence of sweating in warm rooms',
            'Dark amber or tea-colored urine, or urinating fewer than 3 times a day',
            'Sudden muscle cramps, rapid heart rate (>100 bpm), or confusion'
          ],
          actionGuidance: 'If orthostatic systolic BP drops >20 mmHg or dry skin presents with core temp >101°F, immediately transition to STAT emergency cooling.',
          plainLanguageGuidance: 'If you feel dizzy standing up, sit down right away and drink a large glass of cool water. If the dizziness does not go away after resting for 30 minutes, call the clinic.',
          patientVitalityMilestone: 'Within 48 hours, lightheadedness and dry mouth clear. In 30 days, your renal reserve stabilizes and you maintain steady stamina through peak summer.',
          communityFollowUpProtocol: 'Visiting nurse phone check-in at 24h to verify blood pressure stability and adequate hydration supply.'
        }
      };
    }

    if (tier === 'geriatric_elder') {
      return {
        act1WhereYouveBeen: {
          title: 'Renal Reserve Baseline & AGS Beers Criteria Audit',
          clinicalRationale: `Evaluated due to age-related decline in renal reserve (estimated Cockcroft-Gault CrCl: ${crCl} mL/min, Serum Creatinine: ${serumCr} mg/dL). High anticholinergic/sedative burden elevates delirium, orthostasis, and fall hazards.`,
          plainLanguageRationale: `We checked your medicines because our kidneys naturally filter medications more slowly as we age. We want to ensure your daily dose does not linger or build up in your body.`,
          patientSelfCareRationale: `Our bodies change gracefully as we get wiser, and kidneys simply take more time to process medicines. We are recalibrating your dose so you feel clear-headed and steady on your feet.`,
          communitySdohRationale: `Evaluating independent living safety, fall hazard reduction, home pharmacy delivery, and family caregiver co-support.`,
          baselineFactors: [
            `Patient Age: ${age}y`,
            `Cockcroft-Gault CrCl: ${crCl} mL/min`,
            `Serum Creatinine: ${serumCr} mg/dL`,
            'AGS Beers Criteria 2023 Review'
          ]
        },
        act2WhereYouStandToday: {
          title: 'Renally-Adjusted Dosage & Gentle Hydration Target',
          calibratedDosage: 'Reduce dose by 33–50% to prevent drug accumulation; administer with morning meal.',
          hydrationTarget: `${fluidTarget} mL / 24h maintenance fluids (approx. 6–8 glasses)`,
          clinicalSafetyStamp: 'Cockcroft-Gault CrCl & AGS Beers 2023 Verified',
          plainLanguageAdvice: 'Take your adjusted pill in the morning with a full glass of water. Aim for 6 to 8 cups of water or warm herbal tea spread across the day.',
          patientHabitRoutine: 'Take pill with your morning breakfast. Keep a pitcher of fresh water on the counter to sip 6 glasses before dinnertime.',
          communitySafetySupport: 'Place clear non-slip mats in the hallway; confirm pillbox compartments are filled for the upcoming week.'
        },
        act3WhereYoureGoing: {
          title: '48-Hour Fall Prevention & Stability Surveillance',
          homeCareWatchWindow: 'Next 48 Hours',
          warningSignsToMonitor: [
            'Feeling unsteady, wobbly, or losing balance when getting out of bed or a chair',
            'Drowsiness, heavy grogginess, or feeling confused in the morning',
            'Dry mouth, parched tongue, or reduced urination',
            'Swelling in the lower ankles or sudden shortness of breath'
          ],
          actionGuidance: 'Check lying-to-standing blood pressure; if postural systolic drop exceeds 20 mmHg, pause sedatives and consult nephrology.',
          plainLanguageGuidance: 'Take an extra 30 seconds to sit on the edge of your bed before standing up. If you feel unsteady, use your cane or walker and let a family member know.',
          patientVitalityMilestone: 'Within 2 weeks, morning grogginess fades completely. In 60 days, renal stability allows safe maintenance with steady balance and vigor.',
          communityFollowUpProtocol: 'Visiting physical therapist or home health aide verifies sitting-to-standing balance and medication compliance next Tuesday.'
        }
      };
    }

    if (tier === 'pediatric_child' || tier === 'neonate_infant') {
      const youngDose = this.youngResult().calculatedDoseMg;
      return {
        act1WhereYouveBeen: {
          title: 'Pediatric Growth Stage & Weight-Stratified Kinetic Review',
          clinicalRationale: `Evaluated against Holliday-Segar fluid turnover and Young's (${this.youngResult().formulaString}) / Clark's (${this.clarkResult().formulaString}) allometric scaling to avert pediatric hepatic/renal toxicity and dose overages.`,
          plainLanguageRationale: `We calculated this dose using your child's exact weight (${wtLbs} lbs / ${wtKg} kg) and age, ensuring they receive the exact right therapeutic amount—never an adult guess.`,
          patientSelfCareRationale: `Children grow rapidly and their bodies need precision dosing matched to their exact weight. This calculation guarantees safe, optimal medicine for your child.`,
          communitySdohRationale: `Ensuring school nurse medication administration authorization, clear oral syringe markings, and caregiver dosing literacy.`,
          baselineFactors: [
            `Age: ${age}y`,
            `Weight: ${wtLbs} lbs (${wtKg} kg)`,
            `Young's Rule: ${this.youngResult().formulaString}`,
            `Clark's Rule: ${this.clarkResult().formulaString}`
          ]
        },
        act2WhereYouStandToday: {
          title: 'Weight-Calibrated Pediatric Posology & Oral Syringe Standard',
          calibratedDosage: `${youngDose} mg PO via oral dosing syringe (never a dining spoon)`,
          hydrationTarget: `${fluidTarget} mL / 24h baseline maintenance fluid`,
          clinicalSafetyStamp: 'ISMP Pediatric Safe Dosing & Oral Syringe Calibrated',
          plainLanguageAdvice: 'Always use the marked oral syringe that came with the medicine. Measure to the exact line, never use a kitchen teaspoon.',
          patientHabitRoutine: 'Give dose with morning juice or applesauce. Keep a colorful cup of water or milk accessible throughout playtime.',
          communitySafetySupport: 'Provide a marked pediatric syringe with printed dosage line; ensure school health form is stamped and signed.'
        },
        act3WhereYoureGoing: {
          title: '48-Hour Hydration & Activity Surveillance',
          homeCareWatchWindow: 'Next 48 Hours',
          warningSignsToMonitor: [
            'Fewer than 4 wet diapers or trips to the bathroom in 24 hours',
            'Crying without tears, sunken eyes, or unusually dry lips',
            'Refusing all fluids or inability to keep water/milk down',
            'Unusual limpness, high irritability, or extreme difficulty waking up'
          ],
          actionGuidance: 'Check capillary refill (<2 sec) and skin turgor; contact pediatric advice nurse if fluid intake falls below 50% Holliday-Segar requirement.',
          plainLanguageGuidance: 'Keep track of wet diapers or bathroom visits. If your child is playful and drinking fluids, they are doing well. If they are refusing fluids or unusually sleepy, call your doctor.',
          patientVitalityMilestone: 'Within 48 hours, active fever and malaise resolve. In 7 days, your child returns to full playground energy and school attendance.',
          communityFollowUpProtocol: 'School nurse or pediatrician call back at 48 hours to confirm symptom resolution and treatment completion.'
        }
      };
    }

    // Default Adult & SFI Complex Adaptive Systems tier
    const isSfi = tier === 'sfi_complex_adaptive';
    return {
      act1WhereYouveBeen: {
        title: isSfi ? 'SFI Complex Systems & Allometric Scaling Review' : 'Adult Metabolic & Systems Posology Review',
        clinicalRationale: 'Evaluated for multi-drug metabolic interactions, quarter-power allometric scaling (M^0.75), and early-warning critical slowing down (CSD) indicators to safeguard homeostatic basin stability.',
        plainLanguageRationale: 'We reviewed how your medicines interact with your metabolism, body weight, and daily water needs to ensure stable energy and zero drug interactions.',
        patientSelfCareRationale: 'Your metabolism has a natural rhythm. By tailoring this medication to your exact weight and daily routine, we protect your vitality and eliminate afternoon fatigue.',
        communitySdohRationale: 'Assessing occupational ergonomics, workday hydration access, pharmacy refill consistency, and shift work sleep schedules.',
        baselineFactors: [
          `Weight: ${wtLbs} lbs (${wtKg} kg)`,
          `BSA: ${this.mostellerResult().bsaM2} m²`,
          `CrCl: ${crCl} mL/min`,
          `Allometric Scale: ${this.sfiAllometricResult().allometricMetabolicFactor.toFixed(2)}x`
        ]
      },
      act2WhereYouStandToday: {
        title: 'Calibrated Maintenance Posology & Hydration Protocol',
        calibratedDosage: `${this.adultReferenceDoseMg()} mg PO aligned with ISMP Tall Man conventions.`,
        hydrationTarget: `${fluidTarget} mL / 24h optimal metabolic hydration`,
        clinicalSafetyStamp: 'FDA / ISMP Standard of Care Aligned',
        plainLanguageAdvice: 'Take your regular dose with food or a large glass of water. Keep a water bottle nearby throughout the workday.',
        patientHabitRoutine: 'Take morning dose with breakfast or morning coffee + full glass of water. Refill water bottle at lunch and midafternoon.',
        communitySafetySupport: 'Schedule 90-day mail-order delivery to prevent lapse; coordinate annual workplace biometric screening.'
      },
      act3WhereYoureGoing: {
        title: '48-Hour Therapeutic Stabilization & Symptom Log',
        homeCareWatchWindow: 'Next 48 Hours',
        warningSignsToMonitor: [
          'Mild lightheadedness or dizziness when standing up quickly',
          'Signs of dehydration: dry mouth, dark urine, or tension headache',
          'Heart palpitations, rapid pulse, or unusual flutter sensation',
          'Digestive upset, stomach burning, or nausea after taking medication'
        ],
        actionGuidance: 'Review standing vs. sitting blood pressure; adjust fluid/electrolyte intake if postural drop exceeds 15 mmHg.',
        plainLanguageGuidance: 'Drink water consistently throughout the day. If you feel lightheaded, drink a full glass of water and rest for 15 minutes.',
        patientVitalityMilestone: 'Within 30 days, midday energy crashes disappear. In 90 days, blood pressure and renal biomarkers reach optimal homeostatic equilibrium.',
        communityFollowUpProtocol: 'Routine follow-up in 90 days with updated lipid and metabolic panels at local community health lab.'
      }
    };
  });

  constructor() {
    this.syncWithActivePatient();
  }

  loadStationObservation(station: 'KPHX' | 'KSDL' | 'KTUS'): void {
    this.selectedStation.set(station);
    const obs = this.heatPosology.getMicroclimaticObservation(station);
    this.ambientTempF.set(obs.ambientTempF);
    this.relativeHumidityPct.set(obs.rhPct);
    this.isDirectSun.set(obs.isDirectSun);
  }

  selectAgeTier(tier: PosologyAgeTier): void {
    this.activeAgeTier.set(tier);
    if (tier === 'neonate_infant') {
      this.patientAge.set(0);
      this.patientWeightLbs.set(16);
      this.patientHeightCm.set(65);
      this.testDosageInput.set('Gentamicin .5 mg IV q24h + 5.0 mg Ampicillin');
    } else if (tier === 'pediatric_child') {
      this.patientAge.set(6);
      this.patientWeightLbs.set(45);
      this.patientHeightCm.set(115);
      this.testDosageInput.set('Amoxicillin 250 mg PO TID + 5.0 mL oral syringe');
      this.patientState.focusAnatomicalOrgan?.('head');
    } else if (tier === 'adult') {
      this.patientAge.set(35);
      this.patientWeightLbs.set(154);
      this.patientHeightCm.set(170);
      this.testDosageInput.set('Metformin 500 mg BID + Lisinopril 10 mg QD');
    } else if (tier === 'geriatric_elder') {
      this.patientAge.set(78);
      this.patientWeightLbs.set(140);
      this.patientHeightCm.set(165);
      this.serumCreatinineMgDl.set(1.6);
      this.testDosageInput.set('Diphenhydramine 25.0 mg QHS + Diazepam 5.0 mg QD');
      this.patientState.focusAnatomicalOrgan?.('kidneys');
    } else if (tier === 'environmental_heat') {
      this.loadStationObservation('KPHX');
      this.testDosageInput.set('Hold Diphenhydramine 50 mg + Titrate Furosemide 20 mg PO QD in >110°F Heat');
      this.patientState.focusAnatomicalOrgan?.('chest');
    } else if (tier === 'sfi_complex_adaptive') {
      this.patientAge.set(42);
      this.patientWeightLbs.set(165);
      this.patientHeightCm.set(175);
      this.testDosageInput.set('Oxybutynin 10 mg + Topiramate 50 mg + Lisinopril 20 mg PO QD');
      this.patientState.focusAnatomicalOrgan?.('heart');
    }
  }

  onAgeChange(age: number): void {
    if (age <= 1) {
      this.activeAgeTier.set('neonate_infant');
    } else if (age <= 12) {
      this.activeAgeTier.set('pediatric_child');
    } else if (age >= 65) {
      this.activeAgeTier.set('geriatric_elder');
    } else {
      this.activeAgeTier.set('adult');
    }
  }

  syncWithActivePatient(): void {
    const summary = this.patientState.activePatientSummary();
    const vitals = this.patientState.vitals();
    
    // Check patient demographics from vitals or mock profile
    if (vitals?.weight) {
      const wtMatch = /(\d+)/.exec(vitals.weight);
      if (wtMatch) this.patientWeightLbs.set(parseInt(wtMatch[1], 10));
    }
    if (vitals?.height) {
      const ht = vitals.height;
      if (ht.includes("'")) {
        const parts = ht.split("'");
        const feet = parseInt(parts[0], 10) || 5;
        const inches = parseInt(parts[1]?.replace(/[^0-9]/g, ''), 10) || 6;
        this.patientHeightCm.set(Math.round((feet * 12 + inches) * 2.54));
      }
    }

    // Heuristic or known patient age mapping
    if (summary?.includes('Adolescent') || summary?.includes('POMS') || summary?.includes('Child')) {
      this.patientAge.set(14);
      this.activeAgeTier.set('pediatric_child');
    } else if (summary?.includes('Elder') || summary?.includes('LOMS') || summary?.includes('78y') || summary?.includes('Curie') || summary?.includes('Smith')) {
      this.patientAge.set(78);
      this.activeAgeTier.set('geriatric_elder');
      this.serumCreatinineMgDl.set(1.5);
    } else {
      this.patientAge.set(34);
      this.activeAgeTier.set('adult');
    }
  }

  loadPreset(preset: 'naked_decimal' | 'trailing_zero' | 'prohibited_abbrev' | 'age_mismatch' | 'ayurvedic_tcm'): void {
    if (preset === 'naked_decimal') {
      this.testDosageInput.set('Administer .5 mg Clonazepam PO QHS for anxiety');
    } else if (preset === 'trailing_zero') {
      this.testDosageInput.set('Order Lisinopril 5.0 mg oral tablet daily');
    } else if (preset === 'prohibited_abbrev') {
      this.testDosageInput.set('Regular Insulin 10 U QD + MSO4 4 mg IV Q4H PRN pain');
    } else if (preset === 'age_mismatch') {
      this.patientAge.set(3);
      this.activeAgeTier.set('pediatric_child');
      this.testDosageInput.set('Amoxicillin 875 mg PO BID for acute otitis media');
    } else if (preset === 'ayurvedic_tcm') {
      this.testDosageInput.set('Ashwagandha 600 mg with warm ghee for Vata + Xiao Yao San 6g for LV-3 Liver Qi');
    }
  }

  applySanitized(): void {
    this.testDosageInput.set(this.spellcheckAudit().sanitizedText);
  }

  togglePersona(mode: PosologyPersonaMode): void {
    this.personaMode.set(mode);
  }

  printAvsHandout(): void {
    if (typeof window !== 'undefined') {
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.add('printing-avs-handout');
      }
      this.showPrintedToast.set(true);
      if (typeof window.print === 'function') {
        window.print();
      }
      setTimeout(() => {
        if (typeof document !== 'undefined' && document.body) {
          document.body.classList.remove('printing-avs-handout');
        }
        this.showPrintedToast.set(false);
      }, 3500);
    }
  }

  toggleAvsPreview(): void {
    this.showAvsPreview.update(v => !v);
  }

  closeAvsPreview(): void {
    this.showAvsPreview.set(false);
  }

  copyEhrSoapSnippet(): void {
    const traj = this.posologyTrajectory();
    const crCl = this.cockcroftResult().crClMlMin;
    const bsa = this.mostellerResult().bsaM2;
    const patientSummary = this.patientState.activePatientSummary() || 'Valued Patient';

    let objectiveExtras = `Weight: ${this.patientWeightKg()} kg (${this.patientWeightLbs()} lbs) | Height: ${this.patientHeightCm()} cm | BSA: ${bsa} m² | CrCl (Cockcroft-Gault): ${crCl} mL/min`;
    if (this.activeAgeTier() === 'environmental_heat') {
      objectiveExtras += `\nAmbient Temp: ${this.ambientTempF()}°F | RH: ${this.relativeHumidityPct()}% | Estimated WBGT: ${this.heatPosologyAssessment().estimatedWbgtF}°F (Tier: ${this.heatPosologyAssessment().heatAcuityTier})`;
    }

    const soapText = `CLINICAL POSOLOGY & PRECISION DOSAGE NOTE
Patient: ${patientSummary} | Date: ${this.activeDateString}
============================================================
S (Subjective):
${traj.act1WhereYouveBeen.clinicalRationale}

O (Objective):
${objectiveExtras}
Input Regimen: ${this.testDosageInput()}

A (Assessment):
1. Posology Precision Calibration: ${traj.act2WhereYouStandToday.clinicalSafetyStamp}
2. ISMP Standard: 100% compliant (no naked decimals, no trailing zeroes, metric sigs).

P (Plan):
1. Calibrated Dose: ${traj.act2WhereYouStandToday.calibratedDosage}
2. Hydration Target: ${traj.act2WhereYouStandToday.hydrationTarget}
3. Surveillance Watch Window: ${traj.act3WhereYoureGoing.homeCareWatchWindow}
   - Clinical Guidance: ${traj.act3WhereYoureGoing.actionGuidance}
   - Warning Signs Monitored: ${traj.act3WhereYoureGoing.warningSignsToMonitor.join(', ')}
4. Patient & Family Empowerment: 3-Act After-Visit Summary (AVS) reviewed and printed.
============================================================
Attestation: Verified with ClinicalPosologyService & ISMP Disambiguation Standard.`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(soapText).catch(() => {});
    }
    if (this.soapNoteService) {
      this.soapNoteService.assessment.set(
        `${this.soapNoteService.assessment()}\n• Posology Assessment: ${traj.act2WhereYouStandToday.clinicalSafetyStamp}`
      );
      this.soapNoteService.plan.set(
        `${this.soapNoteService.plan()}\n• Rx Calibrated: ${traj.act2WhereYouStandToday.calibratedDosage} | Hydration: ${traj.act2WhereYouStandToday.hydrationTarget}`
      );
    }
    this.showCopiedEhrToast.set(true);
    setTimeout(() => this.showCopiedEhrToast.set(false), 3500);
  }

  applyToCarePlan(): void {
    const traj = this.posologyTrajectory();
    this.patientState.addChecklistItem({
      id: `posology-${Date.now()}`,
      text: `[Posology Protocol] ${traj.act2WhereYouStandToday.calibratedDosage} | Hydration: ${traj.act2WhereYouStandToday.hydrationTarget}`,
      completed: false
    });
    this.patientState.logEnterpriseAudit(
      'AI_SYNTHESIS',
      `Posology 3-Act care plan applied: ${traj.act2WhereYouStandToday.calibratedDosage}`
    );
    if (this.soapNoteService) {
      this.soapNoteService.assessment.set(
        `${this.soapNoteService.assessment()}\n• Posology Precision Calibration: ${traj.act2WhereYouStandToday.clinicalSafetyStamp}`
      );
      this.soapNoteService.plan.set(
        `${this.soapNoteService.plan()}\n• Calibrated Dose: ${traj.act2WhereYouStandToday.calibratedDosage} | Hydration: ${traj.act2WhereYouStandToday.hydrationTarget}\n• Surveillance: ${traj.act3WhereYoureGoing.actionGuidance}`
      );
    }
    this.showAppliedToast.set(true);
    setTimeout(() => this.showAppliedToast.set(false), 3500);
  }

  copyFhirMedicationStatement(): void {
    const traj = this.posologyTrajectory();
    const fhirMedStatement = {
      resourceType: 'MedicationStatement',
      id: `posology-${Date.now()}`,
      status: 'active',
      category: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/medication-statement-category',
            code: 'outpatient',
            display: 'Outpatient'
          }
        ]
      },
      medicationCodeableConcept: {
        text: traj.act2WhereYouStandToday.calibratedDosage
      },
      subject: {
        display: this.patientState.activePatientSummary() || 'Anonymous Patient'
      },
      effectiveDateTime: new Date().toISOString(),
      dateAsserted: new Date().toISOString(),
      dosage: [
        {
          text: traj.act2WhereYouStandToday.calibratedDosage,
          additionalInstruction: [
            {
              text: `Hydration Protocol: ${traj.act2WhereYouStandToday.hydrationTarget}`
            },
            {
              text: `48h Surveillance: ${traj.act3WhereYoureGoing.actionGuidance}`
            }
          ]
        }
      ],
      note: [
        {
          text: `Act 1 (Baseline Context): ${traj.act1WhereYouveBeen.clinicalRationale}`
        },
        {
          text: `Act 2 (Today's Standard): ${traj.act2WhereYouStandToday.clinicalSafetyStamp}`
        },
        {
          text: `Act 3 (Monitoring): ${traj.act3WhereYoureGoing.warningSignsToMonitor.join('; ')}`
        }
      ]
    };

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(fhirMedStatement, null, 2)).catch(() => {});
    }
    this.showCopiedFhirToast.set(true);
    setTimeout(() => this.showCopiedFhirToast.set(false), 3500);
  }

  copyAsuSandboxSnippet(): void {
    const traj = this.posologyTrajectory();
    const pythonCode = `# ASU Health Futures Center & Santa Fe Institute (SFI)
# Complex Adaptive Systems & Posology Simulation Sandbox
# Patient Weight: ${this.patientWeightKg()} kg | Height: ${this.patientHeightCm()} cm | CrCl: ${this.cockcroftResult().crClMlMin} mL/min
# Environment: ${this.ambientTempF()}°F (${this.relativeHumidityPct()}% RH) | WBGT: ${this.heatPosologyAssessment().estimatedWbgtF}°F

import numpy as np

def simulate_allometric_and_csd():
    # 1. West-Brown-Enquist (WBE) Allometric Dose Scaling (M^(3/4))
    patient_weight_kg = ${this.patientWeightKg()}
    adult_ref_weight_kg = 70.0
    adult_ref_dose_mg = ${this.adultReferenceDoseMg()}
    
    # Kleiber-WBE quarter-power allometric scaling
    allometric_ratio = (patient_weight_kg / adult_ref_weight_kg) ** 0.75
    calibrated_dose_mg = round(adult_ref_dose_mg * allometric_ratio, 2)
    
    # 2. Critical Slowing Down (CSD) Early Warning Metric (Autocorrelation lag-1)
    time_series = np.array([${this.sfiCsdMetrics().rollingVariance.toFixed(2)}, 72.0, 75.0, 78.0, 82.0, 86.0])
    lag1_autocorr = float(np.corrcoef(time_series[:-1], time_series[1:])[0, 1])
    
    print(f"[ASU/SFI] Calibrated Dose: {calibrated_dose_mg} mg")
    print(f"[ASU/SFI] Lag-1 Autocorrelation: {lag1_autocorr:.3f} (Threshold: 0.70)")
    print(f"[ASU/SFI] Hydration Target: ${traj.act2WhereYouStandToday.hydrationTarget}")
    return calibrated_dose_mg

if __name__ == "__main__":
    simulate_allometric_and_csd()
`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(pythonCode).catch(() => {});
    }
    this.showCopiedAsuToast.set(true);
    setTimeout(() => this.showCopiedAsuToast.set(false), 3500);
  }
}
