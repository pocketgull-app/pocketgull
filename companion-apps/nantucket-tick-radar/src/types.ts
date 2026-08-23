/**
 * Nantucket Island Tick Defense & Co-Infection Radar
 * Domain Model Definitions & Clinical Types
 */

export type TickSpecies = 
  | 'ixodes_nymph' 
  | 'ixodes_adult' 
  | 'dermacentor_dog' 
  | 'amblyomma_lonestar';

export type AttachmentDwellTier = 
  | 'unattached' 
  | 'under_24h' 
  | '24_to_36h' 
  | '36_to_72h' 
  | 'over_72h';

export type EisenhowerQuadrant = 
  | 'q1_urgent_important'      // DO FIRST (0–72h Act Now)
  | 'q2_plan_decide'           // STRATEGIZE (High Long-Term Impact)
  | 'q3_delegate_deescalate'   // DE-ESCALATE (Urgent Distractions)
  | 'q4_eliminate_waste';      // ELIMINATE (Harmful & Wasteful Myths)

export type EisenhowerPhase = 
  | 'bite_acute_0_2h'          // Just bit / mechanical removal
  | 'prophylaxis_window_2_72h' // 72-hr Doxycycline evaluation
  | 'symptom_watch_3_30d'      // Monitoring acute rash / flu signs
  | 'prevention_ecology';      // Trail prep / landscape & citizen science

export interface IEisenhowerAction {
  id: string;
  title: string;
  quadrant: EisenhowerQuadrant;
  phase: EisenhowerPhase;
  summary: string;
  clinicalRationale: string;
  evidenceTier: 'Level A (RCT / IDSA Standard)' | 'Level B (Observational / CDC)' | 'Level C (Expert / Myth Disproven)';
  isRedFlag?: boolean;
  actionSteps: string[];
}

export interface IPathogenVector {
  id: string;
  name: string;
  organism: string;
  minTransmissionHours: number;
  nantucketEndemicRisk: 'Hyper-Endemic (>40%)' | 'High (15-40%)' | 'Moderate (5-15%)' | 'Emerging (<5%)';
  characteristicPresentation: string[];
  keyLabMarker: string;
  firstLineTherapy: string;
  evidenceNotes: string;
}

export interface INantucketTrail {
  id: string;
  name: string;
  location: string;
  conservationGroup: string;
  riskRating: 'Extreme' | 'High' | 'Moderate';
  habitatType: string;
  distance: string;
  keySafetyTip: string;
  coordinates: { lat: number; lng: number };
}

export interface ICitizenScienceEncounter {
  id: string;
  timestamp: string;
  trailId: string;
  species: TickSpecies;
  dwellTier: AttachmentDwellTier;
  hostType: 'Human' | 'Canine' | 'Feline' | 'Gear / Clothing';
  notes?: string;
  symptomReported?: boolean;
}

export interface ICoInfectionScore {
  pathogenId: string;
  pathogenName: string;
  organism: string;
  probabilityPercent: number;
  riskLevel: 'Critically Elevated' | 'Elevated' | 'Moderate' | 'Low';
  clinicalFlag: string;
  recommendedAction: string;
  pValueH0?: number;
  nullHypothesisStatus?: 'REJECTED (Statistically Significant)' | 'RETAINED (Baseline Equivalence)';
  priorProbabilityPercent?: number;
  likelihoodRatio?: number;
}

export interface IDwellTimeAssessment {
  estimatedHours: number;
  dwellTier: AttachmentDwellTier;
  lymeTransmissionProbability: number;
  doxycyclineProphylaxisEligible: boolean;
  prophylaxisCriteriaMet: {
    attachedAtLeast36h: boolean;
    removedWithin72h: boolean;
    speciesIsBlacklegged: boolean;
    noContraindications: boolean;
  };
  clinicalRecommendation: string;
  hoursRemainingIn72hWindow: number;
}
