import { InternationalUniversityGeofenceService } from './international-university-geofence.service';

describe('InternationalUniversityGeofenceService', () => {
  let service: InternationalUniversityGeofenceService;

  beforeEach(() => {
    service = new InternationalUniversityGeofenceService();
  });

  it('should initialize with US_NCAA jurisdiction and default attestation', () => {
    expect(service).toBeTruthy();
    expect(service.activeJurisdiction()).toBe('US_NCAA');
    const att = service.activeGeofenceAttestation();
    expect(att.geofenceActive).toBe(true);
    expect(att.regulatoryStandard).toContain('HIPAA');
    expect(att.residencySealHash).toContain('GEO-SEAL-');
  });

  it('should switch to UK_EU_GDPR and update regulatory standard', () => {
    service.setJurisdiction('UK_EU_GDPR');
    expect(service.activeJurisdiction()).toBe('UK_EU_GDPR');
    const att = service.activeGeofenceAttestation();
    expect(att.regulatoryStandard).toContain('GDPR');
    expect(att.sovereignEdgeRegion).toContain('europe-west2');
  });

  it('should switch to INDIA_AYUSH_ABDM and update sovereignty profile', () => {
    service.setJurisdiction('INDIA_AYUSH_ABDM');
    expect(service.activeJurisdiction()).toBe('INDIA_AYUSH_ABDM');
    const att = service.activeGeofenceAttestation();
    expect(att.regulatoryStandard).toContain('DPDP Act');
    expect(att.regulatoryStandard).toContain('Ayushman Bharat');
    expect(att.sovereignEdgeRegion).toContain('asia-south1');
  });

  it('should switch to NZ_HIPC and update sovereignty profile', () => {
    service.setJurisdiction('NZ_HIPC');
    expect(service.activeJurisdiction()).toBe('NZ_HIPC');
    const att = service.activeGeofenceAttestation();
    expect(att.regulatoryStandard).toContain('Health Information Privacy Code');
    expect(att.sovereignEdgeRegion).toContain('australia-southeast2');
  });

  it('should select a partner university and align jurisdiction', () => {
    service.selectUniversity('aiia_aiims_delhi');
    expect(service.selectedUniversityId()).toBe('aiia_aiims_delhi');
    expect(service.activeJurisdiction()).toBe('INDIA_AYUSH_ABDM');

    service.selectUniversity('oxford_medicine');
    expect(service.selectedUniversityId()).toBe('oxford_medicine');
    expect(service.activeJurisdiction()).toBe('UK_EU_GDPR');
  });
});
