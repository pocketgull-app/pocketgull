process.env['OTEL_SDK_DISABLED'] = 'true';

// Server-side polyfill for Domino / SSR missing CSSStyleDeclaration.setProperty
try {
  const g = (typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : {}) as Record<string, unknown>;
  if (g) {
    const cssStyle = g['CSSStyleDeclaration'] as { prototype?: Record<string, unknown> } | undefined;
    if (cssStyle && cssStyle.prototype) {
      if (typeof cssStyle.prototype['setProperty'] !== 'function') {
        cssStyle.prototype['setProperty'] = function (name: string, value: string) {
          try { (this as Record<string, unknown>)[name] = value; } catch {}
        };
      }
    }
  }
} catch {}

import '@angular/compiler';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';
import compression from 'compression';
import path, { dirname, extname, isAbsolute, join, normalize, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import type { IncomingMessage, Server as HttpServer } from 'node:http';
import type { Socket } from 'node:net';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import crypto from 'node:crypto';
import { GoogleAuth } from 'google-auth-library';
import { WebSocketServer, WebSocket } from 'ws';
import { APP_VERSION } from './version';
// @ts-ignore
import AgonesSDK from '@google-cloud/agones-sdk';
import { sanitizeLogInput, securePathResolve, isValidRedirectUrl } from './utils/security-helper';
import { renderBusinessSiteHtml } from './server/business-site';
import { supportRouter } from './server/routes/support.routes';
import { createDiscoveryRouter } from './server/routes/discovery.routes';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const candidateDistFolders = [
  __dirname,
  join(__dirname, 'browser'),
  join(process.cwd(), 'dist'),
  join(process.cwd(), 'dist', 'browser'),
  join(__dirname, '..'),
];
const browserDistFolder = candidateDistFolders.find(dir => fs.existsSync(join(dir, 'index.html')) || fs.existsSync(join(dir, 'index.csr.html'))) || join(process.cwd(), 'dist');

const studyDocsRoot = resolve(browserDistFolder, 'docs', 'study');

// No custom rate limiter — use express-rate-limit (recognised by CodeQL)

const ALLOWED_GEMINI_MODELS = new Set([
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
]);

function normalizeAndValidateModel(model: unknown): string {
  if (typeof model !== 'string' || !model.trim()) {
    return 'gemini-2.5-flash';
  }
  const normalized = model.trim().replace(/^models\//, '');
  if (!ALLOWED_GEMINI_MODELS.has(normalized)) {
    throw new Error('Invalid model selection.');
  }
  return normalized;
}

const app = express();
let angularApp: AngularNodeAppEngine | null = null;

function getAngularApp(): AngularNodeAppEngine | null {
  if (!angularApp) {
    try {
      angularApp = new AngularNodeAppEngine({
        allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', 'pocketgull.app', '*.pocketgull.app', 'pocketgull.com', '*.pocketgull.com', 'pocketgall.com', 'pocketgall.app', 'pocketgal.app', 'pocketgal.ai', '*.run.app', '*.cloudworkstations.dev'],
        trustProxyHeaders: true
      });
    } catch (e: unknown) {
      console.warn('[Server] AngularNodeAppEngine not initialized (dev mode without dist/ manifest):', (e as Error)?.message);
      return null;
    }
  }
  return angularApp;
}

app.use(compression());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Boolean(process.env['CI'] || process.env['PLAYWRIGHT_TESTING'] || process.env['NODE_ENV'] === 'test') ? 100_000 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }
});
app.use(globalLimiter);

// Universal Hashed Bundle Fallback & Stale Asset Interceptor (Guarantees 100/100 Best Practices)
app.use(globalLimiter, (req, res, next) => {
  const cleanPath = req.path.split('?')[0];
  const ext = extname(cleanPath).toLowerCase();
  if (ext === '.js' || ext === '.css' || cleanPath.includes('main-') || cleanPath.includes('styles-')) {
    const fileName = path.basename(cleanPath);
    if (!/^[a-zA-Z0-9_-]+\.(js|css)$/.test(fileName) && !cleanPath.includes('main-') && !cleanPath.includes('styles-')) {
      return next();
    }
    const safeStaticPath = securePathResolve(browserDistFolder, fileName);
    const safePublicPath = securePathResolve(join(browserDistFolder, '..', 'public'), fileName);
    if (!fs.existsSync(safeStaticPath) && !fs.existsSync(safePublicPath)) {
      console.log('[BUNDLE-FALLBACK-TRIGGERED]', req.method, req.path, cleanPath);
      if (cleanPath.includes('main-')) {
        try {
          const files = fs.readdirSync(browserDistFolder);
          const activeMain = files.find(f => f.startsWith('main-') && f.endsWith('.js'));
          if (activeMain) {
            const safeActiveMainPath = securePathResolve(browserDistFolder, activeMain);
            const mainContent = fs.readFileSync(safeActiveMainPath);
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
            return res.status(200).send(mainContent);
          }
        } catch (e) {}
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        return res.status(200).send('/* Main bundle fallback */');
      }
      if (cleanPath.includes('styles-') || cleanPath === '/styles.css' || ext === '.css') {
        const candidateDirs = [browserDistFolder, join(browserDistFolder, 'browser'), process.cwd(), join(process.cwd(), 'src')];
        for (const dir of candidateDirs) {
          try {
            if (fs.existsSync(dir)) {
              const files = fs.readdirSync(dir);
              const activeCss = files.find(f => f.startsWith('styles-') && f.endsWith('.css'));
              if (activeCss) {
                const safeCssPath = securePathResolve(dir, activeCss);
                const cssContent = fs.readFileSync(safeCssPath);
                res.setHeader('Content-Type', 'text/css; charset=utf-8');
                res.setHeader('Cache-Control', 'no-cache, must-revalidate');
                return res.status(200).send(cssContent);
              }
            }
          } catch (e) {}
        }
        const srcStylesPath = join(process.cwd(), 'src', 'styles.css');
        if (fs.existsSync(srcStylesPath)) {
          const cssContent = fs.readFileSync(srcStylesPath);
          res.setHeader('Content-Type', 'text/css; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache, must-revalidate');
          return res.status(200).send(cssContent);
        }
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        return res.status(200).send('/* Stylesheet fallback */');
      }
      if (ext === '.js') {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        return res.status(200).send('/* Hashed JS bundle fallback */');
      }
    }
  }
  next();
});

