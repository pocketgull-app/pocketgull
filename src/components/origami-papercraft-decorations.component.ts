import { Component, input, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ClinicalIcons } from '../assets/clinical-icons';

export interface IOrigamiNodePin {
  id: string;
  name: string;
  x: number;
  y: number;
  iconKey: string;
  color: string;
}

@Component({
  selector: 'app-origami-decorations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-4 p-5 bg-[#feba94]/20 dark:bg-zinc-900/95 rounded-3xl border border-[#feba94]/50 shadow-xl transition-all">
      
      <!-- Header Bar -->
      <div class="flex items-center justify-between pb-3 border-b border-amber-900/10 dark:border-zinc-800">
        <div class="flex items-center gap-3">
          <!-- Exact User SVG Badge -->
          <div class="relative w-12 h-12 flex items-center justify-center filter drop-shadow-[2px_4px_6px_rgba(60,40,20,0.2)]">
            <svg viewBox="0 0 512 512" class="w-full h-full transform hover:scale-110 transition-transform">
              <rect width="512" height="512" fill="#feba94" rx="100"/>
              <path d="M395.67,339.95h.01l3.93-4.89c-.07-.24.07-.59.56-.74l44.82-55.58c1.57-1.94,1-3.39-.03-5.43l-37.23-73.75,34.41-31.01,23.69-22.26c1.28-1.48,1.25-3.18-.08-4.58l-4.3-4.52c1.63-1.03,3.27-.77,5.08.06l18.47,8.55c1.17.54,2.46.11,2.98-.46.74-.82.95-2.32.12-3.32-4.94-5.89-8.63-12.87-14.64-17.81l-15.72-9.41-11.91-6.56-81.11,13.16-12.45-11.51c-1.26-.99-2.58-.93-4.15-.36l-52.81,19.27-27.39,63.99,7.02,35.71-96.1-18.72-56.99-11.11-76.04-14.61c-2.99-.57-5.38.59-7.81.08l-10.41-2.18c-1.5-.31-2.73-.07-3.42,1.17-.47.85-.63,2.18.25,3.37l70.92,96.88,21.47,29.26h0l20.14,27.31h.05l14.33,19.5h0s26.98,36.71,26.98,36.71l133.85,7.28,17.05-17.38,29.68-.3,28.68-35.72.02-.02,8.09-10.07Z" fill="#2f2422"/>
              <polygon points="307.5 398.68 218.67 393.75 180.66 391.62 71.74 243.33 31.46 188.16 226.24 233.99 273.76 245.16 290.65 322.96 307.5 398.68" fill="#fdfdfc"/>
              <polygon points="427.52 279.76 311.79 396.76 299.49 341.64 278.51 244.95 373.83 267.26 427.52 279.76" fill="#fdfdfd"/>
              <path d="M334.12,381.08l98.33-99.47c2.13-2.04,2.21-3.98.9-6.46l-35.27-67.18,5.89-5.18,37.05,73.34-7.48,9-76.74,96.09-22.67-.13Z" fill="#cecfd1"/>
              <path d="M277.2,239.45l-4.04.73-165.83-38.98c-.27-.06-.46-.41-.33-.71l168.79,32.97,1.42,6Z" fill="#d0d1d3"/>
              <path d="M464.7,131.22l-10.54,3.46-80.11,31.86-15.4-39.46,86.63-14.1,25.09,14.92c3.77,2.24,5.62,6.78,8.53,10.1l-14.21-6.78Z" fill="#fb7e0e"/>
              <polygon points="395.29 204.21 377 171.88 430.14 155.93 456.3 149.02 395.29 204.21" fill="#fd7f0e"/>
              <path d="M459.51,142.85l-43,11.79,39.21-15.65c1.53,1.28,2.6,2.18,3.79,3.86Z" fill="#e57f25"/>
              <path d="M358.59,122.06c-.17.84-1.46,1.03-1.87.54-.81-.96-1.19-2.14-1.35-3.45l3.22,2.91Z" fill="#c9c3c1"/>
              <polygon points="394.9 211.75 428.06 275.13 282.49 240.93 272.7 193.48 280.63 175.54 298.84 132.49 348.51 114.46 355.06 132.26 369.4 167.52 383.25 192.91 394.9 211.75" fill="#fcfdfc"/>
              <path d="M325.08,155.38c-6.9,5.97-4.52,15.83-8.76,16.42-5.38.75-4.4-10.35,1.01-18.29,3.04-4.47,7.9-7.07,12.63-7.52,8.52-.82,18.32,6.77,15.22,10.56-1.64,2.02-3.85,1.43-5.75-.11-4.08-3.3-9.98-4.85-14.36-1.06Z" fill="#322729"/>
            </svg>
          </div>

          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider text-[#1C1C1C] dark:text-zinc-100 flex items-center gap-2">
              {{ title() }}
              <span class="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full bg-[#fb7e0e]/20 text-[#fb7e0e] border border-[#fb7e0e]/30">
                Papercraft SVG Studio
              </span>
            </h3>
            <p class="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              {{ subtitle() }}
            </p>
          </div>
        </div>

        <button 
          (click)="toggleExplorer()" 
          class="px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-zinc-800 border border-[#feba94]/50 text-amber-900 dark:text-amber-300 hover:bg-amber-500/10 transition-colors shadow-sm flex items-center gap-1.5"
        >
          <span>🔍</span>
          {{ isExplorerOpen() ? 'Close Explorer' : 'Search Icons & Attach' }}
        </button>
      </div>

      <!-- Expanded Interactive Studio Canvas -->
      @if (isExplorerOpen()) {
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 animate-in fade-in duration-300">
          
          <!-- Left Column: SVG Vector Canvas -->
          <div class="md:col-span-6 flex flex-col items-center justify-center p-6 bg-[#feba94] dark:bg-zinc-950 rounded-2xl border border-amber-300/80 dark:border-zinc-800 shadow-inner relative overflow-hidden">
            
            <svg viewBox="0 0 512 512" class="w-full max-w-[340px] h-auto filter drop-shadow-xl transition-transform hover:scale-102">
              <path d="M395.67,339.95h.01l3.93-4.89c-.07-.24.07-.59.56-.74l44.82-55.58c1.57-1.94,1-3.39-.03-5.43l-37.23-73.75,34.41-31.01,23.69-22.26c1.28-1.48,1.25-3.18-.08-4.58l-4.3-4.52c1.63-1.03,3.27-.77,5.08.06l18.47,8.55c1.17.54,2.46.11,2.98-.46.74-.82.95-2.32.12-3.32-4.94-5.89-8.63-12.87-14.64-17.81l-15.72-9.41-11.91-6.56-81.11,13.16-12.45-11.51c-1.26-.99-2.58-.93-4.15-.36l-52.81,19.27-27.39,63.99,7.02,35.71-96.1-18.72-56.99-11.11-76.04-14.61c-2.99-.57-5.38.59-7.81.08l-10.41-2.18c-1.5-.31-2.73-.07-3.42,1.17-.47.85-.63,2.18.25,3.37l70.92,96.88,21.47,29.26h0l20.14,27.31h.05l14.33,19.5h0s26.98,36.71,26.98,36.71l133.85,7.28,17.05-17.38,29.68-.3,28.68-35.72.02-.02,8.09-10.07Z" fill="#2f2422"/>
              <polygon points="307.5 398.68 218.67 393.75 180.66 391.62 71.74 243.33 31.46 188.16 226.24 233.99 273.76 245.16 290.65 322.96 307.5 398.68" fill="#fdfdfc"/>
              <polygon points="427.52 279.76 311.79 396.76 299.49 341.64 278.51 244.95 373.83 267.26 427.52 279.76" fill="#fdfdfd"/>
              <path d="M334.12,381.08l98.33-99.47c2.13-2.04,2.21-3.98.9-6.46l-35.27-67.18,5.89-5.18,37.05,73.34-7.48,9-76.74,96.09-22.67-.13Z" fill="#cecfd1"/>
              <path d="M277.2,239.45l-4.04.73-165.83-38.98c-.27-.06-.46-.41-.33-.71l168.79,32.97,1.42,6Z" fill="#d0d1d3"/>
              <path d="M464.7,131.22l-10.54,3.46-80.11,31.86-15.4-39.46,86.63-14.1,25.09,14.92c3.77,2.24,5.62,6.78,8.53,10.1l-14.21-6.78Z" fill="#fb7e0e"/>
              <polygon points="395.29 204.21 377 171.88 430.14 155.93 456.3 149.02 395.29 204.21" fill="#fd7f0e"/>
              <path d="M459.51,142.85l-43,11.79,39.21-15.65c1.53,1.28,2.6,2.18,3.79,3.86Z" fill="#e57f25"/>
              <path d="M358.59,122.06c-.17.84-1.46,1.03-1.87.54-.81-.96-1.19-2.14-1.35-3.45l3.22,2.91Z" fill="#c9c3c1"/>
              <polygon points="394.9 211.75 428.06 275.13 282.49 240.93 272.7 193.48 280.63 175.54 298.84 132.49 348.51 114.46 355.06 132.26 369.4 167.52 383.25 192.91 394.9 211.75" fill="#fcfdfc"/>
              <path d="M325.08,155.38c-6.9,5.97-4.52,15.83-8.76,16.42-5.38.75-4.4-10.35,1.01-18.29,3.04-4.47,7.9-7.07,12.63-7.52,8.52-.82,18.32,6.77,15.22,10.56-1.64,2.02-3.85,1.43-5.75-.11-4.08-3.3-9.98-4.85-14.36-1.06Z" fill="#322729"/>

              <!-- Node Target Pin Highlights -->
              <g>
                @for (node of nodePins(); track node.id) {
                  <g 
                    [attr.transform]="'translate(' + node.x + ', ' + node.y + ')'" 
                    class="cursor-pointer transition-transform hover:scale-125"
                    (click)="selectNode(node.id)"
                  >
                    <circle 
                      cx="0" cy="0" r="20" 
                      [attr.fill]="selectedNodeId() === node.id ? '#F59E0B' : '#FFFFFF'" 
                      [attr.stroke]="node.color" 
                      stroke-width="3.5" 
                      class="drop-shadow-md"
                    />
                    <g class="w-4 h-4" [attr.transform]="'translate(-8, -8) scale(0.8)'" [innerHTML]="getSanitizedIcon(node.iconKey)"></g>
                  </g>
                }
              </g>
            </svg>

            <span class="mt-3 text-xs font-semibold text-zinc-900 dark:text-amber-200">
              Click a fold node on the seagull, then search and attach any clinical icon!
            </span>
          </div>

          <!-- Right Column: Icon Search & Registry Grid -->
          <div class="md:col-span-6 flex flex-col gap-3">
            
            <!-- Target Node Selector Pills -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span class="text-xs font-bold text-zinc-800 dark:text-zinc-200 mr-1">Fold Node:</span>
              @for (node of nodePins(); track node.id) {
                <button
                  (click)="selectNode(node.id)"
                  class="px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all border"
                  [class.bg-amber-500]="selectedNodeId() === node.id"
                  [class.text-white]="selectedNodeId() === node.id"
                  [class.border-amber-600]="selectedNodeId() === node.id"
                  [class.bg-white]="selectedNodeId() !== node.id"
                  [class.dark:bg-zinc-800]="selectedNodeId() !== node.id"
                  [class.border-zinc-300]="selectedNodeId() !== node.id"
                  [class.dark:border-zinc-700]="selectedNodeId() !== node.id"
                >
                  {{ node.name }}
                </button>
              }
            </div>

            <!-- Icon Search Input -->
            <div class="relative">
              <input 
                type="text" 
                [ngModel]="searchQuery()" 
                (ngModelChange)="searchQuery.set($event)"
                placeholder="Search clinical & AI icons (Stethoscope, ECG, DoubleHelix, YinYang, Tridosha)..."
                class="w-full px-4 py-2.5 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-amber-300/80 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm"
              />
              @if (searchQuery()) {
                <button (click)="searchQuery.set('')" class="absolute right-3 top-2.5 text-xs text-zinc-400 hover:text-zinc-600">
                  ✕
                </button>
              }
            </div>

            <!-- Icon Grid Results -->
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[220px] overflow-y-auto pr-1">
              @for (iconName of filteredIconKeys(); track iconName) {
                <button 
                  (click)="attachIconToSelectedNode(iconName)"
                  class="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-700/80 hover:border-amber-500/80 hover:bg-amber-500/10 flex flex-col items-center justify-center gap-1.5 transition-all group shadow-sm"
                >
                  <div class="w-5 h-5 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:scale-110 transition-transform" [innerHTML]="getSanitizedIcon(iconName)"></div>
                  <span class="text-[10px] font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-full">
                    {{ iconName }}
                  </span>
                </button>
              }
            </div>

            <!-- Pinned Node Summary Badges -->
            <div class="mt-2 p-3 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-amber-200/80 dark:border-zinc-700 flex flex-wrap gap-2 items-center shadow-sm">
              <span class="text-[11px] font-bold text-amber-900/80 dark:text-amber-300">Pinned Icons:</span>
              @for (node of nodePins(); track node.id) {
                <span class="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30 flex items-center gap-1">
                  <strong>{{ node.name }}:</strong> {{ node.iconKey }}
                </span>
              }
            </div>

          </div>

        </div>
      }
    </div>
  `
})
export class OrigamiPapercraftDecorationsComponent {
  private sanitizer = inject(DomSanitizer);

  title = input<string>('Tactile Paper Stock');
  subtitle = input<string>('Origami Folds & Layered Shadow Physics');

  isExplorerOpen = signal<boolean>(false);
  searchQuery = signal<string>('');
  selectedNodeId = signal<string>('beak');

  nodePins = signal<IOrigamiNodePin[]>([
    { id: 'beak', name: 'Orange Beak', x: 420, y: 155, iconKey: 'Suggestion', color: '#fb7e0e' },
    { id: 'head', name: 'Head Cap', x: 330, y: 155, iconKey: 'Verified', color: '#2f2422' },
    { id: 'wing', name: 'Front Wing', x: 360, y: 310, iconKey: 'Stethoscope', color: '#fb7e0e' },
    { id: 'tail', name: 'Tail Cup', x: 160, y: 290, iconKey: 'DoubleHelix', color: '#2f2422' },
    { id: 'shadow', name: 'Under Shadow', x: 365, y: 400, iconKey: 'Model3D', color: '#cecfd1' },
  ]);

  allIconKeys = Object.keys(ClinicalIcons) as Array<keyof typeof ClinicalIcons>;

  filteredIconKeys = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.allIconKeys;
    return this.allIconKeys.filter(key => key.toLowerCase().includes(query));
  });

  toggleExplorer(): void {
    this.isExplorerOpen.set(!this.isExplorerOpen());
  }

  selectNode(nodeId: string): void {
    this.selectedNodeId.set(nodeId);
  }

  attachIconToSelectedNode(iconKey: string): void {
    const currentNodes = this.nodePins();
    const targetId = this.selectedNodeId();
    const updated = currentNodes.map(n => n.id === targetId ? { ...n, iconKey } : n);
    this.nodePins.set(updated);
  }

  getSanitizedIcon(iconKey: string): SafeHtml {
    const svgString = ClinicalIcons[iconKey as keyof typeof ClinicalIcons] || ClinicalIcons.Suggestion;
    return this.sanitizer.bypassSecurityTrustHtml(svgString);
  }
}
