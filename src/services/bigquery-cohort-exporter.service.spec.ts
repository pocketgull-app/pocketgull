import { BigQueryCohortExporterService, CERTIFIED_COHORTS } from './bigquery-cohort-exporter.service';

describe('BigQueryCohortExporterService', () => {
  let service: BigQueryCohortExporterService;

  beforeEach(() => {
    service = new BigQueryCohortExporterService();
  });

  describe('5 Certified Disease Cohorts', () => {
    it('should list all 5 certified research cohorts', () => {
      const cohorts = service.getCertifiedCohorts();
      expect(cohorts).toHaveLength(5);

      const cohortIds = cohorts.map((c) => c.id);
      expect(cohortIds).toContain('cohort_diabetes_cgm');
      expect(cohortIds).toContain('cohort_oncology_biomarkers');
      expect(cohortIds).toContain('cohort_long_covid_autonomic');
      expect(cohortIds).toContain('cohort_cardiopulmonary_audio');
      expect(cohortIds).toContain('cohort_neuro_developmental');
    });

    it('should generate valid BigQuery DDL partitioned on study_day_t with 7-day expiration', () => {
      for (const cohort of CERTIFIED_COHORTS) {
        const ddl = service.generateTableDdl(cohort.tableName, cohort.description);

        expect(ddl).toContain(`CREATE TABLE IF NOT EXISTS \`pocketgull_research_exchange.${cohort.tableName}\``);
        expect(ddl).toContain('PARTITION BY study_day_t');
        expect(ddl).toContain('CLUSTER BY phenotype_code, age_bracket');
        expect(ddl).toContain('require_partition_filter=TRUE');
        expect(ddl).toContain('partition_expiration_days=7');
      }
    });

    it('should generate Row-Level Security (RLS) policies enforcing k >= 8', () => {
      const rls = service.generateRowAccessPolicy('cohort_diabetes_cgm_telemetry');
      expect(rls).toContain('CREATE OR REPLACE ROW ACCESS POLICY certified_researcher_filter');
      expect(rls).toContain('FILTER USING (k_anonymity_bucket_size >= 8)');
      expect(rls).toContain('pocketgull_research_exchange.cohort_diabetes_cgm_telemetry');
    });

    it('should generate column data masking policies', () => {
      const masking = service.generateColumnDataMaskingPolicy('cohort_diabetes_cgm_telemetry');
      expect(masking).toContain('ALTER TABLE `pocketgull_research_exchange.cohort_diabetes_cgm_telemetry`');
      expect(masking).toContain('ALTER COLUMN deid_hash SET DATA MASKING POLICY');
    });
  });

  describe('FHIR R4 Ingestion & Serialization Pipeline', () => {
    it('should transform FHIR observations into partitioned de-identified BigQuery records', () => {
      const records = service.transformFhirObservationsToBigQuery(
        'cohort_diabetes_cgm',
        'E11.9',
        54,
        [
          { code: '15074-8', value: 132.5, studyDayOffset: 12 },
          { code: '15074-8', value: 145.0, studyDayOffset: 13 }
        ]
      );

      expect(records.length).toBe(2);
      expect(records[0].age_bracket).toBe('50-69');
      expect(records[0].k_anonymity_bucket_size).toBeGreaterThanOrEqual(8);
      expect(records[0].study_day_t).toBe('2026-01-13');
      expect(records[0].deid_hash).toBeDefined();
    });

    it('should transform entire FHIR R4 Bundle into BigQuery records', () => {
      const fhirBundle = {
        resourceType: 'Bundle',
        entry: [
          {
            resource: {
              resourceType: 'Observation',
              code: { coding: [{ code: 'glucose_mean' }] },
              valueQuantity: { value: 124.5 },
              studyDayOffset: 5
            }
          },
          {
            resource: {
              resourceType: 'Observation',
              code: { coding: [{ code: 'rmssd_hrv' }] },
              valueQuantity: { value: 48.2 },
              studyDayOffset: 5
            }
          }
        ]
      };

      const records = service.transformFhirBundleToBigQuery(fhirBundle, 'cohort_diabetes_cgm', 'E11.9');
      expect(records).toHaveLength(2);
      expect(records[0].fhir_observation_code).toBe('glucose_mean');
      expect(records[1].fhir_observation_code).toBe('rmssd_hrv');
    });
  });

  describe('Dividend Audit Query & Analytics Hub Metadata', () => {
    it('should generate BigQuery query audit log aggregation for dividend payouts', () => {
      const sql = service.generateDividendAuditLogQuery('cohort_diabetes_cgm');
      expect(sql).toContain('INFORMATION_SCHEMA.JOBS_BY_PROJECT');
      expect(sql).toContain("labels.value = 'cohort_diabetes_cgm'");
      expect(sql).toContain('patient_dividend_escrow_usd');
    });

    it('should generate Google Cloud BigQuery Analytics Hub metadata', () => {
      const metadata = service.generateAnalyticsHubListingMetadata(
        'cohort_diabetes_cgm',
        'Type 2 Diabetes CGM',
        'De-identified continuous glucose monitoring sensor streams.'
      );

      expect(metadata.displayName).toContain('Type 2 Diabetes CGM');
      expect(metadata.categories).toContain('HEALTHCARE_AND_LIFE_SCIENCES');
      expect(metadata.dataGovernance.hipaaSafeHarborAttested).toBe(true);
      expect(metadata.dataGovernance.minimumK).toBe(8);
      expect(metadata.dataGovernance.storageLifecycleDays).toBe(7);
    });
  });

  describe('BigQuery Public Dataset Crosswalk Queries', () => {
    it('should generate crosswalk SQL for NIH clinical trials', () => {
      const sql = service.generateCrosswalkQuery('cohort_diabetes_cgm', 'nih_clinical_trials');
      expect(sql).toContain('bigquery-public-data.nih_clinical_trials.clinical_study_block');
      expect(sql).toContain('cohort_diabetes_cgm');
      expect(sql).toContain('RECRUITING');
    });

    it('should generate crosswalk SQL for CMS OMOP measurement benchmarks', () => {
      const sql = service.generateCrosswalkQuery('cohort_diabetes_cgm', 'cms_synthetic_omop');
      expect(sql).toContain('bigquery-public-data.cms_synthetic_patient_data_omop.measurement');
      expect(sql).toContain('measurement_concept_id');
    });

    it('should generate crosswalk SQL for MIMIC-IV ICU waveforms', () => {
      const sql = service.generateCrosswalkQuery('cohort_cardiopulmonary_audio', 'mimiciv_icu');
      expect(sql).toContain('physionet-data.mimiciv_icu.chartevents');
      expect(sql).toContain('mean_icu_value');
    });

    it('should generate crosswalk SQL for FDA FAERS adverse drug events', () => {
      const sql = service.generateCrosswalkQuery('cohort_oncology_biomarkers', 'fda_drug');
      expect(sql).toContain('bigquery-public-data.fda_drug.event');
      expect(sql).toContain('reactionmeddrapt');
    });

    it('should generate crosswalk SQL for EPA air quality SDOH', () => {
      const sql = service.generateCrosswalkQuery('cohort_long_covid_autonomic', 'epa_air_quality');
      expect(sql).toContain('bigquery-public-data.epa_historical_air_quality.pm25_daily_summary');
      expect(sql).toContain('pm25_mean_ug_m3');
    });

    it('should generate crosswalk SQL for World Bank global health benchmarks', () => {
      const sql = service.generateCrosswalkQuery('cohort_neuro_developmental', 'world_bank_health');
      expect(sql).toContain('bigquery-public-data.world_bank_health_population.health_nutrition_population');
      expect(sql).toContain('SH.DYN.MORT');
    });
  });
});
