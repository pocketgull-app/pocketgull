/**
 * @file src/ui/index.js
 * @description Adobe Express Add-on UI controller for Pocket-Gull Sanctuary
 */

// Tab switching with WAI-ARIA accessibility state management
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.section-content').forEach(sec => {
    sec.classList.remove('active');
  });

  const targetTab = document.getElementById(`tab-${tabId}`);
  if (targetTab) {
    targetTab.classList.add('active');
  }

  const activeBtn = document.getElementById(`tab-btn-${tabId}`) || Array.from(document.querySelectorAll('.tab-btn')).find(b => b.getAttribute('onclick')?.includes(tabId));
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.setAttribute('aria-selected', 'true');
  }
}

// Helper to communicate with Adobe Express Add-on SDK
async function insertAssetIntoExpress(assetData) {
  try {
    if (window.addOnUISdk && window.addOnUISdk.app && window.addOnUISdk.app.document) {
      if (assetData.type === 'image' && assetData.blob) {
        await window.addOnUISdk.app.document.addImage(assetData.blob);
      } else if (assetData.type === 'text') {
        await window.addOnUISdk.app.document.addText(assetData.text);
      }
    } else {
      console.log('[PocketGull Express Add-on Mock Mode] Inserted into canvas:', assetData.title);
    }
  } catch (err) {
    console.error('[PocketGull Express Add-on] Error adding to canvas:', err);
  }
}

// ─── BRANDDESK ASSET GENERATORS ───────────────────────────────────────────────

// 0.1 PocketGull Master Brand Wordmark
async function insertBrandWordmark() {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="240" viewBox="0 0 800 240">
      <rect width="800" height="240" rx="20" fill="#0f172a"/>
      <g transform="translate(40, 40)">
        <polygon points="30,10 70,30 50,70 10,50" fill="#ea580c"/>
        <polygon points="50,70 90,90 70,130 30,110" fill="#e9c46a"/>
        <polygon points="70,130 110,150 90,190 50,170" fill="#7bdff2"/>
      </g>
      <text x="180" y="110" font-family="'PocketGull VF', 'Outfit', sans-serif" font-size="64" font-weight="900" fill="#faf8f5" letter-spacing="-1">PocketGull</text>
      <text x="185" y="155" font-family="'Inter', sans-serif" font-size="18" font-weight="700" fill="#ea580c" letter-spacing="3">CLINICAL INTELLIGENCE SUITE</text>
    </svg>
  `;
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  await insertAssetIntoExpress({ type: 'image', blob, title: 'PocketGull Master Wordmark' });
}

// 0.2 The 5 Origami Brand Mascots
async function insertOrigamiMascot(mascotId) {
  const mascotConfig = {
    navigator: { name: 'The Navigator', color: '#d4a373', role: 'Triage & Red Flags', icon: '🧭' },
    chronicler: { name: 'The Chronicler', color: '#e9c46a', role: 'Time-Series Vitals', icon: '⏳' },
    statistician: { name: 'The Statistician', color: '#7bdff2', role: 'Popperian Epistemology', icon: '⚖️' },
    scholar: { name: 'The Scholar', color: '#c77dff', role: 'Clinical Literature', icon: '📖' },
    explorer: { name: 'The Explorer', color: '#0284c7', role: '3D Spatial Anatomy', icon: '🔭' }
  };

  const m = mascotConfig[mascotId] || mascotConfig.navigator;
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
      <rect width="500" height="500" rx="32" fill="#faf8f5" stroke="${m.color}" stroke-width="8"/>
      <circle cx="250" cy="200" r="120" fill="${m.color}" opacity="0.15"/>
      <g transform="translate(150, 100) scale(2)">
        <polygon points="50,10 80,40 60,80 20,60" fill="${m.color}"/>
        <polygon points="60,80 90,110 50,110" fill="#0f172a" opacity="0.8"/>
        <polygon points="20,60 50,10 60,80" fill="#ffffff" opacity="0.4"/>
      </g>
      <text x="250" y="370" font-family="'PocketGull VF', sans-serif" font-size="28" font-weight="900" text-anchor="middle" fill="#0f172a">${m.name}</text>
      <text x="250" y="410" font-family="'Inter', sans-serif" font-size="16" font-weight="700" text-anchor="middle" fill="${m.color}">${m.icon} ${m.role}</text>
    </svg>
  `;
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  await insertAssetIntoExpress({ type: 'image', blob, title: `Origami Mascot: ${m.name}` });
}

