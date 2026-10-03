import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JoyPlayfulFlourishingCardComponent } from './joy-playful-flourishing-card.component';
import { JoyPlayfulFlourishingService } from '../services/joy-playful-flourishing.service';

describe('JoyPlayfulFlourishingCardComponent', () => {
  let fixture: ComponentFixture<JoyPlayfulFlourishingCardComponent>;
  let component: JoyPlayfulFlourishingCardComponent;
  let service: JoyPlayfulFlourishingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoyPlayfulFlourishingCardComponent],
      providers: [JoyPlayfulFlourishingService]
    }).compileComponents();

    fixture = TestBed.createComponent(JoyPlayfulFlourishingCardComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(JoyPlayfulFlourishingService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders Joy & Playful Flourishing Matrix header and score', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Joy & Playful Flourishing Matrix');
    expect(el.textContent).toContain("Seligman's PERMA+ Micro-Play");
    expect(el.textContent).toContain('Daily Joy Index:');
    expect(component.scorecard()?.compositeJoyIndex).toBeGreaterThan(0);
  });

  it('2. Renders all default micro-joy prescriptions with dopamine benefits', () => {
    const list = component.prescriptions();
    expect(list.length).toBe(5);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Acoustic Neuro-Rhythm & Harmonic Entrainment');
    expect(el.textContent).toContain('Botanical Micro-Foraging & Aromatherapy');
    expect(el.textContent).toContain('Origami Crane & Papercraft Sculpting');
    expect(el.textContent).toContain('Nostalgic Family Legacy Storytelling');
    expect(el.textContent).toContain('Laughter Yoga & Vagal Entrainment');
  });

  it('3. Toggles completion of an activity and updates service and component state', () => {
    expect(component.prescriptions()[0].isCompletedToday).toBe(false);

    component.joyService.toggleActivityCompletion('joy_1');
    fixture.detectChanges();

    expect(component.prescriptions()[0].isCompletedToday).toBe(true);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Completed ✓');
  });

  it('4. Recalculates composite joy index when items are marked complete', () => {
    const baselineScore = component.scorecard()?.compositeJoyIndex ?? 0;

    // Complete all items
    for (const item of component.prescriptions()) {
      component.joyService.toggleActivityCompletion(item.id);
    }
    fixture.detectChanges();

    const newScore = component.scorecard()?.compositeJoyIndex ?? 0;
    expect(newScore).toBeGreaterThan(baselineScore);
    expect(newScore).toBeGreaterThanOrEqual(90);
  });

  it('5. Renders the playful flourishing directive banner', () => {
    const el = fixture.nativeElement as HTMLElement;
    const directive = component.scorecard()?.playfulFlourishingDirective;
    expect(directive).toBeTruthy();
    expect(el.textContent).toContain(directive);
  });
});
