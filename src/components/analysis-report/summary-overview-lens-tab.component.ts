import { Component, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { ClinicalIntelligenceService } from '../../services/clinical-intelligence.service';
import { PocketGullBadgeComponent } from '../shared/pocket-gull-badge.component';
import { AiConfidenceHudComponent } from '../ai-confidence-hud.component';
import { PlanDifferentialInspectorComponent } from '../plan-differential-inspector.component';
import { GoalPlanningCardComponent } from '../goal-planning-card.component';
import { ResearchDataDividendComponent } from '../research-data-dividend.component';

@Component({
  selector: 'app-summary-overview-lens-tab',
  standalone: true,
  imports: [
    CommonModule, 
    PocketGullBadgeComponent, 
    AiConfidenceHudComponent, 
    PlanDifferentialInspectorComponent,
    GoalPlanningCardComponent,
    ResearchDataDividendComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 font-sans">
      
      <!-- Real-Time Cognitive Confidence Calibration HUD (DORA Trust in AI) -->
      <app-ai-confidence-hud [inputText]="reportText()"></app-ai-confidence-hud>

      <!-- Main Summary & Care Plan Container -->
      <div class="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4 font-sans">
        
        <!-- Section Header & View Mode Switcher -->
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">📊</span>
            <div>
              <h3 class="text-sm font-extrabold text-slate-900 dark:text-gray-100 uppercase tracking-wide">
                Visit Summary &amp; Strategic Care Plan
              </h3>
              <p class="text-xs text-slate-500 dark:text-zinc-400">
                Synthesized clinical assessment, primary risk indicators, and verifiable care pathway.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- View Mode Switcher: Standard Narrative vs Differential Review -->
            <div class="flex items-center p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-mono">
              <button type="button" (click)="activeViewMode.set('narrative')"
                      [class]="activeViewMode() === 'narrative' ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'"
                      class="px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1">
                <span>📋</span> Narrative
              </button>
              <button type="button" (click)="activeViewMode.set('differential')"
                      [class]="activeViewMode() === 'differential' ? 'bg-purple-600 text-white shadow-xs font-bold' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'"
                      class="px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1">
                <span>⚖️</span> Trust-Diff Inspector
              </button>
            </div>

            <pocket-gull-badge label="CLINICAL CDS" severity="info"></pocket-gull-badge>
          </div>
        </div>

        <!-- Mode A: Standard Overview Content Slot -->
        @if (activeViewMode() === 'narrative') {
          <div class="prose dark:prose-invert max-w-none text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
            <ng-content></ng-content>
          </div>
        }

        <!-- Mode B: Differential Review & Grounding Inspector -->
        @if (activeViewMode() === 'differential') {
          <div class="pt-2">
            <app-plan-differential-inspector></app-plan-differential-inspector>
          </div>
        }

      </div>

      <!-- Clinical SMART Goals & Quests Card -->
      <app-goal-planning-card class="block"></app-goal-planning-card>

      <!-- Research Data Dividend & Cohort Exchange Card -->
      <app-research-data-dividend class="block"></app-research-data-dividend>

    </div>
  `
})
export class SummaryOverviewLensTabComponent {
  readonly patientState = inject(PatientStateService);
  readonly intel = inject(ClinicalIntelligenceService);
  reportText = input<string>('');
  
  readonly activeViewMode = signal<'narrative' | 'differential'>('narrative');
}
