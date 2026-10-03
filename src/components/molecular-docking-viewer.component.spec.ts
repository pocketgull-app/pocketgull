import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MolecularDockingViewerComponent } from './molecular-docking-viewer.component';
import { MolecularDockingService } from '../services/molecular-docking.service';

describe('MolecularDockingViewerComponent', () => {
  let component: MolecularDockingViewerComponent;
  let fixture: ComponentFixture<MolecularDockingViewerComponent>;
  let dockingService: MolecularDockingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MolecularDockingViewerComponent],
      providers: [MolecularDockingService]
    }).compileComponents();

    fixture = TestBed.createComponent(MolecularDockingViewerComponent);
    component = fixture.componentInstance;
    dockingService = TestBed.inject(MolecularDockingService);

    // Mock Three.js canvas initialization to avoid WebGL context failure in headless test environment
    vi.spyOn(component as any, 'initThree').mockImplementation(() => {});
    vi.spyOn(component as any, 'buildProteinRibbon').mockImplementation(() => {});
    vi.spyOn(component as any, 'buildLigandMolecule').mockImplementation(() => {});
    vi.spyOn(component as any, 'animate').mockImplementation(() => {});

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('1. Initializes with MolecularDockingService and default protein target and ligand', () => {
    expect(component).toBeTruthy();
    expect(dockingService.proteinTargets.length).toBeGreaterThanOrEqual(4);
    expect(dockingService.ligandMolecules.length).toBeGreaterThanOrEqual(4);
    expect(dockingService.selectedTarget().pdbId).toBe('7PZC');
    expect(dockingService.selectedLigand().id).toBe('akba');
  });

  it('2. Switches protein targets and updates AlphaFold confidence and PDB ID', () => {
    const collagen = dockingService.proteinTargets.find(t => t.id === 'collagen2')!;
    dockingService.setTarget(collagen);
    fixture.detectChanges();

    expect(dockingService.selectedTarget().id).toBe('collagen2');
    expect(dockingService.selectedTarget().name).toContain('Collagen Type-II');
    expect(dockingService.selectedTarget().alphaFoldConfidenceScore).toBeGreaterThan(0);
  });

  it('3. Switches therapeutic ligands and updates mechanism of action', () => {
    const ha = dockingService.ligandMolecules.find(l => l.id === 'hyaluronic_acid')!;
    dockingService.setLigand(ha);
    fixture.detectChanges();

    expect(dockingService.selectedLigand().id).toBe('hyaluronic_acid');
    expect(dockingService.selectedLigand().mechanismOfAction).toContain('CD44');
  });

  it('4. Executes runDockingSimulation and evaluates thermodynamic binding affinity', () => {
    dockingService.runDockingSimulation();
    const result = dockingService.dockingResult();

    expect(result).toBeTruthy();
    expect(result.deltaGKcalPerMol).toBeLessThan(0); // Exergonic binding
    expect(result.inhibitionConstantKiMicroMolar).toBeGreaterThan(0);
    expect(['Docked', 'Simulating']).toContain(result.status);
  });

  it('5. Cleans up animation frame and renderer resources safely on ngOnDestroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
