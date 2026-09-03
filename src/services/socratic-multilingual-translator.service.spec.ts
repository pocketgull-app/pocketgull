import '@angular/compiler';
import { SocraticMultilingualTranslatorService, GLOBAL_50_LANGUAGES } from './socratic-multilingual-translator.service';

describe('SocraticMultilingualTranslatorService Unit Suite', () => {
  let service: SocraticMultilingualTranslatorService;

  beforeEach(() => {
    service = new SocraticMultilingualTranslatorService();
  });

  it('1. Initializes with over 50 supported global languages and indigenous dialects', () => {
    expect(service.supportedLanguages().length).toBeGreaterThanOrEqual(50);
    expect(GLOBAL_50_LANGUAGES.some(l => l.code === 'nv')).toBe(true); // Navajo
    expect(GLOBAL_50_LANGUAGES.some(l => l.code === 'qu')).toBe(true); // Quechua
    expect(GLOBAL_50_LANGUAGES.some(l => l.code === 'ar')).toBe(true); // Arabic
    expect(GLOBAL_50_LANGUAGES.some(l => l.code === 'sw')).toBe(true); // Swahili
  });

  it('2. Detects RTL direction accurately for Arabic, Hebrew, Urdu, and Persian', () => {
    service.setLanguage('ar');
    expect(service.isRtl()).toBe(true);

    service.setLanguage('he');
    expect(service.isRtl()).toBe(true);

    service.setLanguage('ur');
    expect(service.isRtl()).toBe(true);

    service.setLanguage('es');
    expect(service.isRtl()).toBe(false);
  });

  it('3. Crosswalks clinical jargon into Socratic plain language terms', () => {
    const rawClinical = 'Patient presents with severe dyspnea and tachycardia secondary to hypertension.';
    const result = service.translateClinicalContent(rawClinical, 'es');

    expect(result.simplifiedSourceText).toContain('shortness of breath');
    expect(result.simplifiedSourceText).toContain('rapid heart rate');
    expect(result.simplifiedSourceText).toContain('high blood pressure');
    expect(result.medicalTermsCrosswalk.length).toBe(3);
    expect(result.culturalNote).toContain('formal address');
  });

  it('4. Correctly translates into Indigenous American Diné Bizaad (Navajo) with Hózhǫ́ ethos', () => {
    const result = service.translateClinicalContent('Take daily walks to improve blood sugar.', 'nv');
    expect(result.targetLanguage.code).toBe('nv');
    expect(result.targetLanguage.name).toBe('Navajo');
    expect(result.translatedText).toContain('Yá’át’ééh');
    expect(result.culturalNote).toContain('Hózhǫ́');
  });

  it('5. Executes translateWithAi with graceful fallback if offline/mock', async () => {
    const result = await service.translateWithAi('Check blood glucose daily.', 'sw');
    expect(result).toBeTruthy();
    expect(result.targetLanguage.code).toBe('sw');
    expect(result.translatedText).toContain('Kiswahili');
  });

  it('6. Resolves regional diglossia/vernacular speech into canonical SNOMED-CT ontology', () => {
    // Arabic Ammiya
    const arabicRes = service.resolveDialectalToCanonicalOntology('قلبي واجعني أوي', 'ar-EG');
    expect(arabicRes.canonicalSnomedCode).toBe('29857009'); // Chest pain
    expect(arabicRes.formalClinicalEhrNote).toContain('SNOMED-CT: 29857009');
    expect(arabicRes.bidiDirection).toBe('rtl');

    // Cantonese Yue
    const cantoneseRes = service.resolveDialectalToCanonicalOntology('心口好痛，有啲喘唔到氣', 'zh-yue');
    expect(cantoneseRes.canonicalSnomedCode).toBe('29857009');
    expect(cantoneseRes.formalClinicalEhrNote).toContain('12-lead ECG underway');
    expect(cantoneseRes.bidiDirection).toBe('ltr');
  });
});

