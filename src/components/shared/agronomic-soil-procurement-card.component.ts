import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AgronomicSoilProcurementService,
  ISoilHealthInput,
  IFarmPlanningInput,
  IGroceryStockingInput
} from '../../services/agronomic-soil-procurement.service';

@Component({
  selector: 'app-agronomic-soil-procurement-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl space-y-6">
      
      <!-- Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl shadow-xs">
            🌱
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-base sm:text-lg font-black tracking-wider text-white">
                Agronomic Soil Science, Seed Procurement &amp; Grocery Stocking Engine
              </h3>
              <span class="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                Living Soil &amp; Food as Medicine
              </span>
            </div>
            <p class="text-xs text-zinc-400">
              Regenerative edaphology, mycorrhizal glomalin, open-pollinated seed planning, and 30+ botanical grocery stocking quotas.
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-bold font-mono">
        <button (click)="activeSubTab.set('soil')"
                [class.bg-amber-500]="activeSubTab() === 'soil'"
                [class.text-zinc-950]="activeSubTab() === 'soil'"
                [class.text-zinc-300]="activeSubTab() !== 'soil'"
                class="px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5">
          <span>🪱 1. Soil Health &amp; Mycorrhizal Glomalin</span>
        </button>
        <button (click)="activeSubTab.set('farm')"
                [class.bg-emerald-500]="activeSubTab() === 'farm'"
                [class.text-zinc-950]="activeSubTab() === 'farm'"
                [class.text-zinc-300]="activeSubTab() !== 'farm'"
                class="px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5">
          <span>🚜 2. Farm Crop &amp; Seed Procurement</span>
        </button>
        <button (click)="activeSubTab.set('grocery')"
                [class.bg-cyan-500]="activeSubTab() === 'grocery'"
                [class.text-zinc-950]="activeSubTab() === 'grocery'"
                [class.text-zinc-300]="activeSubTab() !== 'grocery'"
                class="px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5">
          <span>🏪 3. Grocery &amp; Food Co-op Stocking</span>
        </button>
      </div>

      <!-- SUBTAB 1: Soil Health & Edaphology -->
      @if (activeSubTab() === 'soil') {
        <div class="space-y-4 animate-fadeIn">
          <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <h4 class="text-xs font-mono font-black uppercase text-amber-400 flex items-center gap-2">
                <span>🔬 Regenerative Edaphic Vitality Matrix</span>
              </h4>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold text-amber-300">
                  Regenerative Soil Score: {{ soilResult().regenerativeSoilScore }}/100
                </span>
                <span class="px-2 py-0.5 text-[9px] font-mono font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {{ soilResult().mycorrhizalGlomalinStabilityTier }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span class="text-xs font-bold text-zinc-200">Soil Organic Matter (SOM %)</span>
                <div class="flex justify-between text-xs font-mono text-amber-400">
                  <span>{{ soilOrganicMatter }}%</span>
                  <span class="text-[10px] text-zinc-400">Target: > 4.5%</span>
                </div>
                <input type="range" min="0.5" max="10.0" step="0.1" [(ngModel)]="soilOrganicMatter" class="w-full h-1 bg-zinc-800 rounded-lg cursor-pointer accent-amber-500">
                <p class="text-[10px] text-zinc-500">Each 1% SOM stores 20,000 gallons of water per acre.</p>
              </div>

              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span class="text-xs font-bold text-zinc-200">Fungal : Bacterial Ratio</span>
                <div class="flex justify-between text-xs font-mono text-amber-400">
                  <span>{{ fungalToBacterialRatio }}:1</span>
                  <span class="text-[10px] text-zinc-400">Target: > 1.0</span>
                </div>
                <input type="range" min="0.1" max="2.5" step="0.05" [(ngModel)]="fungalToBacterialRatio" class="w-full h-1 bg-zinc-800 rounded-lg cursor-pointer accent-amber-500">
                <p class="text-[10px] text-zinc-500">Mycorrhizal hyphae produce glomalin soil carbon glue.</p>
              </div>

              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span class="text-xs font-bold text-zinc-200">Tillage Management</span>
                <select [(ngModel)]="tillageIntensity" class="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white">
                  <option value="NO_TILL">No-Till (Roller-Crimper Cover Crops)</option>
                  <option value="MINIMUM_TILL">Minimum Strip-Till</option>
                  <option value="CONVENTIONAL_DEEP_TILL">Conventional Moldboard Plow</option>
                </select>
                <div class="text-[10px] text-zinc-400 mt-1">
                  Living Cover: <span class="text-emerald-400 font-bold">{{ coverCropYears }} yrs</span>
                </div>
              </div>
            </div>

            <!-- Soil Science Telemetry Badges -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div class="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
                <div class="font-bold text-emerald-300 text-[11px]">🍓 Crop Polyphenol Boost</div>
                <div class="text-lg font-mono font-bold text-white">+{{ soilResult().projectedCropPolyphenolBoostPct }}%</div>
                <p class="text-[10px] text-zinc-400">Phytochemical synthesis stimulated by living soil microbiology.</p>
              </div>

              <div class="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1">
                <div class="font-bold text-cyan-300 text-[11px]">🧪 Biological Nitrogen Credit</div>
                <div class="text-lg font-mono font-bold text-white">{{ soilResult().rhizobialNitrogenFixationCreditLbsAcre }} lbs/acre</div>
                <p class="text-[10px] text-zinc-400">Fixed naturally by Rhizobia; zero synthetic fossil-fuel fertilizer needed.</p>
              </div>

              <div class="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs space-y-1">
                <div class="font-bold text-amber-300 text-[11px]">🥦 Trace Minerals (Zn, Fe, Se)</div>
                <div class="text-lg font-mono font-bold text-white">{{ soilResult().traceMineralBioavailabilityTier }}</div>
                <p class="text-[10px] text-zinc-400">Available for root uptake via mycorrhizal organic acid exudation.</p>
              </div>
            </div>

            <!-- Amendment Directives -->
            <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1">
              <div class="font-bold text-amber-300 text-[11px]">🌱 Soil Ecological Directives:</div>
              <ul class="list-disc list-inside text-zinc-300 text-[11px] space-y-0.5">
                @for (rec of soilResult().edaphicAmendmentRecommendations; track rec) {
                  <li>{{ rec }}</li>
                }
              </ul>
            </div>
          </div>
        </div>
      }

      <!-- SUBTAB 2: Farm Crop & Seed Procurement -->
      @if (activeSubTab() === 'farm') {
        <div class="space-y-4 animate-fadeIn">
          <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <h4 class="text-xs font-mono font-black uppercase text-emerald-400 flex items-center gap-2">
                  <span>🚜 9-Month Forward Seed Procurement &amp; Polyculture Planner</span>
                </h4>
                <p class="text-[11px] text-zinc-400 mt-0.5">Bridges regional disease burdens (diabetes, gut barrier) to agroecological crop portfolios.</p>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono text-zinc-400">Health Priority:</span>
                <select [(ngModel)]="healthPriority" class="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white">
                  <option value="METABOLIC_DIABETES_REVERSAL">📉 Type 2 Diabetes &amp; Glycemic Balance</option>
                  <option value="GUT_BARRIER_HEALTH">🛡️ Gut Mucosal Barrier &amp; SCFA Butyrate</option>
                  <option value="PEDIATRIC_IMMUNITY">👶 Pediatric Immunity &amp; Phytonutrients</option>
                </select>
              </div>
            </div>

            <!-- Guild Banner -->
            <div class="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200">
              <span class="font-bold">Agroecological Polyculture Guild:</span>
              <span class="ml-1 text-zinc-300">{{ farmResult().polycultureGuildRecommendation }}</span>
            </div>

            <!-- Recommended Crops Table -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              @for (crop of farmResult().recommendedCrops; track crop.cropName) {
                <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-emerald-300">{{ crop.cropName }}</span>
                    <span class="text-[10px] font-mono text-zinc-500">{{ crop.botanicalFamily }}</span>
                  </div>
                  <div class="text-[11px] font-mono text-amber-400">
                    Order Seeds: {{ crop.optimalSeedOrderMonth }}
                  </div>
                  <p class="text-[11px] text-zinc-300">{{ crop.clinicalValueProposition }}</p>
                  <div class="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800">
                    <span class="text-emerald-400 font-bold">Soil Benefit:</span> {{ crop.soilBenefit }}
                  </div>
                </div>
              }
            </div>

            <!-- Clinical Offtake Guarantee -->
            <div class="p-3 rounded-xl bg-zinc-950/80 border border-emerald-500/30 flex items-start gap-2">
              <span class="text-lg">🏥</span>
              <div class="text-[11px] text-zinc-300">
                <span class="font-bold text-emerald-300">Guaranteed Forward Offtake Contracts:</span>
                <span class="ml-1 text-zinc-200">{{ farmResult().estimatedClinicalOfftakeContracts }}</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- SUBTAB 3: Grocery & Food Co-op Stocking -->
      @if (activeSubTab() === 'grocery') {
        <div class="space-y-4 animate-fadeIn">
          <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <h4 class="text-xs font-mono font-black uppercase text-cyan-400 flex items-center gap-2">
                  <span>🏪 Community Produce Stocking &amp; Zero-Waste Shelf Quotas</span>
                </h4>
                <p class="text-[11px] text-zinc-400 mt-0.5">Empowers grocers and bodegas to stock 30+ botanical species with near-zero shrink.</p>
              </div>

              <span class="px-2.5 py-1 text-[10px] font-mono font-bold rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                Microbiome Target (30+ Species): {{ groceryResult().microbiomeDiversityTargetMet ? 'MET' : 'EXPANDING' }}
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              @for (item of groceryResult().recommendedProducePortfolio; track item.categoryName) {
                <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-cyan-300">{{ item.categoryName }}</span>
                    <span class="text-[10px] font-mono text-zinc-400">Shelf Life: {{ item.shelfLifeDays }} days</span>
                  </div>
                  <div class="text-[11px] text-zinc-300">
                    <span class="font-mono text-zinc-400">Botanical Target:</span> {{ item.botanicalFamilyTarget }}
                  </div>
                  <div class="p-2 rounded bg-zinc-900 border border-zinc-800/80 text-[10px] text-zinc-300">
                    <span class="text-cyan-400 font-bold">Zero-Waste Storage:</span> {{ item.zeroWasteStorageProtocol }}
                  </div>
                  <p class="text-[10px] text-zinc-400 italic">"{{ item.communityHealthImpact }}"</p>
                </div>
              }
            </div>

            <!-- Spoilage & Food-as-Medicine Voucher Banner -->
            <div class="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between text-xs">
              <div class="text-cyan-200">
                <span class="font-bold">Projected Spoilage Reduction:</span>
                <span class="ml-1 text-white font-mono font-bold">-{{ groceryResult().projectedSpoilageReductionPct }}%</span>
              </div>
              <span class="text-[11px] font-mono text-zinc-300">
                {{ groceryResult().foodAsMedicineVoucherCompatibility }}
              </span>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class AgronomicSoilProcurementCardComponent {
  private agronomicService = inject(AgronomicSoilProcurementService);

  activeSubTab = signal<'soil' | 'farm' | 'grocery'>('soil');

  // Soil state
  soilOrganicMatter = 4.5;
  soilPh = 6.5;
  cationExchangeCapacity = 20.0;
  fungalToBacterialRatio = 1.1;
  tillageIntensity: 'NO_TILL' | 'MINIMUM_TILL' | 'CONVENTIONAL_DEEP_TILL' = 'NO_TILL';
  coverCropYears = 4;

  // Farm state
  usdaZone = '6b';
  tillableAcres = 25.0;
  healthPriority: 'METABOLIC_DIABETES_REVERSAL' | 'PEDIATRIC_IMMUNITY' | 'GUT_BARRIER_HEALTH' = 'METABOLIC_DIABETES_REVERSAL';

  // Grocery state
  storeType: 'COMMUNITY_COOP' | 'NEIGHBORHOOD_BODEGA' | 'REGIONAL_MARKET' = 'COMMUNITY_COOP';
  weeklyShoppers = 1200;
  produceSkuCount = 36;
  refrigeratedFt = 40.0;

  readonly soilResult = computed(() => {
    return this.agronomicService.evaluateSoilHealth({
      soilOrganicMatterPct: this.soilOrganicMatter,
      soilPh: this.soilPh,
      cationExchangeCapacity: this.cationExchangeCapacity,
      fungalToBacterialRatio: this.fungalToBacterialRatio,
      tillageIntensity: this.tillageIntensity,
      coverCropHistoryYears: this.coverCropYears
    });
  });

  readonly farmResult = computed(() => {
    return this.agronomicService.planFarmCropPortfolio({
      usdaHardinessZone: this.usdaZone,
      totalTillableAcres: this.tillableAcres,
      waterAvailability: 'MODERATE_IRRIGATION',
      targetCommunityHealthPriority: this.healthPriority
    });
  });

  readonly groceryResult = computed(() => {
    return this.agronomicService.planGroceryStocking({
      storeType: this.storeType,
      weeklyShopperVolume: this.weeklyShoppers,
      currentFreshProduceSkuCount: this.produceSkuCount,
      refrigeratedShelfFootageLinearFt: this.refrigeratedFt
    });
  });
}
