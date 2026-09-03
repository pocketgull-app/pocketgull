import { TestBed } from '@angular/core/testing';
import { PatientTrajectoryService } from './patient-trajectory.service';
import { PatientStateService } from './patient-state.service';
import { NanoProvider } from './ai/nano.provider';

describe('PatientTrajectoryService Suite', () => {
  let service: PatientTrajectoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PatientTrajectoryService,
        {
          provide: PatientStateService,
          useValue: {
            getCurrentState: vi.fn().mockReturnValue({ patientId: 'p1', name: 'Charles Darwin' })
          }
        },
        {
          provide: NanoProvider,
          useValue: {
            isAiSupported: vi.fn().mockReturnValue(true)
          }
        }
      ]
    });
    service = TestBed.inject(PatientTrajectoryService);
  });

  it('1. Act 1: Initializes plain-language Teaspoon Explanations with zero fatalism', () => {
    const items = service.teaspoonExplanations();
    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(items[0].clinicalTerm).toContain('L4-L5');
    expect(items[0].teaspoonExplanation).toContain('dense jelly cushion');
    expect(items[0].empowermentReframe).toContain('mechanical adaptation');
  });

  it('2. Act 2: Initializes Today Daily Vitality Loop with 3 micro-habits', () => {
    const habits = service.dailyHabits();
    expect(habits.length).toBe(3);
    expect(habits[0].id).toBe('morning-priming');
    expect(habits[0].opticalIntegration).toContain('670nm');
    expect(habits[1].id).toBe('midday-fuel');
    expect(habits[1].opticalIntegration).toContain('OKN/VOR');
    expect(habits[2].id).toBe('evening-restoration');
    expect(habits[2].opticalIntegration).toContain('Dichoptic 0.5Hz');
  });

  it('3. Act 2: Toggles habit completion and computes daily adherence score', () => {
    expect(service.dailyAdherenceScore()).toBe(0);

    service.toggleHabitCompletion('morning-priming');
    expect(service.dailyHabits()[0].isCompleted).toBe(true);
    expect(service.dailyHabits()[0].completedAt).toBeDefined();
    expect(service.dailyAdherenceScore()).toBe(33);

    service.toggleHabitCompletion('midday-fuel');
    expect(service.dailyAdherenceScore()).toBe(67);
  });

  it('4. Act 3: Initializes 30, 60, and 90-day Horizon Milestones', () => {
    const milestones = service.horizonMilestones();
    expect(milestones.length).toBe(3);
    expect(milestones[0].dayTarget).toBe(30);
    expect(milestones[1].dayTarget).toBe(60);
    expect(milestones[2].dayTarget).toBe(90);
  });

  it('5. Act 3: Generates official FDA 21 CFR Part 11 Vitality Certificate with SHA-256 seal', () => {
    const cert = service.generateVitalityCertificate('Charles Darwin');
    expect(cert.patientName).toBe('Charles Darwin');
    expect(cert.certificateId).toContain('PG-VIT-');
    expect(cert.clinicalAchievements.length).toBe(4);
    expect(cert.sha256IntegritySeal).toContain('SHA-256:');
    expect(cert.regulatoryAttestation).toContain('HL7 FHIR R4');
    expect(service.vitalityCertificate()).toEqual(cert);
  });

  it('6. Edge Scribe: Zero-egress consult maps back symptom note to L4-L5 anatomy', async () => {
    const consult = await service.consultEdgeScribe('My lower back feels tight after sitting today');
    expect(consult.anatomicalLinkage).toContain('L4-L5');
    expect(consult.teaspoonInsight).toContain('disc cushion');
    expect(consult.recommendedImmediateAction).toContain('lumbar extension');
    expect(consult.egressAuditedZeroEgress).toBe(true);
  });

  it('7. Edge Scribe: Maps ocular screen fatigue to ciliary muscle and 670nm light bath', async () => {
    const consult = await service.consultEdgeScribe('My eyes feel tired from screen');
    expect(consult.anatomicalLinkage).toContain('Ocular Ciliary Muscle');
    expect(consult.recommendedImmediateAction).toContain('670nm retinal light bath');
  });
});
