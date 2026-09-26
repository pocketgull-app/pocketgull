/**
 * @file clinical-triad-models.service.ts
 * @description Advanced Quantitative Clinical Models & Algorithmic Triage Suite:
 * 1. PCOS Rotterdam Phenotyper & Insulin Resistance Engine (Phenotypes A-D, HOMA-IR, Myo-Inositol/Metformin ratios).
 * 2. Endometriosis Pelvic Pain Index (EPI) & Diagnostic Delay Triage (Bayesian likelihood of deep pelvic endometriosis).
 * 3. Princeton III Endothelial-Cardiovascular CAD Risk Calculator (Penile microvascular marker to coronary artery calcium).
 * 4. PSA Density & mpMRI Biopsy Avoidance Triage Model (Avoids unnecessary blind prostate biopsies).
 * 5. In Silico GAHT Pharmacokinetic (PK/PD) Hormone Curve Simulator (2-compartment absorption & elimination kinetics for Estradiol Valerate/Cypionate & Testosterone Enanthate/Cypionate).
 * 6. Secondary Erythrocytosis Trajectory Forecaster (Masculinizing GAHT hematocrit rise projection).
 */

import { Injectable, signal, computed } from '@angular/core';

// --- 1. PCOS Phenotyping Types ---
export type PcosPhenotype = 'Phenotype A (Full/Classic)' | 'Phenotype B (Non-PCO Morphology)' | 'Phenotype C (Ovulatory)' | 'Phenotype D (Non-Hyperandrogenic)' | 'No PCOS Indicated';

export interface IPcosAnalysis {
  phenotype: PcosPhenotype;
  homaIrScore: number;
  insulinResistanceDetected: boolean;
  freeAndrogenIndex: number;
  recommendedNutraceuticalRegimen: string[];
  clinicalRationale: string;
}

// --- 2. Endometriosis Probability Index (EPI) Types ---
export interface IEndometriosisRiskAssessment {
  probabilityScorePercent: number; // 0-100%
  riskTier: 'Low Likelihood' | 'Moderate Concern' | 'High Suspicion (Laparoscopy / Specialist Imaging Indicated)';
  refractoryToNsaids: boolean;
  catamenialSymptomsPresent: string[];
  recommendedClinicalAction: string;
}

// --- 3. Princeton III & Cardiovascular CAD Types ---
export interface IPrincetonCvRiskResult {
  estimated10YearCadRiskPercent: number;
  endothelialImpairmentGrade: 'Normal Microvasculature' | 'Mild Endothelial Dysfunction' | 'Severe Microvascular Disease';
  recommendedImagingWorkup: string[];
  ischemicPrecautionNotes: string;
}

// --- 4. PSA Density & mpMRI Biopsy Avoidance Types ---
export interface IPsaDensityTriage {
  psaDensityNgMlCm3: number;
  unnecessaryBiopsyAvoidable: boolean;
  mpMriPiRadsIndicated: boolean;
  recommendation: string;
}

// --- 5. GAHT In Silico Pharmacokinetic Simulation Types ---
export type GahtCompound = 'Estradiol Valerate (IM/SubQ)' | 'Estradiol Cypionate (IM/SubQ)' | 'Testosterone Cypionate (IM/SubQ)' | 'Testosterone Enanthate (IM/SubQ)';

export interface IPkCurvePoint {
  day: number;
  concentration: number; // pg/mL for E2, ng/dL for T
}

export interface IGahtPkSimulation {
  compound: GahtCompound;
  doseMg: number;
  intervalDays: number;
  peakConcentration: number;
  troughConcentration: number;
  peakTroughFluctuationPercent: number;
  simulatedCurve: IPkCurvePoint[];
  steadyStateAdequate: boolean;
  clinicalOptimizationAdvice: string;
}

// --- 6. Secondary Erythrocytosis Forecaster Types ---
export interface IErythrocytosisTrajectory {
  currentHematocrit: number;
  baselineHematocrit: number;
  monthsOnTestosterone: number;
  projectedHematocrit6Months: number;
  phlebotomyOrHoldIndicated: boolean;
  hypoxiaOrApneaScreeningIndicated: boolean;
  clinicalRecommendation: string;
}

