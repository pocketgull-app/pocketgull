import { SovereigntyHealthModelsService } from './sovereignty-health-models.service';

describe('SovereigntyHealthModelsService - Quantitative Health Models', () => {
  let service: SovereigntyHealthModelsService;

  beforeEach(() => {
    service = new SovereigntyHealthModelsService();
  });

  describe('1. PCOS Rotterdam Phenotyper & HOMA-IR', () => {
    it('identifies classic Phenotype A and calculates elevated HOMA-IR', () => {
      service.setPcosLabs(95, 15, 62, 28);
      const res = service.pcosEvaluation();
      expect(res.phenotype).toBe('Phenotype A (Full/Classic)');
      expect(res.insulinResistanceDetected).toBe(true);
      expect(res.homaIrScore).toBeGreaterThanOrEqual(2.0);
      expect(res.recommendedNutraceuticalRegimen.some(r => r.includes('Myo-Inositol'))).toBe(true);
    });

    it('identifies Phenotype D (non-hyperandrogenic) when androgens are normal', () => {
      service.hasClinicalHyperandrogenism.set(false);
      service.setPcosLabs(85, 6, 22, 55); // Total T = 22 ng/dL, normal
      const res = service.pcosEvaluation();
      expect(res.phenotype).toBe('Phenotype D (Non-Hyperandrogenic)');
    });
  });

  describe('2. Endometriosis Pelvic Pain Index (EPI)', () => {
    it('flags high suspicion for deep endometriosis when multi-catamenial symptoms and NSAID resistance are present', () => {
      service.setEndoPain(9, true, true, true);
      const res = service.endometriosisEvaluation();
      expect(res.riskTier).toContain('High Suspicion');
      expect(res.probabilityScorePercent).toBeGreaterThanOrEqual(70);
      expect(res.catamenialSymptomsPresent.length).toBeGreaterThanOrEqual(2);
      expect(res.recommendedClinicalAction).toContain('minimally invasive gynecologic surgery');
    });
  });

  describe('3. Princeton III Endothelial-Cardiovascular CAD Risk Calculator', () => {
    it('calculates elevated CAD risk when severe ED is paired with high ApoB and hs-CRP', () => {
      service.setCadRiskInputs(8, 130, 3.5, 145);
      const res = service.princetonCadEvaluation();
      expect(res.endothelialImpairmentGrade).toBe('Severe Microvascular Disease');
      expect(res.estimated10YearCadRiskPercent).toBeGreaterThan(15);
      expect(res.recommendedImagingWorkup.some(w => w.includes('Coronary Artery Calcium'))).toBe(true);
    });
  });

  describe('4. PSA Density & Biopsy Avoidance Triage', () => {
    it('safely avoids blind biopsy when PSA elevation is explained by large prostate volume (low density)', () => {
      // PSA 4.8, volume 55 cc -> density 0.087 (<0.15)
      service.setPsaTriage(4.8, 20, 55);
      const res = service.psaDensityTriage();
      expect(res.psaDensityNgMlCm3).toBeLessThan(0.15);
      expect(res.unnecessaryBiopsyAvoidable).toBe(true);
      expect(res.recommendation).toContain('Invasive biopsy can be safely avoided');
    });

    it('triggers mpMRI indication when PSA density is elevated', () => {
      // PSA 7.5, volume 30 cc -> density 0.25 (>=0.15)
      service.setPsaTriage(7.5, 11, 30);
      const res = service.psaDensityTriage();
      expect(res.psaDensityNgMlCm3).toBeGreaterThanOrEqual(0.15);
      expect(res.mpMriPiRadsIndicated).toBe(true);
      expect(res.recommendation).toContain('multiparametric MRI (mpMRI)');
    });
  });

  describe('5. In Silico GAHT Pharmacokinetics Simulator', () => {
    it('simulates daily concentrations across injection cycle and warns on excessive fluctuation', () => {
      // 14-day interval creates severe fluctuation
      service.setGahtRegimen('Estradiol Valerate (IM/SubQ)', 8, 14);
      const sim = service.gahtPkSimulation();
      expect(sim.simulatedCurve.length).toBeGreaterThan(10);
      expect(sim.peakConcentration).toBeGreaterThan(sim.troughConcentration);
      expect(sim.peakTroughFluctuationPercent).toBeGreaterThan(180);
      expect(sim.clinicalOptimizationAdvice).toContain('Consider shortening interval');
    });

    it('confirms smooth steady state on shorter 5-7 day intervals', () => {
      service.setGahtRegimen('Estradiol Cypionate (IM/SubQ)', 3, 7);
      const sim = service.gahtPkSimulation();
      expect(sim.steadyStateAdequate).toBe(true);
    });
  });

  describe('6. Secondary Erythrocytosis Forecaster', () => {
    it('predicts critical trajectory and phlebotomy requirement when hematocrit reaches threshold', () => {
      service.setErythrocytosisInputs(43, 54, 8, 100, true);
      const res = service.erythrocytosisTrajectory();
      expect(res.phlebotomyOrHoldIndicated).toBe(true);
      expect(res.clinicalRecommendation).toContain('CRITICAL');
      expect(res.hypoxiaOrApneaScreeningIndicated).toBe(true);
    });
  });
});
