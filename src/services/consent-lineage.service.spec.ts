import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { ConsentLineageService, DEFAULT_CONSENT_SCOPE } from './consent-lineage.service';
import { SecureStorageService } from './secure-storage.service';

describe('ConsentLineageService - Consent-as-Code & Privacy Engineering', () => {
  let service: ConsentLineageService;
  let storage: SecureStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConsentLineageService, SecureStorageService]
    });
    service = TestBed.inject(ConsentLineageService);
    storage = TestBed.inject(SecureStorageService);
    service.resetConsentToDefault();
  });

  it('1. Initializes with default consent scopes correctly', () => {
    const scope = service.consentScope();
    expect(scope.symptoms).toBe(true);
    expect(scope.spatialLesions).toBe(true);
    expect(scope.vitalsTelemetry).toBe(true);
    expect(scope.audioStreaming).toBe(true);
    expect(scope.cameraVision).toBe(false); // Default off
    expect(service.isFullClinicalConsentGranted()).toBe(true);
  });

  it('2. Grants and revokes specific consent scopes dynamically', () => {
    expect(service.isScopeGranted('cameraVision')).toBe(false);
    service.grantScope('cameraVision');
    expect(service.isScopeGranted('cameraVision')).toBe(true);

    service.revokeScope('audioStreaming');
    expect(service.isScopeGranted('audioStreaming')).toBe(false);
    expect(service.isFullClinicalConsentGranted()).toBe(false);
  });

  it('3. Applies instant consent redaction to payloads when scope is revoked', () => {
    const testVitals = { hr: 72, bp: '120/80', spo2: 99 };

    expect(service.applyConsentRedaction(testVitals, 'vitalsTelemetry')).toEqual(testVitals);

    service.revokeScope('vitalsTelemetry');
    expect(service.applyConsentRedaction(testVitals, 'vitalsTelemetry')).toBeNull();
  });

  it('4. Attaches standardized FHIR R4 security tags and consent provenance extensions', () => {
    const mockObservation = {
      resourceType: 'Observation',
      id: 'obs-1',
      status: 'final',
      code: { text: '3D Lesion Observation' }
    };

    const tagged = service.attachConsentProvenance(mockObservation, 'spatialLesions');

    expect(tagged.meta.security).toBeTruthy();
    expect(tagged.meta.security[0].code).toBe('CONSENT-SCOPE');
    expect(tagged.meta.security[0].display).toContain('GRANTED');
    expect(tagged.extension).toBeTruthy();
    expect(tagged.extension[0].url).toContain('consent-lineage');
    expect(tagged.extension[0].extension.find((e: any) => e.url === 'scope').valueString).toBe('spatialLesions');
    expect(tagged.extension[0].extension.find((e: any) => e.url === 'status').valueCode).toBe('active');
  });

  it('5. Generates Zero-Data-Retention (ZDR) attestation headers', () => {
    const headers = service.getZdrAttestationHeader();

    expect(headers['X-ZDR-Attestation']).toBe('enabled');
    expect(headers['X-HIPAA-Safe-Harbor-DeID']).toContain('verified');
    expect(headers['X-Consent-Scope-Symptoms']).toBe('true');
    expect(headers['X-Consent-Timestamp']).toBeTruthy();
  });

  it('6. Purges consent tokens and resets to default on cryptographic wipe', () => {
    service.grantScope('cameraVision');
    expect(service.isScopeGranted('cameraVision')).toBe(true);

    service.purgeConsentTokens();
    expect(service.isScopeGranted('cameraVision')).toBe(false);
  });
});
