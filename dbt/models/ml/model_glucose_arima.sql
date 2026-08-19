{{ config(
    materialized='model',
    model_type='ARIMA_PLUS',
    time_series_timestamp_col='reading_date',
    time_series_data_col='avg_daily_value',
    time_series_id_col='patient_id',
    auto_arima=True,
    data_frequency='AUTO_FREQUENCY',
    holiday_region='US',
    description='BigQuery ML ARIMA_PLUS model trained on historical patient CGM glucose trajectory series'
) }}

SELECT
    patient_id,
    reading_date,
    avg_daily_value
FROM
    {{ ref('fct_patient_trajectories') }}
WHERE
    metric_type = 'glucose_cgm'
    AND reading_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 180 DAY)
