import { Component, ChangeDetectionStrategy, inject, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalMoERouterService, IPatientDecisionFlow, SHIFT_CARE_PLAN_ROSTER } from '../services/clinical-moe-router.service';

@Component({
  selector: 'app-smoe-decision-flow-explorer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Sparse Mixture of UI Experts Decision Flow Explorer"
    >
      <div class="relative w-full max-w-6xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        <!-- Header -->
        <header class="p-4 sm:p-5 border-b border-zinc-800 bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-purple-950/40 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 text-xl font-bold shadow-inner">
              🔬
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-base sm:text-lg font-bold text-zinc-100 font-mono tracking-wide">
                  SMoE Gating Network Decision Flow Explorer
                </h2>
                <span class="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-full font-bold">
                  Temperature T=0.85 • Top-k=2
                </span>
                <span class="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-full font-bold">
                  {{ moeRouter.cognitiveNoiseReductionPercent() }}% Cognitive Noise Shield
                </span>
              </div>
              <p class="text-xs text-zinc-400 mt-0.5">
                Transparent epistemic trace: Clinical Ingest & Vitals → Scanned Triggers → Gating Softmax → Synapse Cross-Attention Bridge.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="closeModal.emit()"
              class="w-9 h-9 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/80 flex items-center justify-center text-sm font-bold transition shadow cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400"
              aria-label="Close Decision Flow Explorer"
            >
              ✕
            </button>
          </div>
        </header>

        <!-- 10 Clinical Shift Patient Ribbon -->
        <div class="bg-zinc-900/80 border-b border-zinc-800/80 px-4 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-thin">
          <span class="text-[11px] font-mono uppercase font-bold text-zinc-400 shrink-0 mr-1 flex items-center gap-1">
            <span>📋</span> CASES (10):
          </span>
          @for (p of shiftRoster; track p.id) {
            <button
              type="button"
              (click)="selectPatient(p.id)"
              [class.bg-purple-600]="selectedPatientId() === p.id"
              [class.text-white]="selectedPatientId() === p.id"
              [class.border-purple-400]="selectedPatientId() === p.id"
              [class.text-zinc-400]="selectedPatientId() !== p.id"
              [class.bg-zinc-950]="selectedPatientId() !== p.id"
              [class.border-zinc-800]="selectedPatientId() !== p.id"
              class="px-2.5 py-1.5 rounded-xl border text-xs font-mono font-medium transition cursor-pointer hover:bg-zinc-800 hover:text-zinc-200 shrink-0 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-purple-400 min-h-[36px]"
            >
              <span>{{ p.id === 'p001' ? '👤' : (p.id === 'p002' ? '🫁' : (p.id === 'p003' ? '🧠' : '🧬')) }}</span>
              <span>{{ p.name }}</span>
            </button>
          }
        </div>

        <!-- Main Body: 4-Stage Pipeline DAG -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          @if (activeFlow(); as flow) {
            
            <!-- Patient Demographic & Intake Bar -->
            <div class="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-base font-bold text-zinc-100 font-mono">
                    {{ flow.patientName }}
                  </h3>
                  <span class="text-xs text-zinc-400 font-mono">
                    ({{ flow.demographic }})
                  </span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                    {{ flow.clinicalDomain }}
                  </span>
                </div>
                <p class="text-xs text-zinc-300 leading-relaxed">
                  <strong class="text-zinc-200 font-mono">Chief Complaint:</strong> {{ flow.chiefComplaint }}
                </p>
                <p class="text-xs text-purple-300 leading-relaxed">
                  <strong class="text-purple-400 font-mono">Care Plan Goal:</strong> {{ flow.intakeGoal }}
                </p>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  (click)="loadIntoLiveCanvas(flow.patientId)"
                  class="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400"
                >
                  <span>⚡</span> Load Into Live Canvas
                </button>
                <button
                  type="button"
                  (click)="askAiExplanation(flow.patientId)"
                  class="px-3.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold transition flex items-center gap-2 shadow cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <span>🤖</span> Ask AI Agent
                </button>
              </div>
            </div>

            <!-- 4-Stage Visual DAG Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
              
              <!-- STAGE 1: Clinical Ingest & Vitals -->
              <div class="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col justify-between space-y-3">
                <div>
                  <div class="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <span class="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-mono text-xs font-bold">1</span>
                    <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">Clinical Ingest & Vitals</h4>
                  </div>
                  <div class="mt-3 space-y-2">
                    @for (v of flow.vitalsSignature; track v.label) {
                      <div class="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between text-xs">
                        <span class="text-zinc-400 font-mono text-[11px]">{{ v.label }}</span>
                        <div class="flex items-center gap-1.5 font-mono">
                          <span class="font-bold text-zinc-200">{{ v.value }}</span>
                          <span
                            class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase"
                            [class.bg-emerald-950]="v.status === 'normal'"
                            [class.text-emerald-400]="v.status === 'normal'"
                            [class.bg-amber-950]="v.status === 'warning'"
                            [class.text-amber-400]="v.status === 'warning'"
                            [class.bg-rose-950]="v.status === 'alert'"
                            [class.text-rose-400]="v.status === 'alert'"
                          >
                            {{ v.status }}
                          </span>
                        </div>
                      </div>
                    }
                  </div>
                </div>
                <div class="text-[10px] text-zinc-500 font-mono pt-2 border-t border-zinc-800/60">
                  Telemetry: Ingested & De-Identified
                </div>
              </div>

              <!-- STAGE 2: Scanned Heuristic Triggers -->
              <div class="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col justify-between space-y-3">
                <div>
                  <div class="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <span class="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono text-xs font-bold">2</span>
                    <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">Scanned Heuristic Triggers</h4>
                  </div>
                  <div class="mt-3 space-y-2.5">
                    <div>
                      <span class="text-[10px] uppercase font-bold text-zinc-500 font-mono block mb-1">Matched Keywords:</span>
                      <div class="flex flex-wrap gap-1">
                        @for (kw of flow.scannedTriggers.matchedKeywords; track $index) {
                          <span class="px-2 py-0.5 rounded-md bg-amber-950/40 border border-amber-500/30 text-amber-300 font-mono text-[10px]">
                            #{{ kw }}
                          </span>
                        }
                      </div>
                    </div>
                    <div class="text-xs space-y-1">
                      <span class="text-[10px] uppercase font-bold text-zinc-500 font-mono block">Physiological Trigger:</span>
                      <p class="text-[11px] text-zinc-300 leading-snug">
                        {{ flow.scannedTriggers.physiologicalTrigger }}
                      </p>
                    </div>
                    <div class="text-xs space-y-1">
                      <span class="text-[10px] uppercase font-bold text-zinc-500 font-mono block">Anatomical Substrate:</span>
                      <p class="text-[11px] text-zinc-300 leading-snug font-mono">
                        {{ flow.scannedTriggers.anatomicalSubstrate }}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="text-[10px] text-zinc-500 font-mono pt-2 border-t border-zinc-800/60">
                  Affinity: {{ flow.scannedTriggers.diagnosticLensAffinity }}
                </div>
              </div>

              <!-- STAGE 3: Gating Network Softmax Probabilities -->
              <div class="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex flex-col justify-between space-y-3 lg:col-span-2">
                <div>
                  <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-xs font-bold">3</span>
                      <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">Gating Softmax Probabilities (T=0.85)</h4>
                    </div>
                    <span class="text-[10px] font-mono text-zinc-400">
                      Top-2 Active • 6 Shelved
                    </span>
                  </div>

                  <div class="mt-3 space-y-2">
                    @for (prob of flow.gatingProbabilities; track prob.expertId) {
                      <div
                        class="p-2.5 rounded-xl border transition-all"
                        [class.bg-emerald-950\/30]="prob.isTop1"
                        [class.border-emerald-500\/40]="prob.isTop1"
                        [class.bg-teal-950\/20]="prob.isTop2"
                        [class.border-teal-500\/30]="prob.isTop2"
                        [class.bg-zinc-950\/40]="!prob.isTop1 && !prob.isTop2"
                        [class.border-zinc-850]="!prob.isTop1 && !prob.isTop2"
                        [class.opacity-60]="!prob.isTop1 && !prob.isTop2"
                      >
                        <div class="flex items-center justify-between gap-2 text-xs">
                          <div class="flex items-center gap-2 truncate">
                            @if (prob.isTop1) {
                              <span class="text-sm">🥇</span>
                            } @else if (prob.isTop2) {
                              <span class="text-sm">🥈</span>
                            } @else {
                              <span class="text-xs text-zinc-600 font-mono">💤</span>
                            }
                            <span class="font-bold text-zinc-200 truncate font-mono">
                              {{ prob.expertLabel }}
                            </span>
                          </div>

                          <div class="flex items-center gap-2 font-mono shrink-0">
                            <span class="text-xs font-bold" [class.text-emerald-400]="prob.isTop1" [class.text-teal-300]="prob.isTop2" [class.text-zinc-500]="!prob.isTop1 && !prob.isTop2">
                              {{ prob.probabilityPercent }}%
                            </span>
                            <span class="text-[10px] text-zinc-500">
                              (logit {{ prob.logit }})
                            </span>
                          </div>
                        </div>

                        <!-- Progress Bar Indicator -->
                        <div class="w-full bg-zinc-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                          <div
                            class="h-full rounded-full transition-all duration-500"
                            [class.bg-emerald-500]="prob.isTop1"
                            [class.bg-teal-400]="prob.isTop2"
                            [class.bg-zinc-600]="!prob.isTop1 && !prob.isTop2"
                            [style.width.%]="prob.probabilityPercent"
                          ></div>
                        </div>

                        <p class="text-[10px] text-zinc-400 mt-1 truncate">
                          {{ prob.routingRationale }}
                        </p>
                      </div>
                    }
                  </div>
                </div>

                <div class="text-[10px] text-zinc-500 font-mono pt-2 border-t border-zinc-800/60">
                  Partition: Top-1 Primary | Top-2 Secondary | 6 Dormant Shelf
                </div>
              </div>

            </div>

            <!-- STAGE 4: Resulting Dispatch & Synapse Cross-Attention Bridge -->
            <div class="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-zinc-900/80 to-teal-950/50 border border-emerald-500/40 shadow-xl space-y-4">
              <div class="flex items-center justify-between border-b border-emerald-500/20 pb-3 flex-wrap gap-2">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-mono text-sm font-bold">
                    4
                  </div>
                  <div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-900/60 text-emerald-300 border border-emerald-500/30">
                      Stage 4: Active Canvas Dispatch & Synapse Cross-Attention Bridge
                    </span>
                    <h4 class="text-sm font-bold text-zinc-100 font-mono tracking-wide mt-0.5">
                      {{ flow.resultingRouting.bridgeTitle }}
                    </h4>
                  </div>
                </div>

                <div class="flex items-center gap-2 font-mono text-xs">
                  <span class="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
                    🥇 {{ flow.resultingRouting.primaryLabel }}: {{ flow.resultingRouting.primaryRatio }}%
                  </span>
                  <span class="px-2.5 py-1 rounded-lg bg-teal-950 border border-teal-500/40 text-teal-300 font-bold">
                    🥈 {{ flow.resultingRouting.secondaryLabel }}: {{ flow.resultingRouting.secondaryRatio }}%
                  </span>
                  <span class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">
                    🛡️ +{{ flow.resultingRouting.noiseReductionPercent }}% Noise Reduction
                  </span>
                </div>
              </div>

              <!-- Bridge Details -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div class="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                  <span class="text-[10px] uppercase font-bold text-zinc-400 font-mono block">Physiological Mechanism:</span>
                  <p class="text-zinc-200 leading-relaxed text-[11px]">
                    {{ flow.resultingRouting.bridgeMechanism }}
                  </p>
                </div>
                <div class="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                  <span class="text-[10px] uppercase font-bold text-emerald-400 font-mono block">Actionable Vector:</span>
                  <p class="text-emerald-200/90 leading-relaxed text-[11px]">
                    {{ flow.resultingRouting.bridgeActionableVector }}
                  </p>
                </div>
                <div class="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1">
                  <span class="text-[10px] uppercase font-bold text-cyan-400 font-mono block">Target Clinical Benchmark:</span>
                  <p class="text-cyan-200/90 leading-relaxed text-[11px] font-mono">
                    {{ flow.resultingRouting.bridgeBenchmark }}
                  </p>
                </div>
              </div>

              <!-- Synthesis Narrative -->
              <div class="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs">
                <span class="text-[10px] uppercase font-bold text-purple-400 font-mono block mb-1">
                  🧠 Synthesis Narrative & Epistemic Story:
                </span>
                <p class="text-zinc-300 leading-relaxed">
                  {{ flow.clinicalDecisionStory }}
                </p>
              </div>
            </div>

          } @else {
            <div class="p-8 text-center text-zinc-500 font-mono text-sm">
              No decision flow profile found for this patient.
            </div>
          }
        </div>

        <!-- Footer -->
        <footer class="p-3.5 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs font-mono text-zinc-400 shrink-0">
          <div class="flex items-center gap-2">
            <span>🛡️ HIPAA §164.514 Safe Harbor De-Identified</span>
            <span>•</span>
            <span>NIST SP 800-90A CSPRNG Sealed</span>
          </div>
          <button
            type="button"
            (click)="closeModal.emit()"
            class="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition cursor-pointer"
          >
            Close Explorer
          </button>
        </footer>

      </div>
    </div>
  `
})
export class SmoeDecisionFlowExplorerComponent {
  public readonly moeRouter = inject(ClinicalMoERouterService);
  
  public readonly patientId = input<string | null>(null);
  public readonly closeModal = output<void>();
  public readonly patientSelected = output<string>();
  public readonly askAi = output<string>();

  public readonly shiftRoster = SHIFT_CARE_PLAN_ROSTER;
  public readonly localSelectedPatientId = signal<string | null>(null);

  public readonly selectedPatientId = computed<string>(() => {
    return this.localSelectedPatientId() || this.patientId() || this.moeRouter.activeShiftPatientId() || 'p001';
  });

  public readonly activeFlow = computed<IPatientDecisionFlow | null>(() => {
    return this.moeRouter.getDecisionFlow(this.selectedPatientId());
  });

  public selectPatient(id: string): void {
    this.localSelectedPatientId.set(id);
    this.patientSelected.emit(id);
  }

  public loadIntoLiveCanvas(patientId: string): void {
    this.moeRouter.loadShiftPatient(patientId);
    this.closeModal.emit();
  }

  public askAiExplanation(patientId: string): void {
    this.askAi.emit(patientId);
  }
}
