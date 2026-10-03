import { Component, ChangeDetectionStrategy, signal, computed, inject, output, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WhoEssentialMedicinesService } from '../../services/who-essential-medicines.service';
import { WhoEssentialDiagnosticsService } from '../../services/who-essential-diagnostics.service';
import { AustereMeshSyncService } from '../../services/austere-mesh-sync.service';
import { PediatricDosingEngineService } from '../../services/pediatric-dosing-engine.service';
import { generate } from 'lean-qr';
import {
  FrontlineVernacularVoiceService,
  VernacularLanguageCode,
  IVernacularPrompt,
  ITriageVoiceContext
} from '../../services/frontline-vernacular-voice.service';

export type ChwTab = 'malnutrition_muac' | 'pneumonia_timer' | 'dehydration_ors' | 'danger_signs' | 'open_formulary' | 'who_edl_rdt' | 'cold_chain' | 'austere_mesh_sync' | 'pediatric_dosing';

export interface IMuacTriageResult {
  muacMm: number;
  edemaGrade: 'NONE' | 'GRADE_1' | 'GRADE_2' | 'GRADE_3';
  statusTier: 'SEVERE_ACUTE_MALNUTRITION' | 'MODERATE_ACUTE_MALNUTRITION' | 'WELL_NOURISHED';
  statusLabel: string;
  badgeClass: string;
  rutfSachetsPerDay: number;
  rutfWeightGuide: string;
  clinicalAction: string;
}

export interface IPneumoniaTriageResult {
  ageGroup: '<2_MONTHS' | '2_11_MONTHS' | '12_59_MONTHS';
  respiratoryRateBpm: number;
  hasChestIndrawing: boolean;
  hasStridorAtRest: boolean;
  hasDangerSigns: boolean;
  classification: 'SEVERE_PNEUMONIA' | 'PNEUMONIA' | 'NO_PNEUMONIA';
  classificationLabel: string;
  badgeClass: string;
  recommendedTreatment: string;
}

export interface IDehydrationTriageResult {
  plan: 'PLAN_A' | 'PLAN_B' | 'PLAN_C';
  planLabel: string;
  badgeClass: string;
  orsVolumeMl4Hours: number;
  zincDoseMgDaily: number;
  clinicalDirectives: string[];
}

