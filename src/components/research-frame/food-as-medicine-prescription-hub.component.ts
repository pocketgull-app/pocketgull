import { Component, signal, computed, inject, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';

export interface IDietaryPattern {
  id: string;
  name: string;
  primaryIndication: string;
  corePrinciples: string[];
  keyBioactives: string[];
  macroSplit: { carbsPct: number; proteinPct: number; fatPct: number };
  steeredEvidenceQuery: string;
}

export interface IProducePrescriptionItem {
  foodName: string;
  servingTarget: string;
  targetBioactive: string;
  mechanisticRationale: string;
  culinaryPreparationTip: string;
}

@Component({
  selector: 'app-food-as-medicine-prescription-hub',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-zinc-100 shadow-2xl space-y-6 max-w-5xl mx-auto">
      
      <!-- Top Banner -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <span>🥗</span>
            <span>Food-as-Medicine (FAM) &amp; Chrono-Nutrition Hub</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Produce Prescriptions, Microbiome SCFA Synthesis &amp; Bioactive Nutrition
          </h2>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Grounds patient care plans in evidence-based dietary patterns (MIND, Mediterranean, Blue Zones) and clinical nutrition trials.
          </p>
        </div>

        <!-- Plant Diversity Indicator -->
        <div class="bg-zinc-950 px-4 py-3 rounded-2xl border border-zinc-800 space-y-1 text-right">
          <div class="flex items-center justify-end gap-2 text-[10px] font-mono text-emerald-400">
            <span>🌿</span>
            <span class="font-bold">Microbiome Diversity: 34 / 30 Species</span>
          </div>
          <div class="text-[10px] font-mono text-zinc-400">
            Target: <span class="text-emerald-300 font-bold">Optimal SCFA Butyrate Synthesis</span>
          </div>
        </div>
      </div>

      <!-- Dietary Pattern Selector -->
      <div class="space-y-2">
        <label class="text-[11px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
          Select Evidence-Grounded Dietary Pattern:
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          @for (pattern of dietaryPatterns; track pattern.id) {
            <button (click)="selectedPatternId.set(pattern.id)"
                    [class.bg-emerald-600]="selectedPatternId() === pattern.id"
                    [class.text-white]="selectedPatternId() === pattern.id"
                    [class.border-emerald-400]="selectedPatternId() === pattern.id"
                    [class.bg-zinc-950]="selectedPatternId() !== pattern.id"
                    [class.text-zinc-400]="selectedPatternId() !== pattern.id"
                    [class.border-zinc-800]="selectedPatternId() !== pattern.id"
                    class="p-3 rounded-xl text-left border transition-all hover:border-emerald-500/60 cursor-pointer space-y-1">
              <div class="text-xs font-bold truncate leading-tight">{{ pattern.name }}</div>
              <div class="text-[10px] font-mono opacity-80 truncate">{{ pattern.primaryIndication }}</div>
            </button>
          }
        </div>
      </div>

      <!-- Active Pattern Overview & Macro Distribution -->
      <div class="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <span>🥑</span> {{ activePattern().name }}
            </h3>
            <p class="text-xs text-zinc-400 mt-0.5">
              Primary Goal: {{ activePattern().primaryIndication }}
            </p>
          </div>

          <!-- Macro Split -->
          <div class="flex items-center gap-3 text-[11px] font-mono">
            <span class="text-teal-400 font-bold">Carbs: {{ activePattern().macroSplit.carbsPct }}%</span>
            <span class="text-purple-400 font-bold">Protein: {{ activePattern().macroSplit.proteinPct }}%</span>
            <span class="text-amber-400 font-bold">Healthy Fats: {{ activePattern().macroSplit.fatPct }}%</span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <!-- Core Principles -->
          <div class="space-y-1.5">
            <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">Core Guidelines:</span>
            <ul class="space-y-1 text-zinc-300">
              @for (p of activePattern().corePrinciples; track p) {
                <li class="flex items-start gap-1.5">
                  <span class="text-emerald-400">✔</span>
                  <span>{{ p }}</span>
                </li>
              }
            </ul>
          </div>

          <!-- Key Bioactives -->
          <div class="space-y-1.5">
            <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">Key Bioactive Targets:</span>
            <div class="flex flex-wrap gap-1.5">
              @for (bio of activePattern().keyBioactives; track bio) {
                <span class="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/60 text-emerald-300 text-[11px] font-mono">
                  🌱 {{ bio }}
                </span>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Produce Prescription (PRx) Table -->
      <div class="p-5 bg-zinc-950 border border-zinc-800/90 rounded-2xl space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold font-mono text-emerald-300 uppercase tracking-wider flex items-center gap-2">
            <span>🥗</span> Produce Prescription (PRx) Protocol:
          </h4>
          <span class="text-[10px] font-mono text-zinc-500">USDA FoodData Aligned</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-mono">
            <thead>
              <tr class="border-b border-zinc-800 text-zinc-400 text-[10px]">
                <th class="py-2">Whole Food Prescription</th>
                <th class="py-2">Daily / Weekly Dose</th>
                <th class="py-2">Bioactive &amp; Pathway</th>
                <th class="py-2">Culinary Bioavailability Tip</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/60">
              @for (item of producePrescriptions; track item.foodName) {
                <tr class="hover:bg-zinc-900/50 transition">
                  <td class="py-2.5 font-bold text-zinc-100">{{ item.foodName }}</td>
                  <td class="py-2.5 text-emerald-400 font-semibold">{{ item.servingTarget }}</td>
                  <td class="py-2.5 text-zinc-300">{{ item.targetBioactive }}</td>
                  <td class="py-2.5 text-zinc-400 text-[11px]">{{ item.culinaryPreparationTip }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- 1-Click Evidence Steering -->
      <div class="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="text-xs font-mono text-zinc-300">
          <span>📚 Steer research to PubMed clinical nutrition RCTs for </span>
          <strong class="text-emerald-300">{{ activePattern().name }}</strong>
        </div>
        <button (click)="steerNutritionResearch()"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shrink-0">
          <span>🎯</span> Steer Nutrition Evidence
        </button>
      </div>

    </div>
  `
})
export class FoodAsMedicinePrescriptionHubComponent {
  private readonly patientState = inject(PatientStateService);

  readonly selectQuery = output<{ query: string; engine: 'pubmed' | 'gse' | 'google' }>();

  readonly selectedPatternId = signal<string>('PATTERN-MIND');

  readonly dietaryPatterns: IDietaryPattern[] = [
    {
      id: 'PATTERN-MIND',
      name: 'MIND Neuro-Longevity Diet',
      primaryIndication: 'Neuroprotection & Cognitive Aging Mitigation',
      corePrinciples: [
        'Green leafy vegetables ≥ 6 servings/week',
        'Berries (Blueberries/Blackberries) ≥ 2 servings/week',
        'Extra virgin olive oil as primary culinary fat',
        'Whole grains ≥ 3 servings/day, poultry/fish ≥ 2x/week'
      ],
      keyBioactives: ['Anthocyanins', 'Lutein/Zeaxanthin', 'Folate', 'E-Sulforaphane', 'Oleocanthal'],
      macroSplit: { carbsPct: 45, proteinPct: 20, fatPct: 35 },
      steeredEvidenceQuery: 'MIND Diet Cognitive Decline Neurodegeneration Dementia Randomized Controlled Trial'
    },
    {
      id: 'PATTERN-MED-DASH',
      name: 'Mediterranean-DASH Hybrid',
      primaryIndication: 'Cardiometabolic & Endothelial Vasodilation',
      corePrinciples: [
        'High potassium & magnesium whole foods (avocados, leafy greens)',
        'Sodium restriction < 2,000 mg/day with mineral salt replacement',
        'Wild cold-water fatty fish (EPA/DHA) 2-3x/week',
        'Daily legumes, nuts, and polyphenol-dense herbs'
      ],
      keyBioactives: ['Nitrates (NO Synthase)', 'Omega-3 EPA/DHA', 'Resveratrol', 'Quercetin'],
      macroSplit: { carbsPct: 50, proteinPct: 20, fatPct: 30 },
      steeredEvidenceQuery: 'Mediterranean DASH Diet Blood Pressure Endothelial Function Clinical Trial'
    },
    {
      id: 'PATTERN-BLUE-ZONES',
      name: 'Blue Zones Longevity Plant-Slant',
      primaryIndication: 'Epigenetic Healthspan & Sirtuin Activation',
      corePrinciples: [
        '95% whole plant-based intake, high legume/lentil core',
        'Sourdough fermentation for gut microbial polyphenol conversion',
        'Daily handful of raw walnuts, almonds, or pistachios',
        '80% fullness rule (Hara Hachi Bu) paired with chrono-fasting'
      ],
      keyBioactives: ['Spermidine', 'Urolithin A', 'Resistant Starch', 'Betaine'],
      macroSplit: { carbsPct: 60, proteinPct: 15, fatPct: 25 },
      steeredEvidenceQuery: 'Blue Zones Plant Based Diet Longevity Epigenetic Aging Clinical Evidence'
    },
    {
      id: 'PATTERN-ANTI-INFLAM',
      name: 'Clinical Anti-Inflammatory (AIP)',
      primaryIndication: 'Autoimmune & Systemic Cytokine (CRP) Suppression',
      corePrinciples: [
        'Elimination of refined seed oils, industrial emulsifiers, and refined sugars',
        'Rich prebiotic bone or shiitake mushroom broths with glycine',
        'Deeply colored cruciferous and sulfur-rich alliums',
        'Fermented foods (sauerkraut, kimchi) for lactobacillus diversity'
      ],
      keyBioactives: ['Curcuminoids', 'Sulforaphane', 'Quercetin', 'EGCG Polyphenols'],
      macroSplit: { carbsPct: 35, proteinPct: 25, fatPct: 40 },
      steeredEvidenceQuery: 'Anti-inflammatory Diet High Sensitivity CRP Cytokines Autoimmune Clinical Trial'
    },
    {
      id: 'PATTERN-LOW-FODMAP',
      name: 'Microbiome Low-FODMAP Step-Down',
      primaryIndication: 'Visceral Hypersensitivity & IBS Symptom Relief',
      corePrinciples: [
        'Temporary reduction of fermentable oligosaccharides, disaccharides, monosaccharides',
        'Replacement with gentle soluble fibers (partially hydrolyzed guar gum)',
        'Strategic 6-week reintroduction phase with SCFA monitoring',
        'Ginger extract and peppermint oil for smooth muscle spasm relief'
      ],
      keyBioactives: ['Gingerols', 'L-Menthol', 'PHGG Soluble Fiber', 'Short-Chain Fatty Acids'],
      macroSplit: { carbsPct: 45, proteinPct: 25, fatPct: 30 },
      steeredEvidenceQuery: 'Low FODMAP Diet Irritable Bowel Syndrome Microbiome Diversity Clinical Trial'
    }
  ];

  readonly activePattern = computed(() => {
    const id = this.selectedPatternId();
    return this.dietaryPatterns.find(p => p.id === id) || this.dietaryPatterns[0];
  });

  readonly producePrescriptions: IProducePrescriptionItem[] = [
    {
      foodName: 'Wild Blueberries & Blackberries',
      servingTarget: '1 cup / day',
      targetBioactive: 'Anthocyanins & Delphinidin',
      mechanisticRationale: 'Crosses blood-brain barrier; enhances hippocampal neurogenesis and microglial anti-inflammatory tone.',
      culinaryPreparationTip: 'Consume fresh or flash-frozen with walnuts for lipophilic nutrient absorption.'
    },
    {
      foodName: 'Broccoli Sprouts / Microgreens',
      servingTarget: '1/2 cup / day (raw)',
      targetBioactive: 'Glucoraphanin & Sulforaphane',
      mechanisticRationale: 'Potent Nrf2 transcription factor inducer; upregulates glutathione synthesis and Phase II detox.',
      culinaryPreparationTip: 'Chew raw or blend into room-temperature smoothie (heat destroys heat-labile myrosinase enzyme).'
    },
    {
      foodName: 'High-Polyphenol Extra Virgin Olive Oil',
      servingTarget: '2 tablespoons / day',
      targetBioactive: 'Oleocanthal & Hydroxytyrosol',
      mechanisticRationale: 'Natural COX-1 / COX-2 inhibitor mimicking low-dose ibuprofen without gastric irritation.',
      culinaryPreparationTip: 'Drizzle unheated over cooked dishes to preserve temperature-sensitive phenolic compounds.'
    },
    {
      foodName: 'Cooked & Cooled Purple Potatoes / Oats',
      servingTarget: '1 serving / day',
      targetBioactive: 'Type-3 Resistant Starch & Beta-Glucan',
      mechanisticRationale: 'Resists upper digestion; fermented by colonic Faecalibacterium prausnitzii into butyrate.',
      culinaryPreparationTip: 'Cook thoroughly, cool in refrigerator 12+ hours to induce starch retrogradation.'
    }
  ];

  steerNutritionResearch(): void {
    const pattern = this.activePattern();
    this.selectQuery.emit({
      query: pattern.steeredEvidenceQuery,
      engine: 'pubmed'
    });
  }
}
