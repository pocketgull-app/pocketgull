import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  BioregionalClimateFlourishingService,
  IBioregionalClimateInput,
  IFoodshedCarbonInput,
  INativeBiodiversityInput
} from '../../services/bioregional-climate-flourishing.service';

@Component({
  selector: 'app-bioregional-climate-flourishing-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-zinc-950 text-zinc-100 rounded-3xl border border-emerald-500/30 shadow-2xl space-y-6">
      
      <!-- Banner Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-xs">
            🌍
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-base sm:text-lg font-black tracking-wider text-white">
                Bioregional Planetary Health &amp; Climate Resilience Studio
              </h3>
              <span class="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                Planetary Boundaries &amp; Active Hope
              </span>
            </div>
            <p class="text-xs text-zinc-400">
              IPCC wet-bulb thermal strain modeling, 100-mile foodshed carbon drawdown, and native keystone pollinator guilds.
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-bold font-mono">
        <button (click)="activeSubTab.set('climate')"
                [class.bg-emerald-500]="activeSubTab() === 'climate'"
                [class.text-zinc-950]="activeSubTab() === 'climate'"
                [class.text-zinc-300]="activeSubTab() !== 'climate'"
                class="px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5">
          <span>🌡️ 1. Thermal Stress &amp; Wildfire Defense</span>
        </button>
        <button (click)="activeSubTab.set('foodshed')"
                [class.bg-cyan-500]="activeSubTab() === 'foodshed'"
                [class.text-zinc-950]="activeSubTab() === 'foodshed'"
                [class.text-zinc-300]="activeSubTab() !== 'foodshed'"
                class="px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5">
          <span>🥕 2. 100-Mile Foodshed &amp; Carbon Drawdown</span>
        </button>
        <button (click)="activeSubTab.set('biodiversity')"
                [class.bg-amber-500]="activeSubTab() === 'biodiversity'"
                [class.text-zinc-950]="activeSubTab() === 'biodiversity'"
                [class.text-zinc-300]="activeSubTab() !== 'biodiversity'"
                class="px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5">
          <span>🐝 3. Native Keystone Guilds &amp; Active Hope</span>
        </button>
      </div>

      <!-- SUBTAB 1: Thermal Stress & Climate Vulnerability -->
      @if (activeSubTab() === 'climate') {
        <div class="space-y-4 animate-fadeIn">
          <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <h4 class="text-xs font-mono font-black uppercase text-emerald-400 flex items-center gap-2">
                  <span>🌡️ Downscaled Wet-Bulb &amp; Wildfire PM2.5 Forecaster</span>
                </h4>
                <p class="text-[11px] text-zinc-400 mt-0.5">Calculates dangerous wet-bulb temperature days (where sweat evaporative cooling fails).</p>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono text-zinc-400">Bioregion:</span>
                <select [value]="selectedBioregion()" 
                        (change)="onBioregionChange($event)"
                        class="text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono">
                  <option value="PACIFIC_NORTHWEST_CASCADIA">🌲 Pacific Northwest (Cascadia)</option>
                  <option value="EASTERN_DECIDUOUS">🍁 Eastern Deciduous Forest (East Coast)</option>
                  <option value="SONORAN_DESERT">🌵 Sonoran &amp; Mojave Desert</option>
                  <option value="GREAT_PLAINS">🌾 Great Plains &amp; Prairies</option>
                  <option value="MEDITERRANEAN_BASIN">🫒 Mediterranean Basin (Southern Europe / Levant)</option>
                  <option value="SUB_SAHARAN_SAHEL">🌳 Sub-Saharan Sahel (Agroforestry &amp; Drylands)</option>
                  <option value="SOUTH_ASIAN_MONSOON">🌧️ South Asian Monsoon (Ganges &amp; Deccan)</option>
                  <option value="ANDEAN_HIGHLANDS">🏔️ Andean High-Altitude Altiplano</option>
                  <option value="UK_MARITIME_ATLANTIC">🌊 UK &amp; Atlantic Maritime</option>
                </select>
              </div>
            </div>

            <!-- Toggles and Parameters -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span class="text-xs font-bold text-zinc-200">Urban Tree Canopy Coverage</span>
                <div class="flex justify-between text-xs font-mono text-emerald-400">
                  <span>{{ treeCanopyPct }}%</span>
                  <span class="text-[10px] text-zinc-500">Benchmark: 40%</span>
                </div>
                <input type="range" min="5" max="60" step="1" [(ngModel)]="treeCanopyPct" class="w-full h-1 bg-zinc-800 rounded-lg cursor-pointer accent-emerald-500">
                <p class="text-[10px] text-zinc-500">High canopy shades building envelopes and lowers asphalt heat radiation.</p>
              </div>

              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span class="text-xs font-bold text-zinc-200">Cooling &amp; HVAC Infrastructure</span>
                <select [(ngModel)]="coolingType" class="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white">
                  <option value="HEAT_PUMP">Heat Pump (High Efficiency Reversible)</option>
                  <option value="CENTRAL_AC">Central Air Conditioning</option>
                  <option value="WINDOW_UNIT">Single Window Unit</option>
                  <option value="NONE_PASSIVE">Zero Mechanical AC (Passive Only)</option>
                </select>
                <label class="flex items-center gap-2 text-[11px] text-zinc-300 mt-2 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="hasCardioRespVulnerability" class="rounded text-emerald-500">
                  <span>Cardiovascular / Respiratory Vulnerability</span>
                </label>
              </div>

              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span class="text-xs font-bold text-zinc-200">Elevation &amp; Geography</span>
                <div class="flex justify-between text-xs font-mono text-emerald-400">
                  <span>{{ elevationMeters }}m</span>
                  <span class="text-[10px] text-zinc-500">-6.5°C / 1000m lapse</span>
                </div>
                <input type="range" min="0" max="2500" step="50" [(ngModel)]="elevationMeters" class="w-full h-1 bg-zinc-800 rounded-lg cursor-pointer accent-emerald-500">
                <div class="text-[10px] font-mono text-cyan-300">
                  Passive Cooling Potential: {{ climateResult().passiveCoolingPotentialPct }}%
                </div>
              </div>
            </div>

            <!-- Telemetry Badges -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div class="p-3 rounded-lg border text-xs space-y-1"
                   [class.bg-emerald-950/20]="climateResult().cardiovascularHeatStrainTier === 'LOW_RESILIENT'"
                   [class.border-emerald-500/40]="climateResult().cardiovascularHeatStrainTier === 'LOW_RESILIENT'"
                   [class.bg-amber-950/20]="climateResult().cardiovascularHeatStrainTier === 'MODERATE_VIGILANCE'"
                   [class.border-amber-500/40]="climateResult().cardiovascularHeatStrainTier === 'MODERATE_VIGILANCE'"
                   [class.bg-rose-950/30]="climateResult().cardiovascularHeatStrainTier === 'SEVERE_HEAT_STRESS'"
                   [class.border-rose-500/50]="climateResult().cardiovascularHeatStrainTier === 'SEVERE_HEAT_STRESS'">
                <div class="font-bold text-[11px]">Cardiovascular Heat Tier</div>
                <div class="text-base font-mono font-bold">{{ climateResult().cardiovascularHeatStrainTier }}</div>
                <p class="text-[10px] text-zinc-400">Physiological threshold for nocturnal cardiovascular recovery.</p>
              </div>

              <div class="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs space-y-1">
                <div class="font-bold text-amber-300 text-[11px]">Dangerous Wet-Bulb Days</div>
                <div class="text-lg font-mono font-bold text-white">{{ climateResult().projectedDangerousWetBulbDaysYearly }} days/yr</div>
                <p class="text-[10px] text-zinc-400">Days requiring strict hydration and heat avoidance.</p>
              </div>

              <div class="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs space-y-1">
                <div class="font-bold text-rose-300 text-[11px]">Wildfire Smoke Exposure</div>
                <div class="text-lg font-mono font-bold text-white">{{ climateResult().projectedWildfireSmokePm25Days }} days/yr</div>
                <p class="text-[10px] text-zinc-400">Projected AQI > 100 smoke plume transport days.</p>
              </div>
            </div>

            <!-- Prescriptions -->
            <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1">
              <div class="font-bold text-emerald-300 text-[11px]">🏡 Climate Adaptation Prescriptions:</div>
              <ul class="list-disc list-inside text-zinc-300 text-[11px] space-y-0.5">
                @for (rec of climateResult().climateResiliencePrescriptions; track rec) {
                  <li>{{ rec }}</li>
                }
              </ul>
            </div>
          </div>
        </div>
      }

      <!-- SUBTAB 2: 100-Mile Foodshed & Carbon Drawdown -->
      @if (activeSubTab() === 'foodshed') {
        <div class="space-y-4 animate-fadeIn">
          <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <h4 class="text-xs font-mono font-black uppercase text-cyan-400 flex items-center gap-2">
                  <span>🥕 100-Mile Foodshed &amp; Atmospheric Carbon Drawdown</span>
                </h4>
                <p class="text-[11px] text-zinc-400 mt-0.5">Measures how dietary choices sustain regional soil carbon sinks.</p>
              </div>

              <span class="px-2.5 py-1 text-[10px] font-mono font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Self-Reliance Score: {{ foodshedResult().foodshedSelfRelianceScore }}/100
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span class="text-xs font-bold text-zinc-200">Local Produce Share (&lt; 100 Miles)</span>
                <div class="flex justify-between text-xs font-mono text-cyan-400">
                  <span>{{ localProduceShare }}%</span>
                  <span class="text-[10px] text-zinc-500">CSA / Farm Stand</span>
                </div>
                <input type="range" min="0" max="100" step="5" [(ngModel)]="localProduceShare" class="w-full h-1 bg-zinc-800 rounded-lg cursor-pointer accent-cyan-500">
              </div>

              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span class="text-xs font-bold text-zinc-200">Ancestral Plant-Rich Days</span>
                <div class="flex justify-between text-xs font-mono text-cyan-400">
                  <span>{{ plantRichDays }} days/wk</span>
                  <span class="text-[10px] text-zinc-500">Legumes &amp; Ancient Grains</span>
                </div>
                <input type="range" min="0" max="7" step="1" [(ngModel)]="plantRichDays" class="w-full h-1 bg-zinc-800 rounded-lg cursor-pointer accent-cyan-500">
              </div>

              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span class="text-xs font-bold text-zinc-200">Garden Growing Space</span>
                <div class="flex justify-between text-xs font-mono text-cyan-400">
                  <span>{{ gardenSqFt }} sq ft</span>
                  <span class="text-[10px] text-zinc-500">Raised beds / Yard</span>
                </div>
                <input type="range" min="0" max="1000" step="25" [(ngModel)]="gardenSqFt" class="w-full h-1 bg-zinc-800 rounded-lg cursor-pointer accent-cyan-500">
              </div>
            </div>

            <!-- Impact Telemetry -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div class="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1">
                <div class="font-bold text-cyan-300 text-[11px]">💨 Annual CO2e Avoidance</div>
                <div class="text-xl font-mono font-bold text-white">{{ foodshedResult().householdDietaryCo2eAvoidanceKgYr }} kg</div>
                <p class="text-[10px] text-zinc-400">Equivalent to hundreds of cross-country food transport miles.</p>
              </div>

              <div class="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
                <div class="font-bold text-emerald-300 text-[11px]">🚜 Regenerative Land Sustained</div>
                <div class="text-xl font-mono font-bold text-white">{{ foodshedResult().acresOfRegenerativeSoilSustained }} acres</div>
                <p class="text-[10px] text-zinc-400">Living topsoil actively stewarded through local purchasing.</p>
              </div>

              <div class="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs space-y-1">
                <div class="font-bold text-amber-300 text-[11px]">🪱 Carbon Sequestered in Soil</div>
                <div class="text-xl font-mono font-bold text-white">{{ foodshedResult().soilCarbonDrawdownContributionLbsYr }} lbs/yr</div>
                <p class="text-[10px] text-zinc-400">Stored long-term as insoluble glomalin in mycorrhizal networks.</p>
              </div>
            </div>

            <!-- Milestones -->
            <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1.5">
              <div class="font-bold text-cyan-300 text-[11px]">🌾 Planetary Health Milestones:</div>
              @for (mile of foodshedResult().planetaryHealthMilestones; track mile) {
                <div class="text-zinc-200 text-[11px] flex items-start gap-2">
                  <span class="text-cyan-400">✓</span>
                  <span>{{ mile }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- SUBTAB 3: Native Keystone Biodiversity & Active Hope -->
      @if (activeSubTab() === 'biodiversity') {
        <div class="space-y-4 animate-fadeIn">
          <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <h4 class="text-xs font-mono font-black uppercase text-amber-400 flex items-center gap-2">
                  <span>🐝 Hyper-Local Keystone Plant Guilds &amp; Biophilic Restoration</span>
                </h4>
                <p class="text-[11px] text-zinc-400 mt-0.5">Keystone species sustain 90% of native caterpillars, wild bumblebees, and songbirds.</p>
              </div>

              <div class="text-xs font-mono font-bold text-emerald-400">
                Cortisol Reduction: -{{ biodiversityResult().projectedSalivaryCortisolReductionPct }}%
              </div>
            </div>

            <!-- Keystone Plants Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              @for (plant of biodiversityResult().recommendedKeystonePlants; track plant.botanicalName) {
                <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-amber-300">{{ plant.plantCommonName }}</span>
                    <span class="text-[10px] font-mono text-zinc-500 italic">{{ plant.botanicalName }}</span>
                  </div>
                  <div class="text-[11px] text-zinc-300">
                    {{ plant.ecologicalRole }}
                  </div>
                  <div class="p-2 rounded bg-zinc-900 border border-zinc-800/80 text-[10px] font-mono text-emerald-400">
                    🦋 Hosts {{ plant.caterpillarPollinatorSpeciesHosted }} native pollinator/caterpillar species
                  </div>
                  <div class="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800">
                    <span class="text-cyan-400 font-bold">Human Use:</span> {{ plant.medicinalOrCulinaryHumanUse }}
                  </div>
                </div>
              }
            </div>

            <!-- Active Hope Compass -->
            <div class="p-4 rounded-2xl bg-gradient-to-r from-amber-950/20 via-zinc-950 to-emerald-950/20 border border-amber-500/30 flex items-start gap-3">
              <span class="text-2xl">🌱</span>
              <div class="space-y-1">
                <span class="text-xs font-bold text-amber-300">Biocentric Action Compass (Active Hope):</span>
                <p class="text-xs text-zinc-200 leading-relaxed italic">
                  "{{ biodiversityResult().biocentricActionCompass }}"
                </p>
              </div>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class BioregionalClimateFlourishingCardComponent {
  private climateService = inject(BioregionalClimateFlourishingService);

  activeSubTab = signal<'climate' | 'foodshed' | 'biodiversity'>('climate');

  // Climate state
  readonly selectedBioregion = signal<string>('PACIFIC_NORTHWEST_CASCADIA');
  treeCanopyPct = 25.0;
  elevationMeters = 150.0;
  coolingType: 'HEAT_PUMP' | 'CENTRAL_AC' | 'WINDOW_UNIT' | 'NONE_PASSIVE' = 'HEAT_PUMP';
  hasCardioRespVulnerability = false;

  onBioregionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.selectedBioregion.set(target.value);
    }
  }

  // Foodshed state
  adultsCount = 2;
  localProduceShare = 40.0;
  plantRichDays = 5;
  gardenSqFt = 200.0;

  // Biodiversity state
  weeklyNatureMinutes = 135;

  readonly climateResult = computed(() => {
    return this.climateService.evaluateBioregionalClimate({
      ecoregionId: this.selectedBioregion(),
      urbanTreeCanopyCoveragePct: this.treeCanopyPct,
      ambientElevationMeters: this.elevationMeters,
      airConditioningType: this.coolingType,
      knownRespiratoryCardiacVulnerability: this.hasCardioRespVulnerability
    });
  });

  readonly foodshedResult = computed(() => {
    return this.climateService.calculateFoodshedCarbonDrawdown({
      householdAdultsCount: this.adultsCount,
      percentProduceFromLocalFarmsCsa: this.localProduceShare,
      ancestralPlantRichDaysPerWeek: this.plantRichDays,
      backyardOrCommunityGardenSqFt: this.gardenSqFt
    });
  });

  readonly biodiversityResult = computed(() => {
    return this.climateService.evaluateNativeBiodiversity({
      ecoregionId: this.selectedBioregion(),
      outdoorSpaceType: 'SUBURBAN_YARD',
      weeklyNatureImmersionMinutes: this.weeklyNatureMinutes
    });
  });
}
