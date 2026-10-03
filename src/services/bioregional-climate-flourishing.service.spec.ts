import { describe, it, expect, beforeEach } from 'vitest';
import {
  BioregionalClimateFlourishingService,
  IBioregionalClimateInput,
  IFoodshedCarbonInput,
  INativeBiodiversityInput
} from './bioregional-climate-flourishing.service';

describe('BioregionalClimateFlourishingService', () => {
  let service: BioregionalClimateFlourishingService;

  beforeEach(() => {
    service = new BioregionalClimateFlourishingService();
  });

  describe('evaluateBioregionalClimate', () => {
    it('should project wildfire days and passive cooling potential in Cascadia', () => {
      const input: IBioregionalClimateInput = {
        ecoregionId: 'PACIFIC_NORTHWEST_CASCADIA',
        urbanTreeCanopyCoveragePct: 35.0,
        ambientElevationMeters: 120.0,
        airConditioningType: 'HEAT_PUMP',
        knownRespiratoryCardiacVulnerability: false
      };

      const result = service.evaluateBioregionalClimate(input);
      expect(['LOW_RESILIENT', 'MODERATE_VIGILANCE']).toContain(result.cardiovascularHeatStrainTier);
      expect(result.projectedWildfireSmokePm25Days).toBe(16);
      expect(result.passiveCoolingPotentialPct).toBeGreaterThan(40.0);
      expect(result.climateResiliencePrescriptions.some(r => r.toLowerCase().includes('merv-13'))).toBe(true);
    });

    it('should flag severe heat stress in low-canopy arid desert climates', () => {
      const input: IBioregionalClimateInput = {
        ecoregionId: 'SONORAN_DESERT',
        urbanTreeCanopyCoveragePct: 10.0,
        ambientElevationMeters: 300.0,
        airConditioningType: 'NONE_PASSIVE',
        knownRespiratoryCardiacVulnerability: true
      };

      const result = service.evaluateBioregionalClimate(input);
      expect(result.cardiovascularHeatStrainTier).toBe('SEVERE_HEAT_STRESS');
      expect(result.projectedDangerousWetBulbDaysYearly).toBeGreaterThan(15);
      expect(result.climateResiliencePrescriptions.some(r => r.toLowerCase().includes('cross-ventilation'))).toBe(true);
    });
  });

  describe('calculateFoodshedCarbonDrawdown', () => {
    it('should quantify household CO2e avoidance and supported regenerative acreage', () => {
      const input: IFoodshedCarbonInput = {
        householdAdultsCount: 2,
        percentProduceFromLocalFarmsCsa: 40.0,
        ancestralPlantRichDaysPerWeek: 5,
        backyardOrCommunityGardenSqFt: 250.0
      };

      const result = service.calculateFoodshedCarbonDrawdown(input);
      expect(result.householdDietaryCo2eAvoidanceKgYr).toBeGreaterThan(1000.0);
      expect(result.acresOfRegenerativeSoilSustained).toBeGreaterThan(0.4);
      expect(result.soilCarbonDrawdownContributionLbsYr).toBeGreaterThan(1500.0);
      expect(result.planetaryHealthMilestones.length).toBe(3);
    });
  });

  describe('evaluateNativeBiodiversity', () => {
    it('should recommend regional keystone plant guilds and calculate cortisol drop for 120+ min nature immersion', () => {
      const input: INativeBiodiversityInput = {
        ecoregionId: 'PACIFIC_NORTHWEST_CASCADIA',
        outdoorSpaceType: 'SUBURBAN_YARD',
        weeklyNatureImmersionMinutes: 140
      };

      const result = service.evaluateNativeBiodiversity(input);
      expect(result.biophilicNatureConnectionTier).toBe('RESTORED_EQUILIBRIUM');
      expect(result.projectedSalivaryCortisolReductionPct).toBeGreaterThanOrEqual(20.0);
      expect(result.recommendedKeystonePlants.length).toBeGreaterThanOrEqual(2);
      expect(result.recommendedKeystonePlants.some(p => p.botanicalName.includes('Quercus'))).toBe(true);
      expect(result.biocentricActionCompass.toLowerCase()).toContain('active hope');
    });
  });
});
