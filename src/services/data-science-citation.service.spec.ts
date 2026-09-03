import { DataScienceCitationService } from './data-science-citation.service';

describe('DataScienceCitationService', () => {
  const service = new DataScienceCitationService();

  it('1. Provides evidence library with grounded DOIs, PMIDs, and Level of Evidence (LoE) grades', () => {
    const library = service.evidenceLibrary;
    expect(library.length).toBeGreaterThanOrEqual(3);

    const balban = library.find(c => c.id === 'cit_vagal_rsa_2023');
    expect(balban).toBeDefined();
    expect(balban?.evidenceLevel).toBe('Level II (Randomized Controlled Trial)');
    expect(balban?.doiUrl).toContain('https://doi.org/10.1016');
    expect(balban?.pubMedUrl).toContain('https://pubmed.ncbi.nlm.nih.gov/36630953/');
  });

  it('2. Creates data science provenance audit records with 95% confidence intervals and data quality scores', () => {
    const prov = service.createDataScienceProvenance(
      'Vagal Resonant Frequency',
      'f_res = 0.1 Hz',
      { heartRate: 72, temperature: 98.6 },
      0.1,
      [0.08, 0.12],
      'cit_vagal_rsa_2023'
    );

    expect(prov.metricName).toBe('Vagal Resonant Frequency');
    expect(prov.dataQualityScorePercent).toBe(100);
    expect(prov.confidenceInterval95).toEqual([0.08, 0.12]);
    expect(prov.primaryCitation.pmid).toBe('36630953');
  });

  it('3. Formats citations cleanly across APA, IEEE, and Vancouver academic styles', () => {
    const citation = service.evidenceLibrary[0];
    const apa = service.formatCitation(citation, 'APA');
    const ieee = service.formatCitation(citation, 'IEEE');
    const vancouver = service.formatCitation(citation, 'Vancouver');

    expect(apa).toContain('Cell Reports Medicine');
    expect(ieee).toContain('Cell Rep. Med.');
    expect(vancouver).toContain('Cell Rep Med.');
  });

  it('4. Retrieves optical PBM, circadian ipRGC, and vestibular OKN citations with verified PMIDs', () => {
    const pbmCitations = service.getCitationsByCategory('optical_pbm');
    expect(pbmCitations.length).toBeGreaterThanOrEqual(3);
    expect(pbmCitations.some(c => c.pmid === '32559297')).toBe(true); // Shinhmar 2020
    expect(pbmCitations.some(c => c.pmid === '34819619')).toBe(true); // Shinhmar 2021
    expect(pbmCitations.some(c => c.pmid === '20618698')).toBe(true); // Karu 2010

    const iprgcCitations = service.getCitationsByCategory('circadian_iprgc');
    expect(iprgcCitations.length).toBeGreaterThanOrEqual(2);
    expect(iprgcCitations.some(c => c.pmid === '35298459')).toBe(true); // Brown 2022
    expect(iprgcCitations.some(c => c.pmid === '11834834')).toBe(true); // Berson 2002

    const oknCitations = service.getCitationsByCategory('vestibular_okn');
    expect(oknCitations.length).toBeGreaterThanOrEqual(2);
    expect(oknCitations.some(c => c.pmid === '23830848')).toBe(true); // Pavlou 2013
    expect(oknCitations.some(c => c.pmid === '14757997')).toBe(true); // Herdman 2003
  });

  it('5. Retrieves biophilic vagal and contactless rPPG citations with clinical takeaways', () => {
    const vagalCitations = service.getCitationsByCategory('biophilic_vagal');
    expect(vagalCitations.length).toBeGreaterThanOrEqual(3);
    expect(vagalCitations.some(c => c.pmid === '18358103')).toBe(true); // Li 2008 (Shinrin-yoku)
    expect(vagalCitations.some(c => c.pmid === '28265249')).toBe(true); // Laborde 2017 (HRV RMSSD)

    const rppgCitations = service.getCitationsByCategory('contactless_rppg');
    expect(rppgCitations.length).toBeGreaterThanOrEqual(2);
    expect(rppgCitations.some(c => c.pmid === '19098907')).toBe(true); // Verkruysse 2008
    expect(rppgCitations.some(c => c.pmid === '27654261')).toBe(true); // Wang 2017
  });

  it('6. Finds exact citation by PubMed ID', () => {
    const shinhmar = service.getCitationByPmid('32559297');
    expect(shinhmar).toBeDefined();
    expect(shinhmar?.title).toContain('Optically improved mitochondrial function');
    expect(shinhmar?.journal).toBe('The Journals of Gerontology: Series A');
    expect(shinhmar?.clinicalTakeaway).toContain('670 nm red light');
  });

  it('7. Grounds Cabrera Lab DSRP Systems Thinking and StarTalk Cosmic Perspective', () => {
    const dsrpCites = service.getCitationsByCategory('systems_thinking_dsrp');
    expect(dsrpCites.length).toBeGreaterThanOrEqual(1);
    const cabrera = dsrpCites[0];
    expect(cabrera.authors).toContain('Cabrera, D.');
    expect(cabrera.title).toContain('Systems thinking');
    expect(cabrera.clinicalTakeaway).toContain('Universal DSRP meta-cognitive rules');
    expect(cabrera.pmid).toBe('18272224');
    expect(cabrera.doiUrl).toContain('10.1016/j.evalprogplan');

    const cosmicCites = service.getCitationsByCategory('cosmic_perspective_startalk');
    expect(cosmicCites.length).toBeGreaterThanOrEqual(1);
    const startalk = cosmicCites[0];
    expect(startalk.authors).toContain('Tyson, N. d.');
    expect(startalk.title).toContain('Cosmic Queries: StarTalk');
    expect(startalk.clinicalTakeaway).toContain('The Cosmic Perspective');
  });
});
