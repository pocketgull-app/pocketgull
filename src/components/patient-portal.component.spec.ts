import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID, signal } from '@angular/core';
import { PatientPortalComponent } from './patient-portal.component';
import { PatientStateService } from '../services/patient-state.service';
import { AdkLiveService } from '../services/ai/adk-live.service';
import { UniversityLeagueService } from '../services/university-league.service';
import { PublicServiceCorpsService } from '../services/public-service-corps.service';
import { ElderBridgeService } from '../services/elder-bridge.service';
import { YouthMentorshipService } from '../services/youth-mentorship.service';
import { OrToolsGoalOptimizerService } from '../services/or-tools-goal-optimizer.service';
import { TransitWellnessGatewayService } from '../services/transit-wellness-gateway.service';

describe('PatientPortalComponent Unit Suite', () => {
  let component: PatientPortalComponent;
  let mockPatientState: {
    purgeTransientPatientState: ReturnType<typeof vi.fn>;
    vitals: ReturnType<typeof signal<any>>;
    issues: ReturnType<typeof signal<any>>;
  };
  let mockAdkLive: {
    conversationHistory: ReturnType<typeof signal<string[]>>;
    isConnected: ReturnType<typeof signal<boolean>>;
    simulateLiveStreamResponse: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockPatientState = {
      purgeTransientPatientState: vi.fn(),
      vitals: signal({ hr: '72', bp: '120/80' }),
      issues: signal({})
    };

    mockAdkLive = {
      conversationHistory: signal<string[]>([]),
      isConnected: signal<boolean>(false),
      simulateLiveStreamResponse: vi.fn(),
      disconnect: vi.fn()
    };

    const mockLeague = {
      currentAffiliation: signal({ mascotEmoji: '🦉', schoolName: 'Cambridge University', rank: 1 }),
      scores: signal([
        {
          schoolId: 'cambridge',
          schoolName: 'Cambridge University',
          mascotEmoji: '🦉',
          rank: 1,
          averageCoherenceScore: 96,
          activeStudentCount: 650,
          philanthropicContributionUsd: 25000,
          cityState: 'Cambridge, UK'
        }
      ]),
      selectedSchoolId: signal('cambridge'),
      selectSchool: vi.fn()
    };

    const mockPublicService = {
      activeInitiatives: signal([
        { id: 'init-1', emojiBadge: '🌱', title: 'Community Gardening', targetBeneficiaries: 'Elderly', impactMetrics: 'High' }
      ])
    };

    const mockElder = { elderStories: signal([]) };
    const mockYouth = { activeMentors: signal([]) };

    const mockOrTools = {
      optimizedSchedule: signal({
        constraintSatisfactionStatus: 'Optimal',
        healthGoalFulfillmentPct: 98,
        recommendedQuests: ['Morning Sunlight 15m', 'Resonant Breathing']
      })
    };

    const mockTransit = {
      latestTransitScan: signal({
        venueNameOrIata: 'SEA Airport',
        postureSymmetryScore: 94,
        spinalCobbAngleDeg: 3.5,
        hydrationIndexPct: 82,
        recommendedQuests: ['Pre-flight hydration']
      })
    };

    await TestBed.configureTestingModule({
      imports: [PatientPortalComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: AdkLiveService, useValue: mockAdkLive },
        { provide: UniversityLeagueService, useValue: mockLeague },
        { provide: PublicServiceCorpsService, useValue: mockPublicService },
        { provide: ElderBridgeService, useValue: mockElder },
        { provide: YouthMentorshipService, useValue: mockYouth },
        { provide: OrToolsGoalOptimizerService, useValue: mockOrTools },
        { provide: TransitWellnessGatewayService, useValue: mockTransit }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PatientPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Instantiates successfully with default overview tab', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('overview');
    expect(component.showPurgeConfirmation()).toBe(false);
  });

  it('2. Switches active navigation tabs', () => {
    component.activeTab.set('screening');
    expect(component.activeTab()).toBe('screening');

    component.activeTab.set('quests');
    expect(component.activeTab()).toBe('quests');

    component.activeTab.set('consult');
    expect(component.activeTab()).toBe('consult');

    component.activeTab.set('odontogram');
    expect(component.activeTab()).toBe('odontogram');
  });

  it('3. Opens purge confirmation modal on user request', () => {
    expect(component.showPurgeConfirmation()).toBe(false);
    component.confirmPurgeState();
    expect(component.showPurgeConfirmation()).toBe(true);
  });

  it('4. Executes purge of transient state and emits close signal', () => {
    let closed = false;
    component.close.subscribe(() => {
      closed = true;
    });

    component.confirmPurgeState();
    expect(component.showPurgeConfirmation()).toBe(true);

    component.executePurgeState();
    expect(component.showPurgeConfirmation()).toBe(false);
    expect(mockPatientState.purgeTransientPatientState).toHaveBeenCalled();
    expect(closed).toBe(true);
  });

  it('5. Initiates simulated live consult stream via AdkLiveService', () => {
    component.startLiveConsult();
    expect(mockAdkLive.simulateLiveStreamResponse).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.stringContaining('AI Patient Consult Assistant')
      ])
    );
  });
});
