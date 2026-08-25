import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';

@Component({
  selector: 'app-biophysical-twin-timeline',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-slate-900/95 dark:bg-zinc-950/95 border-t border-slate-700/80 dark:border-zinc-800 backdrop-blur-xl text-slate-100 p-3 flex flex-col gap-2.5 shadow-2xl transition-all select-none">
      
      <!-- Top Header & Current Hour Telemetry -->
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="flex h-2.5 w-2.5 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span class="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-1.5">
            <span>🧬 24-Hour Biophysical Twin</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">ODE SIMULATION</span>
          </span>
        </div>

        <!-- Telemetry Gauges for Selected Clock Hour -->
        <div class="flex items-center gap-3 text-[11px] font-mono">
          <div class="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700">
            <span class="text-slate-400">Time:</span>
            <span class="font-bold text-amber-300">{{ formattedClockHour() }}</span>
          </div>
          <div class="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700">
            <span class="text-slate-400">Sleep Pressure S(t):</span>
            <span class="font-bold text-cyan-300">{{ currentTelemetry().sleepPressure.toFixed(2) }}</span>
          </div>
          <div class="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700">
            <span class="text-slate-400">Cortisol:</span>
            <span class="font-bold text-rose-300">{{ currentTelemetry().cortisolIndex.toFixed(1) }} mcg/dL</span>
          </div>
          <div class="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700">
            <span class="text-slate-400">Est. RMSSD:</span>
            <span class="font-bold text-emerald-300">{{ currentTelemetry().rmssd.toFixed(0) }} ms</span>
          </div>
          <div class="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700">
            <span class="text-slate-400">Caffeine Active:</span>
            <span class="font-bold" [class.text-amber-400]="currentTelemetry().activeCaffeine > 20" [class.text-slate-400]="currentTelemetry().activeCaffeine <= 20">
              {{ currentTelemetry().activeCaffeine.toFixed(0) }} mg
            </span>
          </div>
        </div>
      </div>

      <!-- Interactive 24-Hour Timeline Scrubber -->
      <div class="relative w-full flex flex-col gap-1">
        <div class="relative w-full h-7 bg-slate-800/80 rounded-lg overflow-hidden border border-slate-700 flex items-center px-1">
          <!-- Ambient Zone Gradient Indicators -->
          <div class="absolute inset-0 flex">
            <div class="w-[33%] bg-gradient-to-r from-indigo-950/40 via-amber-950/20 to-transparent border-r border-slate-700/40" title="Morning Cortisol Surge (06:00 - 14:00)"></div>
            <div class="w-[25%] bg-gradient-to-r from-amber-950/20 to-indigo-950/30 border-r border-slate-700/40" title="Afternoon Circadian Dip (14:00 - 20:00)"></div>
            <div class="w-[42%] bg-gradient-to-r from-indigo-950/40 via-purple-950/60 to-slate-950" title="Dim-Light Melatonin Onset & SWS (20:00 - 06:00)"></div>
          </div>

          <!-- Slider Range Input -->
          <input 
            type="range" 
            min="6" 
            max="30" 
            step="0.25" 
            [value]="scrubberHour()" 
            (input)="onHourSliderChange($event)"
            class="w-full h-3 appearance-none bg-transparent cursor-pointer relative z-10 accent-cyan-400"
            aria-label="24-Hour In-Silico Circadian Timeline Scrubber" />
        </div>

        <!-- 24-Hour Clock Labels -->
        <div class="flex justify-between items-center text-[9px] font-mono text-slate-400 px-1">
          <span>06:00 (Wake)</span>
          <span>10:00 (Peak Alert)</span>
          <span>14:00 (Post-Prandial Dip)</span>
          <span>18:00 (Vagal Recovery)</span>
          <span>22:00 (DLMO Onset)</span>
          <span>02:00 (Deep SWS Sleep)</span>
          <span>06:00 (Awakening)</span>
        </div>
      </div>

      <!-- Counterfactual Interventions Drawer -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
        <div class="flex flex-wrap items-center gap-4">
          <!-- Caffeine Dose Slider -->
          <div class="flex items-center gap-1.5">
            <label for="caffeine-dose-slider" class="text-amber-400 font-mono text-[11px]">☕ Caffeine:</label>
            <input 
              id="caffeine-dose-slider"
              type="range" 
              min="0" 
              max="300" 
              step="25" 
              [value]="caffeineDoseMg()" 
              (input)="onCaffeineChange($event)"
              aria-label="Caffeine dose in milligrams"
              class="w-20 h-1.5 appearance-none bg-slate-700 rounded cursor-pointer accent-amber-400" />
            <span class="font-mono text-[10px] text-amber-300 font-bold w-12">{{ caffeineDoseMg() }} mg</span>
          </div>

          <!-- Resonance Breathing Minutes -->
          <div class="flex items-center gap-1.5">
            <label for="breathing-duration-slider" class="text-emerald-400 font-mono text-[11px]">🫁 0.1Hz Breathing:</label>
            <input 
              id="breathing-duration-slider"
              type="range" 
              min="0" 
              max="30" 
              step="5" 
              [value]="breathingMinutes()" 
              (input)="onBreathingChange($event)"
              aria-label="Resonance breathing duration in minutes"
              class="w-20 h-1.5 appearance-none bg-slate-700 rounded cursor-pointer accent-emerald-400" />
            <span class="font-mono text-[10px] text-emerald-300 font-bold w-12">{{ breathingMinutes() }} min</span>
          </div>

          <!-- Blue-Light Cutoff Hour -->
          <div class="flex items-center gap-1.5">
            <label for="screen-cutoff-select" class="text-purple-400 font-mono text-[11px]">🌙 Screen Cutoff:</label>
            <select 
              id="screen-cutoff-select"
              [value]="screenCutoffHour()" 
              (change)="onScreenCutoffChange($event)"
              aria-label="Blue-light screen cutoff hour"
              class="px-2 py-0.5 rounded bg-slate-800 text-purple-300 font-mono text-[10px] border border-slate-700 cursor-pointer outline-none">
              <option [value]="20">20:00 (8 PM)</option>
              <option [value]="21">21:00 (9 PM)</option>
              <option [value]="22">22:00 (10 PM)</option>
              <option [value]="23">23:00 (11 PM)</option>
              <option [value]="24">00:00 (Midnight - High Jetlag)</option>
            </select>
          </div>
        </div>

        <!-- Dynamic Impact Badge -->
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-[10.5px]">
          <span class="text-slate-400">Night Deep Sleep Projection:</span>
          <span class="font-mono font-bold" [class.text-emerald-400]="projectedDeepSleepPct() >= 18" [class.text-amber-400]="projectedDeepSleepPct() < 18">
            {{ projectedDeepSleepPct().toFixed(1) }}% SWS
          </span>
        </div>
      </div>

    </div>
  `
})
export class BiophysicalTwinTimelineComponent {
  private state = inject(PatientStateService);

  readonly scrubberHour = signal<number>(14.0); // 14.0 = 2:00 PM
  readonly caffeineDoseMg = signal<number>(150);
  readonly caffeineHour = signal<number>(14.0);
  readonly breathingMinutes = signal<number>(15);
  readonly breathingHour = signal<number>(13.5);
  readonly screenCutoffHour = signal<number>(21.0);

  hourSelected = output<{ hour: number; nodeHighlight: string }>();

  readonly formattedClockHour = computed(() => {
    let h = this.scrubberHour();
    if (h >= 24) h -= 24;
    const hours = Math.floor(h);
    const mins = Math.round((h - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  });

  readonly currentTelemetry = computed(() => {
    const t = this.scrubberHour();
    // Process S: Homeostatic sleep pressure (rises during wakefulness)
    const hoursAwake = Math.max(0, t - 6.5);
    const sleepPressure = 1.0 - Math.exp(-hoursAwake / 18.2);

    // Cortisol circadian curve (peaks ~08:00, drops in afternoon/evening)
    const normalizedH = t >= 24 ? t - 24 : t;
    const cortisolIndex = Math.max(2.0, 16.0 * Math.exp(-Math.pow((normalizedH - 8.5) / 4.5, 2)) + 3.0);

    // Active caffeine calculation (5-hour half-life)
    let activeCaffeine = 0;
    if (t >= this.caffeineHour()) {
      const elapsed = t - this.caffeineHour();
      activeCaffeine = this.caffeineDoseMg() * Math.pow(0.5, elapsed / 5.0);
    }

    // Autonomic RMSSD (baseline ~38ms + breathing gain - caffeine suppression)
    let rmssd = 38.0;
    if (t >= this.breathingHour() && t <= this.breathingHour() + 4.0) {
      rmssd += (this.breathingMinutes() / 15.0) * 8.5;
    }
    rmssd -= (activeCaffeine / 100.0) * 4.2;
    rmssd = Math.max(15.0, rmssd);

    return {
      sleepPressure,
      cortisolIndex,
      activeCaffeine,
      rmssd
    };
  });

  readonly projectedDeepSleepPct = computed(() => {
    // Nominal baseline 20% deep slow-wave sleep
    let sws = 20.0;
    // Late screen cutoff delay
    if (this.screenCutoffHour() > 22.0) {
      sws -= (this.screenCutoffHour() - 22.0) * 2.8;
    }
    // Bedtime residual caffeine penalty
    const bedtimeHour = 23.0;
    const elapsed = bedtimeHour - this.caffeineHour();
    if (elapsed > 0) {
      const residualCaff = this.caffeineDoseMg() * Math.pow(0.5, elapsed / 5.0);
      sws -= (residualCaff / 50.0) * 2.5;
    }
    // Resonance breathing gain
    sws += (this.breathingMinutes() / 15.0) * 2.2;
    return Math.max(8.0, Math.min(26.0, sws));
  });

  onHourSliderChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.scrubberHour.set(val);
    
    // Select anatomical regions in 3D viewer based on circadian phase
    let h = val >= 24 ? val - 24 : val;
    if (h >= 7 && h <= 11) {
      this.state.selectPart('brain');
      this.hourSelected.emit({ hour: val, nodeHighlight: 'brain' });
    } else if (h >= 13 && h <= 16) {
      this.state.selectPart('heart');
      this.hourSelected.emit({ hour: val, nodeHighlight: 'heart' });
    } else if (h >= 21 || h <= 5) {
      this.state.selectPart('head');
      this.hourSelected.emit({ hour: val, nodeHighlight: 'head' });
    }
  }

  onCaffeineChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.caffeineDoseMg.set(val);
  }

  onBreathingChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.breathingMinutes.set(val);
  }

  onScreenCutoffChange(event: Event): void {
    const val = parseFloat((event.target as HTMLSelectElement).value);
    this.screenCutoffHour.set(val);
  }
}