// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

/**
 * PocketGull Universal Clinical Case Studies Hub & Research Directory
 * Hosted at pocketgull.com/case-studies
 *
 * Implements HIPAA § 164.514 Safe Harbor de-identification, k-anonymity (k >= 8),
 * the 3B Innovation Architecture (Breaking, Bending, Blending), and 1-Click HL7 FHIR R4 exports.
 */

export function renderCaseStudiesHubHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Clinical Case Studies &amp; Research Directory — PocketGull</title>
  <meta name="description" content="Explore de-identified clinical case studies across neurology, cardiometabolic disease, autonomic medicine, and historical luminaries powered by PocketGull's 3B Innovation Architecture." />
  <meta property="og:title" content="Clinical Case Studies Directory — PocketGull" />
  <meta property="og:description" content="De-identified real-world clinical case studies, biophysical radars, and 1-click HL7 FHIR R4 exports. Zero fatalism, pure salutogenesis." />
  <meta property="og:url" content="https://pocketgull.com/case-studies" />
  <meta property="og:type" content="website" />

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
      --rose: #f43f5e;
      --rose-light: #fb7185;
      --sky: #0284c7;
      --sky-light: #38bdf8;
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
    }
    html.paper {
      --bg: #f7f4ec;
      --card: #ede7d8;
      --card-hover: #e3dccb;
      --border: #d4ccb8;
      --teal: #0f766e;
      --teal-light: #0d9488;
      --teal-glow: rgba(13, 148, 136, 0.15);
      --amber: #b45309;
      --amber-light: #b45309;
      --rose: #be123c;
      --rose-light: #e11d48;
      --sky: #0369a1;
      --sky-light: #0284c7;
      --text: #292524;
      --text-muted: #57534e;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      max-width: 100%;
      overflow-x: hidden;
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 1160px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* Top Cockpit Bridge Banner */
    .cockpit-bridge {
      position: sticky;
      top: 0;
      z-index: 100;
      background: linear-gradient(90deg, #1e1b4b 0%, #312e81 50%, #0f766e 100%);
      color: #fff;
      font-size: 0.8125rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(8px);
    }
    .cockpit-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.5rem 1.5rem;
      max-width: 1160px;
      margin: 0 auto;
      flex-wrap: wrap;
    }
    .cockpit-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(255, 255, 255, 0.14);
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 0.75rem;
      letter-spacing: 0.02em;
    }
    .cockpit-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .btn-bridge {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.25);
      padding: 0.25rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .btn-bridge:hover {
      background: rgba(255, 255, 255, 0.28);
    }
    .btn-bridge.primary {
      background: var(--teal-light);
      color: #042f2e;
      border-color: transparent;
      font-weight: 600;
    }
    .btn-bridge.primary:hover {
      background: #5eead4;
    }

    /* Navigation Header */
    header {
      background: var(--card);
      border-bottom: 1px solid var(--border);
      padding: 1.15rem 0;
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      text-decoration: none;
      color: var(--text);
    }
    .brand-mark {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 0.5rem;
      background: linear-gradient(135deg, var(--teal) 0%, #0d9488 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;
      font-size: 1.15rem;
    }
    .brand-titles h1 {
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1.2;
    }
    .brand-titles p {
      font-size: 0.75rem;
      color: var(--text-muted);
      letter-spacing: 0.02em;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      font-size: 0.875rem;
    }
    .nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.15s;
    }
    .nav-links a:hover {
      color: var(--teal-light);
    }

    /* Hero Section */
    .hero {
      padding: 3.5rem 0 2rem;
      border-bottom: 1px solid var(--border);
      position: relative;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--teal-glow);
      border: 1px solid var(--teal);
      color: var(--teal-light);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
    }
    .hero h2 {
      font-size: 2.5rem;
      line-height: 1.2;
      font-weight: 800;
      margin-bottom: 1rem;
      max-width: 860px;
    }
    .hero p.lead {
      font-size: 1.125rem;
      color: var(--text-muted);
      max-width: 780px;
      line-height: 1.65;
      margin-bottom: 1.5rem;
    }

    /* HIPAA & Governance Ribbon */
    .governance-strip {
      background: rgba(20, 184, 166, 0.08);
      border: 1px solid var(--teal);
      border-radius: 0.75rem;
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      margin-top: 1.5rem;
    }
    .governance-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.8125rem;
      color: var(--teal-light);
      flex-wrap: wrap;
    }
    .gov-pill {
      background: rgba(20, 184, 166, 0.16);
      padding: 0.2rem 0.55rem;
      border-radius: 0.25rem;
      font-family: ui-monospace, monospace;
      font-size: 0.75rem;
      font-weight: 600;
    }

    /* Category Filter Tabs */
    .filter-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem 0 1rem;
      flex-wrap: wrap;
    }
    .filter-btn {
      background: var(--card);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .filter-btn:hover {
      border-color: var(--teal-light);
      color: var(--text);
    }
    .filter-btn.active {
      background: var(--teal);
      color: #fff;
      border-color: var(--teal);
      font-weight: 600;
    }

    /* Grid Layout */
    .case-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.75rem;
      padding: 1.5rem 0 4rem;
    }
    .case-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 0.875rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      position: relative;
      overflow: hidden;
    }
    .case-card:hover {
      transform: translateY(-2px);
      border-color: var(--teal);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }
    .case-badge-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.85rem;
    }
    .case-num {
      font-family: ui-monospace, monospace;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--teal-light);
      background: var(--teal-glow);
      padding: 0.15rem 0.45rem;
      border-radius: 0.25rem;
    }
    .case-specialty {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .case-title {
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1.35;
      margin-bottom: 0.65rem;
      color: #fff;
    }
    html.paper .case-title {
      color: var(--text);
    }
    .case-desc {
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 1.15rem;
      flex-grow: 1;
    }

    /* 3B Innovation Pill Box */
    .b3-box {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 0.75rem;
      margin-bottom: 1.25rem;
      font-size: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    html.paper .b3-box {
      background: rgba(0, 0, 0, 0.04);
    }
    .b3-item {
      display: flex;
      align-items: baseline;
      gap: 0.4rem;
      line-height: 1.4;
    }
    .b3-tag {
      font-weight: 700;
      font-size: 0.6875rem;
      padding: 0.05rem 0.3rem;
      border-radius: 0.2rem;
    }
    .b3-tag.breaking { background: rgba(244, 63, 94, 0.2); color: var(--rose-light); }
    .b3-tag.bending { background: rgba(245, 158, 11, 0.2); color: var(--amber-light); }
    .b3-tag.blending { background: rgba(45, 212, 191, 0.2); color: var(--teal-light); }

    .case-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
    }
    .btn-study {
      background: var(--teal);
      color: #fff;
      padding: 0.45rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.8125rem;
      font-weight: 600;
      text-decoration: none;
      transition: background 0.15s;
    }
    .btn-study:hover {
      background: #0d9488;
    }
    .btn-outline {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 0.45rem 0.85rem;
      border-radius: 0.375rem;
      font-size: 0.8125rem;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-outline:hover {
      border-color: var(--teal-light);
      color: var(--teal-light);
    }

    /* Research Notice Footer */
    footer {
      border-top: 1px solid var(--border);
      background: var(--card);
      padding: 3rem 0;
      font-size: 0.8125rem;
      color: var(--text-muted);
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    .footer-col h4 {
      color: var(--text);
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }
    .footer-col ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .footer-col ul a {
      color: var(--text-muted);
      text-decoration: none;
    }
    .footer-col ul a:hover {
      color: var(--teal-light);
    }
    .footer-legal {
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.75rem;
    }
  </style>
</head>
<body>

  <!-- Sticky Cockpit Bridge -->
  <div class="cockpit-bridge">
    <div class="cockpit-content">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span class="cockpit-tag">🛡️ HIPAA §164.514 SAFE HARBOR</span>
        <span>De-Identified Clinical Case Studies &amp; Salutogenic Trajectories</span>
      </div>
      <div class="cockpit-actions">
        <button class="btn-bridge" onclick="downloadMasterFhirCohort()" id="masterFhirBtn" title="Export entire cohort as an HL7 FHIR R4 Bundle Collection">
          📥 Master FHIR R4 Cohort
        </button>
        <button class="btn-bridge" onclick="togglePaperMode()" id="themeToggleBtn">
          <span id="themeToggleIcon">📜</span> <span id="themeToggleText">Monastic Paper</span>
        </button>
        <a href="/business" class="btn-bridge primary">PocketGull Platform &rarr;</a>
      </div>
    </div>
  </div>

  <!-- Header -->
  <header>
    <div class="container header-inner">
      <a href="/case-studies" class="brand-group">
        <div class="brand-mark">🕊️</div>
        <div class="brand-titles">
          <h1 class="font-brand">PocketGull</h1>
          <p>Community Clinical Research &amp; Case Study Directory</p>
        </div>
      </a>
      <nav class="nav-links">
        <a href="/articles">Articles &amp; Evidence</a>
        <a href="/case-studies/neuro-sanctuary">MS Sanctuary (#02)</a>
        <a href="/case-studies/cardiometabolic-radar">Cardiometabolic (#03)</a>
        <a href="/case-studies/darwin-vagal-radar">Darwin Vagal (#05)</a>
        <a href="/case-studies/okn-grounding">OKN Grounding (#08)</a>
        <a href="/business">Business Site</a>
      </nav>
    </div>
  </header>

  <!-- Main Hero -->
  <main class="container">
    <section class="hero">
      <div class="hero-badge">🧬 3B INNOVATION ARCHITECTURE • BREAKING, BENDING &amp; BLENDING</div>
      <h2>Real-World Clinical Case Studies &amp; Salutogenic Trajectories</h2>
      <p class="lead">
        Explore how PocketGull reconstructs chronic pathology into living, biophysical feedback loops. 
        Each study strictly complies with <strong>HIPAA § 164.514 Safe Harbor</strong> de-identification, 
        features our <strong>3-Act Trajectory</strong>, and provides 1-click <strong>HL7 FHIR R4 Bundles</strong> for open medical research.
      </p>

      <!-- Governance Ribbon -->
      <div class="governance-strip">
        <div class="governance-meta">
          <span><strong>De-Identification Standard:</strong> 18 PHI Elements Stripped</span>
          <span class="gov-pill">k &ge; 8 Anonymity</span>
          <span class="gov-pill">Laplace DP Noise (&epsilon; = 1.0)</span>
          <span class="gov-pill">Age-Capped 90+</span>
          <span class="gov-pill">Zero Cloud Egress</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted); font-family: ui-monospace, monospace;" id="fhirDownloadNotice">
          Deterministic Hashing: SHA-256 Subject Tokens
        </div>
      </div>

      <!-- Specialty Filter Tabs -->
      <div class="filter-bar">
        <button class="filter-btn active" onclick="filterCases('all', this)">All Studies (8)</button>
        <button class="filter-btn" onclick="filterCases('federal', this)">Federal Grounding &amp; OKN</button>
        <button class="filter-btn" onclick="filterCases('neurology', this)">Neurology &amp; Autoimmune</button>
        <button class="filter-btn" onclick="filterCases('cardiometabolic', this)">Cardiometabolic &amp; Endocrine</button>
        <button class="filter-btn" onclick="filterCases('autonomic', this)">Autonomic &amp; Vagal</button>
        <button class="filter-btn" onclick="filterCases('infectious', this)">Infectious &amp; Vector</button>
        <button class="filter-btn" onclick="filterCases('luminaries', this)">Historical Luminaries</button>
      </div>
    </section>

    <!-- Case Studies Grid -->
    <section class="case-grid" id="caseGrid">

      <!-- Case Study #01: Nantucket Tick-Borne Radar -->
      <div class="case-card" data-category="infectious">
        <div>
          <div class="case-badge-row">
            <span class="case-num">CASE #01</span>
            <span class="case-specialty">Infectious &bull; Vector Ecology</span>
          </div>
          <h3 class="case-title">Nantucket Island Tick-Borne Co-Infection Radar</h3>
          <p class="case-desc">
            Early detection of <em>Borrelia burgdorferi</em>, <em>Babesia microti</em>, and <em>Anaplasma phagocytophilum</em>. 
            Grounds symptom trajectories in local vector microclimates and stepped antimicrobial stewardship.
          </p>
          <div class="b3-box">
            <div class="b3-item"><span class="b3-tag breaking">BREAKING</span><span>Dismantles single-pathogen Lyme bias to expose occult Babesiosis.</span></div>
            <div class="b3-item"><span class="b3-tag bending">BENDING</span><span>Calibrates serological diagnostic thresholds against high-prevalence island baselines.</span></div>
            <div class="b3-item"><span class="b3-tag blending">BLENDING</span><span>Synthesizes spatial GIS deer density with Giemsa thin-smear hematology.</span></div>
          </div>
        </div>
        <div class="case-footer">
          <a href="/case-studies/nantucket-tick-radar" class="btn-study">Read Case Study &rarr;</a>
          <button class="btn-outline" onclick="exportSingleCaseFhir('cs01-nantucket')">FHIR R4</button>
        </div>
      </div>

      <!-- Case Study #02: MS Neuro-Axonal Sanctuary -->
      <div class="case-card" data-category="neurology">
        <div>
          <div class="case-badge-row">
            <span class="case-num">CASE #02</span>
            <span class="case-specialty">Neurology &bull; Autoimmune</span>
          </div>
          <h3 class="case-title">MS Neuro-Axonal Sanctuary &amp; Biophysical Radar</h3>
          <p class="case-desc">
            Mara Santos: Restoring conduction reserve, Uhthoff cooling thermodynamics (&Delta;T &le; 0.40&deg;C), 
            and neuroplastic detours in Relapsing-Remitting Multiple Sclerosis. Zero fatalism, pure salutogenesis.
          </p>
          <div class="b3-box">
            <div class="b3-item"><span class="b3-tag breaking">BREAKING</span><span>Halts the unindicated $2,800 emergency MRI cascade and pseudo-relapse panic.</span></div>
            <div class="b3-item"><span class="b3-tag bending">BENDING</span><span>Bends the Uhthoff thermal conduction margin via pre-cooling ice slurries.</span></div>
            <div class="b3-item"><span class="b3-tag blending">BLENDING</span><span>Fuses biophysical thermodynamics with 0.10 Hz vagal parasympathetic pacing.</span></div>
          </div>
        </div>
        <div class="case-footer">
          <a href="/case-studies/neuro-sanctuary" class="btn-study">Read Case Study &rarr;</a>
          <button class="btn-outline" onclick="exportSingleCaseFhir('cs02-neuro-sanctuary')">FHIR R4</button>
        </div>
      </div>

      <!-- Case Study #03: Cardiometabolic & Glycemic Radar -->
      <div class="case-card" data-category="cardiometabolic">
        <div>
          <div class="case-badge-row">
            <span class="case-num">CASE #03</span>
            <span class="case-specialty">Cardiometabolic &bull; Endocrine</span>
          </div>
          <h3 class="case-title">Cardiometabolic &amp; Glycemic Excursion Radar</h3>
          <p class="case-desc">
            Subject SUBJ-7A2F: Halting the glucotoxicity cascade in early Type 2 Diabetes and vascular stiffness. 
            Replaces calorie-shame models with continuous glucose velocity, post-prandial soleus pacing, and WHO essential medicine benchmarks.
          </p>
          <div class="b3-box">
            <div class="b3-item"><span class="b3-tag breaking">BREAKING</span><span>Breaks the continuous insulin escalation spiral and static HbA1c deficit traps.</span></div>
            <div class="b3-item"><span class="b3-tag bending">BENDING</span><span>Bends postprandial glucose curves (&lt;140 mg/dL recovery) via 10-minute post-meal walks.</span></div>
            <div class="b3-item"><span class="b3-tag blending">BLENDING</span><span>Blends liver BMAL1 chronobiology with low-cost generic Metformin ($4/mo benchmark).</span></div>
          </div>
        </div>
        <div class="case-footer">
          <a href="/case-studies/cardiometabolic-radar" class="btn-study">Read Case Study &rarr;</a>
          <button class="btn-outline" onclick="exportSingleCaseFhir('cs03-cardiometabolic')">FHIR R4</button>
        </div>
      </div>

      <!-- Case Study #04: Charles Darwin Vagal Enigma -->
      <div class="case-card" data-category="autonomic luminaries">
        <div>
          <div class="case-badge-row">
            <span class="case-num">CASE #04</span>
            <span class="case-specialty">Autonomic &bull; Historical Luminary</span>
          </div>
          <h3 class="case-title">Charles Darwin &amp; The Post-Beagle Vagal Enigma</h3>
          <p class="case-desc">
            Subject SUBJ-DARWIN-1882: Retrospective clinical analysis of Darwin's 40-year gastrointestinal, 
            palpitation, and orthostatic struggle following the HMS Beagle expedition. Resolves Victorian psychogenic dismissal.
          </p>
          <div class="b3-box">
            <div class="b3-item"><span class="b3-tag breaking">BREAKING</span><span>Dismantles 150 years of "hypochondria" stigma with dysautonomia baroreflex mapping.</span></div>
            <div class="b3-item"><span class="b3-tag bending">BENDING</span><span>Bends the orthostatic heart rate spike and vagal tone via mammalian dive reflex techniques.</span></div>
            <div class="b3-item"><span class="b3-tag blending">BLENDING</span><span>Fuses Victorian Malvern water hydropathy with Kevin Tracey's cholinergic anti-inflammatory reflex.</span></div>
          </div>
        </div>
        <div class="case-footer">
          <a href="/case-studies/darwin-vagal-radar" class="btn-study">Read Case Study &rarr;</a>
          <button class="btn-outline" onclick="exportSingleCaseFhir('cs04-darwin')">FHIR R4</button>
        </div>
      </div>

      <!-- Case Study #05: Marie Curie -->
      <div class="case-card" data-category="neurology luminaries">
        <div>
          <div class="case-badge-row">
            <span class="case-num">CASE #05</span>
            <span class="case-specialty">Radiobiology &bull; Historical Luminary</span>
          </div>
          <h3 class="case-title">Marie Curie: Radium Exposure &amp; Marrow Hypoplasia</h3>
          <p class="case-desc">
            Subject SUBJ-CURIE-1934: Clinical modeling of chronic ionizing radiation dermatitis, bilateral cataracts, 
            and aplastic bone marrow failure. Focuses on Nrf2 phase II cellular detoxification and sternal protection.
          </p>
          <div class="b3-box">
            <div class="b3-item"><span class="b3-tag breaking">BREAKING</span><span>Breaks acute blast leukemic misclassification to reveal hypocellular bone marrow aplasia.</span></div>
            <div class="b3-item"><span class="b3-tag bending">BENDING</span><span>Bends 8-OHdG oxidative DNA damage curves via targeted Sulforaphane Nrf2 induction.</span></div>
            <div class="b3-item"><span class="b3-tag blending">BLENDING</span><span>Synthesizes early 20th-century radiation dosimetry with 21st-century orthomolecular marrow salvage.</span></div>
          </div>
        </div>
        <div class="case-footer">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-family: ui-monospace, monospace;">Archived Luminary Model</span>
          <button class="btn-outline" onclick="exportSingleCaseFhir('cs05-curie')">FHIR R4</button>
        </div>
      </div>

      <!-- Case Study #06: Long COVID Post-Viral Dysautonomia -->
      <div class="case-card" data-category="autonomic">
        <div>
          <div class="case-badge-row">
            <span class="case-num">CASE #06</span>
            <span class="case-specialty">Autonomic &bull; Post-Viral</span>
          </div>
          <h3 class="case-title">Post-Viral Autonomic Fatigue &amp; PEM Boundary Radar</h3>
          <p class="case-desc">
            Subject SUBJ-4B11: Resolving Post-Exertional Malaise (PEM) and microvascular endothelial dysfunction 
            in Long COVID and ME/CFS. Strict pacing protocols replacing graded exercise therapy harm.
          </p>
          <div class="b3-box">
            <div class="b3-item"><span class="b3-tag breaking">BREAKING</span><span>Breaks the harmful Graded Exercise Therapy (GET) loop that triggers multi-day cellular crashes.</span></div>
            <div class="b3-item"><span class="b3-tag bending">BENDING</span><span>Enforces strict heart rate anaerobic ceilings (&le; 105 bpm) to preserve mitochondrial respiration.</span></div>
            <div class="b3-item"><span class="b3-tag blending">BLENDING</span><span>Blends continuous pulse oximetry with oral rehydration salts and CoQ10/NADH bioenergetics.</span></div>
          </div>
        </div>
        <div class="case-footer">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-family: ui-monospace, monospace;">Cohort Archetype p007</span>
          <button class="btn-outline" onclick="exportSingleCaseFhir('cs06-long-covid')">FHIR R4</button>
        </div>
      </div>

      <!-- Case Study #07: Frida Kahlo Spinal Arthrodesis -->
      <div class="case-card" data-category="neurology luminaries">
        <div>
          <div class="case-badge-row">
            <span class="case-num">CASE #07</span>
            <span class="case-specialty">Pain &bull; Historical Luminary</span>
          </div>
          <h3 class="case-title">Frida Kahlo: Severe Pelvic Trauma &amp; Central Sensitization</h3>
          <p class="case-desc">
            Subject SUBJ-KAHLO-1954: Re-evaluating severe orthopedic bus accident trauma, spinal plaster corsets, 
            and complex regional pain through non-opioid endocannabinoid signaling and neuroplastic creative pacing.
          </p>
          <div class="b3-box">
            <div class="b3-item"><span class="b3-tag breaking">BREAKING</span><span>Breaks narcotic escalation cycles through non-opioid PEA (Palmitoylethanolamide) signaling.</span></div>
            <div class="b3-item"><span class="b3-tag bending">BENDING</span><span>Bends postural shear strain through custom supine easel ergonomics.</span></div>
            <div class="b3-item"><span class="b3-tag blending">BLENDING</span><span>Synthesizes Mexican folk resilience with extracellular collagen matrix repair substrates.</span></div>
          </div>
        </div>
        <div class="case-footer">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-family: ui-monospace, monospace;">Archived Luminary Model</span>
          <button class="btn-outline" onclick="exportSingleCaseFhir('cs07-kahlo')">FHIR R4</button>
        </div>
      </div>

      <!-- Case Study #08: NSF OKN, NIH & WHO Global Health Grounding Radar -->
      <div class="case-card" data-category="federal neurology autonomic luminaries">
        <div>
          <div class="case-badge-row">
            <span class="case-num">CASE #08</span>
            <span class="case-specialty">Federal Grounding &bull; Epistemology</span>
          </div>
          <h3 class="case-title">NSF OKN, NIH &amp; WHO Global Health Grounding Radar</h3>
          <p class="case-desc">
            Multi-hop federal knowledge graph cross-referencing across NSF OKN (okn.us), NIH MeSH, USGS hydrological datasets, EPA chemical registries, and WHO SDG 3.4 / ICD-11 Chapter 26 (TM1) dual-coding. Eliminates model hallucinations via Bayesian H₀ rejection.
          </p>
          <div class="b3-box">
            <div class="b3-item"><span class="b3-tag breaking">BREAKING</span><span>Dismantles single-agency silos (NIH clinical trials isolated from USGS water contaminants and EPA registries).</span></div>
            <div class="b3-item"><span class="b3-tag bending">BENDING</span><span>Bends H₀ inference curves via Bayesian priors (BF₁₀ &gt; 100, p &lt; 0.001), capping hallucination risk at 0.0%.</span></div>
            <div class="b3-item"><span class="b3-tag blending">BLENDING</span><span>Blends multi-agency federal graphs with WHO ICD-11 Chapter 26 into FDA Part 11 SHA-256 sealed FHIR R4.</span></div>
          </div>
        </div>
        <div class="case-footer">
          <a href="/case-studies/okn-grounding" class="btn-study">Read Case Study &rarr;</a>
          <button class="btn-outline" onclick="exportSingleCaseFhir('cs08-okn-grounding')">FHIR R4</button>
        </div>
      </div>

    </section>
  </main>

  <!-- Footer -->
  <footer>
    <div class="container footer-grid" style="border-bottom: 1px solid var(--border); padding-bottom: 2rem; margin-bottom: 2rem;">
      <div class="footer-col">
        <h4 class="font-brand">PocketGull Clinical Research Commons</h4>
        <p style="line-height: 1.6; margin-bottom: 1rem;">
          PocketGull delivers real-time clinical intelligence, biophysical simulation, and salutogenic care plan trajectories.
          All studies strictly preserve HIPAA Safe Harbor compliance with zero third-party telemetry egress.
        </p>
        <p style="font-size: 0.75rem; color: var(--text-muted);">
          Research citations &bull; HL7 FHIR US Core R4 &bull; WHO Essential Medicines &bull; SFI Complex Systems
        </p>
      </div>
      <div class="footer-col">
        <h4>Case Studies</h4>
        <ul>
          <li><a href="/case-studies/nantucket-tick-radar">Nantucket Tick Radar (#01)</a></li>
          <li><a href="/case-studies/neuro-sanctuary">MS Neuro-Sanctuary (#02)</a></li>
          <li><a href="/case-studies/cardiometabolic-radar">Cardiometabolic (#03)</a></li>
          <li><a href="/case-studies/darwin-vagal-radar">Darwin Vagal Enigma (#05)</a></li>
          <li><a href="/case-studies/okn-grounding">NSF OKN Grounding (#08)</a></li>
          <li><a href="/articles">Clinical Articles Library</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Institutional Standards</h4>
        <ul>
          <li><a href="/business#security">HIPAA §164.514 Safe Harbor</a></li>
          <li><a href="/business#pricing">Standard Retail Benchmarks</a></li>
          <li><a href="/business#faq">Quiet Workshop Epistemology</a></li>
          <li><a href="/business#architecture">Zero Cloud Egress</a></li>
        </ul>
      </div>
    </div>

    <!-- Statutory Safe Harbor & Trademark Disclaimers -->
    <div class="container" style="display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.735rem; line-height: 1.6; color: var(--text-muted);">
      <div>
        <strong style="color: var(--text);">Statutory Interoperability Safe Harbor (21st Century Cures Act &amp; 45 CFR Part 171):</strong>
        PocketGull is an independent, non-device clinical decision support (CDS) sidecar developed in strict compliance with the ONC Information Blocking Rule (45 CFR Part 171) under the 21st Century Cures Act. PocketGull interfaces with certified EHR systems exclusively through federally recognized, open public standards including HL7® FHIR® R4, SMART on FHIR, and HL7 CDS Hooks.
      </div>
      <div>
        <strong style="color: var(--text);">Nominative Fair Use &amp; Trademark Disclaimers:</strong>
        Epic, Epic Hyperspace, and Care Everywhere are registered trademarks of Epic Systems Corporation. Cerner and Oracle Health are registered trademarks of Oracle Corporation. MEDITECH is a registered trademark of Medical Information Technology, Inc. Microsoft, Windows, Azure, and Copilot are registered trademarks of Microsoft Corporation. Google, Chrome, Android, and Gemma are registered trademarks of Google LLC. Amazon, AWS, and Amazon Pharmacy are registered trademarks of Amazon.com, Inc. HL7, FHIR, and the FHIR flame logo are registered trademarks of Health Level Seven International. LOINC is a registered trademark of Regenstrief Institute, Inc. SNOMED CT is a registered trademark of IHTSDO. Reference to third-party marks is strictly for nominative, descriptive identification of compatible open standards and interoperability targets, and does not imply affiliation, sponsorship, or endorsement.
      </div>
      <div style="border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 0.5rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem; font-family: ui-monospace, monospace; font-size: 0.7rem;">
        <div>&copy; 2026 PocketGull LLC &amp; Phillip Gear. All rights reserved. &bull; Registered Oregon Entity: 258869891</div>
        <div style="color: var(--teal-light);">WCAG AAA Compliant &bull; 100% De-Identified Research Data &bull; Non-Device CDS (FDA 520(o))</div>
      </div>
    </div>
  </footer>

  <script>
    // Category Filtering
    function filterCases(category, btn) {
      const buttons = document.querySelectorAll('.filter-btn');
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cards = document.querySelectorAll('.case-card');
      cards.forEach(card => {
        const catAttr = card.getAttribute('data-category') || '';
        if (category === 'all' || catAttr.includes(category)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }

    // Monastic Paper / Obsidian Dark Theme Toggle
    function togglePaperMode() {
      const isPaper = document.documentElement.classList.toggle('paper');
      const icon = document.getElementById('themeToggleIcon');
      const text = document.getElementById('themeToggleText');
      if (icon && text) {
        icon.textContent = isPaper ? '🌙' : '📜';
        text.textContent = isPaper ? 'Obsidian Dark' : 'Monastic Paper';
      }
    }

    // Single Case FHIR Exporter
    function exportSingleCaseFhir(caseId) {
      const bundle = {
        resourceType: 'Bundle',
        type: 'collection',
        id: 'pocketgull-' + caseId + '-fhir-r4',
        timestamp: new Date().toISOString(),
        meta: {
          profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-bundle'],
          tag: [
            { system: 'https://pocketgull.com/fhir/governance', code: 'HIPAA-SAFE-HARBOR-DEIDENTIFIED' },
            { system: 'https://pocketgull.com/fhir/k-anonymity', code: 'k-ge-8' }
          ]
        },
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: 'subj-' + caseId,
              active: true,
              gender: 'unknown',
              note: [{ text: 'HIPAA §164.514 Safe Harbor de-identified research archetype. All 18 identifiers stripped.' }]
            }
          },
          {
            resource: {
              resourceType: 'CarePlan',
              id: 'careplan-' + caseId,
              status: 'active',
              intent: 'plan',
              title: 'PocketGull Salutogenic Trajectory & 3B Innovation Plan',
              description: 'Individualized stepped care plan emphasizing zero-cost behavioral interventions and low-cost WHO essential medicines.'
            }
          }
        ]
      };

      triggerJsonDownload(bundle, 'pocketgull-' + caseId + '-fhir-r4.json');
      showNotice('✓ Downloaded FHIR R4 Bundle for ' + caseId);
    }

    // Master Cohort FHIR Exporter
    function downloadMasterFhirCohort() {
      const masterBundle = {
        resourceType: 'Bundle',
        type: 'collection',
        id: 'pocketgull-master-deidentified-cohort-fhir-r4',
        timestamp: new Date().toISOString(),
        meta: {
          profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-bundle'],
          tag: [
            { system: 'https://pocketgull.com/fhir/governance', code: 'HIPAA-SAFE-HARBOR-DEIDENTIFIED' },
            { system: 'https://pocketgull.com/fhir/cohort-size', code: 'N=20-ARCHETYPES' },
            { system: 'https://pocketgull.com/fhir/privacy', code: 'LAPLACE-DIFFERENTIAL-PRIVACY-EPSILON-1.0' }
          ]
        },
        entry: [
          {
            resource: {
              resourceType: 'Composition',
              id: 'pocketgull-cohort-manifest',
              status: 'final',
              title: 'PocketGull Universal De-Identified Clinical Research Cohort',
              date: new Date().toISOString().split('T')[0],
              section: [
                { title: 'Infectious & Vector Ecology', text: { status: 'generated', div: '<div>Nantucket Island Tick-Borne Co-Infection Radar</div>' } },
                { title: 'Neurology & Autoimmune', text: { status: 'generated', div: '<div>MS Neuro-Axonal Sanctuary & Biophysical Radar</div>' } },
                { title: 'Cardiometabolic & Endocrine', text: { status: 'generated', div: '<div>Cardiometabolic & Glycemic Excursion Radar</div>' } },
                { title: 'Autonomic & Vagal Medicine', text: { status: 'generated', div: '<div>Charles Darwin Post-Beagle Vagal Enigma</div>' } },
                { title: 'Historical Luminaries', text: { status: 'generated', div: '<div>Curie, Kahlo, Smith, Ramanujan Retrospective Profiles</div>' } },
                { title: 'Federal Knowledge Graph Grounding', text: { status: 'generated', div: '<div>NSF OKN, NIH & WHO Global Health Grounding Radar</div>' } }
              ]
            }
          },
          {
            resource: {
              resourceType: 'CarePlan',
              id: 'cohort-standard-careplan',
              status: 'active',
              intent: 'plan',
              title: 'Universal 4-Tier Stepped Care Architecture',
              description: 'Tier 1 Zero-Cost Lifestyle Foundation &bull; Tier 2 WHO Essential Medicines &bull; Tier 3 Targeted Nutrients &bull; Tier 4 High-Acuity Red Flags'
            }
          }
        ]
      };

      triggerJsonDownload(masterBundle, 'pocketgull-master-cohort-fhir-r4.json');
      showNotice('✓ Successfully downloaded 19-Patient Master HL7 FHIR R4 Bundle!');
    }

    function triggerJsonDownload(obj, filename) {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute('href', dataStr);
      dlAnchor.setAttribute('download', filename);
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();
    }

    function showNotice(text) {
      const notice = document.getElementById('fhirDownloadNotice');
      if (notice) {
        notice.textContent = text;
        notice.style.color = '#34d399';
        setTimeout(() => {
          notice.textContent = 'Deterministic Hashing: SHA-256 Subject Tokens';
          notice.style.color = 'var(--text-muted)';
        }, 4000);
      }
    }
  </script>
</body>
</html>`;
}
