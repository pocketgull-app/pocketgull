import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { WebauthnPasskeyService } from './webauthn-passkey.service';

describe('WebauthnPasskeyService Unit Suite', () => {
  let service: WebauthnPasskeyService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [WebauthnPasskeyService]
    });
    service = runInInjectionContext(injector, () => injector.get(WebauthnPasskeyService));
  });

  it('1. Initializes cleanly with default state', () => {
    expect(service).toBeTruthy();
    expect(service.pendingChallenge()).toBeNull();
    expect(service.lastVerifiedAttestation()).toBeNull();
    expect(service.isVerifying()).toBe(false);
  });

  it('2. Generates 32-byte cryptographic entropy challenge', () => {
    const challenge = service.generateSecureEntropyChallenge();
    expect(challenge).toBeInstanceOf(Uint8Array);
    expect(challenge.length).toBe(32);
    expect(challenge.some(b => b !== 0)).toBe(true);
  });

  it('3. Executes step-up challenge and issues NIST AAL-2 verified receipt', async () => {
    const receipt = await service.requestPasskeyStepUp({
      actionDescription: 'Export 100 Patient Records to FHIR R4 Bundle',
      requiredRole: 'CLINICIAN',
      riskCategory: 'BULK_RECORD_EXPORT',
      minimumAal: 'AAL-2'
    });

    expect(receipt).toBeTruthy();
    expect(receipt.credentialId).toBeDefined();
    expect(receipt.aalLevel).toBe('AAL-2');
    expect(receipt.ialLevel).toBe('IAL-2');
    expect(receipt.signatureSha256).toBeDefined();
    expect(receipt.c2paProvenanceSeal).toContain('C2PA-');
    expect(service.lastVerifiedAttestation()).toEqual(receipt);
  });

  it('4. Handles challenge cancellation gracefully', () => {
    service.pendingChallenge.set({
      actionDescription: 'State Reset',
      requiredRole: 'EXECUTIVE',
      riskCategory: 'STATE_DELETION',
      minimumAal: 'AAL-3'
    });
    service.isVerifying.set(true);

    service.cancelPendingChallenge();
    expect(service.pendingChallenge()).toBeNull();
    expect(service.isVerifying()).toBe(false);
  });
});
