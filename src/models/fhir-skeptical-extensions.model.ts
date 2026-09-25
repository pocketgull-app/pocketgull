/**
 * PocketGull HL7 FHIR R4 Skeptical Epistemology & FDA 21 CFR Part 11 Extension Schemas
 *
 * Provides standardized FHIR R4 extensions for Popperian Null-Hypothesis (H0) testing,
 * p-values, 95% Confidence Intervals, Cochrane Risk of Bias 2 (RoB 2) ratings,
 * and immutable FDA 21 CFR Part 11 cryptographic provenance signatures.
 */

export interface IFhirExtensionItem {
  url: string;
  valueDecimal?: number;
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  extension?: IFhirExtensionItem[];
}

export interface IFhirSkepticalEpistemologyExtension {
  url: 'http://pocketgull.app/fhir/StructureDefinition/skeptical-epistemology';
  extension: [
    { url: 'null-hypothesis-h0'; valueString: string },
    { url: 'p-value'; valueDecimal: number },
    { url: 'is-falsified'; valueBoolean: boolean },
    { url: 'epistemic-confidence-percent'; valueInteger: number },
    { url: 'cochrane-rob2-overall'; valueString: string },
    { url: 'ci-95-lower'; valueDecimal: number },
    { url: 'ci-95-upper'; valueDecimal: number },
    { url: 'skeptical-warning-notice'; valueString: string }
  ];
}

/**
 * FHIR R4 Extension: PROTAC 3-Body Hook Effect Polypharmacy Guard
 */
export interface IFhirProtacHookExtension {
  url: 'http://pocketgull.app/fhir/StructureDefinition/protac-hook-effect';
  extension: [
    { url: 'total-supplements-count'; valueInteger: number },
    { url: 'optimal-dose-copt'; valueInteger: number },
    { url: 'hook-saturation-ratio'; valueDecimal: number },
    { url: 'is-hook-suppressed'; valueBoolean: boolean },
    { url: 'p-value'; valueDecimal: number },
    { url: 'clinical-action'; valueString: string }
  ];
}

/**
 * FHIR R4 Extension: LLPS Cahn-Hilliard Phase Boundary Plaque Guard
 */
export interface IFhirLlpsPhaseBoundaryExtension {
  url: 'http://pocketgull.app/fhir/StructureDefinition/llps-phase-boundary';
  extension: [
    { url: 'molecule-name'; valueString: string },
    { url: 'claimed-aggregate-target'; valueString: string },
    { url: 'hydrophobic-flory-chi'; valueDecimal: number },
    { url: 'free-energy-delta-f-mix'; valueDecimal: number },
    { url: 'is-phase-boundary-achieved'; valueBoolean: boolean },
    { url: 'p-value'; valueDecimal: number },
    { url: 'skeptical-verdict'; valueString: string }
  ];
}

/**
 * FHIR R4 Extension: Quantum Thermal Noise (k_B T) Floor Falsifier
 */
export interface IFhirQuantumThermalNoiseExtension {
  url: 'http://pocketgull.app/fhir/StructureDefinition/quantum-thermal-noise';
  extension: [
    { url: 'device-or-claim-name'; valueString: string },
    { url: 'thermal-noise-kbt-joule'; valueDecimal: number },
    { url: 'zeeman-energy-joule'; valueDecimal: number },
    { url: 'photon-energy-joule'; valueDecimal: number },
    { url: 'is-thermal-noise-overcome'; valueBoolean: boolean },
    { url: 'p-value'; valueDecimal: number },
    { url: 'cochrane-rob2-rating'; valueString: string }
  ];
}

/**
 * FHIR R4 Extension: Quantum Dual-Spin Continuous Evidence Superposition
 */
