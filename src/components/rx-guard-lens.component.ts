import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxGuardService, IRxGuardAssessment } from '../services/rx-guard.service';
import { PatientStateService } from '../services/patient-state.service';
import { IPatient } from '../services/patient.types';

@Component({
  selector: 'app-rx-guard-lens',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl space-y-6 animate-in fade-in duration-300">
      
      <!-- Header HUD -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl shadow-xs">
            🛡️
          </div>
          <div>
            <h3 class="text-base font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              RxGuard: Precision PGx & Herb-Drug Matrix
              <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded-full border border-purple-500/30">
                CPIC & FDA Level A
              </span>
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              Live hepatic clearance modeling, botanical interaction safety, and pharmacogenomic dosing guidance.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider border shadow-xs"
                [ngClass]="{
                  'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300': assessment().overallRiskTier === 'SAFE',
                  'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300': assessment().overallRiskTier === 'ADVISORY',
                  'bg-orange-500/10 text-orange-700 border-orange-500/30 dark:text-orange-300': assessment().overallRiskTier === 'MODERATE_RISK',
                  'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-300': assessment().overallRiskTier === 'CONTRAINDICATED'
                }">
            Risk Tier: {{ assessment().overallRiskTier }}
          </span>
        </div>
      </div>

      <!-- PGx Gene Alleles Grid -->
      <div class="space-y-3">
        <h4 class="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono">
          🧬 Patient Hepatic Pharmacogenomic Profile (CYP450 & SLCO1B1)
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          @for (gene of assessment().pgxProfiles; track gene.gene) {
            <div class="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-black text-zinc-900 dark:text-zinc-100 font-mono">{{ gene.gene }}</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold">
                  {{ gene.diplotype }}
                </span>
              </div>
              <div class="text-xs font-bold text-purple-600 dark:text-purple-400">
                {{ gene.phenotype }}
              </div>
              <p class="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">
                {{ gene.clinicalImpactSummary }}
              </p>
            </div>
          }
        </div>
      </div>

      <!-- Clearance Adjustments Callout if any -->
      @if (assessment().clearanceAdjustments.length > 0) {
        <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 space-y-1 text-xs">
          <div class="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            ⚠️ Pharmacokinetic Clearance Alert
          </div>
          @for (adj of assessment().clearanceAdjustments; track adj.medication) {
            <p>
              <strong>{{ adj.medication }}:</strong> Clearance reduced to <strong>{{ adj.adjustedClearancePct }}%</strong> of normal. {{ adj.recommendation }}
            </p>
          }
        </div>
      }

      <!-- Drug-Herb & Tri-Paradigm Interaction Table -->
      <div class="space-y-3">
        <h4 class="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono">
          🌿 Tri-Paradigm Botanical & Drug Interaction Matrix
        </h4>
        <div class="overflow-x-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-zinc-100/80 dark:bg-zinc-950/80 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                <th class="p-3">Medication</th>
                <th class="p-3">Herb / Botanical</th>
                <th class="p-3">Paradigm</th>
                <th class="p-3">Severity</th>
                <th class="p-3">Biological Mechanism</th>
                <th class="p-3">Clinical Recommendation</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200/60 dark:divide-zinc-800">
              @for (item of assessment().interactions; track item.id) {
                <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-850/50 transition">
                  <td class="p-3 font-bold text-zinc-900 dark:text-zinc-100 font-mono">{{ item.drug }}</td>
                  <td class="p-3 font-medium text-purple-700 dark:text-purple-300">{{ item.herbOrNutrient }}</td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {{ item.paradigm }}
                    </span>
                  </td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border font-mono"
                          [ngClass]="{
                            'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300': item.severity === 'SAFE',
                            'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300': item.severity === 'ADVISORY',
                            'bg-orange-500/10 text-orange-700 border-orange-500/30 dark:text-orange-300': item.severity === 'MODERATE_RISK',
                            'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-300': item.severity === 'CONTRAINDICATED'
                          }">
                      {{ item.severity }}
                    </span>
                  </td>
                  <td class="p-3 text-zinc-600 dark:text-zinc-300 max-w-[200px] leading-snug">{{ item.mechanism }}</td>
                  <td class="p-3 text-zinc-700 dark:text-zinc-200 max-w-[220px] font-medium leading-snug">{{ item.managementRecommendation }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class RxGuardLensComponent {
  private rxGuard = inject(RxGuardService);
  private patientState = inject(PatientStateService, { optional: true });

  currentPatient = computed<IPatient>(() => {
    return this.patientState?.asPatientSnapshot() || {
      id: 'p001',
      name: 'Homo Sapiens (Male, Metabolic Syndrome, 58y)',
      age: 58,
      gender: 'Male',
      lastVisit: '2026-08-19',
      preexistingConditions: ['Essential Hypertension', 'Type 2 Diabetes'],
      history: [],
      bookmarks: [],
      issues: {},
      patientGoals: '',
      medications: [],
      dietarySupplements: [],
      vitals: { bp: '148/94', hr: '76', spO2: '98%', temp: '36.6', weight: '82', height: '175' }
    };
  });

  assessment = computed<IRxGuardAssessment>(() => {
    return this.rxGuard.evaluatePatient(this.currentPatient());
  });
}
