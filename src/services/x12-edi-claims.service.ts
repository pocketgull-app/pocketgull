import { Injectable, inject, signal, computed } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { MedicareBillingBestPracticesService, IRpmBillingCode } from './medicare-billing-best-practices.service';

export interface IX12ServiceLine {
  lineNumber: number;
  cptCode: string; // e.g. '99453', '99454', '99457', '99458'
  description: string;
  chargeAmountUsd: number;
  units: number;
  serviceDate: string; // YYYYMMDD
  diagnosisCodePointer: number; // 1, 2, etc.
}

export interface IX12ClaimRequest {
  claimId: string;
  patientId: string;
  patientLastName: string;
  patientFirstName: string;
  patientDob: string; // YYYYMMDD
  patientGender: 'M' | 'F' | 'U';
  billingProviderNpi: string;
  billingProviderTaxId: string;
  billingProviderName: string;
  renderingProviderNpi: string;
  clearinghousePayerId: string; // e.g. 'CMS01', 'AVAILITY01'
  payerName: string;
  principalDiagnosisIcd10: string; // e.g. 'M54.5' (low back pain), 'I10' (hypertension)
  secondaryDiagnosisIcd10?: string;
  serviceLines: IX12ServiceLine[];
}

export interface IX12ValidationResult {
  isValid: boolean;
  snipLevel: 'SNIP_1_INTEGRITY' | 'SNIP_2_REQUIREMENT';
  segmentCount: number;
  errors: string[];
  warnings: string[];
}

export interface IX12ClaimResult {
  claimId: string;
  ediContent: string;
  totalChargeUsd: number;
  serviceLinesCount: number;
  validation: IX12ValidationResult;
  timestamp: string;
}

