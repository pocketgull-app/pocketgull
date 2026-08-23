import { describe, it, expect, beforeEach } from 'vitest';
import { TourismKioskEngine, KIOSK_STORY_CHAPTERS } from '../src/engine/tourism-kiosk.js';

describe('Tourism Kiosk Engine Suite', () => {
  let engine: TourismKioskEngine;

  beforeEach(() => {
    engine = new TourismKioskEngine();
  });

  it('should initialize with Chapter 1 (Moorlands) active and screensaver dormant', () => {
    const chapter = engine.getActiveChapter();
    expect(chapter.id).toBe('chapter_1_moorlands');
    expect(chapter.chapterNumber).toBe(1);
    expect(engine.getIsScreensaver()).toBe(false);
  });

  it('should cycle through all 6 chapters seamlessly via nextChapter() and prevChapter()', () => {
    expect(KIOSK_STORY_CHAPTERS.length).toBe(6);

    engine.nextChapter();
    expect(engine.getChapterIndex()).toBe(1);
    expect(engine.getActiveChapter().id).toBe('chapter_2_armor_lab');

    // Cycle to end
    engine.nextChapter(); // 2
    engine.nextChapter(); // 3
    engine.nextChapter(); // 4
    engine.nextChapter(); // 5
    expect(engine.getChapterIndex()).toBe(5);
    expect(engine.getActiveChapter().id).toBe('chapter_6_hospital_intake');

    // Wrap around to start
    engine.nextChapter();
    expect(engine.getChapterIndex()).toBe(0);

    // Step backwards
    engine.prevChapter();
    expect(engine.getChapterIndex()).toBe(5);
  });

  it('should trigger and wake from attract mode screensaver cleanly', () => {
    engine.triggerScreensaver();
    expect(engine.getIsScreensaver()).toBe(true);

    engine.wakeKiosk();
    expect(engine.getIsScreensaver()).toBe(false);
  });

  it('should generate valid mobile handoff URLs with kiosk query parameters', () => {
    const url = engine.generateMobileHandoffUrl('chapter_2_armor_lab');
    expect(url).toContain('chapter=chapter_2_armor_lab');
    expect(url).toContain('ref=kiosk');
  });
});
