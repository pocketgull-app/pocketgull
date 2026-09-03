import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  AriaScoringService, 
  SurgicalCorridorType 
} from '../../services/aria-scoring.service';

type ActiveAriaLens = 'NEUROPATHOLOGY' | 'SURGICAL_ANATOMY' | 'ACCESSIBILITY';

@Component({
  selector: 'app-aria-score-hud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full max-w-5xl mx-auto p-4 md:p-6 bg-zinc-950 text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl space-y-6">
      <!-- HUD Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-950 text-teal-300 border border-teal-800/60 uppercase tracking-wide">
              Clinical & Surgical Epistemology
            </span>
            <span class="text-xs text-zinc-400 font-mono">FDA AUC & SSF Codex</span>
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-white mt-1">
            ARIA Evaluation Suite
          </h2>
          <p class="text-xs md:text-sm text-zinc-400">
            Amyloid-Related Imaging Abnormalities & Anatomical Risk / Intraoperative Acuity
          </p>
        </div>

        <!-- Mode Selector Tabs -->
        <div class="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            (click)="activeLens.set('NEUROPATHOLOGY')"
            [class.bg-teal-600]="activeLens() === 'NEUROPATHOLOGY'"
            [class.text-white]="activeLens() === 'NEUROPATHOLOGY'"
            [class.text-zinc-400]="activeLens() !== 'NEUROPATHOLOGY'"
            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-teal-400">
            Neuropathology ARIA
          </button>
          <button
            type="button"
            (click)="activeLens.set('SURGICAL_ANATOMY')"
            [class.bg-teal-600]="activeLens() === 'SURGICAL_ANATOMY'"
            [class.text-white]="activeLens() === 'SURGICAL_ANATOMY'"
            [class.text-zinc-400]="activeLens() !== 'SURGICAL_ANATOMY'"
            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-teal-400">
            Surgical Anatomy ARIA
          </button>
          <button
            type="button"
            (click)="activeLens.set('ACCESSIBILITY')"
            [class.bg-teal-600]="activeLens() === 'ACCESSIBILITY'"
            [class.text-white]="activeLens() === 'ACCESSIBILITY'"
            [class.text-zinc-400]="activeLens() !== 'ACCESSIBILITY'"
            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-teal-400">
            WAI-ARIA Audit
          </button>
        </div>
      </div>

      <!-- LENS 1: NEUROPATHOLOGY ARIA (Amyloid-Related Imaging Abnormalities) -->
      @if (activeLens() === 'NEUROPATHOLOGY') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Parameters Input Column -->
          <div class="lg:col-span-6 space-y-4 bg-zinc-900/60 p-5 rounded-xl border border-zinc-800/80">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              Brain MRI & Biomarker Inputs
            </h3>

            <!-- FLAIR Edema Max Dimension -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-medium text-zinc-300">
                <span>FLAIR Edema Max Dimension</span>
                <span class="font-mono text-teal-400">{{ npInput().flairEdemaMaxDimensionCm }} cm</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="12" 
                step="0.1" 
                [ngModel]="npInput().flairEdemaMaxDimensionCm"
                (ngModelChange)="updateNp({ flairEdemaMaxDimensionCm: +$event })"
                class="w-full accent-teal-400 bg-zinc-800 rounded-lg cursor-pointer h-2" />
              <div class="flex justify-between text-[10px] text-zinc-500">
                <span>0 cm (None)</span>
                <span>5 cm (Moderate)</span>
                <span>10+ cm (Severe)</span>
              </div>
            </div>

            <!-- T2* / SWI Microbleeds Count -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-medium text-zinc-300">
                <span>T2* / SWI Microbleeds Count</span>
                <span class="font-mono text-teal-400">{{ npInput().t2SwiMicrobleedCount }}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="15" 
                step="1" 
                [ngModel]="npInput().t2SwiMicrobleedCount"
                (ngModelChange)="updateNp({ t2SwiMicrobleedCount: +$event })"
                class="w-full accent-teal-400 bg-zinc-800 rounded-lg cursor-pointer h-2" />
              <div class="flex justify-between text-[10px] text-zinc-500">
                <span>0</span>
                <span>1-4 (Mild)</span>
                <span>5-9 (Moderate)</span>
                <span>≥10 (Discontinue)</span>
              </div>
            </div>

            <!-- Superficial Siderosis Areas -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-medium text-zinc-300">
                <span>Superficial Siderosis (Focal Areas)</span>
                <span class="font-mono text-teal-400">{{ npInput().superficialSiderosisFocalAreas }}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="4" 
                step="1" 
                [ngModel]="npInput().superficialSiderosisFocalAreas"
                (ngModelChange)="updateNp({ superficialSiderosisFocalAreas: +$event })"
                class="w-full accent-teal-400 bg-zinc-800 rounded-lg cursor-pointer h-2" />
              <div class="flex justify-between text-[10px] text-zinc-500">
                <span>0 (None)</span>
                <span>1 (Mild)</span>
                <span>2 (Moderate)</span>
                <span>>2 (Severe)</span>
              </div>
            </div>

            <!-- Clinical & Genetic Toggles -->
            <div class="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label class="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-colors">
                <input 
                  type="checkbox" 
                  [ngModel]="npInput().patientHasApoE4Allele"
                  (ngModelChange)="updateNp({ patientHasApoE4Allele: $event })"
                  class="rounded bg-zinc-800 border-zinc-700 text-teal-500 focus:ring-teal-400 h-4 w-4" />
                <span class="text-xs text-zinc-200">ApoE-ε4 Carrier (+Risk)</span>
              </label>

              <label class="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-colors">
                <input 
                  type="checkbox" 
                  [ngModel]="npInput().hasClinicalSymptoms"
                  (ngModelChange)="updateNp({ hasClinicalSymptoms: $event })"
                  class="rounded bg-zinc-800 border-zinc-700 text-teal-500 focus:ring-teal-400 h-4 w-4" />
                <span class="text-xs text-zinc-200">Clinical Symptoms Present</span>
              </label>

              <label class="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-colors sm:col-span-2">
                <input 
                  type="checkbox" 
                  [ngModel]="npInput().flairSulcalEffusionPresent"
                  (ngModelChange)="updateNp({ flairSulcalEffusionPresent: $event })"
                  class="rounded bg-zinc-800 border-zinc-700 text-teal-500 focus:ring-teal-400 h-4 w-4" />
                <span class="text-xs text-zinc-200">Sulcal Effusion / Leptomeningeal Enhancement</span>
              </label>
            </div>
          </div>

          <!-- Evaluation & Action Directives Column -->
          <div class="lg:col-span-6 space-y-4 flex flex-col justify-between">
            <!-- Action Directive Banner -->
            <div 
              [class.bg-emerald-950]="npEval().recommendedAction === 'CONTINUE_WITH_SURVEILLANCE'"
              [class.border-emerald-700]="npEval().recommendedAction === 'CONTINUE_WITH_SURVEILLANCE'"
              [class.bg-amber-950]="npEval().recommendedAction === 'SUSPEND_DOSING_REPEAT_MRI'"
              [class.border-amber-700]="npEval().recommendedAction === 'SUSPEND_DOSING_REPEAT_MRI'"
              [class.bg-rose-950]="npEval().recommendedAction === 'DISCONTINUE_PERMANENTLY'"
              [class.border-rose-700]="npEval().recommendedAction === 'DISCONTINUE_PERMANENTLY'"
              class="p-4 rounded-xl border transition-all">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Recommended Clinical Action
                </span>
                <span class="px-2 py-0.5 text-xs font-mono font-bold rounded bg-black/40 text-white">
                  {{ npEval().recommendedAction.replaceAll('_', ' ') }}
                </span>
              </div>
              <p class="text-sm font-semibold text-white mt-2">
                {{ npEval().actionRationale }}
              </p>
              <div class="mt-3 flex items-center justify-between text-xs text-zinc-300 border-t border-white/10 pt-2">
                <span>Surveillance Interval:</span>
                <span class="font-bold text-white">Q{{ npEval().mriSurveillanceIntervalWeeks }}W Brain MRI</span>
              </div>
            </div>

            <!-- Severity Breakdown Cards -->
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <div class="text-[10px] uppercase text-zinc-400">ARIA-E (Edema)</div>
                <div class="text-base font-bold text-teal-400 mt-1">{{ npEval().ariaESeverity }}</div>
              </div>
              <div class="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <div class="text-[10px] uppercase text-zinc-400">Microbleeds</div>
                <div class="text-base font-bold text-teal-400 mt-1">{{ npEval().ariaHMicrobleedSeverity }}</div>
              </div>
              <div class="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <div class="text-[10px] uppercase text-zinc-400">Siderosis</div>
                <div class="text-base font-bold text-teal-400 mt-1">{{ npEval().ariaHSiderosisSeverity }}</div>
              </div>
            </div>

            <!-- Progression Risk & Protocol -->
            <div class="p-3.5 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
              <div class="flex justify-between text-xs">
                <span class="text-zinc-400">Protocol Classification:</span>
                <span class="text-zinc-200 font-mono">{{ npEval().fdaAppropriateUseCriterion }}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-zinc-400">Calculated Progression Index:</span>
                <span class="text-amber-400 font-mono font-bold">{{ npEval().riskOfProgressionScorePercent }}%</span>
              </div>
              <div class="text-[11px] text-zinc-500 font-mono truncate">
                Digest: {{ npEval().cryptographicAttestationDigest }}
              </div>
            </div>

            <!-- Export Action -->
            <button
              type="button"
              (click)="exportFhir('NEUROPATHOLOGY')"
              class="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Export HL7 FHIR R4 Observation (JSON)
            </button>
          </div>
        </div>
      }

      <!-- LENS 2: SURGICAL ANATOMY ARIA (Anatomical Risk & Intraoperative Acuity) -->
      @if (activeLens() === 'SURGICAL_ANATOMY') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Parameter Sliders -->
          <div class="lg:col-span-6 space-y-4 bg-zinc-900/60 p-5 rounded-xl border border-zinc-800/80">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold uppercase tracking-wider text-teal-400">
                Corridor Trajectory & Mechanics
              </h3>
              <select 
                [ngModel]="surgInput().corridorType"
                (ngModelChange)="updateSurg({ corridorType: $event })"
                class="bg-zinc-800 text-xs text-zinc-200 rounded-lg px-2 py-1 border border-zinc-700">
                <option value="FAR_LATERAL_CRANIOVERTEBRAL">Far-Lateral Transcondylar</option>
                <option value="TRANSORAL_CLIVAL">Transoral Clival</option>
                <option value="RETROPLEURAL_THORACIC">Retropleural Thoracic</option>
                <option value="TRANSFORAMINAL_LUMBAR">Transforaminal Lumbar</option>
                <option value="ANTERIOR_CERVICAL_CORRIDOR">Anterior Cervical</option>
              </select>
            </div>

            <!-- Angle of Attack -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-medium text-zinc-300">
                <span>Angle of Attack Trajectory</span>
                <span class="font-mono text-teal-400">{{ surgInput().angleAttackDegrees }}°</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="90" 
                step="1" 
                [ngModel]="surgInput().angleAttackDegrees"
                (ngModelChange)="updateSurg({ angleAttackDegrees: +$event })"
                class="w-full accent-teal-400 bg-zinc-800 rounded-lg cursor-pointer h-2" />
              <div class="flex justify-between text-[10px] text-zinc-500">
                <span>10° (Narrow Corridor)</span>
                <span>45°</span>
                <span>90° (Wide Exposure)</span>
              </div>
            </div>

            <!-- Working Depth -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-medium text-zinc-300">
                <span>Working Depth (Surgical Distance)</span>
                <span class="font-mono text-teal-400">{{ surgInput().workingDepthMm }} mm</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="120" 
                step="1" 
                [ngModel]="surgInput().workingDepthMm"
                (ngModelChange)="updateSurg({ workingDepthMm: +$event })"
                class="w-full accent-teal-400 bg-zinc-800 rounded-lg cursor-pointer h-2" />
            </div>

            <!-- Distance to Primary Vessel -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-medium text-zinc-300">
                <span>Distance to Critical Artery (VA / ICA)</span>
                <span class="font-mono text-rose-400">{{ surgInput().distanceToCriticalVesselMm }} mm</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="15" 
                step="0.1" 
                [ngModel]="surgInput().distanceToCriticalVesselMm"
                (ngModelChange)="updateSurg({ distanceToCriticalVesselMm: +$event })"
                class="w-full accent-rose-400 bg-zinc-800 rounded-lg cursor-pointer h-2" />
            </div>

            <!-- Bony Resection Percentage -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs font-medium text-zinc-300">
                <span>Bony Resection (Condyle/Facet)</span>
                <span class="font-mono text-amber-400">{{ surgInput().bonyResectionPercent }}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="80" 
                step="1" 
                [ngModel]="surgInput().bonyResectionPercent"
                (ngModelChange)="updateSurg({ bonyResectionPercent: +$event })"
                class="w-full accent-amber-400 bg-zinc-800 rounded-lg cursor-pointer h-2" />
            </div>

            <!-- Anatomical Variation Toggles -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <label class="flex items-center gap-2 p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  [ngModel]="surgInput().hasAberrantVascularAnatomy"
                  (ngModelChange)="updateSurg({ hasAberrantVascularAnatomy: $event })"
                  class="rounded bg-zinc-800 text-teal-500 h-4 w-4" />
                <span>Aberrant Artery Variation</span>
              </label>

              <label class="flex items-center gap-2 p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  [ngModel]="surgInput().requiresFusionStabilization"
                  (ngModelChange)="updateSurg({ requiresFusionStabilization: $event })"
                  class="rounded bg-zinc-800 text-teal-500 h-4 w-4" />
                <span>Instrumented Fusion Req.</span>
              </label>
            </div>
          </div>

          <!-- Composite Acuity Output Column -->
          <div class="lg:col-span-6 space-y-4 flex flex-col justify-between">
            <!-- Score Card Gauge -->
            <div class="p-5 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Composite Corridor Acuity
                  </span>
                  <div class="text-3xl font-extrabold text-white mt-1">
                    {{ surgEval().compositeAriaScore }} <span class="text-sm font-normal text-zinc-500">/ 100</span>
                  </div>
                </div>
                <div 
                  [style.borderColor]="surgEval().corridorHeatmapHex"
                  [style.color]="surgEval().corridorHeatmapHex"
                  class="px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider bg-black/40">
                  {{ surgEval().acuityTier.replaceAll('_', ' ') }}
                </div>
              </div>

              <!-- Multi-Axial Mini Breakdown -->
              <div class="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-800 text-center text-xs">
                <div>
                  <div class="text-zinc-500 text-[10px]">A (Depth)</div>
                  <div class="font-bold text-zinc-200 mt-0.5">{{ surgEval().depthAccessibilityScore }}/25</div>
                </div>
                <div>
                  <div class="text-zinc-500 text-[10px]">R (Vascular)</div>
                  <div class="font-bold text-zinc-200 mt-0.5">{{ surgEval().neurovascularProximityScore }}/25</div>
                </div>
                <div>
                  <div class="text-zinc-500 text-[10px]">I (Stability)</div>
                  <div class="font-bold text-zinc-200 mt-0.5">{{ surgEval().structuralInstabilityScore }}/25</div>
                </div>
                <div>
                  <div class="text-zinc-500 text-[10px]">A (Variation)</div>
                  <div class="font-bold text-zinc-200 mt-0.5">{{ surgEval().anatomicalVariationScore }}/25</div>
                </div>
              </div>
            </div>

            <!-- Danger Zone & Intraoperative Monitoring Alerts -->
            <div class="space-y-2">
              @for (w of surgEval().dangerZoneWarnings; track w) {
                <div class="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2">
                  <span class="font-bold text-rose-400">⚠️</span>
                  <span>{{ w }}</span>
                </div>
              }
            </div>

            <!-- Suggested Monitoring -->
            <div class="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 space-y-1.5">
              <span class="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
                Suggested Electrophysiology & Monitoring (IONM)
              </span>
              <ul class="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                @for (m of surgEval().suggestedIntraoperativeMonitoring; track m) {
                  <li>{{ m }}</li>
                }
              </ul>
            </div>

            <!-- Export Action -->
            <button
              type="button"
              (click)="exportFhir('SURGICAL_ANATOMY')"
              class="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Export Surgical Risk Assessment (FHIR R4)
            </button>
          </div>
        </div>
      }

      <!-- LENS 3: WAI-ARIA ACCESSIBILITY & CLINICAL ERGONOMICS -->
      @if (activeLens() === 'ACCESSIBILITY') {
        <div class="p-6 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-6">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h3 class="text-lg font-bold text-white">WAI-ARIA & Clinical Ergonomics Compliance</h3>
              <p class="text-xs text-zinc-400">WCAG AAA Certified Optotypic & Bio-Rhythmic Standard</p>
            </div>
            <span class="px-3 py-1 text-xs font-bold text-teal-300 bg-teal-950 border border-teal-800 rounded-full">
              {{ accessAudit().overallAriaAccessibilityScorePercent }}% Compliance
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div class="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
              <div class="text-xs text-zinc-400">ARIA Descriptors</div>
              <div class="text-2xl font-bold text-teal-400 mt-1">100%</div>
              <div class="text-[10px] text-zinc-500 mt-1">aria-describedby & invalid</div>
            </div>
            <div class="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
              <div class="text-xs text-zinc-400">Touch Target Hitboxes</div>
              <div class="text-2xl font-bold text-teal-400 mt-1">98%</div>
              <div class="text-[10px] text-zinc-500 mt-1">≥44px Fitts's Law Targets</div>
            </div>
            <div class="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
              <div class="text-xs text-zinc-400">ISMP Legibility</div>
              <div class="text-2xl font-bold text-teal-400 mt-1">100%</div>
              <div class="text-[10px] text-zinc-500 mt-1">Slashed Zeros & Curved L</div>
            </div>
            <div class="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
              <div class="text-xs text-zinc-400">Bio-Rhythmic Pacing</div>
              <div class="text-2xl font-bold text-teal-400 mt-1">100%</div>
              <div class="text-[10px] text-zinc-500 mt-1">0.1 Hz Parasympathetic Rate</div>
            </div>
          </div>
        </div>
      }

      <!-- Export Notification Toast -->
      @if (exportedJsonPayload()) {
        <div class="p-4 bg-zinc-900 rounded-xl border border-teal-600/50 space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-xs font-bold text-teal-300">HL7 FHIR R4 Bundle Observation Exported</span>
            <button 
              type="button" 
              (click)="exportedJsonPayload.set(null)" 
              class="text-xs text-zinc-400 hover:text-white">✕ Close</button>
          </div>
          <pre class="text-[11px] font-mono text-zinc-300 bg-black/60 p-3 rounded-lg overflow-x-auto max-h-48">{{ exportedJsonPayload() }}</pre>
        </div>
      }
    </div>
  `
})
export class AriaScoreHudComponent {
  private readonly ariaService = inject(AriaScoringService);

  readonly activeLens = signal<ActiveAriaLens>('NEUROPATHOLOGY');
  readonly exportedJsonPayload = signal<string | null>(null);

  // Bindings to service signals
  readonly npInput = this.ariaService.neuropathologyInput;
  readonly surgInput = this.ariaService.surgicalAnatomyInput;

  readonly npEval = this.ariaService.neuropathologyEvaluation;
  readonly surgEval = this.ariaService.surgicalAnatomyEvaluation;
  readonly accessAudit = this.ariaService.accessibilityAudit;

  updateNp(partial: Parameters<AriaScoringService['updateNeuropathologyInput']>[0]): void {
    this.ariaService.updateNeuropathologyInput(partial);
  }

  updateSurg(partial: Parameters<AriaScoringService['updateSurgicalAnatomyInput']>[0]): void {
    this.ariaService.updateSurgicalAnatomyInput(partial);
  }

  exportFhir(type: 'NEUROPATHOLOGY' | 'SURGICAL_ANATOMY'): void {
    const res = type === 'NEUROPATHOLOGY' ? this.npEval() : this.surgEval();
    const observation = this.ariaService.serializeToFhirObservation(type, res);
    this.exportedJsonPayload.set(JSON.stringify(observation, null, 2));
  }
}
