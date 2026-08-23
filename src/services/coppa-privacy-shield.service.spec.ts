import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { createEnvironmentInjector, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { CoppaPrivacyShieldService, COPPA_COMPLIANCE_RULES } from './coppa-privacy-shield.service';

describe('CoppaPrivacyShieldService (FTC 16 C.F.R. Part 312)', () => {
  let service: CoppaPrivacyShieldService;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = createEnvironmentInjector([], undefined as any);

    runInInjectionContext(injector, () => {
      service = new CoppaPrivacyShieldService();
    });
  });

  it('should initialize with 5 core COPPA compliance rules and 100% compliant audit', () => {
    expect(service).toBeTruthy();
    expect(service.rules().length).toBe(5);
    expect(service.rules()).toEqual(COPPA_COMPLIANCE_RULES);

    const audit = service.complianceAudit();
    expect(audit.isFullyCompliant).toBe(true);
    expect(audit.activeTrackersCount).toBe(0);
    expect(audit.remotePiiStorageBytes).toBe(0);
    expect(audit.microphoneEgressMode).toBe('ZERO_EGRESS_EDGE_ONLY');
    expect(audit.computationMode).toBe('100% Client-Side Local Edge');
  });

  it('should accurately evaluate age thresholds for COPPA jurisdiction (< 13 years)', () => {
    expect(service.isUnderAgeThreshold(4)).toBe(true);
    expect(service.isUnderAgeThreshold(7)).toBe(true);
    expect(service.isUnderAgeThreshold(12)).toBe(true);
    expect(service.isUnderAgeThreshold(13)).toBe(false);
    expect(service.isUnderAgeThreshold(25)).toBe(false);
    expect(service.isUnderAgeThreshold(null)).toBe(false);
    expect(service.isUnderAgeThreshold(undefined)).toBe(false);
    expect(service.isUnderAgeThreshold(0)).toBe(false);
  });

  it('should manage pediatric context state transitions', () => {
    expect(service.isPediatricContext()).toBe(false);
    service.setPediatricContext(true);
    expect(service.isPediatricContext()).toBe(true);
    service.setPediatricContext(false);
    expect(service.isPediatricContext()).toBe(false);
  });

  it('should record, validate, and revoke Guardian Proxy Attestations', () => {
    expect(service.guardianAttestation().isAttested).toBe(false);
    expect(service.guardianAttestation().relationship).toBeNull();

    const attestation = service.recordGuardianAttestation(
      'Parent',
      'Affirmative consent for pediatric clinical consult'
    );

    expect(attestation.isAttested).toBe(true);
    expect(attestation.relationship).toBe('Parent');
    expect(attestation.timestamp).toBeTruthy();
    expect(service.guardianAttestation().isAttested).toBe(true);

    service.revokeGuardianAttestation();
    expect(service.guardianAttestation().isAttested).toBe(false);
    expect(service.guardianAttestation().relationship).toBeNull();
    expect(service.guardianAttestation().timestamp).toBeNull();
  });

  it('should produce an authoritative compliance report for regulatory auditing', () => {
    service.recordGuardianAttestation('Legal Guardian', 'Hospital authorized guardian representation');
    const report = service.getComplianceReport();

    expect(report.status).toBe('VERIFIED_COMPLIANT');
    expect(report.audit.isFullyCompliant).toBe(true);
    expect(report.attestation.isAttested).toBe(true);
    expect(report.attestation.relationship).toBe('Legal Guardian');
    expect(report.rules.length).toBe(5);
  });
});
