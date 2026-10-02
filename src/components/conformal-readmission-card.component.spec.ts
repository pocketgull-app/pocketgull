import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConformalReadmissionCardComponent, IParetoInterventionOption } from './conformal-readmission-card.component';
import { PatientStateService } from '../services/patient-state.service';
import { BioHapticFeedbackService } from '../services/hardware/bio-haptic-feedback.service';
import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';

describe('ConformalReadmissionCardComponent', () => {
  let component: ConformalReadmissionCardComponent;
  let fixture: ComponentFixture<ConformalReadmissionCardComponent>;
  let patientState: PatientStateService;
  let bioHapticMock: { playSolfeggioTone: ReturnType<typeof vi.fn>; triggerDualPulse: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    bioHapticMock = {
      playSolfeggioTone: vi.fn(),
      triggerDualPulse: vi.fn()
    };

    vi.spyOn(window, 'alert').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [ConformalReadmissionCardComponent],
      providers: [
        PatientStateService,
        { provide: BioHapticFeedbackService, useValue: bioHapticMock },
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock CDS response'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConformalReadmissionCardComponent);
    component = fixture.componentInstance;
    patientState = TestBed.inject(PatientStateService);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Initializes and renders 30-day conformal risk intervals and guarantee badge', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('30-Day Conformal Readmission Risk & Pareto Trade-Offs');
    expect(el.textContent).toContain('95% Conformal Guarantee');
    expect(el.textContent).toContain('[12% – 38%]');
    expect(el.textContent).toContain('Point Estimate: 24.0%');
  });

  it('2. Computes qSOFA score and status based on vitals', () => {
    // Normal vitals: HR 72, BP 120/80 -> score 0 (Low Risk)
    patientState.vitals.set({ hr: '72', bp: '120/80', spO2: '98%', temp: '98.6', weight: '70', height: '175', rr: '16' } as any);
    fixture.detectChanges();
    expect(component.qSofaScore()).toBe(0);
    expect(component.qSofaStatus()).toBe('Low Risk');

    // Tachycardia (HR > 100) -> score 1
    patientState.vitals.set({ hr: '105', bp: '120/80', spO2: '98%', temp: '98.6', weight: '70', height: '175', rr: '16' } as any);
    fixture.detectChanges();
    expect(component.qSofaScore()).toBe(1);
    expect(component.qSofaStatus()).toBe('Moderate Escalation');

    // Tachycardia + Hypotension (SBP < 100) -> score 2
    patientState.vitals.set({ hr: '110', bp: '90/60', spO2: '98%', temp: '98.6', weight: '70', height: '175', rr: '16' } as any);
    fixture.detectChanges();
    expect(component.qSofaScore()).toBe(2);
    expect(component.qSofaStatus()).toBe('High Sepsis Risk');
  });

  it('3. Renders predicted adherence rate and feedback mode', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('88%');
    expect(el.textContent).toContain('Bandit Feedback Learning Active');
  });

  it('4. Lists Pareto-optimal clinical interventions across paradigms', () => {
    const options = component.interventions();
    expect(options.length).toBe(3);
    expect(options.every(o => o.isParetoOptimal)).toBe(true);

    const paradigms = options.map(o => o.paradigm);
    expect(paradigms).toContain('Western');
    expect(paradigms).toContain('Eastern');
    expect(paradigms).toContain('Ayurvedic');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Prescription Metformin + SGLT2 Care Plan');
    expect(el.textContent).toContain('Xiao Ke Wan Herbs + Acupressure Routine');
    expect(el.textContent).toContain('Nisha Amalaki Routine + 0.1Hz Vagal Breathing');
  });

  it('5. Executes selectIntervention with bio-haptics, patient note, and notification', () => {
    const addNoteSpy = vi.spyOn(patientState, 'addClinicalNote');
    const option: IParetoInterventionOption = component.interventions()[0];

    component.selectIntervention(option);

    expect(bioHapticMock.playSolfeggioTone).toHaveBeenCalledWith(528, 1500);
    expect(bioHapticMock.triggerDualPulse).toHaveBeenCalled();
    expect(addNoteSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining('Prescription Metformin + SGLT2 Care Plan'),
        sourceLens: 'Functional Protocols'
      })
    );
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining('Prescribed Prescription Metformin + SGLT2 Care Plan!')
    );
  });
});
