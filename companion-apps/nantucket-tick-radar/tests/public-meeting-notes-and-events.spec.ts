import { describe, it, expect } from 'vitest';
import { NANTUCKET_PUBLIC_MEETING_NOTES } from '../src/data/public-meeting-notes.js';
import { UPCOMING_ISLAND_CIVIC_EVENTS } from '../src/data/island-civic-events.js';
import { NANTUCKET_LOCATIONS } from '../src/data/nantucket-geo.js';

describe('Town Halls, Public Meeting Notes & Future Events Suite', () => {
  it('should include Town Hall, Library, Senior Center, and Civic locations', () => {
    const townHall = NANTUCKET_LOCATIONS.find(l => l.id === 'nantucket-town-hall');
    const atheneum = NANTUCKET_LOCATIONS.find(l => l.id === 'nantucket-atheneum');
    const seniorCenter = NANTUCKET_LOCATIONS.find(l => l.id === 'saltmarsh-senior-center');
    const healthDept = NANTUCKET_LOCATIONS.find(l => l.id === 'nantucket-health-dept');

    expect(townHall).toBeDefined();
    expect(townHall?.category).toBe('town_hall');

    expect(atheneum).toBeDefined();
    expect(atheneum?.category).toBe('library');

    expect(seniorCenter).toBeDefined();
    expect(seniorCenter?.category).toBe('senior_center');

    expect(healthDept).toBeDefined();
    expect(healthDept?.category).toBe('civic_center');
  });

  it('should contain verified public meeting notes with 6th-grade family summaries and librarian guides', () => {
    expect(NANTUCKET_PUBLIC_MEETING_NOTES.length).toBeGreaterThanOrEqual(5);

    NANTUCKET_PUBLIC_MEETING_NOTES.forEach(note => {
      expect(note.title.length).toBeGreaterThan(10);
      expect(note.governingBody.length).toBeGreaterThan(5);
      expect(note.keyDecisionsAndVotes.length).toBeGreaterThan(0);
      expect(note.publicCommentsSummary.length).toBeGreaterThan(0);
      expect(note.grandparentAndFamilyTakeaway.length).toBeGreaterThan(20);
      expect(note.librarianDiscussionGuide.length).toBeGreaterThan(20);
      expect(note.officialReferenceDoc.length).toBeGreaterThan(5);
    });
  });

  it('should contain upcoming civic events across library, town hall, senior center, and schools', () => {
    expect(UPCOMING_ISLAND_CIVIC_EVENTS.length).toBeGreaterThanOrEqual(6);

    const categories = UPCOMING_ISLAND_CIVIC_EVENTS.map(e => e.category);
    expect(categories).toContain('Library Workshop');
    expect(categories).toContain('Public Hearing');
    expect(categories).toContain('Family Nature Walk');
    expect(categories).toContain('Senior Wellness');
    expect(categories).toContain('Citizen Science');

    UPCOMING_ISLAND_CIVIC_EVENTS.forEach(ev => {
      expect(ev.isFreeEvent).toBe(true);
      expect(ev.date.length).toBeGreaterThan(5);
      expect(ev.time.length).toBeGreaterThan(3);
      expect(ev.rsvpOrContact.length).toBeGreaterThan(5);
    });
  });
});
