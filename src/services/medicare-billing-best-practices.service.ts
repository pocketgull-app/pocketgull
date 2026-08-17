import { Injectable, signal, computed } from '@angular/core';

export interface IMpppOption {
  annualOutofPocket: number;
  isCapped: boolean; // capped at $2,000 under Inflation Reduction Act
  effectiveCapAmount: number;
  monthlyMpppPayment: number; // annualOutofPocket / remainingMonths
  savingsDescription: string;
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
  fplPercentage: number; // e.g. 175%
  isEligibleFor100PercentDiscount: boolean; // <200% FPL
  isEligibleForPartialDiscount: boolean;    // 200-400% FPL
  irs501rPolicyDirective: string;
}

export interface IMedicareBillingAssessment {
  mppp: IMpppOption;
  rpmBillingCodes: IRpmBillingCode[];
  gfe: IGoodFaithEstimate;
  charityCare: ICharityCareEligibility;
  actionableDirectives: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MedicareBillingBestPracticesService {

  /**
   * Calculates Medicare Part D Inflation Reduction Act $2,000 Out-of-Pocket Cap
   * & Medicare Prescription Payment Plan (MPPP) monthly smoothing.
   */
  public calculateMpppSmoothing(annualRxCost: number, remainingMonths: number = 12): IMpppOption {
    const IRA_PART_D_CAP = 2000;
    const isCapped = annualRxCost > IRA_PART_D_CAP;
    const effectiveCost = Math.min(annualRxCost, IRA_PART_D_CAP);
    const months = Math.max(1, Math.min(12, remainingMonths));
    const monthlyPayment = effectiveCost / months;

    return {
      annualOutofPocket: annualRxCost,
      isCapped,
      effectiveCapAmount: effectiveCost,
      monthlyMpppPayment: monthlyPayment,
      savingsDescription: isCapped
        ? `Protected by Inflation Reduction Act \$2,000 cap. You save \$${(annualRxCost - IRA_PART_D_CAP).toFixed(2)}/yr. Optional MPPP spreads cost into \$${monthlyPayment.toFixed(2)}/mo interest-free payments.`
        : `Total Rx out-of-pocket is \$${annualRxCost.toFixed(2)} (under \$2,000 cap). MPPP monthly option: \$${monthlyPayment.toFixed(2)}/mo.`
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
   * Assesses IRS Section 501(r) Charity Care Policy eligibility based on Federal Poverty Level (FPL).
   */
  public evaluateCharityCare(annualIncome: number, householdSize: number = 1): ICharityCareEligibility {
    // 2026 Baseline FPL ~ $15,060 for 1 person + $5,380 per additional member
    const baseFpl = 15060 + (householdSize - 1) * 5380;
    const fplPercentage = (annualIncome / baseFpl) * 100;

    const isEligibleFor100PercentDiscount = fplPercentage <= 200;
    const isEligibleForPartialDiscount = fplPercentage > 200 && fplPercentage <= 400;

    let directive = '';
    if (isEligibleFor100PercentDiscount) {
      directive = `Income is ${fplPercentage.toFixed(0)}% FPL (<=200%). Eligible for 100% Charity Care discount under IRS Section 501(r).`;
    } else if (isEligibleForPartialDiscount) {
      directive = `Income is ${fplPercentage.toFixed(0)}% FPL (200%-400%). Eligible for partial sliding-scale Financial Assistance Policy (FAP).`;
    } else {
      directive = `Income is ${fplPercentage.toFixed(0)}% FPL (>400%). Standard insurance/prompt-pay discounts apply.`;
    }

    return {
      fplPercentage,
      isEligibleFor100PercentDiscount,
      isEligibleForPartialDiscount,
      irs501rPolicyDirective: directive
    };
  }

  /**
   * Synthesizes full Medicare Billing & Financial Navigation Assessment.
   */
  public assessMedicareBilling(params: {
    annualRxCost: number;
    daysDeviceTransmitted: number;
    clinicalMinutesLogged: number;
    annualIncome: number;
    householdSize?: number;
    gfeItems?: IGoodFaithEstimateItem[];
  }): IMedicareBillingAssessment {
    const mppp = this.calculateMpppSmoothing(params.annualRxCost);
    const rpm = this.evaluateRpmCompliance(params.daysDeviceTransmitted, params.clinicalMinutesLogged);
    const gfe = this.generateGoodFaithEstimate('P-101', params.gfeItems || [
      { cptCode: 'CPT 99214', description: 'Established Patient Office Visit', estimatedCost: 140 },
      { cptCode: 'CPT 99454', description: 'RPM Monthly Device Transmission', estimatedCost: 50 }
    ]);
    const charity = this.evaluateCharityCare(params.annualIncome, params.householdSize || 1);

    const directives: string[] = [
      mppp.savingsDescription,
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
      rpmBillingCodes: rpm,
      gfe,
      charityCare: charity,
      actionableDirectives: directives
    };
  }
}
