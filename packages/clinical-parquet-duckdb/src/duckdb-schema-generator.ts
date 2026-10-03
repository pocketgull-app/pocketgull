// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { IClinicalParquetBundle } from './types.js';

export class DuckDbSchemaGenerator {
  /**
   * Generates DuckDB SQL DDL schema for in-memory tables
   */
  generateDdl(): string {
    return `
-- =========================================================================
-- PocketGull Clinical Parquet & DuckDB Vectorized Schema (HIPAA Safe Harbor)
-- =========================================================================

CREATE TABLE IF NOT EXISTS patients (
  deid_patient_id VARCHAR PRIMARY KEY,
  age_tier VARCHAR,
  gender VARCHAR,
  postal_prefix_3digit VARCHAR
);

CREATE TABLE IF NOT EXISTS conditions (
  condition_id VARCHAR PRIMARY KEY,
  deid_patient_id VARCHAR,
  icd10_code VARCHAR,
  snomed_code VARCHAR,
  clinical_status VARCHAR,
  verification_status VARCHAR,
  onset_year INTEGER
);

CREATE TABLE IF NOT EXISTS observations (
  observation_id VARCHAR PRIMARY KEY,
  deid_patient_id VARCHAR,
  loinc_code VARCHAR,
  code_display VARCHAR,
  value_numeric DOUBLE,
  value_string VARCHAR,
  unit VARCHAR,
  effective_epoch_seconds BIGINT
);

CREATE TABLE IF NOT EXISTS medications (
  medication_id VARCHAR PRIMARY KEY,
  deid_patient_id VARCHAR,
  rxnorm_code VARCHAR,
  medication_name VARCHAR,
  dosage_quantity DOUBLE,
  dosage_unit VARCHAR,
  status VARCHAR,
  authored_year INTEGER
);
`.trim();
  }

  /**
   * Generates DuckDB INSERT SQL statements from a flattened Clinical Parquet Bundle
   */
  generateInserts(bundle: IClinicalParquetBundle): string[] {
    const stmts: string[] = [];

    for (const p of bundle.patients) {
      const zip = p.postal_prefix_3digit ? `'${p.postal_prefix_3digit}'` : 'NULL';
      stmts.push(
        `INSERT INTO patients VALUES ('${p.deid_patient_id}', '${p.age_tier}', '${p.gender}', ${zip});`
      );
    }

    for (const c of bundle.conditions) {
      const onset = c.onset_year !== undefined ? c.onset_year : 'NULL';
      stmts.push(
        `INSERT INTO conditions VALUES ('${c.condition_id}', '${c.deid_patient_id}', '${c.icd10_code}', '${c.snomed_code}', '${c.clinical_status}', '${c.verification_status}', ${onset});`
      );
    }

    for (const o of bundle.observations) {
      const numVal = o.value_numeric !== undefined ? o.value_numeric : 'NULL';
      const strVal = o.value_string ? `'${o.value_string.replace(/'/g, "''")}'` : 'NULL';
      const unit = o.unit ? `'${o.unit}'` : 'NULL';
      const display = o.code_display.replace(/'/g, "''");
      stmts.push(
        `INSERT INTO observations VALUES ('${o.observation_id}', '${o.deid_patient_id}', '${o.loinc_code}', '${display}', ${numVal}, ${strVal}, ${unit}, ${o.effective_epoch_seconds});`
      );
    }

    for (const m of bundle.medications) {
      const qty = m.dosage_quantity !== undefined ? m.dosage_quantity : 'NULL';
      const unit = m.dosage_unit ? `'${m.dosage_unit}'` : 'NULL';
      const year = m.authored_year !== undefined ? m.authored_year : 'NULL';
      const medName = m.medication_name.replace(/'/g, "''");
      stmts.push(
        `INSERT INTO medications VALUES ('${m.medication_id}', '${m.deid_patient_id}', '${m.rxnorm_code}', '${medName}', ${qty}, ${unit}, '${m.status}', ${year});`
      );
    }

    return stmts;
  }

  /**
   * Returns canonical DuckDB sub-millisecond analytical query templates
   */
  getAnalyticalQueries(): Record<string, string> {
    return {
      cohortPrevalenceByCondition: `
        SELECT 
          c.icd10_code,
          p.gender,
          p.age_tier,
          COUNT(DISTINCT p.deid_patient_id) as patient_count
        FROM conditions c
        JOIN patients p ON c.deid_patient_id = p.deid_patient_id
        GROUP BY 1, 2, 3
        ORDER BY patient_count DESC;
      `.trim(),

      vitalsLongitudinalSummary: `
        SELECT
          o.loinc_code,
          o.code_display,
          COUNT(o.observation_id) as total_readings,
          AVG(o.value_numeric) as mean_value,
          MIN(o.value_numeric) as min_value,
          MAX(o.value_numeric) as max_value
        FROM observations o
        WHERE o.value_numeric IS NOT NULL
        GROUP BY 1, 2
        ORDER BY total_readings DESC;
      `.trim(),

      polypharmacyByCondition: `
        SELECT
          c.icd10_code,
          COUNT(DISTINCT m.rxnorm_code) as distinct_medications,
          COUNT(DISTINCT p.deid_patient_id) as patient_count
        FROM patients p
        JOIN conditions c ON p.deid_patient_id = c.deid_patient_id
        JOIN medications m ON p.deid_patient_id = m.deid_patient_id
        GROUP BY 1
        ORDER BY distinct_medications DESC;
      `.trim()
    };
  }
}
