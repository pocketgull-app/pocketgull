import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AmbientScribeAdapterService,
  ScribeProvider,
  IScribeAdjudicationResult,
  IScribeCptReimbursementCode
} from '../../services/ambient-scribe-adapter.service';

interface IScribePreset {
  id: string;
  title: string;
  source: ScribeProvider;
  chiefComplaint: string;
  transcript: string;
}

const PRESETS: IScribePreset[] = [
  {
    id: 'sciatica_ddi',
    title: '⚠️ Sciatica & Insomnia (Lethal DDI & ISMP Defect)',
    source: 'abridge',
    chiefComplaint: 'Lumbar Radiculopathy & Insomnia',
    transcript: `Clinician: Good morning Mr. Davis. How is the lower back pain?
Patient: It's a severe burning pain shooting down into my left calf with tingling and numbness. I cannot sleep at all.
Clinician: Let's check your vitals. BP is 134/86, pulse 78, temp 98.6°F, SpO2 98%.
Clinician: Looking at your chart, I will order gabapentin 300.0 mg at bedtime. And for your severe nighttime spasms and insomnia, let's also add .5 mg clonazepam at night. We will check in after two weeks.`
  },
  {
    id: 'hypertension_stage2',
    title: '🫀 Stage 2 Hypertension (Act I Metabolic Bridge)',
    source: 'nuance_dax',
    chiefComplaint: 'Headache & Elevated Home Blood Pressure',
    transcript: `Clinician: Hello Mrs. Gomez. You reported elevated home blood pressures and mild throbbing headache.
Patient: Yes, my home cuff was reading over 140 systolic several times this week, especially in the mornings.
Clinician: In clinic today, your BP is 146/92, heart rate 72, respiratory rate 16, O2 sat 99%.
Clinician: We will initiate lisinopril 10.0 mg daily. Please log morning and evening ambulatory blood pressures for 14 days and avoid high-sodium processed foods.`
  },
  {
    id: 'frontline_malnutrition',
    title: '🌿 Frontline Nutrition & Tachypnea Triage',
    source: 'suki',
    chiefComplaint: 'Child Lethargy and Rapid Breathing',
    transcript: `Clinician: Community health worker evaluating 18-month-old female.
Caregiver: Child has been weak, vomiting, and breathing fast for two days.
Clinician: MUAC reading is 112 mm. Bilateral pedal pitting edema detected (+1 feet only). Respiratory rate 52 breaths per min with mild subcostal indrawing.
Clinician: Appetite test performed with RUTF sachet: child consumed less than 1/4 sachet. Urgent referral to stabilization center for inpatient F-75 therapeutic milk.`
  }
];

export type ScribeViewMode = 'SHOWCASE' | 'DETAILS' | 'AUDIT_JSON';

