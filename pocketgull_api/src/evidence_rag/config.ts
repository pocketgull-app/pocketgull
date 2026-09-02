/**
 * Clinical Evidence RAG Configuration
 * Manages Parquet dataset ingestion, vector embeddings, and FVEY jurisdiction filters.
 * Adheres to PocketGull Copilot Directives: Five Eyes Health Data Sovereignty.
 */

export interface IFVEYJurisdiction {
  country: 'US' | 'UK' | 'CA' | 'AU' | 'NZ';
  regulatoryFramework: string;
  dataResidencyRequired: boolean;
  encryptionStandard: string;
}

export interface IEvidenceRagConfig {
  parquetDatasetPath: string;
  vectorStoreType: 'faiss' | 'duckdb-vector';
  embeddingModel: 'text-embedding-004' | 'text-embedding-005';
  geminiFreezeWindow: number; // ms between Gemini API calls
  chunkSize: number; // records per clinical evidence chunk
  fveyJurisdiction: IFVEYJurisdiction;
}

export const DEFAULT_RAG_CONFIG: IEvidenceRagConfig = {
  parquetDatasetPath: process.env['PARQUET_DATASET_PATH'] || './data/clinical-dpo.parquet',
  vectorStoreType: 'duckdb-vector',
  embeddingModel: 'text-embedding-005',
  geminiFreezeWindow: 500,
  chunkSize: 50,
  fveyJurisdiction: {
    country: (process.env['FVEY_COUNTRY'] as any) || 'US',
    regulatoryFramework: 'HIPAA §164.514',
    dataResidencyRequired: true,
    encryptionStandard: 'AES-256-GCM',
  },
};
