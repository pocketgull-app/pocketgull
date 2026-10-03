import { Injectable } from '@angular/core';

export type DecisionCategory =
  | 'RELOCATION_HOUSING'
  | 'CAREER_PIVOT_EDUCATION'
  | 'FINANCIAL_ALLOCATION'
  | 'FAMILY_PLANNING_FERTILITY'
  | 'ELDER_CARE_SUPPORT'
  | 'HEALTH_TREATMENT_CHOICE';

export type ReversibilityType = 'TYPE_1_ONE_WAY_DOOR' | 'TYPE_2_TWO_WAY_DOOR';

export interface IValuesDimension {
  id: string;
  name: string;
  description: string;
  scorePartnerA: number; // 1 to 10 scale
  scorePartnerB: number; // 1 to 10 scale
  weight: number; // 1 to 3 multiplier
}

export interface IValuesAlignmentResult {
  overallAlignmentPercentage: number;
  divergenceLevel: 'HARMONIOUS' | 'MODERATE_DIVERGENCE' | 'HIGH_FRICTION_RISK';
  highestTensionDimension: string;
  sharedValuesSummary: string;
  recommendations: string[];
}

export interface IFairPlayOwnership {
  id: string;
  domainName: string;
  conceptionOwner: 'PARTNER_A' | 'PARTNER_B' | 'SHARED';
  planningOwner: 'PARTNER_A' | 'PARTNER_B' | 'SHARED';
  executionOwner: 'PARTNER_A' | 'PARTNER_B' | 'SHARED';
  frictionNotes: string;
}

export interface IPreMortemAnalysis {
  decisionTitle: string;
  projectedFutureYears: number;
  projectedFailureScenario: string;
  rootCauses: {
    factor: string;
    likelihood: 'HIGH' | 'MEDIUM' | 'LOW';
    mitigationStrategy: string;
  }[];
  contingencyTrigger: string;
  circuitBreakerCondition: string;
}

export interface IReversibilityGateAssessment {
  category: DecisionCategory;
  doorType: ReversibilityType;
  coolingOffPeriodHours: number;
  safeToTestExperiment: string;
  haltRuleCheckPassed: boolean;
  autonomicReadiness: 'READY_TO_DELIBERATE' | 'HALT_ACTIVATED_COOLDOWN_MANDATED';
}

@Injectable({
  providedIn: 'root'
})
export class CouplesDecisionStudioService {

  /**
   * Default core values dimensions for joint couples life decisions.
   */
  getDefaultValuesDimensions(): IValuesDimension[] {
    return [
      {
        id: 'autonomic_stability',
        name: 'Autonomic Stability & Stress Load',
        description: 'Prioritizing sleep architecture, somatic safety, and avoiding chronic sympathetic fight-or-flight burnout.',
        scorePartnerA: 8,
        scorePartnerB: 7,
        weight: 2
      },
      {
        id: 'financial_runway',
        name: 'Financial Buffer & Margin of Safety',
        description: 'Maintaining a 6-12 month emergency buffer, avoiding debt overextension, and predictable cash flow.',
        scorePartnerA: 9,
        scorePartnerB: 6,
        weight: 3
      },
      {
        id: 'relational_intimacy',
        name: 'Relational Vitality & Connection Time',
        description: 'Preserving dedicated weekly date nights, emotional co-regulation, and non-negotiable couple time.',
        scorePartnerA: 8,
        scorePartnerB: 9,
        weight: 2
      },
      {
        id: 'purpose_autonomy',
        name: 'Personal Purpose & Creative Autonomy',
        description: 'Room for individual professional fulfillment, learning, calling, and self-actualization.',
        scorePartnerA: 7,
        scorePartnerB: 8,
        weight: 2
      },
      {
        id: 'intergenerational_legacy',
        name: 'Seven Generations & Community Roots',
        description: 'Proximity to extended family, children’s ecological grounding, and community mutual aid ties.',
        scorePartnerA: 7,
        scorePartnerB: 7,
        weight: 1
      }
    ];
  }

