import '@angular/compiler';
import { GlobalJurisdictionMatrixService } from './global-jurisdiction-matrix.service';

describe('GlobalJurisdictionMatrixService Unit Suite', () => {
  let service: GlobalJurisdictionMatrixService;

  beforeEach(() => {
    service = new GlobalJurisdictionMatrixService();
  });

  it('1. Correctly resolves California (US-CA) regulatory framework and CMIA consents', () => {
    service.setLocation('US', 'CA');
    const profile = service.activeProfile();
    expect(profile.jurisdictionId).toBe('US-CA');
    expect(profile.dataPrivacyStatute).toContain('CMIA');
    expect(profile.electronicHealthRecordStandard).toBe('FHIR_US_CORE_R4');
    expect(profile.mandatoryConsents.some(c => c.statute.includes('CMIA'))).toBe(true);
    expect(profile.emergencyDispatch.some(e => e.number === '988')).toBe(true);
  });

  it('2. Correctly resolves Washington State (US-WA) My Health My Data Act (MHMDA) & Geofencing ban', () => {
    service.setLocation('US', 'WA');
    const profile = service.activeProfile();
    expect(profile.jurisdictionId).toBe('US-WA');
    expect(profile.dataPrivacyStatute).toContain('MHMDA');
    expect(profile.mandatoryConsents.some(c => c.statute.includes('RCW 19.373'))).toBe(true);
  });

  it('3. Correctly resolves Illinois (US-IL) BIPA biometric written release mandates', () => {
    service.setLocation('US', 'IL');
    const profile = service.activeProfile();
    expect(profile.jurisdictionId).toBe('US-IL');
    expect(profile.biometricConsentLaw).toContain('BIPA');
    expect(profile.mandatoryConsents.some(c => c.requirementName.includes('Biometric Release'))).toBe(true);
  });

  it('4. Correctly resolves European Union (EU) GDPR Art 9, EU AI Act High-Risk, and EHDS standard', () => {
    service.setLocation('EU');
    const profile = service.activeProfile();
    expect(profile.jurisdictionId).toBe('EU');
    expect(profile.dataPrivacyStatute).toContain('GDPR');
    expect(profile.clinicalAiClassification).toContain('EU Artificial Intelligence Act');
    expect(profile.electronicHealthRecordStandard).toBe('FHIR_EU_EHDS');
    expect(profile.emergencyDispatch.some(e => e.number === '112')).toBe(true);
  });

  it('5. Correctly resolves United Kingdom (GB) NHS DTAC, NICE DHT, and MHRA frameworks', () => {
    service.setLocation('GB');
    const profile = service.activeProfile();
    expect(profile.jurisdictionId).toBe('GB');
    expect(profile.statutoryHealthAgency).toContain('MHRA');
    expect(profile.electronicHealthRecordStandard).toBe('FHIR_UK_CORE');
    expect(profile.emergencyDispatch.some(e => e.number === '999')).toBe(true);
  });

  it('6. Correctly resolves India (IN) ABDM FHIR standard, DPDP Act 2023, and AYUSH multi-paradigms', () => {
    service.setLocation('IN');
    const profile = service.activeProfile();
    expect(profile.jurisdictionId).toBe('IN');
    expect(profile.dataPrivacyStatute).toContain('DPDP Act');
    expect(profile.electronicHealthRecordStandard).toBe('ABDM_FHIR_INDIA');
    expect(profile.approvedParadigms).toContain('Ayurveda (Ministry of AYUSH)');
  });

  it('7. Correctly resolves Japan (JP) APPI, Kampo medicine reimbursement, and PMDA AI SaMD', () => {
    service.setLocation('JP');
    const profile = service.activeProfile();
    expect(profile.jurisdictionId).toBe('JP');
    expect(profile.approvedParadigms).toContain('Kampo Medicine (MHLW National Health Insurance Covered Formulations)');
    expect(profile.emergencyDispatch.some(e => e.number === '119')).toBe(true);
  });
});
