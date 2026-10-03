/**
 * @file sepsis-shock-sofa.service.ts
 * @description Clinical Model P8: Sepsis Microvascular Shock & SOFA-2 Phenotyper Engine.
 * 
 * Clinical & Mathematical Foundations:
 * 1. Sepsis-3 Consensus Definitions:
 *    - qSOFA Bedside Screening: RR >= 22 bpm (+1), GCS < 15 (+1), SBP <= 100 mmHg (+1).
 *    - Sequential Organ Failure Assessment (SOFA 0-24):
 *      * Respiration: PaO2/FiO2 ratio (>=400: 0, <400: 1, <300: 2, <200+vent: 3, <100+vent: 4).
 *      * Coagulation: Platelets (>=150: 0, <150: 1, <100: 2, <50: 3, <20: 4).
 *      * Liver: Bilirubin mg/dL (<1.2: 0, 1.2-1.9: 1, 2.0-5.9: 2, 6.0-11.9: 3, >=12: 4).
 *      * Cardiovascular: MAP >= 70 (0), MAP < 70 (1), Dopamine/Dobutamine (2), NE/Epi <= 0.1 (3), NE/Epi > 0.1 (4).
 *      * CNS: GCS 15 (0), 13-14 (1), 10-12 (2), 6-9 (3), <6 (4).
 *      * Renal: Creatinine mg/dL (<1.2: 0, 1.2-1.9: 1, 2.0-3.4: 2, 3.5-4.9: 3, >=5.0: 4).
 *    - Sepsis Invariant: Suspected infection + delta SOFA >= 2 from baseline.
 *    - Septic Shock Invariant: Sepsis + vasopressors to maintain MAP >= 65 mmHg AND serum lactate > 2.0 mmol/L.
 * 
 * 2. ANDROMEDA-SHOCK Microvascular Perfusion & Lactate Dynamics:
 *    - Capillary Refill Time (CRT): Normal <= 3.0 seconds; abnormal > 3.0 seconds indicates microcirculatory shock.
 *    - Lactate Clearance Velocity: Delta Lactate / Delta t >= 20% every 2 hours indicates resuscitation success.
 *    - Microvascular Uncoupling Index: Macrohemodynamic restoration (MAP >= 65) with persistent microvascular hypoxia (CRT > 3.0s, Mottling >= 2).
 * 
 * 3. Vasopressor Titration & Sparing Protocol (Surviving Sepsis Campaign 2021 / VASST / APROCCHSS):
 *    - Tier 1: Norepinephrine (NE) titrated to target MAP 65-70 mmHg.
 *    - Tier 2: Vasopressin 0.03 U/min fixed-dose added when NE > 0.25 mcg/kg/min (V1a sparing).
 *    - Tier 3: Inotrope bridge (Dobutamine 2.5 - 20 mcg/kg/min) for cardiogenic uncoupling / SvO2 < 70%.
 *    - Tier 4: Refractory Shock Corticosteroid Bridge (IV Hydrocortisone 200 mg/day) if NE + Vasopressin >= 0.5 mcg/kg/min.
 */

import { Injectable, signal, computed } from '@angular/core';

export interface ISepsisPatientInputs {
  // Respiratory
  pao2Mmhg: number;
  fio2Percent: number; // 21 - 100
  isMechanicallyVentilated: boolean;
  respiratoryRateBpm: number;

  // Hemodynamics & Vasopressors
  systolicBpMmhg: number;
  meanArterialPressureMmhg: number;
  norepinephrineDoseMcgKgMin: number; // 0.0 - 2.0
  vasopressinDoseUnitsMin: number;    // 0.0 or 0.03
  dobutamineDoseMcgKgMin: number;     // 0.0 - 20.0

  // Perfusion & Microcirculation (ANDROMEDA-SHOCK)
  capillaryRefillTimeSec: number;     // Normal <= 3.0s
  serumLactateInitialMmolL: number;   // Baseline lactate
  serumLactateCurrentMmolL: number;   // Repeat lactate at 2 hours
  mottlingScore: number;              // 0 (none) to 5 (severe knee/thigh livedo)

  // Organ Dysfunction Labs
  plateletsKUl: number;              // Platelets x10^3/uL
  totalBilirubinMgDl: number;         // mg/dL
  serumCreatinineMgDl: number;        // mg/dL
  urineOutput24hMl: number;           // mL/day
  glasgowComaScale: number;           // 3 - 15

  // Clinical Infection
  hasSuspectedOrConfirmedInfection: boolean;
  baselineSofaScore: number;          // Prior chronic organ baseline (default 0)
}

