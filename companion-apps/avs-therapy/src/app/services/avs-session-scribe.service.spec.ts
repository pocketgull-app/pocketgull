import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AvsSessionScribeService } from './avs-session-scribe.service';

describe('AvsSessionScribeService', () => {
  let service: AvsSessionScribeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AvsSessionScribeService]
    });
    service = TestBed.inject(AvsSessionScribeService);
  });

  it('should calculate stress reduction percentage between pre and post sessions', () => {
    const pre = service.preSessionVocal().vocalArousalScore; // 78
    const post = service.postSessionVocal().vocalArousalScore; // 28
    const expected = Math.round(((pre - post) / pre) * 100);
    expect(service.stressReductionPct()).toBe(expected);
  });

  it('should generate a compliant FHIR R4 Bundle with CarePlan and Observations', () => {
    const bundle = service.generateFhirR4Bundle('p-test-123');
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
    expect(bundle.entry.length).toBe(3);

    const carePlan = bundle.entry.find(e => e.resource.resourceType === 'CarePlan')?.resource;
    expect(carePlan).toBeDefined();
    expect(carePlan?.subject?.reference).toBe('Patient/p-test-123');
    expect(carePlan?.category[0]?.coding[0]?.code).toBe('229555009'); // SNOMED audio-visual entrainment

    const hrvObs = bundle.entry.find(e => e.resource.resourceType === 'Observation' && e.resource.id.includes('hrv'))?.resource;
    expect(hrvObs?.valueQuantity?.value).toBe(54);
    expect(hrvObs?.valueQuantity?.unit).toBe('ms');
  });
});
