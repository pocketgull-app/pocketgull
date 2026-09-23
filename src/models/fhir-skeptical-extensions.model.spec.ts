import { describe, it, expect } from 'vitest';
import {
  WHO_ICD11_TM1_CATALOG,
  buildFhirTm1DualCodingExtension
} from './fhir-skeptical-extensions.model';

describe('WHO ICD-11 Chapter 26 (TM1) Dual-Coding Suite', () => {
  it('1. Provides standardized WHO TM1 codes for key TCM patterns', () => {
    const liverYang = WHO_ICD11_TM1_CATALOG['LIVER_YANG_RISING'];
    expect(liverYang).toBeDefined();
    expect(liverYang.code).toBe('SF50');
    expect(liverYang.traditionalParadigm).toBe('TCM');
    expect(liverYang.correspondingWesternIcd10.code).toBe('I10');

    const liverQi = WHO_ICD11_TM1_CATALOG['LIVER_QI_STAGNATION'];
    expect(liverQi.code).toBe('SF51');
    expect(liverQi.correspondingWesternIcd10.code).toBe('F41.1');
  });

  it('2. Provides standardized WHO TM1 codes for Ayurvedic Tridosha patterns', () => {
    const vata = WHO_ICD11_TM1_CATALOG['VATA_AGGRAVATION'];
    expect(vata).toBeDefined();
    expect(vata.code).toBe('SF80');
    expect(vata.traditionalParadigm).toBe('Ayurveda');
    expect(vata.correspondingWesternIcd10.code).toBe('G90.9');

    const pitta = WHO_ICD11_TM1_CATALOG['PITTA_AGGRAVATION'];
    expect(pitta.code).toBe('SF81');
    expect(pitta.correspondingWesternIcd10.code).toBe('K21.9');
  });

  it('3. Generates valid FHIR R4 extension for dual-coded traditional conditions', () => {
    const pitta = WHO_ICD11_TM1_CATALOG['PITTA_AGGRAVATION'];
    const extension = buildFhirTm1DualCodingExtension(pitta, 0.94);

    expect(extension.url).toBe('http://pocketgull.app/fhir/StructureDefinition/traditional-medicine-tm1');
    expect(extension.extension.length).toBe(6);

    const codeExt = extension.extension.find(e => e.url === 'who-icd11-tm1-code');
    expect(codeExt?.valueString).toBe('SF81');

    const paradigmExt = extension.extension.find(e => e.url === 'traditional-paradigm');
    expect(paradigmExt?.valueString).toBe('Ayurveda');

    const westernExt = extension.extension.find(e => e.url === 'corresponding-western-icd10');
    expect(westernExt?.valueString).toContain('K21.9');

    const scoreExt = extension.extension.find(e => e.url === 'consilience-concordance-score');
    expect(scoreExt?.valueDecimal).toBe(0.94);
  });
});
