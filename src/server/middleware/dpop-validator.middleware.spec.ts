import { describe, it, expect } from 'vitest';
import { validateDPoPProof } from './dpop-validator.middleware';
import { generateDPoPProof } from '../../interceptors/dpop-auth.interceptor';

describe('DPoP Validator Middleware', () => {
  it('should reject missing DPoP header', () => {
    const result = validateDPoPProof(undefined, 'POST', '/api/research/payout');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Missing DPoP header');
  });

  it('should accept freshly generated client DPoP proof', async () => {
    const proof = await generateDPoPProof('POST', '/api/research/payout');
    const result = validateDPoPProof(proof, 'POST', '/api/research/payout');

    expect(result.isValid).toBe(true);
    expect(result.jti).toBeDefined();
  });

  it('should reject replayed DPoP token with same jti', async () => {
    const proof = await generateDPoPProof('POST', '/api/research/replay-test');
    
    // First pass should succeed
    const firstPass = validateDPoPProof(proof, 'POST', '/api/research/replay-test');
    expect(firstPass.isValid).toBe(true);

    // Second pass should fail on replay defense
    const secondPass = validateDPoPProof(proof, 'POST', '/api/research/replay-test');
    expect(secondPass.isValid).toBe(false);
    expect(secondPass.error).toContain('replayed');
  });

  it('should reject DPoP proof with mismatched HTTP method', async () => {
    const proof = await generateDPoPProof('GET', '/api/research/payout');
    const result = validateDPoPProof(proof, 'POST', '/api/research/payout');

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('htm mismatch');
  });
});
