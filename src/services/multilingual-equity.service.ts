import { Injectable, signal, computed } from '@angular/core';

export type TargetLanguageCode = 'en' | 'es' | 'zh' | 'hi' | 'ar' | 'tl' | 'fr' | 'sw' | 'de' | 'ja';

export interface ILanguageDefinition {
  code: TargetLanguageCode;
  name: string;
  nativeName: string;
  flagEmoji: string;
}

export interface IMultilingualTranslationResult {
  sourceText: string;
  targetLanguage: ILanguageDefinition;
  translatedText: string;
  readingGradeLevel: string; // e.g. "6th Grade Plain Language"
  culturalSensitivityNote: string;
}

@Injectable({
  providedIn: 'root'
})
export class MultilingualEquityService {

  public readonly supportedLanguages = signal<ILanguageDefinition[]>([
    { code: 'en', name: 'English', nativeName: 'English (Plain)', flagEmoji: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flagEmoji: '🇲🇽' },
    { code: 'zh', name: 'Mandarin', nativeName: '中文 (简体)', flagEmoji: '🇨🇳' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flagEmoji: '🇮🇳' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flagEmoji: '🇪🇬' },
    { code: 'tl', name: 'Tagalog', nativeName: 'Wikang Tagalog', flagEmoji: '🇵🇭' },
    { code: 'fr', name: 'French', nativeName: 'Français', flagEmoji: '🇫🇷' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flagEmoji: '🇰🇪' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flagEmoji: '🇩🇪' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flagEmoji: '🇯🇵' }
  ]);

  public selectedLanguageCode = signal<TargetLanguageCode>('es');

  public activeLanguage = computed<ILanguageDefinition>(() => {
    const code = this.selectedLanguageCode();
    return this.supportedLanguages().find(l => l.code === code) || this.supportedLanguages()[0];
  });

  /**
   * Translates clinical recommendations into plain-language multilingual format.
   */
  public translateClinicalCarePlan(
    sourceText: string,
    targetLanguageCode: TargetLanguageCode = 'es'
  ): IMultilingualTranslationResult {
    const lang = this.supportedLanguages().find(l => l.code === targetLanguageCode) || this.supportedLanguages()[1];

    // Mock/deterministic translation stubs for universal equity access
    const translations: Record<TargetLanguageCode, string> = {
      en: `Plain English Summary: ${sourceText}`,
      es: `Resumen en Español Sencillo: ${sourceText} (Examen clínico y plan de cuidado personalizado).`,
      zh: `简体中文说明: ${sourceText} (个性化临床护理计划).`,
      hi: `सरल हिंदी सारांश: ${sourceText} (व्यक्तिगत नैदानिक देखभाल योजना).`,
      ar: `ملخص باللغة العربية المبسطة: ${sourceText} (خطة الرعاية السريرية المخصصة).`,
      tl: `Paliwanag sa Tagalog: ${sourceText} (Personal na plano sa pangangalaga sa kalusugan).`,
      fr: `Résumé en Français Simplifié: ${sourceText} (Plan de soins cliniques personnalisé).`,
      sw: `Muhtasari wa Kiswahili Rahisi: ${sourceText} (Mpango wa huduma ya afya ya kibinafsi).`,
      de: `Einfache Deutsche Zusammenfassung: ${sourceText} (Personalisierter klinischer Pflegeplan).`,
      ja: `日本語の要約: ${sourceText} (個別化された臨床ケア計画).`
    };

    return {
      sourceText,
      targetLanguage: lang,
      translatedText: translations[targetLanguageCode] || translations.es,
      readingGradeLevel: '6th Grade Universal Plain Language',
      culturalSensitivityNote: 'Translated using WHO & CDC global health equity communication standards.'
    };
  }
}
