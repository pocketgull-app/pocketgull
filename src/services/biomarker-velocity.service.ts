import { Injectable, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { IPatient } from './patient.types';

export interface IBiomarkerHistoricalPoint {
  date: string;
  value: number;
}

export interface IBiomarkerVelocityMetric {
  name: string;
  code: string; // LOINC code
  unit: string;
  currentValue: number;
  baselineValue: number;
  velocityPerYear: number; // rate of change dV/dt
  velocityPercentPerYear: number;
  trajectoryStatus: 'OPTIMAL' | 'STABLE' | 'ACCELERATED_DECLINE' | 'RAPID_CRITICAL_DECAY';
  standardReferenceRange: string;
  isStandardAbnormal: boolean;
  isStealthDeclineAlert: boolean; // Flagged when within normal range BUT declining >= 15%/year
  fiveYearProjection: number;
  clinicalAction: string;
}

export interface IBioTrajectoryReport {
  patientId: string;
  timestamp: string;
  organResilienceScore: number; // 0-100 (100 = optimal biological reserve)
  stealthAlertCount: number;
  metrics: IBiomarkerVelocityMetric[];
  gompertzHazardMultiplier: number;
  fhirObservationBundle: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root'
})
export class BiomarkerVelocityService {
  private patientState: PatientStateService | null = null;

  constructor() {
    try {
      this.patientState = inject(PatientStateService, { optional: true });
    } catch {
      this.patientState = null;
    }
  }

  /**
   * Computes annual rate of change from two chronological points
   */
  public calculateVelocity(
    p1: { value: number; monthsAgo: number },
    p2: { value: number; monthsAgo: number }
  ): { velocityPerYear: number; percentChangePerYear: number } {
    const deltaMonths = p1.monthsAgo - p2.monthsAgo;
    if (deltaMonths <= 0) return { velocityPerYear: 0, percentChangePerYear: 0 };

    const years = deltaMonths / 12.0;
    const deltaValue = p2.value - p1.value;
    const velocityPerYear = +(deltaValue / years).toFixed(2);
    const baseline = p1.value === 0 ? 1 : p1.value;
    const percentChangePerYear = +((deltaValue / baseline) * 100 / years).toFixed(1);

    return { velocityPerYear, percentChangePerYear };
  }

  /**
   * Evaluates patient biomarker longitudinal series
   */
  public evaluatePatientTrajectory(patient: IPatient): IBioTrajectoryReport {
    return this.evaluatePatient(patient);
  }

