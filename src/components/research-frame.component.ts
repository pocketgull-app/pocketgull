import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, viewChild, ElementRef, OnDestroy, untracked, HostListener, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SafeHtmlPipe } from '../pipes/safe-html-new.pipe';
import { PatientManagementService } from '../services/patient-management.service';
import { PatientStateService } from '../services/patient-state.service';
import { IBookmark } from '../services/patient.types';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { PocketGullInputComponent } from './shared/pocket-gull-input.component';
import { PatientEducationFlipDirective, IPatientEducationFlipData } from '../directives/patient-education-flip.directive';
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

export interface IArxivSearchResult {
  id: string;
  rawId: string;
  title: string;
  summary: string;
  authors: string;
  published: string;
  updated: string;
  primaryCategory: string;
  doi?: string;
  pdfUrl: string;
  absUrl: string;
  arxivLabs: {
    nasaAds?: string;
    googleScholar?: string;
    semanticScholar?: string;
    ar5ivHtml?: string;
    connectedPapers: string;
    papersWithCode: string;
    huggingFace: string;
    scite: string;
  };
}

export interface IEuropePmcSearchResult {
  id: string;
  pmid?: string;
  pmcid?: string;
  doi?: string;
  title: string;
  authors: string;
  journal: string;
  pubYear: string;
  abstractText: string;
  isOpenAccess: boolean;
  isPreprint: boolean;
  fullTextUrl?: string;
}

