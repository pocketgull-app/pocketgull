import { Component, ChangeDetectionStrategy, input, computed, signal, inject, ViewChild, ElementRef, effect, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../services/theme.service';
import * as echarts from 'echarts';

export interface IBiomarkerStatus {
  name: string;
  level: 'Deficient' | 'Sub-optimal' | 'Optimal' | 'High' | 'Excess';
  pathway: string;
}

/** WHO/CDC clinical reference guidelines mapped to biomarker names. */
const WHO_CDC_GUIDELINES: Record<string, string> = {
  'Magnesium':          'WHO RNI: 220–260 mg/day (adults). CDC notes Mg deficiency linked to type 2 diabetes, CVD, and osteoporosis.',
  'Vitamin D3':         'WHO: 5–15 µg/day (200–600 IU). CDC: serum 25(OH)D ≥20 ng/mL sufficient; ≥30 ng/mL optimal for bone health.',
  'Vitamin B12':        'WHO RNI: 2.4 µg/day. CDC: serum B12 <200 pg/mL indicates deficiency; methylmalonic acid confirms.',
  'Folate (B9)':        'WHO RNI: 400 µg DFE/day. CDC: ≥400 µg folic acid pre-conception reduces NTD risk by 50–70%.',
  'Zinc':               'WHO RNI: 4.9–7.0 mg/day (females), 7.0–9.8 mg/day (males). CDC: zinc supplementation reduces diarrhea duration 25%.',
  'Homocysteine':       'WHO: >15 µmol/L = hyperhomocysteinemia. CDC: elevated Hcy independently associated with CVD and stroke risk.',
  'Ferritin':           'WHO: serum ferritin <15 µg/L = iron deficiency. CDC: 12–150 ng/mL (females), 12–300 ng/mL (males) normal range.',
  'Vitamin C':          'WHO RNI: 45 mg/day. CDC: serum ascorbic acid <11.4 µmol/L = deficiency; scurvy risk below 10 mg/day intake.',
  'Glutathione (GSH)':  'CDC/NIH: Intracellular master antioxidant; protects oligodendrocytes from demyelination and peroxynitrite damage.',
  'CoQ10':              'Mitochondrial Complex I-III electron transporter; rescues axonal energy synthesis in high-demand neural tissue.'
};

@Component({
  selector: 'app-biomarker-matrix',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (biomarkers().length > 0) {
      <div class="mb-8 mt-4 bg-zinc-900/5 dark:bg-black/20 rounded-2xl p-4 md:p-6 border border-emerald-900/10 dark:border-emerald-500/10 shadow-inner relative overflow-hidden">
        <!-- Glowing background effect -->
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl rounded-full"></div>
        <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/5 blur-3xl rounded-full"></div>

        <div class="relative z-10">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
            <div class="flex items-center gap-3">
              <div class="w-7 h-7 md:w-8 md:h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm md:text-base font-bold text-gray-900 dark:text-emerald-50 uppercase tracking-widest">
                  {{ personaBiomarkerTitle() }}
                </h3>
                <p class="text-[10px] md:text-xs text-gray-600 dark:text-emerald-400/80 uppercase tracking-widest mt-0.5">Orthomolecular Telemetry Status</p>
              </div>
            </div>

            <!-- Header Controls: View Mode Switcher + WHO/CDC Toggle -->
            <div class="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <!-- View Switcher -->
              <div class="flex items-center gap-0.5 bg-gray-200/70 dark:bg-zinc-800 p-0.5 rounded-lg border border-gray-300/60 dark:border-zinc-700/60 text-[10px] font-mono font-bold">
                <button type="button" (click)="setViewMode('radar')"
                        [class.bg-white]="viewMode() === 'radar'"
                        [class.dark:bg-zinc-900]="viewMode() === 'radar'"
                        [class.text-emerald-600]="viewMode() === 'radar'"
                        [class.dark:text-emerald-400]="viewMode() === 'radar'"
                        [class.shadow-sm]="viewMode() === 'radar'"
                        class="px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"
                        title="Apache ECharts Orthomolecular Homeostasis Radar Web">
                  <span>🕸️</span> <span>Radar Web</span>
                </button>
                <button type="button" (click)="setViewMode('spectrum')"
                        [class.bg-white]="viewMode() === 'spectrum'"
                        [class.dark:bg-zinc-900]="viewMode() === 'spectrum'"
                        [class.text-emerald-600]="viewMode() === 'spectrum'"
                        [class.dark:text-emerald-400]="viewMode() === 'spectrum'"
                        [class.shadow-sm]="viewMode() === 'spectrum'"
                        class="px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"
                        title="Apache ECharts Biomarker Spectrum Bar Gauges">
                  <span>📊</span> <span>Spectrum</span>
                </button>
                <button type="button" (click)="setViewMode('cards')"
                        [class.bg-white]="viewMode() === 'cards'"
                        [class.dark:bg-zinc-900]="viewMode() === 'cards'"
                        [class.text-emerald-600]="viewMode() === 'cards'"
                        [class.dark:text-emerald-400]="viewMode() === 'cards'"
                        [class.shadow-sm]="viewMode() === 'cards'"
                        class="px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"
                        title="3D Flip Cards for Food-as-Medicine Sourcing">
                  <span>🗂️</span> <span>3D Cards</span>
                </button>
              </div>

              <!-- Global WHO/CDC toggle -->
              <label class="flex items-center gap-1.5 cursor-pointer select-none group shrink-0" title="Show WHO/CDC clinical guidelines for all biomarkers">
                <input type="checkbox" class="sr-only peer" (change)="toggleAllGuidelines()" [checked]="allGuidelinesExpanded()">
                <div class="w-8 h-[18px] md:w-9 md:h-5 bg-gray-300 dark:bg-zinc-700 rounded-full relative transition-colors peer-checked:bg-sky-500 dark:peer-checked:bg-sky-600 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-400 peer-focus-visible:ring-offset-1">
                  <div class="absolute left-0.5 top-0.5 w-3.5 h-3.5 md:w-4 md:h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-3.5 md:peer-checked:translate-x-4"
                       [class.translate-x-3.5]="allGuidelinesExpanded()"
                       [class.md:translate-x-4]="allGuidelinesExpanded()"></div>
                </div>
                <span class="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors whitespace-nowrap">WHO/CDC</span>
              </label>
            </div>
          </div>

          @if (introText()) {
            <p class="text-[10px] md:text-xs text-gray-700 dark:text-zinc-300 mb-4 md:mb-6 leading-relaxed font-medium">
              {{ introText() }}
            </p>
          }

          <!-- APACHE ECHARTS VIEW (Radar Web or Spectrum Bar) -->
          @if (viewMode() === 'radar' || viewMode() === 'spectrum') {
            <div class="relative w-full h-80 sm:h-96 bg-white/40 dark:bg-zinc-900/40 rounded-xl border border-gray-200/60 dark:border-zinc-800/60 p-2 mb-4">
              <div #chartCanvas class="w-full h-full"></div>
              <div class="absolute bottom-2 right-3 text-[9px] font-mono text-gray-400 dark:text-zinc-500 uppercase tracking-widest pointer-events-none">
                Apache ECharts 6.1 • SVG Telemetry
              </div>
            </div>

            <!-- Interactive Food-as-Medicine card when biomarker clicked -->
            @if (selectedBiomarker(); as selected) {
              <div class="mb-4 p-4 rounded-xl bg-emerald-950 text-white border border-emerald-500/40 shadow-xl animate-fadeIn">
                <div class="flex items-center justify-between border-b border-emerald-800 pb-2 mb-2 font-mono text-xs">
                  <span class="text-emerald-300 font-bold uppercase flex items-center gap-1.5">
                    <span>🥗</span> Food-as-Medicine Sourcing: {{ selected.name }}
                    <span class="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase"
                          [class.bg-rose-500\/20]="selected.level === 'Deficient'"
                          [class.text-rose-300]="selected.level === 'Deficient'"
                          [class.bg-amber-500\/20]="selected.level === 'Sub-optimal'"
                          [class.text-amber-300]="selected.level === 'Sub-optimal'"
                          [class.bg-emerald-500\/20]="selected.level === 'Optimal'"
                          [class.text-emerald-300]="selected.level === 'Optimal'"
                          [class.bg-purple-500\/20]="selected.level === 'High' || selected.level === 'Excess'"
                          [class.text-purple-300]="selected.level === 'High' || selected.level === 'Excess'">
                      {{ selected.level }}
                    </span>
                  </span>
                  <button type="button" (click)="selectedBiomarker.set(null)" class="text-emerald-400 hover:text-emerald-200 text-[10px] cursor-pointer">
                    ✕ close
                  </button>
                </div>
                <p class="text-xs text-emerald-100 leading-relaxed mb-2">
                  <strong>Dietary Sources:</strong> {{ getFoodSourcingGuide(selected.name) }}
                </p>
                @if (getGuideline(selected.name); as guideline) {
                  <p class="text-[11px] text-sky-200 bg-sky-950/60 p-2 rounded border border-sky-800/50 mb-2">
                    <strong>CDC/WHO Clinical Guideline:</strong> {{ guideline }}
                  </p>
                }
                <div class="pt-1.5 border-t border-emerald-900/60 font-mono text-[9px] text-emerald-400 flex justify-between">
                  <span>Targeted Pathway: {{ selected.pathway }}</span>
                  <span>Bioavailability Optimized</span>
                </div>
              </div>
            }

            <!-- Quick click-chips for all biomarkers -->
            <div class="flex flex-wrap gap-1.5 mb-2">
              @for (m of biomarkers(); track m.name) {
                @let isSelected = selectedBiomarker()?.name === m.name;
                @let isDef = m.level === 'Deficient' || m.level === 'Excess';
                @let isWarn = m.level === 'Sub-optimal' || m.level === 'High';
                <button type="button" (click)="selectBiomarker(m)"
                        class="px-2 py-1 rounded-md text-[10px] font-mono font-medium border transition cursor-pointer flex items-center gap-1"
                        [class.ring-2]="isSelected"
                        [class.ring-emerald-400]="isSelected"
                        [class.bg-rose-500\/10]="isDef"
                        [class.border-rose-500\/30]="isDef"
                        [class.text-rose-600]="isDef"
                        [class.dark:text-rose-300]="isDef"
                        [class.bg-amber-500\/10]="isWarn"
                        [class.border-amber-500\/30]="isWarn"
                        [class.text-amber-600]="isWarn"
                        [class.dark:text-amber-300]="isWarn"
                        [class.bg-emerald-500\/10]="!isDef && !isWarn"
                        [class.border-emerald-500\/30]="!isDef && !isWarn"
                        [class.text-emerald-700]="!isDef && !isWarn"
                        [class.dark:text-emerald-300]="!isDef && !isWarn">
                  <span>{{ m.name }}</span>
                  <span class="text-[8px] uppercase opacity-75 font-bold">({{ m.level }})</span>
                </button>
              }
            </div>
          }

          <!-- 3D CARDS VIEW -->
          @if (viewMode() === 'cards') {
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              @for (marker of biomarkers(); track marker.name) {
                @let isCritical = marker.level === 'Deficient' || marker.level === 'Excess';
                @let isWarning = marker.level === 'Sub-optimal' || marker.level === 'High';
                @let isOptimal = marker.level === 'Optimal';
                @let isBiomarkerFlipped = isBiomarkerFlippedMethod(marker.name);
                @let guidelineVisible = isGuidelineExpanded(marker.name);
                @let guideline = getGuideline(marker.name);

                <div (dblclick)="toggleBiomarkerFlip(marker.name); $event.stopPropagation()"
                     class="relative perspective-1000 group cursor-pointer select-none h-48"
                     title="Double-click or click badge to flip over for Food-as-Medicine Sourcing Guide & Bioavailability">
                  
                  <div [class.rotate-y-180]="isBiomarkerFlipped"
                       class="relative w-full h-full transition-transform duration-500 transform-style-3d">

                    <!-- FRONT FACE -->
                    <div class="p-3 md:p-4 rounded-xl border flex flex-col justify-between h-full w-full absolute inset-0 backface-hidden shadow-sm"
                         [class.bg-rose-500\/10]="isCritical"
                         [class.border-rose-500\/30]="isCritical"
                         [class.bg-amber-500\/10]="isWarning"
                         [class.border-amber-500\/30]="isWarning"
                         [class.bg-emerald-500\/10]="isOptimal"
                         [class.border-emerald-500\/30]="isOptimal">
                      <div>
                        <div class="flex items-center justify-between mb-1.5">
                          <span class="text-xs font-bold text-gray-900 dark:text-zinc-100 uppercase tracking-wider">{{ marker.name }}</span>
                          <button type="button" (click)="toggleBiomarkerFlip(marker.name, $event); $event.stopPropagation()"
                                  class="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 cursor-pointer transition">
                            dblclick 🔄
                          </button>
                        </div>
                        <div class="text-[11px] font-mono font-bold uppercase mb-2"
                             [class.text-rose-600]="isCritical"
                             [class.dark:text-rose-400]="isCritical"
                             [class.text-amber-600]="isWarning"
                             [class.dark:text-amber-400]="isWarning"
                             [class.text-emerald-600]="isOptimal"
                             [class.dark:text-emerald-400]="isOptimal">
                          {{ marker.level }}
                        </div>
                        <p class="text-[10px] text-gray-600 dark:text-zinc-400 leading-snug line-clamp-2">
                          {{ marker.pathway }}
                        </p>
                      </div>

                      @if (guidelineVisible && guideline) {
                        <div class="mt-1 p-1 rounded bg-sky-500/10 border border-sky-500/30 text-[9px] text-sky-700 dark:text-sky-300 leading-tight">
                          {{ guideline }}
                        </div>
                      }
                    </div>

                    <!-- BACK FACE -->
                    <div class="p-3 md:p-4 rounded-xl bg-emerald-950 text-white border border-emerald-500/40 shadow-2xl flex flex-col justify-between h-full w-full absolute inset-0 rotate-y-180 backface-hidden font-sans text-xs">
                      <div>
                        <div class="flex items-center justify-between border-b border-emerald-800 pb-1 mb-1.5 font-mono text-[10px]">
                          <span class="text-emerald-300 font-bold uppercase flex items-center gap-1">
                            <span>🥗</span> Food-as-Medicine Sourcing
                          </span>
                          <button type="button" (click)="toggleBiomarkerFlip(marker.name, $event); $event.stopPropagation()"
                                  class="text-emerald-400 hover:text-emerald-200 text-[9px] cursor-pointer">
                            dblclick 🔄 flip
                          </button>
                        </div>
                        <p class="text-[10px] text-emerald-100 leading-snug">
                          <strong>Dietary Sources:</strong> {{ getFoodSourcingGuide(marker.name) }}
                        </p>
                      </div>
                      <div class="pt-1 border-t border-emerald-900 font-mono text-[9px] text-emerald-400 flex justify-between">
                        <span>Bioavailability Optimized</span>
                        <span>Double-click to return</span>
                      </div>
                    </div>

                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
  `]
})
export class BiomarkerMatrixComponent implements OnDestroy {
  reportText = input<string>('');
  protected readonly themeService = inject(ThemeService);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('chartCanvas') chartCanvas?: ElementRef<HTMLDivElement>;
  private chartInstance: echarts.ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;

  viewMode = signal<'radar' | 'spectrum' | 'cards'>('radar');
  selectedBiomarker = signal<IBiomarkerStatus | null>(null);

  readonly personaBiomarkerTitle = computed(() => {
    return '🔬 Biomarker Matrix Telemetry';
  });

  /** Track which biomarker guideline cards are expanded */
  private expandedGuidelines = signal<Set<string>>(new Set());

  /** Whether all guidelines are toggled on globally */
  allGuidelinesExpanded = signal(false);

  constructor() {
    effect(() => {
      const markers = this.biomarkers();
      const mode = this.viewMode();
      const isDark = this.themeService.activeTheme() === 'dark';
      if (markers.length > 0 && mode !== 'cards') {
        setTimeout(() => this.renderChart(), 50);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  setViewMode(mode: 'radar' | 'spectrum' | 'cards'): void {
    this.viewMode.set(mode);
    if (mode !== 'cards') {
      setTimeout(() => this.renderChart(), 50);
    }
  }

  selectBiomarker(m: IBiomarkerStatus): void {
    if (this.selectedBiomarker()?.name === m.name) {
      this.selectedBiomarker.set(null);
    } else {
      this.selectedBiomarker.set(m);
    }
  }

  /** Toggle an individual biomarker's WHO/CDC guideline visibility */
  toggleGuideline(name: string): void {
    const current = new Set(this.expandedGuidelines());
    if (current.has(name)) {
      current.delete(name);
    } else {
      current.add(name);
    }
    this.expandedGuidelines.set(current);
    this.allGuidelinesExpanded.set(current.size === this.biomarkers().length);
  }

  /** Toggle all guidelines on/off */
  toggleAllGuidelines(): void {
    const nextState = !this.allGuidelinesExpanded();
    this.allGuidelinesExpanded.set(nextState);
    if (nextState) {
      this.expandedGuidelines.set(new Set(this.biomarkers().map(m => m.name)));
    } else {
      this.expandedGuidelines.set(new Set());
    }
  }

  readonly flippedBiomarkers = signal<Set<string>>(new Set());
  private lastBiomarkerFlipTime = 0;

  toggleBiomarkerFlip(name: string, event?: Event): void {
    if (event) event.stopPropagation();
    const now = Date.now();
    if (now - this.lastBiomarkerFlipTime < 200) return;
    this.lastBiomarkerFlipTime = now;
    const set = new Set(this.flippedBiomarkers());
    if (set.has(name)) set.delete(name);
    else set.add(name);
    this.flippedBiomarkers.set(set);
  }

  isBiomarkerFlipped(name: string): boolean {
    return this.flippedBiomarkers().has(name);
  }

  isBiomarkerFlippedMethod(name: string): boolean {
    return this.flippedBiomarkers().has(name);
  }

  getFoodSourcingGuide(name: string): string {
    const map: Record<string, string> = {
      'Magnesium':          'Organic pumpkin seeds, spinach, dark chocolate (85%+), avocados, and mineral spring water.',
      'Vitamin D3':         'Wild-caught Alaskan salmon, cod liver oil, egg yolks, shiitake mushrooms, and 15 mins morning sunlight.',
      'Vitamin B12':        'Grass-fed beef liver, wild sardines, nutritional yeast, clams, and pasture-raised eggs.',
      'Folate (B9)':        'L-5-MTHF rich foods: dark leafy greens, asparagus, lentils, broccoli, and organic avocado.',
      'Zinc':               'Wild oysters, pumpkin seeds, grass-fed lamb, hemp seeds, and pasture-raised poultry.',
      'Homocysteine':       'Reduce refined grains. Support clearance with bioactive L-methylfolate, P5P (B6), and Methyl-B12.',
      'Ferritin':           'Heme iron: wild venison, grass-fed beef. Non-heme: cooked lentils with Vitamin C to triple absorption.',
      'Vitamin C':          'Wild blueberries, rose hips, acerola cherry, bell peppers, and fresh citrus.',
      'Glutathione (GSH)':  'Cruciferous vegetables (sulforaphane), bioactive whey, garlic, onions, asparagus, and avocado.',
      'CoQ10':              'Grass-fed heart/organ meats, wild mackerel, herring, rainbow trout, and sesame seeds.'
    };
    return map[name] ?? 'Whole food sources rich in micronutrient co-factors support bioavailable enzymatic conversion.';
  }

  /** Check if a specific guideline is expanded */
  isGuidelineExpanded(name: string): boolean {
    return this.expandedGuidelines().has(name);
  }

  /** Get the WHO/CDC guideline for a given biomarker name */
  getGuideline(name: string): string | null {
    return WHO_CDC_GUIDELINES[name] ?? null;
  }

  introText = computed(() => {
    const text = this.reportText();
    if (!text) return '';
    const match = text.match(/###\s*(?:Biochemical\s*\&\s*)?Biomarker\s*Matrix\s*\n([\s\S]*?)(?:```|###|\||$)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    return '';
  });

  // Auto-parse the AI markdown report or patient data to extract biomarker statuses
  biomarkers = computed(() => {
    const text = this.reportText();
    if (!text) return [];

    const markers: IBiomarkerStatus[] = [];
    const dictionary = [
      { name: 'Magnesium', pathway: 'ATP Synthesis / NMDA / Muscle' },
      { name: 'Vitamin D3', pathway: 'Immune Modulation / Bone / Neuroprotection' },
      { name: 'Vitamin B12', pathway: 'Myelin Synthesis / Methylation' },
      { name: 'Folate (B9)', pathway: 'Methylation / DNA Synthesis' },
      { name: 'Zinc', pathway: 'Immune / Blood-Brain Barrier' },
      { name: 'Homocysteine', pathway: 'Cardiovascular / Neurotoxicity' },
      { name: 'Ferritin', pathway: 'Iron Storage / Thyroid / Cellular Respiration' },
      { name: 'Vitamin C', pathway: 'Collagen / Antioxidant Shield' },
      { name: 'Glutathione (GSH)', pathway: 'Antioxidant / Oligodendrocyte Shield' },
      { name: 'CoQ10', pathway: 'Mitochondrial Respiration / Axonal Energy' }
    ];

    // Strategy 1a: Look for JSON code blocks or raw JSON arrays
    let jsonText: string | null = null;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)(?:```|$)/i);
    if (jsonMatch && jsonMatch[1]) {
      jsonText = jsonMatch[1].trim();
    } else {
      const rawArrayMatch = text.match(/(\[\s*\{\s*"name"[\s\S]*?\])/i);
      if (rawArrayMatch && rawArrayMatch[1]) {
        jsonText = rawArrayMatch[1].trim();
      }
    }

    if (jsonText && jsonText.includes('"name"')) {
      try {
        let jsonStr = jsonText;
        if (!jsonStr.endsWith(']')) {
          const lastCurly = jsonStr.lastIndexOf('}');
          if (lastCurly !== -1) {
            jsonStr = jsonStr.substring(0, lastCurly + 1) + '\n]';
            if (!jsonStr.startsWith('[')) {
              jsonStr = '[\n' + jsonStr;
            }
          }
        }
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          parsed.forEach(item => {
            if (item && typeof item === 'object' && item.name) {
              const matchedDict = dictionary.find(d => d.name.toLowerCase() === item.name.toLowerCase());
              const name = matchedDict ? matchedDict.name : item.name;
              const pathway = item.pathway || (matchedDict ? matchedDict.pathway : 'Metabolic Pathway');
              const levelLower = String(item.level || '').toLowerCase();
              let level: IBiomarkerStatus['level'] = 'Optimal';
              if (levelLower.includes('defic') || levelLower === 'low' || levelLower.includes('deplet')) level = 'Deficient';
              else if (levelLower.includes('sub-optimal') || levelLower.includes('low-normal') || levelLower.includes('borderline')) level = 'Sub-optimal';
              else if (levelLower.includes('high') || levelLower.includes('elevat')) level = 'High';
              else if (levelLower.includes('excess')) level = 'Excess';
              else if (levelLower.includes('optimal') || levelLower.includes('normal')) level = 'Optimal';

              markers.push({ name, level, pathway });
            }
          });
        }
      } catch {
        // If parsing fails, extract via regex
        const objRegex = /\{\s*"name"\s*:\s*"([^"]+)"\s*,\s*"level"\s*:\s*"([^"]+)"(?:\s*,\s*"pathway"\s*:\s*"([^"]*)")?\s*\}/gi;
        let match;
        while ((match = objRegex.exec(jsonText)) !== null) {
          const name = match[1];
          const levelStr = match[2].toLowerCase();
          const pathway = match[3] || 'Metabolic Pathway';
          let level: IBiomarkerStatus['level'] = 'Optimal';
          if (levelStr.includes('defic') || levelStr === 'low' || levelStr.includes('deplet')) level = 'Deficient';
          else if (levelStr.includes('sub-optimal') || levelStr.includes('low-normal') || levelStr.includes('borderline')) level = 'Sub-optimal';
          else if (levelStr.includes('high') || levelStr.includes('elevat')) level = 'High';
          else if (levelStr.includes('excess')) level = 'Excess';

          markers.push({ name, level, pathway });
        }
      }
    }

    if (markers.length > 0) {
      return markers;
    }

    // Strategy 1b: Look for Markdown tables (| Nutrient/Biomarker | Level | Pathway |)
    const tableRegex = /\|([^\n\r]+)\|[ \t]*\r?\n\|[-:\s|]+\|\r?\n((?:\|[^\n\r]+\|\r?\n?)+)/gi;
    let tableMatch;
    while ((tableMatch = tableRegex.exec(text)) !== null) {
      const headerRow = tableMatch[1];
      const headers = headerRow.split('|').map(h => h.trim().toLowerCase());
      
      const nameIdx = headers.findIndex(h => h.includes('biomarker') || h.includes('nutrient') || h.includes('marker') || h.includes('intervention') || h.includes('molecule'));
      const levelIdx = headers.findIndex(h => h.includes('level') || h.includes('status'));
      const pathwayIdx = headers.findIndex(h => h.includes('pathway') || h.includes('target'));

      if (nameIdx !== -1 && levelIdx !== -1) {
        const bodyLines = tableMatch[2].trim().split(/\r?\n/);
        for (const line of bodyLines) {
          const cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
          if (cells.length >= 2) {
            const rawName = cells[nameIdx] ? cells[nameIdx].replace(/\*\*/g, '').trim() : '';
            const rawLevel = cells[levelIdx] ? cells[levelIdx].replace(/<[^>]+>/g, '').replace(/\*\*/g, '').trim() : '';
            const rawPathway = pathwayIdx !== -1 && cells[pathwayIdx] ? cells[pathwayIdx].replace(/\*\*/g, '').trim() : 'Metabolic Pathway';

            if (rawName && rawLevel) {
              const matchedDict = dictionary.find(d => d.name.toLowerCase() === rawName.toLowerCase());
              const name = matchedDict ? matchedDict.name : rawName;
              const pathway = rawPathway !== 'Metabolic Pathway' ? rawPathway : (matchedDict ? matchedDict.pathway : 'Metabolic Pathway');
              const levelLower = rawLevel.toLowerCase();
              let level: IBiomarkerStatus['level'] = 'Optimal';
              if (levelLower.includes('defic') || levelLower === 'low' || levelLower.includes('deplet')) level = 'Deficient';
              else if (levelLower.includes('sub-optimal') || levelLower.includes('low-normal') || levelLower.includes('borderline')) level = 'Sub-optimal';
              else if (levelLower.includes('high') || levelLower.includes('elevat')) level = 'High';
              else if (levelLower.includes('excess')) level = 'Excess';
              else if (levelLower.includes('optimal') || levelLower.includes('normal')) level = 'Optimal';

              markers.push({ name, level, pathway });
            }
          }
        }
      }
    }

    if (markers.length > 0) {
      return markers;
    }

    // Strategy 2: Heuristic regex fallback for narrative notes
    const textLower = text.toLowerCase();
    dictionary.forEach(d => {
      const regex = new RegExp(`(?:${d.name.toLowerCase().replace(/\\(.+\\)/, '').trim()}).{0,40}(deficient|deficiency|low|sub-optimal|optimal|high|excess|elevated)`, 'i');
      const match = textLower.match(regex);
      if (match) {
        const val = match[1].toLowerCase();
        let level: IBiomarkerStatus['level'] = 'Optimal';
        if (val.includes('defic') || val === 'low') level = 'Deficient';
        if (val === 'sub-optimal') level = 'Sub-optimal';
        if (val === 'high' || val === 'elevated') level = 'High';
        if (val === 'excess') level = 'Excess';
        
        markers.push({ name: d.name, level, pathway: d.pathway });
      } else {
        const reverseRegex = new RegExp(`(deficient|deficiency|low|sub-optimal|optimal|high|excess|elevated).{0,40}(?:${d.name.toLowerCase().replace(/\\(.+\\)/, '').trim()})`, 'i');
        const revMatch = textLower.match(reverseRegex);
        if (revMatch) {
          const val = revMatch[1].toLowerCase();
          let level: IBiomarkerStatus['level'] = 'Optimal';
          if (val.includes('defic') || val === 'low') level = 'Deficient';
          if (val === 'sub-optimal') level = 'Sub-optimal';
          if (val === 'high' || val === 'elevated') level = 'High';
          if (val === 'excess') level = 'Excess';
          
          markers.push({ name: d.name, level, pathway: d.pathway });
        }
      }
    });

    return markers;
  });

  private renderChart(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const dom = this.chartCanvas?.nativeElement;
    if (!dom) return;

    const markers = this.biomarkers();
    if (markers.length === 0) return;

    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }

    this.chartInstance = echarts.init(dom, null, { renderer: 'svg' });

    if (!this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.chartInstance?.resize();
      });
      this.resizeObserver.observe(dom);
    }

    const isDark = this.themeService.activeTheme() === 'dark';
    const textColor = isDark ? '#E2E8F0' : '#1E293B';
    const splitLineColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
    const axisLineColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';

    const levelMap = (lvl: string): number => {
      const l = lvl.toLowerCase();
      if (l.includes('defic') || l === 'low' || l.includes('deplet')) return 1;
      if (l.includes('sub-optimal') || l.includes('low-normal') || l.includes('borderline')) return 2;
      if (l.includes('optimal') || l === 'normal') return 3;
      if (l.includes('high') || l.includes('elevat') || l.includes('excess')) return 4;
      return 3;
    };

    const mode = this.viewMode();

    if (mode === 'radar') {
      const indicators = markers.map(m => ({
        name: m.name,
        max: 4,
        min: 0
      }));

      const patientValues = markers.map(m => levelMap(m.level));
      const targetValues = markers.map(() => 3);

      const option: echarts.EChartsOption = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: isDark ? '#18181B' : '#FFFFFF',
          borderColor: isDark ? '#27272A' : '#E4E4E7',
          textStyle: { color: isDark ? '#F4F4F5' : '#18181B', fontSize: 11 },
          formatter: (params: any) => {
            if (params.seriesName === 'Clinical Target (Optimal)') {
              return `<strong>Equilibrium Baseline:</strong><br/>Target Optimal (Level 3.0)`;
            }
            let html = `<div style="font-weight:700;margin-bottom:4px;color:#0D9488;">🔬 Orthomolecular Status</div>`;
            markers.forEach((m, idx) => {
              const val = patientValues[idx];
              let color = '#10B981';
              if (val === 1) color = '#F43F5E';
              else if (val === 2) color = '#F59E0B';
              else if (val >= 4) color = '#8B5CF6';
              html += `<div style="display:flex;justify-content:space-between;gap:12px;font-size:10px;">
                <span>${m.name}:</span>
                <span style="font-weight:700;color:${color}">${m.level}</span>
              </div>`;
            });
            return html;
          }
        },
        legend: {
          bottom: 4,
          textStyle: { color: textColor, fontSize: 11 },
          data: ['Clinical Target (Optimal)', 'Patient Telemetry']
        },
        radar: {
          indicator: indicators,
          shape: 'polygon',
          splitNumber: 4,
          radius: '68%',
          axisName: {
            color: textColor,
            fontSize: 10,
            fontWeight: 'bold'
          },
          splitLine: { lineStyle: { color: splitLineColor } },
          splitArea: {
            show: true,
            areaStyle: {
              color: isDark
                ? ['rgba(244, 63, 94, 0.04)', 'rgba(245, 158, 11, 0.04)', 'rgba(16, 185, 129, 0.06)', 'rgba(139, 92, 246, 0.04)']
                : ['rgba(244, 63, 94, 0.03)', 'rgba(245, 158, 11, 0.03)', 'rgba(16, 185, 129, 0.05)', 'rgba(139, 92, 246, 0.03)']
            }
          },
          axisLine: { lineStyle: { color: axisLineColor } }
        },
        series: [
          {
            name: 'Orthomolecular Homeostasis',
            type: 'radar',
            data: [
              {
                value: targetValues,
                name: 'Clinical Target (Optimal)',
                symbol: 'none',
                lineStyle: { color: '#10B981', width: 2, type: 'dashed' },
                areaStyle: { color: 'rgba(16, 185, 129, 0.12)' }
              },
              {
                value: patientValues,
                name: 'Patient Telemetry',
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: { color: '#06B6D4', width: 2.5 },
                itemStyle: { color: '#06B6D4', borderColor: '#FFFFFF', borderWidth: 1.5 },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(6, 182, 212, 0.35)' },
                    { offset: 1, color: 'rgba(16, 185, 129, 0.10)' }
                  ])
                }
              }
            ]
          }
        ]
      };

      this.chartInstance.setOption(option, true);
    } else if (mode === 'spectrum') {
      const names = [...markers.map(m => m.name)].reverse();
      const patientValues = [...markers.map(m => levelMap(m.level))].reverse();
      const reversedMarkers = [...markers].reverse();

      const option: echarts.EChartsOption = {
        backgroundColor: 'transparent',
        grid: {
          top: 20,
          right: 35,
          bottom: 35,
          left: 140,
          containLabel: false
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: isDark ? '#18181B' : '#FFFFFF',
          borderColor: isDark ? '#27272A' : '#E4E4E7',
          textStyle: { color: isDark ? '#F4F4F5' : '#18181B', fontSize: 11 },
          formatter: (params: any) => {
            const param = Array.isArray(params) ? params[0] : params;
            const idx = param.dataIndex;
            const m = reversedMarkers[idx];
            if (!m) return '';
            const guideline = this.getGuideline(m.name);
            return `
              <div style="font-weight:bold;margin-bottom:4px;font-size:12px;">${m.name}</div>
              <div style="font-size:11px;margin-bottom:2px;">Status: <strong>${m.level}</strong></div>
              <div style="font-size:10px;color:#0D9488;margin-bottom:4px;">Pathway: ${m.pathway}</div>
              ${guideline ? `<div style="font-size:9px;color:#64748B;max-width:240px;line-height:1.3;border-top:1px solid #E2E8F0;padding-top:4px;margin-top:4px;">${guideline}</div>` : ''}
            `;
          }
        },
        xAxis: {
          type: 'value',
          min: 0,
          max: 4,
          interval: 1,
          axisLabel: {
            formatter: (val: number) => {
              if (val === 1) return 'Deficient';
              if (val === 2) return 'Low / Sub-opt';
              if (val === 3) return 'Optimal Target';
              if (val === 4) return 'Elevated';
              return '';
            },
            color: textColor,
            fontSize: 10
          },
          splitLine: {
            lineStyle: { color: splitLineColor, type: 'dashed' }
          }
        },
        yAxis: {
          type: 'category',
          data: names,
          axisLabel: {
            color: textColor,
            fontWeight: 'bold',
            fontSize: 10
          },
          axisTick: { show: false },
          axisLine: { lineStyle: { color: axisLineColor } }
        },
        series: [
          {
            type: 'bar',
            barWidth: 16,
            data: reversedMarkers.map((m, idx) => {
              const val = patientValues[idx];
              let color = '#10B981';
              if (val === 1) color = '#F43F5E';
              else if (val === 2) color = '#F59E0B';
              else if (val >= 4) color = '#8B5CF6';
              return {
                value: val,
                itemStyle: {
                  color: color,
                  borderRadius: [0, 4, 4, 0]
                }
              };
            }),
            markLine: {
              silent: true,
              symbol: 'none',
              lineStyle: {
                color: '#10B981',
                type: 'dashed',
                width: 2
              },
              data: [{ xAxis: 3, label: { formatter: 'Target', position: 'end', color: '#10B981', fontSize: 10 } }]
            }
          }
        ]
      };

      this.chartInstance.setOption(option, true);
    }

    this.chartInstance.off('click');
    this.chartInstance.on('click', (params: any) => {
      if (params.name) {
        const found = markers.find(m => m.name.toLowerCase() === params.name.toLowerCase());
        if (found) {
          this.selectedBiomarker.set(found);
        }
      }
    });
  }
}