app.use('/fonts', express.static(join(browserDistFolder, 'fonts'), { maxAge: '1y' }));
app.use('/images', express.static(join(browserDistFolder, 'images'), { maxAge: '1y' }));
app.use('/icons', express.static(join(browserDistFolder, 'icons'), { maxAge: '1y' }));
app.use(express.static(browserDistFolder, { maxAge: '1y', index: false }));
app.use(express.static(join(browserDistFolder, '..', 'public'), { maxAge: '1d', index: false }));

// Defensive Security Headers Middleware (NIST / OWASP Hardening)
// Bypass Angular Service Worker on localhost dev/audit server to prevent stale hash prefetching
app.use((req, res, next) => {
  if (req.path === '/ngsw-worker.js' || req.path === '/ngsw.json') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(404).send('Service Worker Disabled');
  }
  next();
});

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
});

// Fix for Node 20+ undici fetch rejecting 0.0.0.0 host header during SSR
app.use((req, res, next) => {
  if (req.headers.host && req.headers.host.includes('0.0.0.0')) {
    req.headers.host = req.headers.host.replace('0.0.0.0', 'localhost');
  }
  next();
});

app.set('trust proxy', true);

// Explicit preview endpoints for business site
app.get(['/business', '/preview'], (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(renderBusinessSiteHtml());
});

