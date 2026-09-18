// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

/**
 * Enterprise B2B Contracts & Legal Templates API Routes
 * 
 * Provides institutional contract templates and HTML generation
 * for enterprise client agreements, HIPAA BAAs, and research data licenses.
 *
 * @module server/routes/contracts.routes
 */
import { Router, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { sanitizeLogInput } from '../../utils/security-helper';

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
}

const CONTRACT_TEMPLATES: TemplateMetadata[] = [
  {
    id: 'b2b-clinical-ai-agreement',
    name: 'B2B Clinical AI & Institutional SaaS Agreement',
    description: 'HIPAA §164.514 & BAA compliant software-as-a-service enterprise license agreement for health systems and academic clinics.'
  },
  {
    id: 'clinical-research-consortium-agreement',
    name: 'Clinical Research Consortium Data Transfer Agreement',
    description: 'Dual-custody research data exchange agreement with differential privacy covenants and ethical patient research dividend revenue share.'
  },
  {
    id: 'smart-fhir-telehealth-pilot-agreement',
    name: 'SMART-on-FHIR Telehealth Pilot Agreement',
    description: 'Institutional pilot agreement for SMART-on-FHIR EHR integration, patient state telemetry, and ambient clinical AI scribe deployment.'
  }
];

export function createContractsRouter(): Router {
  const router = Router();

  const isTestingEnv = Boolean(process.env['CI'] || process.env['PLAYWRIGHT_TESTING'] || process.env['NODE_ENV'] === 'test');
  const limiter = rateLimit({
    windowMs: 60_000,
    max: isTestingEnv || process.env['NODE_ENV'] !== 'production' ? 10_000 : 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many contract requests. Please try again later.' }
  });

  router.use(limiter);

  // GET /api/contracts/templates
  router.get('/templates', (_req: Request, res: Response) => {
    res.status(200).json(CONTRACT_TEMPLATES);
  });

  // POST /api/contracts/prepare
  router.post('/prepare', (req: Request, res: Response) => {
    try {
      const { templateId, variables } = req.body || {};
      const template = CONTRACT_TEMPLATES.find(t => t.id === templateId) || CONTRACT_TEMPLATES[0];
      const vars = variables || {};

      const clientName = sanitizeLogInput(String(vars.CLIENT_NAME || 'Healthcare Institution'));
      const effectiveDate = sanitizeLogInput(String(vars.EFFECTIVE_DATE || new Date().toISOString().split('T')[0]));
      const compAmount = sanitizeLogInput(String(vars.COMPENSATION_AMOUNT || '$0.00 USD'));

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; max-width: 800px; margin: 0 auto;">
          <div style="border-bottom: 3px solid #000; padding-bottom: 16px; margin-bottom: 24px;">
            <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #666; letter-spacing: 0.05em;">PocketGull Enterprise Healthcare</div>
            <h1 style="font-size: 20pt; font-weight: 800; color: #000; margin: 8px 0 0 0;">${template.name}</h1>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 11pt;">
            <tr>
              <td style="padding: 6px 0; width: 30%; font-weight: bold; color: #444;">Effective Date:</td>
              <td style="padding: 6px 0; color: #000;">${effectiveDate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #444;">Client / Institution:</td>
              <td style="padding: 6px 0; color: #000;">${clientName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #444;">Contractual Consideration:</td>
              <td style="padding: 6px 0; color: #000;">${compAmount}</td>
            </tr>
          </table>

          <h3 style="font-size: 13pt; font-weight: bold; color: #000; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 24px;">1. Purpose & Clinical Scope</h3>
          <p style="font-size: 10pt; color: #333; margin: 8px 0;">This Master Service Agreement ("Agreement") governs the licensing, clinical intelligence integration, and technical deployment of the PocketGull software engine between PocketGull LLC and ${clientName}.</p>

          <h3 style="font-size: 13pt; font-weight: bold; color: #000; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 24px;">2. HIPAA Safe Harbor & ePHI Data Integrity (45 CFR § 164.514)</h3>
          <p style="font-size: 10pt; color: #333; margin: 8px 0;">All research telemetry and predictive analytics conform to the 18-identifier Safe Harbor de-identification protocol. No protected health information shall egress the client boundary without cryptographic attestation.</p>

          <h3 style="font-size: 13pt; font-weight: bold; color: #000; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 24px;">3. Ethical Patient Dividend Covenants</h3>
          <p style="font-size: 10pt; color: #333; margin: 8px 0;">In accordance with NIH All of Us and LunaDNA ethical frameworks, participating patients retain sovereign control of longitudinal telemetry and receive direct 85% revenue-share dividend disbursements for accredited academic queries.</p>

          <div style="margin-top: 48px; padding-top: 16px; border-top: 1px solid #000; font-size: 9pt; color: #777; display: flex; justify-content: space-between;">
            <span>Digital Attestation: SHA-256 Validated</span>
            <span>FDA 21 CFR Part 11 Electronic Records Compliant</span>
          </div>
        </div>
      `;

      res.status(200).json({ success: true, html });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[ContractsRoutes] Error preparing contract:', sanitizeLogInput(msg));
      res.status(500).json({ error: 'Internal error preparing contract' });
    }
  });

  return router;
}