// 0.3 Clinical ICU Telemetry Badge
async function insertTelemetryBadge() {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="200" viewBox="0 0 600 200">
      <rect width="600" height="200" rx="16" fill="#0f172a" stroke="#334155" stroke-width="2"/>
      <text x="30" y="50" font-family="'PocketGull VF', sans-serif" font-size="14" font-weight="700" fill="#94a3b8" letter-spacing="2">REAL-TIME BIOMETRIC HUD</text>
      <path d="M 30 110 L 80 110 L 100 70 L 120 150 L 140 100 L 160 120 L 220 110" fill="none" stroke="#10b981" stroke-width="3"/>
      <text x="260" y="100" font-family="'PocketGull Mono', monospace" font-size="32" font-weight="900" fill="#38bdf8">74 bpm</text>
      <text x="260" y="130" font-family="'Inter', sans-serif" font-size="12" fill="#94a3b8">HEART RATE</text>
      <text x="420" y="100" font-family="'PocketGull Mono', monospace" font-size="32" font-weight="900" fill="#facc15">98% SpO₂</text>
      <text x="420" y="130" font-family="'Inter', sans-serif" font-size="12" fill="#94a3b8">PULSE OXIMETRY</text>
      <text x="30" y="175" font-family="'PocketGull Numerics', sans-serif" font-size="13" font-weight="bold" fill="#ea580c">φ = 1.618033 · ΔΨm = -140 mV · Slashed Zero: Ø</text>
    </svg>
  `;
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  await insertAssetIntoExpress({ type: 'image', blob, title: 'ICU Telemetry Badge' });
}

// 0.4 Sumerian Cuneiform Medical Tablet
async function insertCuneiformTablet() {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" rx="28" fill="#c86d51" stroke="#9a3412" stroke-width="6"/>
      <text x="300" y="60" font-family="'PocketGull VF', sans-serif" font-size="22" font-weight="900" text-anchor="middle" fill="#fff">SUMERIAN CLINICAL CODEX (c. 3200 BCE)</text>
      <line x1="60" y1="85" x2="540" y2="85" stroke="#9a3412" stroke-width="2"/>
      <!-- ASU Wedge -->
      <g transform="translate(60, 110)">
        <polygon points="10,10 40,25 10,40" fill="#7c2d12"/>
        <line x1="40" y1="25" x2="100" y2="25" stroke="#7c2d12" stroke-width="8"/>
        <text x="120" y="32" font-family="'PocketGull VF', sans-serif" font-size="20" font-weight="900" fill="#fef3c7">ASU (Physician / Internist)</text>
      </g>
      <!-- TI Wedge -->
      <g transform="translate(60, 180)">
        <polygon points="10,10 40,25 10,40" fill="#7c2d12"/>
        <line x1="40" y1="25" x2="80" y2="25" stroke="#7c2d12" stroke-width="8"/>
        <polygon points="90,10 120,25 90,40" fill="#7c2d12"/>
        <text x="140" y="32" font-family="'PocketGull VF', sans-serif" font-size="20" font-weight="900" fill="#fef3c7">TI (Life / Cellular Vitality)</text>
      </g>
      <!-- DINGIR Wedge -->
      <g transform="translate(60, 250)">
        <polygon points="10,25 40,25 25,0" fill="#7c2d12"/>
        <polygon points="10,25 40,25 25,50" fill="#7c2d12"/>
        <text x="120" y="32" font-family="'PocketGull VF', sans-serif" font-size="20" font-weight="900" fill="#fef3c7">DINGIR (Star / Cosmic Telemetry)</text>
      </g>
      <text x="300" y="360" font-family="'Inter', sans-serif" font-size="13" font-weight="bold" text-anchor="middle" fill="#fef3c7">From Sumerian Clay Stylus to PocketGull FHIR R4 Real-Time AI</text>
    </svg>
  `;
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  await insertAssetIntoExpress({ type: 'image', blob, title: 'Sumerian Cuneiform Tablet' });
}

