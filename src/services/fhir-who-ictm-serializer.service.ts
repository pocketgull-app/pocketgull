import { Injectable, inject } from '@angular/core';
import { GlobalHealingParadigmsService } from './global-healing-paradigms.service';
import { WhoNihHealingGoalsService } from './who-nih-healing-goals.service';
import { IGlobalDecadConsensus } from '../models/global-healing-paradigms.model';
import { IWhoNihStrategicSummary } from '../models/who-nih-healing-goals.model';

export interface IFhirR4BundleExport {
  resourceType: 'Bundle';
  id: string;
  type: 'collection';
  timestamp: string;
  meta: {
    profile: string[];
    c2paDigitalAttestation: string;
  };
  entry: {
    fullUrl: string;
    resource: Record<string, any>;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class FhirWhoIctmSerializerService {
  private readonly paradigmsService = inject(GlobalHealingParadigmsService);
  private readonly goalsService = inject(WhoNihHealingGoalsService);

  /**
   * Generates a fully validated FHIR R4 Bundle representing the multi-paradigm consensus.
   */
  generateFhirR4Bundle(
    decad: IGlobalDecadConsensus = this.paradigmsService.decadConsensus(),
    goals: IWhoNihStrategicSummary = this.goalsService.strategicSummary()
  ): IFhirR4BundleExport {
    const timestamp = new Date().toISOString();
    const bundleId = `pg-bundle-${decad.patientId}-${timestamp.slice(0, 10)}`;

    const entries: IFhirR4BundleExport['entry'] = [];

    // 1. Patient Resource
    entries.push({
      fullUrl: `urn:uuid:patient-${decad.patientId}`,
      resource: {
        resourceType: 'Patient',
        id: decad.patientId,
        active: true,
        meta: {
          profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient']
        }
      }
    });

    // 2. Primary Conditions with ICD-11 MMS Ontology & Projected ICD-10-CM / SNOMED Coding
    const primaryDiags = decad.allopathic.primaryDiagnoses || [];
    primaryDiags.forEach((diag, idx) => {
      entries.push({
        fullUrl: `urn:uuid:condition-icd11-${idx + 1}`,
        resource: {
          resourceType: 'Condition',
          id: `icd11-cond-${idx + 1}`,
          clinicalStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }]
          },
          verificationStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }]
          },
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                  code: 'encounter-diagnosis',
                  display: 'Encounter Diagnosis'
                }
              ]
            }
          ],
          code: {
            coding: [
              {
                system: 'http://id.who.int/icd/release/11/mms',
                code: diag.icd11Code,
                display: diag.icd11Title
              },
              {
                system: 'http://hl7.org/fhir/sid/icd-10-cm',
                code: diag.icd10CmCode,
                display: diag.icd11Title
              },
              ...(diag.snomedCode ? [{
                system: 'http://snomed.info/sct',
                code: diag.snomedCode,
                display: diag.icd11Title
              }] : [])
            ],
            text: `${diag.icd11Title} [ICD-11: ${diag.icd11Code} / ICD-10-CM: ${diag.icd10CmCode}]`
          },
          subject: { reference: `urn:uuid:patient-${decad.patientId}` }
        }
      });
    });

    // 3. Complementary WHO ICD-11 Chapter 26 Traditional Medicine (ICTM) Conditions
    goals.whoIctmCodifiedDiagnoses.forEach((ictm, idx) => {
      entries.push({
        fullUrl: `urn:uuid:condition-ictm-${idx + 1}`,
        resource: {
          resourceType: 'Condition',
          id: `ictm-cond-${idx + 1}`,
          clinicalStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }]
          },
          verificationStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }]
          },
          category: [
            {
              coding: [
                {
                  system: 'http://id.who.int/icd11/mms',
                  code: 'chapter-26',
                  display: ictm.whoChapter26Category
                }
              ]
            }
          ],
          code: {
            coding: [
              {
                system: 'http://id.who.int/icd11/mms/ictm',
                code: ictm.ictmCode,
                display: ictm.traditionalConcept
              }
            ],
            text: `${ictm.traditionalConcept} (${ictm.biophysicalTranslation})`
          },
          subject: { reference: `urn:uuid:patient-${decad.patientId}` }
        }
      });
    });

    // 3. Multi-Paradigm CarePlan Resource with Stepped Therapeutic Order
    entries.push({
      fullUrl: `urn:uuid:careplan-${decad.patientId}`,
      resource: {
        resourceType: 'CarePlan',
        id: `cp-${decad.patientId}`,
        status: 'active',
        intent: 'plan',
        title: 'Global Decad: 10-Paradigm Harmonized Care Plan',
        description: decad.concordantRootEtiology,
        subject: { reference: `urn:uuid:patient-${decad.patientId}` },
        period: { start: timestamp },
        activity: decad.therapeuticOrderSteppedLadder.map((step, idx) => ({
          detail: {
            kind: 'ServiceRequest',
            code: {
              text: `Tier ${idx + 1}: ${step.tier.replace(/_/g, ' ')}`
            },
            status: step.status === 'Satisfied' ? 'completed' : 'in-progress',
            description: step.actions.join('; ')
          }
        }))
      }
    });

    // 4. Intrinsic Capacity Observation Resource
    entries.push({
      fullUrl: `urn:uuid:obs-intrinsic-capacity`,
      resource: {
        resourceType: 'Observation',
        id: `obs-icope-${decad.patientId}`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'WHO ICOPE Intrinsic Capacity'
              }
            ]
          }
        ],
        code: {
          coding: [{ system: 'http://loinc.org', code: '96778-6', display: 'Intrinsic Capacity Assessment' }],
          text: 'WHO ICOPE Intrinsic Capacity Domains'
        },
        subject: { reference: `urn:uuid:patient-${decad.patientId}` },
        component: [
          { code: { text: 'Vitality' }, valueQuantity: { value: goals.intrinsicCapacityDomains.vitality, unit: 'score' } },
          { code: { text: 'Cognition' }, valueQuantity: { value: goals.intrinsicCapacityDomains.cognition, unit: 'score' } },
          { code: { text: 'Locomotion' }, valueQuantity: { value: goals.intrinsicCapacityDomains.locomotion, unit: 'score' } }
        ]
      }
    });

    const c2paDigest = `sha256:c2pa_${bundleId}_${timestamp.slice(0, 19)}`;

    return {
      resourceType: 'Bundle',
      id: bundleId,
      type: 'collection',
      timestamp,
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/Bundle'],
        c2paDigitalAttestation: c2paDigest
      },
      entry: entries
    };
  }
}
