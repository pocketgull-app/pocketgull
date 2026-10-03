import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export type AcidBasePrimaryDisorder =
  | 'Normal Acid-Base Homeostasis'
  | 'High Anion Gap Metabolic Acidosis (HAGMA)'
  | 'Normal Anion Gap Metabolic Acidosis (NAGMA / Hyperchloremic)'
  | 'Metabolic Alkalosis'
  | 'Respiratory Acidosis'
  | 'Respiratory Alkalosis'
  | 'Mixed Complex Acid-Base Disorder';

export type DeltaRatioInterpretation =
  | 'Pure NAGMA (< 0.4)'
  | 'Mixed HAGMA and NAGMA (0.4 - 0.8)'
  | 'Pure HAGMA (0.8 - 2.0)'
  | 'Mixed HAGMA and Metabolic Alkalosis (> 2.0)'
  | 'Not Applicable (Normal AG)';

export interface IWintersCompensationResult {
  expectedPco2Min: number;
  expectedPco2Max: number;
  measuredPco2: number;
  respiratoryStatus: 'Adequate Compensation' | 'Concomitant Respiratory Acidosis (Hypoventilation)' | 'Concomitant Respiratory Alkalosis (Hyperventilation)';
}

export interface IStewartParameters {
  sida: number; // Apparent Strong Ion Difference (mEq/L)
  side: number; // Effective Strong Ion Difference (mEq/L)
  sig: number;  // Strong Ion Gap (mEq/L)
  atot: number; // Total Non-Volatile Weak Acids (mEq/L)
  unmeasuredAnionsPresent: boolean;
  hyperchloremicAcidosisRisk: boolean;
}

export interface IFluidPrescriptionGuideline {
  preferredFluid: 'Balanced Crystalloid (Plasma-Lyte 148 / Lactated Ringer\'s)' | '0.9% Normal Saline (Indicated for hypochloremic alkalosis)' | 'Dextrose in Water (Free Water Replacement)';
  chlorideContentMeqL: number;
  fluidSid: number;
  clinicalRationale: string;
  renalPerfusionImpact: 'Renoprotective (Maintains Renal Arterial Flow)' | 'Vasoconstrictive (Hyperchloremia reduces GFR)';
}

export interface IHyperkalemiaActionPlan {
  severity: 'Normal (3.5 - 5.0)' | 'Mild (5.1 - 5.9)' | 'Moderate (6.0 - 6.4)' | 'Severe / Emergent (>= 6.5)';
  membraneStabilizationRequired: boolean;
  intracellularShiftRequired: boolean;
  potassiumEliminationRequired: boolean;
  orders: string[];
}

export interface IStewartAcidBaseAssessment {
  timestamp: string;
  ph: number;
  pco2: number;
  bicarbonate: number;
  anionGapObserved: number;
  anionGapCorrected: number;
  primaryDisorder: AcidBasePrimaryDisorder;
  deltaRatio: number;
  deltaRatioInterpretation: DeltaRatioInterpretation;
  wintersCompensation: IWintersCompensationResult | null;
  stewart: IStewartParameters;
  fluidGuideline: IFluidPrescriptionGuideline;
  hyperkalemiaPlan: IHyperkalemiaActionPlan;
}

@Injectable({
  providedIn: 'root'
})
export class AcidBaseStewartService {
  private patientState = (() => { try { return inject(PatientStateService); } catch { return null; } })();

  // Reactive clinical inputs
  readonly ph = signal<number>(7.40);
  readonly pco2 = signal<number>(40.0); // mmHg
  readonly sodium = signal<number>(140.0); // mEq/L
  readonly potassium = signal<number>(4.0); // mEq/L
  readonly chloride = signal<number>(102.0); // mEq/L
  readonly bicarbonate = signal<number>(24.0); // mEq/L
  readonly lactate = signal<number>(1.0); // mmol/L
  readonly albumin = signal<number>(4.0); // g/dL
  readonly phosphate = signal<number>(3.5); // mg/dL
  readonly calcium = signal<number>(9.2); // mg/dL
  readonly magnesium = signal<number>(2.0); // mg/dL

