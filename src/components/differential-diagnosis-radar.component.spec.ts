import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DifferentialDiagnosisRadarComponent } from './differential-diagnosis-radar.component';
import { DifferentialDiagnosisRadarService } from '../services/differential-diagnosis-radar.service';
import { PatientStateService } from '../services/patient-state.service';

describe('DifferentialDiagnosisRadarComponent', () => {
  let component: DifferentialDiagnosisRadarComponent;
  let fixture: ComponentFixture<DifferentialDiagnosisRadarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DifferentialDiagnosisRadarComponent],
      providers: [DifferentialDiagnosisRadarService, PatientStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(DifferentialDiagnosisRadarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders DxRadar "Don\'t Miss" Differential Engine header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('DxRadar: Socratic "Don\'t Miss" Differential Engine');
    expect(el.textContent).toContain('Bayesian Nomogram');
  });

  it('2. Renders Popperian Epistemological Standard banner', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Popperian Epistemological Standard:');
    expect(el.textContent).toContain(component.report().popperianNullHypothesis);
  });

  it('3. Computes and renders high-acuity secondary differentials with Bayesian meters', () => {
    const diffs = component.report().topCannotMissDifferentials;
    expect(diffs.length).toBeGreaterThan(0);

    const first = diffs[0];
    expect(first.conditionName).toBeTruthy();
    expect(first.preTestProbabilityPct).toBeGreaterThan(0);
    expect(first.likelihoodRatioPositive).toBeGreaterThan(0);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(first.conditionName);
    expect(el.textContent).toContain('Prior P(D)');
    expect(el.textContent).toContain('LR+ Ratio');
    expect(el.textContent).toContain('Posterior P(D|T)');
  });

  it('4. Renders Socratic ruling-out questions and gold-standard rule-out tests', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Socratic Ruling-Out Inquiry:');
    expect(el.textContent).toContain('Gold-Standard Rule-Out Test');
    expect(el.textContent).toContain('Diagnostic Cutoff Threshold');
    expect(el.textContent).toContain('Red Flags:');
  });

  it('5. Renders 1-Click Ruling-Out Laboratory Order Set checklist', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('1-Click Ruling-Out Laboratory Order Set');
    for (const order of component.report().diagnosticActionChecklist) {
      expect(el.textContent).toContain(order);
    }
  });
});
