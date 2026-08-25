import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { ThemeService } from '../services/theme.service';

export interface IFunctionalFoodItem {
  name: string;
  category: 'western' | 'tcm' | 'ayurveda';
  bioactiveCompound: string;
  targetMechanism: string;
  energeticProperty: 'Cooling' | 'Warming' | 'Neutral';
  dosageOrPortion: string;
}

@Component({
  selector: 'app-precision-nutrition-calculator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-emerald-500/30 rounded-2xl shadow-xl space-y-6 font-sans">
      <!-- Top Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-extrabold text-lg">
            🥑
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Precision Chrono-Nutrition & Food-as-Medicine Engine
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              Circadian feeding windows, glycemic curve optimization, and tri-paradigm botanical food targets.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="activeTab.set('chrono')" 
                  [class.bg-emerald-600]="activeTab() === 'chrono'"
                  [class.text-white]="activeTab() === 'chrono'"
                  [class.bg-gray-100]="activeTab() !== 'chrono'"
                  [class.dark:bg-zinc-800]="activeTab() !== 'chrono'"
                  [class.text-gray-700]="activeTab() !== 'chrono'"
                  [class.dark:text-zinc-300]="activeTab() !== 'chrono'"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer">
            ⏱️ Chrono-Window
          </button>
          <button (click)="activeTab.set('matrix')"
                  [class.bg-emerald-600]="activeTab() === 'matrix'"
                  [class.text-white]="activeTab() === 'matrix'"
                  [class.bg-gray-100]="activeTab() !== 'matrix'"
                  [class.dark:bg-zinc-800]="activeTab() !== 'matrix'"
                  [class.text-gray-700]="activeTab() !== 'matrix'"
                  [class.dark:text-zinc-300]="activeTab() !== 'matrix'"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer">
            🌿 Functional Foods
          </button>
          <button (click)="activeTab.set('dinacharya')"
                  [class.bg-emerald-600]="activeTab() === 'dinacharya'"
                  [class.text-white]="activeTab() === 'dinacharya'"
                  [class.bg-gray-100]="activeTab() !== 'dinacharya'"
                  [class.dark:bg-zinc-800]="activeTab() !== 'dinacharya'"
                  [class.text-gray-700]="activeTab() !== 'dinacharya'"
                  [class.dark:text-zinc-300]="activeTab() !== 'dinacharya'"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer">
            🍂 Seasonal Dinacharya
          </button>
          <button (click)="activeTab.set('glycemic')"
                  [class.bg-emerald-600]="activeTab() === 'glycemic'"
                  [class.text-white]="activeTab() === 'glycemic'"
                  [class.bg-gray-100]="activeTab() !== 'glycemic'"
                  [class.dark:bg-zinc-800]="activeTab() !== 'glycemic'"
                  [class.text-gray-700]="activeTab() !== 'glycemic'"
                  [class.dark:text-zinc-300]="activeTab() !== 'glycemic'"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer">
            📈 Glycemic Spike Simulator
          </button>
        </div>
      </div>

      <!-- Tab 1: Chrono-Feeding Window -->
      @if (activeTab() === 'chrono') {
        <div class="space-y-4 animate-in fade-in duration-200">
          <div class="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-3">
            <div class="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              <span>Optimal 8-Hour Circadian Feeding Window</span>
              <span class="font-mono">{{ feedingStartHour() }}:00 AM – {{ feedingStartHour() + 8 }}:00 PM</span>
            </div>
            
            <!-- Interactive Time Slider -->
            <div class="space-y-1">
              <label class="text-[11px] font-semibold text-gray-600 dark:text-zinc-400 flex justify-between">
                <span>First Meal Start Time (Morning Cortisol Sync):</span>
                <span class="font-mono font-bold">{{ feedingStartHour() }}:00 AM</span>
              </label>
              <input type="range" min="7" max="11" step="1" 
                     [value]="feedingStartHour()" 
                     (input)="onStartHourChange($event)"
                     class="w-full h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500">
            </div>

            <!-- Circadian Rhythm Phase Timeline -->
            <div class="grid grid-cols-3 gap-2 text-center text-xs pt-2">
              <div class="p-2.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg">
                <div class="font-bold text-amber-600 dark:text-amber-400">🌅 Break-Fast ({{ feedingStartHour() }}:00 AM)</div>
                <div class="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">High Insulin Sensitivity. Pair Protein & Healthy Fats.</div>
              </div>
              <div class="p-2.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg">
                <div class="font-bold text-emerald-600 dark:text-emerald-400">☀️ Peak Met-Agni ({{ feedingStartHour() + 4 }}:00 PM)</div>
                <div class="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">Max Enzymatic Capacity. Main Complex Carbs.</div>
              </div>
              <div class="p-2.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg">
                <div class="font-bold text-indigo-600 dark:text-indigo-400">🌙 Fast Gate ({{ feedingStartHour() + 8 }}:00 PM)</div>
                <div class="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">Autophagy Activation & Melatonin Secretion.</div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Tab 2: Tri-Paradigm Functional Food Matrix -->
      @if (activeTab() === 'matrix') {
        <div class="space-y-3 animate-in fade-in duration-200">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            @for (food of functionalFoods(); track food.name) {
              <div class="p-3.5 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80 rounded-xl space-y-2 hover:border-emerald-500/50 transition">
                <div class="flex justify-between items-center">
                  <span class="font-extrabold text-xs text-gray-900 dark:text-gray-100">{{ food.name }}</span>
                  <span [class.bg-sky-500\/10]="food.category === 'western'"
                        [class.text-sky-700]="food.category === 'western'"
                        [class.bg-emerald-500\/10]="food.category === 'tcm'"
                        [class.text-emerald-700]="food.category === 'tcm'"
                        [class.bg-amber-500\/10]="food.category === 'ayurveda'"
                        [class.text-amber-700]="food.category === 'ayurveda'"
                        class="text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {{ food.category }}
                  </span>
                </div>
                <div class="text-xs text-gray-600 dark:text-zinc-300 font-mono">
                  <strong>Active Bioactive:</strong> {{ food.bioactiveCompound }}
                </div>
                <div class="text-[11px] text-gray-500 dark:text-zinc-400">
                  {{ food.targetMechanism }}
                </div>
                <div class="flex justify-between items-center text-[10.5px] font-bold text-gray-500 pt-1 border-t border-gray-200 dark:border-zinc-700">
                  <span>Portion: {{ food.dosageOrPortion }}</span>
                  <span [class.text-blue-500]="food.energeticProperty === 'Cooling'"
                        [class.text-red-500]="food.energeticProperty === 'Warming'"
                        [class.text-gray-400]="food.energeticProperty === 'Neutral'">
                    {{ food.energeticProperty === 'Cooling' ? '❄️ Cooling' : food.energeticProperty === 'Warming' ? '🔥 Warming' : '⚖️ Neutral' }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Tab 3: Glycemic Curve & Glucose Spike Simulator -->
      @if (activeTab() === 'glycemic') {
        <div class="p-4 bg-zinc-950 text-white rounded-xl space-y-4 font-mono text-xs animate-in fade-in duration-200">
          <div class="flex justify-between items-center text-emerald-400 border-b border-zinc-800 pb-2">
            <span class="font-bold">📉 Postprandial Glucose Curve Simulator</span>
            <span>Baseline CGM: {{ baselineGlucose() }} mg/dL</span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-[11px] text-zinc-400">Meal Carbohydrate Load (Grams):</label>
              <input type="range" min="10" max="100" step="5" 
                     [value]="carbGrams()" 
                     (input)="onCarbsChange($event)"
                     class="w-full h-1.5 bg-zinc-700 rounded appearance-none cursor-pointer accent-emerald-400">
              <div class="text-right text-xs font-bold text-amber-400">{{ carbGrams() }}g Carbs</div>
            </div>

            <div class="space-y-2">
              <label class="block text-[11px] text-zinc-400">Pre-Meal Fiber & Vinegar Buffer:</label>
              <button (click)="toggleFiberBuffer()" 
                      [class.bg-emerald-500]="hasFiberBuffer()"
                      [class.bg-zinc-800]="!hasFiberBuffer()"
                      class="w-full py-2 px-3 rounded text-xs font-bold uppercase transition cursor-pointer border border-zinc-700">
                {{ hasFiberBuffer() ? '✅ Vinegar & Soluble Fiber Active (-35% Spike)' : '❌ Standard Unbuffered Meal' }}
              </button>
            </div>
          </div>

          <!-- Peak Postprandial Estimate Box -->
          <div class="p-3 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
            <div>
              <span class="text-[11px] text-zinc-400 block">Predicted Peak Glucose Spike:</span>
              <span class="text-lg font-black" [class.text-emerald-400]="estimatedPeakGlucose() < 140" [class.text-amber-400]="estimatedPeakGlucose() >= 140 && estimatedPeakGlucose() < 180" [class.text-rose-500]="estimatedPeakGlucose() >= 180">
                {{ estimatedPeakGlucose() }} mg/dL
              </span>
            </div>
            <div class="text-right">
              <span class="text-[11px] text-zinc-400 block">Delta Spike:</span>
              <span class="text-sm font-bold text-sky-400">+{{ estimatedPeakGlucose() - baselineGlucose() }} mg/dL</span>
            </div>
          </div>
        </div>
      }

      <!-- Tab 4: Seasonal Dinacharya & Ritu-Charya Matrix -->
      @if (activeTab() === 'dinacharya') {
        <div class="space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="p-3.5 bg-emerald-500/5 border border-emerald-500/30 rounded-xl space-y-1.5">
              <div class="font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wide flex items-center gap-1">
                🌱 Spring (Vasanta)
              </div>
              <p class="text-gray-600 dark:text-zinc-300 text-[11px]">
                Kapha liquefaction season. Emphasize bitter greens, dandelion tea, matcha EGCG, and light digestive warmth.
              </p>
              <span class="inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded font-mono text-[10px]">Agni: Samagni</span>
            </div>

            <div class="p-3.5 bg-amber-500/5 border border-amber-500/30 rounded-xl space-y-1.5">
              <div class="font-black text-amber-900 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1">
                ☀️ Summer (Greeshma)
              </div>
              <p class="text-gray-600 dark:text-zinc-300 text-[11px]">
                Pitta accumulation season. Emphasize cooling coconut water, sweet juicy fruits, mint tea, and shade hydration.
              </p>
              <span class="inline-block px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded font-mono text-[10px]">Agni: Tikshnagni</span>
            </div>

            <div class="p-3.5 bg-purple-500/5 border border-purple-500/30 rounded-xl space-y-1.5">
              <div class="font-black text-purple-900 dark:text-purple-300 uppercase tracking-wide flex items-center gap-1">
                🍂 Autumn (Sharad)
              </div>
              <p class="text-gray-600 dark:text-zinc-300 text-[11px]">
                Pitta aggravation & liver detox. Consume Amla berry, organic ghee, warm mung bean dahl soup, and bitter herbs.
              </p>
              <span class="inline-block px-2 py-0.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded font-mono text-[10px]">Agni: Vishamagni</span>
            </div>

            <div class="p-3.5 bg-blue-500/5 border border-blue-500/30 rounded-xl space-y-1.5">
              <div class="font-black text-blue-900 dark:text-blue-300 uppercase tracking-wide flex items-center gap-1">
                ❄️ Winter (Hemanta)
              </div>
              <p class="text-gray-600 dark:text-zinc-300 text-[11px]">
                Vata grounding season. Emphasize warm ginger-cinnamon stews, roasted root vegetables, sesame oil, and dense proteins.
              </p>
              <span class="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded font-mono text-[10px]">Agni: Mandagni</span>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class PrecisionNutritionCalculatorComponent {
  private readonly state = (() => {
    try {
      return inject(PatientStateService, { optional: true }) || new PatientStateService();
    } catch (e) {
      console.debug('[PrecisionNutrition] PatientStateService DI fallback:', (e as Error)?.message);
      return new PatientStateService();
    }
  })();

  protected readonly theme = (() => {
    try {
      return inject(ThemeService, { optional: true }) || new ThemeService();
    } catch (e) {
      console.debug('[PrecisionNutrition] ThemeService DI fallback:', (e as Error)?.message);
      return new ThemeService();
    }
  })();

  readonly activeTab = signal<'chrono' | 'matrix' | 'dinacharya' | 'glycemic'>('chrono');
  readonly feedingStartHour = signal<number>(10); // 10 AM default
  readonly carbGrams = signal<number>(45);
  readonly hasFiberBuffer = signal<boolean>(true);

  readonly baselineGlucose = computed(() => {
    const v = this.state.vitals();
    const val = v?.cgmGlucoseMgDl;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val) || 92;
    return 92;
  });

  readonly estimatedPeakGlucose = computed(() => {
    const base = this.baselineGlucose();
    const carbs = this.carbGrams();
    let spike = carbs * 1.2;
    if (this.hasFiberBuffer()) {
      spike *= 0.65; // 35% attenuation from acetic acid & viscous soluble fiber
    }
    return Math.round(base + spike);
  });

  readonly functionalFoods = signal<IFunctionalFoodItem[]>([
    {
      name: 'Matcha Green Tea',
      category: 'western',
      bioactiveCompound: 'EGCG (Epigallocatechin Gallate)',
      targetMechanism: 'Inhibits alpha-glucosidase & enhances mitochondrial fatty acid oxidation.',
      energeticProperty: 'Cooling',
      dosageOrPortion: '2g Ceremonial Powder'
    },
    {
      name: 'Broccoli Sprouts',
      category: 'western',
      bioactiveCompound: 'Sulforaphane / Glucoraphanin',
      targetMechanism: 'Activates Nrf2 pathway for phase II hepatic detoxification.',
      energeticProperty: 'Cooling',
      dosageOrPortion: '1/2 Cup Fresh Sprouts'
    },
    {
      name: 'Nisha Amalaki',
      category: 'ayurveda',
      bioactiveCompound: 'Amla Vitamin C + Turmeric Curcumin',
      targetMechanism: 'Rejuvenates Agni digestive fire & balances Kapha metabolic sluggishness.',
      energeticProperty: 'Neutral',
      dosageOrPortion: '500mg Extract Pair'
    },
    {
      name: 'Mung Bean & Ginger Stew',
      category: 'tcm',
      bioactiveCompound: 'Gingerol & Isoflavones',
      targetMechanism: 'Clears Damp-Heat in Spleen/Stomach meridian while warming Qi.',
      energeticProperty: 'Warming',
      dosageOrPortion: '1 Bowl Warm Soup'
    },
    {
      name: 'Wild Alaskan Salmon',
      category: 'western',
      bioactiveCompound: 'Astaxanthin & Omega-3 EPA/DHA',
      targetMechanism: 'Resolves neuro-inflammation & stabilizes cell membrane fluidity.',
      energeticProperty: 'Neutral',
      dosageOrPortion: '150g Filet'
    },
    {
      name: 'Black Garlic Decoction',
      category: 'tcm',
      bioactiveCompound: 'S-Allyl-Cysteine (SAC)',
      targetMechanism: 'Tonifies Kidney Jing essence & reduces vascular oxidative stress.',
      energeticProperty: 'Warming',
      dosageOrPortion: '2 Cloves Aged Garlic'
    }
  ]);

  onStartHourChange(e: Event): void {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    this.feedingStartHour.set(val);
  }

  onCarbsChange(e: Event): void {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    this.carbGrams.set(val);
  }

  toggleFiberBuffer(): void {
    this.hasFiberBuffer.update(v => !v);
  }
}
