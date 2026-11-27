// SPDX-License-Identifier: Apache-2.0
/**
 * Clinical Game Theory HSA Incentive Network Router
 *
 * REST endpoints for patient HSA/FSA debit card tokenization,
 * Stackelberg adherence rebate disbursement (with cryptographic M-of-N Dual-Custody
 * for disbursements >= $500), and IRS §223 substantiation reporting strictly scoped
 * to the authenticated patient principal.
 *
 * @module server/routes/hsa.routes
 */
import { Router } from 'express';
import type { Response } from 'express';
import { randomInt } from 'node:crypto';
import { sanitizeAlphanumericIdentifier } from '../../utils/security-sanitizer';
import { requireAuth, type IAuthenticatedRequest } from '../middleware/auth-guard';
import { SoarOrchestratorService } from '../services/soar-orchestrator.service';

export interface IHsaRebateRequest {
  patientId: string;
  cardId?: string;
  adherenceDomain: 'MEDICATION_PDC' | 'BP_HOMEOSTASIS' | 'ZONE2_ACTIVITY' | 'CHRONO_FASTING';
  amountUsd: number;
  reason: string;
  irsSubstantiationCode?: string;
  dualCustody?: {
    requestorToken?: string;
    authorizerToken?: string;
    rationale?: string;
  };
}

/** Mandiant Anti-Whaling threshold: disbursements >= $500 require cryptographic Dual-Custody co-signing. */
export const HSA_DUAL_CUSTODY_THRESHOLD_USD = 500;

const mockHsaLedger: Array<{
  id: string;
  patientId: string;
  timestamp: string;
  amountUsd: number;
  adherenceDomain: string;
  reason: string;
  irsSubstantiationCode: string;
  status: 'SETTLED' | 'PENDING';
}> = [
  {
    id: 'TX-HSA-8821',
    patientId: 'P001',
    timestamp: new Date().toISOString(),
    amountUsd: 15.00,
    adherenceDomain: 'MEDICATION_PDC',
    reason: 'Morning Metformin & Lisinopril adherence verified via SMS bridge',
    irsSubstantiationCode: 'IRS-213D-CHRONIC-PDC',
    status: 'SETTLED'
  }
];

export const hsaRouter = Router();

/**
 * Resolves the authorized patient scope strictly from the verified authentication principal.
 * Never defaults to leaking another patient's ledger entries.
 */
function resolveAuthenticatedPatientId(req: IAuthenticatedRequest, requestedPatientId?: unknown): string | null {
  const auth = req.auth;
  if (!auth) return null;

  const isAdmin = auth.roles.some(
    r => r.toUpperCase() === 'ADMIN' || r.toUpperCase() === 'ROLES/HEALTHCARE.DATASETADMIN'
  );

  // If the principal is bound to a specific patientId, strictly enforce that binding
  if (auth.patientId && !isAdmin) {
    if (requestedPatientId && String(requestedPatientId).trim() !== auth.patientId) {
      return null; // Forbidden cross-patient query
    }
    return auth.patientId;
  }

  if (requestedPatientId && typeof requestedPatientId === 'string' && requestedPatientId.trim()) {
    return sanitizeAlphanumericIdentifier(requestedPatientId, '', 32) || null;
  }

  return auth.patientId || sanitizeAlphanumericIdentifier(auth.sub, '', 32) || null;
}

/**
 * POST /api/hsa/cards/link
 * Links or updates a patient HSA/FSA debit card token (authenticated).
 */
hsaRouter.post('/cards/link', requireAuth(['CLINICIAN']), (req: IAuthenticatedRequest, res: Response) => {
  const { patientId, issuerName, cardType, last4 } = req.body || {};

  if (!issuerName || !last4) {
    res.status(400).json({ error: 'Missing issuerName or last4' });
    return;
  }

  const scopedPatientId = resolveAuthenticatedPatientId(req, patientId);
  if (!scopedPatientId) {
    res.status(403).json({ error: 'Forbidden: Patient scope mismatch or unauthenticated principal.' });
    return;
  }

  res.status(200).json({
    success: true,
    cardId: `HSA-CARD-${randomInt(1000, 10000)}`,
    patientId: scopedPatientId,
    issuerName: String(issuerName).slice(0, 80),
    cardType: cardType || 'HSA',
    maskedPan: `•••• •••• •••• ${String(last4).replace(/\D/g, '').slice(-4)}`,
    iiasCompliant: true,
    status: 'ACTIVE',
    linkedAt: new Date().toISOString()
  });
});

/**
 * POST /api/hsa/rebate/disburse
 * Executes a Stackelberg adherence rebate disbursement to linked HSA/FSA card.
 * Enforces cryptographic M-of-N Dual-Custody for any disbursement >= $500.
 */
