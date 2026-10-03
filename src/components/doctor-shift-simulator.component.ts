import { Component, ChangeDetectionStrategy, signal, computed, inject, output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { IPatient } from '../services/patient.types';

export interface ICaseCarePlan {
  diagnosis: string;
  icd10: string;
  threeActs: {
    act1: string; // Days 0-30: Auxiliary Metabolic Bridge & Baseline Screening
    act2: string; // Weeks 2-12: Sleep Architecture, Glymphatic Protection & Autonomic Pacing
    act3: string; // Months 6+: Multi-Modal Stepped-Care Partnership & Long-Term Resilience
  };
  medSkepticAudit: {
    nullHypothesisH0: string;
    pValue: number;
    isFalsified: boolean;
    cochraneRoB: 'Low Risk of Bias' | 'Some Concerns' | 'High Risk of Bias';
    dcaNetBenefit: number;
    unnecessaryProceduresAvoided: number;
    skepticalVerdict: string;
  };
  antonovskyManageability: {
    immediateRemedy: string; // <= $25
    costEstimate: string;
    remineralizationWaterPlan: string;
    iatrogenicPanicSafeguard: string;
  };
  pharmacyBenchmark: {
    standardRetail: string;
    genericBenchmark: string; // $4 - $10 Walmart/Amazon
    estimatedOutOfPocket: string;
  };
}

export interface IShiftPhase {
  id: number;
  timeRange: string;
  title: string;
  subtitle: string;
  patientCount: number;
  fatigueBaseline: number; // 0 - 100%
  fatigueShielded: number; // 0 - 100%
  chartingHoursSaved: number;
  apiSpend: number; // $ USD
  fhirBundles: number;
  equityParityScore: number; // %
  keyIntervention: string;
  doctorWellnessTip: string;
}

export interface IShiftPatientCase {
  id: string;
  time: string;
  patientName: string;
  ward: string;
  chiefComplaint: string;
  triageLevel: 'L1-RED' | 'L2-ORANGE' | 'L3-YELLOW' | 'L4-GREEN';
  triageColor: string;
  parityAudit: 'Pass (Optimal)' | 'Pass (Monitored)';
  carePlan?: ICaseCarePlan;
}

@Component({
  selector: 'app-doctor-shift-simulator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[1200] bg-black/85 backdrop-blur-2xl p-3 sm:p-6 flex items-center justify-center overflow-y-auto font-mono text-zinc-100 animate-in fade-in duration-300">
      
      <div class="w-full max-w-5xl bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl p-5 sm:p-7 relative overflow-hidden font-mono flex flex-col justify-between max-h-[94vh]">
        
        <!-- Top Bar Header -->
        <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3 shrink-0">
          <div class="flex items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.8)] animate-pulse"></span>
            <div>
              <h2 class="text-sm sm:text-base font-black uppercase tracking-tight text-zinc-100 flex items-center gap-2">
                <span>⚡</span> 12-Hour Intensive Doctor Shift Simulator &amp; Care Plan Engine
              </h2>
              <p class="text-xs text-zinc-400 font-sans mt-0.5">
                Dr. Sarah Chen, MD — 28 Encounters Across 5 Wards (07:00 – 19:00) • 100% Care Plan Grounding
              </p>
            </div>
          </div>

          <button (click)="closeModal.emit()"
            class="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition cursor-pointer text-sm font-bold">
            ✕
          </button>
        </div>

        <!-- Simulation Progress & State Notification Banner -->
        @if (statusNotification()) {
          <div class="mb-3 px-4 py-2 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-mono flex items-center justify-between animate-in fade-in duration-150">
            <span>{{ statusNotification() }}</span>
            <button (click)="statusNotification.set(null)" class="text-zinc-400 hover:text-white text-xs">✕</button>
          </div>
        }

        <!-- Scrollable Main Simulation Body -->
        <div class="space-y-5 overflow-y-auto pr-1 flex-1">
          
          <!-- Shift Timeline Stepper Controls -->
          <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-3 font-mono">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-orange-400 uppercase tracking-widest">Shift Progression:</span>
                <span class="text-sm font-black text-white bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800">
                  Phase {{ currentPhaseIndex() + 1 }} / {{ phases.length }} ({{ currentPhase().timeRange }})
                </span>
              </div>

              <!-- Automated Time-Lapse & Full Run Controls -->
              <div class="flex items-center gap-2 text-xs">
                <button (click)="runFullShiftSimulation()"
                  class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold uppercase tracking-wider transition cursor-pointer border border-teal-400/50 shadow-sm flex items-center gap-1.5">
                  <span>🚀 Run Full 12-Hour Simulation</span>
                </button>

                <button (click)="toggleAutoPlay()" 
                  [class]="isAutoPlaying() ? 'bg-rose-600 hover:bg-rose-500 text-white font-bold' : 'bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold'"
                  class="px-3.5 py-1.5 rounded-xl uppercase tracking-wider transition cursor-pointer border border-orange-400/50 flex items-center gap-1.5">
                  <span>{{ isAutoPlaying() ? '⏸ Pause' : '▶ Auto Play' }}</span>
                </button>

                <button (click)="stepNextPhase()" [disabled]="currentPhaseIndex() === phases.length - 1"
                  class="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-300 font-bold uppercase transition cursor-pointer border border-zinc-800 disabled:opacity-40">
                  Step →
                </button>
                <button (click)="resetShift()"
                  class="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-white transition cursor-pointer border border-zinc-800">
                  ↺ Reset
                </button>
              </div>
            </div>

            <!-- Phase Buttons Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              @for (phase of phases; track phase.id) {
                <button (click)="currentPhaseIndex.set(phase.id)"
                  [class]="currentPhaseIndex() === phase.id
                    ? 'p-2.5 rounded-xl bg-orange-500 text-zinc-950 font-bold border border-orange-400 text-left transition shadow-md'
                    : 'p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 text-left transition'"
                  class="cursor-pointer space-y-1">
                  <div class="text-[10px] uppercase tracking-wider opacity-80">{{ phase.timeRange }}</div>
                  <div class="text-xs font-bold truncate leading-tight">{{ phase.title }}</div>
                  <div class="text-[10px] opacity-75 font-sans">{{ phase.patientCount }} Patients</div>
                </button>
              }
            </div>
          </div>

          <!-- Shift Telemetry Cards (Double-Click Flip Enabled) -->
          <div (dblclick)="toggleAnalyticsFlip($event)" class="cursor-pointer select-none">
            <div [class]="isAnalyticsFlipped() ? 'bg-gradient-to-br from-teal-950/80 via-zinc-950 to-zinc-900 border-teal-500/40' : 'bg-zinc-900 border-zinc-800'"
                 class="p-5 rounded-2xl border transition-all duration-300 space-y-4">
              
              <!-- Card Face A: Shift Telemetry & Doctor Burnout Shielding -->
              <div *ngIf="!isAnalyticsFlipped()" class="space-y-4">
                <div class="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold uppercase tracking-wider text-orange-400">Shift Telemetry &amp; Cognitive Load HUD</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">Face A</span>
                  </div>
                  <span class="text-[10px] text-zinc-500 font-mono">Double-click card to flip to Polyvagal Mode</span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div class="text-[10px] text-zinc-400 uppercase tracking-widest">Cumulative Patients</div>
                    <div class="text-xl sm:text-2xl font-black text-orange-400 mt-1">{{ cumulativePatients() }} / 28</div>
                    <div class="text-[9px] text-zinc-500 mt-0.5">100% Care Plan Ready</div>
                  </div>

                  <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div class="text-[10px] text-zinc-400 uppercase tracking-widest">Charting Saved</div>
                    <div class="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{{ cumulativeHoursSaved() }}h</div>
                    <div class="text-[9px] text-zinc-500 mt-0.5">Pajama Time: 0 min</div>
                  </div>

                  <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div class="text-[10px] text-zinc-400 uppercase tracking-widest">Cumulative API Spend</div>
                    <div class="text-xl sm:text-2xl font-black text-teal-400 mt-1">\${{ cumulativeApiSpend() }}</div>
                    <div class="text-[9px] text-zinc-500 mt-0.5">Gemini 3.6 Flash Edge</div>
                  </div>

                  <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div class="text-[10px] text-zinc-400 uppercase tracking-widest">Fatigue Shielded</div>
                    <div class="text-xl sm:text-2xl font-black text-indigo-400 mt-1">
                      {{ currentPhase().fatigueShielded }}%
                      <span class="text-xs font-normal text-rose-500 line-through">({{ currentPhase().fatigueBaseline }}%)</span>
                    </div>
                    <div class="text-[9px] text-zinc-500 mt-0.5">58% Burnout Reduction</div>
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs flex items-start gap-2.5">
                  <span class="text-base leading-none">💡</span>
                  <div class="space-y-0.5">
                    <span class="font-bold text-orange-300">Phase {{ currentPhaseIndex() + 1 }} Key Focus:</span>
                    <p class="text-zinc-300 font-sans leading-relaxed text-[11.5px]">{{ currentPhase().keyIntervention }}</p>
                  </div>
                </div>
              </div>

              <!-- Card Face B: Polyvagal Doctor Resilience & Self-Care -->
              <div *ngIf="isAnalyticsFlipped()" class="space-y-4">
                <div class="flex justify-between items-center border-b border-teal-900 pb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold uppercase tracking-wider text-teal-300">🌿 Dr. Sarah Chen Polyvagal Pacing &amp; Restoration</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-teal-900/60 text-teal-300 font-mono">Face B</span>
                  </div>
                  <span class="text-[10px] text-teal-400 font-mono">Double-click card to return</span>
                </div>

                <div class="p-4 rounded-xl bg-teal-950/40 border border-teal-500/30 text-xs space-y-2">
                  <div class="font-bold text-teal-200 flex items-center gap-2">
                    <span>🫁</span> Active Micro-Habit Recommendation:
                  </div>
                  <p class="text-zinc-200 font-sans text-sm leading-relaxed">
                    {{ currentPhase().doctorWellnessTip }}
                  </p>
                </div>
              </div>

            </div>
          </div>

          <!-- Simulated Patient Encounters Table with Care Plan Actions -->
          <div class="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 font-mono">
            <div class="flex justify-between items-center mb-1">
              <h4 class="text-xs font-bold uppercase tracking-widest text-zinc-100 flex items-center gap-2">
                <span>📋</span> Simulated Patient Encounter Log (Phase {{ currentPhaseIndex() + 1 }})
              </h4>
              <span class="text-[10px] text-zinc-400 font-mono">FHIR R4 • Three Acts • DCA Validated</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr class="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase">
                    <th class="py-2 px-3">Time</th>
                    <th class="py-2 px-3">Patient Name</th>
                    <th class="py-2 px-3">Ward</th>
                    <th class="py-2 px-3">Chief Complaint</th>
                    <th class="py-2 px-3">Sentinel Triage</th>
                    <th class="py-2 px-3">§ 1557 Audit</th>
                    <th class="py-2 px-3 text-right">Care Plan</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800/60 text-[11px]">
                  @for (c of activeCases(); track c.id) {
                    <tr class="hover:bg-zinc-850/50 transition">
                      <td class="py-2.5 px-3 font-bold text-orange-400">{{ c.time }}</td>
                      <td class="py-2.5 px-3 font-bold text-zinc-200">{{ c.patientName }}</td>
                      <td class="py-2.5 px-3 text-zinc-400">{{ c.ward }}</td>
                      <td class="py-2.5 px-3 text-zinc-300 font-sans text-[11px] max-w-xs truncate">{{ c.chiefComplaint }}</td>
                      <td class="py-2.5 px-3">
                        <span [class]="c.triageColor" class="px-2 py-0.5 rounded text-[9.5px] font-bold uppercase">
                          {{ c.triageLevel }}
                        </span>
                      </td>
                      <td class="py-2.5 px-3">
                        <span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase font-bold">
                          {{ c.parityAudit }}
                        </span>
                      </td>
                      <td class="py-2.5 px-3 text-right">
                        @if (c.carePlan) {
                          <button (click)="openCarePlan(c)"
                            class="px-2.5 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-zinc-950 border border-orange-500/40 text-[10px] font-bold uppercase transition cursor-pointer flex items-center gap-1 ml-auto">
                            <span>📋</span> <span>Care Plan</span>
                          </button>
                        } @else {
                          <span class="text-[10px] text-zinc-500">Summary</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Footer Actions -->
        <div class="border-t border-zinc-800 pt-3 mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 font-mono">
          <div class="text-[11px] text-zinc-400">
            Shift Simulation Engine: <strong class="text-zinc-200">Pocket-Gull Doctor Resilience v2.5</strong> • 
            <span class="text-emerald-400">100% Care Plan Grounding Complete</span>
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button (click)="closeModal.emit()"
              class="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-orange-400/50">
              Close Simulation
            </button>
          </div>
        </div>

      </div>

      <!-- Interactive Patient Care Plan Viewer Modal (Slide-Over) -->
      @if (selectedCase(); as sc) {
        <div class="fixed inset-0 z-[1300] bg-black/85 backdrop-blur-xl p-3 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
          <div class="w-full max-w-3xl bg-zinc-950 rounded-3xl border border-orange-500/40 shadow-2xl p-5 sm:p-7 max-h-[92vh] overflow-y-auto space-y-5 font-mono text-zinc-100">
            
            <!-- Care Plan Header -->
            <div class="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-500 text-zinc-950">
                    {{ sc.time }} • {{ sc.ward }}
                  </span>
                  <span [class]="sc.triageColor" class="px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    {{ sc.triageLevel }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    {{ sc.parityAudit }}
                  </span>
                </div>
                <h3 class="text-base font-black text-white mt-1.5 flex items-center gap-2">
                  <span>👤</span> {{ sc.patientName }}
                </h3>
                <p class="text-xs text-orange-400 font-sans mt-0.5 font-semibold">
                  {{ sc.carePlan?.diagnosis }} (ICD-10: {{ sc.carePlan?.icd10 }})
                </p>
              </div>

              <button (click)="selectedCase.set(null)"
                class="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition cursor-pointer text-sm font-bold">
                ✕
              </button>
            </div>

            <!-- The Three Acts Clinical Reality Framework -->
            <div class="space-y-3">
              <h4 class="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                <span>⏱️</span> Three Acts Clinical Trajectory (Days 0 to Months 6+)
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div class="text-[10px] font-bold uppercase text-orange-300">Act I: Metabolic Bridge (Days 0–30)</div>
                  <p class="text-[11px] text-zinc-300 font-sans leading-relaxed">{{ sc.carePlan?.threeActs?.act1 }}</p>
                </div>
                <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div class="text-[10px] font-bold uppercase text-teal-300">Act II: Autonomic Pacing (Weeks 2–12)</div>
                  <p class="text-[11px] text-zinc-300 font-sans leading-relaxed">{{ sc.carePlan?.threeActs?.act2 }}</p>
                </div>
                <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div class="text-[10px] font-bold uppercase text-indigo-300">Act III: Long-Term Resilience (Months 6+)</div>
                  <p class="text-[11px] text-zinc-300 font-sans leading-relaxed">{{ sc.carePlan?.threeActs?.act3 }}</p>
                </div>
              </div>
            </div>

            <!-- MED-SKEPTIC & Vickers-Elkin DCA Epistemic Verification -->
            <div class="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2.5">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                  <span>⚖️</span> MED-SKEPTIC Falsification &amp; Decision Curve Analysis (DCA)
                </h4>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {{ sc.carePlan?.medSkepticAudit?.cochraneRoB }}
                </span>
              </div>
              <p class="text-[11.5px] text-zinc-300 font-sans leading-relaxed">
                {{ sc.carePlan?.medSkepticAudit?.skepticalVerdict }}
              </p>
              <div class="flex flex-wrap items-center gap-3 pt-1 text-[10px] font-mono text-indigo-200">
                <span>H₀ Rejection: p = {{ sc.carePlan?.medSkepticAudit?.pValue }} ({{ sc.carePlan?.medSkepticAudit?.isFalsified ? 'Statistically Significant' : 'Not Significant' }})</span>
                <span>•</span>
                <span>DCA Net Benefit: +{{ sc.carePlan?.medSkepticAudit?.dcaNetBenefit }}</span>
                <span>•</span>
                <span class="text-emerald-400 font-bold">Unneeded Procedures Avoided: {{ sc.carePlan?.medSkepticAudit?.unnecessaryProceduresAvoided }} / 100</span>
              </div>
            </div>

            <!-- Antonovsky Salutogenic Manageability Invariant -->
            <div class="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
              <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                <span>🛡️</span> Antonovsky Salutogenic Manageability Invariant (Zero Iatrogenic Panic)
              </h4>
              <p class="text-[11.5px] text-zinc-300 font-sans leading-relaxed">
                <strong>Immediate Low-Cost Fix:</strong> {{ sc.carePlan?.antonovskyManageability?.immediateRemedy }} (Est. {{ sc.carePlan?.antonovskyManageability?.costEstimate }})
              </p>
              <p class="text-[11px] text-zinc-400 font-sans leading-relaxed">
                <strong>Living Water &amp; Exposome:</strong> {{ sc.carePlan?.antonovskyManageability?.remineralizationWaterPlan }}
              </p>
              <p class="text-[10.5px] text-emerald-400 font-sans italic">
                {{ sc.carePlan?.antonovskyManageability?.iatrogenicPanicSafeguard }}
              </p>
            </div>

            <!-- Respectful Pharmacy Pricing Benchmarks -->
            <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div class="space-y-0.5">
                <span class="text-[10px] text-zinc-400 uppercase font-mono">Respectful Pharmacy Benchmarks</span>
                <div class="text-[11px] text-zinc-300 font-sans">
                  Standard Retail: <span class="line-through text-zinc-500">{{ sc.carePlan?.pharmacyBenchmark?.standardRetail }}</span> → 
                  <strong class="text-emerald-400">Generic Benchmark: {{ sc.carePlan?.pharmacyBenchmark?.genericBenchmark }}</strong>
                </div>
              </div>
              <div class="text-right">
                <span class="text-[10px] text-zinc-400 uppercase font-mono">Estimated Out-of-Pocket</span>
                <div class="text-sm font-black text-white">{{ sc.carePlan?.pharmacyBenchmark?.estimatedOutOfPocket }}</div>
              </div>
            </div>

            <!-- Actions Bar: Load Patient & FHIR Export -->
            <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800">
              <div class="flex items-center gap-2">
                <button (click)="loadCaseIntoPatientState(sc)"
                  class="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-orange-400/50 flex items-center gap-1.5">
                  <span>🏥</span> <span>Load Into Active State</span>
                </button>

                <button (click)="exportCaseFhirBundle(sc)"
                  class="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-zinc-700 flex items-center gap-1.5">
                  <span>📄</span> <span>Export FHIR R4 Bundle</span>
                </button>
              </div>

              <button (click)="selectedCase.set(null)"
                class="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase transition cursor-pointer border border-zinc-800">
                Close Care Plan
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class DoctorShiftSimulatorComponent implements OnDestroy {
  closeModal = output<void>();

  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  currentPhaseIndex = signal<number>(0);
  isAutoPlaying = signal<boolean>(false);
  isAnalyticsFlipped = signal<boolean>(false);
  selectedCase = signal<IShiftPatientCase | null>(null);
  statusNotification = signal<string | null>(null);
  private lastAnalyticsFlipTime = 0;
  private autoPlayTimer: any = null;

  toggleAnalyticsFlip(event?: Event) {
    if (event) event.stopPropagation();
    const now = Date.now();
    if (now - this.lastAnalyticsFlipTime < 200) return;
    this.lastAnalyticsFlipTime = now;
    this.isAnalyticsFlipped.update(v => !v);
  }

  phases: IShiftPhase[] = [
    {
      id: 0,
      timeRange: '07:00 – 09:00',
      title: 'Inpatient Triage & Emergency Resuscitation',
      subtitle: 'Cardiology, Acute Renal Wards & Sentinel Triage Stream',
      patientCount: 6,
      fatigueBaseline: 35,
      fatigueShielded: 12,
      chartingHoursSaved: 0.5,
      apiSpend: 0.036,
      fhirBundles: 6,
      equityParityScore: 99.6,
      keyIntervention: 'Rapid 3D Spatial Lens organ inspection & Sentinel Triage level assignments (L1-RED resuscitation to L4-GREEN stable).',
      doctorWellnessTip: 'Perform 3 cycles of physiological sighing (double inhale through nose, long slow exhale through mouth) before high-stress ED consults.'
    },
    {
      id: 1,
      timeRange: '09:00 – 13:00',
      title: 'High-Density Outpatient Chronic Care',
      subtitle: 'Autoimmune, Circadian Disruption & Metabolic Consults',
      patientCount: 14,
      fatigueBaseline: 70,
      fatigueShielded: 24,
      chartingHoursSaved: 1.2,
      apiSpend: 0.084,
      fhirBundles: 14,
      equityParityScore: 99.4,
      keyIntervention: 'Double-Click Card Flips toggle Face A (high-density clinical telemetry) for clinician decision making and Face B (8th-grade reading level + 1 daily micro-habit) for patient counseling.',
      doctorWellnessTip: 'Double-click telemetry cards to activate Cognitive Load Shielding. Step into amber light entrainment between complex autoimmune consults.'
    },
    {
      id: 2,
      timeRange: '13:00 – 14:00',
      title: 'Multimodal Voice Dictation & SBAR Note Sync',
      subtitle: 'Gemini 3.6 Flash Voice Assistant, PubGemma 27B MeSH & Specialist Handoffs',
      patientCount: 2,
      fatigueBaseline: 82,
      fatigueShielded: 30,
      chartingHoursSaved: 0.4,
      apiSpend: 0.012,
      fhirBundles: 2,
      equityParityScore: 99.5,
      keyIntervention: 'Conversational Web Audio API dictation generates structured SBAR specialist briefs and populates FHIR R4 Bundles directly, saving 45 minutes of manual typing.',
      doctorWellnessTip: 'Hydrate with mineralized herbal decoction (suboccipital release) while reviewing voice assistant generated SBAR notes.'
    },
    {
      id: 3,
      timeRange: '14:00 – 17:00',
      title: 'HHS § 1557 Live Equity Audit & Multilingual Consults',
      subtitle: 'Limited English Proficiency (LEP) & Pediatric Cohorts',
      patientCount: 4,
      fatigueBaseline: 90,
      fatigueShielded: 35,
      chartingHoursSaved: 0.3,
      apiSpend: 0.024,
      fhirBundles: 4,
      equityParityScore: 99.4,
      keyIntervention: 'ACA Section 1557 Live Equity Check verifies zero race-adjusted multipliers (eGFR/VBAC) and streams 42-language translation for LEP family members.',
      doctorWellnessTip: '4-7-8 RSA diaphragmatic breathing break to maintain vagal baroreflex tone during complex pediatric multi-lingual family conferences.'
    },
    {
      id: 4,
      timeRange: '17:00 – 19:00',
      title: 'Zero-Backlog Shift Departure & Actuarial QALY Gain',
      subtitle: 'Final Chart Sign-off & Healthspan Projection',
      patientCount: 2,
      fatigueBaseline: 98,
      fatigueShielded: 40,
      chartingHoursSaved: 0.1,
      apiSpend: 0.012,
      fhirBundles: 2,
      equityParityScore: 99.6,
      keyIntervention: 'All 28 patient encounters completed with 0 home charting backlog ("pajama time eliminated"). Actuarial QALY biological age projections updated.',
      doctorWellnessTip: 'Shift complete! Zero un-signed charts. Enjoy 100% boundary separation between hospital and home life.'
    }
  ];

  currentPhase = computed(() => this.phases[this.currentPhaseIndex()]);

  cumulativePatients = computed(() => {
    return this.phases.slice(0, this.currentPhaseIndex() + 1).reduce((sum, p) => sum + p.patientCount, 0);
  });

  cumulativeHoursSaved = computed(() => {
    return Number(this.phases.slice(0, this.currentPhaseIndex() + 1).reduce((sum, p) => sum + p.chartingHoursSaved, 0).toFixed(1));
  });

  cumulativeApiSpend = computed(() => {
    return Number(this.phases.slice(0, this.currentPhaseIndex() + 1).reduce((sum, p) => sum + p.apiSpend, 0).toFixed(3));
  });

  patientCases: Record<number, IShiftPatientCase[]> = {
    0: [
      {
        id: 'sc01',
        time: '07:15 AM',
        patientName: 'Elena Rostova',
        ward: 'Cardiology W1',
        chiefComplaint: 'Acute substernal chest pressure, radiation to jaw',
        triageLevel: 'L1-RED',
        triageColor: 'bg-rose-950 text-rose-300 border border-rose-500/50',
        parityAudit: 'Pass (Optimal)',
        carePlan: {
          diagnosis: 'Non-ST-Elevation Myocardial Ischemia / Coronary Microvascular Dysfunction',
          icd10: 'I20.8',
          threeActs: {
            act1: 'Dual antiplatelet therapy (Aspirin 81mg + Clopidogrel 75mg), hydrophilic Rosuvastatin 10mg, continuous telemetry, serial troponins.',
            act2: 'Cardiac rehabilitation autonomic pacing, 0.1 Hz vagal resonant breathing (rMSSD > 45ms target), polysomnography to rule out nocturnal hypoxemia.',
            act3: 'Endothelial nitric oxide restoration (Mediterranean-Okinawan polyphenol diet), annual microvascular perfusion surveillance.'
          },
          medSkepticAudit: {
            nullHypothesisH0: 'H0: Immediate emergent angiography in biomarker-negative microvascular angina yields no 1-year mortality benefit over medical stabilization.',
            pValue: 0.008,
            isFalsified: true,
            cochraneRoB: 'Low Risk of Bias',
            dcaNetBenefit: 0.142,
            unnecessaryProceduresAvoided: 26,
            skepticalVerdict: 'Vickers & Elkin DCA confirms clinical utility of medical stabilization, avoiding 26 unnecessary emergent stenting procedures per 100 patients.'
          },
          antonovskyManageability: {
            immediateRemedy: 'Remineralize drinking water with food-grade magnesium bicarbonate to prevent coronary vasospasm.',
            costEstimate: '$18/month',
            remineralizationWaterPlan: 'Target 75 mg/L CaCO3 equivalent drinking water mineral balance.',
            iatrogenicPanicSafeguard: 'Reassure patient that microvascular angina responds safely to stepped pacing without requiring irreversible open bypass.'
          },
          pharmacyBenchmark: {
            standardRetail: '$185/mo',
            genericBenchmark: '$4/mo (Aspirin + Rosuvastatin at Walmart/Amazon)',
            estimatedOutOfPocket: '$4.00/mo'
          }
        }
      },
      {
        id: 'sc02',
        time: '07:45 AM',
        patientName: 'Marcus Vance',
        ward: 'Renal Unit R3',
        chiefComplaint: 'Acute oliguria, hyperkalemia (K+ 6.2 mEq/L)',
        triageLevel: 'L1-RED',
        triageColor: 'bg-rose-950 text-rose-300 border border-rose-500/50',
        parityAudit: 'Pass (Optimal)',
        carePlan: {
          diagnosis: 'KDIGO Stage 3 Acute Kidney Injury secondary to ACEi + NSAID volume contraction',
          icd10: 'N17.9',
          threeActs: {
            act1: 'Emergency cardiac membrane stabilization (IV Calcium gluconate 1g), shift K+ into cells (insulin 10U regular + 50mL D50), hold Lisinopril/Ibuprofen, gentle isotonic volume expansion.',
            act2: 'Weekly basic metabolic monitoring, dietary potassium titration (restrict dried fruits, ban salt substitutes), tubular recovery surveillance.',
            act3: 'Renoprotective transition to renal-sparing calcium channel blocker (Amlodipine 5mg), periodic cystatin-C eGFR monitoring.'
          },
          medSkepticAudit: {
            nullHypothesisH0: 'H0: Immediate emergent hemodialysis in non-refractory hyperkalemia provides no survival advantage over medical shifting protocols.',
            pValue: 0.004,
            isFalsified: true,
            cochraneRoB: 'Low Risk of Bias',
            dcaNetBenefit: 0.168,
            unnecessaryProceduresAvoided: 38,
            skepticalVerdict: 'DCA net utility confirms medical stabilization superior to immediate central venous catheterization, avoiding 38 urgent dialysis catheter placements per 100 patients.'
          },
          antonovskyManageability: {
            immediateRemedy: 'Deploy point-of-use NSF-53 carbon filtration to remove municipal chloramines; clear guidance on low-potassium home meal preparation.',
            costEstimate: '<=$22 filter',
            remineralizationWaterPlan: 'Avoid artificial potassium-rich salt substitutes; use pure filtered municipal water.',
            iatrogenicPanicSafeguard: 'Reassure patient that acute kidney injury is reversible and avoid terrifying dialysis pronouncements.'
          },
          pharmacyBenchmark: {
            standardRetail: '$94/mo',
            genericBenchmark: '$4/mo (Amlodipine generic)',
            estimatedOutOfPocket: '$4.00/mo'
          }
        }
      },
      {
        id: 'sc03',
        time: '08:15 AM',
        patientName: 'Sarah Jenkins',
        ward: 'General Med',
        chiefComplaint: 'Post-op wound erythema & fever (101.8°F)',
        triageLevel: 'L2-ORANGE',
        triageColor: 'bg-orange-950 text-orange-300 border border-orange-500/50',
        parityAudit: 'Pass (Optimal)',
        carePlan: {
          diagnosis: 'Surgical Site Cellulitis (Streptococcus pyogenes sensitive to Cefazolin)',
          icd10: 'T81.4XXA',
          threeActs: {
            act1: 'Culture-directed IV Cefazolin 1g q8h with step-down to oral Cephalexin 500mg QID x 7 days, gentle saline dressing changes, serial erythema margin marking.',
            act2: 'Incisional myofascial mobilization, zinc carnosine 75mg BID for fibroblast collagen synthesis, probiotic microbiome repletion (L. rhamnosus GG).',
            act3: 'Full tissue remodeling, scar elasticity restoration, stepped return to full functional lifting.'
          },
          medSkepticAudit: {
            nullHypothesisH0: 'H0: Narrow-spectrum Cefazolin provides non-inferior clinical cure compared to empiric broad-spectrum carbapenems/aminoglycosides.',
            pValue: 0.002,
            isFalsified: true,
            cochraneRoB: 'Low Risk of Bias',
            dcaNetBenefit: 0.185,
            unnecessaryProceduresAvoided: 44,
            skepticalVerdict: 'Refutes Appeal to Authority / Sunk Cost fallacy. Narrow-spectrum targeted therapy avoids 44 unnecessary broad-spectrum antibiotic days per 100 patients.'
          },
          antonovskyManageability: {
            immediateRemedy: 'Sterile home wound dressing kit and daily margin tracking ruler.',
            costEstimate: '$12 one-time',
            remineralizationWaterPlan: 'Drink filtered water to support cellular hydration and lymphatic drainage.',
            iatrogenicPanicSafeguard: 'Explain that fever and margin erythema represent an active immune response responsive to targeted antibiotics.'
          },
          pharmacyBenchmark: {
            standardRetail: '$110',
            genericBenchmark: '$8 (Cephalexin 500mg at Walmart)',
            estimatedOutOfPocket: '$8.00 total'
          }
        }
      },
      {
        id: 'sc04',
        time: '08:40 AM',
        patientName: 'David Kim',
        ward: 'Observation Unit',
        chiefComplaint: 'Syncope episode post-exertion, orthostatic drop',
        triageLevel: 'L3-YELLOW',
        triageColor: 'bg-amber-950 text-amber-300 border border-amber-500/50',
        parityAudit: 'Pass (Optimal)',
        carePlan: {
          diagnosis: 'Neurocardiogenic Vasovagal Syncope & Post-Exertional Autonomic Dysregulation',
          icd10: 'R55',
          threeActs: {
            act1: 'Orthostatic vitals confirmation, rule out channelopathy (ECG QTc 418ms normal, echo normal), physical counter-pressure maneuvers (leg crossing, hand grip).',
            act2: 'Oral fluid repletion (2.5L daily with 5g sodium chloride / electrolyte repletion), compression stockings (20-30 mmHg), 0.1 Hz vagal baroreflex entrainment.',
            act3: 'Exercise reconditioning (recumbent cycle transitioning to upright training), long-term autonomic stability.'
          },
          medSkepticAudit: {
            nullHypothesisH0: 'H0: Routine inpatient electrophysiology study for isolated vasovagal syncope with normal ECG/echo yields zero therapeutic benefit.',
            pValue: 0.001,
            isFalsified: true,
            cochraneRoB: 'Low Risk of Bias',
            dcaNetBenefit: 0.210,
            unnecessaryProceduresAvoided: 52,
            skepticalVerdict: 'DCA net utility confirms physical counter-pressure and hydration strictly superior to invasive EP study, avoiding 52 unneeded cardiac catheterizations per 100 patients.'
          },
          antonovskyManageability: {
            immediateRemedy: 'Graduated compression stockings (20-30 mmHg) and home electrolyte hydration mix.',
            costEstimate: '$22 one-time',
            remineralizationWaterPlan: 'Electrolyte-enhanced living water with natural sea salt to expand intravascular volume.',
            iatrogenicPanicSafeguard: 'Reassure patient that vasovagal syncope is benign and does not indicate heart failure.'
          },
          pharmacyBenchmark: {
            standardRetail: '$320 (unneeded workup)',
            genericBenchmark: '$0 (lifestyle counter-pressure)',
            estimatedOutOfPocket: '$0.00'
          }
        }
      }
    ],
    1: [
      {
        id: 'sc05',
        time: '09:15 AM',
        patientName: 'Homo Sapiens (Male, 44y)',
        ward: 'Outpatient Clinic',
        chiefComplaint: 'L5-S1 radiculopathy, fatigue, circadian disruption',
        triageLevel: 'L3-YELLOW',
        triageColor: 'bg-amber-950 text-amber-300 border border-amber-500/50',
        parityAudit: 'Pass (Optimal)',
        carePlan: {
          diagnosis: 'Lumbar Disc Displacement with L5-S1 Radiculopathy (Stable, zero red flags)',
          icd10: 'M51.27',
          threeActs: {
            act1: 'Short-term neuropathic bridge (Gabapentin 300mg TID titrated), directional mechanical McKenzie extension exercises, avoidance of prolonged spinal flexion.',
            act2: 'Core spinal stabilization (McGill Big 3), anti-inflammatory omega-3 SPM repletion, sleep chronobiology alignment (morning outdoor light exposure).',
            act3: 'Biomechanical workplace ergonomic redesign, deadlift hip-hinge patterning, sustained radicular resolution.'
          },
          medSkepticAudit: {
            nullHypothesisH0: 'H0: Immediate lumbar spinal fusion provides superior functional recovery over 12 weeks of structured physical conditioning.',
            pValue: 0.012,
            isFalsified: true,
            cochraneRoB: 'Low Risk of Bias',
            dcaNetBenefit: 0.154,
            unnecessaryProceduresAvoided: 40,
            skepticalVerdict: 'DCA proves conservative stepped care is superior to immediate spinal surgery at decision threshold pt = 0.12, avoiding 40 unnecessary surgeries per 100 patients.'
          },
          antonovskyManageability: {
            immediateRemedy: 'Ergonomic lumbar support cushion and daily 15-minute home floor McKenzie protocol.',
            costEstimate: '$19 one-time',
            remineralizationWaterPlan: 'Maintain cellular disc hydration with magnesium-rich mineralized drinking water.',
            iatrogenicPanicSafeguard: 'Demystify spinal MRI: disc bulges are common and often resorb spontaneously without surgery.'
          },
          pharmacyBenchmark: {
            standardRetail: '$165/mo',
            genericBenchmark: '$6/mo (Gabapentin generic at Walmart)',
            estimatedOutOfPocket: '$6.00/mo'
          }
        }
      },
      {
        id: 'sc06',
        time: '09:50 AM',
        patientName: 'Amara Okafor',
        ward: 'Outpatient Clinic',
        chiefComplaint: 'Hashimoto thyroiditis flare, brain fog, cold intolerance',
        triageLevel: 'L3-YELLOW',
        triageColor: 'bg-amber-950 text-amber-300 border border-amber-500/50',
        parityAudit: 'Pass (Optimal)',
        carePlan: {
          diagnosis: 'Chronic Autoimmune Thyroiditis (Hashimoto) with Subclinical Hypothyroidism',
          icd10: 'E06.3',
          threeActs: {
            act1: 'Optimize Levothyroxine to 75mcg fasting with water, Selenomethionine 200mcg/d to downregulate anti-TPO antibodies, baseline TSH/Free T4/Free T3 panel.',
            act2: 'Myo-Inositol 600mg daily for TSH receptor signaling, gluten/dairy reduction trial, circadian pacing for morning cortisol awakening curve.',
            act3: 'Stable euthyroid homeostasis, normalized antibody titers, annual endocrine surveillance.'
          },
          medSkepticAudit: {
            nullHypothesisH0: 'H0: Immediate high-dose systemic corticosteroid therapy improves thyroid gland survival in subclinical Hashimoto flare.',
            pValue: 0.006,
            isFalsified: true,
            cochraneRoB: 'Low Risk of Bias',
            dcaNetBenefit: 0.128,
            unnecessaryProceduresAvoided: 34,
            skepticalVerdict: 'DCA confirms targeted trace mineral repletion and Levothyroxine titration avoid 34 unneeded steroid cycles per 100 patients.'
          },
          antonovskyManageability: {
            immediateRemedy: 'Selenomethionine 200mcg and warm water morning thyroid routine.',
            costEstimate: '$14/month',
            remineralizationWaterPlan: 'Filter drinking water to remove halogens (chloramines/fluoride) that compete with thyroid iodine uptake.',
            iatrogenicPanicSafeguard: 'Reassure patient that autoimmune thyroid flares stabilize with consistent nutritional and hormone bridging.'
          },
          pharmacyBenchmark: {
            standardRetail: '$85/mo',
            genericBenchmark: '$4/mo (Levothyroxine at Walmart/Amazon)',
            estimatedOutOfPocket: '$4.00/mo'
          }
        }
      },
      {
        id: 'sc07',
        time: '10:30 AM',
        patientName: 'Robert Sterling',
        ward: 'Outpatient Clinic',
        chiefComplaint: 'Metabolic syndrome, HbA1c 7.8%, NAFLD suspicion',
        triageLevel: 'L4-GREEN',
        triageColor: 'bg-emerald-950 text-emerald-300 border border-emerald-500/50',
        parityAudit: 'Pass (Optimal)',
        carePlan: {
          diagnosis: 'Type 2 Diabetes Mellitus with Metabolic Dysfunction-Associated Steatohepatitis (MASH)',
          icd10: 'E11.8 / K76.0',
          threeActs: {
            act1: 'Metformin 500mg BID titrated to 1000mg BID with meals, continuous glucose monitoring (CGM) sensor placement, eliminate liquid sugars and seed oils.',
            act2: 'Berberine HCl 500mg BID (AMPK synergy), 10-hour time-restricted feeding window (09:00–19:00), zone-2 aerobic conditioning (150 min/wk).',
            act3: 'FibroScan elastography recheck, HbA1c < 6.5% goal, reversal of hepatic steatosis.'
          },
          medSkepticAudit: {
            nullHypothesisH0: 'H0: Expensive branded GLP-1 monotherapy without lifestyle foundation prevents progressive hepatic fibrosis better than combined metformin + exercise.',
            pValue: 0.015,
            isFalsified: true,
            cochraneRoB: 'Low Risk of Bias',
            dcaNetBenefit: 0.176,
            unnecessaryProceduresAvoided: 36,
            skepticalVerdict: 'DCA confirms foundation lifestyle + Metformin yields superior sustained metabolic utility, avoiding 36 premature drug escalations per 100 patients.'
          },
          antonovskyManageability: {
            immediateRemedy: 'Post-meal 10-minute brisk walk and whole food perimeter grocery navigation.',
            costEstimate: '$0 cost',
            remineralizationWaterPlan: 'Drink 2.5L mineralized water daily to accelerate renal glucose and hepatic metabolite excretion.',
            iatrogenicPanicSafeguard: 'Frame metabolic syndrome as an energetic overload condition that is completely reversible with daily lifestyle levers.'
          },
          pharmacyBenchmark: {
            standardRetail: '$240/mo',
            genericBenchmark: '$4/mo (Metformin 1000mg at Walmart)',
            estimatedOutOfPocket: '$4.00/mo'
          }
        }
      },
      {
        id: 'sc08',
        time: '11:15 AM',
        patientName: 'Homo Sapiens (Female, Long COVID Dysautonomia)',
        ward: 'Outpatient Clinic',
        chiefComplaint: 'Long COVID dysautonomia, RSA vagal impairment',
        triageLevel: 'L3-YELLOW',
        triageColor: 'bg-amber-950 text-amber-300 border border-amber-500/50',
        parityAudit: 'Pass (Optimal)',
        carePlan: {
          diagnosis: 'Post-COVID-19 Autonomic Dysfunction / Postural Orthostatic Tachycardia Syndrome (POTS)',
          icd10: 'U09.9 / G90.A',
          threeActs: {
            act1: 'Vagal nerve pacing via 0.1 Hz resonance frequency diaphragmatic breathing (6 breaths/min for 15 min BID), oral salt loading (4g/d) with 3L fluid, recumbent conditioning.',
            act2: 'Low-histamine whole foods transition, CoQ10 200mg + PEA 600mg BID for neurovascular mast cell stabilization, graduated upright conditioning.',
            act3: 'Autonomic baroreflex restoration, normalized standing HR (<30 bpm jump), return to full vocational activity.'
          },
          medSkepticAudit: {
            nullHypothesisH0: 'H0: Off-label immune-adsorption apheresis provides durable symptom resolution over autonomic pacing and volume expansion.',
            pValue: 0.003,
            isFalsified: true,
            cochraneRoB: 'Low Risk of Bias',
            dcaNetBenefit: 0.224,
            unnecessaryProceduresAvoided: 48,
            skepticalVerdict: 'DCA net utility confirms autonomic pacing and hydration avoid 48 costly and invasive apheresis procedures per 100 patients.'
          },
          antonovskyManageability: {
            immediateRemedy: 'Smartphone 0.1 Hz resonance breathing timer and pink Himalayan salt water solution.',
            costEstimate: '$6 one-time',
            remineralizationWaterPlan: 'Electrolyte living water to maintain plasma volume and cerebral perfusion.',
            iatrogenicPanicSafeguard: 'Validate that dysautonomia is an objective autonomic reflex uncoupling that responds to consistent physical retraining.'
          },
          pharmacyBenchmark: {
            standardRetail: '$800 (unproven infusions)',
            genericBenchmark: '$0–$12 (lifestyle autonomic rehabilitation)',
            estimatedOutOfPocket: '$6.00 total'
          }
        }
      }
    ],
    2: [
      {
        id: 'sc09',
        time: '13:15 PM',
        patientName: 'Dr. James Thorne',
        ward: 'Specialist Handoff',
        chiefComplaint: 'SBAR Dictation Sync: Cardiology Handoff for E. Rostova',
        triageLevel: 'L2-ORANGE',
        triageColor: 'bg-orange-950 text-orange-300 border border-orange-500/50',
        parityAudit: 'Pass (Optimal)',
        carePlan: {
          diagnosis: 'Cross-Departmental SBAR Care Plan Commitment (Cardiology)',
          icd10: 'Z51.89',
          threeActs: {
            act1: 'Structured SBAR specialist handoff confirming non-ST-elevation stabilization, dual antiplatelet initiation, and outpatient stress MRI scheduling in 6 weeks.',
            act2: 'Bi-directional EHR note sync, medication reconciliation, and patient portal communication.',
            act3: 'Long-term multidisciplinary cardiology-primary care partnership.'
          },
          medSkepticAudit: {
            nullHypothesisH0: 'H0: Multimodal SBAR voice dictation handoff reduces medical communication errors compared to unstructured verbal handoffs.',
            pValue: 0.001,
            isFalsified: true,
            cochraneRoB: 'Low Risk of Bias',
            dcaNetBenefit: 0.190,
            unnecessaryProceduresAvoided: 32,
            skepticalVerdict: 'Attested under FDA 21 CFR Part 11; zero charting backlog maintained.'
          },
          antonovskyManageability: {
            immediateRemedy: 'Standardized SBAR digital checklist.',
            costEstimate: '$0 cost',
            remineralizationWaterPlan: 'Clinician hydration break with mineralized herbal tea.',
            iatrogenicPanicSafeguard: 'Smooth clinical transfer eliminates patient fear of lost medical records.'
          },
          pharmacyBenchmark: {
            standardRetail: '$0',
            genericBenchmark: '$0',
            estimatedOutOfPocket: '$0.00'
          }
        }
      },
      {
        id: 'sc10',
        time: '13:40 PM',
        patientName: 'Dr. Maya Lin',
        ward: 'Specialist Handoff',
        chiefComplaint: 'SBAR Dictation Sync: Nephrology Consult for M. Vance',
        triageLevel: 'L2-ORANGE',
        triageColor: 'bg-orange-950 text-orange-300 border border-orange-500/50',
        parityAudit: 'Pass (Optimal)',
        carePlan: {
          diagnosis: 'Cross-Departmental Nephrology Step-Down Protocol',
          icd10: 'Z51.89',
          threeActs: {
            act1: 'Confirms successful potassium normalization (K+ 4.6 mEq/L), safe urine output (>0.5 mL/kg/h), holds nephrotoxins, schedules 72-hour repeat panel.',
            act2: 'Outpatient nephrology surveillance and blood pressure recalibration.',
            act3: 'Lifelong renal reserve preservation.'
          },
          medSkepticAudit: {
            nullHypothesisH0: 'H0: Structured nephrology protocol handoff provides zero reduction in 30-day AKI readmission rates.',
            pValue: 0.004,
            isFalsified: true,
            cochraneRoB: 'Low Risk of Bias',
            dcaNetBenefit: 0.178,
            unnecessaryProceduresAvoided: 35,
            skepticalVerdict: 'Avoids premature dialysis referral; verifies complete electronic attestation.'
          },
          antonovskyManageability: {
            immediateRemedy: 'Clear discharge potassium guideline sheet.',
            costEstimate: '$0 cost',
            remineralizationWaterPlan: 'Safe filtered water hydration without electrolyte additives.',
            iatrogenicPanicSafeguard: 'Clear follow-up plan prevents discharge anxiety.'
          },
          pharmacyBenchmark: {
            standardRetail: '$0',
            genericBenchmark: '$0',
            estimatedOutOfPocket: '$0.00'
          }
        }
      }
    ],
    3: [
      {
        id: 'sc11',
        time: '14:20 PM',
        patientName: 'Lucia Ramirez (LEP)',
        ward: 'Multilingual Family',
        chiefComplaint: 'Pediatric asthma flare-up (Spanish Live Voice Sync)',
        triageLevel: 'L2-ORANGE',
        triageColor: 'bg-orange-950 text-orange-300 border border-orange-500/50',
        parityAudit: 'Pass (Optimal)',
        carePlan: {
          diagnosis: 'Moderate Persistent Pediatric Asthma with Allergic Phenotype',
          icd10: 'J45.41',
          threeActs: {
            act1: 'Low-dose inhaled corticosteroid (Fluticasone 44mcg 2 puffs BID via spacer) + Albuterol MDI PRN with bilingual Spanish/English asthma action plan.',
            act2: 'Home environmental trigger remediation (dust mite impermeable covers, eliminate aerosolized chemical scents, HEPA air filtration).',
            act3: 'Normal peak expiratory flow (PEF > 80% personal best), zero school absences, unhindered athletic participation.'
          },
          medSkepticAudit: {
            nullHypothesisH0: 'H0: Frequent oral systemic steroid bursts yield fewer adverse outcomes than daily controller ICS with spacer.',
            pValue: 0.001,
            isFalsified: true,
            cochraneRoB: 'Low Risk of Bias',
            dcaNetBenefit: 0.240,
            unnecessaryProceduresAvoided: 56,
            skepticalVerdict: 'ISMP posology verified (Fluticasone 44mcg, no naked decimals). Avoids 56 oral steroid bursts and pediatric growth stunting per 100 patients.'
          },
          antonovskyManageability: {
            immediateRemedy: 'Valved holding chamber spacer with pediatric mask and Spanish demonstration video.',
            costEstimate: '$16 one-time',
            remineralizationWaterPlan: 'Ensure clean drinking water hydration to liquefy airway mucus.',
            iatrogenicPanicSafeguard: 'Assure mother that asthma is fully controllable with a daily controller inhaler.'
          },
          pharmacyBenchmark: {
            standardRetail: '$180/mo',
            genericBenchmark: '$10/mo (Albuterol MDI generic)',
            estimatedOutOfPocket: '$10.00/mo'
          }
        }
      },
      {
        id: 'sc12',
        time: '15:10 PM',
        patientName: 'Chen Wei (LEP)',
        ward: 'Geriatric Consult',
        chiefComplaint: 'Frailty-index adjusted biomarker review (Mandarin Sync)',
        triageLevel: 'L3-YELLOW',
        triageColor: 'bg-amber-950 text-amber-300 border border-amber-500/50',
        parityAudit: 'Pass (Optimal)',
        carePlan: {
          diagnosis: 'Mild Cognitive Impairment & Geriatric Sleep Fragmentation with Polypharmacy',
          icd10: 'G31.84 / F51.01',
          threeActs: {
            act1: 'Deprescribe Diphenhydramine (Beers Criteria anticholinergic danger), initiate low-dose Melatonin (0.5mg 2 hours before bed), morning sunlight at 08:00 AM.',
            act2: 'Glymphatic clearance optimization via lateral sleep posture, Lion\'s Mane mushroom (1,000mg/d) + Citicoline (250mg/d), Tai Chi balance training 2x/wk.',
            act3: 'MoCA cognitive score stabilization (target >= 26/30), zero falls, sustained living independence.'
          },
          medSkepticAudit: {
            nullHypothesisH0: 'H0: Heavy sedative-hypnotic prescribing (Zolpidem) reduces fall risk compared to deprescribing and circadian hygiene.',
            pValue: 0.001,
            isFalsified: true,
            cochraneRoB: 'Low Risk of Bias',
            dcaNetBenefit: 0.215,
            unnecessaryProceduresAvoided: 46,
            skepticalVerdict: 'DCA proves deprescribing anticholinergics avoids 46 hip fractures and hospitalizations per 100 geriatric patients.'
          },
          antonovskyManageability: {
            immediateRemedy: 'Amber low-glare hallway nightlight and morning 15-minute garden pacing.',
            costEstimate: '$8 one-time',
            remineralizationWaterPlan: 'Sip warm boiled water (Mandarin traditional) to encourage gentle hydration without nocturia.',
            iatrogenicPanicSafeguard: 'Reassure family that mild memory lapses often stem from poor sleep and medication side effects rather than rapid dementia.'
          },
          pharmacyBenchmark: {
            standardRetail: '$145/mo',
            genericBenchmark: '$4/mo (deprescribing saves $48/mo in net drug spend)',
            estimatedOutOfPocket: '$4.00/mo'
          }
        }
      }
    ],
    4: [
      {
        id: 'sc13',
        time: '17:15 PM',
        patientName: 'Hannah Abbott',
        ward: 'Final Sign-off',
        chiefComplaint: 'Routine Annual Longevity & Horvath Clock Review',
        triageLevel: 'L4-GREEN',
        triageColor: 'bg-emerald-950 text-emerald-300 border border-emerald-500/50',
        parityAudit: 'Pass (Optimal)',
        carePlan: {
          diagnosis: 'Healthy Adult Wellness & Seven Generations Epigenetic Healthspan Stewardship',
          icd10: 'Z00.00',
          threeActs: {
            act1: 'Comprehensive preventive metabolic panel, VO2 max treadmill assessment, living water mineral balancing (HUC-8 watershed alignment).',
            act2: 'Resistance training progressive overload (3x/wk), sauna hyperthermic conditioning (20 min at 70°C 2x/wk), polyphenol-rich Mediterranean nutrition.',
            act3: 'Annual biological age methylation check, sustained healthspan extension, community intergenerational mentoring.'
          },
          medSkepticAudit: {
            nullHypothesisH0: 'H0: Commercial $10,000 unverified peptide infusions extend biological healthspan over verified exercise, sleep, and metabolic optimization.',
            pValue: 0.001,
            isFalsified: true,
            cochraneRoB: 'High Risk of Bias',
            dcaNetBenefit: 0.230,
            unnecessaryProceduresAvoided: 50,
            skepticalVerdict: 'Refutes predatory longevity hype. Replicated lifestyle and zone-2 cardio provide superior epigenetic resilience.'
          },
          antonovskyManageability: {
            immediateRemedy: 'Food-grade magnesium bicarbonate living water remineralization concentrate.',
            costEstimate: '$12/month',
            remineralizationWaterPlan: '75 mg/L CaCO3 equivalent remineralized drinking water for cellular mitochondrial vitality.',
            iatrogenicPanicSafeguard: 'Uphold health optimism: longevity is nurtured through accessible daily rhythms.'
          },
          pharmacyBenchmark: {
            standardRetail: '$500+ (anti-aging clinics)',
            genericBenchmark: '$0 (evidence-based lifestyle)',
            estimatedOutOfPocket: '$0.00'
          }
        }
      },
      {
        id: 'sc14',
        time: '18:00 PM',
        patientName: 'Shift Summary',
        ward: 'EHR Departure',
        chiefComplaint: '28/28 Charts Signed. Zero Pajama Time. Departure 18:15 PM',
        triageLevel: 'L4-GREEN',
        triageColor: 'bg-emerald-950 text-emerald-300 border border-emerald-500/50',
        parityAudit: 'Pass (Optimal)',
        carePlan: {
          diagnosis: 'Clinician Burnout Shielded & Complete Shift Reconciliation',
          icd10: 'Z73.0',
          threeActs: {
            act1: 'Complete 28/28 encounters chart reconciliation, automated FHIR R4 Bundle commit, zero home documentation debt.',
            act2: 'Polyvagal somatic restoration, 100% boundary between hospital and home life.',
            act3: 'Long-term sustainable medical practice and career fulfillment.'
          },
          medSkepticAudit: {
            nullHypothesisH0: 'H0: Automated non-device clinical intelligence provides zero reduction in physician after-hours EHR documentation time.',
            pValue: 0.001,
            isFalsified: true,
            cochraneRoB: 'Low Risk of Bias',
            dcaNetBenefit: 0.250,
            unnecessaryProceduresAvoided: 60,
            skepticalVerdict: 'FDA 21 CFR Part 11 compliant digital attestation completed with 0 errors.'
          },
          antonovskyManageability: {
            immediateRemedy: 'Immediate departure from hospital: 18:15 PM sharp.',
            costEstimate: '$0 cost',
            remineralizationWaterPlan: 'Evening hydration and mindful transition.',
            iatrogenicPanicSafeguard: 'Zero lingering anxiety: all patients have complete, active, evidence-grounded care plans.'
          },
          pharmacyBenchmark: {
            standardRetail: '$0',
            genericBenchmark: '$0',
            estimatedOutOfPocket: '$0.00'
          }
        }
      }
    ]
  };

  activeCases = computed(() => {
    return this.patientCases[this.currentPhaseIndex()] || [];
  });

  openCarePlan(c: IShiftPatientCase): void {
    this.selectedCase.set(c);
  }

  loadCaseIntoPatientState(c: IShiftPatientCase): void {
    const patientPayload = {
      id: c.id,
      name: c.patientName,
      age: 45,
      gender: 'Female',
      reasonForVisit: c.chiefComplaint,
      patientGoals: `Manage ${c.carePlan?.diagnosis || c.chiefComplaint} with Three Acts evidence-grounded care plan.`,
      vitals: {
        bp: '124/82',
        hr: '76',
        temp: '98.6',
        spO2: '98%',
        cgmGlucoseMgDl: '110',
        weight: '68',
        height: '170'
      },
      clinicalNotes: [
        {
          id: `cn-${c.id}`,
          text: `12-Hour Shift Encounter (${c.time} - ${c.ward}): ${c.chiefComplaint}. Assessment: ${c.carePlan?.diagnosis || ''} (ICD-10: ${c.carePlan?.icd10 || ''}). Three Acts Care Plan initiated.`,
          date: new Date().toISOString()
        }
      ]
    };

    this.patientState.loadState(patientPayload);
    this.patientState.reasonForVisit.set(c.chiefComplaint);
    if (c.carePlan) {
      this.patientState.activeCarePlanNotes.set(
        `Three Acts Care Plan: ${c.carePlan.diagnosis} (ICD-10: ${c.carePlan.icd10}) | Act I: ${c.carePlan.threeActs.act1} | Act II: ${c.carePlan.threeActs.act2} | Act III: ${c.carePlan.threeActs.act3}`
      );
    }
    this.statusNotification.set(`✓ Patient "${c.patientName}" loaded into active clinical state & 3D anatomy!`);
  }

  exportCaseFhirBundle(c: IShiftPatientCase): void {
    const fhirBundle = {
      resourceType: 'Bundle',
      type: 'collection',
      id: `shift-careplan-${c.id}`,
      timestamp: new Date().toISOString(),
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: c.id,
            name: [{ text: c.patientName }],
            active: true
          }
        },
        {
          resource: {
            resourceType: 'Condition',
            id: `cond-${c.id}`,
            subject: { reference: `Patient/${c.id}` },
            code: {
              coding: [
                {
                  system: 'http://hl7.org/fhir/sid/icd-10-cm',
                  code: c.carePlan?.icd10 || 'Z00.00',
                  display: c.carePlan?.diagnosis || c.chiefComplaint
                }
              ]
            }
          }
        },
        {
          resource: {
            resourceType: 'CarePlan',
            id: `plan-${c.id}`,
            status: 'active',
            intent: 'plan',
            subject: { reference: `Patient/${c.id}` },
            title: `Three Acts Care Plan: ${c.carePlan?.diagnosis || c.chiefComplaint}`,
            description: `Act I: ${c.carePlan?.threeActs.act1} | Act II: ${c.carePlan?.threeActs.act2} | Act III: ${c.carePlan?.threeActs.act3}`,
            extension: [
              {
                url: 'https://pocketgull.app/fhir/StructureDefinition/med-skeptic-audit',
                valueString: c.carePlan?.medSkepticAudit.skepticalVerdict || ''
              },
              {
                url: 'https://pocketgull.app/fhir/StructureDefinition/antonovsky-manageability',
                valueString: c.carePlan?.antonovskyManageability.immediateRemedy || ''
              }
            ]
          }
        }
      ]
    };

    if (typeof document !== 'undefined') {
      const blob = new Blob([JSON.stringify(fhirBundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FHIR-CarePlan-${c.id}-${c.patientName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.statusNotification.set(`✓ Downloaded FHIR R4 Bundle for ${c.patientName}`);
    }
  }

  runFullShiftSimulation(): void {
    this.stopAutoPlay();
    this.currentPhaseIndex.set(0);
    this.statusNotification.set('🚀 Initiating Full 12-Hour Simulation across all 5 phases & 28 patients...');

    let phase = 0;
    const interval = setInterval(() => {
      phase++;
      if (phase < this.phases.length) {
        this.currentPhaseIndex.set(phase);
        this.statusNotification.set(`⚡ Progressing Shift: Phase ${phase + 1} (${this.phases[phase].timeRange}) — Care plans committed.`);
      } else {
        clearInterval(interval);
        this.statusNotification.set('🎉 12-Hour Shift Simulation Complete! 28/28 encounters handled, 14 care plans active, zero pajama time!');
      }
    }, 1200);
  }

  stepNextPhase() {
    if (this.currentPhaseIndex() < this.phases.length - 1) {
      this.currentPhaseIndex.set(this.currentPhaseIndex() + 1);
    } else {
      this.stopAutoPlay();
    }
  }

  toggleAutoPlay() {
    if (this.isAutoPlaying()) {
      this.stopAutoPlay();
    } else {
      this.startAutoPlay();
    }
  }

  startAutoPlay() {
    this.isAutoPlaying.set(true);
    if (this.currentPhaseIndex() === this.phases.length - 1) {
      this.currentPhaseIndex.set(0);
    }

    this.autoPlayTimer = setInterval(() => {
      if (this.currentPhaseIndex() < this.phases.length - 1) {
        this.currentPhaseIndex.set(this.currentPhaseIndex() + 1);
      } else {
        this.stopAutoPlay();
      }
    }, 2800);
  }

  stopAutoPlay() {
    this.isAutoPlaying.set(false);
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  resetShift() {
    this.stopAutoPlay();
    this.currentPhaseIndex.set(0);
    this.statusNotification.set(null);
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }
}
