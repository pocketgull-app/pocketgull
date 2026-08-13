import '@angular/compiler';
import { describe, it, beforeEach, expect } from 'vitest';
import { MultilingualEquityService } from './multilingual-equity.service';

describe('MultilingualEquityService Unit Suite', () => {
  let service: MultilingualEquityService;

  beforeEach(() => {
    service = new MultilingualEquityService();
  });

  it('1. Initializes supported global health equity languages', () => {
    const list = service.supportedLanguages();
    expect(list.length).toBeGreaterThanOrEqual(10);

    const es = list.find(l => l.code === 'es');
    expect(es).toBeDefined();
    expect(es?.name).toBe('Spanish');
  });

  it('2. Translates clinical text into target language plain-language format', () => {
    const res = service.translateClinicalCarePlan('Monitor blood pressure daily', 'es');
    expect(res.targetLanguage.code).toBe('es');
    expect(res.translatedText).toContain('Resumen en Español');
    expect(res.readingGradeLevel).toContain('6th Grade');
  });
});
