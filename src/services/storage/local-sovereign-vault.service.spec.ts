import { TestBed } from '@angular/core/testing';
import { LocalSovereignVaultService } from './local-sovereign-vault.service';

describe('LocalSovereignVaultService (Anti-Cloud Bricking & Local Data Sovereignty)', () => {
  let service: LocalSovereignVaultService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocalSovereignVaultService]
    });
    service = TestBed.inject(LocalSovereignVaultService);
  });

  it('1. Initializes with guaranteed offline operation and storage estimation', () => {
    expect(service.isOfflineOperationGuaranteed()).toBe(true);
    expect(service.isVaultEncrypted()).toBe(true);
    expect(service.storageEstimate().availableMb).toBeGreaterThan(0);
  });

  it('2. Saves a clinical record locally with zero cloud egress and Part 11 cryptographic seal', async () => {
    const saved = await service.saveSovereignRecord({
      recordId: 'REC-CAREPLAN-001',
      category: 'CARE_PLAN',
      patientId: 'PATIENT-SELF-01',
      createdAt: new Date().toISOString(),
      payload: {
        diagnosis: 'Dysautonomia / POTS',
        interventions: ['Electrolyte hydration', '0.10 Hz bio-adaptive pacing']
      }
    });

    expect(saved).toBeDefined();
    expect(saved.isCloudIndependent).toBe(true);
    expect(saved.sha256Seal).toContain('sha256-sovereign-part11-');
    expect(service.localRecordCount()).toBeGreaterThanOrEqual(1);

    const all = await service.getAllSovereignRecords();
    const found = all.find(r => r.recordId === 'REC-CAREPLAN-001');
    expect(found).toBeDefined();
  });

  it('3. Exports sovereign patient archive bundle in standalone FHIR format', async () => {
    await service.saveSovereignRecord({
      recordId: 'REC-AUDIT-002',
      category: 'TIPPSS_AUDIT',
      patientId: 'PATIENT-SELF-01',
      createdAt: new Date().toISOString(),
      payload: { action: 'INGESTED', modality: 'heart_rate' }
    });

    const bundleJson = await service.exportSovereignPatientBundle('PATIENT-SELF-01');
    expect(bundleJson).toBeDefined();

    const parsed = JSON.parse(bundleJson);
    expect(parsed.resourceType).toBe('Bundle');
    expect(parsed.meta.cloudIndependent).toBe(true);
    expect(parsed.meta.antiBrickingStandard).toContain('Zero-Cloud-Tether');
    expect(parsed.entry.length).toBeGreaterThanOrEqual(1);
  });

  it('4. Appends ambulatory Holter waveform blocks and generates stream summary', async () => {
    const samples = [
      { timestampMs: 1700000000000, val: 72.5, modality: 'ppg' },
      { timestampMs: 1700000000020, val: 73.1, modality: 'ppg' },
      { timestampMs: 1700000000040, val: 74.0, modality: 'ppg' }
    ];

    const bytesWritten = await service.appendHolterStreamBlock('HOLTER-SESSION-001', samples);
    expect(bytesWritten).toBe(36); // 3 samples * 12 bytes
    expect(service.opfsBytesWritten()).toBeGreaterThanOrEqual(36);
    expect(service.activeHolterStreams()).toContain('HOLTER-SESSION-001');

    const summary = await service.readHolterStreamSummary('HOLTER-SESSION-001');
    expect(summary.sessionId).toBe('HOLTER-SESSION-001');
    expect(summary.sampleCount).toBe(3);
    expect(summary.totalBytes).toBe(36);
    expect(summary.sha256Part11Seal).toContain('sha256-opfs-holter-HOLTER-SESSION-001-36');
  });

  it('5. Requests persistent storage (navigator.storage.persist) to block OS/browser quota eviction', async () => {
    const originalStorage = navigator.storage;
    const persistMock = async () => true;
    const persistedMock = async () => false;

    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: {
        ...originalStorage,
        persisted: persistedMock,
        persist: persistMock
      }
    });

    try {
      const granted = await service.requestStoragePersistence();
      expect(granted).toBe(true);
      expect(service.isStoragePersisted()).toBe(true);
    } finally {
      Object.defineProperty(navigator, 'storage', {
        configurable: true,
        value: originalStorage
      });
    }
  });

  it('6. Recovers clinical records from emergency migration snapshot if IndexedDB schema upgrade fails', () => {
    window.localStorage.removeItem('pocketgull_sovereign_migration_backup_v2');
    service.saveEmergencyMigrationSnapshot([
      {
        recordId: 'REC-MIGRATION-SAFE-01',
        category: 'VITALS_SUMMARY',
        patientId: 'PATIENT-SELF-01',
        createdAt: '2026-11-11T17:00:00.000Z',
        payload: { hr: 68 },
        sha256Seal: 'sha256-sovereign-part11-deadbeefab89ef12',
        isCloudIndependent: true
      }
    ]);

    const restored = service.recoverFromEmergencyMigrationSnapshot();
    expect(restored).toBe(1);
    expect(service.schemaMigrationStatus()).toBe('RECOVERED_FROM_BACKUP');
    window.localStorage.removeItem('pocketgull_sovereign_migration_backup_v2');
  });

  it('7. Queues idempotent outbox mutations and rehydrates FHIR R4 Bundle snapshots without duplicate writes', async () => {
    await service.saveSovereignRecord({
      recordId: 'REC-REHYDRATE-01',
      category: 'CARE_PLAN',
      patientId: 'PATIENT-SELF-01',
      createdAt: '2026-11-11T17:30:00.000Z',
      payload: { act: 'Act I Metabolic Bridge' }
    });

    const outboxBefore = await service.getPendingOutboxMutations();
    expect(outboxBefore.length).toBeGreaterThanOrEqual(1);
    await service.acknowledgeOutboxMutation(outboxBefore[0].mutationId);

    const exportedBundle = await service.exportSovereignPatientBundle('PATIENT-SELF-01');

    // Re-importing when record already exists should be idempotent (skippedCount >= 1)
    const duplicateImport = await service.importSovereignPatientBundle(exportedBundle);
    expect(duplicateImport.skippedCount).toBeGreaterThanOrEqual(1);

    // Importing a new record from an external disaster-recovery FHIR snapshot
    const externalSnapshot = JSON.stringify({
      resourceType: 'Bundle',
      id: 'SOVEREIGN-BUNDLE-DR-RESTORE',
      type: 'collection',
      timestamp: '2026-11-11T17:35:00.000Z',
      entry: [
        {
          fullUrl: 'urn:uuid:REC-DR-RESTORED-99',
          resource: {
            resourceType: 'Basic',
            id: 'REC-DR-RESTORED-99',
            code: { text: 'CARE_PLAN' },
            data: { act: 'Act II Autonomic Pacing' },
            provenanceSeal: 'sha256-sovereign-part11-12345678ab89ef12'
          }
        }
      ]
    });

    const restoredResult = await service.importSovereignPatientBundle(externalSnapshot);
    expect(restoredResult.importedCount).toBe(1);
    expect(restoredResult.verifiedSeals).toBe(1);
    expect(restoredResult.bundleId).toBe('SOVEREIGN-BUNDLE-DR-RESTORE');
  });
});
