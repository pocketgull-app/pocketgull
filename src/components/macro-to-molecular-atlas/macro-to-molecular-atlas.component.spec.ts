import { TestBed } from '@angular/core/testing';
import { MacroToMolecularAtlasComponent } from './macro-to-molecular-atlas.component';
import { MolecularAnatomyService } from '../../services/molecular-anatomy.service';
import { ClinicalProvenanceService } from '../../services/clinical-provenance.service';

describe('MacroToMolecularAtlasComponent Unit Suite', () => {
  let component: MacroToMolecularAtlasComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MacroToMolecularAtlasComponent],
      providers: [MolecularAnatomyService, ClinicalProvenanceService]
    }).compileComponents();

    const fixture = TestBed.createComponent(MacroToMolecularAtlasComponent);
    component = fixture.componentInstance;
  });

  it('1. should create the component and default to zoom mode', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('zoom');
    expect(component.activeOrgan().organName).toContain('Heart');
  });

  it('2. should switch tabs to crosswalk and optical_stress', () => {
    component.activeTab.set('crosswalk');
    expect(component.activeTab()).toBe('crosswalk');

    component.activeTab.set('optical_stress');
    expect(component.activeTab()).toBe('optical_stress');
  });

  it('3. should generate pseudorandom optotype permutations across multiple scripts', () => {
    const results = component.randomTestResults();
    expect(results.length).toBeGreaterThanOrEqual(8);

    const latin = results.find(r => r.scriptName.includes('Latin'));
    expect(latin).toBeTruthy();
    expect(latin?.characters.length).toBe(8);

    const cyrillic = results.find(r => r.scriptName.includes('Cyrillic'));
    expect(cyrillic).toBeTruthy();
    expect(cyrillic?.characters.length).toBe(8);

    const arabic = results.find(r => r.scriptName.includes('Arabic'));
    expect(arabic).toBeTruthy();
    expect(arabic?.characters.length).toBe(8);
  });

  it('4. should attest molecular layer with FDA 21 CFR Part 11 cryptographic seal', async () => {
    expect(component.currentReceipt()).toBeNull();
    await component.generateProvenanceSeal();
    const receipt = component.currentReceipt();
    expect(receipt).not.toBeNull();
    expect(receipt?.receiptId).toContain('RX-SEAL-');
    expect(receipt?.sha256Seal).toMatch(/^[a-f0-9]{64}$/);
  });
});
