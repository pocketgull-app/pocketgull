/**
 * Clean, accessible Markdown-to-HTML parser for clinical articles and field guides.
 */
export function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown.split('\n');
  const htmlOut: string[] = [];
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Check if empty line
    if (!line) {
      if (inUl) { htmlOut.push('</ul>'); inUl = false; }
      if (inOl) { htmlOut.push('</ol>'); inOl = false; }
      continue;
    }

    // Horizontal Rule
    if (line === '---' || line === '***' || line === '___') {
      if (inUl) { htmlOut.push('</ul>'); inUl = false; }
      if (inOl) { htmlOut.push('</ol>'); inOl = false; }
      htmlOut.push('<hr style="border: 0; border-top: 1px solid var(--border-subtle); margin: 24px 0;" />');
      continue;
    }

    // Headings (H2, H3, H4)
    if (line.startsWith('### ')) {
      if (inUl) { htmlOut.push('</ul>'); inUl = false; }
      if (inOl) { htmlOut.push('</ol>'); inOl = false; }
      const text = formatInlineMarkdown(line.replace(/^###\s+/, ''));
      htmlOut.push(`<h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin: 22px 0 10px 0; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">${text}</h3>`);
      continue;
    }

    if (line.startsWith('#### ')) {
      if (inUl) { htmlOut.push('</ul>'); inUl = false; }
      if (inOl) { htmlOut.push('</ol>'); inOl = false; }
      const text = formatInlineMarkdown(line.replace(/^####\s+/, ''));
      htmlOut.push(`<h4 style="font-size: 0.95rem; font-weight: 700; color: #38bdf8; margin: 16px 0 8px 0;">${text}</h4>`);
      continue;
    }

    if (line.startsWith('## ')) {
      if (inUl) { htmlOut.push('</ul>'); inUl = false; }
      if (inOl) { htmlOut.push('</ol>'); inOl = false; }
      const text = formatInlineMarkdown(line.replace(/^##\s+/, ''));
      htmlOut.push(`<h2 style="font-size: 1.3rem; font-weight: 800; color: var(--text-primary); margin: 24px 0 12px 0;">${text}</h2>`);
      continue;
    }

    // Unordered List Items (* or -)
    if (/^[\*\-]\s+/.test(line)) {
      if (inOl) { htmlOut.push('</ol>'); inOl = false; }
      if (!inUl) {
        htmlOut.push('<ul style="padding-left: 20px; margin: 10px 0 16px 0; display: flex; flex-direction: column; gap: 8px;">');
        inUl = true;
      }
      const itemText = formatInlineMarkdown(line.replace(/^[\*\-]\s+/, ''));
      htmlOut.push(`<li style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.55;">${itemText}</li>`);
      continue;
    }

    // Ordered List Items (1., 2., etc)
    if (/^\d+\.\s+/.test(line)) {
      if (inUl) { htmlOut.push('</ul>'); inUl = false; }
      if (!inOl) {
        htmlOut.push('<ol style="padding-left: 20px; margin: 10px 0 16px 0; display: flex; flex-direction: column; gap: 8px;">');
        inOl = true;
      }
      const itemText = formatInlineMarkdown(line.replace(/^\d+\.\s+/, ''));
      htmlOut.push(`<li style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.55;">${itemText}</li>`);
      continue;
    }

    // Regular Paragraph
    if (inUl) { htmlOut.push('</ul>'); inUl = false; }
    if (inOl) { htmlOut.push('</ol>'); inOl = false; }
    const pText = formatInlineMarkdown(line);
    htmlOut.push(`<p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.65; margin-bottom: 12px;">${pText}</p>`);
  }

  if (inUl) htmlOut.push('</ul>');
  if (inOl) htmlOut.push('</ol>');

  return htmlOut.join('\n');
}

/**
 * Parses bold, italics, and inline styling.
 */
function formatInlineMarkdown(text: string): string {
  return text
    // Bold: **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-primary); font-weight: 700;">$1</strong>')
    // Italic: *text*
    .replace(/(^|[^\*])\*([^\*]+)\*([^\*]|$)/g, '$1<em style="color: #cbd5e1;">$2</em>$3')
    // Inline code / formula: `code`
    .replace(/`([^`]+)`/g, '<code style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 4px; padding: 2px 6px; font-family: monospace; font-size: 0.82rem; color: #34d399;">$1</code>');
}
