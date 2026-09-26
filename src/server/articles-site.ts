/**
 * PocketGull Server-Side Rendered Articles Hub & Breakthrough Inventions Reader
 * Serves pocketgull.com/articles and pocketgull.com/articles/:slug
 */

import { FALLBACK_SEED_ARTICLES, IWordPressPost } from '../services/wordpress-articles.service';
import { renderLegalFooterHtml } from './legal-footer';

function escapeHtml(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function sanitizeSlug(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  let start = 0;
  let end = trimmed.length;
  while (start < end && trimmed.charCodeAt(start) === 47 /* '/' */) {
    start++;
  }
  while (end > start && trimmed.charCodeAt(end - 1) === 47 /* '/' */) {
    end--;
  }
  return trimmed.substring(start, end);
}

function applyBionicText(html: string): string {
  if (!html) return '';
  const pOpen = '<p';
  const pClose = '</p>';
  let result = '';
  let cursor = 0;
  const lowerHtml = html.toLowerCase();

  while (cursor < html.length) {
    const startIdx = lowerHtml.indexOf(pOpen, cursor);
    if (startIdx === -1) {
      result += html.slice(cursor);
      break;
    }
    result += html.slice(cursor, startIdx);

    const tagEnd = html.indexOf('>', startIdx);
    if (tagEnd === -1) {
      result += html.slice(startIdx);
      break;
    }
    const openTag = html.slice(startIdx, tagEnd + 1);

    const closeIdx = lowerHtml.indexOf(pClose, tagEnd + 1);
    if (closeIdx === -1) {
      result += html.slice(startIdx);
      break;
    }

    const inner = html.slice(tagEnd + 1, closeIdx);
    const closeTag = html.slice(closeIdx, closeIdx + pClose.length);

    const words = inner.split(' ');
    const transformed = words.map((word: string) => {
      if (!word || word.startsWith('<') || word.startsWith('&')) return word;
      const mid = Math.ceil(word.length / 2);
      return `<b>${word.slice(0, mid)}</b>${word.slice(mid)}`;
    }).join(' ');

    result += `${openTag}${transformed}${closeTag}`;
    cursor = closeIdx + pClose.length;
  }

  return result;
}

export function renderArticlesHtml(requestedSlug?: string): string {
  const cleanSlug = sanitizeSlug(requestedSlug);
  const isSingle = Boolean(cleanSlug && cleanSlug !== 'all');
  const post: IWordPressPost | undefined = isSingle
    ? FALLBACK_SEED_ARTICLES.find(p => p.slug === cleanSlug || String(p.id) === cleanSlug)
    : undefined;

  const pageTitle = post
    ? `${escapeHtml(post.title)} — PocketGull Clinical Articles`
    : 'Clinical Breakthroughs & Health Literacy Hub — PocketGull';

  const pageDesc = post
    ? escapeHtml(post.excerpt)
    : 'Explore evidence-grounded medical insights, 15 clinical paradigms, 3D anatomical staging, and multi-timeline action matrices.';

  const canonicalUrl = post
    ? `https://pocketgull.com/articles/${post.slug}`
    : 'https://pocketgull.com/articles';

  const jsonLd = post ? JSON.stringify({
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "headline": post.title,
    "description": post.excerpt,
    "url": canonicalUrl,
    "mainEntity": {
      "@type": "MedicalScholarlyArticle",
      "headline": post.title,
      "datePublished": post.date || "2026-09-15T00:00:00Z",
      "author": {
        "@type": "Organization",
        "name": "PocketGull Skunk Works Clinical Research",
        "url": "https://pocketgull.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "PocketGull",
        "url": "https://pocketgull.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://pocketgull.com/brand/pocketgull-logo.png"
        }
      }
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://pocketgull.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Articles",
          "item": "https://pocketgull.com/articles"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": post.title,
          "item": canonicalUrl
        }
      ]
    }
  }, null, 2) : JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "PocketGull Clinical Breakthroughs & Health Literacy Hub",
    "description": "Explore evidence-grounded medical insights, 15 clinical paradigms, 3D anatomical staging, and multi-timeline action matrices.",
    "url": "https://pocketgull.com/articles",
    "publisher": {
      "@type": "Organization",
      "name": "PocketGull",
      "url": "https://pocketgull.com"
    }
  }, null, 2);

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#09090b" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDesc}" />
  <meta property="og:title" content="${pageTitle}" />
  <meta property="og:description" content="${pageDesc}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:type" content="${post ? 'article' : 'website'}" />
  <meta property="og:site_name" content="PocketGull" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${pageTitle}" />
  <meta name="twitter:description" content="${pageDesc}" />
  <meta name="twitter:site" content="@pocketgull" />
  <link rel="canonical" href="${canonicalUrl}" />
  <script type="application/ld+json">