  /**
   * Evaluates values alignment and identifies potential hidden fault lines between partners.
   */
  evaluateValuesAlignment(dimensions: IValuesDimension[]): IValuesAlignmentResult {
    if (!dimensions || dimensions.length === 0) {
      return {
        overallAlignmentPercentage: 100,
        divergenceLevel: 'HARMONIOUS',
        highestTensionDimension: 'None',
        sharedValuesSummary: 'No dimensions provided.',
        recommendations: ['Define shared dimensions to evaluate alignment.']
      };
    }

    let totalWeightedDelta = 0;
    let maxWeightedDelta = 0;
    let highestTensionDimName = '';
    let maxDelta = -1;

    for (const dim of dimensions) {
      const delta = Math.abs(dim.scorePartnerA - dim.scorePartnerB);
      const weightedDelta = delta * dim.weight;
      totalWeightedDelta += weightedDelta;
      maxWeightedDelta += 9 * dim.weight; // Max possible delta on 1-10 scale is 9

      if (delta > maxDelta) {
        maxDelta = delta;
        highestTensionDimName = dim.name;
      }
    }

    const alignmentFraction = maxWeightedDelta > 0 ? (1 - totalWeightedDelta / maxWeightedDelta) : 1;
    const overallAlignmentPercentage = Math.round(alignmentFraction * 100);

    let divergenceLevel: 'HARMONIOUS' | 'MODERATE_DIVERGENCE' | 'HIGH_FRICTION_RISK' = 'HARMONIOUS';
    const recs: string[] = [];

    if (overallAlignmentPercentage < 65 || maxDelta >= 4) {
      divergenceLevel = 'HIGH_FRICTION_RISK';
      recs.push(
        `Critical divergence in "${highestTensionDimName}". Do NOT finalize one-way decisions without exploring the underlying fears driving this gap.`,
        'Schedule a structured, time-boxed (20 min) listening session where each partner speaks for 5 minutes without interruption.',
        'Adopt a "disagree and commit to a 60-day test" only if safe two-way door conditions can be established.'
      );
    } else if (overallAlignmentPercentage < 82 || maxDelta >= 2) {
      divergenceLevel = 'MODERATE_DIVERGENCE';
      recs.push(
        `Moderate tension in "${highestTensionDimName}". Clarify what compromise satisfies the 80% baseline for both partners.`,
        'Ensure the partner with lower appetite has explicit circuit-breaker veto power if predetermined risk thresholds are breached.'
      );
    } else {
      recs.push(
        'High values harmony detected across core life anchors.',
        'Proceed with clear role execution and mutual check-in milestones.'
      );
    }

    return {
      overallAlignmentPercentage,
      divergenceLevel,
      highestTensionDimension: highestTensionDimName,
      sharedValuesSummary: `Core alignment score is ${overallAlignmentPercentage}%. Primary area of focus: ${highestTensionDimName}.`,
      recommendations: recs
    };
  }

  /**
   * Assesses decision reversibility (Jeff Bezos / Kahneman Type 1 vs Type 2 Door),
   * applying the HALT somatic rule (Hungry, Angry, Lonely, Tired).
   */
  evaluateReversibilityGate(params: {
    category: DecisionCategory;
    isEasilyReversible: boolean;
    financialCostThresholdExceeded: boolean;
    isPartnerHungryOrTired: boolean;
    isHeartRateElevatedOrSympathetic: boolean;
  }): IReversibilityGateAssessment {
    const isHaltTriggered = params.isPartnerHungryOrTired || params.isHeartRateElevatedOrSympathetic;
    const doorType: ReversibilityType = (!params.isEasilyReversible || params.financialCostThresholdExceeded)
      ? 'TYPE_1_ONE_WAY_DOOR'
      : 'TYPE_2_TWO_WAY_DOOR';

    // Type 1 decisions require mandatory 48-hour cooling-off and zero HALT state
    const coolingHours = doorType === 'TYPE_1_ONE_WAY_DOOR' ? 48 : (isHaltTriggered ? 12 : 0);

    let experiment = '';
    switch (params.category) {
      case 'RELOCATION_HOUSING':
        experiment = 'Rent an Airbnb or short-term sublet in the target neighborhood for 2-4 weeks before signing a lease or listing existing home.';
        break;
      case 'CAREER_PIVOT_EDUCATION':
        experiment = 'Take on a 5-hour/week advisory or freelance pilot project for 90 days while preserving existing cash flow baseline.';
        break;
      case 'FINANCIAL_ALLOCATION':
        experiment = 'Allocate 10% of planned capital for Phase 1 proof-of-concept milestone before releasing remaining treasury.';
        break;
      case 'FAMILY_PLANNING_FERTILITY':
        experiment = 'Engage in a 30-day shared reflection with a reproductive endocrinologist or family counselor, charting biological and emotional capacity.';
        break;
      case 'ELDER_CARE_SUPPORT':
        experiment = 'Implement a 30-day hybrid respite plan with visiting home aide (8 hrs/week) before permanent assisted-living transitions.';
        break;
      case 'HEALTH_TREATMENT_CHOICE':
        experiment = 'Obtain a second independent clinical opinion and trial non-invasive lifestyle/physical therapy protocol for 6 weeks where safe.';
        break;
    }

    return {
      category: params.category,
      doorType,
      coolingOffPeriodHours: coolingHours,
      safeToTestExperiment: experiment,
      haltRuleCheckPassed: !isHaltTriggered,
      autonomicReadiness: isHaltTriggered
        ? 'HALT_ACTIVATED_COOLDOWN_MANDATED'
        : 'READY_TO_DELIBERATE'
    };
  }

