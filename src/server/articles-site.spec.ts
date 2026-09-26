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

  it('renders the Masters of Science Fiction clinical AI article with breakthrough framework', () => {
    const html = renderArticlesHtml('masters-of-science-fiction-clinical-ai');
    expect(html).toContain('Masters of Science Fiction');
    expect(html).toContain('Walter Mosley');
    expect(html).toContain('Stephen Hawking');
    expect(html).toContain('https://pocketgull.com/articles/masters-of-science-fiction-clinical-ai');
  });

  it('renders the Google Cloud Healthcare API & Clinical Models article with tri-mode reading toolbar', () => {
    const html = renderArticlesHtml('google-healthcare-api-clinical-models');
    expect(html).toContain('The Digital Vault &amp; The Calibrated Mirror');
    expect(html).toContain('Google Cloud Healthcare API');
    expect(html).toContain('Reading Level:');
    expect(html).toContain('🎓 Standard');
    expect(html).toContain('🌱 6th Grade');
    expect(html).toContain('⚡ Bionic Fixation Mode');
    expect(html).toContain('Interactive 3D App →');
    expect(html).toContain('id="content-standard"');
    expect(html).toContain('id="content-grade6"');
    expect(html).toContain('id="content-bionic"');
    expect(html).toContain('https://pocketgull.com/articles/google-healthcare-api-clinical-models');
  });

  it('safely handles empty or undefined slugs', () => {
    expect(renderArticlesHtml('')).toContain('Clinical Breakthroughs');
    expect(renderArticlesHtml('   ')).toContain('Clinical Breakthroughs');
    expect(renderArticlesHtml('///')).toContain('Clinical Breakthroughs');
  });
});
