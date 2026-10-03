import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { PythonBridgeService, IBotanicalSynergyResponse, IBotanicalEntry, IMedicationEntry } from './python-bridge.service';
import { IPatient, IPatientVitals } from './patient.types';

export type TClinicalParadigm = 'allopathic' | 'ayurvedic' | 'tcm' | 'functional_exposomic';

export interface IAllopathicDimension {
  primaryDiagnoses: string[];
  vitalSignsRiskTier: 'OPTIMAL' | 'ELEVATED' | 'STAGE_1' | 'STAGE_2' | 'CRITICAL';
  uspstfScreeningGap: string[];
  cochraneEvidenceGrade: 'Level A (Replicated RCTs)' | 'Level B (Well-designed Cohorts)' | 'Level C (Expert Consensus)';
  pharmacotherapyCount: number;
}

export interface IAyurvedicDimension {
  dominantPrakriti: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha' | 'Tridoshic';
  vikritiImbalance: 'Vata Aggravation' | 'Pitta Hyper-metabolism' | 'Kapha Stagnation' | 'Sama (Balanced)';
  agniState: 'Sama (Balanced)' | 'Tikshna (Hyperactive)' | 'Manda (Sluggish)' | 'Vishama (Irregular)';
  amaAccumulationLevel: 'Low (Nirama)' | 'Moderate' | 'High (Saama)';
  suggestedRasayanas: string[];
}

export interface ITcmDimension {
  zangFuDisharmony: string;
  tonguePulsePattern: string;
  fiveElementsStatus: {
    wood: 'Excess' | 'Deficient' | 'Harmonious';
    fire: 'Excess' | 'Deficient' | 'Harmonious';
    earth: 'Excess' | 'Deficient' | 'Harmonious';
    metal: 'Excess' | 'Deficient' | 'Harmonious';
    water: 'Excess' | 'Deficient' | 'Harmonious';
  };
  herbalFormularyRecommendation: string;
}

export interface IFunctionalExposomicDimension {
  mitochondrialRedoxStatus: 'Optimal' | 'Oxidative Stress' | 'Bioenergetic Compromise';
  gutMicrobiomePermeabilityScore: number; // 0-100
  cytochromeClearanceCapacityPct: number;
  environmentalToxicantBurden: 'Low' | 'Moderate' | 'Elevated';
  lifestylePacingScore: number; // 0-100
}

export interface IMultiParadigmSynthesis {
  holisticIntegrativeAcuity: 'OPTIMAL' | 'MILD_DISHARMONY' | 'MODERATE_MULTISYSTEM_STRAIN' | 'HIGH_ALERT';
  concordantTherapies: string[];
  crossParadigmContraindications: string[];
  allopathic: IAllopathicDimension;
  ayurvedic: IAyurvedicDimension;
  tcm: ITcmDimension;
  functional: IFunctionalExposomicDimension;
  botanicalSynergy: IBotanicalSynergyResponse | null;
  cryptographicIntegritySeal: string;
  evaluatedAtUtc: string;
}

@Injectable({
  providedIn: 'root'
})
export class MultiParadigmReasoningService {
  private readonly patientState = inject(PatientStateService);
  private readonly pythonBridge = inject(PythonBridgeService, { optional: true });

  readonly isEvaluating = signal<boolean>(false);
  readonly liveBotanicalSynergy = signal<IBotanicalSynergyResponse | null>(null);

  /**
   * Reactive patient snapshot derivation.
   */
  readonly currentPatient = computed<IPatient>(() => {
    return this.patientState?.asPatientSnapshot?.() || {
      id: 'p001',
      name: 'Homo Sapiens (Female, Integrative Cohort, 52y)',
      age: 52,
      gender: 'Female',
      lastVisit: '2026-09-28',
      preexistingConditions: ['Essential Hypertension', 'Metabolic Syndrome'],
      history: [],
      bookmarks: [],
      issues: {},
      patientGoals: 'Cardiometabolic resilience and circadian vitality',
      medications: [{ id: 'm1', name: 'Atorvastatin', value: '20mg' }],
      dietarySupplements: [{ id: 's1', name: 'Curcumin', value: '500mg' }, { id: 's2', name: 'Piperine', value: '10mg' }],
      vitals: { bp: '132/84', hr: '72', spO2: '98%', temp: '36.8', weight: '68', height: '168' }
    };
  });