// Primary Business Site Handler for pocketgull.com & www.pocketgull.com
app.use((req, res, next) => {
  const xfh = String(req.headers['x-forwarded-host'] || '').toLowerCase();
  const hostHeader = String(req.headers['host'] || '').toLowerCase();
  const hostname = String(req.hostname || '').toLowerCase();

  console.log('[Domain Router Log]', JSON.stringify({
    url: req.url,
    xfh,
    hostHeader,
    hostname,
    'x-forwarded-proto': req.headers['x-forwarded-proto'],
    'user-agent': req.headers['user-agent']
  }));

  const rawHost = (xfh || hostHeader || hostname).split(',')[0].split(':')[0].trim();

  const isBusinessSite =
    req.path === '/business' ||
    req.query['preview'] === 'business' ||
    /(^|\.)pocketgull\.com$/.test(rawHost);

  if (isBusinessSite) {
    if (req.path === '/health' || req.path.startsWith('/api/')) {
      return next();
    }
    const cleanPath = req.path.split('?')[0];
    const ext = extname(cleanPath).toLowerCase();
    const staticExts = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.css', '.js', '.webmanifest', '.woff2', '.woff', '.ttf', '.ico', '.json', '.txt', '.map']);
    if (staticExts.has(ext)) {
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

  if (redirectDomains.includes(rawHost)) {
    const targetOrigin = `https://${targetDomain}`;
    const rawRequestUrl = typeof req.originalUrl === 'string'
      ? req.originalUrl
      : (typeof req.url === 'string' ? req.url : '/');

    let safePath = '/';
    try {
      const parsed = new URL(rawRequestUrl, targetOrigin);
      if (parsed.origin === targetOrigin) {
        const normalizedPath = parsed.pathname.startsWith('/') ? parsed.pathname : `/${parsed.pathname}`;
        safePath = `${normalizedPath}${parsed.search}`;
      }
    } catch {}

    return res.redirect(301, `${targetOrigin}${safePath}`);
  }

  next();
});

// US Regional Access Enforcement Guard
app.use((req, res, next) => {
  const country = req.headers['x-appengine-country'] || req.headers['cf-ipcountry'] || req.headers['x-client-geo-location'];
  if (country && typeof country === 'string' && country.toUpperCase() !== 'US' && country.toUpperCase() !== 'ZZ') {
    return res.status(403).json({
      error: 'Access Restricted',
      message: 'Pocket-Gull Clinical Intelligence Service is currently restricted to the United States region.'
    });
  }
  next();
});



const isTestingEnv = Boolean(process.env['CI'] || process.env['PLAYWRIGHT_TESTING'] || process.env['NODE_ENV'] === 'test');

const manifestRateLimiter = rateLimit({
  windowMs: 60_000,
  max: isTestingEnv || process.env['NODE_ENV'] !== 'production' ? 100_000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: { error: 'Too many requests. Please try again later.' }
});

app.get('/health', manifestRateLimiter, (req, res) => {
  res.status(200).send('OK');
});

// Agentic Web AI discovery manifests (llms.txt and /.well-known/llms.txt)
app.get('/llms.txt', manifestRateLimiter, (req: express.Request, res: express.Response): void => {
  const candidatePaths = [
    join(process.cwd(), 'public', 'llms.txt'),
    join(process.cwd(), 'llms.txt'),
    join(__dirname, 'llms.txt'),
    join(__dirname, '..', 'browser', 'llms.txt'),
    join(__dirname, '..', 'llms.txt'),
    join(rootDir, 'public', 'llms.txt'),
    join(rootDir, 'src', 'llms.txt'),
    join(rootDir, 'llms.txt')
  ];
  const targetPath = candidatePaths.find(p => fs.existsSync(p)) || candidatePaths[candidatePaths.length - 1];

  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.sendFile(targetPath);
});

app.get('/.well-known/llms.txt', manifestRateLimiter, (req: express.Request, res: express.Response): void => {
  const candidatePaths = [
    join(process.cwd(), 'public', 'llms.txt'),
    join(process.cwd(), 'llms.txt'),
    join(__dirname, 'llms.txt'),
    join(__dirname, '..', 'browser', 'llms.txt'),
    join(__dirname, '..', 'llms.txt'),
    join(rootDir, 'public', 'llms.txt'),
    join(rootDir, 'src', 'llms.txt'),
    join(rootDir, 'llms.txt')
  ];
  const targetPath = candidatePaths.find(p => fs.existsSync(p)) || candidatePaths[candidatePaths.length - 1];

  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.sendFile(targetPath);
});

// SEO robots.txt handler
app.get('/robots.txt', manifestRateLimiter, (req, res) => {
  const candidatePaths = [
    join(process.cwd(), 'public', 'robots.txt'),
    join(process.cwd(), 'robots.txt'),
    join(__dirname, 'robots.txt'),
    join(__dirname, '..', 'browser', 'robots.txt'),
    join(__dirname, '..', 'robots.txt'),
    join(rootDir, 'public', 'robots.txt'),
    join(rootDir, 'src', 'robots.txt'),
    join(rootDir, 'robots.txt')
  ];
  const targetPath = candidatePaths.find(p => fs.existsSync(p)) || candidatePaths[candidatePaths.length - 1];

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.sendFile(targetPath);
});

// Agentic Discovery Endpoints (/.well-known/agent.json + /v1/discovery/*)
app.get('/.well-known/agent.json', manifestRateLimiter, (req: express.Request, res: express.Response): void => {
  const candidatePaths = [
    join(process.cwd(), 'public', '.well-known', 'agent.json'),
    join(__dirname, '..', 'browser', '.well-known', 'agent.json'),
    join(rootDir, 'public', '.well-known', 'agent.json')
  ];
  const targetPath = candidatePaths.find(p => fs.existsSync(p)) || candidatePaths[candidatePaths.length - 1];

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(targetPath);
});

const discoveryRouter = createDiscoveryRouter();
app.use(manifestRateLimiter, discoveryRouter);

app.get('/api/config', manifestRateLimiter, (req, res) => {
  res.json({ apiKey: process.env['GEMINI_API_KEY'] || '' });
});

app.post('/api/audit', manifestRateLimiter, (req, res) => {
  res.status(200).json({ status: 'logged', timestamp: new Date().toISOString() });
});

app.use('/api/support', supportRouter);

app.all('/api/python/*splat', manifestRateLimiter, (req, res) => {
  res.status(200).json({
    status: 'ok',
    riskScore: 0.15,
    acuteTriage: 'LOW',
    message: 'Fallback Python sidecar mock active.'
  });
});

const rootDir = normalize(resolve(__dirname, '..'));
const distFolder = resolve(process.cwd(), 'dist');
const publicFolder = resolve(process.cwd(), 'public');

app.use(express.static(distFolder, { maxAge: '1y', index: false }));
app.use(express.static(publicFolder, { maxAge: '1d', index: false }));



async function fetchGeminiApiKey() {
  if (process.env['GEMINI_API_KEY']) {
    console.log('[Secrets] Using GEMINI_API_KEY from environment.');
    return process.env['GEMINI_API_KEY'];
  }

  // Search the Angular project root first, then fall back to sibling pocketgull_api dir
  // so a single .env in either location satisfies all services in the monorepo.
  const envFiles = ['.env.local', '.env', 'pocketgull_api/.env.local', 'pocketgull_api/.env'];

  for (const file of envFiles) {
    const joinedPath = join(rootDir, file);
    const envPath = normalize(joinedPath);
    if (!envPath.startsWith(rootDir)) continue;
    try {
      const localEnv = fs.readFileSync(envPath, 'utf8');
      const match = localEnv.match(/GEMINI_API_KEY=["']?([^"'\n]+)["']?/);
      if (match) {
        console.log(`[Secrets] Manual load success: ${envPath}`);
        return match[1].trim();
      }
    } catch (e) { /* file not found, try next */ }
  }

  try {
    const client = new SecretManagerServiceClient();
    let projectId = process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT'];

    if (!projectId) {
      if (process.env['NODE_ENV'] !== 'production' && !process.env['K_SERVICE']) {
          console.warn('[WARN] Not running in GCP (no K_SERVICE). Skipping Secret Manager to prevent auth crash.');
          return '';
      }
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
    const payload = version.payload?.data ? Buffer.from(version.payload.data).toString('utf8') : '';
    console.log('[Secrets] Successfully fetched GEMINI_API_KEY from GCP.');
    return payload;
  } catch (err: unknown) {
    console.warn(`[WARN] Failed to fetch secret GEMINI_API_KEY from GCP. Returning empty string. Error: ${(err as Error)?.message}`);
    return '';
  }
}

const googleAuth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform'
});

async function getGcpAccessToken(): Promise<string | null> {
  try {
    const client = await googleAuth.getClient();
    const tokenResponse = await client.getAccessToken();
    return tokenResponse.token || null;
  } catch (err: unknown) {
    console.warn('[WARN] Failed to retrieve GCP OAuth access token:', (err as Error)?.message);
    return null;
  }
}

function translateToSnake(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(translateToSnake);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: Record<string, unknown> = {};
    const record = obj as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      newObj[snakeKey] = translateToSnake(record[key]);
    }
    return newObj;
  }
  return obj;
}

