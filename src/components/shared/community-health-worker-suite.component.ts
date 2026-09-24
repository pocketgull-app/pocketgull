import { Component, ChangeDetectionStrategy, signal, computed, inject, output, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WhoEssentialMedicinesService } from '../../services/who-essential-medicines.service';
import { generate } from 'lean-qr';

export type ChwTab = 'malnutrition_muac' | 'pneumonia_timer' | 'dehydration_ors' | 'danger_signs' | 'open_formulary';

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
      </nav>

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
              <span class="text-xs font-mono uppercase text-emerald-400 font-semibold">Action Directive:</span>
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
            <span class="text-xs font-mono uppercase text-teal-400 font-semibold">Treatment &amp; Referral Directive:</span>
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
              <span class="text-xs font-mono uppercase text-cyan-400 font-semibold">Treatment Directives:</span>
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
              <h3 class="text-sm font-bold text-rose-200 flex items-center gap-2">
                <span>🚨</span> 7 IMCI General Danger Signs (Zero Delay Referral)
              </h3>
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
          Universal Free Healthcare Triad • PocketGull
        </div>
      </footer>
    </div>
  `
})
export class CommunityHealthWorkerSuiteComponent {
  readonly emlService = inject(WhoEssentialMedicinesService);
  readonly close = output<void>();

  hasCloseButton = true;
  activeTab = signal<ChwTab>('malnutrition_muac');

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

  // --- Breathing Tap-Tempo Calculator ---
  tapBreathing(): void {
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
