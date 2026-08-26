import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { PharmacogenomicsService } from '../../services/pharmacogenomics.service';

interface ISystemsAxis {
  id: string;
  name: string;
  driver: string;
  target: string;
  mechanism: string;
  leverageRank: string;
  status: 'balanced' | 'compensated' | 'stressed';
  badgeColor: string;
}

@Component({
  selector: 'app-inter-system-crosstalk-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono shadow-2xl space-y-5">
      
      <!-- Card Title & Concept Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-base font-black text-teal-400">⥯ Inter-Organ Dynamical Cross-Talk</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
              Donella Meadows Systems Model
            </span>
          </div>
          <p class="text-xs text-zinc-400 font-sans mt-0.5">
            Non-linear biophysical feedback loops coupling oral, autonomic, endothelial, and metabolic subsystems.
          </p>
        </div>

        <div class="flex items-center gap-2 text-xs">
          <span class="text-zinc-500 font-bold uppercase text-[10px]">Filter Axis:</span>
          <button type="button"
                  (click)="selectedAxisFilter.set('all')"
                  [class.bg-zinc-800]="selectedAxisFilter() === 'all'"
                  [class.text-white]="selectedAxisFilter() === 'all'"
                  class="px-2 py-1 rounded-md text-[11px] font-bold text-zinc-400 hover:text-zinc-200 transition cursor-pointer">
            All (4)
          </button>
          <button type="button"
                  (click)="selectedAxisFilter.set('stressed')"
                  [class.bg-rose-900/60]="selectedAxisFilter() === 'stressed'"
                  [class.text-rose-200]="selectedAxisFilter() === 'stressed'"
                  class="px-2 py-1 rounded-md text-[11px] font-bold text-zinc-400 hover:text-zinc-200 transition cursor-pointer">
            Stressed
          </button>
        </div>
      </div>

      <!-- Dynamical Cross-Talk Graph Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (axis of filteredAxes(); track axis.id) {
          <div class="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition flex flex-col justify-between space-y-3">
            
            <div>
              <!-- Axis Name & Status Badge -->
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-black uppercase text-zinc-100">{{ axis.name }}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase border"
                      [ngClass]="axis.badgeColor">
                  {{ axis.status }}
                </span>
              </div>

              <!-- Driver to Target Vector -->
              <div class="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs flex items-center justify-between text-zinc-300">
                <span class="text-teal-300 font-bold">{{ axis.driver }}</span>
                <span class="text-zinc-500 font-mono">──(Feedback Loop)──▶</span>
                <span class="text-amber-300 font-bold">{{ axis.target }}</span>
              </div>

              <!-- Biophysical Mechanism -->
              <p class="text-[11px] text-zinc-400 font-sans mt-2.5 leading-relaxed">
                {{ axis.mechanism }}
              </p>
            </div>

            <!-- Meadows Leverage Point Footer -->
            <div class="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px]">
              <span class="text-zinc-500 font-bold uppercase">Meadows Leverage Point:</span>
              <span class="text-teal-400 font-extrabold">{{ axis.leverageRank }}</span>
            </div>

          </div>
        }
      </div>

      <!-- Systems Leverage Points Ranking Banner -->
      <div class="p-3.5 rounded-xl bg-gradient-to-r from-teal-950/40 via-zinc-900 to-indigo-950/40 border border-teal-800/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2.5">
          <span class="text-base">🎯</span>
          <div>
            <span class="font-extrabold text-teal-300">Highest-Leverage Intervention:</span>
            <span class="text-zinc-300 font-sans text-xs ml-1.5">
              Circadian Vagal Reset + Targeted SIBI Decontamination
            </span>
          </div>
        </div>
        <div class="text-[10px] text-zinc-400 font-mono">
          Efficiency Ratio: <span class="text-emerald-400 font-bold">4.8x ROI on QALY</span>
        </div>
      </div>

    </div>
  `
})
export class InterSystemCrosstalkCardComponent {
  private readonly state = inject(PatientStateService);
  private readonly pgx = inject(PharmacogenomicsService);

  readonly selectedAxisFilter = signal<'all' | 'stressed'>('all');

  readonly systemsAxes = computed<ISystemsAxis[]>(() => {
    const issues = this.state.issues();
    const reason = this.state.reasonForVisit() || '';
    const vitals = this.state.vitals();
    const hr = parseFloat(vitals.hr || '72') || 72;
    const hasOral = Object.keys(issues).some(k => k.toLowerCase().includes('gum') || k.toLowerCase().includes('mouth') || k.toLowerCase().includes('tooth')) ||
                    reason.toLowerCase().includes('gum') || reason.toLowerCase().includes('periodont');
    const hasCardio = hr > 85 || (vitals.bp && parseInt(vitals.bp.split('/')[0], 10) > 130);

    return [
      {
        id: 'oral-cardio',
        name: 'Oral-Endothelial Axis',
        driver: 'SIBI Periodontal Load (P. gingivalis)',
        target: 'Endothelial Nitric Oxide & Plaque Stability',
        mechanism: 'Translocating oral lipopolysaccharides (LPS) trigger subclinical vascular inflammation, accelerating arterial stiffness.',
        leverageRank: 'Rank 1: Source Decontamination (SIBI Rinse + CoQ10)',
        status: hasOral ? 'stressed' : 'compensated',
        badgeColor: hasOral ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      },
      {
        id: 'autonomic-circadian',
        name: 'Autonomic-Circadian Axis',
        driver: 'Suprachiasmatic Nucleus (Light Cycle)',
        target: 'Vagal Nerve Brake & HRV RMSSD',
        mechanism: 'Disrupted melatonin/cortisol diurnal curve depresses parasympathetic tone, reducing overnight tissue repair efficiency.',
        leverageRank: 'Rank 2: Balancing Loop (Vagal Breath Pacing 5.5s)',
        status: hasCardio ? 'stressed' : 'balanced',
        badgeColor: hasCardio ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      },
      {
        id: 'pgx-clearance',
        name: 'Pharmacogenomic Clearance Axis',
        driver: 'Hepatic CYP2C19 / CYP2D6 Enzymatic Flux',
        target: 'Serum Active Drug AUC & Receptor Saturation',
        mechanism: 'Genotypic intermediate metabolizer status extends drug half-life, requiring chronobiological dosing titration to prevent accumulation.',
        leverageRank: 'Rank 3: Parameter Calibration (Chrono-Dosing Window)',
        status: 'balanced',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      },
      {
        id: 'gut-neuro',
        name: 'Enteric-Microbiome-Neuro Axis',
        driver: 'Microbial SCFA Production & Vagus Signaling',
        target: 'Neuro-Transmitter Synthesis & Microglial Tone',
        mechanism: 'Colonic microbial fermentation of prebiotic fibers modulates systemic tryptophan catabolism and brain-derived neurotrophic factor (BDNF).',
        leverageRank: 'Rank 4: Substrate Replenishment (Polyphenols + Resistant Starch)',
        status: 'compensated',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      }
    ];
  });

  readonly filteredAxes = computed(() => {
    const filter = this.selectedAxisFilter();
    const all = this.systemsAxes();
    if (filter === 'stressed') {
      return all.filter(a => a.status === 'stressed' || a.status === 'compensated');
    }
    return all;
  });
}
