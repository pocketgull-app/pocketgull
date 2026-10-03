import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { SocraticVoiceA11yStudioComponent } from './socratic-voice-a11y-studio.component';
import { SocraticVoiceDemystifierService } from '../../services/socratic-voice-demystifier.service';
import { CardiometabolicPodcastEngineService } from '../../services/cardiometabolic-podcast-engine.service';

describe('SocraticVoiceA11yStudioComponent', () => {
  let component: SocraticVoiceA11yStudioComponent;
  let fixture: ComponentFixture<SocraticVoiceA11yStudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocraticVoiceA11yStudioComponent],
      providers: [
        SocraticVoiceDemystifierService,
        CardiometabolicPodcastEngineService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SocraticVoiceA11yStudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the Socratic Voice & AAC Bedside Studio with all 4 tabs', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Socratic Voice & AAC Bedside Studio');
    expect(el.textContent).toContain('ICU Bedside AAC');
    expect(el.textContent).toContain('Socratic Jargon Demystifier');
    expect(el.textContent).toContain('Neural Synthesizer Settings');
    expect(el.textContent).toContain('Scientific Podcast & Dialect Studio');
  });

  it('should switch to the Scientific Podcast & Dialect Studio tab and display cast & controls', () => {
    component.activeSubTab.set('podcast');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('The Glycemic Phase Shift & The Soleus Paradox');
    expect(el.textContent).toContain('Dr. Sarah Carter');
    expect(el.textContent).toContain('Dr. Marc Hamilton');
    expect(el.textContent).toContain('Clinical Scribe');
    expect(el.textContent).toContain('Play Full Podcast');
    expect(el.textContent).toContain('432 Hz Drone');
  });

  it('should advance acts using podcastEngine navigation', () => {
    component.activeSubTab.set('podcast');
    fixture.detectChanges();

    expect(component.podcastEngine.currentSegmentIndex()).toBe(0);
    component.podcastEngine.nextSegment();
    fixture.detectChanges();

    expect(component.podcastEngine.currentSegmentIndex()).toBe(1);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Act 2 of');
  });
});
