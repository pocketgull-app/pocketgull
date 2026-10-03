import { Injectable, signal, computed } from '@angular/core';

export interface IBergmanParameters {
  basalGlucoseMgDl: number; // G_b (mg/dL)
  basalInsulinUuMl: number; // I_b (μU/mL)
  glucoseEffectivenessSg: number; // S_G (min^-1), p1
  insulinActionDeactivationP2: number; // p2 (min^-1)
  insulinActionStimulationP3: number; // p3 (min^-2 / (μU/mL))
  acuteInsulinResponseAirG: number; // AIR_g (μU/mL * min)
}

export interface ICgmTelemetryInputs {
  sensorReadingsMgDl: number[];
  nocturnalNadir0300MgDl: number;
  fastingMorning0700MgDl: number;
  bedtimeGlucose2300MgDl: number;
}

export interface ICgmAgpMetrics {
  meanGlucoseMgDl: number;
  standardDeviationMgDl: number;
  coefficientOfVariationPercent: number; // %CV = (SD / Mean) * 100
  cvStatus: 'Stable Glycemic Profile (CV <= 36%)' | 'Elevated Glycemic Variability (CV > 36%)';
  glucoseManagementIndicatorGmiPercent: number; // GMI = 3.31 + 0.02392 * Mean
  timeInRangeTirPercent: number; // 70 - 180 mg/dL (target >= 70%)
  timeBelowRangeTbrLevel1Percent: number; // 54 - 69 mg/dL (target < 4%)
  timeBelowRangeTbrLevel2Percent: number; // < 54 mg/dL (target < 1%)
  timeAboveRangeTarLevel1Percent: number; // 181 - 250 mg/dL (target < 25%)
  timeAboveRangeTarLevel2Percent: number; // > 250 mg/dL (target < 5%)
  clinicalAttdCompliance: 'Meets Consensus Targets' | 'Suboptimal TIR' | 'Critical Hypoglycemia Alert';
}

export interface IBergmanKineticsResult {
  insulinSensitivityIndexSi: number; // S_I = p3 / p2 (10^-4 min^-1 / (μU/mL))
  dispositionIndexDi: number; // DI = S_I * AIR_g
  betaCellCompensationTier: 'Robust Hyperbolic Compensation' | 'Compensated Insulin Resistance' | 'Impaired Beta-Cell Secretion' | 'Severe Beta-Cell Failure';
  glucoseDisappearanceVelocityPercentPerHour: number;
  trajectory: Array<{ timeMin: number; glucoseMgDl: number; remoteInsulinActionX: number }>;
}

export interface INocturnalPhenotypeReport {
  phenotype: 'Physiological Nocturnal Stability' | 'Dawn Phenomenon' | 'Somogyi Rebound Effect' | 'Persistent Nocturnal Hyperglycemia';
  nadir0300MgDl: number;
  morning0700MgDl: number;
  deltaDawnMgDl: number;
  clinicalAction: string;
  recommendationTier: 'Maintain Current Regimen' | 'Adjust Evening Basal Timing/Dose' | 'De-escalate Evening Basal / Add Complex Snack' | 'Titrate Basal Upward';
}

export type GlycemicPresetMode =
  | 'healthy_athlete'
  | 'metabolic_syndrome_ir'
  | 'type_1_brittle_dawn'
  | 'somogyi_rebound'
  | 'type_2_decompensated';

@Injectable({
  providedIn: 'root'
})
export class GlycemicMinimalModelService {
  readonly bergmanParams = signal<IBergmanParameters>({
    basalGlucoseMgDl: 92,
    basalInsulinUuMl: 8.5,
    glucoseEffectivenessSg: 0.026, // min^-1
    insulinActionDeactivationP2: 0.028, // min^-1
    insulinActionStimulationP3: 0.0000196, // min^-2 / (μU/mL) -> Si = 7.0e-4
    acuteInsulinResponseAirG: 280 // μU/mL * min
  });

  readonly cgmInputs = signal<ICgmTelemetryInputs>({
    sensorReadingsMgDl: [
      95, 98, 102, 135, 148, 140, 122, 110, 104, 99, 105, 142,
      155, 138, 120, 108, 102, 115, 130, 125, 112, 100, 96, 92
    ],
    bedtimeGlucose2300MgDl: 110,
    nocturnalNadir0300MgDl: 94,
    fastingMorning0700MgDl: 98
  });

  readonly activePreset = signal<GlycemicPresetMode>('healthy_athlete');

