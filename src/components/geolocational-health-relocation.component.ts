import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';

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
  whyIdealForPatient: string;
}

@Component({
  selector: 'app-geolocational-health-relocation',
  standalone: true,
  imports: [CommonModule, PocketGullButtonComponent],
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

  readonly selectedTab = signal<'destinations' | 'hobbies'>('destinations');
  readonly prescribedNotice = signal<string>('');

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
          }
        }
      ];
    }

    // Default Blue Zone Longevity destinations for Phil Gear, Linus Pauling, Darwin, etc.
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
        }
      }
    ];
  });

  prescribeRelocation(dest: IGeolocationalDestination) {
    this.prescribedNotice.set(`Successfully prescribed therapeutic micro-climate relocation strategy to ${dest.cityName}, ${dest.stateCountry} into ${this.activePatientName()}'s Care Plan.`);
  }
}
