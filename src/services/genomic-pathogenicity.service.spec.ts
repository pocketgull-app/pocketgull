import { describe, it, expect, beforeEach } from 'vitest';
import { GenomicPathogenicityService, IGenomicVariant } from './genomic-pathogenicity.service';

describe('GenomicPathogenicityService', () => {
  let service: GenomicPathogenicityService;

  beforeEach(() => {
    service = new GenomicPathogenicityService();
  });

  it('should initialize with default ClinVar variants', () => {
    expect(service.totalVariantsCount()).toBeGreaterThan(0);
    expect(service.selectedVariant()).not.toBeNull();
  });

  it('should lookup variant by exact rsID', () => {
    const apoe = service.lookupByRsId('rs429358');
    expect(apoe).toBeDefined();
    expect(apoe?.gene).toBe('APOE');
    expect(apoe?.acmgClassification).toBe('Pathogenic');

    const mthfr = service.lookupByRsId('RS1801133');
    expect(mthfr).toBeDefined();
    expect(mthfr?.gene).toBe('MTHFR');

    const missing = service.lookupByRsId('rs9999999999');
    expect(missing).toBeNull();
  });

  it('should filter variants by search query', () => {
    service.setSearchQuery('CYP2D6');
    const filtered = service.filteredVariants();
    expect(filtered.length).toBe(1);
    expect(filtered[0]?.gene).toBe('CYP2D6');
  });

  it('should filter variants by ACMG classification', () => {
    service.setAcmgFilter('Variant of Uncertain Significance (VUS)');
    const filtered = service.filteredVariants();
    expect(filtered.every(v => v.acmgClassification === 'Variant of Uncertain Significance (VUS)')).toBe(true);
  });

  it('should select an active variant', () => {
    const mthfr = service.lookupByRsId('rs1801133')!;
    service.selectVariant(mthfr);
    expect(service.selectedVariant()?.rsId).toBe('rs1801133');
  });

  it('should export a valid FHIR R4 Genomic Bundle', () => {
    const bundle = service.exportFhirR4GenomicBundle();
    expect(bundle['resourceType']).toBe('Bundle');
    expect(bundle['type']).toBe('collection');
    expect(bundle['entry']).toBeDefined();
    expect(bundle['entry'].length).toBe(2);

    const molecularSeq = bundle['entry'][0]['resource'];
    expect(molecularSeq['resourceType']).toBe('MolecularSequence');
    expect(molecularSeq['type']).toBe('dna');

    const observation = bundle['entry'][1]['resource'];
    expect(observation['resourceType']).toBe('Observation');
    expect(observation['status']).toBe('final');
  });
});
