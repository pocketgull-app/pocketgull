import { describe, it, expect } from 'vitest';
import { FhirR7HorizonService } from './fhir-r7-horizon.service';

describe('FhirR7HorizonService', () => {
  it('should construct valid FHIR 7 (Release 7 Horizon) bundle with post-quantum security meta', () => {
    const mockState: any = {
      vitals: () => ({ hr: '72', temp: '98.6' })
    };

    const fn = FhirR7HorizonService.prototype.generateFhir7Bundle;
    const bundle = fn.call({} as any, mockState);

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.meta.fhirVersion).toBe('7.0.0-horizon');
    expect(bundle.meta.postQuantumEncryption).toContain('ML-KEM-1024');
    expect(bundle.entry.length).toBe(2);

    const biophysicsStream = bundle.entry[0].resource as any;
    expect(biophysicsStream.resourceType).toBe('BiophysicsStreamObservation');
    expect(biophysicsStream.samplingRateHz).toBe(100);

    const epigeneticBundle = bundle.entry[1].resource as any;
    expect(epigeneticBundle.resourceType).toBe('EpigeneticTransgenerationalBundle');
    expect(epigeneticBundle.lineageDepthGenerations).toBe(7);
  });
});
