import { describe, it, expect, beforeEach } from 'vitest';
import { NaturePlayTapeEngine, NATURE_PLAY_TAPE_TRACKS } from '../src/engine/nature-play-tape.js';

describe('Nature Play Tape Engine Suite', () => {
  let engine: NaturePlayTapeEngine;

  beforeEach(() => {
    engine = new NaturePlayTapeEngine();
  });

  it('should initialize on Side A with Track 1 (Sanford Farm Breeze) selected', () => {
    expect(engine.getActiveSide()).toBe('A');
    const track = engine.getActiveTrack();
    expect(track.id).toBe('track_1_moors_breeze');
    expect(track.trackNumber).toBe(1);
    expect(engine.getIsPlaying()).toBe(false);
  });

  it('should filter tracks correctly by Side A and Side B', () => {
    const sideA = engine.getTracksForSide('A');
    const sideB = engine.getTracksForSide('B');
    expect(sideA.length).toBe(3);
    expect(sideB.length).toBe(2);
    expect(sideA[0].side).toBe('A');
    expect(sideB[0].side).toBe('B');
  });

  it('should switch sides and update the active track accordingly', () => {
    engine.setSide('B');
    expect(engine.getActiveSide()).toBe('B');
    expect(engine.getActiveTrack().id).toBe('track_4_glacial_legend');

    engine.setSide('A');
    expect(engine.getActiveSide()).toBe('A');
    expect(engine.getActiveTrack().id).toBe('track_1_moors_breeze');
  });

  it('should handle track selection, rewind, and stop cleanly', () => {
    engine.selectTrack('track_2_bedtime_rhyme');
    expect(engine.getActiveTrack().id).toBe('track_2_bedtime_rhyme');
    expect(engine.getTapePosition()).toBe(0);

    engine.fastForward();
    expect(engine.getTapePosition()).toBe(15);

    engine.rewind();
    expect(engine.getTapePosition()).toBe(0);

    engine.stop();
    expect(engine.getIsPlaying()).toBe(false);
  });

  it('should maintain strict COPPA privacy: all stories must have zero PII prompts or external letter submission forms', () => {
    for (const track of NATURE_PLAY_TAPE_TRACKS) {
      expect(track.spokenStory).not.toContain('send your name');
      expect(track.spokenStory).not.toContain('email us');
      expect(track.spokenStory).not.toContain('mail your letter');
    }
  });
});
