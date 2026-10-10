import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlateVisionPhotometryService } from '../services/plate-vision-photometry.service';
import { CircadianChronoNutritionService } from '../services/circadian-chrono-nutrition.service';
import { MicrobiomeFermentationVaultService } from '../services/microbiome-fermentation-vault.service';

export type ChronoBiomeTab = 'plate_vision' | 'circadian_chrono' | 'microbiome_vault';

@Component({
  selector: 'app-chrono-biome-plate-suite',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <span class="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xl font-bold">🔬</span>
          <div>
            <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Bio-Photometry, Chrono-Nutrition & Microbiome Vault</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 font-mono font-bold uppercase">Zero-Egress Edge</span>
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">On-device WebGPU plate photometry, MTNR1B circadian metabolic clock, and colonic SCFA fermentation.</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl gap-1">
          <button
            type="button"
            (click)="activeTab.set('plate_vision')"
            [class]="activeTab() === 'plate_vision' 
              ? 'bg-white dark:bg-zinc-900 text-teal-600 dark:text-teal-400 shadow-sm font-semibold' 
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'"
            class="px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 min-h-[36px]">
            <span>📸</span>
            <span>Plate Vision</span>
          </button>
          <button
            type="button"
            (click)="activeTab.set('circadian_chrono')"
            [class]="activeTab() === 'circadian_chrono' 
              ? 'bg-white dark:bg-zinc-900 text-teal-600 dark:text-teal-400 shadow-sm font-semibold' 
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'"
            class="px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 min-h-[36px]">
            <span>⏰</span>
            <span>Chrono-Nutrition</span>
          </button>
          <button
            type="button"
            (click)="activeTab.set('microbiome_vault')"
            [class]="activeTab() === 'microbiome_vault' 
              ? 'bg-white dark:bg-zinc-900 text-teal-600 dark:text-teal-400 shadow-sm font-semibold' 
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'"
            class="px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 min-h-[36px]">
            <span>🧫</span>
            <span>Microbiome & SCFA</span>
          </button>
        </div>
      </div>

      <!-- Tab 1: On-Device Plate Vision & Pre-Bite Glucose Curve -->
      @if (activeTab() === 'plate_vision') {
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-teal-500/5 border border-teal-500/20">
            <div class="space-y-1">
              <span class="text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center gap-2">
                <span>🛡️ HIPAA §164.514 Air-Gapped Photometry</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-600 dark:text-teal-400 font-mono">0 Pixels Egress</span>
              </span>
              <p class="text-xs text-zinc-600 dark:text-zinc-300">WebGPU in-browser tensor segmentation calculates volume, macronutrients, and glycemic excursion before you eat.</p>
            </div>
            <button
              type="button"
              (click)="triggerNewPlateScan()"
              [disabled]="plateVisionService.isProcessing()"
              class="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 min-h-[44px]">
              @if (plateVisionService.isProcessing()) {
                <span class="animate-spin text-sm">🔄</span>
                <span>Segmenting Plate...</span>
              } @else {
                <span>📷</span>
                <span>Scan New Plate</span>
              }
            </button>
          </div>

          @if (plateVisionService.currentPlateResult(); as plate) {
            <!-- Macronutrient Metric Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div class="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <span class="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 block">Energy</span>
                <span class="text-lg font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{{ plate.totalCalories }}</span>
                <span class="text-[10px] text-zinc-400 ml-1">kcal</span>
              </div>
              <div class="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <span class="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 block">Net Carbs</span>
                <span class="text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums">{{ plate.totalNetCarbsGrams }}</span>
                <span class="text-[10px] text-zinc-400 ml-1">g</span>
              </div>
              <div class="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <span class="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 block">Prebiotic Fiber</span>
                <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{{ plate.totalFiberGrams }}</span>
                <span class="text-[10px] text-zinc-400 ml-1">g</span>
              </div>
              <div class="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <span class="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 block">Protein</span>
                <span class="text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums">{{ plate.totalProteinGrams }}</span>
                <span class="text-[10px] text-zinc-400 ml-1">g</span>
              </div>
              <div class="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 col-span-2 sm:col-span-1">
                <span class="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 block">Glycemic Load</span>
                <span class="text-lg font-bold text-purple-600 dark:text-purple-400 tabular-nums">{{ plate.aggregateGlycemicLoad }}</span>
                <span class="text-[10px] text-zinc-400 ml-1">GL</span>
              </div>
            </div>

            <!-- Predicted Glucose Curve HUD -->
            <div class="p-5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Pre-Bite Bergman Minimal Model Glucose Projection</span>
                </div>
                <span class="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  Predicted TIR: <strong class="text-emerald-400">{{ plate.predictedGlucoseExcursion.predictedTimeInRangePct }}%</strong>
                </span>
              </div>

              <!-- Curve Simulation Graphic -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-800/80 pt-4">
                <div class="space-y-1">
                  <span class="text-[11px] font-mono text-zinc-400 block">Fasting Baseline</span>
                  <div class="text-2xl font-bold font-mono text-zinc-200 tabular-nums">{{ plate.predictedGlucoseExcursion.baselineMgDl }} <span class="text-xs font-normal text-zinc-500">mg/dL</span></div>
                  <span class="text-[10px] text-zinc-500">Normal euglycemic range</span>
                </div>
                <div class="space-y-1">
                  <span class="text-[11px] font-mono text-zinc-400 block">Projected Peak</span>
                  <div class="text-2xl font-bold font-mono text-amber-400 tabular-nums">{{ plate.predictedGlucoseExcursion.projectedPeakMgDl }} <span class="text-xs font-normal text-zinc-500">mg/dL</span></div>
                  <span class="text-[10px] text-zinc-400">Excursion in ~{{ plate.predictedGlucoseExcursion.minutesToPeak }} min</span>
                </div>
                <div class="space-y-1">
                  <span class="text-[11px] font-mono text-zinc-400 block">Glycemic Risk Tier</span>
                  <div class="inline-block px-2.5 py-1 rounded-lg text-xs font-bold font-mono"
                    [class]="plate.predictedGlucoseExcursion.glycemicVariabilityRisk === 'Low' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'">
                    {{ plate.predictedGlucoseExcursion.glycemicVariabilityRisk }}
                  </div>
                  <p class="text-[10px] text-zinc-400 leading-relaxed">{{ plate.predictedGlucoseExcursion.clinicalPacingGuidance }}</p>
                </div>
              </div>
            </div>

            <!-- Segmented Items List -->
            <div class="space-y-2">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">Detected Plate Components</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                @for (item of plate.items; track item.id) {
                  <div class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <div class="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{{ item.name }}</div>
                      <span class="text-[10px] text-zinc-500">{{ item.foodCategory }} • {{ item.estimatedPortionGrams }}g</span>
                    </div>
                    <div class="text-right font-mono text-xs">
                      <span class="text-amber-600 dark:text-amber-400 font-bold">{{ item.netCarbsGrams }}g C</span>
                      <span class="text-zinc-400 text-[10px] block">GI {{ item.glycemicIndex }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Tab 2: Circadian Chrono-Nutrition & MTNR1B Melatonin Interlock -->
      @if (activeTab() === 'circadian_chrono') {
        <div class="space-y-6">
          @if (chronoNutritionService.currentStatus(); as status) {
            <!-- Circadian Status Banner -->
            <div class="p-5 rounded-2xl border space-y-4"
              [class]="status.lateNightConflictDetected 
                ? 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-950/20' 
                : 'bg-teal-500/5 border-teal-500/20 dark:bg-teal-950/20'">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span class="text-3xl">
                    @if (status.circadianPhase === 'Morning_Metabolic_Peak') { 🌅 }
                    @else if (status.circadianPhase === 'Midday_Sustained') { ☀️ }
                    @else if (status.circadianPhase === 'Dusk_Tapering') { 🌆 }
                    @else { 🌙 }
                  </span>
                  <div>
                    <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>{{ status.circadianPhase.replace('_', ' ').replace('_', ' ') }}</span>
                      <span class="text-[10px] px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono">
                        {{ status.currentHour }}:00 Circadian Time
                      </span>
                    </h4>
                    <p class="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">{{ status.circadianPacingDirective }}</p>
                  </div>
                </div>

                @if (status.mtnr1bInterlockActive) {
                  <span class="px-2.5 py-1 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 font-mono font-bold text-[11px] self-start sm:self-auto">
                    ⚠️ MTNR1B Melatonin Interlock Active
                  </span>
                }
              </div>

              <!-- Biophysical Gauges -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-3">
                <div>
                  <span class="text-[10px] font-mono text-zinc-500 uppercase block">Insulin Sensitivity</span>
                  <span class="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
                    {{ status.insulinSensitivityMultiplier }}x
                  </span>
                  <span class="text-[10px] text-zinc-400 block">Morning peak is 1.8x</span>
                </div>
                <div>
                  <span class="text-[10px] font-mono text-zinc-500 uppercase block">Pineal Melatonin</span>
                  <span class="text-sm font-bold font-mono text-zinc-800 dark:text-zinc-200">
                    {{ status.melatoninLevelEstimate }}
                  </span>
                  <span class="text-[10px] text-zinc-400 block">Suppresses beta-cells</span>
                </div>
                <div>
                  <span class="text-[10px] font-mono text-zinc-500 uppercase block">eTRF Window</span>
                  <span class="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    08:00 - 17:00
                  </span>
                  <span class="text-[10px] text-zinc-400 block">{{ status.optimalEatingWindow.hoursRemainingInWindow }}h remaining today</span>
                </div>
                <div>
                  <span class="text-[10px] font-mono text-zinc-500 uppercase block">Meal Recommendation</span>
                  <span class="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block truncate">
                    {{ status.recommendedMealType.replace(/_/g, ' ') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Simulated Hour Controls for Clinical Testing -->
            <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">Circadian Time Simulator (Test Biological Responses)</span>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  (click)="chronoNutritionService.setSimulatedHour(8)"
                  [class]="status.currentHour === 8 ? 'bg-amber-500 text-white font-bold' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'"
                  class="p-2 rounded-xl text-xs transition-all min-h-[44px]">
                  🌅 08:00 Morning Peak
                </button>
                <button
                  type="button"
                  (click)="chronoNutritionService.setSimulatedHour(13)"
                  [class]="status.currentHour === 13 ? 'bg-amber-500 text-white font-bold' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'"
                  class="p-2 rounded-xl text-xs transition-all min-h-[44px]">
                  ☀️ 13:00 Midday Sustained
                </button>
                <button
                  type="button"
                  (click)="chronoNutritionService.setSimulatedHour(18)"
                  [class]="status.currentHour === 18 ? 'bg-amber-500 text-white font-bold' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'"
                  class="p-2 rounded-xl text-xs transition-all min-h-[44px]">
                  🌆 18:00 Dusk Tapering
                </button>
                <button
                  type="button"
                  (click)="chronoNutritionService.setSimulatedHour(22)"
                  [class]="status.currentHour === 22 ? 'bg-amber-500 text-white font-bold' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'"
                  class="p-2 rounded-xl text-xs transition-all min-h-[44px]">
                  🌙 22:00 Melatonin Fast
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Tab 3: Gut Microbiome SCFA & Ancestral Fermentation Vault -->
      @if (activeTab() === 'microbiome_vault') {
        <div class="space-y-6">
          @if (microbiomeVaultService.scfaProfile(); as scfa) {
            <!-- SCFA Metric Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                <span class="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 uppercase block">Butyrate (HDAC Inhibitor)</span>
                <div class="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {{ scfa.butyrateMmolPerLiter }} <span class="text-xs font-normal text-zinc-500">mmol/L</span>
                </div>
                <span class="text-[10px] text-zinc-500">Seals tight junctions & fuels colonocytes</span>
              </div>
              <div class="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-1">
                <span class="text-[11px] font-mono text-blue-700 dark:text-blue-400 uppercase block">Propionate</span>
                <div class="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
                  {{ scfa.propionateMmolPerLiter }} <span class="text-xs font-normal text-zinc-500">mmol/L</span>
                </div>
                <span class="text-[10px] text-zinc-500">Suppresses hepatic gluconeogenesis</span>
              </div>
              <div class="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-1">
                <span class="text-[11px] font-mono text-purple-700 dark:text-purple-400 uppercase block">Zonulin Gut Barrier Status</span>
                <div class="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {{ scfa.zonulinGutPermeabilityTier }}
                </div>
                <span class="text-[10px] text-zinc-500">Treg Immune Score: {{ scfa.tregImmuneToleranceScore }}/100</span>
              </div>
            </div>
          }

          <!-- Oral-Systemic Veillonella Nitrate-to-NO Pathway -->
          @if (microbiomeVaultService.oralNitrateStatus(); as oral) {
            <div class="p-4 rounded-2xl bg-zinc-900 text-white border border-zinc-800 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-teal-400 uppercase flex items-center gap-2">
                  <span>🦷 Oral-Systemic Microbiome Cross-Talk (Veillonella Nitrate-NO)</span>
                </span>
                <span class="text-[10px] font-mono text-emerald-400 font-bold">
                  -{{ oral.predictedBloodPressureReductionMmHg }} mmHg SBP
                </span>
              </div>
              <p class="text-xs text-zinc-300 leading-relaxed">{{ oral.dietaryRecommendation }}</p>
            </div>
          }

          <!-- Fermentation Recipes with Digital Litmus Safety -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">Ancestral Wild Fermentation Protocols</span>
              <span class="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Safe pH &lt; 4.6 (Botulinum Gating)</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              @for (recipe of microbiomeVaultService.fermentationRecipes(); track recipe.id) {
                <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2 flex flex-col justify-between">
                  <div>
                    <h5 class="text-xs font-bold text-zinc-900 dark:text-zinc-100">{{ recipe.title }}</h5>
                    <span class="text-[10px] text-zinc-500 block mt-0.5">{{ recipe.microbialCulture }}</span>
                    <div class="mt-2 text-[11px] text-zinc-600 dark:text-zinc-300 space-y-1">
                      <div>⏱️ <strong>{{ recipe.fermentationDurationDays }} days</strong> at 68-72°F</div>
                      <div>🧪 Target pH: <strong>{{ recipe.targetPhSafetyThreshold }}</strong> (Safe)</div>
                      <div>🛡️ {{ recipe.oralSystemicBonus }}</div>
                    </div>
                  </div>
                  <div class="pt-2 border-t border-zinc-200 dark:border-zinc-700/60 mt-2">
                    <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                      {{ recipe.scfaYieldRating }}
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ChronoBiomePlateSuiteComponent {
  readonly plateVisionService = inject(PlateVisionPhotometryService);
  readonly chronoNutritionService = inject(CircadianChronoNutritionService);
  readonly microbiomeVaultService = inject(MicrobiomeFermentationVaultService);

  readonly activeTab = signal<ChronoBiomeTab>('plate_vision');

  triggerNewPlateScan(): void {
    this.plateVisionService.processPlateImage();
  }
}
