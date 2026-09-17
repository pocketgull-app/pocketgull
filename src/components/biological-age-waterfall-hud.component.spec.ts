import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BiologicalAgeWaterfallHudComponent } from './biological-age-waterfall-hud.component';
import { ClinicalBiologicalAgeTwinService } from '../services/clinical-biological-age-twin.service';

describe('BiologicalAgeWaterfallHudComponent', () => {
  let component: BiologicalAgeWaterfallHudComponent;
  let fixture: ComponentFixture<BiologicalAgeWaterfallHudComponent>;
  let twinService: ClinicalBiologicalAgeTwinService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiologicalAgeWaterfallHudComponent],
      providers: [ClinicalBiologicalAgeTwinService]
    }).compileComponents();

    fixture = TestBed.createComponent(BiologicalAgeWaterfallHudComponent);
    component = fixture.componentInstance;
    twinService = TestBed.inject(ClinicalBiologicalAgeTwinService);
    twinService.resetToBaseline();
    fixture.detectChanges();
  });

  it('should create the Living Biological Clock & Waterfall HUD component', () => {
    expect(component).toBeTruthy();
  });

  it('should render chronological and biological PhenoAge values', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const telemetryElements = compiled.querySelectorAll('.font-clinical-telemetry');
    expect(telemetryElements.length).toBeGreaterThan(0);

    const bioAge = component.evaluation().biologicalPhenoAge;
    expect(bioAge).toBeGreaterThan(18);
    expect(bioAge).toBeLessThan(100);
  });

  it('should reactively recalculate biological age when biomarker sliders are adjusted', () => {
    const baselineAge = component.evaluation().biologicalPhenoAge;

    // Simulate dragging hs-CRP slider to acute inflammation (8.0 mg/L)
    const crpInput = (fixture.nativeElement.querySelector('#slider-hs-crp') ||
                      fixture.nativeElement.querySelector('input[name="hsCrp"]')) as HTMLInputElement;
    if (crpInput) {
      crpInput.value = '8.0';
      crpInput.dispatchEvent(new Event('input'));
    } else {
      component.onSliderChange('hsCrp', { target: { value: '8.0' } } as unknown as Event);
    }
    fixture.detectChanges();

    const acceleratedAge = component.evaluation().biologicalPhenoAge;
    expect(acceleratedAge).toBeGreaterThan(baselineAge);
    expect(component.biomarkers().hsCrp).toBe(8.0);
  });

  it('should reset all biomarkers to canonical baseline when resetToBaseline() is called', () => {
    // Modify values first
    twinService.updateBiomarker('hsCrp', 5.0);
    twinService.updateBiomarker('glucose', 150);
    fixture.detectChanges();

    expect(component.biomarkers().hsCrp).toBe(5.0);

    // Call reset
    component.resetToBaseline();
    fixture.detectChanges();

    expect(component.biomarkers().hsCrp).toBe(0.8);
    expect(component.biomarkers().glucose).toBe(90);
    expect(component.biomarkers().albumin).toBe(4.5);
  });

  it('should apply intervention presets and compute counterfactual rejuvenation milestones', () => {
    component.applyInterventionPreset('full_longevity');
    fixture.detectChanges();

    expect(component.biomarkers().hsCrp).toBe(0.6);
    expect(component.biomarkers().glucose).toBe(85);
    expect(component.biomarkers().albumin).toBe(4.8);

    const projection = component.counterfactual();
    expect(projection.trajectoryMilestones.length).toBe(3);
    expect(projection.trajectoryMilestones[0].day).toBe(30);
    expect(projection.trajectoryMilestones[1].day).toBe(60);
    expect(projection.trajectoryMilestones[2].day).toBe(90);
    expect(projection.rejuvenationYears).toBeLessThanOrEqual(0);
  });

  it('should accurately calculate normalized bar width for waterfall chart', () => {
    expect(component.calcBarWidth(0)).toBe(0);
    expect(component.calcBarWidth(2.5)).toBe(50);
    expect(component.calcBarWidth(5.0)).toBe(100);
    expect(component.calcBarWidth(-3.0)).toBe(60);
    expect(component.calcBarWidth(10.0)).toBe(100); // capped at 5.0
  });

  it('should handle patient state sync and saveToCarePlan appropriately', () => {
    expect(() => component.syncFromPatient()).not.toThrow();
    expect(() => component.saveToCarePlan()).not.toThrow();
    expect(component.justSavedToPlan()).toBe(true);
  });
});
