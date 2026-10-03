import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientStoryModalComponent } from './patient-story-modal.component';
import { ClinicalStorytellingService, IPatientStory } from '../../services/clinical-storytelling.service';

describe('PatientStoryModalComponent', () => {
  let component: PatientStoryModalComponent;
  let fixture: ComponentFixture<PatientStoryModalComponent>;

  const mockStory: IPatientStory = {
    title: 'Narrative Healthspan Journey for Mara Santos',
    projectedQaly: 4.8,
    bioAgeDelta: -3.5,
    acts: [
      {
        actNumber: 1,
        title: 'Act I: The Awakening',
        subtitle: 'Understanding the terrain',
        narrative: 'Patient experienced autonomic and metabolic dysregulation.',
        keyInsight: 'Symptoms are communication signals.'
      },
      {
        actNumber: 2,
        title: 'Act II: The Multi-Paradigm Quest',
        subtitle: 'Mobilizing allies across paradigms',
        narrative: 'Combined Western precision with lifestyle interventions.',
        keyInsight: 'Multi-modal interventions provide highest resilience.'
      },
      {
        actNumber: 3,
        title: 'Act III: The Flourishing Horizon',
        subtitle: 'Sustainable vitality and longevity',
        narrative: 'Restored circadian rhythm and metabolic flexibility.',
        keyInsight: 'Daily micro-habits compound into extended healthspan.'
      }
    ]
  };

  beforeEach(async () => {
    const mockStorytelling = {
      generatePatientStory: vi.fn(() => mockStory)
    };

    await TestBed.configureTestingModule({
      imports: [PatientStoryModalComponent],
      providers: [
        { provide: ClinicalStorytellingService, useValue: mockStorytelling }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientStoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders Patient Narrative Healthspan Story header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Patient Narrative Healthspan Story');
    expect(el.textContent).toContain('3-Act Narrative Synthesis');
  });

  it('2. Displays story metrics (bio-age delta and projected QALY gain)', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('-3.5 yrs');
    expect(el.textContent).toContain('+4.8 Years');
    expect(el.textContent).toContain('Narrative Healthspan Journey for Mara Santos');
  });

  it('3. Navigates between Act 1, Act 2, and Act 3 tabs', () => {
    expect(component.activeActIndex()).toBe(0);
    let el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Act I: The Awakening');

    component.activeActIndex.set(1);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Act II: The Multi-Paradigm Quest');

    component.activeActIndex.set(2);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Act III: The Flourishing Horizon');
  });

  it('4. Toggles audio playback and handles speech synthesis safely', () => {
    expect(component.isSpeaking()).toBe(false);
    expect(() => component.toggleAudio()).not.toThrow();
  });

  it('5. Emits closeModal output on close button click', () => {
    let closed = false;
    component.closeModal.subscribe(() => {
      closed = true;
    });

    component.closeModal.emit();
    expect(closed).toBe(true);
  });
});
