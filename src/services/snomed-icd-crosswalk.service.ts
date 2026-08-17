import { Injectable } from '@angular/core';

export interface ISnomedConceptMapping {
  snomedCode: string;
  snomedTerm: string;
  icd10Code: string;
  icd10Title: string;
  cptCodes: string[];
  hccCategory?: string;
  rafWeight?: number;
  loincCode?: string;
  loincName?: string;
  rxNormCui?: string;
  rxNormName?: string;
  hedisMeasureId?: string;
  category: 'Cardiovascular' | 'Endocrine & Metabolic' | 'Neurology & Mental Health' | 'Pulmonary' | 'Renal' | 'Oncology' | 'Musculoskeletal' | 'Social Determinants of Health';
  semanticEquivalence: 'exact' | 'narrower' | 'broader';
  mappingConfidence: number; // 0.0 to 1.0
}

export interface ISnomedCrosswalkResult {
  snomedCode: string;
  mapping: ISnomedConceptMapping | null;
  recommendedCptProcedures: { cptCode: string; description: string; workRvu?: number; estimatedPayment?: number }[];
  uscdiv4CompliantPayload: {
    system: 'http://snomed.info/sct';
    code: string;
    display: string;
    icd10Crosswalk: string;
  };
}

export interface IExtractedConceptMatch {
  matchedTerm: string;
  concept: ISnomedCrosswalkResult;
  evidenceQuote: string;
  confidence: number;
}

@Injectable({
  providedIn: 'root'
})
export class SnomedIcdCrosswalkService {

