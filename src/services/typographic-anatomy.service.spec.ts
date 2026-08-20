import { TestBed } from '@angular/core/testing';
import { TypographicAnatomyService } from './typographic-anatomy.service';
import { PatientStateService } from './patient-state.service';

describe('TypographicAnatomyService', () => {
  let service: TypographicAnatomyService;
  let patientState: PatientStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TypographicAnatomyService, PatientStateService]
    });
    service = TestBed.inject(TypographicAnatomyService);
    patientState = TestBed.inject(PatientStateService);
  });

  it('should be created and contain comprehensive anatomical taxonomy', () => {
    expect(service).toBeTruthy();
    expect(service.parts.length).toBeGreaterThanOrEqual(20);
  });

  it('should provide multilingual labels for anatomical parts', () => {
    const heart = service.parts.find(p => p.id === 'heart')!;
    expect(heart).toBeTruthy();

    service.languageMode.set('latin');
    expect(service.getLabelForPart(heart)).toContain('COR');

    service.languageMode.set('english');
    expect(service.getLabelForPart(heart)).toContain('HEART');

    service.languageMode.set('japanese');
    expect(service.getLabelForPart(heart)).toContain('心臓');

    service.languageMode.set('chinese');
    expect(service.getLabelForPart(heart)).toContain('心脏');

    service.languageMode.set('sanskrit');
    expect(service.getLabelForPart(heart)).toContain('हृदयम्');
  });

  it('should cycle languages smoothly', () => {
    service.languageMode.set('latin');
    service.cycleLanguage();
    expect(service.languageMode()).toBe('english');
    service.cycleLanguage();
    expect(service.languageMode()).toBe('japanese');
  });

  it('should detect alerted parts when matching patient reasonForVisit is present', () => {
    const heart = service.parts.find(p => p.id === 'heart')!;
    expect(service.isPartAlerted(heart)).toBe(false);

    patientState.reasonForVisit.set('Acute chest pain radiating to left shoulder');
    expect(service.isPartAlerted(heart)).toBe(true);

    const lungs = service.parts.find(p => p.id === 'lung_left')!;
    expect(service.isPartAlerted(lungs)).toBe(false);

    patientState.reasonForVisit.set('Shortness of breath on exertion');
    expect(service.isPartAlerted(lungs)).toBe(true);
  });

  it('should detect alerted parts when issues or aiAnomalyHighlights are present', () => {
    const spine = service.parts.find(p => p.id === 'spine_lumbar')!;
    expect(service.isPartAlerted(spine)).toBe(false);

    patientState.aiAnomalyHighlights.set({ spine_lumbar: 'critical' });
    expect(service.isPartAlerted(spine)).toBe(true);

    const liver = service.parts.find(p => p.id === 'liver')!;
    expect(service.isPartAlerted(liver)).toBe(false);

    patientState.issues.set({
      liver: [{ id: 'liver', noteId: 'note-1', name: 'Hepatic Pain', painLevel: 6, description: 'Elevated ALT', symptoms: ['Elevated ALT'] }]
    });
    expect(service.isPartAlerted(liver)).toBe(true);
  });
});
