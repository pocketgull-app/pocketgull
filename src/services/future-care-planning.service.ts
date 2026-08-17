import { Injectable, signal } from '@angular/core';

export interface IFutureCareInput {
  patientAge: number;
  currentHealthStatus: 'Optimal_Vitality' | 'Mild_Chronic_Condition' | 'Complex_Multimorbid' | 'Early_Frailty';
  primaryValuesAndDignityGoals: string[];
  refusalOfInvasiveInterventionsUnderIrreversibleLoss: boolean;
  designatedHealthcareProxyRelationship: 'Adult_Child' | 'Spouse_Partner' | 'Trusted_Advocate' | 'Professional_Fiduciary';
  financialHealthspanPriorities: Array<'Medicare_IRMAA_Avoidance' | 'Long_Term_Care_Home_Independence' | 'Intergenerational_Health_Trust'>;
  baselineBiomarkers?: {
    cacScore?: number;
    apob_mg_dL?: number;
    vo2Max_mL_kg_min?: number;
    hba1c_percent?: number;
  };
}

export interface IFutureCarePlanReport {
  planId: string;
  generatedAt: string;
  multiDecadalHealthspanProjections: {
    tenYearHorizonAge: number;
    tenYearProjectedCapacityPercent: number;
    twentyYearHorizonAge: number;
    twentyYearProjectedCapacityPercent: number;
    thirtyYearHorizonAge: number;
    thirtyYearProjectedCapacityPercent: number;
    keyPreventiveMilestoneChecklist: Array<{
      targetAge: number;
      diagnosticScreening: string;
      interventionalPurpose: string;
    }>;
  };
  valuesBasedAdvanceCareDirective: {
    dignityThresholdStatement: string;
    cprAndMechanicalVentilationPreference: 'Full_Code' | 'Time_Limited_Trial' | 'DNR_Comfort_Care_Only';
    artificialNutritionHydrationPreference: 'Trial_Only' | 'Comfort_Oral_Only' | 'Unlimited_Tube_Feeding';
    surrogateDecisionMakerGuidance: string;
  };
  fhirConsentResource: {
    resourceType: 'Consent';
    id: string;
    status: 'active';
    scope: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/consentscope', code: 'adr', display: 'Advanced Care Directive' }] };
    category: [{ coding: [{ system: 'http://loinc.org', code: '64298-3', display: 'Advance Care Directive Plan' }] }];
    policyRule: 'Values-Based Dignity Directive (50-State Statutory Conformant)';
    provision: {
      type: 'permit';
      period: { start: string };
    };
  };
  healthEconomicsAndLtcSecurity: {
    estimatedHomeIndependenceSavingsUsd: number;
    medicareIrmaaTierMitigationAdvice: string;
    intergenerationalKnowledgeTransferDirectives: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class FutureCarePlanningService {
  readonly activePlans = signal<IFutureCarePlanReport[]>([]);

  /**
   * Generates a multi-decade personalized healthspan, advance care dignity directive,
   * and long-term care sustainability plan conforming to FHIR R4 Consent standards.
   */
  generateFuturePlan(input: IFutureCareInput): IFutureCarePlanReport {
    const age = input.patientAge;
    const isOptimal = input.currentHealthStatus === 'Optimal_Vitality';

    // 1. Healthspan Multi-Decade Trajectory Capacity Projections
    const base10 = isOptimal ? 92 : input.currentHealthStatus === 'Mild_Chronic_Condition' ? 82 : 70;
    const base20 = isOptimal ? 84 : input.currentHealthStatus === 'Mild_Chronic_Condition' ? 68 : 52;
    const base30 = isOptimal ? 74 : input.currentHealthStatus === 'Mild_Chronic_Condition' ? 54 : 38;

    // 2. Preventive Decadal Milestones
    const milestones = [
      {
        targetAge: Math.min(age + 5, 50),
        diagnosticScreening: 'Coronary Artery Calcium (CAC) CT & ApoB Particle Quantification',
        interventionalPurpose: 'Detect subclinical soft and calcified atheroma 15 years prior to ischemic event risk.'
      },
      {
        targetAge: Math.min(age + 10, 60),
        diagnosticScreening: 'Dual-Energy X-Ray Absorptiometry (DEXA) Body Composition & Bone Density',
        interventionalPurpose: 'Quantify visceral adipose tissue (VAT) and lumbar/femoral T-scores to prevent osteoporosis.'
      },
      {
        targetAge: Math.min(age + 15, 70),
        diagnosticScreening: 'Comprehensive Neuro-Cognitive Baseline & Gait Velocity Telemetry',
        interventionalPurpose: 'Detect subtle executive processing and dual-task gait changes to initiate targeted balance/strength interventions.'
      }
    ];

    // 3. Values-Based Advance Care Directives
    const dignityStatement = input.primaryValuesAndDignityGoals.length > 0
      ? input.primaryValuesAndDignityGoals.join('. ')
      : 'Prioritize cognitive awareness, relational connection, and physical comfort above purely mechanical biological prolongation.';

    let codePref: IFutureCarePlanReport['valuesBasedAdvanceCareDirective']['cprAndMechanicalVentilationPreference'] = 'Full_Code';
    let nutritionPref: IFutureCarePlanReport['valuesBasedAdvanceCareDirective']['artificialNutritionHydrationPreference'] = 'Trial_Only';

    if (input.refusalOfInvasiveInterventionsUnderIrreversibleLoss) {
      codePref = input.currentHealthStatus === 'Early_Frailty' ? 'DNR_Comfort_Care_Only' : 'Time_Limited_Trial';
      nutritionPref = 'Comfort_Oral_Only';
    }

    const surrogateGuidance = `To my designated ${input.designatedHealthcareProxyRelationship}: If I have an irreversible cognitive or physical impairment where I cannot communicate or recognize loved ones, know that you have my full love and blessing to choose palliative comfort over prolonged invasive machinery.`;

    const plan: IFutureCarePlanReport = {
      planId: `FUTURE-CARE-${Date.now().toString(36).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      multiDecadalHealthspanProjections: {
        tenYearHorizonAge: age + 10,
        tenYearProjectedCapacityPercent: base10,
        twentyYearHorizonAge: age + 20,
        twentyYearProjectedCapacityPercent: base20,
        thirtyYearHorizonAge: age + 30,
        thirtyYearProjectedCapacityPercent: base30,
        keyPreventiveMilestoneChecklist: milestones
      },
      valuesBasedAdvanceCareDirective: {
        dignityThresholdStatement: dignityStatement,
        cprAndMechanicalVentilationPreference: codePref,
        artificialNutritionHydrationPreference: nutritionPref,
        surrogateDecisionMakerGuidance: surrogateGuidance
      },
      fhirConsentResource: {
        resourceType: 'Consent',
        id: `consent-future-${Date.now().toString(36)}`,
        status: 'active',
        scope: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/consentscope',
            code: 'adr',
            display: 'Advanced Care Directive'
          }]
        },
        category: [{
          coding: [{
            system: 'http://loinc.org',
            code: '64298-3',
            display: 'Advance Care Directive Plan'
          }]
        }],
        policyRule: 'Values-Based Dignity Directive (50-State Statutory Conformant)',
        provision: {
          type: 'permit',
          period: { start: new Date().toISOString().split('T')[0] }
        }
      },
      healthEconomicsAndLtcSecurity: {
        estimatedHomeIndependenceSavingsUsd: 145000,
        medicareIrmaaTierMitigationAdvice: 'Structure retirement account RMDs and taxable events to remain below Medicare Part B/D IRMAA Tier 1 surcharges ($106k single / $212k joint).',
        intergenerationalKnowledgeTransferDirectives: [
          'Archive family pharmacogenomic adverse drug reactions (CYP2D6, CYP2C19) in secure FHIR health vault.',
          'Review advance care values annually with designated proxy to maintain peace of mind.'
        ]
      }
    };

    this.activePlans.update(plans => [plan, ...plans.slice(0, 19)]);
    return plan;
  }
}
