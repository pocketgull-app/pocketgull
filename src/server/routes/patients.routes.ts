// SPDX-License-Identifier: Apache-2.0
/**
 * Patient CRUD Routes — Hardened Clinician-Authenticated Patient Store.
 *
 * Security invariants:
 * - Strictly requires verified clinician/admin authentication on all endpoints (`requireAuth`).
 * - Disables plaintext disk persistence (`data/patients.json`) in production (`isStrictProductionEnv()`),
 *   operating strictly on an ephemeral in-memory store with zero ePHI disk writes.
 * - Enforces cryptographic M-of-N Dual-Custody (`verifyDualCustody`) on bulk exports > 50 records.
 * - Strips direct PHI identifiers (names, exact birthdates, contact info, raw MRNs) from FHIR R4 exports
 *   per HIPAA Safe Harbor §164.514.
 *
 * @module server/routes/patients.routes
 */
import { Router, json as expressJson } from 'express';
import type { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import crypto from 'node:crypto';
import { sanitizeLogInput, securePathResolve } from '../../utils/security-helper';
import { SoarOrchestratorService } from '../services/soar-orchestrator.service';
import { requireAuth, isStrictProductionEnv } from '../middleware/auth-guard';

/** Allowlisted patient fields — only these keys survive sanitization. */
const ALLOWED_PATIENT_FIELDS = [
  'id', 'name', 'age', 'gender', 'vitals', 'symptoms',
  'history', 'conditions', 'carePlan', 'metrics',
  'demographics', 'assessment'
] as const;

/** Maximum database file size (10 MB). */
const MAX_DB_BYTES = 10 * 1024 * 1024;

/** Mandiant Anti-Whaling threshold: bulk FHIR export > 50 records requires M-of-N Dual-Custody. */
const BULK_EXPORT_DUAL_CUSTODY_THRESHOLD = 50;

/** Maximum patient ID length. */
const PATIENT_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

// Ephemeral in-memory store used exclusively in production (zero plaintext ePHI disk writes)
let ephemeralProductionPatients: Record<string, unknown>[] = [];

function getSafePatientsDbPath(): string {
  const dir = securePathResolve(process.cwd(), 'data');
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException)?.code !== 'EEXIST') {
      console.warn('[PatientsRoutes] mkdirSync failed:', e);
    }
  }
  return securePathResolve(dir, 'patients.json');
}

function getSafePatientsSeedPath(): string {
  const dir = securePathResolve(process.cwd(), 'data');
  return securePathResolve(dir, 'patients.seed.json');
}

/**
 * Strips unknown keys and prototype pollution vectors from a patient object.
 * Only keys in ALLOWED_PATIENT_FIELDS survive.
 */
function cleanPatientObj(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return {};
  const clean: Record<string, unknown> = {};
  for (const k of Object.keys(raw as Record<string, unknown>)) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
    if (Object.prototype.hasOwnProperty.call(raw, k) && (ALLOWED_PATIENT_FIELDS as readonly string[]).includes(k)) {
      clean[k] = (raw as Record<string, unknown>)[k];
    }
  }
  return clean;
}

/**
 * Safely serializes patient data to a bounded, ASCII-safe buffer.
 */
function safeSerialize(data: unknown): Buffer {
  const json = JSON.stringify(data, null, 2).replace(/[^\x20-\x7E\r\n\t]/g, '');
  const safeLen = Math.min(json.length, MAX_DB_BYTES) | 0;
  const buf = Buffer.alloc(safeLen);
  for (let i = 0; (i | 0) < (safeLen | 0); i++) {
    buf.writeUInt8((json.charCodeAt(i) & 0x7f) | 0, i);
  }
  return buf;
}

/**
 * Atomically writes a serialized buffer via a CSPRNG temporary sibling file + rename (dev/test only).
 */
