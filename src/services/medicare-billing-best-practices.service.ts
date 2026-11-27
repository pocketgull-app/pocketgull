// SPDX-License-Identifier: Apache-2.0
import { Injectable } from '@angular/core';

export type MedicarePlanYear = 2025 | 2026 | 2027;

/**
 * CMS-indexed Inflation Reduction Act (IRA) Medicare Part D annual out-of-pocket caps.
 * 2025 baseline: $2,000; 2026 CMS-indexed: $2,100; 2027 CMS-indexed: $2,400.
 */
export const IRA_PART_D_CAPS: Record<MedicarePlanYear, number> = {
  2025: 2000,
  2026: 2100,
  2027: 2400
};

export const DEFAULT_MEDICARE_PLAN_YEAR: MedicarePlanYear = 2026;

/**
 * 2026 HHS Federal Poverty Guidelines (48 contiguous states & DC)
 * $15,960 for 1 person + $5,680 per additional household member ($33,000 for family of 4).
 */
export const HHS_2026_FPL_BASE_USD = 15960;
export const HHS_2026_FPL_INCREMENT_USD = 5680;

export type MspProgramTier = 'QMB' | 'SLMB' | 'QI' | 'QDWI' | 'NONE';

export type HrsnSocialNeedKey =
  | 'housing-instability'
  | 'food-insecurity'
  | 'transportation-barrier'
  | 'utility-or-financial-strain'
  | 'social-isolation';

export interface IMpppOption {
  planYear: MedicarePlanYear;
  statutoryCapAmount: number;
  annualOutofPocket: number;
  isCapped: boolean;
  effectiveCapAmount: number;
  annualSavingsUsd: number;
  remainingMonths: number;
  monthlyMpppPayment: number;
  savingsDescription: string;
}

export interface IExtraHelpMspEligibility {
  planYear: MedicarePlanYear;
  maritalStatus: 'individual' | 'married';
  monthlyIncomeUsd: number;
  countableResourcesUsd: number | null;
  fplPercentage: number;
  extraHelpEligible: boolean;
  extraHelpAutoQualified: boolean;
  extraHelpGenericCopayCapUsd: number;
  extraHelpBrandCopayCapUsd: number;
  mspTier: MspProgramTier;
  qmbBalanceBillingProtected: boolean;
  statutoryProtectionCitation: string;
  guidanceSummary: string;
}

export interface IApcmAndG2211Code {
  hcpcsCode: 'G0556' | 'G0557' | 'G0558' | 'G2211' | 'G0136';
  title: string;
  tierOrScope: string;
  isEligible: boolean;
  estReimbursementUsd: number;
  patientCostSharingUsd: number | null;
  fqhcRhcEligible: boolean;
  billingGuardNote: string;
}

export interface IHrsnZCodeMapping {
  need: HrsnSocialNeedKey;
  icd10ZCode: string;
  description: string;
  section1115BenefitLink: string;
}

export interface IApcmAndSafetyNetAssessment {
  recommendedApcmCode: IApcmAndG2211Code | null;
  g2211AddOn: IApcmAndG2211Code;
  sdohAssessmentG0136: IApcmAndG2211Code;
  allEvaluatedCodes: IApcmAndG2211Code[];
  ccmExclusivityConflict: boolean;
  ccmExclusivityNote: string;
  estimatedMonthlyClinicRevenueUsd: number;
  hrsnZCodes: IHrsnZCodeMapping[];
}

export interface IRpmBillingCode {
  cptCode: string;
  description: string;
  requirement: string;
  isCompliant: boolean;
  estReimbursementUsd: number;
}

export interface IGoodFaithEstimateItem {
  cptCode: string;
  description: string;
  estimatedCost: number;
}

export interface IGoodFaithEstimate {
  patientId: string;
  createdDate: string;
  items: IGoodFaithEstimateItem[];
  totalEstimatedCost: number;
  disputeNoticeThreshold: number; // $400 over estimate triggers Independent Dispute Resolution
}

export interface ICharityCareEligibility {
  fplPercentage: number;
  isEligibleFor100PercentDiscount: boolean; // <=200% FPL
  isEligibleForPartialDiscount: boolean;    // 200-400% FPL
  irs501rPolicyDirective: string;
}

