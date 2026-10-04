-- ==============================================================================
-- 🛡️ PocketGull Serverless SIEM Analytics - Canonical Views & Threat Hunting Queries
-- Target Project: gen-lang-client-0540208645
-- Source Engine: Google Cloud BigQuery Log Analytics (default_log_link._AllLogs)
-- Compliance Standards: HIPAA §164.312(b), FDA 21 CFR Part 11, HHS 405(d) HICP
-- ==============================================================================

-- 1. Daily Security & Clinical Threat Aggregation View (Looker Studio Feed)
-- Aggregates hourly requests, severity distribution, and clinical AI defense triggers.
CREATE OR REPLACE VIEW `gen-lang-client-0540208645.siem_audit_logs.v_daily_security_telemetry` AS
SELECT
  TIMESTAMP_TRUNC(timestamp, HOUR) AS hour_window,
  resource.type AS resource_type,
  severity,
  COUNT(*) AS event_count,
  COUNTIF(JSON_VALUE(json_payload, '$.eventCategory') IS NOT NULL) AS clinical_threat_count,
  COUNTIF(severity IN ('ERROR', 'CRITICAL')) AS error_count
FROM
  `gen-lang-client-0540208645.default_log_link._AllLogs`
WHERE
  timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
GROUP BY
  hour_window, resource_type, severity;

-- 2. HIPAA §164.312(b) Data Access Audit View
-- Tracks all authenticated data access calls, identity principals, and API methods.
CREATE OR REPLACE VIEW `gen-lang-client-0540208645.siem_audit_logs.v_hipaa_access_audit` AS
SELECT
  timestamp,
  proto_payload.audit_log.authentication_info.principal_email AS principal_email,
  proto_payload.audit_log.service_name AS service_name,
  proto_payload.audit_log.method_name AS method_name,
  proto_payload.audit_log.resource_name AS resource_accessed,
  proto_payload.audit_log.status.code AS status_code,
  proto_payload.audit_log.request_metadata.caller_ip AS caller_ip
FROM
  `gen-lang-client-0540208645.default_log_link._AllLogs`
WHERE
  log_name LIKE '%cloudaudit.googleapis.com%2Fdata_access%'
  AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY);

-- 3. Clinical AI Threat & Honeypot Forensics View
-- Extracts structured incident forensics emitted by ClinicalDefenseGuardService & canary honeypots.
CREATE OR REPLACE VIEW `gen-lang-client-0540208645.siem_audit_logs.v_clinical_ai_forensics` AS
SELECT
  timestamp,
  severity,
  JSON_VALUE(json_payload, '$.eventCategory') AS event_category,
  JSON_VALUE(json_payload, '$.containmentApplied') AS containment_applied,
  JSON_VALUE(json_payload, '$.evidencePayloadHash') AS evidence_sha256,
  JSON_VALUE(json_payload, '$.hhs405dAlignment') AS hhs405d_alignment
FROM
  `gen-lang-client-0540208645.default_log_link._AllLogs`
WHERE
  JSON_VALUE(json_payload, '$.eventCategory') IS NOT NULL
  AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 180 DAY);
