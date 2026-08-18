import { TestBed } from '@angular/core/testing';
import { signal, PLATFORM_ID } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ResearchFrameComponent, IArxivSearchResult, IEuropePmcSearchResult, IPubMedSearchResult } from './research-frame.component';
import { PatientManagementService } from '../services/patient-management.service';
import { PatientStateService } from '../services/patient-state.service';

describe('ResearchFrameComponent (Open Science & ArXivLabs Literature Suite)', () => {
  let comp: ResearchFrameComponent;
  let mockPatientManager: any;
  let mockPatientState: any;

  beforeEach(() => {
    mockPatientManager = {
      selectedPatientId: signal('pat_123'),
      patients: signal([
        {
          id: 'pat_123',
          name: 'Homo Sapiens (Female, 34y)',
          bookmarks: []
        }
      ]),
      addBookmark: vi.fn(),
      updateBookmark: vi.fn(),
      removeBookmark: vi.fn()
    };

    mockPatientState = {
      vitals: signal({ hr: '76', bp: '120/80', cgmGlucoseMgDl: '95' }),
      issues: signal({ 'Hypertension': true }),
      selectedPartId: signal('heart'),
      selectedPartName: signal('Heart'),
      patientGoals: signal('AlphaGenome variant effect'),
      isResearchFrameVisible: signal(true),
      toggleResearchFrame: vi.fn(),
      requestedResearchQuery: signal<string | null>(null),
      requestedSearchEngine: signal<string | null>(null),
      clinicalNotes: signal<any[]>([]),
      activePhilosophy: signal<'western' | 'eastern' | 'ayurvedic'>('western')
    };

    const mockSanitizer = {
      bypassSecurityTrustResourceUrl: vi.fn((url: string) => url)
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
      text: async () => ''
    } as any);

    TestBed.configureTestingModule({
      imports: [ResearchFrameComponent],
      providers: [
        { provide: PatientManagementService, useValue: mockPatientManager },
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    const fixture = TestBed.createComponent(ResearchFrameComponent);
    comp = fixture.componentInstance;
  });

  it('1. Initializes cleanly with smart context chips and default engine', () => {
    expect(comp).toBeTruthy();
    expect(comp.searchEngine()).toBe('pubmed');
    expect(comp.smartContextChips().length).toBeGreaterThan(0);
  });

  it('2. Queries arXiv & ArXivLabs preprints and updates results signal', async () => {
    const mockArxivData = {
      totalResults: 1,
      results: [
        {
          id: '2403.12345',
          rawId: 'http://arxiv.org/abs/2403.12345v1',
          title: 'Deep Learning for Non-Coding Variant Pathogenicity',
          summary: 'AlphaGenome foundation models predict chromatin accessibility.',
          authors: 'Smith, E. et al.',
          published: '2026-03-10T12:00:00Z',
          updated: '2026-03-10T12:00:00Z',
          primaryCategory: 'q-bio.GN',
          pdfUrl: 'https://arxiv.org/pdf/2403.12345.pdf',
          absUrl: 'https://arxiv.org/abs/2403.12345',
          arxivLabs: {
            nasaAds: 'https://ui.adsabs.harvard.edu/abs/arXiv:2403.12345',
            googleScholar: 'https://scholar.google.com/scholar_lookup?arxiv_id=2403.12345',
            semanticScholar: 'https://www.semanticscholar.org/paper/arXiv:2403.12345',
            ar5ivHtml: 'https://ar5iv.labs.arxiv.org/html/2403.12345',
            connectedPapers: 'https://www.connectedpapers.com/main/2403.12345/arxiv',
            papersWithCode: 'https://paperswithcode.com/paper/2403.12345',
            huggingFace: 'https://huggingface.co/papers/2403.12345',
            scite: 'https://scite.ai/reports/arxiv:2403.12345'
          }
        }
      ]
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockArxivData
    } as any);

    comp.setSearchEngine('arxiv');
    await comp.searchArxiv('AlphaGenome');

    expect(comp.arxivResults()?.length).toBe(1);
    expect(comp.arxivResults()![0].id).toBe('2403.12345');
    expect(comp.arxivResults()![0].arxivLabs.connectedPapers).toContain('connectedpapers.com');
  });

  it('3. Adds arXiv preprint bookmark and saves to clinical notes', () => {
    const paper: IArxivSearchResult = {
      id: '2403.12345',
      rawId: 'http://arxiv.org/abs/2403.12345v1',
      title: 'Deep Learning for Non-Coding Variant Pathogenicity',
      summary: 'Abstract text',
      authors: 'Smith et al.',
      published: '2026-03-10',
      updated: '2026-03-10',
      primaryCategory: 'q-bio.GN',
      pdfUrl: 'https://arxiv.org/pdf/2403.12345.pdf',
      absUrl: 'https://arxiv.org/abs/2403.12345',
      arxivLabs: {
        nasaAds: 'https://ui.adsabs.harvard.edu/abs/arXiv:2403.12345',
        googleScholar: 'https://scholar.google.com/scholar_lookup?arxiv_id=2403.12345',
        semanticScholar: 'https://www.semanticscholar.org/paper/arXiv:2403.12345',
        ar5ivHtml: 'https://ar5iv.labs.arxiv.org/html/2403.12345',
        connectedPapers: 'https://www.connectedpapers.com/main/2403.12345/arxiv',
        papersWithCode: 'https://paperswithcode.com/paper/2403.12345',
        huggingFace: 'https://huggingface.co/papers/2403.12345',
        scite: 'https://scite.ai/reports/arxiv:2403.12345'
      }
    };

    comp.addArxivBookmark(paper);
    expect(mockPatientManager.addBookmark).toHaveBeenCalledWith(expect.objectContaining({
      title: paper.title,
      url: paper.absUrl,
      doi: 'arXiv:2403.12345'
    }));

    comp.saveArxivToNotes(paper);
    expect(mockPatientState.clinicalNotes().length).toBe(1);
    expect(mockPatientState.clinicalNotes()[0].text).toContain('[arXiv Preprint 2403.12345]');
  });

  it('4. Queries Europe PMC open access preprints and studies', async () => {
    const mockEpmcData = {
      hitCount: 1,
      results: [
        {
          id: 'PMC1234567',
          pmcid: 'PMC1234567',
          title: 'Maternal Preeclampsia Biomarkers in 4th Trimester',
          authors: 'Curie, M. et al.',
          journal: 'Lancet Digital Health',
          pubYear: '2026',
          abstractText: 'sFlt-1/PlGF ratio predicts late-onset preeclampsia.',
          isOpenAccess: true,
          isPreprint: false,
          fullTextUrl: 'https://europepmc.org/articles/PMC1234567'
        }
      ]
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockEpmcData
    } as any);

    comp.setSearchEngine('europepmc');
    await comp.searchEuropePmc('Preeclampsia');

    expect(comp.europePmcResults()?.length).toBe(1);
    expect(comp.europePmcResults()![0].isOpenAccess).toBe(true);
  });

  it('5. Copies citation in BibTeX, APA, and RIS formats cleanly', () => {
    const writeTextMock = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });

    comp.searchText.set('Genomic Foundation Models');
    comp.authors.set('Smith, E. & Franklin, R.');
    comp.doi.set('10.1038/s41586-026-0001');

    comp.copyCitation('bibtex');
    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('@article'));

    comp.copyCitation('apa');
    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('Smith, E. & Franklin, R.'));

    comp.copyCitation('ris');
    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('TY  - JOUR'));
  });

  it('6. Generates and copies Schmidt Sciences AI2050 and NIH SBIR grant pitches', () => {
    const writeTextMock = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });

    comp.searchText.set('Decentralized Edge AI');
    comp.selectedGrantAgency.set('schmidt_ai2050');
    expect(comp.generatedGrantPitch()).toContain('Schmidt Sciences AI2050');
    expect(comp.generatedGrantPitch()).toContain('Decentralized Edge AI');

    comp.selectedGrantAgency.set('nih_sbir');
    expect(comp.generatedGrantPitch()).toContain('NIH SBIR Phase I');

    comp.copyGrantProposal();
    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('NIH SBIR Phase I'));
  });
});
