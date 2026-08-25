import { AcademicLabRecruitmentService } from './academic-lab-recruitment.service';

describe('AcademicLabRecruitmentService', () => {
  const service = new AcademicLabRecruitmentService();

  it('1. Retrieves curated US research labs with PIs, locations, and recruitment status', () => {
    const labs = service.curatedAcademicLabs;
    expect(labs.length).toBeGreaterThanOrEqual(5);

    const sfiLab = labs.find(l => l.labId === 'lab_sfi_complex');
    expect(sfiLab).toBeDefined();
    expect(sfiLab?.principalInvestigator).toContain('Geoffrey West');
    expect(sfiLab?.location).toContain('Santa Fe, New Mexico');
    expect(sfiLab?.featuredCitations[0].pmid).toBeDefined();
  });

  it('2. Filters research labs by Pocket-Gull domain match', () => {
    service.selectedDomain.set('Quantum Biology');
    const filtered = service.filteredLabs();
    expect(filtered.length).toBe(1);
    expect(filtered[0].labName).toContain('Center for Consciousness Studies');
  });

  it('3. Generates grounded PubMed and Google Scholar query URLs', () => {
    const pubMedUrl = service.generatePubMedQueryUrl('Orch-OR Microtubule');
    expect(pubMedUrl).toContain('https://pubmed.ncbi.nlm.nih.gov/?term=');
    expect(pubMedUrl).toContain('Orch-OR');

    const scholarUrl = service.generateScholarQueryUrl('Allometric Scaling');
    expect(scholarUrl).toContain('https://scholar.google.com/scholar?q=');
  });
});
