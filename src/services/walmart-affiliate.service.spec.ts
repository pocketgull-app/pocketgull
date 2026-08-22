import '@angular/compiler';
import { WalmartAffiliateService, CLINICAL_CURATED_WALMART_CATALOG } from './walmart-affiliate.service';

describe('WalmartAffiliateService Unit Suite', () => {
  let service: WalmartAffiliateService;

  beforeEach(() => {
    service = new WalmartAffiliateService();
  });

  it('1. Initializes with curated clinical Walmart catalog', () => {
    expect(service.availableItems().length).toBe(CLINICAL_CURATED_WALMART_CATALOG.length);
    expect(service.affiliateTag()).toBe('pocketgull');

    service.availableItems().forEach(item => {
      expect(item.detailPageUrl).toContain('walmart.com');
      expect(item.price.amount).toBeGreaterThan(0);
      expect(item.hsaFsaEligible).toBe(true);
    });
  });

  it('2. Finds Walmart equivalent item by clinical category', () => {
    const item = service.findEquivalentItem('medical_device');
    expect(item).toBeDefined();
    expect(item?.title).toContain('Omron');
    expect(item?.snomedCode).toContain('SCTID');
  });

  it('3. Enforces zero-PHI link security validation', () => {
    const safeUrl = 'https://www.walmart.com/ip/Omron-7-Series/544321098?wmlspartner=pocketgull';
    const unsafeUrl = 'https://www.walmart.com/ip/Omron-7-Series/544321098?patient_id=9876&mrn=123';

    expect(service.isLinkSafe(safeUrl)).toBe(true);
    expect(service.isLinkSafe(unsafeUrl)).toBe(false);
    expect(service.isLinkSafe('http://unencrypted.com')).toBe(false);
  });
});
