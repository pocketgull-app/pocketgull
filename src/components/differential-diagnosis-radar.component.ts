import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DifferentialDiagnosisRadarService, IDxRadarReport, IDifferentialCandidate } from '../services/differential-diagnosis-radar.service';
import { PatientStateService } from '../services/patient-state.service';
import { IPatient } from '../services/patient.types';

@Component({
  selector: 'app-differential-diagnosis-radar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-rose-500/30 shadow-2xl space-y-6 animate-in fade-in duration-300">
      
      <!-- Header HUD -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-xl shadow-xs">
            🎯
          </div>
          <div>
            <h3 class="text-base font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              DxRadar: Socratic "Don't Miss" Differential Engine
              <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/10 text-rose-700 dark:text-rose-300 rounded-full border border-rose-500/30">
                Bayesian Nomogram
              </span>
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              Evaluates clinical syndrome presentations against high-acuity secondary organic causes to prevent cognitive anchoring.
            </p>
          </div>
        </div>

        <div class="text-right">
          <span class="text-[10px] font-mono uppercase font-bold text-zinc-400 block">Chief Syndrome Focus</span>
          <span class="text-xs font-bold text-rose-600 dark:text-rose-400">{{ report().chiefSyndrome }}</span>
        </div>
      </div>

      <!-- Popperian Falsification Banner -->
      <div class="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs space-y-1">
        <div class="font-bold text-[11px] uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <span>⚖️ Popperian Epistemological Standard:</span>
        </div>
        <p class="text-zinc-600 dark:text-zinc-400 leading-relaxed font-mono text-[11px]">
          {{ report().popperianNullHypothesis }}
        </p>
      </div>

      <!-- Differentials Cards List -->
      <div class="space-y-4">
        <h4 class="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono">
          🚨 High-Acuity Secondary Differentials to Falsify / Rule-Out
        </h4>

        <div class="grid grid-cols-1 gap-4">
          @for (item of report().topCannotMissDifferentials; track item.id) {
            <div class="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-3 hover:border-rose-500/40 transition">
              
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                      {{ item.category }}
                    </span>
                    <h5 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ item.conditionName }}</h5>
                  </div>
                </div>

                <!-- Bayesian Probability Meter -->
                <div class="flex items-center gap-3 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/40 text-xs font-mono">
                  <div>
                    <span class="text-[9px] text-zinc-400 block uppercase">Prior P(D)</span>
                    <strong class="text-zinc-600 dark:text-zinc-300">{{ item.preTestProbabilityPct }}%</strong>
                  </div>
                  <span class="text-zinc-300 dark:text-zinc-600">&rarr;</span>
                  <div>
                    <span class="text-[9px] text-zinc-400 block uppercase">LR+ Ratio</span>
                    <strong class="text-amber-500">{{ item.likelihoodRatioPositive }}x</strong>
                  </div>
                  <span class="text-zinc-300 dark:text-zinc-600">&rarr;</span>
                  <div>
                    <span class="text-[9px] text-zinc-400 block uppercase">Posterior P(D|T)</span>
                    <strong class="text-rose-600 dark:text-rose-400 font-black">{{ item.postTestProbabilityPct }}%</strong>
                  </div>
                </div>
              </div>

              <!-- Socratic Inquiry Box -->
              <div class="p-3 rounded-xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 text-xs text-purple-950 dark:text-purple-200">
                <strong class="text-purple-600 dark:text-purple-400 block text-[10px] uppercase tracking-wider font-mono mb-0.5">Socratic Ruling-Out Inquiry:</strong>
                {{ item.socraticRulingOutQuestion }}
              </div>

              <!-- Gold Standard Test & Cutoffs -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-700/40">
                <div>
                  <span class="text-[10px] text-zinc-400 block font-mono uppercase font-bold">Gold-Standard Rule-Out Test</span>
                  <p class="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{{ item.goldStandardTest }}</p>
                </div>
                <div>
                  <span class="text-[10px] text-zinc-400 block font-mono uppercase font-bold">Diagnostic Cutoff Threshold</span>
                  <p class="text-[11px] font-mono text-zinc-700 dark:text-zinc-300">{{ item.targetClinicalCutoff }}</p>
                </div>
              </div>

              <!-- Red Flag Symptoms -->
              <div class="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200/50 dark:border-zinc-700/40">
                <span class="font-bold text-rose-500">Red Flags:</span>
                <span>{{ item.redFlagFeatures.join(' &bull; ') }}</span>
              </div>

            </div>
          }
        </div>
      </div>

      <!-- Actionable Ruling-Out Diagnostic Orders -->
      <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
        <h4 class="text-xs font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300 font-mono">
          📋 1-Click Ruling-Out Laboratory Order Set
        </h4>
        <ul class="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
          @for (order of report().diagnosticActionChecklist; track order) {
            <li class="flex items-center gap-2">
              <span class="text-emerald-500 font-bold">✓</span>
              <span>{{ order }}</span>
            </li>
          }
        </ul>
      </div>

    </div>
  `
})
export class DifferentialDiagnosisRadarComponent {
  private dxService = inject(DifferentialDiagnosisRadarService);
  private patientState = inject(PatientStateService, { optional: true });

  currentPatient = computed<IPatient>(() => {
    return this.patientState?.asPatientSnapshot() || {
      id: 'p001',
      name: 'Homo Sapiens (Male, Metabolic Syndrome, 58y)',
      age: 58,
      gender: 'Male',
      lastVisit: '2026-08-19',
      preexistingConditions: ['Refractory Hypertension', 'Type 2 Diabetes'],
      history: [],
      bookmarks: [],
      issues: {},
      patientGoals: '',
      medications: [],
      dietarySupplements: [],
      vitals: { bp: '152/96', hr: '78', spO2: '98%', temp: '36.6', weight: '82', height: '175' }
    };
  });

  report = computed<IDxRadarReport>(() => {
    return this.dxService.evaluateDifferentials(this.currentPatient());
  });
}