export interface IMedicareBillingAssessment {
  mppp: IMpppOption;
  extraHelpMsp: IExtraHelpMspEligibility;
  apcmSafetyNet: IApcmAndSafetyNetAssessment;
  rpmBillingCodes: IRpmBillingCode[];
  gfe: IGoodFaithEstimate;
  charityCare: ICharityCareEligibility;
  actionableDirectives: string[];
}

const HRSN_ZCODE_CATALOG: Record<HrsnSocialNeedKey, IHrsnZCodeMapping> = {
  'housing-instability': {
    need: 'housing-instability',
    icd10ZCode: 'Z59.00',
    description: 'Homelessness / Unstable Housing',
    section1115BenefitLink: 'Medicaid Section 1115 HRSN Housing Transition & Tenancy Sustaining Services'
  },
  'food-insecurity': {
    need: 'food-insecurity',
    icd10ZCode: 'Z59.41',
    description: 'Food Insecurity',
    section1115BenefitLink: 'Medicaid Section 1115 Medically Tailored Meals (MTM) & Produce Rx'
  },
  'transportation-barrier': {
    need: 'transportation-barrier',
    icd10ZCode: 'Z59.82',
    description: 'Transportation Insecurity',
    section1115BenefitLink: 'Medicaid Mandatory Non-Emergency Medical Transportation (NEMT, 42 C.F.R. § 431.53)'
  },
  'utility-or-financial-strain': {
    need: 'utility-or-financial-strain',
    icd10ZCode: 'Z59.86',
    description: 'Financial / Utility Insecurity',
    section1115BenefitLink: 'LIHEAP Medical Baseline Protection & IRS 501(r) Financial Assistance'
  },
  'social-isolation': {
    need: 'social-isolation',
    icd10ZCode: 'Z60.2',
    description: 'Problems Related to Living Alone / Social Isolation',
    section1115BenefitLink: 'Community Health Integration (CHI G0019) & Area Agency on Aging Care Coordination'
  }
};

@Injectable({
  providedIn: 'root'
})
export class MedicareBillingBestPracticesService {

  /**
   * Returns the CMS-indexed IRA Medicare Part D out-of-pocket cap for a given plan year.
   */
  public getPartDCapForYear(planYear: MedicarePlanYear = DEFAULT_MEDICARE_PLAN_YEAR): number {
    return IRA_PART_D_CAPS[planYear] ?? IRA_PART_D_CAPS[DEFAULT_MEDICARE_PLAN_YEAR];
  }

  /**
   * Calculates CMS-indexed Medicare Part D Inflation Reduction Act Out-of-Pocket Cap
   * ($2,000 in 2025, $2,100 in 2026, $2,400 in 2027) & Medicare Prescription Payment Plan (M3P)
   * interest-free monthly smoothing across remaining calendar months.
   */
  public calculateMpppSmoothing(
    annualRxCost: number,
    remainingMonths: number = 12,
    planYear: MedicarePlanYear = DEFAULT_MEDICARE_PLAN_YEAR
  ): IMpppOption {
    const safeCost = Number.isFinite(annualRxCost) ? Math.max(0, annualRxCost) : 0;
    const statutoryCap = this.getPartDCapForYear(planYear);
    const isCapped = safeCost > statutoryCap;
    const effectiveCost = Math.min(safeCost, statutoryCap);
    const annualSavingsUsd = isCapped ? Number((safeCost - statutoryCap).toFixed(2)) : 0;
    const months = Math.max(1, Math.min(12, Math.floor(remainingMonths || 12)));
    const monthlyPayment = Number((effectiveCost / months).toFixed(2));
    const formattedCap = statutoryCap.toLocaleString('en-US');

    return {
      planYear,
      statutoryCapAmount: statutoryCap,
      annualOutofPocket: safeCost,
      isCapped,
      effectiveCapAmount: effectiveCost,
      annualSavingsUsd,
      remainingMonths: months,
      monthlyMpppPayment: monthlyPayment,
      savingsDescription: isCapped
        ? `Protected by ${planYear} Inflation Reduction Act $${formattedCap} Part D cap. You save $${annualSavingsUsd.toFixed(2)}/yr. Optional M3P spreads cost into $${monthlyPayment.toFixed(2)}/mo interest-free over ${months} month${months === 1 ? '' : 's'}.`
        : `Total ${planYear} Rx out-of-pocket is $${safeCost.toFixed(2)} (under $${formattedCap} IRA cap). Optional M3P monthly smoothing: $${monthlyPayment.toFixed(2)}/mo over ${months} month${months === 1 ? '' : 's'}.`
    };
  }

