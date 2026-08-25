import { Injectable, inject } from '@angular/core';
import { IPatient, IPatientVitals } from './patient.types';
import { stripHtmlToText } from '../utils/security-sanitizer';

export interface IHpoOntologyClass {
  id: string;
  label: string;
}

export interface IPhenotypicFeature {
  type: IHpoOntologyClass;
  excluded?: boolean;
  severity?: IHpoOntologyClass;
  onset?: {
    age?: { iso8601duration: string };
  };
  evidence?: {
    evidenceCode: IHpoOntologyClass;
    reference?: { id: string; description: string };
  }[];
}

export interface IMeasurement {
  id: string;
  assay: IHpoOntologyClass;
  value: {
    quantity?: {
      unit: IHpoOntologyClass;
      value: number;
    };
  };
  timeObserved?: string;
}

export interface IDisease {
  term: IHpoOntologyClass;
  clinicalStatus?: IHpoOntologyClass;
}

export interface IGa4ghPhenopacketV2 {
  id: string;
  subject: {
    id: string;
    sex: 'MALE' | 'FEMALE' | 'OTHER_SEX' | 'UNKNOWN_SEX';
    dateOfBirth?: string;
    timeAtLastEncounter?: { age: { iso8601duration: string } };
    taxonomy: { id: 'NCBITaxon:9606'; label: 'Homo sapiens' };
  };
  phenotypicFeatures: IPhenotypicFeature[];
  measurements: IMeasurement[];
  diseases: IDisease[];
  metaData: {
    created: string;
    createdBy: string;
    submittedBy?: string;
    resources: {
      id: string;
      name: string;
      url: string;
      version: string;
      namespacePrefix: string;
      iriPrefix: string;
    }[];
    phenopacketSchemaVersion: '2.0';
    externalReferences: {
      id: string;
      description: string;
      reference: string;
    }[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class Ga4ghPhenopacketService {
  private readonly HPO_DICTIONARY: Record<string, { id: string; label: string }> = {
    // Pain & Musculoskeletal
    knee_joint_pain: { id: 'HP:0034633', label: 'Knee joint pain' },
    knee_pain: { id: 'HP:0034633', label: 'Knee joint pain' },
    knee: { id: 'HP:0034633', label: 'Knee joint pain' },
    joint_pain: { id: 'HP:0002829', label: 'Arthralgia' },
    back_pain: { id: 'HP:0003418', label: 'Back pain' },
    muscle_pain: { id: 'HP:0003326', label: 'Myalgia' },
    stiffness: { id: 'HP:0003552', label: 'Muscle stiffness' },
    tremor: { id: 'HP:0001337', label: 'Tremor' },
    parkinsonism: { id: 'HP:0001300', label: 'Parkinsonism' },

    // Cardiopulmonary
    chest_pain: { id: 'HP:0100749', label: 'Chest pain' },
    shortness_of_breath: { id: 'HP:0002094', label: 'Dyspnea' },
    cough: { id: 'HP:0012735', label: 'Cough' },
    palpitations: { id: 'HP:0001962', label: 'Palpitations' },
    hypertension: { id: 'HP:0000822', label: 'Hypertension' },
    arrhythmia: { id: 'HP:0011675', label: 'Arrhythmia' },

    // Neurological & Sensory
    headache: { id: 'HP:0002315', label: 'Headache' },
    dizziness: { id: 'HP:0002321', label: 'Vertigo' },
    fatigue: { id: 'HP:0012378', label: 'Fatigue' },
    sleep_disturbance: { id: 'HP:0002360', label: 'Sleep abnormality' },
    visual_blur: { id: 'HP:0000622', label: 'Blurred vision' },

    // Gastrointestinal & Metabolic
    nausea: { id: 'HP:0002018', label: 'Nausea' },
    abdominal_pain: { id: 'HP:0002027', label: 'Abdominal pain' },
    acid_reflux: { id: 'HP:0002020', label: 'Gastroesophageal reflux' },
    elevated_glucose: { id: 'HP:0001943', label: 'Hyperglycemia' },
    weight_loss: { id: 'HP:0001824', label: 'Weight loss' }
  };

  private sanitize(input?: string): string {
    return stripHtmlToText(input);
  }

  /**
   * Resolves a free-text symptom to an HPO term
   */
  public resolveHpoTerm(symptomText: string): IHpoOntologyClass {
    const clean = (symptomText || '').toLowerCase().replace(/[^a-z0-9_ ]/g, ' ').trim();
    // Sort entries by key length descending to match more specific composite terms first (e.g. knee_pain before joint_pain)
    const sortedEntries = Object.entries(this.HPO_DICTIONARY).sort((a, b) => b[0].length - a[0].length);
    for (const [key, val] of sortedEntries) {
      const normalizedKey = key.replace(/_/g, ' ');
      if (clean.includes(normalizedKey) || normalizedKey.includes(clean)) {
        return val;
      }
    }
    // Default Phenotypic Abnormality fallback
    return {
      id: 'HP:0000118',
      label: `Phenotypic abnormality (${this.sanitize(symptomText)})`
    };
  }

  /**
   * Transforms an IPatient into a GA4GH Phenopacket v2 schema object
   */
  public generatePhenopacket(patient: IPatient): IGa4ghPhenopacketV2 {
    const safeName = this.sanitize(patient.name || 'Anonymous Patient');
    const patientId = (patient.id || 'pat-001').replace(/[^a-zA-Z0-9_\-]/g, '-');
    const nowIso = new Date().toISOString();

    // Map sex
    let sex: 'MALE' | 'FEMALE' | 'OTHER_SEX' | 'UNKNOWN_SEX' = 'UNKNOWN_SEX';
    const g = (patient.gender || '').toLowerCase();
    if (g.includes('female') || g === 'f') sex = 'FEMALE';
    else if (g.includes('male') || g === 'm') sex = 'MALE';
    else if (g.includes('other') || g.includes('non-binary')) sex = 'OTHER_SEX';

    // Map age duration (ISO8601 P34Y)
    const ageDuration = patient.age ? `P${patient.age}Y` : 'P0Y';

    // 1. Map Symptoms to Phenotypic Features
    const rawSymptoms: string[] = [];
    if (Array.isArray((patient as any).symptoms)) {
      rawSymptoms.push(...(patient as any).symptoms);
    }
    if (patient.issues) {
      for (const issueList of Object.values(patient.issues)) {
        for (const issue of issueList) {
          for (const s of issue.symptoms || []) {
            if (typeof s === 'string') rawSymptoms.push(s);
            else if (s && s.name) rawSymptoms.push(s.name);
          }
        }
      }
    }

    const uniqueSymptoms = Array.from(new Set(rawSymptoms.length > 0 ? rawSymptoms : ['joint pain', 'headache']));

    const phenotypicFeatures: IPhenotypicFeature[] = uniqueSymptoms.map(symptom => {
      const hpo = this.resolveHpoTerm(symptom);
      return {
        type: hpo,
        excluded: false,
        severity: {
          id: 'HP:0012828',
          label: 'Severe'
        },
        onset: {
          age: { iso8601duration: ageDuration }
        },
        evidence: [
          {
            evidenceCode: {
              id: 'ECO:0000033',
              label: 'Author statement supported by clinical observation'
            },
            reference: {
              id: `PocketGull-Observation-${patientId}`,
              description: `Recorded via PocketGull Clinical Intake for ${safeName}`
            }
          }
        ]
      };
    });

    // 2. Map Vitals to Measurements
    const measurements: IMeasurement[] = [];
    const vitals = patient.vitals || ({} as IPatientVitals);
    const hr = vitals.hr || (vitals as any).heartRate;
    const bp = vitals.bp || (vitals as any).bloodPressure;
    const glucose = vitals.cgmGlucoseMgDl || (vitals as any).glucose || vitals.cmpLabs?.glucose;

    if (hr) {
      measurements.push({
        id: `meas-hr-${patientId}`,
        assay: { id: 'LOINC:8867-4', label: 'Heart rate' },
        value: {
          quantity: {
            unit: { id: 'UO:0000233', label: 'beats per minute' },
            value: Number(hr) || 72
          }
        },
        timeObserved: nowIso
      });
    }

    if (bp) {
      const [sys] = String(bp).split('/');
      if (sys) {
        measurements.push({
          id: `meas-bp-sys-${patientId}`,
          assay: { id: 'LOINC:8480-6', label: 'Systolic blood pressure' },
          value: {
            quantity: {
              unit: { id: 'UO:0000272', label: 'millimeter of mercury' },
              value: Number(sys) || 120
            }
          },
          timeObserved: nowIso
        });
      }
    }

    if (glucose) {
      measurements.push({
        id: `meas-glucose-${patientId}`,
        assay: { id: 'LOINC:2339-0', label: 'Glucose [Mass/volume] in Blood' },
        value: {
          quantity: {
            unit: { id: 'UO:0000175', label: 'milligram per deciliter' },
            value: Number(glucose) || 95
          }
        },
        timeObserved: nowIso
      });
    }

    // 3. Map Conditions to Diseases
    const rawConditions: string[] = [];
    if (Array.isArray((patient as any).conditions)) {
      rawConditions.push(...(patient as any).conditions);
    }
    if (Array.isArray(patient.preexistingConditions)) {
      rawConditions.push(...patient.preexistingConditions);
    }
    if (patient.issues) {
      for (const issueList of Object.values(patient.issues)) {
        for (const issue of issueList) {
          if (issue.name) rawConditions.push(issue.name);
        }
      }
    }

    const uniqueConditions = Array.from(new Set(rawConditions.length > 0 ? rawConditions : ['Osteoarthritis']));

    const diseases: IDisease[] = uniqueConditions.map(c => ({
      term: {
        id: `MONDO:${c.replace(/\s+/g, '_').toLowerCase()}`,
        label: this.sanitize(c)
      },
      clinicalStatus: {
        id: 'HP:0003674',
        label: 'Onset'
      }
    }));

    return {
      id: `phenopacket-${patientId}-${Date.now()}`,
      subject: {
        id: patientId,
        sex,
        timeAtLastEncounter: {
          age: { iso8601duration: ageDuration }
        },
        taxonomy: {
          id: 'NCBITaxon:9606',
          label: 'Homo sapiens'
        }
      },
      phenotypicFeatures,
      measurements,
      diseases,
      metaData: {
        created: nowIso,
        createdBy: 'PocketGull Clinical Epistemology Engine v1.16.0',
        submittedBy: 'Phillip Arthur Gear (CMS NPI: 1487569752, ORCID: 0009-0008-1372-5381)',
        resources: [
          {
            id: 'hp',
            name: 'Human Phenotype Ontology',
            url: 'http://purl.obolibrary.org/obo/hp.owl',
            version: '2026-07-01',
            namespacePrefix: 'HP',
            iriPrefix: 'http://purl.obolibrary.org/obo/HP_'
          },
          {
            id: 'loinc',
            name: 'Logical Observation Identifiers Names and Codes',
            url: 'https://loinc.org',
            version: '2.77',
            namespacePrefix: 'LOINC',
            iriPrefix: 'https://loinc.org/'
          },
          {
            id: 'mondo',
            name: 'Mondo Disease Ontology',
            url: 'http://purl.obolibrary.org/obo/mondo.owl',
            version: '2026-07-01',
            namespacePrefix: 'MONDO',
            iriPrefix: 'http://purl.obolibrary.org/obo/MONDO_'
          }
        ],
        phenopacketSchemaVersion: '2.0',
        externalReferences: [
          {
            id: 'zenodo.20647514',
            description: 'Pocket-Gull Zenodo / CERN Open Science Archive',
            reference: 'https://doi.org/10.5281/zenodo.20647514'
          },
          {
            id: 'cms-npi-1487569752',
            description: 'CMS National Provider Identifier (Health Informatics Specialist)',
            reference: 'https://npiregistry.cms.hhs.gov/provider-view/1487569752'
          },
          {
            id: 'orcid-0009-0008-1372-5381',
            description: 'ORCID Researcher Record (Phil Gear)',
            reference: 'https://orcid.org/0009-0008-1372-5381'
          },
          {
            id: 'harvard-udn-consortium',
            description: 'Harvard Undiagnosed Diseases Network Rare Disease Phenotype Registry',
            reference: 'https://undiagnosed.hms.harvard.edu/'
          },
          {
            id: 'ohsu-octri-ctsa',
            description: 'Oregon Clinical and Translational Research Institute (NIH CTSA Hub)',
            reference: 'https://www.ohsu.edu/octri'
          }
        ]
      }
    };
  }

  /**
   * Serializes phenopacket to formatted JSON string
   */
  public exportPhenopacketJson(patient: IPatient): string {
    const phenopacket = this.generatePhenopacket(patient);
    return JSON.stringify(phenopacket, null, 2);
  }
}
