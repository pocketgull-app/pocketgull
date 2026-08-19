import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Typographic3dBodyComponent } from './typographic-3d-body.component';

describe('Typographic3dBodyComponent', () => {
  let component: Typographic3dBodyComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Typographic3dBodyComponent],
      providers: [provideZonelessChangeDetection()]
    });
    const fixture = TestBed.createComponent(Typographic3dBodyComponent);
    component = fixture.componentInstance;
  });

  it('should create the Typographic 3D Body component', () => {
    expect(component).toBeTruthy();
    expect(component.activeView()).toBe('3d-body');
    expect(component.activeLens()).toBe('skeleton');
  });

  it('should switch spatial anatomical lenses', () => {
    component.switchLens('vascular');
    expect(component.activeLens()).toBe('vascular');

    component.switchLens('neural');
    expect(component.activeLens()).toBe('neural');

    component.switchLens('ascii');
    expect(component.activeLens()).toBe('ascii');
  });

  it('should toggle auto-rotate state and reset camera', () => {
    expect(component.autoRotate()).toBe(true);
    component.toggleAutoRotate();
    expect(component.autoRotate()).toBe(false);

    component.resetCamera();
    expect(component).toBeTruthy();
  });

  it('should replay vector drawing animation', () => {
    const initialKey = component.drawKey();
    component.replayDrawing();
    expect(component.drawKey()).toBe(initialKey + 2);
  });

  it('should compute halftone gradient pattern correctly', () => {
    component.halftonePitch.set(8);
    component.halftoneInk.set('crimson');
    const pattern = component.computedHalftonePattern();
    expect(pattern).toContain('#ef4444');

    component.halftoneInk.set('amber');
    expect(component.computedHalftonePattern()).toContain('#f59e0b');
  });
});
