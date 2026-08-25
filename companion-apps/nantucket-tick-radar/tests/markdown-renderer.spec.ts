import { describe, it, expect } from 'vitest';
import { renderMarkdownToHtml } from '../src/engine/markdown-renderer.js';
import { ARTICLES_LIBRARY } from '../src/data/articles-library.js';

describe('Markdown to HTML Engine Suite', () => {
  it('should parse headings, lists, bold, and horizontal rules into valid HTML', () => {
    const rawMarkdown = `
### Section Title

Here is a paragraph with **bold text** and *italic words*.

---

#### Subsection
* Item 1
* Item 2
* Item 3

1. First step
2. Second step
    `;

    const html = renderMarkdownToHtml(rawMarkdown);

    expect(html).toContain('<h3');
    expect(html).toContain('Section Title</h3>');
    expect(html).toContain('<h4');
    expect(html).toContain('Subsection</h4>');
    expect(html).toContain('<strong');
    expect(html).toContain('bold text</strong>');
    expect(html).toContain('<em');
    expect(html).toContain('italic words</em>');
    expect(html).toContain('<ul');
    expect(html).toContain('Item 1</li>');
    expect(html).toContain('Item 2</li>');
    expect(html).toContain('</ul>');
    expect(html).toContain('<ol');
    expect(html).toContain('First step</li>');
    expect(html).toContain('Second step</li>');
    expect(html).toContain('</ol>');
    expect(html).toContain('<hr');
  });

  it('should cleanly parse all articles in the library without error', () => {
    expect(ARTICLES_LIBRARY.length).toBeGreaterThanOrEqual(8);
    for (const article of ARTICLES_LIBRARY) {
      const html = renderMarkdownToHtml(article.contentMarkdown);
      expect(html.length).toBeGreaterThan(100);
      expect(html).not.toContain('### ');
      expect(html).not.toContain('#### ');
      expect(html).toContain('<h3');
    }
  });
});
