import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Nucleosome3dPullerComponent } from './nucleosome-3d-puller.component';

describe('Nucleosome3dPullerComponent Unit Suite', () => {
  let component: Nucleosome3dPullerComponent;
  let fixture: ComponentFixture<Nucleosome3dPullerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nucleosome3dPullerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(Nucleosome3dPullerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('1. Initializes with default hyperacetylated state and biophysical rupture thresholds', () => {
    expect(component).toBeTruthy();
    expect(component.isAutoSpinning()).toBe(true);
    expect(component.outerRuptureForcePn()).toBeGreaterThan(0);
    expect(component.innerRuptureForcePn()).toBeGreaterThan(component.outerRuptureForcePn());
    expect(component.dnaExtensionNm()).toBeGreaterThan(0);
  });

  it('2. Dynamically updates rupture state and uncoils DNA as force increases', () => {
    // Low force: Bound outer turn
    component.pullingForce.set(1.0);
    fixture.detectChanges();
    expect(component.isOuterTurnUnwrapped()).toBe(false);
    expect(component.isInnerCoreUnwrapped()).toBe(false);

    // Medium force: Outer turn unwrapped
    component.pullingForce.set(6.0);
    fixture.detectChanges();
    expect(component.isOuterTurnUnwrapped()).toBe(true);
    expect(component.isInnerCoreUnwrapped()).toBe(false);

    // High force: Full inner core rupture
    component.pullingForce.set(25.0);
    fixture.detectChanges();
    expect(component.isOuterTurnUnwrapped()).toBe(true);
    expect(component.isInnerCoreUnwrapped()).toBe(true);
    expect(component.dnaExtensionNm()).toBeGreaterThan(45.0);
  });

  it('3. Modulates rupture thresholds based on epigenetic histone charge marks', () => {
    component.epigeneticState.set('HETEROCHROMATIN_H3K9ME3');
    fixture.detectChanges();
    const heteroOuter = component.outerRuptureForcePn();

    component.epigeneticState.set('HYPERACETYLATED_H3K27AC');
    fixture.detectChanges();
    const openOuter = component.outerRuptureForcePn();

    expect(heteroOuter).toBeGreaterThan(openOuter);
  });

  it('4. Toggles auto-spin, force ramp, and camera reset', () => {
    expect(component.isAutoSpinning()).toBe(true);
    component.toggleAutoSpin();
    expect(component.isAutoSpinning()).toBe(false);

    expect(component.isRamping()).toBe(false);
    component.toggleForceRamp();
    expect(component.isRamping()).toBe(true);
    component.toggleForceRamp();
    expect(component.isRamping()).toBe(false);

    expect(() => component.resetCamera()).not.toThrow();
  });
});
