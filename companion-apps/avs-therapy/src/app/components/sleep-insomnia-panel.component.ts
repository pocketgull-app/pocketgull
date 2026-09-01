import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SleepInsomniaProtocolService, SleepPhase } from '../services/sleep-insomnia-protocol.service';

@Component({
  selector: 'app-sleep-insomnia-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-5 space-y-4 backdrop-blur-sm">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-indigo-500/15 pb-3">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <h3 class="text-xs font-black uppercase tracking-widest text-indigo-300">
            Tri-Phase Sleep Inception & Insomnia Architecture
          </h3>
        </div>

        <div class="flex items-center gap-2">
          @if (!sleep.isSessionRunning()) {
            <button (click)="sleep.startInsomniaProtocol()"
                    class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold tracking-wider uppercase transition-all shadow-md flex items-center gap-1.5 cursor-pointer">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Start Sleep Induction
            </button>
          } @else {
            <button (click)="sleep.pauseSession()"
                    class="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              Pause
            </button>
            <button (click)="sleep.stopSession()"
                    class="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer">
              Stop
            </button>
          }
        </div>
      </div>

      <!-- Sleep Timeline Progression -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <!-- Phase 1 -->
        <div (click)="sleep.setPhase('alpha-descent')"
             class="p-3 rounded-lg border text-left transition-all cursor-pointer relative overflow-hidden"
             [class.border-indigo-400]="sleep.currentPhase() === 'alpha-descent'"
             [class.bg-indigo-500/20]="sleep.currentPhase() === 'alpha-descent'"
             [class.border-zinc-800]="sleep.currentPhase() !== 'alpha-descent'"
             [class.bg-zinc-900/40]="sleep.currentPhase() !== 'alpha-descent'">
          <div class="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Phase I (15m)</div>
          <div class="text-xs font-bold text-zinc-100 mt-1">Alpha-Theta Descent</div>
          <div class="text-[9px] text-zinc-400 mt-0.5">10.0 Hz → 4.5 Hz · 5.5 BPM</div>
        </div>

        <!-- Phase 2 -->
        <div (click)="sleep.setPhase('spindle-induction')"
             class="p-3 rounded-lg border text-left transition-all cursor-pointer relative overflow-hidden"
             [class.border-indigo-400]="sleep.currentPhase() === 'spindle-induction'"
             [class.bg-indigo-500/20]="sleep.currentPhase() === 'spindle-induction'"
             [class.border-zinc-800]="sleep.currentPhase() !== 'spindle-induction'"
             [class.bg-zinc-900/40]="sleep.currentPhase() !== 'spindle-induction'">
          <div class="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Phase II (10m)</div>
          <div class="text-xs font-bold text-zinc-100 mt-1">Spindle & K-Complex</div>
          <div class="text-[9px] text-zinc-400 mt-0.5">13.5 Hz Micro-Bursts · 4.5 BPM</div>
          @if (sleep.sleepSpindleActive()) {
            <span class="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-amber-500 text-black text-[8px] font-black animate-pulse">SPINDLE</span>
          }
        </div>

        <!-- Phase 3 -->
        <div (click)="sleep.setPhase('slow-wave-delta')"
             class="p-3 rounded-lg border text-left transition-all cursor-pointer relative overflow-hidden"
             [class.border-indigo-400]="sleep.currentPhase() === 'slow-wave-delta'"
             [class.bg-indigo-500/20]="sleep.currentPhase() === 'slow-wave-delta'"
             [class.border-zinc-800]="sleep.currentPhase() !== 'slow-wave-delta'"
             [class.bg-zinc-900/40]="sleep.currentPhase() !== 'slow-wave-delta'">
          <div class="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Phase III (30m)</div>
          <div class="text-xs font-bold text-zinc-100 mt-1">Slow-Wave Delta (PLAS)</div>
          <div class="text-[9px] text-zinc-400 mt-0.5">0.8 Hz – 1.8 Hz · 3.5 BPM</div>
        </div>

        <!-- Wake Booster -->
        <div (click)="sleep.startCarAwakeningProtocol()"
             class="p-3 rounded-lg border text-left transition-all cursor-pointer relative overflow-hidden"
             [class.border-amber-400]="sleep.currentPhase() === 'car-awakening'"
             [class.bg-amber-500/15]="sleep.currentPhase() === 'car-awakening'"
             [class.border-zinc-800]="sleep.currentPhase() !== 'car-awakening'"
             [class.bg-zinc-900/40]="sleep.currentPhase() !== 'car-awakening'">
          <div class="text-[9px] font-black text-amber-400 uppercase tracking-widest">Morning Wake</div>
          <div class="text-xs font-bold text-zinc-100 mt-1">CAR 40Hz Awakening</div>
          <div class="text-[9px] text-zinc-400 mt-0.5">Adenosine Clearance Booster</div>
        </div>
      </div>

      <!-- Sleep Telemetry Summary Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/60 p-3.5 rounded-xl border border-indigo-500/10">
        <div>
          <span class="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Current Frequency</span>
          <div class="text-lg font-black text-indigo-300 font-mono">{{ sleep.dynamicTargetHz() }} Hz</div>
        </div>

        <div>
          <span class="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Respiration Guide</span>
          <div class="text-lg font-black text-emerald-400 font-mono">{{ sleep.dynamicBreathingBpm() }} BPM</div>
        </div>

        <div>
          <span class="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Glymphatic Wash Score</span>
          <div class="text-lg font-black text-cyan-300 font-mono">{{ sleep.glymphaticClearanceScore() }}%</div>
        </div>

        <div>
          <span class="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Est. Sleep Latency</span>
          <div class="text-lg font-black text-amber-300 font-mono">{{ sleep.estimatedSleepLatencyMin() }} min</div>
        </div>
      </div>
    </div>
  `
})
export class SleepInsomniaPanelComponent {
  readonly sleep = inject(SleepInsomniaProtocolService);
}
