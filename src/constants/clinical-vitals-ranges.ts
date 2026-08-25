/**
 * Single Source of Truth for Clinical Vitals Normal Ranges & Warning Thresholds
 */
export interface IVitalRange {
  name: string;
  unit: string;
  minNormal: number;
  maxNormal: number;
  criticalLow?: number;
  criticalHigh?: number;
}

export const CLINICAL_VITALS_RANGES: Record<string, IVitalRange> = {
  heartRate: {
    name: 'Heart Rate',
    unit: 'bpm',
    minNormal: 60,
    maxNormal: 100,
    criticalLow: 45,
    criticalHigh: 130
  },
  systolicBp: {
    name: 'Systolic Blood Pressure',
    unit: 'mmHg',
    minNormal: 90,
    maxNormal: 120,
    criticalLow: 80,
    criticalHigh: 180
  },
  diastolicBp: {
    name: 'Diastolic Blood Pressure',
    unit: 'mmHg',
    minNormal: 60,
    maxNormal: 80,
    criticalLow: 50,
    criticalHigh: 120
  },
  spO2: {
    name: 'Oxygen Saturation',
    unit: '%',
    minNormal: 95,
    maxNormal: 100,
    criticalLow: 90
  },
  temperature: {
    name: 'Body Temperature',
    unit: '°F',
    minNormal: 97.0,
    maxNormal: 99.5,
    criticalLow: 95.0,
    criticalHigh: 103.0
  }
};
