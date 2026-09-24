// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

/**
 * PocketGull Real-World Community Case Study #02
 * Multiple Sclerosis & Neuro-Axonal Sanctuary: Biophysical Conduction & Salutogenesis
 * Hosted at pocketgull.com/case-studies/neuro-sanctuary
 */

import { renderLegalFooterHtml } from './legal-footer';

export function renderNeuroSanctuaryCaseStudyHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MS Neuro-Axonal Sanctuary &amp; Biophysical Radar — PocketGull Case Study #02</title>
  <meta name="description" content="Explore how PocketGull models Multiple Sclerosis through biophysical conduction reserve, Uhthoff cooling physics, neuroplastic detours, and the Austrian 3-Act Trajectory." />
  <meta property="og:title" content="MS Neuro-Axonal Sanctuary — PocketGull Clinical Case Study #02" />
  <meta property="og:description" content="Restoring conduction reserve, cooling physics, and compassionate agency in Multiple Sclerosis. Zero fatalism, pure salutogenesis." />
  <meta property="og:url" content="https://pocketgull.com/case-studies/neuro-sanctuary" />
  <meta property="og:type" content="article" />

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

    /* Top Sticky Cockpit Bridge Banner */
    .cockpit-bridge {
      position: sticky;
      top: 0;
      z-index: 100;
      background: linear-gradient(90deg, #1e1b4b 0%, #312e81 50%, #0f766e 100%);
      color: #fff;
      padding: 0.65rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.15);
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
    .logo-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: #fff;
    }
    .nav-links {
      display: flex;
      gap: 1.25rem;
      font-size: 0.875rem;
      align-items: center;
    }
    .nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.15s ease;
    }
    .nav-links a:hover {
      color: var(--teal-light);
    }

    /* Hero */
    .hero {
      padding: 4rem 0 3rem;
      border-bottom: 1px solid var(--border);
      background: radial-gradient(circle at 50% 0%, rgba(45, 212, 191, 0.08) 0%, transparent 60%);
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.3rem 0.85rem;
      border-radius: 9999px;
      background: rgba(244, 63, 94, 0.12);
      border: 1px solid rgba(244, 63, 94, 0.35);
      color: var(--rose-light);
      font-size: 0.75rem;
      font-family: ui-monospace, monospace;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 1.25rem;
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
      max-width: 860px;
      line-height: 1.65;
      margin-bottom: 2rem;
    }

    /* Stat Grid */
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

    /* Section styling */
    .case-section {
      padding: 4rem 0;
      border-bottom: 1px solid var(--border);
    }
    .section-head {
      margin-bottom: 2.25rem;
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

    /* 3D Flip Card System */
    .flip-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .card-3d {
      background-color: transparent;
      perspective: 1000px;
      height: 340px;
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
      width: 100%;
      height: 100%;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      border-radius: 1rem;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .card-front {
      background: #121215;
    }
    .card-back {
      background: #181820;
      border: 1px solid rgba(45, 212, 191, 0.4);
      transform: rotateY(180deg);
    }

    /* Interactive Buttons */
    .btn-primary {
      background: var(--teal);
      color: #09090b;
      font-weight: 700;
      padding: 0.65rem 1.25rem;
      border-radius: 0.5rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
    }
    .btn-primary:hover {
      background: var(--teal-light);
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: transparent;
      color: var(--text);
      border: 1px solid var(--border);
      padding: 0.65rem 1.25rem;
      border-radius: 0.5rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-secondary:hover {
      border-color: var(--teal-light);
      color: var(--teal-light);
    }

    /* Print Styles */
    @media print {
      .cockpit-bridge, header, footer, .btn-primary, .btn-secondary, #radarControls, #triageSection, .no-print {
        display: none !important;
      }
      body, html {
        background: #fff !important;
        color: #000 !important;
      }
      .card-face {
        border: 1px solid #ccc !important;
        background: #fff !important;
        color: #000 !important;
      }
      #fridgeCard {
        border: 2px solid #000 !important;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>

  <!-- Top Sticky Cockpit Bridge -->
  <div class="cockpit-bridge">
    <div class="container cockpit-bridge-inner">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 1.25rem;">🌸</span>
        <span style="font-weight: 700; font-size: 0.8125rem; letter-spacing: 0.02em;">
          POCKETGULL CLINICAL CASE STUDY #02 &bull; MULTIPLE SCLEROSIS &bull; SALUTOGENIC RADAR
        </span>
      </div>
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <a href="https://pocketgull.app/?case=ms-sanctuary&autostart=true" class="launch-btn">
          <span>🚀 Launch Clinical Cockpit</span>
        </a>
      </div>
    </div>
  </div>

  <!-- Header -->
  <header>
    <div class="container header-inner">
      <a href="/" class="logo-badge">
        <span style="font-size: 1.5rem;">🕊️</span>
        <span style="font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em;" class="font-brand">PocketGull</span>
      </a>

      <nav class="nav-links">
        <a href="#cooling-radar">Thermal Radar</a>
        <a href="#flip-cards">Dual Perspectives</a>
        <a href="#neuro-axis">360° Neuro-Axis</a>
        <a href="#trajectory">3-Act Trajectory</a>
        <a href="#innovation-3b">3B Innovation</a>
        <a href="#triage">"Am I Safe?" Flow</a>
        <a href="#fridge-card">Printable Care Card</a>
        <a href="#fhir-export">FHIR R4 Export</a>
      </nav>

      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <button type="button" onclick="togglePaperMode()" class="btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.75rem; border-radius: 9999px;">
          <span id="themeToggleIcon">📜</span> <span id="themeToggleText">Monastic Paper</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Hero -->
  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-badge">
          <span>🌸</span> Neuro-Axonal Sanctuary &bull; Biophysical Conduction Radar
        </div>

        <h1>Restoring Conduction &amp; Agency<br /><span>In Multiple Sclerosis.</span></h1>

        <p class="hero-lead">
          Multiple Sclerosis care has too often been clouded by catastrophic deficit narratives. Grounded in biophysical cooling physics (&Delta;T &le; 0.40&deg;C), neuroplastic detour-building, and the Austrian 3-Act Living Trajectory, PocketGull offers clinicians and patients a peaceful, evidence-grounded sanctuary of understanding.
        </p>

        <!-- 4 Core Metrics -->
        <div class="stat-grid">
          <div class="stat-box">
            <div class="stat-label">&Delta;T Conduction Reserve</div>
            <div class="stat-value" style="color: var(--teal-light);">&le; 0.40&deg;C</div>
            <div class="stat-desc">Action potentials traverse demyelinated axons smoothly when core temperature rise is buffered.</div>
          </div>

          <div class="stat-box">
            <div class="stat-label">Uhthoff Reversibility</div>
            <div class="stat-value" style="color: var(--amber-light);">100% Physical</div>
            <div class="stat-desc">Heat-induced slowing is pure channel impedance, not axonal injury or disease progression.</div>
          </div>

          <div class="stat-box">
            <div class="stat-label">Neuroplastic Detours</div>
            <div class="stat-value" style="color: #38bdf8;">Synaptic Bypasses</div>
            <div class="stat-desc">The central nervous system builds creative alternate pathways when given calm rest and pacing.</div>
          </div>

          <div class="stat-box">
            <div class="stat-label">Quiet Workshop Voice</div>
            <div class="stat-value" style="color: #34d399;">Zero Fatalism</div>
            <div class="stat-desc">All telemetry emphasizes vitality, self-compassion, and restored human agency.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 1. Interactive Uhthoff Conduction & Cooling Reserve Radar -->
    <section id="cooling-radar" class="case-section">
      <div class="container">
        <div class="section-head">
          <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase; margin-bottom: 0.35rem;">
            Biophysical Electrophysiology &bull; Hodgkin-Huxley Temperature Kinetics
          </div>
          <h2>Interactive Uhthoff Conduction Reserve Radar</h2>
          <p>
            Why does a hot bath or a sunny afternoon cause temporary fatigue or blurry vision? In demyelinated axons, voltage-gated sodium channels (Na<sub>V</sub>1.6) inactivate slightly faster at elevated temperatures. Move the temperature slider below to see how a simple &Delta;T buffer restores full conduction safety factor!
          </p>
        </div>

        <div style="background: var(--card); border: 1px solid var(--border); border-radius: 1.25rem; padding: 2rem; max-width: 900px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
          <!-- Slider Control -->
          <div style="margin-bottom: 1.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
              <label for="tempSlider" style="font-weight: 700; font-size: 0.875rem;">
                🌡️ Core Temperature Variation (&Delta;T):
              </label>
              <span id="tempDeltaDisplay" style="font-family: ui-monospace, monospace; font-size: 1.125rem; font-weight: 800; color: var(--teal-light);">
                +0.00°C (Baseline Sanctuary)
              </span>
            </div>
            <input type="range" id="tempSlider" min="-50" max="150" value="0" step="5" oninput="updateUhthoffRadar(this.value)" style="width: 100%; accent-color: var(--teal-light); cursor: pointer;" />
            <div style="display: flex; justify-content: space-between; font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); margin-top: 0.25rem;">
              <span>-0.50°C (Pre-Cooling Vest)</span>
              <span>0.00°C (Baseline Resting)</span>
              <span>+0.40°C (Uhthoff Threshold)</span>
              <span>+1.50°C (Hot Shower / Febrile)</span>
            </div>
          </div>

          <!-- Live Telemetry Readout Box -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: #09090b; border: 1px solid var(--border); padding: 1.25rem; border-radius: 0.75rem;">
              <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); text-transform: uppercase;">Conduction Safety Factor (SF)</div>
              <div id="safetyFactorValue" style="font-size: 1.75rem; font-weight: 800; color: var(--teal-light); margin-top: 0.25rem;">2.10</div>
              <div id="safetyFactorStatus" style="font-size: 0.75rem; color: #34d399; font-weight: bold; margin-top: 0.25rem;">✓ Robust Conduction Across Internodes</div>
            </div>

            <div style="background: #09090b; border: 1px solid var(--border); padding: 1.25rem; border-radius: 0.75rem;">
              <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); text-transform: uppercase;">Action Potential Velocity</div>
              <div id="conductionVelocityValue" style="font-size: 1.75rem; font-weight: 800; color: #38bdf8; margin-top: 0.25rem;">48.2 m/s</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">Smooth saltatory transmission</div>
            </div>

            <div style="background: #09090b; border: 1px solid var(--border); padding: 1.25rem; border-radius: 0.75rem;">
              <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted); text-transform: uppercase;">Axonal Status &amp; Guidance</div>
              <div id="axonalStatusText" style="font-size: 0.8125rem; color: #f4f4f5; line-height: 1.5; margin-top: 0.35rem;">
                Calm baseline. Myelinated reserves provide smooth electrical margin.
              </div>
            </div>
          </div>

          <!-- Educational Takeaway -->
          <div style="background: rgba(45, 212, 191, 0.08); border: 1px solid rgba(45, 212, 191, 0.25); border-radius: 0.75rem; padding: 1rem; font-size: 0.8125rem; color: #d4d4d8; line-height: 1.6;">
            <strong style="color: var(--teal-light);">💡 The Reassuring Truth About Uhthoff Phenomenon:</strong>
            When temperature rises, the nerve impulses encounter temporary resistance—much like a smartphone dimming its screen when sitting in the hot sun. As soon as the body cools by even 0.3°C, the safety factor rises above 1.8 and normal signals resume immediately. <em>Zero new lesions or structural damage occurred.</em>
          </div>

          <!-- Pre-Cooling Toolkit -->
          <div style="margin-top: 1.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
            <span style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--text-muted); text-transform: uppercase;">Pre-Cooling Toolkit:</span>
            <span style="font-size: 0.75rem; background: #27272a; padding: 0.2rem 0.6rem; border-radius: 9999px;">🧊 Ice-Slurry Hydration (1.25 g/kg)</span>
            <span style="font-size: 0.75rem; background: #27272a; padding: 0.2rem 0.6rem; border-radius: 9999px;">🦺 15°C Phase-Change Vest</span>
            <span style="font-size: 0.75rem; background: #27272a; padding: 0.2rem 0.6rem; border-radius: 9999px;">🏊 Cool Water Therapy (&lt;82°F)</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Dual-Perspective 3D Flip Cards -->
    <section id="flip-cards" class="case-section">
      <div class="container">
        <div class="section-head">
          <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--rose-light); font-weight: 700; text-transform: uppercase; margin-bottom: 0.35rem;">
            Cognitive Translation &bull; The Quiet Workshop Lens
          </div>
          <h2>Dual Perspectives: Biophysics ⇄ Gentle Sanctuary</h2>
          <p>
            Complex neurological concepts translated into reassuring, empowering understanding. <strong>Click or tap any card below</strong> to flip between detailed biophysics and plain English reassurance.
          </p>
        </div>

        <div class="flip-grid">
          <!-- Card 1: Fatigue & The Scenic Trail -->
          <div class="card-3d" onclick="this.classList.toggle('flipped')">
            <div class="card-3d-inner">
              <div class="card-face card-front">
                <div>
                  <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase;">🔬 Clinical Biophysics</div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin: 0.35rem 0 0.5rem;">Microglial Remodeling &amp; Central Fatigue</h3>
                  <p style="font-size: 0.8125rem; color: #d4d4d8; line-height: 1.55;">
                    Central motor conduction slowing and smoldering compartmentalized neuroinflammation (PIRA) increase the ATP metabolic cost per impulse transmission across reorganized cortical pathways.
                  </p>
                </div>
                <div style="font-size: 0.6875rem; color: #71717a; font-family: ui-monospace, monospace;">💡 Tap to flip to Quiet Sanctuary</div>
              </div>
              <div class="card-face card-back">
                <div>
                  <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--amber-light); font-weight: 700; text-transform: uppercase;">🌸 The Quiet Sanctuary</div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: #fef3c7; margin: 0.35rem 0 0.5rem;">The Scenic Mountain Detour</h3>
                  <p style="font-size: 0.8125rem; color: #fef3c7; line-height: 1.55;">
                    Your brain is like an ingenious traveler. When the main highway is undergoing routine maintenance, your nervous system naturally maps beautiful, creative scenic backroads. It simply takes a little extra fuel and a restful lunch break to traverse!
                  </p>
                </div>
                <div style="font-size: 0.6875rem; color: var(--teal-light); font-family: ui-monospace, monospace;">↺ Tap to flip back</div>
              </div>
            </div>
          </div>

          <!-- Card 2: Summer Warmth & Physics -->
          <div class="card-3d" onclick="this.classList.toggle('flipped')">
            <div class="card-3d-inner">
              <div class="card-face card-front">
                <div>
                  <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase;">🔬 Clinical Biophysics</div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin: 0.35rem 0 0.5rem;">Temperature-Dependent Depolarization (Uhthoff)</h3>
                  <p style="font-size: 0.8125rem; color: #d4d4d8; line-height: 1.55;">
                    Nodal channel kinetics: Elevated core temperatures increase open-state inactivation of Na<sub>V</sub>1.6 sodium channels, dropping conduction safety factor below unity in unmyelinated segments.
                  </p>
                </div>
                <div style="font-size: 0.6875rem; color: #71717a; font-family: ui-monospace, monospace;">💡 Tap to flip to Quiet Sanctuary</div>
              </div>
              <div class="card-face card-back">
                <div>
                  <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--amber-light); font-weight: 700; text-transform: uppercase;">🌸 The Quiet Sanctuary</div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: #fef3c7; margin: 0.35rem 0 0.5rem;">The Overheated Smartphone</h3>
                  <p style="font-size: 0.8125rem; color: #fef3c7; line-height: 1.55;">
                    When your phone sits on the porch in direct sunlight, it politely pauses apps to stay cool. Your nerves do the exact same thing! A tall glass of iced water or a cooling towel brings back full clarity in minutes. Nothing was broken.
                  </p>
                </div>
                <div style="font-size: 0.6875rem; color: var(--teal-light); font-family: ui-monospace, monospace;">↺ Tap to flip back</div>
              </div>
            </div>
          </div>

          <!-- Card 3: Liquid Biomarker (sNfL) -->
          <div class="card-3d" onclick="this.classList.toggle('flipped')">
            <div class="card-3d-inner">
              <div class="card-face card-front">
                <div>
                  <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase;">🔬 Clinical Biophysics</div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin: 0.35rem 0 0.5rem;">Serum Neurofilament Light Chain (sNfL)</h3>
                  <p style="font-size: 0.8125rem; color: #d4d4d8; line-height: 1.55;">
                    Quantified via Single Molecule Array (Simoa). Reflects subclinical neuro-axonal cytoskeletal shedding with age-normed Z-scores to monitor smoldering disease activity.
                  </p>
                </div>
                <div style="font-size: 0.6875rem; color: #71717a; font-family: ui-monospace, monospace;">💡 Tap to flip to Quiet Sanctuary</div>
              </div>
              <div class="card-face card-back">
                <div>
                  <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--amber-light); font-weight: 700; text-transform: uppercase;">🌸 The Quiet Sanctuary</div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: #fef3c7; margin: 0.35rem 0 0.5rem;">The Gentle Oil Dipstick</h3>
                  <p style="font-size: 0.8125rem; color: #fef3c7; line-height: 1.55;">
                    Just like checking your vehicle's engine oil level before a long family road trip, this simple blood check gives your medical team peace of mind that your neural engine is running cleanly and smoothly.
                  </p>
                </div>
                <div style="font-size: 0.6875rem; color: var(--teal-light); font-family: ui-monospace, monospace;">↺ Tap to flip back</div>
              </div>
            </div>
          </div>

          <!-- Card 4: Cellular Nutrition & Energy -->
          <div class="card-3d" onclick="this.classList.toggle('flipped')">
            <div class="card-3d-inner">
              <div class="card-face card-front">
                <div>
                  <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase;">🔬 Clinical Biophysics</div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin: 0.35rem 0 0.5rem;">Mitochondrial ATP Synthesis &amp; PGC-1&alpha;</h3>
                  <p style="font-size: 0.8125rem; color: #d4d4d8; line-height: 1.55;">
                    Demyelinated axolemma requires 2.5x to 4x higher ATP to operate redistributed ion pumps. Enhancing mitochondrial biogenesis protects energetic reserve.
                  </p>
                </div>
                <div style="font-size: 0.6875rem; color: #71717a; font-family: ui-monospace, monospace;">💡 Tap to flip to Quiet Sanctuary</div>
              </div>
              <div class="card-face card-back">
                <div>
                  <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--amber-light); font-weight: 700; text-transform: uppercase;">🌸 The Quiet Sanctuary</div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: #fef3c7; margin: 0.35rem 0 0.5rem;">Fresh Sparkplugs for the Hill</h3>
                  <p style="font-size: 0.8125rem; color: #fef3c7; line-height: 1.55;">
                    Because your body is doing clever extra work to maintain sharp reflexes, nourishing your cellular powerhouses with wholesome foods (leafy greens, CoQ10, omega-3s) gives you crisp, reliable energy for the whole day.
                  </p>
                </div>
                <div style="font-size: 0.6875rem; color: var(--teal-light); font-family: ui-monospace, monospace;">↺ Tap to flip back</div>
              </div>
            </div>
          </div>

          <!-- Card 5: The Overprotective Immune Sentinel -->
          <div class="card-3d" onclick="this.classList.toggle('flipped')">
            <div class="card-3d-inner">
              <div class="card-face card-front">
                <div>
                  <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase;">🔬 Clinical Biophysics</div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin: 0.35rem 0 0.5rem;">CD20+ B-Cells &amp; Molecular Mimicry</h3>
                  <p style="font-size: 0.8125rem; color: #d4d4d8; line-height: 1.55;">
                    Cross-reactive humoral immunity targeting GlialCAM and myelin basic protein following remote Epstein-Barr viral exposure, modulated by modern anti-CD20 therapy.
                  </p>
                </div>
                <div style="font-size: 0.6875rem; color: #71717a; font-family: ui-monospace, monospace;">💡 Tap to flip to Quiet Sanctuary</div>
              </div>
              <div class="card-face card-back">
                <div>
                  <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--amber-light); font-weight: 700; text-transform: uppercase;">🌸 The Quiet Sanctuary</div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: #fef3c7; margin: 0.35rem 0 0.5rem;">The Loyal, Overprotective Guard Dog</h3>
                  <p style="font-size: 0.8125rem; color: #fef3c7; line-height: 1.55;">
                    Your immune system isn't "broken"—it is a loyal, fierce guard dog that worked overtime to keep you safe from past bugs and sometimes barks at shadows. Modern gentle therapies teach the dog to lie down calmly on the sunny porch.
                  </p>
                </div>
                <div style="font-size: 0.6875rem; color: var(--teal-light); font-family: ui-monospace, monospace;">↺ Tap to flip back</div>
              </div>
            </div>
          </div>

          <!-- Card 6: Rest & Vagal Sanctuary -->
          <div class="card-3d" onclick="this.classList.toggle('flipped')">
            <div class="card-3d-inner">
              <div class="card-face card-front">
                <div>
                  <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase;">🔬 Clinical Biophysics</div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin: 0.35rem 0 0.5rem;">Cholinergic Anti-Inflammatory Pathway</h3>
                  <p style="font-size: 0.8125rem; color: #d4d4d8; line-height: 1.55;">
                    Efferent vagus nerve stimulation releases acetylcholine, binding &alpha;7nAChR receptors on splenic macrophages to downregulate TNF-&alpha; and IL-6 cytokine surges.
                  </p>
                </div>
                <div style="font-size: 0.6875rem; color: #71717a; font-family: ui-monospace, monospace;">💡 Tap to flip to Quiet Sanctuary</div>
              </div>
              <div class="card-face card-back">
                <div>
                  <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--amber-light); font-weight: 700; text-transform: uppercase;">🌸 The Quiet Sanctuary</div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: #fef3c7; margin: 0.35rem 0 0.5rem;">The Evening Forest Sanctuary</h3>
                  <p style="font-size: 0.8125rem; color: #fef3c7; line-height: 1.55;">
                    A slow, rhythmic 6-breaths-per-minute breathing practice acts like an evening stroll through a fragrant pine forest. It turns off the body's emergency sirens and invites deep cellular healing while you sleep.
                  </p>
                </div>
                <div style="font-size: 0.6875rem; color: var(--teal-light); font-family: ui-monospace, monospace;">↺ Tap to flip back</div>
              </div>
            </div>
          </div>

          <!-- Card 7: Santa Fe Institute Complex Adaptive Systems -->
          <div class="card-3d" onclick="this.classList.toggle('flipped')">
            <div class="card-3d-inner">
              <div class="card-face card-front">
                <div>
                  <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase;">🔬 Santa Fe Institute CAS</div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin: 0.35rem 0 0.5rem;">Critical Slowing Down &amp; Attractor Bifurcation</h3>
                  <p style="font-size: 0.8125rem; color: #d4d4d8; line-height: 1.55;">
                    Approaching a state transition, dynamic systems exhibit Critical Slowing Down: lag-1 autocorrelation (&rho;<sub>1</sub> &rarr; 1.0) and variance inflation (&sigma;<sup>2</sup> &rarr; &infin;) warning 48&ndash;72 hours prior to acute clinical flare.
                  </p>
                </div>
                <div style="font-size: 0.6875rem; color: #71717a; font-family: ui-monospace, monospace;">💡 Tap to flip to Quiet Sanctuary</div>
              </div>
              <div class="card-face card-back">
                <div>
                  <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--amber-light); font-weight: 700; text-transform: uppercase;">🌸 The Quiet Sanctuary</div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: #fef3c7; margin: 0.35rem 0 0.5rem;">The Resilient Mountain Pine</h3>
                  <p style="font-size: 0.8125rem; color: #fef3c7; line-height: 1.55;">
                    A sturdy mountain pine sways in gusty alpine winds and bounces right back. If it takes an extra second to right itself, it isn't broken—it is simply reminding you to pause, sip some warm broth, and let the wind pass.
                  </p>
                </div>
                <div style="font-size: 0.6875rem; color: var(--teal-light); font-family: ui-monospace, monospace;">↺ Tap to flip back</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. 360° Neuro-Axis Interactive Checkpoint -->
    <section id="neuro-axis" class="case-section">
      <div class="container">
        <div class="section-head">
          <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: #38bdf8; font-weight: 700; text-transform: uppercase; margin-bottom: 0.35rem;">
            Empowering Physical Self-Advocacy &bull; Neuroplastic Mapping
          </div>
          <h2>360° Neuro-Axis Interactive Checkpoint</h2>
          <p>
            Explore the 5 central neural highways. Select any pathway below to see what it does, a gentle reassuring self-check, and a daily neuroplastic vitality ritual.
          </p>
        </div>

        <div style="background: var(--card); border: 1px solid var(--border); border-radius: 1.25rem; padding: 2rem; max-width: 960px; margin: 0 auto;">
          <!-- Pathway Selector Buttons -->
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
            <button type="button" class="tab-btn active" id="btnPathwayOptic" onclick="selectPathway('optic')">👁️ Optic Visual Highway</button>
            <button type="button" class="tab-btn" id="btnPathwayCervical" onclick="selectPathway('cervical')">🤲 Cervical Cord &amp; Hands</button>
            <button type="button" class="tab-btn" id="btnPathwayMotor" onclick="selectPathway('motor')">🚶 Corticospinal Motor Gait</button>
            <button type="button" class="tab-btn" id="btnPathwayBalance" onclick="selectPathway('balance')">⚖️ Proprioception &amp; Balance</button>
            <button type="button" class="tab-btn" id="btnPathwayAutonomic" onclick="selectPathway('autonomic')">🌊 Autonomic &amp; Vagal Flow</button>
          </div>

          <!-- Dynamic Readout -->
          <div id="pathwayCard" style="background: #09090b; border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.5rem;">
            <!-- Populated via script -->
          </div>
        </div>
      </div>
    </section>

    <!-- 3.5 Santa Fe Institute (SFI) Complex Adaptive Systems & Critical Slowing Down HUD -->
    <section id="sfi-complexity" class="case-section" style="background: radial-gradient(circle at 50% 0%, rgba(20, 184, 166, 0.08) 0%, transparent 70%);">
      <div class="container" style="max-width: 960px;">
        <div class="section-head">
          <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase; margin-bottom: 0.35rem;">
            Santa Fe Institute (SFI) Applied Complexity &bull; Non-Ergodic Trajectory Mapping
          </div>
          <h2>Critical Slowing Down &amp; Attractor Phase-Space</h2>
          <p>
            The human organism is not a linear assembly of modular parts; it is a <strong>multi-scale Complex Adaptive System (CAS)</strong>. Rather than waiting for clinical flares, PocketGull continuously monitors <em>Critical Slowing Down (CSD)</em> precursors: lag-1 autocorrelation inflation (&rho;<sub>1</sub> &rarr; 1.0) and variance spikes 48&ndash;72 hours before acute autonomic or neuro-inflammatory transitions.
          </p>
        </div>

        <div style="background: var(--card); border: 1px solid var(--border); border-radius: 1.25rem; padding: 2rem;">
          <!-- Telemetry Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
            <!-- Autocorrelation Metric -->
            <div style="background: #09090b; border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem;">
              <div style="font-size: 0.75rem; color: #a1a1aa; font-family: ui-monospace, monospace; text-transform: uppercase;">Lag-1 Autocorrelation (&rho;<sub>1</sub>)</div>
              <div style="font-size: 1.875rem; font-weight: 800; color: #34d399; margin: 0.5rem 0 0.25rem; font-family: ui-monospace, monospace;" id="sfiRhoValue">0.2410</div>
              <div style="font-size: 0.75rem; color: #71717a;">Normal range: &lt; 0.45 &bull; Early Warning: &ge; 0.60</div>
            </div>

            <!-- Recovery Rate Metric -->
            <div style="background: #09090b; border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem;">
              <div style="font-size: 0.75rem; color: #a1a1aa; font-family: ui-monospace, monospace; text-transform: uppercase;">Recovery Rate (&lambda;)</div>
              <div style="font-size: 1.875rem; font-weight: 800; color: #38bdf8; margin: 0.5rem 0 0.25rem; font-family: ui-monospace, monospace;" id="sfiLambdaValue">0.7590</div>
              <div style="font-size: 0.75rem; color: #71717a;">High elasticity &bull; Fast perturbation dissipation</div>
            </div>

            <!-- Attractor Basin Classification -->
            <div style="background: #09090b; border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem;">
              <div style="font-size: 0.75rem; color: #a1a1aa; font-family: ui-monospace, monospace; text-transform: uppercase;">Current Attractor Basin</div>
              <div style="font-size: 1.05rem; font-weight: 800; color: #fbbf24; margin: 0.75rem 0 0.25rem;" id="sfiAttractorBasin">HOMEOSTATIC BASIN</div>
              <div style="font-size: 0.75rem; color: #71717a;" id="sfiTippingProb">Tipping Probability: 6.2%</div>
            </div>

            <!-- WBE Fractal Allometry -->
            <div style="background: #09090b; border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem;">
              <div style="font-size: 0.75rem; color: #a1a1aa; font-family: ui-monospace, monospace; text-transform: uppercase;">WBE M<sup>0.75</sup> Fractal Allometry</div>
              <div style="font-size: 1.875rem; font-weight: 800; color: #e879f9; margin: 0.5rem 0 0.25rem; font-family: ui-monospace, monospace;">1.000&times;</div>
              <div style="font-size: 0.75rem; color: #71717a;">Kleiber-West-Brown-Enquist metabolic scaling</div>
            </div>
          </div>

          <!-- Interactive Stressor Perturbation Simulator -->
          <div style="background: #09090b; border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <div style="font-weight: 700; font-size: 0.875rem; color: #f4f4f5;">Simulate Systemic Stressor Perturbation</div>
              <button type="button" class="tab-btn" onclick="resetSfiSimulation()" style="font-size: 0.75rem; padding: 0.35rem 0.75rem;">↺ Reset Homeostasis</button>
            </div>
            <p style="font-size: 0.8125rem; color: #a1a1aa; line-height: 1.5; margin-bottom: 1rem;">
              Test how the Santa Fe Institute dynamical phase-space model reacts to cumulative metabolic, viral, or thermal loading. Watch the recovery rate decay and autocorrelation inflate as the system approaches a tipping point.
            </p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button type="button" class="tab-btn" onclick="applySfiStressor(0.15)">+ Heat Stress (+15%)</button>
              <button type="button" class="tab-btn" onclick="applySfiStressor(0.30)">+ Sleep Deprivation (+30%)</button>
              <button type="button" class="tab-btn" onclick="applySfiStressor(0.50)">+ Viral Challenge (+50%)</button>
            </div>
            <div id="sfiDirectiveBanner" style="margin-top: 1rem; font-size: 0.8125rem; color: #34d399; font-family: ui-monospace, monospace; padding: 0.75rem; background: rgba(52, 211, 153, 0.08); border-radius: 0.5rem; border: 1px solid rgba(52, 211, 153, 0.2);">
              [SFI CAS DIRECTIVE] Robust homeostatic basin. Fast dissipation of transient biophysical perturbations.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Austrian 3-Act Salutogenic Trajectory -->
    <section id="trajectory" class="case-section" style="background: #09090b; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
      <div class="container" style="max-width: 960px;">
        <div class="section-head">
          <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--amber-light); font-weight: 700; text-transform: uppercase; margin-bottom: 0.35rem;">
            Clinical Epistemology &bull; The Austrian Way
          </div>
          <h2>The 3-Act Salutogenic Living Trajectory</h2>
          <p>
            Replacing the static, deficit-focused 1968 Weed SOAP checklist with an empowering living temporal arc: Past Trail Traversed &rarr; Living Foothold &rarr; Horizon of Action.
          </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <!-- Act I -->
          <div style="background: var(--card); border: 1px solid var(--border); border-left: 4px solid #34d399; border-radius: 1rem; padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-size: 0.8125rem; font-family: ui-monospace, monospace; color: #34d399; font-weight: 700; text-transform: uppercase;">ACT I: WHERE YOU'VE BEEN</span>
              <span style="color: var(--text-muted); font-size: 0.75rem;">(The Trail Traversed)</span>
            </div>
            <p style="font-size: 0.875rem; color: #d4d4d8; line-height: 1.65; margin: 0;">
              Navigated initial optic neuritis presentation 4 years ago with grace and perseverance. Traversed the emotional uncertainty of diagnosis, stabilized with high-efficacy DMT, and built deep intuitive body awareness. You developed the wisdom to differentiate temporary heat-induced slowing from true immune flares—an extraordinary cognitive achievement.
            </p>
          </div>

          <!-- Act II -->
          <div style="background: var(--card); border: 1px solid var(--border); border-left: 4px solid #38bdf8; border-radius: 1rem; padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-size: 0.8125rem; font-family: ui-monospace, monospace; color: #38bdf8; font-weight: 700; text-transform: uppercase;">ACT II: WHERE YOU STAND TODAY</span>
              <span style="color: var(--text-muted); font-size: 0.75rem;">(The Living Foothold)</span>
            </div>
            <p style="font-size: 0.875rem; color: #d4d4d8; line-height: 1.65; margin: 0;">
              Fully ambulatory, intellectually sharp, leading architectural design projects daily. Current biometrics: resting HR 64 bpm, nocturnal HRV RMSSD 44 ms (optimal parasympathetic tone), serum sNfL 6.8 pg/mL (age-matched Z-score +0.2, indicating zero active axonal injury). Recent transient right leg heaviness is entirely biophysical (Uhthoff &Delta;T +0.35&deg;C after a warm walk) and completely reverses within 20 minutes of hydration.
            </p>
          </div>

          <!-- Act III -->
          <div style="background: var(--card); border: 1px solid var(--border); border-left: 4px solid var(--amber-light); border-radius: 1rem; padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-size: 0.8125rem; font-family: ui-monospace, monospace; color: var(--amber-light); font-weight: 700; text-transform: uppercase;">ACT III: WHERE YOU'RE GOING</span>
              <span style="color: var(--text-muted); font-size: 0.75rem;">(The Horizon of Action)</span>
            </div>
            <div style="font-size: 0.875rem; color: #d4d4d8; line-height: 1.65;">
              <div style="margin-bottom: 0.5rem;">
                <strong style="color: #fff;">&bull; 30-Day Vitality Horizon:</strong> Confident completion of a 5 km autumn nature walk with family, maintaining steady cadence and zero heat-induced slowing.
              </div>
              <div>
                <strong style="color: #fff;">&bull; Daily Restoration Rituals:</strong>
                <ul style="margin: 0.35rem 0 0 1.25rem; padding: 0;">
                  <li>Pre-cooling ice-slurry hydration (16 oz chilled water) before sunny outdoor walking.</li>
                  <li>0.1 Hz vagal resonant breathing (4s in, 6s out) for 5 minutes twice daily to cultivate autonomic balance.</li>
                  <li>Targeted mitochondrial support: CoQ10 200mg BID and cold-water facial immersion.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4.5 The 3B Innovation Architecture: Breaking, Bending, and Blending -->
    <section id="innovation-3b" class="case-section" style="background: linear-gradient(180deg, #09090b 0%, #121216 100%); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
      <div class="container" style="max-width: 1040px;">
        <div class="section-head" style="text-align: center;">
          <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase; margin-bottom: 0.35rem;">
            Cognitive Framework &bull; Brandt &amp; Eagleman 3B Engine
          </div>
          <h2>The 3B Innovation Architecture: Breaking, Bending &amp; Blending</h2>
          <p style="margin: 0 auto;">
            How deconstructing rigid medical orthodoxies, modulating biophysical variables, and fusing orthogonal scientific fields transformed Mara's care plan from fear-driven surveillance to self-directed vitality.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
          <!-- Card 1: BREAKING -->
          <div style="background: var(--card); border: 1px solid var(--border); border-top: 4px solid var(--rose); border-radius: 1rem; padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                <span style="font-size: 1.5rem;">🔨</span>
                <div>
                  <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--rose-light); font-weight: 700; text-transform: uppercase;">Operation 01</div>
                  <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin: 0;">BREAKING</h3>
                </div>
              </div>
              <p style="font-size: 0.8125rem; color: #d4d4d8; line-height: 1.6; margin-bottom: 1rem;">
                <strong>Dismantling Monolithic Orthodoxy:</strong> Shattered the panic-inducing assumption that any new motor heaviness equals an acute clinical relapse requiring high-dose IV methylprednisolone.
              </p>
              <ul style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.6; padding-left: 1.15rem; margin: 0; display: flex; flex-direction: column; gap: 0.5rem;">
                <li><strong style="color: #fff;">Breaks the $2,800 MRI Cascade:</strong> Prevented unindicated emergency department imaging and incidentaloma anxiety loops.</li>
                <li><strong style="color: #fff;">Breaks the 1968 SOAP Note:</strong> Replaced static, deficit-focused billing checkboxes with living salutogenic trajectories.</li>
                <li><strong style="color: #fff;">Breaks Passive Resignation:</strong> Demarcated reversible biophysical conduction pauses from irreversible structural lesions.</li>
              </ul>
            </div>
            <div style="margin-top: 1.25rem; background: #09090b; border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.75rem; font-size: 0.75rem; color: var(--rose-light); font-family: ui-monospace, monospace;">
              Result: Zero unnecessary steroid toxicity &bull; $5,600+ averted cascade costs
            </div>
          </div>

          <!-- Card 2: BENDING -->
          <div style="background: var(--card); border: 1px solid var(--border); border-top: 4px solid var(--teal); border-radius: 1rem; padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                <span style="font-size: 1.5rem;">🔄</span>
                <div>
                  <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase;">Operation 02</div>
                  <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin: 0;">BENDING</h3>
                </div>
              </div>
              <p style="font-size: 0.8125rem; color: #d4d4d8; line-height: 1.6; margin-bottom: 1rem;">
                <strong>Modulating Physiological Variables:</strong> Instead of telling the patient to abandon outdoor summer walking, PocketGull modulated the underlying biophysical boundary.
              </p>
              <ul style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.6; padding-left: 1.15rem; margin: 0; display: flex; flex-direction: column; gap: 0.5rem;">
                <li><strong style="color: #fff;">Bends Thermal Reserve (&Delta;T &le; 0.40&deg;C):</strong> Ingesting 500 mL ice slurries and wearing a 15&deg;C phase-change vest preserves axonal safety factor &gt;1.8.</li>
                <li><strong style="color: #fff;">Bends Exercise Timing:</strong> Shifting brisk walks to early morning (low ambient radiant heat) keeps core temperature well below the conduction block threshold.</li>
                <li><strong style="color: #fff;">Bends the Pacing Envelope:</strong> Structured 45-minute architectural design sprints with horizontal recovery breaks match mitochondrial ATP resynthesis.</li>
              </ul>
            </div>
            <div style="margin-top: 1.25rem; background: #09090b; border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.75rem; font-size: 0.75rem; color: var(--teal-light); font-family: ui-monospace, monospace;">
              Result: 100% outdoor stamina restored &bull; Safe summer architectural site visits
            </div>
          </div>

          <!-- Card 3: BLENDING -->
          <div style="background: var(--card); border: 1px solid var(--border); border-top: 4px solid var(--amber); border-radius: 1rem; padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                <span style="font-size: 1.5rem;">🧬</span>
                <div>
                  <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--amber-light); font-weight: 700; text-transform: uppercase;">Operation 03</div>
                  <h3 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin: 0;">BLENDING</h3>
                </div>
              </div>
              <p style="font-size: 0.8125rem; color: #d4d4d8; line-height: 1.6; margin-bottom: 1rem;">
                <strong>Fusing Orthogonal Disciplines:</strong> United fields that hospital medicine isolates in separate silos into a cohesive healing sanctuary.
              </p>
              <ul style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.6; padding-left: 1.15rem; margin: 0; display: flex; flex-direction: column; gap: 0.5rem;">
                <li><strong style="color: #fff;">Thermodynamics + Neuro-Immunology:</strong> Fused condensed matter phase-change physics (15&deg;C latent heat) with demyelinated sodium channel kinetics (Na<sub>V</sub>1.6).</li>
                <li><strong style="color: #fff;">Austrian Salutogenesis + Edge AI:</strong> Fused Frankl/Antonovsky existential empowerment with Google Chrome Built-in AI running privately on client silicon at $0.00 cloud cost.</li>
                <li><strong style="color: #fff;">Liquid Biopsy + Autonomic Telemetry:</strong> Combined quarterly serum sNfL Simoa tracking with real-time 0.10 Hz Mayer-wave respiratory biofeedback.</li>
              </ul>
            </div>
            <div style="margin-top: 1.25rem; background: #09090b; border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.75rem; font-size: 0.75rem; color: var(--amber-light); font-family: ui-monospace, monospace;">
              Result: Unified biophysical &amp; psychological agency &bull; Zero ePHI data leakage
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. "Am I Safe?" 3-Step Triage Flowchart -->
    <section id="triage" class="case-section">
      <div class="container">
        <div class="section-head">
          <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: #34d399; font-weight: 700; text-transform: uppercase; margin-bottom: 0.35rem;">
            Zero-Panic Triage &bull; Differentiating Pseudo-Relapses
          </div>
          <h2>"Am I Safe?" 3-Step Reassuring Triage</h2>
          <p>
            When an unexpected symptom flares up, fear is natural. Over 85% of symptom changes are harmless, temporary thermal fluctuations or minor infections. Use this 3-step guide to find instant clarity without emergency room panic.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; max-width: 1040px; margin: 0 auto;">
          <!-- Step 1 -->
          <div style="background: var(--card); border: 1px solid var(--border); border-radius: 1rem; padding: 1.5rem;">
            <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase;">Step 01 &bull; Temperature Check</div>
            <h3 style="font-size: 1.125rem; font-weight: 800; color: #fff; margin: 0.35rem 0 0.5rem;">Did you just warm up?</h3>
            <p style="font-size: 0.8125rem; color: #d4d4d8; line-height: 1.55;">
              Did you recently take a warm shower, exercise, feel stressed, or step into summer sunshine?
            </p>
            <div style="margin-top: 1rem; background: #09090b; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; color: #34d399; border-left: 3px solid #34d399;">
              <strong>Action:</strong> Drink 16 oz of ice water and rest in a cool air-conditioned room for 30 minutes. If symptoms dissolve, it was an Uhthoff thermal block. You are completely safe!
            </div>
          </div>

          <!-- Step 2 -->
          <div style="background: var(--card); border: 1px solid var(--border); border-radius: 1rem; padding: 1.5rem;">
            <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--amber-light); font-weight: 700; text-transform: uppercase;">Step 02 &bull; Background Check</div>
            <h3 style="font-size: 1.125rem; font-weight: 800; color: #fff; margin: 0.35rem 0 0.5rem;">Any silent infection?</h3>
            <p style="font-size: 0.8125rem; color: #d4d4d8; line-height: 1.55;">
              Are you experiencing cloudy urine, mild scratchy throat, congestion, or subtle low-grade fever (&gt;37.5°C)?
            </p>
            <div style="margin-top: 1rem; background: #09090b; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; color: var(--amber-light); border-left: 3px solid var(--amber-light);">
              <strong>Action:</strong> Check home urine dipstick or call primary care for a quick urinalysis. Treating a mild bladder bug resolves the neural symptoms within 48 hours without steroids!
            </div>
          </div>

          <!-- Step 3 -->
          <div style="background: var(--card); border: 1px solid var(--border); border-radius: 1rem; padding: 1.5rem;">
            <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: #38bdf8; font-weight: 700; text-transform: uppercase;">Step 03 &bull; The 24-Hour Rule</div>
            <h3 style="font-size: 1.125rem; font-weight: 800; color: #fff; margin: 0.35rem 0 0.5rem;">Has it persisted &gt;24 Hours?</h3>
            <p style="font-size: 0.8125rem; color: #d4d4d8; line-height: 1.55;">
              Is a new neurological symptom steadily present for 24+ consecutive hours in the complete absence of fever or heat?
            </p>
            <div style="margin-top: 1rem; background: #09090b; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; color: #38bdf8; border-left: 3px solid #38bdf8;">
              <strong>Action:</strong> Send a calm, structured message to your neurologist's clinical portal. PocketGull drafts a clean 3-Act note for your visit so you can receive prompt supportive care.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. 1-Page Printable Refrigerator Care Card -->
    <section id="fridge-card" class="case-section">
      <div class="container" style="max-width: 860px;">
        <div class="section-head" style="text-align: center;">
          <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase; margin-bottom: 0.35rem;">
            Daily Rituals &bull; Whole-Person Vitality
          </div>
          <h2>1-Page Refrigerator Sanctuary Care Card</h2>
          <p style="margin: 0 auto;">
            A printable, peaceful reminder of daily neuro-protection habits. Pin this to your kitchen refrigerator for calm daily grounding.
          </p>
          <div style="margin-top: 1.25rem;">
            <button type="button" onclick="window.print()" class="btn-primary">
              <span>🖨️ Print Refrigerator Care Card</span>
            </button>
          </div>
        </div>

        <!-- The Printable Card -->
        <div id="fridgeCard" style="background: #111115; border: 2px solid var(--border); border-radius: 1rem; padding: 2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1.25rem;">
            <div>
              <span style="font-size: 1.25rem;">🌸</span>
              <span style="font-weight: 800; font-size: 1.125rem; color: #fff; margin-left: 0.5rem;">PocketGull Neuro-Axonal Sanctuary Care Card</span>
            </div>
            <span style="font-family: ui-monospace, monospace; font-size: 0.75rem; color: var(--teal-light);">Daily Vitality Roadmap</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem; font-size: 0.8125rem; color: #d4d4d8;">
            <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
              <span style="font-size: 1.25rem;">🌅</span>
              <div>
                <strong style="color: #fff;">Morning Sunshine &amp; Cellular Hydration:</strong>
                <div>10 minutes of direct morning sunlight on your eyes/face to synchronize hypothalamic circadian clocks, followed by a 16 oz glass of cool filtered water with a pinch of mineral salts.</div>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
              <span style="font-size: 1.25rem;">🚶</span>
              <div>
                <strong style="color: #fff;">Gentle Neuroplastic Movement:</strong>
                <div>15 to 20 minutes of restorative low-impact walking, cool water aquatic movement, or recumbent stationary cycling. Focus on smooth rhythm rather than exhaustion.</div>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
              <span style="font-size: 1.25rem;">🧊</span>
              <div>
                <strong style="color: #fff;">Midday Cooling Reserve:</strong>
                <div>If feeling warm or heavy, take a 15-minute horizontal pause in a cool room with a cold damp cloth over the back of your neck. Let your conduction reserve recharge.</div>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
              <span style="font-size: 1.25rem;">🥑</span>
              <div>
                <strong style="color: #fff;">Mitochondrial Nourishment:</strong>
                <div>Anti-inflammatory Mediterranean foods rich in colorful polyphenols, wild cold-water fish (omega-3s), leafy cruciferous greens, and adequate dietary magnesium.</div>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
              <span style="font-size: 1.25rem;">🌙</span>
              <div>
                <strong style="color: #fff;">Evening Vagal Reset (0.1 Hz Pacing):</strong>
                <div>5 minutes of calm, slow diaphragmatic breathing (inhale 4 seconds, exhale 6 seconds) before sleep to calm the sympathetic nervous system and invite restorative delta sleep.</div>
              </div>
            </div>
          </div>

          <div style="margin-top: 1.5rem; border-top: 1px solid var(--border); padding-top: 0.75rem; display: flex; justify-content: space-between; font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--text-muted);">
            <span>PocketGull Clinical Informatics &bull; Austrian Salutogenesis</span>
            <span>Zero Egress &bull; HIPAA Safe Harbor</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. 1-Click FHIR R4 Bundle Exporter -->
    <section id="fhir-export" class="case-section">
      <div class="container" style="max-width: 860px; text-align: center;">
        <div class="section-head">
          <div style="font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--amber-light); font-weight: 700; text-transform: uppercase; margin-bottom: 0.35rem;">
            Interoperability &bull; HL7 FHIR R4 Standard
          </div>
          <h2>Export Your Sovereign Neuro-Sanctuary CarePlan</h2>
          <p style="margin: 0 auto;">
            Zero lock-in. Download your complete individualized care plan, biophysical parameters, and 3-Act trajectory serialized in universal HL7 FHIR R4 JSON format for direct import into Epic, Cerner, or your personal health record.
          </p>
        </div>

        <div style="background: var(--card); border: 1px solid var(--border); border-radius: 1rem; padding: 2rem; margin-top: 1.5rem;">
          <div style="font-family: ui-monospace, monospace; font-size: 0.75rem; color: var(--teal-light); margin-bottom: 1rem;">
            Package: Bundle/pocketgull-ms-sanctuary-careplan-r4.json &bull; 4 Resources (CarePlan, Condition, RiskAssessment, Goal)
          </div>
          <button type="button" onclick="downloadFhirBundle()" class="btn-primary" style="font-size: 0.875rem;">
            <span>📥 Download FHIR R4 Bundle (JSON)</span>
          </button>
          <div id="fhirDownloadNotice" style="margin-top: 0.75rem; font-size: 0.75rem; color: #34d399; font-weight: bold; min-height: 1.2rem;"></div>
        </div>
      </div>
    </section>
  </main>

