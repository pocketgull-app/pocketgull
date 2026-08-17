import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JoyPlayfulFlourishingService } from '../services/joy-playful-flourishing.service';

@Component({
  selector: 'app-joy-playful-flourishing-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-purple-500/10 dark:from-amber-950/30 dark:via-rose-950/20 dark:to-purple-950/30 rounded-2xl p-6 border border-amber-500/30 shadow-lg relative overflow-hidden">
      <!-- Glow decoration -->
      <div class="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"></div>

      <div class="relative z-10">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-amber-500/20">
          <div class="flex items-center gap-3">
            <span class="text-3xl">☀️</span>
            <div>
              <h3 class="text-base font-extrabold text-gray-900 dark:text-zinc-100 uppercase tracking-widest">
                Joy & Playful Flourishing Matrix
              </h3>
              <p class="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                 Seligman's PERMA+ Micro-Play & Rhythm Prescriptions ("Fun as Medicine")
              </p>
            </div>
          </div>

          @if (scorecard(); as sc) {
            <div class="flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 px-3.5 py-1.5 rounded-xl border border-amber-500/30 shadow-sm">
              <span class="text-xs font-bold text-gray-700 dark:text-zinc-300">Daily Joy Index:</span>
              <span class="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">{{ sc.compositeJoyIndex }} / 100</span>
            </div>
          }
        </div>

        <!-- Directive Banner -->
        @if (scorecard(); as sc) {
          <div class="mb-6 bg-amber-500/15 text-amber-900 dark:text-amber-200 p-3 rounded-xl border border-amber-500/30 text-xs font-medium flex items-center gap-2">
            <span>✨</span>
            <span>{{ sc.playfulFlourishingDirective }}</span>
          </div>
        }

        <!-- Micro-Joy Prescriptions List -->
        <div class="space-y-3 mb-6">
          <h4 class="text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Today's Micro-Joy Prescriptions</span>
            <span class="text-[10px] text-gray-500 dark:text-zinc-400">10-15 Min Daily Plays</span>
          </h4>

          @for (item of prescriptions(); track item.id) {
            <div class="p-3.5 rounded-xl transition-all border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                 [class]="item.isCompletedToday ? 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/20' : 'bg-white/70 dark:bg-zinc-900/70 border-zinc-200 dark:border-zinc-800'">
              <div class="flex items-start gap-3">
                <button (click)="joyService.toggleActivityCompletion(item.id)"
                        type="button"
                        class="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer"
                        [class]="item.isCompletedToday ? 'bg-emerald-500 text-white border-emerald-600' : 'border-zinc-300 dark:border-zinc-700 hover:border-amber-500'">
                  @if (item.isCompletedToday) { ✓ }
                </button>
                <div>
                  <h5 class="text-xs font-bold text-gray-900 dark:text-zinc-100" [class.line-through]="item.isCompletedToday">
                    {{ item.title }}
                  </h5>
                  <p class="text-[11px] text-gray-600 dark:text-zinc-400 mt-0.5">
                    {{ item.description }}
                  </p>
                  <div class="mt-1.5 flex flex-wrap items-center gap-2 text-[10px]">
                    <span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-medium">
                      🧠 {{ item.dopamineSerotoninBenefit }}
                    </span>
                    <span class="px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 font-mono">
                      ⏱️ {{ item.durationMinutes }} mins
                    </span>
                  </div>
                </div>
              </div>

              <button (click)="joyService.toggleActivityCompletion(item.id)"
                      type="button"
                      class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer self-end sm:self-auto"
                      [class]="item.isCompletedToday ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500 text-white hover:bg-amber-600'">
                {{ item.isCompletedToday ? 'Completed ✓' : 'Start Play ➔' }}
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class JoyPlayfulFlourishingCardComponent {
  joyService = inject(JoyPlayfulFlourishingService);

  prescriptions = computed(() => this.joyService.dailyPrescriptions());
  scorecard = computed(() => this.joyService.calculateJoyScorecard());
}
