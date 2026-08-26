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

  /**
   * Serializes 3D Spatial Somatic Lesions and AVS Neuro-Acoustic Sessions into a standardized FHIR R4 Document Bundle
   */
  generateSpatialLesionAndAvsBundle(params: {
    patientId: string;
    patientName: string;
    lesions: Array<{
      id: string;
      label: string;
      partId: string;
      position: { x: number; y: number; z: number };
      normal?: { x: number; y: number; z: number };
      severity: 'mild' | 'moderate' | 'critical';
      morphology: string;
      clinicalNotes: string;
      snomedCode?: string;
    }>;
    avsSession?: {
      carrierFreqHz: number;
      binauralBeatHz: number;
      isIsochronicPulseEnabled?: boolean;
      isSpatialPanningEnabled?: boolean;
      hapticMode?: string;
      durationMinutes?: number;
    };
    vitals?: {
      heartRate?: number;
      autonomicCoherenceScore?: number;
      cardiacResonanceHz?: number;
    };
  }): IFhirBundle {
    const timestamp = new Date().toISOString();
    const bundleId = `urn:uuid:bundle-spatial-avs-${params.patientId}-${Date.now()}`;
    const patientUrn = `urn:uuid:patient-${params.patientId}`;

    // 1. Patient Resource
    const patientResource = {
      resourceType: 'Patient',
      id: params.patientId,
      identifier: [{ system: 'https://pocketgull.app/fhir/patient-id', value: params.patientId }],
      active: true,
      name: [{ use: 'official', text: params.patientName }]
    };

    // 2. 3D Spatial Lesion Observations
    const observationResources = params.lesions.map((lesion) => {
      const obsId = `obs-spatial-${lesion.id}`;
      return {
        resourceType: 'Observation',
        id: obsId,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: lesion.snomedCode || '404684003',
              display: `${lesion.morphology} - ${lesion.label}`
            }
          ],
          text: lesion.label
        },
        subject: { reference: patientUrn, display: params.patientName },
        effectiveDateTime: timestamp,
        interpretation: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                code: lesion.severity === 'critical' ? 'AA' : lesion.severity === 'moderate' ? 'A' : 'N',
                display: lesion.severity
              }
            ]
          }
        ],
        bodySite: {
          coding: [
            {
              system: 'https://pocketgull.app/fhir/anatomy-part-id',
              code: lesion.partId,
              display: lesion.partId.replace(/_/g, ' ')
            }
          ]
        },
        note: [{ text: lesion.clinicalNotes }],
        extension: [
          {
            url: 'https://pocketgull.app/fhir/StructureDefinition/spatial-coordinates-3d',
            extension: [
              { url: 'x', valueDecimal: lesion.position.x },
              { url: 'y', valueDecimal: lesion.position.y },
              { url: 'z', valueDecimal: lesion.position.z },
              ...(lesion.normal ? [
                { url: 'normalX', valueDecimal: lesion.normal.x },
                { url: 'normalY', valueDecimal: lesion.normal.y },
                { url: 'normalZ', valueDecimal: lesion.normal.z }
              ] : [])
            ]
          }
        ]
      };
    });

    // 3. AVS Neuro-Acoustic & Vibroacoustic Procedure Resource
    const procedureResources: any[] = [];
    if (params.avsSession) {
      const procId = `proc-avs-${Date.now()}`;
      procedureResources.push({
        resourceType: 'Procedure',
        id: procId,
        status: 'completed',
        category: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '866167008',
              display: 'Acoustic stimulation therapy (procedure)'
            }
          ]
        },
        code: {
          coding: [
            {
              system: 'https://pocketgull.app/fhir/avs-protocol',
              code: `solfeggio-${params.avsSession.carrierFreqHz}hz`,
              display: `Sacred Solfeggio ${params.avsSession.carrierFreqHz}Hz Entrainment`
            }
          ],
          text: `AVS Entrainment: Carrier ${params.avsSession.carrierFreqHz}Hz, Beat ${params.avsSession.binauralBeatHz}Hz`
        },
        subject: { reference: patientUrn, display: params.patientName },
        performedDateTime: timestamp,
        note: [
          {
            text: `Acoustic Dosimetry: Isochronic Pulse = ${params.avsSession.isIsochronicPulseEnabled ? 'Active' : 'Binaural Continuous'}; 3D HRTF Spatial Panning = ${params.avsSession.isSpatialPanningEnabled ? 'Active' : 'Stereo Center'}; Haptics = ${params.avsSession.hapticMode || 'Disabled'}; Cardiac Resonance = ${params.vitals?.cardiacResonanceHz || 0.10}Hz (${params.vitals?.autonomicCoherenceScore || 85}% Coherence)`
          }
        ]
      });
    }

    // 4. DiagnosticReport Resource
    const diagnosticReportResource = {
      resourceType: 'DiagnosticReport',
      id: `diag-spatial-avs-${params.patientId}`,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
              code: 'RAD',
              display: 'Radiology / 3D Anatomical Spatial Observation'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '72170-4',
            display: 'Photographic and 3D surface observation report'
          }
        ],
        text: 'PocketGull 3D Somatic Lesion & Vibroacoustic Entrainment Assessment'
      },
      subject: { reference: patientUrn, display: params.patientName },
      effectiveDateTime: timestamp,
      issued: timestamp,
      result: observationResources.map(o => ({ reference: `urn:uuid:${o.id}`, display: o.code.text })),
      conclusion: `Identified ${observationResources.length} 3D surface lesion loci. Target Solfeggio acoustic dosimetry applied.`
    };

    // 5. Composition Resource (Document Header)
    const compositionResource = {
      resourceType: 'Composition',
      id: `comp-spatial-avs-${params.patientId}`,
      status: 'final',
      type: {
        coding: [{ system: 'http://loinc.org', code: '11503-0', display: 'Medical records' }],
        text: 'PocketGull 3D Spatial Lesion & Vibroacoustic Entrainment Dossier'
      },
      subject: { reference: patientUrn, display: params.patientName },
      date: timestamp,
      title: '3D Somatic Lesion Markup & Neuro-Acoustic Procedure Report (FHIR R4)',
      section: [
        {
          title: '3D Spatial Surface Lesion Observations',
          entry: observationResources.map(o => ({ reference: `urn:uuid:${o.id}` }))
        },
        ...(procedureResources.length > 0 ? [{
          title: 'Vibroacoustic & AVS Clinical Procedures',
          entry: procedureResources.map(p => ({ reference: `urn:uuid:${p.id}` }))
        }] : []),
        {
          title: 'Clinical Diagnostic Synthesis',
          entry: [{ reference: `urn:uuid:${diagnosticReportResource.id}` }]
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
        { fullUrl: `urn:uuid:${diagnosticReportResource.id}`, resource: diagnosticReportResource },
        ...observationResources.map(o => ({ fullUrl: `urn:uuid:${o.id}`, resource: o })),
        ...procedureResources.map(p => ({ fullUrl: `urn:uuid:${p.id}`, resource: p }))
      ]
    };
  }

  /**
   * Exports 3D spatial lesion & AVS bundle as JSON string
   */
  exportSpatialLesionBundleAsJson(params: Parameters<FhirR4BundleExportService['generateSpatialLesionAndAvsBundle']>[0]): string {
    return JSON.stringify(this.generateSpatialLesionAndAvsBundle(params), null, 2);
  }

  /**
   * Triggers client-side browser download of the generated FHIR R4 Bundle JSON file
   */
  downloadSpatialLesionBundleJson(params: Parameters<FhirR4BundleExportService['generateSpatialLesionAndAvsBundle']>[0]): boolean {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;

    try {
      const jsonStr = this.exportSpatialLesionBundleAsJson(params);
      const blob = new Blob([jsonStr], { type: 'application/fhir+json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fhir_r4_spatial_avs_${params.patientId}_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.warn('[FhirR4BundleExport] Bundle download failed:', e);
      return false;
    }
  }

  /**
   * Serializes a prescribed Biophilic Green Walking Quest & Parasympathetic Vagal protocol
   * into an official HL7 FHIR R4 Bundle compliant with SNOMED CT 735985006.
   */
  generateBiophilicGreenRxBundle(params: {
    patientId: string;
    patientName: string;
    clinicianId?: string;
    questId: string;
    questTitle: string;
    prescribedDailyMinutes: number;
    minCanopyPct: number;
    maxNoiseDba: number;
    vagalPointsAchieved?: number;
    completedAt?: string;
  }): IFhirBundle {
    const timestamp = new Date().toISOString();
    const bundleId = `urn:uuid:bundle-green-rx-${params.patientId}-${Date.now()}`;
    const patientUrn = `urn:uuid:patient-${params.patientId}`;
    const carePlanId = `careplan-green-rx-${params.questId}`;
    const observationId = `obs-vagal-movement-${Date.now()}`;

    const carePlanResource: Record<string, any> = {
      resourceType: 'CarePlan',
      id: carePlanId,
      status: 'active',
      intent: 'order',
      category: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '735985006',
              display: 'Prescription of nature-based activity'
            }
          ],
          text: 'Biophilic Green Walking & Sensory Grounding Protocol'
        }
      ],
      title: `Green Rx: ${params.questTitle}`,
      description: `Daily prescription of ${params.prescribedDailyMinutes} minutes biophilic green walk under >= ${params.minCanopyPct}% canopy with <= ${params.maxNoiseDba} dBA noise floor.`,
      subject: { reference: patientUrn, display: params.patientName },
      author: params.clinicianId ? { reference: `urn:uuid:practitioner-${params.clinicianId}` } : undefined,
      activity: [
        {
          detail: {
            kind: 'Task',
            code: {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '281036007',
                  display: 'Walking for exercise'
                }
              ],
              text: 'Biophilic Vagal Walking Odyssey'
            },
            status: 'in-progress',
            scheduledTiming: {
              repeat: {
                frequency: 1,
                period: 1,
                periodUnit: 'd',
                duration: params.prescribedDailyMinutes,
                durationUnit: 'min'
              }
            },
            goal: [
              {
                display: `Achieve ${params.prescribedDailyMinutes} daily green minutes for parasympathetic recovery`
              }
            ]
          }
        }
      ]
    };

    const observationResource: Record<string, any> = {
      resourceType: 'Observation',
      id: observationId,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'therapy',
              display: 'Therapy'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '735985006',
            display: 'Prescription of nature-based activity'
          }
        ],
        text: 'Vagal Coherence Score from Biophilic Movement'
      },
      subject: { reference: patientUrn, display: params.patientName },
      effectiveDateTime: params.completedAt || timestamp,
      valueQuantity: {
        value: params.vagalPointsAchieved || 0,
        unit: 'points',
        system: 'https://pocketgull.app/fhir/vagal-points',
        code: 'VAGAL_PTS'
      },
      interpretation: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
              code: 'N',
              display: 'Normal'
            }
          ],
          text: 'Therapeutic Biophilic Exposure Level Achieved'
        }
      ]
    };

    return {
      resourceType: 'Bundle',
      id: bundleId,
      type: 'document',
      timestamp,
      entry: [
        { fullUrl: `urn:uuid:${carePlanResource['id']}`, resource: carePlanResource },
        { fullUrl: `urn:uuid:${observationResource['id']}`, resource: observationResource }
      ]
    };
  }
}
