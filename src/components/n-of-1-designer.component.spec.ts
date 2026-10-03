import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NOf1DesignerComponent } from './n-of-1-designer.component';
import { NOf1EngineService } from '../services/n-of-1-engine.service';
import { PatientStateService } from '../services/patient-state.service';
import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';

describe('NOf1DesignerComponent', () => {
  let component: NOf1DesignerComponent;
  let fixture: ComponentFixture<NOf1DesignerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NOf1DesignerComponent],
      providers: [
        NOf1EngineService,
        PatientStateService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock CDS response'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NOf1DesignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders N-of-1 experiment designer header and crossover tag', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('N-of-1 Clinical Experiment Designer');
    expect(el.textContent).toContain('ABAB Crossover Reversal');
    expect(el.textContent).toContain('Bayesian Superiority');
    expect(el.textContent).toContain("Cohen's d Effect Size");
  });

  it('2. Computes and renders default patient trial with hypothesis', () => {
    const trial = component.trial();
    expect(trial).toBeDefined();
    expect(trial.hypothesis).toBeTruthy();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Trial Hypothesis:');
    expect(el.textContent).toContain(trial.hypothesis);
  });

  it('3. Renders 4-phase ABAB timeline with baseline, intervention, and washout phases', () => {
    const trial = component.trial();
    expect(trial.phases.length).toBeGreaterThanOrEqual(4);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('56-Day Crossover Timeline & Washout Schedule');
    expect(el.textContent).toContain('BASELINE');
    expect(el.textContent).toContain('INTERVENTION');
    expect(el.textContent).toContain('WASHOUT');
  });

  it('4. Renders statistical verification and clinical conclusion banner', () => {
    const trial = component.trial();
    expect(trial.results.length).toBeGreaterThan(0);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Empirical Statistical Verification');
    expect(el.textContent).toContain('Null Hypothesis Falsified');
    expect(el.textContent).toContain(trial.results[0].clinicalConclusion);
  });

  it('5. Computes current patient demographics from patient state or fallback', () => {
    const patient = component.currentPatient();
    expect(patient.id).toBeDefined();
    expect(patient.vitals).toBeDefined();
    expect(patient.preexistingConditions.length).toBeGreaterThan(0);
  });
});
