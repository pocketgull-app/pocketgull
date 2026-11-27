// SPDX-License-Identifier: Apache-2.0
import { Injectable, inject } from '@angular/core';
import { StateRegionalCrosswalkService } from './state-regional-crosswalk.service';
import { computeFipsSha256Bytes } from '../clinical-defense-guard.service';

export type ContinuityUrgencyLevel = 'ROUTINE' | 'ACTION_NEEDED' | 'URGENT_AID_PAID_PENDING' | 'REINSTATEMENT_90_DAY' | 'EXPIRED_REAPPLY';

export interface IMedicaidContinuityInput {
  stateCode: string;
  beneficiaryName?: string;
  medicaidCaseId?: string;
  renewalDueDateIso?: string;
  terminationNoticeDateIso?: string;
  effectiveTerminationDateIso?: string;
  referenceDateIso?: string;
  addressChangedRecently?: boolean;
  hasStatePortalAccess?: boolean;
  isDualEligibleQmb?: boolean;
  isDsnpEnrolled?: boolean;
  providerBilledAmountUsd?: number;
  providerBillingEntity?: string;
}

export interface IQmbBalanceBillingShield {
  isProtectedQmb: boolean;
  unlawfulBalanceDetected: boolean;
  unlawfulBalanceAmountUsd: number;
  statutoryCitations: string[];
  ceaseBillingDemandLetter: string;
}