// ─── PEDIATRIC & THERAPY ASSET GENERATORS ──────────────────────────────────────

// 1. Pediatric Courage Medal
async function insertPediatricMedal() {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <radialGradient id="goldGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="60%" stop-color="#eab308" />
          <stop offset="100%" stop-color="#854d0e" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="160" fill="url(#goldGrad)" stroke="#ca8a04" stroke-width="12"/>
      <circle cx="200" cy="200" r="130" fill="#1e293b" stroke="#facc15" stroke-width="4"/>
      <text x="200" y="160" font-size="64" text-anchor="middle" fill="#facc15">🕊️</text>
      <text x="200" y="210" font-size="20" font-weight="900" font-family="sans-serif" text-anchor="middle" fill="#f8fafc">MEDAL OF BRAVERY</text>
      <text x="200" y="240" font-size="14" font-weight="bold" font-family="sans-serif" text-anchor="middle" fill="#38bdf8">POCKET-GULL CHAMPION</text>
    </svg>
  `;
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  await insertAssetIntoExpress({ type: 'image', blob, title: 'Pediatric Courage Medal' });
}

// 2. Super-Healer Certificate Template
async function insertCertificate() {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
      <rect width="800" height="500" rx="24" fill="#0f172a" stroke="#14b8a6" stroke-width="8"/>
      <rect x="20" y="20" width="760" height="460" rx="16" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="8 8"/>
      <text x="400" y="100" font-size="36" font-weight="900" font-family="sans-serif" text-anchor="middle" fill="#14b8a6">CERTIFICATE OF SUPER-COURAGE</text>
      <text x="400" y="150" font-size="18" font-weight="500" font-family="sans-serif" text-anchor="middle" fill="#94a3b8">Awarded with profound respect to a true pediatric superhero:</text>
      <line x1="200" y1="240" x2="600" y2="240" stroke="#f59e0b" stroke-width="3"/>
      <text x="400" y="230" font-size="24" font-weight="bold" font-family="sans-serif" text-anchor="middle" fill="#f8fafc">PATIENT SUPERHERO</text>
      <text x="400" y="320" font-size="16" font-family="sans-serif" text-anchor="middle" fill="#cbd5e1">For resilience, bright spirits, and unmatched courage during recovery.</text>
      <text x="250" y="420" font-size="14" font-family="sans-serif" text-anchor="middle" fill="#94a3b8">Clinical Care Team</text>
      <text x="550" y="420" font-size="14" font-family="sans-serif" text-anchor="middle" fill="#94a3b8">Date: Verified</text>
    </svg>
  `;
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  await insertAssetIntoExpress({ type: 'image', blob, title: 'Certificate of Courage' });
}

// 3. Kintsugi Seam
async function insertKintsugiSeam() {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <path d="M 50 200 Q 150 120 280 220 T 450 180 T 550 260" fill="none" stroke="#eab308" stroke-width="8" stroke-linecap="round"/>
      <path d="M 280 220 Q 320 290 380 340" fill="none" stroke="#facc15" stroke-width="6" stroke-linecap="round"/>
      <path d="M 150 120 Q 180 60 220 40" fill="none" stroke="#fde047" stroke-width="5" stroke-linecap="round"/>
    </svg>
  `;
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  await insertAssetIntoExpress({ type: 'image', blob, title: '24K Gold Kintsugi Seam' });
}

// 4. Bio-Resonance Mandala
async function insertMandala() {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
      <circle cx="250" cy="250" r="200" fill="none" stroke="#a855f7" stroke-width="3" opacity="0.4"/>
      <circle cx="250" cy="250" r="150" fill="none" stroke="#14b8a6" stroke-width="4" opacity="0.6"/>
      <circle cx="250" cy="250" r="100" fill="none" stroke="#f59e0b" stroke-width="5" opacity="0.8"/>
      <circle cx="250" cy="250" r="40" fill="#3b82f6" opacity="0.9"/>
    </svg>
  `;
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  await insertAssetIntoExpress({ type: 'image', blob, title: '528 Hz Mandala' });
}

