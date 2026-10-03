import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { FamilyHealthQuestComponent } from './family-health-quest.component';

describe('FamilyHealthQuestComponent Unit Suite', () => {
  let component: FamilyHealthQuestComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilyHealthQuestComponent]
    }).compileComponents();

    const fixture = TestBed.createComponent(FamilyHealthQuestComponent);
    component = fixture.componentInstance;
  });

  it('1. Instantiates successfully with English and family mode as defaults', () => {
    expect(component).toBeTruthy();
    expect(component.activeLanguage()).toBe('en');
    expect(component.activeMode()).toBe('family');
    expect(component.isRtl()).toBe(false);
    expect(component.completedCount()).toBe(0);
    expect(component.languages.length).toBeGreaterThanOrEqual(9);
  });

  it('2. Switches languages and detects RTL for Arabic', () => {
    component.setLanguage('es');
    expect(component.activeLanguage()).toBe('es');
    expect(component.isRtl()).toBe(false);

    component.setLanguage('ar');
    expect(component.activeLanguage()).toBe('ar');
    expect(component.isRtl()).toBe(true);
  });

  it('3. Changes companion mode and resets completed missions', () => {
    component.toggleMission('mission-1');
    expect(component.completedCount()).toBe(1);

    component.setMode('peer');
    expect(component.activeMode()).toBe('peer');
    expect(component.completedCount()).toBe(0);
  });

  it('4. Toggles mission completion status', () => {
    expect(component.isCompleted('quest-alpha')).toBe(false);
    component.toggleMission('quest-alpha');
    expect(component.isCompleted('quest-alpha')).toBe(true);
    expect(component.completedCount()).toBe(1);

    component.toggleMission('quest-alpha');
    expect(component.isCompleted('quest-alpha')).toBe(false);
    expect(component.completedCount()).toBe(0);
  });

  it('5. Computes active mode data and localized tagline', () => {
    const data = component.activeModeData();
    expect(data).toBeDefined();
    expect(data.title).toBeDefined();
    expect(component.getModeTagline().length).toBeGreaterThan(0);
  });
});
