// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { IFhirBundle, IClinicalParquetBundle } from './types.js';
import { FhirColumnarFlattener } from './fhir-flattener.js';
import { DuckDbSchemaGenerator } from './duckdb-schema-generator.js';

export class ClinicalParquetPipeline {
  private readonly flattener: FhirColumnarFlattener;
  private readonly schemaGen: DuckDbSchemaGenerator;

  constructor(customSalt?: string) {
    this.flattener = new FhirColumnarFlattener(customSalt);
    this.schemaGen = new DuckDbSchemaGenerator();
  }

  /**
   * Transforms raw FHIR R4 Bundle into Safe Harbor de-identified columnar tables
   */
  processFhirBundle(bundle: IFhirBundle): IClinicalParquetBundle {
    return this.flattener.flattenBundle(bundle);
  }

  /**
   * Generates DuckDB DDL and SQL commands to ingest the bundle into DuckDB / DuckDB-Wasm
   */
  generateDuckDbScript(bundle: IFhirBundle): string {
    const flattened = this.processFhirBundle(bundle);
    const ddl = this.schemaGen.generateDdl();
    const inserts = this.schemaGen.generateInserts(flattened);
    return `${ddl}\n\n${inserts.join('\n')}`;
  }

  /**
   * Returns analytical SQL queries for cohort discovery
   */
  getAnalyticalQueries(): Record<string, string> {
    return this.schemaGen.getAnalyticalQueries();
  }
}

/**
 * Singleton instance helper
 */
export const clinicalParquetPipeline = new ClinicalParquetPipeline();