  constructor() {
    // Optional integration with PatientStateService
    if (this.patientState) {
      try {
        const vitals = typeof this.patientState.vitals === 'function' ? this.patientState.vitals() : null;
        const cmp = vitals?.cmpLabs;
        if (cmp) {
          if (cmp.sodium) this.sodium.set(parseFloat(cmp.sodium) || 140);
          if (cmp.potassium) this.potassium.set(parseFloat(cmp.potassium) || 4.0);
          if (cmp.chloride) this.chloride.set(parseFloat(cmp.chloride) || 102);
          if (cmp.bicarbonate) this.bicarbonate.set(parseFloat(cmp.bicarbonate) || 24);
          if (cmp.albumin) this.albumin.set(parseFloat(cmp.albumin) || 4.0);
        }
      } catch {
        // Safe fallback
      }
    }
  }

  // --- Pure Domain Calculators ---

  /**
   * Apparent Strong Ion Difference (SIDa in mEq/L)
   * SIDa = (Na+ + K+ + Ca2+ + Mg2+) - (Cl- + Lactate-)
   * Standard clinical simplification: (Na+ + K+) - (Cl- + Lactate-)
   * Normal range: 40 - 44 mEq/L
   */
  public calculateSida(
    na: number,
    k: number,
    cl: number,
    lactate: number,
    caMgInclude: boolean = true,
    caMgMeq: number = 4.0
  ): number {
    const baseCations = na + k + (caMgInclude ? caMgMeq : 0);
    const strongAnions = cl + lactate;
    return Math.round((baseCations - strongAnions) * 10) / 10;
  }

  /**
   * Total Non-Volatile Weak Acids (Atot in mEq/L)
   * Atot = 2.8 * Albumin(g/dL) + 0.6 * Phosphate(mg/dL)
   */
  public calculateAtot(albumin: number, phosphate: number): number {
    const val = 2.8 * albumin + 0.6 * phosphate;
    return Math.round(val * 10) / 10;
  }

  /**
   * Effective Strong Ion Difference (SIDe in mEq/L)
   * SIDe = HCO3- + [Albumin-] + [Phosphate-]
   * Normal range: 38 - 42 mEq/L
   */
  public calculateSide(ph: number, hco3: number, albumin: number, phosphate: number): number {
    // Exact physical chemistry dissociation models:
    // [Albumin-] = Alb(g/dL) * (0.123 * pH - 0.631) * 10
    // [Phosphate-] = Phos(mg/dL) * (0.309 * pH - 0.469) * (10 / 3.1)
    const albCharge = albumin * (0.123 * ph - 0.631) * 10;
    const phosCharge = phosphate * (0.309 * ph - 0.469) * (1.0 / 3.097);
    const side = hco3 + Math.max(0, albCharge) + Math.max(0, phosCharge);
    return Math.round(side * 10) / 10;
  }

  /**
   * Strong Ion Gap (SIG in mEq/L)
   * SIG = SIDa - SIDe
   * Normal range: 0 +/- 2 mEq/L. SIG > 2 indicates unmeasured anions.
   */
  public calculateSig(sida: number, side: number): number {
    return Math.round((sida - side) * 10) / 10;
  }

  /**
   * Albumin-Corrected Anion Gap (Figge-Jabor-Kazda-Fencl equation)
   * AG_corr = AG_obs + 2.5 * (4.0 - Albumin)
   */
  public calculateCorrectedAnionGap(na: number, cl: number, hco3: number, albumin: number): {
    observedAg: number;
    correctedAg: number;
  } {
    const observedAg = na - (cl + hco3);
    const correctedAg = observedAg + 2.5 * (4.0 - albumin);
    return {
      observedAg: Math.round(observedAg * 10) / 10,
      correctedAg: Math.round(correctedAg * 10) / 10
    };
  }

  /**
   * Delta-Delta Ratio for Mixed Acid-Base Assessment
   * Delta AG = AG_corr - 12
   * Delta HCO3 = 24 - HCO3
   * Ratio = Delta AG / Delta HCO3
   */
  public calculateDeltaRatio(correctedAg: number, hco3: number): {
    deltaRatio: number;
    interpretation: DeltaRatioInterpretation;
  } {
    if (correctedAg <= 12) {
      return { deltaRatio: 0.0, interpretation: 'Not Applicable (Normal AG)' };
    }

    const deltaAg = correctedAg - 12;
    const deltaHco3 = Math.max(1, 24 - hco3);
    const ratio = Math.round((deltaAg / deltaHco3) * 100) / 100;

    let interpretation: DeltaRatioInterpretation = 'Pure HAGMA (0.8 - 2.0)';
    if (ratio < 0.4) {
      interpretation = 'Pure NAGMA (< 0.4)';
    } else if (ratio < 0.8) {
      interpretation = 'Mixed HAGMA and NAGMA (0.4 - 0.8)';
    } else if (ratio > 2.0) {
      interpretation = 'Mixed HAGMA and Metabolic Alkalosis (> 2.0)';
    }

    return { deltaRatio: ratio, interpretation };
  }

