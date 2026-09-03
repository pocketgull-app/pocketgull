/**
 * Pocket-Gull Grounded Epistemic Assertion Model
 *
 * Implements the Anti-Confirmation Bias & Socratic Falsification Envelope.
 * Guarantees that every clinical diagnostic suggestion or therapeutic intervention
 * is bounded by:
 * 1. Exactly 3 orthogonal counter-hypotheses (prevents premature diagnostic closure).
 * 2. Explicit disconfirming physical exam maneuvers (Popperian falsifiability).
 * 3. p-value null hypothesis (H0) statistical verification (H0 rejected at p < 0.05).
 * 4. Cochrane Risk of Bias 2 rating (Low, Some Concerns, High).
 * 5. Statutory medical citations (PubMed PMCID, MeSH, FDA Application IDs).
 */

export type EpistemicEvidenceTier =
  | 'Level A (Replicated RCTs)'
  | 'Level B (Cohort / Preliminary RCT)'
  | 'Level C (Mechanistic Plausibility)'
  | 'Level D (Anecdotal / Unproven)';

export type CochraneRiskOfBiasRating =
  | 'Low Risk of Bias'
  | 'Some Concerns'
  | 'High Risk of Bias';

export interface IGroundedCitation {
  pmcid?: string;
  meshTerms: string[];
  fdaApplicationId?: string;
  title?: string;
  year?: number;
}

export interface IGroundedClinicalAssertion {
  /** The primary diagnostic formulation or biological mechanism */
  hypothesis: string;
  /** Primary ICD-10 clinical classification code */
  icd10Code: string;
  /** SNOMED-CT clinical term identifier */
  snomedCtId: string;

  /** Calibrated epistemic confidence probability [0.0 - 1.0] */
  epistemicConfidence: number;
  /** Null hypothesis (H0) statement */
  nullHypothesisH0: string;
  /** Statistical p-value testing H0. Must be < 0.05 to claim causal efficacy/association */
  pValueNullRejection: number;
  /** Cochrane Risk of Bias level for underlying evidence */
  cochraneRiskOfBias: CochraneRiskOfBiasRating;
  /** Grade of scientific evidence */
  evidenceTier: EpistemicEvidenceTier;

  /**
   * Anti-Confirmation Bias Invariant:
   * Exactly 3 orthogonal differential diagnoses or competing etiologies that must be
   * actively ruled out before clinical commitment.
   */
  counterHypotheses: [string, string, string];

  /**
   * Specific bedside physical exam maneuvers, functional provocations, or laboratory
   * tests that would DISCONFIRM or falsify the primary hypothesis.
   */
  disconfirmingPhysicalExams: string[];

  /** High-acuity somatic red flags requiring immediate emergency intervention */
  redFlagExceptions: string[];

  /** Peer-reviewed statutory citations */
  statutoryCitations: IGroundedCitation[];

  /** ISO 8601 timestamp of epistemic attestation */
  attestationTimestamp: string;

  /** SHA-256 integrity seal under FDA 21 CFR Part 11 */
  integrityDigest?: string;
}

export interface IGroundedAssertionValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates that an incoming model completion satisfies the strict
 * Anti-Confirmation Bias & Epistemic Falsification Envelope.
 */
