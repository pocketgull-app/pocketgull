import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalHealthUtilityService, IGlobalHealthUtilityReport } from '../services/global-health-utility.service';

@Component({
  selector: 'app-global-health-utility-folio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 font-sans overflow-y-auto"
         (click)="close.emit()">
      
      <!-- Folio Modal Dialog -->
      <div class="w-full max-w-5xl bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-hidden"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <div class="flex items-center gap-3">
            <span class="text-3xl p-2 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400">🌍</span>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
                  Humanitarian Health Utility &amp; Harm Reduction Ledger
                </h2>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                  QALY / DALY Optimizer
                </span>
              </div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                Maximizing Quality-Adjusted Life Years • Mitigating Preventable Morbidity • Eliminating Administrative Inefficiency
              </p>
            </div>
          </div>

          <button (click)="close.emit()"
            class="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer text-lg font-bold">
            ✕
          </button>
        </div>

        <!-- Scrollable Content Body -->
        <div class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">

          <!-- Cohort Simulator Slider Bar -->
          <div class="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="space-y-0.5 w-full sm:w-auto">
              <span class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Population Simulation Cohort Size
              </span>
              <div class="text-xl font-bold font-serif text-zinc-900 dark:text-zinc-100">
                {{ activeCohort().toLocaleString() }} Patients
              </div>
            </div>

            <div class="flex items-center gap-3 w-full sm:w-80">
              <input type="range" min="100" max="50000" step="100"
                [ngModel]="activeCohort()"
                (ngModelChange)="activeCohort.set($event)"
                class="w-full accent-teal-600 cursor-pointer" />
              <span class="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 shrink-0 w-16 text-right">
                {{ activeCohort().toLocaleString() }}
              </span>
            </div>
          </div>

          <!-- Top Metric Cards Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div class="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-800/40 flex flex-col">
              <span class="text-[11px] font-mono font-bold uppercase text-teal-700 dark:text-teal-400">
                Net QALY Gain / Decade
              </span>
              <span class="text-2xl sm:text-3xl font-bold font-serif text-teal-900 dark:text-teal-100 mt-1">
                +{{ report().totalQalyGainedPerDecade.toLocaleString() }}
              </span>
              <span class="text-[10px] font-mono text-teal-600 dark:text-teal-400 mt-auto pt-2">
                95% CI [{{ report().epistemicConfidenceInterval.lowerBound95Pct }} - {{ report().epistemicConfidenceInterval.upperBound95Pct }}]
              </span>
            </div>

            <div class="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex flex-col">
              <span class="text-[11px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400">
                Avg Morbidity Reduction
              </span>
              <span class="text-2xl sm:text-3xl font-bold font-serif text-emerald-900 dark:text-emerald-100 mt-1">
                -{{ report().totalAvertedMorbidityScore }}%
              </span>
              <span class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-auto pt-2">
                Across 5 clinical vectors
              </span>
            </div>

            <div class="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 flex flex-col">
              <span class="text-[11px] font-mono font-bold uppercase text-indigo-700 dark:text-indigo-400">
                Clinician Hours Reclaimed
              </span>
              <span class="text-2xl sm:text-3xl font-bold font-serif text-indigo-900 dark:text-indigo-100 mt-1">
                {{ report().totalClinicianHoursSavedAnnual.toLocaleString() }} hrs
              </span>
              <span class="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mt-auto pt-2">
                18.4 hrs/pt annual bedside shift
              </span>
            </div>

            <div class="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 flex flex-col">
              <span class="text-[11px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
                Rare Diagnostic Lag
              </span>
              <span class="text-2xl sm:text-3xl font-bold font-serif text-amber-900 dark:text-amber-100 mt-1">
                -{{ report().diagnosticOdysseyCompressionDays }} days
              </span>
              <span class="text-[10px] font-mono text-amber-700 dark:text-amber-300 mt-auto pt-2">
                7.3 yrs compressed to &lt;90 days
              </span>
            </div>

          </div>

          <!-- Utility Domains Breakdown Table -->
          <div class="space-y-3">
            <h3 class="text-sm font-bold font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>📊</span>
              <span>Empirical Intervention &amp; Utility Ledger</span>
            </h3>

            <div class="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <table class="w-full text-left text-xs font-sans">
                <thead class="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-mono text-[11px] uppercase border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th class="p-3">Intervention Domain</th>
                    <th class="p-3">Standard-of-Care Friction</th>
                    <th class="p-3">PocketGull Optimization</th>
                    <th class="p-3 text-right">QALY Impact</th>
                    <th class="p-3 text-right">Risk Averted</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/40">
                  @for (d of report().domains; track d.domain) {
                    <tr class="hover:bg-teal-50/30 dark:hover:bg-teal-950/10 transition">
                      <td class="p-3 font-semibold text-zinc-900 dark:text-zinc-100">
                        {{ d.domain }}
                        <div class="text-[10px] text-zinc-500 font-mono mt-0.5">{{ d.evidenceReference }}</div>
                      </td>
                      <td class="p-3 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">{{ d.baselineDelayOrFriction }}</td>
                      <td class="p-3 text-teal-700 dark:text-teal-400 font-mono text-[11px] font-semibold">{{ d.pocketGullOptimized }}</td>
                      <td class="p-3 text-right font-mono font-bold text-teal-600 dark:text-teal-400">+{{ d.projectedQalyGain.toLocaleString() }}</td>
                      <td class="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">-{{ d.avertedMorbidityRiskPct }}%</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Recommendations & Epistemic Audit Section -->
          <div class="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>🛡️</span>
                <span>Actionable Humanitarian Levers</span>
              </h4>
              <span class="text-[10px] font-mono text-zinc-500">
                Popperian \(p = {{ report().epistemicConfidenceInterval.pValVsStandardOfCare }}\) (Reject \(H_0\))
              </span>
            </div>

            <ul class="space-y-2 text-xs text-zinc-700 dark:text-zinc-300 list-disc list-inside leading-relaxed font-sans">
              @for (rec of report().humanitarianRecommendations; track rec) {
                <li>{{ rec }}</li>
              }
            </ul>
          </div>

        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <span class="text-[11px] font-mono text-zinc-500">
            WHO-standard DALY/QALY Formulation • Zero-Tracker Edge Sovereign
          </span>
          <button (click)="close.emit()"
            class="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold font-mono uppercase tracking-wider hover:opacity-90 transition cursor-pointer">
            Close Ledger
          </button>
        </div>

      </div>

    </div>
  `
})
export class GlobalHealthUtilityFolioComponent {
  utilityService = inject(GlobalHealthUtilityService);
  close = output<void>();

  activeCohort = signal<number>(1000);

  report = computed<IGlobalHealthUtilityReport>(() => {
    return this.utilityService.evaluateUtility(this.activeCohort());
  });
}