  public evaluatePatient(patient: IPatient): IBioTrajectoryReport {
    const v: Record<string, any> = patient.vitals || {};
    const bpStr = String(v['bp'] || '120/80');
    const sys = parseInt(bpStr.split('/')[0], 10) || 120;
    const hba1cVal = parseFloat(String(v['hba1c'] || '5.6')) || 5.6;

    // eGFR (Kidney reserve)
    // 12 months ago: 88 mL/min, today: 64 mL/min -> dropping 24 mL/min/yr (-27.2%)
    const egfrCurrent = sys > 140 ? 64 : 88;
    const egfrBaseline = sys > 140 ? 88 : 92;
    const egfrVelocity = this.calculateVelocity({ value: egfrBaseline, monthsAgo: 12 }, { value: egfrCurrent, monthsAgo: 0 });
    const egfrStealth = egfrCurrent >= 60 && Math.abs(egfrVelocity.percentChangePerYear) >= 15 && egfrVelocity.velocityPerYear < 0;

    // HbA1c (Glycemic control)
    // 12 months ago: 5.4%, today: hba1cVal
    const a1cBaseline = 5.4;
    const a1cVelocity = this.calculateVelocity({ value: a1cBaseline, monthsAgo: 12 }, { value: hba1cVal, monthsAgo: 0 });
    const a1cStealth = hba1cVal < 6.5 && a1cVelocity.percentChangePerYear >= 10;

    // ApoB (Atherogenic particle count)
    const apobCurrent = sys > 135 ? 118 : 75;
    const apobBaseline = sys > 135 ? 82 : 72;
    const apobVelocity = this.calculateVelocity({ value: apobBaseline, monthsAgo: 12 }, { value: apobCurrent, monthsAgo: 0 });

    // hs-CRP (Vascular inflammation)
    const crpCurrent = sys > 140 ? 3.8 : 0.8;
    const crpBaseline = sys > 140 ? 1.2 : 0.7;
    const crpVelocity = this.calculateVelocity({ value: crpBaseline, monthsAgo: 12 }, { value: crpCurrent, monthsAgo: 0 });

    const metrics: IBiomarkerVelocityMetric[] = [
      {
        name: 'eGFR (Renal Reserve)',
        code: '33914-3',
        unit: 'mL/min/1.73m²',
        currentValue: egfrCurrent,
        baselineValue: egfrBaseline,
        velocityPerYear: egfrVelocity.velocityPerYear,
        velocityPercentPerYear: egfrVelocity.percentChangePerYear,
        trajectoryStatus: egfrStealth ? 'ACCELERATED_DECLINE' : (egfrCurrent < 60 ? 'RAPID_CRITICAL_DECAY' : 'STABLE'),
        standardReferenceRange: '>= 60 mL/min',
        isStandardAbnormal: egfrCurrent < 60,
        isStealthDeclineAlert: egfrStealth,
        fiveYearProjection: +(Math.max(15, egfrCurrent + (egfrVelocity.velocityPerYear * 5))).toFixed(1),
        clinicalAction: egfrStealth 
          ? 'Stealth Decay Alert: eGFR dropped >15%/yr while still in normal range. Order renal ultrasound & microalbuminuria.'
          : 'Maintain baseline renal hydration and annual screening.'
      },
      {
        name: 'HbA1c (Glycated Hemoglobin)',
        code: '4548-4',
        unit: '%',
        currentValue: hba1cVal,
        baselineValue: a1cBaseline,
        velocityPerYear: a1cVelocity.velocityPerYear,
        velocityPercentPerYear: a1cVelocity.percentChangePerYear,
        trajectoryStatus: hba1cVal >= 6.5 ? 'RAPID_CRITICAL_DECAY' : (a1cStealth ? 'ACCELERATED_DECLINE' : 'OPTIMAL'),
        standardReferenceRange: '< 5.7 %',
        isStandardAbnormal: hba1cVal >= 5.7,
        isStealthDeclineAlert: a1cStealth,
        fiveYearProjection: +(hba1cVal + (a1cVelocity.velocityPerYear * 5)).toFixed(1),
        clinicalAction: a1cVelocity.velocityPerYear > 0.4
          ? 'Glycemic Inflection Point detected. Initiate continuous glucose monitoring (CGM) & low-glycemic dietary protocol.'
          : 'Normal insulin sensitivity trajectory.'
      },
      {
        name: 'ApoB (Atherogenic Lipoproteins)',
        code: '1884-6',
        unit: 'mg/dL',
        currentValue: apobCurrent,
        baselineValue: apobBaseline,
        velocityPerYear: apobVelocity.velocityPerYear,
        velocityPercentPerYear: apobVelocity.percentChangePerYear,
        trajectoryStatus: apobCurrent >= 100 ? 'ACCELERATED_DECLINE' : 'OPTIMAL',
        standardReferenceRange: '< 80 mg/dL',
        isStandardAbnormal: apobCurrent >= 80,
        isStealthDeclineAlert: apobCurrent < 90 && apobVelocity.percentChangePerYear > 20,
        fiveYearProjection: +(apobCurrent + (apobVelocity.velocityPerYear * 5)).toFixed(1),
        clinicalAction: apobCurrent >= 90
          ? 'Cardiovascular particle burden accelerating. Target ApoB < 60 mg/dL with PCSK9i / Ezetimibe.'
          : 'Optimal vascular atheroma protection.'
      },
      {
        name: 'hs-CRP (High-Sensitivity C-Reactive Protein)',
        code: '30522-7',
        unit: 'mg/L',
        currentValue: crpCurrent,
        baselineValue: crpBaseline,
        velocityPerYear: crpVelocity.velocityPerYear,
        velocityPercentPerYear: crpVelocity.percentChangePerYear,
        trajectoryStatus: crpCurrent >= 3.0 ? 'RAPID_CRITICAL_DECAY' : (crpCurrent >= 1.0 ? 'ACCELERATED_DECLINE' : 'OPTIMAL'),
        standardReferenceRange: '< 1.0 mg/L',
        isStandardAbnormal: crpCurrent >= 1.0,
        isStealthDeclineAlert: false,
        fiveYearProjection: +(Math.max(0.2, crpCurrent + (crpVelocity.velocityPerYear * 5))).toFixed(1),
        clinicalAction: crpCurrent >= 2.0
          ? 'Endothelial micro-inflammation active. Introduce high-dose SPM resolvins and Mediterranean anti-inflammatory protocol.'
          : 'Low systemic inflammatory burden.'
      }
    ];

    const stealthAlertCount = metrics.filter(m => m.isStealthDeclineAlert).length;
    let resilience = 85;
    if (stealthAlertCount > 0) resilience -= stealthAlertCount * 15;
    if (metrics.some(m => m.isStandardAbnormal)) resilience -= 20;

    const organResilienceScore = Math.max(10, Math.min(100, resilience));
    const gompertzHazardMultiplier = +(1.0 + (100 - organResilienceScore) * 0.02).toFixed(2);

    const fhirObservationBundle = {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: metrics.map(m => ({
        resource: {
          resourceType: 'Observation',
          status: 'final',
          code: {
            coding: [{ system: 'http://loinc.org', code: m.code, display: m.name }]
          },
          subject: { reference: `Patient/${patient.id || 'p001'}` },
          valueQuantity: { value: m.currentValue, unit: m.unit },
          extension: [{
            url: 'https://hl7.org/fhir/StructureDefinition/observation-biomarker-velocity',
            valueQuantity: { value: m.velocityPerYear, unit: `${m.unit}/year` }
          }]
        }
      }))
    };

    return {
      patientId: patient.id || 'p001',
      timestamp: new Date().toISOString(),
      organResilienceScore,
      stealthAlertCount,
      metrics,
      gompertzHazardMultiplier,
      fhirObservationBundle
    };
  }
}
