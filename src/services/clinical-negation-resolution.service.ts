import { Injectable, signal } from '@angular/core';

export type ClinicalExperiencerScope = 'PATIENT_ACTIVE' | 'PATIENT_NEGATED' | 'FAMILY_HISTORY' | 'HYPOTHETICAL';

export interface IClinicalEntityMention {
  rawText: string;
  normalizedConcept: string;
  category: 'CONDITION' | 'SYMPTOM' | 'MEDICATION' | 'PROCEDURE' | 'ANATOMY' | 'LAB_OBSERVATION';
  scope: ClinicalExperiencerScope;
  confidence: number; // 0.0 to 1.0
  negationTrigger?: string;
  experiencerTrigger?: string;
  polysemyDisambiguation?: {
    rawAcronym: string;
    resolvedMeaning: string;
    contextualCues: string[];
  };
  ontologies: {
    snomedCt?: string;
    icd10Cm?: string;
    hpo?: string;
    rxNorm?: string;
  };
  temporalContext?: {
    onset?: string;
    duration?: string;
    frequency?: string;
  };
}

export interface IClinicalNlpResolutionResult {
  originalText: string;
  timestamp: string;
  activeSymptoms: IClinicalEntityMention[];
  negatedSymptoms: IClinicalEntityMention[];
  familyHistoryConditions: IClinicalEntityMention[];
  hypotheticalWarnings: IClinicalEntityMention[];
  allMentions: IClinicalEntityMention[];
  diagnosticConfidenceScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalNegationResolutionService {
  readonly lastNlpResult = signal<IClinicalNlpResolutionResult | null>(null);

  // Pre-negation triggers (forward scope ~ 6 tokens)
  private readonly preNegationTriggers = [
    'denies', 'deny', 'denied', 'denying',
    'no', 'not', 'never', 'none', 'neither', 'nor',
    'negative for', 'neg for', 'free of', 'without', 'rules out', 'ruled out',
    'absence of', 'fails to reveal', 'unremarkable for', 'no signs of', 'no evidence of'
  ];

  // Post-negation triggers (backward scope ~ 4 tokens)
  private readonly postNegationTriggers = [
    'unlikely', 'ruled out', 'was not seen', 'not detected', 'absent',
    'was negative', 'is negative', 'resolved', 'was unremarkable'
  ];

  // Family history experiencer triggers
  private readonly familyTriggers = [
    'mother', 'father', 'maternal', 'paternal', 'sister', 'brother',
    'grandmother', 'grandfather', 'aunt', 'uncle', 'cousin', 'parent',
    'family history of', 'fhx of', 'fh:', 'sibling'
  ];

  // Hypothetical / conditional triggers
  private readonly hypotheticalTriggers = [
    'if', 'in case of', 'should you develop', 'to prevent', 'risk of',
    'watch for', 'return to clinic if', 'precautions against', 'possibility of'
  ];

  // Common clinical knowledge base for entity extraction & polysemy
  private readonly clinicalLexicon: Array<{
    terms: string[];
    concept: string;
    category: IClinicalEntityMention['category'];
    ontologies: IClinicalEntityMention['ontologies'];
    acronym?: {
      short: string;
      rules: Array<{ meaning: string; keywords: string[]; snomed?: string; icd?: string; rxnorm?: string }>;
    };
  }> = [
    {
      terms: ['chest pain', 'angina', 'substernal chest pain', 'angina pectoris'],
      concept: 'Chest Pain',
      category: 'SYMPTOM',
      ontologies: { snomedCt: '29857009', icd10Cm: 'R07.9', hpo: 'HP:0100749' }
    },
    {
      terms: ['dyspnea', 'shortness of breath', 'breathlessness', 'dyspneic', 'sob'],
      concept: 'Dyspnea',
      category: 'SYMPTOM',
      ontologies: { snomedCt: '267036007', icd10Cm: 'R06.00', hpo: 'HP:0002094' },
      acronym: {
        short: 'sob',
        rules: [
          { meaning: 'Shortness of Breath', keywords: ['chest', 'breath', 'lung', 'exertion', 'air', 'walk'], snomed: '267036007', icd: 'R06.00' }
        ]
      }
    },
    {
      terms: ['headache', 'cephalalgia', 'throbbing head pain', 'migraine'],
      concept: 'Headache',
      category: 'SYMPTOM',
      ontologies: { snomedCt: '25064002', icd10Cm: 'R51.9', hpo: 'HP:0002315' }
    },
    {
      terms: ['palpitations', 'heart racing', 'irregular heartbeat', 'fluttering'],
      concept: 'Palpitations',
      category: 'SYMPTOM',
      ontologies: { snomedCt: '80313002', icd10Cm: 'R00.2', hpo: 'HP:0001962' }
    },
    {
      terms: ['fatigue', 'exhaustion', 'malaise', 'lethargy', 'tiredness'],
      concept: 'Fatigue',
      category: 'SYMPTOM',
      ontologies: { snomedCt: '84229001', icd10Cm: 'R53.83', hpo: 'HP:0012378' }
    },
    {
      terms: ['breast cancer', 'breast carcinoma', 'mammary neoplasm', 'brca1'],
      concept: 'Malignant Neoplasm of Breast',
      category: 'CONDITION',
      ontologies: { snomedCt: '254837009', icd10Cm: 'C50.919' }
    },
    {
      terms: ['hypertension', 'high blood pressure', 'htn'],
      concept: 'Essential Hypertension',
      category: 'CONDITION',
      ontologies: { snomedCt: '59621000', icd10Cm: 'I10' }
    },
    {
      terms: ['multiple sclerosis', 'mitral stenosis', 'morphine sulfate', 'ms'],
      concept: 'Disambiguated Concept MS',
      category: 'CONDITION',
      ontologies: { snomedCt: '24700007', icd10Cm: 'G35' },
      acronym: {
        short: 'ms',
        rules: [
          { meaning: 'Multiple Sclerosis', keywords: ['neurology', 'demyelinating', 'optic', 'mri', 'flare', 'numbness', 'tingling', 'brain'], snomed: '24700007', icd: 'G35' },
          { meaning: 'Mitral Stenosis', keywords: ['cardiac', 'murmur', 'valve', 'diastolic', 'rheumatic', 'echo', 'atrium'], snomed: '79619009', icd: 'I05.0' },
          { meaning: 'Morphine Sulfate', keywords: ['mg', 'dose', 'iv', 'pain', 'analgesic', 'opioid', 'prn'], rxnorm: '7052' }
        ]
      }
    },
    {
      terms: ['pulmonary embolism', 'physical exam', 'pleural effusion', 'pe'],
      concept: 'Disambiguated Concept PE',
      category: 'CONDITION',
      ontologies: { snomedCt: '59282003', icd10Cm: 'I26.99' },
      acronym: {
        short: 'pe',
        rules: [
          { meaning: 'Pulmonary Embolism', keywords: ['d-dimer', 'ctpa', 'ct', 'chest', 'clot', 'dvt', 'tachycardia', 'infarction'], snomed: '59282003', icd: 'I26.99' },
          { meaning: 'Physical Examination', keywords: ['exam', 'normal', 'findings', 'revealed', 'vitals', 'clear', 'benign', 'heent'], snomed: '5880005' },
          { meaning: 'Pleural Effusion', keywords: ['fluid', 'thoracentesis', 'blunting', 'xray', 'lung', 'exudate'], snomed: '60046008', icd: 'J90' }
        ]
      }
    },
    {
      terms: ['rheumatoid arthritis', 'right atrium', 'room air', 'ra'],
      concept: 'Disambiguated Concept RA',
      category: 'CONDITION',
      ontologies: { snomedCt: '69896004', icd10Cm: 'M06.9' },
      acronym: {
        short: 'ra',
        rules: [
          { meaning: 'Rheumatoid Arthritis', keywords: ['joint', 'synovitis', 'rf', 'anti-ccp', 'morning', 'stiffness', 'hands', 'biologic'], snomed: '69896004', icd: 'M06.9' },
          { meaning: 'Room Air', keywords: ['sats', 'spo2', 'oxygen', '%', 'ambient', 'breathing', 'pulse ox'], snomed: '261742005' },
          { meaning: 'Right Atrium', keywords: ['cardiac', 'chamber', 'dilation', 'triscuspid', 'ivc'], snomed: '73829009' }
        ]
      }
    }
  ];

  // Conjunction / termination keywords that terminate forward negation scope
  private readonly terminationKeywords = [
    'but', 'however', 'although', 'except', 'yet', 'presents with', 'presenting with',
    'reports', 'reporting', 'complains of', 'complaining of', 'noted to have', 'developed', 'found to have'
  ];

  /**
   * Performs deep contextual negation, experiencer boundary detection, and polysemy resolution.
   */
  resolveClinicalText(rawText: string): IClinicalNlpResolutionResult {
    if (!rawText || !rawText.trim()) {
      return {
        originalText: '',
        timestamp: new Date().toISOString(),
        activeSymptoms: [],
        negatedSymptoms: [],
        familyHistoryConditions: [],
        hypotheticalWarnings: [],
        allMentions: [],
        diagnosticConfidenceScore: 1.0
      };
    }

    const sentences = rawText.split(/[.;\n]+/).map(s => s.trim()).filter(Boolean);
    const mentions: IClinicalEntityMention[] = [];

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();

      for (const entry of this.clinicalLexicon) {
        for (const term of entry.terms) {
          const regex = new RegExp(`\\b${term}\\b`, 'i');
          const match = lowerSentence.match(regex);

          if (match && match.index !== undefined) {
            const termIndex = match.index;
            const preContext = lowerSentence.substring(0, termIndex);
            const postContext = lowerSentence.substring(termIndex + match[0].length);

            // 1. Check Family History Experiencer
            let scope: ClinicalExperiencerScope = 'PATIENT_ACTIVE';
            let experiencerTrigger: string | undefined;
            let negationTrigger: string | undefined;

            for (const fam of this.familyTriggers) {
              const famIdx = preContext.lastIndexOf(fam);
              if (famIdx !== -1) {
                // Verify no termination keyword after the family trigger
                const textAfterFam = preContext.substring(famIdx + fam.length);
                const hasTermination = this.terminationKeywords.some(t => new RegExp(`\\b${t}\\b`, 'i').test(textAfterFam));
                if (!hasTermination) {
                  scope = 'FAMILY_HISTORY';
                  experiencerTrigger = fam;
                  break;
                }
              }
            }

            // 2. Check Hypothetical
            if (scope === 'PATIENT_ACTIVE') {
              for (const hyp of this.hypotheticalTriggers) {
                const hypIdx = preContext.lastIndexOf(hyp);
                if (hypIdx !== -1) {
                  const textAfterHyp = preContext.substring(hypIdx + hyp.length);
                  const hasTermination = this.terminationKeywords.some(t => new RegExp(`\\b${t}\\b`, 'i').test(textAfterHyp));
                  if (!hasTermination) {
                    scope = 'HYPOTHETICAL';
                    experiencerTrigger = hyp;
                    break;
                  }
                }
              }
            }

            // 3. Check Negation (Pre and Post)
            if (scope === 'PATIENT_ACTIVE') {
              // Pre-negation within last 60 characters
              const recentPre = preContext.slice(-60);
              for (const neg of this.preNegationTriggers) {
                const negMatch = recentPre.match(new RegExp(`\\b${neg}\\b`, 'i'));
                if (negMatch && negMatch.index !== undefined) {
                  // Verify no termination boundary (e.g. 'but', 'presents with') after the negation
                  const textAfterNeg = recentPre.substring(negMatch.index + negMatch[0].length);
                  const hasTermination = this.terminationKeywords.some(t => new RegExp(`\\b${t}\\b`, 'i').test(textAfterNeg));
                  if (!hasTermination) {
                    scope = 'PATIENT_NEGATED';
                    negationTrigger = neg;
                    break;
                  }
                }
              }

              // Post-negation within next 40 characters
              if (scope === 'PATIENT_ACTIVE') {
                const immediatePost = postContext.slice(0, 40);
                for (const neg of this.postNegationTriggers) {
                  if (new RegExp(`\\b${neg}\\b`, 'i').test(immediatePost)) {
                    scope = 'PATIENT_NEGATED';
                    negationTrigger = neg;
                    break;
                  }
                }
              }
            }

            // 4. Polysemous Acronym Disambiguation
            let disambiguation: IClinicalEntityMention['polysemyDisambiguation'];
            let resolvedConcept = entry.concept;
            let resolvedOntologies = { ...entry.ontologies };

            if (entry.acronym && match[0].toLowerCase() === entry.acronym.short) {
              const matchedCues: string[] = [];
              let bestRule = entry.acronym.rules[0];
              let maxCueHits = 0;

              for (const rule of entry.acronym.rules) {
                let hits = 0;
                for (const kw of rule.keywords) {
                  if (lowerSentence.includes(kw)) {
                    hits++;
                    matchedCues.push(kw);
                  }
                }
                if (hits > maxCueHits) {
                  maxCueHits = hits;
                  bestRule = rule;
                }
              }

              resolvedConcept = bestRule.meaning;
              if (bestRule.snomed) resolvedOntologies.snomedCt = bestRule.snomed;
              if (bestRule.icd) resolvedOntologies.icd10Cm = bestRule.icd;
              if (bestRule.rxnorm) resolvedOntologies.rxNorm = bestRule.rxnorm;

              disambiguation = {
                rawAcronym: match[0].toUpperCase(),
                resolvedMeaning: bestRule.meaning,
                contextualCues: matchedCues
              };
            }

            // Avoid duplicate identical mentions in the same sentence
            if (!mentions.some(m => m.normalizedConcept === resolvedConcept && m.scope === scope)) {
              mentions.push({
                rawText: match[0],
                normalizedConcept: resolvedConcept,
                category: entry.category,
                scope,
                confidence: scope === 'PATIENT_ACTIVE' ? 0.96 : (scope === 'PATIENT_NEGATED' ? 0.98 : 0.92),
                negationTrigger,
                experiencerTrigger,
                polysemyDisambiguation: disambiguation,
                ontologies: resolvedOntologies
              });
            }
          }
        }
      }
    }

    const active = mentions.filter(m => m.scope === 'PATIENT_ACTIVE');
    const negated = mentions.filter(m => m.scope === 'PATIENT_NEGATED');
    const family = mentions.filter(m => m.scope === 'FAMILY_HISTORY');
    const hypo = mentions.filter(m => m.scope === 'HYPOTHETICAL');

    const result: IClinicalNlpResolutionResult = {
      originalText: rawText,
      timestamp: new Date().toISOString(),
      activeSymptoms: active,
      negatedSymptoms: negated,
      familyHistoryConditions: family,
      hypotheticalWarnings: hypo,
      allMentions: mentions,
      diagnosticConfidenceScore: mentions.length > 0 ? 0.95 : 0.70
    };

    this.lastNlpResult.set(result);
    return result;
  }
}
