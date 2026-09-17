import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientStateService } from '../services/patient-state.service';
import {
  ClinicalBiologicalAgeTwinService,
  IBiomarkerInput,
  IBiomarkerAttribution,
  IPhenoAgeResult,
  IOrganDecayProfile,
  ICounterfactualProjection
} from '../services/clinical-biological-age-twin.service';

@Component({
  selector: 'app-biological-age-waterfall-hud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="relative w-full p-5 sm:p-7 bg-[#09090b] text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden font-sans select-none"
      aria-labelledby="hud-heading"
    >
      <!-- Subtle Bio-Rhythmic Ambient Glow (10s Rachel Nabors parasympathetic cycle) -->
      <div
        class="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000"
        [ngClass]="{
          'bg-teal-500/10': evaluation().ageDelta <= 0,
          'bg-amber-500/10': evaluation().ageDelta > 0 && evaluation().ageDelta <= 4,
          'bg-rose-500/15': evaluation().ageDelta > 4
        }"
      ></div>

      <!-- Header Telemetry Bar -->
      <header class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6">
        <div class="flex items-center gap-3.5">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border shrink-0 transition-colors"
            [ngClass]="{
              'bg-teal-950/60 border-teal-500/50 text-teal-400': evaluation().ageDelta <= 0,
              'bg-amber-950/60 border-amber-500/50 text-amber-400': evaluation().ageDelta > 0 && evaluation().ageDelta <= 4,
              'bg-rose-950/60 border-rose-500/50 text-rose-400': evaluation().ageDelta > 4
            }"
          >
            ⏱️
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-mono font-extrabold uppercase tracking-wider text-teal-400">
                Levine PhenoAge (2018)
              </span>
              <span class="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono font-medium border border-zinc-700">
                ⚙️ Pure-TS Twin (0 ms Offline)
              </span>
              <span class="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-emerald-400 font-mono font-medium border border-zinc-700">
                🛡️ HIPAA Safe Harbor
              </span>
              @if (isPatientConnected()) {
                <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono font-bold border border-cyan-700/60 flex items-center gap-1">
                  <span>👤</span> {{ activePatientLabel() }}
                </span>
              }
            </div>
            <h2 id="hud-heading" class="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
              Living Biological Clock & Waterfall HUD
            </h2>
            <p class="text-xs sm:text-sm text-zinc-400 mt-0.5 leading-relaxed">
              Drag biomarker sliders to simulate continuous 60 FPS biological age shifts and additive driver attributions.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 self-end md:self-center">
          @if (isPatientConnected()) {
            <button
              type="button"
              (click)="saveToCarePlan()"
              [disabled]="justSavedToPlan()"
              class="min-h-[44px] px-3.5 py-2 rounded-xl bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-600/60 font-mono text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-teal-400 active:scale-95 flex items-center gap-1.5"
              aria-label="Save current simulated biomarkers into active patient state"
            >
              <span>{{ justSavedToPlan() ? '✓ Saved to Plan' : '💾 Push to Care Plan' }}</span>
            </button>

            <button
              type="button"
              (click)="syncFromPatient()"
              class="min-h-[44px] px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-cyan-300 border border-zinc-700 font-mono text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-teal-400 active:scale-95"
              aria-label="Re-synchronize with current patient profile and vitals"
            >
              🔄 Re-sync
            </button>
          }

          <button
            type="button"
            (click)="resetToBaseline()"
            class="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 font-mono text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-teal-400 active:scale-95"
            aria-label="Reset panel to NHANES III median baseline values"
          >
            ↺ Reset Baseline
          </button>
        </div>
      </header>

      <!-- Top Metric Hero: Chronological vs. Biological Age -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Card 1: Chronological Age -->
        <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
          <span class="text-xs font-mono text-zinc-400 uppercase tracking-wider">Chronological Age</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-black tracking-tight text-zinc-200 font-clinical-telemetry">
              {{ biomarkers().chronologicalAge.toFixed(1) }}
            </span>
            <span class="text-xs text-zinc-400 font-mono">Years</span>
          </div>
          <span class="text-[11px] text-zinc-400 font-mono mt-2">Calendar Baseline</span>
        </div>

        <!-- Card 2: Biological PhenoAge -->
        <div
          class="p-4 rounded-xl border flex flex-col justify-between transition-colors"
          [ngClass]="{
            'bg-teal-950/30 border-teal-500/40 text-teal-300': evaluation().ageDelta <= 0,
            'bg-amber-950/30 border-amber-500/40 text-amber-300': evaluation().ageDelta > 0 && evaluation().ageDelta <= 4,
            'bg-rose-950/30 border-rose-500/40 text-rose-300': evaluation().ageDelta > 4
          }"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono uppercase tracking-wider">Biological PhenoAge</span>
            <span
              class="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase"
              [ngClass]="{
                'bg-teal-500/20 text-teal-300 border border-teal-500/30': evaluation().ageDelta <= 0,
                'bg-amber-500/20 text-amber-300 border border-amber-500/30': evaluation().ageDelta > 0 && evaluation().ageDelta <= 4,
                'bg-rose-500/20 text-rose-300 border border-rose-500/30': evaluation().ageDelta > 4
              }"
            >
              {{ evaluation().ageDelta <= 0 ? 'Youth Shield' : 'Accelerated' }}
            </span>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-black tracking-tight text-white font-clinical-telemetry">
              {{ evaluation().biologicalPhenoAge.toFixed(1) }}
            </span>
            <span class="text-xs font-mono text-zinc-300">Years</span>
          </div>
          <div class="text-[11px] font-mono mt-2 flex items-center gap-1.5 font-bold">
            <span>{{ evaluation().ageDelta > 0 ? '▲ +' : '▼ ' }}{{ evaluation().ageDelta.toFixed(1) }} Yrs</span>
            <span class="font-normal text-zinc-400">vs. Calendar</span>
          </div>
        </div>

        <!-- Card 3: 10-Year Mortality Hazard -->
        <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
          <span class="text-xs font-mono text-zinc-400 uppercase tracking-wider">10-Yr Mortality Hazard</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-3xl font-black tracking-tight text-zinc-100 font-clinical-telemetry">
              {{ (evaluation().tenYearMortalityRisk * 100).toFixed(1) }}%
            </span>
            <span class="text-xs text-zinc-400 font-mono">Gompertz</span>
          </div>
          <span class="text-[11px] font-mono mt-2 text-zinc-400">
            Hazard Ratio: <strong class="text-zinc-200 font-clinical-telemetry">{{ evaluation().mortalityHazardRatio.toFixed(2) }}x</strong> peer
          </span>
        </div>

        <!-- Card 4: Vitality Index -->
        <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
          <div class="flex justify-between items-center">
            <span class="text-xs font-mono text-zinc-400 uppercase tracking-wider">Vitality Index</span>
            <span class="text-xs font-mono text-teal-400 font-bold font-clinical-telemetry">
              {{ evaluation().vitalityIndex }}/100
            </span>
          </div>
          <div class="mt-3 w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              [style.width.%]="evaluation().vitalityIndex"
              [ngClass]="{
                'bg-teal-400': evaluation().vitalityIndex >= 75,
                'bg-amber-400': evaluation().vitalityIndex >= 50 && evaluation().vitalityIndex < 75,
                'bg-rose-500': evaluation().vitalityIndex < 50
              }"
            ></div>
          </div>
          <span class="text-[11px] font-mono text-zinc-400 mt-2">
            {{ evaluation().vitalityIndex >= 75 ? 'Optimal Resilience' : evaluation().vitalityIndex >= 50 ? 'Compensated' : 'Biological Strain' }}
          </span>
        </div>
      </div>

      <!-- Interactive Biomarker Sliders Panel -->
      <div class="mb-8 p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="text-base">🎛️</span>
            <h3 class="text-sm font-mono font-bold uppercase tracking-wider text-zinc-200">
              Interactive Biomarker Calibrators (60 FPS Twin)
            </h3>
          </div>
          <span class="text-xs font-mono text-zinc-400">Direct Gompertz Beta Scaling</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Slider 1: hs-CRP -->
          <div class="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800/80 space-y-2">
            <div class="flex justify-between items-center text-xs font-mono">
              <label for="slider-hs-crp" class="font-bold text-zinc-200">
                🔥 hs-CRP (Inflammation)
              </label>
              <span class="font-black text-amber-400 font-clinical-telemetry">
                {{ biomarkers().hsCrp.toFixed(1) }} mg/L
              </span>
            </div>
            <input
              id="slider-hs-crp"
              name="hsCrp"
              type="range"
              min="0.2"
              max="10.0"
              step="0.1"
              [value]="biomarkers().hsCrp"
              (input)="onSliderChange('hsCrp', $event)"
              class="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400 border border-zinc-700 min-h-[44px] touch-manipulation"
              aria-label="High-Sensitivity C-Reactive Protein in mg per Liter"
            />
            <div class="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>0.2 (Pristine)</span>
              <span>1.0 (Normal)</span>
              <span>10.0 (Acute)</span>
            </div>
          </div>

          <!-- Slider 2: Fasting Glucose -->
          <div class="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800/80 space-y-2">
            <div class="flex justify-between items-center text-xs font-mono">
              <label for="slider-glucose" class="font-bold text-zinc-200">
                🍬 Fasting Blood Glucose
              </label>
              <span class="font-black text-amber-400 font-clinical-telemetry">
                {{ biomarkers().glucose.toFixed(0) }} mg/dL
              </span>
            </div>
            <input
              id="slider-glucose"
              name="glucose"
              type="range"
              min="70"
              max="200"
              step="1"
              [value]="biomarkers().glucose"
              (input)="onSliderChange('glucose', $event)"
              class="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400 border border-zinc-700 min-h-[44px] touch-manipulation"
              aria-label="Fasting Blood Glucose in mg per Deciliter"
            />
            <div class="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>70 (Optimal)</span>
              <span>99 (Normal)</span>
              <span>200 (Diabetic)</span>
            </div>
          </div>

          <!-- Slider 3: Serum Albumin -->
          <div class="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800/80 space-y-2">
            <div class="flex justify-between items-center text-xs font-mono">
              <label for="slider-albumin" class="font-bold text-zinc-200">
                🛡️ Serum Albumin (Synthetic Reserve)
              </label>
              <span class="font-black text-teal-400 font-clinical-telemetry">
                {{ biomarkers().albumin.toFixed(1) }} g/dL
              </span>
            </div>
            <input
              id="slider-albumin"
              name="albumin"
              type="range"
              min="3.0"
              max="5.2"
              step="0.1"
              [value]="biomarkers().albumin"
              (input)="onSliderChange('albumin', $event)"
              class="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-400 border border-zinc-700 min-h-[44px] touch-manipulation"
              aria-label="Serum Albumin in grams per Deciliter"
            />
            <div class="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>3.0 (Depleted)</span>
              <span>4.5 (Optimal)</span>
              <span>5.2 (Robust)</span>
            </div>
          </div>

          <!-- Slider 4: Systolic Blood Pressure -->
          <div class="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800/80 space-y-2">
            <div class="flex justify-between items-center text-xs font-mono">
              <label for="slider-sbp" class="font-bold text-zinc-200">
                🫀 Systolic Blood Pressure
              </label>
              <span class="font-black text-amber-400 font-clinical-telemetry">
                {{ (biomarkers().systolicBp || 120).toFixed(0) }} mmHg
              </span>
            </div>
            <input
              id="slider-sbp"
              name="systolicBp"
              type="range"
              min="95"
              max="180"
              step="1"
              [value]="biomarkers().systolicBp || 120"
              (input)="onSliderChange('systolicBp', $event)"
              class="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400 border border-zinc-700 min-h-[44px] touch-manipulation"
              aria-label="Systolic Blood Pressure in mmHg"
            />
            <div class="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>95 (Low)</span>
              <span>118 (Target)</span>
              <span>180 (Hypertensive)</span>
            </div>
          </div>

          <!-- Slider 5: Serum Creatinine -->
          <div class="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800/80 space-y-2">
            <div class="flex justify-between items-center text-xs font-mono">
              <label for="slider-creatinine" class="font-bold text-zinc-200">
                💧 Serum Creatinine (Renal)
              </label>
              <span class="font-black text-zinc-200 font-clinical-telemetry">
                {{ biomarkers().creatinine.toFixed(2) }} mg/dL
              </span>
            </div>
            <input
              id="slider-creatinine"
              name="creatinine"
              type="range"
              min="0.5"
              max="2.2"
              step="0.05"
              [value]="biomarkers().creatinine"
              (input)="onSliderChange('creatinine', $event)"
              class="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-300 border border-zinc-700 min-h-[44px] touch-manipulation"
              aria-label="Serum Creatinine in mg per Deciliter"
            />
            <div class="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>0.5 (Low)</span>
              <span>0.85 (Target)</span>
              <span>2.2 (Renal Strain)</span>
            </div>
          </div>

          <!-- Slider 6: Chronological Age -->
          <div class="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800/80 space-y-2">
            <div class="flex justify-between items-center text-xs font-mono">
              <label for="slider-age" class="font-bold text-zinc-200">
                📅 Patient Chronological Age
              </label>
              <span class="font-black text-zinc-200 font-clinical-telemetry">
                {{ biomarkers().chronologicalAge.toFixed(0) }} Yrs
              </span>
            </div>
            <input
              id="slider-age"
              name="chronologicalAge"
              type="range"
              min="20"
              max="85"
              step="1"
              [value]="biomarkers().chronologicalAge"
              (input)="onSliderChange('chronologicalAge', $event)"
              class="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-300 border border-zinc-700 min-h-[44px] touch-manipulation"
              aria-label="Patient Chronological Age in Years"
            />
            <div class="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>20 Yrs</span>
              <span>45 Yrs</span>
              <span>85 Yrs</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Biomarker Waterfall Attribution Chart -->
      <div class="mb-8 p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div class="flex items-center gap-2">
            <span class="text-base">📊</span>
            <h3 class="text-sm font-mono font-bold uppercase tracking-wider text-zinc-200">
              Biomarker Waterfall Attribution (Δ Years)
            </h3>
          </div>
          <div class="flex items-center gap-4 text-xs font-mono">
            <span class="flex items-center gap-1.5 text-teal-400">
              <span class="w-2.5 h-2.5 rounded-sm bg-teal-400 inline-block"></span> Protective (−Δ)
            </span>
            <span class="flex items-center gap-1.5 text-rose-400">
              <span class="w-2.5 h-2.5 rounded-sm bg-rose-400 inline-block"></span> Accelerating (+Δ)
            </span>
          </div>
        </div>

        <!-- Waterfall Bars List -->
        <div class="space-y-3">
          @for (attr of evaluation().attributions; track attr.key) {
            <div class="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 transition-all hover:bg-zinc-900">
              <div class="flex items-center justify-between text-xs font-mono mb-1.5">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-zinc-200">{{ attr.name }}</span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                    {{ attr.organSystem }}
                  </span>
                </div>
                <div class="flex items-center gap-2 font-clinical-telemetry">
                  <span class="text-zinc-400 text-[11px]">
                    {{ attr.patientValue }} {{ attr.unit }} (Ref: {{ attr.referenceBaseline }})
                  </span>
                  <span
                    class="font-black text-xs px-2 py-0.5 rounded"
                    [ngClass]="{
                      'bg-teal-500/10 text-teal-300 border border-teal-500/20': attr.impact === 'protective',
                      'bg-rose-500/10 text-rose-300 border border-rose-500/20': attr.impact === 'accelerating',
                      'bg-zinc-800 text-zinc-400': attr.impact === 'neutral'
                    }"
                  >
                    {{ attr.deltaYears > 0 ? '+' : '' }}{{ attr.deltaYears.toFixed(2) }} Yrs
                  </span>
                </div>
              </div>

              <!-- Bar visual with central zero line -->
              <div class="relative w-full h-3 bg-zinc-800/80 rounded-full overflow-hidden flex">
                <!-- Left half (Protective, negative) -->
                <div class="w-1/2 h-full flex justify-end border-r border-zinc-700/80">
                  @if (attr.deltaYears < 0) {
                    <div
                      class="h-full bg-teal-400 rounded-l-full transition-all duration-200"
                      [style.width.%]="calcBarWidth(attr.deltaYears)"
                    ></div>
                  }
                </div>
                <!-- Right half (Accelerating, positive) -->
                <div class="w-1/2 h-full flex justify-start">
                  @if (attr.deltaYears > 0) {
                    <div
                      class="h-full bg-rose-400 rounded-r-full transition-all duration-200"
                      [style.width.%]="calcBarWidth(attr.deltaYears)"
                    ></div>
                  }
                </div>
              </div>

              <div class="mt-1 text-[11px] text-zinc-400 font-sans italic">
                {{ attr.clinicalMechanism }}
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Klemera-Doubal Algorithm (KDA) 5-Organ Decay Cards -->
      <div class="mb-8 p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-base">🧬</span>
          <h3 class="text-sm font-mono font-bold uppercase tracking-wider text-zinc-200">
            KDA 5-Organ Biological Decay Profiles
          </h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          @for (organ of evaluation().organDecay; track organ.system) {
            <div class="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-start mb-1">
                  <span class="text-xs font-mono font-bold text-zinc-200">{{ organ.system }}</span>
                </div>
                <span
                  class="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider inline-block"
                  [ngClass]="{
                    'bg-teal-500/20 text-teal-300 border border-teal-500/30': organ.status === 'optimal' || organ.status === 'resilient',
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30': organ.status === 'strained',
                    'bg-rose-500/20 text-rose-300 border border-rose-500/30': organ.status === 'accelerated_decay'
                  }"
                >
                  {{ organ.status.replace('_', ' ') }}
                </span>
              </div>

              <div class="my-3">
                <div class="flex justify-between text-[11px] font-mono mb-1">
                  <span class="text-zinc-400">Decay Score</span>
                  <span class="font-bold text-zinc-200 font-clinical-telemetry">{{ organ.decayScore }}/100</span>
                </div>
                <div class="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-200"
                    [style.width.%]="organ.decayScore"
                    [ngClass]="{
                      'bg-teal-400': organ.decayScore <= 45,
                      'bg-amber-400': organ.decayScore > 45 && organ.decayScore <= 65,
                      'bg-rose-500': organ.decayScore > 65
                    }"
                  ></div>
                </div>
              </div>

              <div class="text-[10px] font-mono text-zinc-400 flex justify-between">
                <span>Δ Age:</span>
                <span class="font-bold font-clinical-telemetry" [ngClass]="organ.relativeAgeDelta > 0 ? 'text-rose-400' : 'text-teal-400'">
                  {{ organ.relativeAgeDelta > 0 ? '+' : '' }}{{ organ.relativeAgeDelta.toFixed(1) }} Yrs
                </span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- 90-Day Counterfactual Rejuvenation Trajectory -->
      <div class="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-base">🌱</span>
              <h3 class="text-sm font-mono font-bold uppercase tracking-wider text-zinc-200">
                90-Day Biological Rejuvenation Trajectory
              </h3>
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">
              Targeted counterfactual healthspan curve under clinical lifestyle & supplement optimization.
            </p>
          </div>

          <!-- Protocol Presets -->
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              (click)="applyInterventionPreset('anti_inflammatory')"
              class="min-h-[44px] px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-teal-400 border border-teal-500/30 font-mono text-xs font-semibold transition-all active:scale-95"
            >
              🌿 Vagal Anti-Inflam
            </button>
            <button
              type="button"
              (click)="applyInterventionPreset('glycemic_reset')"
              class="min-h-[44px] px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/30 font-mono text-xs font-semibold transition-all active:scale-95"
            >
              🥗 Glycemic Reset
            </button>
            <button
              type="button"
              (click)="applyInterventionPreset('full_longevity')"
              class="min-h-[44px] px-3 py-1.5 rounded-lg bg-teal-950/60 hover:bg-teal-900/80 text-white border border-teal-500 font-mono text-xs font-bold transition-all active:scale-95 shadow-[0_0_12px_rgba(20,184,166,0.3)]"
            >
              ⚡ Full Longevity Twin
            </button>
          </div>
        </div>

        <!-- Trajectory Stats & Milestones -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <!-- Left Summary Card -->
          <div class="lg:col-span-4 p-4 rounded-xl bg-teal-950/20 border border-teal-500/30 text-teal-100 flex flex-col justify-between space-y-3">
            <div>
              <span class="text-[11px] font-mono text-teal-400 uppercase tracking-wider">Projected 90-Day Horizon</span>
              <div class="mt-1 flex items-baseline gap-2">
                <span class="text-3xl font-black text-white font-clinical-telemetry">
                  {{ counterfactual().projectedPhenoAge.toFixed(1) }}
                </span>
                <span class="text-xs text-teal-300 font-mono">Years</span>
              </div>
            </div>
            <div class="space-y-1 text-xs font-mono">
              <div class="flex justify-between">
                <span class="text-zinc-400">Rejuvenation:</span>
                <span class="font-bold text-teal-300 font-clinical-telemetry">{{ counterfactual().rejuvenationYears.toFixed(1) }} Yrs</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-400">Mortality Risk Drop:</span>
                <span class="font-bold text-emerald-400 font-clinical-telemetry">{{ counterfactual().projectedMortalityRiskReduction }}%</span>
              </div>
            </div>
          </div>

          <!-- Right 3-Act Milestones -->
          <div class="lg:col-span-8 space-y-3">
            @for (m of counterfactual().trajectoryMilestones; track m.day) {
              <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-start gap-3.5">
                <div class="w-10 h-10 rounded-lg bg-zinc-800 text-teal-400 border border-zinc-700 flex flex-col items-center justify-center shrink-0 font-mono font-bold text-xs">
                  <span>D{{ m.day }}</span>
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between text-xs font-mono mb-0.5">
                    <span class="font-bold text-zinc-200">Milestone {{ m.day }} Days</span>
                    <span class="text-teal-400 font-black font-clinical-telemetry">{{ m.phenoAge.toFixed(1) }} Yrs</span>
                  </div>
                  <p class="text-xs text-zinc-400 leading-relaxed font-sans">{{ m.description }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `
})
export class BiologicalAgeWaterfallHudComponent {
  private readonly twinService = inject(ClinicalBiologicalAgeTwinService);
  private readonly patientState = inject(PatientStateService, { optional: true });

  readonly biomarkers = this.twinService.activeBiomarkers;
  readonly evaluation = this.twinService.activeEvaluation;

  readonly isPatientConnected = computed(() => {
    if (!this.patientState) return false;
    const age = this.patientState.patientAge();
    const name = this.patientState.patientName ? this.patientState.patientName() : '';
    return age > 0 || !!name;
  });

  readonly activePatientLabel = computed(() => {
    if (!this.patientState) return 'Active Patient';
    const name = this.patientState.patientName ? this.patientState.patientName() : '';
    const age = this.patientState.patientAge();
    if (name && age > 0) return `${name} (${age}y)`;
    if (age > 0) return `Age ${age}y Profile`;
    if (name) return name;
    return 'Active Patient';
  });

  readonly justSavedToPlan = signal<boolean>(false);

  constructor() {
    if (this.patientState) {
      effect(() => {
        // Track patientAge, vitals, and functional medicine telemetry reactively
        this.patientState!.patientAge();
        this.patientState!.vitals();
        this.patientState!.functionalMedicineTelemetry();
        this.twinService.syncFromPatientState(this.patientState);
      });
    }
  }

  saveToCarePlan(): void {
    if (this.patientState) {
      this.twinService.pushBiomarkersToPatientState(this.patientState);
      this.justSavedToPlan.set(true);
      setTimeout(() => this.justSavedToPlan.set(false), 2500);
    }
  }

  syncFromPatient(): void {
    if (this.patientState) {
      this.twinService.syncFromPatientState(this.patientState);
    }
  }

  // Active counterfactual projection based on current biomarkers
  readonly counterfactual = computed<ICounterfactualProjection>(() => {
    const base = this.biomarkers();
    // Default simulated intervention: moderate anti-inflammatory & glycemic optimization
    return this.twinService.simulateCounterfactual(base, {
      deltaHsCrp: -0.8,
      deltaGlucose: -12,
      deltaAlbumin: +0.2,
      deltaSystolicBp: -6,
      targetHorizonDays: 90
    });
  });

  onSliderChange(key: keyof IBiomarkerInput, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;
    const val = parseFloat(input.value);
    if (!isNaN(val)) {
      this.twinService.updateBiomarker(key, val);
    }
  }

  resetToBaseline(): void {
    this.twinService.resetToBaseline();
  }

  calcBarWidth(deltaYears: number): number {
    // Scales +/- 5.0 years to 0% - 100% of half-width
    const absVal = Math.min(5.0, Math.abs(deltaYears));
    return Math.round((absVal / 5.0) * 100);
  }

  applyInterventionPreset(type: 'anti_inflammatory' | 'glycemic_reset' | 'full_longevity'): void {
    const curr = this.biomarkers();
    if (type === 'anti_inflammatory') {
      this.twinService.updateBiomarker('hsCrp', Math.max(0.4, curr.hsCrp - 1.2));
      this.twinService.updateBiomarker('albumin', Math.min(5.0, curr.albumin + 0.2));
    } else if (type === 'glycemic_reset') {
      this.twinService.updateBiomarker('glucose', Math.max(75, curr.glucose - 20));
      this.twinService.updateBiomarker('systolicBp', Math.max(110, (curr.systolicBp || 120) - 8));
    } else if (type === 'full_longevity') {
      this.twinService.updateBiomarker('hsCrp', 0.6);
      this.twinService.updateBiomarker('glucose', 85);
      this.twinService.updateBiomarker('albumin', 4.8);
      this.twinService.updateBiomarker('systolicBp', 115);
      this.twinService.updateBiomarker('creatinine', 0.85);
    }
  }
}