  /**
   * Screens 2026 Medicare Part D Extra Help (Low-Income Subsidy / LIS) and
   * Medicare Savings Programs (QMB, SLMB, QI, QDWI) using 2026 federal baseline limits
   * (48 contiguous states & DC; notes state-level liberalized rules).
   */
  public evaluateExtraHelpAndMsp(params: {
    annualIncomeUsd: number;
    maritalStatus?: 'individual' | 'married';
    countableResourcesUsd?: number | null;
    hasFullMedicaid?: boolean;
    hasSsi?: boolean;
    isWorkingDisabledUnder65?: boolean;
    planYear?: MedicarePlanYear;
  }): IExtraHelpMspEligibility {
    const planYear = params.planYear ?? DEFAULT_MEDICARE_PLAN_YEAR;
    const maritalStatus = params.maritalStatus ?? 'individual';
    const safeAnnualIncome = Number.isFinite(params.annualIncomeUsd) ? Math.max(0, params.annualIncomeUsd) : 0;
    const monthlyIncomeUsd = Number((safeAnnualIncome / 12).toFixed(2));
    const resources = params.countableResourcesUsd ?? null;

    const householdSize = maritalStatus === 'married' ? 2 : 1;
    const fplBase = HHS_2026_FPL_BASE_USD + (householdSize - 1) * HHS_2026_FPL_INCREMENT_USD;
    const fplPercentage = Number(((safeAnnualIncome / fplBase) * 100).toFixed(1));

    // 2026 Federal MSP Monthly Income & Resource Floors (includes $20 general disregard)
    const qmbIncomeLimit = maritalStatus === 'married' ? 1824 : 1350;
    const slmbIncomeLimit = maritalStatus === 'married' ? 2184 : 1616;
    const qiIncomeLimit = maritalStatus === 'married' ? 2455 : 1816;
    const qdwiIncomeLimit = maritalStatus === 'married' ? 7299 : 5405;
    const mspResourceLimit = maritalStatus === 'married' ? 14910 : 9950;
    const qdwiResourceLimit = maritalStatus === 'married' ? 6000 : 4000;

    // 2026 Extra Help (LIS) Limits (150% FPL + $20 disregard; resource limit includes burial allowance)
    const lisAnnualIncomeLimit = maritalStatus === 'married' ? 32460 : 23940;
    const lisResourceLimit = maritalStatus === 'married' ? 36100 : 18090;

    const withinMspResources = resources === null || resources <= mspResourceLimit;
    const withinQdwiResources = resources === null || resources <= qdwiResourceLimit;
    const withinLisResources = resources === null || resources <= lisResourceLimit;

    let mspTier: MspProgramTier = 'NONE';
    if (monthlyIncomeUsd <= qmbIncomeLimit && withinMspResources) {
      mspTier = 'QMB';
    } else if (monthlyIncomeUsd <= slmbIncomeLimit && withinMspResources) {
      mspTier = 'SLMB';
    } else if (monthlyIncomeUsd <= qiIncomeLimit && withinMspResources) {
      mspTier = 'QI';
    } else if (params.isWorkingDisabledUnder65 && monthlyIncomeUsd <= qdwiIncomeLimit && withinQdwiResources) {
      mspTier = 'QDWI';
    }

    const extraHelpAutoQualified = Boolean(
      params.hasFullMedicaid || params.hasSsi || mspTier === 'QMB' || mspTier === 'SLMB' || mspTier === 'QI'
    );
    const extraHelpEligible = extraHelpAutoQualified || (safeAnnualIncome <= lisAnnualIncomeLimit && withinLisResources);
    const qmbBalanceBillingProtected = mspTier === 'QMB';

    const statutoryProtectionCitation = qmbBalanceBillingProtected
      ? '42 U.S.C. § 1396a(n)(3)(B) & 42 U.S.C. § 1395w-4(g)(3)(A) (Federal Prohibition on QMB Balance Billing)'
      : '42 U.S.C. § 1395w-114 (Medicare Part D Low-Income Subsidy / Extra Help)';

    let guidanceSummary = '';
    if (qmbBalanceBillingProtected) {
      guidanceSummary =
        `Likely eligible for QMB (Qualified Medicare Beneficiary) + Automatic Part D Extra Help (LIS). ` +
        `State Medicaid covers Part A/B premiums, deductibles, and coinsurance; federal law prohibits Medicare providers from balance-billing QMB patients. ` +
        `Part D copays cap at $5.10 generic / $12.65 brand ($0 deductible).`;
    } else if (mspTier === 'SLMB' || mspTier === 'QI') {
      guidanceSummary =
        `Likely eligible for ${mspTier} (pays Medicare Part B monthly premium) + Automatic Part D Extra Help (LIS: $0 deductible, max $5.10 generic / $12.65 brand). Apply via state Medicaid agency.`;
    } else if (mspTier === 'QDWI') {
      guidanceSummary =
        `Likely eligible for QDWI (covers Medicare Part A premiums for working disabled individuals under 65). Apply via state Medicaid agency.`;
    } else if (extraHelpEligible) {
      guidanceSummary =
        `Likely eligible for 2026 Medicare Part D Extra Help (LIS) via SSA.gov/extrahelp: $0 benchmark Part D premium, $0 deductible, copays capped at $5.10 generic / $12.65 brand.`;
    } else {
      guidanceSummary =
        `Above federal baseline Extra Help / MSP income or resource floors (${fplPercentage}% FPL). Note: several states waive asset tests or raise MSP income limits—verify state Medicaid rules and use the ${planYear} IRA $${this.getPartDCapForYear(planYear).toLocaleString('en-US')} Part D cap + M3P.`;
    }

    return {
      planYear,
      maritalStatus,
      monthlyIncomeUsd,
      countableResourcesUsd: resources,
      fplPercentage,
      extraHelpEligible,
      extraHelpAutoQualified,
      extraHelpGenericCopayCapUsd: 5.10,
      extraHelpBrandCopayCapUsd: 12.65,
      mspTier,
      qmbBalanceBillingProtected,
      statutoryProtectionCitation,
      guidanceSummary
    };
  }

