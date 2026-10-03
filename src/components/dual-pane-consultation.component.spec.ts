import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DualPaneConsultationComponent } from './dual-pane-consultation.component';
import { PatientStateService } from '../services/patient-state.service';
import { ThemeService } from '../services/theme.service';
import { CompassionateAnalogyService } from '../services/compassionate-analogy.service';

describe('DualPaneConsultationComponent', () => {
  let component: DualPaneConsultationComponent;
  let fixture: ComponentFixture<DualPaneConsultationComponent>;
  let patientState: PatientStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DualPaneConsultationComponent],
      providers: [PatientStateService, ThemeService, CompassionateAnalogyService]
    }).compileComponents();

    fixture = TestBed.createComponent(DualPaneConsultationComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders Dual-Pane Shared Decision Engine header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Dual-Pane Shared Decision Engine');
    expect(el.textContent).toContain('Synchronized Clinician & Patient Consultation');
  });

  it('2. Renders Clinician Technical View on left pane with ICD-10 and SNOMED', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Clinician Technical View (EHR & Trials)');
    expect(el.textContent).toContain('ICD-10 / SNOMED CT');
    expect(component.activeConditions().length).toBeGreaterThan(0);
    expect(component.activeSnomed().code).toBeTruthy();
  });

  it('3. Renders Patient Persona View on right pane with compassionate analogy', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Patient Persona View (Compassionate Translation)');
    expect(el.textContent).toContain('Plain Language Active');
    expect(el.textContent).toContain('Reassurance:');
  });

  it('4. Updates activeConditions when vitals and history change', () => {
    patientState.vitals.update(v => ({
      temp: '98.6',
      weight: '70kg',
      height: '175cm',
      ...v,
      bp: '150/95',
      hr: '98',
      spO2: '97%'
    }));
    fixture.detectChanges();

    const conds = component.activeConditions();
    expect(conds.some(c => c.includes('Essential primary hypertension'))).toBe(true);
    expect(conds.some(c => c.includes('Tachycardia'))).toBe(true);
  });

  it('5. Computes compassionate patient translation greeting and analogies', () => {
    const translation = component.getActiveTranslation();
    expect(translation).toBeDefined();
    expect(translation.greeting).toBeTruthy();
    expect(translation.reassuranceStatement).toBeTruthy();
  });
});
