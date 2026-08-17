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

export interface IContinuousLactateResult {
  lactateMmolL: number;
  metabolicZone: 'Zone 1 (Baseline / Rest)' | 'Zone 2 (FatMax / Optimal Mitochondrial Clearance)' | 'Zone 3 (Lactate Inflexion)' | 'Zone 4+ (Anaerobic Glycolytic Glycogenolysis)' | 'Critical Lactic Acidosis (Tissue Hypoperfusion Risk)';
  mitochondrialClearanceCapacityPct: number;
  wadellSphericityCoupling: number;
  clinicalSeverity: 'Normal Baseline' | 'Optimal Zone 2 Endurance' | 'Metabolic Glycolytic Stress' | 'Critical Hyperlactatemia (Sepsis / Ischemia Alert)';
  recommendation: string;
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

  /**
   * 5. Continuous Lactate Sensing & Mitochondrial Clearance Dynamics (Peter Attia / San-Millán Model)
   * Integrates real-time interstitial lactate (mmol/L) with Wadell Sphericity (Ψ)
   */
  calculateContinuousLactateDynamics(
    lactateMmolL: number = 1.2,
    wadellSphericity: number = 0.887
  ): IContinuousLactateResult {
    const clampedLactate = Math.max(0.2, parseFloat(lactateMmolL.toFixed(2)));
    
    // Mathematical clearance capacity coupled with mitochondrial morphological sphericity (Ψ)
    const clearancePct = Math.min(100, Math.max(10, Math.round(
      (wadellSphericity * 100) * (1 / (1 + Math.exp(1.2 * (clampedLactate - 2.5)))) * 1.15
    )));

    let zone: IContinuousLactateResult['metabolicZone'] = 'Zone 1 (Baseline / Rest)';
    let severity: IContinuousLactateResult['clinicalSeverity'] = 'Normal Baseline';
    let recommendation = 'Basal lactate homeostasis. Mitochondria operating in unstressed baseline respiration.';

    if (clampedLactate >= 1.5 && clampedLactate < 2.0) {
      zone = 'Zone 2 (FatMax / Optimal Mitochondrial Clearance)';
      severity = 'Optimal Zone 2 Endurance';
      recommendation = 'Peak lipid oxidation & maximum mitochondrial lactate clearance capacity. Ideal healthspan aerobic training zone.';
    } else if (clampedLactate >= 2.0 && clampedLactate < 4.0) {
      zone = 'Zone 3 (Lactate Inflexion)';
      severity = 'Metabolic Glycolytic Stress';
      recommendation = 'Above aerobic threshold (LT1). Type II fast-twitch glycolytic recruitment exceeding mitochondrial oxidation rate.';
    } else if (clampedLactate >= 4.0 && clampedLactate < 7.0) {
      zone = 'Zone 4+ (Anaerobic Glycolytic Glycogenolysis)';
      severity = 'Metabolic Glycolytic Stress';
      recommendation = 'OBLA (Onset of Blood Lactate Accumulation). Heavy anaerobic proton buffering required.';
    } else if (clampedLactate >= 7.0) {
      zone = 'Critical Lactic Acidosis (Tissue Hypoperfusion Risk)';
      severity = 'Critical Hyperlactatemia (Sepsis / Ischemia Alert)';
      recommendation = 'Critical hyperlactatemia detected. Evaluate immediate tissue hypoperfusion, qSOFA sepsis criteria, or mesenteric ischemia.';
    }

    return {
      lactateMmolL: clampedLactate,
      metabolicZone: zone,
      mitochondrialClearanceCapacityPct: clearancePct,
      wadellSphericityCoupling: wadellSphericity,
      clinicalSeverity: severity,
      recommendation
    };
  }
}
