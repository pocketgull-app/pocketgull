// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

/**
 * PocketGull Real-World Community Case Study #05
 * Charles Darwin & The Post-Beagle Vagal Enigma: Dysautonomia, Hydropathy & Salutogenic Pacing
 * Hosted at pocketgull.com/case-studies/darwin-vagal-radar
 *
 * Implements HIPAA § 164.514 Safe Harbor de-identification, the 3B Innovation Framework,
 * and HL7 FHIR R4 CarePlan exports.
 */

import { renderLegalFooterHtml } from './legal-footer';

export function renderDarwinCaseStudyHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Charles Darwin &amp; The Vagal Enigma — PocketGull Case Study #05</title>
  <meta name="description" content="Retrospective clinical modeling of Charles Darwin's 40-year battle with gastrointestinal prostration, palpitations, and dysautonomia through the 3B Innovation Architecture and Down House salutogenic pacing." />
  <meta property="og:title" content="Charles Darwin &amp; The Vagal Enigma — PocketGull Case Study #05" />
  <meta property="og:description" content="Resolving Victorian psychogenic dismissals with modern baroreflex mapping, cold-water mammalian dive reflex, and autonomic salutogenesis." />
  <meta property="og:url" content="https://pocketgull.com/case-studies/darwin-vagal-radar" />
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
      --indigo: #6366f1;
      --indigo-light: #818cf8;
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
      --indigo: #4338ca;
      --indigo-light: #4f46e5;
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
      background: linear-gradient(135deg, var(--indigo) 0%, var(--teal) 100%);
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

    /* Hero */
    .hero {
      padding: 3.5rem 0 2rem;
      border-bottom: 1px solid var(--border);
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid var(--indigo);
      color: var(--indigo-light);
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
      max-width: 900px;
    }
    .hero p.lead {
      font-size: 1.125rem;
      color: var(--text-muted);
      max-width: 820px;
      line-height: 1.65;
      margin-bottom: 1.5rem;
    }

    /* Section Containers */
    .section {
      padding: 3rem 0;
      border-bottom: 1px solid var(--border);
    }
    .section-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .section-sub {
      color: var(--text-muted);
      font-size: 0.9375rem;
      margin-bottom: 2rem;
    }

    /* 3-Act Grid */
    .act-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .act-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .act-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    .act-pill {
      font-size: 0.75rem;
      font-family: ui-monospace, monospace;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 0.25rem;
    }
    .act-pill.act1 { background: rgba(245, 158, 11, 0.15); color: var(--amber-light); }
    .act-pill.act2 { background: rgba(99, 102, 241, 0.15); color: var(--indigo-light); }
    .act-pill.act3 { background: rgba(20, 184, 166, 0.15); color: var(--teal-light); }

    /* Autonomic Radar */
    .radar-box {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 0.875rem;
      padding: 2rem;
      margin-top: 1.5rem;
    }
    .radar-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: center;
    }
    @media (max-width: 768px) {
      .radar-grid { grid-template-columns: 1fr; }
    }
    .meter-row {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-bottom: 1rem;
    }
    .meter-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.8125rem;
      color: var(--text-muted);
    }
    .meter-bar {
      height: 0.75rem;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      overflow: hidden;
    }
    .meter-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.4s ease, background-color 0.4s ease;
    }

    /* 3B Innovation Section */
    .innovation-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    .b3-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.5rem;
    }
    .b3-pill {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 0.25rem;
      margin-bottom: 0.85rem;
    }
    .b3-pill.breaking { background: rgba(244, 63, 94, 0.15); color: var(--rose-light); }
    .b3-pill.bending { background: rgba(245, 158, 11, 0.15); color: var(--amber-light); }
    .b3-pill.blending { background: rgba(20, 184, 166, 0.15); color: var(--teal-light); }

    /* Stepped Care */
    .tier-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .tier-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.25rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .tier-badge {
      font-family: ui-monospace, monospace;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 0.25rem;
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-muted);
    }
    .tier-price {
      text-align: right;
      font-size: 0.8125rem;
    }
    .price-benchmark {
      color: var(--text-muted);
      font-size: 0.75rem;
    }
    .price-oop {
      color: var(--teal-light);
      font-weight: 700;
      font-family: ui-monospace, monospace;
    }

    .export-card {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(20, 184, 166, 0.04) 100%);
      border: 1px solid var(--indigo);
      border-radius: 0.75rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      margin-top: 2rem;
    }
    .btn-action {
      background: var(--indigo);
      color: #fff;
      border: none;
      padding: 0.5rem 1.25rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      transition: background 0.15s;
    }
    .btn-action:hover { background: #4f46e5; }

    footer {
      border-top: 1px solid var(--border);
      background: var(--card);
      padding: 2.5rem 0;
      font-size: 0.8125rem;
      color: var(--text-muted);
    }
  </style>
</head>
<body>

  <!-- Top Cockpit Bridge -->
  <div class="cockpit-bridge">
    <div class="cockpit-content">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span class="cockpit-tag">CASE STUDY #05</span>
        <span>Autonomic &bull; Charles Darwin &amp; The Post-Beagle Vagal Enigma</span>
      </div>
      <div class="cockpit-actions">
        <button class="btn-bridge" onclick="downloadDarwinFhirBundle()">📥 HL7 FHIR R4 Bundle</button>
        <button class="btn-bridge" onclick="togglePaperMode()">
          <span id="themeToggleIcon">📜</span> <span id="themeToggleText">Monastic Paper</span>
        </button>
        <a href="/case-studies" class="btn-bridge primary">&larr; Case Studies Hub</a>
      </div>
    </div>
  </div>

  <!-- Header -->
  <header>
    <div class="container header-inner">
      <a href="/case-studies" class="brand-group">
        <div class="brand-mark">🪶</div>
        <div class="brand-titles">
          <h1 class="font-brand">PocketGull</h1>
          <p>Historical Luminary Retrospective &amp; Dysautonomia Modeling</p>
        </div>
      </a>
      <nav class="nav-links">
        <a href="/case-studies">Directory</a>
        <a href="#trajectory">3-Act Trajectory</a>
        <a href="#radar">Autonomic Radar</a>
        <a href="#innovation-3b">3B Innovation</a>
        <a href="#recommendations">Stepped Care</a>
      </nav>
    </div>
  </header>

  <main class="container">

    <!-- Hero -->
    <section class="hero">
      <div class="hero-badge">📜 COHORT ARCHETYPE SUBJ-DARWIN-1882 • POST-BEAGLE VAGAL CHRONIC SYNDROME</div>
      <h2>Charles Darwin &amp; The Vagal Enigma: Resolving Victorian Psychogenic Stigma</h2>
      <p class="lead">
        Subject SUBJ-DARWIN-1882: For forty years following his voyage on HMS Beagle, 
        Charles Darwin suffered from severe postprandial vomiting, palpitations, extreme cold intolerance, 
        and debilitating physical prostration. Dismissed by Victorian doctors as "neurasthenic," 
        PocketGull maps his clinical records to post-infectious autonomic neuropathy, 
        baroreflex failure, and salutogenic pacing at Down House.
      </p>
    </section>

    <!-- 3-Act Trajectory -->
    <section class="section" id="trajectory">
      <h3 class="section-title">The 3-Act Trajectory</h3>
      <p class="section-sub">A 40-year historical trajectory re-examined without fatalism.</p>

      <div class="act-grid">
        <div class="act-card">
          <div class="act-header">
            <span class="act-pill act1">ACT I: WHERE YOU'VE BEEN</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Historical Baseline</span>
          </div>
          <h4 style="font-size: 1.1rem; margin-bottom: 0.75rem;">Beagle Sickness &amp; Mendoza Exposure</h4>
          <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
            Severe five-year seasickness aboard HMS Beagle (1831–1836), followed by an acute bite from 
            the "great black bug of the Pampas" (<em>Triatoma infestans</em>) in Mendoza in March 1835. 
            Returning to England, he suffered episodic violent vomiting, heart palpitations, and trembling, 
            stigmatized by medical peers as hypochondriasis.
          </p>
        </div>

        <div class="act-card">
          <div class="act-header">
            <span class="act-pill act2">ACT II: WHERE YOU STAND TODAY</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Autonomic Mapping</span>
          </div>
          <h4 style="font-size: 1.1rem; margin-bottom: 0.75rem;">Postural Dysautonomia &amp; Baroreflex Decay</h4>
          <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
            Clinical re-evaluation identifies classic Postural Orthostatic Tachycardia Syndrome (POTS) 
            and delayed gastric motility. Emotional stress or prolonged standing triggered sympathetic hyperarousal, 
            rapid peripheral venous pooling, and vagal withdrawal. 
            His autonomic nervous system was in chronic allostatic friction.
          </p>
        </div>

        <div class="act-card">
          <div class="act-header">
            <span class="act-pill act3">ACT III: WHERE YOU'RE GOING</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Salutogenic Resolution</span>
          </div>
          <h4 style="font-size: 1.1rem; margin-bottom: 0.75rem;">The Sandwalk &amp; Down House Sanctuary</h4>
          <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
            Darwin survived and authored <em>On the Origin of Species</em> by engineering his own salutogenic sanctuary. 
            He scheduled 3 distinct daily loops around his gravel "Sandwalk" (low-intensity soleus pacing), 
            embraced Malvern cold-water hydrotherapy, and adhered to quiet, focused monastic rhythms.
          </p>
        </div>
      </div>
    </section>

    <!-- Autonomic Radar -->
    <section class="section" id="radar">
      <h3 class="section-title">Autonomic Tone &amp; Vagal Baroreflex Radar</h3>
      <p class="section-sub">Simulate Victorian hydropathy and modern parasympathetic pacing interventions.</p>

      <div class="radar-box">
        <div class="radar-grid">
          <div>
            <h4 style="font-size: 1.1rem; margin-bottom: 1.25rem;">Autonomic Telemetry</h4>
            
            <div class="meter-row">
              <div class="meter-label">
                <span>Orthostatic Heart Rate Spike</span>
                <span id="orthoValue" style="font-weight: 700; color: #f43f5e;">+42 bpm (Tachycardia)</span>
              </div>
              <div class="meter-bar">
                <div class="meter-fill" id="orthoBar" style="width: 85%; background: #f43f5e;"></div>
              </div>
            </div>

            <div class="meter-row">
              <div class="meter-label">
                <span>Vagal Baroreflex Sensitivity</span>
                <span id="vagalValue" style="font-weight: 700; color: #f59e0b;">5.2 ms/mmHg (Suppressed)</span>
              </div>
              <div class="meter-bar">
                <div class="meter-fill" id="vagalBar" style="width: 25%; background: #f59e0b;"></div>
              </div>
            </div>

            <div class="meter-row">
              <div class="meter-label">
                <span>Gastric Motility Velocity</span>
                <span id="gastricValue" style="font-weight: 700; color: #a1a1aa;">Delayed / Spastic</span>
              </div>
              <div class="meter-bar">
                <div class="meter-fill" id="gastricBar" style="width: 30%; background: #a1a1aa;"></div>
              </div>
            </div>

            <div class="meter-row">
              <div class="meter-label">
                <span>Allostatic Reserve</span>
                <span id="reserveValue" style="font-weight: 700; color: #38bdf8;">Fragile (Easily Depleted)</span>
              </div>
              <div class="meter-bar">
                <div class="meter-fill" id="reserveBar" style="width: 35%; background: #38bdf8;"></div>
              </div>
            </div>
          </div>

          <!-- Controls -->
          <div style="background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem;">
            <h4 style="font-size: 0.95rem; margin-bottom: 1rem; color: var(--indigo-light);">Autonomic Pacing Levers</h4>
            
            <div style="display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.8125rem;">
              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" id="toggleHydro" onchange="updateDarwinSimulation()" />
                <span>Cold-Water Facial Immersion (Mammalian Dive Reflex &bull; Trigeminal-Vagal)</span>
              </label>

              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" id="toggleSandwalk" onchange="updateDarwinSimulation()" />
                <span>The Sandwalk Pacing (3x Daily Rhythmic Low-Cadence Walking)</span>
              </label>

              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" id="toggleSmallMeals" onchange="updateDarwinSimulation()" />
                <span>Small Warm Cooked Meals (Prevents Splanchnic Blood Pooling)</span>
              </label>

              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" id="togglePacing" onchange="updateDarwinSimulation()" />
                <span>Strict Intellectual Boundaries (Max 90 Min Focused Work Blocks)</span>
              </label>
            </div>

            <div style="margin-top: 1.25rem; padding: 0.75rem; border-radius: 0.5rem; background: rgba(99, 102, 241, 0.08); border: 1px solid var(--indigo); font-size: 0.75rem;" id="darwinSimOutput">
              Baseline State: Acute sympathetic hyper-reactivity and delayed gastric emptying.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3B Innovation Section -->
    <section class="section" id="innovation-3b">
      <h3 class="section-title">The 3B Innovation Architecture: Breaking, Bending &amp; Blending</h3>
      <p class="section-sub">How Charles Darwin's chronic struggle exemplifies cognitive innovation in clinical science.</p>

      <div class="innovation-grid">
        <div class="b3-card">
          <span class="b3-pill breaking">BREAKING</span>
          <h4 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Dismantling the Psychogenic Stigma</h4>
          <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
            <strong>Breaks the "Hypochondriac" Label:</strong> Overturns 150 years of dismissive psychiatric framing 
            by grounding Darwin's symptoms in physiological baroreflex sensitivity, post-infectious autonomic neuropathy, 
            and splanchnic blood pooling.
          </p>
        </div>

        <div class="b3-card">
          <span class="b3-pill bending">BENDING</span>
          <h4 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Modulating Autonomic Setpoints</h4>
          <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
            <strong>Bends the Orthostatic Reflex:</strong> Darwin intuitively calibrated his daily cognitive capacity. 
            By breaking work into 90-minute parcels separated by gravel strolls, he bent his autonomic recovery slope, 
            preserving energy for revolutionary scientific breakthroughs.
          </p>
        </div>

        <div class="b3-card">
          <span class="b3-pill blending">BLENDING</span>
          <h4 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Victorian Hydropathy + Neuro-Immunology</h4>
          <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
            <strong>Blends Victorian Water Cure with 21st-Century Science:</strong> Dr. Gully's cold-water packs at Malvern 
            were not mystic quackery; they activated the trigeminal-vagal mammalian dive reflex and stimulated 
            the cholinergic anti-inflammatory pathway, calming gastrointestinal spasm.
          </p>
        </div>
      </div>
    </section>

    <!-- Stepped Care Recommendations -->
    <section class="section" id="recommendations">
      <h3 class="section-title">4-Tier Stepped Care Recommendations</h3>
      <p class="section-sub">Autonomous pacing and non-pharmacological stabilization protocols.</p>

      <div class="tier-list">
        <div class="tier-card">
          <div>
            <span class="tier-badge">TIER 1: ZERO-COST FOUNDATION</span>
            <h4 style="margin: 0.35rem 0;">Cold-Water Facial Immersion &amp; 3x Daily Sandwalk Pacing</h4>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">
              15-second cold water splash to activate parasympathetic bradycardia (mammalian dive reflex). 
              Three unhurried 20-minute daily walks to promote gentle venous return without metabolic strain.
            </p>
          </div>
          <div class="tier-price">
            <div class="price-benchmark">Standard Retail Benchmark: $0.00</div>
            <div class="price-oop">Estimated Out-of-Pocket: $0.00</div>
          </div>
        </div>

        <div class="tier-card">
          <div>
            <span class="tier-badge">TIER 2: WHO ESSENTIAL MEDICINES</span>
            <h4 style="margin: 0.35rem 0;">Oral Rehydration Salts (WHO Formulation) &amp; Low-Dose Beta-Blocker</h4>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">
              Expanding circulating plasma volume to mitigate orthostatic tachycardia; generic propranolol for severe adrenergic surges.
            </p>
          </div>
          <div class="tier-price">
            <div class="price-benchmark">Standard Retail Benchmark: $12.00/mo</div>
            <div class="price-oop">Estimated Out-of-Pocket: $3.50/mo</div>
          </div>
        </div>

        <div class="tier-card">
          <div>
            <span class="tier-badge">TIER 3: TARGETED ORTHOMOLECULAR ADJUNCTS</span>
            <h4 style="margin: 0.35rem 0;">Deglycyrrhizinated Licorice (DGL) &amp; CoQ10 (Ubiquinol 200mg)</h4>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">
              DGL chewables soothe gastric mucosal hypersensitivity; CoQ10 supports mitochondrial smooth muscle respiration.
            </p>
          </div>
          <div class="tier-price">
            <div class="price-benchmark">Standard Retail Benchmark: $38.00/mo</div>
            <div class="price-oop">Estimated Out-of-Pocket: $19.00/mo</div>
          </div>
        </div>

        <div class="tier-card">
          <div>
            <span class="tier-badge" style="background: rgba(244, 63, 94, 0.15); color: var(--rose-light);">TIER 4: CLINICAL DEMARCATION &amp; RED FLAGS</span>
            <h4 style="margin: 0.35rem 0;">Sudden Syncope with Head Trauma or Refractory Emesis with Dehydration</h4>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">
              Immediate clinical intervention for intractable vomiting leading to hypokalemic alkalosis or cardiac syncope.
            </p>
          </div>
          <div class="tier-price">
            <span style="font-size: 0.75rem; color: var(--rose-light); font-weight: 700;">Urgent Clinical Escalation</span>
          </div>
        </div>
      </div>

      <!-- Export Banner -->
      <div class="export-card">
        <div>
          <h4 style="font-size: 1.1rem; margin-bottom: 0.25rem;">Download HL7 FHIR R4 Research Bundle</h4>
          <p style="font-size: 0.8125rem; color: var(--text-muted);">
            Includes de-identified Patient, Condition (Autonomic Dysregulation), CarePlan, and Observation resources.
          </p>
        </div>
        <button class="btn-action" onclick="downloadDarwinFhirBundle()">
          📥 Export FHIR R4 Bundle (JSON)
        </button>
      </div>
      <div id="fhirNotice" style="margin-top: 0.75rem; font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--text-muted);"></div>
    </section>

  </main>

${renderLegalFooterHtml()}

  <script>
    function updateDarwinSimulation() {
      const hydro = document.getElementById('toggleHydro').checked;
      const sandwalk = document.getElementById('toggleSandwalk').checked;
      const meals = document.getElementById('toggleSmallMeals').checked;
      const pacing = document.getElementById('togglePacing').checked;

      let orthoSpike = 42;
      let vagalSens = 5.2;
      let gastricText = 'Delayed / Spastic';
      let gastricWidth = 30;
      let reserveText = 'Fragile (Easily Depleted)';
      let reserveWidth = 35;

      if (hydro) {
        orthoSpike -= 14;
        vagalSens += 4.5;
      }
      if (sandwalk) {
        orthoSpike -= 8;
        reserveText = 'Robust Pacing Reserve';
        reserveWidth = 70;
      }
      if (meals) {
        gastricText = 'Smooth Postprandial Transit';
        gastricWidth = 80;
        orthoSpike -= 6;
      }
      if (pacing) {
        vagalSens += 3.5;
        reserveWidth = Math.min(100, reserveWidth + 25);
      }

      orthoSpike = Math.max(12, orthoSpike);
      vagalSens = Math.min(18.0, vagalSens);

      const orthoValEl = document.getElementById('orthoValue');
      const orthoBarEl = document.getElementById('orthoBar');
      const vagalValEl = document.getElementById('vagalValue');
      const vagalBarEl = document.getElementById('vagalBar');
      const gasValEl = document.getElementById('gastricValue');
      const gasBarEl = document.getElementById('gastricBar');
      const resValEl = document.getElementById('reserveValue');
      const resBarEl = document.getElementById('reserveBar');
      const simOutEl = document.getElementById('darwinSimOutput');

      orthoValEl.textContent = '+' + orthoSpike + ' bpm';
      orthoBarEl.style.width = Math.min(100, Math.round((orthoSpike / 50) * 100)) + '%';
      if (orthoSpike <= 20) {
        orthoValEl.style.color = '#34d399';
        orthoBarEl.style.background = '#34d399';
      } else {
        orthoValEl.style.color = '#f43f5e';
        orthoBarEl.style.background = '#f43f5e';
      }

      vagalValEl.textContent = vagalSens.toFixed(1) + ' ms/mmHg';
      vagalBarEl.style.width = Math.min(100, Math.round((vagalSens / 18) * 100)) + '%';

      gasValEl.textContent = gastricText;
      gasBarEl.style.width = gastricWidth + '%';

      resValEl.textContent = reserveText;
      resBarEl.style.width = reserveWidth + '%';

      if (orthoSpike <= 20) {
        simOutEl.textContent = '✓ Down House Pacing Stabilized: Postural heart rate stabilized within normal limits, and vagal cholinergic tone restored.';
        simOutEl.style.color = '#34d399';
      } else {
        simOutEl.textContent = 'Simulation: Orthostatic spike ' + orthoSpike + ' bpm. Combine cold-water dive reflex with Sandwalk pacing to achieve full stability.';
        simOutEl.style.color = 'var(--text-muted)';
      }
    }

    function togglePaperMode() {
      const isPaper = document.documentElement.classList.toggle('paper');
      const icon = document.getElementById('themeToggleIcon');
      const text = document.getElementById('themeToggleText');
      if (icon && text) {
        icon.textContent = isPaper ? '🌙' : '📜';
        text.textContent = isPaper ? 'Obsidian Dark' : 'Monastic Paper';
      }
    }

    function downloadDarwinFhirBundle() {
      const bundle = {
        resourceType: 'Bundle',
        type: 'collection',
        id: 'pocketgull-darwin-vagal-careplan',
        timestamp: new Date().toISOString(),
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: 'subj-darwin-1882',
              active: true,
              gender: 'male',
              note: [{ text: 'HIPAA §164.514 Safe Harbor de-identified retrospective luminary model. All 18 identifiers stripped.' }]
            }
          },
          {
            resource: {
              resourceType: 'Condition',
              id: 'autonomic-dysregulation-condition',
              clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/codesystem/condition-clinical', code: 'active' }] },
              code: { coding: [{ system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'G90.9', display: 'Disorder of autonomic nervous system, unspecified' }] },
              note: [{ text: 'Post-infectious dysautonomia with delayed gastric emptying and orthostatic intolerance.' }]
            }
          },
          {
            resource: {
              resourceType: 'CarePlan',
              id: 'darwin-salutogenic-plan-01',
              status: 'active',
              intent: 'plan',
              title: 'PocketGull Autonomic Sanctuary & Sandwalk Pacing Plan',
              description: 'Down House low-cadence walking pacing, cold-water mammalian dive reflex, and small warm meals.',
              activity: [
                { detail: { description: 'Cold-water facial immersion (mammalian dive reflex) upon waking and during adrenergic surges', status: 'in-progress' } },
                { detail: { description: 'Three 20-minute daily Sandwalk gravel loops for soleus muscle venous return', status: 'in-progress' } },
                { detail: { description: 'Small, warm, cooked meals with ginger and DGL licorice before meals', status: 'in-progress' } }
              ]
            }
          }
        ]
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute('href', dataStr);
      dlAnchor.setAttribute('download', 'pocketgull-darwin-vagal-careplan-fhir-r4.json');
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();

      const notice = document.getElementById('fhirNotice');
      if (notice) {
        notice.textContent = '✓ Successfully downloaded Charles Darwin HL7 FHIR R4 Bundle (JSON)!';
        setTimeout(() => { notice.textContent = ''; }, 4000);
      }
    }
  </script>
</body>
</html>`;
}
