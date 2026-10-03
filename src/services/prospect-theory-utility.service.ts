/**
 * @file prospect-theory-utility.service.ts
 * @description Personalized Prospect Theory Utility Service (Kahneman & Tversky).
 * 
 * Computes patient-specific subjective value functions:
 * v(x) = x^alpha           (for gains x >= 0)
 * v(x) = -lambda * (-x)^beta (for losses x < 0)
 * 
 * Adapts clinical risk recommendations according to the patient's individual loss aversion
 * and mobility requirements (e.g., professional athlete vs desk worker).
 */

import { Injectable } from '@angular/core';

export type PatientMobilityArchetype = 'elite_athlete' | 'active_laborer' | 'sedentary_professional' | 'geriatric_fall_risk';

export interface IProspectProfile {
  readonly archetype: PatientMobilityArchetype;
  readonly lossAversionLambda: number; // typically ~2.25 for average, ~3.5 for athlete
  readonly gainConcavityAlpha: number;  // ~0.88
  readonly lossConvexityBeta: number;   // ~0.88
  readonly description: string;
}

export interface IUtilityEvaluation {
  readonly archetype: PatientMobilityArchetype;
  readonly netSubjectiveUtility: number;
  readonly gainComponent: number;
  readonly lossComponent: number;
  readonly riskRecommendation: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProspectTheoryUtilityService {
  private readonly archetypes: Record<PatientMobilityArchetype, IProspectProfile> = {
    elite_athlete: {
      archetype: 'elite_athlete',
      lossAversionLambda: 3.8, // Extremely high aversion to ligamentous instability
      gainConcavityAlpha: 0.90,
      lossConvexityBeta: 0.85,
      description: 'High mechanical demand: instability constitutes career-ending loss.'
    },
    active_laborer: {
      archetype: 'active_laborer',
      lossAversionLambda: 2.8,
      gainConcavityAlpha: 0.88,
      lossConvexityBeta: 0.88,
      description: 'Moderate-to-high mechanical demand: weight-bearing essential for livelihood.'
    },
    sedentary_professional: {
      archetype: 'sedentary_professional',
      lossAversionLambda: 2.0,
      gainConcavityAlpha: 0.85,
      lossConvexityBeta: 0.90,
      description: 'Low mechanical shock demand: conservative physical therapy prioritized.'
    },
    geriatric_fall_risk: {
      archetype: 'geriatric_fall_risk',
      lossAversionLambda: 3.2,
      gainConcavityAlpha: 0.80,
      lossConvexityBeta: 0.80,
      description: 'High fall vulnerability: joint collapse carries severe fracture risk.'
    }
  };

  public getProfile(archetype: PatientMobilityArchetype): IProspectProfile {
    return this.archetypes[archetype] || this.archetypes.sedentary_professional;
  }

  /**
   * Computes subjective value v(x) under Prospect Theory.
   */
  public evaluateSubjectiveValue(
    gainScore: number,
    lossRiskScore: number,
    archetype: PatientMobilityArchetype = 'sedentary_professional'
  ): IUtilityEvaluation {
    const profile = this.getProfile(archetype);
    
    // Gain component: v(g) = g^alpha
    const gVal = Math.pow(Math.max(0, gainScore), profile.gainConcavityAlpha);
    
    // Loss component: -lambda * (loss)^beta
    const lVal = profile.lossAversionLambda * Math.pow(Math.max(0, lossRiskScore), profile.lossConvexityBeta);
    const netVal = gVal - lVal;

    let recommendation: string;
    if (netVal > 0.5) {
      recommendation = `Favorable clinical utility (+${netVal.toFixed(2)}): intervention benefits outweigh perceived loss risks for ${profile.archetype}.`;
    } else if (netVal < -0.5) {
      recommendation = `Unfavorable subjective utility (${netVal.toFixed(2)}): high loss aversion dictates conservative stepped management before invasive options.`;
    } else {
      recommendation = `Equivocal utility (${netVal.toFixed(2)}): initiate shared decision-making with Socratic clarification.`;
    }

    return {
      archetype,
      netSubjectiveUtility: netVal,
      gainComponent: gVal,
      lossComponent: lVal,
      riskRecommendation: recommendation
    };
  }
}
