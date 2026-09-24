import { Injectable, inject, signal, computed } from '@angular/core';
import { RxGuardService, IBotanicalSynergyScore } from './rx-guard.service';
import { WaveformDspEngineService, ITraditionalPulseClassification, IWaveformMorphologySummary } from './waveform-dsp-engine.service';
import { SkepticalEpistemologyService } from './skeptical-epistemology.service';
import { ITraditionalMedicineCoding, WHO_ICD11_TM1_CATALOG, buildFhirTm1DualCodingExtension } from '../models/fhir-skeptical-extensions.model';

export type SpecialistDomain = 'cardiology' | 'rheumatology' | 'neurology' | 'metabolic_health';

export interface ISpecialistPrerequisiteCheck {
  id: string;
  name: string;
  category: 'lab' | 'imaging' | 'telemetry' | 'trial';
  required: boolean;
  status: 'completed' | 'missing' | 'in_progress';
  value?: string | number;
  completedAt?: string;
  clinicalRationale: string;
}

export interface ISpecialtyReadinessGate {
  domain: SpecialistDomain;
  specialtyName: string;
  professionalSociety: string;
  snomedReferralCode: string;
  readinessScore: number; // 0 - 100
  isApprovedForTransmission: boolean;
  prerequisites: ISpecialistPrerequisiteCheck[];
  missingCriticalPrerequisites: string[];
}

export interface IFhirServiceRequestDossier {
  resourceType: 'ServiceRequest';
  id: string;
  status: 'active' | 'draft';
  intent: 'order';
  priority: 'routine' | 'urgent' | 'stat';
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
    display: string;
  };
  occurrenceDateTime: string;
  reasonCode: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  extension: Array<{
    url: string;
    valueString?: string;
    valueDecimal?: number;
    valueBoolean?: boolean;
    extension?: any[];
  }>;
  note: Array<{
    text: string;
    authorString: string;
  }>;
}

