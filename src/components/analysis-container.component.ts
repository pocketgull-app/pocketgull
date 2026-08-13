import { Component, ChangeDetectionStrategy, signal, inject, computed, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisReportComponent } from './analysis-report.component';
import { PatientStateService } from '../services/patient-state.service';
import { AiCacheService } from '../services/ai-cache.service';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { APP_VERSION } from '../version';
import { ExportService } from '../services/export.service';
import { NetworkStateService } from '../services/network-state.service';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { PatientManagementService } from '../services/patient-management.service';
import { ClinicalIcons } from '../assets/clinical-icons';
import { GamificationService } from '../services/gamification.service';

import { HumanDignityPactComponent } from './human-dignity-pact.component';
import { MyChartBriefModalComponent } from './modals/mychart-brief-modal.component';
import { FamilyTreePedigreeComponent } from './family-tree-pedigree.component';
import { PatientStoryModalComponent } from './modals/patient-story-modal.component';
import { PostItNotesComponent } from './shared/post-it-notes.component';
import { ActuarialGleeAlbumComponent } from './actuarial-glee-album.component';
import { GcpHealthcareApiService } from '../services/fhir/gcp-healthcare-api.service';
import { AmbientLivingSpaceDashboardComponent } from './ambient-living-space-dashboard.component';
import { GreenRoomLoungeComponent } from './green-room-lounge.component';
import { DoctorShiftSimulatorComponent } from './doctor-shift-simulator.component';
import { DoctorShiftSalesDemoComponent } from './doctor-shift-sales-demo.component';
import { Holographic3DAnatomyComponent } from './anatomy-3d/holographic-3d-anatomy.component';
import { GenesisBiophysicalSubstrateComponent } from './anatomy-3d/genesis-biophysical-substrate.component';

import { DomainSuitesNavigatorComponent } from './suites/domain-suites-navigator.component';

