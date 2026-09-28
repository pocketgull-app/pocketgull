// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import {
  IDeidentifiedPatientRow,
  IDeidentifiedConditionRow,
  IDeidentifiedObservationRow,
  IDeidentifiedMedicationRow,
  IClinicalParquetBundle,
  IFhirBundle,
  IFhirResource
} from './types.js';
import { SafeHarborDeidentifier } from './safe-harbor-deid.js';

export class FhirColumnarFlattener {
  private readonly deid: SafeHarborDeidentifier;

  constructor(customSalt?: string) {
    this.deid = new SafeHarborDeidentifier(customSalt);
  }

  /**
   * Flattens an entire FHIR R4 Bundle into Safe Harbor de-identified columnar tables
   */
  flattenBundle(bundle: IFhirBundle): IClinicalParquetBundle {
    const patients: IDeidentifiedPatientRow[] = [];
    const conditions: IDeidentifiedConditionRow[] = [];
    const observations: IDeidentifiedObservationRow[] = [];
    const medications: IDeidentifiedMedicationRow[] = [];

    const entries = bundle.entry || [];
    for (const entry of entries) {
      const res = entry.resource;
      if (!res) continue;

      switch (res.resourceType) {
        case 'Patient':
          patients.push(this.flattenPatient(res));
          break;
        case 'Condition':
          conditions.push(this.flattenCondition(res));
          break;
        case 'Observation':
          observations.push(this.flattenObservation(res));
          break;
        case 'MedicationRequest':
          medications.push(this.flattenMedicationRequest(res));
          break;
      }
    }

    return {
      patients,
      conditions,
      observations,
      medications,
      metadata: {
        generatedEpoch: Math.floor(Date.now() / 1000),
        patientCount: patients.length,
        observationCount: observations.length,
        conditionCount: conditions.length,
        medicationCount: medications.length,
        deidentificationProtocol: 'HIPAA_SAFE_HARBOR_164_514',
        compressionCodec: 'SNAPPY',
        columnarEncoding: 'DICTIONARY_RLE'
      }
    };
  }

  flattenPatient(res: IFhirResource): IDeidentifiedPatientRow {
    const rawId = (res.id as string) || 'UNKNOWN';
    const birthDate = res['birthDate'] as string | undefined;
    const gender = (res['gender'] as string) || 'unknown';

    let zip3: string | undefined;
    const address = res['address'] as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(address) && address[0] && typeof address[0]['postalCode'] === 'string') {
      zip3 = this.deid.maskPostalCode(address[0]['postalCode']);
    }

