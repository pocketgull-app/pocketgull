import '@angular/compiler';
import { expect } from 'vitest';
import { SmartOnFhirLauncherService } from './smart-on-fhir-launcher.service';

import { Injector, runInInjectionContext } from '@angular/core';

describe('SmartOnFhirLauncherService Unit Suite', () => {
  let service: SmartOnFhirLauncherService;

  beforeEach(() => {
    const injector = Injector.create({ providers: [] });
    service = runInInjectionContext(injector, () => new SmartOnFhirLauncherService());
  });

  it('1. Initializes with supported EHR vendors', () => {
    const vendors = service.supportedVendors();
    expect(vendors.length).toBeGreaterThanOrEqual(4);
    expect(vendors.some(v => v.id === 'epic')).toBe(true);
    expect(vendors.some(v => v.id === 'cerner')).toBe(true);
    expect(vendors.some(v => v.id === 'va_health')).toBe(true);
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
});
