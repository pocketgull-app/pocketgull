import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

@Component({
  selector: 'app-actuarial-qaly-calculator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full mb-8 p-5 sm:p-7 bg-[#F9F3D9] dark:bg-zinc-950 text-[#1C1C1C] dark:text-zinc-100 rounded-2xl border-2 border-[#F6B12B] dark:border-[#F6B12B]/80 shadow-[4px_6px_0px_0px_rgba(28,28,28,0.85)] font-sans overflow-hidden pocket-gull-card">
      
      <!-- Background Texture & Papercraft Overlay -->
      <div class="absolute inset-0 opacity-15 pointer-events-none mix-blend-multiply bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:12px_12px]"></div>

      <!-- Top Bar Header -->
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-dashed border-[#1C1C1C]/20 dark:border-zinc-800 pb-5 mb-6 font-mono">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-xl bg-[#F6B12B] text-zinc-950 border-2 border-[#1C1C1C] flex items-center justify-center text-2xl shadow-[2px_2px_0px_0px_rgba(28,28,28,0.9)] animate-bounce shrink-0">
            🔭
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-mono font-extrabold uppercase tracking-widest text-[#EF6658] dark:text-orange-400">Gulliver Longevity Telemetry</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-[#8B5CF6] text-white font-bold tracking-wider uppercase border border-[#1C1C1C]">
                Gulliver 🔭 Dispatch
              </span>
              <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 border border-[#1C1C1C] uppercase">
                Interactive Bio-Calculator
              </span>
            </div>
            <h3 class="text-base sm:text-lg font-black uppercase tracking-tight text-[#1C1C1C] dark:text-zinc-100 mt-1">
              Actuarial QALY & Epigenetic Clock Simulation Dial
            </h3>
            <p class="text-xs sm:text-sm text-[#1C1C1C]/70 dark:text-zinc-400 mt-0.5 font-sans leading-relaxed">
              Adjust clinical protocol adherence sliders to calculate real-time biological age reduction and projected QALY longevity gains.
            </p>
          </div>
        </div>

        <div class="text-right text-xs sm:text-sm text-[#1C1C1C]/70 dark:text-zinc-400 font-mono shrink-0">
          <span>Base Bio-Age: <strong class="text-[#1C1C1C] dark:text-zinc-100 font-black">42.5 Yrs</strong></span>
        </div>
      </div>

      <!-- Main Grid: Sliders Left + Gauges Right -->
      <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        <!-- Left 7 Cols: Interactive Adherence Sliders -->
        <div class="lg:col-span-7 space-y-4">
          
          <!-- Slider 1: Vagal Breathing -->
          <div class="p-5 rounded-2xl border-2 border-[#1C1C1C] dark:border-zinc-700 bg-[#FFFFFF] dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] space-y-2 sub-panel">
            <div class="flex justify-between items-center text-xs font-bold font-mono">
              <label for="vagal-breathing-mins-input" class="text-[#1C1C1C] dark:text-zinc-200">🫁 0.1 Hz Vagal Resonant Breathing (Daily Mins)</label>
              <span class="text-orange-600 dark:text-orange-400 font-black">{{ vagalBreathingMins() }} Mins/Day</span>
            </div>
            <input id="vagal-breathing-mins-input" name="vagalBreathingMins" aria-label="0.1 Hz Vagal Resonant Breathing Daily Minutes" type="range" min="0" max="30" step="5" [value]="vagalBreathingMins()" (input)="vagalBreathingMins.set(asNumber($event))"
              class="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#1C1C1C] border border-[#1C1C1C]" />
            <div class="flex justify-between text-[10px] text-[#1C1C1C]/60 dark:text-zinc-400 font-mono">
              <span>0 Mins (Sedentary)</span>
              <span>15 Mins (Target)</span>
              <span>30 Mins (Optimal)</span>
            </div>
          </div>

          <!-- Slider 2: Chrono-Nutrition -->
          <div class="p-5 rounded-2xl border-2 border-[#1C1C1C] dark:border-zinc-700 bg-[#FFFFFF] dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] space-y-2 sub-panel">
            <div class="flex justify-between items-center text-xs font-bold font-mono">
              <label for="chrono-adherence-input" class="text-[#1C1C1C] dark:text-zinc-200">🥗 Chrono-Nutrition Window Alignment</label>
              <span class="text-orange-600 dark:text-orange-400 font-black">{{ chronoAdherence() }}% Alignment</span>
            </div>
            <input id="chrono-adherence-input" name="chronoAdherence" aria-label="Chrono-Nutrition Window Alignment Percentage" type="range" min="20" max="100" step="10" [value]="chronoAdherence()" (input)="chronoAdherence.set(asNumber($event))"
              class="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#1C1C1C] border border-[#1C1C1C]" />
            <div class="flex justify-between text-[10px] text-[#1C1C1C]/60 dark:text-zinc-400 font-mono">
              <span>20% (Irregular)</span>
              <span>60% (Moderate)</span>
              <span>100% (Strict BMAL1 Sync)</span>
            </div>
          </div>

          <!-- Slider 3: Exercise Biogenesis -->
          <div class="p-5 rounded-2xl border-2 border-[#1C1C1C] dark:border-zinc-700 bg-[#FFFFFF] dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] space-y-2 sub-panel">
            <div class="flex justify-between items-center text-xs font-bold font-mono">
              <label for="zone2-hours-input" class="text-[#1C1C1C] dark:text-zinc-200">⚡ Zone 2 Aerobic Biogenesis (Hrs/Week)</label>
              <span class="text-orange-600 dark:text-orange-400 font-black">{{ zone2Hours() }} Hrs/Wk</span>
            </div>
            <input id="zone2-hours-input" name="zone2Hours" aria-label="Zone 2 Aerobic Biogenesis Hours Per Week" type="range" min="0" max="8" step="0.5" [value]="zone2Hours()" (input)="zone2Hours.set(asNumber($event))"
              class="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#1C1C1C] border border-[#1C1C1C]" />
            <div class="flex justify-between text-[10px] text-[#1C1C1C]/60 dark:text-zinc-400 font-mono">
              <span>0 Hrs</span>
              <span>3 Hrs (Target)</span>
              <span>8 Hrs (Athlete)</span>
            </div>
          </div>

          <!-- Slider 4: Phytochemical Nootropics -->
          <div class="p-5 rounded-2xl border-2 border-[#1C1C1C] dark:border-zinc-700 bg-[#FFFFFF] dark:bg-zinc-900 text-[#1C1C1C] dark:text-zinc-100 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] space-y-2 sub-panel">
            <div class="flex justify-between items-center text-xs font-bold font-mono">
              <label for="precision-dosing-input" class="text-[#1C1C1C] dark:text-zinc-200">🍵 Precision Phytochemical & Methyl Donor Dosing</label>
              <span class="text-orange-600 dark:text-orange-400 font-black">{{ precisionDosing() }}% Dosing</span>
            </div>
            <input id="precision-dosing-input" name="precisionDosing" aria-label="Precision Phytochemical Dosing Percentage" type="range" min="0" max="100" step="10" [value]="precisionDosing()" (input)="precisionDosing.set(asNumber($event))"
              class="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#1C1C1C] border border-[#1C1C1C]" />
            <div class="flex justify-between text-[10px] text-[#1C1C1C]/60 dark:text-zinc-400 font-mono">
              <span>0% (None)</span>
              <span>50% (Partial)</span>
              <span>100% (Complete Rx)</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  `
})
export class ActuarialQalyCalculatorComponent {
  patientState = inject(PatientStateService);

  readonly isQalyFlipped = signal<boolean>(false);

  vagalBreathingMins = signal<number>(15);
  chronoAdherence = signal<number>(80);
  zone2Hours = signal<number>(3.5);
  precisionDosing = signal<number>(70);

  bioAgeDelta = computed(() => {
    const v = this.vagalBreathingMins();
    const c = this.chronoAdherence();
    const z = this.zone2Hours();
    const p = this.precisionDosing();

    const delta = -( (v * 0.12) + (c * 0.035) + (z * 0.45) + (p * 0.025) );
    return Math.max(-8.5, Math.min(-0.5, delta));
  });

  biologicalAge = computed(() => {
    return +(42.5 + this.bioAgeDelta()).toFixed(1);
  });

  qalyGained = computed(() => {
    const absDelta = Math.abs(this.bioAgeDelta());
    return +(absDelta * 1.65).toFixed(1);
  });

  dnamAgeSpeed = computed(() => {
    const delta = Math.abs(this.bioAgeDelta());
    return (1.0 - (delta / 42.5)).toFixed(2);
  });

  projectedQaly = computed(() => {
    return this.qalyGained();
  });

  asNumber(event: Event): number {
    return parseFloat((event.target as HTMLInputElement).value);
  }

  resetCalculator() {
    this.vagalBreathingMins.set(15);
    this.chronoAdherence.set(80);
    this.zone2Hours.set(3.5);
    this.precisionDosing.set(70);
  }
}
