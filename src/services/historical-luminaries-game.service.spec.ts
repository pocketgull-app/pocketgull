import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { HistoricalLuminariesGameService } from './historical-luminaries-game.service';

describe('HistoricalLuminariesGameService - Historical Clinical Mystery Game', () => {
  let service: HistoricalLuminariesGameService;

  beforeEach(() => {
    service = new HistoricalLuminariesGameService(null);
  });

  it('1. Provides historical luminary clinical mystery cases', () => {
    const cases = service.getAllCases();
    expect(cases.length).toBeGreaterThanOrEqual(4);

    const names = cases.map(c => c.luminaryName);
    expect(names.some(n => n.includes('Curie'))).toBe(true);
    expect(names.some(n => n.includes('Darwin'))).toBe(true);
    expect(names.some(n => n.includes('Ramanujan'))).toBe(true);
    expect(names.some(n => n.includes('Kahlo'))).toBe(true);
  });

  it('2. Advances clue rounds progressively from 1 to 3', () => {
    expect(service.currentClueRound()).toBe(1);
    service.advanceClue();
    expect(service.currentClueRound()).toBe(2);
    service.advanceClue();
    expect(service.currentClueRound()).toBe(3);
    service.advanceClue(); // caps at 3
    expect(service.currentClueRound()).toBe(3);
  });

  it('3. Awards points for correct historical diagnosis based on clue efficiency', () => {
    const currentCase = service.getCurrentCase();
    const correctOpt = currentCase.options.find(o => o.isHistoricallyAccepted)!;

    const isCorrect = service.submitDiagnosis(correctOpt.id);
    expect(isCorrect).toBe(true);
    expect(service.score()).toBe(100); // Round 1 solve gives 100 points
    expect(service.isCaseResolved()).toBe(true);
  });

  it('4. Advances to next luminary and resets round states', () => {
    service.nextCase();
    expect(service.currentCaseIndex()).toBe(1);
    expect(service.currentClueRound()).toBe(1);
    expect(service.isCaseResolved()).toBe(false);
  });

  it('5. Maps luminaries to active patient archetypes for clinical workbench loading', () => {
    const curieCase = service.getAllCases().find(c => c.id === 'curie')!;
    expect(curieCase.patientMockId).toBe('p_marie_curie');

    const darwinCase = service.getAllCases().find(c => c.id === 'darwin')!;
    expect(darwinCase.patientMockId).toBe('p_charles_darwin');
  });
});
