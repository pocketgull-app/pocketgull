import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Nucleus3dDeformerComponent } from './nucleus-3d-deformer.component';

describe('Nucleus3dDeformerComponent Unit Suite', () => {
  let component: Nucleus3dDeformerComponent;
  let fixture: ComponentFixture<Nucleus3dDeformerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nucleus3dDeformerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(Nucleus3dDeformerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('1. Initializes with default homeostatic mechanobiology telemetry signals', () => {
    expect(component).toBeTruthy();
    expect(component.isAutoSpinning()).toBe(true);
    expect(component.lincForcePn()).toBeGreaterThan(0);
    expect(component.poreDiameterNm()).toBeGreaterThanOrEqual(9.0);
    expect(component.yapTazRatio()).toBeGreaterThan(0.4);
  });

  it('2. Dynamically updates LINC force and pore dilation when ECM stiffness changes', () => {
    component.ecmStiffness.set(35.0);
    component.actinTension.set(5.0);
    fixture.detectChanges();

    expect(component.lincForcePn()).toBeGreaterThan(20.0);
    expect(component.poreDiameterNm()).toBeGreaterThan(12.0);
    expect(component.yapTazRatio()).toBeGreaterThan(2.0);
  });

  it('3. Toggles 360 auto-spin state and supports camera reset', () => {
    expect(component.isAutoSpinning()).toBe(true);
    component.toggleAutoSpin();
    expect(component.isAutoSpinning()).toBe(false);

    expect(() => component.resetCamera()).not.toThrow();
  });
});
