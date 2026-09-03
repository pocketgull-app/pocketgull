import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Chromatin3dFiberComponent } from './chromatin-3d-fiber.component';

describe('Chromatin3dFiberComponent Unit Suite', () => {
  let component: Chromatin3dFiberComponent;
  let fixture: ComponentFixture<Chromatin3dFiberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chromatin3dFiberComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(Chromatin3dFiberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('1. Initializes with intact CTCF boundary and canonical TAD insulation score', () => {
    expect(component).toBeTruthy();
    expect(component.isAutoSpinning()).toBe(true);
    expect(component.hasCtcfMutation()).toBe(false);
    expect(component.tadInsulationScore()).toBeGreaterThan(0.6);
    expect(component.fractalGamma()).toBe(1.02);
    expect(component.currentLoopSpanKb()).toBe(500);
  });

  it('2. Collapses insulation and extends loop span into fused mega-TAD upon CTCF deletion', () => {
    component.hasCtcfMutation.set(true);
    fixture.detectChanges();

    expect(component.tadInsulationScore()).toBe(0.38);
    expect(component.fractalGamma()).toBe(0.88);
    expect(component.currentLoopSpanKb()).toBe(1000);
  });

  it('3. Modulates insulation based on CTCF permeability and cohesin extrusion speed', () => {
    component.cohesinSpeed.set(2.0);
    component.ctcfPermeability.set(0.05); // High-fidelity insulator
    fixture.detectChanges();

    expect(component.tadInsulationScore()).toBeGreaterThan(0.85);
  });

  it('4. Toggles CTCF mutation, auto-spin, and camera reset', () => {
    expect(component.hasCtcfMutation()).toBe(false);
    component.toggleCtcfMutation();
    expect(component.hasCtcfMutation()).toBe(true);
    component.toggleCtcfMutation();
    expect(component.hasCtcfMutation()).toBe(false);

    expect(component.isAutoSpinning()).toBe(true);
    component.toggleAutoSpin();
    expect(component.isAutoSpinning()).toBe(false);

    expect(() => component.resetCamera()).not.toThrow();
  });
});
