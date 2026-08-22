import '@angular/compiler';
import { CdiscRweCardComponent } from './cdisc-rwe-card.component';
import { CdiscRweDossierService } from '../../services/cdisc-rwe-dossier.service';
import { signal } from '@angular/core';

describe('CdiscRweCardComponent Suite', () => {
  let component: CdiscRweCardComponent;

  beforeEach(() => {
    const mockPatientState = {
      vitals: signal({
        bp: '120/80',
        hr: '70',
        temp: '98.6',
        spO2: '98',
        weight: '70',
        height: '175'
      }),
      issues: signal({})
    } as any;

    const mockCdiscService = new CdiscRweDossierService(mockPatientState);
    component = new CdiscRweCardComponent(mockCdiscService);
  });

  it('1. Initializes with active IRB Protocol Dossier', () => {
    expect(component.dossier()).toBeDefined();
    expect(component.dossier().protocolNumber).toContain('IRB-2026-');
    expect(component.dossier().sdtmDatasetPackage.dm.length).toBe(1);
    expect(component.dossier().sdtmDatasetPackage.vs.length).toBeGreaterThanOrEqual(1);
  });

  it('2. Embeds FDA 21 CFR Part 11 Electronic Signature Seal', () => {
    const seal = component.dossier().sdtmDatasetPackage.fdaCfr21Part11Seal;
    expect(seal).toMatch(/^FDA-21CFR11-[0-9A-F]{8}$/);
  });
});
