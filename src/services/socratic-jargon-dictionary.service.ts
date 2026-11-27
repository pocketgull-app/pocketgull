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
      shortLabel: 'Medicare Indexed Part D Cap ($2,100 in 2026) & Monthly Spreading',
      category: 'FINANCIAL',
      plainEnglishDefinition: 'A federal law that caps your annual Part D out-of-pocket prescription costs ($2,100 in 2026; $2,400 in 2027) and lets you spread payments into smooth, interest-free monthly bills (~$175/mo in 2026).',
      technicalDetails: 'Medicare Prescription Payment Plan (M3P) under the Inflation Reduction Act, indexed annually by CMS ($2,000 in 2025 → $2,100 in 2026 → $2,400 in 2027).',
      actionableAdvice: 'Opt into M3P through your Part D plan to avoid large January pharmacy bills, and check if you qualify for Extra Help (LIS) for $0 deductible.'
    },
    'QMB': {
      term: 'QMB',
      shortLabel: 'Qualified Medicare Beneficiary (Balance-Billing Shield)',
      category: 'FINANCIAL',
      plainEnglishDefinition: 'A state Medicaid program for lower-income Medicare enrollees that pays Part A/B premiums, deductibles, and copays—and makes it illegal for Medicare doctors to bill you for them.',
      technicalDetails: 'Federal Medicare Savings Program tier (~100% FPL + $20 disregard) protected under 42 U.S.C. § 1396a(n)(3)(B) & 42 U.S.C. § 1395w-4(g)(3)(A).',
      actionableAdvice: 'If you have QMB and receive a Medicare copay or deductible bill, do not pay it—show your QMB card or send a Federal QMB Balance-Billing Protection Notice.'
    },
    'LIS': {
      term: 'LIS',
      shortLabel: 'Medicare Part D Extra Help (Low-Income Subsidy)',
      category: 'FINANCIAL',
      plainEnglishDefinition: 'A Social Security program that lowers Medicare drug costs to $0 deductible and small copays (max $5.10 generic / $12.65 brand in 2026).',
      technicalDetails: '2026 federal limits up to 150% FPL ($23,940 individual / $32,460 married) and countable resources up to $18,090 / $36,100; automatic with Medicaid, MSP, or SSI.',
      actionableAdvice: 'Apply at SSA.gov/extrahelp—or check if Medicaid/QMB enrollment already auto-qualified you.'
    },
    'APCM': {
      term: 'APCM',
      shortLabel: 'Advanced Primary Care Management (G0556–G0558)',
      category: 'FINANCIAL',
      plainEnglishDefinition: 'A monthly Medicare care-coordination benefit that pays primary care clinics, Rural Health Clinics, and FQHCs to support you 24/7 without counting every phone-call minute.',
      technicalDetails: 'CMS HCPCS G0556 (Level 1), G0557 (Level 2: 2+ chronic conditions), and G0558 (Level 3: 2+ chronic conditions + QMB dual-eligible, ~$117.23/mo, $0 patient cost-sharing).',
      actionableAdvice: 'Cannot be billed in the same calendar month as traditional CCM (99490). QMB patients pay $0 out of pocket under G0558.'
    },
    'G2211': {
      term: 'G2211',
      shortLabel: 'Medicare Longitudinal Care Complexity Add-On',
      category: 'FINANCIAL',
      plainEnglishDefinition: 'A Medicare add-on payment recognizing doctors who serve as your ongoing, long-term primary care home or manage a serious chronic condition over time.',
      technicalDetails: 'CMS HCPCS G2211 (~$16.37) paired with office/outpatient (99202–99215) or home E/M (99341–99350); restricted with Modifier 25 except CMS-exempt preventive visits.',
      actionableAdvice: 'Helps independent clinics and safety-net providers stay financially viable while spending deeper cognitive time on complex care.'
    },
    'BLUE_BUTTON': {
      term: 'BLUE_BUTTON',
      shortLabel: 'CMS Blue Button 2.0 (Medicare FHIR History)',
      category: 'INTEROPERABILITY',
      plainEnglishDefinition: 'Medicare\'s official secure connection that lets you pull your prescription and doctor-visit history into PocketGull in one click with zero manual typing.',
      technicalDetails: 'CMS Blue Button 2.0 v2 OAuth2 PKCE (S256) + HL7 FHIR R4 ExplanationOfBenefit & Coverage API.',
      actionableAdvice: 'Use Blue Button 2.0 to import your Part D medications automatically for safety checks and annual out-of-pocket cap tracking.'
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