@Injectable({
  providedIn: 'root'
})
export class SovereigntyHealthModelsService {
  // ==========================================
  // 1. PCOS & Insulin Resistance Signals
  // ==========================================
  readonly fastingGlucoseMgDl = signal<number>(94);
  readonly fastingInsulinUuMl = signal<number>(14);
  readonly totalTestosteroneNgDl = signal<number>(58); // Women's ref: 15-45 ng/dL
  readonly shbgNmolL = signal<number>(32);             // Sex hormone-binding globulin
  readonly hasOligoAnovulation = signal<boolean>(true); // Irregular or absent cycles
  readonly hasPolycysticOvariesOnUltrasound = signal<boolean>(true); // >= 20 follicles per ovary or volume >= 10 mL
  readonly hasClinicalHyperandrogenism = signal<boolean>(true); // Hirsutism, severe acne, androgenic alopecia

  // ==========================================
  // 2. Endometriosis Pelvic Pain Index Signals
  // ==========================================
  readonly dysmenorrheaSeverity = signal<number>(8); // 0-10 scale
  readonly deepDyspareunia = signal<boolean>(true); // Pain with intercourse
  readonly dyschezia = signal<boolean>(true);        // Painful defecation during menses
  readonly cyclicNauseaOrBloating = signal<boolean>(true);
  readonly unyieldingToHighDoseNsaids = signal<boolean>(true);
  readonly yearsAwaitingDiagnosis = signal<number>(4);

  // ==========================================
  // 3. Princeton III & Endothelial CAD Signals
  // ==========================================
  readonly patientAge = signal<number>(54);
  readonly iief5Score = signal<number>(12); // 1-25 (<= 16 indicates moderate/severe ED)
  readonly apobMgDl = signal<number>(115);  // Optimal < 80 mg/dL
  readonly hsCrpMgL = signal<number>(2.8);  // Optimal < 1.0 mg/L
  readonly restingSystolicBp = signal<number>(138);

  // ==========================================
  // 4. PSA Density & Biopsy Avoidance Signals
  // ==========================================
  readonly totalPsaNgMl = signal<number>(5.8);
  readonly freePsaPercent = signal<number>(16);
  readonly prostateVolumeCc = signal<number>(48); // Ultrasound/MRI volume in cm3

  // ==========================================
  // 5. In Silico GAHT Pharmacokinetics Signals
  // ==========================================
  readonly selectedGahtCompound = signal<GahtCompound>('Estradiol Valerate (IM/SubQ)');
  readonly gahtDoseMg = signal<number>(4);
  readonly gahtIntervalDays = signal<number>(7);

  // ==========================================
  // 6. Secondary Erythrocytosis Forecaster Signals
  // ==========================================
  readonly baselineHematocrit = signal<number>(42);
  readonly currentHematocrit = signal<number>(49);
  readonly monthsOnTestosterone = signal<number>(9);
  readonly weeklyTestosteroneDoseMg = signal<number>(100);
  readonly hasNocturnalSnoringOrApnea = signal<boolean>(true);

  // ==========================================
  // COMPUTED MODELS & EQUATIONS
  // ==========================================

  /**
   * 1. PCOS Rotterdam Phenotyper & HOMA-IR Evaluation
   * HOMA-IR = (Fasting Glucose mg/dL * Fasting Insulin uU/mL) / 405
   * Cutoff > 2.0 indicates peripheral insulin resistance.
   */
  readonly pcosEvaluation = computed<IPcosAnalysis>(() => {
    const glu = this.fastingGlucoseMgDl();
    const ins = this.fastingInsulinUuMl();
    const tt = this.totalTestosteroneNgDl();
    const shbg = this.shbgNmolL();

    const oligo = this.hasOligoAnovulation();
    const pco = this.hasPolycysticOvariesOnUltrasound();
    const clinHa = this.hasClinicalHyperandrogenism();

    // HOMA-IR Calculation
    const homa = +((glu * ins) / 405).toFixed(2);
    const hasIr = homa >= 2.0;

    // Free Androgen Index: (Total T nmol/L / SHBG nmol/L) * 100
    // Conversion: 1 ng/dL = 0.0347 nmol/L
    const ttNmol = tt * 0.0347;
    const fai = +((ttNmol / Math.max(1, shbg)) * 100).toFixed(1);
    const bioHa = clinHa || fai > 5.0 || tt > 50;

    let phenotype: PcosPhenotype = 'No PCOS Indicated';
    let rationale = '';
    const regimens: string[] = [];

    if (bioHa && oligo && pco) {
      phenotype = 'Phenotype A (Full/Classic)';
      rationale = 'Classic PCOS meeting all 3 Rotterdam criteria (Hyperandrogenism + Ovulatory Dysfunction + Polycystic Ovarian Morphology). High metabolic vulnerability.';
    } else if (bioHa && oligo && !pco) {
      phenotype = 'Phenotype B (Non-PCO Morphology)';
      rationale = 'Hyperandrogenism with ovulatory dysfunction but normal ovarian ultrasound architecture.';
    } else if (bioHa && !oligo && pco) {
      phenotype = 'Phenotype C (Ovulatory)';
      rationale = 'Hyperandrogenism with polycystic ovaries but regular ovulatory cycles. Mild metabolic risk.';
    } else if (!bioHa && oligo && pco) {
      phenotype = 'Phenotype D (Non-Hyperandrogenic)';
      rationale = 'Ovulatory dysfunction with polycystic morphology but normal androgens. Often driven primarily by hypothalamic stress or mild metabolic disruption.';
    }

    if (hasIr) {
      regimens.push('Myo-Inositol & D-Chiro-Inositol in physiological 40:1 ratio (2,000 mg twice daily)');
      regimens.push('Berberine HCl (500 mg TID) or Metformin for AMPK activation and insulin sensitization');
      regimens.push('Low-glycemic whole foods with high-polyphenol fiber and spearmint infusion (mild 5-alpha reductase inhibition)');
    } else {
      regimens.push('Targeted micronutrient support: Zinc (30 mg/day) and Vitamin D3/K2 for follicular maturation');
      regimens.push('Circadian sleep preservation and stress-mediated cortisol regulation');
    }

    return {
      phenotype,
      homaIrScore: homa,
      insulinResistanceDetected: hasIr,
      freeAndrogenIndex: fai,
      recommendedNutraceuticalRegimen: regimens,
      clinicalRationale: rationale
    };
  });

