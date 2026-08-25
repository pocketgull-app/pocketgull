import { SmartFhirSyncService } from './smart-fhir-sync.service';
import { signal } from '@angular/core';

describe('SmartFhirSyncService (SMART on FHIR R4 Bridge) Suite', () => {
  let service: SmartFhirSyncService;
  let mockPatientState: any;
  let mockPatientManagement: any;

  beforeEach(() => {
    mockPatientState = {
      issues: signal({
        knee_left: [{ id: 'knee-1', name: 'ACL Tear', painLevel: 8 }],
        heart: [{ id: 'heart-1', name: 'Palpitations', painLevel: 4 }]
      }),
      vitals: signal({ hr: 75, bpSys: 125, bpDia: 82 }),
      activePhilosophy: signal('western')
    };

    mockPatientManagement = {
      selectedPatientId: signal('P001')
    };

    service = new SmartFhirSyncService();
    (service as any).patientState = mockPatientState;
    (service as any).patientManagement = mockPatientManagement;
  });

  it('1. Configures endpoint presets (HAPI R4, Epic, Cerner, Local)', () => {
    service.setPreset('epic_sandbox');
    expect(service.config().fhirBaseUrl).toContain('epic.com');
    expect(service.config().clientId).toBe('pocketgull-epic-app');

    service.setPreset('cerner_sandbox');
    expect(service.config().fhirBaseUrl).toContain('cerner.com');

    service.setPreset('hapi_r4');
    expect(service.config().fhirBaseUrl).toContain('hapi.fhir.org');
  });

  it('2. Generates standard FHIR R4 transaction bundle with Patient, Condition, and Observation resources', () => {
    const bundle = service.generateFhirR4Bundle('P001');

    expect(bundle['resourceType']).toBe('Bundle');
    expect(bundle['type']).toBe('transaction');
    const entries = bundle['entry'] as any[];
    expect(entries.length).toBeGreaterThan(3);

    const patientRes = entries.find(e => e.resource.resourceType === 'Patient');
    expect(patientRes.resource.id).toBe('P001');

    const conditionRes = entries.filter(e => e.resource.resourceType === 'Condition');
    expect(conditionRes.length).toBe(2);

    const obsRes = entries.filter(e => e.resource.resourceType === 'Observation');
    expect(obsRes.length).toBe(3);
  });

  it('3. Syncs bundle to remote FHIR endpoint and updates sync stats', async () => {
    const stats = await service.syncToRemoteFhir();

    expect(stats.status).toBe('success');
    expect(stats.patientsSynced).toBe(1);
    expect(stats.conditionsSynced).toBe(2);
    expect(stats.observationsSynced).toBe(3);
    expect(stats.lastSyncedAt).toBeDefined();
  });

  it('4. Ingests remote incoming FHIR bundle and updates local patient state', () => {
    const mockRemoteBundle = {
      resourceType: 'Bundle',
      entry: [
        {
          resource: {
            resourceType: 'Condition',
            id: 'cond-remote-1',
            code: { text: 'Thoracic Scoliosis' }
          }
        },
        {
          resource: {
            resourceType: 'Observation',
            id: 'obs-remote-1'
          }
        }
      ]
    };

    const count = service.ingestRemoteFhirBundle(mockRemoteBundle);
    expect(count).toBe(2);
    expect(mockPatientState.issues()['spine_thoracic']).toBeDefined();
    expect(mockPatientState.issues()['spine_thoracic'][0].name).toBe('Thoracic Scoliosis');
  });
});
