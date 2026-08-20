<?php
/**
 * Front Page Template for WordPress Theme (pocketgull.com)
 * Enhanced with DESIGN.md & GREATER_GOOD_CHARTER.md Systems
 *
 * @package PocketGull_Articles
 */

get_header(); ?>

<main class="relative z-10 flex-grow space-y-24 py-12 px-4 sm:px-6 max-w-7xl mx-auto">

  <!-- ══ 1. Hero & Handcrafted GEARARTS Card with Rams Grill ════════════════════ -->
  <section class="text-center max-w-5xl mx-auto pt-6 pb-8">
    
    <!-- Top Announcement Pill -->
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold mb-8 shadow-sm">
      <span class="animate-pulse">✨</span>
      <span>Enterprise Clinical Intelligence SaaS • 14-Day Free Pilot</span>
      <span class="text-stone-500">|</span>
      <span class="text-teal-400">HIPAA Safe Harbor &amp; FHIR R4</span>
    </div>

    <!-- Handcrafted GEARARTS Card with Dieter Rams Precision Grill -->
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
          Clinical Intelligence &amp; Preventive Strategy Engine
        </div>
      </div>
    </div>

    <!-- Main Value Proposition Headline (UI Sans-Serif) -->
    <h1 class="text-4xl sm:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto">
      Reclaim <span class="text-teal-400 marker-underline">2.4 Hours</span> Every Day with the Clinical AI Co-Pilot.
    </h1>

    <p class="text-lg sm:text-2xl text-stone-300 mb-10 max-w-3xl mx-auto leading-relaxed font-normal">
      PocketGull automates EHR charting, ambient patient scribing, and complex care plans using <strong class="text-amber-300">Google Gemini 2.5</strong> and the <strong class="text-teal-300">PocketGull Typeface</strong>—slashing administrative burnout by <strong class="text-rose-400">42%</strong>.
    </p>

    <!-- Primary Conversion CTA Buttons -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
      <a href="https://pocketgull.app" class="w-full sm:w-auto px-8 py-4 rounded-2xl geararts-card text-lg text-stone-950 font-extrabold transition-all hover:scale-105 hover:shadow-amber-500/50 flex items-center justify-center gap-2 shadow-xl cursor-pointer">
        <span>Start 14-Day Clinical Pilot</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      </a>
      <a href="#prevention-avenues" class="w-full sm:w-auto px-7 py-4 rounded-2xl glass-card-dark text-stone-200 text-lg font-bold hover:text-white hover:border-amber-400/60 transition-all flex items-center justify-center gap-2">
        <span>Explore Preventive Avenues</span>
        <span>↓</span>
      </a>
    </div>

    <!-- Trust Badges & Metrics -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left font-mono text-xs">
      <div class="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1">
        <div class="text-2xl font-bold text-amber-300">42%</div>
        <div class="text-stone-400">Less Charting Time</div>
      </div>
      <div class="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1">
        <div class="text-2xl font-bold text-teal-300">FHIR R4</div>
        <div class="text-stone-400">Epic / Athena Sync</div>
      </div>
      <div class="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1">
        <div class="text-2xl font-bold text-rose-300">$64K/yr</div>
        <div class="text-stone-400">Saved per Provider</div>
      </div>
      <div class="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1">
        <div class="text-2xl font-bold text-emerald-300">SNO-10</div>
        <div class="text-stone-400">Preventive Crosswalks</div>
      </div>
    </div>

  </section>

  <!-- ══ 2. 5 Core Avenues of Preventive Medicine ════════════════════════════════ -->
  <section id="prevention-avenues" class="space-y-12 py-6">
    <div class="text-center space-y-3 max-w-3xl mx-auto">
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-mono font-bold">
        <span>🌿 Proactive &amp; Grassroots Care</span>
      </div>
      <h2 class="text-3xl sm:text-5xl font-extrabold text-white">
        Five Avenues of Preventive Health
      </h2>
      <p class="text-stone-300 text-sm sm:text-base leading-relaxed">
        Empowering providers, individuals, and families to address root causes before they turn into costly hospitalizations.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      
      <!-- Avenue 1: Cardiovascular & Exertion Safety -->
      <div class="glass-card-dark p-8 rounded-3xl border border-rose-500/30 hover:border-rose-400 transition-all flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-3 pt-2">
          <div class="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-2xl">
            ❤️
          </div>
          <h3 class="text-2xl font-bold text-white">Cardiovascular &amp; Intimacy Safety</h3>
          <p class="text-xs text-stone-300 leading-relaxed">
            Applies Princeton Consensus III cardiology benchmarks (2 flights of stairs / 4 METs) so patients can safely return to physical connection and daily exercise after a cardiac event.
          </p>
        </div>
        <div class="pt-4 border-t border-stone-800 text-[11px] font-mono text-rose-300 font-semibold">
          • MET Capacity Stratification &bull; Pacing Budgets
        </div>
      </div>

      <!-- Avenue 2: Renal Protection & Blood Pressure -->
      <div class="glass-card-dark p-8 rounded-3xl border border-amber-500/30 hover:border-amber-400 transition-all flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-3 pt-2">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl">
            🫘
          </div>
          <h3 class="text-2xl font-bold text-white">Renal Protection ($100k Dialysis Aversion)</h3>
          <p class="text-xs text-stone-300 leading-relaxed">
            Catches hypertension and glomerular microvascular strain early—protecting kidney filtration and preventing the catastrophic $100k/year burden of Medicare dialysis.
          </p>
        </div>
        <div class="pt-4 border-t border-stone-800 text-[11px] font-mono text-amber-300 font-semibold">
          • ICD-10 I10 &bull; Glomerular Health
        </div>
      </div>

      <!-- Avenue 3: Occupational & Trade Ergonomics -->
      <div class="glass-card-dark p-8 rounded-3xl border border-teal-500/30 hover:border-teal-400 transition-all flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-3 pt-2">
          <div class="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-2xl">
            🛠️
          </div>
          <h3 class="text-2xl font-bold text-white">Workshop &amp; Joint Ergonomics</h3>
          <p class="text-xs text-stone-300 leading-relaxed">
            Helps carpenters, mechanics, and gardeners with osteoarthritis (M17.9) or post-joint replacement modify their physical setups to keep doing their crafts pain-free.
          </p>
        </div>
        <div class="pt-4 border-t border-stone-800 text-[11px] font-mono text-teal-300 font-semibold">
          • Occupational Therapy &bull; Adaptive Grips
        </div>
      </div>

      <!-- Avenue 4: Polypharmacy & Drug-Herb Interlocks -->
      <div class="glass-card-dark p-8 rounded-3xl border border-purple-500/30 hover:border-purple-400 transition-all flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-3 pt-2">
          <div class="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl">
            🛡️
          </div>
          <h3 class="text-2xl font-bold text-white">RxGuard Polypharmacy Safety</h3>
          <p class="text-xs text-stone-300 leading-relaxed">
            Guards against dangerous botanical-drug interactions (such as Nitrates + PDE-5 inhibitors or St. John's Wort + SSRIs) and CYP450 metabolism collisions.
          </p>
        </div>
        <div class="pt-4 border-t border-stone-800 text-[11px] font-mono text-purple-300 font-semibold">
          • Rule dhi-007 &bull; Washout Intervals
        </div>
      </div>

      <!-- Avenue 5: Bereavement & Craft Continuity -->
      <div class="glass-card-dark p-8 rounded-3xl border border-emerald-500/30 hover:border-emerald-400 transition-all flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-3 pt-2">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl">
            🤝
          </div>
          <h3 class="text-2xl font-bold text-white">Craft Confidants &amp; Social Prescribing</h3>
          <p class="text-xs text-stone-300 leading-relaxed">
            Supports individuals experiencing grief or loneliness by encouraging craft continuity, picking up a loved one's tools, and connecting with local Men's Sheds and community gardens.
          </p>
        </div>
        <div class="pt-4 border-t border-stone-800 text-[11px] font-mono text-emerald-300 font-semibold">
          • SNOMED 399269003 &bull; Social Health
        </div>
      </div>

      <!-- Avenue 6: Plain-Language Patient Health Literacy -->
      <div class="glass-card-dark p-8 rounded-3xl border border-blue-500/30 hover:border-blue-400 transition-all flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-3 pt-2">
          <div class="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-2xl">
            📖
          </div>
          <h3 class="text-2xl font-bold text-white">Grade 6.2 Health Literacy</h3>
          <p class="text-xs text-stone-300 leading-relaxed">
            Translates complex lab values and discharge summaries into crystal-clear plain language, Socratic inquiries, and Section 1557 ACA multilingual instructions.
          </p>
        </div>
        <div class="pt-4 border-t border-stone-800 text-[11px] font-mono text-blue-300 font-semibold">
          • Optotypic Legibility &bull; WCAG AAA
        </div>
      </div>

    </div>
  </section>

  <!-- ══ 3. Greater Good Charter: 50-30-20 Philanthropic Split ═════════════════ -->
  <section class="glass-card-dark rounded-3xl p-8 sm:p-12 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden">
    <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
    <div class="max-w-4xl mx-auto space-y-8 pt-2">
      <div class="text-center space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
          <span>🏛️ Public Benefit &amp; Ethical Governance</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white">
          The Greater Good Charter &amp; 50-30-20 Covenant
        </h2>
        <p class="text-sm sm:text-base text-stone-400">
          We believe health intelligence belongs to humanity. Every SaaS subscription dollar is automatically shared through our philanthropic split:
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left">
        
        <div class="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
          <div class="text-3xl font-black text-emerald-400">50%</div>
          <div class="font-bold text-white text-base">Open Science &amp; Public Health R&amp;D</div>
          <p class="text-xs text-stone-400 leading-relaxed">
            Direct funding for open-source clinical AI models, PubMed meta-analyses, and public health research.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
          <div class="text-3xl font-black text-teal-400">30%</div>
          <div class="font-bold text-white text-base">Underserved Access Fund</div>
          <p class="text-xs text-stone-400 leading-relaxed">
            Subsidizes PocketGull clinical licenses for rural clinics, free community health centers, and uninsured patients globally.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
          <div class="text-3xl font-black text-amber-400">20%</div>
          <div class="font-bold text-white text-base">Platform Resilience &amp; Ops</div>
          <p class="text-xs text-stone-400 leading-relaxed">
            Covers green scale-to-zero GCP infrastructure, independent security audits, and developer stewardship.
          </p>
        </div>

      </div>
    </div>
  </section>

  <!-- ══ 4. Interactive SaaS ROI Calculator ════════════════════════════════════ -->
  <section class="glass-card-dark rounded-3xl p-8 sm:p-12 border-2 border-amber-500/40 shadow-2xl relative overflow-hidden">
    <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
    <div class="max-w-4xl mx-auto space-y-8 pt-2">
      <div class="text-center space-y-2">
        <div class="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">Economic Impact</div>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white">
          Calculate Your Clinic's Annual ROI
        </h2>
        <p class="text-sm sm:text-base text-stone-400">
          See how much clinical revenue and unbilled charting hours PocketGull saves your practice.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
        <!-- Sliders -->
        <div class="space-y-6">
          <div>
            <div class="flex justify-between text-xs font-mono text-stone-300 mb-2">
              <span>Number of Clinicians in Practice:</span>
              <strong id="clinicianCountDisplay" class="text-amber-300 text-sm">3 Providers</strong>
            </div>
            <input type="range" id="clinicianSlider" min="1" max="25" value="3" class="w-full accent-amber-400 cursor-pointer" />
          </div>

          <div>
            <div class="flex justify-between text-xs font-mono text-stone-300 mb-2">
              <span>Avg. Daily Patient Encounters per Provider:</span>
              <strong id="patientCountDisplay" class="text-teal-300 text-sm">18 Patients/day</strong>
            </div>
            <input type="range" id="patientSlider" min="8" max="40" value="18" class="w-full accent-teal-400 cursor-pointer" />
          </div>
        </div>

        <!-- Calculated Output Card -->
        <div class="geararts-card rounded-2xl p-6 sm:p-8 text-stone-950 space-y-4 shadow-xl border border-amber-200/60">
          <div class="text-xs font-bold uppercase tracking-wider opacity-80">Projected Annual Practice Savings</div>
          <div id="totalSavingsDisplay" class="text-4xl sm:text-5xl font-black tracking-tight">
            $194,400 / yr
          </div>
          <div class="text-xs font-medium space-y-1 opacity-90 border-t border-stone-950/20 pt-3">
            <div>⏱️ Reclaims <strong id="hoursReclaimedDisplay">1,728 hours</strong> of personal time annually.</div>
            <div>📋 Eliminates ~<strong id="chartsAutomatedDisplay">12,960 charting steps</strong>.</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ══ 5. Commercial SaaS Pricing & Packaging ═════════════════════════════════ -->
  <section id="pricing" class="space-y-12 py-8">
    <div class="text-center space-y-3 max-w-3xl mx-auto">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">Transparent SaaS Subscriptions</div>
      <h2 class="text-3xl sm:text-5xl font-extrabold text-white">
        Simple, Predictable Plans for Every Practice
      </h2>
      <p class="text-stone-300 text-sm sm:text-base">
        All plans include a 14-day free trial, ambient scribing, and HIPAA Safe Harbor de-identification.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
      
      <!-- Tier 1: Solo Clinician -->
      <div class="glass-card-dark p-8 rounded-3xl border border-stone-800 flex flex-col justify-between space-y-8 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-4 pt-2">
          <div class="text-xs font-bold text-stone-400 uppercase font-mono">Solo Practitioner</div>
          <h3 class="text-2xl font-bold text-white">Practice Starter</h3>
          <div class="flex items-baseline gap-1">
            <span class="text-4xl font-extrabold text-white">$99</span>
            <span class="text-xs text-stone-400 font-mono">/ provider / month</span>
          </div>
          <p class="text-xs text-stone-400 leading-relaxed">
            Ideal for independent physicians, integrative therapists, and solo functional medicine providers.
          </p>

          <ul class="space-y-2.5 text-xs text-stone-300 border-t border-stone-800 pt-4">
            <li class="flex items-center gap-2">✓ Unlimited Ambient Scribe Consults</li>
            <li class="flex items-center gap-2">✓ Gemini 2.5 Flash Live Streaming</li>
            <li class="flex items-center gap-2">✓ SNO-10 Patient Education Cards</li>
            <li class="flex items-center gap-2">✓ PDF &amp; FHIR R4 Bundle Export</li>
          </ul>
        </div>

        <a href="https://pocketgull.app" class="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-center font-bold text-xs transition block">
          Start Solo Pilot
        </a>
      </div>

      <!-- Tier 2: Group Clinic (Featured) -->
      <div class="glass-card-dark p-8 sm:p-10 rounded-3xl border-2 border-amber-400 flex flex-col justify-between space-y-8 shadow-2xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full geararts-card text-stone-950 text-[10px] font-bold uppercase tracking-wider shadow-md">
          Most Popular for Clinics
        </div>

        <div class="space-y-4 pt-4">
          <div class="text-xs font-bold text-amber-300 uppercase font-mono">Group Practices &amp; Clinics</div>
          <h3 class="text-3xl font-extrabold text-white">Practice Pro</h3>
          <div class="flex items-baseline gap-1">
            <span class="text-5xl font-black text-amber-300">$349</span>
            <span class="text-xs text-stone-300 font-mono">/ clinic / month</span>
          </div>
          <p class="text-xs text-stone-300 leading-relaxed">
            Covers up to 5 clinicians with shared colleague consult rooms, RxGuard, and prior-auth acceleration.
          </p>

          <ul class="space-y-2.5 text-xs text-stone-200 border-t border-stone-800 pt-4">
            <li class="flex items-center gap-2">✓ Everything in Practice Starter</li>
            <li class="flex items-center gap-2">✓ Up to 5 Provider Seats Included</li>
            <li class="flex items-center gap-2">✓ RxGuard PGx &amp; Herbal Contraindications</li>
            <li class="flex items-center gap-2">✓ 3D Holographic Anatomy Viewer</li>
            <li class="flex items-center gap-2">✓ Real-Time Team Collaboration Rooms</li>
          </ul>
        </div>

        <a href="https://pocketgull.app" class="w-full py-3.5 rounded-xl geararts-card text-stone-950 text-center font-black text-sm transition hover:scale-105 shadow-xl block">
          Get Started with Pro
        </a>
      </div>

      <!-- Tier 3: Enterprise Health System -->
      <div class="glass-card-dark p-8 rounded-3xl border border-stone-800 flex flex-col justify-between space-y-8 shadow-xl relative overflow-hidden">
        <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
        <div class="space-y-4 pt-2">
          <div class="text-xs font-bold text-teal-400 uppercase font-mono">Health Systems &amp; ACOs</div>
          <h3 class="text-2xl font-bold text-white">Enterprise System</h3>
          <div class="flex items-baseline gap-1">
            <span class="text-4xl font-extrabold text-teal-300">Custom</span>
            <span class="text-xs text-stone-400 font-mono">/ annual contract</span>
          </div>
          <p class="text-xs text-stone-400 leading-relaxed">
            For hospital networks, ACOs, and residency programs requiring custom EHR integration and dedicated VPCs.
          </p>

          <ul class="space-y-2.5 text-xs text-stone-300 border-t border-stone-800 pt-4">
            <li class="flex items-center gap-2">✓ Unlimited Clinicians &amp; Departments</li>
            <li class="flex items-center gap-2">✓ Direct Epic / Cerner / Athena FHIR Sync</li>
            <li class="flex items-center gap-2">✓ Dedicated GCP Cloud Run VPC &amp; BAA</li>
            <li class="flex items-center gap-2">✓ Custom Medical Knowledge Base RAG</li>
            <li class="flex items-center gap-2">✓ 24/7 Dedicated Clinical SLA</li>
          </ul>
        </div>

        <a href="mailto:enterprise@pocketgull.com" class="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-center font-bold text-xs transition block">
          Contact Enterprise Sales
        </a>
      </div>

    </div>
  </section>

  <!-- ══ 6. Inbound Knowledge Base & Articles by Phil ═══════════════════════════ -->
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

<!-- Interactive ROI Calculator Script -->
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const clinicianSlider = document.getElementById('clinicianSlider');
    const patientSlider = document.getElementById('patientSlider');
    const clinicianDisplay = document.getElementById('clinicianCountDisplay');
    const patientDisplay = document.getElementById('patientCountDisplay');
    const totalSavings = document.getElementById('totalSavingsDisplay');
    const hoursReclaimed = document.getElementById('hoursReclaimedDisplay');
    const chartsAutomated = document.getElementById('chartsAutomatedDisplay');

    if (!clinicianSlider || !patientSlider || !totalSavings) return;

    function recalculate() {
      const clinicians = parseInt(clinicianSlider.value, 10);
      const patientsPerDay = parseInt(patientSlider.value, 10);

      clinicianDisplay.textContent = clinicians === 1 ? '1 Provider' : `${clinicians} Providers`;
      patientDisplay.textContent = `${patientsPerDay} Patients/day`;

      const annualHoursSavedPerDoc = 2.4 * 240;
      const totalHours = Math.round(annualHoursSavedPerDoc * clinicians);
      const annualDollarSavings = totalHours * 150;
      const totalCharts = Math.round(clinicians * patientsPerDay * 240);

      totalSavings.textContent = `$${annualDollarSavings.toLocaleString()} / yr`;
      hoursReclaimed.textContent = `${totalHours.toLocaleString()} hours`;
      chartsAutomated.textContent = `${totalCharts.toLocaleString()} encounters`;
    }

    clinicianSlider.addEventListener('input', recalculate);
    patientSlider.addEventListener('input', recalculate);
  });
</script>

<?php get_footer(); ?>
