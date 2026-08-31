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
