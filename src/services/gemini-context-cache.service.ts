import { Injectable, signal, computed } from '@angular/core';

export interface IGeminiContextCacheConfig {
  /** Time-to-live in seconds for the Gemini context cache (default: 300s / 5 minutes) */
  ttlSeconds: number;
  /** Gemini target model for cached content execution */
  model: string;
  /** Human-readable display label for telemetry HUD */
  displayName: string;
  /** Optional flag to invoke backend /api/ai/context-cache/create for remote Explicit Context Cache pinning */
  syncRemote?: boolean;
}

export interface IGeminiCachedResource {
  /** Canonical resource ID returned by Gemini API (e.g., 'cachedContents/pg-fhir-cache-001') */
  cacheName: string;
  displayName: string;
  model: string;
  tokenCount: number;
  createdAt: string;
  expiresAt: string;
  fhirBundleHash: string;
  /** True when pinned on Vertex AI / Gemini Developer API via cachedContents.create */
  isRemotePinned?: boolean;
}

export interface IKvCacheTurnTelemetry {
  promptTokens: number;
  cachedTokens: number;
  candidateTokens: number;
  cacheDropDetected: boolean;
  cacheDropType: 'NONE' | 'ZERO_DROP' | 'SYSTEM_BOUNDARY_TRUNCATION';
  previousCachedTokens: number;
  excessTokenDelta: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiContextCacheService {
  private activeCaches = signal<Map<string, IGeminiCachedResource>>(new Map());
  private turnTelemetryLog = signal<IKvCacheTurnTelemetry[]>([]);

  readonly totalActiveCaches = computed<number>(() => this.activeCaches().size);
  readonly recentTurnTelemetry = computed<IKvCacheTurnTelemetry[]>(() => this.turnTelemetryLog());
  readonly totalCacheDropsDetected = computed<number>(() =>
    this.turnTelemetryLog().filter(t => t.cacheDropDetected).length
  );

  /**
   * Calculates total estimated tokens saved across all multi-turn cached consult calls.
   */
  readonly totalCachedTokensSaved = computed<number>(() => {
    let saved = 0;
    this.activeCaches().forEach(cache => {
      saved += cache.tokenCount;
    });
    return saved;
  });

  /**
   * Generates a fast SHA-256 hash of a FHIR Bundle to check for cached prompt hits.
   */
  async computeFhirHash(fhirBundle: Record<string, any>): Promise<string> {
    const jsonStr = JSON.stringify(fhirBundle || {});
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      return `hash-${jsonStr.length}`;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonStr);
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuf));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Creates a Gemini Context Cache entry for a multi-turn FHIR patient history.
   * Pre-loads heavy patient telemetry into Gemini's cache using `cachedContents.create`.
   * @see https://github.com/google-gemini/cookbook — Context Caching
   */
  async createFhirContextCache(
    fhirBundle: Record<string, any>,
    systemInstructions?: string,
    options: Partial<IGeminiContextCacheConfig> = {}
  ): Promise<IGeminiCachedResource> {
    const fhirHash = await this.computeFhirHash(fhirBundle);
    const existing = this.getValidCacheForFhirHash(fhirHash);

    if (existing) {
      console.log(`[Gemini Context Cache] Hit! Reusing cached resource: ${existing.cacheName}`);
      return existing;
    }

    const ttlSec = options.ttlSeconds ?? 300;
    const model = options.model || 'models/gemini-3.8-flash';
    const displayName = options.displayName || `FHIR Patient Context (${fhirHash.substring(0, 8)})`;

    const now = new Date();
    const expires = new Date(now.getTime() + ttlSec * 1000);

    // Approximate token count based on standard 4 chars / token heuristic
    const promptBody = `${systemInstructions || ''}\n${JSON.stringify(fhirBundle)}`;
    const estimatedTokens = Math.max(1024, Math.round(promptBody.length / 4));

    if (options.syncRemote && typeof fetch !== 'undefined') {
      try {
        const res = await fetch('/api/ai/context-cache/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fhirBundleHash: fhirHash,
            contentsText: JSON.stringify(fhirBundle),
            systemInstruction: systemInstructions,
            model,
            ttlSeconds: ttlSec,
            displayName
          })
        });
        if (res.ok) {
          const remoteResource = (await res.json()) as IGeminiCachedResource;
          const currentMap = new Map(this.activeCaches());
          currentMap.set(fhirHash, remoteResource);
          this.activeCaches.set(currentMap);
          return remoteResource;
        }
      } catch {
        // Fall back to local cache descriptor when offline or in unit tests
      }
    }

    const cacheResource: IGeminiCachedResource = {
      cacheName: `cachedContents/pg-cache-${fhirHash.substring(0, 12)}`,
      displayName,
      model,
      tokenCount: estimatedTokens,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      fhirBundleHash: fhirHash,
      isRemotePinned: false
    };

    const currentMap = new Map(this.activeCaches());
    currentMap.set(fhirHash, cacheResource);
    this.activeCaches.set(currentMap);

    console.log(`[Gemini Context Cache] Created new cache (${cacheResource.cacheName}) for ${cacheResource.tokenCount} tokens. Expires in ${ttlSec}s.`);
    return cacheResource;
  }

  /**
   * Records per-turn KV cache telemetry and detects mid-session zero drops or system-prompt boundary truncations.
   */
  recordTurnTelemetry(
    promptTokens: number,
    cachedTokens: number,
    candidateTokens: number = 0,
    expectedUserTokens: number = 0
  ): IKvCacheTurnTelemetry {
    const history = this.turnTelemetryLog();
    const prev = history.length > 0 ? history[history.length - 1] : null;
    const prevCached = prev ? prev.cachedTokens : 0;
    const prevTotal = prev ? prev.promptTokens + prev.candidateTokens : 0;

    let cacheDropDetected = false;
    let cacheDropType: 'NONE' | 'ZERO_DROP' | 'SYSTEM_BOUNDARY_TRUNCATION' = 'NONE';

    if (prevCached > 4096 && promptTokens > 4096) {
      if (cachedTokens === 0) {
        cacheDropDetected = true;
        cacheDropType = 'ZERO_DROP';
      } else if (cachedTokens < prevCached * 0.70) {
        cacheDropDetected = true;
        cacheDropType = 'SYSTEM_BOUNDARY_TRUNCATION';
      }
    }

    const actualGrowth = prevTotal > 0 ? promptTokens - prevTotal : 0;
    const excessTokenDelta = expectedUserTokens > 0 ? actualGrowth - expectedUserTokens : 0;

    const entry: IKvCacheTurnTelemetry = {
      promptTokens,
      cachedTokens,
      candidateTokens,
      cacheDropDetected,
      cacheDropType,
      previousCachedTokens: prevCached,
      excessTokenDelta
    };

    this.turnTelemetryLog.set([...history.slice(-49), entry]);
    return entry;
  }

  /**
   * Retrieves an unexpired Gemini Context Cache resource by FHIR bundle hash.
   */
  getValidCacheForFhirHash(fhirHash: string): IGeminiCachedResource | null {
    const cache = this.activeCaches().get(fhirHash);
    if (!cache) return null;

    const expiresTime = new Date(cache.expiresAt).getTime();
    if (Date.now() >= expiresTime) {
      this.purgeExpiredCaches();
      return null;
    }

    return cache;
  }

  /**
   * Calculates token cost savings percentage for multi-turn cached consults vs monolithic passes.
   */
  calculateTokenCostSavings(cache: IGeminiCachedResource, multiTurnCalls: number = 5): { cachedTokensSaved: number; costSavingsPercent: number } {
    if (multiTurnCalls <= 1) {
      return { cachedTokensSaved: 0, costSavingsPercent: 0 };
    }
    const fullMonolithicTokens = cache.tokenCount * multiTurnCalls;
    const cachedPassTokens = cache.tokenCount + (multiTurnCalls - 1) * 256; // 256 tokens per turn for incremental user prompt
    const saved = fullMonolithicTokens - cachedPassTokens;
    const savingsPercent = Math.round((saved / fullMonolithicTokens) * 100);

    return {
      cachedTokensSaved: Math.max(0, saved),
      costSavingsPercent: Math.max(0, savingsPercent)
    };
  }

  /**
   * Purges all expired cache entries.
   */
  purgeExpiredCaches(): void {
    const now = Date.now();
    const nextMap = new Map<string, IGeminiCachedResource>();

    this.activeCaches().forEach((cache, hash) => {
      if (new Date(cache.expiresAt).getTime() > now) {
        nextMap.set(hash, cache);
      }
    });

    this.activeCaches.set(nextMap);
  }

  /**
   * Evicts all active caches.
   */
  clearAllCaches(): void {
    this.activeCaches.set(new Map());
  }
}