export interface ISofaSubscores {
  respiratory: number;
  coagulation: number;
  liver: number;
  cardiovascular: number;
  cns: number;
  renal: number;
  totalSofa: number;
  deltaSofa: number;
}

export interface IQsofaAssessment {
  score: number; // 0 - 3
  isPositive: boolean; // >= 2
  criteriaMet: string[];
}

export interface IMicrovascularPerfusion {
  capillaryRefillTimeSec: number;
  isCrtNormal: boolean; // <= 3.0s
  lactateClearancePercent: number;
  isLactateClearanceAdequate: boolean; // >= 20%
  isMicrovascularUncoupled: boolean;   // MAP >= 65 but CRT > 3.0 or Mottling >= 2
  mottlingGrade: string;
}

export interface IVasopressorGuidance {
  currentTier: 'Tier 0: No Vasopressors' | 'Tier 1: Norepinephrine Monotherapy' | 'Tier 2: Vasopressin Sparing Add-On' | 'Tier 3: Inotropic Bridge' | 'Tier 4: Refractory Shock Hydrocortisone';
  recommendedInterventions: string[];
  norepinephrineEquivalentDose: number;
  isHydrocortisoneIndicated: boolean;
}

export interface ISepsisShockDiagnosis {
  category: 'Non-Septic Infection / Homeostasis' | 'Sepsis (Organ Dysfunction Present)' | 'Septic Shock (Refractory Vasoplegia & Cellular Dysoxia)';
  severityTier: 'Low Risk' | 'Moderate Sepsis Risk' | 'High-Risk Septic Shock' | 'Critical Refractory Vasoplegic Shock';
  mortalityEstimatePercent: number;
  sofa: ISofaSubscores;
  qsofa: IQsofaAssessment;
  microvascular: IMicrovascularPerfusion;
  vasopressor: IVasopressorGuidance;
  clinicalActionDirectives: string[];
}

export const DEFAULT_SEPSIS_INPUTS: ISepsisPatientInputs = {
  pao2Mmhg: 95,
  fio2Percent: 21,
  isMechanicallyVentilated: false,
  respiratoryRateBpm: 16,

  systolicBpMmhg: 120,
  meanArterialPressureMmhg: 85,
  norepinephrineDoseMcgKgMin: 0,
  vasopressinDoseUnitsMin: 0,
  dobutamineDoseMcgKgMin: 0,

  capillaryRefillTimeSec: 2.2,
  serumLactateInitialMmolL: 1.4,
  serumLactateCurrentMmolL: 1.2,
  mottlingScore: 0,

  plateletsKUl: 240,
  totalBilirubinMgDl: 0.8,
  serumCreatinineMgDl: 0.9,
  urineOutput24hMl: 1600,
  glasgowComaScale: 15,

  hasSuspectedOrConfirmedInfection: false,
  baselineSofaScore: 0
};

@Injectable({
  providedIn: 'root'
})
export class SepsisShockSofaService {
  readonly inputs = signal<ISepsisPatientInputs>(DEFAULT_SEPSIS_INPUTS);

  // Computes qSOFA Score (0 - 3)
  readonly qsofa = computed<IQsofaAssessment>(() => {
    const data = this.inputs();
    const criteria: string[] = [];
    let score = 0;

    if (data.respiratoryRateBpm >= 22) {
      score += 1;
      criteria.push('Tachypnea (RR >= 22 bpm)');
    }
    if (data.glasgowComaScale < 15) {
      score += 1;
      criteria.push('Altered Mentation (GCS < 15)');
    }
    if (data.systolicBpMmhg <= 100) {
      score += 1;
      criteria.push('Hypotension (SBP <= 100 mmHg)');
    }

    return {
      score,
      isPositive: score >= 2,
      criteriaMet: criteria
    };
  });

