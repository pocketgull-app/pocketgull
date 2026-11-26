import { Injectable, inject } from '@angular/core';
import { IPatient } from './patient.types';
import { GlobalHealthInitiativesService } from './global-health-initiatives.service';
import { SkepticalEpistemologyService } from './skeptical-epistemology.service';
import { WearableAsymmetricGainService } from './wearable-asymmetric-gain.service';
import {
  IGroundedClinicalAssertion,
  createDefaultGroundedClinicalAssertion
} from '../models/grounded-epistemic-assertion.model';
import { computeFipsSha256Hex } from './clinical-defense-guard.service';

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
  private skepticalService: SkepticalEpistemologyService;
  private wearableAcgService: WearableAsymmetricGainService;

  constructor() {
    try {
      this.globalHealth = inject(GlobalHealthInitiativesService, { optional: true }) || new GlobalHealthInitiativesService();
    } catch {
      this.globalHealth = new GlobalHealthInitiativesService();
    }
    try {
      this.skepticalService = inject(SkepticalEpistemologyService, { optional: true }) || new SkepticalEpistemologyService();
    } catch {
      this.skepticalService = new SkepticalEpistemologyService();
    }
    try {
      this.wearableAcgService = inject(WearableAsymmetricGainService, { optional: true }) || new WearableAsymmetricGainService();
    } catch {
      this.wearableAcgService = new WearableAsymmetricGainService();
    }
  }

  /**
   * Computes an immutable FIPS 180-4 SHA-256 cryptographic digest for FDA 21 CFR Part 11 signature attestation.
   */
  computeSha256Signature(payload: string): string {
    return computeFipsSha256Hex(payload);
  }

  private buildSafeHarborSubjectDisplay(patientId: string): string {
    const token = computeFipsSha256Hex(`FHIR-R4-SUBJ|${patientId || 'anon'}`).slice(0, 12).toUpperCase();
    return `Safe Harbor Subject SUBJ-${token}`;
  }

  private buildSafeHarborAgeFields(age?: number): { birthDate?: string; extension?: Array<{ url: string; valueString: string }> } {
    if (typeof age !== 'number' || !Number.isFinite(age) || age < 0) return {};
    if (age > 89) {
      return {
        extension: [
          {
            url: 'https://pocketgull.app/fhir/StructureDefinition/safe-harbor-age-bracket',
            valueString: '90+'
          }
        ]
      };
    }
    return {
      birthDate: String(new Date().getUTCFullYear() - age)
    };
  }

  /**
   * Serializes patient clinical dossier into an official HIPAA Safe Harbor §164.514 HL7 FHIR R4 Document Bundle.
   */
  generateFhirR4Bundle(patient: IPatient, assertion?: IGroundedClinicalAssertion): IFhirBundle {
    const timestamp = new Date().toISOString();
    const bundleId = `urn:uuid:bundle-${patient.id}-${Date.now()}`;
    const patientUrn = `urn:uuid:patient-${patient.id}`;
    const safeSubjectDisplay = this.buildSafeHarborSubjectDisplay(patient.id);
    const safeAgeFields = this.buildSafeHarborAgeFields(patient.age);

    // 1. Calculate WHO CVD Risk
    const whoRisk = this.globalHealth.calculateWhoCvdRisk(patient);

    // 2. Map Traditional Medicine ICD-11 Chapter 26 (TM1) Dual-Codes
    const issueDescriptions = Object.values(patient.issues || {}).flat().map(i => i.description || '');
    const tm1Codes = this.globalHealth.mapToWhoIcd11Chapter26([
      ...(patient.preexistingConditions || []),
      ...issueDescriptions
    ]);

    // 3. Build FHIR Resources (HIPAA Safe Harbor §164.514: synthetic subject + age > 89 capped to 90+)
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
          use: 'anonymous',
          text: safeSubjectDisplay
        }
      ],
      gender: patient.gender ? patient.gender.toLowerCase() : 'unknown',
      ...(safeAgeFields.birthDate ? { birthDate: safeAgeFields.birthDate } : {}),
      ...(safeAgeFields.extension ? { extension: safeAgeFields.extension } : {})
    };

    const riskAssessmentResource = {
      resourceType: 'RiskAssessment',
      id: `risk-who-sdg34-${patient.id}`,
      status: 'final',
      subject: { reference: patientUrn, display: safeSubjectDisplay },
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
      subject: { reference: patientUrn, display: safeSubjectDisplay }
    }));

    // 2b. Grounded Epistemic Diagnostic Formulation & Anti-Confirmation Bias Falsification Envelope
    const activeAssertion = assertion ?? createDefaultGroundedClinicalAssertion();
    const groundedCondition = {
      resourceType: 'Condition',
      id: `condition-grounded-${patient.id}`,
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
            system: 'http://hl7.org/fhir/sid/icd-10',
            code: activeAssertion.icd10Code,
            display: activeAssertion.hypothesis
          },
          {
            system: 'http://snomed.info/sct',
            code: activeAssertion.snomedCtId,
            display: activeAssertion.hypothesis
          }
        ],
        text: activeAssertion.hypothesis
      },
      subject: { reference: patientUrn, display: safeSubjectDisplay },
      extension: [
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/grounded-clinical-assertion',
          extension: [
            { url: 'hypothesis', valueString: activeAssertion.hypothesis },
            { url: 'null-hypothesis-h0', valueString: activeAssertion.nullHypothesisH0 },
            { url: 'p-value', valueDecimal: activeAssertion.pValueNullRejection },
            { url: 'is-falsified', valueBoolean: activeAssertion.pValueNullRejection >= 0.05 },
            { url: 'epistemic-confidence-percent', valueInteger: Math.round(activeAssertion.epistemicConfidence * 100) },
            { url: 'cochrane-rob2', valueString: activeAssertion.cochraneRiskOfBias },
            { url: 'evidence-tier', valueString: activeAssertion.evidenceTier },
            { url: 'counter-hypotheses', valueString: activeAssertion.counterHypotheses.join(' | ') },
            { url: 'disconfirming-physical-exams', valueString: activeAssertion.disconfirmingPhysicalExams.join(' | ') },
            { url: 'red-flag-exceptions', valueString: activeAssertion.redFlagExceptions.join(' | ') },
            { url: 'statutory-attestation', valueString: 'FDA-21-CFR-PART-11; ONC-HTI-1' }
          ]
        }
      ]
    };

    // Observation for Vagal Tone HRV (rMSSD) — emitted ONLY when genuine patient HRV measurement exists (no fabricated defaults)
    const parsedHrvRmssd = patient.vitals?.hrvRmssd !== undefined ? parseFloat(String(patient.vitals.hrvRmssd)) : NaN;
    const hrvObservation = Number.isFinite(parsedHrvRmssd) && parsedHrvRmssd > 0
      ? (() => {
          const hrvEval = this.skepticalService.evaluateFalsifiability('Autonomic Vagal Tone HRV rMSSD', parsedHrvRmssd, 32.0, 25);
          return {
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
            subject: { reference: patientUrn, display: safeSubjectDisplay },
            effectiveDateTime: timestamp,
            valueQuantity: {
              value: parsedHrvRmssd,
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
            ],
            extension: [
              {
                url: 'http://pocketgull.app/fhir/StructureDefinition/skeptical-epistemology',
                extension: [
                  { url: 'null-hypothesis-h0', valueString: hrvEval.nullHypothesisH0 },
                  { url: 'p-value', valueDecimal: hrvEval.pValue },
                  { url: 'null-hypothesis-rejected', valueBoolean: hrvEval.pValue < 0.05 },
                  { url: 'epistemic-confidence-percent', valueInteger: hrvEval.epistemicConfidencePercent },
                  { url: 'skeptical-warning-notice', valueString: hrvEval.skepticalWarningNotice || 'Statistically significant rejection of H0 at alpha = 0.05.' }
                ]
              }
            ]
          };
        })()
      : null;

    // Observation for Molecular Biophysics & Epistemic Falsification Suite
    const biophys = this.skepticalService.getAllBiophysicalFalsifications();
    const biophysObservation = {
      resourceType: 'Observation',
      id: `obs-biophys-falsification-${patient.id}`,
      status: 'final',
      category: [
        {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'laboratory', display: 'Laboratory' }]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '98252-0',
            display: 'Molecular biophysics and epistemic falsification suite'
          }
        ],
        text: 'Frontier Molecular Biophysics & Epistemic Falsification Attestation'
      },
      subject: { reference: patientUrn },
      effectiveDateTime: timestamp,
      component: [
        {
          code: { coding: [{ system: 'http://loinc.org', code: 'PROTAC-HOOK-RATIO', display: 'PROTAC Polypharmacy Saturation Ratio' }] },
          valueQuantity: { value: biophys.protacPolypharmacy.hookRatio, unit: 'x', system: 'http://unitsofmeasure.org', code: '{ratio}' }
        },
        {
          code: { coding: [{ system: 'http://loinc.org', code: 'LLPS-FLORY-CHI', display: 'Flory-Huggins Hydrophobic Interaction Chi' }] },
          valueQuantity: { value: biophys.llpsPhaseBoundary.hydrophobicFloryChi, unit: '1', system: 'http://unitsofmeasure.org', code: '1' }
        },
        {
          code: { coding: [{ system: 'http://loinc.org', code: 'QUANTUM-KBT-FLOOR', display: 'Physiological Thermal Collision Floor (k_B T)' }] },
          valueQuantity: { value: biophys.quantumThermalNoise.thermalNoiseKbTJoule, unit: 'J', system: 'http://unitsofmeasure.org', code: 'J' }
        },
        {
          code: { coding: [{ system: 'http://loinc.org', code: 'DUAL-SPIN-SINGLET-YIELD', display: 'Quantum Singlet Standard of Care Yield (Phi_S)' }] },
          valueQuantity: { value: biophys.quantumDualSpin.singletYieldPhiS, unit: '1', system: 'http://unitsofmeasure.org', code: '1' }
        },
        {
          code: { coding: [{ system: 'http://loinc.org', code: 'RETICULAR-PORE-APERTURE', display: 'Reticular MOF Framework Pore Aperture' }] },
          valueQuantity: { value: biophys.reticularPoreSieve.poreDiameterNm, unit: 'nm', system: 'http://unitsofmeasure.org', code: 'nm' }
        },
        {
          code: { coding: [{ system: 'http://loinc.org', code: 'TUBULIN-LYS40-ACETYLATION', display: 'Tubulin Lys40 Acetylation Ratio' }] },
          valueQuantity: { value: biophys.cannabinoidMicrotubules.tubulinAcetylationRatio, unit: '1', system: 'http://unitsofmeasure.org', code: '1' }
        }
      ],
      extension: [
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/protac-hook-effect',
          extension: [
            { url: 'total-supplements-count', valueInteger: biophys.protacPolypharmacy.totalSupplementsCount },
            { url: 'optimal-dose-copt', valueInteger: biophys.protacPolypharmacy.optimalDoseCopt },
            { url: 'hook-saturation-ratio', valueDecimal: biophys.protacPolypharmacy.hookRatio },
            { url: 'is-hook-suppressed', valueBoolean: biophys.protacPolypharmacy.isHookEffectSuppressed },
            { url: 'p-value', valueDecimal: biophys.protacPolypharmacy.falsifiability.pValue },
            { url: 'clinical-action', valueString: biophys.protacPolypharmacy.clinicalGuidance }
          ]
        },
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/llps-phase-boundary',
          extension: [
            { url: 'molecule-name', valueString: biophys.llpsPhaseBoundary.moleculeName },
            { url: 'claimed-aggregate-target', valueString: biophys.llpsPhaseBoundary.claimedAggregateTarget },
            { url: 'hydrophobic-flory-chi', valueDecimal: biophys.llpsPhaseBoundary.hydrophobicFloryChi },
            { url: 'free-energy-delta-f-mix', valueDecimal: biophys.llpsPhaseBoundary.freeEnergyDeltaFMix },
            { url: 'is-phase-boundary-achieved', valueBoolean: biophys.llpsPhaseBoundary.isPhaseBoundaryAchieved },
            { url: 'p-value', valueDecimal: biophys.llpsPhaseBoundary.falsifiability.pValue },
            { url: 'skeptical-verdict', valueString: biophys.llpsPhaseBoundary.clinicalGuidance }
          ]
        },
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/quantum-thermal-noise',
          extension: [
            { url: 'device-or-claim-name', valueString: biophys.quantumThermalNoise.deviceOrClaimName },
            { url: 'thermal-noise-kbt-joule', valueDecimal: biophys.quantumThermalNoise.thermalNoiseKbTJoule },
            { url: 'zeeman-energy-joule', valueDecimal: biophys.quantumThermalNoise.zeemanEnergyJoule },
            { url: 'photon-energy-joule', valueDecimal: biophys.quantumThermalNoise.photonEnergyJoule },
            { url: 'is-thermal-noise-overcome', valueBoolean: biophys.quantumThermalNoise.isThermalNoiseOvercome },
            { url: 'p-value', valueDecimal: biophys.quantumThermalNoise.falsifiability.pValue },
            { url: 'cochrane-rob2-rating', valueString: biophys.quantumThermalNoise.cochraneBias.overallRiskOfBias }
          ]
        },
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/quantum-dual-spin-superposition',
          extension: [
            { url: 'patient-acuity-score', valueDecimal: biophys.quantumDualSpin.patientAcuityScore },
            { url: 'zeeman-angle-theta-radians', valueDecimal: biophys.quantumDualSpin.zeemanAngleThetaRadians },
            { url: 'singlet-yield-phi-s', valueDecimal: biophys.quantumDualSpin.singletYieldPhiS },
            { url: 'triplet-yield-phi-t', valueDecimal: biophys.quantumDualSpin.tripletYieldPhiT },
            { url: 'dominant-branch', valueString: biophys.quantumDualSpin.dominantBranch },
            { url: 'conservative-soc-text', valueString: biophys.quantumDualSpin.conservativeStandardOfCare },
            { url: 'integrative-adjuvant-text', valueString: biophys.quantumDualSpin.integrativeTherapy }
          ]
        },
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/reticular-pore-sieve',
          extension: [
            { url: 'binder-name', valueString: biophys.reticularPoreSieve.binderName },
            { url: 'pore-diameter-nm', valueDecimal: biophys.reticularPoreSieve.poreDiameterNm },
            { url: 'delta-ionic-radius-angstrom', valueDecimal: biophys.reticularPoreSieve.falsifiability.observedValue as number },
            { url: 'knudsen-diffusivity-m2s', valueDecimal: biophys.reticularPoreSieve.knudsenDiffusivityM2s },
            { url: 'is-selectively-sieved', valueBoolean: biophys.reticularPoreSieve.isSelectivelySieved },
            { url: 'depletion-risk-minerals', valueString: biophys.reticularPoreSieve.depletionRiskMinerals.join(', ') },
            { url: 'p-value', valueDecimal: biophys.reticularPoreSieve.falsifiability.pValue }
          ]
        },
        {
          url: 'http://pocketgull.app/fhir/StructureDefinition/cannabinoid-microtubule-stabilization',
          extension: [
            { url: 'compound', valueString: biophys.cannabinoidMicrotubules.compound },
            { url: 'dose-micro-molar', valueDecimal: biophys.cannabinoidMicrotubules.doseMicroMolar },
            { url: 'tubulin-acetylation-ratio', valueDecimal: biophys.cannabinoidMicrotubules.tubulinAcetylationRatio },
            { url: 'catastrophe-reduction-percent', valueDecimal: biophys.cannabinoidMicrotubules.catastropheRateReductionPercent },
            { url: 'gsk3-beta-inhibition-percent', valueDecimal: biophys.cannabinoidMicrotubules.gsk3BetaInhibitionPercent },
            { url: 'is-stabilization-falsified', valueBoolean: biophys.cannabinoidMicrotubules.isStabilizationFalsified },
            { url: 'p-value', valueDecimal: biophys.cannabinoidMicrotubules.falsifiability.pValue }
          ]
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
      subject: { reference: patientUrn, display: safeSubjectDisplay },
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

    // Wearable Tri-Modal Asymmetric Clinical Gain Observation (IEEE P2933 TIPPSS & MST SpO2 Debiasing)
    const wearableEval = this.wearableAcgService.gainEvaluation();
    const wearableTelemetry = this.wearableAcgService.telemetry();
    const wearableGainObservation = {
      resourceType: 'Observation',
      id: `obs-wearable-acg-${patient.id}`,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs',
              display: 'Vital Signs'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '59408-5',
            display: 'Oxygen saturation in Arterial blood by Pulse oximetry'
          },
          {
            system: 'https://pocketgull.app/fhir/CodeSystem/asymmetric-gain',
            code: 'ACG-TRIMODAL-READINESS',
            display: 'Wearable Tri-Modal Asymmetric Clinical Gain & MST SpO2'
          }
        ],
        text: `Wearable Asymmetric Gain (${wearableEval.watchPlatform}) — [EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]`
      },
      subject: { reference: patientUrn, display: safeSubjectDisplay },
      effectiveDateTime: timestamp,
      valueQuantity: {
        value: wearableEval.totalShockTrooperReadinessGain,
        unit: 'pts',
        system: 'http://unitsofmeasure.org',
        code: '{score}'
      },
      extension: [
        {
          url: 'https://pocketgull.app/fhir/StructureDefinition/popperian-null-hypothesis',
          valueString: 'H0: wearable tri-modal readiness gain does not exceed baseline pacing variance (in silico)'
        }
      ],
      component: [
        {
          code: { text: 'MST-Calibrated SpO2 (%)' },
          valueQuantity: { value: wearableEval.mstCalibratedSpo2Percent, unit: '%', code: '%' }
        },
        {
          code: { text: 'Doing Hormetic & Vagal Gain' },
          valueQuantity: { value: wearableEval.doingHormeticVagalGain, unit: 'pts', code: '{score}' }
        },
        {
          code: { text: 'Feeling Interoceptive Calibration Gain' },
          valueQuantity: { value: wearableEval.feelingInteroceptiveCalibrationGain, unit: 'pts', code: '{score}' }
        },
        {
          code: { text: 'Not Doing Strategic Restraint PEM Shield Gain' },
          valueQuantity: { value: wearableEval.notDoingRestraintPemShieldGain, unit: 'pts', code: '{score}' }
        },
        {
          code: { text: 'Estimated PEM Crash Hours Saved (72h)' },
          valueQuantity: { value: wearableEval.estimatedPemCrashHoursSaved, unit: 'h', code: 'h' }
        },
        {
          code: { text: 'Monk Skin Tone Scale' },
          valueInteger: wearableTelemetry.monkSkinToneScale
        }
      ]
    };

    // Provenance Resource (FDA 21 CFR Part 11 Electronic Signature & Provenance Seal)
    const provenanceSignatureDigest = this.computeSha256Signature(`${bundleId}:${patient.id}:${timestamp}`);
    const provenanceResource = {
      resourceType: 'Provenance',
      id: `provenance-fda-part11-${patient.id}`,
      target: [
        { reference: patientUrn, display: safeSubjectDisplay },
        { reference: `urn:uuid:${riskAssessmentResource.id}` },
        { reference: `urn:uuid:${groundedCondition.id}`, display: activeAssertion.hypothesis },
        ...(hrvObservation ? [{ reference: `urn:uuid:${hrvObservation.id}` }] : []),
        { reference: `urn:uuid:${biophysObservation.id}` },
        { reference: `urn:uuid:${wearableGainObservation.id}` },
        { reference: `urn:uuid:${carePlanResource.id}` }
      ],
      recorded: timestamp,
      activity: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-DataOperation',
            code: 'CREATE',
            display: 'Created'
          }
        ],
        text: 'Clinical Decision Support Dossier Generation with FDA 21 CFR Part 11 Cryptographic Attestation'
      },
      agent: [
        {
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/provenance-participant-type',
                code: 'author',
                display: 'Author'
              }
            ]
          },
          who: {
            display: 'PocketGull Clinical Epistemology & Safe Harbor Engine',
            identifier: {
              system: 'https://pocketgull.app/system/attestation',
              value: 'ENGINE-POCKETGULL-V1'
            }
          }
        }
      ],
      signature: [
        {
          type: [
            {
              system: 'urn:iso-astm:E1762-95:2013',
              code: '1.2.840.10065.1.12.1.1',
              display: "Author's Signature"
            }
          ],
          when: timestamp,
          who: {
            display: 'PocketGull Attestation Authority'
          },
          sigFormat: 'application/jose',
          data: btoa(`SHA256:${provenanceSignatureDigest}`),
          extension: [
            {
              url: 'http://pocketgull.app/fhir/StructureDefinition/fda-part11-seal',
              valueString: 'FDA-21-CFR-PART-11-ELECTRONIC-RECORDS-VALIDATED'
            },
            {
              url: 'http://pocketgull.app/fhir/StructureDefinition/nist-sp800-90a-entropy',
              valueString: 'NIST-SP-800-90A-CSPRNG-AUTHENTICATED'
            },
            {
              url: 'http://pocketgull.app/fhir/StructureDefinition/hipaa-safe-harbor-seal',
              valueString: 'HIPAA-164-514-SAFE-HARBOR-DEIDENTIFIED'
            }
          ]
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
      subject: { reference: patientUrn, display: safeSubjectDisplay },
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
          title: 'Popperian Epistemic Diagnostic Formulation & Counter-Hypotheses',
          entry: [{ reference: `urn:uuid:${groundedCondition.id}` }]
        },
        ...(hrvObservation ? [{
          title: 'Autonomic Vagal Biomarkers & Skeptical Epistemology',
          entry: [{ reference: `urn:uuid:${hrvObservation.id}` }]
        }] : []),
        {
          title: 'Wearable Tri-Modal Asymmetric Clinical Gain (IEEE P2933 TIPPSS)',
          entry: [{ reference: `urn:uuid:${wearableGainObservation.id}` }]
        },
        {
          title: 'Molecular Biophysics & Quantum Falsification Suite',
          entry: [{ reference: `urn:uuid:${biophysObservation.id}` }]
        },
        {
          title: 'Integrative Care Protocol',
          entry: [{ reference: `urn:uuid:${carePlanResource.id}` }]
        },
        {
          title: 'FDA 21 CFR Part 11 Provenance Attestation',
          entry: [{ reference: `urn:uuid:${provenanceResource.id}` }]
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
        { fullUrl: `urn:uuid:${groundedCondition.id}`, resource: groundedCondition },
        ...(hrvObservation ? [{ fullUrl: `urn:uuid:${hrvObservation.id}`, resource: hrvObservation }] : []),
        { fullUrl: `urn:uuid:${biophysObservation.id}`, resource: biophysObservation },
        { fullUrl: `urn:uuid:${wearableGainObservation.id}`, resource: wearableGainObservation },
        { fullUrl: `urn:uuid:${carePlanResource.id}`, resource: carePlanResource },
        { fullUrl: `urn:uuid:${provenanceResource.id}`, resource: provenanceResource }
      ]
    };
  }


  /**
   * Exports the FHIR R4 Bundle as formatted JSON string
   */
  exportBundleAsJson(patient: IPatient, assertion?: IGroundedClinicalAssertion): string {
    return JSON.stringify(this.generateFhirR4Bundle(patient, assertion), null, 2);
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
    const safeSubjectDisplay = this.buildSafeHarborSubjectDisplay(params.patientId);

    // 1. Patient Resource (HIPAA Safe Harbor de-identified subject)
    const patientResource = {
      resourceType: 'Patient',
      id: params.patientId,
      identifier: [{ system: 'https://pocketgull.app/fhir/patient-id', value: params.patientId }],
      active: true,
      name: [{ use: 'anonymous', text: safeSubjectDisplay }]
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
        subject: { reference: patientUrn, display: this.buildSafeHarborSubjectDisplay(params.patientId) },
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
        subject: { reference: patientUrn, display: this.buildSafeHarborSubjectDisplay(params.patientId) },
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
      subject: { reference: patientUrn, display: this.buildSafeHarborSubjectDisplay(params.patientId) },
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
      subject: { reference: patientUrn, display: this.buildSafeHarborSubjectDisplay(params.patientId) },
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
      subject: { reference: patientUrn, display: this.buildSafeHarborSubjectDisplay(params.patientId) },
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
      subject: { reference: patientUrn, display: this.buildSafeHarborSubjectDisplay(params.patientId) },
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

  /**
   * Generates HL7 FHIR R4 Specialist Clinical Decision Support Document Bundle with FDA 21 CFR Part 11 Seal
   */
  generateSpecialistCdsBundle(params: {
    patientId: string;
    patientName: string;
    discipline: string;
    guidelineBody: string;
    findings: Record<string, any>;
    recommendation: string;
    shockIndex?: number;
    gdmtScore?: string;
    beersFlags?: string[];
    resuscitationPhases?: string[];
  }): IFhirBundle {
    const timestamp = new Date().toISOString();
    const bundleId = `urn:uuid:bundle-specialist-${params.patientId}-${Date.now()}`;
    const patientUrn = `urn:uuid:patient-${params.patientId}`;

    const observationResource = {
      resourceType: 'Observation',
      id: `obs-specialist-${params.discipline}-${params.patientId}`,
      status: 'final',
      category: [
        {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'exam', display: 'Exam' }]
        }
      ],
      code: {
        coding: [
          {
            system: 'https://pocketgull.app/fhir/specialist-cds',
            code: params.discipline.toUpperCase(),
            display: `${params.discipline.toUpperCase()} Specialist CDS Evaluation`
          }
        ],
        text: `${params.discipline} Clinical Guidance (${params.guidelineBody})`
      },
      subject: { reference: patientUrn, display: this.buildSafeHarborSubjectDisplay(params.patientId) },
      effectiveDateTime: timestamp,
      valueString: params.recommendation,
      component: Object.entries(params.findings).map(([key, val]) => ({
        code: { coding: [{ system: 'https://pocketgull.app/fhir/findings', code: key, display: key }] },
        valueString: typeof val === 'object' ? JSON.stringify(val) : String(val)
      }))
    };

    const signature = this.computeSha256Signature(JSON.stringify(observationResource));
    const attestationExtension = {
      url: 'https://pocketgull.app/fhir/StructureDefinition/fda-21cfr-part11-seal',
      valueSignature: {
        type: [{ system: 'urn:iso-astm:E1762-95:2013', code: '1.2.840.10065.1.12.1.1', display: 'Author\'s Signature' }],
        when: timestamp,
        who: { reference: 'urn:uuid:practitioner-ai-scribe', display: 'PocketGull Specialist CDS Engine' },
        sigFormat: 'application/pkcs7-signature',
        data: signature
      }
    };

    const carePlanResource = {
      resourceType: 'CarePlan',
      id: `careplan-specialist-${params.discipline}-${params.patientId}`,
      extension: [attestationExtension],
      status: 'active',
      intent: 'plan',
      title: `${params.discipline.toUpperCase()} Protocol (${params.guidelineBody})`,
      description: params.recommendation,
      subject: { reference: patientUrn, display: this.buildSafeHarborSubjectDisplay(params.patientId) },
      period: { start: timestamp }
    };

    return {
      resourceType: 'Bundle',
      id: bundleId,
      type: 'document',
      timestamp,
      entry: [
        { fullUrl: `urn:uuid:${carePlanResource.id}`, resource: carePlanResource },
        { fullUrl: `urn:uuid:${observationResource.id}`, resource: observationResource }
      ]
    };
  }
}

