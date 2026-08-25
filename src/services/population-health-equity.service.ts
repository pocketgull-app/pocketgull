import { Injectable, signal, computed } from '@angular/core';

export interface IPatientCohortProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  demographicGroup: 'Pediatric' | 'Maternal Health' | 'Geriatric Multi-Morbidity' | 'Rural Teledentistry' | 'Genomic Comparative';
  chiefComplaint: string;
  sdoh: {
    foodDesertIndex: 'Low Risk' | 'Moderate Risk' | 'Severe Food Desert';
    hpsaDistanceMiles: number;
    environmentalAqi: number;
    digitalLiteracyTier: 'Basic' | 'Intermediate' | 'Advanced';
  };
  sibiScore: number;
  fhirBundleId: string;
}

export interface IFhirR4BundleExport {
  resourceType: 'Bundle';
  id: string;
  type: 'collection';
  timestamp: string;
  entry: Array<{
    fullUrl: string;
    resource: {
      resourceType: string;
      id: string;
      [key: string]: any;
    };
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class PopulationHealthEquityService {
  readonly cohorts = signal<IPatientCohortProfile[]>([
    {
      id: 'cohort_pediatric',
      name: 'Homo Sapiens (Child, Pediatric Respiratory, 7y)',
      age: 7,
      gender: 'Female',
      demographicGroup: 'Pediatric',
      chiefComplaint: 'Acute nocturnal wheezing, exercise-induced asthma, high AQI environmental exposure.',
      sdoh: {
        foodDesertIndex: 'Moderate Risk',
        hpsaDistanceMiles: 14.2,
        environmentalAqi: 115, // Unhealthy for Sensitive Groups
        digitalLiteracyTier: 'Basic'
      },
      sibiScore: 28,
      fhirBundleId: 'bundle_ped_001'
    },
    {
      id: 'cohort_maternal',
      name: 'Homo Sapiens (Female, High-Risk OB/GYN, 29y)',
      age: 29,
      gender: 'Female',
      demographicGroup: 'Maternal Health',
      chiefComplaint: 'Gestational hypertension screening, preeclampsia risk, rural prenatal care barrier.',
      sdoh: {
        foodDesertIndex: 'Severe Food Desert',
        hpsaDistanceMiles: 28.5,
        environmentalAqi: 55,
        digitalLiteracyTier: 'Intermediate'
      },
      sibiScore: 48,
      fhirBundleId: 'bundle_mat_002'
    },
    {
      id: 'cohort_geriatric',
      name: 'Homo Sapiens (Male, Geriatric Multi-Morbidity, 81y)',
      age: 81,
      gender: 'Male',
      demographicGroup: 'Geriatric Multi-Morbidity',
      chiefComplaint: 'Polypharmacy evaluation, mobility frailty index, chronic heart failure monitoring.',
      sdoh: {
        foodDesertIndex: 'Moderate Risk',
        hpsaDistanceMiles: 8.4,
        environmentalAqi: 82,
        digitalLiteracyTier: 'Basic'
      },
      sibiScore: 78,
      fhirBundleId: 'bundle_geri_003'
    },
    {
      id: 'cohort_teledentistry',
      name: 'Homo Sapiens (Female, Rural Teledentistry, 42y)',
      age: 42,
      gender: 'Female',
      demographicGroup: 'Rural Teledentistry',
      chiefComplaint: 'Periodontal probing depth PPD >= 4mm, generalized gingival bleeding, SIBI inflammatory risk.',
      sdoh: {
        foodDesertIndex: 'Severe Food Desert',
        hpsaDistanceMiles: 42.0,
        environmentalAqi: 42,
        digitalLiteracyTier: 'Intermediate'
      },
      sibiScore: 68,
      fhirBundleId: 'bundle_dent_004'
    },
    {
      id: 'cohort_orangutan',
      name: 'Pongo Pygmaeus (Orangutan Comparative Model, 18y)',
      age: 18,
      gender: 'Male',
      demographicGroup: 'Genomic Comparative',
      chiefComplaint: 'Comparative hominoid uricase mutation pathway, metabolic uric acid clearance model.',
      sdoh: {
        foodDesertIndex: 'Low Risk',
        hpsaDistanceMiles: 2.0,
        environmentalAqi: 25,
        digitalLiteracyTier: 'Advanced'
      },
      sibiScore: 18,
      fhirBundleId: 'bundle_primate_005'
    }
  ]);

  readonly activeCohortId = signal<string>('cohort_pediatric');
  readonly selectedCohort = computed(() =>
    this.cohorts().find(c => c.id === this.activeCohortId()) || this.cohorts()[0]
  );

  /**
   * Computes the Health Equity Burden Index (HEBI 0-100)
   */
  readonly hebiIndex = computed(() => {
    const cohort = this.selectedCohort();
    let score = 0;

    if (cohort.sdoh.foodDesertIndex === 'Severe Food Desert') score += 35;
    else if (cohort.sdoh.foodDesertIndex === 'Moderate Risk') score += 20;

    if (cohort.sdoh.hpsaDistanceMiles > 25) score += 30;
    else if (cohort.sdoh.hpsaDistanceMiles > 10) score += 15;

    if (cohort.sdoh.environmentalAqi > 100) score += 25;
    else if (cohort.sdoh.environmentalAqi > 50) score += 10;

    if (cohort.sdoh.digitalLiteracyTier === 'Basic') score += 10;

    return Math.min(100, score);
  });

  selectCohort(id: string) {
    this.activeCohortId.set(id);
  }

  /**
   * Generates a HIPAA Safe Harbor synthetic FHIR R4 Bundle JSON payload.
   */
  generateSyntheticFhirBundle(cohortId?: string): IFhirR4BundleExport {
    const target = this.cohorts().find(c => c.id === (cohortId || this.activeCohortId())) || this.selectedCohort();
    const timestamp = new Date().toISOString();

    return {
      resourceType: 'Bundle',
      id: target.fhirBundleId,
      type: 'collection',
      timestamp,
      entry: [
        {
          fullUrl: `urn:uuid:patient-${target.id}`,
          resource: {
            resourceType: 'Patient',
            id: `pat-${target.id}`,
            gender: target.gender.toLowerCase(),
            birthDate: `${2026 - target.age}-01-01`,
            meta: {
              profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
              tag: [{ system: 'https://pocketgull.app/fhir/safe-harbor', code: 'de-identified' }]
            }
          }
        },
        {
          fullUrl: `urn:uuid:condition-${target.id}`,
          resource: {
            resourceType: 'Condition',
            id: `cond-${target.id}`,
            clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }] },
            code: { text: target.chiefComplaint }
          }
        },
        {
          fullUrl: `urn:uuid:observation-sibi-${target.id}`,
          resource: {
            resourceType: 'Observation',
            id: `obs-sibi-${target.id}`,
            status: 'final',
            code: { text: 'Systemic Inflammatory Burden Index (SIBI)' },
            valueQuantity: { value: target.sibiScore, unit: 'points' }
          }
        }
      ]
    };
  }
}
