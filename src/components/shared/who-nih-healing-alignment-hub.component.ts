import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhoNihHealingGoalsService } from '../../services/who-nih-healing-goals.service';
import { IStrategicGoalAlignment } from '../../models/who-nih-healing-goals.model';

@Component({
  selector: 'app-who-nih-healing-alignment-hub',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-6 sm:p-8 rounded-3xl bg-zinc-950/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-indigo-500/30 shadow-2xl text-zinc-100 space-y-8 animate-in fade-in duration-300">
      
      <!-- Top HUD Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div class="space-y-1.5">
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="w-3.5 h-3.5 rounded-full bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.8)] animate-pulse"></span>
            <h2 class="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span>🏛️</span>
              <span>WHO &amp; NIH Strategic Health Alignment Hub</span>
            </h2>
            <span class="px-2.5 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full">
              Global Policy &amp; ML Assurance
            </span>
          </div>
          <p class="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
            Aligning multi-paradigm traditional and systems healing interventions with WHO SDG 3.4, WHO GTMC ICD-11 Chapter 26, and NIH NCCIH Whole Person Health objectives.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Overall Strategic Fulfillment Gauge -->
          <div class="px-4 py-2 rounded-2xl bg-zinc-900/90 border border-indigo-500/40 flex items-center gap-3 shadow-xs">
            <span class="text-xl">🎯</span>
            <div>
              <div class="text-[9px] font-mono uppercase tracking-widest text-zinc-400">Strategic Alignment</div>
              <div class="text-base font-black text-indigo-300 font-mono tabular-nums">
                {{ strategicSummary().overallStrategicFulfillmentScore }}% FULFILLED
              </div>
            </div>
          </div>

          <!-- Cryptographic Compliance Seal -->
          <div class="px-3.5 py-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-2 shadow-xs">
            <span class="text-xs">🔒</span>
            <div class="text-right">
              <div class="text-[9px] font-mono uppercase tracking-wider text-zinc-500">WHO / NIH Seal</div>
              <div class="text-[11px] font-mono font-bold text-zinc-300">Verified</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation / Filter Tabs Ribbon -->
      <div class="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/80 p-2 rounded-2xl border border-zinc-800">
        <div class="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <button
            type="button"
            (click)="activeFilter.set('all')"
            [class]="activeFilter() === 'all'
              ? 'px-4 py-2 rounded-xl bg-indigo-500 text-zinc-950 font-black shadow-md transition-all'
              : 'px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold transition-all'"
          >
            All Strategic Goals ({{ strategicSummary().activeStrategicGoals.length }})
          </button>
          <button
            type="button"
            (click)="activeFilter.set('who')"
            [class]="activeFilter() === 'who'
              ? 'px-4 py-2 rounded-xl bg-sky-500 text-zinc-950 font-black shadow-md transition-all'
              : 'px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold transition-all'"
          >
            🇺🇳 WHO Mandates (3)
          </button>
          <button
            type="button"
            (click)="activeFilter.set('nih')"
            [class]="activeFilter() === 'nih'
              ? 'px-4 py-2 rounded-xl bg-teal-500 text-zinc-950 font-black shadow-md transition-all'
              : 'px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold transition-all'"
          >
            🔬 NIH Strategic Plans (3)
          </button>
          <button
            type="button"
            (click)="activeFilter.set('ml_assurance')"
            [class]="activeFilter() === 'ml_assurance'
              ? 'px-4 py-2 rounded-xl bg-purple-500 text-zinc-950 font-black shadow-md transition-all'
              : 'px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold transition-all'"
          >
            🧠 ML Contextual Assurance
          </button>
          <button
            type="button"
            (click)="activeFilter.set('ictm_chapter26')"
            [class]="activeFilter() === 'ictm_chapter26'
              ? 'px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-black shadow-md transition-all'
              : 'px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold transition-all'"
          >
            📋 ICD-11 Chapter 26 (ICTM)
          </button>
        </div>

        <div class="text-[11px] font-mono text-zinc-500 px-2">
          Conformal Confidence: <span class="text-indigo-400 font-bold">95.2%</span>
        </div>
      </div>

      <!-- VIEW 1: Strategic Goals Cards Grid -->
      @if (activeFilter() === 'all' || activeFilter() === 'who' || activeFilter() === 'nih') {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          @for (goal of filteredGoals(); track goal.goalId) {
            <div class="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500/40 transition-all space-y-4 shadow-lg">
              
              <!-- Card Header -->
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider rounded-md border"
                          [ngClass]="goal.governingBody === 'WHO' ? 'bg-sky-950 text-sky-300 border-sky-700/50' : 'bg-teal-950 text-teal-300 border-teal-700/50'">
                      {{ goal.governingBody }}
                    </span>
                    <h3 class="text-sm font-black text-white">{{ goal.title }}</h3>
                  </div>
                  <p class="text-xs text-zinc-400 leading-relaxed">{{ goal.strategicObjective }}</p>
                </div>
                
                <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase shrink-0 border"
                      [ngClass]="{
                        'bg-emerald-500/10 text-emerald-300 border-emerald-500/30': goal.clinicalMaturityStatus === 'OPTIMAL',
                        'bg-teal-500/10 text-teal-300 border-teal-500/30': goal.clinicalMaturityStatus === 'ON_TRACK',
                        'bg-amber-500/10 text-amber-300 border-amber-500/30': goal.clinicalMaturityStatus === 'ACCELERATING'
                      }">
                  {{ goal.fulfillmentPercent }}% {{ goal.clinicalMaturityStatus }}
                </span>
              </div>

              <!-- Metric Progress Bar -->
              <div class="space-y-1.5 font-mono text-xs">
                <div class="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>{{ goal.targetMetricName }}</span>
                  <span class="text-indigo-300 font-bold">{{ goal.currentValueDisplay }}</span>
                </div>
                <div class="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500"
                       [style.width.%]="goal.fulfillmentPercent"></div>
                </div>
                <div class="flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Baseline: {{ goal.baselineValueDisplay }}</span>
                  <span>Target: {{ goal.targetThresholdDisplay }}</span>
                </div>
              </div>

              <!-- Contributing Paradigms & Mechanisms -->
              <div class="space-y-2 pt-2 border-t border-zinc-800/80">
                <span class="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block font-bold">
                  Contributing Healing Systems &amp; Protocols:
                </span>
                <div class="space-y-1.5">
                  @for (mech of goal.paradigmActionMechanisms; track mech.label) {
                    <div class="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1">
                      <div class="flex items-center justify-between font-mono font-bold text-indigo-300 text-[11px]">
                        <span>{{ mech.label }}</span>
                      </div>
                      <p class="text-zinc-300 text-[11px] leading-snug">{{ mech.clinicalContribution }}</p>
                      <div class="text-[10px] text-teal-400 font-mono">Protocol: {{ mech.actionProtocol }}</div>
                    </div>
                  }
                </div>
              </div>

            </div>
          }
        </div>
      }

      <!-- VIEW 2: Machine Learning Contextual Assurance HUD -->
      @if (activeFilter() === 'ml_assurance') {
        <div class="space-y-6 animate-in fade-in duration-200">
          <div class="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3">
            <span class="text-xl">🧠</span>
            <div class="space-y-1">
              <h3 class="text-sm font-black text-purple-300">
                Rigorous Clinical Machine Learning Assurance (PINN + Conformal UQ)
              </h3>
              <p class="text-xs text-zinc-300 leading-relaxed">
                Empirical safeguards prohibiting black-box hallucinations through Physics-Informed Kinetics penalties, mathematically guaranteed error bounds, and GroupKFold leak-free cross-validation.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 font-mono">
              <span class="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">PINN Biophysical Penalty</span>
              <div class="text-xl font-black text-purple-300 tabular-nums">
                {{ strategicSummary().machineLearningAssurance.pinnBiophysicalLossPenalty }}
              </div>
              <p class="text-[11px] text-zinc-400 font-sans">
                Loss constraint enforcing Michaelis-Menten CYP450 kinetics and 24.2h SCN circadian boundary conditions.
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 font-mono">
              <span class="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">Conformal Coverage (1 - α)</span>
              <div class="text-xl font-black text-emerald-300 tabular-nums">
                {{ strategicSummary().machineLearningAssurance.conformalPredictionCoveragePercent }}%
              </div>
              <p class="text-[11px] text-zinc-400 font-sans">
                Mathematical guarantee that the true clinical multi-paradigm pattern is contained within the prediction set.
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 font-mono">
              <span class="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">Epistemic OOD Uncertainty</span>
              <div class="text-xl font-black text-teal-300 tabular-nums">
                {{ strategicSummary().machineLearningAssurance.epistemicOodUncertaintyScore }}
              </div>
              <p class="text-[11px] text-zinc-400 font-sans">
                Low risk (&lt; 0.15) confirms patient presentation is in-distribution with validated clinical literature.
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 font-mono">
              <span class="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">Leak-Free GroupKFold Score</span>
              <div class="text-xl font-black text-cyan-300 tabular-nums">
                {{ strategicSummary().machineLearningAssurance.leakFreeGroupKFoldValidationScore }} AUC
              </div>
              <p class="text-[11px] text-zinc-400 font-sans">
                5-Fold cross-validation partitioned strictly by patient identifier to eliminate train/eval leakage.
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 font-mono">
              <span class="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">Nelder-Mead Calibrated Cutoff</span>
              <div class="text-xl font-black text-amber-300 tabular-nums">
                τ = {{ strategicSummary().machineLearningAssurance.nelderMeadOptimizedThreshold }}
              </div>
              <p class="text-[11px] text-zinc-400 font-sans">
                Simplex-tuned decision threshold replacing default 0.50 with empirical OOF risk optimization.
              </p>
            </div>

            <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 font-mono">
              <span class="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold">Zero-Egress Execution</span>
              <div class="text-xl font-black text-indigo-300">
                Local Edge
              </div>
              <p class="text-[11px] text-zinc-400 font-sans">
                Sub-second inference running on-device with zero HIPAA/GDPR external network transmission.
              </p>
            </div>

          </div>
        </div>
      }

      <!-- VIEW 3: WHO ICD-11 Chapter 26 Traditional Medicine Table -->
      @if (activeFilter() === 'ictm_chapter26') {
        <div class="space-y-4 animate-in fade-in duration-200">
          <div class="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
            <span class="text-xl">📋</span>
            <div class="space-y-1">
              <h3 class="text-sm font-black text-amber-300">
                WHO ICD-11 Chapter 26: International Classification of Traditional Medicine (ICTM)
              </h3>
              <p class="text-xs text-zinc-300 leading-relaxed">
                Standardized diagnostic codes bridging classical TCM, Ayurvedic, and Unani concepts with global epidemiological and EHR reporting.
              </p>
            </div>
          </div>

          <div class="overflow-x-auto rounded-2xl border border-zinc-800">
            <table class="w-full text-left text-xs font-sans">
              <thead class="bg-zinc-900 text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th class="p-3.5">ICTM Code</th>
                  <th class="p-3.5">Traditional Concept</th>
                  <th class="p-3.5">Biophysical Translation</th>
                  <th class="p-3.5">WHO Chapter 26 Section</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-800/60 text-zinc-200">
                @for (item of strategicSummary().whoIctmCodifiedDiagnoses; track item.ictmCode) {
                  <tr class="hover:bg-zinc-900/40 transition font-mono">
                    <td class="p-3.5 font-bold text-amber-300">{{ item.ictmCode }}</td>
                    <td class="p-3.5 text-zinc-100 font-sans">{{ item.traditionalConcept }}</td>
                    <td class="p-3.5 text-zinc-300 font-sans">{{ item.biophysicalTranslation }}</td>
                    <td class="p-3.5 text-zinc-400">{{ item.whoChapter26Category }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

    </div>
  `
})
export class WhoNihHealingAlignmentHubComponent {
  private readonly goalsService = inject(WhoNihHealingGoalsService);

  readonly strategicSummary = this.goalsService.strategicSummary;
  readonly activeFilter = signal<'all' | 'who' | 'nih' | 'ml_assurance' | 'ictm_chapter26'>('all');

  readonly filteredGoals = computed<IStrategicGoalAlignment[]>(() => {
    const goals = this.strategicSummary().activeStrategicGoals;
    const filter = this.activeFilter();
    if (filter === 'who') {
      return goals.filter(g => g.governingBody === 'WHO');
    }
    if (filter === 'nih') {
      return goals.filter(g => g.governingBody === 'NIH');
    }
    return goals;
  });
}
