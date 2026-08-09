import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WAVE_PROFILES, BrainwaveFrequency } from './avs.constants';

@Component({
  selector: 'app-clinician-console',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/30 border border-gray-150 dark:border-zinc-800/80 space-y-4">
      <div class="flex items-center justify-between border-b border-gray-200/50 dark:border-zinc-800/50 pb-2">
        <span class="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-widest">Practitioner Target Goals</span>
        <span class="text-[9px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">OVERRIDE</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <!-- Target Heart Rate -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-baseline">
            <label class="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase">Target Heart Rate</label>
            <span class="text-xs font-bold text-orange-500">{{ targetHr }} BPM</span>
          </div>
          <input type="range" min="50" max="110" step="1"
                 [value]="targetHr"
                 (input)="onHrChange($event)"
                 class="w-full accent-orange-500 h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer">
          <div class="flex justify-between text-[9px] text-gray-400 dark:text-zinc-500 font-medium">
            <span>IVitals Current: {{ currentHr || '--' }} BPM</span>
            <span>Restorative Limit: 60-70</span>
          </div>
        </div>

        <!-- Target Breathing Rate (Pacing) -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-baseline">
            <label class="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase">Respirations (Breaths/Min)</label>
            <span class="text-xs font-bold text-orange-500">{{ targetBreathingRate }} / MIN</span>
          </div>
          <input type="range" min="4" max="15" step="0.5"
                 [value]="targetBreathingRate"
                 (input)="onBreathingChange($event)"
                 class="w-full accent-orange-500 h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer">
          <div class="flex justify-between text-[9px] text-gray-400 dark:text-zinc-500 font-medium">
            <span>Pacing cycle: {{ (60 / targetBreathingRate).toFixed(1) }}s</span>
            <span>HRV Resonance: 5.5-6.5</span>
          </div>
        </div>

      </div>

      <!-- Brainwave Target Selector -->
      <div class="space-y-2 pt-2 border-t border-gray-200/50 dark:border-zinc-800/50">
        <label class="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase block">Neurological Entrainment Frequency</label>
        <div class="grid grid-cols-4 gap-2">
          @for (wave of waveProfiles; track wave.id) {
            <button (click)="targetWaveChange.emit(wave.id)"
                    class="p-2.5 rounded-lg border text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-0.5"
                    [class.bg-orange-500]="targetWave === wave.id"
                    [class.bg-orange-500/10]="targetWave === wave.id"
                    [class.border-orange-500]="targetWave === wave.id"
                    [class.text-orange-500]="targetWave === wave.id"
                    [class.bg-white]="targetWave !== wave.id"
                    [class.dark:bg-zinc-950/20]="targetWave !== wave.id"
                    [class.border-gray-200]="targetWave !== wave.id"
                    [class.dark:border-zinc-800]="targetWave !== wave.id"
                    [class.text-gray-500]="targetWave !== wave.id"
                    [class.dark:text-zinc-400]="targetWave !== wave.id"
                    [class.hover:border-orange-500/40]="targetWave !== wave.id">
              <span class="text-[10px] font-extrabold uppercase tracking-wide">{{ wave.id }}</span>
              <span class="text-[9px] font-medium opacity-80">{{ wave.freq }}Hz</span>
            </button>
          }
        </div>
        <p class="text-[9px] text-gray-600 dark:text-zinc-400 leading-snug">
          {{ selectedWaveDescription }}
        </p>
      </div>

    </div>
  `
})
export class ClinicianConsoleComponent {
  @Input() targetHr = 70;
  @Input() currentHr: string | undefined;
  @Input() targetBreathingRate = 6.0;
  @Input() targetWave: BrainwaveFrequency = 'theta';
  @Input() selectedWaveDescription = '';

  @Output() targetHrChange = new EventEmitter<number>();
  @Output() targetBreathingRateChange = new EventEmitter<number>();
  @Output() targetWaveChange = new EventEmitter<BrainwaveFrequency>();

  waveProfiles = WAVE_PROFILES;

  onHrChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.targetHrChange.emit(parseInt(value, 10));
  }

  onBreathingChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.targetBreathingRateChange.emit(parseFloat(value));
  }
}
