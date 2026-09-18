import '@angular/compiler';
import { UniversalLivingWillService } from './universal-living-will.service';

describe('UniversalLivingWillService Unit Suite', () => {
  let service: UniversalLivingWillService;

  beforeEach(() => {
    service = new UniversalLivingWillService();
  });

  it('1. Provides 100% free statutory state advance directive options', () => {
    const options = service.partnerOptions();
    expect(options.length).toBeGreaterThanOrEqual(3);

    const freeStateOption = options.find(o => o.id === 'free_statutory_state');
    expect(freeStateOption).toBeDefined();
    expect(freeStateOption?.is100PercentFree).toBe(true);
    expect(freeStateOption?.actionUrl).toContain('caringinfo.org');
  });

  it('2. Generates valid FHIR R4 Consent resource payload', () => {
    const consent = service.generateFhirConsentPayload('Homo Sapiens Test Patient');
    expect(consent.resourceType).toBe('Consent');
    expect(consent.status).toBe('active');
    expect(consent.category[0].coding[0].code).toBe('42348-3');
    expect(consent.patient.display).toBe('Homo Sapiens Test Patient');
  });

  it('3. Saves Patient Values Profile with cryptographic SHA-256 seal and HPOA attestation', () => {
    const seal = service.savePatientValuesProfile({
      cardiopulmonaryResuscitation: 'DNR_DO_NOT_RESUSCITATE',
      mechanicalVentilation: 'INTUBATION_PROHIBITED',
      artificialNutritionHydration: 'COMFORT_HYDRATION_ONLY',
      palliativeSedationForIntractablePain: true,
      organDonationPreference: 'RESEARCH_ONLY',
      sacredEnvironmentWishes: 'Peaceful natural morning sunlight and family bedside presence',
      designatedHealthcareProxy: {
        name: 'Sarah Connor',
        relationship: 'Daughter / Designated HPOA',
        phoneMasked: '(555) •••-4921'
      }
    }, 'Jane Connor (Female, 76y)');

    expect(seal.consentId).toContain('consent_adv_dir_');
    expect(seal.sha256Digest).toContain('sha256:adr:');
    expect(seal.proxyAttestationSeal).toContain('hpoa_sig_');
    expect(seal.fhirConsentResource.policyRule.text).toContain('DNR_DO_NOT_RESUSCITATE');
    expect(seal.offlineEmergencyQrDataUri).toContain('data:text/plain;charset=utf-8,');
    expect(service.activeDirectiveSeal()).toEqual(seal);
  });
});
