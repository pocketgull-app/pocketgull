/**
 * @file dpop-auth.interceptor.ts
 * @description RFC 9449 Demonstrating Proof-of-Possession (DPoP) & Cryptographic Identity Interceptor.
 * Generates client-bound cryptographic proof-of-possession JWTs for outgoing clinical and research tool calls.
 * Built using Web Crypto API and NIST SP 800-90A compliant CSPRNG hardware entropy.
 */

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// In-memory ephemeral ECDSA P-256 keypair (browser client session only; never shared across SSR requests)
let ephemeralKeyPair: CryptoKeyPair | null = null;
let publicJwk: JsonWebKey | null = null;

function isBrowserRuntime(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function isTrustedPocketGullApiUrl(rawUrl: string): boolean {
  if (!rawUrl) return false;
  // Same-origin relative API path
  if (rawUrl.startsWith('/api/')) {
    return true;
  }
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    // Exact sovereign production host or subdomain over HTTPS
    if (parsed.protocol === 'https:' && (hostname === 'pocketgull.app' || hostname.endsWith('.pocketgull.app'))) {
      return true;
    }
    // Strict same-origin /api/ match in browser
    if (
      typeof window !== 'undefined' &&
      window.location?.origin &&
      parsed.origin === window.location.origin &&
      parsed.pathname.startsWith('/api/')
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function getOrCreateDPoPKeyPair(): Promise<{ keyPair: CryptoKeyPair; jwk: JsonWebKey }> {
  const canCacheInBrowser = isBrowserRuntime();
  if (canCacheInBrowser && ephemeralKeyPair && publicJwk) {
    return { keyPair: ephemeralKeyPair, jwk: publicJwk };
  }

  // Generate ephemeral ECDSA P-256 key pair in non-extractable memory
  const generatedKeyPair = await globalThis.crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256'
    },
    false, // Private key is non-extractable
    ['sign']
  );

  const exportedJwk = await globalThis.crypto.subtle.exportKey(
    'jwk',
    generatedKeyPair.publicKey
  );

  // Only persist module-scoped keypair on the browser platform (never across SSR requests)
  if (canCacheInBrowser) {
    ephemeralKeyPair = generatedKeyPair;
    publicJwk = exportedJwk;
  }

  return { keyPair: generatedKeyPair, jwk: exportedJwk };
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function utf8ToBase64Url(str: string): string {
  return base64UrlEncode(new TextEncoder().encode(str));
}

export async function generateDPoPProof(
  httpMethod: string,
  targetUrl: string,
  accessToken?: string
): Promise<string> {
  const { keyPair, jwk } = await getOrCreateDPoPKeyPair();

  // Strip URL query parameters for htu canonical matching (RFC 9449 §4.3)
  const canonicalUrl = targetUrl.split('?')[0];

  // 1. DPoP Header containing embedded public JWK
  const header = {
    typ: 'dpop+jwt',
    alg: 'ES256',
    jwk: {
      kty: jwk.kty,
      crv: jwk.crv,
      x: jwk.x,
      y: jwk.y
    }
  };

  // 2. Generate NIST SP 800-90A CSPRNG JTI identifier
  const randomBytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(randomBytes);
  const jti = base64UrlEncode(randomBytes);

  // 3. DPoP Payload
  const payload: Record<string, unknown> = {
    jti,
    htm: httpMethod.toUpperCase(),
    htu: canonicalUrl,
    iat: Math.floor(Date.now() / 1000)
  };

  // Optional: access token hash binding (ath)
  if (accessToken) {
    const tokenBytes = new TextEncoder().encode(accessToken);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', tokenBytes);
    payload['ath'] = base64UrlEncode(new Uint8Array(hashBuffer));
  }

  const encodedHeader = utf8ToBase64Url(JSON.stringify(header));
  const encodedPayload = utf8ToBase64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  // 4. Sign over header.payload with private ECDSA key
  const signature = await globalThis.crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-256' }
    },
    keyPair.privateKey,
    new TextEncoder().encode(signingInput)
  );

  const encodedSignature = base64UrlEncode(new Uint8Array(signature));
  return `${signingInput}.${encodedSignature}`;
}

export const dpopAuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // Never generate or attach browser-bound DPoP proofs during SSR
  if (typeof window === 'undefined') {
    return next(req);
  }

  // Only attach DPoP tokens to strict same-origin /api/ or exact pocketgull.app endpoints
  if (!isTrustedPocketGullApiUrl(req.url)) {
    return next(req);
  }

  return from(
    generateDPoPProof(req.method, req.url)
      .then(dpopToken => {
        const cloned = req.clone({
          setHeaders: {
            DPoP: dpopToken
          }
        });
        return cloned;
      })
      .catch(() => req) // Graceful fallback on crypto error
  ).pipe(
    switchMap(modifiedReq => next(modifiedReq))
  );
};
