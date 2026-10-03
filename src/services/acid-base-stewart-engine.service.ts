import { Injectable, signal, computed } from '@angular/core';

export interface IAcidBaseLabInput {
  ph: number;
  pco2Mmhg: number;
  sodiumMeqL: number;
  potassiumMeqL: number;
  chlorideMeqL: number;
  bicarbonateMeqL: number;
  albuminGdl: number;
  phosphateMgDl: number;
  lactateMeqL: number;
  calciumMeqL?: number;
  magnesiumMeqL?: number;
}

export interface IStewartPhysicochemicalResult {
  sidaMeqL: number;
  sideMeqL: number;
  sigMeqL: number;
  aTotMeqL: number;
  albuminChargeMeqL: number;
  phosphateChargeMeqL: number;
  stewartInterpretation: string;
  unmeasuredAnionsPresent: boolean;
}

export interface ITraditionalAcidBaseResult {
  primaryDisorder: string;
  anionGap: number;
  correctedAnionGap: number;
  deltaAnionGap: number;
  deltaBicarbonate: number;
  deltaDeltaRatio: number | null;
  deltaDeltaInterpretation: string;
  expectedPco2Mmhg: number;
  respiratoryCompensationState: 'Appropriate Compensation' | 'Concurrent Respiratory Acidosis' | 'Concurrent Respiratory Alkalosis';
  tripleDisorderSummary: string;
}

export interface IIvFluidPrescriptionComparison {
  fluidName: string;
  fluidSidMeqL: number;
  sodiumConcentration: number;
  chlorideConcentration: number;
  predictedImpactOnPatientSid: 'Acidifying (Reduces SID)' | 'Neutral / Physiological' | 'Alkalinizing (Increases SID)';
  hyperchloremiaRisk: 'Low' | 'Moderate' | 'High (Renal Vasoconstriction Risk)';
  clinicalSuitabilityNote: string;
  isRecommended: boolean;
}

export interface IHyperkalemiaActionCard {
  phase: 'Phase 1: Membrane Antagonism' | 'Phase 2: Intracellular K+ Shifting' | 'Phase 3: Total Body K+ Elimination';
  intervention: string;
  dose: string;
  route: string;
  onset: string;
  duration: string;
  ismpCautionNote: string;
  contraindications: string;
}

export interface IAcidBaseComprehensiveEvaluation {
  stewart: IStewartPhysicochemicalResult;
  traditional: ITraditionalAcidBaseResult;
  fluidRecommendations: IIvFluidPrescriptionComparison[];
  hyperkalemiaProtocol: IHyperkalemiaActionCard[] | null;
  clinicalTriageSeverity: 'NORMAL' | 'EVALUATE' | 'URGENT' | 'STAT_EMERGENCY';
  summarySynopsis: string;
}

@Injectable({
  providedIn: 'root'
})
export class AcidBaseStewartEngineService {
  /**
   * Evaluates patient laboratory telemetry using both Peter Stewart's
   * physicochemical approach and traditional Boston Henderson-Hasselbalch equations.
   */
  evaluateAcidBaseState(input: IAcidBaseLabInput): IAcidBaseComprehensiveEvaluation {
    const stewart = this.calculateStewartParameters(input);
    const traditional = this.calculateTraditionalParameters(input);
    const fluids = this.generateFluidPrescriptionMatrix(input, stewart);
    const hyperkalemia = this.generateHyperkalemiaProtocol(input.potassiumMeqL);

    let severity: IAcidBaseComprehensiveEvaluation['clinicalTriageSeverity'] = 'NORMAL';
    if (input.ph < 7.10 || input.ph > 7.60 || input.potassiumMeqL >= 6.5 || input.lactateMeqL >= 4.0 || Math.abs(stewart.sigMeqL) >= 10.0) {
      severity = 'STAT_EMERGENCY';
    } else if (input.ph < 7.25 || input.ph > 7.55 || input.potassiumMeqL >= 5.5 || input.lactateMeqL >= 2.5 || Math.abs(stewart.sigMeqL) >= 6.0) {
      severity = 'URGENT';
    } else if (input.ph < 7.35 || input.ph > 7.45 || traditional.correctedAnionGap > 14 || stewart.unmeasuredAnionsPresent) {
      severity = 'EVALUATE';
    }

    const synopsis = this.synthesizeClinicalSynopsis(input, stewart, traditional);

    return {
      stewart,
      traditional,
      fluidRecommendations: fluids,
      hyperkalemiaProtocol: hyperkalemia,
      clinicalTriageSeverity: severity,
      summarySynopsis: synopsis
    };
  }

