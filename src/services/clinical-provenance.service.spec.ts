import { TestBed } from '@angular/core/testing';
import { ClinicalProvenanceService } from './clinical-provenance.service';

describe('ClinicalProvenanceService', () => {
  let service: ClinicalProvenanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClinicalProvenanceService]
    });
    service = TestBed.inject(ClinicalProvenanceService);
  });

  it('1. should create service and generate a valid SHA-256 seal', async () => {
    const receipt = await service.generateCryptographicReceipt({
      displayedText: 'CEFAZOLIN 2 g IV',
      snomedCodes: ['74281007'],
      clinicianId: 'MD-101'
    });

    expect(receipt).toBeTruthy();
    expect(receipt.receiptId).toContain('RX-SEAL-');
    expect(receipt.sha256Seal).toMatch(/^[a-f0-9]{64}$/);
    expect(receipt.ismpCompliance.passed).toBe(true);
    expect(receipt.thermalPrintCertified203Dpi).toBe(true);
  });

  it('2. should flag ISMP violation on trailing zero (e.g. 2.0 mg)', async () => {
    const receipt = await service.generateCryptographicReceipt({
      displayedText: 'CEFAZOLIN 2.0 g IV', // TRAILING ZERO VIOLATION
      snomedCodes: ['74281007'],
      clinicianId: 'MD-101'
    });

    expect(receipt.ismpCompliance.passed).toBe(false);
    expect(receipt.ismpCompliance.hasTrailingZero).toBe(true);
  });

  it('3. should verify cryptographic integrity and reject tampered receipts', async () => {
    const receipt = await service.generateCryptographicReceipt({
      displayedText: 'CEFAZOLIN 2 g IV',
      snomedCodes: ['74281007'],
      clinicianId: 'MD-101'
    });

    const isValid = await service.verifyReceiptIntegrity(receipt);
    expect(isValid).toBe(true);

    // Tamper with receipt
    const tampered = { ...receipt, displayedText: 'CEFAZOLIN 20 g IV' };
    const isTamperedValid = await service.verifyReceiptIntegrity(tampered);
    expect(isTamperedValid).toBe(false);
  });

  it('4. should enforce BiDi directional isolate check on RTL text', async () => {
    // Unprotected number in RTL text
    const unprotectedRtl = await service.generateCryptographicReceipt({
      displayedText: 'ضغط الدم 120/80 بدون عازل',
      snomedCodes: ['75367002'],
      clinicianId: 'MD-101',
      isRtl: true
    });
    expect(unprotectedRtl.bidiIsolated).toBe(false);

    // Protected with <bdi>
    const protectedRtl = await service.generateCryptographicReceipt({
      displayedText: 'ضغط الدم <bdi dir="ltr">120/80</bdi> محمي',
      snomedCodes: ['75367002'],
      clinicianId: 'MD-101',
      isRtl: true
    });
    expect(protectedRtl.bidiIsolated).toBe(true);
  });
});
