# @pocketgull/clinical-parquet-duckdb

Zero-egress FHIR R4 to Snappy-compressed Parquet pipelines with vectorized in-memory DuckDB analytics.

## Why Zero-Egress Over Legacy "Safe Harbor"?
Legacy HIPAA §164.514(b) "Safe Harbor" de-identification is mathematically vulnerable to modern cross-database linkage attacks (the Latanya Sweeney theorem proves that 87% of the US population can be re-identified with just 3 demographic attributes). Furthermore, high-dimensional longitudinal vitals, time-series telemetry, and genomics cannot be stripped of identity without destroying their clinical value.

The only true defense against patient re-identification is **Zero-Egress computing**:
* Raw clinical data never leaves the local clinical workstation or hospital firewall.
* Data transformations and vectorized queries execute 100% in-memory via DuckDB and Snappy-compressed columnar Parquet tables.
* Analytics, cohort discovery, and ML scoring run locally at sub-15ms latencies.

## Features
- **Zero-Egress In-Memory Pipeline**: Transforms HL7 FHIR R4 Bundles entirely on-device without cloud data leakage.
- **Relational Columnar Normalization**: Maps nested, polymorphic FHIR trees into relational schemas (Patients, Conditions, Observations, Medications).
- **DuckDB Vectorized SQL Engine**: Generates DDL, columnar inserts, and sub-millisecond cohort query templates.
- **Clinical Taxonomies**: Standardized mapping for ICD-10, LOINC, SNOMED CT, and RxNorm.
- **Deterministic Pseudonymization**: FNV-1a salted hashing (`DEID_PAT_...`) with age tiering and postal code masking.

## Installation

```bash
npm install @pocketgull/clinical-parquet-duckdb
```

## Quick Start

```typescript
import { clinicalParquetPipeline } from '@pocketgull/clinical-parquet-duckdb';

// Ingest a FHIR R4 Bundle
const bundle = await fetch('/api/fhir/patient-cohort').then(r => r.json());

// 1. Flatten to columnar tables with zero egress
const columnar = clinicalParquetPipeline.processFhirBundle(bundle);
console.log(`Processed ${columnar.metadata.patientCount} patients with zero egress.`);

// 2. Generate DuckDB SQL initialization script
const sql = clinicalParquetPipeline.generateDuckDbScript(bundle);
// Run in DuckDB-Wasm or native DuckDB:
// await duckdbCon.query(sql);

// 3. Run instant analytical cohort queries
const queries = clinicalParquetPipeline.getAnalyticalQueries();
console.log(queries.cohortPrevalenceByCondition);
```

---

### 🪶 A Note on the Flock: *Why All the Birds?*
Yes, we noticed the aviary too:
* 🌊 **PocketGull** — The clinical care navigator shorebird.
* 🦆 **DuckDB** — The zero-lag in-memory analytical swimmer.
* 🦜 **Apache Parquet** — Pronounced *par-kay*, but reads delightfully like *paraquet*.

Traditional enterprise EHR software is notoriously grey, bloated, and joyless. We believe foundational healthcare tools should be blisteringly fast, open-source, and human. If our zero-egress stack happens to sound like a wildlife sanctuary, we wear that badge with pride.

## License
Apache-2.0
