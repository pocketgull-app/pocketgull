import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { ProduceRxNutritionReferralService, IFhirProduceRxReferral } from '../services/produce-rx-nutrition-referral.service';
import { SeasonalHarvestStockingCalendarService, IRegionalSeasonalCalendar } from '../services/seasonal-harvest-stocking-calendar.service';
import { OfflinePwaFoodshedCompanionService } from '../services/offline-pwa-foodshed-companion.service';
import { FoodInflationStockoutResilienceService, IInflationStockoutResilienceAudit, IFoodInflationAlternative, DietaryRestrictionType } from '../services/food-inflation-stockout-resilience.service';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { FaithTraditionConductCardComponent } from './shared/faith-tradition-conduct-card.component';
import { TcmAyurvedicCardComponent } from './shared/tcm-ayurvedic-card.component';
import { SovereignGuildCommonsCardComponent } from './shared/sovereign-guild-commons-card.component';
import { TrustedCommonsFederationCardComponent } from './shared/trusted-commons-federation-card.component';

export interface IGeolocationalDestination {
  id: string;
  cityName: string;
  stateCountry: string;
  climateZone: string;
  matchScore: number; // 0-100
  aqiScore: number; // Air Quality Index
  walkScore: number; // Walkability
  sunshineDays: number;
  greenSpaceIndex: number; // 0-100
  keyBenefits: string[];
  recommendedHobbies: {
    title: string;
    category: 'Movement' | 'Hydrotherapy' | 'Nature Therapy' | 'Social Cohesion';
    description: string;
    icon: string;
  }[];
  censusSdohData: {
    medianAge: number;
    healthcareAccessScore: number; // 0-100
    povertyRatePct: number;
    blueZoneIndex: number; // 0-100
  };
  localFoodShedAndStores: {
    coopsAndMarkets: string[];
    specialtyHeritageFoods: string[];
    microbiomeDiversityPotentialPct: number;
    nearestCsaOrFarmStand: string;
    clinicalRationaleForPatient: string;
  };
  whyIdealForPatient: string;
}

