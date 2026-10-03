import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { PositivePsychologyFlourishingHubComponent } from './positive-psychology-flourishing-hub.component';
import { PositivePsychologyService } from '../services/positive-psychology.service';

describe('PositivePsychologyFlourishingHubComponent Unit Suite', () => {
  let component: PositivePsychologyFlourishingHubComponent;
  let posPsychService: PositivePsychologyService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PositivePsychologyFlourishingHubComponent],
      providers: [PositivePsychologyService]
    }).compileComponents();

    const fixture = TestBed.createComponent(PositivePsychologyFlourishingHubComponent);
    component = fixture.componentInstance;
    posPsychService = TestBed.inject(PositivePsychologyService);
  });

  it('1. Instantiates successfully with PERMA tab and positive flourishing index', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('perma');
    expect(posPsychService.flourishingIndex()).toBeGreaterThan(0);
    expect(posPsychService.permaDimensions().length).toBeGreaterThan(0);
  });

  it('2. Switches between positive psychology sub-tabs', () => {
    component.activeTab.set('abcde');
    expect(component.activeTab()).toBe('abcde');

    component.activeTab.set('via');
    expect(component.activeTab()).toBe('via');

    component.activeTab.set('gratitude');
    expect(component.activeTab()).toBe('gratitude');

    component.activeTab.set('hope');
    expect(component.activeTab()).toBe('hope');

    component.activeTab.set('perma');
    expect(component.activeTab()).toBe('perma');
  });

  it('3. Selects and resolves ABCDE Learned Optimism reframing scenario', () => {
    const library = posPsychService.abcdeLibrary();
    expect(library.length).toBeGreaterThan(0);

    const firstId = library[0].id;
    component.selectedAbcdeId.set(firstId);
    const active = component.activeAbcde();
    expect(active.id).toBe(firstId);
    expect(active.adversity).toBeDefined();
    expect(active.disputation.permanence).toBeDefined();
  });

  it('4. Provides VIA character strengths and Snyder hope pathways', () => {
    expect(posPsychService.viaStrengthsCatalog().length).toBeGreaterThan(0);
    const hope = posPsychService.hopePathway();
    expect(hope).toBeDefined();
    expect(hope.pathways.length).toBeGreaterThan(0);
  });

  it('5. Adds Three Good Things gratitude log entry', () => {
    const addSpy = vi.spyOn(posPsychService, 'addThreeGoodThingsLog');
    component.newGratitudeEvent = 'Morning sunlight walk with family';
    component.newGratitudeWhy = 'Gave me physical energy and calm focus';
    component.newGratitudeDimension = 'Positive Emotion';
    component.newGratitudeStrength = 'Gratitude';

    component.addGratitudeEntry();
    expect(addSpy).toHaveBeenCalledWith(
      'Morning sunlight walk with family',
      'Gave me physical energy and calm focus',
      'Positive Emotion',
      'Gratitude'
    );
    expect(component.newGratitudeEvent).toBe('');
    expect(component.newGratitudeWhy).toBe('');
  });
});
