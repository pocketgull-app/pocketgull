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

  it('7. Computes contact stress bias for both Genu Varum (>50%) and Genu Valgum (<50%) and toggles FEA stress heatmap', () => {
    expect(component.showStressHeatmap()).toBe(true);
    // With default Q-angle 12.2 deg (<13.5 Genu Varum), medial bias should be elevated (~65%)
    expect(component.medialContactBias()).toBeGreaterThan(60);
    // With Genu Valgum Q-angle 18.0 deg (>15.5 deg), medial bias drops below 50% (lateral compartment shift)
    component.qAngle.set(18.0);
    expect(component.medialContactBias()).toBeLessThan(50);
    expect(component.medialContactBias()).toBe(27);
    component.qAngle.set(12.2);
    // With default WORMS grade 2 and JSN 1.8mm, peak stress is elevated (>5.0 MPa)
    expect(component.peakVonMisesMpa()).toBeGreaterThan(4.5);

    component.toggleStressHeatmap();
    expect(component.showStressHeatmap()).toBe(false);

    component.toggleStressHeatmap();
    expect(component.showStressHeatmap()).toBe(true);
  });

  it('8. Exposes all 9 canonical anatomical diagram callouts (Quadriceps, Hamstrings, Femur, Patella, Patellar Tendon, Ligaments, Meniscus, Fibula, Tibia)', () => {
    expect(component.anatomicalCallouts.length).toBe(9);
    const ids = component.anatomicalCallouts.map(c => c.id);
    expect(ids).toEqual([
      'quadriceps',
      'hamstrings',
      'femur',
      'patella',
      'patellar_tendon',
      'ligaments',
      'meniscus',
      'fibula',
      'tibia'
    ]);
  });

  it('9. Focuses anatomical callout and synchronizes slice plane and activeCallout signal', () => {
    const fibulaCallout = component.anatomicalCallouts.find(c => c.id === 'fibula')!;
    component.focusAnatomicalCallout(fibulaCallout);
    expect(component.activeCallout()?.id).toBe('fibula');
    expect(component.activePlane()).toBe('Coronal');
    expect(component.isAutoRotating()).toBe(false);

    const hamstringsCallout = component.anatomicalCallouts.find(c => c.id === 'hamstrings')!;
    component.focusAnatomicalCallout(hamstringsCallout);
    expect(component.activeCallout()?.id).toBe('hamstrings');
    expect(component.activePlane()).toBe('Sagittal');
  });

  it('10. Computes kinematic patellar inferior glide distance and toggles myotendinous soft-tissue layer & callout labels', () => {
    expect(component.showSoftTissueLayer()).toBe(true);
    expect(component.showAnatomicalLabels()).toBe(true);
    expect(component.patellarGlideMm()).toBeGreaterThan(10);

    const mockFlexion90 = { target: { value: '90' } } as unknown as Event;
    component.onFlexionChange(mockFlexion90);
    expect(component.flexionAngle()).toBe(90);
    expect(component.patellarGlideMm()).toBe(48);

    component.toggleSoftTissueLayer();
    expect(component.showSoftTissueLayer()).toBe(false);

    component.toggleAnatomicalLabels();
    expect(component.showAnatomicalLabels()).toBe(false);
  });

  it('11. Solves OpenSim 2-phase sagittal gait knee flexion (18 deg stance peak, 60 deg swing peak) and toggles gait simulation', () => {
    expect(component.isGaitSimulating()).toBe(false);
    component.toggleGaitSimulation();
    expect(component.isGaitSimulating()).toBe(true);
    expect(component.gaitPhaseLabel()).toBe('Stance');

    // Mid-stance (t = 0.3) -> 18 deg peak
    expect(component.computeOpenSimKneeFlexion(0.3)).toBe(18);
    // Mid-swing (t = 0.8) -> 60 deg peak
    expect(component.computeOpenSimKneeFlexion(0.8)).toBe(60);

    component.gaitCycleProgress.set(0.75);
    expect(component.gaitPhaseLabel()).toBe('Swing');

    component.toggleGaitSimulation();
    expect(component.isGaitSimulating()).toBe(false);
  });
});


