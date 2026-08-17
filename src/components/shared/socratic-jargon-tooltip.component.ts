import { Component, ChangeDetectionStrategy, input, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocraticJargonDictionaryService, IJargonDefinition } from '../../services/socratic-jargon-dictionary.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-socratic-jargon-tooltip',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center relative group cursor-help">
      <span class="underline decoration-dotted decoration-indigo-400 dark:decoration-indigo-500 font-semibold hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">
        <ng-content></ng-content>
      </span>
      <span class="ml-1 text-[10px] opacity-70 group-hover:opacity-100 transition-opacity">💡</span>

      <!-- Interactive Micro-Tooltip Popover -->
      @if (def(); as d) {
        <div class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50 w-72 p-3 bg-zinc-900 text-white rounded-xl shadow-2xl border border-zinc-700/80 text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-zinc-700/60">
            <span class="text-xs font-bold text-indigo-300 uppercase tracking-wider">{{ d.term }} ({{ d.shortLabel }})</span>
            <span class="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono uppercase">{{ d.category }}</span>
          </div>

          <!-- Plain English vs Technical breakdown based on audience mode -->
          <p class="text-xs text-zinc-200 leading-relaxed mb-2">
            @if (isPlainLanguage()) {
              {{ d.plainEnglishDefinition }}
            } @else {
              {{ d.technicalDetails }}
            }
          </p>

          <div class="text-[10px] bg-indigo-950/80 text-indigo-200 p-2 rounded-lg border border-indigo-500/30">
            💡 <strong>Actionable Tip:</strong> {{ d.actionableAdvice }}
          </div>

          <!-- Tooltip Triangle Arrow -->
          <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-900"></div>
        </div>
      }
    </span>
  `
})
export class SocraticJargonTooltipComponent {
  term = input<string>('');
  dictionary = inject(SocraticJargonDictionaryService);
  themeService = inject(ThemeService);

  isPlainLanguage = computed(() => this.themeService.isPlainLanguageMode());

  def = computed<IJargonDefinition | null>(() => {
    const t = this.term();
    return this.dictionary.getDefinition(t);
  });
}
