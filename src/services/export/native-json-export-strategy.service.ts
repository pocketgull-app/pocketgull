import { Injectable } from '@angular/core';
import { IPatient } from '../patient.types';

/** Shape of the native JSON export file. */
export interface INativePatientExport {
  _format: 'pocket-gull-native';
  _version: 1;
  exportedAt: string;
  patient: Omit<IPatient, 'id'>;
}

@Injectable({
  providedIn: 'root'
})
export class NativeJsonExportStrategyService {
  /**
   * Serializes a patient object into a native Pocket-Gull JSON export structure and triggers download.
   */
  public exportNativeJson(patientData: IPatient, filename?: string): void {
    const { id, ...patientWithoutId } = patientData;
    const payload: INativePatientExport = {
      _format: 'pocket-gull-native',
      _version: 1,
      exportedAt: new Date().toISOString(),
      patient: patientWithoutId
    };

    const outFilename = filename || `pocket_gull_patient_${id || 'p001'}_${Date.now()}.json`;
    this.downloadJson(payload, outFilename);
  }

  /**
   * Validates whether an imported payload conforms to the native export schema.
   */
  public isNativeExport(payload: unknown): payload is INativePatientExport {
    if (!payload || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    return p['_format'] === 'pocket-gull-native' && p['_version'] === 1 && typeof p['patient'] === 'object';
  }

  /**
   * Downloads any JavaScript object as a formatted JSON blob.
   */
  public downloadJson(data: unknown, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