hsaRouter.post('/rebate/disburse', requireAuth(['CLINICIAN']), (req: IAuthenticatedRequest, res: Response) => {
  const { patientId, adherenceDomain, amountUsd, reason, dualCustody } = (req.body || {}) as IHsaRebateRequest;

  const numericAmount = Number(amountUsd);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    res.status(400).json({ error: 'Valid amountUsd is required' });
    return;
  }

  const scopedPatientId = resolveAuthenticatedPatientId(req, patientId);
  if (!scopedPatientId) {
    res.status(403).json({ error: 'Forbidden: Patient scope mismatch or unauthenticated principal.' });
    return;
  }

  // Mandiant Anti-Whaling Guard: Disbursements >= $500 require cryptographic Dual-Custody verification
  if (numericAmount >= HSA_DUAL_CUSTODY_THRESHOLD_USD) {
    const headers = (req.headers || {}) as Record<string, unknown>;
    const requestorToken =
      dualCustody?.requestorToken ||
      (typeof headers['x-dual-custody-requestor-token'] === 'string'
        ? headers['x-dual-custody-requestor-token']
        : undefined);
    const authorizerToken =
      dualCustody?.authorizerToken ||
      (typeof headers['x-dual-custody-authorizer-token'] === 'string'
        ? headers['x-dual-custody-authorizer-token']
        : undefined);

    const dcCheck = SoarOrchestratorService.verifyDualCustody({
      requestorToken,
      authorizerToken,
      rationale: dualCustody?.rationale || `HSA disbursement >= $${HSA_DUAL_CUSTODY_THRESHOLD_USD}`
    });

    if (!dcCheck.verified) {
      res.status(403).json({
        error: `Anti-Whaling Guard: HSA disbursements >= $${HSA_DUAL_CUSTODY_THRESHOLD_USD} require cryptographic M-of-N Dual-Custody co-authorization.`,
        reason: dcCheck.reason
      });
      return;
    }
  }

  const txId = 'TX-HSA-' + Date.now().toString(36).toUpperCase();
  const entry = {
    id: txId,
    patientId: scopedPatientId,
    timestamp: new Date().toISOString(),
    amountUsd: numericAmount,
    adherenceDomain: adherenceDomain || 'MEDICATION_PDC',
    reason: reason || 'Clinical Game Theory Nash Equilibrium Adherence Reward',
    irsSubstantiationCode: 'IRS-213D-PREVENTIVE-CDS',
    status: 'SETTLED' as const
  };

  mockHsaLedger.unshift(entry);
  if (mockHsaLedger.length > 50) mockHsaLedger.pop();

  res.status(200).json({
    success: true,
    transactionId: txId,
    disbursedAmountUsd: entry.amountUsd,
    settlementStatus: 'SETTLED_TO_HSA_DEBIT_NETWORK',
    irsSubstantiationCode: entry.irsSubstantiationCode,
    fhirClaimResponse: {
      resourceType: 'ClaimResponse',
      id: `claim-resp-${txId.toLowerCase()}`,
      status: 'active',
      type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/claim-type', code: 'pharmacy' }] },
      use: 'claim',
      patient: { reference: `Patient/${entry.patientId}` },
      outcome: 'complete',
      payment: {
        amount: { value: entry.amountUsd, currency: 'USD' }
      }
    }
  });
});

/**
 * GET /api/hsa/ledger
 * Retrieves adherence ledger transactions strictly scoped to the authenticated patient.
 */
const handleGetLedger = (req: IAuthenticatedRequest, res: Response) => {
  const targetId = resolveAuthenticatedPatientId(req);
  if (!targetId) {
    res.status(403).json({ error: 'Forbidden: Authenticated patient identity is required to query HSA ledger.' });
    return;
  }

  const filtered = mockHsaLedger.filter(t => t.patientId === targetId);

  res.status(200).json({
    patientId: targetId,
    count: filtered.length,
    ledger: filtered
  });
};

hsaRouter.get('/ledger', requireAuth(['CLINICIAN']), handleGetLedger);

/**
 * POST /api/hsa/ledger
 * Secure body-based ledger retrieval strictly scoped to the authenticated patient.
 */
hsaRouter.post('/ledger', requireAuth(['CLINICIAN']), (req: IAuthenticatedRequest, res: Response) => {
  const targetId = resolveAuthenticatedPatientId(req, req.body?.patientId);
  if (!targetId) {
    res.status(403).json({ error: 'Forbidden: Cannot query HSA ledger outside authenticated patient scope.' });
    return;
  }

  const filtered = mockHsaLedger.filter(t => t.patientId === targetId);

  res.status(200).json({
    patientId: targetId,
    count: filtered.length,
    ledger: filtered
  });
});
