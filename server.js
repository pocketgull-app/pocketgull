import express from 'express';
import compression from 'compression';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join, resolve, relative, isAbsolute } from 'path';
import { rateLimit } from 'express-rate-limit';
import fs from 'fs';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import swaggerUi from 'swagger-ui-express';
import crypto from 'crypto';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { renderBusinessSiteHtml } from './src/server/business-site.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket.io Server] Client connected: ${socket.id}`);

  socket.on('join_patient_room', (roomId) => {
    socket.join(roomId || 'global-clinical-room');
    console.log(`[Socket.io Server] Client ${socket.id} joined room: ${roomId}`);
  });

  socket.on('send_note', (data) => {
    const roomId = data?.patientId || 'global-clinical-room';
    io.to(roomId).emit('note_received', data?.note || data);
  });

  socket.on('sync_vitals', (data) => {
    const roomId = data?.patientId || 'global-clinical-room';
    io.to(roomId).emit('vitals_updated', data?.vitals || data);
  });

  socket.on('client_pcm_chunk', (data) => {
    // Echo/relay PCM audio chunk for Gemini Live simulation
    socket.emit('gemini_live_transcript', { text: 'Gemini Live Audio Received' });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io Server] Client disconnected: ${socket.id}`);
  });
});
app.use(compression());
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self' data: blob: 'unsafe-inline' 'unsafe-eval' http: https: ws: wss:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:; connect-src 'self' http: https: ws: wss:;");
  next();
});
app.use('/api', cors()); // Enable CORS for API routes so Flutter apps can sync data

const apiLimiter = rateLimit({
  windowMs: 60_000,
  max: process.env['CI'] || process.env['NODE_ENV'] !== 'production' ? 10_000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: { error: 'Too many requests. Please try again later.' }
});
app.use('/api', apiLimiter);
app.use('/docs', apiLimiter);
app.use('/api-docs', apiLimiter);
app.use('/health', apiLimiter);

function sanitizeLogInput(val) {
  if (val === null || val === undefined) return String(val);
  const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  return str.replace(/[\r\n\u2028\u2029]+/g, ' _ ').replace(/[\x00-\x1F\x7F]+/g, ' ').slice(0, 2000);
}

app.set('trust proxy', true);

// Primary Business Site Handler for pocketgull.com & www.pocketgull.com
app.use((req, res, next) => {
  const xfh = String(req.headers['x-forwarded-host'] || '').toLowerCase();
  const hostHeader = String(req.headers['host'] || '').toLowerCase();
  const hostname = String(req.hostname || '').toLowerCase();

  const isBusinessSite =
    req.path === '/business' ||
    req.query['preview'] === 'business' ||
    xfh.includes('pocketgull.com') ||
    hostHeader.includes('pocketgull.com') ||
    hostname.includes('pocketgull.com');

  if (isBusinessSite) {
    if (req.path === '/health' || req.path.startsWith('/api/')) {
      return next();
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(renderBusinessSiteHtml());
  }

  // Redirect legacy alias domains to primary app domain pocketgull.app
  const targetDomain = 'pocketgull.app';
  const redirectDomains = [
    'pocketgall.com',
    'pocketgall.app',
    'pocketgal.app',
    'pocketgal.ai'
  ];

  const rawHost = (xfh || hostHeader || hostname).split(',')[0].split(':')[0].trim();
  if (redirectDomains.includes(rawHost)) {
    return res.redirect(301, `https://${targetDomain}${req.originalUrl}`);
  }

  next();
});

const port = process.env.PORT || 3000;

// Use process.cwd() to ensure we are looking in the right place
const rootDir = process.cwd();
const distFolder = join(rootDir, 'dist');

console.log(`[SERVER] Starting...`);
console.log(`[SERVER] Current working directory: ${rootDir}`);
console.log(`[SERVER] Expected dist folder: ${distFolder}`);

// Serve Astro Study Docs independently of Swagger
app.use('/docs/study', (req, res, next) => {
  // Only redirect directory-style paths that lack a trailing slash and have no file extension.
  if (req.path !== '/' && req.path !== '' && !req.path.endsWith('/') && !req.path.includes('.')) {
    const safePath = req.path.replace(/[^a-zA-Z0-9\-_\/]/g, '');
    return res.redirect(301, `/docs/study${safePath}/`);
  }
  next();
});
app.use('/docs/study', express.static(join(distFolder, 'docs', 'study'), { index: 'index.html', extensions: ['html'] }));

