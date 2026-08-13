import '@angular/compiler';
import { describe, it, beforeEach, expect } from 'vitest';
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
});
