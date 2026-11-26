// SPDX-License-Identifier: Apache-2.0
import { Router } from 'express';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { GoogleAuth } from 'google-auth-library';
import { Readable } from 'stream';
import { ReadableStream } from 'stream/web';
import { requireAuth, isStrictProductionEnv } from './middleware/auth-guard';

export const dicomRouter = Router();

const isTestingEnv =
  !isStrictProductionEnv() &&
  Boolean(process.env['PLAYWRIGHT_TESTING'] || process.env['NODE_ENV'] === 'test' || process.env['VITEST']);

// Rate limiting: 60 requests per minute per IP for all DICOM proxy routes
dicomRouter.use(rateLimit({
  windowMs: 60_000,
  max: isTestingEnv ? 100_000 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: { error: 'Too many DICOM requests. Please try again later.' }
}));

// Require authenticated clinician/admin session on all DICOM imaging routes
dicomRouter.use(requireAuth(['CLINICIAN']));

// Initialize Google Auth with the Healthcare API scope
let _auth: GoogleAuth | null = null;
function getAuth(): GoogleAuth {
  if (!_auth) {
    _auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-healthcare']
    });
  }
  return _auth;
}

function sanitizeUrl(urlStr: string): URL {
  const parsed = new URL(urlStr);
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'healthcare.googleapis.com') {
    throw new Error('SSRF Blocked: URL target is not authorized.');
  }
  if (!parsed.pathname.startsWith('/v1/projects/')) {
    throw new Error('SSRF Blocked: URL path is not authorized.');
  }
  if (parsed.pathname.includes('..')) {
    throw new Error('SSRF Blocked: Path traversal sequence rejected.');
  }
  return new URL(`https://healthcare.googleapis.com${parsed.pathname}${parsed.search}`);
}

/**
 * Sanitise a DICOM proxy parameter to prevent SSRF and path traversal.
 * Strictly forbids `..` segments and only allows alphanumerics, hyphens, underscores, and single dots.
 */
export function sanitiseDicomParam(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes('..') || trimmed.startsWith('.') || trimmed.endsWith('.')) {
    return null;
  }
  return /^[a-zA-Z0-9._\-]{1,128}$/.test(trimmed) ? trimmed : null;
}

/**
 * Validate a DICOM UID (digits and single dots only, per DICOM standard, no `..`).
 */
export function validateDicomUid(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes('..') || trimmed.endsWith('.')) return null;
  return /^\d[\d.]{0,63}$/.test(trimmed) ? trimmed : null;
}

/**
 * Resolves pinned server-side Healthcare API target configuration strictly from env vars.
 * Never allows callers to override project, location, dataset, or dicomStore via query parameters.
 */
function getPinnedDicomConfig(): {
  projectId: string | null;
  location: string | null;
  datasetId: string | null;
  dicomStoreId: string | null;
} {
  return {
    projectId: sanitiseDicomParam(process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT']),
    location: sanitiseDicomParam(process.env['HC_LOCATION'] || 'us-central1'),
    datasetId: sanitiseDicomParam(process.env['HC_DATASET']),
    dicomStoreId: sanitiseDicomParam(process.env['HC_DICOM_STORE'])
  };
}

/**
 * GET /api/dicom/studies
 * Proxy for searching DICOM studies via QIDO-RS.
 */
dicomRouter.get('/studies', async (req, res) => {
  try {
    const { projectId, location, datasetId, dicomStoreId } = getPinnedDicomConfig();

    if (!projectId || !location || !datasetId || !dicomStoreId) {
      return res.status(200).json([]);
    }

    // Pass along allowlisted safe QIDO-RS filter parameters only
    const allowedFilters = new Set(['PatientID', 'StudyDate', 'Modality', 'AccessionNumber', 'StudyInstanceUID', 'limit', 'offset']);
    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(req.query)) {
      if (!allowedFilters.has(k)) continue;
      const safe = sanitiseDicomParam(v);
      if (safe) searchParams.set(k, safe);
    }

    const dicomWebUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${location}/datasets/${datasetId}/dicomStores/${dicomStoreId}/dicomWeb/studies?${searchParams.toString()}`;

    const client = await getAuth().getClient();
    const token = await client.getAccessToken();

    const response = await fetch(sanitizeUrl(dicomWebUrl).href, {
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Accept': 'application/dicom+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Healthcare API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 'private, no-store');
    res.json(data);
  } catch (error: any) {
    console.error('[DICOM] Proxy Error (Studies):', error.message);
    res.status(500).json({ error: 'DICOM proxy error.' });
  }
});

/**
 * GET /api/dicom/rendered
 * Proxy for retrieving rendered JPEGs via WADO-RS (strictly private, no-store for PHI protection).
 */
dicomRouter.get('/rendered', async (req, res) => {
  try {
    const { projectId, location, datasetId, dicomStoreId } = getPinnedDicomConfig();
    const studyUid = validateDicomUid(req.query['studyUid']);
    const seriesUid = validateDicomUid(req.query['seriesUid']);
    const instanceUid = validateDicomUid(req.query['instanceUid']);

    if (!projectId || !location || !datasetId || !dicomStoreId || !studyUid || !seriesUid || !instanceUid) {
      return res.status(400).json({ error: 'Missing or invalid required parameters.' });
    }

    const dicomWebUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${location}/datasets/${datasetId}/dicomStores/${dicomStoreId}/dicomWeb/studies/${studyUid}/series/${seriesUid}/instances/${instanceUid}/rendered`;

    const client = await getAuth().getClient();
    const token = await client.getAccessToken();

    const response = await fetch(sanitizeUrl(dicomWebUrl).href, {
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Accept': 'image/jpeg'
      }
    });

    if (!response.ok) {
      throw new Error(`Healthcare API Error: ${response.status} ${response.statusText}`);
    }

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'private, no-store');

    if (response.body) {
      Readable.fromWeb(response.body as ReadableStream).pipe(res);
    } else {
      res.end();
    }
  } catch (error: any) {
    console.error('[DICOM] Proxy Error (Rendered):', error.message);
    res.status(500).json({ error: 'DICOM proxy error.' });
  }
});

