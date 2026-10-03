import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ClinicalHolodeckViewerComponent } from './clinical-holodeck-viewer.component';

describe('ClinicalHolodeckViewerComponent Unit Suite', () => {
  let component: ClinicalHolodeckViewerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicalHolodeckViewerComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ClinicalHolodeckViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('1. Instantiates successfully with holodeck surgical defaults', () => {
    expect(component).toBeTruthy();
    expect(component.activeTool()).toBe('laser_pbm');
    expect(component.visibleLayer()).toBe('ligament');
    expect(component.layerDepth()).toBe(85);
    expect(component.cytokineLoad()).toBe(48.5);
    expect(component.photonsDelivered()).toBe(0);
  });

  it('2. Switches active arthroscopic dissection tools', () => {
    component.setTool('inspect');
    expect(component.activeTool()).toBe('inspect');

    component.setTool('synovial_lavage');
    expect(component.activeTool()).toBe('synovial_lavage');

    component.setTool('laser_pbm');
    expect(component.activeTool()).toBe('laser_pbm');
  });

  it('3. Modifies anatomical layer and depth through quick selectors', () => {
    // When in server mode, updateLayerOpacities will safely skip if meshes are not initialized
    (component as any).updateLayerOpacities = vi.fn();

    component.setLayer('skin', 10);
    expect(component.visibleLayer()).toBe('skin');
    expect(component.layerDepth()).toBe(10);

    component.setLayer('muscle', 35);
    expect(component.visibleLayer()).toBe('muscle');
    expect(component.layerDepth()).toBe(35);

    component.setLayer('capsule', 60);
    expect(component.visibleLayer()).toBe('capsule');
    expect(component.layerDepth()).toBe(60);
  });

  it('4. Handles depth slider change events across anatomical layer bands', () => {
    (component as any).updateLayerOpacities = vi.fn();

    const skinEvent = { target: { value: '15' } } as unknown as Event;
    component.onLayerDepthChange(skinEvent);
    expect(component.visibleLayer()).toBe('skin');
    expect(component.layerDepth()).toBe(15);

    const muscleEvent = { target: { value: '40' } } as unknown as Event;
    component.onLayerDepthChange(muscleEvent);
    expect(component.visibleLayer()).toBe('muscle');

    const capsuleEvent = { target: { value: '65' } } as unknown as Event;
    component.onLayerDepthChange(capsuleEvent);
    expect(component.visibleLayer()).toBe('capsule');

    const ligamentEvent = { target: { value: '90' } } as unknown as Event;
    component.onLayerDepthChange(ligamentEvent);
    expect(component.visibleLayer()).toBe('ligament');
  });

  it('5. Triggers WebXR immersion session dispatch', () => {
    const originalAlert = window.alert;
    const alertMock = vi.fn();
    window.alert = alertMock;

    try {
      component.triggerXrSession();
      expect(alertMock).toHaveBeenCalledWith(
        expect.stringContaining('WebXR Spatial Immersion Session Request dispatched')
      );
    } finally {
      window.alert = originalAlert;
    }
  });

  it('6. Simulates 810nm PBM laser pulse with Monte Carlo optical transport and CCO activation', () => {
    expect(component.photonsDelivered()).toBe(0);
    expect(component.targetFluence()).toBe('0.00');
    expect(component.cytochromeCOxidaseActivation()).toBe(12);
    const initialCytokine = component.cytokineLoad();

    component.dischargePbmLaser(4.0);

    expect(component.photonsDelivered()).toBe(4.0);
    expect(Number(component.targetFluence())).toBeGreaterThan(0);
    expect(component.cytochromeCOxidaseActivation()).toBeGreaterThan(12);
    expect(component.cytokineLoad()).toBeLessThan(initialCytokine);
  });
});
