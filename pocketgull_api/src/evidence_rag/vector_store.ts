/**
 * Vector Store Manager
 * Manages embeddings and semantic search over clinical records using FAISS or DuckDB vectors.
 * Generates embeddings via Google Gemini embedding-004.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface IEmbeddedRecord {
  recordId: string;
  snomedCode: string;
  clinicalSummary: string;
  embedding: number[];
  jurisdiction: string;
}

export class VectorStoreManager {
  private client: GoogleGenerativeAI;
  private embeddingModel: string;
  private vectorDb: Map<string, IEmbeddedRecord> = new Map();

  constructor(apiKey: string, embeddingModel: string = 'text-embedding-005') {
    this.client = new GoogleGenerativeAI(apiKey);
    this.embeddingModel = embeddingModel;
  }

  /**
   * Generate embeddings for clinical text snippets.
   * Batches requests to respect rate limits.
   */
  async embedClinicalText(texts: string[]): Promise<number[][]> {
    const model = this.client.getGenerativeModel({
      model: this.embeddingModel,
    });

    const embeddings: number[][] = [];
    const batchSize = 100; // Gemini API batch limit

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map((text) =>
          model.embedContent(text).then((result) => result.embedding.values)
        )
      );
      embeddings.push(...results);
    }

    return embeddings;
  }

  /**
   * Add embedded clinical records to vector store.
   */
  async addRecords(records: IEmbeddedRecord[]): Promise<void> {
    for (const record of records) {
      this.vectorDb.set(record.recordId, record);
    }
    console.log(`✓ Added ${records.length} embedded records to vector store.`);
  }

  /**
   * Semantic search: find similar clinical records by embedding cosine similarity.
   * Returns top-k most similar records.
   */
  async semanticSearch(
    queryText: string,
    jurisdiction: string,
    topK: number = 5
  ): Promise<IEmbeddedRecord[]> {
    const [queryEmbedding] = await this.embedClinicalText([queryText]);

    const scored: { record: IEmbeddedRecord; similarity: number }[] = [];

    for (const record of this.vectorDb.values()) {
      // Jurisdiction filter for FVEY compliance
      if (record.jurisdiction !== jurisdiction) continue;

      const similarity = this.cosineSimilarity(queryEmbedding, record.embedding);
      scored.push({ record, similarity });
    }

    // Sort by similarity descending, return top-k
    return scored.sort((a, b) => b.similarity - a.similarity).slice(0, topK).map((s) => s.record);
  }

  /**
   * Cosine similarity between two embedding vectors.
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embedding vectors must have same dimension.');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return normA === 0 || normB === 0 ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Retrieve all records matching a SNOMED CT code.
   */
  async getRecordsBySnomedCode(snomedCode: string): Promise<IEmbeddedRecord[]> {
    const matches: IEmbeddedRecord[] = [];
    for (const record of this.vectorDb.values()) {
      if (record.snomedCode === snomedCode) {
        matches.push(record);
      }
    }
    return matches;
  }
}
