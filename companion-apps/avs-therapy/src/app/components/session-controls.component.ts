import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-session-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col sm:flex-row gap-3 pt-2">

      <!-- Master Toggle -->
      <button (click)="toggleSession.emit()"
              class="flex-1 py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-all duration-300 text-center select-none cursor-pointer flex items-center justify-center gap-2 hover:shadow-lg"
              [ngClass]="!isActive ?
                'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-orange-500/20' :
                'bg-zinc-800 dark:bg-zinc-800 text-gray-200 border border-zinc-700'">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" *ngIf="!isActive">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" *ngIf="isActive">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
        </svg>
        {{ isActive ? 'Terminate Session' : 'Initiate Neuro-Therapy' }}
      </button>

      <!-- Voice Guidance Enable Toggle -->
      <button (click)="toggleVoice.emit()"
              class="py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs border transition-all duration-300 flex items-center justify-center gap-2 select-none cursor-pointer"
              [ngClass]="voiceEnabled ?
                'bg-orange-500/10 border-orange-500 text-orange-500' :
                'bg-white dark:bg-zinc-950/10 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400'">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
        </svg>
        Voice: {{ voiceEnabled ? 'ON' : 'OFF' }}
      </button>

      <!-- Voice Pacing Enable Toggle -->
      <button (click)="toggleVoicePacing.emit()"
              class="py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs border transition-all duration-300 flex items-center justify-center gap-2 select-none cursor-pointer"
              [ngClass]="voicePacingEnabled ?
                'bg-orange-500/10 border-orange-500 text-orange-500' :
                'bg-white dark:bg-zinc-950/10 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400'">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
        </svg>
        Pacing Cues: {{ voicePacingEnabled ? 'ON' : 'OFF' }}
      </button>

      <!-- Rhythmic Haptic Vibration Toggle -->
      <button (click)="toggleVibration.emit()"
              class="py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs border transition-all duration-300 flex items-center justify-center gap-2 select-none cursor-pointer"
              [ngClass]="vibrationEnabled ?
                'bg-orange-500/10 border-orange-500 text-orange-500' :
                'bg-white dark:bg-zinc-950/10 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400'"
              [disabled]="!hasVibrator"
              [class.opacity-50]="!hasVibrator"
              [title]="hasVibrator ? 'Toggle Rhythmic Physical Entrainment' : 'Vibration API not supported on this device'">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m8 3 4 8 5-5-5 15-2-6-4 3Z"/>
        </svg>
        Haptics: {{ vibrationEnabled ? 'ON' : 'OFF' }}
      </button>

    </div>
  `
})
export class SessionControlsComponent {
  @Input() isActive = false;
  @Input() voiceEnabled = true;
  @Input() voicePacingEnabled = false;
  @Input() vibrationEnabled = false;
  @Input() hasVibrator = false;

  @Output() toggleSession = new EventEmitter<void>();
  @Output() toggleVoice = new EventEmitter<void>();
  @Output() toggleVoicePacing = new EventEmitter<void>();
  @Output() toggleVibration = new EventEmitter<void>();
}
