import { Injectable, signal, computed } from '@angular/core';

export interface IHendersonHasselbalchResult {
  calculatedPh: number;
  bufferState: 'Normal Homeostasis' | 'Metabolic Acidosis' | 'Metabolic Alkalosis' | 'Respiratory Acidosis' | 'Respiratory Alkalosis';
  bicarbonatePaCo2Ratio: number;
  clinicalRecommendation: string;
}

export interface IPlasmaOsmolalityResult {
  osmolalityMOsmKg: number;
  tonicityStatus: 'Isotonic' | 'Hypertonic (Dehydration Risk)' | 'Hypotonic (Hyponatremia Risk)';
  osmolalGap: number;
}

export interface IRedoxGlutathioneResult {
  gshGssgRatio: number;
  redoxPotentialMv: number; // e.g. -240 mV to -170 mV
  cellularOxidativeState: 'Optimal Anti-Oxidant Reserve' | 'Mild Oxidative Stress' | 'Severe Oxidative Damage';
}

export interface IMineralStoichiometryResult {
  zincCopperRatio: number;
  calciumMagnesiumRatio: number;
  zincCopperBalanceStatus: 'Optimal (10:1 - 15:1)' | 'Copper Excess / Zinc Deficient' | 'Zinc Excess';
  calciumMagnesiumBalanceStatus: 'Optimal (2:1)' | 'Magnesium Deficient (Excess Ca)' | 'Calcium Deficient';
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalBiochemistryService {
  /**
   * 1. Henderson-Hasselbalch Carbonic Acid-Bicarbonate pH Buffering Equation
   * pH = 6.1 + log10([HCO3-] / (0.03 * PaCO2))
   */
  calculateHendersonHasselbalchBuffer(
    hco3MeqL: number = 24,
    paCo2Mmhg: number = 40
  ): IHendersonHasselbalchResult {
    const ratio = hco3MeqL / Math.max(1, 0.03 * paCo2Mmhg);
    const ph = parseFloat((6.1 + Math.log10(ratio)).toFixed(2));

    let bufferState: IHendersonHasselbalchResult['bufferState'] = 'Normal Homeostasis';
    let recommendation = 'Acid-base buffering system is in optimal physiological homeostasis.';

    if (ph < 7.35) {
      if (hco3MeqL < 22) {
        bufferState = 'Metabolic Acidosis';
        recommendation = 'Assess renal HCO3 retention, anion gap, and lactate levels.';
      } else {
        bufferState = 'Respiratory Acidosis';
        recommendation = 'Assess alveolar hypoventilation and pulmonary clearance.';
      }
    } else if (ph > 7.45) {
      if (hco3MeqL > 26) {
        bufferState = 'Metabolic Alkalosis';
        recommendation = 'Evaluate volume depletion, hypokalemia, or alkali ingestion.';
      } else {
        bufferState = 'Respiratory Alkalosis';
        recommendation = 'Evaluate hyperventilation, anxiety, or acute hypoxia.';
      }
    }

    return {
      calculatedPh: ph,
      bufferState,
      bicarbonatePaCo2Ratio: parseFloat(ratio.toFixed(2)),
      clinicalRecommendation: recommendation
    };
  }

  /**
   * 2. Plasma Osmolality & Tonicity Calculation
   * Osmolality = 2[Na+] + [Glucose]/18 + [BUN]/2.8
   */
  calculatePlasmaOsmolality(
    sodiumMeqL: number = 140,
    glucoseMgDl: number = 90,
    bunMgDl: number = 14
  ): IPlasmaOsmolalityResult {
    const osmo = Math.round((2 * sodiumMeqL) + (glucoseMgDl / 18) + (bunMgDl / 2.8));
    
    let tonicityStatus: IPlasmaOsmolalityResult['tonicityStatus'] = 'Isotonic';
    if (osmo > 295) tonicityStatus = 'Hypertonic (Dehydration Risk)';
    if (osmo < 275) tonicityStatus = 'Hypotonic (Hyponatremia Risk)';

    return {
      osmolalityMOsmKg: osmo,
      tonicityStatus,
      osmolalGap: Math.abs(osmo - 285)
    };
  }

  /**
   * 3. GSH/GSSG Redox Potential & Oxidative Stress Assessment
   */
  calculateRedoxGlutathioneRatio(
    gshUm: number = 1000,
    gssgUm: number = 10
  ): IRedoxGlutathioneResult {
    const ratio = parseFloat((gshUm / Math.max(0.1, gssgUm)).toFixed(1));
    
    // Nernst equation approximation for Nernst redox potential (mV)
    const redoxMv = Math.round(-240 + (30 * Math.log10(gssgUm / Math.max(1, gshUm))));

    let status: IRedoxGlutathioneResult['cellularOxidativeState'] = 'Optimal Anti-Oxidant Reserve';
    if (ratio < 50) status = 'Mild Oxidative Stress';
    if (ratio < 10) status = 'Severe Oxidative Damage';

    return {
      gshGssgRatio: ratio,
      redoxPotentialMv: redoxMv,
      cellularOxidativeState: status
    };
  }

  /**
   * 4. Stoichiometric Mineral Chelation & Bioavailability
   */
  calculateMineralStoichiometry(
    zincMcgdL: number = 100,
    copperMcgdL: number = 100,
    calciumMgdL: number = 9.5,
    magnesiumMgdL: number = 2.1
  ): IMineralStoichiometryResult {
    const znCuRatio = parseFloat((zincMcgdL / Math.max(1, copperMcgdL)).toFixed(1));
    const caMgRatio = parseFloat((calciumMgdL / Math.max(0.1, magnesiumMgdL)).toFixed(1));

    let znCuStatus: IMineralStoichiometryResult['zincCopperBalanceStatus'] = 'Optimal (10:1 - 15:1)';
    if (znCuRatio < 0.8) znCuStatus = 'Copper Excess / Zinc Deficient';
    if (znCuRatio > 2.0) znCuStatus = 'Zinc Excess';

    let caMgStatus: IMineralStoichiometryResult['calciumMagnesiumBalanceStatus'] = 'Optimal (2:1)';
    if (caMgRatio > 4.8) caMgStatus = 'Magnesium Deficient (Excess Ca)';
    if (caMgRatio < 3.5) caMgStatus = 'Calcium Deficient';

    return {
      zincCopperRatio: znCuRatio,
      calciumMagnesiumRatio: caMgRatio,
      zincCopperBalanceStatus: znCuStatus,
      calciumMagnesiumBalanceStatus: caMgStatus
    };
  }
}