  // Computes SOFA Subscores & Total
  readonly sofa = computed<ISofaSubscores>(() => {
    const data = this.inputs();

    // 1. Respiration: PaO2 / FiO2
    const pfRatio = data.fio2Percent > 0 ? (data.pao2Mmhg / (data.fio2Percent / 100)) : 400;
    let resp = 0;
    if (pfRatio < 100 && data.isMechanicallyVentilated) resp = 4;
    else if (pfRatio < 200 && data.isMechanicallyVentilated) resp = 3;
    else if (pfRatio < 300) resp = 2;
    else if (pfRatio < 400) resp = 1;

    // 2. Coagulation: Platelets
    let coag = 0;
    if (data.plateletsKUl < 20) coag = 4;
    else if (data.plateletsKUl < 50) coag = 3;
    else if (data.plateletsKUl < 100) coag = 2;
    else if (data.plateletsKUl < 150) coag = 1;

    // 3. Liver: Bilirubin
    let liver = 0;
    if (data.totalBilirubinMgDl >= 12.0) liver = 4;
    else if (data.totalBilirubinMgDl >= 6.0) liver = 3;
    else if (data.totalBilirubinMgDl >= 2.0) liver = 2;
    else if (data.totalBilirubinMgDl >= 1.2) liver = 1;

    // 4. Cardiovascular: MAP & Vasopressors
    let cv = 0;
    if (data.norepinephrineDoseMcgKgMin > 0.1 || data.dobutamineDoseMcgKgMin > 15) {
      cv = 4;
    } else if (data.norepinephrineDoseMcgKgMin > 0 || data.dobutamineDoseMcgKgMin > 0 || data.vasopressinDoseUnitsMin > 0) {
      cv = 3;
    } else if (data.meanArterialPressureMmhg < 70) {
      cv = 1;
    }

    // 5. CNS: Glasgow Coma Scale
    let cns = 0;
    if (data.glasgowComaScale < 6) cns = 4;
    else if (data.glasgowComaScale <= 9) cns = 3;
    else if (data.glasgowComaScale <= 12) cns = 2;
    else if (data.glasgowComaScale <= 14) cns = 1;

    // 6. Renal: Creatinine or Urine Output
    let renal = 0;
    if (data.serumCreatinineMgDl >= 5.0 || data.urineOutput24hMl < 200) renal = 4;
    else if (data.serumCreatinineMgDl >= 3.5 || data.urineOutput24hMl < 500) renal = 3;
    else if (data.serumCreatinineMgDl >= 2.0) renal = 2;
    else if (data.serumCreatinineMgDl >= 1.2) renal = 1;

    const totalSofa = resp + coag + liver + cv + cns + renal;
    const deltaSofa = Math.max(0, totalSofa - data.baselineSofaScore);

    return {
      respiratory: resp,
      coagulation: coag,
      liver,
      cardiovascular: cv,
      cns,
      renal,
      totalSofa,
      deltaSofa
    };
  });

  // Computes ANDROMEDA-SHOCK Microvascular Perfusion
  readonly microvascular = computed<IMicrovascularPerfusion>(() => {
    const data = this.inputs();

    const isCrtNormal = data.capillaryRefillTimeSec <= 3.0;

    let lactateClearancePercent = 0;
    if (data.serumLactateInitialMmolL > 0) {
      lactateClearancePercent = Math.round(
        ((data.serumLactateInitialMmolL - data.serumLactateCurrentMmolL) / data.serumLactateInitialMmolL) * 100
      );
    }
    const isLactateClearanceAdequate = lactateClearancePercent >= 20;

    // Uncoupling: Macro restored (MAP >= 65) but Micro failing (CRT > 3s or Mottling >= 2)
    const isMicrovascularUncoupled = data.meanArterialPressureMmhg >= 65 && (!isCrtNormal || data.mottlingScore >= 2);

    const mottlingMap: Record<number, string> = {
      0: 'Score 0: No mottling (uniform perfusion)',
      1: 'Score 1: Coin-sized mottling over patella',
      2: 'Score 2: Mottling extending beyond patella',
      3: 'Score 3: Mottling extending to middle thigh',
      4: 'Score 4: Mottling reaching groin folds',
      5: 'Score 5: Generalized severe livedo reticularis'
    };

    return {
      capillaryRefillTimeSec: data.capillaryRefillTimeSec,
      isCrtNormal,
      lactateClearancePercent,
      isLactateClearanceAdequate,
      isMicrovascularUncoupled,
      mottlingGrade: mottlingMap[data.mottlingScore] || 'Score 0'
    };
  });

