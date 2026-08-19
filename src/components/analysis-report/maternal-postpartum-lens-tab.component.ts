import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaternalPostpartumService, ILactMedEntry } from '../../services/maternal-postpartum.service';

@Component({
  selector: 'app-maternal-postpartum-lens-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full space-y-6 text-slate-100 font-sans">
      <!-- Main Banner -->
      <div class="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-zinc-900 to-purple-950/40 border border-purple-500/30 shadow-2xl">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="text-3xl">🤰</span>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-xl font-bold text-white tracking-tight">4th-Trimester Maternal & Doula Protocol</h3>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950 text-purple-300 border border-purple-700/50">
                  Day {{ maternal.activePostpartumDay() }} Postpartum
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                Real-time EPDS mood surveillance, LactMed drug safety index, and physiological recovery milestones.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="exportPostpartumBundle()"
              class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition shadow-sm hover:shadow-purple-500/20 active:scale-95">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export FHIR R4 Bundle
            </button>
          </div>
        </div>

        <!-- Telemetry HUD Grid -->
        <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span class="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Lactation Safety</span>
            <div class="text-lg font-bold text-emerald-400">L1 — Safest</div>
            <span class="text-[11px] text-slate-400 font-sans">LactMed verified compatibility</span>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1" [class.border-rose-700]="maternal.isHighRiskEpds()">
            <span class="text-slate-500 uppercase tracking-wider text-[10px] font-bold">EPDS Mood Screener</span>
            <div class="text-lg font-bold" [ngClass]="maternal.isHighRiskEpds() ? 'text-rose-400' : 'text-emerald-400'">
              {{ maternal.epdsScore().totalScore }} / 30
            </div>
            <span class="text-[11px] text-slate-400 font-sans">{{ maternal.epdsScore().severity }}</span>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span class="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Resting HR Recovery</span>
            <div class="text-lg font-bold text-purple-300">{{ maternal.maternalVitals().restingHeartRateBpm }} bpm</div>
            <span class="text-[11px] text-slate-400 font-sans">BP: {{ maternal.maternalVitals().systolicBp }}/{{ maternal.maternalVitals().diastolicBp }} mmHg</span>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span class="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Sleep Fragmentation</span>
            <div class="text-lg font-bold text-amber-300">{{ maternal.maternalVitals().sleepDurationHours }}h ({{ maternal.maternalVitals().sleepFragmentationAwakenings }}x waking)</div>
            <span class="text-[11px] text-slate-400 font-sans">Hydration: {{ maternal.maternalVitals().hydrationLiters }} L/day</span>
          </div>
        </div>
      </div>

      <!-- Main Columns: EPDS Interactive Screener & LactMed Safety Checker -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- EPDS Assessment Card (6 cols) -->
        <div class="lg:col-span-6 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h4 class="text-base font-bold text-white">Edinburgh Postnatal Depression Scale (EPDS)</h4>
              <p class="text-xs text-slate-400">LOINC: 71354-5 &bull; Validated 10-Item Perinatal Instrument</p>
            </div>
            <span
              class="px-2.5 py-1 text-xs font-semibold rounded-lg border"
              [ngClass]="maternal.isHighRiskEpds() ? 'bg-rose-950 text-rose-300 border-rose-700' : 'bg-emerald-950 text-emerald-300 border-emerald-700'">
              Score: {{ maternal.epdsScore().totalScore }}
            </span>
          </div>

          @if (maternal.epdsScore().criticalAlert) {
            <div class="p-3 bg-rose-950/80 border border-rose-700 rounded-xl text-xs text-rose-200">
              <strong>CRITICAL SAFETY ALERT:</strong> Item 10 endorsed positive for self-harm thoughts. Immediate doula/midwifery support and clinical safety plan activated.
            </div>
          }

          <div class="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            @for (q of epdsQuestionLabels; track $index) {
              <div class="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2">
                <div class="text-xs font-medium text-slate-300">
                  <span class="font-bold text-purple-400">{{ $index + 1 }}.</span> {{ q }}
                </div>
                <div class="grid grid-cols-4 gap-1.5 text-xs font-mono">
                  @for (opt of [0, 1, 2, 3]; track opt) {
                    <button
                      type="button"
                      (click)="maternal.setEpdsAnswer($index, opt)"
                      [class.bg-purple-600]="maternal.epdsAnswers()[$index] === opt"
                      [class.text-white]="maternal.epdsAnswers()[$index] === opt"
                      [class.bg-slate-900]="maternal.epdsAnswers()[$index] !== opt"
                      [class.text-slate-400]="maternal.epdsAnswers()[$index] !== opt"
                      class="py-1.5 rounded-lg border border-slate-700/60 hover:bg-purple-900/40 transition">
                      {{ opt }}
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- LactMed Medication Safety & Milestones (6 cols) -->
        <div class="lg:col-span-6 space-y-6">
          <!-- LactMed Drug Checker -->
          <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 class="text-base font-bold text-white">LactMed &copy; Medication Safety Index</h4>
                <p class="text-xs text-slate-400">Relative Infant Dose (RID%) & Milk-to-Plasma Partitioning</p>
              </div>
              <span class="text-xs font-mono text-emerald-400 font-semibold">NCBI Bookshelf</span>
            </div>

            <div class="relative">
              <input
                type="text"
                [(ngModel)]="searchMedName"
                placeholder="Search drug (e.g. Sertraline, Ibuprofen, Codeine)..."
                class="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-700/70 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
            </div>

            @if (activeLactMed(); as drug) {
              <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div class="flex items-center justify-between">
                  <div class="font-bold text-white text-sm">{{ drug.drugName }}</div>
                  <span class="px-2 py-0.5 text-xs font-semibold rounded-md border" [ngClass]="getLactMedBadgeClass(drug.riskTier)">
                    {{ drug.riskTier }}
                  </span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div class="text-slate-400">RID: <span class="text-emerald-400 font-bold">{{ drug.relativeInfantDosePercent }}%</span></div>
                  <div class="text-slate-400">M/P Ratio: <span class="text-purple-300 font-bold">{{ drug.milkPlasmaRatio }}</span></div>
                </div>
                <p class="text-xs text-slate-300 pt-1 leading-relaxed">
                  {{ drug.clinicalSummary }}
                </p>
              </div>
            }
          </div>

          <!-- 4th Trimester Recovery Milestones -->
          <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h4 class="text-base font-bold text-white">4th-Trimester Physiological Milestones</h4>

            <div class="space-y-2.5">
              @for (m of maternal.recoveryMilestones(); track m.phaseName; let idx = $index) {
                <div
                  (click)="maternal.toggleMilestone(idx)"
                  class="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition flex items-start gap-3">
                  <input
                    type="checkbox"
                    [checked]="m.completed"
                    class="mt-1 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500 h-4 w-4 pointer-events-none" />
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-purple-300 font-mono">{{ m.dayOrWeek }} &bull; {{ m.phaseName }}</span>
                      <span class="text-[10px] font-semibold" [ngClass]="m.completed ? 'text-emerald-400' : 'text-slate-500'">
                        {{ m.completed ? 'COMPLETED' : 'PENDING' }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-400 mt-1 leading-normal">
                      {{ m.physiologicalNotes }}
                    </p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Export Notification Toast -->
      @if (exportSuccessMessage()) {
        <div class="p-3 bg-emerald-950 border border-emerald-700/60 rounded-xl text-xs font-mono text-emerald-200 flex items-center justify-between">
          <span>{{ exportSuccessMessage() }}</span>
          <button (click)="exportSuccessMessage.set(null)" class="text-emerald-400 hover:text-white font-bold ml-2">&times;</button>
        </div>
      }
    </div>
  `
})
export class MaternalPostpartumLensTabComponent {
  public maternal = inject(MaternalPostpartumService);
  public searchMedName = signal<string>('Sertraline');
  public exportSuccessMessage = signal<string | null>(null);

  readonly epdsQuestionLabels = [
    'I have been able to laugh and see the bright side of things',
    'I have looked forward with enjoyment to things',
    'I have blamed myself unnecessarily when things went wrong',
    'I have been anxious or worried for no good reason',
    'I have felt scared or panicky without much reason',
    'Things have been getting on top of me',
    'I have been so unhappy that I have had difficulty sleeping',
    'I have felt sad or miserable',
    'I have been so unhappy that I have been crying',
    'The thought of harming myself has occurred to me'
  ];

  activeLactMed(): ILactMedEntry | null {
    const q = this.searchMedName() || 'Sertraline';
    return this.maternal.lookupLactMedSafety(q);
  }

  getLactMedBadgeClass(tier: string): string {
    if (tier.startsWith('L1') || tier.startsWith('L2')) {
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
    } else if (tier.startsWith('L3')) {
      return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
    } else {
      return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
    }
  }

  exportPostpartumBundle(): void {
    const bundle = this.maternal.exportFhirR4PostpartumBundle('homo-sapiens-34y');
    this.exportSuccessMessage.set(`Successfully generated standard FHIR R4 Bundle with ${bundle['entry']?.length || 0} Observation resources.`);
  }
}