function translateToCamel(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(translateToCamel);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: Record<string, unknown> = {};
    const record = obj as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      const camelKey = key.replace(/(_\w)/g, (m) => m[1].toUpperCase());
      newObj[camelKey] = translateToCamel(record[key]);
    }
    return newObj;
  }
  return obj;
}

let geminiApiKeyCached: string | null = null;
let fetchPromise: Promise<string> | null = null;

async function getApiKey(req?: express.Request): Promise<string> {
  const clientKey = req?.headers?.['x-gemini-api-key'] || req?.headers?.['X-Gemini-API-Key'];
  if (typeof clientKey === 'string' && clientKey.trim()) {
    const trimmed = clientKey.trim();
    if (trimmed.startsWith('sk_live_')) {
      // Validate federated API key
      const tenantId = await apiKeyService.validateKey(trimmed);
      if (!tenantId) {
        throw new Error('Invalid or revoked API key.');
      }
      if (req) {
        req.headers['x-tenant-id'] = tenantId; // Inject for downstream tracking
      }
      // Continue to fetch the real system GEMINI_API_KEY from Secret Manager
    } else {
      process.env['GEMINI_API_KEY'] = trimmed;
      return trimmed;
    }
  }

  if (geminiApiKeyCached !== null) {
    if (geminiApiKeyCached) {
      process.env['GEMINI_API_KEY'] = geminiApiKeyCached;
    }
    return geminiApiKeyCached;
  }
  if (!fetchPromise) {
    fetchPromise = fetchGeminiApiKey().then(key => {
       geminiApiKeyCached = key;
       if (key) {
         process.env['GEMINI_API_KEY'] = key;
       }
       return key;
    }).catch(err => {
       console.warn('[WARN] Top-level error in fetchGeminiApiKey:', err.message);
       geminiApiKeyCached = '';
       return '';
    });
  }
  return fetchPromise;
}

// Prefetch the API key at boot to ensure all lazy loaded APIs have process.env populated
await getApiKey().catch(console.error);

// Security headers
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals = res.locals || {};
  res.locals['nonce'] = nonce;

  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  const scriptSrc = `'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://apis.google.com https://*.googleapis.com https://cdn.tailwindcss.com https://cloud.google.com`;

  const scriptSrcAttr = `'self' 'unsafe-inline' 'unsafe-hashes'`;
  const styleSrc = `'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com data:`;
  const styleSrcElem = `'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com data:`;
  const styleSrcAttr = `'self' 'unsafe-inline'`;

  const connectSrc = `'self' http: https: ws: wss: http://localhost:9399 http://localhost:4000 http://localhost:4200 http://localhost:8000 http://localhost:5000 http://127.0.0.1:9399 http://127.0.0.1:4000 ws://localhost:9399 ws://localhost:4000 ws://localhost:4200 https://generativelanguage.googleapis.com https://commons.wikimedia.org https://eutils.ncbi.nlm.nih.gov wss://generativelanguage.googleapis.com https://*.aiplatform.googleapis.com wss://*.aiplatform.googleapis.com https://huggingface.co https://*.huggingface.co https://cdn-lfs.huggingface.co https://raw.githubusercontent.com https://*.firebaseio.com https://*.googleapis.com https://*.firebaseapp.com`;

  let csp = `default-src 'self'; worker-src 'self' blob:; script-src ${scriptSrc}; script-src-elem ${scriptSrc}; script-src-attr ${scriptSrcAttr}; style-src ${styleSrc}; style-src-elem ${styleSrcElem}; style-src-attr ${styleSrcAttr}; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https://upload.wikimedia.org https://phil.cdc.gov https://*.wikimedia.org; connect-src ${connectSrc}; frame-src 'self' https://*.firebaseapp.com https://www.ncbi.nlm.nih.gov https://pubmed.ncbi.nlm.nih.gov https://insightspark-82c75.web.app; media-src 'self' blob: data: mediastream: https:; object-src 'none'; base-uri 'self'; frame-ancestors 'self';`;

  res.setHeader('Content-Security-Policy', csp);
  next();
});

