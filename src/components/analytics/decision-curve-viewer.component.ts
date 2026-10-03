/**
 * @file decision-curve-viewer.component.ts
 * @description Interactive Multi-Faceted Asymmetry & Decision Curve Analysis (DCA) HUD.
 * 
 * Provides interactive visual analytics for:
 * 1. Vickers & Elkin Decision Curve Analysis (Model Net Benefit vs Treat All vs Treat None).
 * 2. Information-Theoretic KL Mode-Covering vs Mode-Seeking Distribution Inspector.
 * 3. Contralateral Bilateral Kinetic Load Asymmetry Delta.
 * 4. Personalized Prospect Theory Subjective Utility Curves.
 */

import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DecisionCurveAnalysisService, IDcaSummary } from '../../services/decision-curve-analysis.service';
import { KlDivergenceStrategyService, KlRoutingMode } from '../../services/kl-divergence-strategy.service';
import { ContralateralAsymmetryService, IBilateralAsymmetryReport } from '../../services/contralateral-asymmetry.service';
import { ProspectTheoryUtilityService, PatientMobilityArchetype } from '../../services/prospect-theory-utility.service';

@Component({
  selector: 'app-decision-curve-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-zinc-950 text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Decision Theory & Asymmetry HUD
            </span>
            <span class="text-xs text-zinc-400 font-mono">Vickers & Elkin DCA</span>
          </div>
          <h2 class="text-xl font-bold mt-1 tracking-tight text-white flex items-center gap-2">
            <span>⚖️</span> Clinical Net Utility & Multi-Faceted Asymmetry Engine
          </h2>
        </div>
        
        <!-- Active View Selector -->
        <div class="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
          <button 
            (click)="activeTab.set('dca')"
            [class.bg-teal-600]="activeTab() === 'dca'"
            [class.text-white]="activeTab() === 'dca'"
            class="px-3 py-1.5 text-xs font-medium rounded-md text-zinc-400 hover:text-white transition-all">
            DCA Net Benefit
          </button>
          <button 
            (click)="activeTab.set('kl')"
            [class.bg-teal-600]="activeTab() === 'kl'"
            [class.text-white]="activeTab() === 'kl'"
            class="px-3 py-1.5 text-xs font-medium rounded-md text-zinc-400 hover:text-white transition-all">
            KL Entropy Routing
          </button>
          <button 
            (click)="activeTab.set('bilateral')"
            [class.bg-teal-600]="activeTab() === 'bilateral'"
            [class.text-white]="activeTab() === 'bilateral'"
            class="px-3 py-1.5 text-xs font-medium rounded-md text-zinc-400 hover:text-white transition-all">
            Bilateral Asymmetry
          </button>
          <button 
            (click)="activeTab.set('prospect')"
            [class.bg-teal-600]="activeTab() === 'prospect'"
            [class.text-white]="activeTab() === 'prospect'"
            class="px-3 py-1.5 text-xs font-medium rounded-md text-zinc-400 hover:text-white transition-all">
            Prospect Utility
          </button>
        </div>
      </div>

      <!-- Tab 1: DCA Net Benefit Curve -->
      @if (activeTab() === 'dca') {
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 bg-zinc-900/70 rounded-xl border border-zinc-800">
              <span class="text-xs text-zinc-400">Prevalence Baseline</span>
              <div class="text-2xl font-bold text-teal-400 font-mono mt-1">
                {{ (dcaData().prevalence * 100).toFixed(1) }}%
              </div>
              <p class="text-xs text-zinc-500 mt-1">Observed clinical cohort prior</p>
            </div>
            <div class="p-4 bg-zinc-900/70 rounded-xl border border-zinc-800">
              <span class="text-xs text-zinc-400">Optimal Operating Threshold</span>
              <div class="text-2xl font-bold text-amber-400 font-mono mt-1">
                {{ (dcaData().optimalThreshold * 100).toFixed(0) }}%
              </div>
              <p class="text-xs text-zinc-500 mt-1">Max clinical utility cutoff (p_t)</p>
            </div>
            <div class="p-4 bg-zinc-900/70 rounded-xl border border-zinc-800">
              <span class="text-xs text-zinc-400">Max Net Benefit Gain</span>
              <div class="text-2xl font-bold text-emerald-400 font-mono mt-1">
                +{{ dcaData().maxNetBenefit.toFixed(3) }}
              </div>
              <p class="text-xs text-zinc-500 mt-1">Over treat-all default policy</p>
            </div>
          </div>

          <!-- SVG Decision Curve -->
          <div class="p-4 bg-zinc-900/90 rounded-xl border border-zinc-800">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Vickers & Elkin Net Benefit vs. Threshold Probability (p_t)
              </h4>
              <div class="flex items-center gap-4 text-xs">
                <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-teal-400 inline-block"></span> Model</span>
                <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-zinc-500 border-dashed inline-block"></span> Treat All</span>
                <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-rose-500 inline-block"></span> Treat None (0)</span>
              </div>
            </div>

            <div class="relative h-48 w-full">
              <svg class="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                <!-- Grid Lines -->
                <line x1="40" y1="20" x2="480" y2="20" stroke="#27272a" stroke-width="1" />
                <line x1="40" y1="80" x2="480" y2="80" stroke="#27272a" stroke-width="1" />
                <line x1="40" y1="140" x2="480" y2="140" stroke="#3f3f46" stroke-width="1.5" />
                
                <!-- Zero Axis Label -->
                <text x="10" y="144" fill="#71717a" font-size="10" font-family="monospace">0.0</text>
                <text x="10" y="84" fill="#71717a" font-size="10" font-family="monospace">0.2</text>
                <text x="10" y="24" fill="#71717a" font-size="10" font-family="monospace">0.4</text>

                <!-- Model Net Benefit Polyline -->
                <polyline 
                  [attr.points]="modelPolyline()" 
                  fill="none" 
                  stroke="#2dd4bf" 
                  stroke-width="2.5" 
                  stroke-linecap="round" />

                <!-- Treat All Polyline -->
                <polyline 
                  [attr.points]="treatAllPolyline()" 
                  fill="none" 
                  stroke="#71717a" 
                  stroke-dasharray="4" 
                  stroke-width="1.5" />

                <!-- Treat None Zero Line -->
                <line x1="40" y1="140" x2="480" y2="140" stroke="#f43f5e" stroke-width="1.5" />
              </svg>
            </div>
            <div class="mt-2 text-xs text-zinc-400 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800">
              <span class="text-teal-300 font-medium">Clinical Verdict:</span> {{ dcaData().clinicalVerdict }}
            </div>
          </div>
        </div>
      }

      <!-- Tab 2: KL Divergence Mode Routing -->
      @if (activeTab() === 'kl') {
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <span class="text-xs text-zinc-400">Target Strategy:</span>
            <button 
              (click)="klMode.set('forward_mode_covering')"
              [class.bg-indigo-600]="klMode() === 'forward_mode_covering'"
              class="px-3 py-1 text-xs rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700">
              Forward KL (Mode-Covering)
            </button>
            <button 
              (click)="klMode.set('reverse_mode_seeking')"
              [class.bg-indigo-600]="klMode() === 'reverse_mode_seeking'"
              class="px-3 py-1 text-xs rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700">
              Reverse KL (Mode-Seeking)
            </button>
          </div>

          <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-3">
            <div class="text-xs text-zinc-300">
              <span class="font-bold text-indigo-400">Current Regime:</span> {{ klResult().rationale }}
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <span class="text-xs text-zinc-500">Forward D_KL</span>
                <div class="text-lg font-mono font-bold text-indigo-300">{{ klResult().forwardKlDivergence.toFixed(3) }} bits</div>
              </div>
              <div class="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <span class="text-xs text-zinc-500">Reverse D_KL</span>
                <div class="text-lg font-mono font-bold text-indigo-300">{{ klResult().reverseKlDivergence.toFixed(3) }} bits</div>
              </div>
              <div class="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <span class="text-xs text-zinc-500">Jensen-Shannon Dist</span>
                <div class="text-lg font-mono font-bold text-indigo-300">{{ klResult().jensenShannonDistance.toFixed(3) }}</div>
              </div>
              <div class="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <span class="text-xs text-zinc-500">Shannon Entropy</span>
                <div class="text-lg font-mono font-bold text-indigo-300">{{ klResult().entropyBits.toFixed(3) }} bits</div>
              </div>
            </div>

            <div class="space-y-2 mt-3">
              <h5 class="text-xs font-semibold text-zinc-300">Prioritized Differential Candidates:</h5>
              @for (c of klResult().prioritizedDifferential; track c.conditionName) {
                <div class="flex items-center justify-between p-2.5 bg-zinc-950/80 rounded-lg border border-zinc-800/80">
                  <div class="flex items-center gap-2">
                    <span [class.text-rose-400]="c.clinicalAcuity === 'STAT_EMERGENCY'"
                          [class.text-amber-400]="c.clinicalAcuity === 'URGENT'"
                          [class.text-zinc-400]="c.clinicalAcuity === 'ROUTINE'"
                          class="text-xs font-mono font-bold">
                      [{{ c.clinicalAcuity }}]
                    </span>
                    <span class="text-sm font-medium text-white">{{ c.conditionName }}</span>
                  </div>
                  <span class="text-sm font-mono text-teal-400 font-bold">
                    {{ (c.probability * 100).toFixed(1) }}%
                  </span>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Tab 3: Bilateral Kinetic Asymmetry -->
      @if (activeTab() === 'bilateral') {
        <div class="space-y-4">
          <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-xs text-zinc-500">Contralateral Balance State</span>
                <h4 class="text-lg font-bold text-teal-300">{{ bilateralReport().dominantSide }}</h4>
              </div>
              <div class="text-right">
                <span class="text-xs text-zinc-500">Kinetic Overload Index</span>
                <div class="text-lg font-mono font-bold text-amber-400">
                  {{ bilateralReport().overallKineticAsymmetryIndex.toFixed(3) }}
                </div>
              </div>
            </div>

            <div class="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-zinc-300">
              <span class="text-amber-300 font-semibold">Biomechanical Directive:</span> {{ bilateralReport().clinicalRecommendation }}
            </div>
          </div>
        </div>
      }

      <!-- Tab 4: Prospect Theory Utility -->
      @if (activeTab() === 'prospect') {
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <span class="text-xs text-zinc-400">Patient Archetype:</span>
            <button 
              (click)="selectedArchetype.set('elite_athlete')"
              [class.bg-teal-600]="selectedArchetype() === 'elite_athlete'"
              class="px-3 py-1 text-xs rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700">
              Elite Athlete
            </button>
            <button 
              (click)="selectedArchetype.set('sedentary_professional')"
              [class.bg-teal-600]="selectedArchetype() === 'sedentary_professional'"
              class="px-3 py-1 text-xs rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700">
              Sedentary Professional
            </button>
          </div>

          <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-3">
            <div class="grid grid-cols-3 gap-3">
              <div class="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <span class="text-xs text-zinc-500">Loss Aversion (lambda)</span>
                <div class="text-lg font-mono font-bold text-rose-400">{{ prospectProfile().lossAversionLambda }}x</div>
              </div>
              <div class="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <span class="text-xs text-zinc-500">Subjective Gain Value</span>
                <div class="text-lg font-mono font-bold text-teal-400">+{{ prospectEval().gainComponent.toFixed(2) }}</div>
              </div>
              <div class="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <span class="text-xs text-zinc-500">Subjective Loss Cost</span>
                <div class="text-lg font-mono font-bold text-rose-400">-{{ prospectEval().lossComponent.toFixed(2) }}</div>
              </div>
            </div>

            <div class="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-zinc-300">
              <span class="text-teal-300 font-semibold">Triage Guidance:</span> {{ prospectEval().riskRecommendation }}
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DecisionCurveViewerComponent {
  private readonly dcaService = inject(DecisionCurveAnalysisService);
  private readonly klService = inject(KlDivergenceStrategyService);
  private readonly contraService = inject(ContralateralAsymmetryService);
  private readonly prospectService = inject(ProspectTheoryUtilityService);

  public readonly activeTab = signal<'dca' | 'kl' | 'bilateral' | 'prospect'>('dca');
  public readonly klMode = signal<KlRoutingMode>('forward_mode_covering');
  public readonly selectedArchetype = signal<PatientMobilityArchetype>('elite_athlete');

  // Simulated cohort for interactive DCA
  private readonly mockYTrue = [1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0];
  private readonly mockYPred = [0.92, 0.85, 0.78, 0.12, 0.08, 0.25, 0.88, 0.04, 0.15, 0.09, 0.81, 0.05, 0.11, 0.95, 0.03, 0.20, 0.72, 0.02, 0.08, 0.04];

  public readonly dcaData = computed<IDcaSummary>(() => {
    return this.dcaService.computeDecisionCurve(this.mockYTrue, this.mockYPred, 40);
  });

  public readonly modelPolyline = computed(() => {
    const pts = this.dcaData().curvePoints;
    return pts.map(p => {
      const x = 40 + p.thresholdProbability * 440;
      // y-range: [ -0.1, 0.5 ] mapped to [180, 0]
      const yNorm = (p.modelNetBenefit - (-0.1)) / 0.6;
      const y = 160 - Math.max(0, Math.min(1, yNorm)) * 140;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  });

  public readonly treatAllPolyline = computed(() => {
    const pts = this.dcaData().curvePoints;
    return pts.map(p => {
      const x = 40 + p.thresholdProbability * 440;
      const yNorm = (p.treatAllNetBenefit - (-0.1)) / 0.6;
      const y = 160 - Math.max(0, Math.min(1, yNorm)) * 140;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  });

  public readonly klResult = computed(() => {
    const candidates = [
      { conditionName: 'Acute ACL Rupture', probability: 0.65, clinicalAcuity: 'URGENT' as const },
      { conditionName: 'Medial Meniscal Ramp Tear', probability: 0.22, clinicalAcuity: 'URGENT' as const },
      { conditionName: 'Occult Tibial Plateau Micro-Fracture', probability: 0.08, clinicalAcuity: 'STAT_EMERGENCY' as const },
      { conditionName: 'Post-Traumatic Mild Effusion', probability: 0.05, clinicalAcuity: 'ROUTINE' as const },
    ];
    return this.klService.routeDifferentialStrategy(candidates, this.klMode());
  });

  public readonly bilateralReport = computed<IBilateralAsymmetryReport>(() => {
    const left = { medialJointSpaceMm: 2.1, lateralJointSpaceMm: 4.8, meniscalExtrusionMm: 3.4, cartilageThicknessMm: 1.6, subchondralBmlScore: 3 };
    const right = { medialJointSpaceMm: 4.6, lateralJointSpaceMm: 4.7, meniscalExtrusionMm: 0.4, cartilageThicknessMm: 3.4, subchondralBmlScore: 0 };
    return this.contraService.evaluateBilateralKnees(left, right);
  });

  public readonly prospectProfile = computed(() => this.prospectService.getProfile(this.selectedArchetype()));
  public readonly prospectEval = computed(() => this.prospectService.evaluateSubjectiveValue(1.0, 1.0, this.selectedArchetype()));
}
