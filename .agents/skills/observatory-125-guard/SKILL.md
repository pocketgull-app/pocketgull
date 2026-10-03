---
name: observatory-125-guard
description: Automated verification and enforcement of the Mozilla HTTP Observatory 125/100 (Grade A+) security posture across all web applications, SSR servers, FastAPI sidecars, and edge endpoints.
---

# Mozilla HTTP Observatory 125 & Zero-Drift Security Guard

This skill guides agents in designing, verifying, and maintaining web applications that achieve and preserve a top-tier **125 / 100 (Grade A+)** score on [Mozilla HTTP Observatory](https://developer.mozilla.org/en-US/observatory).

## The 125 Score Architecture

Mozilla Observatory starts with a baseline score of 100.
Bonus points (+25 total) are **strictly gated**: they are ONLY awarded if the baseline score is $\ge 90$ with zero test failures. Any CSP penalty (−20) instantly revokes all 25 bonus points, dropping a 125 site to 80 (Grade B+).

### Bonus Point Rubric (+25 pts)
1. **+10 pts — Strict Transport Security (HSTS Preload)**:
   `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
2. **+5 pts — Cross-Origin Opener Policy (COOP)**:
   `Cross-Origin-Opener-Policy: same-origin`
3. **+5 pts — Cross-Origin Resource Policy (CORP)**:
   `Cross-Origin-Resource-Policy: same-origin`
4. **+5 pts — Referrer Policy**:
   `Referrer-Policy: strict-origin-when-cross-origin`

### Mandatory Baseline Rubric (Zero Penalty)
1. **Content Security Policy (CSP3)**:
   - `default-src 'none'` (Deny by default)
   - Per-request cryptographic nonces (`'nonce-${nonce}'`) combined with `'strict-dynamic'`
   - **Zero `'unsafe-inline'`** in `script-src`
   - **Zero `'unsafe-eval'`** in `script-src`
   - `form-action 'self'`
   - `object-src 'none'`
   - `base-uri 'self'`
   - `frame-ancestors 'self'` (or `'none'`)
2. **Cross-Origin Embedder Policy (COEP)**:
   `Cross-Origin-Embedder-Policy: credentialless`
3. **MIME Sniffing Prevention**:
   `X-Content-Type-Options: nosniff`
4. **Anti-Framing**:
   `X-Frame-Options: SAMEORIGIN` (or `DENY`)

---

## The Middleware #1 Top-of-Stack Invariant

**Root Cause of Silent Degeneracies**: If any route handler, static file server, domain dispatcher (`isBusinessSite`), or API proxy is mounted *before* the security headers middleware, matching requests exit early with `res.send()`, completely stripping CSP, HSTS, and bonus headers.

### Required Server Topology (Express / Node.js):
```typescript
import express from 'express';
import compression from 'compression';
import crypto from 'node:crypto';

const app = express();
app.use(compression());

// ⚡ INVARIANT: Security middleware MUST be registered here (Middleware #1)
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals = res.locals || {};
  res.locals.nonce = nonce;

  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  const scriptSrc = isProd
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval' https://apis.google.com https://cloud.google.com`
    : `'self' 'unsafe-inline' 'unsafe-eval' ...`;

  res.setHeader('Content-Security-Policy', [
    "default-src 'none'",
    `script-src ${scriptSrc}`,
    "form-action 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'self'"
  ].join('; '));

  next();
});

// All domain routers, business site logic, API routes, and static handlers go BELOW:
app.use(domainRouter);
app.use(express.static(...));
```

---

## FastAPI / Python Sidecars
For FastAPI or ASGI Python microservices (`pocketgull_api/main.py`), add the exact security header middleware:
```python
@app.middleware("http")
async def security_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'; base-uri 'none';"
    return response
```

---

## Verification Commands
- Run local continuous guard: `npm run observatory:audit`
- Run cross-project ecosystem audit: `npm run observatory:portfolio`
- Shift-left pre-commit check (Check 12): `node scripts/pre-commit-check.cjs`