export interface IFhirQuantumDualSpinExtension {
  url: 'http://pocketgull.app/fhir/StructureDefinition/quantum-dual-spin-superposition';
  extension: [
    { url: 'patient-acuity-score'; valueDecimal: number },
    { url: 'zeeman-angle-theta-radians'; valueDecimal: number },
    { url: 'singlet-yield-phi-s'; valueDecimal: number },
    { url: 'triplet-yield-phi-t'; valueDecimal: number },
    { url: 'dominant-branch'; valueString: string },
    { url: 'conservative-soc-text'; valueString: string },
    { url: 'integrative-adjuvant-text'; valueString: string }
  ];
}

/**
 * FHIR R4 Extension: Reticular Framework Pore Sieving & Toxin Chelation Guard
 */
export interface IFhirReticularPoreSieveExtension {
  url: 'http://pocketgull.app/fhir/StructureDefinition/reticular-pore-sieve';
  extension: [
    { url: 'binder-name'; valueString: string },
    { url: 'pore-diameter-nm'; valueDecimal: number },
    { url: 'delta-ionic-radius-angstrom'; valueDecimal: number },
    { url: 'knudsen-diffusivity-m2s'; valueDecimal: number },
    { url: 'is-selectively-sieved'; valueBoolean: boolean },
    { url: 'depletion-risk-minerals'; valueString: string },
    { url: 'p-value'; valueDecimal: number }
  ];
}

/**
 * FHIR R4 Extension: Cannabinoid Cytoskeletal Microtubule Stabilization
 */
export interface IFhirCannabinoidMicrotubuleExtension {
  url: 'http://pocketgull.app/fhir/StructureDefinition/cannabinoid-microtubule-stabilization';
  extension: [
    { url: 'compound'; valueString: string },
    { url: 'dose-micro-molar'; valueDecimal: number },
    { url: 'tubulin-acetylation-ratio'; valueDecimal: number },
    { url: 'catastrophe-reduction-percent'; valueDecimal: number },
    { url: 'gsk3-beta-inhibition-percent'; valueDecimal: number },
    { url: 'is-stabilization-falsified'; valueBoolean: boolean },
    { url: 'p-value'; valueDecimal: number }
  ];
}

/**
 * FHIR R4 Extension: Grounded Clinical Assertion & Anti-Confirmation Bias Falsification Envelope
 */
export interface IFhirGroundedAssertionExtension {
  url: 'http://pocketgull.app/fhir/StructureDefinition/grounded-clinical-assertion';
  extension: [
    { url: 'hypothesis'; valueString: string },
    { url: 'null-hypothesis-h0'; valueString: string },
    { url: 'p-value'; valueDecimal: number },
    { url: 'is-falsified'; valueBoolean: boolean },
    { url: 'epistemic-confidence-percent'; valueInteger: number },
    { url: 'cochrane-rob2'; valueString: string },
    { url: 'evidence-tier'; valueString: string },
    { url: 'counter-hypotheses'; valueString: string },
    { url: 'disconfirming-physical-exams'; valueString: string },
    { url: 'red-flag-exceptions'; valueString: string },
    { url: 'statutory-attestation'; valueString: string }
  ];
}

/**
 * FHIR R4 Extension: NSF Open Knowledge Network (NSF OKN) Federated Provenance
 */
export interface IFhirOknProvenanceExtension {
  url: 'http://pocketgull.app/fhir/StructureDefinition/okn-provenance';
  extension: [
    { url: 'is-verified'; valueBoolean: boolean },
    { url: 'badge-label'; valueString: string },
    { url: 'participating-agencies'; valueString: string },
    { url: 'traversed-path-summary'; valueString: string },
    { url: 'grounded-target-concept'; valueString: string },
    { url: 'evidence-tier'; valueString: string },
    { url: 'audit-trail-hash'; valueString: string },
    { url: 'pmid-or-doi-citation'; valueString: string }
  ];
}

/**
 * Builds a standardized FHIR R4 extension for NSF OKN Federated Cross-Graph Provenance.
 */