  /**
   * Peter Stewart's Physicochemical Approach
   * Standard Clinical Bedside SIDa = [Na+] + [K+] - [Cl-] - [Lactate-]
   * SIDe = [HCO3-] + [Albumin-] + [Phosphate-]
   * SIG = SIDa - SIDe
   */
  calculateStewartParameters(input: IAcidBaseLabInput): IStewartPhysicochemicalResult {
    // Standard ICU Bedside Apparent Strong Ion Difference (mEq/L)
    const sida = (input.sodiumMeqL + input.potassiumMeqL) - (input.chlorideMeqL + input.lactateMeqL);

    // Negative charges on weak acids at patient's pH (Figge-Fencl validated equations)
    // Albumin charge: g/dL * 10 * (0.123 * pH - 0.631)
    const albuminCharge = input.albuminGdl * 10 * (0.123 * input.ph - 0.631);
    
    // Inorganic Phosphate charge: mg/dL * 0.3229 * (0.309 * pH - 0.469)
    const phosphateCharge = input.phosphateMgDl * 0.3229 * (0.309 * input.ph - 0.469);

    // Total non-volatile weak acid (Atot)
    const aTot = 0.28 * (input.albuminGdl * 10) + 0.6 * input.phosphateMgDl;

    // Effective Strong Ion Difference (mEq/L)
    const side = input.bicarbonateMeqL + Math.max(0, albuminCharge) + Math.max(0, phosphateCharge);

    // Strong Ion Gap (SIG)
    const sig = sida - side;
    const unmeasuredAnions = sig > 4.0;

    let interpretation = 'Physicochemical equilibrium within normal bounds (SIG ~ 0 to +4 mEq/L).';
    if (sig > 7.0) {
      interpretation = `Markedly elevated Strong Ion Gap (+${sig.toFixed(1)} mEq/L): Severe accumulation of unmeasured anions (ketoacids, uremic toxins, exogenous intoxicants).`;
    } else if (sig > 4.0) {
      interpretation = `Mildly elevated Strong Ion Gap (+${sig.toFixed(1)} mEq/L): Unmeasured anions present; assess renal clearance and metabolic pathways.`;
    } else if (sig < -3.0) {
      interpretation = `Negative Strong Ion Gap (${sig.toFixed(1)} mEq/L): Accumulation of unmeasured cations (hypercalcemia, hypermagnesemia, lithium, polymyxin) or profound laboratory error.`;
    }

    return {
      sidaMeqL: parseFloat(sida.toFixed(1)),
      sideMeqL: parseFloat(side.toFixed(1)),
      sigMeqL: parseFloat(sig.toFixed(1)),
      aTotMeqL: parseFloat(aTot.toFixed(1)),
      albuminChargeMeqL: parseFloat(albuminCharge.toFixed(1)),
      phosphateChargeMeqL: parseFloat(phosphateCharge.toFixed(1)),
      stewartInterpretation: interpretation,
      unmeasuredAnionsPresent: unmeasuredAnions
    };
  }

