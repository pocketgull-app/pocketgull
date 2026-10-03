import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FhirWhoIctmSerializerService } from './fhir-who-ictm-serializer.service';
import { GlobalHealingParadigmsService } from './global-healing-paradigms.service';
import { WhoNihHealingGoalsService } from './who-nih-healing-goals.service';
import { PatientStateService } from './patient-state.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('FhirWhoIctmSerializerService Unit Suite', () => {
  let service: FhirWhoIctmSerializerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FhirWhoIctmSerializerService,
        GlobalHealingParadigmsService,
        WhoNihHealingGoalsService,
        PatientStateService
      ]
    });
    service = TestBed.inject(FhirWhoIctmSerializerService);
  });

  it('1. Generates a valid FHIR R4 Bundle with Patient, Condition, and CarePlan resources', () => {
    const bundle = service.generateFhirR4Bundle();
    expect(bundle).toBeTruthy();
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
    expect(bundle.entry.length).toBeGreaterThanOrEqual(4);
  });

  it('2. Encodes primary ICD-11 MMS ontology with projected ICD-10-CM and WHO Chapter 26 (ICTM) diagnoses', () => {
    const bundle = service.generateFhirR4Bundle();
    const conditionEntries = bundle.entry.filter(e => e.resource['resourceType'] === 'Condition');
    expect(conditionEntries.length).toBeGreaterThanOrEqual(4);

    const icd11Cond = conditionEntries.find(e => e.resource['code']['coding'].some((c: any) => c.system === 'http://id.who.int/icd/release/11/mms'));
    expect(icd11Cond).toBeDefined();
    expect(icd11Cond?.resource['code']['coding'].some((c: any) => c.system === 'http://hl7.org/fhir/sid/icd-10-cm')).toBe(true);

    const ictmCond = conditionEntries.find(e => e.resource['code']['coding'][0]['system'] === 'http://id.who.int/icd11/mms/ictm');
    expect(ictmCond).toBeDefined();
    expect(ictmCond?.resource['code']['coding'][0]['code']).toBe('TM-TM12.1');
  });

  it('3. Encodes Naturopathic 7-Tier Stepped CarePlan activities', () => {
    const bundle = service.generateFhirR4Bundle();
    const carePlanEntry = bundle.entry.find(e => e.resource['resourceType'] === 'CarePlan');
    expect(carePlanEntry).toBeDefined();

    const carePlan = carePlanEntry?.resource;
    expect(carePlan['activity'].length).toBe(7);
    expect(carePlan['activity'][0]['detail']['code']['text']).toContain('Tier 1');
  });

  it('4. Attaches C2PA digital provenance digest metadata', () => {
    const bundle = service.generateFhirR4Bundle();
    expect(bundle.meta.c2paDigitalAttestation).toContain('sha256:c2pa_');
  });
});
