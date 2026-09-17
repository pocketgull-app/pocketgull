import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalPosologyService, PosologyAgeTier, IBeersCriteriaAlert } from '../services/clinical-posology.service';
import { PatientStateService } from '../services/patient-state.service';

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

      </div>

    </div>
  `
})
export class ClinicalPosologyCalculatorComponent {
  readonly posology = inject(ClinicalPosologyService);
  private patientState = inject(PatientStateService);

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

  readonly spellcheckAudit = computed(() =>
    this.posology.auditDosageText(this.testDosageInput(), this.patientAge(), this.patientWeightLbs())
  );

  constructor() {
    this.syncWithActivePatient();
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
}
