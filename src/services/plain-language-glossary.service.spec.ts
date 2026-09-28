import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { PlainLanguageGlossaryService } from './plain-language-glossary.service';

describe('PlainLanguageGlossaryService', () => {
  let service: PlainLanguageGlossaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlainLanguageGlossaryService]
    });
    service = TestBed.inject(PlainLanguageGlossaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve Dhanvantari Ayurvedic Surgical Guilds translation', () => {
    const term = service.lookupTerm('dhanvantari surgical guild');
    expect(term).toBeDefined();
    expect(term?.term).toContain('Dhanvantari Surgical Guilds');
    expect(term?.term).toContain('Sushruta');
    expect(term?.category).toBe('Ayurvedic Vedic');
    expect(term?.plainDefinition).toContain('Dosha');
  });

  it('should retrieve Project 523 TCM & Allopathic translation', () => {
    const term = service.lookupTerm('project 523');
    expect(term).toBeDefined();
    expect(term?.term).toContain('Project 523');
    expect(term?.category).toBe('Eastern TCM');
    expect(term?.plainDefinition).toContain('Artemisinin');
    expect(term?.simpleAnalogy).toContain('malaria');
  });

  it('should retrieve Toronto Insulin discovery team translation', () => {
    const term = service.lookupTerm('toronto insulin team');
    expect(term).toBeDefined();
    expect(term?.term).toContain('Toronto Insulin Discovery Team');
    expect(term?.category).toBe('Western Physiology');
    expect(term?.plainDefinition).toContain('Banting');
  });

  it('should retrieve F1 Pit Crew ICU handover translation', () => {
    const term = service.lookupTerm('icu handover');
    expect(term).toBeDefined();
    expect(term?.term).toContain('F1 Pit Crew Model');
  });

  it('should retrieve Flight 1549 CRM surgical checklist translation', () => {
    const term = service.lookupTerm('surgical safety checklist');
    expect(term).toBeDefined();
    expect(term?.term).toContain('Flight 1549 Model');
  });

  it('should return undefined for unknown terms', () => {
    const term = service.lookupTerm('nonexistent jargon term');
    expect(term).toBeUndefined();
  });

  it('should return all registered terms', () => {
    const all = service.getAllTerms();
    expect(all.length).toBeGreaterThanOrEqual(10);
  });
});
