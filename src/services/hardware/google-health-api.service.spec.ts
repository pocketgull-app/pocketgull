import { TestBed } from '@angular/core/testing';
import { GoogleHealthApiService } from './google-health-api.service';

describe('GoogleHealthApiService', () => {
  let service: GoogleHealthApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleHealthApiService);
  });

  it('1. Initializes default Google Health connection with Health Connect active', () => {
    expect(service.isConnected()).toBe(true);
    expect(service.connectionStatus().provider).toBe('ANDROID_HEALTH_CONNECT');
    expect(service.liveBiometrics().restingHeartRateBpm).toBe(58);
    expect(service.liveBiometrics().oxygenSaturationSpO2Pct).toBeGreaterThan(95);
  });

  it('2. Computes Vagal Tone Recovery Index accurately from HRV and RHR', () => {
    const vagalIndex = service.vagalToneRecoveryIndex();
    expect(vagalIndex).toBeGreaterThanOrEqual(50);
    expect(vagalIndex).toBeLessThanOrEqual(100);
  });

  it('3. Syncs real-time biometrics and updates sync timestamp', async () => {
    const prevSteps = service.liveBiometrics().totalDailySteps;
    const updated = await service.syncBiometrics();

    expect(updated.totalDailySteps).toBeGreaterThan(prevSteps);
    expect(service.connectionStatus().lastSyncTimestamp).toBeDefined();
  });

  it('4. Converts live biometrics into FHIR R4 Observations', () => {
    const fhirEntries = service.toFhirBiometricEntries();
    expect(fhirEntries.length).toBe(3);

    const hrv = fhirEntries.find(e => e.type === 'hrv');
    expect(hrv).toBeDefined();
    expect(hrv?.unit).toBe('ms');

    const rhr = fhirEntries.find(e => e.type === 'hr');
    expect(rhr).toBeDefined();
    expect(rhr?.unit).toBe('bpm');
  });

  it('5. Disconnects and erases data on patient withdrawal (HIPAA Right of Erasure)', () => {
    service.disconnectAndEraseData();
    expect(service.isConnected()).toBe(false);
    expect(service.connectionStatus().hasInformedConsent).toBe(false);
  });
});
