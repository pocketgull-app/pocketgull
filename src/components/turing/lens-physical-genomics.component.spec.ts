import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LensPhysicalGenomicsComponent } from './lens-physical-genomics.component';
import { PatientStateService } from '../../services/patient-state.service';
import { OnnxWebGpuEngineService } from '../../services/onnx-webgpu-engine.service';
import { PhysicalGenomicsService } from '../../services/physical-genomics.service';
import { FhirBundleFactoryService } from '../../services/fhir/fhir-bundle-factory.service';

describe('LensPhysicalGenomicsComponent Unit Suite', () => {
  let component: LensPhysicalGenomicsComponent;
  let fixture: ComponentFixture<LensPhysicalGenomicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LensPhysicalGenomicsComponent],
      providers: [
        PatientStateService,
        OnnxWebGpuEngineService,
        PhysicalGenomicsService,
        FhirBundleFactoryService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LensPhysicalGenomicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('1. Initializes with default chromatin loop tab and computed state signals', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('chromatin');
    expect(component.loopState()).toBeDefined();
    expect(component.loopState().tadInsulationScore).toBeDefined();
  });

  it('2. Switches tabs across all 5 physical genomics paradigms', () => {
    const tabs: Array<'chromatin' | 'condensates' | 'crispr' | 'nucleosome' | 'linc'> = [
      'condensates',
      'crispr',
      'nucleosome',
      'linc',
      'chromatin'
    ];

    for (const tab of tabs) {
      component.activeTab.set(tab);
      fixture.detectChanges();
      expect(component.activeTab()).toBe(tab);
    }
  });

  it('3. Dynamically updates LINC state and passes inputs to 3D deformable nucleus', () => {
    component.activeTab.set('linc');
    component.ecmStiffness.set(28.0);
    component.actinTension.set(4.5);
    fixture.detectChanges();

    const state = component.lincState();
    expect(state.ecmStiffnessKPa).toBe(28.0);
    expect(state.actinTensionNn).toBe(4.5);
    expect(state.yapTazNuclearToCytoplasmicRatio).toBeGreaterThan(1.5);
    expect(state.transcriptionalMechanostate).toBe('STIFF_PRO_FIBROTIC_ONCOGENIC');
  });

  it('4. Re-seeds physical parameters when applyEdgeMlPriors is invoked', () => {
    component.applyEdgeMlPriors();
    fixture.detectChanges();

    expect(component.ecmStiffness()).toBeGreaterThanOrEqual(2.0);
    expect(component.actinTension()).toBeGreaterThanOrEqual(1.0);
  });

  it('5. Exports Physical Genomics Snapshot without errors', () => {
    expect(() => component.exportGenomicsSnapshot()).not.toThrow();
    expect(component.copiedFeedback()).toBe(true);
  });

  it('6. Captures 3D WebGL Hologram PNG snapshot without crashing', async () => {
    await expect(component.captureHologramPng()).resolves.not.toThrow();
  });

  it('7. Records 3D WebGL WebM animation clip without crashing', async () => {
    await expect(component.recordHologramWebm()).resolves.not.toThrow();
  });

  it('8. Toggles 3D Dual-View comparison mode between WT baseline and perturbed variant', () => {
    expect(component.isDualViewEnabled()).toBe(false);
    component.toggleDualView();
    expect(component.isDualViewEnabled()).toBe(true);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('WT Baseline');
    expect(compiled.textContent).toContain('Pathological Variant');

    component.comparisonLayout.set('SIDE_BY_SIDE');
    fixture.detectChanges();
    expect(compiled.textContent).toContain('WILD-TYPE (WT) BASELINE');
    expect(compiled.textContent).toContain('PATHOLOGICAL / PERTURBED');

    component.toggleDualView();
    expect(component.isDualViewEnabled()).toBe(false);
  });

  it('9. Switches Dual-View target to Pharmacological Rescue mode and renders drug telemetry', () => {
    component.isDualViewEnabled.set(true);
    component.comparisonTarget.set('PHARMACOLOGICAL_RESCUE');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pharmacological Rescue');
    expect(compiled.textContent).toContain('Condensate Dissolution');

    component.comparisonLayout.set('SIDE_BY_SIDE');
    fixture.detectChanges();
    expect(compiled.textContent).toContain('dCas9-CTCF');
  });

  it('10. Operates Wipe Curtain slider and toggles comparison layout modes', () => {
    component.isDualViewEnabled.set(true);
    component.comparisonLayout.set('WIPE_CURTAIN');
    component.curtainPositionPct.set(50);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Wipe Curtain Slider');
    expect(compiled.textContent).toContain('50% Split');

    component.curtainPositionPct.set(75);
    fixture.detectChanges();
    expect(component.curtainPositionPct()).toBe(75);

    component.comparisonLayout.set('SIDE_BY_SIDE');
    fixture.detectChanges();
    expect(component.comparisonLayout()).toBe('SIDE_BY_SIDE');
  });
});
