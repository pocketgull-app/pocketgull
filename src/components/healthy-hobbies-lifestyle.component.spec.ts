import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { HealthyHobbiesLifestyleComponent, IHealthyHobbyOption } from './healthy-hobbies-lifestyle.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { PlainLanguageGlossaryService } from '../services/plain-language-glossary.service';
import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';

describe('HealthyHobbiesLifestyleComponent Unit Suite', () => {
  let component: HealthyHobbiesLifestyleComponent;
  let patientState: PatientStateService;
  let patientMgmt: PatientManagementService;
  let plainLang: PlainLanguageGlossaryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthyHobbiesLifestyleComponent],
      providers: [
        PatientStateService,
        PatientManagementService,
        PlainLanguageGlossaryService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock clinical synthesis')
          }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(HealthyHobbiesLifestyleComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);
    patientMgmt = TestBed.inject(PatientManagementService);
    plainLang = TestBed.inject(PlainLanguageGlossaryService);
  });

  it('1. Instantiates successfully with default state', () => {
    expect(component).toBeTruthy();
    expect(component.isPlainLanguage()).toBe(true);
    expect(component.selectedHobbyId()).toBe('outdoor_cycling');
    expect(component.hobbyOptions().length).toBeGreaterThan(0);
  });

  it('2. Computes default active patient name and hobby options', () => {
    expect(component.activePatientName()).toBeDefined();
    const options = component.hobbyOptions();
    expect(options.some(h => h.id === 'outdoor_cycling')).toBe(true);
  });

  it('3. Adapts hobby options when a specific patient is selected', () => {
    patientMgmt.selectPatient('p_mara_santos');
    const options = component.hobbyOptions();
    expect(options.length).toBeGreaterThan(0);
    expect(options.some(h => h.id === 'hydro_pilates')).toBe(true);
  });

  it('4. Toggles between plain language and clinical rationale modes', () => {
    component.isPlainLanguage.set(false);
    expect(component.isPlainLanguage()).toBe(false);

    component.isPlainLanguage.set(true);
    expect(component.isPlainLanguage()).toBe(true);
  });

  it('5. Prescribes a hobby to patient goals and clinical notes', () => {
    const hobby: IHealthyHobbyOption = component.hobbyOptions()[0];
    const dummyEvent = new MouseEvent('click');
    const updateSpy = vi.spyOn(patientState, 'updateGoals');
    const noteSpy = vi.spyOn(patientState, 'addClinicalNote');

    component.prescribeHobby(hobby, dummyEvent);
    expect(updateSpy).toHaveBeenCalled();
    expect(noteSpy).toHaveBeenCalled();
    expect(component.toastMessage()).toContain(hobby.title);
  });

  it('6. Triggers read aloud via PlainLanguageGlossaryService', () => {
    const speakSpy = vi.spyOn(plainLang, 'speakPlainLanguageSummary');
    vi.spyOn(plainLang, 'isSpeaking').mockReturnValue(false);

    const dummyEvent = new MouseEvent('click');
    component.readAloud('Prescribed cycling for cardiovascular health', dummyEvent);
    expect(speakSpy).toHaveBeenCalledWith('Prescribed cycling for cardiovascular health');
  });
});
