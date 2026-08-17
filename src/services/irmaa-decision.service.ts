import { Injectable, signal, computed } from '@angular/core';

export type TaxFilingStatus = 'single' | 'joint' | 'separate';

export interface IIrmaaTier {
  tier: number;
  label: string;
  magiMin: number;
  magiMax: number;
  partBSurchargeMonthly: number;
  partDSurchargeMonthly: number;
  totalMonthlySurcharge: number;
  totalAnnualSurcharge: number;
}

export type LifeChangingEvent = 
  | 'WORK_STOPPAGE'
  | 'WORK_REDUCTION'
  | 'DEATH_OF_SPOUSE'
  | 'MARRIAGE'
  | 'DIVORCE_OR_ANNULMENT'
  | 'INCOME_PROPERTY_LOSS'
  | 'PENSION_PORTFOLIO_LOSS'
  | 'EMPLOYER_SETTLEMENT';

export interface ISsa44AppealResult {
  isEligible: boolean;
  qualifyingEvents: LifeChangingEvent[];
  estimatedAnnualSavings: number;
  recommendationDirective: string;
  requiredDocuments: string[];
}

export interface IIrmaaAnalysisResult {
  filingStatus: TaxFilingStatus;
  magi: number;
  currentTier: IIrmaaTier;
  nextTier: IIrmaaTier | null;
  cliffBufferDistance: number;
  annualSurcharge: number;
  appealAssessment: ISsa44AppealResult;
  clinicalFinancialDirectives: string[];
}

/** 2026/2024 IRS Medicare IRMAA Surcharge Brackets */
const SINGLE_TIERS: IIrmaaTier[] = [
  { tier: 0, label: 'Standard (No IRMAA)', magiMin: 0, magiMax: 106000, partBSurchargeMonthly: 0, partDSurchargeMonthly: 0, totalMonthlySurcharge: 0, totalAnnualSurcharge: 0 },
  { tier: 1, label: 'Tier 1 Surcharge', magiMin: 106000, magiMax: 133000, partBSurchargeMonthly: 70.00, partDSurchargeMonthly: 13.70, totalMonthlySurcharge: 83.70, totalAnnualSurcharge: 1004.40 },
  { tier: 2, label: 'Tier 2 Surcharge', magiMin: 133000, magiMax: 167000, partBSurchargeMonthly: 175.00, partDSurchargeMonthly: 35.30, totalMonthlySurcharge: 210.30, totalAnnualSurcharge: 2523.60 },
  { tier: 3, label: 'Tier 3 Surcharge', magiMin: 167000, magiMax: 200000, partBSurchargeMonthly: 280.00, partDSurchargeMonthly: 56.90, totalMonthlySurcharge: 336.90, totalAnnualSurcharge: 4042.80 },
  { tier: 4, label: 'Tier 4 Surcharge', magiMin: 200000, magiMax: 500000, partBSurchargeMonthly: 385.00, partDSurchargeMonthly: 78.50, totalMonthlySurcharge: 463.50, totalAnnualSurcharge: 5562.00 },
  { tier: 5, label: 'Tier 5 (Maximum)', magiMin: 500000, magiMax: Infinity, partBSurchargeMonthly: 419.90, partDSurchargeMonthly: 85.80, totalMonthlySurcharge: 505.70, totalAnnualSurcharge: 6068.40 }
];

const JOINT_TIERS: IIrmaaTier[] = [
  { tier: 0, label: 'Standard (No IRMAA)', magiMin: 0, magiMax: 212000, partBSurchargeMonthly: 0, partDSurchargeMonthly: 0, totalMonthlySurcharge: 0, totalAnnualSurcharge: 0 },
  { tier: 1, label: 'Tier 1 Surcharge', magiMin: 212000, magiMax: 266000, partBSurchargeMonthly: 70.00, partDSurchargeMonthly: 13.70, totalMonthlySurcharge: 83.70, totalAnnualSurcharge: 1004.40 },
  { tier: 2, label: 'Tier 2 Surcharge', magiMin: 266000, magiMax: 334000, partBSurchargeMonthly: 175.00, partDSurchargeMonthly: 35.30, totalMonthlySurcharge: 210.30, totalAnnualSurcharge: 2523.60 },
  { tier: 3, label: 'Tier 3 Surcharge', magiMin: 334000, magiMax: 400000, partBSurchargeMonthly: 280.00, partDSurchargeMonthly: 56.90, totalMonthlySurcharge: 336.90, totalAnnualSurcharge: 4042.80 },
  { tier: 4, label: 'Tier 4 Surcharge', magiMin: 400000, magiMax: 750000, partBSurchargeMonthly: 385.00, partDSurchargeMonthly: 78.50, totalMonthlySurcharge: 463.50, totalAnnualSurcharge: 5562.00 },
  { tier: 5, label: 'Tier 5 (Maximum)', magiMin: 750000, magiMax: Infinity, partBSurchargeMonthly: 419.90, partDSurchargeMonthly: 85.80, totalMonthlySurcharge: 505.70, totalAnnualSurcharge: 6068.40 }
];

