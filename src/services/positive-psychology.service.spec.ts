import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { PositivePsychologyService } from './positive-psychology.service';

describe('PositivePsychologyService', () => {
  let service: PositivePsychologyService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [PositivePsychologyService]
    });
    service = runInInjectionContext(injector, () => injector.get(PositivePsychologyService));
  });

  it('1. Initializes PERMA-V 6 dimensions and computes composite flourishing index', () => {
    const dims = service.permaDimensions();
    expect(dims.length).toBe(6);
    expect(dims.map(d => d.key)).toEqual([
      'positiveEmotion',
      'engagement',
      'relationships',
      'meaning',
      'accomplishment',
      'vitality'
    ]);
    const index = service.flourishingIndex();
    expect(index).toBeGreaterThanOrEqual(80);
    expect(index).toBeLessThanOrEqual(100);
  });

  it('2. Dynamically updates dimension scores with boundedness [1, 10]', () => {
    service.updateDimensionScore('positiveEmotion', 1.0);
    const pos = service.permaDimensions().find(d => d.key === 'positiveEmotion');
    expect(pos?.score).toBe(9.5);

    service.updateDimensionScore('positiveEmotion', 5.0);
    const clamped = service.permaDimensions().find(d => d.key === 'positiveEmotion');
    expect(clamped?.score).toBe(10);
  });

  it('3. Manages VIA Character Strengths catalog and signature strength toggling', () => {
    const strengths = service.viaStrengthsCatalog();
    expect(strengths.length).toBeGreaterThanOrEqual(8);
    expect(service.selectedSignatureStrengthIds()).toContain('via_curiosity');

    service.toggleSignatureStrength('via_perseverance');
    expect(service.selectedSignatureStrengthIds()).toContain('via_perseverance');
    expect(service.selectedSignatureStrengths().some(s => s.id === 'via_perseverance')).toBe(true);
  });

  it('4. Reframes clinical adversity using Seligman ABCDE Explanatory Style', () => {
    const reframe = service.createCustomAbcdeReframe(
      'Blood pressure was elevated at doctor visit',
      'I am falling apart'
    );
    expect(reframe.category).toBe('CUSTOM');
    expect(reframe.disputation.permanence).toContain('Temporary');
    expect(reframe.disputation.pervasiveness).toContain('Specific');
    expect(reframe.disputation.personalization).toContain('Empowered Choice');
  });

  it('5. Records Three Good Things gratitude entries (Seligman 2005 protocol)', () => {
    const initialCount = service.threeGoodThingsLogs().length;
    service.addThreeGoodThingsLog(
      'Practiced 10 mins box breathing in sunshine',
      'Set an alarm to step away from laptop',
      'Vitality',
      'Self-Regulation'
    );
    expect(service.threeGoodThingsLogs().length).toBe(initialCount + 1);
    expect(service.threeGoodThingsLogs()[0].permaDimension).toBe('Vitality');
  });

  it('6. Generates Snyder Hope Theory multi-pathway choice architecture', () => {
    const hope = service.hopePathway();
    expect(hope.agencyScore).toBeGreaterThanOrEqual(80);
    expect(hope.pathways.length).toBeGreaterThanOrEqual(3);
    expect(hope.pathways.some(p => p.routeType === 'SOMATIC')).toBe(true);
    expect(hope.pathways.some(p => p.routeType === 'NUTRITIONAL')).toBe(true);
  });
});
