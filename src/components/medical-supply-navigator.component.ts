import { Component, ChangeDetectionStrategy, inject, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderTreatmentNetworkService } from '../services/provider-treatment-network.service';
import { PatientStateService } from '../services/patient-state.service';
import { MedicalDecoderService } from '../services/medical-decoder.service';
import { StoreSourcingService, ITinctureFormula, StoreCategoryType } from '../services/store-sourcing.service';

export interface IMedicalSupplyItem {
  id: string;
  name: string;
  category: 'Diagnostic Vitals' | 'Emergency & Resuscitation' | 'Wound Care & Sterile' | 'Metabolic & Diabetes' | 'Dental & Oral Health Care' | 'Botanical Tinctures & Herbs';
  availability: 'Over-the-Counter (OTC)' | 'DME Prescription Required' | 'Hospital Emergency Supply';
  typicalCostRange: string;
  whereToAcquire: string[];
  clinicalIndication: string;
  patientPlainSummary: string;
  loincOrStandardCode?: string;
  isUrgentNeed: boolean;
  isHsaEligible?: boolean;
  tinctureFormulaId?: string;
  recommendedLocalType?: StoreCategoryType;
}

@Component({
  selector: 'app-medical-supply-navigator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-blue-500/30 rounded-2xl shadow-xl space-y-6 font-sans">
      <!-- Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-extrabold text-lg">
            🚑
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Medical Supply, Local Store & Tincture Hub
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              Locate off-the-shelf supplies, local natural food co-ops, Whole Foods, 24/7 pharmacies, and vetted herbal recipes.
            </p>
          </div>
        </div>

        <!-- Filter Buttons -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <button (click)="selectedCategory.set('all')" 
                  [class.bg-blue-600]="selectedCategory() === 'all'"
                  [class.text-white]="selectedCategory() === 'all'"
                  [class.bg-gray-100]="selectedCategory() !== 'all'"
                  [class.dark:bg-zinc-800]="selectedCategory() !== 'all'"
                  [class.text-gray-700]="selectedCategory() !== 'all'"
                  [class.dark:text-zinc-300]="selectedCategory() !== 'all'"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer min-h-[36px]">
            All Items
          </button>
          <button (click)="selectedCategory.set('Botanical Tinctures & Herbs')" 
                  [class.bg-emerald-600]="selectedCategory() === 'Botanical Tinctures & Herbs'"
                  [class.text-white]="selectedCategory() === 'Botanical Tinctures & Herbs'"
                  [class.bg-gray-100]="selectedCategory() !== 'Botanical Tinctures & Herbs'"
                  [class.dark:bg-zinc-800]="selectedCategory() !== 'Botanical Tinctures & Herbs'"
                  [class.text-gray-700]="selectedCategory() !== 'Botanical Tinctures & Herbs'"
                  [class.dark:text-zinc-300]="selectedCategory() !== 'Botanical Tinctures & Herbs'"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer min-h-[36px]">
            🌿 Tinctures & Herbs
          </button>
          <button (click)="selectedCategory.set('Diagnostic Vitals')" 
                  [class.bg-blue-600]="selectedCategory() === 'Diagnostic Vitals'"
                  [class.text-white]="selectedCategory() === 'Diagnostic Vitals'"
                  [class.bg-gray-100]="selectedCategory() !== 'Diagnostic Vitals'"
                  [class.dark:bg-zinc-800]="selectedCategory() !== 'Diagnostic Vitals'"
                  [class.text-gray-700]="selectedCategory() !== 'Diagnostic Vitals'"
                  [class.dark:text-zinc-300]="selectedCategory() !== 'Diagnostic Vitals'"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer min-h-[36px]">
            🩸 Vitals Devices
          </button>
          <button (click)="selectedCategory.set('Emergency & Resuscitation')" 
                  [class.bg-blue-600]="selectedCategory() === 'Emergency & Resuscitation'"
                  [class.text-white]="selectedCategory() === 'Emergency & Resuscitation'"
                  [class.bg-gray-100]="selectedCategory() !== 'Emergency & Resuscitation'"
                  [class.dark:bg-zinc-800]="selectedCategory() !== 'Emergency & Resuscitation'"
                  [class.text-gray-700]="selectedCategory() !== 'Emergency & Resuscitation'"
                  [class.dark:text-zinc-300]="selectedCategory() !== 'Emergency & Resuscitation'"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer min-h-[36px]">
            ⚡ Emergency & CPR
          </button>
          <button (click)="selectedCategory.set('Metabolic & Diabetes')" 
                  [class.bg-blue-600]="selectedCategory() === 'Metabolic & Diabetes'"
                  [class.text-white]="selectedCategory() === 'Metabolic & Diabetes'"
                  [class.bg-gray-100]="selectedCategory() !== 'Metabolic & Diabetes'"
                  [class.dark:bg-zinc-800]="selectedCategory() !== 'Metabolic & Diabetes'"
                  [class.text-gray-700]="selectedCategory() !== 'Metabolic & Diabetes'"
                  [class.dark:text-zinc-300]="selectedCategory() !== 'Metabolic & Diabetes'"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer min-h-[36px]">
            🥑 Glucose & CGM
          </button>
        </div>
      </div>

      <!-- Emergency Triage Banner -->
      <div class="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-lg">🚨</span>
          <div>
            <span class="font-black text-rose-700 dark:text-rose-400 uppercase tracking-wide block">
              Immediate Red-Flag Emergency Triage
            </span>
            <span class="text-gray-600 dark:text-zinc-300">
              For chest pain, severe dyspnea, stroke symptoms, or unresponsiveness, call 911 immediately.
            </span>
          </div>
        </div>
        <a href="tel:911" class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg text-xs uppercase transition shadow min-h-[44px] flex items-center">
          Call 911 Now
        </a>
      </div>

      <!-- Supply Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (item of filteredSupplies(); track item.id) {
          <div class="p-4 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80 rounded-xl space-y-3 hover:border-blue-500/50 transition">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h4 class="font-extrabold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <span>{{ item.name }}</span>
                  @if (item.isHsaEligible) {
                    <span class="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 rounded">
                      HSA/FSA
                    </span>
                  }
                </h4>
                <span class="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  {{ item.category }}
                </span>
              </div>

              <span [class.bg-emerald-500\/10]="item.availability === 'Over-the-Counter (OTC)'"
                    [class.text-emerald-700]="item.availability === 'Over-the-Counter (OTC)'"
                    [class.dark:text-emerald-400]="item.availability === 'Over-the-Counter (OTC)'"
                    [class.bg-amber-500\/10]="item.availability === 'DME Prescription Required'"
                    [class.text-amber-700]="item.availability === 'DME Prescription Required'"
                    [class.dark:text-amber-400]="item.availability === 'DME Prescription Required'"
                    [class.bg-rose-500\/10]="item.availability === 'Hospital Emergency Supply'"
                    [class.text-rose-700]="item.availability === 'Hospital Emergency Supply'"
                    [class.dark:text-rose-400]="item.availability === 'Hospital Emergency Supply'"
                    class="text-[10px] font-bold px-2 py-0.5 rounded border border-current">
                {{ item.availability }}
              </span>
            </div>

            <!-- Description & Guidance -->
            <p class="text-xs text-gray-600 dark:text-zinc-300">
              {{ decoder.readingLevel() === 'patient' ? item.patientPlainSummary : item.clinicalIndication }}
            </p>

            <!-- Tincture Formula Trigger if available -->
            @if (item.tinctureFormulaId) {
              <div class="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between gap-2">
                <div class="text-[11px] text-emerald-800 dark:text-emerald-300">
                  <span class="font-bold">🧪 Custom Herbal Formula:</span> Includes active ratios, alcohol-free glycerite & DIY extraction guide.
                </div>
                <button 
                  type="button"
                  (click)="openTinctureDrawer(item.tinctureFormulaId)"
                  class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-md uppercase tracking-wider transition whitespace-nowrap cursor-pointer min-h-[36px]">
                  View Recipe →
                </button>
              </div>
            }

            <!-- 1-Click Store Directions & Online Purchasing Stack -->
            <div class="space-y-2 pt-2 border-t border-gray-200 dark:border-zinc-700 text-xs">
              <span class="font-bold text-gray-700 dark:text-zinc-300 block text-[11px] uppercase tracking-wider">
                📍 Store Directions & Ordering:
              </span>

              <div class="flex flex-wrap gap-1.5">
                <!-- Local Independent Co-op / Apothecary -->
                <a 
                  [href]="sourcingService.generateLocalMapsUrl(item.recommendedLocalType || 'local_coop', item.name)"
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded text-[11px] font-bold transition flex items-center gap-1 min-h-[36px]">
                  <span>🏡 Local Co-op / Apothecary</span>
                  <span>↗</span>
                </a>

                <!-- Whole Foods / Natural Grocer -->
                <a 
                  [href]="sourcingService.generateLocalMapsUrl('whole_foods', item.name)"
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="px-2.5 py-1 bg-green-50 dark:bg-green-950/60 hover:bg-green-100 dark:hover:bg-green-900 border border-green-500/30 text-green-800 dark:text-green-300 rounded text-[11px] font-bold transition flex items-center gap-1 min-h-[36px]">
                  <span>🥦 Whole Foods / Sprouts</span>
                  <span>↗</span>
                </a>

                <!-- 24/7 Pharmacy / CVS / Walgreens -->
                <a 
                  [href]="sourcingService.generateLocalMapsUrl('pharmacy', item.name)"
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-500/30 text-blue-800 dark:text-blue-300 rounded text-[11px] font-bold transition flex items-center gap-1 min-h-[36px]">
                  <span>🏪 24/7 Pharmacy</span>
                  <span>↗</span>
                </a>

                <!-- Amazon Health / Prime (Affiliate) -->
                <a 
                  [href]="sourcingService.generateAmazonAffiliateUrl(item.name, !!item.isHsaEligible)"
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 border border-amber-500/30 text-amber-800 dark:text-amber-300 rounded text-[11px] font-bold transition flex items-center gap-1 min-h-[36px]">
                  <span>📦 Amazon Prime / HSA</span>
                  <span>↗</span>
                </a>

                <!-- iHerb / Mountain Rose Herbs -->
                <a 
                  [href]="sourcingService.generateIherbUrl(item.name)"
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-500/30 text-teal-800 dark:text-teal-300 rounded text-[11px] font-bold transition flex items-center gap-1 min-h-[36px]">
                  <span>🌿 iHerb / Bulk Organic</span>
                  <span>↗</span>
                </a>
              </div>
            </div>

            <!-- Cost & Standard Code Footer -->
            <div class="flex justify-between items-center text-[11px] font-mono text-gray-500 dark:text-zinc-400 pt-1 border-t border-gray-200/50 dark:border-zinc-700/50">
              <span>Cost Range: {{ item.typicalCostRange }}</span>
              @if (item.loincOrStandardCode) {
                <span>Code: {{ item.loincOrStandardCode }}</span>
              }
            </div>
          </div>
        }
      </div>

      <!-- Tincture Formulation Modal Drawer -->
      @if (activeTinctureFormula(); as formula) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 font-sans"
             (click)="activeTinctureFormula.set(null)" role="dialog" aria-modal="true">
          <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-3xl border border-emerald-500/40 shadow-2xl p-6 space-y-5"
               (click)="$event.stopPropagation()">
            
            <div class="flex items-start justify-between border-b border-gray-100 dark:border-zinc-800 pb-3.5">
              <div class="flex items-center gap-2.5">
                <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xl">🌿</span>
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-widest block">{{ formula.tradition }}</span>
                  <h3 class="text-base font-black text-gray-900 dark:text-gray-100">{{ formula.title }}</h3>
                </div>
              </div>
              <button 
                type="button"
                (click)="activeTinctureFormula.set(null)"
                class="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:text-gray-900 dark:hover:text-zinc-100 flex items-center justify-center font-bold text-sm transition min-h-[36px] min-w-[36px]"
                aria-label="Close formula modal">
                ✕
              </button>
            </div>

            <div class="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl text-xs space-y-1">
              <span class="font-bold text-gray-700 dark:text-zinc-300 block">Indication:</span>
              <p class="text-gray-600 dark:text-zinc-300">{{ formula.indication }}</p>
            </div>

            <!-- Ingredients & Ratios -->
            <div class="space-y-2">
              <h4 class="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center justify-between">
                <span>🧪 Botanical Ingredients & Ratios</span>
                <span class="font-mono text-emerald-600 dark:text-emerald-400">100% Target Formula</span>
              </h4>
              <div class="space-y-2">
                @for (ing of formula.ingredients; track ing.name) {
                  <div class="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div class="font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <span>{{ ing.name }}</span>
                        <span class="italic text-[11px] text-gray-500 dark:text-zinc-400">({{ ing.botanicalName }})</span>
                        <span class="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono">{{ ing.actionRole }}</span>
                      </div>
                      <div class="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">{{ ing.activeConstituents }}</div>
                    </div>
                    <span class="text-sm font-mono font-black text-emerald-700 dark:text-emerald-300">{{ ing.percentage }}%</span>
                  </div>
                }
              </div>
            </div>

            <!-- Extraction & Menstruum Specs -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl space-y-1">
                <span class="font-bold text-gray-700 dark:text-zinc-300 block">Menstruum & Ratio:</span>
                <p class="text-gray-600 dark:text-zinc-300">{{ formula.extractionRatio }}</p>
                <p class="text-[11px] text-gray-500 dark:text-zinc-400">{{ formula.menstruumType }}</p>
              </div>
              <div class="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl space-y-1">
                <span class="font-bold text-gray-700 dark:text-zinc-300 block">Alcohol-Free Alternative:</span>
                <p class="text-emerald-700 dark:text-emerald-400 font-semibold">{{ formula.alcoholFreeAlternative }}</p>
              </div>
            </div>

            <!-- Suggested Dosing & Contraindications -->
            <div class="space-y-2 text-xs">
              <div class="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-1">
                <span class="font-bold text-indigo-900 dark:text-indigo-300 block">Suggested Dosing Protocol:</span>
                <p class="text-indigo-800 dark:text-indigo-200">{{ formula.suggestedDosage }}</p>
              </div>

              @if (formula.contraindications.length > 0) {
                <div class="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 rounded-xl space-y-1">
                  <span class="font-bold text-amber-900 dark:text-amber-300 block">Clinical Safety & Contraindications:</span>
                  <ul class="list-disc list-inside text-amber-800 dark:text-amber-200 text-[11px]">
                    @for (contra of formula.contraindications; track contra) {
                      <li>{{ contra }}</li>
                    }
                  </ul>
                </div>
              }
            </div>

            <!-- Vetted Sourcing Actions -->
            <div class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3 text-xs">
              <div class="flex justify-between items-start">
                <div>
                  <span class="font-bold text-emerald-900 dark:text-emerald-200 block">Vetted Ready-Made Product:</span>
                  <span class="text-sm font-black text-gray-900 dark:text-gray-100">{{ formula.vettedReadyMadeBrand.productTitle }}</span>
                  <div class="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                    {{ formula.vettedReadyMadeBrand.brandName }} • {{ formula.vettedReadyMadeBrand.priceRange }}
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap gap-2 pt-2">
                <a 
                  [href]="sourcingService.generateLocalMapsUrl('apothecary', formula.title)"
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 min-h-[44px]">
                  <span>🏡 Find at Local Apothecary</span>
                  <span>↗</span>
                </a>
                <a 
                  [href]="sourcingService.generateLocalMapsUrl('whole_foods', formula.title)"
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 min-h-[44px]">
                  <span>🥦 Whole Foods Market</span>
                  <span>↗</span>
                </a>
                <a 
                  [href]="sourcingService.generateAmazonAffiliateUrl(formula.vettedReadyMadeBrand.productTitle)"
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 min-h-[44px]">
                  <span>📦 Buy on Amazon Prime</span>
                  <span>↗</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      }

      <!-- Nearest Medical Centers List -->
      <div class="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-3">
        <h4 class="text-xs font-black uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-2">
          <span>🏥 Nearest Accredited Hospitals & 24/7 Medical Depots</span>
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          @for (center of networkService.treatmentCenters(); track center.id) {
            <div class="p-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg space-y-1">
              <div class="flex justify-between items-start">
                <span class="font-bold text-gray-900 dark:text-gray-100">{{ center.facilityName }}</span>
                <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                  {{ center.distanceMiles }} mi
                </span>
              </div>
              <div class="text-[11px] text-gray-500 dark:text-zinc-400">{{ center.cityState }} • {{ center.phone }}</div>
              <div class="text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                {{ center.isEmergency247 ? '✅ 24/7 Emergency Room & Trauma Center' : '⏰ Business Hours Clinic' }}
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class MedicalSupplyNavigatorComponent {
  protected readonly networkService = inject(ProviderTreatmentNetworkService);
  protected readonly state = inject(PatientStateService);
  protected readonly decoder = inject(MedicalDecoderService);
  public readonly sourcingService = inject(StoreSourcingService);

  readonly searchQuery = input<string>('');
  readonly selectedCategory = signal<string>('all');
  readonly activeTinctureFormula = signal<ITinctureFormula | null>(null);

  openTinctureDrawer(formulaId: string): void {
    const formula = this.sourcingService.getTinctureFormulas().find(f => f.id === formulaId);
    if (formula) {
      this.activeTinctureFormula.set(formula);
    }
  }

  readonly supplies = signal<IMedicalSupplyItem[]>([
    {
      id: 'sup-bot-1',
      name: 'Ashwagandha Shen-Calm Botanical Tincture',
      category: 'Botanical Tinctures & Herbs',
      availability: 'Over-the-Counter (OTC)',
      typicalCostRange: '$18 - $24',
      whereToAcquire: ['Local Herbal Apothecary', 'Community Food Co-op', 'Whole Foods Market', 'iHerb'],
      clinicalIndication: 'Adaptogenic Withanolide and Eugenol formulation for stabilizing sympathetic tone, supporting cortisol rhythm, and promoting restorative sleep.',
      patientPlainSummary: 'A gentle organic botanical blend designed to calm your nervous system and support healthy sleep without morning grogginess.',
      loincOrStandardCode: 'Botanical Adaptogen',
      isUrgentNeed: false,
      isHsaEligible: true,
      tinctureFormulaId: 'formula-shen-calm',
      recommendedLocalType: 'apothecary'
    },
    {
      id: 'sup-bot-2',
      name: 'Huang Qi & Spleen Yang Organic Decoction Pack',
      category: 'Botanical Tinctures & Herbs',
      availability: 'Over-the-Counter (OTC)',
      typicalCostRange: '$22 - $28',
      whereToAcquire: ['Traditional Asian Herbal Dispensary', 'Local Food Co-op', 'Plum Flower TCM Online'],
      clinicalIndication: 'Astragaloside and Polysaccharide decoction for tonifying Spleen Qi, enhancing cellular immune resilience, and clearing fluid stagnation.',
      patientPlainSummary: 'Traditional Astragalus and Codonopsis root pack to simmer as a warm nourishing tea for deep daily vitality and digestion.',
      loincOrStandardCode: 'TCM Decoction',
      isUrgentNeed: false,
      isHsaEligible: true,
      tinctureFormulaId: 'formula-spleen-qi',
      recommendedLocalType: 'asian_herbal'
    },
    {
      id: 'sup-bot-3',
      name: 'Cardio-Shield Hawthorn & Arjuna Heart Tonic',
      category: 'Botanical Tinctures & Herbs',
      availability: 'Over-the-Counter (OTC)',
      typicalCostRange: '$19 - $26',
      whereToAcquire: ['Local Natural Food Co-op', 'Whole Foods Market', 'Compounding Pharmacy'],
      clinicalIndication: 'Oligomeric Proanthocyanidin and Vitexin botanical extract for coronary endothelial support and blood pressure modulation.',
      patientPlainSummary: 'Organic Hawthorn and Arjuna drops to support healthy cardiovascular circulation and steady heart rhythms.',
      loincOrStandardCode: 'Cardio-Botanical',
      isUrgentNeed: false,
      isHsaEligible: true,
      tinctureFormulaId: 'formula-circadian-cardio',
      recommendedLocalType: 'local_coop'
    },
    {
      id: 'sup-1',
      name: 'Finger Pulse Oximeter & SpO2 Monitor',
      category: 'Diagnostic Vitals',
      availability: 'Over-the-Counter (OTC)',
      typicalCostRange: '$15 - $35',
      whereToAcquire: ['Retail Pharmacy (CVS/Walgreens)', 'Medical Supply Stores', 'Major Supermarkets'],
      clinicalIndication: 'Measures arterial oxygen saturation (SpO2) and photoplethysmographic pulse rate. Recommended for asthma, COPD, and viral respiratory monitor.',
      patientPlainSummary: 'A clip for your finger that checks your blood oxygen levels and pulse rate in seconds without any pain.',
      loincOrStandardCode: 'LOINC 2708-6',
      isUrgentNeed: false,
      isHsaEligible: true,
      recommendedLocalType: 'pharmacy'
    },
    {
      id: 'sup-2',
      name: 'Automated External Defibrillator (AED) & Pocket CPR Mask',
      category: 'Emergency & Resuscitation',
      availability: 'Over-the-Counter (OTC)',
      typicalCostRange: '$1,200 - $1,800 (AED) / $10 (Mask)',
      whereToAcquire: ['Certified Medical Equipment Distributors', 'Public Access AED Stations', 'Emergency Response Depots'],
      clinicalIndication: 'Delivers biphasic electric shock for Ventricular Fibrillation (VF) and Pulseless Ventricular Tachycardia (pVT) cardiac arrest resuscitation.',
      patientPlainSummary: 'A portable machine that provides step-by-step voice guidance to restart a heart during a cardiac emergency.',
      loincOrStandardCode: 'ECG Defibrillator',
      isUrgentNeed: true,
      isHsaEligible: true,
      recommendedLocalType: 'compounding_pharmacy'
    },
    {
      id: 'sup-3',
      name: 'Continuous Glucose Monitor (CGM) Sensors',
      category: 'Metabolic & Diabetes',
      availability: 'Over-the-Counter (OTC)',
      typicalCostRange: '$75 - $120 / month',
      whereToAcquire: ['Retail Pharmacy', 'Direct-to-Consumer Digital Health Apps', 'DME Suppliers'],
      clinicalIndication: 'Real-time interstitial glucose monitoring with 1-minute telemetry updates and hypo/hyperglycemic trend rate alerts.',
      patientPlainSummary: 'A tiny arm sensor that tracks your blood sugar level 24/7 directly on your smartphone without finger pricks.',
      loincOrStandardCode: 'LOINC 97507-8',
      isUrgentNeed: false,
      isHsaEligible: true,
      recommendedLocalType: 'pharmacy'
    },
    {
      id: 'sup-4',
      name: 'Automated Upper-Arm Blood Pressure Cuff (AAMI Validated)',
      category: 'Diagnostic Vitals',
      availability: 'Over-the-Counter (OTC)',
      typicalCostRange: '$30 - $70',
      whereToAcquire: ['Pharmacies', 'Medical Equipment Outlets', 'Big Box Retailers'],
      clinicalIndication: 'Oscillometric non-invasive blood pressure measurement. Essential for screening stage 1/2 hypertension and preeclampsia.',
      patientPlainSummary: 'An easy arm cuff that inflates with one button to measure your blood pressure and heart rate.',
      loincOrStandardCode: 'LOINC 85354-9',
      isUrgentNeed: false,
      isHsaEligible: true,
      recommendedLocalType: 'pharmacy'
    },
    {
      id: 'sup-5',
      name: 'Hypoallergenic Wound Closure Strips & Adhesive Bandages (Bandaids)',
      category: 'Wound Care & Sterile',
      availability: 'Over-the-Counter (OTC)',
      typicalCostRange: '$3 - $12',
      whereToAcquire: ['Grocery Stores & Supermarkets', 'Convenience Stores & Bodegas', 'Retail Pharmacies', 'Gas Station Depots'],
      clinicalIndication: 'Sterile adhesive strips for small skin abrasions, finger-prick blood sampling sites, and superficial wound protection.',
      patientPlainSummary: 'Standard flexible bandages and clean wipes to cover small cuts or scratches anywhere you go.',
      loincOrStandardCode: 'First Aid Staples',
      isUrgentNeed: false,
      isHsaEligible: true,
      recommendedLocalType: 'pharmacy'
    },
    {
      id: 'sup-6',
      name: 'Fast-Acting Orange Juice / Rescue Glucose Gel (Rule of 15)',
      category: 'Metabolic & Diabetes',
      availability: 'Over-the-Counter (OTC)',
      typicalCostRange: '$1 - $5',
      whereToAcquire: ['Grocery Stores & Supermarkets', 'Convenience Stores & Bodegas', 'Gas Stations', 'Vending Machines'],
      clinicalIndication: 'Rapid-acting oral simple carbohydrates (15g glucose equivalent) for acute hypoglycemia emergency reversal (Rule of 15).',
      patientPlainSummary: '4 oz of orange juice, apple juice, or glucose gel available at any grocery store or bodega to quickly rescue low blood sugar.',
      loincOrStandardCode: 'LOINC 97507-8',
      isUrgentNeed: true,
      recommendedLocalType: 'whole_foods'
    },
    {
      id: 'sup-7',
      name: 'Benzocaine 20% Toothache & Oral Anesthetic Gel',
      category: 'Dental & Oral Health Care',
      availability: 'Over-the-Counter (OTC)',
      typicalCostRange: '$4 - $10',
      whereToAcquire: ['Grocery Stores & Supermarkets', 'Retail Pharmacies', 'Convenience Stores'],
      clinicalIndication: 'Topical ester local anesthetic for temporary pain mitigation in acute odontalgia, aphthous ulcers, and gingival irritation.',
      patientPlainSummary: 'Fast-acting numbing gel available at any grocery store or pharmacy to relieve sharp toothache or gum pain.',
      loincOrStandardCode: 'CDT D9630',
      isUrgentNeed: true,
      isHsaEligible: true,
      recommendedLocalType: 'pharmacy'
    },
    {
      id: 'sup-8',
      name: 'Eugenol Clove Oil & Zinc-Oxide Temporary Tooth Filling Putty',
      category: 'Dental & Oral Health Care',
      availability: 'Over-the-Counter (OTC)',
      typicalCostRange: '$6 - $14',
      whereToAcquire: ['Retail Pharmacies', 'Supermarkets', 'Emergency Medical Outlets'],
      clinicalIndication: 'Analgesic essential oil and temporary cavity sealant to protect exposed dentin tubules until emergency dental repair.',
      patientPlainSummary: 'A temporary dental putty with natural clove oil to cover lost fillings or cracked teeth until you see a dentist.',
      loincOrStandardCode: 'CDT D2940',
      isUrgentNeed: true,
      isHsaEligible: true,
      recommendedLocalType: 'pharmacy'
    }
  ]);

  readonly filteredSupplies = computed(() => {
    const cat = this.selectedCategory();
    const query = (this.searchQuery() || '').toLowerCase().trim();
    let items = this.supplies();

    if (cat !== 'all') {
      items = items.filter(i => i.category === cat);
    }

    if (query) {
      items = items.filter(i => 
        i.name.toLowerCase().includes(query) ||
        i.patientPlainSummary.toLowerCase().includes(query) ||
        i.clinicalIndication.toLowerCase().includes(query) ||
        i.whereToAcquire.some(w => w.toLowerCase().includes(query))
      );
    }

    return items;
  });
}
