// SPDX-License-Identifier: Apache-2.0
import { Injectable, inject, signal, computed } from '@angular/core';
import { PatientStateService } from '../patient-state.service';
import { computeFipsSha256Bytes } from '../clinical-defense-guard.service';
import {
  IRA_PART_D_CAPS,
  DEFAULT_MEDICARE_PLAN_YEAR,
  MedicarePlanYear
} from '../medicare-billing-best-practices.service';

export type BlueButtonEnvironment = 'production' | 'sandbox';

export interface IBlueButtonEndpoints {
  environment: BlueButtonEnvironment;
  authorizeUrl: string;
  tokenUrl: string;
  fhirBaseUrl: string;
  scopes: string[];
}

export interface IBlueButtonAuthRequest {
  environment: BlueButtonEnvironment;
  authorizeUrl: string;
  stateNonce: string;
  codeVerifier: string;
  pkceChallengeS256: string;
  scopes: string[];
  redirectUri: string;
  createdAtIso: string;
}

export interface IBlueButtonPartDMedication {
  medicationName: string;
  ndcCode?: string;
  rxNormCode?: string;
  daysSupply: number;
  lastFilledDate: string;
  patientPaidUsd: number;
  planPaidUsd: number;
  claimId: string;
}

export interface IBlueButtonClaimItem {
  claimId: string;
  claimType: 'PART_A' | 'PART_B' | 'PART_D' | 'OTHER';
  serviceDate: string;
  description: string;
  diagnosisCodes: string[];
  patientPaidUsd: number;
  planPaidUsd: number;
}

export interface IBlueButtonCoverageSummary {
  hasPartA: boolean;
  hasPartB: boolean;
  hasPartD: boolean;
  hasMedicaidDualCrossover: boolean;
  isQmbFlagged: boolean;
  planLabels: string[];
}

export interface IBlueButtonImportSummary {
  dataOrigin: 'CMS_BLUE_BUTTON_SANDBOX_SYNTHETIC' | 'LIVE_CMS_BLUE_BUTTON_FHIR_R4' | 'PATIENT_UPLOADED_FHIR_R4';
  beneficiaryDisplayId: string;
  planYear: MedicarePlanYear;
  importedAtIso: string;
  totalResourcesParsed: number;
  coverage: IBlueButtonCoverageSummary;
  partDMedications: IBlueButtonPartDMedication[];
  claims: IBlueButtonClaimItem[];
  ytdPartDOutOfPocketUsd: number;
  partDCapUsd: number;
  remainingUntilPartDCapUsd: number;
  hasReachedPartDCatastrophicCap: boolean;
  polypharmacyAlertCount: number;
  sha256ProvenanceSeal: string;
}

export const CMS_BLUE_BUTTON_ENDPOINTS: Record<BlueButtonEnvironment, IBlueButtonEndpoints> = {
  production: {
    environment: 'production',
    authorizeUrl: 'https://api.bluebutton.cms.gov/v2/o/authorize/',
    tokenUrl: 'https://api.bluebutton.cms.gov/v2/o/token/',
    fhirBaseUrl: 'https://api.bluebutton.cms.gov/v2/fhir',
    scopes: ['profile', 'patient/Patient.read', 'patient/Coverage.read', 'patient/ExplanationOfBenefit.read']
  },
  sandbox: {
    environment: 'sandbox',
    authorizeUrl: 'https://sandbox.bluebutton.cms.gov/v2/o/authorize/',
    tokenUrl: 'https://sandbox.bluebutton.cms.gov/v2/o/token/',
    fhirBaseUrl: 'https://sandbox.bluebutton.cms.gov/v2/fhir',
    scopes: ['profile', 'patient/Patient.read', 'patient/Coverage.read', 'patient/ExplanationOfBenefit.read']
  }
};

@Injectable({
  providedIn: 'root'
})
export class CmsBlueButtonService {
  private readonly patientState = inject(PatientStateService, { optional: true });

  readonly environment = signal<BlueButtonEnvironment>('sandbox');
  readonly connectionStatus = signal<'IDLE' | 'AUTHORIZING' | 'IMPORTED' | 'ERROR'>('IDLE');
  readonly lastAuthRequest = signal<IBlueButtonAuthRequest | null>(null);
  readonly lastImportSummary = signal<IBlueButtonImportSummary | null>(null);
  readonly lastError = signal<string | null>(null);

