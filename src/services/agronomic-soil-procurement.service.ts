import { Injectable } from '@angular/core';

export interface ISoilHealthInput {
  soilOrganicMatterPct: number;
  soilPh: number;
  cationExchangeCapacity: number;
  fungalToBacterialRatio: number;
  tillageIntensity: 'NO_TILL' | 'MINIMUM_TILL' | 'CONVENTIONAL_DEEP_TILL';
  coverCropHistoryYears: number;
}

export interface ISoilHealthOutput {
  regenerativeSoilScore: number;
  projectedCropPolyphenolBoostPct: number;
  mycorrhizalGlomalinStabilityTier: 'HIGH_CARBON_STORAGE' | 'MODERATE' | 'DEPLETED';
  rhizobialNitrogenFixationCreditLbsAcre: number;
  traceMineralBioavailabilityTier: 'OPTIMAL' | 'MODERATE_BINDING' | 'DEFICIENT';
  edaphicAmendmentRecommendations: string[];
}

export interface IFarmPlanningInput {
  usdaHardinessZone: string;
  totalTillableAcres: number;
  waterAvailability: 'RAIN_FED_ONLY' | 'DROUGHT_RESTRICTED' | 'MODERATE_IRRIGATION';
  targetCommunityHealthPriority: 'METABOLIC_DIABETES_REVERSAL' | 'PEDIATRIC_IMMUNITY' | 'GUT_BARRIER_HEALTH';
}

export interface IRecommendedCropPortfolio {
  cropName: string;
  botanicalFamily: string;
  seedVarietyType: string;
  optimalSeedOrderMonth: string;
  projectedYieldLbsPerAcre: number;
  clinicalValueProposition: string;
  soilBenefit: string;
}

export interface IFarmPlanningOutput {
  recommendedCrops: IRecommendedCropPortfolio[];
  polycultureGuildRecommendation: string;
  projectedBotanicalSpeciesContribution: number;
  estimatedClinicalOfftakeContracts: string;
}

export interface IGroceryStockingInput {
  storeType: 'COMMUNITY_COOP' | 'NEIGHBORHOOD_BODEGA' | 'REGIONAL_MARKET';
  weeklyShopperVolume: number;
  currentFreshProduceSkuCount: number;
  refrigeratedShelfFootageLinearFt: number;
}

export interface IShelfStockingItem {
  categoryName: string;
  targetInventoryUnitsWeekly: number;
  botanicalFamilyTarget: string;
  shelfLifeDays: number;
  zeroWasteStorageProtocol: string;
  communityHealthImpact: string;
}

