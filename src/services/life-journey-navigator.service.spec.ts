import '@angular/compiler';
import { LifeJourneyNavigatorService, LIFE_JOURNEY_PROFILES } from './life-journey-navigator.service';

describe('LifeJourneyNavigatorService Suite', () => {
  let service: LifeJourneyNavigatorService;

  beforeEach(() => {
    service = new LifeJourneyNavigatorService();
  });

  it('1. Initializes with frontline_healer as default stage and energy level 5', () => {
    expect(service.currentStage()).toBe('frontline_healer');
    expect(service.energyLevel()).toBe(5);
    expect(service.currentProfile().title).toContain('Frontline Healer');
    expect(service.currentProfile().languageTone).toBe('empathetic_grounded');
  });

  it('2. Contains all 5 life journey profiles covering scholars, healers, patients, mothers, and elders', () => {
    expect(LIFE_JOURNEY_PROFILES.length).toBe(5);

    const seeker = LIFE_JOURNEY_PROFILES.find(p => p.stage === 'seeker_student');
    expect(seeker).toBeDefined();
    expect(seeker?.acousticResonance).toContain('40 Hz Gamma');

    const wounded = LIFE_JOURNEY_PROFILES.find(p => p.stage === 'wounded_traveler');
    expect(wounded).toBeDefined();
    expect(wounded?.acousticResonance).toContain('EMDR Bilateral');
    expect(wounded?.languageTone).toBe('gentle_restorative');

    const maternal = LIFE_JOURNEY_PROFILES.find(p => p.stage === 'sacred_first_1000');
    expect(maternal).toBeDefined();
    expect(maternal?.acousticResonance).toContain('528 Hz');

    const elder = LIFE_JOURNEY_PROFILES.find(p => p.stage === 'elder_storyteller');
    expect(elder).toBeDefined();
    expect(elder?.acousticResonance).toContain('432 Hz');
  });

  it('3. Safely updates active journey stage and clamps energy levels between 1 and 10', () => {
    service.setJourneyStage('wounded_traveler');
    expect(service.currentStage()).toBe('wounded_traveler');
    expect(service.currentProfile().title).toBe('The Wounded Traveler');

    service.setEnergyLevel(8);
    expect(service.energyLevel()).toBe(8);

    service.setEnergyLevel(15);
    expect(service.energyLevel()).toBe(10);

    service.setEnergyLevel(-3);
    expect(service.energyLevel()).toBe(1);
  });
});
