import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BioprintingScaffold3dLensComponent } from './bioprinting-scaffold-3d-lens.component';
import { BioGrapheneTelemetryService } from '../../services/hardware/bio-graphene-telemetry.service';

describe('BioprintingScaffold3dLensComponent (University of Oregon Knight Campus)', () => {
  let fixture: ComponentFixture<BioprintingScaffold3dLensComponent>;
  let component: BioprintingScaffold3dLensComponent;
  let grapheneService: BioGrapheneTelemetryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BioprintingScaffold3dLensComponent],
      providers: [BioGrapheneTelemetryService]
    }).compileComponents();

    fixture = TestBed.createComponent(BioprintingScaffold3dLensComponent);
    component = fixture.componentInstance;
    grapheneService = TestBed.inject(BioGrapheneTelemetryService);
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('1. Initializes and renders UO Knight Campus 3D Bioprinting & Scaffold Lens header and baseline VAM telemetry', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('UO Knight Campus 3D Bioprinting & Scaffold Lens');
    expect(el.textContent).toContain('Volumetric Photopolymerization');
    expect(el.textContent).toContain('Alemán Bio-Graphene Resonators');

    const tel = component.telemetry();
    expect(tel.porosityPercent).toBe(85);
    expect(tel.meanPoreSizeUm).toBe(150);
    expect(tel.elasticModulusMpa).toBeGreaterThan(0.5);
    expect(tel.clinicalStatus).toBe('Aligned Tendon Mechanotransduction');
  });

  it('2. Switches to MEW Aligned Tendon regime and verifies directional mechanics and mature focal adhesion signaling', () => {
    component.setRegime('mew_aligned_tendon');
    fixture.detectChanges();

    expect(component.regime()).toBe('mew_aligned_tendon');
    expect(component.porosity()).toBe(72);
    expect(component.poreDiameterUm()).toBe(180);
    expect(grapheneService.currentAdhesionState()).toBe('mature_focal_adhesions');

    const tel = component.telemetry();
    expect(tel.elasticModulusMpa).toBeGreaterThan(1.5);
    expect(tel.clinicalStatus).toBe('Aligned Tendon Mechanotransduction');
  });

  it('3. Switches to Suboptimal Overcure regime and flags hypoxia/diffusion occlusion', () => {
    component.setRegime('suboptimal_overcure');
    fixture.detectChanges();

    expect(component.regime()).toBe('suboptimal_overcure');
    expect(component.porosity()).toBe(42);
    expect(component.poreDiameterUm()).toBe(35);
    expect(grapheneService.currentAdhesionState()).toBe('floating_pre_adhesion');

    const tel = component.telemetry();
    expect(tel.nutrientDiffusionDepthUm).toBeLessThan(80);
    expect(tel.clinicalStatus).toBe('Diffusion Occlusion & Hypoxia Risk');
  });

  it('4. Switches to Cyclic Fatigue Microdamage regime and alerts to micro-fissure strain risk', () => {
    component.setRegime('cyclic_fatigue_microdamage');
    fixture.detectChanges();

    expect(component.regime()).toBe('cyclic_fatigue_microdamage');
    expect(component.cyclicStrainPct()).toBe(14.0);
    expect(grapheneService.currentAdhesionState()).toBe('hyper_contractile_stress');

    const tel = component.telemetry();
    expect(tel.ruptureRiskPercent).toBeGreaterThan(30);
    expect(tel.clinicalStatus).toBe('Micro-Fissure Strain Fatigue');
  });

  it('5. Toggles animation playback and adjusts flow speeds', () => {
    expect(component.isPlaying()).toBe(true);
    component.togglePlay();
    expect(component.isPlaying()).toBe(false);

    expect(component.simSpeed()).toBe(1.0);
    component.toggleSpeed();
    expect(component.simSpeed()).toBe(2.0);
    component.toggleSpeed();
    expect(component.simSpeed()).toBe(0.5);
  });
});
