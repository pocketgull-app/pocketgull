import { Injectable } from '@angular/core';

export interface IPatientGameStrategy {
  adherenceEffortPercent: number;  // 0% to 100%
  expectedOutofPocketCostUsd: number;
  perceivedEffortFrictionUsd: number;
  expectedFinancialRewardUsd: number;
  netPatientUtilityUsd: number;
}

export interface IPayerGameStrategy {
  offeredAdherenceRebateUsd: number; // Reward per year for PDC >= 80%
  estAvoidedHospitalizationCostUsd: number; // Cost savings from avoided ER/inpatient care
  netPayerSavingsUsd: number;
  isNashEquilibrium: boolean;
}

export interface IClinicalGameTheoryResult {
  patientId: string;
  conditionName: string;
  optimalRebateSubsidyUsd: number; // Calculated r*
  targetPdcPercent: number;       // e.g. 80% or 85%
  patientStrategy: IPatientGameStrategy;
  payerStrategy: IPayerGameStrategy;
  gameTheoryDirective: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalGameTheoryService {

  /**
   * Computes Stackelberg / Nash Equilibrium for patient medication adherence incentives.
   * Payer sets reward subsidy r*, Patient chooses optimal adherence effort e*(r).
   */
  public calculateOptimalAdherenceIncentive(params: {
    patientId: string;
    conditionName: string;
    annualCopayCostUsd: number;              // e.g. $480/yr
    estAnnualHospitalizationRiskUsd: number; // e.g. $12,500/yr avoided admission cost
    patientEffortFrictionFactor?: number;    // gamma parameter (default 200)
  }): IClinicalGameTheoryResult {
    const copay = params.annualCopayCostUsd;
    const avoidedHospitalization = params.estAnnualHospitalizationRiskUsd;
    const gamma = params.patientEffortFrictionFactor || 200;

    // Stackelberg Leader (Payer) optimal subsidy formula:
    // Payer maximizes U_payer(r) = avoidedHospitalization * e(r) - r * e(r)
    // Patient maximizes U_patient(e) = r * e - copay * (1 - e) - 0.5 * gamma * e^2
    // Optimal effort: e*(r) = (r + copay) / gamma
    // Optimal rebate r* = (avoidedHospitalization - copay) / 2
    const rawOptimalRebate = (avoidedHospitalization - copay) / 2;
    const optimalRebateSubsidyUsd = Math.max(0, Math.min(600, Math.round(rawOptimalRebate / 10) * 10));

    // Calculate equilibrium adherence effort e*
    const rawEffort = (optimalRebateSubsidyUsd + copay) / gamma;
    const adherenceEffortPercent = Math.min(95, Math.max(50, Math.round(rawEffort * 100)));

    const effortFraction = adherenceEffortPercent / 100;
    const expectedOutofPocketCostUsd = Math.round(copay * (1 - effortFraction));
    const perceivedEffortFrictionUsd = Math.round(0.5 * gamma * effortFraction * effortFraction);
    const expectedFinancialRewardUsd = Math.round(optimalRebateSubsidyUsd * effortFraction);
    const netPatientUtilityUsd = expectedFinancialRewardUsd - expectedOutofPocketCostUsd - perceivedEffortFrictionUsd;

    const estAvoidedHospitalizationCostUsd = Math.round(avoidedHospitalization * effortFraction);
    const netPayerSavingsUsd = estAvoidedHospitalizationCostUsd - expectedFinancialRewardUsd;

    const patientStrategy: IPatientGameStrategy = {
      adherenceEffortPercent,
      expectedOutofPocketCostUsd,
      perceivedEffortFrictionUsd,
      expectedFinancialRewardUsd,
      netPatientUtilityUsd
    };

    const payerStrategy: IPayerGameStrategy = {
      offeredAdherenceRebateUsd: optimalRebateSubsidyUsd,
      estAvoidedHospitalizationCostUsd,
      netPayerSavingsUsd,
      isNashEquilibrium: true
    };

    const directive = `NASH EQUILIBRIUM REACHED: Offering $${optimalRebateSubsidyUsd}/yr adherence rebate yields ${adherenceEffortPercent}% PDC medication adherence, saving Payer $${netPayerSavingsUsd.toLocaleString()}/yr in avoided admissions while increasing Patient net utility by $${netPatientUtilityUsd}/yr.`;

    return {
      patientId: params.patientId,
      conditionName: params.conditionName,
      optimalRebateSubsidyUsd,
      targetPdcPercent: 80,
      patientStrategy,
      payerStrategy,
      gameTheoryDirective: directive
    };
  }
}
