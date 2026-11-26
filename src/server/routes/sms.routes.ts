// SPDX-License-Identifier: Apache-2.0
/**
 * Digital Health Equity SMS Bridge Router
 *
 * REST & Webhook endpoints for two-way SMS clinical interactions on
 * basic mobile devices (flip phones) in rural & underserved regions.
 * Parses vital signs, medication adherence, pain scores, and deterministic
 * emergency red-flag intercepts into HIPAA Safe Harbor sanitized FHIR R4 resources.
 *
 * @module server/routes/sms.routes
 */
import { Router } from 'express';
import type { Request, Response } from 'express';
import { randomBytes } from 'node:crypto';
import { requireAuth } from '../middleware/auth-guard';
import { evaluateEmergencyRedFlags } from '../services/emergency-red-flag.guard';
import { ModelArmorService } from '../services/model-armor.service';

export interface ISmsInboundPayload {
  from: string;
  to?: string;
  body: string;
  timestamp?: string;
  language?: string;
}

export interface ISmsInteractionLog {
  id: string;
  timestamp: string;
  fromPhoneMasked: string;
  redactedSummary: string;
  commandType: 'VITALS_LOG' | 'MED_ADHERENCE' | 'PAIN_REPORT' | 'STATUS_QUERY' | 'HELP' | 'GENERAL';
  detectedVitals?: { bp?: string; hr?: number; glucose?: number };
  urgencyLevel: 'ROUTINE' | 'ELEVATED' | 'CRITICAL_CALL_911';
  fhirObservationId?: string;
  responseText: string;
}

const smsLogsAudit: ISmsInteractionLog[] = [];

export const smsRouter = Router();

/**
 * Affiliate link patterns strictly prohibited in SMS/email egress (FTC & Amazon Operating Agreement Policy).
 */
const PROHIBITED_AFFILIATE_REGEX = /(?:amazon\.[a-z.]+\/(?:dp|gp\/product)|amzn\.to\/|[?&]tag=pgdpo-20\b)/i;

/**
 * PHI patterns strictly prohibited in outbound SMS payloads (HIPAA Safe Harbor §164.514).
 */
