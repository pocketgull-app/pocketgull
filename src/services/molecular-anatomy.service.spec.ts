import { TestBed } from '@angular/core/testing';
import { MolecularAnatomyService } from './molecular-anatomy.service';

describe('MolecularAnatomyService Unit Suite', () => {
  let service: MolecularAnatomyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MolecularAnatomyService]
    });
    service = TestBed.inject(MolecularAnatomyService);
  });

  it('1. should initialize with default organ (Heart) and gross macro tier', () => {
    expect(service).toBeTruthy();
    expect(service.selectedOrganId()).toBe('heart');
    expect(service.currentZoomLevel()).toBe('macro_organ');
    expect(service.activeOrgan().organName).toContain('Heart');
    expect(service.activeLayer().spatialScale).toContain('cm');
  });

  it('2. should provide 10-country international nomenclature translations', () => {
    const heart = service.activeOrgan();
    expect(heart.translations.length).toBeGreaterThanOrEqual(9);

    const arabic = heart.translations.find(t => t.language === 'Arabic');
    expect(arabic?.nativeName).toBe('عضلة القلب');
    expect(arabic?.direction).toBe('rtl');

    const hebrew = heart.translations.find(t => t.language === 'Hebrew');
    expect(hebrew?.nativeName).toBe('שריר הלב');

    const cyrillic = heart.translations.find(t => t.language === 'Ukrainian');
    expect(cyrillic?.nativeName).toBe('Серце (Міокард)');
  });

  it('3. should step through continuous 4-tier spatial zoom to atomic level', () => {
    // Tier 1: Macro
    expect(service.currentZoomLevel()).toBe('macro_organ');
    expect(service.activeLayer().zoomFactor).toBe('1×');

    // Tier 2: Histological Tissue
    service.nextZoomTier();
    expect(service.currentZoomLevel()).toBe('tissue_histology');
    expect(service.activeLayer().zoomFactor).toBe('100×');
    expect(service.activeLayer().keyMolecules.some(m => m.name === 'Connexin-43')).toBe(true);

    // Tier 3: Cellular Organelle
    service.nextZoomTier();
    expect(service.currentZoomLevel()).toBe('cellular_organelle');
    expect(service.activeLayer().zoomFactor).toBe('10,000×');
    expect(service.activeLayer().keyMolecules.some(m => m.symbol === 'RyR2')).toBe(true);

    // Tier 4: Molecular & Atomic
    service.nextZoomTier();
    expect(service.currentZoomLevel()).toBe('molecular_atomic');
    expect(service.activeLayer().zoomFactor).toBe('1,000,000×');
    expect(service.activeLayer().spatialScale).toContain('nm');
    expect(service.activeLayer().keyMolecules.some(m => m.pdbId === '1J1D')).toBe(true);
  });

  it('4. should switch active organ to Cerebrum and access synaptic molecular tier', () => {
    service.setOrgan('cerebrum');
    expect(service.selectedOrganId()).toBe('cerebrum');
    expect(service.activeOrgan().organName).toContain('Cerebrum');
    expect(service.activeOrgan().snomedCode).toBe('83678007');

    service.setZoomLevel('molecular_atomic');
    expect(service.activeLayer().title).toContain('NMDA');
    expect(service.activeLayer().keyMolecules.some(m => m.name.includes('GluN1'))).toBe(true);
  });
});
