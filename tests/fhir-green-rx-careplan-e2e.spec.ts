import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID } from '@angular/core';
import { StorageService } from '../src/services/storage.service';
import { FhirR4BundleExportService } from '../src/services/fhir-r4-bundle-export.service';
import { GlobalHealthInitiativesService } from '../src/services/global-health-initiatives.service';

// Mock Angular constructor effects for headless Vitest environment
vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    effect: () => ({ destroy: () => {} })
  };
});

describe('SMART-on-FHIR Green Rx CarePlan E2E Suite', () => {

  const createServices = () => {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: StorageService, useFactory: () => new StorageService() },
        { provide: GlobalHealthInitiativesService, useFactory: () => new GlobalHealthInitiativesService() },
        { provide: FhirR4BundleExportService, useFactory: () => new FhirR4BundleExportService() }
      ]
    });

    return runInInjectionContext(injector, () => ({
      fhirExport: injector.get(FhirR4BundleExportService)
    }));
  };

  it('1. Serializes Biophilic Green Rx into FHIR R4 Bundle with SNOMED CT 735985006', () => {
    const { fhirExport } = createServices();

    const bundle = fhirExport.generateBiophilicGreenRxBundle({
      patientId: 'p-phil-01',
      patientName: 'Phil Gear (Patient Model)',
      clinicianId: 'dr-curie-99',
      questId: 'vagal-odyssey-01',
      questTitle: 'The Biophilic Vagal Odyssey',
      prescribedDailyMinutes: 20,
      minCanopyPct: 80,
      maxNoiseDba: 50,
      vagalPointsAchieved: 150,
      completedAt: '2026-08-26T07:15:00Z'
    });

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('document');
    expect(bundle.entry.length).toBe(2);

    // Verify CarePlan resource
    const carePlan = bundle.entry.find(e => e.resource['resourceType'] === 'CarePlan')?.resource;
    expect(carePlan).toBeDefined();
    expect(carePlan?.status).toBe('active');
    expect(carePlan?.intent).toBe('order');
    expect(carePlan?.category[0].coding[0].code).toBe('735985006'); // SNOMED CT for nature-based activity
    expect(carePlan?.activity[0].detail.scheduledTiming.repeat.duration).toBe(20);

    // Verify Observation resource
    const observation = bundle.entry.find(e => e.resource['resourceType'] === 'Observation')?.resource;
    expect(observation).toBeDefined();
    expect(observation?.status).toBe('final');
    expect(observation?.valueQuantity.value).toBe(150);
    expect(observation?.valueQuantity.code).toBe('VAGAL_PTS');
  });

  it('2. Enforces FHIR R4 URI references and valid patient association', () => {
    const { fhirExport } = createServices();

    const bundle = fhirExport.generateBiophilicGreenRxBundle({
      patientId: 'p-ada-02',
      patientName: 'Ada Lovelace (Analytical Model)',
      questId: 'quest-sensory-02',
      questTitle: 'Sensory Shield Walk',
      prescribedDailyMinutes: 15,
      minCanopyPct: 85,
      maxNoiseDba: 45
    });

    const carePlan = bundle.entry[0].resource;
    expect(carePlan['subject'].reference).toContain('urn:uuid:patient-p-ada-02');
  });
});
