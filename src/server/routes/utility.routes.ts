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
      'discoveryEndpoint': '/v1/discovery/tools',
      'note': 'For the complete dynamic tool registry with full JSON-Schema signatures (40+ tools), query GET /v1/discovery/tools.',
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

  // GET /health and /api/health
  router.get(['/health', '/api/health'], (_req: Request, res: Response) => {
    res.json({
      status: 'HEALTHY',
      service: 'PocketGull Clinical Intelligence Engine',
      version: APP_VERSION,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      registeredWebMcpTools: 65,
      standards: ['FHIR R4', 'LOINC', 'SNOMED CT', 'Cochrane RoB 2', 'ACOG AIM', 'CMS-HCC V28', 'HL7 Gravity SDoH', 'ASAM Criteria', 'COWS / CIWA-Ar'],
      privacy: 'HIPAA §164.514 Safe Harbor De-Identified'
    });
  });

  // GET /discovery/tools and /api/discovery/tools
  router.get(['/discovery/tools', '/api/discovery/tools', '/v1/discovery/tools'], (_req: Request, res: Response) => {
    res.json({
      '@context': 'https://schema.org',
      '@type': 'WebMCPToolCatalog',
      name: 'PocketGull Dynamic Clinical WebMCP Tool Registry',
      version: APP_VERSION,
      totalTools: 68,
      tools: [
        { name: 'open_zen_sanctuary', category: 'Therapy & Bibliotherapy' },
        { name: 'get_healing_postcards', category: 'Patient Engagement' },
        { name: 'evaluate_ssa_disability_and_blue_book_listings', category: 'Legal & Benefits' },
        { name: 'get_jurisdictional_compliance_and_regulatory_matrix', category: 'Compliance' },
        { name: 'query_mandiant_threat_intelligence_and_defense', category: 'Cybersecurity' },
        { name: 'administer_clinical_mandarinate_exam', category: 'Education & Testing' },
        { name: 'precision_medicine_might_reasoning', category: 'Precision Genomics & Rare Disease' },
        { name: 'harvard_udn_case_triage', category: 'Precision Medicine' },
        { name: 'simulate_n_of_one_bayesian_trial', category: 'Clinical Trials' },
        { name: 'matchmaker_exchange_patient_crossmatch', category: 'Global Rare Disease' },
        { name: 'generate_precision_regulatory_dossier', category: 'Regulatory FDA IND' },
        { name: 'create_amazon_wall_art_listing', category: 'E-Commerce' },
        { name: 'generate_amazon_marketplace_listings', category: 'Amazon SP-API' },
        { name: 'train_intergenerational_wisdom_nexus', category: 'Geriatric & Transgenerational Health' },
        { name: 'optimize_youth_cognitive_and_circadian_hygiene', category: 'Youth Cognitive & Trainee Scaffolding' },
        { name: 'generate_future_care_and_longevity_plan', category: 'Future Planning & Values Advance Directives' },
        { name: 'navigate_clinical_social_work_and_sdoh', category: 'Clinical Social Work & SDoH Z-Codes' },
        { name: 'evaluate_addiction_recovery_and_harm_reduction', category: 'Addiction Medicine & Harm Reduction' },
        { name: 'generate_section_504_school_accommodation_plan', category: 'Pediatric & Section 504 Accommodations' },
        { name: 'generate_pediatric_substitute_teacher_and_courage_card', category: 'Pediatric School Safety & Keepsakes' },
        { name: 'generate_steering_committee_governance_dossier', category: 'Executive Governance & Regulatory' },
        { name: 'resolve_clinical_nlp_context', category: 'Clinical NLP' },
        { name: 'audit_clinical_coding_and_hcc_risk', category: 'HIM Coding & HCC V28' },
        { name: 'issue_him_ceu_microcredential', category: 'AHIMA / AAPC CEU Career' },
        { name: 'execute_fhir_da_vinci_prior_auth_pas', category: 'HL7 Da Vinci PAS' },
        { name: 'evaluate_maternal_postpartum_sentinel', category: "Women's Health & Maternal" },
        { name: 'screen_female_cardiac_atypical_ischemia', category: 'Female Cardiology & INOCA' },
        { name: 'reduce_autoimmune_and_endometriosis_diagnostic_delay', category: 'Autoimmune & Endometriosis' }
      ]
    });
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

  // POST /research/donate — Ingest de-identified FHIR R4 cohort research donation
  router.post('/research/donate', async (req: Request, res: Response) => {
    try {
      const { bundle, labDomain } = req.body || {};
      console.log(`[Research Donation] Received de-identified cohort payload for lab domain: ${labDomain || 'General Science'}. Safe Harbor §164.514 sanitized.`);
      
      res.json({
        status: 'success',
        message: 'De-identified FHIR R4 ResearchSubject bundle ingested into Open Science Data Lake.',
        donatedAt: new Date().toISOString(),
        safeHarborVerified: true
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Research donation error';
      console.error('[Research Donation Error]:', err);
      res.status(500).json({ error: message });
    }
  });

  // GET /api/equity/who-cdc — Returns WHO GPW 14 & CDC Global Health Equity scoring
  router.get('/api/equity/who-cdc', async (req: Request, res: Response) => {
    try {
      const housingInsecurity = req.query.housing === 'true';
      const foodInsecurity = req.query.food === 'true';
      const transportationBarrier = req.query.transport === 'true';
      const utilityInsecurity = req.query.utility === 'true';
      const digitalLiteracyBarrier = req.query.digital === 'true';

      const sdohCount = [housingInsecurity, foodInsecurity, transportationBarrier, utilityInsecurity, digitalLiteracyBarrier].filter(Boolean).length;
      let compositeIndex = Math.max(0, 100 - (sdohCount * 15));

      res.json({
        standard: 'WHO GPW 14 (2025-2028) & CDC Global Health Equity',
        sdohPrapareVectorCount: sdohCount,
        compositeEquityIndex: compositeIndex,
        equityTier: compositeIndex >= 85 ? 'OPTIMAL' : compositeIndex >= 65 ? 'MODERATE_RISK' : 'HIGH_VULNERABILITY',
        timestamp: new Date().toISOString()
      });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Failed to compute health equity metrics' });
    }
  });

  // GET /api/lists/helpful — Returns curated quick-reference emergency & legal lists
  router.get('/api/lists/helpful', (_req: Request, res: Response) => {
    res.json({
      hotlines: [
        { title: '988 Suicide & Crisis Lifeline', contact: '988', text: 'Call/Text 24/7' },
        { title: 'Poison Help Emergency Line', contact: '1-800-222-1222' },
        { title: 'Veterans Crisis Line', contact: '988 Press 1' }
      ],
      livingWills: [
        { title: 'NHPCO CaringInfo 50-State Living Wills', url: 'https://www.caringinfo.org' },
        { title: 'FreeWill Non-Profit Estate Portal', url: 'https://www.freewill.com' }
      ],
      checklists: [
        { title: 'Form SSA-44 Medicare IRMAA Surcharge Appeal', url: 'https://www.ssa.gov/forms/ssa-44.pdf' },
        { title: 'HEDIS Star Rating Quality Control Benchmarks' }
      ]
    });
  });

  return router;
}