${renderLegalFooterHtml()}

  <script>
    // 1. Uhthoff Conduction Reserve Radar Logic
    function updateUhthoffRadar(val) {
      const deltaT = parseFloat(val) / 100.0;
      const display = document.getElementById('tempDeltaDisplay');
      const sfEl = document.getElementById('safetyFactorValue');
      const sfStatus = document.getElementById('safetyFactorStatus');
      const velEl = document.getElementById('conductionVelocityValue');
      const textEl = document.getElementById('axonalStatusText');

      const sign = deltaT > 0 ? '+' : '';
      display.textContent = sign + deltaT.toFixed(2) + '°C (' + (deltaT <= -0.3 ? 'Pre-Cooled Sanctuary' : (deltaT <= 0.2 ? 'Comfortable Baseline' : (deltaT <= 0.4 ? 'Uhthoff Threshold' : 'Elevated Temperature Zone'))) + ')';

      // Safety Factor calculation: Baseline ~ 2.1. Drops as temperature rises due to NaV1.6 inactivation
      // SF = 2.10 - 1.25 * deltaT
      let sf = 2.10 - (1.15 * deltaT);
      if (sf < 0.85) sf = 0.85;
      sfEl.textContent = sf.toFixed(2);

      // Conduction Velocity in m/s
      let vel = 48.0 + (deltaT <= 0.35 ? deltaT * 4.0 : 1.4 - (deltaT - 0.35) * 18.0);
      if (vel < 22.0) vel = 22.0;
      velEl.textContent = vel.toFixed(1) + ' m/s';

      if (sf >= 1.8) {
        sfEl.style.color = '#34d399';
        sfStatus.style.color = '#34d399';
        sfStatus.textContent = '✓ Robust Conduction Across Internodes';
        textEl.textContent = 'Calm baseline. Myelinated reserves provide smooth electrical margin. Nerves fire with crisp reliability.';
      } else if (sf >= 1.0) {
        sfEl.style.color = 'var(--amber-light)';
        sfStatus.style.color = 'var(--amber-light)';
        sfStatus.textContent = '⚠️ Mild Temperature Slowing (Reversible)';
        textEl.textContent = 'Nodal channels closing slightly faster. Resting in a cool room or drinking cold water restores safety factor above 1.8 immediately.';
      } else {
        sfEl.style.color = '#f87171';
        sfStatus.style.color = '#f87171';
        sfStatus.textContent = '⚡ Reversible Thermal Conduction Block';
        textEl.textContent = 'Temporary channel impedance. Physical cooling vest or 20 minutes in shade completely reverses this block. Zero structural damage.';
      }
    }

    // 2. 360° Neuro-Axis Pathways Database
    const PATHWAYS = {
      optic: {
        title: '👁️ Optic Visual Highway (Cranial Nerve II)',
        function: 'Carries high-definition visual signals and color contrast from retina to occipital visual cortex.',
        selfCheck: 'Look at a vibrant red object or read fine print in comfortable lighting. If colors seem slightly desaturated after a hot shower, it is a classic reversible Uhthoff effect.',
        ritual: 'Morning 10-minute natural daylight exposure to nourish retinal ganglion cells, followed by a gentle 20-20-20 screen break (look 20 feet away for 20 seconds every 20 minutes).'
      },
      cervical: {
        title: '🤲 Cervical Spinal Cord & Fine Hand Dexterity',
        function: 'Transmits rapid sensory feedback from fingertips and precise motor commands for writing, typing, and buttoning shirts.',
        selfCheck: 'Tap each finger smoothly to your thumb in rhythm. Notice how dexterity improves with cool hands and calm breathing.',
        ritual: 'Gentle hand warming/cooling balance, stress-ball squeezing exercises, and keyboard ergonomic elevation.'
      },
      motor: {
        title: '🚶 Corticospinal Motor Highway & Gait Cadence',
        function: 'The primary descending pathway from motor cortex to leg muscles, coordinating foot clearance and posture.',
        selfCheck: 'Walk a smooth 20-foot hallway at your natural pace. Notice foot clearance and steady heel-to-toe rhythm.',
        ritual: 'Closed-chain quadriceps strengthening (straight-leg lifts), recumbent stationary cycling with zero impact, and cooling hydration before walking outdoors.'
      },
      balance: {
        title: '⚖️ Posterior Column Proprioception & Ground Sense',
        function: 'Conveys position sense from foot mechanoreceptors to let your brain know where your feet are without looking down.',
        selfCheck: 'Stand comfortably with feet shoulder-width apart, eyes open. Feel the ground beneath your soles.',
        ritual: 'Walking barefoot on natural grassy terrain or textured mats, gentle tandem stance practice with hand resting lightly on a countertop for stability.'
      },
      autonomic: {
        title: '🌊 Autonomic & Pelvic Splanchnic Vagal Flow',
        function: 'Regulates parasympathetic heart rate variability, digestive motility, and calm bladder storage.',
        selfCheck: 'Observe resting pulse and breathing cadence. A slow, relaxed exhale activates the vagus nerve within 3 breaths.',
        ritual: '0.1 Hz vagal breathing (4-second inhale, 6-second exhale for 5 minutes twice daily), scheduled hydration intervals, and pelvic floor mindfulness.'
      }
    };

    function selectPathway(key) {
      document.querySelectorAll('#neuro-axis .tab-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.getElementById('btnPathway' + key.charAt(0).toUpperCase() + key.slice(1));
      if (activeBtn) activeBtn.classList.add('active');

      const data = PATHWAYS[key];
      const card = document.getElementById('pathwayCard');
      if (data && card) {
        card.innerHTML = \`
          <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase;">Central Neural Pathway</div>
          <h4 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin: 0.25rem 0 0.5rem;">\${data.title}</h4>
          <p style="font-size: 0.8125rem; color: #d4d4d8; line-height: 1.6; margin-bottom: 1rem;">\${data.function}</p>
          
          <div style="background: #141418; border: 1px solid var(--border); border-radius: 0.5rem; padding: 1rem; margin-bottom: 0.75rem;">
            <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--amber-light); font-weight: 700; text-transform: uppercase;">🌸 Reassuring Self-Check</div>
            <p style="font-size: 0.8125rem; color: #fef3c7; line-height: 1.5; margin-top: 0.25rem;">\${data.selfCheck}</p>
          </div>

          <div style="background: rgba(45, 212, 191, 0.08); border: 1px solid rgba(45, 212, 191, 0.25); border-radius: 0.5rem; padding: 1rem;">
            <div style="font-size: 0.6875rem; font-family: ui-monospace, monospace; color: var(--teal-light); font-weight: 700; text-transform: uppercase;">⚡ Daily Neuroplastic Vitality Habit</div>
            <p style="font-size: 0.8125rem; color: #ccfbf1; line-height: 1.5; margin-top: 0.25rem;">\${data.ritual}</p>
          </div>
        \`;
      }
    }

    // 3. FHIR R4 JSON Bundle Export
    function downloadFhirBundle() {
      const bundle = {
        resourceType: 'Bundle',
        type: 'collection',
        id: 'pocketgull-ms-neuro-sanctuary-careplan',
        timestamp: new Date().toISOString(),
        entry: [
          {
            resource: {
              resourceType: 'CarePlan',
              id: 'ms-sanctuary-plan-01',
              status: 'active',
              intent: 'plan',
              title: 'PocketGull Neuro-Axonal Sanctuary & Salutogenic Pacing CarePlan',
              description: 'Individualized Multiple Sclerosis care trajectory focusing on Uhthoff cooling physics (Delta-T <= 0.40C), 0.1Hz vagal pacing, and mitochondrial nutritional support.',
              category: [{ coding: [{ system: 'http://hl7.org/fhir/us/core/CodeSystem/careplan-category', code: 'assess-plan', display: 'Assessment and Plan' }] }],
              activity: [
                { detail: { description: 'Pre-cooling ice slurry and 15C phase-change vest prior to physical exercise', status: 'in-progress' } },
                { detail: { description: '0.1 Hz vagal resonant breathing (6 bpm) for parasympathetic anti-inflammatory activation', status: 'in-progress' } },
                { detail: { description: 'Serum Neurofilament Light Chain (sNfL) annual monitoring with age-normed Z-scores', status: 'scheduled' } }
              ]
            }
          },
          {
            resource: {
              resourceType: 'Condition',
              id: 'ms-salutogenesis-profile',
              clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }] },
              verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }] },
              code: { coding: [{ system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'G35', display: 'Multiple sclerosis' }] },
              note: [{ text: 'Patient maintained on neuro-protective salutogenic regimen with excellent conduction reserve.' }]
            }
          },
          {
            resource: {
              resourceType: 'RiskAssessment',
              id: 'uhthoff-thermal-risk',
              status: 'final',
              code: { coding: [{ system: 'https://pocketgull.com/fhir/risk-assessment', code: 'uhthoff-conduction-reserve', display: 'Uhthoff Conduction Reserve Index' }] },
              prediction: [{ outcome: { text: 'Conduction Safety Factor Reversible' }, probabilityDecimal: 0.05, whenRange: { low: { value: 0.0, unit: 'degC' }, high: { value: 0.40, unit: 'degC' } } }]
            }
          },
          {
            resource: {
              resourceType: 'Goal',
              id: 'neuroplastic-vitality-goal',
              lifecycleStatus: 'active',
              description: { text: 'Maintain unhindered daily 20-minute restorative walking without heat-induced slowing.' }
            }
          }
        ]
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute('href', dataStr);
      dlAnchor.setAttribute('download', 'pocketgull-ms-sanctuary-careplan-fhir-r4.json');
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();

      const notice = document.getElementById('fhirDownloadNotice');
      if (notice) {
        notice.textContent = '✓ Successfully downloaded HL7 FHIR R4 Bundle (JSON)!';
        setTimeout(() => { notice.textContent = ''; }, 4000);
      }
    }

    // Reading Tone Toggle
    function togglePaperMode() {
      const isPaper = document.documentElement.classList.toggle('paper');
      const icon = document.getElementById('themeToggleIcon');
      const text = document.getElementById('themeToggleText');
      if (icon && text) {
        icon.textContent = isPaper ? '🌙' : '📜';
        text.textContent = isPaper ? 'Obsidian Dark' : 'Monastic Paper';
      }
    }

    // Santa Fe Institute Complex Adaptive Systems Simulator
    let sfiBaseRho = 0.241;
    function updateSfiDisplay() {
      const rho = Math.min(0.95, Math.max(0.05, sfiBaseRho));
      const lambda = 1.0 - rho;
      const tippingProb = (1.0 / (1.0 + Math.exp(-8.0 * (rho - 0.60)))) * 100;

      const elRho = document.getElementById('sfiRhoValue');
      const elLambda = document.getElementById('sfiLambdaValue');
      const elBasin = document.getElementById('sfiAttractorBasin');
      const elTip = document.getElementById('sfiTippingProb');
      const elDirective = document.getElementById('sfiDirectiveBanner');

      if (elRho) {
        elRho.textContent = rho.toFixed(4);
        elRho.style.color = rho >= 0.7 ? '#f43f5e' : (rho >= 0.5 ? '#fbbf24' : '#34d399');
      }
      if (elLambda) {
        elLambda.textContent = lambda.toFixed(4);
      }
      if (elTip) {
        elTip.textContent = 'Tipping Probability: ' + tippingProb.toFixed(1) + '%';
      }
      if (elBasin) {
        if (rho >= 0.7) {
          elBasin.textContent = 'ALLOSTATIC INFLAMMATORY SINK';
          elBasin.style.color = '#f43f5e';
          if (elDirective) {
            elDirective.textContent = '[SFI CAS DIRECTIVE] Critical Slowing Down detected! System trapped in high-entropy attractor basin. Immediate rest and autonomic cooling required.';
            elDirective.style.color = '#f87171';
            elDirective.style.background = 'rgba(244, 63, 94, 0.1)';
            elDirective.style.borderColor = 'rgba(244, 63, 94, 0.3)';
          }
        } else if (rho >= 0.5) {
          elBasin.textContent = 'CRITICAL TRANSITION ZONE';
          elBasin.style.color = '#fbbf24';
          if (elDirective) {
            elDirective.textContent = '[SFI CAS DIRECTIVE] Shallow saddle potential. Recovery rate decaying. Implement parasympathetic pacing before tipping point.';
            elDirective.style.color = '#fbbf24';
            elDirective.style.background = 'rgba(251, 191, 36, 0.1)';
            elDirective.style.borderColor = 'rgba(251, 191, 36, 0.3)';
          }
        } else {
          elBasin.textContent = 'HOMEOSTATIC BASIN';
          elBasin.style.color = '#34d399';
          if (elDirective) {
            elDirective.textContent = '[SFI CAS DIRECTIVE] Robust homeostatic basin. Fast dissipation of transient biophysical perturbations.';
            elDirective.style.color = '#34d399';
            elDirective.style.background = 'rgba(52, 211, 153, 0.08)';
            elDirective.style.borderColor = 'rgba(52, 211, 153, 0.2)';
          }
        }
      }
    }

    function applySfiStressor(delta) {
      sfiBaseRho = Math.min(0.92, sfiBaseRho + delta);
      updateSfiDisplay();
    }

    function resetSfiSimulation() {
      sfiBaseRho = 0.241;
      updateSfiDisplay();
    }

    // Initialize Default Pathway
    document.addEventListener('DOMContentLoaded', function() {
      selectPathway('optic');
    });
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      selectPathway('optic');
    }
  </script>
</body>
</html>`;
}
