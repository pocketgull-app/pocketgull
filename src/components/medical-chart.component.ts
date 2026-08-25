import { Component, ChangeDetectionStrategy, inject, computed, signal, viewChild, ElementRef, effect, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { IPatientState, IPatient, HistoryEntry } from '../services/patient.types';
import { BodyViewerComponent } from './body-viewer.component';
import { PatientHistoryTimelineComponent } from './patient-history-timeline.component';
import { DictationService } from '../services/dictation.service';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { PocketGullCardComponent } from './shared/pocket-gull-card.component';
import { MedicalChartSummaryComponent } from './medical-summary.component';
import { DicomViewerComponent } from './dicom-viewer.component';
import { BiometricHistoryChartComponent } from './biometric-history-chart.component';
import { SentinelTriageComponent } from './sentinel-triage.component';
import { SentinelTelemetryPlotterComponent } from './sentinel-telemetry-plotter.component';

@Component({
  selector: 'app-medical-chart',
  standalone: true,
  imports: [
    CommonModule, 
    BodyViewerComponent, 
    PatientHistoryTimelineComponent, 
    PocketGullButtonComponent, 
    PocketGullCardComponent, 
    MedicalChartSummaryComponent, 
    DicomViewerComponent, 
    BiometricHistoryChartComponent,
    SentinelTriageComponent,
    SentinelTelemetryPlotterComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full min-h-full flex flex-col gap-4 sm:gap-6 p-4 sm:p-8 bg-[#F9FAFB] dark:bg-transparent">
 
       <!-- Review Mode Banner -->
      @if(isReviewMode() && state.viewingPastVisit(); as visit) {
          <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 p-4 flex justify-between items-center text-sm rounded-xl shadow-sm mb-2">
              <div class="flex items-center gap-3">
                  <div class="p-2 bg-yellow-100 dark:bg-yellow-800/40 rounded-sm text-yellow-700 dark:text-yellow-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                  </div>
                  @if (visit.type === 'Visit' || visit.type === 'ChartArchived') {
                    <span class="font-medium text-yellow-900 dark:text-yellow-100">Reviewing past entry from <strong class="font-bold">{{ visit.date }}</strong>. All fields are read-only.</span>
                  } @else {
                     <span class="font-medium text-yellow-900 dark:text-yellow-100">Reviewing past AI Analysis from <strong class="font-bold">{{ visit.date }}</strong>.</span>
                  }
              </div>
              <pocket-gull-button 
                (click)="returnToCurrent()" 
                variant="secondary" 
                size="sm">
                Return to Current State
              </pocket-gull-button>
          </div>
      }
      

      <!-- Accessibility & Neuro-Divergence UX Toolbar (Dieter Rams Touch Targets) -->
      <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xs font-mono text-[11px] no-print">
        <div class="flex items-center gap-1.5 font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
          <span class="text-indigo-700 dark:text-indigo-300">♿ Sensory & Accessibility Controls:</span>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <!-- Audio-Primary Mode Toggle (Visual Impairments / Blindness) -->
          <button type="button" 
            (click)="state.isAudioPrimaryMode.set(!state.isAudioPrimaryMode())"
            [class]="state.isAudioPrimaryMode() ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-gray-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'"
            class="min-h-[36px] px-3 py-1.5 rounded-md border font-extrabold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Toggle Audio-Primary Spatial Entrainment & Voice Assistant for Visual Impairments">
            <span>🎧 Audio-Primary</span>
            @if (state.isAudioPrimaryMode()) { <span>✓</span> }
          </button>

          <!-- Dyslexia Font Toggle -->
          <button type="button" 
            (click)="state.selectedCognitiveLevel.set(state.selectedCognitiveLevel() === 'dyslexia' ? 'standard' : 'dyslexia')"
            [class]="state.selectedCognitiveLevel() === 'dyslexia' ? 'bg-amber-500 text-zinc-950 font-black border-amber-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-gray-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'"
            class="min-h-[36px] px-3 py-1.5 rounded-md border font-extrabold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Toggle Dyslexia-Friendly High-Legibility Literacy Mode">
            <span>📖 Dyslexia Font</span>
            @if (state.selectedCognitiveLevel() === 'dyslexia') { <span>✓</span> }
          </button>

          <!-- 40 Hz Gamma Cognitive Sync (MCI / Concussion / ADHD) -->
          <button type="button" 
            (click)="state.isGammaSyncActive.set(!state.isGammaSyncActive())"
            [class]="state.isGammaSyncActive() ? 'bg-purple-600 text-white border-purple-600 animate-pulse' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-gray-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'"
            class="min-h-[36px] px-3 py-1.5 rounded-md border font-extrabold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Toggle 40 Hz Gamma Cognitive Synchronization for MCI / Concussion / ADHD">
            <span>🧠 40Hz Gamma</span>
            @if (state.isGammaSyncActive()) { <span>✓</span> }
          </button>
        </div>
      </div>

      <!-- 3D Body Viewer Card -->
      <pocket-gull-card 
        id="tour-body-chart"
        title="3D Body Viewer" 
        [icon]="viewerIcon"
        [noPadding]="true">
        
        <div right-action (click)="isViewerExpanded.set(!isViewerExpanded())" class="cursor-pointer hover:bg-black/5 p-1 rounded-md transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 transition-transform duration-200" [class.rotate-180]="!isViewerExpanded()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </div>

        @if(isViewerExpanded()) {
          <div class="body-viewer-container min-h-[540px] sm:min-h-[580px] xl:min-h-[640px] overflow-hidden bg-white dark:bg-black/20 shrink-0 flex flex-col">
            @defer (on immediate) {
              <app-body-viewer class="h-full w-full flex-1 flex flex-col"></app-body-viewer>
            } @placeholder {
              <div class="h-full w-full flex items-center justify-center text-gray-500 dark:text-zinc-400 bg-gray-50/50 dark:bg-zinc-800/50">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-6 h-6 border-2 border-gray-200 border-t-[#689F38] rounded-sm animate-spin"></div>
                  <span class="text-xs uppercase tracking-widest font-bold">Loading 3D Viewer...</span>
                </div>
              </div>
            }
          </div>
        }
      </pocket-gull-card>

      <!-- Sentinel Outbreak & Telemetry Plotter Section -->
      @if (isSentinel()) {
        <app-sentinel-triage class="block w-full"></app-sentinel-triage>
        <app-sentinel-telemetry-plotter class="block w-full"></app-sentinel-telemetry-plotter>
      }

      <!-- Biometric Trends Card -->
      <pocket-gull-card 
        title="Biometric Trends" 
        [icon]="biometricIcon"
        [noPadding]="true">
        
        <div right-action (click)="isBiometricExpanded.set(!isBiometricExpanded())" class="cursor-pointer hover:bg-black/5 p-1 rounded-md transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 transition-transform duration-200" [class.rotate-180]="!isBiometricExpanded()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </div>

        @if(isBiometricExpanded()) {
          <div class="h-[250px] overflow-hidden bg-white dark:bg-black/20 shrink-0 p-4">
             <app-biometric-history-chart></app-biometric-history-chart>
          </div>
        }
      </pocket-gull-card>

      <!-- Medical Summary Card -->
      <pocket-gull-card 
        title="Medical Summary" 
        [icon]="summaryIcon"
        [noPadding]="true">
        
        <div right-action (click)="isSummaryExpanded.set(!isSummaryExpanded())" class="cursor-pointer hover:bg-black/5 p-1 rounded-md transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 transition-transform duration-200" [class.rotate-180]="!isSummaryExpanded()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </div>

        @if(isSummaryExpanded()) {
          <div class="bg-white dark:bg-zinc-900 shrink-0 min-h-0 min-w-0 border-b border-gray-100 dark:border-zinc-800 last:border-0 p-0">
             <app-medical-summary class="block"></app-medical-summary>
          </div>
        }
      </pocket-gull-card>

      <!-- Patient History Card -->
      <pocket-gull-card 
        title="Patient History" 
        [icon]="historyIcon"
        [noPadding]="true">
        
        <div right-action class="flex items-center gap-4">
              @if(historyBodyParts().length > 0) {
                  <div class="flex items-center gap-2">
                      <pocket-gull-button 
                        (click)="$event.stopPropagation(); historyFilter.set(null)"
                        [variant]="!historyFilter() ? 'primary' : 'secondary'"
                        size="xs">
                        ALL
                      </pocket-gull-button>
                      @for(part of historyBodyParts(); track part.id) {
                          <pocket-gull-button 
                            (click)="$event.stopPropagation(); historyFilter.set(part.id)"
                            [variant]="historyFilter() === part.id ? 'primary' : 'secondary'"
                            size="xs">
                            {{ part.name }}
                          </pocket-gull-button>
                      }
                  </div>
              }
              <div (click)="isHistoryExpanded.set(!isHistoryExpanded())" class="cursor-pointer hover:bg-black/5 p-1 rounded-md transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 transition-transform duration-200" [class.rotate-180]="!isHistoryExpanded()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </div>
        </div>
        
        @if(isHistoryExpanded()) {
          <div class="flex flex-col min-h-0">
            <div #historyContainer class="p-6 scroll-smooth">
              @if(selectedPatient()?.history; as history) {
                <app-patient-history-timeline 
                  [history]="filteredHistory()"
                  [activeVisit]="state.viewingPastVisit()"
                  (review)="reviewVisit($event)"
                  (reviewAnalysis)="reviewAnalysis($event)"
                  (reviewNote)="reviewNote($event)"
                  (deleteNote)="deleteNote($event)"
                  (openBookmark)="openBookmarkInResearchFrame($event)"
                ></app-patient-history-timeline>
              }

              @if ((selectedPatient()?.history?.length ?? 0) === 0) {
                <div class="h-32 flex flex-col items-center justify-center text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 mb-2 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
                  <p class="text-xs font-bold uppercase tracking-[0.15em]">No recorded activity</p>
                </div>
              }
            </div>
          </div>
        }
      </pocket-gull-card>

      <!-- Patient Scans Card -->
      <pocket-gull-card 
        title="DICOM Viewer" 
        [icon]="scansIcon"
        [noPadding]="true">
        
        <div right-action (click)="isScansExpanded.set(!isScansExpanded())" class="cursor-pointer hover:bg-black/5 p-1 rounded-md transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 transition-transform duration-200" [class.rotate-180]="!isScansExpanded()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </div>

        @if(isScansExpanded()) {
          <div class="p-6 bg-[#F9FAFB]/50 dark:bg-zinc-900/50 min-h-0">
            <app-dicom-viewer class="shrink-0"></app-dicom-viewer>
          </div>
        }
      </pocket-gull-card>

    </div>
  `
})
export class MedicalChartComponent {
  state = inject(PatientStateService);
  patientManager = inject(PatientManagementService);
  dictation = inject(DictationService);

  historyContainer = viewChild<ElementRef<HTMLDivElement>>('historyContainer');

  el = inject(ElementRef);
  platformId = inject(PLATFORM_ID);

  constructor() {
    effect(() => {
      // depend on history but do NOT force scroll on load to avoid jarring layout jumps
      const history = this.filteredHistory();
      // Unwanted scroll logic removed: The user wants to view the Medical Summary & 3D Viewer at the top upon load.
    });
  }

  viewerIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-5.25v9" />
    </svg>
  `;
  biometricIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 12h2l2-7 3 14 3-10 2 3h6" />
    </svg>
  `;
  historyIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `;
  summaryIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  `;
  scansIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  `;

  // --- Accordion State ---
  isViewerExpanded = signal(true);
  isBiometricExpanded = signal(true);
  isSummaryExpanded = signal(true);
  isHistoryExpanded = signal(true);
  isScansExpanded = signal(true);

  historyFilter = signal<string | null>(null);

  selectedPatient = computed(() => {
    const selectedId = this.patientManager.selectedPatientId();
    if (!selectedId) return null;
    return this.patientManager.patients().find(p => p.id === selectedId);
  });

  patientScans = computed(() => this.selectedPatient()?.scans || []);

  isReviewMode = computed(() => !!this.state.viewingPastVisit());

  isSentinel = computed(() => {
    const patient = this.selectedPatient();
    return !!patient && (patient.name.toLowerCase().includes('sentinel') || ['p004', 'p005', 'p006', 'p007'].includes(patient.id));
  });

  historyBodyParts = computed(() => {
    const history = this.selectedPatient()?.history || [];
    const parts = new Map<string, string>(); // id -> name
    history.forEach(entry => {
      if (entry.type === 'NoteCreated') {
        const match = entry.summary.match(/Note for (.*?)(:|\s\()/);
        const name = match ? match[1] : entry.partId;
        if (!parts.has(entry.partId)) {
          parts.set(entry.partId, name);
        }
      } else if (entry.type === 'Visit' && entry.state?.issues) {
        Object.values(entry.state.issues).flat().forEach(issue => {
          if (!parts.has(issue.id)) {
            parts.set(issue.id, issue.name);
          }
        });
      }
    });
    return Array.from(parts.entries()).map(([id, name]) => ({ id, name }));
  });

  filteredHistory = computed(() => {
    const history = this.selectedPatient()?.history || [];
    const filter = this.historyFilter();
    if (!filter) {
      return history;
    }
    return history.filter(entry => {
      switch (entry.type) {
        case 'NoteCreated':
          return entry.partId === filter;
        case 'Visit':
        case 'ChartArchived':
          return !!entry.state?.issues[filter];
        case 'AnalysisRun':
        case 'PatientSummaryUpdate':
        case 'FinalizedPatientSummary':
        case 'BookmarkAdded':
          return true;
        default:
          return false;
      }
    });
  });




  reviewVisit(entry: HistoryEntry) {
    const patient = this.selectedPatient();
    if (!patient || (entry.type !== 'Visit' && entry.type !== 'ChartArchived')) return;
    this.patientManager.loadArchivedVisit(patient.id, entry);
  }

  reviewAnalysis(entry: HistoryEntry) {
    const patient = this.selectedPatient();
    if (!patient || entry.type !== 'AnalysisRun') return;
    this.patientManager.loadArchivedAnalysis(entry);
  }

  reviewNote(entry: HistoryEntry) {
    const patient = this.selectedPatient();
    if (!patient || entry.type !== 'NoteCreated') return;

    // Find the Visit/Chart entry that contains this note
    const history = patient.history || [];
    const parentVisit = history.find(h =>
      (h.type === 'Visit' || h.type === 'ChartArchived') &&
      h.state?.issues[entry.partId]?.some(note => note.noteId === entry.noteId)
    );

    if (parentVisit) {
      // Load that visit's state and select the note
      this.patientManager.loadArchivedVisit(
        patient.id,
        parentVisit,
        { partId: entry.partId, noteId: entry.noteId }
      );
    } else {
      // Fallback for current notes that might have a NoteCreated entry but aren't archived yet
      this.state.selectPart(entry.partId);
      this.state.selectNote(entry.noteId);
    }
  }

  deleteNote(entry: HistoryEntry) {
    if (entry.type !== 'NoteCreated') return;

    // Deselect if it's the currently viewed note
    if (this.state.selectedNoteId() === entry.noteId) {
      this.state.selectPart(null);
    }

    this.patientManager.deleteNoteAndHistory(entry);
  }

  returnToCurrent() {
    this.patientManager.reloadCurrentPatient();
  }

  openBookmarkInResearchFrame(url: string) {
    this.state.toggleResearchFrame(true);
    this.state.requestResearchUrl(url);
  }
}