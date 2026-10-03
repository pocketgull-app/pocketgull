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
    expect(component.patientVitals()?.bp).toBe('120/80');
  });

  it('2. Modulates sleep stages (wake, n2, n3) and updates fluid velocity and expansion', () => {
    component.setSleepStage('wake');
    fixture.detectChanges();
    expect(component.sleepStage()).toBe('wake');
    expect(component.csfVelocity()).toBe('0.6');
    expect(component.volumeExpansion()).toBe(0);
    expect(component.reynoldsNumber()).toBe(24);

    component.setSleepStage('n2');
    fixture.detectChanges();
    expect(component.sleepStage()).toBe('n2');
    expect(component.csfVelocity()).toBe('2.1');
    expect(component.volumeExpansion()).toBe(20);
    expect(component.reynoldsNumber()).toBe(85);

    component.setSleepStage('n3');
    fixture.detectChanges();
    expect(component.sleepStage()).toBe('n3');
    expect(component.csfVelocity()).toBe('4.8');
    expect(component.volumeExpansion()).toBe(60);
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

  it('6. Cleans up animation loop safely on ngOnDestroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
