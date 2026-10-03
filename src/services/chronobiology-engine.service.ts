import { Injectable, signal, computed } from '@angular/core';

export type TCirCadianBpPhenotype =
  | 'NORMAL_DIPPER'
  | 'NON_DIPPER'
  | 'REVERSE_RISER'
  | 'EXTREME_DIPPER';

export type TChronotherapyDrugClass =
  | 'STATIN'
  | 'ANTIHYPERTENSIVE_ACE_ARB'
  | 'ANTIHYPERTENSIVE_CCB'
  | 'GLUCOCORTICOID'
  | 'THYROID'
  | 'PPI'
  | 'ANTIPLATELET'
  | 'OTHER';

export interface IBloodPressureChronobiology {
  daytimeSystolic: number;
  daytimeDiastolic: number;
  nocturnalSystolic: number;
  nocturnalDiastolic: number;
  systolicDippingPercent: number;
  diastolicDippingPercent: number;
  phenotype: TCirCadianBpPhenotype;
  phenotypeDescription: string;
  cardiovascularEventRiskRatio: number;
  chronotherapyRecommendation: string;
}

export interface IChronotherapySchedule {
  medicationName: string;
  drugClass: TChronotherapyDrugClass;
  halfLifeHours: number;
  currentDosingTimeHour: number;
  optimalDosingTimeWindow: string;
  optimalDosingHour: number;
  timingShiftRecommended: boolean;
  circadianBiologicalMechanism: string;
  efficacyGainPercent: number;
  adverseEventReductionPercent: number;
  clinicalTrialEvidence: string;
  recommendationPriority: 'MANDATORY' | 'HIGH' | 'SUPPORTIVE';
}

export interface ICortisolDiurnalProfile {
  awakeningCortisolUgDl: number;
  afternoonCortisolUgDl: number;
  nocturnalCortisolUgDl: number;
  cortisolAwakeningResponseCar: number;
  diurnalSlope: 'PHYSIOLOGICAL_STEEP' | 'FLATTENED_CHRONIC_EXHAUSTION' | 'PARADOXICAL_NOCTURNAL_SPIKE';
  hpaAxisAcuity: 'BALANCED_EUSTRESS' | 'ACUTE_HYPERCORTISOLEMIA' | 'BURNOUT_HYPOCORTISOLEMIA';
  recommendedPacingInterventions: string[];
}