  // Authoritative USCDI v4 SNOMED CT to ICD-10-CM, CPT, CMS-HCC V28, and LOINC Crosswalk Registry
  private readonly crosswalkRegistry: Record<string, ISnomedConceptMapping> = {
    // 1. Cardiovascular
    '38341003': {
      snomedCode: '38341003',
      snomedTerm: 'Essential hypertension',
      icd10Code: 'I10',
      icd10Title: 'Essential (primary) hypertension',
      cptCodes: ['99453', '99454', '99457'],
      loincCode: '8480-6',
      loincName: 'Systolic blood pressure',
      rxNormCui: '6918',
      rxNormName: 'Lisinopril',
      hedisMeasureId: 'CBP',
      category: 'Cardiovascular',
      semanticEquivalence: 'exact',
      mappingConfidence: 1.00
    },
    '88805009': {
      snomedCode: '88805009',
      snomedTerm: 'Chronic systolic heart failure',
      icd10Code: 'I50.22',
      icd10Title: 'Chronic systolic (congestive) heart failure',
      cptCodes: ['93306', '99454', '99490'],
      hccCategory: 'HCC 226 (Heart Failure, Congestive)',
      rafWeight: 0.368,
      loincCode: '30934-4',
      loincName: 'BNP (B-type natriuretic peptide)',
      rxNormCui: '866414',
      rxNormName: 'Sacubitril / Valsartan (Entresto)',
      category: 'Cardiovascular',
      semanticEquivalence: 'exact',
      mappingConfidence: 0.99
    },
    '49436004': {
      snomedCode: '49436004',
      snomedTerm: 'Atrial fibrillation',
      icd10Code: 'I48.91',
      icd10Title: 'Unspecified atrial fibrillation',
      cptCodes: ['93000', '93224', '99454'],
      hccCategory: 'HCC 238 (Arrhythmias, Specified Cardiac)',
      rafWeight: 0.264,
      loincCode: '59284-0',
      loincName: 'Atrial fibrillation occurrence',
      rxNormCui: '1364430',
      rxNormName: 'Apixaban (Eliquis)',
      category: 'Cardiovascular',
      semanticEquivalence: 'exact',
      mappingConfidence: 0.98
    },
    '53741008': {
      snomedCode: '53741008',
      snomedTerm: 'Coronary arteriosclerosis',
      icd10Code: 'I25.10',
      icd10Title: 'Atherosclerotic heart disease of native coronary artery without angina pectoris',
      cptCodes: ['93458', '75574', '99490'],
      hccCategory: 'HCC 226 (Coronary Atherosclerosis)',
      rafWeight: 0.142,
      loincCode: '2093-3',
      loincName: 'Total Cholesterol',
      rxNormCui: '83367',
      rxNormName: 'Atorvastatin',
      category: 'Cardiovascular',
      semanticEquivalence: 'exact',
      mappingConfidence: 0.97
    },

    // 2. Endocrine & Metabolic
    '73211009': {
      snomedCode: '73211009',
      snomedTerm: 'Diabetes mellitus',
      icd10Code: 'E11.9',
      icd10Title: 'Type 2 diabetes mellitus without complications',
      cptCodes: ['99454', '99490'],
      hccCategory: 'HCC 38 (Diabetes without Complication)',
      rafWeight: 0.105,
      loincCode: '4548-4',
      loincName: 'Hemoglobin A1c / Total Hgb',
      rxNormCui: '860975',
      rxNormName: 'Metformin HCl',
      hedisMeasureId: 'HBD',
      category: 'Endocrine & Metabolic',
      semanticEquivalence: 'broader',
      mappingConfidence: 0.95
    },
    '44054006': {
      snomedCode: '44054006',
      snomedTerm: 'Type 2 diabetes mellitus with diabetic neuropathy',
      icd10Code: 'E11.40',
      icd10Title: 'Type 2 diabetes mellitus with diabetic neuropathy, unspecified',
      cptCodes: ['95907', '99490'],
      hccCategory: 'HCC 37 (Diabetes with Chronic Complications)',
      rafWeight: 0.302,
      loincCode: '4548-4',
      loincName: 'Hemoglobin A1c',
      rxNormCui: '860975',
      rxNormName: 'Metformin',
      category: 'Endocrine & Metabolic',
      semanticEquivalence: 'exact',
      mappingConfidence: 0.99
    },
    '127013003': {
      snomedCode: '127013003',
      snomedTerm: 'Diabetic nephropathy',
      icd10Code: 'E11.22',
      icd10Title: 'Type 2 diabetes mellitus with diabetic chronic kidney disease',
      cptCodes: ['99490', '99454'],
      hccCategory: 'HCC 37 (Diabetes with Chronic Complications)',
      rafWeight: 0.302,
      loincCode: '14959-1',
      loincName: 'Microalbumin/Creatinine ratio in urine',
      category: 'Endocrine & Metabolic',
      semanticEquivalence: 'exact',
      mappingConfidence: 0.98
    },
    '238131007': {
      snomedCode: '238131007',
      snomedTerm: 'Morbid obesity',
      icd10Code: 'E66.01',
      icd10Title: 'Morbid (severe) obesity due to excess calories',
      cptCodes: ['97802', '97803'],
      hccCategory: 'HCC 48 (Morbid Obesity)',
      rafWeight: 0.250,
      loincCode: '39156-5',
      loincName: 'Body mass index (BMI)',
      category: 'Endocrine & Metabolic',
      semanticEquivalence: 'exact',
      mappingConfidence: 0.98
    },

    // 3. Neurology & Mental Health
    '26929004': {
      snomedCode: '26929004',
      snomedTerm: "Alzheimer's disease",
      icd10Code: 'G30.9',
      icd10Title: "Alzheimer's disease, unspecified",
      cptCodes: ['70553', '96132'],
      hccCategory: 'HCC 138 (Dementia with Neurological Manifestations)',
      rafWeight: 0.412,
      loincCode: '102607-9',
      loincName: 'Amyloid beta 42/40 ratio',
      rxNormCui: '35208',
      rxNormName: 'Donepezil',
      hedisMeasureId: 'COL',
      category: 'Neurology & Mental Health',
      semanticEquivalence: 'exact',
      mappingConfidence: 0.99
    },
    '49049000': {
      snomedCode: '49049000',
      snomedTerm: "Parkinson's disease",
      icd10Code: 'G20',
      icd10Title: "Parkinson's disease",
      cptCodes: ['78607', '99454'],
      hccCategory: 'HCC 190 (Parkinson and Huntington Diseases)',
      rafWeight: 0.442,
      loincCode: '96540-1',
      loincName: 'Alpha-synuclein seed amplification assay',
      rxNormCui: '205461',
      rxNormName: 'Levodopa / Carbidopa',
      hedisMeasureId: 'MAH',
      category: 'Neurology & Mental Health',
      semanticEquivalence: 'exact',
      mappingConfidence: 0.99
    },
    '370143000': {
      snomedCode: '370143000',
      snomedTerm: 'Major depressive disorder',
      icd10Code: 'F33.1',
      icd10Title: 'Major depressive disorder, recurrent, moderate',
      cptCodes: ['96127', '90834'],
      hccCategory: 'HCC 154 (Major Depression and Bipolar Disorders)',
      rafWeight: 0.309,
      loincCode: '89208-3',
      loincName: 'PHQ-9 total score',
      rxNormCui: '36437',
      rxNormName: 'Sertraline',
      category: 'Neurology & Mental Health',
      semanticEquivalence: 'exact',
      mappingConfidence: 0.97
    },
    '21897009': {
      snomedCode: '21897009',
      snomedTerm: 'Generalized anxiety disorder',
      icd10Code: 'F41.1',
      icd10Title: 'Generalized anxiety disorder',
      cptCodes: ['96127', '90832'],
      loincCode: '69725-0',
      loincName: 'GAD-7 total score',
      rxNormCui: '32968',
      rxNormName: 'Escitalopram',
      category: 'Neurology & Mental Health',
      semanticEquivalence: 'exact',
      mappingConfidence: 0.99
    },

    // 4. Pulmonary & Renal
    '13645005': {
      snomedCode: '13645005',
      snomedTerm: 'Chronic obstructive pulmonary disease',
      icd10Code: 'J44.1',
      icd10Title: 'Chronic obstructive pulmonary disease with (acute) exacerbation',
      cptCodes: ['94010', '94664', '99454'],
      hccCategory: 'HCC 280 (Chronic Obstructive Pulmonary Disease)',
      rafWeight: 0.335,
      loincCode: '19926-5',
      loincName: 'FEV1/FVC ratio',
      rxNormCui: '896006',
      rxNormName: 'Fluticasone / Vilanterol',
      category: 'Pulmonary',
      semanticEquivalence: 'exact',
      mappingConfidence: 0.98
    },
    '433146000': {
      snomedCode: '433146000',
      snomedTerm: 'Chronic kidney disease stage 4',
      icd10Code: 'N18.4',
      icd10Title: 'Chronic kidney disease, stage 4 (severe)',
      cptCodes: ['99490', '99454'],
      hccCategory: 'HCC 327 (Chronic Kidney Disease, Stage 4)',
      rafWeight: 0.288,
      loincCode: '33914-3',
      loincName: 'Estimated Glomerular Filtration Rate (eGFR)',
      category: 'Renal',
      semanticEquivalence: 'exact',
      mappingConfidence: 0.99
    },
    '433144002': {
      snomedCode: '433144002',
      snomedTerm: 'Chronic kidney disease stage 3',
      icd10Code: 'N18.30',
      icd10Title: 'Chronic kidney disease, stage 3 unspecified',
      cptCodes: ['99490'],
      hccCategory: 'HCC 328 (Chronic Kidney Disease, Stage 3)',
      rafWeight: 0.071,
      loincCode: '33914-3',
      loincName: 'eGFR CKD-EPI',
      category: 'Renal',
      semanticEquivalence: 'exact',
      mappingConfidence: 0.97
    },

    // 5. Oncology & Musculoskeletal
    '372130007': {
      snomedCode: '372130007',
      snomedTerm: 'Malignant neoplasm of head of pancreas',
      icd10Code: 'C25.0',
      icd10Title: 'Malignant neoplasm of head of pancreas',
      cptCodes: ['74177', '48150'],
      hccCategory: 'HCC 21 (Pancreatic and Other Digestive Cancer)',
      rafWeight: 1.340,
      loincCode: '1989-3',
      loincName: 'CA 19-9 tumor marker',
      rxNormCui: '1256',
      rxNormName: 'Gemcitabine',
      category: 'Oncology',
      semanticEquivalence: 'exact',
      mappingConfidence: 0.98
    },
    '254837009': {
      snomedCode: '254837009',
      snomedTerm: 'Malignant neoplasm of breast',
      icd10Code: 'C50.919',
      icd10Title: 'Malignant neoplasm of unspecified site of unspecified female breast',
      cptCodes: ['77067', '19301'],
      hccCategory: 'HCC 22 (Breast, Prostate, and Other Cancers)',
      rafWeight: 0.485,
      loincCode: '85337-4',
      loincName: 'HER2 gene amplification',
      category: 'Oncology',
      semanticEquivalence: 'exact',
      mappingConfidence: 0.97
    },
    '239873007': {
      snomedCode: '239873007',
      snomedTerm: 'Osteoarthritis of knee',
      icd10Code: 'M17.11',
      icd10Title: 'Primary osteoarthritis, right knee',
      cptCodes: ['73560', '20610'],
      category: 'Musculoskeletal',
      semanticEquivalence: 'exact',
      mappingConfidence: 0.96
    },

    // 6. Social Determinants of Health (SDOH Z-Codes)
    '733423003': {
      snomedCode: '733423003',
      snomedTerm: 'Food insecurity',
      icd10Code: 'Z59.41',
      icd10Title: 'Food insecurity',
      cptCodes: ['99401'],
      category: 'Social Determinants of Health',
      semanticEquivalence: 'exact',
      mappingConfidence: 1.00
    },
    '713458007': {
      snomedCode: '713458007',
      snomedTerm: 'Lack of access to transportation',
      icd10Code: 'Z59.82',
      icd10Title: 'Transportation insecurity',
      cptCodes: ['99401'],
      category: 'Social Determinants of Health',
      semanticEquivalence: 'exact',
      mappingConfidence: 1.00
    },
    '224224007': {
      snomedCode: '224224007',
      snomedTerm: 'Homelessness',
      icd10Code: 'Z59.01',
      icd10Title: 'Sheltered homelessness',
      cptCodes: ['99401'],
      category: 'Social Determinants of Health',
      semanticEquivalence: 'exact',
      mappingConfidence: 1.00
    }
  };