import { ComponentDrilldownUnitComponent } from './component-drilldown-unit.component';
import { CounterfactualSimulatorComponent } from './counterfactual-simulator.component';
import { SoapNoteGeneratorComponent } from './soap-note-generator.component';
import { CohortTriageMatrixComponent } from './cohort-triage-matrix.component';
import { HipaaPdfExportComponent } from './hipaa-pdf-export.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-analysis-container',
  standalone: true,
  host: {
    'class': 'flex flex-col flex-1 min-h-0 h-full w-full overflow-hidden max-md:h-full max-md:min-h-[calc(100dvh-140px)]'
  },
  imports: [CommonModule, CounterfactualSimulatorComponent, SoapNoteGeneratorComponent, CohortTriageMatrixComponent, HipaaPdfExportComponent, AnalysisReportComponent, DomainSuitesNavigatorComponent, ComponentDrilldownUnitComponent, HumanDignityPactComponent, MyChartBriefModalComponent, FamilyTreePedigreeComponent, PatientStoryModalComponent, PostItNotesComponent, ActuarialGleeAlbumComponent, AmbientLivingSpaceDashboardComponent, GreenRoomLoungeComponent, DoctorShiftSimulatorComponent, DoctorShiftSalesDemoComponent, Holographic3DAnatomyComponent, GenesisBiophysicalSubstrateComponent],
  template: `
    <div class="flex flex-col flex-1 h-full w-full overflow-hidden max-md:h-full max-md:min-h-[calc(100dvh-140px)] bg-[#F3F4F6] dark:bg-zinc-950">
      
      <!-- Interactive Component Drill-Down Modal -->
      <app-component-drilldown-unit />
      
      <!-- Main Content Container -->
      <div class="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden max-md:h-full max-md:min-h-[calc(100dvh-140px)]">
        
        <!-- Top Toolbar / Header -->
        @if (!state.isEmergencyMode()) {
          @let isWestern = state.activePhilosophy() === 'western';
          @let isEastern = state.activePhilosophy() === 'eastern';
          @let isAyurvedic = state.activePhilosophy() === 'ayurvedic';

          <div class="min-h-[56px] py-2.5 bg-zinc-950 border-b border-zinc-800 flex flex-wrap items-center justify-between px-3 sm:px-6 shrink-0 relative z-10 font-mono gap-2 text-zinc-100">
              
            <!-- Geographical Clinical Paradigm Selector -->
            <div class="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 overflow-x-auto max-w-full font-mono">
              <span class="hidden md:inline text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 px-1">
                Paradigm:
              </span>

              <!-- Western Clinical (North America & Europe) -->
              <button (click)="selectPhilosophy('western')"
                title="Western Clinical Medicine (North America & Europe)"
                [class]="isWestern
                  ? 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all select-none cursor-pointer border rounded-lg bg-orange-500 text-zinc-950 border-orange-400/50 shadow-sm'
                  : 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all select-none cursor-pointer border rounded-lg bg-zinc-900 text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-850'">
                <span>🏥 Western</span>
              </button>

              <!-- Eastern TCM (East Asia Zang-Fu) -->
              <button (click)="selectPhilosophy('eastern')"
                title="Eastern TCM Medicine (East Asian Zang-Fu)"
                [class]="isEastern
                  ? 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all select-none cursor-pointer border rounded-lg bg-orange-500 text-zinc-950 border-orange-400/50 shadow-sm'
                  : 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all select-none cursor-pointer border rounded-lg bg-zinc-900 text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-850'">
                <span>☯️ Eastern</span>
              </button>

              <!-- Ayurvedic (South Asia Vedic) -->
              <button (click)="selectPhilosophy('ayurvedic')"
                title="Ayurvedic Medicine (South Asian Vedic Dosha)"
                [class]="isAyurvedic
                  ? 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all select-none cursor-pointer border rounded-lg bg-orange-500 text-zinc-950 border-orange-400/50 shadow-sm'
                  : 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase transition-all select-none cursor-pointer border rounded-lg bg-zinc-900 text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-850'">
                <span>🪷 Ayurvedic</span>
              </button>
            </div>

            <!-- Export Actions & Streamlined Interactive Suite Drawer Button -->
            <div class="flex items-center gap-2 sm:gap-2.5 ml-auto font-mono">
              @if (justGenerated() && hasReport() && !intelligence.isLoading()) {
                <div class="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400">
                   <span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                   <span>Analysis Synced</span>
                </div>
              }

              <!-- System Status & Offline Simulation Toggle -->
              <button type="button" (click)="network.toggleForceOffline()"
                title="Toggle forced offline simulation mode"
                [class]="network.forceOffline()
                  ? 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-extrabold uppercase rounded-xl border border-red-500 bg-red-500/20 text-red-400 hover:bg-red-500/30 transition cursor-pointer shadow-sm'
                  : 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-extrabold uppercase rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-600 hover:text-white transition cursor-pointer shadow-sm'">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" [class]="network.isOnline() ? 'bg-emerald-400' : 'bg-red-400'"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2" [class]="network.isOnline() ? 'bg-emerald-500' : 'bg-red-500'"></span>
                </span>
                <span>{{ network.forceOffline() ? 'App Forced Offline' : 'System Ready' }}</span>
              </button>
                      <!-- B2B Executive Sales Pitch Demo Button -->
                <button type="button" (click)="showSalesDemoModal.set(true)" title="Launch B2B Health System Executive Demo & ROI Calculator"
                  class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-extrabold uppercase rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-600 hover:text-white transition cursor-pointer shadow-sm">
                  <span>💼</span> B2B Executive Demo
                </button>

                <!-- Cohort Triage Matrix Button -->
                <button type="button" (click)="showCohortMatrixModal.set(!showCohortMatrixModal())"
                  title="Open Multi-Patient Cohort Triage Matrix"
                  [class]="showCohortMatrixModal()
                    ? 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-extrabold uppercase rounded-xl border border-blue-400 bg-blue-500 text-zinc-950 transition cursor-pointer shadow-md'
                    : 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-extrabold uppercase rounded-xl border border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-600 hover:text-white transition cursor-pointer shadow-sm'">
                  <span>📊 Cohort Matrix</span>
                </button>

                <!-- HIPAA PDF Export Button -->
                <button type="button" (click)="showHipaaPdfModal.set(!showHipaaPdfModal())"
                  title="Open 1-Click HIPAA Audit & FHIR R4 Bundle PDF Export"
                  [class]="showHipaaPdfModal()
                    ? 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-extrabold uppercase rounded-xl border border-amber-400 bg-amber-500 text-zinc-950 transition cursor-pointer shadow-md'
                    : 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-extrabold uppercase rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-600 hover:text-white transition cursor-pointer shadow-sm'">
                  <span>📄 HIPAA PDF</span>
                </button>

                <!-- Ambient SOAP Note Generator Button -->
                <button type="button" (click)="showSoapModal.set(!showSoapModal())"
                  title="Open Ambient Real-Time FHIR R4 SOAP Note Generator"
                  [class]="showSoapModal()
                    ? 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-extrabold uppercase rounded-xl border border-purple-400 bg-purple-500 text-zinc-950 transition cursor-pointer shadow-md'
                    : 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-extrabold uppercase rounded-xl border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-600 hover:text-white transition cursor-pointer shadow-sm'">
                  <span>📝 SOAP Note</span>
                </button>

                <!-- What-If Sandbox Simulator Toggle Button -->
                <button type="button" (click)="showSimulatorModal.set(!showSimulatorModal())"
                  title="Open Interactive What-If Counterfactual Health Simulator"
                  [class]="showSimulatorModal()
                    ? 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-extrabold uppercase rounded-xl border border-emerald-400 bg-emerald-500 text-zinc-950 transition cursor-pointer shadow-md'
                    : 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-extrabold uppercase rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-600 hover:text-white transition cursor-pointer shadow-sm'">
                  <span>🔮 What-If Simulator</span>
                </button>

                <!-- View Mode Switcher: Classic Lenses vs Functional Domain Suites -->
                <button type="button" (click)="viewMode.set(viewMode() === 'lenses' ? 'suites' : 'lenses')"
                  title="Toggle between Classic Multi-Lens Report and Functional Domain Suites (Paradigm Diff Engine)"
                  class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-extrabold uppercase rounded-xl border border-orange-500/40 bg-orange-500/10 text-orange-300 hover:bg-orange-600 hover:text-white transition cursor-pointer shadow-sm">
                  <span>{{ viewMode() === 'lenses' ? '🧬 Domain Suites' : '📄 Classic Lenses' }}</span>
                </button>

                <!-- Clinical Tools & Engagement Suites Drawer Toggle Button -->
                <button type="button" (click)="showToolsMenu.set(!showToolsMenu())" title="Open Clinical Tools & Engagement Suites Drawer"
                  class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-extrabold uppercase rounded-xl border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-600 hover:text-white transition cursor-pointer shadow-sm">
                  <span>🎛️</span> Clinical Tools ▾
                </button>
              </div>
            </div>
          }

        <div class="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden relative">
          <div class="flex-1 min-h-0 min-w-0 h-full flex flex-col overflow-y-auto transition-all duration-300 p-4 sm:p-6">
            
            <!-- Cohort Triage Matrix Panel -->
            @if (showCohortMatrixModal()) {
              <div class="mb-4 w-full shrink-0">
                <app-cohort-triage-matrix />
              </div>
            }

            <!-- HIPAA Audit PDF Export Panel -->
            @if (showHipaaPdfModal()) {
              <div class="mb-4 w-full shrink-0">
                <app-hipaa-pdf-export />
              </div>
            }

            <!-- Ambient Real-Time SOAP Note Generator Panel -->
            @if (showSoapModal()) {
              <div class="mb-4 w-full shrink-0">
                <app-soap-note-generator />
              </div>
            }

            <!-- What-If Counterfactual Sandbox Panel -->
            @if (showSimulatorModal()) {
              <div class="mb-4 w-full shrink-0">
                <app-counterfactual-simulator />
              </div>
            }

            <div class="flex-1 flex flex-col min-h-0 min-w-0 h-full overflow-y-auto relative" [class.slide-in-panel]="isSlidingIn()">
                @if (viewMode() === 'suites') {
                  <app-domain-suites-navigator class="w-full h-auto block overflow-visible" />
                } @else {
                  @defer (on viewport; prefetch on idle) {
                    <app-holographic-3d-anatomy class="w-full mb-6 shrink-0 block" />
                    <app-genesis-biophysical-substrate class="w-full mb-6 shrink-0 block" />
                  } @placeholder {
                    <div class="w-full mb-6 shrink-0 h-48 rounded-2xl bg-slate-100 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 animate-pulse flex items-center justify-center gap-3">
                      <div class="w-3 h-3 rounded-full bg-cyan-500 animate-ping"></div>
                      <span class="text-xs font-mono text-slate-500 dark:text-zinc-400">Initializing Holographic 3D Spatial Lens...</span>
                    </div>
                  }
                  <app-analysis-report class="flex-1 flex flex-col min-h-0 h-full w-full overflow-hidden" #reportRef (openGleeModal)="showGleeModal.set(true)"></app-analysis-report>
                }
            </div>
          </div>
          
          <!-- Interactive Report Footer: Lens Navigation + Refresh & Clear + Metadata -->
          @if (hasReport() && !state.isEmergencyMode()) {
            <div class="shrink-0 mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800 flex flex-col gap-4 font-mono no-print">
              
              <!-- Lens Navigation & Action Controls Toolbar -->
              <div class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-100/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 shadow-sm">
                
                <!-- Sequential Lens Stepper Buttons -->
                @if (viewMode() === 'lenses') {
                  <div class="flex items-center gap-2" id="tour-footer-lens-navigation">
                    <button type="button" (click)="reportRef?.navigateToPreviousLens()"
                      [disabled]="!reportRef?.hasPreviousLens()"
                      class="px-3 py-1.5 rounded-xl border text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700">
                      <span>← Previous Lens</span>
                    </button>

                    <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/50">
                      {{ reportRef?.activeLens() || 'Summary Overview' }}
                    </span>

                    <button type="button" (click)="reportRef?.navigateToNextLens()"
                      [disabled]="!reportRef?.hasNextLens()"
                      class="px-3 py-1.5 rounded-xl border text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500 shadow-sm">
                      <span>Next Lens →</span>
                    </button>
                  </div>
                }

                <!-- Footer Refresh Analysis & PAIR Data Card Actions -->
                <div class="flex items-center gap-2">
                  <button id="tour-generate-btn" type="button" (click)="triggerAnalysisGenerate()"
                    [disabled]="intelligence.isLoading()"
                    class="px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer bg-emerald-700 text-white border-emerald-800 hover:bg-emerald-600 disabled:opacity-50 shadow-md">
                    <span>🔄 Refresh Analysis</span>
                  </button>
                </div>

              </div>

              <!-- Metadata Grid & Isolated System Actions -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 font-['Inter'] opacity-90 hover:opacity-100 transition-opacity border-t border-zinc-200/50 dark:border-zinc-800/60 pt-3">
                <div class="space-y-1">
                  <div class="text-[12px] font-bold uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-200">System Identification</div>
                  <div class="text-[12px] font-semibold text-zinc-800 dark:text-zinc-300 uppercase tracking-widest">Pocket Gull Analysis Engine v{{ appVersion }}</div>
                </div>
                <div class="space-y-1">
                  <div class="text-[12px] font-bold uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-200">Analysis Metadata</div>
                  <div class="text-[12px] font-semibold text-zinc-800 dark:text-zinc-300 uppercase tracking-widest">Generated: {{ intelligence.lastRefreshTime() | date:'yyyy.MM.dd HH:mm:ss' }}</div>
                </div>
                <div class="space-y-1 md:text-right flex flex-col items-start md:items-end justify-between">
                  <div>
                    <div class="text-[12px] font-bold uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-200">Regulatory Status</div>
                    <div class="text-[12px] font-semibold text-zinc-800 dark:text-zinc-300 uppercase tracking-widest">AI Generated Evidence. Physician Oversight Mandated.</div>
                  </div>

                  <!-- Isolated Clear Cache Button (Moved far down from Refresh Analysis) -->
                  <button type="button" (click)="intelligence.clearCache()"
                    title="Clear AI completion cache and force model re-inference"
                    class="mt-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-red-400 opacity-60 hover:opacity-100 transition flex items-center gap-1 cursor-pointer">
                    <span>🗑️ Clear AI Cache</span>
                  </button>
                </div>
              </div>

            </div>
          }
        </div>
      </div>

    <!-- Popover Clinical Tools & Engagement Suites Drawer -->
    @if (showToolsMenu()) {
      <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-mono animate-in fade-in duration-150">
        <div class="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-zinc-100 shadow-2xl space-y-5">
          
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div class="flex items-center gap-3">
              <span class="text-xl p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">🎛️</span>
              <div>
                <h3 class="text-base font-black uppercase text-white tracking-wide">Clinical Tools & Engagement Suites</h3>
                <p class="text-xs text-zinc-400 font-sans mt-0.5">Select specialized modules, exports, or patient engagement lounges</p>
              </div>
            </div>
            <button (click)="showToolsMenu.set(false)" class="text-zinc-400 hover:text-white text-xl font-bold p-1 cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Categorized Tools Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-sans">
            
            <!-- Category 1: Clinical Documents & Briefs -->
            <div class="space-y-2 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <span class="text-[10px] font-mono font-bold uppercase text-sky-400 block tracking-wider">📄 Documents & Briefs</span>
              <button (click)="showMyChartModal.set(true); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition flex items-center gap-2 cursor-pointer">
                <span>🏥</span> MyChart Brief
              </button>
              <button (click)="showPedigreeModal.set(true); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition flex items-center gap-2 cursor-pointer">
                <span>🌳</span> Pedigree Tree
              </button>
              <button (click)="showStoryModal.set(true); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition flex items-center gap-2 cursor-pointer">
                <span>📖</span> Patient Story
              </button>
            </div>

            <!-- Category 2: Interactive Prescriptions -->
            <div class="space-y-2 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <span class="text-[10px] font-mono font-bold uppercase text-orange-400 block tracking-wider">📌 Prescriptions & Music</span>
              <button (click)="showPostItModal.set(true); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition flex items-center gap-2 cursor-pointer">
                <span>📌</span> 3D Post-Its
              </button>
              <button (click)="showGleeModal.set(true); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition flex items-center gap-2 cursor-pointer">
                <span>🎵</span> Actuarial Glee
              </button>

            </div>

            <!-- Category 3: Restorative Lounges & Ethics -->
            <div class="space-y-2 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <span class="text-[10px] font-mono font-bold uppercase text-emerald-400 block tracking-wider">🌿 Lounges & Ethics</span>
              <button (click)="showShiftSimulatorModal.set(true); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/40 hover:bg-orange-500 hover:text-zinc-950 transition flex items-center gap-2 cursor-pointer font-bold">
                <span>⚡</span> 12-Hour Doctor Shift
              </button>
              <button (click)="showPactModal.set(true); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition flex items-center gap-2 cursor-pointer">
                <span>🕊️</span> Dignity Charter
              </button>
              <button (click)="showLivingSpaceModal.set(true); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition flex items-center gap-2 cursor-pointer">
                <span>🏡</span> Living Space
              </button>
              <button (click)="showGreenRoomModal.set(true); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition flex items-center gap-2 cursor-pointer">
                <span>🌿</span> Green Room
              </button>
              <button (click)="syncGcpHealthcare(); showToolsMenu.set(false)" class="w-full text-left p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 transition flex items-center gap-2 cursor-pointer">
                <span>☁️</span> GCP Healthcare Sync
              </button>
            </div>

          </div>

          <div class="pt-2 border-t border-zinc-800 flex justify-end">
            <button (click)="showToolsMenu.set(false)" class="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer">
              Close Suites
            </button>
          </div>

        </div>
      </div>
    }

    <!-- Human Dignity Health Charter Modal -->
    @if (showPactModal()) {
      <app-human-dignity-pact (closeModal)="showPactModal.set(false)"></app-human-dignity-pact>
    }

    <!-- Epic MyChart Physician Brief & Longevity Lab Modal -->
    @if (showMyChartModal()) {
      <app-mychart-brief-modal (closeModal)="showMyChartModal.set(false)"></app-mychart-brief-modal>
    }

    <!-- Family Health Pedigree Tree & Risk Branch Pruning Modal -->
    @if (showPedigreeModal()) {
      <app-family-tree-pedigree (closeModal)="showPedigreeModal.set(false)"></app-family-tree-pedigree>
    }

    <!-- TED-Style Patient Hero Journey Story Reader Modal -->
    @if (showStoryModal()) {
      <app-patient-story-modal (closeModal)="showStoryModal.set(false)"></app-patient-story-modal>
    }

    <!-- 3D Interactive Prescription Post-It Notes Modal -->
    @if (showPostItModal()) {
      <app-post-it-notes (closeModal)="showPostItModal.set(false)"></app-post-it-notes>
    }

    <!-- 12-Track Actuarial Glee Duet Singalong Album Modal -->
    @if (showGleeModal()) {
      <app-actuarial-glee-album (closeModal)="showGleeModal.set(false)"></app-actuarial-glee-album>
    }



    <!-- Main Living Space Ambient Display Studio Modal -->
    @if (showLivingSpaceModal()) {
      <app-ambient-living-space-dashboard (closeModal)="showLivingSpaceModal.set(false)" (openGleeAlbum)="showLivingSpaceModal.set(false); showGleeModal.set(true)"></app-ambient-living-space-dashboard>
    }

    <!-- Restorative Green Room Clinician & Patient Lounge Modal -->
    @if (showGreenRoomModal()) {
      <app-green-room-lounge (closeModal)="showGreenRoomModal.set(false)" (openGleeAlbum)="showGreenRoomModal.set(false); showGleeModal.set(true)"></app-green-room-lounge>
    }

    <!-- 12-Hour Intensive Doctor Shift Simulator & Stress Test Modal -->
    @if (showShiftSimulatorModal()) {
      <app-doctor-shift-simulator (closeModal)="showShiftSimulatorModal.set(false)"></app-doctor-shift-simulator>
    }

    <!-- B2B Executive Sales Demo & Marketing Landing Page Modal -->
    @if (showSalesDemoModal()) {
      <app-doctor-shift-sales-demo (closeModal)="showSalesDemoModal.set(false)"></app-doctor-shift-sales-demo>
    }
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
    .animate-in { animation: slideIn 0.3s ease-out; }
    @keyframes slideIn {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideInRight3D {
      0% {
        transform: translateX(100%) scale(0.96);
        opacity: 0;
        filter: blur(4px);
        box-shadow: -20px 0 60px rgba(0, 0, 0, 0.4);
      }
      70% {
        transform: translateX(-0.5%) scale(1.002);
        opacity: 1;
        filter: blur(0);
      }
      100% {
        transform: translateX(0) scale(1);
        opacity: 1;
        filter: blur(0);
        box-shadow: none;
      }
    }

    .slide-in-panel {
      animation: slideInRight3D 0.48s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      will-change: transform, opacity, filter;
    }
  `]
})
export class AnalysisContainerComponent {
  appVersion = APP_VERSION;
  @ViewChild(AnalysisReportComponent) reportRef?: AnalysisReportComponent;
  state = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);
  cache = inject(AiCacheService);
  intelligence = inject(ClinicalIntelligenceService);
  game = inject(GamificationService);
  exportService = inject(ExportService);
  gcpHealthcare = inject(GcpHealthcareApiService);
  network = inject(NetworkStateService);
  ClinicalIcons = ClinicalIcons;

  isSlidingIn = signal(true);
  viewMode = signal<'lenses' | 'suites'>('lenses');
  showSimulatorModal = signal(false);
  showSoapModal = signal(false);
  showCohortMatrixModal = signal(false);
  showHipaaPdfModal = signal(false);

  constructor() {
    // Re-trigger 3D slide-in animation whenever a patient is selected or analysis completes
    effect(() => {
      const pId = this.patientManagement.selectedPatientId();
      const lastRefresh = this.intelligence.lastRefreshTime();
      if (pId || lastRefresh) {
        this.triggerSlideIn();
      }
    });
  }

  triggerSlideIn() {
    this.isSlidingIn.set(false);
    setTimeout(() => {
      this.isSlidingIn.set(true);
    }, 20);
  }

  async syncGcpHealthcare() {
    const res = await this.gcpHealthcare.syncToGcpHealthcareApi();
    alert(res.message);
  }

  justGenerated = signal(false);
  showPactModal = signal(false);
  showMyChartModal = signal(false);
  showPedigreeModal = signal(false);
  showStoryModal = signal(false);
  showPostItModal = signal(false);
  showGleeModal = signal(false);
  showLivingSpaceModal = signal(false);
  showGreenRoomModal = signal(false);
  showShiftSimulatorModal = signal(false);
  showSalesDemoModal = signal(false);
  showToolsMenu = signal(false);

  exportPdf() {
    const reportText = Object.values(this.intelligence.analysisResults()).filter(Boolean).join('\n\n');
    this.exportService.exportPdfReport(
      reportText || 'Sample Patient Care Plan',
      this.state.patientName() || 'Patient'
    );
  }

  exportFhir() {
    const patientName = this.state.patientName() || 'Patient';
    const bundle = this.exportService.buildFhirR4Bundle({
      id: 'p001',
      name: patientName,
      issues: this.state.issues()
    });
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fhir_bundle_${patientName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
 
  triggerAnalysisGenerate() {
    this.justGenerated.set(true);
    this.game.completeQuest('generate_care_plan');
    this.triggerSlideIn();

    if (this.reportRef) {
      this.reportRef.generate();
    }
  }

  selectPhilosophy(philosophy: 'western' | 'eastern' | 'ayurvedic') {
    this.state.selectPhilosophy(philosophy);
    this.triggerSlideIn();
  }

  hasReport = computed(() => Object.keys(this.intelligence.analysisResults()).length > 0);
}