  /**
   * Evaluates CMS Advanced Primary Care Management (APCM: G0556, G0557, G0558),
   * Visit Complexity Add-On (G2211), SDOH Risk Assessment (G0136), and
   * Medicaid Section 1115 Health-Related Social Needs (HRSN) ICD-10 Z-codes (Z55–Z65).
   */
  public evaluateApcmAndSafetyNetBilling(params: {
    chronicConditionCount: number;
    isQmbEnrolled: boolean;
    isLongitudinalFocalCare?: boolean;
    hasModifier25OnBaseEm?: boolean;
    isPreventiveModifier25Exception?: boolean;
    billingCcmThisMonth?: boolean;
    socialNeeds?: HrsnSocialNeedKey[];
  }): IApcmAndSafetyNetAssessment {
    const conditions = Math.max(0, Math.floor(params.chronicConditionCount || 0));
    const isLongitudinal = params.isLongitudinalFocalCare ?? true;
    const mod25Blocked = Boolean(params.hasModifier25OnBaseEm) && !Boolean(params.isPreventiveModifier25Exception);
    const ccmConflict = Boolean(params.billingCcmThisMonth);
    const socialNeeds = params.socialNeeds ?? [];

    const g0556: IApcmAndG2211Code = {
      hcpcsCode: 'G0556',
      title: 'APCM Level 1 (Low Complexity, Non-Time-Based)',
      tierOrScope: '0–1 chronic condition; monthly longitudinal care bundle (FQHC/RHC eligible)',
      isEligible: conditions <= 1 && !ccmConflict,
      estReimbursementUsd: 16.37,
      patientCostSharingUsd: 3.27,
      fqhcRhcEligible: true,
      billingGuardNote: ccmConflict
        ? 'Blocked: APCM cannot be billed in the same calendar month as CCM (99490), PCM, or TCM.'
        : 'Requires 13 CMS APCM core capabilities (24/7 access, continuity, care plan). No minute logging.'
    };

    const g0557: IApcmAndG2211Code = {
      hcpcsCode: 'G0557',
      title: 'APCM Level 2 (Moderate/High Complexity, Non-Time-Based)',
      tierOrScope: '2+ qualifying chronic conditions (non-QMB); monthly bundle (FQHC/RHC eligible)',
      isEligible: conditions >= 2 && !params.isQmbEnrolled && !ccmConflict,
      estReimbursementUsd: 53.77,
      patientCostSharingUsd: 10.75,
      fqhcRhcEligible: true,
      billingGuardNote: ccmConflict
        ? 'Blocked: Mutually exclusive with same-month CCM/PCM/TCM.'
        : 'Eliminates 20-minute CCM timer burden while supporting longitudinal care management.'
    };

    const g0558: IApcmAndG2211Code = {
      hcpcsCode: 'G0558',
      title: 'APCM Level 3 (QMB Dual-Eligible High Complexity)',
      tierOrScope: '2+ qualifying chronic conditions + QMB Medicaid status; $0 patient cost-sharing',
      isEligible: conditions >= 2 && params.isQmbEnrolled && !ccmConflict,
      estReimbursementUsd: 117.23,
      patientCostSharingUsd: 0,
      fqhcRhcEligible: true,
      billingGuardNote: ccmConflict
        ? 'Blocked: Mutually exclusive with same-month CCM/PCM/TCM.'
        : 'Highest safety-net sustainability rate (~$117.23/mo) with $0 QMB patient copay/deductible.'
    };

    const g2211: IApcmAndG2211Code = {
      hcpcsCode: 'G2211',
      title: 'Visit Complexity Add-On (Longitudinal Focal Care)',
      tierOrScope: 'Attachable to office/outpatient (99202–99215) or home E/M (99341–99350)',
      isEligible: isLongitudinal && !mod25Blocked,
      estReimbursementUsd: 16.37,
      patientCostSharingUsd: params.isQmbEnrolled ? 0 : 3.27,
      fqhcRhcEligible: false,
      billingGuardNote: mod25Blocked
        ? 'Blocked by Modifier 25 on same-day E/M unless paired with CMS-exempt preventive service (e.g. AWV/immunization).'
        : 'No time threshold or annual cap; documents ongoing clinician-patient focal-point relationship.'
    };

    const g0136: IApcmAndG2211Code = {
      hcpcsCode: 'G0136',
      title: 'SDOH Risk Assessment (5–15 Min Standardized Screen)',
      tierOrScope: 'Pairs with ICD-10 Z55–Z65 social-needs documentation and Section 1115 referrals',
      isEligible: socialNeeds.length > 0,
      estReimbursementUsd: 18.65,
      patientCostSharingUsd: params.isQmbEnrolled ? 0 : 0, // $0 when paired with AWV
      fqhcRhcEligible: true,
      billingGuardNote: socialNeeds.length > 0
        ? `Documented ${socialNeeds.length} HRSN Z-code domain(s); eligible for Medicare G0136 & Medicaid Section 1115 closed-loop referral.`
        : 'Perform standardized SDOH screen (PRAPARE / AHC-HRSN) to capture Z55–Z65 codes.'
    };

    const recommendedApcmCode = [g0558, g0557, g0556].find(c => c.isEligible) ?? null;
    const allEvaluatedCodes = [g0558, g0557, g0556, g2211, g0136];
    const hrsnZCodes = socialNeeds
      .map(key => HRSN_ZCODE_CATALOG[key])
      .filter((entry): entry is IHrsnZCodeMapping => Boolean(entry));

    const estimatedMonthlyClinicRevenueUsd = Number(
      (
        (recommendedApcmCode?.estReimbursementUsd ?? 0) +
        (g2211.isEligible ? g2211.estReimbursementUsd : 0) +
        (g0136.isEligible ? g0136.estReimbursementUsd : 0)
      ).toFixed(2)
    );

    const ccmExclusivityNote = ccmConflict
      ? 'CMS Rule: Traditional CCM (99490) is active this month; suppress APCM (G0556–G0558) until next calendar month to prevent duplicate-care-management claim denial.'
      : recommendedApcmCode
        ? `Recommended ${recommendedApcmCode.hcpcsCode} ($${recommendedApcmCode.estReimbursementUsd.toFixed(2)}/mo) replaces minute-counted CCM (99490) for cleaner FQHC/RHC & primary-care reimbursement.`
        : 'No APCM tier active.';

    return {
      recommendedApcmCode,
      g2211AddOn: g2211,
      sdohAssessmentG0136: g0136,
      allEvaluatedCodes,
      ccmExclusivityConflict: ccmConflict,
      ccmExclusivityNote,
      estimatedMonthlyClinicRevenueUsd,
      hrsnZCodes
    };
  }

