import '@angular/compiler';
import { TribalHealthSovereigntyService, INDIGENOUS_HERBAL_CODEX } from './tribal-health-sovereignty.service';
import { signal } from '@angular/core';

describe('TribalHealthSovereigntyService Suite', () => {
  let service: TribalHealthSovereigntyService;

  beforeEach(() => {
    const mockPatientState = {
      vitals: signal({
        bp: '118/76',
        hr: '68',
        temp: '98.4',
        spO2: '99',
        weight: '68',
        height: '172'
      }),
      issues: signal({})
    } as any;

    service = new TribalHealthSovereigntyService(mockPatientState);
  });

  it('1. Verifies 4 CARE Data Sovereignty Principles (Collective Benefit, Authority to Control, Responsibility, Ethics)', () => {
    const principles = service.carePrinciples();
    expect(principles.length).toBe(4);
    const codes = principles.map(p => p.code);
    expect(codes).toContain('COLLECTIVE_BENEFIT');
    expect(codes).toContain('AUTHORITY_TO_CONTROL');
    expect(codes).toContain('RESPONSIBILITY');
    expect(codes).toContain('ETHICS');
    expect(principles.every(p => p.implementationStatus.length > 0)).toBe(true);
  });

  it('2. Embeds comprehensive Indigenous Herbal Codex with Devil’s Club, Sweetgrass, Cedar, Blueberry, Willow, and Chaga', () => {
    const codex = service.tribalCodex();
    expect(codex.length).toBeGreaterThanOrEqual(6);
    
    const devilsClub = codex.find(b => b.id === 'devils_club');
    expect(devilsClub).toBeDefined();
    expect(devilsClub?.botanicalName).toBe('Oplopanax horridus');
    expect(devilsClub?.primaryTherapeuticActions).toContain('Blood Glucose Regulation');
    expect(devilsClub?.sevenGenerationsStewardshipNote).toContain('<= 25%');

    const sweetgrass = codex.find(b => b.id === 'sweetgrass');
    expect(sweetgrass).toBeDefined();
    expect(sweetgrass?.safetyProfile).toBe('SAFE_MONOTHERAPY');
  });

  it('3. Outlines 6-stage First 1,000 Days Epigenetic Maternal-Infant Wellness Protocol', () => {
    const protocol = service.first1000DaysProtocol();
    expect(protocol.length).toBe(6);
    
    const preconception = protocol.find(p => p.phase === 'PRECONCEPTION');
    expect(preconception?.nutritionalFocus).toContain('Wild Salmon (Omega-3 DHA/EPA)');

    const postpartum = protocol.find(p => p.phase === 'POSTPARTUM_0_6M');
    expect(postpartum?.culturalTradition).toContain('The Sacred 40-Day Rest');
    expect(postpartum?.epigeneticGoal).toContain('oxytocinergic');
  });

  it('4. Generates deterministic Tribal IRB Sovereign Seal and Sovereignty Report', () => {
    const report = service.generateSovereigntyReport();
    expect(report.tribalNationJurisdiction).toContain('Sovereign Health Authority');
    expect(report.tribalIrbSeal).toMatch(/^TRIBAL-SOVEREIGN-SEAL-[0-9A-F]{8}$/);
    expect(report.zeroCloudEgressVerified).toBe(true);
    expect(report.metadataEthicsStandards.length).toBeGreaterThanOrEqual(4);
  });

  it('5. Enforces Post-Custodial Collaborative Metadata & Ethical Linked Data Standards', () => {
    const standards = service.postCustodialStandards();
    expect(standards.length).toBe(4);

    const care = standards.find(s => s.frameworkName.includes('CARE Principles'));
    expect(care).toBeDefined();
    expect(care?.citation).toContain('Carroll');
    expect(care?.doiOrUrl).toContain('doi.org/10.5334/dsj-2020-043');

    const postCustodial = standards.find(s => s.frameworkName.includes('Post-Custodial'));
    expect(postCustodial).toBeDefined();
    expect(postCustodial?.citation).toContain('Ham');

    const linkedData = standards.find(s => s.frameworkName.includes('Ethics in Linked Data'));
    expect(linkedData).toBeDefined();
    expect(linkedData?.citation).toContain('Watson');
  });
});
