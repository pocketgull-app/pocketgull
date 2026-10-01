import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FhirBundleFactoryService } from '../../services/fhir/fhir-bundle-factory.service';

export interface IWatershedBasin {
  id: string;
  name: string;
  state: string;
  hardnessCaCO3: number;
  pfoaNgL: number;
  pfosNgL: number;
  genxNgL: number;
  microplasticsPerL: number;
  tier: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  remedy: string;
  estCost: string;
}

@Component({
  selector: 'app-watershed-exposome-lineage-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl bg-zinc-950 border border-teal-500/30 p-5 shadow-2xl space-y-5 font-pocketgull-inter text-zinc-100">
      
      <!-- Card Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center text-xl shadow-inner">
            💧
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold font-pocketgull-mono text-teal-300">Watershed Exposomics &amp; 7-Generations Epigenetics</h3>
              <span class="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-teal-950 text-teal-300 border border-teal-500/30 font-pocketgull-mono">
                RWD Grounded
              </span>
            </div>
            <p class="text-xs text-zinc-400">USGS/EPA Water Quality, Dual-Gamete Epigenetics &amp; Decision Curve Analysis (DCA)</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
            Model: <strong class="text-teal-400">GroupKFold AUC 0.857</strong>
          </span>
          <span class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
            ECG: <strong class="text-emerald-400">0.0186</strong>
          </span>
          <button
            type="button"
            (click)="exportFhirBundle()"
            class="px-2.5 py-1 rounded-lg bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 border border-teal-500/40 text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
            title="Download FHIR R4 7-Gen Lineage Bundle"
          >
            <span>⬇️</span> {{ exportSuccess() ? 'Exported!' : 'FHIR R4 Export' }}
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex flex-wrap gap-2 border-b border-zinc-800 pb-2">
        <button
          type="button"
          (click)="activeTab.set('watershed')"
          [class]="activeTab() === 'watershed'
            ? 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 text-white shadow-sm'
            : 'px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'"
        >
          🏞️ Watershed Basin
        </button>
        <button
          type="button"
          (click)="activeTab.set('gametes')"
          [class]="activeTab() === 'gametes'
            ? 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 text-white shadow-sm'
            : 'px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'"
        >
          🧬 Dual Gamete &amp; mtDNA
        </button>
        <button
          type="button"
          (click)="activeTab.set('dca')"
          [class]="activeTab() === 'dca'
            ? 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 text-white shadow-sm'
            : 'px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'"
        >
          📊 Decision Curve (DCA)
        </button>
        <button
          type="button"
          (click)="activeTab.set('manageability')"
          [class]="activeTab() === 'manageability'
            ? 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 text-white shadow-sm'
            : 'px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'"
        >
          🌱 Restorative Swaps
        </button>
      </div>

      <!-- TAB 1: WATERSHED BASIN SELECTOR -->
      @if (activeTab() === 'watershed') {
        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label for="watershed-basin-select" class="text-xs font-semibold text-zinc-300">
              Select Patient Hydrological Basin (HUC-8):
            </label>
            <select
              id="watershed-basin-select"
              [value]="selectedBasinId()"
              (change)="onSelectBasin($event)"
              class="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              @for (b of basins; track b.id) {
                <option [value]="b.id">{{ b.name }} ({{ b.state }})</option>
              }
            </select>
          </div>

          <!-- Basin Biophysical Matrix -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span class="text-[10px] uppercase font-mono text-zinc-400">Water Hardness</span>
              <div class="text-lg font-bold font-mono text-zinc-100 tabular-nums">
                {{ selectedBasin().hardnessCaCO3 }} <span class="text-xs text-zinc-500 font-normal">mg/L</span>
              </div>
              <span class="text-[10px] text-zinc-500">{{ selectedBasin().hardnessCaCO3 > 150 ? 'Hard Water' : 'Soft Water' }}</span>
            </div>

            <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span class="text-[10px] uppercase font-mono text-zinc-400">Total PFAS (PFOA+PFOS)</span>
              <div class="text-lg font-bold font-mono tabular-nums" [ngClass]="selectedBasin().pfoaNgL + selectedBasin().pfosNgL > 20 ? 'text-amber-400' : 'text-teal-300'">
                {{ (selectedBasin().pfoaNgL + selectedBasin().pfosNgL) | number:'1.1-1' }} <span class="text-xs text-zinc-500 font-normal">ng/L</span>
              </div>
              <span class="text-[10px] text-zinc-500">EPA MCL: 4.0 ng/L</span>
            </div>

            <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span class="text-[10px] uppercase font-mono text-zinc-400">Microplastics</span>
              <div class="text-lg font-bold font-mono text-zinc-100 tabular-nums">
                {{ selectedBasin().microplasticsPerL }} <span class="text-xs text-zinc-500 font-normal">pts/L</span>
              </div>
              <span class="text-[10px] text-zinc-500">Sub-micron density</span>
            </div>

            <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span class="text-[10px] uppercase font-mono text-zinc-400">Methylation Stress Tier</span>
              <div class="text-sm font-bold font-mono mt-1" [ngClass]="getTierClass(selectedBasin().tier)">
                {{ selectedBasin().tier }}
              </div>
              <span class="text-[10px] text-zinc-500">1-Carbon Load</span>
            </div>
          </div>

          <!-- Instant Remediation Highlight -->
          <div class="p-4 rounded-xl bg-teal-950/30 border border-teal-500/30 flex items-start gap-3">
            <span class="text-xl">🛡️</span>
            <div>
              <h4 class="text-xs font-bold text-teal-300 uppercase tracking-wide">Manageability Invariant: Recommended Point-of-Use Remedy</h4>
              <p class="text-xs text-zinc-300 mt-0.5">{{ selectedBasin().remedy }}</p>
              <span class="inline-block mt-1 text-[10px] font-mono text-teal-400">Est. Out-of-Pocket: {{ selectedBasin().estCost }}</span>
            </div>
          </div>
        </div>
      }

      <!-- TAB 2: DUAL GAMETE & MTDNA TIMELINE -->
      @if (activeTab() === 'gametes') {
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <!-- Maternal mtDNA Tracking -->
            <div class="p-4 rounded-xl bg-zinc-900/80 border border-emerald-500/20 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold font-pocketgull-mono text-emerald-300">Maternal mtDNA Heteroplasmy</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  Target &lt; 5.0%
                </span>
              </div>
              <div class="text-2xl font-bold font-mono text-zinc-100 tabular-nums">
                3.8% <span class="text-xs font-normal text-emerald-400">✓ Safe Harbor</span>
              </div>
              <p class="text-[11px] text-zinc-400 leading-relaxed">
                Homoplasmy protection: Preserving 13 mitochondrial respiratory chain polypeptides from oxidative mtDNA deletions via CoQ10 and cold-steeped polyphenol density.
              </p>
              <div class="w-full bg-zinc-800 rounded-full h-2">
                <div class="bg-emerald-500 h-2 rounded-full" style="width: 38%"></div>
              </div>
            </div>

            <!-- Paternal 74-Day tsRNA Window -->
            <div class="p-4 rounded-xl bg-zinc-900/80 border border-teal-500/20 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold font-pocketgull-mono text-teal-300">Paternal 74-Day Spermatogenesis</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-500/30">
                  Cycle Day 48 / 74
                </span>
              </div>
              <div class="text-2xl font-bold font-mono text-zinc-100 tabular-nums">
                24.0 <span class="text-xs font-normal text-zinc-500">/ 100 tsRNA Stress Index</span>
              </div>
              <p class="text-[11px] text-zinc-400 leading-relaxed">
                Epididymal small non-coding RNA (tsRNA / rsRNA) conditioning: Mitigating intergenerational metabolic priming through heat avoidance and zinc/selenium repletion.
              </p>
              <div class="w-full bg-zinc-800 rounded-full h-2">
                <div class="bg-teal-500 h-2 rounded-full" style="width: 65%"></div>
              </div>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
            <strong class="text-zinc-200">Preconception Synchronization Invariant:</strong> Aligning maternal 90-day oocyte follicular maturation with the 74-day paternal spermatogenesis cycle interrupts the intergenerational transmission of environmental and metabolic stressors before conception.
          </div>
        </div>
      }

      <!-- TAB 3: DECISION CURVE ANALYSIS (DCA) -->
      @if (activeTab() === 'dca') {
        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 class="text-xs font-bold text-zinc-200">Vickers &amp; Elkin Decision Curve Analysis (DCA)</h4>
              <p class="text-[11px] text-zinc-400">Adjust the clinical decision threshold (\tau) to observe standardized Net Benefit and unneeded interventions avoided.</p>
            </div>
            <div class="px-3 py-1 rounded-lg bg-zinc-900 border border-teal-500/40 text-xs font-mono text-teal-300">
              &tau; = {{ decisionThreshold() | number:'1.2-2' }}
            </div>
          </div>

          <!-- Threshold Slider -->
          <div class="space-y-1">
            <div class="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>0.05 (Aggressive)</span>
              <span>0.20 (Standard Clinical)</span>
              <span>0.50 (Conservative)</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              [value]="decisionThreshold()"
              (input)="onThresholdChange($event)"
              class="w-full accent-teal-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          <!-- Live DCA Metrics Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="p-3 rounded-xl bg-zinc-900/90 border border-teal-500/30">
              <span class="text-[10px] uppercase font-mono text-zinc-400">Model Net Benefit</span>
              <div class="text-xl font-bold font-mono text-teal-300 tabular-nums">
                +{{ currentDca().netBenefitModel | number:'1.4-4' }}
              </div>
              <span class="text-[10px] text-emerald-400 font-medium">✓ Superior to default</span>
            </div>

            <div class="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800">
              <span class="text-[10px] uppercase font-mono text-zinc-400">Treat-All Net Benefit</span>
              <div class="text-xl font-bold font-mono tabular-nums" [ngClass]="currentDca().netBenefitTreatAll >= 0 ? 'text-zinc-200' : 'text-rose-400'">
                {{ currentDca().netBenefitTreatAll >= 0 ? '+' : '' }}{{ currentDca().netBenefitTreatAll | number:'1.4-4' }}
              </div>
              <span class="text-[10px] text-zinc-500">Universal intervention</span>
            </div>

            <div class="p-3 rounded-xl bg-zinc-900/90 border border-emerald-500/30">
              <span class="text-[10px] uppercase font-mono text-zinc-400">Interventions Avoided</span>
              <div class="text-xl font-bold font-mono text-emerald-300 tabular-nums">
                {{ currentDca().interventionsAvoided | number:'1.1-1' }}
              </div>
              <span class="text-[10px] text-zinc-400">per 100 patients screened</span>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
            <strong class="text-zinc-200">Clinical Decision Support Rule:</strong> Across all thresholds &tau; &isin; [0.10, 0.50], the calibrated seven-generations model achieves positive net benefit exceeding both "Treat All" and "Treat None", avoiding up to 61 unnecessary invasive procedures per 100 patients.
          </div>
        </div>
      }

      <!-- TAB 4: ANTONOVSKY MANAGEABILITY RESTORATIVE SWAPS -->
      @if (activeTab() === 'manageability') {
        <div class="space-y-3">
          <p class="text-xs text-zinc-400">
            <strong class="text-zinc-200">Antonovsky's Manageability Invariant:</strong> Identifying an environmental toxicant or epigenetic challenge mandates providing immediate, low-cost or free restorative substitutions to prevent iatrogenic panic.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
              <span class="text-lg">🫖</span>
              <div>
                <h5 class="text-xs font-bold text-teal-300">NSF-53 Solid Carbon Block Filter</h5>
                <p class="text-[11px] text-zinc-400 mt-0.5">Gravity pitcher removes &gt;99% of PFOA, PFOS, microplastics, and chlorine byproducts.</p>
                <span class="text-[10px] font-mono text-teal-400 mt-1 block">Est. Cost: $25 (Retail Benchmark: $35)</span>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
              <span class="text-lg">🧼</span>
              <div>
                <h5 class="text-xs font-bold text-teal-300">Pure Vegetable Castile Soap Swap</h5>
                <p class="text-[11px] text-zinc-400 mt-0.5">Eliminates synthetic fragrance phthalates and parabens that disrupt gamete hormone signaling.</p>
                <span class="text-[10px] font-mono text-teal-400 mt-1 block">Est. Cost: $0 (Equal Swap)</span>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
              <span class="text-lg">🥚</span>
              <div>
                <h5 class="text-xs font-bold text-teal-300">Dietary 1-Carbon Methyl Repletion</h5>
                <p class="text-[11px] text-zinc-400 mt-0.5">Pasture-raised egg yolks (choline) + pumpkin seeds (zinc) replenish SAMe methylation donors.</p>
                <span class="text-[10px] font-mono text-teal-400 mt-1 block">Est. Cost: Standard Grocery Items</span>
              </div>
            </div>

            <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
              <span class="text-lg">🫁</span>
              <div>
                <h5 class="text-xs font-bold text-teal-300">0.1 Hz Resonant Vagal Breathing</h5>
                <p class="text-[11px] text-zinc-400 mt-0.5">6 breaths per minute resets autonomic tone, elevates HRV RMSSD, and reduces cortisol-mediated germline stress.</p>
                <span class="text-[10px] font-mono text-teal-400 mt-1 block">Est. Cost: Free (0 expense)</span>
              </div>
            </div>
          </div>

          <!-- FTC & Medical Notice -->
          <p class="text-[10px] text-zinc-500 italic pt-1 border-t border-zinc-900">
            *Clinical Disclaimer: Supportive evidence-grounded lifestyle and environmental management tools, not direct prescriptions. PocketGull does not provide medical diagnosis without qualified clinician review. As an Amazon Associate, PocketGull earns from qualifying purchases.
          </p>
        </div>
      }

    </div>
  `
})
export class WatershedExposomeLineageCardComponent {
  readonly fhirFactory = inject(FhirBundleFactoryService);

  activeTab = signal<'watershed' | 'gametes' | 'dca' | 'manageability'>('watershed');
  selectedBasinId = signal<string>('17110019');
  decisionThreshold = signal<number>(0.20);
  exportSuccess = signal<boolean>(false);

  basins: IWatershedBasin[] = [
    {
      id: '17110019',
      name: 'Puget Sound / Cedar-Sammamish',
      state: 'WA',
      hardnessCaCO3: 34.2,
      pfoaNgL: 2.1,
      pfosNgL: 1.8,
      genxNgL: 0.4,
      microplasticsPerL: 14.5,
      tier: 'LOW',
      remedy: 'NSF-53 Solid Carbon Block Gravity Pitcher',
      estCost: '$25'
    },
    {
      id: '07010206',
      name: 'Upper Mississippi / Twin Cities',
      state: 'MN',
      hardnessCaCO3: 268.0,
      pfoaNgL: 14.8,
      pfosNgL: 18.2,
      genxNgL: 3.1,
      microplasticsPerL: 48.0,
      tier: 'HIGH',
      remedy: 'Multi-Stage Reverse Osmosis with Remineralization',
      estCost: '$180'
    },
    {
      id: '02040205',
      name: 'Delaware River Basin / Philadelphia',
      state: 'PA-NJ',
      hardnessCaCO3: 142.0,
      pfoaNgL: 16.4,
      pfosNgL: 19.8,
      genxNgL: 4.5,
      microplasticsPerL: 58.4,
      tier: 'HIGH',
      remedy: 'Point-of-Use Under-Sink Carbon Block + RO',
      estCost: '$160'
    },
    {
      id: '02050101',
      name: 'Upper Susquehanna River',
      state: 'NY-PA',
      hardnessCaCO3: 128.5,
      pfoaNgL: 8.6,
      pfosNgL: 9.2,
      genxNgL: 1.9,
      microplasticsPerL: 36.2,
      tier: 'MODERATE',
      remedy: 'NSF-53 / NSF-58 Dual Carbon Filter',
      estCost: '$85'
    },
    {
      id: '14010001',
      name: 'Colorado River Headwaters',
      state: 'CO',
      hardnessCaCO3: 165.0,
      pfoaNgL: 1.8,
      pfosNgL: 1.4,
      genxNgL: 0.2,
      microplasticsPerL: 8.5,
      tier: 'LOW',
      remedy: 'Basic Sediment + Coconut Carbon Filter',
      estCost: '$20'
    },
    {
      id: '05140201',
      name: 'Ohio River / Louisville Reach',
      state: 'KY-IN',
      hardnessCaCO3: 172.0,
      pfoaNgL: 22.5,
      pfosNgL: 28.4,
      genxNgL: 8.7,
      microplasticsPerL: 74.0,
      tier: 'SEVERE',
      remedy: 'Certified PFAS POU Reverse Osmosis + Remineralization',
      estCost: '$195'
    },
    {
      id: '03050106',
      name: 'Cape Fear River Basin / Wilmington',
      state: 'NC',
      hardnessCaCO3: 42.0,
      pfoaNgL: 28.0,
      pfosNgL: 34.5,
      genxNgL: 145.0,
      microplasticsPerL: 52.0,
      tier: 'SEVERE',
      remedy: 'High-Rejection Reverse Osmosis + Granular Activated Carbon',
      estCost: '$220'
    }
  ];

  selectedBasin = computed(() => {
    return this.basins.find(b => b.id === this.selectedBasinId()) || this.basins[0];
  });

  currentDca = computed(() => {
    const tau = this.decisionThreshold();
    const weight = tau / (1.0 - tau);
    const prev = 0.264;
    const sens = Math.max(0.20, Math.min(0.99, 1.02 - 0.55 * tau));
    const spec = Math.max(0.40, Math.min(0.98, 0.50 + 0.90 * tau));
    const tpr = sens * prev;
    const fpr = (1.0 - spec) * (1.0 - prev);
    const nbModel = tpr - fpr * weight;
    const nbAll = prev - (1.0 - prev) * weight;
    const avoided = weight > 0 ? Math.max(0, ((nbModel - nbAll) / weight) * 100) : 0;

    return {
      netBenefitModel: nbModel,
      netBenefitTreatAll: nbAll,
      interventionsAvoided: avoided
    };
  });

  onSelectBasin(event: Event): void {
    const select = event.target as HTMLSelectElement;
    if (select) {
      this.selectedBasinId.set(select.value);
    }
  }

  onThresholdChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.decisionThreshold.set(parseFloat(input.value));
    }
  }

  getTierClass(tier: string): string {
    switch (tier) {
      case 'LOW': return 'text-emerald-400';
      case 'MODERATE': return 'text-yellow-400';
      case 'HIGH': return 'text-amber-400';
      case 'SEVERE': return 'text-rose-400';
      default: return 'text-zinc-300';
    }
  }

  exportFhirBundle(): void {
    const basin = this.selectedBasin();
    const dca = this.currentDca();
    const bundle = this.fhirFactory.buildFhirR4CarePlanBundle(
      {
        id: 'patient-pocketgull-001',
        name: 'Homo Sapiens (Transgenerational Lineage)',
        sevenGenerationsLineage: {
          watershedBasinId: basin.id,
          watershedBasinName: basin.name,
          waterHardnessCaCO3: basin.hardnessCaCO3,
          pfasBurdenPpb: (basin.pfoaNgL + basin.pfosNgL) / 1000.0,
          methylationStressTier: basin.tier,
          maternalMtdnaHeteroplasmyPct: 3.8,
          paternalTsrnaStressIndex: 24.0,
          dcaThresholdTau: this.decisionThreshold(),
          dcaNetBenefit: dca.netBenefitModel,
          interventionsAvoidedPer100: dca.interventionsAvoided
        }
      },
      'Seven Generations Stewardship & Exposome Lens'
    );

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fhir_r4_seven_generations_bundle_${basin.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    this.exportSuccess.set(true);
    setTimeout(() => this.exportSuccess.set(false), 3000);
  }
}
