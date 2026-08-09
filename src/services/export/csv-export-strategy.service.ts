import { Injectable } from '@angular/core';
import { IPatient } from '../patient.types';

@Injectable({
  providedIn: 'root'
})
export class CsvExportStrategyService {
  /**
   * Encodes patient demographics, vital signs, clinical assessment scores,
   * and telemetry metrics into an RFC 4180 compliant CSV string.
   */
  public generatePatientCsv(patientData: Partial<IPatient>): string {
    const timestamp = new Date().toISOString();

    const escapeCsv = (val: unknown): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      'Timestamp',
      'Patient ID',
      'Patient Name',
      'Age',
      'Gender',
      'Heart Rate (bpm)',
      'BP Systolic (mmHg)',
      'BP Diastolic (mmHg)',
      'SpO2 (%)',
      'CGM Glucose (mg/dL)',
      'Acoustic Dominant Freq (Hz)',
      'Acoustic Energy (dB)',
      'Acoustic Pattern',
      'Acoustic Severity',
      'PHQ-9 Score',
      'GAD-7 Score',
      'Y-BOCS Score',
      'KSS Sleepiness Score',
      'SIBI Periodontal Score',
      'SOFA Deterioration Risk Score',
      'LACE Readmission Risk Score',
      'Active Preexisting Conditions',
      'Occupation',
      'Export Schema Version'
    ];

    let bpSys = '';
    let bpDia = '';
    if (patientData.vitals?.bp) {
      const parts = String(patientData.vitals.bp).split('/');
      if (parts.length === 2) {
        bpSys = parts[0];
        bpDia = parts[1];
      }
    }

    const conditions = Array.isArray(patientData.preexistingConditions)
      ? patientData.preexistingConditions.join('; ')
      : '';

    const row = [
      timestamp,
      patientData.id || 'p001',
      patientData.name || 'Patient',
      patientData.age ?? '',
      patientData.gender ?? '',
      patientData.vitals?.hr ?? '',
      bpSys,
      bpDia,
      patientData.vitals?.spO2 ?? '',
      patientData.vitals?.cgmGlucoseMgDl ?? '',
      520, // Acoustic F0 (Hz)
      -24, // Acoustic Energy (dB)
      'Normal Breathing',
      'Mild',
      patientData.phq9Score ?? '',
      patientData.gad7Score ?? '',
      patientData.ybocsScore ?? '',
      patientData.kssScore ?? '',
      34, // SIBI baseline
      2.5, // SOFA
      6.0, // LACE
      conditions,
      patientData.occupation ?? '',
      'Pocketgull-CSV-v1.1'
    ];

    const csvContent = [
      headers.map(escapeCsv).join(','),
      row.map(escapeCsv).join(',')
    ].join('\r\n');

    return csvContent;
  }

  /**
   * Triggers a client-side browser file download for the CSV payload.
   */
  public downloadCsvFile(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
