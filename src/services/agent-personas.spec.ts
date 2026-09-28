import { describe, it, expect } from 'vitest';
import { AGENT_PERSONAS, getPersonaForLens, getPersonaPropBadge } from './agent-personas';

describe('Gull Squadron Agent Personas Suite', () => {
  it('1. Verifies core personas definitions including Scribes and Socrates', () => {
    expect(AGENT_PERSONAS['gulliver']).toBeDefined();
    expect(AGENT_PERSONAS['swoop']).toBeDefined();
    expect(AGENT_PERSONAS['sentinel']).toBeDefined();
    expect(AGENT_PERSONAS['scribes']).toBeDefined();
    expect(AGENT_PERSONAS['socrates']).toBeDefined();

    const socrates = AGENT_PERSONAS['socrates'];
    expect(socrates.name).toBe('Professor Socrates Gull');
    expect(socrates.role).toContain('Socratic Demystifier');
    expect(socrates.gullVariety).toBe("Audouin's Gull");
    expect(socrates.scientificName).toBe('Ichthyaetus audouinii');
  });

  it('2. Maps analysis lenses accurately to corresponding avian personas', () => {
    expect(getPersonaForLens('Summary Overview').name).toBe('Gulliver');
    expect(getPersonaForLens('Patient Education').name).toBe('Scribes');
    expect(getPersonaForLens('Functional Protocols').name).toBe('Swoop');
    expect(getPersonaForLens('Monitoring & Follow-up').name).toBe('Sentinel');
    expect(getPersonaForLens('Skeptical Epistemology & Socratic Audit').name).toBe('Professor Socrates Gull');
  });

  it('3. Generates contextual persona prop badges', () => {
    const badge = getPersonaPropBadge('Skeptical Epistemology & Socratic Audit');
    expect(badge.badgeEmoji).toBe('🏛️');
    expect(badge.badgeLabel).toContain('Professor Socrates Gull');
    expect(badge.badgeClass).toBe('anim-dialectic-pulse');
  });
});
