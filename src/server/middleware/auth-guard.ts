// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

/**
 * Cryptographic Authentication, Session Token & M-of-N Dual-Custody Guard
 *
 * Enforces:
 * - HMAC-SHA256 signed clinician/admin session tokens (`pgs1.<payload>.<sig>`)
 *   using `SESSION_SIGNING_SECRET` or a per-boot CSPRNG secret (`crypto.randomBytes(32)`)
 *   with zero static string literals.
 * - Constant-time signature verification (`crypto.timingSafeEqual`).
 * - Federated `sk_live_` API key validation via `apiKeyService`.
 * - Cryptographic M-of-N Dual-Custody verification requiring two distinct signed
 *   approval tokens from different subject IDs with TTL <= 15 minutes where the
 *   authorizer holds a DPO / COMPLIANCE / CHIEF role claim.
 *
 * @module server/middleware/auth-guard
 */

import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { apiKeyService } from '../services/api-key.service';

export interface IAuthPrincipal {
  sub: string;
  email?: string;
  tenantId: string;
  role: string;
  roles: string[];
  patientId?: string;
  provider: 'hmac_session' | 'api_key' | 'local_demo';
  iat: number;
  exp: number;
}

export interface IAuthenticatedRequest extends Request {
  auth?: IAuthPrincipal;
}

export interface IDualCustodyTokenClaims {
  sub: string;
  role: string;
  action?: string;
  rationale?: string;
  iat: number;
  exp: number;
  jti: string;
  purpose: 'dual_custody';
}

export interface IDualCustodyVerificationResult {
  verified: boolean;
  reason: string;
  requestor?: IDualCustodyTokenClaims;
  authorizer?: IDualCustodyTokenClaims;
}

const SESSION_PREFIX = 'pgs1';
const DUAL_CUSTODY_PREFIX = 'pgdc1';
export const MAX_DUAL_CUSTODY_TTL_MS = 15 * 60 * 1000; // 15 minutes
const CLOCK_SKEW_TOLERANCE_MS = 30 * 1000;

let _ephemeralBootSecret: Buffer | null = null;
let _warnedMissingProdSecret = false;

/**
 * Returns true when running in production (NODE_ENV=production or Cloud Run K_SERVICE).
 * Note: CI=true NEVER downgrades production security enforcement.
 */
export function isStrictProductionEnv(): boolean {
  return process.env['NODE_ENV'] === 'production' || Boolean(process.env['K_SERVICE']);
}

/**
 * Resolves the HMAC-SHA256 signing key from `SESSION_SIGNING_SECRET`, falling back
 * to a per-boot 256-bit CSPRNG secret (`crypto.randomBytes(32)`) — zero static literals.
 */
function getSigningKey(): Buffer {
  const configured = process.env['SESSION_SIGNING_SECRET']?.trim();
  if (configured && configured.length >= 16) {
    return crypto.createHash('sha256').update(configured, 'utf8').digest();
  }
  if (!_ephemeralBootSecret) {
    _ephemeralBootSecret = crypto.randomBytes(32);
    if (isStrictProductionEnv() && !_warnedMissingProdSecret) {
      _warnedMissingProdSecret = true;
      console.warn('[AuthGuard] SESSION_SIGNING_SECRET not set; using ephemeral per-boot 256-bit CSPRNG secret.');
    }
  }
  return _ephemeralBootSecret;
}

/**
 * Constant-time UTF-8 string comparison using crypto.timingSafeEqual.
 */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    // Perform dummy equal-length compare to reduce length-side-channel timing variance
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function computeHmacSignature(prefix: string, payloadB64: string): Buffer {
  return crypto
    .createHmac('sha256', getSigningKey())
    .update(`${prefix}.${payloadB64}`, 'utf8')
    .digest();
}

