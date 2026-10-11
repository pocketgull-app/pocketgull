import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvsUiService } from '../services/avs-ui.service';

@Component({
  selector: 'app-patient-waiting',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @keyframes vagalBreath {
      0%, 100% { transform: scale(0.85); opacity: 0.6; }
      40% { transform: scale(1.15); opacity: 1; }
      60% { transform: scale(1.15); opacity: 0.95; }
    }
    .animate-vagal-pulse {
      animation: vagalBreath 10s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
  `],
  template: `
    <div class="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 text-center space-y-6 shadow-xl transition-all">
      
      <!-- 0.1 Hz Vagal Breathing Pacer Orb -->
      <div class="relative w-24 h-24 mx-auto flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-500/20 via-amber-500/15 to-emerald-500/20 blur-md animate-vagal-pulse"></div>
        <div class="w-20 h-20 rounded-full border-2 border-teal-500/40 dark:border-teal-400/50 flex items-center justify-center shadow-[0_0_24px_rgba(20,184,166,0.25)] animate-vagal-pulse bg-zinc-900/40 backdrop-blur-xs">
          <span class="text-2xl select-none">🫁</span>
        </div>
      </div>

      <div class="space-y-2">
        <h4 class="text-xl font-semibold tracking-tight text-zinc-900 dark:text-[#F5EFE6]">
          Welcome to Your Clinical Session
        </h4>
        <p class="text-xs font-mono uppercase tracking-wider text-teal-600 dark:text-teal-400 font-bold">
          0.1 Hz Baroreflex &amp; Vagal Pacing Active
        </p>
        <p class="text-sm text-zinc-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">
          Your clinician is preparing your care plan. Settle your posture and match your breathing to the gentle pulse above.
          A 10-second breath cycle optimizes microvascular blood flow and autonomic nervous system tone.
        </p>
      </div>

      <div class="pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-center">
        <button (click)="onToggleSession()"
                [attr.aria-label]="isActive() ? 'Pause autonomic relaxation session' : 'Start autonomic relaxation session'"
                class="px-8 py-3.5 min-h-[48px] rounded-full font-bold uppercase tracking-wider text-xs shadow-lg transition-all duration-300 text-center select-none cursor-pointer inline-flex items-center gap-2 touch-manipulation focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none"
                [class.bg-gradient-to-r]="!isActive()"
                [class.from-teal-600]="!isActive()"
                [class.to-emerald-600]="!isActive()"
                [class.text-white]="!isActive()"
                [class.hover:shadow-teal-500/30]="!isActive()"
                [class.bg-zinc-800]="isActive()"
                [class.text-zinc-200]="isActive()">
          @if (!isActive()) {
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>Start Relaxation</span>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            </svg>
            <span>Pause Relaxation</span>
          }
        </button>
      </div>
    </div>
  `
})
export class PatientWaitingComponent {
  readonly isActive = input<boolean>(false);
  readonly toggleSession = output<void>();

  private readonly avsUi = inject(AvsUiService);

  onToggleSession(): void {
    if (!this.isActive()) {
      this.avsUi.playSuccess();
    } else {
      this.avsUi.playToggle();
    }
    this.toggleSession.emit();
  }
}
