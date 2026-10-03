import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HobbyDomainCompanionComponent } from './hobby-domain-companion.component';
import { HobbyDomainCompanionService } from '../services/hobby-domain-companion.service';
import { PatientStateService } from '../services/patient-state.service';
import { signal } from '@angular/core';

describe('HobbyDomainCompanionComponent', () => {
  let component: HobbyDomainCompanionComponent;
  let fixture: ComponentFixture<HobbyDomainCompanionComponent>;
  let mockCompanionService: any;
  let mockPatientState: any;

  const mockBuddy = {
    id: 'buddy_steam_locomotive',
    name: 'Hank the Master Machinist',
    domainTitle: 'Steam Locomotive Engineer & Boiler Fitter',
    passionBadge: 'Steam & Steel',
    avatarEmoji: '🚂',
    tagline: 'Precision boiler pressure and high-torque craftsmanship.',
    relationshipBio: 'Your trusted roundhouse foreman who rebuilt Mikado 2-8-2 boilers with you.',
    craftDialect: 'Roundhouse Machinist',
    sno10Analogies: {
      'I10': {
        domainId: 'steam_engine',
        metaphorName: 'Main Steam Header Overpressure',
        craftExplanation: 'Boiler safety valve popping early under peak boiler draft.',
        systemAnalogy: 'Essential hypertension arterial pressure elevation.',
        maintenanceStep: 'Blowdown valve sediment cleanout and draft damper easing.',
        adaptiveToolRecommendation: 'Brass vernier pressure gauge'
      }
    },
    workshopErgonomics: [
      {
        toolName: 'Air-Hydraulic Chuck Vise',
        clinicalPurpose: 'Osteoarthritis Grip Load Mitigation',
        howItHelps: 'Eliminates repetitive hand torque when clamping round locomotive rod stock.',
        icon: '🔧'
      }
    ],
    sampleGreetings: ['Morning Chief, boiler pressure is holding steady.']
  };

  beforeEach(async () => {
    mockCompanionService = {
      allCompanions: signal([mockBuddy]),
      activeCompanion: signal(mockBuddy),
      activeChat: signal([
        {
          id: 'msg_1',
          sender: 'buddy',
          senderName: 'Hank',
          timestamp: '08:00 AM',
          text: 'Good morning! Checked the boiler water levels yet?',
          snoBadge: 'I10 Hypertension Check',
          ergonomicTip: 'Keep wrists neutral when turning the injector wheel.'
        }
      ]),
      allCommunityEvents: signal([
        {
          id: 'evt_1',
          domainCategory: 'auto',
          title: 'Pacific Northwest Live Steamers Meetup',
          communityType: 'Guild Meetup',
          location: 'Molalla, OR',
          scheduleDescription: 'Every 2nd Saturday 10 AM',
          accessibilityRating: 'ADA Accessible Benchwork',
          buddyEncouragement: 'Come run the 1.5 inch scale 4-6-2 Pacific engine!',
          organizer: 'PNW Live Steamers Guild',
          contactOrLink: 'https://pocketgull.app/community/steam'
        }
      ]),
      discoverLocalEvents: vi.fn().mockImplementation((category: string, query: string) => {
        const events = mockCompanionService.allCommunityEvents();
        if (!query) return events;
        return events.filter((e: any) =>
          e.title.toLowerCase().includes(query.toLowerCase()) ||
          e.location.toLowerCase().includes(query.toLowerCase())
        );
      }),
      selectCompanion: vi.fn((id: string) => {
        mockCompanionService.activeCompanion.set(mockBuddy);
      }),
      sendMessageToBuddy: vi.fn(),
      createCustomBuddy: vi.fn()
    };

    mockPatientState = {
      issues: signal(['Cardiovascular', 'Hypertension'])
    };

    await TestBed.configureTestingModule({
      imports: [HobbyDomainCompanionComponent],
      providers: [
        { provide: HobbyDomainCompanionService, useValue: mockCompanionService },
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HobbyDomainCompanionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders active passion companion dossier', () => {
    expect(component).toBeTruthy();
    expect(component.allBuddies().length).toBe(1);
    expect(component.activeBuddy().name).toBe('Hank the Master Machinist');
    expect(component.activeBuddy().avatarEmoji).toBe('🚂');
    expect(component.activeBuddy().craftDialect).toBe('Roundhouse Machinist');
  });

  it('2. Switches companion selection via companionService.selectCompanion', () => {
    component.selectBuddy('buddy_steam_locomotive');
    expect(mockCompanionService.selectCompanion).toHaveBeenCalledWith('buddy_steam_locomotive');
  });

  it('3. Renders chat history and sends message to companion', () => {
    expect(component.chatStream().length).toBe(1);
    expect(component.chatStream()[0].text).toContain('boiler water levels');

    component.userMessageInput = 'Feeling good, worked on the firebox today.';
    component.sendMessage();

    expect(mockCompanionService.sendMessageToBuddy).toHaveBeenCalledWith(
      'Feeling good, worked on the firebox today.',
      ['Cardiovascular', 'Hypertension']
    );
    expect(component.userMessageInput).toBe('');
  });

  it('4. Ignores empty messages in sendMessage', () => {
    component.userMessageInput = '   ';
    component.sendMessage();
    expect(mockCompanionService.sendMessageToBuddy).not.toHaveBeenCalled();
  });

  it('5. Creates custom confidant and resets inputs', () => {
    component.openCustomBuddyModal.set(true);
    component.customName = 'Grandpa Joe';
    component.customDomain = 'Model Train Builder';
    component.customCatchphrases = 'Highball down the mainline!';
    component.customMemories = 'We spent decades laying HO scale track in the basement.';

    component.saveCustomBuddy();

    expect(mockCompanionService.createCustomBuddy).toHaveBeenCalledWith({
      name: 'Grandpa Joe',
      domainOrHobby: 'Model Train Builder',
      relationshipContext: 'We spent decades laying HO scale track in the basement.',
      specialMemories: 'Highball down the mainline!'
    });
    expect(component.customName).toBe('');
    expect(component.openCustomBuddyModal()).toBe(false);
  });

  it('6. Filters local craft community events by search query', () => {
    expect(component.filteredEvents().length).toBe(1);

    component.eventSearchQuery.set('Molalla');
    fixture.detectChanges();
    expect(component.filteredEvents().length).toBe(1);

    component.eventSearchQuery.set('NonExistentCity');
    fixture.detectChanges();
    expect(component.filteredEvents().length).toBe(0);
  });
});
