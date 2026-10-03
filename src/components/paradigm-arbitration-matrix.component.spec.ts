import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParadigmArbitrationMatrixComponent } from './paradigm-arbitration-matrix.component';

describe('ParadigmArbitrationMatrixComponent', () => {
  let component: ParadigmArbitrationMatrixComponent;
  let fixture: ComponentFixture<ParadigmArbitrationMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParadigmArbitrationMatrixComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ParadigmArbitrationMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with header and 5-stage arbitration pipeline', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Deterministic Paradigm Arbitration & Safety Locks');
    expect(el.textContent).toContain('5-Stage Priority Engine');
    expect(component.arbitrationRules().length).toBe(5);
  });

  it('2. Enforces Allopathic safety lock by default when epilepsyFlag is true', () => {
    expect(component.epilepsyFlag()).toBe(true);
    const rule1 = component.arbitrationRules().find(r => r.stage === 1);
    expect(rule1?.status).toBe('ACTIVE');
    expect(rule1?.resolvedValue).toContain('0.0 Hz (Constant Light Only)');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Epilepsy Lockout: ON');
  });

  it('3. Toggles epilepsy lock and updates strobe parameter resolution', () => {
    component.toggleEpilepsy();
    fixture.detectChanges();

    expect(component.epilepsyFlag()).toBe(false);
    const rule1 = component.arbitrationRules().find(r => r.stage === 1);
    expect(rule1?.status).toBe('PASSED');
    expect(rule1?.resolvedValue).toContain('8.0 Hz Alpha Strobe');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Epilepsy Lockout: OFF');
  });

  it('4. Toggles chronobiological night lock and updates optical wavelength', () => {
    expect(component.nightLock()).toBe(true);
    let rule4 = component.arbitrationRules().find(r => r.stage === 4);
    expect(rule4?.status).toBe('ACTIVE');
    expect(rule4?.resolvedValue).toContain('630 nm (Melatonin Safe Red)');

    component.toggleNightLock();
    fixture.detectChanges();

    expect(component.nightLock()).toBe(false);
    rule4 = component.arbitrationRules().find(r => r.stage === 4);
    expect(rule4?.status).toBe('BYPASSED');
    expect(rule4?.resolvedValue).toContain('470 nm (Cyan Blue Active)');
  });

  it('5. Verifies FHIR R4 Bundle Validation is present at stage 5', () => {
    const rule5 = component.arbitrationRules().find(r => r.stage === 5);
    expect(rule5?.status).toBe('PASSED');
    expect(rule5?.resolvedValue).toBe('FHIR R4 Bundle Validated');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('FHIR R4 Bundle Standard:');
    expect(el.textContent).toContain('100% Compliant');
  });
});
