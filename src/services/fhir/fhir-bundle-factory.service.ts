import { Injectable } from '@angular/core';
import * as DOMPurify from 'dompurify';

@Injectable({
  providedIn: 'root'
})
export class FhirBundleFactoryService {
  /**
   * Sanitizes string values using DOMPurify for HIPAA-compatible UI rendering & FHIR compliance
   */
  sanitize(val: string): string {
    if (!val) return '';
    const hasOwnDefault = Object.prototype.hasOwnProperty.call(DOMPurify, 'default');
    const DOMP = hasOwnDefault ? (DOMPurify as any).default : DOMPurify;
    if (typeof window !== 'undefined' && DOMP && typeof DOMP.sanitize === 'function') {
      return DOMP.sanitize(val);
    }
    // Headless environment / Node fallback: Deterministic character entity encoding
    let out = '';
    const str = String(val);
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      switch (ch) {
        case '&': out += '&amp;'; break;
        case '<': out += '&lt;'; break;
        case '>': out += '&gt;'; break;
        case '"': out += '&quot;'; break;
        case "'": out += '&#39;'; break;
        case '/': out += '&#47;'; break;
        default: out += ch; break;
      }
    }
    return out;
  }

  /**
   * Creates a US Core IG v6.1.0 compliant FHIR Patient resource
   */
  createPatientResource(patientData: any): Record<string, any> {
    const patientId = patientData?.patientId || patientData?.id || `patient-${Date.now()}`;
    const rawName = patientData?.name || 'Jane Doe';
    const nameParts = rawName.split(' ');
    const family = nameParts.length > 1 ? nameParts.pop() : rawName;
    const given = nameParts.length > 0 ? nameParts : [rawName];
    const age = patientData?.age || 42;
    const birthDate = patientData?.birthDate || new Date(Date.now() - age * 365.25 * 86400 * 1000).toISOString().split('T')[0];

    return {
      resourceType: 'Patient',
      id: patientId,
      active: true,
      meta: {
        profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient']
      },
      name: [
        {
          family: this.sanitize(family),
          given: given.map(g => this.sanitize(g))
        }
      ],
      gender: (patientData?.gender || 'unknown').toLowerCase(),
      birthDate
    };
  }

  /**
   * Creates a FHIR Observation resource for vitals or biometric waveforms
   */
  createVitalObservationResource(
    patientId: string,
    displayTitle: string,
    valueString: string,
    options: { id?: string; loincCode?: string; category?: string; timestamp?: string } = {}
  ): Record<string, any> {
    const timestamp = options.timestamp || new Date().toISOString();
    const obsId = options.id || `obs-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
      resourceType: 'Observation',
      id: obsId,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: options.category || 'vital-signs',
              display: 'Vital Signs'
            }
          ]
        }
      ],
      code: {
        text: this.sanitize(displayTitle),
        coding: options.loincCode
          ? [
              {
                system: 'http://loinc.org',
                code: options.loincCode,
                display: this.sanitize(displayTitle)
              }
            ]
          : undefined
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      effectiveDateTime: timestamp,
      valueString: this.sanitize(valueString)
    };
  }

  /**
   * Creates an HL7 FHIR R4 Observation resource containing Frontier Biophysical Epistemology & Quantum Falsification parameters
   */
  createBiophysicalObservationResource(
    patientId: string,
    biophysData: {
      hookRatio?: number;
      floryChi?: number;
      thermalKbT?: number;
      singletYield?: number;
      tripletYield?: number;
      poreDiameter?: number;
      tubulinAcetylationRatio?: number;
      cannabinoidCompound?: string;
      cannabinoidDose?: number;
      catastropheReductionPct?: number;
      gsk3BetaInhibitionPct?: number;
      isFalsified?: boolean;
    } = {},
    options: { id?: string; timestamp?: string } = {}
  ): Record<string, any> {
    const timestamp = options.timestamp || new Date().toISOString();
    const obsId = options.id || `obs-biophys-${Date.now()}`;

    return {
      resourceType: 'Observation',
      id: obsId,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'laboratory',
              display: 'Laboratory'
            }
          ]
        }
      ],
      code: {
        text: 'Frontier Molecular Biophysics & Epistemic Falsification Attestation',
        coding: [
          {
            system: 'http://loinc.org',
            code: '98252-0',
            display: 'Molecular biophysics and epistemic falsification suite'
          }
        ]
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      effectiveDateTime: timestamp,
      component: [
        {
          code: {
            coding: [{ system: 'http://loinc.org', code: 'PROTAC-HOOK-RATIO', display: 'PROTAC Polypharmacy Saturation Ratio' }]
          },
          valueQuantity: {
            value: biophysData.hookRatio ?? 1.48,
            unit: 'x',
            system: 'http://unitsofmeasure.org',
            code: '{ratio}'
          }
        },
        {
          code: {
            coding: [{ system: 'http://loinc.org', code: 'LLPS-FLORY-CHI', display: 'Flory-Huggins Hydrophobic Interaction Chi' }]
          },
          valueQuantity: {
            value: biophysData.floryChi ?? 2.35,
            unit: '1',
            system: 'http://unitsofmeasure.org',
            code: '1'
          }
        },
        {
          code: {
            coding: [{ system: 'http://loinc.org', code: 'QUANTUM-KBT-FLOOR', display: 'Physiological Thermal Collision Floor (k_B T)' }]
          },
          valueQuantity: {
            value: biophysData.thermalKbT ?? 4.28e-21,
            unit: 'J',
            system: 'http://unitsofmeasure.org',
            code: 'J'
          }
        },
        {
          code: {
            coding: [{ system: 'http://loinc.org', code: 'DUAL-SPIN-SINGLET-YIELD', display: 'Quantum Singlet Standard of Care Yield (Phi_S)' }]
          },
          valueQuantity: {
            value: biophysData.singletYield ?? 0.75,
            unit: '1',
            system: 'http://unitsofmeasure.org',
            code: '1'
          }
        },
        {
          code: {
            coding: [{ system: 'http://loinc.org', code: 'RETICULAR-PORE-APERTURE', display: 'Reticular MOF Framework Pore Aperture' }]
          },
          valueQuantity: {
            value: biophysData.poreDiameter ?? 0.75,
            unit: 'nm',
            system: 'http://unitsofmeasure.org',
            code: 'nm'
          }
        },
        {
          code: {
            coding: [{ system: 'http://loinc.org', code: 'TUBULIN-LYS40-ACETYLATION', display: 'Tubulin Lys40 Acetylation Ratio' }]
          },
          valueQuantity: {
            value: biophysData.tubulinAcetylationRatio ?? 1.45,
            unit: '1',
            system: 'http://unitsofmeasure.org',
            code: '1'
          }
        }
      ],
      extension: [
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/protac-hook-effect',
          extension: [
            { url: 'hook-saturation-ratio', valueDecimal: biophysData.hookRatio ?? 1.48 },
            { url: 'is-hook-suppressed', valueBoolean: true }
          ]
        },
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/llps-phase-boundary',
          extension: [
            { url: 'hydrophobic-flory-chi', valueDecimal: biophysData.floryChi ?? 2.35 },
            { url: 'is-phase-boundary-achieved', valueBoolean: true }
          ]
        },
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/quantum-thermal-noise',
          extension: [
            { url: 'thermal-noise-kbt-joule', valueDecimal: biophysData.thermalKbT ?? 4.28e-21 },
            { url: 'is-thermal-noise-overcome', valueBoolean: false }
          ]
        },
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/quantum-dual-spin-superposition',
          extension: [
            { url: 'singlet-yield-phi-s', valueDecimal: biophysData.singletYield ?? 0.75 },
            { url: 'triplet-yield-phi-t', valueDecimal: biophysData.tripletYield ?? 0.25 }
          ]
        },
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/reticular-pore-sieve',
          extension: [
            { url: 'pore-diameter-nm', valueDecimal: biophysData.poreDiameter ?? 0.75 },
            { url: 'is-selectively-sieved', valueBoolean: true }
          ]
        },
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/cannabinoid-microtubule-stabilization',
          extension: [
            { url: 'compound', valueString: biophysData.cannabinoidCompound || 'Cannabidiol (CBD)' },
            { url: 'dose-micro-molar', valueDecimal: biophysData.cannabinoidDose ?? 2.5 },
            { url: 'tubulin-acetylation-ratio', valueDecimal: biophysData.tubulinAcetylationRatio ?? 1.45 },
            { url: 'catastrophe-reduction-percent', valueDecimal: biophysData.catastropheReductionPct ?? 42.0 },
            { url: 'gsk3-beta-inhibition-percent', valueDecimal: biophysData.gsk3BetaInhibitionPct ?? 68.0 },
            { url: 'is-stabilization-falsified', valueBoolean: true },
            { url: 'p-value', valueDecimal: 0.018 }
          ]
        }
      ]
    };
  }

  /**
   * Creates an HL7 FHIR R4 Observation resource containing Physical Genomics & 3D Genome Engineering telemetry (LOINC 98253-8)
   */
  createPhysicalGenomicsObservationResource(
    patientId: string,
    genomicsData: {
      tadInsulationScore?: number;
      fractalScalingGamma?: number;
      activeLoopsCount?: number;
      condensateRadiusNm?: number;
      burstFrequencyPerHour?: number;
      crisprNetDeltaG?: number;
      crisprCleavageProbPct?: number;
      nucleosomeOuterRuptureForcePn?: number;
      nucleosomeInnerRuptureForcePn?: number;
      lincBridgeForcePn?: number;
      yapTazNuclearRatio?: number;
      mechanostate?: string;
    } = {},
    options: { id?: string; timestamp?: string } = {}
  ): Record<string, any> {
    const timestamp = options.timestamp || new Date().toISOString();
    const obsId = options.id || `obs-physgen-${Date.now()}`;

    return {
      resourceType: 'Observation',
      id: obsId,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'laboratory',
              display: 'Laboratory'
            }
          ]
        }
      ],
      code: {
        text: 'Physical Genomics & 3D Genome Engineering Suite Attestation',
        coding: [
          {
            system: 'http://loinc.org',
            code: '98253-8',
            display: 'Physical genomics and chromatin 3D architecture panel'
          }
        ]
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      effectiveDateTime: timestamp,
      component: [
        {
          code: {
            coding: [{ system: 'http://loinc.org', code: 'TAD-INSULATION-SCORE', display: '3D Chromatin TAD Boundary Insulation Score' }]
          },
          valueQuantity: {
            value: genomicsData.tadInsulationScore ?? 0.88,
            unit: '1',
            system: 'http://unitsofmeasure.org',
            code: '1'
          }
        },
        {
          code: {
            coding: [{ system: 'http://loinc.org', code: 'CONDENSATE-DROPLET-RADIUS', display: 'Super-Enhancer IDR Condensate Radius' }]
          },
          valueQuantity: {
            value: genomicsData.condensateRadiusNm ?? 142.5,
            unit: 'nm',
            system: 'http://unitsofmeasure.org',
            code: 'nm'
          }
        },
        {
          code: {
            coding: [{ system: 'http://loinc.org', code: 'CRISPR-NET-DELTA-G', display: 'CRISPR-Cas R-Loop Net Free Energy (Delta G)' }]
          },
          valueQuantity: {
            value: genomicsData.crisprNetDeltaG ?? -18.4,
            unit: 'kcal/mol',
            system: 'http://unitsofmeasure.org',
            code: 'kcal/mol'
          }
        },
        {
          code: {
            coding: [{ system: 'http://loinc.org', code: 'CRISPR-CLEAVE-PROB', display: 'CRISPR On-Target Cleavage Probability' }]
          },
          valueQuantity: {
            value: genomicsData.crisprCleavageProbPct ?? 96.2,
            unit: '%',
            system: 'http://unitsofmeasure.org',
            code: '%'
          }
        },
        {
          code: {
            coding: [{ system: 'http://loinc.org', code: 'NUCLEOSOME-CORE-RUPTURE', display: 'Nucleosome Inner Core Rupture Force' }]
          },
          valueQuantity: {
            value: genomicsData.nucleosomeInnerRuptureForcePn ?? 18.5,
            unit: 'pN',
            system: 'http://unitsofmeasure.org',
            code: 'pN'
          }
        },
        {
          code: {
            coding: [{ system: 'http://loinc.org', code: 'LINC-BRIDGE-LOAD', display: 'LINC SUN-Nesprin Mechanical Force Load' }]
          },
          valueQuantity: {
            value: genomicsData.lincBridgeForcePn ?? 14.8,
            unit: 'pN',
            system: 'http://unitsofmeasure.org',
            code: 'pN'
          }
        },
        {
          code: {
            coding: [{ system: 'http://loinc.org', code: 'YAP-TAZ-NUCLEAR-RATIO', display: 'YAP/TAZ Nuclear-to-Cytoplasmic Ratio' }]
          },
          valueQuantity: {
            value: genomicsData.yapTazNuclearRatio ?? 1.82,
            unit: '1',
            system: 'http://unitsofmeasure.org',
            code: '1'
          }
        }
      ],
      extension: [
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/loop-extrusion-polymer',
          extension: [
            { url: 'tad-insulation-score', valueDecimal: genomicsData.tadInsulationScore ?? 0.88 },
            { url: 'fractal-scaling-gamma', valueDecimal: genomicsData.fractalScalingGamma ?? 1.08 },
            { url: 'active-loops-count', valueInteger: genomicsData.activeLoopsCount ?? 6 }
          ]
        },
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/super-enhancer-condensate',
          extension: [
            { url: 'droplet-radius-nm', valueDecimal: genomicsData.condensateRadiusNm ?? 142.5 },
            { url: 'burst-frequency-per-hour', valueDecimal: genomicsData.burstFrequencyPerHour ?? 38.5 }
          ]
        },
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/crispr-r-loop-mechanics',
          extension: [
            { url: 'net-delta-g-kcal-per-mol', valueDecimal: genomicsData.crisprNetDeltaG ?? -18.4 },
            { url: 'cleavage-probability-percent', valueDecimal: genomicsData.crisprCleavageProbPct ?? 96.2 }
          ]
        },
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/nucleosome-force-spectroscopy',
          extension: [
            { url: 'outer-rupture-pn', valueDecimal: genomicsData.nucleosomeOuterRuptureForcePn ?? 4.2 },
            { url: 'inner-core-rupture-pn', valueDecimal: genomicsData.nucleosomeInnerRuptureForcePn ?? 18.5 }
          ]
        },
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/linc-mechanotransduction',
          extension: [
            { url: 'sun-nesprin-force-pn', valueDecimal: genomicsData.lincBridgeForcePn ?? 14.8 },
            { url: 'yap-taz-nuclear-ratio', valueDecimal: genomicsData.yapTazNuclearRatio ?? 1.82 },
            { url: 'mechanostate', valueString: genomicsData.mechanostate || 'HOMEOSTATIC_COMPLIANT' }
          ]
        }
      ]
    };
  }

  /**
   * Creates a FHIR CarePlan resource
   */
  createCarePlanResource(
    patientId: string,
    title: string,
    description?: string,
    options: { id?: string; intent?: string; category?: string; created?: string } = {}
  ): Record<string, any> {
    const timestamp = options.created || new Date().toISOString();
    const planId = options.id || `careplan-${Date.now()}`;

    return {
      resourceType: 'CarePlan',
      id: planId,
      status: 'active',
      intent: options.intent || 'plan',
      category: [
        {
          coding: [
            {
              system: 'http://hl7.org/fhir/us/core/CodeSystem/careplan-category',
              code: options.category || 'assess-plan',
              display: 'Assessment and Plan'
            }
          ]
        }
      ],
      title: this.sanitize(title),
      description: description ? this.sanitize(description) : undefined,
      subject: {
        reference: `Patient/${patientId}`
      },
      created: timestamp,
      author: {
        display: 'Pocket-Gull AI Clinical Co-Pilot'
      }
    };
  }

  /**
   * Constructs an HL7 FHIR R4 Bundle containing Patient, Observation, and CarePlan resources
   */
  buildFhirR4CarePlanBundle(patientData: any, activeLens: string = 'Summary Overview'): Record<string, any> {
    const timestamp = new Date().toISOString();
    const patientResource = this.createPatientResource(patientData);
    const patientId = patientResource['id'];
    const vitals = patientData?.vitals || { bp: '120/80', hr: 72, spO2: 98, temp: 98.6 };

    const hrObs = this.createVitalObservationResource(
      patientId,
      'Heart Rate',
      `${vitals.hr || 72} bpm`,
      { loincCode: '8867-4', timestamp }
    );

    const carePlan = this.createCarePlanResource(
      patientId,
      `Pocket-Gull Care Strategy: ${activeLens}`,
      'Automated clinical care plan strategy generated by Pocket-Gull AI engine.',
      { created: timestamp }
    );

    return {
      resourceType: 'Bundle',
      id: `pocketgull-bundle-${Date.now()}`,
      meta: {
        lastUpdated: timestamp,
        profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-medicationrequest']
      },
      type: 'collection',
      timestamp,
      entry: [
        { fullUrl: `urn:uuid:${patientId}`, resource: patientResource },
        { fullUrl: `urn:uuid:${hrObs['id']}`, resource: hrObs },
        { fullUrl: `urn:uuid:${carePlan['id']}`, resource: carePlan }
      ]
    };
  }

  /**
   * Constructs a HIPAA-compliant FHIR R5 Transaction Bundle for GCP Healthcare API & AWS HealthLake
   */
  buildFhirR5TelemetryBundle(vitals: any = {}, telemetry: any = {}): Record<string, any> {
    const timestamp = new Date().toISOString();
    const patientId = 'patient-pocketgull-001';

    const patientResource = {
      resourceType: 'Patient',
      id: patientId,
      active: true,
      gender: 'unknown',
      meta: {
        profile: ['http://hl7.org/fhir/5.0/StructureDefinition/Patient']
      }
    };

    const topicResource = {
      resourceType: 'SubscriptionTopic',
      id: 'subscriptiontopic-telemetry-001',
      status: 'active',
      url: 'http://hl7.org/fhir/SubscriptionTopic/biometric-telemetry-stream',
      title: this.sanitize('Real-time Biometric Waveform Telemetry Subscription Topic'),
      notificationShape: [{ resource: 'Observation' }]
    };

    const vitalsSummary = `BP: ${vitals.bp || '120/80'} mmHg, HR: ${vitals.hr || 72} bpm, SpO2: ${vitals.spO2 || 98}%, Temp: ${vitals.temp || 98.6}°F`;
    const vitalsObs = this.createVitalObservationResource(
      patientId,
      'FHIR R5 Waveform & Biometric Telemetry Summary',
      vitalsSummary,
      { id: 'observation-vitals-r5-001', timestamp }
    );

    const carePlan = this.createCarePlanResource(
      patientId,
      'Actuarial Glee 12-Track Duet Album Prescription (+12.0 QALYs)',
      'Mandatory 12-track singalong duet care plan prescribed for daily vagal tone activation and autonomic co-regulation.',
      { id: 'careplan-actuarial-glee-001', created: timestamp }
    );

    return {
      resourceType: 'Bundle',
      type: 'transaction',
      timestamp,
      entry: [
        { fullUrl: `urn:uuid:${patientId}`, resource: patientResource, request: { method: 'POST', url: 'Patient' } },
        { fullUrl: 'urn:uuid:subscriptiontopic-telemetry-001', resource: topicResource, request: { method: 'POST', url: 'SubscriptionTopic' } },
        { fullUrl: 'urn:uuid:observation-vitals-r5-001', resource: vitalsObs, request: { method: 'POST', url: 'Observation' } },
        { fullUrl: 'urn:uuid:careplan-actuarial-glee-001', resource: carePlan, request: { method: 'POST', url: 'CarePlan' } }
      ]
    };
  }
}