/**
 * POST /api/dicom/store
 * Proxy for storing DICOM instances via STOW-RS.
 */
dicomRouter.post('/store', express.raw({ type: 'application/dicom', limit: '100mb' }), async (req, res) => {
  try {
    const { projectId, location, datasetId, dicomStoreId } = getPinnedDicomConfig();

    if (!projectId || !location || !datasetId || !dicomStoreId) {
      return res.status(400).json({ error: 'Missing required server DICOM store configuration.' });
    }

    const dicomWebUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${location}/datasets/${datasetId}/dicomStores/${dicomStoreId}/dicomWeb/studies`;

    const client = await getAuth().getClient();
    const token = await client.getAccessToken();

    const response = await fetch(sanitizeUrl(dicomWebUrl).href, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/dicom'
      },
      body: req.body
    });

    if (!response.ok) {
      throw new Error(`Healthcare API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('[DICOM] Proxy Error (Store):', error.message);
    res.status(500).json({ error: 'DICOM proxy error.' });
  }
});

/**
 * GET /api/dicom/raw
 * Proxy for retrieving raw DICOM binaries via WADO-RS (strictly private, no-store).
 */
dicomRouter.get('/raw', async (req, res) => {
  try {
    const { projectId, location, datasetId, dicomStoreId } = getPinnedDicomConfig();
    const studyUid = validateDicomUid(req.query['studyUid']);
    const seriesUid = validateDicomUid(req.query['seriesUid']);
    const instanceUid = validateDicomUid(req.query['instanceUid']);

    if (!projectId || !location || !datasetId || !dicomStoreId || !studyUid || !seriesUid || !instanceUid) {
      return res.status(400).json({ error: 'Missing or invalid required parameters.' });
    }

    const dicomWebUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${location}/datasets/${datasetId}/dicomStores/${dicomStoreId}/dicomWeb/studies/${studyUid}/series/${seriesUid}/instances/${instanceUid}`;

    const client = await getAuth().getClient();
    const token = await client.getAccessToken();

    const response = await fetch(sanitizeUrl(dicomWebUrl).href, {
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Accept': 'application/dicom; transfer-syntax=*'
      }
    });

    if (!response.ok) {
      throw new Error(`Healthcare API Error: ${response.status} ${response.statusText}`);
    }

    res.setHeader('Content-Type', 'application/dicom');
    res.setHeader('Cache-Control', 'private, no-store');

    if (response.body) {
      Readable.fromWeb(response.body as ReadableStream).pipe(res);
    } else {
      res.end();
    }
  } catch (error: any) {
    console.error('[DICOM] Proxy Error (Raw):', error.message);
    res.status(500).json({ error: 'DICOM proxy error.' });
  }
});

/**
 * DELETE /api/dicom/delete
 * Proxy for deleting DICOM studies, series, or instances.
 */
dicomRouter.delete('/delete', async (req, res) => {
  try {
    const { projectId, location, datasetId, dicomStoreId } = getPinnedDicomConfig();
    const studyUid = validateDicomUid(req.query['studyUid']);
    const seriesUid = validateDicomUid(req.query['seriesUid']);
    const instanceUid = validateDicomUid(req.query['instanceUid']);

    if (!projectId || !location || !datasetId || !dicomStoreId || !studyUid) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    let dicomWebUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${location}/datasets/${datasetId}/dicomStores/${dicomStoreId}/dicomWeb/studies/${studyUid}`;
    if (seriesUid) {
      dicomWebUrl += `/series/${seriesUid}`;
      if (instanceUid) {
        dicomWebUrl += `/instances/${instanceUid}`;
      }
    }

    const client = await getAuth().getClient();
    const token = await client.getAccessToken();

    const response = await fetch(sanitizeUrl(dicomWebUrl), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Healthcare API Error: ${response.status} ${response.statusText}`);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('[DICOM] Proxy Error (Delete):', error.message);
    res.status(500).json({ error: 'DICOM proxy error.' });
  }
});
