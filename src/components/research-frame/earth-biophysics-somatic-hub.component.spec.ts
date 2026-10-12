import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EarthBiophysicsSomaticHubComponent } from './earth-biophysics-somatic-hub.component';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('EarthBiophysicsSomaticHubComponent', () => {
  let component: EarthBiophysicsSomaticHubComponent;
  let fixture: ComponentFixture<EarthBiophysicsSomaticHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EarthBiophysicsSomaticHubComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EarthBiophysicsSomaticHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('1. Initializes successfully with default bioelectric lens', () => {
    expect(component).toBeTruthy();
    expect(component.activeLens()).toBe('bioelectric');
  });

  it('2. Computes Goldman-Hodgkin-Katz membrane voltage and phenotypes correctly', () => {
    // Default: -70 mV
    expect(component.ghkVoltageMv()).toBeLessThan(-60);
    expect(component.cellStateClassification().title).toContain('Differentiated & Polarized');

    // Shift voltage to regenerative
    component.membraneVoltageMv.set(-50);
    expect(component.cellStateClassification().title).toContain('Plastic & Regenerative');

    // Shift voltage to depolarized
    component.membraneVoltageMv.set(-25);
    expect(component.cellStateClassification().title).toContain('Depolarized & Proliferative');
  });

  it('3. Computes photobiology near-infrared and melatonin metrics across solar profiles', () => {
    component.selectedSolarCondition.set('golden_hour');
    const goldenMetrics = component.photobiologyMetrics();
    expect(goldenMetrics.nirPercent).toBe(58);
    expect(goldenMetrics.mitochondrialMelatoninYieldPercent).toBe(98);

    component.selectedSolarCondition.set('indoor_led');
    const ledMetrics = component.photobiologyMetrics();
    expect(ledMetrics.nirPercent).toBe(2);
    expect(ledMetrics.ccoActivationLevel).toContain('Near-Zero');
  });

  it('4. Computes Ergothioneine OCTN1 transporter Michaelis-Menten saturation', () => {
    component.ergoIntakeMg.set(0);
    expect(component.octn1SaturationPercent()).toBe(0);

    // At Km = 4.2 mg, saturation should be exactly 50%
    component.ergoIntakeMg.set(4.2);
    expect(Math.round(component.octn1SaturationPercent())).toBe(50);

    // At 20 mg, saturation should be > 80%
    component.ergoIntakeMg.set(20);
    expect(component.octn1SaturationPercent()).toBeGreaterThan(80);
  });

  it('5. Toggles 0.1 Hz Mayer wave parasympathetic pacer and cycles phases', () => {
    expect(component.isPacerRunning()).toBe(false);
    expect(component.pacerPhase()).toBe('inhale');

    component.togglePacer();
    expect(component.isPacerRunning()).toBe(true);

    component.pacerSecond.set(2);
    expect(component.pacerPhase()).toBe('inhale');

    component.pacerSecond.set(5);
    expect(component.pacerPhase()).toBe('exhale');

    component.togglePacer();
    expect(component.isPacerRunning()).toBe(false);
  });

  it('6. Enforces PocketShoal direct curves and zero pill language (all rounded-full have status-dot)', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const roundedFullElements = compiled.querySelectorAll('.rounded-full');
    roundedFullElements.forEach((el) => {
      expect(el.classList.contains('status-dot')).toBe(true);
    });
  });

  it('7. Renders the mandatory epistemic demarcation badge "Exploratory In Silico Model • Non-Diagnostic"', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Exploratory In Silico Model • Non-Diagnostic');
  });
});
