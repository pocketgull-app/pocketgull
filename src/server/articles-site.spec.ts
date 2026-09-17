import { describe, it, expect } from 'vitest';
import { renderArticlesHtml } from './articles-site';

describe('Articles Site Server-Side Rendering', () => {
  it('renders index page when no slug is provided', () => {
    const html = renderArticlesHtml();
    expect(html).toContain('Clinical Breakthroughs');
    expect(html).toContain('The $100,000 Oil Change');
  });

  it('handles pathological repeated slashes in slug without ReDoS', () => {
    const maliciousSlug = '/////' + '/'.repeat(1000) + 'the-100000-dollar-oil-change' + '/'.repeat(1000) + '///';
    const t0 = performance.now();
    const html = renderArticlesHtml(maliciousSlug);
    const durationMs = performance.now() - t0;

    expect(html).toContain('The $100,000 Oil Change');
    expect(durationMs).toBeLessThan(50);
  });

  it('renders specific article by slug when matched', () => {
    const html = renderArticlesHtml('the-100000-dollar-oil-change');
    expect(html).toContain('The $100,000 Oil Change');
    expect(html).toContain('https://pocketgull.com/articles/the-100000-dollar-oil-change');
  });

  it('safely handles empty or undefined slugs', () => {
    expect(renderArticlesHtml('')).toContain('Clinical Breakthroughs');
    expect(renderArticlesHtml('   ')).toContain('Clinical Breakthroughs');
    expect(renderArticlesHtml('///')).toContain('Clinical Breakthroughs');
  });
});
