import { TestBed } from '@angular/core/testing';
import { NetworkStateService, IQueuedSyncItem } from './network-state.service';
import { HardwareTelemetryService } from './hardware/hardware-telemetry.service';
import { PatientStateService } from './patient-state.service';
import { SecureStorageService } from './secure-storage.service';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { signal } from '@angular/core';

describe('NetworkStateService Connectivity & Queueing Suite', () => {
  let service: NetworkStateService;
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};

    const mockStorageService = {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
      removeItem: vi.fn((key: string) => { delete mockStorage[key]; })
    };

    const mockTelemetryService = {
      recommendedExecutionPath: signal('local-webgpu')
    };

    const mockPatientStateService = {
      isEmergencyMode: signal(false)
    };

    TestBed.configureTestingModule({
      providers: [
        NetworkStateService,
        { provide: SecureStorageService, useValue: mockStorageService },
        { provide: HardwareTelemetryService, useValue: mockTelemetryService },
        { provide: PatientStateService, useValue: mockPatientStateService }
      ]
    });

    service = TestBed.inject(NetworkStateService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Initializes default online network state and optimal quality', () => {
    expect(service.isOnline()).toBe(true);
    expect(service.networkQuality()).toBe('OPTIMAL');
    expect(service.isConstrainedBandwidth()).toBe(false);
    expect(service.isLieFiSuspected()).toBe(false);
    expect(service.pendingQueueCount()).toBe(0);
  });

  it('2. Toggles force offline and updates reactive signals', () => {
    service.toggleForceOffline();
    expect(service.forceOffline()).toBe(true);
    expect(service.isOnline()).toBe(false);
    expect(service.networkQuality()).toBe('OFFLINE');
    expect(service.useLocalInference()).toBe(true);

    service.toggleForceOffline();
    expect(service.forceOffline()).toBe(false);
    expect(service.isOnline()).toBe(true);
  });

  it('3. Detects Lie-Fi state after consecutive failed reachability probes', async () => {
    // Mock fetch to simulate network timeout / connection refused
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network request failed'));

    const probe1 = await service.checkReachability('/api/health');
    expect(probe1).toBe(false);
    expect(service.consecutiveProbeFailures()).toBe(1);
    expect(service.isLieFiSuspected()).toBe(false);

    const probe2 = await service.checkReachability('/api/health');
    expect(probe2).toBe(false);
    expect(service.consecutiveProbeFailures()).toBe(2);
    expect(service.isLieFiSuspected()).toBe(true);
    expect(service.networkQuality()).toBe('LIE_FI_SUSPECTED');
    expect(service.isOnline()).toBe(false);
    expect(service.useLocalInference()).toBe(true);
  });

  it('4. Recovers from Lie-Fi when a probe succeeds and records latency RTT', async () => {
    service.consecutiveProbeFailures.set(3);
    expect(service.isLieFiSuspected()).toBe(true);

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200
    });

    const success = await service.checkReachability('/api/health');
    expect(success).toBe(true);
    expect(service.consecutiveProbeFailures()).toBe(0);
    expect(service.isLieFiSuspected()).toBe(false);
    expect(service.latencyMs()).toBeGreaterThanOrEqual(0);
    expect(service.isOnline()).toBe(true);
  });

  it('5. Enqueues, dequeues, and persists store-and-forward offline clinical items', () => {
    const assessmentPayload = {
      muacMm: 110,
      bilateralEdema: 'GRADE_1',
      dailyRutfSachets: 3
    };

    const id1 = service.enqueueOfflineItem('UNICEF_RUTF_ASSESSMENT', assessmentPayload);
    expect(service.pendingQueueCount()).toBe(1);
    expect(service.offlineQueue()[0].id).toBe(id1);
    expect(service.offlineQueue()[0].type).toBe('UNICEF_RUTF_ASSESSMENT');

    const id2 = service.enqueueOfflineItem('PATIENT_INTAKE', { name: 'De-identified' });
    expect(service.pendingQueueCount()).toBe(2);

    service.dequeueOfflineItem(id1);
    expect(service.pendingQueueCount()).toBe(1);
    expect(service.offlineQueue()[0].id).toBe(id2);

    service.clearOfflineQueue();
    expect(service.pendingQueueCount()).toBe(0);
  });

  it('6. Adjusts network quality tier based on connection speed and high latency', () => {
    service.connectionSpeed.set('slow-2g');
    expect(service.networkQuality()).toBe('CONSTRAINED');
    expect(service.isConstrainedBandwidth()).toBe(true);

    service.connectionSpeed.set('4g');
    service.latencyMs.set(850); // High latency spike (>600ms)
    expect(service.networkQuality()).toBe('CONSTRAINED');
    expect(service.isConstrainedBandwidth()).toBe(true);
  });
});
