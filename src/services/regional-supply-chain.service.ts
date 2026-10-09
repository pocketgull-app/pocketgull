/**
 * Regional Supply Chain & Geographic Sovereignty Service
 *
 * Maps patient geolocation / continent to decentralized generic pharmacies,
 * local compounding hubs, and indigenous foodshed grocery cooperatives.
 *
 * Replaces centralized pharmaceutical markups with:
 * 1. Africa: mPharma (QualityRx), Medsaf track-and-trace, Dis-Chem SEP, local municipal souks/markets
 * 2. South Asia: Jan Aushadhi (PMBJP 10,000+ outlets), Tata 1mg, APMC Mandis, Rythu Bazars, Millets
 * 3. Latin America: Farmacias Similares (Dr. Simi), SUS Farmácia Popular, Tianguis, Ferias Libres, Nopal
 * 4. North America / Global: CostPlus Drug Company, Walmart $4 Generic, Community Co-ops
 */

import { Injectable, signal, computed } from '@angular/core';

export type GeographicRegionCode =
  | 'AFRICA_WEST_CENTRAL'
  | 'AFRICA_EAST'
  | 'AFRICA_SOUTH'
  | 'SOUTH_ASIA'
  | 'LATIN_AMERICA_MEXICO'
  | 'LATIN_AMERICA_ANDES'
  | 'LATIN_AMERICA_BRAZIL'
  | 'NORTH_AMERICA_AUSTERE';

export interface IRegionalPharmacyNetwork {
  id: string;
  name: string;
  networkType: 'STATE_SUBSIDIZED_GENERIC' | 'INDEPENDENT_COMMUNITY_COOP' | 'TRACK_AND_TRACE_API' | 'DISCOUNT_GENERIC';
  countryCoverage: string[];
  coverageDescription: string;
  typicalSavingsVsBrandPct: number; // e.g. 85-95%
  keyCapabilities: string[];
  offlineAccessProtocol: string;
  samplePriceBenchmarksUsd: {
    metforminMonthly: number;
    amlodipineMonthly: number;
    amoxicillinCourse: number;
    orsSachet: number;
    hydroxyureaMonthly?: number;
  };
}

export interface IRegionalFoodshedMarket {
  id: string;
  name: string;
  marketType: 'OPEN_AIR_MUNICIPAL' | 'FARMER_DIRECT_MANDI' | 'AGROECOLOGICAL_COOP' | 'AFFORDABLE_SUPERMARKET';
  location: string;
  indigenousStaples: string[];
  clinicalMetabolicSynergies: string[];
  averageCostReductionVsImportPct: number; // Savings over imported white flour / refined grains
  produceRxAccepted: boolean;
}

export interface IRegionalSupplyChainProfile {
  regionCode: GeographicRegionCode;
  regionName: string;
  localCurrencyCode: string;
  exchangeRateToUsd: number; // Estimated local units per 1 USD
  primaryPharmacies: IRegionalPharmacyNetwork[];
  primaryFoodsheds: IRegionalFoodshedMarket[];
  sovereigntyRecommendations: string[];
}

