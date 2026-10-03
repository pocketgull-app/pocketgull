// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

export type AgeTier = '0-17' | '18-29' | '30-44' | '45-64' | '65-89' | '89+';

export interface IDeidentifiedPatientRow {
  deid_patient_id: string;
  age_tier: AgeTier;
  gender: string;
  postal_prefix_3digit?: string;
}

export interface IDeidentifiedConditionRow {
  condition_id: string;
  deid_patient_id: string;
  icd10_code: string;
  snomed_code: string;
  clinical_status: string;
  verification_status: string;
  onset_year?: number;
}

export interface IDeidentifiedObservationRow {
  observation_id: string;
  deid_patient_id: string;
  loinc_code: string;
  code_display: string;
  value_numeric?: number;
  value_string?: string;
  unit?: string;
  effective_epoch_seconds: number;
}

export interface IDeidentifiedMedicationRow {
  medication_id: string;
  deid_patient_id: string;
  rxnorm_code: string;
  medication_name: string;
  dosage_quantity?: number;
  dosage_unit?: string;
  status: string;
  authored_year?: number;
}

export interface IClinicalParquetBundle {
  patients: IDeidentifiedPatientRow[];
  conditions: IDeidentifiedConditionRow[];
  observations: IDeidentifiedObservationRow[];
  medications: IDeidentifiedMedicationRow[];
  metadata: {
    generatedEpoch: number;
    patientCount: number;
    observationCount: number;
    conditionCount: number;
    medicationCount: number;
    deidentificationProtocol: 'HIPAA_SAFE_HARBOR_164_514';
    compressionCodec: 'SNAPPY';
    columnarEncoding: 'DICTIONARY_RLE';
  };
}

export interface IFhirResource {
  resourceType: string;
  id?: string;
  [key: string]: unknown;
}

export interface IFhirBundle {
  resourceType: 'Bundle';
  type?: string;
  entry?: Array<{
    resource: IFhirResource;
  }>;
}
