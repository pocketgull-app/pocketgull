import { Injectable } from '@angular/core';

export interface ISnomedConceptMapping {
  snomedCode: string;
  snomedTerm: string;
  icd10Code: string;
  icd10Title: string;
  cptCodes: string[];
  loincCode?: string;
  rxNormCui?: string;
  hedisMeasureId?: string;
  semanticEquivalence: 'exact' | 'narrower' | 'broader';
  mappingConfidence: number; // 0.0 to 1.0
}

export interface ISnomedCrosswalkResult {
  snomedCode: string;
  mapping: ISnomedConceptMapping | null;
  recommendedCptProcedures: { cptCode: string; description: string }[];
  uscdiv4CompliantPayload: {
    system: 'http://snomed.info/sct';
    code: string;
    display: string;
    icd10Crosswalk: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SnomedIcdCrosswalkService {

  // Authoritative USCDI v4 SNOMED CT to ICD-10-CM & CPT/LOINC Crosswalk Registry
  private readonly crosswalkRegistry: Record<string, ISnomedConceptMapping> = {
    '26929004': { // Alzheimer's disease
      snomedCode: '26929004',
      snomedTerm: "Alzheimer's disease",
      icd10Code: 'G30.9',
      icd10Title: "Alzheimer's disease, unspecified",
      cptCodes: ['70553', '96132'], // Brain MRI, Neuropsychological testing
      loincCode: '102607-9', // Amyloid beta 42/40 ratio
      rxNormCui: '35208', // Donepezil
      hedisMeasureId: 'COL',
      semanticEquivalence: 'exact',
      mappingConfidence: 0.99
    },
    '49049000': { // Parkinson's disease
      snomedCode: '49049000',
      snomedTerm: "Parkinson's disease",
      icd10Code: 'G20',
      icd10Title: "Parkinson's disease",
      cptCodes: ['78607', '99454'], // DaTscan SPECT, RPM transmission
      loincCode: '96540-1', // Alpha-synuclein assay
      rxNormCui: '205461', // Levodopa/Carbidopa
      hedisMeasureId: 'MAH',
      semanticEquivalence: 'exact',
      mappingConfidence: 0.99
    },
    '372130007': { // Malignant neoplasm of head of pancreas
      snomedCode: '372130007',
      snomedTerm: 'Malignant neoplasm of head of pancreas',
      icd10Code: 'C25.0',
      icd10Title: 'Malignant neoplasm of head of pancreas',
      cptCodes: ['74177', '48150'], // Abdominal CT, Whipple procedure
      loincCode: '1989-3', // CA 19-9
      rxNormCui: '1256', // Gemcitabine
      semanticEquivalence: 'exact',
      mappingConfidence: 0.98
    },
    '38341003': { // Essential hypertension
      snomedCode: '38341003',
      snomedTerm: 'Essential hypertension',
      icd10Code: 'I10',
      icd10Title: 'Essential (primary) hypertension',
      cptCodes: ['99453', '99454', '99457'], // RPM Initial & Monthly CPTs
      hedisMeasureId: 'CBP',
      semanticEquivalence: 'exact',
      mappingConfidence: 1.00
    },
    '73211009': { // Diabetes mellitus
      snomedCode: '73211009',
      snomedTerm: 'Diabetes mellitus',
      icd10Code: 'E11.9',
      icd10Title: 'Type 2 diabetes mellitus without complications',
      cptCodes: ['99454', '99490'], // RPM & CCM CPTs
      loincCode: '4548-4', // HbA1c
      hedisMeasureId: 'HBD',
      semanticEquivalence: 'broader',
      mappingConfidence: 0.95
    }
  };

  /**
   * Cross-walks a SNOMED CT concept code to ICD-10-CM, CPT, LOINC, and USCDI v4 payload.
   */
  public crosswalkSnomedToIcd10(snomedCode: string): ISnomedCrosswalkResult {
    const mapping = this.crosswalkRegistry[snomedCode] || null;

    const recommendedCptProcedures = mapping ? mapping.cptCodes.map(code => ({
      cptCode: code,
      description: this.getCptDescription(code)
    })) : [];

    return {
      snomedCode,
      mapping,
      recommendedCptProcedures,
      uscdiv4CompliantPayload: {
        system: 'http://snomed.info/sct',
        code: snomedCode,
        display: mapping ? mapping.snomedTerm : 'Unmapped SNOMED Term',
        icd10Crosswalk: mapping ? mapping.icd10Code : 'Unmapped'
      }
    };
  }

  /**
   * Look up description for standard CPT codes.
   */
  private getCptDescription(cptCode: string): string {
    const cptMap: Record<string, string> = {
      '70553': 'Brain MRI with and without contrast',
      '78607': 'DaTscan Dopamine Transporter SPECT Imaging',
      '74177': 'Abdominal CT scan with contrast',
      '96132': 'Neuropsychological evaluation (first hour)',
      '99453': 'RPM Initial setup & patient education',
      '99454': 'RPM Monthly device transmission (16+ days)',
      '99457': 'RPM Clinical management time (first 20 mins)',
      '99490': 'Chronic Care Management (20 mins/month)',
      '48150': 'Pancreaticoduodenectomy (Whipple Procedure)'
    };
    return cptMap[cptCode] || `CPT ${cptCode} Procedure`;
  }
}