function verifySignedEnvelope<T>(token: unknown, expectedPrefix: string): T | null {
  if (typeof token !== 'string') return null;
  const trimmed = token.trim();
  const parts = trimmed.split('.');
  if (parts.length !== 3) return null;

  const [prefix, payloadB64, sigB64] = parts;
  if (prefix !== expectedPrefix || !payloadB64 || !sigB64) return null;

  let providedSig: Buffer;
  try {
    providedSig = Buffer.from(sigB64, 'base64url');
  } catch {
    return null;
  }

  const expectedSig = computeHmacSignature(expectedPrefix, payloadB64);
  if (providedSig.length !== expectedSig.length || !crypto.timingSafeEqual(providedSig, expectedSig)) {
    return null;
  }

  try {
    const json = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as T;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Mints an HMAC-SHA256 signed session token (`pgs1.<payload>.<signature>`).
 */
export function signSessionToken(params: {
  sub: string;
  email?: string;
  tenantId: string;
  role: string;
  roles?: string[];
  patientId?: string;
  ttlSeconds?: number;
}): string {
  const now = Date.now();
  const ttlMs = Math.max(60, Math.min(24 * 3600, params.ttlSeconds ?? 12 * 3600)) * 1000;
  const normalizedRoles = Array.from(
    new Set([params.role, ...(params.roles || [])].map(r => String(r).trim()).filter(Boolean))
  );

  const payload = {
    sub: params.sub,
    ...(params.email ? { email: params.email } : {}),
    tenantId: params.tenantId,
    role: params.role,
    roles: normalizedRoles,
    ...(params.patientId ? { patientId: params.patientId } : {}),
    iat: now,
    exp: now + ttlMs,
    jti: crypto.randomBytes(8).toString('hex')
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sigB64 = computeHmacSignature(SESSION_PREFIX, payloadB64).toString('base64url');
  return `${SESSION_PREFIX}.${payloadB64}.${sigB64}`;
}

/**
 * Verifies an HMAC-SHA256 signed session token and returns the authenticated principal.
 */
export function verifySessionToken(token: unknown): IAuthPrincipal | null {
  const payload = verifySignedEnvelope<Record<string, unknown>>(token, SESSION_PREFIX);
  if (!payload) return null;

  const sub = typeof payload['sub'] === 'string' ? payload['sub'].trim() : '';
  const tenantId = typeof payload['tenantId'] === 'string' ? payload['tenantId'].trim() : '';
  const role = typeof payload['role'] === 'string' ? payload['role'].trim() : '';
  const iat = typeof payload['iat'] === 'number' ? payload['iat'] : 0;
  const exp = typeof payload['exp'] === 'number' ? payload['exp'] : 0;

  if (!sub || !tenantId || !role || !Number.isFinite(iat) || !Number.isFinite(exp)) {
    return null;
  }

  const now = Date.now();
  if (exp <= now || iat > now + CLOCK_SKEW_TOLERANCE_MS) {
    return null;
  }

  const rawRoles = Array.isArray(payload['roles'])
    ? (payload['roles'] as unknown[]).filter((r): r is string => typeof r === 'string' && r.trim().length > 0)
    : [role];

  return {
    sub,
    email: typeof payload['email'] === 'string' ? payload['email'] : undefined,
    tenantId,
    role,
    roles: Array.from(new Set([role, ...rawRoles])),
    patientId: typeof payload['patientId'] === 'string' ? payload['patientId'] : undefined,
    provider: 'hmac_session',
    iat,
    exp
  };
}

/**
 * Mints a short-lived (TTL <= 15 min) cryptographic Dual-Custody approval token (`pgdc1.<payload>.<sig>`).
 */
export function signDualCustodyToken(params: {
  sub: string;
  role: string;
  action?: string;
  rationale?: string;
  ttlSeconds?: number;
}): string {
  const now = Date.now();
  const clampedTtlMs = Math.max(10, Math.min(900, params.ttlSeconds ?? 600)) * 1000;

  const claims: IDualCustodyTokenClaims = {
    sub: params.sub.trim(),
    role: params.role.trim().toUpperCase(),
    ...(params.action ? { action: params.action } : {}),
    ...(params.rationale ? { rationale: params.rationale.slice(0, 500) } : {}),
    iat: now,
    exp: now + clampedTtlMs,
    jti: crypto.randomBytes(8).toString('hex'),
    purpose: 'dual_custody'
  };

  const payloadB64 = Buffer.from(JSON.stringify(claims), 'utf8').toString('base64url');
  const sigB64 = computeHmacSignature(DUAL_CUSTODY_PREFIX, payloadB64).toString('base64url');
  return `${DUAL_CUSTODY_PREFIX}.${payloadB64}.${sigB64}`;
}

function hasHighAuthorityDualCustodyRole(role: string): boolean {
  const upper = role.toUpperCase();
  return (
    upper.includes('DPO') ||
    upper.includes('COMPLIANCE') ||
    upper.includes('CHIEF')
  );
}

/**
 * Verifies cryptographic M-of-N Dual-Custody separation of duties:
 * 1. Both requestorToken and authorizerToken must be valid HMAC-SHA256 signed `pgdc1` tokens.
 * 2. Both must be unexpired with TTL <= 15 minutes (`exp - iat <= 900_000`).
 * 3. Subject IDs (`sub`) MUST be distinct (prevents self-approval).
 * 4. Roles MUST be distinct (separation of duties).
 * 5. Authorizer MUST carry a `DPO`, `COMPLIANCE`, or `CHIEF` role claim.
 */
export function verifyDualCustodyTokens(
  requestorToken: unknown,
  authorizerToken: unknown
): IDualCustodyVerificationResult {
  if (typeof requestorToken !== 'string' || typeof authorizerToken !== 'string' || !requestorToken.trim() || !authorizerToken.trim()) {
    return {
      verified: false,
      reason: 'Missing cryptographic Dual-Custody tokens (requestorToken and authorizerToken are required).'
    };
  }

  const reqClaims = verifySignedEnvelope<IDualCustodyTokenClaims>(requestorToken, DUAL_CUSTODY_PREFIX);
  if (!reqClaims || reqClaims.purpose !== 'dual_custody') {
    return {
      verified: false,
      reason: 'Invalid or tampered Dual-Custody requestor token signature.'
    };
  }

  const authClaims = verifySignedEnvelope<IDualCustodyTokenClaims>(authorizerToken, DUAL_CUSTODY_PREFIX);
  if (!authClaims || authClaims.purpose !== 'dual_custody') {
    return {
      verified: false,
      reason: 'Invalid or tampered Dual-Custody authorizer token signature.'
    };
  }

  const now = Date.now();
  for (const [label, claims] of [
    ['requestor', reqClaims],
    ['authorizer', authClaims]
  ] as const) {
    if (!claims.sub || !claims.role || !Number.isFinite(claims.iat) || !Number.isFinite(claims.exp)) {
      return { verified: false, reason: `Malformed Dual-Custody ${label} token claims.` };
    }
    if (claims.exp <= now) {
      return { verified: false, reason: `Dual-Custody ${label} token has expired.` };
    }
    if (claims.iat > now + CLOCK_SKEW_TOLERANCE_MS) {
      return { verified: false, reason: `Dual-Custody ${label} token iat is in the future.` };
    }
    if (claims.exp - claims.iat > MAX_DUAL_CUSTODY_TTL_MS) {
      return { verified: false, reason: `Dual-Custody ${label} token TTL exceeds 15-minute maximum.` };
    }
  }

  if (reqClaims.sub.trim().toLowerCase() === authClaims.sub.trim().toLowerCase()) {
    return {
      verified: false,
      reason: 'Separation of Duties violation: requestor and authorizer subject IDs must be distinct.'
    };
  }

  if (reqClaims.role.trim().toUpperCase() === authClaims.role.trim().toUpperCase()) {
    return {
      verified: false,
      reason: 'Separation of Duties violation: requestor and authorizer roles must be distinct.'
    };
  }

  if (!hasHighAuthorityDualCustodyRole(authClaims.role)) {
    return {
      verified: false,
      reason: 'Dual-Custody authorizer must hold a DPO, COMPLIANCE, or CHIEF role claim.'
    };
  }

  return {
    verified: true,
    reason: `Cryptographic Dual-Custody verified (${reqClaims.sub}:${reqClaims.role} + ${authClaims.sub}:${authClaims.role}).`,
    requestor: reqClaims,
    authorizer: authClaims
  };
}

function matchesRequiredRoles(principal: IAuthPrincipal, requiredRoles: string[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  const userRolesUpper = principal.roles.map(r => r.toUpperCase());

  return requiredRoles.some(reqRole => {
    const target = reqRole.toUpperCase();
    if (userRolesUpper.includes(target)) return true;

    // Canonical role hierarchy mappings
    if (target === 'ADMIN' || target === 'SOC') {
      return userRolesUpper.some(
        r =>
          r === 'ADMIN' ||
          r === 'SOC' ||
          r === 'SOC_ADMIN' ||
          r === 'ROLES/HEALTHCARE.DATASETADMIN' ||
          r.includes('DPO') ||
          r.includes('CHIEF')
      );
    }
    if (target === 'CLINICIAN') {
      return userRolesUpper.some(
        r =>
          r === 'CLINICIAN' ||
          r === 'ADMIN' ||
          r === 'API_CLIENT' ||
          r === 'ROLES/AIPLATFORM.USER' ||
          r === 'ROLES/HEALTHCARE.DATASETADMIN' ||
          r === 'ROLES/BIGQUERY.JOBUSER'
      );
    }
    if (target === 'DPO' || target === 'COMPLIANCE') {
      return userRolesUpper.some(r => r.includes('DPO') || r.includes('COMPLIANCE') || r.includes('CHIEF'));
    }
    return false;
  });
}

function extractRawCredentials(req: Request): { bearerToken: string | null; apiKey: string | null } {
  const headers = (req.headers || {}) as Record<string, unknown>;
  const authHeader = typeof headers['authorization'] === 'string' ? headers['authorization'].trim() : '';
  const bearerToken = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : null;

  const headerApiKey =
    (typeof headers['x-api-key'] === 'string' && headers['x-api-key'].trim()) ||
    (typeof headers['x-gemini-api-key'] === 'string' && headers['x-gemini-api-key'].trim()) ||
    null;

  if (bearerToken && bearerToken.startsWith('sk_live_')) {
    return { bearerToken: null, apiKey: bearerToken };
  }

  return {
    bearerToken,
    apiKey: headerApiKey && headerApiKey.startsWith('sk_live_') ? headerApiKey : null
  };
}

/**
 * Resolves the authenticated principal from an incoming request without writing a response.
 */
export async function resolveAuthPrincipal(req: Request): Promise<IAuthPrincipal | null> {
  const existing = (req as IAuthenticatedRequest).auth;
  if (existing && existing.sub && existing.tenantId) {
    return existing;
  }

  const { bearerToken, apiKey } = extractRawCredentials(req);

  if (bearerToken) {
    const verified = verifySessionToken(bearerToken);
    if (verified) {
      (req as IAuthenticatedRequest).auth = verified;
      return verified;
    }
  }

  if (apiKey) {
    try {
      const tenantId = await apiKeyService.validateKey(apiKey);
      if (tenantId) {
        const now = Date.now();
        const principal: IAuthPrincipal = {
          sub: `apikey:${tenantId}`,
          tenantId,
          role: 'API_CLIENT',
          roles: ['API_CLIENT', 'CLINICIAN'],
          provider: 'api_key',
          iat: now,
          exp: now + 3600_000
        };
        (req as IAuthenticatedRequest).auth = principal;
        return principal;
      }
    } catch {
      return null;
    }
  }

  // Explicit opt-in local test demo fallback ONLY when NODE_ENV === 'test' and never in production
  if (
    !isStrictProductionEnv() &&
    process.env['NODE_ENV'] === 'test' &&
    process.env['ALLOW_UNAUTH_LOCAL_DEMO'] === 'true'
  ) {
    const now = Date.now();
    const demoPrincipal: IAuthPrincipal = {
      sub: 'test-local-demo-clinician',
      email: 'demo-clinician@pocketgull.local',
      tenantId: 'demo-tenant-local',
      role: 'CLINICIAN',
      roles: ['CLINICIAN', 'ADMIN', 'SOC', 'roles/aiplatform.user', 'roles/healthcare.datasetAdmin'],
      patientId: 'P001',
      provider: 'local_demo',
      iat: now,
      exp: now + 3600_000
    };
    (req as IAuthenticatedRequest).auth = demoPrincipal;
    return demoPrincipal;
  }

  return null;
}

/**
 * Express middleware enforcing verified HMAC-SHA256 Bearer session token or federated `sk_live_` API key.
 */
export function requireAuth(requiredRoles?: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const principal = await resolveAuthPrincipal(req);
    if (!principal) {
      res.status(401).json({
        error: 'Unauthorized: Verified Bearer session token or federated sk_live_ API key is required.'
      });
      return;
    }

    if (requiredRoles && requiredRoles.length > 0 && !matchesRequiredRoles(principal, requiredRoles)) {
      res.status(403).json({
        error: 'Forbidden: Insufficient clinical/administrative privileges for this endpoint.'
      });
      return;
    }

    next();
  };
}

/**
 * Verifies SCIM 2.0 Bearer Token using constant-time comparison against SCIM_BEARER_TOKEN
 * or a verified Admin/DPO HMAC session token. Fails closed when unconfigured/invalid.
 */
export function requireScimAuth() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const headers = (req.headers || {}) as Record<string, unknown>;
    const authHeader = typeof headers['authorization'] === 'string' ? headers['authorization'].trim() : '';
    const bearer = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';

    const configuredScimToken = process.env['SCIM_BEARER_TOKEN']?.trim();
    if (configuredScimToken && bearer && timingSafeStringEqual(bearer, configuredScimToken)) {
      (req as IAuthenticatedRequest).auth = {
        sub: 'scim-provisioner',
        tenantId: 'tenant_hospital_enterprise',
        role: 'ADMIN',
        roles: ['ADMIN', 'SCIM_PROVISIONER'],
        provider: 'hmac_session',
        iat: Date.now(),
        exp: Date.now() + 3600_000
      };
      next();
      return;
    }

    const principal = await resolveAuthPrincipal(req);
    if (principal && matchesRequiredRoles(principal, ['ADMIN'])) {
      next();
      return;
    }

    res.status(401).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Unauthorized: Valid SCIM 2.0 Bearer token required.',
      status: '401'
    });
  };
}
