import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EhrInteroperabilityEngineService, LOINC_CODES, SNOMED_CODES } from './ehr-interoperability-engine.service';
import { PatientStateService } from '../patient-state.service';
import { PatientManagementService } from '../patient-management.service';

describe('EhrInteroperabilityEngineService', () => {
  let service: EhrInteroperabilityEngineService;
  let mockPatientState: any;
  let mockPatientMgmt: any;

  beforeEach(() => {
    mockPatientState = {
      vitals: signal({ hr: 84, spO2: '97%' }),
      issues: signal({
        spine_thoracic: [{ id: 'iss-1', name: 'Neuropathic spinal burning pain' }]
      }),
      updateVital: vi.fn(),
      addClinicalNote: vi.fn()
    };
    vi.spyOn(mockPatientState.issues, 'update');
    mockPatientMgmt = {
      selectedPatient: signal({ id: 'p_curie', name: 'Marie Curie', gender: 'Female' })
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: PatientManagementService, useValue: mockPatientMgmt },
        EhrInteroperabilityEngineService
      ]
    });

    service = runInInjectionContext(injector, () => injector.get(EhrInteroperabilityEngineService));
  });

  it('1. Exports US Core v6.0 FHIR R4 Bundle with LOINC vitals and SNOMED conditions', async () => {
    const bundle = await service.exportHospitalEhrBundle({ standard: 'US_CORE_V6', vendor: 'epic' });
    expect(bundle).toBeDefined();
    expect(bundle['resourceType']).toBe('Bundle');
    expect(bundle['meta'].profile[0]).toContain('us-core-bundle');

    // Verify Patient resource
    const patientEntry = bundle['entry'].find((e: any) => e.resource.resourceType === 'Patient');
    expect(patientEntry).toBeDefined();
    expect(patientEntry.resource.name[0].text).toBe('Marie Curie');

    // Verify Observation with LOINC HR
    const hrObservation = bundle['entry'].find(
      (e: any) => e.resource.resourceType === 'Observation' && e.resource.code.coding[0].code === LOINC_CODES.HEART_RATE.code
    );
    expect(hrObservation).toBeDefined();
    expect(hrObservation.resource.valueQuantity.value).toBe(84);

    // Verify Provenance Part 11 Electronic Signature Seal
    const provenanceEntry = bundle['entry'].find((e: any) => e.resource.resourceType === 'Provenance');
    expect(provenanceEntry).toBeDefined();
    expect(provenanceEntry.resource._part11Attestation.sha256Digest).toBeDefined();
  });

  it('2. Exports UK Core NHS FHIR R4 Bundle with UKCore profiles', async () => {
    const bundle = await service.exportHospitalEhrBundle({ standard: 'UK_CORE_NHS', vendor: 'generic' });
    expect(bundle).toBeDefined();
    expect(bundle['meta'].profile[0]).toContain('UKCore-Bundle');
    const patientEntry = bundle['entry'].find((e: any) => e.resource.resourceType === 'Patient');
    expect(patientEntry.resource.meta.profile[0]).toContain('UKCore-Patient');
  });

  it('3. Generates verifiable FDA 21 CFR Part 11 cryptographic digital seal', async () => {
    const mockPayload = { resourceType: 'Bundle', id: 'b123' };
    const seal = await service.generatePart11IntegritySeal(mockPayload, 'Dr. Alan Turing, MD', 'ATTENDING_PHYSICIAN');
    expect(seal.signerName).toBe('Dr. Alan Turing, MD');
    expect(seal.sha256Digest.length).toBe(64);
    expect(seal.nonRepudiationSeal).toContain('PG-PART11');
  });

  it('4. Ingests hospital EHR bundle and synchronizes vitals and conditions to patient state', async () => {
    const incomingBundle = {
      resourceType: 'Bundle',
      type: 'collection',
      meta: {
        profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-bundle']
      },
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: 'p_epic_99',
            name: [{ text: 'Ada Lovelace' }]
          }
        },
        {
          resource: {
            resourceType: 'Observation',
            code: { coding: [{ system: 'http://loinc.org', code: LOINC_CODES.HEART_RATE.code }] },
            valueQuantity: { value: 76 }
          }
        },
        {
          resource: {
            resourceType: 'Condition',
            code: {
              coding: [{ system: 'http://snomed.info/sct', code: SNOMED_CODES.PAIN.code }],
              text: 'Thoracic neuralgia'
            }
          }
        },
        {
          resource: {
            resourceType: 'Provenance',
            _part11Attestation: {
              sha256Digest: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90'
            }
          }
        }
      ]
    };

    const report = await service.ingestHospitalEhrBundle(incomingBundle);
    expect(report.success).toBe(true);
    expect(report.patientName).toBe('Ada Lovelace');
    expect(report.vitalsExtracted['hr']).toBe(76);
    expect(report.conditionsExtracted.length).toBe(1);
    expect(report.part11SealVerified).toBe(true);
    expect(mockPatientState.updateVital).toHaveBeenCalledWith('hr', '76');
    expect(mockPatientState.issues.update).toHaveBeenCalled();
  });
});
