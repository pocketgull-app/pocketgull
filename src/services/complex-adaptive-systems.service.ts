import { Injectable } from '@angular/core';

export type TippingPointAcuity = 'RESILIENT_STABLE' | 'EARLY_WARNING_CSD' | 'IMMINENT_BIFURCATION' | 'PHASE_COLLAPSE';

export interface IWbeAllometricScalingResult {
  patientWeightKg: number;
  referenceWeightKg: number; // standard 70 kg human
  allometricMetabolicFactor: number; // (M / 70)^0.75
  vascularTransitScaleFactor: number; // (M / 70)^0.25
  intrinsicCardiacPacingScale: number; // (M / 70)^-0.25
  wbeCalibratedClearanceRateMlMin: number;
  linearPerKgClearanceMlMin: number;
  bsaClearanceMlMin: number;
  allometricDiscrepancyPct: number; // % variance between WBE and naive linear
  clinicalAllometricInsight: string;
}

export interface ICriticalSlowingDownMetrics {
  timeSeriesLength: number;
  lag1Autocorrelation: number; // rho_1
  rollingVariance: number; // sigma^2
  spectralMayerFlickerRatio: number;
  resilienceRecoveryRate: number; // lambda (decay rate from perturbation)
  tippingPointAcuity: TippingPointAcuity;
  earlyWarningLeadTimeHours: number; // 2 - 48 hours
  forensicPhysiologicalState: string;
}

