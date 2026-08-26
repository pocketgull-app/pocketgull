import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { SmartHealthCardService } from './smart-health-card.service';
import { PatientStateService } from './patient-state.service';

describe('SmartHealthCardService', () => {
  let service: SmartHealthCardService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        SmartHealthCardService,
        {
          provide: PatientStateService,
          useValue: {
            isPlainLanguageMode: () => false
          }
        }
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(SmartHealthCardService));
  });

  it('should generate a valid SMART Health Card verifiable credential payload', () => {
    const payload = service.generateSmartHealthCardPayload();
    expect(payload.iss).toContain('pocketgull');
    expect(payload.vc.type).toContain('https://smarthealth.cards#health-card');
    expect(payload.vc.credentialSubject.fhirBundle.resourceType).toBe('Bundle');
    expect(payload.vc.credentialSubject.fhirBundle.entry.length).toBeGreaterThan(0);
  });

  it('should format a valid numeric SMART Health Card QR string (shc:/...)', () => {
    const shcString = service.generateShcQrString();
    expect(shcString.startsWith('shc:/')).toBe(true);
    expect(shcString.length).toBeGreaterThan(10);
  });

  it('should format Apple Wallet pass JSON payload with required fields', () => {
    const pass = service.generateAppleWalletPass();
    expect(pass.formatVersion).toBe(1);
    expect(pass.passTypeIdentifier).toBe('pass.com.pocketgull.healthcard');
    expect(pass.generic.primaryFields.length).toBeGreaterThan(0);
    expect(pass.barcodes[0].format).toBe('PKBarcodeFormatQR');
    expect(pass.barcodes[0].message.startsWith('shc:/')).toBe(true);
  });

  it('should generate an Edwin Smith Codex HTML report with HIPAA Safe Harbor disclaimer', () => {
    const html = service.generateEdwinSmithCodexHtml();
    expect(html).toContain('Edwin Smith Codex');
    expect(html).toContain('HIPAA §164.514 SAFE HARBOR');
    expect(html).toContain('Medial Meniscus Radial Tear');
  });
});
