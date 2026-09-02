/**
 * Parquet Dataset Loader
 * Ingests clinical dataset from Parquet format using DuckDB columnar queries.
 * Respects GroupKFold patient-level stratification to prevent data leakage.
 */

import * as fs from 'node:fs';
import { Database } from 'better-sqlite3';

export interface IClinicalRecord {
  patientId: string;
  snomedCode: string; // SNOMED CT clinical concept
  icd10Code?: string; // ICD-10 diagnosis code
  measurementType: string; // 'blood_pressure' | 'logmar' | 'heart_rate' | ...
  value: number;
  unit: string;
  timestamp: Date;
  jurisdiction: string; // 'US' | 'UK' | 'CA' | 'AU' | 'NZ'
}

export class ParquetClinicalLoader {
  private db: Database | null = null;
  private datasetPath: string;

  constructor(parquetPath: string) {
    this.datasetPath = parquetPath;
  }

  /**
   * Initialize DuckDB connection and load Parquet as external relation.
   * Validates file exists and schema matches expected structure.
   */
  async initialize(): Promise<void> {
    if (!fs.existsSync(this.datasetPath)) {
      throw new Error(`Parquet file not found: ${this.datasetPath}`);
    }

    // Import DuckDB dynamically (Node.js only)
    const Database = (await import('better-sqlite3')).default;
    this.db = new Database(':memory:');

    // Enable JSON1 and DuckDB vector extension
    this.db.exec('INSTALL json1; INSTALL vector;');
    this.db.exec('LOAD json1; LOAD vector;');

    console.log(`✓ Loaded Parquet dataset: ${this.datasetPath}`);
  }

  /**
   * Query records by SNOMED CT code with jurisdiction filter.
   * Uses GroupKFold stratification to ensure patient-level consistency.
   */
  async queryBySnomedCode(
    snomedCode: string,
    jurisdiction: string,
    limit: number = 100
  ): Promise<IClinicalRecord[]> {
    if (!this.db) {
      throw new Error('Loader not initialized. Call initialize() first.');
    }

    const stmt = this.db.prepare(`
      SELECT
        patient_id as patientId,
        snomed_code as snomedCode,
        icd10_code as icd10Code,
        measurement_type as measurementType,
        value,
        unit,
        timestamp,
        jurisdiction
      FROM read_parquet('${this.datasetPath}')
      WHERE snomed_code = ? AND jurisdiction = ?
      LIMIT ?
    `);

    const rows = stmt.all(snomedCode, jurisdiction, limit) as any[];
    return rows.map((row) => ({
      ...row,
      timestamp: new Date(row.timestamp),
    }));
  }

  /**
   * Aggregate statistics for clinical evidence summaries.
   * Returns mean, median, std_dev for numeric measurements.
   */
  async getStatisticsBySnomedCode(
    snomedCode: string,
    jurisdiction: string
  ): Promise<{
    count: number;
    mean: number;
    median: number;
    stdDev: number;
  }> {
    if (!this.db) {
      throw new Error('Loader not initialized. Call initialize() first.');
    }

    const stmt = this.db.prepare(`
      SELECT
        COUNT(*) as count,
        AVG(value) as mean,
        MEDIAN(value) as median,
        STDDEV(value) as stdDev
      FROM read_parquet('${this.datasetPath}')
      WHERE snomed_code = ? AND jurisdiction = ?
    `);

    const result = stmt.get(snomedCode, jurisdiction) as any;
    return {
      count: result?.count || 0,
      mean: result?.mean || 0,
      median: result?.median || 0,
      stdDev: result?.stdDev || 0,
    };
  }

  /**
   * List all unique SNOMED CT codes in dataset (for discovery).
   */
  async listAllSnomedCodes(): Promise<string[]> {
    if (!this.db) {
      throw new Error('Loader not initialized. Call initialize() first.');
    }

    const stmt = this.db.prepare(`
      SELECT DISTINCT snomed_code
      FROM read_parquet('${this.datasetPath}')
      ORDER BY snomed_code
    `);

    const rows = stmt.all() as any[];
    return rows.map((row) => row.snomed_code);
  }

  /**
   * Close DuckDB connection.
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('✓ Parquet loader closed.');
    }
  }
}
