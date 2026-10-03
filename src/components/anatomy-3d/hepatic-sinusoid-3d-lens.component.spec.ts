import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HepaticSinusoid3dLensComponent } from './hepatic-sinusoid-3d-lens.component';
import { PatientStateService } from '../../services/patient-state.service';

describe('HepaticSinusoid3dLensComponent (Visual Model V8)', () => {
  let fixture: ComponentFixture<HepaticSinusoid3dLensComponent>;
  let component: HepaticSinusoid3dLensComponent;
  let mockPatientState: any;

  beforeEach(async () => {
    mockPatientState = {};

    await TestBed.configureTestingModule({
      imports: [HepaticSinusoid3dLensComponent],
      providers: [
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HepaticSinusoid3dLensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders 3D Hepatic Sinusoid title and F0 healthy defaults', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('3D Hepatic Sinusoid & Space of Disse Microarchitecture');
    expect(el.textContent).toContain('LSEC Fenestrae (100 - 150 nm)');
    expect(el.textContent).toContain('Pristine Sinusoidal Permeability');

    const tel = component.telemetry();
    expect(tel.fibrosisStage).toBe(0);
    expect(tel.hvpgMmHg).toBeLessThanOrEqual(5.0);
    expect(tel.csphPresent).toBe(false);
    expect(tel.fenestrationPorosityPercent).toBe(100);
    expect(tel.collagenDensityPercent).toBe(0);
    expect(tel.metabolicClearancePercent).toBeGreaterThanOrEqual(90);
    expect(tel.stellatePhenotype).toBe('Quiescent Retinoid Storage');
    expect(tel.clinicalStatus).toBe('Pristine Sinusoidal Permeability');
  });

  it('2. Transitions preset to F1 and F2 periportal fibrosis', () => {
    component.setPreset('f1_portal_expansion');
    fixture.detectChanges();
    expect(component.preset()).toBe('f1_portal_expansion');
    expect(component.fibrosisStage()).toBe(1);
    expect(component.telemetry().clinicalStatus).toBe('Early Perisinusoidal Matrix Expansion');

    component.setPreset('f2_periportal_fibrosis');
    fixture.detectChanges();
    expect(component.preset()).toBe('f2_periportal_fibrosis');
    expect(component.fibrosisStage()).toBe(2);
    expect(component.collagenDensity()).toBe(0.35);
    expect(component.telemetry().hvpgMmHg).toBeGreaterThan(6.0);
    expect(component.telemetry().stellatePhenotype).toBe('Intermediate Transdifferentiation');
  });

  it('3. Transitions preset to F3 Bridging Fibrosis and verifies CSPH threshold trigger', () => {
    component.setPreset('f3_bridging_fibrosis');
    fixture.detectChanges();

    expect(component.preset()).toBe('f3_bridging_fibrosis');
    expect(component.fibrosisStage()).toBe(3);
    const tel = component.telemetry();
    expect(tel.hvpgMmHg).toBeGreaterThanOrEqual(10.0);
    expect(tel.csphPresent).toBe(true);
    expect(tel.clinicalStatus).toBe('Clinically Significant Portal Hypertension (CSPH)');
    expect(tel.stellatePhenotype).toBe('Activated alpha-SMA+ Myofibroblast');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('CSPH Active');
  });

  it('4. Transitions preset to F4 Cirrhosis (Varices) and verifies severe decompensation and bleed hazard', () => {
    component.setPreset('f4_cirrhosis_varices');
    fixture.detectChanges();

    expect(component.preset()).toBe('f4_cirrhosis_varices');
    expect(component.fibrosisStage()).toBe(4);
    const tel = component.telemetry();
    expect(tel.hvpgMmHg).toBeGreaterThanOrEqual(16.0);
    expect(tel.varicealBleedRiskPercent).toBeGreaterThanOrEqual(40);
    expect(tel.fenestrationPorosityPercent).toBeLessThanOrEqual(15);
    expect(tel.clinicalStatus).toBe('Decompensated Cirrhosis & Variceal Hazard');
    expect(tel.metabolicClearancePercent).toBeLessThan(35);
    expect(tel.albuminReservePercent).toBeLessThanOrEqual(35);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Decompensated Cirrhosis & Variceal Hazard');
  });

  it('5. Handles manual slider adjustments and dynamic recalculation', () => {
    component.onFibrosisChange({ target: { value: '2' } } as unknown as Event);
    fixture.detectChanges();
    expect(component.fibrosisStage()).toBe(2);

    component.onCollagenChange({ target: { value: '0.45' } } as unknown as Event);
    fixture.detectChanges();
    expect(component.collagenDensity()).toBe(0.45);

    component.onPorosityChange({ target: { value: '0.40' } } as unknown as Event);
    fixture.detectChanges();
    expect(component.fenestrationPorosity()).toBe(0.40);

    component.onStellateChange({ target: { value: '0.85' } } as unknown as Event);
    fixture.detectChanges();
    expect(component.stellateActivation()).toBe(0.85);
    expect(component.telemetry().stellatePhenotype).toBe('Activated alpha-SMA+ Myofibroblast');
  });

  it('6. Toggles playback, flow speed cycle, and resets camera', () => {
    expect(component.isPlaying()).toBe(true);
    component.togglePlay();
    expect(component.isPlaying()).toBe(false);
    component.togglePlay();
    expect(component.isPlaying()).toBe(true);

    expect(component.flowSpeed()).toBe(1.0);
    component.toggleSpeed();
    expect(component.flowSpeed()).toBe(1.5);
    component.toggleSpeed();
    expect(component.flowSpeed()).toBe(2.0);
    component.toggleSpeed();
    expect(component.flowSpeed()).toBe(0.5);

    expect(() => component.resetCamera()).not.toThrow();
  });

  it('7. Cleans up animation frame and Three.js resources on destroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
