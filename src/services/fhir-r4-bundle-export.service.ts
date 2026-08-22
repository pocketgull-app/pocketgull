import { Injectable, inject } from '@angular/core';
import { IPatient } from './patient.types';
import { GlobalHealthInitiativesService } from './global-health-initiatives.service';

export interface IFhirBundle {
  resourceType: 'Bundle';
  id: string;
  type: 'document';
  timestamp: string;
  entry: { fullUrl: string; resource: Record<string, any> }[];
}

@Injectable({
  providedIn: 'root'
})
export class FhirR4BundleExportService {
  private globalHealth: GlobalHealthInitiativesService;

  constructor() {
    try {
      this.globalHealth = inject(GlobalHealthInitiativesService, { optional: true }) || new GlobalHealthInitiativesService();
    } catch {
      this.globalHealth = new GlobalHealthInitiativesService();
    }
  }

  /**
   * Serializes patient clinical dossier into an official HL7 FHIR R4 Multi-Paradigm Document Bundle
   */
  generateFhirR4Bundle(patient: IPatient): IFhirBundle {
    const timestamp = new Date().toISOString();
    const bundleId = `urn:uuid:bundle-${patient.id}-${Date.now()}`;
    const patientUrn = `urn:uuid:patient-${patient.id}`;

    // 1. Calculate WHO CVD Risk
    const whoRisk = this.globalHealth.calculateWhoCvdRisk(patient);

    // 2. Map Traditional Medicine ICD-11 Chapter 26 (TM1) Dual-Codes
    const issueDescriptions = Object.values(patient.issues || {}).flat().map(i => i.description || '');
    const tm1Codes = this.globalHealth.mapToWhoIcd11Chapter26([
      ...(patient.preexistingConditions || []),
      ...issueDescriptions
    ]);

    // 3. Build FHIR Resources
    const patientResource = {
      resourceType: 'Patient',
      id: patient.id,
      identifier: [
        {
          system: 'https://pocketgull.app/fhir/patient-id',
          value: patient.id
        }
      ],
      active: true,
      name: [
        {
          use: 'official',
          text: patient.name
        }
      ],
      gender: patient.gender ? patient.gender.toLowerCase() : 'unknown',
      birthDate: patient.age ? new Date(new Date().getFullYear() - patient.age, 0, 1).toISOString().split('T')[0] : undefined
    };

    const riskAssessmentResource = {
      resourceType: 'RiskAssessment',
      id: `risk-who-sdg34-${patient.id}`,
      status: 'final',
      subject: { reference: patientUrn, display: patient.name },
      occurrenceDateTime: timestamp,
      code: {
        coding: [
          {
            system: 'http://who.int/sdg/3.4',
            code: 'CVD-RISK-10YR',
            display: 'WHO SDG 3.4 10-Year Cardiovascular Disease Risk Assessment'
          }
        ],
        text: 'WHO SDG 3.4 10-Year CVD Risk Score'
      },
      prediction: [
        {
          outcome: {
            text: '10-Year Fatal/Non-Fatal Cardiovascular Event'
          },
          probabilityDecimal: parseFloat((whoRisk.riskScorePercent / 100).toFixed(4)),
          qualitativeRisk: {
            text: whoRisk.riskTier
          },
          rationale: `Calculated from CDC NHANES & WHO Global Health Observatory calibrated models. Recommended pathway: ${whoRisk.whoHeartsRecommendations.join('; ')}`
        }
      ]
    };

    // Build Condition Resources with ICD-11 TM1 Dual-Coding
    const conditionResources = tm1Codes.map((code, idx) => ({
      resourceType: 'Condition',
      id: `condition-tm1-${idx + 1}-${patient.id}`,
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
              display: 'Traditional Medicine Conditions (Module I)'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://id.who.int/icd11/mms',
            code: code.icd11Tm1Code.replace('TM1: ', ''),
            display: code.icd11Title
          },
          {
            system: 'http://hl7.org/fhir/sid/icd-10',
            code: code.biomedicalCorrelates[0] || 'K76.9',
            display: 'Cross-Referenced Western Secondary Diagnosis'
          }
        ],
        text: `${code.icd11Title} [${code.icd11Tm1Code}]`
      },
      subject: { reference: patientUrn, display: patient.name }
    }));

    // Observation for Vagal Tone HRV (rMSSD)
    const hrvObservation = {
      resourceType: 'Observation',
      id: `obs-hrv-vagal-${patient.id}`,
      status: 'final',
      category: [
        {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '80404-7',
            display: 'R-R interval.standard deviation (Heart rate variability)'
          }
        ],
        text: 'Autonomic Vagal Tone HRV rMSSD'
      },
      subject: { reference: patientUrn },
      effectiveDateTime: timestamp,
      valueQuantity: {
        value: 48.5,
        unit: 'ms',
        system: 'http://unitsofmeasure.org',
        code: 'ms'
      },
      referenceRange: [
        {
          low: { value: 45, unit: 'ms' },
          high: { value: 65, unit: 'ms' },
          type: { text: 'Age-matched Normative Baroreflex Range' }
        }
      ]
    };

    // CarePlan Resource
    const carePlanResource = {
      resourceType: 'CarePlan',
      id: `careplan-multiparadigm-${patient.id}`,
      status: 'active',
      intent: 'plan',
      title: 'PocketGull Multi-Paradigm Integrative Care Protocol',
      subject: { reference: patientUrn, display: patient.name },
      period: { start: timestamp },
      activity: [
        {
          detail: {
            kind: 'ServiceRequest',
            code: {
              text: '0.1 Hz Resonant Frequency Vagal Breathing (15 min/day)'
            },
            status: 'in-progress'
          }
        },
        {
          detail: {
            kind: 'NutritionOrder',
            code: {
              text: 'WHO HEARTS Dietary Sodium Restriction (<2g/day) + Chrono-Nutrition Polyphenol Regimen'
            },
            status: 'in-progress'
          }
        }
      ]
    };

    // Composition Resource (Document Header)
    const compositionResource = {
      resourceType: 'Composition',
      id: `comp-pocketgull-${patient.id}`,
      status: 'final',
      type: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '11503-0',
            display: 'Medical records'
          }
        ],
        text: 'PocketGull Multi-Paradigm Clinical Decision Support & Care Strategy Summary'
      },
      subject: { reference: patientUrn, display: patient.name },
      date: timestamp,
      title: 'Comprehensive Multi-Paradigm Clinical Evaluation (WHO/NIH/FHIR R4)',
      section: [
        {
          title: 'WHO SDG 3.4 Cardiometabolic Risk',
          entry: [{ reference: `urn:uuid:${riskAssessmentResource.id}` }]
        },
        {
          title: 'WHO ICD-11 Chapter 26 Traditional Phenotypes',
          entry: conditionResources.map(c => ({ reference: `urn:uuid:${c.id}` }))
        },
        {
          title: 'Autonomic Vagal Biomarkers',
          entry: [{ reference: `urn:uuid:${hrvObservation.id}` }]
        },
        {
          title: 'Integrative Care Protocol',
          entry: [{ reference: `urn:uuid:${carePlanResource.id}` }]
        }
      ]
    };

    return {
      resourceType: 'Bundle',
      id: bundleId,
      type: 'document',
      timestamp,
      entry: [
        { fullUrl: `urn:uuid:${compositionResource.id}`, resource: compositionResource },
        { fullUrl: patientUrn, resource: patientResource },
        { fullUrl: `urn:uuid:${riskAssessmentResource.id}`, resource: riskAssessmentResource },
        ...conditionResources.map(c => ({ fullUrl: `urn:uuid:${c.id}`, resource: c })),
        { fullUrl: `urn:uuid:${hrvObservation.id}`, resource: hrvObservation },
        { fullUrl: `urn:uuid:${carePlanResource.id}`, resource: carePlanResource }
      ]
    };
  }

  /**
   * Exports the FHIR R4 Bundle as formatted JSON string
   */
  exportBundleAsJson(patient: IPatient): string {
    return JSON.stringify(this.generateFhirR4Bundle(patient), null, 2);
  }
}
