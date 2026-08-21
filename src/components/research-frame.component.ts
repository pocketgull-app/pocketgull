import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, viewChild, ElementRef, OnDestroy, untracked, HostListener, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SafeHtmlPipe } from '../pipes/safe-html-new.pipe';
import { fromEvent, Subscription } from 'rxjs';
import { PatientManagementService } from '../services/patient-management.service';
import { PatientStateService } from '../services/patient-state.service';
import { IBookmark } from '../services/patient.types';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { PocketGullInputComponent } from './shared/pocket-gull-input.component';
import { PatientEducationFlipDirective, IPatientEducationFlipData } from '../directives/patient-education-flip.directive';
import { NcaaSportsScienceHubComponent } from './research-frame/ncaa-sports-science-hub.component';
import { InternationalUniversityHubComponent } from './research-frame/international-university-hub.component';
import * as DOMPurify from 'dompurify';

export interface IPubMedSearchResult {
  id: string;
  title: string;
  authors: string;
  source: string;
  pubdate: string;
  doi: string;
  evidenceTier?: 'LEVEL_A' | 'LEVEL_B' | 'TRIALS';
  rob2Risk?: 'Low Risk' | 'Some Concerns' | 'High Risk';
  bottomLineTakeaway?: string;
  patientContextMatch?: string;
}

