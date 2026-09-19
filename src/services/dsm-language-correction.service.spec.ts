import { describe, it, expect, beforeEach } from 'vitest';
import { DsmLanguageCorrectionService, IDsmLanguageRule } from './dsm-language-correction.service';

describe('DsmLanguageCorrectionService', () => {
  let service: DsmLanguageCorrectionService;

  beforeEach(() => {
    service = new DsmLanguageCorrectionService();
  });

  it('1. Initializes core rules count and active registry', () => {
    expect(service.rulesCount()).toBeGreaterThanOrEqual(8);
    const rules = service.getAllRules();
    expect(rules.some(r => r.id === 'asam-medically-managed-withdrawal')).toBe(true);
    expect(rules.some(r => r.id === 'suicidology-died-by-suicide')).toBe(true);
  });

  it('2. Flags "detox" and suggests ASAM "medically-managed withdrawal"', () => {
    const text = 'Patient was admitted to detox for severe alcohol withdrawal.';
    const result = service.auditText(text);

    expect(result.hasSuggestions).toBe(true);
    expect(result.totalFlags).toBe(1);
    expect(result.suggestions[0].matchedText.toLowerCase()).toBe('detox');
    expect(result.suggestions[0].preferredTerm).toBe('medically-managed withdrawal');
    expect(result.suggestions[0].citation).toContain('ASAM Criteria 4th Edition');
    expect(result.suggestions[0].educationalRationale).toContain('archaic commercial cleanse');
    expect(result.harmonizedText).toContain('medically-managed withdrawal');
  });

  it('3. Flags "dirty urine" and suggests objective toxicology screen language', () => {
    const text = 'Urine drug screen was dirty urine for cannabis.';
    const result = service.auditText(text);

    expect(result.hasSuggestions).toBe(true);
    const flag = result.suggestions.find(s => s.matchedText.toLowerCase().includes('dirty urine'));
    expect(flag).toBeDefined();
    expect(flag!.preferredTerm).toContain('toxicology screen');
    expect(flag!.standardSource).toBe('NIDA_WORDS_MATTER');
  });

  it('4. Flags "addict" and "substance abuser" in favor of person-first SUD', () => {
    const text = 'The patient is a known heroin addict.';
    const result = service.auditText(text);

    expect(result.hasSuggestions).toBe(true);
    expect(result.suggestions[0].preferredTerm).toBe('person with a substance use disorder');
    expect(result.suggestions[0].citation).toContain('DSM-5-TR');
    expect(result.suggestions[0].educationalRationale).toContain('Kelly & Westerhoff');
  });

  it('5. Flags "committed suicide" and provides modern suicidology guidance', () => {
    const text = 'Family history notes father committed suicide in 2018.';
    const result = service.auditText(text);

    expect(result.hasSuggestions).toBe(true);
    expect(result.suggestions[0].preferredTerm).toBe('died by suicide');
    expect(result.suggestions[0].category).toBe('SUICIDOLOGY');
    expect(result.suggestions[0].educationalRationale).toContain('felony');
  });

  it('6. Flags "non-compliant" and reframes as adherence barriers', () => {
    const text = 'Patient has been non-compliant with prescribed beta-blockers.';
    const result = service.auditText(text);

    expect(result.hasSuggestions).toBe(true);
    expect(result.suggestions[0].preferredTerm).toBe('experiencing barriers to treatment plan');
    expect(result.suggestions[0].category).toBe('ADHERENCE');
  });

  it('7. Strictly protects patient verbatim speech inside quotation marks', () => {
    const text = 'Patient stated: "I was admitted to detox two weeks ago." Clinician assessment: Refer to detox unit.';
    const result = service.auditText(text);

    expect(result.protectedQuoteCount).toBe(1);
    // Only the second "detox unit" outside quotes should be flagged
    expect(result.totalFlags).toBe(1);
    expect(result.suggestions[0].matchedText.toLowerCase()).toBe('detox unit');

    // Harmonized text must preserve quoted statement exactly
    expect(result.harmonizedText).toContain('Patient stated: "I was admitted to detox two weeks ago."');
    expect(result.harmonizedText).toContain('Refer to medically-managed withdrawal.');
  });

  it('8. Supports smart curly quotes and single quotes for quote protection', () => {
    const text = 'Nursing note: Patient stated “I want to go to detox now”.';
    const result = service.auditText(text);

    expect(result.protectedQuoteCount).toBe(1);
    expect(result.totalFlags).toBe(0);
    expect(result.hasSuggestions).toBe(false);
    expect(result.harmonizedText).toBe(text);
  });

  it('9. Allows dynamic rule registration and custom institutional policies', () => {
    const initialCount = service.rulesCount();
    const customRule: IDsmLanguageRule = {
      id: 'custom-unhoused-terminology',
      version: '1.0.0',
      deprecatedPattern: /\b(homeless person|the homeless)\b/gi,
      preferredTerm: 'person experiencing homelessness / unhoused individual',
      category: 'PSYCHIATRY',
      standardSource: 'INSTITUTIONAL',
      citation: 'County Department of Health Social Determinants Guidance (2025)',
      educationalRationale: 'Person-first terminology recognizing housing insecurity as an external social determinant rather than an intrinsic identity.',
      sampleBefore: 'Patient is a homeless person.',
      sampleAfter: 'Patient is an individual experiencing homelessness.',
      severity: 'RECOMMENDED_SHIFT',
      active: true
    };

    service.registerRule(customRule);
    expect(service.rulesCount()).toBe(initialCount + 1);

    const audit = service.auditText('Assessment: homeless person presenting for wound care.');
    expect(audit.hasSuggestions).toBe(true);
    expect(audit.suggestions[0].preferredTerm).toContain('experiencing homelessness');
  });

  it('10. Exports and imports rule manifests via JSON', () => {
    const manifestJson = service.exportRulesManifest();
    expect(manifestJson).toContain('"schemaVersion": "1.0.0"');
    expect(manifestJson).toContain('"asam-medically-managed-withdrawal"');

    const freshNewService = new DsmLanguageCorrectionService();
    const customJson = JSON.stringify({
      schemaVersion: '1.0.0',
      rules: [
        {
          id: 'test-custom-policy',
          version: '2.0.0',
          patternString: '\\b(senile dementia)\\b',
          patternFlags: 'gi',
          preferredTerm: 'major neurocognitive disorder',
          category: 'PSYCHIATRY',
          standardSource: 'DSM-5-TR',
          citation: 'DSM-5-TR § Neurocognitive Disorders',
          educationalRationale: 'Replaced archaic senility term with neurocognitive disorder spectrum.',
          sampleBefore: 'Patient has senile dementia.',
          sampleAfter: 'Patient is diagnosed with major neurocognitive disorder.',
          severity: 'HIGH_PRIORITY',
          active: true
        }
      ]
    });

    const loadedCount = freshNewService.loadRulesFromJson(customJson);
    expect(loadedCount).toBe(1);

    const audit = freshNewService.auditText('Neurology consult: Patient exhibits senile dementia.');
    expect(audit.hasSuggestions).toBe(true);
    expect(audit.suggestions[0].preferredTerm).toBe('major neurocognitive disorder');
  });

  it('11. Flags "chemical imbalance in the brain" and advocates biopsychosocial lifestyle foundation', () => {
    const text = 'Provider explained that depression is simply a chemical imbalance in the brain.';
    const result = service.auditText(text);

    expect(result.hasSuggestions).toBe(true);
    const flag = result.suggestions.find(s => s.category === 'NON_PHARMACOLOGICAL_FIRST');
    expect(flag).toBeDefined();
    expect(flag!.preferredTerm).toContain('complex biopsychosocial distress');
    expect(flag!.citation).toContain('Moncrieff');
  });

  it('12. Flags premature pharmaceutical reflex ("needs medication to be happy") in favor of non-pharmacological modalities first', () => {
    const text = 'Intake notes: Patient needs medication to be happy and start an antidepressant immediately.';
    const result = service.auditText(text);

    expect(result.hasSuggestions).toBe(true);
    const flag = result.suggestions.find(s => s.ruleId === 'lifestyle-avoid-premature-prescribing');
    expect(flag).toBeDefined();
    expect(flag!.preferredTerm).toContain('prioritize foundational non-pharmacological modalities');
    expect(flag!.citation).toContain('NICE Clinical Guideline NG222');
  });

  it('13. Flags "patient failed medication" in favor of deprescribing and non-drug root causes', () => {
    const text = 'Patient failed all SSRIs over past year with no remission.';
    const result = service.auditText(text);

    expect(result.hasSuggestions).toBe(true);
    const flag = result.suggestions.find(s => s.category === 'DEPRESCRIBING');
    expect(flag).toBeDefined();
    expect(flag!.preferredTerm).toContain('deprescribing');
  });

  it('14. Flags "committed self-harm" in favor of non-suicidal self-injury', () => {
    const text = 'Patient committed self-harm during periods of severe isolation.';
    const result = service.auditText(text);

    expect(result.hasSuggestions).toBe(true);
    const flag = result.suggestions.find(s => s.ruleId === 'suicidology-self-directed-harm');
    expect(flag).toBeDefined();
    expect(flag!.preferredTerm).toContain('non-suicidal self-injury');
  });

  it('15. Flags "involuntarily committed" in favor of trauma-informed psychiatric evaluation hold', () => {
    const text = 'Patient was involuntarily committed to the mental hospital following crisis.';
    const result = service.auditText(text);

    expect(result.hasSuggestions).toBe(true);
    const flag = result.suggestions.find(s => s.ruleId === 'psychiatry-involuntary-admission');
    expect(flag).toBeDefined();
    expect(flag!.preferredTerm).toContain('involuntary psychiatric hospitalization');
  });
});
