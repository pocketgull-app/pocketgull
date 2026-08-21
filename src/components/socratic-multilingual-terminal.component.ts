import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocraticMultilingualTranslatorService, ILanguageSpec } from '../services/socratic-multilingual-translator.service';

@Component({
  selector: 'app-socratic-multilingual-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-card-dark rounded-3xl p-6 sm:p-8 border-2 border-teal-500/40 shadow-2xl relative overflow-hidden space-y-6">
      <div class="rams-grill"><div></div><div></div><div></div><div></div></div>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold">
            <span>🌐 Universal Health Equity • 50+ Global Dialects</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white">
            Universal Socratic Multilingual Terminal
          </h2>
          <p class="text-xs sm:text-sm text-stone-300">
            Real-time multi-lingual Socratic tooltips, phonetic speech cues, and cultural health crosswalks.
          </p>
        </div>

        <!-- Active Region & RTL Indicator -->
        <div class="flex items-center gap-2 font-mono text-xs">
          <span class="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300">
            {{ activeLang().region }}
          </span>
          <span 
            class="px-3 py-1.5 rounded-xl font-bold border"
            [ngClass]="{
              'bg-amber-500/20 text-amber-300 border-amber-500/40': translator.isRtl(),
              'bg-teal-500/20 text-teal-300 border-teal-500/40': !translator.isRtl()
            }"
          >
            {{ translator.isRtl() ? 'RTL Layout' : 'LTR Layout' }}
          </span>
        </div>
      </div>

      <!-- Region Filter Tabs -->
      <div class="flex flex-wrap items-center gap-2 font-mono text-xs">
        @for (reg of regions; track reg) {
          <button 
            (click)="selectedRegion.set(reg)"
            class="px-3 py-1 rounded-lg border transition font-bold cursor-pointer"
            [ngClass]="{
              'bg-teal-500 text-stone-950 border-teal-400': selectedRegion() === reg,
              'bg-stone-900/80 text-stone-400 border-stone-800 hover:border-stone-700': selectedRegion() !== reg
            }"
          >
            {{ reg.replace(/_/g, ' ') }}
          </button>
        }
      </div>

      <!-- 50-Language Dialect Selector Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto p-2 bg-stone-950/80 rounded-2xl border border-stone-800">
        @for (lang of filteredLanguages(); track lang.code) {
          <button 
            (click)="selectLanguage(lang.code)"
            class="p-2 rounded-xl text-left border transition flex items-center gap-2 cursor-pointer"
            [ngClass]="{
              'bg-teal-950/80 border-teal-500 text-teal-200 shadow-md': activeCode() === lang.code,
              'bg-stone-900/60 border-stone-800/80 text-stone-400 hover:bg-stone-800 hover:text-white': activeCode() !== lang.code
            }"
          >
            <span class="text-base">{{ lang.flagEmoji }}</span>
            <div class="overflow-hidden">
              <div class="text-xs font-bold truncate text-white">{{ lang.name }}</div>
              <div class="text-[10px] opacity-70 truncate font-mono">{{ lang.nativeName }}</div>
            </div>
          </button>
        }
      </div>

      <!-- Clinical Text Input & Socratic Translation Workspace -->
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-mono text-stone-400 mb-1">
            Clinical Directive / Care Plan Text (Try terms like "dyspnea", "hypertension", "tachycardia")
          </label>
          <textarea 
            [(ngModel)]="inputText"
            rows="2"
            class="w-full bg-stone-900 border border-stone-800 rounded-2xl p-3.5 text-xs text-white focus:border-teal-500 focus:outline-hidden font-mono"
            placeholder="Enter clinical notes to translate..."
          ></textarea>
        </div>

        <!-- Translated Output Frame with Bidirectional Direction Support -->
        <div 
          class="p-5 rounded-2xl bg-stone-900/90 border border-teal-500/30 space-y-4 shadow-xl"
          [dir]="translation().textDirection"
        >
          <div class="flex items-center justify-between border-b border-white/10 pb-3 font-mono text-xs">
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ activeLang().flagEmoji }}</span>
              <strong class="text-white">{{ activeLang().name }} ({{ activeLang().nativeName }})</strong>
            </div>
            <span class="text-teal-400 text-[11px]">{{ translation().readingGradeLevel }}</span>
          </div>

          <div class="text-sm leading-relaxed text-stone-100 font-sans">
            {{ translation().translatedText }}
          </div>

          <!-- Phonetic Speech Cue -->
          <div class="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-amber-300 flex items-center gap-2">
            <span>🗣️</span>
            <span>{{ translation().phoneticPronunciation }}</span>
          </div>

          <!-- Socratic Jargon Simplifier Crosswalk Badges -->
          @if (translation().medicalTermsCrosswalk.length > 0) {
            <div class="space-y-2 pt-2 border-t border-white/10">
              <div class="text-[11px] font-mono text-stone-400 font-bold uppercase">
                Socratic Jargon Crosswalk ({{ translation().medicalTermsCrosswalk.length }} simplified)
              </div>
              <div class="flex flex-wrap gap-2">
                @for (cw of translation().medicalTermsCrosswalk; track cw.clinicalTerm) {
                  <div class="px-2.5 py-1 rounded-lg bg-stone-950 border border-teal-500/30 font-mono text-[11px] text-stone-200">
                    <span class="text-rose-400 line-through mr-1">{{ cw.clinicalTerm }}</span>
                    <span class="text-teal-300 font-bold">→ {{ cw.plainLanguageTerm }}</span>
                    <span class="text-stone-500 text-[10px] ml-1">{{ cw.phonetic }}</span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Cultural Nuance Context Note -->
          <div class="p-3 rounded-xl bg-teal-950/40 border border-teal-500/20 text-xs font-mono text-teal-200 space-y-1">
            <div class="font-bold">🌿 Cultural Communication Context:</div>
            <div class="text-stone-300 text-[11px]">{{ translation().culturalNote }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SocraticMultilingualTerminalComponent {
  public translator = inject(SocraticMultilingualTranslatorService);

  readonly regions = ['ALL', 'GLOBAL', 'INDIC', 'AFRICAN', 'SOUTHEAST_ASIAN', 'INDIGENOUS_AMERICAN', 'EUROPEAN'] as const;
  readonly selectedRegion = signal<string>('ALL');

  readonly inputText = signal<string>(
    'Patient presents with severe dyspnea and tachycardia secondary to hypertension. Initiate daily 20-minute walking.'
  );

  readonly activeLang = this.translator.activeLanguage;
  readonly activeCode = this.translator.selectedLanguageCode;

  readonly filteredLanguages = computed<ILanguageSpec[]>(() => {
    const reg = this.selectedRegion();
    if (reg === 'ALL') {
      return this.translator.supportedLanguages();
    }
    return this.translator.supportedLanguages().filter((l) => l.region === reg);
  });

  readonly translation = computed(() => {
    return this.translator.translateClinicalContent(this.inputText(), this.activeCode());
  });

  selectLanguage(code: string): void {
    this.translator.setLanguage(code);
  }
}
