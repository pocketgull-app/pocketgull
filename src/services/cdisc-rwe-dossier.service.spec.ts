import '@angular/compiler';
import { CdiscRweDossierService } from './cdisc-rwe-dossier.service';
import { signal } from '@angular/core';

describe('CdiscRweDossierService Suite', () => {
  let service: CdiscRweDossierService;

  beforeEach(() => {
    const mockPatientState = {
      vitals: signal({
        bp: '128/82',
        hr: '74',
        temp: '98.6',
        spO2: '99',
        weight: '70',
        height: '175'
      }),
      issues: signal({})
    } as any;

    service = new CdiscRweDossierService(mockPatientState);
  });

  it('1. Generates valid CDISC SDTM v2.0 dataset package with DM, VS, and CM domains', () => {
    const sdtm = service.generateSdtmPackage();
    expect(sdtm.studyId).toBe('POCKETGULL-RWE-2026-001');
    expect(sdtm.dm.length).toBe(1);
    expect(sdtm.dm[0].DOMAIN).toBe('DM');
    expect(sdtm.dm[0].SEX).toBe('F');
    expect(sdtm.dm[0].AGE).toBe(45);

    expect(sdtm.vs.length).toBe(4);
    const tests = sdtm.vs.map(v => v.VSTESTCD);
    expect(tests).toContain('SYSBP');
    expect(tests).toContain('DIABP');
    expect(tests).toContain('PULSE');
    expect(tests).toContain('OXYO2');

    expect(sdtm.cm.length).toBe(2);
    expect(sdtm.cm[0].CMTRT).toBe('Lisinopril');
  });

  it('2. Embeds deterministic FDA 21 CFR Part 11 Electronic Signature Seal', () => {
    const sdtm = service.generateSdtmPackage();
    expect(sdtm.fdaCfr21Part11Seal).toMatch(/^FDA-21CFR11-[0-9A-F]{8}$/);
  });

  it('3. Generates complete IRB Protocol Dossier with aims, inclusion/exclusion, and DSMP', () => {
    const dossier = service.generateIrbDossier();
    expect(dossier.protocolNumber).toContain('IRB-2026-');
    expect(dossier.sponsorEntity).toContain('PocketGull LLC');
    expect(dossier.specificAims.length).toBe(3);
    expect(dossier.inclusionCriteria.length).toBeGreaterThan(1);
    expect(dossier.exclusionCriteria.length).toBeGreaterThan(1);
  });

  it('4. Formats IRB dossier into clean Markdown for grant and regulatory submission', () => {
    const dossier = service.generateIrbDossier();
    const md = service.formatIrbDossierMarkdown(dossier);
    expect(md).toContain('# Institutional Review Board (IRB) Protocol Submission Dossier');
    expect(md).toContain('FDA 21 CFR Part 11');
    expect(md).toContain('CDISC SDTM v2.0 Dataset Serialization');
  });
});
