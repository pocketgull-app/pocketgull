import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MicrovascularShear3dLensComponent } from './microvascular-shear-3d-lens.component';
import { PatientStateService } from '../../services/patient-state.service';
import { IntelligenceProviderToken } from '../../services/ai/intelligence.provider.token';

describe('MicrovascularShear3dLensComponent (Visual Model V4)', () => {
  let component: MicrovascularShear3dLensComponent;
  let fixture: ComponentFixture<MicrovascularShear3dLensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MicrovascularShear3dLensComponent],
      providers: [
        PatientStateService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock CDS response'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MicrovascularShear3dLensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders 3D Microvascular Shear Stress & Glycocalyx Lens header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('3D Microvascular Shear Stress & Glycocalyx Lens (Visual Model V4)');
    expect(el.textContent).toContain('Laminar High-Shear');
    expect(el.textContent).toContain('Turbulent Low-Shear');
    expect(el.textContent).toContain('Diabetic Shedding');
    expect(el.textContent).toContain('Septic Denudation');
  });

  it('2. Computes atheroprotective hemodynamics in default laminar flow mode', () => {
    const telemetry = component.telemetry();
    expect(telemetry.shearStressDyn).toBe(24.5); // > 15 dyn/cm2
    expect(telemetry.glycocalyxThicknessUm).toBe(2.4); // > 2.0 um intact
    expect(telemetry.noProductionPercent).toBe(92);
    expect(telemetry.endothelialStatus).toBe('Quiescent & Atheroprotective');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('24.5 dyn/cm²');
    expect(el.textContent).toContain('2.4 μm');
    expect(el.textContent).toContain('92% Max');
  });

  it('3. Modulates hemodynamics into atheroprone state in turbulent mode', () => {
    component.setRegime('turbulent_atheroprone');
    fixture.detectChanges();

    const telemetry = component.telemetry();
    expect(telemetry.shearStressDyn).toBe(3.2); // Low shear < 4 dyn/cm2
    expect(telemetry.noProductionPercent).toBe(28);
    expect(telemetry.endothelialStatus).toBe('Activated & Inflamed');
    expect(component.regimeTitle()).toContain('Oscillatory Low-Shear Stress');
  });

  it('4. Simulates hyperglycemic glycocalyx shedding in diabetic mode', () => {
    component.setRegime('diabetic_shedding');
    fixture.detectChanges();

    const telemetry = component.telemetry();
    expect(telemetry.glycocalyxThicknessUm).toBe(0.5); // Collapsed to 0.5 um
    expect(telemetry.sheddingRatio).toBe(0.8);
    expect(telemetry.endothelialStatus).toBe('Permeable & Denuded');
    expect(component.regimeExplanation()).toContain('albumin extravasation');
  });

  it('5. Simulates acute endotoxemic denudation in sepsis mode', () => {
    component.setRegime('septic_endotoxemia');
    fixture.detectChanges();

    const telemetry = component.telemetry();
    expect(telemetry.glycocalyxThicknessUm).toBe(0.25);
    expect(telemetry.sheddingRatio).toBe(0.92);
    expect(telemetry.noProductionPercent).toBe(15);
    expect(component.regimeTitle()).toContain('Acute Endotoxemic Glycocalyx Degradation');
  });

  it('6. Toggles play/pause state and cycles flow speed multiplier', () => {
    expect(component.isPlaying()).toBe(true);

    component.togglePlay();
    expect(component.isPlaying()).toBe(false);

    component.togglePlay();
    expect(component.isPlaying()).toBe(true);

    expect(component.flowSpeed()).toBe(1.0);
    component.toggleSpeed();
    expect(component.flowSpeed()).toBe(1.5);
    component.toggleSpeed();
    expect(component.flowSpeed()).toBe(0.5);
    component.toggleSpeed();
    expect(component.flowSpeed()).toBe(1.0);
  });

  it('7. Executes resetCamera safely without throwing an exception', () => {
    expect(() => component.resetCamera()).not.toThrow();
  });

  it('8. Cleanly disposes Three.js meshes, materials, and renderer on ngOnDestroy', () => {
    expect(() => fixture.destroy()).not.toThrow();
  });
});