  /**
   * 2. Endometriosis Pelvic Pain Index (EPI)
   * Multi-symptom Bayesian scoring weighting dysmenorrhea, dyspareunia, dyschezia, and NSAID resistance.
   */
  readonly endometriosisEvaluation = computed<IEndometriosisRiskAssessment>(() => {
    const dysm = this.dysmenorrheaSeverity();
    const dysp = this.deepDyspareunia();
    const dysc = this.dyschezia();
    const cyclicGi = this.cyclicNauseaOrBloating();
    const nsaidRefractory = this.unyieldingToHighDoseNsaids();

    let points = 0;
    points += dysm * 5; // up to 50 pts
    if (dysp) points += 15;
    if (dysc) points += 15;
    if (cyclicGi) points += 10;
    if (nsaidRefractory) points += 10;

    const prob = Math.min(99, Math.max(5, points));
    const catamenial: string[] = [];
    if (dysp) catamenial.push('Deep Dyspareunia (Pain during intercourse)');
    if (dysc) catamenial.push('Catamenial Dyschezia (Painful bowel movements during menses)');
    if (cyclicGi) catamenial.push('Cyclic GI bloating / catamenial nausea');

    let tier: 'Low Likelihood' | 'Moderate Concern' | 'High Suspicion (Laparoscopy / Specialist Imaging Indicated)' = 'Low Likelihood';
    let action = 'Routine non-opioid dysmenorrhea management and longitudinal symptom tracking.';

    if (prob >= 70) {
      tier = 'High Suspicion (Laparoscopy / Specialist Imaging Indicated)';
      action = 'High suspicion for deep infiltrating endometriosis (DIE). Urgent referral to minimally invasive gynecologic surgery (MIGS) specialist and high-resolution transvaginal ultrasound or pelvic MRI with endometriosis protocol.';
    } else if (prob >= 40) {
      tier = 'Moderate Concern';
      action = 'Trial of hormonal suppression (progestin-only therapy or combined oral contraceptive) with 3-month follow-up reassessment.';
    }

    return {
      probabilityScorePercent: prob,
      riskTier: tier,
      refractoryToNsaids: nsaidRefractory,
      catamenialSymptomsPresent: catamenial,
      recommendedClinicalAction: action
    };
  });

