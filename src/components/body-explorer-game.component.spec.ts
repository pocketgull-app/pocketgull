import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { BodyExplorerGameComponent, ALL_AGES_ORGAN_CARDS } from './body-explorer-game.component';

describe('BodyExplorerGameComponent Unit Suite', () => {
  let comp: BodyExplorerGameComponent;

  beforeEach(() => {
    comp = new BodyExplorerGameComponent();
  });

  it('1. Initializes cleanly with 7 all-ages organ cards and 0 initial stars', () => {
    expect(comp).toBeTruthy();
    expect(comp.organs.length).toBe(7);
    expect(comp.matchedCount()).toBe(0);
    expect(comp.isGameWon()).toBe(false);
    expect(comp.currentTargetOrgan()).toBeTruthy();
  });

  it('2. Correctly matches an organ and increments stars and round', () => {
    const target = comp.currentTargetOrgan();
    comp.selectOrgan(target);

    expect(comp.isMatched(target.id)).toBe(true);
    expect(comp.matchedCount()).toBe(1);
    expect(comp.feedbackMessage()).toContain('Awesome job');
  });

  it('3. Provides gentle encouraging feedback on mismatch without penalty', () => {
    const target = comp.currentTargetOrgan();
    const wrong = ALL_AGES_ORGAN_CARDS.find(o => o.id !== target.id)!;
    
    comp.selectOrgan(wrong);
    expect(comp.isMatched(wrong.id)).toBe(false);
    expect(comp.matchedCount()).toBe(0);
    expect(comp.feedbackMessage()).toContain('Almost!');
  });

  it('4. Completes game when all organs are matched and restarts cleanly', () => {
    // Match all organs
    for (const organ of ALL_AGES_ORGAN_CARDS) {
      comp.matchedOrganIds.update(set => {
        const next = new Set(set);
        next.add(organ.id);
        return next;
      });
    }

    expect(comp.isGameWon()).toBe(true);
    expect(comp.matchedCount()).toBe(7);

    // Restart game
    comp.restartGame();
    expect(comp.matchedCount()).toBe(0);
    expect(comp.isGameWon()).toBe(false);
  });
});
