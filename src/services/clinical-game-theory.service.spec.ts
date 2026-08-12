import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { ClinicalGameTheoryService } from './clinical-game-theory.service';

describe('ClinicalGameTheoryService Unit Suite', () => {
  let service: ClinicalGameTheoryService;

  beforeEach(() => {
    service = new ClinicalGameTheoryService();
  });

  it('1. Stakes clinician confidence and resolves Brier score accuracy', () => {
    const record = service.stakeConfidence('rec_101', 'HIGH');
    expect(record.stake).toBe('HIGH');
    expect(service.stakes().length).toBe(1);

    // Resolve outcome: Verified success (1)
    service.resolveOutcome(record.id, 1);
    
    // (0.9 - 1.0)^2 = 0.01
    expect(service.brierScore()).toBe(0.01);
  });

  it('2. Evaluates Axelrod Tit-for-Tat reciprocal logging state', () => {
    service.patientLoggingStreak.set(5);
    const state5 = service.reciprocityState();
    expect(state5.status).toBe('MUTUAL_COOPERATION');
    expect(state5.rewardUnlocked).toContain('Unlocked');

    service.patientLoggingStreak.set(1);
    const state1 = service.reciprocityState();
    expect(state1.status).toBe('FORGIVING_RE_ENTRY');
    expect(state1.forgivingMessage).toContain('Take 1 quick minute');
  });

  it('3. Awards Spence signaling health literacy badges', () => {
    const badge = service.awardLiteracyBadge('Periodontal SIBI');
    expect(badge.topic).toBe('Periodontal SIBI');
    expect(badge.badgeName).toContain('Empowered Literacy');
    expect(service.literacyBadges().length).toBe(1);
  });

  it('4. Formats Prospect Theory loss-aversion longevity reserve preservation callouts', () => {
    const textKidney = service.formatLongevityReserveFrame('Kidney Proteinuria', 8.4);
    expect(textKidney).toContain('Preserves');
    expect(textKidney).toContain('kidney filtration reserve');

    const textHeart = service.formatLongevityReserveFrame('Heart Rate Tachycardia', 6.0);
    expect(textHeart).toContain('vagal autonomic recovery reserve');
  });

  it('5. Increments Public Goods data contribution pool counter', () => {
    const initial = service.totalContributors();
    service.contributeToPublicGoodsPool();
    expect(service.totalContributors()).toBe(initial + 1);
  });
});
