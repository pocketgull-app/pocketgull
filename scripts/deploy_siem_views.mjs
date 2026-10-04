/**
 * 🛡️ PocketGull Serverless SIEM BigQuery View Provisioner
 * Deploys canonical SIEM analytics views into dataset `siem_audit_logs`.
 */

import { BigQuery } from '@google-cloud/bigquery';

const projectId = 'gen-lang-client-0540208645';
const bq = new BigQuery({ projectId });

const views = [
  {
    name: 'v_daily_security_telemetry',
    sql: `
      CREATE OR REPLACE VIEW \`${projectId}.siem_audit_logs.v_daily_security_telemetry\` AS
      SELECT
        TIMESTAMP_TRUNC(timestamp, HOUR) AS hour_window,
        resource.type AS resource_type,
        severity,
        COUNT(*) AS event_count,
        COUNTIF(JSON_VALUE(json_payload, '$.eventCategory') IS NOT NULL) AS clinical_threat_count,
        COUNTIF(severity IN ('ERROR', 'CRITICAL')) AS error_count
      FROM
        \`${projectId}.default_log_link._AllLogs\`
      WHERE
        timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
      GROUP BY
        hour_window, resource_type, severity;
    `
  },
  {
    name: 'v_hipaa_access_audit',
    sql: `
      CREATE OR REPLACE VIEW \`${projectId}.siem_audit_logs.v_hipaa_access_audit\` AS
      SELECT
        timestamp,
        proto_payload.audit_log.authentication_info.principal_email AS principal_email,
        proto_payload.audit_log.service_name AS service_name,
        proto_payload.audit_log.method_name AS method_name,
        proto_payload.audit_log.resource_name AS resource_accessed,
        proto_payload.audit_log.status.code AS status_code,
        proto_payload.audit_log.request_metadata.caller_ip AS caller_ip
      FROM
        \`${projectId}.default_log_link._AllLogs\`
      WHERE
        log_name LIKE '%cloudaudit.googleapis.com%2Fdata_access%'
        AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY);
    `
  },
  {
    name: 'v_clinical_ai_forensics',
    sql: `
      CREATE OR REPLACE VIEW \`${projectId}.siem_audit_logs.v_clinical_ai_forensics\` AS
      SELECT
        timestamp,
        severity,
        JSON_VALUE(json_payload, '$.eventCategory') AS event_category,
        JSON_VALUE(json_payload, '$.containmentApplied') AS containment_applied,
        JSON_VALUE(json_payload, '$.evidencePayloadHash') AS evidence_sha256,
        JSON_VALUE(json_payload, '$.hhs405dAlignment') AS hhs405d_alignment
      FROM
        \`${projectId}.default_log_link._AllLogs\`
      WHERE
        JSON_VALUE(json_payload, '$.eventCategory') IS NOT NULL
        AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 180 DAY);
    `
  }
];

async function main() {
  console.log(`[SIEM Provisioner] Deploying canonical views to ${projectId}:siem_audit_logs...`);
  
  for (const v of views) {
    try {
      console.log(` -> Deploying view: ${v.name}...`);
      await bq.query({ query: v.sql, location: 'US' });
      console.log(`    ✅ SUCCESS: View ${v.name} deployed.`);
    } catch (err) {
      console.warn(`    ⚠️ Notice on ${v.name}:`, err.message);
      // Try global location if multi-region cross-location check applies
      try {
        console.log(`    Retrying with location='global'...`);
        await bq.query({ query: v.sql, location: 'global' });
        console.log(`    ✅ SUCCESS: View ${v.name} deployed in global.`);
      } catch (retryErr) {
        console.error(`    ❌ FAILED: ${retryErr.message}`);
      }
    }
  }
  console.log(`[SIEM Provisioner] Deployment run complete.`);
}

main().catch(console.error);
