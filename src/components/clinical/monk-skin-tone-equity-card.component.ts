import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonkSkinToneEquityService, IMonkSkinTone } from '../../services/monk-skin-tone-equity.service';

@Component({
  selector: 'app-monk-skin-tone-equity-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full bg-zinc-950 font-mono text-zinc-100 rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl relative mb-6">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 gap-3 z-20 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-4 h-4 rounded-full shadow-lg border border-white/40 shrink-0"
               [style.backgroundColor]="equityService.activeMonkSkinTone().hex"></div>
          <div>
            <h3 class="text-xs sm:text-sm font-black uppercase text-zinc-100 flex items-center gap-2">
              <span>🎨</span>
              <span>Monk Skin Tone (MST 1–10) Optical Equity &amp; Occult Hypoxemia CDS</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              Google Monk 10-Shade Scale &bull; FDA CDH 2024 Pulse Oximeter Guidance &bull; Adaptive rPPG Chrominance Matrix
            </p>
          </div>
        </div>

        <!-- Telemetry & Regulatory Badges -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md flex items-center gap-1.5"
                [ngClass]="{
                  'bg-rose-950/80 border-rose-600/60 text-rose-300 animate-pulse': equityService.occultHypoxemiaAssessment().riskTier === 'CRITICAL_STAT',
                  'bg-amber-950/80 border-amber-600/60 text-amber-300': equityService.occultHypoxemiaAssessment().riskTier === 'HIGH_ALERT',
                  'bg-yellow-950/80 border-yellow-600/60 text-yellow-300': equityService.occultHypoxemiaAssessment().riskTier === 'BORDERLINE',
                  'bg-emerald-950/80 border-emerald-600/60 text-emerald-300': equityService.occultHypoxemiaAssessment().riskTier === 'NORMAL_LOW'
                }">
            <span class="w-2 h-2 rounded-full"
                  [ngClass]="{
                    'bg-rose-400 animate-ping': equityService.occultHypoxemiaAssessment().riskTier === 'CRITICAL_STAT',
                    'bg-amber-400': equityService.occultHypoxemiaAssessment().riskTier === 'HIGH_ALERT',
                    'bg-yellow-400': equityService.occultHypoxemiaAssessment().riskTier === 'BORDERLINE',
                    'bg-emerald-400': equityService.occultHypoxemiaAssessment().riskTier === 'NORMAL_LOW'
                  }"></span>
            <span>{{ equityService.occultHypoxemiaAssessment().riskTier.replace('_', ' ') }}</span>
          </span>

          <span class="px-2.5 py-1 rounded-xl text-[10px] font-bold border border-zinc-700 bg-zinc-900 text-zinc-300 hidden sm:inline-flex">
            FDA CDH 2024 Compliant
          </span>
        </div>
      </div>

      <!-- Presets Toolbar -->
      <div class="flex flex-wrap items-center gap-1.5 p-3 bg-zinc-900/60 border-b border-zinc-800 text-xs">
        <span class="text-[10px] font-bold text-zinc-400 uppercase mr-1">Clinical Presets:</span>
        <button type="button" (click)="applyPreset(2, 98, 1.8)"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer"
                [class.bg-emerald-950]="equityService.selectedMstShade() === 2 && equityService.observedSpO2() === 98"
                [class.border-emerald-600]="equityService.selectedMstShade() === 2 && equityService.observedSpO2() === 98">
          MST 02 Baseline (SpO2 98%)
        </button>
        <button type="button" (click)="applyPreset(8, 91, 0.4)"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer"
                [class.bg-rose-950]="equityService.selectedMstShade() === 8 && equityService.observedSpO2() === 91"
                [class.border-rose-600]="equityService.selectedMstShade() === 8 && equityService.observedSpO2() === 91">
          MST 08 Occult Hypoxemia (SpO2 91%, PI 0.4%)
        </button>
        <button type="button" (click)="applyPreset(6, 93, 1.2)"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer"
                [class.bg-amber-950]="equityService.selectedMstShade() === 6 && equityService.observedSpO2() === 93"
                [class.border-amber-600]="equityService.selectedMstShade() === 6 && equityService.observedSpO2() === 93">
          MST 06 Melanin Shift (SpO2 93%)
        </button>
        <button type="button" (click)="applyPreset(10, 89, 0.9)"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer"
                [class.bg-purple-950]="equityService.selectedMstShade() === 10 && equityService.observedSpO2() === 89"
                [class.border-purple-600]="equityService.selectedMstShade() === 10 && equityService.observedSpO2() === 89">
          MST 10 Severe Hypoxemia (SpO2 89%)
        </button>
      </div>

      <!-- Main Body -->
      <div class="p-4 space-y-4">
        
        <!-- 10-Swatch Interactive Monk Skin Tone Palette -->
        <div class="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Select Monk Skin Tone (MST 01 – MST 10)</span>
            </span>
            <span class="text-xs font-bold text-amber-400">
              Active: {{ equityService.activeMonkSkinTone().code }} &bull; {{ equityService.activeMonkSkinTone().label }} (Fitzpatrick {{ equityService.activeMonkSkinTone().fitzpatrickScale }})
            </span>
          </div>

          <!-- Swatches Grid -->
          <div class="grid grid-cols-5 sm:grid-cols-10 gap-2">
            @for (tone of equityService.monkSkinTones; track tone.shade) {
              <button
                type="button"
                (click)="equityService.setMstShade(tone.shade)"
                [title]="tone.code + ': ' + tone.label + ' (Fitzpatrick ' + tone.fitzpatrickScale + ')'"
                class="flex flex-col items-center justify-between p-2 rounded-xl border transition-all cursor-pointer min-h-[72px] relative group"
                [ngClass]="equityService.selectedMstShade() === tone.shade 
                  ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105 shadow-lg shadow-black/60 bg-zinc-800/80' 
                  : 'border-zinc-800 hover:border-zinc-600 hover:scale-102 bg-zinc-900/40'">
                
                <!-- Swatch Circle -->
                <div class="w-8 h-8 rounded-full border border-white/20 shadow-md group-hover:scale-110 transition-transform shrink-0"
                     [style.backgroundColor]="tone.hex"></div>

                <div class="text-center mt-1">
                  <span class="block text-[11px] font-bold leading-tight"
                        [class.text-amber-300]="equityService.selectedMstShade() === tone.shade"
                        [class.text-zinc-300]="equityService.selectedMstShade() !== tone.shade">
                    {{ tone.code }}
                  </span>
                  <span class="block text-[9px] text-zinc-400 leading-tight">
                    Fitz {{ tone.fitzpatrickScale }}
                  </span>
                </div>

                @if (equityService.selectedMstShade() === tone.shade) {
                  <span class="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-zinc-950 flex items-center justify-center text-[8px] font-black text-zinc-950">✓</span>
                }
              </button>
            }
          </div>
        </div>

        <!-- Two Columns: Oximetry Calibration & rPPG Equalization -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          <!-- Column 1: Pulse Oximetry Occult Hypoxemia Defense (7 cols) -->
          <div class="lg:col-span-7 flex flex-col gap-3">
            <div class="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
              
              <!-- Inputs Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <!-- SpO2 Slider -->
                <div>
                  <div class="flex justify-between items-center text-xs mb-1.5">
                    <span class="text-zinc-400 font-bold">Observed SpO2 (Pulse Oximeter)</span>
                    <span class="text-amber-400 font-black text-sm tabular-nums">{{ equityService.observedSpO2() }}%</span>
                  </div>
                  <input
                    type="range"
                    min="75"
                    max="100"
                    step="1"
                    [ngModel]="equityService.observedSpO2()"
                    (ngModelChange)="equityService.observedSpO2.set($event)"
                    class="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-800 rounded-lg">
                  <div class="flex justify-between text-[10px] text-zinc-500 mt-1">
                    <span>75%</span>
                    <span>88% (Hypoxemia Threshold)</span>
                    <span>100%</span>
                  </div>
                </div>

                <!-- Perfusion Index Slider -->
                <div>
                  <div class="flex justify-between items-center text-xs mb-1.5">
                    <span class="text-zinc-400 font-bold">Perfusion Index (PI)</span>
                    <span class="font-black text-sm tabular-nums"
                          [class.text-rose-400]="equityService.perfusionIndex() < 0.5"
                          [class.text-emerald-400]="equityService.perfusionIndex() >= 0.5">
                      {{ equityService.perfusionIndex().toFixed(1) }}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="5.0"
                    step="0.1"
                    [ngModel]="equityService.perfusionIndex()"
                    (ngModelChange)="equityService.perfusionIndex.set($event)"
                    class="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-800 rounded-lg">
                  <div class="flex justify-between text-[10px] text-zinc-500 mt-1">
                    <span class="text-rose-400">&lt;0.5% (Low)</span>
                    <span>Adequate (&ge;1.0%)</span>
                    <span>5.0%</span>
                  </div>
                </div>
              </div>

              <!-- Dual-Readout Comparison Panel -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-black/40 border border-zinc-800 mb-3">
                
                <!-- Raw Uncalibrated Reading -->
                <div class="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
                  <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    1. Displayed Oximeter SpO2
                  </span>
                  <div class="flex items-baseline gap-2">
                    <span class="text-2xl sm:text-3xl font-black text-zinc-200 tabular-nums">
                      {{ equityService.observedSpO2() }}%
                    </span>
                    <span class="text-[10px] text-zinc-400 uppercase">Uncorrected</span>
                  </div>
                  <p class="text-[10px] text-zinc-400 font-sans mt-2">
                    Standard calibration assuming Caucasian dermal optical absorption.
                  </p>
                </div>

                <!-- Calibrated Arterial Estimate -->
                <div class="p-3 rounded-lg border flex flex-col justify-between"
                     [ngClass]="{
                       'bg-rose-950/40 border-rose-600/60': equityService.occultHypoxemiaAssessment().riskTier === 'CRITICAL_STAT',
                       'bg-amber-950/40 border-amber-600/60': equityService.occultHypoxemiaAssessment().riskTier === 'HIGH_ALERT',
                       'bg-zinc-900/80 border-emerald-600/40': equityService.occultHypoxemiaAssessment().riskTier === 'NORMAL_LOW' || equityService.occultHypoxemiaAssessment().riskTier === 'BORDERLINE'
                     }">
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-[10px] font-bold uppercase tracking-wider block"
                          [class.text-rose-300]="equityService.occultHypoxemiaAssessment().riskTier === 'CRITICAL_STAT'"
                          [class.text-amber-300]="equityService.occultHypoxemiaAssessment().riskTier === 'HIGH_ALERT'"
                          [class.text-emerald-300]="equityService.occultHypoxemiaAssessment().riskTier === 'NORMAL_LOW' || equityService.occultHypoxemiaAssessment().riskTier === 'BORDERLINE'">
                      2. Calibrated True SaO2 (MST {{ equityService.selectedMstShade() }})
                    </span>
                    <span class="text-[10px] font-mono font-bold text-rose-400">
                      Bias: +{{ equityService.occultHypoxemiaAssessment().estimatedBiasOffsetPct }}%
                    </span>
                  </div>
                  
                  <div class="flex items-baseline gap-2">
                    <span class="text-2xl sm:text-3xl font-black tabular-nums"
                          [class.text-rose-400]="equityService.occultHypoxemiaAssessment().calibratedSaO2EstimatePct < 88"
                          [class.text-amber-400]="equityService.occultHypoxemiaAssessment().calibratedSaO2EstimatePct >= 88 && equityService.occultHypoxemiaAssessment().calibratedSaO2EstimatePct < 92"
                          [class.text-emerald-400]="equityService.occultHypoxemiaAssessment().calibratedSaO2EstimatePct >= 92">
                      {{ equityService.occultHypoxemiaAssessment().calibratedSaO2EstimatePct }}%
                    </span>
                    <span class="text-xs text-zinc-400">
                      [95% CI: {{ equityService.occultHypoxemiaAssessment().confidenceInterval95[0] }}%–{{ equityService.occultHypoxemiaAssessment().confidenceInterval95[1] }}%]
                    </span>
                  </div>

                  <p class="text-[10px] font-sans mt-2"
                     [class.text-rose-300]="equityService.occultHypoxemiaAssessment().riskTier === 'CRITICAL_STAT'"
                     [class.text-zinc-400]="equityService.occultHypoxemiaAssessment().riskTier !== 'CRITICAL_STAT'">
                    Adjusted for epidermal melanin absorption at 660 nm vs. 940 nm.
                  </p>
                </div>
              </div>

              <!-- Occult Hypoxemia Probability Bar -->
              <div class="p-3 rounded-xl bg-black/30 border border-zinc-800">
                <div class="flex justify-between items-center text-xs mb-1.5">
                  <span class="text-zinc-400 font-bold">Occult Hypoxemia Probability (True SaO2 &lt; 88%)</span>
                  <span class="font-bold tabular-nums"
                        [class.text-rose-400]="equityService.occultHypoxemiaAssessment().occultHypoxemiaProbabilityPct >= 30"
                        [class.text-amber-400]="equityService.occultHypoxemiaAssessment().occultHypoxemiaProbabilityPct >= 15 && equityService.occultHypoxemiaAssessment().occultHypoxemiaProbabilityPct < 30"
                        [class.text-emerald-400]="equityService.occultHypoxemiaAssessment().occultHypoxemiaProbabilityPct < 15">
                    {{ equityService.occultHypoxemiaAssessment().occultHypoxemiaProbabilityPct }}%
                  </span>
                </div>
                <div class="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden flex">
                  <div class="h-full transition-all duration-300"
                       [style.width.%]="equityService.occultHypoxemiaAssessment().occultHypoxemiaProbabilityPct"
                       [ngClass]="{
                         'bg-rose-500': equityService.occultHypoxemiaAssessment().occultHypoxemiaProbabilityPct >= 30,
                         'bg-amber-500': equityService.occultHypoxemiaAssessment().occultHypoxemiaProbabilityPct >= 15 && equityService.occultHypoxemiaAssessment().occultHypoxemiaProbabilityPct < 30,
                         'bg-emerald-500': equityService.occultHypoxemiaAssessment().occultHypoxemiaProbabilityPct < 15
                       }"></div>
                </div>
              </div>

              <!-- Clinical Directive Callout -->
              <div class="p-3 rounded-xl border mt-3"
                   [ngClass]="{
                     'bg-rose-950/60 border-rose-600/70 text-rose-200': equityService.occultHypoxemiaAssessment().abgCoTestRecommended,
                     'bg-zinc-900/60 border-zinc-800 text-zinc-300': !equityService.occultHypoxemiaAssessment().abgCoTestRecommended
                   }">
                <div class="flex items-start gap-2">
                  <span class="text-base shrink-0">{{ equityService.occultHypoxemiaAssessment().abgCoTestRecommended ? '🚨' : '📋' }}</span>
                  <div class="space-y-1">
                    <h4 class="text-xs font-bold uppercase tracking-wider"
                        [class.text-rose-300]="equityService.occultHypoxemiaAssessment().abgCoTestRecommended"
                        [class.text-zinc-200]="!equityService.occultHypoxemiaAssessment().abgCoTestRecommended">
                      {{ equityService.occultHypoxemiaAssessment().abgCoTestRecommended ? 'Arterial Blood Gas (ABG) Co-Test Recommended' : 'Clinical Monitoring Guidance' }}
                    </h4>
                    <p class="text-xs font-sans leading-relaxed">
                      {{ equityService.occultHypoxemiaAssessment().clinicalGuidance }}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Column 2: Contactless rPPG Melanin Compensation (5 cols) -->
          <div class="lg:col-span-5 flex flex-col gap-3">
            <div class="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between h-full">
              
              <div class="space-y-3">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span class="text-xs font-bold text-zinc-200 uppercase flex items-center gap-1.5">
                    <span>📷</span> Adaptive rPPG Chrominance Matrix
                  </span>
                  <span class="text-[10px] text-teal-400 font-bold">POS/CHROM Zero-Egress</span>
                </div>

                <p class="text-xs font-sans text-zinc-400 leading-relaxed">
                  In melanin-rich skin, epidermal melanin absorbs green light (520–550 nm), dampening optical pulsations. 
                  Our client-side WebGPU pipeline shifts projection weight to red (630–660 nm) to maintain high pulsatile SNR.
                </p>

                <!-- Adaptive Chrominance Weights Breakdown -->
                <div class="space-y-2 pt-1">
                  <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Dynamic Chrominance Projection Weights (MST {{ equityService.selectedMstShade() }})
                  </div>

                  <!-- Green Channel -->
                  <div>
                    <div class="flex justify-between text-xs mb-1">
                      <span class="text-emerald-400 font-bold">Green Channel (520–560 nm)</span>
                      <span class="font-bold tabular-nums text-emerald-300">{{ (equityService.adaptiveRppgWeights().wGreen * 100).toFixed(1) }}%</span>
                    </div>
                    <div class="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div class="bg-emerald-500 h-full transition-all duration-300"
                           [style.width.%]="equityService.adaptiveRppgWeights().wGreen * 100"></div>
                    </div>
                  </div>

                  <!-- Red Channel -->
                  <div>
                    <div class="flex justify-between text-xs mb-1">
                      <span class="text-rose-400 font-bold">Red Channel (620–660 nm)</span>
                      <span class="font-bold tabular-nums text-rose-300">{{ (equityService.adaptiveRppgWeights().wRed * 100).toFixed(1) }}%</span>
                    </div>
                    <div class="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div class="bg-rose-500 h-full transition-all duration-300"
                           [style.width.%]="equityService.adaptiveRppgWeights().wRed * 100"></div>
                    </div>
                  </div>

                  <!-- Blue Channel -->
                  <div>
                    <div class="flex justify-between text-xs mb-1">
                      <span class="text-blue-400 font-bold">Blue Channel (450–490 nm)</span>
                      <span class="font-bold tabular-nums text-blue-300">{{ (equityService.adaptiveRppgWeights().wBlue * 100).toFixed(1) }}%</span>
                    </div>
                    <div class="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div class="bg-blue-500 h-full transition-all duration-300"
                           [style.width.%]="equityService.adaptiveRppgWeights().wBlue * 100"></div>
                    </div>
                  </div>
                </div>

                <!-- Signal Metrics Summary Table -->
                <div class="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800 text-xs">
                  <div class="p-2 rounded-lg bg-black/40 border border-zinc-800">
                    <span class="text-[9px] text-zinc-400 uppercase block">SNR Equalization Boost</span>
                    <span class="text-sm font-bold text-teal-400 tabular-nums">+{{ equityService.adaptiveRppgWeights().snrBoostDb }} dB</span>
                  </div>
                  <div class="p-2 rounded-lg bg-black/40 border border-zinc-800">
                    <span class="text-[9px] text-zinc-400 uppercase block">Melanin Extinction Mult.</span>
                    <span class="text-sm font-bold text-amber-400 tabular-nums">{{ equityService.activeMonkSkinTone().greenExtinctionMultiplier }}x</span>
                  </div>
                </div>

              </div>

              <!-- Statutory Disclaimer Footer -->
              <div class="mt-4 pt-3 border-t border-zinc-800/80 text-[10px] text-zinc-400 font-sans leading-relaxed">
                <span>⚖️ {{ equityService.occultHypoxemiaAssessment().statutoryNotice }}</span>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  `
})
export class MonkSkinToneEquityCardComponent {
  equityService = inject(MonkSkinToneEquityService);

  applyPreset(shade: number, spO2: number, pi: number): void {
    this.equityService.setMstShade(shade);
    this.equityService.observedSpO2.set(spO2);
    this.equityService.perfusionIndex.set(pi);
  }
}
