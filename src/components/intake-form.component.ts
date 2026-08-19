import { Component, ChangeDetectionStrategy, inject, computed, signal, OnDestroy, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownService } from '../services/markdown.service';
import { DictationService } from '../services/dictation.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { FhirR5TelemetryService } from '../services/fhir/fhir-r5-telemetry.service';
import { IBodyPartIssue, BODY_PART_NAMES, BODY_PART_MAPPING, HistoryEntry } from '../services/patient.types';

import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { PocketGullInputComponent } from './shared/pocket-gull-input.component';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';
import { SafeHtmlPipe } from '../pipes/safe-html-new.pipe';

interface INoteTimelineItem extends IBodyPartIssue {
  date: string;
  isCurrent: boolean;
}

@Component({
  selector: 'app-intake-form',
  imports: [CommonModule, PocketGullButtonComponent, PocketGullInputComponent, PocketGullBadgeComponent, SafeHtmlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col bg-[#F9FAFB] dark:bg-zinc-950">
      @if (state.selectedPartId()) {
        <!-- Global Header for the Panel -->
        <div class="h-14 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6 bg-white dark:bg-zinc-900 shrink-0 z-10">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-sm bg-[#689F38] dark:bg-[#8bc34a]"></div>
            <span class="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Assessment Panel</span>
            <pocket-gull-badge label="HIPAA COMPLIANT" severity="success" class="ml-2"></pocket-gull-badge>
          </div>
          <div class="flex items-center gap-2">
            <button 
              type="button"
              id="btn-socratic-studio-intake-form"
              (click)="state.toggleSocraticIntake(true)"
              class="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-md text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition cursor-pointer"
              title="Launch Socratic Patient Intake Studio">
              <span>✨ Socratic Studio</span>
            </button>
            <pocket-gull-button 
              variant="ghost" 
              size="sm" 
              (click)="close()"
              ariaLabel="Close Assessment Panel"
              icon="M6 18L18 6M6 6l12 12">
            </pocket-gull-button>
          </div>
        </div>

        <div class="flex-1 flex overflow-hidden">
          <div class="flex-1 overflow-y-auto p-6 bg-[#F9FAFB] dark:bg-zinc-950">
            
            @if (viewedNote(); as note) {
              <!-- TASK BRACKET: Active Assessment Card -->
              <!-- This visual container 'brackets' the current task, separating it from history -->
              <div class="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden mb-8 transition-all duration-300 hover:shadow-md">
              
              <!-- Bracket Header -->
              <div class="bg-gray-50/50 dark:bg-zinc-800/30 px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-start">
                <div>
                  <span class="text-xs font-bold uppercase tracking-widest text-[#416B1F] dark:text-[#8bc34a] block mb-1">
                    {{ note.isCurrent ? 'Active Input' : 'Historical Record' }}
                  </span>
                  <h2 class="text-xl font-medium text-[#1C1C1C] dark:text-zinc-100">{{ state.selectedPartName() }}</h2>
                  <!-- TDM UI Integration -->
                  @if (state.activePhilosophy() === 'eastern' && note.tcmPattern) {
                    <div class="mt-2">
                      <pocket-gull-badge [label]="'TCM Pattern: ' + note.tcmPattern" severity="success"></pocket-gull-badge>
                    </div>
                  } @else if (state.activePhilosophy() === 'ayurvedic' && note.ayurvedicImbalance) {
                    <div class="mt-2">
                      <pocket-gull-badge [label]="'Ayurvedic Imbalance: ' + note.ayurvedicImbalance" severity="warning"></pocket-gull-badge>
                    </div>
                  }
                </div>
                @if (note.isCurrent) {
                  <pocket-gull-badge label="Live" severity="success" [hasIcon]="true">
                    <div badge-icon class="w-1.5 h-1.5 rounded-sm bg-brand-green-500 animate-pulse"></div>
                  </pocket-gull-badge>
                } @else {
                  <pocket-gull-badge [label]="note.date" severity="neutral"></pocket-gull-badge>
                }
              </div>

              <!-- Bracket Body -->
              <div class="p-6 space-y-8">

                <!-- 0. Organ-Contextual Biometric Telemetry & Metabolic Panel (CMP) -->
                <div class="p-4 bg-gray-50/80 dark:bg-zinc-900/80 rounded-xl border border-gray-200/80 dark:border-zinc-800 shadow-2xs">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full" [ngClass]="r5Telemetry.isStreaming() ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'"></span>
                      <h3 class="text-xs font-bold text-gray-600 dark:text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
                        Contextual {{ organContext().systemName }} Telemetry & Labs
                        @if (r5Telemetry.isStreaming()) {
                          <span class="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">FHIR R5 LIVE</span>
                        }
                      </h3>
                    </div>
                    <div class="flex items-center gap-2">
                      <button type="button" (click)="r5Telemetry.toggleStreaming()" class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border transition-all active:scale-95 shadow-2xs" [ngClass]="r5Telemetry.isStreaming() ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-300'">
                        {{ r5Telemetry.isStreaming() ? '⏸ Pause R5 Stream' : '▶ Live R5 Stream' }}
                      </button>
                      <button type="button" (click)="openLabModal()" class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-lime-600 text-white hover:bg-lime-700 rounded border border-lime-700 transition-all active:scale-95 shadow-2xs">
                        ✏️ Edit Labs (CMP)
                      </button>
                    </div>
                  </div>

                  <!-- Out-of-Range Biomarker Alerts Bar -->
                  @if (abnormalBiomarkers().length > 0) {
                    <div class="mb-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex flex-wrap items-center gap-1.5">
                      <span class="text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>
                        Abnormal Lab Flags:
                      </span>
                      @for (alert of abnormalBiomarkers(); track alert) {
                        <span class="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 rounded-full">
                          {{ alert }}
                        </span>
                      }
                    </div>
                  }

                  <!-- Contextual Biomarker Metrics Grid -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    @for (item of organContext().metrics; track item.label + '-' + $index) {
                      <div class="p-2 bg-white dark:bg-zinc-800/90 rounded-lg border border-gray-100 dark:border-zinc-700/60 shadow-2xs">
                        <div class="text-[10px] font-semibold text-gray-400 dark:text-zinc-400 uppercase tracking-wider truncate">{{ item.label }}</div>
                        <div class="text-sm font-bold text-gray-900 dark:text-zinc-100 mt-0.5 flex items-baseline gap-1">
                          {{ item.value }}
                          <span class="text-[10px] font-normal text-gray-400 dark:text-zinc-500">{{ item.unit }}</span>
                        </div>
                        <div class="mt-1 flex items-center gap-1">
                          <span [class]="item.status === 'normal' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200' : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200'" class="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border">
                            {{ item.status }}
                          </span>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Quick Symptom Descriptor Chips (One-Tap Doctor Assistant) -->
                  @if (note.isCurrent) {
                    <div class="pt-2 border-t border-gray-200/60 dark:border-zinc-800">
                      <div class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-1.5 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-lime-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                        One-Tap Symptom Shortcuts
                      </div>
                      <div class="flex flex-wrap gap-1.5">
                        @for (chip of organContext().symptomChips; track chip) {
                          <button 
                            type="button"
                            (click)="appendSymptomChip(chip)"
                            class="px-2 py-1 text-[11px] font-medium bg-white dark:bg-zinc-800 hover:bg-lime-500/10 dark:hover:bg-lime-500/20 text-gray-700 dark:text-zinc-200 hover:text-lime-700 dark:hover:text-lime-300 border border-gray-200 dark:border-zinc-700 hover:border-lime-500/40 rounded-md transition-all active:scale-95 flex items-center gap-1 shadow-2xs">
                            <span>+</span> {{ chip }}
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>
                
                <!-- 1. Pain Level Section -->
                <div class="mb-8">
                  <div class="flex justify-between items-end mb-4">
                    <label for="painRange" class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                        Pain Severity
                    </label>
                    <div class="flex items-baseline gap-1">
                        <span class="text-3xl font-light text-[#1C1C1C] dark:text-zinc-100">{{ formState().painLevel }}</span>
                        <span class="text-sm font-medium text-gray-500 dark:text-zinc-400">/10</span>
                    </div>
                  </div>
                  
                  <div class="relative h-8 flex items-center group">
                    <!-- Track background -->
                    <div class="absolute w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-sm overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-brand-green-400 via-brand-amber-400 to-brand-red-500 opacity-30"></div>
                    </div>
                    <!-- Active fill -->
                    <div class="absolute h-1.5 bg-gradient-to-r from-brand-green-500 via-brand-amber-500 to-brand-red-600 rounded-sm transition-all duration-150 ease-out"
                         [style.width.%]="formState().painLevel * 10"></div>
                    
                    <label for="painRange" class="sr-only">Pain Level</label>
                    <input 
                      id="painRange"
                      name="painRange"
                      type="range" 
                      min="0" max="10" step="1" 
                      [value]="formState().painLevel"
                      (input)="updatePain($event)"
                      [disabled]="!note.isCurrent"
                      class="relative w-full h-8 opacity-0 z-10 cursor-pointer disabled:cursor-not-allowed">
                      
                    <!-- Custom Thumb (Visual only, follows input) -->
                    <div class="absolute h-5 w-5 bg-white dark:bg-zinc-900 border-2 border-[#1C1C1C] dark:border-zinc-300 rounded-sm shadow-sm pointer-events-none transition-all duration-150 ease-out flex items-center justify-center"
                         [style.left.%]="formState().painLevel * 10"
                         [style.transform]="'translateX(-50%)'">
                         <div class="w-1.5 h-1.5 bg-[#1C1C1C] dark:bg-zinc-300 rounded-sm"></div>
                    </div>
                  </div>
                  <div class="flex justify-between text-xs text-gray-500 dark:text-zinc-400 font-medium uppercase tracking-wider px-1">
                    <span>None</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                  </div>
                </div>

                <!-- 2. Notes Section -->
                <div class="space-y-3">
                    <pocket-gull-input
                      type="textarea"
                      label="Integrative Observations"
                      [value]="formState().description"
                      (valueChange)="updateDescManual($event)"
                      [disabled]="!note.isCurrent"
                      [breathing]="note.isCurrent"
                      [autofocus]="note.isCurrent"
                      [rows]="5"
                      [placeholder]="dictation.isListening() ? 'Listening for your notes...' : 'Describe symptoms, triggers, and observations...'"
                      icon="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z">
                      
                      <div class="flex items-center gap-1.5 mt-2 justify-end">
                        <pocket-gull-button
                          variant="secondary"
                          size="sm"
                          [disabled]="!formState().description"
                          (click)="copyNotesToClipboard()"
                          [icon]="justCopied() ? 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' : 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z'"
                          ariaLabel="Copy notes"
                          [title]="justCopied() ? 'Copied!' : 'Copy notes'">
                        </pocket-gull-button>

                        @if (note.isCurrent) {
                          <pocket-gull-button
                            [variant]="dictation.isListening() ? 'danger' : 'secondary'"
                            size="sm"
                            [disabled]="!!dictation.permissionError()"
                            (click)="openDictation()"
                            [loading]="dictation.isListening()"
                            icon="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                            ariaLabel="Dictate notes"
                            title="Dictate Notes">
                          </pocket-gull-button>
                        }
                      </div>
                    </pocket-gull-input>
                  @if(dictation.permissionError(); as error) {
                      <div class="flex items-center gap-2 text-brand-red-600 dark:text-brand-red-400 bg-brand-red-50 dark:bg-brand-red-900/30 px-3 py-2 rounded-md border border-brand-red-100 dark:border-brand-red-800/50">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                        <p class="text-[12px] font-medium">{{ error }}</p>
                      </div>
                  }
                </div>

                <!-- 2.5 Paradigm-Focused Assessment Intake (Eastern TCM & Ayurvedic Diagnostics) -->
                <div class="p-4 bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-zinc-900/90 dark:to-zinc-900/50 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0 0 20z"/></svg>
                        Paradigm Assessment Intake Protocol
                      </span>
                    </div>
                    <div class="flex items-center gap-1 bg-white dark:bg-zinc-800 p-1 rounded-lg border border-slate-200 dark:border-zinc-700">
                      <button type="button" (click)="state.selectPhilosophy('western')" [class.bg-indigo-600]="state.activePhilosophy() === 'western'" [class.text-white]="state.activePhilosophy() === 'western'" class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer">
                        🩺 Western
                      </button>
                      <button type="button" (click)="state.selectPhilosophy('eastern')" [class.bg-emerald-600]="state.activePhilosophy() === 'eastern'" [class.text-white]="state.activePhilosophy() === 'eastern'" class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer">
                        🌿 Eastern TCM
                      </button>
                      <button type="button" (click)="state.selectPhilosophy('ayurvedic')" [class.bg-amber-600]="state.activePhilosophy() === 'ayurvedic'" [class.text-white]="state.activePhilosophy() === 'ayurvedic'" class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer">
                        🧘 Ayurvedic
                      </button>
                    </div>
                  </div>

                  @if (state.activePhilosophy() === 'eastern') {
                    <!-- Eastern TCM Si Zhen & Shi Wen Intake Panel -->
                    <div class="space-y-3 pt-2 border-t border-slate-200/60 dark:border-zinc-800">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label id="tcm-tongue-color-label" for="tcm-tongue-color-select" class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">Tongue Body Color (Wang Zhen)</label>
                          <select id="tcm-tongue-color-select"
                                  [attr.aria-describedby]="'tcm-tongue-color-hint'"
                                  [attr.aria-invalid]="false"
                                  [value]="state.tcmIntake().tongueColor" 
                                  (change)="updateTcmField('tongueColor', $event)" 
                                  class="w-full text-xs font-semibold p-2 min-h-[44px] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500">
                            <option value="pink">Pink (Normal / Healthy)</option>
                            <option value="pale">Pale (Qi / Blood Deficiency)</option>
                            <option value="red">Red (Heat / Fire Pattern)</option>
                            <option value="scarlet">Scarlet (Extreme Heat / Yin Deficiency)</option>
                            <option value="purple">Purple (Blood Stagnation)</option>
                          </select>
                          <span id="tcm-tongue-color-hint" class="sr-only">Select TCM tongue body color pattern</span>
                        </div>
                        <div>
                          <label id="tcm-tongue-coating-label" for="tcm-tongue-coating-select" class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">Tongue Coating (Jihva)</label>
                          <select id="tcm-tongue-coating-select"
                                  [attr.aria-describedby]="'tcm-tongue-coating-hint'"
                                  [attr.aria-invalid]="false"
                                  [value]="state.tcmIntake().tongueCoating" 
                                  (change)="updateTcmField('tongueCoating', $event)" 
                                  class="w-full text-xs font-semibold p-2 min-h-[44px] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500">
                            <option value="thin-white">Thin White (Normal Baseline)</option>
                            <option value="thick-white">Thick White (Cold-Damp Retention)</option>
                            <option value="yellow-dry">Yellow Dry (Full Heat)</option>
                            <option value="yellow-greasy">Yellow Greasy (Damp-Heat)</option>
                            <option value="peeled">Peeled / Geographic (Yin Exhaustion)</option>
                          </select>
                          <span id="tcm-tongue-coating-hint" class="sr-only">Select TCM tongue coating thickness and moisture</span>
                        </div>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label id="tcm-pulse-quality-label" for="tcm-pulse-quality-select" class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">Radial Pulse Quality (Qie Zhen)</label>
                          <select id="tcm-pulse-quality-select"
                                  [attr.aria-describedby]="'tcm-pulse-quality-hint'"
                                  [attr.aria-invalid]="false"
                                  [value]="state.tcmIntake().pulseQuality" 
                                  (change)="updateTcmField('pulseQuality', $event)" 
                                  class="w-full text-xs font-semibold p-2 min-h-[44px] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500">
                            <option value="normal">Balanced Smooth Pulse</option>
                            <option value="wiry">Wiry / Xian (Liver Qi Stagnation / Pain)</option>
                            <option value="slippery">Slippery / Hua (Phlegm-Damp / Food Stagnation)</option>
                            <option value="deep-thready">Deep Thready / Xi (Yin & Kidney Xu)</option>
                            <option value="floating-rapid">Floating Rapid / Fu Shu (Exterior Wind Heat)</option>
                            <option value="choppy">Choppy / Se (Blood Stasis / Fluid Loss)</option>
                          </select>
                          <span id="tcm-pulse-quality-hint" class="sr-only">Select radial artery pulse palpation quality</span>
                        </div>
                        <div>
                          <label id="tcm-thermal-label" for="tcm-thermal-select" class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">Shi Wen Thermal Preference</label>
                          <select id="tcm-thermal-select"
                                  [attr.aria-describedby]="'tcm-thermal-hint'"
                                  [attr.aria-invalid]="false"
                                  [value]="state.tcmIntake().thermalPreference" 
                                  (change)="updateTcmField('thermalPreference', $event)" 
                                  class="w-full text-xs font-semibold p-2 min-h-[44px] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500">
                            <option value="neutral">Neutral Thermal Equilibrium</option>
                            <option value="aversion-cold">Aversion to Cold (Yang Xu)</option>
                            <option value="aversion-heat">Aversion to Heat (Full Heat)</option>
                            <option value="afternoon-tidal-heat">Afternoon Tidal Heat (Yin Xu)</option>
                          </select>
                          <span id="tcm-thermal-hint" class="sr-only">Select patient thermal sensation preference</span>
                        </div>
                      </div>
                    </div>
                  } @else if (state.activePhilosophy() === 'ayurvedic') {
                    <!-- Ayurvedic Tridosha & Ashtavidha Intake Panel -->
                    <div class="space-y-4 pt-2 border-t border-slate-200/60 dark:border-zinc-800">
                      <!-- Tridosha Vikriti Current Imbalance Sliders -->
                      <div>
                        <div class="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2">Tridosha Vikriti Imbalance Assessment</div>
                        <div class="space-y-2">
                          <div>
                            <div class="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                              <label id="ayur-vata-label" for="ayur-vata-range">🌬️ Vata (Air/Ether) Aggravation</label>
                              <span>{{ state.ayurvedicIntake().vikritiVata }}/10</span>
                            </div>
                            <input id="ayur-vata-range"
                                   type="range" min="0" max="10" 
                                   [attr.aria-describedby]="'ayur-vata-hint'"
                                   [attr.aria-invalid]="false"
                                   [value]="state.ayurvedicIntake().vikritiVata" 
                                   (input)="updateAyurvedicField('vikritiVata', $event)" 
                                   class="w-full h-8 accent-cyan-500 cursor-pointer min-h-[44px]">
                            <span id="ayur-vata-hint" class="sr-only">Adjust Vata dosha aggravation score from 0 to 10</span>
                          </div>
                          <div>
                            <div class="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                              <label id="ayur-pitta-label" for="ayur-pitta-range">🔥 Pitta (Fire/Water) Aggravation</label>
                              <span>{{ state.ayurvedicIntake().vikritiPitta }}/10</span>
                            </div>
                            <input id="ayur-pitta-range"
                                   type="range" min="0" max="10" 
                                   [attr.aria-describedby]="'ayur-pitta-hint'"
                                   [attr.aria-invalid]="false"
                                   [value]="state.ayurvedicIntake().vikritiPitta" 
                                   (input)="updateAyurvedicField('vikritiPitta', $event)" 
                                   class="w-full h-8 accent-amber-500 cursor-pointer min-h-[44px]">
                            <span id="ayur-pitta-hint" class="sr-only">Adjust Pitta dosha aggravation score from 0 to 10</span>
                          </div>
                          <div>
                            <div class="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                              <label id="ayur-kapha-label" for="ayur-kapha-range">🌿 Kapha (Earth/Water) Aggravation</label>
                              <span>{{ state.ayurvedicIntake().vikritiKapha }}/10</span>
                            </div>
                            <input id="ayur-kapha-range"
                                   type="range" min="0" max="10" 
                                   [attr.aria-describedby]="'ayur-kapha-hint'"
                                   [attr.aria-invalid]="false"
                                   [value]="state.ayurvedicIntake().vikritiKapha" 
                                   (input)="updateAyurvedicField('vikritiKapha', $event)" 
                                   class="w-full h-8 accent-emerald-500 cursor-pointer min-h-[44px]">
                            <span id="ayur-kapha-hint" class="sr-only">Adjust Kapha dosha aggravation score from 0 to 10</span>
                          </div>
                        </div>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label id="ayur-agni-label" for="ayur-agni-select" class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">Agni Digestive Fire Status</label>
                          <select id="ayur-agni-select"
                                  [attr.aria-describedby]="'ayur-agni-hint'"
                                  [attr.aria-invalid]="false"
                                  [value]="state.ayurvedicIntake().agniType" 
                                  (change)="updateAyurvedicField('agniType', $event)" 
                                  class="w-full text-xs font-semibold p-2 min-h-[44px] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500">
                            <option value="samagni">Samagni (Balanced Fire)</option>
                            <option value="vishamagni">Vishamagni (Vata Irregular / Variable)</option>
                            <option value="tikshnagni">Tikshnagni (Pitta Hyper / Acidic Fire)</option>
                            <option value="mandagni">Mandagni (Kapha Sluggish / Slow Fire)</option>
                          </select>
                          <span id="ayur-agni-hint" class="sr-only">Select Ayurvedic Agni digestive metabolism type</span>
                        </div>
                        <div>
                          <label id="ayur-ama-label" for="ayur-ama-range" class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">Ama Metabolic Toxicity Score</label>
                          <div class="flex items-center gap-2">
                            <input id="ayur-ama-range"
                                   type="range" min="0" max="10" 
                                   [attr.aria-describedby]="'ayur-ama-hint'"
                                   [attr.aria-invalid]="false"
                                   [value]="state.ayurvedicIntake().amaScore" 
                                   (input)="updateAyurvedicField('amaScore', $event)" 
                                   class="w-full h-8 accent-rose-500 cursor-pointer min-h-[44px]">
                            <span class="text-xs font-bold text-rose-600 dark:text-rose-400 w-8">{{ state.ayurvedicIntake().amaScore }}/10</span>
                          </div>
                          <span id="ayur-ama-hint" class="sr-only">Adjust Ama metabolic toxicity score from 0 to 10</span>
                        </div>
                      </div>
                    </div>
                  } @else {
                    <div class="text-[11px] font-medium text-slate-600 dark:text-zinc-400 leading-relaxed pt-1">
                      Western Allopathic Assessment active. Chief complaint, organ-contextual vitals, and ICD-10 biomarkers logged above.
                    </div>
                  }
                </div>

                <!-- 3. Recommendations Section -->
                <div class="space-y-3">
                  <div class="flex justify-between items-center mb-1">
                    <label for="recommendation-input" class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        Recommendations
                    </label>
                    @if (formState().recommendation && note.isCurrent) {
                      <pocket-gull-button
                        variant="ghost"
                        size="xs"
                        (click)="addToPatientSummary()"
                        icon="M12 5v14M5 12h14">
                        Add to Patient Summary
                      </pocket-gull-button>
                    }
                  </div>
                  <pocket-gull-input
                    inputId="recommendation-input"
                    type="textarea"
                    [value]="formState().recommendation"
                    (valueChange)="updateRecManual($event)"
                    [disabled]="!note.isCurrent"
                    [rows]="3"
                    placeholder="Suggested treatments, referrals, or next steps...">
                    
                    <div class="flex items-center gap-1.5 mt-2 justify-end">
                      <pocket-gull-button
                        variant="secondary"
                        size="sm"
                        [disabled]="!formState().recommendation"
                        (click)="copyRecToClipboard()"
                        [icon]="justCopiedRec() ? 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' : 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z'"
                        ariaLabel="Copy recommendation"
                        [title]="justCopiedRec() ? 'Copied!' : 'Copy recommendation'">
                      </pocket-gull-button>
                      @if (note.isCurrent) {
                        <pocket-gull-button (click)="openRecDictation()" [disabled]="!!dictation.permissionError()"
                                variant="secondary"
                                size="sm"
                                [loading]="dictation.isListening()"
                                icon="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                                ariaLabel="Dictate recommendation"
                                title="Dictate Recommendation">
                        </pocket-gull-button>
                      }
                    </div>
                  </pocket-gull-input>
                </div>
              </div>

              <!-- Bracket Footer -->
              <div class="px-6 py-4 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                <pocket-gull-button 
                  variant="ghost" 
                  size="sm"
                  (click)="deleteNote(note)" 
                  [disabled]="!note.isCurrent"
                  icon="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                  Delete
                </pocket-gull-button>
                <pocket-gull-button 
                  (click)="updateEntry()"
                  [disabled]="!isDirty()"
                  [trailingIcon]="!isDirty() ? 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' : ''">
                  {{ isDirty() ? 'Save Changes' : 'Saved' }}
                </pocket-gull-button>
              </div>
            </div>

                <!-- AI INSIGHTS SECTION (Node Format Alignment) -->
                @if (aiInsights().length > 0) {
                  <div class="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div class="flex items-center gap-2 px-2">
                       <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v8l6-6M12 22v-8l-6 6M2 12h8l-6-6M22 12h-8l6 6"/></svg>
                       <span class="text-xs font-bold uppercase tracking-widest text-purple-600">AI Draft Insights</span>
                    </div>

                    <div class="space-y-px rams-typography">
                      @for (node of aiInsights(); track node.id) {
                        <div class="bg-purple-50/30 dark:bg-purple-900/10 border border-purple-100/50 dark:border-purple-800/30 rounded-lg p-4 transition-all hover:bg-purple-50/50 dark:hover:bg-purple-900/20 group mb-3">
                           @if (node.type === 'paragraph') {
                             <div [innerHTML]="node.rawHtml | safeHtml"></div>
                           } @else if (node.type === 'list') {
                             <ul>
                               @for (item of node.items; track item.id) {
                                 <li [innerHTML]="item.html | safeHtml"></li>
                               }
                             </ul>
                           } @else if (node.type === 'raw') {
                             <div [innerHTML]="node.rawHtml | safeHtml"></div>
                           }
                           <div class="mt-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <pocket-gull-button 
                                variant="secondary" 
                                size="xs" 
                                (click)="adoptInsight(node, 'desc')"
                                icon="M5 12l5 5L20 7">
                                Adopt as Note
                              </pocket-gull-button>
                              <pocket-gull-button 
                                variant="secondary" 
                                size="xs" 
                                (click)="adoptInsight(node, 'rec')"
                                icon="M5 12l5 5L20 7">
                                Adopt as Recommendation
                              </pocket-gull-button>
                           </div>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- CONTEXT: History Timeline -->
                <div class="mt-12 pl-2">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
                            History & Context
                        </h3>
                        <pocket-gull-button 
                          variant="ghost" 
                          size="xs" 
                          (click)="addNewNote()" 
                          [disabled]="!canAddNote()"
                          icon="M12 5v14M5 12h14">
                          New Note
                        </pocket-gull-button>
                    </div>
                    
                    <div class="relative pl-2">
                        <!-- Vertical Timeline Line -->
                        <div class="absolute left-[11px] top-2 bottom-2 w-px bg-gray-200 dark:bg-zinc-800"></div>

                        @for (timelineNote of noteTimeline(); track $index) {
                        <div class="relative pl-8 pb-6 group">
                            <!-- Node on the timeline -->
                            <div class="absolute left-[7px] top-2.5 w-2.5 h-2.5 rounded-sm border-2 bg-white dark:bg-zinc-950 z-10 transition-colors"
                                [class.border-[#689F38]]="timelineNote.isCurrent"
                                [class.border-gray-300]="!timelineNote.isCurrent"
                                [class.dark:border-zinc-700]="!timelineNote.isCurrent"
                                [class.bg-[#689F38]]="timelineNote.noteId === state.selectedNoteId()">
                            </div>
                            
                            <!-- Data Card -->
                            <button (click)="selectNote(timelineNote.noteId)" 
                                    class="w-full text-left p-3 rounded-lg border transition-all duration-200 hover:shadow-md group-hover:border-gray-300 dark:border-zinc-800 dark:hover:border-zinc-600"
                                    [class.bg-white]="timelineNote.noteId !== state.selectedNoteId()"
                                    [class.dark:bg-zinc-900]="timelineNote.noteId !== state.selectedNoteId()"
                                    [class.bg-[#F1F8E9]]="timelineNote.noteId === state.selectedNoteId()"
                                    [class.dark:bg-[#1a2e0530]]="timelineNote.noteId === state.selectedNoteId()"
                                    [class.border-[#689F38]]="timelineNote.noteId === state.selectedNoteId()"
                                    [class.border-transparent]="timelineNote.noteId !== state.selectedNoteId()"
                                    [class.shadow-sm]="timelineNote.noteId !== state.selectedNoteId()">
                                
                                <div class="flex justify-between items-start mb-1">
                                    <span class="text-xs font-bold uppercase tracking-widest"
                                       [class.text-[#416B1F]]="timelineNote.isCurrent"
                                       [class.dark:text-[#8bc34a]]="timelineNote.isCurrent"
                                       [class.text-gray-500]="!timelineNote.isCurrent"
                                       [class.dark:text-zinc-400]="!timelineNote.isCurrent">
                                        {{ timelineNote.date }}
                                    </span>
                                    <span class="text-xs font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
                                        Pain: {{ timelineNote.painLevel }}
                                    </span>
                                </div>
                                <p class="text-xs font-medium text-gray-700 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                                    {{ timelineNote.description || 'No description provided.' }}
                                </p>
                            </button>
                        </div>
                    } @empty {
                        <div class="pl-8 text-xs text-gray-500 dark:text-zinc-400 italic py-4">No prior history for this body part.</div>
                    }
                </div>
            </div>

        } @else {
           <div class="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-40">
              <p class="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Select a note to edit.</p>
           </div>
        }
          </div>
        </div>

      } @else {
        <div class="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-40">
           <div class="w-16 h-16 bg-gray-100 dark:bg-zinc-900 rounded-sm flex items-center justify-center mb-4 text-gray-300 dark:text-zinc-400">
             <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
           </div>
           <p class="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400">Select a body part to begin assessment</p>
        </div>
      }

      <!-- Edit Comprehensive Metabolic Panel (CMP) Modal Overlay -->
      @if (showLabModal()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div class="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-900/50">
              <h3 class="text-sm font-bold text-gray-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-lime-500"></span>
                Edit Comprehensive Metabolic Panel (CMP)
              </h3>
              <button (click)="closeLabModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 text-lg font-bold">✕</button>
            </div>

            <div class="p-6 overflow-y-auto space-y-4 text-xs">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-[10px] mb-1">Troponin I (ng/mL)</label>
                  <input type="text" [value]="tempCmp().troponinI || '0.02'" (input)="updateLabField('troponinI', $event)" class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-lime-500 focus:outline-none" />
                </div>
                <div>
                  <label class="block font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-[10px] mb-1">NT-proBNP (pg/mL)</label>
                  <input type="text" [value]="tempCmp().ntProBnp || '85'" (input)="updateLabField('ntProBnp', $event)" class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-lime-500 focus:outline-none" />
                </div>
                <div>
                  <label class="block font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-[10px] mb-1">Serum ALT (U/L)</label>
                  <input type="text" [value]="tempCmp().alt || '28'" (input)="updateLabField('alt', $event)" class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-lime-500 focus:outline-none" />
                </div>
                <div>
                  <label class="block font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-[10px] mb-1">Serum AST (U/L)</label>
                  <input type="text" [value]="tempCmp().ast || '32'" (input)="updateLabField('ast', $event)" class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-lime-500 focus:outline-none" />
                </div>
                <div>
                  <label class="block font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-[10px] mb-1">eGFR (mL/min)</label>
                  <input type="text" [value]="tempCmp().egfr || '94'" (input)="updateLabField('egfr', $event)" class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-lime-500 focus:outline-none" />
                </div>
                <div>
                  <label class="block font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-[10px] mb-1">Serum Creatinine (mg/dL)</label>
                  <input type="text" [value]="tempCmp().creatinine || '0.9'" (input)="updateLabField('creatinine', $event)" class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-lime-500 focus:outline-none" />
                </div>
                <div>
                  <label class="block font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-[10px] mb-1">Fasting Glucose (mg/dL)</label>
                  <input type="text" [value]="tempCmp().glucose || '92'" (input)="updateLabField('glucose', $event)" class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-lime-500 focus:outline-none" />
                </div>
                <div>
                  <label class="block font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-[10px] mb-1">hs-CRP Marker (mg/L)</label>
                  <input type="text" [value]="tempCmp().hsCrp || '0.8'" (input)="updateLabField('hsCrp', $event)" class="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-lime-500 focus:outline-none" />
                </div>
              </div>
            </div>

            <div class="p-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex justify-end gap-2">
              <button (click)="closeLabModal()" class="px-4 py-2 text-xs font-bold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-all">Cancel</button>
              <button (click)="saveLabModal()" class="px-4 py-2 text-xs font-bold bg-lime-600 text-white hover:bg-lime-700 rounded-lg transition-all shadow-md">Save Biomarker Panel</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class IntakeFormComponent implements OnDestroy {
  state = inject(PatientStateService);
  r5Telemetry = inject(FhirR5TelemetryService);
  private patientManager = inject(PatientManagementService);
  dictation = inject(DictationService);

  justCopied = signal(false);
  justCopiedRec = signal(false);

  // CMP Lab Modal State
  showLabModal = signal(false);
  tempCmp = signal<any>({});

  // Out-of-Range Biomarker Alerts
  abnormalBiomarkers = computed(() => {
    const cmp = this.state.vitals().cmpLabs || {};
    const alerts: string[] = [];

    if (parseFloat(cmp.troponinI || '0.02') > 0.04) {
      alerts.push(`Elevated Troponin I: ${cmp.troponinI || '0.02'} ng/mL (Cardiac Risk)`);
    }
    if (parseFloat(cmp.ntProBnp || '85') > 125) {
      alerts.push(`Elevated NT-proBNP: ${cmp.ntProBnp} pg/mL (Heart Failure Risk)`);
    }
    if (parseFloat(cmp.alt || '28') > 55) {
      alerts.push(`Elevated Serum ALT: ${cmp.alt} U/L (Hepatic Stress)`);
    }
    if (parseFloat(cmp.ast || '32') > 48) {
      alerts.push(`Elevated Serum AST: ${cmp.ast} U/L`);
    }
    if (parseFloat(cmp.egfr || '94') < 60) {
      alerts.push(`Impaired eGFR: ${cmp.egfr} mL/min (Renal Risk)`);
    }
    if (parseFloat(cmp.glucose || '92') > 125) {
      alerts.push(`Elevated Fasting Glucose: ${cmp.glucose} mg/dL`);
    }
    if (parseFloat(cmp.hsCrp || '0.8') > 3.0) {
      alerts.push(`High hs-CRP Inflammatory Marker: ${cmp.hsCrp} mg/L`);
    }

    return alerts;
  });

  openLabModal() {
    const currentCmp = this.state.vitals().cmpLabs || {};
    this.tempCmp.set({ ...currentCmp });
    this.showLabModal.set(true);
  }

  closeLabModal() {
    this.showLabModal.set(false);
  }

  updateLabField(field: string, event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.tempCmp.update(old => ({ ...old, [field]: val }));
  }

  saveLabModal() {
    const updatedCmp = this.tempCmp();
    this.state.updateCmpLabs(updatedCmp);
    this.showLabModal.set(false);
  }

  // --- Local State for the Form ---
  private localPainLevel = signal(0);
  private localDescription = signal('');
  private localRecommendation = signal('');

  noteTimeline = computed<INoteTimelineItem[]>(() => {
    const partId = this.state.selectedPartId();
    if (!partId) return [];

    const isReviewing = !!this.state.viewingPastVisit();
    const reviewDate = this.state.viewingPastVisit()?.date;

    const notesInScope = this.state.issues()[partId] || [];
    const history = this.selectedPatientHistory();

    const timelineItems: INoteTimelineItem[] = [];
    const processedNoteIds = new Set<string>();

    // 1. Add notes from the current scope (which could be the current visit or a reviewed visit)
    notesInScope.forEach(note => {
      if (processedNoteIds.has(note.noteId)) return;
      timelineItems.push({
        ...note,
        date: isReviewing ? reviewDate! : 'Current Visit',
        isCurrent: !isReviewing
      });
      processedNoteIds.add(note.noteId);
    });

    // 2. Add historical notes from other visits
    history.forEach(entry => {
      if (entry.type === 'Visit' || entry.type === 'ChartArchived') {
        const notesInVisit = entry.state?.issues[partId] || [];
        notesInVisit.forEach(note => {
          if (!processedNoteIds.has(note.noteId)) {
            timelineItems.push({
              ...note,
              date: entry.date,
              isCurrent: false
            });
            processedNoteIds.add(note.noteId);
          }
        });
      }
    });

    // 3. Sort: Current/reviewed notes first, then historical notes by date descending.
    timelineItems.sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      if (a.date === 'Current Visit') return -1;
      if (b.date === 'Current Visit') return 1;
      return b.date.localeCompare(a.date);
    });

    return timelineItems;
  });

  viewedNote = computed<INoteTimelineItem | null>(() => {
    const selectedNoteId = this.state.selectedNoteId();
    if (!selectedNoteId) return null;
    return this.noteTimeline().find(n => n.noteId === selectedNoteId) || null;
  });

  canAddNote = computed(() => !this.state.viewingPastVisit());

  // Public signal for template binding
  formState = computed(() => ({
    painLevel: this.localPainLevel(),
    description: this.localDescription(),
    recommendation: this.localRecommendation()
  }));

  // Organ-Contextual Biometric Telemetry & Metabolic Panel (CMP) Mapping
  organContext = computed(() => {
    const partId = (this.state.selectedPartId() || '').toLowerCase();
    const vitals = this.state.vitals();
    const cmp = vitals.cmpLabs || {};

    if (partId.includes('heart') || partId.includes('cardiac') || partId === 'chest') {
      return {
        systemName: 'Cardiovascular',
        metrics: [
          { label: 'Blood Pressure', value: vitals.bp || '120/80', unit: 'mmHg', status: vitals.bp === '120/80' ? 'normal' : 'warning' },
          { label: 'Heart Rate', value: vitals.hr || '72', unit: 'bpm', status: parseInt(vitals.hr || '72') > 100 ? 'warning' : 'normal' },
          { label: 'Troponin I', value: cmp.troponinI || '0.02', unit: 'ng/mL', status: parseFloat(cmp.troponinI || '0.02') > 0.04 ? 'critical' : 'normal' },
          { label: 'NT-proBNP', value: cmp.ntProBnp || '85', unit: 'pg/mL', status: parseFloat(cmp.ntProBnp || '85') > 125 ? 'warning' : 'normal' }
        ],
        symptomChips: ['Substernal Tightness', 'Palpitations', 'Dyspnea on Exertion', 'Radiating Left Arm Pain', 'Irregular Rhythm']
      };
    } else if (partId.includes('lung') || partId.includes('pulmonary') || partId.includes('resp')) {
      return {
        systemName: 'Pulmonary / Respiratory',
        metrics: [
          { label: 'SpO2 Saturation', value: vitals.spO2 || '98', unit: '%', status: parseInt(vitals.spO2 || '98') < 95 ? 'critical' : 'normal' },
          { label: 'Respiration Rate', value: '16', unit: 'br/min', status: 'normal' },
          { label: 'Arterial PaO2', value: '92', unit: 'mmHg', status: 'normal' },
          { label: 'PaCO2 / pH', value: '40 / 7.41', unit: 'mmHg', status: 'normal' }
        ],
        symptomChips: ['Pleuritic Chest Pain', 'Wheezing', 'Productive Cough', 'Cyanosis', 'Shortness of Breath']
      };
    } else if (partId.includes('liver') || partId.includes('hepatic')) {
      return {
        systemName: 'Hepatic / Liver',
        metrics: [
          { label: 'Serum ALT', value: cmp.alt || '28', unit: 'U/L', status: parseFloat(cmp.alt || '28') > 55 ? 'warning' : 'normal' },
          { label: 'Serum AST', value: cmp.ast || '32', unit: 'U/L', status: parseFloat(cmp.ast || '32') > 48 ? 'warning' : 'normal' },
          { label: 'Alk Phos (ALP)', value: cmp.alp || '68', unit: 'U/L', status: 'normal' },
          { label: 'Total Bilirubin', value: cmp.totalBilirubin || '0.8', unit: 'mg/dL', status: 'normal' }
        ],
        symptomChips: ['Right Upper Quadrant Pain', 'Postprandial Nausea', 'Fatigue / Jaundice', 'Hepatomegaly']
      };
    } else if (partId.includes('kidney') || partId.includes('renal')) {
      return {
        systemName: 'Renal / Nephrology',
        metrics: [
          { label: 'eGFR', value: cmp.egfr || '94', unit: 'mL/min', status: parseFloat(cmp.egfr || '94') < 60 ? 'warning' : 'normal' },
          { label: 'Serum Creatinine', value: cmp.creatinine || '0.9', unit: 'mg/dL', status: 'normal' },
          { label: 'BUN', value: cmp.bun || '14', unit: 'mg/dL', status: 'normal' },
          { label: 'Sodium / Potassium', value: `${cmp.sodium || '139'} / ${cmp.potassium || '4.1'}`, unit: 'mEq/L', status: 'normal' }
        ],
        symptomChips: ['Flank / CVA Tenderness', 'Dysuria', 'Peripheral Edema', 'Foamy Urine']
      };
    } else if (partId.includes('stomach') || partId.includes('gastric') || partId.includes('abdomen')) {
      return {
        systemName: 'Gastrointestinal & Metabolic',
        metrics: [
          { label: 'Fasting Glucose', value: cmp.glucose || '92', unit: 'mg/dL', status: 'normal' },
          { label: 'Serum Lipase', value: cmp.lipase || '34', unit: 'U/L', status: 'normal' },
          { label: 'Amylase', value: cmp.amylase || '58', unit: 'U/L', status: 'normal' },
          { label: 'HbA1c', value: cmp.hba1c || '5.4', unit: '%', status: 'normal' }
        ],
        symptomChips: ['Epigastric Burning', 'Early Satiety', 'Abdominal Bloating', 'Acid Regurgitation', 'Nausea']
      };
    } else if (partId.includes('head') || partId.includes('brain') || partId.includes('skull')) {
      return {
        systemName: 'Neurological & Cranial',
        metrics: [
          { label: 'Blood Pressure', value: vitals.bp || '120/80', unit: 'mmHg', status: 'normal' },
          { label: 'EEG Coherence', value: '92', unit: '%', status: 'normal' },
          { label: 'Serum Sodium (Na+)', value: cmp.sodium || '139', unit: 'mEq/L', status: 'normal' },
          { label: 'SpO2', value: vitals.spO2 || '98', unit: '%', status: 'normal' }
        ],
        symptomChips: ['Pulsatile Headache', 'Photophobia', 'Cognitive Brain Fog', 'Vertigo / Dizziness', 'Neck Stiffness']
      };
    } else {
      return {
        systemName: 'Musculoskeletal & Inflammatory',
        metrics: [
          { label: 'hs-CRP Marker', value: cmp.hsCrp || '0.8', unit: 'mg/L', status: parseFloat(cmp.hsCrp || '0.8') > 3.0 ? 'warning' : 'normal' },
          { label: 'Serum Calcium', value: cmp.calcium || '9.4', unit: 'mg/dL', status: 'normal' },
          { label: 'Serum Uric Acid', value: cmp.uricAcid || '5.2', unit: 'mg/dL', status: 'normal' },
          { label: 'Vitamin D3', value: vitals.vitD3 || '45', unit: 'ng/mL', status: 'normal' }
        ],
        symptomChips: ['Joint Stiffness', 'Localized Tenderness', 'Radiating Neuropathic Pain', 'Swelling / Erythema']
      };
    }
  });

  appendSymptomChip(chipText: string) {
    const current = this.localDescription();
    const updated = current ? `${current}, ${chipText}` : chipText;
    this.localDescription.set(updated);
  }

  // Dirty checking to enable/disable the update button
  isDirty = computed(() => {
    const originalNote = this.viewedNote();
    if (!originalNote || !originalNote.isCurrent) return false;
    return this.localPainLevel() !== originalNote.painLevel || this.localDescription() !== originalNote.description || this.localRecommendation() !== (originalNote.recommendation || '');
  });

  otherActiveIssues = computed(() => {
    const allIssues = this.state.issues();
    const selectedId = this.state.selectedPartId();
    if (!selectedId) return [];
    return Object.values(allIssues).flat().filter(issue => issue.id !== selectedId && issue.painLevel > 0);
  });

  private selectedPatientHistory = computed(() => {
    const selectedId = this.patientManager.selectedPatientId();
    if (!selectedId) return [];
    return this.patientManager.patients().find(p => p.id === selectedId)?.history || [];
  });

  private intel = inject(ClinicalIntelligenceService);
  private markdownService = inject(MarkdownService);

  aiInsights = computed(() => {
    const report = this.intel.analysisResults()['Summary Overview'];
    if (!report) return [];

    const partName = this.state.selectedPartId() ? this.state.selectedPartName() : '';
    if (!partName) return [];

    try {
      const parser = this.markdownService.parser();
      if (!parser) return [];
      const tokens = parser.lexer(report);
      const relevantNodes: any[] = [];
      const partWords = partName.toLowerCase().split(' ');

      tokens.forEach((token: any) => {
        const text = token.text || token.raw || '';
        const lowercaseText = text.toLowerCase();

        // Find if the body part name exists in this token
        if (partWords.some(word => lowercaseText.includes(word))) {
          if (token.type === 'paragraph') {
            relevantNodes.push({
              id: `ai-${Math.random()}`,
              type: 'paragraph',
              rawHtml: parser.parseInline(token.text)
            });
          } else if (token.type === 'list') {
            relevantNodes.push({
              id: `ai-${Math.random()}`,
              type: 'list',
              items: token.items.map((it: any) => ({
                id: `ai-item-${Math.random()}`,
                html: parser.parseInline(it.text)
              }))
            });
          } else if (token.type === 'table' || token.type === 'blockquote' || token.type === 'html') {
            relevantNodes.push({
              id: `ai-${Math.random()}`,
              type: 'raw',
              rawHtml: parser.parse(token.raw)
            });
          }
        }
      });
      return relevantNodes;
    } catch (e) {
      return [];
    }
  });

  private lastSyncedNoteId: string | null = null;

  constructor() {
    // Sync local state when the selected issue changes from the global state
    effect(() => {
      const note = this.viewedNote();
      const currentId = this.state.selectedNoteId();
      // Use untracked for local signal writes to prevent infinite loops from local state changes.
      untracked(() => {
        if (this.lastSyncedNoteId !== currentId || !this.isDirty()) {
          this.localPainLevel.set(note?.painLevel ?? 0);
          this.localDescription.set(note?.description ?? '');
          this.localRecommendation.set(note?.recommendation ?? '');
          this.lastSyncedNoteId = currentId;
        }
      });
    });

    // Auto-select note when a part is selected (auto-create is moved to body-viewer where the click happens)
    effect(() => {
      const partId = this.state.selectedPartId();
      const currentNoteId = this.state.selectedNoteId();

      if (partId && !currentNoteId) {
        untracked(() => {
          const timeline = this.noteTimeline();
          const currentVisitNote = timeline.find(n => n.isCurrent);
          if (currentVisitNote) {
            this.state.selectNote(currentVisitNote.noteId);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    // No local cleanup needed for service-based dictation
  }

  openDictation() {
    this.dictation.openDictationModal(this.localDescription(), (text) => {
      // 0. Check for commands (Switch body part or New Note)
      const command = this.parseVoiceCommand(text);
      if (command) {
        if (command.action === 'switch_and_note' && command.partId) {
          this.switchPartAndCreateNote(command.partId, command.remaining);
        } else if (command.action === 'new_note') {
          const currentPartId = this.state.selectedPartId();
          if (currentPartId) {
            this.switchPartAndCreateNote(currentPartId, command.remaining);
          }
        }
        return;
      }

      // 1. Parse for pain level
      const painMatch = text.match(/pain (?:level|score|is|rated)?\s*(\d+)/i) || text.match(/(\d+)\s*(?:\/|out of)\s*10/i);
      if (painMatch) {
        let level = parseInt(painMatch[1], 10);
        if (!isNaN(level)) {
          // Clamp between 0 and 10
          level = Math.max(0, Math.min(10, level));
          this.localPainLevel.set(level);
        }
      }

      // 2. Set description
      this.updateDescManual(text);
    });
  }

  openRecDictation() {
    this.dictation.openDictationModal(this.localRecommendation(), (text) => {
      this.updateRecManual(text);
    });
  }

  private parseVoiceCommand(text: string): { action: 'switch_and_note' | 'new_note', partId?: string, remaining: string } | null {
    const lower = text.toLowerCase().trim();

    // Check for "new note" without a specific body part
    if (lower === 'new note' || (lower.startsWith('new note ') && !lower.startsWith('new note for '))) {
      let remaining = text.substring(8).trim();
      remaining = remaining.replace(/^[\.,\-\s]+/, '');
      if (remaining.length > 0) {
        remaining = remaining.charAt(0).toUpperCase() + remaining.slice(1);
      }
      return { action: 'new_note', remaining };
    }

    const prefixMatch = lower.match(/^(?:switch to|select|go to|new note for|note for)\s+/);

    if (prefixMatch) {
      const contentStart = prefixMatch[0].length;
      const content = lower.substring(contentStart);

      // Sort keys by length descending to match specific parts first (e.g. "right upper leg" before "right leg")
      const keys = Object.keys(BODY_PART_MAPPING).sort((a, b) => b.length - a.length);

      for (const key of keys) {
        if (content.startsWith(key)) {
          const partId = BODY_PART_MAPPING[key];
          // Get original text casing for the remaining part
          let remaining = text.substring(contentStart + key.length).trim();
          // Remove leading punctuation
          remaining = remaining.replace(/^[\.,\-\s]+/, '');
          // Capitalize first letter of remaining text
          if (remaining.length > 0) {
            remaining = remaining.charAt(0).toUpperCase() + remaining.slice(1);
          }
          return { action: 'switch_and_note', partId, remaining };
        }
      }
    }
    return null;
  }

  private switchPartAndCreateNote(partId: string, text: string) {
    // 1. Parse pain from the new text
    let painLevel = 0;
    const painMatch = text.match(/pain (?:level|score|is|rated)?\s*(\d+)/i) || text.match(/(\d+)\s*(?:\/|out of)\s*10/i);
    if (painMatch) {
      let level = parseInt(painMatch[1], 10);
      if (!isNaN(level)) {
        painLevel = Math.max(0, Math.min(10, level));
      }
    }

    // 2. Select the new part
    this.state.selectPart(partId);

    // 3. Create a new note immediately
    const partName = Object.keys(BODY_PART_MAPPING).find(key => BODY_PART_MAPPING[key] === partId)?.toUpperCase() || 'Selection';

    const newNoteId = `note_${Date.now()}`;
    const newNote: IBodyPartIssue = {
      id: partId,
      noteId: newNoteId,
      name: partName, // This might be "right knee" etc.
      painLevel: painLevel,
      description: text,
      symptoms: [],
      recommendation: ''
    };

    // 4. Update state with the new note
    this.state.updateIssue(partId, newNote);

    // 5. Select the new note
    this.state.selectNote(newNoteId);
  }

  close() {
    this.state.selectPart(null);
  }

  updateEntry() {
    const note = this.viewedNote();
    if (!note || !note.isCurrent || !this.isDirty()) return;

    const patientId = this.patientManager.selectedPatientId();
    if (patientId) {
      const description = this.localDescription().trim();
      const pain = this.localPainLevel();
      let summary = `Note for ${note.name}`;
      if (description) {
        summary += `: "${description.substring(0, 40).replace(/\n/g, ' ')}..."`;
      }
      summary += ` (Pain: ${pain}/10)`;

      const historyEntry: HistoryEntry = {
        type: 'NoteCreated',
        date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        summary: summary,
        partId: note.id,
        noteId: note.noteId,
      };
      this.patientManager.updateHistoryEntry(
        patientId,
        historyEntry,
        (e) => e.type === 'NoteCreated' && e.noteId === note.noteId
      );
    }

    this.state.updateIssue(note.id, {
      ...note,
      painLevel: this.localPainLevel(),
      description: this.localDescription(),
      recommendation: this.localRecommendation()
    });
  }

  addNewNote() {
    if (!this.canAddNote()) return;
    const partId = this.state.selectedPartId();
    if (!partId) return;

    const partName = this.noteTimeline()[0]?.name || this.viewedNote()?.name || 'Selection';

    const newNoteId = `note_${Date.now()}`;
    const newNote: IBodyPartIssue = {
      id: partId,
      noteId: newNoteId,
      name: partName,
      painLevel: 0,
      description: '',
      symptoms: [],
      recommendation: ''
    };
    this.state.updateIssue(partId, newNote);
    this.state.selectNote(newNoteId);
  }

  selectNote(noteId: string) {
    this.state.selectNote(noteId);
  }

  updatePain(event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.localPainLevel.set(val);
    const currentNote = this.viewedNote();
    if (currentNote && currentNote.isCurrent) {
      this.state.updateIssue(currentNote.id, { ...currentNote, painLevel: val });
    }
  }

  updateTcmField(field: string, event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.state.updateTcmIntake({ [field]: val });
  }

  updateAyurvedicField(field: string, event: Event) {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const val = target.type === 'range' ? parseInt(target.value, 10) : target.value;
    this.state.updateAyurvedicIntake({ [field]: val });
  }

  updateDesc(event: Event) {
    const text = (event.target as HTMLTextAreaElement).value;
    this.updateDescManual(text);
  }

  updateDescManual(text: string) {
    this.localDescription.set(text);
    const currentNote = this.viewedNote();
    if (currentNote && currentNote.isCurrent) {
      this.state.updateIssue(currentNote.id, { ...currentNote, description: text });
    }
  }

  updateRec(event: Event) {
    const text = (event.target as HTMLTextAreaElement).value;
    this.updateRecManual(text);
  }

  updateRecManual(text: string) {
    this.localRecommendation.set(text);
    const currentNote = this.viewedNote();
    if (currentNote && currentNote.isCurrent) {
      this.state.updateIssue(currentNote.id, { ...currentNote, recommendation: text });
    }
  }

  addToPatientSummary() {
    const rec = this.localRecommendation().trim();
    const currentNote = this.viewedNote();
    if (rec && currentNote) {
      this.state.addDraftSummaryItem(currentNote.id, rec);
    }
  }

  deleteNote(noteToDelete: INoteTimelineItem) {
    if (!noteToDelete.isCurrent) return;

    // 1. Add deletion record to history
    const patientId = this.patientManager.selectedPatientId();
    if (patientId) {
      let summary = `Note deleted for ${noteToDelete.name} (Pain: ${noteToDelete.painLevel}/10).`;
      if (noteToDelete.description) {
        summary = `Note deleted for ${noteToDelete.name}: "${noteToDelete.description.substring(0, 30)}..." (Pain: ${noteToDelete.painLevel}/10).`;
      }
      const historyEntry: HistoryEntry = {
        type: 'NoteDeleted',
        date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        summary: summary,
        partId: noteToDelete.id,
        noteId: noteToDelete.noteId,
      };
      this.patientManager.addHistoryEntry(patientId, historyEntry);
    }

    // 2. Remove from local state (this will trigger computed signal updates)
    this.state.removeIssueNote(noteToDelete.id, noteToDelete.noteId);

    // 3. Select next note or deselect part, using the now-updated timeline
    const timeline = this.noteTimeline();
    const currentNotesForPart = timeline.filter(n => n.id === noteToDelete.id && n.isCurrent);

    if (this.state.selectedNoteId() === noteToDelete.noteId) {
      if (currentNotesForPart.length > 0) {
        this.state.selectNote(currentNotesForPart[0].noteId);
      } else {
        const historicalNotesForPart = timeline.filter(n => n.id === noteToDelete.id);
        if (historicalNotesForPart.length > 0) {
          this.state.selectNote(historicalNotesForPart[0].noteId);
        } else {
          this.state.selectPart(null);
        }
      }
    }
  }

  copyNotesToClipboard() {
    let text = this.localDescription();
    const rec = this.localRecommendation();
    if (rec) text = text ? `${text}\n\nRecommendation:\n${rec}` : `Recommendation:\n${rec}`;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.justCopied.set(true);
      setTimeout(() => this.justCopied.set(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }

  copyRecToClipboard() {
    const text = this.localRecommendation();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.justCopiedRec.set(true);
      setTimeout(() => this.justCopiedRec.set(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }

  adoptInsight(node: any, target: 'desc' | 'rec' = 'desc') {
    let text = '';
    if (node.type === 'paragraph') {
      let raw = node.rawHtml || '';
      while (/<[^>]*>/.test(raw)) {
        raw = raw.replace(/<[^>]*>/g, '');
      }
      text = raw.trim();
    } else if (node.type === 'list') {
      text = (node.items || []).map((it: any) => {
        let htmlStr = it.html || '';
        while (/<[^>]*>/.test(htmlStr)) {
          htmlStr = htmlStr.replace(/<[^>]*>/g, '');
        }
        return '• ' + htmlStr.trim();
      }).join('\n');
    }

    if (target === 'desc') {
      const currentText = this.localDescription();
      this.localDescription.set(currentText ? currentText + '\n\n' + text : text);
    } else {
      const currentText = this.localRecommendation();
      this.localRecommendation.set(currentText ? currentText + '\n\n' + text : text);
    }
  }
}
