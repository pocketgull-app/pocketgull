import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patient-waiting',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 rounded-xl bg-gradient-to-b from-orange-500/5 to-transparent border border-orange-500/10 text-center space-y-6">
      <h4 class="text-xl font-light text-gray-800 dark:text-gray-200">Welcome to your Session</h4>
      <p class="text-sm text-gray-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
        Your clinician is preparing your chart. Please focus on the pulsing core and match your breathing to its rhythm.
        This prepares your nervous system and optimizes blood flow for digestion and recovery.
      </p>

      <div class="pt-4 border-t border-gray-200/50 dark:border-zinc-800/50">
        <button (click)="toggleSession.emit()"
                class="px-8 py-3 rounded-full font-bold uppercase tracking-wider text-xs shadow-lg transition-all duration-300 text-center select-none cursor-pointer inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:shadow-orange-500/30"
                [class.bg-zinc-800]="isActive"
                [class.text-white]="isActive"
                [class.from-zinc-700]="isActive"
                [class.to-zinc-800]="isActive">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" *ngIf="!isActive">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" *ngIf="isActive">
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
          </svg>
          {{ isActive ? 'Pause Relaxation' : 'Start Relaxation' }}
        </button>
      </div>
    </div>
  `
})
export class PatientWaitingComponent {
  @Input() isActive = false;
  @Output() toggleSession = new EventEmitter<void>();
}
