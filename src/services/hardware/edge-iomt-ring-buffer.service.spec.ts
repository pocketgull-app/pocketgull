import { TestBed } from '@angular/core/testing';
import { EdgeIomtRingBufferService, IIoMTRawSample } from './edge-iomt-ring-buffer.service';

describe('EdgeIomtRingBufferService', () => {
  let service: EdgeIomtRingBufferService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EdgeIomtRingBufferService]
    });
    service = TestBed.inject(EdgeIomtRingBufferService);
  });

  it('should initialize with 0 transmitted incidents and 100% data suppression baseline', () => {
    expect(service).toBeTruthy();
    expect(service.totalIngestedSamples()).toBe(0);
    expect(service.transmittedIncidentsCount()).toBe(0);
    expect(service.dataSuppressionRatio()).toBe(100.0);
  });

  it('should discard normal physiological baseline samples at the edge without cloud egress', () => {
    const normalSample: IIoMTRawSample = {
      timestampMs: Date.now(),
      channel: 'PPG',
      value: 1.05,
      sqi: 0.95
    };

    // Feed 500 normal samples (e.g. 2 seconds of clean 250 Hz data)
    for (let i = 0; i < 500; i++) {
      const incident = service.pushSample(normalSample, 'PT-DEID-ANON-001');
      expect(incident).toBeNull();
    }

    expect(service.totalIngestedSamples()).toBe(500);
    expect(service.discardedNoiseSamplesCount()).toBe(500);
    expect(service.transmittedIncidentsCount()).toBe(0);
    expect(service.dataSuppressionRatio()).toBe(100.0);
  });

  it('should trigger an immutable incident snapshot when hypoxic desaturation occurs', () => {
    const hypoxicSample: IIoMTRawSample = {
      timestampMs: Date.now(),
      channel: 'SPO2',
      value: 84.0, // Critical hypoxemia
      sqi: 0.92
    };

    const incident = service.pushSample(hypoxicSample, 'PT-DEID-ANON-002');

    expect(incident).not.toBeNull();
    expect(incident?.triggerEvent).toBe('HYPOXIC_DESATURATION');
    expect(incident?.anomalyMagnitude).toBe(84.0);
    expect(incident?.sha256IntegrityDigest).toMatch(/^[0-9a-f]{8}/);
    expect(service.transmittedIncidentsCount()).toBe(1);
  });

  it('should trigger a LEAD_OFF incident when SQI collapses', () => {
    const leadOffSample: IIoMTRawSample = {
      timestampMs: Date.now(),
      channel: 'ECG',
      value: 0.0,
      sqi: 0.05 // Severe detachment
    };

    const incident = service.pushSample(leadOffSample, 'PT-DEID-ANON-003');

    expect(incident).not.toBeNull();
    expect(incident?.triggerEvent).toBe('LEAD_OFF');
  });
});
