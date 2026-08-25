import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocraticRoundsService, ISocraticDebateMessage, IDifferentialCandidate } from '../services/socratic-rounds.service';

@Component({
  selector: 'app-socratic-rounds-hud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-zinc-950/95 rounded-2xl border border-zinc-800 shadow-2xl p-4 text-zinc-100 flex flex-col gap-4 font-sans">
      
      <!-- Top Clinical Rounds Header HUD -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-mono text-lg font-bold shadow-inner">
            🩺
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-semibold text-zinc-100 tracking-wide uppercase font-mono">
                Autonomous Socratic Clinical Rounds
              </h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider"
                [ngClass]="roundsService.consensusTier().bg + ' ' + roundsService.consensusTier().color">
                {{ roundsService.consensusTier().label }}
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">
              Case: <span class="text-teal-300 font-medium">{{ roundsService.selectedCaseTopic() }}</span>
            </p>
          </div>
        </div>

        <!-- Consensus Dial & Status -->
        <div class="flex items-center gap-4 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-xl">
          <div class="flex flex-col items-end">
            <span class="text-[10px] uppercase font-mono text-zinc-400 font-semibold tracking-wider">Bayesian Consensus</span>
            <span class="text-sm font-mono font-bold tabular-nums text-teal-300">
              {{ (roundsService.consensusScore() * 100).toFixed(1) }}%
            </span>
          </div>
          <!-- Mini SVG Radial Progress -->
          <div class="relative w-8 h-8 flex items-center justify-center">
            <svg class="w-8 h-8 -rotate-90 transform" viewBox="0 0 36 36">
              <path
                class="text-zinc-800"
                stroke-width="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                class="text-teal-400 transition-all duration-500 ease-out"
                stroke-dasharray="100, 100"
                [attr.stroke-dashoffset]="100 - (roundsService.consensusScore() * 100)"
                stroke-width="3.5"
                stroke-linecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Main Dual Panel: Left = Debate Transcript, Right = Differential Diagnostic Matrix -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        <!-- Left: Real-Time Socratic Debate Transcript (7 Cols) -->
        <div class="lg:col-span-7 flex flex-col gap-3">
          <div class="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
            <span>Rounds Stream (Turn #{{ roundsService.currentTurn() }})</span>
            <span class="text-teal-400">Popperian Falsifier vs. Systems Biology</span>
          </div>

          <div class="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
            @for (msg of roundsService.debateMessages(); track msg.id) {
              <div 
                class="p-3.5 rounded-xl border transition-all duration-200"
                [class.bg-zinc-900-50]="msg.speaker === 'moderator'"
                [class.border-zinc-800]="msg.speaker === 'moderator'"
                [class.bg-indigo-950-20]="msg.speaker === 'dr_skeptic'"
                [class.border-indigo-500-30]="msg.speaker === 'dr_skeptic'"
                [class.bg-teal-950-20]="msg.speaker === 'dr_pragmatist'"
                [class.border-teal-500-30]="msg.speaker === 'dr_pragmatist'">
                
                <!-- Speaker Header Badge -->
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold font-mono"
                      [class.text-indigo-400]="msg.speaker === 'dr_skeptic'"
                      [class.text-teal-400]="msg.speaker === 'dr_pragmatist'"
                      [class.text-amber-400]="msg.speaker === 'moderator'">
                      {{ msg.speakerName }}
                    </span>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-zinc-800/80 font-mono text-zinc-300 border border-zinc-700/50">
                      {{ msg.speakerBadge }}
                    </span>
                  </div>
                  <span class="text-[10px] font-mono text-zinc-500 tabular-nums">{{ msg.timestamp }}</span>
                </div>

                <!-- Message Body -->
                <p class="text-xs text-zinc-200 leading-relaxed">
                  {{ msg.message }}
                </p>

                <!-- Epistemology / Protocol Metadata Footer -->
                @if (msg.pValueNullHypothesis !== undefined || msg.therapeuticProtocol) {
                  <div class="mt-2.5 pt-2 border-t border-zinc-800/60 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                    @if (msg.pValueNullHypothesis !== undefined) {
                      <span class="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        H₀ p = {{ msg.pValueNullHypothesis }}
                      </span>
                    }
                    @if (msg.cochraneRoB) {
                      <span class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        Cochrane RoB: {{ msg.cochraneRoB }}
                      </span>
                    }
                    @if (msg.therapeuticProtocol) {
                      <span class="px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                        Rx: {{ msg.therapeuticProtocol }}
                      </span>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <!-- Clinician Input / Advance Round Bar -->
          <div class="flex items-center gap-2 mt-1">
            <input 
              type="text" 
              [(ngModel)]="userDirective" 
              (keyup.enter)="dispatchTurn()"
              placeholder="Enter clinical directive or diagnostic hypothesis..."
              class="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/60 min-h-[44px]"
            />
            <button 
              (click)="dispatchTurn()"
              class="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-zinc-950 font-bold text-xs rounded-xl transition shadow-lg shadow-teal-900/30 flex items-center gap-1.5 min-h-[44px] touch-manipulation font-mono">
              <span>Advance Round</span>
              <span>⚡</span>
            </button>
          </div>
        </div>

        <!-- Right: Real-Time Differential Diagnostic Matrix (5 Cols) -->
        <div class="lg:col-span-5 flex flex-col gap-3 bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl">
          <div class="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span class="font-semibold text-zinc-200">Differential Diagnostic Matrix</span>
            <span class="text-[10px] text-teal-400">LR & Prior/Posterior</span>
          </div>

          <div class="flex flex-col gap-2.5">
            @for (candidate of roundsService.differentialRankings(); track candidate.name) {
              <div class="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 hover:border-teal-500/40 transition">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <h4 class="text-xs font-medium text-zinc-200 leading-snug">{{ candidate.name }}</h4>
                    <span class="text-[10px] font-mono text-teal-400">{{ candidate.icd10 }}</span>
                  </div>
                  <div class="flex flex-col items-end">
                    <span class="text-xs font-bold font-mono tabular-nums text-teal-300">
                      {{ (candidate.posteriorProbability * 100).toFixed(0) }}%
                    </span>
                    <span class="text-[9px] font-mono text-zinc-500">
                      LR: {{ candidate.likelihoodRatio.toFixed(2) }}
                    </span>
                  </div>
                </div>

                <!-- Probability Bar -->
                <div class="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    class="bg-gradient-to-r from-teal-500 to-amber-400 h-full rounded-full transition-all duration-500"
                    [style.width.%]="candidate.posteriorProbability * 100">
                  </div>
                </div>

                <!-- Key Biomarker & p-Value Indicator -->
                <div class="mt-2 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span class="truncate max-w-[170px]" [title]="candidate.keyBiomarker">
                    🔬 {{ candidate.keyBiomarker }}
                  </span>
                  <span [class.text-emerald-400]="candidate.pValueNullHypothesis < 0.05" [class.text-rose-400]="candidate.pValueNullHypothesis >= 0.05">
                    p={{ candidate.pValueNullHypothesis.toFixed(3) }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>

      </div>

    </div>
  `
})
export class SocraticRoundsHudComponent {
  readonly roundsService = inject(SocraticRoundsService);
  userDirective = '';

  dispatchTurn(): void {
    const text = this.userDirective.trim();
    this.roundsService.advanceDebateRound(text || undefined);
    this.userDirective = '';
  }
}
