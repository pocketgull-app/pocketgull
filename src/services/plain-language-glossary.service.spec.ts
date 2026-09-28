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

  it('should retrieve Allopathic team mechanistic specialization model', () => {
    const term = service.lookupTerm('allopathic team');
    expect(term).toBeDefined();
    expect(term?.term).toContain('Allopathic Team');
    expect(term?.plainDefinition).toContain('hyper-specialized');
  });

  it('should retrieve Integrated care team ecosystem model', () => {
    const term = service.lookupTerm('integrated care team');
    expect(term).toBeDefined();
    expect(term?.term).toContain('Ecosystem Care Network');
    expect(term?.category).toBe('Eastern TCM');
  });

  it('should retrieve Organizational Vata, Pitta, and Kapha models', () => {
    const vata = service.lookupTerm('organizational vata');
    const pitta = service.lookupTerm('organizational pitta');
    const kapha = service.lookupTerm('organizational kapha');
    const tridoshic = service.lookupTerm('tridoshic hospital balance');

    expect(vata?.term).toContain('Flow of Hospital Information');
    expect(pitta?.term).toContain('Clinical Interventions');
    expect(kapha?.term).toContain('Institutional Infrastructure');
    expect(tridoshic?.term).toContain('Tridoshic Organizational Balance');
  });

  it('should return undefined for unknown terms', () => {
    const term = service.lookupTerm('nonexistent jargon term');
    expect(term).toBeUndefined();
  });

  it('should return all registered terms', () => {
    const all = service.getAllTerms();
    expect(all.length).toBeGreaterThanOrEqual(15);
  });
});
