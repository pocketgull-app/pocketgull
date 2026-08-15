import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalMandarinateExamService, IExamEvaluationResult } from '../../services/clinical-mandarinate-exam.service';

@Component({
  selector: 'app-clinical-mandarinate-exam-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl font-sans text-zinc-100 transition-all">
      
      <!-- Top Header & Mandarinate Seal -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-4 mb-5">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-2xl shadow-lg shadow-amber-950/40">
            📜
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base sm:text-lg font-black tracking-tight text-amber-300">
                Clinical AI "Mandarinate" Examination & OSCE Arena
              </h2>
              <span class="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/80">
                科举 (Keju) Meritocratic Standard
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-medium">
              Standardized Multi-Paradigm Board Vignettes, Autonomous Model Benchmarking & Safety Certifications
            </p>
          </div>
        </div>

        <!-- Latest Certificate Indicator -->
        <div class="flex items-center gap-2 bg-zinc-950 px-3.5 py-2 rounded-2xl border border-amber-500/30 font-mono text-xs">
          <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span class="text-amber-300 font-bold">Standard of Care Certified</span>
        </div>
      </div>

      <!-- Case Selection Tabs -->
      <div class="mb-5">
        <div class="text-[10px] font-black uppercase tracking-wider text-amber-400/80 mb-2">
          Select Clinical Examination Vignette:
        </div>
        <div class="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-950 rounded-2xl border border-zinc-800 font-mono text-xs">
          @for (examCase of examBank(); track examCase.caseId) {
            <button (click)="selectCase(examCase.caseId)"
                    [class.bg-amber-600]="isSelected(examCase.caseId)"
                    [class.text-zinc-950]="isSelected(examCase.caseId)"
                    [class.font-black]="isSelected(examCase.caseId)"
                    [class.text-zinc-300]="!isSelected(examCase.caseId)"
                    class="px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer border-0">
              {{ examCase.caseTitle }} ({{ examCase.specialty }})
            </button>
          }
        </div>
      </div>

      <!-- Active Vignette & Clinical Telemetry Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        
        <!-- Clinical Vignette & Demographics (2 cols) -->
        <div class="lg:col-span-2 p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex flex-col justify-between gap-4">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-950 text-amber-300 border border-amber-800">
                {{ activeCase().difficultyTier }}
              </span>
              <span class="text-xs font-mono text-zinc-400">{{ activeCase().patientDemographics }}</span>
            </div>

            <h3 class="text-sm sm:text-base font-bold text-zinc-100 mb-2">
              {{ activeCase().caseTitle }}
            </h3>

            <p class="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80">
              {{ activeCase().clinicalVignette }}
            </p>
          </div>

          <!-- Key Lab Results -->
          <div>
            <span class="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5 block">
              Key Diagnostic Lab Findings
            </span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              @for (lab of activeCase().keyLabResults; track $index) {
                <div class="text-xs font-mono p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>{{ lab }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Vital Signs & Multi-Paradigm Synthesis (1 col) -->
        <div class="space-y-4">
          
          <!-- Vitals HUD -->
          <div class="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800">
            <span class="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2 block">
              Admission Vitals
            </span>
            <div class="grid grid-cols-2 gap-2 font-mono text-xs">
              <div class="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <span class="text-[9px] text-zinc-500 block">BP</span>
                <span class="font-bold text-rose-400">{{ activeCase().vitals.bp }}</span>
              </div>
              <div class="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <span class="text-[9px] text-zinc-500 block">Heart Rate</span>
                <span class="font-bold text-amber-400">{{ activeCase().vitals.hr }} bpm</span>
              </div>
              <div class="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <span class="text-[9px] text-zinc-500 block">SpO2</span>
                <span class="font-bold text-emerald-400">{{ activeCase().vitals.spo2 }}%</span>
              </div>
              <div class="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <span class="text-[9px] text-zinc-500 block">Resp Rate</span>
                <span class="font-bold text-blue-400">{{ activeCase().vitals.rr }} /min</span>
              </div>
            </div>
          </div>

          <!-- Multi-Paradigm Guidance HUD -->
          <div class="p-4 rounded-2xl bg-amber-950/20 border border-amber-600/30">
            <span class="text-[10px] font-black uppercase tracking-wider text-amber-300 mb-2 block">
              🌿 Tri-Paradigm Cross-Talk
            </span>
            <div class="space-y-1.5 text-xs text-zinc-300">
              <div class="text-[11px]">
                <strong class="text-amber-400">TCM Zang-Fu:</strong> {{ activeCase().multiParadigmGuidance.tcmZangFuPattern }}
              </div>
              <div class="text-[11px]">
                <strong class="text-teal-400">Ayurveda:</strong> {{ activeCase().multiParadigmGuidance.ayurvedicBioEnergetics }}
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- Autonomous Evaluation Trigger Banner -->
      <div class="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900/80 to-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
        <div>
          <h4 class="text-sm font-black text-amber-300 flex items-center gap-2">
            <span>⚡</span> Automated Clinical Reasoning & Benchmark Execution
          </h4>
          <p class="text-xs text-zinc-400">
            Benchmark Gemini 2.5 against this case, assessing diagnostic accuracy, safety contraindications, and multi-paradigm balance.
          </p>
        </div>

        <button (click)="runAutomatedBenchmark()"
                class="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-950/50 transition cursor-pointer shrink-0 border-0 flex items-center gap-2">
          <span>🎯</span> Run Keju AI Exam
        </button>
      </div>

      <!-- Evaluation Result Radar & Certificate -->
      @if (latestResult(); as res) {
        <div class="p-5 rounded-2xl bg-zinc-950 border border-amber-500/40 shadow-xl">
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-3 mb-4">
            <div>
              <span class="text-[10px] font-mono font-bold text-zinc-500 uppercase">Evaluation Report</span>
              <div class="flex items-center gap-2">
                <h4 class="text-base font-bold text-zinc-100">{{ res.candidateName }}</h4>
                <span [class.bg-emerald-950]="res.isPassed"
                      [class.text-emerald-300]="res.isPassed"
                      [class.bg-rose-950]="!res.isPassed"
                      [class.text-rose-300]="!res.isPassed"
                      class="px-2.5 py-0.5 text-xs font-black uppercase rounded-full border border-zinc-700">
                  {{ res.isPassed ? 'PASSED (DISTINCTION)' : 'FAILED' }}
                </span>
              </div>
            </div>

            <!-- Score Pill -->
            <div class="flex items-center gap-2">
              <span class="text-2xl font-black text-amber-400 font-mono">{{ res.overallScore }}%</span>
              <span class="text-xs font-mono text-zinc-500">/ 100%</span>
            </div>
          </div>

          <!-- Scoring Breakdown Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 font-mono text-xs">
            <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
              <span class="text-[9px] uppercase text-zinc-500 block">Diagnostic Precision</span>
              <span class="text-sm font-black text-cyan-400">{{ res.scoringBreakdown.diagnosticAccuracyScore }} / 40</span>
            </div>
            <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
              <span class="text-[9px] uppercase text-zinc-500 block">Harm Avoidance</span>
              <span class="text-sm font-black text-emerald-400">{{ res.scoringBreakdown.safetyHarmAvoidanceScore }} / 30</span>
            </div>
            <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
              <span class="text-[9px] uppercase text-zinc-500 block">Multi-Paradigm</span>
              <span class="text-sm font-black text-amber-400">{{ res.scoringBreakdown.multiParadigmReasoningScore }} / 15</span>
            </div>
            <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
              <span class="text-[9px] uppercase text-zinc-500 block">Evidence Grounding</span>
              <span class="text-sm font-black text-blue-400">{{ res.scoringBreakdown.evidenceTransparencyScore }} / 15</span>
            </div>
          </div>

          <!-- Socratic Critique & Cryptographic Certificate -->
          <div class="p-4 rounded-xl bg-amber-950/10 border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span class="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                🏛️ Socratic Clinical Critique
              </span>
              <p class="text-xs text-zinc-300">{{ res.socraticCritique }}</p>
            </div>

            <div class="font-mono text-right shrink-0">
              <span class="text-[9px] uppercase text-zinc-500 block">Certificate SHA</span>
              <span class="text-xs font-bold text-amber-400 bg-zinc-900 px-2.5 py-1 rounded border border-amber-500/30">
                {{ res.cryptographicCertificateSha }}
              </span>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class ClinicalMandarinateExamCardComponent {
  public service = inject(ClinicalMandarinateExamService);

  public readonly examBank = this.service.examBank;
  public readonly activeCase = this.service.activeCase;
  public readonly latestResult = signal<IExamEvaluationResult | null>(this.service.recentEvaluations()[0] || null);

  public selectCase(caseId: string): void {
    this.service.selectedCaseId.set(caseId);
  }

  public isSelected(caseId: string): boolean {
    return this.service.selectedCaseId() === caseId;
  }

  public runAutomatedBenchmark(): void {
    const curCase = this.activeCase();
    const result = this.service.evaluateSubmission({
      caseId: curCase.caseId,
      candidateName: 'Gemini 2.5 Clinical Reasoning Engine',
      modelIdentifier: 'gemini-2.5-pro-clinical',
      selectedPrimaryDiagnosis: curCase.expectedPrimaryDiagnosis,
      differentialDiagnoses: curCase.acceptableDifferentials,
      proposedInterventions: ['Emergent standard of care interventions and telemetry monitoring'],
      identifiedContraindications: curCase.criticalContraindications
    });

    this.latestResult.set(result);
  }
}