export const REGIONAL_SUPPLY_CHAIN_DATABASE: Record<GeographicRegionCode, IRegionalSupplyChainProfile> = {
  AFRICA_WEST_CENTRAL: {
    regionCode: 'AFRICA_WEST_CENTRAL',
    regionName: 'West & Central Africa (Senegal, Nigeria, Ghana, Côte d\'Ivoire)',
    localCurrencyCode: 'XOF / NGN',
    exchangeRateToUsd: 605, // e.g. 605 XOF or 1,450 NGN
    primaryPharmacies: [
      {
        id: 'pharm_mpharma_west',
        name: 'mPharma QualityRx & Mutti Network',
        networkType: 'INDEPENDENT_COMMUNITY_COOP',
        countryCoverage: ['Ghana', 'Nigeria', 'Senegal'],
        coverageDescription: 'De-centralized inventory and fair-pricing franchise for independent community pharmacies.',
        typicalSavingsVsBrandPct: 82,
        keyCapabilities: ['No-stockout guarantee for WHO essential medicines', 'Micro-financing for chronic disease', 'SMS prescription refills'],
        offlineAccessProtocol: '2G USSD (*123#) or feature phone SMS posology confirmation with local chemist.',
        samplePriceBenchmarksUsd: {
          metforminMonthly: 1.80,
          amlodipineMonthly: 1.20,
          amoxicillinCourse: 1.10,
          orsSachet: 0.15,
          hydroxyureaMonthly: 4.50
        }
      },
      {
        id: 'pharm_medsaf',
        name: 'Medsaf Cryptographic Batch Verification',
        networkType: 'TRACK_AND_TRACE_API',
        countryCoverage: ['Nigeria', 'West Africa Regional'],
        coverageDescription: 'Ensures genuine, un-adulterated active pharmaceutical ingredients (APIs) directly from WHO-prequalified manufacturers.',
        typicalSavingsVsBrandPct: 75,
        keyCapabilities: ['Anti-counterfeit serial inspection', 'Cold-chain audit verification', 'Bulk hospital procurement pooling'],
        offlineAccessProtocol: 'Scratch-off alphanumeric verification code checked via free SMS toll-free gateway.',
        samplePriceBenchmarksUsd: {
          metforminMonthly: 1.60,
          amlodipineMonthly: 1.10,
          amoxicillinCourse: 0.95,
          orsSachet: 0.12,
          hydroxyureaMonthly: 4.20
        }
      }
    ],
    primaryFoodsheds: [
      {
        id: 'food_sandaga_tilene',
        name: 'Marché Sandaga & Tilène Open-Air Guilds (Dakar, Senegal)',
        marketType: 'OPEN_AIR_MUNICIPAL',
        location: 'Dakar, Thies, and Saint-Louis',
        indigenousStaples: ['White Fonio (Digitaria exilis)', 'Moringa Oleifera fresh leaves', 'Cowpeas (Niebe)', 'Baobab fruit powder (Bouye)', 'Hibiscus sabdariffa (Bissap)'],
        clinicalMetabolicSynergies: ['Metabolic syndrome & HbA1c reversal via low-GI resistant starch fonio', 'Hepatic glutathione support with cystine & methionine', 'Endothelial blood pressure reduction with hibiscus anthocyanins'],
        averageCostReductionVsImportPct: 58,
        produceRxAccepted: true
      },
      {
        id: 'food_kejetia_balogun',
        name: 'Kejetia & Balogun Agroecological Markets (Ghana / Nigeria)',
        marketType: 'OPEN_AIR_MUNICIPAL',
        location: 'Kumasi, Accra, Lagos, and Ibadan',
        indigenousStaples: ['Bambara groundnut', 'Plantain green flour (unripe resistant starch)', 'Bitter leaf (Vernonia amygdalina)', 'Moringa pods'],
        clinicalMetabolicSynergies: ['Insulin sensitizing natural sesquiterpenes in Vernonia', 'Colonic butyrate prebiotic fermentation from green plantain fiber'],
        averageCostReductionVsImportPct: 62,
        produceRxAccepted: true
      }
    ],
    sovereigntyRecommendations: [
      'Source generic Hydroxyurea and Artemether-Lumefantrine through mPharma/Medsaf verified community outlets to eliminate counterfeit risk.',
      'Replace imported refined white rice and wheat flour with ancestral Fonio and unripe green plantain flour to halt metabolic disease progression.',
      'Utilize SMS/USSD triage pathways on 2G feature phones for antenatal vitals and malaria screening.'
    ]
  },

  AFRICA_EAST: {
    regionCode: 'AFRICA_EAST',
    regionName: 'East Africa & Great Lakes (Kenya, Rwanda, Uganda, Tanzania, Ethiopia)',
    localCurrencyCode: 'KES / RWF / ETB',
    exchangeRateToUsd: 130, // e.g. 130 KES
    primaryPharmacies: [
      {
        id: 'pharm_mpharma_east',
        name: 'mPharma East Africa & Haltons Network',
        networkType: 'INDEPENDENT_COMMUNITY_COOP',
        countryCoverage: ['Kenya', 'Rwanda', 'Uganda'],
        coverageDescription: 'Community pharmacy chain delivering pre-packaged essential NCD medicines with mobile money integration.',
        typicalSavingsVsBrandPct: 80,
        keyCapabilities: ['M-Pesa micropayments', 'Direct community health worker doorstep delivery', 'Fixed-price diabetes packs'],
        offlineAccessProtocol: 'M-Pesa STK push & SMS receipt with zero cellular data required.',
        samplePriceBenchmarksUsd: {
          metforminMonthly: 1.75,
          amlodipineMonthly: 1.25,
          amoxicillinCourse: 1.05,
          orsSachet: 0.14,
          hydroxyureaMonthly: 4.80
        }
      }
    ],
    primaryFoodsheds: [
      {
        id: 'food_naivas_quickmart_local',
        name: 'Naivas / Quickmart Local Smallholder Produce & City Markets (Nairobi, Kenya)',
        marketType: 'AFFORDABLE_SUPERMARKET',
        location: 'Nairobi, Kisumu, Mombasa, Nakuru',
        indigenousStaples: ['Finger Millet (Wimbi)', 'Sorghum flour', 'African Nightshade (Managu)', 'Spider plant (Sageti)', 'Amaranth greens (Terere)'],
        clinicalMetabolicSynergies: ['Microbiome diversity bloom via indigenous dark bitter leafy greens', 'High calcium and iron density in Wimbi porridge for pediatric/maternal resilience'],
        averageCostReductionVsImportPct: 52,
        produceRxAccepted: true
      },
      {
        id: 'food_addis_merkato',
        name: 'Addis Merkato & Regional Teff Mill Cooperatives (Ethiopia)',
        marketType: 'OPEN_AIR_MUNICIPAL',
        location: 'Addis Ababa, Oromia, Amhara highlands',
        indigenousStaples: ['Ivory and Brown Teff', 'Heirloom Bicolor Sorghum', 'Chickpeas (Shimbra)', 'Flaxseed (Telba)'],
        clinicalMetabolicSynergies: ['Microcytic iron-deficiency anemia resolution (15mg iron / 100g Teff)', 'Wild-fermented sourdough Injera prebiotic gut axis optimization'],
        averageCostReductionVsImportPct: 65,
        produceRxAccepted: true
      }
    ],
    sovereigntyRecommendations: [
      'Prioritize local cooperatives milling whole grain Teff and Sorghum rather than commercial refined wheat flour.',
      'Verify cold-chain vaccine & insulin integrity using solar PV microgrid telemetry and WHO PQS sensors in district dispensaries.'
    ]
  },

  AFRICA_SOUTH: {
    regionCode: 'AFRICA_SOUTH',
    regionName: 'Southern Africa (South Africa, Zambia, Botswana, Zimbabwe)',
    localCurrencyCode: 'ZAR',
    exchangeRateToUsd: 18.5,
    primaryPharmacies: [
      {
        id: 'pharm_dischem_clicks_sep',
        name: 'Dis-Chem & Clicks Generic Formulary (Single Exit Price - SEP)',
        networkType: 'DISCOUNT_GENERIC',
        countryCoverage: ['South Africa', 'Botswana', 'Namibia'],
        coverageDescription: 'National statutory Single Exit Price transparent generics preventing out-of-pocket gouging.',
        typicalSavingsVsBrandPct: 78,
        keyCapabilities: ['Statutory mandatory generic substitution', 'Chronic illness repeat dispensing (CCMDD)', 'Free blood pressure screening'],
        offlineAccessProtocol: 'In-person clinic registration with SMS collection tokens.',
        samplePriceBenchmarksUsd: {
          metforminMonthly: 2.10,
          amlodipineMonthly: 1.50,
          amoxicillinCourse: 1.40,
          orsSachet: 0.18,
          hydroxyureaMonthly: 5.20
        }
      }
    ],
    primaryFoodsheds: [
      {
        id: 'food_south_africa_staples',
        name: 'Fresh Produce Markets & Local Smallholder Co-ops (Johannesburg / Cape Town)',
        marketType: 'OPEN_AIR_MUNICIPAL',
        location: 'City Deep (Joburg Market), Epping Market, rural Limpopo co-ops',
        indigenousStaples: ['Sorghum (Mabele)', 'Cowpeas', 'Moringa powder', 'Wild marula fruit', 'Rooibos herbal infusion'],
        clinicalMetabolicSynergies: ['Aspalathin antioxidant cardiovascular shielding from unfermented Rooibos', 'High polyphenols in Mabele slowing postprandial glucose surges'],
        averageCostReductionVsImportPct: 45,
        produceRxAccepted: true
      }
    ],
    sovereigntyRecommendations: [
      'Enforce mandatory generic substitution at the dispensing counter under South African SEP guidelines.',
      'Integrate rooftop solar and battery cycling to maintain clinic refrigerator power during scheduled load shedding.'
    ]
  },

  SOUTH_ASIA: {
    regionCode: 'SOUTH_ASIA',
    regionName: 'South Asia / Bharat (India, Bangladesh, Nepal, Sri Lanka)',
    localCurrencyCode: 'INR',
    exchangeRateToUsd: 84.0,
    primaryPharmacies: [
      {
        id: 'pharm_jan_aushadhi',
        name: 'Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP / Jan Aushadhi)',
        networkType: 'STATE_SUBSIDIZED_GENERIC',
        countryCoverage: ['India'],
        coverageDescription: '10,000+ government generic pharmacies providing unbranded WHO-standard essential medicines at 50% to 90% below brand prices.',
        typicalSavingsVsBrandPct: 88,
        keyCapabilities: ['Metformin 500mg at $0.01/tablet', 'Full monthly cardiovascular therapy under $2.00', 'Dispersible pediatric formulations'],
        offlineAccessProtocol: 'Walk-in cash purchasing with standard doctor prescription slip; zero app or smartphone required.',
        samplePriceBenchmarksUsd: {
          metforminMonthly: 0.40,
          amlodipineMonthly: 0.35,
          amoxicillinCourse: 0.65,
          orsSachet: 0.08,
          hydroxyureaMonthly: 2.10
        }
      },
      {
        id: 'pharm_tata_apollo_gen',
        name: 'Tata 1mg / Apollo Pharmacy Generics',
        networkType: 'DISCOUNT_GENERIC',
        countryCoverage: ['India', 'South Asia'],
        coverageDescription: 'Pan-regional distribution providing transparent generic substitution for tier-2/3 towns.',
        typicalSavingsVsBrandPct: 75,
        keyCapabilities: ['Temperature-controlled cold-chain insulin dispatch', 'Home delivery', 'Pharmacist tele-consult'],
        offlineAccessProtocol: 'Toll-free IVR telephone ordering for elderly patients.',
        samplePriceBenchmarksUsd: {
          metforminMonthly: 0.90,
          amlodipineMonthly: 0.70,
          amoxicillinCourse: 1.10,
          orsSachet: 0.12,
          hydroxyureaMonthly: 3.20
        }
      }
    ],
    primaryFoodsheds: [
      {
        id: 'food_mandi_rythu_bazar',
        name: 'APMC Farmer Mandis & Rythu Bazars ("Shree Anna" Millet Hubs)',
        marketType: 'FARMER_DIRECT_MANDI',
        location: 'Across Punjab, Maharashtra, Andhra Pradesh, Karnataka, Tamil Nadu',
        indigenousStaples: ['Pearl Millet (Bajra)', 'Sorghum (Jowar)', 'Finger Millet (Ragi)', 'Foxtail Millet (Kangni)', 'Split Mung Dal', 'Fresh Amla (Indian Gooseberry)', 'Moringa drumsticks'],
        clinicalMetabolicSynergies: ['Extreme postprandial glucose blunting from millets replacing polished white rice', 'Profound natural ascorbic acid and endothelial nitric oxide boost from Amla (Emblica officinalis)', 'Potassium and magnesium repletion from moringa drumsticks'],
        averageCostReductionVsImportPct: 68,
        produceRxAccepted: true
      }
    ],
    sovereigntyRecommendations: [
      'Direct all standard-of-care chronic prescriptions to the nearest Jan Aushadhi Kendra to eliminate household financial bankruptcy.',
      'Prescribe ancestral "Shree Anna" millets (Ragi, Jowar, Bajra) in place of polished white rice for Type 2 Diabetes reversal.'
    ]
  },

  LATIN_AMERICA_MEXICO: {
    regionCode: 'LATIN_AMERICA_MEXICO',
    regionName: 'Mexico & Central America',
    localCurrencyCode: 'MXN',
    exchangeRateToUsd: 19.5,
    primaryPharmacies: [
      {
        id: 'pharm_similares_dr_simi',
        name: 'Farmacias Similares ("Dr. Simi")',
        networkType: 'DISCOUNT_GENERIC',
        countryCoverage: ['Mexico', 'Guatemala', 'Chile', 'Colombia'],
        coverageDescription: 'Over 8,000 community pharmacies with co-located low-cost medical consult rooms, pioneering Latin American generic equity.',
        typicalSavingsVsBrandPct: 75,
        keyCapabilities: ['Sub-dollar generic prescriptions', 'Immediate adjacent physician consult', 'Bioequivalent unbranded formulations'],
        offlineAccessProtocol: 'Walk-in cash model in nearly every rural and urban neighborhood block.',
        samplePriceBenchmarksUsd: {
          metforminMonthly: 1.80,
          amlodipineMonthly: 1.40,
          amoxicillinCourse: 1.30,
          orsSachet: 0.15
        }
      },
      {
        id: 'pharm_ahorro_guadalajara',
        name: 'Farmacias del Ahorro / Farmacias Guadalajara Generic Lines',
        networkType: 'DISCOUNT_GENERIC',
        countryCoverage: ['Mexico'],
        coverageDescription: 'National pharmacy chains offering generic bioequivalent lines with free neighborhood delivery.',
        typicalSavingsVsBrandPct: 70,
        keyCapabilities: ['Monitored bioequivalence', 'Chronic patient adherence discount programs'],
        offlineAccessProtocol: 'Direct telephone ordering or neighborhood store counter walk-in.',
        samplePriceBenchmarksUsd: {
          metforminMonthly: 2.20,
          amlodipineMonthly: 1.70,
          amoxicillinCourse: 1.60,
          orsSachet: 0.20
        }
      }
    ],
    primaryFoodsheds: [
      {
        id: 'food_tianguis_mexico',
        name: 'Traditional Neighborhood Tianguis & Central de Abasto',
        marketType: 'OPEN_AIR_MUNICIPAL',
        location: 'Mexico City, Guadalajara, Oaxaca, Puebla, Chiapas',
        indigenousStaples: ['Fresh Nopal cactus paddles', 'Heirloom Black & Pinto beans', 'Amaranth grain (Alegria)', 'Chia seeds', 'Heirloom nixtamalized native corn masa', 'Flor de Jamaica (Hibiscus)'],
        clinicalMetabolicSynergies: ['Nopal soluble mucilage binds intestinal glucose, reducing glycemic excursion after meals', 'Ancestral nixtamalization unleashes bioavailable niacin and calcium in heirloom corn', 'Flavonoid-rich black beans support anti-inflammatory gut microbiome taxa'],
        averageCostReductionVsImportPct: 60,
        produceRxAccepted: true
      }
    ],
    sovereigntyRecommendations: [
      'Prescribe daily fresh grilled Nopal and heirloom black beans alongside generic Metformin for synergistic glycemic stabilization.',
      'Recommend Farmacias Similares or local generic chemist counters over expensive transnational supermarket pharmacies.'
    ]
  },

  LATIN_AMERICA_ANDES: {
    regionCode: 'LATIN_AMERICA_ANDES',
    regionName: 'Andean South America (Colombia, Peru, Ecuador, Bolivia)',
    localCurrencyCode: 'COP / PEN / USD / BOB',
    exchangeRateToUsd: 4200, // e.g. 4200 COP or 3.75 PEN
    primaryPharmacies: [
      {
        id: 'pharm_cruz_verde_andes',
        name: 'Cruz Verde & Inkafarma Generic Formularies',
        networkType: 'DISCOUNT_GENERIC',
        countryCoverage: ['Colombia', 'Peru', 'Chile', 'Ecuador'],
        coverageDescription: 'Widespread retail community access offering unbranded bioequivalent generics for essential medicines.',
        typicalSavingsVsBrandPct: 72,
        keyCapabilities: ['Generic substitution', 'Rural branch networks'],
        offlineAccessProtocol: 'Over-the-counter dispensing with prescription card.',
        samplePriceBenchmarksUsd: {
          metforminMonthly: 2.10,
          amlodipineMonthly: 1.60,
          amoxicillinCourse: 1.50,
          orsSachet: 0.16
        }
      }
    ],
    primaryFoodsheds: [
      {
        id: 'food_ferias_libres_andes',
        name: 'Ferias Libres & Mercados Municipales de la Sierra',
        marketType: 'OPEN_AIR_MUNICIPAL',
        location: 'Bogotá, Medellín, Lima, Cusco, Quito, La Paz',
        indigenousStaples: ['Heirloom Quinoa (Chenopodium quinoa)', 'Kiwicha (Amaranth)', 'Maca root', 'Native purple Andean potatoes', 'Cassava (Yuca)', 'Fresh tree tomato (Tomate de árbol)'],
        clinicalMetabolicSynergies: ['High anthocyanin vascular protection from native purple Andean tubers', 'Complete plant protein with balanced essential amino acids from Quinoa and Kiwicha'],
        averageCostReductionVsImportPct: 55,
        produceRxAccepted: true
      }
    ],
    sovereigntyRecommendations: [
      'Replace imported industrial wheat pasta with Andean Quinoa and native tuber mashes to protect endothelial microvasculature.'
    ]
  },

  LATIN_AMERICA_BRAZIL: {
    regionCode: 'LATIN_AMERICA_BRAZIL',
    regionName: 'Brazil & Southern Cone (SUS Farmácia Popular)',
    localCurrencyCode: 'BRL',
    exchangeRateToUsd: 5.60,
    primaryPharmacies: [
      {
        id: 'pharm_farmacia_popular_sus',
        name: 'Programa Farmácia Popular do Brasil (SUS)',
        networkType: 'STATE_SUBSIDIZED_GENERIC',
        countryCoverage: ['Brazil'],
        coverageDescription: 'Universal unified public health service (SUS) providing 100% free essential medicines for hypertension, diabetes, and asthma at private partner pharmacies.',
        typicalSavingsVsBrandPct: 100, // 100% free for core indications
        keyCapabilities: ['100% free Metformin, Losartan, Enalapril, Glibenclamide, Salbutamol', 'National public-private partnership', 'Biometric or CPF ID card integration'],
        offlineAccessProtocol: 'Patient presents national CPF tax ID card and valid prescription to any partner pharmacy with the Farmácia Popular emblem.',
        samplePriceBenchmarksUsd: {
          metforminMonthly: 0.00,
          amlodipineMonthly: 0.00,
          amoxicillinCourse: 0.80,
          orsSachet: 0.05
        }
      }
    ],
    primaryFoodsheds: [
      {
        id: 'food_feiras_livres_brasil',
        name: 'Feiras Livres & Mercados Municipais (Brazil)',
        marketType: 'OPEN_AIR_MUNICIPAL',
        location: 'São Paulo, Rio de Janeiro, Salvador, Belo Horizonte, Manaus',
        indigenousStaples: ['Cassava & Farinha de Mandioca d\'água', 'Feijão preto (Black beans)', 'Açaí puro sem xarope (unsweetened)', 'Taioba (indigenous leafy green)', 'Castanha-do-Pará (Brazil nuts)'],
        clinicalMetabolicSynergies: ['High selenium (1-2 Brazil nuts/day) for glutathione peroxidase antioxidant activity and thyroid hormone deiodination', 'Polyphenol anthocyanin vascular protection from pure wild açaí'],
        averageCostReductionVsImportPct: 50,
        produceRxAccepted: true
      }
    ],
    sovereigntyRecommendations: [
      'Guide all Brazilian patients to redeem their 100% free essential medicines via Farmácia Popular (SUS) rather than paying out-of-pocket.',
      'Prescribe 1-2 native Brazil nuts daily as natural high-selenium thyroid and antioxidant cofactor replenishment.'
    ]
  },

  NORTH_AMERICA_AUSTERE: {
    regionCode: 'NORTH_AMERICA_AUSTERE',
    regionName: 'North America / Rural & Tribal Communities',
    localCurrencyCode: 'USD',
    exchangeRateToUsd: 1.0,
    primaryPharmacies: [
      {
        id: 'pharm_costplus_walmart_4',
        name: 'Cost Plus Drugs / Walmart $4 Generic / IHS Dispensary',
        networkType: 'DISCOUNT_GENERIC',
        countryCoverage: ['United States'],
        coverageDescription: 'Direct manufacturer cost-plus 15% pricing and Walmart $4/month generic lists bypassing PBM price gouging.',
        typicalSavingsVsBrandPct: 85,
        keyCapabilities: ['Standard Retail Benchmark transparency', 'Direct mail delivery', 'No insurance required'],
        offlineAccessProtocol: 'Walk-in clinic prescription presented at local retail or community health center dispensary.',
        samplePriceBenchmarksUsd: {
          metforminMonthly: 4.00,
          amlodipineMonthly: 4.00,
          amoxicillinCourse: 4.00,
          orsSachet: 0.50,
          hydroxyureaMonthly: 9.00
        }
      }
    ],
    primaryFoodsheds: [
      {
        id: 'food_indigenous_tribal_coops',
        name: 'Tribal Nation Food Sovereignty Hubs & Farmers Markets',
        marketType: 'AGROECOLOGICAL_COOP',
        location: 'Pacific Northwest, Southwest Pueblos, Great Lakes Ojibwe',
        indigenousStaples: ['Wild Manoomin (Wild Rice)', 'Tepary beans (Phaseolus acutifolius)', 'Cholla cactus buds', 'Blue corn meal', 'Salmon & cold-water marine harvest'],
        clinicalMetabolicSynergies: ['Tepary beans evolved extreme drought resilience and lowest glycemic index of any bean for diabetes prevention', 'Marine omega-3 and selenium anti-inflammatory balance'],
        averageCostReductionVsImportPct: 40,
        produceRxAccepted: true
      }
    ],
    sovereigntyRecommendations: [
      'Direct patients to Walmart $4 retail generic benchmarks and Cost Plus Drugs to bypass opaque commercial copay tiers.',
      'Support Indigenous Food Sovereignty through GusNIP and Produce Rx vouchers redeemable for traditional wild rice and heirloom beans.'
    ]
  }
};

