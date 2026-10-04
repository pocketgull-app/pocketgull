import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DictationModalComponent } from './dictation-modal.component';
import { DictationService } from '../../services/dictation.service';

describe('DictationModalComponent', () => {
  let component: DictationModalComponent;
  let fixture: ComponentFixture<DictationModalComponent>;
  let dictationService: DictationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DictationModalComponent],
      providers: [DictationService]
    }).compileComponents();

    dictationService = TestBed.inject(DictationService);
    // Open modal before creating component so effect runs
    dictationService.isModalOpen.set(true);
    dictationService.initialText.set('Pre-existing clinical note.');

    fixture = TestBed.createComponent(DictationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    dictationService.isModalOpen.set(false);
  });

  it('1. Initializes and renders modal dialog when isModalOpen is true', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Voice Dictation');
    expect(el.querySelector('pocket-gull-input')).toBeTruthy();
  });

  it('2. Initializes with initialText from DictationService', () => {
    expect(component.currentText()).toBe('Pre-existing clinical note.');
  });

  it('3. Updates text manually through updateTextManual', () => {
    component.updateTextManual('Updated clinical observation text.');
    expect(component.currentText()).toBe('Updated clinical observation text.');
  });

  it('4. Toggles listening state via DictationService start/stop recognition', () => {
    const startSpy = vi.spyOn(dictationService, 'startRecognition');
    const stopSpy = vi.spyOn(dictationService, 'stopRecognition');

    dictationService.isListening.set(true);
    component.toggleListening();
    expect(stopSpy).toHaveBeenCalled();

    dictationService.isListening.set(false);
    component.toggleListening();
    expect(startSpy).toHaveBeenCalled();
  });

  it('5. Invokes accept and cancel on DictationService', () => {
    const cancelSpy = vi.spyOn(dictationService, 'cancel');
    const acceptSpy = vi.spyOn(dictationService, 'accept');

    component.cancel();
    expect(cancelSpy).toHaveBeenCalled();

    component.updateTextManual('Final confirmed dictate.');
    component.accept();
    expect(acceptSpy).toHaveBeenCalledWith('Final confirmed dictate.');
  });

  it('6. Renders Edge Primacy badge in modal header', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Edge Primacy');
    expect(el.textContent).toContain('$0 Egress');
  });

  it('7. Invokes polishWithEdge and updates currentText with formatted note', async () => {
    const polishSpy = vi.spyOn(dictationService, 'polishTranscriptWithEdge').mockResolvedValue({
      id: 'tx_123',
      originalRawText: 'bp 120 80 lisinopril 10 mg',
      polishedText: 'SUBJECTIVE: Patient stable. BP 120/80. Plan: lisinopril 10 mg.',
      targetFormat: 'SOAP',
      acuity: 'ROUTINE',
      engineUsed: 'LOCAL_DETERMINISTIC_FALLBACK',
      executionDurationMs: 15,
      estimatedTokensSaved: 40,
      estimatedCostSavedUsd: 0.00003,
      ismpSafetyAudit: {
        originalText: 'bp 120 80 lisinopril 10 mg',
        sanitizedText: 'bp 120 80 lisinopril 10 mg',
        hasViolations: false,
        violations: [],
        tallManApplied: [],
        isSafe: true
      },
      timestamp: new Date().toISOString()
    });

    component.currentText.set('bp 120 80 lisinopril 10 mg');
    await component.polishWithEdge();
    fixture.detectChanges();

    expect(polishSpy).toHaveBeenCalled();
    expect(component.currentText()).toContain('SUBJECTIVE: Patient stable. BP 120/80');
    expect(component.lastPolishResult()).not.toBeNull();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Edge Formatted');
    expect(el.textContent).toContain('Saved 40 tokens');
  });
});
