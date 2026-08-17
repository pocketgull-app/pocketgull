import fs from 'fs';
import path from 'path';

describe('Mobile App Store & Google Play Store Listings Compliance', () => {
  const metadataPath = path.resolve(__dirname, '../docs/app-store-listings/APP_STORE_METADATA.json');
  let metadata: any;

  beforeAll(() => {
    const raw = fs.readFileSync(metadataPath, 'utf-8');
    metadata = JSON.parse(raw);
  });

  describe('Provider App (PocketGull Clinical CDS)', () => {
    it('should adhere to Apple App Store strict metadata character constraints', () => {
      const provider = metadata.apps.provider;
      expect(provider.name.length).toBeLessThanOrEqual(30);
      expect(provider.subtitle.length).toBeLessThanOrEqual(30);
      expect(provider.keywords.length).toBeLessThanOrEqual(100);
      expect(provider.promotionalText.length).toBeLessThanOrEqual(170);
    });

    it('should declare valid category and legal URLs', () => {
      const provider = metadata.apps.provider;
      expect(provider.primaryCategory).toBe('MEDICAL');
      expect(provider.privacyPolicyUrl).toContain('pocketgull.app/privacy-policy.html');
      expect(provider.termsOfServiceUrl).toContain('pocketgull.app/terms-of-service.html');
    });

    it('should declare valid subscription tiers', () => {
      const provider = metadata.apps.provider;
      expect(provider.inAppPurchases.length).toBe(2);
      expect(provider.inAppPurchases[0].priceTier).toBe(199.00);
      expect(provider.inAppPurchases[1].priceTier).toBe(1990.00);
    });
  });

  describe('Patient App (PocketGull Health: My Digital Twin)', () => {
    it('should adhere to Apple App Store strict metadata character constraints', () => {
      const patient = metadata.apps.patient;
      expect(patient.name.length).toBeLessThanOrEqual(30);
      expect(patient.subtitle.length).toBeLessThanOrEqual(30);
      expect(patient.keywords.length).toBeLessThanOrEqual(100);
      expect(patient.promotionalText.length).toBeLessThanOrEqual(170);
    });

    it('should declare valid category and legal URLs', () => {
      const patient = metadata.apps.patient;
      expect(patient.primaryCategory).toBe('HEALTH_AND_FITNESS');
      expect(patient.privacyPolicyUrl).toContain('pocketgull.app/privacy-policy.html');
      expect(patient.termsOfServiceUrl).toContain('pocketgull.app/terms-of-service.html');
    });

    it('should declare valid subscription tiers', () => {
      const patient = metadata.apps.patient;
      expect(patient.inAppPurchases.length).toBe(2);
      expect(patient.inAppPurchases[0].priceTier).toBe(9.99);
      expect(patient.inAppPurchases[1].priceTier).toBe(79.99);
    });
  });
});