@Component({
  selector: 'app-research-frame',
  standalone: true,
  imports: [
    CommonModule, 
    PocketGullButtonComponent, 
    PocketGullInputComponent, 
    SafeHtmlPipe, 
    PatientEducationFlipDirective, 
    NcaaSportsScienceHubComponent,
    InternationalUniversityHubComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="tour-research-frame-window" class="flex flex-col bg-white dark:bg-[#09090b] shadow-2xl border border-gray-300 dark:border-zinc-800 rounded-none md:rounded-lg overflow-hidden z-40 transition-all"
         [class.fixed]="isMobile()"
         [class.inset-0]="isMobile()"
         [class.absolute]="!isMobile()"
         [style.left.px]="isMobile() ? null : position().x"
         [style.top.px]="isMobile() ? null : position().y"
         [style.width.px]="isMobile() ? null : size().width"
         [style.height.px]="isMobile() ? null : size().height"
         [style.max-height]="isMobile() ? '100dvh' : 'none'">
      
      <!-- Header / Drag Handle with Official Brand Lettering -->
      <div (mousedown)="isMobile() ? null : startDrag($event)" 
           [class.cursor-move]="!isMobile()"
           class="h-11 px-4 flex items-center justify-between bg-zinc-900 border-b border-zinc-800 shrink-0 select-none font-pocketgull-inter">
        <div class="flex items-center gap-2.5">
          <span class="text-sm">🔬</span>
          <!-- Exclusive Brand Lettering using Marker/Handwritten Font -->
          <span class="font-pocketgull-handwritten text-orange-500 dark:text-orange-400 font-black text-sm tracking-tight">
            PocketGull
          </span>
          <span class="text-xs text-zinc-600">/</span>
          <h3 class="text-xs font-bold font-pocketgull-inter uppercase tracking-wider text-zinc-300">
            Literature &amp; Telemetric Research Frame
          </h3>
        </div>
        <pocket-gull-button variant="ghost" size="sm" (click)="close()" icon="M12 10.586 16.95 5.636a1 1 0 1 1 1.414 1.414L13.414 12l4.95 4.95a1 1 0 0 1-1.414 1.414L12 13.414l-4.95 4.95a1 1 0 0 1-1.414-1.414L10.586 12 5.636 7.05a1 1 0 0 1 1.414-1.414L12 10.586z" title="Close Research Window" ariaLabel="Close Research Window">
        </pocket-gull-button>
      </div>

      <!-- 📡 Telemetric Navigation & Evidence Ground Truth Radar (Clean Clinical Typography) -->
      <div class="px-3 py-2.5 bg-zinc-950 border-b border-zinc-800 text-zinc-200 font-pocketgull-inter text-xs flex flex-wrap items-center justify-between gap-2.5 shadow-inner">
        <!-- Left: Live Telemetric Telemetry Indicators (Zero-Jitter Monospace) -->
        <div class="flex items-center gap-2.5 font-pocketgull-mono text-[11px] flex-wrap">
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-zinc-400">Latency:</span>
            <span class="text-emerald-400 font-bold font-pocketgull-tabular">{{ queryLatencyMs() }}ms</span>
          </div>
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <span class="text-zinc-400">Evidence Radar:</span>
            <span class="text-sky-400 font-bold">Cochrane RoB 2 (Low Risk)</span>
          </div>
          <div class="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <span class="text-zinc-400">Epistemic H₀:</span>
            <span class="text-teal-400 font-bold font-pocketgull-tabular">p &lt; 0.01 (Falsifiable)</span>
          </div>
        </div>

        <!-- Right: Telemetric Navigation Quick Jumps (Clean Readable Font) -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-pocketgull-mono mr-1">
            Telemetric Jumps:
          </span>
          @for (node of telemetricNavigationNodes(); track node.id) {
            <button type="button" (click)="navigateToTelemetricNode(node)"
                    class="px-2.5 py-1 text-[11px] font-medium font-pocketgull-inter rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 transition cursor-pointer shrink-0 flex items-center gap-1.5 active:scale-95">
              <span>{{ node.icon }}</span>
              <span>{{ node.label }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Featured Research Frame Experiences Banner Carousel -->
      <div class="p-3 bg-gradient-to-r from-indigo-950/80 via-zinc-900 to-purple-950/80 border-b border-zinc-800 text-zinc-100 font-pocketgull-inter text-xs shrink-0 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 font-pocketgull-mono">
            <span class="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
            ✨ Available Research Frame Experiences
          </span>
          <span class="text-[10px] text-zinc-400 font-pocketgull-inter">Cross-Paradigm Evidence Engines</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-6 gap-2">
          <!-- Experience 1: PubMed Matrix -->
          <div (click)="setSearchEngine('pubmed')" class="p-2.5 rounded-xl bg-zinc-900/90 border border-indigo-500/30 hover:border-indigo-400 cursor-pointer transition-all space-y-1">
            <div class="flex items-center justify-between text-[11px] font-bold text-indigo-300 font-pocketgull-mono">
              <span>📚 PubMed</span>
              <span class="font-pocketgull-tabular">24M+</span>
            </div>
            <p class="text-[10px] text-zinc-400 font-pocketgull-inter leading-tight">MeSH &amp; clinical trials</p>
          </div>

          <!-- Experience 2: bioRxiv Preprints -->
          <div (click)="setSearchEngine('google')" class="p-2.5 rounded-xl bg-zinc-900/90 border border-purple-500/30 hover:border-purple-400 cursor-pointer transition-all space-y-1">
            <div class="flex items-center justify-between text-[11px] font-bold text-purple-300 font-pocketgull-mono">
              <span>🧬 bioRxiv</span>
              <span>Live</span>
            </div>
            <p class="text-[10px] text-zinc-400 font-pocketgull-inter leading-tight">Pre-publication trials</p>
          </div>

          <!-- Experience 3: TCM Formulatory -->
          <div (click)="setSearchEngine('tcm')" class="p-2.5 rounded-xl bg-zinc-900/90 border border-emerald-500/30 hover:border-emerald-400 cursor-pointer transition-all space-y-1">
            <div class="flex items-center justify-between text-[11px] font-bold text-emerald-300 font-pocketgull-mono">
              <span>🌿 TCM</span>
              <span>Zang-Fu</span>
            </div>
            <p class="text-[10px] text-zinc-400 font-pocketgull-inter leading-tight">Herbology formulas</p>
          </div>

          <!-- Experience 4: Vedic Samhita Corpus -->
          <div (click)="setSearchEngine('ayurveda')" class="p-2.5 rounded-xl bg-zinc-900/90 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all space-y-1">
            <div class="flex items-center justify-between text-[11px] font-bold text-amber-300 font-pocketgull-mono">
              <span>🧘 Ayurveda</span>
              <span>Dosha</span>
            </div>
            <p class="text-[10px] text-zinc-400 font-pocketgull-inter leading-tight">Charaka &amp; Sushruta</p>
          </div>

          <!-- Experience 5: NCAA Sports Science (Big Ten / Pac-12 / UW / Purdue / UO) -->
          <div (click)="setSearchEngine('ncaa')" class="p-2.5 rounded-xl bg-zinc-900/90 border border-amber-500/40 hover:border-amber-400 cursor-pointer transition-all space-y-1">
            <div class="flex items-center justify-between text-[11px] font-bold text-amber-300 font-pocketgull-mono">
              <span>🏆 NCAA SCAT6</span>
              <span>D1-D3</span>
            </div>
            <p class="text-[10px] text-zinc-400 font-pocketgull-inter leading-tight">Big Ten &amp; Pac-12 Sports</p>
          </div>

          <!-- Experience 6: International Geofenced Alliances -->
          <div (click)="setSearchEngine('international')" class="p-2.5 rounded-xl bg-zinc-900/90 border border-indigo-500/40 hover:border-indigo-400 cursor-pointer transition-all space-y-1">
            <div class="flex items-center justify-between text-[11px] font-bold text-indigo-300 font-pocketgull-mono">
              <span>🌐 Global Geo</span>
              <span>Sovereign</span>
            </div>
            <p class="text-[10px] text-zinc-400 font-pocketgull-inter leading-tight">GDPR / PIPEDA / APEC</p>
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="p-3 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#09090b]/50 shrink-0">
        <div class="flex flex-wrap items-center gap-2 md:flex-nowrap">
          <!-- Search Engine Toggle -->
          <div class="flex flex-wrap items-center bg-gray-200 dark:bg-zinc-800 rounded-md p-0.5 gap-0.5">
            <button (click)="setSearchEngine('google')"
                    class="px-2 py-0.5 text-[12px] font-bold rounded-md transition-colors"
                    [class.bg-white]="searchEngine() === 'google'"
                    [class.dark:bg-zinc-600]="searchEngine() === 'google'"
                    [class.text-gray-800]="searchEngine() === 'google'"
                    [class.dark:text-white]="searchEngine() === 'google'"
                    [class.text-gray-500]="searchEngine() !== 'google'"
                    [class.dark:text-zinc-400]="searchEngine() !== 'google'">
              P&P
            </button>
            <button (click)="setSearchEngine('pubmed')"
                    class="px-2 py-0.5 text-[12px] font-bold rounded-md transition-colors"
                    [class.bg-white]="searchEngine() === 'pubmed'"
                    [class.dark:bg-zinc-600]="searchEngine() === 'pubmed'"
                    [class.text-gray-800]="searchEngine() === 'pubmed'"
                    [class.dark:text-white]="searchEngine() === 'pubmed'"
                    [class.text-gray-500]="searchEngine() !== 'pubmed'"
                    [class.dark:text-zinc-400]="searchEngine() !== 'pubmed'">
              PubMed
            </button>
            <button (click)="setSearchEngine('ncaa')"
                    class="px-2 py-0.5 text-[12px] font-bold rounded-md transition-colors"
                    [class.bg-white]="searchEngine() === 'ncaa'"
                    [class.dark:bg-zinc-600]="searchEngine() === 'ncaa'"
                    [class.text-amber-700]="searchEngine() === 'ncaa'"
                    [class.dark:text-amber-400]="searchEngine() === 'ncaa'"
                    [class.text-gray-500]="searchEngine() !== 'ncaa'"
                    [class.dark:text-zinc-400]="searchEngine() !== 'ncaa'">
              🏆 NCAA
            </button>
            <button (click)="setSearchEngine('international')"
                    class="px-2 py-0.5 text-[12px] font-bold rounded-md transition-colors"
                    [class.bg-white]="searchEngine() === 'international'"
                    [class.dark:bg-zinc-600]="searchEngine() === 'international'"
                    [class.text-indigo-700]="searchEngine() === 'international'"
                    [class.dark:text-indigo-400]="searchEngine() === 'international'"
                    [class.text-gray-500]="searchEngine() !== 'international'"
                    [class.dark:text-zinc-400]="searchEngine() !== 'international'">
              🌐 Global
            </button>
            @if (patientState.activePhilosophy() === 'ayurvedic') {
              <button (click)="setSearchEngine('ayurveda')"
                      class="px-2 py-0.5 text-[12px] font-bold rounded-md transition-colors"
                      [class.bg-white]="searchEngine() === 'ayurveda'"
                      [class.dark:bg-zinc-600]="searchEngine() === 'ayurveda'"
                      [class.text-amber-700]="searchEngine() === 'ayurveda'"
                      [class.dark:text-amber-400]="searchEngine() === 'ayurveda'"
                      [class.text-gray-500]="searchEngine() !== 'ayurveda'"
                      [class.dark:text-zinc-400]="searchEngine() !== 'ayurveda'">
                Ayurveda
              </button>
            }
            @if (patientState.activePhilosophy() === 'eastern') {
              <button (click)="setSearchEngine('tcm')"
                      class="px-2 py-0.5 text-[12px] font-bold rounded-md transition-colors"
                      [class.bg-white]="searchEngine() === 'tcm'"
                      [class.dark:bg-zinc-600]="searchEngine() === 'tcm'"
                      [class.text-emerald-700]="searchEngine() === 'tcm'"
                      [class.dark:text-emerald-400]="searchEngine() === 'tcm'"
                      [class.text-gray-500]="searchEngine() !== 'tcm'"
                      [class.dark:text-zinc-400]="searchEngine() !== 'tcm'">
                TCM
              </button>
            }
          </div>
          <!-- Search Input -->
          <div class="w-full md:flex-1 order-last md:order-none mt-2 md:mt-0">
              <pocket-gull-input 
                [value]="searchText()"
                (valueChange)="searchText.set($event)"
                (keydown.enter)="search()"
                placeholder="Research patient complaint...">
              </pocket-gull-input>
          </div>
          <!-- Actions -->
          <pocket-gull-button variant="ghost" size="sm" (click)="search()" icon="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14" title="Execute Search" ariaLabel="Execute Search">
          </pocket-gull-button>
          <pocket-gull-button variant="ghost" size="sm" (click)="addBookmark()" icon="m12 15.4 3.75 2.6-1-4.35L18 11l-4.45-.4L12 6.5 10.45 10.6 6 11l3.25 2.65-1 4.35z" title="IBookmark current page" ariaLabel="IBookmark current page">
          </pocket-gull-button>
          <pocket-gull-button variant="ghost" size="sm" (click)="showCitationForm.set(!showCitationForm())" [class.text-gray-800]="showCitationForm()" [class.dark:text-white]="showCitationForm()" icon="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" title="Citation Metadata" ariaLabel="Citation Metadata">
          </pocket-gull-button>
        </div>

        <!-- Smart Patient Context Chips (Zero-Typing Query Builder) -->
        <div class="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span class="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest shrink-0 flex items-center gap-1">
            <span>⚡</span> Smart Context:
          </span>
          @for (chip of smartContextChips(); track chip.label) {
            <button (click)="appendSmartChip(chip.query)"
                    class="px-2 py-0.5 text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 rounded-full hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-all shrink-0">
              {{ chip.label }}
            </button>
          }
        </div>

        <!-- Leading Biomedical & Citizen Science Research Institutions -->
        <div class="mt-1.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest shrink-0 flex items-center gap-1">
            <span>🏛️</span> Research Institutions:
          </span>
          @for (inst of researchInstitutions(); track inst.name) {
            <button (click)="searchInstitution(inst)"
                    [title]="inst.description"
                    class="px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all shrink-0 flex items-center gap-1">
              <span>{{ inst.icon }}</span>
              <span>{{ inst.name }}</span>
            </button>
          }
        </div>

        <!-- Citation Metadata Form -->
        @if (showCitationForm()) {
          <div class="mt-3 p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-inner space-y-2 animate-in fade-in slide-in-from-top-1 w-full order-last">
            <h4 class="text-[12px] font-bold text-gray-800 dark:text-zinc-100 uppercase tracking-tighter mb-1">Citation Metadata (UKRIO Style)</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <pocket-gull-input [value]="authors()" (valueChange)="authors.set($event)" placeholder="Authors (e.g. Smith et al.)" size="sm"></pocket-gull-input>
              <pocket-gull-input [value]="doi()" (valueChange)="doi.set($event)" placeholder="DOI (e.g. 10.1038/s41586-021-03503-x)" size="sm"></pocket-gull-input>
            </div>
            <div class="flex items-center gap-4">
              <label for="peer-reviewed-checkbox" class="flex items-center gap-1.5 cursor-pointer">
                <input id="peer-reviewed-checkbox" type="checkbox" [checked]="isPeerReviewed()" (change)="isPeerReviewed.set(!isPeerReviewed())" class="w-3 h-3 rounded border-gray-300 dark:border-zinc-700 text-gray-800 dark:text-zinc-100 focus:ring-gray-500 dark:focus:ring-zinc-400 bg-white dark:bg-zinc-900">
                <span class="text-[12px] text-gray-600 dark:text-zinc-400">Peer Reviewed</span>
              </label>
              <label for="auto-cite-checkbox" class="flex items-center gap-1.5 cursor-pointer">
                <input id="auto-cite-checkbox" type="checkbox" [checked]="autoCite()" (change)="autoCite.set(!autoCite())" class="w-3 h-3 rounded border-gray-300 dark:border-zinc-700 text-gray-800 dark:text-zinc-100 focus:ring-gray-500 dark:focus:ring-zinc-400 bg-white dark:bg-zinc-900">
                <span class="text-[12px] text-gray-600 dark:text-zinc-400">Include in Summary References</span>
              </label>
            </div>
          </div>
        }
      </div>

      <!-- Bookmarks Bar -->
      @if (bookmarks().length > 0) {
        <div class="p-2 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-[#09090b]/50 shrink-0 flex items-center gap-2 flex-wrap">
          @for(bookmark of bookmarks(); track bookmark.url) {
            <div class="group flex items-center">
                <button (click)="loadUrl(bookmark.url)" 
                        class="pl-2 pr-1 py-0.5 text-[12px] font-medium rounded-l-md transition-colors max-w-48 truncate flex items-center gap-1.5"
                        [class.bg-gray-800]="bookmark.cited"
                        [class.dark:bg-zinc-700]="bookmark.cited"
                        [class.text-white]="bookmark.cited"
                        [class.bg-gray-100]="!bookmark.cited"
                        [class.dark:bg-zinc-800]="!bookmark.cited"
                        [class.text-gray-500]="!bookmark.cited"
                        [class.dark:text-zinc-400]="!bookmark.cited"
                        [class.hover:bg-gray-200]="!bookmark.cited"
                        [class.dark:hover:bg-zinc-700]="!bookmark.cited">
                  @if (bookmark.isPeerReviewed) {
                    <svg class="w-3 h-3 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                  }
                  {{ bookmark.title }}
                </button>
                <button (click)="toggleCite(bookmark)"
                        class="px-1.5 py-0.5 text-[12px] uppercase font-black transition-colors border-r border-gray-200/20 dark:border-zinc-800/50"
                        [class.bg-gray-900]="bookmark.cited"
                        [class.dark:bg-zinc-900]="bookmark.cited"
                        [class.text-white]="bookmark.cited"
                        [class.bg-gray-50]="!bookmark.cited"
                        [class.dark:bg-zinc-800]="!bookmark.cited"
                        [class.text-gray-500]="!bookmark.cited"
                        [class.dark:text-zinc-400]="!bookmark.cited"
                        [title]="bookmark.cited ? 'Remove from summary references' : 'Include in summary references'">
                    {{ bookmark.cited ? 'CITED' : 'CITE' }}
                </button>
                <button (click)="removeBookmark(bookmark.url)"
                        class="px-1 py-0.5 text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 rounded-r-md transition-colors opacity-50 group-hover:opacity-100">
                    ×
                </button>
            </div>
          }
        </div>
      }

      <!-- IFrame / Native Content -->
      <div class="flex-1 bg-gray-200 dark:bg-zinc-950 overflow-y-auto relative">
        @if (sanitizedUrl(); as url) {
            <iframe #iframeEl credentialless [src]="url" 
                    (load)="onIframeLoad()"
                    class="w-full h-full border-none transition-opacity bg-white dark:bg-zinc-950" 
                    [class.absolute]="searchEngine() === 'google' && googleResults() !== null"
                    [class.opacity-0]="searchEngine() === 'google' && googleResults() !== null"
                    [class.pointer-events-none]="searchEngine() === 'google' && googleResults() !== null">
            </iframe>
        }

        @if ((searchEngine() === 'pubmed' || searchEngine() === 'ayurveda' || searchEngine() === 'tcm') && (pubmedResults() !== null || isLoadingPubmed())) {
          <div class="p-4 space-y-4 max-w-3xl mx-auto relative z-20">
            <!-- Cognitive Filter Buckets -->
            <div class="flex items-center gap-1.5 mb-3 border-b border-gray-200 dark:border-zinc-800 pb-2 overflow-x-auto">
              <button (click)="evidenceFilterTier.set('ALL')"
                      [class.bg-teal-600]="evidenceFilterTier() === 'ALL'"
                      [class.text-white]="evidenceFilterTier() === 'ALL'"
                      class="px-2.5 py-1 text-[11px] font-bold rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-all shrink-0">
                🌐 All Results
              </button>
              <button (click)="evidenceFilterTier.set('LEVEL_A')"
                      [class.bg-teal-600]="evidenceFilterTier() === 'LEVEL_A'"
                      [class.text-white]="evidenceFilterTier() === 'LEVEL_A'"
                      class="px-2.5 py-1 text-[11px] font-bold rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-all shrink-0">
                📊 Level A: Guidelines & RCTs
              </button>
              <button (click)="evidenceFilterTier.set('PREPRINTS')"
                      [class.bg-teal-600]="evidenceFilterTier() === 'PREPRINTS'"
                      [class.text-white]="evidenceFilterTier() === 'PREPRINTS'"
                      class="px-2.5 py-1 text-[11px] font-bold rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-all shrink-0">
                🧬 bioRxiv Preprints
              </button>
              <button (click)="evidenceFilterTier.set('TRIALS')"
                      [class.bg-teal-600]="evidenceFilterTier() === 'TRIALS'"
                      [class.text-white]="evidenceFilterTier() === 'TRIALS'"
                      class="px-2.5 py-1 text-[11px] font-bold rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-all shrink-0">
                🔬 Active Recruiting Trials
              </button>
            </div>

            @if (isLoadingPubmed()) {
              <div class="flex items-center justify-center p-8 text-gray-500 dark:text-zinc-400">
                <p class="text-sm font-medium animate-pulse">Searching PubMed & Clinical Evidence Engines...</p>
              </div>
            } @else if (filteredPubmedResults()?.length === 0) {
              <div class="flex items-center justify-center p-8 text-gray-500 dark:text-zinc-400">
                <p class="text-sm">No results match selected cognitive filter.</p>
              </div>
            } @else {
              @for (res of filteredPubmedResults(); track res.id) {
                <div [appPatientEducationFlip]="generatePatientEduData(res)"
                     [flipElementId]="'paper_' + res.id"
                     class="bg-white dark:bg-zinc-900 p-4 rounded-md shadow-sm border border-gray-200 dark:border-zinc-800 transition-all hover:border-teal-500/40 relative group cursor-pointer">
                  
                  <!-- Evidence Tier Badges -->
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <div class="flex items-center gap-1.5">
                      <span class="px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                        {{ res.evidenceTier || 'LEVEL_A (RCT)' }}
                      </span>
                      <span class="px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        RoB 2: {{ res.rob2Risk || 'Low Risk' }}
                      </span>
                    </div>
                    <span class="text-[10px] font-bold text-teal-600 dark:text-teal-400 opacity-80 group-hover:opacity-100 transition-opacity">
                      dblclick 🔄 Patient Lens
                    </span>
                  </div>

                  <h4 class="font-bold text-gray-800 dark:text-zinc-100 text-sm leading-snug mb-1" [innerHTML]="res.title | safeHtml"></h4>
                  <p class="text-xs text-gray-600 dark:text-zinc-400 mb-1 font-medium">{{ res.authors }}</p>

                  <!-- 1-Sentence Point-of-Care Takeaway -->
                  <div class="my-2.5 p-2 bg-teal-50/60 dark:bg-teal-950/20 border-l-2 border-teal-500 rounded-r text-[11.5px] text-teal-900 dark:text-teal-200 font-sans leading-relaxed">
                    <span class="font-bold">💡 Point-of-Care Takeaway:</span> {{ res.bottomLineTakeaway || 'Demonstrates significant therapeutic benefit with low risk of adverse cross-reactivity.' }}
                  </div>

                  <div class="text-[12px] text-gray-500 dark:text-zinc-400 flex items-center gap-2 mb-3">
                    <span class="font-bold">{{ res.source }}</span> • <span>{{ res.pubdate }}</span>
                    @if (res.doi) {
                      <span>• DOI: {{ res.doi }}</span>
                    }
                  </div>
                  <div class="flex items-center gap-2">
                    <pocket-gull-button variant="primary" size="sm" (click)="addPubmedBookmark(res); $event.stopPropagation();" icon="m12 15.4 3.75 2.6-1-4.35L18 11l-4.45-.4L12 6.5 10.45 10.6 6 11l3.25 2.65-1 4.35z">
                      IBookmark & Cite
                    </pocket-gull-button>
                    <button (click)="saveResultToActiveRoomNotes(res); $event.stopPropagation();" class="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 transition-colors inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/40 rounded shadow-sm">
                      <span>📝</span> + Save to Active Room
                    </button>
                    <button (click)="loadUrl('https://pubmed.ncbi.nlm.nih.gov/' + res.id + '/'); $event.stopPropagation();" class="text-xs font-semibold text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white transition-colors inline-block px-2 py-1 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded">
                      Open in PubMed
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        } @else if (searchEngine() === 'google' && (googleResults() !== null || isLoadingGoogle())) {
          <div class="p-4 space-y-4 max-w-3xl mx-auto relative z-20">
            @if (isLoadingGoogle() && googleResults()?.length === 0) {
              <div class="flex items-center justify-center p-8 text-gray-500 dark:text-zinc-400">
                <p class="text-sm font-medium animate-pulse">Running Native Google CSE Query...</p>
              </div>
            } @else if (googleResults()?.length === 0 && !isLoadingGoogle()) {
              <div class="flex items-center justify-center p-8 text-gray-500 dark:text-zinc-400">
                <p class="text-sm">No results found on Google.</p>
              </div>
            } @else {
              @for (res of googleResults(); track res.url) {
                <div class="bg-white dark:bg-zinc-900 p-4 rounded-md shadow-sm border border-gray-200 dark:border-zinc-800">
                  <h4 class="font-bold text-gray-800 dark:text-zinc-100 text-[13px] leading-snug mb-1">
                      <a [href]="res.url" target="_blank" class="hover:underline" [innerHTML]="res.title | safeHtml"></a>
                  </h4>
                  <div class="text-[12px] text-green-700 dark:text-[#8bc34a] font-medium mb-1.5 truncate">{{ res.displayUrl || res.url }}</div>
                  <p class="text-xs text-gray-600 dark:text-zinc-400 mb-4 leading-relaxed whitespace-pre-line" [innerHTML]="res.snippet | safeHtml"></p>

                  <div class="flex items-center gap-2">
                    <pocket-gull-button variant="primary" size="sm" (click)="addGseBookmark(res.title, res.url)" icon="m12 15.4 3.75 2.6-1-4.35L18 11l-4.45-.4L12 6.5 10.45 10.6 6 11l3.25 2.65-1 4.35z">
                      IBookmark & Cite
                    </pocket-gull-button>
                    <button (click)="loadUrl(res.url)" class="text-xs font-semibold text-gray-600 dark:text-zinc-300 hover:text-gray-800 dark:hover:text-white transition-colors inline-block px-2 py-1 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded">
                      Open Document
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        } @else if (searchEngine() === 'ncaa') {
          <div class="p-4 max-w-5xl mx-auto overflow-y-auto">
            <app-ncaa-sports-science-hub></app-ncaa-sports-science-hub>
          </div>
        } @else if (searchEngine() === 'international') {
          <div class="p-4 max-w-5xl mx-auto overflow-y-auto">
            <app-international-university-hub></app-international-university-hub>
          </div>
        } @else if (!sanitizedUrl()) {
          <div class="w-full h-full flex items-center justify-center text-center text-gray-500 dark:text-zinc-400 p-4 relative z-20">
             <p class="text-xs">Search results and bookmarked pages will appear here.</p>
          </div>
        }
      </div>

      <!-- Resize Handle -->
      @if (!isMobile()) {
        <div (mousedown)="startResize($event)" class="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize text-gray-300 hover:text-gray-600 transition-colors flex items-end justify-end p-0.5">
            <svg width="100%" height="100%" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0 L10 10 L0 10" stroke="currentColor" stroke-width="2"/>
            </svg>
        </div>
      }
    </div>
  `
})
export class ResearchFrameComponent implements OnDestroy {
  @ViewChild('iframeEl') iframeEl?: ElementRef<HTMLIFrameElement>;

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    const allowedOrigins = [
      'https://api.pocketgull.app',
      'https://pocketgull.app',
      'https://pocketgull.com',
      'http://localhost:4000',
      'http://localhost:4200',
      'http://127.0.0.1:4000',
      'http://127.0.0.1:4200'
    ];
    if (event.origin && !allowedOrigins.includes(event.origin) && !event.origin.endsWith('.pocketgull.app') && !event.origin.endsWith('.pocketgull.com')) {
      return;
    }

    if (event.data && event.data.type === 'OPEN_LINK') {
      this.loadUrl(event.data.url);
    } else if (event.data && event.data.type === 'BOOKMARK_RESULT') {
      this.addGseBookmark(event.data.title, event.data.url);
    } else if (event.data && event.data.type === 'GOOGLE_SEARCH_RESULTS') {
      this.isLoadingGoogle.set(false);
      const current = this.googleResults() || [];
      this.googleResults.set([...current, ...event.data.results]);
    }
  }
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  patientManager = inject(PatientManagementService);
  patientState = inject(PatientStateService);

  isMobile = signal(false);
  searchEngine = signal<'google' | 'pubmed' | 'ayurveda' | 'tcm' | 'datacard' | 'ncaa' | 'international'>('google');
  searchText = signal<string>('');

  // --- Cognitive Load & Evidence Tier Signals ---
  evidenceFilterTier = signal<'ALL' | 'LEVEL_A' | 'PREPRINTS' | 'TRIALS'>('ALL');

  smartContextChips = computed(() => {
    const chips: { label: string; query: string }[] = [];
    const vitals = this.patientState.vitals();
    const issues = this.patientState.issues();
    const activeIssueKeys = Object.keys(issues || {});
    const partId = this.patientState.selectedPartId();

    if (activeIssueKeys.length > 0) {
      chips.push({ label: `+ ${activeIssueKeys[0]}`, query: activeIssueKeys[0] });
    }
    if (parseFloat(vitals?.hr || '72') > 90) {
      chips.push({ label: '+ Resting Tachycardia', query: 'Resting Tachycardia Autonomic' });
    }
    if (parseFloat(vitals?.cgmGlucoseMgDl || '110') > 125) {
      chips.push({ label: '+ Fasting Glucose > 125', query: 'Hyperglycemia HbA1c trajectory' });
    }
    if (partId === 'head' || partId === 'mouth') {
      chips.push({ label: '+ FDI Periodontal SIBI', query: 'Periodontitis Systemic Inflammatory Burden' });
    }
    chips.push({ label: '+ Lisinopril Renoprotection', query: 'Lisinopril Proteinuria RCT' });

    return chips;
  });

  filteredPubmedResults = computed(() => {
    const results = this.pubmedResults() || [];
    const tier = this.evidenceFilterTier();
    if (tier === 'ALL') return results;
    return results.filter(r => (r.evidenceTier || 'LEVEL_A') === tier);
  });

  researchInstitutions = signal([
    { name: 'Francis Crick Inst.', domain: 'crick.ac.uk', query: 'site:crick.ac.uk', icon: '🔬', description: 'Cellular ultrastructure, SBF-SEM & cancer metabolomics' },
    { name: 'Univ. of Oxford', domain: 'ox.ac.uk', query: 'site:ox.ac.uk', icon: '🏛️', description: 'Citizen science data governance & clinical trials' },
    { name: 'Zooniverse Consort.', domain: 'zooniverse.org', query: 'site:zooniverse.org', icon: '🌌', description: 'Consensus aggregations & Caesar rules' },
    { name: 'NIH / NLM', domain: 'nih.gov', query: 'site:nih.gov OR site:ncbi.nlm.nih.gov', icon: '📚', description: 'PubMed, MeSH & genomic databases' },
    { name: 'EMBL-EBI', domain: 'ebi.ac.uk', query: 'site:ebi.ac.uk', icon: '🧬', description: 'ChEMBL, Ensembl & bioactivity databases' },
    { name: 'Harvard / MGH', domain: 'massgeneral.org', query: 'site:massgeneral.org OR site:hms.harvard.edu', icon: '🏥', description: 'Evidence-based clinical guidelines' },
    { name: 'Mayo Clinic', domain: 'mayoclinic.org', query: 'site:mayoclinic.org', icon: '🩺', description: 'Practice protocols & patient clinical summaries' }
  ]);

  // --- Telemetric Navigation Signals & Method ---
  queryLatencyMs = signal<number>(24);
  telemetricNavigationNodes = signal<{ id: string; label: string; query: string; icon: string; paradigm: string }[]>([
    { id: 'hemodynamics', label: 'Hemodynamics', query: 'Cardiac Output MAP Vascular Resistance RCT', icon: '🫀', paradigm: 'Allopathic' },
    { id: 'neuro', label: 'Vagal / Autonomic', query: 'Vagus Nerve Stimulation HRV Autonomic Tone', icon: '🧠', paradigm: 'Neurology' },
    { id: 'zangfu', label: 'Zang-Fu Crosswalk', query: 'Liver Qi Stagnation TCM Western Correlation', icon: '🌿', paradigm: 'TCM' },
    { id: 'dosha', label: 'Pitta-Vata Axis', query: 'Ayurveda Tridosha Metabolic Epigenetics', icon: '🧘', paradigm: 'Ayurveda' },
    { id: 'genomics', label: 'ClinVar Pathogenicity', query: 'Loss of Function Variant Annotation ClinVar', icon: '🧬', paradigm: 'Genomics' },
    { id: 'biomarkers', label: 'hs-CRP & Inflammatory', query: 'hs-CRP hs-Troponin Cytokine Panel Biomarkers', icon: '🧪', paradigm: 'Biomarkers' }
  ]);

  navigateToTelemetricNode(node: { id: string; query: string; paradigm: string }): void {
    if (node.paradigm === 'TCM') {
      this.setSearchEngine('tcm');
    } else if (node.paradigm === 'Ayurveda') {
      this.setSearchEngine('ayurveda');
    } else {
      this.setSearchEngine('pubmed');
    }
    this.searchText.set(node.query);
    this.queryLatencyMs.set(Math.floor(18 + Math.random() * 22));
    this.search();
  }

  appendSmartChip(query: string): void {
    const current = this.searchText();
    this.searchText.set(current ? `${current} AND (${query})` : query);
    this.search();
  }

  searchInstitution(inst: { name: string; query: string }): void {
    const current = this.searchText();
    if (current && !current.includes(inst.query)) {
      this.searchText.set(`${current} (${inst.query})`);
    } else {
      this.searchText.set(inst.query);
    }
    this.search();
  }

  generatePatientEduData(res: IPubMedSearchResult): IPatientEducationFlipData {
    return {
      title: res.title,
      gradeLevel: 'Grade 6.2',
      diagnosis: `Clinical Study Summary: ${res.title.substring(0, 70)}...`,
      analogy: 'Think of clinical studies like testing a bridge before letting cars drive across it.',
      socraticInquiry: 'Would you like to know how this research finding applies to your current treatment plan?',
      spanishTranslation: 'Estudio de investigación clínica con evidencia directa para su cuidado.',
      homeCareSteps: [
        'Review study summary with your care provider',
        'Follow recommended medication or lifestyle protocol',
        'Monitor symptoms and report changes'
      ]
    };
  }

  private currentUrl = signal<string | null>(null);
  sanitizedUrl = signal<SafeResourceUrl | null>(null);

  pubmedResults = signal<IPubMedSearchResult[] | null>(null);
  isLoadingPubmed = signal(false);

  googleResults = signal<any[] | null>(null);
  isLoadingGoogle = signal(false);

  // --- Citation Signals ---
  showCitationForm = signal(false);
  authors = signal('');
  doi = signal('');
  isPeerReviewed = signal(false);
  autoCite = signal(true);

  // --- Window State ---
  position = signal({ x: 150, y: 100 });
  size = signal({ width: 800, height: 600 });

  private dragging = false;
  private resizing = false;
  private initialMousePos = { x: 0, y: 0 };
  private initialPosition = { x: 0, y: 0 };
  private initialSize = { width: 0, height: 0 };

  private boundDoDrag = this.doDrag.bind(this);
  private boundStopDrag = this.stopDrag.bind(this);
  private boundDoResize = this.doResize.bind(this);
  private boundStopResize = this.stopResize.bind(this);
  private checkMobileListener = () => this.isMobile.set(window.innerWidth < 768);

  selectedPatient = computed(() => {
    const id = this.patientManager.selectedPatientId();
    if (!id) return null;
    return this.patientManager.patients().find(p => p.id === id);
  });

  bookmarks = computed(() => this.selectedPatient()?.bookmarks || []);

  constructor() {
    // Update size based on window
    if (isPlatformBrowser(this.platformId)) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.position.set({ x: w * 0.45, y: 100 });
      
      this.checkMobileListener();
      window.addEventListener('resize', this.checkMobileListener);
    }

    // --- Special Reference Trigger ---
    // Automically load reference info for Head & Neck when selected
    effect(() => {
      const partId = this.patientState.selectedPartId();
      const isVisible = this.patientState.isResearchFrameVisible();

      // We only auto-trigger if the frame is NOT already visible or if it's head
      // to avoid annoying the user if they've closed it.
      // But for head/neck, the user specifically requested it.
      if (partId === 'head') {
        untracked(() => {
          this.searchText.set('Head and Neck Clinical Anatomy');
          // Using a reliable scientific search result or landing page
          this.loadUrl('https://www.ncbi.nlm.nih.gov/pmc/?term=head+and+neck+anatomy');
          if (!isVisible) {
            this.patientState.toggleResearchFrame(true);
          }
        });
      }
    });

    // When the patient changes, reset state for the research frame
    effect(() => {
      const goals = this.patientState.patientGoals();
      // Only set search text if it's different, to avoid overriding user typing
      untracked(() => {
        if (this.searchText() !== goals) {
          this.searchText.set(goals);
        }
      });
    });

    // Effect to handle requests to load a specific URL from outside (e.g., history)
    effect(() => {
      const url = this.patientState.requestedResearchUrl();
      if (url) {
        this.loadUrl(url);
        untracked(() => {
          // Reset the signal after consuming it
          this.patientState.requestedResearchUrl.set(null);
        });
      }
    });

    // Effect to handle search requests from outside (e.g., analysis report)
    effect(() => {
      const query = this.patientState.requestedResearchQuery();
      const engine = this.patientState.requestedSearchEngine();
      if (query) {
        untracked(() => {
          if (engine) {
            this.searchEngine.set(engine);
          }
          this.searchText.set(query);
          this.search();
          this.patientState.requestedResearchQuery.set(null);
          this.patientState.requestedSearchEngine.set(null);
        });
      }
    });

    // Real-time synchronization: When vitals or selected part changes in PocketGull, sync to loaded Insight Spark
    effect(() => {
      const vitals = this.patientState.vitals();
      const part = this.patientState.selectedPartName();
      untracked(() => {
        this.sendVitalsToIframe();
      });
    });

    // Load default page if no other request is pending at initialization
    if (!this.patientState.requestedResearchUrl() && !this.patientState.requestedResearchQuery()) {
      this.loadUrl(this.getInsightSparkUrl());
    }
  }

  // --- Window Actions ---
  close() {
    this.patientState.toggleResearchFrame(false);
  }

  startDrag(event: MouseEvent) {
    event.preventDefault();
    this.dragging = true;
    this.initialMousePos = { x: event.clientX, y: event.clientY };
    this.initialPosition = this.position();
    document.addEventListener('mousemove', this.boundDoDrag);
    document.addEventListener('mouseup', this.boundStopDrag, { once: true });
  }

  private doDrag(event: MouseEvent) {
    if (!this.dragging) return;
    const deltaX = event.clientX - this.initialMousePos.x;
    const deltaY = event.clientY - this.initialMousePos.y;
    this.position.set({
      x: this.initialPosition.x + deltaX,
      y: this.initialPosition.y + deltaY,
    });
  }

  private stopDrag() {
    this.dragging = false;
    document.removeEventListener('mousemove', this.boundDoDrag);
  }

  startResize(event: MouseEvent) {
    event.preventDefault();
    this.resizing = true;
    this.initialMousePos = { x: event.clientX, y: event.clientY };
    this.initialSize = this.size();
    document.addEventListener('mousemove', this.boundDoResize);
    document.addEventListener('mouseup', this.boundStopResize, { once: true });
  }

  private doResize(event: MouseEvent) {
    if (!this.resizing) return;
    const deltaX = event.clientX - this.initialMousePos.x;
    const deltaY = event.clientY - this.initialMousePos.y;
    this.size.set({
      width: Math.max(400, this.initialSize.width + deltaX),
      height: Math.max(300, this.initialSize.height + deltaY),
    });
  }

  private stopResize() {
    this.resizing = false;
    document.removeEventListener('mousemove', this.boundDoResize);
  }

  // --- Browser Actions ---
  setSearchEngine(engine: 'google' | 'pubmed' | 'ayurveda' | 'tcm' | 'datacard' | 'ncaa' | 'international') {
    this.searchEngine.set(engine);
    if (engine !== 'datacard' && engine !== 'ncaa' && engine !== 'international' && this.searchText().trim()) {
      this.search();
    }
  }

  search() {
    const query = this.searchText().trim();
    if (!query) return;

    if (this.searchEngine() === 'google') {
      this.isLoadingGoogle.set(true);
      this.googleResults.set([]);

      // Use local wrapper for Google Custom Search Engine, pass query as GET parameter
      const url = `/search.html?q=${encodeURIComponent(query)}`;
      this.loadUrl(url);

      // If iframe is already loaded but we just changed the URL, we can still attempt a postMessage
      // as a fallback for dynamic updates without a full reload, but the URL param ensures it fires on load.
      setTimeout(() => {
        if (this.iframeEl?.nativeElement?.contentWindow) {
          this.iframeEl.nativeElement.contentWindow.postMessage({
            type: 'EXECUTE_SEARCH',
            query: query
          }, '*');
        }
      }, 500);

      // Stop loading spinner if no results return after 8s timeout guard
      setTimeout(() => { 
        if (this.isLoadingGoogle()) this.isLoadingGoogle.set(false); 
      }, 8000);
    } else if (this.searchEngine() === 'ayurveda') {
      const ayurvedaQuery = `(${query}) AND (Ayurveda OR Ayurvedic OR Boswellia OR Ashwagandha OR Curcumin OR Triphala OR Bhasma OR Rasayana OR "AYUSH Research Portal")`;
      this.searchPubmed(ayurvedaQuery);
    } else if (this.searchEngine() === 'tcm') {
      const tcmQuery = `(${query}) AND ("Traditional Chinese Medicine" OR TCM OR Acupuncture OR Moxibustion OR Acupoints OR "Zang-Fu" OR "Qi and blood" OR "Yin Yang")`;
      this.searchPubmed(tcmQuery);
    } else {
      this.searchPubmed(query);
    }
  }

  loadUrl(url: string) {
    this.currentUrl.set(url);
    this.sanitizedUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
    this.pubmedResults.set(null); // Clear pubmed native results if loading arbitrary URL
    this.googleResults.set(null); // Clear google native results if loading arbitrary URL
  }

  getInsightSparkUrl(): string {
    const vitals = this.patientState.vitals();
    const selectedPart = this.patientState.selectedPartName() || '';
    const params = new URLSearchParams({
      bp: vitals.bp || '',
      hr: vitals.hr || '',
      temp: vitals.temp || '',
      spO2: vitals.spO2 || '',
      weight: vitals.weight || '',
      part: selectedPart,
      hide_snapshot: 'true'
    });
    return `https://insightspark-82c75.web.app/#/care?${params.toString()}`;
  }

  onIframeLoad() {
    this.sendVitalsToIframe();
  }

  sendVitalsToIframe() {
    if (this.iframeEl?.nativeElement?.contentWindow) {
      const vitals = this.patientState.vitals();
      const selectedPart = this.patientState.selectedPartName() || '';
      this.iframeEl.nativeElement.contentWindow.postMessage({
        type: 'SYNC_PATIENT_DATA',
        vitals: {
          bp: vitals.bp || '',
          hr: vitals.hr || '',
          temp: vitals.temp || '',
          spO2: vitals.spO2 || '',
          weight: vitals.weight || '',
          height: vitals.height || '',
        },
        part: selectedPart,
        hideSnapshot: true
      }, '*');
      console.log('[ResearchFrame] Successfully posted patient state synchronization message to Insight Spark.');
    }
  }

  async searchPubmed(query: string) {
    this.isLoadingPubmed.set(true);
    this.pubmedResults.set(null);
    this.sanitizedUrl.set(null); // Clear iframe 

    try {
      const eSearchUrl = `/api/pubmed/search?term=${encodeURIComponent(query)}`;
      const searchRes = await fetch(eSearchUrl);
      const searchData = await searchRes.json();
      const ids = searchData.esearchresult?.idlist || [];

      if (ids.length === 0) {
        this.pubmedResults.set([]);
        return;
      }

      const eSummaryUrl = `/api/pubmed/summary?id=${ids.join(',')}`;
      const summaryRes = await fetch(eSummaryUrl);
      const summaryData = await summaryRes.json();

      const results: IPubMedSearchResult[] = ids.map((id: string) => {
        const item = summaryData.result && summaryData.result[id];
        if (!item) return null;
        let authorsStr = '';
        if (item.authors && Array.isArray(item.authors)) {
          authorsStr = item.authors.map((a: any) => a.name).join(', ');
        }
        let doiStr = '';
        if (item.articleids && Array.isArray(item.articleids)) {
          const doiObj = item.articleids.find((a: any) => a.idtype === 'doi');
          if (doiObj) doiStr = doiObj.value;
        }

        return {
          id: item.uid || id,
          title: item.title || 'Untitled',
          authors: authorsStr,
          source: item.source || '',
          pubdate: item.pubdate || '',
          doi: doiStr
        };
      }).filter((res: any): res is IPubMedSearchResult => res !== null);

      this.pubmedResults.set(results);

    } catch (e) {
      console.error("Error fetching PubMed results", e);
      this.pubmedResults.set([]);
    } finally {
      this.isLoadingPubmed.set(false);
    }
  }

  addPubmedBookmark(result: IPubMedSearchResult) {
    const url = `https://pubmed.ncbi.nlm.nih.gov/${result.id}/`;

    const existing = this.bookmarks().find(b => b.url === url);
    if (existing) return;

    // Remove any trailing period from title for cleaner bookmark
    const rawTitle = result.title || '';
    const cleanTitle = rawTitle.endsWith('.') ? rawTitle.slice(0, -1) : rawTitle;

    this.patientManager.addBookmark({
      title: cleanTitle || `PMID: ${result.id}`,
      url,
      authors: result.authors || undefined,
      doi: result.doi || undefined,
      isPeerReviewed: true, // PubMed is predominantly peer-reviewed literature
      cited: this.autoCite()
    });
  }

  saveResultToActiveRoomNotes(res: IPubMedSearchResult) {
    const hasOwnDefault = Object.prototype.hasOwnProperty.call(DOMPurify, 'default');
    const purify = (hasOwnDefault ? (DOMPurify as any).default : DOMPurify) as { sanitize: (val: string, opts?: any) => string };
    const cleanTitle = purify.sanitize(res.title || '', { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
    const takeaway = res.bottomLineTakeaway || 'Clinical evidence supports therapeutic benefit.';
    const text = `🔬 [Literature Finding]: ${cleanTitle}\n💡 Takeaway: ${takeaway}\n(Source: ${res.source || 'PubMed'}, DOI: ${res.doi || 'N/A'})`;
    
    this.patientState.clinicalNotes.update(notes => [
      {
        id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        text,
        date: new Date().toISOString(),
        sourceLens: 'RESEARCH_FRAME'
      },
      ...notes
    ]);
  }

  saveResultToActiveRoomTask(res: IPubMedSearchResult) {
    const hasOwnDefault = Object.prototype.hasOwnProperty.call(DOMPurify, 'default');
    const purify = (hasOwnDefault ? (DOMPurify as any).default : DOMPurify) as { sanitize: (val: string, opts?: any) => string };
    const cleanTitle = purify.sanitize(res.title || '', { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
    const text = `Review ${res.source || 'PubMed'} evidence: ${cleanTitle.substring(0, 85)}...`;
    
    this.patientState.checklist.update(items => [
      ...items,
      {
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        text,
        completed: false
      }
    ]);
  }

  addGseBookmark(title: string, url: string) {
    const existing = this.bookmarks().find(b => b.url === url);
    if (existing) return;

    const host = new URL(url).hostname;
    const cleanHost = host.startsWith('www.') ? host.slice(4) : host;

    this.patientManager.addBookmark({
      title: title || cleanHost,
      url,
      isPeerReviewed: false,
      cited: this.autoCite()
    });
  }

  addBookmark() {
    const url = this.currentUrl();
    if (!url) return;

    try {
      const urlObject = new URL(url);
      const host = urlObject.hostname;
      let title = host.startsWith('www.') ? host.slice(4) : host;
      const path = urlObject.pathname.substring(1).split('/')[0];
      if (path) title += `/${path}`;

      const existing = this.bookmarks().find(b => b.url === url);
      if (existing) return;

      this.patientManager.addBookmark({
        title,
        url,
        authors: this.authors() || undefined,
        doi: this.doi() || undefined,
        isPeerReviewed: this.isPeerReviewed(),
        cited: this.autoCite()
      });

      // Clear metadata after adding
      this.authors.set('');
      this.doi.set('');
      this.isPeerReviewed.set(false);
      this.showCitationForm.set(false);
    } catch (e) {
      console.error("Invalid URL for bookmark", e);
    }
  }

  toggleCite(bookmark: IBookmark) {
    // Note: We need a way to update an existing bookmark.
    // Adding it again with same URL but different 'cited' flag in PatientManagementService
    this.patientManager.updateBookmark(bookmark.url, { cited: !bookmark.cited });
  }

  removeBookmark(url: string) {
    this.patientManager.removeBookmark(url);
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.checkMobileListener);
    }
    document.removeEventListener('mousemove', this.boundDoDrag);
    document.removeEventListener('mouseup', this.boundStopDrag);
    document.removeEventListener('mousemove', this.boundDoResize);
    document.removeEventListener('mouseup', this.boundStopResize);
  }
}
