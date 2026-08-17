import '@angular/compiler';
import { expect } from 'vitest';
import { SnomedIcdCrosswalkService } from './snomed-icd-crosswalk.service';

describe('SnomedIcdCrosswalkService Unit Suite', () => {
  let service: SnomedIcdCrosswalkService;

  beforeEach(() => {
    service = new SnomedIcdCrosswalkService();
  });

  it('1. Cross-walks SNOMED CT 26929004 (Alzheimer\'s) to ICD-10 G30.9 and CPT 70553 Brain MRI', () => {
    const result = service.crosswalkSnomedToIcd10('26929004');
    expect(result.mapping?.icd10Code).toBe('G30.9');
    expect(result.mapping?.loincCode).toBe('102607-9');
    expect(result.recommendedCptProcedures[0].cptCode).toBe('70553');
    expect(result.uscdiv4CompliantPayload.system).toBe('http://snomed.info/sct');
  });

  it('2. Cross-walks SNOMED CT 49049000 (Parkinson\'s) to ICD-10 G20 and CPT 78607 DaTscan SPECT', () => {
    const result = service.crosswalkSnomedToIcd10('49049000');
    expect(result.mapping?.icd10Code).toBe('G20');
    expect(result.mapping?.rxNormCui).toBe('205461');
    expect(result.recommendedCptProcedures[0].description).toContain('DaTscan');
  });

  it('3. Handles unmapped SNOMED codes gracefully', () => {
    const result = service.crosswalkSnomedToIcd10('99999999');
    expect(result.mapping).toBeNull();
    expect(result.uscdiv4CompliantPayload.icd10Crosswalk).toBe('Unmapped');
  });
});