  /**
   * Cross-walks a SNOMED CT concept code to ICD-10-CM, CPT, LOINC, and USCDI v4 payload.
   */
  public crosswalkSnomedToIcd10(snomedCode: string): ISnomedCrosswalkResult {
    const mapping = this.crosswalkRegistry[snomedCode] || null;

    const recommendedCptProcedures = mapping ? mapping.cptCodes.map(code => ({
      cptCode: code,
      description: this.getCptDescription(code),
      workRvu: this.getCptWorkRvu(code),
      estimatedPayment: this.getCptEstimatedPayment(code)
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
   * Reverse crosswalk from ICD-10-CM code to SNOMED-CT concept.
   */
  public crosswalkIcd10ToSnomed(icd10Code: string): ISnomedCrosswalkResult | null {
    const cleanIcd = icd10Code.trim().toUpperCase();
    const entry = Object.values(this.crosswalkRegistry).find(
      m => m.icd10Code.toUpperCase() === cleanIcd || m.icd10Code.replace('.', '') === cleanIcd.replace('.', '')
    );
    if (!entry) return null;
    return this.crosswalkSnomedToIcd10(entry.snomedCode);
  }

  /**
   * Searches concept registry by term, description, or code.
   */
  public searchByTerm(query: string): ISnomedCrosswalkResult[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return Object.values(this.crosswalkRegistry)
      .filter(m => 
        m.snomedTerm.toLowerCase().includes(q) ||
        m.icd10Title.toLowerCase().includes(q) ||
        m.icd10Code.toLowerCase().includes(q) ||
        m.snomedCode.includes(q) ||
        (m.hccCategory && m.hccCategory.toLowerCase().includes(q))
      )
      .map(m => this.crosswalkSnomedToIcd10(m.snomedCode));
  }

  /**
   * Automatically extracts and crosswalks clinical entities from ambient dialogue or chart narrative.
   */
  public autoExtractAndCrosswalk(text: string): IExtractedConceptMatch[] {
    const lower = text.toLowerCase();
    const matches: IExtractedConceptMatch[] = [];

    const keywordRules: { keywords: string[]; snomedCode: string }[] = [
      { keywords: ['alzheimer', 'memory loss', 'cognitive decline', 'amyloid', 'donepezil'], snomedCode: '26929004' },
      { keywords: ['parkinson', 'resting tremor', 'cogwheel rigidity', 'levodopa', 'datscan'], snomedCode: '49049000' },
      { keywords: ['pancreatic cancer', 'pancreas mass', 'ca 19-9', 'whipple', 'c25.0'], snomedCode: '372130007' },
      { keywords: ['hypertension', 'elevated blood pressure', 'sbp', 'antihypertensive', 'i10'], snomedCode: '38341003' },
      { keywords: ['diabetic neuropathy', 'neuropathy', 'numbness and tingling'], snomedCode: '44054006' },
      { keywords: ['diabetes', 'dm2', 't2dm', 'hyperglycemia', 'hba1c'], snomedCode: '73211009' },
      { keywords: ['heart failure', 'chf', 'hfref', 'systolic heart failure', 'lvef', 'ejection fraction'], snomedCode: '88805009' },
      { keywords: ['atrial fibrillation', 'afib', 'a-fib', 'irregular pulse', 'apixaban'], snomedCode: '49436004' },
      { keywords: ['coronary artery disease', 'cad', 'arteriosclerosis', 'statin', 'angina'], snomedCode: '53741008' },
      { keywords: ['morbid obesity', 'severe obesity', 'bmi 40', 'bmi > 40'], snomedCode: '238131007' },
      { keywords: ['major depression', 'mdd', 'depressive disorder', 'phq-9'], snomedCode: '370143000' },
      { keywords: ['generalized anxiety', 'gad', 'anxiety disorder', 'gad-7'], snomedCode: '21897009' },
      { keywords: ['copd', 'chronic obstructive', 'emphysema', 'spirometry'], snomedCode: '13645005' },
      { keywords: ['ckd stage 4', 'chronic kidney disease stage 4', 'egfr 2', 'egfr < 30'], snomedCode: '433146000' },
      { keywords: ['ckd stage 3', 'chronic kidney disease stage 3', 'egfr 4', 'egfr 5'], snomedCode: '433144002' },
      { keywords: ['breast cancer', 'breast neoplasm', 'mammography', 'c50'], snomedCode: '254837009' },
      { keywords: ['osteoarthritis', 'knee pain', 'knee arthritis', 'joint injection'], snomedCode: '239873007' },
      { keywords: ['food insecurity', 'food bank', 'cannot afford groceries'], snomedCode: '733423003' },
      { keywords: ['transportation insecurity', 'no transportation', 'missed ride'], snomedCode: '713458007' },
      { keywords: ['homeless', 'sheltered homelessness', 'housing instability'], snomedCode: '224224007' }
    ];

    const matchedCodes = new Set<string>();

    for (const rule of keywordRules) {
      if (matchedCodes.has(rule.snomedCode)) continue;
      
      const foundKeyword = rule.keywords.find(k => lower.includes(k));
      if (foundKeyword) {
        // Simple negation check: ignore if preceded by "denies", "no history of", "negative for"
        const negationRegex = new RegExp(`(?:denies|no\\s+history\\s+of|negative\\s+for|without|rules\\s+out)\\s+[^.!?]*?${foundKeyword}`, 'i');
        if (negationRegex.test(lower)) {
          continue;
        }

        const crosswalk = this.crosswalkSnomedToIcd10(rule.snomedCode);
        if (crosswalk.mapping) {
          matchedCodes.add(rule.snomedCode);
          matches.push({
            matchedTerm: foundKeyword,
            concept: crosswalk,
            evidenceQuote: `Identified clinical context for "${foundKeyword}" mapped to ${crosswalk.mapping.snomedTerm} (${crosswalk.mapping.icd10Code}).`,
            confidence: crosswalk.mapping.mappingConfidence
          });
        }
      }
    }

    return matches;
  }

  /**
   * Generates a valid USCDI v4 & FHIR R4 Bundle for claim submission and EHR interoperability.
   */
  public generateFhirR4CrosswalkBundle(results: ISnomedCrosswalkResult[], patientId: string = 'p_active_patient'): any {
    const timestamp = new Date().toISOString();
    const entries = results.filter(r => r.mapping !== null).map((r, index) => {
      const m = r.mapping!;
      return {
        fullUrl: `urn:uuid:condition-${index + 1}`,
        resource: {
          resourceType: 'Condition',
          id: `cond-${m.snomedCode}`,
          clinicalStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }]
          },
          verificationStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }]
          },
          category: [{
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/condition-category',
              code: 'encounter-diagnosis',
              display: 'Encounter Diagnosis'
            }]
          }],
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: m.snomedCode,
                display: m.snomedTerm
              },
              {
                system: 'http://hl7.org/fhir/sid/icd-10-cm',
                code: m.icd10Code,
                display: m.icd10Title
              }
            ],
            text: m.snomedTerm
          },
          subject: {
            reference: `Patient/${patientId}`
          },
          recordedDate: timestamp
        }
      };
    });

    return {
      resourceType: 'Bundle',
      id: `crosswalk-bundle-${Date.now()}`,
      type: 'collection',
      timestamp,
      entry: entries
    };
  }

  /**
   * Look up description for standard CPT codes.
   */
  private getCptDescription(cptCode: string): string {
    const cptMap: Record<string, string> = {
      '70553': 'Brain MRI with and without contrast',
      '78607': 'DaTscan Dopamine Transporter SPECT Imaging',
      '74177': 'Abdominal & Pelvic CT scan with contrast',
      '96132': 'Neuropsychological evaluation (first hour)',
      '99453': 'RPM Initial setup & patient education',
      '99454': 'RPM Monthly device transmission (16+ days)',
      '99457': 'RPM Clinical management time (first 20 mins)',
      '99490': 'Chronic Care Management (20 mins/month)',
      '48150': 'Pancreaticoduodenectomy (Whipple Procedure)',
      '93000': '12-lead Electrocardiogram (ECG)',
      '93224': 'Holter monitor 24-48 hour recording',
      '93306': 'Transthoracic Echocardiogram (TTE) complete',
      '93458': 'Left heart catheterization & coronary angiogram',
      '75574': 'Coronary Computed Tomography Angiography (CCTA)',
      '95907': 'Nerve conduction studies (1-2 studies)',
      '97802': 'Medical Nutrition Therapy assessment (15 mins)',
      '97803': 'Medical Nutrition Therapy re-assessment',
      '96127': 'Brief emotional/behavioral assessment (PHQ-9/GAD-7)',
      '90834': 'Psychotherapy (45 minutes)',
      '90832': 'Psychotherapy (30 minutes)',
      '94010': 'Spirometry with graphical record',
      '94664': 'Aerosol/Inhaler demonstration and training',
      '77067': 'Screening mammography bilateral',
      '19301': 'Partial mastectomy (lumpectomy)',
      '73560': 'Knee X-ray 1 or 2 views',
      '20610': 'Arthrocentesis / major joint injection (knee/hip)',
      '99401': 'Preventive medicine counseling (15 mins)'
    };
    return cptMap[cptCode] || `CPT ${cptCode} Procedure`;
  }

  private getCptWorkRvu(cptCode: string): number {
    const rvuMap: Record<string, number> = {
      '99453': 0.00,
      '99454': 0.00,
      '99457': 0.61,
      '99490': 0.61,
      '93000': 0.17,
      '93306': 1.30,
      '96127': 0.00,
      '90834': 1.50,
      '94010': 0.17,
      '70553': 2.16,
      '74177': 1.82,
      '78607': 1.45,
      '20610': 0.79
    };
    return rvuMap[cptCode] || 0.50;
  }

  private getCptEstimatedPayment(cptCode: string): number {
    const payMap: Record<string, number> = {
      '99453': 19.32,
      '99454': 55.72,
      '99457': 48.14,
      '99490': 62.45,
      '93000': 18.50,
      '93306': 224.80,
      '96127': 18.25,
      '90834': 110.60,
      '94010': 34.20,
      '70553': 285.40,
      '74177': 240.10,
      '78607': 310.50,
      '20610': 72.80
    };
    return payMap[cptCode] || 50.00;
  }
}