@Component({
  selector: 'app-geolocational-health-relocation',
  standalone: true,
  imports: [
    CommonModule, 
    PocketGullButtonComponent, 
    FaithTraditionConductCardComponent, 
    TcmAyurvedicCardComponent,
    SovereignGuildCommonsCardComponent,
    TrustedCommonsFederationCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white dark:bg-[#09090b] rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
      
      <!-- Header Rail -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800/80 pb-5">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              🗺️
            </div>
            <h2 class="text-lg font-bold text-gray-900 dark:text-zinc-100 tracking-tight">
              Geolocational Micro-Climate & Therapeutic Relocation Engine
            </h2>
          </div>
          <p class="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Leveraging US Census ACS data, EPA AQI indices, and environmental Social Determinants of Health (SDOH) to prescribe ideal climate zones and therapeutic hobbies for <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ activePatientName() }}</span>.
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button (click)="selectedTab.set('destinations')"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                  [class.bg-emerald-500]="selectedTab() === 'destinations'"
                  [class.text-white]="selectedTab() === 'destinations'"
                  [class.border-emerald-500]="selectedTab() === 'destinations'"
                  [class.bg-gray-50]="selectedTab() !== 'destinations'"
                  [class.dark:bg-zinc-800]="selectedTab() !== 'destinations'"
                  [class.text-gray-700]="selectedTab() !== 'destinations'"
                  [class.dark:text-zinc-300]="selectedTab() !== 'destinations'"
                  [class.border-gray-200]="selectedTab() !== 'destinations'"
                  [class.dark:border-zinc-700]="selectedTab() !== 'destinations'">
            🏞️ Optimal Micro-Climates
          </button>

          <button (click)="selectedTab.set('hobbies')"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                  [class.bg-emerald-500]="selectedTab() === 'hobbies'"
                  [class.text-white]="selectedTab() === 'hobbies'"
                  [class.border-emerald-500]="selectedTab() === 'hobbies'"
                  [class.bg-gray-50]="selectedTab() !== 'hobbies'"
                  [class.dark:bg-zinc-800]="selectedTab() !== 'hobbies'"
                  [class.text-gray-700]="selectedTab() !== 'hobbies'"
                  [class.dark:text-zinc-300]="selectedTab() !== 'hobbies'"
                  [class.border-gray-200]="selectedTab() !== 'hobbies'"
                  [class.dark:border-zinc-700]="selectedTab() !== 'hobbies'">
            🌿 Therapeutic Hobbies
          </button>

          <button (click)="selectedTab.set('stores')"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                  [class.bg-emerald-500]="selectedTab() === 'stores'"
                  [class.text-white]="selectedTab() === 'stores'"
                  [class.border-emerald-500]="selectedTab() === 'stores'"
                  [class.bg-gray-50]="selectedTab() !== 'stores'"
                  [class.dark:bg-zinc-800]="selectedTab() !== 'stores'"
                  [class.text-gray-700]="selectedTab() !== 'stores'"
                  [class.dark:text-zinc-300]="selectedTab() !== 'stores'"
                  [class.border-gray-200]="selectedTab() !== 'stores'"
                  [class.dark:border-zinc-700]="selectedTab() !== 'stores'">
            🛒 Local Stores & Produce Rx
          </button>

          <button (click)="selectedTab.set('calendar')"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                  [class.bg-emerald-500]="selectedTab() === 'calendar'"
                  [class.text-white]="selectedTab() === 'calendar'"
                  [class.border-emerald-500]="selectedTab() === 'calendar'"
                  [class.bg-gray-50]="selectedTab() !== 'calendar'"
                  [class.dark:bg-zinc-800]="selectedTab() !== 'calendar'"
                  [class.text-gray-700]="selectedTab() !== 'calendar'"
                  [class.dark:text-zinc-300]="selectedTab() !== 'calendar'"
                  [class.border-gray-200]="selectedTab() !== 'calendar'"
                  [class.dark:border-zinc-700]="selectedTab() !== 'calendar'">
            📅 Seasonal Harvest HUD
          </button>

          <button (click)="selectedTab.set('scanner')"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                  [class.bg-emerald-500]="selectedTab() === 'scanner'"
                  [class.text-white]="selectedTab() === 'scanner'"
                  [class.border-emerald-500]="selectedTab() === 'scanner'"
                  [class.bg-gray-50]="selectedTab() !== 'scanner'"
                  [class.dark:bg-zinc-800]="selectedTab() !== 'scanner'"
                  [class.text-gray-700]="selectedTab() !== 'scanner'"
                  [class.dark:text-zinc-300]="selectedTab() !== 'scanner'"
                  [class.border-gray-200]="selectedTab() !== 'scanner'"
                  [class.dark:border-zinc-700]="selectedTab() !== 'scanner'">
            🔍 Offline Label Guard
          </button>

          <button (click)="selectedTab.set('inflation')"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                  [class.bg-emerald-500]="selectedTab() === 'inflation'"
                  [class.text-white]="selectedTab() === 'inflation'"
                  [class.border-emerald-500]="selectedTab() === 'inflation'"
                  [class.bg-gray-50]="selectedTab() !== 'inflation'"
                  [class.dark:bg-zinc-800]="selectedTab() !== 'inflation'"
                  [class.text-gray-700]="selectedTab() !== 'inflation'"
                  [class.dark:text-zinc-300]="selectedTab() !== 'inflation'"
                  [class.border-gray-200]="selectedTab() !== 'inflation'"
                  [class.dark:border-zinc-700]="selectedTab() !== 'inflation'">
            📉 Inflation &amp; Stockouts
          </button>

          <button (click)="selectedTab.set('faith')"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                  [class.bg-emerald-500]="selectedTab() === 'faith'"
                  [class.text-white]="selectedTab() === 'faith'"
                  [class.border-emerald-500]="selectedTab() === 'faith'"
                  [class.bg-gray-50]="selectedTab() !== 'faith'"
                  [class.dark:bg-zinc-800]="selectedTab() !== 'faith'"
                  [class.text-gray-700]="selectedTab() !== 'faith'"
                  [class.dark:text-zinc-300]="selectedTab() !== 'faith'"
                  [class.border-gray-200]="selectedTab() !== 'faith'"
                  [class.dark:border-zinc-700]="selectedTab() !== 'faith'">
            🕯️ Faith &amp; Bioethics
          </button>

          <button (click)="selectedTab.set('tcm')"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                  [class.bg-emerald-500]="selectedTab() === 'tcm'"
                  [class.text-white]="selectedTab() === 'tcm'"
                  [class.border-emerald-500]="selectedTab() === 'tcm'"
                  [class.bg-gray-50]="selectedTab() !== 'tcm'"
                  [class.dark:bg-zinc-800]="selectedTab() !== 'tcm'"
                  [class.text-gray-700]="selectedTab() !== 'tcm'"
                  [class.dark:text-zinc-300]="selectedTab() !== 'tcm'"
                  [class.border-gray-200]="selectedTab() !== 'tcm'"
                  [class.dark:border-zinc-700]="selectedTab() !== 'tcm'">
            🌿 TCM &amp; Ayurveda
          </button>

          <button (click)="selectedTab.set('commons')"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                  [class.bg-emerald-500]="selectedTab() === 'commons'"
                  [class.text-white]="selectedTab() === 'commons'"
                  [class.border-emerald-500]="selectedTab() === 'commons'"
                  [class.bg-gray-50]="selectedTab() !== 'commons'"
                  [class.dark:bg-zinc-800]="selectedTab() !== 'commons'"
                  [class.text-gray-700]="selectedTab() !== 'commons'"
                  [class.dark:text-zinc-300]="selectedTab() !== 'commons'"
                  [class.border-gray-200]="selectedTab() !== 'commons'"
                  [class.dark:border-zinc-700]="selectedTab() !== 'commons'">
            🏛️ Ostrom Commons &amp; Guild
          </button>

          <button (click)="selectedTab.set('federation')"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                  [class.bg-emerald-500]="selectedTab() === 'federation'"
                  [class.text-white]="selectedTab() === 'federation'"
                  [class.border-emerald-500]="selectedTab() === 'federation'"
                  [class.bg-gray-50]="selectedTab() !== 'federation'"
                  [class.dark:bg-zinc-800]="selectedTab() !== 'federation'"
                  [class.text-gray-700]="selectedTab() !== 'federation'"
                  [class.dark:text-zinc-300]="selectedTab() !== 'federation'"
                  [class.border-gray-200]="selectedTab() !== 'federation'"
                  [class.dark:border-zinc-700]="selectedTab() !== 'federation'">
            🌐 Trusted Federation Mesh
          </button>
        </div>
      </div>

      <!-- Active Patient Conditions & Micro-Climate Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-gray-50 dark:bg-zinc-900/60 rounded-lg p-3.5 border border-gray-100 dark:border-zinc-800">
          <div class="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Target Condition Profile</div>
          <div class="text-sm font-semibold text-gray-900 dark:text-zinc-100 mt-1 truncate">
            {{ activePatientConditionSummary() }}
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-zinc-900/60 rounded-lg p-3.5 border border-gray-100 dark:border-zinc-800">
          <div class="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Recommended AQI Threshold</div>
          <div class="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            AQI &lt; 35 (Good / Pure Air)
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-zinc-900/60 rounded-lg p-3.5 border border-gray-100 dark:border-zinc-800">
          <div class="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Climate Preference</div>
          <div class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
            {{ recommendedClimateType() }}
          </div>
        </div>
      </div>

      <!-- Main Body: Destinations View -->
      @if (selectedTab() === 'destinations') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          @for (dest of matchedDestinations(); track dest.id) {
            <div class="bg-white dark:bg-[#0c0c0e] rounded-xl border border-gray-200 dark:border-zinc-800/90 hover:border-emerald-500/40 transition-all p-5 flex flex-col justify-between shadow-sm relative group overflow-hidden">
              
              <!-- Match Badge Top Right -->
              <div class="absolute top-4 right-4 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
                {{ dest.matchScore }}% Health Match
              </div>

              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xl">📍</span>
                  <div>
                    <h3 class="text-base font-bold text-gray-900 dark:text-zinc-100 leading-tight">
                      {{ dest.cityName }}
                    </h3>
                    <div class="text-xs font-medium text-gray-500 dark:text-zinc-400">
                      {{ dest.stateCountry }} • {{ dest.climateZone }}
                    </div>
                  </div>
                </div>

                <p class="text-xs text-gray-600 dark:text-zinc-300 mt-3.5 leading-relaxed bg-gray-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-gray-100 dark:border-zinc-800/50">
                  <span class="font-semibold text-emerald-600 dark:text-emerald-400">Clinical Rationale:</span> {{ dest.whyIdealForPatient }}
                </p>

                <!-- Census & SDOH Metrics Grid -->
                <div class="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div class="bg-gray-50 dark:bg-zinc-900/80 p-2 rounded border border-gray-100 dark:border-zinc-800">
                    <span class="text-gray-400">EPA Air Quality (AQI):</span>
                    <div class="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{{ dest.aqiScore }} (Pure)</div>
                  </div>

                  <div class="bg-gray-50 dark:bg-zinc-900/80 p-2 rounded border border-gray-100 dark:border-zinc-800">
                    <span class="text-gray-400">Walkability Score:</span>
                    <div class="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{{ dest.walkScore }} / 100</div>
                  </div>

                  <div class="bg-gray-50 dark:bg-zinc-900/80 p-2 rounded border border-gray-100 dark:border-zinc-800">
                    <span class="text-gray-400">Annual Sunshine:</span>
                    <div class="font-bold text-amber-600 dark:text-amber-400 mt-0.5">{{ dest.sunshineDays }} Days/Yr</div>
                  </div>

                  <div class="bg-gray-50 dark:bg-zinc-900/80 p-2 rounded border border-gray-100 dark:border-zinc-800">
                    <span class="text-gray-400">Blue Zone Longevity:</span>
                    <div class="font-bold text-teal-600 dark:text-teal-400 mt-0.5">{{ dest.censusSdohData.blueZoneIndex }} / 100</div>
                  </div>
                </div>

                <!-- Key Benefits list -->
                <div class="mt-4 space-y-1.5">
                  <div class="text-[11px] font-bold uppercase tracking-wider text-gray-400">Key Environmental Benefits</div>
                  @for (benefit of dest.keyBenefits; track benefit) {
                    <div class="flex items-center gap-1.5 text-xs text-gray-700 dark:text-zinc-300">
                      <span class="text-emerald-500 font-bold">✓</span> {{ benefit }}
                    </div>
                  }
                </div>
              </div>

              <div class="mt-5 pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span class="text-[11px] text-gray-400">Healthcare Access: {{ dest.censusSdohData.healthcareAccessScore }}/100</span>
                <pocket-gull-button 
                  variant="secondary" 
                  size="xs"
                  (click)="prescribeRelocation(dest)">
                  Prescribe Location
                </pocket-gull-button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Main Body: Therapeutic Hobbies View -->
      @if (selectedTab() === 'hobbies') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (dest of matchedDestinations(); track dest.id) {
            @for (hobby of dest.recommendedHobbies; track hobby.title) {
              <div class="bg-white dark:bg-[#0c0c0e] rounded-xl border border-gray-200 dark:border-zinc-800 p-4 flex gap-4 hover:border-emerald-500/40 transition-all shadow-sm">
                <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shrink-0">
                  {{ hobby.icon }}
                </div>
                <div class="space-y-1 flex-1">
                  <div class="flex items-center justify-between">
                    <h4 class="text-sm font-bold text-gray-900 dark:text-zinc-100">{{ hobby.title }}</h4>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 uppercase tracking-wider">
                      {{ hobby.category }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                    {{ hobby.description }}
                  </p>
                  <div class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                    📍 Recommended in {{ dest.cityName }}, {{ dest.stateCountry }}
                  </div>
                </div>
              </div>
            }
          }
        </div>
      }

      <!-- Main Body: Local Foodsheds & Stores View -->
      @if (selectedTab() === 'stores') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          @for (dest of matchedDestinations(); track dest.id) {
            <div class="bg-white dark:bg-[#0c0c0e] rounded-xl border border-gray-200 dark:border-zinc-800 p-5 space-y-4 shadow-sm hover:border-emerald-500/40 transition-all">
              <div class="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 pb-3">
                <div>
                  <h4 class="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <span>🛒</span> {{ dest.cityName }}, {{ dest.stateCountry }}
                  </h4>
                  <div class="text-[11px] text-gray-500 dark:text-zinc-400">
                    Foodshed Micro-Climate: {{ dest.climateZone }}
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {{ dest.localFoodShedAndStores.microbiomeDiversityPotentialPct }}% Microbiome Div
                  </span>
                </div>
              </div>

              <!-- Co-ops, Organic Markets & Fermentaries -->
              <div class="space-y-1.5">
                <div class="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span>🏪</span> Local Co-ops & Grocery Outlets
                </div>
                <div class="flex flex-wrap gap-1.5">
                  @for (market of dest.localFoodShedAndStores.coopsAndMarkets; track market) {
                    <span class="text-xs px-2.5 py-1 rounded-md bg-gray-100 dark:bg-zinc-800/80 text-gray-800 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700/60 font-medium">
                      {{ market }}
                    </span>
                  }
                </div>
              </div>

              <!-- Specialty & Heritage Foods In Stock -->
              <div class="space-y-1.5">
                <div class="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <span>🫐</span> Specialty & Heritage Foods Available In-Store
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  @for (food of dest.localFoodShedAndStores.specialtyHeritageFoods; track food) {
                    <div class="flex items-center gap-1.5 text-xs text-gray-700 dark:text-zinc-300">
                      <span class="text-indigo-500 font-bold">•</span> {{ food }}
                    </div>
                  }
                </div>
              </div>

              <!-- Clinical Nutritional Rationale for Active Patient -->
              <div class="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 text-xs text-gray-700 dark:text-zinc-300">
                <div class="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-0.5 flex items-center gap-1">
                  <span>💡</span> Clinical Foodshed Rationale for {{ activePatientName() }}
                </div>
                {{ dest.localFoodShedAndStores.clinicalRationaleForPatient }}
              </div>

              <!-- Nearest Farm Stand / CSA -->
              <div class="pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span class="text-gray-500 dark:text-zinc-400 flex items-center gap-1 truncate">
                  <span>🚜</span> <strong class="text-gray-700 dark:text-zinc-300">Nearest Stand:</strong> {{ dest.localFoodShedAndStores.nearestCsaOrFarmStand }}
                </span>
                <div class="flex items-center gap-2 shrink-0">
                  <pocket-gull-button 
                    variant="secondary" 
                    size="xs"
                    (click)="issueProduceRx(dest)">
                    🍎 Generate Produce Rx
                  </pocket-gull-button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Main Body: Seasonal Harvest HUD View -->
      @if (selectedTab() === 'calendar') {
        <div class="space-y-4">
          <div class="bg-gray-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                <span>📅</span> Live Seasonal Harvest & Stocking Schedule (Month: {{ activeSeasonalCalendar().currentMonthName }})
              </h3>
              <p class="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                {{ activeSeasonalCalendar().seasonalAdvice }}
              </p>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="text-xs text-gray-500">Foodshed:</span>
              <select [value]="selectedCalendarCityId()" 
                      (change)="onCityCalendarChange($event)"
                      class="text-xs rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-2 py-1 text-gray-800 dark:text-zinc-200">
                <option value="dest_ojai">Ojai Valley, CA</option>
                <option value="dest_slo">San Luis Obispo, CA</option>
                <option value="dest_sequim">Sequim & Olympic Pen, WA</option>
                <option value="dest_lewiston">Lewiston & Androscoggin, ME</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            @for (crop of activeSeasonalCalendar().harvestItems; track crop.id) {
              <div class="bg-white dark:bg-[#0c0c0e] rounded-xl border p-4 space-y-2.5 transition-all shadow-sm"
                   [class.border-emerald-500/60]="crop.isCurrentlyInPeak"
                   [class.border-gray-200]="!crop.isCurrentlyInPeak"
                   [class.dark:border-zinc-800]="!crop.isCurrentlyInPeak">
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-bold text-gray-900 dark:text-zinc-100">{{ crop.name }}</h4>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                        [class.bg-emerald-500/10]="crop.isCurrentlyInPeak"
                        [class.text-emerald-600]="crop.isCurrentlyInPeak"
                        [class.dark:text-emerald-400]="crop.isCurrentlyInPeak"
                        [class.border]="crop.isCurrentlyInPeak"
                        [class.border-emerald-500/20]="crop.isCurrentlyInPeak"
                        [class.bg-gray-100]="!crop.isCurrentlyInPeak"
                        [class.dark:bg-zinc-800]="!crop.isCurrentlyInPeak"
                        [class.text-gray-500]="!crop.isCurrentlyInPeak">
                    {{ crop.isCurrentlyInPeak ? '🔥 Peak Harvest' : 'Off-Peak / Cellar' }}
                  </span>
                </div>

                <div class="text-[11px] font-mono text-gray-400 italic">
                  {{ crop.scientificName }}
                </div>

                <div class="text-xs text-gray-600 dark:text-zinc-300">
                  <strong class="text-emerald-600 dark:text-emerald-400">Phytonutrient:</strong> {{ crop.phytonutrientHighlight }}
                </div>

                <div class="p-2 rounded bg-gray-50 dark:bg-zinc-900 text-xs text-gray-700 dark:text-zinc-300">
                  <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Clinical Target Benefit</div>
                  {{ crop.clinicalTargetBenefit }}
                </div>

                <div class="text-[11px] text-gray-500 dark:text-zinc-400 flex items-center justify-between pt-1 border-t border-gray-100 dark:border-zinc-800/80">
                  <span>Price: <strong class="text-gray-700 dark:text-zinc-300">{{ crop.estimatedRetailPriceIndex }}</strong></span>
                  <span class="truncate max-w-[150px]">🥣 {{ crop.culinarySynergy }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Main Body: Offline Label Guard Scanner View -->
      @if (selectedTab() === 'scanner') {
        <div class="space-y-4">
          <div class="bg-gray-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                <span>🔍</span> Offline Zero-Egress Food Label & Allergen Scanner
              </h3>
              <p class="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Evaluates store shelf product ingredients against ISMP standards, ultra-processed emulsifiers, and {{ activePatientName() }}'s documented sensitivities without sending any data to the cloud.
              </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button (click)="loadSampleLabel('emulsified')" 
                      class="text-xs px-2.5 py-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-medium">
                Load Ultra-Processed Sample
              </button>
              <button (click)="loadSampleLabel('clean')" 
                      class="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                Load Clean Co-op Sample
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Text Input Area -->
            <div class="space-y-2">
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                Ingredients Label Text (From Camera OCR / Barcode)
              </label>
              <textarea [value]="ingredientScannerInput()"
                        (input)="onIngredientInput($event)"
                        rows="5"
                        placeholder="Paste or OCR ingredient list here..."
                        class="w-full text-xs rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-3 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"></textarea>
            </div>

            <!-- Scan Result Display -->
            @if (activeScanResult(); as res) {
              <div class="rounded-xl border p-4 space-y-3"
                   [class.bg-emerald-500/5]="res.isSafeForPatient"
                   [class.border-emerald-500/30]="res.isSafeForPatient"
                   [class.bg-rose-500/5]="!res.isSafeForPatient"
                   [class.border-rose-500/30]="!res.isSafeForPatient">
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-bold flex items-center gap-1.5"
                      [class.text-emerald-600]="res.isSafeForPatient"
                      [class.dark:text-emerald-400]="res.isSafeForPatient"
                      [class.text-rose-600]="!res.isSafeForPatient"
                      [class.dark:text-rose-400]="!res.isSafeForPatient">
                    <span>{{ res.isSafeForPatient ? '✅ Patient-Safe Whole Food' : '⚠️ Flagged Additives / Allergens' }}</span>
                  </h4>
                  <span class="text-[10px] font-mono text-gray-400">{{ res.offlineIntegrityHash }}</span>
                </div>

                @if (res.flaggedHarmfulAdditives.length > 0) {
                  <div class="space-y-1">
                    <div class="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">Ultra-Processed Emulsifiers & Dyes Flagged:</div>
                    @for (add of res.flaggedHarmfulAdditives; track add.name) {
                      <div class="text-xs text-rose-700 dark:text-rose-300 bg-rose-500/10 p-1.5 rounded">
                        <strong>{{ add.name }}</strong> ({{ add.category }}): {{ add.healthImpact }}
                      </div>
                    }
                  </div>
                }

                @if (res.beneficialPhytonutrients.length > 0) {
                  <div class="space-y-1">
                    <div class="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Beneficial Phytonutrients Detected:</div>
                    @for (nut of res.beneficialPhytonutrients; track nut) {
                      <div class="text-xs text-emerald-700 dark:text-emerald-300">
                        • {{ nut }}
                      </div>
                    }
                  </div>
                }

                <div class="text-[11px] text-gray-500 dark:text-zinc-400 pt-2 border-t border-gray-200/50 dark:border-zinc-800">
                  ISMP Directive: {{ res.ismpSafetyDirectives[0] || 'Label verified safe for consumption.' }}
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Main Body: Inflation & Stockout Frugal Resilience View -->
      @if (selectedTab() === 'inflation') {
        <div class="space-y-4">
          <div class="bg-gray-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                <span>📉</span> Food Inflation &amp; Dietary Restriction Stockout Guard
              </h3>
              <p class="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                {{ inflationAudit().clinicalFrugalityVerdict }}
              </p>
            </div>
            
            <div class="flex items-center gap-3 shrink-0">
              <div class="flex items-center gap-1.5">
                <span class="text-xs text-gray-500 dark:text-zinc-400">Dietary Boundary:</span>
                <select [value]="selectedDietaryFilter()"
                        (change)="onDietaryFilterChange($event)"
                        class="text-xs rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-2.5 py-1 text-gray-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono">
                  <option value="ALL">All Whole-Food Staples</option>
                  <option value="GLUTEN_FREE">🌾 Gluten-Free (Celiac / Non-Celiac)</option>
                  <option value="DAIRY_FREE">🥛 Dairy-Free / Lactose-Free</option>
                  <option value="VEGAN_PLANT_BASED">🌱 100% Vegan &amp; Plant-Based</option>
                  <option value="LOW_FODMAP">🫛 Low-FODMAP (IBS Gut Friendly)</option>
                  <option value="NUT_FREE">🥜 100% Tree Nut &amp; Peanut-Free</option>
                  <option value="HISTAMINE_CONSCIOUS">🌿 Histamine-Conscious</option>
                  <option value="CARDIOMETABOLIC_LOW_SODIUM">❤️ Cardiometabolic Low-Sodium</option>
                </select>
              </div>

              <div class="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-right">
                <div class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold">Monthly Savings</div>
                <div class="text-base font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                  \${{ inflationAudit().totalMonthlyProjectedSavingsUsd }}/mo ({{ inflationAudit().averageSavingsPct }}%)
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (item of inflationAudit().substitutions; track item.expensiveOrStockedOutItem) {
              <div class="bg-white dark:bg-[#0c0c0e] rounded-xl border border-gray-200 dark:border-zinc-800 p-4 space-y-3 shadow-sm hover:border-emerald-500/40 transition-all">
                <div class="flex items-start justify-between gap-2 border-b border-gray-100 dark:border-zinc-800/80 pb-2.5">
                  <div>
                    <div class="flex items-center gap-1.5">
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 uppercase tracking-wider">
                        {{ item.category }}
                      </span>
                      @for (allergen of item.allergenFreeFrom.slice(0, 3); track allergen) {
                        <span class="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          ✓ {{ allergen }}-Free
                        </span>
                      }
                    </div>
                    <div class="text-xs text-rose-500 dark:text-rose-400 font-medium line-through mt-1">
                      {{ item.expensiveOrStockedOutItem }} (\${{ item.costPerServingOriginal.toFixed(2) }}/serving)
                    </div>
                  </div>
                  <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Save {{ item.estimatedSavingsPct }}%
                  </span>
                </div>

                <div class="space-y-1">
                  <div class="text-xs font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <span class="text-emerald-500">✨</span>
                    <span>{{ item.recommendedFrugalAlternative }}</span>
                    <span class="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      (\${{ item.costPerServingAlternative.toFixed(2) }}/serving)
                    </span>
                  </div>
                  <p class="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                    <strong class="text-gray-700 dark:text-zinc-300">Nutritional Parity:</strong> {{ item.phytonutrientEquivalence }}
                  </p>
                </div>

                @if (item.dietaryPrecautionNote) {
                  <div class="text-[11px] p-2 rounded bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 text-amber-800 dark:text-amber-300">
                    <strong>Dietary Guidance:</strong> {{ item.dietaryPrecautionNote }}
                  </div>
                }

                <div class="p-2 rounded bg-gray-50 dark:bg-zinc-900/60 text-xs text-gray-700 dark:text-zinc-300 space-y-1">
                  <div><strong class="text-emerald-600 dark:text-emerald-400">Culinary Prep:</strong> {{ item.culinaryPreparationTip }}</div>
                  <div class="text-[11px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100 dark:border-zinc-800/60">
                    <span>🛡️ <strong>Stockout Strategy:</strong> {{ item.stockoutResilienceStrategy }}</span>
                    <span>⏳ {{ item.shelfLifeAndPantryResilience }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 7: FAITH TRADITION, SOMATIC CONDUCT & BIOETHICS -->
      @if (selectedTab() === 'faith') {
        <app-faith-tradition-conduct-card></app-faith-tradition-conduct-card>
      }

      <!-- TAB 8: TRADITIONAL CHINESE MEDICINE & AYURVEDA INTEGRATIVE -->
      @if (selectedTab() === 'tcm') {
        <app-tcm-ayurvedic-card></app-tcm-ayurvedic-card>
      }

      <!-- TAB 9: OSTROM COMMONS GOVERNANCE & GUILD DEFENSE -->
      @if (selectedTab() === 'commons') {
        <app-sovereign-guild-commons-card></app-sovereign-guild-commons-card>
      }

      <!-- TAB 10: PEER-TO-PEER TRUSTED COMMONS FEDERATION MESH -->
      @if (selectedTab() === 'federation') {
        <app-trusted-commons-federation-card></app-trusted-commons-federation-card>
      }

      @if (activeProduceRxVoucher(); as voucher) {
        <div class="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-2.5">
            <div class="flex items-center gap-2">
              <span class="text-xl">🥗</span>
              <div>
                <h4 class="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>HL7 FHIR R4 Produce Rx Voucher</span>
                  <span class="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                    {{ voucher.voucherNumber }}
                  </span>
                </h4>
                <div class="text-[11px] text-gray-500 dark:text-zinc-400">
                  Patient: <strong class="text-gray-700 dark:text-zinc-200">{{ voucher.patientName }}</strong> • Valid Through: {{ voucher.validThroughDate }}
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                \${{ voucher.monthlyAllotmentUsd }}/mo
              </div>
              <div class="text-[10px] text-gray-400">GusNIP / Medicaid 1115</div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="bg-white/60 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-emerald-500/20 space-y-1">
              <div class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Approved Markets & Co-ops</div>
              <div class="text-gray-700 dark:text-zinc-300 font-medium">
                {{ voucher.approvedCoopsAndMarkets.join(', ') }}
              </div>
            </div>

            <div class="bg-white/60 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-emerald-500/20 space-y-1">
              <div class="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Authorized Clinical Order</div>
              <div class="text-gray-700 dark:text-zinc-300 font-mono text-[11px] truncate">
                FHIR ServiceRequest: {{ voucher.fhirServiceRequestJson['id'] }}
              </div>
              <div class="text-[10px] text-gray-400 truncate">
                Digital Seal: {{ voucher.sha256Attestation }}
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs pt-1">
            <span class="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
              ✓ Ready for instant retail scan or export to patient health portal
            </span>
            <button (click)="activeProduceRxVoucher.set(null)" class="text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300 underline">
              Close Voucher
            </button>
          </div>
        </div>
      }

      @if (prescribedNotice()) {
        <div class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs p-3 rounded-lg flex items-center justify-between">
          <span>✨ {{ prescribedNotice() }}</span>
          <button (click)="prescribedNotice.set('')" class="font-bold underline text-xs">Dismiss</button>
        </div>
      }
    </div>
  `
})
export class GeolocationalHealthRelocationComponent {
  private patientState = inject(PatientStateService);
  private patientManagement = inject(PatientManagementService);
  private produceRxService = inject(ProduceRxNutritionReferralService);
  private seasonalService = inject(SeasonalHarvestStockingCalendarService);
  private offlineCompanionService = inject(OfflinePwaFoodshedCompanionService);
  private foodInflationService = inject(FoodInflationStockoutResilienceService);

  readonly selectedTab = signal<'destinations' | 'hobbies' | 'stores' | 'calendar' | 'scanner' | 'inflation' | 'faith' | 'tcm' | 'commons' | 'federation'>('destinations');
  readonly prescribedNotice = signal<string>('');
  readonly activeProduceRxVoucher = signal<IFhirProduceRxReferral | null>(null);

  // Inflation & Stockout Frugal Resilience State
  readonly selectedDietaryFilter = signal<DietaryRestrictionType>('ALL');
  readonly inflationAudit = computed<IInflationStockoutResilienceAudit>(() => {
    return this.foodInflationService.auditBasketForInflation(undefined, this.selectedDietaryFilter());
  });

  // Seasonal Calendar State
  readonly selectedCalendarCityId = signal<string>('dest_ojai');
  readonly activeSeasonalCalendar = computed<IRegionalSeasonalCalendar>(() => {
    return this.seasonalService.getSeasonalCalendar(this.selectedCalendarCityId());
  });

  // Offline Label Scanner State
  readonly ingredientScannerInput = signal<string>('Ingredients: Organic Wild Blueberries, Extra Virgin Olive Oil, Chicory Root Inulin');
  readonly activeScanResult = computed(() => {
    const text = this.ingredientScannerInput();
    const patientAllergies = this.activePatient()?.allergies || [];
    return this.offlineCompanionService.scanIngredientText(text, patientAllergies);
  });

  readonly activePatient = computed(() => this.patientManagement.selectedPatient());
  readonly activePatientName = computed(() => this.activePatient()?.name || 'Active Patient');

  readonly activePatientConditionSummary = computed(() => {
    const p = this.activePatient();
    if (!p) return 'General Metabolic & Cardiovascular Health';
    const conditions = p.preexistingConditions || [];
    return conditions.slice(0, 2).join(' + ') || 'Preventive Wellness';
  });

  readonly recommendedClimateType = computed(() => {
    const name = this.activePatientName().toLowerCase();
    if (name.includes('global') || name.includes('pediatric')) return 'Coastal Maritime (Low AQI, Mild Temperature)';
    if (name.includes('frida') || name.includes('sarah')) return 'Dry Thermal Heat & Constant Warmth (Neuropathic Relief)';
    if (name.includes('mara') || name.includes('darwin')) return 'High Sunshine & Phytoncide Forest Sanctuary';
    return 'Blue Zone Mild Mediterranean Climate';
  });

  readonly matchedDestinations = computed<IGeolocationalDestination[]>(() => {
    const p = this.activePatient();
    const name = (p?.name || '').toLowerCase();

    // Customized geolocation destinations based on active patient profile
    if (name.includes('frida') || name.includes('sarah') || name.includes('kahlo')) {
      return [
        {
          id: 'dest_dhs',
          cityName: 'Desert Hot Springs',
          stateCountry: 'California, USA',
          climateZone: 'Arid Subtropical Thermal',
          matchScore: 97,
          aqiScore: 22,
          walkScore: 68,
          sunshineDays: 316,
          greenSpaceIndex: 54,
          whyIdealForPatient: 'Constant year-round warm temperatures (75°F-85°F) with natural geothermal mineral springs directly relieve severe neuropathic spinal trauma and joint stiffness.',
          keyBenefits: [
            'Zero cold/humidity atmospheric pressure drops',
            'Natural geothermal mineral springs (Lithium & Silicarich)',
            'Ultra-low airborne allergens'
          ],
          recommendedHobbies: [
            {
              title: 'Geothermal Mineral Hydrotherapy',
              category: 'Hydrotherapy',
              description: 'Daily 20-minute gentle soaking in natural lithium-silica mineral waters to relax central nociceptors.',
              icon: '♨️'
            },
            {
              title: 'Warm Desert Sunrise Breathwork',
              category: 'Movement',
              description: 'Gentle diaphragmatic breathing outdoors during dry, calm desert mornings.',
              icon: '🌅'
            }
          ],
          censusSdohData: {
            medianAge: 41.2,
            healthcareAccessScore: 88,
            povertyRatePct: 14.2,
            blueZoneIndex: 82
          },
          localFoodShedAndStores: {
            coopsAndMarkets: ['Desert Hot Springs Health Food Store', 'Palm Springs Certified Farmers Market', 'Clark’s Nutrition & Natural Foods Market'],
            specialtyHeritageFoods: ['Medjool Dates (Coachella Valley Heritage)', 'Prickly Pear Nopal Cactus Pads', 'Local Citrus & Pomegranate Juice', 'Desert Wildflower Mesquite Honey'],
            microbiomeDiversityPotentialPct: 91,
            nearestCsaOrFarmStand: 'Sam Cobb Date Farm & Organic Groves (3.8 mi)',
            clinicalRationaleForPatient: 'Nopal pectin and low-glycemic Medjool fiber stabilize blood glucose, while anti-inflammatory desert botanicals reduce systemic nerve inflammation and spinal nociceptive hypersensitivity.'
          }
        },
        {
          id: 'dest_ojai',
          cityName: 'Ojai Valley',
          stateCountry: 'California, USA',
          climateZone: 'Mediterranean Thermal Valley',
          matchScore: 94,
          aqiScore: 18,
          walkScore: 78,
          sunshineDays: 290,
          greenSpaceIndex: 88,
          whyIdealForPatient: 'Enclosed valley micro-climate provides stable barometric pressure, citrus grove air purity, and a serene acoustic environment for central pain modulation.',
          keyBenefits: [
            'East-West valley alignment reduces wind volatility',
            'Abundant organic citrus & olive groves',
            'High community wellness cohesion'
          ],
          recommendedHobbies: [
            {
              title: 'Organic Citrus & Lavender Permaculture',
              category: 'Nature Therapy',
              description: 'Light gardening in raised beds to encourage sensory connection and mild limb mobilization.',
              icon: '🍊'
            }
          ],
          censusSdohData: {
            medianAge: 47.8,
            healthcareAccessScore: 94,
            povertyRatePct: 8.1,
            blueZoneIndex: 91
          },
          localFoodShedAndStores: {
            coopsAndMarkets: ['Rainbow Bridge Natural Food Co-op', 'Ojai Certified Community Farmers Market (Sundays)', 'Farmer & The Cook Organic Grocer & Kitchen'],
            specialtyHeritageFoods: ['Ojai Pixie Tangerines', 'Cold-Pressed California Mission Olive Oil', 'Culinary Lavender & Raw Sage Honey', 'Heirloom Ojai Avocados'],
            microbiomeDiversityPotentialPct: 96,
            nearestCsaOrFarmStand: 'Earthtrine Farm & Biodynamic Farm Stand (0.8 mi)',
            clinicalRationaleForPatient: 'High polyphenol oleocanthal from fresh-pressed olive oil acts as a natural COX inhibitor; citrus flavonoids downregulate inflammatory cytokines and promote collagen synthesis.'
          }
        }
      ];
    }

    if (name.includes('global') || name.includes('pediatric') || name.includes('sentinel')) {
      return [
        {
          id: 'dest_slo',
          cityName: 'San Luis Obispo',
          stateCountry: 'California, USA',
          climateZone: 'Maritime Mediterranean',
          matchScore: 98,
          aqiScore: 14,
          walkScore: 92,
          sunshineDays: 286,
          greenSpaceIndex: 82,
          whyIdealForPatient: 'Consistently ranks #1 in US clean air and walkability. Marine airflow eliminates ozone spikes, protecting COPD and pediatric bronchial airways.',
          keyBenefits: [
            'Ranked top clean air region by American Lung Assoc.',
            'High pedestrian walkability and farm-to-table access',
            'Proximity to Stanford & UCLA regional medical centers'
          ],
          recommendedHobbies: [
            {
              title: 'Coastal Saline Airway Walking',
              category: 'Movement',
              description: 'Daily coastal strolls along Avila Beach to inhale natural saline aerosols for airway clearance.',
              icon: '🌊'
            },
            {
              title: 'Community Farmers Market Sourcing',
              category: 'Social Cohesion',
              description: 'Weekly social visits to organic local markets for fresh antioxidant-rich produce.',
              icon: '🥗'
            }
          ],
          censusSdohData: {
            medianAge: 39.5,
            healthcareAccessScore: 96,
            povertyRatePct: 9.4,
            blueZoneIndex: 95
          },
          localFoodShedAndStores: {
            coopsAndMarkets: ['SLO Natural Foods Co-op', 'Thursday Night Higuera Street Farmers Market', 'California Fresh Market'],
            specialtyHeritageFoods: ['Central Coast Artichokes', 'Santa Maria Pinquito Beans', 'Purple Sprouting Cauliflower', 'Avila Marine Wakame Seaweed'],
            microbiomeDiversityPotentialPct: 97,
            nearestCsaOrFarmStand: 'City Farm SLO & Organic Educational Center (1.2 mi)',
            clinicalRationaleForPatient: 'Artichoke inulin and Pinquito bean prebiotic oligosaccharides supercharge short-chain fatty acid (butyrate) synthesis to suppress bronchial hyper-reactivity.'
          }
        },
        {
          id: 'dest_sequim',
          cityName: 'Sequim & Olympic Peninsula',
          stateCountry: 'Washington, USA',
          climateZone: 'Temperate Rain-Shadow Sanctuary',
          matchScore: 92,
          aqiScore: 11,
          walkScore: 72,
          sunshineDays: 228,
          greenSpaceIndex: 96,
          whyIdealForPatient: 'Situated in the Olympic mountain rain-shadow with 1/3 the rainfall of Seattle. Dense evergreen forest terpene phytoncides boost natural killer cell immunity.',
          keyBenefits: [
            'Evergreen phytoncides boost NK immune defense',
            'Pristine air quality shielded by Olympic mountains',
            'Tranquil acoustic nature canopy'
          ],
          recommendedHobbies: [
            {
              title: 'Rainforest Shinrin-Yoku (Forest Bathing)',
              category: 'Nature Therapy',
              description: 'Guided slow walks through mossy cedar forests to absorb aerosolized tree terpenes.',
              icon: '🌲'
            }
          ],
          censusSdohData: {
            medianAge: 52.1,
            healthcareAccessScore: 90,
            povertyRatePct: 7.8,
            blueZoneIndex: 89
          },
          localFoodShedAndStores: {
            coopsAndMarkets: ['Port Angeles Community Food Co-op', 'Sequim Open-Air Farmers Market (Saturdays)', 'Sunny Farms Country Center'],
            specialtyHeritageFoods: ['Dungeness Wild Crab', 'Olympic Morel & Chanterelle Mushrooms', 'Wild Pacific Northwest Huckleberries', 'Dungeness Valley Raw Dairy & Goat Cheese'],
            microbiomeDiversityPotentialPct: 95,
            nearestCsaOrFarmStand: 'Nash’s Organic Produce Farm Stand & Grain Mill (2.4 mi)',
            clinicalRationaleForPatient: 'Beta-glucan-rich Olympic fungi and anthocyanin-dense huckleberries modulate immune mucosal tolerance while omega-3s from local Dungeness crab support neurocognitive recovery.'
          }
        }
      ];
    }

    // Default Blue Zone Longevity destinations for Alexander Vance, Linus Pauling, Darwin, etc.
    return [
      {
        id: 'dest_loma_linda',
        cityName: 'Loma Linda',
        stateCountry: 'California, USA',
        climateZone: 'Inland Subtropical Longevity Zone',
        matchScore: 96,
        aqiScore: 28,
        walkScore: 84,
        sunshineDays: 280,
        greenSpaceIndex: 78,
        whyIdealForPatient: 'Official North American Blue Zone. Certified community culture centered around plant-rich nutrition, active walking, and high social connectivity.',
        keyBenefits: [
          'Average life expectancy 7-10 years above US baseline',
          'Widespread availability of plant-based culinary dining',
          'Robust preventive healthcare infrastructure'
        ],
        recommendedHobbies: [
          {
            title: 'Blue Zone Community Botanical Gardening',
            category: 'Social Cohesion',
            description: 'Participating in local organic community gardens for light physical activity and social bonding.',
            icon: '🌱'
          },
          {
            title: 'Sunset Intergenerational Walk Club',
            category: 'Movement',
            description: 'Daily evening group walks through community trail loops.',
            icon: '🚶'
          }
        ],
        censusSdohData: {
          medianAge: 38.6,
          healthcareAccessScore: 98,
          povertyRatePct: 6.5,
          blueZoneIndex: 99
        },
        localFoodShedAndStores: {
          coopsAndMarkets: ['Loma Linda Market (World’s 1st Plant-Based Supermarket)', 'Redlands Certified Farmers Market', 'Heritage Natural Foods'],
          specialtyHeritageFoods: ['House-Cultured Soy Tempeh & Tofu', 'Bulk Sprouted Legumes & Ancient Grains', 'California Raw Almonds & Walnuts', 'Coachella Medjool Date Paste'],
          microbiomeDiversityPotentialPct: 98,
          nearestCsaOrFarmStand: 'Heritage Garden Organic CSA & Loma Linda University Farm (0.5 mi)',
          clinicalRationaleForPatient: 'Cardioprotective plant sterols, isoflavones, and high arginine from fresh tree nuts dramatically improve vascular endothelial nitric oxide synthesis and lipid profiles.'
        }
      },
      {
        id: 'dest_nicoya',
        cityName: 'Nicoya Peninsula',
        stateCountry: 'Guanacaste, Costa Rica',
        climateZone: 'Tropical Coastal Dry Forest',
        matchScore: 93,
        aqiScore: 8,
        walkScore: 76,
        sunshineDays: 310,
        greenSpaceIndex: 92,
        whyIdealForPatient: 'Global Blue Zone renowned for high mineral calcium water, strong social family bonds ("Plan de Vida"), and stress-reducing tropical micro-climate.',
        keyBenefits: [
          'High natural calcium & magnesium groundwater',
          'Zero industrial smog or urban noise pollution',
          'Daily sunlight exposure for optimal Vitamin D synthesis'
        ],
        recommendedHobbies: [
          {
            title: 'Sunrise Ocean Kayaking & Swimming',
            category: 'Movement',
            description: 'Low-impact full body aquatic movement in calm Pacific waters.',
            icon: '🛶'
          }
        ],
        censusSdohData: {
          medianAge: 36.4,
          healthcareAccessScore: 84,
          povertyRatePct: 11.0,
          blueZoneIndex: 98
        },
        localFoodShedAndStores: {
          coopsAndMarkets: ['Mercado Municipal de Nicoya', 'Feria del Agricultor Nicoyano (Saturdays)', 'CoopeAgri Organic Outlets'],
          specialtyHeritageFoods: ['Nixtamalized Heirloom Purple Corn Tortillas', 'Guanacaste Gallo Pinto Heirloom Black Beans', 'High-Calcium Mineral Spring Water', 'Wild Papaya, Chayote & Pejibaye (Peach Palm)'],
          microbiomeDiversityPotentialPct: 99,
          nearestCsaOrFarmStand: 'Finca Agroecológica Familiar Nicoya (1.0 mi)',
          clinicalRationaleForPatient: 'Nixtamalization unlocks bioavailable calcium and niacin; combined with resistant starches from black beans, it supports telomere preservation and glycemic stability.'
        }
      },
      {
        id: 'dest_lewiston',
        cityName: 'Lewiston & Auburn (Androscoggin River)',
        stateCountry: 'Maine, USA',
        climateZone: 'Northern Temperate Conifer & River Valley',
        matchScore: 96,
        aqiScore: 12,
        walkScore: 82,
        sunshineDays: 215,
        greenSpaceIndex: 94,
        whyIdealForPatient: 'Situated along the Androscoggin River in southwestern Maine (34 mi NNE of Portland). Rich in pine terpene phytoncides, seasonal riverbank foraging (wild berries, fiddlehead ferns), and cold-climate brown fat metabolic activation.',
        keyBenefits: [
          'High pine & spruce terpene phytoncides boost NK cell immunity',
          'Androscoggin River trail networks for low-impact joint walking',
          'Proximity to Portland medical infrastructure & Bates College research'
        ],
        recommendedHobbies: [
          {
            title: 'Androscoggin Riverbank Foraging & Trail Walking',
            category: 'Nature Therapy',
            description: 'Seasonal foraging for wild elderberry, chaga, and fiddlehead ferns along riverbank trails.',
            icon: '🫐'
          },
          {
            title: 'Cold-Climate Thermal Brown Fat Adaptation',
            category: 'Hydrotherapy',
            description: 'Brisk autumnal morning walks and river mist respiration to trigger metabolic brown fat thermogenesis.',
            icon: '🌲'
          }
        ],
        censusSdohData: {
          medianAge: 39.8,
          healthcareAccessScore: 92,
          povertyRatePct: 12.2,
          blueZoneIndex: 94
        },
        localFoodShedAndStores: {
          coopsAndMarkets: ['St. Mary’s Nutrition Center Community Food Center', 'Lewiston Farmers Market (Bates Mill)', 'New Roots Cooperative Farm Store'],
          specialtyHeritageFoods: ['Maine Wild Lowbush Blueberries', 'Seasonal Riverbank Fiddlehead Ferns (Matteuccia)', 'Wild Birch Chaga Herbal Infusion', 'Somali Bantu Heritage Molokhia & Corn (New Roots Co-op)'],
          microbiomeDiversityPotentialPct: 94,
          nearestCsaOrFarmStand: 'New Roots Cooperative Farm (Somali Bantu CHW Farm, 1.5 mi)',
          clinicalRationaleForPatient: 'Wild lowbush blueberries furnish concentrated pterostilbene and anthocyanins for microvascular neuroprotection; chaga betulinic acid supports innate immune homeostasis.'
        }
      }
    ];
  });

  prescribeRelocation(dest: IGeolocationalDestination) {
    this.prescribedNotice.set(`Successfully prescribed therapeutic micro-climate relocation strategy to ${dest.cityName}, ${dest.stateCountry} into ${this.activePatientName()}'s Care Plan.`);
  }

  issueProduceRx(dest: IGeolocationalDestination) {
    const voucher = this.produceRxService.generateProduceRxReferral({
      destinationCity: `${dest.cityName}, ${dest.stateCountry}`,
      coopsAndMarkets: dest.localFoodShedAndStores.coopsAndMarkets,
      specialtyHeritageFoods: dest.localFoodShedAndStores.specialtyHeritageFoods
    });
    this.activeProduceRxVoucher.set(voucher);
    this.prescribedNotice.set(`Generated official FHIR R4 Produce Rx Voucher (${voucher.voucherNumber}) for $${voucher.monthlyAllotmentUsd}/mo valid at ${dest.cityName} co-ops & farmers markets.`);
  }

  onCityCalendarChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target?.value) {
      this.selectedCalendarCityId.set(target.value);
    }
  }

  onIngredientInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.ingredientScannerInput.set(target?.value || '');
  }

  loadSampleLabel(type: 'emulsified' | 'clean') {
    if (type === 'emulsified') {
      this.ingredientScannerInput.set('Ingredients: Ultra-filtered skim milk, Polysorbate 80, Carboxymethylcellulose, Sucralose, Red 40, Artificial Vanillin, Sodium Nitrite');
    } else {
      this.ingredientScannerInput.set('Ingredients: Organic Wild Blueberries, Cold-Pressed Extra Virgin Olive Oil, Chicory Root Inulin, Organic Rosemary Extract');
    }
  }

  onDietaryFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target?.value) {
      this.selectedDietaryFilter.set(target.value as DietaryRestrictionType);
    }
  }
}
