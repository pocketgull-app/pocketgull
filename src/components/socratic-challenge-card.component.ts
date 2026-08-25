import { Component, input, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ISocraticChallenge } from '../services/skeptical-epistemology.service';

/**
 * Inline Socratic challenge card for active recall during Bionic Reading mode.
 * Renders a clinical reasoning question with multiple-choice options,
 * instant feedback on selection, and a skip option.
 */
@Component({
  selector: 'app-socratic-challenge-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!isSkipped()) {
      <div class="my-4 rounded-xl border-l-4 border-amber-500 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 shadow-sm overflow-hidden transition-all duration-300"
           [class.opacity-50]="isSkipped()">

        <!-- Header -->
        <div class="px-4 py-2.5 bg-amber-100/50 dark:bg-amber-900/20 border-b border-amber-200/40 dark:border-amber-800/30 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-sm">🧠</span>
            <span class="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">Socratic Challenge</span>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md border shrink-0"
                  [class]="difficultyClass()">
              {{ challenge().difficulty }}
            </span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-[9px] font-mono font-bold text-amber-600/60 dark:text-amber-400/50 hidden sm:inline">{{ challenge().epistemicTag }}</span>
            @if (!isRevealed()) {
              <button (click)="skip()" class="text-[10px] font-semibold text-amber-600/60 dark:text-amber-400/40 hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer">
                Skip →
              </button>
            }
          </div>
        </div>

        <!-- Question -->
        <div class="px-4 pt-3 pb-2">
          <p class="text-sm font-semibold text-gray-800 dark:text-zinc-200 leading-relaxed">
            {{ challenge().question }}
          </p>
        </div>

        <!-- Options -->
        <div class="px-4 pb-3 space-y-1.5">
          @for (option of challenge().options; track $index) {
            <button (click)="selectOption($index)"
                    [disabled]="isRevealed()"
                    class="w-full text-left px-3 py-2 rounded-lg text-xs leading-relaxed transition-all duration-200 border cursor-pointer disabled:cursor-default"
                    [class]="getOptionClass($index)">
              <span class="inline-flex items-start gap-2">
                <span class="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold mt-0.5"
                      [class]="getRadioClass($index)">
                  @if (isRevealed() && $index === challenge().correctIndex) {
                    ✓
                  } @else if (isRevealed() && $index === selectedIndex() && $index !== challenge().correctIndex) {
                    ✗
                  } @else {
                    {{ optionLabels[$index] }}
                  }
                </span>
                <span>{{ option }}</span>
              </span>
            </button>
          }
        </div>

        <!-- Explanation (revealed after answer) -->
        @if (isRevealed()) {
          <div class="px-4 pb-4 animate-in slide-in-from-top-1 fade-in duration-300">
            <div class="p-3 rounded-lg border text-xs leading-relaxed"
                 [class]="isCorrect()
                   ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                   : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300'">
              <div class="flex items-center gap-1.5 mb-1">
                <span class="text-sm">{{ isCorrect() ? '✅' : '📚' }}</span>
                <span class="font-bold text-[10px] uppercase tracking-wider">
                  {{ isCorrect() ? 'Correct' : 'Learning Moment' }}
                </span>
              </div>
              <p>{{ challenge().explanation }}</p>
            </div>
          </div>
        }
      </div>
    }
  `
})
export class SocraticChallengeCardComponent {
  /** The Socratic challenge to render. */
  challenge = input.required<ISocraticChallenge>();

  /** Index of the user's selected option (-1 = no selection). */
  selectedIndex = signal<number>(-1);

  /** Whether the answer has been revealed. */
  isRevealed = signal(false);

  /** Whether the user chose to skip. */
  isSkipped = signal(false);

  /** Option labels for the radio buttons. */
  readonly optionLabels = ['A', 'B', 'C', 'D'];

  /** Whether the user's selection is correct. */
  isCorrect = computed(() => this.selectedIndex() === this.challenge().correctIndex);

  /** CSS classes for the difficulty badge. */
  difficultyClass = computed(() => {
    const d = this.challenge().difficulty;
    if (d === 'foundational') return 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-800';
    if (d === 'analytical') return 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-300 dark:border-violet-800';
    return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800';
  });

  /** Selects an option and reveals the answer. */
  selectOption(index: number): void {
    if (this.isRevealed()) return;
    this.selectedIndex.set(index);
    this.isRevealed.set(true);
  }

  /** Skips the challenge card. */
  skip(): void {
    this.isSkipped.set(true);
  }

  /** Returns CSS classes for an option button based on state. */
  getOptionClass(index: number): string {
    if (!this.isRevealed()) {
      return 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700 text-gray-700 dark:text-zinc-300';
    }

    if (index === this.challenge().correctIndex) {
      return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300 font-semibold';
    }

    if (index === this.selectedIndex()) {
      return 'bg-rose-50 dark:bg-rose-900/20 border-rose-400 dark:border-rose-600 text-rose-700 dark:text-rose-400 line-through opacity-70';
    }

    return 'bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800 text-gray-400 dark:text-zinc-500 opacity-50';
  }

  /** Returns CSS classes for the radio indicator based on state. */
  getRadioClass(index: number): string {
    if (!this.isRevealed()) {
      return 'border-gray-300 dark:border-zinc-600 text-gray-500 dark:text-zinc-400';
    }

    if (index === this.challenge().correctIndex) {
      return 'border-emerald-500 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40';
    }

    if (index === this.selectedIndex()) {
      return 'border-rose-500 dark:border-rose-400 text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40';
    }

    return 'border-gray-200 dark:border-zinc-700 text-gray-300 dark:text-zinc-600';
  }
}