  // Bergman Minimal Model Computations
  readonly bergmanKinetics = computed<IBergmanKineticsResult>(() => {
    const p = this.bergmanParams();
    const p2 = Math.max(0.005, p.insulinActionDeactivationP2);
    const p3 = Math.max(0, p.insulinActionStimulationP3);
    const p1 = Math.max(0.005, p.glucoseEffectivenessSg);
    const Gb = p.basalGlucoseMgDl;
    const Ib = p.basalInsulinUuMl;

    // S_I = (p3 / p2) * 10^4 for standard reporting units (10^-4 min^-1 / (μU/mL))
    const rawSi = p3 / p2;
    const siUnits = rawSi * 10000;

    const di = siUnits * p.acuteInsulinResponseAirG;

    let betaCellTier: IBergmanKineticsResult['betaCellCompensationTier'] = 'Robust Hyperbolic Compensation';
    if (di < 600) {
      betaCellTier = 'Severe Beta-Cell Failure';
    } else if (di < 1200) {
      betaCellTier = 'Impaired Beta-Cell Secretion';
    } else if (siUnits < 3.5) {
      betaCellTier = 'Compensated Insulin Resistance';
    }

    // Forward simulation of IVGTT / oral pulse over 180 minutes with Euler integration (dt = 1 min)
    const trajectory: Array<{ timeMin: number; glucoseMgDl: number; remoteInsulinActionX: number }> = [];
    let G = Gb + 120; // Initial glucose injection spike (+120 mg/dL above basal)
    let X = 0; // Remote compartment insulin action starts at 0

    for (let t = 0; t <= 180; t += 2) {
      trajectory.push({
        timeMin: t,
        glucoseMgDl: Math.round(G * 10) / 10,
        remoteInsulinActionX: Math.round(X * 100000) / 100000
      });

      // Simulated plasma insulin curve I(t) peaking at 5-10 min and decaying
      const injectedInsulinPulse = t < 30
        ? (p.acuteInsulinResponseAirG / 10) * Math.exp(-t / 8)
        : 0;
      const currentInsulin = Ib + injectedInsulinPulse;

      // Euler step for 2 minutes (2 sub-steps of dt = 1 min)
      for (let step = 0; step < 2; step++) {
        const dX = -p2 * X + p3 * (currentInsulin - Ib);
        const dG = -(p1 + X) * G + p1 * Gb;
        X = Math.max(0, X + dX);
        G = Math.max(40, G + dG);
      }
    }

    const glucoseDisappearanceVelocity = Math.round(p1 * 60 * 100) / 100; // % per hour

    return {
      insulinSensitivityIndexSi: Math.round(siUnits * 100) / 100,
      dispositionIndexDi: Math.round(di),
      betaCellCompensationTier: betaCellTier,
      glucoseDisappearanceVelocityPercentPerHour: glucoseDisappearanceVelocity,
      trajectory
    };
  });

