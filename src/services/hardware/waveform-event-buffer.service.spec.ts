import { TestBed } from '@angular/core/testing';
import { WaveformEventBufferService, IWaveformSample } from './waveform-event-buffer.service';

describe('WaveformEventBufferService (Anti-Data Landfill & Waveform Decimation)', () => {
  let service: WaveformEventBufferService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WaveformEventBufferService]
    });
    service = TestBed.inject(WaveformEventBufferService);
  });

  it('1. Initializes with empty ring buffers and default compaction ratio', () => {
    expect(service.totalSamplesIngested()).toBe(0);
    expect(service.totalSamplesDiscardedAtEdge()).toBe(0);
    expect(service.frozenIncidentSnapshots().length).toBe(0);
    expect(service.dataCompactionRatioPercent()).toBe(99.5);
  });

  it('2. Ingests waveform samples and discards routine flatline samples at the circular boundary', () => {
    const now = Date.now();
    // Ingest 1600 PPG samples (exceeding the 1500 limit for 30s buffer)
    for (let i = 0; i < 1600; i++) {
      service.pushSample({
        timestampMs: now + i * 20,
        val: 0.5 + Math.sin(i / 10) * 0.2,
        modality: 'ppg'
      });
    }

    expect(service.totalSamplesIngested()).toBe(1600);
    expect(service.totalSamplesDiscardedAtEdge()).toBe(100); // 1600 - 1500 = 100 discarded
    expect(service.dataLandfillBytesSaved()).toBe(800); // 100 * 8 bytes
    expect(parseFloat(service.dataLandfillKBSaved())).toBeGreaterThanOrEqual(0.7);

    // Test alarm fatigue reduction calculations
    expect(service.nuisanceAlarmsSuppressed()).toBe(0);
    service.recordNuisanceAlarmSuppressed(5);
    expect(service.nuisanceAlarmsSuppressed()).toBe(5);
    expect(service.clinicianMinutesSaved()).toBe(6.0); // 5 * 1.2 min
    expect(service.clinicianHoursSaved()).toBe(0.1);
  });

  it('3. Freezes high-resolution Pre/Post event waveform snippet on clinical anomaly', () => {
    const now = Date.now();
    for (let i = 0; i < 200; i++) {
      service.pushSample({
        timestampMs: now + i * 20,
        val: 72 + (i > 150 ? 40 : 0),
        modality: 'ppg'
      });
    }

    const snapshot = service.freezeIncidentSnapshot({
      triggerReason: 'Sudden Tachycardia Episode (112 bpm)',
      acuity: 'STAT_EMERGENCY',
      modality: 'ppg'
    });

    expect(snapshot).toBeDefined();
    expect(snapshot.snapshotId).toContain('INCIDENT-');
    expect(snapshot.acuity).toBe('STAT_EMERGENCY');
    expect(snapshot.samples.length).toBe(200);
    expect(snapshot.sha256Part11Digest).toContain('sha256-part11-incident-');
    expect(snapshot.vitalSummary.meanHeartRate).toBeGreaterThan(70);

    expect(service.frozenIncidentSnapshots().length).toBe(1);
    expect(service.frozenIncidentSnapshots()[0]).toEqual(snapshot);
  });

  it('4. Clears incident snapshots on review and archiving', () => {
    service.freezeIncidentSnapshot({
      triggerReason: 'Test Episode',
      acuity: 'ROUTINE'
    });
    expect(service.frozenIncidentSnapshots().length).toBe(1);

    service.clearIncidentSnapshots();
    expect(service.frozenIncidentSnapshots().length).toBe(0);
  });
});