  /**
   * Generates a Gary Klein "Pre-Mortem" analysis to inoculate couples against optimism bias.
   */
  generatePreMortem(
    title: string,
    category: DecisionCategory,
    yearsAhead: number = 2
  ): IPreMortemAnalysis {
    const defaultFailures: Record<DecisionCategory, { failure: string; factors: { factor: string; likelihood: 'HIGH' | 'MEDIUM' | 'LOW'; mitigationStrategy: string }[]; trigger: string; breaker: string }> = {
      RELOCATION_HOUSING: {
        failure: `It is ${yearsAhead} years from now, and the move has led to deep relational isolation, unexpected commuting fatigue, and resentment over lost community ties.`,
        factors: [
          { factor: 'Severed neighborhood social network', likelihood: 'HIGH', mitigationStrategy: 'Commit to joining two local community/civic groups within the first 30 days.' },
          { factor: 'Underestimated commute/transit friction', likelihood: 'HIGH', mitigationStrategy: 'Test real-world morning and evening commutes in peak rush hour before moving.' },
          { factor: 'Hidden repair and property maintenance costs', likelihood: 'MEDIUM', mitigationStrategy: 'Maintain a dedicated 1.5x home maintenance contingency reserve.' }
        ],
        trigger: 'Either partner reports feelings of prolonged loneliness (>60 days) or marital satisfaction drops.',
        breaker: 'If unaddressed after 12 months, agree in advance to execute an exit plan back to familiar territory without recrimination.'
      },
      CAREER_PIVOT_EDUCATION: {
        failure: `It is ${yearsAhead} years from now. The pivot devoured all household cognitive bandwidth, income dropped, and the other partner carries 90% of family labor.`,
        factors: [
          { factor: 'Asymmetric invisible household burden shift', likelihood: 'HIGH', mitigationStrategy: 'Write explicit Fair Play CPE contracts; automate chores or hire housecleaning.' },
          { factor: 'Revenue ramp taking 3x longer than anticipated', likelihood: 'MEDIUM', mitigationStrategy: 'Cap total seed capital spend at a hard boundary; require monthly P&L reviews.' },
          { factor: 'Loss of weekend/evening shared couple recharge time', likelihood: 'HIGH', mitigationStrategy: 'Protect inviolable Sunday family hours regardless of work deadlines.' }
        ],
        trigger: 'Liquid emergency runway falls below 4 months, or sleep debt exceeds 15 hours/week.',
        breaker: 'Pause pivot and return to stable baseline employment if traction metrics are not met by Month 14.'
      },
      FINANCIAL_ALLOCATION: {
        failure: `It is ${yearsAhead} years from now. The investment/purchase created chronic baseline anxiety and ongoing arguments during every monthly budget review.`,
        factors: [
          { factor: 'Market volatility inducing nocturnal panic', likelihood: 'MEDIUM', mitigationStrategy: 'Establish clear pre-agreed stop-loss rules so decisions are mechanical, not emotional.' },
          { factor: 'Illiquidity during an unexpected medical/home emergency', likelihood: 'HIGH', mitigationStrategy: 'Never touch the untouchable 6-month liquid emergency fund.' }
        ],
        trigger: 'Any emergency expense requires credit card borrowing to cover essential living needs.',
        breaker: 'Liquidate discretionary positions immediately if core runway is threatened.'
      },
      FAMILY_PLANNING_FERTILITY: {
        failure: `It is ${yearsAhead} years from now. Severe physical and emotional exhaustion has strained intimate connection and communication has devolved into transactional logistics.`,
        factors: [
          { factor: 'Depletion of sleep and self-care reserves', likelihood: 'HIGH', mitigationStrategy: 'Establish scheduled alternating nighttime shifts and postpartum doula/family support.' },
          { factor: 'Loss of couple identity outside parental roles', likelihood: 'MEDIUM', mitigationStrategy: 'Schedule standing 90-minute weekly daytime date while trusted family watches baby.' }
        ],
        trigger: 'Partner depressive symptoms or chronic irritability lasting over 3 weeks.',
        breaker: 'Immediately engage certified postpartum perinatal mental health support.'
      },
      ELDER_CARE_SUPPORT: {
        failure: `It is ${yearsAhead} years from now. Full-time caregiving has caused primary partner physical injury, career loss, and severe emotional exhaustion.`,
        factors: [
          { factor: 'Caregiver burnout & secondary trauma', likelihood: 'HIGH', mitigationStrategy: 'Mandate scheduled 48-hour monthly respite care away from the care environment.' },
          { factor: 'Unspoken conflict with siblings over shared care equity', likelihood: 'HIGH', mitigationStrategy: 'Hold structured quarterly family meetings with transparent financial ledgers.' }
        ],
        trigger: 'Caregiver sleep debt exceeds 10 hours/week or missed preventative medical appointments.',
        breaker: 'Transition to professional home healthcare agency coverage.'
      },
      HEALTH_TREATMENT_CHOICE: {
        failure: `It is ${yearsAhead} years from now. Treatment complications or secondary side effects were navigated in isolation without joint patient advocacy.`,
        factors: [
          { factor: 'Treatment burden and cognitive fatigue', likelihood: 'MEDIUM', mitigationStrategy: 'Designate the healthy partner as chief scribe and note-taker for all specialist consults.' },
          { factor: 'Financial toxicity from out-of-pocket costs', likelihood: 'HIGH', mitigationStrategy: 'Engage hospital financial counselor and explore patient assistance programs early.' }
        ],
        trigger: 'Treatment side effects interfere with basic activities of daily living.',
        breaker: 'Convene immediate multidisciplinary clinical case conference.'
      }
    };

    const template = defaultFailures[category] || defaultFailures.CAREER_PIVOT_EDUCATION;

    return {
      decisionTitle: title,
      projectedFutureYears: yearsAhead,
      projectedFailureScenario: template.failure,
      rootCauses: template.factors,
      contingencyTrigger: template.trigger,
      circuitBreakerCondition: template.breaker
    };
  }

