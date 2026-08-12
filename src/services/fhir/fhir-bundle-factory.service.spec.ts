import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { FhirBundleFactoryService } from './fhir-bundle-factory.service';

describe('FhirBundleFactoryService', () => {
  const factory = new FhirBundleFactoryService();

  it('1. Creates US Core compliant FHIR Patient resource', () => {
    const patient = factory.createPatientResource({
      patientId: 'p-101',
      name: 'Charles Darwin',
      age: 73,
      gender: 'male'
    });

    expect(patient['resourceType']).toBe('Patient');
    expect(patient['id']).toBe('p-101');
    expect(patient['name'][0]['family']).toBe('Darwin');
    expect(patient['name'][0]['given'][0]).toBe('Charles');
    expect(patient['gender']).toBe('male');
    expect(patient['meta']['profile'][0]).toContain('us-core-patient');
  });

  it('2. Creates FHIR Observation resource with LOINC coding', () => {
    const obs = factory.createVitalObservationResource('p-101', 'Heart Rate', '72 bpm', {
      loincCode: '8867-4',
      category: 'vital-signs'
    });

    expect(obs['resourceType']).toBe('Observation');
    expect(obs['status']).toBe('final');
    expect(obs['subject']['reference']).toBe('Patient/p-101');
    expect(obs['code']['coding'][0]['code']).toBe('8867-4');
    expect(obs['valueString']).toBe('72 bpm');
  });

  it('3. Creates FHIR CarePlan resource', () => {
    const plan = factory.createCarePlanResource('p-101', 'Cardiovascular Risk Management Plan', 'Lifestyle adjunct & aerobic exercise target');

    expect(plan['resourceType']).toBe('CarePlan');
    expect(plan['status']).toBe('active');
    expect(plan['intent']).toBe('plan');
    expect(plan['title']).toBe('Cardiovascular Risk Management Plan');
    expect(plan['subject']['reference']).toBe('Patient/p-101');
  });

  it('4. Builds FHIR R4 CarePlan Bundle collection', () => {
    const bundle = factory.buildFhirR4CarePlanBundle(
      { patientId: 'p-102', name: 'Marie Curie', vitals: { hr: 68 } },
      'Oncology Precision Strategy'
    );

    expect(bundle['resourceType']).toBe('Bundle');
    expect(bundle['type']).toBe('collection');
    expect(bundle['entry'].length).toBe(3);
    expect(bundle['entry'][0]['resource']['resourceType']).toBe('Patient');
    expect(bundle['entry'][1]['resource']['resourceType']).toBe('Observation');
    expect(bundle['entry'][2]['resource']['resourceType']).toBe('CarePlan');
  });

  it('5. Builds FHIR R5 Telemetry Transaction Bundle', () => {
    const bundle = factory.buildFhirR5TelemetryBundle({ hr: 80, bp: '118/76', spO2: 99 });

    expect(bundle['resourceType']).toBe('Bundle');
    expect(bundle['type']).toBe('transaction');
    expect(bundle['entry'].length).toBe(4);
    expect(bundle['entry'][0]['request']['url']).toBe('Patient');
    expect(bundle['entry'][1]['request']['url']).toBe('SubscriptionTopic');
    expect(bundle['entry'][2]['request']['url']).toBe('Observation');
    expect(bundle['entry'][3]['request']['url']).toBe('CarePlan');
  });

  it('6. Sanitizes string inputs against XSS', () => {
    const sanitized = factory.sanitize('<script>alert("xss")</script>Healthy Heart Plan');
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('Healthy Heart Plan');
  });
});
