import { Component, ChangeDetectionStrategy, inject, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsoleIntegrityService } from '../services/console-integrity.service';

@Component({
  selector: 'app-console-integrity-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isDevMode()) {
      <div class="inline-flex items-center gap-2 p-1.5 px-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono shadow-md backdrop-blur-md">
        
        <!-- Zero Agent Icon & Name -->
        <div class="flex items-center gap-1.5">
          <span class="text-sm" [class.animate-spin]="zero.isSweepActive()">🧹</span>
          <span class="font-bold text-emerald-400">Zero</span>
          <span class="text-[10px] text-zinc-500 font-sans">| Integrity</span>
        </div>

        <!-- Live Error / Warning Count Badges -->
        <div class="flex items-center gap-1">
          <span [class.bg-emerald-500\/20]="zero.isZeroErrorState()"
            [class.text-emerald-400]="zero.isZeroErrorState()"
            [class.border-emerald-500\/40]="zero.isZeroErrorState()"
            [class.bg-rose-500\/20]="!zero.isZeroErrorState()"
            [class.text-rose-400]="!zero.isZeroErrorState()"
            [class.border-rose-500\/40]="!zero.isZeroErrorState()"
            class="px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all">
            {{ zero.errorCount() }} ERR
          </span>

          @if (zero.warningCount() > 0) {
            <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {{ zero.warningCount() }} WARN
            </span>
          }
        </div>

        <!-- Sweep to 0 Action Button -->
        <button (click)="zero.sweepToZero()"
          [disabled]="zero.isZeroErrorState()"
          [class.opacity-50]="zero.isZeroErrorState()"
          class="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[10px] font-bold transition cursor-pointer border border-emerald-400/30">
          {{ zero.isZeroErrorState() ? 'Target 0 Achieved' : 'Sweep to 0' }}
        </button>

      </div>
    }
  `
})
export class ConsoleIntegrityBadgeComponent {
  readonly zero = inject(ConsoleIntegrityService);
  readonly isDevMode = isDevMode;
}
