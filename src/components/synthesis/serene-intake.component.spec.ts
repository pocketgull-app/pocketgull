import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SereneIntakeComponent } from './serene-intake.component';
import { AdaptiveIntakeService } from '../../services/adaptive-intake.service';
import { PatientStateService } from '../../services/patient-state.service';
import { ThemeService } from '../../services/theme.service';
import { SnomedIcdCrosswalkService } from '../../services/snomed-icd-crosswalk.service';

describe('SereneIntakeComponent Suite', () => {
  let component: SereneIntakeComponent;
  let fixture: ComponentFixture<SereneIntakeComponent>;
  let patientState: PatientStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SereneIntakeComponent],
      providers: [
        AdaptiveIntakeService,
        PatientStateService,
        ThemeService,
        SnomedIcdCrosswalkService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SereneIntakeComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);
    fixture.detectChanges();
  });

  it('1. Initializes component cleanly', () => {
    expect(component).toBeTruthy();
    expect(component.inputText()).toBe('');
    expect(component.analysisResult()).toBeNull();
  });

  it('2. Analyzes preset narrative upon selection', () => {
    const preset = component.presets[0]; // Tech Executive & Ergonomic Strain
    component.applyPreset(preset);

    expect(component.inputText()).toBe(preset.narrative);
    const result = component.analysisResult();
    expect(result).toBeDefined();
    expect(result?.extractedEntities.length).toBeGreaterThan(0);
    expect(result?.socraticQuestions.length).toBeGreaterThan(0);
    expect(result?.doctorQuestions.length).toBeGreaterThan(0);
  });

  it('3. Selects quick Socratic answer and updates narrative', () => {
    component.applyPreset(component.presets[0]);
    const result = component.analysisResult();
    expect(result).toBeDefined();

    const firstQ = result!.socraticQuestions[0];
    const quickAnswer = firstQ.quickOptions ? firstQ.quickOptions[0] : 'Deep work & coding focus';

    component.selectQuickAnswer(firstQ, quickAnswer);

    expect(firstQ.answeredValue).toBe(quickAnswer);
    expect(component.inputText()).toContain(quickAnswer);
  });

  it('4. Clears input and resets analysis state', () => {
    component.applyPreset(component.presets[0]);
    expect(component.inputText().length).toBeGreaterThan(0);

    component.clearInput();
    expect(component.inputText()).toBe('');
    expect(component.analysisResult()).toBeNull();
  });

  it('5. Applies intake analysis to care plan and flags isApplied true', () => {
    component.applyPreset(component.presets[0]);
    const result = component.analysisResult();
    expect(result).toBeDefined();

    component.applyToCarePlan(result!);
    expect(component.isApplied()).toBe(true);

    const notes = patientState.clinicalNotes();
    expect(notes.length).toBeGreaterThan(0);
  });
});
