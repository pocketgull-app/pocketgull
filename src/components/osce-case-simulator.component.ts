import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OsceTrainerService, IOsceScenario } from '../services/osce-trainer.service';

@Component({
  selector: 'app-osce-case-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      <!-- Top Hero Header -->
      <div class="relative overflow-hidden rounded-3xl bg-linear-to-r from-teal-950/80 via-zinc-950 to-indigo-950/80 border border-teal-800/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 text-xs font-mono uppercase tracking-widest font-bold">
              <span>🎓 Socratic OSCE Simulator</span>
              <span>•</span>
              <span>Level: {{ trainer.selectedScenario().difficulty }}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Clinical Case &amp; Diagnostic Flight Simulator
            </h1>
            <p class="text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Step into the role of Attending Physician. Analyze multimodal findings, formulate evidence-based differentials, order diagnostic workups, and receive real-time Socratic preceptor feedback.
            </p>
          </div>

          <!-- Quick Stats Badge -->
          <div class="flex items-center gap-4 bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl shrink-0">
            <div class="text-center px-3 border-r border-zinc-800">
              <div class="text-xs font-mono uppercase tracking-wider text-zinc-400">Total Cases</div>
              <div class="text-xl font-extrabold text-teal-400 font-mono">{{ trainer.scenarios().length }}</div>
            </div>
            <div class="text-center px-3">
              <div class="text-xs font-mono uppercase tracking-wider text-zinc-400">Mastery Target</div>
              <div class="text-xl font-extrabold text-emerald-400 font-mono">100% Safety</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Case Selection Tabs -->
      <div class="flex flex-wrap gap-2.5 p-1.5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl backdrop-blur-md">
        @for (scenario of trainer.scenarios(); track scenario.id) {
          <button
            type="button"
            (click)="selectScenario(scenario.id)"
            class="flex-1 min-w-[200px] text-left p-3.5 rounded-xl border transition-all cursor-pointer"
            [class.bg-teal-950/60]="trainer.activeScenarioId() === scenario.id"
            [class.border-teal-500/50]="trainer.activeScenarioId() === scenario.id"
            [class.text-white]="trainer.activeScenarioId() === scenario.id"
            [class.shadow-md]="trainer.activeScenarioId() === scenario.id"
            [class.bg-zinc-950/40]="trainer.activeScenarioId() !== scenario.id"
            [class.border-zinc-800/60]="trainer.activeScenarioId() !== scenario.id"
            [class.text-zinc-400]="trainer.activeScenarioId() !== scenario.id"
            [class.hover:bg-zinc-900]="trainer.activeScenarioId() !== scenario.id"
          >
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-bold">
                {{ scenario.difficulty }}
              </span>
              <span class="text-xs text-teal-400 font-mono font-bold">{{ scenario.category }}</span>
            </div>
            <div class="text-xs font-bold text-zinc-200 line-clamp-1">
              {{ scenario.title }}
            </div>
          </button>
        }
      </div>

      <!-- Main Clinical Encounter Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left 7 Cols: Patient Presentation & Key Findings -->
        <div class="lg:col-span-7 space-y-6">
          
          <!-- Patient Encounter Card -->
          <div class="bg-zinc-950 rounded-3xl border border-zinc-800/80 p-6 shadow-xl space-y-6">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 text-lg">
                  🩺
                </div>
                <div>
                  <h2 class="text-base font-bold text-zinc-100">{{ trainer.selectedScenario().title }}</h2>
                  <p class="text-xs text-zinc-400 font-mono">{{ trainer.selectedScenario().category }}</p>
                </div>
              </div>
              <span class="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-full font-mono">
                SIMULATED PATIENT
              </span>
            </div>

            <!-- Chief Complaint -->
            <div class="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-1.5">
              <div class="text-[11px] font-bold uppercase tracking-wider text-teal-400 font-mono flex items-center gap-1.5">
                <span>📋 Chief Complaint &amp; History of Present Illness</span>
              </div>
              <p class="text-sm text-zinc-200 leading-relaxed font-sans">
                "{{ trainer.selectedScenario().chiefComplaint }}"
              </p>
            </div>

            <!-- Real-Time Telemetric Vitals -->
            <div class="space-y-2">
              <div class="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Real-Time Bedside Vitals
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-center">
                  <div class="text-[10px] uppercase font-mono text-zinc-400">Heart Rate</div>
                  <div class="text-sm sm:text-base font-extrabold text-rose-400 font-mono tabular-nums mt-0.5">
                    {{ trainer.selectedScenario().vitals.hr }}
                  </div>
                </div>
                <div class="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-center">
                  <div class="text-[10px] uppercase font-mono text-zinc-400">Blood Pressure</div>
                  <div class="text-sm sm:text-base font-extrabold text-amber-400 font-mono tabular-nums mt-0.5">
                    {{ trainer.selectedScenario().vitals.bp }}
                  </div>
                </div>
                <div class="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-center">
                  <div class="text-[10px] uppercase font-mono text-zinc-400">Oxygen Sat (SpO2)</div>
                  <div class="text-sm sm:text-base font-extrabold text-emerald-400 font-mono tabular-nums mt-0.5">
                    {{ trainer.selectedScenario().vitals.spO2 }}
                  </div>
                </div>
                <div class="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-center">
                  <div class="text-[10px] uppercase font-mono text-zinc-400">Temperature</div>
                  <div class="text-sm sm:text-base font-extrabold text-sky-400 font-mono tabular-nums mt-0.5">
                    {{ trainer.selectedScenario().vitals.temp }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Objective Clinical Findings -->
            <div class="space-y-3">
              <div class="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Multimodal Objective Findings &amp; Diagnostic Biomarkers
              </div>
              <div class="space-y-2">
                @for (finding of trainer.selectedScenario().keyClinicalFindings; track finding) {
                  <div class="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-xs text-zinc-300">
                    <span class="text-teal-400 text-sm mt-0.5">🔍</span>
                    <span class="leading-relaxed">{{ finding }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Socratic Preceptor Hint Drawer -->
            <div class="pt-2 border-t border-zinc-800/80">
              @if (!showSocraticHint()) {
                <button
                  type="button"
                  (click)="showSocraticHint.set(true)"
                  class="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/50 text-xs font-bold font-mono transition cursor-pointer"
                >
                  <span>💡 Ask Socratic Preceptor for Clinical Clue</span>
                </button>
              } @else {
                <div class="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2 animate-in fade-in duration-200">
                  <div class="flex items-center justify-between text-xs font-bold text-indigo-300 font-mono">
                    <span class="flex items-center gap-1.5"><span>🦉</span> Preceptor Socratic Guidance</span>
                    <button (click)="showSocraticHint.set(false)" class="text-zinc-400 hover:text-white text-xs cursor-pointer">✕ Hide Clue</button>
                  </div>
                  <p class="text-xs text-zinc-300 leading-relaxed">
                    {{ socraticHintText() }}
                  </p>
                </div>
              }
            </div>

          </div>
        </div>

        <!-- Right 5 Cols: Candidate Reasoning Input & Examiner Report -->
        <div class="lg:col-span-5 space-y-6">
          
          <!-- Formulation Form Card -->
          <div class="bg-zinc-950 rounded-3xl border border-zinc-800/80 p-6 shadow-xl space-y-5">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 class="text-sm font-bold uppercase tracking-wider text-zinc-200 font-mono">
                Attending Clinical Orders &amp; Differential
              </h3>
              <span class="text-[10px] font-mono text-zinc-500">Board Exam Format</span>
            </div>

            <!-- Differential Diagnosis Input -->
            <div class="space-y-2">
              <label for="diag-input" class="block text-xs font-bold text-zinc-300 font-mono">
                1. Primary &amp; Secondary Differential Diagnoses:
              </label>
              <textarea
                id="diag-input"
                [(ngModel)]="userDiagnosis"
                rows="3"
                placeholder="e.g., Generalized Stage II Periodontitis, Endothelial Inflammatory Strain..."
                class="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition"
              ></textarea>
            </div>

            <!-- Diagnostic Workup Orders Input -->
            <div class="space-y-2">
              <label for="orders-input" class="block text-xs font-bold text-zinc-300 font-mono">
                2. Recommended Labs, Imaging &amp; Interventions:
              </label>
              <textarea
                id="orders-input"
                [(ngModel)]="userOrders"
                rows="3"
                placeholder="e.g., Repeat hs-CRP panel, Periodontal scaling and root planing, HbA1c screening..."
                class="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition"
              ></textarea>
            </div>

            <!-- Quick Autofill Suggestions for Rapid Testing -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              <span class="text-[10px] text-zinc-500 font-mono self-center mr-1">Quick Match:</span>
              <button
                type="button"
                (click)="applyGoldenGuidance()"
                class="text-[10px] px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-teal-300 rounded-md font-mono transition cursor-pointer border border-zinc-700"
              >
                ✨ Load Gold-Standard Reasoning
              </button>
            </div>

            <!-- Submission Action -->
            <button
              type="button"
              (click)="evaluateAttempt()"
              [disabled]="!userDiagnosis().trim() && !userOrders().trim()"
              class="w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 font-bold text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-teal-500/20 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Submit to Board Examiner →
            </button>
          </div>

          <!-- Live Examiner Evaluation Scorecard -->
          @if (trainer.evaluationResult(); as evalResult) {
            <div class="bg-zinc-950 rounded-3xl border border-teal-500/40 p-6 shadow-2xl space-y-4 animate-in fade-in duration-300">
              
              <!-- Result Status Header -->
              <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div class="flex items-center gap-2">
                  <span class="text-lg">
                    {{ evalResult.status === 'PASSED WITH DISTINCTION' ? '🏆' : (evalResult.status === 'PASSED' ? '✅' : '⚠️') }}
                  </span>
                  <span class="text-xs font-bold uppercase tracking-wider font-mono"
                        [class.text-emerald-400]="evalResult.status.includes('PASSED')"
                        [class.text-amber-400]="evalResult.status === 'NEEDS REVISION'">
                    {{ evalResult.status }}
                  </span>
                </div>
                <div class="text-xl font-black font-mono"
                     [class.text-emerald-400]="evalResult.overallScore >= 80"
                     [class.text-teal-400]="evalResult.overallScore >= 65 && evalResult.overallScore < 80"
                     [class.text-amber-400]="evalResult.overallScore < 65">
                  {{ evalResult.overallScore }}<span class="text-xs text-zinc-500">/100</span>
                </div>
              </div>

              <!-- Metric Gauges -->
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
                  <div class="text-[10px] uppercase font-mono text-zinc-400">Diagnostic Match</div>
                  <div class="text-sm font-bold text-teal-400 font-mono mt-0.5">{{ evalResult.diagnosticAccuracyScore }}%</div>
                </div>
                <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
                  <div class="text-[10px] uppercase font-mono text-zinc-400">Safety Adherence</div>
                  <div class="text-sm font-bold text-emerald-400 font-mono mt-0.5">{{ evalResult.patientSafetyScore }}%</div>
                </div>
              </div>

              <!-- Examiner Feedback Note -->
              <div class="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-sans">
                {{ evalResult.examinerFeedback }}
              </div>

              <!-- Matched Diagnoses & Orders Chips -->
              @if (evalResult.matchedDiagnoses.length > 0) {
                <div class="space-y-1.5">
                  <div class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">Matched Diagnostic Keys:</div>
                  <div class="flex flex-wrap gap-1.5">
                    @for (item of evalResult.matchedDiagnoses; track item) {
                      <span class="px-2 py-0.5 bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 rounded-md text-[10px] font-mono">
                        ✓ {{ item }}
                      </span>
                    }
                  </div>
                </div>
              }

              <!-- Advance to Next Scenario -->
              <button
                type="button"
                (click)="advanceToNextScenario()"
                class="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-zinc-700"
              >
                Next Case Simulation →
              </button>
            </div>
          }

        </div>

      </div>

    </div>
  `
})
export class OsceCaseSimulatorComponent {
  trainer = inject(OsceTrainerService);

  userDiagnosis = signal<string>('');
  userOrders = signal<string>('');
  showSocraticHint = signal<boolean>(false);

  socraticHintText = computed(() => {
    const scenario = this.trainer.selectedScenario();
    if (scenario.id === 'osce_sibi_cardio') {
      return 'Consider the connection between chronic focal oral bacteremia and systemic vascular endothelial inflammation. Which inflammatory marker bridges periodontal pocket depth to coronary plaque instability?';
    } else if (scenario.id === 'osce_edwin_smith') {
      return 'Review the Edwin Smith Surgical Codex Case IV principles: Mandibular joint strain often presents with compensatory cervical facet locking. What imaging confirms the bony architecture without contrast radiation?';
    } else {
      return 'Look at the Gompertz aging slope and autonomic power spectrum. How does high-frequency HRV reflect vagal reserve, and which lifestyle/circadian intervention activates endogenous Phase II antioxidant enzymes?';
    }
  });

  selectScenario(id: string) {
    this.trainer.selectScenario(id);
    this.userDiagnosis.set('');
    this.userOrders.set('');
    this.showSocraticHint.set(false);
  }

  evaluateAttempt() {
    this.trainer.evaluateAttempt(this.userDiagnosis(), this.userOrders());
  }

  applyGoldenGuidance() {
    const scenario = this.trainer.selectedScenario();
    this.userDiagnosis.set(scenario.correctDiagnoses.join(', '));
    this.userOrders.set(scenario.recommendedOrders.join(', '));
  }

  advanceToNextScenario() {
    const scenarios = this.trainer.scenarios();
    const currentIndex = scenarios.findIndex(s => s.id === this.trainer.activeScenarioId());
    const nextIndex = (currentIndex + 1) % scenarios.length;
    this.selectScenario(scenarios[nextIndex].id);
  }
}
