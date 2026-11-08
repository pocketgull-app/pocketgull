import '@angular/compiler';
import { GeminiContextCacheService } from './gemini-context-cache.service';

describe('GeminiContextCacheService', () => {
  let service: GeminiContextCacheService;

  beforeEach(() => {
    service = new GeminiContextCacheService();
  });

  it('1. Initializes with zero active context caches', () => {
    expect(service.totalActiveCaches()).toBe(0);
    expect(service.totalCachedTokensSaved()).toBe(0);
  });

  it('2. Computes a deterministic SHA-256 hash for FHIR bundles', async () => {
    const bundle = { resourceType: 'Bundle', id: 'b1', entry: [] };
    const hash1 = await service.computeFhirHash(bundle);
    const hash2 = await service.computeFhirHash(bundle);

    expect(hash1).toBeTruthy();
    expect(hash1).toBe(hash2);
  });

  it('3. Creates a new Gemini Context Cache resource with TTL and token estimates', async () => {
    const fhirBundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        { resource: { resourceType: 'Patient', id: 'p1', name: [{ text: 'Homo Sapiens' }] } },
        { resource: { resourceType: 'Observation', id: 'o1', valueQuantity: { value: 7.4 } } }
      ]
    };

    const cache = await service.createFhirContextCache(fhirBundle, 'Base Clinical Prompt', { ttlSeconds: 600 });

    expect(cache.cacheName).toContain('cachedContents/pg-cache-');
    expect(cache.tokenCount).toBeGreaterThan(0);
    expect(service.totalActiveCaches()).toBe(1);
    expect(service.totalCachedTokensSaved()).toBe(cache.tokenCount);
  });

  it('4. Reuses existing valid cache for identical FHIR bundle hash', async () => {
    const fhirBundle = { resourceType: 'Bundle', id: 'b-repeat' };

    const cache1 = await service.createFhirContextCache(fhirBundle);
    const cache2 = await service.createFhirContextCache(fhirBundle);

    expect(cache1.cacheName).toBe(cache2.cacheName);
    expect(service.totalActiveCaches()).toBe(1);
  });

  it('5. Calculates cost and token savings percentage for multi-turn consult sessions', async () => {
    const fhirBundle = { resourceType: 'Bundle', id: 'b-savings' };
    const cache = await service.createFhirContextCache(fhirBundle, 'High Complexity EHR Record');

    const savings = service.calculateTokenCostSavings(cache, 5);

    expect(savings.cachedTokensSaved).toBeGreaterThan(0);
    expect(savings.costSavingsPercent).toBeGreaterThanOrEqual(60);
  });

  it('6. Purges expired cache resources cleanly', async () => {
    const fhirBundle = { resourceType: 'Bundle', id: 'b-expired' };
    const cache = await service.createFhirContextCache(fhirBundle, 'Expired Prompt', { ttlSeconds: -10 }); // Already expired

    const hash = cache.fhirBundleHash;
    const hit = service.getValidCacheForFhirHash(hash);

    expect(hit).toBeNull();
    expect(service.totalActiveCaches()).toBe(0);
  });

  it('7. Clears all active caches on command', async () => {
    const bundle1 = { resourceType: 'Bundle', id: 'b1' };
    const bundle2 = { resourceType: 'Bundle', id: 'b2' };

    await service.createFhirContextCache(bundle1);
    await service.createFhirContextCache(bundle2);
    expect(service.totalActiveCaches()).toBe(2);

    service.clearAllCaches();
    expect(service.totalActiveCaches()).toBe(0);
  });

  it('8. Detects mid-session ZERO_DROP and SYSTEM_BOUNDARY_TRUNCATION events with excess token deltas', () => {
    // Turn 1: Healthy cached prefix (118,054 cached tokens)
    const t1 = service.recordTurnTelemetry(120000, 118054, 300, 50);
    expect(t1.cacheDropDetected).toBe(false);
    expect(t1.cacheDropType).toBe('NONE');

    // Turn 2: System-prompt boundary truncation (drops from 118,054 -> 16,284 with +690 excess tokens)
    const t2 = service.recordTurnTelemetry(121045, 16284, 250, 55);
    expect(t2.cacheDropDetected).toBe(true);
    expect(t2.cacheDropType).toBe('SYSTEM_BOUNDARY_TRUNCATION');
    expect(t2.previousCachedTokens).toBe(118054);
    expect(t2.excessTokenDelta).toBe(690);

    // Turn 3: Recovery to full cache (121,500 cached tokens)
    const t3 = service.recordTurnTelemetry(122000, 121500, 200, 40);
    expect(t3.cacheDropDetected).toBe(false);

    // Turn 4: Complete zero drop (121,500 -> 0)
    const t4 = service.recordTurnTelemetry(122800, 0, 180, 40);
    expect(t4.cacheDropDetected).toBe(true);
    expect(t4.cacheDropType).toBe('ZERO_DROP');
    expect(service.totalCacheDropsDetected()).toBe(2);
  });
});
