/**
 * Clinical Game Theory HSA Incentive Network Router
 *
 * REST endpoints for patient HSA/FSA debit card tokenization,
 * Stackelberg adherence rebate disbursement, and IRS §223 substantiation reporting.
 *
 * @module server/routes/hsa.routes
 */
import { Router } from 'express';
import type { Request, Response } from 'express';
import { sanitizeAlphanumericIdentifier } from '../../utils/security-sanitizer';

export interface IHsaRebateRequest {
  patientId: string;
  cardId?: string;
  adherenceDomain: 'MEDICATION_PDC' | 'BP_HOMEOSTASIS' | 'ZONE2_ACTIVITY' | 'CHRONO_FASTING';
  amountUsd: number;
  reason: string;
  irsSubstantiationCode?: string;
}

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
 * POST /api/hsa/cards/link
 * Links or updates a patient HSA/FSA debit card token
 */
hsaRouter.post('/cards/link', (req: Request, res: Response) => {
  const { patientId, issuerName, cardType, last4 } = req.body || {};

  if (!issuerName || !last4) {
    res.status(400).json({ error: 'Missing issuerName or last4' });
    return;
  }

  res.status(200).json({
    success: true,
    cardId: `HSA-CARD-${Math.floor(1000 + Math.random() * 9000)}`,
    patientId: patientId || 'P001',
    issuerName,
    cardType: cardType || 'HSA',
    maskedPan: `•••• •••• •••• ${last4}`,
    iiasCompliant: true,
    status: 'ACTIVE',
    linkedAt: new Date().toISOString()
  });
});

/**
 * POST /api/hsa/rebate/disburse
 * Executes a Stackelberg adherence rebate disbursement to linked HSA/FSA card
 */
hsaRouter.post('/rebate/disburse', (req: Request, res: Response) => {
  const { patientId, adherenceDomain, amountUsd, reason } = req.body as IHsaRebateRequest;

  if (!amountUsd || amountUsd <= 0) {
    res.status(400).json({ error: 'Valid amountUsd is required' });
    return;
  }

  const txId = 'TX-HSA-' + Date.now().toString(36).toUpperCase();
  const entry = {
    id: txId,
    patientId: patientId || 'P001',
    timestamp: new Date().toISOString(),
    amountUsd: Number(amountUsd),
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
 * Retrieves recent adherence ledger transactions for the active session
 */
const handleGetLedger = (_req: Request, res: Response) => {
  const targetId = 'P001';
  const filtered = mockHsaLedger.filter(t => t.patientId === targetId || targetId === 'P001');

  res.status(200).json({
    patientId: targetId,
    count: filtered.length,
    ledger: filtered
  });
};

hsaRouter.get('/ledger', handleGetLedger);

/**
 * POST /api/hsa/ledger
 * Secure body-based ledger retrieval
 */
hsaRouter.post('/ledger', (req: Request, res: Response) => {
  const targetId = sanitizeAlphanumericIdentifier(req.body?.patientId, 'P001', 32);
  const filtered = mockHsaLedger.filter(t => t.patientId === targetId || targetId === 'P001');

  res.status(200).json({
    patientId: targetId,
    count: filtered.length,
    ledger: filtered
  });
});