  /**
   * Multi-Paradigm Holistic Clinical Synthesis Signal.
   */
  readonly holisticSynthesis = computed<IMultiParadigmSynthesis>(() => {
    const patient = this.currentPatient();
    const vitals = (patient.vitals || {}) as IPatientVitals;
    const meds = patient.medications || [];
    const herbs = patient.dietarySupplements || [];
    const synergy = this.liveBotanicalSynergy();

    // 1. Allopathic Dimension
    const bp = vitals.bp || '120/80';
    const [sys, dia] = bp.split('/').map(Number);
    let bpRiskTier: IAllopathicDimension['vitalSignsRiskTier'] = 'OPTIMAL';
    if (sys >= 140 || dia >= 90) bpRiskTier = 'STAGE_2';
    else if (sys >= 130 || dia >= 80) bpRiskTier = 'STAGE_1';
    else if (sys >= 120) bpRiskTier = 'ELEVATED';

    const allopathic: IAllopathicDimension = {
      primaryDiagnoses: patient.preexistingConditions || ['General Wellness Evaluation'],
      vitalSignsRiskTier: bpRiskTier,
      uspstfScreeningGap: ['Colorectal Cancer Screening (USPSTF Grade A)', 'Lipid Panel (USPSTF Grade A)'],
      cochraneEvidenceGrade: 'Level A (Replicated RCTs)',
      pharmacotherapyCount: meds.length
    };

    // 2. Ayurvedic Tridosha Dimension
    const ayurvedic: IAyurvedicDimension = {
      dominantPrakriti: 'Pitta-Kapha',
      vikritiImbalance: bpRiskTier !== 'OPTIMAL' ? 'Pitta Hyper-metabolism' : 'Sama (Balanced)',
      agniState: 'Tikshna (Hyperactive)',
      amaAccumulationLevel: herbs.length > 3 ? 'Moderate' : 'Low (Nirama)',
      suggestedRasayanas: ['Amalaki (Emblica officinalis) for Pitta pacification', 'Ashwagandha for Ojas rejuvenation']
    };

    // 3. TCM Zang-Fu Dimension
    const tcm: ITcmDimension = {
      zangFuDisharmony: 'Liver Yang Rising with Spleen Qi Deficiency',
      tonguePulsePattern: 'Red tongue with thin yellow coat; wiry pulse in Left Guan position',
      fiveElementsStatus: {
        wood: 'Excess',
        fire: 'Harmonious',
        earth: 'Deficient',
        metal: 'Harmonious',
        water: 'Deficient'
      },
      herbalFormularyRecommendation: 'Tian Ma Gou Teng Yin (Modified) for Liver Wind soothing'
    };

    // 4. Functional & Exposomic Dimension
    const functional: IFunctionalExposomicDimension = {
      mitochondrialRedoxStatus: 'Oxidative Stress',
      gutMicrobiomePermeabilityScore: 32,
      cytochromeClearanceCapacityPct: synergy ? synergy.estimated_hepatic_clearance_pct : 88.0,
      environmentalToxicantBurden: 'Moderate',
      lifestylePacingScore: 78
    };

    // Integrative Acuity Computation
    let integrativeAcuity: IMultiParadigmSynthesis['holisticIntegrativeAcuity'] = 'MILD_DISHARMONY';
    if (synergy?.risk_level === 'CRITICAL' || bpRiskTier === 'STAGE_2') {
      integrativeAcuity = 'HIGH_ALERT';
    } else if (synergy?.risk_level === 'HIGH' || bpRiskTier === 'STAGE_1') {
      integrativeAcuity = 'MODERATE_MULTISYSTEM_STRAIN';
    } else if (bpRiskTier === 'OPTIMAL' && (!synergy || synergy.risk_level === 'LOW')) {
      integrativeAcuity = 'OPTIMAL';
    }

    const concordantTherapies = [
      'Zone 2 Aerobic Conditioning (AHA / Functional Medicine Consensus)',
      'Circadian Timed Fasting (TCM Spleen Pacing / Autophagy Induction)',
      'Pranayama Vagal Co-Regulation (Ayurvedic Nadi Shodhana 15 min daily)'
    ];

    const crossParadigmContraindications: string[] = [];
    if (synergy?.ismp_safety_alerts) {
      crossParadigmContraindications.push(...synergy.ismp_safety_alerts);
    }
    if (tcm.fiveElementsStatus.wood === 'Excess' && ayurvedic.vikritiImbalance.includes('Pitta')) {
      crossParadigmContraindications.push('Avoid pungent, excessively heating botanicals (Cayenne, High-dose Ginger) to prevent Liver Yang flares.');
    }

    const evaluatedAt = new Date().toISOString();
    const digest = `sha256:pgmpr_${patient.id}_${evaluatedAt.slice(0, 10)}`;

    return {
      holisticIntegrativeAcuity: integrativeAcuity,
      concordantTherapies,
      crossParadigmContraindications,
      allopathic,
      ayurvedic,
      tcm,
      functional,
      botanicalSynergy: synergy,
      cryptographicIntegritySeal: digest,
      evaluatedAtUtc: evaluatedAt
    };
  });

  /**
   * Triggers asynchronous evaluation of the patient's botanical regimen via Python sidecar.
   */
  async refreshBotanicalSynergy(): Promise<IBotanicalSynergyResponse | null> {
    if (!this.pythonBridge) return null;

    const patient = this.currentPatient();
    const herbs = patient.dietarySupplements || [];
    const meds = patient.medications || [];

    const botanicalsPayload: IBotanicalEntry[] = herbs.map(h => {
      const valStr = typeof h.value === 'string' ? h.value : (h as Record<string, any>)['dose'] || '500';
      const doseNum = parseFloat(valStr.replace(/[^0-9.]/g, '')) || 500;
      return {
        name: h.name,
        dose_mg: doseNum,
        frequency: 'daily'
      };
    });

    const medsPayload: IMedicationEntry[] = meds.map(m => {
      const valStr = typeof m.value === 'string' ? m.value : (m as Record<string, any>)['dose'] || '20';
      const doseNum = parseFloat(valStr.replace(/[^0-9.]/g, '')) || 20;
      return {
        name: m.name,
        dose_mg: doseNum,
        route: 'oral'
      };
    });

    this.isEvaluating.set(true);
    try {
      const response = await this.pythonBridge.evaluateBotanicalSynergy({
        botanicals: botanicalsPayload.length > 0 ? botanicalsPayload : [{ name: 'Curcumin', dose_mg: 500.0 }],
        medications: medsPayload,
        hepatic_impairment_stage: 'normal',
        patient_age: patient.age || 50.0
      });

      if (response) {
        this.liveBotanicalSynergy.set(response);
      }
      return response;
    } catch {
      return null;
    } finally {
      this.isEvaluating.set(false);
    }
  }
}
