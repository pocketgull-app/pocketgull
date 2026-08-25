import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as DOMPurify from 'dompurify';
import { MarkdownService } from '../services/markdown.service';
import { ThemeService } from '../services/theme.service';

export interface IDocItem {
  id: string;
  title: string;
  category: 'core' | 'ai' | 'engineering' | 'reference';
  description: string;
  icon: string;
  estimatedReadTime: string;
}

export interface ITocItem {
  id: string;
  text: string;
  level: number;
}

@Component({
  selector: 'app-docs-study',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      <!-- Top Navigation & Header Bar -->
      <header class="h-16 shrink-0 px-4 sm:px-6 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-4 font-mono shadow-md">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg">
            🕊️
          </div>
          <div>
            <h1 class="text-sm font-bold tracking-wider uppercase text-white flex items-center gap-2">
              <span>Pocket-Gull Study Documentation</span>
              <span class="px-2 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">v1.14 Pure Angular</span>
            </h1>
            <p class="text-[11px] text-zinc-400 font-sans hidden sm:block">Clinical Intelligence & Real-Time Multimodal Architecture Codex</p>
          </div>
        </div>

        <!-- Global Search Input -->
        <div class="relative flex-1 max-w-md mx-2">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 text-xs">
            🔍
          </div>
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Search docs, paradigms, specs (e.g. FHIR, Gemini, Vitals)..."
            class="w-full pl-9 pr-4 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-md text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-sans transition"
          />
          @if (searchQuery()) {
            <button 
              (click)="searchQuery.set('')"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-zinc-500 hover:text-zinc-300">
              ✕
            </button>
          }
        </div>

        <!-- Controls / Actions -->
        <div class="flex items-center gap-3">
          <button 
            (click)="toggleTheme()"
            aria-label="Toggle Theme"
            class="p-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition border border-zinc-700">
            {{ theme.activeTheme() === 'dark' ? '🌙 Dark' : '☀️ Light' }}
          </button>

          <button 
            (click)="closeDocs()"
            aria-label="Close Documentation Hub"
            class="min-h-[36px] px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition border border-zinc-700 flex items-center gap-1.5 cursor-pointer">
            <span>Close Docs</span>
            <span>✕</span>
          </button>
        </div>
      </header>

      <!-- Main Layout Body -->
      <div class="flex-1 flex min-h-0 overflow-hidden">
        
        <!-- Left Nav Sidebar (Topics & Categories) -->
        <aside 
          class="w-72 shrink-0 bg-zinc-900/90 border-r border-zinc-800 flex flex-col overflow-hidden transition-all duration-200 max-md:fixed max-md:inset-y-16 max-md:left-0 max-md:z-40"
          [class.max-md:-translate-x-full]="!isMobileNavOpen()">
          
          <div class="p-3 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>TOPICS ({{ filteredDocs().length }})</span>
            <span class="text-[10px] text-emerald-400 font-bold uppercase">100% Angular 22</span>
          </div>

          <nav class="flex-1 overflow-y-auto p-3 space-y-4 font-sans text-xs">
            @for (cat of categories; track cat.key) {
              @if (getDocsByCategory(cat.key).length > 0) {
                <div>
                  <h3 class="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-zinc-500 font-mono">
                    {{ cat.icon }} {{ cat.label }}
                  </h3>
                  <div class="mt-1 space-y-0.5">
                    @for (doc of getDocsByCategory(cat.key); track doc.id) {
                      <button
                        (click)="selectDoc(doc.id)"
                        [class]="activeDocId() === doc.id
                          ? 'w-full text-left px-3 py-2 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold border-l-2 border-emerald-500 flex items-center justify-between transition shadow-sm'
                          : 'w-full text-left px-3 py-2 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 flex items-center justify-between transition'">
                        <span class="truncate flex items-center gap-2">
                          <span>{{ doc.icon }}</span>
                          <span class="truncate">{{ doc.title }}</span>
                        </span>
                        <span class="text-[9px] text-zinc-500 font-mono shrink-0 ml-1">{{ doc.estimatedReadTime }}</span>
                      </button>
                    }
                  </div>
                </div>
              }
            }
          </nav>
        </aside>

        <!-- Main Document Reading Area -->
        <main class="flex-1 flex flex-col min-w-0 bg-zinc-950 overflow-y-auto p-6 md:p-10 font-sans">
          
          <!-- Mobile Menu Toggle Button -->
          <div class="md:hidden mb-4">
            <button 
              (click)="isMobileNavOpen.set(!isMobileNavOpen())"
              class="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center gap-2">
              <span>☰ Menu</span>
              <span>({{ activeDoc()?.title || 'Docs' }})</span>
            </button>
          </div>

          @if (isLoading()) {
            <div class="flex-1 flex flex-col items-center justify-center text-zinc-400 space-y-3 py-20">
              <div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p class="text-xs font-mono">Loading documentation module...</p>
            </div>
          } @else if (loadError()) {
            <div class="p-6 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs space-y-2">
              <h3 class="font-bold text-sm">Failed to Load Document</h3>
              <p>{{ loadError() }}</p>
              <button 
                (click)="loadCurrentDoc()"
                class="px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded text-xs font-mono">
                Retry Load
              </button>
            </div>
          } @else {
            <article class="max-w-4xl mx-auto w-full">
              
              <!-- Document Header Banner -->
              <header class="pb-6 mb-8 border-b border-zinc-800 font-sans">
                <div class="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-2">
                  <span>{{ activeDoc()?.icon }}</span>
                  <span class="uppercase tracking-wider font-bold">{{ activeDoc()?.category }}</span>
                  <span>•</span>
                  <span>{{ activeDoc()?.estimatedReadTime }} read</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {{ activeDoc()?.title }}
                </h1>
                <p class="mt-2 text-sm text-zinc-400">
                  {{ activeDoc()?.description }}
                </p>
              </header>

              <!-- Document Parsed Body -->
              <div 
                class="prose prose-invert prose-emerald max-w-none prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:text-sm prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-lg prose-code:text-emerald-300 prose-code:text-xs prose-a:text-emerald-400 hover:prose-a:underline font-sans"
                [innerHTML]="sanitizedContent()">
              </div>
            </article>
          }
        </main>

        <!-- Right On-Page Table of Contents (Desktop) -->
        <aside class="w-64 shrink-0 bg-zinc-900/50 border-l border-zinc-800 p-4 hidden lg:block overflow-y-auto font-sans">
          <h4 class="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono mb-3">On This Page</h4>
          @if (tocItems().length > 0) {
            <nav class="space-y-1 text-xs">
              @for (item of tocItems(); track item.id) {
                <a 
                  [href]="'#' + item.id"
                  (click)="scrollToHeader($event, item.id)"
                  [class]="item.level === 1 ? 'font-semibold text-zinc-300 hover:text-emerald-400 block truncate' : 'text-zinc-500 hover:text-zinc-300 block truncate pl-' + (item.level * 2)">
                  {{ item.text }}
                </a>
              }
            </nav>
          } @else {
            <p class="text-xs text-zinc-600 italic">No section headers detected.</p>
          }
        </aside>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class DocsStudyComponent implements OnInit {
  private http = inject(HttpClient);
  private markdownService = inject(MarkdownService);
  theme = inject(ThemeService);

  searchQuery = signal<string>('');
  activeDocId = signal<string>('getting-started');
  isLoading = signal<boolean>(false);
  loadError = signal<string | null>(null);
  rawMarkdown = signal<string>('');
  isMobileNavOpen = signal<boolean>(false);

  readonly categories = [
    { key: 'core', label: 'Core Architecture', icon: '🚀' },
    { key: 'ai', label: 'AI & Multimodal Safety', icon: '🤖' },
    { key: 'engineering', label: 'Engineering Specs', icon: '⚙️' },
    { key: 'reference', label: 'Strategy & Reference', icon: '📖' }
  ] as const;

  readonly docsList: IDocItem[] = [
    { id: 'getting-started', title: 'Getting Started', category: 'core', description: 'Quickstart guide, prerequisites, Node 24 standards, and local development setup.', icon: '🏁', estimatedReadTime: '4 min' },
    { id: 'architecture', title: 'System Architecture', category: 'core', description: '10-Dimensional health synthesizer, Angular 22 Signal state, Express SSR, and Gemini streaming.', icon: '🏛️', estimatedReadTime: '12 min' },
    { id: 'clinical-paradigms', title: 'Clinical Paradigms', category: 'core', description: 'Biomedical, TCM Jing-Luo, Ayurvedic Tridosha, and Turing formal logic models.', icon: '🧬', estimatedReadTime: '10 min' },
    { id: 'data', title: 'Data Management & FHIR R4', category: 'core', description: 'FHIR R4 Bundle exports, DOMPurify HIPAA sanitization, and state persistence.', icon: '📊', estimatedReadTime: '8 min' },
    { id: 'features', title: 'Clinical Features Matrix', category: 'core', description: 'Comprehensive catalog of live AI consult, voice entrainment, and 3D PBR anatomy features.', icon: '✨', estimatedReadTime: '15 min' },
    
    { id: 'ai-development-loop', title: 'AI Development Loop', category: 'ai', description: 'Google Genkit flows, ADK InMemoryRunner, multimodal live audio, and safety filter policy.', icon: '🔄', estimatedReadTime: '6 min' },
    { id: 'responsible-ai', title: 'Responsible AI & Safety', category: 'ai', description: 'Clinical CDS safety policy, DANGEROUS_CONTENT OFF rationale, and safety filter boundaries.', icon: '🛡️', estimatedReadTime: '9 min' },
    { id: 'edge-mobile-integration', title: 'Edge & Mobile Companion Suite', category: 'ai', description: 'Python FastAPI biosignal sidecar, Riverpod Flutter app, and local PubGemma fallback.', icon: '📱', estimatedReadTime: '5 min' },
    
    { id: 'api', title: 'API Specification', category: 'engineering', description: 'OpenAPI REST endpoints, WebSocket live audio protocol, and DICOM/Healthcare proxies.', icon: '🔌', estimatedReadTime: '7 min' },
    { id: 'dependencies', title: 'Dependencies & Overrides', category: 'engineering', description: 'Node 24 runtime, esbuild version alignment, and third-party package inventory.', icon: '📦', estimatedReadTime: '8 min' },
    { id: 'design-system', title: 'Design System & Typography', category: 'engineering', description: 'Caslon typography engineering, Dieter Rams Braun minimalism, and Tailwind tokens.', icon: '🎨', estimatedReadTime: '5 min' },
    { id: 'cocomo-analysis', title: 'COCOMO II Effort Analysis', category: 'engineering', description: 'Empirical software metrics, person-month estimations, and complexity scoring.', icon: '📈', estimatedReadTime: '6 min' },
    
    { id: 'positioning', title: 'Market Positioning', category: 'reference', description: 'Open-source functional medicine strategy and clinical intelligence comparative matrix.', icon: '🗺️', estimatedReadTime: '7 min' },
    { id: 'case-study', title: 'Clinical Case Study', category: 'reference', description: 'Real-world patient case simulation and multi-paradigm health outcome trajectory.', icon: '📋', estimatedReadTime: '9 min' },
    { id: 'git-roadmap', title: 'Git Roadmap & Milestones', category: 'reference', description: 'Milestone evolution, release cadence, and future paradigm integrations.', icon: '📌', estimatedReadTime: '4 min' },
    { id: 'glossary', title: 'Clinical Glossary', category: 'reference', description: 'Terminology definitions across Western medicine, TCM, Ayurveda, and AI systems.', icon: '📚', estimatedReadTime: '6 min' },
    { id: 'changelog', title: 'System Changelog', category: 'reference', description: 'Full chronological release log and version audit history.', icon: '📜', estimatedReadTime: '15 min' }
  ];

  filteredDocs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.docsList;
    return this.docsList.filter(d => 
      d.title.toLowerCase().includes(q) || 
      d.description.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q)
    );
  });

  activeDoc = computed(() => this.docsList.find(d => d.id === this.activeDocId()) || this.docsList[0]);

  sanitizedContent = computed(() => {
    const raw = this.rawMarkdown();
    if (!raw) return '<p class="text-zinc-500 italic">Document content loading...</p>';
    const purify = (DOMPurify as any).default || DOMPurify;
    const parser = this.markdownService.parser();
    if (parser && typeof parser.parse === 'function') {
      const html = parser.parse(raw);
      return purify.sanitize(html);
    }
    // Fallback basic renderer if marked is loading
    return purify.sanitize(raw.replace(/\n/g, '<br/>'));
  });

  toggleTheme() {
    const nextTheme = this.theme.activeTheme() === 'dark' ? 'light' : 'dark';
    this.theme.currentTheme.set(nextTheme);
  }

  tocItems = computed(() => {
    const raw = this.rawMarkdown();
    if (!raw) return [];
    const lines = raw.split('\n');
    const items: ITocItem[] = [];
    for (const line of lines) {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim().replace(/[*_~`]/g, '');
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        items.push({ id, text, level });
      }
    }
    return items;
  });

  ngOnInit() {
    this.loadCurrentDoc();
  }

  getDocsByCategory(catKey: string): IDocItem[] {
    return this.filteredDocs().filter(d => d.category === catKey);
  }

  selectDoc(docId: string) {
    this.activeDocId.set(docId);
    this.isMobileNavOpen.set(false);
    this.loadCurrentDoc();
  }

  loadCurrentDoc() {
    const docId = this.activeDocId();
    this.isLoading.set(true);
    this.loadError.set(null);

    this.http.get(`/docs/study/${docId}.md`, { responseType: 'text' }).subscribe({
      next: (data) => {
        this.rawMarkdown.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.warn(`[DocsStudyComponent] Failed to fetch /docs/study/${docId}.md:`, err);
        this.loadError.set(`Could not load /docs/study/${docId}.md. Ensure the asset is present in public/docs/study/.`);
        this.isLoading.set(false);
      }
    });
  }

  closeDocs() {
    // Dispatch custom event or window message so app.component closes docs view
    window.dispatchEvent(new CustomEvent('close-docs-study'));
  }

  scrollToHeader(event: Event, headerId: string) {
    event.preventDefault();
    const el = document.getElementById(headerId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  @HostListener('window:keydown.escape')
  onEscapeKey() {
    this.closeDocs();
  }
}
