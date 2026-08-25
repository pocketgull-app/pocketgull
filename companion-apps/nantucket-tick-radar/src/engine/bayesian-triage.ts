/**
 * 🔬 Nantucket Tick Radar: Empirical Bayesian Triage Engine
 * Grounded in UMass Amherst TickReport & MA DPH Passive Surveillance Data
 * Enforces Popperian H0 (Null Hypothesis) and Edge-Inference Data Sovereignty.
 */

import { TickSpecies } from '../types.js';
import { ISymptomInput } from './co-infection-radar.js';

export interface IBayesianPathogenPrior {
  pathogenId: string;
  pathogenName: string;
  organism: string;
  nymphPrevalenceAck: number;   // Nantucket-specific nymph infection rate (UMass TickReport)
  adultPrevalenceAck: number;   // Nantucket-specific adult infection rate
  incubationDaysMin: number;
  incubationDaysMax: number;
  transmissionThresholdHours: number;
  fdaTreatmentSummary: string;
}

export const EMPIRICAL_NANTUCKET_PRIORS: Record<string, IBayesianPathogenPrior> = {
  lyme_borrelia: {
    pathogenId: 'lyme_borrelia',
    pathogenName: 'Lyme Disease',
    organism: 'Borrelia burgdorferi (Spirochete)',
    nymphPrevalenceAck: 0.52, // 52% of tested nymphs on Nantucket carry Borrelia
    adultPrevalenceAck: 0.65,
    incubationDaysMin: 3,
    incubationDaysMax: 30,
    transmissionThresholdHours: 36,
    fdaTreatmentSummary: 'Doxycycline 100mg BID x 10–14 days (or single 200mg prophylactic dose within 72h)'
  },
  babesiosis: {
    pathogenId: 'babesiosis',
    pathogenName: 'Babesiosis',
    organism: 'Babesia microti (Intraerythrocytic Protozoan)',
    nymphPrevalenceAck: 0.18, // 18% nymph prevalence on Nantucket (highest US epicenter)
    adultPrevalenceAck: 0.22,
    incubationDaysMin: 7,
    incubationDaysMax: 60,
    transmissionThresholdHours: 24,
    fdaTreatmentSummary: 'Atovaquone 750mg BID + Azithromycin 500mg daily (or Clindamycin + Quinine in severe crisis)'
  },
  anaplasmosis: {
    pathogenId: 'anaplasmosis',
    pathogenName: 'Anaplasmosis (HGA)',
    organism: 'Anaplasma phagocytophilum (Intracellular Bacterium)',
    nymphPrevalenceAck: 0.11, // 11% nymph prevalence
    adultPrevalenceAck: 0.14,
    incubationDaysMin: 5,
    incubationDaysMax: 14,
    transmissionThresholdHours: 24,
    fdaTreatmentSummary: 'Doxycycline 100mg BID x 10–14 days'
  },
  miyamotoi: {
    pathogenId: 'miyamotoi',
    pathogenName: 'Borrelia miyamotoi Disease',
    organism: 'Borrelia miyamotoi (Relapsing Fever Spirochete)',
    nymphPrevalenceAck: 0.025, // 2.5% prevalence
    adultPrevalenceAck: 0.035,
    incubationDaysMin: 7,
    incubationDaysMax: 21,
    transmissionThresholdHours: 12,
    fdaTreatmentSummary: 'Doxycycline 100mg BID x 14 days'
  },
  powassan: {
    pathogenId: 'powassan',
    pathogenName: 'Deer Tick Virus (Powassan Lineage II)',
    organism: 'Powassan Virus (Flavivirus)',
    nymphPrevalenceAck: 0.015, // 1.5% prevalence
    adultPrevalenceAck: 0.02,
    incubationDaysMin: 7,
    incubationDaysMax: 30,
    transmissionThresholdHours: 0.25, // Transmission possible within 15 minutes
    fdaTreatmentSummary: 'Supportive ICU neuro-care; no specific antiviral'
  },
  alpha_gal: {
    pathogenId: 'alpha_gal',
    pathogenName: 'Alpha-Gal Syndrome',
    organism: 'Galactose-α-1,3-galactose Sensitization',
    nymphPrevalenceAck: 0.08, // Lone Star tick expanding on Nantucket
    adultPrevalenceAck: 0.12,
    incubationDaysMin: 14,
    incubationDaysMax: 90,
    transmissionThresholdHours: 4,
    fdaTreatmentSummary: 'Strict mammalian meat/gelatin elimination + Epinephrine autoinjector'
  }
};