    return {
      deid_patient_id: this.deid.hashPatientId(rawId),
      age_tier: this.deid.calculateAgeTier(birthDate),
      gender: gender.toUpperCase(),
      postal_prefix_3digit: zip3
    };
  }

  flattenCondition(res: IFhirResource): IDeidentifiedConditionRow {
    const conditionId = (res.id as string) || `cond_${Math.random().toString(36).substring(2, 9)}`;
    const subjectRef = (res['subject'] as { reference?: string })?.reference || '';
    const rawPatientId = subjectRef.replace(/^Patient\//, '');

    let icd10 = 'UNKNOWN';
    let snomed = 'UNKNOWN';
    const codeObj = res['code'] as { coding?: Array<{ system?: string; code?: string }> } | undefined;
    if (codeObj?.coding) {
      for (const c of codeObj.coding) {
        if (c.system?.includes('icd-10') || c.system?.includes('hl7.org/fhir/sid/icd-10')) {
          icd10 = c.code || icd10;
        } else if (c.system?.includes('snomed')) {
          snomed = c.code || snomed;
        }
      }
    }

    const clinicalStatus = (res['clinicalStatus'] as { coding?: Array<{ code?: string }> })?.coding?.[0]?.code || 'active';
    const verificationStatus = (res['verificationStatus'] as { coding?: Array<{ code?: string }> })?.coding?.[0]?.code || 'confirmed';

    let onsetYear: number | undefined;
    const onsetDateTime = res['onsetDateTime'] as string | undefined;
    if (onsetDateTime) {
      const match = onsetDateTime.match(/^(\d{4})/);
      if (match) onsetYear = parseInt(match[1], 10);
    }

    return {
      condition_id: conditionId,
      deid_patient_id: this.deid.hashPatientId(rawPatientId),
      icd10_code: icd10,
      snomed_code: snomed,
      clinical_status: clinicalStatus,
      verification_status: verificationStatus,
      onset_year: onsetYear
    };
  }

  flattenObservation(res: IFhirResource): IDeidentifiedObservationRow {
    const obsId = (res.id as string) || `obs_${Math.random().toString(36).substring(2, 9)}`;
    const subjectRef = (res['subject'] as { reference?: string })?.reference || '';
    const rawPatientId = subjectRef.replace(/^Patient\//, '');

    let loinc = 'UNKNOWN';
    let display = 'Observation';
    const codeObj = res['code'] as { coding?: Array<{ system?: string; code?: string; display?: string }>; text?: string } | undefined;
    if (codeObj?.coding) {
      for (const c of codeObj.coding) {
        if (c.system?.includes('loinc')) {
          loinc = c.code || loinc;
          display = c.display || display;
        }
      }
    }
    if (codeObj?.text && display === 'Observation') {
      display = codeObj.text;
    }

    let valNum: number | undefined;
    let unit: string | undefined;
    let valStr: string | undefined;

    const valQty = res['valueQuantity'] as { value?: number; unit?: string } | undefined;
    if (valQty && typeof valQty.value === 'number') {
      valNum = valQty.value;
      unit = valQty.unit;
    } else if (typeof res['valueString'] === 'string') {
      valStr = res['valueString'];
    }

    let epochSec = 0;
    const effDate = (res['effectiveDateTime'] as string) || (res['issued'] as string);
    if (effDate) {
      const parsed = Date.parse(effDate);
      if (!isNaN(parsed)) epochSec = Math.floor(parsed / 1000);
    }

    return {
      observation_id: obsId,
      deid_patient_id: this.deid.hashPatientId(rawPatientId),
      loinc_code: loinc,
      code_display: display,
      value_numeric: valNum,
      value_string: valStr,
      unit,
      effective_epoch_seconds: epochSec
    };
  }

  flattenMedicationRequest(res: IFhirResource): IDeidentifiedMedicationRow {
    const medId = (res.id as string) || `med_${Math.random().toString(36).substring(2, 9)}`;
    const subjectRef = (res['subject'] as { reference?: string })?.reference || '';
    const rawPatientId = subjectRef.replace(/^Patient\//, '');

    let rxnorm = 'UNKNOWN';
    let medName = 'Unknown Medication';
    const medCodableConcept = res['medicationCodeableConcept'] as { coding?: Array<{ system?: string; code?: string; display?: string }>; text?: string } | undefined;
    if (medCodableConcept?.coding) {
      for (const c of medCodableConcept.coding) {
        if (c.system?.includes('rxnorm')) {
          rxnorm = c.code || rxnorm;
          medName = c.display || medName;
        }
      }
    }
    if (medCodableConcept?.text) {
      medName = medCodableConcept.text;
    }

    let quantity: number | undefined;
    let dosageUnit: string | undefined;
    const dosageInstruction = res['dosageInstruction'] as Array<{ doseAndRate?: Array<{ doseQuantity?: { value?: number; unit?: string } }> }> | undefined;
    if (dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity) {
      quantity = dosageInstruction[0].doseAndRate[0].doseQuantity.value;
      dosageUnit = dosageInstruction[0].doseAndRate[0].doseQuantity.unit;
    }

    const status = (res['status'] as string) || 'active';

    let authoredYear: number | undefined;
    const authoredOn = res['authoredOn'] as string | undefined;
    if (authoredOn) {
      const match = authoredOn.match(/^(\d{4})/);
      if (match) authoredYear = parseInt(match[1], 10);
    }

    return {
      medication_id: medId,
      deid_patient_id: this.deid.hashPatientId(rawPatientId),
      rxnorm_code: rxnorm,
      medication_name: medName,
      dosage_quantity: quantity,
      dosage_unit: dosageUnit,
      status,
      authored_year: authoredYear
    };
  }
}
