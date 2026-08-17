import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalTrialMatcherService, IClinicalTrialMatch, IEligibilityAssessment } from '../services/clinical-trial-matcher.service';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
@Component({
  selector: 'app-clinical-trial-arena',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-slate-100 space-y-6 shadow-2xl">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-2xl shadow-inner">
            🧪
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-black tracking-tight text-white uppercase">
                Clinical Trial Matching & Cohort Engine
              </h2>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                API v2 Live
              </span>
            </div>
            <p class="text-xs text-slate-400 font-medium">
              Real-time decentralized clinical trial (DCT) screening via ClinicalTrials.gov & FHIR R4 ResearchSubject generator.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="syncFromPatient()"
            class="px-3.5 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold transition-colors flex items-center gap-1.5 min-h-[48px] min-w-[48px]"
          >
            🔄 Sync Active Patient
          </button>
        </div>
      </div>

      <!-- Search & Filter Controls -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div class="md:col-span-6 space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Clinical Indication / Target Condition
          </label>
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="executeSearch()"
              placeholder="e.g. Parkinson Disease, Hypertension, Alzheimer..."
              class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px]"
            />
          </div>
        </div>

        <div class="md:col-span-3 space-y-1.5">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Study Phase
          </label>
          <select
            [(ngModel)]="phaseFilter"
            (change)="applyFilters()"
            class="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px]"
          >
            <option value="ALL">All Phases</option>
            <option value="Phase 1">Phase 1 (Safety)</option>
            <option value="Phase 2">Phase 2 (Efficacy)</option>
            <option value="Phase 3">Phase 3 (Pivotal/RCT)</option>
            <option value="Phase 4">Phase 4 (Post-Market)</option>
          </select>
        </div>

        <div class="md:col-span-3 flex items-end">
          <button
            type="button"
            (click)="executeSearch()"
            [disabled]="isLoading()"
            class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 min-h-[48px]"
          >
            @if (isLoading()) {
              <span class="animate-spin text-lg">⚙️</span>
              <span>Screening Trials...</span>
            } @else {
              <span>🔎 Search Trials</span>
            }
          </button>
        </div>
      </div>

      <!-- Active Patient Demographics Bar -->
      <div class="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between text-xs gap-3 font-mono">
        <div class="flex items-center gap-4 text-slate-300">
          <span>Patient: <strong class="text-white">{{ activePatientName() }}</strong></span>
          <span>Age: <strong class="text-blue-400">{{ activePatientAge() }}y</strong></span>
          <span>Sex: <strong class="text-blue-400">{{ activePatientGender() }}</strong></span>
        </div>
        <div class="text-slate-400">
          Source: <span class="text-emerald-400 font-semibold">{{ searchSource() }}</span>
        </div>
      </div>

      <!-- Matched Trials List -->
      <div class="space-y-4">
        @if (filteredTrials().length === 0 && !isLoading()) {
          <div class="p-12 text-center bg-slate-950/40 border border-dashed border-slate-800 rounded-3xl text-slate-500 space-y-2">
            <div class="text-3xl">🔍</div>
            <p class="text-sm font-semibold text-slate-400">No active clinical trials matched current filters.</p>
            <p class="text-xs text-slate-500">Try broadening the condition query or selecting "All Phases".</p>
          </div>
        }

        @for (trial of filteredTrials(); track trial.nctId) {
          <div class="p-5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl space-y-4 transition-all hover:shadow-xl">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="space-y-1.5 max-w-2xl">
                <div class="flex items-center gap-2.5 flex-wrap">
                  <span class="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold">
                    {{ trial.nctId }}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold">
                    {{ trial.phase }}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                    ● {{ trial.overallStatus }}
                  </span>
                </div>
                <h3 class="text-base font-bold text-white leading-snug">
                  {{ trial.title }}
                </h3>
              </div>

              <!-- Match Confidence Score Ring -->
              <div class="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-2xl">
                <div class="text-right">
                  <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Eligibility Match</div>
                  <div class="text-lg font-black text-emerald-400">{{ trial.matchScorePercent }}%</div>
                </div>
                <div class="text-xl">
                  @if (trial.matchScorePercent >= 90) { 🟢 } @else if (trial.matchScorePercent >= 75) { 🟡 } @else { 🟠 }
                </div>
              </div>
            </div>

            <!-- Interventions & Sponsor Details -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/50">
                <span class="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Intervention</span>
                <span class="text-slate-200 font-semibold">{{ trial.interventionName }}</span>
              </div>
              <div class="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/50">
                <span class="text-slate-500 font-bold uppercase tracking-wider block text-[10px]">Lead Sponsor</span>
                <span class="text-slate-200 font-semibold">{{ trial.leadSponsor }}</span>
              </div>
            </div>

            <!-- Eligibility Summary -->
            <div class="p-3 bg-slate-900/40 rounded-xl border border-slate-800/40 text-xs text-slate-300 leading-relaxed">
              <strong class="text-slate-400 uppercase text-[10px] tracking-wider block mb-1">Inclusion / Eligibility Profile</strong>
              {{ trial.eligibilitySummary }}
            </div>

            <!-- Actions Row -->
            <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-900">
              <a
                [href]="trial.clinicalTrialsGovUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 min-h-[48px] py-3"
              >
                <span>View Full Protocol on ClinicalTrials.gov</span>
                <span class="text-sm">↗</span>
              </a>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="exportFhirResearchSubject(trial)"
                  class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 min-h-[48px]"
                >
                  <span>📋 Export FHIR ResearchSubject</span>
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Export Success Toast Notice -->
      @if (exportNotice()) {
        <div class="p-3 bg-emerald-950 border border-emerald-800/60 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>✓ {{ exportNotice() }}</span>
          <button (click)="exportNotice.set(null)" class="text-emerald-400 hover:text-emerald-200 font-bold p-1">✕</button>
        </div>
      }
    </div>
  `
})
export class ClinicalTrialArenaComponent implements OnInit {
  private trialService = inject(ClinicalTrialMatcherService);
  private patientState = inject(PatientStateService);
  private patientManagement = inject(PatientManagementService);

  searchQuery = signal<string>('Parkinson Disease');
  phaseFilter = signal<string>('ALL');
  isLoading = signal<boolean>(false);
  searchSource = signal<string>('ClinicalTrials.gov API v2');
  rawTrials = signal<IClinicalTrialMatch[]>([]);
  exportNotice = signal<string | null>(null);

  activePatientName = computed(() => {
    const id = this.patientManagement.selectedPatientId();
    const p = this.patientManagement.patients().find(p => p.id === id);
    return p?.name || 'Homo Sapiens';
  });

  activePatientAge = computed(() => this.patientState.patientAge() || 45);
  activePatientGender = computed(() => this.patientState.patientGender() || 'Female');

  filteredTrials = computed(() => {
    const phase = this.phaseFilter();
    const list = this.rawTrials();
    if (phase === 'ALL') return list;
    return list.filter(t => t.phase.includes(phase));
  });

  ngOnInit(): void {
    this.syncFromPatient();
    this.executeSearch();
  }

  syncFromPatient(): void {
    const id = this.patientManagement.selectedPatientId();
    const p = this.patientManagement.patients().find(pt => pt.id === id);
    const condition = p?.preexistingConditions?.[0] || 'Parkinson Disease';
    this.searchQuery.set(condition);
  }

  executeSearch(): void {
    const condition = this.searchQuery().trim();
    if (!condition) return;

    this.isLoading.set(true);
    this.trialService.searchClinicalTrialsLive$({
      conditionName: condition,
      patientAge: this.activePatientAge(),
      patientGender: this.activePatientGender() as any,
      recruitingOnly: true
    }).subscribe({
      next: (trials) => {
        this.rawTrials.set(trials);
        this.searchSource.set('ClinicalTrials.gov API v2 Live');
        this.isLoading.set(false);
      },
      error: () => {
        const fallbacks = this.trialService.searchClinicalTrials({ conditionName: condition });
        this.rawTrials.set(fallbacks);
        this.searchSource.set('Pocket-Gull Clinical Catalog');
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    // Computeds handle filter updates automatically
  }

  exportFhirResearchSubject(trial: IClinicalTrialMatch): void {
    const patientId = this.patientManagement.selectedPatientId() || 'p001';
    const bundle = this.trialService.generateFhirResearchSubjectBundle(patientId, trial);
    
    // Download as JSON file
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FHIR_ResearchSubject_${trial.nctId}_${patientId}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.exportNotice.set(`FHIR R4 ResearchSubject Bundle for ${trial.nctId} downloaded successfully.`);
    setTimeout(() => this.exportNotice.set(null), 5000);
  }
}