${jsonLd}
  </script>
  
  <style>
    @font-face {
      font-family: 'PocketGull';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: url('/fonts/PocketGull-Bold.woff2') format('woff2'),
           url('/fonts/PocketGull-Bold.ttf') format('truetype');
    }
    @font-face {
      font-family: 'PocketGull';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url('/fonts/PocketGull-Fineliner.woff2') format('woff2'),
           url('/fonts/PocketGull-Fineliner.ttf') format('truetype');
    }
    .font-brand {
      font-family: 'PocketGull', -apple-system, BlinkMacSystemFont, sans-serif;
      letter-spacing: -0.01em;
    }
    :root {
      --bg: #09090b;
      --card: #18181b;
      --card-hover: #222227;
      --border: #27272a;
      --teal: #14b8a6;
      --teal-light: #2dd4bf;
      --teal-glow: rgba(45, 212, 191, 0.15);
      --amber: #f59e0b;
      --amber-light: #fbbf24;
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.65;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    a {
      color: var(--teal-light);
      text-decoration: none;
      transition: color 0.15s ease;
    }
    a:hover {
      color: #5eead4;
    }
    .container {
      width: 100%;
      max-width: 1180px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }
    header {
      background: rgba(9, 9, 11, 0.88);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.35rem;
      font-weight: 800;
      color: #fff;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.75rem;
      font-size: 0.95rem;
      font-weight: 600;
    }
    .btn-primary {
      background: var(--teal);
      color: #09090b;
      font-weight: 700;
      padding: 0.6rem 1.25rem;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.875rem;
      transition: transform 0.15s ease, background 0.15s ease;
    }
    .btn-primary:hover {
      background: var(--teal-light);
      transform: translateY(-1px);
      color: #09090b;
    }
    .btn-secondary {
      background: #27272a;
      color: #fff;
      font-weight: 600;
      padding: 0.55rem 1.1rem;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.875rem;
      border: 1px solid #3f3f46;
    }
    .btn-secondary:hover {
      background: #3f3f46;
      color: #fff;
    }
    .hero-banner {
      padding: 3.5rem 0 2rem;
      background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(20, 184, 166, 0.15), transparent 70%);
      border-bottom: 1px solid var(--border);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      background: rgba(20, 184, 166, 0.1);
      border: 1px solid rgba(20, 184, 166, 0.3);
      color: var(--teal-light);
      margin-bottom: 1rem;
    }
    .articles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.5rem;
      margin: 2.5rem 0 4rem;
    }
    .article-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 1.25rem;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: border-color 0.2s, transform 0.2s, background 0.2s;
    }
    .article-card:hover {
      border-color: var(--teal);
      transform: translateY(-2px);
      background: var(--card-hover);
    }
    .article-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
    }
    .category-tag {
      background: rgba(245, 158, 11, 0.15);
      color: var(--amber-light);
      padding: 0.2rem 0.6rem;
      border-radius: 0.5rem;
      font-size: 0.75rem;
      font-weight: 700;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .article-card h3 {
      font-size: 1.2rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.75rem;
      line-height: 1.35;
    }
    .article-card p {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
      line-height: 1.55;
    }
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    /* Single Article Reader Layout */
    .article-layout {
      padding: 3rem 0 5rem;
      max-width: 860px;
      margin: 0 auto;
    }
    .reading-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      background: #18181b;
      border: 1px solid var(--border);
      padding: 0.75rem 1.25rem;
      border-radius: 1rem;
      margin: 1.75rem 0 2.5rem;
    }
    .tool-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .toggle-btn {
      background: #27272a;
      border: 1px solid #3f3f46;
      color: #d4d4d8;
      padding: 0.4rem 0.85rem;
      border-radius: 0.6rem;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .toggle-btn.active {
      background: var(--teal);
      color: #09090b;
      border-color: var(--teal-light);
    }
    .article-body {
      font-size: 1.125rem;
      line-height: 1.8;
      color: #e4e4e7;
    }
    .article-body p {
      margin-bottom: 1.5rem;
    }
    .article-body blockquote {
      border-left: 4px solid var(--teal);
      padding: 1rem 1.5rem;
      margin: 2rem 0;
      background: rgba(20, 184, 166, 0.08);
      border-radius: 0 1rem 1rem 0;
      font-style: italic;
      color: #fff;
    }
    .matrix-card {
      background: #18181b;
      border: 1px solid var(--border);
      border-radius: 1.25rem;
      padding: 1.75rem;
      margin: 2rem 0;
    }
    .matrix-stage {
      padding: 1rem;
      border-radius: 0.85rem;
      background: #121215;
      border-left: 3px solid var(--teal);
      margin-bottom: 1rem;
    }
    .invention-box {
      background: radial-gradient(circle at 100% 0%, rgba(245, 158, 11, 0.12), transparent 50%), #18181b;
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 1.25rem;
      padding: 1.75rem;
      margin: 2.5rem 0;
    }
    .citations-box {
      background: #121215;
      border: 1px solid var(--border);
      border-radius: 1.25rem;
      padding: 1.5rem;
      margin-top: 3rem;
    /* Salutogenic Nutrition, Equipment & Restorative Lifestyle */
    .salutogenic-section {
      background: #18181b;
      border: 1px solid var(--border);
      border-radius: 1.25rem;
      padding: 1.75rem;
      margin: 2.5rem 0;
    }
    .salutogenic-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .salutogenic-header h3 {
      font-size: 1.2rem;
      font-weight: 800;
      color: #fff;
    }
    .salutogenic-subtitle {
      font-size: 0.8rem;
      color: var(--teal-light);
      font-family: ui-monospace, monospace;
    }
    .grid-2col {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .salutogenic-card {
      background: #121215;
      border: 1px solid var(--border);
      border-radius: 0.85rem;
      padding: 1.15rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .salutogenic-tag {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.2rem 0.5rem;
      border-radius: 0.3rem;
      display: inline-block;
      margin-bottom: 0.5rem;
    }
    .staples-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .staple-pill {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #a7f3d0;
      font-size: 0.75rem;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
    }
    .ftc-banner {
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 0.65rem;
      padding: 0.75rem 1rem;
      font-size: 0.75rem;
      color: #fde68a;
      line-height: 1.5;
      margin-bottom: 1.25rem;
    }
    .rx-benchmark-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8rem;
      margin-top: 1rem;
    }
    .rx-benchmark-table th {
      text-align: left;
      padding: 0.5rem 0.75rem;
      background: #1e1e24;
      color: #d4d4d8;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .rx-benchmark-table td {
      padding: 0.65rem 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: #e4e4e7;
    }
    .price-retail {
      text-decoration: line-through;
      color: #a1a1aa;
      font-size: 0.75rem;
    }
    .price-amazon {
      color: #34d399;
      font-weight: 700;
    }

    footer {
      background: #09090b;
      border-top: 1px solid var(--border);
      padding: 2.5rem 0;
      margin-top: auto;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    @media (max-width: 768px) {
      .nav-links { display: none; }
      .articles-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

  <!-- Navigation Header -->
  <header>
    <div class="container header-inner">
      <a href="/" class="logo">
        <span style="font-size: 1.5rem;">🩺</span>
        <span class="font-brand">PocketGull</span>
        <span style="font-size: 0.75rem; font-weight: 700; color: var(--teal-light); text-transform: uppercase; letter-spacing: 0.1em; background: rgba(20,184,166,0.15); padding: 0.2rem 0.5rem; border-radius: 0.4rem; border: 1px solid rgba(20,184,166,0.3);">Articles</span>
      </a>

      <nav class="nav-links">
        <a href="/">Overview</a>
        <a href="/#demo">Interactive Demo</a>
        <a href="/case-studies/nantucket-tick-radar">Nantucket Radar</a>
        <a href="/articles" style="color: var(--teal-light);">All Articles</a>
      </nav>

      <a href="https://pocketgull.app" class="btn-primary">
        <span>Launch App</span>
        <span>→</span>
      </a>
    </div>
  </header>

  ${post ? renderSingleArticle(post) : renderArticlesCatalog()}

${renderLegalFooterHtml()}

  <script>
    function setReadingLevel(level) {
      const std = document.getElementById('content-standard');
      const g6 = document.getElementById('content-grade6');
      const btnStd = document.getElementById('btn-level-standard');
      const btnG6 = document.getElementById('btn-level-grade6');
      if (!std || !g6) return;
      if (level === 'grade6') {
        std.style.display = 'none';
        g6.style.display = 'block';
        if (btnG6) btnG6.classList.add('active');
        if (btnStd) btnStd.classList.remove('active');
      } else {
        std.style.display = 'block';
        g6.style.display = 'none';
        if (btnStd) btnStd.classList.add('active');
        if (btnG6) btnG6.classList.remove('active');
      }
    }

    let bionicActive = false;
    function toggleBionic() {
      bionicActive = !bionicActive;
      const bionicBtn = document.getElementById('btn-bionic');
      const std = document.getElementById('content-standard');
      const bio = document.getElementById('content-bionic');
      if (!std || !bio) return;
      if (bionicActive) {
        std.style.display = 'none';
        bio.style.display = 'block';
        if (bionicBtn) bionicBtn.classList.add('active');
      } else {
        std.style.display = 'block';
        bio.style.display = 'none';
        if (bionicBtn) bionicBtn.classList.remove('active');
      }
    }
  </script>
</body>
</html>`;
}

function renderArticlesCatalog(): string {
  const cardsHtml = FALLBACK_SEED_ARTICLES.map(article => `
    <article class="article-card">
      <div>
        <div class="article-meta">
          <span class="category-tag">${escapeHtml(article.sno10Category || 'Preventive Medicine')}</span>
          <span>⏱️ ${article.readingTimeMinutes} min read</span>
        </div>
        <h3>${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.excerpt)}</p>
      </div>
      <div class="card-footer">
        <span style="font-size: 0.8rem; color: var(--text-muted);">By ${escapeHtml(article.authorName)}</span>
        <a href="/articles/${article.slug}" class="btn-secondary" style="font-size: 0.8rem;">
          <span>Read Article</span>
          <span>→</span>
        </a>
      </div>
    </article>
  `).join('\n');

  return `
  <section class="hero-banner">
    <div class="container" style="text-align: center;">
      <div class="badge">📚 Clinical Intelligence &amp; Patient Literacy Library</div>
      <h1 style="font-size: 2.5rem; font-weight: 800; color: #fff; margin-bottom: 1rem; line-height: 1.2;">
        Insight Beneath the Surface.<br />
        <span style="color: var(--teal-light);">Clinical Breakthroughs &amp; Multi-Timeline Guidance.</span>
      </h1>
      <p style="max-width: 680px; margin: 0 auto 1.5rem; color: var(--text-muted); font-size: 1.05rem;">
        Evidence-grounded medical insights, 15 integrated clinical paradigms, Louise Sloan optotypic legibility, and multi-timeline action protocols.
      </p>
      <div style="display: flex; justify-content: center; gap: 1rem;">
        <a href="https://pocketgull.app" class="btn-primary" style="padding: 0.75rem 1.5rem; font-size: 0.95rem;">
          <span>Launch PocketGull App</span>
          <span>→</span>
        </a>
      </div>
    </div>
  </section>

  <main class="container">
    <div class="articles-grid">
      ${cardsHtml}
    </div>
  </main>`;
}

function renderMealPlanSection(post: IWordPressPost): string {
  const mp = post.mealPlanSection;
  if (!mp) {
    return `
      <!-- Salutogenic Meals & Whole Foods Market Staples -->
      <div class="salutogenic-section">
        <div class="salutogenic-header">
          <span style="font-size: 1.5rem;">🥗</span>
          <div>
            <h3>Salutogenic Nutrition &amp; Whole Foods Market Staples</h3>
            <div class="salutogenic-subtitle">Anti-Inflammatory Whole Foods Protocol &bull; 365 Organic Grounding</div>
          </div>
        </div>
        <div class="grid-2col">
          <div class="salutogenic-card">
            <div>
              <span class="salutogenic-tag" style="background: rgba(16, 185, 129, 0.2); color: #6ee7b7;">Breakfast &bull; 15 min</span>
              <h4 style="font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem;">Steel-Cut Oats with Golden Flax &amp; Blueberries</h4>
              <p style="font-size: 0.85rem; color: #d4d4d8; line-height: 1.5; margin-bottom: 0.5rem;">Slow-digesting beta-glucans with polyphenols to blunt morning glycemic surges and protect microvascular endothelium.</p>
              <div style="font-size: 0.78rem; color: #a1a1aa;">
                <strong>Whole Foods Ingredients:</strong> Organic oats, 365 golden flaxseed, wild blueberries, Ceylon cinnamon.
              </div>
            </div>
            <div style="font-size: 0.75rem; color: #6ee7b7; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.5rem; font-style: italic;">
              <strong>Mechanism:</strong> Soluble fiber binds bile acids; anthocyanins downregulate endothelial adhesion molecules.
            </div>
          </div>
          <div class="salutogenic-card">
            <div>
              <span class="salutogenic-tag" style="background: rgba(16, 185, 129, 0.2); color: #6ee7b7;">Dinner &bull; 20 min</span>
              <h4 style="font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem;">Wild Alaskan Sockeye Salmon &amp; Rainbow Chard</h4>
              <p style="font-size: 0.85rem; color: #d4d4d8; line-height: 1.5; margin-bottom: 0.5rem;">Marine EPA/DHA paired with nitrate-rich sautéed chard and extra virgin olive oil for arterial compliance.</p>
              <div style="font-size: 0.78rem; color: #a1a1aa;">
                <strong>Whole Foods Ingredients:</strong> Fresh wild sockeye salmon, organic rainbow chard, 365 organic EVOO, lemon.
              </div>
            </div>
            <div style="font-size: 0.75rem; color: #6ee7b7; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.5rem; font-style: italic;">
              <strong>Mechanism:</strong> Resolvins and protectins resolve microvascular inflammation while dietary nitrates enhance eNOS.
            </div>
          </div>
        </div>
        <div style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-top: 0.75rem;">
          🛒 Whole Foods Market 365 Organic Staples:
        </div>
        <div class="staples-strip">
          <div class="staple-pill" title="High-polyphenol oleocanthal">365 Organic Cold-Pressed Extra Virgin Olive Oil</div>
          <div class="staple-pill" title="Wild-caught marine omega-3s">Wild Alaskan Sockeye Salmon</div>
          <div class="staple-pill" title="Sulforaphane Nrf2 induction">Organic Broccoli Sprouts &amp; Microgreens</div>
          <div class="staple-pill" title="Magnesium &amp; potassium">Organic Raw Pumpkin &amp; Flax Seeds</div>
          <div class="staple-pill" title="Natural ACE inhibition">Organic Hibiscus Flower Herbal Tea</div>
        </div>
      </div>`;
  }

  return `
      <!-- Salutogenic Meals & Whole Foods Market Staples -->
      <div class="salutogenic-section">
        <div class="salutogenic-header">
          <span style="font-size: 1.5rem;">🥗</span>
          <div>
            <h3>Salutogenic Nutrition: ${escapeHtml(mp.theme)}</h3>
            <div class="salutogenic-subtitle">${escapeHtml(mp.dietaryArchetype)} &bull; Whole Foods Market Grounding</div>
          </div>
        </div>

        <div class="grid-2col">
          ${mp.meals.map(m => `
            <div class="salutogenic-card">
              <div>
                <span class="salutogenic-tag" style="background: rgba(16, 185, 129, 0.2); color: #6ee7b7;">${escapeHtml(m.mealType)} &bull; ${m.prepTimeMinutes} min</span>
                <h4 style="font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem;">${escapeHtml(m.title)}</h4>
                <p style="font-size: 0.85rem; color: #d4d4d8; line-height: 1.5; margin-bottom: 0.5rem;">${escapeHtml(m.description)}</p>
                <div style="font-size: 0.78rem; color: #a1a1aa; margin-bottom: 0.5rem;">
                  <strong>Whole Foods Ingredients:</strong>
                  <ul style="padding-left: 1.1rem; margin-top: 0.25rem;">
                    ${m.ingredients.map(ing => `<li>${escapeHtml(ing)}</li>`).join('')}
                  </ul>
                </div>
              </div>
              <div style="font-size: 0.75rem; color: #6ee7b7; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.5rem; font-style: italic;">
                <strong>Mechanism:</strong> ${escapeHtml(m.clinicalMechanism)}
              </div>
            </div>
          `).join('')}
        </div>

        ${mp.wholeFoodsStaples.length > 0 ? `
          <div style="font-size: 0.8rem; font-weight: 700; color: #fff; margin-top: 0.75rem;">
            🛒 Whole Foods Market 365 Organic Staples:
          </div>
          <div class="staples-strip">
            ${mp.wholeFoodsStaples.map(s => `
              <div class="staple-pill" title="${escapeHtml(s.benefit)}">
                <strong>${escapeHtml(s.name)}</strong> (${escapeHtml(s.category)})
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>`;
}

function renderProductAndRxSection(post: IWordPressPost): string {
  const pr = post.productAndRxSection;
  const ftcDisclaimer = pr?.ftcDisclaimer || 'As an Amazon Associate and clinical intelligence platform, PocketGull earns from qualifying purchases. Product recommendations and pharmacy benchmarks are supportive evidence-grounded tools, not direct prescriptions.';
  const products = pr?.products || [
    {
      asin: 'B07S2CV4N7',
      title: 'Omron Complete Wireless Upper Arm Blood Pressure + EKG Monitor',
      category: 'medical_device' as const,
      price: '$169.99',
      hsaFsaEligible: true,
      clinicalContext: 'FDA 510(k) cleared upper arm oscillometric blood pressure combined with Lead-I EKG to monitor arterial compliance and AFib.',
      affiliateUrl: 'https://www.amazon.com/dp/B07S2CV4N7?tag=pgdpo-20'
    },
    {
      asin: 'B08F9Y85G6',
      title: 'Innovo Deluxe Fingertip Pulse Oximeter with Plethysmograph Waveform',
      category: 'medical_device' as const,
      price: '$34.95',
      hsaFsaEligible: true,
      clinicalContext: 'Real-time capillary perfusion index and arterial oxygen saturation monitoring for home cardiopulmonary tracking.',
      affiliateUrl: 'https://www.amazon.com/dp/B08F9Y85G6?tag=pgdpo-20'
    },
    {
      asin: '1501168058',
      title: 'The Well-Gardened Mind: The Restorative Power of Nature by Sue Stuart-Smith',
      category: 'books_bibliotherapy' as const,
      price: '$18.99',
      hsaFsaEligible: false,
      clinicalContext: 'Bibliotherapy exploring neurobiological evidence for nature immersion, cortisol dampening, and parasympathetic nervous system recovery.',
      affiliateUrl: 'https://www.amazon.com/dp/1501168058?tag=pgdpo-20'
    }
  ];

  const rxBenchmarks = pr?.rxBenchmarks || [
    {
      genericName: 'Lisinopril Tablets (10 mg)',
      brandEquivalent: 'Prinivil / Zestril',
      standardRetailBenchmark: '$42.00 / month',
      amazonPharmacyPrice: '$4.00 / month (or $10.00 / 90 days with Prime Rx)',
      clinicalIndication: 'First-line ACE inhibitor for renal nephron sparing, reduction of intraglomerular pressure, and blood pressure control.',
      demarcationNotice: 'Requires valid prescription from your licensed physician. Benchmark provided for radical price transparency.'
    },
    {
      genericName: 'Metformin HCl (500 mg)',
      brandEquivalent: 'Glucophage',
      standardRetailBenchmark: '$38.00 / month',
      amazonPharmacyPrice: '$4.00 / month (or $10.00 / 90 days with Prime Rx)',
      clinicalIndication: 'Biguanide AMPK activator and insulin sensitizer benchmark for glycemic and vascular endothelial protection.',
      demarcationNotice: 'Requires physician prescription. Benchmark illustrates low direct wholesale cost of essential medicines.'
    }
  ];

  return `
      <!-- Supportive Equipment & Amazon Pharmacy Rx Benchmarks -->
      <div class="salutogenic-section">
        <div class="salutogenic-header">
          <span style="font-size: 1.5rem;">🛒</span>
          <div>
            <h3>Supportive Tools &amp; Amazon Pharmacy Generic Rx Benchmarks</h3>
            <div class="salutogenic-subtitle">Transparent Pricing Benchmarks &bull; HSA/FSA Eligible Devices</div>
          </div>
        </div>

        <div class="ftc-banner">
          ⚖️ <strong>FTC Affiliate Disclosure &amp; Clinical Demarcation:</strong> ${escapeHtml(ftcDisclaimer)}
        </div>

        <div style="font-size: 0.85rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">
          📦 Curated Supportive Products &amp; Diagnostics (Amazon / HSA Qualified):
        </div>
        <div class="grid-2col">
          ${products.map(p => `
            <div class="salutogenic-card">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.35rem;">
                  <span class="salutogenic-tag" style="background: rgba(56, 189, 248, 0.15); color: #7dd3fc;">${escapeHtml(p.category.replace('_', ' '))}</span>
                  ${p.hsaFsaEligible ? '<span style="font-size: 0.68rem; font-weight: 700; background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 0.15rem 0.4rem; border-radius: 0.2rem;">HSA/FSA §213(d)</span>' : ''}
                </div>
                <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem;">${escapeHtml(p.title)}</h4>
                <p style="font-size: 0.82rem; color: #a1a1aa; line-height: 1.45; margin-bottom: 0.75rem;">${escapeHtml(p.clinicalContext)}</p>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.5rem;">
                <span style="font-weight: 700; color: #34d399; font-size: 0.95rem;">${escapeHtml(p.price)}</span>
                <a href="${escapeHtml(p.affiliateUrl)}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="font-size: 0.75rem; padding: 0.3rem 0.75rem;">
                  View on Amazon &rarr;
                </a>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="font-size: 0.85rem; font-weight: 700; color: #fff; margin-top: 1.5rem; margin-bottom: 0.5rem;">
          💊 Amazon Pharmacy Generic Rx Benchmarks (Direct Cash vs Retail Markup):
        </div>
        <table class="rx-benchmark-table">
          <thead>
            <tr>
              <th>Generic Medication</th>
              <th>Standard Retail Benchmark</th>
              <th>Amazon Pharmacy Benchmark</th>
              <th>Clinical Purpose</th>
            </tr>
          </thead>
          <tbody>
            ${rxBenchmarks.map(rx => `
              <tr>
                <td><strong>${escapeHtml(rx.genericName)}</strong><br /><span style="font-size: 0.72rem; color: #a1a1aa;">(equiv. ${escapeHtml(rx.brandEquivalent)})</span></td>
                <td><span class="price-retail">${escapeHtml(rx.standardRetailBenchmark)}</span></td>
                <td><span class="price-amazon">${escapeHtml(rx.amazonPharmacyPrice)}</span></td>
                <td style="font-size: 0.75rem; color: #d4d4d8;">${escapeHtml(rx.clinicalIndication)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="font-size: 0.7rem; color: #a1a1aa; margin-top: 0.5rem; font-style: italic;">
          * Prescription medications require a valid physician order. Benchmarks illustrate wholesale cost transparency to prevent financial toxicity.
        </div>
      </div>`;
}

function renderRestorativeHobbiesSection(post: IWordPressPost): string {
  const hobbies = post.restorativeHobbies || [
    {
      title: 'Horticultural Therapy & Micro-Gardening (Soil Microbiome Sero-Grounding)',
      icon: '🌱',
      frequency: '3–4 mornings / week (15–30 mins)',
      vagalResonanceMode: 'Parasympathetic Reset & Soil Mycobacterium Vaccae Exposure',
      description: 'Tending container herbs (rosemary, thyme, heirloom cherry tomatoes) on a porch or windowsill. Working with potting soil exposes skin to harmless Mycobacterium vaccae, which stimulates brain cytokine release and elevates serotonergic neurons.',
      somaticBenefit: 'Lowers baseline salivary cortisol by 28% and delivers direct physical grounding through tactile texture and morning sunlight photon exposure.',
      starterStep: 'Acquire one terracotta pot, organic soil, and a rosemary start. Spend 10 minutes watering, pinching leaves, and breathing in pinene terpenes every morning.',
      recommendedResource: 'The Well-Gardened Mind by Dr. Sue Stuart-Smith'
    },
    {
      title: 'Mindful Japanese Suminagashi (Floating Ink) & Watercolor Flow',
      icon: '🎨',
      frequency: '2 evenings / week (30–45 mins)',
      vagalResonanceMode: '0.10 Hz Bio-Rhythmic Flow & Saccadic Calming',
      description: 'The ancient 12th-century Japanese art of dropping sumi ink onto still water and capturing concentric rings on mulberry paper. Watching organic ink swirls mirrors biophysical fluid dynamics and induces an effortless meditative state.',
      somaticBenefit: 'Shifts brainwave activity from rapid beta waves (14–30 Hz) to calming alpha waves (8–12 Hz), reducing sympathetic nervous tension and microvascular spasm.',
      starterStep: 'Fill a wide shallow baking dish with 1 inch of tap water. Touch an ink-dipped fine brush to the water surface and watch the rings expand. Gently blow to create marble patterns, then lay paper on top.',
      recommendedResource: 'Suminagashi: The Japanese Art of Marbling Paper by Anne Chambers'
    },
    {
      title: 'Resonant Humming & Choral Vocalization',
      icon: '🎵',
      frequency: 'Daily (5–10 mins, especially before meals)',
      vagalResonanceMode: 'Direct Vagus Nerve Mechanical Stimulation',
      description: 'Slow, deep humming with long extended exhales (inhale for 4 seconds, hum continuously for 8 seconds). The mechanical vibration in the throat directly stimulates the recurrent laryngeal nerve and auricular branches of the vagus nerve.',
      somaticBenefit: 'Increases heart rate variability (RMSSD) by over 40% and triggers the cholinergic anti-inflammatory pathway, reducing arterial stiffness.',
      starterStep: 'Sit upright, place hand gently on your collarbone, and hum a low comfortable pitch on every exhale for 5 minutes.',
      recommendedResource: 'The Healing Power of the Vagus Nerve by Stanley Rosenberg'
    }
  ];

  return `
      <!-- Complementary Restorative Hobbies & Salutogenic Modalities -->
      <div class="salutogenic-section">
        <div class="salutogenic-header">
          <span style="font-size: 1.5rem;">🎨</span>
          <div>
            <h3>Complementary Restorative Hobbies &amp; Salutogenic Pacing</h3>
            <div class="salutogenic-subtitle">0.10 Hz Bio-Rhythmic Resonance &bull; Somatic Nervous System Soothing</div>
          </div>
        </div>

        <div class="grid-2col">
          ${hobbies.map(h => `
            <div class="salutogenic-card">
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                  <span style="font-size: 1.5rem;">${h.icon}</span>
                  <div>
                    <h4 style="font-size: 1rem; font-weight: 700; color: #fff;">${escapeHtml(h.title)}</h4>
                    <span style="font-size: 0.72rem; color: var(--teal-light); font-weight: 600;">${escapeHtml(h.vagalResonanceMode)}</span>
                  </div>
                </div>
                <div style="font-size: 0.75rem; color: #fbbf24; font-weight: 600; margin-bottom: 0.5rem;">
                  ⏱️ Cadence: ${escapeHtml(h.frequency)}
                </div>
                <p style="font-size: 0.85rem; color: #d4d4d8; line-height: 1.5; margin-bottom: 0.5rem;">
                  ${escapeHtml(h.description)}
                </p>
                <div style="font-size: 0.78rem; color: #c4b5fd; background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); padding: 0.5rem; border-radius: 0.4rem; margin-bottom: 0.5rem;">
                  <strong>Somatic Benefit:</strong> ${escapeHtml(h.somaticBenefit)}
                </div>
              </div>
              <div style="font-size: 0.75rem; color: #a1a1aa; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.5rem;">
                <strong>Quick Start (10 Mins):</strong> ${escapeHtml(h.starterStep)}
                ${h.recommendedResource ? `<br /><span style="color: #6ee7b7;">📖 Guide: ${escapeHtml(h.recommendedResource)}</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
}

function renderSingleArticle(post: IWordPressPost): string {
  const bionicHtml = applyBionicText(post.contentHtml);
  const matrix = post.chronologicalActionMatrix;
  const invention = post.medicalInvention;
  const citations = post.empiricalEvidence?.citations || [];

  return `
  <main class="container">
    <div class="article-layout">
      <div style="margin-bottom: 1.5rem;">
        <a href="/articles" style="font-size: 0.9rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.3rem;">
          <span>←</span> Back to All Articles
        </a>
      </div>

      <div class="article-meta">
        <span class="category-tag">${escapeHtml(post.sno10Category || 'Preventive Medicine')}</span>
        <span>⏱️ ${post.readingTimeMinutes} min read</span>
        <span>•</span>
        <span>By ${escapeHtml(post.authorName)}</span>
      </div>

      <h1 style="font-size: 2.25rem; font-weight: 800; color: #fff; line-height: 1.25; margin-bottom: 1rem;">
        ${escapeHtml(post.title)}
      </h1>

      <p style="font-size: 1.15rem; color: #a1a1aa; line-height: 1.6; margin-bottom: 2rem; border-left: 3px solid #3f3f46; padding-left: 1rem;">
        ${escapeHtml(post.excerpt)}
      </p>

      <!-- Reading Toolbar -->
      <div class="reading-toolbar">
        <div class="tool-group">
          <span style="font-size: 0.8rem; font-weight: 700; color: #a1a1aa; text-transform: uppercase;">Reading Level:</span>
          <button id="btn-level-standard" class="toggle-btn active" onclick="setReadingLevel('standard')">🎓 Standard</button>
          <button id="btn-level-grade6" class="toggle-btn" onclick="setReadingLevel('grade6')">🌱 6th Grade</button>
        </div>

        <div class="tool-group">
          <button id="btn-bionic" class="toggle-btn" onclick="toggleBionic()">⚡ Bionic Fixation Mode</button>
          <a href="https://pocketgull.app" class="btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.9rem;">Interactive 3D App →</a>
        </div>
      </div>

      <!-- Main Body Elements -->
      <div id="content-standard" class="article-body">
        ${post.contentHtml}
      </div>

      <div id="content-bionic" class="article-body" style="display: none;">
        ${bionicHtml}
      </div>

      ${post.contentGrade6Html ? `
      <div id="content-grade6" class="article-body" style="display: none;">
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 1rem; padding: 1.5rem; margin-bottom: 2rem;">
          <h3 style="color: #34d399; font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem;">🌱 6th Grade "Teaspoon" Plain Language Edition</h3>
          ${post.contentGrade6Html}
        </div>
      </div>` : ''}

      <!-- Chronological Action Matrix -->
      ${matrix ? `
      <div class="matrix-card">
        <h2 style="font-size: 1.3rem; font-weight: 800; color: #fff; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>⏳</span> Chronological Multi-Timeline Action Matrix
        </h2>
        
        <div class="matrix-stage">
          <div style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--teal-light); margin-bottom: 0.25rem;">
            ${matrix.present.icon} ${escapeHtml(matrix.present.timeline)}
          </div>
          <h3 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">${escapeHtml(matrix.present.title)}</h3>
          <p style="font-size: 0.95rem; color: #d4d4d8; margin-bottom: 0.5rem;">${escapeHtml(matrix.present.action)}</p>
          <p style="font-size: 0.85rem; color: #a1a1aa; font-style: italic;"><strong>Mechanism:</strong> ${escapeHtml(matrix.present.physiologicalMechanism)}</p>
        </div>

        <div class="matrix-stage" style="border-left-color: var(--amber);">
          <div style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--amber-light); margin-bottom: 0.25rem;">
            ${matrix.shortTerm.icon} ${escapeHtml(matrix.shortTerm.timeline)}
          </div>
          <h3 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">${escapeHtml(matrix.shortTerm.title)}</h3>
          <p style="font-size: 0.95rem; color: #d4d4d8; margin-bottom: 0.5rem;">${escapeHtml(matrix.shortTerm.action)}</p>
          <p style="font-size: 0.85rem; color: #a1a1aa; font-style: italic;"><strong>Mechanism:</strong> ${escapeHtml(matrix.shortTerm.physiologicalMechanism)}</p>
        </div>

        <div class="matrix-stage" style="border-left-color: #8b5cf6;">
          <div style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: #c4b5fd; margin-bottom: 0.25rem;">
            ${matrix.longTerm.icon} ${escapeHtml(matrix.longTerm.timeline)}
          </div>
          <h3 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">${escapeHtml(matrix.longTerm.title)}</h3>
          <p style="font-size: 0.95rem; color: #d4d4d8; margin-bottom: 0.5rem;">${escapeHtml(matrix.longTerm.action)}</p>
          <p style="font-size: 0.85rem; color: #a1a1aa; font-style: italic;"><strong>Mechanism:</strong> ${escapeHtml(matrix.longTerm.physiologicalMechanism)}</p>
        </div>
      </div>` : ''}

      <!-- Historical Invention Spotlight -->
      ${invention ? `
      <div class="invention-box">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
          <span style="font-size: 1.5rem;">${invention.icon}</span>
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff;">Historical Invention Spotlight: ${escapeHtml(invention.inventionTitle)}</h3>
            <span style="font-size: 0.8rem; color: var(--amber-light); font-weight: 600;">Invented ${invention.yearInvented} by ${escapeHtml(invention.inventorName)} (${escapeHtml(invention.countryOfOrigin)})</span>
          </div>
        </div>
        <p style="font-size: 0.95rem; color: #e4e4e7; margin-bottom: 0.75rem;">
          ${escapeHtml(invention.originalPrototypeDescription)}
        </p>
        <p style="font-size: 0.85rem; color: #a1a1aa;">
          <strong>Modern Evolution:</strong> ${escapeHtml(invention.modernClinicalEvolution)}
        </p>
      </div>` : ''}

      <!-- Empirical Citations -->
      ${citations.length > 0 ? `
      <div class="citations-box">
        <h4 style="font-size: 0.95rem; font-weight: 800; color: #fff; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
          🔬 Empirical Citations &amp; Evidence Base
        </h4>
        <ul style="list-style: none; padding: 0;">
          ${citations.map(c => `
            <li style="margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.06);">
              <div style="font-weight: 700; color: #fff;">${escapeHtml(c.title)}</div>
              <div style="font-size: 0.8rem; color: #a1a1aa; margin-top: 0.15rem;">
                <em>${escapeHtml(c.journal)}</em> (${c.year}) • <span style="color: var(--teal-light); font-weight: 600;">${escapeHtml(c.evidenceLevel)}</span>
              </div>
              <div style="font-size: 0.8rem; color: #d4d4d8; margin-top: 0.25rem;">${escapeHtml(c.finding)}</div>
            </li>
          `).join('')}
        </ul>
      </div>` : ''}

      <!-- Salutogenic Lifestyle, Nutrition & Restorative Hobbies -->
      ${renderMealPlanSection(post)}
      ${renderProductAndRxSection(post)}
      ${renderRestorativeHobbiesSection(post)}

      <div style="margin-top: 3rem; text-align: center;">
        <a href="/articles" class="btn-secondary" style="margin-right: 0.75rem;">← Back to Articles</a>
        <a href="https://pocketgull.app" class="btn-primary">Launch Live AI Consult Engine →</a>
      </div>
    </div>
  </main>`;
}