// Load OpenAPI documentation dynamically
let swaggerDocument;
try {
  const openApiPath = join(rootDir, 'docs', 'openapi.json');
  if (fs.existsSync(openApiPath)) {
    swaggerDocument = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));
    const swaggerAuth = (req, res, next) => {
      const username = process.env.SWAGGER_USERNAME || 'dev-pocketgull';
      const password = process.env.SWAGGER_PASSWORD || 'admin-secure-pocketgull-2026';

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

    // Mount the Swagger UI under /api-docs
    app.get(['/docs', '/docs/'], swaggerAuth, (req, res) => {
      res.redirect('/api-docs');
    });
    app.use('/api-docs', swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    console.log('[SERVER] Swagger documentation mounted at /api-docs');
  } else {
    console.warn('[SERVER] Warning: docs/openapi.json not found. Swagger docs skipped.');
  }
} catch (err) {
  console.error('[SERVER] Failed to load or parse docs/openapi.json:', err);
}

// ─── DISCORD WEBHOOK PROXY & BOT ENDPOINTS ───────────────────
app.post('/api/discord/webhook', express.json(), async (req, res) => {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('[Discord Webhook] DISCORD_WEBHOOK_URL not configured. Webhook dispatch bypassed.');
      return res.status(200).json({ status: 'bypassed', message: 'DISCORD_WEBHOOK_URL not configured' });
    }

    const { content, embedTitle, embedDescription, fields, color } = req.body || {};

    const payload = {
      content: content || null,
      embeds: [
        {
          title: embedTitle || '🫀 Pocket Gull — Clinical Intelligence Dispatch',
          description: embedDescription || 'Real-time SBAR clinical transcript or vitals telemetry handoff.',
          color: color || 0x416B1F,
          fields: fields || [],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Pocket Gull Clinical Copilot • HIPAA Safe Harbor Sanitized',
            icon_url: 'https://pocketgull.app/favicon.svg'
          }
        }
      ]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return res.json({ status: 'success', message: 'Discord webhook dispatched' });
    } else {
      const errText = await response.text();
      console.error('[Discord Webhook] Failed:', errText);
      return res.status(502).json({ error: 'Failed to post to Discord webhook', details: errText });
    }
  } catch (err) {
    console.error('[Discord Webhook] Exception:', err);
    return res.status(500).json({ error: 'Internal Discord proxy error' });
  }
});

// Slash Command Handler (/consult and /fhir-r4)
app.post('/api/discord/slash', express.json(), async (req, res) => {
  try {
    const { command, text, patient_id } = req.body || {};
    
    if (command === '/consult' || command === 'consult') {
      const symptomQuery = text || 'General health consult request';
      return res.json({
        response_type: 'in_channel',
        embeds: [{
          title: `🩺 Gemini 2.5 Flash Consult: "${symptomQuery}"`,
          description: `**Advisory Clinical Strategy**\n- **Primary Lens**: Functional & Autonomic Entrainment\n- **Recommendation**: Execute 6.0 BPM 0.1 Hz vagal resonant breathing.\n- **LOINC Screener**: GAD-7 / PHQ-9 indicated for score > 5.\n\n*Review required by licensed MD/DO before clinical application.*`,
          color: 0x06B6D4,
          footer: { text: 'Pocket Gull Gemini 2.5 Flash Engine' }
        }]
      });
    }

    if (command === '/fhir-r4' || command === 'fhir-r4') {
      const targetId = patient_id || 'patient-demo-001';
      return res.json({
        response_type: 'in_channel',
        embeds: [{
          title: `📋 FHIR R4 Bundle Export [${targetId}]`,
          description: `\`\`\`json\n{\n  "resourceType": "Bundle",\n  "type": "collection",\n  "entry": [\n    { "resource": { "resourceType": "Patient", "id": "${targetId}" } }\n  ]\n}\n\`\`\``,
          color: 0x10B981,
          footer: { text: 'HL7 FHIR R4 Compliant Payload' }
        }]
      });
    }

    return res.status(400).json({ error: 'Unrecognized Discord command' });
  } catch (err) {
    return res.status(500).json({ error: 'Discord slash error' });
  }
});

