import { Injectable } from '@angular/core';

export interface IGlymphaticClearanceInput {
  slowWaveSleepMinutes: number;
  bedtimeLuxExposure: number;
  screenApneaPausesPerHour: number;
  mayerWaveResonanceCoherencePct: number;
}

export interface IGlymphaticClearanceOutput {
  glymphaticClearanceEfficiencyPct: number;
  neuroMetaboliteWashoutIndex: number;
  projectedMorningCognitiveFogScore: number;
  astrocyticAquaporin4PolarizationTier: 'OPTIMAL' | 'PARTIALLY_IMPAIRED' | 'SUBSTANTIALLY_SUPPRESSED';
  posologyInterventions: string[];
}

export interface ICouplesCoRegulationInput {
  partnerAHeartRateBpm: number;
  partnerBHeartRateBpm: number;
  partnerARmssdMs: number;
  partnerBRmssdMs: number;
  speechTurnLatencySeconds: number;
  unresolvedConflictPresent: boolean;
}

export interface ICouplesCoRegulationOutput {
  floodingProbabilityPct: number;
  autonomicCouplingIndex: number;
  mandatoryTimeoutMinutes: number;
  polyvagalStatePartnerA: 'VENTRAL_VAGAL' | 'SYMPATHETIC_ALARM' | 'DORSAL_SHUTDOWN';
  polyvagalStatePartnerB: 'VENTRAL_VAGAL' | 'SYMPATHETIC_ALARM' | 'DORSAL_SHUTDOWN';
  deEscalationProtocol: string;
}

export interface IGutBarrierInput {
  weeklyBotanicalSpeciesCount: number;
  ancestralResistantStarchGramsDay: number;
  polyphenolDensityScore: number;
  ultraProcessedFoodCaloricSharePct: number;
}

export interface IGutBarrierOutput {
  projectedFecalButyrateUmolG: number;
  epithelialBarrierIntegrityScore: number;
  systemicEndotoxinLeakageRisk: 'LOW' | 'MODERATE' | 'ELEVATED';
  circulatingZonulinRiskLevel: 'LOW_PERMEABILITY' | 'COMPENSATED' | 'HIGH_LEAKY_GUT_RISK';
  ancestralNutritionGuidance: string[];
}

export interface ICaregiverAllostaticLoadInput {
  nightlyAwakeningsForCare: number;
  totalSleepHoursActual: number;
  dailyTransferBiomechanicalMets: number;
  consecutiveCaregivingDaysWithoutRespite: number;
}

export interface ICaregiverAllostaticLoadOutput {
  allostaticOverloadTier: 'STABLE_EQUILIBRIUM' | 'COMPENSATING_STRAIN' | 'EXHAUSTION_CRITICAL';
  cumulativeSleepDebtHoursWeekly: number;
  daytimeMicrosleepRiskPct: number;
  respiteUrgency: 'WITHIN_48_HOURS' | 'SCHEDULED_WEEKLY' | 'MAINTENANCE_PACE';
  prescribedRespiteShiftHours: number;
  clinicalMitigationPlan: string;
}

@Injectable({
  providedIn: 'root'
})
export class FlourishingPredictiveModelsService {

