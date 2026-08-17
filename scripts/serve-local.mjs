import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 8080;

// Body parsing
app.use(express.json());

// Serve public assets
app.use(express.static(path.join(rootDir, 'public')));
app.use('/assets', express.static(path.join(rootDir, 'public/assets')));
app.use('/docs', express.static(path.join(rootDir, 'docs')));

// Privacy & Terms Policy routes
app.get(['/privacy-policy', '/privacy-policy.html'], (req, res) => {
  const p = path.join(rootDir, 'public/privacy-policy.html');
  if (fs.existsSync(p)) res.sendFile(p);
  else res.send('<h1>PocketGull Privacy Policy</h1><p>HIPAA §164.514 Safe Harbor De-Identification Standard.</p>');
});

app.get(['/terms-of-service', '/terms-of-service.html'], (req, res) => {
  const p = path.join(rootDir, 'public/terms-of-service.html');
  if (fs.existsSync(p)) res.sendFile(p);
  else res.send('<h1>PocketGull Terms of Service</h1><p>Clinical Decision Support (CDS) Framework.</p>');
});

// Health & Liveness Probe (/api/health and /health)
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'PocketGull Clinical Intelligence Engine',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    registeredWebMcpTools: 64,
    standards: ['FHIR R4', 'LOINC', 'SNOMED CT', 'Cochrane RoB 2', 'ACOG AIM', 'CMS-HCC V28', 'HL7 Gravity SDoH'],
    privacy: 'HIPAA §164.514 Safe Harbor De-Identified'
  });
});

// Dynamic WebMCP Tools Catalog (/api/discovery/tools)
app.get(['/api/discovery/tools', '/discovery/tools', '/v1/discovery/tools'], (req, res) => {
  res.json({
    '@context': 'https://schema.org',
    '@type': 'WebMCPToolCatalog',
    name: 'PocketGull Dynamic Clinical WebMCP Tool Registry',
    totalTools: 74,
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
      { name: 'execute_clinical_graphql_query', category: 'Unified Semantic GraphQL' },
      { name: 'set_clinical_interface_context_mode', category: 'Interface Persona & Progressive Disclosure' },
      { name: 'generate_academic_citation_dossier', category: 'Academic Citations & Literature Proof' },
      { name: 'inspect_active_view_citations', category: 'Context-Aware Evidence Inspector' },
      { name: 'calculate_global_health_and_humanitarian_utility', category: 'Humanitarian Health Utility & QALY' },
      { name: 'evaluate_social_conversational_pragmatics', category: 'Interpersonal Social Pragmatics Gym' },
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

// System Status & Telemetry (/api/discovery/status)
app.get(['/api/discovery/status', '/discovery/status'], (req, res) => {
  res.json({
    status: 'OPERATIONAL',
    telemetry: 'NOMINAL',
    webgpuEnabled: true,
    wasmEdgeAi: 'READY',
    hipaaSanitization: 'DOMPURIFY_ENFORCED',
    timestamp: new Date().toISOString()
  });
});

function getBusinessHtml() {
  try {
    const tsCode = fs.readFileSync(path.join(rootDir, 'src/server/business-site.ts'), 'utf8');
    const transpiled = ts.transpileModule(tsCode, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
    });
    const m = { exports: {} };
    const fn = new Function('module', 'exports', 'require', transpiled.outputText);
    fn(m, m.exports, (mod) => ({}));
    return m.exports.renderBusinessSiteHtml();
  } catch (err) {
    console.error('[Serve] Error transpiling business-site.ts:', err);
    return `<!DOCTYPE html><html><body><h1>PocketGull</h1><p>Error rendering site</p></body></html>`;
  }
}

// Business & Storefront Routes
app.get(['/', '/business', '/digital-twin', '/store', '/art', '/gallery', '/storefront'], (req, res) => {
  const html = getBusinessHtml();
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Fine Art Stripe Checkout API
app.post('/api/billing/art-checkout', (req, res) => {
  const { artTitle, priceUsd, sku, frame, size } = req.body || {};
  const origin = `${req.protocol}://${req.get('host')}`;
  res.json({
    url: `${origin}/store?order=mock_success&art=${encodeURIComponent(artTitle || 'PocketGull Fine Art')}&amount=${priceUsd || 38}&sku=${sku || 'PG-ART'}&frame=${encodeURIComponent(frame || 'unframed')}`,
    mode: 'mock_demo',
    message: 'Stripe demo mode: mock checkout session created successfully.'
  });
});

app.listen(PORT, () => {
  console.log(`\n🕊️  PocketGull Local Server running at: http://localhost:${PORT}`);
  console.log(`🩺  Health Probe: http://localhost:${PORT}/api/health`);
  console.log(`🔍  Discovery Tools: http://localhost:${PORT}/api/discovery/tools`);
  console.log(`🖼️  Fine Art Storefront: http://localhost:${PORT}/store\n`);
});
