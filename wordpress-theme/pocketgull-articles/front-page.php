<?php
/**
 * Front Page Template for WordPress Theme (pocketgull.com)
 * All-Out Interactive B2B SaaS Sales Engine & Clinical Demonstration Hub
 *
 * @package PocketGull_Articles
 */

get_header(); ?>

<main class="relative z-10 flex-grow space-y-28 py-12 px-4 sm:px-6 max-w-7xl mx-auto">

  <!-- ══ 1. Hero & Handcrafted GEARARTS Card with Rams Grill ════════════════════ -->
  <section class="text-center max-w-5xl mx-auto pt-6 pb-8">
    
    <!-- Top Circadian Resonance Indicator -->
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold mb-8 shadow-sm">
      <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
      <span>Live AI Clinical Intelligence • 14-Day Free Practice Pilot</span>
      <span class="text-stone-500">|</span>
      <span class="text-teal-400">HIPAA §164.514 &amp; FHIR R4 Compliant</span>
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
          Clinical Intelligence Strategy Engine
        </div>
      </div>
    </div>

    <!-- Main Value Proposition Headline -->
    <h1 class="text-4xl sm:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto">
      Reclaim <span class="text-teal-400 marker-underline">2.4 Hours</span> Every Day with the Clinical AI Co-Pilot.
    </h1>

    <p class="text-lg sm:text-2xl text-stone-300 mb-10 max-w-3xl mx-auto leading-relaxed font-normal">
      PocketGull automates ambient scribing, EHR charting, and preventive care strategies using <strong class="text-amber-300">Google Gemini 2.5</strong> and the <strong class="text-teal-300">PocketGull Typeface</strong>—slashing administrative burnout by <strong class="text-rose-400">42%</strong>.
    </p>

    <!-- Primary Conversion CTA Buttons -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
      <button onclick="document.getElementById('pilotModal').classList.remove('hidden')" class="w-full sm:w-auto px-8 py-4 rounded-2xl geararts-card text-lg text-stone-950 font-extrabold transition-all hover:scale-105 hover:shadow-amber-500/50 flex items-center justify-center gap-2 shadow-xl cursor-pointer">
        <span>Start 14-Day Clinical Pilot</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      </button>
      <a href="#interactive-simulator" class="w-full sm:w-auto px-7 py-4 rounded-2xl glass-card-dark text-stone-200 text-lg font-bold hover:text-white hover:border-amber-400/60 transition-all flex items-center justify-center gap-2">
        <span>Try Live AI Simulator</span>
        <span>⚡</span>
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

  <!-- ══ 2. INTERACTIVE LIVE EXAM ROOM AI SCRIBE SIMULATOR ═══════════════════════ -->
  <section id="interactive-simulator" class="glass-card-dark rounded-3xl p-8 sm:p-12 border-2 border-teal-500/40 shadow-2xl relative overflow-hidden space-y-8">
    <div class="rams-grill"><div></div><div></div><div></div><div></div></div>
    
    <div class="max-w-4xl mx-auto text-center space-y-3 pt-2">
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold">
        <span>⚡ Interactive Live Demonstration</span>
      </div>
      <h2 class="text-3xl sm:text-5xl font-extrabold text-white">
        Experience the Ambient Clinical Scribe
      </h2>
      <p class="text-stone-300 text-sm sm:text-base leading-relaxed">
        Click a clinical encounter below to simulate Gemini 2.5 Flash listening, extracting clinical entities, checking RxGuard drug safety, and creating a structured FHIR R4 care plan in real time:
      </p>
    </div>

    <!-- Scenario Selector Buttons -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
      <button id="scenarioBtn1" class="scenario-btn active p-4 rounded-2xl bg-stone-900/90 border-2 border-teal-400 text-left transition cursor-pointer flex flex-col justify-between space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xl">❤️</span>
          <span class="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">Princeton III</span>
        </div>
        <div class="font-bold text-white text-sm">Cardiac &amp; Exertion Safety</div>
        <div class="text-[11px] text-stone-400">4 METs / 2 flights of stairs</div>
      </button>

      <button id="scenarioBtn2" class="scenario-btn p-4 rounded-2xl bg-stone-900/90 border border-stone-800 text-left transition cursor-pointer flex flex-col justify-between space-y-2 hover:border-amber-400">
        <div class="flex items-center justify-between">
          <span class="text-xl">🫘</span>
          <span class="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">Nephrology</span>
        </div>
        <div class="font-bold text-white text-sm">Renal &amp; BP Protection</div>
        <div class="text-[11px] text-stone-400">$100k Dialysis Aversion</div>
      </button>

      <button id="scenarioBtn3" class="scenario-btn p-4 rounded-2xl bg-stone-900/90 border border-stone-800 text-left transition cursor-pointer flex flex-col justify-between space-y-2 hover:border-teal-400">
        <div class="flex items-center justify-between">
          <span class="text-xl">🛠️</span>
          <span class="text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded">Ergonomics</span>
        </div>
        <div class="font-bold text-white text-sm">Joint &amp; Craft Continuity</div>
        <div class="text-[11px] text-stone-400">Osteoarthritis M17.9</div>
      </button>
    </div>

    <!-- Live Scribe Output Console -->
    <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-950/90 p-6 sm:p-8 rounded-2xl border border-stone-800 text-xs">
      
      <!-- Left: Audio Stream & Transcription -->
      <div class="space-y-4 border-b md:border-b-0 md:border-r border-stone-800 pb-6 md:pb-0 md:pr-6">
        <div class="flex items-center justify-between font-mono">
          <div class="flex items-center gap-2 text-teal-400 font-bold">
            <span class="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
            <span>LIVE AUDIO TRANSCRIPT</span>
          </div>
          <span id="scribeTimer" class="text-stone-500">00:08s</span>
        </div>

        <!-- Audio Waveform Mockup -->
        <div class="flex items-center gap-1 h-6 px-3 bg-stone-900 rounded-lg overflow-hidden">
          <div class="w-1 bg-teal-400 h-2 animate-bounce"></div>
          <div class="w-1 bg-teal-400 h-4 animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-1 bg-teal-400 h-6 animate-bounce" style="animation-delay: 0.2s"></div>
          <div class="w-1 bg-teal-400 h-3 animate-bounce" style="animation-delay: 0.15s"></div>
          <div class="w-1 bg-teal-400 h-5 animate-bounce" style="animation-delay: 0.3s"></div>
          <div class="w-1 bg-teal-400 h-2 animate-bounce" style="animation-delay: 0.25s"></div>
          <div class="w-1 bg-teal-400 h-4 animate-bounce" style="animation-delay: 0.05s"></div>
        </div>

        <div id="scribeTranscript" class="text-stone-200 leading-relaxed font-sans text-sm min-h-[110px] italic">
          "Doctor, I had a stent placed 6 months ago. My wife and I want to know when it is physically safe to resume intimacy and climb stairs without putting stress on my heart."
        </div>
      </div>

      <!-- Right: Structured Clinical Extraction -->
      <div class="space-y-4">
        <div class="flex items-center justify-between font-mono">
          <div class="flex items-center gap-2 text-amber-400 font-bold">
            <span>📋</span>
            <span>STRUCTURED CDS EXTRACTION</span>
          </div>
          <span class="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">Gemini 2.5 Flash</span>
        </div>

        <div id="scribeExtraction" class="space-y-2.5">
          <div class="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
            <div class="text-[11px] font-bold text-amber-300 font-mono">Cardiovascular Capacity (Princeton III)</div>
            <div class="text-stone-300 text-xs">Patient satisfies intermediate 4 MET threshold. Exertion equivalent to climbing 2 flights of stairs safely.</div>
          </div>
          <div class="p-3 bg-stone-900 rounded-xl border border-rose-900/50 text-rose-300 space-y-1">
            <div class="text-[11px] font-bold font-mono flex items-center gap-1">
              <span>🛡️ RxGuard Interlock Triggered:</span>
            </div>
            <div class="text-xs">Patient taking Isosorbide Mononitrate (Nitrates). Co-prescription of PDE-5 inhibitors is strictly contraindicated (Severe Hypotension Risk).</div>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- ══ 3. INTERACTIVE SNO-10 ANALOGY FLIP CARDS ═══════════════════════════════ -->
  <section class="space-y-12">
    <div class="text-center space-y-3 max-w-3xl mx-auto">
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
        <span>📖 SNO-10 Cognitive Translation</span>
      </div>
      <h2 class="text-3xl sm:text-5xl font-extrabold text-white">
        Medical Jargon ➔ Plain Workshop English
      </h2>
      <p class="text-stone-300 text-sm sm:text-base leading-relaxed">
        Click any card to flip between the official clinical SNOMED-CT/ICD-10 terminology and PocketGull's intuitive craft analogies:
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      
      <!-- Flip Card 1 -->
      <div class="flip-card h-64 cursor-pointer" onclick="this.classList.toggle('flipped')">
        <div class="flip-card-inner relative w-full h-full text-left rounded-3xl transition-transform duration-500">
          <!-- Front -->
          <div class="flip-card-front absolute inset-0 glass-card-dark p-7 rounded-3xl border border-rose-500/30 flex flex-col justify-between">
            <div class="space-y-2">
              <span class="text-xs font-mono font-bold text-rose-400">ICD-10 I10 &bull; Cardiology</span>
              <h3 class="text-xl font-bold text-white">Essential Primary Hypertension</h3>
              <p class="text-xs text-stone-400">Arterial pressure continuously exceeding 130/80 mmHg with microvascular endothelial sheer stress.</p>
            </div>
            <div class="text-[11px] font-mono text-amber-400">🔄 Click to Flip to Patient Analogy →</div>
          </div>
          <!-- Back -->
          <div class="flip-card-back absolute inset-0 geararts-card p-7 rounded-3xl text-stone-950 flex flex-col justify-between shadow-2xl">
            <div class="space-y-2">
              <span class="text-xs font-mono font-bold opacity-80">🛠️ Workshop Analogy</span>
              <h3 class="text-xl font-black">High PSI in a Copper Air Line</h3>
              <p class="text-xs font-medium leading-relaxed">Like running your shop compressor at 150 PSI instead of 90 PSI. It doesn't break today, but it wears down the regulator and hoses until a leak blows.</p>
            </div>
            <div class="text-[11px] font-mono font-bold">🔄 Click to Flip Back</div>
          </div>
        </div>
      </div>

      <!-- Flip Card 2 -->
      <div class="flip-card h-64 cursor-pointer" onclick="this.classList.toggle('flipped')">
        <div class="flip-card-inner relative w-full h-full text-left rounded-3xl transition-transform duration-500">
          <!-- Front -->
          <div class="flip-card-front absolute inset-0 glass-card-dark p-7 rounded-3xl border border-teal-500/30 flex flex-col justify-between">
            <div class="space-y-2">
              <span class="text-xs font-mono font-bold text-teal-400">ICD-10 M17.9 &bull; Orthopedics</span>
              <h3 class="text-xl font-bold text-white">Degenerative Joint Disease (Knee)</h3>
              <p class="text-xs text-stone-400">Progressive loss of articular cartilage, subchondral sclerosis, and osteophyte formation causing mechanical friction.</p>
            </div>
            <div class="text-[11px] font-mono text-amber-400">🔄 Click to Flip to Patient Analogy →</div>
          </div>
          <!-- Back -->
          <div class="flip-card-back absolute inset-0 geararts-card p-7 rounded-3xl text-stone-950 flex flex-col justify-between shadow-2xl">
            <div class="space-y-2">
              <span class="text-xs font-mono font-bold opacity-80">🛠️ Workshop Analogy</span>
              <h3 class="text-xl font-black">Worn Wooden Bushing on a Lathe</h3>
              <p class="text-xs font-medium leading-relaxed">When grease runs dry on a spindle, wood rubs metal. You don't scrap the tool—you lubricate with movement, reduce heavy torque, and pace your cuts.</p>
            </div>
            <div class="text-[11px] font-mono font-bold">🔄 Click to Flip Back</div>
          </div>
        </div>
      </div>

      <!-- Flip Card 3 -->
      <div class="flip-card h-64 cursor-pointer" onclick="this.classList.toggle('flipped')">
        <div class="flip-card-inner relative w-full h-full text-left rounded-3xl transition-transform duration-500">
          <!-- Front -->
          <div class="flip-card-front absolute inset-0 glass-card-dark p-7 rounded-3xl border border-purple-500/30 flex flex-col justify-between">
            <div class="space-y-2">
              <span class="text-xs font-mono font-bold text-purple-400">SNOMED 399269003 &bull; Mental Health</span>
              <h3 class="text-xl font-bold text-white">Bereavement &amp; Complicated Grief</h3>
              <p class="text-xs text-stone-400">Prolonged psychological adjustment disorder resulting from the loss of a significant companion with somatic fatigue.</p>
            </div>
            <div class="text-[11px] font-mono text-amber-400">🔄 Click to Flip to Patient Analogy →</div>
          </div>
          <!-- Back -->
          <div class="flip-card-back absolute inset-0 geararts-card p-7 rounded-3xl text-stone-950 flex flex-col justify-between shadow-2xl">
            <div class="space-y-2">
              <span class="text-xs font-mono font-bold opacity-80">🛠️ Workshop Analogy</span>
              <h3 class="text-xl font-black">Inheriting a Master's Hand Plane</h3>
              <p class="text-xs font-medium leading-relaxed">Grief is having an empty bench. Healing is picking up their favorite hand plane, sharpening the blade, and finishing the project they started in their honor.</p>
            </div>
            <div class="text-[11px] font-mono font-bold">🔄 Click to Flip Back</div>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- ══ 4. 5 Core Avenues of Preventive Medicine ════════════════════════════════ -->
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

  <!-- ══ 5. Greater Good Charter: 50-30-20 Philanthropic Split ═════════════════ -->
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

  <!-- ══ 6. Interactive SaaS ROI Calculator ════════════════════════════════════ -->
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

  <!-- ══ 7. Commercial SaaS Pricing & Packaging ═════════════════════════════════ -->
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

        <button onclick="document.getElementById('pilotModal').classList.remove('hidden')" class="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-center font-bold text-xs transition block cursor-pointer">
          Start Solo Pilot
        </button>
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

        <button onclick="document.getElementById('pilotModal').classList.remove('hidden')" class="w-full py-3.5 rounded-xl geararts-card text-stone-950 text-center font-black text-sm transition hover:scale-105 shadow-xl block cursor-pointer">
          Get Started with Pro
        </button>
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

  <!-- ══ 8. Inbound Knowledge Base & Articles by Phil ═══════════════════════════ -->
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