export interface IGroceryStockingOutput {
  recommendedProducePortfolio: IShelfStockingItem[];
  microbiomeDiversityTargetMet: boolean;
  projectedSpoilageReductionPct: number;
  foodAsMedicineVoucherCompatibility: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgronomicSoilProcurementService {

  /**
   * 1. Evaluates soil health, mycorrhizal fungal-to-bacterial balance, and crop mineral density.
   */
  evaluateSoilHealth(data: ISoilHealthInput): ISoilHealthOutput {
    const somFactor = Math.min(1.0, data.soilOrganicMatterPct / 6.0);
    const phPenalty = Math.abs(data.soilPh - 6.5) * 8.0;
    const fbFactor = Math.min(1.0, data.fungalToBacterialRatio / 1.5);

    let tillPenalty = 0.0;
    if (data.tillageIntensity === 'CONVENTIONAL_DEEP_TILL') {
      tillPenalty = 22.0;
    } else if (data.tillageIntensity === 'MINIMUM_TILL') {
      tillPenalty = 8.0;
    }

    const coverBonus = Math.min(18.0, data.coverCropHistoryYears * 4.0);

    const rawScore = (somFactor * 38.0) + (data.cationExchangeCapacity / 50.0 * 25.0) + (fbFactor * 25.0) + coverBonus - phPenalty - tillPenalty;
    const soilScore = Math.round(Math.min(99.0, Math.max(10.0, rawScore)) * 10) / 10;

    const polyphenolBoost = Math.round(Math.min(45.0, Math.max(0.0, (soilScore - 40.0) * 0.7)) * 10) / 10;

    let glomalinTier: 'HIGH_CARBON_STORAGE' | 'MODERATE' | 'DEPLETED' = 'DEPLETED';
    if (data.fungalToBacterialRatio >= 1.0 && data.tillageIntensity === 'NO_TILL') {
      glomalinTier = 'HIGH_CARBON_STORAGE';
    } else if (data.fungalToBacterialRatio >= 0.4) {
      glomalinTier = 'MODERATE';
    }

    const nCredit = Math.min(180.0, Math.round((data.coverCropHistoryYears * 28.0 + (data.soilOrganicMatterPct * 12.0)) * 10) / 10);

    let mineralTier: 'OPTIMAL' | 'MODERATE_BINDING' | 'DEFICIENT' = 'DEFICIENT';
    if (data.soilPh >= 6.0 && data.soilPh <= 7.0 && data.cationExchangeCapacity >= 15.0) {
      mineralTier = 'OPTIMAL';
    } else if (data.soilPh >= 5.5 && data.soilPh <= 7.5) {
      mineralTier = 'MODERATE_BINDING';
    }

    const recs: string[] = [];
    if (data.tillageIntensity === 'CONVENTIONAL_DEEP_TILL') {
      recs.push('Transition to roller-crimped roller no-till or shallow strip-till to preserve arbuscular mycorrhizal networks.');
    }
    if (data.soilOrganicMatterPct < 4.0) {
      recs.push('Incorporate biodiverse winter cover crop cocktail (daikon radish for compaction, hairy vetch for nitrogen, cereal rye for biomass).');
    }
    if (data.fungalToBacterialRatio < 0.8) {
      recs.push('Apply fungal-dominant compost extract or biochar inoculated with indigenous forest microorganisms (IMO).');
    }
    if (data.soilPh < 6.0) {
      recs.push('Apply calcitic or dolomitic agricultural limestone to optimize soil pH and calcium saturation.');
    }
    if (recs.length === 0) {
      recs.push('Soil biological health is exceptional. Continue living root stewardship to preserve high glomalin stability.');
    }

    return {
      regenerativeSoilScore: soilScore,
      projectedCropPolyphenolBoostPct: polyphenolBoost,
      mycorrhizalGlomalinStabilityTier: glomalinTier,
      rhizobialNitrogenFixationCreditLbsAcre: nCredit,
      traceMineralBioavailabilityTier: mineralTier,
      edaphicAmendmentRecommendations: recs
    };
  }

  /**
   * 2. Plans farm polyculture crop portfolios and 9-month heirloom seed procurement.
   */
  planFarmCropPortfolio(data: IFarmPlanningInput): IFarmPlanningOutput {
    const crops: IRecommendedCropPortfolio[] = [];

    if (data.targetCommunityHealthPriority === 'METABOLIC_DIABETES_REVERSAL') {
      crops.push({
        cropName: 'Purple & Black Heirloom Flint Corn / Sorghum',
        botanicalFamily: 'Poaceae',
        seedVarietyType: 'Open-pollinated ancestral landrace',
        optimalSeedOrderMonth: 'November - January (for May sowing)',
        projectedYieldLbsPerAcre: 3200,
        clinicalValueProposition: 'High anthocyanin content dampens postprandial glucose spikes by inhibiting alpha-amylase.',
        soilBenefit: 'Deep taproots extract subsoil minerals; dense biomass increases SOM.'
      });
      crops.push({
        cropName: 'Tepary & Cowpea Heirloom Pulses',
        botanicalFamily: 'Fabaceae',
        seedVarietyType: 'Drought-tolerant heirloom',
        optimalSeedOrderMonth: 'January - February',
        projectedYieldLbsPerAcre: 1800,
        clinicalValueProposition: 'Low-glycemic slow-release amylose with high prebiotic fiber to foster Akkermansia muciniphila.',
        soilBenefit: 'Fixes 80-140 lbs atmospheric nitrogen per acre through symbiotic Rhizobium leguminosarum.'
      });
      crops.push({
        cropName: 'Lacinato & Collard Greens (Brassica)',
        botanicalFamily: 'Brassicaceae',
        seedVarietyType: 'Frost-hardy open-pollinated',
        optimalSeedOrderMonth: 'December (spring crop) & June (fall crop)',
        projectedYieldLbsPerAcre: 8500,
        clinicalValueProposition: 'Glucoraphanin precursor to sulforaphane, activating Nrf2 cellular antioxidant defense.',
        soilBenefit: 'Glucosinolate biofumigation suppresses soil-borne fungal pathogens naturally.'
      });
    } else if (data.targetCommunityHealthPriority === 'GUT_BARRIER_HEALTH') {
      crops.push({
        cropName: 'Jerusalem Artichoke (Sunchoke)',
        botanicalFamily: 'Asteraceae',
        seedVarietyType: 'Perennial heirloom tuber',
        optimalSeedOrderMonth: 'October - November (dormant planting)',
        projectedYieldLbsPerAcre: 12000,
        clinicalValueProposition: 'Highest natural source of inulin fructooligosaccharides for colonic butyrate production.',
        soilBenefit: 'Perennial root system prevents winter erosion and builds durable humic soil matter.'
      });
      crops.push({
        cropName: 'Emmer / Farro & Heritage Spelt',
        botanicalFamily: 'Poaceae',
        seedVarietyType: 'Ancient hulled wheat',
        optimalSeedOrderMonth: 'August - September (for fall planting)',
        projectedYieldLbsPerAcre: 2400,
        clinicalValueProposition: 'Intact aleurone layer with high alkylresorcinols and lower immunoreactive gliadin epitopes.',
        soilBenefit: 'High silica straw forms long-lasting mulch layer that feeds soil fungi.'
      });
      crops.push({
        cropName: 'Traditional Allium Guild (Garlic & Leeks)',
        botanicalFamily: 'Amaryllidaceae',
        seedVarietyType: 'Hardneck heirloom cloves',
        optimalSeedOrderMonth: 'July - August (for October planting)',
        projectedYieldLbsPerAcre: 6000,
        clinicalValueProposition: 'Allicin and organosulfur prebiotics cultivate Bifidobacterium pseudocatenulatum.',
        soilBenefit: 'Natural sulfur exudates deter root nematodes and subterranean pests.'
      });
    } else {
      crops.push({
        cropName: 'Heritage Winter Squash (Cushaw & Hubbard)',
        botanicalFamily: 'Cucurbitaceae',
        seedVarietyType: 'Open-pollinated native heirloom',
        optimalSeedOrderMonth: 'February - March',
        projectedYieldLbsPerAcre: 14000,
        clinicalValueProposition: 'High beta-carotene provitamin A supports mucosal gut barrier and respiratory epithelium.',
        soilBenefit: 'Sprawling umbrella leaves shade soil, suppress weeds, and conserve 40% soil moisture.'
      });
      crops.push({
        cropName: 'Purple Sweet Potato (Okinawan / Molokai)',
        botanicalFamily: 'Convolvulaceae',
        seedVarietyType: 'Certified virus-free slips',
        optimalSeedOrderMonth: 'January - February',
        projectedYieldLbsPerAcre: 16000,
        clinicalValueProposition: 'Peonidin anthocyanins preserve cognitive focus and enhance pediatric microbiome diversity.',
        soilBenefit: 'Vigorous ground cover with high solar energy conversion to root sugars.'
      });
    }

    const guild = 'Three Sisters Agroecological Polyculture (Flint Corn + Climbing Beans + Winter Squash) with Hairy Vetch / Winter Rye cover crop borders.';
    const offtake = `Estimated forward-contract volume: ${Math.round(data.totalTillableAcres * 4000)} lbs produce guaranteed through regional Medicaid Food-as-Medicine vouchers & hospital CSA partnerships.`;

    return {
      recommendedCrops: crops,
      polycultureGuildRecommendation: guild,
      projectedBotanicalSpeciesContribution: crops.length + 4,
      estimatedClinicalOfftakeContracts: offtake
    };
  }

  /**
   * 3. Plans store inventory quotas to support community 30+ plant species diversity with zero-waste storage.
   */
  planGroceryStocking(data: IGroceryStockingInput): IGroceryStockingOutput {
    const diversityMet = data.currentFreshProduceSkuCount >= 32;
    const scale = Math.max(0.5, data.weeklyShopperVolume / 1000.0);

    const items: IShelfStockingItem[] = [
      {
        categoryName: 'Ancestral Pigmented Tubers & Roots',
        targetInventoryUnitsWeekly: Math.round(180 * scale),
        botanicalFamilyTarget: 'Convolvulaceae & Asteraceae (Purple Sweet Potatoes, Sunchokes, Parsnips)',
        shelfLifeDays: 21,
        zeroWasteStorageProtocol: 'Keep at 55°F, 85% relative humidity in breathable wooden crates away from direct ethylene emitters.',
        communityHealthImpact: 'Provides shelf-stable resistant starch and prebiotics without rapid rotting.'
      },
      {
        categoryName: 'Cruciferous & Bitter Greens',
        targetInventoryUnitsWeekly: Math.round(220 * scale),
        botanicalFamilyTarget: 'Brassicaceae (Lacinato Kale, Collards, Mustard Greens, Radishes)',
        shelfLifeDays: 7,
        zeroWasteStorageProtocol: 'Misting display at 34-38°F; rotate day-5 unsold leaves into store-made vegetable broths or kimchi ferments.',
        communityHealthImpact: 'Delivers daily glucosinolates and sulforaphane to lower systemic cardiovascular inflammation.'
      },
      {
        categoryName: 'Heirloom Dried Pulses & Whole Heritage Grains',
        targetInventoryUnitsWeekly: Math.round(300 * scale),
        botanicalFamilyTarget: 'Fabaceae & Poaceae (Cowpeas, Black Beans, Farro, Sorghum, Wild Rice)',
        shelfLifeDays: 365,
        zeroWasteStorageProtocol: 'Bulk gravitational dispensers or airtight paper bags at room temperature with 0% spoilage risk.',
        communityHealthImpact: 'Affordable core staples providing high colonic butyrate yields and glycemic stability.'
      },
      {
        categoryName: 'Allium & Digestive Botanical Aromatics',
        targetInventoryUnitsWeekly: Math.round(160 * scale),
        botanicalFamilyTarget: 'Amaryllidaceae & Zingiberaceae (Hardneck Garlic, Leeks, Shallots, Fresh Ginger, Turmeric)',
        shelfLifeDays: 28,
        zeroWasteStorageProtocol: 'Dry, ventilated open-air woven baskets out of direct sunlight.',
        communityHealthImpact: 'Natural antimicrobial allicin and curcuminoids to protect mucosal tight junction integrity.'
      }
    ];

    const spoilageReduction = data.storeType === 'NEIGHBORHOOD_BODEGA' ? 28.5 : 18.0;

    return {
      recommendedProducePortfolio: items,
      microbiomeDiversityTargetMet: diversityMet,
      projectedSpoilageReductionPct: spoilageReduction,
      foodAsMedicineVoucherCompatibility: 'COMPATIBLE: Ready to accept electronic FHIR Produce Prescription vouchers (US Core ServiceRequest) backed by regional health insurers.'
    };
  }
}
