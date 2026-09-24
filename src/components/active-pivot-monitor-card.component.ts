import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivePivotMonitorService, IActivePivotTrigger, IWhatIfSimulationResult } from '../services/active-pivot-monitor.service';

@Component({
  selector: 'app-active-pivot-monitor-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-teal-500/30 shadow-2xl space-y-6 animate-in fade-in duration-300">
      
      <!-- Header HUD -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-xl shadow-xs">
            ⚡
          </div>
          <div>
            <h3 class="text-base font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Pivot &amp; Pulse: Real-Time Cybernetic Telemetry
              <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-teal-500/10 text-teal-700 dark:text-teal-300 rounded-full border border-teal-500/30">
                FDA Part 11 &amp; HIPAA Sealed
              </span>
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              Multi-paradigm Tri-Pulse biological rhythm, living threshold breach detection, and 1-click attested orders.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          @if (monitor.oodStatus(); as ood) {
            <span class="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border shadow-xs"
                  [ngClass]="ood.isOod ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'">
              {{ ood.isOod ? '⚠️ ABSTAIN: OOD' : '✓ Verified Manifold' }}
            </span>
          }
          <span class="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border shadow-xs"
                [ngClass]="monitor.hasStatOverrides() ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'">
            Pending Pivots: {{ monitor.pendingTriggersCount() }}
          </span>
          <span class="px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30">
            Fused Vitality: {{ monitor.triPulseSummary().fusedVitalityIndex }}/100
          </span>
        </div>
      </div>

      <!-- STAT Override Banner if any -->
      @if (monitor.hasStatOverrides()) {
        <div class="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">🚨</span>
            <div>
              <strong class="font-black uppercase tracking-wider text-[11px] block">STAT Emergency Override Active</strong>
              <span class="text-[11px]">Critical threshold breached. Clinical action order attestation required immediately.</span>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded font-mono font-black text-[10px] bg-rose-950 border border-rose-500 text-rose-300 uppercase">
            STAT PROTOCOL
          </span>
        </div>
      }

      <!-- Predictive Velocity Alerts Bar (Temporal Dynamics) -->
      @if (monitor.predictiveAlerts().length > 0) {
        <div class="space-y-2">
          @for (alert of monitor.predictiveAlerts(); track alert.metric) {
            <div class="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="text-base">⏳</span>
                <div>
                  <strong class="font-mono font-bold block">{{ alert.headline }}</strong>
                  <span class="text-[11px] opacity-90">{{ alert.recommendedAction }}</span>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded font-mono font-bold text-[10px] bg-amber-500/20 border border-amber-500/40 shrink-0">
                Breach in ~{{ alert.projectedMinutesToBreach }}m
              </span>
            </div>
          }
        </div>
      }

      <!-- Multi-Paradigm Tri-Pulse Fusion HUD -->
      <div class="space-y-3">
        <h4 class="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono flex items-center justify-between">
          <span>💓 Multi-Paradigm Tri-Pulse Fusion (PPG + TCM Sphygmology + Ayurvedic Nadi)</span>
          <span class="text-[10px] text-teal-500 dark:text-teal-400 font-normal">{{ monitor.triPulseSummary().clinicalSynthesis }}</span>
        </h4>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- Western PPG Card -->
          <div class="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-zinc-900 dark:text-zinc-100 font-mono">1. Western PPG Telemetry</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold border border-teal-500/30">
                {{ monitor.triPulseSummary().westernHrv.hrBpm }} bpm
              </span>
            </div>
            <div class="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
              HRV RMSSD: <strong class="font-mono text-teal-600 dark:text-teal-400">{{ monitor.triPulseSummary().westernHrv.rmssdMs }} ms</strong>
            </div>
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                <span>Autonomic Momentum</span>
                <span>{{ (monitor.triPulseSummary().westernHrv.pulseMomentum * 100).toFixed(0) }}%</span>
              </div>
              <div class="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                <div class="bg-teal-500 h-1.5 rounded-full" [style.width.%]="monitor.triPulseSummary().westernHrv.pulseMomentum * 100"></div>
              </div>
            </div>
            <!-- Waveform Morphology DSP metrics -->
            <div class="pt-1.5 border-t border-zinc-200 dark:border-zinc-700/60 grid grid-cols-2 gap-1 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
              <div>AIx: <strong class="text-teal-600 dark:text-teal-400">{{ monitor.triPulseSummary().westernHrv.augmentationIndexPct || 28.5 }}%</strong></div>
              <div>PWV: <strong class="text-teal-600 dark:text-teal-400">{{ monitor.triPulseSummary().westernHrv.estimatedPwvMPerS || 6.8 }} m/s</strong></div>
            </div>
            <p class="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-tight">
              {{ monitor.triPulseSummary().westernHrv.quality }}
            </p>
          </div>

          <!-- TCM Sphygmology Card -->
          <div class="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-zinc-900 dark:text-zinc-100 font-mono">2. TCM Sphygmology</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
                Cun / Guan / Chi
              </span>
            </div>
            <div class="text-xs font-bold text-amber-600 dark:text-amber-400">
              {{ monitor.triPulseSummary().tcmSphygmology.predominantQuality }}
            </div>
            <div class="text-[10.5px] font-mono text-zinc-600 dark:text-zinc-300 space-y-0.5">
              <div>L: {{ monitor.triPulseSummary().tcmSphygmology.leftWrist.cun }} | {{ monitor.triPulseSummary().tcmSphygmology.leftWrist.guan }}</div>
              <div>R: {{ monitor.triPulseSummary().tcmSphygmology.rightWrist.cun }} | {{ monitor.triPulseSummary().tcmSphygmology.rightWrist.guan }}</div>
            </div>
            <p class="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-tight">
              {{ monitor.triPulseSummary().tcmSphygmology.pathwayCorrelation }}
            </p>
          </div>

          <!-- Ayurvedic Nadi Pariksha Card -->
          <div class="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-zinc-900 dark:text-zinc-100 font-mono">3. Ayurvedic Nadi Pariksha</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold border border-purple-500/30">
                {{ monitor.triPulseSummary().ayurvedicNadi.dominantDosha }}
              </span>
            </div>
            <div class="text-xs font-bold text-purple-600 dark:text-purple-400">
              {{ monitor.triPulseSummary().ayurvedicNadi.nadiMovement }}
            </div>
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                <span>Ojas Vitality Reserve</span>
                <span>{{ monitor.triPulseSummary().ayurvedicNadi.ojasVitalityReserve }}%</span>
              </div>
              <div class="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                <div class="bg-purple-500 h-1.5 rounded-full" [style.width.%]="monitor.triPulseSummary().ayurvedicNadi.ojasVitalityReserve"></div>
              </div>
            </div>
            <p class="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-tight">
              Biophysical doshic equilibrium reflects living metabolic and neuro-endocrine resilience.
            </p>
          </div>
        </div>
      </div>

      <!-- Active Pivot Triggers & 1-Click Execution -->
      <div class="space-y-3">
        <h4 class="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-mono flex items-center justify-between">
          <span>🎯 Active Pivot Triggers (Living Threshold Breach Evaluation)</span>
          <span class="text-[10px] text-zinc-400">FDA 21 CFR Part 11 Cryptographic Orders</span>
        </h4>

        <div class="space-y-3">
          @for (trig of monitor.activeTriggers(); track trig.id) {
            <div class="p-4 rounded-2xl border transition-all"
                 [ngClass]="trig.isExecuted ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30' : trig.urgency === 'STAT_OVERRIDE' ? 'bg-rose-500/10 border-rose-500/50' : trig.urgency === 'URGENT' ? 'bg-amber-500/10 border-amber-500/40' : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60'">
              
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-800 pb-2.5">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider border"
                        [ngClass]="{
                          'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40': trig.urgency === 'STAT_OVERRIDE',
                          'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40': trig.urgency === 'URGENT',
                          'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/40': trig.urgency === 'ELEVATED',
                          'bg-zinc-200 text-zinc-700 border-zinc-300': trig.urgency === 'ROUTINE'
                        }">
                    {{ trig.urgency }}
                  </span>
                  <span class="px-2 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-mono font-bold uppercase">
                    {{ trig.category }}
                  </span>
                  <strong class="text-xs font-black text-zinc-900 dark:text-zinc-100">{{ trig.title }}</strong>
                </div>

                <div class="flex items-center gap-2">
                  @if (trig.isExecuted) {
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <span>✓ EXECUTED &amp; SEALED</span>
                    </span>
                  } @else {
                    <button
                      type="button"
                      (click)="executeOrder(trig.id)"
                      class="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-mono font-extrabold text-xs uppercase tracking-wider border border-teal-400 shadow-md cursor-pointer transition flex items-center gap-1.5 min-h-[38px]"
                    >
                      <span>⚡ Confirm Order</span>
                    </button>
                  }
                </div>
              </div>

              <!-- Trigger Details -->
              <div class="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span class="text-[10px] font-bold text-zinc-400 uppercase block">Condition Breach</span>
                  <span class="font-mono text-rose-600 dark:text-rose-400 font-bold">{{ trig.currentBreachValue }}</span>
                  <span class="text-[10.5px] text-zinc-500 block mt-0.5">Target: {{ trig.thresholdTarget }}</span>
                </div>

                <div class="md:col-span-2">
                  <span class="text-[10px] font-bold text-zinc-400 uppercase block">Clinical Action Directive</span>
                  <p class="text-zinc-800 dark:text-zinc-200 font-medium leading-snug">{{ trig.clinicalActionOrder }}</p>
                  <span class="text-[10px] text-teal-600 dark:text-teal-400 font-mono block mt-1">
                    Guideline: {{ trig.guidelineSource }}
                  </span>
                </div>
              </div>

              <!-- Digital Attestation Digest Display if Executed -->
              @if (trig.isExecuted && trig.attestationSeal) {
                <div class="mt-2.5 pt-2 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                  <span>Part 11 Seal: <strong class="text-emerald-600 dark:text-emerald-400">{{ trig.attestationSeal }}</strong></span>
                  <span>Executed: {{ trig.executedAt | date:'medium' }}</span>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Counterfactual "What-If" Trajectory Simulator -->
      <div class="p-5 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-teal-500/40 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-teal-500/20 pb-3">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">🔮</span>
            <div>
              <h4 class="text-xs font-black uppercase tracking-wider text-teal-300 font-mono">
                Counterfactual "What-If" Trajectory Simulator
              </h4>
              <p class="text-[11px] text-zinc-400">
                Simulate prospective care plan modifications across all 4 Platinum risk backbones before order attestation.
              </p>
            </div>
          </div>

          <button
            type="button"
            (click)="runSimulation()"
            class="px-3.5 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
          >
            <span>▶ Run Multi-Model Projection</span>
          </button>
        </div>

        <!-- Simulation Toggles -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <label class="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-zinc-700">
            <input type="checkbox" [(ngModel)]="simBotanicalInhibitor" class="rounded text-teal-500" />
            <span class="text-[11px] text-zinc-300 font-medium">Add Goldenseal</span>
          </label>

          <label class="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-zinc-700">
            <input type="checkbox" [(ngModel)]="simCoolingVest" class="rounded text-teal-500" />
            <span class="text-[11px] text-zinc-300 font-medium">Cooling Vest</span>
          </label>

          <label class="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-zinc-700">
            <input type="checkbox" [(ngModel)]="simAnticholinergicDeprescribe" class="rounded text-teal-500" />
            <span class="text-[11px] text-zinc-300 font-medium">Beers Deprescribe</span>
          </label>

          <label class="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-zinc-700">
            <input type="checkbox" [(ngModel)]="simPeriodontalDebridement" class="rounded text-teal-500" />
            <span class="text-[11px] text-zinc-300 font-medium">Dental Debridement</span>
          </label>
        </div>

        <!-- Simulation Result Grid -->
        @if (simulationResult()) {
          <div class="space-y-3 pt-2">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <!-- CYP Clearance -->
              <div class="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
                <span class="text-[10px] font-bold text-zinc-400 uppercase block">CYP Clearance</span>
                <div class="flex items-center gap-1.5 font-mono">
                  <span class="text-zinc-400 line-through">{{ simulationResult()!.before.cypClearancePct }}%</span>
                  <span class="text-zinc-500">➔</span>
                  <span class="font-bold text-sm" [ngClass]="simulationResult()!.after.cypClearancePct >= 70 ? 'text-emerald-400' : 'text-rose-400'">
                    {{ simulationResult()!.after.cypClearancePct }}%
                  </span>
                </div>
              </div>

              <!-- Delirium Risk -->
              <div class="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
                <span class="text-[10px] font-bold text-zinc-400 uppercase block">Delirium / Fall Risk</span>
                <div class="flex items-center gap-1.5 font-mono">
                  <span class="text-zinc-400 line-through">{{ simulationResult()!.before.deliriumRiskPct }}%</span>
                  <span class="text-zinc-500">➔</span>
                  <span class="font-bold text-sm" [ngClass]="simulationResult()!.after.deliriumRiskPct < 25 ? 'text-emerald-400' : 'text-amber-400'">
                    {{ simulationResult()!.after.deliriumRiskPct }}%
                  </span>
                </div>
              </div>

              <!-- MS PIRA Velocity -->
              <div class="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
                <span class="text-[10px] font-bold text-zinc-400 uppercase block">PIRA EDSS Velocity</span>
                <div class="flex items-center gap-1.5 font-mono">
                  <span class="text-zinc-400 line-through">+{{ simulationResult()!.before.piraAnnualEdssVelocity }}</span>
                  <span class="text-zinc-500">➔</span>
                  <span class="font-bold text-sm" [ngClass]="simulationResult()!.after.piraAnnualEdssVelocity <= 0.20 ? 'text-emerald-400' : 'text-amber-400'">
                    +{{ simulationResult()!.after.piraAnnualEdssVelocity }}/yr
                  </span>
                </div>
              </div>

              <!-- 30-Day hs-CRP Spike -->
              <div class="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
                <span class="text-[10px] font-bold text-zinc-400 uppercase block">hs-CRP Vascular Spike</span>
                <div class="flex items-center gap-1.5 font-mono">
                  <span class="text-zinc-400 line-through">{{ simulationResult()!.before.hsCrpSpikeRiskPct }}%</span>
                  <span class="text-zinc-500">➔</span>
                  <span class="font-bold text-sm" [ngClass]="simulationResult()!.after.hsCrpSpikeRiskPct < 20 ? 'text-emerald-400' : 'text-rose-400'">
                    {{ simulationResult()!.after.hsCrpSpikeRiskPct }}%
                  </span>
                </div>
              </div>
            </div>

            <!-- Pearlian Causal ITE Banner -->
            @if (simulationResult()!.unconfoundedIteDelta !== undefined) {
              <div class="px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono flex items-center justify-between flex-wrap gap-2">
                <span class="flex items-center gap-1.5">
                  <span>📐</span>
                  <span><strong>AIPW Causal ITE:</strong> {{ simulationResult()!.unconfoundedIteDelta! > 0 ? '+' : '' }}{{ simulationResult()!.unconfoundedIteDelta }}</span>
                </span>
                <span class="text-[11px] text-indigo-400">
                  Propensity e(X): <strong>{{ simulationResult()!.propensityScore }}</strong>
                </span>
              </div>
            }

            <!-- Benefit Summary Banner -->
            <div class="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-200 text-xs font-mono flex items-center gap-2">
              <span>✨</span>
              <span><strong>Trajectory Impact:</strong> {{ simulationResult()!.benefitSummary }}</span>
            </div>
          </div>
        }
      </div>

    </div>
  `
})
export class ActivePivotMonitorCardComponent {
  readonly monitor = inject(ActivePivotMonitorService);

  simBotanicalInhibitor = false;
  simCoolingVest = true;
  simAnticholinergicDeprescribe = true;
  simPeriodontalDebridement = true;

  readonly simulationResult = signal<IWhatIfSimulationResult | null>(null);

  constructor() {
    this.runSimulation();
  }

  executeOrder(triggerId: string): void {
    this.monitor.executePivotOrder(triggerId, 'DR_CHANDRASEKHAR_MD', 'Attested via Active Pivot Telemetry HUD');
  }

  async runSimulation(): Promise<void> {
    const res = await this.monitor.simulateWhatIfScenario({
      interventionLabel: 'Multimodal Trajectory Optimization Protocol',
      botanicalInhibitorAdd: this.simBotanicalInhibitor,
      sulfonylureaDeEscalate: true,
      coolingVestActive: this.simCoolingVest,
      periodontalDebridementDone: this.simPeriodontalDebridement,
      anticholinergicDeprescribe: this.simAnticholinergicDeprescribe
    });
    this.simulationResult.set(res);
  }
}
