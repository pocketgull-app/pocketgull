import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmbientClinicalScribeService, IStructuredSoapEncounter } from '../services/ambient-clinical-scribe.service';
import { PatientStateService } from '../services/patient-state.service';
import { IPatient } from '../services/patient.types';

@Component({
  selector: 'app-ambient-clinical-scribe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-teal-500/30 shadow-2xl space-y-6 animate-in fade-in duration-300">
      
      <!-- Header HUD -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-xl shadow-xs">
            🎙️
          </div>
          <div>
            <h3 class="text-base font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Ambient Clinical Scribe & SOAP Engine
              <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-teal-500/10 text-teal-700 dark:text-teal-300 rounded-full border border-teal-500/30">
                ICD-10 & SNOMED Auto-Coder
              </span>
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              Real-time multi-modal dialogue capture synthesizing clinical encounters into structured SOAP notes and FHIR bundles.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button (click)="toggleRecording()"
                  [ngClass]="isListening() ? 'bg-rose-600 text-white animate-pulse' : 'bg-teal-600 hover:bg-teal-500 text-white'"
                  class="px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer shadow-sm">
            <span>{{ isListening() ? '⏹️ Stop Scribe' : '🎙️ Start Ambient Scribe' }}</span>
          </button>
        </div>
      </div>

      <!-- Live Transcript Feed Box -->
      <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850/70 border border-zinc-200 dark:border-zinc-800 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full" [ngClass]="isListening() ? 'bg-emerald-500 animate-ping' : 'bg-zinc-400'"></span>
            Live Audio Transcript Stream
          </span>
          <span class="text-[10px] font-mono text-zinc-400">Web Speech API / Gemini 2.5 Live</span>
        </div>
        <textarea [(ngModel)]="liveTranscript"
                  rows="2"
                  placeholder="Dialogue streaming here automatically..."
                  class="w-full text-xs font-sans rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-2.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-teal-500">
        </textarea>
      </div>

      <!-- 4-Quadrant SOAP Encounter Cockpit -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- S: Subjective -->
        <div class="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-500/30 space-y-2">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-blue-600 text-white">
              S &bull; Subjective
            </span>
            <span class="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">CC & HPI</span>
          </div>
          <h5 class="text-xs font-bold text-zinc-900 dark:text-zinc-100">{{ soapNote().subjective.chiefComplaint }}</h5>
          <p class="text-xs text-zinc-600 dark:text-zinc-300 leading-snug">{{ soapNote().subjective.historyOfPresentIllness }}</p>
          <div class="pt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <strong>ROS:</strong> {{ soapNote().subjective.reviewOfSystems.join('; ') }}
          </div>
        </div>

        <!-- O: Objective -->
        <div class="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-2">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-600 text-white">
              O &bull; Objective
            </span>
            <span class="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Vitals & Labs</span>
          </div>
          <div class="flex items-center gap-3 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
            <span>BP: <strong>{{ soapNote().objective.vitalSigns.bp }}</strong></span>
            <span>HR: <strong>{{ soapNote().objective.vitalSigns.hr }} bpm</strong></span>
            <span>SpO2: <strong>{{ soapNote().objective.vitalSigns.spO2 }}</strong></span>
          </div>
          <div class="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-300 pt-1">
            @for (finding of soapNote().objective.physicalExamFindings; track finding) {
              <div>&bull; {{ finding }}</div>
            }
          </div>
        </div>

        <!-- A: Assessment -->
        <div class="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-500/30 space-y-2">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-amber-600 text-zinc-950 font-bold">
              A &bull; Assessment
            </span>
            <span class="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">ICD-10: {{ soapNote().assessment.icd10Code }}</span>
          </div>
          <h5 class="text-xs font-bold text-zinc-900 dark:text-zinc-100">{{ soapNote().assessment.primaryDiagnosis }}</h5>
          <p class="text-xs text-zinc-600 dark:text-zinc-300 leading-snug">{{ soapNote().assessment.clinicalImpression }}</p>
          <div class="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
            <strong>Differentials:</strong>
            @for (diff of soapNote().assessment.differentialDiagnoses; track diff.condition) {
              <span class="ml-1 inline-block px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono">
                {{ diff.condition }} ({{ diff.icd10 }})
              </span>
            }
          </div>
        </div>

        <!-- P: Plan -->
        <div class="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-500/30 space-y-2">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-purple-600 text-white">
              P &bull; Plan
            </span>
            <span class="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">{{ soapNote().plan.followUpInterval }}</span>
          </div>
          <div class="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
            <strong>Rx & Regimen:</strong>
            @for (rx of soapNote().plan.pharmacologicInterventions; track rx) {
              <div class="text-[11px]">&bull; {{ rx }}</div>
            }
          </div>
          <div class="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
            <strong>Orders:</strong> {{ soapNote().plan.diagnosticOrders.join(', ') }}
          </div>
        </div>

      </div>

    </div>
  `
})
export class AmbientClinicalScribeComponent {
  private scribeService = inject(AmbientClinicalScribeService);
  private patientState = inject(PatientStateService, { optional: true });

  isListening = signal<boolean>(false);
  liveTranscript = signal<string>('Patient: "I have been feeling a little dizzy in the mornings when I stand up, and my home BP was about 148 over 92." Doctor: "Let us check your vitals and review your Lisinopril dose."');

  currentPatient = computed<IPatient>(() => {
    return this.patientState?.asPatientSnapshot() || {
      id: 'p001',
      name: 'Homo Sapiens (Male, Metabolic Syndrome, 58y)',
      age: 58,
      gender: 'Male',
      lastVisit: '2026-08-19',
      preexistingConditions: ['Essential Hypertension', 'Type 2 Diabetes'],
      history: [],
      bookmarks: [],
      issues: {},
      patientGoals: '',
      medications: [],
      dietarySupplements: [],
      vitals: { bp: '148/92', hr: '76', spO2: '98%', temp: '36.6', weight: '82', height: '175' }
    };
  });

  soapNote = computed<IStructuredSoapEncounter>(() => {
    return this.scribeService.generateSoapNote(this.liveTranscript(), this.currentPatient());
  });

  toggleRecording(): void {
    this.isListening.update(v => !v);
  }
}
