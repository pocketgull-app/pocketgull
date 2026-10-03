import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HistoricalLuminariesGameComponent } from './historical-luminaries-game.component';
import { HistoricalLuminariesGameService, ILuminaryCase } from '../services/historical-luminaries-game.service';

describe('HistoricalLuminariesGameComponent Unit Suite', () => {
  let component: HistoricalLuminariesGameComponent;
  let mockGameService: {
    currentCaseIndex: ReturnType<typeof signal<number>>;
    currentClueRound: ReturnType<typeof signal<number>>;
    selectedOptionId: ReturnType<typeof signal<string | null>>;
    isCaseResolved: ReturnType<typeof signal<boolean>>;
    score: ReturnType<typeof signal<number>>;
    isIncognitoMode: ReturnType<typeof signal<boolean>>;
    getCurrentCase: ReturnType<typeof vi.fn>;
    getAllCases: ReturnType<typeof vi.fn>;
    toggleIncognitoMode: ReturnType<typeof vi.fn>;
    advanceClue: ReturnType<typeof vi.fn>;
    submitDiagnosis: ReturnType<typeof vi.fn>;
    nextCase: ReturnType<typeof vi.fn>;
    loadLuminaryAsActivePatient: ReturnType<typeof vi.fn>;
    resetGame: ReturnType<typeof vi.fn>;
  };

  const dummyCase: ILuminaryCase = {
    id: 'case-curie',
    patientMockId: 'mock-curie',
    luminaryName: 'Marie Curie',
    blindedCaseTitle: 'The Pioneer of Radioactivity',
    blindedSpecialty: 'Nuclear Physics & Oncology',
    lifeSpan: '1867-1934',
    fieldOfPioneering: 'Radiation Physics & Radium Isolation',
    avatarEmoji: '⚗️',
    quote: 'Nothing in life is to be feared, it is only to be understood.',
    historicalContext: 'Double Nobel Laureate who discovered Polonium and Radium.',
    healthQuestNarrative: 'Persistent fatigue, aplastic anemia symptoms, and radiation dermatitis.',
    physicalHardships: ['Severe bone pain', 'Radiation dermatitis'],
    societalAndPersonalHardships: ['Gender discrimination in academia', 'Exclusion from French Academy of Sciences'],
    resilienceTriumph: 'Mobilized petite Curies mobile X-ray units during WWI saving thousands of soldiers.',
    clues: [
      {
        round: 1,
        phaseTitle: 'Initial Signs',
        sourceDate: '1911',
        excerpt: 'Chronic fatigue and hand burns while handling pitchblende.',
        clinicalSign: 'Radiation burns and chronic cytopenia'
      }
    ],
    options: [
      {
        id: 'opt-aplastic',
        diagnosisName: 'Aplastic Anemia secondary to Radium exposure',
        isHistoricallyAccepted: true,
        scientificRationale: 'Bone marrow failure from chronic ionizing radiation without protective lead shielding.',
        bayesianPlausibility: 95
      }
    ],
    correctOptionHash: 'opt-aplastic',
    confirmedHistoricalDiagnosis: 'Aplastic Anemia Induced by Ionizing Radiation',
    clinicalTeachingPearl: 'Always enforce ALARA (As Low As Reasonably Achievable) radiation protection principles.',
    monumentTribute: 'Interred in the Panthéon in Paris in honor of her monumental scientific contributions.'
  };

  beforeEach(async () => {
    mockGameService = {
      currentCaseIndex: signal(0),
      currentClueRound: signal(1),
      selectedOptionId: signal<string | null>(null),
      isCaseResolved: signal(false),
      score: signal(200),
      isIncognitoMode: signal(false),
      getCurrentCase: vi.fn().mockReturnValue(dummyCase),
      getAllCases: vi.fn().mockReturnValue([dummyCase]),
      toggleIncognitoMode: vi.fn(),
      advanceClue: vi.fn(),
      submitDiagnosis: vi.fn(),
      nextCase: vi.fn(),
      loadLuminaryAsActivePatient: vi.fn().mockReturnValue(true),
      resetGame: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [HistoricalLuminariesGameComponent],
      providers: [
        { provide: HistoricalLuminariesGameService, useValue: mockGameService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(HistoricalLuminariesGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Instantiates successfully and binds to luminary case telemetry', () => {
    expect(component).toBeTruthy();
    expect(component.activeCase().luminaryName).toBe('Marie Curie');
    expect(component.score()).toBe(200);
    expect(component.clueRound()).toBe(1);
    expect(component.isStoryMode()).toBe(false);
  });

  it('2. Toggles all-ages story mode and friendly story hints', () => {
    expect(component.isStoryMode()).toBe(false);
    component.toggleStoryMode();
    expect(component.isStoryMode()).toBe(true);

    expect(component.showStoryHint()).toBe(false);
    component.toggleStoryHint();
    expect(component.showStoryHint()).toBe(true);
  });

  it('3. Delegates game operations to HistoricalLuminariesGameService', () => {
    component.toggleIncognito();
    expect(mockGameService.toggleIncognitoMode).toHaveBeenCalled();

    component.advanceClue();
    expect(mockGameService.advanceClue).toHaveBeenCalled();

    component.makeDiagnosis('opt-aplastic');
    expect(mockGameService.submitDiagnosis).toHaveBeenCalledWith('opt-aplastic');

    component.nextLuminaryCase();
    expect(mockGameService.nextCase).toHaveBeenCalled();

    component.resetGame();
    expect(mockGameService.resetGame).toHaveBeenCalled();
  });

  it('4. Loads luminary as active patient into workbench and triggers toast', () => {
    component.loadAsActivePatient();
    expect(mockGameService.loadLuminaryAsActivePatient).toHaveBeenCalled();
    expect(component.patientLoadedToast()).toContain('Loaded Marie Curie');
  });

  it('5. Handles speech synthesis gracefully in headless/supported environments', () => {
    // If window.speechSynthesis is missing in test runner, it should safely return without throwing
    expect(() => component.speakStory()).not.toThrow();
  });
});
