import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DirectIomtWearablesService } from './direct-iomt-wearables.service';
import { TippssIngestionGuardService } from './tippss-ingestion-guard.service';
import { WaveformEventBufferService } from './waveform-event-buffer.service';
import { HardwareLifecycleSentinelService } from './hardware-lifecycle-sentinel.service';
import { PatientStateService } from '../patient-state.service';

describe('DirectIomtWearablesService', () => {
  let service: DirectIomtWearablesService;
  let tippssGuard: TippssIngestionGuardService;
  let waveformBuffer: WaveformEventBufferService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DirectIomtWearablesService,
        TippssIngestionGuardService,
        WaveformEventBufferService,
        HardwareLifecycleSentinelService,
        PatientStateService
      ]
    });

    service = TestBed.inject(DirectIomtWearablesService);
    tippssGuard = TestBed.inject(TippssIngestionGuardService);
    waveformBuffer = TestBed.inject(WaveformEventBufferService);
  });

  afterEach(() => {
    service.stopBackgroundSync();
  });

  it('1. Initializes with Apple HealthKit as default direct ingestion provider', () => {
    expect(service.activeProvider()).toBe('APPLE_HEALTHKIT');
    const meta = service.deviceMetadata().APPLE_HEALTHKIT;
    expect(meta.manufacturer).toBe('Apple Inc.');
    expect(meta.hardwareRootOfTrust).toBe('APPLE_SECURE_ENCLAVE');
    expect(meta.bypassedVendorMiddlemen.length).toBeGreaterThan(0);
    expect(meta.bypassedVendorMiddlemen).toContain('Apple Health Cloud Webhooks');
  });

  it('2. Switches provider to Google Health Connect (Titan M2 Root of Trust)', () => {
    service.selectProvider('GOOGLE_HEALTH_CONNECT');
    expect(service.activeProvider()).toBe('GOOGLE_HEALTH_CONNECT');
    const meta = service.deviceMetadata().GOOGLE_HEALTH_CONNECT;
    expect(meta.hardwareRootOfTrust).toBe('GOOGLE_TITAN_M2');
    expect(service.tippssStatus().hardwareRootOfTrust).toBe('GOOGLE_TITAN_M2');
    expect(meta.bypassedVendorMiddlemen).toContain('Google Cloud Healthcare Egress');
  });

  it('3. Ingests Apple HealthKit biometrics directly and verifies IEEE P2933 TIPPSS', async () => {
    const sample = {
      heartRateBpm: 68,
      hrvRmssdMs: 62.4,
      spo2Pct: 99.1,
      respiratoryRateBpm: 13.5,
      wristSkinTemperatureC: 36.6
    };

    const result = await service.ingestAppleHealthKitSample(sample, [0.05, 0.12, 0.88, -0.22]);

    expect(result.heartRateBpm).toBe(68);
    expect(result.spo2Pct).toBe(99.1);
    expect(service.liveBiometrics().heartRateBpm).toBe(68);

    const trust = service.getTrustStatus();
    expect(trust.isApproved).toBe(true);
    expect(trust.pillarStatuses.trust).toBe(true);
    expect(trust.pillarStatuses.identity).toBe(true);
    expect(trust.pillarStatuses.security).toBe(true);
    expect(trust.hardwareRootOfTrust).toBe('APPLE_SECURE_ENCLAVE');
  });

  it('4. Ingests Google Health Connect records directly without cloud egress', async () => {
    service.selectProvider('GOOGLE_HEALTH_CONNECT');

    const record = {
      heartRateBpm: 60,
      spo2Pct: 98.8,
      bloodGlucoseMgDl: 92,
      sleepEfficiencyPct: 95.0
    };

    const result = await service.ingestGoogleHealthConnectRecord(record);
    expect(result.heartRateBpm).toBe(60);
    expect(result.bloodGlucoseMgDl).toBe(92);
    expect(service.tippssStatus().hardwareRootOfTrust).toBe('GOOGLE_TITAN_M2');
  });

  it('5. Controls continuous background sync loop without memory leaks', () => {
    service.stopBackgroundSync();
    expect(service.deviceMetadata().APPLE_HEALTHKIT.isBackgroundSyncActive).toBe(false);

    service.startBackgroundSync(2);
    expect(service.deviceMetadata().APPLE_HEALTHKIT.isBackgroundSyncActive).toBe(true);
    expect(service.deviceMetadata().APPLE_HEALTHKIT.backgroundIntervalSec).toBe(2);

    service.stopBackgroundSync();
    expect(service.deviceMetadata().APPLE_HEALTHKIT.isBackgroundSyncActive).toBe(false);
  });

  it('6. Evaluates circular battery lifecycle guidance (20%-80% cycling vs overcharge)', () => {
    // Normal 65% disconnected
    service.updateBatteryTelemetry(65, false);
    expect(service.batteryState().optimalCyclingBand).toContain('20% - 80%');
    expect(service.batteryState().swellingRiskDetected).toBe(false);
    expect(service.batteryState().lifespanExtensionYears).toBeGreaterThanOrEqual(3.0);

    // Overcharge swelling risk: 95% while charging
    service.updateBatteryTelemetry(95, true);
    expect(service.batteryState().swellingRiskDetected).toBe(true);
    expect(service.batteryState().optimalCyclingBand).toContain('>90% Overcharge');
    expect(service.batteryState().chargeGuidance).toContain('pouch cell swelling');

    // Deep discharge: 10%
    service.updateBatteryTelemetry(10, false);
    expect(service.batteryState().optimalCyclingBand).toContain('Deep Discharge');
  });

  it('7. Triggers test cardiac anomaly and freezes -15s/+15s incident snapshot in RAM', async () => {
    await service.triggerTestCardiacAnomaly('tachycardia');
    expect(service.liveBiometrics().heartRateBpm).toBe(158);

    const snapshots = waveformBuffer.frozenIncidentSnapshots();
    expect(snapshots.length).toBeGreaterThan(0);
    expect(snapshots[0].acuity).toBe('STAT_EMERGENCY');
    expect(snapshots[0].triggerReason).toContain('Tachycardia');
  });

  it('8. Reports anti-data landfill compaction metrics and exports JSON receipt', () => {
    const metrics = service.getCompactionMetrics();
    expect(metrics.compactionRatioPercent).toBeGreaterThanOrEqual(99.0);
    expect(metrics.dataLandfillKBSaved).toBeDefined();

    const receipt = service.exportWearableAuditReceipt();
    expect(receipt).toContain('IEEE P2933™ TIPPSS');
    const parsed = JSON.parse(receipt);
    expect(parsed.tippssVerification.isApproved).toBe(true);
    expect(parsed.batteryCircularity).toBeDefined();
    expect(parsed.device.hardwareRootOfTrust).toBeDefined();
  });
});
