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

  it('2. should switch tabs to crosswalk, population_focus, and optical_stress', () => {
    component.activeTab.set('crosswalk');
    expect(component.activeTab()).toBe('crosswalk');

    component.activeTab.set('population_focus');
    expect(component.activeTab()).toBe('population_focus');

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

  it('5. should rank languages strictly by global population on the focus wheel', () => {
    expect(component.populationLanguages.length).toBe(12);

    // Rank 1: Mandarin Chinese (1.12B)
    expect(component.populationLanguages[0].language).toBe('Mandarin Chinese');
    expect(component.populationLanguages[0].populationCount).toBeGreaterThan(1000000000);

    // Rank 2: Spanish (590M)
    expect(component.populationLanguages[1].language).toBe('Spanish');

    // Rank 3: English (400M / 1.5B)
    expect(component.populationLanguages[2].language).toBe('English');

    // Rank 12: Braille (40M)
    expect(component.populationLanguages[11].language).toContain('Braille');

    // Step focus
    expect(component.populationFocusIndex()).toBe(0);
    component.stepPopulationFocus(1);
    expect(component.populationFocusIndex()).toBe(1);
    expect(component.activePopulationFocus().language).toBe('Spanish');

    component.stepPopulationFocus(-1);
    expect(component.populationFocusIndex()).toBe(0);
  });

  it('6. should respond to mousewheel events for spatial zoom and population stepping', () => {
    // Spatial wheel
    const fakePreventDefault = () => {};
    const zoomBefore = component.molecularService.currentZoomLevel();
    expect(zoomBefore).toBe('macro_organ');

    component.onSpatialWheel({ deltaY: 50, preventDefault: fakePreventDefault } as unknown as WheelEvent);
    expect(component.molecularService.currentZoomLevel()).toBe('tissue_histology');

    component.onSpatialWheel({ deltaY: -50, preventDefault: fakePreventDefault } as unknown as WheelEvent);
    expect(component.molecularService.currentZoomLevel()).toBe('macro_organ');

    // Population wheel
    expect(component.populationFocusIndex()).toBe(0);
    component.onPopulationWheel({ deltaY: 30, preventDefault: fakePreventDefault } as unknown as WheelEvent);
    expect(component.populationFocusIndex()).toBe(1);

    component.onPopulationWheel({ deltaY: -30, preventDefault: fakePreventDefault } as unknown as WheelEvent);
    expect(component.populationFocusIndex()).toBe(0);
  });

  it('7. should handle multi-touch pinch gestures for mobile & tablet exam displays', () => {
    // Start two-finger pinch with 50px distance
    const touchStartEvent = {
      touches: [
        { clientX: 100, clientY: 100 },
        { clientX: 150, clientY: 100 }
      ]
    } as unknown as TouchEvent;
    component.onTouchStart(touchStartEvent);

    // Move to 120px distance (spread fingers by 70px) -> Zoom In
    const touchMoveEvent = {
      touches: [
        { clientX: 80, clientY: 100 },
        { clientX: 200, clientY: 100 }
      ]
    } as unknown as TouchEvent;
    component.onSpatialTouchMove(touchMoveEvent);
    expect(component.molecularService.currentZoomLevel()).toBe('tissue_histology');

    // Touch end
    component.onTouchEnd();

    // Start pinch for population wheel
    component.onTouchStart(touchStartEvent);
    component.onPopulationTouchMove(touchMoveEvent);
    expect(component.populationFocusIndex()).toBe(1);
    component.onTouchEnd();
  });
});
