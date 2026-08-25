import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClinicalMandarinateExamCardComponent } from './clinical-mandarinate-exam-card.component';
import { ClinicalMandarinateExamService } from '../../services/clinical-mandarinate-exam.service';

describe('ClinicalMandarinateExamCardComponent Unit Suite', () => {
  let fixture: ComponentFixture<ClinicalMandarinateExamCardComponent>;
  let component: ClinicalMandarinateExamCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicalMandarinateExamCardComponent],
      providers: [ClinicalMandarinateExamService]
    }).compileComponents();

    fixture = TestBed.createComponent(ClinicalMandarinateExamCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Renders Mandarinate Exam Arena header and active case vignette', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Clinical AI "Mandarinate" Examination & OSCE Arena');
    expect(compiled.textContent).toContain('Acute Anterior STEMI vs Takotsubo');
    expect(compiled.textContent).toContain('Admission Vitals');
  });

  it('2. Switches case tabs smoothly to Neurology stroke case', () => {
    component.selectCase('CASE-NEURO-02');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Acute Ischemic Stroke vs Hemiplegic Migraine');
    expect(compiled.textContent).toContain('Apixaban');
  });

  it('3. Runs automated benchmark and displays evaluation score radar and certificate', () => {
    component.runAutomatedBenchmark();
    fixture.detectChanges();

    const result = component.latestResult();
    expect(result).toBeTruthy();
    expect(result?.isPassed).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('PASSED (DISTINCTION)');
    expect(compiled.textContent).toContain('Diagnostic Precision');
    expect(compiled.textContent).toContain('Harm Avoidance');
    expect(compiled.textContent).toContain('Certificate SHA');
  });
});
