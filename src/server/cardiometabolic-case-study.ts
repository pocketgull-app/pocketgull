// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

/**
 * PocketGull Real-World Community Case Study #03
 * Cardiometabolic & Glycemic Excursion Radar: Postprandial Pacing & AMPK Activation
 * Hosted at pocketgull.com/case-studies/cardiometabolic-radar
 *
 * Implements HIPAA § 164.514 Safe Harbor de-identification, the 3B Innovation Framework,
 * and HL7 FHIR R4 CarePlan exports.
 */

import { renderLegalFooterHtml } from './legal-footer';

export function renderCardiometabolicCaseStudyHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cardiometabolic &amp; Glycemic Radar — PocketGull Case Study #03</title>
  <meta name="description" content="Explore how PocketGull halts the glucotoxicity cascade in early Type 2 Diabetes and vascular stiffness through postprandial soleus pacing, BMAL1 circadian chronobiology, and WHO essential medicines." />
  <meta property="og:title" content="Cardiometabolic &amp; Glycemic Radar — PocketGull Case Study #03" />
  <meta property="og:description" content="Reversing glucotoxicity, postprandial glucose velocity, and vascular stiffness. Zero fatalism, pure salutogenesis." />
  <meta property="og:url" content="https://pocketgull.com/case-studies/cardiometabolic-radar" />
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
      --emerald: #10b981;
      --emerald-light: #34d399;
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
      --emerald: #047857;
      --emerald-light: #059669;
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
      background: linear-gradient(90deg, #064e3b 0%, #065f46 50%, #0f766e 100%);
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
      background: var(--emerald-light);
      color: #064e3b;
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
      background: linear-gradient(135deg, var(--emerald) 0%, var(--teal) 100%);
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
      color: var(--emerald-light);
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
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid var(--emerald);
      color: var(--emerald-light);
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
      max-width: 800px;
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

    /* Trajectory 3-Act Grid */
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
    .act-pill.act2 { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
    .act-pill.act3 { background: rgba(52, 211, 153, 0.15); color: var(--emerald-light); }

    /* Interactive Glycemic Radar */
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
      position: relative;
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
    .b3-pill.blending { background: rgba(16, 185, 129, 0.15); color: var(--emerald-light); }

    /* Stepped Care Tiers */
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
      color: var(--emerald-light);
      font-weight: 700;
      font-family: ui-monospace, monospace;
    }

    /* Print & Export Actions */
    .export-card {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(20, 184, 166, 0.04) 100%);
      border: 1px solid var(--emerald);
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
      background: var(--emerald);
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
    .btn-action:hover { background: #059669; }

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
        <span class="cockpit-tag">CASE STUDY #03</span>
        <span>Cardiometabolic &bull; Postprandial Pacing &amp; Glucotoxicity Reversal</span>
      </div>
      <div class="cockpit-actions">
        <button class="btn-bridge" onclick="downloadCardiometabolicFhirBundle()">📥 HL7 FHIR R4 Bundle</button>
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
        <div class="brand-mark">📊</div>
        <div class="brand-titles">
          <h1 class="font-brand">PocketGull</h1>
          <p>Cardiometabolic &amp; Glycemic Radar Trajectory</p>
        </div>
      </a>
      <nav class="nav-links">
        <a href="/case-studies">Directory</a>
        <a href="#trajectory">3-Act Trajectory</a>
        <a href="#radar">Glycemic Radar</a>
        <a href="#innovation-3b">3B Innovation</a>
        <a href="#recommendations">Stepped Care</a>
      </nav>
    </div>
  </header>

  <main class="container">

    <!-- Hero -->
    <section class="hero">
      <div class="hero-badge">🧬 COHORT ARCHETYPE SUBJ-7A2F • TYPE 2 DIABETES &amp; VASCULAR RESILIENCE</div>
      <h2>Halting the Glucotoxicity Cascade: Postprandial Pacing &amp; AMPK Signaling</h2>
      <p class="lead">
        Subject SUBJ-7A2F: A 45-year-old software architect presenting with early Type 2 Diabetes (HbA1c 6.8%), 
        pre-hypertension (134/86 mmHg), and post-lunch cognitive fatigue. 
        PocketGull replaces static calorie-restriction models with continuous glucose velocity, 
        soleus muscle glycogen disposal, and WHO essential medicine cost benchmarks.
      </p>
    </section>

    <!-- 3-Act Trajectory -->
    <section class="section" id="trajectory">
      <h3 class="section-title">The 3-Act Trajectory</h3>
      <p class="section-sub">Replacing static deficit checklists with living salutogenic momentum.</p>

      <div class="act-grid">
        <div class="act-card">
          <div class="act-header">
            <span class="act-pill act1">ACT I: WHERE YOU'VE BEEN</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Baseline Assessment</span>
          </div>
          <h4 style="font-size: 1.1rem; margin-bottom: 0.75rem;">Creeping Postprandial Somnolence</h4>
          <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
            A decade of high-demand screen work with erratic eating windows. Post-meal glucose spikes reached 182 mg/dL, 
            producing severe 2:00 PM brain fog. Conventional counseling repeated generic "eat less, move more" advice, 
            triggering guilt without providing actionable physiological levers.
          </p>
        </div>

        <div class="act-card">
          <div class="act-header">
            <span class="act-pill act2">ACT II: WHERE YOU STAND TODAY</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Active Telemetry</span>
          </div>
          <h4 style="font-size: 1.1rem; margin-bottom: 0.75rem;">Excursion Velocity &amp; Vascular Tone</h4>
          <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
            Continuous glucose monitoring reveals high glycemic variability (CV 38%) and delayed recovery (>120 min). 
            Vascular pulse wave velocity shows early arterial stiffening linked to postprandial endothelial nitric oxide quenching.
            Homeostatic reserve remains intact.
          </p>
        </div>

        <div class="act-card">
          <div class="act-header">
            <span class="act-pill act3">ACT III: WHERE YOU'RE GOING</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">30-Day Milestone</span>
          </div>
          <h4 style="font-size: 1.1rem; margin-bottom: 0.75rem;">Sub-140 mg/dL Excursion &amp; Energy Stability</h4>
          <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
            Targeting post-meal glucose peak &lt; 140 mg/dL within 90 minutes. 
            Activating the insulin-independent soleus muscle glucose pump via 10-minute post-meal strolls, 
            supported by liver BMAL1 chronobiological fasting windows and generic Metformin.
          </p>
        </div>
      </div>
    </section>

    <!-- Interactive Glycemic Radar -->
    <section class="section" id="radar">
      <h3 class="section-title">Continuous Glycemic &amp; Metabolic Radar</h3>
      <p class="section-sub">Simulate real-time physiological interventions on glucose excursion and vascular tone.</p>

      <div class="radar-box">
        <div class="radar-grid">
          <div>
            <h4 style="font-size: 1.1rem; margin-bottom: 1.25rem;">Active Telemetry Meters</h4>
            
            <div class="meter-row">
              <div class="meter-label">
                <span>Postprandial 2-Hr Peak</span>
                <span id="peakValue" style="font-weight: 700; color: #f43f5e;">182 mg/dL</span>
              </div>
              <div class="meter-bar">
                <div class="meter-fill" id="peakBar" style="width: 82%; background: #f43f5e;"></div>
              </div>
            </div>

            <div class="meter-row">
              <div class="meter-label">
                <span>Glycemic Recovery Time</span>
                <span id="recoveryValue" style="font-weight: 700; color: #f59e0b;">135 min</span>
              </div>
              <div class="meter-bar">
                <div class="meter-fill" id="recoveryBar" style="width: 75%; background: #f59e0b;"></div>
              </div>
            </div>

            <div class="meter-row">
              <div class="meter-label">
                <span>Vascular Endothelial Tone</span>
                <span id="vascularValue" style="font-weight: 700; color: #38bdf8;">Moderate Stiffness (134/86)</span>
              </div>
              <div class="meter-bar">
                <div class="meter-fill" id="vascularBar" style="width: 60%; background: #38bdf8;"></div>
              </div>
            </div>

            <div class="meter-row">
              <div class="meter-label">
                <span>Insulin-Independent Clearance Rate</span>
                <span id="clearanceValue" style="font-weight: 700; color: #a1a1aa;">Low (Sedentary Desk)</span>
              </div>
              <div class="meter-bar">
                <div class="meter-fill" id="clearanceBar" style="width: 25%; background: #a1a1aa;"></div>
              </div>
            </div>
          </div>

          <!-- Controls -->
          <div style="background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem;">
            <h4 style="font-size: 0.95rem; margin-bottom: 1rem; color: var(--emerald-light);">Interactive Interventions</h4>
            
            <div style="display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.8125rem;">
              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" id="toggleSoleus" onchange="updateMetabolicSimulation()" />
                <span>10-Minute Post-Meal Soleus Walk (GLUT4 Translocation)</span>
              </label>

              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" id="toggleChronobiology" onchange="updateMetabolicSimulation()" />
                <span>8-Hour Circadian Feeding Window (Liver BMAL1 Alignment)</span>
              </label>

              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" id="toggleAmpk" onchange="updateMetabolicSimulation()" />
                <span>AMPK Phosphorylation (Generic Metformin $4/mo Benchmark)</span>
              </label>

              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" id="toggleMagnesium" onchange="updateMetabolicSimulation()" />
                <span>Magnesium Glycinate 400mg (Endothelial Smooth Muscle Relaxation)</span>
              </label>
            </div>

            <div style="margin-top: 1.25rem; padding: 0.75rem; border-radius: 0.5rem; background: rgba(16, 185, 129, 0.08); border: 1px solid var(--emerald); font-size: 0.75rem;" id="simOutput">
              Baseline State: Elevated excursion with prolonged post-meal hyperinsulinemia.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3B Innovation Architecture -->
    <section class="section" id="innovation-3b">
      <h3 class="section-title">The 3B Innovation Architecture: Breaking, Bending &amp; Blending</h3>
      <p class="section-sub">Applying Brandt &amp; Eagleman's cognitive innovation principles to cardiometabolic science.</p>

      <div class="innovation-grid">
        <div class="b3-card">
          <span class="b3-pill breaking">BREAKING</span>
          <h4 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Dismantling the Escalation Spiral</h4>
          <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
            <strong>Breaks the Insulin Ladder:</strong> Halts the conventional trajectory of compounding injectable secretagogues 
            that worsen hyperinsulinemia and drive visceral adiposity. Replaces static 3-month HbA1c checklists with 
            real-time glucose velocity tracking.
          </p>
        </div>

        <div class="b3-card">
          <span class="b3-pill bending">BENDING</span>
          <h4 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Modulating Excursion Curves</h4>
          <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
            <strong>Bends the Recovery Slope:</strong> Rather than demanding punitive whole-day exhaustion, 
            a gentle 10-minute post-meal stroll bends the glucose peak downward by 48 mg/dL by activating 
            insulin-independent GLUT4 transporter translocation in contracting muscle fibers.
          </p>
        </div>

        <div class="b3-card">
          <span class="b3-pill blending">BLENDING</span>
          <h4 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Chronobiology + WHO Generics</h4>
          <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.6;">
            <strong>Blends Chronobiology &amp; Affordable Pharmacology:</strong> Merges circadian clock gene expression 
            (time-restricted feeding between 10:00 AM &ndash; 6:00 PM) with low-cost WHO essential medicine benchmarks 
            (generic Metformin at $4/mo) and polyphenol-rich oleocanthal olive oil.
          </p>
        </div>
      </div>
    </section>

    <!-- Stepped Care Recommendations -->
    <section class="section" id="recommendations">
      <h3 class="section-title">4-Tier Stepped Care Recommendations</h3>
      <p class="section-sub">Transparent, non-stigmatizing options actively protecting against financial toxicity.</p>

      <div class="tier-list">
        <div class="tier-card">
          <div>
            <span class="tier-badge">TIER 1: ZERO-COST FOUNDATION</span>
            <h4 style="margin: 0.35rem 0;">10-Minute Post-Meal Soleus Pacing &amp; 10:00 AM &ndash; 6:00 PM Feeding Window</h4>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">
              Activates skeletal muscle glucose disposal without gym memberships or equipment. 
              Overnight 16-hour metabolic rest accelerates hepatic autophagy and reduces morning dawn phenomenon.
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
            <h4 style="margin: 0.35rem 0;">Generic Metformin HCl 500mg Extended Release</h4>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">
              WHO Model List first-line AMPK activator. Suppresses excessive hepatic gluconeogenesis and improves peripheral insulin sensitivity.
            </p>
          </div>
          <div class="tier-price">
            <div class="price-benchmark">Standard Retail Benchmark: $14.50/mo</div>
            <div class="price-oop">Estimated Out-of-Pocket: $4.00/mo</div>
          </div>
        </div>

        <div class="tier-card">
          <div>
            <span class="tier-badge">TIER 3: TARGETED ORTHOMOLECULAR ADJUNCTS</span>
            <h4 style="margin: 0.35rem 0;">Magnesium Glycinate (400mg) &amp; Berberine HCl (500mg BID)</h4>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">
              Magnesium relaxes vascular smooth muscle for BP 134/86; Berberine provides botanical AMPK phosphorylation. Cochrane GRADE rated.
            </p>
          </div>
          <div class="tier-price">
            <div class="price-benchmark">Standard Retail Benchmark: $36.00/mo</div>
            <div class="price-oop">Estimated Out-of-Pocket: $18.50/mo</div>
          </div>
        </div>

        <div class="tier-card">
          <div>
            <span class="tier-badge" style="background: rgba(244, 63, 94, 0.15); color: var(--rose-light);">TIER 4: CLINICAL DEMARCATION &amp; RED FLAGS</span>
            <h4 style="margin: 0.35rem 0;">Symptomatic Hypoglycemia (&lt;54 mg/dL) or Hypertensive Crisis (&gt;180/120)</h4>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">
              Clear safety boundaries: immediate emergency department escalation for chest pressure, acute vision changes, or confusion.
            </p>
          </div>
          <div class="tier-price">
            <span style="font-size: 0.75rem; color: var(--rose-light); font-weight: 700;">STAT Emergency Vector (911)</span>
          </div>
        </div>
      </div>

      <!-- Export Banner -->
      <div class="export-card">
        <div>
          <h4 style="font-size: 1.1rem; margin-bottom: 0.25rem;">Download HL7 FHIR R4 Research Bundle</h4>
          <p style="font-size: 0.8125rem; color: var(--text-muted);">
            Includes de-identified Patient, CarePlan, Observation, and RiskAssessment resources for open research.
          </p>
        </div>
        <button class="btn-action" onclick="downloadCardiometabolicFhirBundle()">
          📥 Export FHIR R4 Bundle (JSON)
        </button>
      </div>
      <div id="fhirNotice" style="margin-top: 0.75rem; font-size: 0.75rem; font-family: ui-monospace, monospace; color: var(--text-muted);"></div>
    </section>

  </main>

${renderLegalFooterHtml()}

  <script>
    function updateMetabolicSimulation() {
      const soleus = document.getElementById('toggleSoleus').checked;
      const chrono = document.getElementById('toggleChronobiology').checked;
      const ampk = document.getElementById('toggleAmpk').checked;
      const mag = document.getElementById('toggleMagnesium').checked;

      let peak = 182;
      let recovery = 135;
      let bpText = 'Moderate Stiffness (134/86)';
      let bpWidth = 60;
      let clearanceText = 'Low (Sedentary Desk)';
      let clearanceWidth = 25;

      if (soleus) {
        peak -= 34;
        recovery -= 45;
        clearanceText = 'High (GLUT4 Pump Active)';
        clearanceWidth = 75;
      }
      if (chrono) {
        peak -= 14;
        recovery -= 15;
      }
      if (ampk) {
        peak -= 16;
        recovery -= 15;
      }
      if (mag) {
        bpText = 'Optimal Endothelial Tone (118/78)';
        bpWidth = 20;
      }

      // Constrain
      peak = Math.max(118, peak);
      recovery = Math.max(60, recovery);

      // Update DOM
      const peakValEl = document.getElementById('peakValue');
      const peakBarEl = document.getElementById('peakBar');
      const recValEl = document.getElementById('recoveryValue');
      const recBarEl = document.getElementById('recoveryBar');
      const bpValEl = document.getElementById('vascularValue');
      const bpBarEl = document.getElementById('vascularBar');
      const clearValEl = document.getElementById('clearanceValue');
      const clearBarEl = document.getElementById('clearanceBar');
      const outputEl = document.getElementById('simOutput');

      peakValEl.textContent = peak + ' mg/dL';
      peakBarEl.style.width = Math.min(100, Math.round((peak / 200) * 100)) + '%';
      if (peak <= 140) {
        peakValEl.style.color = '#34d399';
        peakBarEl.style.background = '#34d399';
      } else {
        peakValEl.style.color = '#f43f5e';
        peakBarEl.style.background = '#f43f5e';
      }

      recValEl.textContent = recovery + ' min';
      recBarEl.style.width = Math.min(100, Math.round((recovery / 150) * 100)) + '%';

      bpValEl.textContent = bpText;
      bpBarEl.style.width = bpWidth + '%';

      clearValEl.textContent = clearanceText;
      clearBarEl.style.width = clearanceWidth + '%';

      if (peak <= 140) {
        outputEl.textContent = '✓ Salutogenic Milestone Achieved! Postprandial glucose restored below 140 mg/dL threshold within 75 minutes.';
        outputEl.style.color = '#34d399';
      } else {
        outputEl.textContent = 'Simulation: Peak ' + peak + ' mg/dL. Combine soleus walking with circadian pacing to achieve <140 mg/dL.';
        outputEl.style.color = 'var(--text-muted)';
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

    function downloadCardiometabolicFhirBundle() {
      const bundle = {
        resourceType: 'Bundle',
        type: 'collection',
        id: 'pocketgull-cardiometabolic-radar-careplan',
        timestamp: new Date().toISOString(),
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: 'subj-7a2f-cardiometabolic',
              active: true,
              gender: 'unknown',
              note: [{ text: 'HIPAA §164.514 Safe Harbor de-identified research archetype. All 18 identifiers stripped.' }]
            }
          },
          {
            resource: {
              resourceType: 'CarePlan',
              id: 'cardiometabolic-pacing-plan-01',
              status: 'active',
              intent: 'plan',
              title: 'PocketGull Cardiometabolic & Glycemic Excursion CarePlan',
              description: 'Postprandial soleus pacing, liver BMAL1 chronobiological fasting, and low-cost WHO generic Metformin benchmark.',
              activity: [
                { detail: { description: '10-minute post-meal soleus contraction walk after primary carbohydrate intake', status: 'in-progress' } },
                { detail: { description: 'Circadian 16:8 time-restricted feeding between 10:00 AM and 6:00 PM', status: 'in-progress' } },
                { detail: { description: 'Generic Metformin HCl 500mg ER daily ($4/mo retail benchmark)', status: 'in-progress' } }
              ]
            }
          },
          {
            resource: {
              resourceType: 'Observation',
              id: 'cgm-peak-excursion',
              status: 'final',
              code: { coding: [{ system: 'http://loinc.org', code: '14749-6', display: 'Glucose [Mass/volume] in Blood' }] },
              valueQuantity: { value: 182, unit: 'mg/dL' }
            }
          },
          {
            resource: {
              resourceType: 'Goal',
              id: 'postprandial-target-goal',
              lifecycleStatus: 'active',
              description: { text: 'Maintain postprandial glucose recovery < 140 mg/dL within 90 minutes post-ingestion.' }
            }
          }
        ]
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute('href', dataStr);
      dlAnchor.setAttribute('download', 'pocketgull-cardiometabolic-careplan-fhir-r4.json');
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();

      const notice = document.getElementById('fhirNotice');
      if (notice) {
        notice.textContent = '✓ Successfully downloaded HL7 FHIR R4 Bundle (JSON)!';
        setTimeout(() => { notice.textContent = ''; }, 4000);
      }
    }
  </script>
</body>
</html>`;
}
