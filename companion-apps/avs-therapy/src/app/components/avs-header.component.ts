import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewMode } from './avs.constants';

@Component({
  selector: 'app-avs-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="px-6 py-4 bg-gradient-to-r from-orange-600/10 via-amber-600/5 to-transparent border-b border-gray-150 dark:border-zinc-800/50 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/10 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-sm font-bold uppercase tracking-widest text-gray-800 dark:text-zinc-200">AVS Biometric Neuro-Therapy</h3>
          <p class="text-[10px] font-medium text-orange-500 dark:text-orange-400/80 tracking-wide uppercase">Insight Spark Wellness Module</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Dual-Use View Toggle -->
        <div class="flex bg-gray-100 dark:bg-zinc-900 rounded-lg p-0.5 border border-gray-200 dark:border-zinc-800 mr-4">
          <button (click)="viewModeChange.emit('clinician')"
                  class="px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                  [class.bg-orange-500]="viewMode === 'clinician'" [class.text-white]="viewMode === 'clinician'"
                  [class.text-gray-600]="viewMode !== 'clinician'" [class.dark:text-zinc-400]="viewMode !== 'clinician'">Clinician View</button>
          <button (click)="viewModeChange.emit('patient')"
                  class="px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                  [class.bg-orange-500]="viewMode === 'patient'" [class.text-white]="viewMode === 'patient'"
                  [class.text-gray-600]="viewMode !== 'patient'" [class.dark:text-zinc-400]="viewMode !== 'patient'">Patient Waiting</button>
        </div>

        <span class="flex h-2.5 w-2.5 relative">
          @if (isActive) {
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
          } @else {
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-400 dark:bg-zinc-600"></span>
          }
        </span>
        <span class="text-[10px] font-semibold text-gray-500 dark:text-zinc-400 uppercase">
          {{ isActive ? 'ACTIVE SESSION' : 'READY' }}
        </span>
      </div>
    </div>
  `
})
export class AvsHeaderComponent {
  @Input() isActive = false;
  @Input() viewMode: ViewMode = 'clinician';
  @Output() viewModeChange = new EventEmitter<ViewMode>();
}