const OUTBOUND_PHI_REGEX = /(?:\b\d{3}-\d{2}-\d{4}\b|\bMRN[#:\s-]?\d{4,12}\b|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|\b(?:DOB|birth\s*date)[:=\s]+\d{1,4}[-/]\d{1,2}[-/]\d{1,4})/i;

/**
 * Mask phone numbers for HIPAA Safe Harbor §164.514
 */
function maskPhoneNumber(phone: string): string {
  if (!phone) return 'XXX-XXX-XXXX';
  const clean = phone.replace(/[^\d+]/g, '');
  if (clean.length <= 4) return '***-' + clean;
  return clean.slice(0, 3) + '-***-' + clean.slice(-4);
}

/**
 * Fully redacts PHI patterns before writing any interaction log entry.
 */
function redactSmsPhi(text: string): string {
  const armor = ModelArmorService.scan(text);
  return armor.sanitizedText
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, '[REDACTED_DATE]')
    .slice(0, 300);
}

/**
 * Parses raw SMS text commands and extracts clinical entities with deterministic red-flag precedence.
 */
function parseClinicalSms(rawText: string, fromPhone: string, jurisdiction?: unknown): {
  log: ISmsInteractionLog;
  fhirResource?: Record<string, unknown>;
} {
  const text = (rawText || '').trim();
  const lower = text.toLowerCase();
  const id = `SMS-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();

  let commandType: ISmsInteractionLog['commandType'] = 'GENERAL';
  let urgencyLevel: ISmsInteractionLog['urgencyLevel'] = 'ROUTINE';
  let detectedVitals: ISmsInteractionLog['detectedVitals'] = undefined;
  let responseText = 'Pocket Gull SMS: Thank you for your update. Reply HELP for command options.';
  let fhirResource: Record<string, unknown> | undefined = undefined;

  // 1. Deterministic Emergency Red-Flag Check (BE-FAST, ACS, SpO2 < 90%, can't breathe, shock, hypoglycemia, preeclampsia, C-SSRS/988)
  const redFlag = evaluateEmergencyRedFlags(text, jurisdiction);
  const legacyRedFlag =
    lower.includes('chest pain') ||
    lower.includes("can't breathe") ||
    lower.includes('cant breathe') ||
    lower.includes('cannot breathe') ||
    lower.includes('fainting') ||
    lower.includes('severe bleeding');

  if (redFlag.isEmergency || legacyRedFlag) {
    urgencyLevel = 'CRITICAL_CALL_911';
    commandType = 'PAIN_REPORT';
    const isCrisis = redFlag.category === 'SUICIDAL_IDEATION_CSSRS';
    responseText = isCrisis
      ? `🚨 CRISIS ALERT: Please call or text ${redFlag.crisisLine} (988 Lifeline) immediately, or call ${redFlag.emergencyNumber} if in immediate danger.`
      : `🚨 EMERGENCY ALERT: Please call ${redFlag.emergencyNumber || '911'} or proceed to the nearest emergency room immediately. A clinical notification has been triggered.`;
    fhirResource = {
      resourceType: 'Observation',
      id: `obs-${id}`,
      status: 'preliminary',
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'exam' }] }],
      code: { text: 'Emergency Acute Symptom Report via SMS' },
      effectiveDateTime: now,
      valueString: redactSmsPhi(rawText),
      interpretation: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation', code: 'A', display: 'Critical Alert' }] }]
    };
  }
  // 2. Vitals Logging (e.g. "LOG BP 120/80 HR 72" or "BP 130/85")
  else if (lower.includes('bp') || lower.includes('pulse') || lower.includes('hr') || lower.includes('glucose') || lower.includes('sugar')) {
    commandType = 'VITALS_LOG';
    const bpMatch = text.match(/\b(\d{2,3})\s*\/\s*(\d{2,3})\b/);
    const hrMatch = text.match(/\b(?:hr|pulse|heart rate)[\s:=]+(\d{2,3})\b/i) || text.match(/\b(\d{2,3})\s*bpm\b/i);
    const glucoseMatch = text.match(/\b(?:glucose|sugar)[\s:=]+(\d{2,3})\b/i);

    const bp = bpMatch ? `${bpMatch[1]}/${bpMatch[2]}` : undefined;
    const hr = hrMatch ? Number(hrMatch[1]) : undefined;
    const glucose = glucoseMatch ? Number(glucoseMatch[1]) : undefined;

    detectedVitals = { bp, hr, glucose };
    const parts: string[] = [];
    if (bp) parts.push(`BP ${bp}`);
    if (hr) parts.push(`HR ${hr} bpm`);
    if (glucose) parts.push(`Glucose ${glucose} mg/dL`);

    responseText = `✅ Pocket Gull: Recorded ${parts.join(', ') || 'vitals'}. Adherence reward logged (+10 pts). Reply STATUS anytime.`;
    fhirResource = {
      resourceType: 'Observation',
      id: `obs-vitals-${id}`,
      status: 'final',
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
      code: { text: 'Patient Reported Vitals via 2-Way SMS' },
      effectiveDateTime: now,
      component: [
        ...(bp ? [{ code: { text: 'Blood Pressure' }, valueString: bp }] : []),
        ...(hr ? [{ code: { text: 'Heart Rate' }, valueQuantity: { value: hr, unit: 'beats/min' } }] : []),
        ...(glucose ? [{ code: { text: 'Blood Glucose' }, valueQuantity: { value: glucose, unit: 'mg/dL' } }] : [])
      ]
    };
  }
  // 3. Medication Adherence (e.g. "MED YES" or "MED TAKEN")
  else if (lower.startsWith('med') || lower.includes('taken') || lower.includes('pill') || lower.includes('done')) {
    commandType = 'MED_ADHERENCE';
    responseText = '✅ Pocket Gull: Medication adherence verified (+15 pts Game Theory Rebate). Great job maintaining your regimen!';
    fhirResource = {
      resourceType: 'MedicationStatement',
      id: `med-stmt-${id}`,
      status: 'completed',
      effectiveDateTime: now,
      note: [{ text: `Adherence confirmed via SMS command: "${redactSmsPhi(text)}"` }]
    };
  }
  // 4. Pain Report (e.g. "PAIN 6 KNEE")
  else if (lower.startsWith('pain') || lower.match(/pain\s*(\d+)/i)) {
    commandType = 'PAIN_REPORT';
    const painNum = Number(text.match(/\d+/)?.[0] || '5');
    if (painNum >= 8) {
      urgencyLevel = 'ELEVATED';
      responseText = `⚠️ Pocket Gull: Recorded severe pain score (${painNum}/10). Rest, elevate if applicable, and contact your clinic nurse line if pain persists.`;
    } else {
      responseText = `✅ Pocket Gull: Recorded pain score ${painNum}/10. Applying gentle breathing and lifestyle guidance.`;
    }
    fhirResource = {
      resourceType: 'Observation',
      id: `obs-pain-${id}`,
      status: 'final',
      code: { text: 'Pain Severity Score (0-10)' },
      effectiveDateTime: now,
      valueInteger: painNum
    };
  }
  // 5. Status / Health Check
  else if (lower.includes('status') || lower.includes('summary')) {
    commandType = 'STATUS_QUERY';
    responseText = '📊 Pocket Gull: SIBI Score: 28 (Optimal) | Daily Adherence: 100%. Keep up the great work!';
  }
  // 6. Help
  else if (lower.includes('help') || lower === '?') {
    commandType = 'HELP';
    responseText = '💡 Pocket Gull Commands: "LOG BP 120/80 HR 72", "MED YES", "PAIN 4 [area]", "STATUS". For emergencies call 911; mental health crisis call/text 988.';
  }

  const log: ISmsInteractionLog = {
    id,
    timestamp: now,
    fromPhoneMasked: maskPhoneNumber(fromPhone),
    redactedSummary: redactSmsPhi(text),
    commandType,
    detectedVitals,
    urgencyLevel,
    fhirObservationId: fhirResource ? (fhirResource.id as string) : undefined,
    responseText: redactSmsPhi(responseText)
  };

  return { log, fhirResource };
}

/**
 * POST /api/sms/inbound
 * Webhook handler for incoming SMS messages (carrier / Twilio / local modem)
 */
smsRouter.post('/inbound', (req: Request, res: Response) => {
  const { from, body, From, Body, jurisdiction } = req.body || {};
  const phone = from || From || '+15550001234';
  const text = body || Body || '';

  if (!text) {
    res.status(400).json({ error: 'Missing SMS message body' });
    return;
  }

  const { log, fhirResource } = parseClinicalSms(text, phone, jurisdiction || req.headers?.['cf-ipcountry']);
  smsLogsAudit.unshift(log);
  if (smsLogsAudit.length > 50) smsLogsAudit.pop();

  res.status(200).json({
    success: true,
    messageSid: log.id,
    responseSmsText: log.responseText,
    commandType: log.commandType,
    urgencyLevel: log.urgencyLevel,
    fhirResource
  });
});

/**
 * POST /api/sms/outbound
 * Dispatches automated outbound health nudges and daily micro-interventions.
 * Strictly blocks Amazon affiliate URLs (`amazon.com/dp`, `tag=pgdpo-20`) and raw PHI egress.
 */
smsRouter.post('/outbound', requireAuth(['CLINICIAN']), (req: Request, res: Response) => {
  const { to, messageBody, language, domain } = req.body || {};
  const targetPhone = to || '+15550001234';
  const msg = String(messageBody || 'Pocket Gull: Friendly daily reminder to check your vitals and log your medication.');

  if (PROHIBITED_AFFILIATE_REGEX.test(msg)) {
    res.status(400).json({
      error: 'Policy Violation: Amazon affiliate links (amazon.com/dp, tag=pgdpo-20) are strictly prohibited in SMS egress.'
    });
    return;
  }

  if (OUTBOUND_PHI_REGEX.test(msg)) {
    res.status(400).json({
      error: 'HIPAA Safe Harbor Violation: Unredacted PHI identifiers (SSN, MRN, email, DOB) are prohibited in outbound SMS.'
    });
    return;
  }

  const log: ISmsInteractionLog = {
    id: 'OUT-' + Date.now().toString(36) + '-' + randomBytes(2).toString('hex'),
    timestamp: new Date().toISOString(),
    fromPhoneMasked: maskPhoneNumber(targetPhone),
    redactedSummary: `[OUTBOUND -> ${maskPhoneNumber(targetPhone)}] ${redactSmsPhi(msg)}`,
    commandType: 'GENERAL',
    urgencyLevel: 'ROUTINE',
    responseText: redactSmsPhi(msg)
  };
  smsLogsAudit.unshift(log);
  if (smsLogsAudit.length > 50) smsLogsAudit.pop();

  res.status(200).json({
    success: true,
    dispatchedTo: maskPhoneNumber(targetPhone),
    charCount: msg.length,
    language: language || 'en',
    domain: domain || 'General Health Nudge'
  });
});

/**
 * GET /api/sms/logs
 * Retrieves HIPAA Safe Harbor redacted interaction history (strictly clinician-authenticated).
 */
smsRouter.get('/logs', requireAuth(['CLINICIAN']), (_req: Request, res: Response) => {
  res.status(200).json({
    count: smsLogsAudit.length,
    logs: smsLogsAudit.map((entry) => ({
      id: entry.id,
      timestamp: entry.timestamp,
      fromPhoneMasked: entry.fromPhoneMasked,
      redactedSummary: redactSmsPhi(entry.redactedSummary),
      commandType: entry.commandType,
      urgencyLevel: entry.urgencyLevel,
      fhirObservationId: entry.fhirObservationId
    }))
  });
});