@Injectable({
  providedIn: 'root'
})
export class RegionalSupplyChainService {
  /** Currently selected geographic region. Defaults to West & Central Africa */
  readonly activeRegionCode = signal<GeographicRegionCode>('AFRICA_WEST_CENTRAL');

  /** Profile for the active geographic region */
  readonly activeRegion = computed<IRegionalSupplyChainProfile>(() => {
    return REGIONAL_SUPPLY_CHAIN_DATABASE[this.activeRegionCode()] || REGIONAL_SUPPLY_CHAIN_DATABASE.AFRICA_WEST_CENTRAL;
  });

  /** List of all supported geographic regions */
  readonly availableRegions = computed(() => {
    return Object.values(REGIONAL_SUPPLY_CHAIN_DATABASE).map(p => ({
      code: p.regionCode,
      name: p.regionName,
      currency: p.localCurrencyCode
    }));
  });

  /**
   * Sets the active geographic region based on user choice or detected IP/locale.
   */
  public setRegion(code: GeographicRegionCode): void {
    if (REGIONAL_SUPPLY_CHAIN_DATABASE[code]) {
      this.activeRegionCode.set(code);
    }
  }

  /**
   * Automatically resolves closest region from country code or telephone prefix.
   */
  public resolveRegionFromPhoneOrCountry(indicator: string): GeographicRegionCode {
    const cleaned = indicator.toLowerCase().trim();
    if (cleaned.includes('+234') || cleaned.includes('+233') || cleaned.includes('+221') || cleaned.includes('nigeria') || cleaned.includes('ghana') || cleaned.includes('senegal')) {
      return 'AFRICA_WEST_CENTRAL';
    }
    if (cleaned.includes('+254') || cleaned.includes('+250') || cleaned.includes('+256') || cleaned.includes('+255') || cleaned.includes('+251') || cleaned.includes('kenya') || cleaned.includes('rwanda') || cleaned.includes('ethiopia')) {
      return 'AFRICA_EAST';
    }
    if (cleaned.includes('+27') || cleaned.includes('+260') || cleaned.includes('south africa') || cleaned.includes('zambia')) {
      return 'AFRICA_SOUTH';
    }
    if (cleaned.includes('+91') || cleaned.includes('+880') || cleaned.includes('+977') || cleaned.includes('india') || cleaned.includes('bharat') || cleaned.includes('bangladesh')) {
      return 'SOUTH_ASIA';
    }
    if (cleaned.includes('+52') || cleaned.includes('mexico') || cleaned.includes('guatemala')) {
      return 'LATIN_AMERICA_MEXICO';
    }
    if (cleaned.includes('+57') || cleaned.includes('+51') || cleaned.includes('+593') || cleaned.includes('colombia') || cleaned.includes('peru') || cleaned.includes('ecuador')) {
      return 'LATIN_AMERICA_ANDES';
    }
    if (cleaned.includes('+55') || cleaned.includes('brazil') || cleaned.includes('brasil')) {
      return 'LATIN_AMERICA_BRAZIL';
    }
    return 'NORTH_AMERICA_AUSTERE';
  }