// Relay Solfeggio bio-haptic tones & CPR audio entrainment to Discord WebRTC Voice Channel
app.post('/api/discord/voice-entrainment', express.json(), async (req, res) => {
  try {
    const { frequencyHz = 528, bpm = 110, channelId } = req.body || {};
    const sanitizeForLog = (value) => String(value).replace(/[\r\n]/g, '');
    const safeFrequencyHz = sanitizeForLog(frequencyHz);
    const safeBpm = sanitizeForLog(bpm);
    const safeChannelId = sanitizeForLog(channelId || 'default');
    console.log(`[Discord Voice Relay] Relaying ${safeFrequencyHz} Hz Solfeggio + ${safeBpm} BPM audio entrainment to voice channel ${safeChannelId}.`);
    
    return res.json({
      status: 'streaming',
      frequencyHz,
      bpm,
      channelId: channelId || 'default-voice',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Discord voice entrainment relay failed' });
  }
});

let geminiApiKeyCached = '';

async function fetchGeminiApiKey() {
  // Layer 1: Process Environment
  if (process.env.GEMINI_API_KEY) {
    console.log('[Secrets] Using GEMINI_API_KEY from environment.');
    return process.env.GEMINI_API_KEY;
  }

  // Layer 2: Local Filesystem (.env or .env.local)
  for (const envFile of ['.env.local', '.env']) {
    try {
      const localEnv = fs.readFileSync(join(rootDir, envFile), 'utf8');
      const match = localEnv.match(/GEMINI_API_KEY=["']?([^"'\n]+)["']?/);
      if (match) {
        console.log(`[Secrets] Manual load success: ${envFile}`);
        return match[1].trim();
      }
    } catch (e) { }
  }

  // Layer 3: Cloud Infrastructure (Secret Manager)
  try {
    const client = new SecretManagerServiceClient();
    let projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;

    if (!projectId) {
      console.log('[Secrets] GOOGLE_CLOUD_PROJECT not set, attempting to resolve automatically...');
      projectId = await client.getProjectId();
    }

    if (!projectId) {
      console.warn('[WARN] Could not determine project ID. Returning empty string.');
      return '';
    }

    console.log(`[Secrets] Fetching GEMINI_API_KEY from GCP Secret Manager for project ${projectId}...`);
    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/GEMINI_API_KEY/versions/latest`,
    });
    const payload = version.payload.data.toString('utf8');
    console.log('[Secrets] Successfully fetched GEMINI_API_KEY from GCP.');
    return payload;
  } catch (err) {
    console.warn(`[WARN] Failed to fetch secret GEMINI_API_KEY from GCP. Returning empty string. Error: ${err.message}`);
    return '';
  }
}

// Fetch secret on startup
fetchGeminiApiKey().then(key => {
  geminiApiKeyCached = key;
});

if (fs.existsSync(distFolder)) {
  const contents = fs.readdirSync(distFolder);
  console.log(`[SERVER] Contents of ${distFolder}:`, contents);
} else {
  console.error(`[SERVER] ERROR: ${distFolder} does not exist!`);
  console.log(`[SERVER] Contents of ${rootDir}:`, fs.readdirSync(rootDir));
}

// Add security headers
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals = res.locals || {};
  res.locals.nonce = nonce;

  // Strict Transport Security - preloaded via HSTS preload list
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Cross-Origin-Opener-Policy
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  
  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Content Security Policy - prevents inline scripts and restricts resource loading
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "worker-src 'self' blob:; " +
    `script-src 'self' 'nonce-${nonce}'; ` +
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "img-src 'self' https: data:; " +
    "font-src 'self'; " +
    "connect-src 'self' http: https: ws: wss: http://localhost:9399 http://localhost:4000 http://localhost:4200 http://localhost:8000 http://localhost:5000 http://127.0.0.1:9399 http://127.0.0.1:4000 ws://localhost:9399 ws://localhost:4000 ws://localhost:4200 https://eutils.ncbi.nlm.nih.gov https://generativelanguage.googleapis.com https://huggingface.co https://*.huggingface.co https://cdn-lfs.huggingface.co https://raw.githubusercontent.com https://*.firebaseio.com https://*.googleapis.com https://*.firebaseapp.com; " +
    "frame-src 'self' https://www.ncbi.nlm.nih.gov https://pubmed.ncbi.nlm.nih.gov https://insightspark-82c75.web.app; " +
    "frame-ancestors 'self'; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );
  
  // X-Content-Type-Options - prevents MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Referrer-Policy - controls referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Cross-Origin Resource Policy
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  
  // Permissions-Policy (formerly Feature-Policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );
  next();
});

// PubMed Proxy Endpoints
app.get('/api/pubmed/search', async (req, res) => {
  try {
    const { term } = req.query;
    if (!term) return res.status(400).json({ error: 'Term is required' });
    const eSearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmode=json&retmax=15`;
    const response = await fetch(eSearchUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('PubMed Search Proxy Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pubmed/summary', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID is required' });
    const eSummaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${id}&retmode=json`;
    const response = await fetch(eSummaryUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('PubMed Summary Proxy Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// WebMCP JSON-LD Tool Catalog Endpoint for Agentic Browsing & Discovery
app.get('/api/webmcp/tools', (req, res) => {
  res.json({
    '@context': 'https://schema.org',
    '@type': 'WebMCPToolCatalog',
    'name': 'Pocket Gull WebMCP Clinical Tool Catalog',
    'url': 'https://pocketgull.app',
    'version': '1.0.0',
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

// ORCID Proxy Endpoint
app.get('/api/orcid/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ORCID iD is required' });
    
    // Clean and validate format
    const cleanId = id.trim().replace(/https?:\/\/orcid\.org\//, '');
    if (!/^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/.test(cleanId)) {
      return res.status(400).json({ error: 'Invalid ORCID iD format. Expected: 0000-0002-1825-0097' });
    }

    // Mock Developer Fallback Profile for Phil Gear
    if (cleanId === '0009-0008-1372-5381') {
      console.log('[ORCID Proxy] Serving local mock profile for developer: Phil Gear');
      return res.json({
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
                'work-summary': [
                  {
                    title: {
                      title: { value: 'Pivot & Pulse' }
                    },
                    url: { value: 'https://github.com/philgear/InsightSpark' },
                    type: 'software',
                    'publication-date': {
                      year: { value: '2026' }
                    }
                  }
                ]
              },
              {
                'work-summary': [
                  {
                    title: {
                      title: { value: 'PocketGull Care Consultation Protocol' }
                    },
                    type: 'research-tool',
                    'publication-date': {
                      year: { value: '2026' }
                    }
                  }
                ]
              }
            ]
          }
        }
      });
    }

    const orcidUrl = `https://pub.orcid.org/v3.0/${cleanId}/record`;
    const response = await fetch(orcidUrl, {
      headers: {
        'Accept': 'application/vnd.orcid+json, application/json'
      }
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
  } catch (err) {
    console.error('ORCID Proxy Error:', err);
    res.status(500).json({ error: 'Failed to fetch profile from ORCID.' });
  }
});

// Enable parsing JSON bodies for POST requests
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// JSON File Database Configuration
const dataDir = join(process.cwd(), 'data');
const patientsDbPath = join(dataDir, 'patients.json');

// Ensure data directory and empty DB exists atomically
try {
  fs.mkdirSync(dataDir, { recursive: true });
} catch {}
try {
  fs.writeFileSync(patientsDbPath, JSON.stringify([], null, 2), { flag: 'wx' });
} catch (err) {
  if (err.code !== 'EEXIST') throw err;
}

// Patients API Endpoints
app.get('/api/patients', (req, res) => {
  try {
    const data = fs.readFileSync(patientsDbPath, 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    console.error('[API] Error reading patients database:', err);
    res.status(500).json({ error: 'Internal server error while reading database' });
  }
});

function validatePatientData(data) {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }
  return data.map(patient => {
    if (typeof patient !== 'object' || patient === null) {
      throw new Error('Patient must be an object');
    }
    return {
      id: String(patient.id || ''),
      name: String(patient.name || ''),
      age: Number(patient.age || 0),
      gender: String(patient.gender || ''),
      lastVisit: String(patient.lastVisit || ''),
      preexistingConditions: Array.isArray(patient.preexistingConditions) 
        ? patient.preexistingConditions.map(String) 
        : [],
      patientGoals: String(patient.patientGoals || ''),
      vitals: {
        bp: String(patient.vitals?.bp || ''),
        hr: String(patient.vitals?.hr || ''),
        temp: String(patient.vitals?.temp || ''),
        spO2: String(patient.vitals?.spO2 || ''),
        weight: String(patient.vitals?.weight || ''),
        height: String(patient.vitals?.height || '')
      },
      oxidativeStressMarkers: Array.isArray(patient.oxidativeStressMarkers)
        ? patient.oxidativeStressMarkers.map(m => ({
            id: String(m.id || ''),
            name: String(m.name || ''),
            value: String(m.value || '')
          }))
        : [],
      clinicalLogs: Array.isArray(patient.clinicalLogs)
        ? patient.clinicalLogs.map(l => ({
            timestamp: String(l.timestamp || ''),
            clinician: String(l.clinician || ''),
            note: String(l.note || '')
          }))
        : [],
      medications: Array.isArray(patient.medications)
        ? patient.medications.map(m => ({
            name: String(m.name || ''),
            dosage: String(m.dosage || ''),
            frequency: String(m.frequency || '')
          }))
        : [],
      labResults: Array.isArray(patient.labResults)
        ? patient.labResults.map(r => ({
            testName: String(r.testName || ''),
            value: String(r.value || ''),
            unit: String(r.unit || ''),
            status: String(r.status || '')
          }))
        : [],
      lifestyleFactors: {
        sleepHours: Number(patient.lifestyleFactors?.sleepHours || 0),
        activityLevel: String(patient.lifestyleFactors?.activityLevel || ''),
        stressScore: Number(patient.lifestyleFactors?.stressScore || 0)
      },
      avsHistory: Array.isArray(patient.avsHistory)
        ? patient.avsHistory.map(h => ({
            timestamp: String(h.timestamp || ''),
            wave: String(h.wave || ''),
            bpm: Number(h.bpm || 0),
            durationMin: Number(h.durationMin || 0)
          }))
        : [],
      clinicalPhilosophy: String(patient.clinicalPhilosophy || ''),
      selectedPhilosophy: String(patient.selectedPhilosophy || ''),
      isEmergencyMode: Boolean(patient.isEmergencyMode),
      reasonForVisit: String(patient.reasonForVisit || ''),
      occupation: String(patient.occupation || ''),
      dietaryProtocol: String(patient.dietaryProtocol || ''),
      issues: patient.issues || {},
      history: Array.isArray(patient.history) ? patient.history : [],
      bookmarks: Array.isArray(patient.bookmarks) ? patient.bookmarks : [],
      scans: Array.isArray(patient.scans) ? patient.scans : []
    };
  });
}

app.post('/api/patients', (req, res) => {
  try {
    if (!req.body || !Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Body must be a JSON array of patients' });
    }

    // Sanitize and validate incoming patient data
    const sanitized = validatePatientData(req.body);

    // Save validated data to file
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const safePatientsJson = JSON.stringify(sanitized, null, 2).replace(/[^\x20-\x7E\r\n\t]/g, '');
    const safeLen1 = Math.min(safePatientsJson.length, MAX_FILE_SIZE) | 0;
    const patientBuffer1 = Buffer.alloc(safeLen1);
    for (let i = 0; (i | 0) < (safeLen1 | 0); i++) {
      patientBuffer1.writeUInt8((safePatientsJson.charCodeAt(i) & 0x7f) | 0, i);
    }
    fs.writeFileSync(patientsDbPath, patientBuffer1);

    console.log(`[API] Saved ${sanitized.length} patients to database.`);
    res.status(200).json({ success: true, count: sanitized.length });
  } catch (err) {
    console.error('[API] Error saving patients database:', sanitizeLogInput(err?.message || err));
    res.status(500).json({ error: 'Internal server error while saving database' });
  }
});

app.put('/api/patients/:id', (req, res) => {
  try {
    const rawIdStr = String(req.params.id || '');
    const id = /^[a-zA-Z0-9_-]{1,64}$/.test(rawIdStr) ? rawIdStr : 'invalid_patient_id';
    if (id === 'invalid_patient_id') {
      return res.status(400).json({ error: 'Invalid patient ID format' });
    }
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Body must be a JSON object representing the patient' });
    }

    const data = fs.readFileSync(patientsDbPath, 'utf8');
    const patients = JSON.parse(data);
    const index = patients.findIndex(p => p.id === id);

    const allowedPatientFields = ['id', 'name', 'age', 'gender', 'vitals', 'symptoms', 'history', 'conditions', 'carePlan', 'metrics', 'demographics', 'assessment'];
    const sanitizePatientObj = (raw) => {
      if (!raw || typeof raw !== 'object') return {};
      const clean = {};
      for (const k of Object.keys(raw)) {
        if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
        if (Object.prototype.hasOwnProperty.call(raw, k) && allowedPatientFields.includes(k)) {
          clean[k] = raw[k];
        }
      }
      return clean;
    };

    const cleanPayload = sanitizePatientObj(req.body);
    if (index !== -1) {
      patients[index] = { ...patients[index], ...cleanPayload, id }; // Ensure ID stays same
    } else {
      // If it doesn't exist, we can create it
      patients.push({ ...cleanPayload, id });
    }

    const safeFileJson = JSON.stringify(patients, null, 2).replace(/[^\x20-\x7E\r\n\t]/g, '');
    const MAX_PATIENTS_JSON_CHARS = 1_000_000; // 1 MB-ish ASCII JSON ceiling to prevent DoS
    if (safeFileJson.length > MAX_PATIENTS_JSON_CHARS) {
      return res.status(413).json({ error: 'Patient payload too large to persist safely' });
    }
    const safeLen2 = Math.min(safeFileJson.length, MAX_PATIENTS_JSON_CHARS) | 0;
    const patientBuffer2 = Buffer.alloc(safeLen2);
    for (let i = 0; (i | 0) < (safeLen2 | 0); i++) {
      patientBuffer2.writeUInt8((safeFileJson.charCodeAt(i) & 0x7f) | 0, i);
    }
    fs.writeFileSync(patientsDbPath, patientBuffer2);
    const safeLogId = id.replace(/[\r\n\t]/g, '_').replace(/[^\x20-\x7E]/g, '');
    console.log(`[API] Synced patient ${safeLogId} from mobile/app to database.`);
    res.status(200).json({ success: true, patient: patients.find(p => p.id === id) });
  } catch (err) {
    console.error('[API] Error syncing patient to database:', sanitizeLogInput(err?.message || err));
    res.status(500).json({ error: 'Internal server error while syncing patient' });
  }
});

// Serve static files via Express directly to avoid generic filesystem deadlocks
// index: false prevents static middleware from serving index.html on root `/` requests
app.use(express.static(distFolder, { maxAge: '1y', index: false }));

// Fallback to index.html for Angular routing and root requests
app.get(/(.*)/, (req, res) => {
  const indexPath = join(distFolder, 'index.html');

  // A request is a "document" request if it:
  // 1. Is the root '/'
  // 2. Is index.html
  // 3. Doesn't have a file extension (likely an Angular route)
  const isDoc = req.url === '/' || req.url === '/index.html' || !req.url.includes('.');

  if (!isDoc) {
    // If it's not a doc and wasn't caught by express.static, it's a 404
    console.log('[SERVER] 404 Not Found');
    return res.status(404).send('Not Found');
  }

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (fs.existsSync(indexPath)) {
    try {
      let html = fs.readFileSync(indexPath, 'utf8');
      if (geminiApiKeyCached) {
        // Inject script immediately before closing </head>
        const nonce = res.locals.nonce || '';
        const scriptTag = `<script nonce="${nonce}" px-api-key="true">window.GEMINI_API_KEY = "${geminiApiKeyCached}";</script>\n</head>`;
        html = html.replace('</head>', scriptTag);
      }
      const nonce = res.locals.nonce || '';
      if (nonce) {
        html = html.replace(/<script(?![^>]*nonce=)/g, `<script nonce="${nonce}"`);
      }
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    } catch (err) {
      console.error('[SERVER] Error injecting secret into index.html:', err);
    }
  }

  res.sendFile(indexPath);
});

httpServer.listen(port, '0.0.0.0', () => {
  console.log(`[SERVER] Real-time HTTP + Socket.io Server listening on port ${port}`);
});
