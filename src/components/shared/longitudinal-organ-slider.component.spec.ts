import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LongitudinalOrganSliderComponent } from './longitudinal-organ-slider.component';
import { ILongitudinal3dConfig } from '../../services/wordpress-articles.service';

describe('LongitudinalOrganSliderComponent', () => {
  let component: LongitudinalOrganSliderComponent;
  let fixture: ComponentFixture<LongitudinalOrganSliderComponent>;

  const mockConfig: ILongitudinal3dConfig = {
    targetOrgan: 'kidneys',
    organTitle: 'Renal Glomerular Filtration & Podocyte Architecture',
    stages: [
      {
        stepIndex: 0,
        timepointLabel: 'Day 0 (Hypertensive Strain)',
        organState: 'Glomerular Hyperfiltration & Early Podocyte Stress',
        pathologyScore: 62,
        biomarkerMetric: 'BP 146/92 / uACR 98 mg/g',
        tissueHealthPercent: 58,
        interventionGlowColor: '#f59e0b',
        unmitigatedGlowColor: '#ef4444',
        interventionSummary: 'Initiate daily home BP checks, reduce ultra-processed sodium, and test uACR.',
        unmitigatedSummary: 'Intraglomerular hypertension progressively tears fragile podocyte slit diaphragms.'
      },
      {
        stepIndex: 1,
        timepointLabel: 'Month 6 (Pressure Normalization)',
        organState: 'Arteriolar Tone Restored & Podocyte Stabilization',
        pathologyScore: 28,
        biomarkerMetric: 'BP 118/76 / uACR 22 mg/g',
        tissueHealthPercent: 82,
        interventionGlowColor: '#10b981',
        unmitigatedGlowColor: '#ea580c',
        interventionSummary: 'Hydraulic pressure normalized; microalbumin leakage dramatically reversed.',
        unmitigatedSummary: 'Persistent glomerular sclerosis causes permanent loss of functional nephrons.'
      },
      {
        stepIndex: 2,
        timepointLabel: 'Year 20 (Dialysis-Free Longevity)',
        organState: 'Optimal Renal Reserve & Lifetime Autonomy',
        pathologyScore: 4,
        biomarkerMetric: 'eGFR 78 mL/min / $1.2M Saved',
        tissueHealthPercent: 96,
        interventionGlowColor: '#047857',
        unmitigatedGlowColor: '#991b1b',
        interventionSummary: 'Avoided dialysis completely; independent living and active vitality maintained.',
        unmitigatedSummary: 'End-Stage Renal Disease requiring 3x/week dialysis or kidney transplant.'
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LongitudinalOrganSliderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LongitudinalOrganSliderComponent);
    component = fixture.componentInstance;
    component.config = mockConfig;
    fixture.detectChanges();
  });

  it('1. Initializes with Day 0 stage and active organ config', () => {
    expect(component.stages().length).toBe(3);
    expect(component.activeStageIndex()).toBe(0);
    expect(component.activeStage()?.organState).toContain('Glomerular Hyperfiltration');
    expect(component.activeColor()).toBe('#f59e0b');
  });

  it('2. Transitions stage index and calculates comparative pathology scores', () => {
    component.setStageIndex(1);
    fixture.detectChanges();
    expect(component.activeStageIndex()).toBe(1);
    expect(component.activeStage()?.biomarkerMetric).toBe('BP 118/76 / uACR 22 mg/g');
    expect(component.activeColor()).toBe('#10b981');
  });

  it('3. Switches between intervention and unmitigated comparison tracks', () => {
    component.comparisonMode.set('unmitigated');
    fixture.detectChanges();
    expect(component.comparisonMode()).toBe('unmitigated');
    expect(component.activeColor()).toBe('#ef4444');
  });
});
