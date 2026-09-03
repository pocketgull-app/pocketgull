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
 * Unified Biophysical Epistemic Falsification Bundle Extension
 */
export interface IFhirBiophysicalFalsificationExtension {
  url: 'http://pocketgull.app/fhir/StructureDefinition/biophysical-falsification-suite';
  extension: (
    | IFhirProtacHookExtension
    | IFhirLlpsPhaseBoundaryExtension
    | IFhirQuantumThermalNoiseExtension
    | IFhirQuantumDualSpinExtension
    | IFhirReticularPoreSieveExtension
    | IFhirCannabinoidMicrotubuleExtension
  )[];
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
