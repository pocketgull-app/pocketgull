import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmbientScribeService, IScribeDialogueTurn, IStructuredSoapNote } from '../../services/ambient-scribe.service';

@Component({
  selector: 'app-ambient-clinical-scribe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full max-w-7xl mx-auto p-4 sm:p-6 bg-stone-950 text-stone-100 rounded-3xl border border-stone-800 shadow-2xl space-y-6">
      
      <!-- Top Header & Live Telemetry HUD -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <div class="flex items-center gap-3">
            <span class="p-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xl">🎙️</span>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-stone-100 font-sans">
                  Ambient Multimodal Clinical Scribe
                </h2>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-900/60 text-teal-300 border border-teal-700/50">
                  FHIR R4 & ICD-10 Live
                </span>
              </div>
              <p class="text-xs sm:text-sm text-stone-400 mt-0.5">
                Real-time ambient consultation listening, speaker diarization, and automated SOAP note synthesis.
              </p>
            </div>
          </div>
        </div>

        <!-- Action HUD & Scenario Selectors -->
        <div class="flex flex-wrap items-center gap-2">
          @if (!scribe.isListening() && !scribe.isProcessingSoap()) {
            <div class="flex items-center gap-1.5">
              <button 
                (click)="runScenario('hypertension-fatigue')"
                class="px-3 py-1.5 text-xs font-semibold rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all flex items-center gap-1.5 shadow-sm active:scale-95">
                <span>🩺</span> Demo: Hypertension (Primary Care)
              </button>
              <button 
                (click)="runScenario('type2-diabetes-metabolic')"
                class="px-3 py-1.5 text-xs font-semibold rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all flex items-center gap-1.5 shadow-sm active:scale-95">
                <span>🩸</span> Demo: T2DM & Neuropathy
              </button>
            </div>
          }

          @if (scribe.isListening()) {
            <button 
              (click)="scribe.stopListening()"
              class="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white shadow-md animate-pulse flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
              Stop Listening
            </button>
          } @else if (scribe.isProcessingSoap()) {
            <div class="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-2">
              <svg class="animate-spin h-3.5 w-3.5 text-amber-300" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Synthesizing Structured SOAP Note...
            </div>
          } @else {
            <button 
              (click)="scribe.startListening('hypertension-fatigue')"
              class="px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow-md transition-all active:scale-95 flex items-center gap-2">
              <span>▶️</span> Start Ambient Scribe
            </button>
          }

          <button 
            (click)="scribe.purgeScribeState()"
            title="Purge transient memory buffer (HIPAA Safe Harbor)"
            class="px-3 py-2 text-xs font-medium rounded-xl bg-stone-900 hover:bg-rose-950/40 text-stone-400 hover:text-rose-300 border border-stone-800 transition-all">
            🗑️ Purge
          </button>
        </div>
      </div>

      <!-- Live Audio Waveform & Diarization Stream -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left Panel: Live Dialogue Transcript (4 cols) -->
        <div class="lg:col-span-5 bg-stone-900/80 rounded-2xl border border-stone-800/80 p-4 flex flex-col h-[560px]">
          
          <div class="flex items-center justify-between pb-3 border-b border-stone-800">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" [ngClass]="scribe.isListening() ? 'bg-green-500 animate-pulse' : 'bg-stone-600'"></span>
              <h3 class="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Live Dialogue Stream ({{ scribe.totalTurns() }} turns)
              </h3>
            </div>

            <!-- Audio Level Equalizer Bars -->
            @if (scribe.isListening()) {
              <div class="flex items-end gap-0.5 h-4">
                <div class="w-1 bg-teal-400 rounded-full animate-bounce h-3"></div>
                <div class="w-1 bg-teal-400 rounded-full animate-bounce h-4" style="animation-delay: 150ms"></div>
                <div class="w-1 bg-teal-400 rounded-full animate-bounce h-2" style="animation-delay: 300ms"></div>
                <div class="w-1 bg-teal-400 rounded-full animate-bounce h-4" style="animation-delay: 75ms"></div>
              </div>
            }
          </div>

          <!-- Dialogue Messages Scroll Container -->
          <div class="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
            @if (scribe.dialogueTurns().length === 0) {
              <div class="flex flex-col items-center justify-center h-full text-center text-stone-500 space-y-2 p-6">
                <span class="text-3xl">🎙️</span>
                <p class="font-medium">Ready to capture ambient encounter dialogue.</p>
                <p class="text-[11px] text-stone-600">Click a demo simulation above or start live capture.</p>
              </div>
            } @else {
              @for (turn of scribe.dialogueTurns(); track turn.id) {
                <div class="p-3 rounded-xl border transition-all"
                  [ngClass]="turn.speaker === 'clinician' 
                    ? 'bg-teal-950/20 border-teal-800/40 ml-2' 
                    : 'bg-stone-800/60 border-stone-700/50 mr-2'">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-bold flex items-center gap-1.5"
                      [ngClass]="turn.speaker === 'clinician' ? 'text-teal-300' : 'text-stone-300'">
                      <span>{{ turn.speaker === 'clinician' ? '🩺' : '👤' }}</span>
                      {{ turn.speakerName }}
                    </span>
                    <span class="text-[10px] text-stone-500 font-mono">{{ turn.timestamp }}</span>
                  </div>
                  <p class="text-stone-200 leading-relaxed">{{ turn.text }}</p>
                  <div class="mt-1.5 flex items-center justify-between text-[10px] text-stone-500">
                    <span>Diarization confidence: {{ (turn.confidence * 100) | number:'1.0-0' }}%</span>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Quick Spoken Turn Add -->
          <div class="pt-2 border-t border-stone-800 flex gap-2">
            <input 
              #customInput
              type="text" 
              placeholder="Inject clinician observation or patient statement..." 
              (keyup.enter)="addCustomTurn(customInput.value); customInput.value = ''"
              class="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-teal-500" />
            <button 
              (click)="addCustomTurn(customInput.value); customInput.value = ''"
              class="px-3 py-1.5 text-xs bg-stone-800 hover:bg-stone-700 rounded-xl text-stone-200 font-medium border border-stone-700">
              Add
            </button>
          </div>
        </div>

        <!-- Right Panel: Structured SOAP Note (7 cols) -->
        <div class="lg:col-span-7 bg-stone-900/90 rounded-2xl border border-stone-800/80 p-5 flex flex-col h-[560px]">
          
          <div class="flex items-center justify-between pb-3 border-b border-stone-800">
            <div class="flex items-center gap-2">
              <span class="text-base">📋</span>
              <h3 class="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Structured Clinical SOAP Note & Coding
              </h3>
            </div>

            @if (scribe.soapNote()) {
              <div class="flex items-center gap-2">
                <button 
                  (click)="copyFhirJson()"
                  class="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-all flex items-center gap-1">
                  <span>{{ copiedFhir() ? '✅ Copied' : '📄 Copy FHIR' }}</span>
                </button>
                <button 
                  (click)="printSoapNote()"
                  class="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-teal-900/40 hover:bg-teal-800/50 text-teal-300 border border-teal-700/40 transition-all flex items-center gap-1">
                  <span>🖨️ Print Chart</span>
                </button>
              </div>
            }
          </div>

          <!-- SOAP Content Area -->
          <div class="flex-1 overflow-y-auto py-3 space-y-4 pr-1 text-xs">
            @if (!scribe.soapNote()) {
              <div class="flex flex-col items-center justify-center h-full text-center text-stone-500 space-y-2 p-8">
                <span class="text-4xl">📝</span>
                <p class="font-medium text-stone-400">No active SOAP synthesis generated yet.</p>
                <p class="text-xs text-stone-600 max-w-sm">
                  Run a simulation or converse in the audio stream to automatically synthesize clinical Subjective, Objective, Assessment, and Plan documentation.
                </p>
              </div>
            } @else {
              @let soap = scribe.soapNote()!;

              <!-- S - Subjective -->
              <div class="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-teal-400 flex items-center gap-1.5 text-xs">
                    <span class="w-4 h-4 rounded bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px]">S</span>
                    SUBJECTIVE (Patient History & HPI)
                  </span>
                  @if (soap.subjective.reportedPainScale !== undefined) {
                    <span class="text-[10px] px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/40">
                      Pain Scale: {{ soap.subjective.reportedPainScale }}/10
                    </span>
                  }
                </div>
                <div class="text-stone-300 text-[11px] space-y-1">
                  <p><strong class="text-stone-400">Chief Complaint:</strong> {{ soap.subjective.chiefComplaint }}</p>
                  <p><strong class="text-stone-400">HPI:</strong> {{ soap.subjective.historyOfPresentIllness }}</p>
                  <div class="flex flex-wrap gap-1 mt-1">
                    @for (ros of soap.subjective.reviewOfSystems; track ros) {
                      <span class="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-400 text-[10px]">
                        {{ ros }}
                      </span>
                    }
                  </div>
                </div>
              </div>

              <!-- O - Objective -->
              <div class="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sky-400 flex items-center gap-1.5 text-xs">
                    <span class="w-4 h-4 rounded bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px]">O</span>
                    OBJECTIVE (Vitals & Physical Exam)
                  </span>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-stone-300">
                  <div class="p-2 rounded bg-stone-900/60 border border-stone-800">
                    <span class="text-[10px] text-stone-500 block">Blood Pressure</span>
                    <span class="font-bold text-stone-200">{{ soap.objective.vitals.bloodPressure || 'N/A' }}</span>
                  </div>
                  <div class="p-2 rounded bg-stone-900/60 border border-stone-800">
                    <span class="text-[10px] text-stone-500 block">Resting Pulse</span>
                    <span class="font-bold text-stone-200">{{ soap.objective.vitals.heartRate ? soap.objective.vitals.heartRate + ' bpm' : 'N/A' }}</span>
                  </div>
                  <div class="p-2 rounded bg-stone-900/60 border border-stone-800">
                    <span class="text-[10px] text-stone-500 block">SpO2 Oxygen</span>
                    <span class="font-bold text-stone-200">{{ soap.objective.vitals.oxygenSaturation ? soap.objective.vitals.oxygenSaturation + '%' : 'N/A' }}</span>
                  </div>
                  <div class="p-2 rounded bg-stone-900/60 border border-stone-800">
                    <span class="text-[10px] text-stone-500 block">BMI</span>
                    <span class="font-bold text-stone-200">{{ soap.objective.vitals.bmi || 'N/A' }}</span>
                  </div>
                </div>
                <div class="text-[11px] text-stone-300 space-y-0.5">
                  @for (exam of soap.objective.physicalExam; track exam) {
                    <p class="text-stone-400">• {{ exam }}</p>
                  }
                </div>
              </div>

              <!-- A - Assessment -->
              <div class="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                    <span class="w-4 h-4 rounded bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px]">A</span>
                    ASSESSMENT & DIFFERENTIAL DIAGNOSES
                  </span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/40">
                    ICD-10: {{ soap.assessment.icd10Code }}
                  </span>
                </div>
                <p class="text-stone-200 font-semibold text-[11px]">
                  {{ soap.assessment.primaryDiagnosis }}
                </p>
                <div class="space-y-1">
                  @for (diff of soap.assessment.differentialDiagnoses; track diff.icd10Code) {
                    <div class="flex items-start justify-between text-[10px] p-1.5 rounded bg-stone-900/80 border border-stone-800">
                      <div>
                        <strong class="text-stone-300">{{ diff.condition }}</strong>
                        <span class="text-stone-500 ml-1">({{ diff.icd10Code }})</span>
                        <p class="text-stone-400 text-[9px] mt-0.5">{{ diff.rationale }}</p>
                      </div>
                      <span class="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold"
                        [ngClass]="diff.likelihood === 'high' ? 'bg-rose-950 text-rose-300' : 'bg-stone-800 text-stone-400'">
                        {{ diff.likelihood }}
                      </span>
                    </div>
                  }
                </div>
              </div>

              <!-- P - Plan -->
              <div class="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                    <span class="w-4 h-4 rounded bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">P</span>
                    PLAN & PHARMACOTHERAPY
                  </span>
                  <span class="text-[10px] text-stone-400 font-mono">Follow-up: {{ soap.plan.followUpTimeline }}</span>
                </div>
                
                <!-- Prescriptions -->
                <div class="space-y-1">
                  @for (rx of soap.plan.pharmacotherapy; track rx.drug) {
                    <div class="p-2 rounded bg-stone-900 border border-stone-800 text-[11px]">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-stone-200">💊 {{ rx.drug }} {{ rx.dosage }}</span>
                        <span class="text-[10px] text-stone-400">{{ rx.frequency }}</span>
                      </div>
                      @if (rx.cpicGuidelineFlag) {
                        <span class="text-[9px] text-teal-400 block mt-0.5">🧬 CPIC: {{ rx.cpicGuidelineFlag }}</span>
                      }
                    </div>
                  }
                </div>

                <!-- Suggested Billing CPT Codes -->
                <div class="pt-2 border-t border-stone-800/80 flex flex-wrap items-center gap-1.5">
                  <span class="text-[10px] text-stone-500 font-semibold">Suggested Billing:</span>
                  @for (cpt of soap.plan.suggestedCptCodes; track cpt.code) {
                    <span class="px-2 py-0.5 rounded-md bg-stone-900 border border-stone-700 text-stone-300 text-[10px] font-mono" title="{{ cpt.description }}">
                      CPT {{ cpt.code }} ({{ cpt.reimbursementTier }})
                    </span>
                  }
                </div>
              </div>

              <!-- Global Evidence Footer -->
              <div class="p-2.5 rounded-xl bg-teal-950/30 border border-teal-900/50 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-teal-300 gap-2">
                <span class="flex items-center gap-1.5">
                  <span>🏛️</span>
                  <span>{{ soap.evidenceSummary.cochraneEvidenceLevel }}</span>
                </span>
                <span class="font-mono text-stone-400">
                  H₀ p = {{ soap.evidenceSummary.nullHypothesisPValue }} | Conf: {{ (soap.evidenceSummary.confidenceScore * 100) | number:'1.0-0' }}%
                </span>
              </div>
            }
          </div>

        </div>

      </div>

    </div>
  `
})
export class AmbientClinicalScribeComponent {
  readonly scribe = inject(AmbientScribeService);
  readonly copiedFhir = signal<boolean>(false);

  runScenario(scenarioId: string): void {
    this.scribe.runSimulationScenario(scenarioId);
  }

  addCustomTurn(text: string): void {
    if (!text || !text.trim()) return;
    this.scribe.addTurn('clinician', text);
  }

  copyFhirJson(): void {
    const bundle = this.scribe.exportFhirR4SoapBundle();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(bundle, null, 2));
      this.copiedFhir.set(true);
      setTimeout(() => this.copiedFhir.set(false), 2500);
    }
  }

  printSoapNote(): void {
    const soap = this.scribe.soapNote();
    if (!soap) return;
    window.print();
  }
}