  /**
   * Winter's Formula for Respiratory Compensation in Metabolic Acidosis
   * Expected pCO2 = 1.5 * [HCO3-] + 8 +/- 2
   */
  public evaluateWintersFormula(hco3: number, measuredPco2: number): IWintersCompensationResult {
    const baseline = 1.5 * hco3 + 8;
    const minVal = Math.round((baseline - 2) * 10) / 10;
    const maxVal = Math.round((baseline + 2) * 10) / 10;

    let status: IWintersCompensationResult['respiratoryStatus'] = 'Adequate Compensation';
    if (measuredPco2 > maxVal) {
      status = 'Concomitant Respiratory Acidosis (Hypoventilation)';
    } else if (measuredPco2 < minVal) {
      status = 'Concomitant Respiratory Alkalosis (Hyperventilation)';
    }

    return {
      expectedPco2Min: minVal,
      expectedPco2Max: maxVal,
      measuredPco2,
      respiratoryStatus: status
    };
  }

  /**
   * Fluid Selection Recommendation Engine (SMART & SALT-ED Grounding)
   */
  public evaluateFluidSelection(cl: number, ph: number, hco3: number, sida: number): IFluidPrescriptionGuideline {
    // Normal Saline (0.9% NaCl) has Cl = 154 mEq/L and SID = 0.
    // If patient already has hyperchloremia (Cl > 106) or metabolic acidosis (HCO3 < 22, pH < 7.35, SIDa < 38),
    // Normal Saline worsens renal vasoconstriction.
    if (cl > 106 || sida < 38 || (ph < 7.35 && hco3 < 22)) {
      return {
        preferredFluid: 'Balanced Crystalloid (Plasma-Lyte 148 / Lactated Ringer\'s)',
        chlorideContentMeqL: 98,
        fluidSid: 50,
        clinicalRationale: 'Hyperchloremic / metabolic acidosis present (Cl > 106 or SIDa < 38). Normal Saline (Cl 154, SID 0) exacerbates acidosis, triggers renal vasoconstriction, and decreases GFR. Balanced crystalloid preserves renal blood flow.',
        renalPerfusionImpact: 'Renoprotective (Maintains Renal Arterial Flow)'
      };
    }

    if (cl < 96 && ph > 7.45) {
      return {
        preferredFluid: '0.9% Normal Saline (Indicated for hypochloremic alkalosis)',
        chlorideContentMeqL: 154,
        fluidSid: 0,
        clinicalRationale: 'Hypochloremic metabolic alkalosis (e.g. gastric loss/vomiting). Normal Saline delivers necessary chloride to restore renal bicarbonate excretion.',
        renalPerfusionImpact: 'Renoprotective (Maintains Renal Arterial Flow)'
      };
    }

    return {
      preferredFluid: 'Balanced Crystalloid (Plasma-Lyte 148 / Lactated Ringer\'s)',
      chlorideContentMeqL: 109,
      fluidSid: 28,
      clinicalRationale: 'Physiological maintenance and resuscitation. Balanced crystalloids reduce major adverse kidney events (MAKE30) compared to saline.',
      renalPerfusionImpact: 'Renoprotective (Maintains Renal Arterial Flow)'
    };
  }