  /**
   * Traditional Boston Henderson-Hasselbalch, Albumin-Corrected AG,
   * Winter's Formula & Delta-Delta Analysis
   */
  calculateTraditionalParameters(input: IAcidBaseLabInput): ITraditionalAcidBaseResult {
    // Standard Anion Gap = Na - (Cl + HCO3)
    const rawAg = input.sodiumMeqL - (input.chlorideMeqL + input.bicarbonateMeqL);

    // Albumin-corrected Anion Gap = AG + 2.5 * (4.0 - Albumin)
    const correctedAg = rawAg + 2.5 * (4.0 - input.albuminGdl);

    // Delta AG = Corrected AG - 12 (normal reference AG = 12)
    const deltaAg = correctedAg - 12.0;

    // Delta HCO3 = 24 - HCO3 (normal reference HCO3 = 24)
    const deltaHco3 = 24.0 - input.bicarbonateMeqL;

    let deltaDeltaRatio: number | null = null;
    let deltaDeltaInterpretation = 'Not applicable (no metabolic acidosis identified).';

    if (correctedAg > 12.0 && deltaHco3 > 0) {
      deltaDeltaRatio = parseFloat((deltaAg / deltaHco3).toFixed(2));
      if (deltaDeltaRatio < 0.8) {
        deltaDeltaInterpretation = `Ratio ${deltaDeltaRatio} (< 0.8): Mixed High Anion Gap Metabolic Acidosis (HAGMA) AND Normal Anion Gap (Hyperchloremic) Metabolic Acidosis (NAGMA).`;
      } else if (deltaDeltaRatio <= 2.0) {
        deltaDeltaInterpretation = `Ratio ${deltaDeltaRatio} (0.8 - 2.0): Pure High Anion Gap Metabolic Acidosis (HAGMA).`;
      } else {
        deltaDeltaInterpretation = `Ratio ${deltaDeltaRatio} (> 2.0): Mixed High Anion Gap Metabolic Acidosis (HAGMA) AND pre-existing or concurrent Metabolic Alkalosis (e.g. vomiting, diuresis).`;
      }
    } else if (correctedAg <= 12.0 && input.bicarbonateMeqL < 22) {
      deltaDeltaInterpretation = 'Normal Anion Gap Metabolic Acidosis (NAGMA / Hyperchloremic): Renal tubular acidosis, diarrhea, or 0.9% saline infusion.';
    }

    // Winter's formula expected PaCO2 for metabolic acidosis: Expected PaCO2 = 1.5 * HCO3 + 8 +/- 2
    let expectedPco2 = 40.0;
    let respiratoryState: ITraditionalAcidBaseResult['respiratoryCompensationState'] = 'Appropriate Compensation';

    if (input.bicarbonateMeqL < 22) {
      expectedPco2 = 1.5 * input.bicarbonateMeqL + 8.0;
      if (input.pco2Mmhg > expectedPco2 + 2.0) {
        respiratoryState = 'Concurrent Respiratory Acidosis';
      } else if (input.pco2Mmhg < expectedPco2 - 2.0) {
        respiratoryState = 'Concurrent Respiratory Alkalosis';
      }
    } else if (input.bicarbonateMeqL > 26) {
      // Metabolic alkalosis compensation: Expected PaCO2 = 0.7 * HCO3 + 21 +/- 2
      expectedPco2 = 0.7 * input.bicarbonateMeqL + 21.0;
      if (input.pco2Mmhg > expectedPco2 + 2.0) {
        respiratoryState = 'Concurrent Respiratory Acidosis';
      } else if (input.pco2Mmhg < expectedPco2 - 2.0) {
        respiratoryState = 'Concurrent Respiratory Alkalosis';
      }
    }

    // Determine primary disorder
    let primaryDisorder = 'Normal Acid-Base Profile';
    if (input.ph < 7.35) {
      primaryDisorder = input.bicarbonateMeqL < 22 ? 'Primary Metabolic Acidosis' : 'Primary Respiratory Acidosis';
    } else if (input.ph > 7.45) {
      primaryDisorder = input.bicarbonateMeqL > 26 ? 'Primary Metabolic Alkalosis' : 'Primary Respiratory Alkalosis';
    }

    // Triple disorder summary
    let tripleSummary = primaryDisorder;
    if (deltaDeltaRatio !== null && deltaDeltaRatio < 0.8 && respiratoryState !== 'Appropriate Compensation') {
      tripleSummary = `Triple Mixed Disorder: HAGMA + NAGMA + ${respiratoryState}`;
    } else if (deltaDeltaRatio !== null && deltaDeltaRatio > 2.0 && respiratoryState !== 'Appropriate Compensation') {
      tripleSummary = `Triple Mixed Disorder: HAGMA + Metabolic Alkalosis + ${respiratoryState}`;
    }

    return {
      primaryDisorder,
      anionGap: parseFloat(rawAg.toFixed(1)),
      correctedAnionGap: parseFloat(correctedAg.toFixed(1)),
      deltaAnionGap: parseFloat(deltaAg.toFixed(1)),
      deltaBicarbonate: parseFloat(deltaHco3.toFixed(1)),
      deltaDeltaRatio,
      deltaDeltaInterpretation,
      expectedPco2Mmhg: parseFloat(expectedPco2.toFixed(1)),
      respiratoryCompensationState: respiratoryState,
      tripleDisorderSummary: tripleSummary
    };
  }

