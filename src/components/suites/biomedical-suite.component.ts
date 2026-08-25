import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { BiomarkerMatrixComponent } from '../biomarker-matrix.component';
import { PatientVitalsChartComponent } from '../patient-vitals-chart.component';

@Component({
  selector: 'app-biomedical-suite',
  standalone: true,
  imports: [CommonModule, BiomarkerMatrixComponent, PatientVitalsChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <span class="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xl font-bold">🧬</span>
          <div>
            <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Biomedical & Diagnostic Suite</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 font-mono font-bold uppercase">Ground Truth</span>
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">High-resolution lab biomarkers, vitals telemetry, and FHIR R4 observations.</p>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs font-mono">
          <span class="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            BP: <strong class="text-zinc-900 dark:text-zinc-100">{{ vitals().bp || '120/80' }}</strong>
          </span>
          <span class="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            HR: <strong class="text-zinc-900 dark:text-zinc-100">{{ vitals().hr || 72 }} bpm</strong>
          </span>
        </div>
      </div>

      <!-- Biomarker Matrix & Vitals Chart -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-4">
          <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">Lab Biomarkers & Target Thresholds</h4>
          <app-biomarker-matrix />
        </div>

        <div class="space-y-4">
          <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">Vitals Telemetry & Trend Analysis</h4>
          <app-patient-vitals-chart [history]="history()" />
        </div>
      </div>
    </div>
  `
})
export class BiomedicalSuiteComponent {
  private patientState = inject(PatientStateService);
  vitals = this.patientState.vitals;
  history = this.patientState.patientHistory;
}