  /**
   * 1. Autonomic Sleep & Glymphatic Clearance Forecaster
   */
  forecastGlymphaticClearance(data: IGlymphaticClearanceInput): IGlymphaticClearanceOutput {
    const swsFactor = Math.min(1.0, data.slowWaveSleepMinutes / 90.0);
    const luxPenalty = Math.min(0.35, (data.bedtimeLuxExposure / 300.0) * 0.35);
    const apneaPenalty = Math.min(0.30, (data.screenApneaPausesPerHour / 40.0) * 0.30);
    const vagalBonus = (data.mayerWaveResonanceCoherencePct / 100.0) * 0.25;

    const rawEfficiency = (swsFactor * 0.85) - luxPenalty - apneaPenalty + vagalBonus;
    const efficiencyPct = Math.round(Math.min(98.0, Math.max(15.0, rawEfficiency * 100.0)) * 10) / 10;

    const washoutIndex = Math.round((efficiencyPct / 10.0) * 100) / 100;
    const fogScore = Math.round(Math.min(10.0, Math.max(1.0, 10.0 - (efficiencyPct / 11.0))) * 10) / 10;

    let aqp4Tier: 'OPTIMAL' | 'PARTIALLY_IMPAIRED' | 'SUBSTANTIALLY_SUPPRESSED' = 'OPTIMAL';
    if (efficiencyPct < 50.0) {
      aqp4Tier = 'SUBSTANTIALLY_SUPPRESSED';
    } else if (efficiencyPct < 75.0) {
      aqp4Tier = 'PARTIALLY_IMPAIRED';
    }

    const recs: string[] = [];
    if (data.slowWaveSleepMinutes < 60.0) {
      recs.push('Slow-wave sleep duration is below the 60-min restorative threshold. Prioritize consistent sleep window.');
    }
    if (data.bedtimeLuxExposure > 50.0) {
      recs.push('Enforce 20-lux red-shifted ambient lighting curfew starting 90 minutes before sleep.');
    }
    if (data.screenApneaPausesPerHour > 15.0) {
      recs.push('Implement diaphragmatic micro-exhale reminders during deep screen focus to prevent daytime autonomic hypercapnia.');
    }
    if (data.mayerWaveResonanceCoherencePct < 65.0) {
      recs.push('Conduct 5 minutes of 0.10 Hz Mayer resonance (4.0s Inhale / 6.0s Exhale) immediately prior to bed.');
    }
    if (recs.length === 0) {
      recs.push('Glymphatic fluid convection is operating at peak physiological efficiency. Maintain current sleep cadence.');
    }

    return {
      glymphaticClearanceEfficiencyPct: efficiencyPct,
      neuroMetaboliteWashoutIndex: washoutIndex,
      projectedMorningCognitiveFogScore: fogScore,
      astrocyticAquaporin4PolarizationTier: aqp4Tier,
      posologyInterventions: recs
    };
  }