  readonly activePartDMedications = computed(() => this.lastImportSummary()?.partDMedications ?? []);

  /**
   * Builds an RFC 7636 PKCE (S256) + NIST SP 800-90A CSPRNG state OAuth2 authorization URL
   * for CMS Blue Button 2.0 v2 FHIR R4.
   */
  public buildAuthorizeRequest(options?: {
    environment?: BlueButtonEnvironment;
    clientId?: string;
    redirectUri?: string;
    scopes?: string[];
  }): IBlueButtonAuthRequest {
    const env = options?.environment ?? this.environment();
    const cfg = CMS_BLUE_BUTTON_ENDPOINTS[env];
    const clientId = options?.clientId || 'pocketgull-bluebutton-v2-client';
    const redirectUri = options?.redirectUri || 'https://pocketgull.app/bluebutton-callback';
    const scopes = options?.scopes?.length ? options.scopes : cfg.scopes;

    const codeVerifier = generateCsprngToken('bb2-pkce-', 32);
    const stateNonce = generateCsprngToken('bb2-state-', 16);
    const pkceChallengeS256 = base64UrlEncode(computeFipsSha256Bytes(codeVerifier));

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
      state: stateNonce,
      code_challenge: pkceChallengeS256,
      code_challenge_method: 'S256'
    });

    const req: IBlueButtonAuthRequest = {
      environment: env,
      authorizeUrl: `${cfg.authorizeUrl}?${params.toString()}`,
      stateNonce,
      codeVerifier,
      pkceChallengeS256,
      scopes,
      redirectUri,
      createdAtIso: new Date().toISOString()
    };

    this.environment.set(env);
    this.lastAuthRequest.set(req);
    this.connectionStatus.set('AUTHORIZING');
    this.lastError.set(null);
    return req;
  }

  /**
   * Parses an HL7 FHIR R4 Bundle (CMS Blue Button 2.0 CARIN-BB ExplanationOfBenefit,
   * Coverage, and Patient resources) into zero-typing medication reconciliation,
   * YTD Part D out-of-pocket cap tracking, and dual-eligible QMB detection.
   */
  public parseBlueButtonBundle(
    bundle: unknown,
    origin: IBlueButtonImportSummary['dataOrigin'] = 'PATIENT_UPLOADED_FHIR_R4',
    planYear: MedicarePlanYear = DEFAULT_MEDICARE_PLAN_YEAR
  ): IBlueButtonImportSummary {
    if (!bundle || typeof bundle !== 'object' || (bundle as Record<string, unknown>)['resourceType'] !== 'Bundle') {
      throw new Error('Invalid FHIR R4 payload: expected resourceType "Bundle".');
    }

    const entries = Array.isArray((bundle as Record<string, unknown>)['entry'])
      ? ((bundle as Record<string, unknown>)['entry'] as Array<{ resource?: Record<string, unknown> }>)
      : [];

    const coverage: IBlueButtonCoverageSummary = {
      hasPartA: false,
      hasPartB: false,
      hasPartD: false,
      hasMedicaidDualCrossover: false,
      isQmbFlagged: false,
      planLabels: []
    };

    let beneficiaryDisplayId = 'MEDICARE-BENEFICIARY-DEIDENTIFIED';
    const medMap = new Map<string, IBlueButtonPartDMedication>();
    const claims: IBlueButtonClaimItem[] = [];

    for (const entry of entries) {
      const res = entry?.resource;
      if (!res || typeof res !== 'object') continue;
      const rType = String(res['resourceType'] || '');

      if (rType === 'Patient') {
        beneficiaryDisplayId = String(res['id'] || beneficiaryDisplayId);
        continue;
      }

      if (rType === 'Coverage') {
        const serialized = JSON.stringify(res).toLowerCase();
        if (serialized.includes('part-a') || serialized.includes('part a') || serialized.includes('inpatient')) {
          coverage.hasPartA = true;
        }
        if (serialized.includes('part-b') || serialized.includes('part b') || serialized.includes('medical')) {
          coverage.hasPartB = true;
        }
        if (serialized.includes('part-d') || serialized.includes('part d') || serialized.includes('drug') || serialized.includes('pharmacy')) {
          coverage.hasPartD = true;
        }
        if (serialized.includes('medicaid') || serialized.includes('dual')) {
          coverage.hasMedicaidDualCrossover = true;
        }
        if (serialized.includes('qmb') || serialized.includes('qualified medicare beneficiary')) {
          coverage.isQmbFlagged = true;
          coverage.hasMedicaidDualCrossover = true;
        }
        const typeText = extractCodingDisplay(res['type']) || String(res['id'] || 'Medicare Coverage');
        if (!coverage.planLabels.includes(typeText)) {
          coverage.planLabels.push(typeText);
        }
        continue;
      }

      if (rType === 'ExplanationOfBenefit') {
        const claimId = String(res['id'] || `eob-${claims.length + 1}`);
        const typeStr = JSON.stringify(res['type'] || '').toLowerCase();
        const claimType: IBlueButtonClaimItem['claimType'] =
          typeStr.includes('pharmacy') || typeStr.includes('pde') || typeStr.includes('part-d')
            ? 'PART_D'
            : typeStr.includes('institutional') || typeStr.includes('inpatient') || typeStr.includes('part-a')
              ? 'PART_A'
              : typeStr.includes('professional') || typeStr.includes('carrier') || typeStr.includes('outpatient') || typeStr.includes('part-b')
                ? 'PART_B'
                : 'OTHER';

        const billablePeriod = res['billablePeriod'] as Record<string, unknown> | undefined;
        const serviceDate = String(
          billablePeriod?.['start'] || res['created'] || new Date().toISOString().slice(0, 10)
        ).slice(0, 10);

        const { patientPaidUsd, planPaidUsd } = extractEobFinancials(res);
        const diagnosisCodes = extractDiagnosisCodes(res);
        const items = Array.isArray(res['item']) ? (res['item'] as Array<Record<string, unknown>>) : [];
        const firstProductDisplay = items.length > 0
          ? extractCodingDisplay(items[0]['productOrService']) || 'Medicare Service'
          : 'Medicare Claim';

        claims.push({
          claimId,
          claimType,
          serviceDate,
          description: firstProductDisplay,
          diagnosisCodes,
          patientPaidUsd,
          planPaidUsd
        });

        if (claimType === 'PART_D') {
          coverage.hasPartD = true;
          const medName = firstProductDisplay;
          const ndcCode = extractCodingCode(items[0]?.['productOrService'], 'ndc');
          const rxNormCode = extractCodingCode(items[0]?.['productOrService'], 'rxnorm');
          const qtyObj = items[0]?.['quantity'] as Record<string, unknown> | undefined;
          const daysSupply = Number(qtyObj?.['value'] || 30);

          const key = medName.trim().toLowerCase();
          const existing = medMap.get(key);
          if (!existing) {
            medMap.set(key, {
              medicationName: medName,
              ndcCode,
              rxNormCode,
              daysSupply,
              lastFilledDate: serviceDate,
              patientPaidUsd,
              planPaidUsd,
              claimId
            });
          } else {
            existing.patientPaidUsd = Number((existing.patientPaidUsd + patientPaidUsd).toFixed(2));
            existing.planPaidUsd = Number((existing.planPaidUsd + planPaidUsd).toFixed(2));
            if (serviceDate > existing.lastFilledDate) {
              existing.lastFilledDate = serviceDate;
              existing.daysSupply = daysSupply;
            }
          }
        }
      }
    }

    const partDMedications = Array.from(medMap.values()).sort((a, b) =>
      b.lastFilledDate.localeCompare(a.lastFilledDate)
    );
    const ytdPartDOutOfPocketUsd = Number(
      claims
        .filter(c => c.claimType === 'PART_D')
        .reduce((sum, c) => sum + c.patientPaidUsd, 0)
        .toFixed(2)
    );

    const partDCapUsd = IRA_PART_D_CAPS[planYear] ?? IRA_PART_D_CAPS[DEFAULT_MEDICARE_PLAN_YEAR];
    const remainingUntilPartDCapUsd = Number(Math.max(0, partDCapUsd - ytdPartDOutOfPocketUsd).toFixed(2));
    const hasReachedPartDCatastrophicCap = ytdPartDOutOfPocketUsd >= partDCapUsd;

    const sealInput = JSON.stringify({
      origin,
      beneficiaryDisplayId,
      planYear,
      medCount: partDMedications.length,
      claimCount: claims.length,
      ytdPartDOutOfPocketUsd
    });
    const sha256ProvenanceSeal = bytesToHex(computeFipsSha256Bytes(sealInput));

    const summary: IBlueButtonImportSummary = {
      dataOrigin: origin,
      beneficiaryDisplayId,
      planYear,
      importedAtIso: new Date().toISOString(),
      totalResourcesParsed: entries.length,
      coverage,
      partDMedications,
      claims,
      ytdPartDOutOfPocketUsd,
      partDCapUsd,
      remainingUntilPartDCapUsd,
      hasReachedPartDCatastrophicCap,
      polypharmacyAlertCount: partDMedications.length >= 5 ? 1 : 0,
      sha256ProvenanceSeal
    };

    this.lastImportSummary.set(summary);
    this.connectionStatus.set('IMPORTED');
    this.lastError.set(null);
    return summary;
  }

  /**
   * Imports parsed CMS Blue Button 2.0 Part D medications & coverage flags into
   * PocketGull's local PatientState clinical notes (zero manual typing).
   */
  public commitSummaryToLocalPatientState(summary: IBlueButtonImportSummary): {
    committedNotesCount: number;
    medicationsSummaryText: string;
  } {
    const medLines = summary.partDMedications.map(
      m => `${m.medicationName} (${m.daysSupply}d supply, last filled ${m.lastFilledDate}, YTD OOP $${m.patientPaidUsd.toFixed(2)})`
    );
    const dualTag = summary.coverage.isQmbFlagged
      ? 'QMB Dual-Eligible (Balance-Billing Protected)'
      : summary.coverage.hasMedicaidDualCrossover
        ? 'Medicare + Medicaid Dual Crossover'
        : 'Original Medicare (Part A/B/D)';

    const medicationsSummaryText =
      `[CMS Blue Button 2.0 FHIR Import | ${summary.dataOrigin}] ${dualTag}. ` +
      `Active Part D Rx (${summary.partDMedications.length}): ${medLines.join('; ') || 'None parsed'}. ` +
      `YTD Part D OOP: $${summary.ytdPartDOutOfPocketUsd.toFixed(2)} / $${summary.partDCapUsd} (${summary.planYear} IRA Cap). ` +
      `SHA-256 Seal: ${summary.sha256ProvenanceSeal.slice(0, 16)}...`;

    let committedNotesCount = 0;
    const stateAny = this.patientState as unknown as { addClinicalNote?: (text: string, lens?: string) => void } | null;
    if (stateAny && typeof stateAny.addClinicalNote === 'function') {
      stateAny.addClinicalNote(medicationsSummaryText, 'CMS Blue Button 2.0');
      committedNotesCount = 1;
    }

    return { committedNotesCount, medicationsSummaryText };
  }

  /**
   * Loads a deterministic CMS Blue Button 2.0 Sandbox synthetic FHIR R4 Bundle
   * (clearly demarcated as synthetic sandbox data) for offline/evaluation verification.
   */
  public loadSandboxMedicareBundle(planYear: MedicarePlanYear = DEFAULT_MEDICARE_PLAN_YEAR): IBlueButtonImportSummary {
    const syntheticSandboxBundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: 'BB2-SANDBOX-SYNTH-2026'
          }
        },
        {
          resource: {
            resourceType: 'Coverage',
            id: 'cov-part-a-b',
            status: 'active',
            type: {
              coding: [{ code: 'part-a-part-b', display: 'Medicare Part A & Part B' }]
            }
          }
        },
        {
          resource: {
            resourceType: 'Coverage',
            id: 'cov-part-d-qmb',
            status: 'active',
            type: {
              coding: [{ code: 'part-d-qmb', display: 'Medicare Part D + QMB Medicaid Dual Crossover' }]
            }
          }
        },
        {
          resource: {
            resourceType: 'ExplanationOfBenefit',
            id: 'eob-pde-1001',
            type: { coding: [{ code: 'pharmacy', display: 'Part D Pharmacy (PDE)' }] },
            billablePeriod: { start: `${planYear}-01-15` },
            diagnosis: [{ diagnosisCodeableConcept: { coding: [{ code: 'E11.9', display: 'Type 2 diabetes mellitus' }] } }],
            item: [
              {
                productOrService: {
                  coding: [
                    { system: 'http://hl7.org/fhir/sid/ndc', code: '00002-1433-80', display: 'Empagliflozin 10 MG Oral Tablet' }
                  ]
                },
                quantity: { value: 90 }
              }
            ],
            total: [
              { category: { coding: [{ code: 'patientpay' }] }, amount: { value: 645.0, currency: 'USD' } },
              { category: { coding: [{ code: 'benefit' }] }, amount: { value: 1255.0, currency: 'USD' } }
            ]
          }
        },
        {
          resource: {
            resourceType: 'ExplanationOfBenefit',
            id: 'eob-pde-1002',
            type: { coding: [{ code: 'pharmacy', display: 'Part D Pharmacy (PDE)' }] },
            billablePeriod: { start: `${planYear}-02-12` },
            diagnosis: [{ diagnosisCodeableConcept: { coding: [{ code: 'I48.91', display: 'Atrial fibrillation' }] } }],
            item: [
              {
                productOrService: {
                  coding: [
                    { system: 'http://hl7.org/fhir/sid/ndc', code: '00003-0894-21', display: 'Apixaban 5 MG Oral Tablet' }
                  ]
                },
                quantity: { value: 90 }
              }
            ],
            total: [
              { category: { coding: [{ code: 'patientpay' }] }, amount: { value: 780.0, currency: 'USD' } },
              { category: { coding: [{ code: 'benefit' }] }, amount: { value: 1120.0, currency: 'USD' } }
            ]
          }
        },
        {
          resource: {
            resourceType: 'ExplanationOfBenefit',
            id: 'eob-pde-1003',
            type: { coding: [{ code: 'pharmacy', display: 'Part D Pharmacy (PDE)' }] },
            billablePeriod: { start: `${planYear}-03-05` },
            diagnosis: [{ diagnosisCodeableConcept: { coding: [{ code: 'I10', display: 'Essential hypertension' }] } }],
            item: [
              {
                productOrService: {
                  coding: [
                    { system: 'http://hl7.org/fhir/sid/ndc', code: '00378-0180-01', display: 'Lisinopril 10 MG Oral Tablet' }
                  ]
                },
                quantity: { value: 90 }
              }
            ],
            total: [
              { category: { coding: [{ code: 'patientpay' }] }, amount: { value: 12.0, currency: 'USD' } },
              { category: { coding: [{ code: 'benefit' }] }, amount: { value: 24.0, currency: 'USD' } }
            ]
          }
        },
        {
          resource: {
            resourceType: 'ExplanationOfBenefit',
            id: 'eob-carrier-2001',
            type: { coding: [{ code: 'professional', display: 'Part B Carrier Outpatient Visit' }] },
            billablePeriod: { start: `${planYear}-02-20` },
            diagnosis: [{ diagnosisCodeableConcept: { coding: [{ code: 'E11.9' }] } }],
            item: [
              {
                productOrService: {
                  coding: [{ code: '99214', display: 'Established Patient Outpatient Visit (CPT 99214 + G2211)' }]
                }
              }
            ],
            total: [
              { category: { coding: [{ code: 'patientpay' }] }, amount: { value: 0, currency: 'USD' } },
              { category: { coding: [{ code: 'benefit' }] }, amount: { value: 148.5, currency: 'USD' } }
            ]
          }
        }
      ]
    };

    const parsed = this.parseBlueButtonBundle(
      syntheticSandboxBundle,
      'CMS_BLUE_BUTTON_SANDBOX_SYNTHETIC',
      planYear
    );
    this.commitSummaryToLocalPatientState(parsed);
    return parsed;
  }

  /**
   * Fetches live ExplanationOfBenefit resources from CMS Blue Button 2.0 FHIR R4
   * using a beneficiary-authorized OAuth2 Bearer access token.
   */
  public async fetchLiveBlueButtonBundle(
    accessToken: string,
    env: BlueButtonEnvironment = this.environment(),
    planYear: MedicarePlanYear = DEFAULT_MEDICARE_PLAN_YEAR
  ): Promise<IBlueButtonImportSummary> {
    const token = accessToken.trim();
    if (!token) {
      this.connectionStatus.set('ERROR');
      this.lastError.set('Missing OAuth2 Bearer access token.');
      throw new Error('Missing OAuth2 Bearer access token for CMS Blue Button 2.0.');
    }

    const base = CMS_BLUE_BUTTON_ENDPOINTS[env].fhirBaseUrl;
    const url = `${base}/ExplanationOfBenefit?_format=json&_count=50`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/fhir+json'
      }
    });

    if (!response.ok) {
      const msg = `CMS Blue Button 2.0 request failed (HTTP ${response.status}).`;
      this.connectionStatus.set('ERROR');
      this.lastError.set(msg);
      throw new Error(msg);
    }

    const bundle = await response.json();
    const parsed = this.parseBlueButtonBundle(bundle, 'LIVE_CMS_BLUE_BUTTON_FHIR_R4', planYear);
    this.commitSummaryToLocalPatientState(parsed);
    return parsed;
  }

  public resetSession(): void {
    this.connectionStatus.set('IDLE');
    this.lastAuthRequest.set(null);
    this.lastImportSummary.set(null);
    this.lastError.set(null);
  }
}

