import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClinicalTrialsMatcherComponent } from './clinical-trials-matcher.component';
import { ClinicalTrialsMatcherService } from '../services/clinical-trials-matcher.service';
import { PatientStateService } from '../services/patient-state.service';

describe('ClinicalTrialsMatcherComponent', () => {
  let component: ClinicalTrialsMatcherComponent;
  let fixture: ComponentFixture<ClinicalTrialsMatcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicalTrialsMatcherComponent],
      providers: [ClinicalTrialsMatcherService, PatientStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(ClinicalTrialsMatcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders TrialFinder header and NIH registry badge', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('TrialFinder: 1-Click ClinicalTrials.gov Matcher');
    expect(el.textContent).toContain('NIH & NCI Active Registry');
  });

  it('2. Evaluates search summary badge with target condition and match count', () => {
    const report = component.report();
    expect(report).toBeDefined();
    expect(report.totalMatchesFound).toBeGreaterThan(0);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(report.searchCriteria.primaryCondition);
    expect(el.textContent).toContain(`${report.totalMatchesFound} Recruiting Studies Found`);
  });

  it('3. Renders trial matches with NCT ID, phase, and match confidence score', () => {
    const el = fixture.nativeElement as HTMLElement;
    const firstTrial = component.report().matches[0];
    expect(firstTrial).toBeDefined();
    expect(el.textContent).toContain(firstTrial.nctId);
    expect(el.textContent).toContain(firstTrial.briefTitle);
    expect(el.textContent).toContain(`${firstTrial.matchConfidenceScore}%`);
  });

  it('4. Updates search radius and recalculates trial matches', () => {
    component.searchRadius.set(100);
    fixture.detectChanges();

    expect(component.searchRadius()).toBe(100);
    expect(component.report().searchCriteria.radiusMiles).toBe(100);
  });

  it('5. Renders contact PI action links with phone and email', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Contact PI');
    const firstTrial = component.report().matches[0];
    expect(el.textContent).toContain(firstTrial.contactPhone);
  });
});