export interface IX12RemittanceResult {
  remittanceTraceNumber: string;
  claimId: string;
  edi835Content: string;
  totalBilledUsd: number;
  totalPaidUsd: number;
  contractualAdjustmentUsd: number;
  patientResponsibilityUsd: number;
  paymentStatus: 'PAID_IN_FULL' | 'PROCESSED_WITH_ADJUSTMENTS' | 'DENIED';
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class X12EdiClaimsService {
  private patientState = inject(PatientStateService, { optional: true });
  private medicareBilling = inject(MedicareBillingBestPracticesService, { optional: true });

  readonly recentClaims = signal<IX12ClaimResult[]>([]);
  readonly recentRemittances = signal<IX12RemittanceResult[]>([]);

  readonly totalBilledSum = computed(() => {
    return this.recentClaims().reduce((sum, c) => sum + c.totalChargeUsd, 0);
  });

  /**
   * Generates an ANSI X12 837P Professional Claim EDI string for CMS RPM/RTM reimbursement.
   */
  generate837PClaim(req: IX12ClaimRequest): IX12ClaimResult {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 5).replace(/:/g, '');
    const controlNum = req.claimId.replace(/[^0-9]/g, '').slice(-9).padStart(9, '0') || '000000001';

    const segments: string[] = [];

    // 1. Interchange Control Header (ISA) - exactly 106 chars
    const senderId = 'POCKETGULL'.padEnd(15, ' ');
    const receiverId = (req.clearinghousePayerId || 'AVAILITY').padEnd(15, ' ');
    segments.push(`ISA*00*          *00*          *ZZ*${senderId}*ZZ*${receiverId}*${dateStr.slice(2)}*${timeStr}*^*00501*${controlNum}*0*P*:~`);

    // 2. Functional Group Header (GS)
    segments.push(`GS*HC*POCKETGULL*${req.clearinghousePayerId || 'AVAILITY'}*${dateStr}*${timeStr}*${controlNum}*X*005010X222A1~`);

    // 3. Transaction Set Header (ST)
    segments.push(`ST*837*${controlNum}*005010X222A1~`);

    // 4. Beginning of Hierarchical Transaction (BHT)
    segments.push(`BHT*0019*00*${controlNum}*${dateStr}*${timeStr}*CH~`);

    // 5. Loop 1000A: Submitter Name
    segments.push(`NM1*41*2*POCKETGULL HEALTH TECHNOLOGIES*****46*943328192~`);
    segments.push(`PER*IC*EDI SUBMISSIONS*TE*8005550199*EM*billing@pocketgull.app~`);

    // 6. Loop 1000B: Receiver Name
    segments.push(`NM1*40*2*${req.payerName.toUpperCase() || 'CENTERS FOR MEDICARE AND MEDICAID'}*****46*${req.clearinghousePayerId || 'CMS01'}~`);

    // 7. Loop 2000A: Billing Provider Hierarchical Level
    segments.push(`HL*1**20*1~`);
    segments.push(`PRV*BI*PXC*207Q00000X~`); // Family Medicine / Clinical Strategy
    segments.push(`NM1*85*2*${req.billingProviderName.toUpperCase()}*****XX*${req.billingProviderNpi}~`);
    segments.push(`N3*100 INNOVATION WAY*SUITE 400~`);
    segments.push(`N4*SEATTLE*WA*981010000~`);
    segments.push(`REF*EI*${req.billingProviderTaxId}~`);

    // 8. Loop 2000B: Subscriber (Patient) Hierarchical Level
    segments.push(`HL*2*1*22*0~`);
    segments.push(`SBR*P*18*******MC~`); // P = Primary, 18 = Self, MC = Medicare
    segments.push(`NM1*IL*1*${req.patientLastName.toUpperCase()}*${req.patientFirstName.toUpperCase()}****MI*${req.patientId}~`);
    segments.push(`DMG*D8*${req.patientDob}*${req.patientGender}~`);
    segments.push(`N3*742 EVERGREEN TERRACE~`);
    segments.push(`N4*SEATTLE*WA*981010000~`);

    // 9. Loop 2300: Claim Information
    const totalCharge = req.serviceLines.reduce((sum, line) => sum + (line.chargeAmountUsd * line.units), 0);
    segments.push(`CLM*${req.claimId}*${totalCharge.toFixed(2)}***11:B:1*Y*A*Y*Y~`); // 11 = Office / Telehealth

    // Diagnosis Codes (HI)
    const cleanDiag1 = req.principalDiagnosisIcd10.replace('.', '');
    let diagSegment = `HI*ABK:${cleanDiag1}`;
    if (req.secondaryDiagnosisIcd10) {
      const cleanDiag2 = req.secondaryDiagnosisIcd10.replace('.', '');
      diagSegment += `*ABF:${cleanDiag2}`;
    }
    segments.push(`${diagSegment}~`);

    // Rendering Provider (Loop 2310B)
    segments.push(`NM1*82*1*${req.billingProviderName.toUpperCase()}*****XX*${req.renderingProviderNpi}~`);

    // 10. Loop 2400: Service Lines
    req.serviceLines.forEach((line, idx) => {
      segments.push(`LX*${idx + 1}~`);
      segments.push(`SV1*HC:${line.cptCode}*${line.chargeAmountUsd.toFixed(2)}*UN*${line.units}***${line.diagnosisCodePointer || 1}~`);
      segments.push(`DTP*472*D8*${line.serviceDate || dateStr}~`);
    });

    // 11. Transaction Set Trailer (SE)
    // Counts all segments between ST and SE inclusive
    const transactionSegmentCount = segments.length - 2 + 1; // ST is index 2, + 1 for SE
    segments.push(`SE*${transactionSegmentCount}*${controlNum}~`);

    // 12. Functional Group Trailer (GE)
    segments.push(`GE*1*${controlNum}~`);

    // 13. Interchange Control Trailer (IEA)
    segments.push(`IEA*1*${controlNum}~`);

    const ediContent = segments.join('\n');
    const validation = this.validateX12Content(ediContent);

    const result: IX12ClaimResult = {
      claimId: req.claimId,
      ediContent,
      totalChargeUsd: totalCharge,
      serviceLinesCount: req.serviceLines.length,
      validation,
      timestamp: now.toISOString()
    };

    this.recentClaims.update(claims => [result, ...claims]);
    return result;
  }

