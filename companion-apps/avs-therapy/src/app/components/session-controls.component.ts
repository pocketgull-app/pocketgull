import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvsUiService } from '../services/avs-ui.service';

@Component({
  selector: 'app-session-controls',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-3 pt-2">
      <!-- Top Row: Master Toggle & Core Toggles -->
      <div class="flex flex-wrap sm:flex-nowrap gap-2.5">
        <!-- Master Toggle -->
        <button (click)="onToggleSession()"
                class="flex-1 min-w-[200px] py-2.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-all duration-300 text-center select-none cursor-pointer flex items-center justify-center gap-2 hover:shadow-lg"
                [class.bg-gradient-to-r]="!isActive()"
                [class.from-orange-500]="!isActive()"
                [class.to-amber-600]="!isActive()"
                [class.text-white]="!isActive()"
                [class.shadow-orange-500/20]="!isActive()"
                [class.bg-zinc-800]="isActive()"
                [class.dark:bg-zinc-800]="isActive()"
                [class.text-gray-200]="isActive()"
                [class.border]="isActive()"
                [class.border-zinc-700]="isActive()">
          @if (!isActive()) {
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span>Initiate Neuro-Therapy</span>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            </svg>
            <span>Terminate Session</span>
            @if (sessionSecondsRemaining() !== null) {
              <span class="ml-1 px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 font-mono text-[10px] animate-pulse">
                {{ formatTimeRemaining(sessionSecondsRemaining()!) }}
              </span>
            }
          }
        </button>

        <!-- Voice Guidance Toggle -->
        <button (click)="onToggleVoice()"
                class="py-2.5 px-3 rounded-xl font-bold uppercase tracking-wider text-xs border transition-all duration-300 flex items-center justify-center gap-1.5 select-none cursor-pointer"
                [class.bg-orange-500/10]="voiceEnabled()"
                [class.border-orange-500]="voiceEnabled()"
                [class.text-orange-500]="voiceEnabled()"
                [class.bg-white]="!voiceEnabled()"
                [class.dark:bg-zinc-950/20]="!voiceEnabled()"
                [class.border-gray-200]="!voiceEnabled()"
                [class.dark:border-zinc-800]="!voiceEnabled()"
                [class.text-gray-600]="!voiceEnabled()"
                [class.dark:text-zinc-400]="!voiceEnabled()"
                title="Toggle vocal guidance prompts">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
            <line x1="12" y1="19" x2="12" y2="22"/>
          </svg>
          <span>Voice: {{ voiceEnabled() ? 'ON' : 'OFF' }}</span>
        </button>

        <!-- Voice Pacing Cues Toggle -->
        <button (click)="onToggleVoicePacing()"
                class="py-2.5 px-3 rounded-xl font-bold uppercase tracking-wider text-xs border transition-all duration-300 flex items-center justify-center gap-1.5 select-none cursor-pointer"
                [class.bg-orange-500/10]="voicePacingEnabled()"
                [class.border-orange-500]="voicePacingEnabled()"
                [class.text-orange-500]="voicePacingEnabled()"
                [class.bg-white]="!voicePacingEnabled()"
                [class.dark:bg-zinc-950/20]="!voicePacingEnabled()"
                [class.border-gray-200]="!voicePacingEnabled()"
                [class.dark:border-zinc-800]="!voicePacingEnabled()"
                [class.text-gray-600]="!voicePacingEnabled()"
                [class.dark:text-zinc-400]="!voicePacingEnabled()"
                title="Toggle inhale/exhale breath count cues">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
            <line x1="12" y1="19" x2="12" y2="22"/>
          </svg>
          <span>Pacing: {{ voicePacingEnabled() ? 'ON' : 'OFF' }}</span>
        </button>

        <!-- Haptics Toggle -->
        <button (click)="onToggleVibration()"
                class="py-2.5 px-3 rounded-xl font-bold uppercase tracking-wider text-xs border transition-all duration-300 flex items-center justify-center gap-1.5 select-none cursor-pointer"
                [class.bg-orange-500/10]="vibrationEnabled()"
                [class.border-orange-500]="vibrationEnabled()"
                [class.text-orange-500]="vibrationEnabled()"
                [class.bg-white]="!vibrationEnabled()"
                [class.dark:bg-zinc-950/20]="!vibrationEnabled()"
                [class.border-gray-200]="!vibrationEnabled()"
                [class.dark:border-zinc-800]="!vibrationEnabled()"
                [class.text-gray-600]="!vibrationEnabled()"
                [class.dark:text-zinc-400]="!vibrationEnabled()"
                [disabled]="!hasVibrator()"
                [class.opacity-50]="!hasVibrator()"
                [title]="hasVibrator() ? 'Toggle Rhythmic Physical Entrainment' : 'Vibration API not supported on this device'">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m8 3 4 8 5-5-5 15-2-6-4 3Z"/>
          </svg>
          <span>Haptics: {{ vibrationEnabled() ? 'ON' : 'OFF' }}</span>
        </button>

        <!-- STAT Emergency CPR Metronome Toggle -->
        <button (click)="onToggleCpr()"
                class="py-2.5 px-3 rounded-xl font-bold uppercase tracking-wider text-xs border transition-all duration-300 flex items-center justify-center gap-1.5 select-none cursor-pointer"
                [class.bg-rose-600]="isCprActive()"
                [class.text-white]="isCprActive()"
                [class.border-rose-500]="isCprActive()"
                [class.animate-pulse]="isCprActive()"
                [class.bg-rose-500/10]="!isCprActive()"
                [class.border-rose-500/30]="!isCprActive()"
                [class.text-rose-400]="!isCprActive()"
                [class.hover:bg-rose-500/20]="!isCprActive()"
                title="Emergency AHA 110 BPM Rhythmic Audio-Visual Metronome Override">
          <span>🚨</span>
          <span>CPR 110: {{ isCprActive() ? 'ACTIVE' : 'OFF' }}</span>
        </button>
      </div>

      <!-- Second Row: Duration Presets & Master Volume / Noise Controls -->
      <div class="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300">
        <!-- Session Duration Limit -->
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">⏱️ Session Limit:</span>
          <div class="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
            @for (dur of [5, 10, 15, 20, -1]; track dur) {
              <button (click)="onSelectDuration(dur)"
                      class="px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-colors cursor-pointer"
                      [class.bg-orange-500]="sessionDurationMinutes() === dur"
                      [class.text-white]="sessionDurationMinutes() === dur"
                      [class.text-zinc-400]="sessionDurationMinutes() !== dur"
                      [class.hover:text-zinc-200]="sessionDurationMinutes() !== dur">
                {{ dur === -1 ? '∞' : dur + 'm' }}
              </button>
            }
          </div>
        </div>

        <!-- Master Acoustic Gain Slider -->
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">🔊 Gain:</span>
          <input type="range" min="0" max="100" step="5"
                 [value]="volume()"
                 (input)="onVolumeChange($event)"
                 class="w-20 accent-orange-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                 title="Master Acoustic Gain">
          <span class="text-[10px] font-mono text-zinc-400 w-8 text-right">{{ volume() }}%</span>
        </div>

        <!-- Audiophile Pink Noise Floor -->
        <button (click)="onTogglePinkNoise()"
                class="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center gap-1 cursor-pointer"
                [class.bg-purple-500/20]="pinkNoiseEnabled()"
                [class.border-purple-500/40]="pinkNoiseEnabled()"
                [class.text-purple-300]="pinkNoiseEnabled()"
                [class.bg-zinc-950]="!pinkNoiseEnabled()"
                [class.border-zinc-800]="!pinkNoiseEnabled()"
                [class.text-zinc-500]="!pinkNoiseEnabled()"
                title="Toggle 1/f Pink Noise Acoustic Floor">
          <span>🌊</span>
          <span>Pink Noise: {{ pinkNoiseEnabled() ? 'ON' : 'OFF' }}</span>
        </button>
      </div>
    </div>
  `
})
export class SessionControlsComponent {
  readonly isActive = input<boolean>(false);
  readonly voiceEnabled = input<boolean>(true);
  readonly voicePacingEnabled = input<boolean>(false);
  readonly vibrationEnabled = input<boolean>(false);
  readonly hasVibrator = input<boolean>(false);
  readonly isCprActive = input<boolean>(false);
  readonly volume = input<number>(75);
  readonly pinkNoiseEnabled = input<boolean>(true);
  readonly sessionDurationMinutes = input<number>(15);
  readonly sessionSecondsRemaining = input<number | null>(null);

  readonly toggleSession = output<void>();
  readonly toggleVoice = output<void>();
  readonly toggleVoicePacing = output<void>();
  readonly toggleVibration = output<void>();
  readonly toggleCpr = output<void>();
  readonly volumeChange = output<number>();
  readonly togglePinkNoise = output<void>();
  readonly durationChange = output<number>();

  private readonly avsUi = inject(AvsUiService);

  onToggleSession(): void {
    if (!this.isActive()) {
      this.avsUi.playSuccess();
    } else {
      this.avsUi.playToggle();
    }
    this.toggleSession.emit();
  }

  onToggleVoice(): void {
    this.avsUi.playToggle();
    this.toggleVoice.emit();
  }

  onToggleVoicePacing(): void {
    this.avsUi.playToggle();
    this.toggleVoicePacing.emit();
  }

  onToggleVibration(): void {
    this.avsUi.playToggle();
    this.toggleVibration.emit();
  }

  onToggleCpr(): void {
    if (!this.isCprActive()) {
      this.avsUi.playError();
    } else {
      this.avsUi.playToggle();
    }
    this.toggleCpr.emit();
  }

  onSelectDuration(mins: number): void {
    this.avsUi.playHover();
    this.durationChange.emit(mins);
  }

  onVolumeChange(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.volumeChange.emit(val);
  }

  onTogglePinkNoise(): void {
    this.avsUi.playToggle();
    this.togglePinkNoise.emit();
  }

  formatTimeRemaining(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
}
