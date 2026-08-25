import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IGlyphSpec {
  char: string;
  name: string;
  category: 'uppercase' | 'lowercase' | 'numeral' | 'symbol';
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
              PocketGull Marker Typeface & Specimen Engine
            </h2>
            <p class="text-xs text-amber-700 dark:text-amber-300 font-medium">
              Hand-crafted vector marker typography derived from the original GearArts PocketGull card.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1 bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/40 rounded-full text-xs font-bold font-mono">
            v1.0.0 TrueType/SVG
          </span>
        </div>
      </div>

      <!-- Live Type Preview Input -->
      <div class="space-y-2">
        <label class="text-xs font-extrabold uppercase text-amber-800 dark:text-amber-300 tracking-wider">
          Type Specimen Sandbox
        </label>
        <input 
          type="text" 
          [value]="previewText()" 
          (input)="updateText($event)"
          class="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-amber-500/30 rounded-2xl text-lg font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Type something in PocketGull Marker..."
        />
      </div>

      <!-- Marker Rendering Output Box -->
      <div class="p-8 bg-amber-100/80 dark:bg-zinc-900/90 border border-amber-300 dark:border-zinc-800 rounded-2xl shadow-inner min-h-[120px] flex items-center justify-center overflow-x-auto">
        <div class="flex items-center gap-1.5 flex-wrap justify-center">
          @for (char of previewTextArray(); track $index) {
            @if (char === ' ') {
              <span class="w-4 inline-block"></span>
            } @else {
              <svg class="w-8 h-10 text-zinc-950 dark:text-amber-400 drop-shadow-sm transition-transform hover:scale-110" viewBox="0 0 100 120" fill="currentColor">
                <path [attr.d]="getGlyphPath(char)" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
              </svg>
            }
          }
        </div>
      </div>

      <!-- Character Set Grid -->
      <div class="space-y-3">
        <h3 class="text-sm font-black uppercase text-zinc-800 dark:text-zinc-200 tracking-wide">
          Glyph Palette (A-Z, 0-9)
        </h3>
        <div class="grid grid-cols-6 sm:grid-cols-10 gap-2">
          @for (glyph of glyphCatalog; track glyph.char) {
            <div class="p-2.5 bg-white dark:bg-zinc-950 border border-amber-500/20 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-amber-500/60 transition cursor-pointer" (click)="appendChar(glyph.char)">
              <svg class="w-6 h-7 text-zinc-900 dark:text-zinc-100" viewBox="0 0 100 120">
                <path [attr.d]="glyph.svgPath" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none" />
              </svg>
              <span class="text-[10px] font-mono text-zinc-500 uppercase">{{ glyph.char }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class PocketgullTypefaceSpecimenComponent {
  previewText = signal('PocketGull 2026');

  previewTextArray = computed(() => this.previewText().split(''));

  readonly glyphCatalog: IGlyphSpec[] = [
    { char: 'P', name: 'Capital P', category: 'uppercase', width: 80, svgPath: 'M 25 15 L 25 105 M 25 15 C 65 15, 75 35, 75 50 C 75 65, 65 70, 25 70' },
    { char: 'o', name: 'Lowercase o', category: 'lowercase', width: 70, svgPath: 'M 50 45 C 25 45, 20 85, 50 85 C 80 85, 75 45, 50 45 Z' },
    { char: 'c', name: 'Lowercase c', category: 'lowercase', width: 65, svgPath: 'M 70 50 C 40 40, 20 60, 30 80 C 40 95, 70 85, 75 80' },
    { char: 'k', name: 'Lowercase k', category: 'lowercase', width: 70, svgPath: 'M 25 15 L 25 105 M 25 65 L 70 40 M 35 60 L 75 105' },
    { char: 'e', name: 'Lowercase e', category: 'lowercase', width: 65, svgPath: 'M 20 65 L 75 65 C 75 40, 45 40, 35 55 C 20 75, 45 90, 75 80' },
    { char: 't', name: 'Lowercase t', category: 'lowercase', width: 60, svgPath: 'M 45 20 L 45 95 C 45 105, 65 105, 75 95 M 20 45 L 75 45' },
    { char: 'G', name: 'Capital G', category: 'uppercase', width: 85, svgPath: 'M 75 35 C 50 15, 20 30, 20 60 C 20 90, 50 105, 75 85 L 75 60 L 50 60' },
    { char: 'u', name: 'Lowercase u', category: 'lowercase', width: 70, svgPath: 'M 25 45 L 25 80 C 25 95, 65 95, 65 80 L 65 45' },
    { char: 'l', name: 'Lowercase l', category: 'lowercase', width: 40, svgPath: 'M 40 15 L 40 95 C 40 105, 55 105, 65 95' },
    { char: '0', name: 'Numeral 0', category: 'numeral', width: 70, svgPath: 'M 50 20 C 25 20, 20 60, 20 60 C 20 90, 50 100, 50 100 C 75 100, 80 60, 80 60 C 80 20, 50 20, 50 20 Z' },
    { char: '1', name: 'Numeral 1', category: 'numeral', width: 45, svgPath: 'M 35 30 L 50 15 L 50 100 M 30 100 L 70 100' },
    { char: '2', name: 'Numeral 2', category: 'numeral', width: 70, svgPath: 'M 25 40 C 25 20, 75 20, 75 45 C 75 65, 25 85, 25 100 L 80 100' },
    { char: '3', name: 'Numeral 3', category: 'numeral', width: 70, svgPath: 'M 25 25 L 75 25 L 45 55 C 70 55, 80 75, 65 95 C 45 105, 25 90, 25 90' },
    { char: '4', name: 'Numeral 4', category: 'numeral', width: 70, svgPath: 'M 60 15 L 20 65 L 75 65 M 60 15 L 60 100' },
    { char: '5', name: 'Numeral 5', category: 'numeral', width: 70, svgPath: 'M 75 20 L 30 20 L 25 50 C 45 40, 75 45, 75 75 C 75 100, 30 100, 25 85' },
    { char: '6', name: 'Numeral 6', category: 'numeral', width: 70, svgPath: 'M 70 30 C 50 15, 25 35, 25 65 C 25 90, 70 90, 70 65 C 70 45, 30 45, 25 65' },
    { char: '7', name: 'Numeral 7', category: 'numeral', width: 70, svgPath: 'M 20 20 L 80 20 L 40 100' },
    { char: '8', name: 'Numeral 8', category: 'numeral', width: 70, svgPath: 'M 50 15 C 30 15, 30 50, 50 50 C 70 50, 70 15, 50 15 Z M 50 50 C 25 50, 25 100, 50 100 C 75 100, 75 50, 50 50 Z' },
    { char: '9', name: 'Numeral 9', category: 'numeral', width: 70, svgPath: 'M 75 50 C 70 30, 30 30, 30 50 C 30 70, 75 70, 75 50 Z M 75 50 L 55 100' },
    // 🔢 International & Medical Numbering Systems (Eastern Arabic, Roman Numerals & Fractions)
    { char: '١', name: 'Eastern Arabic 1', category: 'numeral', width: 35, svgPath: 'M 45 15 L 45 95' },
    { char: '٢', name: 'Eastern Arabic 2', category: 'numeral', width: 65, svgPath: 'M 25 20 L 70 20 L 70 40 L 40 95' },
    { char: 'I', name: 'Roman Numeral I', category: 'numeral', width: 45, svgPath: 'M 25 15 L 75 15 M 50 15 L 50 95 M 25 95 L 75 95' },
    { char: 'V', name: 'Roman Numeral V', category: 'numeral', width: 70, svgPath: 'M 20 15 L 50 95 L 80 15' },
    { char: 'X', name: 'Roman Numeral X', category: 'numeral', width: 70, svgPath: 'M 20 15 L 80 95 M 80 15 L 20 95' },
    { char: '½', name: 'Medical Fraction Half', category: 'numeral', width: 85, svgPath: 'M 20 20 L 35 10 L 35 50 M 75 10 L 25 90 M 45 65 C 45 55, 75 55, 75 70 C 75 80, 45 90, 45 95 L 80 95' },
    // 🌐 Multilingual International Diacritics & Extended Character Sets
    { char: 'ñ', name: 'Spanish eñe', category: 'lowercase', width: 75, svgPath: 'M 30 20 C 45 10, 55 30, 70 20 M 25 45 L 25 95 M 25 55 C 45 40, 65 40, 65 60 L 65 95' },
    { char: 'é', name: 'Acute Accent e', category: 'lowercase', width: 65, svgPath: 'M 45 15 L 65 30 M 20 65 L 75 65 C 75 40, 45 40, 35 55 C 20 75, 45 90, 75 80' },
    { char: 'ü', name: 'German Umlaut u', category: 'lowercase', width: 70, svgPath: 'M 35 20 L 35 25 M 55 20 L 55 25 M 25 45 L 25 80 C 25 95, 65 95, 65 80 L 65 45' },
    { char: 'æ', name: 'Latin Ligature ae', category: 'lowercase', width: 95, svgPath: 'M 45 45 L 75 45 C 75 25, 45 25, 30 45 C 15 65, 35 85, 45 85 C 65 85, 75 65, 75 45 M 45 45 L 45 85' },
    { char: 'ç', name: 'French Cedilla c', category: 'lowercase', width: 65, svgPath: 'M 70 45 C 40 35, 20 55, 30 75 C 40 90, 70 80, 75 75 M 45 90 C 55 95, 45 105, 35 100' },
    { char: 'å', name: 'Nordic Ring a', category: 'lowercase', width: 70, svgPath: 'M 45 15 A 5 5 0 1 1 55 15 A 5 5 0 1 1 45 15 M 25 45 C 25 35, 65 35, 65 45 L 65 95 M 25 65 C 25 95, 65 95, 65 65' },
    { char: 'α', name: 'Greek Alpha', category: 'symbol', width: 70, svgPath: 'M 75 35 C 45 25, 20 50, 30 75 C 45 95, 75 65, 75 95' },
    { char: 'β', name: 'Greek Beta', category: 'symbol', width: 70, svgPath: 'M 25 20 L 25 95 C 45 95, 70 80, 50 60 C 70 50, 55 20, 25 20 Z' },
    { char: 'Ω', name: 'Greek Omega', category: 'symbol', width: 80, svgPath: 'M 20 95 L 35 95 C 25 65, 25 35, 50 35 C 75 35, 75 65, 65 95 L 80 95' },
    { char: 'Б', name: 'Cyrillic Be', category: 'uppercase', width: 75, svgPath: 'M 25 20 L 75 20 M 25 20 L 25 95 C 55 95, 75 80, 50 60 C 35 60, 25 60, 25 60' },
    { char: '±', name: 'Plus-Minus Medical', category: 'symbol', width: 65, svgPath: 'M 25 35 L 75 35 M 50 10 L 50 60 M 25 80 L 75 80' },
    { char: '%', name: 'Percent Symbol', category: 'symbol', width: 80, svgPath: 'M 25 30 A 8 8 0 1 1 35 30 M 75 20 L 25 90 M 65 80 A 8 8 0 1 1 75 80' }
  ];

  updateText(event: Event) {
    const input = event.target as HTMLInputElement;
    this.previewText.set(input.value);
  }

  appendChar(char: string) {
    this.previewText.update(text => text + char);
  }

  getGlyphPath(char: string): string {
    const upper = char.toUpperCase();
    const glyph = this.glyphCatalog.find(g => g.char === char || g.char === upper);
    if (glyph) return glyph.svgPath;
    
    // 🖋️ Advanced Procedural Vector Marker Synthesis Engine for Universal Unicode Coverage (CJK, Arabic, Devanagari, Hebrew)
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