function extractCodingDisplay(concept: unknown): string | undefined {
  if (!concept || typeof concept !== 'object') return undefined;
  const obj = concept as Record<string, unknown>;
  if (typeof obj['text'] === 'string' && obj['text'].trim()) return obj['text'].trim();
  const coding = Array.isArray(obj['coding']) ? (obj['coding'] as Array<Record<string, unknown>>) : [];
  for (const c of coding) {
    if (typeof c?.['display'] === 'string' && c['display'].trim()) return c['display'].trim();
    if (typeof c?.['code'] === 'string' && c['code'].trim()) return c['code'].trim();
  }
  return undefined;
}

function extractCodingCode(concept: unknown, systemHint: string): string | undefined {
  if (!concept || typeof concept !== 'object') return undefined;
  const coding = Array.isArray((concept as Record<string, unknown>)['coding'])
    ? ((concept as Record<string, unknown>)['coding'] as Array<Record<string, unknown>>)
    : [];
  for (const c of coding) {
    const sys = String(c?.['system'] || '').toLowerCase();
    if (sys.includes(systemHint) && typeof c?.['code'] === 'string') {
      return c['code'];
    }
  }
  return undefined;
}

function extractDiagnosisCodes(eob: Record<string, unknown>): string[] {
  const diags = Array.isArray(eob['diagnosis']) ? (eob['diagnosis'] as Array<Record<string, unknown>>) : [];
  const codes: string[] = [];
  for (const d of diags) {
    const concept = d?.['diagnosisCodeableConcept'] as Record<string, unknown> | undefined;
    const coding = Array.isArray(concept?.['coding']) ? (concept?.['coding'] as Array<Record<string, unknown>>) : [];
    for (const c of coding) {
      if (typeof c?.['code'] === 'string' && c['code'].trim()) {
        codes.push(c['code'].trim());
      }
    }
  }
  return codes;
}

