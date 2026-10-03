import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VagalBiofeedbackDockComponent } from './vagal-biofeedback-dock.component';
import { PatientStateService } from '../services/patient-state.service';
import { BioHapticFeedbackService } from '../services/hardware/bio-haptic-feedback.service';
import { signal } from '@angular/core';

describe('VagalBiofeedbackDockComponent', () => {
  let component: VagalBiofeedbackDockComponent;
  let fixture: ComponentFixture<VagalBiofeedbackDockComponent>;
  let mockPatientState: any;
  let mockBioHaptic: any;
  let alertSpy: any;

  beforeEach(async () => {
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    mockPatientState = {
      vitals: signal({ hr: '72', bp: '120/80' }),
      addClinicalNote: vi.fn()
    };

    mockBioHaptic = {
      playSolfeggioTone: vi.fn(),
      triggerHapticPulse: vi.fn(),
      triggerDualPulse: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [VagalBiofeedbackDockComponent],
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: BioHapticFeedbackService, useValue: mockBioHaptic }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VagalBiofeedbackDockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('1. Initializes with default session count and unflipped card states', () => {
    expect(component).toBeTruthy();
    expect(component.sessionCount()).toBe(2);
    expect(component.isCardFlipped('breathing')).toBe(false);
  });

  it('2. Toggles 3D card flips with debounce protection', () => {
    component.toggleCardFlip('breathing');
    expect(component.isCardFlipped('breathing')).toBe(true);

    // Debounced immediate second toggle
    component.toggleCardFlip('breathing');
    expect(component.isCardFlipped('breathing')).toBe(true);

    // After debounce interval
    vi.setSystemTime(Date.now() + 300);
    component.toggleCardFlip('breathing');
    expect(component.isCardFlipped('breathing')).toBe(false);
  });

  it('3. Logs 5-min resonant breathing session, plays 528Hz Solfeggio tone, and adds clinical note', () => {
    component.logBreathingSession();

    expect(component.sessionCount()).toBe(3);
    expect(mockBioHaptic.playSolfeggioTone).toHaveBeenCalledWith(528, 2500);
    expect(mockBioHaptic.triggerHapticPulse).toHaveBeenCalledWith('exhale');
    expect(mockPatientState.addClinicalNote).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceLens: 'Functional Protocols',
        text: expect.stringContaining('0.1 Hz Resonant Vagal Breathing')
      })
    );
    expect(alertSpy).toHaveBeenCalled();
  });

  it('4. Logs HRV coherence check-in, plays 432Hz tone, and triggers dual pulse', () => {
    component.logHrvCoherence();

    expect(component.sessionCount()).toBe(3);
    expect(mockBioHaptic.playSolfeggioTone).toHaveBeenCalledWith(432, 2000);
    expect(mockBioHaptic.triggerDualPulse).toHaveBeenCalled();
    expect(mockPatientState.addClinicalNote).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceLens: 'Functional Protocols',
        text: expect.stringContaining('High HRV Coherence')
      })
    );
    expect(alertSpy).toHaveBeenCalled();
  });

  it('5. Logs elixir tea ingestion and publishes clinical note to patient chart', () => {
    component.logElixirTea();

    expect(component.sessionCount()).toBe(3);
    expect(mockPatientState.addClinicalNote).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceLens: 'Nutrition',
        text: expect.stringContaining('Warm Ginger Jujube Tea')
      })
    );
    expect(alertSpy).toHaveBeenCalled();
  });

  it('6. Publishes free-form micro-observation to patient chart and skips empty strings', () => {
    component.publishClinicalNote('');
    expect(mockPatientState.addClinicalNote).not.toHaveBeenCalled();

    component.publishClinicalNote('   ');
    expect(mockPatientState.addClinicalNote).not.toHaveBeenCalled();

    component.publishClinicalNote('Patient reports improved sleep latency and zero palpitations.');
    expect(mockPatientState.addClinicalNote).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceLens: 'General Overview',
        text: 'Patient reports improved sleep latency and zero palpitations.'
      })
    );
    expect(alertSpy).toHaveBeenCalled();
  });
});
