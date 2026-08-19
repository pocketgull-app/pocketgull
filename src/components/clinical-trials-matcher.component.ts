import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalTrialsMatcherService, ITrialMatcherReport, IClinicalTrialMatch } from '../services/clinical-trials-matcher.service';
import { PatientStateService } from '../services/patient-state.service';
import { IPatient } from '../services/patient.types';

@Component({
  selector: 'app-clinical-trials-matcher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-blue-500/30 shadow-2xl space-y-6 animate-in fade-in duration-300">
      
      <!-- Header HUD -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xl shadow-xs">
            🔬
          </div>
          <div>
            <h3 class="text-base font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              TrialFinder: 1-Click ClinicalTrials.gov Matcher
              <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-full border border-blue-500/30">
                NIH & NCI Active Registry
              </span>
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              Matches active Phase 2/3 recruiting clinical trials based on patient diagnosis, age, and biomarker criteria.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-mono font-bold text-zinc-500">Radius:</span>
          <select 
            [ngModel]="searchRadius()"
            (ngModelChange)="searchRadius.set(+$event)"
            class="px-3 py-1.5 text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer">
            <option [value]="25">25 Miles</option>
            <option [value]="50">50 Miles</option>
            <option [value]="100">100 Miles</option>
          </select>
        </div>
      </div>

      <!-- Search Summary Badge -->
      <div class="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 text-xs">
        <div class="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
          <span>Targeting: <strong class="text-zinc-900 dark:text-zinc-100">{{ report().searchCriteria.primaryCondition }}</strong></span>
          <span>&bull;</span>
          <span>Age {{ report().searchCriteria.age }}y</span>
        </div>
        <span class="font-mono font-bold text-blue-600 dark:text-blue-400">
          {{ report().totalMatchesFound }} Recruiting Studies Found
        </span>
      </div>

      <!-- Matches Cards List -->
      <div class="space-y-4">
        @for (trial of report().matches; track trial.nctId) {
          <div class="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-3 hover:border-blue-500/40 transition">
            
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-blue-500 text-white">
                    {{ trial.phase }}
                  </span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    {{ trial.status }}
                  </span>
                  <span class="text-xs font-mono font-bold text-zinc-400">NCT: {{ trial.nctId }}</span>
                </div>
                <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {{ trial.briefTitle }}
                </h4>
              </div>

              <div class="text-right shrink-0">
                <span class="text-[10px] uppercase font-mono font-bold text-zinc-400 block">Match Score</span>
                <span class="text-base font-mono font-black text-blue-600 dark:text-blue-400">
                  {{ trial.matchConfidenceScore }}%
                </span>
              </div>
            </div>

            <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">
              {{ trial.officialTitle }}
            </p>

            <!-- Eligibility & Location Specs -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-700/40">
              <div>
                <span class="text-[10px] text-zinc-400 block font-mono uppercase font-bold">Key Inclusion Criteria</span>
                <p class="text-[11px] text-zinc-700 dark:text-zinc-300">{{ trial.keyInclusionSummary }}</p>
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 block font-mono uppercase font-bold">Trial Site & Distance</span>
                <p class="text-[11px] text-zinc-700 dark:text-zinc-300">
                  {{ trial.locationFacility }} (<strong>{{ trial.distanceMiles }} miles</strong>)
                </p>
              </div>
            </div>

            <!-- Interventions & Contact Footer -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-700/40 text-xs">
              <div class="text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>Intervention: <strong>{{ trial.interventions.join(', ') }}</strong></span>
                <span class="mx-1.5">&bull;</span>
                <span>Sponsor: {{ trial.sponsor }}</span>
              </div>
              <div class="flex items-center gap-2">
                <a [href]="'mailto:' + trial.contactEmail" 
                   class="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition shadow-xs">
                  Contact PI ({{ trial.contactPhone }})
                </a>
              </div>
            </div>

          </div>
        }
      </div>

    </div>
  `
})
export class ClinicalTrialsMatcherComponent {
  private matcherService = inject(ClinicalTrialsMatcherService);
  private patientState = inject(PatientStateService, { optional: true });

  searchRadius = signal<number>(50);

  currentPatient = computed<IPatient>(() => {
    return {
      id: this.patientState?.patientId() || 'p001',
      name: this.patientState?.patientName() || 'Homo Sapiens (Male, Metabolic Syndrome, 58y)',
      age: this.patientState?.patientAge() || 58,
      gender: (this.patientState?.patientGender() as any) || 'Male',
      lastVisit: '2026-08-19',
      preexistingConditions: ['Type 2 Diabetes', 'Essential Hypertension'],
      history: [],
      bookmarks: [],
      issues: {},
      patientGoals: '',
      medications: [],
      dietarySupplements: [],
      vitals: { bp: '148/94', hr: '76', spO2: '98%', temp: '36.6', weight: '82', height: '175' }
    };
  });

  report = computed<ITrialMatcherReport>(() => {
    return this.matcherService.matchTrialsForPatient(this.currentPatient(), this.searchRadius());
  });
}
