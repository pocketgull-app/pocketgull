import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChronoClockDecisionRailComponent } from './chrono-clock-decision-rail.component';
import { PatientStateService } from '../services/patient-state.service';

describe('ChronoClockDecisionRailComponent', () => {
  let component: ChronoClockDecisionRailComponent;
  let fixture: ComponentFixture<ChronoClockDecisionRailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChronoClockDecisionRailComponent],
      providers: [PatientStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(ChronoClockDecisionRailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with default 12:30 PM hour and Peak Digestive Fire lunch window', () => {
    expect(component).toBeTruthy();
    expect(component.selectedHour()).toBe(12.5);
    expect(component.formattedTime()).toBe('12:30');

    const active = component.currentEvaluatedWindow();
    expect(active.id).toBe('w-lunch');
    expect(active.status).toBe('Optimal');
    expect(active.dishName).toContain('Grilled Wild Salmon');
    expect(active.emoji).toBe('☀️');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Chrono-Nutrition Circadian Clock & Decision Rail');
    expect(el.textContent).toContain('12:30');
  });

  it('2. Evaluates morning breakfast window and emits windowSelect on setTime(8.0)', () => {
    let emittedId: string | null = null;
    component.windowSelect.subscribe(id => {
      emittedId = id;
    });

    component.setTime(8.0);
    fixture.detectChanges();

    expect(component.selectedHour()).toBe(8.0);
    expect(component.formattedTime()).toBe('08:00');
    expect(component.currentEvaluatedWindow().id).toBe('w-breakfast');
    expect(component.currentEvaluatedWindow().dishName).toContain('Steel-Cut Oats');
    expect(emittedId).toBe('w-breakfast');
  });

  it('3. Evaluates tea elixir and dinner windows across afternoon and evening hours', () => {
    // Afternoon elixir window (15.3 - 17.0)
    component.setTime(16.0);
    fixture.detectChanges();
    expect(component.currentEvaluatedWindow().id).toBe('w-elixir');
    expect(component.currentEvaluatedWindow().dishName).toContain('Warm Jujube & Ginger Elixir Tea');
    expect(component.currentEvaluatedWindow().status).toBe('Optimal');

    // Evening dinner window (18.0 - 19.5)
    component.setTime(19.0);
    fixture.detectChanges();
    expect(component.currentEvaluatedWindow().id).toBe('w-dinner');
    expect(component.currentEvaluatedWindow().dishName).toContain('Bone Broth Soup');
    expect(component.currentEvaluatedWindow().status).toBe('Optimal');
  });

  it('4. Evaluates fasting window for late night and pre-dawn hours', () => {
    // Late night
    component.setTime(22.0);
    fixture.detectChanges();
    let window = component.currentEvaluatedWindow();
    expect(window.id).toBe('w-fasting');
    expect(window.status).toBe('Fasting Mandatory');
    expect(window.dishName).toContain('Fasting / Water Only');

    // Pre-dawn
    component.setTime(5.0);
    fixture.detectChanges();
    window = component.currentEvaluatedWindow();
    expect(window.id).toBe('w-fasting');
    expect(window.status).toBe('Fasting Mandatory');
  });

  it('5. Evaluates inter-meal transition phase and updates hour via slider event', () => {
    // Mid-morning gap between breakfast (ends 9.5) and lunch (starts 12.0)
    component.setTime(10.5);
    fixture.detectChanges();
    const transitionWindow = component.currentEvaluatedWindow();
    expect(transitionWindow.id).toBe('w-transition');
    expect(transitionWindow.status).toBe('Suboptimal');
    expect(transitionWindow.dishName).toContain('Hydration / Herbal Tea');

    // Slider input event simulation
    let emittedId: string | null = null;
    component.windowSelect.subscribe(id => {
      emittedId = id;
    });

    component.updateHour({ target: { value: '13.0' } } as unknown as Event);
    fixture.detectChanges();

    expect(component.selectedHour()).toBe(13.0);
    expect(component.currentEvaluatedWindow().id).toBe('w-lunch');
    expect(emittedId).toBe('w-lunch');
  });
});
