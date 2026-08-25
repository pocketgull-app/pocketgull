import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OsceTrainerService, IOsceScenario } from '../services/osce-trainer.service';

@Component({
  selector: 'app-residency-osce-simulator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-amber-500/30 rounded-2xl shadow-xl space-y-6 font-sans">
      <!-- Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-extrabold text-lg">
            🎓
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Residency & Medical Student OSCE Examination Trainer
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              Objective Structured Clinical Examination (OSCE) simulator with real-time AI board examiner scoring.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold font-mono">
            AMA PRA Category 1 CME Accredited
          </span>
        </div>
      </div>

      <!-- Case Scenario Selector Tabs -->
      <div class="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-950/80 rounded-xl border border-zinc-200 dark:border-zinc-800">
        @for (scenario of osce.scenarios(); track scenario.id) {
          <button
            (click)="osce.selectScenario(scenario.id)"
            [class.bg-amber-500]="osce.activeScenarioId() === scenario.id"
            [class.text-zinc-950]="osce.activeScenarioId() === scenario.id"
            [class.text-gray-700]="osce.activeScenarioId() !== scenario.id"
            [class.dark:text-zinc-300]="osce.activeScenarioId() !== scenario.id"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5">
            <span>📋</span>
            <span>{{ scenario.category }}</span>
          </button>
        }
      </div>

      <!-- Active Clinical Vignette Card -->
      @let active = osce.selectedScenario();
      <div class="p-4 bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4 font-mono text-xs">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
          <h4 class="font-bold text-gray-900 dark:text-gray-100 text-sm font-sans">{{ active.title }}</h4>
          <span class="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded font-mono text-[10px] font-bold">
            Level: {{ active.difficulty }}
          </span>
        </div>

        <div class="space-y-1 font-sans text-xs">
          <span class="font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider text-[10px]">Chief Complaint & History:</span>
          <p class="text-gray-800 dark:text-zinc-200 leading-relaxed bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
            "{{ active.chiefComplaint }}"
          </p>
        </div>

        <!-- Objective Vitals & Clinical Findings Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div class="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <span class="text-zinc-500 block text-[10px]">Heart Rate:</span>
            <span class="font-bold text-amber-500">{{ active.vitals.hr }}</span>
          </div>
          <div class="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <span class="text-zinc-500 block text-[10px]">Blood Pressure:</span>
            <span class="font-bold text-amber-500">{{ active.vitals.bp }}</span>
          </div>
          <div class="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <span class="text-zinc-500 block text-[10px]">SpO2 Saturation:</span>
            <span class="font-bold text-emerald-500">{{ active.vitals.spO2 }}</span>
          </div>
          <div class="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <span class="text-zinc-500 block text-[10px]">Body Temp:</span>
            <span class="font-bold text-zinc-300">{{ active.vitals.temp }}</span>
          </div>
        </div>

        <!-- Key Clinical Telemetry Findings -->
        <div class="space-y-1.5 font-sans">
          <span class="font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider text-[10px]">Key Physical & Lab Telemetry:</span>
          <ul class="space-y-1 text-xs text-zinc-300">
            @for (finding of active.keyClinicalFindings; track $index) {
              <li class="flex items-center gap-2 bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <span class="text-amber-400">🔍</span>
                <span>{{ finding }}</span>
              </li>
            }
          </ul>
        </div>
      </div>

      <!-- Candidate Evaluation Form -->
      <div class="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-4 text-xs font-sans">
        <h4 class="font-bold text-amber-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
          <span>✍️ Candidate Clinical Decision Input</span>
        </h4>

        <div class="space-y-3">
          <div>
            <label class="block font-bold text-zinc-300 mb-1 text-[11px]">
              1. Primary & Differential Diagnoses:
            </label>
            <textarea
              [value]="candidateDiagnosis()"
              (input)="candidateDiagnosis.set($any($event.target).value)"
              rows="2"
              placeholder="e.g. Stage II Periodontitis, Systemic Endothelial Strain, High CV Risk"
              class="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            ></textarea>
          </div>

          <div>
            <label class="block font-bold text-zinc-300 mb-1 text-[11px]">
              2. Proposed Diagnostic Labs & Clinical Orders:
            </label>
            <textarea
              [value]="candidateOrders()"
              (input)="candidateOrders.set($any($event.target).value)"
              rows="2"
              placeholder="e.g. hs-CRP panel, HbA1c screening, Periodontal SRP, Vagal HRV protocol"
              class="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            ></textarea>
          </div>

          <button
            (click)="submitAttempt()"
            class="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-lg shadow-amber-900/40 flex items-center gap-2">
            <span>🎓 Submit to AI Board Examiner</span>
          </button>
        </div>
      </div>

      <!-- Real-Time AI Examiner Scorecard & CME Feedback -->
      @if (osce.evaluationResult(); as result) {
        <div class="p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-amber-950/40 border border-amber-500/40 shadow-2xl space-y-4 animate-in fade-in duration-300">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/30 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🏛️</span>
              <div>
                <h4 class="font-bold text-amber-300 text-sm font-sans">AI Board Examiner Scorecard</h4>
                <span class="text-[10px] text-zinc-400 font-mono">AMA Category 1 CME Verification</span>
              </div>
            </div>

            <div class="px-3 py-1 rounded-full border text-xs font-bold font-mono"
              [class.bg-emerald-500\/20]="result.overallScore >= 65"
              [class.text-emerald-300]="result.overallScore >= 65"
              [class.border-emerald-500\/40]="result.overallScore >= 65"
              [class.bg-rose-500\/20]="result.overallScore < 65"
              [class.text-rose-300]="result.overallScore < 65"
              [class.border-rose-500\/40]="result.overallScore < 65">
              {{ result.status }}
            </div>
          </div>

          <!-- Score Metrics Breakdown -->
          <div class="grid grid-cols-3 gap-3 text-center font-mono">
            <div class="p-3 bg-zinc-950/80 rounded-xl border border-amber-500/30">
              <span class="text-[10px] text-zinc-400 block uppercase">Overall Score</span>
              <span class="text-2xl font-black text-amber-400">{{ result.overallScore }}%</span>
            </div>
            <div class="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
              <span class="text-[10px] text-zinc-400 block uppercase">Diagnostic Accuracy</span>
              <span class="text-xl font-bold text-emerald-400">{{ result.diagnosticAccuracyScore }}%</span>
            </div>
            <div class="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
              <span class="text-[10px] text-zinc-400 block uppercase">Patient Safety</span>
              <span class="text-xl font-bold text-cyan-400">{{ result.patientSafetyScore }}%</span>
            </div>
          </div>

          <!-- Detailed Examiner Feedback -->
          <div class="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-xs text-zinc-200 leading-relaxed font-sans italic">
            "{{ result.examinerFeedback }}"
          </div>
        </div>
      }
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class ResidencyOsceSimulatorComponent {
  readonly osce = inject(OsceTrainerService);

  readonly candidateDiagnosis = signal<string>('Generalized Stage II Periodontitis and Systemic Inflammatory Endothelial Strain');
  readonly candidateOrders = signal<string>('hs-CRP repeat panel, Periodontal scaling & root planing (SRP), HbA1c screening');

  submitAttempt() {
    this.osce.evaluateAttempt(this.candidateDiagnosis(), this.candidateOrders());
  }
}
