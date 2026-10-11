import { Injectable } from '@angular/core';

/**
 * Canonical SNOMED CT clinical terminology descriptor.
 */
export interface ISnomedConcept {
  sctid: string;
  display: string;
}

/**
 * Canonical RxNorm / WHO EML descriptor.
 */
export interface IRxNormConcept {
  rxcui: string;
  display: string;
}

/**
 * Standard HL7 FHIR R4 Resource interface for clinical auto-tagging.
 */
export interface IFhirR4BundleEntry {
  resource: {
    resourceType: 'Condition' | 'MedicationRequest';
    clinicalStatus?: { coding: Array<{ system: string; code: string }> };
    verificationStatus?: { coding: Array<{ system: string; code: string }> };
    code?: {
      coding: Array<{ system: string; code: string; display: string }>;
      text: string;
    };
    medicationCodeableConcept?: {
      coding: Array<{ system: string; code: string; display: string }>;
      text: string;
    };
    subject: { reference: string };
    recordedDate?: string;
    authoredOn?: string;
    status?: string;
    intent?: string;
  };
}

export interface IFhirR4Bundle {
  resourceType: 'Bundle';
  type: 'collection';
  timestamp: string;
  entry: IFhirR4BundleEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class SovereignFhirTaggerService {
  /**
   * Canonical Clinical SNOMED CT Mappings for Sovereign Triage
   */
  readonly snomedMappings: Record<string, ISnomedConcept> = {
    'tuberculosis': { sctid: '56717001', display: 'Tuberculosis (disorder)' },
    'myocardial infarction': { sctid: '22298006', display: 'Myocardial infarction (disorder)' },
    'pre-eclampsia': { sctid: '398254007', display: 'Severe pre-eclampsia (disorder)' },
    'eclampsia': { sctid: '398254007', display: 'Severe pre-eclampsia (disorder)' },
    'severe acute malnutrition': { sctid: '238108007', display: 'Severe protein-calorie malnutrition (disorder)' },
    'malnutrition': { sctid: '238108007', display: 'Severe protein-calorie malnutrition (disorder)' },
    'snakebite': { sctid: '242630006', display: 'Toxic effect of venom of snake (disorder)' },
    'cholera': { sctid: '63650001', display: 'Cholera (disorder)' },
    'visceral leishmaniasis': { sctid: '186788009', display: 'Visceral leishmaniasis (disorder)' },
    'kala-azar': { sctid: '186788009', display: 'Visceral leishmaniasis (disorder)' },
    'hypertension': { sctid: '59621000', display: 'Essential hypertension (disorder)' },
    'pre-diabetes': { sctid: '9414007', display: 'Impaired glucose tolerance (disorder)' },
    'panic': { sctid: '371631005', display: 'Panic disorder (disorder)' },
    'anxiety': { sctid: '197480006', display: 'Generalized anxiety disorder (disorder)' }
  };

  /**
   * Canonical RxNorm & WHO Model List of Essential Medicines Mappings
   */
  readonly rxNormMappings: Record<string, IRxNormConcept> = {
    'magnesium sulfate': { rxcui: '6656', display: 'Magnesium Sulfate Injectable' },
    'artesunate': { rxcui: '259461', display: 'Artesunate' },
    'zinc': { rxcui: '11425', display: 'Zinc Supplement' },
    'ringer': { rxcui: '313002', display: "Ringer's Lactate Solution" },
    'amoxicillin': { rxcui: '723', display: 'Amoxicillin Oral' }
  };

  /**
   * Parses narrative clinical text, SOAP notes, or agent debate outputs and
   * constructs a fully compliant HL7 FHIR R4 Bundle.
   */
  extractEntitiesAndBuildFhir(text: string, patientId: string = 'POCKETGULL-ANON'): IFhirR4Bundle {
    const nowUtc = new Date().toISOString();
    const textLower = text.toLowerCase();
    const entries: IFhirR4BundleEntry[] = [];

    // 1. Condition Matching (SNOMED CT)
    for (const [term, data] of Object.entries(this.snomedMappings)) {
      if (textLower.includes(term)) {
        entries.push({
          resource: {
            resourceType: 'Condition',
            clinicalStatus: {
              coding: [{
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'active'
              }]
            },
            verificationStatus: {
              coding: [{
                system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
                code: 'confirmed'
              }]
            },
            code: {
              coding: [{
                system: 'http://snomed.info/sct',
                code: data.sctid,
                display: data.display
              }],
              text: data.display
            },
            subject: { reference: `Patient/${patientId}` },
            recordedDate: nowUtc
          }
        });
      }
    }

    // 2. MedicationRequest Matching (RxNorm / WHO EML)
    for (const [med, data] of Object.entries(this.rxNormMappings)) {
      if (textLower.includes(med)) {
        entries.push({
          resource: {
            resourceType: 'MedicationRequest',
            status: 'active',
            intent: 'order',
            medicationCodeableConcept: {
              coding: [{
                system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
                code: data.rxcui,
                display: data.display
              }],
              text: data.display
            },
            subject: { reference: `Patient/${patientId}` },
            authoredOn: nowUtc
          }
        });
      }
    }

    return {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: nowUtc,
      entry: entries
    };
  }
}