  /**
   * 2. Couples Co-Regulation & Gottman Flooding Predictor
   */
  predictCouplesCoRegulation(data: ICouplesCoRegulationInput): ICouplesCoRegulationOutput {
    const aSymp = data.partnerAHeartRateBpm >= 95.0 || data.partnerARmssdMs < 22.0;
    const bSymp = data.partnerBHeartRateBpm >= 95.0 || data.partnerBRmssdMs < 22.0;

    let stateA: 'VENTRAL_VAGAL' | 'SYMPATHETIC_ALARM' | 'DORSAL_SHUTDOWN' = 'VENTRAL_VAGAL';
    if (data.partnerAHeartRateBpm >= 105.0 || (aSymp && data.partnerARmssdMs < 15.0)) {
      stateA = 'SYMPATHETIC_ALARM';
    } else if (data.partnerARmssdMs < 12.0 && data.partnerAHeartRateBpm < 55.0) {
      stateA = 'DORSAL_SHUTDOWN';
    }

    let stateB: 'VENTRAL_VAGAL' | 'SYMPATHETIC_ALARM' | 'DORSAL_SHUTDOWN' = 'VENTRAL_VAGAL';
    if (data.partnerBHeartRateBpm >= 105.0 || (bSymp && data.partnerBRmssdMs < 15.0)) {
      stateB = 'SYMPATHETIC_ALARM';
    } else if (data.partnerBRmssdMs < 12.0 && data.partnerBHeartRateBpm < 55.0) {
      stateB = 'DORSAL_SHUTDOWN';
    }

    let cadenceFriction = 0.0;
    if (data.speechTurnLatencySeconds < 1.0) {
      cadenceFriction = 0.25;
    } else if (data.speechTurnLatencySeconds > 2.0) {
      cadenceFriction = -0.15;
    }

    let baseFlooding = 0.10;
    if (aSymp || bSymp) baseFlooding += 0.40;
    if (aSymp && bSymp) baseFlooding += 0.30;
    if (data.unresolvedConflictPresent) baseFlooding += 0.20;
    baseFlooding += cadenceFriction;

    const floodingProb = Math.round(Math.min(98.0, Math.max(5.0, baseFlooding * 100.0)) * 10) / 10;

    const hrDelta = Math.abs(data.partnerAHeartRateBpm - data.partnerBHeartRateBpm);
    const avgRmssd = (data.partnerARmssdMs + data.partnerBRmssdMs) / 2.0;
    const rawCoupling = ((avgRmssd - 25.0) / 40.0) - (hrDelta / 50.0) - (data.unresolvedConflictPresent ? 0.3 : 0.0);
    const couplingIdx = Math.round(Math.min(1.0, Math.max(-1.0, rawCoupling)) * 100) / 100;

    const needsTimeout = floodingProb >= 55.0 || aSymp || bSymp;
    const timeoutMins = needsTimeout ? 20 : 0;

    let protocol = 'MILD TENSION DETECTED: Slow speech cadence down to allow a 2-second pause before responding. Acknowledge emotional reality before moving to tactical solutions.';
    if (needsTimeout) {
      protocol = 'MANDATORY 20-MINUTE RECOVERY BUFFER: Prefrontal cortex is biologically offline. Disengage from discussion immediately. Do not ruminate. Engage in parallel 0.10 Hz Mayer resonance breathing or gentle walking before resuming.';
    } else if (couplingIdx > 0.4) {
      protocol = 'OPTIMAL CO-REGULATION: High ventral vagal stability and conversational pacing. Ready for joint values alignment and Type 1/Type 2 deliberation.';
    }

    return {
      floodingProbabilityPct: floodingProb,
      autonomicCouplingIndex: couplingIdx,
      mandatoryTimeoutMinutes: timeoutMins,
      polyvagalStatePartnerA: stateA,
      polyvagalStatePartnerB: stateB,
      deEscalationProtocol: protocol
    };
  }

  /**
   * 3. Microbiome SCFA Butyrate & Gut Barrier Model
   */
  evaluateGutBarrier(data: IGutBarrierInput): IGutBarrierOutput {
    const botanicalFactor = Math.min(1.2, data.weeklyBotanicalSpeciesCount / 30.0);
    const rsButyrate = data.ancestralResistantStarchGramsDay * 0.42;
    const baselineButyrate = 4.5 * botanicalFactor;
    const upfPenalty = (data.ultraProcessedFoodCaloricSharePct / 100.0) * 4.0;

    const butyrate = Math.round(Math.min(26.0, Math.max(2.0, baselineButyrate + rsButyrate - upfPenalty)) * 10) / 10;

    const polyFactor = (data.polyphenolDensityScore / 10.0) * 25.0;
    const barrierRaw = (butyrate / 15.0) * 60.0 + polyFactor - (data.ultraProcessedFoodCaloricSharePct * 0.45) + 5.0;
    const barrierScore = Math.round(Math.min(99.0, Math.max(20.0, barrierRaw)) * 10) / 10;

    let endotoxinRisk: 'LOW' | 'MODERATE' | 'ELEVATED' = 'LOW';
    let zonulinRisk: 'LOW_PERMEABILITY' | 'COMPENSATED' | 'HIGH_LEAKY_GUT_RISK' = 'LOW_PERMEABILITY';

    if (barrierScore < 55.0) {
      endotoxinRisk = 'ELEVATED';
      zonulinRisk = 'HIGH_LEAKY_GUT_RISK';
    } else if (barrierScore < 80.0) {
      endotoxinRisk = 'MODERATE';
      zonulinRisk = 'COMPENSATED';
    }

    const swaps: string[] = [];
    if (data.weeklyBotanicalSpeciesCount < 30) {
      swaps.push(`Increase plant diversity from ${data.weeklyBotanicalSpeciesCount} to 30+ species/week using seed rotations, mixed herbs, and wild greens.`);
    }
    if (data.ancestralResistantStarchGramsDay < 20.0) {
      swaps.push('Incorporate cooled parboiled grains (farro, purple forbidden rice) or green banana/plantain flour to boost colonic butyrate.');
    }
    if (data.ultraProcessedFoodCaloricSharePct > 25.0) {
      swaps.push('Substitute emulsified commercial foods with traditional bone broths, potlikker, and fermented kraut/miso to shield mucosal mucus layer.');
    }
    if (swaps.length === 0) {
      swaps.push('Microbiome diversity and epithelial barrier integrity are robust. Maintain high polyphenol botanical variety.');
    }

    return {
      projectedFecalButyrateUmolG: butyrate,
      epithelialBarrierIntegrityScore: barrierScore,
      systemicEndotoxinLeakageRisk: endotoxinRisk,
      circulatingZonulinRiskLevel: zonulinRisk,
      ancestralNutritionGuidance: swaps
    };
  }