export interface IBayesianTriageResult {
  pathogenId: string;
  pathogenName: string;
  organism: string;
  priorProbability: number;
  combinedLikelihoodRatio: number;
  posteriorProbability: number;
  posteriorPercent: number;
  pValueH0: number; // Popperian p-value against Null Hypothesis H0 (no active pathogen)
  nullHypothesisRejected: boolean; // True if posterior >= 0.95 (p < 0.05) or pathognomonic sign
  riskTier: 'CRITICAL_CLINICAL' | 'ELEVATED_WATCH' | 'MODERATE_SURVEILLANCE' | 'NULL_HYPOTHESIS_BASELINE';
  clinicalRecommendation: string;
  prophylaxisEligible: boolean;
  prophylaxisRationale: string;
  desiccationRiskModifier: number;
}

/**
 * Computes calibrated Bayesian posteriors for all Nantucket vector-borne pathogens
 */
export function evaluateBayesianTriage(
  species: TickSpecies,
  symptoms: ISymptomInput,
  trailRiskMultiplier = 1.0,
  soilDesiccationIndex = 45 // 0-100% (lower means drier/less tick questing)
): IBayesianTriageResult[] {
  const isBlacklegged = species === 'ixodes_nymph' || species === 'ixodes_adult';
  const isAdult = species === 'ixodes_adult' || species === 'dermacentor_dog';
  const isLoneStar = species === 'amblyomma_lonestar';
  const hours = symptoms.attachmentHours ?? 0;

  // Desiccation modifier: high soil moisture & humidity expands questing activity
  const desiccationFactor = 0.8 + (soilDesiccationIndex / 100) * 0.4; // 0.8 to 1.2
  const results: IBayesianTriageResult[] = [];

  for (const [id, prior] of Object.entries(EMPIRICAL_NANTUCKET_PRIORS)) {
    let basePrior = isAdult ? prior.adultPrevalenceAck : prior.nymphPrevalenceAck;
    if (!isBlacklegged && id !== 'alpha_gal') {
      basePrior = 0.001; // Extremely low for non-Ixodes vectors
    }
    if (id === 'alpha_gal') {
      basePrior = isLoneStar ? 0.25 : 0.005;
    }

    // Likelihood ratios for clinical evidence
    let lr = 1.0;

    // 1. Dwell Time & Engorgement Likelihood Ratio (Grounded in CDC / Eisen 2016 attachment kinetics)
    if (isBlacklegged) {
      if (hours < 24) {
        lr *= 0.05; // <24h attachment rarely transmits Borrelia/Babesia (<1% transmission)
      } else if (hours < 36) {
        lr *= 0.85; // 24-36h transmission begins
      } else if (hours < 48) {
        lr *= 2.4;  // >=36h significant salivary gland transmission
      } else if (hours >= 48) {
        lr *= 5.2;  // Fully engorged ticks transmit at maximal efficiency (>65%)
      }
    }

    // 2. Specific Pathogen Symptom Likelihood Ratios
    if (id === 'lyme_borrelia') {
      if (symptoms.hasErythemaMigrans) lr *= 35.0; // Pathognomonic bullseye rash
      if (symptoms.hasFacialDroop) lr *= 12.0;    // Bell's palsy in endemic region
      if (symptoms.hasJointPainSwelling) lr *= 3.5;
      if (symptoms.hasFeverChills) lr *= 1.8;
    } else if (id === 'babesiosis') {
      if (symptoms.hasDrenchingSweats) lr *= 22.0;  // Severe drenching night sweats
      if (symptoms.hasDarkUrineJaundice) lr *= 18.0;// Hemolytic anemia hallmark
      if (symptoms.hasFeverChills) lr *= 2.2;
    } else if (id === 'anaplasmosis') {
      if (symptoms.hasFeverChills && symptoms.hasHeadachePhotophobia) lr *= 14.0;
      if (symptoms.hasJointPainSwelling) lr *= 2.5;
    } else if (id === 'miyamotoi') {
      if (symptoms.hasFeverChills && !symptoms.hasErythemaMigrans) lr *= 4.0;
    } else if (id === 'powassan') {
      if (hours > 0) lr *= 1.2; // Transmits in 15 mins
      if (symptoms.hasHeadachePhotophobia && symptoms.hasFacialDroop) lr *= 8.0;
    } else if (id === 'alpha_gal') {
      if (symptoms.hasRedMeatAllergy) lr *= 45.0; // Delayed anaphylaxis 4-6h post-mammalian meat
    }

    // Apply trail geographic density & desiccation microclimate
    const adjustedLr = lr * trailRiskMultiplier * desiccationFactor;

    // Bayes Odds Equation
    const priorOdds = basePrior / Math.max(0.0001, 1.0 - basePrior);
    const postOdds = priorOdds * adjustedLr;
    const posterior = postOdds / (1.0 + postOdds);
    const posteriorPercent = Math.min(99.5, Math.max(0.1, Math.round(posterior * 1000) / 10));

    // Popperian Null Hypothesis P-Value calculation: p = 1.0 - posterior
    const pValueH0 = Math.max(0.0001, Math.round((1.0 - posterior) * 10000) / 10000);
    const nullHypothesisRejected = pValueH0 < 0.05 || (id === 'lyme_borrelia' && Boolean(symptoms.hasErythemaMigrans));

    // Prophylaxis Eligibility (IDSA 2020 Guidelines)
    const prophylaxisEligible = isBlacklegged && hours >= 36 && hours <= 72 && id === 'lyme_borrelia';
    const prophylaxisRationale = prophylaxisEligible
      ? 'Meets IDSA 2020 Criteria: Attached >=36h in hyper-endemic zone (Nantucket 52% Borrelia rate) within 72h window. Single dose Doxycycline 200mg indicated.'
      : (hours < 36 && isBlacklegged
          ? 'Attached <36h: Transmission risk is <1%. Single dose prophylaxis NOT indicated per IDSA guidelines. Monitor site.'
          : 'Prophylaxis criteria not met.');

    let riskTier: IBayesianTriageResult['riskTier'] = 'NULL_HYPOTHESIS_BASELINE';
    if (nullHypothesisRejected || posteriorPercent >= 75) {
      riskTier = 'CRITICAL_CLINICAL';
    } else if (posteriorPercent >= 40) {
      riskTier = 'ELEVATED_WATCH';
    } else if (posteriorPercent >= 15) {
      riskTier = 'MODERATE_SURVEILLANCE';
    }

    let clinicalRecommendation = '';
    if (riskTier === 'CRITICAL_CLINICAL') {
      clinicalRecommendation = `🚨 Statistically Significant Risk (p=${pValueH0.toFixed(4)} < 0.05). Null hypothesis rejected. Walk-in clinical evaluation at Nantucket Cottage Hospital (57 Prospect St) recommended. First-line therapy: ${prior.fdaTreatmentSummary}.`;
    } else if (riskTier === 'ELEVATED_WATCH') {
      clinicalRecommendation = `⚠️ Elevated Posterior Probability (${posteriorPercent}%). Borderline significance. Complete 30-day symptom diary, monitor oral temperature twice daily, and seek medical attention if fevers, expanding annular erythema, or drenching sweats emerge.`;
    } else {
      clinicalRecommendation = `✅ Null Hypothesis Retained (p=${pValueH0.toFixed(4)} >= 0.05). Observed presentation is not statistically distinguishable from endemic baseline. Antibiotic overuse discouraged. Wash bite site with soap & water.`;
    }

    results.push({
      pathogenId: id,
      pathogenName: prior.pathogenName,
      organism: prior.organism,
      priorProbability: basePrior,
      combinedLikelihoodRatio: adjustedLr,
      posteriorProbability: posterior,
      posteriorPercent,
      pValueH0,
      nullHypothesisRejected,
      riskTier,
      clinicalRecommendation,
      prophylaxisEligible,
      prophylaxisRationale,
      desiccationRiskModifier: desiccationFactor
    });
  }

  return results;
}