<!-- ══ 9. 14-Day Free Clinical Pilot Booking Modal ════════════════════════════ -->
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
      <div class="text-[10px] text-center text-stone-400 font-mono">Zero credit card required &bull; HIPAA Safe Harbor compliant</div>
    </form>
  </div>
</div>

<!-- Interactive Scripts: ROI Calculator & AI Scribe Simulator -->
<script>
  document.addEventListener('DOMContentLoaded', () => {
    // 1. ROI Calculator
    const clinicianSlider = document.getElementById('clinicianSlider');
    const patientSlider = document.getElementById('patientSlider');
    const clinicianDisplay = document.getElementById('clinicianCountDisplay');
    const patientDisplay = document.getElementById('patientCountDisplay');
    const totalSavings = document.getElementById('totalSavingsDisplay');
    const hoursReclaimed = document.getElementById('hoursReclaimedDisplay');
    const chartsAutomated = document.getElementById('chartsAutomatedDisplay');

    if (clinicianSlider && patientSlider && totalSavings) {
      function recalculate() {
        const clinicians = parseInt(clinicianSlider.value, 10);
        const patientsPerDay = parseInt(patientSlider.value, 10);
        clinicianDisplay.textContent = clinicians === 1 ? '1 Provider' : `${clinicians} Providers`;
        patientDisplay.textContent = `${patientsPerDay} Patients/day`;
        const totalHours = Math.round(2.4 * 240 * clinicians);
        const annualDollarSavings = totalHours * 150;
        const totalCharts = Math.round(clinicians * patientsPerDay * 240);
        totalSavings.textContent = `$${annualDollarSavings.toLocaleString()} / yr`;
        hoursReclaimed.textContent = `${totalHours.toLocaleString()} hours`;
        chartsAutomated.textContent = `${totalCharts.toLocaleString()} encounters`;
      }
      clinicianSlider.addEventListener('input', recalculate);
      patientSlider.addEventListener('input', recalculate);
    }

    // 2. AI Scribe Simulator
    const scenarioData = {
      1: {
        transcript: '"Doctor, I had a stent placed 6 months ago. My wife and I want to know when it is physically safe to resume intimacy and climb stairs without putting stress on my heart."',
        extraction: `
          <div class="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
            <div class="text-[11px] font-bold text-amber-300 font-mono">Cardiovascular Capacity (Princeton III)</div>
            <div class="text-stone-300 text-xs">Patient satisfies intermediate 4 MET threshold. Exertion equivalent to climbing 2 flights of stairs safely.</div>
          </div>
          <div class="p-3 bg-stone-900 rounded-xl border border-rose-900/50 text-rose-300 space-y-1">
            <div class="text-[11px] font-bold font-mono">🛡️ RxGuard Interlock Triggered:</div>
            <div class="text-xs">Patient taking Isosorbide Mononitrate (Nitrates). Co-prescription of PDE-5 inhibitors is strictly contraindicated (Severe Hypotension Risk).</div>
          </div>`
      },
      2: {
        transcript: '"My blood pressure has been running around 145 over 95 in the mornings. I feel fine, but my brother had kidney failure and had to go on dialysis, and I want to make sure I protect my kidneys."',
        extraction: `
          <div class="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
            <div class="text-[11px] font-bold text-amber-300 font-mono">ICD-10 I10 &bull; Stage 2 Hypertension</div>
            <div class="text-stone-300 text-xs">Elevated glomerular capillary pressure detected. Recommend morning home BP logging + eGFR/uACR screening.</div>
          </div>
          <div class="p-3 bg-stone-900 rounded-xl border border-teal-900/50 text-teal-300 space-y-1">
            <div class="text-[11px] font-bold font-mono">🫘 $100k Dialysis Prevention Pathway:</div>
            <div class="text-xs">Early tight BP regulation (<130/80) halts microvascular nephron destruction and averts catastrophic ESRD costs.</div>
          </div>`
      },
      3: {
        transcript: '"I work in my woodworking shop 4 hours a day, but my right knee swells up when I stand at the workbench or use the foot pedal on my scroll saw."',
        extraction: `
          <div class="p-3 bg-stone-900 rounded-xl border border-stone-800 space-y-1">
            <div class="text-[11px] font-bold text-amber-300 font-mono">ICD-10 M17.9 &bull; Knee Osteoarthritis</div>
            <div class="text-stone-300 text-xs">Mechanical cartilage load fatigue with joint effusion during prolonged static weight bearing.</div>
          </div>
          <div class="p-3 bg-stone-900 rounded-xl border border-teal-900/50 text-teal-300 space-y-1">
            <div class="text-[11px] font-bold font-mono">🛠️ Workshop Ergonomic Modifications:</div>
            <div class="text-xs">Introduce anti-fatigue matting, raise workbench 3 inches to avoid knee flexion torque, and switch to hand-switch controls.</div>
          </div>`
      }
    };

    [1, 2, 3].forEach(id => {
      const btn = document.getElementById(`scenarioBtn${id}`);
      if (btn) {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.scenario-btn').forEach(b => {
            b.classList.remove('border-teal-400', 'border-amber-400', 'border-rose-400', 'border-2');
            b.classList.add('border-stone-800', 'border');
          });
          btn.classList.remove('border-stone-800', 'border');
          btn.classList.add('border-teal-400', 'border-2');

          const transcriptEl = document.getElementById('scribeTranscript');
          const extractionEl = document.getElementById('scribeExtraction');
          if (transcriptEl && extractionEl && scenarioData[id]) {
            transcriptEl.textContent = scenarioData[id].transcript;
            extractionEl.innerHTML = scenarioData[id].extraction;
          }
        });
      }
    });
  });
</script>

<style>
  /* 3D Flip Card Styles */
  .flip-card {
    perspective: 1000px;
  }
  .flip-card-inner {
    transform-style: preserve-3d;
  }
  .flip-card.flipped .flip-card-inner {
    transform: rotateY(180deg);
  }
  .flip-card-front, .flip-card-back {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  .flip-card-back {
    transform: rotateY(180deg);
  }
</style>

<?php get_footer(); ?>
