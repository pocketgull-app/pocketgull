import '@angular/compiler';
import { expect, describe, it, beforeEach } from 'vitest';
import { InternationalUniversityGeofenceService } from './international-university-geofence.service';

describe('InternationalUniversityGeofenceService Suite', () => {
  let service: InternationalUniversityGeofenceService;

  beforeEach(() => {
    service = new InternationalUniversityGeofenceService();
  });

  it('1. Initializes with US_NCAA default and includes leading global institutions', () => {
    expect(service.activeJurisdiction()).toBe('US_NCAA');
    const partners = service.internationalPartners();
    
    expect(partners.some(p => p.name.includes('Oxford'))).toBe(true);
    expect(partners.some(p => p.name.includes('Karolinska'))).toBe(true);
    expect(partners.some(p => p.name.includes('Melbourne'))).toBe(true);
    expect(partners.some(p => p.name.includes('Toronto'))).toBe(true);
    expect(partners.some(p => p.name.includes('Tokyo'))).toBe(true);
  });

  it('2. Enforces GDPR Art. 9 sovereign boundary when switching to UK_EU_GDPR', () => {
    service.setJurisdiction('UK_EU_GDPR');
    const attestation = service.activeGeofenceAttestation();

    expect(attestation.jurisdiction).toBe('UK_EU_GDPR');
    expect(attestation.regulatoryStandard).toContain('GDPR Art. 9');
    expect(attestation.sovereignEdgeRegion).toContain('europe-west2');
    expect(attestation.antiDopingCompliance).toContain('UKAD');
    expect(attestation.crossBorderTransferAllowed).toBe(false);
  });

  it('3. Enforces PIPEDA and Canadian health data residency when selecting Toronto', () => {
    service.selectUniversity('utoronto_medicine');
    const attestation = service.activeGeofenceAttestation();

    expect(service.activeJurisdiction()).toBe('CA_PIPEDA');
    expect(attestation.regulatoryStandard).toContain('PIPEDA');
    expect(attestation.sovereignEdgeRegion).toContain('northamerica-northeast1');
    expect(attestation.antiDopingCompliance).toContain('CCES');
  });

  it('4. Enforces APEC CBPR and Asian-Pacific regional boundaries when selecting NUS Singapore or Tokyo', () => {
    service.selectUniversity('nus_medicine');
    expect(service.activeJurisdiction()).toBe('APAC_CROSS_BORDER');

    const attestation = service.activeGeofenceAttestation();
    expect(attestation.regulatoryStandard).toContain('APEC');
    expect(attestation.sovereignEdgeRegion).toContain('asia-southeast1');
  });

  it('5. Generates unique cryptographic geofence residency seals per jurisdiction', () => {
    service.setJurisdiction('US_NCAA');
    const sealUs = service.activeGeofenceAttestation().residencySealHash;

    service.setJurisdiction('UK_EU_GDPR');
    const sealEu = service.activeGeofenceAttestation().residencySealHash;

    expect(sealUs).not.toBe(sealEu);
    expect(sealUs).toContain('GEO-SEAL-');
    expect(sealEu).toContain('GEO-SEAL-');
  });
});