  /**
   * Intravenous Fluid Prescription Optimization
   * Assesses patient's SIDa vs crystalloid solutions to prevent iatrogenic hyperchloremia.
   */
  generateFluidPrescriptionMatrix(
    input: IAcidBaseLabInput,
    stewart: IStewartPhysicochemicalResult
  ): IIvFluidPrescriptionComparison[] {
    const isHyperchloremic = input.chlorideMeqL > 106 || stewart.sidaMeqL < 36;

    return [
      {
        fluidName: 'Balanced Crystalloid: Plasma-Lyte A / Normosol-R',
        fluidSidMeqL: 50,
        sodiumConcentration: 140,
        chlorideConcentration: 98,
        predictedImpactOnPatientSid: 'Alkalinizing (Increases SID)',
        hyperchloremiaRisk: 'Low',
        clinicalSuitabilityNote: 'Physiological SID (50 mEq/L) with acetate/gluconate buffers. Eliminates hyperchloremic metabolic acidosis risk and minimizes renal vasoconstriction (SMART trial standard of care).',
        isRecommended: isHyperchloremic || input.ph < 7.35
      },
      {
        fluidName: 'Balanced Crystalloid: Lactated Ringer\'s (Hartmann\'s)',
        fluidSidMeqL: 28,
        sodiumConcentration: 130,
        chlorideConcentration: 109,
        predictedImpactOnPatientSid: 'Neutral / Physiological',
        hyperchloremiaRisk: 'Low',
        clinicalSuitabilityNote: 'Near-physiological chloride with 28 mEq/L sodium lactate buffer. Favorable for large-volume resuscitation unless acute hepatic failure impairs lactate clearance.',
        isRecommended: !isHyperchloremic && input.lactateMeqL < 2.5
      },
      {
        fluidName: 'Unbuffered Crystalloid: 0.9% Normal Saline',
        fluidSidMeqL: 0,
        sodiumConcentration: 154,
        chlorideConcentration: 154,
        predictedImpactOnPatientSid: 'Acidifying (Reduces SID)',
        hyperchloremiaRisk: 'High (Renal Vasoconstriction Risk)',
        clinicalSuitabilityNote: 'Zero SID with 154 mEq/L chloride causes rapid hyperchloremic metabolic acidosis, decreases renal cortical perfusion, and increases major adverse kidney events. Restrict to hypochloremic metabolic alkalosis or traumatic brain injury.',
        isRecommended: input.ph > 7.45 && input.chlorideMeqL < 96
      },
      {
        fluidName: 'Hypotonic Free Water: 5% Dextrose in Water (D5W)',
        fluidSidMeqL: 0,
        sodiumConcentration: 0,
        chlorideConcentration: 0,
        predictedImpactOnPatientSid: 'Neutral / Physiological',
        hyperchloremiaRisk: 'Low',
        clinicalSuitabilityNote: 'Provides free water for pure intracellular dehydration (hypernatremia). Ineffective for intravascular resuscitation.',
        isRecommended: input.sodiumMeqL > 148
      }
    ];
  }

