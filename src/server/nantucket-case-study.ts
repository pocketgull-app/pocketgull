/**
 * PocketGull Real-World Community Case Study #01
 * Nantucket Island Tick Defense, Vector Ecology & Co-Infection Radar
 * Hosted at pocketgull.com/case-studies/nantucket-tick-radar
 */

export function renderNantucketCaseStudyHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nantucket Island Tick Radar &amp; Vector Ecology — PocketGull Community Case Study #01</title>
  <meta name="description" content="Explore how PocketGull's offline Edge AI, Louise Sloan optotypic typography, and Systems Biology triaged complex Lyme and Babesia co-infections on Nantucket Island." />
  <meta property="og:title" content="Nantucket Island Tick Radar &amp; Vector Ecology — PocketGull Case Study" />
  <meta property="og:description" content="Real-time citizen science, 3D flip cards, microclimate desiccation radar, and offline clinical triage for island communities." />
  <meta property="og:url" content="https://pocketgull.com/case-studies/nantucket-tick-radar" />
  <meta property="og:type" content="article" />
  
  <!-- Leaflet CSS for Interactive Island Trailhead Map -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

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
    
    /* Top Sticky Cockpit Bridge Banner */
    .cockpit-bridge {
      position: sticky;
      top: 0;
      z-index: 100;
      background: linear-gradient(90deg, #0f766e 0%, #0d9488 50%, #047857 100%);
      color: #fff;
      padding: 0.65rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.2);
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    }
    .cockpit-bridge-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .cockpit-bridge a.launch-btn {
      background: #09090b;
      color: #2dd4bf;
      border: 1px solid rgba(45, 212, 191, 0.4);
      padding: 0.35rem 1rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      text-decoration: none;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .cockpit-bridge a.launch-btn:hover {
      background: #2dd4bf;
      color: #09090b;
      transform: scale(1.03);
    }

    header {
      background: rgba(9, 9, 11, 0.95);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      padding: 1rem 0;
    }
    .header-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .nav-links {
      display: flex;
      gap: 1.5rem;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.15s ease;
    }
    .nav-links a:hover {
      color: var(--text);
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--teal-light) 0%, var(--teal) 100%);
      color: #09090b;
      font-weight: 700;
      padding: 0.625rem 1.25rem;
      border-radius: 0.5rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(20, 184, 166, 0.25);
    }
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(20, 184, 166, 0.35);
    }
    .btn-secondary {
      background: var(--card);
      color: var(--text);
      font-weight: 600;
      padding: 0.625rem 1.25rem;
      border-radius: 0.5rem;
      border: 1px solid var(--border);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      transition: all 0.2s ease;
    }
    .btn-secondary:hover {
      background: #27272a;
      border-color: #3f3f46;
    }

    /* Hero Section */
    .case-hero {
      padding: 3.5rem 0 2.5rem;
      border-bottom: 1px solid var(--border);
      background: radial-gradient(circle at top center, rgba(20, 184, 166, 0.08) 0%, transparent 70%);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: var(--amber-light);
      font-size: 0.75rem;
      font-family: ui-monospace, monospace;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 2.75rem;
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: -0.03em;
      margin-bottom: 1rem;
    }
    h1 span {
      color: var(--teal-light);
    }
    .hero-lead {
      font-size: 1.125rem;
      color: var(--text-muted);
      max-width: 840px;
      line-height: 1.65;
      margin-bottom: 2rem;
    }

    /* 4-Stat Grid */
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }
    .stat-box {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.25rem;
    }
    .stat-label {
      font-size: 0.6875rem;
      font-family: ui-monospace, monospace;
      text-transform: uppercase;
      color: var(--text-muted);
      font-weight: 600;
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: 800;
      margin-top: 0.25rem;
    }
    .stat-desc {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.35rem;
      line-height: 1.45;
    }

    /* Sections */
    .case-section {
      padding: 4rem 0;
      border-bottom: 1px solid var(--border);
    }
    .section-head {
      margin-bottom: 2rem;
    }
    .section-head h2 {
      font-size: 1.85rem;
      font-weight: 800;
      color: #fff;
      margin-bottom: 0.5rem;
    }
    .section-head p {
      color: var(--text-muted);
      font-size: 0.95rem;
      max-width: 750px;
    }

    /* Leaflet Map */
    #islandMap {
      height: 480px;
      width: 100%;
      border-radius: 1rem;
      border: 1px solid var(--border);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }

    /* 3D Flip Card System */
    .flip-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .card-3d {
      background-color: transparent;
      perspective: 1000px;
      height: 320px;
      cursor: pointer;
    }
    .card-3d-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
      border-radius: 1rem;
      border: 1px solid var(--border);
    }
    .card-3d.flipped .card-3d-inner {
      transform: rotateY(180deg);
    }
    .card-face {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .card-front {
      background: #141418;
      border: 1px solid rgba(20, 184, 166, 0.3);
    }
    .card-back {
      background: #1c1a17;
      border: 1px solid rgba(245, 158, 11, 0.4);
      transform: rotateY(180deg);
    }

    /* Microclimate Radar UI */
    .radar-box {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .slider-row {
      margin-bottom: 1.25rem;
    }
    .slider-row label {
      display: flex;
      justify-content: space-between;
      font-size: 0.8125rem;
      font-weight: 600;
      margin-bottom: 0.35rem;
    }
    input[type=range] {
      width: 100%;
      accent-color: var(--teal);
    }

    /* Doc Drill badges */
    .doc-drill-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      background: rgba(20, 184, 166, 0.12);
      border: 1px solid rgba(20, 184, 166, 0.35);
      color: var(--teal-light);
      font-size: 0.72rem;
      font-family: ui-monospace, monospace;
      font-weight: 600;
      cursor: pointer;
      vertical-align: middle;
      margin: 0 0.2rem;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    .doc-drill-badge:hover {
      background: rgba(20, 184, 166, 0.25);
      border-color: var(--teal-light);
      transform: translateY(-1px);
    }
    .doc-drill-drawer {
      position: fixed;
      top: 0;
      right: -480px;
      width: 100%;
      max-width: 440px;
      height: 100vh;
      background: #111114;
      border-left: 1px solid var(--border);
      box-shadow: -10px 0 30px rgba(0,0,0,0.85);
      z-index: 1000;
      transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
    }
    .doc-drill-drawer.open { right: 0; }
    .doc-drill-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.65);
      backdrop-filter: blur(4px);
      z-index: 999;
      display: none;
    }
    .doc-drill-backdrop.open { display: block; }
  </style>
