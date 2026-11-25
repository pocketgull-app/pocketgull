// SPDX-License-Identifier: Apache-2.0
import { Injectable, inject, computed, effect, signal, untracked } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SocraticMultilingualTranslatorService } from './socratic-multilingual-translator.service';
import { MultilingualEquityService, TargetLanguageCode } from './multilingual-equity.service';
import { FrontlineVernacularVoiceService, VernacularLanguageCode } from './frontline-vernacular-voice.service';
import {
  isExtendedUiCatalogLoaded,
  registerExtendedUiCatalog,
  translateUiKey,
  translateLensLabel as translateLensLabelFromCatalog,
  localizeLensOverview as localizeLensOverviewFromCatalog,
  localizeClinicalReportMarkdown,
} from './ui-i18n-catalog';

const EQUITY_LANG_CODES = new Set<string>(['en', 'es', 'zh', 'hi', 'ar', 'tl', 'fr', 'sw', 'de', 'ja']);
const FRONTLINE_VOICE_CODES = new Set<string>(['en', 'es', 'hi', 'sw', 'ar']);

/**
 * Single authoritative coordinator for application-wide UI localization,
 * `<html lang/dir>` synchronization, and cross-module language state propagation.
 */
@Injectable({
  providedIn: 'root'
})
export class UiI18nService {
  private readonly translator = inject(SocraticMultilingualTranslatorService);
  private readonly equity = inject(MultilingualEquityService, { optional: true });
  private readonly voice = inject(FrontlineVernacularVoiceService, { optional: true });
  private readonly doc = inject(DOCUMENT, { optional: true });

  readonly activeLanguageCode = this.translator.uiLanguageCode;
  readonly activeLanguage = this.translator.activeUiLanguage;
  readonly isRtl = this.translator.isUiRtl;
  readonly explicitSelectionCount = this.translator.explicitSelectionCount;
  readonly activeScriptFontClass = computed<string>(() => this.activeLanguage().fontClass ?? '');
  readonly catalogVersion = signal<number>(isExtendedUiCatalogLoaded() ? 1 : 0);
  private extendedLoadPromise: Promise<void> | null = null;

  constructor() {
    try {
      effect(() => {
        const lang = this.activeLanguage();
        const code = lang.code;
        untracked(() => {
          this.syncDomDocument(code, lang.direction, lang.fontClass);
          if (code !== 'en' && !isExtendedUiCatalogLoaded()) {
            void this.ensureExtendedCatalogLoaded();
          }
          if (this.equity && EQUITY_LANG_CODES.has(code)) {
            if (this.equity.selectedLanguageCode() !== code) {
              this.equity.selectedLanguageCode.set(code as TargetLanguageCode);
            }
          }
          if (this.voice) {
            const targetVoice: VernacularLanguageCode = FRONTLINE_VOICE_CODES.has(code)
              ? (code as VernacularLanguageCode)
              : 'en';
            if (this.voice.activeLanguageCode() !== targetVoice) {
              this.voice.setLanguage(targetVoice);
            }
          }
        });
      });
    } catch {
      // Isolated unit test injectors without an effect scheduler skip reactive sync
    }
  }

  /**
   * Lazily imports and registers the 33-language extended UI translation catalog.
   */
  ensureExtendedCatalogLoaded(): Promise<void> {
    if (isExtendedUiCatalogLoaded()) {
      return Promise.resolve();
    }
    if (!this.extendedLoadPromise) {
      this.extendedLoadPromise = import('./ui-i18n-catalog-extended')
        .then((mod) => {
          registerExtendedUiCatalog(mod.EXTENDED_UI_TRANSLATIONS);
          this.catalogVersion.update((v) => v + 1);
        })
        .catch((err) => {
          this.extendedLoadPromise = null;
          console.error('[UiI18nService] Failed to load extended UI catalog chunk', err);
        });
    }
    return this.extendedLoadPromise;
  }

  /**
   * Switches the entire application UI, script font context, and downstream
   * multilingual services to the requested ISO-639 code.
   */
  setLanguage(code: string): void {
    this.translator.setLanguage(code);
    const lang = this.translator.activeUiLanguage();
    this.syncDomDocument(lang.code, lang.direction, lang.fontClass);
    if (lang.code !== 'en' && !isExtendedUiCatalogLoaded()) {
      void this.ensureExtendedCatalogLoaded();
    }
  }

  /**
   * Translates a UI chrome key synchronously for the active language.
   */
  t(key: string, englishFallback?: string): string {
    this.catalogVersion();
    const code = this.activeLanguageCode();
    return translateUiKey(code, key, englishFallback);
  }

  translateLensLabel(lensLabel: string): string {
    this.catalogVersion();
    return translateLensLabelFromCatalog(this.activeLanguageCode(), lensLabel);
  }

  localizeOverview(paradigm: string, lens: string, defaultOverview: string): string {
    this.catalogVersion();
    return localizeLensOverviewFromCatalog(this.activeLanguageCode(), paradigm, lens, defaultOverview);
  }

  localizeReportMarkdown(markdown: string): string {
    this.catalogVersion();
    return localizeClinicalReportMarkdown(this.activeLanguageCode(), markdown);
  }

  private syncDomDocument(code: string, dir: 'ltr' | 'rtl', fontClass?: string): void {
    const root = this.doc?.documentElement;
    if (!root) return;
    root.lang = code;
    root.dir = dir;
    if (typeof root.setAttribute === 'function') {
      root.setAttribute('lang', code);
      root.setAttribute('dir', dir);
      if (fontClass) {
        root.setAttribute('data-pg-script-font', fontClass);
      } else {
        root.removeAttribute('data-pg-script-font');
      }
    }
  }
}