  /**
   * Hyperkalemia Emergency Stabilization Protocol
   * Standard-of-care 3-phase pharmacological protocol with strict ISMP safety constraints.
   */
  generateHyperkalemiaProtocol(potassiumMeqL: number): IHyperkalemiaActionCard[] | null {
    if (potassiumMeqL < 5.5) {
      return null;
    }

    return [
      {
        phase: 'Phase 1: Membrane Antagonism',
        intervention: 'Calcium Gluconate 10%',
        dose: '1 g (10 mL)',
        route: 'Intravenous infusion',
        onset: '1–3 minutes',
        duration: '30–60 minutes',
        ismpCautionNote: 'ISMP High-Alert: Administer over 2–5 minutes under continuous ECG monitoring. Repeat in 5 minutes if QRS widening or peaked T waves persist. Avoid rapid push.',
        contraindications: 'Severe digitalis toxicity (relative; use Calcium Chloride slowly if unstable arrest).'
      },
      {
        phase: 'Phase 2: Intracellular K+ Shifting',
        intervention: 'Regular Insulin + Dextrose 50%',
        dose: 'Regular Insulin 10 units IV + Dextrose 25 g (50 mL D50W)',
        route: 'Intravenous bolus / infusion',
        onset: '15–30 minutes',
        duration: '4–6 hours',
        ismpCautionNote: 'ISMP High-Alert: Never use naked decimals or trailing zeros. Check point-of-care blood glucose at baseline, 30 min, 1 hour, and hourly for 6 hours to prevent severe hypoglycemia.',
        contraindications: 'Severe baseline hypoglycemia (< 70 mg/dL without pre-treatment dextrose).'
      },
      {
        phase: 'Phase 2: Intracellular K+ Shifting',
        intervention: 'Nebulized Albuterol (Salbutamol)',
        dose: '10–20 mg in 4 mL normal saline',
        route: 'Inhalation via nebulizer',
        onset: '15–30 minutes',
        duration: '2–4 hours',
        ismpCautionNote: 'ISMP Caution: Requires 4–8 times standard bronchodilator dose. Monitor for tachycardia and tremor.',
        contraindications: 'Severe symptomatic tachyarrhythmia or unstable coronary ischemia.'
      },
      {
        phase: 'Phase 3: Total Body K+ Elimination',
        intervention: 'Sodium Zirconium Cyclosilicate (Lokelma)',
        dose: '10 g in 45 mL water',
        route: 'Oral suspension',
        onset: '1 hour',
        duration: 'Sustained gastrointestinal binding',
        ismpCautionNote: 'ISMP Caution: Preferred over sodium polystyrene sulfonate (Kayexalate) due to zero intestinal necrosis risk. Fast-acting selective potassium cation exchanger.',
        contraindications: 'Severe bowel obstruction or active gastrointestinal perforation.'
      }
    ];
  }

  private synthesizeClinicalSynopsis(
    input: IAcidBaseLabInput,
    stewart: IStewartPhysicochemicalResult,
    traditional: ITraditionalAcidBaseResult
  ): string {
    const parts: string[] = [];

    parts.push(`Patient exhibits ${traditional.primaryDisorder} (pH ${input.ph.toFixed(2)}, PaCO2 ${input.pco2Mmhg.toFixed(0)} mmHg, HCO3 ${input.bicarbonateMeqL.toFixed(1)} mEq/L).`);
    
    if (traditional.correctedAnionGap > 12.0) {
      parts.push(`Albumin-corrected Anion Gap is elevated at ${traditional.correctedAnionGap.toFixed(1)} mEq/L (raw AG ${traditional.anionGap.toFixed(1)} mEq/L adjusted for Albumin ${input.albuminGdl.toFixed(1)} g/dL).`);
    }

    if (traditional.deltaDeltaRatio !== null) {
      parts.push(traditional.deltaDeltaInterpretation);
    }

    if (stewart.unmeasuredAnionsPresent) {
      parts.push(`Stewart physicochemical analysis confirms an elevated Strong Ion Gap of +${stewart.sigMeqL.toFixed(1)} mEq/L (apparent SIDa ${stewart.sidaMeqL.toFixed(1)} vs effective SIDe ${stewart.sideMeqL.toFixed(1)}), verifying unmeasured metabolic anions.`);
    }

    if (input.chlorideMeqL > 106) {
      parts.push(`Hyperchloremia detected ([Cl-] ${input.chlorideMeqL.toFixed(0)} mEq/L). Prioritize balanced crystalloids (Plasma-Lyte or Lactated Ringer's) and restrict 0.9% normal saline.`);
    }

    if (input.potassiumMeqL >= 5.5) {
      parts.push(`CRITICAL: Serum potassium is ${input.potassiumMeqL.toFixed(1)} mEq/L. Hyperkalemia stabilization protocol active.`);
    }

    return parts.join(' ');
  }
}
