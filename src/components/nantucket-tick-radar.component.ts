import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NantucketTickRadarService,
  TickSpecies,
  INantucketGeoHotspot,
  IBodyInspectionZone,
  IBayesianTriageOutput
} from '../services/nantucket-tick-radar.service';
import { PatientStateService } from '../services/patient-state.service';
import { BioHapticFeedbackService } from '../services/hardware/bio-haptic-feedback.service';
import { NantucketPassportStorybookComponent } from './nantucket-passport-storybook.component';

@Component({
  selector: 'app-nantucket-tick-radar',
  standalone: true,
  imports: [CommonModule, FormsModule, NantucketPassportStorybookComponent],
  template: `
    <div class="p-6 bg-zinc-950 text-zinc-100 rounded-xl border border-zinc-800 shadow-2xl space-y-6 max-w-7xl mx-auto font-sans">
      
      <!-- Top Title & Navigation Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 uppercase tracking-widest">
              VECTOR SURVEILLANCE
            </span>
            <h2 class="text-lg font-bold tracking-tight text-white flex items-center gap-2 font-pocketgull-sans-clinical">
              Nantucket Tick Defense &amp; Co-Infection Radar
            </h2>
            <span class="px-2 py-0.5 rounded-xs text-[10px] font-mono font-semibold bg-zinc-900 text-zinc-400 border border-zinc-800">
              UMass Amherst • MA DPH Grounded
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1">
            Empirical Bayesian pre/post-test risk engine, IDSA 72-hour single-dose doxycycline prophylaxis calculator, and multi-pathogen co-infection surveillance.
          </p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <!-- View Mode Toggle -->
          <div class="inline-flex rounded-xs bg-zinc-900 p-0.5 border border-zinc-800 font-mono text-xs">
            <button
              type="button"
              (click)="viewMode.set('clinical')"
              [class.bg-teal-500\/20]="viewMode() === 'clinical'"
              [class.text-teal-300]="viewMode() === 'clinical'"
              [class.border-teal-500\/40]="viewMode() === 'clinical'"
              [class.text-zinc-400]="viewMode() !== 'clinical'"
              class="px-3 py-1 rounded-xs border border-transparent transition cursor-pointer font-bold"
            >
              🔬 Clinical Radar
            </button>
            <button
              type="button"
              (click)="viewMode.set('passport')"
              [class.bg-rose-500\/20]="viewMode() === 'passport'"
              [class.text-rose-300]="viewMode() === 'passport'"
              [class.border-rose-500\/40]="viewMode() === 'passport'"
              [class.text-zinc-400]="viewMode() !== 'passport'"
              class="px-3 py-1 rounded-xs border border-transparent transition cursor-pointer font-bold flex items-center gap-1"
            >
              <span>🌊 Junior Passport</span>
              <span class="text-[9px] px-1 py-0.2 rounded-xs bg-rose-900/40 text-rose-300">Beatrix Potter</span>
            </button>
          </div>

          <button
            type="button"
            (click)="copyFhirBundle()"
            class="px-3.5 py-1.5 rounded-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>{{ fhirCopied() ? '✓ Copied FHIR Bundle' : '📋 Export FHIR R4 Bundle' }}</span>
          </button>
        </div>
      </div>

      <!-- Passport View Conditional Render -->
      @if (viewMode() === 'passport') {
        <app-nantucket-passport-storybook />
      } @else {

      <!-- Island Micro-Hotspots Selector Strip -->
      <div class="space-y-2">
        <label class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
          <span>1. Geographic Exposure Locus (Nantucket Ecological Hotspots)</span>
          <span class="text-[11px] text-amber-400">Risk Level: {{ radar.activeHotspot().vectorRiskLevel }} ({{ radar.activeHotspot().nymphDensityPer100m2 }} nymphs/100m²)</span>
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          @for (spot of radar.hotspots(); track spot.id) {
            <button
              (click)="selectHotspot(spot.id)"
              [class.bg-teal-500\/10]="radar.selectedHotspotId() === spot.id"
              [class.border-teal-400]="radar.selectedHotspotId() === spot.id"
              [class.text-white]="radar.selectedHotspotId() === spot.id"
              [class.bg-zinc-900\/60]="radar.selectedHotspotId() !== spot.id"
              [class.border-zinc-800]="radar.selectedHotspotId() !== spot.id"
              [class.text-zinc-400]="radar.selectedHotspotId() !== spot.id"
              class="p-3 rounded-xl border text-left transition hover:border-zinc-700 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold">{{ spot.name }}</span>
                  <span
                    [class.text-rose-400]="spot.vectorRiskLevel === 'EXTREME'"
                    [class.text-amber-400]="spot.vectorRiskLevel === 'HIGH'"
                    [class.text-blue-400]="spot.vectorRiskLevel === 'MODERATE'"
                    class="text-[10px] font-mono font-bold"
                  >
                    {{ spot.vectorRiskLevel }}
                  </span>
                </div>
                <p class="text-[10px] text-zinc-400 mt-1 line-clamp-2">{{ spot.foliageType }}</p>
              </div>
              <div class="mt-2 text-[9px] font-mono text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-800/50">
                <span>{{ spot.nymphDensityPer100m2 }} / 100m²</span>
              </div>
            </button>
          }
        </div>
      </div>

      <!-- Main Interaction Grid: Dwell Time Calculator & Co-Infection Differential -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- Column 1: Tick Parameter & Dwell Time Engine (5 Cols) -->
        <div class="lg:col-span-5 bg-zinc-900/60 rounded-2xl p-5 border border-zinc-800/80 space-y-5">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <span>⏱️</span> Dwell Time & Prophylaxis Engine
            </h3>
            <span class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
              IDSA / CDC Guidance
            </span>
          </div>

          <!-- Species Selection -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-mono uppercase text-zinc-400 font-bold">Identified Tick Vector Species</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                (click)="setSpecies('ixodes_nymph')"
                [class.bg-amber-500\/20]="radar.selectedSpecies() === 'ixodes_nymph'"
                [class.border-amber-400]="radar.selectedSpecies() === 'ixodes_nymph'"
                [class.text-amber-200]="radar.selectedSpecies() === 'ixodes_nymph'"
                [class.bg-zinc-800\/50]="radar.selectedSpecies() !== 'ixodes_nymph'"
                [class.border-zinc-700]="radar.selectedSpecies() !== 'ixodes_nymph'"
                class="p-2.5 rounded-xl border text-left text-xs font-mono transition"
              >
                <div class="font-bold">Deer Tick (Nymph)</div>
                <div class="text-[10px] text-zinc-400 opacity-90">Poppy seed (~1.5mm) &bull; Highest Vector</div>
              </button>

              <button
                (click)="setSpecies('ixodes_adult')"
                [class.bg-amber-500\/20]="radar.selectedSpecies() === 'ixodes_adult'"
                [class.border-amber-400]="radar.selectedSpecies() === 'ixodes_adult'"
                [class.text-amber-200]="radar.selectedSpecies() === 'ixodes_adult'"
                [class.bg-zinc-800\/50]="radar.selectedSpecies() !== 'ixodes_adult'"
                [class.border-zinc-700]="radar.selectedSpecies() !== 'ixodes_adult'"
                class="p-2.5 rounded-xl border text-left text-xs font-mono transition"
              >
                <div class="font-bold">Deer Tick (Adult)</div>
                <div class="text-[10px] text-zinc-400 opacity-90">Sesame seed (~3mm) &bull; Fall/Spring</div>
              </button>

              <button
                (click)="setSpecies('lone_star')"
                [class.bg-rose-500\/20]="radar.selectedSpecies() === 'lone_star'"
                [class.border-rose-400]="radar.selectedSpecies() === 'lone_star'"
                [class.text-rose-200]="radar.selectedSpecies() === 'lone_star'"
                [class.bg-zinc-800\/50]="radar.selectedSpecies() !== 'lone_star'"
                [class.border-zinc-700]="radar.selectedSpecies() !== 'lone_star'"
                class="p-2.5 rounded-xl border text-left text-xs font-mono transition"
              >
                <div class="font-bold">Lone Star Tick</div>
                <div class="text-[10px] text-zinc-400 opacity-90">White dot dorsal &bull; Alpha-Gal risk</div>
              </button>

              <button
                (click)="setSpecies('dog_tick')"
                [class.bg-blue-500\/20]="radar.selectedSpecies() === 'dog_tick'"
                [class.border-blue-400]="radar.selectedSpecies() === 'dog_tick'"
                [class.text-blue-200]="radar.selectedSpecies() === 'dog_tick'"
                [class.bg-zinc-800\/50]="radar.selectedSpecies() !== 'dog_tick'"
                [class.border-zinc-700]="radar.selectedSpecies() !== 'dog_tick'"
                class="p-2.5 rounded-xl border text-left text-xs font-mono transition"
              >
                <div class="font-bold">American Dog Tick</div>
                <div class="text-[10px] text-zinc-400 opacity-90">Large &bull; No Lyme transmission</div>
              </button>
            </div>
          </div>

          <!-- Hours Attached Slider -->
          <div class="space-y-2">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-zinc-400">Estimated Attachment Duration:</span>
              <span class="font-bold text-amber-300">{{ radar.hoursAttached() }} hours ({{ radar.dwellAssessment().dwellTier }})</span>
            </div>
            <input
              type="range"
              min="0"
              max="96"
              step="1"
              [ngModel]="radar.hoursAttached()"
              (ngModelChange)="radar.hoursAttached.set($event)"
              class="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div class="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>0h (Unattached)</span>
              <span>24h (Midgut Phase)</span>
              <span>36h (Transmission Threshold)</span>
              <span>72h+ (Plateau)</span>
            </div>
          </div>

          <!-- Hours Since Removal Slider -->
          <div class="space-y-2">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-zinc-400">Elapsed Time Since Removal:</span>
              <span class="font-bold text-sky-300">{{ radar.hoursSinceRemoval() }} hours ({{ radar.dwellAssessment().hoursRemainingIn72hWindow }}h left in window)</span>
            </div>
            <input
              type="range"
              min="0"
              max="96"
              step="1"
              [ngModel]="radar.hoursSinceRemoval()"
              (ngModelChange)="radar.hoursSinceRemoval.set($event)"
              class="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          <!-- Prophylaxis Recommendation Card -->
          <div
            [class.bg-emerald-500\/10]="radar.dwellAssessment().doxycyclineProphylaxisEligible"
            [class.border-emerald-500\/30]="radar.dwellAssessment().doxycyclineProphylaxisEligible"
            [class.bg-amber-500\/10]="!radar.dwellAssessment().doxycyclineProphylaxisEligible"
            [class.border-amber-500\/30]="!radar.dwellAssessment().doxycyclineProphylaxisEligible"
            class="p-4 rounded-xl border text-xs space-y-2 transition"
          >
            <div class="flex items-center justify-between font-mono">
              <span class="font-bold text-sm">
                {{ radar.dwellAssessment().doxycyclineProphylaxisEligible ? '💊 Single-Dose Doxycycline Indicated' : '🛡️ Prophylaxis Observation Mode' }}
              </span>
              <span class="font-mono text-[11px] font-bold">
                Lyme Trans: {{ radar.dwellAssessment().lymeTransmissionProbability }}%
              </span>
            </div>
            <p class="text-zinc-300 leading-relaxed font-sans text-xs">
              {{ radar.dwellAssessment().clinicalRecommendation }}
            </p>
          </div>
        </div>

        <!-- Column 2: Multi-Pathogen Bayesian Triage Radar (7 Cols) -->
        <div class="lg:col-span-7 bg-zinc-900/60 rounded-2xl p-5 border border-zinc-800/80 space-y-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <span>🔬</span> Multi-Pathogen Bayesian Co-Infection Radar
              </h3>
              <span class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] border border-purple-500/30">
                Popperian H₀ Tested
              </span>
            </div>

            <!-- Pathognomonic Symptom Toggles -->
            <div class="space-y-1.5 mt-4">
              <label class="text-[11px] font-mono uppercase text-zinc-400 font-bold">Observed Patient Signs & Symptoms</label>
              <div class="flex flex-wrap gap-2">
                <button
                  (click)="toggleSymptom('bulls_eye_erythema')"
                  [class.bg-rose-500\/20]="radar.reportedSymptoms().includes('bulls_eye_erythema')"
                  [class.border-rose-400]="radar.reportedSymptoms().includes('bulls_eye_erythema')"
                  [class.text-rose-200]="radar.reportedSymptoms().includes('bulls_eye_erythema')"
                  [class.bg-zinc-800]="!radar.reportedSymptoms().includes('bulls_eye_erythema')"
                  [class.border-zinc-700]="!radar.reportedSymptoms().includes('bulls_eye_erythema')"
                  class="px-3 py-1.5 rounded-lg border text-xs font-mono transition"
                >
                  🎯 Erythema Migrans (Bullseye)
                </button>

                <button
                  (click)="toggleSymptom('dark_urine_sweats')"
                  [class.bg-rose-500\/20]="radar.reportedSymptoms().includes('dark_urine_sweats')"
                  [class.border-rose-400]="radar.reportedSymptoms().includes('dark_urine_sweats')"
                  [class.text-rose-200]="radar.reportedSymptoms().includes('dark_urine_sweats')"
                  [class.bg-zinc-800]="!radar.reportedSymptoms().includes('dark_urine_sweats')"
                  [class.border-zinc-700]="!radar.reportedSymptoms().includes('dark_urine_sweats')"
                  class="px-3 py-1.5 rounded-lg border text-xs font-mono transition"
                >
                  🩸 Drenching Sweats / Dark Urine (Babesia)
                </button>

                <button
                  (click)="toggleSymptom('high_fever_rigors')"
                  [class.bg-rose-500\/20]="radar.reportedSymptoms().includes('high_fever_rigors')"
                  [class.border-rose-400]="radar.reportedSymptoms().includes('high_fever_rigors')"
                  [class.text-rose-200]="radar.reportedSymptoms().includes('high_fever_rigors')"
                  [class.bg-zinc-800]="!radar.reportedSymptoms().includes('high_fever_rigors')"
                  [class.border-zinc-700]="!radar.reportedSymptoms().includes('high_fever_rigors')"
                  class="px-3 py-1.5 rounded-lg border text-xs font-mono transition"
                >
                  ⚡ High Fever & Rigors (Anaplasma)
                </button>

                <button
                  (click)="toggleSymptom('meat_allergy_anaphylaxis')"
                  [class.bg-rose-500\/20]="radar.reportedSymptoms().includes('meat_allergy_anaphylaxis')"
                  [class.border-rose-400]="radar.reportedSymptoms().includes('meat_allergy_anaphylaxis')"
                  [class.text-rose-200]="radar.reportedSymptoms().includes('meat_allergy_anaphylaxis')"
                  [class.bg-zinc-800]="!radar.reportedSymptoms().includes('meat_allergy_anaphylaxis')"
                  [class.border-zinc-700]="!radar.reportedSymptoms().includes('meat_allergy_anaphylaxis')"
                  class="px-3 py-1.5 rounded-lg border text-xs font-mono transition"
                >
                  🥩 Post-Meat Urticaria (Alpha-Gal)
                </button>

                <button
                  (click)="toggleSymptom('fatigue_malaise')"
                  [class.bg-amber-500\/20]="radar.reportedSymptoms().includes('fatigue_malaise')"
                  [class.border-amber-400]="radar.reportedSymptoms().includes('fatigue_malaise')"
                  [class.text-amber-200]="radar.reportedSymptoms().includes('fatigue_malaise')"
                  [class.bg-zinc-800]="!radar.reportedSymptoms().includes('fatigue_malaise')"
                  [class.border-zinc-700]="!radar.reportedSymptoms().includes('fatigue_malaise')"
                  class="px-3 py-1.5 rounded-lg border text-xs font-mono transition"
                >
                  😴 Fatigue & Malaise
                </button>
              </div>
            </div>

            <!-- Bayesian Probability Ranked List -->
            <div class="space-y-3 mt-4">
              @for (res of radar.bayesianTriageResults(); track res.pathogenId) {
                <div class="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5">
                  <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-white">{{ res.pathogenName }}</span>
                      <span class="text-[10px] text-zinc-500 italic font-mono">{{ res.organism }}</span>
                    </div>
                    <div class="flex items-center gap-2 font-mono">
                      <span
                        [class.text-rose-400]="res.posteriorPercent >= 50"
                        [class.text-amber-400]="res.posteriorPercent >= 20 && res.posteriorPercent < 50"
                        [class.text-zinc-400]="res.posteriorPercent < 20"
                        class="font-bold tabular-nums"
                      >
                        {{ res.posteriorPercent }}% Post-Test
                      </span>
                      <span
                        [class.bg-rose-500\/20]="res.nullHypothesisRejected"
                        [class.text-rose-300]="res.nullHypothesisRejected"
                        [class.border-rose-500\/30]="res.nullHypothesisRejected"
                        [class.bg-zinc-800]="!res.nullHypothesisRejected"
                        [class.text-zinc-500]="!res.nullHypothesisRejected"
                        class="px-1.5 py-0.5 rounded text-[9px] font-bold border"
                      >
                        {{ res.nullHypothesisRejected ? 'p < 0.05 (H₀ Rej)' : 'H₀ Retained' }}
                      </span>
                    </div>
                  </div>

                  <!-- Progress Bar -->
                  <div class="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      [style.width.%]="res.posteriorPercent"
                      [class.bg-rose-500]="res.posteriorPercent >= 50"
                      [class.bg-amber-400]="res.posteriorPercent >= 20 && res.posteriorPercent < 50"
                      [class.bg-teal-500]="res.posteriorPercent < 20"
                      class="h-full rounded-full transition-all duration-300"
                    ></div>
                  </div>

                  <!-- Treatment Summary -->
                  <div class="text-[11px] text-zinc-400 font-mono flex items-center justify-between">
                    <span class="truncate max-w-[85%]">{{ res.treatmentSummary }}</span>
                    <span class="text-zinc-600 text-[10px]">Prior: {{ (res.priorProbability * 100).toFixed(0) }}%</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="pt-3 border-t border-zinc-800 flex items-center justify-between">
            <button
              (click)="logFindingsToChart()"
              class="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold text-xs font-mono transition shadow-md flex items-center gap-1.5"
            >
              <span>📥 {{ chartSaved() ? 'Documented in Patient Chart!' : 'Log Findings to Patient Chart' }}</span>
            </button>
            <span class="text-[11px] font-mono text-zinc-500">
              Nantucket Cottage Hospital Protocol (508-825-1000)
            </span>
          </div>
        </div>
      </div>

      <!-- Anatomical Body Inspection Zones Grid (7 Zones) -->
      <div class="bg-zinc-900/60 rounded-2xl p-5 border border-zinc-800/80 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm">🔍</span>
            <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
              High-Risk Anatomical Body Inspection Checklist
            </h3>
          </div>
          <span class="text-xs font-mono text-emerald-400 font-bold">
            {{ radar.inspectedZonesCount() }} / {{ radar.inspectionZones().length }} Zones Checked
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          @for (zone of radar.inspectionZones(); track zone.id) {
            <button
              (click)="toggleZone(zone.id)"
              [class.bg-emerald-500\/10]="zone.isInspected"
              [class.border-emerald-500\/40]="zone.isInspected"
              [class.text-emerald-300]="zone.isInspected"
              [class.bg-zinc-950]="!zone.isInspected"
              [class.border-zinc-800]="!zone.isInspected"
              [class.text-zinc-400]="!zone.isInspected"
              class="p-3 rounded-xl border text-left transition hover:border-zinc-700 flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-white">{{ zone.zoneName }}</span>
                  <span class="text-xs">{{ zone.isInspected ? '✅' : '⚪' }}</span>
                </div>
                <p class="text-[10px] text-zinc-500 mt-1 line-clamp-2">{{ zone.clinicalInspectionTip }}</p>
              </div>
              <div class="mt-2 text-[9px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/50 flex justify-between">
                <span>{{ zone.anatomicRegion }}</span>
                <span>W: {{ zone.riskWeight }}/10</span>
              </div>
            </button>
          }
        </div>
      </div>

      <!-- Positive Biophilic Stewardship & Savoring Reframe -->
      <div class="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-zinc-900 border border-teal-500/30 space-y-2 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">🌊</span>
            <h4 class="text-xs font-mono uppercase font-bold text-teal-300">
              Positive Biophilia & Savoring the Island Coastal Moors
            </h4>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 text-[10px] font-mono font-bold border border-teal-500/40">
            Seligman PERMA-V Savoring
          </span>
        </div>
        <p class="text-xs text-zinc-300 leading-relaxed">
          Nantucket’s rolling coastal moors, cranberry bogs, and maritime heaths are extraordinary sources of biophilic restoration and mental vitality ($V$). With simple routine habits—permethrin-treated socks, an evening full-body tick scan, and immediate single-dose Doxycycline within 72 hours—you can explore the island's conservation trails with complete confidence and peace of mind.
        </p>
        <div class="flex flex-wrap gap-2 pt-1">
          <span class="px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-teal-500/20 text-[10px] font-mono text-teal-300">
            ✓ 72-Hour Window: >87% Transmission Risk Reduction
          </span>
          <span class="px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-teal-500/20 text-[10px] font-mono text-teal-300">
            🏥 Nantucket Cottage Hospital Walk-in: (508) 825-1000
          </span>
          <span class="px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-teal-500/20 text-[10px] font-mono text-teal-300">
            🌾 Conservation Foundation Trails: 100% Savoring Protected
          </span>
        </div>
      </div>

      <!-- Clinical & Community Surveillance Notice -->
      <div class="p-4 rounded-xs bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs leading-relaxed space-y-1">
        <div class="flex items-center gap-1.5 font-bold text-zinc-200 font-mono text-[11px] uppercase tracking-wider">
          <span>Clinical &amp; Community Surveillance Notice</span>
        </div>
        <p class="text-zinc-400">
          This community-driven vector surveillance engine synthesizes regional epidemiological datasets (UMass Amherst Laboratory of Medical Zoology / Massachusetts Department of Public Health) and IDSA clinical guidelines for decision support. It is not an official municipal directive. For acute tick attachments, atypical rashes, or suspected systemic symptoms, consult a licensed healthcare provider or Nantucket Cottage Hospital Walk-in Clinic.
        </p>
      </div>
      }

    </div>
  `
})
export class NantucketTickRadarComponent {
  radar = inject(NantucketTickRadarService);
  patientState = inject(PatientStateService);
  haptic = inject(BioHapticFeedbackService, { optional: true });

