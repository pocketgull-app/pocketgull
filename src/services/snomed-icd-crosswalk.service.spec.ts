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
    expect(result.mapping?.hccCategory).toContain('HCC 138');
    expect(result.recommendedCptProcedures[0].cptCode).toBe('70553');
    expect(result.uscdiv4CompliantPayload.system).toBe('http://snomed.info/sct');
  });

  it('2. Cross-walks SNOMED CT 49049000 (Parkinson\'s) to ICD-10 G20 and CPT 78607 DaTscan SPECT', () => {
    const result = service.crosswalkSnomedToIcd10('49049000');
    expect(result.mapping?.icd10Code).toBe('G20');
    expect(result.mapping?.rxNormCui).toBe('205461');
    expect(result.recommendedCptProcedures[0].description).toContain('DaTscan');
  });

  it('3. Cross-walks SNOMED CT 88805009 (Heart Failure) to ICD-10 I50.22, HCC 226, and TTE CPT 93306', () => {
    const result = service.crosswalkSnomedToIcd10('88805009');
    expect(result.mapping?.icd10Code).toBe('I50.22');
    expect(result.mapping?.hccCategory).toContain('HCC 226');
    expect(result.mapping?.rafWeight).toBe(0.368);
    expect(result.recommendedCptProcedures.some(c => c.cptCode === '93306')).toBe(true);
    expect(result.mapping?.loincCode).toBe('30934-4');
  });

  it('4. Reverse cross-walks ICD-10-CM code to SNOMED-CT concept (I10 -> 38341003)', () => {
    const result = service.crosswalkIcd10ToSnomed('I10');
    expect(result).not.toBeNull();
    expect(result?.snomedCode).toBe('38341003');
    expect(result?.mapping?.snomedTerm).toBe('Essential hypertension');
  });

  it('5. Performs fuzzy search across clinical terms and codes', () => {
    const results = service.searchByTerm('nephropathy');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].mapping?.icd10Code).toBe('E11.22');
  });

  it('6. Automatically extracts and crosswalks clinical concepts from narrative text', () => {
    const note = 'Patient diagnosed with chronic obstructive pulmonary disease and reports severe food insecurity on social intake.';
    const matches = service.autoExtractAndCrosswalk(note);
    expect(matches.length).toBeGreaterThanOrEqual(2);
    
    const copdMatch = matches.find(m => m.concept.mapping?.snomedCode === '13645005');
    expect(copdMatch).toBeDefined();
    expect(copdMatch?.concept.mapping?.icd10Code).toBe('J44.1');

    const foodMatch = matches.find(m => m.concept.mapping?.snomedCode === '733423003');
    expect(foodMatch).toBeDefined();
    expect(foodMatch?.concept.mapping?.icd10Code).toBe('Z59.41');
  });

  it('7. Correctly suppresses negated concepts during extraction', () => {
    const note = 'Patient with hypertension who denies memory loss or history of Alzheimer.';
    const matches = service.autoExtractAndCrosswalk(note);
    expect(matches.some(m => m.concept.mapping?.snomedCode === '38341003')).toBe(true);
    expect(matches.some(m => m.concept.mapping?.snomedCode === '26929004')).toBe(false);
  });

  it('8. Generates compliant FHIR R4 Bundle with dual SNOMED-CT and ICD-10 codings', () => {
    const xwalks = [
      service.crosswalkSnomedToIcd10('38341003'),
      service.crosswalkSnomedToIcd10('88805009')
    ];
    const bundle = service.generateFhirR4CrosswalkBundle(xwalks, 'p_test_patient');
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.entry.length).toBe(2);
    
    const cond1 = bundle.entry[0].resource;
    expect(cond1.resourceType).toBe('Condition');
    expect(cond1.code.coding.some((c: any) => c.system === 'http://snomed.info/sct' && c.code === '38341003')).toBe(true);
    expect(cond1.code.coding.some((c: any) => c.system === 'http://hl7.org/fhir/sid/icd-10-cm' && c.code === 'I10')).toBe(true);
    expect(cond1.subject.reference).toBe('Patient/p_test_patient');
  });

  it('9. Handles unmapped SNOMED codes gracefully', () => {
    const result = service.crosswalkSnomedToIcd10('99999999');
    expect(result.mapping).toBeNull();
    expect(result.uscdiv4CompliantPayload.icd10Crosswalk).toBe('Unmapped');
  });
});
