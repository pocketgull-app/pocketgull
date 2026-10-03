import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HandoffModalComponent, SPECIALTY_PROFILES } from './handoff-modal.component';
import { PatientStateService } from '../../services/patient-state.service';
import { signal } from '@angular/core';

describe('HandoffModalComponent', () => {
  let component: HandoffModalComponent;
  let fixture: ComponentFixture<HandoffModalComponent>;
  let mockPatientState: any;

  beforeEach(async () => {
    mockPatientState = {
      generateExpandedShareUrl: vi.fn().mockReturnValue('https://pocketgull.app/share?state=enc_xyz123'),
      selectedIssues: signal(['lumbar_spine', 'cervical_spine']),
      activePhilosophy: signal<'western' | 'eastern' | 'ayurvedic'>('western'),
      selectPhilosophy: vi.fn((p: 'western' | 'eastern' | 'ayurvedic') => {
        mockPatientState.activePhilosophy.set(p);
      }),
      reasonForVisit: signal('Chronic multi-level spinal radiculopathy'),
      patientGoals: signal('Restore pain-free ambulation')
    };

    // Mock clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined)
      },
      writable: true,
      configurable: true
    });

    await TestBed.configureTestingModule({
      imports: [HandoffModalComponent],
      providers: [
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HandoffModalComponent);
    component = fixture.componentInstance;
    (component as any).isOpen = signal(true);
    fixture.detectChanges();
  });

  it('1. Initializes with default specialty profile and computed telemetry', () => {
    expect(component).toBeTruthy();
    expect(component.specialtyProfiles.length).toBe(6);
    expect(component.selectedSpecialty().id).toBe('do_osteopathic');
    expect(component.issueCount()).toBe(2);
    expect(component.activeParadigmLabel()).toBe('Western Allopathic Paradigm');
    expect(component.shareUrl()).toBe('https://pocketgull.app/share?state=enc_xyz123');
  });

  it('2. Emits close output when closeModal is invoked', () => {
    const closeSpy = vi.fn();
    component.close.subscribe(closeSpy);

    component.closeModal();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('3. Selects specialty profile and updates philosophy automatically', () => {
    const tcmProfile = SPECIALTY_PROFILES.find(p => p.id === 'tcm_herbalist')!;
    component.selectSpecialty(tcmProfile);

    expect(component.selectedSpecialty().id).toBe('tcm_herbalist');
    expect(mockPatientState.selectPhilosophy).toHaveBeenCalledWith('eastern');
    expect(component.activeParadigmLabel()).toBe('Eastern TCM Paradigm');

    const ayurvedicProfile = SPECIALTY_PROFILES.find(p => p.id === 'ayurvedic_vaidya')!;
    component.selectSpecialty(ayurvedicProfile);

    expect(component.selectedSpecialty().id).toBe('ayurvedic_vaidya');
    expect(mockPatientState.selectPhilosophy).toHaveBeenCalledWith('ayurvedic');
    expect(component.activeParadigmLabel()).toBe('Ayurvedic Medicine Paradigm');
  });

  it('4. Toggles specialty card 3D flip between clinical and patient literacy faces', () => {
    const specId = 'gastroenterology';
    expect(component.isSpecialtyFlipped(specId)).toBe(false);

    component.toggleSpecialtyFlip(specId);
    expect(component.isSpecialtyFlipped(specId)).toBe(true);

    // Wait past debounce threshold
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 500);
    component.toggleSpecialtyFlip(specId);
    expect(component.isSpecialtyFlipped(specId)).toBe(false);
  });

  it('5. Copies expanded share URL to clipboard', async () => {
    component.copyShareUrl();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://pocketgull.app/share?state=enc_xyz123');
    await Promise.resolve();
    expect(component.copied()).toBe(true);
  });

  it('6. Formats and copies clinician SBAR referral note to clipboard', async () => {
    component.copySbarNote();

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    const copiedText = (navigator.clipboard.writeText as any).mock.calls.at(-1)[0];
    expect(copiedText).toContain('[CLINICIAN SPECIALIST REFERRAL NOTE — SBAR FORMAT]');
    expect(copiedText).toContain('Target Specialist: Neuromusculoskeletal & Somatic DO');
    expect(copiedText).toContain('Chronic multi-level spinal radiculopathy');
    expect(copiedText).toContain('2 region(s) selected');
    expect(copiedText).toContain('https://pocketgull.app/share?state=enc_xyz123');

    await Promise.resolve();
    expect(component.sbarCopied()).toBe(true);
  });
});
