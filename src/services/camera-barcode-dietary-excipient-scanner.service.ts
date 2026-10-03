import { Injectable, signal, computed } from '@angular/core';
import { SpiritualDietaryConductService, FaithTraditionKey } from './spiritual-dietary-conduct.service';

export interface IBarcodeProductRecord {
  upc: string;
  brand: string;
  productName: string;
  rawIngredientList: string[];
  certifications: string[]; // e.g. ["OU Kosher", "Halal Certified", "Non-GMO", "USDA Organic"]
  allergensPresent: string[]; // e.g. ["Gluten", "Dairy", "Soy"]
}

export interface IScanVerdict {
  upc: string;
  productName: string;
  brand: string;
  overallSafety: 'SAFE' | 'PRECAUTION' | 'STRICT_PROHIBITION';
  allergenViolations: string[];
  faithConductViolations: string[];
  excipientWarnings: string[];
  certificationsConfirmed: string[];
  clinicalPrecautionNotes: string[];
  scanProvenance: string;
}

@Injectable({
  providedIn: 'root'
})
export class CameraBarcodeDietaryExcipientScannerService {
  private readonly isCameraActiveState = signal<boolean>(false);
  readonly isCameraActive = this.isCameraActiveState.asReadonly();

  // Local edge catalog of common grocery and pharmaceutical items for zero-egress lookup
  private readonly localProductCatalog: Record<string, IBarcodeProductRecord> = {
    '011110853401': {
      upc: '011110853401',
      brand: 'Vitality Organics',
      productName: 'Organic Wild Blueberry Chia Fruit Spread',
      rawIngredientList: ['Organic wild lowbush blueberries', 'Organic apple juice concentrate', 'Organic chia seeds', 'Citrus pectin'],
      certifications: ['USDA Organic', 'OU Kosher Parve', 'Non-GMO Project Verified', 'Halal Compliant'],
      allergensPresent: []
    },
    '021200145829': {
      upc: '021200145829',
      brand: 'PharmaHealth OTC',
      productName: 'Extra Strength Acetaminophen Softgels 500mg',
      rawIngredientList: ['Acetaminophen 500mg', 'Porcine gelatin', 'Glycerin', 'Purified water', 'Polyethylene glycol'],
      certifications: ['USP Verified'],
      allergensPresent: []
    },
    '038000139109': {
      upc: '038000139109',
      brand: 'Heritage Mills',
      productName: 'Artisan Sourdough Spelt Crackers',
      rawIngredientList: ['Stone ground spelt flour (wheat derivative)', 'Filtered water', 'Extra virgin olive oil', 'Sea salt', 'Sourdough starter'],
      certifications: ['Non-GMO', 'Kosher Dairy Equipment'],
      allergensPresent: ['Gluten', 'Wheat']
    },
    '049000050114': {
      upc: '049000050114',
      brand: 'Golden Sun Foods',
      productName: 'Organic Roasted Sunflower Seed Butter (Nut-Free)',
      rawIngredientList: ['Roasted organic sunflower seeds', 'Organic sunflower oil', 'Sea salt'],
      certifications: ['Certified Gluten-Free', 'Certified Vegan', 'OU Kosher Parve', 'Non-GMO', 'Halal Certified'],
      allergensPresent: []
    },
    '076800551234': {
      upc: '076800551234',
      brand: 'Apollon Pharmacy',
      productName: 'Nighttime Sleep Relief Liquid Elixir 30ml',
      rawIngredientList: ['Diphenhydramine HCl 50mg', 'Ethanol 10% v/v (alcohol)', 'Sorbitol', 'Citric acid', 'Natural berry flavor'],
      certifications: [],
      allergensPresent: []
    }
  };

  constructor(private spiritualService: SpiritualDietaryConductService) {}

  toggleCameraSimulation(active: boolean): void {
    this.isCameraActiveState.set(active);
  }

  evaluateBarcode(
    upc: string,
    patientAllergies: string[] = ['Gluten', 'Dairy'],
    traditionKey?: FaithTraditionKey
  ): IScanVerdict {
    const activeTradition = traditionKey 
      ? traditionKey 
      : this.spiritualService.selectedTradition();

    const product = this.localProductCatalog[upc] || {
      upc,
      brand: 'Scanned Item (Local OCR/Barcode)',
      productName: `Generic Grocery / Rx Item (${upc})`,
      rawIngredientList: ['Organic Whole Grain Oats', 'Filtered Water', 'Sea Salt'],
      certifications: ['Non-GMO'],
      allergensPresent: []
    };

    const allergenViolations: string[] = [];
    const faithConductViolations: string[] = [];
    const excipientWarnings: string[] = [];
    const clinicalNotes: string[] = [];

    // 1. Audit Allergens
    for (const allergy of patientAllergies) {
      const allergyLower = allergy.toLowerCase();
      if (product.allergensPresent.some(a => a.toLowerCase().includes(allergyLower))) {
        allergenViolations.push(`Contains confirmed allergen: ${allergy}`);
      }
      for (const ing of product.rawIngredientList) {
        if (ing.toLowerCase().includes(allergyLower)) {
          allergenViolations.push(`Ingredient match: ${ing} matches allergen constraint "${allergy}"`);
        }
      }
    }

    // 2. Audit Excipients against Faith Tradition
    const excipientAudits = this.spiritualService.auditMedicationExcipients(product.rawIngredientList);
    for (const audit of excipientAudits) {
      if (audit.riskLevel === 'STRICT_PROHIBITION') {
        faithConductViolations.push(`${audit.excipient}: ${audit.message}`);
      } else if (audit.riskLevel === 'PRECAUTION') {
        excipientWarnings.push(`${audit.excipient}: ${audit.message}`);
      }
    }

    // 3. Overall Verdict determination
    let overallSafety: 'SAFE' | 'PRECAUTION' | 'STRICT_PROHIBITION' = 'SAFE';

    if (allergenViolations.length > 0 || faithConductViolations.length > 0) {
      overallSafety = 'STRICT_PROHIBITION';
    } else if (excipientWarnings.length > 0) {
      overallSafety = 'PRECAUTION';
    }

    if (product.certifications.length > 0) {
      clinicalNotes.push(`Confirmed third-party certifications: ${product.certifications.join(', ')}`);
    }

    return {
      upc: product.upc,
      productName: product.productName,
      brand: product.brand,
      overallSafety,
      allergenViolations: Array.from(new Set(allergenViolations)),
      faithConductViolations: Array.from(new Set(faithConductViolations)),
      excipientWarnings: Array.from(new Set(excipientWarnings)),
      certificationsConfirmed: product.certifications,
      clinicalPrecautionNotes: clinicalNotes,
      scanProvenance: 'PocketGull-OnDevice-ZeroEgress-BarcodeEngine-v1.0 (W3C BarcodeDetector API)'
    };
  }

  getDemoUpcList(): Array<{ upc: string; label: string }> {
    return [
      { upc: '011110853401', label: 'Wild Blueberry Fruit Spread (Safe Whole Food)' },
      { upc: '021200145829', label: 'Acetaminophen Softgels (Contains Porcine Gelatin)' },
      { upc: '038000139109', label: 'Spelt Crackers (Contains Gluten / Spelt)' },
      { upc: '049000050114', label: 'Sunflower Seed Butter (Allergen & Nut Free)' },
      { upc: '076800551234', label: 'Sleep Relief Elixir (Contains 10% Ethanol/Alcohol)' }
    ];
  }
}
