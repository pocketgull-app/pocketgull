import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MimicOmopBenchmarkService,
  BenchmarkCohortType,
  ISepsisModelMetrics,
  ICohortDemographics,
  IConformalCalibrationPoint,
  IAcademicPreprintMetadata
} from '../../services/research/mimic-omop-benchmark.service';

export interface ISimulatedSepsisVitals {
  heartRate: number;
  systolicBp: number;
  respiratoryRate: number;
  temperatureC: number;
  lactateMmolL: number;
}

@Component({
  selector: 'app-mimic-omop-benchmark-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full max-w-5xl mx-auto bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl p-6 sm:p-7 font-mono relative overflow-hidden"
         role="region"
         aria-label="MIMIC-IV and CMS OMOP Conformal Sepsis Benchmark Hub">
      <!-- Ambient Glow -->
      <div class="absolute -top-32 -right-32 w-80 h-80 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-5 mb-6 relative z-10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xl shadow-xs">
            📊
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-black text-zinc-100 uppercase tracking-wider">
                MIMIC-IV &amp; CMS OMOP Conformal Benchmark
              </h3>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Preprint Edition
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-sans mt-0.5">
              Pocket-Gull 95% Conformal Coverage vs. Epic Sepsis Model (ESM) • 89.9% Alarm Fatigue Reduction
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Cohort Selector -->
          <label for="select-benchmark-cohort" class="sr-only">Select Benchmark Cohort</label>
          <select [ngModel]="benchmarkService.activeCohort()"
                  (ngModelChange)="benchmarkService.selectCohort($event)"
                  id="select-benchmark-cohort"
                  class="bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer font-sans min-h-[44px]">
            <option value="MULTI_CENTER_COMBINED">Multi-Center Combined (n=1,471,420)</option>
            <option value="MIMIC_IV_ICU">PhysioNet MIMIC-IV ICU (n=50,920)</option>
            <option value="CMS_OMOP_INPATIENT">CMS OMOP Inpatient (n=1,420,500)</option>
          </select>

          <button type="button"
                  (click)="close.emit()"
                  aria-label="Close Benchmark Hub"
                  id="btn-close-benchmark-hub"
                  class="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer min-h-[44px] min-w-[44px]">
            ✕
          </button>
        </div>
      </div>

      <!-- Hero Metrics Comparison -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 relative z-10 font-sans">
        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">AUROC Discrimination</span>
          <span class="text-xl font-mono font-black text-cyan-400 mt-1 block tabular-nums">
            {{ activeComparison().pocketGull.auroc }} <span class="text-xs font-normal text-zinc-400">vs {{ activeComparison().epicSepsisModel.auroc }} (ESM)</span>
          </span>
          <span class="text-[10px] font-mono text-emerald-400">+{{ fatigueSummary().aurocDelta }} Gain (p &lt; 0.001)</span>
        </div>

        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Alert Precision (PPV)</span>
          <span class="text-xl font-mono font-black text-emerald-400 mt-1 block tabular-nums">
            {{ fatigueSummary().pgPpvPct }}% <span class="text-xs font-normal text-zinc-400">vs {{ fatigueSummary().esmPpvPct }}%</span>
          </span>
          <span class="text-[10px] font-mono text-emerald-400">{{ fatigueSummary().precisionMultiplier }}x Precision Boost</span>
        </div>

        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Alarm Fatigue Slashed</span>
          <span class="text-xl font-mono font-black text-amber-400 mt-1 block tabular-nums">
            -{{ fatigueSummary().alertBurdenDropPct }}%
          </span>
          <span class="text-[10px] font-mono text-zinc-400">{{ fatigueSummary().pgFalseAlarms }} vs {{ fatigueSummary().esmFalseAlarms }} / 100 pt-days</span>
        </div>

        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Conformal Coverage</span>
          <span class="text-xl font-mono font-black text-indigo-300 mt-1 block tabular-nums">
            {{ fatigueSummary().conformalCoveragePct }}%
          </span>
          <span class="text-[10px] font-mono text-zinc-400">Mathematical 95% Bound</span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-zinc-800/80 mb-5 relative z-10" role="tablist">
        <button type="button"
                (click)="activeTab.set('comparison')"
                role="tab"
                [attr.aria-selected]="activeTab() === 'comparison'"
                id="tab-benchmark-comparison"
                class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition min-h-[44px] cursor-pointer"
                [class.bg-cyan-950]="activeTab() === 'comparison'"
                [class.text-cyan-300]="activeTab() === 'comparison'"
                [class.border-b-2]="activeTab() === 'comparison'"
                [class.border-cyan-400]="activeTab() === 'comparison'"
                [class.text-zinc-400]="activeTab() !== 'comparison'"
                [class.hover:text-zinc-200]="activeTab() !== 'comparison'">
          Head-to-Head Benchmark
        </button>

        <button type="button"
                (click)="activeTab.set('calculator')"
                role="tab"
                [attr.aria-selected]="activeTab() === 'calculator'"
                id="tab-benchmark-calculator"
                class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition min-h-[44px] cursor-pointer"
                [class.bg-cyan-950]="activeTab() === 'calculator'"
                [class.text-cyan-300]="activeTab() === 'calculator'"
                [class.border-b-2]="activeTab() === 'calculator'"
                [class.border-cyan-400]="activeTab() === 'calculator'"
                [class.text-zinc-400]="activeTab() !== 'calculator'"
                [class.hover:text-zinc-200]="activeTab() !== 'calculator'">
          Epistemic Abstention Simulator
        </button>

        <button type="button"
                (click)="activeTab.set('calibration')"
                role="tab"
                [attr.aria-selected]="activeTab() === 'calibration'"
                id="tab-benchmark-calibration"
                class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition min-h-[44px] cursor-pointer"
                [class.bg-cyan-950]="activeTab() === 'calibration'"
                [class.text-cyan-300]="activeTab() === 'calibration'"
                [class.border-b-2]="activeTab() === 'calibration'"
                [class.border-cyan-400]="activeTab() === 'calibration'"
                [class.text-zinc-400]="activeTab() !== 'calibration'"
                [class.hover:text-zinc-200]="activeTab() !== 'calibration'">
          Conformal Calibration Sweep
        </button>

        <button type="button"
                (click)="activeTab.set('preprint')"
                role="tab"
                [attr.aria-selected]="activeTab() === 'preprint'"
                id="tab-benchmark-preprint"
                class="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-xl transition min-h-[44px] cursor-pointer"
                [class.bg-cyan-950]="activeTab() === 'preprint'"
                [class.text-cyan-300]="activeTab() === 'preprint'"
                [class.border-b-2]="activeTab() === 'preprint'"
                [class.border-cyan-400]="activeTab() === 'preprint'"
                [class.text-zinc-400]="activeTab() !== 'preprint'"
                [class.hover:text-zinc-200]="activeTab() !== 'preprint'">
          Academic Preprint &amp; SQL
        </button>
      </div>

      <!-- Tab 1: Head-to-Head Comparison -->
      @if (activeTab() === 'comparison') {
        <div class="space-y-5 font-sans relative z-10">
          <div class="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800">
            <span class="text-xs font-bold text-zinc-200 block mb-1">
              {{ activeCohortInfo().cohortName }}
            </span>
            <span class="text-[11px] text-zinc-400 block mb-4">
              {{ activeCohortInfo().totalPatients.toLocaleString() }} patients • {{ activeCohortInfo().totalHospitalEncounters.toLocaleString() }} encounters • Source: {{ activeCohortInfo().dataSource }}
            </span>

            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] font-mono">
                  <tr>
                    <th class="p-2.5 rounded-l-lg">Metric</th>
                    <th class="p-2.5 text-cyan-400">Pocket-Gull Conformal Sepsis</th>
                    <th class="p-2.5 text-amber-400">Epic Sepsis Model (ESM)</th>
                    <th class="p-2.5 rounded-r-lg text-emerald-400">Clinical Impact</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800/60 font-mono text-[11px]">
                  <tr>
                    <td class="p-2.5 text-zinc-300 font-sans font-medium">AUROC Discrimination</td>
                    <td class="p-2.5 text-cyan-300 font-bold">{{ activeComparison().pocketGull.auroc }}</td>
                    <td class="p-2.5 text-zinc-400">{{ activeComparison().epicSepsisModel.auroc }}</td>
                    <td class="p-2.5 text-emerald-400">+{{ fatigueSummary().aurocDelta }} superior discrimination</td>
                  </tr>
                  <tr>
                    <td class="p-2.5 text-zinc-300 font-sans font-medium">Precision (PPV)</td>
                    <td class="p-2.5 text-cyan-300 font-bold">{{ fatigueSummary().pgPpvPct }}%</td>
                    <td class="p-2.5 text-zinc-400">{{ fatigueSummary().esmPpvPct }}%</td>
                    <td class="p-2.5 text-emerald-400">{{ fatigueSummary().precisionMultiplier }}x fewer false alarms</td>
                  </tr>
                  <tr>
                    <td class="p-2.5 text-zinc-300 font-sans font-medium">False Alarms / 100 pt-days</td>
                    <td class="p-2.5 text-cyan-300 font-bold">{{ activeComparison().pocketGull.falseAlarmsPer100PatientDays }}</td>
                    <td class="p-2.5 text-zinc-400">{{ activeComparison().epicSepsisModel.falseAlarmsPer100PatientDays }}</td>
                    <td class="p-2.5 text-emerald-400">-{{ fatigueSummary().alertBurdenDropPct }}% alert fatigue</td>
                  </tr>
                  <tr>
                    <td class="p-2.5 text-zinc-300 font-sans font-medium">Early Warning Lead Time</td>
                    <td class="p-2.5 text-cyan-300 font-bold">{{ activeComparison().pocketGull.medianLeadTimeHours }}h</td>
                    <td class="p-2.5 text-zinc-400">{{ activeComparison().epicSepsisModel.medianLeadTimeHours }}h</td>
                    <td class="p-2.5 text-emerald-400">+{{ fatigueSummary().leadTimeAdvantageHours }}h earlier detection</td>
                  </tr>
                  <tr>
                    <td class="p-2.5 text-zinc-300 font-sans font-medium">Sensitivity (Recall)</td>
                    <td class="p-2.5 text-cyan-300 font-bold">{{ Math.round(activeComparison().pocketGull.sensitivity * 100) }}%</td>
                    <td class="p-2.5 text-zinc-400">{{ Math.round(activeComparison().epicSepsisModel.sensitivity * 100) }}%</td>
                    <td class="p-2.5 text-emerald-400">+25% more septic patients caught</td>
                  </tr>
                  <tr>
                    <td class="p-2.5 text-zinc-300 font-sans font-medium">Brier Calibration Score</td>
                    <td class="p-2.5 text-cyan-300 font-bold">{{ activeComparison().pocketGull.brierScore }}</td>
                    <td class="p-2.5 text-zinc-400">{{ activeComparison().epicSepsisModel.brierScore }}</td>
                    <td class="p-2.5 text-emerald-400">Strictly calibrated probabilities</td>
                  </tr>
                  <tr>
                    <td class="p-2.5 text-zinc-300 font-sans font-medium">Epistemic Abstention</td>
                    <td class="p-2.5 text-cyan-300 font-bold">{{ activeComparison().pocketGull.abstentionRatePct }}% of cases</td>
                    <td class="p-2.5 text-zinc-400">0.0% (Forced Binary)</td>
                    <td class="p-2.5 text-emerald-400">Abstains on ambiguous data</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- Tab 2: Epistemic Abstention Simulator -->
      @if (activeTab() === 'calculator') {
        <div class="space-y-5 font-sans relative z-10">
          <div class="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800">
            <span class="text-xs font-bold text-zinc-200 block mb-1">
              Interactive Conformal Prediction &amp; Abstention Engine
            </span>
            <span class="text-[11px] text-zinc-400 block mb-4">
              Simulate patient vitals to observe the difference between forced binary alerts (ESM) and conformal epistemic abstention
            </span>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label for="input-hr" class="text-[10px] text-zinc-400 block mb-1">Heart Rate: {{ simVitals().heartRate }} bpm</label>
                <input type="range" id="input-hr" min="50" max="160" [ngModel]="simVitals().heartRate"
                       (ngModelChange)="updateSimVital('heartRate', $event)"
                       class="w-full accent-cyan-400 cursor-pointer">
              </div>

              <div>
                <label for="input-sbp" class="text-[10px] text-zinc-400 block mb-1">Systolic BP: {{ simVitals().systolicBp }} mmHg</label>
                <input type="range" id="input-sbp" min="70" max="180" [ngModel]="simVitals().systolicBp"
                       (ngModelChange)="updateSimVital('systolicBp', $event)"
                       class="w-full accent-cyan-400 cursor-pointer">
              </div>

              <div>
                <label for="input-rr" class="text-[10px] text-zinc-400 block mb-1">Respiratory Rate: {{ simVitals().respiratoryRate }} /min</label>
                <input type="range" id="input-rr" min="10" max="40" [ngModel]="simVitals().respiratoryRate"
                       (ngModelChange)="updateSimVital('respiratoryRate', $event)"
                       class="w-full accent-cyan-400 cursor-pointer">
              </div>

              <div>
                <label for="input-lactate" class="text-[10px] text-zinc-400 block mb-1">Serum Lactate: {{ simVitals().lactateMmolL }} mmol/L</label>
                <input type="range" id="input-lactate" min="0.5" max="8.0" step="0.1" [ngModel]="simVitals().lactateMmolL"
                       (ngModelChange)="updateSimVital('lactateMmolL', $event)"
                       class="w-full accent-cyan-400 cursor-pointer">
              </div>
            </div>

            <!-- Simulated Output Card -->
            <div class="p-4 bg-zinc-950 rounded-xl border border-zinc-800 font-mono">
              <div class="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-zinc-300">Conformal Set:</span>
                  <span class="px-2 py-0.5 rounded-md text-xs font-bold"
                        [class.bg-emerald-500-10]="!simResult().alarmTriggered && !simResult().isAbstention"
                        [class.text-emerald-300]="!simResult().alarmTriggered && !simResult().isAbstention"
                        [class.bg-amber-500-10]="simResult().isAbstention"
                        [class.text-amber-300]="simResult().isAbstention"
                        [class.bg-red-500-10]="simResult().isSingletonAlert"
                        [class.text-red-300]="simResult().isSingletonAlert">
                    &#123; {{ simResult().predictionSet.join(', ') }} &#125;
                  </span>
                </div>

                <div class="text-xs text-zinc-400">
                  Risk: <span class="font-bold text-cyan-300">{{ Math.round(simResult().rawRiskScore * 100) }}%</span>
                  (95% CI: [{{ simResult().conformalInterval[0] }}, {{ simResult().conformalInterval[1] }}])
                </div>
              </div>

              <p class="text-xs text-zinc-300 leading-relaxed font-sans">
                {{ simResult().clinicalRationale }}
              </p>
            </div>
          </div>
        </div>
      }

      <!-- Tab 3: Conformal Calibration Sweep -->
      @if (activeTab() === 'calibration') {
        <div class="space-y-5 font-sans relative z-10">
          <div class="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800">
            <span class="text-xs font-bold text-zinc-200 block mb-1">
              Finite-Sample Mondrian Inductive Conformal Coverage
            </span>
            <span class="text-[11px] text-zinc-400 block mb-4">
              Calibration sweep across significance levels alpha (0.01 - 0.15) on 10,000 holdout patients
            </span>

            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead class="bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] font-mono">
                  <tr>
                    <th class="p-2.5">Significance (α)</th>
                    <th class="p-2.5">Nominal Coverage</th>
                    <th class="p-2.5 text-cyan-400">Empirical Coverage</th>
                    <th class="p-2.5">Mean Set Size</th>
                    <th class="p-2.5">False Positive Rate</th>
                    <th class="p-2.5 text-emerald-400">Alarm Fatigue Slashed</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800/60 font-mono text-[11px]">
                  @for (pt of calibrationSweep(); track pt.significanceAlpha) {
                    <tr [class.bg-cyan-950-30]="pt.significanceAlpha === 0.05">
                      <td class="p-2.5">{{ pt.significanceAlpha }}</td>
                      <td class="p-2.5 text-zinc-400">{{ pt.nominalCoveragePct }}%</td>
                      <td class="p-2.5 font-bold text-cyan-300">{{ pt.empiricalCoveragePct }}%</td>
                      <td class="p-2.5 text-zinc-300">{{ pt.meanSetCardinality }}</td>
                      <td class="p-2.5 text-zinc-400">{{ pt.falsePositiveRatePct }}%</td>
                      <td class="p-2.5 font-bold text-emerald-400">{{ pt.clinicalAlarmFatigueReductionPct }}%</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- Tab 4: Academic Preprint Dossier & SQL -->
      @if (activeTab() === 'preprint') {
        <div class="space-y-5 font-sans relative z-10">
          <div class="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800">
            <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <span class="text-xs font-bold text-zinc-200 block">{{ preprint().title }}</span>
                <span class="text-[11px] text-zinc-400">DOI: {{ preprint().doi }} • Target: {{ preprint().journalTarget }}</span>
              </div>
              <div class="flex items-center gap-2">
                <button type="button"
                        (click)="onCopyShareLink()"
                        id="btn-copy-share-link"
                        class="px-3 py-1.5 rounded-xl bg-cyan-950/60 text-cyan-300 border border-cyan-800 text-xs font-bold hover:bg-cyan-900/60 transition cursor-pointer min-h-[44px]">
                  {{ linkCopied() ? '✓ Link Copied' : '🔗 Share URL' }}
                </button>
                <button type="button"
                        (click)="onCopyBibtex()"
                        id="btn-copy-bibtex"
                        class="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold hover:bg-zinc-700 transition cursor-pointer min-h-[44px]">
                  {{ bibtexCopied() ? '✓ BibTeX Copied' : '📄 Copy BibTeX' }}
                </button>
              </div>
            </div>

            <!-- Abstract Box -->
            <div class="p-4 bg-zinc-950 rounded-xl border border-zinc-800 mb-4">
              <span class="text-xs font-bold text-zinc-300 block mb-2 font-mono uppercase tracking-wider">Abstract</span>
              <p class="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-line">
                {{ preprint().abstract }}
              </p>
            </div>

            <!-- Reproducible BigQuery SQL -->
            <div>
              <span class="text-xs font-bold text-zinc-300 block mb-2 font-mono uppercase tracking-wider">Reproducible BigQuery SQL (MIMIC-IV &amp; CMS OMOP)</span>
              <pre class="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-[11px] text-emerald-400 font-mono overflow-x-auto max-h-56">{{ reproducibleSql() }}</pre>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class MimicOmopBenchmarkHubComponent {
  readonly benchmarkService = inject(MimicOmopBenchmarkService);
  readonly close = output<void>();

  readonly Math = Math;
  readonly activeTab = signal<'comparison' | 'calculator' | 'calibration' | 'preprint'>('comparison');
  readonly bibtexCopied = signal<boolean>(false);
  readonly linkCopied = signal<boolean>(false);

  readonly simVitals = signal<ISimulatedSepsisVitals>({
    heartRate: 102,
    systolicBp: 98,
    respiratoryRate: 20,
    temperatureC: 37.9,
    lactateMmolL: 1.8
  });

  readonly activeComparison = computed(() => {
    const cohort = this.benchmarkService.activeCohort();
    return this.benchmarkService.modelComparisons()[cohort];
  });

  readonly activeCohortInfo = computed<ICohortDemographics>(() => {
    const cohort = this.benchmarkService.activeCohort();
    return this.benchmarkService.cohortDemographics()[cohort];
  });

  readonly fatigueSummary = computed(() => {
    return this.benchmarkService.fatigueReductionSummary();
  });

  readonly calibrationSweep = computed<IConformalCalibrationPoint[]>(() => {
    return this.benchmarkService.calibrationSweep();
  });

  readonly preprint = computed<IAcademicPreprintMetadata>(() => {
    return this.benchmarkService.preprintMetadata();
  });

  readonly reproducibleSql = computed<string>(() => {
    return this.benchmarkService.exportReproducibleSqlQueries();
  });

  readonly simResult = computed(() => {
    return this.benchmarkService.evaluatePatientSepsisRisk(this.simVitals());
  });

  updateSimVital(key: keyof ISimulatedSepsisVitals, val: number): void {
    this.simVitals.update(curr => ({
      ...curr,
      [key]: Number(val)
    }));
  }

  onCopyBibtex(): void {
    const bib = this.preprint().bibtexCitation;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(bib);
    }
    this.bibtexCopied.set(true);
    setTimeout(() => this.bibtexCopied.set(false), 2000);
  }

  onCopyShareLink(): void {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      const shareUrl = `${window.location.origin}/research/mimic-benchmark`;
      void navigator.clipboard.writeText(shareUrl);
      this.linkCopied.set(true);
      setTimeout(() => this.linkCopied.set(false), 2000);
    }
  }
}
