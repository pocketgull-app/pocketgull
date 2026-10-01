import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalMoERouterService, IUiGatingScore } from '../services/clinical-moe-router.service';
import { KneeHologramHudComponent } from './knee-hologram-hud.component';
import { CounterfactualSimulatorComponent } from './counterfactual-simulator.component';
import { ClinicalPosologyCalculatorComponent } from './clinical-posology-calculator.component';
import { EdgeMlHudComponent } from './edge-ml-hud/edge-ml-hud.component';
import { SteeepQualityHudComponent } from './steeep-quality-hud/steeep-quality-hud.component';
import { SoapNoteGeneratorComponent } from './soap-note-generator.component';
import { LensBiomolecularPhysicsComponent } from './turing/lens-biomolecular-physics.component';
import { AnalysisReportComponent } from './analysis-report.component';

@Component({
  selector: 'app-sparse-clinical-canvas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    KneeHologramHudComponent,
    CounterfactualSimulatorComponent,
    ClinicalPosologyCalculatorComponent,
    EdgeMlHudComponent,
    SteeepQualityHudComponent,
    SoapNoteGeneratorComponent,
    LensBiomolecularPhysicsComponent,
    AnalysisReportComponent
  ],
  template: `
    <div class="flex flex-col flex-1 h-full w-full min-h-0 overflow-y-auto bg-zinc-950 text-zinc-100 font-sans p-3 sm:p-5 gap-4">
      
      <!-- ================================================================= -->
      <!-- TOP HUD: Sparse Mixture of Experts Telemetry & Gating Controls    -->
      <!-- ================================================================= -->
      <header class="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl p-3.5 sm:p-4 shadow-xl flex flex-col gap-3 shrink-0">
        
        <!-- Row 1: Brand Telemetry & Metric Pills -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono text-xl font-bold shadow-inner">
              ⚡
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-sm sm:text-base font-bold tracking-wide uppercase font-mono text-zinc-100">
                  Sparse Mixture of UI Experts (SMoE) Canvas
                </h1>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Dynamic Top-{{ moeRouter.kValue() }} Gating
                </span>
              </div>
              <p class="text-xs text-zinc-400 mt-0.5">
                Active Slot Routing: <span class="text-emerald-300 font-semibold">{{ primaryExpert()?.expert?.shortLabel || 'None' }}</span>
                @if (moeRouter.kValue() > 1 && secondaryExpert()) {
                  <span> + <span class="text-teal-300 font-semibold">{{ secondaryExpert()?.expert?.shortLabel }}</span></span>
                }
              </p>
            </div>
          </div>

          <!-- Telemetry Badges & Sparsity Efficiency -->
          <div class="flex items-center gap-2 font-mono flex-wrap">
            
            <!-- Noise Reduction Metric -->
            <div class="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-1.5 text-xs"
                 title="Cognitive screen noise reduction compared to an 8-panel dense monolithic dashboard">
              <span class="text-zinc-400">Noise Shield:</span>
              <span class="text-emerald-400 font-bold tabular-nums">+{{ moeRouter.cognitiveNoiseReductionPercent() }}%</span>
            </div>

            <!-- Cognitive Load Score -->
            <div class="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-1.5 text-xs"
                 title="Calculated cognitive load index for clinician / patient visual ergonomics">
              <span class="text-zinc-400">Cognitive Load:</span>
              <span class="font-bold tabular-nums" [ngClass]="moeRouter.cognitiveLoadScore() < 50 ? 'text-teal-400' : 'text-amber-400'">
                {{ moeRouter.cognitiveLoadScore() }}/100
              </span>
            </div>

            <!-- k-Value Sparsity Controller -->
            <div class="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-0.5 text-xs">
              <span class="px-2 text-[10px] text-zinc-500 font-bold uppercase select-none">Top-k:</span>
              <button type="button" (click)="moeRouter.setKValue(1)"
                [class.bg-emerald-500]="moeRouter.kValue() === 1"
                [class.text-zinc-950]="moeRouter.kValue() === 1"
                [class.text-zinc-400]="moeRouter.kValue() !== 1"
                class="px-2.5 py-1 rounded-lg font-bold transition text-xs min-h-[36px] cursor-pointer">
                1
              </button>
              <button type="button" (click)="moeRouter.setKValue(2)"
                [class.bg-emerald-500]="moeRouter.kValue() === 2"
                [class.text-zinc-950]="moeRouter.kValue() === 2"
                [class.text-zinc-400]="moeRouter.kValue() !== 2"
                class="px-2.5 py-1 rounded-lg font-bold transition text-xs min-h-[36px] cursor-pointer">
                2
              </button>
              <button type="button" (click)="moeRouter.setKValue(3)"
                [class.bg-emerald-500]="moeRouter.kValue() === 3"
                [class.text-zinc-950]="moeRouter.kValue() === 3"
                [class.text-zinc-400]="moeRouter.kValue() !== 3"
                class="px-2.5 py-1 rounded-lg font-bold transition text-xs min-h-[36px] cursor-pointer">
                3
              </button>
            </div>
          </div>
        </div>

        <!-- Row 2: Scenario Quick-Switchers & Conversational Audio Cue Simulator -->
        <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-2 border-t border-zinc-800/80 text-xs">
          
          <!-- Clinical Demo Scenario Selector -->
          <div class="flex items-center gap-1.5 flex-wrap font-mono">
            <span class="text-[10px] uppercase font-bold text-zinc-500 select-none mr-1">SCENARIOS:</span>

            <button type="button" (click)="moeRouter.loadDemoScenario('default')"
              [class.bg-zinc-800]="moeRouter.activeScenario() === 'default'"
              [class.text-zinc-200]="moeRouter.activeScenario() === 'default'"
              [class.border-zinc-600]="moeRouter.activeScenario() === 'default'"
              class="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition min-h-[36px] cursor-pointer">
              📄 Default Synthesis
            </button>

            <button type="button" (click)="moeRouter.loadDemoScenario('knee_oa')"
              [class.bg-cyan-950]="moeRouter.activeScenario() === 'knee_oa'"
              [class.text-cyan-300]="moeRouter.activeScenario() === 'knee_oa'"
              [class.border-cyan-500]="moeRouter.activeScenario() === 'knee_oa'"
              class="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-cyan-300 hover:bg-zinc-900 transition min-h-[36px] cursor-pointer">
              🩻 RSNA Knee OA (Joint + What-If)
            </button>

            <button type="button" (click)="moeRouter.loadDemoScenario('diabetic_neuropathy')"
              [class.bg-amber-950]="moeRouter.activeScenario() === 'diabetic_neuropathy'"
              [class.text-amber-300]="moeRouter.activeScenario() === 'diabetic_neuropathy'"
              [class.border-amber-500]="moeRouter.activeScenario() === 'diabetic_neuropathy'"
              class="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-amber-300 hover:bg-zinc-900 transition min-h-[36px] cursor-pointer">
              💊 Diabetic Polypharmacy (ISMP + What-If)
            </button>

            <button type="button" (click)="moeRouter.loadDemoScenario('acute_vitals')"
              [class.bg-rose-950]="moeRouter.activeScenario() === 'acute_vitals'"
              [class.text-rose-300]="moeRouter.activeScenario() === 'acute_vitals'"
              [class.border-rose-500]="moeRouter.activeScenario() === 'acute_vitals'"
              class="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-rose-300 hover:bg-zinc-900 transition min-h-[36px] cursor-pointer">
              ⚡ Acute Vitals Flare (ONNX Edge + SOAP)
            </button>
          </div>

          <!-- Ambient Conversational Cue Prompt (Doctor-Patient Speech Simulation) -->
          <div class="flex items-center gap-2 flex-1 lg:max-w-md">
            <div class="relative w-full">
              <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-500 text-xs">
                🎙️
              </span>
              <input
                type="text"
                [ngModel]="moeRouter.activeTranscriptQuery()"
                (ngModelChange)="moeRouter.setTranscriptQuery($event)"
                placeholder="Simulate speech cue (e.g. 'knee clicking', 'metformin renal', 'high heart rate')..."
                class="w-full pl-8 pr-16 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
              @if (moeRouter.activeTranscriptQuery()) {
                <button
                  type="button"
                  (click)="moeRouter.setTranscriptQuery('')"
                  class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-zinc-200 cursor-pointer text-xs"
                >
                  ✕
                </button>
              }
            </div>
          </div>
        </div>
      </header>

      <!-- ================================================================= -->
      <!-- SYNAPSE CROSS-ATTENTION BRIDGE (Active when Top-2 Cross-Talks)    -->
      <!-- ================================================================= -->
      @if (crossBridge(); as bridge) {
        <div class="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 via-zinc-900/90 to-teal-950/60 p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300 shrink-0">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 text-sm font-bold shrink-0">
                🧬
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-900/60 text-emerald-300 border border-emerald-500/30">
                    Cross-Attention Bridge Active
                  </span>
                  <h3 class="text-sm font-bold text-zinc-100 font-mono tracking-wide">
                    {{ bridge.title }}
                  </h3>
                </div>
                <p class="text-xs text-zinc-300 mt-1 leading-relaxed">
                  <span class="text-zinc-400 font-medium">Physiological Mechanism:</span> {{ bridge.mechanism }}
                </p>
                <p class="text-xs text-emerald-200/90 mt-0.5 leading-relaxed">
                  <span class="text-emerald-400 font-semibold">Clinical Action:</span> {{ bridge.actionableVector }}
                </p>
              </div>
            </div>

            <!-- Benchmark Target Pill -->
            <div class="sm:text-right shrink-0">
              <span class="text-[10px] font-mono text-zinc-400 block uppercase">Benchmark Target</span>
              <span class="font-mono text-xs font-bold text-emerald-300 px-2.5 py-1 rounded-lg bg-zinc-900 border border-emerald-500/40 shadow-inner inline-block mt-0.5">
                {{ bridge.benchmarkMetric }}
              </span>
            </div>
          </div>
        </div>
      }

      <!-- ================================================================= -->
      <!-- MAIN VIEWPORT: Softmax-Proportioned Top-k Expert Canvas           -->
      <!-- ================================================================= -->
      <main class="flex-1 flex flex-col lg:flex-row items-stretch gap-4 min-h-0 transition-all duration-500 ease-out">
        
        <!-- --------------------------------------------------------------- -->
        <!-- PRIMARY EXPERT SLOT (Top-1)                                     -->
        <!-- --------------------------------------------------------------- -->
        @if (primaryExpert(); as primary) {
          <section
            class="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl shadow-2xl p-4 overflow-hidden transition-all duration-500 min-w-0"
            [style.flex]="primaryStyleFlex()"
          >
            <!-- Slot Header -->
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 shrink-0 gap-2 flex-wrap">
              <div class="flex items-center gap-2.5">
                <span class="text-xl">{{ primary.expert.icon }}</span>
                <div>
                  <div class="flex items-center gap-2">
                    <h2 class="text-sm font-bold text-zinc-100 font-mono tracking-wide">
                      {{ primary.expert.name }}
                    </h2>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Primary Slot ({{ Math.round(primary.weight * 100) }}%)
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5 font-mono">
                    <span class="text-teal-400">⚡ {{ primary.expert.telemetrySource }}</span>
                    <span>•</span>
                    <span class="text-zinc-400">{{ primary.routingRationale }}</span>
                  </div>
                </div>
              </div>

              <!-- Header Action Controls -->
              <div class="flex items-center gap-1.5 font-mono text-xs">
                @if (moeRouter.pinnedExpertId() === primary.expert.id) {
                  <button type="button" (click)="moeRouter.pinExpert(null)"
                    title="Unpin this expert"
                    class="px-2 py-1 rounded-lg bg-amber-500 text-zinc-950 font-bold text-[11px] min-h-[32px] cursor-pointer">
                    📌 Pinned
                  </button>
                } @else {
                  <button type="button" (click)="moeRouter.pinExpert(primary.expert.id)"
                    title="Pin this expert as primary"
                    class="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] min-h-[32px] transition cursor-pointer">
                    Pin
                  </button>
                }
              </div>
            </div>

            <!-- Dynamic Component Outlet for Primary Slot -->
            <div class="flex-1 min-h-0 overflow-y-auto">
              @switch (primary.expert.id) {
                @case ('knee-hologram') {
                  <app-knee-hologram-hud />
                }
                @case ('counterfactual-simulator') {
                  <app-counterfactual-simulator />
                }
                @case ('ismp-posology') {
                  <app-clinical-posology-calculator />
                }
                @case ('edge-ml-hud') {
                  <app-edge-ml-hud />
                }
                @case ('steeep-quality-hud') {
                  <app-steeep-quality-hud />
                }
                @case ('soap-generator') {
                  <app-soap-note-generator />
                }
                @case ('biophysics-genomics') {
                  <app-lens-biomolecular-physics />
                }
                @case ('analysis-report') {
                  <app-analysis-report />
                }
                @default {
                  <app-analysis-report />
                }
              }
            </div>
          </section>
        }

        <!-- --------------------------------------------------------------- -->
        <!-- SECONDARY EXPERT SLOT (Top-2, if k >= 2)                        -->
        <!-- --------------------------------------------------------------- -->
        @if (moeRouter.kValue() >= 2 && secondaryExpert(); as secondary) {
          <section
            class="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl shadow-2xl p-4 overflow-hidden transition-all duration-500 min-w-0"
            [style.flex]="secondaryStyleFlex()"
          >
            <!-- Slot Header -->
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 shrink-0 gap-2 flex-wrap">
              <div class="flex items-center gap-2.5">
                <span class="text-xl">{{ secondary.expert.icon }}</span>
                <div>
                  <div class="flex items-center gap-2">
                    <h2 class="text-sm font-bold text-zinc-100 font-mono tracking-wide">
                      {{ secondary.expert.name }}
                    </h2>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      Co-Active Slot ({{ Math.round(secondary.weight * 100) }}%)
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5 font-mono">
                    <span class="text-cyan-400">⚡ {{ secondary.expert.telemetrySource }}</span>
                    <span>•</span>
                    <span class="text-zinc-400">{{ secondary.routingRationale }}</span>
                  </div>
                </div>
              </div>

              <!-- Header Action Controls -->
              <div class="flex items-center gap-1.5 font-mono text-xs">
                <button type="button" (click)="moeRouter.promoteLatentExpert(secondary.expert.id)"
                  title="Promote to Primary Slot"
                  class="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] min-h-[32px] transition cursor-pointer">
                  Promote ⬆
                </button>
              </div>
            </div>

            <!-- Dynamic Component Outlet for Secondary Slot -->
            <div class="flex-1 min-h-0 overflow-y-auto">
              @switch (secondary.expert.id) {
                @case ('knee-hologram') {
                  <app-knee-hologram-hud />
                }
                @case ('counterfactual-simulator') {
                  <app-counterfactual-simulator />
                }
                @case ('ismp-posology') {
                  <app-clinical-posology-calculator />
                }
                @case ('edge-ml-hud') {
                  <app-edge-ml-hud />
                }
                @case ('steeep-quality-hud') {
                  <app-steeep-quality-hud />
                }
                @case ('soap-generator') {
                  <app-soap-note-generator />
                }
                @case ('biophysics-genomics') {
                  <app-lens-biomolecular-physics />
                }
                @case ('analysis-report') {
                  <app-analysis-report />
                }
                @default {
                  <app-counterfactual-simulator />
                }
              }
            </div>
          </section>
        }
      </main>

      <!-- ================================================================= -->
      <!-- DORMANT EXPERTS SHELF (Latent Experts - Zero Memory Overhead)     -->
      <!-- ================================================================= -->
      <footer class="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-3 shadow-lg flex flex-col gap-2 shrink-0">
        <div class="flex items-center justify-between text-xs font-mono">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-zinc-600"></span>
            <span class="text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
              Latent Experts Shelf (Dormant — Zero Memory / 0 FLOP Egress)
            </span>
          </div>
          <span class="text-zinc-500 text-[11px]">
            Click any expert pill to promote to active canvas
          </span>
        </div>

        <div class="flex items-center gap-2 overflow-x-auto pb-1 pt-1 font-mono">
          @for (latent of latentExperts(); track latent.expert.id) {
            <button
              type="button"
              (click)="moeRouter.promoteLatentExpert(latent.expert.id)"
              [title]="latent.routingRationale + ' • Telemetry: ' + latent.expert.telemetrySource"
              class="group flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-850 hover:border-zinc-600 text-zinc-300 hover:text-white transition duration-200 shrink-0 text-xs cursor-pointer min-h-[36px]"
            >
              <span>{{ latent.expert.icon }}</span>
              <span class="font-medium">{{ latent.expert.shortLabel }}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 group-hover:border-zinc-700">
                {{ Math.round(latent.weight * 100) }}%
              </span>
            </button>
          }

          @if (moeRouter.pinnedExpertId()) {
            <button
              type="button"
              (click)="moeRouter.clearOverrides()"
              class="ml-auto px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono transition cursor-pointer min-h-[36px]"
            >
              Reset Manual Pins ✕
            </button>
          }
        </div>
      </footer>
    </div>
  `
})
export class SparseClinicalCanvasComponent {
  readonly moeRouter = inject(ClinicalMoERouterService);
  protected readonly Math = Math;

  readonly primaryExpert = computed(() => this.moeRouter.primaryUiExpert());
  readonly secondaryExpert = computed(() => this.moeRouter.secondaryUiExpert());
  readonly latentExperts = computed(() => this.moeRouter.latentUiExperts());
  readonly crossBridge = computed(() => this.moeRouter.activeCrossAttentionBridge());

  readonly primaryStyleFlex = computed(() => {
    if (this.moeRouter.kValue() === 1 || !this.secondaryExpert()) {
      return '1 1 100%';
    }
    const ratio = this.moeRouter.primaryViewportRatio();
    return `0 0 ${ratio}%`;
  });

  readonly secondaryStyleFlex = computed(() => {
    const ratio = this.moeRouter.secondaryViewportRatio();
    return `0 0 ${ratio}%`;
  });
}
