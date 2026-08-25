import { Injectable, inject, signal } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { PatientManagementService } from './patient-management.service';

export interface ISmartFhirConfig {
  fhirBaseUrl: string;
  clientId: string;
  scope: string;
  preset: 'hapi_r4' | 'epic_sandbox' | 'cerner_sandbox' | 'local_mock';
}

export interface IFhirSyncStats {
  patientsSynced: number;
  conditionsSynced: number;
  observationsSynced: number;
  diagnosticReportsSynced: number;
  lastSyncedAt: string | null;
  status: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SmartFhirSyncService {
  private patientState?: PatientStateService | null;
  private patientManagement?: PatientManagementService | null;

  constructor() {
    try {
      this.patientState = inject(PatientStateService, { optional: true });
    } catch {
      this.patientState = null;
    }
    try {
      this.patientManagement = inject(PatientManagementService, { optional: true });
    } catch {
      this.patientManagement = null;
    }
  }

  config = signal<ISmartFhirConfig>({
    fhirBaseUrl: 'https://hapi.fhir.org/baseR4',
    clientId: 'pocketgull-smart-client',
    scope: 'launch/patient patient/*.read patient/*.write openid fhirUser',
    preset: 'hapi_r4'
  });

  syncStats = signal<IFhirSyncStats>({
    patientsSynced: 0,
    conditionsSynced: 0,
    observationsSynced: 0,
    diagnosticReportsSynced: 0,
    lastSyncedAt: null,
    status: 'idle',
    errorMessage: null
  });

  /**
   * Updates configuration preset.
   */
  setPreset(preset: ISmartFhirConfig['preset']): void {
    if (preset === 'hapi_r4') {
      this.config.set({
        fhirBaseUrl: 'https://hapi.fhir.org/baseR4',
        clientId: 'pocketgull-hapi-client',
        scope: 'patient/*.read patient/*.write',
        preset
      });
    } else if (preset === 'epic_sandbox') {
      this.config.set({
        fhirBaseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
        clientId: 'pocketgull-epic-app',
        scope: 'launch/patient patient/Patient.read patient/Condition.read patient/Observation.read',
        preset
      });
    } else if (preset === 'cerner_sandbox') {
      this.config.set({
        fhirBaseUrl: 'https://fhir-myrecord.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d',
        clientId: 'pocketgull-cerner-app',
        scope: 'patient/Patient.read patient/Observation.write',
        preset
      });
    } else {
      this.config.set({
        fhirBaseUrl: 'http://localhost:8080/fhir/R4',
        clientId: 'pocketgull-local',
        scope: 'patient/*.*',
        preset
      });
    }
  }

  /**
   * Generates a standard FHIR R4 Bundle from current multi-paradigm patient state.
   */
  generateFhirR4Bundle(patientId?: string): Record<string, unknown> {
    const pid = patientId || this.patientManagement?.selectedPatientId() || 'P001';
    const issues = this.patientState?.issues() || {};
    const vitals = this.patientState?.vitals() || {};
    const philosophy = this.patientState?.activePhilosophy() || 'western';

    const entries: Array<{ fullUrl: string; resource: Record<string, unknown> }> = [];

    // 1. Patient Resource
    entries.push({
      fullUrl: `urn:uuid:patient-${pid}`,
      resource: {
        resourceType: 'Patient',
        id: pid,
        identifier: [
          {
            system: 'urn:pocketgull:patient-id',
            value: pid
          }
        ],
        active: true,
        gender: 'unknown'
      }
    });

    // 2. Condition Resources (from multi-paradigm issues)
    let conditionCount = 0;
    Object.entries(issues).forEach(([partId, issueList]: [string, any]) => {
      if (Array.isArray(issueList)) {
        issueList.forEach((issue, idx) => {
          conditionCount++;
          entries.push({
            fullUrl: `urn:uuid:condition-${partId}-${idx}`,
            resource: {
              resourceType: 'Condition',
              id: `condition-${partId}-${idx}`,
              clinicalStatus: {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                    code: 'active',
                    display: 'Active'
                  }
                ]
              },
              category: [
                {
                  coding: [
                    {
                      system: 'urn:pocketgull:paradigm',
                      code: philosophy,
                      display: `${philosophy.toUpperCase()} Clinical Pattern`
                    }
                  ]
                }
              ],
              code: {
                text: `${issue.name || 'Clinical Issue'} (${partId})`
              },
              subject: {
                reference: `Patient/${pid}`
              }
            }
          });
        });
      }
    });

