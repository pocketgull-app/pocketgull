import { TestBed } from '@angular/core/testing';
import { TippssIngestionGuardService, ITippssTelemetryFrame } from './tippss-ingestion-guard.service';

describe('TippssIngestionGuardService (IEEE P2933™ TIPPSS Compliance)', () => {
  let service: TippssIngestionGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TippssIngestionGuardService]
    });
    service = TestBed.inject(TippssIngestionGuardService);
  });

  describe('Pillar 1: Trust (Verified Device & Entity Identity)', () => {
    it('1.1 Pre-enrolls Google Pixel Watch 2 with Titan M2 hardware root of trust', () => {
      const summary = service.tippssSummary();
      expect(summary.trustLevel).toBe('VERIFIED_ICAP');
      expect(summary.enrolledDevicesCount).toBeGreaterThanOrEqual(3);

      const pixelWatch = service.enrolledDevices().find(d => d.deviceId.includes('PIXELWATCH2'));
      expect(pixelWatch).toBeDefined();
      expect(pixelWatch?.hardwareRootOfTrust).toBe('GOOGLE_TITAN_M2');
      expect(pixelWatch?.ieeeIcapCertified).toBe(true);
    });

    it('1.2 Rejects telemetry from un-enrolled or rogue BLE peripherals', () => {
      const rogueFrame: ITippssTelemetryFrame = {
        deviceId: 'ROGUE-SPOOFED-BLE-PERIPHERAL-MAC-DEADBEEF',
        patientId: 'PATIENT-SELF-01',
        timestampMs: Date.now(),
        sequenceNumber: 1,
        modality: 'heart_rate',
        value: 75,
        signalQualityIndex: 90,
        leadOffDetected: false
      };

      const result = service.verifyAndSanitize(rogueFrame);
      expect(result.isApproved).toBe(false);
      expect(result.pillarViolations).toContain('TRUST');
      expect(result.violationReason).toContain('not enrolled in the IEEE ICAP trusted device registry');
    });

    it('1.3 Successfully enrolls new physical Pixel Watch 2 hardware dynamically', () => {
      const newWatch = service.enrollPixelHardware({
        pixelWatchUdi: 'FDA-UDI-00840244700018-PIXELWATCH2-LIVE',
        pixelPhoneModel: 'Pixel 8 Pro (Titan M2)',
        patientId: 'PATIENT-SELF-01'
      });

      expect(newWatch.hardwareRootOfTrust).toBe('GOOGLE_TITAN_M2');
      expect(newWatch.assignedPatientId).toBe('PATIENT-SELF-01');

      const enrolled = service.enrolledDevices().find(d => d.deviceId === 'FDA-UDI-00840244700018-PIXELWATCH2-LIVE');
      expect(enrolled).toBeDefined();
    });

    it('1.4 Enrolls Apple Watch with Apple Secure Enclave root of trust', () => {
      const appleWatch = service.enrollAppleWatch({
        watchUdi: 'FDA-UDI-00194252003348-APPLEWATCH-ULTRA2',
        model: 'Apple Watch Ultra 2 (watchOS 10)',
        patientId: 'PATIENT-SELF-01'
      });

      expect(appleWatch.hardwareRootOfTrust).toBe('APPLE_SECURE_ENCLAVE');
      expect(appleWatch.ieeeIcapCertified).toBe(true);

      const enrolled = service.enrolledDevices().find(d => d.deviceId === 'FDA-UDI-00194252003348-APPLEWATCH-ULTRA2');
      expect(enrolled).toBeDefined();
    });

    it('1.5 Enrolls Garmin Smartwatch with ARM TrustZone root of trust', () => {
      const garmin = service.enrollGarminWatch({
        garminUdi: 'FDA-UDI-00753759002231-GARMINWATCH-FR965',
        model: 'Garmin Forerunner 965',
        patientId: 'PATIENT-SELF-01'
      });

      expect(garmin.hardwareRootOfTrust).toBe('ARM_TRUSTZONE');
      expect(garmin.ieeeIcapCertified).toBe(true);

      const enrolled = service.enrolledDevices().find(d => d.deviceId === 'FDA-UDI-00753759002231-GARMINWATCH-FR965');
      expect(enrolled).toBeDefined();
    });
  });

  describe('Pillar 2: Identity (Non-Spoofable Attestation & Patient Binding)', () => {
    it('2.1 Generates NIST SP 800-90A CSPRNG attestation challenge nonce for handshake', () => {
      const nonce1 = service.generateAttestationChallengeNonce('FDA-UDI-00840244700018-PIXELWATCH2');
      const nonce2 = service.generateAttestationChallengeNonce('FDA-UDI-00840244700018-PIXELWATCH2');

      expect(nonce1.length).toBe(32); // 16 bytes = 32 hex chars
      expect(nonce2.length).toBe(32);
      expect(nonce1).not.toBe(nonce2);
    });

    it('2.2 Blocks telemetry when device-to-patient binding token is violated (swapped device)', () => {
      const frameWithWrongPatient: ITippssTelemetryFrame = {
        deviceId: 'FDA-UDI-00840244700018-PIXELWATCH2',
        patientId: 'PATIENT-INTRUDER-99', // Device is bound to PATIENT-SELF-01
        timestampMs: Date.now(),
        sequenceNumber: 1,
        modality: 'heart_rate',
        value: 72,
        signalQualityIndex: 95,
        leadOffDetected: false
      };

      const result = service.verifyAndSanitize(frameWithWrongPatient);
      expect(result.isApproved).toBe(false);
      expect(result.pillarViolations).toContain('IDENTITY');
      expect(result.violationReason).toContain('Patient binding mismatch');
    });
  });

  describe('Pillar 3: Privacy (Strict Patient Modality Micro-Consents)', () => {
    it('3.1 Drops unconsented telemetry modalities (e.g. raw PPG waveforms) at ingress', () => {
      const ppgFrame: ITippssTelemetryFrame = {
        deviceId: 'FDA-UDI-00840244700018-PIXELWATCH2',
        patientId: 'PATIENT-SELF-01',
        timestampMs: Date.now(),
        sequenceNumber: 1,
        modality: 'raw_ppg', // Default consent is false
        value: 1024,
        signalQualityIndex: 98,
        leadOffDetected: false
      };

      const result = service.verifyAndSanitize(ppgFrame);
      expect(result.isApproved).toBe(false);
      expect(result.pillarViolations).toContain('PRIVACY');
      expect(result.violationReason).toContain('micro-consent is revoked');
    });

    it('3.2 Dynamically honors patient micro-consent updates', () => {
      service.updateMicroConsents({ allowRawPpgWaveforms: true });

      const ppgFrame: ITippssTelemetryFrame = {
        deviceId: 'FDA-UDI-00840244700018-PIXELWATCH2',
        patientId: 'PATIENT-SELF-01',
        timestampMs: Date.now(),
        sequenceNumber: 1,
        modality: 'raw_ppg',
        value: 1024,
        signalQualityIndex: 98,
        leadOffDetected: false
      };

      const result = service.verifyAndSanitize(ppgFrame);
      expect(result.isApproved).toBe(true);
      expect(result.sanitizedFrame?.modality).toBe('raw_ppg');
    });
  });

  describe('Pillar 4: Protection (Anti-Replay Counter & Payload Integrity)', () => {
    it('4.1 Detects and blocks replay attacks with non-monotonic sequence numbers', () => {
      const validFrame1: ITippssTelemetryFrame = {
        deviceId: 'FDA-UDI-00840244700018-PIXELWATCH2',
        patientId: 'PATIENT-SELF-01',
        timestampMs: Date.now(),
        sequenceNumber: 100,
        modality: 'heart_rate',
        value: 70,
        signalQualityIndex: 95,
        leadOffDetected: false
      };
      expect(service.verifyAndSanitize(validFrame1).isApproved).toBe(true);

      // Replayed frame with an older or equal sequence number
      const replayedFrame: ITippssTelemetryFrame = {
        deviceId: 'FDA-UDI-00840244700018-PIXELWATCH2',
        patientId: 'PATIENT-SELF-01',
        timestampMs: Date.now(),
        sequenceNumber: 99, // Lower than 100
        modality: 'heart_rate',
        value: 70,
        signalQualityIndex: 95,
        leadOffDetected: false
      };

      const result = service.verifyAndSanitize(replayedFrame);
      expect(result.isApproved).toBe(false);
      expect(result.pillarViolations).toContain('PROTECTION');
      expect(result.violationReason).toContain('Replay attack detected');
    });

    it('4.2 Rejects stale packets with excessive timestamp drift (>10000ms)', () => {
      const staleFrame: ITippssTelemetryFrame = {
        deviceId: 'FDA-UDI-00840244700018-PIXELWATCH2',
        patientId: 'PATIENT-SELF-01',
        timestampMs: Date.now() - 30000, // 30 seconds old
        sequenceNumber: 200,
        modality: 'heart_rate',
        value: 72,
        signalQualityIndex: 95,
        leadOffDetected: false
      };

      const result = service.verifyAndSanitize(staleFrame);
      expect(result.isApproved).toBe(false);
      expect(result.pillarViolations).toContain('PROTECTION');
      expect(result.violationReason).toContain('Timestamp drift invariant violated');
    });

    it('4.3 Rejects wireless relay attack packets with RSSI below proximity threshold (-85 dBm)', () => {
      const relayAttackFrame: ITippssTelemetryFrame = {
        deviceId: 'FDA-UDI-00840244700018-PIXELWATCH2',
        patientId: 'PATIENT-SELF-01',
        timestampMs: Date.now(),
        sequenceNumber: 250,
        modality: 'heart_rate',
        value: 74,
        signalQualityIndex: 95,
        leadOffDetected: false,
        rssiDbm: -92 // Below -85 dBm threshold
      };

      const result = service.verifyAndSanitize(relayAttackFrame);
      expect(result.isApproved).toBe(false);
      expect(result.pillarViolations).toContain('PROTECTION');
      expect(result.violationReason).toContain('Proximity gate rejected');

      // Now with authentic near RSSI (-68 dBm)
      const validFrame: ITippssTelemetryFrame = {
        ...relayAttackFrame,
        sequenceNumber: 251,
        rssiDbm: -68
      };
      const validResult = service.verifyAndSanitize(validFrame);
      expect(validResult.isApproved).toBe(true);
    });
  });

  describe('Pillar 5: Safety (Biophysical Plausibility & Lead-Off Discriminator)', () => {
    it('5.1 Rejects physiologically impossible spikes (e.g. 350 bpm HR) and triggers Safe-Harbor', () => {
      const impossibleHeartRate: ITippssTelemetryFrame = {
        deviceId: 'FDA-UDI-00840244700018-PIXELWATCH2',
        patientId: 'PATIENT-SELF-01',
        timestampMs: Date.now(),
        sequenceNumber: 300,
        modality: 'heart_rate',
        value: 350, // Human maximum physiological threshold is 220
        signalQualityIndex: 90,
        leadOffDetected: false
      };

      const result = service.verifyAndSanitize(impossibleHeartRate);
      expect(result.isApproved).toBe(false);
      expect(result.pillarViolations).toContain('SAFETY');
      expect(service.safeHarborState().isActive).toBe(true);
      expect(service.safeHarborState().reason).toContain('exceeds human biophysical limits');
    });

    it('5.2 Differentiates sensor lead-off detachment from physiological cardiac arrest', () => {
      const leadOffFrame: ITippssTelemetryFrame = {
        deviceId: 'FDA-UDI-00840244700018-PIXELWATCH2',
        patientId: 'PATIENT-SELF-01',
        timestampMs: Date.now(),
        sequenceNumber: 400,
        modality: 'heart_rate',
        value: 0,
        signalQualityIndex: 12, // Very low signal quality indicates detachment
        leadOffDetected: true
      };

      const result = service.verifyAndSanitize(leadOffFrame);
      expect(result.isApproved).toBe(false);
      expect(result.isLeadOffArtifact).toBe(true);
      expect(result.violationReason).toContain('Lead-off detachment detected');
    });
  });

  describe('Pillar 6: Security (Lifecycle Governance & Session Zeroization)', () => {
    it('6.1 Maintains a tamper-evident audit log of all ingestion events', () => {
      const frame: ITippssTelemetryFrame = {
        deviceId: 'FDA-UDI-00840244700018-PIXELWATCH2',
        patientId: 'PATIENT-SELF-01',
        timestampMs: Date.now(),
        sequenceNumber: 500,
        modality: 'spo2',
        value: 98,
        signalQualityIndex: 95,
        leadOffDetected: false
      };

      const res = service.verifyAndSanitize(frame);
      expect(res.isApproved).toBe(true);

      const latestAudit = service.auditLog()[0];
      expect(latestAudit).toBeDefined();
      expect(latestAudit.action).toBe('INGESTED');
      expect(latestAudit.modality).toBe('spo2');
      expect(latestAudit.integritySeal).toContain('sha256-tippss-');
    });

    it('6.2 Cryptographically zeroizes session state on device unpair/disconnect', () => {
      service.zeroizeSession('FDA-UDI-00840244700018-PIXELWATCH2');
      const latestAudit = service.auditLog()[0];
      expect(latestAudit.action).toBe('INGESTED');
      expect(latestAudit.reason).toContain('Cryptographic zeroization executed');
    });
  });

  describe('Advanced Ingress Defense: Titan M2 Passkey Step-Up & On-Device Edge Triage', () => {
    it('7.1 Authenticates high-risk controlled medication titration via Titan M2 / WebAuthn Passkey Step-Up', async () => {
      const result = await service.verifyMedicationOrderStepUp({
        drugName: 'Morphine Sulfate',
        dose: '5 mg IV STAT',
        clinicianId: 'DR-PGEAR-MD',
        patientId: 'PATIENT-SELF-01'
      });

      expect(result.isAuthorized).toBe(true);
      expect(result.receipt).toBeDefined();
      expect(result.receipt?.credentialId).toBeDefined();
      expect(result.receipt?.aalLevel).toBe('AAL-2');
      expect(result.receipt?.c2paProvenanceSeal).toContain('C2PA-');

      expect(service.lastMedicationPasskeyReceipt()).toEqual(result.receipt);

      const latestAudit = service.auditLog()[0];
      expect(latestAudit.modality).toBe('MEDICATION_STEPUP');
      expect(latestAudit.action).toBe('INGESTED');
      expect(latestAudit.reason).toContain('Titan M2 / WebAuthn FIDO2 step-up verified');
    });

    it('7.2 Performs on-device local edge triage for normal telemetry with ROUTINE acuity', async () => {
      const normalFrame: ITippssTelemetryFrame = {
        deviceId: 'FDA-UDI-00840244700018-PIXELWATCH2',
        patientId: 'PATIENT-SELF-01',
        timestampMs: Date.now(),
        sequenceNumber: 600,
        modality: 'heart_rate',
        value: 72,
        signalQualityIndex: 95,
        leadOffDetected: false,
        rssiDbm: -65
      };

      const triage = await service.triageTelemetryEdgeAnomaly(normalFrame);
      expect(triage.acuity).toBe('ROUTINE');
      expect(triage.anomalyScore).toBeLessThan(0.3);
      expect(triage.isEdgeComputed).toBe(true);
      expect(service.lastEdgeTriageResult()).toEqual(triage);
    });

    it('7.3 Detects critical tachyarrhythmia excursion as STAT_EMERGENCY on-device', async () => {
      const criticalFrame: ITippssTelemetryFrame = {
        deviceId: 'FDA-UDI-00840244700018-PIXELWATCH2',
        patientId: 'PATIENT-SELF-01',
        timestampMs: Date.now(),
        sequenceNumber: 601,
        modality: 'heart_rate',
        value: 185,
        signalQualityIndex: 96,
        leadOffDetected: false,
        rssiDbm: -65
      };

      const triage = await service.triageTelemetryEdgeAnomaly(criticalFrame);
      expect(triage.acuity).toBe('STAT_EMERGENCY');
      expect(triage.anomalyScore).toBeGreaterThanOrEqual(0.9);
      expect(triage.rationale).toContain('Critical tachyarrhythmia');
    });
  });
});
