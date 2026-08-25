import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CounterfactualSimulationService } from '../services/counterfactual-simulation.service';

@Component({
  selector: 'app-counterfactual-simulator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-5 rounded-3xl bg-white/75 dark:bg-zinc-900/80 backdrop-blur-xl border border-emerald-500/20 dark:border-emerald-500/30 shadow-2xl space-y-5 animate-in fade-in duration-300">
      
      <!-- Header HUD -->
      <div class="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/80 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-lg">
            🔮
          </div>
          <div>
            <h3 class="text-sm font-black uppercase tracking-[0.15em] text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Counterfactual Health Simulator
              <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-500/30">What-If Sandbox</span>
            </h3>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400">
              Simulate physiological intervention targets in real time before prescribing to care plan.
            </p>
          </div>
        </div>

        @if (sim.hasActiveSimulation()) {
          <button 
            type="button"
            (click)="sim.resetDeltas()"
            class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl transition cursor-pointer">
            Reset Target
          </button>
        }
      </div>

      <!-- Real-Time Comparative Outcome Badges -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        <!-- SIBI Index Tile -->
        <div class="p-3.5 rounded-2xl bg-gradient-to-br from-white/90 to-zinc-50/80 dark:from-zinc-900/90 dark:to-zinc-800/60 border border-zinc-200/70 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            <span>Systemic Burden (SIBI)</span>
            <span class="text-xs font-mono font-bold">{{ sim.baselineSibiScore() }} → {{ sim.simulatedSibiScore() }}</span>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-2xl font-black text-zinc-900 dark:text-zinc-100">{{ sim.simulatedSibiScore() }} <span class="text-xs font-normal text-zinc-400">/ 10</span></span>
            @if (sim.sibiDelta() < 0) {
              <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ↓ {{ abs(sim.sibiDelta()) }} pts (Better)
              </span>
            } @else if (sim.sibiDelta() > 0) {
              <span class="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                ↑ {{ sim.sibiDelta() }} pts (Risk)
              </span>
            } @else {
              <span class="text-xs text-zinc-400 font-medium">Baseline</span>
            }
          </div>
        </div>

        <!-- 10-Yr CV Risk Tile -->
        <div class="p-3.5 rounded-2xl bg-gradient-to-br from-white/90 to-zinc-50/80 dark:from-zinc-900/90 dark:to-zinc-800/60 border border-zinc-200/70 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            <span>10-Year CV Risk</span>
            <span class="text-xs font-mono font-bold">{{ sim.baselineCvRisk() }}% → {{ sim.simulatedCvRisk() }}%</span>
          </div>
          <div class="mt-2 flex items-baseline justify-between">
            <span class="text-2xl font-black text-zinc-900 dark:text-zinc-100">{{ sim.simulatedCvRisk() }}%</span>
            @if (sim.cvRiskDelta() < 0) {
              <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ↓ {{ abs(sim.cvRiskDelta()) }}% (Lower)
              </span>
            } @else if (sim.cvRiskDelta() > 0) {
              <span class="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                ↑ {{ sim.cvRiskDelta() }}% (Higher)
              </span>
            } @else {
              <span class="text-xs text-zinc-400 font-medium">Baseline</span>
            }
          </div>
        </div>

        <!-- Action Target Banner -->
        <div class="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex flex-col justify-between">
          <div class="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Care Plan Handoff
          </div>
          <p class="text-[11px] text-zinc-600 dark:text-zinc-300 leading-snug mt-1">
            Commit counterfactual targets directly to the active patient profile state.
          </p>
          <button
            type="button"
            (click)="sim.applySimulationToPatientState()"
            [disabled]="!sim.hasActiveSimulation()"
            class="mt-2 w-full min-h-[36px] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition rounded-xl disabled:opacity-30 disabled:cursor-not-allowed shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Apply Target to Care Plan</span>
          </button>
        </div>

      </div>

      <!-- Sliders Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">

        <!-- 1. HbA1c Slider -->
        <div class="p-3.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/80 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold">
            <span class="text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <span>🩸</span>
              <span>HbA1c Target (Baseline: {{ sim.baselineHbA1c() }}%)</span>
            </span>
            <span class="text-emerald-700 dark:text-emerald-300 font-mono font-bold">{{ sim.simulatedHbA1c() }}% ({{ formatDelta(sim.deltaHbA1c(), '%') }})</span>
          </div>
          <input 
            type="range"
            min="-2.0"
            max="2.0"
            step="0.1"
            [value]="sim.deltaHbA1c()"
            (input)="sim.deltaHbA1c.set(getEventVal($event))"
            class="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
          >
          <div class="flex justify-between text-[10px] font-mono text-zinc-400">
            <span>-2.0% (Aggressive target)</span>
            <span>+2.0%</span>
          </div>
        </div>

        <!-- 2. Daily Steps Slider -->
        <div class="p-3.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/80 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold">
            <span class="text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <span>👟</span>
              <span>Daily Physical Activity (Baseline: {{ sim.baselineSteps() }} steps)</span>
            </span>
            <span class="text-emerald-700 dark:text-emerald-300 font-mono font-bold">{{ sim.simulatedSteps() }} steps ({{ formatDelta(sim.deltaSteps(), ' steps') }})</span>
          </div>
          <input 
            type="range"
            min="-4000"
            max="5000"
            step="500"
            [value]="sim.deltaSteps()"
            (input)="sim.deltaSteps.set(getEventVal($event))"
            class="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
          >
          <div class="flex justify-between text-[10px] font-mono text-zinc-400">
            <span>-4,000 steps</span>
            <span>+5,000 steps (High activity)</span>
          </div>
        </div>

        <!-- 3. HRV RMSSD Slider -->
        <div class="p-3.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/80 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold">
            <span class="text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <span>🫀</span>
              <span>HRV Autonomic Tone (Baseline: {{ sim.baselineHrv() }} ms)</span>
            </span>
            <span class="text-emerald-700 dark:text-emerald-300 font-mono font-bold">{{ sim.simulatedHrv() }} ms ({{ formatDelta(sim.deltaHrv(), ' ms') }})</span>
          </div>
          <input 
            type="range"
            min="-20"
            max="40"
            step="2"
            [value]="sim.deltaHrv()"
            (input)="sim.deltaHrv.set(getEventVal($event))"
            class="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
          >
          <div class="flex justify-between text-[10px] font-mono text-zinc-400">
            <span>-20 ms</span>
            <span>+40 ms (Vagal boost)</span>
          </div>
        </div>

        <!-- 4. Systolic BP Slider -->
        <div class="p-3.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/80 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold">
            <span class="text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <span>🩺</span>
              <span>Systolic Blood Pressure (Baseline: {{ sim.baselineSystolic() }} mmHg)</span>
            </span>
            <span class="text-emerald-700 dark:text-emerald-300 font-mono font-bold">{{ sim.simulatedSystolic() }} mmHg ({{ formatDelta(sim.deltaSystolic(), ' mmHg') }})</span>
          </div>
          <input 
            type="range"
            min="-30"
            max="30"
            step="2"
            [value]="sim.deltaSystolic()"
            (input)="sim.deltaSystolic.set(getEventVal($event))"
            class="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
          >
          <div class="flex justify-between text-[10px] font-mono text-zinc-400">
            <span>-30 mmHg (Target lowering)</span>
            <span>+30 mmHg</span>
          </div>
        </div>

      </div>

    </div>
  `
})
export class CounterfactualSimulatorComponent {
  sim = inject(CounterfactualSimulationService);

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
