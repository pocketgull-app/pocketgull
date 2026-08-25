import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { ActuarialLongevityService, IOccupationalHazardProfile } from '../services/actuarial-longevity.service';

@Component({
  selector: 'app-occupational-hazard-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full overflow-hidden rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800/80 shadow-lg hover:shadow-2xl transition-all duration-300 p-5 font-sans">
      <!-- Ambient Glow Backdrop -->
      <div class="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-cyan-500/10 dark:bg-cyan-400/10 blur-3xl pointer-events-none"></div>

      @if (profile(); as prof) {
        <!-- 1. Header & Primary Identification -->
        <div class="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-zinc-800/80">
          <div class="space-y-1 max-w-xl">
            <div class="flex items-center gap-2">
              <span class="text-xl">🛡️</span>
              <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">{{ prof.professionTitle }}</h2>
              <span class="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                SOC {{ prof.socCode }}
              </span>
            </div>
            <p class="text-xs text-gray-500 dark:text-zinc-400 font-medium">
              Domain Category: <span class="text-slate-800 dark:text-zinc-200 font-semibold">{{ prof.category }}</span>
            </p>
          </div>

          <!-- Actuarial QALY Pill & Survival Reserve -->
          <div class="flex items-center gap-2">
            @if (actuarialProfile()?.survivalProbability5Year; as survivalProb) {
              <div class="px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 font-mono">
                <span>🛡️ 5-Yr Survival: {{ (survivalProb * 100).toFixed(1) }}%</span>
              </div>
            }

            <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border shadow-sm transition-transform hover:scale-105"
                 [class.bg-emerald-500\/10]="prof.actuarialQalyImpact >= 0"
                 [class.text-emerald-700]="prof.actuarialQalyImpact >= 0"
                 [class.dark:text-emerald-300]="prof.actuarialQalyImpact >= 0"
                 [class.border-emerald-500\/30]="prof.actuarialQalyImpact >= 0"
                 [class.bg-amber-500\/10]="prof.actuarialQalyImpact < 0"
                 [class.text-amber-700]="prof.actuarialQalyImpact < 0"
                 [class.dark:text-amber-300]="prof.actuarialQalyImpact < 0"
                 [class.border-amber-500\/30]="prof.actuarialQalyImpact < 0">
              <span>{{ prof.actuarialQalyImpact >= 0 ? '📈' : '📉' }}</span>
              <span>Actuarial QALY: {{ prof.actuarialQalyImpact >= 0 ? '+' : '' }}{{ prof.actuarialQalyImpact }} Years</span>
            </div>
          </div>
        </div>

        <!-- 2. SNOMED CT Hazard & Primary Clinical Disorder -->
        <div class="mt-4 p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-950/60 border border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-amber-500 dark:text-amber-400 font-bold">⚠️ SNOMED CT Hazard:</span>
            <span class="font-semibold text-slate-800 dark:text-zinc-200">{{ prof.snomedDisplay }}</span>
          </div>
          <span class="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-200/80 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold">
            SCT {{ prof.snomedCode }}
          </span>
        </div>

        <!-- Gompertz-Makeham Trajectory Curve Ribbon & Interactive Visualizer -->
        @if (survivalCurvePoints(); as points) {
          <div class="mt-4 p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 font-sans space-y-3">
            
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-800/40 pb-2">
              <div class="flex items-center gap-2">
                <span class="text-lg">⏳</span>
                <span class="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono">
                  Gompertz-Makeham 20-Yr Actuarial Survival Curve
                </span>
              </div>
              <div class="flex items-center gap-2 font-mono text-[11px]">
                <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  20-Yr Survival: {{ (points[points.length - 1]?.personalizedSurvival! * 100).toFixed(1) }}%
                </span>
                <span class="text-cyan-400/80 text-[10px] hidden sm:inline">
                  (vs {{ (points[points.length - 1]?.baselineSurvival! * 100).toFixed(1) }}% Baseline)
                </span>
              </div>
            </div>

            <!-- SVG Survival Horizon Polyline Chart -->
            <div class="relative w-full h-28 pt-2 pb-4">
              <svg class="w-full h-full overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
                <!-- Grid Lines -->
                <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(6,182,212,0.15)" stroke-dasharray="2,2" />
                <line x1="0" y1="40" x2="300" y2="40" stroke="rgba(6,182,212,0.15)" stroke-dasharray="2,2" />
                <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(6,182,212,0.15)" stroke-dasharray="2,2" />

                <!-- Baseline Population Curve (Dashed Sky Line) -->
                <polyline
                  [attr.points]="svgBaselinePoints()"
                  fill="none"
                  stroke="#38bdf8"
                  stroke-width="2"
                  stroke-dasharray="4,3"
                  opacity="0.6"
                />

                <!-- Intervention-Adjusted Survival Curve (Solid Emerald Gradient Line) -->
                <polyline
                  [attr.points]="svgPersonalizedPoints()"
                  fill="none"
                  stroke="#10b981"
                  stroke-width="3"
                  stroke-linecap="round"
                />

                <!-- Point Circles & Age Labels -->
                @for (pt of points; track pt.age; let idx = $index) {
                  @let x = idx * (300 / (points.length - 1));
                  @let yPers = 80 - (pt.personalizedSurvival * 70);
                  
                  <circle [attr.cx]="x" [attr.cy]="yPers" r="3.5" fill="#10b981" class="transition-all duration-300" />
                  <text [attr.x]="x" y="78" text-anchor="middle" fill="#94a3b8" font-size="8" font-family="monospace">
                    Age {{ pt.age }}
                  </text>
                }
              </svg>
            </div>

            <!-- Precision Longevity Intervention Sliders -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-cyan-800/40">
              
              <!-- 1. Vagal HRV Breathing -->
              <div class="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60 space-y-1">
                <div class="flex justify-between text-[10px] font-mono">
                  <span class="text-zinc-300 font-bold">🫁 Vagal HRV Gain</span>
                  <span class="text-emerald-400 font-bold">+{{ hrvGain() }}ms</span>
                </div>
                <input type="range" min="0" max="10" [value]="hrvGain()" (input)="onHrvChange($event)"
                       aria-label="Vagal HRV Gain Slider"
                       class="w-full h-2 accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer min-h-[44px]">
              </div>

              <!-- 2. Nrf2 Phase II Detox -->
              <div class="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60 space-y-1">
                <div class="flex justify-between text-[10px] font-mono">
                  <span class="text-zinc-300 font-bold">🌿 Nrf2 Antioxidant</span>
                  <span class="text-cyan-400 font-bold">Lvl {{ nrf2Level() }}</span>
                </div>
                <input type="range" min="0" max="10" [value]="nrf2Level()" (input)="onNrf2Change($event)"
                       aria-label="Nrf2 Antioxidant Level Slider"
                       class="w-full h-2 accent-cyan-500 bg-zinc-800 rounded-lg cursor-pointer min-h-[44px]">
              </div>

              <!-- 3. BMAL1 Circadian Feeding -->
              <div class="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60 space-y-1">
                <div class="flex justify-between text-[10px] font-mono">
                  <span class="text-zinc-300 font-bold">⏰ Circadian Feeding</span>
                  <span class="text-indigo-400 font-bold">{{ 14 - bmal1Window() }}h Fast</span>
                </div>
                <input type="range" min="0" max="6" [value]="bmal1Window()" (input)="onBmal1Change($event)"
                       aria-label="Circadian Fasting Window Slider"
                       class="w-full h-2 accent-indigo-500 bg-zinc-800 rounded-lg cursor-pointer min-h-[44px]">
              </div>

            </div>

          </div>
        }

        <!-- 3. 10D Occupational Hazard Score Grid -->
        <div class="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <!-- Ergonomic Strain -->
          <div class="p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-200/50 dark:border-zinc-800/50">
            <div class="flex justify-between text-[11px] font-medium text-gray-500 dark:text-zinc-400">
              <span>Ergonomic Strain</span>
              <span class="font-bold text-slate-800 dark:text-zinc-200">{{ prof.ergonomicStrainScore }}/10</span>
            </div>
            <div class="mt-2 w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-500" [style.width.%]="prof.ergonomicStrainScore * 10"></div>
            </div>
          </div>

          <!-- Circadian Disruption -->
          <div class="p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-200/50 dark:border-zinc-800/50">
            <div class="flex justify-between text-[11px] font-medium text-gray-500 dark:text-zinc-400">
              <span>Circadian Disruption</span>
              <span class="font-bold text-slate-800 dark:text-zinc-200">{{ prof.circadianDisruptionScore }}/10</span>
            </div>
            <div class="mt-2 w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-500" [style.width.%]="prof.circadianDisruptionScore * 10"></div>
            </div>
          </div>

          <!-- Chemical Exposure -->
          <div class="p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-200/50 dark:border-zinc-800/50">
            <div class="flex justify-between text-[11px] font-medium text-gray-500 dark:text-zinc-400">
              <span>Chemical Exposure</span>
              <span class="font-bold text-slate-800 dark:text-zinc-200">{{ prof.chemicalExposureScore }}/10</span>
            </div>
            <div class="mt-2 w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-500" [style.width.%]="prof.chemicalExposureScore * 10"></div>
            </div>
          </div>

          <!-- Allostatic Burnout -->
          <div class="p-3 rounded-xl bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-200/50 dark:border-zinc-800/50">
            <div class="flex justify-between text-[11px] font-medium text-gray-500 dark:text-zinc-400">
              <span>Allostatic Burnout</span>
              <span class="font-bold text-slate-800 dark:text-zinc-200">{{ prof.allostaticBurnoutScore }}/10</span>
            </div>
            <div class="mt-2 w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-500" [style.width.%]="prof.allostaticBurnoutScore * 10"></div>
            </div>
          </div>
        </div>

        <!-- 4. OSHA Mitigation Directives -->
        <div class="mt-4 space-y-3">
          <h3 class="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
            OSHA Directives & Ergonomic Protocols
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            @for (directive of prof.oshaMitigationDirectives; track $index) {
              <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950/50 border border-slate-200/60 dark:border-zinc-800/60 text-xs flex items-start gap-2">
                <span class="text-emerald-500 font-bold">✓</span>
                <span class="text-slate-700 dark:text-zinc-300 font-medium leading-tight">{{ directive }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Precision Nutrition & Therapeutic Hobbies -->
        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Therapeutic Hobbies -->
          <div class="space-y-2">
            <h4 class="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Therapeutic Recovery Hobbies
            </h4>
            <div class="flex flex-wrap gap-1.5">
              @for (hobby of prof.therapeuticHobbies; track $index) {
                <span class="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/20 text-[11px] font-medium">
                  {{ hobby }}
                </span>
              }
            </div>
          </div>

          <!-- Precision Occupational Nutrition -->
          <div class="space-y-2">
            <h4 class="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Precision Occupational Nutrition
            </h4>
            <div class="flex flex-wrap gap-1.5">
              @for (nutrient of prof.precisionOccupationalNutrition; track $index) {
                <span class="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 text-[11px] font-medium">
                  🌿 {{ nutrient }}
                </span>
              }
            </div>
          </div>
        </div>

        <!-- 5. Choral Vocal Resonance & Glee Protocol -->
        @if (prof.vocalResonanceProtocol) {
          <div class="mt-4 p-3.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-950/30 border border-indigo-500/20 text-xs">
            <div class="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-200 mb-1">
              <span>🎵</span>
              <span>Vocal Resonance & Choral Glee Vagal Protocol</span>
            </div>
            <p class="text-indigo-800 dark:text-indigo-300 leading-relaxed font-medium">
              {{ prof.vocalResonanceProtocol }}
            </p>
          </div>
        }
      } @else {
        <div class="py-8 text-center text-gray-500 dark:text-zinc-400 text-xs">
          <span>No occupation selected. Specify a profession in patient history to view actuarial hazard profiling.</span>
        </div>
      }
    </div>
  `
})
export class OccupationalHazardCardComponent {
  private patientState = inject(PatientStateService, { optional: true });
  private actuarialService = inject(ActuarialLongevityService, { optional: true });

  readonly hrvGain = signal<number>(5);
  readonly nrf2Level = signal<number>(5);
  readonly bmal1Window = signal<number>(3);

  readonly profile = computed<IOccupationalHazardProfile | null>(() => {
    if (this.patientState) {
      return this.patientState.occupationalProfile();
    }
    if (this.actuarialService) {
      return this.actuarialService.getOccupationalProfile('Polymath');
    }
    return null;
  });

  readonly actuarialProfile = computed(() => {
    if (!this.actuarialService) return null;
    const vitals = this.patientState?.vitals() || { hr: '72', spO2: '98' };
    const age = 45;
    const soc = this.profile()?.socCode;
    return this.actuarialService.calculateActuarialProfile(vitals, 75, age, soc);
  });

  readonly survivalCurvePoints = computed(() => {
    const prof = this.actuarialProfile();
    if (!prof || !this.actuarialService) return [];
    
    // Dynamically adjust Gompertz-Makeham parameters based on intervention sliders
    const baseParams = prof.gompertzParams || { alpha: 0.00003, beta: 0.085, lambda: 0.0005 };
    const hrvMod = 1.0 - (this.hrvGain() * 0.015); // Reduces aging acceleration beta
    const nrf2Mod = 1.0 - (this.nrf2Level() * 0.02); // Reduces intrinsic vulnerability alpha
    const bmal1Mod = 1.0 - (this.bmal1Window() * 0.03); // Reduces background hazard lambda

    const customParams = {
      alpha: Math.max(0.00001, baseParams.alpha * nrf2Mod),
      beta: Math.max(0.05, baseParams.beta * hrvMod),
      lambda: Math.max(0.0001, baseParams.lambda * bmal1Mod)
    };

    return this.actuarialService.generateLongevityRiskCurve(prof.chronologicalAge, prof.chronologicalAge + 20, customParams);
  });

  readonly svgBaselinePoints = computed(() => {
    const pts = this.survivalCurvePoints();
    if (pts.length === 0) return '';
    return pts.map((pt, idx) => {
      const x = idx * (300 / (pts.length - 1));
      const y = 80 - (pt.baselineSurvival * 70);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  });

  readonly svgPersonalizedPoints = computed(() => {
    const pts = this.survivalCurvePoints();
    if (pts.length === 0) return '';
    return pts.map((pt, idx) => {
      const x = idx * (300 / (pts.length - 1));
      const y = 80 - (pt.personalizedSurvival * 70);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  });

  onHrvChange(event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.hrvGain.set(val);
  }

  onNrf2Change(event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.nrf2Level.set(val);
  }

  onBmal1Change(event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.bmal1Window.set(val);
  }
}
