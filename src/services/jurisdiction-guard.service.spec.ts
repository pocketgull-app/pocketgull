import '@angular/compiler';
import { JurisdictionGuardService } from './jurisdiction-guard.service';

describe('JurisdictionGuardService Unit Suite', () => {
  let service: JurisdictionGuardService;

  beforeEach(() => {
    service = new JurisdictionGuardService();
  });

  it('1. Defaults to US jurisdiction with full access to American statutory systems', () => {
    expect(service.countryCode()).toBe('US');
    expect(service.isUsJurisdiction()).toBe(true);
    expect(service.isSsaAccessible()).toBe(true);
    expect(service.isMedicareIrmaaAccessible()).toBe(true);
    expect(service.isVaVeteransAccessible()).toBe(true);

    const compliance = service.complianceStatus();
    expect(compliance.activeRegulatoryFramework).toBe('US_FEDERAL_HIPAA_SSA_CMS');
    expect(compliance.restrictedFeatures.length).toBe(0);
    expect(compliance.permittedFeatures).toContain('SSA_BLUE_BOOK_DISABILITY');
  });

  it('2. Supports US territories (PR, GU, VI, AS, MP) as valid US jurisdictions', () => {
    service.setCountry('PR');
    expect(service.isUsJurisdiction()).toBe(true);

    service.setCountry('GU');
    expect(service.isUsJurisdiction()).toBe(true);

    service.setCountry('VI');
    expect(service.isUsJurisdiction()).toBe(true);
  });

  it('3. Strictly restricts American statutory tools when country is set to international regions (GB, DE, JP, FR)', () => {
    service.setCountry('GB');
    expect(service.isUsJurisdiction()).toBe(false);
    expect(service.isSsaAccessible()).toBe(false);
    expect(service.isMedicareIrmaaAccessible()).toBe(false);
    expect(service.isVaVeteransAccessible()).toBe(false);

    const compliance = service.complianceStatus();
    expect(compliance.activeRegulatoryFramework).toBe('INTERNATIONAL_WHO_GDPR');
    expect(compliance.restrictedFeatures).toContain('SSA_BLUE_BOOK_DISABILITY');
    expect(compliance.restrictedFeatures).toContain('MEDICARE_IRMAA_SURCHARGE_APPEALS');
    expect(compliance.restrictedFeatures).toContain('VA_PACT_ACT_HEALTH_REGISTRY');
    expect(compliance.permittedFeatures).toContain('THREE_JS_3D_ANATOMY_VIEWER');
  });

  it('4. assertUsJurisdiction throws error when invoked from non-US country', () => {
    service.setCountry('DE');
    expect(() => {
      service.assertUsJurisdiction('SSA Disability Navigator');
    }).toThrowError(/designed for United States healthcare standards/);
  });

  it('5. assertUsJurisdiction succeeds without error when invoked within US jurisdiction', () => {
    service.setCountry('US');
    expect(() => {
      service.assertUsJurisdiction('SSA Disability Navigator');
    }).not.toThrow();
  });
});
