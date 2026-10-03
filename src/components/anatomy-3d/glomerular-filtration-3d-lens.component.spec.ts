import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlomerularFiltration3dLensComponent } from './glomerular-filtration-3d-lens.component';
import { PatientStateService } from '../../services/patient-state.service';
import { IntelligenceProviderToken } from '../../services/ai/intelligence.provider.token';

describe('GlomerularFiltration3dLensComponent (Visual Model V5)', () => {
  let component: GlomerularFiltration3dLensComponent;
  let fixture: ComponentFixture<GlomerularFiltration3dLensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlomerularFiltration3dLensComponent],
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

    fixture = TestBed.createComponent(GlomerularFiltration3dLensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('1. Initializes and renders header, preset tabs, HUD, and legend', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('3D Glomerular Filtration & Podocyte Slit Diaphragm Lens (Visual Model V5)');
    expect(el.textContent).toContain('Fenestrated Capillary Core');
    expect(el.textContent).toContain('GBM Electrostatic Barrier');
    expect(el.textContent).toContain('Podocyte Slit Diaphragms');
    expect(el.textContent).toContain('Glomerular Filtration HUD');
  });

  it('2. Initializes in healthy homeostasis with intact selective barrier', () => {
    expect(component.regime()).toBe('healthy_homeostasis');
    const tele = component.telemetry();
    expect(tele.intraglomerularPressureMmHg).toBe(36.0);
    expect(tele.effacementRatioPercent).toBe(0);
    expect(tele.gbmChargeIntegrityPercent).toBe(100);
    expect(tele.slitDiaphragmWidthNm).toBe(35.0);
    expect(tele.filtrationBarrierStatus).toBe('Intact & Selective');
    expect(tele.podocytePedicelMorphology).toBe('Crisp Interdigitating');
  });

  it('3. Sets diabetic hyperfiltration regime with elevated pressure and microalbuminuria', () => {
    component.setRegime('diabetic_hyperfiltration');
    fixture.detectChanges();

    expect(component.regime()).toBe('diabetic_hyperfiltration');
    const tele = component.telemetry();
    expect(tele.intraglomerularPressureMmHg).toBe(52.0);
    expect(tele.effacementRatioPercent).toBe(25);
    expect(tele.filtrationBarrierStatus).toBe('Microalbuminuria Permeable');
    expect(tele.podocytePedicelMorphology).toBe('Partial Widening');
  });

  it('4. Sets nephrotic effacement regime with podocyte fusion and barrier collapse', () => {
    component.setRegime('nephrotic_effacement');
    fixture.detectChanges();

    expect(component.regime()).toBe('nephrotic_effacement');
    const tele = component.telemetry();
    expect(tele.effacementRatioPercent).toBe(85);
    expect(tele.gbmChargeIntegrityPercent).toBe(15);
    expect(tele.slitDiaphragmWidthNm).toBe(8.0);
    expect(tele.albuminuriaMgPerDay).toBeGreaterThan(3000);
    expect(tele.filtrationBarrierStatus).toBe('Nephrotic Barrier Collapse');
    expect(tele.podocytePedicelMorphology).toBe('Fused Continuous Sheet');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Nephrotic Barrier Collapse');
    expect(el.textContent).toContain('Fused Continuous Sheet');
  });

  it('5. Sets membranous immune complex regime', () => {
    component.setRegime('membranous_immune_complex');
    fixture.detectChanges();

    expect(component.regime()).toBe('membranous_immune_complex');
    const tele = component.telemetry();
    expect(tele.effacementRatioPercent).toBe(60);
    expect(tele.gbmChargeIntegrityPercent).toBe(35);
    expect(tele.slitDiaphragmWidthNm).toBe(16.0);
  });

  it('6. Toggles play/pause and cycles flow speed', () => {
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
    component.toggleSpeed();
    expect(component.flowSpeed()).toBe(1.0);
  });

  it('7. Resets camera position without errors', () => {
    expect(() => component.resetCamera()).not.toThrow();
  });

  it('8. Cleanly destroys and disposes Three.js resources', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
