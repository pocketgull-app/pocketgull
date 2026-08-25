import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export interface ICgmMetrics {
  meanGlucoseMgDl: number;
  timeInRangePercent: number; // 70-180 mg/dL (Target >70%)
  timeTightRangePercent: number; // 70-140 mg/dL (Target >50%)
  timeBelowRangePercent: number; // <70 mg/dL (Target <4%)
  timeSevereHypoPercent: number; // <54 mg/dL (Target <1%)
  timeAboveRangePercent: number; // >180 mg/dL (Target <25%)
  coefficientOfVariationPercent: number; // %CV (Target <=36%)
  gmiEstimatedA1c: number; // eA1c / GMI
  clinicalAssessment: 'Optimal Glycemic Control' | 'Elevated Glycemic Variability' | 'Severe Hypoglycemia Risk' | 'Persistent Hyperglycemia';
}

@Injectable({
  providedIn: 'root'
})
export class CgmTimeInRangeService {
  private patientState = inject(PatientStateService);

  readonly glucoseReadingsMgDl = signal<number[]>([
    115, 122, 108, 95, 134, 142, 168, 175, 182, 130, 105, 88, 76, 68, 92, 110, 125, 138, 145, 120, 112, 104, 98, 102
  ]);

  readonly cgmAnalysis = computed<ICgmMetrics>(() => {
    const readings = this.glucoseReadingsMgDl();
    if (readings.length === 0) {
      return {
        meanGlucoseMgDl: 110,
        timeInRangePercent: 100,
        timeTightRangePercent: 80,
        timeBelowRangePercent: 0,
        timeSevereHypoPercent: 0,
        timeAboveRangePercent: 0,
        coefficientOfVariationPercent: 18.5,
        gmiEstimatedA1c: 5.9,
        clinicalAssessment: 'Optimal Glycemic Control'
      };
    }

    const total = readings.length;
    const sum = readings.reduce((a, b) => a + b, 0);
    const mean = sum / total;

    const inRange = readings.filter(g => g >= 70 && g <= 180).length;
    const tightRange = readings.filter(g => g >= 70 && g <= 140).length;
    const belowRange = readings.filter(g => g < 70).length;
    const severeHypo = readings.filter(g => g < 54).length;
    const aboveRange = readings.filter(g => g > 180).length;

    // Standard deviation & Coefficient of Variation (%CV)
    const variance = readings.reduce((acc, g) => acc + Math.pow(g - mean, 2), 0) / total;
    const stdDev = Math.sqrt(variance);
    const cvPercent = (stdDev / mean) * 100;

    // GMI Formula: 3.31 + (0.02392 * meanGlucose)
    const gmi = 3.31 + (0.02392 * mean);

    const tirPct = (inRange / total) * 100;
    const ttrPct = (tightRange / total) * 100;
    const tbrPct = (belowRange / total) * 100;
    const severeHypoPct = (severeHypo / total) * 100;
    const tarPct = (aboveRange / total) * 100;

    let assessment: ICgmMetrics['clinicalAssessment'] = 'Optimal Glycemic Control';
    if (tbrPct >= 4.0 || severeHypoPct >= 1.0) assessment = 'Severe Hypoglycemia Risk';
    else if (cvPercent > 36.0) assessment = 'Elevated Glycemic Variability';
    else if (tarPct >= 25.0 || mean >= 180) assessment = 'Persistent Hyperglycemia';

    return {
      meanGlucoseMgDl: Math.round(mean),
      timeInRangePercent: Math.round(tirPct),
      timeTightRangePercent: Math.round(ttrPct),
      timeBelowRangePercent: Math.round(tbrPct),
      timeSevereHypoPercent: Math.round(severeHypoPct),
      timeAboveRangePercent: Math.round(tarPct),
      coefficientOfVariationPercent: parseFloat(cvPercent.toFixed(1)),
      gmiEstimatedA1c: parseFloat(gmi.toFixed(1)),
      clinicalAssessment: assessment
    };
  });
}
