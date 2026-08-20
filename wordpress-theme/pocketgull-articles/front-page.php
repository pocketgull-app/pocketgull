<?php
/**
 * Front Page Template for WordPress Theme (pocketgull.com)
 * The Master Clinical Intelligence, Multi-Agent Swarm, Digital Twin & SaaS Business Portal
 *
 * @package PocketGull_Articles
 */

get_header(); ?>

<!-- ══ 0. LIVE CLINICAL TELEMETRY HUD BAR ═════════════════════════════════════ -->
<div class="relative z-20 border-b border-stone-800 bg-stone-950/95 py-2 px-4 text-[11px] font-mono text-stone-400 overflow-x-auto">
  <div class="max-w-7xl mx-auto flex items-center justify-between gap-6 whitespace-nowrap">
    <div class="flex items-center gap-4">
      <span class="text-amber-400 font-bold flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        CLINICAL SUITE // PROD
      </span>
      <span class="text-stone-600">|</span>
      <span>⚡ 120 FPS (6.3ms) // 0.4% JANK</span>
      <span class="text-stone-600">|</span>
      <span class="text-teal-400">🛡️ HIPAA §164.514 SAFE HARBOR</span>
      <span class="text-stone-600">|</span>
      <span>⚡ &lt;180ms Gemini 2.5 Live</span>
      <span class="text-stone-600">|</span>
      <span class="text-rose-400">📑 FHIR R4 &amp; 21 CFR Part 11</span>
    </div>
    <div class="hidden sm:flex items-center gap-3 text-stone-400">
      <span>LEVEL A RCT TRIAL GROUNDING</span>
      <span>•</span>
      <span class="text-emerald-400">COCHRANE RoB 2 AUDITED</span>
    </div>
  </div>
</div>

