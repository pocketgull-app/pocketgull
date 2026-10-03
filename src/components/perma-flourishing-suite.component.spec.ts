import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermaFlourishingSuiteComponent } from './perma-flourishing-suite.component';
import { PatientStateService } from '../services/patient-state.service';

describe('PermaFlourishingSuiteComponent', () => {
  let component: PermaFlourishingSuiteComponent;
  let fixture: ComponentFixture<PermaFlourishingSuiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermaFlourishingSuiteComponent],
      providers: [PatientStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(PermaFlourishingSuiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and displays PERMA-V Human Flourishing header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('PERMA-V Human Flourishing & Happiness Suite');
    expect(el.textContent).toContain('Positive Psychology Engine');
  });

  it('2. Computes the Flourishing Index correctly across 6 dimensions', () => {
    const dimensions = component.permaDimensions();
    expect(dimensions.length).toBe(6);
    const sum = dimensions.reduce((acc, d) => acc + d.score, 0);
    const expectedIndex = Math.round((sum / (dimensions.length * 10)) * 100);
    expect(component.flourishingIndex()).toBe(expectedIndex);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(`${expectedIndex}/100`);
  });

  it('3. Renders all 6 PERMA-V dimensions cards', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Positive Emotion');
    expect(el.textContent).toContain('Engagement');
    expect(el.textContent).toContain('Relationships');
    expect(el.textContent).toContain('Meaning');
    expect(el.textContent).toContain('Accomplishment');
    expect(el.textContent).toContain('Vitality');
  });

  it('4. Adds a new micro-joy gratitude log and updates count', () => {
    const initialCount = component.gratitudeLogs().length;
    component.newLogDimension = 'Engagement';
    component.newLogText = 'Deep focused coding on medical algorithms';
    component.addGratitudeLog();
    fixture.detectChanges();

    expect(component.gratitudeLogs().length).toBe(initialCount + 1);
    expect(component.gratitudeLogs()[0].entryText).toBe('Deep focused coding on medical algorithms');
    expect(component.gratitudeLogs()[0].permaDimension).toBe('Engagement');
    expect(component.newLogText).toBe('');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Deep focused coding on medical algorithms');
  });

  it('5. Does not add empty gratitude logs', () => {
    const initialCount = component.gratitudeLogs().length;
    component.newLogText = '   ';
    component.addGratitudeLog();
    expect(component.gratitudeLogs().length).toBe(initialCount);
  });
});
