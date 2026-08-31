import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { InstitutionalComplianceService } from './institutional-compliance.service';

describe('InstitutionalComplianceService Unit Suite', () => {
  let service: InstitutionalComplianceService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [InstitutionalComplianceService]
    });
    service = runInInjectionContext(injector, () => injector.get(InstitutionalComplianceService));
  });

  it('1. Initializes with 10 statutory compliance standards', () => {
    expect(service).toBeTruthy();
    expect(service.statutoryStandards().length).toBe(10);
    expect(service.complianceScore()).toBe(100);
  });

  it('2. Enforces HIPAA, FDA, NIST, MSA, FTC, FVEY, and WCAG standards', () => {
    const ids = service.statutoryStandards().map(s => s.frameworkId);
    expect(ids).toContain('HIPAA-SAFE-HARBOR');
    expect(ids).toContain('HIPAA-SECURITY-RULE');
    expect(ids).toContain('FDA-CDSR-21CFR11');
    expect(ids).toContain('NIST-SP-800-90A');
    expect(ids).toContain('NIST-SP-800-63-3');
    expect(ids).toContain('MSFT-MSA-SEPT-2026');
    expect(ids).toContain('FTC-AFFILIATE-EGRESS');
    expect(ids).toContain('FVEY-SOVEREIGNTY');
    expect(ids).toContain('WCAG-AAA-OPTO');
    expect(ids).toContain('CYCLONEDX-SBOM');
  });

  it('3. Generates complete institutional compliance certificate with C2PA manifest', () => {
    const cert = service.generateComplianceCertificate();
    expect(cert).toBeTruthy();
    expect(cert.certificateId).toContain('PGCERT-2026-');
    expect(cert.overallComplianceScore).toBe(100);
    expect(cert.c2paProvenanceManifest).toContain('urn:c2pa:manifest:pocketgull:compliance:');
    expect(cert.nistEntropySha256).toContain('SHA256:');
    expect(cert.dualCustodyVerified).toBe(true);
    expect(cert.zeroKnowledgeEnforced).toBe(true);
  });
});