@Component({
  selector: 'app-community-health-worker-suite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full max-w-5xl mx-auto p-4 sm:p-6 bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl font-sans"
         style="font-feature-settings: 'cv08' 1, 'cv05' 1, 'ss02' 1;">

      <!-- Top Header: MSF / WHO CHW Task-Shifting Demarcation -->
      <header class="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl shadow-xs">
            🌿
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold tracking-tight text-zinc-50">
                Frontline Community Health Worker (CHW) Suite
              </h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                WHO Task-Shifting • MSF Austere
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">
              Zero-Bandwidth Frontline Triage: MUAC Malnutrition, IMCI Tachypnea Counter, ORS Titration &amp; Free Formularies
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 font-mono text-xs">
          <span class="px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            100% Offline Standalone
          </span>
          <button type="button"
                  (click)="toggleQrModal()"
                  id="btn-chw-qr-handoff"
                  class="px-3 py-1.5 text-xs font-semibold text-teal-200 bg-teal-950/60 hover:bg-teal-900 border border-teal-700/60 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm">
            <span>📱</span> Peer-to-Peer QR Handoff
          </button>
          @if (hasCloseButton) {
            <button type="button"
                    (click)="close.emit()"
                    aria-label="Close CHW Suite"
                    class="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer">
              ✕
            </button>
          }
        </div>
      </header>

      <!-- Frontline Multilingual Vernacular Voice Bar (WHO/MSF Top 5 Languages) -->
      <section class="mt-4 p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 shadow-inner"
               aria-label="Frontline Multilingual Vernacular Voice Selector">
        <div class="flex items-center gap-2.5">
          <span class="text-lg" role="img" aria-label="Audio Translation">🗣️</span>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-zinc-100">Frontline Vernacular Voice Prompts</span>
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/60 font-semibold">Offline TTS</span>
            </div>
            <p class="text-[11px] text-zinc-400">
              Spoken &amp; visual guidance for illiterate or visually impaired patients in austere field clinics
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          @for (lang of voiceService.languages(); track lang.code) {
            <button type="button"
                    (click)="selectVernacularLanguage(lang.code)"
                    [id]="'btn-chw-lang-' + lang.code"
                    [class.bg-teal-600]="voiceService.activeLanguageCode() === lang.code"
                    [class.text-white]="voiceService.activeLanguageCode() === lang.code"
                    [class.border-teal-400]="voiceService.activeLanguageCode() === lang.code"
                    [class.bg-zinc-800]="voiceService.activeLanguageCode() !== lang.code"
                    [class.text-zinc-300]="voiceService.activeLanguageCode() !== lang.code"
                    [class.border-zinc-700]="voiceService.activeLanguageCode() !== lang.code"
                    class="px-2.5 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 shadow-xs">
              <span class="text-sm">{{ lang.flagEmoji }}</span>
              <span>{{ lang.nativeName }}</span>
              <span class="text-[10px] opacity-75 font-mono">({{ lang.code.toUpperCase() }})</span>
            </button>
          }
        </div>
      </section>

      <!-- Navigation Tabs -->
      <nav class="flex flex-wrap items-center gap-2 mt-4 pb-3 border-b border-zinc-800/70 text-xs font-mono font-bold" aria-label="CHW Triage Modules">
        <button type="button"
                (click)="activeTab.set('malnutrition_muac')"
                [class.bg-emerald-600]="activeTab() === 'malnutrition_muac'"
                [class.text-white]="activeTab() === 'malnutrition_muac'"
                [class.text-zinc-400]="activeTab() !== 'malnutrition_muac'"
                class="px-3.5 py-2 rounded-xl border border-transparent transition cursor-pointer flex items-center gap-1.5">
          <span>📏</span> 1. MUAC Malnutrition
        </button>

        <button type="button"
                (click)="activeTab.set('pneumonia_timer')"
                [class.bg-emerald-600]="activeTab() === 'pneumonia_timer'"
                [class.text-white]="activeTab() === 'pneumonia_timer'"
                [class.text-zinc-400]="activeTab() !== 'pneumonia_timer'"
                class="px-3.5 py-2 rounded-xl border border-transparent transition cursor-pointer flex items-center gap-1.5">
          <span>🫁</span> 2. Tachypnea Timer
        </button>

        <button type="button"
                (click)="activeTab.set('dehydration_ors')"
                [class.bg-emerald-600]="activeTab() === 'dehydration_ors'"
                [class.text-white]="activeTab() === 'dehydration_ors'"
                [class.text-zinc-400]="activeTab() !== 'dehydration_ors'"
                class="px-3.5 py-2 rounded-xl border border-transparent transition cursor-pointer flex items-center gap-1.5">
          <span>💧</span> 3. ORS Dehydration
        </button>

        <button type="button"
                (click)="activeTab.set('danger_signs')"
                [class.bg-rose-600]="activeTab() === 'danger_signs'"
                [class.text-white]="activeTab() === 'danger_signs'"
                [class.text-zinc-400]="activeTab() !== 'danger_signs'"
                class="px-3.5 py-2 rounded-xl border border-transparent transition cursor-pointer flex items-center gap-1.5">
          <span>🚨</span> 4. Danger Red Flags
        </button>

        <button type="button"
                (click)="activeTab.set('open_formulary')"
                [class.bg-sky-600]="activeTab() === 'open_formulary'"
                [class.text-white]="activeTab() === 'open_formulary'"
                [class.text-zinc-400]="activeTab() !== 'open_formulary'"
                class="px-3.5 py-2 rounded-xl border border-transparent transition cursor-pointer flex items-center gap-1.5">
          <span>💊</span> 5. WHO Free Formulary
        </button>

        <button type="button"
                (click)="activeTab.set('who_edl_rdt')"
                [class.bg-purple-600]="activeTab() === 'who_edl_rdt'"
                [class.text-white]="activeTab() === 'who_edl_rdt'"
                [class.text-zinc-400]="activeTab() !== 'who_edl_rdt'"
                class="px-3.5 py-2 rounded-xl border border-transparent transition cursor-pointer flex items-center gap-1.5">
          <span>🔬</span> 6. WHO EDL-4 Rapid Tests
        </button>

        <button type="button"
                (click)="activeTab.set('cold_chain')"
                [class.bg-cyan-600]="activeTab() === 'cold_chain'"
                [class.text-white]="activeTab() === 'cold_chain'"
                [class.text-zinc-400]="activeTab() !== 'cold_chain'"
                class="px-3.5 py-2 rounded-xl border border-transparent transition cursor-pointer flex items-center gap-1.5">
          <span>❄️</span> 7. Cold-Chain &amp; Solar Watchdog
        </button>

        <button type="button"
                (click)="activeTab.set('austere_mesh_sync')"
                [class.bg-indigo-600]="activeTab() === 'austere_mesh_sync'"
                [class.text-white]="activeTab() === 'austere_mesh_sync'"
                [class.text-zinc-400]="activeTab() !== 'austere_mesh_sync'"
                class="px-3.5 py-2 rounded-xl border border-transparent transition cursor-pointer flex items-center gap-1.5">
          <span>📡</span> 8. Local Wi-Fi Mesh Sync
        </button>

        <button type="button"
                (click)="activeTab.set('pediatric_dosing')"
                [class.bg-teal-600]="activeTab() === 'pediatric_dosing'"
                [class.text-white]="activeTab() === 'pediatric_dosing'"
                [class.text-zinc-400]="activeTab() !== 'pediatric_dosing'"
                class="px-3.5 py-2 rounded-xl border border-transparent transition cursor-pointer flex items-center gap-1.5">
          <span>⚖️</span> 9. Pediatric Dosing (IMCI)
        </button>
      </nav>

      <!-- Active Vernacular Audio-Visual Guidance HUD Card -->
      <aside class="mt-4 p-3.5 rounded-2xl border transition-all duration-300 shadow-md"
             [class.bg-rose-950/40]="currentTriageVoicePrompt().acuityTier === 'RED'"
             [class.border-rose-700/60]="currentTriageVoicePrompt().acuityTier === 'RED'"
             [class.bg-amber-950/40]="currentTriageVoicePrompt().acuityTier === 'YELLOW'"
             [class.border-amber-700/60]="currentTriageVoicePrompt().acuityTier === 'YELLOW'"
             [class.bg-emerald-950/40]="currentTriageVoicePrompt().acuityTier === 'GREEN'"
             [class.border-emerald-700/60]="currentTriageVoicePrompt().acuityTier === 'GREEN'"
             [dir]="currentTriageVoicePrompt().direction"
             aria-live="polite">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="space-y-1 max-w-2xl">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                    [class.bg-rose-900/80]="currentTriageVoicePrompt().acuityTier === 'RED'"
                    [class.text-rose-200]="currentTriageVoicePrompt().acuityTier === 'RED'"
                    [class.bg-amber-900/80]="currentTriageVoicePrompt().acuityTier === 'YELLOW'"
                    [class.text-amber-200]="currentTriageVoicePrompt().acuityTier === 'YELLOW'"
                    [class.bg-emerald-900/80]="currentTriageVoicePrompt().acuityTier === 'GREEN'"
                    [class.text-emerald-200]="currentTriageVoicePrompt().acuityTier === 'GREEN'">
                {{ currentTriageVoicePrompt().language.flagEmoji }} {{ currentTriageVoicePrompt().language.nativeName }} • {{ currentTriageVoicePrompt().headline }}
              </span>
              <span class="text-[11px] text-zinc-400 font-mono">
                Agency: {{ currentTriageVoicePrompt().language.primaryAgency }}
              </span>
            </div>

            <!-- Vernacular Spoken Script in native font -->
            <p class="text-sm sm:text-base font-bold text-zinc-100 leading-snug">
              "{{ currentTriageVoicePrompt().promptText }}"
            </p>

            <!-- Phonetic pronunciation guide and plain English meaning -->
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-300">
              <span class="text-teal-300 font-mono">
                🗣️ <span class="text-zinc-400">Phonetic:</span> {{ currentTriageVoicePrompt().phoneticGuide }}
              </span>
              <span class="text-zinc-400">|</span>
              <span class="text-zinc-300 italic">
                <span class="text-zinc-400 not-italic font-semibold">Meaning:</span> {{ currentTriageVoicePrompt().englishMeaning }}
              </span>
            </div>
          </div>

          <!-- Play Audio Guidance Button -->
          <div class="flex items-center gap-2 shrink-0">
            @if (voiceService.isSpeaking()) {
              <button type="button"
                      (click)="stopSpeaking()"
                      id="btn-chw-audio-stop"
                      class="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm">
                <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>⏹️ Stop Audio</span>
              </button>
            } @else {
              <button type="button"
                      (click)="speakCurrentTriage()"
                      id="btn-chw-audio-speak"
                      class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-mono text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm">
                <span>🔊</span>
                <span>Listen in {{ currentTriageVoicePrompt().language.nativeName }}</span>
              </button>
            }
          </div>
        </div>
      </aside>

      <!-- TAB 1: MUAC Malnutrition & RUTF Titration -->
      @if (activeTab() === 'malnutrition_muac') {
        <section class="mt-5 space-y-5 animate-in fade-in duration-200">
          <div class="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>📏</span> Mid-Upper Arm Circumference (MUAC) &amp; Edema Screen
              </h3>
              <p class="text-xs text-zinc-400 mt-1">
                Standard WHO screening for infants and children aged 6 to 59 months. Red &lt;115 mm, Yellow 115–124 mm, Green &ge;125 mm.
              </p>
            </div>
            <!-- Classification Badge -->
            <div [class]="muacTriage().badgeClass" class="px-4 py-2 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 shadow-md">
              <span class="text-base">{{ muacTriage().statusTier === 'SEVERE_ACUTE_MALNUTRITION' ? '🔴' : (muacTriage().statusTier === 'MODERATE_ACUTE_MALNUTRITION' ? '🟡' : '🟢') }}</span>
              <span>{{ muacTriage().statusLabel }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- MUAC Input -->
            <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 space-y-3">
              <label class="text-xs font-semibold text-zinc-300 block" for="muac-slider">
                Arm Circumference (MUAC): <strong class="text-emerald-400 font-mono text-base">{{ muacMm() }} mm</strong>
              </label>
              <input id="muac-slider"
                     type="range"
                     min="80"
                     max="170"
                     step="1"
                     [ngModel]="muacMm()"
                     (ngModelChange)="muacMm.set(+$event)"
                     class="w-full accent-emerald-500 cursor-pointer" />
              <div class="flex justify-between text-[10px] font-mono text-zinc-500">
                <span class="text-rose-400">&lt;115 mm (SAM)</span>
                <span class="text-amber-400">115-124 (MAM)</span>
                <span class="text-emerald-400">&ge;125 (Normal)</span>
              </div>
            </div>

            <!-- Bilateral Pitting Edema Check -->
            <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 space-y-2">
              <label class="text-xs font-semibold text-zinc-300 block">
                Bilateral Pitting Edema (Kwashiorkor):
              </label>
              <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                <button type="button"
                        (click)="edemaGrade.set('NONE')"
                        [class.bg-emerald-950]="edemaGrade() === 'NONE'"
                        [class.border-emerald-600]="edemaGrade() === 'NONE'"
                        class="p-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 transition cursor-pointer">
                  None (0)
                </button>
                <button type="button"
                        (click)="edemaGrade.set('GRADE_1')"
                        [class.bg-rose-950]="edemaGrade() === 'GRADE_1'"
                        [class.border-rose-600]="edemaGrade() === 'GRADE_1'"
                        class="p-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 transition cursor-pointer">
                  + Feet Only
                </button>
                <button type="button"
                        (click)="edemaGrade.set('GRADE_2')"
                        [class.bg-rose-950]="edemaGrade() === 'GRADE_2'"
                        [class.border-rose-600]="edemaGrade() === 'GRADE_2'"
                        class="p-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 transition cursor-pointer">
                  ++ Lower Legs
                </button>
                <button type="button"
                        (click)="edemaGrade.set('GRADE_3')"
                        [class.bg-rose-950]="edemaGrade() === 'GRADE_3'"
                        [class.border-rose-600]="edemaGrade() === 'GRADE_3'"
                        class="p-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 transition cursor-pointer">
                  +++ Generalized
                </button>
              </div>
            </div>

            <!-- Child Weight Input for RUTF -->
            <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 space-y-3">
              <label class="text-xs font-semibold text-zinc-300 block" for="child-weight">
                Child Weight (kg): <strong class="text-teal-400 font-mono text-base">{{ childWeightKg() }} kg</strong>
              </label>
              <input id="child-weight"
                     type="number"
                     min="3"
                     max="25"
                     step="0.5"
                     [ngModel]="childWeightKg()"
                     (ngModelChange)="childWeightKg.set(+$event)"
                     class="w-full p-2 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 font-mono text-sm" />
              <p class="text-[11px] text-zinc-500">
                Calibrates therapeutic food (Plumpy'Nut) sachets according to WHO outpatient guidelines.
              </p>
            </div>
          </div>

          <!-- RUTF Dosage & Clinical Action Directive -->
          <div class="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono uppercase text-emerald-400 font-semibold">Action Directive:</span>
                <button type="button"
                        (click)="speakCurrentTriage()"
                        id="btn-chw-speak-muac"
                        class="px-2 py-0.5 rounded-lg bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-800/60 text-[10px] font-mono transition cursor-pointer flex items-center gap-1 shadow-xs">
                  <span>🔊</span> Listen ({{ currentTriageVoicePrompt().language.nativeName }})
                </button>
              </div>
              <p class="text-xs text-zinc-200 mt-1 leading-relaxed">
                {{ muacTriage().clinicalAction }}
              </p>
            </div>
            @if (muacTriage().statusTier === 'SEVERE_ACUTE_MALNUTRITION') {
              <div class="p-3 bg-amber-950/60 rounded-xl border border-amber-600/50 text-amber-200 text-xs font-mono shrink-0">
                <div>RUTF (Plumpy'Nut): <strong>{{ muacTriage().rutfSachetsPerDay }} sachets/day</strong></div>
                <div class="text-[10px] text-amber-300/80 mt-0.5">{{ muacTriage().rutfWeightGuide }}</div>
              </div>
            }
          </div>
        </section>
      }

      <!-- TAB 2: IMCI Pneumonia & Tachypnea Tap-Timer -->
      @if (activeTab() === 'pneumonia_timer') {
        <section class="mt-5 space-y-5 animate-in fade-in duration-200">
          <div class="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>🫁</span> WHO IMCI Pediatric Tachypnea Counter &amp; Pneumonia Acuity
              </h3>
              <p class="text-xs text-zinc-400 mt-1">
                Tap the counter button along with each chest rise. Detects life-threatening pneumonia in seconds without a stethoscope.
              </p>
            </div>
            <div [class]="pneumoniaTriage().badgeClass" class="px-4 py-2 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 shadow-md">
              <span>{{ pneumoniaTriage().classificationLabel }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Age Group Selection -->
            <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 space-y-2">
              <label class="text-xs font-semibold text-zinc-300 block">Patient Age Group:</label>
              <div class="space-y-2 text-xs font-mono">
                <button type="button"
                        (click)="respiratoryAgeGroup.set('<2_MONTHS')"
                        [class.bg-emerald-950]="respiratoryAgeGroup() === '<2_MONTHS'"
                        [class.border-emerald-600]="respiratoryAgeGroup() === '<2_MONTHS'"
                        class="w-full text-left p-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 cursor-pointer">
                  &lt; 2 Months (Cutoff: &ge;60 bpm)
                </button>
                <button type="button"
                        (click)="respiratoryAgeGroup.set('2_11_MONTHS')"
                        [class.bg-emerald-950]="respiratoryAgeGroup() === '2_11_MONTHS'"
                        [class.border-emerald-600]="respiratoryAgeGroup() === '2_11_MONTHS'"
                        class="w-full text-left p-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 cursor-pointer">
                  2 to 11 Months (Cutoff: &ge;50 bpm)
                </button>
                <button type="button"
                        (click)="respiratoryAgeGroup.set('12_59_MONTHS')"
                        [class.bg-emerald-950]="respiratoryAgeGroup() === '12_59_MONTHS'"
                        [class.border-emerald-600]="respiratoryAgeGroup() === '12_59_MONTHS'"
                        class="w-full text-left p-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-200 cursor-pointer">
                  12 to 59 Months (Cutoff: &ge;40 bpm)
                </button>
              </div>
            </div>

            <!-- Tap-Tempo Counter Widget -->
            <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center text-center space-y-3">
              <div class="text-xs font-semibold text-zinc-300">Tap Tempo Breathing Counter</div>
              <div class="text-4xl font-extrabold font-mono text-emerald-400 tabular-nums">
                {{ respiratoryBpm() }} <span class="text-xs font-normal text-zinc-400">bpm</span>
              </div>
              <div class="flex items-center gap-2">
                <button type="button"
                        (click)="tapBreathing()"
                        class="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition cursor-pointer active:scale-95">
                  👆 Tap on Chest Rise
                </button>
                <button type="button"
                        (click)="resetTimer()"
                        class="px-3 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition cursor-pointer">
                  ↺ Reset
                </button>
              </div>
              <p class="text-[10px] text-zinc-500 font-mono">
                Tap 4 or more times to calculate rate automatically.
              </p>
            </div>

            <!-- Clinical Signs Checkbox -->
            <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 space-y-3">
              <label class="text-xs font-semibold text-zinc-300 block">Severe Respiratory Signs:</label>
              <label class="flex items-center gap-2 text-xs text-zinc-200 cursor-pointer">
                <input type="checkbox"
                       [ngModel]="chestIndrawing()"
                       (ngModelChange)="chestIndrawing.set($event)"
                       class="w-4 h-4 rounded text-rose-500 focus:ring-rose-400" />
                <span>Chest wall indrawing (skin retracts under ribs)</span>
              </label>
              <label class="flex items-center gap-2 text-xs text-zinc-200 cursor-pointer">
                <input type="checkbox"
                       [ngModel]="stridorAtRest()"
                       (ngModelChange)="stridorAtRest.set($event)"
                       class="w-4 h-4 rounded text-rose-500 focus:ring-rose-400" />
                <span>Stridor or harsh noise when child is calm</span>
              </label>
              <label class="flex items-center gap-2 text-xs text-zinc-200 cursor-pointer">
                <input type="checkbox"
                       [ngModel]="cyanosisOrHypoxia()"
                       (ngModelChange)="cyanosisOrHypoxia.set($event)"
                       class="w-4 h-4 rounded text-rose-500 focus:ring-rose-400" />
                <span>Central cyanosis (blue lips/tongue)</span>
              </label>
            </div>
          </div>

          <!-- Treatment Recommendation Directive -->
          <div class="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/80">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono uppercase text-teal-400 font-semibold">Treatment &amp; Referral Directive:</span>
              <button type="button"
                      (click)="speakCurrentTriage()"
                      id="btn-chw-speak-pneumonia"
                      class="px-2 py-0.5 rounded-lg bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-800/60 text-[10px] font-mono transition cursor-pointer flex items-center gap-1 shadow-xs">
                <span>🔊</span> Listen ({{ currentTriageVoicePrompt().language.nativeName }})
              </button>
            </div>
            <p class="text-xs text-zinc-200 mt-1 leading-relaxed">
              {{ pneumoniaTriage().recommendedTreatment }}
            </p>
          </div>
        </section>
      }

      <!-- TAB 3: Dehydration & ORS Titration -->
      @if (activeTab() === 'dehydration_ors') {
        <section class="mt-5 space-y-5 animate-in fade-in duration-200">
          <div class="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>💧</span> WHO Diarrhea &amp; Dehydration Rehydration Protocol
              </h3>
              <p class="text-xs text-zinc-400 mt-1">
                Rapid classification into Plan A (Home Care), Plan B (Oral Rehydration Therapy), or Plan C (Emergency IV Access).
              </p>
            </div>
            <div [class]="dehydrationTriage().badgeClass" class="px-4 py-2 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 shadow-md">
              <span>{{ dehydrationTriage().planLabel }}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <!-- 1. General Condition -->
            <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 space-y-2">
              <span class="font-semibold text-zinc-300 block">General State:</span>
              <div class="space-y-1.5 font-mono">
                <button type="button" (click)="generalState.set('ALERT')"
                        [class.bg-emerald-950]="generalState() === 'ALERT'"
                        class="w-full text-left p-2 rounded-lg bg-zinc-800 border border-zinc-700">
                  Well / Alert
                </button>
                <button type="button" (click)="generalState.set('IRRITABLE')"
                        [class.bg-amber-950]="generalState() === 'IRRITABLE'"
                        class="w-full text-left p-2 rounded-lg bg-zinc-800 border border-zinc-700">
                  Restless / Irritable
                </button>
                <button type="button" (click)="generalState.set('LETHARGIC')"
                        [class.bg-rose-950]="generalState() === 'LETHARGIC'"
                        class="w-full text-left p-2 rounded-lg bg-zinc-800 border border-zinc-700">
                  Lethargic / Floppy
                </button>
              </div>
            </div>

            <!-- 2. Eyes -->
            <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 space-y-2">
              <span class="font-semibold text-zinc-300 block">Eyes:</span>
              <div class="space-y-1.5 font-mono">
                <button type="button" (click)="eyesState.set('NORMAL')"
                        [class.bg-emerald-950]="eyesState() === 'NORMAL'"
                        class="w-full text-left p-2 rounded-lg bg-zinc-800 border border-zinc-700">
                  Normal
                </button>
                <button type="button" (click)="eyesState.set('SUNKEN')"
                        [class.bg-amber-950]="eyesState() === 'SUNKEN'"
                        class="w-full text-left p-2 rounded-lg bg-zinc-800 border border-zinc-700">
                  Sunken
                </button>
              </div>
            </div>

            <!-- 3. Thirst -->
            <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 space-y-2">
              <span class="font-semibold text-zinc-300 block">Thirst / Drinking:</span>
              <div class="space-y-1.5 font-mono">
                <button type="button" (click)="thirstState.set('NORMAL')"
                        [class.bg-emerald-950]="thirstState() === 'NORMAL'"
                        class="w-full text-left p-2 rounded-lg bg-zinc-800 border border-zinc-700">
                  Drinks normally
                </button>
                <button type="button" (click)="thirstState.set('EAGER')"
                        [class.bg-amber-950]="thirstState() === 'EAGER'"
                        class="w-full text-left p-2 rounded-lg bg-zinc-800 border border-zinc-700">
                  Thirsty / Eager
                </button>
                <button type="button" (click)="thirstState.set('POOR')"
                        [class.bg-rose-950]="thirstState() === 'POOR'"
                        class="w-full text-left p-2 rounded-lg bg-zinc-800 border border-zinc-700">
                  Unable / Poorly
                </button>
              </div>
            </div>

            <!-- 4. Skin Pinch -->
            <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 space-y-2">
              <span class="font-semibold text-zinc-300 block">Abdominal Skin Pinch:</span>
              <div class="space-y-1.5 font-mono">
                <button type="button" (click)="skinPinchState.set('IMMEDIATE')"
                        [class.bg-emerald-950]="skinPinchState() === 'IMMEDIATE'"
                        class="w-full text-left p-2 rounded-lg bg-zinc-800 border border-zinc-700">
                  Immediate (&lt;1s)
                </button>
                <button type="button" (click)="skinPinchState.set('SLOW')"
                        [class.bg-amber-950]="skinPinchState() === 'SLOW'"
                        class="w-full text-left p-2 rounded-lg bg-zinc-800 border border-zinc-700">
                  Slow (&lt;2s)
                </button>
                <button type="button" (click)="skinPinchState.set('VERY_SLOW')"
                        [class.bg-rose-950]="skinPinchState() === 'VERY_SLOW'"
                        class="w-full text-left p-2 rounded-lg bg-zinc-800 border border-zinc-700">
                  Very Slow (&gt;2s)
                </button>
              </div>
            </div>
          </div>

          <!-- ORS Volume & Zinc Output Card -->
          <div class="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono uppercase text-cyan-400 font-semibold">Treatment Directives:</span>
                <button type="button"
                        (click)="speakCurrentTriage()"
                        id="btn-chw-speak-dehydration"
                        class="px-2 py-0.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 text-[10px] font-mono transition cursor-pointer flex items-center gap-1 shadow-xs">
                  <span>🔊</span> Listen ({{ currentTriageVoicePrompt().language.nativeName }})
                </button>
              </div>
              <ul class="text-xs text-zinc-300 list-disc list-inside space-y-1">
                @for (dir of dehydrationTriage().clinicalDirectives; track dir) {
                  <li>{{ dir }}</li>
                }
              </ul>
            </div>
            <div class="p-3 bg-cyan-950/60 rounded-xl border border-cyan-600/50 text-cyan-200 text-xs font-mono shrink-0">
              <div>ORS Volume: <strong>{{ dehydrationTriage().orsVolumeMl4Hours }} mL</strong> over 4 hours</div>
              <div class="mt-1">Zinc Supplement: <strong>{{ dehydrationTriage().zincDoseMgDaily }} mg/day</strong> for 14 days</div>
            </div>
          </div>
        </section>
      }

      <!-- TAB 4: Danger Signs (Red Flags) -->
      @if (activeTab() === 'danger_signs') {
        <section class="mt-5 space-y-5 animate-in fade-in duration-200">
          <div class="p-4 bg-rose-950/40 rounded-2xl border border-rose-600/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-rose-200 flex items-center gap-2">
                  <span>🚨</span> 7 IMCI General Danger Signs (Zero Delay Referral)
                </h3>
                <button type="button"
                        (click)="speakCurrentTriage()"
                        id="btn-chw-speak-danger"
                        class="px-2 py-0.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700/60 text-[10px] font-mono transition cursor-pointer flex items-center gap-1 shadow-xs">
                  <span>🔊</span> Listen ({{ currentTriageVoicePrompt().language.nativeName }})
                </button>
              </div>
              <p class="text-xs text-rose-300/80 mt-1">
                If ANY of these signs are present, immediately stabilize child, give first-dose antibiotics/glucose if indicated, and arrange urgent transport.
              </p>
            </div>
            <div class="px-3 py-1.5 rounded-xl font-mono text-xs font-bold"
                 [class.bg-rose-600]="anyDangerSignPresent()"
                 [class.text-white]="anyDangerSignPresent()"
                 [class.bg-emerald-950]="!anyDangerSignPresent()"
                 [class.text-emerald-300]="!anyDangerSignPresent()">
              {{ anyDangerSignPresent() ? '⚠️ RED ALERT: TRANSFER REQUIRED' : '✓ No Danger Signs Flagged' }}
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            @for (flag of dangerFlags(); track flag.id) {
              <label class="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 flex items-center gap-3 cursor-pointer hover:border-zinc-700 transition">
                <input type="checkbox"
                       [checked]="flag.checked"
                       (change)="toggleDangerFlag(flag.id)"
                       class="w-4 h-4 rounded text-rose-600 focus:ring-rose-500" />
                <div>
                  <div class="font-bold text-zinc-100">{{ flag.label }}</div>
                  <div class="text-[11px] text-zinc-400 mt-0.5">{{ flag.detail }}</div>
                </div>
              </label>
            }
          </div>
        </section>
      }

      <!-- TAB 5: WHO Essential Medicines Open Formulary -->
      @if (activeTab() === 'open_formulary') {
        <section class="mt-5 space-y-5 animate-in fade-in duration-200">
          <div class="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>💊</span> Universal Open Formulary &amp; Generic Compounding Engine
              </h3>
              <p class="text-xs text-zinc-400 mt-1">
                WHO Model List of Essential Medicines (EML 23rd List). Pennies-per-dose open generics eliminating commercial medical bankruptcy.
              </p>
            </div>
            <div class="flex items-center gap-2">
              <input type="text"
                     placeholder="Search medicine or indication..."
                     [ngModel]="formularySearch()"
                     (ngModelChange)="formularySearch.set($event)"
                     class="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 font-mono focus:outline-none focus:border-sky-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
            @for (med of filteredMedicines(); track med.id) {
              <div class="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between space-y-3">
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <h4 class="text-xs font-bold text-sky-300 font-mono">{{ med.name }}</h4>
                    <span class="px-1.5 py-0.5 rounded text-[9px] font-mono bg-sky-950 text-sky-200 border border-sky-800/60">
                      {{ med.atcCode }}
                    </span>
                  </div>
                  <div class="text-[11px] text-zinc-400 font-serif italic mt-0.5">{{ med.genericInn }}</div>
                  <p class="text-[11px] text-zinc-300 mt-2 leading-snug">{{ med.clinicalIndication }}</p>
                </div>

                <div class="pt-2 border-t border-zinc-800 text-[11px] font-mono space-y-1">
                  <div class="flex justify-between text-zinc-400">
                    <span>Global Procurement:</span>
                    <strong class="text-emerald-400">&#36;{{ med.medianGlobalCostPerDoseUsd.toFixed(2) }} / dose</strong>
                  </div>
                  <div class="flex justify-between text-zinc-400">
                    <span>Standard Retail Benchmark:</span>
                    <span class="text-rose-400 line-through">&#36;{{ (med.standardRetailBenchmarkMonthlyCostUsd || med.typicalUsMonopolyMonthlyCostUsd || 0).toFixed(2) }} / mo</span>
                  </div>
                  <div class="text-[10px] text-emerald-300 font-bold">
                    {{ med.savingsPercent }}% Household Savings
                  </div>
                  <div class="mt-2 text-[10px] text-zinc-400 bg-zinc-950 p-2 rounded-xl border border-zinc-800">
                    <strong class="text-zinc-300 block mb-0.5">Compounding / Monograph:</strong>
                    {{ med.openCompoundingMonograph }}
                  </div>
                </div>
              </div>
            }
          </div>
        </section>
      }


      <!-- MODULE 6: WHO EDL-4 Point-of-Care Rapid Diagnostic Tests (RDTs) -->
      @if (activeTab() === 'who_edl_rdt') {
        <section class="mt-4 p-4 sm:p-6 bg-zinc-900/60 rounded-3xl border border-zinc-800 space-y-6 animate-in fade-in duration-200">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div>
              <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>🔬</span> WHO Model List of Essential In Vitro Diagnostics (EDL-4)
              </h3>
              <p class="text-xs text-zinc-400">
                Primary healthcare &amp; community lateral-flow assays: Dual HIV/Syphilis, Malaria Pf/Pv, Dengue NS1 &amp; Sickle Cell
              </p>
            </div>
            <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60 font-bold">
              WHO Pre-Qualified
            </span>
          </div>

          <!-- RDT Assay Sub-Selector Buttons -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <button type="button"
                    (click)="edlService.setRdtType('hiv_syphilis_dual')"
                    [class.bg-purple-600]="edlService.activeRdtType() === 'hiv_syphilis_dual'"
                    [class.text-white]="edlService.activeRdtType() === 'hiv_syphilis_dual'"
                    [class.border-purple-400]="edlService.activeRdtType() === 'hiv_syphilis_dual'"
                    class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-left transition hover:border-zinc-700 cursor-pointer">
              <span class="block text-sm mb-1">🩺</span>
              <span class="font-bold block truncate">Dual HIV/Syphilis</span>
              <span class="text-[10px] text-zinc-400 block">Prenatal MTCT</span>
            </button>

            <button type="button"
                    (click)="edlService.setRdtType('malaria_pf_pv')"
                    [class.bg-purple-600]="edlService.activeRdtType() === 'malaria_pf_pv'"
                    [class.text-white]="edlService.activeRdtType() === 'malaria_pf_pv'"
                    [class.border-purple-400]="edlService.activeRdtType() === 'malaria_pf_pv'"
                    class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-left transition hover:border-zinc-700 cursor-pointer">
              <span class="block text-sm mb-1">🦟</span>
              <span class="font-bold block truncate">Malaria Pf / Pv</span>
              <span class="text-[10px] text-zinc-400 block">HRP2 &amp; pLDH Ag</span>
            </button>

            <button type="button"
                    (click)="edlService.setRdtType('dengue_ns1_ab')"
                    [class.bg-purple-600]="edlService.activeRdtType() === 'dengue_ns1_ab'"
                    [class.text-white]="edlService.activeRdtType() === 'dengue_ns1_ab'"
                    [class.border-purple-400]="edlService.activeRdtType() === 'dengue_ns1_ab'"
                    class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-left transition hover:border-zinc-700 cursor-pointer">
              <span class="block text-sm mb-1">🩸</span>
              <span class="font-bold block truncate">Dengue NS1/Ab</span>
              <span class="text-[10px] text-zinc-400 block">Acute Day 1–5</span>
            </button>

            <button type="button"
                    (click)="edlService.setRdtType('sickle_cell_rdt')"
                    [class.bg-purple-600]="edlService.activeRdtType() === 'sickle_cell_rdt'"
                    [class.text-white]="edlService.activeRdtType() === 'sickle_cell_rdt'"
                    [class.border-purple-400]="edlService.activeRdtType() === 'sickle_cell_rdt'"
                    class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-left transition hover:border-zinc-700 cursor-pointer">
              <span class="block text-sm mb-1">🧬</span>
              <span class="font-bold block truncate">Sickle Cell (SCD)</span>
              <span class="text-[10px] text-zinc-400 block">HbS Lateral Flow</span>
            </button>
          </div>

          <!-- Active Test Content Panels -->
          <!-- 1. Dual HIV/Syphilis Panel -->
          @if (edlService.activeRdtType() === 'hiv_syphilis_dual') {
            <div class="space-y-4">
              <div class="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <span class="text-xs font-bold text-zinc-200 uppercase tracking-wider block">
                  Cassette Visual Readout Controls
                </span>

                <div class="flex flex-wrap gap-3">
                  <label class="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs cursor-pointer">
                    <input type="checkbox" [checked]="edlService.hivSyphilisControl()" (change)="edlService.hivSyphilisControl.set($any($event.target).checked)" class="accent-purple-500">
                    <span>Control Line (C) Present</span>
                  </label>
                  <label class="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs cursor-pointer">
                    <input type="checkbox" [checked]="edlService.hivReactive()" (change)="edlService.hivReactive.set($any($event.target).checked)" class="accent-purple-500">
                    <span class="text-rose-400 font-bold">HIV-1/2 Line (T1)</span>
                  </label>
                  <label class="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs cursor-pointer">
                    <input type="checkbox" [checked]="edlService.syphilisReactive()" (change)="edlService.syphilisReactive.set($any($event.target).checked)" class="accent-purple-500">
                    <span class="text-amber-400 font-bold">Syphilis Line (T2)</span>
                  </label>
                  <label class="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs cursor-pointer">
                    <input type="checkbox" [checked]="edlService.isPregnant()" (change)="edlService.isPregnant.set($any($event.target).checked)" class="accent-pink-500">
                    <span class="text-pink-300 font-bold">Pregnant Patient (ANC)</span>
                  </label>
                </div>
              </div>

              <!-- Result Card -->
              <div class="p-4 rounded-2xl border"
                   [ngClass]="{
                     'bg-rose-950/40 border-rose-600/60 text-rose-200': edlService.hivSyphilisAssessment().acuityTier === 'RED',
                     'bg-amber-950/40 border-amber-600/60 text-amber-200': edlService.hivSyphilisAssessment().acuityTier === 'YELLOW',
                     'bg-emerald-950/40 border-emerald-600/60 text-emerald-200': edlService.hivSyphilisAssessment().acuityTier === 'GREEN'
                   }">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-mono font-bold uppercase tracking-wider">
                    Classification: {{ edlService.hivSyphilisAssessment().classification.replace(/_/g, ' ') }}
                  </span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase"
                        [class.bg-rose-900]="edlService.hivSyphilisAssessment().acuityTier === 'RED'"
                        [class.bg-amber-900]="edlService.hivSyphilisAssessment().acuityTier === 'YELLOW'"
                        [class.bg-emerald-900]="edlService.hivSyphilisAssessment().acuityTier === 'GREEN'">
                    {{ edlService.hivSyphilisAssessment().acuityTier }} TIER
                  </span>
                </div>
                <p class="text-xs leading-relaxed font-sans font-medium">
                  {{ edlService.hivSyphilisAssessment().clinicalAction }}
                </p>
                @if (edlService.hivSyphilisAssessment().mandatoryFormulary.length > 0) {
                  <div class="mt-3 pt-2 border-t border-white/10 space-y-1">
                    <span class="text-[10px] font-mono font-bold uppercase block opacity-80">Mandatory WHO Essential Medicines:</span>
                    <ul class="text-xs space-y-0.5 font-mono list-disc list-inside">
                      @for (drug of edlService.hivSyphilisAssessment().mandatoryFormulary; track drug) {
                        <li>{{ drug }}</li>
                      }
                    </ul>
                  </div>
                }
              </div>
            </div>
          }

          <!-- 2. Malaria Pf/Pv Panel -->
          @if (edlService.activeRdtType() === 'malaria_pf_pv') {
            <div class="space-y-4">
              <div class="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <span class="text-xs font-bold text-zinc-200 uppercase tracking-wider block">
                  Malaria Dipstick Antigen Readout
                </span>

                <div class="flex flex-wrap gap-3">
                  <label class="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs cursor-pointer">
                    <input type="checkbox" [checked]="edlService.malariaControl()" (change)="edlService.malariaControl.set($any($event.target).checked)" class="accent-purple-500">
                    <span>Control Line (C)</span>
                  </label>
                  <label class="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs cursor-pointer">
                    <input type="checkbox" [checked]="edlService.malariaPfHrp2()" (change)="edlService.malariaPfHrp2.set($any($event.target).checked)" class="accent-rose-500">
                    <span class="text-rose-400 font-bold">P. falciparum HRP2 (Pf)</span>
                  </label>
                  <label class="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs cursor-pointer">
                    <input type="checkbox" [checked]="edlService.malariaPvLdh()" (change)="edlService.malariaPvLdh.set($any($event.target).checked)" class="accent-amber-500">
                    <span class="text-amber-400 font-bold">P. vivax pLDH (Pv)</span>
                  </label>
                  <label class="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs cursor-pointer">
                    <input type="checkbox" [checked]="edlService.malariaDangerSigns()" (change)="edlService.malariaDangerSigns.set($any($event.target).checked)" class="accent-red-500">
                    <span class="text-red-400 font-bold">Danger Signs (Vomiting/Coma)</span>
                  </label>
                </div>
              </div>

              <!-- Result Card -->
              <div class="p-4 rounded-2xl border"
                   [ngClass]="{
                     'bg-rose-950/40 border-rose-600/60 text-rose-200': edlService.malariaAssessment().acuityTier === 'RED',
                     'bg-amber-950/40 border-amber-600/60 text-amber-200': edlService.malariaAssessment().acuityTier === 'YELLOW',
                     'bg-emerald-950/40 border-emerald-600/60 text-emerald-200': edlService.malariaAssessment().acuityTier === 'GREEN'
                   }">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-mono font-bold uppercase tracking-wider">
                    Species: {{ edlService.malariaAssessment().speciesClassification.replace(/_/g, ' ') }}
                  </span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase"
                        [class.bg-rose-900]="edlService.malariaAssessment().acuityTier === 'RED'"
                        [class.bg-amber-900]="edlService.malariaAssessment().acuityTier === 'YELLOW'"
                        [class.bg-emerald-900]="edlService.malariaAssessment().acuityTier === 'GREEN'">
                    {{ edlService.malariaAssessment().acuityTier }} TIER
                  </span>
                </div>
                <p class="text-xs leading-relaxed font-sans font-medium">
                  {{ edlService.malariaAssessment().clinicalAction }}
                </p>
                <div class="mt-3 pt-2 border-t border-white/10 text-xs font-mono">
                  <span class="text-zinc-400 block text-[10px] uppercase font-bold">First-Line Protocol:</span>
                  <span class="text-zinc-100 font-bold">{{ edlService.malariaAssessment().firstLineTherapy }}</span>
                </div>
              </div>
            </div>
          }

          <!-- 3. Dengue NS1 & Ab Panel -->
          @if (edlService.activeRdtType() === 'dengue_ns1_ab') {
            <div class="space-y-4">
              <div class="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <span class="text-xs font-bold text-zinc-200 uppercase tracking-wider block">
                  Dengue Antigen &amp; Antibody Rapid Cassette
                </span>

                <div class="flex flex-wrap gap-3">
                  <label class="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs cursor-pointer">
                    <input type="checkbox" [checked]="edlService.dengueControl()" (change)="edlService.dengueControl.set($any($event.target).checked)" class="accent-purple-500">
                    <span>Control (C)</span>
                  </label>
                  <label class="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs cursor-pointer">
                    <input type="checkbox" [checked]="edlService.dengueNs1()" (change)="edlService.dengueNs1.set($any($event.target).checked)" class="accent-teal-500">
                    <span class="text-teal-400 font-bold">NS1 Ag (Days 1–5)</span>
                  </label>
                  <label class="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs cursor-pointer">
                    <input type="checkbox" [checked]="edlService.dengueIgm()" (change)="edlService.dengueIgm.set($any($event.target).checked)" class="accent-cyan-500">
                    <span class="text-cyan-400 font-bold">IgM (Recent)</span>
                  </label>
                  <label class="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs cursor-pointer">
                    <input type="checkbox" [checked]="edlService.dengueIgg()" (change)="edlService.dengueIgg.set($any($event.target).checked)" class="accent-amber-500">
                    <span class="text-amber-400 font-bold">IgG (Secondary)</span>
                  </label>
                  <label class="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs cursor-pointer">
                    <input type="checkbox" [checked]="edlService.dengueWarningSigns()" (change)="edlService.dengueWarningSigns.set($any($event.target).checked)" class="accent-rose-500">
                    <span class="text-rose-400 font-bold">WHO Warning Signs</span>
                  </label>
                </div>
              </div>

              <!-- Result Card -->
              <div class="p-4 rounded-2xl border"
                   [ngClass]="{
                     'bg-rose-950/40 border-rose-600/60 text-rose-200': edlService.dengueAssessment().acuityTier === 'RED',
                     'bg-amber-950/40 border-amber-600/60 text-amber-200': edlService.dengueAssessment().acuityTier === 'YELLOW',
                     'bg-emerald-950/40 border-emerald-600/60 text-emerald-200': edlService.dengueAssessment().acuityTier === 'GREEN'
                   }">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-mono font-bold uppercase tracking-wider">
                    Stage: {{ edlService.dengueAssessment().infectionStage.replace(/_/g, ' ') }}
                  </span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase"
                        [class.bg-rose-900]="edlService.dengueAssessment().acuityTier === 'RED'"
                        [class.bg-amber-900]="edlService.dengueAssessment().acuityTier === 'YELLOW'"
                        [class.bg-emerald-900]="edlService.dengueAssessment().acuityTier === 'GREEN'">
                    {{ edlService.dengueAssessment().acuityTier }} TIER
                  </span>
                </div>
                <p class="text-xs leading-relaxed font-sans font-medium">
                  {{ edlService.dengueAssessment().clinicalAction }}
                </p>
                <div class="mt-3 pt-2 border-t border-rose-800/40 text-xs font-mono text-rose-300">
                  <span class="text-rose-400 block text-[10px] uppercase font-bold">⛔ STRICT CONTRAINDICATION:</span>
                  <span>DO NOT ADMINISTER: {{ edlService.dengueAssessment().contraindicatedMedications.join(', ') }} (Fatal bleeding hazard). Paracetamol only.</span>
                </div>
              </div>
            </div>
          }

          <!-- 4. Sickle Cell Disease Panel -->
          @if (edlService.activeRdtType() === 'sickle_cell_rdt') {
            <div class="space-y-4">
              <div class="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <span class="text-xs font-bold text-zinc-200 uppercase tracking-wider block">
                  Sickle Cell Lateral Flow Banding
                </span>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button type="button"
                          (click)="edlService.sicklePhenotype.set('HB_AA_NORMAL')"
                          [class.bg-emerald-950]="edlService.sicklePhenotype() === 'HB_AA_NORMAL'"
                          [class.border-emerald-500]="edlService.sicklePhenotype() === 'HB_AA_NORMAL'"
                          class="p-2 rounded-xl border border-zinc-800 text-left cursor-pointer">
                    <span class="font-bold block">HbAA Normal</span>
                    <span class="text-[10px] text-zinc-400">Normal adult</span>
                  </button>

                  <button type="button"
                          (click)="edlService.sicklePhenotype.set('HB_AS_TRAIT')"
                          [class.bg-amber-950]="edlService.sicklePhenotype() === 'HB_AS_TRAIT'"
                          [class.border-amber-500]="edlService.sicklePhenotype() === 'HB_AS_TRAIT'"
                          class="p-2 rounded-xl border border-zinc-800 text-left cursor-pointer">
                    <span class="font-bold block">HbAS Trait</span>
                    <span class="text-[10px] text-zinc-400">Carrier (Counsel)</span>
                  </button>

                  <button type="button"
                          (click)="edlService.sicklePhenotype.set('HB_SS_DISEASE')"
                          [class.bg-rose-950]="edlService.sicklePhenotype() === 'HB_SS_DISEASE'"
                          [class.border-rose-500]="edlService.sicklePhenotype() === 'HB_SS_DISEASE'"
                          class="p-2 rounded-xl border border-zinc-800 text-left cursor-pointer">
                    <span class="font-bold block">HbSS Disease</span>
                    <span class="text-[10px] text-zinc-400">Sickle Cell Anemia</span>
                  </button>

                  <button type="button"
                          (click)="edlService.sicklePhenotype.set('HB_SC_OR_THAL')"
                          [class.bg-rose-950]="edlService.sicklePhenotype() === 'HB_SC_OR_THAL'"
                          [class.border-rose-500]="edlService.sicklePhenotype() === 'HB_SC_OR_THAL'"
                          class="p-2 rounded-xl border border-zinc-800 text-left cursor-pointer">
                    <span class="font-bold block">HbSC / S-Thal</span>
                    <span class="text-[10px] text-zinc-400">Compound hetero</span>
                  </button>
                </div>
              </div>

              <!-- Result Card -->
              <div class="p-4 rounded-2xl border"
                   [ngClass]="{
                     'bg-rose-950/40 border-rose-600/60 text-rose-200': edlService.sickleCellAssessment().acuityTier === 'RED',
                     'bg-amber-950/40 border-amber-600/60 text-amber-200': edlService.sickleCellAssessment().acuityTier === 'YELLOW',
                     'bg-emerald-950/40 border-emerald-600/60 text-emerald-200': edlService.sickleCellAssessment().acuityTier === 'GREEN'
                   }">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-mono font-bold uppercase tracking-wider">
                    Phenotype: {{ edlService.sickleCellAssessment().phenotypeResult.replace(/_/g, ' ') }}
                  </span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase"
                        [class.bg-rose-900]="edlService.sickleCellAssessment().acuityTier === 'RED'"
                        [class.bg-amber-900]="edlService.sickleCellAssessment().acuityTier === 'YELLOW'"
                        [class.bg-emerald-900]="edlService.sickleCellAssessment().acuityTier === 'GREEN'">
                    {{ edlService.sickleCellAssessment().acuityTier }} TIER
                  </span>
                </div>
                <p class="text-xs leading-relaxed font-sans font-medium">
                  {{ edlService.sickleCellAssessment().clinicalAction }}
                </p>
                @if (edlService.sickleCellAssessment().preventiveBundle.length > 0) {
                  <div class="mt-3 pt-2 border-t border-white/10 space-y-1">
                    <span class="text-[10px] font-mono font-bold uppercase block opacity-80">WHO Preventive Stepped-Care Bundle:</span>
                    <ul class="text-xs space-y-0.5 font-mono list-disc list-inside">
                      @for (item of edlService.sickleCellAssessment().preventiveBundle; track item) {
                        <li>{{ item }}</li>
                      }
                    </ul>
                  </div>
                }
              </div>
            </div>
          }
        </section>
      }

      <!-- MODULE 7: Cold-Chain & Solar Microgrid Watchdog -->
      @if (activeTab() === 'cold_chain') {
        <section class="mt-4 p-4 sm:p-6 bg-zinc-900/60 rounded-3xl border border-zinc-800 space-y-6 animate-in fade-in duration-200">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div>
              <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>❄️</span> WHO PQS Cold-Chain &amp; Solar Microgrid Watchdog
              </h3>
              <p class="text-xs text-zinc-400">
                Continuous vaccine storage temperature monitoring (+2°C to +8°C) and solar autonomy projection
              </p>
            </div>
            <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border font-bold"
                  [ngClass]="{
                    'bg-rose-950 text-rose-300 border-rose-800': edlService.coldChainTelemetry().statusTier === 'FREEZE_HAZARD' || edlService.coldChainTelemetry().statusTier === 'HEAT_EXCURSION' || edlService.coldChainTelemetry().statusTier === 'BATTERY_CRITICAL',
                    'bg-emerald-950 text-emerald-300 border-emerald-800': edlService.coldChainTelemetry().statusTier === 'OPTIMAL',
                    'bg-amber-950 text-amber-300 border-amber-800': edlService.coldChainTelemetry().statusTier === 'COLD_EXCURSION'
                  }">
              {{ edlService.coldChainTelemetry().statusLabel }}
            </span>
          </div>

          <!-- Two Column Grid: Fridge Telemetry & Solar Battery -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <!-- Fridge Temperature Controls & VVM -->
            <div class="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-4">
              <span class="text-xs font-bold text-zinc-200 uppercase tracking-wider block">
                Vaccine Refrigerator Sensor Telemetry
              </span>

              <!-- Temperature Slider -->
              <div>
                <div class="flex justify-between items-center text-xs mb-1.5">
                  <span class="text-zinc-400">Current Storage Temp:</span>
                  <span class="font-bold font-mono text-base tabular-nums"
                        [class.text-rose-400]="edlService.coldChainInputs().fridgeTempC < 0 || edlService.coldChainInputs().fridgeTempC > 8"
                        [class.text-emerald-400]="edlService.coldChainInputs().fridgeTempC >= 2 && edlService.coldChainInputs().fridgeTempC <= 8"
                        [class.text-amber-400]="edlService.coldChainInputs().fridgeTempC >= 0 && edlService.coldChainInputs().fridgeTempC < 2">
                    {{ edlService.coldChainInputs().fridgeTempC.toFixed(1) }} °C
                  </span>
                </div>
                <input type="range" min="-5" max="15" step="0.5"
                       [ngModel]="edlService.coldChainInputs().fridgeTempC"
                       (ngModelChange)="edlService.updateColdChainTelemetry({ fridgeTempC: $event })"
                       class="w-full accent-cyan-500 cursor-pointer h-2 bg-zinc-800 rounded-lg">
                <div class="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                  <span class="text-rose-400">&lt;0°C Freeze</span>
                  <span class="text-emerald-400 font-bold">+2°C to +8°C Optimal</span>
                  <span class="text-rose-400">&gt;8°C Heat</span>
                </div>
              </div>

              <!-- VVM Stage Selector -->
              <div class="space-y-1.5">
                <span class="text-xs text-zinc-400 font-bold block">Vaccine Vial Monitor (VVM) Indicator:</span>
                <div class="grid grid-cols-4 gap-1.5 text-xs font-mono">
                  @for (s of vvmStages; track s) {
                    <button type="button"
                            (click)="setVvmStage(s)"
                            [class.bg-emerald-950]="s <= 2 && edlService.coldChainInputs().vvmStage === s"
                            [class.border-emerald-500]="s <= 2 && edlService.coldChainInputs().vvmStage === s"
                            [class.bg-rose-950]="s >= 3 && edlService.coldChainInputs().vvmStage === s"
                            [class.border-rose-500]="s >= 3 && edlService.coldChainInputs().vvmStage === s"
                            class="p-2 rounded-xl border border-zinc-800 text-center cursor-pointer">
                      <span class="font-bold block">Stage {{ s }}</span>
                      <span class="text-[9px]" [class.text-emerald-400]="s <= 2" [class.text-rose-400]="s >= 3">
                        {{ s <= 2 ? 'USE' : 'DISCARD' }}
                      </span>
                    </button>
                  }
                </div>
              </div>
            </div>

            <!-- Solar PV Microgrid & Battery Runtime -->
            <div class="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-4">
              <span class="text-xs font-bold text-zinc-200 uppercase tracking-wider block">
                Solar Microgrid &amp; Battery Autonomy
              </span>

              <!-- Battery SoC Slider -->
              <div>
                <div class="flex justify-between items-center text-xs mb-1.5">
                  <span class="text-zinc-400">Battery State of Charge (SoC):</span>
                  <span class="font-bold font-mono text-base tabular-nums"
                        [class.text-rose-400]="edlService.coldChainInputs().batterySocPct < 20"
                        [class.text-emerald-400]="edlService.coldChainInputs().batterySocPct >= 50"
                        [class.text-amber-400]="edlService.coldChainInputs().batterySocPct >= 20 && edlService.coldChainInputs().batterySocPct < 50">
                    {{ edlService.coldChainInputs().batterySocPct }}% ({{ edlService.coldChainInputs().batteryVoltageV }}V)
                  </span>
                </div>
                <input type="range" min="10" max="100" step="5"
                       [ngModel]="edlService.coldChainInputs().batterySocPct"
                       (ngModelChange)="edlService.updateColdChainTelemetry({ batterySocPct: $event })"
                       class="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-800 rounded-lg">
              </div>

              <!-- Solar Irradiance Slider -->
              <div>
                <div class="flex justify-between items-center text-xs mb-1.5">
                  <span class="text-zinc-400">Solar Irradiance:</span>
                  <span class="font-bold font-mono text-xs text-amber-400 tabular-nums">
                    {{ edlService.coldChainInputs().solarWattsM2 }} W/m²
                  </span>
                </div>
                <input type="range" min="0" max="1000" step="50"
                       [ngModel]="edlService.coldChainInputs().solarWattsM2"
                       (ngModelChange)="edlService.updateColdChainTelemetry({ solarWattsM2: $event })"
                       class="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-800 rounded-lg">
              </div>

              <!-- Projected Autonomy Display -->
              <div class="p-3 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between">
                <span class="text-xs text-zinc-300">Projected Refrigeration Autonomy:</span>
                <span class="text-base font-black font-mono text-teal-300 tabular-nums">
                  {{ edlService.coldChainTelemetry().projectedAutonomyHours }} Hours
                </span>
              </div>
            </div>

          </div>

          <!-- Action Guidance Alert Banner -->
          <div class="p-4 rounded-2xl border text-xs leading-relaxed font-sans"
               [ngClass]="{
                 'bg-rose-950/60 border-rose-600/70 text-rose-200': edlService.coldChainTelemetry().statusTier === 'FREEZE_HAZARD' || edlService.coldChainTelemetry().statusTier === 'HEAT_EXCURSION' || edlService.coldChainTelemetry().statusTier === 'BATTERY_CRITICAL',
                 'bg-emerald-950/60 border-emerald-600/70 text-emerald-200': edlService.coldChainTelemetry().statusTier === 'OPTIMAL',
                 'bg-amber-950/60 border-amber-600/70 text-amber-200': edlService.coldChainTelemetry().statusTier === 'COLD_EXCURSION'
               }">
            <div class="flex items-start gap-2">
              <span class="text-base">{{ edlService.coldChainTelemetry().statusTier === 'OPTIMAL' ? '🛡️' : '⚠️' }}</span>
              <div>
                <strong class="block mb-0.5 uppercase tracking-wide font-mono text-[11px]">
                  {{ edlService.coldChainTelemetry().statusLabel }}
                </strong>
                <span>{{ edlService.coldChainTelemetry().actionGuidance }}</span>
              </div>
            </div>
          </div>
        </section>
      }


      <!-- MODULE 8: Local Wi-Fi Mesh Synchronization & P2P Triage Roster -->
      @if (activeTab() === 'austere_mesh_sync') {
        <section class="mt-4 p-4 sm:p-6 bg-zinc-900/60 rounded-3xl border border-zinc-800 space-y-6 animate-in fade-in duration-200">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div>
              <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>📡</span> Local Wi-Fi Mesh Synchronization &amp; P2P Triage Roster
              </h3>
              <p class="text-xs text-zinc-400">
                Zero-internet offline synchronization across austere clinic tablets, cold-chain depots &amp; triage tents
              </p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Mesh Connected: {{ meshSync.meshSsid() }}
              </span>
              <span class="text-[10px] font-mono text-zinc-400">
                Ping: {{ meshSync.meshLatencyMs() }}ms
              </span>
            </div>
          </div>

          <!-- Active Emergency Cold-Chain Broadcast Alarm (If Any) -->
          @if (meshSync.activeEmergencyAlertCount() > 0) {
            <div class="space-y-2">
              @for (alert of meshSync.activeColdChainAlerts(); track alert.alertId) {
                @if (!alert.acknowledged) {
                  <div class="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-600 text-rose-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse shadow-lg">
                    <div class="flex items-center gap-3">
                      <span class="text-2xl">🚨</span>
                      <div>
                        <div class="flex items-center gap-2">
                          <strong class="text-xs uppercase font-mono font-bold tracking-wider">
                            CRITICAL COLD-CHAIN MESH ALARM: {{ alert.fridgeUnit }} ({{ alert.temperatureCelsius }}°C)
                          </strong>
                          <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-900 border border-rose-700">
                            {{ alert.statusTier }}
                          </span>
                        </div>
                        <p class="text-xs text-rose-200 mt-0.5">
                          {{ alert.alertMessage }}
                        </p>
                      </div>
                    </div>
                    <button type="button"
                            (click)="meshSync.acknowledgeColdChainAlert(alert.alertId)"
                            class="px-3 py-1.5 rounded-xl bg-white text-rose-950 hover:bg-zinc-200 font-mono text-xs font-bold transition shrink-0 cursor-pointer shadow-sm">
                      ✓ Acknowledge Alert
                    </button>
                  </div>
                }
              }
            </div>
          }

          <!-- Node Identification & Network Statistics -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
              <span class="text-[10px] uppercase font-mono font-bold text-zinc-400 block">Local Node Station</span>
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-zinc-100">{{ meshSync.localNode().nodeName }}</span>
                <span class="text-[10px] font-mono text-emerald-400 font-bold">ONLINE</span>
              </div>
              <div class="text-[11px] font-mono text-zinc-400">
                IP: {{ meshSync.localNode().ipAddress }} | Batt: {{ meshSync.localNode().batteryPct }}%
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
              <span class="text-[10px] uppercase font-mono font-bold text-zinc-400 block">Mesh Peers Discovered</span>
              <div class="flex items-center justify-between">
                <span class="text-base font-black font-mono text-indigo-300">{{ meshSync.activePeerCount() }} Active Nodes</span>
                <button type="button"
                        (click)="meshSync.sendHeartbeat()"
                        class="text-[10px] font-mono text-teal-400 hover:text-teal-300 underline cursor-pointer">
                  Sync Ping
                </button>
              </div>
              <div class="text-[11px] font-mono text-zinc-400">
                TX: {{ meshSync.packetsTransmittedCount() }} pkts | RX: {{ meshSync.packetsReceivedCount() }} pkts
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
              <span class="text-[10px] uppercase font-mono font-bold text-zinc-400 block">Emergency Test Broadcast</span>
              <button type="button"
                      (click)="meshSync.broadcastColdChainAlert({
                        fridgeUnit: 'Vaccine Solar Depot Refrig #1',
                        temperatureCelsius: -1.4,
                        statusTier: 'FREEZE_HAZARD',
                        alertMessage: 'Freeze damage risk: Refrigerator sub-zero temp detected! Perform WHO Shake Test.'
                      })"
                      class="w-full py-1.5 px-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-700/80 text-rose-300 font-mono text-[11px] font-bold transition cursor-pointer">
                ⚠️ Trigger Test Cold-Chain Alarm
              </button>
            </div>
          </div>

          <!-- Connected Mesh Peers List -->
          <div class="space-y-2">
            <span class="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Active Mesh Peer Nodes (Local Area Network)
            </span>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              @for (peer of meshSync.peerNodes(); track peer.nodeId) {
                <div class="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                  <div class="space-y-0.5">
                    <span class="text-xs font-bold text-zinc-200 block truncate">{{ peer.nodeName }}</span>
                    <span class="text-[10px] font-mono text-zinc-400 block">{{ peer.ipAddress }} • {{ peer.role }}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] font-mono text-emerald-400 font-bold block">{{ peer.signalStrengthDbm }} dBm</span>
                    <span class="text-[9px] font-mono text-zinc-500">Batt: {{ peer.batteryPct }}%</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Synchronized Patient Triage Roster -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Synchronized Clinic Triage Queue ({{ meshSync.waitingTriageCount() }} Waiting)
              </span>
              <button type="button"
                      (click)="meshSync.enqueueTriagePatient({
                        patientToken: 'Patient #' + (meshSync.triageQueue().length + 101) + ' (Child, ' + childWeightKg() + 'kg)',
                        ageMonths: 18,
                        weightKg: childWeightKg(),
                        gender: 'FEMALE',
                        muacMm: muacMm(),
                        acuityTier: muacTriage().statusTier === 'SEVERE_ACUTE_MALNUTRITION' ? 'RED' : 'YELLOW',
                        chiefComplaint: 'Rapid triage assessment from field unit',
                        clinicalCategory: muacTriage().statusLabel
                      })"
                      class="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs">
                <span>➕</span> Enqueue Current Patient
              </button>
            </div>

            <div class="space-y-2">
              @for (tkt of meshSync.triageQueue(); track tkt.ticketId) {
                <div class="p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                     [ngClass]="{
                       'bg-rose-950/30 border-rose-600/50': tkt.acuityTier === 'RED',
                       'bg-amber-950/30 border-amber-600/50': tkt.acuityTier === 'YELLOW',
                       'bg-zinc-950/60 border-zinc-800': tkt.acuityTier === 'GREEN'
                     }">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold text-zinc-100 font-mono">{{ tkt.patientToken }}</span>
                      <span class="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold"
                            [class.bg-rose-900]="tkt.acuityTier === 'RED'"
                            [class.bg-amber-900]="tkt.acuityTier === 'YELLOW'"
                            [class.bg-emerald-900]="tkt.acuityTier === 'GREEN'">
                        {{ tkt.acuityTier }} ACUITY
                      </span>
                      <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-bold uppercase">
                        {{ tkt.status.replace('_', ' ') }}
                      </span>
                    </div>
                    <p class="text-xs text-zinc-300">
                      <strong>{{ tkt.clinicalCategory }}:</strong> {{ tkt.chiefComplaint }}
                    </p>
                    @if (tkt.assignedClinician) {
                      <span class="text-[10px] font-mono text-teal-300 block">
                        Assigned Clinician: {{ tkt.assignedClinician }}
                      </span>
                    }
                  </div>

                  <!-- Quick Status Transition Buttons -->
                  <div class="flex items-center gap-1.5 shrink-0 font-mono text-[10px]">
                    @if (tkt.status === 'WAITING') {
                      <button type="button"
                              (click)="meshSync.updateTriageStatus(tkt.ticketId, 'IN_CONSULT', 'Field Clinician Station')"
                              class="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold transition cursor-pointer">
                        Start Consult
                      </button>
                    }
                    @if (tkt.status === 'IN_CONSULT') {
                      <button type="button"
                              (click)="meshSync.updateTriageStatus(tkt.ticketId, 'DISCHARGED')"
                              class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition cursor-pointer">
                        Discharge
                      </button>
                      <button type="button"
                              (click)="meshSync.updateTriageStatus(tkt.ticketId, 'REFERRED', 'District Hospital Transfer')"
                              class="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition cursor-pointer">
                        Refer STAT
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </section>
      }

      <!-- MODULE 9: Expand Pediatric Dosing Engine (WHO EDL-4 & IMCI Formulary) -->
      @if (activeTab() === 'pediatric_dosing') {
        <section class="mt-4 p-4 sm:p-6 bg-zinc-900/60 rounded-3xl border border-zinc-800 space-y-6 animate-in fade-in duration-200">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div>
              <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>⚖️</span> WHO Model List of Essential Medicines for Children (EMLc &amp; IMCI)
              </h3>
              <p class="text-xs text-zinc-400">
                Weight- and age-banded calculation widgets: Artemether-Lumefantrine, Reduced Osmolarity ORS &amp; Zinc Dispersible
              </p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/60 font-bold">
                WHO EMLc 9th Ed.
              </span>
              <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60 font-bold">
                ISMP Safety Compliant
              </span>
            </div>
          </div>

          <!-- Patient Weight & Age Calibration HUD -->
          <div class="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-4">
            <span class="text-xs font-bold text-zinc-200 uppercase tracking-wider block">
              Patient Anthropometric Calibration
            </span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Child Weight Slider -->
              <div class="space-y-1.5">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-zinc-400">Child Weight (kg):</span>
                  <span class="font-bold font-mono text-sm text-teal-400 tabular-nums">
                    {{ pediatricDosing.childWeightKg() }} kg
                  </span>
                </div>
                <input type="range" min="3.0" max="40.0" step="0.5"
                       [ngModel]="pediatricDosing.childWeightKg()"
                       (ngModelChange)="pediatricDosing.setWeightKg($event)"
                       class="w-full accent-teal-500 cursor-pointer h-2 bg-zinc-800 rounded-lg">
                <div class="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>3 kg (Infant)</span>
                  <span>10 kg (Toddler)</span>
                  <span>25 kg (Child)</span>
                  <span>40 kg (Adolescent)</span>
                </div>
              </div>

              <!-- Child Age Slider -->
              <div class="space-y-1.5">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-zinc-400">Child Age (Months):</span>
                  <span class="font-bold font-mono text-sm text-amber-400 tabular-nums">
                    {{ pediatricDosing.childAgeMonths() }} Months ({{ (pediatricDosing.childAgeMonths() / 12).toFixed(1) }}y)
                  </span>
                </div>
                <input type="range" min="1" max="60" step="1"
                       [ngModel]="pediatricDosing.childAgeMonths()"
                       (ngModelChange)="pediatricDosing.setAgeMonths($event)"
                       class="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-800 rounded-lg">
                <div class="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>1m (Neonate)</span>
                  <span>6m (Weaning)</span>
                  <span>24m (2 years)</span>
                  <span>60m (5 years)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Medication Selector Tabs -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <button type="button"
                    (click)="pediatricDosing.setSelectedMedication('artemether_lumefantrine')"
                    [class.bg-teal-600]="pediatricDosing.selectedMedication() === 'artemether_lumefantrine'"
                    [class.text-white]="pediatricDosing.selectedMedication() === 'artemether_lumefantrine'"
                    [class.border-teal-400]="pediatricDosing.selectedMedication() === 'artemether_lumefantrine'"
                    class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-left transition hover:border-zinc-700 cursor-pointer">
              <span class="block text-sm mb-1">🦟</span>
              <span class="font-bold block truncate">Coartem (ACT)</span>
              <span class="text-[10px] text-zinc-400 block">Artemether/Lumefantrine</span>
            </button>

            <button type="button"
                    (click)="pediatricDosing.setSelectedMedication('ors_rehydration')"
                    [class.bg-teal-600]="pediatricDosing.selectedMedication() === 'ors_rehydration'"
                    [class.text-white]="pediatricDosing.selectedMedication() === 'ors_rehydration'"
                    [class.border-teal-400]="pediatricDosing.selectedMedication() === 'ors_rehydration'"
                    class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-left transition hover:border-zinc-700 cursor-pointer">
              <span class="block text-sm mb-1">💧</span>
              <span class="font-bold block truncate">WHO ORS (245)</span>
              <span class="text-[10px] text-zinc-400 block">Plans A, B &amp; C Resus</span>
            </button>

            <button type="button"
                    (click)="pediatricDosing.setSelectedMedication('zinc_sulfate')"
                    [class.bg-teal-600]="pediatricDosing.selectedMedication() === 'zinc_sulfate'"
                    [class.text-white]="pediatricDosing.selectedMedication() === 'zinc_sulfate'"
                    [class.border-teal-400]="pediatricDosing.selectedMedication() === 'zinc_sulfate'"
                    class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-left transition hover:border-zinc-700 cursor-pointer">
              <span class="block text-sm mb-1">🛡️</span>
              <span class="font-bold block truncate">Zinc Dispersible</span>
              <span class="text-[10px] text-zinc-400 block">14-Day Diarrhea Bundle</span>
            </button>

            <button type="button"
                    (click)="pediatricDosing.setSelectedMedication('amoxicillin_dispersible')"
                    [class.bg-teal-600]="pediatricDosing.selectedMedication() === 'amoxicillin_dispersible'"
                    [class.text-white]="pediatricDosing.selectedMedication() === 'amoxicillin_dispersible'"
                    [class.border-teal-400]="pediatricDosing.selectedMedication() === 'amoxicillin_dispersible'"
                    class="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-left transition hover:border-zinc-700 cursor-pointer">
              <span class="block text-sm mb-1">🫁</span>
              <span class="font-bold block truncate">Amox Dispersible</span>
              <span class="text-[10px] text-zinc-400 block">IMCI Fast-Breathing</span>
            </button>
          </div>

          <!-- Active Medication Dosing Card Display -->
          <!-- 1. Artemether + Lumefantrine Card -->
          @if (pediatricDosing.selectedMedication() === 'artemether_lumefantrine') {
            <div class="p-5 rounded-2xl bg-zinc-950/90 border border-teal-600/50 space-y-4 shadow-lg">
              <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h4 class="text-sm font-bold text-teal-300 font-mono">
                    Artemether 20 mg + Lumefantrine 120 mg Dispersible Tablet
                  </h4>
                  <span class="text-xs text-zinc-400">
                    WHO Weight Band: <strong class="text-zinc-200">{{ pediatricDosing.artemetherLumefantrine().weightBandLabel }}</strong>
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <button type="button"
                          (click)="speakCurrentTriage()"
                          class="px-2.5 py-1 rounded-xl bg-teal-800/70 hover:bg-teal-700 text-teal-100 font-mono text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs">
                    <span>🔊</span>
                    <span>Listen</span>
                  </button>
                  <span class="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-xl bg-teal-900/80 text-teal-200 border border-teal-700">
                    {{ pediatricDosing.artemetherLumefantrine().tabletsPerDose }} Tab(s) per Dose
                  </span>
                </div>
              </div>

              @if (!pediatricDosing.artemetherLumefantrine().isEligible) {
                <div class="p-3.5 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs font-mono">
                  {{ pediatricDosing.artemetherLumefantrine().specialWarning }}
                </div>
              } @else {
                <!-- 6-Dose Schedule Visual Timeline -->
                <div class="space-y-2">
                  <span class="text-xs font-mono uppercase font-bold text-zinc-400 block">
                    WHO Standard 6-Dose Schedule Over 3 Days ({{ pediatricDosing.artemetherLumefantrine().totalTablets }} Tablets Total):
                  </span>
                  <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs font-mono">
                    @for (hr of pediatricDosing.artemetherLumefantrine().scheduleHours; track hr; let idx = $index) {
                      <div class="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                        <span class="block text-[10px] text-zinc-500 font-bold uppercase">Dose {{ idx + 1 }}</span>
                        <strong class="text-teal-300 block text-sm">Hour {{ hr }}</strong>
                        <span class="text-[10px] text-zinc-400 block">{{ pediatricDosing.artemetherLumefantrine().tabletsPerDose }} Tab</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Administration & Vomit Protocol -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
                  <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                    <strong class="text-teal-400 block font-mono text-[11px] uppercase">Preparation &amp; Dietary Guidance:</strong>
                    <p class="text-zinc-300">{{ pediatricDosing.artemetherLumefantrine().preparationAdvice }}</p>
                  </div>
                  <div class="p-3 rounded-xl bg-rose-950/40 border border-rose-700/60 space-y-1">
                    <strong class="text-rose-400 block font-mono text-[11px] uppercase">1-Hour Vomit Protocol:</strong>
                    <p class="text-rose-200">{{ pediatricDosing.artemetherLumefantrine().vomitRuleAdvice }}</p>
                  </div>
                </div>
              }
            </div>
          }

          <!-- 2. Oral Rehydration Salts (ORS) Card -->
          @if (pediatricDosing.selectedMedication() === 'ors_rehydration') {
            <div class="p-5 rounded-2xl bg-zinc-950/90 border border-teal-600/50 space-y-4 shadow-lg">
              <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <div>
                  <h4 class="text-sm font-bold text-teal-300 font-mono">
                    WHO Reduced Osmolarity ORS (Total Osmolarity: 245 mOsm/L)
                  </h4>
                  <span class="text-xs text-zinc-400">
                    Clinical Protocol: <strong class="text-zinc-200">{{ pediatricDosing.orsCalculation().planLabel }}</strong>
                  </span>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <button type="button"
                          (click)="speakCurrentTriage()"
                          class="px-2.5 py-1 rounded-xl bg-teal-800/70 hover:bg-teal-700 text-teal-100 font-mono text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs">
                    <span>🔊</span>
                    <span>Listen</span>
                  </button>
                  <!-- Plan Toggle Buttons -->
                  <div class="flex items-center gap-1.5 font-mono text-xs">
                  <button type="button"
                          (click)="pediatricDosing.setOrsPlan('PLAN_A')"
                          [class.bg-teal-600]="pediatricDosing.orsPlan() === 'PLAN_A'"
                          [class.text-white]="pediatricDosing.orsPlan() === 'PLAN_A'"
                          class="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 cursor-pointer">
                    Plan A (Home)
                  </button>
                  <button type="button"
                          (click)="pediatricDosing.setOrsPlan('PLAN_B')"
                          [class.bg-teal-600]="pediatricDosing.orsPlan() === 'PLAN_B'"
                          [class.text-white]="pediatricDosing.orsPlan() === 'PLAN_B'"
                          class="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 cursor-pointer">
                    Plan B (Facility)
                  </button>
                  <button type="button"
                          (click)="pediatricDosing.setOrsPlan('PLAN_C')"
                          [class.bg-rose-600]="pediatricDosing.orsPlan() === 'PLAN_C'"
                          [class.text-white]="pediatricDosing.orsPlan() === 'PLAN_C'"
                          class="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 cursor-pointer">
                    Plan C (STAT IV)
                  </button>
                  </div>
                </div>
              </div>

              <!-- Dosing Quantities based on Plan -->
              @if (pediatricDosing.orsPlan() === 'PLAN_B') {
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-center">
                  <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span class="text-[10px] text-zinc-500 uppercase font-bold block">4-Hour Target Volume</span>
                    <strong class="text-teal-300 text-lg">{{ pediatricDosing.orsCalculation().totalVolumeMl4Hours }} mL</strong>
                    <span class="text-[10px] text-zinc-400 block">(75 mL/kg formula)</span>
                  </div>
                  <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span class="text-[10px] text-zinc-500 uppercase font-bold block">Hourly Ingestion Rate</span>
                    <strong class="text-teal-300 text-lg">{{ pediatricDosing.orsCalculation().hourlyRateMlHour }} mL/hr</strong>
                    <span class="text-[10px] text-zinc-400 block">Sip slowly with spoon</span>
                  </div>
                  <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span class="text-[10px] text-zinc-500 uppercase font-bold block">Sachets to Prepare</span>
                    <strong class="text-teal-300 text-lg">{{ pediatricDosing.orsCalculation().sachetsToPrepare }} Sachet(s)</strong>
                    <span class="text-[10px] text-zinc-400 block">In 1.0L clean water</span>
                  </div>
                </div>
              } @else if (pediatricDosing.orsPlan() === 'PLAN_A') {
                <div class="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono space-y-1">
                  <span class="text-teal-400 font-bold block uppercase">Maintenance Fluid Volume (Home):</span>
                  <p class="text-zinc-200 text-sm font-bold">{{ pediatricDosing.orsCalculation().perStoolVolumeMl }}</p>
                  <p class="text-zinc-400">{{ pediatricDosing.orsCalculation().clinicalMonitoringRule }}</p>
                </div>
              } @else {
                <div class="p-4 rounded-xl bg-rose-950/60 border border-rose-600 text-xs font-mono space-y-2">
                  <span class="text-rose-300 font-bold block uppercase text-sm">🚨 Emergent IV Fluid Resuscitation:</span>
                  <div class="grid grid-cols-2 gap-2 text-center">
                    <div class="p-2 rounded bg-black/40 border border-rose-800">
                      <span class="text-[10px] text-zinc-400 block">Phase 1 (30 mL/kg)</span>
                      <strong class="text-rose-200">{{ pediatricDosing.orsCalculation().firstPhaseDuration }}</strong>
                    </div>
                    <div class="p-2 rounded bg-black/40 border border-rose-800">
                      <span class="text-[10px] text-zinc-400 block">Phase 2 (70 mL/kg)</span>
                      <strong class="text-rose-200">{{ pediatricDosing.orsCalculation().secondPhaseDuration }}</strong>
                    </div>
                  </div>
                  <p class="text-rose-200 text-[11px]">{{ pediatricDosing.orsCalculation().clinicalMonitoringRule }}</p>
                </div>
              }

              <!-- Mixing Monograph -->
              <div class="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs space-y-1">
                <strong class="text-teal-400 font-mono text-[11px] uppercase block">WHO Solution Monograph:</strong>
                <p class="text-zinc-300">{{ pediatricDosing.orsCalculation().mixingInstructions }}</p>
              </div>
            </div>
          }

          <!-- 3. Zinc Sulfate Dispersible Card -->
          @if (pediatricDosing.selectedMedication() === 'zinc_sulfate') {
            <div class="p-5 rounded-2xl bg-zinc-950/90 border border-teal-600/50 space-y-4 shadow-lg">
              <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h4 class="text-sm font-bold text-teal-300 font-mono">
                    Zinc Sulfate 20 mg Dispersible Pediatric Tablet
                  </h4>
                  <span class="text-xs text-zinc-400">
                    Age Group: <strong class="text-zinc-200">{{ pediatricDosing.childAgeMonths() < 6 ? 'Infant Under 6 Months' : 'Child 6 Months to 5 Years' }}</strong>
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <button type="button"
                          (click)="speakCurrentTriage()"
                          class="px-2.5 py-1 rounded-xl bg-teal-800/70 hover:bg-teal-700 text-teal-100 font-mono text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs">
                    <span>🔊</span>
                    <span>Listen</span>
                  </button>
                  <span class="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-xl bg-teal-900/80 text-teal-200 border border-teal-700">
                    {{ pediatricDosing.zincDose().dailyDoseMg }} mg Daily ({{ pediatricDosing.zincDose().tabletFractionLabel }})
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-center">
                <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span class="text-[10px] text-zinc-500 uppercase font-bold block">Daily Dosage</span>
                  <strong class="text-teal-300 text-lg">{{ pediatricDosing.zincDose().dailyDoseMg }} mg / Day</strong>
                  <span class="text-[10px] text-zinc-400 block">{{ pediatricDosing.zincDose().tabletFractionLabel }}</span>
                </div>
                <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span class="text-[10px] text-zinc-500 uppercase font-bold block">Course Duration</span>
                  <strong class="text-teal-300 text-lg">{{ pediatricDosing.zincDose().durationDays }} Full Days</strong>
                  <span class="text-[10px] text-zinc-400 block">Mandatory completion</span>
                </div>
                <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span class="text-[10px] text-zinc-500 uppercase font-bold block">Total Dispensed</span>
                  <strong class="text-teal-300 text-lg">{{ pediatricDosing.zincDose().totalTabletsDispensed }} Tablets</strong>
                  <span class="text-[10px] text-zinc-400 block">Blister pack</span>
                </div>
              </div>

              <div class="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs space-y-1">
                <strong class="text-teal-400 font-mono text-[11px] uppercase block">Rapid Dissolution Guide:</strong>
                <p class="text-zinc-300">{{ pediatricDosing.zincDose().administrationGuidance }}</p>
                <p class="text-zinc-400 text-[11px] mt-1">{{ pediatricDosing.zincDose().clinicalImpactSummary }}</p>
              </div>
            </div>
          }

          <!-- 4. Amoxicillin Dispersible Card -->
          @if (pediatricDosing.selectedMedication() === 'amoxicillin_dispersible') {
            <div class="p-5 rounded-2xl bg-zinc-950/90 border border-teal-600/50 space-y-4 shadow-lg">
              <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h4 class="text-sm font-bold text-teal-300 font-mono">
                    Amoxicillin 250 mg Dispersible Tablet (WHO IMCI Fast-Breathing)
                  </h4>
                  <span class="text-xs text-zinc-400">
                    Dosage: <strong class="text-zinc-200">{{ pediatricDosing.amoxicillinDose().doseMg }} mg Twice Daily (BID)</strong>
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <button type="button"
                          (click)="speakCurrentTriage()"
                          class="px-2.5 py-1 rounded-xl bg-teal-800/70 hover:bg-teal-700 text-teal-100 font-mono text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs">
                    <span>🔊</span>
                    <span>Listen</span>
                  </button>
                  <span class="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-xl bg-teal-900/80 text-teal-200 border border-teal-700">
                    {{ pediatricDosing.amoxicillinDose().tabletsPerDose }} Tablet(s) BID
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-center">
                <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span class="text-[10px] text-zinc-500 uppercase font-bold block">Dose Amount</span>
                  <strong class="text-teal-300 text-lg">{{ pediatricDosing.amoxicillinDose().doseMg }} mg</strong>
                  <span class="text-[10px] text-zinc-400 block">{{ pediatricDosing.amoxicillinDose().tabletsPerDose }} x 250mg tab</span>
                </div>
                <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span class="text-[10px] text-zinc-500 uppercase font-bold block">Course Duration</span>
                  <strong class="text-teal-300 text-lg">{{ pediatricDosing.amoxicillinDose().durationDays }} Days</strong>
                  <span class="text-[10px] text-zinc-400 block">Every 12 hours</span>
                </div>
                <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span class="text-[10px] text-zinc-500 uppercase font-bold block">Total Dispensed</span>
                  <strong class="text-teal-300 text-lg">{{ pediatricDosing.amoxicillinDose().totalTabletsDispensed }} Tablets</strong>
                  <span class="text-[10px] text-zinc-400 block">Complete full course</span>
                </div>
              </div>

              <div class="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs space-y-1">
                <strong class="text-teal-400 font-mono text-[11px] uppercase block">Administration &amp; Reassessment:</strong>
                <p class="text-zinc-300">{{ pediatricDosing.amoxicillinDose().administrationGuidance }}</p>
                <p class="text-zinc-400 text-[11px] mt-1">{{ pediatricDosing.amoxicillinDose().clinicalIndication }}</p>
              </div>
            </div>
          }
        </section>
      }

      <!-- Offline QR Handoff Modal Overlay -->
      @if (showQrModal()) {
        <div class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div class="bg-zinc-900 border border-zinc-700 p-6 rounded-3xl max-w-md w-full shadow-2xl text-center space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>📱</span> Peer-to-Peer Offline FHIR QR Handoff
              </h3>
              <button type="button" (click)="toggleQrModal()" class="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>
            <p class="text-xs text-zinc-400 text-left">
              Scan this code from any second field tablet or clinic smartphone. Zero cellular towers, satellite links, or WiFi required.
            </p>
            <div class="flex justify-center p-4 bg-white rounded-2xl mx-auto w-fit" #qrContainer></div>
            <div class="text-[10px] font-mono text-zinc-400 break-all bg-zinc-950 p-2 rounded-xl border border-zinc-800 max-h-24 overflow-y-auto text-left">
              {{ qrPayloadString() }}
            </div>
            <button type="button"
                    (click)="copyQrPayload()"
                    class="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-mono text-xs font-bold transition cursor-pointer">
              {{ qrCopied() ? '✓ Copied Encrypted Payload' : 'Copy Handoff Payload' }}
            </button>
          </div>
        </div>
      }

      <!-- Footer: MSF / WHO Global Health Notice -->
      <footer class="mt-6 pt-4 border-t border-zinc-800/80 flex flex-wrap justify-between items-center gap-2 text-[11px] text-zinc-500">
        <div>
          WHO Task-Shifting Standard | MSF Austere Guidelines | Zero-Egress Local Edge
        </div>
        <div class="font-mono text-zinc-400">
          Universal Free Healthcare • Sovereignty Health Suite • PocketGull
        </div>
      </footer>
    </div>
  `
})
export class CommunityHealthWorkerSuiteComponent {
  readonly emlService = inject(WhoEssentialMedicinesService);
  readonly voiceService = inject(FrontlineVernacularVoiceService);
  readonly edlService = inject(WhoEssentialDiagnosticsService, { optional: true }) ?? new WhoEssentialDiagnosticsService();
  readonly meshSync = inject(AustereMeshSyncService, { optional: true }) ?? new AustereMeshSyncService();
  readonly pediatricDosing = inject(PediatricDosingEngineService, { optional: true }) ?? new PediatricDosingEngineService();
  readonly close = output<void>();

  hasCloseButton = true;
  activeTab = signal<ChwTab>('malnutrition_muac');

  readonly vvmStages: readonly (1 | 2 | 3 | 4)[] = [1, 2, 3, 4] as const;

  setVvmStage(stage: 1 | 2 | 3 | 4): void {
    this.edlService.updateColdChainTelemetry({ vvmStage: stage });
  }

  // MUAC Signal States
  muacMm = signal<number>(128); // default normal
  edemaGrade = signal<'NONE' | 'GRADE_1' | 'GRADE_2' | 'GRADE_3'>('NONE');
  childWeightKg = signal<number>(9.0);

  // Pneumonia Signal States
  respiratoryAgeGroup = signal<'<2_MONTHS' | '2_11_MONTHS' | '12_59_MONTHS'>('2_11_MONTHS');
  respiratoryBpm = signal<number>(36);
  chestIndrawing = signal<boolean>(false);
  stridorAtRest = signal<boolean>(false);
  cyanosisOrHypoxia = signal<boolean>(false);
  tapTimestamps: number[] = [];

  // Dehydration Signal States
  generalState = signal<'ALERT' | 'IRRITABLE' | 'LETHARGIC'>('ALERT');
  eyesState = signal<'NORMAL' | 'SUNKEN'>('NORMAL');
  thirstState = signal<'NORMAL' | 'EAGER' | 'POOR'>('NORMAL');
  skinPinchState = signal<'IMMEDIATE' | 'SLOW' | 'VERY_SLOW'>('IMMEDIATE');

  // Danger Signs Flags
  dangerFlags = signal([
    { id: 'drink', label: 'Unable to drink or breastfeed', detail: 'Child is too weak to suckle or swallow liquids', checked: false },
    { id: 'vomit', label: 'Vomits everything', detail: 'Cannot retain any fluids or food', checked: false },
    { id: 'convulsion', label: 'Convulsions / Seizures', detail: 'Fit or spasm occurred during this acute episode', checked: false },
    { id: 'lethargic', label: 'Abnormally sleepy or unconscious', detail: 'Does not respond to voice or gentle shaking', checked: false },
    { id: 'stridor', label: 'Stridor at rest', detail: 'Harsh high-pitched crowing sound when calm', checked: false },
    { id: 'wasting', label: 'Severe visible wasting', detail: 'Extreme emaciation (baggy pants sign) or generalized edema', checked: false },
    { id: 'chest', label: 'Subcostal chest indrawing', detail: 'Lower chest wall moves inward during inspiration', checked: false }
  ]);

  // Formulary Search State
  formularySearch = signal<string>('');

  // QR Modal States
  showQrModal = signal<boolean>(false);
  qrCopied = signal<boolean>(false);
  qrContainer = viewChild<ElementRef<HTMLDivElement>>('qrContainer');

  constructor() {
    effect(() => {
      if (this.showQrModal() && this.qrContainer()) {
        this.renderQrCode();
      }
    });
  }

  // --- Computed Vernacular Audio Prompt for Current Triage Context ---
  readonly currentTriageVoicePrompt = computed<IVernacularPrompt>(() => {
    const tab = this.activeTab();
    let context: ITriageVoiceContext;

    if (tab === 'malnutrition_muac') {
      context = {
        module: 'malnutrition_muac',
        muacTier: this.muacTriage().statusTier,
        muacMm: this.muacMm(),
        rutfSachets: this.muacTriage().rutfSachetsPerDay,
        childWeightKg: this.childWeightKg()
      };
    } else if (tab === 'pneumonia_timer') {
      context = {
        module: 'pneumonia_timer',
        pneumoniaClassification: this.pneumoniaTriage().classification,
        respiratoryBpm: this.respiratoryBpm()
      };
    } else if (tab === 'dehydration_ors') {
      context = {
        module: 'dehydration_ors',
        dehydrationPlan: this.dehydrationTriage().plan,
        orsVolumeMl: this.dehydrationTriage().orsVolumeMl4Hours,
        childWeightKg: this.childWeightKg()
      };
    } else if (tab === 'danger_signs') {
      const activeDanger = this.dangerFlags().filter(f => f.checked).map(f => f.label);
      context = {
        module: 'danger_signs',
        hasDangerSigns: activeDanger.length > 0,
        dangerFlagNames: activeDanger
      };
    } else if (tab === 'pediatric_dosing') {
      const activeMed = this.pediatricDosing.selectedMedication();
      const al = this.pediatricDosing.artemetherLumefantrine();
      const ors = this.pediatricDosing.orsCalculation();
      const zinc = this.pediatricDosing.zincDose();
      const amox = this.pediatricDosing.amoxicillinDose();

      context = {
        module: 'pediatric_dosing',
        childWeightKg: this.pediatricDosing.childWeightKg(),
        childAgeMonths: this.pediatricDosing.childAgeMonths(),
        pediatricMedication: activeMed,
        tabletsPerDose: activeMed === 'artemether_lumefantrine' ? al.tabletsPerDose : amox.tabletsPerDose,
        totalTablets: activeMed === 'artemether_lumefantrine' ? al.totalTablets : (activeMed === 'zinc_sulfate' ? zinc.totalTabletsDispensed : amox.totalTabletsDispensed),
        doseMg: activeMed === 'amoxicillin_dispersible' ? amox.doseMg : (activeMed === 'zinc_sulfate' ? zinc.dailyDoseMg : undefined),
        dehydrationPlan: ors.plan,
        orsVolumeMl: ors.totalVolumeMl4Hours,
        isEligible: al.isEligible
      };
    } else {
      context = {
        module: 'malnutrition_muac',
        muacTier: this.muacTriage().statusTier,
        muacMm: this.muacMm(),
        rutfSachets: this.muacTriage().rutfSachetsPerDay,
        childWeightKg: this.childWeightKg()
      };
    }

    return this.voiceService.generateTriagePrompt(context);
  });

  // --- Computed Malnutrition Triage ---
  readonly muacTriage = computed<IMuacTriageResult>(() => {
    const mm = this.muacMm();
    const edema = this.edemaGrade();
    const weight = this.childWeightKg();

    if (edema !== 'NONE' || mm < 115) {
      // Severe Acute Malnutrition (SAM)
      let sachets = 2;
      if (weight >= 10) sachets = 4;
      else if (weight >= 7) sachets = 3;

      return {
        muacMm: mm,
        edemaGrade: edema,
        statusTier: 'SEVERE_ACUTE_MALNUTRITION',
        statusLabel: 'Severe Acute Malnutrition (SAM) - Red Alert',
        badgeClass: 'bg-rose-950 text-rose-300 border border-rose-600',
        rutfSachetsPerDay: sachets,
        rutfWeightGuide: `Target caloric intake: ~200 kcal/kg/day (${sachets} Plumpy'Nut sachets/day).`,
        clinicalAction: edema !== 'NONE'
          ? 'Kwashiorkor edema detected. Perform appetite test. If poor appetite or medical complications present, refer immediately for inpatient stabilization (F-75 milk).'
          : 'Enroll in Outpatient Therapeutic Program (OTP). Provide Ready-to-Use Therapeutic Food (RUTF) + 7-day course of oral Amoxicillin + Vitamin A.'
      };
    } else if (mm >= 115 && mm <= 124) {
      return {
        muacMm: mm,
        edemaGrade: edema,
        statusTier: 'MODERATE_ACUTE_MALNUTRITION',
        statusLabel: 'Moderate Acute Malnutrition (MAM) - Yellow Alert',
        badgeClass: 'bg-amber-950 text-amber-300 border border-amber-600',
        rutfSachetsPerDay: 1,
        rutfWeightGuide: 'Supplementary Feeding: 1 sachet RUSF or fortified blended food/day.',
        clinicalAction: 'Enroll in Supplementary Feeding Program (SFP). Administer single dose Albendazole deworming + Vitamin A capsule. Re-assess in 14 days.'
      };
    } else {
      return {
        muacMm: mm,
        edemaGrade: edema,
        statusTier: 'WELL_NOURISHED',
        statusLabel: 'Well-Nourished (&ge;125 mm) - Green Baseline',
        badgeClass: 'bg-emerald-950 text-emerald-300 border border-emerald-600',
        rutfSachetsPerDay: 0,
        rutfWeightGuide: 'No therapeutic food needed.',
        clinicalAction: 'Routine infant and young child feeding (IYCF) counseling. Promote continued exclusive/frequent breastfeeding and diverse local complementary foods.'
      };
    }
  });

  // --- Computed Pneumonia Triage ---
  readonly pneumoniaTriage = computed<IPneumoniaTriageResult>(() => {
    const age = this.respiratoryAgeGroup();
    const bpm = this.respiratoryBpm();
    const indrawing = this.chestIndrawing();
    const stridor = this.stridorAtRest();
    const danger = this.cyanosisOrHypoxia();

    let fastBreathingThreshold = 50;
    if (age === '<2_MONTHS') fastBreathingThreshold = 60;
    else if (age === '12_59_MONTHS') fastBreathingThreshold = 40;

    const isFastBreathing = bpm >= fastBreathingThreshold;

    if (indrawing || stridor || danger) {
      return {
        ageGroup: age,
        respiratoryRateBpm: bpm,
        hasChestIndrawing: indrawing,
        hasStridorAtRest: stridor,
        hasDangerSigns: danger,
        classification: 'SEVERE_PNEUMONIA',
        classificationLabel: 'Severe Pneumonia / Very Severe Disease (RED)',
        badgeClass: 'bg-rose-950 text-rose-300 border border-rose-600',
        recommendedTreatment: 'Urgent hospital referral. Administer pre-referral first dose of oral dispersible Amoxicillin (or IM Ampicillin + Gentamicin). Clear airway, keep child warm.'
      };
    } else if (isFastBreathing) {
      return {
        ageGroup: age,
        respiratoryRateBpm: bpm,
        hasChestIndrawing: false,
        hasStridorAtRest: false,
        hasDangerSigns: false,
        classification: 'PNEUMONIA',
        classificationLabel: 'Pneumonia (Fast Breathing) (YELLOW)',
        badgeClass: 'bg-amber-950 text-amber-300 border border-amber-600',
        recommendedTreatment: 'Prescribe oral Amoxicillin 250mg dispersible tablets (40-50 mg/kg/dose twice daily for 3 days). Teach mother danger signs; review in 2 days.'
      };
    } else {
      return {
        ageGroup: age,
        respiratoryRateBpm: bpm,
        hasChestIndrawing: false,
        hasStridorAtRest: false,
        hasDangerSigns: false,
        classification: 'NO_PNEUMONIA',
        classificationLabel: 'No Pneumonia: Cough or Cold (GREEN)',
        badgeClass: 'bg-emerald-950 text-emerald-300 border border-emerald-600',
        recommendedTreatment: 'Soothe throat and relieve cough with safe warm home fluids or honey (>1 year). Zero antibiotics needed. Advise mother to return if breathing becomes fast or difficult.'
      };
    }
  });

  // --- Computed Dehydration Triage ---
  readonly dehydrationTriage = computed<IDehydrationTriageResult>(() => {
    const gen = this.generalState();
    const eyes = this.eyesState();
    const thirst = this.thirstState();
    const pinch = this.skinPinchState();
    const weight = this.childWeightKg();

    // Plan C: Severe Dehydration (Lethargic OR very slow pinch, plus other signs)
    if (gen === 'LETHARGIC' || pinch === 'VERY_SLOW') {
      return {
        plan: 'PLAN_C',
        planLabel: 'Severe Dehydration (Plan C) - RED ALERT',
        badgeClass: 'bg-rose-950 text-rose-300 border border-rose-600',
        orsVolumeMl4Hours: Math.round(weight * 100),
        zincDoseMgDaily: 20,
        clinicalDirectives: [
          'Immediate IV fluid resuscitation: Ringer’s Lactate (or Normal Saline) 100 mL/kg divided into rapid initial bolus.',
          'If child can drink, initiate ORS by mouth (5 mL/kg/hour) while IV is established.',
          'Prescribe Zinc sulfate 20 mg/day for 14 days (10 mg/day if <6 months) to regenerate gut mucosa.'
        ]
      };
    }

    // Plan B: Some Dehydration (at least 2 signs)
    let planBSignCount = 0;
    if (gen === 'IRRITABLE') planBSignCount++;
    if (eyes === 'SUNKEN') planBSignCount++;
    if (thirst === 'EAGER') planBSignCount++;
    if (pinch === 'SLOW') planBSignCount++;

    if (planBSignCount >= 2) {
      const orsVol = Math.round(weight * 75);
      return {
        plan: 'PLAN_B',
        planLabel: 'Some Dehydration (Plan B) - YELLOW ALERT',
        badgeClass: 'bg-amber-950 text-amber-300 border border-amber-600',
        orsVolumeMl4Hours: orsVol,
        zincDoseMgDaily: 20,
        clinicalDirectives: [
          `Administer ${orsVol} mL of WHO Reduced Osmolarity ORS solution slowly by spoon or cup over 4 hours.`,
          'Continue breastfeeding whenever child desires.',
          'Re-assess hydration status after 4 hours and classify into Plan A, B, or C.',
          'Prescribe Zinc sulfate 20 mg/day for 14 days to prevent diarrheal recurrence.'
        ]
      };
    }

    // Plan A: No Dehydration
    return {
      plan: 'PLAN_A',
      planLabel: 'No Dehydration (Plan A) - GREEN BASELINE',
      badgeClass: 'bg-emerald-950 text-emerald-300 border border-emerald-600',
      orsVolumeMl4Hours: 0,
      zincDoseMgDaily: 20,
      clinicalDirectives: [
        'Counsel mother on the 4 rules of home treatment: 1) Give extra fluids (clean water, soup, ORS 50-100 mL after each stool).',
        '2) Give Zinc sulfate dispersible tablet daily for 14 days.',
        '3) Continue feeding / breastfeeding frequently.',
        '4) Return immediately if child develops blood in stool, poor drinking, or high fever.'
      ]
    };
  });

  // --- Computed Danger Flags ---
  readonly anyDangerSignPresent = computed<boolean>(() => {
    return this.dangerFlags().some(f => f.checked);
  });

  // --- Computed Formulary Search ---
  readonly filteredMedicines = computed(() => {
    return this.emlService.searchMedicines(this.formularySearch());
  });

  // --- Computed Compact QR Handoff Payload ---
  readonly qrPayloadString = computed<string>(() => {
    const payload = {
      protocol: 'POCKETGULL_CHW_HANDOFF_V1',
      timestamp: new Date().toISOString(),
      patient: {
        weightKg: this.childWeightKg(),
        muacMm: this.muacMm(),
        muacTier: this.muacTriage().statusTier,
        rutfSachets: this.muacTriage().rutfSachetsPerDay
      },
      respiratory: {
        bpm: this.respiratoryBpm(),
        pneumoniaTier: this.pneumoniaTriage().classification
      },
      dehydration: {
        plan: this.dehydrationTriage().plan,
        orsMl: this.dehydrationTriage().orsVolumeMl4Hours
      },
      dangerFlags: this.dangerFlags().filter(f => f.checked).map(f => f.id)
    };
    return JSON.stringify(payload);
  });

  // --- Vernacular Audio Guidance Actions ---
  speakCurrentTriage(): void {
    const prompt = this.currentTriageVoicePrompt();
    this.voiceService.speakPrompt(prompt.promptText, prompt.languageCode);
  }

  stopSpeaking(): void {
    this.voiceService.stopSpeaking();
  }

  selectVernacularLanguage(code: VernacularLanguageCode): void {
    this.voiceService.setLanguage(code);
    this.voiceService.playAcousticAttentionCue(440, 150);
  }

  // --- Breathing Tap-Tempo Calculator ---
  tapBreathing(): void {
    this.voiceService.playAcousticAttentionCue(700, 70);
    const now = Date.now();
    this.tapTimestamps.push(now);
    if (this.tapTimestamps.length > 5) {
      this.tapTimestamps.shift();
    }
    if (this.tapTimestamps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < this.tapTimestamps.length; i++) {
        intervals.push(this.tapTimestamps[i] - this.tapTimestamps[i - 1]);
      }
      const avgIntervalMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avgIntervalMs > 0) {
        const calculatedBpm = Math.round(60000 / avgIntervalMs);
        this.respiratoryBpm.set(Math.min(120, Math.max(10, calculatedBpm)));
      }
    }
  }

  resetTimer(): void {
    this.tapTimestamps = [];
    this.respiratoryBpm.set(36);
  }

  toggleDangerFlag(id: string): void {
    this.dangerFlags.update(flags =>
      flags.map(f => f.id === id ? { ...f, checked: !f.checked } : f)
    );
  }

  toggleQrModal(): void {
    this.showQrModal.update(v => !v);
  }

  async copyQrPayload(): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(this.qrPayloadString());
      this.qrCopied.set(true);
      setTimeout(() => this.qrCopied.set(false), 2000);
    }
  }

  private renderQrCode(): void {
    const container = this.qrContainer()?.nativeElement;
    if (!container) return;

    try {
      container.innerHTML = '';
      const code = generate(this.qrPayloadString());
      const dataUrl = code.toDataURL({ scale: 5 });
      container.innerHTML = `<img src="${dataUrl}" class="w-48 h-48 select-none pointer-events-none" style="image-rendering: pixelated;" alt="CHW Handoff QR Code" />`;
    } catch (err) {
      console.warn('[CHW Suite] QR render error:', err);
    }
  }
}