export interface IChronobiologyComprehensiveAudit {
  patientId: string;
  timestamp: number;
  bpChronobiology: IBloodPressureChronobiology;
  cortisolProfile: ICortisolDiurnalProfile;
  optimizedMedications: IChronotherapySchedule[];
  overallCircadianAlignmentScore: number;
  keyClinicalDirectives: string[];
  integrityDigest: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChronobiologyEngineService {
  readonly lastAudit = signal<IChronobiologyComprehensiveAudit | null>(null);

  /**
   * Evaluates ambulatory blood pressure monitoring (ABPM) dipping chronobiology.
   * Quantifies nocturnal systolic dipping percentage to classify cardiovascular risk.
   */
  classifyBpDippingPhenotype(
    daytimeSys: number,
    daytimeDia: number,
    nocturnalSys: number,
    nocturnalDia: number
  ): IBloodPressureChronobiology {
    const sysDipping = Number((((daytimeSys - nocturnalSys) / Math.max(1, daytimeSys)) * 100).toFixed(1));
    const diaDipping = Number((((daytimeDia - nocturnalDia) / Math.max(1, daytimeDia)) * 100).toFixed(1));

    let phenotype: TCirCadianBpPhenotype = 'NORMAL_DIPPER';
    let phenotypeDescription = 'Normal physiological 10-20% nocturnal blood pressure reduction.';
    let cardiovascularEventRiskRatio = 1.0;
    let chronotherapyRecommendation = 'Maintain morning or standard split dosing of antihypertensives.';

    if (sysDipping < 0) {
      phenotype = 'REVERSE_RISER';
      phenotypeDescription = 'Paradoxical nocturnal blood pressure surge (Riser pattern). Severe cardiovascular & stroke vulnerability.';
      cardiovascularEventRiskRatio = 3.2;
      chronotherapyRecommendation = 'Strict bedtime administration of RAAS inhibitors / CCBs required. Immediate polysomnography for OSA.';
    } else if (sysDipping < 10) {
      phenotype = 'NON_DIPPER';
      phenotypeDescription = 'Blunted nocturnal blood pressure decline (<10%). High risk for left ventricular hypertrophy and CKD progression.';
      cardiovascularEventRiskRatio = 2.1;
      chronotherapyRecommendation = 'Shift RAAS inhibitor (ACEi/ARB) or CCB from morning to bedtime (20:00-22:00) to restore nocturnal dipping.';
    } else if (sysDipping > 20) {
      phenotype = 'EXTREME_DIPPER';
      phenotypeDescription = 'Excessive nocturnal blood pressure drop (>20%). Risk of ischemic optic neuropathy (NAION) and watershed stroke.';
      cardiovascularEventRiskRatio = 1.8;
      chronotherapyRecommendation = 'Prohibit bedtime antihypertensive administration. Restrict all blood pressure medications to morning (07:00-09:00).';
    }

    return {
      daytimeSystolic: daytimeSys,
      daytimeDiastolic: daytimeDia,
      nocturnalSystolic: nocturnalSys,
      nocturnalDiastolic: nocturnalDia,
      systolicDippingPercent: sysDipping,
      diastolicDippingPercent: diaDipping,
      phenotype,
      phenotypeDescription,
      cardiovascularEventRiskRatio,
      chronotherapyRecommendation
    };
  }

  /**
   * Optimizes medication administration timing based on circadian pharmacokinetics.
   */
  optimizeMedicationTiming(params: {
    name: string;
    dose?: string;
    currentHour: number;
    bpPhenotype?: TCirCadianBpPhenotype;
  }): IChronotherapySchedule {
    const medLower = params.name.toLowerCase();
    const currentHour = params.currentHour;
    const bpPhenotype = params.bpPhenotype || 'NORMAL_DIPPER';

    // 1. STATINS (Short Half-Life vs Long Half-Life)
    if (medLower.includes('simvastatin') || medLower.includes('pravastatin') || medLower.includes('fluvastatin') || medLower.includes('lovastatin')) {
      const isMorning = currentHour < 17;
      return {
        medicationName: params.name,
        drugClass: 'STATIN',
        halfLifeHours: 2.5,
        currentDosingTimeHour: currentHour,
        optimalDosingTimeWindow: 'Evening / Bedtime (20:00–22:00)',
        optimalDosingHour: 21,
        timingShiftRecommended: isMorning,
        circadianBiologicalMechanism: 'Hepatic HMG-CoA reductase cholesterol synthesis peaks midnight to 04:00 AM under SREBP-2/CLOCK control.',
        efficacyGainPercent: isMorning ? 28 : 0,
        adverseEventReductionPercent: 12,
        clinicalTrialEvidence: 'Short-acting statins dosed at bedtime produce up to 28% greater reduction in LDL-C vs morning dosing.',
        recommendationPriority: isMorning ? 'MANDATORY' : 'SUPPORTIVE'
      };
    }

    if (medLower.includes('atorvastatin') || medLower.includes('rosuvastatin')) {
      return {
        medicationName: params.name,
        drugClass: 'STATIN',
        halfLifeHours: 16.0,
        currentDosingTimeHour: currentHour,
        optimalDosingTimeWindow: 'Evening (20:00–21:00) or consistent daily hour',
        optimalDosingHour: 20,
        timingShiftRecommended: false,
        circadianBiologicalMechanism: 'Long half-life (>14h) confers 24h hepatic coverage; bedtime dosing retains slight circadian synergy.',
        efficacyGainPercent: 6,
        adverseEventReductionPercent: 5,
        clinicalTrialEvidence: 'Long-acting statins demonstrate equivalent 24h efficacy with minor evening preference.',
        recommendationPriority: 'SUPPORTIVE'
      };
    }

    // 2. ANTIHYPERTENSIVES (ACE Inhibitors / ARBs)
    if (medLower.includes('lisinopril') || medLower.includes('losartan') || medLower.includes('valsartan') || medLower.includes('ramipril') || medLower.includes('telmisartan') || medLower.includes('enalapril')) {
      const isNonDipper = bpPhenotype === 'NON_DIPPER' || bpPhenotype === 'REVERSE_RISER';
      const isExtremeDipper = bpPhenotype === 'EXTREME_DIPPER';

      if (isExtremeDipper) {
        return {
          medicationName: params.name,
          drugClass: 'ANTIHYPERTENSIVE_ACE_ARB',
          halfLifeHours: 12.0,
          currentDosingTimeHour: currentHour,
          optimalDosingTimeWindow: 'Morning (07:00–09:00)',
          optimalDosingHour: 8,
          timingShiftRecommended: currentHour > 15,
          circadianBiologicalMechanism: 'Extreme nocturnal dipping (>20%) risks watershed cerebral and optic nerve ischemia.',
          efficacyGainPercent: 10,
          adverseEventReductionPercent: 35,
          clinicalTrialEvidence: 'Avoid bedtime dosing in extreme dippers to prevent nocturnal hypotension and ischemic optic neuropathy.',
          recommendationPriority: 'MANDATORY'
        };
      }

      if (isNonDipper) {
        const needsShift = currentHour < 18;
        return {
          medicationName: params.name,
          drugClass: 'ANTIHYPERTENSIVE_ACE_ARB',
          halfLifeHours: 12.0,
          currentDosingTimeHour: currentHour,
          optimalDosingTimeWindow: 'Bedtime (20:00–22:00)',
          optimalDosingHour: 21,
          timingShiftRecommended: needsShift,
          circadianBiologicalMechanism: 'Restores nocturnal dipping by suppressing nocturnal plasma renin and aldosterone surges during sleep.',
          efficacyGainPercent: 32,
          adverseEventReductionPercent: 45,
          clinicalTrialEvidence: 'Hygia Chronotherapy Trial: Bedtime ingestion in non-dippers achieves 45% reduction in cardiovascular death.',
          recommendationPriority: 'MANDATORY'
        };
      }

      return {
        medicationName: params.name,
        drugClass: 'ANTIHYPERTENSIVE_ACE_ARB',
        halfLifeHours: 12.0,
        currentDosingTimeHour: currentHour,
        optimalDosingTimeWindow: 'Morning (07:00–09:00)',
        optimalDosingHour: 8,
        timingShiftRecommended: false,
        circadianBiologicalMechanism: 'Preserves physiological 10-20% nocturnal dipping profile.',
        efficacyGainPercent: 5,
        adverseEventReductionPercent: 10,
        clinicalTrialEvidence: 'Standard morning administration appropriate for physiological dippers.',
        recommendationPriority: 'SUPPORTIVE'
      };
    }

    // 3. GLUCOCORTICOIDS (Prednisone, Hydrocortisone, Methylprednisolone, Dexamethasone)
    if (medLower.includes('prednisone') || medLower.includes('hydrocortisone') || medLower.includes('methylprednisolone') || medLower.includes('dexamethasone')) {
      const isEvening = currentHour > 14;
      return {
        medicationName: params.name,
        drugClass: 'GLUCOCORTICOID',
        halfLifeHours: 3.0,
        currentDosingTimeHour: currentHour,
        optimalDosingTimeWindow: 'Early Morning upon Awakening (07:00–08:00)',
        optimalDosingHour: 7,
        timingShiftRecommended: isEvening,
        circadianBiologicalMechanism: 'Mimics endogenous Cortisol Awakening Response (CAR); evening dosing causes severe pituitary ACTH suppression.',
        efficacyGainPercent: 20,
        adverseEventReductionPercent: isEvening ? 55 : 10,
        clinicalTrialEvidence: 'Morning glucocorticoid dosing minimizes secondary adrenal insufficiency and steroid-induced insomnia.',
        recommendationPriority: isEvening ? 'MANDATORY' : 'SUPPORTIVE'
      };
    }

    // 4. PROTON PUMP INHIBITORS (Omeprazole, Pantoprazole, Esomeprazole)
    if (medLower.includes('omeprazole') || medLower.includes('pantoprazole') || medLower.includes('esomeprazole')) {
      const isNight = currentHour > 11;
      return {
        medicationName: params.name,
        drugClass: 'PPI',
        halfLifeHours: 1.5,
        currentDosingTimeHour: currentHour,
        optimalDosingTimeWindow: '30–60 minutes before first meal of day (07:00–08:00)',
        optimalDosingHour: 7,
        timingShiftRecommended: isNight,
        circadianBiologicalMechanism: 'Binds active H+/K+ ATPase pumps inserted upon feeding; unactivated nighttime pumps remain uninhibited.',
        efficacyGainPercent: isNight ? 35 : 0,
        adverseEventReductionPercent: 15,
        clinicalTrialEvidence: 'Pre-breakfast PPI administration doubles intragastric acid suppression duration compared to bedtime dosing.',
        recommendationPriority: isNight ? 'HIGH' : 'SUPPORTIVE'
      };
    }

    // 5. THYROID HORMONE (Levothyroxine)
    if (medLower.includes('levothyroxine') || medLower.includes('synthroid')) {
      return {
        medicationName: params.name,
        drugClass: 'THYROID',
        halfLifeHours: 168.0,
        currentDosingTimeHour: currentHour,
        optimalDosingTimeWindow: 'Morning 60m before breakfast (06:00) OR Bedtime 3h after dinner (22:00)',
        optimalDosingHour: 6,
        timingShiftRecommended: false,
        circadianBiologicalMechanism: 'Gastric acid and empty stomach maximize intestinal T4 deiodination and absorption.',
        efficacyGainPercent: 15,
        adverseEventReductionPercent: 10,
        clinicalTrialEvidence: 'Bedtime or fasting morning administration avoids food/calcium chelation.',
        recommendationPriority: 'HIGH'
      };
    }

    // Default / Other
    return {
      medicationName: params.name,
      drugClass: 'OTHER',
      halfLifeHours: 8.0,
      currentDosingTimeHour: currentHour,
      optimalDosingTimeWindow: 'Consistent diurnal schedule',
      optimalDosingHour: currentHour,
      timingShiftRecommended: false,
      circadianBiologicalMechanism: 'Standard metabolic steady-state clearance.',
      efficacyGainPercent: 0,
      adverseEventReductionPercent: 0,
      clinicalTrialEvidence: 'Follow standard prescriptive labeling.',
      recommendationPriority: 'SUPPORTIVE'
    };
  }

  /**
   * Evaluates hypothalamic-pituitary-adrenal (HPA) axis cortisol circadian rhythm.
   */
  evaluateCortisolDiurnalProfile(
    awakening: number,
    afternoon: number,
    nocturnal: number
  ): ICortisolDiurnalProfile {
    const carDelta = Number((awakening - nocturnal).toFixed(2));
    let diurnalSlope: ICortisolDiurnalProfile['diurnalSlope'] = 'PHYSIOLOGICAL_STEEP';
    let hpaAxisAcuity: ICortisolDiurnalProfile['hpaAxisAcuity'] = 'BALANCED_EUSTRESS';
    const pacing: string[] = [];

    if (nocturnal > 4.5 || nocturnal > afternoon) {
      diurnalSlope = 'PARADOXICAL_NOCTURNAL_SPIKE';
      hpaAxisAcuity = 'ACUTE_HYPERCORTISOLEMIA';
      pacing.push('Evening Phosphatidylserine (300mg) and Ashwagandha to blunt nocturnal cortisol spike.');
      pacing.push('Strict elimination of blue light (<480nm) 2 hours before target sleep onset.');
      pacing.push('Evaluate for late-night hyperinsulinemia and sympathetic baroreflex dysregulation.');
    } else if (awakening < 8.0 && afternoon < 4.0) {
      diurnalSlope = 'FLATTENED_CHRONIC_EXHAUSTION';
      hpaAxisAcuity = 'BURNOUT_HYPOCORTISOLEMIA';
      pacing.push('Morning 15-minute outdoor lux photon anchoring (>10,000 lux) within 30m of waking.');
      pacing.push('Gentle adaptogenic support (Rhodiola rosea, Panax ginseng) in early morning.');
      pacing.push('Strict avoidance of high-intensity glycolytic training in late afternoon/evening.');
    } else {
      pacing.push('Physiological diurnal slope intact; maintain current sleep-wake consistency.');
    }

    return {
      awakeningCortisolUgDl: awakening,
      afternoonCortisolUgDl: afternoon,
      nocturnalCortisolUgDl: nocturnal,
      cortisolAwakeningResponseCar: carDelta,
      diurnalSlope,
      hpaAxisAcuity,
      recommendedPacingInterventions: pacing
    };
  }

  /**
   * Generates comprehensive chronotherapy clinical audit for a patient.
   */
  generateComprehensiveChronotherapyAudit(
    patientId: string,
    vitals: {
      daytimeSystolic?: number;
      daytimeDiastolic?: number;
      nocturnalSystolic?: number;
      nocturnalDiastolic?: number;
      awakeningCortisol?: number;
      afternoonCortisol?: number;
      nocturnalCortisol?: number;
    },
    medications: Array<{ name: string; dose?: string; currentHour: number }>
  ): IChronobiologyComprehensiveAudit {
    const bp = this.classifyBpDippingPhenotype(
      vitals.daytimeSystolic || 135,
      vitals.daytimeDiastolic || 85,
      vitals.nocturnalSystolic || 130,
      vitals.nocturnalDiastolic || 82
    );

    const cortisol = this.evaluateCortisolDiurnalProfile(
      vitals.awakeningCortisol || 14.5,
      vitals.afternoonCortisol || 6.2,
      vitals.nocturnalCortisol || 1.8
    );

    const optimized = medications.map(med =>
      this.optimizeMedicationTiming({
        name: med.name,
        dose: med.dose,
        currentHour: med.currentHour,
        bpPhenotype: bp.phenotype
      })
    );

    const misalignedCount = optimized.filter(m => m.timingShiftRecommended).length;
    const scorePenalty = misalignedCount * 20 + (bp.phenotype === 'REVERSE_RISER' ? 25 : bp.phenotype === 'NON_DIPPER' ? 15 : 0);
    const overallScore = Math.max(20, Math.min(100, 100 - scorePenalty));

    const directives: string[] = [];
    if (bp.phenotype === 'NON_DIPPER' || bp.phenotype === 'REVERSE_RISER') {
      directives.push(bp.chronotherapyRecommendation);
    }
    for (const med of optimized) {
      if (med.timingShiftRecommended) {
        directives.push(`Shift ${med.medicationName} to ${med.optimalDosingTimeWindow} (${med.clinicalTrialEvidence})`);
      }
    }
    directives.push(...cortisol.recommendedPacingInterventions);

    const timestamp = Date.now();
    const digest = this.computeAuditDigest(patientId, timestamp, bp.phenotype, overallScore);

    const audit: IChronobiologyComprehensiveAudit = {
      patientId,
      timestamp,
      bpChronobiology: bp,
      cortisolProfile: cortisol,
      optimizedMedications: optimized,
      overallCircadianAlignmentScore: overallScore,
      keyClinicalDirectives: directives,
      integrityDigest: digest
    };

    this.lastAudit.set(audit);
    return audit;
  }

  private computeAuditDigest(patientId: string, timestamp: number, phenotype: string, score: number): string {
    let h1 = 0x811c9dc5;
    let h2 = 0x9e3779b9;
    const str = `${patientId}::${timestamp}::${phenotype}::${score}`;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 ^= ch;
      h1 = Math.imul(h1, 0x01000193);
      h2 = Math.imul(h2 ^ ch, 0x5bd1e995);
      h2 ^= h2 >>> 15;
    }
    const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
    const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
    const hex3 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
    const hex4 = ((Math.imul(h1, 31) + h2) >>> 0).toString(16).padStart(8, '0');
    return `0x_chrono_${hex1}${hex2}${hex3}${hex4}`;
  }
}
