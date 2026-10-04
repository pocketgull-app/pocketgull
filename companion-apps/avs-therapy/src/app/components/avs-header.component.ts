import { Component, ChangeDetectionStrategy, input, output, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ViewMode } from './avs.constants';
import { AvsWatchBleService } from '../services/avs-watch-ble.service';
import { AvsUiService } from '../services/avs-ui.service';

@Component({
  selector: 'app-avs-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="px-6 py-4 bg-gradient-to-r from-orange-600/10 via-amber-600/5 to-transparent border-b border-gray-150 dark:border-zinc-800/50 flex flex-wrap items-center justify-between gap-3">
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

      <div class="flex items-center gap-2.5">
        <!-- Pixel Watch 2 Web Bluetooth HUD -->
        @if (watchBle.isConnected()) {
          <div class="flex items-center gap-2 bg-teal-950/50 border border-teal-500/40 px-2.5 py-1 rounded-lg text-[10px] text-teal-300 font-mono shadow-sm">
            <span class="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span class="font-bold text-white">{{ watchBle.heartRate() }} bpm</span>
            <span class="text-teal-500/50">|</span>
            <span>{{ watchBle.cedaMicrosiemens() }} µS</span>
            <span class="text-teal-500/50">|</span>
            <span>{{ watchBle.skinTempCelsius() }}°C</span>
            <button (click)="onWatchDisconnect()" class="ml-1 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer" title="Disconnect Watch">✕</button>
          </div>
        } @else {
          <button (click)="onWatchConnect()"
                  [disabled]="watchBle.isConnecting()"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:bg-teal-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
            <span>⌚</span>
            <span>{{ watchBle.isConnecting() ? 'Connecting...' : 'Connect PW2' }}</span>
          </button>
        }

        <!-- Audio UI Feedback Toggle Button -->
        <button (click)="onToggleAudioFeedback()"
                class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center gap-1 cursor-pointer"
                [class.bg-indigo-500/15]="avsUi.isAudioFeedbackEnabled()"
                [class.border-indigo-500/40]="avsUi.isAudioFeedbackEnabled()"
                [class.text-indigo-400]="avsUi.isAudioFeedbackEnabled()"
                [class.bg-zinc-900]="!avsUi.isAudioFeedbackEnabled()"
                [class.border-zinc-800]="!avsUi.isAudioFeedbackEnabled()"
                [class.text-zinc-500]="!avsUi.isAudioFeedbackEnabled()"
                title="Toggle Synthesized UI Chimes">
          <span>{{ avsUi.isAudioFeedbackEnabled() ? '🔔' : '🔕' }}</span>
          <span>UI Audio: {{ avsUi.isAudioFeedbackEnabled() ? 'ON' : 'MUTED' }}</span>
        </button>

        <!-- Fullscreen Immersion Mode Toggle -->
        <button (click)="toggleFullscreen()"
                class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all flex items-center gap-1 cursor-pointer"
                title="Toggle Fullscreen Clinical Immersion">
          <span>{{ isFullscreen() ? '⛶' : '⛶' }}</span>
          <span>{{ isFullscreen() ? 'Exit Full' : 'Fullscreen' }}</span>
        </button>

        <!-- Dual-Use View Toggle -->
        <div class="flex bg-gray-100 dark:bg-zinc-900 rounded-lg p-0.5 border border-gray-200 dark:border-zinc-800">
          <button (click)="onSelectViewMode('clinician')"
                  class="px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                  [class.bg-orange-500]="viewMode() === 'clinician'" [class.text-white]="viewMode() === 'clinician'"
                  [class.text-gray-600]="viewMode() !== 'clinician'" [class.dark:text-zinc-400]="viewMode() !== 'clinician'">Clinician View</button>
          <button (click)="onSelectViewMode('patient')"
                  class="px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                  [class.bg-orange-500]="viewMode() === 'patient'" [class.text-white]="viewMode() === 'patient'"
                  [class.text-gray-600]="viewMode() !== 'patient'" [class.dark:text-zinc-400]="viewMode() !== 'patient'">Patient Waiting</button>
        </div>

        <span class="flex h-2.5 w-2.5 relative">
          @if (isActive()) {
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
          } @else {
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-400 dark:bg-zinc-600"></span>
          }
        </span>
        <span class="text-[10px] font-semibold text-gray-500 dark:text-zinc-400 uppercase">
          {{ isActive() ? 'ACTIVE SESSION' : 'READY' }}
        </span>
      </div>
    </div>
  `
})
export class AvsHeaderComponent {
  readonly isActive = input<boolean>(false);
  readonly viewMode = input<ViewMode>('clinician');
  readonly viewModeChange = output<ViewMode>();

  readonly watchBle = inject(AvsWatchBleService);
  readonly avsUi = inject(AvsUiService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly isFullscreen = signal<boolean>(false);

  onSelectViewMode(mode: ViewMode): void {
    this.avsUi.playTransition();
    this.viewModeChange.emit(mode);
  }

  onToggleAudioFeedback(): void {
    this.avsUi.toggleAudioFeedback();
    this.avsUi.playToggle();
  }

  onWatchConnect(): void {
    this.avsUi.playHover();
    this.watchBle.connect();
  }

  onWatchDisconnect(): void {
    this.avsUi.playToggle();
    this.watchBle.disconnect();
  }

  toggleFullscreen(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.avsUi.playToggle();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        this.isFullscreen.set(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        this.isFullscreen.set(false);
      }).catch(() => {});
    }
  }
}