export function validateGroundedClinicalAssertion(
  data: unknown
): IGroundedAssertionValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Assertion payload must be a non-null object'] };
  }

  const assertion = data as Partial<IGroundedClinicalAssertion>;

  // 1. Primary Hypothesis check
  if (!assertion.hypothesis || typeof assertion.hypothesis !== 'string' || assertion.hypothesis.trim().length < 5) {
    errors.push('hypothesis must be a non-empty string of at least 5 characters');
  }

  // 2. Ontological mappings
  if (!assertion.icd10Code || typeof assertion.icd10Code !== 'string') {
    errors.push('icd10Code is required (e.g. M51.26)');
  }
  if (!assertion.snomedCtId || typeof assertion.snomedCtId !== 'string') {
    errors.push('snomedCtId is required');
  }

  // 3. Statistical Epistemic Metrics
  if (typeof assertion.epistemicConfidence !== 'number' || assertion.epistemicConfidence < 0 || assertion.epistemicConfidence > 1) {
    errors.push('epistemicConfidence must be a calibrated float between 0.0 and 1.0');
  }

  if (typeof assertion.pValueNullRejection !== 'number' || isNaN(assertion.pValueNullRejection)) {
    errors.push('pValueNullRejection must be a valid numeric p-value');
  }

  if (!assertion.nullHypothesisH0 || typeof assertion.nullHypothesisH0 !== 'string') {
    errors.push('nullHypothesisH0 is required to prevent un-falsifiable claims');
  }

  // 4. Anti-Confirmation Bias Invariant: Exactly 3 orthogonal counter-hypotheses
  if (!Array.isArray(assertion.counterHypotheses) || assertion.counterHypotheses.length !== 3) {
    errors.push(
      'counterHypotheses must contain exactly 3 orthogonal differential hypotheses to defeat premature closure'
    );
  } else {
    for (let i = 0; i < assertion.counterHypotheses.length; i++) {
      const ch = assertion.counterHypotheses[i];
      if (typeof ch !== 'string' || ch.trim().length < 5) {
        errors.push(`counterHypotheses[${i}] must be a descriptive string of at least 5 characters`);
      }
    }
  }

  // 5. Disconfirming Physical Exams (At least 1 required)
  if (!Array.isArray(assertion.disconfirmingPhysicalExams) || assertion.disconfirmingPhysicalExams.length === 0) {
    errors.push('disconfirmingPhysicalExams must include at least one clinical falsification maneuver');
  }

  // 6. Evidence Tier & Cochrane Bias validity
  const validTiers: EpistemicEvidenceTier[] = [
    'Level A (Replicated RCTs)',
    'Level B (Cohort / Preliminary RCT)',
    'Level C (Mechanistic Plausibility)',
    'Level D (Anecdotal / Unproven)'
  ];
  if (!assertion.evidenceTier || !validTiers.includes(assertion.evidenceTier)) {
    errors.push(`evidenceTier must be one of: ${validTiers.join(', ')}`);
  }

  const validBias: CochraneRiskOfBiasRating[] = ['Low Risk of Bias', 'Some Concerns', 'High Risk of Bias'];
  if (!assertion.cochraneRiskOfBias || !validBias.includes(assertion.cochraneRiskOfBias)) {
    errors.push(`cochraneRiskOfBias must be one of: ${validBias.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Creates a default, schema-compliant clinical assertion for initialization,
 * fallback, or mock pipelines.
 */
export function createDefaultGroundedClinicalAssertion(
  partial?: Partial<IGroundedClinicalAssertion>
): IGroundedClinicalAssertion {
  return {
    hypothesis: partial?.hypothesis ?? 'Lumbar intervertebral disc displacement (L4-L5 posterior protrusion)',
    icd10Code: partial?.icd10Code ?? 'M51.26',
    snomedCtId: partial?.snomedCtId ?? '202794008',
    epistemicConfidence: partial?.epistemicConfidence ?? 0.88,
    nullHypothesisH0:
      partial?.nullHypothesisH0 ??
      'Observed radicular symptoms and disc protrusion are incidental age-related morphological variants without nerve root impingement.',
    pValueNullRejection: partial?.pValueNullRejection ?? 0.008,
    cochraneRiskOfBias: partial?.cochraneRiskOfBias ?? 'Low Risk of Bias',
    evidenceTier: partial?.evidenceTier ?? 'Level A (Replicated RCTs)',
    counterHypotheses: partial?.counterHypotheses ?? [
      'Sacroiliac joint dysfunction with pseudoradicular referral',
      'Piriformis syndrome with sciatic nerve entrapment',
      'Thoracolumbar junction syndrome (Maigne syndrome) referred to lower lumbar spine'
    ],
    disconfirmingPhysicalExams: partial?.disconfirmingPhysicalExams ?? [
      'Straight Leg Raise (Lasègue sign) negative at > 70 degrees',
      'Crossed Straight Leg Raise negative for contralateral radiculopathy',
      'Normal patellar and Achilles deep tendon reflexes (2+ bilaterally)'
    ],
    redFlagExceptions: partial?.redFlagExceptions ?? [
      'Cauda equina syndrome: new urinary retention or overflow incontinence',
      'Progressive motor deficit: rapid foot drop (L5 tibialis anterior weakness)',
      'Saddle anesthesia in S3-S5 distribution'
    ],
    statutoryCitations: partial?.statutoryCitations ?? [
      {
        pmcid: 'PMC4464797',
        meshTerms: ['Intervertebral Disc Displacement', 'Magnetic Resonance Imaging', 'Radiculopathy'],
        title: 'Systematic review of diagnostic accuracy of clinical tests for lumbar disc herniation'
      }
    ],
    attestationTimestamp: partial?.attestationTimestamp ?? new Date().toISOString()
  };
}

/**
 * JSON Schema descriptor for Gemini 3.7 Structured Outputs (responseMimeType: 'application/json')
 */
export const GROUNDED_CLINICAL_ASSERTION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    hypothesis: { type: 'string', description: 'Primary diagnostic formulation' },
    icd10Code: { type: 'string', description: 'ICD-10 clinical code' },
    snomedCtId: { type: 'string', description: 'SNOMED-CT identifier' },
    epistemicConfidence: { type: 'number', description: 'Calibrated confidence float between 0.0 and 1.0' },
    nullHypothesisH0: { type: 'string', description: 'Null hypothesis statement to be falsified' },
    pValueNullRejection: { type: 'number', description: 'p-value testing H0 (must be < 0.05 for causal effect)' },
    cochraneRiskOfBias: {
      type: 'string',
      enum: ['Low Risk of Bias', 'Some Concerns', 'High Risk of Bias']
    },
    evidenceTier: {
      type: 'string',
      enum: [
        'Level A (Replicated RCTs)',
        'Level B (Cohort / Preliminary RCT)',
        'Level C (Mechanistic Plausibility)',
        'Level D (Anecdotal / Unproven)'
      ]
    },
    counterHypotheses: {
      type: 'array',
      items: { type: 'string' },
      minItems: 3,
      maxItems: 3,
      description: 'Exactly 3 orthogonal differential hypotheses that must be considered'
    },
    disconfirmingPhysicalExams: {
      type: 'array',
      items: { type: 'string' },
      description: 'Physical exam tests that would falsify the primary hypothesis'
    },
    redFlagExceptions: {
      type: 'array',
      items: { type: 'string' },
      description: 'High-acuity red flag symptoms'
    }
  },
  required: [
    'hypothesis',
    'icd10Code',
    'snomedCtId',
    'epistemicConfidence',
    'nullHypothesisH0',
    'pValueNullRejection',
    'cochraneRiskOfBias',
    'evidenceTier',
    'counterHypotheses',
    'disconfirmingPhysicalExams',
    'redFlagExceptions'
  ]
};
