import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoricalLuminariesGameService, ILuminaryCase } from '../services/historical-luminaries-game.service';

@Component({
  selector: 'app-historical-luminaries-game',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-3xl bg-zinc-950/95 text-zinc-100 border border-amber-500/30 shadow-2xl space-y-6 animate-in fade-in duration-300">
      
      <!-- Top Game Header HUD -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl shadow-xs">
            {{ activeCase().avatarEmoji }}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base sm:text-lg font-black tracking-wider text-white">
                Historical Luminaries Clinical Mystery Arena
              </h3>
              <span class="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                Case {{ currentCaseIndex() + 1 }} / {{ allCases().length }}
              </span>
            </div>
            <p class="text-xs text-zinc-400">
              Solve retrospective diagnostic mysteries of legendary scientific and medical luminaries using historical clues and Bayesian reasoning.
            </p>
          </div>
        </div>

        <!-- Score & Progression HUD -->
        <div class="flex items-center gap-3 self-start md:self-auto">
          <div class="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-2">
            <span class="text-xs text-zinc-400 font-mono">Arena Score:</span>
            <span class="text-sm font-black font-mono text-amber-400">{{ score() }} pts</span>
          </div>
          <button (click)="resetGame()"
                  class="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-mono transition cursor-pointer">
            🔄 Reset
          </button>
        </div>
      </div>

      <!-- Luminary Profile Banner -->
      <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2 relative overflow-hidden">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
          <div>
            <h4 class="text-base font-black text-white flex items-center gap-2">
              <span>{{ activeCase().luminaryName }}</span>
              <span class="text-xs font-mono text-zinc-400 font-normal">({{ activeCase().lifeSpan }})</span>
            </h4>
            <span class="text-xs font-semibold text-amber-400/90">{{ activeCase().fieldOfPioneering }}</span>
          </div>

          <div class="px-3 py-1 rounded-xl bg-zinc-800 text-xs font-mono text-zinc-300 border border-zinc-700">
            Clue Phase: <strong class="text-cyan-400">{{ clueRound() }} of 3</strong>
          </div>
        </div>

        <p class="text-xs text-zinc-300 leading-relaxed font-sans pt-1">
          {{ activeCase().historicalContext }}
        </p>

        <blockquote class="text-[11px] text-amber-300/80 italic font-serif border-l-2 border-amber-500/40 pl-3 mt-2">
          "{{ activeCase().quote }}"
        </blockquote>

        <!-- HealthQuest & Hardship Chronicles Card -->
        <div class="mt-4 p-4 rounded-2xl bg-zinc-950/80 border border-amber-500/20 space-y-3">
          <div class="flex items-center justify-between">
            <h5 class="text-xs font-mono uppercase font-black tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>🩺 The HealthQuest & Hardship Chronicle</span>
            </h5>
            <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Heroic Endurance
            </span>
          </div>

          <p class="text-xs text-zinc-300 leading-relaxed">
            {{ activeCase().healthQuestNarrative }}
          </p>

          <!-- 2-Column Hardships Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <!-- Physical & Medical Hardships -->
            <div class="p-3 rounded-xl bg-zinc-900/90 border border-red-500/20 space-y-1.5">
              <h6 class="text-[11px] font-mono font-black uppercase text-rose-400 flex items-center gap-1">
                <span>⚡ Physical Suffering & Illness:</span>
              </h6>
              <ul class="text-[11px] text-zinc-300 space-y-1 list-disc list-inside">
                @for (hardship of activeCase().physicalHardships; track hardship) {
                  <li>{{ hardship }}</li>
                }
              </ul>
            </div>

            <!-- Societal, Isolation & Personal Battles -->
            <div class="p-3 rounded-xl bg-zinc-900/90 border border-purple-500/20 space-y-1.5">
              <h6 class="text-[11px] font-mono font-black uppercase text-purple-400 flex items-center gap-1">
                <span>🛡️ Societal & Personal Battles:</span>
              </h6>
              <ul class="text-[11px] text-zinc-300 space-y-1 list-disc list-inside">
                @for (battle of activeCase().societalAndPersonalHardships; track battle) {
                  <li>{{ battle }}</li>
                }
              </ul>
            </div>
          </div>

          <!-- Resilience & Human Spirit Triumph -->
          <div class="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
            <span class="font-mono font-black uppercase text-emerald-400 text-[10px] block">
              🌟 Triumph of the Human Spirit:
            </span>
            <p class="text-zinc-200 text-[11px] leading-relaxed">
              {{ activeCase().resilienceTriumph }}
            </p>
          </div>
        </div>
      </div>

      <!-- Socratic Clue Rounds (Accordion / Progressive Unfold) -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-mono uppercase font-bold text-zinc-400">
            🔍 Historical Socratic Evidence & Primary Source Diaries
          </h4>
          @if (clueRound() < 3 && !isResolved()) {
            <button (click)="advanceClue()"
                    class="px-3 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5">
              <span>Unfold Clue {{ clueRound() + 1 }} →</span>
            </button>
          }
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          @for (clue of activeCase().clues; track clue.round) {
            <div class="p-4 rounded-2xl border transition duration-200 space-y-2"
                 [class.border-cyan-500]="clueRound() >= clue.round"
                 [class.bg-zinc-900]="clueRound() >= clue.round"
                 [class.opacity-100]="clueRound() >= clue.round"
                 [class.border-zinc-850]="clueRound() < clue.round"
                 [class.bg-zinc-950/50]="clueRound() < clue.round"
                 [class.opacity-40]="clueRound() < clue.round">
              
              <div class="flex items-center justify-between text-xs">
                <span class="font-mono font-bold text-cyan-400">ROUND {{ clue.round }}</span>
                <span class="text-[10px] font-mono text-zinc-500">{{ clue.sourceDate }}</span>
              </div>

              <h5 class="text-xs font-bold text-white">{{ clue.phaseTitle }}</h5>

              @if (clueRound() >= clue.round) {
                <p class="text-[11px] text-zinc-300 leading-relaxed font-sans">
                  "{{ clue.excerpt }}"
                </p>
                <div class="pt-2 border-t border-zinc-800 text-[10px] font-mono text-amber-300">
                  🔬 Sign: <strong>{{ clue.clinicalSign }}</strong>
                </div>
              } @else {
                <div class="py-6 text-center text-xs font-mono text-zinc-600">
                  🔒 Locked (Click "Unfold Clue")
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Diagnostic Options Grid -->
      <div class="space-y-3">
        <h4 class="text-xs font-mono uppercase font-bold text-zinc-400">
          🎯 Formulate Retrospective Differential Diagnosis:
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          @for (option of activeCase().options; track option.id) {
            <button (click)="makeDiagnosis(option.id)"
                    [disabled]="isResolved()"
                    [class.border-emerald-500]="isResolved() && option.isHistoricallyAccepted"
                    [class.bg-emerald-950/40]="isResolved() && option.isHistoricallyAccepted"
                    [class.border-rose-500]="isResolved() && selectedOptionId() === option.id && !option.isHistoricallyAccepted"
                    [class.bg-rose-950/40]="isResolved() && selectedOptionId() === option.id && !option.isHistoricallyAccepted"
                    [class.border-zinc-800]="!isResolved() || (selectedOptionId() !== option.id && !option.isHistoricallyAccepted)"
                    [class.bg-zinc-900/80]="!isResolved() || (selectedOptionId() !== option.id && !option.isHistoricallyAccepted)"
                    class="p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer disabled:cursor-default flex flex-col justify-between space-y-2 hover:border-amber-500/50">
              
              <div class="flex items-start justify-between gap-2">
                <span class="text-xs font-bold text-white leading-snug">{{ option.diagnosisName }}</span>
                <span class="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono font-bold text-zinc-400 shrink-0">
                  {{ option.bayesianPlausibility }}% prior
                </span>
              </div>

              @if (isResolved()) {
                <p class="text-[11px] leading-snug pt-1 border-t border-zinc-800/80"
                   [class.text-emerald-300]="option.isHistoricallyAccepted"
                   [class.text-rose-300]="selectedOptionId() === option.id && !option.isHistoricallyAccepted"
                   [class.text-zinc-500]="selectedOptionId() !== option.id && !option.isHistoricallyAccepted">
                  {{ option.scientificRationale }}
                </p>
              }
            </button>
          }
        </div>
      </div>

      <!-- Case Resolved Banner & Teaching Pearl -->
      @if (isResolved()) {
        <div class="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-amber-950/30 border border-emerald-500/40 space-y-3 animate-in zoom-in-95 duration-300">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🏆</span>
              <div>
                <h4 class="text-sm font-black text-white">Confirmed Historical Diagnosis</h4>
                <p class="text-xs font-mono text-emerald-400 font-bold">{{ activeCase().confirmedHistoricalDiagnosis }}</p>
              </div>
            </div>

            <button (click)="nextLuminaryCase()"
                    class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs font-mono uppercase tracking-wider transition cursor-pointer shadow-md">
              Next Luminary Case →
            </button>
          </div>

          <div class="space-y-2 text-xs">
            <div class="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300">
              💡 <strong>Clinical Teaching Pearl:</strong> {{ activeCase().clinicalTeachingPearl }}
            </div>
            <div class="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-200">
              🏛️ <strong>Legacy Monument:</strong> {{ activeCase().monumentTribute }}
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class HistoricalLuminariesGameComponent {
  private gameService = inject(HistoricalLuminariesGameService);

  activeCase = computed<ILuminaryCase>(() => this.gameService.getCurrentCase());
  allCases = computed(() => this.gameService.getAllCases());
  currentCaseIndex = computed(() => this.gameService.currentCaseIndex());
  clueRound = computed(() => this.gameService.currentClueRound());
  selectedOptionId = computed(() => this.gameService.selectedOptionId());
  isResolved = computed(() => this.gameService.isCaseResolved());
  score = computed(() => this.gameService.score());

  advanceClue(): void {
    this.gameService.advanceClue();
  }

  makeDiagnosis(optionId: string): void {
    this.gameService.submitDiagnosis(optionId);
  }

  nextLuminaryCase(): void {
    this.gameService.nextCase();
  }

  resetGame(): void {
    this.gameService.resetGame();
  }
}
