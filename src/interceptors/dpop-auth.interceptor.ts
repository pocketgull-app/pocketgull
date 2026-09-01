/**
 * @file dpop-auth.interceptor.ts
 * @description RFC 9449 Demonstrating Proof-of-Possession (DPoP) & Cryptographic Identity Interceptor.
 * Generates client-bound cryptographic proof-of-possession JWTs for outgoing clinical and research tool calls.
 * Built using Web Crypto API and NIST SP 800-90A compliant CSPRNG hardware entropy.
 */

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// In-memory ephemeral ECDSA P-256 keypair for the client session
let ephemeralKeyPair: CryptoKeyPair | null = null;
let publicJwk: JsonWebKey | null = null;

async function getOrCreateDPoPKeyPair(): Promise<{ keyPair: CryptoKeyPair; jwk: JsonWebKey }> {
  if (ephemeralKeyPair && publicJwk) {
    return { keyPair: ephemeralKeyPair, jwk: publicJwk };
  }

  // Generate ephemeral ECDSA P-256 key pair in non-extractable client memory
  ephemeralKeyPair = await globalThis.crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256'
    },
    false, // Private key is non-extractable
    ['sign']
  );

  publicJwk = await globalThis.crypto.subtle.exportKey(
    'jwk',
    ephemeralKeyPair.publicKey
  );

  return { keyPair: ephemeralKeyPair, jwk: publicJwk };
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
  // Only attach DPoP tokens to internal API endpoints
  if (!req.url.startsWith('/api/') && !req.url.includes('pocketgull')) {
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
