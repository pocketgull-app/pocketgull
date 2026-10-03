import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompassionateNutritionHeritageService, CulturalHeritageTradition } from '../../services/compassionate-nutrition-heritage.service';

@Component({
  selector: 'app-compassionate-nutrition-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-zinc-950 rounded-3xl border border-amber-500/30 shadow-2xl font-mono text-xs text-zinc-100 space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-amber-500/20">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-center text-2xl shadow-md">
            🍲
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-white tracking-tight">
                Compassionate Nutrition &amp; Cultural Foodways
              </h3>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60 uppercase">
                Ancestral Swaps • SCFA Butyrate
              </span>
            </div>
            <p class="text-[11px] text-zinc-400 mt-0.5">
              Empowering metabolic freedom and gut mucosal barrier integrity through culturally beloved ancestral whole foods.
            </p>
          </div>
        </div>

        <!-- Tradition Selector -->
        <div class="flex flex-wrap items-center gap-1.5 font-sans">
          @for (trad of traditions; track trad.id) {
            <button
              type="button"
              (click)="nutrition.setTradition(trad.id)"
              class="px-2.5 py-1 rounded-lg text-xs font-semibold transition border cursor-pointer"
              [class.bg-amber-600]="nutrition.selectedTradition() === trad.id"
              [class.text-white]="nutrition.selectedTradition() === trad.id"
              [class.border-amber-400]="nutrition.selectedTradition() === trad.id"
              [class.bg-zinc-900]="nutrition.selectedTradition() !== trad.id"
              [class.text-zinc-400]="nutrition.selectedTradition() !== trad.id"
              [class.border-zinc-800]="nutrition.selectedTradition() !== trad.id">
              {{ trad.label }}
            </button>
          }
        </div>
      </div>

      <!-- Gut Mucosal Barrier HUD -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div class="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
          <span class="text-zinc-400 text-[10px] uppercase font-bold">Zonulin Barrier Risk</span>
          <div class="text-xs font-bold"
               [class.text-emerald-400]="nutrition.gutBarrierAssessment().estimatedZonulinRisk.startsWith('Low')"
               [class.text-amber-400]="nutrition.gutBarrierAssessment().estimatedZonulinRisk.startsWith('Moderate')"
               [class.text-rose-400]="nutrition.gutBarrierAssessment().estimatedZonulinRisk.startsWith('Elevated')">
            {{ nutrition.gutBarrierAssessment().estimatedZonulinRisk }}
          </div>
          <span class="text-[10px] text-zinc-500">Tight junction permeability status</span>
        </div>

        <div class="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
          <span class="text-zinc-400 text-[10px] uppercase font-bold">SCFA Butyrate Yield</span>
          <div class="text-xs font-bold text-teal-300">
            {{ nutrition.gutBarrierAssessment().butyrateSynthesizingCapacity }}
          </div>
          <span class="text-[10px] text-zinc-500">Colonocyte fuel &amp; anti-inflammatory signal</span>
        </div>

        <div class="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
          <span class="text-zinc-400 text-[10px] uppercase font-bold">Fermentable Fiber</span>
          <div class="text-xs font-bold text-amber-300">
            {{ nutrition.gutBarrierAssessment().dailyFermentableFiberGrams }} g/day
          </div>
          <span class="text-[10px] text-zinc-500">Resistant starch type 3 &amp; inulin</span>
        </div>

        <div class="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
          <span class="text-zinc-400 text-[10px] uppercase font-bold">Botanical Diversity</span>
          <div class="text-xs font-bold text-purple-300">
            {{ nutrition.distinctWeeklyPlantSpeciesCount() }} / 30 species
          </div>
          <span class="text-[10px] text-zinc-500">Target &ge; 30 species/week</span>
        </div>
      </div>

      <!-- Active Ancestral Food Swaps -->
      <div class="space-y-3 font-sans">
        <h4 class="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
          Ancestral Foodway Swaps (Glycemic Smoothing &amp; Microbiome Diversity)
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (swap of nutrition.activeHeritageSwaps(); track swap.belovedTraditionalDish) {
            <div class="p-4 bg-zinc-900/70 border border-zinc-800 rounded-2xl flex flex-col justify-between space-y-3 hover:border-amber-500/40 transition">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between text-[11px] font-mono">
                  <span class="text-rose-400 line-through">Standard Refined Preparation:</span>
                  <span class="text-emerald-400 font-bold">-{{ swap.glycemicImpactReductionPercent }}% Glycemic Spike</span>
                </div>
                <div class="text-xs font-medium text-zinc-400">{{ swap.belovedTraditionalDish }}</div>
                <div class="text-sm font-bold text-amber-200 mt-1">✨ Nourishing Ancestral Swap:</div>
                <div class="text-xs font-semibold text-white">{{ swap.nourishingWholeFoodSwap }}</div>
              </div>

              <div class="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
                <div><strong class="text-teal-300">Biochemical Mechanism:</strong> {{ swap.biochemicalMechanism }}</div>
                <div class="text-[10px] text-zinc-400 italic">Energetic Profile: {{ swap.traditionalEnergeticProfile }}</div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class CompassionateNutritionCardComponent {
  public nutrition = inject(CompassionateNutritionHeritageService);

  readonly traditions: { id: CulturalHeritageTradition; label: string }[] = [
    { id: 'AFRICAN_HERITAGE', label: 'African Heritage' },
    { id: 'LATINO_MESOAMERICAN', label: 'Latino & Mesoamerican' },
    { id: 'ASIAN_TRADITIONAL', label: 'Asian Traditional' },
    { id: 'MEDITERRANEAN', label: 'Mediterranean' },
    { id: 'INDIGENOUS_TURTLE_ISLAND', label: 'Indigenous Turtle Island' }
  ];
}
