import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YbocsScreenerComponent } from '../ybocs-screener.component';
import { ClinicalAssessmentsSuiteComponent } from '../clinical-assessments-suite.component';
import { MultiParadigmVennComponent } from '../multi-paradigm-venn.component';
import { KaizenQualitySuiteComponent } from '../kaizen-quality-suite.component';
import { TeledentistrySystemicLensComponent } from './teledentistry-systemic-lens.component';

export type ScreenerSubTab = 'ybocs' | 'suite' | 'venn' | 'kaizen' | 'teledentistry' | 'suggestions';

@Component({
  selector: 'app-assessments-lens-tab',
  standalone: true,
  imports: [
    CommonModule,
    YbocsScreenerComponent,
    ClinicalAssessmentsSuiteComponent,
    MultiParadigmVennComponent,
    KaizenQualitySuiteComponent,
    TeledentistrySystemicLensComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full space-y-6">
      <!-- Screener Sub-Lens Tab Selection -->
      <div class="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 max-w-4xl overflow-x-auto">
        <button (click)="screenerTab.set('ybocs')"
          data-testid="tab-ybocs-screener"
          [class.bg-white]="screenerTab() === 'ybocs'"
          [class.dark:bg-zinc-800]="screenerTab() === 'ybocs'"
          [class.text-indigo-650]="screenerTab() === 'ybocs'"
          [class.dark:text-indigo-400]="screenerTab() === 'ybocs'"
          [class.text-zinc-500]="screenerTab() !== 'ybocs'"
          [class.shadow-xs]="screenerTab() === 'ybocs'"
          class="py-1.5 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer active:scale-95 border-0 whitespace-nowrap">
          ⚡ Y-BOCs OCD
        </button>
        <button (click)="screenerTab.set('suite')"
          data-testid="tab-clinical-suite"
          [class.bg-white]="screenerTab() === 'suite'"
          [class.dark:bg-zinc-800]="screenerTab() === 'suite'"
          [class.text-indigo-650]="screenerTab() === 'suite'"
          [class.dark:text-indigo-400]="screenerTab() === 'suite'"
          [class.text-zinc-500]="screenerTab() !== 'suite'"
          [class.shadow-xs]="screenerTab() === 'suite'"
          class="py-1.5 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer active:scale-95 border-0 whitespace-nowrap">
          📋 Clinical Suite
        </button>
        <button (click)="screenerTab.set('venn')"
          data-testid="tab-venn-matrix"
          [class.bg-white]="screenerTab() === 'venn'"
          [class.dark:bg-zinc-800]="screenerTab() === 'venn'"
          [class.text-indigo-650]="screenerTab() === 'venn'"
          [class.dark:text-indigo-400]="screenerTab() === 'venn'"
          [class.text-zinc-500]="screenerTab() !== 'venn'"
          [class.shadow-xs]="screenerTab() === 'venn'"
          class="py-1.5 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer active:scale-95 border-0 whitespace-nowrap">
          ⭕ Venn Consensus (W∩F∩E)
        </button>
        <button (click)="screenerTab.set('kaizen')"
          data-testid="tab-kaizen-suite"
          [class.bg-white]="screenerTab() === 'kaizen'"
          [class.dark:bg-zinc-800]="screenerTab() === 'kaizen'"
          [class.text-indigo-650]="screenerTab() === 'kaizen'"
          [class.dark:text-indigo-400]="screenerTab() === 'kaizen'"
          [class.text-zinc-500]="screenerTab() !== 'kaizen'"
          [class.shadow-xs]="screenerTab() === 'kaizen'"
          class="py-1.5 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer active:scale-95 border-0 whitespace-nowrap">
          📈 Kaizen Optimization (SPC/Pareto)
        </button>
        <button (click)="screenerTab.set('teledentistry')"
          data-testid="tab-teledentistry"
          [class.bg-white]="screenerTab() === 'teledentistry'"
          [class.dark:bg-zinc-800]="screenerTab() === 'teledentistry'"
          [class.text-indigo-650]="screenerTab() === 'teledentistry'"
          [class.dark:text-indigo-400]="screenerTab() === 'teledentistry'"
          [class.text-zinc-500]="screenerTab() !== 'teledentistry'"
          [class.shadow-xs]="screenerTab() === 'teledentistry'"
          class="py-1.5 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer active:scale-95 border-0 whitespace-nowrap">
          🦷 Teledentistry (32-Tooth)
        </button>
        <button (click)="screenerTab.set('suggestions')"
          [class.bg-white]="screenerTab() === 'suggestions'"
          [class.dark:bg-zinc-800]="screenerTab() === 'suggestions'"
          [class.text-indigo-650]="screenerTab() === 'suggestions'"
          [class.dark:text-indigo-400]="screenerTab() === 'suggestions'"
          [class.text-zinc-500]="screenerTab() !== 'suggestions'"
          [class.shadow-xs]="screenerTab() === 'suggestions'"
          class="py-1.5 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer active:scale-95 border-0 whitespace-nowrap">
          💡 Intake & Interviewing
        </button>
      </div>

      @if (screenerTab() === 'ybocs') {
        <div class="w-full">
          <app-ybocs-screener></app-ybocs-screener>
        </div>
      } @else if (screenerTab() === 'suite') {
        <div class="w-full">
          <app-clinical-assessments-suite></app-clinical-assessments-suite>
        </div>
      } @else if (screenerTab() === 'venn') {
        <div class="w-full">
          <app-multi-paradigm-venn></app-multi-paradigm-venn>
        </div>
      } @else if (screenerTab() === 'kaizen') {
        <div class="w-full">
          <app-kaizen-quality-suite></app-kaizen-quality-suite>
        </div>
      } @else if (screenerTab() === 'teledentistry') {
        <div class="w-full">
          <app-teledentistry-systemic-lens></app-teledentistry-systemic-lens>
        </div>
      } @else {
        <!-- Intake & Motivational interviewing Suggestions Panel -->
        <div class="w-full flex flex-col gap-5 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
          <div class="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <span class="text-lg">💡</span>
            <div>
              <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">Dynamic Motivational Interviewing & Clinical Probe Prompts</h4>
              <span class="text-[11px] font-mono text-zinc-500">Demographic & Diagnostic Symptom-Specific Questions</span>
            </div>
          </div>
          <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
            Review targeted open-ended questions designed to uncover root-cause environmental triggers, sleep architecture disruption, and circadian misalignments.
          </p>
        </div>
      }
    </div>
  `
})
export class AssessmentsLensTabComponent {
  screenerTab = signal<ScreenerSubTab>('ybocs');
}
