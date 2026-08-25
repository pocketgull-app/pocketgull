import { describe, it, expect, beforeEach } from 'vitest';
import { CoppaPrivacyShieldEngine, COPPA_COMPLIANCE_RULES } from '../src/engine/coppa-privacy-shield.js';
import { NATURE_PLAY_TAPE_TRACKS } from '../src/engine/nature-play-tape.js';
import { NANTUCKET_PUBLIC_MEETING_NOTES } from '../src/data/public-meeting-notes.js';
import { UPCOMING_ISLAND_CIVIC_EVENTS } from '../src/data/island-civic-events.js';

describe('COPPA & Student Data Privacy Shield Suite (FTC 16 C.F.R. Part 312)', () => {
  let engine: CoppaPrivacyShieldEngine;

  beforeEach(() => {
    engine = new CoppaPrivacyShieldEngine();
  });

  it('should verify 100% compliance across all 5 core privacy pillars', () => {
    const summary = engine.getComplianceSummary();
    expect(summary.isFullyCompliant).toBe(true);
    expect(summary.activeTrackersCount).toBe(0);
    expect(summary.remotePiiStorageBytes).toBe(0);
    expect(COPPA_COMPLIANCE_RULES.length).toBe(5);
  });

  it('should render the Parent & Educator Privacy Shield modal with Zooniverse accreditation', () => {
    const html = engine.renderPrivacyShieldModalHtml();
    expect(html).toContain('Parent, Teacher &amp; Child Privacy Shield');
    expect(html).toContain('FTC 16 C.F.R. Part 312');
    expect(html).toContain('Zooniverse.org');
    expect(html).toContain('0 (Blocked)');
  });

  it('should ensure all Nature Play Tape tracks contain zero PII prompts or unmoderated mail solicitations', () => {
    for (const track of NATURE_PLAY_TAPE_TRACKS) {
      expect(track.spokenStory.toLowerCase()).not.toContain('write a letter');
      expect(track.spokenStory.toLowerCase()).not.toContain('send your name');
      expect(track.spokenStory.toLowerCase()).not.toContain('email us');
      expect(track.spokenStory.toLowerCase()).not.toContain('phone number');
    }
  });

  it('should ensure civic events and public meeting notes do not encourage children to submit unmoderated public letters', () => {
    for (const event of UPCOMING_ISLAND_CIVIC_EVENTS) {
      expect(event.description.toLowerCase()).not.toContain('letters written to island leaders');
    }
  });
});
