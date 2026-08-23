import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CounterfactualSimulationService, ICounterfactualScenario, IGoalInversionPathway } from '../services/counterfactual-simulation.service';

@Component({
  selector: 'app-counterfactual-simulator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-3xl bg-white/85 dark:bg-zinc-950/90 backdrop-blur-xl border-2 border-emerald-500/30 dark:border-emerald-500/40 shadow-2xl space-y-6 animate-in fade-in duration-300 font-pocketgull-inter text-zinc-900 dark:text-zinc-100">
      
      <!-- Header HUD with Mode Indicator -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl shadow-inner shrink-0">
            🔮
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-sm sm:text-base font-pocketgull font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-300">
                Inquisitive Counterfactual Health Simulator
              </h3>
              <span class="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-500/30">
                Socratic What-If Sandbox
              </span>
            </div>
            <p class="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
              Bi-directional hypothesis testing: Perturb physiological biomarkers, cross-check multi-paradigm invariants, and probe behavioral readiness (OARS).
            </p>
          </div>
        </div>

        <!-- Mode Toggle & Reset Actions -->
        <div class="flex items-center gap-2 font-pocketgull-mono">
          <button type="button" (click)="activeTab.set('scenarios')"
            [class]="activeTab() === 'scenarios' ? 'bg-emerald-600 text-white font-bold shadow-md' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'"
            class="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer min-h-[36px]">
            🔮 What-If Scenarios
          </button>

          <button type="button" (click)="activeTab.set('inversion')"
            [class]="activeTab() === 'inversion' ? 'bg-emerald-600 text-white font-bold shadow-md' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'"
            class="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer min-h-[36px]">
            🎯 Goal Inversion
          </button>

          @if (sim.hasActiveSimulation()) {
            <button 
              type="button"
              (click)="sim.resetDeltas()"
              class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl transition cursor-pointer min-h-[36px]">
              Reset
            </button>
          }
        </div>
      </div>

      <!-- Real-Time Comparative Outcome Badges -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <!-- SIBI Index Tile -->
        <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between text-xs font-pocketgull font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <span>Systemic Burden (SIBI)</span>
            <span class="text-xs font-pocketgull-mono font-bold">{{ sim.baselineSibiScore() }} → {{ sim.simulatedSibiScore() }}</span>
          </div>
          <div class="mt-2.5 flex items-baseline justify-between">
            <span class="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-pocketgull-tabular">{{ sim.simulatedSibiScore() }} <span class="text-xs font-normal text-zinc-400">/ 10</span></span>
            @if (sim.sibiDelta() < 0) {
              <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                ↓ {{ abs(sim.sibiDelta()) }} pts (Better)
              </span>
            } @else if (sim.sibiDelta() > 0) {
              <span class="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/30">
                ↑ {{ sim.sibiDelta() }} pts (Risk)
              </span>
            } @else {
              <span class="text-xs text-zinc-400 font-medium">Baseline</span>
            }
          </div>
        </div>

        <!-- 10-Yr CV Risk Tile -->
        <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between text-xs font-pocketgull font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <span>10-Year CV Risk</span>
            <span class="text-xs font-pocketgull-mono font-bold">{{ sim.baselineCvRisk() }}% → {{ sim.simulatedCvRisk() }}%</span>
          </div>
          <div class="mt-2.5 flex items-baseline justify-between">
            <span class="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-pocketgull-tabular">{{ sim.simulatedCvRisk() }}%</span>
            @if (sim.cvRiskDelta() < 0) {
              <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                ↓ {{ abs(sim.cvRiskDelta()) }}% (Lower)
              </span>
            } @else if (sim.cvRiskDelta() > 0) {
              <span class="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/30">
                ↑ {{ sim.cvRiskDelta() }}% (Higher)
              </span>
            } @else {
              <span class="text-xs text-zinc-400 font-medium">Baseline</span>
            }
          </div>
        </div>

        <!-- Action Target Banner -->
        <div class="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/30 flex flex-col justify-between">
          <div class="text-xs font-pocketgull font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Care Plan Handoff
          </div>
          <p class="text-xs text-zinc-600 dark:text-zinc-300 leading-snug mt-1">
            Commit counterfactual targets directly to the active patient profile state.
          </p>
          <button
            type="button"
            (click)="sim.applySimulationToPatientState()"
            [disabled]="!sim.hasActiveSimulation()"
            class="mt-2.5 w-full min-h-[40px] px-3.5 py-2 text-xs font-pocketgull font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition rounded-xl disabled:opacity-30 disabled:cursor-not-allowed shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Apply Target to Care Plan</span>
          </button>
        </div>

      </div>

      <!-- Sensitivity & Equivalence Insight Banner -->
      <div class="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 font-pocketgull leading-relaxed shadow-sm flex items-start gap-2.5">
        <span class="text-base shrink-0">💡</span>
        <div>
          <span class="font-bold font-pocketgull-mono uppercase text-indigo-300 block mb-0.5">Socratic Clinical Insight</span>
          <p>{{ sim.sensitivityInsight() }}</p>
        </div>
      </div>

      <!-- Tab 1: Socratic What-If Hypothesis Rail -->
      @if (activeTab() === 'scenarios') {
        <div class="space-y-3 font-pocketgull-mono">
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase font-bold tracking-widest text-zinc-400">
              🔮 Socratic "What-If" Clinical Scenarios (Tap to Simulate)
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            @for (sc of sim.socraticScenarios; track sc.id) {
              <div (click)="sim.applyScenario(sc)"
                class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/60 transition-all cursor-pointer shadow-sm flex flex-col justify-between gap-2 hover:scale-[1.01]">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-lg">{{ sc.emoji }}</span>
                    <h4 class="text-xs font-bold text-zinc-100 uppercase tracking-wider">{{ sc.title }}</h4>
                  </div>
                  <p class="text-xs font-pocketgull-inter text-emerald-300 font-medium leading-relaxed italic">
                    "{{ sc.inquisitiveQuestion }}"
                  </p>
                </div>
                <div class="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 font-sans leading-normal">
                  <strong>Mechanism:</strong> {{ sc.causalRationale }}
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Tab 2: Goal-Backward Inversion ("What Would It Take?") -->
      @if (activeTab() === 'inversion') {
        <div class="space-y-3 font-pocketgull-mono">
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase font-bold tracking-widest text-zinc-400">
              🎯 Goal-Backward Inversion — "What Would It Take?" Pathways
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            @for (pw of sim.goalInversionPathways; track pw.id) {
              <div (click)="sim.applyPathway(pw)"
                class="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-cyan-500/60 transition-all cursor-pointer shadow-sm flex flex-col justify-between gap-3 hover:scale-[1.01]">
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {{ pw.paradigmFocus }}
                    </span>
                    <span class="text-xs font-bold text-emerald-400 font-pocketgull-tabular">{{ pw.expectedCvReduction }} CV Risk</span>
                  </div>
                  <h4 class="text-xs font-bold text-zinc-100 uppercase tracking-wide mt-1.5">{{ pw.title }}</h4>
                  <p class="text-xs font-pocketgull-inter text-zinc-400 mt-1 leading-relaxed">
                    {{ pw.description }}
                  </p>
                </div>

                <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-pocketgull-inter text-amber-300 leading-relaxed italic">
                  <strong>Inquiry:</strong> "{{ pw.readinessQuestion }}"
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Biomarker Perturbation Sliders with 3D Double-Click OARS Flip -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs uppercase font-bold tracking-widest text-zinc-400 font-pocketgull-mono">
            🎛️ Physiological Levers &amp; OARS Readiness Cards (Double-Click to Flip for Inquiry)
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">

          <!-- 1. HbA1c Slider Card (Flip-Ready) -->
          <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-2.5 shadow-sm"
               (dblclick)="toggleCardFlip('hba1c')"
               title="Double-click to flip for Motivational Interviewing (OARS) readiness questions">
            @if (!flippedCards()['hba1c']) {
              <div>
                <div class="flex items-center justify-between text-xs font-bold">
                  <span class="text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <span>🩸</span>
                    <span>HbA1c Target (Baseline: {{ sim.baselineHbA1c() }}%)</span>
                  </span>
                  <span class="text-emerald-700 dark:text-emerald-300 font-pocketgull-mono font-bold">{{ sim.simulatedHbA1c() }}% ({{ formatDelta(sim.deltaHbA1c(), '%') }})</span>
                </div>
                <input 
                  type="range"
                  min="-2.0"
                  max="2.0"
                  step="0.1"
                  [value]="sim.deltaHbA1c()"
                  (input)="sim.deltaHbA1c.set(getEventVal($event))"
                  class="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg mt-2"
                >
                <div class="flex justify-between text-[10px] font-pocketgull-mono text-zinc-400 mt-1">
                  <span>-2.0% (Aggressive target)</span>
                  <button type="button" (click)="toggleCardFlip('hba1c')" class="text-purple-400 hover:underline cursor-pointer">dblclick 🔄 OARS</button>
                  <span>+2.0%</span>
                </div>
              </div>
            } @else {
              <div class="p-1 space-y-2 text-xs font-pocketgull-inter animate-in fade-in duration-200">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-1 font-pocketgull-mono">
                  <span class="text-amber-400 font-bold uppercase">💬 {{ sim.oarsPrompts['hba1c'].title }}</span>
                  <button type="button" (click)="toggleCardFlip('hba1c')" class="text-zinc-400 hover:text-white text-[10px] uppercase font-bold cursor-pointer">✕ Close</button>
                </div>
                <p class="text-zinc-200 italic leading-relaxed">"{{ sim.oarsPrompts['hba1c'].readinessRulerQuestion }}"</p>
                <p class="text-zinc-400 text-[11px] leading-relaxed"><strong>Decisional Balance:</strong> {{ sim.oarsPrompts['hba1c'].decisionalBalanceQuestion }}</p>
              </div>
            }
          </div>

          <!-- 2. Daily Steps Slider Card (Flip-Ready) -->
          <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-2.5 shadow-sm"
               (dblclick)="toggleCardFlip('steps')"
               title="Double-click to flip for Motivational Interviewing (OARS) readiness questions">
            @if (!flippedCards()['steps']) {
              <div>
                <div class="flex items-center justify-between text-xs font-bold">
                  <span class="text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <span>👟</span>
                    <span>Daily Steps (Baseline: {{ sim.baselineSteps() }})</span>
                  </span>
                  <span class="text-emerald-700 dark:text-emerald-300 font-pocketgull-mono font-bold">{{ sim.simulatedSteps() }} steps ({{ formatDelta(sim.deltaSteps(), ' steps') }})</span>
                </div>
                <input 
                  type="range"
                  min="-4000"
                  max="5000"
                  step="500"
                  [value]="sim.deltaSteps()"
                  (input)="sim.deltaSteps.set(getEventVal($event))"
                  class="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg mt-2"
                >
                <div class="flex justify-between text-[10px] font-pocketgull-mono text-zinc-400 mt-1">
                  <span>-4,000 steps</span>
                  <button type="button" (click)="toggleCardFlip('steps')" class="text-purple-400 hover:underline cursor-pointer">dblclick 🔄 OARS</button>
                  <span>+5,000 steps (High activity)</span>
                </div>
              </div>
            } @else {
              <div class="p-1 space-y-2 text-xs font-pocketgull-inter animate-in fade-in duration-200">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-1 font-pocketgull-mono">
                  <span class="text-amber-400 font-bold uppercase">💬 {{ sim.oarsPrompts['steps'].title }}</span>
                  <button type="button" (click)="toggleCardFlip('steps')" class="text-zinc-400 hover:text-white text-[10px] uppercase font-bold cursor-pointer">✕ Close</button>
                </div>
                <p class="text-zinc-200 italic leading-relaxed">"{{ sim.oarsPrompts['steps'].readinessRulerQuestion }}"</p>
                <p class="text-zinc-400 text-[11px] leading-relaxed"><strong>Decisional Balance:</strong> {{ sim.oarsPrompts['steps'].decisionalBalanceQuestion }}</p>
              </div>
            }
          </div>

          <!-- 3. HRV RMSSD Slider Card (Flip-Ready) -->
          <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-2.5 shadow-sm"
               (dblclick)="toggleCardFlip('hrv')"
               title="Double-click to flip for Motivational Interviewing (OARS) readiness questions">
            @if (!flippedCards()['hrv']) {
              <div>
                <div class="flex items-center justify-between text-xs font-bold">
                  <span class="text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <span>🫀</span>
                    <span>HRV Autonomic Tone (Baseline: {{ sim.baselineHrv() }} ms)</span>
                  </span>
                  <span class="text-emerald-700 dark:text-emerald-300 font-pocketgull-mono font-bold">{{ sim.simulatedHrv() }} ms ({{ formatDelta(sim.deltaHrv(), ' ms') }})</span>
                </div>
                <input 
                  type="range"
                  min="-20"
                  max="40"
                  step="2"
                  [value]="sim.deltaHrv()"
                  (input)="sim.deltaHrv.set(getEventVal($event))"
                  class="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg mt-2"
                >
                <div class="flex justify-between text-[10px] font-pocketgull-mono text-zinc-400 mt-1">
                  <span>-20 ms</span>
                  <button type="button" (click)="toggleCardFlip('hrv')" class="text-purple-400 hover:underline cursor-pointer">dblclick 🔄 OARS</button>
                  <span>+40 ms (Vagal boost)</span>
                </div>
              </div>
            } @else {
              <div class="p-1 space-y-2 text-xs font-pocketgull-inter animate-in fade-in duration-200">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-1 font-pocketgull-mono">
                  <span class="text-amber-400 font-bold uppercase">💬 {{ sim.oarsPrompts['hrv'].title }}</span>
                  <button type="button" (click)="toggleCardFlip('hrv')" class="text-zinc-400 hover:text-white text-[10px] uppercase font-bold cursor-pointer">✕ Close</button>
                </div>
                <p class="text-zinc-200 italic leading-relaxed">"{{ sim.oarsPrompts['hrv'].readinessRulerQuestion }}"</p>
                <p class="text-zinc-400 text-[11px] leading-relaxed"><strong>Decisional Balance:</strong> {{ sim.oarsPrompts['hrv'].decisionalBalanceQuestion }}</p>
              </div>
            }
          </div>

          <!-- 4. Systolic BP Slider Card (Flip-Ready) -->
          <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-2.5 shadow-sm"
               (dblclick)="toggleCardFlip('systolic')"
               title="Double-click to flip for Motivational Interviewing (OARS) readiness questions">
            @if (!flippedCards()['systolic']) {
              <div>
                <div class="flex items-center justify-between text-xs font-bold">
                  <span class="text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <span>🩺</span>
                    <span>Systolic BP (Baseline: {{ sim.baselineSystolic() }} mmHg)</span>
                  </span>
                  <span class="text-emerald-700 dark:text-emerald-300 font-pocketgull-mono font-bold">{{ sim.simulatedSystolic() }} mmHg ({{ formatDelta(sim.deltaSystolic(), ' mmHg') }})</span>
                </div>
                <input 
                  type="range"
                  min="-30"
                  max="30"
                  step="2"
                  [value]="sim.deltaSystolic()"
                  (input)="sim.deltaSystolic.set(getEventVal($event))"
                  class="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg mt-2"
                >
                <div class="flex justify-between text-[10px] font-pocketgull-mono text-zinc-400 mt-1">
                  <span>-30 mmHg (Target lowering)</span>
                  <button type="button" (click)="toggleCardFlip('systolic')" class="text-purple-400 hover:underline cursor-pointer">dblclick 🔄 OARS</button>
                  <span>+30 mmHg</span>
                </div>
              </div>
            } @else {
              <div class="p-1 space-y-2 text-xs font-pocketgull-inter animate-in fade-in duration-200">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-1 font-pocketgull-mono">
                  <span class="text-amber-400 font-bold uppercase">💬 {{ sim.oarsPrompts['systolic'].title }}</span>
                  <button type="button" (click)="toggleCardFlip('systolic')" class="text-zinc-400 hover:text-white text-[10px] uppercase font-bold cursor-pointer">✕ Close</button>
                </div>
                <p class="text-zinc-200 italic leading-relaxed">"{{ sim.oarsPrompts['systolic'].readinessRulerQuestion }}"</p>
                <p class="text-zinc-400 text-[11px] leading-relaxed"><strong>Decisional Balance:</strong> {{ sim.oarsPrompts['systolic'].decisionalBalanceQuestion }}</p>
              </div>
            }
          </div>

        </div>
      </div>

      <!-- Multi-Paradigm Systemic Cross-Check HUD -->
      <div class="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-3 font-pocketgull-mono">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span class="text-xs uppercase font-bold tracking-wider text-zinc-300 flex items-center gap-2">
            <span>⚖️</span>
            <span>Multi-Paradigm Systemic Cross-Check Invariants</span>
          </span>
          <span class="text-[10px] text-zinc-500 font-normal">Real-time Invariant Evaluation</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          @for (chk of sim.multiParadigmChecks(); track chk.paradigm) {
            <div class="p-3.5 rounded-xl border flex flex-col justify-between gap-2"
                 [class.bg-emerald-950\/20]="chk.status === 'OPTIMAL'"
                 [class.border-emerald-500\/40]="chk.status === 'OPTIMAL'"
                 [class.bg-amber-950\/20]="chk.status === 'ADVISORY'"
                 [class.border-amber-500\/40]="chk.status === 'ADVISORY'"
                 [class.bg-red-950\/30]="chk.status === 'WARNING'"
                 [class.border-red-500\/50]="chk.status === 'WARNING'">
              
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider block mb-1"
                      [class.text-emerald-400]="chk.status === 'OPTIMAL'"
                      [class.text-amber-400]="chk.status === 'ADVISORY'"
                      [class.text-red-400]="chk.status === 'WARNING'">
                  {{ chk.paradigm }}
                </span>
                <p class="font-bold text-zinc-100 leading-snug">{{ chk.inquiry }}</p>
              </div>

              <p class="text-[11px] font-pocketgull-inter text-zinc-400 leading-relaxed pt-2 border-t border-zinc-900">
                {{ chk.biophysicalMechanism }}
              </p>
            </div>
          }
        </div>
      </div>

    </div>
  `
})
export class CounterfactualSimulatorComponent {
  sim = inject(CounterfactualSimulationService);

  activeTab = signal<'scenarios' | 'inversion'>('scenarios');
  flippedCards = signal<Record<string, boolean>>({
    hba1c: false,
    steps: false,
    hrv: false,
    systolic: false
  });

  toggleCardFlip(key: string): void {
    this.flippedCards.update(state => ({
      ...state,
      [key]: !state[key]
    }));
  }

  abs(val: number): number {
    return Math.abs(val);
  }

  getEventVal(event: Event): number {
    return parseFloat((event.target as HTMLInputElement).value);
  }

  formatDelta(val: number, unit: string): string {
    if (val > 0) return `+${val}${unit}`;
    if (val < 0) return `${val}${unit}`;
    return `No change`;
  }
}
