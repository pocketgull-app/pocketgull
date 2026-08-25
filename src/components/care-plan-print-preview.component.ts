import { Component, ChangeDetectionStrategy, signal, computed, inject, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { ExportService } from '../services/export.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { ClinicalDataCardComponent } from './clinical-data-card.component';
import { generate } from 'lean-qr';

export interface IPrintPageThumbnail {
  pageNumber: number;
  title: string;
  subtitle: string;
  icon: string;
  previewSummary: string;
  category: 'Summary' | 'Comparison' | 'Protocols' | 'Nutrition';
}

@Component({
  selector: 'app-care-plan-print-preview',
  standalone: true,
  imports: [CommonModule, ClinicalDataCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-xl mb-8 font-sans">
      
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5 mb-6">
        <div>
          <div class="flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse"></span>
            <h2 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase font-mono">
              🖨️ Care Plan Print Studio & Document Carousel
            </h2>
            <span class="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
              Multimodal PDF Engine
            </span>
          </div>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 font-mono">
            Interactive Print Carousel • Side-by-Side Philosophy Comparison • Custom Section Toggles
          </p>
        </div>

        <!-- Action Buttons: Print PDF & Edit Mode Toggle -->
        <div class="flex items-center gap-2 font-mono">
          <button (click)="toggleEditBox()"
            class="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold uppercase transition active:scale-95 cursor-pointer border border-zinc-200/80 dark:border-zinc-700 flex items-center gap-1.5">
            <span>✏️</span>
            <span>{{ isEditBoxOpen() ? 'Close Edit Box' : 'Edit Care Plan Notes' }}</span>
          </button>

          <button (click)="triggerPrintPdf()"
            class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-md active:scale-95 cursor-pointer flex items-center gap-2">
            <span>🖨️</span>
            <span>Print Care Plan PDF</span>
          </button>
        </div>
      </div>

      <!-- Language / Philosophy & Cognitive Literacy Selector Buttons -->
      <div class="mb-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 font-mono text-xs">
        <div class="space-y-2">
          <!-- Medical Philosophy Selector -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
              🌐 Diagnostic Philosophy:
            </span>
            <button (click)="selectPhilosophy('western')"
              [class.bg-sky-600]="activePhilosophy() === 'western'"
              [class.text-white]="activePhilosophy() === 'western'"
              [class.bg-zinc-200]="activePhilosophy() !== 'western'"
              [class.text-zinc-700]="activePhilosophy() !== 'western'"
              [class.dark:bg-zinc-800]="activePhilosophy() !== 'western'"
              [class.dark:text-zinc-300]="activePhilosophy() !== 'western'"
              aria-label="Select Western Allopathic Philosophy"
              class="px-2.5 py-2 min-h-[44px] rounded-lg font-bold uppercase tracking-wider transition cursor-pointer border border-transparent flex items-center">
              🔵 Western Allopathic
            </button>
            <button (click)="selectPhilosophy('eastern')"
              [class.bg-emerald-600]="activePhilosophy() === 'eastern'"
              [class.text-white]="activePhilosophy() === 'eastern'"
              [class.bg-zinc-200]="activePhilosophy() !== 'eastern'"
              [class.text-zinc-700]="activePhilosophy() !== 'eastern'"
              [class.dark:bg-zinc-800]="activePhilosophy() !== 'eastern'"
              [class.dark:text-zinc-300]="activePhilosophy() !== 'eastern'"
              aria-label="Select Eastern TCM Philosophy"
              class="px-2.5 py-2 min-h-[44px] rounded-lg font-bold uppercase tracking-wider transition cursor-pointer border border-transparent flex items-center">
              🟢 Eastern (TCM)
            </button>
            <button (click)="selectPhilosophy('ayurvedic')"
              [class.bg-amber-600]="activePhilosophy() === 'ayurvedic'"
              [class.text-white]="activePhilosophy() === 'ayurvedic'"
              [class.bg-zinc-200]="activePhilosophy() !== 'ayurvedic'"
              [class.text-zinc-700]="activePhilosophy() !== 'ayurvedic'"
              [class.dark:bg-zinc-800]="activePhilosophy() !== 'ayurvedic'"
              [class.dark:text-zinc-300]="activePhilosophy() !== 'ayurvedic'"
              aria-label="Select Ayurvedic Medicine Philosophy"
              class="px-2.5 py-2 min-h-[44px] rounded-lg font-bold uppercase tracking-wider transition cursor-pointer border border-transparent flex items-center">
              🟡 Ayurvedic Medicine
            </button>
            <button (click)="selectPhilosophy('osteopathic')"
              [class.bg-purple-600]="activePhilosophy() === 'osteopathic'"
              [class.text-white]="activePhilosophy() === 'osteopathic'"
              [class.bg-zinc-200]="activePhilosophy() !== 'osteopathic'"
              [class.text-zinc-700]="activePhilosophy() !== 'osteopathic'"
              [class.dark:bg-zinc-800]="activePhilosophy() !== 'osteopathic'"
              [class.dark:text-zinc-300]="activePhilosophy() !== 'osteopathic'"
              aria-label="Select Osteopathic Medicine Philosophy"
              class="px-2.5 py-2 min-h-[44px] rounded-lg font-bold uppercase tracking-wider transition cursor-pointer border border-transparent flex items-center">
              🦴 Osteopathic Medicine
            </button>
          </div>

          <!-- Cognitive Assessment Export Level Selector -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
              🧠 Cognitive Assessment Level:
            </span>
            <button (click)="selectCognitiveLevel('standard')"
              [class.bg-indigo-600]="activeCognitiveLevel() === 'standard'"
              [class.text-white]="activeCognitiveLevel() === 'standard'"
              [class.bg-zinc-200]="activeCognitiveLevel() !== 'standard'"
              [class.text-zinc-700]="activeCognitiveLevel() !== 'standard'"
              [class.dark:bg-zinc-800]="activeCognitiveLevel() !== 'standard'"
              [class.dark:text-zinc-300]="activeCognitiveLevel() !== 'standard'"
              class="px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider transition cursor-pointer border border-transparent">
              ⚙️ Standard MD
            </button>
            <button (click)="selectCognitiveLevel('simplified')"
              [class.bg-teal-600]="activeCognitiveLevel() === 'simplified'"
              [class.text-white]="activeCognitiveLevel() === 'simplified'"
              [class.bg-zinc-200]="activeCognitiveLevel() !== 'simplified'"
              [class.text-zinc-700]="activeCognitiveLevel() !== 'simplified'"
              [class.dark:bg-zinc-800]="activeCognitiveLevel() !== 'simplified'"
              [class.dark:text-zinc-300]="activeCognitiveLevel() !== 'simplified'"
              class="px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider transition cursor-pointer border border-transparent">
              📄 Simplified Grade 8
            </button>
            <button (click)="selectCognitiveLevel('dyslexia')"
              [class.bg-orange-600]="activeCognitiveLevel() === 'dyslexia'"
              [class.text-white]="activeCognitiveLevel() === 'dyslexia'"
              [class.bg-zinc-200]="activeCognitiveLevel() !== 'dyslexia'"
              [class.text-zinc-700]="activeCognitiveLevel() !== 'dyslexia'"
              [class.dark:bg-zinc-800]="activeCognitiveLevel() !== 'dyslexia'"
              [class.dark:text-zinc-300]="activeCognitiveLevel() !== 'dyslexia'"
              class="px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider transition cursor-pointer border border-transparent">
              📖 Dyslexia-Friendly
            </button>
            <button (click)="selectCognitiveLevel('child')"
              [class.bg-purple-600]="activeCognitiveLevel() === 'child'"
              [class.text-white]="activeCognitiveLevel() === 'child'"
              [class.bg-zinc-200]="activeCognitiveLevel() !== 'child'"
              [class.text-zinc-700]="activeCognitiveLevel() !== 'child'"
              [class.dark:bg-zinc-800]="activeCognitiveLevel() !== 'child'"
              [class.dark:text-zinc-300]="activeCognitiveLevel() !== 'child'"
              class="px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider transition cursor-pointer border border-transparent">
              🧸 Child-Friendly (Grade 4)
            </button>
          </div>
        </div>

        <div class="text-right text-[11px] text-zinc-500 dark:text-zinc-400">
          <span>Active Patient: <strong class="text-zinc-800 dark:text-zinc-200">{{ activePatientName() }}</strong></span>
        </div>
      </div>

      <!-- Prescribed Clinical Apps & Interventions Summary Drawer -->
      @if (patientState.prescribedToolsList().length > 0) {
        <div class="mb-6 p-5 rounded-2xl bg-[#FFFDF8] dark:bg-zinc-950 text-[#1C1C1C] dark:text-zinc-100 border-2 border-[#1C1C1C] dark:border-zinc-700 shadow-[3px_4px_0px_0px_rgba(28,28,28,0.85)] font-mono sub-panel">
          <div class="flex items-center justify-between border-b-2 border-[#1C1C1C] pb-3 mb-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">💊</span>
              <h3 class="text-xs font-black uppercase tracking-wider">Active Prescribed Clinical Apps & Interventions ({{ patientState.prescribedToolsList().length }})</h3>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-md bg-[#10B981] text-white font-bold uppercase">Care Plan Attached</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            @for (tool of patientState.prescribedToolsList(); track tool.id) {
              <div class="p-4 rounded-xl border-2 border-[#1C1C1C] bg-white dark:bg-zinc-900 shadow-[2px_2px_0px_0px_rgba(28,28,28,0.8)] space-y-2">
                <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xl shrink-0">{{ tool.icon }}</span>
                    <div class="overflow-hidden font-sans">
                      <strong class="block text-xs font-bold text-[#1C1C1C] dark:text-zinc-100 truncate">{{ tool.name }}</strong>
                      <span class="block text-[9.5px] text-emerald-700 dark:text-emerald-400 font-mono uppercase font-black">{{ tool.category }}</span>
                    </div>
                  </div>
                  <span class="text-[9.5px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 uppercase">
                    Prescribed
                  </span>
                </div>

                <!-- Personalized Instructions & Suggested Usage -->
                <div class="space-y-1.5 font-sans text-xs">
                  <div class="p-2 rounded-lg bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/40 text-[11px]">
                    <strong class="font-mono text-[9.5px] uppercase text-sky-700 dark:text-sky-400 block font-bold">👨‍⚕️ Clinical Directive:</strong>
                    <span class="text-zinc-800 dark:text-zinc-200 leading-relaxed">{{ tool.personalizedInstruction }}</span>
                  </div>

                  <div class="flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-mono pt-1 text-zinc-600 dark:text-zinc-400">
                    <span>⏱️ <strong>Suggested Usage:</strong> {{ tool.suggestedUsage }}</span>
                  </div>

                  <div class="p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px]">
                    <strong class="font-mono text-[9.5px] uppercase text-emerald-700 dark:text-emerald-400 block font-bold">💡 Patient Self-Care Tip:</strong>
                    <span class="text-zinc-800 dark:text-zinc-200 leading-relaxed">{{ tool.patientCareTip }}</span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Mobile Patient Access QR Code -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t-2 border-dashed border-[#1C1C1C] dark:border-zinc-800 text-xs font-mono">
            <div>
              <span class="font-black text-zinc-900 dark:text-zinc-100 block uppercase tracking-wider">📱 Mobile Patient Access QR Code</span>
              <span class="text-[11px] text-zinc-600 dark:text-zinc-400 font-sans block mt-0.5">
                Scan with any smartphone camera to open this archived Care Plan & interactive tools directly on mobile.
              </span>
            </div>
            
            <div class="shrink-0 flex items-center gap-3 p-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-300 dark:border-zinc-700 shadow-sm">
              <div #qrContainer class="w-20 h-20 bg-white p-1 rounded-md flex items-center justify-center"></div>
              <div class="text-[10px] text-zinc-700 dark:text-zinc-300 space-y-0.5 font-mono">
                <span class="block font-bold text-emerald-700 dark:text-emerald-400">STATUS: VERIFIED</span>
                <span class="block text-zinc-500">ID: {{ patientState.patientId() || 'P_001' }}</span>
                <span class="block text-zinc-500">Tools: {{ patientState.prescribedToolsList().length }} active</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Compact Edit Box (Replaces Raw Code Dump) -->
      @if (isEditBoxOpen()) {
        <div class="mb-6 p-5 rounded-2xl bg-zinc-950 text-zinc-100 border border-zinc-800 font-mono animate-in fade-in duration-200">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3 text-xs">
            <span class="font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              ✏️ Compact Care Plan Note Editor
            </span>
            <span class="text-[10px] text-zinc-500">Auto-saves to patient history</span>
          </div>

          <textarea 
            rows="4" 
            [value]="editableNotes()" 
            (input)="updateNotes($event)"
            placeholder="Type additional clinical instructions or notes to include in the printed Care Plan..."
            class="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500 resize-y mb-3">
          </textarea>

          <div class="flex items-center justify-between text-[11px]">
            <span class="text-zinc-400">Word count: {{ editableNotes().split(' ').length }} words</span>
            <button (click)="saveNotes()" 
              class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[10px] tracking-wider transition cursor-pointer">
              💾 Save Notes to Plan
            </button>
          </div>
        </div>
      }

      <!-- Interactive Section Toggle Switches -->
      <div class="mb-8 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/80 font-mono text-xs">
        <span class="block font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
          🎛️ Customize Printed Document Sections (Toggle Switches):
        </span>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" [checked]="toggleVitals()" (change)="toggleVitals.set(!toggleVitals())" class="rounded accent-emerald-500 w-4 h-4" />
            <span class="text-zinc-700 dark:text-zinc-300">Vitals & Telemetry</span>
          </label>

          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" [checked]="toggleSideBySide()" (change)="toggleSideBySide.set(!toggleSideBySide())" class="rounded accent-emerald-500 w-4 h-4" />
            <span class="text-zinc-700 dark:text-zinc-300">Side-by-Side Comparison</span>
          </label>

          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" [checked]="toggleAvs()" (change)="toggleAvs.set(!toggleAvs())" class="rounded accent-emerald-500 w-4 h-4" />
            <span class="text-zinc-700 dark:text-zinc-300">AVS Protocols</span>
          </label>

          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" [checked]="toggleNutrition()" (change)="toggleNutrition.set(!toggleNutrition())" class="rounded accent-emerald-500 w-4 h-4" />
            <span class="text-zinc-700 dark:text-zinc-300">Chrono-Nutrition</span>
          </label>

          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" [checked]="toggleGenomics()" (change)="toggleGenomics.set(!toggleGenomics())" class="rounded accent-emerald-500 w-4 h-4" />
            <span class="text-zinc-700 dark:text-zinc-300">GCN Genomics</span>
          </label>
        </div>
      </div>

      <!-- Print Page Thumbnail Carousel -->
      <div>
        <div class="flex items-center justify-between mb-4 font-mono">
          <span class="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            📄 Care Plan Printed Document Carousel Preview (Page {{ activePageIndex() + 1 }} of {{ printPages.length }})
          </span>

          <div class="flex items-center gap-2">
            <button (click)="prevPage()" [disabled]="activePageIndex() === 0"
              class="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold uppercase disabled:opacity-40 cursor-pointer">
              ◀ Prev Page
            </button>
            <button (click)="nextPage()" [disabled]="activePageIndex() === printPages.length - 1"
              class="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold uppercase disabled:opacity-40 cursor-pointer">
              Next Page ▶
            </button>
          </div>
        </div>

        <!-- Carousel Page Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (page of printPages; track page.pageNumber; let idx = $index) {
            <div (click)="activePageIndex.set(idx)"
              [class.ring-2]="activePageIndex() === idx"
              [class.ring-emerald-500]="activePageIndex() === idx"
              class="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between h-64 font-mono relative overflow-hidden group">
              
              <div>
                <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">
                  <span class="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase">Page {{ page.pageNumber }}</span>
                  <span class="text-base">{{ page.icon }}</span>
                </div>

                <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-emerald-500 transition-colors">
                  {{ page.title }}
                </h4>
                <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase block mb-2">
                  {{ page.subtitle }}
                </span>

                <p class="text-[11px] text-zinc-600 dark:text-zinc-400 leading-tight font-sans line-clamp-4">
                  {{ page.previewSummary }}
                </p>
              </div>

              <!-- Page Footer Tag -->
              <div class="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-[9px] text-zinc-400 uppercase tracking-wider flex justify-between">
                <span>{{ page.category }}</span>
                <span>Click to Preview</span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Active Selected Page Detailed Full View Preview -->
      @let currentPage = printPages[activePageIndex()];
      <div class="mt-8 p-6 bg-zinc-950 rounded-3xl border border-zinc-800 text-zinc-100 font-mono shadow-2xl">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ currentPage.icon }}</span>
            <div>
              <h3 class="text-base font-bold uppercase tracking-wider">Page {{ currentPage.pageNumber }}: {{ currentPage.title }}</h3>
              <span class="text-xs text-emerald-400 font-bold">{{ currentPage.subtitle }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 text-xs">
            <span class="px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
              Language: {{ activePhilosophy() | uppercase }}
            </span>
          </div>
        </div>

        <!-- Rendered Page Mockup -->
        <div class="p-6 bg-white text-zinc-900 rounded-2xl shadow-inner font-sans text-xs space-y-4 max-h-96 overflow-y-auto">
          @if (currentPage.pageNumber === 1) {
            <div>
              <h1 class="text-lg font-bold border-b pb-2 mb-2">POCKET GULL CLINICAL CARE PLAN — {{ activePatientName() }}</h1>
              <p class="mb-2"><strong>Patient Vitals:</strong> {{ patientState.vitals().bp ? 'BP ' + patientState.vitals().bp + ' | ' : '' }} {{ patientState.vitals().hr ? 'HR ' + patientState.vitals().hr + ' bpm | ' : '' }} SpO2 98%</p>
              <p><strong>Primary Philosophy:</strong> {{ activePhilosophy() | titlecase }} Clinical Intelligence</p>
              <div class="p-3 bg-zinc-100 rounded border mt-3">
                <strong>Clinician Care Notes:</strong> {{ editableNotes() || 'No additional notes provided.' }}
              </div>
            </div>
          } @else if (currentPage.pageNumber === 2) {
            <div>
              <h2 class="text-sm font-bold border-b pb-1 mb-3">MULTIMODAL SIDE-BY-SIDE PHILOSOPHY COMPARISON</h2>
              <div class="grid grid-cols-3 gap-3 text-[11px] font-mono">
                <div class="p-2.5 bg-sky-50 rounded border border-sky-200">
                  <strong class="text-sky-700 block mb-1">🔵 Western Allopathic</strong>
                  <span>Biomarker analysis, ICD-10 coding, and GCN receptor pharmacokinetics.</span>
                </div>
                <div class="p-2.5 bg-emerald-50 rounded border border-emerald-200">
                  <strong class="text-emerald-700 block mb-1">🟢 Eastern (TCM)</strong>
                  <span>Spleen Qi & Blood tonification, Meridian energy flow, and Xiao Ke Wan herbal formulas.</span>
                </div>
                <div class="p-2.5 bg-amber-50 rounded border border-amber-200">
                  <strong class="text-amber-700 block mb-1">🟡 Ayurvedic Medicine</strong>
                  <span>Prakriti/Vikriti dosha assessment, Agni fire activation, and Nisha Amalaki rasayana.</span>
                </div>
              </div>
            </div>
          } @else if (currentPage.pageNumber === 3) {
            <div>
              <h2 class="text-sm font-bold border-b pb-1 mb-2">FUNCTIONAL PROTOCOLS & AVS NEURO-THERAPY</h2>
              <p><strong>Resonant Breathing Cadence:</strong> {{ patientState.avsBreathingRate() }} bpm (0.1 Hz Baroreflex Vagal Tone Peak)</p>
              <p><strong>Brainwave Entrainment:</strong> {{ patientState.avsBrainwaveFrequency() | titlecase }} ({{ patientState.avsBrainwaveFrequencyHz() }} Hz)</p>
            </div>
          } @else if (currentPage.pageNumber === 4) {
            <div>
              <h2 class="text-sm font-bold border-b pb-1 mb-2">CHRONO-NUTRITION & DIETER RAMS CLINICAL MENU</h2>
              <p><strong>Circadian Pathway:</strong> BMAL1 / CLOCK Peripheral Organ Gene Synchronization</p>
              <p><strong>Prescribed Menu:</strong> 🥑 Avocado Carpaccio, 🍣 Wild Salmon with Turmeric, 🫖 Gingerol Decoction, 🫐 Blueberry Compote</p>
            </div>
          } @else {
            <div class="space-y-3">
              <h2 class="text-sm font-bold border-b pb-1 mb-2">PAIR DATA CARDS & HEALTHSHEET TRANSPARENCY (arXiv:2202.13028)</h2>
              <app-clinical-data-card></app-clinical-data-card>
            </div>
          }
        </div>
      </div>

    </div>
  `
})
export class CarePlanPrintPreviewComponent {
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);
  exportService = inject(ExportService);
  intelligence = inject(ClinicalIntelligenceService);

  isEditBoxOpen = signal<boolean>(false);
  activePageIndex = signal<number>(0);
  editableNotes = signal<string>('Patient demonstrates stable cardiovascular parameters. Recommend continuing daily 0.1 Hz vagal resonant breathing and high-polyphenol Chrono-Nutrition regimen.');

  // Toggle Switches for Print Sections
  toggleVitals = signal<boolean>(true);
  toggleSideBySide = signal<boolean>(true);
  toggleAvs = signal<boolean>(true);
  toggleNutrition = signal<boolean>(true);
  toggleGenomics = signal<boolean>(true);

  activePhilosophy = computed(() => this.patientState.activePhilosophy());
  activeCognitiveLevel = computed(() => this.patientState.selectedCognitiveLevel());

  activePatientName = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return 'Charles Darwin';
    const patient = this.patientManagement.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Charles Darwin';
  });

  qrContainer = viewChild<ElementRef<HTMLDivElement>>('qrContainer');

  constructor() {
    effect(() => {
      if (this.qrContainer()) {
        this.renderQrCode();
      }
    });
  }

  renderQrCode() {
    const container = this.qrContainer()?.nativeElement;
    if (!container) return;
    container.innerHTML = '';

    const prescribedCsv = this.patientState.prescribedToolsList().map(t => t.id).join(',');
    const payload = `https://pocketgull.app/careplan?id=${this.patientState.patientId() || 'p001'}&tools=${prescribedCsv}&mode=${this.activeCognitiveLevel()}&phil=${this.activePhilosophy()}`;
    
    try {
      const code = generate(payload);
      const canvas = document.createElement('canvas');
      canvas.width = 80;
      canvas.height = 80;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const size = code.size;
        const scale = canvas.width / size;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#18181b';

        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            if (code.get(x, y)) {
              ctx.fillRect(Math.floor(x * scale), Math.floor(y * scale), Math.ceil(scale), Math.ceil(scale));
            }
          }
        }
      }
      container.appendChild(canvas);
    } catch (e) {
      console.warn('QR Code generation notice:', e);
    }
  }

  printPages: IPrintPageThumbnail[] = [
    {
      pageNumber: 1,
      title: 'Clinical Care Plan & Vitals',
      subtitle: 'Patient Telemetry & Summary Notes',
      icon: '📋',
      previewSummary: 'Patient summary, blood pressure, heart rate, chief complaint, and clinician care notes.',
      category: 'Summary'
    },
    {
      pageNumber: 2,
      title: 'Side-by-Side Philosophy Comparison',
      subtitle: 'Western vs Eastern vs Ayurvedic',
      icon: '📊',
      previewSummary: 'Comparative 3-column analysis contrasting Allopathic, TCM Meridian, and Ayurvedic Dosha diagnostics.',
      category: 'Comparison'
    },
    {
      pageNumber: 3,
      title: 'Functional Protocols & AVS Session',
      subtitle: '0.1 Hz Vagal Breathing & Entrainment',
      icon: '🧠',
      previewSummary: 'Audio-Visual Stimulation therapy parameters, baroreflex peak resonance, and brainwave entrainment targets.',
      category: 'Protocols'
    },
    {
      pageNumber: 4,
      title: 'Chrono-Nutrition & Clinical Menu',
      subtitle: 'BMAL1 Clock Genes & Rams Menu',
      icon: '🥑',
      previewSummary: '24-Hour Circadian meal timing clock, glycemic index ratings, and prescribed Dieter Rams clinical menu items.',
      category: 'Nutrition'
    },
    {
      pageNumber: 5,
      title: 'PAIR Data Cards & Healthsheets',
      subtitle: 'arXiv:2202.13028 Transparency',
      icon: '🏷️',
      previewSummary: 'Dataset provenance, subgroup fairness metrics, missingness ratio, and human clinician verification mandate.',
      category: 'Summary'
    }
  ];

  toggleEditBox() {
    this.isEditBoxOpen.update(v => !v);
  }

  selectPhilosophy(philosophy: 'western' | 'eastern' | 'ayurvedic' | 'osteopathic') {
    this.patientState.selectPhilosophy(philosophy);
  }

  selectCognitiveLevel(level: 'standard' | 'simplified' | 'dyslexia' | 'child') {
    this.patientState.selectedCognitiveLevel.set(level);
    const readingLabel = level === 'standard' ? 'standard' : level === 'dyslexia' ? 'Dyslexia-Friendly' : level === 'child' ? 'Child-Friendly (Grade 4)' : 'Simplified Patient Summary (Grade 8)';
    this.patientState.selectedReadingLevel.set(readingLabel);
  }

  updateNotes(event: Event) {
    const val = (event.target as HTMLTextAreaElement).value;
    this.editableNotes.set(val);
  }

  saveNotes() {
    const noteText = this.editableNotes();
    if (noteText) {
      this.patientState.addClinicalNote({
        id: `edit-note-${Date.now()}`,
        text: noteText,
        sourceLens: 'Overview',
        date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
      });
      this.isEditBoxOpen.set(false);
    }
  }

  prevPage() {
    if (this.activePageIndex() > 0) {
      this.activePageIndex.update(i => i - 1);
    }
  }

  nextPage() {
    if (this.activePageIndex() < this.printPages.length - 1) {
      this.activePageIndex.update(i => i + 1);
    }
  }

  triggerPrintPdf() {
    const data = {
      report: this.intelligence.analysisResults(),
      summary: this.editableNotes(),
      cognitiveLevel: this.activeCognitiveLevel(),
      language: this.patientState.selectedLanguage(),
      options: {
        includeVitals: this.toggleVitals(),
        includeSideBySideComparison: this.toggleSideBySide(),
        includeAvs: this.toggleAvs(),
        includeNutrition: this.toggleNutrition(),
        includeGenomics: this.toggleGenomics()
      }
    };
    this.exportService.downloadAsPdf(data, this.activePatientName());
  }
}