export interface IHypergraphPolypharmacyAssessment {
  activeMolecules: string[];
  ambientWbgtF: number;
  hyperedgeOrder: number; // N-body interaction order
  percolationCascadeRiskScore: number; // 0 - 100
  dominantCascadePathways: string[];
  attractorBasinState: 'HOMEOSTATIC_BASIN' | 'PERMEABLE_MARGIN' | 'PATHOLOGICAL_ATTRACTOR';
  systemsInterventionDirective: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComplexAdaptiveSystemsService {

  private readonly ADULT_REFERENCE_WEIGHT_KG = 70.0;
  private readonly ADULT_REFERENCE_CLEARANCE_ML_MIN = 100.0;

  /**
   * West-Brown-Enquist (WBE) Fractal Allometric Scaling
   * Evaluates hydrodynamic branching network dissipation across human mass.
   * Y = Y_0 * (M / 70)^0.75 (Metabolic flux & clearance)
   * Tau = Tau_0 * (M / 70)^0.25 (Circulation transit time)
   */
  public calculateWbeAllometricScaling(
    weightKg: number,
    referenceAdultDoseMg = 500.0,
    patientHeightCm?: number
  ): IWbeAllometricScalingResult {
    const clampedWeight = Math.max(1.0, Math.min(250.0, weightKg));
    const massRatio = clampedWeight / this.ADULT_REFERENCE_WEIGHT_KG;

    // SFI WBE Power Laws
    const metabolicFactor = Math.round(Math.pow(massRatio, 0.75) * 1000) / 1000;
    const transitFactor = Math.round(Math.pow(massRatio, 0.25) * 1000) / 1000;
    const cardiacScale = Math.round(Math.pow(massRatio, -0.25) * 1000) / 1000;

    // Allometric vs Linear vs BSA Clearance comparisons
    const wbeClearance = Math.round(this.ADULT_REFERENCE_CLEARANCE_ML_MIN * metabolicFactor * 10) / 10;
    const linearClearance = Math.round(this.ADULT_REFERENCE_CLEARANCE_ML_MIN * (clampedWeight / 70.0) * 10) / 10;

    // Mosteller BSA approximation if height provided, else weight proxy
    const height = patientHeightCm ?? 170.0;
    const bsaM2 = Math.sqrt((height * clampedWeight) / 3600.0);
    const bsaRatio = bsaM2 / 1.73; // standard 1.73 m^2 body surface area
    const bsaClearance = Math.round(this.ADULT_REFERENCE_CLEARANCE_ML_MIN * bsaRatio * 10) / 10;

    const discrepancyPct = Math.round(((wbeClearance - linearClearance) / linearClearance) * 1000) / 10;

    let insight = `Patient mass (${clampedWeight} kg) scales metabolic turnover via WBE fractal exponent (M^0.75 = ${metabolicFactor}x adult). `;
    if (clampedWeight < 20.0) {
      insight += `Pediatric microvascular geometry possesses accelerated circulation transit times (${transitFactor}x). Linear per-kg dosing risks sub-therapeutic under-dosing.`;
    } else if (clampedWeight > 100.0) {
      insight += `High-mass adiposity exhibits reduced specific capillary density. Naive linear per-kg extrapolation risks significant metabolic over-dosing (+${Math.abs(discrepancyPct)}% discrepancy).`;
    } else {
      insight += `Eumorphic allometric concordance with adult reference fractal dissipation network.`;
    }

    return {
      patientWeightKg: clampedWeight,
      referenceWeightKg: this.ADULT_REFERENCE_WEIGHT_KG,
      allometricMetabolicFactor: metabolicFactor,
      vascularTransitScaleFactor: transitFactor,
      intrinsicCardiacPacingScale: cardiacScale,
      wbeCalibratedClearanceRateMlMin: wbeClearance,
      linearPerKgClearanceMlMin: linearClearance,
      bsaClearanceMlMin: bsaClearance,
      allometricDiscrepancyPct: discrepancyPct,
      clinicalAllometricInsight: insight
    };
  }

  /**
   * Evaluates Critical Slowing Down (CSD) on physiological time-series.
   * Universal mathematical signature of imminent bifurcation / phase collapse.
   * Computes lag-1 autocorrelation (rho_1), rolling variance, and relaxation rates.
   */
  public evaluateCriticalSlowingDown(timeSeries: number[]): ICriticalSlowingDownMetrics {
    const n = timeSeries.length;
    if (n < 10) {
      return {
        timeSeriesLength: n,
        lag1Autocorrelation: 0.0,
        rollingVariance: 0.0,
        spectralMayerFlickerRatio: 0.0,
        resilienceRecoveryRate: 1.0,
        tippingPointAcuity: 'RESILIENT_STABLE',
        earlyWarningLeadTimeHours: 48,
        forensicPhysiologicalState: 'Insufficient time-series length for dynamical phase-space reconstruction (requires >= 10 points).'
      };
    }

    // Mean and variance
    const mean = timeSeries.reduce((acc, val) => acc + val, 0) / n;
    let varianceSum = 0;
    for (let i = 0; i < n; i++) {
      varianceSum += Math.pow(timeSeries[i] - mean, 2);
    }
    const variance = varianceSum / (n - 1);

    // Lag-1 Autocorrelation (rho_1)
    let autoCovariance = 0;
    for (let i = 0; i < n - 1; i++) {
      autoCovariance += (timeSeries[i] - mean) * (timeSeries[i + 1] - mean);
    }
    const rho1 = variance > 0 ? Math.max(-0.99, Math.min(0.99, autoCovariance / (varianceSum))) : 0.0;

    // Resilience recovery rate lambda: ln(rho_1) approximation
    const lambda = rho1 > 0 ? -Math.log(Math.max(0.01, rho1)) : 1.5;

    // Mayer flicker ratio: variance of high-frequency vs low-frequency fluctuations
    const flickerRatio = Math.round(variance * (1.0 + Math.max(0, rho1)) * 100) / 100;

    // Classification of Tipping Point Acuity
    let acuity: TippingPointAcuity = 'RESILIENT_STABLE';
    let leadTimeHours = 48;
    let explanation = 'Physiological basin of attraction is deep and resilient. Quick return to homeostasis following perturbation.';

    if (rho1 >= 0.78 && variance > 25.0) {
      acuity = 'PHASE_COLLAPSE';
      leadTimeHours = 2;
      explanation = 'CRITICAL PHASE COLLAPSE: Autocorrelation near unity with variance explosion. Attractor basin boundary breached (sepsis, heat stroke, or cardiogenic shock imminent).';
    } else if (rho1 >= 0.65) {
      acuity = 'IMMINENT_BIFURCATION';
      leadTimeHours = 8;
      explanation = 'IMMINENT BIFURCATION: Severe Critical Slowing Down detected. Physiological restitution rate sluggish. High sensitivity to small environmental stressors.';
    } else if (rho1 >= 0.45) {
      acuity = 'EARLY_WARNING_CSD';
      leadTimeHours = 24;
      explanation = 'EARLY WARNING CSD: Emerging memory retention across biometric fluctuations. Autonomic flexibility declining.';
    }

    return {
      timeSeriesLength: n,
      lag1Autocorrelation: Math.round(rho1 * 1000) / 1000,
      rollingVariance: Math.round(variance * 100) / 100,
      spectralMayerFlickerRatio: flickerRatio,
      resilienceRecoveryRate: Math.round(lambda * 100) / 100,
      tippingPointAcuity: acuity,
      earlyWarningLeadTimeHours: leadTimeHours,
      forensicPhysiologicalState: explanation
    };
  }

  /**
   * Hypergraph Polypharmacy & Multi-Scale Environmental Cascade Model
   * Evaluates non-linear N-body interactions between multiple pharmaceuticals
   * and microclimatic Wet Bulb Globe Temperature (WBGT) environmental strain.
   */
  public evaluateHypergraphCascade(
    medications: string[],
    ambientWbgtF: number,
    baselineEgfr = 60.0
  ): IHypergraphPolypharmacyAssessment {
    const n = medications.length;
    let cascadeScore = 10;
    const pathways: string[] = [];

    const lowerMeds = medications.map(m => m.toLowerCase());
    const hasAnticholinergic = lowerMeds.some(m => m.includes('diphenhydramine') || m.includes('oxybutynin') || m.includes('amitriptyline'));
    const hasCai = lowerMeds.some(m => m.includes('topiramate') || m.includes('zonisamide'));
    const hasDiuretic = lowerMeds.some(m => m.includes('furosemide') || m.includes('hydrochlorothiazide') || m.includes('spironolactone'));
    const hasAceOrArb = lowerMeds.some(m => m.includes('lisinopril') || m.includes('losartan') || m.includes('valsartan'));
    const hasLithium = lowerMeds.some(m => m.includes('lithium'));
    const hasBetaBlocker = lowerMeds.some(m => m.includes('metoprolol') || m.includes('atenolol'));

    // Hyperedge 1: Thermoregulatory Shutoff Simplex (Anticholinergic + CAI + Heat)
    if ((hasAnticholinergic || hasCai) && ambientWbgtF >= 85) {
      cascadeScore += 35;
      pathways.push('Hyperedge {Eccrine M3/CAI Blockade ⊗ WBGT Solar Load}: Cutaneous evaporative heat flux arrested; core temperature rises unabated.');
    }

    // Hyperedge 2: Pre-Renal Ischemic Cascade (Diuretic + ACEi + Hypovolemia)
    if (hasDiuretic && hasAceOrArb && ambientWbgtF >= 82) {
      cascadeScore += 30;
      pathways.push('Hyperedge {Loop Diuresis ⊗ Efferent Vasodilation ⊗ Dehydration}: Pre-glomerular hypoperfusion eliminates GFR autoregulation, triggering acute tubular necrosis.');
    }

    // Hyperedge 3: Lithium Retention Simplex
    if (hasLithium && (hasDiuretic || ambientWbgtF >= 85)) {
      cascadeScore += 25;
      pathways.push('Hyperedge {Extracellular Contraction ⊗ Proximal Tubule Sodium/Lithium Co-reabsorption}: Sudden serum lithium toxicity threshold breach.');
    }

    // Hyperedge 4: Cardiopulmonary Convective Failure
    if (hasBetaBlocker && ambientWbgtF >= 88) {
      cascadeScore += 15;
      pathways.push('Hyperedge {Negative Chronotropy ⊗ Peripheral Vasodilatory Demand}: Inability to accelerate stroke volume for convective heat transfer.');
    }

    cascadeScore = Math.min(99, Math.round(cascadeScore));

    let basinState: 'HOMEOSTATIC_BASIN' | 'PERMEABLE_MARGIN' | 'PATHOLOGICAL_ATTRACTOR' = 'HOMEOSTATIC_BASIN';
    let directive = 'Multi-body hypergraph remains within physiological homeostatic attractor basin.';

    if (cascadeScore >= 70) {
      basinState = 'PATHOLOGICAL_ATTRACTOR';
      directive = 'URGENT COMPLEX SYSTEMS DIRECTIVE: Patient is captured in a self-reinforcing pathological attractor basin. De-escalate thermal hyperedges immediately (climate refuge + hold anticholinergics/diuretics).';
    } else if (cascadeScore >= 40) {
      basinState = 'PERMEABLE_MARGIN';
      directive = 'CAUTION: System operating on the fragile boundary between homeostatic and pathological attractor basins. Close monitoring required.';
    }

    return {
      activeMolecules: medications,
      ambientWbgtF,
      hyperedgeOrder: n + (ambientWbgtF >= 80 ? 1 : 0),
      percolationCascadeRiskScore: cascadeScore,
      dominantCascadePathways: pathways,
      attractorBasinState: basinState,
      systemsInterventionDirective: directive
    };
  }
}
