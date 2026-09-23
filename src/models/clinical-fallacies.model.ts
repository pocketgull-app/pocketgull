/**
 * Clinical Logical Fallacies & Epistemic Biases Taxonomy
 * 
 * Maps formal and informal fallacies from classical logic (Aristotelian syllogisms,
 * propositional logic, inductive reasoning) and Wikipedia's 'List of Fallacies'
 * into actionable clinical decision support, diagnostic de-biasing, and research verification.
 */

export type ClinicalFallacyCategory =
  | 'FORMAL_LOGICAL'
  | 'INFORMAL_PROBABILISTIC'
  | 'INFORMAL_CAUSAL'
  | 'INFORMAL_COGNITIVE'
  | 'RHETORICAL_RELEVANCE';

export type FallacySeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export interface IBayesianNaturalFrequencyInsight {
  totalPopulation: number; // e.g. 10,000
  prevalenceRate: number; // e.g. 0.0001
  diseasedInPopulation: number; // e.g. 1
  healthyInPopulation: number; // e.g. 9,999
  sensitivity: number; // e.g. 0.99
  specificity: number; // e.g. 0.99
  truePositives: number; // e.g. 1
  falsePositives: number; // e.g. 100
  trueNegatives: number;
  falseNegatives: number;
  totalPositives: number; // e.g. 101
  actualPpvPercentage: number; // e.g. 0.99 (%)
  plainEnglishExplanation: string;
}

export interface IClinicalFallacyDefinition {
  id: string; // e.g. 'BASE_RATE_FALLACY'
  name: string; // e.g. 'Base-Rate Fallacy (Base-Rate Neglect)'
  category: ClinicalFallacyCategory;
  formalLogicNotation?: string;
  wikipediaUrl: string;
  description: string;
  clinicalExample: string;
  epistemicCorrection: string;
  detectionKeywords: string[];
  detectionRegexes: RegExp[];
  severity: FallacySeverity;
  clinicalRisk: string;
  counterHypothesis: string;
  socraticQuestion: string;
}

export interface IFallacyAuditFinding {
  fallacyId: string;
  fallacyName: string;
  category: ClinicalFallacyCategory;
  severity: FallacySeverity;
  matchedClue: string;
  clinicalRisk: string;
  counterHypothesis: string;
  socraticQuestion: string;
  definition: IClinicalFallacyDefinition;
}

export interface IClinicalFallacyAuditResult {
  assertionText: string;
  hasDetectedFallacy: boolean;
  overallVerdict: string;
  findings: IFallacyAuditFinding[];
  bayesianInsight?: IBayesianNaturalFrequencyInsight | null;
  timestamp: string;
}
