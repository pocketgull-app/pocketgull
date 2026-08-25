import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { FhirIntegrationService } from './fhir-integration.service';
import { FhirBundleFactoryService } from './fhir-bundle-factory.service';

describe('FhirIntegrationService SMART on FHIR App Launch & FHIR R4 Bundle Exporter', () => {
  let service: FhirIntegrationService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        FhirIntegrationService,
        FhirBundleFactoryService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(FhirIntegrationService));
  });

  it('should discover SMART endpoints via .well-known/smart-configuration fallback', async () => {
    const config = await service.discoverSmartEndpoints('https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4');

    expect(config).toBeDefined();
    expect(config?.authorization_endpoint).toBeDefined();
    expect(config?.token_endpoint).toBeDefined();
    expect(config?.capabilities).toBeDefined();
  });

  it('should generate a valid HL7 FHIR R4 CarePlan Bundle containing Patient, Observation, and CarePlan resources', () => {
    const mockPatient = {
      patientId: 'patient-test-123',
      name: 'Eleanor Vance',
      age: 38,
      vitals: { hr: 76, spO2: 99 }
    };

    const bundle = service.buildFhirR4CarePlanBundle(mockPatient, 'Functional Protocols');

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
    expect(bundle.entry).toHaveLength(3);

    const patientEntry = bundle.entry.find((e: any) => e.resource.resourceType === 'Patient');
    expect(patientEntry).toBeDefined();
    expect(patientEntry.resource.id).toBe('patient-test-123');

    const observationEntry = bundle.entry.find((e: any) => e.resource.resourceType === 'Observation');
    expect(observationEntry).toBeDefined();
    expect(observationEntry.resource.code.coding[0].code).toBe('8867-4'); // LOINC Heart Rate

    const carePlanEntry = bundle.entry.find((e: any) => e.resource.resourceType === 'CarePlan');
    expect(carePlanEntry).toBeDefined();
    expect(carePlanEntry.resource.title).toContain('Pocket-Gull Care Strategy: Functional Protocols');
  });
});