  /**
   * Generates a simulated ANSI X12 835 Remittance Advice (ERA) corresponding to a submitted claim.
   */
  generate835Remittance(req: { claimId: string; totalBilledUsd: number; payerName?: string }): IX12RemittanceResult {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const traceNum = `TRN_${Date.now()}`;
    const totalBilled = req.totalBilledUsd;

    // Medicare standard 80/20 allowable formula
    const contractualAdjustment = +(totalBilled * 0.15).toFixed(2); // 15% Medicare fee schedule discount
    const allowedAmount = +(totalBilled - contractualAdjustment).toFixed(2);
    const paidByMedicare = +(allowedAmount * 0.80).toFixed(2); // 80% Medicare paid
    const patientResponsibility = +(allowedAmount * 0.20).toFixed(2); // 20% Part B copay

    const segments: string[] = [
      `ISA*00*          *00*          *ZZ*MEDICAREPAYER  *ZZ*POCKETGULL     *${dateStr.slice(2)}*1200*^*00501*000000001*0*P*:~`,
      `GS*HP*MEDICAREPAYER*POCKETGULL*${dateStr}*1200*1*X*005010X221A1~`,
      `ST*835*000000001*005010X221A1~`,
      `BPR*I*${paidByMedicare.toFixed(2)}*C*ACH*CCP*01*999999999*DA*123456789*1999999999**01*999999999*DA*987654321*${dateStr}~`,
      `TRN*1*${traceNum}*1999999999~`,
      `N1*PR*${req.payerName?.toUpperCase() || 'CENTERS FOR MEDICARE AND MEDICAID SERVICES'}~`,
      `N1*PE*POCKETGULL HEALTH TECHNOLOGIES*XX*1982736450~`,
      `CLP*${req.claimId}*1*${totalBilled.toFixed(2)}*${paidByMedicare.toFixed(2)}*${patientResponsibility.toFixed(2)}*MC*CLMCTRL99201~`,
      `CAS*CO*45*${contractualAdjustment.toFixed(2)}~`, // CO-45: Contractual Obligation Fee Schedule Adjustment
      `CAS*PR*2*${patientResponsibility.toFixed(2)}~`, // PR-2: Patient Coinsurance / Copayment
      `SE*11*000000001~`,
      `GE*1*1~`,
      `IEA*1*000000001~`
    ];

    const edi835Content = segments.join('\n');

    const result: IX12RemittanceResult = {
      remittanceTraceNumber: traceNum,
      claimId: req.claimId,
      edi835Content,
      totalBilledUsd: totalBilled,
      totalPaidUsd: paidByMedicare,
      contractualAdjustmentUsd: contractualAdjustment,
      patientResponsibilityUsd: patientResponsibility,
      paymentStatus: 'PROCESSED_WITH_ADJUSTMENTS',
      timestamp: now.toISOString()
    };

    this.recentRemittances.update(remittances => [result, ...remittances]);
    return result;
  }

