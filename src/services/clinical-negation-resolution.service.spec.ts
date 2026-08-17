import '@angular/compiler';
import { ClinicalNegationResolutionService } from './clinical-negation-resolution.service';

describe('ClinicalNegationResolutionService', () => {
  let service: ClinicalNegationResolutionService;

  beforeEach(() => {
    service = new ClinicalNegationResolutionService();
  });

  it('should correctly separate active symptoms from negated symptoms', () => {
    const text = 'Patient denies chest pain and has no palpitations, but presents with severe dyspnea and headache on exertion.';
    const result = service.resolveClinicalText(text);

    // Active
    expect(result.activeSymptoms.some(m => m.normalizedConcept === 'Dyspnea')).toBe(true);
    expect(result.activeSymptoms.some(m => m.normalizedConcept === 'Headache')).toBe(true);

    // Negated
    expect(result.negatedSymptoms.some(m => m.normalizedConcept === 'Chest Pain')).toBe(true);
    expect(result.negatedSymptoms.some(m => m.normalizedConcept === 'Palpitations')).toBe(true);
  });

  it('should scope family history conditions separately from active patient diagnoses', () => {
    const text = 'Patient presents with fatigue. Mother had breast cancer and father had essential hypertension.';
    const result = service.resolveClinicalText(text);

    expect(result.activeSymptoms.some(m => m.normalizedConcept === 'Fatigue')).toBe(true);
    expect(result.familyHistoryConditions.some(m => m.normalizedConcept === 'Malignant Neoplasm of Breast')).toBe(true);
    expect(result.familyHistoryConditions.some(m => m.normalizedConcept === 'Essential Hypertension')).toBe(true);
  });

  it('should disambiguate MS into Multiple Sclerosis or Mitral Stenosis based on clinical context', () => {
    const neuroText = 'Patient underwent brain MRI for optic neuritis flare and has a history of MS with limb numbness.';
    const neuroResult = service.resolveClinicalText(neuroText);
    const neuroMention = neuroResult.activeSymptoms.find(m => m.polysemyDisambiguation?.rawAcronym === 'MS');
    expect(neuroMention?.normalizedConcept).toBe('Multiple Sclerosis');

    const cardioText = 'Echocardiogram reveals diastolic murmur and left atrium dilation consistent with severe MS.';
    const cardioResult = service.resolveClinicalText(cardioText);
    const cardioMention = cardioResult.activeSymptoms.find(m => m.polysemyDisambiguation?.rawAcronym === 'MS');
    expect(cardioMention?.normalizedConcept).toBe('Mitral Stenosis');
  });

  it('should flag hypothetical/conditional advice appropriately', () => {
    const text = 'Patient is stable on room air. If chest pain recurs, return immediately to the emergency department.';
    const result = service.resolveClinicalText(text);

    expect(result.hypotheticalWarnings.some(m => m.normalizedConcept === 'Chest Pain')).toBe(true);
  });
});
