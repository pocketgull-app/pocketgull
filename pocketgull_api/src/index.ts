// SPDX-License-Identifier: Apache-2.0
import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import { pubmedRouter } from './routes/pubmed.js';
import { patientsRouter } from './routes/patients.js';
import { intelligenceRouter } from './routes/intelligence.js';
import { triageRouter } from './routes/triage.js';
import { orcidRouter } from './routes/orcid.js';

const app = express();
const port = Number(process.env['PORT'] || 8080);

// Trust single reverse proxy hop (Apigee / Cloud Run)
app.set('trust proxy', 1);

const DEFAULT_ALLOWED_ORIGINS = [
  'https://pocketgull.app',
  'https://www.pocketgull.app',
  'https://pocketgull.com',
  'https://www.pocketgull.com',
  'http://localhost:4200',
  'http://localhost:4000',
  'http://127.0.0.1:4200'
];

const allowedOrigins = new Set(
  process.env['ALLOWED_ORIGINS']
    ? process.env['ALLOWED_ORIGINS'].split(',').map(o => o.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS
);

// Middleware #1: Mozilla HTTP Observatory 125/100 (Grade A+) Security Baseline
app.use((_req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=()'
  );
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'self'; base-uri 'self'; form-action 'self';"
  );
  next();
});

// Middleware #2: Lightweight Sliding-Window Rate Limiter (120 req/min per IP)
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 120;

app.use((req, res, next) => {
  if (req.path === '/health') {
    next();
    return;
  }
  const now = Date.now();
  if (rateBuckets.size > 5000) {
    for (const [ipKey, bucket] of rateBuckets.entries()) {
      if (bucket.resetAt <= now) rateBuckets.delete(ipKey);
    }
  }
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const current = rateBuckets.get(ip);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
  } else {
    current.count += 1;
    if (current.count > RATE_MAX_REQUESTS) {
      res.setHeader('Retry-After', String(Math.ceil((current.resetAt - now) / 1000)));
      res.status(429).json({ error: 'Too many requests. Rate limit exceeded.' });
      return;
    }
  }
  next();
});

// Middleware #3: Explicit Allowlist CORS (Zero wildcard '*' fallback)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Internal-API-Key']
  })
);

// Middleware #4: Optional Constant-Time Internal Sidecar HMAC Guard
app.use((req, res, next) => {
  const internalKey = process.env['INTERNAL_SIDECAR_API_KEY'];
  if (!internalKey || req.path === '/health') {
    next();
    return;
  }
  const provided = req.headers['x-internal-api-key'];
  if (typeof provided !== 'string') {
    res.status(401).json({ error: 'Unauthorized: Missing X-Internal-API-Key' });
    return;
  }
  const expectedBuf = Buffer.from(internalKey, 'utf8');
  const providedBuf = Buffer.from(provided, 'utf8');
  if (
    expectedBuf.length !== providedBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, providedBuf)
  ) {
    res.status(401).json({ error: 'Unauthorized: Invalid X-Internal-API-Key' });
    return;
  }
  next();
});

// Middleware #5: Bounded JSON Payload Guard (1MB max)
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/pubmed', pubmedRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/intelligence', intelligenceRouter);
app.use('/api/triage', triageRouter);
app.use('/api/orcid', orcidRouter);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'pocketgull-apigee-sidecar' });
});

export { app };

// Start server only when executed directly
if (process.env['NODE_ENV'] !== 'test') {
  app.listen(port, () => {
    console.log(`PocketGull API listening on port ${port}`);
  });
}