  /**
   * 4. Caregiver Cumulative Allostatic Load & Sleep Debt Forecaster
   */
  forecastCaregiverAllostaticLoad(data: ICaregiverAllostaticLoadInput): ICaregiverAllostaticLoadOutput {
    const dailyDebt = Math.max(0.0, 7.5 - data.totalSleepHoursActual);
    const fragmentationTax = data.nightlyAwakeningsForCare * 0.4;
    const weeklyDebt = Math.round((dailyDebt + fragmentationTax) * 7.0 * 10) / 10;

    const debtFactor = Math.min(1.0, weeklyDebt / 25.0);
    const isolationFactor = Math.min(1.0, data.consecutiveCaregivingDaysWithoutRespite / 30.0);
    const microsleepProb = Math.round(Math.min(95.0, Math.max(5.0, (debtFactor * 0.55 + isolationFactor * 0.35 + (data.nightlyAwakeningsForCare * 0.05)) * 100.0)) * 10) / 10;

    let tier: 'STABLE_EQUILIBRIUM' | 'COMPENSATING_STRAIN' | 'EXHAUSTION_CRITICAL' = 'STABLE_EQUILIBRIUM';
    let urgency: 'WITHIN_48_HOURS' | 'SCHEDULED_WEEKLY' | 'MAINTENANCE_PACE' = 'MAINTENANCE_PACE';
    let prescribedHours = 4;
    let plan = 'Caregiver physiological reserves are preserved. Maintain consistent sleep hygiene and bi-weekly respite checks.';

    if (weeklyDebt > 18.0 || data.consecutiveCaregivingDaysWithoutRespite > 21 || microsleepProb > 60.0) {
      tier = 'EXHAUSTION_CRITICAL';
      urgency = 'WITHIN_48_HOURS';
      prescribedHours = 48;
      plan = 'STAT CAREGIVER RESPITE MANDATED: Severe cumulative sleep debt with high daytime microsleep hazard. Hand off care immediately to professional home health aide or family relief for a continuous 48-hour restorative sleep reset.';
    } else if (weeklyDebt > 9.0 || data.consecutiveCaregivingDaysWithoutRespite > 10) {
      tier = 'COMPENSATING_STRAIN';
      urgency = 'SCHEDULED_WEEKLY';
      prescribedHours = 8;
      plan = 'SCHEDULED WEEKLY RESPITE: Caregiver is actively compensating. Schedule an 8-hour uninterrupted sleep shift this week and arrange transfer assistance to prevent musculoskeletal strain.';
    }

    return {
      allostaticOverloadTier: tier,
      cumulativeSleepDebtHoursWeekly: weeklyDebt,
      daytimeMicrosleepRiskPct: microsleepProb,
      respiteUrgency: urgency,
      prescribedRespiteShiftHours: prescribedHours,
      clinicalMitigationPlan: plan
    };
  }
}