  /**
   * Generates sample Eve Rodsky "Fair Play" Conception-Planning-Execution task cards.
   */
  getDefaultFairPlayTasks(): IFairPlayOwnership[] {
    return [
      {
        id: 'fp_meals',
        domainName: 'Daily Nutrition & Meal Logistics',
        conceptionOwner: 'PARTNER_A',
        planningOwner: 'PARTNER_A',
        executionOwner: 'PARTNER_B',
        frictionNotes: 'Partner A carries 100% of the cognitive grocery/recipe planning; Partner B cooks without knowing inventory.'
      },
      {
        id: 'fp_finances',
        domainName: 'Household Finances & Bill Pay',
        conceptionOwner: 'PARTNER_B',
        planningOwner: 'PARTNER_B',
        executionOwner: 'PARTNER_B',
        frictionNotes: 'Partner B holds all banking logins and budget anxieties in isolation; Partner A feels out of the loop.'
      },
      {
        id: 'fp_medical',
        domainName: 'Pediatric/Family Healthcare & Rx',
        conceptionOwner: 'PARTNER_A',
        planningOwner: 'PARTNER_A',
        executionOwner: 'PARTNER_A',
        frictionNotes: 'Complete single-partner overload on specialist bookings, dental calendars, and insurance paperwork.'
      },
      {
        id: 'fp_social',
        domainName: 'Extended Family & Social Calendar',
        conceptionOwner: 'SHARED',
        planningOwner: 'PARTNER_A',
        executionOwner: 'SHARED',
        frictionNotes: 'Holiday logistics and birthday gifts fall disproportionately on Partner A.'
      }
    ];
  }
}
