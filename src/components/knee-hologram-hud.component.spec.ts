import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KneeHologramHudComponent } from './knee-hologram-hud.component';

describe('KneeHologramHudComponent 3D Holographic Slicer Suite', () => {
  let component: KneeHologramHudComponent;
  let fixture: ComponentFixture<KneeHologramHudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KneeHologramHudComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(KneeHologramHudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with 12 RSNA abnormality loci and default Sagittal plane', () => {
    expect(component).toBeTruthy();
    expect(component.lociList.length).toBe(12);
    expect(component.activePlane()).toBe('Sagittal');
    expect(component.selectedLocus()?.id).toBe('acl');
    expect(component.flexionAngle()).toBe(15);
  });

  it('2. Switches slicing plane and updates activePlane signal', () => {
    component.setSlicePlane('Coronal');
    expect(component.activePlane()).toBe('Coronal');
    expect(component.isAutoRotating()).toBe(false);

    component.setSlicePlane('Axial');
    expect(component.activePlane()).toBe('Axial');

    component.setSlicePlane('Sagittal');
    expect(component.activePlane()).toBe('Sagittal');
  });

  it('3. Selects an abnormality locus and synchronizes plane with locus.plane', () => {
    const mclLocus = component.lociList.find(l => l.id === 'mcl')!;
    component.selectLocus(mclLocus);

    expect(component.selectedLocus()?.id).toBe('mcl');
    expect(component.activePlane()).toBe('Coronal');
    expect(component.isAutoRotating()).toBe(false);

    const patellaLocus = component.lociList.find(l => l.id === 'pf_oa')!;
    component.selectLocus(patellaLocus);
    expect(component.selectedLocus()?.id).toBe('pf_oa');
    expect(component.activePlane()).toBe('Axial');
  });

  it('4. Focuses locus by target key lookup', () => {
    component.focusOnTargetKey('medial_meniscus');
    expect(component.selectedLocus()?.id).toBe('medial_meniscus');
    expect(component.activePlane()).toBe('Sagittal');

    component.focusOnTargetKey('bakers_cyst');
    expect(component.selectedLocus()?.id).toBe('bakers_cyst');
    expect(component.activePlane()).toBe('Axial');
  });

  it('5. Toggles auto-rotation signal state', () => {
    expect(component.isAutoRotating()).toBe(true);
    component.toggleAutoRotate();
    expect(component.isAutoRotating()).toBe(false);
    component.toggleAutoRotate();
    expect(component.isAutoRotating()).toBe(true);
  });

  it('6. Adjusts joint flexion angle via onFlexionChange', () => {
    const mockEvent = {
      target: { value: '45' }
    } as unknown as Event;

    component.onFlexionChange(mockEvent);
    expect(component.flexionAngle()).toBe(45);
  });

  it('7. Computes contact stress bias and toggles FEA stress heatmap', () => {
    expect(component.showStressHeatmap()).toBe(true);
    // With default Q-angle 12.2 deg (<13.5 Genu Varum), medial bias should be elevated (~65%)
    expect(component.medialContactBias()).toBeGreaterThan(60);
    // With default WORMS grade 2 and JSN 1.8mm, peak stress is elevated (>5.0 MPa)
    expect(component.peakVonMisesMpa()).toBeGreaterThan(4.5);

    component.toggleStressHeatmap();
    expect(component.showStressHeatmap()).toBe(false);

    component.toggleStressHeatmap();
    expect(component.showStressHeatmap()).toBe(true);
  });
});