// 5. 504 Accommodation Quick-Card
async function insert504Card() {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" rx="16" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>
      <rect x="0" y="0" width="600" height="60" fill="#0284c7" rx="16"/>
      <text x="30" y="40" font-size="20" font-weight="900" font-family="sans-serif" fill="#ffffff">🏫 SECTION 504 CLASSROOM QUICK-CARD</text>
      <text x="30" y="100" font-size="14" font-weight="bold" font-family="sans-serif" fill="#38bdf8">&bull; Free Water &amp; Hydration Access at all times</text>
      <text x="30" y="140" font-size="14" font-weight="bold" font-family="sans-serif" fill="#38bdf8">&bull; Unrestricted Restroom &amp; Nurse Clinic Passes</text>
      <text x="30" y="180" font-size="14" font-weight="bold" font-family="sans-serif" fill="#38bdf8">&bull; 10-Minute Sensory &amp; Fatigue Rest Breaks</text>
      <text x="30" y="220" font-size="14" font-weight="bold" font-family="sans-serif" fill="#38bdf8">&bull; Audio-Recording &amp; Typed Note Accommodations</text>
      <text x="30" y="260" font-size="14" font-weight="bold" font-family="sans-serif" fill="#38bdf8">&bull; Stop-the-Clock Testing During Flare-Ups</text>
    </svg>
  `;
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  await insertAssetIntoExpress({ type: 'image', blob, title: 'Section 504 Classroom Quick-Card' });
}

// 6. Symptom & Energy Tracker
async function insertSymptomTracker() {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350">
      <rect width="600" height="350" rx="16" fill="#0f172a" stroke="#10b981" stroke-width="3"/>
      <text x="30" y="45" font-size="18" font-weight="bold" font-family="sans-serif" fill="#10b981">DAILY ENERGY &amp; SYMPTOM LOG (FHIR R4)</text>
      <line x1="30" y1="70" x2="570" y2="70" stroke="#334155" stroke-width="1"/>
      <text x="30" y="120" font-size="14" font-family="sans-serif" fill="#e2e8f0">🔋 Morning Energy: [ &bull; &bull; &bull; &bull; &bull; ]</text>
      <text x="30" y="170" font-size="14" font-family="sans-serif" fill="#e2e8f0">🎯 Cognitive Clarity: [ &bull; &bull; &bull; &bull; &bull; ]</text>
      <text x="30" y="220" font-size="14" font-family="sans-serif" fill="#e2e8f0">💧 Hydration (8 oz): [ &#9744; &#9744; &#9744; &#9744; &#9744; &#9744; ]</text>
      <text x="30" y="270" font-size="14" font-family="sans-serif" fill="#e2e8f0">🚶 Low-Pace Movement: [ 15 min gentle walk ]</text>
    </svg>
  `;
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  await insertAssetIntoExpress({ type: 'image', blob, title: 'Symptom & Energy Tracker' });
}

// 7. Substance 3D / Firefly Texture Map
async function insertTexture(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = type === 'organs' ? '#991b1b' : '#334155';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = type === 'organs' ? '#f43f5e' : '#38bdf8';
    ctx.lineWidth = 4;
    for (let i = 0; i < 512; i += 32) {
      ctx.beginPath();
      ctx.arc(256, 256, i, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  canvas.toBlob(async (blob) => {
    if (blob) {
      await insertAssetIntoExpress({ type: 'image', blob, title: `Substance 3D ${type} Texture` });
    }
  });
}
