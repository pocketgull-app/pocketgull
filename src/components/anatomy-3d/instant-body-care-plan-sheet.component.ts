import { Component, inject, signal, computed, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { THealingPhilosophy } from '../shared/quad-philosophy-matrix.component';

export type OrganPersonaMode = 'patient' | 'family' | 'clinician' | 'community';

export interface IOrgan3ActTrajectory {
  act1WhereYouveBeen: {
    title: string;
    clinicalRationale: string;
    plainLanguageRationale: string;
    patientSelfCareRationale: string;
    communitySdohRationale: string;
  };
  act2WhereYouStandToday: {
    title: string;
    dailyActionPlan: string;
    biometricBaseline: string;
    plainLanguageAdvice: string;
    patientHabitRoutine: string;
    communitySafetySupport: string;
  };
  act3WhereYoureGoing: {
    title: string;
    watchWindow: string;
    warningSignsToMonitor: string[];
    actionGuidance: string;
    plainLanguageGuidance: string;
    patientVitalityMilestone: string;
    communityFollowUpProtocol: string;
  };
}

export interface IBodyPartCarePlan {
  partId: string;
  partName: string;
  symptomDescription: string;
  generatedAt: string;
  allopathic: {
    title: string;
    icd10: string;
    biomarker: string;
    recommendation: string;
  };
  tcm: {
    title: string;
    meridian: string;
    acupoint: string;
    recommendation: string;
  };
  ayurvedic: {
    title: string;
    dosha: string;
    herb: string;
    recommendation: string;
  };
  osteopathic: {
    title: string;
    somaticSegment: string;
    omtTechnique: string;
    recommendation: string;
  };
}

@Component({
  selector: 'app-instant-body-care-plan-sheet',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div 
        class="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        <div 
          class="bg-stone-950 border-t-2 sm:border-2 border-emerald-500/50 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300"
        >
          <!-- Header -->
          <div class="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between shrink-0 bg-stone-900/90 backdrop-blur-md">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-xl shrink-0">
                ✨
              </div>
              <div>
                <h3 id="sheet-title" class="text-base font-extrabold text-white flex items-center gap-2">
                  <span>{{ selectedBodyPart() }}</span>
                  <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                    3D Matrix Grounded
                  </span>
                </h3>
                <p class="text-xs text-stone-400">Structured 3-Act Trajectory &amp; Diagnostic Biometric Focus</p>
              </div>
            </div>

            <!-- Close Button (Fitts's Law 44px) -->
            <button 
              (click)="closeSheet()"
              class="w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center cursor-pointer transition active:scale-95 text-lg"
              aria-label="Close care plan sheet"
            >
              ✕
            </button>
          </div>

          <!-- Body Content (Scrollable) -->
          <div class="p-4 sm:p-5 space-y-4 overflow-y-auto overscroll-contain text-xs sm:text-sm">

            <!-- 1. Diagnostic Deep-Dive & Posology Gateway Bar -->
            <div class="p-3 bg-stone-900/90 border border-stone-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div class="flex items-center gap-2">
                <span class="text-stone-400">Physiological Target:</span>
                <span class="text-emerald-400 font-bold uppercase">{{ selectedSystem() || 'Target System' }}</span>
              </div>
              <div class="flex items-center gap-2">
                @if (recommendedDrilldown(); as drilldown) {
                  <button 
                    (click)="launchDrilldown(drilldown)"
                    class="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 text-xs">
                    <span>🔬</span> Open {{ drilldown | uppercase }} Deep-Dive
                  </button>
                }
                <button 
                  (click)="scrollToPosology()"
                  class="px-2.5 py-1.5 rounded-xl bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-500/30 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 text-xs">
                  <span>💊</span> Posology Engine
                </button>
                <button 
                  (click)="toggleAvsPreview()"
                  class="px-2.5 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/30 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 text-xs"
                  title="Preview 1-Page Refrigerator Handout">
                  <span>👁️</span> Preview Handout
                </button>
                <button 
                  (click)="printOrganAvs()"
                  class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 text-xs"
                  title="Print 1-Page Refrigerator Handout">
                  <span>🖨️</span> Print Handout
                </button>
              </div>
            </div>

            <!-- 2. 4-Persona Segmented Lens Controller -->
            <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div class="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-wider">
                Persona Perspective
              </div>
              <div class="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-stone-900 border border-stone-800 text-[11px] font-mono">
                <button
                  type="button"
                  (click)="setPersona('patient')"
                  [class.bg-teal-600]="personaMode() === 'patient'"
                  [class.text-white]="personaMode() === 'patient'"
                  [class.text-stone-400]="personaMode() !== 'patient'"
                  class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1">
                  <span>🧑</span> Patient
                </button>
                <button
                  type="button"
                  (click)="setPersona('family')"
                  [class.bg-emerald-600]="personaMode() === 'family'"
                  [class.text-white]="personaMode() === 'family'"
                  [class.text-stone-400]="personaMode() !== 'family'"
                  class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1">
                  <span>👨‍👩‍👧</span> Family
                </button>
                <button
                  type="button"
                  (click)="setPersona('clinician')"
                  [class.bg-indigo-600]="personaMode() === 'clinician'"
                  [class.text-white]="personaMode() === 'clinician'"
                  [class.text-stone-400]="personaMode() !== 'clinician'"
                  class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1">
                  <span>🩺</span> Clinician
                </button>
                <button
                  type="button"
                  (click)="setPersona('community')"
                  [class.bg-amber-600]="personaMode() === 'community'"
                  [class.text-white]="personaMode() === 'community'"
                  [class.text-stone-400]="personaMode() !== 'community'"
                  class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1">
                  <span>🤝</span> Community
                </button>
              </div>
            </div>

            <!-- 3. Structured 3-Act Trajectory Cards -->
            <div class="space-y-3">
              <!-- Act 1: Where You've Been -->
              <div class="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-1.5">
                <div class="flex items-center justify-between font-mono text-[11px]">
                  <span class="text-amber-400 font-bold uppercase tracking-wider">Act 1: Where You've Been</span>
                  <span class="text-stone-400">Zero Guilt Baseline</span>
                </div>
                <h4 class="text-xs font-bold text-white">{{ organTrajectory().act1WhereYouveBeen.title }}</h4>
                <div class="text-xs text-stone-300 leading-relaxed font-sans">
                  @switch (personaMode()) {
                    @case ('patient') {
                      <p>🌱 {{ organTrajectory().act1WhereYouveBeen.patientSelfCareRationale }}</p>
                    }
                    @case ('family') {
                      <p>👨‍👩‍👧 {{ organTrajectory().act1WhereYouveBeen.plainLanguageRationale }}</p>
                    }
                    @case ('community') {
                      <p>🤝 {{ organTrajectory().act1WhereYouveBeen.communitySdohRationale }}</p>
                    }
                    @default {
                      <p>🩺 {{ organTrajectory().act1WhereYouveBeen.clinicalRationale }}</p>
                    }
                  }
                </div>
              </div>

              <!-- Act 2: Where You Stand Today -->
              <div class="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/40 space-y-2">
                <div class="flex items-center justify-between font-mono text-[11px]">
                  <span class="text-teal-300 font-bold uppercase tracking-wider">Act 2: Where You Stand Today</span>
                  <span class="text-teal-400 font-bold">Today's Standard</span>
                </div>
                <div class="p-2 rounded-xl bg-stone-900 border border-stone-800 font-mono text-[11px] text-stone-300">
                  {{ organTrajectory().act2WhereYouStandToday.biometricBaseline }}
                </div>
                <div class="text-xs text-stone-200 leading-relaxed font-sans">
                  @switch (personaMode()) {
                    @case ('patient') {
                      <p>🥄 <strong>Daily Habit:</strong> {{ organTrajectory().act2WhereYouStandToday.patientHabitRoutine }}</p>
                    }
                    @case ('family') {
                      <p>🥄 <strong>Teaspoon Guide:</strong> {{ organTrajectory().act2WhereYouStandToday.plainLanguageAdvice }}</p>
                    }
                    @case ('community') {
                      <p>🤝 <strong>Safety Scaffolding:</strong> {{ organTrajectory().act2WhereYouStandToday.communitySafetySupport }}</p>
                    }
                    @default {
                      <p>🩺 <strong>Action Plan:</strong> {{ organTrajectory().act2WhereYouStandToday.dailyActionPlan }}</p>
                    }
                  }
                </div>
              </div>

              <!-- Act 3: Where You're Going -->
              <div class="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                <div class="flex items-center justify-between font-mono text-[11px]">
                  <span class="text-indigo-400 font-bold uppercase tracking-wider">Act 3: Where You're Going</span>
                  <span class="text-indigo-300 font-mono">{{ organTrajectory().act3WhereYoureGoing.watchWindow }}</span>
                </div>
                <div class="text-xs text-stone-300 leading-relaxed font-sans">
                  @switch (personaMode()) {
                    @case ('patient') {
                      <p>🌟 <strong>Vitality Milestone:</strong> {{ organTrajectory().act3WhereYoureGoing.patientVitalityMilestone }}</p>
                    }
                    @case ('family') {
                      <p>💙 <strong>Guidance:</strong> {{ organTrajectory().act3WhereYoureGoing.plainLanguageGuidance }}</p>
                    }
                    @case ('community') {
                      <p>🤝 <strong>Community Protocol:</strong> {{ organTrajectory().act3WhereYoureGoing.communityFollowUpProtocol }}</p>
                    }
                    @default {
                      <p>🩺 <strong>Clinical Directive:</strong> {{ organTrajectory().act3WhereYoureGoing.actionGuidance }}</p>
                    }
                  }
                </div>
                <div class="p-2 rounded-xl bg-stone-950 border border-stone-800 space-y-1 font-mono text-[11px]">
                  <span class="font-bold text-stone-400 block">⚠️ Warning Signs Monitored:</span>
                  @for (sign of organTrajectory().act3WhereYoureGoing.warningSignsToMonitor; track sign) {
                    <div class="flex items-start gap-1.5 text-stone-300">
                      <span class="text-amber-500">•</span>
                      <span>{{ sign }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- 4. Quick Symptom Chips -->
            <div class="space-y-2 pt-2 border-t border-stone-800">
              <label class="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-wider block">
                Log Observed Sensations
              </label>
              <div class="flex flex-wrap gap-2">
                @for (chip of quickChips(); track chip) {
                  <button 
                    (click)="addChipText(chip)"
                    class="min-h-[38px] px-3 py-1.5 rounded-xl border transition cursor-pointer text-xs font-medium flex items-center gap-1.5 active:scale-95"
                    [ngClass]="{
                      'bg-emerald-500/20 text-emerald-300 border-emerald-500/40': activeDescription().includes(chip),
                      'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700': !activeDescription().includes(chip)
                    }"
                  >
                    <span>{{ chip }}</span>
                  </button>
                }
              </div>
            </div>

            <!-- Voice or Text Description -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-wider">
                  Describe Sensations
                </label>
                <button 
                  (click)="toggleVoiceRecording()"
                  class="min-h-[36px] px-3 py-1 rounded-xl border flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer transition active:scale-95"
                  [ngClass]="{
                    'bg-rose-500 text-white border-rose-400 animate-pulse': isRecording(),
                    'bg-stone-900 text-emerald-400 border-emerald-500/40 hover:bg-stone-800': !isRecording()
                  }"
                  [attr.aria-pressed]="isRecording()"
                  aria-label="Toggle Voice Dictation"
                >
                  <span>{{ isRecording() ? '🔴 Listening...' : '🎙️ Voice Input' }}</span>
                </button>
              </div>

              <textarea 
                [value]="activeDescription()"
                (input)="onDescriptionInput($event)"
                placeholder="Describe localized pain, heat, stiffness or radiation..."
                rows="2"
                class="w-full p-3 rounded-2xl bg-stone-900 border border-stone-800 text-white text-xs placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 transition resize-none"
                aria-label="Symptom Description"
              ></textarea>
            </div>

            <!-- Multi-Paradigm Quad Lenses Toggle -->
            <div class="space-y-2 pt-2 border-t border-stone-800">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-wider">Multi-Paradigm Care Lenses</span>
                <button 
                  (click)="generateCarePlan()"
                  [disabled]="isGenerating() || !activeDescription().trim()"
                  class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-[11px] font-mono transition cursor-pointer flex items-center gap-1">
                  <span>✨</span> Generate Quad Lenses
                </button>
              </div>

              @if (carePlan(); as plan) {
                <!-- 4 Philosophy Tabs -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-xs">
                  <button 
                    (click)="activeLens.set('allopathic')"
                    class="p-2 rounded-xl border text-center transition cursor-pointer font-bold active:scale-95"
                    [ngClass]="{
                      'bg-blue-500 text-white border-blue-400': activeLens() === 'allopathic',
                      'bg-stone-900/80 text-stone-400 border-stone-800': activeLens() !== 'allopathic'
                    }"
                  >
                    🏥 Allopathic
                  </button>
                  <button 
                    (click)="activeLens.set('tcm')"
                    class="p-2 rounded-xl border text-center transition cursor-pointer font-bold active:scale-95"
                    [ngClass]="{
                      'bg-amber-500 text-stone-950 border-amber-400': activeLens() === 'tcm',
                      'bg-stone-900/80 text-stone-400 border-stone-800': activeLens() !== 'tcm'
                    }"
                  >
                    ☯️ TCM
                  </button>
                  <button 
                    (click)="activeLens.set('ayurvedic')"
                    class="p-2 rounded-xl border text-center transition cursor-pointer font-bold active:scale-95"
                    [ngClass]="{
                      'bg-emerald-500 text-stone-950 border-emerald-400': activeLens() === 'ayurvedic',
                      'bg-stone-900/80 text-stone-400 border-stone-800': activeLens() !== 'ayurvedic'
                    }"
                  >
                    🌿 Ayurvedic
                  </button>
                  <button 
                    (click)="activeLens.set('osteopathic')"
                    class="p-2 rounded-xl border text-center transition cursor-pointer font-bold active:scale-95"
                    [ngClass]="{
                      'bg-violet-500 text-white border-violet-400': activeLens() === 'osteopathic',
                      'bg-stone-900/80 text-stone-400 border-stone-800': activeLens() !== 'osteopathic'
                    }"
                  >
                    🦴 Osteopathic
                  </button>
                </div>

                <!-- Active Lens Card -->
                <div class="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                  @if (activeLens() === 'allopathic') {
                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-white text-xs">{{ plan.allopathic.title }}</span>
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                          ICD-10: {{ plan.allopathic.icd10 }}
                        </span>
                      </div>
                      <p class="text-xs text-stone-300 leading-relaxed">{{ plan.allopathic.recommendation }}</p>
                      <div class="text-[10px] font-mono text-stone-400 pt-1">
                        Biomarker Target: <strong class="text-blue-300">{{ plan.allopathic.biomarker }}</strong>
                      </div>
                    </div>
                  } @else if (activeLens() === 'tcm') {
                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-white text-xs">{{ plan.tcm.title }}</span>
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          {{ plan.tcm.acupoint }}
                        </span>
                      </div>
                      <p class="text-xs text-stone-300 leading-relaxed">{{ plan.tcm.recommendation }}</p>
                      <div class="text-[10px] font-mono text-stone-400 pt-1">
                        Meridian Channel: <strong class="text-amber-300">{{ plan.tcm.meridian }}</strong>
                      </div>
                    </div>
                  } @else if (activeLens() === 'ayurvedic') {
                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-white text-xs">{{ plan.ayurvedic.title }}</span>
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          {{ plan.ayurvedic.dosha }}
                        </span>
                      </div>
                      <p class="text-xs text-stone-300 leading-relaxed">{{ plan.ayurvedic.recommendation }}</p>
                      <div class="text-[10px] font-mono text-stone-400 pt-1">
                        Botanical Support: <strong class="text-emerald-300">{{ plan.ayurvedic.herb }}</strong>
                      </div>
                    </div>
                  } @else if (activeLens() === 'osteopathic') {
                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-white text-xs">{{ plan.osteopathic.title }}</span>
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">
                          {{ plan.osteopathic.somaticSegment }}
                        </span>
                      </div>
                      <p class="text-xs text-stone-300 leading-relaxed">{{ plan.osteopathic.recommendation }}</p>
                      <div class="text-[10px] font-mono text-stone-400 pt-1">
                        OMT Technique: <strong class="text-violet-300">{{ plan.osteopathic.omtTechnique }}</strong>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

          </div>
        </div>
      </div>

      <!-- 🖨️ 1-PAGE REFRIGERATOR AFTER-VISIT SUMMARY (AVS) PRINT TEMPLATE -->
      <div id="organ-avs-print-area" class="hidden print:block text-slate-900 bg-white p-6 rounded-none">
        <div class="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-base shadow-sm">
              🪶
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-2xl font-extrabold tracking-tight text-teal-900 font-pocketgull-brand">PocketGull</span>
                <span class="text-[10px] font-extrabold uppercase tracking-widest text-teal-800 bg-teal-100/90 px-2 py-0.5 rounded border border-teal-300">Health</span>
              </div>
              <div class="text-[10px] text-slate-500 font-mono">Clinical Intelligence &amp; Care Strategy Engine</div>
            </div>
          </div>
          <div class="text-right text-xs font-mono text-slate-700 space-y-0.5">
            <div><strong>Patient:</strong> {{ patientState?.activePatientSummary() || 'Valued Patient' }}</div>
            <div><strong>Date:</strong> {{ activeDateString }}</div>
            <div class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
              <span>✓</span> ISMP Slashed-Zero Safe Dosing Attested
            </div>
          </div>
        </div>

        <div class="mb-4">
          <h1 class="text-base font-extrabold uppercase tracking-wider text-slate-900">
            Organ Focus Care Summary &bull; {{ selectedBodyPart() }}
          </h1>
          <p class="text-xs text-slate-600 mt-0.5">
            Personalized 3-Act Instructions for Patient &amp; Family Caregiver &bull; Keep on Your Refrigerator
          </p>
        </div>

        <div class="space-y-4 text-xs">
          <!-- Act 1 -->
          <div class="p-3.5 rounded-xl border border-amber-300/80 bg-amber-50/40">
            <div class="flex items-center justify-between font-bold text-slate-900 mb-1">
              <span class="uppercase tracking-wide text-amber-900 font-mono text-[11px]">
                Act 1: Where You've Been &bull; {{ organTrajectory().act1WhereYouveBeen.title }}
              </span>
              <span class="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Zero Guilt Baseline</span>
            </div>
            <p class="text-slate-800 leading-relaxed font-sans">
              {{ organTrajectory().act1WhereYouveBeen.plainLanguageRationale }}
            </p>
          </div>

          <!-- Act 2 -->
          <div class="p-3.5 rounded-xl border-2 border-teal-700 bg-teal-50/30">
            <div class="flex items-center justify-between font-bold text-teal-900 mb-2">
              <span class="uppercase tracking-wide text-teal-900 font-mono text-[11px]">
                Act 2: Where You Stand Today &bull; {{ organTrajectory().act2WhereYouStandToday.title }}
              </span>
              <span class="text-[10px] font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">Daily Action Plan</span>
            </div>
            <div class="p-2.5 rounded-lg bg-white border border-teal-300 mb-2 font-mono text-xs text-slate-900 shadow-sm">
              {{ organTrajectory().act2WhereYouStandToday.biometricBaseline }}
            </div>
            <p class="text-slate-900 leading-relaxed font-sans mb-3">
              🥄 <strong>Teaspoon Guide:</strong> {{ organTrajectory().act2WhereYouStandToday.plainLanguageAdvice }}
            </p>
            <div class="p-2.5 rounded-lg bg-white border border-teal-200">
              <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 block mb-1">Daily Routine Checklist (Check with pen):</span>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-800">
                <div class="flex items-center gap-1.5">
                  <span class="w-4 h-4 rounded border-2 border-teal-700 inline-block"></span>
                  <span>Morning Routine Taken</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-4 h-4 rounded border-2 border-teal-700 inline-block"></span>
                  <span>Mid-day Hydration Met</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-4 h-4 rounded border-2 border-teal-700 inline-block"></span>
                  <span>Evening Check Complete</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Act 3 -->
          <div class="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/30">
            <div class="flex items-center justify-between font-bold text-slate-900 mb-1">
              <span class="uppercase tracking-wide text-indigo-900 font-mono text-[11px]">
                Act 3: Where You're Going &bull; Watch Window
              </span>
              <span class="text-[10px] font-mono text-indigo-800 font-bold bg-indigo-100 px-2 py-0.5 rounded">
                {{ organTrajectory().act3WhereYoureGoing.watchWindow }}
              </span>
            </div>
            <p class="text-slate-800 mb-2 leading-relaxed font-sans">
              💙 {{ organTrajectory().act3WhereYoureGoing.plainLanguageGuidance }}
            </p>
            <div class="p-2.5 rounded-lg bg-rose-50/60 border border-rose-300 space-y-1.5">
              <span class="font-bold text-rose-900 text-[11px] font-mono flex items-center gap-1">
                <span>⚠️</span> Call Clinic Immediately If You Notice Any of These:
              </span>
              @for (sign of organTrajectory().act3WhereYoureGoing.warningSignsToMonitor; track sign) {
                <div class="flex items-start gap-2 text-slate-800 text-xs">
                  <span class="w-3.5 h-3.5 rounded border border-rose-400 bg-white inline-block shrink-0 mt-0.5"></span>
                  <span>{{ sign }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t-2 border-slate-900 flex flex-wrap items-center justify-between text-xs font-mono gap-2">
          <div>
            <strong>Clinic Daytime Line:</strong> (480) 555-0199 &bull; <strong>24/7 Nurse Triage:</strong> 988 / (480) 555-0100
          </div>
          <div class="text-[10px] text-slate-500 font-pocketgull-brand">
            PocketGull Health &bull; HIPAA Safe Harbor &sect; 164.514 &bull; HL7 FHIR R4 Ready
          </div>
        </div>
      </div>

      <!-- 👁️ High-Fidelity On-Screen Refrigerator Handout Preview Modal -->
      @if (showAvsPreview()) {
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto no-print" (click)="closeAvsPreview()">
          <div class="relative max-w-3xl w-full bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-200" (click)="$event.stopPropagation()">
            <!-- Modal Header Bar -->
            <div class="bg-slate-900 text-white px-4 py-3 sm:px-6 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                  👁️ Live Refrigerator Handout Preview
                </span>
                <span class="text-xs text-slate-400 font-mono hidden sm:inline">1-Page High-Contrast Format</span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  (click)="printOrganAvs()"
                  class="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs font-mono transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95">
                  <span>🖨️</span> Print Now
                </button>
                <button
                  (click)="closeAvsPreview()"
                  class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold cursor-pointer transition"
                  aria-label="Close Preview">
                  ✕
                </button>
              </div>
            </div>

            <!-- Handout Card Body (Identical to Printout) -->
            <div class="p-6 sm:p-8 overflow-y-auto max-h-[80vh] space-y-4">
              <div class="border-b-2 border-slate-900 pb-3 mb-2 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    🪶
                  </div>
                  <div>
                    <div class="flex items-center gap-1.5">
                      <span class="text-2xl font-extrabold tracking-tight text-teal-900 font-pocketgull-brand">PocketGull</span>
                      <span class="text-[10px] font-extrabold uppercase tracking-widest text-teal-800 bg-teal-100/90 px-2 py-0.5 rounded border border-teal-300">Health</span>
                    </div>
                    <div class="text-[10px] text-slate-500 font-mono">Clinical Intelligence &amp; Care Strategy Engine</div>
                  </div>
                </div>
                <div class="text-right text-xs font-mono text-slate-700 space-y-0.5">
                  <div><strong>Patient:</strong> {{ patientState?.activePatientSummary() || 'Valued Patient' }}</div>
                  <div><strong>Date:</strong> {{ activeDateString }}</div>
                  <div class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    <span>✓</span> ISMP Slashed-Zero Safe Dosing Attested
                  </div>
                </div>
              </div>

              <div>
                <h1 class="text-base font-extrabold uppercase tracking-wider text-slate-900">
                  Organ Focus Care Summary &bull; {{ selectedBodyPart() }}
                </h1>
                <p class="text-xs text-slate-600 mt-0.5">
                  Personalized 3-Act Instructions for Patient &amp; Family Caregiver &bull; Keep on Your Refrigerator
                </p>
              </div>

              <!-- Act 1 -->
              <div class="p-3.5 rounded-xl border border-amber-300/80 bg-amber-50/40">
                <div class="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span class="uppercase tracking-wide text-amber-900 font-mono text-[11px]">
                    Act 1: Where You've Been &bull; {{ organTrajectory().act1WhereYouveBeen.title }}
                  </span>
                  <span class="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Zero Guilt Baseline</span>
                </div>
                <p class="text-slate-800 leading-relaxed font-sans text-xs">
                  {{ organTrajectory().act1WhereYouveBeen.plainLanguageRationale }}
                </p>
              </div>

              <!-- Act 2 -->
              <div class="p-3.5 rounded-xl border-2 border-teal-700 bg-teal-50/30">
                <div class="flex items-center justify-between font-bold text-teal-900 mb-2">
                  <span class="uppercase tracking-wide text-teal-900 font-mono text-[11px]">
                    Act 2: Where You Stand Today &bull; {{ organTrajectory().act2WhereYouStandToday.title }}
                  </span>
                  <span class="text-[10px] font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">Daily Action Plan</span>
                </div>
                <div class="p-2.5 rounded-lg bg-white border border-teal-300 mb-2 font-mono text-xs text-slate-900 shadow-sm">
                  {{ organTrajectory().act2WhereYouStandToday.biometricBaseline }}
                </div>
                <p class="text-slate-900 leading-relaxed font-sans mb-3 text-xs">
                  🥄 <strong>Teaspoon Guide:</strong> {{ organTrajectory().act2WhereYouStandToday.plainLanguageAdvice }}
                </p>
                <div class="p-2.5 rounded-lg bg-white border border-teal-200">
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 block mb-1">Daily Routine Checklist (Check with pen):</span>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-800">
                    <div class="flex items-center gap-1.5">
                      <span class="w-4 h-4 rounded border-2 border-teal-700 inline-block"></span>
                      <span>Morning Routine Taken</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="w-4 h-4 rounded border-2 border-teal-700 inline-block"></span>
                      <span>Mid-day Hydration Met</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="w-4 h-4 rounded border-2 border-teal-700 inline-block"></span>
                      <span>Evening Check Complete</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Act 3 -->
              <div class="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/30">
                <div class="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span class="uppercase tracking-wide text-indigo-900 font-mono text-[11px]">
                    Act 3: Where You're Going &bull; Watch Window
                  </span>
                  <span class="text-[10px] font-mono text-indigo-800 font-bold bg-indigo-100 px-2 py-0.5 rounded">
                    {{ organTrajectory().act3WhereYoureGoing.watchWindow }}
                  </span>
                </div>
                <p class="text-slate-800 mb-2 leading-relaxed font-sans text-xs">
                  💙 {{ organTrajectory().act3WhereYoureGoing.plainLanguageGuidance }}
                </p>
                <div class="p-2.5 rounded-lg bg-rose-50/60 border border-rose-300 space-y-1.5">
                  <span class="font-bold text-rose-900 text-[11px] font-mono flex items-center gap-1">
                    <span>⚠️</span> Call Clinic Immediately If You Notice Any of These:
                  </span>
                  @for (sign of organTrajectory().act3WhereYoureGoing.warningSignsToMonitor; track sign) {
                    <div class="flex items-start gap-2 text-slate-800 text-xs">
                      <span class="w-3.5 h-3.5 rounded border border-rose-400 bg-white inline-block shrink-0 mt-0.5"></span>
                      <span>{{ sign }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Footer -->
              <div class="mt-4 pt-3 border-t-2 border-slate-900 flex flex-wrap items-center justify-between text-xs font-mono gap-2">
                <div>
                  <strong>Clinic Daytime Line:</strong> (480) 555-0199 &bull; <strong>24/7 Nurse Triage:</strong> 988 / (480) 555-0100
                </div>
                <div class="text-[10px] text-slate-500 font-pocketgull-brand">
                  PocketGull Health &bull; HIPAA Safe Harbor &sect; 164.514 &bull; HL7 FHIR R4 Ready
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    }
  `,
})
export class InstantBodyCarePlanSheetComponent {
  patientState: PatientStateService | null = null;

  isOpen = signal<boolean>(false);
  showAvsPreview = signal<boolean>(false);
  selectedBodyPart = signal<string>('Head & Cranium');
  activeDescription = signal<string>('');
  isRecording = signal<boolean>(false);
  isGenerating = signal<boolean>(false);
  activeLens = signal<THealingPhilosophy>('allopathic');
  personaMode = signal<OrganPersonaMode>('clinician');

  carePlan = signal<IBodyPartCarePlan | null>(null);

  readonly activeDateString = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  readonly selectedSystem = computed(() => this.patientState?.selectedAnatomicalSystem() || null);
  readonly recommendedDrilldown = computed(() => this.patientState?.recommendedDrilldownForSelectedPart() || null);

  @Output() closed = new EventEmitter<void>();

  constructor() {
    try {
      this.patientState = inject(PatientStateService, { optional: true });
    } catch {
      this.patientState = null;
    }
  }

  setPersona(mode: OrganPersonaMode): void {
    this.personaMode.set(mode);
  }

  // Dynamic quick symptom chips tailored to the selected body part
  quickChips = computed<string[]>(() => {
    const part = this.selectedBodyPart().toLowerCase();
    if (part.includes('head') || part.includes('cranium')) {
      return ['💥 Throbbing Ache', '⚡ Tension Band', '☁️ Brain Fog', '👁️ Visual Aura'];
    } else if (part.includes('chest') || part.includes('heart')) {
      return ['🫀 Palpitation', '😮‍💨 Shortness of Breath', '⏱️ Post-Exertion Tightness'];
    } else if (part.includes('gut') || part.includes('stomach') || part.includes('abdomen') || part.includes('kidney')) {
      return ['🔥 Flank Ache', '⚡ Cramping Spasm', '🌊 Dark Urine', '🔥 Localized Heat'];
    } else if (part.includes('back') || part.includes('spine')) {
      return ['⚡ Lumbar Spasm', '🪵 Morning Stiffness', '🚶 Sciatic Radiation'];
    } else if (part.includes('knee') || part.includes('joint')) {
      return ['🦴 Crepitus on Flexion', '❄️ Cold Weather Ache', '⚡ Meniscal Strain'];
    }
    return ['💥 Dull Ache', '⚡ Sharp Strain', '🌊 Fluid Swelling', '🔥 Localized Heat'];
  });

  readonly organTrajectory = computed<IOrgan3ActTrajectory>(() => {
    const part = this.selectedBodyPart();
    const partLower = part.toLowerCase();
    const vitals = this.patientState?.vitals();
    const bp = vitals?.bp || '120/80';
    const hr = vitals?.hr || '72';

    if (partLower.includes('kidney') || partLower.includes('renal')) {
      return {
        act1WhereYouveBeen: {
          title: 'Renal Reserve & Baseline Filtration',
          clinicalRationale: 'Baseline Cockcroft-Gault CrCl estimation indicates moderate filtration reserve decline with age.',
          plainLanguageRationale: 'Your kidneys filter your blood day and night. We check them to keep them strong and protected.',
          patientSelfCareRationale: 'Gentle on your body: taking care of your kidneys means steady water sips and avoiding excess pain pills.',
          communitySdohRationale: 'Extreme heatwaves and outdoor activity accelerate dehydration; verify clean water and cool shade access.'
        },
        act2WhereYouStandToday: {
          title: 'Active Fluid & Renal Homeostasis',
          dailyActionPlan: 'Target 2,000–2,500 mL water daily. Calibrate renally cleared medications (Metformin, ACEi, NSAIDs).',
          biometricBaseline: `Blood Pressure: ${bp} mmHg • Creatinine: 1.2–1.5 mg/dL • eGFR: >45 mL/min`,
          plainLanguageAdvice: 'Drink water steadily throughout the day. Aim for light yellow urine like lemonade, not dark tea.',
          patientHabitRoutine: 'Keep a full water bottle by your desk or bedside table. Take sips before you feel thirsty.',
          communitySafetySupport: 'Map out neighborhood cool stations during excessive heat advisories.'
        },
        act3WhereYoureGoing: {
          title: '30-Day Kidney Health Horizon',
          watchWindow: 'Next 48 Hours to 30 Days',
          warningSignsToMonitor: ['Decreased urination or dark brown urine', 'Swelling in ankles or around eyelids', 'Persistent flank or lower back ache'],
          actionGuidance: 'Recheck serum creatinine and basic metabolic panel (BMP) in 4 weeks.',
          plainLanguageGuidance: 'Call our clinic if your urine output drops or your feet and ankles begin swelling.',
          patientVitalityMilestone: 'Clear vitality with zero ankle swelling and healthy renal lab results.',
          communityFollowUpProtocol: 'Community health worker check-in on hydration access at day 14.'
        }
      };
    } else if (partLower.includes('heart') || partLower.includes('chest') || partLower.includes('cardio')) {
      return {
        act1WhereYouveBeen: {
          title: 'Cardiovascular Baseline & Vagal Tone',
          clinicalRationale: 'Autonomic tone and vascular resistance reflect cumulative hemodynamic workload and emotional stress.',
          plainLanguageRationale: 'Your heart rhythm naturally responds to life rhythm, rest, and emotional state.',
          patientSelfCareRationale: 'Your heart beats over 100,000 times a day for you; daily breathing pauses give it a restorative rest.',
          communitySdohRationale: 'Ambient environmental noise and erratic sleep schedules increase autonomic sympathetic stress.'
        },
        act2WhereYouStandToday: {
          title: 'Vagal Co-Regulation & Rhythm Stability',
          dailyActionPlan: 'Practice 0.1 Hz resonance breathing (6 breaths/min, 4s inhale / 6s exhale) for 10 minutes BID.',
          biometricBaseline: `Resting HR: ${hr} bpm • BP: ${bp} mmHg • HRV RMSSD: 34 ms`,
          plainLanguageAdvice: 'Breathe in slowly for 4 counts, breathe out gently for 6 counts. Feel your shoulders drop.',
          patientHabitRoutine: 'Take 5 minutes of slow breathing before checking your phone in the morning.',
          communitySafetySupport: 'Connect with walking groups and calm community green spaces.'
        },
        act3WhereYoureGoing: {
          title: '60-Day Heart Vitality Trajectory',
          watchWindow: 'Next 14 to 60 Days',
          warningSignsToMonitor: ['Sudden racing heart or flutter at rest', 'Chest pressure or squeezing sensation', 'Unexplained dizziness upon standing'],
          actionGuidance: 'Follow up with 7-day ambulatory ECG or wearable HRV telemetry tracking.',
          plainLanguageGuidance: 'Call immediately if you feel sudden fluttering that makes you dizzy, or chest tightness.',
          patientVitalityMilestone: 'Higher HRV reserve, calm resting heart rate, and effortless walking.',
          communityFollowUpProtocol: 'Blood pressure check and community cardiovascular review at 30 days.'
        }
      };
    } else if (partLower.includes('brain') || partLower.includes('head') || partLower.includes('cranial')) {
      return {
        act1WhereYouveBeen: {
          title: 'Neuro-Cognitive Reserve & Sleep Architecture',
          clinicalRationale: 'Cranial nerve distribution, meningeal tension, and sleep deprivation drive central nervous system fatigue.',
          plainLanguageRationale: 'Your brain has been processing high mental loads, screens, and daily stressors.',
          patientSelfCareRationale: 'Mental fatigue is not weakness; your brain needs dedicated low-stimulation recovery windows.',
          communitySdohRationale: 'Digital overload, high screen time, and erratic work schedules impair circadian melatonin production.'
        },
        act2WhereYouStandToday: {
          title: 'Cognitive Reset & Circadian Grounding',
          dailyActionPlan: 'Screen curfew 60 minutes before bed. Morning natural sunlight exposure for 15 minutes.',
          biometricBaseline: 'Sleep Target: 7.5 hours • Cognitive Load: Moderate • Suboccipital Tension: Mild',
          plainLanguageAdvice: 'Dim bright overhead lights in the evening. Keep your bedroom cool and quiet.',
          patientHabitRoutine: 'Replace late-night scrolling with audio music or reading paper books.',
          communitySafetySupport: 'Access local library quiet rooms and neighborhood sleep hygiene resources.'
        },
        act3WhereYoureGoing: {
          title: '30-Day Mental Clarity Roadmap',
          watchWindow: 'Next 7 to 30 Days',
          warningSignsToMonitor: ['Sudden severe headache ("worst of life")', 'One-sided numbness or facial droop', 'Confusion or difficulty speaking'],
          actionGuidance: 'Screen with validated cognitive screener or Y-BOCS if intrusive thoughts persist.',
          plainLanguageGuidance: 'Call 911 immediately if you ever notice sudden facial weakness or trouble speaking.',
          patientVitalityMilestone: 'Waking up refreshed with crisp morning focus and zero brain fog.',
          communityFollowUpProtocol: 'Mental health peer navigator follow-up call at 2 weeks.'
        }
      };
    } else {
      // General Musculoskeletal / Visceral Default
      return {
        act1WhereYouveBeen: {
          title: `${part} Physiological Baseline`,
          clinicalRationale: `Cumulative postural, biomechanical, and metabolic loads localized to ${part}.`,
          plainLanguageRationale: `Your ${part} has carried strain from daily movement, posture, and routine activities.`,
          patientSelfCareRationale: `Listening to your ${part} early helps prevent small aches from turning into major disruptions.`,
          communitySdohRationale: 'Occupational ergonomics, lifting demands, and commute duration affect tissue recovery.'
        },
        act2WhereYouStandToday: {
          title: 'Daily Recovery & Functional Support',
          dailyActionPlan: `Targeted gentle mobility, adequate hydration, and posture resets every 45 minutes for ${part}.`,
          biometricBaseline: `Localized Tension: Moderate • Mobility: Preserved • Vitals: BP ${bp}, HR ${hr}`,
          plainLanguageAdvice: `Take 2-minute stretch breaks. Gently move your ${part} without pushing through sharp pain.`,
          patientHabitRoutine: 'Set a reminder to stand up, roll your shoulders, and stretch throughout the day.',
          communitySafetySupport: 'Ergonomic workstation assessment through workplace or community health clinic.'
        },
        act3WhereYoureGoing: {
          title: '30-Day Functional Milestone',
          watchWindow: 'Next 14 to 30 Days',
          warningSignsToMonitor: ['Numbness, tingling, or radiating pain into limbs', 'Loss of strength or inability to bear weight', 'Persistent pain that wakes you from sleep'],
          actionGuidance: 'Physical therapy or osteopathic functional evaluation if symptoms do not improve in 14 days.',
          plainLanguageGuidance: 'Contact clinic if you feel numbness tingling down your arm or leg, or pain at rest.',
          patientVitalityMilestone: `Full comfortable range of motion in ${part} with zero hesitation.`,
          communityFollowUpProtocol: 'Follow up survey and mobility check-in at 30 days.'
        }
      };
    }
  });

  openForBodyPart(partName: string): void {
    this.selectedBodyPart.set(partName);
    this.activeDescription.set('');
    this.carePlan.set(null);
    this.isOpen.set(true);
  }

  closeSheet(): void {
    this.isOpen.set(false);
    this.isRecording.set(false);
    this.closed.emit();
  }

  launchDrilldown(target: 'biomarkers' | 'occupational' | 'food_safety' | 'ybocs' | 'qaly' | 'vagal'): void {
    if (this.patientState) {
      this.patientState.activeDrilldownComponent.set(target);
    }
    this.closeSheet();
  }

  scrollToPosology(): void {
    this.closeSheet();
    if (typeof document !== 'undefined') {
      const posologyEl = document.querySelector('app-clinical-posology-calculator, #posology-calculator');
      if (posologyEl) {
        posologyEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  printOrganAvs(): void {
    if (typeof window !== 'undefined') {
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.add('printing-avs-handout');
      }
      if (typeof window.print === 'function') {
        window.print();
      }
      setTimeout(() => {
        if (typeof document !== 'undefined' && document.body) {
          document.body.classList.remove('printing-avs-handout');
        }
      }, 3500);
    }
  }

  addChipText(chip: string): void {
    const current = this.activeDescription();
    if (!current.includes(chip)) {
      this.activeDescription.set(current ? `${current}, ${chip}` : chip);
    }
  }

  onDescriptionInput(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.activeDescription.set(input.value);
  }

  toggleVoiceRecording(): void {
    if (this.isRecording()) {
      this.isRecording.set(false);
    } else {
      this.isRecording.set(true);
      // Simulated instantaneous speech recognition fallback for testing
      setTimeout(() => {
        if (this.isRecording()) {
          const sampleSpeech = `Soreness and tension in ${this.selectedBodyPart().toLowerCase()} aggravated by stress`;
          this.activeDescription.set(sampleSpeech);
          this.isRecording.set(false);
        }
      }, 1500);
    }
  }

  generateCarePlan(): void {
    this.isGenerating.set(true);

    setTimeout(() => {
      const part = this.selectedBodyPart();
      const desc = this.activeDescription();

      const plan: IBodyPartCarePlan = {
        partId: part.toLowerCase().replace(/\s+/g, '-'),
        partName: part,
        symptomDescription: desc,
        generatedAt: new Date().toISOString(),
        allopathic: {
          title: `Allopathic Clinical Assessment (${part})`,
          icd10: part.toLowerCase().includes('head') ? 'G44.209' : 'M54.50',
          biomarker: 'hs-CRP, Electrolyte Panel, Autonomic Tone',
          recommendation: 'Targeted hydration protocol (500ml isotonic), posture reset, and 15-minute ergonomic visual break.',
        },
        tcm: {
          title: `TCM Meridian & Organ Assessment`,
          meridian: part.toLowerCase().includes('head') ? 'Taiyang Bladder / Shaoyang Gallbladder' : 'Du Mai / Kidney Channel',
          acupoint: part.toLowerCase().includes('head') ? 'LI4 (Hegu) & GB20 (Fengchi)' : 'BL23 (Shenshu) & GV4 (Mingmen)',
          recommendation: 'Apply gentle circular acupressure for 2 minutes to disperse stagnant Qi and clear heat.',
        },
        ayurvedic: {
          title: `Ayurvedic Dosha & Dhatu Balancing`,
          dosha: 'Prana Vata Aggravation / Pitta Excess',
          herb: 'Ashwagandha (Withania somnifera) & Brahmi (Bacopa monnieri)',
          recommendation: 'Warm sesame oil self-massage (Abhyanga) and 5 minutes of alternate nostril breathing (Nadi Shodhana).',
        },
        osteopathic: {
          title: `Osteopathic Somatic Dysfunction Review`,
          somaticSegment: part.toLowerCase().includes('head') ? 'C1-C2 Suboccipital Strain' : 'L4-L5 Somatic Restriction',
          omtTechnique: 'Suboccipital Decompression & Myofascial Release',
          recommendation: 'Gentle myofascial release to restore craniosacral fluid mechanics and venous drainage.',
        },
      };

      this.carePlan.set(plan);
      this.isGenerating.set(false);
    }, 400);
  }

  toggleAvsPreview(): void {
    this.showAvsPreview.update(v => !v);
  }

  closeAvsPreview(): void {
    this.showAvsPreview.set(false);
  }
}
