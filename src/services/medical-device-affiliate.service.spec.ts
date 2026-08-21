import '@angular/compiler';
import { expect, describe, it, beforeEach } from 'vitest';
import { MedicalDeviceAffiliateService, DIRECT_MEDICAL_DEVICE_CATALOG } from './medical-device-affiliate.service';

describe('MedicalDeviceAffiliateService Unit Suite', () => {
  let service: MedicalDeviceAffiliateService;

  beforeEach(() => {
    service = new MedicalDeviceAffiliateService();
  });

  it('1. Initializes with direct OEM medical device catalog and verifies FDA clearance', () => {
    expect(service.availableDevices().length).toBeGreaterThan(0);
    expect(service.directPartnerCount()).toBe(DIRECT_MEDICAL_DEVICE_CATALOG.length);
    
    // Verify all devices have FDA 510(k) and SNOMED codes
    service.availableDevices().forEach(device => {
      expect(device.fdaStatus).toContain('FDA');
      expect(device.snomedCode).toContain('SCTID');
      expect(device.hsaFsaEligible).toBe(true);
    });
  });

  it('2. Computes revenue multiplier comparing Direct OEM (15-40%) vs Amazon Associates (1%)', () => {
    const comparison = service.computeRevenueComparison(100);
    expect(comparison.directOemRevenueMonthly).toBeGreaterThan(comparison.amazonAssociatesRevenueMonthly);
    expect(comparison.deltaMultiplier).toBeGreaterThanOrEqual(15.0); // Minimum 15x yield advantage
    expect(comparison.summary).toContain('Direct OEM partnerships yield');
  });

  it('3. Filters devices accurately by clinical category', () => {
    const ecgDevices = service.getDevicesByCategory('ECG');
    expect(ecgDevices.length).toBeGreaterThanOrEqual(2);
    expect(ecgDevices.some(d => d.brand === 'Omron Healthcare')).toBe(true);
    expect(ecgDevices.some(d => d.brand === 'AliveCor Kardia')).toBe(true);
  });

  it('4. Enforces strict zero-PHI egress link validation', () => {
    const safeUrl = 'https://omronhealthcare.com/products/complete?ref=pocketgull_clinical';
    const unsafeUrl = 'https://omronhealthcare.com/products/complete?patient_id=12345&diagnosis=hypertension';

    expect(service.isLinkSafeAndCompliant(safeUrl)).toBe(true);
    expect(service.isLinkSafeAndCompliant(unsafeUrl)).toBe(false);
    expect(service.isLinkSafeAndCompliant('http://unencrypted.com')).toBe(false);
  });
});
