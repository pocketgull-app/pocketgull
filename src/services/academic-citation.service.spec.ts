import { TestBed } from '@angular/core/testing';
import { AcademicCitationService } from './academic-citation.service';

describe('AcademicCitationService', () => {
  let service: AcademicCitationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AcademicCitationService]
    });
    service = TestBed.inject(AcademicCitationService);
  });

  it('should initialize and provide authority citation catalog', () => {
    expect(service).toBeTruthy();
    expect(service.citationCatalog.length).toBeGreaterThanOrEqual(6);
  });

  it('should generate valid AMA format citation', () => {
    const entry = service.citationCatalog.find(c => c.id === 'cite-cgm-pediatric')!;
    const ama = service.generateAMA(entry);

    expect(ama).toContain('Beck RW');
    expect(ama).toContain('JAMA');
    expect(ama).toContain('2017');
    expect(ama).toContain('PMID: 28118453');
  });

  it('should generate valid BibTeX entry', () => {
    const entry = service.citationCatalog.find(c => c.id === 'cite-sibi-cardiovascular')!;
    const bib = service.generateBibTeX(entry);

    expect(bib).toContain('@article{cite_sibi_cardiovascular');
    expect(bib).toContain('title = {Periodontal Disease and Systemic Inflammation');
    expect(bib).toContain('journal = {Circulation}');
  });

  it('should generate valid RIS entry for reference managers', () => {
    const entry = service.citationCatalog.find(c => c.id === 'cite-fda-520o-cds')!;
    const ris = service.generateRIS(entry);

    expect(ris).toContain('TY  - JOUR');
    expect(ris).toContain('TI  - Clinical Decision Support Software');
    expect(ris).toContain('ER  -');
  });

  it('should export complete citation dossier by topic or component', () => {
    const dossier = service.exportCitationDossier('Section504FolioComponent');

    expect(dossier.totalCitations).toBeGreaterThanOrEqual(1);
    expect(dossier.entries[0].topic).toContain('Type 1 Diabetes');
    expect(dossier.amaBibliography.length).toBeGreaterThanOrEqual(1);
    expect(dossier.bibTexBundle).toContain('@article');
    expect(dossier.risBundle).toContain('TY  - JOUR');
  });
});
