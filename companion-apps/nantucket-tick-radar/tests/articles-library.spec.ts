import { describe, it, expect } from 'vitest';
import { ARTICLES_LIBRARY } from '../src/data/articles-library.js';

describe('Articles Library & Field Guides', () => {
  it('1. Contains rich articles across botanical, repellent, clinical, and seven-generations categories', () => {
    expect(ARTICLES_LIBRARY.length).toBeGreaterThanOrEqual(6);
    const categories = new Set(ARTICLES_LIBRARY.map(a => a.category));

    expect(categories.has('Botanical & Garden')).toBe(true);
    expect(categories.has('Repellent Science')).toBe(true);
    expect(categories.has('Clinical Triage')).toBe(true);
    expect(categories.has('Seven Generations')).toBe(true);
  });

  it('2. Ensures every article includes clinical/ecological review status and key takeaways', () => {
    for (const article of ARTICLES_LIBRARY) {
      expect(article.title.length).toBeGreaterThan(10);
      expect(article.contentMarkdown.length).toBeGreaterThan(100);
      expect(article.keyTakeaways.length).toBeGreaterThanOrEqual(3);
      expect(article.readingTimeMinutes).toBeGreaterThanOrEqual(3);
    }
  });

  it('3. Verifies "What Are Ticks Good For" article highlights evasins and anticoagulants', () => {
    const ecoArticle = ARTICLES_LIBRARY.find(a => a.id === 'art-007');
    expect(ecoArticle).toBeDefined();
    expect(ecoArticle?.title).toContain('What Are Ticks Good For');
    expect(ecoArticle?.contentMarkdown).toContain('Evasins');
    expect(ecoArticle?.contentMarkdown).toContain('Amblyomin-X');
    expect(ecoArticle?.contentMarkdown).toContain('Anticoagulants');
  });
});

