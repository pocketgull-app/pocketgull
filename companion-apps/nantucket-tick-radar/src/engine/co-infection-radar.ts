/**
 * 🔬 Nantucket Island Tick Defense & Co-Infection Radar
 * Calibrated Bayesian Mathematical Engine with Empirical Surveillance Priors
 */

import { ICoInfectionScore, TickSpecies } from '../types.js';
import { evaluateBayesianTriage } from './bayesian-triage.js';

export interface ISymptomInput {
  hasErythemaMigrans?: boolean;      // Expanding >5cm bullseye or solid red rash
  hasFeverChills?: boolean;          // Spiking fevers / rigors
  hasDrenchingSweats?: boolean;      // Severe night drenching sweats (Babesia hallmark)
  hasDarkUrineJaundice?: boolean;    // Hemolytic sign (Babesia hallmark)
  hasJointPainSwelling?: boolean;    // Asymmetric joint swelling / migratory arthralgias
  hasHeadachePhotophobia?: boolean;  // Severe head pain / light sensitivity
  hasFacialDroop?: boolean;          // Bell's palsy (Lyme hallmark)
  hasRedMeatAllergy?: boolean;       // Delayed hives/GI pain 4-6h after mammalian meat
  attachmentHours?: number;          // Hours tick was attached
}

export function computeCoInfectionRadar(
  species: TickSpecies,
  symptoms: ISymptomInput = {},
  trailRiskMultiplier = 1.0,
  soilDesiccationIndex = 45
): ICoInfectionScore[] {
  const bayesianResults = evaluateBayesianTriage(species, symptoms, trailRiskMultiplier, soilDesiccationIndex);

  return bayesianResults.map(r => {
    let riskLevel: ICoInfectionScore['riskLevel'] = 'Low';
    if (r.riskTier === 'CRITICAL_CLINICAL') riskLevel = 'Critically Elevated';
    else if (r.riskTier === 'ELEVATED_WATCH') riskLevel = 'Elevated';
    else if (r.riskTier === 'MODERATE_SURVEILLANCE') riskLevel = 'Moderate';

    let clinicalFlag = '';
    if (r.pathogenId === 'lyme_borrelia') {
      clinicalFlag = symptoms.hasErythemaMigrans 
        ? '🎯 Erythema Migrans Rash Reported (Clinically Diagnostic / H0 Rejected)' 
        : (r.prophylaxisEligible ? '⏱️ Prophylaxis Window Active (>=36h Attachment)' : 'Endemic Surveillance Prior (52% ACK Nymphs)');
    } else if (r.pathogenId === 'babesiosis') {
      clinicalFlag = symptoms.hasDrenchingSweats || symptoms.hasDarkUrineJaundice 
        ? '🚨 Hemolytic / Drenching Sweats Alert (Babesia Microti Crisis Risk)' 
        : 'Historic Epicenter Surveillance (18% ACK Nymphs)';
    } else if (r.pathogenId === 'anaplasmosis') {
      clinicalFlag = symptoms.hasFeverChills && symptoms.hasHeadachePhotophobia 
        ? 'Leukopenia / Transaminitis Vector Signal' 
        : 'Endemic Exposure Prior (11% ACK Nymphs)';
    } else if (r.pathogenId === 'miyamotoi') {
      clinicalFlag = 'Relapsing Febrile Episode Surveillance (2.5% ACK)';
    } else if (r.pathogenId === 'powassan') {
      clinicalFlag = 'Rapid Transmission Arbovirus (<15 min transmission risk)';
    } else if (r.pathogenId === 'alpha_gal') {
      clinicalFlag = symptoms.hasRedMeatAllergy 
        ? '🍖 Delayed Anaphylaxis / Mammalian Carbohydrate Sensitization' 
        : 'Lone Star Vector Marker (Emerging ACK)';
    }

    return {
      pathogenId: r.pathogenId,
      pathogenName: r.pathogenName,
      organism: r.organism,
      probabilityPercent: r.posteriorPercent,
      riskLevel,
      clinicalFlag,
      recommendedAction: r.clinicalRecommendation,
      pValueH0: r.pValueH0,
      nullHypothesisStatus: r.nullHypothesisRejected ? 'REJECTED (Statistically Significant)' : 'RETAINED (Baseline Equivalence)',
      priorProbabilityPercent: Math.round(r.priorProbability * 100),
      likelihoodRatio: Math.round(r.combinedLikelihoodRatio * 100) / 100
    };
  });
}