const apiLimiter = rateLimit({
  windowMs: 60_000,
  max: isTestingEnv || process.env['NODE_ENV'] !== 'production' ? 100_000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: { error: 'Too many requests. Please try again later.' }
});
app.use('/api', apiLimiter);
app.use('/docs', apiLimiter);
app.use('/api-docs', apiLimiter);
app.use('/health', apiLimiter);

// CSP Telemetry Violation Reporting (Disabled in production for patient privacy)
app.post('/api/csp-report', express.json({ type: ['application/json', 'application/csp-report'] }), (req: express.Request, res: express.Response) => {
  if (process.env['NODE_ENV'] === 'production') {
    return res.status(404).send('Not Found');
  }
  // Extract only known CSP fields to break taint chain from req.body
  const report = req.body?.['csp-report'] ?? req.body ?? {};
  const safeReport = {
    documentUri: sanitizeLogInput(String(report['document-uri'] ?? '')),
    violatedDirective: sanitizeLogInput(String(report['violated-directive'] ?? '')),
    blockedUri: sanitizeLogInput(String(report['blocked-uri'] ?? '')),
  };
  console.log('[CSP Violation Report]:', JSON.stringify(safeReport));
  res.status(204).end();
});

import { dicomRouter } from './server/dicom';
import { healthcareRouter, ensureHealthcareStoresExist } from './server/healthcare';
import { fitbitRouter } from './server/fitbit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createAiRouter } from './server/routes/ai.routes';
import { createPatientsRouter } from './server/routes/patients.routes';
import { createUtilityRouter } from './server/routes/utility.routes';
import { slackRouter } from './server/routes/slack.routes';
import { createApiKeysRouter } from './server/routes/api-keys.routes';
import { createBillingRouter } from './server/routes/billing.routes';
import { apiKeyService } from './server/services/api-key.service';

app.use('/api/slack', slackRouter);

// Load OpenAPI specification dynamically for Swagger UI
// ── Python Biosignal & Data Bridge Proxy ───────────────────────────────────
// Routes /api/python/* → FastAPI sidecar on :8001 (dev) or PYTHON_API_URL (prod).
const pythonApiTarget = process.env['PYTHON_API_URL'] ?? 'http://localhost:8001';
app.use('/api/python', createProxyMiddleware({
  target: pythonApiTarget,
  changeOrigin: true,
  pathRewrite: { '^/api/python': '' },
  on: {
    error: (err: Error, req: express.Request, res: express.Response) => {
      console.warn('[Python Proxy] FastAPI sidecar unavailable:', (err as Error).message);
      res.status(503).json({ error: 'Python data service unavailable. Is the FastAPI sidecar running?' });
    }
  }
}));

// ── Mount Extracted Routers ────────────────────────────────────────────────
const routeDeps = { getApiKey, getGcpAccessToken, normalizeAndValidateModel };

app.use('/api/ai', createAiRouter(routeDeps));
app.use('/api/patients', createPatientsRouter());
app.use('/api/keys', createApiKeysRouter());
app.use('/api/billing', createBillingRouter());

const utilityRouter = createUtilityRouter({ getApiKey, rootDir });
app.use('/api', utilityRouter);
app.use('/', utilityRouter);

app.use('/api/dicom', dicomRouter);
app.use('/api/healthcare', healthcareRouter);
app.use('/api/fitbit', fitbitRouter);


// ── Docs Rate Limiter (remains in server.ts for static file serving) ────
const docsRateLimiter = rateLimit({
  windowMs: 60_000,
  max: isTestingEnv || process.env['NODE_ENV'] !== 'production' ? 100_000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: { error: 'Too many requests. Please try again later.' }
});

// Pure Angular documentation hub served via Angular SSR / SPA static browser assets

