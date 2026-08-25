import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID, ɵChangeDetectionScheduler as ChangeDetectionScheduler } from '@angular/core';
import { ImpactProgramAgreementService } from './impact-program-agreement.service';

describe('ImpactProgramAgreementService (Impact.com MPA & Google Antigravity Legal Compliance)', () => {
  let service: ImpactProgramAgreementService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: ChangeDetectionScheduler, useValue: { schedule: () => {}, notify: () => {} } },
        { provide: PLATFORM_ID, useValue: 'server' },
        ImpactProgramAgreementService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(ImpactProgramAgreementService));
  });

  it('1. Verifies full compliance with Impact.com MPA', () => {
    expect(service.mpaEffectiveDate()).toBe('2025-04-01');
    expect(service.mpaComplianceRules().length).toBe(4);
    expect(service.isFullMpaCompliant()).toBe(true);
  });

  it('2. Verifies full compliance with Google Antigravity Additional Terms of Service', () => {
    expect(service.antigravityEffectiveDate()).toBe('2026-08-24');
    expect(service.antigravityComplianceRules().length).toBe(6);
    expect(service.isFullAntigravityCompliant()).toBe(true);

    const ruleIds = service.antigravityComplianceRules().map(r => r.ruleId);
    expect(ruleIds).toContain('agy_sec_1_enterprise');
    expect(ruleIds).toContain('agy_sec_4_agents');
    expect(ruleIds).toContain('agy_sec_5_privacy');
    expect(ruleIds).toContain('agy_sec_6_conduct');
    expect(ruleIds).toContain('agy_sec_7_skills');
    expect(ruleIds).toContain('agy_sec_8_models');
  });

  it('3. Generates valid cryptographic legal attestation snapshot', () => {
    expect(service.isAllAgreementsCompliant()).toBe(true);
    const attestation = service.generateLegalAttestation();
    expect(attestation.allCompliant).toBe(true);
    expect(attestation.totalRulesAudited).toBe(10);
    expect(attestation.supportDeletionVector).toBe('antigravity-support@google.com');
    expect(attestation.governanceStandards).toContain('Google Antigravity Additional Terms of Service (2026)');
    expect(attestation.governanceStandards).toContain('Anthropic Commercial Terms');
  });
});
