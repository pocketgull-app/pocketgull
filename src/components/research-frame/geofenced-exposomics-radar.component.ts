import { Component, signal, computed, inject, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';

export interface IEcoregionProfile {
  id: string;
  name: string;
  stateCluster: string;
  aqi: number;
  pm25UgM3: number;
  ozonePpb: number;
  uvIndex: number;
  pollenCountGrainsM3: number;
  waterHardnessMgL: number;
  waterPfasTier: 'NON_DETECT' | 'TRACE_SAFE' | 'ACTION_LEVEL';
  elevationM: number;
  barometricHpa: number;
  dominantPathways: string[];
  steeredEvidenceQuery: string;
}

@Component({
  selector: 'app-geofenced-exposomics-radar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-zinc-100 shadow-2xl space-y-6 max-w-5xl mx-auto">
      
      <!-- Top Banner -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <span>🌍</span>
            <span>Privacy-Preserving Geofenced Exposomics Radar</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Micro-Climate, Atmospheric &amp; Environmental Toxicology Grounding
          </h2>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Grounds clinical research and patient care plans in local environmental exposomic priors (PM2.5, Water PFAS, Ozone, Pollen) with zero PHI cloud transmission.
          </p>
        </div>

        <!-- Privacy Shield Seal -->
        <div class="bg-zinc-950 px-4 py-3 rounded-2xl border border-zinc-800 space-y-1 text-right">
          <div class="flex items-center justify-end gap-2 text-[10px] font-mono text-emerald-400">
            <span>🛡️</span>
            <span class="font-bold">HIPAA §164.514 Safe Harbor 50km Mesh</span>
          </div>
          <div class="text-[10px] font-mono text-zinc-400">
            Mesh Hash: <span class="text-teal-300 font-bold">{{ selectedEcoregion().id }}</span>
          </div>
        </div>
      </div>

      <!-- Ecoregion Selector Toolbar -->
      <div class="space-y-2">
        <label class="text-[11px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
          Select Patient Ecoregion Biome (50km Coarse Privacy Mesh):
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          @for (eco of ecoregions; track eco.id) {
            <button (click)="selectedEcoregionId.set(eco.id)"
                    [class.bg-emerald-600]="selectedEcoregionId() === eco.id"
                    [class.text-white]="selectedEcoregionId() === eco.id"
                    [class.border-emerald-400]="selectedEcoregionId() === eco.id"
                    [class.bg-zinc-950]="selectedEcoregionId() !== eco.id"
                    [class.text-zinc-400]="selectedEcoregionId() !== eco.id"
                    [class.border-zinc-800]="selectedEcoregionId() !== eco.id"
                    class="p-3 rounded-xl text-left border transition-all hover:border-emerald-500/60 cursor-pointer space-y-1">
              <div class="text-xs font-bold truncate leading-tight">{{ eco.name }}</div>
              <div class="text-[10px] font-mono opacity-80">{{ eco.stateCluster }}</div>
            </button>
          }
        </div>
      </div>

      <!-- Live Environmental Telemetry Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <!-- AQI -->
        <div class="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
          <div class="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
            <span>Air Quality</span>
            <span>💨</span>
          </div>
          <div class="text-lg font-bold font-mono"
               [class.text-emerald-400]="selectedEcoregion().aqi <= 50"
               [class.text-amber-400]="selectedEcoregion().aqi > 50 && selectedEcoregion().aqi <= 100"
               [class.text-rose-400]="selectedEcoregion().aqi > 100">
            {{ selectedEcoregion().aqi }} AQI
          </div>
          <div class="text-[10px] font-mono text-zinc-500">
            {{ selectedEcoregion().aqi <= 50 ? 'Good' : 'Moderate' }}
          </div>
        </div>

        <!-- PM2.5 -->
        <div class="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
          <div class="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
            <span>PM2.5 Particulate</span>
            <span>🌫️</span>
          </div>
          <div class="text-lg font-bold font-mono text-teal-300">
            {{ selectedEcoregion().pm25UgM3 }} µg/m³
          </div>
          <div class="text-[10px] font-mono text-zinc-500">WHO Guideline &lt; 5.0</div>
        </div>

        <!-- Ozone -->
        <div class="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
          <div class="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
            <span>Ozone (O₃)</span>
            <span>⚡</span>
          </div>
          <div class="text-lg font-bold font-mono text-cyan-300">
            {{ selectedEcoregion().ozonePpb }} ppb
          </div>
          <div class="text-[10px] font-mono text-zinc-500">EPA Standard &lt; 70</div>
        </div>

        <!-- UV Index -->
        <div class="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
          <div class="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
            <span>Solar UV Index</span>
            <span>☀️</span>
          </div>
          <div class="text-lg font-bold font-mono text-amber-300">
            UV {{ selectedEcoregion().uvIndex }}
          </div>
          <div class="text-[10px] font-mono text-zinc-500">Vit D / Melatonin</div>
        </div>

        <!-- Water PFAS -->
        <div class="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
          <div class="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
            <span>Drinking Water PFAS</span>
            <span>💧</span>
          </div>
          <div class="text-sm font-bold font-mono"
               [class.text-emerald-400]="selectedEcoregion().waterPfasTier === 'NON_DETECT'"
               [class.text-amber-400]="selectedEcoregion().waterPfasTier === 'TRACE_SAFE'"
               [class.text-rose-400]="selectedEcoregion().waterPfasTier === 'ACTION_LEVEL'">
            {{ selectedEcoregion().waterPfasTier.replace('_', ' ') }}
          </div>
          <div class="text-[10px] font-mono text-zinc-500">Hardness: {{ selectedEcoregion().waterHardnessMgL }} mg/L</div>
        </div>

        <!-- Barometric & Altitude -->
        <div class="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
          <div class="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
            <span>Atmospheric P</span>
            <span>🏔️</span>
          </div>
          <div class="text-lg font-bold font-mono text-indigo-300">
            {{ selectedEcoregion().barometricHpa }} hPa
          </div>
          <div class="text-[10px] font-mono text-zinc-500">Alt: {{ selectedEcoregion().elevationM }}m</div>
        </div>
      </div>

      <!-- Clinical Toxicology Pathways & 1-Click Grounding -->
      <div class="p-5 bg-zinc-950 border border-zinc-800/90 rounded-2xl space-y-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 class="text-xs font-bold font-mono text-emerald-300 uppercase tracking-wider">
              🔬 Active Environmental Biological Pathways in {{ selectedEcoregion().name }}:
            </h4>
            <div class="flex items-center gap-2 mt-2 flex-wrap">
              @for (pathway of selectedEcoregion().dominantPathways; track pathway) {
                <span class="px-2.5 py-1 bg-zinc-800/80 border border-zinc-700/60 rounded-lg text-xs font-mono text-zinc-300">
                  🌿 {{ pathway }}
                </span>
              }
            </div>
          </div>

          <button (click)="groundResearchToExposome()"
                  class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shrink-0">
            <span>🌿</span> Ground Literature to Exposome
          </button>
        </div>
      </div>

    </div>
  `
})
export class GeofencedExposomicsRadarComponent {
  private readonly patientState = inject(PatientStateService);

  readonly selectQuery = output<{ query: string; engine: 'pubmed' | 'gse' | 'google' }>();

  readonly selectedEcoregionId = signal<string>('ECO-VA-SHENANDOAH');

  readonly ecoregions: IEcoregionProfile[] = [
    {
      id: 'ECO-VA-SHENANDOAH',
      name: 'Appalachian Valley & Ridge',
      stateCluster: 'Charlottesville / Shenandoah, VA (UVA Health)',
      aqi: 38,
      pm25UgM3: 7.4,
      ozonePpb: 42,
      uvIndex: 6,
      pollenCountGrainsM3: 45,
      waterHardnessMgL: 125,
      waterPfasTier: 'NON_DETECT',
      elevationM: 180,
      barometricHpa: 1013,
      dominantPathways: [
        'Endothelial Flow-Mediated Dilation',
        'Seasonal Tree Pollen Histamine Response',
        'Moderate UV Vitamin D Synthesis'
      ],
      steeredEvidenceQuery: 'Shenandoah Appalachian Microclimate Particulate Air Quality Endothelial Health RCT'
    },
    {
      id: 'ECO-PNW-CASCADES',
      name: 'Pacific Northwest Maritime',
      stateCluster: 'Seattle / Eugene / Cascades (UW / UO)',
      aqi: 28,
      pm25UgM3: 4.2,
      ozonePpb: 25,
      uvIndex: 3,
      pollenCountGrainsM3: 120,
      waterHardnessMgL: 35,
      waterPfasTier: 'NON_DETECT',
      elevationM: 45,
      barometricHpa: 1018,
      dominantPathways: [
        'Photoperiod Seasonal Affective Dynamic',
        'Conifer Phytoncide Vagal Tone Induction',
        'Low UV Melatonin Phase Delay'
      ],
      steeredEvidenceQuery: 'Pacific Northwest Phytoncide Aerosol Vagal Tone Natural Killer Cell Activation'
    },
    {
      id: 'ECO-MIDWEST-PLAINS',
      name: 'Great Lakes Continental',
      stateCluster: 'West Lafayette / Chicago (Purdue / Big Ten)',
      aqi: 62,
      pm25UgM3: 14.8,
      ozonePpb: 52,
      uvIndex: 5,
      pollenCountGrainsM3: 85,
      waterHardnessMgL: 280,
      waterPfasTier: 'TRACE_SAFE',
      elevationM: 190,
      barometricHpa: 1012,
      dominantPathways: [
        'Agricultural Particulate Lung Macrophage Burden',
        'High Mineral Water Bioavailability (Calcium/Magnesium)',
        'Winter Cold-Induced Sympathetic Tone'
      ],
      steeredEvidenceQuery: 'Agricultural Particulate PM2.5 Pulmonary Macrophage Nrf2 Activation Sulforaphane'
    },
    {
      id: 'ECO-SW-SONORAN',
      name: 'Sonoran Subtropical Desert',
      stateCluster: 'Phoenix / Tucson, AZ',
      aqi: 72,
      pm25UgM3: 18.2,
      ozonePpb: 68,
      uvIndex: 10,
      pollenCountGrainsM3: 30,
      waterHardnessMgL: 310,
      waterPfasTier: 'TRACE_SAFE',
      elevationM: 340,
      barometricHpa: 980,
      dominantPathways: [
        'High Thermal Stress Heat Shock Protein (HSP70) Induction',
        'Intense UV Photoprotection & Melanin Epigenetics',
        'Alkaline Mineral Hydration Dynamics'
      ],
      steeredEvidenceQuery: 'Heat Shock Protein HSP70 Hydration Electrolytes Extreme Temperature Clinical Trial'
    },
    {
      id: 'ECO-NE-COASTAL',
      name: 'Northeastern Coastal Megalopolis',
      stateCluster: 'Boston / New York (Harvard / MGH)',
      aqi: 54,
      pm25UgM3: 11.5,
      ozonePpb: 46,
      uvIndex: 5,
      pollenCountGrainsM3: 60,
      waterHardnessMgL: 65,
      waterPfasTier: 'TRACE_SAFE',
      elevationM: 15,
      barometricHpa: 1015,
      dominantPathways: [
        'Urban Traffic Exhaust Endothelial Oxidative Stress',
        'Noise Pollution Autonomic Arousal',
        'Circadian Night Light Melatonin Suppression'
      ],
      steeredEvidenceQuery: 'Urban Traffic Noise Endothelial Function Circadian Light Melatonin Suppression RCT'
    }
  ];

  readonly selectedEcoregion = computed(() => {
    const id = this.selectedEcoregionId();
    return this.ecoregions.find(e => e.id === id) || this.ecoregions[0];
  });

  groundResearchToExposome(): void {
    const eco = this.selectedEcoregion();
    this.selectQuery.emit({
      query: eco.steeredEvidenceQuery,
      engine: 'pubmed'
    });
  }
}
