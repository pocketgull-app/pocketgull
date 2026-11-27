import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CmsBlueButtonService, CMS_BLUE_BUTTON_ENDPOINTS } from './cms-blue-button.service';
import { PatientStateService } from '../patient-state.service';
import { computeFipsSha256Bytes } from '../clinical-defense-guard.service';

describe('CmsBlueButtonService Unit Suite', () => {
  let service: CmsBlueButtonService;
  let addClinicalNoteSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    addClinicalNoteSpy = vi.fn();
    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: { addClinicalNote: addClinicalNoteSpy } }
      ]
    });
    service = runInInjectionContext(injector, () => new CmsBlueButtonService());
  });

  it('1. Builds RFC 7636 PKCE (S256) + CSPRNG state OAuth2 URL for CMS Blue Button 2.0', () => {
    const req = service.buildAuthorizeRequest({ environment: 'production' });
    expect(req.authorizeUrl).toContain(CMS_BLUE_BUTTON_ENDPOINTS.production.authorizeUrl);
    expect(req.authorizeUrl).toContain('code_challenge_method=S256');
    expect(req.authorizeUrl).toContain('patient%2FExplanationOfBenefit.read');
    expect(req.codeVerifier.startsWith('bb2-pkce-')).toBe(true);
    expect(req.stateNonce.startsWith('bb2-state-')).toBe(true);

    const expectedBytes = computeFipsSha256Bytes(req.codeVerifier);
    let bin = '';
    for (let i = 0; i < expectedBytes.length; i++) bin += String.fromCharCode(expectedBytes[i]);
    const expectedChallenge = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(req.pkceChallengeS256).toBe(expectedChallenge);
    expect(service.connectionStatus()).toBe('AUTHORIZING');
  });

  it('2. Loads deterministic CMS Blue Button Sandbox bundle, computes 2026 Part D cap progress, and commits zero-typing clinical note', () => {
    const summary = service.loadSandboxMedicareBundle(2026);
    expect(summary.dataOrigin).toBe('CMS_BLUE_BUTTON_SANDBOX_SYNTHETIC');
    expect(summary.partDMedications.length).toBe(3);
    expect(summary.coverage.hasPartA).toBe(true);
    expect(summary.coverage.hasPartB).toBe(true);
    expect(summary.coverage.hasPartD).toBe(true);
    expect(summary.coverage.isQmbFlagged).toBe(true);
    expect(summary.ytdPartDOutOfPocketUsd).toBeCloseTo(1437, 2);
    expect(summary.partDCapUsd).toBe(2100);
    expect(summary.remainingUntilPartDCapUsd).toBeCloseTo(663, 2);
    expect(summary.hasReachedPartDCatastrophicCap).toBe(false);
    expect(summary.sha256ProvenanceSeal.length).toBe(64);
    expect(addClinicalNoteSpy).toHaveBeenCalledTimes(1);
    expect(service.connectionStatus()).toBe('IMPORTED');
  });

  it('3. Detects catastrophic Part D cap completion when uploaded FHIR EOBs exceed 2026 $2,100 threshold', () => {
    const uploadedBundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        {
          resource: {
            resourceType: 'ExplanationOfBenefit',
            id: 'eob-specialty-1',
            type: { coding: [{ code: 'pharmacy' }] },
            billablePeriod: { start: '2026-04-01' },
            item: [{ productOrService: { coding: [{ display: 'Ibrutinib 140 MG Capsule' }] }, quantity: { value: 30 } }],
            total: [{ category: { coding: [{ code: 'patientpay' }] }, amount: { value: 2150 } }]
          }
        }
      ]
    };

    const parsed = service.parseBlueButtonBundle(uploadedBundle, 'PATIENT_UPLOADED_FHIR_R4', 2026);
    expect(parsed.dataOrigin).toBe('PATIENT_UPLOADED_FHIR_R4');
    expect(parsed.hasReachedPartDCatastrophicCap).toBe(true);
    expect(parsed.remainingUntilPartDCapUsd).toBe(0);
  });

  it('4. Rejects non-Bundle payloads deterministically', () => {
    expect(() => service.parseBlueButtonBundle({ resourceType: 'Patient' })).toThrow(/Invalid FHIR R4 payload/);
  });

  it('5. Resets session cleanly', () => {
    service.loadSandboxMedicareBundle(2026);
    service.resetSession();
    expect(service.connectionStatus()).toBe('IDLE');
    expect(service.lastImportSummary()).toBeNull();
  });
});
