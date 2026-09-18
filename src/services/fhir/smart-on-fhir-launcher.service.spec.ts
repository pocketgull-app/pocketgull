import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { SmartOnFhirLauncherService } from './smart-on-fhir-launcher.service';

describe('SmartOnFhirLauncherService Unit Suite', () => {
  let service: SmartOnFhirLauncherService;

  beforeEach(() => {
    const injector = Injector.create({ providers: [] });
    service = runInInjectionContext(injector, () => new SmartOnFhirLauncherService());
  });

  it('1. Initializes with supported EHR vendors', () => {
    const vendors = service.supportedVendors();
    expect(vendors.length).toBeGreaterThanOrEqual(3);
    expect(vendors.some(v => v.id === 'epic')).toBe(true);
    expect(vendors.some(v => v.id === 'cerner')).toBe(true);
  });

  it('2. Initiates SMART v2 launch flow with PKCE state and connects session', async () => {
    service.initiateLaunch('epic', 'test-launch-code-123');
    expect(service.activeSession().status).toBe('AUTHORIZING');
    expect(service.activeSession().codeVerifier).toContain('pkce-');
    expect(service.activeSession().stateNonce).toContain('nonce-');

    await new Promise(resolve => setTimeout(resolve, 500));

    expect(service.activeSession().status).toBe('CONNECTED');
    expect(service.activeSession().patientId).toBe('P001');
    expect(service.isConnected()).toBe(true);
  });

  it('3. Validates FHIR R4 Bundle structure compliance', () => {
    const validBundle = { resourceType: 'Bundle', type: 'collection', entry: [] };
    expect(service.validateFhirR4Bundle(validBundle).valid).toBe(true);

    const invalidBundle = { resourceType: 'Patient', id: 'P1' };
    const res = service.validateFhirR4Bundle(invalidBundle);
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it('4. Disconnects session cleanly', () => {
    service.disconnectSession();
    expect(service.activeSession().status).toBe('IDLE');
    expect(service.isConnected()).toBe(false);
  });

  it('5. Validates EHR launch conformance with PKCE S256 and launch context token for Epic', () => {
    const result = service.validateSmartLaunchConformance('epic', {
      launchType: 'ehr_launch',
      launchContextToken: 'epic-launch-test-token-9912'
    });

    expect(result.isValid).toBe(true);
    expect(result.scorePct).toBe(100);
    expect(result.vendorId).toBe('epic');
    expect(result.launchType).toBe('ehr_launch');
    expect(result.pkceChallengeS256.length).toBeGreaterThanOrEqual(43);
    expect(result.codeVerifier.length).toBeGreaterThanOrEqual(43);
    expect(result.stateNonce).toContain('nonce-');
    expect(result.constructedAuthorizeUrl).toContain('response_type=code');
    expect(result.constructedAuthorizeUrl).toContain('code_challenge_method=S256');
    expect(result.constructedAuthorizeUrl).toContain('launch=epic-launch-test-token-9912');
    expect(result.constructedAuthorizeUrl).toContain('https%3A%2F%2Fpocketgull.app%2Fsmart-callback');
    expect(result.checks.every(c => c.passed)).toBe(true);
  });

  it('6. Validates Standalone Patient launch conformance for Oracle Cerner', () => {
    const result = service.validateSmartLaunchConformance('cerner', {
      launchType: 'standalone_launch',
      scopes: ['launch/patient', 'openid', 'fhirUser', 'patient/*.read', 'offline_access']
    });

    expect(result.isValid).toBe(true);
    expect(result.scorePct).toBe(100);
    expect(result.vendorId).toBe('cerner');
    expect(result.launchType).toBe('standalone_launch');
    expect(result.constructedAuthorizeUrl).toContain('launch%2Fpatient');
    expect(result.constructedAuthorizeUrl).not.toContain('launch=');
    expect(result.checks.length).toBe(6);
    expect(result.checks.every(c => c.passed)).toBe(true);
  });
});