  /**
   * Validates an ANSI X12 EDI payload against WEDI SNIP Levels 1 and 2 rules.
   */
  validateX12Content(ediContent: string): IX12ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const lines = ediContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length === 0) {
      return {
        isValid: false,
        snipLevel: 'SNIP_1_INTEGRITY',
        segmentCount: 0,
        errors: ['EDI content is empty'],
        warnings: []
      };
    }

    // 1. Check ISA Segment
    const isaLine = lines[0];
    if (!isaLine.startsWith('ISA*')) {
      errors.push('SNIP-1: Missing mandatory ISA interchange control header as first segment');
    }

    // 2. Check GS Segment
    const gsLine = lines.find(l => l.startsWith('GS*'));
    if (!gsLine) {
      errors.push('SNIP-1: Missing mandatory GS functional group header');
    }

    // 3. Check ST and SE Pair
    const stLine = lines.find(l => l.startsWith('ST*'));
    const seLine = lines.find(l => l.startsWith('SE*'));
    if (!stLine || !seLine) {
      errors.push('SNIP-1: Missing matching ST/SE transaction set delimiters');
    } else {
      const stControl = stLine.split('*')[2]?.replace('~', '');
      const seControl = seLine.split('*')[2]?.replace('~', '');
      if (stControl !== seControl) {
        errors.push(`SNIP-2: Mismatched ST02 (${stControl}) and SE02 (${seControl}) transaction set control numbers`);
      }
    }

    // 4. Check IEA Segment
    const ieaLine = lines[lines.length - 1];
    if (!ieaLine.startsWith('IEA*')) {
      errors.push('SNIP-1: Missing mandatory IEA interchange trailer as final segment');
    }

    // 5. Check Service Lines (SV1)
    const sv1Lines = lines.filter(l => l.startsWith('SV1*'));
    if (sv1Lines.length === 0 && ediContent.includes('ST*837')) {
      errors.push('SNIP-2: 837P Professional Claim must contain at least one SV1 service line');
    }

    return {
      isValid: errors.length === 0,
      snipLevel: errors.length === 0 ? 'SNIP_2_REQUIREMENT' : 'SNIP_1_INTEGRITY',
      segmentCount: lines.length,
      errors,
      warnings
    };
  }

  /**
   * Pre-populates an RPM/RTM claim bundle from the active patient state and Medicare compliance engine.
   */
  createDefaultRpmClaim(): IX12ClaimRequest {
    const currentState = this.patientState?.getCurrentState();
    const vitals = this.patientState?.vitals();
    const patientName = currentState?.name || 'Jane Doe';
    const nameParts = patientName.split(' ');
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Doe';
    const firstName = nameParts[0] || 'Jane';

    // Standard monthly RPM CPT Bundle: 99453 ($19), 99454 ($50), 99457 ($48), 99458 ($39)
    const nowStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const serviceLines: IX12ServiceLine[] = [
      {
        lineNumber: 1,
        cptCode: '99453',
        description: 'RPM Initial Device Setup & Patient Education',
        chargeAmountUsd: 19.00,
        units: 1,
        serviceDate: nowStr,
        diagnosisCodePointer: 1
      },
      {
        lineNumber: 2,
        cptCode: '99454',
        description: 'RPM Monthly Device Transmission (16+ Days Data)',
        chargeAmountUsd: 50.00,
        units: 1,
        serviceDate: nowStr,
        diagnosisCodePointer: 1
      },
      {
        lineNumber: 3,
        cptCode: '99457',
        description: 'RPM Clinical Staff Management (First 20 Minutes)',
        chargeAmountUsd: 48.00,
        units: 1,
        serviceDate: nowStr,
        diagnosisCodePointer: 1
      },
      {
        lineNumber: 4,
        cptCode: '99458',
        description: 'RPM Clinical Staff Management (Additional 20 Minutes)',
        chargeAmountUsd: 39.00,
        units: 1,
        serviceDate: nowStr,
        diagnosisCodePointer: 1
      }
    ];

    const entropyBytes = new Uint8Array(3);
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
      globalThis.crypto.getRandomValues(entropyBytes);
    }
    const entropy = Array.from(entropyBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    return {
      claimId: `CLM${Date.now().toString().slice(-6)}${entropy}`,
      patientId: currentState?.patientId || 'PG-PAT-001',
      patientLastName: lastName,
      patientFirstName: firstName,
      patientDob: '19620412',
      patientGender: 'F',
      billingProviderNpi: '1982736450',
      billingProviderTaxId: '943328192',
      billingProviderName: 'PocketGull Clinical Group',
      renderingProviderNpi: '1475869302',
      clearinghousePayerId: 'CMS01',
      payerName: 'Centers for Medicare and Medicaid Services',
      principalDiagnosisIcd10: 'I10', // Essential (primary) hypertension
      secondaryDiagnosisIcd10: 'M54.5', // Low back pain
      serviceLines
    };
  }
}