  // Computes Vasopressor Sparing & Escalation Guidance
  readonly vasopressorGuidance = computed<IVasopressorGuidance>(() => {
    const data = this.inputs();
    const ne = data.norepinephrineDoseMcgKgMin;
    const vaso = data.vasopressinDoseUnitsMin;
    const dobut = data.dobutamineDoseMcgKgMin;

    const neEquivalent = ne + (vaso > 0 ? 0.1 : 0);
    const isHydrocortisoneIndicated = neEquivalent >= 0.25 && vaso > 0;

    let tier: IVasopressorGuidance['currentTier'] = 'Tier 0: No Vasopressors';
    const recs: string[] = [];

    if (isHydrocortisoneIndicated) {
      tier = 'Tier 4: Refractory Shock Hydrocortisone';
      recs.push('Initiate IV Hydrocortisone 200 mg/day (50 mg IV Q6H or continuous infusion) per APROCCHSS trial.');
      recs.push('Consider enteral Fludrocortisone 50 mcg once daily.');
      recs.push('Maintain fixed-dose Vasopressin at 0.03 U/min (do not titrate).');
    } else if (dobut > 0) {
      tier = 'Tier 3: Inotropic Bridge';
      recs.push(`Dobutamine active at ${dobut} mcg/kg/min for inotropic support.`);
      recs.push('Target ScvO2 >= 70% and lactate clearance >= 20%/2h.');
    } else if (ne > 0.25 || vaso > 0) {
      tier = 'Tier 2: Vasopressin Sparing Add-On';
      recs.push('Vasopressin 0.03 U/min indicated to spare adrenergic alpha-1 overload and reduce arrhythmia risk.');
      recs.push('Titrate Norepinephrine down as vascular tone recovers.');
    } else if (ne > 0) {
      tier = 'Tier 1: Norepinephrine Monotherapy';
      recs.push(`Norepinephrine active at ${ne} mcg/kg/min; titrate to maintain MAP 65-70 mmHg.`);
      recs.push('If NE requirements exceed 0.25 mcg/kg/min, initiate fixed Vasopressin 0.03 U/min.');
    } else {
      recs.push('No vasoactive infusions required. Maintain balanced crystalloid euvolemia.');
    }

    return {
      currentTier: tier,
      recommendedInterventions: recs,
      norepinephrineEquivalentDose: Math.round(neEquivalent * 100) / 100,
      isHydrocortisoneIndicated
    };
  });

  // Integrated Comprehensive Diagnosis
  readonly diagnosis = computed<ISepsisShockDiagnosis>(() => {
    const data = this.inputs();
    const s = this.sofa();
    const q = this.qsofa();
    const m = this.microvascular();
    const v = this.vasopressorGuidance();

    const isSepsis = data.hasSuspectedOrConfirmedInfection && s.deltaSofa >= 2;
    const isShock = isSepsis && (data.norepinephrineDoseMcgKgMin > 0 || data.vasopressinDoseUnitsMin > 0) && data.serumLactateCurrentMmolL > 2.0;

    let category: ISepsisShockDiagnosis['category'] = 'Non-Septic Infection / Homeostasis';
    let severity: ISepsisShockDiagnosis['severityTier'] = 'Low Risk';
    let mortality = 3;

    if (isShock) {
      category = 'Septic Shock (Refractory Vasoplegia & Cellular Dysoxia)';
      if (v.isHydrocortisoneIndicated || s.totalSofa >= 12) {
        severity = 'Critical Refractory Vasoplegic Shock';
        mortality = 55;
      } else {
        severity = 'High-Risk Septic Shock';
        mortality = 40;
      }
    } else if (isSepsis) {
      category = 'Sepsis (Organ Dysfunction Present)';
      severity = s.totalSofa >= 8 ? 'High-Risk Septic Shock' : 'Moderate Sepsis Risk';
      mortality = s.totalSofa >= 8 ? 25 : 12;
    } else if (q.isPositive) {
      category = 'Non-Septic Infection / Homeostasis';
      severity = 'Moderate Sepsis Risk';
      mortality = 8;
    }

    const directives: string[] = [];
    if (isShock) {
      directives.push('Surviving Sepsis Hour-1 Bundle: Measure lactate, blood cultures prior to broad-spectrum antimicrobials, administer 30 mL/kg balanced crystalloids.');
      directives.push('ANDROMEDA-SHOCK protocol: Prioritize Capillary Refill Time (target <= 3.0s) and lactate clearance velocity (>= 20%/2h) over central venous pressure.');
      if (m.isMicrovascularUncoupled) {
        directives.push('WARNING: Microvascular uncoupling detected (MAP restored but CRT > 3.0s or mottling). Avoid excessive vasopressor clamping; assess volume responsiveness with Passive Leg Raise.');
      }
    } else if (isSepsis) {
      directives.push(`Sepsis-3 criteria satisfied with Delta SOFA = +${s.deltaSofa}. Expedite source control and administer parenteral antibiotics within 1 hour.`);
      directives.push('Repeat lactate and organ function panel in 2-4 hours to verify clearance velocity.');
    } else {
      directives.push('Patient currently maintains physiological organ homeostasis without active sepsis criteria.');
    }

    return {
      category,
      severityTier: severity,
      mortalityEstimatePercent: mortality,
      sofa: s,
      qsofa: q,
      microvascular: m,
      vasopressor: v,
      clinicalActionDirectives: directives
    };
  });

  // State Mutators
  public updateInputs(partial: Partial<ISepsisPatientInputs>): void {
    this.inputs.update(curr => ({ ...curr, ...partial }));
  }

  public resetToDefault(): void {
    this.inputs.set(DEFAULT_SEPSIS_INPUTS);
  }
}
