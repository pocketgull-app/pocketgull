/**
 * Utility Routes — PubMed proxy, ORCID lookup, WebMCP catalog,
 * health endpoints, hardware telemetry, and Swagger docs.
 *
 * Extracted from server.ts to reduce monolith size.
 *
 * @module server/routes/utility.routes
 */
import { Router, json as expressJson } from 'express';
import type { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'node:fs';
import { join, normalize } from 'node:path';
import { APP_VERSION } from '../../version';

// ── Typed Interfaces ────────────────────────────────────────────────────

/** ORCID mock profile for Phil Gear (developer fallback). */
interface IOrcidMockProfile {
  person: {
    name: { 'given-names': { value: string }; 'family-name': { value: string } };
    keywords: { keyword: Array<{ content: string }> };
    'researcher-urls': { 'researcher-url': Array<{ 'url-name': string; url: { value: string } }> };
  };
  'activities-summary': {
    works: {
      group: Array<{
        'work-summary': Array<{
          title: { title: { value: string } };
          url?: { value: string };
          type: string;
          'publication-date': { year: { value: string } };
        }>;
      }>;
    };
  };
}

// ── Factory Dependencies ────────────────────────────────────────────────

interface IUtilityRouteDeps {
  getApiKey: (req?: Request) => Promise<string>;
  rootDir: string;
}

// ── Factory: Creates the utility router ─────────────────────────────────

export function createUtilityRouter(deps: IUtilityRouteDeps): Router {
  const router = Router();
  const { getApiKey, rootDir } = deps;

  // ── OpenAPI Spec Loading ──────────────────────────────────────────────
  let openApiSpec: Record<string, unknown> = {};
  try {
    const possiblePaths = [
      join(rootDir, 'docs', 'openapi.json'),
      join(process.cwd(), 'docs', 'openapi.json')
    ];

    let specPath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        specPath = normalize(p);
        break;
      }
    }

    if (specPath) {
      openApiSpec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
    } else {
      throw new Error('docs/openapi.json not found in expected locations');
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.warn('[Swagger] Failed to load docs/openapi.json:', message);
  }

  // ── Swagger Auth Middleware ───────────────────────────────────────────
  const swaggerAuth = (req: Request, res: Response, next: NextFunction) => {
    const username = process.env['SWAGGER_USERNAME'] || 'dev-pocketgull';
    const password = process.env['SWAGGER_PASSWORD'] || 'admin-secure-pocketgull-2026';

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Pocket Gull Secure Docs"');
      return res.status(401).send('Authentication required.');
    }

    const [type, credentials] = authHeader.split(' ');
    if (type === 'Basic' && credentials) {
      const decoded = Buffer.from(credentials, 'base64').toString('utf8');
      const [u, p] = decoded.split(':');
      if (u === username && p === password) {
        return next();
      }
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="Pocket Gull Secure Docs"');
    return res.status(401).send('Invalid credentials.');
  };

  // GET /docs → redirect to /api-docs
  router.get('/docs', swaggerAuth, (_req: Request, res: Response) => {
    res.redirect('/api-docs');
  });

  // Swagger UI at /api-docs
  router.use('/api-docs', swaggerAuth, swaggerUi.serve, swaggerUi.setup(openApiSpec));

  // ── PubMed Proxy ──────────────────────────────────────────────────────

  // GET /pubmed/search
  router.get('/pubmed/search', async (req: Request, res: Response) => {
    try {
      const term = req.query['term'] as string;
      if (!term) return res.status(400).json({ error: 'Term is required' });
      const eSearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmode=json&retmax=15`;
      const response = await fetch(eSearchUrl);
      const data = await response.json();
      res.json(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'PubMed proxy error';
      console.error('PubMed Search Proxy Error:', err);
      res.status(500).json({ error: message });
    }
  });

  // GET /pubmed/summary
  router.get('/pubmed/summary', async (req: Request, res: Response) => {
    try {
      const id = req.query['id'] as string;
      if (!id) return res.status(400).json({ error: 'ID is required' });
      const eSummaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${id}&retmode=json`;
      const response = await fetch(eSummaryUrl);
      const data = await response.json();
      res.json(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'PubMed proxy error';
      console.error('PubMed Summary Proxy Error:', err);
      res.status(500).json({ error: message });
    }
  });

  // ── Config ────────────────────────────────────────────────────────────

  // GET /config
  router.get('/config', async (req: Request, res: Response) => {
    try {
      const key = await getApiKey(req);
      res.json({ hasKey: !!key });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Config error';
      res.status(500).json({ error: message });
    }
  });

  // ── WebMCP Tool Catalog ───────────────────────────────────────────────

  // GET /webmcp/tools
  router.get('/webmcp/tools', (_req: Request, res: Response) => {
    res.json({
      '@context': 'https://schema.org',
      '@type': 'WebMCPToolCatalog',
      'name': 'Pocket Gull WebMCP Clinical Tool Catalog',
      'url': 'https://pocketgull.app',
      'version': APP_VERSION,
      'description': 'Real-time Medical Care Plan Strategy and Live AI Consult Engine WebMCP Tools',
      'tools': [
        {
          'name': 'get_patient_state',
          'description': 'Returns current patient vitals, symptoms, selected issues, and active paradigm',
          'parameters': {}
        },
        {
          'name': 'generate_clinical_analysis',
          'description': 'Triggers multi-agent LLM analysis across Western, TCM, and Ayurvedic lenses',
          'parameters': {
            'paradigm': { 'type': 'string', 'enum': ['western', 'eastern', 'ayurvedic'] }
          }
        },
        {
          'name': 'generate_specialist_handoff',
          'description': 'Serializes patient state into an expanded base64 handoff URL and SBAR note for specialists',
          'parameters': {
            'specialty': { 'type': 'string', 'enum': ['do_osteopathic', 'gastroenterology', 'orthomolecular', 'tcm_master', 'ayurvedic_vaidya', 'psychiatry_ybocs'] }
          }
        },
        {
          'name': 'export_fhir_bundle',
          'description': 'Exports patient clinical history as an HL7 FHIR R4 Bundle JSON payload',
          'parameters': {}
        }
      ]
    });
  });

  // ── ORCID Proxy ───────────────────────────────────────────────────────

  // GET /orcid/:orcid
  router.get('/orcid/:orcid', async (req: Request, res: Response) => {
    try {
      const orcidParam = String(req.params['orcid'] || '');
      if (!orcidParam) return res.status(400).json({ error: 'ORCID iD is required' });

      const cleanId = orcidParam.trim().replace(/https?:\/\/orcid\.org\//, '');
      if (!/^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/.test(cleanId)) {
        return res.status(400).json({ error: 'Invalid ORCID iD format. Expected: 0000-0002-1825-0097' });
      }

      // Mock Developer Fallback Profile for Phil Gear
      if (cleanId === '0009-0008-1372-5381') {
        console.log('[ORCID Proxy] Serving SSR mock profile for developer: Phil Gear');
        const mockProfile: IOrcidMockProfile = {
          person: {
            name: {
              'given-names': { value: 'Phil' },
              'family-name': { value: 'Gear' }
            },
            keywords: {
              keyword: [
                { content: 'Software' },
                { content: 'Clinical Intelligence' },
                { content: 'Care Consultation' }
              ]
            },
            'researcher-urls': {
              'researcher-url': [
                {
                  'url-name': 'InsightSpark',
                  url: { value: 'https://github.com/philgear/InsightSpark' }
                }
              ]
            }
          },
          'activities-summary': {
            works: {
              group: [
                {
                  'work-summary': [{
                    title: { title: { value: 'Pivot & Pulse' } },
                    url: { value: 'https://github.com/philgear/InsightSpark' },
                    type: 'software',
                    'publication-date': { year: { value: '2026' } }
                  }]
                },
                {
                  'work-summary': [{
                    title: { title: { value: 'PocketGull Care Consultation Protocol' } },
                    type: 'research-tool',
                    'publication-date': { year: { value: '2026' } }
                  }]
                }
              ]
            }
          }
        };
        return res.json(mockProfile);
      }

      const orcidUrl = `https://pub.orcid.org/v3.0/${cleanId}/record`;
      const response = await fetch(orcidUrl, {
        headers: { 'Accept': 'application/vnd.orcid+json, application/json' }
      });

      if (!response.ok) {
        console.error(`ORCID API returned status ${response.status}`);
        if (response.status === 404) {
          return res.status(404).json({ error: 'ORCID profile not found. Please verify the ID.' });
        }
        return res.status(response.status).json({ error: `ORCID API returned error: ${response.statusText || 'Unknown Error'}` });
      }

      const data = await response.json();
      res.json(data);
    } catch (err: unknown) {
      console.error('ORCID Proxy Error:', err);
      res.status(500).json({ error: 'Failed to fetch profile from ORCID.' });
    }
  });

  // ── Health & Telemetry ────────────────────────────────────────────────

  // GET /health
  router.get('/health', (_req: Request, res: Response) => {
    res.status(200).send('OK');
  });

  // GET /health/baselines
  router.get('/health/baselines', async (_req: Request, res: Response) => {
    try {
      const { fetchWorldHealthBaselines } = await import('../world-health.js');
      const baselines = await fetchWorldHealthBaselines();
      res.json(baselines);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Baselines error';
      console.error('Baselines Fetch Error:', err);
      res.status(500).json({ error: message });
    }
  });

  // GET /hardware/telemetry
  router.get('/hardware/telemetry', async (_req: Request, res: Response) => {
    try {
      const { getHardwareTelemetry } = await import('../telemetry.js');
      const telemetry = await getHardwareTelemetry();
      res.json(telemetry);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Telemetry error';
      console.error('Telemetry Fetch Error:', err);
      res.status(500).json({ error: message });
    }
  });

  return router;
}
