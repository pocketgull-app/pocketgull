import { TestBed } from '@angular/core/testing';
import {
  ComplexAdaptiveSystemsService,
  IWbeAllometricScalingResult,
  ICriticalSlowingDownMetrics,
  IHypergraphPolypharmacyAssessment
} from './complex-adaptive-systems.service';

describe('ComplexAdaptiveSystemsService', () => {
  let service: ComplexAdaptiveSystemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ComplexAdaptiveSystemsService]
    });
    service = TestBed.inject(ComplexAdaptiveSystemsService);
  });

  describe('1. West-Brown-Enquist (WBE) Fractal Allometric Scaling', () => {
    it('accurately reproduces reference 70kg adult scaling parameters with zero discrepancy', () => {
      const res: IWbeAllometricScalingResult = service.calculateWbeAllometricScaling(70.0);

      expect(res.patientWeightKg).toBe(70.0);
      expect(res.allometricMetabolicFactor).toBe(1.0);
      expect(res.vascularTransitScaleFactor).toBe(1.0);
      expect(res.intrinsicCardiacPacingScale).toBe(1.0);
      expect(res.wbeCalibratedClearanceRateMlMin).toBe(100.0);
      expect(res.linearPerKgClearanceMlMin).toBe(100.0);
      expect(res.allometricDiscrepancyPct).toBe(0.0);
      expect(res.clinicalAllometricInsight).toContain('Eumorphic allometric concordance');
    });

    it('demonstrates pediatric accelerated microvascular transit and prevents linear under-dosing', () => {
      // 10 kg infant / toddler
      const res: IWbeAllometricScalingResult = service.calculateWbeAllometricScaling(10.0, 500.0, 75.0);

      expect(res.patientWeightKg).toBe(10.0);
      // M^0.75 scaling factor: (10/70)^0.75 ≈ 0.232
      expect(res.allometricMetabolicFactor).toBeCloseTo(0.232, 2);
      // M^0.25 transit factor: (10/70)^0.25 ≈ 0.615
      expect(res.vascularTransitScaleFactor).toBeLessThan(1.0);
      // M^-0.25 cardiac pacing scale: (10/70)^-0.25 ≈ 1.625 (faster heart rate)
      expect(res.intrinsicCardiacPacingScale).toBeGreaterThan(1.0);

      // WBE clearance (~23.2 mL/min) is significantly higher than naive linear (100 * 10/70 = 14.3 mL/min)
      expect(res.wbeCalibratedClearanceRateMlMin).toBeGreaterThan(res.linearPerKgClearanceMlMin);
      expect(res.allometricDiscrepancyPct).toBeGreaterThan(50.0);
      expect(res.clinicalAllometricInsight).toContain('sub-therapeutic under-dosing');
    });

    it('flags reduced capillary density in high-mass obesity to prevent linear over-dosing', () => {
      // 140 kg patient (2x reference weight)
      const res: IWbeAllometricScalingResult = service.calculateWbeAllometricScaling(140.0);

      expect(res.patientWeightKg).toBe(140.0);
      // M^0.75: (140/70)^0.75 = 2^0.75 ≈ 1.682
      expect(res.allometricMetabolicFactor).toBeCloseTo(1.682, 2);

      // WBE clearance (~168.2 mL/min) is lower than naive linear (200.0 mL/min)
      expect(res.wbeCalibratedClearanceRateMlMin).toBeLessThan(res.linearPerKgClearanceMlMin);
      expect(res.allometricDiscrepancyPct).toBeLessThan(0.0);
      expect(res.clinicalAllometricInsight).toContain('over-dosing');
    });

    it('clamps boundary weights safely to prevent numerical instabilities', () => {
      const underflow = service.calculateWbeAllometricScaling(-5.0);
      expect(underflow.patientWeightKg).toBe(1.0);

      const overflow = service.calculateWbeAllometricScaling(400.0);
      expect(overflow.patientWeightKg).toBe(250.0);
    });
  });

  describe('2. Critical Slowing Down (CSD) Dynamical Phase Space', () => {
    it('returns resilient stable state when time-series has fewer than 10 points', () => {
      const shortSeries = [72, 74, 73, 75];
      const res: ICriticalSlowingDownMetrics = service.evaluateCriticalSlowingDown(shortSeries);

      expect(res.tippingPointAcuity).toBe('RESILIENT_STABLE');
      expect(res.earlyWarningLeadTimeHours).toBe(48);
      expect(res.forensicPhysiologicalState).toContain('Insufficient time-series length');
    });

    it('classifies white-noise homeostatic physiological fluctuations as RESILIENT_STABLE', () => {
      // Alternating/uncorrelated vitals centered around 72 bpm
      const stableSeries = [72, 70, 74, 71, 73, 69, 75, 71, 73, 70, 72, 74, 71, 73];
      const res: ICriticalSlowingDownMetrics = service.evaluateCriticalSlowingDown(stableSeries);

      expect(res.lag1Autocorrelation).toBeLessThan(0.45);
      expect(res.tippingPointAcuity).toBe('RESILIENT_STABLE');
      expect(res.earlyWarningLeadTimeHours).toBe(48);
      expect(res.forensicPhysiologicalState).toContain('basin of attraction is deep and resilient');
    });

    it('detects EARLY_WARNING_CSD when lag-1 autocorrelation begins to inflate (rho_1 >= 0.45)', () => {
      // Moderate autocorrelation: smoothed upward drift with memory
      const series = [60, 61, 62, 63, 65, 66, 68, 69, 71, 73, 74, 76, 78, 80, 81, 83];
      const res: ICriticalSlowingDownMetrics = service.evaluateCriticalSlowingDown(series);

      expect(res.lag1Autocorrelation).toBeGreaterThanOrEqual(0.45);
      expect(['EARLY_WARNING_CSD', 'IMMINENT_BIFURCATION', 'PHASE_COLLAPSE']).toContain(res.tippingPointAcuity);
    });

    it('flags IMMINENT_BIFURCATION when autocorrelation exceeds 0.65', () => {
      // High autocorrelation: smooth slow sinusoidal drift with persistent memory (sluggish restitution)
      const sluggishSeries: number[] = [];
      for (let i = 0; i < 30; i++) {
        const val = 80 + 15 * Math.sin((i / 30.0) * Math.PI * 2);
        sluggishSeries.push(Math.round(val * 10) / 10);
      }
      const res: ICriticalSlowingDownMetrics = service.evaluateCriticalSlowingDown(sluggishSeries);

      expect(res.lag1Autocorrelation).toBeGreaterThanOrEqual(0.65);
      expect(['IMMINENT_BIFURCATION', 'PHASE_COLLAPSE']).toContain(res.tippingPointAcuity);
      expect(res.earlyWarningLeadTimeHours).toBeLessThanOrEqual(8);
    });

    it('flags PHASE_COLLAPSE when autocorrelation approaches unity with variance explosion', () => {
      // Severe critical slowing down with huge variance swings (e.g. septic / heat shock collapse)
      const collapseSeries = [
        60, 62, 65, 70, 78, 88, 102, 118, 135, 150, 162, 170, 168, 155, 138, 120, 100, 80, 65, 52
      ];
      const res: ICriticalSlowingDownMetrics = service.evaluateCriticalSlowingDown(collapseSeries);

      expect(res.lag1Autocorrelation).toBeGreaterThanOrEqual(0.78);
      expect(res.rollingVariance).toBeGreaterThan(25.0);
      expect(res.tippingPointAcuity).toBe('PHASE_COLLAPSE');
      expect(res.earlyWarningLeadTimeHours).toBe(2);
      expect(res.forensicPhysiologicalState).toContain('CRITICAL PHASE COLLAPSE');
    });
  });

  describe('3. Hypergraph Polypharmacy Simplicial Cascade Model', () => {
    it('identifies safe homeostatic attractor basin for inert or monotherapy regimens at normal temperatures', () => {
      const meds = ['Multivitamin', 'Acetaminophen 500mg'];
      const res: IHypergraphPolypharmacyAssessment = service.evaluateHypergraphCascade(meds, 75.0);

      expect(res.attractorBasinState).toBe('HOMEOSTATIC_BASIN');
      expect(res.percolationCascadeRiskScore).toBeLessThan(40);
      expect(res.dominantCascadePathways.length).toBe(0);
      expect(res.systemsInterventionDirective).toContain('homeostatic attractor basin');
    });

    it('detects thermoregulatory shutoff hyperedge under extreme heat for anticholinergic/CAI combinations', () => {
      const meds = ['Oxybutynin 10mg', 'Topiramate 50mg'];
      const res: IHypergraphPolypharmacyAssessment = service.evaluateHypergraphCascade(meds, 92.0);

      expect(res.dominantCascadePathways.some(p => p.includes('Eccrine M3/CAI Blockade'))).toBe(true);
      expect(res.percolationCascadeRiskScore).toBeGreaterThanOrEqual(40);
    });

    it('detects pre-renal ischemic cascade hyperedge (Diuretic + ACEi + Heat)', () => {
      const meds = ['Furosemide 40mg', 'Lisinopril 20mg'];
      const res: IHypergraphPolypharmacyAssessment = service.evaluateHypergraphCascade(meds, 86.0);

      expect(res.dominantCascadePathways.some(p => p.includes('Loop Diuresis ⊗ Efferent Vasodilation'))).toBe(true);
      expect(res.percolationCascadeRiskScore).toBeGreaterThanOrEqual(40);
    });

    it('detects lithium retention simplex under dehydration and diuretic load', () => {
      const meds = ['Lithium Carbonate 300mg', 'Hydrochlorothiazide 25mg'];
      const res: IHypergraphPolypharmacyAssessment = service.evaluateHypergraphCascade(meds, 88.0);

      expect(res.dominantCascadePathways.some(p => p.includes('Lithium Co-reabsorption'))).toBe(true);
      expect(res.percolationCascadeRiskScore).toBeGreaterThanOrEqual(35);
    });

    it('identifies PATHOLOGICAL_ATTRACTOR state when multiple thermal-pharmacological hyperedges converge', () => {
      const multimorbidMeds = [
        'Diphenhydramine 50mg',
        'Furosemide 40mg',
        'Lisinopril 20mg',
        'Lithium Carbonate 300mg',
        'Metoprolol 50mg'
      ];
      // Phoenix 115°F extreme heat with high WBGT
      const res: IHypergraphPolypharmacyAssessment = service.evaluateHypergraphCascade(multimorbidMeds, 94.0);

      expect(res.attractorBasinState).toBe('PATHOLOGICAL_ATTRACTOR');
      expect(res.percolationCascadeRiskScore).toBeGreaterThanOrEqual(70);
      expect(res.dominantCascadePathways.length).toBeGreaterThanOrEqual(3);
      expect(res.systemsInterventionDirective).toContain('URGENT COMPLEX SYSTEMS DIRECTIVE');
    });
  });
});
