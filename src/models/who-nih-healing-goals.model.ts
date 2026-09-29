/**
 * WHO & NIH Strategic Health Goals & Smart Contextual ML Framework Domain Models
 *
 * Epistemological & computational bridges aligning the Global Decad (10 Paradigms)
 * with the global targets of the World Health Organization (WHO) and National Institutes of Health (NIH).
 */

import { TGlobalHealingParadigm } from './global-healing-paradigms.model';

export type TGlobalStrategicGoalId =
  | 'WHO_SDG_3_4_NCD_PREVENTION'
  | 'WHO_GTMC_ICTM_CHAPTER26'
  | 'WHO_ICOPE_INTRINSIC_CAPACITY'
  | 'NIH_NCCIH_WHOLE_PERSON_HEALTH'
  | 'NIH_GEROSCIENCE_EPIGENETIC_HEALTHSPAN'
  | 'NIH_PLANETARY_HEALTH_EXPOSOMICS';

export interface IMachineLearningContextualAssurance {
  modelArchitecture: string; // e.g. "PINN-Bounded Multimodal Meta-Stack (LightGBM + Gemma Edge)"
  pinnBiophysicalLossPenalty: number; // e.g. 0.0142 (Kinetics/Oscillator loss)
  conformalPredictionCoveragePercent: number; // 95.0%
  conformalSetCardinality: number; // e.g. 1-2 concurrent safe classifications
  epistemicOodUncertaintyScore: number; // 0.0 - 1.0 (Low < 0.15 indicates highly grounded)
  leakFreeGroupKFoldValidationScore: number; // e.g. ROC-AUC 0.948 across 5 patient folds
  nelderMeadOptimizedThreshold: number; // e.g. 0.428 tuned cutoff
}

export interface IStrategicGoalAlignment {
  goalId: TGlobalStrategicGoalId;
  governingBody: 'WHO' | 'NIH' | 'UN';
  title: string;
  strategicObjective: string;
  contributingParadigms: TGlobalHealingParadigm[];
  targetMetricName: string;
  baselineValueDisplay: string;
  currentValueDisplay: string;
  targetThresholdDisplay: string;
  fulfillmentPercent: number; // 0 - 100%
  clinicalMaturityStatus: 'OPTIMAL' | 'ON_TRACK' | 'ACCELERATING' | 'ATTENTION_NEEDED';
  paradigmActionMechanisms: {
    paradigm: TGlobalHealingParadigm;
    label: string;
    clinicalContribution: string;
    actionProtocol: string;
  }[];
}

export interface IWhoNihStrategicSummary {
  patientId: string;
  timestampUtc: string;
  overallStrategicFulfillmentScore: number; // 0 - 100%
  activeStrategicGoals: IStrategicGoalAlignment[];
  machineLearningAssurance: IMachineLearningContextualAssurance;
  intrinsicCapacityDomains: {
    vitality: number; // 0 - 100
    cognition: number; // 0 - 100
    locomotion: number; // 0 - 100
    psychological: number; // 0 - 100
    sensory: number; // 0 - 100
  };
  whoIctmCodifiedDiagnoses: {
    ictmCode: string;
    traditionalConcept: string;
    biophysicalTranslation: string;
    whoChapter26Category: string;
  }[];
  fdaPart11Digest: string;
}
