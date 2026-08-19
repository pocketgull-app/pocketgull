{{ config(
    materialized='table',
    partition_by={
        'field': 'reading_date',
        'data_type': 'date',
        'granularity': 'day'
    },
    cluster_by=['patient_id', 'metric_type'],
    description='Core fact table of daily patient biophysical vitals with moving statistics'
) }}

WITH daily_aggregated AS (
    SELECT
        patient_id,
        metric_type,
        DATE(reading_timestamp) AS reading_date,
        AVG(measured_value) AS avg_daily_value,
        MIN(measured_value) AS min_daily_value,
        MAX(measured_value) AS max_daily_value,
        STDDEV(measured_value) AS stddev_daily_value,
        COUNT(1) AS reading_count
    FROM
        {{ ref('stg_vitals_telemetry') }}
    GROUP BY
        patient_id,
        metric_type,
        DATE(reading_timestamp)
)

SELECT
    patient_id,
    metric_type,
    reading_date,
    avg_daily_value,
    min_daily_value,
    max_daily_value,
    COALESCE(stddev_daily_value, 0) AS daily_volatility,
    reading_count,
    -- 7-Day Rolling Moving Average
    AVG(avg_daily_value) OVER (
        PARTITION BY patient_id, metric_type
        ORDER BY reading_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_7d_avg,
    -- 30-Day Rolling Moving Average
    AVG(avg_daily_value) OVER (
        PARTITION BY patient_id, metric_type
        ORDER BY reading_date
        ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
    ) AS rolling_30d_avg
FROM
    daily_aggregated
