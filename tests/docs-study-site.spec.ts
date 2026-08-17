import {
  handleDocsStudyRequest,
  renderDocsStudyIndexHtml,
  renderDocsStudyPageHtml,
  DOCS_CHAPTERS
} from '../src/server/docs-study-site';

describe('Docs Study Portal & SEO Server Endpoints', () => {
  it('should list all documentation chapters with valid metadata', () => {
    expect(DOCS_CHAPTERS.length).toBeGreaterThanOrEqual(10);
    const arch = DOCS_CHAPTERS.find(c => c.slug === 'architecture');
    expect(arch).toBeDefined();
    expect(arch?.title).toContain('Architecture');
    expect(arch?.readTime).toBeDefined();
  });

  it('should render the /docs/study/ index HTML page with valid SEO tags', () => {
    const html = renderDocsStudyIndexHtml();
    expect(html).toContain('PocketGull Study & Engineering Documentation Portal');
    expect(html).toContain('https://pocketgull.app/docs/study/');
    expect(html).toContain('System Architecture & Data Flow');
    expect(html).toContain('Tri-Paradigm Clinical Synthesis');
    expect(html).toContain('FHIR R4 & Data Sovereignty');
  });

  it('should render a specific documentation chapter page HTML', () => {
    const markdownSample = `
# System Architecture

## Core Principles
- Angular 22 Signals
- Express SSR
- Three.js WebGL HUD

> [!NOTE]
> All telemetry executes locally.
    `;
    const html = renderDocsStudyPageHtml('architecture', markdownSample);
    expect(html).toContain('System Architecture & Data Flow — PocketGull Engineering Documentation');
    expect(html).toContain('System Architecture</h1>');
    expect(html).toContain('<h2 class="text-xl font-extrabold text-white');
    expect(html).toContain('All telemetry executes locally.');
  });

  it('should handle /docs/study HTTP request and return 200 OK HTML', () => {
    let responseHtml = '';
    let responseHeaders: Record<string, string> = {};
    const req = { path: '/docs/study', headers: {} };
    const res = {
      setHeader: (k: string, v: string) => { responseHeaders[k] = v; },
      send: (body: string) => { responseHtml = body; }
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    handleDocsStudyRequest(req, res, next);
    expect(nextCalled).toBe(false);
    expect(responseHeaders['Content-Type']).toBe('text/html; charset=utf-8');
    expect(responseHtml).toContain('PocketGull Study & Engineering Documentation Portal');
  });

  it('should handle /docs/study/architecture/ HTTP request and return rendered page', () => {
    let responseHtml = '';
    let responseHeaders: Record<string, string> = {};
    const req = { path: '/docs/study/architecture/', headers: {} };
    const res = {
      setHeader: (k: string, v: string) => { responseHeaders[k] = v; },
      send: (body: string) => { responseHtml = body; }
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    handleDocsStudyRequest(req, res, next);
    expect(nextCalled).toBe(false);
    expect(responseHeaders['Content-Type']).toBe('text/html; charset=utf-8');
    expect(responseHtml).toContain('System Architecture & Data Flow');
  });

  it('should handle raw markdown request /docs/study/architecture.md', () => {
    let responseBody = '';
    let responseHeaders: Record<string, string> = {};
    const req = { path: '/docs/study/architecture.md', headers: {} };
    const res = {
      setHeader: (k: string, v: string) => { responseHeaders[k] = v; },
      send: (body: string) => { responseBody = body; }
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    handleDocsStudyRequest(req, res, next);
    expect(nextCalled).toBe(false);
    expect(responseHeaders['Content-Type']).toBe('text/markdown; charset=utf-8');
    expect(responseBody.length).toBeGreaterThan(100);
  });
});
