// SPDX-License-Identifier: Apache-2.0
/**
 * Patient CRUD Routes — JSON file-backed patient database.
 *
 * Extracted from server.ts to reduce monolith size.
 * Uses strict allowlist field filtering, prototype pollution prevention,
 * atomic async file persistence, and Mandiant M-of-N Dual-Custody Anti-Whaling export gates.
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

// ── Typed Interfaces (P0-B: `:any` resolution) ─────────────────────────

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

// ── Helpers ─────────────────────────────────────────────────────────────

function getSafePatientsDbPath(): string {
  const dir = securePathResolve(process.cwd(), 'data');
  try { fs.mkdirSync(dir, { recursive: true }); } catch (e: unknown) { if ((e as NodeJS.ErrnoException)?.code !== 'EEXIST') console.warn('[PatientsRoutes] mkdirSync failed:', e); }
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
 * Atomically writes a serialized buffer via a CSPRNG temporary sibling file + rename.
 */
async function atomicWriteDbFile(targetPath: string, payload: Buffer): Promise<void> {
  const dir = securePathResolve(process.cwd(), 'data');
  const tmpName = `patients.${crypto.randomBytes(6).toString('hex')}.tmp`;
  const tmpPath = securePathResolve(dir, tmpName);
  await fsPromises.writeFile(tmpPath, payload);
  await fsPromises.rename(tmpPath, targetPath);
}

// ── Factory: Creates the patients router ────────────────────────────────

export function createPatientsRouter(): Router {
  const router = Router();

  const isTestingEnv = Boolean(process.env['CI'] || process.env['PLAYWRIGHT_TESTING'] || process.env['NODE_ENV'] === 'test');

  const limiter = rateLimit({
    windowMs: 60_000,
    max: isTestingEnv || process.env['NODE_ENV'] !== 'production' ? 100_000 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
    message: { error: 'Too many requests. Please try again later.' }
  });

  // GET /api/patients
  router.get('/', limiter, async (_req: Request, res: Response) => {
    try {
      const dbPath = getSafePatientsDbPath();
      let data: string;
      try {
        data = await fsPromises.readFile(dbPath, 'utf8');
      } catch (readErr: unknown) {
        if (readErr instanceof Error && 'code' in readErr && (readErr as NodeJS.ErrnoException).code === 'ENOENT') {
          try {
            data = await fsPromises.readFile(getSafePatientsSeedPath(), 'utf8');
            const parsedSeed = JSON.parse(data);
            await atomicWriteDbFile(dbPath, safeSerialize(Array.isArray(parsedSeed) ? parsedSeed : []));
          } catch {
            data = JSON.stringify([], null, 2);
            await atomicWriteDbFile(dbPath, safeSerialize([]));
          }
        } else {
          throw readErr;
        }
      }
      res.setHeader('Content-Type', 'application/json');
      res.send(data);
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

      const targetDbFile = getSafePatientsDbPath();
      await atomicWriteDbFile(targetDbFile, safeSerialize(sanitizedArray));

      const totalCount = Number(sanitizedArray.length) || 0;
      console.log('[API] Saved %d patients to database.', totalCount);
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

      const targetDbFile = getSafePatientsDbPath();
      let patients: Record<string, unknown>[] = [];
      try {
        const data = await fsPromises.readFile(targetDbFile, 'utf8');
        patients = JSON.parse(data);
      } catch (e) { console.debug('[PatientsRoutes] No existing patients.json (first run):', e instanceof SyntaxError ? 'invalid JSON' : 'file missing'); }

      const index = patients.findIndex((p) => p['id'] === id);
      const sanitizedPayload = cleanPatientObj(rawBody);

      if (index !== -1) {
        patients[index] = { ...patients[index], ...sanitizedPayload, id };
      } else {
        patients.push({ ...sanitizedPayload, id });
      }

      await atomicWriteDbFile(targetDbFile, safeSerialize(patients));
      const safePatientId = id.replace(/[\r\n\t]/g, '_').replace(/[^\x20-\x7E]/g, '');
      console.log('[API] Synced patient %s from mobile/app to database.', safePatientId);
      return res.status(200).json({ success: true, patient: patients.find((p) => p['id'] === id) });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[API] Error syncing patient to database:', sanitizeLogInput(message));
      return res.status(500).json({ error: 'Internal server error while syncing patient' });
    }
  });

  // GET /api/patients/export/fhir (FHIR R4 Bundle export with SHA-256 integrity seal & M-of-N Anti-Whaling Guard)
  router.get('/export/fhir', limiter, async (req: Request, res: Response) => {
    try {
      const dbPath = getSafePatientsDbPath();
      let patients: Record<string, unknown>[] = [];
      try {
        const data = await fsPromises.readFile(dbPath, 'utf8');
        const parsed = JSON.parse(data);
        patients = Array.isArray(parsed) ? parsed : [];
      } catch {
        patients = [];
      }

      // Mandiant Anti-Whaling Gate: Bulk record export (> 50 patients) requires M-of-N Dual-Custody headers
      if (patients.length > BULK_EXPORT_DUAL_CUSTODY_THRESHOLD) {
        const headers = (req.headers || {}) as Record<string, unknown>;
        const requestorRole = typeof headers['x-dual-custody-requestor'] === 'string' ? headers['x-dual-custody-requestor'] : '';
        const authorizerRole = typeof headers['x-dual-custody-authorizer'] === 'string' ? headers['x-dual-custody-authorizer'] : '';
        const rationale = typeof headers['x-dual-custody-rationale'] === 'string' ? headers['x-dual-custody-rationale'] : 'Bulk FHIR R4 export';

        const verification = SoarOrchestratorService.verifyDualCustody({
          requestorRole,
          authorizerRole,
          rationale
        });

        if (!verification.verified) {
          return res.status(403).json({
            error: `Anti-Whaling Guard: Bulk FHIR export of ${patients.length} records (> ${BULK_EXPORT_DUAL_CUSTODY_THRESHOLD}) requires M-of-N Dual-Custody co-authorization.`,
            reason: verification.reason,
            requiredHeaders: ['X-Dual-Custody-Requestor', 'X-Dual-Custody-Authorizer']
          });
        }
      }

      const fhirEntries = patients.map((p) => {
        const pId = String(p['id'] || 'anonymous');
        const entries: Array<Record<string, unknown>> = [];

        // 1. Patient Resource
        entries.push({
          fullUrl: `urn:uuid:${pId}`,
          resource: {
            resourceType: 'Patient',
            id: pId,
            active: true,
            gender: p['gender'] || 'unknown',
            meta: {
              profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient'],
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
                valueString: typeof vVal === 'string' ? vVal : undefined
              }
            });
          }
        }

        // 3. Conditions
        if (Array.isArray(p['conditions'])) {
          p['conditions'].forEach((c: any, idx: number) => {
            const condName = typeof c === 'string' ? c : c?.name || 'Clinical Observation';
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
            { system: 'https://pocketgull.app/fhir/integrity-sha256', code: sha256Digest }
          ]
        },
        entry: fhirEntries
      };

      res.setHeader('Content-Type', 'application/fhir+json; charset=utf-8');
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
