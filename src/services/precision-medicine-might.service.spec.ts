import '@angular/compiler';
import { MattMightPrecisionEngineService } from './precision-medicine-might.service';

describe('MattMightPrecisionEngineService (Dr. Matt Might Algorithm for Precision Medicine)', () => {
  let service: MattMightPrecisionEngineService;

  beforeEach(() => {
    service = new MattMightPrecisionEngineService();
  });

  it('should initialize with landmark precision cases', () => {
    expect(service.landmarkCases.length).toBeGreaterThanOrEqual(3);
    const ngly1Case = service.landmarkCases.find(c => c.primaryGene === 'NGLY1');
    expect(ngly1Case).toBeDefined();
    expect(ngly1Case?.patientName).toContain('Bertrand Might');
    expect(ngly1Case?.variant.omimId).toBe('OMIM #615273');
  });

  it('should select case and update activeCase signal', () => {
    service.selectCase('adcy5_dyskinesia_caffeine');
    expect(service.activeCase().primaryGene).toBe('ADCY5');
    expect(service.activeCase().repurposingCandidates[0].compoundName).toContain('Caffeine');

    service.selectCase('slc6a1_epilepsy_4pba');
    expect(service.activeCase().primaryGene).toBe('SLC6A1');
    expect(service.activeCase().repurposingCandidates[0].compoundName).toContain('Sodium Phenylbutyrate');
  });

  it('should perform custom variant precision reasoning for matched genes', () => {
    const res = service.runCustomVariantPrecisionReasoning('NGLY1', 'c.1201A>T');
    expect(res.id).toBe('ngly1_deficiency_bertrand');
    expect(res.repurposingCandidates[0].compoundName).toContain('N-Acetyl-D-Glucosamine');
  });

  it('should dynamically construct N-of-1 trial protocol for novel variants', () => {
    const res = service.runCustomVariantPrecisionReasoning('CACNA1A', 'c.3400C>T');
    expect(res.primaryGene).toBe('CACNA1A');
    expect(res.trialProtocol.design).toBe('ABAB Single-Subject Crossover');
    expect(res.trialProtocol.primaryEndpoints.length).toBeGreaterThan(0);
  });

  it('should export valid FHIR R4 Bundle for N-of-1 clinical protocol', () => {
    const ngly1 = service.landmarkCases[0];
    const bundle = service.exportFhirR4TrialBundle(ngly1);
    
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
    expect(bundle.entry.length).toBeGreaterThanOrEqual(3);

    const researchStudy = bundle.entry.find((e: any) => e.resource.resourceType === 'ResearchStudy');
    expect(researchStudy).toBeDefined();
    expect(researchStudy.resource.title).toContain('N-of-1');

    const medStatement = bundle.entry.find((e: any) => e.resource.resourceType === 'MedicationStatement');
    expect(medStatement).toBeDefined();
    expect(medStatement.resource.medicationCodeableConcept.text).toContain('N-Acetylglucosamine');
  });

  it('should retrieve Harvard UDN benchmark cases with MOSC Model Organism assays', () => {
    const udnCases = service.getUdnBenchmarkCases();
    expect(udnCases.length).toBeGreaterThanOrEqual(3);

    const axin2 = udnCases.find(c => c.primaryGene === 'AXIN2');
    expect(axin2).toBeDefined();
    expect(axin2?.modelOrganismScreening.species).toBe('Danio rerio');
    expect(axin2?.modelOrganismScreening.phenotypicRescueObserved).toBe(true);

    const rnu4atac = udnCases.find(c => c.primaryGene === 'RNU4ATAC');
    expect(rnu4atac).toBeDefined();
    expect(rnu4atac?.modelOrganismScreening.species).toBe('Caenorhabditis elegans');

    const etfdh = udnCases.find(c => c.primaryGene === 'ETFDH');
    expect(etfdh).toBeDefined();
    expect(etfdh?.modelOrganismScreening.species).toBe('Drosophila melanogaster');
  });

  it('should evaluate dynamic UDN diagnostic candidate and export Harvard UDN Gateway Bundle', () => {
    const candidate = service.evaluateUdnDiagnosticOdyssey('MED13L', ['HP:0001250', 'HP:0001263']);
    expect(candidate.udnId).toContain('MED13L');
    expect(candidate.modelOrganismScreening.organismCommonName).toBe('Fruit Fly');

    const study = service.runCustomVariantPrecisionReasoning('MED13L', 'c.245A>G');
    const udnBundle = service.exportUdnGatewaySubmissionBundle(study, candidate);

    expect(udnBundle.resourceType).toBe('Bundle');
    expect(udnBundle.type).toBe('document');
    expect(udnBundle.entry.length).toBeGreaterThanOrEqual(3);

    const diagReport = udnBundle.entry.find((e: any) => e.resource.resourceType === 'DiagnosticReport');
    expect(diagReport).toBeDefined();
    expect(diagReport.resource.conclusion).toContain('Harvard UDN Gateway');

    const serviceReq = udnBundle.entry.find((e: any) => e.resource.resourceType === 'ServiceRequest');
    expect(serviceReq).toBeDefined();
    expect(serviceReq.resource.code.text).toContain('Model Organism Screening Center');
  });
});
