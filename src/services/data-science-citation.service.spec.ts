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
});
