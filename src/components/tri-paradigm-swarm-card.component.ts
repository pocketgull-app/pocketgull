import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriParadigmSwarmService, ITriParadigmDebate } from '../services/tri-paradigm-swarm.service';

@Component({
  selector: 'app-tri-paradigm-swarm-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-5 rounded-3xl bg-zinc-950/90 border border-violet-500/30 text-zinc-100 shadow-xl font-mono backdrop-blur-xl">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-zinc-800/80 pb-4">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">🐝</span>
          <div>
            <h3 class="text-sm font-extrabold uppercase tracking-widest text-violet-400">
              Tri-Paradigm Autonomous Swarm Consensus
            </h3>
            <p class="text-[11px] text-zinc-400">
              Multi-Agent Clinical Debate & Cross-Specialty Differential Diagnostics
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          @if (swarm.currentDebate(); as debate) {
            <span class="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Consensus: {{ debate.overallConsensusScore }}%
            </span>
          }

          <button (click)="runDebate()" [disabled]="swarm.isDebating()"
            class="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50 cursor-pointer">
            {{ swarm.isDebating() ? 'Synthesizing Debate...' : '⚡ Run Swarm Debate' }}
          </button>
        </div>
      </div>

      <!-- Debate Body -->
      @if (swarm.currentDebate(); as debate) {
        <!-- 3 Specialist Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <!-- Western Allopathic -->
          <div class="p-4 rounded-2xl bg-zinc-900/90 border border-sky-500/30 space-y-2.5">
            <div class="flex items-center gap-2 border-b border-zinc-800 pb-2">
              <span class="text-lg">{{ debate.perspectives.western.avatarIcon }}</span>
              <span class="text-xs font-bold text-sky-400 truncate">{{ debate.perspectives.western.specialistName }}</span>
            </div>
            <p class="text-[11px] text-zinc-300 leading-relaxed font-semibold">
              {{ debate.perspectives.western.primaryDiagnosis }}
            </p>
            <div class="space-y-1">
              <span class="text-[10px] uppercase font-bold text-zinc-500 block">Interventions</span>
              <ul class="text-[10px] text-zinc-400 space-y-1 list-disc list-inside">
                @for (item of debate.perspectives.western.keyInterventions; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          </div>

          <!-- Eastern TCM Zang-Fu -->
          <div class="p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/30 space-y-2.5">
            <div class="flex items-center gap-2 border-b border-zinc-800 pb-2">
              <span class="text-lg">{{ debate.perspectives.eastern.avatarIcon }}</span>
              <span class="text-xs font-bold text-amber-400 truncate">{{ debate.perspectives.eastern.specialistName }}</span>
            </div>
            <p class="text-[11px] text-zinc-300 leading-relaxed font-semibold">
              {{ debate.perspectives.eastern.primaryDiagnosis }}
            </p>
            <div class="space-y-1">
              <span class="text-[10px] uppercase font-bold text-zinc-500 block">Interventions</span>
              <ul class="text-[10px] text-zinc-400 space-y-1 list-disc list-inside">
                @for (item of debate.perspectives.eastern.keyInterventions; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          </div>

          <!-- Functional Bio-Hacker -->
          <div class="p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 space-y-2.5">
            <div class="flex items-center gap-2 border-b border-zinc-800 pb-2">
              <span class="text-lg">{{ debate.perspectives.functional.avatarIcon }}</span>
              <span class="text-xs font-bold text-emerald-400 truncate">{{ debate.perspectives.functional.specialistName }}</span>
            </div>
            <p class="text-[11px] text-zinc-300 leading-relaxed font-semibold">
              {{ debate.perspectives.functional.primaryDiagnosis }}
            </p>
            <div class="space-y-1">
              <span class="text-[10px] uppercase font-bold text-zinc-500 block">Interventions</span>
              <ul class="text-[10px] text-zinc-400 space-y-1 list-disc list-inside">
                @for (item of debate.perspectives.functional.keyInterventions; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            </div>
          </div>
        </div>

        <!-- Consensus & Divergence Accordion -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-5">
          <div class="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20">
            <span class="text-emerald-400 font-extrabold uppercase text-[11px] tracking-wider block mb-2">
              ✓ Points of Consensus
            </span>
            <ul class="space-y-1.5 text-zinc-300 text-[11px] list-disc list-inside">
              @for (point of debate.pointsOfConsensus; track point) {
                <li>{{ point }}</li>
              }
            </ul>
          </div>

          <div class="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/20">
            <span class="text-amber-400 font-extrabold uppercase text-[11px] tracking-wider block mb-2">
              ⚠️ Divergent Diagnostic Flags
            </span>
            <ul class="space-y-1.5 text-zinc-300 text-[11px] list-disc list-inside">
              @for (point of debate.divergentPoints; track point) {
                <li>{{ point }}</li>
              }
            </ul>
          </div>
        </div>

        <!-- Synthesized Action Plan -->
        <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
          <span class="text-violet-400 font-extrabold uppercase tracking-widest block mb-2 text-[11px]">
            📋 Unified Multi-Paradigm Action Plan
          </span>
          <p class="text-zinc-200 whitespace-pre-line text-[11px] leading-relaxed font-sans font-medium">
            {{ debate.synthesizedClinicalPlan }}
          </p>
        </div>
      } @else {
        <div class="py-8 text-center text-zinc-500 text-xs font-mono">
          Click <strong class="text-violet-400">Run Swarm Debate</strong> to initiate parallel diagnostic evaluation across Western, Eastern, and Functional Medicine specialist agents.
        </div>
      }
    </div>
  `
})
export class TriParadigmSwarmCardComponent {
  readonly swarm = inject(TriParadigmSwarmService);

  runDebate(): void {
    this.swarm.executeSwarmDebate();
  }
}
