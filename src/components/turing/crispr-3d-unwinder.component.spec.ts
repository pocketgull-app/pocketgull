import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Crispr3dUnwinderComponent } from './crispr-3d-unwinder.component';

describe('Crispr3dUnwinderComponent Unit Suite', () => {
  let component: Crispr3dUnwinderComponent;
  let fixture: ComponentFixture<Crispr3dUnwinderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Crispr3dUnwinderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(Crispr3dUnwinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('1. Initializes with full on-target match and catalytic active state', () => {
    expect(component).toBeTruthy();
    expect(component.isAutoSpinning()).toBe(true);
    expect(component.isSeedMatched()).toBe(true);
    expect(component.netDeltaG()).toBeLessThan(-12.0);
    expect(component.isProofreadingPassed()).toBe(true);
    expect(component.cleavageProbabilityPct()).toBeGreaterThan(80);
  });

  it('2. Fails proofreading and blocks cleavage on seed mismatch', () => {
    component.guideRna.set('AACUUGACAGUCUACGAUCG'); // Mismatch at position 1
    fixture.detectChanges();

    expect(component.isSeedMatched()).toBe(false);
    expect(component.isProofreadingPassed()).toBe(false);
    expect(component.cleavageProbabilityPct()).toBeLessThan(50);
  });

  it('3. Modulates net delta G based on negative superhelical torque', () => {
    component.superhelicalSigma.set(-0.09); // High negative supercoiling
    fixture.detectChanges();
    const highSupercoilingDeltaG = component.netDeltaG();

    component.superhelicalSigma.set(0.0); // Relaxed DNA
    fixture.detectChanges();
    const relaxedDeltaG = component.netDeltaG();

    expect(highSupercoilingDeltaG).toBeLessThan(relaxedDeltaG);
  });

  it('4. Toggles auto-spin, cleavage spark, and camera reset', () => {
    expect(component.isAutoSpinning()).toBe(true);
    component.toggleAutoSpin();
    expect(component.isAutoSpinning()).toBe(false);

    expect(() => component.triggerCleavageSpark()).not.toThrow();
    expect(() => component.resetCamera()).not.toThrow();
  });
});