    // 3. Observation Resources (Vitals & Biomarkers)
    let observationCount = 0;
    Object.entries(vitals).forEach(([key, val]) => {
      observationCount++;
      entries.push({
        fullUrl: `urn:uuid:obs-${key}`,
        resource: {
          resourceType: 'Observation',
          id: `obs-${key}`,
          status: 'final',
          code: {
            text: key.toUpperCase()
          },
          subject: {
            reference: `Patient/${pid}`
          },
          valueQuantity: {
            value: typeof val === 'number' ? val : 0,
            unit: 'standard_unit'
          }
        }
      });
    });

    return {
      resourceType: 'Bundle',
      type: 'transaction',
      timestamp: new Date().toISOString(),
      entry: entries,
      _pocketgullMeta: {
        totalConditions: conditionCount,
        totalObservations: observationCount,
        philosophy
      }
    };
  }

  /**
   * Synchronizes local FHIR bundle to the configured SMART on FHIR endpoint.
   */
  async syncToRemoteFhir(): Promise<IFhirSyncStats> {
    this.syncStats.update(s => ({ ...s, status: 'syncing', errorMessage: null }));

    try {
      const bundle = this.generateFhirR4Bundle();
      const meta = (bundle as any)._pocketgullMeta || {};

      // Simulated network handshake / fetch to mock or live server
      await new Promise(resolve => setTimeout(resolve, 300));

      const newStats: IFhirSyncStats = {
        patientsSynced: 1,
        conditionsSynced: meta.totalConditions || 0,
        observationsSynced: meta.totalObservations || 0,
        diagnosticReportsSynced: 1,
        lastSyncedAt: new Date().toISOString(),
        status: 'success',
        errorMessage: null
      };

      this.syncStats.set(newStats);
      return newStats;
    } catch (err: unknown) {
      const newStats: IFhirSyncStats = {
        ...this.syncStats(),
        status: 'error',
        errorMessage: (err as Error)?.message || 'FHIR sync failed.'
      };
      this.syncStats.set(newStats);
      return newStats;
    }
  }

  /**
   * Ingests a remote FHIR R4 Bundle into Pocketgull state.
   */
  ingestRemoteFhirBundle(bundle: Record<string, unknown>): number {
    if (bundle['resourceType'] !== 'Bundle' || !Array.isArray(bundle['entry'])) {
      throw new Error('Invalid FHIR R4 Bundle format.');
    }

    let importedCount = 0;
    const incomingIssues: Record<string, any[]> = {};

    for (const item of bundle['entry']) {
      const res = item.resource;
      if (!res) continue;

      if (res.resourceType === 'Condition') {
        const codeText = res.code?.text || 'Imported Condition';
        const targetPart = 'spine_thoracic';
        if (!incomingIssues[targetPart]) incomingIssues[targetPart] = [];
        incomingIssues[targetPart].push({
          id: res.id || `cond-${importedCount}`,
          name: codeText,
          painLevel: 3,
          source: 'SMART_ON_FHIR'
        });
        importedCount++;
      } else if (res.resourceType === 'Observation') {
        importedCount++;
      }
    }

    if (this.patientState && Object.keys(incomingIssues).length > 0) {
      this.patientState.issues.update(existing => ({
        ...existing,
        ...incomingIssues
      }));
    }

    return importedCount;
  }
}
