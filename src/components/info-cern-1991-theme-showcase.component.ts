import {
  Component,
  signal,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-cern-1991-theme-showcase',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      [class]="isCernTheme() ? 'theme-cern-active bg-[#f4f4f0] text-black font-serif p-6 rounded-2xl border-4 border-black shadow-[8px_8px_0px_#000]' : 'bg-zinc-950 text-zinc-100 font-sans p-6 rounded-2xl border border-zinc-800 shadow-2xl'"
      class="relative w-full max-w-4xl mx-auto transition-all duration-300">
      
      <!-- Window Chrome Bar -->
      <header 
        [class]="isCernTheme() ? 'bg-black text-white px-4 py-2 flex items-center justify-between font-mono text-xs uppercase tracking-widest mb-6' : 'bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between mb-6 rounded-xl'">
        <div class="flex items-center gap-3">
          <span [class]="isCernTheme() ? 'w-3 h-3 bg-white inline-block' : 'w-3 h-3 rounded-full bg-rose-500 inline-block'"></span>
          <span class="font-bold">
            {{ isCernTheme() ? 'NeXTSTEP WorldWideWeb v0.9 (CERN 1991)' : 'Pocketgull Modern Clinical Deck' }}
          </span>
        </div>

        <div class="flex items-center gap-3">
          <button 
            type="button"
            (click)="toggleTheme()"
            [class]="isCernTheme() ? 'bg-white text-black font-mono text-xs font-bold px-3 py-1 border-2 border-black hover:bg-zinc-200 active:translate-y-0.5' : 'bg-purple-600 text-white font-mono text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-purple-500 active:scale-95 transition-all'">
            {{ isCernTheme() ? '🔄 Switch to Modern Dark' : '📜 Switch to 1991 CERN Theme' }}
          </button>
        </div>
      </header>

      <!-- Content Area -->
      @if (isCernTheme()) {
        <!-- Authentic 1991 info.cern.ch Retro Layout -->
        <article class="space-y-6 text-black leading-relaxed">
          <h1 class="text-3xl font-bold border-b-2 border-black pb-2 font-serif tracking-tight">
            World Wide Web
          </h1>
          <p class="text-base font-serif italic">
            The WorldWideWeb (W3) is a wide-area hypermedia information retrieval initiative aiming to give universal access to a large universe of documents.
          </p>

          <div class="p-4 bg-white border-2 border-black font-mono text-sm shadow-[4px_4px_0px_#000] space-y-2">
            <div class="font-bold text-xs uppercase text-zinc-600">Executive Summary & Index</div>
            <ul class="list-disc list-inside space-y-1 text-blue-800 underline cursor-pointer">
              <li><a class="hover:text-purple-900" (click)="selectedTopic.set('whatis')">What is W3?</a> - Hypermedia project summary</li>
              <li><a class="hover:text-purple-900" (click)="selectedTopic.set('people')">People</a> - Tim Berners-Lee & Robert Cailliau</li>
              <li><a class="hover:text-purple-900" (click)="selectedTopic.set('tech')">Technical Specs</a> - HTML 1.0, HTTP/0.9, NeXTstation</li>
              <li><a class="hover:text-purple-900" (click)="selectedTopic.set('clinical')">Medical & LHC Cross-Talk</a> - High Energy Physics to Tele-health</li>
            </ul>
          </div>

          <!-- Dynamic Topic Card -->
          <div class="p-5 bg-white border-2 border-black space-y-3 font-serif">
            <h2 class="text-xl font-bold border-b border-black pb-1">
              {{ currentTopicTitle() }}
            </h2>
            <p class="text-sm leading-relaxed">
              {{ currentTopicBody() }}
            </p>
          </div>

          <footer class="pt-4 border-t border-black text-xs font-mono text-zinc-700 flex justify-between">
            <span>CERN Meyrin, Geneva, Switzerland • 1991</span>
            <span>http://info.cern.ch/hypertext/WWW/TheProject.html</span>
          </footer>
        </article>
      } @else {
        <!-- Modern Sleek Dark Mode Layout -->
        <article class="space-y-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                1991 CERN Retro Theme Engine
                <span class="px-2 py-0.5 text-xs font-mono rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  ACTIVE
                </span>
              </h1>
              <p class="text-xs text-zinc-400 font-mono mt-1">
                Toggle between 1991 Tim Berners-Lee NeXTSTEP nostalgia & modern Pocketgull aesthetic
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <h3 class="text-sm font-semibold text-purple-400 font-mono">1991 info.cern.ch Features</h3>
              <ul class="text-xs text-zinc-300 space-y-1.5 list-disc list-inside">
                <li>Crisp 2px black borders & hard pixel drop shadows</li>
                <li>Classic Times New Roman & Courier New typography</li>
                <li>Hyperlink underline blue (#0000ee) accent palette</li>
                <li>Authentic NeXTSTEP OS window chrome styling</li>
              </ul>
            </div>

            <div class="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <h3 class="text-sm font-semibold text-cyan-400 font-mono">Integrated Physics & Tech</h3>
              <p class="text-xs text-zinc-300">
                Connects 1991 HTML 1.0 hypermedia protocol history directly to CERN Large Hadron Collider collision analytics.
              </p>
            </div>
          </div>
        </article>
      }

    </div>
  `
})
export class InfoCern1991ThemeShowcaseComponent {
  isCernTheme = signal<boolean>(true);
  selectedTopic = signal<'whatis' | 'people' | 'tech' | 'clinical'>('whatis');

  currentTopicTitle = computed(() => {
    switch (this.selectedTopic()) {
      case 'whatis': return 'What is World Wide Web?';
      case 'people': return 'Key Contributors at CERN';
      case 'tech': return 'Original Technical Architecture (1991)';
      case 'clinical': return 'Physics & Medical Information Exchange';
    }
  });

  currentTopicBody = computed(() => {
    switch (this.selectedTopic()) {
      case 'whatis':
        return 'WorldWideWeb merges the techniques of information retrieval and hypertext to create an easy but powerful global information system.';
      case 'people':
        return 'Invented by Tim Berners-Lee with contributions from Robert Cailliau at CERN in Geneva, Switzerland.';
      case 'tech':
        return 'Developed on a NeXTcube computer using Objective-C, HTML (HyperText Markup Language), HTTP (HyperText Transfer Protocol), and URIs.';
      case 'clinical':
        return 'CERN technologies pioneered distributed grid computing (WLCG), digital particle detection, and medical imaging transfer algorithms.';
    }
  });

  toggleTheme(): void {
    this.isCernTheme.update((val) => !val);
  }
}
