import { Injectable, signal, computed } from '@angular/core';

// Global declaration for Chrome experimental Built-in AI APIs
declare global {
  interface Window {
    ai?: {
      semanticEmbedder?: {
        capabilities: () => Promise<{ available: 'readily' | 'after-download' | 'no' }>;
        create: (options?: { outputDimensionality?: number }) => Promise<{
          embed: (text: string) => Promise<{ embedding: Float32Array | number[] }>;
          embedBatch?: (texts: string[]) => Promise<Array<{ embedding: Float32Array | number[] }>>;
        }>;
      };
    };
  }
}

export interface ISemanticMatch<T = any> {
  id: string;
  text: string;
  score: number;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class OnDeviceEmbedderService {
  private embedderInstance: any = null;

  /** Indicates whether the native Chrome Semantic Embedder API is present in the current runtime */
  readonly isSupported = signal<boolean>(
    typeof window !== 'undefined' && !!(window as any)?.ai?.semanticEmbedder
  );

  readonly isComputing = signal<boolean>(false);
  readonly isReady = signal<boolean>(false);
  readonly lastError = signal<string | null>(null);

  /**
   * Initializes the native on-device embedder if available in Chrome Canary.
   */
  async initEmbedder(): Promise<boolean> {
    if (this.embedderInstance) {
      return true;
    }
    if (typeof window === 'undefined' || !(window as any)?.ai?.semanticEmbedder) {
      this.isSupported.set(false);
      return false;
    }

    try {
      const capabilities = await (window as any).ai.semanticEmbedder.capabilities();
      if (capabilities.available === 'no') {
        this.lastError.set('On-device Semantic Embedder is not available on this device.');
        return false;
      }
      this.embedderInstance = await (window as any).ai.semanticEmbedder.create();
      this.isSupported.set(true);
      this.isReady.set(true);
      return true;
    } catch (err: any) {
      this.lastError.set(err?.message || 'Failed to initialize on-device Semantic Embedder.');
      return false;
    }
  }

  /**
   * Computes a semantic embedding vector for clinical text.
   * Uses native Chrome Semantic Embedder API when available; otherwise generates
   * a deterministic, normalized 256-dimensional feature vector.
   */
  async computeEmbedding(text: string): Promise<Float32Array> {
    this.isComputing.set(true);
    try {
      const initialized = await this.initEmbedder();
      if (initialized && this.embedderInstance) {
        try {
          const result = await this.embedderInstance.embed(text);
          if (result && result.embedding) {
            return result.embedding instanceof Float32Array
              ? result.embedding
              : new Float32Array(result.embedding);
          }
        } catch (err) {
          console.warn('[OnDeviceEmbedder] Native embedding failed, using deterministic fallback:', err);
        }
      }

      // Deterministic fallback: Normalized n-gram character/word hash projection (256-dim)
      return this.generateDeterministicVector(text, 256);
    } finally {
      this.isComputing.set(false);
    }
  }

  /**
   * Computes standard Cosine Similarity between two embedding vectors.
   * Formula: cos(theta) = (A . B) / (||A|| * ||B||)
   */
  cosineSimilarity(a: Float32Array | number[], b: Float32Array | number[]): number {
    if (!a || !b || a.length === 0 || b.length === 0) return 0;
    const len = Math.min(a.length, b.length);
    let dot = 0.0;
    let normA = 0.0;
    let normB = 0.0;

    for (let i = 0; i < len; i++) {
      const valA = a[i];
      const valB = b[i];
      dot += valA * valB;
      normA += valA * valA;
      normB += valB * valB;
    }

    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  /**
   * Performs zero-egress semantic similarity search across candidate clinical documents/codes.
   */
  async findTopMatches<T = any>(
    query: string,
    candidates: Array<{ id: string; text: string; data?: T }>,
    topK = 5
  ): Promise<ISemanticMatch<T>[]> {
    if (!query || !candidates || candidates.length === 0) {
      return [];
    }

    const queryVec = await this.computeEmbedding(query);
    const scored: ISemanticMatch<T>[] = [];

    for (const candidate of candidates) {
      const candVec = await this.computeEmbedding(candidate.text);
      const score = this.cosineSimilarity(queryVec, candVec);
      scored.push({
        id: candidate.id,
        text: candidate.text,
        score,
        data: candidate.data
      });
    }

    // Sort descending by similarity score
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  /**
   * Fallback: Generates a normalized sparse bag-of-words / character 3-gram projection vector.
   */
  private generateDeterministicVector(text: string, dim: number): Float32Array {
    const vec = new Float32Array(dim);
    const clean = (text || '').toLowerCase().trim();
    if (!clean) return vec;

    // Word tokens
    const words = clean.split(/\s+/);
    for (const word of words) {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash << 5) - hash + word.charCodeAt(i);
        hash |= 0;
      }
      const idx = Math.abs(hash) % dim;
      vec[idx] += 1.0;
    }

    // Tri-gram tokens for sub-word clinical semantics
    for (let i = 0; i < clean.length - 2; i++) {
      const tri = clean.substring(i, i + 3);
      let hash = 0;
      for (let j = 0; j < 3; j++) {
        hash = (hash << 5) - hash + tri.charCodeAt(j);
        hash |= 0;
      }
      const idx = Math.abs(hash) % dim;
      vec[idx] += 0.5;
    }

    // Normalize to unit length
    let norm = 0.0;
    for (let i = 0; i < dim; i++) {
      norm += vec[i] * vec[i];
    }
    const sqrtNorm = Math.sqrt(norm);
    if (sqrtNorm > 0) {
      for (let i = 0; i < dim; i++) {
        vec[i] /= sqrtNorm;
      }
    }

    return vec;
  }
}