  // Ambulatory Glucose Profile (AGP) Computations
  readonly cgmMetrics = computed<ICgmAgpMetrics>(() => {
    const readings = this.cgmInputs().sensorReadingsMgDl;
    if (!readings || readings.length === 0) {
      return {
        meanGlucoseMgDl: 100,
        standardDeviationMgDl: 15,
        coefficientOfVariationPercent: 15,
        cvStatus: 'Stable Glycemic Profile (CV <= 36%)',
        glucoseManagementIndicatorGmiPercent: 5.7,
        timeInRangeTirPercent: 100,
        timeBelowRangeTbrLevel1Percent: 0,
        timeBelowRangeTbrLevel2Percent: 0,
        timeAboveRangeTarLevel1Percent: 0,
        timeAboveRangeTarLevel2Percent: 0,
        clinicalAttdCompliance: 'Meets Consensus Targets'
      };
    }

    const n = readings.length;
    const sum = readings.reduce((acc, v) => acc + v, 0);
    const mean = sum / n;

    const variance = readings.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n > 1 ? n - 1 : 1);
    const sd = Math.sqrt(variance);
    const cv = mean > 0 ? (sd / mean) * 100 : 0;

    // GMI formula (standard consensus ATTD 2018/2024): 3.31 + 0.02392 * mean (in mg/dL)
    const gmi = 3.31 + 0.02392 * mean;

    let tirCount = 0;
    let tbrL1Count = 0;
    let tbrL2Count = 0;
    let tarL1Count = 0;
    let tarL2Count = 0;

    for (const val of readings) {
      if (val < 54) {
        tbrL2Count++;
      } else if (val < 70) {
        tbrL1Count++;
      } else if (val <= 180) {
        tirCount++;
      } else if (val <= 250) {
        tarL1Count++;
      } else {
        tarL2Count++;
      }
    }

    const tirPct = (tirCount / n) * 100;
    const tbrL1Pct = (tbrL1Count / n) * 100;
    const tbrL2Pct = (tbrL2Count / n) * 100;
    const tarL1Pct = (tarL1Count / n) * 100;
    const tarL2Pct = (tarL2Count / n) * 100;

    let compliance: ICgmAgpMetrics['clinicalAttdCompliance'] = 'Meets Consensus Targets';
    if (tbrL2Pct >= 1.0 || (tbrL1Pct + tbrL2Pct) >= 4.0) {
      compliance = 'Critical Hypoglycemia Alert';
    } else if (tirPct < 70.0) {
      compliance = 'Suboptimal TIR';
    }

    return {
      meanGlucoseMgDl: Math.round(mean * 10) / 10,
      standardDeviationMgDl: Math.round(sd * 10) / 10,
      coefficientOfVariationPercent: Math.round(cv * 10) / 10,
      cvStatus: cv <= 36 ? 'Stable Glycemic Profile (CV <= 36%)' : 'Elevated Glycemic Variability (CV > 36%)',
      glucoseManagementIndicatorGmiPercent: Math.round(gmi * 10) / 10,
      timeInRangeTirPercent: Math.round(tirPct * 10) / 10,
      timeBelowRangeTbrLevel1Percent: Math.round(tbrL1Pct * 10) / 10,
      timeBelowRangeTbrLevel2Percent: Math.round(tbrL2Pct * 10) / 10,
      timeAboveRangeTarLevel1Percent: Math.round(tarL1Pct * 10) / 10,
      timeAboveRangeTarLevel2Percent: Math.round(tarL2Pct * 10) / 10,
      compliance: compliance,
      clinicalAttdCompliance: compliance
    };
  });

  // Nocturnal Glycemic Discriminator (Dawn vs Somogyi)
  readonly nocturnalReport = computed<INocturnalPhenotypeReport>(() => {
    const inputs = this.cgmInputs();
    const nadir = inputs.nocturnalNadir0300MgDl;
    const morning = inputs.fastingMorning0700MgDl;
    const deltaDawn = morning - nadir;

    if (nadir < 70 && morning >= 140) {
      return {
        phenotype: 'Somogyi Rebound Effect',
        nadir0300MgDl: nadir,
        morning0700MgDl: morning,
        deltaDawnMgDl: deltaDawn,
        clinicalAction: 'Nocturnal hypoglycemia triggers counter-regulatory surge (epinephrine/glucagon). Reduce evening/bedtime basal insulin dose by 10-20% or add 15g complex carbohydrate snack before sleep.',
        recommendationTier: 'De-escalate Evening Basal / Add Complex Snack'
      };
    }

    if (nadir >= 90 && morning >= 140 && deltaDawn >= 30) {
      return {
        phenotype: 'Dawn Phenomenon',
        nadir0300MgDl: nadir,
        morning0700MgDl: morning,
        deltaDawnMgDl: deltaDawn,
        clinicalAction: 'Circadian GH/cortisol early morning insulin resistance without nocturnal hypoglycemia. Advance basal insulin timing closer to bedtime or increase basal rate from 04:00 to 08:00.',
        recommendationTier: 'Adjust Evening Basal Timing/Dose'
      };
    }

    if (nadir >= 140 && morning >= 160) {
      return {
        phenotype: 'Persistent Nocturnal Hyperglycemia',
        nadir0300MgDl: nadir,
        morning0700MgDl: morning,
        deltaDawnMgDl: deltaDawn,
        clinicalAction: 'Inadequate baseline overnight basal insulin coverage. Titrate total basal insulin upward by 1-2 units every 3 days until fasting glucose reaches 80-130 mg/dL target.',
        recommendationTier: 'Titrate Basal Upward'
      };
    }

    return {
      phenotype: 'Physiological Nocturnal Stability',
      nadir0300MgDl: nadir,
      morning0700MgDl: morning,
      deltaDawnMgDl: deltaDawn,
      clinicalAction: 'Normal overnight glycemic trajectory maintained within 70-120 mg/dL range with minimal dawn excursion. Maintain current therapeutic regimen.',
      recommendationTier: 'Maintain Current Regimen'
    };
  });

  applyPreset(preset: GlycemicPresetMode): void {
    this.activePreset.set(preset);

    switch (preset) {
      case 'healthy_athlete':
        this.bergmanParams.set({
          basalGlucoseMgDl: 88,
          basalInsulinUuMl: 6.0,
          glucoseEffectivenessSg: 0.028,
          insulinActionDeactivationP2: 0.025,
          insulinActionStimulationP3: 0.000021, // Si = 8.4
          acuteInsulinResponseAirG: 310
        });
        this.cgmInputs.set({
          sensorReadingsMgDl: [
            88, 92, 95, 118, 126, 115, 102, 94, 90, 88, 92, 120,
            132, 118, 100, 92, 88, 95, 110, 105, 96, 90, 88, 86
          ],
          bedtimeGlucose2300MgDl: 98,
          nocturnalNadir0300MgDl: 86,
          fastingMorning0700MgDl: 90
        });
        break;

      case 'metabolic_syndrome_ir':
        this.bergmanParams.set({
          basalGlucoseMgDl: 108,
          basalInsulinUuMl: 22.0,
          glucoseEffectivenessSg: 0.019,
          insulinActionDeactivationP2: 0.035,
          insulinActionStimulationP3: 0.0000077, // Si = 2.2
          acuteInsulinResponseAirG: 550
        });
        this.cgmInputs.set({
          sensorReadingsMgDl: [
            110, 115, 122, 175, 195, 180, 155, 138, 125, 118, 130, 185,
            205, 190, 160, 142, 130, 145, 178, 165, 145, 130, 122, 118
          ],
          bedtimeGlucose2300MgDl: 140,
          nocturnalNadir0300MgDl: 112,
          fastingMorning0700MgDl: 122
        });
        break;

      case 'type_1_brittle_dawn':
        this.bergmanParams.set({
          basalGlucoseMgDl: 125,
          basalInsulinUuMl: 4.0,
          glucoseEffectivenessSg: 0.016,
          insulinActionDeactivationP2: 0.032,
          insulinActionStimulationP3: 0.0000096, // Si = 3.0
          acuteInsulinResponseAirG: 45 // Severe insulinopenia
        });
        this.cgmInputs.set({
          sensorReadingsMgDl: [
            130, 145, 160, 220, 260, 240, 190, 140, 110, 85, 130, 235,
            275, 250, 185, 120, 95, 140, 210, 180, 150, 130, 160, 215
          ],
          bedtimeGlucose2300MgDl: 145,
          nocturnalNadir0300MgDl: 110,
          fastingMorning0700MgDl: 220
        });
        break;

      case 'somogyi_rebound':
        this.bergmanParams.set({
          basalGlucoseMgDl: 115,
          basalInsulinUuMl: 14.0,
          glucoseEffectivenessSg: 0.020,
          insulinActionDeactivationP2: 0.030,
          insulinActionStimulationP3: 0.000012, // Si = 4.0
          acuteInsulinResponseAirG: 180
        });
        this.cgmInputs.set({
          sensorReadingsMgDl: [
            120, 115, 105, 160, 185, 150, 120, 90, 80, 75, 110, 170,
            190, 165, 130, 95, 80, 115, 150, 130, 98, 70, 48, 238
          ],
          bedtimeGlucose2300MgDl: 125,
          nocturnalNadir0300MgDl: 48, // Level 2 hypoglycemia nadir
          fastingMorning0700MgDl: 238 // Rebound morning hyperglycemia
        });
        break;

      case 'type_2_decompensated':
        this.bergmanParams.set({
          basalGlucoseMgDl: 175,
          basalInsulinUuMl: 18.0,
          glucoseEffectivenessSg: 0.012,
          insulinActionDeactivationP2: 0.040,
          insulinActionStimulationP3: 0.0000048, // Si = 1.2
          acuteInsulinResponseAirG: 95 // Beta-cell exhaustion
        });
        this.cgmInputs.set({
          sensorReadingsMgDl: [
            180, 195, 210, 265, 295, 280, 255, 235, 215, 205, 220, 280,
            310, 290, 260, 240, 225, 245, 275, 260, 235, 215, 200, 195
          ],
          bedtimeGlucose2300MgDl: 220,
          nocturnalNadir0300MgDl: 195,
          fastingMorning0700MgDl: 215
        });
        break;
    }
  }
}