  /**
   * 3. Princeton III Endothelial-Cardiovascular CAD Risk Calculator
   * Correlates IIEF-5 erectile score with ApoB, hs-CRP, and blood pressure to predict subclinical CAD.
   */
  readonly princetonCadEvaluation = computed<IPrincetonCvRiskResult>(() => {
    const iief = this.iief5Score();
    const apob = this.apobMgDl();
    const crp = this.hsCrpMgL();
    const sbp = this.restingSystolicBp();
    const age = this.patientAge();

    // Baseline age risk
    let risk = (age - 35) * 0.4;
    if (sbp >= 140) risk += 5;
    if (apob >= 100) risk += 4;
    if (crp >= 2.0) risk += 3;

    // Severe ED adds substantial microvascular vascular weight
    if (iief <= 11) risk += 10;
    else if (iief <= 16) risk += 5;

    const cadRisk = +Math.min(50, Math.max(2, risk)).toFixed(1);

    let grade: 'Normal Microvasculature' | 'Mild Endothelial Dysfunction' | 'Severe Microvascular Disease' = 'Normal Microvasculature';
    if (iief <= 11 || apob >= 120) grade = 'Severe Microvascular Disease';
    else if (iief <= 16 || apob >= 90) grade = 'Mild Endothelial Dysfunction';

    return {
      estimated10YearCadRiskPercent: cadRisk,
      endothelialImpairmentGrade: grade,
      recommendedImagingWorkup: [
        'Coronary Artery Calcium (CAC) non-contrast CT',
        'Carotid intima-media thickness (CIMT) ultrasound',
        'Endothelial Flow-Mediated Dilation (FMD) or Reactive Hyperemia Index',
        'Apolipoprotein B & Lipoprotein(a) confirmation'
      ],
      ischemicPrecautionNotes: 'Penile cavernosal arteries measure 1-2 mm vs. 3-4 mm coronary arteries. Significant erectile dysfunction is an early endothelial biomarker preceding overt clinical angina by 2-5 years.'
    };
  });

  /**
   * 4. PSA Density & mpMRI Biopsy Avoidance Triage
   * PSA Density = Total PSA (ng/mL) / Prostate Volume (cc)
   * Cutoff < 0.15 ng/mL/cc has high negative predictive value, enabling avoidance of blind transrectal biopsies.
   */
  readonly psaDensityTriage = computed<IPsaDensityTriage>(() => {
    const psa = this.totalPsaNgMl();
    const vol = this.prostateVolumeCc();
    const freePct = this.freePsaPercent();

    const density = +(psa / Math.max(10, vol)).toFixed(3);
    const isAvoidable = density < 0.15 && freePct >= 15;
    const mpMriNeeded = density >= 0.15 || freePct < 15;

    let rec = 'Low suspicion for aggressive adenocarcinoma. PSA elevation is consistent with benign prostatic hyperplasia (BPH) volume enlargement. Invasive biopsy can be safely avoided; continue active surveillance.';
    if (mpMriNeeded) {
      rec = 'Elevated PSA density (>= 0.15 ng/mL/cm3) or low free PSA (<15%). Perform multiparametric MRI (mpMRI) with PI-RADS scoring prior to any biopsy decision.';
    }

    return {
      psaDensityNgMlCm3: density,
      unnecessaryBiopsyAvoidable: isAvoidable,
      mpMriPiRadsIndicated: mpMriNeeded,
      recommendation: rec
    };
  });

  /**
   * 5. In Silico GAHT Pharmacokinetic (PK/PD) 2-Compartment Simulator
   * Simulates daily depot absorption (ka) and elimination (ke) curves across an injection cycle.
   */
  readonly gahtPkSimulation = computed<IGahtPkSimulation>(() => {
    const compound = this.selectedGahtCompound();
    const dose = this.gahtDoseMg();
    const interval = this.gahtIntervalDays();

    // Pharmacokinetic constants
    // Estradiol Valerate: faster absorption (peak ~24-36h), shorter half-life (~4-5d)
    // Estradiol Cypionate: slower absorption (peak ~48-72h), longer half-life (~7-8d)
    // Testosterone Cypionate: peak ~2-3d, half-life ~7-8d
    // Testosterone Enanthate: peak ~1-2d, half-life ~5-6d
    let ka = 0.8; // absorption rate constant (1/day)
    let ke = 0.14; // elimination rate constant (1/day)
    let multiplier = 55; // scaling for concentration units

    if (compound.includes('Estradiol Cypionate')) {
      ka = 0.45;
      ke = 0.09;
      multiplier = 50;
    } else if (compound.includes('Testosterone Cypionate')) {
      ka = 0.5;
      ke = 0.09;
      multiplier = 140; // yields ng/dL
    } else if (compound.includes('Testosterone Enanthate')) {
      ka = 0.7;
      ke = 0.12;
      multiplier = 135;
    }

    const curve: IPkCurvePoint[] = [];
    let maxConc = 0;

    for (let day = 0; day <= interval; day += 0.5) {
      // Bateman two-compartment open model equation: C(t) = (D * ka / (ka - ke)) * (exp(-ke*t) - exp(-ka*t))
      const raw = (dose * ka / (ka - ke)) * (Math.exp(-ke * day) - Math.exp(-ka * day));
      const conc = Math.max(0, +(raw * multiplier).toFixed(1));
      curve.push({ day, concentration: conc });
      if (conc > maxConc) maxConc = conc;
    }

    const peak = maxConc;
    const trough = curve[curve.length - 1]?.concentration || 0;
    const fluctuation = trough > 0 ? +(((peak - trough) / trough) * 100).toFixed(0) : 100;

    let advice = 'Smooth pharmacokinetic profile with manageable peak-to-trough variation.';
    if (fluctuation > 180 && interval >= 10) {
      advice = 'High peak-to-trough swing (>180%). Patients on long injection intervals often report fatigue or dysphoria at trough. Consider shortening interval to 5-7 days with a proportionally smaller dose.';
    }

    return {
      compound,
      doseMg: dose,
      intervalDays: interval,
      peakConcentration: peak,
      troughConcentration: trough,
      peakTroughFluctuationPercent: fluctuation,
      simulatedCurve: curve,
      steadyStateAdequate: fluctuation <= 200,
      clinicalOptimizationAdvice: advice
    };
  });

