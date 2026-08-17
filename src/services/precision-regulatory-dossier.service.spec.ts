import '@angular/compiler';
import { MatchmakerExchangeService } from './matchmaker-exchange.service';
import { PrecisionRegulatoryDossierService } from './precision-regulatory-dossier.service';
import { MattMightPrecisionEngineService } from './precision-medicine-might.service';

describe('MatchmakerExchangeService & PrecisionRegulatoryDossierService', () => {
  let mmeService: MatchmakerExchangeService;
  let dossierService: PrecisionRegulatoryDossierService;
  let precisionEngine: MattMightPrecisionEngineService;

  beforeEach(() => {
    mmeService = new MatchmakerExchangeService();
    dossierService = new PrecisionRegulatoryDossierService();
    precisionEngine = new MattMightPrecisionEngineService();
  });

  it('should query Matchmaker Exchange federated nodes and return matched rare cases', () => {
    const hits = mmeService.queryMatchmaker('AXIN2');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].nodeName).toBe('Broad CMG');
    expect(hits[0].sharedGene).toBe('AXIN2');
    expect(hits[0].contactEmail).toContain('@broadinstitute.org');

    const ngly1Hits = mmeService.queryMatchmaker('NGLY1');
    expect(ngly1Hits[0].nodeName).toBe('MyGene2');
    expect(ngly1Hits[0].sharedPhenotypes).toContain('Alacrima (HP:0000491)');
  });

  it('should generate NIH U54 Grant Narrative with specific aims and MOSC section', () => {
    const study = precisionEngine.landmarkCases[0]; // NGLY1
    const grant = dossierService.generateNihGrantNarrative(study);

    expect(grant.grantMechanism).toContain('NIH U54');
    expect(grant.projectTitle).toContain('NGLY1');
    expect(grant.specificAims.length).toBe(3);
    expect(grant.modelOrganismSection).toContain('Drosophila melanogaster');
    expect(grant.humanSubjectsProtection).toContain('HIPAA §164.514');
  });

  it('should generate FDA 21 CFR §312.310 Expanded Access IND Dossier with Deciban stopping rules', () => {
    const study = precisionEngine.landmarkCases[1]; // ADCY5
    const ind = dossierService.generateFdaExpandedAccessIndDossier(study);

    expect(ind.cfrRegulation).toContain('21 CFR §312.310');
    expect(ind.indProtocolId).toContain('FDA-IND-EXP-ADCY5');
    expect(ind.stoppingRules.some(r => r.includes('Deciban'))).toBe(true);
    expect(ind.investigatorCommitment).toContain('21 CFR §312.310');
  });
});
