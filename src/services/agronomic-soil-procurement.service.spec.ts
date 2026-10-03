import { describe, it, expect, beforeEach } from 'vitest';
import {
  AgronomicSoilProcurementService,
  ISoilHealthInput,
  IFarmPlanningInput,
  IGroceryStockingInput
} from './agronomic-soil-procurement.service';

describe('AgronomicSoilProcurementService', () => {
  let service: AgronomicSoilProcurementService;

  beforeEach(() => {
    service = new AgronomicSoilProcurementService();
  });

  describe('evaluateSoilHealth', () => {
    it('should reward no-till, high fungal biomass, and cover crops with a high soil score and polyphenol boost', () => {
      const input: ISoilHealthInput = {
        soilOrganicMatterPct: 5.0,
        soilPh: 6.5,
        cationExchangeCapacity: 24.0,
        fungalToBacterialRatio: 1.3,
        tillageIntensity: 'NO_TILL',
        coverCropHistoryYears: 6
      };

      const result = service.evaluateSoilHealth(input);
      expect(result.regenerativeSoilScore).toBeGreaterThanOrEqual(75.0);
      expect(result.mycorrhizalGlomalinStabilityTier).toBe('HIGH_CARBON_STORAGE');
      expect(result.traceMineralBioavailabilityTier).toBe('OPTIMAL');
      expect(result.projectedCropPolyphenolBoostPct).toBeGreaterThan(20.0);
      expect(result.rhizobialNitrogenFixationCreditLbsAcre).toBeGreaterThan(120.0);
    });

    it('should detect degraded depleted soil under deep tillage and acid pH', () => {
      const input: ISoilHealthInput = {
        soilOrganicMatterPct: 1.0,
        soilPh: 5.0,
        cationExchangeCapacity: 7.0,
        fungalToBacterialRatio: 0.1,
        tillageIntensity: 'CONVENTIONAL_DEEP_TILL',
        coverCropHistoryYears: 0
      };

      const result = service.evaluateSoilHealth(input);
      expect(result.regenerativeSoilScore).toBeLessThan(45.0);
      expect(result.mycorrhizalGlomalinStabilityTier).toBe('DEPLETED');
      expect(result.edaphicAmendmentRecommendations.some(r => r.toLowerCase().includes('no-till'))).toBe(true);
      expect(result.edaphicAmendmentRecommendations.some(r => r.toLowerCase().includes('limestone'))).toBe(true);
    });
  });

  describe('planFarmCropPortfolio', () => {
    it('should generate open-pollinated seed procurement schedule and offtake estimates for diabetes priority', () => {
      const input: IFarmPlanningInput = {
        usdaHardinessZone: '6b',
        totalTillableAcres: 30.0,
        waterAvailability: 'MODERATE_IRRIGATION',
        targetCommunityHealthPriority: 'METABOLIC_DIABETES_REVERSAL'
      };

      const result = service.planFarmCropPortfolio(input);
      expect(result.recommendedCrops.length).toBeGreaterThanOrEqual(3);
      expect(result.recommendedCrops.some(c => c.botanicalFamily === 'Poaceae')).toBe(true);
      expect(result.recommendedCrops.some(c => c.botanicalFamily === 'Fabaceae')).toBe(true);
      expect(result.polycultureGuildRecommendation).toContain('Three Sisters');
      expect(result.estimatedClinicalOfftakeContracts).toContain('guaranteed');
    });

    it('should recommend inulin tubers and ancient grains for gut barrier priority', () => {
      const input: IFarmPlanningInput = {
        usdaHardinessZone: '7a',
        totalTillableAcres: 15.0,
        waterAvailability: 'MODERATE_IRRIGATION',
        targetCommunityHealthPriority: 'GUT_BARRIER_HEALTH'
      };

      const result = service.planFarmCropPortfolio(input);
      expect(result.recommendedCrops.some(c => c.cropName.includes('Artichoke') || c.cropName.includes('Sunchoke'))).toBe(true);
      expect(result.recommendedCrops.some(c => c.cropName.includes('Farro'))).toBe(true);
    });
  });

  describe('planGroceryStocking', () => {
    it('should calculate shelf quotas and verify 30+ botanical species target', () => {
      const input: IGroceryStockingInput = {
        storeType: 'COMMUNITY_COOP',
        weeklyShopperVolume: 1200,
        currentFreshProduceSkuCount: 38,
        refrigeratedShelfFootageLinearFt: 45.0
      };

      const result = service.planGroceryStocking(input);
      expect(result.microbiomeDiversityTargetMet).toBe(true);
      expect(result.recommendedProducePortfolio.length).toBe(4);
      expect(result.projectedSpoilageReductionPct).toBeGreaterThan(10.0);
      expect(result.foodAsMedicineVoucherCompatibility).toContain('COMPATIBLE');
    });
  });
});
