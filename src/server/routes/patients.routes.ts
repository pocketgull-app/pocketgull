/**
 * Patient CRUD Routes — JSON file-backed patient database.
 *
 * Extracted from server.ts to reduce monolith size.
 * Uses strict allowlist field filtering and prototype pollution prevention.
 *
 * @module server/routes/patients.routes
 */
import { Router, json as expressJson } from 'express';
import type { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import fs from 'node:fs';
import { join } from 'node:path';
import { sanitizeLogInput, securePathResolve } from '../../utils/security-helper';

// ── Typed Interfaces (P0-B: `:any` resolution) ─────────────────────────

/** Allowlisted patient fields — only these keys survive sanitization. */
const ALLOWED_PATIENT_FIELDS = [
  'id', 'name', 'age', 'gender', 'vitals', 'symptoms',
  'history', 'conditions', 'carePlan', 'metrics',
  'demographics', 'assessment'
] as const;

/** Maximum database file size (10 MB). */
const MAX_DB_BYTES = 10 * 1024 * 1024;

/** Maximum patient ID length. */
const PATIENT_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

// ── Helpers ─────────────────────────────────────────────────────────────

function getSafePatientsDbPath(): string {
  const dir = securePathResolve(process.cwd(), 'data');
  try { fs.mkdirSync(dir, { recursive: true }); } catch (e: any) { if (e?.code !== 'EEXIST') console.warn('[PatientsRoutes] mkdirSync failed:', e); }
  return securePathResolve(dir, 'patients.json');
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
  router.get('/', limiter, (req: Request, res: Response) => {
    try {
      const dbPath = getSafePatientsDbPath();
      let data: string;
      try {
        data = fs.readFileSync(dbPath, 'utf8');
      } catch (readErr: unknown) {
        if (readErr instanceof Error && 'code' in readErr && (readErr as NodeJS.ErrnoException).code === 'ENOENT') {
          data = JSON.stringify([], null, 2);
          fs.writeFileSync(dbPath, data);
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

  // POST /api/patients (bulk write)
  router.post('/', limiter, expressJson({ limit: '50mb' }), (req: Request, res: Response) => {
    try {
      const rawBody: unknown = req.body;
      if (!Array.isArray(rawBody)) {
        return res.status(400).json({ error: 'Body must be a JSON array of patients' });
      }

      const sanitizedArray = rawBody.map((item: unknown) => cleanPatientObj(item));

      const targetDbFile = getSafePatientsDbPath();
      fs.writeFileSync(targetDbFile, safeSerialize(sanitizedArray));

      const totalCount = Number(sanitizedArray.length) || 0;
      console.log('[API] Saved %d patients to database.', totalCount);
      res.status(200).json({ success: true, count: totalCount });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[API] Error saving patients database:', sanitizeLogInput(message));
      res.status(500).json({ error: 'Internal server error while saving database' });
    }
  });

  // PUT /api/patients/:id (upsert)
  router.put('/:id', limiter, expressJson({ limit: '50mb' }), (req: Request, res: Response) => {
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
        const data = fs.readFileSync(targetDbFile, 'utf8');
        patients = JSON.parse(data);
      } catch (e) { console.debug('[PatientsRoutes] No existing patients.json (first run):', e instanceof SyntaxError ? 'invalid JSON' : 'file missing'); }

      const index = patients.findIndex((p) => p['id'] === id);
      const sanitizedPayload = cleanPatientObj(rawBody);

      if (index !== -1) {
        patients[index] = { ...patients[index], ...sanitizedPayload, id };
      } else {
        patients.push({ ...sanitizedPayload, id });
      }

      fs.writeFileSync(targetDbFile, safeSerialize(patients));
      const safePatientId = id.replace(/[\r\n\t]/g, '_').replace(/[^\x20-\x7E]/g, '');
      console.log('[API] Synced patient %s from mobile/app to database.', safePatientId);
      res.status(200).json({ success: true, patient: patients.find((p) => p['id'] === id) });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[API] Error syncing patient to database:', sanitizeLogInput(message));
      res.status(500).json({ error: 'Internal server error while syncing patient' });
    }
  });

  return router;
}
