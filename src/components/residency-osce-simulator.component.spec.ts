import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResidencyOsceSimulatorComponent } from './residency-osce-simulator.component';
import { OsceTrainerService } from '../services/osce-trainer.service';

describe('ResidencyOsceSimulatorComponent', () => {
  let component: ResidencyOsceSimulatorComponent;
  let fixture: ComponentFixture<ResidencyOsceSimulatorComponent>;
  let osceService: OsceTrainerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidencyOsceSimulatorComponent],
      providers: [OsceTrainerService]
    }).compileComponents();

    fixture = TestBed.createComponent(ResidencyOsceSimulatorComponent);
    component = fixture.componentInstance;
    osceService = TestBed.inject(OsceTrainerService);
    fixture.detectChanges();
  });

  it('1. Initializes and displays OSCE Examination Trainer header and scenarios', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Residency & Medical Student OSCE Examination Trainer');
    expect(el.textContent).toContain('AMA PRA Category 1 CME Accredited');
    expect(component.osce.scenarios().length).toBeGreaterThan(0);
  });

  it('2. Renders active clinical vignette details and vitals', () => {
    const active = component.osce.selectedScenario();
    expect(active).toBeDefined();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(active.title);
    expect(el.textContent).toContain(active.difficulty);
    expect(el.textContent).toContain(active.vitals.hr);
    expect(el.textContent).toContain(active.vitals.bp);
  });

  it('3. Switches clinical scenario when selecting a different tab', () => {
    const scenarios = component.osce.scenarios();
    if (scenarios.length > 1) {
      component.osce.selectScenario(scenarios[1].id);
      fixture.detectChanges();

      expect(component.osce.activeScenarioId()).toBe(scenarios[1].id);
      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain(scenarios[1].title);
    }
  });

  it('4. Submits candidate clinical decision attempt and displays AI Examiner scorecard', () => {
    expect(component.osce.evaluationResult()).toBeNull();

    component.candidateDiagnosis.set('Generalized Stage II Periodontitis');
    component.candidateOrders.set('Periodontal scaling & root planing (SRP), hs-CRP repeat panel');
    component.submitAttempt();
    fixture.detectChanges();

    const result = component.osce.evaluationResult();
    expect(result).toBeTruthy();
    expect(result?.overallScore).toBeGreaterThan(0);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('AI Board Examiner Scorecard');
    expect(el.textContent).toContain('Diagnostic Accuracy');
    expect(el.textContent).toContain('Patient Safety');
  });

  it('5. Evaluates matching diagnoses and orders appropriately', () => {
    component.candidateDiagnosis.set('Stage II Periodontitis');
    component.candidateOrders.set('Periodontal scaling & root planing (SRP)');
    component.submitAttempt();
    fixture.detectChanges();

    const result = component.osce.evaluationResult();
    expect(result?.matchedDiagnoses.length).toBeGreaterThan(0);
    expect(result?.matchedOrders.length).toBeGreaterThan(0);
  });
});