async function atomicWriteDbFile(targetPath: string, payload: Buffer): Promise<void> {
  const dir = securePathResolve(process.cwd(), 'data');
  const tmpName = `patients.${crypto.randomBytes(6).toString('hex')}.tmp`;
  const tmpPath = securePathResolve(dir, tmpName);
  await fsPromises.writeFile(tmpPath, payload);
  await fsPromises.rename(tmpPath, targetPath);
}

/**
 * Scrubs direct HIPAA Safe Harbor §164.514 PHI strings (SSN, email, phone, MRN, exact dates) from clinical text.
 */
function scrubPhiString(raw: string): string {
  return raw
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[REDACTED_PHONE]')
    .replace(/\bMRN[#:\s-]?\d{4,12}\b/gi, '[REDACTED_MRN]');
}

/**
 * Pseudonymizes raw patient IDs that could carry an MRN or email while preserving anonymized tokens.
 */
function pseudonymizeFhirPatientId(rawId: unknown): string {
  const str = String(rawId || 'anonymous').trim();
  if (/^(?:anon_|pt-|p0\d{2}$)/i.test(str)) {
    return str;
  }
  return 'anon_' + crypto.createHash('sha256').update(str, 'utf8').digest('hex').slice(0, 12);
}

async function readPatientsStore(): Promise<Record<string, unknown>[]> {
  if (isStrictProductionEnv()) {
    return ephemeralProductionPatients;
  }
  const dbPath = getSafePatientsDbPath();
  try {
    const data = await fsPromises.readFile(dbPath, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (readErr: unknown) {
    if (readErr instanceof Error && 'code' in readErr && (readErr as NodeJS.ErrnoException).code === 'ENOENT') {
      try {
        const seedRaw = await fsPromises.readFile(getSafePatientsSeedPath(), 'utf8');
        const parsedSeed = JSON.parse(seedRaw);
        const list = Array.isArray(parsedSeed) ? parsedSeed : [];
        await atomicWriteDbFile(dbPath, safeSerialize(list));
        return list;
      } catch {
        await atomicWriteDbFile(dbPath, safeSerialize([]));
        return [];
      }
    }
    throw readErr;
  }
}

async function writePatientsStore(patients: Record<string, unknown>[]): Promise<void> {
  if (isStrictProductionEnv()) {
    ephemeralProductionPatients = patients;
    return;
  }
  const targetDbFile = getSafePatientsDbPath();
  await atomicWriteDbFile(targetDbFile, safeSerialize(patients));
}

export function createPatientsRouter(): Router {
  const router = Router();

  const isTestingEnv =
    !isStrictProductionEnv() &&
    Boolean(process.env['PLAYWRIGHT_TESTING'] || process.env['NODE_ENV'] === 'test' || process.env['VITEST']);

  const limiter = rateLimit({
    windowMs: 60_000,
    max: isTestingEnv ? 100_000 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
    message: { error: 'Too many requests. Please try again later.' }
  });

  // Enforce authenticated clinician/admin session across all patient endpoints
  router.use(requireAuth(['CLINICIAN']));

  // GET /api/patients
  router.get('/', limiter, async (_req: Request, res: Response) => {
    try {
      const patients = await readPatientsStore();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.json(patients);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[API] Error reading patients database:', sanitizeLogInput(message));
      res.status(500).json({ error: 'Internal server error while reading database' });
    }
  });

  // POST /api/patients (bulk write — bounded to 10 MB)
  router.post('/', limiter, expressJson({ limit: '10mb' }), async (req: Request, res: Response) => {
    try {
      const rawBody: unknown = req.body;
      if (!Array.isArray(rawBody)) {
        return res.status(400).json({ error: 'Body must be a JSON array of patients' });
      }

      const sanitizedArray = rawBody.map((item: unknown) => cleanPatientObj(item));
      await writePatientsStore(sanitizedArray);

      const totalCount = Number(sanitizedArray.length) || 0;
      console.log('[API] Saved %d patients to store (mode=%s).', totalCount, isStrictProductionEnv() ? 'ephemeral-memory' : 'local-dev-file');
      return res.status(200).json({ success: true, count: totalCount });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[API] Error saving patients database:', sanitizeLogInput(message));
      return res.status(500).json({ error: 'Internal server error while saving database' });
    }
  });

  // PUT /api/patients/:id (upsert — bounded to 10 MB)
  router.put('/:id', limiter, expressJson({ limit: '10mb' }), async (req: Request, res: Response) => {
    try {
      const rawIdStr = String(req.params['id'] || '');
      if (!PATIENT_ID_PATTERN.test(rawIdStr)) {
        return res.status(400).json({ error: 'Invalid patient ID format' });
      }
      const id = rawIdStr;

      const rawBody: unknown = req.body;
      if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
        return res.status(400).json({ error: 'Body must be a JSON object representing the patient' });
      }

      let patients: Record<string, unknown>[] = [];
      try {
        patients = await readPatientsStore();
      } catch (e) {
        console.debug('[PatientsRoutes] Empty patient store on upsert:', e instanceof SyntaxError ? 'invalid JSON' : 'uninitialized');
      }

      const index = patients.findIndex((p) => p['id'] === id);
      const sanitizedPayload = cleanPatientObj(rawBody);

      if (index !== -1) {
        patients[index] = { ...patients[index], ...sanitizedPayload, id };
      } else {
        patients.push({ ...sanitizedPayload, id });
      }

      await writePatientsStore(patients);
      const safePatientId = id.replace(/[\r\n\t]/g, '_').replace(/[^\x20-\x7E]/g, '');
      console.log('[API] Synced patient %s.', safePatientId);
      return res.status(200).json({ success: true, patient: patients.find((p) => p['id'] === id) });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[API] Error syncing patient to database:', sanitizeLogInput(message));
      return res.status(500).json({ error: 'Internal server error while syncing patient' });
    }
  });

  // GET /api/patients/export/fhir (HIPAA Safe Harbor FHIR R4 Bundle export + Cryptographic M-of-N Dual-Custody Anti-Whaling Guard)
  router.get('/export/fhir', limiter, async (req: Request, res: Response) => {
    try {
      let patients: Record<string, unknown>[] = [];
      try {
        patients = await readPatientsStore();
      } catch {
        patients = [];
      }

      // Mandiant Anti-Whaling Gate: Bulk record export (> 50 patients) requires cryptographic Dual-Custody tokens
      if (patients.length > BULK_EXPORT_DUAL_CUSTODY_THRESHOLD) {
        const headers = (req.headers || {}) as Record<string, unknown>;
        const requestorToken =
          typeof headers['x-dual-custody-requestor-token'] === 'string'
            ? headers['x-dual-custody-requestor-token']
            : '';
        const authorizerToken =
          typeof headers['x-dual-custody-authorizer-token'] === 'string'
            ? headers['x-dual-custody-authorizer-token']
            : '';
        const rationale =
          typeof headers['x-dual-custody-rationale'] === 'string'
            ? headers['x-dual-custody-rationale']
            : 'Bulk FHIR R4 export';

        const verification = SoarOrchestratorService.verifyDualCustody({
          requestorToken,
          authorizerToken,
          rationale
        });

        if (!verification.verified) {
          return res.status(403).json({
            error: `Anti-Whaling Guard: Bulk FHIR export of ${patients.length} records (> ${BULK_EXPORT_DUAL_CUSTODY_THRESHOLD}) requires cryptographic M-of-N Dual-Custody tokens.`,
            reason: verification.reason,
            requiredHeaders: ['X-Dual-Custody-Requestor-Token', 'X-Dual-Custody-Authorizer-Token']
          });
        }
      }

      const fhirEntries = patients.map((p) => {
        const pId = pseudonymizeFhirPatientId(p['id']);
        const entries: Array<Record<string, unknown>> = [];

        // 1. De-identified Patient Resource (HIPAA Safe Harbor §164.514 — zero name/DOB/address/phone/email)
        const ageNum = typeof p['age'] === 'number' && Number.isFinite(p['age']) ? p['age'] : undefined;
        const safeAgeBracket =
          ageNum === undefined
            ? undefined
            : ageNum >= 90
              ? '90+'
              : `${Math.floor(Math.max(0, ageNum) / 5) * 5}-${Math.floor(Math.max(0, ageNum) / 5) * 5 + 4}y`;

        entries.push({
          fullUrl: `urn:uuid:${pId}`,
          resource: {
            resourceType: 'Patient',
            id: pId,
            active: true,
            gender: p['gender'] || 'unknown',
            ...(safeAgeBracket ? {
              extension: [{
                url: 'https://pocketgull.app/fhir/StructureDefinition/safe-harbor-age-bracket',
                valueString: safeAgeBracket
              }]
            } : {}),
            meta: {
              profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient'],
              security: [{
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
                code: 'PSEUDED',
                display: 'HIPAA Safe Harbor §164.514 De-Identified'
              }],
              lastUpdated: new Date().toISOString()
            }
          }
        });

        // 2. Observations for Vitals
        if (p['vitals'] && typeof p['vitals'] === 'object') {
          const vitals = p['vitals'] as Record<string, unknown>;
          for (const [vKey, vVal] of Object.entries(vitals)) {
            if (vVal === null || vVal === undefined) continue;
            entries.push({
              fullUrl: `urn:uuid:${pId}-obs-${vKey}`,
              resource: {
                resourceType: 'Observation',
                status: 'final',
                category: [{
                  coding: [{
                    system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                    code: 'vital-signs',
                    display: 'Vital Signs'
                  }]
                }],
                code: {
                  coding: [{
                    system: 'http://loinc.org',
                    code: vKey === 'heartRate' ? '8867-4' : vKey === 'spO2' ? '59408-5' : '9279-1',
                    display: vKey
                  }]
                },
                subject: { reference: `urn:uuid:${pId}` },
                effectiveDateTime: new Date().toISOString(),
                valueQuantity: typeof vVal === 'number' ? { value: vVal, unit: vKey === 'heartRate' ? 'beats/min' : '%' } : undefined,
                valueString: typeof vVal === 'string' ? scrubPhiString(vVal) : undefined
              }
            });
          }
        }

        // 3. Conditions (PHI-scrubbed text)
        if (Array.isArray(p['conditions'])) {
          p['conditions'].forEach((c: unknown, idx: number) => {
            const rawName = typeof c === 'string' ? c : (c as { name?: string })?.name || 'Clinical Observation';
            const condName = scrubPhiString(rawName);
            entries.push({
              fullUrl: `urn:uuid:${pId}-cond-${idx}`,
              resource: {
                resourceType: 'Condition',
                clinicalStatus: {
                  coding: [{
                    system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                    code: 'active'
                  }]
                },
                subject: { reference: `urn:uuid:${pId}` },
                code: { text: condName },
                recordedDate: new Date().toISOString()
              }
            });
          });
        }

        return entries;
      }).flat();

      const rawBundleJson = JSON.stringify(fhirEntries);
      const sha256Digest = crypto.createHash('sha256').update(rawBundleJson).digest('hex');

      const fhirBundle = {
        resourceType: 'Bundle',
        type: 'collection',
        timestamp: new Date().toISOString(),
        total: fhirEntries.length,
        meta: {
          tag: [
            { system: 'https://pocketgull.app/fhir/sovereignty', code: 'FVEY-COMPLIANT' },
            { system: 'https://pocketgull.app/fhir/safe-harbor', code: 'HIPAA-164.514-DEIDENTIFIED' },
            { system: 'https://pocketgull.app/fhir/integrity-sha256', code: sha256Digest }
          ]
        },
        entry: fhirEntries
      };

      res.setHeader('Content-Type', 'application/fhir+json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-FHIR-Integrity-SHA256', sha256Digest);
      res.status(200).json(fhirBundle);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[API] Error exporting FHIR R4 Bundle:', sanitizeLogInput(message));
      res.status(500).json({ error: 'Internal server error while exporting FHIR bundle' });
    }
  });

  return router;
}
