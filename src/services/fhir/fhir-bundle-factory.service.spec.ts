import '@angular/compiler';
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

  it('7. Creates LOINC 98252-0 Biophysical Observation resource with multi-paradigm extensions', () => {
    const obs = factory.createBiophysicalObservationResource('p-101', {
      hookRatio: 1.52,
      floryChi: 2.45,
      thermalKbT: 4.28e-21,
      singletYield: 0.82,
      tripletYield: 0.18,
      poreDiameter: 0.75,
      tubulinAcetylationRatio: 1.45,
      cannabinoidCompound: 'Cannabidiol (CBD)',
      cannabinoidDose: 2.5
    });

    expect(obs['resourceType']).toBe('Observation');
    expect(obs['status']).toBe('final');
    expect(obs['code']['coding'][0]['code']).toBe('98252-0');
    expect(obs['component'].length).toBe(6);
    expect(obs['extension'].length).toBe(6);

    const hookExt = obs['extension'].find((x: any) => x.url === 'http://pocketgull.app/fhir/StructureDefinition/protac-hook-effect');
    expect(hookExt.extension.find((e: any) => e.url === 'hook-saturation-ratio').valueDecimal).toBe(1.52);

    const floryExt = obs['extension'].find((x: any) => x.url === 'http://pocketgull.app/fhir/StructureDefinition/llps-phase-boundary');
    expect(floryExt.extension.find((e: any) => e.url === 'hydrophobic-flory-chi').valueDecimal).toBe(2.45);

    const cannaExt = obs['extension'].find((x: any) => x.url === 'http://pocketgull.app/fhir/StructureDefinition/cannabinoid-microtubule-stabilization');
    expect(cannaExt).toBeDefined();
    expect(cannaExt.extension.find((e: any) => e.url === 'tubulin-acetylation-ratio').valueDecimal).toBe(1.45);
  });

  it('8. Creates LOINC 98253-8 Physical Genomics Observation resource with 3D genome engineering extensions', () => {
    const obs = factory.createPhysicalGenomicsObservationResource('p-101', {
      tadInsulationScore: 0.91,
      fractalScalingGamma: 1.08,
      activeLoopsCount: 7,
      condensateRadiusNm: 155.0,
      burstFrequencyPerHour: 42.0,
      crisprNetDeltaG: -19.2,
      crisprCleavageProbPct: 98.4,
      nucleosomeOuterRuptureForcePn: 4.5,
      nucleosomeInnerRuptureForcePn: 19.8,
      lincBridgeForcePn: 16.2,
      yapTazNuclearRatio: 2.1,
      mechanostate: 'STIFF_PRO_FIBROTIC_ONCOGENIC'
    });

    expect(obs['resourceType']).toBe('Observation');
    expect(obs['status']).toBe('final');
    expect(obs['code']['coding'][0]['code']).toBe('98253-8');
    expect(obs['component'].length).toBe(7);
    expect(obs['extension'].length).toBe(5);

    const loopExt = obs['extension'].find((x: any) => x.url === 'http://pocketgull.app/fhir/StructureDefinition/loop-extrusion-polymer');
    expect(loopExt.extension.find((e: any) => e.url === 'tad-insulation-score').valueDecimal).toBe(0.91);

    const crisprExt = obs['extension'].find((x: any) => x.url === 'http://pocketgull.app/fhir/StructureDefinition/crispr-r-loop-mechanics');
    expect(crisprExt.extension.find((e: any) => e.url === 'net-delta-g-kcal-per-mol').valueDecimal).toBe(-19.2);

    const lincExt = obs['extension'].find((x: any) => x.url === 'http://pocketgull.app/fhir/StructureDefinition/linc-mechanotransduction');
    expect(lincExt.extension.find((e: any) => e.url === 'mechanostate').valueString).toBe('STIFF_PRO_FIBROTIC_ONCOGENIC');
  });
});