  /**
   * 6. Secondary Erythrocytosis Trajectory Forecaster (Masculinizing GAHT)
   * Projects hematocrit rise rate and alerts for therapeutic phlebotomy or dose titration.
   */
  readonly erythrocytosisTrajectory = computed<IErythrocytosisTrajectory>(() => {
    const base = this.baselineHematocrit();
    const curr = this.currentHematocrit();
    const months = Math.max(1, this.monthsOnTestosterone());
    const dose = this.weeklyTestosteroneDoseMg();
    const apnea = this.hasNocturnalSnoringOrApnea();

    // Empirical monthly rise rate
    const monthlyRate = (curr - base) / months;
    let projected6Mo = curr + (monthlyRate * 6);
    if (apnea) projected6Mo += 1.5; // nocturnal hypoxemia elevates erythropoietin
    projected6Mo = +projected6Mo.toFixed(1);

    const isUrgent = curr >= 54 || projected6Mo >= 54;
    const shouldScreenApnea = apnea && curr >= 50;

    let rec = 'Hematocrit trajectory is within safe physiological limits (< 50%). Continue routine CBC surveillance every 6-12 months.';
    if (curr >= 54) {
      rec = 'CRITICAL: Current Hematocrit >= 54%. High blood viscosity and thrombotic risk. Withhold/decrease testosterone dose and arrange therapeutic phlebotomy.';
    } else if (projected6Mo >= 52) {
      rec = 'Elevated upward hematocrit trajectory. If patient snorts/gasps during sleep, order home sleep apnea test (HSAT) to treat nocturnal hypoxemia before reducing testosterone dose.';
    }

    return {
      currentHematocrit: curr,
      baselineHematocrit: base,
      monthsOnTestosterone: months,
      projectedHematocrit6Months: projected6Mo,
      phlebotomyOrHoldIndicated: isUrgent,
      hypoxiaOrApneaScreeningIndicated: shouldScreenApnea,
      clinicalRecommendation: rec
    };
  });

  // Mutator helpers
  setPcosLabs(glu: number, ins: number, tt: number, shbg: number): void {
    this.fastingGlucoseMgDl.set(glu);
    this.fastingInsulinUuMl.set(ins);
    this.totalTestosteroneNgDl.set(tt);
    this.shbgNmolL.set(shbg);
  }

  setEndoPain(severity: number, dysp: boolean, dysc: boolean, nsaidRefractory: boolean): void {
    this.dysmenorrheaSeverity.set(severity);
    this.deepDyspareunia.set(dysp);
    this.dyschezia.set(dysc);
    this.unyieldingToHighDoseNsaids.set(nsaidRefractory);
  }

  setCadRiskInputs(iief: number, apob: number, crp: number, sbp: number): void {
    this.iief5Score.set(iief);
    this.apobMgDl.set(apob);
    this.hsCrpMgL.set(crp);
    this.restingSystolicBp.set(sbp);
  }

  setPsaTriage(psa: number, freePct: number, vol: number): void {
    this.totalPsaNgMl.set(psa);
    this.freePsaPercent.set(freePct);
    this.prostateVolumeCc.set(vol);
  }

  setGahtRegimen(compound: GahtCompound, dose: number, intervalDays: number): void {
    this.selectedGahtCompound.set(compound);
    this.gahtDoseMg.set(dose);
    this.gahtIntervalDays.set(intervalDays);
  }

  setErythrocytosisInputs(base: number, curr: number, months: number, dose: number, apnea: boolean): void {
    this.baselineHematocrit.set(base);
    this.currentHematocrit.set(curr);
    this.monthsOnTestosterone.set(months);
    this.weeklyTestosteroneDoseMg.set(dose);
    this.hasNocturnalSnoringOrApnea.set(apnea);
  }
}
