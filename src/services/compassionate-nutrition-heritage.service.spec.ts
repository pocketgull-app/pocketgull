import { CompassionateNutritionHeritageService, CANONICAL_HERITAGE_SWAPS } from './compassionate-nutrition-heritage.service';

describe('CompassionateNutritionHeritageService - Ancestral Foodways & Gut Barrier Suite', () => {
  let service: CompassionateNutritionHeritageService;

  beforeEach(() => {
    service = new CompassionateNutritionHeritageService();
  });

  describe('1. Cultural Heritage Swaps', () => {
    it('initializes with African Heritage ancestral swaps', () => {
      expect(service.selectedTradition()).toBe('AFRICAN_HERITAGE');
      const swaps = service.activeHeritageSwaps();
      expect(swaps.length).toBeGreaterThan(0);
      expect(swaps[0].nourishingWholeFoodSwap).toContain('Fonio');
      expect(swaps[0].glycemicImpactReductionPercent).toBeGreaterThanOrEqual(40);
    });

    it('switches tradition cleanly to Mesoamerican and Indigenous Turtle Island', () => {
      service.setTradition('LATINO_MESOAMERICAN');
      expect(service.activeHeritageSwaps()[0].nourishingWholeFoodSwap).toContain('Nixtamalized');

      service.setTradition('INDIGENOUS_TURTLE_ISLAND');
      expect(service.activeHeritageSwaps()[0].nourishingWholeFoodSwap).toContain('Three Sisters');
    });
  });

  describe('2. Gut Mucosal Barrier & SCFA Butyrate Assessment', () => {
    it('evaluates peak protective butyrate when plant diversity and resistant starch are high', () => {
      service.updateIntake(32, 2, 4, false); // 32 species, 2 ferments, 4 starch, no symptoms
      const assessment = service.gutBarrierAssessment();

      expect(assessment.estimatedZonulinRisk).toBe('Low (Intact Mucosa)');
      expect(assessment.butyrateSynthesizingCapacity).toBe('Peak Protective');
      expect(assessment.dailyFermentableFiberGrams).toBeGreaterThanOrEqual(35);
    });

    it('flags elevated leaky gut risk and recommends mucosal tightening when symptoms and low plant diversity are present', () => {
      service.updateIntake(10, 0, 1, true); // 10 species, 0 ferments, 1 starch, with symptoms
      const assessment = service.gutBarrierAssessment();

      expect(assessment.estimatedZonulinRisk).toBe('Elevated (Leaky Gut Risk)');
      expect(assessment.butyrateSynthesizingCapacity).toBe('Sub-Optimal');
      expect(assessment.clinicalActionPlan.some(a => a.includes('bone broth'))).toBe(true);
    });
  });
});
