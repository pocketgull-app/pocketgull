import { Router } from 'express';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { GoogleAuth } from 'google-auth-library';
import { Readable } from 'stream';
import { ReadableStream } from 'stream/web';

export const dicomRouter = Router();

// Rate limiting: 60 requests per minute per IP for all DICOM proxy routes
dicomRouter.use(rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: { error: 'Too many DICOM requests. Please try again later.' }
}));

// Initialize Google Auth with the Healthcare API scope
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-healthcare']
});

function sanitizeUrl(urlStr: string): URL {
  const parsed = new URL(urlStr);
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'healthcare.googleapis.com') {
    throw new Error('SSRF Blocked: URL target is not authorized.');
  }
  if (!parsed.pathname.startsWith('/v1/projects/')) {
    throw new Error('SSRF Blocked: URL path is not authorized.');
  }
  return new URL(`https://healthcare.googleapis.com${parsed.pathname}${parsed.search}`);
}


/**
 * Sanitise a DICOM proxy parameter to prevent SSRF.
 * Only allows alphanumerics, hyphens, underscores, and dots.
 * Returns null if the value is absent or contains illegal characters after stripping.
 */
function sanitiseDicomParam(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return /^[a-zA-Z0-9._\-]+$/.test(trimmed) ? trimmed : null;
}

/**
 * Validate a DICOM UID (digits and dots only, per DICOM standard).
 */
function validateDicomUid(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return /^\d[\d.]{0,63}$/.test(trimmed) ? trimmed : null;
}

/** Resolve project/location from query param with env var fallback, sanitised. */
function resolveParam(queryVal: unknown, envVal: string | undefined, fallback?: string): string | null {
  const raw = queryVal ?? envVal ?? fallback;
  return sanitiseDicomParam(raw);
}

/**
 * GET /api/dicom/studies
 * Proxy for searching DICOM studies via QIDO-RS.
 */
dicomRouter.get('/studies', async (req, res) => {
  try {
    const projectId  = resolveParam(req.query['project'],   process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT']);
    const location   = resolveParam(req.query['location'],  process.env['HC_LOCATION'], 'us-central1');
    const datasetId  = resolveParam(req.query['dataset'],   process.env['HC_DATASET']);
    const dicomStoreId = resolveParam(req.query['dicomStore'], process.env['HC_DICOM_STORE']);

    if (!projectId || !datasetId || !dicomStoreId) {
      // Missing config — return empty array rather than noisy 400 in unconfigured demo environments.
      return res.status(200).json([]);
    }

    // Pass along safe query parameters for filtering (PatientName, PatientID, etc.)
    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(req.query)) {
      if (['project', 'location', 'dataset', 'dicomStore'].includes(k)) continue;
      const safe = sanitiseDicomParam(v);
      if (safe) searchParams.set(k, safe);
    }

    const dicomWebUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${location}/datasets/${datasetId}/dicomStores/${dicomStoreId}/dicomWeb/studies?${searchParams.toString()}`;

    const client = await auth.getClient();
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
    res.json(data);
  } catch (error: any) {
    console.error('[DICOM] Proxy Error (Studies):', error.message);
    res.status(500).json({ error: 'DICOM proxy error.' });
  }
});

/**
 * GET /api/dicom/rendered
 * Proxy for retrieving rendered JPEGs via WADO-RS.
 */
dicomRouter.get('/rendered', async (req, res) => {
  try {
    const projectId    = resolveParam(req.query['project'],    process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT']);
    const location     = resolveParam(req.query['location'],   process.env['HC_LOCATION'], 'us-central2');
    const datasetId    = resolveParam(req.query['dataset'],    process.env['HC_DATASET']);
    const dicomStoreId = resolveParam(req.query['dicomStore'], process.env['HC_DICOM_STORE']);
    const studyUid     = validateDicomUid(req.query['studyUid']);
    const seriesUid    = validateDicomUid(req.query['seriesUid']);
    const instanceUid  = validateDicomUid(req.query['instanceUid']);

    if (!projectId || !datasetId || !dicomStoreId || !studyUid || !seriesUid || !instanceUid) {
      return res.status(400).json({ error: 'Missing or invalid required parameters.' });
    }

    const dicomWebUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${location}/datasets/${datasetId}/dicomStores/${dicomStoreId}/dicomWeb/studies/${studyUid}/series/${seriesUid}/instances/${instanceUid}/rendered`;

    const client = await auth.getClient();
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
    res.setHeader('Cache-Control', 'public, max-age=86400');

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
    const projectId    = resolveParam(req.query['project'],    process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT']);
    const location     = resolveParam(req.query['location'],   process.env['HC_LOCATION'], 'us-central2');
    const datasetId    = resolveParam(req.query['dataset'],    process.env['HC_DATASET']);
    const dicomStoreId = resolveParam(req.query['dicomStore'], process.env['HC_DICOM_STORE']);

    if (!projectId || !datasetId || !dicomStoreId) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const dicomWebUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${location}/datasets/${datasetId}/dicomStores/${dicomStoreId}/dicomWeb/studies`;

    const client = await auth.getClient();
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
 * Proxy for retrieving raw DICOM binaries via WADO-RS.
 */
dicomRouter.get('/raw', async (req, res) => {
  try {
    const projectId    = resolveParam(req.query['project'],    process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT']);
    const location     = resolveParam(req.query['location'],   process.env['HC_LOCATION'], 'us-central2');
    const datasetId    = resolveParam(req.query['dataset'],    process.env['HC_DATASET']);
    const dicomStoreId = resolveParam(req.query['dicomStore'], process.env['HC_DICOM_STORE']);
    const studyUid     = validateDicomUid(req.query['studyUid']);
    const seriesUid    = validateDicomUid(req.query['seriesUid']);
    const instanceUid  = validateDicomUid(req.query['instanceUid']);

    if (!projectId || !datasetId || !dicomStoreId || !studyUid || !seriesUid || !instanceUid) {
      return res.status(400).json({ error: 'Missing or invalid required parameters.' });
    }

    const dicomWebUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${location}/datasets/${datasetId}/dicomStores/${dicomStoreId}/dicomWeb/studies/${studyUid}/series/${seriesUid}/instances/${instanceUid}`;

    const client = await auth.getClient();
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
    const projectId    = resolveParam(req.query['project'],    process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT']);
    const location     = resolveParam(req.query['location'],   process.env['HC_LOCATION'], 'us-central2');
    const datasetId    = resolveParam(req.query['dataset'],    process.env['HC_DATASET']);
    const dicomStoreId = resolveParam(req.query['dicomStore'], process.env['HC_DICOM_STORE']);
    const studyUid     = validateDicomUid(req.query['studyUid']);
    const seriesUid    = validateDicomUid(req.query['seriesUid']);
    const instanceUid  = validateDicomUid(req.query['instanceUid']);

    if (!projectId || !datasetId || !dicomStoreId || !studyUid) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    let dicomWebUrl = `https://healthcare.googleapis.com/v1/projects/${projectId}/locations/${location}/datasets/${datasetId}/dicomStores/${dicomStoreId}/dicomWeb/studies/${studyUid}`;
    if (seriesUid) {
      dicomWebUrl += `/series/${seriesUid}`;
      if (instanceUid) {
        dicomWebUrl += `/instances/${instanceUid}`;
      }
    }

    const client = await auth.getClient();
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
