import { Injectable } from '@angular/core';

export type ToxicityBurdenLevel = 'MINIMAL_BURDEN' | 'MODERATE_BURDEN' | 'HIGH_FINANCIAL_TOXICITY';

export interface IGenericParityAlternative {
  genericChemicalName: string;
  estimatedMonthlyCostUsd: number;
  savingsPercent: number;
  sourceChannel: 'MARK_CUBAN_COST_PLUS' | 'GENERIC_OTC' | 'FORMULARY_340B' | 'GOODRX_FAIR_PRICE';
  evidenceBioequivalence: string;
}

export interface IFinancialToxicityAudit {
  itemName: string;
  originalCostMonthlyUsd: number;
  toxicityBurden: ToxicityBurdenLevel;
  isAffiliateOrBranded: boolean;
  hasGenericEquivalent: boolean;
  genericAlternative: IGenericParityAlternative | null;
  assistanceProgramsAvailable: string[];
  clinicalVsCommercialDemarcationNote: string;
}

const GENERIC_EQUIVALENT_CATALOG: Record<string, IGenericParityAlternative> = {
  'magnesium l-threonate': {
    genericChemicalName: 'Magnesium Glycinate / Citrate USP',
    estimatedMonthlyCostUsd: 8.50,
    savingsPercent: 82,
    sourceChannel: 'GENERIC_OTC',
    evidenceBioequivalence: 'Elemental magnesium bioequivalence comparable for systemic neurological support and muscular relaxation at 1/5th the retail cost.'
  },
  'ubiquinol': {
    genericChemicalName: 'Ubiquinone USP (Coenzyme Q10)',
    estimatedMonthlyCostUsd: 14.00,
    savingsPercent: 74,
    sourceChannel: 'GENERIC_OTC',
    evidenceBioequivalence: 'Endogenous gastrointestinal conversion reduces ubiquinone to active ubiquinol with equivalent steady-state serum levels when taken with healthy fats.'
  },
  'advair': {
    genericChemicalName: 'Fluticasone / Salmeterol Generic DPI',
    estimatedMonthlyCostUsd: 32.00,
    savingsPercent: 88,
    sourceChannel: 'MARK_CUBAN_COST_PLUS',
    evidenceBioequivalence: 'FDA AB-rated therapeutically equivalent corticosteroid/LABA inhaler matching brand efficacy and pulmonary clearance.'
  },
  'flovent': {
    genericChemicalName: 'Fluticasone Propionate Inhalation Aerosol',
    estimatedMonthlyCostUsd: 28.00,
    savingsPercent: 85,
    sourceChannel: 'FORMULARY_340B',
    evidenceBioequivalence: 'Direct therapeutic equivalent with identical active pharmaceutical ingredient (API) and receptor affinity.'
  },
  'berberine': {
    genericChemicalName: 'Metformin HCl (Rx Generic) or Generic Berberine OTC',
    estimatedMonthlyCostUsd: 5.00,
    savingsPercent: 88,
    sourceChannel: 'MARK_CUBAN_COST_PLUS',
    evidenceBioequivalence: 'Standard-of-care generic AMPK activator with decades of replicated RCT survival endpoints at $4-$5/month.'
  },
  'cgm': {
    genericChemicalName: 'Upper-Arm Digital Glucometer + Bulk Test Strips',
    estimatedMonthlyCostUsd: 18.00,
    savingsPercent: 88,
    sourceChannel: 'GOODRX_FAIR_PRICE',
    evidenceBioequivalence: 'Measures capillary blood glucose with ISO 15197 accuracy standards for structured paired-meal monitoring.'
  }
};

@Injectable({
  providedIn: 'root'
})
export class FinancialToxicityGuardService {
  /**
   * Evaluates the financial toxicity and out-of-pocket burden of any recommended
   * supplement, device, or prescription medication.
   */
  evaluateFinancialToxicity(item: {
    name: string;
    monthlyCostUsd: number;
    isBrandedOrAffiliate?: boolean;
  }): IFinancialToxicityAudit {
    const cost = Math.max(0, item.monthlyCostUsd);
    const lowerName = item.name.toLowerCase();
    const isBranded = item.isBrandedOrAffiliate ?? false;

    // Determine toxicity tier based on monthly out-of-pocket threshold
    let toxicityBurden: ToxicityBurdenLevel = 'MINIMAL_BURDEN';
    if (cost > 50) {
      toxicityBurden = 'HIGH_FINANCIAL_TOXICITY';
    } else if (cost >= 20) {
      toxicityBurden = 'MODERATE_BURDEN';
    }

    // Find generic parity alternative
    let matchedAlternative: IGenericParityAlternative | null = null;
    for (const [key, alternative] of Object.entries(GENERIC_EQUIVALENT_CATALOG)) {
      if (lowerName.includes(key)) {
        matchedAlternative = alternative;
        break;
      }
    }

    // Identify assistance programs if cost is substantial
    const assistancePrograms: string[] = [];
    if (cost >= 35) {
      assistancePrograms.push('Mark Cuban Cost Plus Drug Company Fair Pricing Lookup');
      assistancePrograms.push('HRSA 340B Covered Entity Community Health Formulary');
      assistancePrograms.push('NeedyMeds / Patient Access Network (PAN) Foundation Copay Grants');
    }

    const clinicalVsCommercialDemarcationNote =
      'Clinical recommendations in Pocket-Gull are derived strictly from Cochrane-evaluated peer-reviewed clinical trials. Commercial affiliate links are strictly secondary supportive convenience options and must never obscure lower-cost generic equivalents.';

    return {
      itemName: item.name,
      originalCostMonthlyUsd: cost,
      toxicityBurden,
      isAffiliateOrBranded: isBranded,
      hasGenericEquivalent: matchedAlternative !== null,
      genericAlternative: matchedAlternative,
      assistanceProgramsAvailable: assistancePrograms,
      clinicalVsCommercialDemarcationNote
    };
  }
}
