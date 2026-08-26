import { BigQueryCohortExporterService } from './bigquery-cohort-exporter.service';

describe('BigQueryCohortExporterService', () => {
  let service: BigQueryCohortExporterService;

  beforeEach(() => {
    service = new BigQueryCohortExporterService();
  });

  it('should generate valid BigQuery DDL partitioned on study_day_t', () => {
    const ddl = service.generateTableDdl(
      't2d_cgm_telemetry',
      'Continuous Glucose Monitoring telemetry for Type 2 Diabetes cohort.'
    );

    expect(ddl).toContain('CREATE TABLE IF NOT EXISTS `pocketgull_research_exchange.t2d_cgm_telemetry`');
    expect(ddl).toContain('PARTITION BY study_day_t');
    expect(ddl).toContain('CLUSTER BY phenotype_code, age_bracket');
    expect(ddl).toContain('require_partition_filter=TRUE');
  });

  it('should transform FHIR observations into partitioned de-identified BigQuery records', () => {
    const records = service.transformFhirObservationsToBigQuery(
      'cohort-t2d-cgm',
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

  it('should generate Google Cloud BigQuery Analytics Hub metadata', () => {
    const metadata = service.generateAnalyticsHubListingMetadata(
      'cohort-t2d-cgm',
      'Type 2 Diabetes CGM',
      'De-identified continuous glucose monitoring sensor streams.'
    );

    expect(metadata.displayName).toContain('Type 2 Diabetes CGM');
    expect(metadata.categories).toContain('HEALTHCARE_AND_LIFE_SCIENCES');
    expect(metadata.dataGovernance.hipaaSafeHarborAttested).toBe(true);
    expect(metadata.dataGovernance.minimumK).toBe(8);
  });
});
