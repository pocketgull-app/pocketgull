import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SoapNoteGeneratorService, IDiarizedTurn, ScribeSpeaker } from '../services/soap-note-generator.service';

@Component({
  selector: 'app-soap-note-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-5 sm:p-6 rounded-3xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-purple-500/30 shadow-2xl space-y-5 transition-all">
      
      <!-- Top Scribe Header & Control HUD -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-4">
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/40 flex items-center justify-center text-xl shadow-inner">
            🎙️
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-black uppercase tracking-[0.15em] text-zinc-900 dark:text-zinc-100">
                Ambient Multimodal Clinical Scribe
              </h2>
              <span class="px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded-full border border-purple-500/30">
                USCDI v4 & FHIR R4
              </span>
            </div>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Multi-speaker acoustic diarization &bull; Automated SOAP note synthesis &bull; Real-time ICD-10 / SNOMED / CPT crosswalk
            </p>
          </div>
        </div>

        <!-- Scenario Selector & Quick Action Controls -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Scenario Picker -->
          <div class="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5">
            <span class="text-[11px] font-mono font-bold text-zinc-500 dark:text-zinc-400">Scenario:</span>
            <select
              [ngModel]="soap.selectedScenarioId()"
              (ngModelChange)="soap.loadScenario($event)"
              class="bg-transparent text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer">
              @for (scen of soap.availableScenarios(); track scen.id) {
                <option [value]="scen.id" class="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                  {{ scen.title }} ({{ scen.specialty }})
                </option>
              }
            </select>
          </div>

          <!-- Ambient Scribing Live Toggle -->
          <button
            type="button"
            (click)="toggleScribing()"
            [class]="soap.isScribing()
              ? 'min-h-[44px] px-3.5 py-2 text-xs font-mono font-extrabold uppercase tracking-wider bg-red-500 text-white rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2 active:scale-95'
              : 'min-h-[44px] px-3.5 py-2 text-xs font-mono font-extrabold uppercase tracking-wider bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95'">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" [class.hidden]="!soap.isScribing()"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5" [class]="soap.isScribing() ? 'bg-white' : 'bg-purple-200'"></span>
            </span>
            <span>{{ soap.isScribing() ? '⏹ Stop Scribing' : '🎙️ Start Ambient Scribing' }}</span>
          </button>

          <!-- Copy Note -->
          <button
            type="button"
            (click)="copyNoteToClipboard()"
            class="min-h-[44px] px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800">
            <span>{{ copied() ? '✓ Copied' : '📋 Copy Note' }}</span>
          </button>
        </div>
      </div>

      <!-- Live Audio Waveform & Turn Telemetry Bar -->
      <div class="p-3.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-4">
          <!-- Audio wavebars indicator -->
          <div class="flex items-center gap-1 h-5">
            <span class="w-1 bg-purple-500 rounded-full transition-all duration-150" [style.height]="soap.isScribing() ? '18px' : '4px'"></span>
            <span class="w-1 bg-purple-500 rounded-full transition-all duration-150" [style.height]="soap.isScribing() ? '12px' : '6px'"></span>
            <span class="w-1 bg-purple-500 rounded-full transition-all duration-150" [style.height]="soap.isScribing() ? '20px' : '4px'"></span>
            <span class="w-1 bg-purple-500 rounded-full transition-all duration-150" [style.height]="soap.isScribing() ? '14px' : '5px'"></span>
            <span class="w-1 bg-purple-500 rounded-full transition-all duration-150" [style.height]="soap.isScribing() ? '16px' : '4px'"></span>
          </div>

          <div class="text-xs font-mono">
            <span class="text-zinc-500 dark:text-zinc-400">Total Dialogue Turns: </span>
            <span class="font-bold text-zinc-900 dark:text-zinc-100">{{ soap.totalTurns() }}</span>
            <span class="text-zinc-400 mx-2">&bull;</span>
            <span class="text-blue-600 dark:text-blue-400 font-bold">👨‍⚕️ Clinician: {{ soap.clinicianTurnCount() }}</span>
            <span class="text-zinc-400 mx-1.5">&bull;</span>
            <span class="text-emerald-600 dark:text-emerald-400 font-bold">👤 Patient: {{ soap.patientTurnCount() }}</span>
            @if (soap.caregiverTurnCount() > 0) {
              <span class="text-zinc-400 mx-1.5">&bull;</span>
              <span class="text-purple-600 dark:text-purple-400 font-bold">👥 Caregiver: {{ soap.caregiverTurnCount() }}</span>
            }
          </div>
        </div>

        <!-- Export Actions -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="downloadFhirBundle()"
            class="min-h-[40px] px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-purple-300 hover:text-white rounded-xl border border-purple-500/40 transition cursor-pointer shadow-sm">
            Export FHIR R4 Bundle (.json)
          </button>
          <button
            type="button"
            (click)="downloadTranscript()"
            class="min-h-[40px] px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-blue-300 hover:text-white rounded-xl border border-blue-500/40 transition cursor-pointer shadow-sm">
            Transcript (.txt)
          </button>
        </div>
      </div>

      <!-- Main Two-Column Layout: Multi-Speaker Feed (Left) & Real-Time SOAP Note (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        <!-- Left: Multi-Speaker Diarized Transcript Feed (5 cols) -->
        <div class="lg:col-span-5 space-y-3 flex flex-col">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <span>🗣️ Diarized Dialogue Stream</span>
            </h3>
            <span class="text-[10px] font-mono text-zinc-500">
              Auto-Transcribing
            </span>
          </div>

          <!-- Transcript Scroll Window -->
          <div class="p-3.5 rounded-2xl bg-zinc-50/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 max-h-[500px] overflow-y-auto space-y-3">
            @for (turn of soap.diarizedTurns(); track turn.id) {
              <div
                class="p-3 rounded-xl border transition-all"
                [class]="turn.speaker === 'CLINICIAN'
                  ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500/30'
                  : (turn.speaker === 'PATIENT'
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/30'
                    : 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-500/30')">
                
                <div class="flex items-center justify-between mb-1.5">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold font-mono"
                      [class]="turn.speaker === 'CLINICIAN'
                        ? 'text-blue-700 dark:text-blue-300'
                        : (turn.speaker === 'PATIENT'
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-purple-700 dark:text-purple-300')">
                      {{ turn.speaker === 'CLINICIAN' ? '👨‍⚕️' : (turn.speaker === 'PATIENT' ? '👤' : '👥') }}
                      {{ turn.speakerName }}
                    </span>
                    <span class="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {{ turn.speaker }}
                    </span>
                  </div>
                  <span class="text-[10px] font-mono text-zinc-400">
                    {{ turn.timestamp }}
                  </span>
                </div>

                <p class="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                  {{ turn.text }}
                </p>

                @if (turn.keyEntities && turn.keyEntities.length > 0) {
                  <div class="flex flex-wrap gap-1 mt-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/60">
                    @for (entity of turn.keyEntities; track entity) {
                      <span class="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white/80 dark:bg-zinc-900/80 border border-zinc-300/60 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300">
                        ⚡ {{ entity }}
                      </span>
                    }
                  </div>
                }
              </div>
            } @empty {
              <div class="text-center py-10 text-zinc-400 text-xs font-mono">
                No ambient speech turns recorded yet. Select a scenario or start live scribing.
              </div>
            }
          </div>

          <!-- Add Quick Turn Form -->
          <div class="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div class="flex items-center gap-2">
              <select
                [(ngModel)]="manualSpeaker"
                class="text-xs font-mono font-bold bg-white dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <option value="CLINICIAN">👨‍⚕️ Clinician</option>
                <option value="PATIENT">👤 Patient</option>
                <option value="CAREGIVER">👥 Caregiver</option>
              </select>
              <input
                type="text"
                [(ngModel)]="manualSpeakerName"
                placeholder="Speaker Name..."
                class="flex-1 text-xs font-sans bg-white dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-purple-500" />
            </div>
            <div class="flex items-center gap-2">
              <input
                type="text"
                [(ngModel)]="manualTurnText"
                (keyup.enter)="submitManualTurn()"
                placeholder="Enter live speech utterance and press Enter..."
                class="flex-1 text-xs font-sans bg-white dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-purple-500" />
              <button
                type="button"
                (click)="submitManualTurn()"
                class="min-h-[40px] px-3 py-1.5 text-xs font-mono font-bold uppercase bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition cursor-pointer">
                Add Turn
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Structured Real-Time SOAP Note Editor & Crosswalk HUD (7 cols) -->
        <div class="lg:col-span-7 space-y-4 flex flex-col">
          
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <span>📝 Structured Clinical SOAP Note (Progress Note)</span>
            </h3>
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="soap.refreshObjectiveFromVitals()"
                class="min-h-[38px] px-2.5 py-1 text-[11px] font-mono font-bold uppercase bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 rounded-lg transition cursor-pointer border border-zinc-300 dark:border-zinc-700">
                🔄 Sync Vitals
              </button>
              <button
                type="button"
                (click)="soap.autoAuditAndCrosswalk()"
                class="min-h-[38px] px-2.5 py-1 text-[11px] font-mono font-bold uppercase bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition cursor-pointer shadow-sm">
                ⚡ Auto-Extract Codes
              </button>
            </div>
          </div>

          <!-- 4-Quadrant SOAP Note Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            
            <!-- S: Subjective -->
            <div class="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-purple-500/20 space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Subjective (S)
                </label>
                <span class="text-[10px] font-mono text-zinc-400">HPI & Symptoms</span>
              </div>
              <textarea
                rows="4"
                [ngModel]="soap.subjective()"
                (ngModelChange)="soap.subjective.set($event)"
                class="w-full text-xs font-sans p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500 resize-none leading-relaxed">
              </textarea>
            </div>

            <!-- O: Objective -->
            <div class="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-blue-500/20 space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Objective (O)
                </label>
                <span class="text-[10px] font-mono text-zinc-400">Vitals & Exam</span>
              </div>
              <textarea
                rows="4"
                [ngModel]="soap.objective()"
                (ngModelChange)="soap.objective.set($event)"
                class="w-full text-xs font-sans p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 resize-none leading-relaxed">
              </textarea>
            </div>

            <!-- A: Assessment -->
            <div class="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-amber-500/20 space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Assessment (A)
                </label>
                <span class="text-[10px] font-mono text-zinc-400">Differentials & Trajectory</span>
              </div>
              <textarea
                rows="4"
                [ngModel]="soap.assessment()"
                (ngModelChange)="soap.assessment.set($event)"
                class="w-full text-xs font-sans p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500 resize-none leading-relaxed">
              </textarea>
            </div>

            <!-- P: Plan -->
            <div class="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-emerald-500/20 space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Plan (P)
                </label>
                <span class="text-[10px] font-mono text-zinc-400">Rx, Labs, Orders</span>
              </div>
              <textarea
                rows="4"
                [ngModel]="soap.plan()"
                (ngModelChange)="soap.plan.set($event)"
                class="w-full text-xs font-sans p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed">
              </textarea>
            </div>
          </div>

          <!-- Multi-System Coding Crosswalk & Financial Valuation HUD -->
          @if (soap.codingAuditReport(); as report) {
            <div class="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-blue-500/10 border border-purple-500/30 space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/20 pb-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-extrabold uppercase text-purple-700 dark:text-purple-300">
                    💰 2024 E/M Level & Multi-Terminology Crosswalk
                  </span>
                  <span class="px-2 py-0.5 text-[10px] font-mono font-bold bg-purple-600 text-white rounded-md">
                    CPT {{ report.mdmAudit.emLevel }} ({{ report.mdmAudit.mdmLevel }})
                  </span>
                </div>

                <div class="flex items-center gap-3 text-xs font-mono">
                  <div>
                    <span class="text-zinc-500 dark:text-zinc-400">Work RVU: </span>
                    <span class="font-extrabold text-indigo-600 dark:text-indigo-400">{{ report.totalWorkRvu }} RVU</span>
                  </div>
                  <div>
                    <span class="text-zinc-500 dark:text-zinc-400">Est. Medicare: </span>
                    <span class="font-extrabold text-emerald-600 dark:text-emerald-400">{{ '$' + report.totalEstimatedReimbursement }}</span>
                  </div>
                </div>
              </div>

              <!-- Detected Multi-System Coding Badges -->
              <div class="flex flex-wrap gap-2">
                @for (sug of report.suggestions; track sug.id) {
                  <div class="p-2 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="text-[11px] font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {{ sug.code }} - {{ sug.description }}
                      </span>
                      @if (sug.hccCategory) {
                        <span class="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          HCC {{ sug.hccCategory }} (+{{ sug.rafWeight }} RAF)
                        </span>
                      }
                    </div>

                    <div class="flex flex-wrap gap-1 text-[9px] font-mono">
                      @if (sug.snomedCode) {
                        <span class="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                          🩺 SCT: {{ sug.snomedCode }}
                        </span>
                      }
                      @if (sug.cptCodes && sug.cptCodes.length > 0) {
                        <span class="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          📋 CPT: {{ sug.cptCodes.join(', ') }}
                        </span>
                      }
                      @if (sug.loincCode) {
                        <span class="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                          🧪 LOINC: {{ sug.loincCode }}
                        </span>
                      }
                      @if (sug.rxNormCui) {
                        <span class="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                          💊 RxNorm: {{ sug.rxNormCui }}
                        </span>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class SoapNoteGeneratorComponent {
  readonly soap: SoapNoteGeneratorService;

  readonly copied = signal<boolean>(false);
  manualSpeaker: ScribeSpeaker = 'PATIENT';
  manualSpeakerName: string = 'Marcus Vance';
  manualTurnText: string = '';

  constructor() {
    try {
      this.soap = inject(SoapNoteGeneratorService);
    } catch {
      this.soap = new SoapNoteGeneratorService();
    }
  }

  toggleScribing(): void {
    if (this.soap.isScribing()) {
      this.soap.stopAmbientScribing();
    } else {
      this.soap.startAmbientScribing();
    }
  }

  submitManualTurn(): void {
    if (!this.manualTurnText.trim()) return;
    this.soap.addTurn(
      this.manualSpeaker,
      this.manualSpeakerName || 'Speaker',
      this.manualTurnText
    );
    this.manualTurnText = '';
  }

  copyNoteToClipboard(): void {
    const raw = this.soap.rawSoapNote();
    const formatted = `# CLINICAL PROGRESS SOAP NOTE\n\n## SUBJECTIVE\n${raw.subjective}\n\n## OBJECTIVE\n${raw.objective}\n\n## ASSESSMENT\n${raw.assessment}\n\n## PLAN\n${raw.plan}`;
    
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(formatted).catch(() => {});
    }
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  downloadFhirBundle(): void {
    const fhirJson = this.soap.generateFhirR4DocumentReference();
    const blob = new Blob([fhirJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FHIR_R4_SOAP_DocumentReference_${this.soap.selectedScenarioId()}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadTranscript(): void {
    const transcript = this.soap.fullTranscriptMarkdown();
    const blob = new Blob([transcript], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ambient_Dialogue_Transcript_${this.soap.selectedScenarioId()}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
