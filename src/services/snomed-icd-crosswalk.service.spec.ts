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

  it('4. Cross-walks SNOMED CT 81680005 (Cervicalgia / Neck Pain) to ICD-10 M54.2 and CPT 97110', () => {
    const result = service.crosswalkSnomedToIcd10('81680005');
    expect(result.mapping?.icd10Code).toBe('M54.2');
    expect(result.mapping?.loincCode).toBe('96767-9');
    expect(result.recommendedCptProcedures[0].cptCode).toBe('97110');
    expect(result.recommendedCptProcedures[0].description).toContain('Therapeutic exercises');
  });

  it('5. Cross-walks SNOMED CT 4384001 (Carpal Tunnel) to ICD-10 G56.00 and CPT 95907', () => {
    const result = service.crosswalkSnomedToIcd10('4384001');
    expect(result.mapping?.icd10Code).toBe('G56.00');
    expect(result.mapping?.loincCode).toBe('85732-6');
    expect(result.recommendedCptProcedures[0].cptCode).toBe('95907');
    expect(result.recommendedCptProcedures[0].description).toContain('Nerve conduction');
  });

  it('6. Cross-walks SNOMED CT 33776007 (Asthenopia / Eye Strain) to ICD-10 H53.149 and LOINC 96768-7', () => {
    const result = service.crosswalkSnomedToIcd10('33776007');
    expect(result.mapping?.icd10Code).toBe('H53.149');
    expect(result.mapping?.loincCode).toBe('96768-7');
    expect(result.recommendedCptProcedures[0].cptCode).toBe('92012');
  });

  it('7. Cross-walks SNOMED CT 225444004 (Occupational Burnout) to ICD-10 Z73.0 and CPT 96156', () => {
    const result = service.crosswalkSnomedToIcd10('225444004');
    expect(result.mapping?.icd10Code).toBe('Z73.0');
    expect(result.mapping?.loincCode).toBe('75276-6');
    expect(result.recommendedCptProcedures[0].cptCode).toBe('96156');
  });
});
