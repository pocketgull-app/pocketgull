---
name: Audit and Optimize Web Pages
description: Instructions for running Lighthouse audits, fixing accessibility (color contrast, touch targets) and performance issues, and checking agentic scoring (WebMCP & llms.txt) on pages.
---

# Audit and Optimize Web Pages Skill

This skill guides developer agents to achieve and maintain **100/100 scores across all categories** (Performance, Accessibility, Best Practices, SEO, Agentic Discoverability).

---

## 1. Running Lighthouse Audits

Execute Lighthouse using headless Chrome with sandboxing disabled:

```powershell
npx lighthouse http://127.0.0.1:4000/business --chrome-flags="--no-sandbox --headless --disable-gpu" --output=json --output-path=./lighthouse-business-report.json --no-enable-error-reporting
```

To parse the category scores directly:
```powershell
node -e "const r = JSON.parse(require('fs').readFileSync('./lighthouse-business-report.json')); console.log(Object.fromEntries(Object.entries(r.categories).map(([k,v]) => [v.title, Math.round(v.score*100)])))"
```

---

## 2. 100/100 Category Optimization Playbook

### 2.1 Performance: 100
- **Zero Runtime JIT CDN**: Never use `<script src="https://cdn.tailwindcss.com"></script>` in production. Always use build-time precompiled CSS or inlined critical styles.
- **Explicit Image Dimensions**: Every `<img>` and SVG MUST provide explicit `width` and `height` attributes to eliminate Cumulative Layout Shift (CLS) and unsized image penalties.
- **Preload Critical Assets**: Preconnect to necessary font origins or bundle fonts locally using `scripts/download-fonts.js`.

### 2.2 Accessibility: 100 (WCAG AAA)
- **Contrast Ratios ($\ge 7:1$)**: On dark backgrounds (`#09090b`), use `#cbd5e1` (Slate-300), `#e2e8f0` (Slate-200), or `#f4f4f5` (Zinc-100) for body text and labels.
- **Fitts's Law Hitboxes ($\ge 44\text{px}$)**: Ensure all interactive buttons, links, and switches have `min-h-[44px]` and `min-w-[44px]`.
- **Sequential Heading Order**: Maintain strict descending hierarchy (`h1` $\rightarrow$ `h2` $\rightarrow$ `h3`). Never skip heading levels.
- **Discernible Names**: Every link and icon button MUST have clear visible text or an explicit `aria-label`.

### 2.3 Best Practices: 100
- **Zero Console Errors / Warnings**: Eliminate deprecated API calls, CDN warnings, and unhandled promise rejections.
- **CSP & Security Headers**: Enforce strict Content-Security-Policy (CSP), HTTPS upgrades, and `rel="noopener noreferrer"` on external links.
- **Valid Doctype & Charset**: Document starts with `<!DOCTYPE html>` and `<meta charset="UTF-8" />`.

### 2.4 SEO: 100
- **Meta Description & Title**: Informative `<title>` and `<meta name="description" content="..." />`.
- **OpenGraph & Twitter Cards**: Provide complete `og:title`, `og:description`, `og:image`, and `twitter:card`.
- **Crawlability**: Ensure `robots.txt` and `sitemap.xml` are accessible and valid.

### 2.5 Agentic Browsing (WebMCP & llms.txt): 100
- **llms.txt**: Maintain valid Markdown `llms.txt` at the site root with an H1 heading and clear feature summaries.
- **WebMCP Tool Declarations**: Provide machine-readable tool schemas for agentic browsing workflows.
