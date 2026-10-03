import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PresentationModalComponent } from './presentation-modal.component';
import { PresentationExportService } from '../services/presentation-export.service';
import { PatientStateService } from '../services/patient-state.service';

describe('PresentationModalComponent', () => {
  let component: PresentationModalComponent;
  let fixture: ComponentFixture<PresentationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentationModalComponent],
      providers: [PresentationExportService, PatientStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(PresentationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders Grand Rounds & CARE Presentation Cockpit header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Grand Rounds & CARE Presentation Cockpit');
    expect(el.textContent).toContain('1-Click PowerPoint / Google Docs Export');
  });

  it('2. Loads 7-slide deck and defaults to slide 0', () => {
    const deck = component.deck();
    expect(deck.slides.length).toBeGreaterThanOrEqual(7);
    expect(component.activeSlideIndex()).toBe(0);

    const active = component.activeSlide();
    expect(active.slideNumber).toBe(1);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Slide 1 of');
    expect(el.textContent).toContain(active.title);
  });

  it('3. Navigates forward and backward through slides', () => {
    component.nextSlide();
    expect(component.activeSlideIndex()).toBe(1);

    component.prevSlide();
    expect(component.activeSlideIndex()).toBe(0);

    // Prev on first slide does not decrement below 0
    component.prevSlide();
    expect(component.activeSlideIndex()).toBe(0);
  });

  it('4. Selects a slide directly by index', () => {
    component.activeSlideIndex.set(3);
    fixture.detectChanges();

    expect(component.activeSlide().slideNumber).toBe(4);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Slide 4 of');
  });

  it('5. Copies CARE Markdown to clipboard when available', () => {
    vi.useFakeTimers();
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextSpy
      }
    });

    component.copyCareMarkdown();
    expect(writeTextSpy).toHaveBeenCalledWith(component.deck().careCaseReportMarkdown);
    expect(component.isCopiedMarkdown()).toBe(true);

    vi.advanceTimersByTime(3100);
    expect(component.isCopiedMarkdown()).toBe(false);
    vi.useRealTimers();
  });
});