export function buildFhirOknProvenanceExtension(
  isVerified: boolean,
  badgeLabel: string,
  agencies: string[],
  pathSummary: string,
  targetConcept: string,
  evidenceTier: string,
  auditHash: string,
  citation: string = 'https://okn.us'
): IFhirOknProvenanceExtension {
  return {
    url: 'http://pocketgull.app/fhir/StructureDefinition/okn-provenance',
    extension: [
      { url: 'is-verified', valueBoolean: isVerified },
      { url: 'badge-label', valueString: badgeLabel },
      { url: 'participating-agencies', valueString: agencies.join(' + ') },
      { url: 'traversed-path-summary', valueString: pathSummary },
      { url: 'grounded-target-concept', valueString: targetConcept },
      { url: 'evidence-tier', valueString: evidenceTier },
      { url: 'audit-trail-hash', valueString: auditHash },
      { url: 'pmid-or-doi-citation', valueString: citation }
    ]
  };
}


/**
 * FHIR R4 Extension: Clinical Fallacy & Cognitive Bias Audit
 */
export interface IFhirClinicalFallacyAuditExtension {
  url: 'http://pocketgull.app/fhir/StructureDefinition/clinical-fallacy-audit';
  extension: [
    { url: 'has-detected-fallacy'; valueBoolean: boolean },
    { url: 'detected-fallacies-count'; valueInteger: number },
    { url: 'primary-fallacy-id'; valueString: string },
    { url: 'positive-predictive-value-percent'; valueDecimal: number },
    { url: 'overall-verdict'; valueString: string }
  ];
}


export interface IFhirProvenancePart11 {
  resourceType: 'Provenance';
  id: string;
  target: Array<{ reference: string; display?: string }>;
  recorded: string;
  activity: {
    coding: Array<{
      system: 'http://terminology.hl7.org/CodeSystem/v3-DataOperation';
      code: string;
      display: string;
    }>;
    text: string;
  };
  agent: Array<{
    type: {
      coding: Array<{
        system: 'http://terminology.hl7.org/CodeSystem/provenance-participant-type';
        code: string;
        display: string;
      }>;
    };
    who: {
      display: string;
      identifier?: {
        system: string;
        value: string;
      };
    };
  }>;
  signature: Array<{
    type: Array<{
      system: 'urn:iso-astm:E1762-95:2013';
      code: string;
      display: string;
    }>;
    when: string;
    who: {
      display: string;
    };
    sigFormat: string;
    data: string; // Base64 encoded SHA-256 integrity seal
    extension?: Array<{
      url: string;
      valueString: string;
    }>;
  }>;
}

/**
 * WHO ICD-11 Chapter 26 (Traditional Medicine Conditions - Module 1 / TM1)
 * Standardized dual-coding ontology for Ayurvedic and TCM clinical patterns.
 */
export interface ITraditionalMedicineCoding {
  system: 'http://id.who.int/icd/release/11/mms/tm1';
  code: string; // e.g. 'SF50' (Liver Yang Rising), 'SF81' (Pitta Aggravation)
  display: string;
  traditionalParadigm: 'TCM' | 'Ayurveda';
  constitutionalPattern: string; // Zheng (TCM) or Vikriti (Ayurveda)
  correspondingWesternIcd10: {
    code: string;
    display: string;
  };
}

export interface IFhirTraditionalMedicineDualCodingExtension {
  url: 'http://pocketgull.app/fhir/StructureDefinition/traditional-medicine-tm1';
  extension: [
    { url: 'who-icd11-tm1-code'; valueString: string },
    { url: 'who-icd11-tm1-display'; valueString: string },
    { url: 'traditional-paradigm'; valueString: string },
    { url: 'constitutional-pattern'; valueString: string },
    { url: 'corresponding-western-icd10'; valueString: string },
    { url: 'consilience-concordance-score'; valueDecimal: number }
  ];
}

/**
 * Canonical dictionary of WHO ICD-11 Chapter 26 (TM1) dual-codings
 */