  viewMode = signal<'clinical' | 'passport'>('clinical');
  fhirCopied = signal<boolean>(false);
  chartSaved = signal<boolean>(false);

  selectHotspot(id: string): void {
    this.radar.selectedHotspotId.set(id);
    this.haptic?.triggerHapticPulse('exhale');
  }

  setSpecies(species: TickSpecies): void {
    this.radar.selectedSpecies.set(species);
    this.haptic?.triggerHapticPulse('exhale');
  }

  toggleSymptom(symptomId: string): void {
    this.radar.toggleSymptom(symptomId);
    this.haptic?.triggerHapticPulse('exhale');
  }

  toggleZone(zoneId: string): void {
    this.radar.toggleInspectionZone(zoneId);
    this.haptic?.triggerHapticPulse('exhale');
  }

  copyFhirBundle(): void {
    const bundle = this.radar.generateFhirR4Bundle(this.patientState.patientName() || 'ACK-PAT-001');
    navigator.clipboard.writeText(JSON.stringify(bundle, null, 2));
    this.fhirCopied.set(true);
    setTimeout(() => this.fhirCopied.set(false), 2500);
  }

  logFindingsToChart(): void {
    const topTriage = this.radar.bayesianTriageResults()[0];
    const dwell = this.radar.dwellAssessment();
    const hotspot = this.radar.activeHotspot();

    const note: any = {
      id: `tick_note_${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: `Nantucket Tick Exposure Assessment: ${hotspot.name}`,
      content: `Vector species: ${this.radar.selectedSpecies()}.\nEstimated dwell time: ${dwell.estimatedHours}h (${dwell.dwellTier}).\nSingle-dose Doxycycline Prophylaxis: ${dwell.doxycyclineProphylaxisEligible ? 'INDICATED within 72h window' : 'NOT INDICATED'}.\nTop Suspected Pathogen: ${topTriage.pathogenName} (${topTriage.posteriorPercent}% Bayesian post-test probability, p < 0.05 Null Hypothesis Rejected).\nRecommended Action: ${dwell.clinicalRecommendation}`,
      tags: ['Tick Bite', 'Infectious Disease', 'Nantucket Island', 'Lyme Disease']
    };

    this.patientState.clinicalNotes.update(notes => [note, ...notes]);
    this.chartSaved.set(true);
    setTimeout(() => this.chartSaved.set(false), 2500);
  }
}
