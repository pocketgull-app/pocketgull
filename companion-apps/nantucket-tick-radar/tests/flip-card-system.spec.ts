import { describe, it, expect } from 'vitest';
import { SOURCES_BIBLIOGRAPHY } from '../src/data/sources-bibliography.js';
import { ARTICLES_LIBRARY } from '../src/data/articles-library.js';
import { NANTUCKET_PUBLIC_MEETING_NOTES } from '../src/data/public-meeting-notes.js';

class MockAppState {
  public globalReadingMode: 'clinical' | 'grade6' = 'clinical';
  public flippedCardIds = new Set<string>();

  public isCardFlipped(id: string): boolean {
    return this.flippedCardIds.has(id);
  }

  public toggleCardFlip(id: string) {
    if (this.flippedCardIds.has(id)) {
      this.flippedCardIds.delete(id);
    } else {
      this.flippedCardIds.add(id);
    }
  }

  public toggleGlobalReadingMode() {
    this.globalReadingMode = this.globalReadingMode === 'clinical' ? 'grade6' : 'clinical';
    if (this.globalReadingMode === 'grade6') {
      SOURCES_BIBLIOGRAPHY.forEach(s => this.flippedCardIds.add(s.id));
      ARTICLES_LIBRARY.forEach(a => this.flippedCardIds.add(a.id));
      NANTUCKET_PUBLIC_MEETING_NOTES.forEach(m => this.flippedCardIds.add(m.id));
    } else {
      this.flippedCardIds.clear();
    }
  }
}

describe('3D/Reduced-Motion Flip Card System State Machine', () => {
  it('should initialize with all cards in clinical mode', () => {
    const state = new MockAppState();
    expect(state.globalReadingMode).toBe('clinical');
    expect(state.isCardFlipped('src-001')).toBe(false);
    expect(state.isCardFlipped('art-001')).toBe(false);
    expect(state.isCardFlipped('meet-001')).toBe(false);
  });

  it('should toggle individual card flip state cleanly without affecting other cards', () => {
    const state = new MockAppState();
    state.toggleCardFlip('src-001');
    expect(state.isCardFlipped('src-001')).toBe(true);
    expect(state.isCardFlipped('src-002')).toBe(false);

    // Toggle back
    state.toggleCardFlip('src-001');
    expect(state.isCardFlipped('src-001')).toBe(false);
  });

  it('should flip all cards when global reading mode is toggled to grade6 and allow flipping back individual cards', () => {
    const state = new MockAppState();
    state.toggleGlobalReadingMode();
    expect(state.globalReadingMode).toBe('grade6');
    expect(state.isCardFlipped('src-001')).toBe(true);
    expect(state.isCardFlipped('art-001')).toBe(true);
    expect(state.isCardFlipped('boh-2026-tick-subsidy')).toBe(true);

    // User double clicks one card to view clinical while global is grade6
    state.toggleCardFlip('src-001');
    expect(state.isCardFlipped('src-001')).toBe(false);
    expect(state.isCardFlipped('src-002')).toBe(true);

    // Toggle global mode back to clinical clears all
    state.toggleGlobalReadingMode();
    expect(state.globalReadingMode).toBe('clinical');
    expect(state.isCardFlipped('src-001')).toBe(false);
    expect(state.isCardFlipped('src-002')).toBe(false);
  });
});
