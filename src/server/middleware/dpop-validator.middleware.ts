/**
 * @file dpop-validator.middleware.ts
 * @description RFC 9449 Demonstrating Proof-of-Possession (DPoP) Server Middleware.
 * Validates inbound client DPoP JWT proofs to prevent token replay, credential theft, and unauthorized tool calls.
 */

import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

// In-memory cache of recent JTIs (NIST replay defense, TTL 5 minutes)
const seenJtis = new Map<string, number>();

// Clean up expired replay cache entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [jti, timestamp] of seenJtis.entries()) {
    if (now - timestamp > 300000) {
      seenJtis.delete(jti);
    }
  }
}, 60000).unref();

export function validateDPoPProof(
  dpopHeader: string | undefined,
  expectedMethod: string,
  expectedPath: string
): { isValid: boolean; error?: string; jti?: string } {
  if (!dpopHeader || typeof dpopHeader !== 'string') {
    return { isValid: false, error: 'Missing DPoP header' };
  }

  const parts = dpopHeader.trim().split('.');
  if (parts.length !== 3) {
    return { isValid: false, error: 'Malformed DPoP JWT format' };
  }

  try {
    const headerJson = Buffer.from(parts[0], 'base64url').toString('utf-8');
    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf-8');

    const header = JSON.parse(headerJson);
    const payload = JSON.parse(payloadJson);

    if (header.typ !== 'dpop+jwt' || header.alg !== 'ES256' || !header.jwk) {
      return { isValid: false, error: 'Invalid DPoP header structure or unsupported alg' };
    }

    // 1. Verify HTTP Method (htm)
    if (payload.htm?.toUpperCase() !== expectedMethod.toUpperCase()) {
      return { isValid: false, error: `DPoP htm mismatch: expected ${expectedMethod}, got ${payload.htm}` };
    }

    // 2. Verify Canonical Path (htu)
    const normalizedExpected = expectedPath.split('?')[0];
    if (payload.htu && !payload.htu.includes(normalizedExpected)) {
      return { isValid: false, error: `DPoP htu mismatch: expected ${normalizedExpected}` };
    }

    // 3. Verify Clock Skew (iat within ±300s)
    const nowSec = Math.floor(Date.now() / 1000);
    if (!payload.iat || Math.abs(nowSec - payload.iat) > 300) {
      return { isValid: false, error: 'DPoP proof expired or invalid timestamp' };
    }

    // 4. Replay attack verification (jti uniqueness)
    const jti = payload.jti;
    if (!jti || seenJtis.has(jti)) {
      return { isValid: false, error: 'DPoP jti replayed or missing' };
    }
    seenJtis.set(jti, Date.now());

    // 5. Verify cryptographic ECDSA P-256 signature using Node crypto KeyObject
    const keyObject = crypto.createPublicKey({
      key: {
        kty: 'EC',
        crv: 'P-256',
        x: header.jwk.x,
        y: header.jwk.y
      },
      format: 'jwk'
    });

    const verify = crypto.createVerify('SHA256');
    verify.update(`${parts[0]}.${parts[1]}`);
    const signatureBuffer = Buffer.from(parts[2], 'base64url');

    // Convert raw IEEE P1363 ECDSA signature to DER if required
    const isVerified = verify.verify(
      {
        key: keyObject,
        dsaEncoding: 'ieee-p1363'
      },
      signatureBuffer
    );

    if (!isVerified) {
      return { isValid: false, error: 'DPoP cryptographic signature verification failed' };
    }

    return { isValid: true, jti };
  } catch (err) {
    return { isValid: false, error: `DPoP parse failure: ${(err as Error).message}` };
  }
}

/**
 * Express middleware to enforce DPoP validation on protected tool call / research routes.
 */
export function requireDPoPAuth() {
  return (req: Request, res: Response, next: NextFunction) => {
    const dpopHeader = req.headers['dpop'] as string | undefined;
    const result = validateDPoPProof(dpopHeader, req.method, req.originalUrl || req.url);

    if (!result.isValid) {
      res.status(401).json({
        error: 'invalid_dpop_proof',
        error_description: result.error
      });
      return;
    }

    next();
  };
}
