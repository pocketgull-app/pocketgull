import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmbientClinicalScribeComponent } from './ambient-clinical-scribe.component';
import { AmbientClinicalScribeService } from '../services/ambient-clinical-scribe.service';
import { PatientStateService } from '../services/patient-state.service';

describe('AmbientClinicalScribeComponent', () => {
  let component: AmbientClinicalScribeComponent;
  let fixture: ComponentFixture<AmbientClinicalScribeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmbientClinicalScribeComponent],
      providers: [AmbientClinicalScribeService, PatientStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(AmbientClinicalScribeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders Ambient Clinical Scribe header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Ambient Clinical Scribe & SOAP Engine');
    expect(el.textContent).toContain('ICD-10 & SNOMED Auto-Coder');
  });

  it('2. Toggles recording state via toggleRecording()', () => {
    expect(component.isListening()).toBe(false);
    component.toggleRecording();
    fixture.detectChanges();
    expect(component.isListening()).toBe(true);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Stop Scribe');

    component.toggleRecording();
    fixture.detectChanges();
    expect(component.isListening()).toBe(false);
  });

  it('3. Generates structured SOAP note from initial live transcript', () => {
    const soap = component.soapNote();
    expect(soap).toBeDefined();
    expect(soap.subjective.chiefComplaint).toBeDefined();
    expect(soap.objective.vitalSigns).toBeDefined();
    expect(soap.assessment.primaryDiagnosis).toBeDefined();
    expect(soap.plan.followUpInterval).toBeDefined();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Subjective');
    expect(el.textContent).toContain('Objective');
    expect(el.textContent).toContain('Assessment');
    expect(el.textContent).toContain('Plan');
  });

  it('4. Updates SOAP note reactively when live transcript changes', () => {
    component.liveTranscript.set('Patient reports severe knee pain after running a marathon. No swelling noted.');
    fixture.detectChanges();

    const soap = component.soapNote();
    expect(soap.rawTranscript).toContain('knee pain');
  });

  it('5. Renders physical exam findings and vitals in objective section', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('BP:');
    expect(el.textContent).toContain('HR:');
    expect(el.textContent).toContain('SpO2:');
  });
});
