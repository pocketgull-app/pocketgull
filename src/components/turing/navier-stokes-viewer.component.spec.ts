import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavierStokesViewerComponent } from './navier-stokes-viewer.component';
import { PatientStateService } from '../../services/patient-state.service';
import { CircadianSleepinessService } from '../../services/circadian-sleepiness.service';
import { signal } from '@angular/core';

describe('NavierStokesViewerComponent', () => {
  let component: NavierStokesViewerComponent;
  let fixture: ComponentFixture<NavierStokesViewerComponent>;
  let mockPatientState: any;
  let mockCircadianService: any;

  beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      canvas: {},
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      createLinearGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn()
      })
    });
  });

  beforeEach(async () => {
    mockPatientState = {
      vitals: signal({
        bp: '120/80',
        heartRate: 70
      })
    };

    mockCircadianService = {
      clinicianKss: signal(8)
    };

    await TestBed.configureTestingModule({
      imports: [NavierStokesViewerComponent],
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: CircadianSleepinessService, useValue: mockCircadianService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavierStokesViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('1. Initializes with default fluidMode and computed metrics', () => {
    expect(component).toBeTruthy();
    expect(component.fluidMode()).toBe('glymphatic');
    expect(component.sleepStage()).toBe('n3');
    expect(component.csfVelocity()).toBe('4.8');
    expect(component.volumeExpansion()).toBe(60);
    expect(component.reynoldsNumber()).toBe(142);
    expect(component.womersleyNumber()).toBe(0.24);
    expect(component.stokesReynoldsNumber()).toBe(0.048);
    expect(component.aqp4Polarized()).toBe(true);
    expect(component.patientVitals()?.bp).toBe('120/80');
  });

  it('2. Modulates sleep stages (wake, n2, n3) and updates fluid velocity and expansion', () => {
    component.setSleepStage('wake');
    fixture.detectChanges();
    expect(component.sleepStage()).toBe('wake');
    expect(component.csfVelocity()).toBe('0.6');
    expect(component.volumeExpansion()).toBe(0);
    expect(component.reynoldsNumber()).toBe(24);
    expect(component.womersleyNumber()).toBe(0.08);
    expect(component.stokesReynoldsNumber()).toBe(0.006);

    component.setSleepStage('n2');
    fixture.detectChanges();
    expect(component.sleepStage()).toBe('n2');
    expect(component.csfVelocity()).toBe('2.1');
    expect(component.volumeExpansion()).toBe(20);
    expect(component.reynoldsNumber()).toBe(85);
    expect(component.womersleyNumber()).toBe(0.16);
    expect(component.stokesReynoldsNumber()).toBe(0.021);

    component.setSleepStage('n3');
    fixture.detectChanges();
    expect(component.sleepStage()).toBe('n3');
    expect(component.csfVelocity()).toBe('4.8');
    expect(component.volumeExpansion()).toBe(60);
    expect(component.reynoldsNumber()).toBe(142);
    expect(component.womersleyNumber()).toBe(0.24);
    expect(component.stokesReynoldsNumber()).toBe(0.048);
  });

  it('3. Switches fluid modes (glymphatic, morphogen, shear) and updates Péclet and shear stress metrics', () => {
    component.setFluidMode('morphogen');
    fixture.detectChanges();
    expect(component.fluidMode()).toBe('morphogen');
    expect(component.pecletNumber()).toBe(48.5);

    component.setFluidMode('shear');
    fixture.detectChanges();
    expect(component.fluidMode()).toBe('shear');
    expect(component.wallShearStress()).toBe('1.42 Pa');

    component.setFluidMode('glymphatic');
    fixture.detectChanges();
    expect(component.fluidMode()).toBe('glymphatic');
  });

  it('4. Synchronizes sleep stage with clinician KSS circadian telemetry', () => {
    mockCircadianService.clinicianKss.set(8);
    component.syncWithCircadianTelemetry();
    expect(component.sleepStage()).toBe('n3');

    mockCircadianService.clinicianKss.set(5);
    component.syncWithCircadianTelemetry();
    expect(component.sleepStage()).toBe('n2');

    mockCircadianService.clinicianKss.set(3);
    component.syncWithCircadianTelemetry();
    expect(component.sleepStage()).toBe('wake');
  });

  it('5. Triggers biochemical challenges and updates simulation parameters', () => {
    expect(() => component.pulseHypertension()).not.toThrow();

    component.induceSlowWaveDeepSleep();
    expect(component.sleepStage()).toBe('n3');

    component.injectMorphogenPulse();
    expect(component.fluidMode()).toBe('morphogen');

    component.pulseAtheroproneTurbulence();
    expect(component.fluidMode()).toBe('shear');
  });

  it('6. Manages Aquaporin-4 (AQP4) astrocytic polarization states', () => {
    expect(component.aqp4Polarized()).toBe(true);

    component.toggleAqp4Polarity();
    expect(component.aqp4Polarized()).toBe(false);

    component.setAqp4Polarization(true);
    expect(component.aqp4Polarized()).toBe(true);

    component.setAqp4Polarization(false);
    expect(component.aqp4Polarized()).toBe(false);
  });

  it('7. Cleans up animation loop safely on ngOnDestroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('8. Selects solute molecules and dynamically adapts hydrodynamic radius and Péclet scaling', () => {
    expect(component.soluteMolecules.length).toBeGreaterThanOrEqual(5);
    expect(component.selectedMolecule().id).toBe('amyloid_beta_42');

    // Select Spermidine (small molecule)
    const spermidine = component.soluteMolecules.find(m => m.id === 'spermidine')!;
    component.selectMolecule(spermidine);
    fixture.detectChanges();
    expect(component.selectedMolecule().id).toBe('spermidine');
    expect(component.selectedMolecule().molecularWeightDa).toBe(145.25);
    expect(component.selectedMolecule().hydrodynamicRadiusNm).toBe(0.35);
    expect(component.pecletNumber()).toBe(12.8);

    // Select Tau Protein (bulky proteopathy)
    const tau = component.soluteMolecules.find(m => m.id === 'tau_protein')!;
    component.selectMolecule(tau);
    fixture.detectChanges();
    expect(component.selectedMolecule().id).toBe('tau_protein');
    expect(component.selectedMolecule().molecularWeightDa).toBe(48000);
    expect(component.selectedMolecule().hydrodynamicRadiusNm).toBe(2.45);
    expect(component.pecletNumber()).toBe(118.5);
  });

  it('9. Evaluates Cerebral Amyloid Angiopathy (CAA) stasis risk under proteopathy and impaired bulk flow', () => {
    // Default: Abeta42 with N3 sleep and polarized AQP4 -> risk is false (active clearance)
    expect(component.selectedMolecule().isPathological).toBe(true);
    expect(component.aqp4Polarized()).toBe(true);
    expect(component.sleepStage()).toBe('n3');
    expect(component.caaStasisRisk()).toBe(false);

    // Depolarize AQP4 -> caaStasisRisk becomes true
    component.setAqp4Polarization(false);
    expect(component.caaStasisRisk()).toBe(true);

    // Re-polarize AQP4, but transition to wakefulness -> caaStasisRisk remains true
    component.setAqp4Polarization(true);
    component.setSleepStage('wake');
    expect(component.caaStasisRisk()).toBe(true);

    // Switch to therapeutic small molecule (Spermidine) -> caaStasisRisk resolves (false) even in wake
    const spermidine = component.soluteMolecules.find(m => m.id === 'spermidine')!;
    component.selectMolecule(spermidine);
    expect(component.selectedMolecule().isPathological).toBe(false);
    expect(component.caaStasisRisk()).toBe(false);
  });

  it('10. Exposes Farm-to-Brain Food Science and Agronomy profiles across solute molecules', () => {
    const spermidine = component.soluteMolecules.find(m => m.id === 'spermidine')!;
    expect(spermidine.foodScienceProfile).toBeDefined();
    expect(spermidine.foodScienceProfile?.dietarySources).toContain('Wheat germ');
    expect(spermidine.foodScienceProfile?.farmerAgronomyTip).toContain('Regulated Deficit Irrigation');

    const curcumin = component.soluteMolecules.find(m => m.id === 'curcumin')!;
    expect(curcumin.foodScienceProfile?.dietarySources).toContain('Curcuma longa');
    expect(curcumin.foodScienceProfile?.foodMatrixBioavailability).toContain('piperine');

    const akba = component.soluteMolecules.find(m => m.id === 'akba')!;
    expect(akba.foodScienceProfile?.farmerAgronomyTip).toContain('Boswellia');
  });
});
