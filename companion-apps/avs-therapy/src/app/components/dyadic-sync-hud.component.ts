import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DyadicCoRegulationService } from '../services/dyadic-co-regulation.service';

@Component({
  selector: 'app-dyadic-sync-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-rose-500/20 bg-rose-950/20 p-5 space-y-4 backdrop-blur-sm">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-rose-500/15 pb-3">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3 class="text-xs font-black uppercase tracking-widest text-rose-300">
            Dyadic Co-Regulation & Relational Entrainment
          </h3>
        </div>

        <span class="text-[9px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold uppercase tracking-wider">
          {{ dyadic.harmonyState() }}
        </span>
      </div>

      <!-- Dual Participant Synchronization Stage -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Participant 1 -->
        <div class="p-3.5 rounded-xl bg-zinc-950/70 border border-rose-500/20 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{{ dyadic.participant1Name() }}</span>
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          <div class="flex items-baseline justify-between pt-1">
            <div>
              <div class="text-lg font-black text-rose-300 font-mono">{{ dyadic.p1HeartRateBpm() }} <span class="text-xs font-normal text-zinc-400">BPM</span></div>
              <div class="text-[9px] text-zinc-500">Optical Heart Rate</div>
            </div>
            <div class="text-right">
              <div class="text-lg font-black text-cyan-300 font-mono">{{ dyadic.p1BreathingBpm() }} <span class="text-xs font-normal text-zinc-400">BPM</span></div>
              <div class="text-[9px] text-zinc-500">Resonant Pacing</div>
            </div>
          </div>
        </div>

        <!-- Participant 2 -->
        <div class="p-3.5 rounded-xl bg-zinc-950/70 border border-rose-500/20 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{{ dyadic.participant2Name() }}</span>
            <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          </div>

          <div class="flex items-baseline justify-between pt-1">
            <div>
              <div class="text-lg font-black text-rose-300 font-mono">{{ dyadic.p2HeartRateBpm() }} <span class="text-xs font-normal text-zinc-400">BPM</span></div>
              <div class="text-[9px] text-zinc-500">Optical Heart Rate</div>
            </div>
            <div class="text-right">
              <div class="text-lg font-black text-cyan-300 font-mono">{{ dyadic.p2BreathingBpm() }} <span class="text-xs font-normal text-zinc-400">BPM</span></div>
              <div class="text-[9px] text-zinc-500">Resonant Pacing</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dyadic Coherence Progress & Cross-Correlation Score -->
      <div class="p-3.5 bg-zinc-950/60 rounded-xl border border-rose-500/10 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="text-[9px] uppercase tracking-wider font-bold text-zinc-400">Dyadic Cross-Correlation Coherence</span>
          <span class="font-black text-rose-400 font-mono text-sm">{{ dyadic.dyadicCoherenceIndex() }}%</span>
        </div>

        <div class="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden">
          <div class="h-full bg-gradient-to-r from-rose-500 via-purple-500 to-emerald-400 transition-all duration-500"
               [style.width.%]="dyadic.dyadicCoherenceIndex()"></div>
        </div>

        <div class="flex justify-between items-center text-[9px] text-zinc-500 font-mono pt-1">
          <span>Phase Offset: {{ dyadic.phaseLockDegree() }}° (Near In-Phase)</span>
          <span>Somatic Trauma Alignment: Optimized</span>
        </div>
      </div>
    </div>
  `
})
export class DyadicSyncHudComponent {
  readonly dyadic = inject(DyadicCoRegulationService);
}
