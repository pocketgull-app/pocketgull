import '@angular/compiler';
import { expect } from 'vitest';
import { JoyPlayfulFlourishingService } from './joy-playful-flourishing.service';

describe('JoyPlayfulFlourishingService Unit Suite', () => {
  let service: JoyPlayfulFlourishingService;

  beforeEach(() => {
    service = new JoyPlayfulFlourishingService();
  });

  it('1. Initializes default micro-joy prescriptions', () => {
    const list = service.dailyPrescriptions();
    expect(list.length).toBeGreaterThanOrEqual(5);
    expect(list[0].title).toContain('Acoustic Neuro-Rhythm');
    expect(list[0].adaptedForTremorOrCognitive).toBe(true);
  });

  it('2. Toggles micro-joy activity completion status', () => {
    const initialList = service.dailyPrescriptions();
    const id = initialList[0].id;
    expect(initialList[0].isCompletedToday).toBe(false);

    service.toggleActivityCompletion(id);
    const updatedList = service.dailyPrescriptions();
    expect(updatedList[0].isCompletedToday).toBe(true);
  });

  it('3. Computes PERMA+ Joy & Playfulness Scorecard', () => {
    const scorecard = service.calculateJoyScorecard();
    expect(scorecard.compositeJoyIndex).toBeGreaterThanOrEqual(50);
    expect(scorecard.playfulFlourishingDirective).toBeDefined();
  });
});
