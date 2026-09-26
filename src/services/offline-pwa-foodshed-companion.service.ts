import { Injectable } from '@angular/core';

export interface IIngredientScanResult {
  rawText: string;
  isSafeForPatient: boolean;
  flaggedAllergens: string[];
  flaggedHarmfulAdditives: {
    name: string;
    category: 'Ultra-Processed Emulsifier' | 'Artificial Sweetener' | 'Synthetic Dye' | 'Preservative / Nitrate';
    healthImpact: string;
  }[];
  beneficialPhytonutrients: string[];
  ismpSafetyDirectives: string[];
  offlineIntegrityHash: string;
}

export interface IOfflineCachedStore {
  storeId: string;
  name: string;
  cityId: string;
  cityName: string;
  address: string;
  acceptsSnapWic: boolean;
  isCoop: boolean;
  phone: string;
  seasonalHighlights: string[];
  lastSyncedTimestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfflinePwaFoodshedCompanionService {
  private readonly defaultOfflineStores: IOfflineCachedStore[] = [
    {
      storeId: 'store_ojai_rainbow',
      name: 'Rainbow Bridge Natural Food Co-op',
      cityId: 'dest_ojai',
      cityName: 'Ojai Valley, CA',
      address: '211 E Matilija St, Ojai, CA 93023',
      acceptsSnapWic: true,
      isCoop: true,
      phone: '(805) 646-6623',
      seasonalHighlights: ['Pixie Tangerines', 'Mission Olive Oil', 'Raw Avocado Honey'],
      lastSyncedTimestamp: new Date().toISOString()
    },
    {
      storeId: 'store_slo_coop',
      name: 'SLO Natural Foods Co-op',
      cityId: 'dest_slo',
      cityName: 'San Luis Obispo, CA',
      address: '2494 Victoria Ave, San Luis Obispo, CA 93401',
      acceptsSnapWic: true,
      isCoop: true,
      phone: '(805) 544-7928',
      seasonalHighlights: ['Coastal Artichokes', 'Santa Maria Pinquito Beans', 'Purple Cauliflower'],
      lastSyncedTimestamp: new Date().toISOString()
    },
    {
      storeId: 'store_sequim_coop',
      name: 'Port Angeles Community Food Co-op & Sequim Stand',
      cityId: 'dest_sequim',
      cityName: 'Sequim, WA',
      address: '216 S Lincoln St, Port Angeles, WA 98362',
      acceptsSnapWic: true,
      isCoop: true,
      phone: '(360) 452-1116',
      seasonalHighlights: ['Olympic Morels', 'Wild Huckleberries', 'Dungeness Crab'],
      lastSyncedTimestamp: new Date().toISOString()
    },
    {
      storeId: 'store_lewiston_coop',
      name: 'St. Mary’s Nutrition Center & New Roots Co-op Store',
      cityId: 'dest_lewiston',
      cityName: 'Lewiston, ME',
      address: '208 Bates St, Lewiston, ME 04240',
      acceptsSnapWic: true,
      isCoop: true,
      phone: '(207) 513-3848',
      seasonalHighlights: ['Maine Wild Blueberries', 'Spring Fiddlehead Ferns', 'Chaga Mushroom Tea'],
      lastSyncedTimestamp: new Date().toISOString()
    }
  ];

  /**
   * Retrieves offline cached co-ops and grocery outlets (zero network egress required)
   */
  getCachedStores(cityId?: string): IOfflineCachedStore[] {
    if (!cityId) return this.defaultOfflineStores;
    return this.defaultOfflineStores.filter(s => s.cityId === cityId);
  }

  /**
   * Scans ingredient text / OCR barcode output with zero cloud egress,
   * flagging allergens, ultra-processed emulsifiers, and ISMP safety triggers.
   */
  scanIngredientText(text: string, patientAllergies: string[] = []): IIngredientScanResult {
    const normalized = text.toLowerCase();
    const flaggedAllergens: string[] = [];
    const flaggedHarmfulAdditives: IIngredientScanResult['flaggedHarmfulAdditives'] = [];
    const beneficialPhytonutrients: string[] = [];
    const ismpSafetyDirectives: string[] = [];

    // 1. Patient-specific allergy detection
    for (const allergy of patientAllergies) {
      if (normalized.includes(allergy.toLowerCase())) {
        flaggedAllergens.push(allergy);
      }
    }

    // Common standard allergens check if present
    const commonAllergens = ['peanut', 'tree nut', 'wheat', 'gluten', 'soy', 'dairy', 'milk', 'shellfish', 'egg'];
    for (const ca of commonAllergens) {
      if (normalized.includes(ca) && !flaggedAllergens.includes(ca)) {
        flaggedAllergens.push(ca);
      }
    }

    // 2. High-risk food additives & emulsifiers (Microbiome disruption)
    if (normalized.includes('polysorbate 80') || normalized.includes('polysorbate-80')) {
      flaggedHarmfulAdditives.push({
        name: 'Polysorbate 80',
        category: 'Ultra-Processed Emulsifier',
        healthImpact: 'Disrupts colonic mucosal barrier; induces low-grade intestinal inflammation and metabolic syndrome.'
      });
    }
    if (normalized.includes('carboxymethylcellulose') || normalized.includes('cmc') || normalized.includes('cellulose gum')) {
      flaggedHarmfulAdditives.push({
        name: 'Carboxymethylcellulose (CMC)',
        category: 'Ultra-Processed Emulsifier',
        healthImpact: 'Promotes bacterial encroachment into gut mucus layer; triggers dysbiosis in vulnerable microbiomes.'
      });
    }
    if (normalized.includes('sucralose') || normalized.includes('aspartame') || normalized.includes('acesulfame potassium')) {
      flaggedHarmfulAdditives.push({
        name: 'Non-Nutritive High-Intensity Sweetener',
        category: 'Artificial Sweetener',
        healthImpact: 'Alters gut microbial composition and impairs GLP-1 glucose homeostasis.'
      });
    }
    if (normalized.includes('red 40') || normalized.includes('yellow 5') || normalized.includes('yellow 6') || normalized.includes('blue 1')) {
      flaggedHarmfulAdditives.push({
        name: 'Synthetic Azo Food Dye',
        category: 'Synthetic Dye',
        healthImpact: 'Associated with pediatric neurobehavioral hyperactivity and histamine release.'
      });
    }
    if (normalized.includes('sodium nitrite') || normalized.includes('sodium nitrate')) {
      flaggedHarmfulAdditives.push({
        name: 'Sodium Nitrite/Nitrate',
        category: 'Preservative / Nitrate',
        healthImpact: 'Forms nitrosamines in gastric acid; elevates vascular oxidative endothelial stress.'
      });
    }

    // 3. Beneficial phytonutrient identification
    if (normalized.includes('blueberry') || normalized.includes('blueberries') || normalized.includes('huckleberry') || normalized.includes('huckleberries') || normalized.includes('blackberry') || normalized.includes('blackberries') || normalized.includes('berry')) {
      beneficialPhytonutrients.push('Anthocyanins (Microvascular & Cognitive Protection)');
    }
    if (normalized.includes('olive oil') || normalized.includes('extra virgin')) {
      beneficialPhytonutrients.push('Oleocanthal & Hydroxytyrosol (Natural COX Inhibition)');
    }
    if (normalized.includes('artichoke') || normalized.includes('chicory') || normalized.includes('inulin')) {
      beneficialPhytonutrients.push('Inulin Fructans (Butyrogenic Prebiotic Fiber)');
    }
    if (normalized.includes('turmeric') || normalized.includes('curcumin')) {
      beneficialPhytonutrients.push('Curcuminoids (NF-kB Downregulation)');
    }

    // 4. ISMP Clinical Safety Directives
    if (flaggedHarmfulAdditives.length > 0) {
      ismpSafetyDirectives.push('Recommendation: Replace with whole-food un-emulsified alternative to preserve gut mucus layer.');
    }
    if (flaggedAllergens.length > 0) {
      ismpSafetyDirectives.push('ALERT: Contains documented patient allergen. Verify cross-contamination risk on label.');
    }

    const isSafe = flaggedAllergens.length === 0 && flaggedHarmfulAdditives.length === 0;
    const offlineHash = `offline-hash:${Math.abs(this.simpleHash(normalized + isSafe.toString()))}`;

    return {
      rawText: text,
      isSafeForPatient: isSafe,
      flaggedAllergens,
      flaggedHarmfulAdditives,
      beneficialPhytonutrients,
      ismpSafetyDirectives,
      offlineIntegrityHash: offlineHash
    };
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