@Injectable({
  providedIn: 'root'
})
export class IrmaaDecisionService {
  /** User MAGI input signal */
  public magi = signal<number>(125000);
  
  /** Tax Filing Status signal */
  public filingStatus = signal<TaxFilingStatus>('single');

  /** Selected Life-Changing Events signal for Form SSA-44 */
  public activeEvents = signal<LifeChangingEvent[]>(['WORK_REDUCTION']);

  /** Reactive IRMAA Analysis Output */
  public analysis = computed<IIrmaaAnalysisResult>(() => {
    const status = this.filingStatus();
    const magiValue = Math.max(0, this.magi());
    const events = this.activeEvents();

    const tiers = status === 'joint' ? JOINT_TIERS : SINGLE_TIERS;
    let currentTierIndex = 0;

    for (let i = 0; i < tiers.length; i++) {
      if (magiValue >= tiers[i].magiMin && (magiValue < tiers[i].magiMax || tiers[i].magiMax === Infinity)) {
        currentTierIndex = i;
        break;
      }
    }

    const currentTier = tiers[currentTierIndex];
    const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
    const cliffBufferDistance = nextTier ? nextTier.magiMin - magiValue : Infinity;

    // SSA-44 Appeal Evaluation
    const isEligible = events.length > 0 && currentTier.tier > 0;
    const estimatedAnnualSavings = isEligible ? currentTier.totalAnnualSurcharge : 0;

    const requiredDocs: string[] = [];
    if (events.includes('WORK_STOPPAGE') || events.includes('WORK_REDUCTION')) {
      requiredDocs.push('Employer Statement or Pay Stub showing income reduction date');
    }
    if (events.includes('DEATH_OF_SPOUSE')) {
      requiredDocs.push('Certified Death Certificate');
    }
    if (events.includes('MARRIAGE') || events.includes('DIVORCE_OR_ANNULMENT')) {
      requiredDocs.push('Marriage / Divorce Decree Certificate');
    }
    if (events.includes('INCOME_PROPERTY_LOSS') || events.includes('PENSION_PORTFOLIO_LOSS')) {
      requiredDocs.push('Insurance Claim or Financial Statement of Loss');
    }

    const appealAssessment: ISsa44AppealResult = {
      isEligible,
      qualifyingEvents: events,
      estimatedAnnualSavings,
      recommendationDirective: isEligible
        ? `Submit Social Security Form SSA-44 with current year MAGI estimate. Potential savings: $${estimatedAnnualSavings.toFixed(2)}/yr.`
        : `No active Life-Changing Event or current MAGI is below IRMAA Tier 1 threshold ($${tiers[1].magiMin.toLocaleString()}).`,
      requiredDocuments: requiredDocs
    };

    // Clinical & Financial Directives
    const directives: string[] = [];
    if (cliffBufferDistance > 0 && cliffBufferDistance <= 5000 && nextTier) {
      directives.push(`⚠️ TAX CLIFF ALERT: You are within $${cliffBufferDistance.toLocaleString()} of Tier ${nextTier.tier} (+$${(nextTier.totalAnnualSurcharge - currentTier.totalAnnualSurcharge).toFixed(2)}/yr surcharge). Consider HSA/401(k) deductions or tax-loss harvesting.`);
    }

    if (currentTier.tier > 0) {
      directives.push(`Medicare Part B surcharge: +$${currentTier.partBSurchargeMonthly.toFixed(2)}/mo | Part D surcharge: +$${currentTier.partDSurchargeMonthly.toFixed(2)}/mo.`);
      directives.push(`Optimize Part D formulary choices & check Patient Assistance Programs (PAPs) for biologic therapies.`);
    } else {
      directives.push(`✅ Standard Medicare Rate: Your MAGI ($${magiValue.toLocaleString()}) is below the Tier 1 IRMAA threshold.`);
    }

    return {
      filingStatus: status,
      magi: magiValue,
      currentTier,
      nextTier,
      cliffBufferDistance,
      annualSurcharge: currentTier.totalAnnualSurcharge,
      appealAssessment,
      clinicalFinancialDirectives: directives
    };
  });

  /**
   * Directly evaluates IRMAA surcharges for arbitrary parameters.
   */
  public evaluateIrmaa(magi: number, status: TaxFilingStatus = 'single', events: LifeChangingEvent[] = []): IIrmaaAnalysisResult {
    const originalMagi = this.magi();
    const originalStatus = this.filingStatus();
    const originalEvents = this.activeEvents();

    this.magi.set(magi);
    this.filingStatus.set(status);
    this.activeEvents.set(events);

    const res = this.analysis();

    this.magi.set(originalMagi);
    this.filingStatus.set(originalStatus);
    this.activeEvents.set(originalEvents);

    return res;
  }
}
