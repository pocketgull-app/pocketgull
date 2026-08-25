import { BionicFocusBenchmarkComponent } from './bionic-focus-benchmark.component';
import { BionicReadingService } from '../../services/bionic-reading.service';

describe('BionicFocusBenchmarkComponent', () => {
  let component: BionicFocusBenchmarkComponent;
  let bionicService: BionicReadingService;

  beforeEach(() => {
    bionicService = new BionicReadingService();
    component = Object.create(BionicFocusBenchmarkComponent.prototype);
    component.bionicService = bionicService;
    // Initialize properties
    Object.assign(component, {
      rawBenchmarkPassage: `Clinical decision support engines require instant, zero-error comprehension during emergency triage. Pocket-Gull's integrated Bionic Reading algorithm highlights critical saccadic fixation points, allowing clinicians, patients, and fellow researchers to digest complex pharmacology and landmark trial dossiers with higher long-term retention.`,
      selectedProfile: { set: (v: any) => {}, value: 'all' },
      isGameMode: { set: (v: any) => {}, value: false },
      selectedLevel: { set: (v: any) => {}, value: 2 },
      gameLevels: [
        { level: 1, title: 'Cadet Resident', wpm: 300, icon: '🌱' },
        { level: 2, title: 'Clinical Fellow', wpm: 500, icon: '⚡' },
        { level: 3, title: 'ICU Attending', wpm: 750, icon: '🔥' },
        { level: 4, title: 'Flight Surgeon', wpm: 1000, icon: '🚀' }
      ],
      profiles: [
        { id: 'all', icon: '🌐', label: 'Universal Optometry' },
        { id: 'adhd', icon: '⚡', label: 'ADHD Executive Flow' },
        { id: 'dyslexia', icon: '🧩', label: 'Dyslexia Disambiguation' },
        { id: 'icu-triage', icon: '🚨', label: 'ICU STAT Triage' }
      ],
      isGameRunning: { set: (v: any) => {}, value: false },
      gameFinished: { set: (v: any) => {}, value: false },
      currentWordIndex: { set: (v: any) => {}, value: 0 },
      quizAnswered: { set: (v: any) => {}, value: false },
      isQuizCorrect: { set: (v: any) => {}, value: false },
      gameWords: `Clinical decision support engines require instant, zero-error comprehension during emergency triage. Pocket-Gull's integrated Bionic Reading algorithm highlights critical saccadic fixation points, allowing clinicians, patients, and fellow researchers to digest complex pharmacology and landmark trial dossiers with higher long-term retention.`.split(/\s+/)
    });
  });

  it('should initialize with raw benchmark passage', () => {
    expect(component.rawBenchmarkPassage).toContain('emergency triage');
    expect(component.rawBenchmarkPassage).toContain('saccadic fixation');
  });

  it('should format text with bionic service saccadic bolding', () => {
    const formatted = bionicService.formatToBionicHtml(component.rawBenchmarkPassage, 'font-black text-amber-400');
    expect(formatted).toContain('Clin');
    expect(formatted).toContain('emerg');
    expect(formatted).toContain('tri');
  });

  it('should toggle bionic reading state', () => {
    expect(bionicService.isBionicReadingEnabled()).toBe(false);
    bionicService.toggleBionicReading();
    expect(bionicService.isBionicReadingEnabled()).toBe(true);
  });
});