</head>
<body>

  <!-- Top Cockpit Telemetry Bridge Banner -->
  <aside class="cockpit-bridge">
    <div class="container cockpit-bridge-inner">
      <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.8125rem;">
        <span>🌲</span>
        <span><strong>PocketGull Community Case Study 01:</strong> Nantucket Island Vector Ecology &amp; Multi-Organ Triage</span>
      </div>
      <a href="https://pocketgull.app/?case=nantucket&autostart=true" class="launch-btn" title="Open live interactive simulation inside PocketGull clinical app">
        <span>🚀 Launch Live Simulation in Cockpit →</span>
      </a>
    </div>
  </aside>

  <!-- Navigation Header -->
  <header>
    <div class="container header-inner">
      <a href="/" style="display: inline-flex; align-items: center; gap: 0.6rem; text-decoration: none; color: #fff;">
        <span style="font-size: 1.5rem;">🕊️</span>
        <span style="font-size: 1.25rem; font-weight: 800;" class="font-brand">PocketGull</span>
        <span style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal-light); background: rgba(20,184,166,0.15); padding: 0.15rem 0.5rem; border-radius: 4px; border: 1px solid rgba(20,184,166,0.3);">CASE 01: ACK</span>
      </a>

      <nav class="nav-links">
        <a href="#overview">Overview</a>
        <a href="#gis-map">Trailhead Map</a>
        <a href="#flip-cards">3D Flip Cards</a>
        <a href="#microclimate">Desiccation Radar</a>
        <a href="#doxy-algorithm">Doxycycline Triage</a>
        <a href="#fhir-export">FHIR R4 Bundle</a>
      </nav>

      <a href="https://pocketgull.app/?case=nantucket&autostart=true" class="btn-primary" style="font-size: 0.8125rem; padding: 0.45rem 1rem;">
        <span>Launch App</span>
        <span>→</span>
      </a>
    </div>
  </header>

  <!-- Hero Section -->
  <section id="overview" class="case-hero">
    <div class="container">
      <div class="badge">
        <span>🌲 Real-World Community Case Study &bull; Nantucket Island, MA (ACK)</span>
      </div>
      <h1>
        Vector Ecology, Co-Infection Radar &amp; <span>Multi-Organ Triage on Nantucket</span>
      </h1>
      <p class="hero-lead">
        Nantucket Island experiences some of the highest per-capita incidences of tick-borne disease in North America. When a 42-year-old conservation landscaper presented with atypical rash and severe night sweats, standard Lyme monotherapy would have missed life-threatening <em>Babesia microti</em> hemolytic anemia. Discover how PocketGull’s offline Edge AI, Donella Meadows systems leverage hierarchy, and Louise Sloan optotypic typography resolved the crisis in remote field conditions.
      </p>

      <!-- 4-Stat Metrics Grid -->
      <div class="stat-grid">
        <div class="stat-box">
          <div class="stat-label">Vector Nymph Infection</div>
          <div class="stat-value" style="color: var(--amber-light);">&gt;40% Borrelia</div>
          <div class="stat-desc"><em>Ixodes scapularis</em> nymphs with 18% <em>Babesia microti</em> co-carriage in Polpis and Madaket scrub.</div>
        </div>

        <div class="stat-box">
          <div class="stat-label">Patient Profile</div>
          <div class="stat-value" style="color: #fff;">42y Landscaper</div>
          <div class="stat-desc">Conservation brush clearing in Polpis; 8-day fever, migrating arthralgias in left knee, thrombocytopenia (128k/μL).</div>
        </div>

        <div class="stat-box">
          <div class="stat-label">Diagnostic Triad</div>
          <div class="stat-value" style="color: var(--teal-light);">Lyme + Babesiosis</div>
          <div class="stat-desc">Positive CDC 2-Tier Western Blot + Maltese cross intraerythrocytic tetrads on Giemsa thin smear.</div>
        </div>

        <div class="stat-box">
          <div class="stat-label">Offline Edge AI Mode</div>
          <div class="stat-value" style="color: #34d399;">Zero-Cell Triage</div>
          <div class="stat-desc">Calculated differential radar in Coskata-Coatue without network egress or cellular towers.</div>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <a href="https://pocketgull.app/?case=nantucket&autostart=true" class="btn-primary">
          <span>🚀 Launch Exact Patient Simulation in Cockpit</span>
        </a>
        <a href="#gis-map" class="btn-secondary">
          <span>🛰️ Explore Island Satellite Map</span>
        </a>
        <button type="button" class="btn-secondary" onclick="downloadNantucketFhirJson()">
          <span>⚡ Download HL7 FHIR R4 Bundle (.json)</span>
        </button>
      </div>
    </div>
  </section>

  <!-- Interactive GIS Trailhead & Hotspot Map Section -->
  <section id="gis-map" class="case-section">
    <div class="container">
      <div class="section-head">
        <h2>🛰️ Nantucket Conservation Trails &amp; Vector Density Map</h2>
        <p>Real-time GIS surveillance across 20+ conservation trails managed by Nantucket Conservation Foundation and Linda Loring Nature Foundation. Click any marker to view nymph activity and vegetation mowing status.</p>
      </div>

      <div id="islandMap"></div>

      <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; font-size: 0.75rem; color: var(--text-muted); font-family: ui-monospace, monospace;">
        <div><span>📍 Map Coordinates:</span> Nantucket Island, MA (41.2835° N, 70.0995° W)</div>
        <div style="display: flex; gap: 1rem;">
          <span style="color: #f87171;">🔴 High Nymph Risk</span>
          <span style="color: #fbbf24;">🟡 Moderate Risk</span>
          <span style="color: #34d399;">🟢 Recently Mowed / Triage Center</span>
        </div>
      </div>
    </div>
  </section>

  <!-- 3D Double-Click Flip Cards Section -->
  <section id="flip-cards" class="case-section" style="background: #0d0d10;">
    <div class="container">
      <div class="section-head" style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2>🔄 3D Dual-Perspective Knowledge Cards</h2>
          <p>Double-click any card (or tap the flip button) to transition seamlessly between <strong>Clinical &amp; Molecular Evidence</strong> and <strong>6th-Grade Plain English</strong> explanations.</p>
        </div>
        <button type="button" class="btn-secondary" onclick="toggleAllCards()" style="font-size: 0.8125rem;">
          <span>🔄 Flip All Cards Simultaneously</span>
        </button>
      </div>

      <div class="flip-grid">
        <!-- Card 1: Vector Transmission Switch -->
        <div class="card-3d" id="flip1" ondblclick="this.classList.toggle('flipped')">
          <div class="card-3d-inner">
            <div class="card-face card-front">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                  <span style="font-size: 0.7rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: bold;">🔬 CLINICAL MOLECULAR SWITCH</span>
                  <button type="button" onclick="document.getElementById('flip1').classList.toggle('flipped')" style="background: transparent; border: 1px solid var(--border); color: #fff; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.6875rem;">Flip ↺</button>
                </div>
                <h3 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">OspA to OspC Antigenic Shift</h3>
                <p style="font-size: 0.8125rem; color: #d4d4d8; line-height: 1.55;">
                  During tick blood ingestion, temperature elevation ($&gt;32^\\circ\\text{C}$) and pH decline trigger downregulation of Outer Surface Protein A (<em>OspA</em>) and upregulation of <em>OspC</em>, enabling spirochete dissemination into salivary glands after 36–48 hours of attachment.
                </p>
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: ui-monospace, monospace; border-top: 1px solid var(--border); padding-top: 0.6rem;">
                📚 Schwan TG, Piesman J. J Clin Microbiol. 2000; PMID: 10618055
              </div>
            </div>
            <div class="card-face card-back">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                  <span style="font-size: 0.7rem; font-family: ui-monospace, monospace; color: var(--amber-light); font-weight: bold;">🎒 6TH-GRADE PLAIN ENGLISH</span>
                  <button type="button" onclick="document.getElementById('flip1').classList.toggle('flipped')" style="background: transparent; border: 1px solid var(--border); color: #fff; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.6875rem;">Flip ↺</button>
                </div>
                <h3 style="font-size: 1.1rem; color: var(--amber-light); margin-bottom: 0.5rem;">The Warm Soup Alarm Clock</h3>
                <p style="font-size: 0.8125rem; color: #fef3c7; line-height: 1.55;">
                  Inside the tick's gut, Lyme bacteria are asleep wearing cold-weather winter coats (OspA). When warm blood arrives like hot soup, the bacteria wake up, swap their winter coat for running shoes (OspC), and sprint into the bite. This takes about 36 hours!
                </p>
              </div>
              <div style="font-size: 0.72rem; color: var(--amber-light); font-family: ui-monospace, monospace; border-top: 1px solid rgba(245,158,11,0.2); padding-top: 0.6rem;">
                💡 Takeaway: Removing ticks before 36 hours prevents the bacteria from putting on their running shoes.
              </div>
            </div>
          </div>
        </div>

        <!-- Card 2: Babesia Co-Infection -->
        <div class="card-3d" id="flip2" ondblclick="this.classList.toggle('flipped')">
          <div class="card-3d-inner">
            <div class="card-face card-front">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                  <span style="font-size: 0.7rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: bold;">🔬 PARASITOLOGY &amp; HEMATOLOGY</span>
                  <button type="button" onclick="document.getElementById('flip2').classList.toggle('flipped')" style="background: transparent; border: 1px solid var(--border); color: #fff; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.6875rem;">Flip ↺</button>
                </div>
                <h3 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">Babesia microti &amp; Hemolysis</h3>
                <p style="font-size: 0.8125rem; color: #d4d4d8; line-height: 1.55;">
                  <em>Babesia microti</em> is an intraerythrocytic protozoan causing hemolytic anemia, high LDH, and drenching fevers. Doxycycline monotherapy is clinically inert against protozoa; mandatory treatment requires <strong>Atovaquone + Azithromycin</strong>.
                </p>
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: ui-monospace, monospace; border-top: 1px solid var(--border); padding-top: 0.6rem;">
                📚 Vannier EG, Diuk-Wasser MA. N Engl J Med. 2012; PMID: 22716977
              </div>
            </div>
            <div class="card-face card-back">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                  <span style="font-size: 0.7rem; font-family: ui-monospace, monospace; color: var(--amber-light); font-weight: bold;">🎒 6TH-GRADE PLAIN ENGLISH</span>
                  <button type="button" onclick="document.getElementById('flip2').classList.toggle('flipped')" style="background: transparent; border: 1px solid var(--border); color: #fff; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.6875rem;">Flip ↺</button>
                </div>
                <h3 style="font-size: 1.1rem; color: var(--amber-light); margin-bottom: 0.5rem;">The Red Blood Cell Pirates</h3>
                <p style="font-size: 0.8125rem; color: #fef3c7; line-height: 1.55;">
                  While Lyme bacteria are corkscrew squigglers swimming outside your cells, Babesia are microscopic pirates that break inside your red oxygen submarines and pop them. Regular Lyme medicine cannot catch them because they hide inside!
                </p>
              </div>
              <div style="font-size: 0.72rem; color: var(--amber-light); font-family: ui-monospace, monospace; border-top: 1px solid rgba(245,158,11,0.2); padding-top: 0.6rem;">
                💡 Takeaway: If you have extreme night sweats and low energy, doctors must check your red blood cells under a microscope.
              </div>
            </div>
          </div>
        </div>

        <!-- Card 3: Donella Meadows Leverage -->
        <div class="card-3d" id="flip3" ondblclick="this.classList.toggle('flipped')">
          <div class="card-3d-inner">
            <div class="card-face card-front">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                  <span style="font-size: 0.7rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: bold;">⟁ SYSTEMS BIOLOGY HIERARCHY</span>
                  <button type="button" onclick="document.getElementById('flip3').classList.toggle('flipped')" style="background: transparent; border: 1px solid var(--border); color: #fff; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.6875rem;">Flip ↺</button>
                </div>
                <h3 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">Meadows Leverage Level 1: Paradigm Change</h3>
                <p style="font-size: 0.8125rem; color: #d4d4d8; line-height: 1.55;">
                  Shifting from reactive tick bite eradication (Leverage 12) to reservoir host gene drive disruption (Leverage 1: MIT Kevin Esvelt <em>Mice Against Ticks</em>) permanently eliminates the transmission vector at the ecological root.
                </p>
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted); font-family: ui-monospace, monospace; border-top: 1px solid var(--border); padding-top: 0.6rem;">
                📚 Meadows DH. Thinking in Systems (2008); Esvelt KM et al.
              </div>
            </div>
            <div class="card-face card-back">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                  <span style="font-size: 0.7rem; font-family: ui-monospace, monospace; color: var(--amber-light); font-weight: bold;">🎒 6TH-GRADE PLAIN ENGLISH</span>
                  <button type="button" onclick="document.getElementById('flip3').classList.toggle('flipped')" style="background: transparent; border: 1px solid var(--border); color: #fff; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.6875rem;">Flip ↺</button>
                </div>
                <h3 style="font-size: 1.1rem; color: var(--amber-light); margin-bottom: 0.5rem;">Vaccinating the Island Mice</h3>
                <p style="font-size: 0.8125rem; color: #fef3c7; line-height: 1.55;">
                  Instead of spraying harsh poison on bushes or giving humans pills after every hike, scientists are teaching Nantucket's wild white-footed mice to be naturally immune to ticks! When ticks bite immune mice, the bacteria can't survive.
                </p>
              </div>
              <div style="font-size: 0.72rem; color: var(--amber-light); font-family: ui-monospace, monospace; border-top: 1px solid rgba(245,158,11,0.2); padding-top: 0.6rem;">
                💡 Takeaway: Fix the ecosystem engine at the source rather than constantly fixing individual flat tires.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Microclimate Desiccation Radar Section -->
  <section id="microclimate" class="case-section">
    <div class="container">
      <div class="section-head">
        <h2>☀️ Microclimate Desiccation &amp; Questing Radar</h2>
        <p>Blacklegged ticks (<em>Ixodes scapularis</em>) lack an active drinking mechanism; they survive by absorbing atmospheric water vapor. When Vapor Pressure Deficit (VPD) rises above 0.8 kPa, nymphs desiccate rapidly and seek refuge in humid leaf litter.</p>
      </div>

      <div class="radar-box">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <div>
            <div style="font-size: 0.7rem; font-family: ui-monospace, monospace; color: var(--teal-light); text-transform: uppercase; font-weight: bold;">Physics Engine</div>
            <h3 style="font-size: 1.25rem; color: #fff; font-weight: 800;">Vapor Pressure Deficit (VPD) Calculator</h3>
          </div>
          <div id="questingBadge" style="padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.75rem; font-family: ui-monospace, monospace; font-weight: bold; background: rgba(248, 113, 113, 0.15); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.3);">
            ⚠️ Extreme Questing Hazard
          </div>
        </div>

        <div class="slider-row">
          <label>
            <span>Island Ambient Temperature (°F)</span>
            <span id="tempVal" style="color: var(--teal-light); font-family: ui-monospace, monospace; font-weight: bold;">72°F</span>
          </label>
          <input type="range" id="tempSlider" min="45" max="95" value="72" oninput="updateVpd()" />
        </div>

        <div class="slider-row">
          <label>
            <span>Relative Humidity (% RH)</span>
            <span id="rhVal" style="color: var(--teal-light); font-family: ui-monospace, monospace; font-weight: bold;">85%</span>
          </label>
          <input type="range" id="rhSlider" min="30" max="100" value="85" oninput="updateVpd()" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border);">
          <div style="background: #09090b; padding: 1rem; border-radius: 0.5rem; border: 1px solid var(--border);">
            <div style="font-size: 0.7rem; font-family: ui-monospace, monospace; color: var(--text-muted); text-transform: uppercase;">Computed VPD</div>
            <div id="computedVpd" style="font-size: 1.75rem; font-weight: 800; color: #fff; margin-top: 0.25rem;">0.42 kPa</div>
            <div style="font-size: 0.75rem; color: var(--teal-light); margin-top: 0.25rem;">High Moisture / Active Questing</div>
          </div>
          <div style="background: #09090b; padding: 1rem; border-radius: 0.5rem; border: 1px solid var(--border);">
            <div style="font-size: 0.7rem; font-family: ui-monospace, monospace; color: var(--text-muted); text-transform: uppercase;">Tick Behavior Prediction</div>
            <div id="behaviorPrediction" style="font-size: 0.875rem; font-weight: 600; color: #d4d4d8; margin-top: 0.5rem; line-height: 1.5;">
              Nymphs are actively questing on the tips of beach grass and huckleberry scrub at knee height. Permethrin sock barriers mandatory!
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- IDSA 72-Hour Doxycycline Prophylaxis Algorithm -->
  <section id="doxy-algorithm" class="case-section" style="background: #0d0d10;">
    <div class="container">
      <div class="section-head">
        <h2>🔬 IDSA 72-Hour Single-Dose Doxycycline Prophylaxis Checker</h2>
        <p>Evaluates Infectious Diseases Society of America (IDSA), American Academy of Neurology (AAN), and American College of Rheumatology (ACR) clinical guidelines for prophylactic single-dose doxycycline ($200\text{ mg}$).</p>
      </div>

      <div style="background: var(--card); border: 1px solid var(--border); border-radius: 1rem; padding: 2rem; max-width: 860px; margin: 0 auto;">
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <label style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; cursor: pointer;">
            <input type="checkbox" id="crit1" checked onchange="evaluateDoxyCriteria()" style="width: 1.25rem; height: 1.25rem; accent-color: var(--teal);" />
            <span>1. Tick identified as blacklegged tick (<em>Ixodes scapularis</em> nymph or adult female).</span>
          </label>
          <label style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; cursor: pointer;">
            <input type="checkbox" id="crit2" checked onchange="evaluateDoxyCriteria()" style="width: 1.25rem; height: 1.25rem; accent-color: var(--teal);" />
            <span>2. Tick estimated to have been attached for $\ge 36\text{ hours}$ (engorged or known exposure).</span>
          </label>
          <label style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; cursor: pointer;">
            <input type="checkbox" id="crit3" checked onchange="evaluateDoxyCriteria()" style="width: 1.25rem; height: 1.25rem; accent-color: var(--teal);" />
            <span>3. Prophylaxis can be started within $72\text{ hours}$ of tick removal.</span>
          </label>
          <label style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; cursor: pointer;">
            <input type="checkbox" id="crit4" checked onchange="evaluateDoxyCriteria()" style="width: 1.25rem; height: 1.25rem; accent-color: var(--teal);" />
            <span>4. Local rate of tick infection is $\ge 20\%$ (Nantucket exceeds 40%).</span>
          </label>
          <label style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; cursor: pointer;">
            <input type="checkbox" id="crit5" onchange="evaluateDoxyCriteria()" style="width: 1.25rem; height: 1.25rem; accent-color: #f87171;" />
            <span style="color: #fca5a5;">5. Contraindication present (doxycycline allergy, severe hepatic impairment, pregnancy).</span>
          </label>
        </div>

        <div id="doxyOutcome" style="margin-top: 1.5rem; padding: 1.25rem; border-radius: 0.75rem; background: rgba(20, 184, 166, 0.1); border: 1px solid var(--teal); font-size: 0.875rem; line-height: 1.6;">
          <strong style="color: var(--teal-light);">Clinical Recommendation:</strong> Single-dose Doxycycline $200\text{ mg}$ orally with food is strongly indicated. Decreases risk of Lyme disease by up to 87%. <em>Warning: Prophylaxis does NOT prevent Babesiosis or Anaplasmosis; monitor for drenching fevers over 30 days.</em>
        </div>
      </div>
    </div>
  </section>

  <!-- HL7 FHIR R4 Bundle Export & Action Section -->
  <section id="fhir-export" class="case-section">
    <div class="container" style="text-align: center;">
      <div class="section-head" style="margin: 0 auto 2rem; max-width: 700px;">
        <h2>🏥 Interoperable HL7 FHIR R4 Bundle Standard</h2>
        <p>Seamlessly export this complete clinical case study into EHR-compliant JSON standard format, compatible with Nantucket Cottage Hospital and Mass General Brigham Epic systems.</p>
      </div>

      <div style="display: inline-flex; gap: 1rem; flex-wrap: wrap; justify-content: center; margin-bottom: 2rem;">
        <button type="button" class="btn-primary" onclick="downloadNantucketFhirJson()">
          <span>⚡ Download FHIR R4 Bundle (.json)</span>
        </button>
        <a href="https://pocketgull.app/?case=nantucket&autostart=true" class="btn-secondary">
          <span>🚀 Launch Cockpit Simulation →</span>
        </a>
      </div>

      <div style="background: #111114; border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.5rem; max-width: 720px; margin: 0 auto; text-align: left; font-family: ui-monospace, monospace; font-size: 0.75rem; color: #a1a1aa; overflow-x: auto;">
        <div style="color: var(--teal-light); margin-bottom: 0.5rem;">// Sample FHIR R4 Observation: Babesia Maltese Cross Tetrad</div>
        <pre>{
  "resourceType": "Bundle",
  "type": "collection",
  "entry": [
    {
      "resource": {
        "resourceType": "Observation",
        "status": "final",
        "code": { "coding": [{ "system": "http://loinc.org", "code": "10665-8", "display": "Babesia microti identified in Blood" }] },
        "valueCodeableConcept": { "text": "Intraerythrocytic tetrads (Maltese cross) present" }
      }
    }
  ]
}</pre>
      </div>
    </div>
  </section>

  <!-- Universal Doc Drill Socratic Research Drawer -->
  <div id="docDrillBackdrop" class="doc-drill-backdrop" onclick="closeDocDrill()"></div>
  <aside id="docDrillDrawer" class="doc-drill-drawer" aria-label="Doc Drill Evidence Focus Drawer">
    <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: rgba(9, 9, 11, 0.95);">
      <div style="display: flex; align-items: center; gap: 0.6rem;">
        <span style="font-size: 1.35rem;">🔬</span>
        <div>
          <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase;">PocketGull Socratic Educator</div>
          <h3 style="font-size: 1.05rem; font-weight: 800; color: #fff; margin: 0;">Doc Drill &bull; Evidence Focus</h3>
        </div>
      </div>
      <button onclick="closeDocDrill()" style="background: transparent; border: 1px solid var(--border); color: var(--text-muted); font-size: 1.1rem; cursor: pointer; padding: 0.2rem 0.5rem; border-radius: 0.375rem;" aria-label="Close Drawer">&times;</button>
    </div>

    <div id="docDrillBody" style="flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
      <!-- Populated via openDocDrill() -->
    </div>

    <div style="padding: 1rem 1.5rem; border-top: 1px solid var(--border); background: #0c0c0e;">
      <form onsubmit="event.preventDefault(); submitDocDrillQuestion();" style="display: flex; gap: 0.5rem;">
        <input type="text" id="docDrillQueryInput" placeholder="Ask Doc Drill about this concept..." style="flex: 1; background: #18181b; border: 1px solid var(--border); color: #fff; padding: 0.55rem 0.75rem; border-radius: 0.375rem; font-size: 0.8125rem;" />
        <button type="submit" class="btn-primary" style="padding: 0.55rem 1rem; font-size: 0.8125rem;">Ask</button>
      </form>
    </div>
  </aside>

  <!-- Footer -->
  <footer style="padding: 3rem 0; border-top: 1px solid var(--border); background: #09090b; font-size: 0.8125rem; color: var(--text-muted);">
    <div class="container" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div>
        <span class="font-brand" style="font-size: 1rem; font-weight: bold; color: #fff;">PocketGull</span> &bull; Certified Corporate Identity: PocketGull LLC (Oregon Registry: 258869891 | CMS NPI: 1487569752)
      </div>
      <div style="display: flex; gap: 1rem;">
        <a href="https://github.com/pocketgull-app/nantucket-tick-radar" target="_blank" rel="noopener" style="color: var(--teal-light); text-decoration: none;">GitHub Repository ↗</a>
        <a href="/" style="color: var(--text-muted); text-decoration: none;">PocketGull.com Home</a>
      </div>
    </div>
  </footer>

  <script>
    // ─── Initialize Leaflet GIS Island Map ───
    document.addEventListener('DOMContentLoaded', () => {
      if (typeof L !== 'undefined') {
        const map = L.map('islandMap').setView([41.2835, -70.0995], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const hotspots = [
          { name: 'Sanford Farm & Ram Pasture', coords: [41.268, -70.155], status: 'High Nymph Density (&gt;45%)', color: '#f87171' },
          { name: 'Coskata-Coatue Wildlife Refuge', coords: [41.345, -70.035], status: 'Remote Field Zone &bull; Zero Cellular Signal', color: '#f87171' },
          { name: 'Squam Swamp Conservation Trail', coords: [41.305, -70.015], status: 'Dense Fern Canopy &bull; High Moisture (VPD 0.25)', color: '#fbbf24' },
          { name: 'Linda Loring Nature Foundation', coords: [41.282, -70.170], status: 'Mowed Educational Trail &bull; Low Threat Zone', color: '#34d399' },
          { name: 'Polpis Scrub (Case Incident Site)', coords: [41.295, -70.055], status: 'Co-Infection Zone &bull; Babesia Endemic', color: '#f87171' },
          { name: 'Nantucket Cottage Hospital Walk-in', coords: [41.278, -70.096], status: 'Hospital &amp; Triage Pharmacy &bull; (508) 825-1000', color: '#38bdf8' }
        ];

        hotspots.forEach(spot => {
          L.circleMarker(spot.coords, {
            radius: 8,
            fillColor: spot.color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.85
          }).addTo(map).bindPopup('<strong>' + spot.name + '</strong><br/><span style="font-size:0.75rem; color:#666;">' + spot.status + '</span>');
        });
      }
    });

    // ─── Flip Card Handlers ───
    function toggleAllCards() {
      const cards = document.querySelectorAll('.card-3d');
      cards.forEach(c => c.classList.toggle('flipped'));
    }

    // ─── Microclimate VPD Engine ───
    function updateVpd() {
      const tempF = parseFloat(document.getElementById('tempSlider').value);
      const rh = parseFloat(document.getElementById('rhSlider').value);
      document.getElementById('tempVal').textContent = tempF + '°F';
      document.getElementById('rhVal').textContent = rh + '%';

      // Convert °F to °C
      const tempC = (tempF - 32) * (5 / 9);
      // Saturated Vapor Pressure in kPa
      const es = 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
      // Actual Vapor Pressure
      const ea = es * (rh / 100);
      const vpd = Math.max(0, es - ea);

      document.getElementById('computedVpd').textContent = vpd.toFixed(2) + ' kPa';

      const badge = document.getElementById('questingBadge');
      const behavior = document.getElementById('behaviorPrediction');

      if (vpd < 0.6) {
        badge.textContent = '⚠️ Extreme Questing Hazard';
        badge.style.background = 'rgba(248, 113, 113, 0.15)';
        badge.style.color = '#f87171';
        badge.style.borderColor = 'rgba(248, 113, 113, 0.3)';
        behavior.textContent = 'High ambient humidity allows nymphs to quest on upper vegetation blades without desiccation risk. Maximum transmission hazard.';
      } else if (vpd < 1.2) {
        badge.textContent = '⚡ Moderate Exposure Risk';
        badge.style.background = 'rgba(251, 191, 36, 0.15)';
        badge.style.color = '#fbbf24';
        badge.style.borderColor = 'rgba(251, 191, 36, 0.3)';
        behavior.textContent = 'Ticks actively alternate between questing and retreating to moist leaf litter to rehydrate. Trailside brushing risk.';
      } else {
        badge.textContent = '🛡️ Low Questing Activity (Desiccation)';
        badge.style.background = 'rgba(52, 211, 153, 0.15)';
        badge.style.color = '#34d399';
        badge.style.borderColor = 'rgba(52, 211, 153, 0.3)';
        behavior.textContent = 'Atmospheric drying force exceeds tick osmotic tolerance. Nymphs are suppressed deep within humid subterranean leaf humus.';
      }
    }

    // ─── IDSA Doxycycline Criteria Evaluator ───
    function evaluateDoxyCriteria() {
      const c1 = document.getElementById('crit1').checked;
      const c2 = document.getElementById('crit2').checked;
      const c3 = document.getElementById('crit3').checked;
      const c4 = document.getElementById('crit4').checked;
      const c5 = document.getElementById('crit5').checked;
      const out = document.getElementById('doxyOutcome');

      if (c5) {
        out.style.background = 'rgba(248, 113, 113, 0.15)';
        out.style.borderColor = '#f87171';
        out.innerHTML = '<strong style="color: #f87171;">Prophylaxis Withheld:</strong> Doxycycline contraindication present. IDSA recommends watchful waiting rather than alternative antimicrobial prophylaxis, as amoxicillin is not recommended for prophylaxis due to lack of efficacy trials.';
      } else if (c1 && c2 && c3 && c4) {
        out.style.background = 'rgba(20, 184, 166, 0.1)';
        out.style.borderColor = 'var(--teal)';
        out.innerHTML = '<strong style="color: var(--teal-light);">Clinical Recommendation:</strong> Single-dose Doxycycline 200mg orally with food is strongly indicated. Decreases risk of Lyme disease by up to 87%. <em>Warning: Prophylaxis does NOT prevent Babesiosis or Anaplasmosis; monitor for drenching fevers over 30 days.</em>';
      } else {
        out.style.background = 'rgba(251, 191, 36, 0.1)';
        out.style.borderColor = '#fbbf24';
        out.innerHTML = '<strong style="color: #fbbf24;">Watchful Waiting Indicated:</strong> Not all IDSA criteria met (e.g. attachment &lt; 36 hours or removal &gt; 72 hours ago). Monitor for circular erythema migrans rash, fatigue, or fever over next 30 days.';
      }
    }

    // ─── HL7 FHIR R4 Bundle Downloader ───
    function downloadNantucketFhirJson() {
      const fhirBundle = {
        resourceType: 'Bundle',
        id: 'bundle-nantucket-landscaper-case-study',
        type: 'collection',
        timestamp: new Date().toISOString(),
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: 'p-nantucket-landscaper-42',
              active: true,
              name: [{ family: 'CaseStudy', given: ['NantucketLandscaper'] }],
              gender: 'male',
              birthDate: '1984-06-12',
              address: [{ city: 'Nantucket', state: 'MA', postalCode: '02554' }]
            }
          },
          {
            resource: {
              resourceType: 'Observation',
              id: 'obs-babesia-maltese-cross',
              status: 'final',
              code: { coding: [{ system: 'http://loinc.org', code: '10665-8', display: 'Babesia microti identified in Blood' }] },
              valueCodeableConcept: { text: 'Intraerythrocytic tetrads (Maltese cross) present on peripheral thin blood smear' }
            }
          },
          {
            resource: {
              resourceType: 'Observation',
              id: 'obs-borrelia-c6-elisa',
              status: 'final',
              code: { coding: [{ system: 'http://loinc.org', code: '40618-1', display: 'Borrelia burgdorferi C6 peptide Ab' }] },
              valueQuantity: { value: 3.8, unit: 'IV', system: 'http://unitsofmeasure.org' }
            }
          },
          {
            resource: {
              resourceType: 'CarePlan',
              id: 'plan-dual-clearance',
              status: 'active',
              intent: 'order',
              title: 'Dual Clearance Protocol: Doxycycline + Atovaquone/Azithromycin',
              description: 'Concurrent treatment of Borrelia burgdorferi and Babesia microti co-infection with botanical biofilm disruption'
            }
          }
        ]
      };

      const blob = new Blob([JSON.stringify(fhirBundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PocketGull_FHIR_R4_Nantucket_Case_Study.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    // ─── Doc Drill Drawer Logic ───
    let currentDrillTerm = 'Babesia microti';
    const DOC_DRILL_DB = {
      'Babesia microti': {
        category: 'VECTOR CO-INFECTION',
        summary: 'Intraerythrocytic apicomplexan protozoan endemic to Nantucket and coastal New England, transmitted by Ixodes scapularis nymphs.',
        clinicalTrap: 'Clinicians routinely mistake Babesiosis for refractory Lyme disease. Standard Lyme monotherapy (Doxycycline) does NOT clear Babesia. If hemolytic anemia, drenching sweats, or Maltese cross tetrads are present, dual therapy (Atovaquone + Azithromycin) is mandatory.',
        citations: 'Lantos PM et al. Clin Infect Dis. 2021; Vannier EG et al. N Engl J Med. 2012.'
      },
      'Meadows Leverage L1-9': {
        category: 'SYSTEMS BIOLOGY',
        summary: 'Donella Meadows\' 12 Leverage Points hierarchy applied to ecological vector transmission and immunological response.',
        clinicalTrap: 'Treating individual tick bites with antibiotics is Leverage Point 12 (shallow parameters). Disrupting the reservoir host transmission cycle (Leverage Point 1: Paradigm Change via MIT Mice Against Ticks) solves the crisis at the ecological source.',
        citations: 'Meadows DH. Thinking in Systems: A Primer (2008); Esvelt KM et al. MIT Media Lab (2020).'
      }
    };

    function openDocDrill(term) {
      currentDrillTerm = term;
      const data = DOC_DRILL_DB[term] || {
        category: 'CLINICAL CDS CONCEPT',
        summary: 'Clinical and systems biology evidence grounding for ' + term + '.',
        clinicalTrap: 'PocketGull applies Popperian falsifiability and zero-error legibility standards to all clinical telemetry and diagnostic recommendations.',
        citations: 'PocketGull Clinical Intelligence Codex v1.31; FDA CDS Guidance.'
      };

      const body = document.getElementById('docDrillBody');
      if (body) {
        body.innerHTML = '<div style="background: #18181b; border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem;">' +
          '<div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase;">Category: ' + data.category + '</div>' +
          '<h4 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin: 0.35rem 0 0.75rem;">' + term + '</h4>' +
          '<p style="font-size: 0.8125rem; color: #d4d4d8; line-height: 1.6;">' + data.summary + '</p>' +
        '</div>' +
        '<div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 0.75rem; padding: 1.25rem;">' +
          '<div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--amber-light); font-weight: 700; text-transform: uppercase;">⚠️ Socratic Clinical Invariant &amp; Trap</div>' +
          '<p style="font-size: 0.8125rem; color: #fef3c7; line-height: 1.6; margin-top: 0.35rem;">' + data.clinicalTrap + '</p>' +
        '</div>' +
        '<div style="background: #09090b; border: 1px solid var(--border); border-radius: 0.75rem; padding: 1rem;">' +
          '<div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); text-transform: uppercase;">Primary Citations</div>' +
          '<p style="font-size: 0.75rem; color: #a1a1aa; margin-top: 0.25rem; font-style: italic;">' + data.citations + '</p>' +
        '</div>';
      }

      document.getElementById('docDrillDrawer').classList.add('open');
      document.getElementById('docDrillBackdrop').classList.add('open');
    }

    function closeDocDrill() {
      document.getElementById('docDrillDrawer').classList.remove('open');
      document.getElementById('docDrillBackdrop').classList.remove('open');
    }

    function submitDocDrillQuestion() {
      const input = document.getElementById('docDrillQueryInput');
      const q = input.value.trim();
      if (!q) return;

      const body = document.getElementById('docDrillBody');
      const qCard = document.createElement('div');
      qCard.style.cssText = 'background: #1e1e24; border: 1px solid var(--teal); border-radius: 0.75rem; padding: 1rem;';
      qCard.innerHTML = '<div style="font-size: 0.7rem; color: var(--teal-light); font-family: ui-monospace, monospace; font-weight: bold;">💬 CLINICIAN QUERY</div>' +
        '<div style="font-size: 0.85rem; color: #fff; margin: 0.25rem 0 0.75rem;">"' + q + '"</div>' +
        '<div style="font-size: 0.8125rem; color: #d4d4d8; line-height: 1.6;">' +
          '<strong style="color: var(--teal-light);">Doc Drill Socratic Analysis:</strong> Regarding <em>' + q + '</em> in relation to <strong>' + currentDrillTerm + '</strong>: PocketGull models the full multi-organ and vector ecology continuum. Always rule out intraerythrocytic Babesia co-infections when evaluating post-tick fatigue with thrombocytopenia or hemolytic signs, and check the 72-hour prophylactic window before administering single-dose doxycycline.' +
        '</div>';
      body.appendChild(qCard);
      input.value = '';
      body.scrollTop = body.scrollHeight;
    }
  </script>
</body>
</html>`;
}