export interface IMedicaidContinuityPackage {
  stateCode: string;
  stateName: string;
  administeringAgency: string;
  cmsRegionName: string;
  urgencyLevel: ContinuityUrgencyLevel;
  daysUntilRenewalOrTermination: number | null;
  aidPaidPendingEligible: boolean;
  aidPaidPendingDeadlineIso: string | null;
  reinstatement90DayEligible: boolean;
  reinstatement90DayDeadlineIso: string | null;
  exParteCheckRequired: boolean;
  churnRiskScore: number; // 0..100
  teaspoonChecklist: string[]; // Plain-language 6th-grade steps (<= 4 focal items)
  statutoryCitations: string[];
  fairHearingOrReinstatementNotice: string;
  qmbShield: IQmbBalanceBillingShield;
  sha256IntegrityDigest: string;
  generatedAtIso: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedicaidContinuityGuardService {
  private readonly crosswalk = inject(StateRegionalCrosswalkService, { optional: true });

  /**
   * Evaluates Medicaid redetermination churn risk, Aid Paid Pending (42 C.F.R. § 431.230),
   * 90-day procedural reconsideration/reinstatement (42 C.F.R. § 435.916(a)(3)(iii)),
   * and Federal QMB Illegal Balance-Billing Shield (42 U.S.C. § 1396a(n)(3)(B)).
   */
  public evaluateContinuityAndQmbShield(input: IMedicaidContinuityInput): IMedicaidContinuityPackage {
    const rawState = (input.stateCode || 'TX').trim().toUpperCase();
    const stateCode = rawState.length === 2 ? rawState : resolveTwoLetterCode(rawState);
    const entry = this.crosswalk?.getStateEntry(stateCode);

    const stateName = entry?.stateName || stateCode;
    const administeringAgency = entry?.administeringAgency || `${stateName} State Medicaid Agency`;
    const cmsRegionName = entry?.cmsRegionName || 'CMS Federal Oversight Region';
    const beneficiaryName = (input.beneficiaryName || 'Medicaid / Dual-Eligible Beneficiary').trim();
    const caseId = (input.medicaidCaseId || 'CASE-PENDING').trim();

    const refDate = parseIsoDateOrToday(input.referenceDateIso);
    const renewalDate = parseOptionalIsoDate(input.renewalDueDateIso);
    const terminationEffectiveDate = parseOptionalIsoDate(input.effectiveTerminationDateIso);

    let urgencyLevel: ContinuityUrgencyLevel = 'ROUTINE';
    let daysUntil: number | null = null;
    let aidPaidPendingEligible = false;
    let aidPaidPendingDeadlineIso: string | null = null;
    let reinstatement90DayEligible = false;
    let reinstatement90DayDeadlineIso: string | null = null;

    if (terminationEffectiveDate) {
      daysUntil = diffCalendarDays(refDate, terminationEffectiveDate);
      const dayBeforeTermination = addDays(terminationEffectiveDate, -1);
      aidPaidPendingDeadlineIso = formatIsoDate(dayBeforeTermination);
      const ninetyDayEnd = addDays(terminationEffectiveDate, 90);
      reinstatement90DayDeadlineIso = formatIsoDate(ninetyDayEnd);

      if (daysUntil >= 1) {
        urgencyLevel = 'URGENT_AID_PAID_PENDING';
        aidPaidPendingEligible = true;
      } else {
        const daysPastTermination = Math.abs(daysUntil);
        if (daysPastTermination <= 90) {
          urgencyLevel = 'REINSTATEMENT_90_DAY';
          reinstatement90DayEligible = true;
        } else {
          urgencyLevel = 'EXPIRED_REAPPLY';
        }
      }
    } else if (renewalDate) {
      daysUntil = diffCalendarDays(refDate, renewalDate);
      if (daysUntil <= 14) {
        urgencyLevel = 'URGENT_AID_PAID_PENDING';
      } else if (daysUntil <= 45) {
        urgencyLevel = 'ACTION_NEEDED';
      } else {
        urgencyLevel = 'ROUTINE';
      }
    }

    let churnRiskScore = 15;
    if (input.addressChangedRecently) churnRiskScore += 30;
    if (input.hasStatePortalAccess === false) churnRiskScore += 20;
    if (urgencyLevel === 'ACTION_NEEDED') churnRiskScore += 20;
    if (urgencyLevel === 'URGENT_AID_PAID_PENDING') churnRiskScore += 35;
    if (urgencyLevel === 'REINSTATEMENT_90_DAY' || urgencyLevel === 'EXPIRED_REAPPLY') churnRiskScore += 45;
    churnRiskScore = Math.min(100, churnRiskScore);

    const qmbShield = this.evaluateQmbBalanceBillingShield({
      isDualEligibleQmb: Boolean(input.isDualEligibleQmb),
      providerBilledAmountUsd: input.providerBilledAmountUsd ?? 0,
      providerBillingEntity: input.providerBillingEntity,
      beneficiaryName,
      stateName,
      administeringAgency
    });

    const statutoryCitations: string[] = [
      '42 C.F.R. § 435.916(a)(2) — Mandatory Ex Parte Electronic Auto-Renewal Before Sending Renewal Packet',
      '42 C.F.R. § 435.916(a)(3)(iii) — Mandatory 90-Day Procedural Reconsideration Window Without New Application',
      '42 C.F.R. § 431.211 & § 431.230 — 10-Day Advance Notice & Aid Paid Pending Continuation of Benefits',
      ...(input.isDsnpEnrolled
        ? ['42 C.F.R. § 422.107 — Dual Eligible Special Needs Plan (D-SNP) Integrated Care Coordination Mandate']
        : []),
      ...qmbShield.statutoryCitations
    ];

    const teaspoonChecklist = buildTeaspoonChecklist({
      urgencyLevel,
      administeringAgency,
      aidPaidPendingDeadlineIso,
      reinstatement90DayDeadlineIso,
      addressChangedRecently: Boolean(input.addressChangedRecently),
      unlawfulBalanceDetected: qmbShield.unlawfulBalanceDetected,
      unlawfulBalanceAmountUsd: qmbShield.unlawfulBalanceAmountUsd
    });

    const fairHearingOrReinstatementNotice = buildContinuityNotice({
      stateName,
      administeringAgency,
      beneficiaryName,
      caseId,
      urgencyLevel,
      aidPaidPendingEligible,
      aidPaidPendingDeadlineIso,
      reinstatement90DayEligible,
      reinstatement90DayDeadlineIso,
      renewalDueDateIso: input.renewalDueDateIso,
      isDsnpEnrolled: Boolean(input.isDsnpEnrolled)
    });

    const generatedAtIso = new Date().toISOString();
    const digestPayload = JSON.stringify({
      stateCode,
      caseId,
      urgencyLevel,
      aidPaidPendingDeadlineIso,
      reinstatement90DayDeadlineIso,
      unlawfulBalanceAmountUsd: qmbShield.unlawfulBalanceAmountUsd,
      generatedAtIso
    });
    const sha256IntegrityDigest = bytesToHex(computeFipsSha256Bytes(digestPayload));

    return {
      stateCode,
      stateName,
      administeringAgency,
      cmsRegionName,
      urgencyLevel,
      daysUntilRenewalOrTermination: daysUntil,
      aidPaidPendingEligible,
      aidPaidPendingDeadlineIso,
      reinstatement90DayEligible,
      reinstatement90DayDeadlineIso,
      exParteCheckRequired: true,
      churnRiskScore,
      teaspoonChecklist,
      statutoryCitations,
      fairHearingOrReinstatementNotice,
      qmbShield,
      sha256IntegrityDigest,
      generatedAtIso
    };
  }

  /**
   * Evaluates federal QMB Illegal Balance-Billing protections under
   * 42 U.S.C. § 1396a(n)(3)(B) and 42 U.S.C. § 1395w-4(g)(3)(A).
   */
  public evaluateQmbBalanceBillingShield(params: {
    isDualEligibleQmb: boolean;
    providerBilledAmountUsd: number;
    providerBillingEntity?: string;
    beneficiaryName: string;
    stateName: string;
    administeringAgency: string;
  }): IQmbBalanceBillingShield {
    const amount = Number.isFinite(params.providerBilledAmountUsd) ? Math.max(0, Number(params.providerBilledAmountUsd)) : 0;
    const unlawfulBalanceDetected = params.isDualEligibleQmb && amount > 0;
    const billingEntity = (params.providerBillingEntity || 'Medicare Provider Billing Office').trim();

    const statutoryCitations = params.isDualEligibleQmb
      ? [
          '42 U.S.C. § 1396a(n)(3)(B) — Federal Prohibition Against Billing QMB Enrollees for Medicare Cost-Sharing',
          '42 U.S.C. § 1395w-4(g)(3)(A) — Medicare Provider Sanctions for Improper QMB Balance Billing (Applies Even to Non-Medicaid Providers)',
          'CMS MLN Matters SE1128 — Mandatory Provider Recall of Improper QMB Bills & Refund of Collected Cost-Sharing'
        ]
      : [];

    const ceaseBillingDemandLetter = unlawfulBalanceDetected
      ? [
          `NOTICE OF FEDERAL QMB BALANCE-BILLING PROHIBITION & REFUND DEMAND`,
          `To: ${billingEntity}`,
          `Beneficiary: ${params.beneficiaryName} (${params.stateName} Qualified Medicare Beneficiary — QMB)`,
          `Improperly Billed Amount: $${amount.toFixed(2)}`,
          ``,
          `Under Federal Law (42 U.S.C. § 1396a(n)(3)(B) and 42 U.S.C. § 1395w-4(g)(3)(A); CMS MLN Matters SE1128),`,
          `all Original Medicare and Medicare Advantage providers—including providers who do NOT accept Medicaid—`,
          `are strictly prohibited from billing Qualified Medicare Beneficiary (QMB) enrollees for Medicare Part A`,
          `or Part B deductibles, coinsurance, or copayments.`,
          ``,
          `ACTION REQUESTED:`,
          `1. Immediately zero out the improperly billed balance of $${amount.toFixed(2)} and recall any collection referral.`,
          `2. Refund any Medicare cost-sharing already collected from this QMB beneficiary.`,
          `3. Submit remaining crossover cost-sharing claims solely to ${params.administeringAgency} per state rules.`,
          ``,
          `Note: Structured patient-advocacy notice generated for billing resolution; not formal legal representation.`
        ].join('\n')
      : params.isDualEligibleQmb
        ? `QMB Protection Active: No improper Medicare balance bill currently reported. Keep this federal protection handy (42 U.S.C. § 1396a(n)(3)(B)) whenever receiving Medicare Part A/B bills.`
        : `Not currently flagged as QMB enrolled. Screen income/resources in the Medicare Savings Program (MSP) calculator to verify QMB eligibility.`;

    return {
      isProtectedQmb: params.isDualEligibleQmb,
      unlawfulBalanceDetected,
      unlawfulBalanceAmountUsd: unlawfulBalanceDetected ? Number(amount.toFixed(2)) : 0,
      statutoryCitations,
      ceaseBillingDemandLetter
    };
  }
}

function buildTeaspoonChecklist(params: {
  urgencyLevel: ContinuityUrgencyLevel;
  administeringAgency: string;
  aidPaidPendingDeadlineIso: string | null;
  reinstatement90DayDeadlineIso: string | null;
  addressChangedRecently: boolean;
  unlawfulBalanceDetected: boolean;
  unlawfulBalanceAmountUsd: number;
}): string[] {
  const steps: string[] = [];

  if (params.urgencyLevel === 'URGENT_AID_PAID_PENDING') {
    steps.push(
      `1. Call or message ${params.administeringAgency} before ${params.aidPaidPendingDeadlineIso || 'your due date'} and say: "I am requesting a Fair Hearing and Aid Paid Pending so my coverage does not stop."`
    );
  } else if (params.urgencyLevel === 'REINSTATEMENT_90_DAY') {
    steps.push(
      `1. Turn in your renewal form before ${params.reinstatement90DayDeadlineIso} — federal law gives you 90 days to turn Medicaid back on WITHOUT starting a brand-new application.`
    );
  } else {
    steps.push(
      `1. Watch your mail and state portal for your ${params.administeringAgency} renewal packet, and ask if they checked your eligibility automatically (ex parte renewal).`
    );
  }

  if (params.addressChangedRecently) {
    steps.push(`2. Update your mailing address and phone number with ${params.administeringAgency} today so renewal notices do not go to your old address.`);
  } else {
    steps.push(`2. Keep your current mailing address, phone number, and pharmacy list saved in your state Medicaid portal.`);
  }

  if (params.unlawfulBalanceDetected) {
    steps.push(
      `3. Do NOT pay the $${params.unlawfulBalanceAmountUsd.toFixed(2)} Medicare bill yet — send the QMB Federal Protection Notice below because doctors cannot bill QMB patients for Medicare copays or deductibles.`
    );
  } else {
    steps.push(`3. Save a photo or confirmation number of every renewal form you send (never rely on mail alone without a receipt).`);
  }

  steps.push(`4. If a clinic or pharmacy says your coverage stopped by mistake, ask for a temporary transition fill and contact your state SHIP / Legal Aid helpline.`);
  return steps.slice(0, 4);
}

function buildContinuityNotice(params: {
  stateName: string;
  administeringAgency: string;
  beneficiaryName: string;
  caseId: string;
  urgencyLevel: ContinuityUrgencyLevel;
  aidPaidPendingEligible: boolean;
  aidPaidPendingDeadlineIso: string | null;
  reinstatement90DayEligible: boolean;
  reinstatement90DayDeadlineIso: string | null;
  renewalDueDateIso?: string;
  isDsnpEnrolled: boolean;
}): string {
  const header = params.reinstatement90DayEligible
    ? `REQUEST FOR 90-DAY PROCEDURAL MEDICAID RECONSIDERATION & REINSTATEMENT (42 C.F.R. § 435.916(a)(3)(iii))`
    : `REQUEST FOR EX PARTE RENEWAL VERIFICATION, FAIR HEARING & AID PAID PENDING (42 C.F.R. § 431.230)`;

  return [
    header,
    `State Agency: ${params.administeringAgency} (${params.stateName})`,
    `Beneficiary: ${params.beneficiaryName} | Case ID: ${params.caseId}`,
    params.renewalDueDateIso ? `Renewal Due Date: ${params.renewalDueDateIso}` : `Urgency Status: ${params.urgencyLevel}`,
    params.aidPaidPendingEligible && params.aidPaidPendingDeadlineIso
      ? `Aid Paid Pending Filing Cutoff: ${params.aidPaidPendingDeadlineIso} (prior to adverse effective date)`
      : params.reinstatement90DayEligible && params.reinstatement90DayDeadlineIso
        ? `90-Day Reconsideration Cutoff: ${params.reinstatement90DayDeadlineIso} (no new application required)`
        : `Continuity Monitoring: Proactive Renewal Preparation`,
    ``,
    `STATUTORY DEMANDS:`,
    `1. Confirm whether an ex parte electronic redetermination was attempted prior to issuing any adverse notice (42 C.F.R. § 435.916(a)(2)).`,
    params.aidPaidPendingEligible
      ? `2. Maintain uninterrupted Medicaid benefits under Aid Paid Pending (42 C.F.R. § 431.230) pending completion of administrative Fair Hearing review.`
      : params.reinstatement90DayEligible
        ? `2. Process the attached renewal information under the federal 90-day reconsideration window (42 C.F.R. § 435.916(a)(3)(iii)) with retroactive reinstatement to prevent gaps in essential medications.`
        : `2. Confirm active mailing address, authorized representative contact, and upcoming redetermination window.`,
    params.isDsnpEnrolled
      ? `3. Notify the beneficiary's Medicare Advantage D-SNP care coordinator (42 C.F.R. § 422.107) to prevent unintended deemed-continued-eligibility disenrollment.`
      : `3. Provide written confirmation of receipt and updated coverage status.`,
    ``,
    `Disclaimer: Generated by PocketGull Medicaid Continuity Guard for beneficiary self-advocacy and care-team coordination; not formal legal representation.`
  ].join('\n');
}

function resolveTwoLetterCode(raw: string): string {
  if (raw.includes('TEXAS')) return 'TX';
  if (raw.includes('CALIFORNIA')) return 'CA';
  if (raw.includes('NEW_YORK')) return 'NY';
  if (raw.includes('FLORIDA')) return 'FL';
  if (raw.includes('WASHINGTON')) return 'WA';
  if (raw.includes('OREGON')) return 'OR';
  if (raw.includes('ILLINOIS')) return 'IL';
  return raw.slice(0, 2);
}

function parseIsoDateOrToday(iso?: string): Date {
  if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso.trim())) {
    const [y, m, d] = iso.trim().split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function parseOptionalIsoDate(iso?: string): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso.trim())) return null;
  const [y, m, d] = iso.trim().split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function diffCalendarDays(fromDate: Date, toDate: Date): number {
  return Math.round((toDate.getTime() - fromDate.getTime()) / 86400000);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400000);
}

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}
