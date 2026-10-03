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
});
