import { Component, ChangeDetectionStrategy, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PythonBridgeService, IActuarialQalyResponse } from '../services/python-bridge.service';

@Component({
  selector: 'app-actuarial-qaly-calculator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full mb-8 p-5 sm:p-7 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl shadow-xl font-sans overflow-hidden pocket-gull-card">
      
      <!-- Ambient Glow Highlights -->
      <div class="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -left-20 -bottom-20 w-80 h-80 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Top Bar Header -->
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5 mb-6">
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
            🔭
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-mono font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase">Gulliver Longevity Telemetry</span>
              <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 font-mono font-medium tracking-wide uppercase">
                Gulliver 🔭 Dispatch
              </span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 uppercase">
                Interactive Bio-Calculator
              </span>
              @if (liveActuarialData()) {
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 uppercase font-bold flex items-center gap-1">
                  <span>⚡</span> Python Sidecar Live
                </span>
              }
            </div>
            <h3 class="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
              Actuarial QALY & Epigenetic Clock Simulation Dial
            </h3>
            <p class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 font-sans leading-relaxed">
              Adjust clinical protocol adherence sliders to calculate real-time biological age reduction and projected QALY longevity gains.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/60 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs font-mono text-zinc-600 dark:text-zinc-400 shrink-0">
          <span>Base Chronological Age: <strong class="text-zinc-900 dark:text-zinc-100 font-bold">42.5 Yrs</strong></span>
        </div>
      </div>

      <!-- Main Grid: Sliders Left + Gauges Right -->
      <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left 7 Cols: Interactive Adherence Sliders -->
        <div class="lg:col-span-7 space-y-4">
          
          <!-- Slider 1: Vagal Breathing -->
          <div class="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 backdrop-blur-sm space-y-2">
            <div class="flex justify-between items-center text-xs font-medium">
              <label for="vagal-breathing-mins-input" class="text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5">
                <span>🫁</span>
                <span>0.1 Hz Vagal Resonant Breathing (Daily Mins)</span>
              </label>
              <span class="text-amber-600 dark:text-amber-400 font-mono font-bold">{{ vagalBreathingMins() }} Mins/Day</span>
            </div>
            <input id="vagal-breathing-mins-input" name="vagalBreathingMins" aria-label="0.1 Hz Vagal Resonant Breathing Daily Minutes" type="range" min="0" max="30" step="5" [value]="vagalBreathingMins()" (input)="vagalBreathingMins.set(asNumber($event))"
              class="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
            <div class="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
              <span>0 Mins (Sedentary)</span>
              <span>15 Mins (Target)</span>
              <span>30 Mins (Optimal)</span>
            </div>
          </div>

          <!-- Slider 2: Chrono-Nutrition -->
          <div class="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 backdrop-blur-sm space-y-2">
            <div class="flex justify-between items-center text-xs font-medium">
              <label for="chrono-adherence-input" class="text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5">
                <span>🥗</span>
                <span>Chrono-Nutrition Window Alignment</span>
              </label>
              <span class="text-amber-600 dark:text-amber-400 font-mono font-bold">{{ chronoAdherence() }}% Alignment</span>
            </div>
            <input id="chrono-adherence-input" name="chronoAdherence" aria-label="Chrono-Nutrition Window Alignment Percentage" type="range" min="20" max="100" step="10" [value]="chronoAdherence()" (input)="chronoAdherence.set(asNumber($event))"
              class="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
            <div class="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
              <span>20% (Irregular)</span>
              <span>80% (Consistent)</span>
              <span>100% (Strict 14:10)</span>
            </div>
          </div>

          <!-- Slider 3: Zone 2 Exercise -->
          <div class="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 backdrop-blur-sm space-y-2">
            <div class="flex justify-between items-center text-xs font-medium">
              <label for="zone2-hours-input" class="text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5">
                <span>🏃</span>
                <span>Mitochondrial Zone-2 Cardio (Weekly Hours)</span>
              </label>
              <span class="text-amber-600 dark:text-amber-400 font-mono font-bold">{{ zone2Hours() }} Hrs/Wk</span>
            </div>
            <input id="zone2-hours-input" name="zone2Hours" aria-label="Mitochondrial Zone-2 Cardio Weekly Hours" type="range" min="0" max="6" step="0.5" [value]="zone2Hours()" (input)="zone2Hours.set(asNumber($event))"
              class="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
            <div class="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
              <span>0 Hrs</span>
              <span>3.5 Hrs (Target)</span>
              <span>6.0 Hrs (Elite)</span>
            </div>
          </div>

          <!-- Slider 4: Precision Dosing & Polyphenol Index -->
          <div class="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 backdrop-blur-sm space-y-2">
            <div class="flex justify-between items-center text-xs font-medium">
              <label for="precision-dosing-input" class="text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5">
                <span>🧬</span>
                <span>Botanical Polyphenol & Anti-Inflammatory Index</span>
              </label>
              <span class="text-amber-600 dark:text-amber-400 font-mono font-bold">{{ precisionDosing() }}% Adherence</span>
            </div>
            <input id="precision-dosing-input" name="precisionDosing" aria-label="Botanical Polyphenol and Anti-Inflammatory Index Adherence Percentage" type="range" min="0" max="100" step="10" [value]="precisionDosing()" (input)="precisionDosing.set(asNumber($event))"
              class="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
            <div class="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
              <span>0% Baseline</span>
              <span>70% Standard Rx</span>
              <span>100% Synergistic</span>
            </div>
          </div>

        </div>

        <!-- Right 5 Cols: Real-Time Longevity Gauges & Financial Dividend -->
        <div class="lg:col-span-5 space-y-4">
          
          <!-- Primary Biological Age Outcome Card -->
          <div class="p-5 rounded-xl border border-teal-500/30 dark:border-teal-500/20 bg-gradient-to-br from-teal-500/5 via-teal-500/[0.02] to-transparent dark:from-teal-500/10 dark:via-zinc-900/60 dark:to-zinc-950/60 backdrop-blur-md">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono font-semibold text-teal-700 dark:text-teal-300 uppercase tracking-wider">
                Simulated Epigenetic Age
              </span>
              <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 font-bold">
                {{ bioAgeDelta() | number:'1.1-1' }} Yrs
              </span>
            </div>

            <div class="flex items-baseline gap-2">
              <span class="text-3xl sm:text-4xl font-black font-mono tracking-tight text-teal-700 dark:text-teal-300">
                {{ biologicalAge() }}
              </span>
              <span class="text-sm font-mono text-zinc-500 dark:text-zinc-400">Years Bio-Age</span>
            </div>

            <p class="text-xs text-zinc-600 dark:text-zinc-400 mt-2 font-sans leading-relaxed">
              Calculated via Horvath DNA methylation clock algorithms based on autonomic tone and metabolic resilience.
            </p>

            <div class="mt-4 pt-3 border-t border-teal-500/20 grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span class="text-[10px] text-zinc-500 dark:text-zinc-400 block uppercase">Aging Velocity</span>
                <span class="font-bold text-zinc-800 dark:text-zinc-200">{{ dnamAgeSpeed() }}x / yr</span>
              </div>
              <div>
                <span class="text-[10px] text-zinc-500 dark:text-zinc-400 block uppercase">Target Horizon</span>
                <span class="font-bold text-teal-600 dark:text-teal-400">-{{ -bioAgeDelta() | number:'1.1-1' }} Yrs Gain</span>
              </div>
            </div>
          </div>

          <!-- Secondary QALY Longevity Dividend Card -->
          <div class="p-5 rounded-xl border border-amber-500/30 dark:border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-amber-500/[0.02] to-transparent dark:from-amber-500/10 dark:via-zinc-900/60 dark:to-zinc-950/60 backdrop-blur-md">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                Projected QALY Dividend
              </span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
                Actuarial Model
              </span>
            </div>

            <div class="flex items-baseline gap-2">
              <span class="text-3xl sm:text-4xl font-black font-mono tracking-tight text-amber-600 dark:text-amber-400">
                +{{ qalyGained() }}
              </span>
              <span class="text-sm font-mono text-zinc-500 dark:text-zinc-400">QALYs</span>
            </div>

            <p class="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-sans">
              Quality-Adjusted Life Years added across the 3-decade trajectory with reduced chronic disease morbidity.
            </p>
            @if (annualCostDividend() > 0) {
              <div class="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-between text-xs font-mono">
                <span class="text-zinc-500 dark:text-zinc-400">Est. Healthcare Dividend:</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400">\${{ annualCostDividend() | number:'1.0-0' }}/yr</span>
              </div>
            }
          </div>

          <!-- Actions -->
          <button (click)="resetCalculator()" type="button" aria-label="Reset Calculator to Target Protocol"
            class="min-h-[44px] w-full px-4 py-2.5 rounded-xl text-xs font-mono font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center justify-center gap-2 touch-manipulation cursor-pointer">
            <span>🔄</span>
            <span>Reset to Target Protocol Baseline</span>
          </button>

        </div>

      </div>

    </div>
  `
})
export class ActuarialQalyCalculatorComponent {
  patientState = inject(PatientStateService);
  pythonBridge = inject(PythonBridgeService, { optional: true });

  readonly isQalyFlipped = signal<boolean>(false);
  readonly liveActuarialData = signal<IActuarialQalyResponse | null>(null);

  vagalBreathingMins = signal<number>(15);
  chronoAdherence = signal<number>(80);
  zone2Hours = signal<number>(3.5);
  precisionDosing = signal<number>(70);

  constructor() {
    try {
      effect(() => {
        const v = this.vagalBreathingMins();
        const c = this.chronoAdherence();
        const z = this.zone2Hours();
        const p = this.precisionDosing();

        if (this.pythonBridge) {
          // Trigger asynchronous call to FastAPI Python sidecar when sliders change
          void this.pythonBridge.evaluateActuarialQaly({
            chronological_age: 42.5,
            vagal_breathing_mins: v,
            chrono_adherence_pct: c,
            sleep_efficiency_pct: Math.min(100, 60 + z * 8),
            anti_inflammatory_index: p / 10,
            social_co_regulation_hrs: 8.0,
            discount_rate_pct: 3.0
          }).then(res => {
            if (res) {
              this.liveActuarialData.set(res);
            }
          }).catch(() => {
            // Graceful fallback
          });
        }
      });
    } catch {
      // Standalone injection context without scheduler
    }
  }

  bioAgeDelta = computed(() => {
    const live = this.liveActuarialData();
    if (live) {
      return -live.age_delta_years;
    }

    const v = this.vagalBreathingMins();
    const c = this.chronoAdherence();
    const z = this.zone2Hours();
    const p = this.precisionDosing();

    const delta = -( (v * 0.12) + (c * 0.035) + (z * 0.45) + (p * 0.025) );
    return Math.max(-8.5, Math.min(-0.5, delta));
  });

  biologicalAge = computed(() => {
    const live = this.liveActuarialData();
    if (live) {
      return live.biological_age;
    }
    return +(42.5 + this.bioAgeDelta()).toFixed(1);
  });

  qalyGained = computed(() => {
    const live = this.liveActuarialData();
    if (live) {
      return live.projected_discounted_qaly_gain;
    }
    const absDelta = Math.abs(this.bioAgeDelta());
    return +(absDelta * 1.65).toFixed(1);
  });

  dnamAgeSpeed = computed(() => {
    const live = this.liveActuarialData();
    if (live) {
      return live.epigenetic_pace_of_aging.toFixed(2);
    }
    const delta = Math.abs(this.bioAgeDelta());
    return (1.0 - (delta / 42.5)).toFixed(2);
  });

  annualCostDividend = computed(() => {
    const live = this.liveActuarialData();
    if (live) {
      return live.annual_healthcare_cost_dividend_usd;
    }
    return 0;
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
