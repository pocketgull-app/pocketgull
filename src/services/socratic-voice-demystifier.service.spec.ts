import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SocraticVoiceDemystifierService } from './socratic-voice-demystifier.service';

describe('SocraticVoiceDemystifierService', () => {
  let service: SocraticVoiceDemystifierService;

  beforeEach(() => {
    service = new SocraticVoiceDemystifierService();
  });

  it('1. Initializes default personas and Rachel Nabors parasympathetic calm profile', () => {
    expect(service.personas.length).toBe(4);
    const active = service.activePersona();
    expect(active.id).toBe('persona-parasympathetic-calm');
    expect(active.speechRate).toBeLessThan(1.0); // Calming slow pace
    expect(active.vagalCadencePauseMs).toBeGreaterThanOrEqual(600);
  });

  it('2. Demystifies terrifying medical jargon into comforting Socratic analogies', () => {
    const rawNote = 'Patient presents with idiopathic thrombocytopenic purpura and essential hypertension.';
    const result = service.demystifyText(rawNote);

    expect(result.demystifiedTermsCount).toBe(2);
    expect(result.processedText).toContain('band-aids');
    expect(result.processedText).toContain('bike tire holding 45 PSI');
    expect(result.processedText).not.toBe(rawNote);
  });

  it('3. Leaves normal conversational prose untouched when no medical jargon is present', () => {
    const normalText = 'Good morning, how are your walking steps and garden congee breakfast today?';
    const result = service.demystifyText(normalText);

    expect(result.demystifiedTermsCount).toBe(0);
    expect(result.processedText).toBe(normalText);
  });

  it('4. Successfully updates voice persona and speech rate multiplier', () => {
    service.setPersona('persona-elder-clarity');
    expect(service.activePersona().id).toBe('persona-elder-clarity');
    expect(service.activePersona().role).toBe('Elder High-Clarity Voice');

    service.speechRateMultiplier.set(0.8);
    expect(service.speechRateMultiplier()).toBe(0.8);
  });

  it('5. Toggles hands-free mode cleanly', () => {
    expect(service.isHandsFreeActive()).toBe(false);
    service.toggleHandsFree();
    expect(service.isHandsFreeActive()).toBe(true);
    service.toggleHandsFree();
    expect(service.isHandsFreeActive()).toBe(false);
  });
});
