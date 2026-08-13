import { Injectable } from '@angular/core';

export interface IJargonDefinition {
  term: string;
  shortLabel: string;
  category: 'FINANCIAL' | 'CLINICAL' | 'BIOMARKER' | 'EASTERN' | 'INTEROPERABILITY';
  plainEnglishDefinition: string;
  technicalDetails: string;
  actionableAdvice: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocraticJargonDictionaryService {

  private dictionary: Record<string, IJargonDefinition> = {
    'IRMAA': {
      term: 'IRMAA',
      shortLabel: 'Medicare High-Income Surcharge',
      category: 'FINANCIAL',
      plainEnglishDefinition: 'An extra monthly fee added to Medicare Part B and Part D for individuals or couples with higher income (MAGI > $106k single / $212k joint).',
      technicalDetails: 'Income-Related Monthly Adjustment Amount evaluated on a 2-year lookback tax return.',
      actionableAdvice: 'If you recently retired, divorced, or reduced work hours, submit Social Security Form SSA-44 to appeal and remove the surcharge.'
    },
    'HEDIS': {
      term: 'HEDIS',
      shortLabel: 'Healthcare Quality Measure',
      category: 'FINANCIAL',
      plainEnglishDefinition: 'A standardized checklist used by health plans to ensure patients get essential screenings, blood pressure checks, and timely refills.',
      technicalDetails: 'Healthcare Effectiveness Data and Information Set. High scores (>=4.0 Stars) qualify Medicare Advantage plans for CMS Quality Bonus Payments.',
      actionableAdvice: 'Maintaining an 80%+ refill rate on daily preventive medications earns plan quality bonuses and reduces your out-of-pocket health risks.'
    },
    'PDC': {
      term: 'PDC',
      shortLabel: 'Medication Refill Rate',
      category: 'CLINICAL',
      plainEnglishDefinition: 'The percentage of days in a year that you have your prescribed medication in hand.',
      technicalDetails: 'Proportion of Days Covered = (Days Supply Refilled / 365) * 100.',
      actionableAdvice: 'Aim for at least 80% PDC (292+ days covered) to prevent disease progression and lower hospitalization odds.'
    },
    'CMS-0057-F': {
      term: 'CMS-0057-F',
      shortLabel: 'Instant Prior-Auth Mandate',
      category: 'INTEROPERABILITY',
      plainEnglishDefinition: 'A federal law requiring insurance companies to make prior-authorization decisions instantly (within milliseconds) using electronic health records.',
      technicalDetails: 'CMS Interoperability & Prior Authorization Final Rule deploying FHIR Da Vinci PAS standards.',
      actionableAdvice: 'Your doctor can get MRI and specialty drug approvals approved during your visit instead of waiting weeks.'
    },
    'MPPP': {
      term: 'MPPP',
      shortLabel: 'Medicare $2,000 Pharmacy Cap & Monthly Spreading',
      category: 'FINANCIAL',
      plainEnglishDefinition: 'A law that caps your annual out-of-pocket prescription costs at $2,000 and lets you pay it in 12 smooth monthly installments (~$167/mo).',
      technicalDetails: 'Medicare Prescription Payment Plan under the Inflation Reduction Act of 2022.',
      actionableAdvice: 'Opt into MPPP at your pharmacy to avoid big lump-sum drug payments in January.'
    },
    'DaTscan': {
      term: 'DaTscan',
      shortLabel: 'Dopamine Brain Scan',
      category: 'BIOMARKER',
      plainEnglishDefinition: 'A specialized brain scan that measures dopamine transporters to distinguish Parkinson\'s disease from other movement conditions.',
      technicalDetails: 'SPECT imaging using I-123 Ioflupane radiotracer (CPT 78607).',
      actionableAdvice: 'Helps confirm whether physical tremors are caused by dopamine loss or benign essential tremor.'
    },
    'SSA-44': {
      term: 'SSA-44',
      shortLabel: 'Medicare Surcharge Appeal Form',
      category: 'FINANCIAL',
      plainEnglishDefinition: 'An official Social Security form used to appeal Medicare surcharges when your income dropped due to retirement, marriage, or work reduction.',
      technicalDetails: 'Social Security Administration Form SSA-44: Medicare Income-Related Monthly Adjustment Amount Life-Changing Event Appeal.',
      actionableAdvice: 'Submit this form along with proof (e.g. retirement letter) to save $1,000–$6,000/year.'
    },
    'Kampavata': {
      term: 'Kampavata',
      shortLabel: 'Ayurvedic Tremor / Movement Profile',
      category: 'EASTERN',
      plainEnglishDefinition: 'An Ayurvedic term describing tremor and rigidity caused by Vata imbalance affecting nervous tissues.',
      technicalDetails: 'Vata imbalance in Majja Dhatu (nervous system substrate) presenting as Kampa (tremor) and Stambha (rigidity).',
      actionableAdvice: 'Managed using warm sesame oil self-massage (Abhyanga), Mucuna pruriens (natural levodopa), and grounding warm nutrition.'
    }
  };

  /**
   * Looks up a clinical/financial term in the dictionary.
   */
  public getDefinition(termKey: string): IJargonDefinition | null {
    if (!termKey) return null;
    const cleanKey = termKey.trim().toUpperCase();
    return this.dictionary[cleanKey] || this.dictionary[termKey] || null;
  }

  /**
   * Returns all registered jargon definitions.
   */
  public getAllDefinitions(): IJargonDefinition[] {
    return Object.values(this.dictionary);
  }
}
