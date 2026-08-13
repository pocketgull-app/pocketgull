import '@angular/compiler';
import { describe, it, beforeEach, expect } from 'vitest';
import { SocraticJargonDictionaryService } from './socratic-jargon-dictionary.service';

describe('SocraticJargonDictionaryService Unit Suite', () => {
  let service: SocraticJargonDictionaryService;

  beforeEach(() => {
    service = new SocraticJargonDictionaryService();
  });

  it('1. Returns plain-English definition and advice for IRMAA', () => {
    const def = service.getDefinition('IRMAA');
    expect(def).not.toBeNull();
    expect(def?.term).toBe('IRMAA');
    expect(def?.plainEnglishDefinition).toContain('Medicare Part B and Part D');
    expect(def?.actionableAdvice).toContain('SSA-44');
  });

  it('2. Returns plain-English definition for HEDIS', () => {
    const def = service.getDefinition('hedis');
    expect(def).not.toBeNull();
    expect(def?.shortLabel).toContain('Quality Measure');
  });

  it('3. Handles unknown terms gracefully', () => {
    const def = service.getDefinition('UNKNOWN_ACRONYM_XYZ');
    expect(def).toBeNull();
  });
});
