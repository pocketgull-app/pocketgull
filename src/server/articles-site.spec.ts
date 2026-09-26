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

  it('renders salutogenic meal suggestions, Whole Foods staples, Amazon Rx benchmarks, and restorative hobbies', () => {
    const html = renderArticlesHtml('the-100000-dollar-oil-change');
    // Salutogenic Nutrition & Whole Foods Staples
    expect(html).toContain('Salutogenic Nutrition:');
    expect(html).toContain('Whole Foods Market 365 Organic Staples:');
    expect(html).toContain('365 Whole Foods Market Organic Cold-Pressed Extra Virgin Olive Oil');

    // Supportive Equipment & Amazon Pharmacy Rx Benchmarks
    expect(html).toContain('Supportive Tools &amp; Amazon Pharmacy Generic Rx Benchmarks');
    expect(html).toContain('FTC Affiliate Disclosure &amp; Clinical Demarcation:');
    expect(html).toContain('As an Amazon Associate and clinical intelligence platform, PocketGull earns from qualifying purchases');
    expect(html).toContain('View on Amazon &rarr;');
    expect(html).toContain('Amazon Pharmacy Generic Rx Benchmarks');
    expect(html).toContain('Lisinopril Tablets');

    // Restorative Hobbies
    expect(html).toContain('Complementary Restorative Hobbies &amp; Salutogenic Pacing');
    expect(html).toContain('0.10 Hz Bio-Rhythmic Resonance');
    expect(html).toContain('Horticultural Therapy &amp; Micro-Gardening');
    expect(html).toContain('Mindful Japanese Suminagashi');
  });
});