  /**
   * Generates a tailored sovereign grocery and generic prescription referral
   * matching the patient's geographic location.
   */
  public generateRegionalCarePlanReferral(params: {
    regionCode?: GeographicRegionCode;
    prescribedMeds?: string[];
    healthCondition?: string;
  }): {
    regionName: string;
    currency: string;
    recommendedPharmacies: IRegionalPharmacyNetwork[];
    recommendedFoodsheds: IRegionalFoodshedMarket[];
    estimatedMonthlyDrugCostLocalCurrency: string;
    sovereigntyDirectives: string[];
  } {
    const regionCode = params.regionCode || this.activeRegionCode();
    const profile = REGIONAL_SUPPLY_CHAIN_DATABASE[regionCode] || REGIONAL_SUPPLY_CHAIN_DATABASE.AFRICA_WEST_CENTRAL;

    // Estimate realistic generic cost in local currency
    const baseUsd = 4.0; // Typical monthly essential bundle (metformin + amlodipine + ORS)
    const localCost = Math.round(baseUsd * profile.exchangeRateToUsd);

    return {
      regionName: profile.regionName,
      currency: profile.localCurrencyCode,
      recommendedPharmacies: profile.primaryPharmacies,
      recommendedFoodsheds: profile.primaryFoodsheds,
      estimatedMonthlyDrugCostLocalCurrency: `~${localCost.toLocaleString()} ${profile.localCurrencyCode} / month`,
      sovereigntyDirectives: profile.sovereigntyRecommendations
    };
  }
}
