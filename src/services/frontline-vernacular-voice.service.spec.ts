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

  it('8. Generates localized Wong-Baker FACES pain prompts across scores and languages', () => {
    // Score 0 English
    expect(service.getAacFacePrompt(0, 'en')).toContain('no pain');
    // Score 10 Spanish
    expect(service.getAacFacePrompt(10, 'es')).toContain('peor dolor posible');
    // Score 6 Hindi
    expect(service.getAacFacePrompt(6, 'hi')).toContain('दर्द');
    // Score 8 Swahili
    expect(service.getAacFacePrompt(8, 'sw')).toContain('dawa ya maumivu');
    // Score 10 Arabic
    expect(service.getAacFacePrompt(10, 'ar')).toContain('أشد ألم');
  });

  it('9. Generates localized Bedside AAC Need Tile prompts', () => {
    // WATER in Arabic
    expect(service.getAacTilePrompt('WATER', 'ar')).toContain('الماء');
    // PAIN in Spanish
    expect(service.getAacTilePrompt('PAIN', 'es')).toContain('medicamento');
    // COLD in Hindi
    expect(service.getAacTilePrompt('COLD', 'hi')).toContain('कंबल');
    // FAMILY in Swahili
    expect(service.getAacTilePrompt('FAMILY', 'sw')).toContain('familia');
    // Fallback for unknown tile
    expect(service.getAacTilePrompt('UNKNOWN_TILE')).toBe('Assistance requested.');
  });

  it('10. Generates localized Artemether + Lumefantrine (Coartem) dosing prompts across all 5 languages', () => {
    const ctx: ITriageVoiceContext = {
      module: 'pediatric_dosing',
      pediatricMedication: 'artemether_lumefantrine',
      childWeightKg: 12.0,
      tabletsPerDose: 1,
      totalTablets: 6,
      isEligible: true
    };

    // English
    const promptEn = service.generateTriagePrompt(ctx, 'en');
    expect(promptEn.acuityTier).toBe('YELLOW');
    expect(promptEn.headline).toContain('MALARIA ACT: Coartem');
    expect(promptEn.promptText).toContain('Give 1 dispersible tablet(s) of Coartem');
    expect(promptEn.promptText).toContain('fatty food');

    // Spanish
    const promptEs = service.generateTriagePrompt(ctx, 'es');
    expect(promptEs.headline).toContain('MALARIA ACT: Coartem');
    expect(promptEs.promptText).toContain('1 tableta(s) dispersable(s) de Coartem');
    expect(promptEs.promptText).toContain('comida con grasa');

    // Hindi
    const promptHi = service.generateTriagePrompt(ctx, 'hi');
    expect(promptHi.headline).toContain('मलेरिया ACT: कोआर्टेम');
    expect(promptHi.promptText).toContain('कोआर्टेम की 1 घुलनशील गोली');
    expect(promptHi.promptText).toContain('दूध या वसायुक्त भोजन');

    // Swahili
    const promptSw = service.generateTriagePrompt(ctx, 'sw');
    expect(promptSw.headline).toContain('MALARIA ACT: Coartem');
    expect(promptSw.promptText).toContain('tembe 1');
    expect(promptSw.promptText).toContain('chakula');

    // Arabic
    const promptAr = service.generateTriagePrompt(ctx, 'ar');
    expect(promptAr.headline).toContain('علاج الملاريا: كوارتم');
    expect(promptAr.direction).toBe('rtl');
    expect(promptAr.promptText).toContain('كوارتم');
    expect(promptAr.promptText).toContain('الحليب أو وجبة دسمة');
  });

  it('11. Generates RED Alert for Under-5kg infant ineligible for Coartem with urgent referral prompt', () => {
    const ctx: ITriageVoiceContext = {
      module: 'pediatric_dosing',
      pediatricMedication: 'artemether_lumefantrine',
      childWeightKg: 4.2,
      isEligible: false
    };

    const promptEn = service.generateTriagePrompt(ctx, 'en');
    expect(promptEn.acuityTier).toBe('RED');
    expect(promptEn.headline).toContain('Coartem Ineligible (<5 kg)');
    expect(promptEn.promptText).toContain('under five kilograms');

    const promptSw = service.generateTriagePrompt(ctx, 'sw');
    expect(promptSw.acuityTier).toBe('RED');
    expect(promptSw.promptText).toContain('chini ya kilo tano');
    expect(promptSw.promptText).toContain('Coartem haishauriwi');
  });

  it('12. Generates WHO Reduced Osmolarity ORS Plan B & C rehydration volume instructions', () => {
    const ctxPlanB: ITriageVoiceContext = {
      module: 'pediatric_dosing',
      pediatricMedication: 'ors_rehydration',
      dehydrationPlan: 'PLAN_B',
      childWeightKg: 10.0,
      orsVolumeMl: 750
    };

    const promptAr = service.generateTriagePrompt(ctxPlanB, 'ar');
    expect(promptAr.direction).toBe('rtl');
    expect(promptAr.headline).toContain('محلول الإرواء: الخطة ب');
    expect(promptAr.promptText).toContain('750 مليلتر');
    expect(promptAr.promptText).toContain('الساعات الأربع');

    const promptSw = service.generateTriagePrompt(ctxPlanB, 'sw');
    expect(promptSw.headline).toContain('SULUHISHO LA ORS');
    expect(promptSw.promptText).toContain('mililita 750');
    expect(promptSw.promptText).toContain('masaa manne');
  });

  it('13. Generates Zinc Sulfate 14-day completion and Amoxicillin fast-breathing guidance', () => {
    // Zinc under 6 months (10mg half tablet)
    const ctxZincInfant: ITriageVoiceContext = {
      module: 'pediatric_dosing',
      pediatricMedication: 'zinc_sulfate',
      childAgeMonths: 4,
      doseMg: 10,
      totalTablets: 7
    };
    const zincPrompt = service.generateTriagePrompt(ctxZincInfant, 'en');
    expect(zincPrompt.acuityTier).toBe('GREEN');
    expect(zincPrompt.promptText).toContain('half a tablet of Zinc');
    expect(zincPrompt.promptText).toContain('10 milligrams');
    expect(zincPrompt.promptText).toContain('fourteen full days');

    // Zinc over 6 months (20mg full tablet) in Spanish
    const ctxZincChild: ITriageVoiceContext = {
      module: 'pediatric_dosing',
      pediatricMedication: 'zinc_sulfate',
      childAgeMonths: 18,
      doseMg: 20,
      totalTablets: 14
    };
    const zincPromptEs = service.generateTriagePrompt(ctxZincChild, 'es');
    expect(zincPromptEs.promptText).toContain('una tableta entera');
    expect(zincPromptEs.promptText).toContain('catorce días completos');

    // Amoxicillin in Hindi
    const ctxAmox: ITriageVoiceContext = {
      module: 'pediatric_dosing',
      pediatricMedication: 'amoxicillin_dispersible',
      tabletsPerDose: 2,
      doseMg: 500,
      totalTablets: 20
    };
    const amoxPromptHi = service.generateTriagePrompt(ctxAmox, 'hi');
    expect(amoxPromptHi.acuityTier).toBe('YELLOW');
    expect(amoxPromptHi.promptText).toContain('अमोक्सिसिलिन');
    expect(amoxPromptHi.promptText).toContain('2 घुलनशील गोली');
    expect(amoxPromptHi.promptText).toContain('500 मिलीग्राम');
  });
});

