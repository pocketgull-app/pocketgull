/**
 * 📦 PocketGull OPFS (Origin Private File System) Local Vector Stash
 * 
 * Provides offline, high-speed vector embeddings storage and cosine similarity
 * querying directly in the browser's OPFS sandbox. Enables air-gapped field triage
 * units to search clinical knowledge with 0 cloud dependencies.
 */

export interface IVectorDocument {
  id: string;
  text: string;
  category: string;
  embedding: number[];
  metadata?: Record<string, any>;
  timestamp: number;
}

export class OpfsVectorStash {
  private static readonly DB_FILE_NAME = 'pocketgull_vector_stash.json';

  /**
   * Checks if OPFS is supported in the current browser runtime.
   */
  public static isSupported(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.storage?.getDirectory === 'function';
  }

  /**
   * Persists a batch of vector documents to the Origin Private File System.
   */
  public static async saveDocuments(docs: IVectorDocument[]): Promise<void> {
    if (!this.isSupported()) return;

    try {
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle(this.DB_FILE_NAME, { create: true });
      const accessHandle = await (fileHandle as any).createWritable();
      
      const json = JSON.stringify(docs);
      await accessHandle.write(json);
      await accessHandle.close();
    } catch (err) {
      console.warn('[OpfsVectorStash] Failed to persist documents to OPFS:', err);
    }
  }

  /**
   * Loads all vector documents from OPFS.
   */
  public static async loadDocuments(): Promise<IVectorDocument[]> {
    if (!this.isSupported()) return [];

    try {
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle(this.DB_FILE_NAME);
      const file = await fileHandle.getFile();
      const text = await file.text();
      return JSON.parse(text) as IVectorDocument[];
    } catch {
      return [];
    }
  }

  /**
   * Computes cosine similarity between two float vectors.
   */
  public static cosineSimilarity(a: number[] | Float32Array, b: number[] | Float32Array): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    const len = Math.min(a.length, b.length);

    for (let i = 0; i < len; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Searches the OPFS stash for top-K most semantically similar documents.
   */
  public static async querySimilar(
    queryEmbedding: number[] | Float32Array,
    topK: number = 5,
    categoryFilter?: string
  ): Promise<Array<{ document: IVectorDocument; score: number }>> {
    const docs = await this.loadDocuments();
    const filtered = categoryFilter ? docs.filter(d => d.category === categoryFilter) : docs;

    const scored = filtered.map(doc => ({
      document: doc,
      score: this.cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}
