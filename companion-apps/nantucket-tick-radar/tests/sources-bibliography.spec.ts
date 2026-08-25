import { describe, it, expect } from 'vitest';
import { SOURCES_BIBLIOGRAPHY } from '../src/data/sources-bibliography.js';

describe('Scientific Sources & Peer-Reviewed Bibliography', () => {
  it('1. Verifies all required clinical and ecological categories are represented', () => {
    expect(SOURCES_BIBLIOGRAPHY.length).toBeGreaterThanOrEqual(8);
    const categories = new Set(SOURCES_BIBLIOGRAPHY.map(s => s.category));
    expect(categories.has('Clinical Guidelines')).toBe(true);
    expect(categories.has('Molecular Biology')).toBe(true);
    expect(categories.has('Landscape Ecology')).toBe(true);
    expect(categories.has('Microclimate & Physics')).toBe(true);
    expect(categories.has('Repellents')).toBe(true);
    expect(categories.has('Saliva Pharmacology')).toBe(true);
  });

  it('2. Ensures every citation has valid DOI or URL and feature grounding', () => {
    for (const source of SOURCES_BIBLIOGRAPHY) {
      expect(source.doiOrUrl).toMatch(/^https?:\/\//);
      expect(source.appFeatureGrounded.length).toBeGreaterThan(10);
      expect(source.keyFindingSummary.length).toBeGreaterThan(20);
    }
  });

  it('3. Confirms IDSA Lantos 2021 and NEJM Nadelman 2001 are present', () => {
    const lantos = SOURCES_BIBLIOGRAPHY.find(s => s.authors.includes('Lantos'));
    expect(lantos).toBeDefined();
    expect(lantos?.year).toBe(2021);

    const nadelman = SOURCES_BIBLIOGRAPHY.find(s => s.authors.includes('Nadelman'));
    expect(nadelman).toBeDefined();
    expect(nadelman?.year).toBe(2001);
  });
});