  /**
   * Evaluates Remote Patient Monitoring (RPM) & Chronic Care Management (CCM) CPT billing compliance.
   */
  public evaluateRpmCompliance(daysDeviceTransmitted: number, clinicalMinutesLogged: number): IRpmBillingCode[] {
    return [
      {
        cptCode: 'CPT 99453',
        description: 'RPM Initial Setup & Patient Education',
        requirement: 'Initial setup of medical device with initial 16+ days reading',
        isCompliant: daysDeviceTransmitted >= 16,
        estReimbursementUsd: 19.00
      },
      {
        cptCode: 'CPT 99454',
        description: 'RPM Monthly Device Transmission',
        requirement: 'Transmission of 16 or more days of physiological readings per 30-day period',
        isCompliant: daysDeviceTransmitted >= 16,
        estReimbursementUsd: 50.00
      },
      {
        cptCode: 'CPT 99457',
        description: 'RPM Clinical Management (First 20 Mins)',
        requirement: '20 minutes or more of clinical staff time with interactive patient communication',
        isCompliant: clinicalMinutesLogged >= 20,
        estReimbursementUsd: 48.00
      },
      {
        cptCode: 'CPT 99490',
        description: 'Chronic Care Management (CCM 20 Mins)',
        requirement: '20+ minutes of non-face-to-face care management for 2+ chronic conditions',
        isCompliant: clinicalMinutesLogged >= 20,
        estReimbursementUsd: 62.00
      }
    ];
  }

