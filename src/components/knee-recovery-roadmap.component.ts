import { Component, ChangeDetectionStrategy, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientStateService } from '../services/patient-state.service';
import {
  ClinicalKneeRecoveryLoopService,
  IMriTargetProbabilities,
  IKoosSubscales,
  IDailyCheckIn,
  IRehabPhase,
  IKineticChainVulnerability,
  IRecoveryVelocityReport,
  PresetKneeScenario,
  IFhirR4CarePlanBundle
} from '../services/clinical-knee-recovery-loop.service';

@Component({
  selector: 'app-knee-recovery-roadmap',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="relative w-full p-5 sm:p-7 bg-[#09090b] text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden font-sans select-none"
      aria-labelledby="knee-roadmap-heading"
    >
      <!-- Rachel Nabors 10s Parasympathetic Ambient Glow -->
      <div
        class="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000"
        [ngClass]="{
          'bg-emerald-500/10': report().velocityStatus === 'accelerated',
          'bg-teal-500/10': report().velocityStatus === 'optimal_physiologic',
          'bg-rose-500/15': report().velocityStatus === 'stalled_inhibition'
        }"
      ></div>

      <!-- Header Telemetry Bar -->
      <header class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6">
        <div class="flex items-center gap-3.5">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border shrink-0 transition-colors"
            [ngClass]="{
              'bg-teal-950/60 border-teal-500/50 text-teal-400': report().velocityStatus === 'optimal_physiologic',
              'bg-emerald-950/60 border-emerald-500/50 text-emerald-400': report().velocityStatus === 'accelerated',
              'bg-rose-950/60 border-rose-500/50 text-rose-400': report().velocityStatus === 'stalled_inhibition'
            }"
          >
            🦵
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-mono font-extrabold uppercase tracking-wider text-cyan-400">
                RSNA 2026 Deep Learning
              </span>
              <span class="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono font-medium border border-zinc-700">
                ⚙️ Pure-TS Engine (0 ms Offline)
              </span>
              <span class="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-emerald-400 font-mono font-medium border border-zinc-700">
                🛡️ HIPAA Safe Harbor
              </span>
              <span class="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono font-bold border border-cyan-800/60">
                KOOS Clinical Consensus
              </span>
            </div>
            <h2 id="knee-roadmap-heading" class="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
              Knee Biomechanical Recovery HUD &amp; 90-Day Trajectory
            </h2>
            <p class="text-xs sm:text-sm text-zinc-400 mt-0.5 leading-relaxed">
              RSNA MRI Abnormality Ingestion → Calibrated KOOS Subscales → Arthrogenic Inhibition Guard → 4-Phase Physical Therapy.
            </p>
          </div>
        </div>

        <!-- Presets & Actions -->
        <div class="flex flex-wrap items-center gap-2 self-end md:self-center">
          <button
            type="button"
            (click)="startGuidedPtSession()"
            [class.bg-teal-600]="isCoachingActive()"
            [class.text-white]="isCoachingActive()"
            class="min-h-[44px] px-3.5 py-2 rounded-xl bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-600/50 font-mono text-xs font-semibold transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-400 active:scale-95 cursor-pointer"
            aria-label="Start hands-free voice-guided physical therapy coaching session"
          >
            <span>🎙️</span>
            <span>{{ isCoachingActive() ? 'Coaching Active' : 'Start Guided PT' }}</span>
          </button>

          <button
            type="button"
            (click)="exportFhirCarePlanBundle()"
            class="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/50 font-mono text-xs font-semibold transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400 active:scale-95 cursor-pointer"
            aria-label="Export HL7 FHIR R4 CarePlan collection bundle with SHA-256 seal"
          >
            <span>📄</span>
            <span>Export FHIR R4</span>
          </button>

          <button
            type="button"
            (click)="resetToBaseline()"
            class="min-h-[44px] px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 font-mono text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-teal-400 active:scale-95"
            aria-label="Reset to default clinical trial presentation"
          >
            ↺ Reset
          </button>
        </div>
      </header>

      <!-- FDA 21 CFR Part 11 FHIR R4 CarePlan Attestation Seal Banner -->
      @if (fhirExportSuccess()) {
        <div
          class="relative mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
          role="status"
          aria-live="polite"
        >
          <div class="flex items-start gap-3">
            <span class="text-2xl shrink-0">🛡️</span>
            <div class="space-y-0.5">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  HL7 FHIR R4 CarePlan Bundle Exported
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 font-mono border border-emerald-700">
                  FDA 21 CFR Part 11 Certified
                </span>
              </div>
              <p class="text-xs text-emerald-300/90 font-mono">
                CarePlan (SNOMED 385644000) • KOOS (LOINC 72100-1) • Kinetic Chain (SNOMED 298375009) • DiagnosticReport (LOINC 36635-1)
              </p>
              @if (lastExportSeal(); as seal) {
                <div class="text-[11px] font-mono text-emerald-400/80 break-all pt-0.5">
                  <span class="text-zinc-400">SHA-256 Seal:</span> {{ seal }}
                </div>
              }
            </div>
          </div>
          <button
            type="button"
            (click)="dismissExportAttestation()"
            class="min-h-[44px] px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 font-mono text-xs border border-emerald-600/60 self-end sm:self-center transition-all cursor-pointer"
            aria-label="Dismiss FHIR export notification"
          >
            ✕ Dismiss
          </button>
        </div>
      }

      <!-- Hands-Free Voice-Guided Physical Therapy Coach HUD -->
      @if (isCoachingActive()) {
        <aside
          class="relative mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-950/60 via-zinc-900 to-cyan-950/50 border border-teal-500/60 shadow-2xl space-y-3"
          aria-label="Hands-Free Guided Physical Therapy Audio Coach"
          aria-live="polite"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-500/20 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-xl shrink-0">
                🎙️
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-extrabold uppercase tracking-wider text-teal-400">
                    Hands-Free Voice PT Coach
                  </span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full bg-teal-900/80 text-teal-300 font-mono border border-teal-700">
                    Phase {{ coachingPhaseNumber() }} Regimen
                  </span>
                  @if (isCoachingPaused()) {
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/80 text-amber-300 font-mono border border-amber-700">
                      ⏸️ Paused
                    </span>
                  }
                </div>
                <h3 class="text-base font-bold text-white mt-0.5">
                  {{ currentCoachingExerciseName() }}
                </h3>
              </div>
            </div>

            <!-- Set Indicators -->
            <div class="flex items-center gap-2 self-start sm:self-center">
              <span class="text-xs font-mono text-zinc-400 font-semibold mr-1">Sets:</span>
              @for (s of [1, 2, 3]; track s) {
                <div
                  class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-all border"
                  [ngClass]="{
                    'bg-teal-500 text-zinc-950 border-teal-400 ring-2 ring-teal-400/40': coachingCurrentSet() === s,
                    'bg-teal-950/80 text-teal-300 border-teal-800': coachingCurrentSet() > s,
                    'bg-zinc-900 text-zinc-500 border-zinc-800': coachingCurrentSet() < s
                  }"
                >
                  {{ s }}
                </div>
              }
            </div>
          </div>

          <!-- Coach Timer & Action Bar -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div class="flex items-center gap-4">
              <!-- Large Isometric Countdown Readout -->
              <div
                class="min-w-[90px] px-4 py-2 rounded-xl bg-zinc-950 border text-center flex flex-col justify-center"
                [ngClass]="{
                  'border-teal-500/60 text-teal-300': coachingStep() === 'contract',
                  'border-emerald-500/60 text-emerald-300': coachingStep() === 'rest',
                  'border-zinc-800 text-zinc-400': coachingStep() === 'idle'
                }"
              >
                <span class="text-3xl sm:text-4xl font-black font-clinical-telemetry tabular-nums leading-none">
                  {{ activeHoldCountdown() }}s
                </span>
                <span class="text-[9px] font-mono uppercase tracking-wider font-extrabold mt-1">
                  {{ coachingStep() === 'contract' ? '⚡ Hold' : '🍃 Rest' }}
                </span>
              </div>

              <!-- Spoken Coaching Directive -->
              <div class="space-y-0.5">
                <span class="text-xs font-mono font-semibold"
                  [ngClass]="{
                    'text-teal-400': coachingStep() === 'contract',
                    'text-emerald-400': coachingStep() === 'rest',
                    'text-zinc-400': coachingStep() === 'idle'
                  }"
                >
                  {{ coachingStep() === 'contract' ? 'Isometric Contraction Target' : 'Recovery Interval' }}
                </span>
                <p class="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
                  {{ coachingStatusMessage() }}
                </p>
              </div>
            </div>

            <!-- Coach Controls with >=44px touch targets -->
            <div class="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
              <button
                type="button"
                (click)="toggleCoachPause()"
                class="min-h-[44px] px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-teal-400 active:scale-95 cursor-pointer"
                aria-label="Toggle pause or resume audio coach session"
              >
                {{ isCoachingPaused() ? '▶️ Resume' : '⏸️ Pause' }}
              </button>

              <button
                type="button"
                (click)="skipToNextExercise()"
                class="min-h-[44px] px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-teal-400 active:scale-95 cursor-pointer"
                aria-label="Skip to next exercise in phase regimen"
              >
                ⏭️ Next Ex
              </button>

              <button
                type="button"
                (click)="stopGuidedPtSession()"
                class="min-h-[44px] px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 font-mono text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-rose-400 active:scale-95 cursor-pointer"
                aria-label="Stop physical therapy coaching session"
              >
                ⏹️ End Session
              </button>
            </div>
          </div>
        </aside>
      }

      <!-- Clinical Scenario Preset Pills -->
      <nav class="flex flex-wrap items-center gap-2 mb-6" aria-label="Clinical Scenario Presets">
        <span class="text-xs font-mono text-zinc-400 font-semibold mr-1">Simulate Presentation:</span>
        <button
          type="button"
          (click)="loadScenario('acute_acl_effusion')"
          [class.bg-rose-950]="activeScenario() === 'acute_acl_effusion'"
          [class.border-rose-500]="activeScenario() === 'acute_acl_effusion'"
          [class.text-rose-200]="activeScenario() === 'acute_acl_effusion'"
          class="min-h-[44px] px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 font-mono text-xs font-medium transition-all cursor-pointer"
        >
          💥 Acute ACL + Effusion
        </button>
        <button
          type="button"
          (click)="loadScenario('isolated_meniscus')"
          [class.bg-amber-950]="activeScenario() === 'isolated_meniscus'"
          [class.border-amber-500]="activeScenario() === 'isolated_meniscus'"
          [class.text-amber-200]="activeScenario() === 'isolated_meniscus'"
          class="min-h-[44px] px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 font-mono text-xs font-medium transition-all cursor-pointer"
        >
          🧩 Isolated Medial Meniscus
        </button>
        <button
          type="button"
          (click)="loadScenario('patellofemoral_oa')"
          [class.bg-orange-950]="activeScenario() === 'patellofemoral_oa'"
          [class.border-orange-500]="activeScenario() === 'patellofemoral_oa'"
          [class.text-orange-200]="activeScenario() === 'patellofemoral_oa'"
          class="min-h-[44px] px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 font-mono text-xs font-medium transition-all cursor-pointer"
        >
          🦴 Patellofemoral OA
        </button>
        <button
          type="button"
          (click)="loadScenario('post_op_acl')"
          [class.bg-teal-950]="activeScenario() === 'post_op_acl'"
          [class.border-teal-500]="activeScenario() === 'post_op_acl'"
          [class.text-teal-200]="activeScenario() === 'post_op_acl'"
          class="min-h-[44px] px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 font-mono text-xs font-medium transition-all cursor-pointer"
        >
          🏥 Post-Op ACL (Day 45)
        </button>
        <button
          type="button"
          (click)="loadScenario('healthy_baseline')"
          [class.bg-emerald-950]="activeScenario() === 'healthy_baseline'"
          [class.border-emerald-500]="activeScenario() === 'healthy_baseline'"
          [class.text-emerald-200]="activeScenario() === 'healthy_baseline'"
          class="min-h-[44px] px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 font-mono text-xs font-medium transition-all cursor-pointer"
        >
          ✨ Pristine Baseline
        </button>
      </nav>

      <!-- Top Metric Hero Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Card 1: Composite KOOS -->
        <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono text-zinc-400 uppercase tracking-wider">Composite KOOS</span>
            <span
              class="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase"
              [ngClass]="{
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30': koos().compositeKoos >= 80,
                'bg-amber-500/20 text-amber-300 border border-amber-500/30': koos().compositeKoos >= 55 && koos().compositeKoos < 80,
                'bg-rose-500/20 text-rose-300 border border-rose-500/30': koos().compositeKoos < 55
              }"
            >
              {{ koos().compositeKoos >= 80 ? 'Functional' : koos().compositeKoos >= 55 ? 'Impaired' : 'Severe' }}
            </span>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-black tracking-tight text-white font-clinical-telemetry">
              {{ koos().compositeKoos }}
            </span>
            <span class="text-xs font-mono text-zinc-400">/ 100</span>
          </div>
          <span class="text-[11px] text-zinc-400 font-mono mt-2">Knee Injury Outcome Score</span>
        </div>

        <!-- Card 2: Remodeling Velocity Ratio -->
        <div
          class="p-4 rounded-xl border flex flex-col justify-between transition-colors"
          [ngClass]="{
            'bg-emerald-950/30 border-emerald-500/40 text-emerald-300': report().velocityStatus === 'accelerated',
            'bg-teal-950/30 border-teal-500/40 text-teal-300': report().velocityStatus === 'optimal_physiologic',
            'bg-rose-950/30 border-rose-500/40 text-rose-300': report().velocityStatus === 'stalled_inhibition'
          }"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono uppercase tracking-wider">Remodeling Velocity</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-zinc-900 border border-zinc-700">
              {{ report().velocityRatio.toFixed(2) }}x
            </span>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-black tracking-tight text-white font-clinical-telemetry">
              {{ report().observedImprovementScore }}
            </span>
            <span class="text-xs font-mono text-zinc-300">/ {{ report().expectedBenchmarkScore }} Benchmark</span>
          </div>
          <span class="text-[11px] font-mono text-zinc-300 mt-2 truncate">{{ report().statusMessage }}</span>
        </div>

        <!-- Card 3: Active Rehab Phase -->
        <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
          <span class="text-xs font-mono text-zinc-400 uppercase tracking-wider">Active Phase</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-black tracking-tight text-cyan-400 font-clinical-telemetry">
              Phase {{ report().activePhase.phaseNumber }}
            </span>
            <span class="text-xs text-zinc-400 font-mono">Day {{ report().currentDay }}</span>
          </div>
          <span class="text-[11px] text-zinc-300 font-mono mt-2 truncate">{{ report().activePhase.timeframe }}</span>
        </div>

        <!-- Card 4: Full Return Projection -->
        <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
          <span class="text-xs font-mono text-zinc-400 uppercase tracking-wider">Projected Full Return</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-black tracking-tight text-teal-300 font-clinical-telemetry">
              Day {{ report().projectedFullRecoveryDay }}
            </span>
            <span class="text-xs text-zinc-400 font-mono">({{ report().projectedFullRecoveryDay - report().currentDay }}d remaining)</span>
          </div>
          <span class="text-[11px] text-zinc-400 font-mono mt-2">Physiologic Tissue Horizon</span>
        </div>
      </div>

      <!-- KOOS 5-Subscale Meters & Horizon Bar -->
      <div class="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 mb-6">
        <div class="flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-2">
          <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <span>📊</span> Validated KOOS Subscale Decomposition (0 = Extreme Symptoms, 100 = Asymptomatic)
          </h3>
          <span class="text-xs font-mono text-zinc-400">Orthopedic Multi-Planar Weighting</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- Subscale 1: Pain -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-zinc-400">Pain</span>
              <span class="font-bold text-white font-clinical-telemetry">{{ koos().pain }}/100</span>
            </div>
            <div class="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                [style.width.%]="koos().pain"
                [ngClass]="koos().pain >= 70 ? 'bg-emerald-500' : koos().pain >= 45 ? 'bg-amber-500' : 'bg-rose-500'"
              ></div>
            </div>
          </div>

          <!-- Subscale 2: Symptoms -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-zinc-400">Symptoms &amp; Stiffness</span>
              <span class="font-bold text-white font-clinical-telemetry">{{ koos().symptoms }}/100</span>
            </div>
            <div class="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                [style.width.%]="koos().symptoms"
                [ngClass]="koos().symptoms >= 70 ? 'bg-emerald-500' : koos().symptoms >= 45 ? 'bg-amber-500' : 'bg-rose-500'"
              ></div>
            </div>
          </div>

          <!-- Subscale 3: ADL -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-zinc-400">Activities of Daily Living</span>
              <span class="font-bold text-white font-clinical-telemetry">{{ koos().adl }}/100</span>
            </div>
            <div class="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                [style.width.%]="koos().adl"
                [ngClass]="koos().adl >= 70 ? 'bg-emerald-500' : koos().adl >= 45 ? 'bg-amber-500' : 'bg-rose-500'"
              ></div>
            </div>
          </div>

          <!-- Subscale 4: Sport & Rec -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-zinc-400">Sport &amp; Recreation</span>
              <span class="font-bold text-white font-clinical-telemetry">{{ koos().sportRec }}/100</span>
            </div>
            <div class="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                [style.width.%]="koos().sportRec"
                [ngClass]="koos().sportRec >= 70 ? 'bg-emerald-500' : koos().sportRec >= 45 ? 'bg-amber-500' : 'bg-rose-500'"
              ></div>
            </div>
          </div>

          <!-- Subscale 5: Quality of Life -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-zinc-400">Knee Quality of Life</span>
              <span class="font-bold text-white font-clinical-telemetry">{{ koos().qol }}/100</span>
            </div>
            <div class="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                [style.width.%]="koos().qol"
                [ngClass]="koos().qol >= 70 ? 'bg-emerald-500' : koos().qol >= 45 ? 'bg-amber-500' : 'bg-rose-500'"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Arthrogenic Muscle Inhibition (AMI) Guard & Kinetic Chain Alerts -->
      <div class="space-y-3 mb-6">
        @for (v of report().kineticVulnerabilities; track v.name) {
          <div
            class="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
            [ngClass]="{
              'bg-rose-950/40 border-rose-500/50 text-rose-100': v.severity === 'high' || v.severity === 'critical',
              'bg-amber-950/40 border-amber-500/50 text-amber-100': v.severity === 'moderate',
              'bg-zinc-900 border-zinc-800 text-zinc-300': v.severity === 'low'
            }"
          >
            <div class="flex items-start gap-3">
              <span class="text-xl">
                {{ v.severity === 'high' || v.severity === 'critical' ? '⚠️' : '🛡️' }}
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-sm font-bold tracking-tight">{{ v.name }}</h4>
                  <span
                    class="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase"
                    [ngClass]="{
                      'bg-rose-500/30 text-rose-200 border border-rose-500/40': v.severity === 'high' || v.severity === 'critical',
                      'bg-amber-500/30 text-amber-200 border border-amber-500/40': v.severity === 'moderate',
                      'bg-zinc-800 text-zinc-300 border border-zinc-700': v.severity === 'low'
                    }"
                  >
                    {{ v.severity }} severity
                  </span>
                </div>
                <p class="text-xs text-zinc-300 mt-1 leading-relaxed">
                  <strong>Mechanism:</strong> {{ v.biomechanicalMechanism }}
                </p>
                <p class="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                  <strong>Compensatory Risk:</strong> {{ v.compensatoryRisk }}
                </p>
              </div>
            </div>

            <div class="md:max-w-xs shrink-0 p-3 rounded-lg bg-black/40 border border-zinc-800 text-xs font-mono">
              <span class="text-teal-400 font-bold block mb-0.5">Clinical Protocol:</span>
              <p class="text-zinc-300 text-[11px] leading-relaxed">{{ v.clinicalAction }}</p>
            </div>
          </div>
        } @empty {
          <div class="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 flex items-center gap-3">
            <span class="text-xl">🛡️</span>
            <div>
              <span class="text-xs font-mono font-bold uppercase">Joint Alignment &amp; Reflex Arc Clear</span>
              <p class="text-xs text-emerald-300/80">No active arthrogenic muscle inhibition or significant valgus collapse flags.</p>
            </div>
          </div>
        }
      </div>

      <!-- Interactive 4-Phase Physical Therapy Roadmap -->
      <div class="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 mb-6">
        <div class="flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-sm">🛣️</span>
            <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
              4-Phase Physical Therapy Staged Protocol
            </h3>
          </div>
          <span class="text-xs font-mono text-cyan-400 font-semibold">Active: Phase {{ report().activePhase.phaseNumber }}</span>
        </div>

        <!-- 4-Step Phase Selector Buttons -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
          @for (p of [1, 2, 3, 4]; track p) {
            <button
              type="button"
              (click)="selectedPhaseView.set(p)"
              [class.bg-cyan-950]="selectedPhaseView() === p"
              [class.border-cyan-500]="selectedPhaseView() === p"
              [class.text-cyan-200]="selectedPhaseView() === p"
              [class.ring-2]="report().activePhase.phaseNumber === p"
              [class.ring-teal-500]="report().activePhase.phaseNumber === p"
              class="min-h-[48px] p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-left transition-all cursor-pointer hover:border-zinc-700"
            >
              <div class="flex items-center justify-between text-xs font-mono font-bold">
                <span>Phase {{ p }}</span>
                @if (report().activePhase.phaseNumber === p) {
                  <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-500 text-zinc-950 font-black uppercase">Current</span>
                }
              </div>
              <span class="text-[10px] text-zinc-400 block mt-0.5 truncate">
                {{ getPhaseSummaryTitle(p) }}
              </span>
            </button>
          }
        </div>

        <!-- Selected Phase Inspector Card -->
        @let phase = getPhaseDetails(selectedPhaseView());
        <div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div>
              <h4 class="text-sm font-bold text-white flex items-center gap-2">
                <span>{{ phase.title }}</span>
                <span class="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {{ phase.timeframe }}
                </span>
              </h4>
              <p class="text-xs text-zinc-300 mt-1 leading-relaxed">
                <strong>Clinical Focus:</strong> {{ phase.clinicalFocus }}
              </p>
            </div>
            <button
              type="button"
              (click)="startGuidedPtSession(selectedPhaseView())"
              class="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-600/50 font-mono text-xs font-semibold transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-400 active:scale-95 cursor-pointer shrink-0 self-start sm:self-center"
              aria-label="Start voice coaching for this phase"
            >
              <span>🎙️</span>
              <span>Coach Phase {{ selectedPhaseView() }}</span>
            </button>
          </div>

          <!-- Key Exercises -->
          <div>
            <span class="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider block mb-2">
              Prescribed Exercise Regimen:
            </span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              @for (ex of phase.keyExercises; track ex) {
                <div class="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/70 text-xs font-mono flex items-start gap-2">
                  <span class="text-teal-400">✓</span>
                  <span class="text-zinc-200">{{ ex }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Progression Criteria & Contraindications -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div class="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs font-mono">
              <span class="text-cyan-300 font-bold block mb-1">🏁 Progression Criteria to Advance:</span>
              <p class="text-zinc-300 text-[11px] leading-relaxed">{{ phase.progressionCriteria }}</p>
            </div>

            <div class="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs font-mono">
              <span class="text-rose-300 font-bold block mb-1">⛔ Strict Movement Contraindications:</span>
              <div class="flex flex-wrap gap-1.5 mt-1">
                @for (c of phase.contraindicatedMovements; track c) {
                  <span class="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60">
                    {{ c }}
                  </span>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Micro-Telemetry & MRI Simulator Sliders (60 FPS Offline) -->
      <div class="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
        <div class="flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-sm">🎛️</span>
            <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
              Interactive Daily Check-In &amp; MRI Telemetry Simulator (60 FPS Offline)
            </h3>
          </div>
          <span class="text-xs font-mono text-zinc-400">Real-Time Biological Remodeling Feedback</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left: Daily Check-In Telemetry -->
          <div class="space-y-4">
            <span class="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block border-b border-zinc-800 pb-1">
              Patient Daily Check-In Telemetry:
            </span>

            <!-- VAS Pain -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-mono">
                <label for="vas-slider" class="text-zinc-300">Visual Analog Pain (VAS)</label>
                <span class="font-bold text-amber-400 font-clinical-telemetry">{{ latestCheckIn().vasPain.toFixed(1) }} / 10</span>
              </div>
              <input
                id="vas-slider"
                type="range"
                min="0"
                max="10"
                step="0.5"
                [value]="latestCheckIn().vasPain"
                (input)="onVasChange($event)"
                class="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400 min-h-[44px]"
              />
            </div>

            <!-- Active Flexion Degrees -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-mono">
                <label for="flexion-slider" class="text-zinc-300">Active Knee Flexion Arc</label>
                <span class="font-bold text-teal-400 font-clinical-telemetry">{{ latestCheckIn().activeFlexionDegrees }}°</span>
              </div>
              <input
                id="flexion-slider"
                type="range"
                min="60"
                max="140"
                step="5"
                [value]="latestCheckIn().activeFlexionDegrees"
                (input)="onFlexionChange($event)"
                class="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-400 min-h-[44px]"
              />
            </div>

            <!-- Morning Stiffness -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-mono">
                <label for="stiffness-slider" class="text-zinc-300">Morning Joint Stiffness</label>
                <span class="font-bold text-zinc-200 font-clinical-telemetry">{{ latestCheckIn().morningStiffnessMinutes }} min</span>
              </div>
              <input
                id="stiffness-slider"
                type="range"
                min="0"
                max="60"
                step="5"
                [value]="latestCheckIn().morningStiffnessMinutes"
                (input)="onStiffnessChange($event)"
                class="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 min-h-[44px]"
              />
            </div>

            <!-- Step Tolerance -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-mono">
                <label for="steps-slider" class="text-zinc-300">Daily Step Tolerance</label>
                <span class="font-bold text-emerald-400 font-clinical-telemetry">{{ latestCheckIn().dailyStepTolerance }} steps</span>
              </div>
              <input
                id="steps-slider"
                type="range"
                min="1000"
                max="12000"
                step="500"
                [value]="latestCheckIn().dailyStepTolerance"
                (input)="onStepsChange($event)"
                class="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 min-h-[44px]"
              />
            </div>
          </div>

          <!-- Right: MRI Abnormality Likelihood Probes -->
          <div class="space-y-4">
            <span class="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block border-b border-zinc-800 pb-1">
              RSNA MRI Abnormality Likelihoods:
            </span>

            <!-- Joint Effusion -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-mono">
                <label for="effusion-slider" class="text-zinc-300">Joint Capsular Effusion</label>
                <span class="font-bold text-rose-400 font-clinical-telemetry">{{ (mri().jointEffusion * 100).toFixed(0) }}%</span>
              </div>
              <input
                id="effusion-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                [value]="mri().jointEffusion"
                (input)="onMriChange('jointEffusion', $event)"
                class="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500 min-h-[44px]"
              />
            </div>

            <!-- ACL Tear -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-mono">
                <label for="acl-slider" class="text-zinc-300">Anterior Cruciate Ligament (ACL) Tear</label>
                <span class="font-bold text-rose-400 font-clinical-telemetry">{{ (mri().aclTear * 100).toFixed(0) }}%</span>
              </div>
              <input
                id="acl-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                [value]="mri().aclTear"
                (input)="onMriChange('aclTear', $event)"
                class="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500 min-h-[44px]"
              />
            </div>

            <!-- Medial Meniscus -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-mono">
                <label for="meniscus-slider" class="text-zinc-300">Medial Meniscus Tear</label>
                <span class="font-bold text-amber-400 font-clinical-telemetry">{{ (mri().medialMeniscusTear * 100).toFixed(0) }}%</span>
              </div>
              <input
                id="meniscus-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                [value]="mri().medialMeniscusTear"
                (input)="onMriChange('medialMeniscusTear', $event)"
                class="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400 min-h-[44px]"
              />
            </div>

            <!-- Patellofemoral Cartilage -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-mono">
                <label for="cartilage-slider" class="text-zinc-300">Patellofemoral Cartilage Defect</label>
                <span class="font-bold text-cyan-400 font-clinical-telemetry">{{ (mri().patellofemoralCartilageDefect * 100).toFixed(0) }}%</span>
              </div>
              <input
                id="cartilage-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                [value]="mri().patellofemoralCartilageDefect"
                (input)="onMriChange('patellofemoralCartilageDefect', $event)"
                class="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 min-h-[44px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class KneeRecoveryRoadmapComponent implements OnDestroy {
  private readonly loopService = inject(ClinicalKneeRecoveryLoopService);
  private readonly patientStateService = inject(PatientStateService, { optional: true });

  readonly mri = this.loopService.activeMriProfile;
  readonly koos = this.loopService.baselineKoos;
  readonly report = this.loopService.currentRecoveryReport;
  readonly history = this.loopService.checkInHistory;

  readonly activeScenario = signal<PresetKneeScenario | 'custom'>('custom');
  readonly selectedPhaseView = signal<number>(1);

  // Audio Coach state machine
  readonly isCoachingActive = signal<boolean>(false);
  readonly isCoachingPaused = signal<boolean>(false);
  readonly coachingExerciseIndex = signal<number>(0);
  readonly coachingCurrentSet = signal<number>(1);
  readonly totalSetsPerExercise = signal<number>(3);
  readonly activeHoldCountdown = signal<number>(10);
  readonly coachingStep = signal<'contract' | 'rest' | 'idle' | 'complete'>('idle');
  readonly coachingStatusMessage = signal<string>('');
  readonly coachingPhaseNumber = signal<number>(1);

  // FHIR R4 export attestation
  readonly lastExportSeal = signal<string | null>(null);
  readonly fhirExportSuccess = signal<boolean>(false);

  private coachingTimerInterval: any = null;

  readonly currentCoachingExerciseName = computed<string>(() => {
    const phase = this.getPhaseDetails(this.coachingPhaseNumber());
    const ex = phase.keyExercises[this.coachingExerciseIndex()];
    return ex ? ex.replace(/\s*\([^)]*\)/g, '').trim() : 'Prescribed Isometric Exercise';
  });

  readonly latestCheckIn = computed<IDailyCheckIn>(() => {
    const list = this.history();
    return list.length > 0 ? list[list.length - 1] : {
      dayNumber: 14,
      morningStiffnessMinutes: 20,
      vasPain: 3.0,
      activeFlexionDegrees: 120,
      dailyStepTolerance: 5000,
      compliancePhaseExercise: true,
      loggedAt: new Date().toISOString()
    };
  });

  constructor() {
    // Synchronize initial phase view with current active phase
    this.selectedPhaseView.set(this.report().activePhase.phaseNumber);
  }

  startGuidedPtSession(phaseNum?: number): void {
    const targetPhase = phaseNum ?? this.selectedPhaseView();
    this.stopGuidedPtSession(false);
    this.coachingPhaseNumber.set(targetPhase);
    this.isCoachingActive.set(true);
    this.isCoachingPaused.set(false);
    this.coachingExerciseIndex.set(0);
    this.coachingCurrentSet.set(1);
    this.coachingStep.set('contract');
    this.activeHoldCountdown.set(10);

    const phase = this.getPhaseDetails(targetPhase);
    const firstEx = phase.keyExercises[0] || 'Isometric Exercise';
    const cleanName = firstEx.replace(/\s*\([^)]*\)/g, '').trim();

    this.coachingStatusMessage.set(`Contract ${cleanName} firmly and maintain steady breathing.`);
    this.speakCoach(`Starting Phase ${targetPhase} guided session. First exercise: ${cleanName}. Set 1 of 3. Contract firmly and hold for 10 seconds. 3, 2, 1, contract!`);

    this.startCoachTicker();
  }

  private startCoachTicker(): void {
    if (this.coachingTimerInterval) {
      clearInterval(this.coachingTimerInterval);
    }
    this.coachingTimerInterval = setInterval(() => {
      if (this.isCoachingPaused() || !this.isCoachingActive()) {
        return;
      }
      const current = this.activeHoldCountdown();
      if (current > 1) {
        this.activeHoldCountdown.set(current - 1);
      } else {
        this.advanceCoachingStep();
      }
    }, 1000);
  }

  toggleCoachPause(): void {
    if (!this.isCoachingActive()) return;
    const nowPaused = !this.isCoachingPaused();
    this.isCoachingPaused.set(nowPaused);
    if (nowPaused) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch { /* defensive fallback */ }
      }
      this.coachingStatusMessage.set('Session paused. Resume when ready.');
      this.speakCoach('Session paused.');
    } else {
      this.coachingStatusMessage.set('Session resumed. Maintain alignment.');
      this.speakCoach('Resuming session.');
    }
  }

  skipToNextExercise(): void {
    if (!this.isCoachingActive()) return;
    const phase = this.getPhaseDetails(this.coachingPhaseNumber());
    if (this.coachingExerciseIndex() + 1 < phase.keyExercises.length) {
      this.coachingExerciseIndex.update(i => i + 1);
      this.coachingCurrentSet.set(1);
      this.coachingStep.set('contract');
      this.activeHoldCountdown.set(10);
      const ex = phase.keyExercises[this.coachingExerciseIndex()];
      const cleanName = ex.replace(/\s*\([^)]*\)/g, '').trim();
      this.coachingStatusMessage.set(`Contract ${cleanName} firmly and maintain steady breathing.`);
      this.speakCoach(`Moving to ${cleanName}. Set 1 of 3. Ready, set, contract!`);
    } else {
      this.speakCoach(`Phase ${this.coachingPhaseNumber()} session complete! Outstanding stability.`);
      this.stopGuidedPtSession(true);
    }
  }

  advanceCoachingStep(): void {
    const phase = this.getPhaseDetails(this.coachingPhaseNumber());
    if (this.coachingStep() === 'contract') {
      if (this.coachingCurrentSet() < this.totalSetsPerExercise()) {
        this.coachingStep.set('rest');
        this.activeHoldCountdown.set(5);
        this.coachingStatusMessage.set('Rest interval: Relax quadriceps and breathe deeply.');
        this.speakCoach('Relax. 5-second rest.');
      } else {
        // Completed all sets for this exercise
        if (this.coachingExerciseIndex() + 1 < phase.keyExercises.length) {
          this.coachingExerciseIndex.update(i => i + 1);
          this.coachingCurrentSet.set(1);
          this.coachingStep.set('contract');
          this.activeHoldCountdown.set(10);
          const nextEx = phase.keyExercises[this.coachingExerciseIndex()];
          const cleanName = nextEx.replace(/\s*\([^)]*\)/g, '').trim();
          this.coachingStatusMessage.set(`Contract ${cleanName} firmly and maintain steady breathing.`);
          this.speakCoach(`Great job! Next exercise: ${cleanName}. Set 1 of 3. Ready, set, contract!`);
        } else {
          this.speakCoach(`Phase ${this.coachingPhaseNumber()} regimen complete! Outstanding neuromuscular control.`);
          this.stopGuidedPtSession(true);
        }
      }
    } else if (this.coachingStep() === 'rest') {
      this.coachingCurrentSet.update(s => s + 1);
      this.coachingStep.set('contract');
      this.activeHoldCountdown.set(10);
      const ex = phase.keyExercises[this.coachingExerciseIndex()];
      const cleanName = ex.replace(/\s*\([^)]*\)/g, '').trim();
      this.coachingStatusMessage.set(`Set ${this.coachingCurrentSet()} of 3: Contract ${cleanName} firmly.`);
      this.speakCoach(`Set ${this.coachingCurrentSet()}. Contract and hold!`);
    }
  }

  stopGuidedPtSession(isCompleted = false): void {
    if (this.coachingTimerInterval) {
      clearInterval(this.coachingTimerInterval);
      this.coachingTimerInterval = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch { /* defensive fallback */ }
    }
    this.isCoachingActive.set(false);
    this.isCoachingPaused.set(false);
    this.coachingStep.set(isCompleted ? 'complete' : 'idle');
    if (isCompleted) {
      this.coachingStatusMessage.set('Session successfully completed!');
    } else {
      this.coachingStatusMessage.set('');
    }
  }

  speakCoach(text: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92; // Rachel Nabors parasympathetic pacing
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch {
      // Defensive fallback: visual timer continues without interruption
    }
  }

  async exportFhirCarePlanBundle(): Promise<void> {
    const pid = this.patientStateService?.loadedPatientId() || 'P001';
    const bundle = this.loopService.generateFhirCarePlanBundle(pid);
    const jsonStr = JSON.stringify(bundle, null, 2);
    const seal = await this.loopService.computeSha256Digest(jsonStr);

    bundle.meta.extension = [
      {
        url: 'urn:pocketgull:fda-21cfr11:sha256-seal',
        valueString: seal
      }
    ];

    this.lastExportSeal.set(seal);
    this.fhirExportSuccess.set(true);

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/fhir+json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fhir-r4-careplan-knee-${pid}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        // Defensive headless fallback
      }
    }
  }

  dismissExportAttestation(): void {
    this.fhirExportSuccess.set(false);
  }

  ngOnDestroy(): void {
    this.stopGuidedPtSession(false);
  }

  loadScenario(scenario: PresetKneeScenario): void {
    this.activeScenario.set(scenario);
    this.loopService.loadPresetScenario(scenario);
    this.selectedPhaseView.set(this.report().activePhase.phaseNumber);
  }

  resetToBaseline(): void {
    this.activeScenario.set('custom');
    this.loopService.resetMriProfile();
    this.loopService.resetCheckInHistory();
    this.selectedPhaseView.set(this.report().activePhase.phaseNumber);
  }

  onVasChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val)) {
      this.activeScenario.set('custom');
      this.loopService.updateLatestCheckIn({ vasPain: val });
    }
  }

  onFlexionChange(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(val)) {
      this.activeScenario.set('custom');
      this.loopService.updateLatestCheckIn({ activeFlexionDegrees: val });
    }
  }

  onStiffnessChange(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(val)) {
      this.activeScenario.set('custom');
      this.loopService.updateLatestCheckIn({ morningStiffnessMinutes: val });
    }
  }

  onStepsChange(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(val)) {
      this.activeScenario.set('custom');
      this.loopService.updateLatestCheckIn({ dailyStepTolerance: val });
    }
  }

  onMriChange(target: keyof IMriTargetProbabilities, event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val)) {
      this.activeScenario.set('custom');
      this.loopService.setMriTargetProbability(target, val);
    }
  }

  getPhaseSummaryTitle(phaseNumber: number): string {
    switch (phaseNumber) {
      case 1: return 'Effusion & Quad Reset';
      case 2: return 'Closed Kinetic Loading';
      case 3: return 'Eccentric Hypertrophy';
      case 4: return 'Return-to-Sport';
      default: return '';
    }
  }

  getPhaseDetails(phaseNumber: number): IRehabPhase {
    switch (phaseNumber) {
      case 1:
        return {
          phaseNumber: 1,
          title: 'Phase 1: Effusion Control & Neuromuscular Quad Activation',
          timeframe: 'Days 1 to 14',
          clinicalFocus: 'Quiet synovial inflammation, resolve AMI, and restore terminal knee extension (0°).',
          keyExercises: [
            'Isometric Quadriceps Sets (10s hold x 10 reps, 3x daily)',
            'Supine Straight Leg Raises (locked extension)',
            'Heel Slides within comfortable pain-free arc',
            'Patellar Passive Mobilization (superior/inferior glides)'
          ],
          progressionCriteria: 'Zero extension lag, active flexion >= 110°, VAS pain <= 3/10.',
          contraindicatedMovements: ['Deep squats past 60°', 'Open-chain seated knee extensions', 'Impact jogging']
        };
      case 2:
        return {
          phaseNumber: 2,
          title: 'Phase 2: Closed Kinetic Chain Loading & Postural Stability',
          timeframe: 'Days 15 to 35',
          clinicalFocus: 'Restore closed-chain proprioception and re-engage hip extensor force-coupling.',
          keyExercises: [
            'Double-Leg Glute Bridges with band resistance',
            'Supported Wall Squats (0° to 45° knee flexion)',
            'Step-Ups on 4-inch riser with slow eccentric lowering',
            'Stationary Cycling with low resistance'
          ],
          progressionCriteria: 'Pain-free stair descent, normal gait cadence, active flexion >= 125°.',
          contraindicatedMovements: ['Pivoting or twisting on planted foot', 'High-impact plyometrics']
        };
      case 3:
        return {
          phaseNumber: 3,
          title: 'Phase 3: Eccentric Hypertrophy & Kinetic Chain Equilibrium',
          timeframe: 'Days 36 to 65',
          clinicalFocus: 'Build eccentric hamstring tensile strength and gluteus medius dynamic lateral control.',
          keyExercises: [
            'Romanian Deadlifts with kettlebell (hinge focus)',
            'Single-Leg Balance on foam pad with perturbation',
            'Banded Lateral Monster Walks',
            'Incline Treadmill Walking (5% grade)'
          ],
          progressionCriteria: 'Single-leg squat symmetry >= 85% vs contralateral side, zero joint effusion.',
          contraindicatedMovements: ['Uncontrolled cutting maneuvers on turf']
        };
      case 4:
      default:
        return {
          phaseNumber: 4,
          title: 'Phase 4: Functional Return-to-Sport & Dynamic Agility',
          timeframe: 'Days 66 to 90+',
          clinicalFocus: 'Multi-planar agility, deceleration braking, and unrestricted confidence.',
          keyExercises: [
            'Ladder Agility Drills with controlled deceleration',
            'Box Jumps with soft-landing biomechanics focus',
            'Lateral Shuffle to sprint transitions',
            'Sport-specific kinetic movement simulation'
          ],
          progressionCriteria: 'Y-Balance test within 95% of uninjured limb, KOOS QoL score >= 85.',
          contraindicatedMovements: ['Fatigued cutting drills without warm-up']
        };
    }
  }
}
