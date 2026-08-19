{{ config(
    materialized='view',
    description='Staging view parsing and flattening raw FHIR R4 Observations from BigQuery landing store'
) }}

WITH raw_fhir AS (
    SELECT
        id AS observation_id,
        JSON_VALUE(resource, '$.subject.reference') AS patient_reference,
        JSON_VALUE(resource, '$.code.coding[0].code') AS loinc_code,
        JSON_VALUE(resource, '$.code.coding[0].display') AS loinc_display,
        SAFE_CAST(JSON_VALUE(resource, '$.valueQuantity.value') AS FLOAT64) AS measured_value,
        JSON_VALUE(resource, '$.valueQuantity.unit') AS unit,
        SAFE_CAST(JSON_VALUE(resource, '$.effectiveDateTime') AS TIMESTAMP) AS effective_timestamp,
        JSON_VALUE(resource, '$.status') AS observation_status
    FROM
        {{ source('pocketgull_raw', 'fhir_observations_raw') }}
    WHERE
        id IS NOT NULL
)

SELECT
    observation_id,
    REPLACE(patient_reference, 'Patient/', '') AS patient_id,
    loinc_code,
    loinc_display,
    measured_value,
    unit,
    COALESCE(effective_timestamp, CURRENT_TIMESTAMP()) AS reading_timestamp,
    observation_status
FROM
    raw_fhir
WHERE
    measured_value IS NOT NULL