  /**
   * Hyperkalemia Emergency Action Plan Engine
   */
  public evaluateHyperkalemia(potassium: number): IHyperkalemiaActionPlan {
    if (potassium >= 6.5) {
      return {
        severity: 'Severe / Emergent (>= 6.5)',
        membraneStabilizationRequired: true,
        intracellularShiftRequired: true,
        potassiumEliminationRequired: true,
        orders: [
          'STAT Calcium Gluconate 1g IV over 2-3 min (Membrane stabilization; repeat in 5 min if ECG abnormal)',
          'Regular Insulin 10 units IV + 25g Dextrose 50% (D50W) IV push (Intracellular shift; onset 15-30m)',
          'Nebulized Albuterol 10 - 20 mg over 15 min (Synergistic beta-2 intracellular shift)',
          'Sodium Zirconium Cyclosilicate (Lokelma) 10g PO TID or emergent hemodialysis consultation',
          'Continuous cardiac rhythm telemetry + repeat stat potassium at 60 minutes'
        ]
      };
    }

    if (potassium >= 6.0) {
      return {
        severity: 'Moderate (6.0 - 6.4)',
        membraneStabilizationRequired: true,
        intracellularShiftRequired: true,
        potassiumEliminationRequired: true,
        orders: [
          'Calcium Gluconate 1g IV if peaked T-waves or QRS widening noted on ECG',
          'Regular Insulin 10 units IV + D50W 25g IV',
          'Oral potassium binder (Lokelma 10g PO or Patiromer 8.4g PO)',
          'Discontinue ACEi/ARBs, MRAs (spironolactone), and NSAIDs',
          'Repeat serum potassium in 2 hours'
        ]
      };
    }

    if (potassium > 5.0) {
      return {
        severity: 'Mild (5.1 - 5.9)',
        membraneStabilizationRequired: false,
        intracellularShiftRequired: false,
        potassiumEliminationRequired: true,
        orders: [
          'Review medications: hold potassium-sparing diuretics, potassium supplements, and NSAIDs',
          'Dietary counseling: restrict high-potassium intake (< 2g/day)',
          'Consider initiation of oral potassium binder or loop diuretic if volume overloaded',
          'Recheck BMP in 24 - 48 hours'
        ]
      };
    }

    return {
      severity: 'Normal (3.5 - 5.0)',
      membraneStabilizationRequired: false,
      intracellularShiftRequired: false,
      potassiumEliminationRequired: false,
      orders: ['Eulkalemic homeostasis. Standard clinical monitoring.']
    };
  }

  // --- Computed Reactive Telemetry Signals ---

  readonly anionGapBreakdown = computed(() => {
    return this.calculateCorrectedAnionGap(
      this.sodium(),
      this.chloride(),
      this.bicarbonate(),
      this.albumin()
    );
  });

  readonly observedAnionGap = computed<number>(() => {
    return this.anionGapBreakdown().observedAg;
  });

  readonly correctedAnionGap = computed<number>(() => {
    return this.anionGapBreakdown().correctedAg;
  });

  readonly deltaRatioResult = computed(() => {
    return this.calculateDeltaRatio(this.correctedAnionGap(), this.bicarbonate());
  });

  readonly wintersCompensation = computed<IWintersCompensationResult | null>(() => {
    if (this.bicarbonate() < 22) {
      return this.evaluateWintersFormula(this.bicarbonate(), this.pco2());
    }
    return null;
  });

  readonly primaryDisorder = computed<AcidBasePrimaryDisorder>(() => {
    const phVal = this.ph();
    const hco3Val = this.bicarbonate();
    const pco2Val = this.pco2();
    const corrAg = this.correctedAnionGap();

    if (phVal < 7.35) {
      // Acidemia
      if (hco3Val < 22) {
        if (corrAg > 12) return 'High Anion Gap Metabolic Acidosis (HAGMA)';
        return 'Normal Anion Gap Metabolic Acidosis (NAGMA / Hyperchloremic)';
      }
      if (pco2Val > 45) return 'Respiratory Acidosis';
      return 'Mixed Complex Acid-Base Disorder';
    }

    if (phVal > 7.45) {
      // Alkalemia
      if (hco3Val > 26) return 'Metabolic Alkalosis';
      if (pco2Val < 35) return 'Respiratory Alkalosis';
      return 'Mixed Complex Acid-Base Disorder';
    }

    // Normal pH (7.35 - 7.45)
    if (corrAg > 14) {
      return 'High Anion Gap Metabolic Acidosis (HAGMA)'; // Occult HAGMA with metabolic alkalosis
    }
    if (hco3Val !== 24 || pco2Val !== 40) {
      return 'Mixed Complex Acid-Base Disorder';
    }

    return 'Normal Acid-Base Homeostasis';
  });

  readonly stewartParameters = computed<IStewartParameters>(() => {
    const sida = this.calculateSida(this.sodium(), this.potassium(), this.chloride(), this.lactate(), false);
    const side = this.calculateSide(this.ph(), this.bicarbonate(), this.albumin(), this.phosphate());
    const sig = this.calculateSig(sida, side);
    const atot = this.calculateAtot(this.albumin(), this.phosphate());

    return {
      sida,
      side,
      sig,
      atot,
      unmeasuredAnionsPresent: sig > 4.0,
      hyperchloremicAcidosisRisk: this.chloride() > 106 || sida < 38
    };
  });

