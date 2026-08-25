import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioRespiratoryAnalyzerService } from '../services/audio-respiratory-analyzer.service';

@Component({
  selector: 'app-audio-respiratory-visualizer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-cyan-500/30 rounded-2xl shadow-xl space-y-6 font-sans">
      <!-- Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-extrabold text-lg">
            🎙️
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Micro-Acoustic Respiratory Spectrogram & Adventitious Sound Telemetry
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              Real-time FFT audio spectrum analyzer for Wheezing, Stridor, and Nocturnal Cough Detection.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 rounded-full text-xs font-bold font-mono">
            LOINC 9303-9
          </span>
        </div>
      </div>

      <!-- Live Pattern Banner -->
      <div class="p-4 rounded-xl border transition-all" [class.bg-emerald-500\x2f10]="pattern().detectedPattern === 'Normal Breathing'" [class.border-emerald-500\x2f30]="pattern().detectedPattern === 'Normal Breathing'" [class.bg-amber-500\x2f10]="pattern().detectedPattern === 'Expiratory Wheeze'" [class.border-amber-500\x2f30]="pattern().detectedPattern === 'Expiratory Wheeze'" [class.bg-rose-500\x2f10]="pattern().detectedPattern === 'Inspiratory Stridor'" [class.border-rose-500\x2f30]="pattern().detectedPattern === 'Inspiratory Stridor'" [class.bg-purple-500\x2f10]="pattern().detectedPattern === 'Explosive Cough Burst'" [class.border-purple-500\x2f30]="pattern().detectedPattern === 'Explosive Cough Burst'">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full animate-ping" [class.bg-emerald-500]="pattern().detectedPattern === 'Normal Breathing'" [class.bg-amber-500]="pattern().detectedPattern === 'Expiratory Wheeze'" [class.bg-rose-500]="pattern().detectedPattern === 'Inspiratory Stridor'" [class.bg-purple-500]="pattern().detectedPattern === 'Explosive Cough Burst'"></span>
              <span class="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-gray-100">
                Pattern: {{ pattern().detectedPattern }}
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase" [class.bg-emerald-500\x2f20]="pattern().severityGrade === 'Mild'" [class.text-emerald-700]="pattern().severityGrade === 'Mild'" [class.bg-amber-500\x2f20]="pattern().severityGrade === 'Moderate'" [class.text-amber-700]="pattern().severityGrade === 'Moderate'" [class.bg-rose-500\x2f20]="pattern().severityGrade === 'Severe'" [class.text-rose-700]="pattern().severityGrade === 'Severe'">
                {{ pattern().severityGrade }} Severity
              </span>
            </div>
            <p class="text-xs text-gray-600 dark:text-zinc-300 font-medium">
              {{ pattern().clinicalIndication }}
            </p>
          </div>

          <div class="text-right font-mono text-xs space-y-0.5">
            <div>Pitch: <strong class="text-cyan-600 dark:text-cyan-400">{{ pattern().dominantFrequencyHz }} Hz</strong></div>
            <div>Energy: <strong class="text-cyan-600 dark:text-cyan-400">{{ pattern().acousticEnergyDb }} dB</strong></div>
          </div>
        </div>
      </div>

      <!-- FFT Animated Frequency Equalizer Bars -->
      <div class="space-y-2">
        <div class="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-zinc-400">
          <span>Acoustic FFT Frequency Spectrum (20 Hz - 4000 Hz)</span>
          <span class="font-mono text-cyan-600 dark:text-cyan-400">Sample Rate: 44.1 kHz</span>
        </div>

        <div class="h-24 bg-gray-900 rounded-xl p-3 flex items-end justify-between gap-1.5 overflow-hidden border border-cyan-500/20">
          <div *ngFor="let bar of equalizerBars(); let i = index" class="flex-1 bg-gradient-to-t from-cyan-500 via-teal-400 to-purple-400 rounded-t transition-all duration-150" [style.height.%]="bar"></div>
        </div>
        <div class="flex justify-between text-[10px] text-gray-400 font-mono">
          <span>20 Hz (Low)</span>
          <span>400 Hz (Wheeze Start)</span>
          <span>1600 Hz (Wheeze End)</span>
          <span>2000+ Hz (Stridor)</span>
          <span>4000 Hz</span>
        </div>
      </div>

      <!-- Acoustic Simulation Controls -->
      <div class="space-y-3">
        <h4 class="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-zinc-300">
          Acoustic Frequency Presets & Simulation:
        </h4>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <button (click)="simulate('normal')" class="p-2.5 border border-emerald-500/30 rounded-xl font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer text-left">
            🌱 Normal Breath
            <span class="block text-[10px] font-normal opacity-80">200 Hz (-35 dB)</span>
          </button>

          <button (click)="simulate('wheeze')" class="p-2.5 border border-amber-500/30 rounded-xl font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition cursor-pointer text-left">
            🎷 Expiratory Wheeze
            <span class="block text-[10px] font-normal opacity-80">850 Hz (-15 dB)</span>
          </button>

          <button (click)="simulate('stridor')" class="p-2.5 border border-rose-500/30 rounded-xl font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition cursor-pointer text-left">
            🚨 Inspiratory Stridor
            <span class="block text-[10px] font-normal opacity-80">2400 Hz (-10 dB)</span>
          </button>

          <button (click)="simulate('cough')" class="p-2.5 border border-purple-500/30 rounded-xl font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition cursor-pointer text-left">
            💥 Cough Burst
            <span class="block text-[10px] font-normal opacity-80">500 Hz (-6 dB)</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class AudioRespiratoryVisualizerComponent {
  private analyzerService = inject(AudioRespiratoryAnalyzerService);

  readonly pattern = this.analyzerService.acousticPattern;

  readonly equalizerBars = computed<number[]>(() => {
    const p = this.pattern();
    const freq = p.dominantFrequencyHz;
    const bars: number[] = [];

    for (let i = 0; i < 24; i++) {
      const centerHz = 20 + (i * 165);
      const diff = Math.abs(centerHz - freq);
      let height = Math.max(10, 90 - (diff / 15));
      if (p.detectedPattern === 'Normal Breathing') height = Math.min(25, height);
      bars.push(Math.round(height));
    }
    return bars;
  });

  simulate(preset: 'normal' | 'wheeze' | 'stridor' | 'cough'): void {
    if (preset === 'normal') this.analyzerService.simulateAcousticFrequency(200, -35);
    else if (preset === 'wheeze') this.analyzerService.simulateAcousticFrequency(850, -15);
    else if (preset === 'stridor') this.analyzerService.simulateAcousticFrequency(2400, -10);
    else if (preset === 'cough') this.analyzerService.simulateAcousticFrequency(500, -6);
  }
}
