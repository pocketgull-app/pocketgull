import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IGlyphSpec {
  char: string;
  name: string;
  category: 'uppercase' | 'lowercase' | 'numeral' | 'symbol' | 'ligature';
  svgPath: string;
  width: number;
}

@Component({
  selector: 'app-pocketgull-typeface-specimen',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-amber-500/10 border border-amber-500/30 rounded-3xl space-y-6 font-sans">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-500 text-zinc-950 font-black flex items-center justify-center text-2xl shadow-lg">
            ✍️
          </div>
          <div>
            <h2 class="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
              PocketGull Variable Typeface &amp; Medical Engine
            </h2>
            <p class="text-xs text-amber-700 dark:text-amber-300 font-medium">
              Variable font axes (Weight, Optical Size, Slant), Dark-Mode Optical Delensing, and OpenType Disambiguation.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-3 py-1 bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/40 rounded-full text-xs font-bold font-mono">
            v2.0.0 Variable (VF)
          </span>
          <span class="px-3 py-1 bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold font-mono">
            WCAG 2.1 AAA
          </span>
        </div>
      </div>

      <!-- Variable Axes Controls Bar -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/70 dark:bg-zinc-900/70 border border-amber-500/20 rounded-2xl">
        <!-- Weight Axis (wght) -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
            <span>Weight (wght):</span>
            <span class="text-amber-600 dark:text-amber-400">{{ weightAxis() }}</span>
          </div>
          <input 
            type="range" 
            min="100" 
            max="900" 
            step="25"
            [value]="weightAxis()" 
            (input)="updateWeight($event)"
            class="w-full accent-amber-500 cursor-pointer"
          />
          <div class="flex justify-between text-[10px] text-zinc-400 font-mono">
            <span>100 Thin</span>
            <span>400 Regular</span>
            <span>700 Bold</span>
            <span>900 Black</span>
          </div>
        </div>

        <!-- Optical Size (opsz) -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
            <span>Optical Size (opsz):</span>
            <span class="text-amber-600 dark:text-amber-400">{{ opticalSize() }}pt</span>
          </div>
          <input 
            type="range" 
            min="8" 
            max="72" 
            step="1"
            [value]="opticalSize()" 
            (input)="updateOpticalSize($event)"
            class="w-full accent-amber-500 cursor-pointer"
          />
          <div class="flex justify-between text-[10px] text-zinc-400 font-mono">
            <span>8pt Caption</span>
            <span>16pt Body</span>
            <span>48pt Display</span>
          </div>
        </div>

        <!-- Slant / Nib Angle (slnt) -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
            <span>Nib Slant (slnt):</span>
            <span class="text-amber-600 dark:text-amber-400">{{ slantAxis() }}°</span>
          </div>
          <input 
            type="range" 
            min="-12" 
            max="0" 
            step="1"
            [value]="slantAxis()" 
            (input)="updateSlant($event)"
            class="w-full accent-amber-500 cursor-pointer"
          />
          <div class="flex justify-between text-[10px] text-zinc-400 font-mono">
            <span>-12° Chiseltip</span>
            <span>-6° Italics</span>
            <span>0° Upright</span>
          </div>
        </div>
      </div>

      <!-- Feature Flags & Delensing Toggles -->
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <button 
          (click)="toggleDelensing()"
          [class.bg-amber-500]="opticalDelensing()"
          [class.text-zinc-950]="opticalDelensing()"
          [class.bg-white]="!opticalDelensing()"
          [class.dark:bg-zinc-900]="!opticalDelensing()"
          class="px-3 py-1.5 border border-amber-500/30 rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span>🌓</span> Dark Mode Optical Delensing: {{ opticalDelensing() ? 'ON (-35Δ)' : 'OFF' }}
        </button>

        <button 
          (click)="toggleDisambiguation()"
          [class.bg-emerald-600]="disambiguation()"
          [class.text-white]="disambiguation()"
          [class.bg-white]="!disambiguation()"
          [class.dark:bg-zinc-900]="!disambiguation()"
          class="px-3 py-1.5 border border-emerald-500/30 rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span>🎯</span> OpenType Medical Disambiguation (cv05, cv08, zero): {{ disambiguation() ? 'ACTIVE' : 'DEFAULT' }}
        </button>

        <button 
          (click)="toggleTabular()"
          [class.bg-blue-600]="tabularFigures()"
          [class.text-white]="tabularFigures()"
          [class.bg-white]="!tabularFigures()"
          [class.dark:bg-zinc-900]="!tabularFigures()"
          class="px-3 py-1.5 border border-blue-500/30 rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span>📊</span> Tabular Metrics (tnum): {{ tabularFigures() ? 'ON' : 'OFF' }}
        </button>
      </div>

      <!-- Live Type Preview Input -->
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <label class="text-xs font-extrabold uppercase text-amber-800 dark:text-amber-300 tracking-wider">
            Interactive Specimen Sandbox
          </label>
          <div class="flex gap-1">
            <button (click)="setPreset('PocketGull 2026')" class="px-2 py-0.5 bg-amber-500/20 text-amber-900 dark:text-amber-200 rounded text-[11px] font-mono cursor-pointer">Brand</button>
            <button (click)="setPreset('HR: 72 bpm | 120/80 mmHg | SpO2: 99%')" class="px-2 py-0.5 bg-amber-500/20 text-amber-900 dark:text-amber-200 rounded text-[11px] font-mono cursor-pointer">Vitals</button>
            <button (click)="setPreset('APOE-e4 | Metformin 500mg PO BID')" class="px-2 py-0.5 bg-amber-500/20 text-amber-900 dark:text-amber-200 rounded text-[11px] font-mono cursor-pointer">Genomics</button>
          </div>
        </div>
        <input 
          type="text" 
          [value]="previewText()" 
          (input)="updateText($event)"
          class="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-amber-500/30 rounded-2xl text-lg font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Type something in PocketGull Variable..."
        />
      </div>

      <!-- Dynamic Vector & CSS Rendering Box -->
      <div 
        class="p-8 bg-amber-100/80 dark:bg-zinc-900/90 border border-amber-300 dark:border-zinc-800 rounded-2xl shadow-inner min-h-[140px] flex flex-col items-center justify-center gap-4 overflow-x-auto transition-all"
        [style.transform]="'skewX(' + slantAxis() + 'deg)'"
      >
        <!-- Top SVG Stroke Render with Variable Weight -->
        <div class="flex items-center gap-2 flex-wrap justify-center">
          @for (char of previewTextArray(); track $index) {
            @if (char === ' ') {
              <span class="w-4 inline-block"></span>
            } @else {
              <svg 
                class="transition-transform hover:scale-110" 
                [style.width.px]="opticalSize() * 1.4" 
                [style.height.px]="opticalSize() * 1.7" 
                viewBox="0 0 100 120"
              >
                <path 
                  [attr.d]="getGlyphPath(char)" 
                  class="text-zinc-950 dark:text-amber-400" 
                  [attr.stroke-width]="computedStrokeWidth()" 
                  stroke="currentColor" 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  fill="none" 
                />
              </svg>
            }
          }
        </div>

        <!-- Live CSS Variable Font Rendering Comparison -->
        <div 
          class="text-center font-pocketgull text-zinc-900 dark:text-zinc-100 transition-all"
          [style.font-size.px]="opticalSize()"
          [style.font-weight]="effectiveWeight()"
          [style.font-feature-settings]="computedFeatureSettings()"
        >
          {{ previewText() }}
        </div>
      </div>

      <!-- Quick Ligatures & Clinical Unit Chips -->
      <div class="space-y-2">
        <h4 class="text-xs font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400">
          Medical Notation &amp; Ligature Quick-Insert
        </h4>
        <div class="flex flex-wrap gap-1.5">
          @for (unit of medicalUnits; track unit) {
            <button 
              (click)="appendChar(' ' + unit)" 
              class="px-2.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono font-bold text-amber-700 dark:text-amber-300 hover:border-amber-500 transition shadow-2xs cursor-pointer"
            >
              + {{ unit }}
            </button>
          }
        </div>
      </div>

      <!-- Character Set Grid -->
      <div class="space-y-3">
        <h3 class="text-sm font-black uppercase text-zinc-800 dark:text-zinc-200 tracking-wide">
          Full Master Glyph Palette (Latin, Numeral, Medical, International)
        </h3>
        <div class="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2">
          @for (glyph of glyphCatalog; track glyph.char) {
            <div 
              class="p-2.5 bg-white dark:bg-zinc-950 border border-amber-500/20 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-amber-500/60 transition cursor-pointer" 
              (click)="appendChar(glyph.char)"
            >
              <svg class="w-6 h-7 text-zinc-900 dark:text-zinc-100" viewBox="0 0 100 120">
                <path 
                  [attr.d]="glyph.svgPath" 
                  stroke="currentColor" 
                  [attr.stroke-width]="computedStrokeWidth() * 0.9" 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  fill="none" 
                />
              </svg>
              <span class="text-[9px] font-mono text-zinc-500 uppercase">{{ glyph.char }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class PocketgullTypefaceSpecimenComponent {
  previewText = signal('PocketGull 2026');
  weightAxis = signal(700);
  opticalSize = signal(28);
  slantAxis = signal(0);
  opticalDelensing = signal(true);
  disambiguation = signal(true);
  tabularFigures = signal(true);

  previewTextArray = computed(() => this.previewText().split(''));

  effectiveWeight = computed(() => {
    const base = this.weightAxis();
    return this.opticalDelensing() ? Math.max(100, base - 35) : base;
  });

  computedStrokeWidth = computed(() => {
    const w = this.effectiveWeight();
    // Maps 100..900 to 2..10px stroke width
    return 2 + (w - 100) * (8 / 800);
  });

  computedFeatureSettings = computed(() => {
    const features: string[] = [];
    if (this.disambiguation()) {
      features.push('"cv05" 1', '"cv08" 1', '"cv11" 1', '"zero" 1');
    }
    if (this.tabularFigures()) {
      features.push('"tnum" 1');
    }
    return features.length ? features.join(', ') : 'normal';
  });

  readonly medicalUnits = [
    'mg/dL', 'µg/mL', 'mmHg', 'mmol/L', 'bpm', 'SpO₂', 'HbA1c', '±', 'Δ', '→', 'p < 0.001'
  ];

  readonly glyphCatalog: IGlyphSpec[] = [
    { char: 'P', name: 'Capital P', category: 'uppercase', width: 80, svgPath: 'M 25 15 L 25 105 M 25 15 C 65 15, 75 35, 75 50 C 75 65, 65 70, 25 70' },
    { char: 'o', name: 'Lowercase o', category: 'lowercase', width: 70, svgPath: 'M 50 45 C 25 45, 20 85, 50 85 C 80 85, 75 45, 50 45 Z' },
    { char: 'c', name: 'Lowercase c', category: 'lowercase', width: 65, svgPath: 'M 70 50 C 40 40, 20 60, 30 80 C 40 95, 70 85, 75 80' },
    { char: 'k', name: 'Lowercase k', category: 'lowercase', width: 70, svgPath: 'M 25 15 L 25 105 M 25 65 L 70 40 M 35 60 L 75 105' },
    { char: 'e', name: 'Lowercase e', category: 'lowercase', width: 65, svgPath: 'M 20 65 L 75 65 C 75 40, 45 40, 35 55 C 20 75, 45 90, 75 80' },
    { char: 't', name: 'Lowercase t', category: 'lowercase', width: 60, svgPath: 'M 45 20 L 45 95 C 45 105, 65 105, 75 95 M 20 45 L 75 45' },
    { char: 'G', name: 'Capital G', category: 'uppercase', width: 85, svgPath: 'M 75 35 C 50 15, 20 30, 20 60 C 20 90, 50 105, 75 85 L 75 60 L 50 60' },
    { char: 'u', name: 'Lowercase u', category: 'lowercase', width: 70, svgPath: 'M 25 45 L 25 80 C 25 95, 65 95, 65 80 L 65 45' },
    { char: 'l', name: 'Lowercase l (Hooked cv05)', category: 'lowercase', width: 45, svgPath: 'M 40 15 L 40 90 C 40 102, 60 102, 68 92' },
    { char: '0', name: 'Slashed Zero (zero)', category: 'numeral', width: 70, svgPath: 'M 50 20 C 25 20, 20 60, 20 60 C 20 90, 50 100, 50 100 C 75 100, 80 60, 80 60 C 80 20, 50 20, 50 20 Z M 30 80 L 70 40' },
    { char: '1', name: 'Numeral 1', category: 'numeral', width: 45, svgPath: 'M 35 30 L 50 15 L 50 100 M 30 100 L 70 100' },
    { char: '2', name: 'Numeral 2', category: 'numeral', width: 70, svgPath: 'M 25 40 C 25 20, 75 20, 75 45 C 75 65, 25 85, 25 100 L 80 100' },
    { char: '3', name: 'Numeral 3', category: 'numeral', width: 70, svgPath: 'M 25 25 L 75 25 L 45 55 C 70 55, 80 75, 65 95 C 45 105, 25 90, 25 90' },
    { char: '4', name: 'Numeral 4', category: 'numeral', width: 70, svgPath: 'M 60 15 L 20 65 L 75 65 M 60 15 L 60 100' },
    { char: '5', name: 'Numeral 5', category: 'numeral', width: 70, svgPath: 'M 75 20 L 30 20 L 25 50 C 45 40, 75 45, 75 75 C 75 100, 30 100, 25 85' },
    { char: '6', name: 'Numeral 6', category: 'numeral', width: 70, svgPath: 'M 70 30 C 50 15, 25 35, 25 65 C 25 90, 70 90, 70 65 C 70 45, 30 45, 25 65' },
    { char: '7', name: 'Numeral 7', category: 'numeral', width: 70, svgPath: 'M 20 20 L 80 20 L 40 100' },
    { char: '8', name: 'Numeral 8', category: 'numeral', width: 70, svgPath: 'M 50 15 C 30 15, 30 50, 50 50 C 70 50, 70 15, 50 15 Z M 50 50 C 25 50, 25 100, 50 100 C 75 100, 75 50, 50 50 Z' },
    { char: '9', name: 'Numeral 9', category: 'numeral', width: 70, svgPath: 'M 75 50 C 70 30, 30 30, 30 50 C 30 70, 75 70, 75 50 Z M 75 50 L 55 100' },
    { char: 'I', name: 'Serifed I (cv08)', category: 'numeral', width: 45, svgPath: 'M 25 15 L 75 15 M 50 15 L 50 95 M 25 95 L 75 95' },
    { char: 'V', name: 'Roman Numeral V', category: 'numeral', width: 70, svgPath: 'M 20 15 L 50 95 L 80 15' },
    { char: 'X', name: 'Roman Numeral X', category: 'numeral', width: 70, svgPath: 'M 20 15 L 80 95 M 80 15 L 20 95' },
    { char: '½', name: 'Medical Fraction Half', category: 'numeral', width: 85, svgPath: 'M 20 20 L 35 10 L 35 50 M 75 10 L 25 90 M 45 65 C 45 55, 75 55, 75 70 C 75 80, 45 90, 45 95 L 80 95' },
    { char: '±', name: 'Plus-Minus Medical', category: 'symbol', width: 65, svgPath: 'M 25 35 L 75 35 M 50 10 L 50 60 M 25 80 L 75 80' },
    { char: 'Δ', name: 'Delta Trajectory', category: 'symbol', width: 75, svgPath: 'M 50 15 L 80 95 L 20 95 Z' },
    { char: '→', name: 'Right Arrow Flow', category: 'symbol', width: 80, svgPath: 'M 15 60 L 80 60 M 55 35 L 80 60 L 55 85' },
    { char: '%', name: 'Percent Symbol', category: 'symbol', width: 80, svgPath: 'M 25 30 A 8 8 0 1 1 35 30 M 75 20 L 25 90 M 65 80 A 8 8 0 1 1 75 80' }
  ];

  updateText(event: Event) {
    const input = event.target as HTMLInputElement;
    this.previewText.set(input.value);
  }

  setPreset(text: string) {
    this.previewText.set(text);
  }

  appendChar(char: string) {
    this.previewText.update(text => text + char);
  }

  updateWeight(event: Event) {
    const input = event.target as HTMLInputElement;
    this.weightAxis.set(Number(input.value));
  }

  updateOpticalSize(event: Event) {
    const input = event.target as HTMLInputElement;
    this.opticalSize.set(Number(input.value));
  }

  updateSlant(event: Event) {
    const input = event.target as HTMLInputElement;
    this.slantAxis.set(Number(input.value));
  }

  toggleDelensing() {
    this.opticalDelensing.update(v => !v);
  }

  toggleDisambiguation() {
    this.disambiguation.update(v => !v);
  }

  toggleTabular() {
    this.tabularFigures.update(v => !v);
  }

  getGlyphPath(char: string): string {
    const upper = char.toUpperCase();
    const glyph = this.glyphCatalog.find(g => g.char === char || g.char === upper);
    if (glyph) return glyph.svgPath;
    
    // Procedural Vector Marker Fallback Engine for Universal Unicode Coverage
    const code = char.charCodeAt(0);
    const p1 = (code % 30) + 15;
    const p2 = ((code * 7) % 40) + 45;
    const p3 = ((code * 13) % 40) + 50;
    const curveSeed = code % 5;
    
    switch (curveSeed) {
      case 0:
        return `M 20 ${p1} L ${p2} ${p1} L ${p2 - 10} 95 M 20 ${p2} L ${p3} ${p2}`;
      case 1:
        return `M 25 20 C ${p2} 15, ${p3} ${p1}, 25 60 C ${p1} 90, ${p2} 95, 75 80`;
      case 2:
        return `M ${p1} 15 C 20 ${p2}, 80 ${p2}, ${p2} 95 L 20 95`;
      case 3:
        return `M 20 20 L 80 20 L 50 60 L 50 95 M 35 60 L 65 60`;
      default:
        return `M 20 30 C 50 ${p1}, 50 ${p2}, 80 30 M 50 30 L 50 95 M 25 80 L 75 80`;
    }
  }
}