  readonly fluidGuideline = computed<IFluidPrescriptionGuideline>(() => {
    return this.evaluateFluidSelection(
      this.chloride(),
      this.ph(),
      this.bicarbonate(),
      this.stewartParameters().sida
    );
  });

  readonly hyperkalemiaPlan = computed<IHyperkalemiaActionPlan>(() => {
    return this.evaluateHyperkalemia(this.potassium());
  });

  readonly fullAssessment = computed<IStewartAcidBaseAssessment>(() => {
    return {
      timestamp: new Date().toISOString(),
      ph: this.ph(),
      pco2: this.pco2(),
      bicarbonate: this.bicarbonate(),
      anionGapObserved: this.observedAnionGap(),
      anionGapCorrected: this.correctedAnionGap(),
      primaryDisorder: this.primaryDisorder(),
      deltaRatio: this.deltaRatioResult().deltaRatio,
      deltaRatioInterpretation: this.deltaRatioResult().interpretation,
      wintersCompensation: this.wintersCompensation(),
      stewart: this.stewartParameters(),
      fluidGuideline: this.fluidGuideline(),
      hyperkalemiaPlan: this.hyperkalemiaPlan()
    };
  });

  // --- Mutator & Scenario Simulation Methods ---

  public setLabs(
    ph: number,
    pco2: number,
    sodium: number,
    potassium: number,
    chloride: number,
    bicarbonate: number,
    lactate: number = 1.0,
    albumin: number = 4.0,
    phosphate: number = 3.5
  ) {
    this.ph.set(ph);
    this.pco2.set(pco2);
    this.sodium.set(sodium);
    this.potassium.set(potassium);
    this.chloride.set(chloride);
    this.bicarbonate.set(bicarbonate);
    this.lactate.set(lactate);
    this.albumin.set(albumin);
    this.phosphate.set(phosphate);
  }

  public simulateScenario(
    scenario: 'normal_homeostasis' | 'dka_hagma' | 'saline_hyperchloremic_nagma' | 'triple_mixed_disorder' | 'severe_hyperkalemia_emergency'
  ) {
    switch (scenario) {
      case 'normal_homeostasis':
        this.setLabs(7.40, 40.0, 140.0, 4.0, 102.0, 24.0, 1.0, 4.0, 3.5);
        break;

      case 'dka_hagma':
        // Classic DKA: pH 7.15, pCO2 22 (hyperventilating Kussmaul), Na 134, K 5.6, Cl 98, HCO3 8, Albumin 4.0
        // AG = 134 - (98 + 8) = 28 (Massive HAGMA)
        this.setLabs(7.15, 22.0, 134.0, 5.6, 98.0, 8.0, 2.5, 4.0, 3.0);
        break;

      case 'saline_hyperchloremic_nagma':
        // Post-10L normal saline resuscitation: Cl 118, HCO3 16, pH 7.28, pCO2 35, Na 142
        // AG = 142 - (118 + 16) = 8 (Normal AG, hyperchloremic NAGMA, low SIDa)
        this.setLabs(7.28, 35.0, 142.0, 4.2, 118.0, 16.0, 1.2, 3.2, 3.0);
        break;

      case 'triple_mixed_disorder':
        // Patient with severe hypoalbuminemia (Alb 2.0), vomiting (metabolic alkalosis), DKA (ketoacidosis), and COPD (CO2 retention)
        // pH 7.38, pCO2 50, Na 140, K 3.8, Cl 92, HCO3 28, Albumin 2.0
        // AG_obs = 140 - (92 + 28) = 20. AG_corr = 20 + 2.5*(4-2) = 25!
        this.setLabs(7.38, 50.0, 140.0, 3.8, 92.0, 28.0, 2.0, 2.0, 3.5);
        break;

      case 'severe_hyperkalemia_emergency':
        // Acute renal failure with K 6.8, pH 7.24, HCO3 15, Na 136, Cl 105
        this.setLabs(7.24, 34.0, 136.0, 6.8, 105.0, 15.0, 2.0, 3.5, 5.5);
        break;
    }
  }
}
