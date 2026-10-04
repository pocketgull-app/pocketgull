import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvsUiService } from '../services/avs-ui.service';

@Component({
  selector: 'app-patient-waiting',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-xl bg-gradient-to-b from-orange-500/5 to-transparent border border-orange-500/10 text-center space-y-6">
      <h4 class="text-xl font-light text-gray-800 dark:text-gray-200">Welcome to your Session</h4>
      <p class="text-sm text-gray-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
        Your clinician is preparing your chart. Please focus on the pulsing core and match your breathing to its rhythm.
        This prepares your nervous system and optimizes blood flow for digestion and recovery.
      </p>

      <div class="pt-4 border-t border-gray-200/50 dark:border-zinc-800/50">
        <button (click)="onToggleSession()"
                class="px-8 py-3 rounded-full font-bold uppercase tracking-wider text-xs shadow-lg transition-all duration-300 text-center select-none cursor-pointer inline-flex items-center gap-2"
                [class.bg-gradient-to-r]="!isActive()"
                [class.from-orange-500]="!isActive()"
                [class.to-amber-600]="!isActive()"
                [class.text-white]="!isActive()"
                [class.hover:shadow-orange-500/30]="!isActive()"
                [class.bg-zinc-800]="isActive()"
                [class.text-zinc-300]="isActive()">
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