function extractEobFinancials(eob: Record<string, unknown>): { patientPaidUsd: number; planPaidUsd: number } {
  const totals = Array.isArray(eob['total']) ? (eob['total'] as Array<Record<string, unknown>>) : [];
  let patientPaidUsd = 0;
  let planPaidUsd = 0;

  for (const t of totals) {
    const catStr = JSON.stringify(t?.['category'] || '').toLowerCase();
    const amountObj = t?.['amount'] as Record<string, unknown> | undefined;
    const val = Number(amountObj?.['value'] || 0);
    if (!Number.isFinite(val)) continue;
    if (catStr.includes('patientpay') || catStr.includes('copay') || catStr.includes('deductible') || catStr.includes('oop')) {
      patientPaidUsd += val;
    } else if (catStr.includes('benefit') || catStr.includes('payment') || catStr.includes('submitted')) {
      planPaidUsd += val;
    }
  }

  return {
    patientPaidUsd: Number(patientPaidUsd.toFixed(2)),
    planPaidUsd: Number(planPaidUsd.toFixed(2))
  };
}

function generateCsprngToken(prefix: string, byteLength: number): string {
  if (typeof globalThis === 'undefined' || typeof globalThis.crypto?.getRandomValues !== 'function') {
    throw new Error('NIST SP 800-90A CSPRNG unavailable: cannot generate CMS Blue Button PKCE/state token.');
  }
  const bytes = new Uint8Array(byteLength);
  globalThis.crypto.getRandomValues(bytes);
  return prefix + bytesToHex(bytes);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function base64UrlEncode(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  const base64 = typeof btoa === 'function'
    ? btoa(binary)
    : Buffer.from(binary, 'binary').toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