  /**
   * Generates a No Surprises Act compliant Good Faith Estimate (GFE).
   */
  public generateGoodFaithEstimate(patientId: string, items: IGoodFaithEstimateItem[]): IGoodFaithEstimate {
    const total = items.reduce((sum, i) => sum + i.estimatedCost, 0);
    return {
      patientId,
      createdDate: new Date().toISOString().split('T')[0],
      items,
      totalEstimatedCost: total,
      disputeNoticeThreshold: total + 400 // $400 over GFE triggers patient dispute rights under NSA
    };
  }

  /**
   * Assesses IRS Section 501(r) Charity Care Policy eligibility based on 2026 HHS Federal Poverty Level (FPL).
   */
  public evaluateCharityCare(annualIncome: number, householdSize: number = 1): ICharityCareEligibility {
    const safeSize = Math.max(1, Math.floor(householdSize || 1));
    const baseFpl = HHS_2026_FPL_BASE_USD + (safeSize - 1) * HHS_2026_FPL_INCREMENT_USD;
    const fplPercentage = (annualIncome / baseFpl) * 100;

    const isEligibleFor100PercentDiscount = fplPercentage <= 200;
    const isEligibleForPartialDiscount = fplPercentage > 200 && fplPercentage <= 400;

    let directive = '';
    if (isEligibleFor100PercentDiscount) {
      directive = `Income is ${fplPercentage.toFixed(0)}% of 2026 FPL (<=200%). Eligible for 100% Charity Care discount under IRS Section 501(r).`;
    } else if (isEligibleForPartialDiscount) {
      directive = `Income is ${fplPercentage.toFixed(0)}% of 2026 FPL (200%-400%). Eligible for partial sliding-scale Financial Assistance Policy (FAP).`;
    } else {
      directive = `Income is ${fplPercentage.toFixed(0)}% of 2026 FPL (>400%). Standard insurance/prompt-pay discounts apply.`;
    }

    return {
      fplPercentage,
      isEligibleFor100PercentDiscount,
      isEligibleForPartialDiscount,
      irs501rPolicyDirective: directive
    };
  }

