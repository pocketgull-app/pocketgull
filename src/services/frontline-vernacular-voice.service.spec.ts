import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  FrontlineVernacularVoiceService,
  VernacularLanguageCode,
  ITriageVoiceContext
} from './frontline-vernacular-voice.service';

describe('FrontlineVernacularVoiceService Unit Suite', () => {
  let service: FrontlineVernacularVoiceService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [FrontlineVernacularVoiceService]
    });
    service = runInInjectionContext(injector, () => injector.get(FrontlineVernacularVoiceService));
  });

  it('1. Initializes with the Top 5 Frontline Languages (EN, ES, HI, SW, AR)', () => {
    expect(service).toBeTruthy();
    const langs = service.languages();
    expect(langs.length).toBe(5);

    const codes = langs.map(l => l.code);
    expect(codes).toContain('en');
    expect(codes).toContain('es');
    expect(codes).toContain('hi');
    expect(codes).toContain('sw');
    expect(codes).toContain('ar');

    expect(service.activeLanguageCode()).toBe('en');
    expect(service.activeLanguage().name).toBe('English');
    expect(service.isSpeaking()).toBe(false);
  });

  it('2. Switches active language and updates text direction appropriately (RTL for Arabic)', () => {
    service.setLanguage('ar');
    expect(service.activeLanguageCode()).toBe('ar');
    expect(service.activeLanguage().direction).toBe('rtl');
    expect(service.activeLanguage().name).toBe('Arabic');

    service.setLanguage('sw');
    expect(service.activeLanguageCode()).toBe('sw');
    expect(service.activeLanguage().direction).toBe('ltr');
    expect(service.activeLanguage().nativeName).toBe('Kiswahili');

    service.setLanguage('hi');
    expect(service.activeLanguageCode()).toBe('hi');
    expect(service.activeLanguage().nativeName).toBe('हिन्दी');
  });

  it('3. Generates localized MUAC Red SAM malnutrition prompt in Swahili and Arabic', () => {
    const ctx: ITriageVoiceContext = {
      module: 'malnutrition_muac',
      muacTier: 'SEVERE_ACUTE_MALNUTRITION',
      muacMm: 110,
      rutfSachets: 3
    };

    // Swahili
    const promptSw = service.generateTriagePrompt(ctx, 'sw');
    expect(promptSw.acuityTier).toBe('RED');
    expect(promptSw.languageCode).toBe('sw');
    expect(promptSw.promptText).toContain('Utapiamlo mkali');
    expect(promptSw.promptText).toContain('Plumpy\'Nut');
    expect(promptSw.promptText).toContain('milimita 110');
    expect(promptSw.direction).toBe('ltr');

    // Arabic (RTL)
    const promptAr = service.generateTriagePrompt(ctx, 'ar');
    expect(promptAr.acuityTier).toBe('RED');
    expect(promptAr.languageCode).toBe('ar');
    expect(promptAr.direction).toBe('rtl');
    expect(promptAr.promptText).toContain('سوء تغذية حاد');
    expect(promptAr.promptText).toContain('بلومبي نت');
  });

  it('4. Generates localized Tachypnea Pneumonia guidance in Hindi and Spanish', () => {
    const ctx: ITriageVoiceContext = {
      module: 'pneumonia_timer',
      pneumoniaClassification: 'PNEUMONIA',
      respiratoryBpm: 54
    };

    // Hindi
    const promptHi = service.generateTriagePrompt(ctx, 'hi');
    expect(promptHi.acuityTier).toBe('YELLOW');
    expect(promptHi.promptText).toContain('अमोक्सिसिलिन');
    expect(promptHi.promptText).toContain('54');

    // Spanish
    const promptEs = service.generateTriagePrompt(ctx, 'es');
    expect(promptEs.acuityTier).toBe('YELLOW');
    expect(promptEs.promptText).toContain('amoxicilina');
    expect(promptEs.promptText).toContain('54 respiraciones por minuto');
  });

  it('5. Generates localized Dehydration Plan B & C guidance with exact rehydration volumes', () => {
    const planBCtx: ITriageVoiceContext = {
      module: 'dehydration_ors',
      dehydrationPlan: 'PLAN_B',
      orsVolumeMl: 750
    };

    const promptEn = service.generateTriagePrompt(planBCtx, 'en');
    expect(promptEn.acuityTier).toBe('YELLOW');
    expect(promptEn.promptText).toContain('750 milliliters of ORS');

    const promptSw = service.generateTriagePrompt(planBCtx, 'sw');
    expect(promptSw.promptText).toContain('mililita 750');
    expect(promptSw.promptText).toContain('ORS');

    const planCCtx: ITriageVoiceContext = {
      module: 'dehydration_ors',
      dehydrationPlan: 'PLAN_C',
      orsVolumeMl: 1000
    };
    const promptAr = service.generateTriagePrompt(planCCtx, 'ar');
    expect(promptAr.acuityTier).toBe('RED');
    expect(promptAr.promptText).toContain('جفاف حاد');
  });

  it('6. Generates localized Danger Red Flags alert across all 5 languages', () => {
    const ctx: ITriageVoiceContext = {
      module: 'danger_signs',
      hasDangerSigns: true
    };

    const langs: VernacularLanguageCode[] = ['en', 'es', 'hi', 'sw', 'ar'];
    for (const lang of langs) {
      const prompt = service.generateTriagePrompt(ctx, lang);
      expect(prompt.acuityTier).toBe('RED');
      expect(prompt.promptText.length).toBeGreaterThan(15);
      expect(prompt.englishMeaning.length).toBeGreaterThan(10);
    }
  });

  it('7. Handles speech synthesis or fallback acoustic attention cue without throwing', async () => {
    // Test speaking prompt text
    await expect(service.speakPrompt('Test guidance text', 'en')).resolves.not.toThrow();

    // Test stop speaking
    expect(() => service.stopSpeaking()).not.toThrow();

    // Test acoustic cue trigger
    expect(() => service.playAcousticAttentionCue(528, 100)).not.toThrow();
  });
});
