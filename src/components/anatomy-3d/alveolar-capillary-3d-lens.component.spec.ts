import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlveolarCapillary3dLensComponent } from './alveolar-capillary-3d-lens.component';
import { PatientStateService } from '../../services/patient-state.service';

describe('AlveolarCapillary3dLensComponent (Visual Model V7)', () => {
  let fixture: ComponentFixture<AlveolarCapillary3dLensComponent>;
  let component: AlveolarCapillary3dLensComponent;
  let mockPatientState: any;

  beforeEach(async () => {
    mockPatientState = {};

    await TestBed.configureTestingModule({
      imports: [AlveolarCapillary3dLensComponent],
      providers: [
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AlveolarCapillary3dLensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders 3D Alveolar-Capillary Gas Exchange title and healthy defaults', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('3D Alveolar-Capillary Gas Exchange & Blood-Air Barrier');
    expect(el.textContent).toContain("Fick's Diffusion (0.2 - 0.5 um)");
    expect(el.textContent).toContain('Pristine Gas Exchange');

    const tel = component.telemetry();
    expect(tel.membraneThicknessUm).toBe(0.35);
    expect(tel.diffusionFluxMlMin).toBeGreaterThanOrEqual(240);
    expect(tel.shuntFractionPercent).toBeLessThan(10);
    expect(tel.clinicalStatus).toBe('Pristine Gas Exchange');
  });

  it('2. Switches to Euler-Liljestrand HPV regime and verifies active hypoxic shunt deflection', () => {
    component.setRegime('hypoxic_euler_liljestrand');
    fixture.detectChanges();

    expect(component.regime()).toBe('hypoxic_euler_liljestrand');
    expect(component.paO2()).toBe(48);
    expect(component.hpvConstriction()).toBeGreaterThanOrEqual(0.6);

    const tel = component.telemetry();
    expect(tel.clinicalStatus).toBe('Compensated Euler-Liljestrand Shunt');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Compensated Euler-Liljestrand Shunt');
  });

  it('3. Switches to Early ARDS exudative regime and verifies membrane thickening', () => {
    component.setRegime('early_ards_exudative');
    fixture.detectChanges();

    expect(component.regime()).toBe('early_ards_exudative');
    expect(component.thickness()).toBe(1.2);
    expect(component.flooding()).toBe(0.35);

    const tel = component.telemetry();
    expect(tel.clinicalStatus).toBe('Moderate ARDS Microvascular Leak');
    expect(tel.diffusionFluxMlMin).toBeLessThan(180);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Moderate ARDS Microvascular Leak');
  });

  it('4. Switches to Severe ARDS regime and verifies profound diffusion block and shunt', () => {
    component.setRegime('severe_ards_alveolar_flooding');
    fixture.detectChanges();

    expect(component.regime()).toBe('severe_ards_alveolar_flooding');
    expect(component.thickness()).toBe(2.4);
    expect(component.flooding()).toBe(0.85);

    const tel = component.telemetry();
    expect(tel.clinicalStatus).toBe('Severe Consolidation & Refractory Shunt');
    expect(tel.shuntFractionPercent).toBeGreaterThanOrEqual(20);
    expect(tel.staticComplianceMlCmH2O).toBeLessThanOrEqual(25);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Severe Consolidation & Refractory Shunt');
  });

  it('5. Handles manual PaO2 slider change and dynamically triggers HPV constriction', () => {
    const mockEvent = {
      target: { value: '38' }
    } as unknown as Event;

    component.onPaO2Change(mockEvent);
    fixture.detectChanges();

    expect(component.paO2()).toBe(38);
    expect(component.hpvConstriction()).toBeGreaterThan(0.7);
  });

  it('6. Handles manual PEEP slider adjustment and updates static compliance and recruitment', () => {
    component.onPeepChange({ target: { value: '16' } } as unknown as Event);
    fixture.detectChanges();

    expect(component.peep()).toBe(16);
    expect(component.telemetry().peepCmH2O).toBe(16);
    expect(component.telemetry().alveolarRecruitmentPercent).toBeGreaterThanOrEqual(90);
  });

  it('7. Toggles play/pause and cycles through flow speeds', () => {
    expect(component.isPlaying()).toBe(true);
    component.togglePlay();
    expect(component.isPlaying()).toBe(false);

    expect(component.flowSpeed()).toBe(1.0);
    component.toggleSpeed();
    expect(component.flowSpeed()).toBe(1.5);
    component.toggleSpeed();
    expect(component.flowSpeed()).toBe(2.0);
    component.toggleSpeed();
    expect(component.flowSpeed()).toBe(0.5);
  });
});