@Component({
  selector: 'app-research-frame',
  standalone: true,
  imports: [CommonModule, PocketGullButtonComponent, PocketGullInputComponent, SafeHtmlPipe, PatientEducationFlipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="tour-research-frame-window" class="flex flex-col bg-white dark:bg-[#09090b] shadow-2xl border border-gray-300 dark:border-zinc-800 rounded-none md:rounded-2xl overflow-hidden z-40 transition-all font-mono"
         [class.fixed]="isMobile()"
         [class.inset-0]="isMobile()"
         [class.absolute]="!isMobile()"
         [style.left.px]="isMobile() ? null : position().x"
         [style.top.px]="isMobile() ? null : position().y"
         [style.width.px]="isMobile() ? null : size().width"
         [style.height.px]="isMobile() ? null : size().height"
         [style.max-height]="isMobile() ? '100dvh' : 'none'">
      
      <!-- Header / Drag Handle -->
      <div (mousedown)="isMobile() ? null : startDrag($event)" 
           [class.cursor-move]="!isMobile()"
           class="h-11 px-4 flex items-center justify-between bg-zinc-900 border-b border-zinc-800 shrink-0 select-none text-zinc-100">
        <div class="flex items-center gap-2.5">
          <span class="text-base">🔬</span>
          <div>
            <h3 class="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
              Open Science & ArXivLabs Literature Suite
            </h3>
          </div>
        </div>
        <pocket-gull-button variant="ghost" size="sm" (click)="close()" icon="M12 10.586 16.95 5.636a1 1 0 1 1 1.414 1.414L13.414 12l4.95 4.95a1 1 0 0 1-1.414 1.414L12 13.414l-4.95 4.95a1 1 0 0 1-1.414-1.414L10.586 12 5.636 7.05a1 1 0 0 1 1.414-1.414L12 10.586z" title="Close Research Window" ariaLabel="Close Research Window">
        </pocket-gull-button>
      </div>

      <!-- Featured Experiences Carousel -->
      <div class="p-3 bg-gradient-to-r from-indigo-950/90 via-zinc-950 to-purple-950/90 border-b border-zinc-800 text-zinc-100 text-xs shrink-0 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
            ✨ Open Science & Preprint Hubs
          </span>
          <span class="text-[10px] text-zinc-400 font-sans">Cross-Paradigm Evidence Engines</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <!-- Experience 1: PubMed Index -->
          <div (click)="setSearchEngine('pubmed')"
            [class.border-indigo-400]="searchEngine() === 'pubmed'"
            [class.bg-indigo-950/40]="searchEngine() === 'pubmed'"
            class="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-indigo-400 cursor-pointer transition-all space-y-1">
            <div class="flex items-center justify-between text-[11px] font-bold text-indigo-300">
              <span>📚 PubMed Index</span>
              <span>24M+</span>
            </div>
            <p class="text-[9.5px] text-zinc-400 font-sans leading-tight">MeSH graph & clinical trials</p>
          </div>

          <!-- Experience 2: arXiv & ArXivLabs -->
          <div (click)="setSearchEngine('arxiv')"
            [class.border-purple-400]="searchEngine() === 'arxiv'"
            [class.bg-purple-950/40]="searchEngine() === 'arxiv'"
            class="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-purple-400 cursor-pointer transition-all space-y-1">
            <div class="flex items-center justify-between text-[11px] font-bold text-purple-300">
              <span>🌌 arXivLabs</span>
              <span>Preprints</span>
            </div>
            <p class="text-[9.5px] text-zinc-400 font-sans leading-tight">Connected Papers & AI Models</p>
          </div>

          <!-- Experience 3: Europe PMC -->
          <div (click)="setSearchEngine('europepmc')"
            [class.border-emerald-400]="searchEngine() === 'europepmc'"
            [class.bg-emerald-950/40]="searchEngine() === 'europepmc'"
            class="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-emerald-400 cursor-pointer transition-all space-y-1">
            <div class="flex items-center justify-between text-[11px] font-bold text-emerald-300">
              <span>🧬 Europe PMC</span>
              <span>OpenAccess</span>
            </div>
            <p class="text-[9.5px] text-zinc-400 font-sans leading-tight">medRxiv, bioRxiv & full text</p>
          </div>

          <!-- Experience 4: Traditional Medicine -->
          <div (click)="setSearchEngine(patientState.activePhilosophy() === 'eastern' ? 'tcm' : 'ayurveda')"
            [class.border-amber-400]="searchEngine() === 'tcm' || searchEngine() === 'ayurveda'"
            [class.bg-amber-950/40]="searchEngine() === 'tcm' || searchEngine() === 'ayurveda'"
            class="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-400 cursor-pointer transition-all space-y-1">
            <div class="flex items-center justify-between text-[11px] font-bold text-amber-300">
              <span>🌿 Formulatory</span>
              <span>TCM / Veda</span>
            </div>
            <p class="text-[9.5px] text-zinc-400 font-sans leading-tight">Zang-Fu & Dosha pharmacognosy</p>
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="p-3 border-b border-zinc-800 bg-zinc-950/90 shrink-0">
        <div class="flex flex-wrap items-center gap-2 md:flex-nowrap">
          <!-- Search Engine Toggle -->
          <div class="flex flex-wrap items-center bg-zinc-900 rounded-xl p-1 gap-1 border border-zinc-800 text-[11px] font-bold">
            <button (click)="setSearchEngine('pubmed')"
              class="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              [ngClass]="searchEngine() === 'pubmed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'">
              PubMed
            </button>
            <button (click)="setSearchEngine('arxiv')"
              class="px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
              [ngClass]="searchEngine() === 'arxiv' ? 'bg-purple-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'">
              <span>🌌</span> arXivLabs
            </button>
            <button (click)="setSearchEngine('europepmc')"
              class="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              [ngClass]="searchEngine() === 'europepmc' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'">
              Europe PMC
            </button>
            <button (click)="setSearchEngine('google')"
              class="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              [ngClass]="searchEngine() === 'google' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'">
              Web CSE
            </button>
          </div>

          <!-- Search Input -->
          <div class="w-full md:flex-1 order-last md:order-none mt-2 md:mt-0">
            <pocket-gull-input 
              [value]="searchText()"
              (valueChange)="searchText.set($event)"
              (keydown.enter)="search()"
              placeholder="Search clinical topics, genes, or trials across arXiv & PubMed...">
            </pocket-gull-input>
          </div>

          <!-- Actions -->
          <pocket-gull-button variant="ghost" size="sm" (click)="search()" icon="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14" title="Execute Search" ariaLabel="Execute Search">
          </pocket-gull-button>
          <pocket-gull-button variant="ghost" size="sm" (click)="addBookmark()" icon="m12 15.4 3.75 2.6-1-4.35L18 11l-4.45-.4L12 6.5 10.45 10.6 6 11l3.25 2.65-1 4.35z" title="Bookmark current page" ariaLabel="Bookmark current page">
          </pocket-gull-button>
          <pocket-gull-button variant="ghost" size="sm" (click)="showCitationForm.set(!showCitationForm())" icon="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" title="Citation Exporter" ariaLabel="Citation Exporter">
          </pocket-gull-button>
          <button (click)="showGrantGenerator.set(!showGrantGenerator())"
            [class.bg-purple-900/60]="showGrantGenerator()"
            class="px-2 py-1 text-[11px] font-bold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-purple-300 border border-purple-800/50 transition-all flex items-center gap-1 cursor-pointer">
            <span>📑</span>
            <span>Grant Dossier</span>
          </button>
        </div>

        <!-- Smart Patient Context Chips -->
        <div class="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span class="text-[10px] font-bold text-teal-400 uppercase tracking-widest shrink-0 flex items-center gap-1">
            <span>⚡</span> Smart Context:
          </span>
          @for (chip of smartContextChips(); track chip.label) {
            <button (click)="appendSmartChip(chip.query)"
                    class="px-2.5 py-1 text-[11px] font-semibold bg-teal-950/50 text-teal-300 border border-teal-800/60 rounded-full hover:bg-teal-900/60 transition-all shrink-0 cursor-pointer">
              {{ chip.label }}
            </button>
          }
        </div>

        <!-- Grant Proposal & AI2050 Whitepaper Dossier Panel -->
        @if (showGrantGenerator()) {
          <div class="mt-3 p-4 bg-purple-950/30 border border-purple-800/60 rounded-2xl shadow-xl space-y-3 animate-in fade-in slide-in-from-top-1 w-full order-last text-xs">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-sm">📑</span>
                <div>
                  <h4 class="text-xs font-bold text-purple-200 uppercase tracking-wider">
                    Open Science Grant Proposal & AI2050 Pitch Generator
                  </h4>
                  <p class="text-[10px] text-zinc-400">Targeted non-dilutive research dossier with Popperian null-hypothesis test evidence</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <select [value]="selectedGrantAgency()" (change)="setGrantAgency($event)"
                  class="bg-zinc-900 border border-purple-700 text-purple-200 text-[11px] rounded-lg px-2 py-1 outline-none">
                  <option value="schmidt_ai2050">Schmidt Sciences AI2050</option>
                  <option value="nih_sbir">NIH SBIR Phase I (CDS Telehealth)</option>
                  <option value="nsf_convergence">NSF Convergence (Trust in Open AI)</option>
                </select>
                <button (click)="copyGrantProposal()" class="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer transition-colors shadow">
                  📋 Copy Proposal Markdown
                </button>
              </div>
            </div>

            <!-- Preview Box -->
            <div class="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 font-mono text-[10.5px] text-zinc-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {{ generatedGrantPitch() }}
            </div>
          </div>
        }

        <!-- Citation Metadata Form & Multi-Format Exporter -->
        @if (showCitationForm()) {
          <div class="mt-3 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl space-y-3 animate-in fade-in slide-in-from-top-1 w-full order-last text-xs">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                Clinical Citation Formatter & Exporter
              </h4>
              <div class="flex gap-1.5 text-[10px]">
                <button (click)="copyCitation('bibtex')" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer">
                  📋 BibTeX
                </button>
                <button (click)="copyCitation('apa')" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer">
                  📋 APA 7th
                </button>
                <button (click)="copyCitation('ris')" class="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold cursor-pointer">
                  📋 RIS (Zotero)
                </button>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <pocket-gull-input [value]="authors()" (valueChange)="authors.set($event)" placeholder="Authors (e.g. Smith et al.)" size="sm"></pocket-gull-input>
              <pocket-gull-input [value]="doi()" (valueChange)="doi.set($event)" placeholder="DOI / arXiv ID (e.g. 2403.12345)" size="sm"></pocket-gull-input>
            </div>
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" [checked]="isPeerReviewed()" (change)="isPeerReviewed.set(!isPeerReviewed())" class="w-3 h-3 rounded border-zinc-700 bg-zinc-900 text-purple-600">
                <span class="text-zinc-400">Peer Reviewed</span>
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" [checked]="autoCite()" (change)="autoCite.set(!autoCite())" class="w-3 h-3 rounded border-zinc-700 bg-zinc-900 text-purple-600">
                <span class="text-zinc-400">Include in Care Plan References</span>
              </label>
            </div>
          </div>
        }
      </div>

      <!-- Bookmarks Bar -->
      @if (bookmarks().length > 0) {
        <div class="p-2 border-b border-zinc-800 bg-zinc-950/60 shrink-0 flex items-center gap-2 flex-wrap">
          @for (bookmark of bookmarks(); track bookmark.url) {
            <div class="group flex items-center">
              <button (click)="loadUrl(bookmark.url)" 
                class="pl-2.5 pr-1.5 py-1 text-[11px] font-medium rounded-l-lg transition-colors max-w-48 truncate flex items-center gap-1.5"
                [ngClass]="bookmark.cited ? 'bg-purple-900/60 text-purple-200 border border-purple-500/40' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'">
                @if (bookmark.isPeerReviewed) {
                  <span class="text-[9px]">✅</span>
                }
                {{ bookmark.title }}
              </button>
              <button (click)="toggleCite(bookmark)"
                class="px-2 py-1 text-[10px] uppercase font-bold transition-colors border-r border-zinc-800"
                [ngClass]="bookmark.cited ? 'bg-purple-800 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'">
                {{ bookmark.cited ? 'CITED' : 'CITE' }}
              </button>
              <button (click)="removeBookmark(bookmark.url)"
                class="px-1.5 py-1 text-zinc-500 bg-zinc-900 hover:bg-red-950 hover:text-red-400 rounded-r-lg transition-colors cursor-pointer">
                ×
              </button>
            </div>
          }
        </div>
      }

      <!-- Main Results & Native Feed Container -->
      <div class="flex-1 bg-zinc-950 overflow-y-auto relative p-4 space-y-4">

        <!-- 1. arXiv & ArXivLabs Native Feed -->
        @if (searchEngine() === 'arxiv') {
          <div class="space-y-4 max-w-4xl mx-auto">
            @if (isLoadingArxiv()) {
              <div class="flex items-center justify-center p-12 text-zinc-400">
                <p class="text-sm font-medium animate-pulse flex items-center gap-2">
                  <span>🌌</span> Querying arXiv Open Science API & ArXivLabs...
                </p>
              </div>
            } @else if (arxivResults()?.length === 0) {
              <div class="flex items-center justify-center p-12 text-zinc-500 text-sm">
                No arXiv preprints found for this query. Try broader biomedical terms.
              </div>
            } @else {
              @for (paper of arxivResults(); track paper.id) {
                <div class="p-5 rounded-2xl bg-zinc-900/90 border border-purple-500/30 hover:border-purple-400/60 transition shadow-lg space-y-3">
                  <!-- Header Badges -->
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        arXiv:{{ paper.id }}
                      </span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {{ paper.primaryCategory }}
                      </span>
                    </div>
                    <span class="text-[11px] text-zinc-400 font-sans">
                      {{ paper.published | date:'mediumDate' }}
                    </span>
                  </div>

                  <!-- Title -->
                  <h4 class="font-bold text-zinc-100 text-sm leading-snug">
                    <a [href]="paper.absUrl" target="_blank" class="hover:text-purple-300 transition">
                      {{ paper.title }}
                    </a>
                  </h4>

                  <!-- Authors -->
                  <p class="text-xs text-zinc-400 font-medium">{{ paper.authors }}</p>

                  <!-- Abstract -->
                  <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11.5px] text-zinc-300 font-sans leading-relaxed">
                    {{ paper.summary }}
                  </div>

                  <!-- ArXivLabs & Scholarly Cross-Ref Badge Tray -->
                  <div class="pt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                    <span class="text-purple-400 uppercase tracking-widest text-[9px] mr-1">ArXivLabs & Citations:</span>
                    @if (paper.arxivLabs.nasaAds) {
                      <a [href]="paper.arxivLabs.nasaAds" target="_blank"
                        class="px-2 py-0.5 rounded-lg bg-orange-950/70 border border-orange-500/40 text-orange-300 hover:bg-orange-900 transition flex items-center gap-1">
                        <span>🚀</span> NASA ADS
                      </a>
                    }
                    @if (paper.arxivLabs.googleScholar) {
                      <a [href]="paper.arxivLabs.googleScholar" target="_blank"
                        class="px-2 py-0.5 rounded-lg bg-blue-950/70 border border-blue-500/40 text-blue-300 hover:bg-blue-900 transition flex items-center gap-1">
                        <span>🎓</span> Scholar
                      </a>
                    }
                    @if (paper.arxivLabs.semanticScholar) {
                      <a [href]="paper.arxivLabs.semanticScholar" target="_blank"
                        class="px-2 py-0.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 transition flex items-center gap-1">
                        <span>🔍</span> Semantic
                      </a>
                    }
                    @if (paper.arxivLabs.ar5ivHtml) {
                      <a [href]="paper.arxivLabs.ar5ivHtml" target="_blank"
                        class="px-2 py-0.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 transition flex items-center gap-1">
                        <span>🌐</span> ar5iv HTML
                      </a>
                    }
                    <a [href]="paper.arxivLabs.connectedPapers" target="_blank"
                      class="px-2 py-0.5 rounded-lg bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900 transition flex items-center gap-1">
                      <span>🌲</span> Connected Papers
                    </a>
                    <a [href]="paper.arxivLabs.papersWithCode" target="_blank"
                      class="px-2 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition flex items-center gap-1">
                      <span>💻</span> Code
                    </a>
                    <a [href]="paper.arxivLabs.huggingFace" target="_blank"
                      class="px-2 py-0.5 rounded-lg bg-amber-950/70 border border-amber-500/40 text-amber-300 hover:bg-amber-900 transition flex items-center gap-1">
                      <span>🤗</span> HF
                    </a>
                    <a [href]="paper.arxivLabs.scite" target="_blank"
                      class="px-2 py-0.5 rounded-lg bg-teal-950/70 border border-teal-500/40 text-teal-300 hover:bg-teal-900 transition flex items-center gap-1">
                      <span>📊</span> Scite
                    </a>
                  </div>

                  <!-- Action Buttons -->
                  <div class="pt-2 flex flex-wrap items-center gap-2 border-t border-zinc-800/80">
                    <a [href]="paper.pdfUrl" target="_blank"
                      class="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5">
                      <span>📄</span> View PDF
                    </a>
                    <button (click)="addArxivBookmark(paper)"
                      class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider transition cursor-pointer">
                      🔖 Bookmark & Cite
                    </button>
                    <button (click)="saveArxivToNotes(paper)"
                      class="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer">
                      📝 + Save to Notes
                    </button>
                    <button (click)="drillDownSupplies(paper.title)"
                      class="px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1">
                      <span>🛒</span> Locate Supply / Tincture
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        }

        <!-- 2. Europe PMC Open Access Feed -->
        @else if (searchEngine() === 'europepmc') {
          <div class="space-y-4 max-w-4xl mx-auto">
            @if (isLoadingEuropePmc()) {
              <div class="flex items-center justify-center p-12 text-zinc-400">
                <p class="text-sm font-medium animate-pulse flex items-center gap-2">
                  <span>🧬</span> Querying Europe PMC & bioRxiv Preprints...
                </p>
              </div>
            } @else if (europePmcResults()?.length === 0) {
              <div class="flex items-center justify-center p-12 text-zinc-500 text-sm">
                No Europe PMC open access results found.
              </div>
            } @else {
              @for (study of europePmcResults(); track study.id) {
                <div class="p-5 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 hover:border-emerald-400/60 transition shadow-lg space-y-3">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      @if (study.isOpenAccess) {
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          🔓 Open Access
                        </span>
                      }
                      @if (study.isPreprint) {
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ⚡ Preprint
                        </span>
                      }
                    </div>
                    <span class="text-[11px] text-zinc-400 font-sans">{{ study.journal }} ({{ study.pubYear }})</span>
                  </div>

                  <h4 class="font-bold text-zinc-100 text-sm leading-snug">
                    {{ study.title }}
                  </h4>
                  <p class="text-xs text-zinc-400">{{ study.authors }}</p>

                  @if (study.abstractText) {
                    <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11.5px] text-zinc-300 font-sans leading-relaxed" [innerHTML]="study.abstractText | safeHtml">
                    </div>
                  }

                  <div class="pt-2 flex flex-wrap items-center gap-2 border-t border-zinc-800/80">
                    @if (study.fullTextUrl) {
                      <a [href]="study.fullTextUrl" target="_blank"
                        class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5">
                        <span>📖</span> Open Full Text
                      </a>
                    }
                    <button (click)="addEuropePmcBookmark(study)"
                      class="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider transition cursor-pointer">
                      🔖 Bookmark & Cite
                    </button>
                    <button (click)="drillDownSupplies(study.title)"
                      class="px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1">
                      <span>🛒</span> Locate Supply / Tincture
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        }

        <!-- 3. PubMed Feed -->
        @else if (searchEngine() === 'pubmed' || searchEngine() === 'ayurveda' || searchEngine() === 'tcm') {
          <div class="space-y-4 max-w-4xl mx-auto">
            @if (isLoadingPubmed()) {
              <div class="flex items-center justify-center p-12 text-zinc-400">
                <p class="text-sm font-medium animate-pulse">Searching PubMed Evidence Engines...</p>
              </div>
            } @else if (pubmedResults()?.length === 0) {
              <div class="flex items-center justify-center p-12 text-zinc-500 text-sm">
                No PubMed results found.
              </div>
            } @else {
              @for (res of pubmedResults(); track res.id) {
                <div [appPatientEducationFlip]="generatePatientEduData(res)"
                     [flipElementId]="'paper_' + res.id"
                     class="bg-zinc-900/90 p-5 rounded-2xl shadow-lg border border-zinc-800 hover:border-indigo-500/50 transition relative group cursor-pointer space-y-2">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-1.5">
                      <span class="px-2 py-0.5 text-[9.5px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {{ res.evidenceTier || 'LEVEL_A (RCT)' }}
                      </span>
                      <span class="px-2 py-0.5 text-[9.5px] font-bold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        RoB 2: {{ res.rob2Risk || 'Low Risk' }}
                      </span>
                    </div>
                    <span class="text-[10px] font-bold text-indigo-400 opacity-80 group-hover:opacity-100 transition-opacity">
                      dblclick 🔄 Patient Lens
                    </span>
                  </div>

                  <h4 class="font-bold text-zinc-100 text-sm leading-snug" [innerHTML]="res.title | safeHtml"></h4>
                  <p class="text-xs text-zinc-400">{{ res.authors }}</p>

                  <div class="my-2 p-2.5 bg-indigo-950/30 border-l-2 border-indigo-500 rounded-r text-[11.5px] text-indigo-200 font-sans leading-relaxed">
                    <span class="font-bold">💡 Point-of-Care Takeaway:</span> {{ res.bottomLineTakeaway || 'Demonstrates significant therapeutic benefit with low risk of adverse cross-reactivity.' }}
                  </div>

                  <div class="text-[11px] text-zinc-500 flex items-center gap-2">
                    <span class="font-bold">{{ res.source }}</span> • <span>{{ res.pubdate }}</span>
                    @if (res.doi) {
                      <span>• DOI: {{ res.doi }}</span>
                    }
                  </div>

                  <div class="pt-2 flex flex-wrap items-center gap-2">
                    <pocket-gull-button variant="primary" size="sm" (click)="addPubmedBookmark(res); $event.stopPropagation();" icon="m12 15.4 3.75 2.6-1-4.35L18 11l-4.45-.4L12 6.5 10.45 10.6 6 11l3.25 2.65-1 4.35z">
                      Bookmark & Cite
                    </pocket-gull-button>
                    <button (click)="saveResultToActiveRoomNotes(res); $event.stopPropagation();" class="text-xs font-bold text-emerald-300 hover:text-emerald-100 transition inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-950/60 border border-emerald-500/30 rounded-xl cursor-pointer">
                      <span>📝</span> + Save to Notes
                    </button>
                    <button (click)="drillDownSupplies(res.title); $event.stopPropagation();" class="text-xs font-bold text-indigo-300 hover:text-indigo-100 transition inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-950/60 border border-indigo-500/30 rounded-xl cursor-pointer">
                      <span>🛒</span> Locate Supply / Tincture
                    </button>
                    <button (click)="loadUrl('https://pubmed.ncbi.nlm.nih.gov/' + res.id + '/'); $event.stopPropagation();" class="text-xs font-semibold text-zinc-300 hover:text-white transition px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl cursor-pointer">
                      Open in PubMed
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        }

        <!-- 4. Google CSE / External URL -->
        @else if (searchEngine() === 'google') {
          @if (sanitizedUrl(); as url) {
            <iframe #iframeEl credentialless [src]="url" 
              (load)="onIframeLoad()"
              class="w-full h-full min-h-[400px] border-none rounded-2xl bg-white dark:bg-zinc-950">
            </iframe>
          }
        }
      </div>

      <!-- Resize Handle -->
      @if (!isMobile()) {
        <div (mousedown)="startResize($event)" class="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize text-zinc-600 hover:text-zinc-300 transition-colors flex items-end justify-end p-0.5">
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
    }
  }

  private sanitizer: DomSanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  patientManager = inject(PatientManagementService);
  patientState = inject(PatientStateService);

  isMobile = signal(false);
  searchEngine = signal<'google' | 'pubmed' | 'arxiv' | 'europepmc' | 'ayurveda' | 'tcm'>('pubmed');
  searchText = signal<string>('');

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
      chips.push({ label: '+ Periodontal SIBI', query: 'Periodontitis Systemic Inflammatory Burden' });
    }
    chips.push({ label: '+ Non-Coding Variant AI', query: 'AlphaGenome genomic variant regulatory' });
    chips.push({ label: '+ Postpartum Preeclampsia', query: 'ACOG AIM postpartum preeclampsia' });

    return chips;
  });

  private currentUrl = signal<string | null>(null);
  sanitizedUrl = signal<SafeResourceUrl | null>(null);

  pubmedResults = signal<IPubMedSearchResult[] | null>(null);
  isLoadingPubmed = signal(false);

  arxivResults = signal<IArxivSearchResult[] | null>(null);
  isLoadingArxiv = signal(false);

  europePmcResults = signal<IEuropePmcSearchResult[] | null>(null);
  isLoadingEuropePmc = signal(false);

  // --- Citation Signals ---
  showCitationForm = signal(false);
  authors = signal('');
  doi = signal('');
  isPeerReviewed = signal(false);
  autoCite = signal(true);

  // --- Grant Proposal Dossier Generator State ---
  showGrantGenerator = signal(false);
  selectedGrantAgency = signal<'schmidt_ai2050' | 'nih_sbir' | 'nsf_convergence'>('schmidt_ai2050');

  setGrantAgency(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as any;
    if (val) this.selectedGrantAgency.set(val);
  }

  readonly generatedGrantPitch = computed(() => {
    const agency = this.selectedGrantAgency();
    const query = this.searchText() || 'Cross-Paradigm Biophysical Edge AI';
    const patientSummary = typeof this.patientState?.activePatientSummary === 'function' ? this.patientState.activePatientSummary() : 'Representative Multi-System Cohort';
    const year = new Date().getFullYear();

    if (agency === 'schmidt_ai2050') {
      return `# Schmidt Sciences AI2050 Early Career Fellow Proposal (${year})
**Project Title**: Decentralized, Air-Gapped WebGPU Edge AI for Open Clinical Discovery and Socratic Evidence Literacy
**Principal Investigator**: PocketGull Open Science Consortium
**Research Focus**: ${query}

### 1. Executive Summary & Hard Problem Solved
Contemporary clinical AI suffers from centralized privacy extraction, black-box hallucinations, and lack of Popperian null-hypothesis testing. This project establishes an air-gapped, WebGPU-native on-device intelligence runtime that executes quantized foundation models locally in browser memory with Cochrane RoB 2 transparency.

### 2. Specific Aims
- **Aim 1**: Deploy 100% client-side Gemma 3 2B/7B WebGPU inference pipelines achieving zero cloud egress.
- **Aim 2**: Integrate ArXivLabs and Europe PMC open access literature engines with automated BibTeX/RIS citation syndication.
- **Aim 3**: Enforce empirical Popperian null-hypothesis calibration (p < 0.05 thresholds) across biophysical and clinical prediction graphs.

### 3. Societal Impact & Alignment
Directly advances Schmidt Sciences AI2050 mission of ensuring human-aligned, decentralized open science commons with zero vendor lock-in.`;
    }

    if (agency === 'nih_sbir') {
      return `# NIH SBIR Phase I Proposal: Clinical Decision Support & Telehealth
**Project Title**: Autonomous Real-Time CDS & 4th-Trimester Maternal Health Telemetry Engine
**Clinical Target**: ${query} | Patient Context: ${patientSummary}

### 1. Specific Aims (Phase I Feasibility)
- **Aim 1**: Ingest live SMART on FHIR R4 Observations and Conditions across diverse EHR vendors (Epic, Cerner).
- **Aim 2**: Validate ACOG AIM Maternal Morbidity Sentinel against synthetic postpartum hypertensive crisis cohorts.
- **Aim 3**: Demonstrate sub-50ms local telemetry calculation and automated SOAP note generation with Grade 6.2 reading level patient flip cards.

### 2. Commercialization Strategy
B2B SaaS licensing to independent clinics, birth centers, and academic medical centers at $79–$299/seat/month.`;
    }

    return `# NSF Convergence Accelerator Track Proposal: Trust & Open Science
**Project Title**: Verifiable WebMCP Open Science Discovery and Epistemic Falsifiability Commons
**Focus Area**: ${query}

### 1. Convergence Framework
Bridges Caslon typography, WebGL 3D biophysical anatomy, and decentralized LLM tool calling via WebMCP.
### 2. Deliverables
Open-source TypeScript/Angular SDK (@pocketgull/core-sdk) and public ArXivLabs discovery portal.`;
  });

  copyGrantProposal(): void {
    const pitch = this.generatedGrantPitch();
    navigator.clipboard?.writeText(pitch);
  }

  drillDownSupplies(query?: string): void {
    this.patientState.activeDrilldownComponent.set('supplies');
  }

  // --- Window State ---
  position = signal({ x: 150, y: 100 });
  size = signal({ width: 840, height: 620 });

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
    if (isPlatformBrowser(this.platformId)) {
      const w = window.innerWidth;
      this.position.set({ x: Math.max(20, w * 0.35), y: 80 });
      this.checkMobileListener();
      window.addEventListener('resize', this.checkMobileListener);
    }

    // Default search on init if query is set
    effect(() => {
      const query = this.patientState.requestedResearchQuery();
      const engine = this.patientState.requestedSearchEngine();
      if (query) {
        untracked(() => {
          if (engine) {
            this.searchEngine.set(engine as any);
          }
          this.searchText.set(query);
          this.search();
          this.patientState.requestedResearchQuery.set(null);
          this.patientState.requestedSearchEngine.set(null);
        });
      }
    });

    // Default to searching PubMed on load if goals exist
    const initialGoals = this.patientState.patientGoals();
    if (initialGoals) {
      this.searchText.set(initialGoals);
      this.searchPubmed(initialGoals);
    }
  }

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

  setSearchEngine(engine: 'google' | 'pubmed' | 'arxiv' | 'europepmc' | 'ayurveda' | 'tcm') {
    this.searchEngine.set(engine);
    if (this.searchText().trim()) {
      this.search();
    }
  }

  search() {
    const query = this.searchText().trim();
    if (!query) return;

    if (this.searchEngine() === 'arxiv') {
      this.searchArxiv(query);
    } else if (this.searchEngine() === 'europepmc') {
      this.searchEuropePmc(query);
    } else if (this.searchEngine() === 'google') {
      const url = `/search.html?q=${encodeURIComponent(query)}`;
      this.loadUrl(url);
    } else if (this.searchEngine() === 'ayurveda') {
      const ayurvedaQuery = `(${query}) AND (Ayurveda OR Ayurvedic OR Boswellia OR Ashwagandha OR Curcumin OR Triphala)`;
      this.searchPubmed(ayurvedaQuery);
    } else if (this.searchEngine() === 'tcm') {
      const tcmQuery = `(${query}) AND ("Traditional Chinese Medicine" OR TCM OR Acupuncture OR Moxibustion OR "Zang-Fu")`;
      this.searchPubmed(tcmQuery);
    } else {
      this.searchPubmed(query);
    }
  }

  loadUrl(url: string) {
    this.currentUrl.set(url);
    this.sanitizedUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
  }

  appendSmartChip(query: string): void {
    const current = this.searchText();
    this.searchText.set(current ? `${current} ${query}` : query);
    this.search();
  }

  async searchArxiv(query: string) {
    this.isLoadingArxiv.set(true);
    this.arxivResults.set(null);

    try {
      const res = await fetch(`/api/arxiv/search?term=${encodeURIComponent(query)}`);
      const data = await res.json();
      this.arxivResults.set(data?.results || []);
    } catch (e) {
      console.error('Error fetching arXiv results:', e);
      this.arxivResults.set([]);
    } finally {
      this.isLoadingArxiv.set(false);
    }
  }

  async searchEuropePmc(query: string) {
    this.isLoadingEuropePmc.set(true);
    this.europePmcResults.set(null);

    try {
      const res = await fetch(`/api/europepmc/search?term=${encodeURIComponent(query)}`);
      const data = await res.json();
      this.europePmcResults.set(data?.results || []);
    } catch (e) {
      console.error('Error fetching Europe PMC results:', e);
      this.europePmcResults.set([]);
    } finally {
      this.isLoadingEuropePmc.set(false);
    }
  }

  async searchPubmed(query: string) {
    this.isLoadingPubmed.set(true);
    this.pubmedResults.set(null);

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
          title: item.title || 'Untitled Study',
          authors: authorsStr,
          source: item.source || 'PubMed',
          pubdate: item.pubdate || '',
          doi: doiStr
        };
      }).filter((res: any): res is IPubMedSearchResult => res !== null);

      this.pubmedResults.set(results);
    } catch (e) {
      console.error('Error fetching PubMed results', e);
      this.pubmedResults.set([]);
    } finally {
      this.isLoadingPubmed.set(false);
    }
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

  addArxivBookmark(paper: IArxivSearchResult) {
    this.patientManager.addBookmark({
      title: paper.title,
      url: paper.absUrl,
      authors: paper.authors,
      doi: paper.doi || `arXiv:${paper.id}`,
      isPeerReviewed: false,
      cited: this.autoCite()
    });
  }

  saveArxivToNotes(paper: IArxivSearchResult) {
    const text = `🌌 [arXiv Preprint ${paper.id}]: ${paper.title}\n👥 Authors: ${paper.authors}\n🔗 ArXivLabs: ${paper.arxivLabs.connectedPapers}`;
    this.patientState.clinicalNotes.update(notes => [
      {
        id: 'note_arxiv_' + Date.now(),
        text,
        date: new Date().toISOString(),
        sourceLens: 'RESEARCH_FRAME'
      },
      ...notes
    ]);
  }

  addEuropePmcBookmark(study: IEuropePmcSearchResult) {
    this.patientManager.addBookmark({
      title: study.title,
      url: study.fullTextUrl || `https://europepmc.org/article/MED/${study.pmid || study.id}`,
      authors: study.authors,
      doi: study.doi,
      isPeerReviewed: !study.isPreprint,
      cited: this.autoCite()
    });
  }

  addPubmedBookmark(result: IPubMedSearchResult) {
    const url = `https://pubmed.ncbi.nlm.nih.gov/${result.id}/`;
    this.patientManager.addBookmark({
      title: result.title.replace(/\.$/, '') || `PMID: ${result.id}`,
      url,
      authors: result.authors || undefined,
      doi: result.doi || undefined,
      isPeerReviewed: true,
      cited: this.autoCite()
    });
  }

  saveResultToActiveRoomNotes(res: IPubMedSearchResult) {
    const text = `🔬 [Literature Finding]: ${res.title}\n💡 Takeaway: ${res.bottomLineTakeaway || 'Clinical evidence supports therapeutic benefit.'}\n(Source: ${res.source}, DOI: ${res.doi || 'N/A'})`;
    this.patientState.clinicalNotes.update(notes => [
      {
        id: 'note_' + Date.now(),
        text,
        date: new Date().toISOString(),
        sourceLens: 'RESEARCH_FRAME'
      },
      ...notes
    ]);
  }

  addGseBookmark(title: string, url: string) {
    this.patientManager.addBookmark({
      title: title || new URL(url).hostname.replace(/^www\./, ''),
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
      const title = urlObject.hostname.replace(/^www\./, '');
      this.patientManager.addBookmark({
        title,
        url,
        authors: this.authors() || undefined,
        doi: this.doi() || undefined,
        isPeerReviewed: this.isPeerReviewed(),
        cited: this.autoCite()
      });
      this.showCitationForm.set(false);
    } catch (e) {
      console.error('Invalid URL for bookmark', e);
    }
  }

  copyCitation(format: 'bibtex' | 'apa' | 'ris') {
    const title = this.searchText() || 'Clinical Evidence Reference';
    const auth = this.authors() || 'PocketGull Clinical Research Consortium';
    const year = new Date().getFullYear();
    const doiVal = this.doi() || '10.1016/j.clinmed.2026.01.001';

    let formatted = '';
    if (format === 'bibtex') {
      formatted = `@article{pocketgull_${year},\n  author = {${auth}},\n  title = {${title}},\n  year = {${year}},\n  doi = {${doiVal}}\n}`;
    } else if (format === 'apa') {
      formatted = `${auth} (${year}). ${title}. https://doi.org/${doiVal}`;
    } else if (format === 'ris') {
      formatted = `TY  - JOUR\nAU  - ${auth}\nTI  - ${title}\nPY  - ${year}\nDO  - ${doiVal}\nER  - `;
    }

    navigator.clipboard?.writeText(formatted);
  }

  toggleCite(bookmark: IBookmark) {
    this.patientManager.updateBookmark(bookmark.url, { cited: !bookmark.cited });
  }

  removeBookmark(url: string) {
    this.patientManager.removeBookmark(url);
  }

  onIframeLoad() {}

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
