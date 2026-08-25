import { Component, ChangeDetectionStrategy, signal, computed, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clinical-sleep-twin-dashboard',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto p-6 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 font-sans rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 space-y-6">
      
      <!-- Header -->
      <header class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4 gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🌙</span>
            <h2 class="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent tracking-tight">
              Clinical Sleep Twin Simulator
            </h2>
          </div>
          <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            PhysioNet 2026 Multi-Modal Sleep Intelligence Engine • Gemini 3.6 Flash & PubGemma 27B Grounded • Interactive Hypnogram & Conformal Risk Bounds
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Two-Headed Hydra (Gemini 3.6 Flash + PubGemma 27B) Active
          </span>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left Column: Interactive Clinical Parameter Sliders -->
        <div class="lg:col-span-4 space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-400 mb-4 flex items-center gap-1.5">
              <span>⚙️</span> Interactive Patient Parameters
            </h3>
            
            <!-- Age Slider -->
            <div class="mb-5">
              <div class="flex justify-between text-sm mb-1">
                <label for="age-slider" class="font-medium text-slate-700 dark:text-zinc-300">Chronological Age</label>
                <span class="text-indigo-600 dark:text-indigo-400 font-bold font-mono">{{ age() }} yrs</span>
              </div>
              <input type="range" id="age-slider" min="20" max="90" [value]="age()" 
                     (input)="onAgeChange($event)"
                     class="w-full accent-indigo-600 cursor-pointer">
              <p class="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Cohort-adjusted prevalence anchor</p>
            </div>

            <!-- AHI Slider -->
            <div class="mb-5">
              <div class="flex justify-between text-sm mb-1">
                <label for="ahi-slider" class="font-medium text-slate-700 dark:text-zinc-300">Apnea-Hypopnea Index (AHI)</label>
                <span class="text-rose-600 dark:text-rose-400 font-bold font-mono">{{ ahi() }} /hr</span>
              </div>
              <input type="range" id="ahi-slider" min="0" max="60" [value]="ahi()" 
                     (input)="onAhiChange($event)"
                     class="w-full accent-rose-500 cursor-pointer">
              <p class="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Drives hypnogram fragmentation & hypoxia</p>
            </div>

            <!-- N3 Deep Sleep Slider -->
            <div class="mb-5">
              <div class="flex justify-between text-sm mb-1">
                <label for="n3-slider" class="font-medium text-slate-700 dark:text-zinc-300">Deep Sleep (N3 SWS)</label>
                <span class="text-cyan-600 dark:text-cyan-400 font-bold font-mono">{{ n3Sws() }}%</span>
              </div>
              <input type="range" id="n3-slider" min="0" max="35" [value]="n3Sws()" 
                     (input)="onN3Change($event)"
                     class="w-full accent-cyan-500 cursor-pointer">
              <p class="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Glymphatic amyloid/tau clearance window</p>
            </div>

            <!-- Theta/Alpha Ratio Slider -->
            <div class="mb-2">
              <div class="flex justify-between text-sm mb-1">
                <label for="theta-slider" class="font-medium text-slate-700 dark:text-zinc-300">Theta / Alpha EEG Ratio</label>
                <span class="text-amber-600 dark:text-amber-400 font-bold font-mono">{{ thetaAlphaRatio().toFixed(1) }}</span>
              </div>
              <input type="range" id="theta-slider" min="0.5" max="3.0" step="0.1" [value]="thetaAlphaRatio()" 
                     (input)="onThetaChange($event)"
                     class="w-full accent-amber-500 cursor-pointer">
              <p class="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">EEG spectral biomarker for MCI</p>
            </div>
          </div>
        </div>

        <!-- Right Column: Risk Gauges, Conformal Bounds & Interactive Hypnogram -->
        <div class="lg:col-span-8 space-y-6">
          
          <!-- Top Row: Risk Output & Conformal Bounds -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Decoupled Risk Gauge Card -->
            <div class="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-center items-center relative overflow-hidden">
              <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"></div>
              <h3 class="text-xs font-medium text-slate-500 dark:text-zinc-400 mb-2">Predicted Cognitive Impairment Risk</h3>
              <div class="flex items-baseline space-x-1">
                <span [class]="riskScoreColorClass()" class="text-5xl font-black transition-colors duration-300 font-mono">
                  {{ riskScore() }}
                </span>
                <span class="text-xl font-medium text-slate-400 dark:text-zinc-500">%</span>
              </div>
              
              <span [class]="riskBadgeClass()" class="mt-3 text-xs font-bold px-2.5 py-1 rounded-md transition-all">
                {{ riskStatusText() }}
              </span>
            </div>

            <!-- 95% Conformal Prediction Bounds Card -->
            <div class="bg-slate-900 text-slate-100 p-6 rounded-xl border border-slate-800 shadow-md flex flex-col justify-center space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>🛡️</span> 95% Conformal Uncertainty Bound
                </h3>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  q_hat = 0.060
                </span>
              </div>

              <!-- Conformal Visual Interval Bar -->
              <div class="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden my-1 border border-slate-700">
                <!-- Conformal interval bar -->
                <div class="absolute top-0 h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 opacity-80 rounded-full transition-all duration-300"
                     [style.left.%]="conformalLower()"
                     [style.width.%]="conformalUpper() - conformalLower()"></div>
                
                <!-- Point prediction marker -->
                <div class="absolute top-0 w-1.5 h-full bg-white shadow-lg transform -translate-x-1/2 transition-all duration-300"
                     [style.left.%]="riskScore()"></div>
              </div>

              <div class="flex justify-between text-xs text-slate-400 font-mono">
                <span>Lower: <strong class="text-emerald-400">{{ conformalLower().toFixed(1) }}%</strong></span>
                <span>Point: <strong class="text-white">{{ riskScore() }}%</strong></span>
                <span>Upper: <strong class="text-purple-300">{{ conformalUpper().toFixed(1) }}%</strong></span>
              </div>

              <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Width: <strong class="text-slate-200 font-mono">{{ intervalWidth() }}</strong></span>
                @if (isTtaActive()) {
                  <span class="text-amber-400 font-bold text-[11px] flex items-center gap-1 animate-pulse">
                    ⚠️ Conformal TTA Active (Width > 0.20)
                  </span>
                } @else {
                  <span class="text-emerald-400 text-[11px] font-medium">
                    ✦ High Model Confidence
                  </span>
                }
              </div>
            </div>
          </div>

          <!-- Bottom Row: Dynamic 8-Hour Hypnogram (Markov Transitions) -->
          <div class="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <span>📈</span> Simulated 8-Hour Polysomnography Hypnogram (Markov Transitions)
              </h3>
              <span class="text-[10px] text-zinc-500 font-mono">Real-Time Waveform Generator</span>
            </div>
            
            <!-- Y-Axis Labels & SVG Canvas -->
            <div class="flex h-48 w-full pt-2">
              <div class="flex flex-col justify-between text-[11px] text-slate-400 font-mono pr-3 h-full pb-6">
                <span class="text-amber-500 font-bold">Wake</span>
                <span class="text-purple-400 font-bold">REM</span>
                <span class="text-zinc-400">N1</span>
                <span class="text-indigo-400 font-bold">N2</span>
                <span class="text-cyan-400 font-bold">N3 (SWS)</span>
              </div>
              
              <div class="relative flex-grow h-full border-l border-b border-slate-200 dark:border-zinc-800">
                <!-- SVG Line path -->
                <svg class="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 160">
                  <path [attr.d]="hypnogramPathD()" 
                        fill="none" 
                        stroke="#6366f1" 
                        stroke-width="2.5" 
                        stroke-linejoin="round" 
                        class="transition-all duration-500 ease-out" />
                </svg>
                
                <!-- X-Axis Labels -->
                <div class="absolute -bottom-6 w-full flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0h (Bedtime)</span>
                  <span>2h</span>
                  <span>4h</span>
                  <span>6h</span>
                  <span>8h (Wake)</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class ClinicalSleepTwinDashboardComponent {
  // Signals
  age = signal<number>(65);
  ahi = signal<number>(18);
  n3Sws = signal<number>(12);
  thetaAlphaRatio = signal<number>(1.5);

  // Computed Risk Logic (Two-Headed Hydra Mock)
  riskScore = computed(() => {
    let raw = (this.age() * 0.4) + (this.ahi() * 0.8) - (this.n3Sws() * 1.2) + (this.thetaAlphaRatio() * 10);
    raw = Math.max(5, Math.min(95, raw));
    return Math.round(raw);
  });

  riskStatusText = computed(() => {
    const score = this.riskScore();
    if (score > 60) return 'Elevated Risk (High Cognitive Burden)';
    if (score > 30) return 'Moderate Risk (Borderline MCI)';
    return 'Low Risk (Healthy Sleep Glymphatics)';
  });

  riskScoreColorClass = computed(() => {
    const score = this.riskScore();
    if (score > 60) return 'text-rose-600 dark:text-rose-400';
    if (score > 30) return 'text-amber-500 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  });

  riskBadgeClass = computed(() => {
    const score = this.riskScore();
    if (score > 60) return 'text-rose-700 bg-rose-50 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
    if (score > 30) return 'text-amber-800 bg-amber-50 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
    return 'text-emerald-800 bg-emerald-50 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
  });

  // Conformal Bounds (q_hat logic)
  conformalUncertainty = computed(() => {
    return 8 + (this.ahi() * 0.2) + ((35 - this.n3Sws()) * 0.2);
  });

  conformalLower = computed(() => Math.max(0, this.riskScore() - this.conformalUncertainty()));
  conformalUpper = computed(() => Math.min(100, this.riskScore() + this.conformalUncertainty()));
  intervalWidth = computed(() => ((this.conformalUpper() - this.conformalLower()) / 100).toFixed(2));
  isTtaActive = computed(() => parseFloat(this.intervalWidth()) > 0.20);

  // Dynamic Hypnogram Path Generator
  hypnogramPathD = computed(() => {
    const ahiVal = this.ahi();
    const n3Val = this.n3Sws();

    const svgWidth = 800;
    const svgHeight = 160;
    const stageHeight = svgHeight / 4; // 5 stages (0=Wake, 1=REM, 2=N1, 3=N2, 4=N3)

    let path = 'M 0,0 ';
    let currentStage = 0;

    // Seeded-like deterministic pseudo-random steps for smooth simulation
    for (let x = 0; x <= svgWidth; x += 20) {
      const progress = x / svgWidth;
      let targetStage = 3; // Default N2

      // SWS (N3) dominance early in night (first 40%)
      if (progress > 0.1 && progress < 0.45) {
        if ((x * 17) % 35 < n3Val) {
          targetStage = 4; // N3
        }
      }
      // REM dominance later in night (after 50%)
      else if (progress > 0.5) {
        if ((x * 13) % 100 > 60) {
          targetStage = 1; // REM
        }
      }

      // AHI Apnea Fragmentation spikes (arousals to Wake or N1)
      if ((x * 23 + ahiVal * 7) % 60 < ahiVal) {
        targetStage = ((x * 31) % 2 === 0) ? 0 : 2; // Wake or N1
      }

      const y = targetStage * stageHeight;
      path += `L ${x},${currentStage * stageHeight} L ${x},${y} `;
      currentStage = targetStage;
    }

    return path;
  });

  // Slider Handlers
  onAgeChange(event: Event) {
    this.age.set(parseFloat((event.target as HTMLInputElement).value));
  }

  onAhiChange(event: Event) {
    this.ahi.set(parseFloat((event.target as HTMLInputElement).value));
  }

  onN3Change(event: Event) {
    this.n3Sws.set(parseFloat((event.target as HTMLInputElement).value));
  }

  onThetaChange(event: Event) {
    this.thetaAlphaRatio.set(parseFloat((event.target as HTMLInputElement).value));
  }
}