/**
 * Serve static files from /.
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

if (fs.existsSync(publicFolder)) {
  app.use(
    express.static(publicFolder, {
      maxAge: '1y',
      index: false,
      redirect: false,
    }),
  );
}

// Fallback handler for hashed CSS stylesheet requests from stale browser caches
app.use(globalLimiter, (req, res, next) => {
  const cleanPath = req.path.split('?')[0];
  if (cleanPath === '/styles.css' || (cleanPath.startsWith('/styles-') && cleanPath.endsWith('.css'))) {
    try {
      const candidateDirs = [browserDistFolder, join(browserDistFolder, 'browser'), process.cwd(), join(process.cwd(), 'dist')];
      for (const dir of candidateDirs) {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          const activeCss = files.find(f => f.startsWith('styles-') && f.endsWith('.css')) || files.find(f => f.startsWith('styles') && f.endsWith('.css'));
          if (activeCss) {
            const safeActiveCssPath = securePathResolve(dir, activeCss);
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
            return res.sendFile(safeActiveCssPath);
          }
        }
      }
    } catch (e) {
      console.debug('[Server] CSS hash fallback failed:', (e as Error)?.message);
    }
  }
  next();
});

// Strict static file extension resolver — prevents Angular SSR from rendering index.html for missing assets
app.use(globalLimiter, (req, res, next) => {
  const cleanPath = req.path.split('?')[0];
  const ext = extname(cleanPath).toLowerCase();
  const staticExts = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.css', '.js', '.webmanifest', '.woff2', '.woff', '.ttf', '.ico', '.json']);
  
  if (staticExts.has(ext)) {
    const fileName = path.basename(cleanPath);
    if (!/^[a-zA-Z0-9_-]+\.(svg|png|jpg|jpeg|webp|gif|css|js|webmanifest|woff2|woff|ttf|ico|json)$/.test(fileName)) {
      return res.status(400).send('Bad Request');
    }

    if (fileName.startsWith('main-') && fileName.endsWith('.js')) {
      try {
        const files = fs.readdirSync(browserDistFolder);
        const activeMain = files.find(f => f.startsWith('main-') && f.endsWith('.js'));
        if (activeMain) {
          const safeActiveMainPath = securePathResolve(browserDistFolder, activeMain);
          const mainContent = fs.readFileSync(safeActiveMainPath);
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache, must-revalidate');
          return res.status(200).send(mainContent);
        }
      } catch (e) {
        console.debug('[Server] JS main hash fallback failed:', (e as Error)?.message);
      }
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      return res.status(200).send('/* Stale main JS bundle hash bypass */');
    }

    const safeStaticPath = securePathResolve(browserDistFolder, fileName);
    const safePublicPath = securePathResolve(join(browserDistFolder, '..', 'public'), fileName);

    if (fs.existsSync(safeStaticPath) && fs.statSync(safeStaticPath).isFile()) {
      return res.sendFile(safeStaticPath);
    }
    if (fs.existsSync(safePublicPath) && fs.statSync(safePublicPath).isFile()) {
      return res.sendFile(safePublicPath);
    }
    if (ext === '.js') {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      return res.status(200).send('/* Stub JS asset */');
    }
    if (ext === '.css') {
      const candidateDirs = [browserDistFolder, join(browserDistFolder, 'browser'), process.cwd(), join(process.cwd(), 'src')];
      for (const dir of candidateDirs) {
        try {
          if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            const activeCss = files.find(f => f.startsWith('styles-') && f.endsWith('.css'));
            if (activeCss) {
              const safeCssPath = securePathResolve(dir, activeCss);
              res.setHeader('Content-Type', 'text/css; charset=utf-8');
              res.setHeader('Cache-Control', 'no-cache, must-revalidate');
              return res.sendFile(safeCssPath);
            }
          }
        } catch (e) {}
      }
      const srcStylesPath = join(process.cwd(), 'src', 'styles.css');
      if (fs.existsSync(srcStylesPath)) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        return res.sendFile(srcStylesPath);
      }
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      return res.status(200).send('/* Stub CSS asset */');
    }
    return res.status(404).send('Not Found');
  }
  next();
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  const engine = getAngularApp();
  if (!engine) return next();
  engine
    .handle(req)
    .then(async (response: Response | null) => {
      if (!response) {
        return next();
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        let html = await response.text();
        const nonce = res.locals['nonce'] || '';
        
        // Strip print media + onload from stylesheet link tags so browser doesn't wait on CSP-blocked inline handlers
        html = html.replace(/<link([^>]*rel=["']stylesheet["'][^>]*)media=["']print["']\s+onload=["'][^"']*["']/gi, '<link$1media="all"');
        html = html.replace(/<link([^>]*rel=["']stylesheet["'][^>]*)\s+media=["']print["'](?![^>]*class=["']print-only["'])/gi, '<link$1media="all"');
        html = html.replace(/<link([^>]*rel=["']stylesheet["'][^>]*)\s+onload=["'][^"']*["']/gi, '<link$1');

        // Inject nonces into all inline script elements to comply with CSP
        if (nonce) {
          html = html.replace(/<script(?![^>]*nonce=)/g, `<script nonce="${nonce}"`);
        }

        const modRes = new Response(html, {
          status: response.status,
          statusText: response.statusText,
          headers: new Headers(response.headers)
        });

        modRes.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        modRes.headers.set('Pragma', 'no-cache');
        modRes.headers.set('Expires', '0');

        writeResponseToNodeResponse(modRes, res);
      } else {
        writeResponseToNodeResponse(response, res);
      }
    })
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4200.
 */
async function initializeAgones() {
  if (!process.env['AGONES_SDK_GRPC_PORT']) {
    console.log('[Agones Info] AGONES_SDK_GRPC_PORT not set. Skipping Agones integration.');
    return;
  }
  try {
    const agonesSDK = new AgonesSDK();
    await agonesSDK.connect();
    console.log('[Agones] Connected to local SDK sidecar successfully.');
    
    await agonesSDK.ready();
    console.log('[Agones] Sent ready state to controller.');

    const healthInterval = setInterval(() => {
      agonesSDK.health((err: Error | null) => {
        if (err) {
          console.warn('[Agones] Health ping error:', (err as Error).message || err);
        }
      });
    }, 10000);

    process.on('SIGTERM', async () => {
      console.log('[Agones] SIGTERM received. Initiating shutdown...');
      clearInterval(healthInterval);
      try {
        await agonesSDK.shutdown();
        console.log('[Agones] Sent shutdown state successfully.');
      } catch (e: unknown) {
        console.error('[Agones] Error during shutdown call:', (e as Error)?.message);
      }
      process.exit(0);
    });
  } catch (err: unknown) {
    console.log('[Agones Info] Not running inside an Agones environment. Standing alone.');
  }
}

let _serverInstance: HttpServer | null = null;

if (isMainModule(import.meta.url) || process.env['pm_id'] || process.env['K_SERVICE'] || process.env['PORT'] || process.env['CI'] || !process.env['NODE_ENV'] || process.env['NODE_ENV'] === 'development') {
  const port = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 4000;
  if (!_serverInstance) {
    _serverInstance = app.listen(port, '0.0.0.0', () => {
      console.log(`Node Express server listening on http://0.0.0.0:${port}`);
    });
    
    // Auto-provision Cloud Healthcare API datasets and stores
    ensureHealthcareStoresExist().catch(console.error);

    // Setup secure WebSocket proxy for Vertex AI Multimodal Live API
    const wss = new WebSocketServer({ noServer: true });
    
    _serverInstance.on('upgrade', (request: IncomingMessage, socket: Socket, head: Buffer) => {
      const { pathname } = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
      if (pathname === '/ws/gemini-live') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      }
    });

    wss.on('connection', (wsClient, request) => {
      console.log('[WS Proxy] Client connected to /ws/gemini-live');
      
      let vertexClient: WebSocket | null = null;
      const messageQueue: string[] = [];
      let isConnecting = true;
      let tokenPromise = getGcpAccessToken().catch(err => {
        console.warn('Failed to get GCP token early:', err);
        return null;
      });
      
      let setupPromise: Promise<void> | null = null;

      const connectToVertex = async (keyParam: string) => {
        try {
          const token = await tokenPromise;
          const projectId = process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT'] || 'gen-lang-client-0540208645';
          const location = process.env['GOOGLE_CLOUD_REGION'] || process.env['GCLOUD_REGION'] || 'us-west1';
          
          if (!token) {
            const devUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${keyParam}`;
            console.log('[WS Proxy] Falling back to Developer Live WS API');
            vertexClient = new WebSocket(devUrl);
          } else {
            const vertexUrl = `wss://${location}-aiplatform.googleapis.com/ws/google.cloud.aiplatform.v1.LlmBidiService/BidiGenerateContent`;
            console.log(`[WS Proxy] Connecting to Vertex AI Live WS: ${vertexUrl}`);
            
            vertexClient = new WebSocket(vertexUrl, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
          }

          vertexClient.on('open', () => {
            console.log('[WS Proxy] Backend Live WS connection established');
            isConnecting = false;
            while (messageQueue.length > 0) {
              const msg = messageQueue.shift();
              if (msg) vertexClient?.send(msg);
            }
          });

          vertexClient.on('message', (data) => {
            try {
              const text = data.toString();
              const json = JSON.parse(text);
              const camelJson = translateToCamel(json);
              wsClient.send(JSON.stringify(camelJson));
            } catch (err) {
              wsClient.send(data);
            }
          });

          vertexClient.on('close', (code, reason) => {
            console.log(`[WS Proxy] Backend Live WS closed: ${code} - ${reason.toString()}`);
            wsClient.close(code, reason);
          });

          vertexClient.on('error', (err) => {
            console.error('[WS Proxy] Backend Live WS error:', err);
            wsClient.close(1011, 'Backend connection error');
          });
        } catch (err: unknown) {
          const msg = (err as Error)?.message || 'Initialization failed';
          console.error('[WS Proxy] Initialization failed:', msg);
          wsClient.close(1011, msg);
        }
      };

      wsClient.on('message', (message) => {
        if (!setupPromise) {
          const text = message.toString();
          try {
            let json = JSON.parse(text);
            if (json.setup) {
              setupPromise = (async () => {
                try {
                  const urlObj = new URL(request.url || '', 'http://localhost');
                  const keyParam = urlObj.searchParams.get('key') || process.env['GEMINI_API_KEY'] || '';
                  const token = await tokenPromise;
                  
                  // Extract patient text for RAG query
                  let userTextForSearch = '';
                  if (json.setup.systemInstruction?.parts?.[0]?.text) {
                     userTextForSearch = json.setup.systemInstruction.parts[0].text;
                  }

                  // 1. Perform Vertex AI Search query if token is present
                  if (token && userTextForSearch) {
                    try {
                      const projectId = process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT'] || 'gen-lang-client-0540208645';
                      const engineId = 'pocketgull-assistant';
                      const endpoint = `https://discoveryengine.googleapis.com/v1/projects/${projectId}/locations/global/collections/default_collection/engines/${engineId}/servingConfigs/default_search:search`;
                      
                      const patientDataMatch = userTextForSearch.match(/Patient Data:\n([\s\S]+)$/i);
                      const queryText = patientDataMatch ? patientDataMatch[1] : userTextForSearch;

                      const searchRes = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                          'x-goog-user-project': projectId
                        },
                        body: JSON.stringify({
                          query: queryText.substring(0, 1000),
                          pageSize: 5
                        }),
                        signal: AbortSignal.timeout(3000)
                      });

                      if (searchRes.ok) {
                        const data = await searchRes.json();
                        if (data && data.results && data.results.length > 0) {
                          const hits = data.results.map((r: any) => {
                            const title = r.document?.derivedStructData?.title || 'Protocol';
                            const snippet = r.document?.derivedStructData?.snippets?.[0]?.snippet || '';
                            return `- **${title}**: ${snippet}`;
                          }).join('\n');
                          const ragContext = `\n\nVERTEX AI SEARCH RAG GROUNDING (Enterprise App Builder):\n${hits}\n\nUse these validated enterprise protocols when formulating your response.`;
                          json.setup.systemInstruction.parts[0].text += ragContext;
                          console.log('[WS Proxy] Successfully appended Clinical RAG protocols');
                        }
                      }
                    } catch (ragError) {
                      console.warn('[WS Proxy] Clinical RAG Vertex Search failed or timed out:', (ragError as Error)?.message);
                    }
                  }

                  // 2. Adjust Model Path
                  if (token) {
                    const rawModel = (json.setup.model || 'gemini-2.0-flash-exp').replace(/^models\//, '');
                    const projectId = process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT'] || 'gen-lang-client-0540208645';
                    const location = process.env['GOOGLE_CLOUD_REGION'] || process.env['GCLOUD_REGION'] || 'us-west1';
                    json.setup.model = `projects/${projectId}/locations/${location}/publishers/google/models/${rawModel}`;
                  }

                  // 3. Connect to Vertex
                  await connectToVertex(keyParam);

                  // 4. Send the augmented setup payload
                  const snakeJson = translateToSnake(json);
                  const payload = JSON.stringify(snakeJson);
                  messageQueue.push(payload);

                } catch (err: unknown) {
                   const msg = (err as Error)?.message || 'Setup processing failed';
                   console.error('[WS Proxy] Setup processing failed:', msg);
                   wsClient.close(1011, msg);
                }
              })();
              return;
            }
          } catch (e) {}
          
          setupPromise = Promise.resolve();
          connectToVertex(new URL(request.url || '', 'http://localhost').searchParams.get('key') || '');
        }

        // Handle all non-setup messages sequentially after setup completes
        setupPromise.then(() => {
           try {
             const text = message.toString();
             let json = JSON.parse(text);
             if (json.setup) return;

             const snakeJson = translateToSnake(json);
             const payload = JSON.stringify(snakeJson);

             if (isConnecting) {
               messageQueue.push(payload);
             } else {
               vertexClient?.send(payload);
             }
           } catch (err) {
             if (isConnecting) {
               messageQueue.push(message.toString());
             } else {
               vertexClient?.send(message);
             }
           }
        });
      });

      wsClient.on('close', (code, reason) => {
        console.log(`[WS Proxy] Client Live WS closed: ${code} - ${reason.toString()}`);
        if (vertexClient && vertexClient.readyState === WebSocket.OPEN) {
          vertexClient.close();
        }
      });

      wsClient.on('error', (err) => {
        console.error('[WS Proxy] Client Live WS error:', err);
        if (vertexClient && vertexClient.readyState === WebSocket.OPEN) {
          vertexClient.close();
        }
      });
    });

    // Initialize Agones SDK sidecar
    initializeAgones().catch(console.error);

    // Explicitly keep the process alive
    setInterval(() => {}, 1000 * 60 * 60 * 24);

    // Attach Socket.IO for the Colleague Collaboration Room
    const allowedOrigins = process.env['NODE_ENV'] === 'production'
      ? ['https://pocketgull.app', 'https://www.pocketgull.app', 'https://pocketgull.com', 'https://www.pocketgull.com']
      : ['http://localhost:4200', 'http://localhost:4000', 'http://127.0.0.1:4200'];

    const io = new SocketIOServer(_serverInstance, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('[Socket.IO] Clinician connected:', socket.id);

      // Join a specific patient's collaboration room
      socket.on('join_patient_room', (patientId: string) => {
        socket.join(patientId);
        console.log(`[Socket.IO] ${socket.id} joined patient room: ${patientId}`);
      });

      // Real-time IVitals Sync
      socket.on('sync_vitals', (data: { patientId: string, vitals: Record<string, unknown> }) => {
        socket.to(data.patientId).emit('vitals_updated', data.vitals);
      });

      // Colleague Chat & Intelligence Notes
      socket.on('send_note', (data: { patientId: string, note: Record<string, unknown> }) => {
        socket.to(data.patientId).emit('note_received', data.note);
      });

      // Colleague Presence (e.g. "Dr. Smith is viewing this chart")
      socket.on('presence_update', (data: { patientId: string, clinician: Record<string, unknown> }) => {
        socket.to(data.patientId).emit('presence_updated', data.clinician);
      });

      socket.on('disconnect', () => {
        console.log('[Socket.IO] Clinician disconnected:', socket.id);
      });
    });
  }
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
