---
name: Audit and Optimize Web Pages
description: Instructions for running Lighthouse audits, fixing accessibility (color contrast, touch targets) and performance issues, and checking agentic scoring (WebMCP & llms.txt) on pages.
---

# Audit and Optimize Web Pages Skill

This skill helps developer agents audit the web application or documentation pages for performance, accessibility, best practices, SEO, and agentic discoverability, and apply optimizations.

---

## 1. Run Lighthouse in the Workstation Container

Because the workspace runs in a headless container environment, running Lighthouse out-of-the-box will fail with sandboxing errors. Always execute it using Playwright's Chromium binary and custom chrome flags:

```bash
CHROME_PATH="/home/user/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome" \
npx lighthouse <url> \
  --chrome-flags="--no-sandbox --headless --disable-gpu --disable-dev-shm-usage" \
  --output=json \
  --output-path=./lighthouse-report.json \
  --no-enable-error-reporting
```

---

## 2. Solving Accessibility Audits

### 2.1 Target Size & Touch Spacing
When small interactive elements (like theme buttons or dots) fail touch target sizes, do not compromise the visual design. Apply this pseudo-element hit-box expansion trick:

1.  Keep the button container at an accessible size (e.g. `24px` by `24px` or `44px` by `44px`).
2.  Render the visual icon or dot using a `::before` or `::after` element inside the container.
3.  Add explicit `aria-label` attributes to the button elements to ensure screen readers have a discernible name.

### 2.2 Color Contrast
Ensure text elements (including inline code `<code>` tags) maintain high contrast.
*   Default code highlights on dark background themes should use light variables like `var(--pg-accent-light)` or `#7dd3fc` instead of dark shades.

---

## 3. Evaluating Agentic Discoverability

The system automatically injects custom Lighthouse audits under the `@google/gemini-cli` framework:
*   `webmcp-registered-tools`: Verifies active Model Context Protocol (MCP) schema registrations.
*   `webmcp-form-coverage`: Audits forms to check if they are annotated with descriptive schemas/labels for AI agents.
*   `llms-txt`: Asserts that `llms.txt` is present at the root, contains valid Markdown, and starts with an H1 header.

Ensure `llms.txt` is updated in the [public/llms.txt](file:///home/user/pocketgull/public/llms.txt) folder whenever new architecture or features are introduced, keeping the project discoverable for external LLM clients.
