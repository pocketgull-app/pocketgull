import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { GseExplorerService, IGseDataset } from './gse-explorer.service';
import { PhysicalGenomicsService } from './physical-genomics.service';

describe('GseExplorerService Suite', () => {
  let service: GseExplorerService;
  let physicalGenomics: PhysicalGenomicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GseExplorerService,
        PhysicalGenomicsService
      ]
    });
    service = TestBed.inject(GseExplorerService);
    physicalGenomics = TestBed.inject(PhysicalGenomicsService);
  });

  it('1. Initializes GSE catalog including University of Virginia (UVA) datasets', () => {
    const catalog = service.gseCatalog();
    expect(catalog.length).toBeGreaterThanOrEqual(5);

    const uvaCartilage = catalog.find(g => g.accession === 'GSE131900');
    expect(uvaCartilage).toBeDefined();
    expect(uvaCartilage?.institution).toContain('University of Virginia');
    expect(uvaCartilage?.contributingLab).toContain('Manning Institute');
    expect(uvaCartilage?.experimentType).toBe('Spatial Transcriptomics');
  });

  it('2. Searches GSE datasets by query, accession, and institution', () => {
    const uvaResults = service.searchGse('Virginia');
    expect(uvaResults.length).toBeGreaterThanOrEqual(3);

    const hicResults = service.searchGse('Hi-C');
    expect(hicResults.length).toBeGreaterThanOrEqual(1);
    expect(hicResults[0].accession).toBe('GSE165512');

    const exactMatch = service.getGseByAccession('GSE200155');
    expect(exactMatch).toBeDefined();
    expect(exactMatch?.title).toContain('MED1/BRD4');
  });

  it('3. Ingests GSE dataset parameters into PhysicalGenomicsService', () => {
    const gse = service.getGseByAccession('GSE165512') as IGseDataset;
    expect(gse).toBeDefined();

    service.ingestIntoPhysicalGenomics(gse);

    const priors = physicalGenomics.activePriors();
    expect(priors.ecmStiffnessKPa).toBe(8.5);
    expect(priors.epigeneticState).toBe('HETEROCHROMATIN_H3K9ME3');
    expect(priors.rationale).toContain('NCBI GEO GSE165512');
  });
});
