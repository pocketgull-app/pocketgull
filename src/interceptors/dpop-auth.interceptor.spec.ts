import { describe, it, expect } from 'vitest';
import { generateDPoPProof } from './dpop-auth.interceptor';

describe('DPoP Auth Interceptor (RFC 9449)', () => {
  it('should generate valid 3-part DPoP JWT with ES256 and public JWK header', async () => {
    const proof = await generateDPoPProof('POST', '/api/research/cohorts');
    expect(proof).toBeTruthy();

    const parts = proof.split('.');
    expect(parts.length).toBe(3);

    // Decode header
    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    expect(header.typ).toBe('dpop+jwt');
    expect(header.alg).toBe('ES256');
    expect(header.jwk).toBeDefined();
    expect(header.jwk.kty).toBe('EC');
    expect(header.jwk.crv).toBe('P-256');

    // Decode payload
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    expect(payload.htm).toBe('POST');
    expect(payload.htu).toBe('/api/research/cohorts');
    expect(payload.jti).toBeDefined();
    expect(payload.iat).toBeGreaterThan(0);
  });

  it('should attach access token hash (ath) when access token is provided', async () => {
    const proof = await generateDPoPProof('GET', '/api/ai/models', 'mock-access-token-12345');
    const parts = proof.split('.');
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    expect(payload.ath).toBeDefined();
    expect(typeof payload.ath).toBe('string');
  });
});
