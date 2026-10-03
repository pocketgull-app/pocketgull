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
});
