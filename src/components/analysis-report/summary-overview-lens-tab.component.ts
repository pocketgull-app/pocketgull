import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { ClinicalIntelligenceService } from '../../services/clinical-intelligence.service';
import { PocketGullBadgeComponent } from '../shared/pocket-gull-badge.component';

@Component({
  selector: 'app-summary-overview-lens-tab',
  standalone: true,
  imports: [CommonModule, PocketGullBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4 font-sans">
      <!-- Section Header -->
      <div class="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
        <div class="flex items-center gap-2">
          <span class="text-xl">📊</span>
          <div>
            <h3 class="text-sm font-extrabold text-slate-900 dark:text-gray-100 uppercase tracking-wide">
              Visit Summary Overview
            </h3>
            <p class="text-xs text-slate-500 dark:text-zinc-400">
              Synthesized clinical assessment, primary risk indicators, and strategic care plan.
            </p>
          </div>
        </div>
        <pocket-gull-badge label="CLINICAL CDS" severity="info"></pocket-gull-badge>
      </div>

      <!-- Overview Content Slot -->
      <div class="prose dark:prose-invert max-w-none text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class SummaryOverviewLensTabComponent {
  readonly patientState = inject(PatientStateService);
  readonly intel = inject(ClinicalIntelligenceService);
  reportText = input<string>('');
}