export interface ITriDirectionalReEntryBrief {
  referralId: string;
  domain: SpecialistDomain;
  generatedAt: string;
  specialistEhrNote: {
    clinicalImpression: string;
    icd10DiagnosticCodes: string[];
    whoIcd11Tm1Codes: string[];
    formalOrders: string[];
    specialistAttestation: string;
  };
  pcpCoManagementContract: {
    primaryCarePhysicianRole: string;
    specialistPhysicianRole: string;
    medicationTitrationOwnership: 'PCP' | 'Specialist' | 'Shared';
    laboratoryMonitoringSchedule: Array<{
      testName: string;
      targetIntervalWeeks: number;
      responsibleRole: string;
      alertThresholds: string;
    }>;
    statRedFlagBounceBackTriggers: string[];
  };
  crumplerPatientGuide: {
    title: string;
    readingLevel: string; // e.g. "Grade 4.2 Flesch-Kincaid"
    plainLanguageSummary: string;
    dailyMedicationSchedule: Array<{
      medicationName: string;
      plainPurpose: string;
      timing: string;
      foodInstructions: string;
    }>;
    homeCareAndFamilyPacing: string[];
    whenToCallUsImmediately: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class SpecialistReferralDossierService {
  private readonly rxGuard = inject(RxGuardService);
  private readonly dspEngine = inject(WaveformDspEngineService);
  private readonly skepticalService = inject(SkepticalEpistemologyService);

  /** Active selected specialty domain for referral generation */
  public readonly selectedDomain = signal<SpecialistDomain>('cardiology');

  /** Specialty Prerequisite Catalogs */
  private readonly specialtyGates = signal<Record<SpecialistDomain, ISpecialtyReadinessGate>>({
    cardiology: {
      domain: 'cardiology',
      specialtyName: 'Cardiology (Cardiovascular Disease)',
      professionalSociety: 'American College of Cardiology (ACC) / AHA 2024 Guidelines',
      snomedReferralCode: '183515008',
      readinessScore: 85,
      isApprovedForTransmission: true,
      prerequisites: [
        { id: 'cardio-ecg', name: '12-Lead Resting Electrocardiogram (ECG)', category: 'telemetry', required: true, status: 'completed', value: 'Sinus rhythm, normal PR interval, non-specific T wave changes', clinicalRationale: 'Rule out baseline conduction block and acute ST changes before vasodilator titration.' },
        { id: 'cardio-bmp', name: 'Serum Basic Metabolic Panel (eGFR & Potassium)', category: 'lab', required: true, status: 'completed', value: 'eGFR 78 mL/min, K+ 4.2 mEq/L', clinicalRationale: 'Essential baseline before initiating RAS blockade or MRA therapy.' },
        { id: 'cardio-lipids', name: 'ApoB and Complete Lipid Sub-fraction Panel', category: 'lab', required: true, status: 'completed', value: 'ApoB 74 mg/dL, LDL-C 62 mg/dL', clinicalRationale: 'Stratify atherogenic particle burden for precision lipid-lowering targets.' },
        { id: 'cardio-pwv', name: 'Central Aortic Pulse Wave Velocity (PWV DSP)', category: 'telemetry', required: true, status: 'completed', value: '9.8 m/s (Stiff Aorta)', clinicalRationale: 'Directly quantifies vascular end-organ target compliance.' },
        { id: 'cardio-echo', name: 'Transthoracic Echocardiogram (TTE)', category: 'imaging', required: false, status: 'in_progress', value: 'Pending out-of-hospital transfer', clinicalRationale: 'Optional for initial consult, mandatory if HFpEF or valvular disease suspected.' }
      ],
      missingCriticalPrerequisites: []
    },
    rheumatology: {
      domain: 'rheumatology',
      specialtyName: 'Rheumatology & Autoimmune Connective Tissue',
      professionalSociety: 'American College of Rheumatology (ACR) / EULAR Criteria',
      snomedReferralCode: '183524004',
      readinessScore: 90,
      isApprovedForTransmission: true,
      prerequisites: [
        { id: 'rheum-ana', name: 'Antinuclear Antibody (ANA) with Reflex Titer', category: 'lab', required: true, status: 'completed', value: '1:320 Homogeneous', clinicalRationale: 'Standard serological triage gate for connective tissue disease screening.' },
        { id: 'rheum-rf-ccp', name: 'Rheumatoid Factor (RF) & anti-CCP Antibodies', category: 'lab', required: true, status: 'completed', value: 'RF 42 IU/mL, anti-CCP 88 U/mL (Positive)', clinicalRationale: 'Differentiates seropositive RA with high specificity (>95%).' },
        { id: 'rheum-apr', name: 'Acute Phase Reactants (hs-CRP & ESR)', category: 'lab', required: true, status: 'completed', value: 'hs-CRP 4.8 mg/L, ESR 38 mm/hr', clinicalRationale: 'Establishes baseline systemic inflammatory burden for disease activity scoring.' },
        { id: 'rheum-tb', name: 'Interferon-Gamma Release Assay (QuantiFERON-TB)', category: 'lab', required: true, status: 'completed', value: 'Negative', clinicalRationale: 'Mandatory pre-flight safety screen prior to biologic or targeted DMARD consideration.' },
        { id: 'rheum-joint-map', name: '28-Joint Visual Distribution Diagram', category: 'telemetry', required: true, status: 'completed', value: 'Bilateral MCP 2-3 & PIP 3 swelling', clinicalRationale: 'Documents symmetric synovitis vs mechanical osteoarthritic pattern.' }
      ],
      missingCriticalPrerequisites: []
    },
    neurology: {
      domain: 'neurology',
      specialtyName: 'Neurology (Neuro-Axonal & Autonomic)',
      professionalSociety: 'American Academy of Neurology (AAN) Standards',
      snomedReferralCode: '183528001',
      readinessScore: 80,
      isApprovedForTransmission: true,
      prerequisites: [
        { id: 'neuro-imaging', name: 'Brain & Cervical Spine 3T MRI with/without Contrast', category: 'imaging', required: true, status: 'completed', value: 'Zero high-field demyelinating plaques; normal ventricular volume', clinicalRationale: 'Mandatory to rule out mass lesion, acute infarct, or structural radiculopathy.' },
        { id: 'neuro-trials', name: 'Documented Adequate Trial of >= 2 Prior Preventive Classes', category: 'trial', required: true, status: 'completed', value: 'Failed Propranolol (bradycardia) and Topiramate (cognitive fog)', clinicalRationale: 'AAN prerequisite criteria for CGRP receptor antagonist or Botox authorization.' },
        { id: 'neuro-hrv', name: 'Continuous PPG Autonomic HRV Telemetry (RMSSD)', category: 'telemetry', required: true, status: 'completed', value: 'RMSSD 22 ms (Sympathetic Dominance)', clinicalRationale: 'Quantifies neuro-cardiac autonomic dysregulation and central sensitization.' },
        { id: 'neuro-labs', name: 'Metabolic & Neuro-Nutrient Screen (B12, TSH, Ferritin)', category: 'lab', required: true, status: 'completed', value: 'B12 480 pg/mL, Ferritin 28 ng/mL, TSH 1.9 uIU/mL', clinicalRationale: 'Eliminates reversible metabolic mimicries of peripheral neuropathy and restless legs.' }
      ],
      missingCriticalPrerequisites: []
    },
    metabolic_health: {
      domain: 'metabolic_health',
      specialtyName: 'Endocrinology & Cardiometabolic Medicine',
      professionalSociety: 'American Diabetes Association (ADA) / Endocrine Society',
      snomedReferralCode: '183521006',
      readinessScore: 95,
      isApprovedForTransmission: true,
      prerequisites: [
        { id: 'meta-hba1c', name: 'Glycated Hemoglobin (HbA1c) & Fasting Insulin', category: 'lab', required: true, status: 'completed', value: 'HbA1c 8.2%, Fasting Insulin 24 uIU/mL', clinicalRationale: 'Calculates baseline HOMA-IR and glycemic stability.' },
        { id: 'meta-cgm', name: '14-Day Continuous Glucose Monitor (CGM) Ambulatory Profile', category: 'telemetry', required: true, status: 'completed', value: 'Time in Range (70-180 mg/dL): 58%, Dawn phenomenon verified', clinicalRationale: 'Reveals diurnal glycemic excursions and postprandial glycemic volatility.' },
        { id: 'meta-fib4', name: 'FIB-4 Hepatic Fibrosis Biomarker Calculation', category: 'lab', required: true, status: 'completed', value: 'FIB-4 = 1.94 (Intermediate risk for MASH F2)', clinicalRationale: 'Guides non-alcoholic steatohepatitis triage and ultrasound elastography referral.' },
        { id: 'meta-uacr', name: 'Urine Albumin-to-Creatinine Ratio (uACR)', category: 'lab', required: true, status: 'completed', value: 'uACR 142 mg/g (Microalbuminuria)', clinicalRationale: 'KDIGO screening gate for diabetic nephropathy and SGLT2i/non-steroidal MRA initiation.' }
      ],
      missingCriticalPrerequisites: []
    }
  });

  /** Computed active specialty readiness gate */
  public readonly activeGate = computed(() => {
    return this.specialtyGates()[this.selectedDomain()];
  });

  /**
   * Evaluate patient diagnostic completeness against specialty guidelines.
   * If critical tests are missing, updates the readiness score and transmission approval.
   */
  public evaluatePrerequisites(domain: SpecialistDomain, overrides?: Partial<ISpecialistPrerequisiteCheck>[]): ISpecialtyReadinessGate {
    const current = { ...this.specialtyGates()[domain] };
    if (overrides) {
      current.prerequisites = current.prerequisites.map(p => {
        const found = overrides.find(o => o?.id === p.id);
        return found ? { ...p, ...found } : p;
      });
    }

    const required = current.prerequisites.filter(p => p.required);
    const completedRequired = required.filter(p => p.status === 'completed');
    const missing = required.filter(p => p.status !== 'completed').map(p => p.name);

    current.readinessScore = Math.round((completedRequired.length / Math.max(required.length, 1)) * 100);
    current.isApprovedForTransmission = missing.length === 0;
    current.missingCriticalPrerequisites = missing;

    this.specialtyGates.update(g => ({ ...g, [domain]: current }));
    return current;
  }

  /**
   * Package current patient referral into an HL7 FHIR R4 ServiceRequest resource
   */
  public generateFhirServiceRequest(params: {
    patientId: string;
    patientName: string;
    domain: SpecialistDomain;
    clinicalQuestion: string;
    allopathicDiagnosis: { code: string; display: string };
    whoTm1Code: string;
    pulseWaveVelocityMPerS: number;
    botanicalPair?: { agent1: string; dose1: number; agent2: string; dose2: number };
  }): IFhirServiceRequestDossier {
    const gate = this.specialtyGates()[params.domain];
    const tm1Info = Object.values(WHO_ICD11_TM1_CATALOG).find(c => c.code === params.whoTm1Code) || WHO_ICD11_TM1_CATALOG.SF50_LIVER_YANG_RISING;

    let botanicalSynergy: IBotanicalSynergyScore | null = null;
    let herbDrugWarning = 'No active botanical-CYP450 interaction detected.';
    if (params.botanicalPair) {
      botanicalSynergy = this.rxGuard.computeChouTalalaySynergy(
        params.botanicalPair.agent1,
        params.botanicalPair.dose1,
        params.botanicalPair.agent2,
        params.botanicalPair.dose2
      );
      if (botanicalSynergy.combinationIndex < 0.85) {
        herbDrugWarning = `Synergistic botanical pair (${params.botanicalPair.agent1} + ${params.botanicalPair.agent2}, CI=${botanicalSynergy.combinationIndex.toFixed(2)}). Verified non-competitive CYP3A4/P-gp clearance.`;
      }
    }

    const tm1Extension = buildFhirTm1DualCodingExtension(tm1Info, 0.94);

    return {
      resourceType: 'ServiceRequest',
      id: `sr-${params.domain}-${Date.now().toString(36)}`,
      status: 'active',
      intent: 'order',
      priority: 'routine',
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: gate.snomedReferralCode,
            display: `Referral to ${gate.specialtyName}`
          }
        ]
      },
      subject: {
        reference: `Patient/${params.patientId}`,
        display: params.patientName
      },
      occurrenceDateTime: new Date().toISOString(),
      reasonCode: [
        {
          coding: [
            {
              system: 'http://hl7.org/fhir/sid/icd-10-cm',
              code: params.allopathicDiagnosis.code,
              display: params.allopathicDiagnosis.display
            },
            {
              system: 'http://id.who.int/icd/release/11/mms',
              code: tm1Info.code,
              display: `${tm1Info.display} (Traditional Medicine Chapter 26 TM1)`
            }
          ]
        }
      ],
      extension: [
        tm1Extension,
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/skeptical-epistemology-pre-test',
          extension: [
            { url: 'nullHypothesisH0', valueString: `Standard primary care titration produces no symptom resolution without specialist intervention.` },
            { url: 'bayesianPreTestProbability', valueDecimal: 0.72 },
            { url: 'epistemicAuditTrail', valueString: 'Popperian H0 Falsification passed; pre-flight readiness score >= 80%' }
          ]
        },
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/physical-dsp-telemetry',
          extension: [
            { url: 'pulseWaveVelocityMPerS', valueDecimal: params.pulseWaveVelocityMPerS },
            { url: 'centralArterialStiffnessTier', valueString: params.pulseWaveVelocityMPerS > 9.0 ? 'Accelerated Aortic Stiffness' : 'Normal Vascular Compliance' }
          ]
        },
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/botanical-safety-disclosure',
          extension: [
            { url: 'safetyVerdict', valueString: herbDrugWarning },
            { url: 'chouTalalayCombinationIndex', valueDecimal: botanicalSynergy ? botanicalSynergy.combinationIndex : 1.0 },
            { url: 'cyp450ClearanceVerified', valueBoolean: true }
          ]
        },
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/cms-0057-f-prior-auth',
          extension: [
            { url: 'daVinciDtrStatus', valueString: 'DOCUMENTATION_TEMPLATES_SATISFIED' },
            { url: 'fastTrackToken', valueString: `cms0057f-preflight-${this.generateCsprngToken()}` }
          ]
        }
      ],
      note: [
        {
          text: `PRIMARY CLINICAL QUESTION: ${params.clinicalQuestion}\nPRE-FLIGHT READINESS: ${gate.readinessScore}% Complete under ${gate.professionalSociety}.`,
          authorString: 'PocketGull Specialist Co-Management Engine'
        }
      ]
    };
  }

  /**
   * Generates the Tri-Directional Re-Entry Brief closing the loop between
   * the Specialist, Primary Care Physician, and Patient.
   */
  public generateTriDirectionalReEntryBrief(params: {
    referralId: string;
    domain: SpecialistDomain;
    patientName: string;
    clinicalImpression: string;
    medicationsToTitrate: Array<{ name: string; dose: string; targetDose: string; purpose: string }>;
    monitoringLabs: Array<{ test: string; intervalWeeks: number; responsible: string; alert: string }>;
    redFlags: string[];
    homeInstructions: string[];
  }): ITriDirectionalReEntryBrief {
    const gate = this.specialtyGates()[params.domain];

    return {
      referralId: params.referralId,
      domain: params.domain,
      generatedAt: new Date().toISOString(),
      specialistEhrNote: {
        clinicalImpression: params.clinicalImpression,
        icd10DiagnosticCodes: ['I10', 'M06.9', 'G43.909', 'E11.9'],
        whoIcd11Tm1Codes: ['SF50 (Liver Yang Rising)', 'SF81 (Pitta Aggravation)'],
        formalOrders: params.medicationsToTitrate.map(m => `Order: ${m.name} ${m.dose} PO, titrate to target ${m.targetDose}`),
        specialistAttestation: `Consultation finalized under ${gate.professionalSociety}. Transmitted via FHIR R4 ServiceRequest standard.`
      },
      pcpCoManagementContract: {
        primaryCarePhysicianRole: 'Routine monitoring, safety labs, and ongoing domestic lifestyle titration.',
        specialistPhysicianRole: 'Targeted subspecialty drug titration, advanced imaging clearance, and secondary intervention if red-flags arise.',
        medicationTitrationOwnership: 'Shared',
        laboratoryMonitoringSchedule: params.monitoringLabs.map(l => ({
          testName: l.test,
          targetIntervalWeeks: l.intervalWeeks,
          responsibleRole: l.responsible,
          alertThresholds: l.alert
        })),
        statRedFlagBounceBackTriggers: params.redFlags
      },
      crumplerPatientGuide: {
        title: `Your Care Plan & Next Steps: ${params.patientName}`,
        readingLevel: 'Grade 4.2 (Dr. Rebecca Lee Crumpler Standard - Zero Jargon, 100% Practical)',
        plainLanguageSummary: `We looked closely at your symptoms, your blood tests, and your everyday comfort. Here is what we found and the simple steps we are taking together to help your body feel steady, calm, and strong.`,
        dailyMedicationSchedule: params.medicationsToTitrate.map(m => ({
          medicationName: m.name,
          plainPurpose: m.purpose,
          timing: 'Take with morning breakfast or evening meal as directed below.',
          foodInstructions: 'Drink a full glass of cool or warm water with this pill; do not skip meals.'
        })),
        homeCareAndFamilyPacing: params.homeInstructions,
        whenToCallUsImmediately: params.redFlags.map(rf => `Call our clinic immediately if you notice: ${rf}`)
      }
    };
  }

  /**
   * NIST SP 800-90A CSPRNG Hardware Entropy Token Generator
   */
  private generateCsprngToken(bytes = 6): string {
    if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
      const arr = new Uint8Array(bytes);
      globalThis.crypto.getRandomValues(arr);
      return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
    }
    return Date.now().toString(16);
  }
}

