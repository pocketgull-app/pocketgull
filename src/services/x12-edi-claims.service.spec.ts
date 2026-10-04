import { TestBed } from '@angular/core/testing';
import { X12EdiClaimsService, IX12ClaimRequest } from './x12-edi-claims.service';
import { PatientStateService } from './patient-state.service';
import { MedicareBillingBestPracticesService } from './medicare-billing-best-practices.service';

describe('X12EdiClaimsService', () => {
  let service: X12EdiClaimsService;
  let patientState: PatientStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        X12EdiClaimsService,
        PatientStateService,
        MedicareBillingBestPracticesService
      ]
    });
    service = TestBed.inject(X12EdiClaimsService);
    patientState = TestBed.inject(PatientStateService);
  });

  it('1. Initializes with empty claims history and zero billed sum', () => {
    expect(service).toBeTruthy();
    expect(service.recentClaims().length).toBe(0);
    expect(service.recentRemittances().length).toBe(0);
    expect(service.totalBilledSum()).toBe(0);
  });

  it('2. Generates ANSI X12 837P Professional Claim for CMS RPM CPT Codes (99453, 99454, 99457, 99458)', () => {
    const defaultReq = service.createDefaultRpmClaim();
    const result = service.generate837PClaim(defaultReq);

    expect(result.claimId).toBe(defaultReq.claimId);
    expect(result.totalChargeUsd).toBe(156.00); // 19 + 50 + 48 + 39
    expect(result.serviceLinesCount).toBe(4);
    expect(result.validation.isValid).toBe(true);

    const edi = result.ediContent;
    expect(edi).toContain('ISA*00*');
    expect(edi).toContain('GS*HC*POCKETGULL*');
    expect(edi).toContain('ST*837*');
    expect(edi).toContain('BHT*0019*00*');
    expect(edi).toContain('NM1*85*2*POCKETGULL CLINICAL GROUP');
    expect(edi).toContain('CLM*' + defaultReq.claimId + '*156.00');
    expect(edi).toContain('HI*ABK:I10*ABF:M545~');
    expect(edi).toContain('SV1*HC:99453*19.00*UN*1');
    expect(edi).toContain('SV1*HC:99454*50.00*UN*1');
    expect(edi).toContain('SV1*HC:99457*48.00*UN*1');
    expect(edi).toContain('SV1*HC:99458*39.00*UN*1');
    expect(edi).toContain('SE*');
    expect(edi).toContain('GE*1*');
    expect(edi).toContain('IEA*1*');
  });

  it('3. Generates simulated ANSI X12 835 Electronic Remittance Advice (ERA) with 80/20 Medicare adjudication', () => {
    const remittance = service.generate835Remittance({
      claimId: 'CLM123456',
      totalBilledUsd: 156.00,
      payerName: 'Centers for Medicare and Medicaid Services'
    });

    expect(remittance.claimId).toBe('CLM123456');
    expect(remittance.totalBilledUsd).toBe(156.00);
    // Contractual adjustment: 15% of $156 = $23.40. Allowed = $132.60
    // Paid 80% = $106.08, Patient responsibility 20% = $26.52
    expect(remittance.contractualAdjustmentUsd).toBe(23.40);
    expect(remittance.totalPaidUsd).toBe(106.08);
    expect(remittance.patientResponsibilityUsd).toBe(26.52);

    const edi835 = remittance.edi835Content;
    expect(edi835).toContain('ST*835*');
    expect(edi835).toContain('BPR*I*106.08*');
    expect(edi835).toContain('CLP*CLM123456*1*156.00*106.08*26.52');
    expect(edi835).toContain('CAS*CO*45*23.40~');
    expect(edi835).toContain('CAS*PR*2*26.52~');
  });

  it('4. Validates WEDI SNIP Levels 1 & 2 structural requirements', () => {
    // Missing ISA
    const invalidEdi = 'GS*HC*TEST~ST*837*001~SE*2*001~GE*1*001~IEA*1*001~';
    const validation1 = service.validateX12Content(invalidEdi);
    expect(validation1.isValid).toBe(false);
    expect(validation1.errors).toContain('SNIP-1: Missing mandatory ISA interchange control header as first segment');

    // Mismatched ST / SE control numbers
    const mismatchedEdi = 'ISA*00*...~\nGS*HC*...~\nST*837*000000001~\nSV1*HC:99453*19.00*UN*1***1~\nSE*3*000000002~\nGE*1*001~\nIEA*1*001~';
    const validation2 = service.validateX12Content(mismatchedEdi);
    expect(validation2.isValid).toBe(false);
    expect(validation2.errors.some(e => e.includes('SNIP-2: Mismatched ST02'))).toBe(true);
  });

  it('5. Computes total billed sum reactively as claims are generated', () => {
    expect(service.totalBilledSum()).toBe(0);

    const claim1 = service.createDefaultRpmClaim();
    service.generate837PClaim(claim1);
    expect(service.totalBilledSum()).toBe(156.00);

    const claim2 = service.createDefaultRpmClaim();
    service.generate837PClaim(claim2);
    expect(service.totalBilledSum()).toBe(312.00);
  });
});
