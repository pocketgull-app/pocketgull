/**
 * PocketGull Engineering & Clinical Study Documentation Portal Server
 * Renders static and server-side markdown pages for /docs/study/*
 *
 * @module server/docs-study-site
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

export interface IDocsChapter {
  slug: string;
  title: string;
  category: string;
  description: string;
  readTime: string;
}

export const DOCS_CHAPTERS: IDocsChapter[] = [
  {
    slug: 'architecture',
    title: 'System Architecture & Data Flow',
    category: 'Engineering',
    description: 'Angular 22 Standalone Signals, Express SSR, Three.js spatial HUD, and Google Gemini Live WebSocket full-duplex proxy.',
    readTime: '8 min read'
  },
  {
    slug: 'clinical-paradigms',
    title: 'Tri-Paradigm Clinical Synthesis',
    category: 'Clinical Intelligence',
    description: 'Hegelian dialectic bridging Allopathic Evidence-Based Medicine (EBM), Traditional Chinese Medicine (TCM), and Ayurvedic Dosha telemetry.',
    readTime: '6 min read'
  },
  {
    slug: 'features',
    title: 'Clinical Tooling & Feature Matrix',
    category: 'Platform',
    description: 'Comprehensive clinical suites: Sentinel Triage, BigQuery Forecaster, Teledentistry Odontogram, and Zooniverse Citizen Science Arena.',
    readTime: '12 min read'
  },
  {
    slug: 'responsible-ai',
    title: 'Responsible AI & Epistemic Humility',
    category: 'Governance',
    description: 'Popperian null-hypothesis testing, Cochrane Risk of Bias 2 evaluation, and HIPAA §164.514 Safe Harbor de-identification.',
    readTime: '7 min read'
  },
  {
    slug: 'data',
    title: 'FHIR R4 & Data Sovereignty',
    category: 'Interoperability',
    description: 'FHIR R4 Bundle transaction models, LOINC/SNOMED CT coding, offline edge WASM inference, and zero third-party telemetry.',
    readTime: '9 min read'
  },
  {
    slug: 'dependencies',
    title: 'Hermetic Dependency Governance',
    category: 'Engineering',
    description: 'Node.js 24 runtime, esbuild version mismatch resolutions, and lockfile provenance attestations.',
    readTime: '5 min read'
  },
  {
    slug: 'getting-started',
    title: 'Getting Started & Developer Guide',
    category: 'Developer',
    description: 'Local development setup, TypeScript strict typecheck workflows, Vitest suites, and automated Cloud Run deployments.',
    readTime: '4 min read'
  },
  {
    slug: 'positioning',
    title: 'Valuation & Hospital Deployment',
    category: 'Enterprise',
    description: 'Architectural blueprints for enterprise hospital EHR bridging, OpenEMR/OpenMRS FHIR integrations, and BigQuery cost scale-to-zero.',
    readTime: '6 min read'
  },
  {
    slug: 'case-study',
    title: 'Clinical Case Studies & Cohort Profiles',
    category: 'Clinical',
    description: 'Multi-system patient archetypes: Neurological, Metabolic, Autoimmune, and Comparative Mammalian models.',
    readTime: '10 min read'
  },
  {
    slug: 'changelog',
    title: 'Release Notes & Changelog',
    category: 'Releases',
    description: 'Version history, security audits, zero-defect release notes, and milestone completions.',
    readTime: '15 min read'
  }
];

function findMarkdownFile(slug: string): string | null {
  const candidateDirs = [
    path.join(process.cwd(), 'public', 'docs', 'study'),
    path.join(process.cwd(), 'docs', 'study'),
    path.join(ROOT_DIR, 'public', 'docs', 'study'),
    path.join(__dirname, '..', 'public', 'docs', 'study'),
    path.join(__dirname, '..', 'docs', 'study')
  ];

  for (const dir of candidateDirs) {
    const file = path.join(dir, `${slug}.md`);
    if (fs.existsSync(file)) return file;
    const fileMdx = path.join(dir, `${slug}.mdx`);
    if (fs.existsSync(fileMdx)) return fileMdx;
  }
  return null;
}

function parseMarkdownToHtml(markdown: string): string {
  let html = markdown
    // Escape standard HTML angle brackets that are not part of tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Unescape code blocks
    .replace(/```([\s\S]*?)```/g, (_match, code) => `<pre class="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-x-auto text-xs font-mono text-teal-300 my-4"><code>${code}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-zinc-800 text-teal-300 font-mono text-xs">$1</code>')
    // Headings
    .replace(/^#### (.*$)/gim, '<h4 class="text-base font-bold text-teal-400 mt-6 mb-2">$1</h4>')
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-white mt-8 mb-3 border-b border-zinc-800 pb-1">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-extrabold text-white mt-10 mb-4 border-b border-teal-500/30 pb-2 flex items-center gap-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-black text-white tracking-tight mb-6">$1</h1>')
    // Bold & Italics
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic text-zinc-300">$1</em>')
    // Blockquotes & Alerts
    .replace(/^(&gt;|>)\s*\[!NOTE\]\s*(.*$)/gim, '<div class="p-3.5 my-3 bg-teal-500/10 border-l-4 border-teal-400 rounded-r-xl text-teal-200 text-xs">$2</div>')
    .replace(/^(&gt;|>)\s*\[!IMPORTANT\]\s*(.*$)/gim, '<div class="p-3.5 my-3 bg-indigo-500/10 border-l-4 border-indigo-400 rounded-r-xl text-indigo-200 text-xs">$2</div>')
    .replace(/^(&gt;|>)\s*\[!WARNING\]\s*(.*$)/gim, '<div class="p-3.5 my-3 bg-amber-500/10 border-l-4 border-amber-400 rounded-r-xl text-amber-200 text-xs">$2</div>')
    .replace(/^(&gt;|>)\s*(.*$)/gim, '<blockquote class="border-l-4 border-zinc-700 pl-4 my-3 italic text-zinc-400">$2</blockquote>')
    // Unordered lists
    .replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-zinc-300 leading-relaxed">$1</li>')
    // Paragraphs
    .split('\n\n')
    .map(para => {
      para = para.trim();
      if (!para) return '';
      if (para.startsWith('<h') || para.startsWith('<pre') || para.startsWith('<div') || para.startsWith('<blockquote') || para.startsWith('<li')) {
        return para;
      }
      return `<p class="text-sm text-zinc-300 leading-relaxed mb-4">${para}</p>`;
    })
    .join('\n');

  return html;
}

export function renderDocsStudyIndexHtml(): string {
  const chapterCards = DOCS_CHAPTERS.map(ch => `
    <a href="/docs/study/${ch.slug}/" class="group p-5 bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-teal-500/50 rounded-2xl transition duration-200 flex flex-col justify-between shadow-sm hover:shadow-md">
      <div>
        <div class="flex items-center justify-between text-xs font-mono text-teal-400 mb-2">
          <span>${ch.category}</span>
          <span class="text-zinc-500 text-[11px]">${ch.readTime}</span>
        </div>
        <h3 class="text-base font-bold text-white group-hover:text-teal-300 transition mb-1.5">${ch.title}</h3>
        <p class="text-xs text-zinc-400 leading-relaxed">${ch.description}</p>
      </div>
      <div class="mt-4 flex items-center gap-1.5 text-xs font-bold text-teal-400 group-hover:translate-x-1 transition duration-150">
        <span>Read Chapter</span>
        <span>→</span>
      </div>
    </a>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PocketGull Study & Engineering Documentation Portal</title>
  <meta name="description" content="Official technical, clinical, and architectural engineering documentation for PocketGull Clinical Intelligence & Digital Twin Platform." />
  <link rel="canonical" href="https://pocketgull.app/docs/study/" />
  
  <meta property="og:title" content="PocketGull Engineering Documentation" />
  <meta property="og:description" content="Deep-dive into Angular 22 Signals, Express SSR, FHIR R4 Bundles, Three.js spatial modeling, and Popperian bioethics." />
  <meta property="og:url" content="https://pocketgull.app/docs/study/" />
  <meta property="og:type" content="article" />

  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; }
  </style>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col antialiased selection:bg-teal-500 selection:text-zinc-950">
  
  <!-- Header -->
  <header class="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <a href="/" class="flex items-center gap-2 text-white hover:text-teal-400 font-bold tracking-wide transition">
        <span class="text-xl">🩺</span>
        <span class="font-mono text-sm tracking-wider">POCKETGULL</span>
      </a>
      <span class="text-zinc-600">/</span>
      <span class="text-xs font-mono text-teal-400 uppercase tracking-widest font-bold">Engineering Docs</span>
    </div>
    <div class="flex items-center gap-3 text-xs">
      <a href="/" class="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition">← Back to App</a>
      <a href="/llms.txt" class="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold transition">llms.txt</a>
    </div>
  </header>

  <!-- Hero Section -->
  <main class="flex-grow max-w-6xl mx-auto px-6 py-12 w-full space-y-12">
    <div class="space-y-4 text-center max-w-2xl mx-auto">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono">
        <span>⚡</span> Comprehensive Architectural Index
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        Engineering &amp; Clinical Knowledge Base
      </h1>
      <p class="text-sm text-zinc-400 leading-relaxed">
        Explore the complete architectural specifications, biophysical simulation mathematics, FHIR R4 interoperability schemas, and multi-agent clinical decision support protocols.
      </p>
    </div>

    <!-- Chapter Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${chapterCards}
    </div>
  </main>

  <!-- Footer -->
  <footer class="border-t border-zinc-800 py-8 px-6 text-center text-xs text-zinc-500 font-mono">
    <p>© 2026 PocketGull Platform. Grounded in Level A Medical Evidence &amp; Popperian Epistemology.</p>
  </footer>
</body>
</html>`;
}

export function renderDocsStudyPageHtml(slug: string, contentMd: string): string {
  const chapter = DOCS_CHAPTERS.find(c => c.slug === slug) || {
    slug,
    title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    category: 'Documentation',
    description: `Technical documentation chapter for ${slug}.`,
    readTime: '5 min read'
  };

  const bodyHtml = parseMarkdownToHtml(contentMd);

  const sidebarLinks = DOCS_CHAPTERS.map(ch => `
    <a href="/docs/study/${ch.slug}/" class="px-3 py-2 rounded-xl text-xs font-medium transition block ${ch.slug === slug ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}">
      ${ch.title}
    </a>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${chapter.title} — PocketGull Engineering Documentation</title>
  <meta name="description" content="${chapter.description}" />
  <link rel="canonical" href="https://pocketgull.app/docs/study/${chapter.slug}/" />
  
  <meta property="og:title" content="${chapter.title} — PocketGull Docs" />
  <meta property="og:description" content="${chapter.description}" />
  <meta property="og:url" content="https://pocketgull.app/docs/study/${chapter.slug}/" />
  <meta property="og:type" content="article" />

  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; }
  </style>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col antialiased selection:bg-teal-500 selection:text-zinc-950">
  
  <!-- Header -->
  <header class="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <a href="/" class="flex items-center gap-2 text-white hover:text-teal-400 font-bold tracking-wide transition">
        <span class="text-xl">🩺</span>
        <span class="font-mono text-sm tracking-wider">POCKETGULL</span>
      </a>
      <span class="text-zinc-600">/</span>
      <a href="/docs/study/" class="text-xs font-mono text-teal-400 hover:underline uppercase tracking-widest font-bold">Docs Index</a>
      <span class="text-zinc-600">/</span>
      <span class="text-xs text-zinc-400 font-mono truncate max-w-[180px]">${chapter.slug}</span>
    </div>
    <div class="flex items-center gap-3 text-xs">
      <a href="/docs/study/" class="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition">All Chapters</a>
      <a href="/" class="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold transition">Launch App</a>
    </div>
  </header>

  <!-- Document Layout Grid -->
  <div class="flex-grow max-w-7xl mx-auto px-6 py-8 w-full grid grid-cols-1 md:grid-cols-12 gap-8">
    
    <!-- Sidebar (3 cols) -->
    <aside class="hidden md:block md:col-span-3 space-y-4 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
      <div class="text-[11px] font-mono uppercase text-zinc-500 font-bold tracking-wider px-3">
        Documentation Chapters
      </div>
      <nav class="space-y-1">
        ${sidebarLinks}
      </nav>
    </aside>

    <!-- Main Content (9 cols) -->
    <main class="md:col-span-9 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden">
      
      <!-- Chapter Metadata Header -->
      <div class="border-b border-zinc-800 pb-6 mb-8 space-y-2">
        <div class="flex items-center justify-between text-xs font-mono text-teal-400">
          <span>${chapter.category.toUpperCase()}</span>
          <span class="text-zinc-500">${chapter.readTime}</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">${chapter.title}</h1>
        <p class="text-sm text-zinc-400 leading-relaxed">${chapter.description}</p>
      </div>

      <!-- Rendered Article Body -->
      <article class="prose prose-invert max-w-none text-zinc-300">
        ${bodyHtml}
      </article>

      <!-- Bottom Nav Navigation -->
      <div class="mt-12 pt-6 border-t border-zinc-800 flex items-center justify-between text-xs font-bold text-teal-400">
        <a href="/docs/study/" class="hover:underline flex items-center gap-1">← Table of Contents</a>
        <a href="/" class="hover:underline flex items-center gap-1">Open PocketGull Web App →</a>
      </div>
    </main>

  </div>

  <!-- Footer -->
  <footer class="border-t border-zinc-800 py-6 px-6 text-center text-xs text-zinc-500 font-mono mt-auto">
    <p>© 2026 PocketGull Platform. Verified for Google Search Indexing &amp; Agentic Tools.</p>
  </footer>
</body>
</html>`;
}

export function handleDocsStudyRequest(req: any, res: any, next: any): void {
  const urlPath = req.path.replace(/\/+$/, ''); // Strip trailing slash

  if (urlPath === '/docs/study' || urlPath === '/docs/study/index') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(renderDocsStudyIndexHtml());
  }

  const match = urlPath.match(/^\/docs\/study\/([a-zA-Z0-9_-]+)(\.md)?$/);
  if (match) {
    const slug = match[1];
    const isRawMd = match[2] === '.md' || req.headers.accept?.includes('text/markdown');
    const mdFile = findMarkdownFile(slug);

    if (mdFile) {
      const content = fs.readFileSync(mdFile, 'utf-8');
      if (isRawMd) {
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.send(content);
      } else {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.send(renderDocsStudyPageHtml(slug, content));
      }
    }
  }

  return next();
}