export const WHO_ICD11_TM1_CATALOG: Record<string, ITraditionalMedicineCoding> = {
  LIVER_YANG_RISING: {
    system: 'http://id.who.int/icd/release/11/mms/tm1',
    code: 'SF50',
    display: 'Liver Yang Rising Pattern',
    traditionalParadigm: 'TCM',
    constitutionalPattern: 'Liver/Gallbladder Hyperactivity Zheng',
    correspondingWesternIcd10: { code: 'I10', display: 'Essential (primary) hypertension' }
  },
  LIVER_QI_STAGNATION: {
    system: 'http://id.who.int/icd/release/11/mms/tm1',
    code: 'SF51',
    display: 'Liver Qi Stagnation Pattern',
    traditionalParadigm: 'TCM',
    constitutionalPattern: 'Qi Stagnation with Epigastric/Hypochondriac Tension',
    correspondingWesternIcd10: { code: 'F41.1', display: 'Generalized anxiety disorder' }
  },
  KIDNEY_YIN_DEFICIENCY: {
    system: 'http://id.who.int/icd/release/11/mms/tm1',
    code: 'SF52',
    display: 'Kidney Yin Deficiency Pattern',
    traditionalParadigm: 'TCM',
    constitutionalPattern: 'Essence (Jing) Depletion & Internal Deficiency Heat',
    correspondingWesternIcd10: { code: 'E11.9', display: 'Type 2 diabetes mellitus without complications' }
  },
  VATA_AGGRAVATION: {
    system: 'http://id.who.int/icd/release/11/mms/tm1',
    code: 'SF80',
    display: 'Vata Aggravation Pattern',
    traditionalParadigm: 'Ayurveda',
    constitutionalPattern: 'Prana/Vyana Vata Neuro-Axonal Hyperreactivity',
    correspondingWesternIcd10: { code: 'G90.9', display: 'Disorder of autonomic nervous system, unspecified' }
  },
  PITTA_AGGRAVATION: {
    system: 'http://id.who.int/icd/release/11/mms/tm1',
    code: 'SF81',
    display: 'Pitta Aggravation Pattern',
    traditionalParadigm: 'Ayurveda',
    constitutionalPattern: 'Pachaka/Ranjaka Pitta Inflammatory Heat & Acidosis',
    correspondingWesternIcd10: { code: 'K21.9', display: 'Gastro-esophageal reflux disease without esophagitis' }
  },
  KAPHA_ACCUMULATION: {
    system: 'http://id.who.int/icd/release/11/mms/tm1',
    code: 'SF82',
    display: 'Kapha Accumulation Pattern',
    traditionalParadigm: 'Ayurveda',
    constitutionalPattern: 'Kledaka Kapha Sluggishness & Meda Dhatu Stasis',
    correspondingWesternIcd10: { code: 'E88.81', display: 'Metabolic syndrome' }
  }
};

/**
 * Builds a standardized FHIR R4 extension for WHO ICD-11 Chapter 26 (TM1) dual coding.
 */
export function buildFhirTm1DualCodingExtension(
  coding: ITraditionalMedicineCoding,
  concordanceScore: number = 0.92
): IFhirTraditionalMedicineDualCodingExtension {
  return {
    url: 'http://pocketgull.app/fhir/StructureDefinition/traditional-medicine-tm1',
    extension: [
      { url: 'who-icd11-tm1-code', valueString: coding.code },
      { url: 'who-icd11-tm1-display', valueString: coding.display },
      { url: 'traditional-paradigm', valueString: coding.traditionalParadigm },
      { url: 'constitutional-pattern', valueString: coding.constitutionalPattern },
      { url: 'corresponding-western-icd10', valueString: `${coding.correspondingWesternIcd10.code} - ${coding.correspondingWesternIcd10.display}` },
      { url: 'consilience-concordance-score', valueDecimal: concordanceScore }
    ]
  };
}

