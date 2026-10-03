import { describe, it, expect } from 'vitest';
import {
  ClinicalParquetPipeline,
  clinicalParquetPipeline,
  SafeHarborDeidentifier,
  IFhirBundle
} from '../src/index.js';

describe('@pocketgull/clinical-parquet-duckdb', () => {
  const deid = new SafeHarborDeidentifier();
  const pipeline = new ClinicalParquetPipeline();

  const mockBundle: IFhirBundle = {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [
      {
        resource: {
          resourceType: 'Patient',
          id: 'pat-12345',
          birthDate: '1984-06-15',
          gender: 'female',
          address: [{ postalCode: '97201' }]
        }
      },
      {
        resource: {
          resourceType: 'Condition',
          id: 'cond-999',
          subject: { reference: 'Patient/pat-12345' },
          code: {
            coding: [
              { system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'M54.16' },
              { system: 'http://snomed.info/sct', code: '202798007' }
            ]
          },
          clinicalStatus: { coding: [{ code: 'active' }] },
          verificationStatus: { coding: [{ code: 'confirmed' }] },
          onsetDateTime: '2025-11-20'
        }
      },
      {
        resource: {
          resourceType: 'Observation',
          id: 'obs-heart-rate',
          subject: { reference: 'Patient/pat-12345' },
          code: {
            coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart Rate' }]
          },
          valueQuantity: { value: 72, unit: 'beats/minute' },
          effectiveDateTime: '2026-03-01T10:00:00Z'
        }
      },
      {
        resource: {
          resourceType: 'MedicationRequest',
          id: 'med-lisinopril',
          subject: { reference: 'Patient/pat-12345' },
          medicationCodeableConcept: {
            coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '29046', display: 'Lisinopril 10 MG Oral Tablet' }]
          },
          dosageInstruction: [{ doseAndRate: [{ doseQuantity: { value: 10, unit: 'mg' } }] }],
          status: 'active',
          authoredOn: '2026-01-10'
        }
      }
    ]
  };

  it('1. Performs HIPAA §164.514 Safe Harbor de-identification on patient records', () => {
    const hashed = deid.hashPatientId('pat-12345');
    expect(hashed).toMatch(/^DEID_PAT_[A-F0-9]{12}$/);
    expect(hashed).not.toContain('12345');

    // Deterministic hashing verification
    expect(deid.hashPatientId('pat-12345')).toBe(hashed);

    // Age tiering
    expect(deid.calculateAgeTier('1984-06-15', 2026)).toBe('30-44');
    expect(deid.calculateAgeTier('1930-01-01', 2026)).toBe('89+');

    // Postal code masking to 3 digits
    expect(deid.maskPostalCode('97201')).toBe('972');
  });

  it('2. Flattens nested FHIR R4 Bundle into columnar relational rows', () => {
    const result = pipeline.processFhirBundle(mockBundle);

    expect(result.metadata.patientCount).toBe(1);
    expect(result.metadata.conditionCount).toBe(1);
    expect(result.metadata.observationCount).toBe(1);
    expect(result.metadata.medicationCount).toBe(1);

    const pat = result.patients[0];
    expect(pat.gender).toBe('FEMALE');
    expect(pat.age_tier).toBe('30-44');
    expect(pat.postal_prefix_3digit).toBe('972');

    const cond = result.conditions[0];
    expect(cond.icd10_code).toBe('M54.16');
    expect(cond.snomed_code).toBe('202798007');
    expect(cond.onset_year).toBe(2025);

    const obs = result.observations[0];
    expect(obs.loinc_code).toBe('8867-4');
    expect(obs.value_numeric).toBe(72);
    expect(obs.unit).toBe('beats/minute');

    const med = result.medications[0];
    expect(med.rxnorm_code).toBe('29046');
    expect(med.dosage_quantity).toBe(10);
    expect(med.dosage_unit).toBe('mg');
  });

  it('3. Generates valid DuckDB DDL and INSERT scripts for vectorized SQL', () => {
    const sql = pipeline.generateDuckDbScript(mockBundle);

    expect(sql).toContain('CREATE TABLE IF NOT EXISTS patients');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS conditions');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS observations');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS medications');

    expect(sql).toContain("INSERT INTO patients VALUES ('DEID_PAT_");
    expect(sql).toContain("INSERT INTO conditions VALUES ('cond-999'");
    expect(sql).toContain("INSERT INTO observations VALUES ('obs-heart-rate'");
    expect(sql).toContain("INSERT INTO medications VALUES ('med-lisinopril'");
  });

  it('4. Provides analytical SQL queries for cohort prevalence and polypharmacy', () => {
    const queries = pipeline.getAnalyticalQueries();
    expect(queries.cohortPrevalenceByCondition).toContain('SELECT');
    expect(queries.vitalsLongitudinalSummary).toContain('AVG(o.value_numeric)');
    expect(queries.polypharmacyByCondition).toContain('COUNT(DISTINCT m.rxnorm_code)');
  });

  it('5. Exports singleton instance', () => {
    expect(clinicalParquetPipeline).toBeInstanceOf(ClinicalParquetPipeline);
  });
});