  /**
   * Synthesizes full Medicare & Safety-Net Billing / Financial Navigation Assessment.
   */
  public assessMedicareBilling(params: {
    annualRxCost: number;
    daysDeviceTransmitted: number;
    clinicalMinutesLogged: number;
    annualIncome: number;
    householdSize?: number;
    planYear?: MedicarePlanYear;
    remainingMonths?: number;
    maritalStatus?: 'individual' | 'married';
    countableResourcesUsd?: number | null;
    hasFullMedicaid?: boolean;
    hasSsi?: boolean;
    chronicConditionCount?: number;
    isQmbEnrolled?: boolean;
    isLongitudinalFocalCare?: boolean;
    hasModifier25OnBaseEm?: boolean;
    billingCcmThisMonth?: boolean;
    socialNeeds?: HrsnSocialNeedKey[];
    gfeItems?: IGoodFaithEstimateItem[];
  }): IMedicareBillingAssessment {
    const planYear = params.planYear ?? DEFAULT_MEDICARE_PLAN_YEAR;
    const mppp = this.calculateMpppSmoothing(params.annualRxCost, params.remainingMonths ?? 12, planYear);
    const extraHelpMsp = this.evaluateExtraHelpAndMsp({
      annualIncomeUsd: params.annualIncome,
      maritalStatus: params.maritalStatus ?? ((params.householdSize ?? 1) >= 2 ? 'married' : 'individual'),
      countableResourcesUsd: params.countableResourcesUsd ?? null,
      hasFullMedicaid: params.hasFullMedicaid,
      hasSsi: params.hasSsi,
      planYear
    });
    const effectiveQmb = params.isQmbEnrolled ?? extraHelpMsp.qmbBalanceBillingProtected;
    const apcmSafetyNet = this.evaluateApcmAndSafetyNetBilling({
      chronicConditionCount: params.chronicConditionCount ?? 2,
      isQmbEnrolled: effectiveQmb,
      isLongitudinalFocalCare: params.isLongitudinalFocalCare ?? true,
      hasModifier25OnBaseEm: params.hasModifier25OnBaseEm ?? false,
      billingCcmThisMonth: params.billingCcmThisMonth ?? false,
      socialNeeds: params.socialNeeds ?? []
    });
    const rpm = this.evaluateRpmCompliance(params.daysDeviceTransmitted, params.clinicalMinutesLogged);
    const gfe = this.generateGoodFaithEstimate('P-101', params.gfeItems || [
      { cptCode: 'CPT 99214', description: 'Established Patient Office Visit', estimatedCost: 140 },
      { cptCode: 'CPT 99454', description: 'RPM Monthly Device Transmission', estimatedCost: 50 }
    ]);
    const charity = this.evaluateCharityCare(params.annualIncome, params.householdSize || 1);

    const directives: string[] = [
      mppp.savingsDescription,
      extraHelpMsp.guidanceSummary,
      apcmSafetyNet.ccmExclusivityNote,
      charity.irs501rPolicyDirective
    ];

    const compliantRpmCodes = rpm.filter(r => r.isCompliant).map(r => r.cptCode);
    if (compliantRpmCodes.length > 0) {
      directives.push(`Compliant RPM CPT Billing Codes: ${compliantRpmCodes.join(', ')}.`);
    } else {
      directives.push(`⚠️ RPM Non-Compliant: Minimum 16 transmission days & 20 clinical minutes required.`);
    }

    return {
      mppp,
      extraHelpMsp,
      apcmSafetyNet,
      rpmBillingCodes: rpm,
      gfe,
      charityCare: charity,
      actionableDirectives: directives
    };
  }
}