@Component({
  selector: 'app-ambient-scribe-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full max-w-5xl mx-auto bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl p-6 sm:p-7 font-sans relative overflow-hidden"
         role="region"
         aria-label="Ambient Scribe Co-Pilot Strategic Reasoner Showcase Hub">
      <!-- Ambient Glow Backdrop -->
      <div class="absolute -top-32 -left-32 w-80 h-80 bg-teal-500/10 blur-3xl rounded-full pointer-events-none"></div>
      <div class="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <!-- Header -->
      <header class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-5 mb-5 relative z-10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center text-xl shadow-xs">
            🎙️
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-zinc-50 tracking-tight">
                Ambient AI Scribe Ingestion &amp; CDS Adjudication
              </h2>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-950/80 text-teal-300 border border-teal-800/60 uppercase">
                Strategic Reasoner Co-Pilot
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">
              Side-by-side showcase: Passive transcription (Abridge, Nuance DAX Copilot &amp; Suki) + Active reasoning, ISMP audit &amp; CPT RPM/RTM capture
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 font-mono text-xs">
          <!-- View Mode Switcher -->
          <div class="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5">
            <button type="button"
                    (click)="activeView.set('SHOWCASE')"
                    [class.bg-teal-600]="activeView() === 'SHOWCASE'"
                    [class.text-white]="activeView() === 'SHOWCASE'"
                    [class.text-zinc-400]="activeView() !== 'SHOWCASE'"
                    class="px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer min-h-[32px]">
              ⚡ Side-by-Side
            </button>
            <button type="button"
                    (click)="activeView.set('DETAILS')"
                    [class.bg-teal-600]="activeView() === 'DETAILS'"
                    [class.text-white]="activeView() === 'DETAILS'"
                    [class.text-zinc-400]="activeView() !== 'DETAILS'"
                    class="px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer min-h-[32px]">
              📋 Clinical Details
            </button>
            <button type="button"
                    (click)="activeView.set('AUDIT_JSON')"
                    [class.bg-teal-600]="activeView() === 'AUDIT_JSON'"
                    [class.text-white]="activeView() === 'AUDIT_JSON'"
                    [class.text-zinc-400]="activeView() !== 'AUDIT_JSON'"
                    class="px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer min-h-[32px]">
              💻 Raw JSON
            </button>
          </div>

          <button type="button"
                  (click)="close.emit()"
                  aria-label="Close Ambient Scribe Drawer"
                  class="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer min-h-[44px] min-w-[44px]">
            ✕
          </button>
        </div>
      </header>

      <!-- Presets & Controls -->
      <div class="space-y-4 relative z-10 mb-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono font-bold uppercase text-zinc-400">Sample Encounter:</span>
            <div class="flex flex-wrap gap-1.5">
              @for (preset of presets; track preset.id) {
                <button type="button"
                        (click)="loadPreset(preset)"
                        [class.bg-teal-950]="selectedPresetId() === preset.id"
                        [class.text-teal-300]="selectedPresetId() === preset.id"
                        [class.border-teal-700]="selectedPresetId() === preset.id"
                        [class.bg-zinc-900]="selectedPresetId() !== preset.id"
                        [class.text-zinc-400]="selectedPresetId() !== preset.id"
                        class="px-2.5 py-1 rounded-xl border border-zinc-800 text-xs font-mono transition cursor-pointer hover:border-zinc-700 min-h-[36px]">
                  {{ preset.title }}
                </button>
              }
            </div>
          </div>

          <div class="flex items-center gap-2 text-xs font-mono">
            <span class="text-zinc-400">Source:</span>
            <select [ngModel]="selectedSource()"
                    (ngModelChange)="selectedSource.set($event)"
                    class="bg-zinc-900 border border-zinc-800 text-teal-300 rounded-xl px-2.5 py-1 text-xs cursor-pointer outline-none min-h-[36px]">
              <option value="abridge">Abridge Conversational</option>
              <option value="nuance_dax">Nuance DAX Copilot</option>
              <option value="suki">Suki Clinical AI</option>
              <option value="other">Other / Custom Audio Stream</option>
            </select>
          </div>
        </div>

        <!-- Transcript Input Textarea & Audio Simulation Bar -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <div class="flex items-center gap-2">
              <span>Raw Clinical Encounter Transcript:</span>
              <button type="button"
                      (click)="toggleAudioSimulation()"
                      class="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-zinc-800 hover:bg-zinc-700 text-teal-300 border border-zinc-700 flex items-center gap-1 cursor-pointer transition">
                <span>{{ isPlayingAudio() ? '⏸ Pause Audio' : '▶ Play Dialogue Audio' }}</span>
              </button>
            </div>
            <span>{{ transcriptText().length }} chars</span>
          </div>

          <!-- Animated Audio Visualizer Pacer (when playing) -->
          @if (isPlayingAudio()) {
            <div class="p-2.5 bg-zinc-900/90 border border-teal-500/30 rounded-xl flex items-center justify-between gap-3 text-xs font-mono">
              <span class="text-teal-400 font-bold flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                Bedside Audio Stream Ingestion Active
              </span>
              <div class="flex items-center gap-1 h-4">
                <div class="w-1 bg-teal-400 rounded-full animate-pulse h-3"></div>
                <div class="w-1 bg-teal-400 rounded-full animate-pulse h-4"></div>
                <div class="w-1 bg-teal-300 rounded-full animate-pulse h-2"></div>
                <div class="w-1 bg-teal-400 rounded-full animate-pulse h-4"></div>
                <div class="w-1 bg-emerald-400 rounded-full animate-pulse h-3"></div>
                <div class="w-1 bg-emerald-300 rounded-full animate-pulse h-4"></div>
                <div class="w-1 bg-teal-400 rounded-full animate-pulse h-2"></div>
                <div class="w-1 bg-teal-400 rounded-full animate-pulse h-3"></div>
              </div>
              <span class="text-[10px] text-zinc-400">Sampling Rate: 16 kHz • Zero Egress</span>
            </div>
          }

          <textarea rows="4"
                    [ngModel]="transcriptText()"
                    (ngModelChange)="transcriptText.set($event)"
                    placeholder="Paste ambient conversation transcript from Abridge, Nuance DAX, or voice dictation..."
                    class="w-full p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs text-zinc-200 font-mono leading-relaxed focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/60 outline-none resize-y"></textarea>
        </div>

        <!-- Action Row -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button type="button"
                    (click)="adjudicate()"
                    id="btn-adjudicate-transcript"
                    [disabled]="isAdjudicating() || transcriptText().trim().length === 0"
                    class="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed min-h-[40px]">
              <span>⚡</span> {{ isAdjudicating() ? 'Analyzing Transcript...' : 'Adjudicate Transcript' }}
            </button>
          </div>

          @if (adjudicationResult()) {
            <div class="flex items-center gap-2">
              <button type="button"
                      (click)="commitToChart()"
                      id="btn-commit-to-chart"
                      [disabled]="hasCommitted()"
                      class="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs min-h-[40px]">
                <span>{{ hasCommitted() ? '✓ Committed to Chart' : '📥 Approve & Commit to Chart' }}</span>
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Real-Time Adjudication HUD Results -->
      @if (adjudicationResult(); as res) {
        <div class="space-y-5 pt-4 border-t border-zinc-800/80 relative z-10 animate-in fade-in duration-200">

          <!-- TAB 1: SIDE-BY-SIDE STRATEGIC SHOWCASE (Scribe vs Reasoner) -->
          @if (activeView() === 'SHOWCASE') {
            <div class="space-y-4">
              <!-- Value Proposition Ribbon -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
                  <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Harmonized Architecture</span>
                  <span class="text-xs font-mono font-bold text-teal-300 mt-0.5 block">
                    Speech-to-Text + Clinical Reasoning
                  </span>
                  <span class="text-[10px] text-zinc-500">Symbiosis: Not Replacement</span>
                </div>
                <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
                  <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">ISMP &amp; DDI Intercepts</span>
                  <span class="text-xs font-mono font-bold text-rose-300 mt-0.5 block">
                    {{ res.drugInteractions.length }} Lethal DDI • {{ res.ismpSafetyAudit.violations.length }} ISMP Fixed
                  </span>
                  <span class="text-[10px] text-zinc-500">Zero-Defect Chart Ingress</span>
                </div>
                <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
                  <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">New Annual RPM/RTM Revenue</span>
                  <span class="text-xl font-mono font-black text-emerald-400 mt-0.5 block tabular-nums">
                    +$\{{ res.totalEstimatedAnnualReimbursementUsd }} <span class="text-xs font-normal text-zinc-400">/ patient / yr</span>
                  </span>
                  <span class="text-[10px] text-zinc-500">{{ res.cptReimbursement.length }} Qualifying CPT Codes</span>
                </div>
              </div>

              <!-- The Dual-Column Side-by-Side Comparison Grid -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                <!-- Left Column: Passive Scribe Output (Nuance DAX / Abridge / Suki) -->
                <div class="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-700/80 space-y-3.5">
                  <div class="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                    <div class="flex items-center gap-2">
                      <span class="text-base">🎙️</span>
                      <div>
                        <span class="text-xs font-mono font-bold text-zinc-200 block">
                          Passive Ambient Scribe
                        </span>
                        <span class="text-[10px] font-mono text-zinc-400">
                          {{ selectedSource() === 'abridge' ? 'Abridge Conversational AI' : selectedSource() === 'nuance_dax' ? 'Nuance DAX Copilot' : 'Suki Clinical AI' }}
                        </span>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase">
                      Speech-to-Text Only
                    </span>
                  </div>

                  <!-- Verbatim Transcription Snippet -->
                  <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-300 leading-relaxed max-h-48 overflow-y-auto">
                    <p class="whitespace-pre-wrap">{{ transcriptText() }}</p>
                  </div>

                  <!-- Critical Gaps / Blindspots in Passive Scribing -->
                  <div class="space-y-2">
                    <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 block">
                      ⚠️ What Passive Transcription Misses:
                    </span>
                    <div class="space-y-1.5 text-xs font-sans">
                      <div class="p-2.5 bg-rose-950/20 border border-rose-900/40 rounded-xl text-rose-300 flex items-start gap-2">
                        <span>🚨</span>
                        <div>
                          <strong>Zero DDI Screening:</strong> Passed lethal combinations straight to note without contraindication check.
                        </div>
                      </div>
                      <div class="p-2.5 bg-amber-950/20 border border-amber-900/40 rounded-xl text-amber-300 flex items-start gap-2">
                        <span>⚠️</span>
                        <div>
                          <strong>Zero Posology Guard:</strong> Trailing zeroes &amp; naked decimals recorded as spoken, creating medication administration errors.
                        </div>
                      </div>
                      <div class="p-2.5 bg-zinc-800/40 border border-zinc-700/40 rounded-xl text-zinc-400 flex items-start gap-2">
                        <span>❌</span>
                        <div>
                          <strong>Zero Reimbursement Optimization:</strong> Fails to identify qualifying CPT Remote Physiologic Monitoring codes.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right Column: Pocket-Gull Strategic Reasoner -->
                <div class="p-4 bg-teal-950/20 rounded-2xl border border-teal-500/40 space-y-3.5 shadow-lg">
                  <div class="flex items-center justify-between border-b border-teal-500/30 pb-2.5">
                    <div class="flex items-center gap-2">
                      <span class="text-base">🧠</span>
                      <div>
                        <span class="text-xs font-mono font-bold text-teal-200 block">
                          Pocket-Gull Strategic Reasoner
                        </span>
                        <span class="text-[10px] font-mono text-teal-400">
                          Active Clinical Reasoning &amp; Safety Intercept
                        </span>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 uppercase">
                      Clinical CDS Active
                    </span>
                  </div>

                  <!-- 1. Real-Time ISMP Correction -->
                  @if (res.ismpSafetyAudit.hasViolations) {
                    <div class="p-3 bg-zinc-950 rounded-xl border border-amber-500/40 space-y-1.5 text-xs font-mono">
                      <span class="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                        🛡️ ISMP High-Risk Defect Intercept:
                      </span>
                      @for (v of res.ismpSafetyAudit.violations; track v.original) {
                        <div class="flex items-center justify-between text-[11px]">
                          <span class="text-zinc-400">{{ v.type }}:</span>
                          <div>
                            <span class="text-rose-400 line-through">"{{ v.original }}"</span>
                            <span class="text-emerald-400 font-bold ml-1.5">→ "{{ v.corrected }}"</span>
                          </div>
                        </div>
                      }
                    </div>
                  }

                  <!-- 2. FDA Black Box Lethal DDI Warning -->
                  @if (res.drugInteractions.length > 0) {
                    <div class="p-3 bg-rose-950/40 border border-rose-600/70 rounded-xl text-xs space-y-1 font-sans">
                      <div class="flex items-center gap-1.5 font-mono font-bold text-rose-300 text-[11px] uppercase">
                        <span>⚠️</span>
                        <span>FDA Black Box Alert: {{ res.drugInteractions[0].primaryDrug }}</span>
                      </div>
                      <p class="text-zinc-300 text-[11px]">{{ res.drugInteractions[0].clinicalMechanism }}</p>
                      <p class="text-teal-300 font-mono text-[10px]"><strong>Directive:</strong> {{ res.drugInteractions[0].recommendedAction }}</p>
                    </div>
                  }

                  <!-- 3. CPT RPM / RTM Reimbursement Coding Engine -->
                  <div class="p-3 bg-emerald-950/20 border border-emerald-500/40 rounded-xl space-y-2 text-xs font-mono">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        💰 CPT RPM/RTM Coding Capture:
                      </span>
                      <span class="text-xs font-bold text-emerald-300">
                        +$\{{ res.totalEstimatedAnnualReimbursementUsd }} / yr
                      </span>
                    </div>
                    <div class="space-y-1 text-[11px]">
                      @for (cpt of res.cptReimbursement; track cpt.cptCode) {
                        <div class="p-2 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
                          <div>
                            <strong class="text-teal-300">CPT {{ cpt.cptCode }}</strong>
                            <span class="text-zinc-400 ml-1.5 text-[10px]">({{ cpt.category }}) {{ cpt.title }}</span>
                          </div>
                          <span class="text-emerald-400 font-bold tabular-nums">+$\{{ cpt.estimatedPaymentUsd }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- 4. Three Acts Clinical Pathway -->
                  <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1 text-xs font-mono">
                    <span class="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                      🧬 Three Acts Clinical Care Pathway:
                    </span>
                    <div class="flex flex-wrap gap-1.5 pt-1">
                      @for (pathway of res.recommendedPathways; track pathway.pathwayId) {
                        <span class="px-2 py-0.5 rounded-lg text-[10px] bg-zinc-900 border border-teal-500/30 text-teal-300">
                          {{ pathway.pathwayName }}
                        </span>
                      }
                    </div>
                  </div>

                  <!-- 5. FDA 21 CFR Part 11 Electronic Signature Seal -->
                  <div class="text-[10px] font-mono text-zinc-500 flex items-center justify-between pt-1">
                    <span>Part 11 Seal: {{ res.integrityDigest.slice(0, 16) }}...</span>
                    <span class="text-emerald-400">✓ Cryptographically Sealed</span>
                  </div>

                </div>

              </div>
            </div>
          }

          <!-- TAB 2: CLINICAL DETAILS & SBAR REPORT -->
          @if (activeView() === 'DETAILS') {
            <div class="space-y-4">
              <!-- 1. Lethal / High-Risk DDI Warning Banner (if detected) -->
              @if (res.drugInteractions.length > 0) {
                <div class="p-4 bg-rose-950/40 border border-rose-600/70 rounded-2xl text-rose-200 space-y-2">
                  <div class="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
                    <span class="text-base">⚠️</span>
                    <span>FDA Black Box &amp; Lethal Polypharmacy Intercept Detected ({{ res.drugInteractions.length }})</span>
                  </div>
                  @for (ddi of res.drugInteractions; track ddi.primaryDrug) {
                    <div class="p-3 bg-zinc-950/80 rounded-xl border border-rose-800/50 space-y-1 text-xs">
                      <div class="flex items-center justify-between">
                        <strong class="text-rose-300 font-mono">{{ ddi.primaryDrug }} + {{ ddi.interactingDrug }}</strong>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-900/80 text-rose-100">
                          {{ ddi.severity }}
                        </span>
                      </div>
                      <p class="text-zinc-300">{{ ddi.clinicalMechanism }}</p>
                      <p class="text-teal-300 font-mono text-[11px]"><strong>Action:</strong> {{ ddi.recommendedAction }}</p>
                    </div>
                  }
                </div>
              }

              <!-- 2. ISMP Posology Safety Banner (Trailing Zeros & Naked Decimals) -->
              @if (res.ismpSafetyAudit.hasViolations) {
                <div class="p-4 bg-amber-950/40 border border-amber-600/60 rounded-2xl text-amber-200 space-y-2 text-xs">
                  <div class="flex items-center gap-2 font-mono font-bold uppercase tracking-wider">
                    <span class="text-base">⚠️</span>
                    <span>ISMP Medication Safety Defect Intercept ({{ res.ismpSafetyAudit.violations.length }})</span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                    @for (violation of res.ismpSafetyAudit.violations; track violation.original) {
                      <div class="p-2.5 bg-zinc-950 rounded-xl border border-amber-800/40">
                        <span class="text-zinc-400 block">{{ violation.type }}:</span>
                        <span class="text-rose-400 line-through">"{{ violation.original }}"</span>
                        <span class="text-emerald-400 font-bold ml-2">→ "{{ violation.corrected }}"</span>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- 3. Extracted Entities Grid (Vitals, Symptoms, Meds) -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <!-- Vitals Card -->
                <div class="p-3.5 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-1.5">
                  <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Parsed Vitals</span>
                  <div class="space-y-1 font-mono text-xs">
                    @if (res.extractedEntities.vitals.bloodPressureSystolic) {
                      <div class="flex justify-between">
                        <span class="text-zinc-400">BP:</span>
                        <strong class="text-emerald-400">{{ res.extractedEntities.vitals.bloodPressureSystolic }}/{{ res.extractedEntities.vitals.bloodPressureDiastolic || '--' }} mmHg</strong>
                      </div>
                    }
                    @if (res.extractedEntities.vitals.heartRate) {
                      <div class="flex justify-between">
                        <span class="text-zinc-400">Pulse:</span>
                        <strong class="text-emerald-400">{{ res.extractedEntities.vitals.heartRate }} bpm</strong>
                      </div>
                    }
                    @if (res.extractedEntities.vitals.oxygenSaturation) {
                      <div class="flex justify-between">
                        <span class="text-zinc-400">SpO2:</span>
                        <strong class="text-emerald-400">{{ res.extractedEntities.vitals.oxygenSaturation }}%</strong>
                      </div>
                    }
                    @if (res.extractedEntities.vitals.temperatureFahrenheit) {
                      <div class="flex justify-between">
                        <span class="text-zinc-400">Temp:</span>
                        <strong class="text-emerald-400">{{ res.extractedEntities.vitals.temperatureFahrenheit }}°F</strong>
                      </div>
                    }
                  </div>
                </div>

                <!-- Symptoms Card -->
                <div class="p-3.5 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-1.5">
                  <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Identified Symptoms</span>
                  <div class="flex flex-wrap gap-1">
                    @for (sym of res.extractedEntities.symptoms; track sym) {
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-800 text-zinc-200 border border-zinc-700">
                        {{ sym }}
                      </span>
                    }
                  </div>
                </div>

                <!-- Medications Card -->
                <div class="p-3.5 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-1.5">
                  <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Proposed Medications</span>
                  <div class="space-y-1 font-mono text-[11px]">
                    @for (med of res.extractedEntities.medications; track med.name) {
                      <div class="text-zinc-300">
                        <strong class="text-teal-300">{{ med.name }}</strong> {{ med.dosage || '' }}
                        <span class="text-[9px] px-1 rounded bg-zinc-800 text-zinc-400 uppercase ml-1">{{ med.action }}</span>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- 4. Three Acts CDS Pathway Recommendations -->
              <div class="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 space-y-2 text-xs">
                <span class="font-mono font-bold uppercase tracking-wider text-zinc-400 block text-[10px]">
                  Mapped Three Acts Clinical CDS Pathways
                </span>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  @for (pathway of res.recommendedPathways; track pathway.pathwayId) {
                    <div class="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-[11px] space-y-0.5">
                      <span class="text-teal-300 font-bold block">{{ pathway.pathwayName }}</span>
                      <p class="text-zinc-400 text-[10px] font-sans">{{ pathway.rationale }}</p>
                    </div>
                  }
                </div>
              </div>

              <!-- 5. Structured SBAR Clinical Note Preview -->
              <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 space-y-2 font-mono text-xs">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span class="font-bold text-zinc-200 uppercase tracking-wider">Synthesized SBAR Note</span>
                  <span class="text-[10px] text-zinc-400">FDA 21 CFR Part 11: {{ res.integrityDigest.slice(0, 16) }}...</span>
                </div>
                <div class="space-y-1.5 text-zinc-300 text-[11px] leading-relaxed">
                  <div><strong class="text-teal-400">S (Situation):</strong> {{ res.sbarSummary.situation }}</div>
                  <div><strong class="text-teal-400">B (Background):</strong> {{ res.sbarSummary.background }}</div>
                  <div><strong class="text-teal-400">A (Assessment):</strong> {{ res.sbarSummary.assessment }}</div>
                  <div><strong class="text-teal-400">R (Recommendation):</strong> {{ res.sbarSummary.recommendation }}</div>
                </div>
              </div>
            </div>
          }

          <!-- TAB 3: RAW JSON & AUDIT PROOF -->
          @if (activeView() === 'AUDIT_JSON') {
            <div class="space-y-3 font-mono text-xs">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-teal-300">FDA 21 CFR Part 11 Electronic Record JSON</span>
                <span class="text-[10px] text-zinc-500">SHA-256 Digest: {{ res.integrityDigest }}</span>
              </div>
              <pre class="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-[11px] text-teal-300 max-h-96 overflow-y-auto overflow-x-auto leading-relaxed">{{ res | json }}</pre>
            </div>
          }

        </div>
      }
    </div>
  `
})
export class AmbientScribeDrawerComponent {
  readonly scribeService = inject(AmbientScribeAdapterService);
  readonly close = output<void>();

  presets = PRESETS;
  selectedPresetId = signal<string>(PRESETS[0].id);
  selectedSource = signal<ScribeProvider>('abridge');
  transcriptText = signal<string>(PRESETS[0].transcript);

  activeView = signal<ScribeViewMode>('SHOWCASE');
  isPlayingAudio = signal<boolean>(false);

  isAdjudicating = signal<boolean>(false);
  adjudicationResult = signal<IScribeAdjudicationResult | null>(null);
  hasCommitted = signal<boolean>(false);

  loadPreset(preset: IScribePreset): void {
    this.selectedPresetId.set(preset.id);
    this.selectedSource.set(preset.source);
    this.transcriptText.set(preset.transcript);
    this.adjudicationResult.set(null);
    this.hasCommitted.set(false);
    this.isPlayingAudio.set(false);
  }

  toggleAudioSimulation(): void {
    this.isPlayingAudio.update(v => !v);
  }

  setActiveView(view: ScribeViewMode): void {
    this.activeView.set(view);
  }

  async adjudicate(): Promise<void> {
    this.isAdjudicating.set(true);
    try {
      const result = await this.scribeService.adjudicateTranscript({
        scribeSource: this.selectedSource(),
        rawTranscript: this.transcriptText(),
        autoCommitToPatientState: false
      });
      this.adjudicationResult.set(result);
      this.hasCommitted.set(false);
    } finally {
      this.isAdjudicating.set(false);
    }
  }

  async commitToChart(): Promise<void> {
    const res = this.adjudicationResult();
    if (!res) return;

    // Run again with autoCommitToPatientState = true
    await this.scribeService.adjudicateTranscript({
      scribeSource: this.selectedSource(),
      rawTranscript: this.transcriptText(),
      autoCommitToPatientState: true
    });
    this.hasCommitted.set(true);
  }
}