<main class="relative z-10 flex-grow space-y-28 py-12 px-4 sm:px-6 max-w-7xl mx-auto">

  <!-- ══ 1. MASTER HERO & GEARARTS CARD ═════════════════════════════════════════ -->
  <section class="text-center max-w-5xl mx-auto pt-4 pb-6">
    
    <!-- GEARARTS Master Card with Dieter Rams Grill -->
    <div class="max-w-xl mx-auto mb-10 text-center relative">
      <div class="geararts-card p-8 rounded-3xl relative overflow-hidden text-stone-950 shadow-2xl border-4 border-amber-300/50">
        
        <!-- Dieter Rams Slotted Grill Homage -->
        <div class="rams-grill">
          <div></div><div></div><div></div><div></div>
        </div>

        <!-- Banner inside card -->
        <div class="bg-gradient-to-r from-teal-600 to-rose-500 text-white rounded-xl p-3 mb-6 text-center shadow-md border border-white/20 mt-1">
          <div class="font-bold text-2xl tracking-wider uppercase">GEARARTS</div>
          <div class="text-[10px] tracking-tight uppercase font-semibold">Creating a Sustainable Future Through Art and Technology</div>
        </div>

        <!-- Official Geometric Origami Seagull Icon Centerpiece -->
        <div class="w-32 h-32 mx-auto my-4 rounded-2xl bg-stone-950 p-4 shadow-inner flex items-center justify-center relative overflow-hidden border-2 border-stone-800">
          <svg viewBox="0 0 100 100" class="w-20 h-20 drop-shadow-md">
            <polygon points="50,15 85,55 50,45" fill="#FFFFFF" opacity="0.95" />
            <polygon points="50,15 15,55 50,45" fill="#E6F0FA" opacity="0.9" />
            <polygon points="50,45 85,55 50,85" fill="#C5D9ED" opacity="0.85" />
            <polygon points="50,45 15,55 50,85" fill="#A8C7E0" opacity="0.8" />
            <polygon points="50,15 56,10 50,18" fill="#34A853" /> <!-- Origami Green Beak -->
          </svg>
        </div>

        <!-- Wordmark with Authentic MarkerFont -->
        <div class="text-4xl sm:text-5xl font-bold text-stone-950 tracking-tight font-pocketgull-marker">
          PocketGull
        </div>
        <div class="text-xs font-bold text-stone-800 uppercase tracking-widest mt-1 font-mono">
          Clinical Multi-Agent Swarm &amp; Digital Twin Platform
        </div>
      </div>
    </div>

    <!-- Main Value Proposition Headline -->
    <h1 class="text-4xl sm:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto">
      The Autonomous <span class="text-teal-400 marker-underline">Clinical AI Swarm</span> &amp; Digital Twin.
    </h1>

    <p class="text-lg sm:text-2xl text-stone-300 mb-10 max-w-3xl mx-auto leading-relaxed font-normal">
      Accelerating clinical research trials, eliminating diagnostic blind spots, and empowering patients with a continuous, predictive <strong class="text-amber-300">4D Physiological Digital Twin</strong> that prevents costly acute hospitalizations.
    </p>

    <!-- Primary Conversion CTA Buttons -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
      <button onclick="document.getElementById('pilotModal').classList.remove('hidden')" class="w-full sm:w-auto px-8 py-4 rounded-2xl geararts-card text-lg text-stone-950 font-extrabold transition-all hover:scale-105 hover:shadow-amber-500/50 flex items-center justify-center gap-2 shadow-xl cursor-pointer">
        <span>Start 14-Day Clinical Pilot</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      </button>
      <a href="https://pocketgull.app" class="w-full sm:w-auto px-7 py-4 rounded-2xl glass-card-dark text-stone-200 text-lg font-bold hover:text-white hover:border-amber-400/60 transition-all flex items-center justify-center gap-2">
        <span>Launch Clinical Suite (pocketgull.app)</span>
        <span>🚀</span>
      </a>
    </div>

    <!-- 4 High-Impact Metrics Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto text-left font-mono text-xs">
      <div class="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1">
        <div class="text-3xl font-black text-amber-300">42%–60%</div>
        <div class="text-white font-bold">Charting Overhead Cut</div>
        <div class="text-stone-400 text-[11px]">Saves 2+ hrs/shift for providers</div>
      </div>
      <div class="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1">
        <div class="text-3xl font-black text-teal-300">$18,400+</div>
        <div class="text-white font-bold">Crisis Avoidance / Pt</div>
        <div class="text-stone-400 text-[11px]">Early biomarker red-flag alerts</div>
      </div>
      <div class="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1">
        <div class="text-3xl font-black text-rose-300">&lt; 250ms</div>
        <div class="text-white font-bold">Live Voice Latency</div>
        <div class="text-stone-400 text-[11px]">Multimodal Gemini 2.5 Live</div>
      </div>
      <div class="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1">
        <div class="text-3xl font-black text-emerald-300">100%</div>
        <div class="text-white font-bold">FHIR R4 Compliant</div>
        <div class="text-stone-400 text-[11px]">Epic, Cerner &amp; AthenaHealth</div>
      </div>
    </div>

  </section>

  <!-- ══ 2. 7 AUTONOMOUS CLINICAL FACULTY DIRECTORY ═════════════════════════════ -->
  <section id="agents" class="space-y-12">
    <div class="text-center space-y-3 max-w-3xl mx-auto">
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold">
        <span>👥 Multidisciplinary Attending Faculty</span>
      </div>
      <h2 class="text-3xl sm:text-5xl font-extrabold text-white">
        Seven Specialized Clinical AI Agents
      </h2>
      <p class="text-stone-300 text-sm sm:text-base leading-relaxed">
        PocketGull is not a generic chatbot. Seven autonomous, board-specialized clinical agents operate as a collaborative attending team:
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
      
      <!-- Agent 1: Dr. Gulliver -->
      <div class="glass-card-dark p-7 rounded-3xl border border-amber-500/30 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-2 pt-2">
          <div class="flex items-center justify-between font-mono text-[10px]">
            <span class="text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded">ON DUTY</span>
            <span class="text-stone-400">&lt;180ms Audio</span>
          </div>
          <h3 class="text-xl font-bold text-white">Dr. Gulliver, MD</h3>
          <div class="text-xs text-amber-300 font-mono">Chief Co-Pilot • Diagnostics</div>
          <p class="text-xs text-stone-300 leading-relaxed">
            Conducts real-time, full-duplex verbal examinations over Gemini 2.5 Live audio streams. Synthesizes immediate differentials from ambient dialogue.
          </p>
        </div>
        <div class="pt-3 border-t border-stone-800 text-[11px] font-mono text-amber-400 font-bold">
          Gemini 2.5 Full-Duplex
        </div>
      </div>

      <!-- Agent 2: Sentinel, RN -->
      <div class="glass-card-dark p-7 rounded-3xl border border-rose-500/30 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-2 pt-2">
          <div class="flex items-center justify-between font-mono text-[10px]">
            <span class="text-rose-400 font-bold bg-rose-500/20 px-2 py-0.5 rounded">24/7 GUARD</span>
            <span class="text-stone-400">qSOFA Sepsis</span>
          </div>
          <h3 class="text-xl font-bold text-white">Sentinel, RN</h3>
          <div class="text-xs text-rose-300 font-mono">Triage Officer • Patient Safety</div>
          <p class="text-xs text-stone-300 leading-relaxed">
            Autonomous real-time watchtower. Monitors vitals streams, computes qSOFA sepsis scores, and intercepts dangerous drug-drug contraindications.
          </p>
        </div>
        <div class="pt-3 border-t border-stone-800 text-[11px] font-mono text-rose-400 font-bold">
          RxGuard &amp; ECG Safety Guard
        </div>
      </div>

      <!-- Agent 3: Dr. Karl Popper -->
      <div class="glass-card-dark p-7 rounded-3xl border border-purple-500/30 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-2 pt-2">
          <div class="flex items-center justify-between font-mono text-[10px]">
            <span class="text-purple-400 font-bold bg-purple-500/20 px-2 py-0.5 rounded">EPISTEMOLOGY</span>
            <span class="text-stone-400">RoB 2 &bull; H0</span>
          </div>
          <h3 class="text-xl font-bold text-white">Dr. Karl Popper</h3>
          <div class="text-xs text-purple-300 font-mono">Chief Auditor • Falsifiability</div>
          <p class="text-xs text-stone-300 leading-relaxed">
            Applies rigorous falsification protocols. Audits claims against Cochrane RoB 2 standards, tests null hypotheses ($H_0$), and prevents confirmation bias.
          </p>
        </div>
        <div class="pt-3 border-t border-stone-800 text-[11px] font-mono text-purple-400 font-bold">
          Popperian Skeptical HUD
        </div>
      </div>

      <!-- Agent 4: Alex Scribes, RHIA -->
      <div class="glass-card-dark p-7 rounded-3xl border border-teal-500/30 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-2 pt-2">
          <div class="flex items-center justify-between font-mono text-[10px]">
            <span class="text-teal-400 font-bold bg-teal-500/20 px-2 py-0.5 rounded">FHIR SYNC</span>
            <span class="text-stone-400">LOINC &bull; SNOMED</span>
          </div>
          <h3 class="text-xl font-bold text-white">Alex Scribes, RHIA</h3>
          <div class="text-xs text-teal-300 font-mono">Informaticist • EHR Integration</div>
          <p class="text-xs text-stone-300 leading-relaxed">
            Automated clinical scribe. Transforms unstructured bedside notes into FHIR R4 Bundles with DOMPurify sanitization and LOINC/SNOMED CT coding.
          </p>
        </div>
        <div class="pt-3 border-t border-stone-800 text-[11px] font-mono text-teal-400 font-bold">
          FHIR R4 Bundle Standard
        </div>
      </div>

      <!-- Agent 5: Dr. Vesalius -->
      <div class="glass-card-dark p-7 rounded-3xl border border-indigo-500/30 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-2 pt-2">
          <div class="flex items-center justify-between font-mono text-[10px]">
            <span class="text-indigo-400 font-bold bg-indigo-500/20 px-2 py-0.5 rounded">3D ENGINE</span>
            <span class="text-stone-400">Three.js PBR</span>
          </div>
          <h3 class="text-xl font-bold text-white">Dr. Vesalius</h3>
          <div class="text-xs text-indigo-300 font-mono">Chief Anatomist • Spatial Twin</div>
          <p class="text-xs text-stone-300 leading-relaxed">
            Transforms radiology reports and symptoms into a procedural 3D anatomical hologram with Edwin Smith codex PBR shaders and dermatome lenses.
          </p>
        </div>
        <div class="pt-3 border-t border-stone-800 text-[11px] font-mono text-indigo-400 font-bold">
          WebGL 3D Holography
        </div>
      </div>

      <!-- Agent 6: Dr. Chronos -->
      <div class="glass-card-dark p-7 rounded-3xl border border-emerald-500/30 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-2 pt-2">
          <div class="flex items-center justify-between font-mono text-[10px]">
            <span class="text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">CGM TELEMETRY</span>
            <span class="text-stone-400">Dexcom / Libre</span>
          </div>
          <h3 class="text-xl font-bold text-white">Dr. Chronos</h3>
          <div class="text-xs text-emerald-300 font-mono">Chronobiologist • Metabolism</div>
          <p class="text-xs text-stone-300 leading-relaxed">
            Specialist in continuous glucose Time-in-Range (TIR), glycemic variability metrics, circadian nutrient timing, and nocturnal autonomic recovery.
          </p>
        </div>
        <div class="pt-3 border-t border-stone-800 text-[11px] font-mono text-emerald-400 font-bold">
          CGM &amp; Circadian Rhythms
        </div>
      </div>

      <!-- Agent 7: Grace, FSA -->
      <div class="glass-card-dark p-7 rounded-3xl border border-amber-500/30 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-2 pt-2">
          <div class="flex items-center justify-between font-mono text-[10px]">
            <span class="text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded">QALY VAULT</span>
            <span class="text-stone-400">ICER Actuarial</span>
          </div>
          <h3 class="text-xl font-bold text-white">Grace, FSA</h3>
          <div class="text-xs text-amber-300 font-mono">Lead Actuary • Prior-Auth</div>
          <p class="text-xs text-stone-300 leading-relaxed">
            Computes Quality-Adjusted Life Years (QALY), calculates emergency cost avoidance, and compiles automated medical necessity prior-auth dossiers.
          </p>
        </div>
        <div class="pt-3 border-t border-stone-800 text-[11px] font-mono text-amber-400 font-bold">
          Prior-Auth in 30 Seconds
        </div>
      </div>

      <!-- Live Consult Bus Link -->
      <div class="geararts-card p-7 rounded-3xl text-stone-950 flex flex-col justify-between space-y-4 shadow-2xl">
        <div class="space-y-2">
          <span class="text-xs font-mono font-bold opacity-80 uppercase">⚡ Attending Room</span>
          <h3 class="text-2xl font-black">Join Live Faculty Consult</h3>
          <p class="text-xs font-medium leading-relaxed">
            Experience full-duplex verbal exams in real time over WebSocket audio streams on pocketgull.app.
          </p>
        </div>
        <a href="https://pocketgull.app" class="py-3 bg-stone-950 text-amber-400 font-bold text-xs text-center rounded-xl hover:bg-stone-900 transition block">
          Enter Faculty Room →
        </a>
      </div>

    </div>
  </section>

  <!-- ══ 3. CLINICAL TRIALS (DCT) & EPISTEMOLOGY FRAMEWORKS ═════════════════════ -->
  <section id="trials" class="space-y-12 py-6">
    <div class="text-center space-y-3 max-w-3xl mx-auto">
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold">
        <span>🧪 Clinical Research Trials &amp; DCT Ecosystem</span>
      </div>
      <h2 class="text-3xl sm:text-5xl font-extrabold text-white">
        Accelerating Trial Design, Screening &amp; Safety
      </h2>
      <p class="text-stone-300 text-sm sm:text-base leading-relaxed">
        How PocketGull's multi-agent swarm transforms decentralized clinical trials (DCT), synthetic control cohorts, and remote participant telemetry:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
      
      <!-- DCT 1 -->
      <div class="glass-card-dark p-8 rounded-3xl border border-teal-500/30 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-3 pt-2">
          <div class="text-xs font-mono text-teal-400 font-bold">ClinicalTrials.gov API v2</div>
          <h3 class="text-2xl font-bold text-white">Automated Participant Screening &amp; Matching</h3>
          <p class="text-xs text-stone-300 leading-relaxed">
            Instantly screens multi-hospital FHIR R4 records against complex inclusion/exclusion criteria. Reduces candidate identification cycles from 8 weeks to under 4 minutes.
          </p>
          <ul class="text-xs text-teal-300 space-y-1.5 font-mono">
            <li>✓ Multi-omic genomic exclusion checks</li>
            <li>✓ Washout period drug trace verification</li>
            <li>✓ 0% HIPAA PHI leakage risk</li>
          </ul>
        </div>
        <div class="p-3 bg-stone-900 rounded-xl border border-stone-800 text-[11px] text-stone-400">
          <strong class="text-amber-300">🎯 Jargon Buster:</strong> Finding clinical trials for rare conditions used to take doctors months. Our AI scans medical records securely and finds the exact right trials in 4 minutes.
        </div>
      </div>

      <!-- DCT 2 -->
      <div class="glass-card-dark p-8 rounded-3xl border border-amber-500/30 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-3 pt-2">
          <div class="text-xs font-mono text-amber-400 font-bold">Bayesian Digital Twin</div>
          <h3 class="text-2xl font-bold text-white">Synthetic Control Arms &amp; Placebo Reduction</h3>
          <p class="text-xs text-stone-300 leading-relaxed">
            Generates calibrated 4D physiological digital twin control trajectories using GroupKFold cross-validation, reducing human placebo participants by up to 35%.
          </p>
          <ul class="text-xs text-amber-300 space-y-1.5 font-mono">
            <li>✓ Monte Carlo trajectory modeling</li>
            <li>✓ Subgroup responder stratification</li>
            <li>✓ 35% Placebo participant reduction</li>
          </ul>
        </div>
        <div class="p-3 bg-stone-900 rounded-xl border border-stone-800 text-[11px] text-stone-400">
          <strong class="text-amber-300">🧬 Jargon Buster:</strong> Instead of giving half the sick children fake sugar pills, computer simulations of past patients act as the control group so more real people get the cure.
        </div>
      </div>

      <!-- DCT 3 -->
      <div class="glass-card-dark p-8 rounded-3xl border border-rose-500/30 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-3 pt-2">
          <div class="text-xs font-mono text-rose-400 font-bold">Sentinel Safety Guard</div>
          <h3 class="text-2xl font-bold text-white">Real-Time Adverse Event Interception</h3>
          <p class="text-xs text-stone-300 leading-relaxed">
            Continuously processes live wearable telemetry (CGM excursions, acoustic respiratory crackles, ECG QTc prolongation) to detect toxicities before Serious Adverse Events occur.
          </p>
          <ul class="text-xs text-rose-300 space-y-1.5 font-mono">
            <li>✓ Automated MedDRA classification</li>
            <li>✓ Sub-second anomaly telemetry alerts</li>
            <li>✓ 21 CFR Part 11 audit trails</li>
          </ul>
        </div>
        <div class="p-3 bg-stone-900 rounded-xl border border-stone-800 text-[11px] text-stone-400">
          <strong class="text-amber-300">🚨 Jargon Buster:</strong> Like a smart home smoke detector that senses overheating wires before a fire ever sparks, keeping trial participants 100% safe.
        </div>
      </div>

    </div>
  </section>

  <!-- ══ 4. EMPIRICAL REAL-WORLD CASE STUDIES ═══════════════════════════════════ -->
  <section id="cases" class="space-y-12 py-6">
    <div class="text-center space-y-3 max-w-3xl mx-auto">
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
        <span>📊 Empirical Clinical Case Studies</span>
      </div>
      <h2 class="text-3xl sm:text-5xl font-extrabold text-white">
        Evidence &amp; Health Trajectories in Action
      </h2>
      <p class="text-stone-300 text-sm sm:text-base leading-relaxed">
        Examining how PocketGull's multi-agent swarm and digital twin telemetry transform diagnostic resolution across complex multi-system conditions:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
      
      <!-- Case 1 -->
      <div class="glass-card-dark p-8 rounded-3xl border border-stone-800 space-y-4">
        <div class="flex justify-between items-center text-xs font-mono">
          <span class="text-amber-400 font-bold">Case Study 01</span>
          <span class="text-stone-400">Endocrine &amp; Autonomic</span>
        </div>
        <h3 class="text-xl font-bold text-white">Metabolic &amp; Autonomic Crisis Interception</h3>
        <div class="text-xs text-stone-400">Patient: Female, 48y &bull; Type 2 Diabetes &amp; Post-Viral POTS</div>
        <p class="text-xs text-stone-300 leading-relaxed">
          Suffered reactive hypoglycemia and severe postural tachycardia (HR spiking 68 ➔ 112 bpm on standing). Dr. Chronos cross-referenced raw CGM stream with meal logs, catching autonomic collapse.
        </p>
        <div class="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1 text-xs font-mono">
          <div class="text-emerald-400 font-bold">CGM Time-in-Range: 54% ➔ 91% (6 wks)</div>
          <div class="text-stone-400">Acute Care Savings: $18,400 (2 ER visits averted)</div>
        </div>
      </div>

      <!-- Case 2 -->
      <div class="glass-card-dark p-8 rounded-3xl border border-stone-800 space-y-4">
        <div class="flex justify-between items-center text-xs font-mono">
          <span class="text-teal-400 font-bold">Case Study 02</span>
          <span class="text-stone-400">Cardio &amp; Teledentistry</span>
        </div>
        <h3 class="text-xl font-bold text-white">Systemic Inflammatory Burden Cross-Talk</h3>
        <div class="text-xs text-stone-400">Patient: Male, 56y &bull; Refractory HTN &amp; Periodontitis</div>
        <p class="text-xs text-stone-300 leading-relaxed">
          Presented with refractory hypertension (148/94 mmHg) and elevated hs-CRP (4.8 mg/L). Dr. Vesalius rendered a 32-tooth odontogram uncovering oral P. gingivalis endotoxemia driving vascular stiffness.
        </p>
        <div class="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1 text-xs font-mono">
          <div class="text-emerald-400 font-bold">hs-CRP Reduction: 4.8 ➔ 1.1 mg/L (90 days)</div>
          <div class="text-stone-400">Blood Pressure: Normalized to 122/78 mmHg</div>
        </div>
      </div>

      <!-- Case 3 -->
      <div class="glass-card-dark p-8 rounded-3xl border border-stone-800 space-y-4">
        <div class="flex justify-between items-center text-xs font-mono">
          <span class="text-purple-400 font-bold">Case Study 03</span>
          <span class="text-stone-400">Genomics &amp; Pain</span>
        </div>
        <h3 class="text-xl font-bold text-white">Pharmacogenomic Root Cause &amp; Neuro-Modulation</h3>
        <div class="text-xs text-stone-400">Patient: Female, 39y &bull; Refractory Fibromyalgia</div>
        <p class="text-xs text-stone-300 leading-relaxed">
          6-year history of debilitating widespread pain and severe adverse toxicities across 4 successive antidepressants. Alex unified 12 years of records into FHIR R4, identifying CYP2D6 null alleles (*4/*4).
        </p>
        <div class="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1 text-xs font-mono">
          <div class="text-emerald-400 font-bold">Widespread Pain Index: 14/19 ➔ 3/19</div>
          <div class="text-stone-400">Annual Rx Savings: $8,200/yr in failed drugs</div>
        </div>
      </div>

    </div>
  </section>

  <!-- ══ 5. CLINICAL ACADEMY & CONTINUING EDUCATION ═════════════════════════════ -->
  <section id="academy" class="space-y-12 py-6">
    <div class="text-center space-y-3 max-w-3xl mx-auto">
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
        <span>🎓 Clinical Academy &amp; CME Masterclasses</span>
      </div>
      <h2 class="text-3xl sm:text-5xl font-extrabold text-white">
        Learn the Strategies Behind Preventive Healthcare
      </h2>
      <p class="text-stone-300 text-sm sm:text-base leading-relaxed">
        High-yield masterclasses designed for physicians, residents, nurse practitioners, caregivers, and everyday craftspeople:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
      
      <!-- Course 1 -->
      <div class="glass-card-dark p-7 rounded-3xl border border-teal-500/30 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-3 pt-2">
          <div class="flex items-center justify-between">
            <span class="text-2xl">🎙️</span>
            <span class="text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded">4 CME Credits</span>
          </div>
          <h3 class="text-xl font-bold text-white">Ambient AI Clinical Scribing &amp; FHIR R4</h3>
          <p class="text-xs text-stone-300 leading-relaxed">
            Master full-duplex voice dictation with Gemini 2.5 Flash, automated SOAP note generation, and cut charting time by 42%.
          </p>
        </div>
        <div class="space-y-3 border-t border-stone-800 pt-4">
          <div class="flex items-baseline justify-between text-xs font-mono">
            <span class="text-stone-400">4-Week Cohort</span>
            <span class="text-lg font-bold text-white">$199</span>
          </div>
          <button onclick="document.getElementById('pilotModal').classList.remove('hidden')" class="w-full py-2.5 rounded-xl geararts-card font-bold text-xs text-stone-950 hover:scale-[1.02] transition shadow-md cursor-pointer">
            Enroll in Masterclass →
          </button>
        </div>
      </div>

      <!-- Course 2 -->
      <div class="glass-card-dark p-7 rounded-3xl border border-rose-500/30 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-3 pt-2">
          <div class="flex items-center justify-between">
            <span class="text-2xl">❤️</span>
            <span class="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">Clinical Protocol</span>
          </div>
          <h3 class="text-xl font-bold text-white">Grassroots Cardiology &amp; Princeton III</h3>
          <p class="text-xs text-stone-300 leading-relaxed">
            Step-by-step protocols for intimacy clearance, 4-MET stair exertion testing, and post-cardiac event recovery for couples.
          </p>
        </div>
        <div class="space-y-3 border-t border-stone-800 pt-4">
          <div class="flex items-baseline justify-between text-xs font-mono">
            <span class="text-stone-400">2-Week Intensive</span>
            <span class="text-lg font-bold text-white">$149</span>
          </div>
          <button onclick="document.getElementById('pilotModal').classList.remove('hidden')" class="w-full py-2.5 rounded-xl geararts-card font-bold text-xs text-stone-950 hover:scale-[1.02] transition shadow-md cursor-pointer">
            Enroll in Masterclass →
          </button>
        </div>
      </div>

      <!-- Course 3 -->
      <div class="glass-card-dark p-7 rounded-3xl border border-amber-500/30 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-3 pt-2">
          <div class="flex items-center justify-between">
            <span class="text-2xl">🫘</span>
            <span class="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">Nephrology Focus</span>
          </div>
          <h3 class="text-xl font-bold text-white">Renal Protection &amp; $100k Dialysis Aversion</h3>
          <p class="text-xs text-stone-300 leading-relaxed">
            Early microvascular screening, tight morning BP pacing, and dietary strategies to halt nephron decline before dialysis.
          </p>
        </div>
        <div class="space-y-3 border-t border-stone-800 pt-4">
          <div class="flex items-baseline justify-between text-xs font-mono">
            <span class="text-stone-400">Self-Paced Video</span>
            <span class="text-lg font-bold text-white">$99</span>
          </div>
          <button onclick="document.getElementById('pilotModal').classList.remove('hidden')" class="w-full py-2.5 rounded-xl geararts-card font-bold text-xs text-stone-950 hover:scale-[1.02] transition shadow-md cursor-pointer">
            Enroll in Masterclass →
          </button>
        </div>
      </div>

      <!-- Course 4 -->
      <div class="glass-card-dark p-7 rounded-3xl border border-purple-500/30 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-3 pt-2">
          <div class="flex items-center justify-between">
            <span class="text-2xl">🛠️</span>
            <span class="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">Trades &amp; Craft</span>
          </div>
          <h3 class="text-xl font-bold text-white">Workshop Ergonomics &amp; Joint Health (M17.9)</h3>
          <p class="text-xs text-stone-300 leading-relaxed">
            Custom bench heights, adaptive grip aids, and pacing methods to keep carpenters, gardeners, and mechanics working pain-free.
          </p>
        </div>
        <div class="space-y-3 border-t border-stone-800 pt-4">
          <div class="flex items-baseline justify-between text-xs font-mono">
            <span class="text-stone-400">3-Week Workshop</span>
            <span class="text-lg font-bold text-white">$129</span>
          </div>
          <button onclick="document.getElementById('pilotModal').classList.remove('hidden')" class="w-full py-2.5 rounded-xl geararts-card font-bold text-xs text-stone-950 hover:scale-[1.02] transition shadow-md cursor-pointer">
            Enroll in Masterclass →
          </button>
        </div>
      </div>

    </div>
  </section>

  <!-- ══ 6. PHIL GEAR :) — SOLO CREATOR & OPEN SCIENCE ARCHITECT ════════════════ -->
  <section id="developer" class="glass-card-dark p-8 sm:p-12 rounded-3xl border-2 border-amber-500/40 shadow-2xl relative overflow-hidden max-w-5xl mx-auto space-y-8">
    <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
    
    <div class="space-y-4 pt-2 text-center sm:text-left">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-bold">
        <span>🌿 The Human Element Behind the Code</span>
      </div>
      <h2 class="text-3xl sm:text-4xl font-extrabold text-white">
        Built by a Solo Developer with Care
      </h2>
      <div class="text-stone-400 text-sm font-mono">
        Phil Gear :) &bull; Founder, Solo Engineer &amp; Open Science Researcher
      </div>
    </div>

    <!-- Personal Quote Callout -->
    <blockquote class="p-6 bg-stone-900/90 rounded-2xl border-l-4 border-amber-400 text-stone-200 text-base sm:text-lg italic leading-relaxed">
      "I built PocketGull because I just wanted to help others—even if it cost me just about everything. True medical intelligence and human healing should never be gated behind corporate bureaucracy or predatory paywalls."
      <span class="block mt-2 text-xs font-mono not-italic text-amber-300">— Phil Gear :)</span>
    </blockquote>

    <div class="text-stone-300 text-sm leading-relaxed space-y-3 font-normal">
      <p>
        When someone is navigating a frightening diagnosis or when a clinician is drowning in after-hours charting, they don't need another noisy 40-tab enterprise dashboard. They need quiet clarity, rigorous Level A trial evidence, and technology that listens without getting in the way of human empathy.
      </p>
      <p>
        I am working on this with the best of intentions: to help people live longer, healthier lives, discover daily joy, and have the vitality and peace of mind to create art.
      </p>
    </div>

    <!-- Verified Open Science Partner Registries -->
    <div class="pt-6 border-t border-stone-800 space-y-3">
      <div class="text-xs font-mono text-stone-400 uppercase font-bold">Verified Open Science Registries &amp; Accreditations:</div>
      <div class="flex flex-wrap gap-2 text-xs font-mono">
        <a href="https://doi.org/10.5281/zenodo.20647514" target="_blank" rel="noopener" class="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-teal-300 rounded-lg border border-stone-800 transition">
          🌌 Zenodo / CERN Archive (DOI: 10.5281/zenodo.20647514)
        </a>
        <a href="https://npiregistry.cms.hhs.gov/provider-view/1487569752" target="_blank" rel="noopener" class="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-lg border border-stone-800 transition">
          🏥 CMS NPI: 1487569752 (Health Informatics)
        </a>
        <a href="https://orcid.org/0009-0008-1372-5381" target="_blank" rel="noopener" class="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-rose-300 rounded-lg border border-stone-800 transition">
          🆔 ORCID: 0009-0008-1372-5381
        </a>
        <a href="https://github.com/pocketgull-app/pocketgull" target="_blank" rel="noopener" class="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg border border-stone-800 transition">
          🐙 GitHub: pocketgull-app/pocketgull
        </a>
      </div>
    </div>
  </section>

  <!-- ══ 7. INBOUND KNOWLEDGE BASE & ARTICLES BY PHIL ═══════════════════════════ -->
  <section id="articles" class="space-y-8 border-t border-stone-800 pt-16">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-800 pb-5">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
          <span>📰 Inbound Clinical Knowledge Hub</span>
        </div>
        <h2 class="text-2xl sm:text-4xl font-extrabold text-white mt-2">
          Latest Health Literacy &amp; Prevention Articles
        </h2>
      </div>
      <span class="text-xs text-stone-400 font-mono">Authored by Phil</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <?php
      $recent_posts = new WP_Query( array(
        'posts_per_page' => 6,
        'post_status'    => 'publish'
      ) );

      if ( $recent_posts->have_posts() ) :
        while ( $recent_posts->have_posts() ) : $recent_posts->the_post(); ?>
          <article class="glass-card-dark p-7 rounded-3xl transition duration-300 hover:border-amber-400/60 flex flex-col justify-between space-y-6 group shadow-xl relative overflow-hidden">
            <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
            <div class="space-y-4 pt-2">
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                  SNO-10 Guide
                </span>
                <span class="text-stone-400">⏱️ <?php echo pocketgull_get_reading_time( get_the_ID() ); ?>m read</span>
              </div>
              <h3 class="text-xl font-bold text-white group-hover:text-amber-300 transition leading-snug">
                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
              </h3>
              <p class="text-sm text-stone-300 leading-relaxed line-clamp-3">
                <?php echo wp_trim_words( get_the_excerpt(), 25 ); ?>
              </p>
            </div>
            <div class="pt-5 border-t border-stone-800 flex items-center justify-between text-xs font-mono">
              <span class="text-stone-200 font-bold">✍️ Phil</span>
              <span class="text-stone-400"><?php echo get_the_date( 'M j, Y' ); ?></span>
            </div>
          </article>
        <?php endwhile;
        wp_reset_postdata();
      endif; ?>
    </div>
  </section>

</main>

<!-- ══ 8. 14-DAY FREE CLINICAL PILOT BOOKING MODAL ════════════════════════════ -->
<div id="pilotModal" class="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 hidden">
  <div class="glass-card-dark rounded-3xl max-w-lg w-full p-8 border-2 border-amber-400 shadow-2xl relative overflow-hidden space-y-6">
    <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
    
    <div class="flex justify-between items-center pt-2">
      <div>
        <div class="text-xs font-mono font-bold text-amber-400 uppercase">14-Day Practice Pilot</div>
        <h3 class="text-2xl font-bold text-white">Start Your Free Pilot</h3>
      </div>
      <button onclick="document.getElementById('pilotModal').classList.add('hidden')" class="text-stone-400 hover:text-white text-xl cursor-pointer">✕</button>
    </div>

    <form class="space-y-4" onsubmit="event.preventDefault(); alert('Pilot request received! Welcome to PocketGull.'); document.getElementById('pilotModal').classList.add('hidden');">
      <div>
        <label class="block text-xs font-mono text-stone-300 mb-1">Your Full Name &amp; Title</label>
        <input type="text" required placeholder="Dr. Jane Smith, MD" class="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-400 focus:outline-hidden" />
      </div>

      <div>
        <label class="block text-xs font-mono text-stone-300 mb-1">Work / Clinical Email</label>
        <input type="email" required placeholder="jane@clinicpractice.com" class="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-400 focus:outline-hidden" />
      </div>

      <div>
        <label class="block text-xs font-mono text-stone-300 mb-1">Practice Size &amp; Specialty</label>
        <select class="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-300 text-sm focus:border-amber-400 focus:outline-hidden">
          <option>Solo Practice (1 Provider)</option>
          <option>Group Practice (2–5 Providers)</option>
          <option>Multi-Specialty Clinic (6–20 Providers)</option>
          <option>Health System / Residency Program</option>
        </select>
      </div>

      <button type="submit" class="w-full py-3 rounded-xl geararts-card font-bold text-stone-950 text-sm hover:scale-[1.02] transition shadow-lg cursor-pointer">
        Activate 14-Day Free Pilot →
      </button>
      <div class="text-[10px] text-center text-stone-400 font-mono">Zero credit card required &bull; HIPAA §164.514 compliant</div>
    </form>
  </div>
</div>

<?php get_footer(); ?>
