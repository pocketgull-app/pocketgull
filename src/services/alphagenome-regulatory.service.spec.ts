import { AlphaGenomeRegulatoryService } from './alphagenome-regulatory.service';

describe('AlphaGenomeRegulatoryService', () => {
  let service: AlphaGenomeRegulatoryService;

  beforeEach(() => {
    service = new AlphaGenomeRegulatoryService();
  });

  it('should initialize with default regulatory variants and polygenic risk profiles', () => {
    expect(service.allVariants().length).toBeGreaterThan(0);
    expect(service.polygenicProfiles().length).toBe(4);
    expect(service.selectedVariant()).not.toBeNull();
  });

  it('should select variant and compute top disrupted transcription factors', () => {
    const cad = service.allVariants()[0]!;
    service.selectVariant(cad);

    const disrupted = service.topDisruptedTfs();
    expect(disrupted.length).toBeGreaterThan(0);
    expect(disrupted.some(tf => tf.tfName === 'STAT1')).toBe(true);
  });

  it('should find regulatory variant by rsID', () => {
    const apoePromoter = service.findByRsId('rs405509');
    expect(apoePromoter).toBeDefined();
    expect(apoePromoter?.targetGene).toBe('APOE');
    expect(apoePromoter?.elementCategory).toBe('Core Promoter');

    const missing = service.findByRsId('rs00000000');
    expect(missing).toBeNull();
  });

  it('should identify high-risk PRS traits', () => {
    const highRisk = service.highRiskPrsTraits();
    expect(highRisk.length).toBeGreaterThan(0);
    expect(highRisk.some(t => t.traitName.includes('Coronary Artery Disease'))).toBe(true);
  });

  it('should export a standard FHIR R4 AlphaGenome Bundle', () => {
    const bundle = service.exportFhirR4AlphaGenomeBundle('patient-alpha-1');
    expect(bundle['resourceType']).toBe('Bundle');
    expect(bundle['type']).toBe('collection');
    expect(bundle['entry'].length).toBe(1);

    const obs = bundle['entry'][0]['resource'];
    expect(obs['resourceType']).toBe('Observation');
    expect(obs['component'].length).toBe(3);
    expect(obs['subject']['reference']).toBe('Patient/patient-alpha-1');
  });
});
