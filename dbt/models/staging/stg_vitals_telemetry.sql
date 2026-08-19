{{ config(
    materialized='view',
    description='Staging model normalizing live patient biometric telemetry streams'
) }}

WITH source_telemetry AS (
    SELECT
        patient_id,
        metric_type,
        SAFE_CAST(measured_value AS FLOAT64) AS measured_value,
        unit,
        SAFE_CAST(reading_timestamp AS TIMESTAMP) AS reading_timestamp,
        device_source
    FROM
        {{ source('pocketgull_raw', 'vitals_telemetry_stream') }}
)

SELECT
    patient_id,
    metric_type,
    measured_value,
    unit,
    reading_timestamp,
    device_source,
    -- Clinical anomaly classification flags
    CASE
        WHEN metric_type = 'glucose_cgm' AND measured_value < 70 THEN 'HYPOGLYCEMIA_ALERT'
        WHEN metric_type = 'glucose_cgm' AND measured_value > 180 THEN 'HYPERGLYCEMIA_ALERT'
        WHEN metric_type = 'blood_pressure_sbp' AND measured_value > 140 THEN 'HYPERTENSION_STAGE_2'
        WHEN metric_type = 'blood_pressure_sbp' AND measured_value > 180 THEN 'HYPERTENSIVE_CRISIS'
        ELSE 'NORMAL_RANGE'
    END AS clinical_alert_tier
FROM
    source_telemetry
WHERE
    measured_value IS NOT NULL
