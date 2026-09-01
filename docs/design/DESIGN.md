# 🕊️ POCKET GULL — DESIGN SYSTEM

**Industrial Grace & Clinical Intelligence**

---

## 1. Design Philosophy

Pocket Gull's visual language is governed by three founding principles:

| Principle | Origin | Expression |
|:---|:---|:---|
| **"Less, but better"** | Dieter Rams | Neutral backgrounds, monochromatic surfaces, elimination of every non-functional decoration. Every pixel must earn its place. |
| **Origami Precision** | Japanese paper-folding | The origami seagull is constructed exclusively from flat polygons—no curves, no gradients on the bird itself. Folds imply depth. Paper implies fragility and care. |
| **Clinical Neutrality** | Laboratory instrumentation | UI chrome is deliberately silent (`zinc-900`, `gray-50`) so that the *data*—vitals, reports, and AI output—becomes the loudest thing on screen. |

> *"Good design is as little design as possible."* — Dieter Rams, Principle 10

---

## 2. Brand Identity

### 2.1 The Origami Seagull

The logo is a **geometric origami seagull** rendered as an SVG polygon mesh. It exists in two canonical variants:

| Variant | Context | Palette |
|:---|:---|:---|
| **Monochrome (Lock Screen)** | Secure Splash, authentication | Zinc grayscale (`#404040` → `#e4e4e7`) with a single `#34A853` accent on the beak |
| **Paper White (Pocket Agent)** | Voice assistant overlay, agent mode | Soft whites (`#FFFFFF`, `#E6F0FA`, `#C5D9ED`) with a `#1E3A5F` navy stroke |

The bird is always built from **origami folds**—each polygon unfolds sequentially via `origami-unfold` keyframe animation with staggered `fold-1` through `fold-4` delays, giving the impression that it is assembling itself from a flat sheet of paper.

### 2.2 The Pocket

The **Pocket** is the container from which the seagull emerges. It represents:

- A **shirt pocket** — the clinician's constant companion, always within reach
- A **nest** — the safe, organized home where clinical context is gathered and nurtured
- A **portal** — the interface boundary between the human world and the AI intelligence layer

In the UI, The Pocket manifests as the floating voice assistant panel (`bottom-4 right-4`), featuring:
- `bg-gradient-to-br from-[#E1EAF4] to-[#C9DEEE]` — soft paper tones
- `rounded-[2rem]` — a generous, inviting aperture
- `border-[3px] border-white` — the folded edge of a real fabric pocket
- `ring-1 ring-[#1E3A5F]/10` — a subtle navy shadow suggesting depth

The seagull "perches" atop The Pocket, animated via `fly-out-pocket` keyframes — it launches upward with a spring overshoot, as if startled out of the pocket by the clinician's voice.

### 2.3 The App Icon

The app icon features two overlapping **green leaves** arranged in a medical cross formation, bisected by a horizontal pharmacy bar. The leaves represent growth, healing, and natural medicine. Dark background (`#1a1a1a`), green leaves (`#4CAF50` / `#388E3C`).

---

## 3. Color System

### 3.1 Brand Palette (Google-aligned)

```
brand-blue-500:   #4285F4   — Google Blue     (links, integrations)
brand-red-500:    #EA4335   — Google Red      (alerts, emergency)
brand-amber-500:  #FBBC05   — Google Yellow   (warnings, caution)
brand-green-500:  #34A853   — Google Green    (success, vitals, origami beak accent)
```

### 3.2 Surface System

| Token | Light | Dark | Usage |
|:---|:---|:---|:---|
| `surface-primary` | `#FFFFFF` | `zinc-900` | Card backgrounds, panels |
| `surface-ground` | `#F9FAFB` | `#09090b` | Page canvas |
| `surface-elevated` | `white` | `zinc-800/80` | Floating elements, modals |
| `border-subtle` | `gray-200` | `zinc-800` | Panel dividers |
| `text-primary` | `gray-900` | `zinc-100` | Body text |
| `text-secondary` | `gray-500` | `zinc-400` | Labels, metadata |
| `text-muted` | `gray-400` | `zinc-600` | Timestamps, de-emphasized |

### 3.3 Circadian / AVS Dynamic Tokens

The interface breathes. CSS custom properties on `:root` are updated every animation frame by `GlobalAvsService`:

```css
--circadian-h: 152;       /* Hue — shifts across the day */
--circadian-s: 65%;        /* Saturation */
--circadian-l: 52%;        /* Lightness */
--avs-breath-duration: 10.9s;  /* 5.5 BPM resonance frequency */
--avs-glow-intensity: 0;       /* 0 = idle, 1 = entrainment active */
```

Every card border, navbar shadow, and ambient halo reacts to these tokens — the entire UI "inhales and exhales" in sync with the brainwave entrainment engine.

### 3.4 Insight Spark Theme

An alternative dark-orange color scheme (`theme-spark`) activates via the theme toggle:

```
--spark-orange: #f97316
--spark-amber:  #d97706
Surface:        #050201 → #0f0704
Scrollbars:     rgba(249, 115, 22, 0.3)
```

### 3.5 Papercraft & Tactile Origami Palette
Extracted directly from the social preview paper artwork:

| Token | Hex / RGB | Role & Usage |
|:---|:---|:---|
| `--paper-mustard` | `#F6B12B` | Primary paper card stock highlight |
| `--paper-cream` | `#F9F3D9` | Warm background left parchment texture |
| `--paper-peach` | `#F5B98E` | Soft terracotta background right texture |
| `--paper-teal` | `#2AA4A0` | Turquoise sub-header & QR code accent |
| `--paper-coral` | `#EF6658` | Coral vermilion primary action accent |
| `--paper-white` | `#FFFFFF` | Crisp origami paper cut-outs & gulls |
| `--paper-ink` | `#1C1C1C` | High-contrast charcoal ink typography |

---

## 4. Typography

| Role | Font | Weight | Size | Tracking |
|:---|:---|:---|:---|:---|
| **System Labels** | System sans-serif | 700 (Bold) | `9px–10px` | `0.15em–0.3em` (UPPERCASE) |
| **Body Content** | System sans-serif | 400–500 | `text-sm` / `text-xs` | Normal |
| **Monospace Data** | `font-mono` | 400–700 | `text-xs` | `0.03em` |
| **AI Report Prose** | `.rams-typography` | 400–700 | `0.875rem–1.125rem` | Normal |

The `.rams-typography` class governs all AI-generated markdown rendering — headings, lists, tables, blockquotes — with carefully tuned line-heights, `#689F38` accent borders, and hover-highlighted table rows.

---

## 5. Component Anatomy

### 5.1 The Dieter Rams Grill

Every primary panel features a **Grill** — a row of thin horizontal bars at the top edge:

```html
<div class="absolute top-0 left-0 right-0 h-1.5 flex gap-[1px] px-8 opacity-30">
  <div class="flex-1 bg-zinc-600"></div>
  <div class="flex-1 bg-zinc-600"></div>
  <div class="flex-1 bg-zinc-600"></div>
  <div class="flex-1 bg-zinc-600"></div>
</div>
```

This is a direct homage to the ventilation grills on Braun audio equipment designed by Rams — a signature of functional industrial design that signals "this is a precision instrument."

### 5.2 Status Indicators

| State | Visual Pattern |
|:---|:---|
| **Online / Active** | `w-2 h-2 rounded-full bg-brand-green-500 animate-pulse` |
| **System Locked** | `bg-brand-red-500 animate-pulse shadow-[0_0_8px_rgba(234,67,53,0.6)]` |
| **Loading** | Concentric rings — outer `border-zinc-800`, inner `border-brand-green-500 border-t-transparent animate-spin` |
| **AVS Active** | Nested ping: `animate-ping` outer + solid inner, color-mapped to brainwave state |

### 5.3 Button Hierarchy

| Level | Style | Example |
|:---|:---|:---|
| **Primary** | `bg-zinc-100 text-zinc-950 rounded-[1rem]` | "Initialize System" |
| **Accent** | `bg-brand-blue-600 text-white rounded-2xl` | "Clinician Sign-in" |
| **Secondary** | `bg-zinc-800 border-zinc-700/50 text-zinc-200` | "Explore Sandbox" |
| **Emergency** | `bg-red-950/40 border-red-800/60 text-red-400 animate-pulse` | "Good Samaritan Bypass" |
| **Ghost** | `text-zinc-600 hover:text-zinc-400` | "Skip assessment" |

### 5.4 Papercraft Component Anatomy
- **`.paper-card`**: Multi-layered paper stock panel with stacked drop shadows (`box-shadow: 6px 12px 24px -4px rgba(80,50,20,0.18)`), organic paper angles (`transform: rotate(-0.3deg)`), and paper texture grain.
- **`.paper-cutout`**: Pill badges and buttons styled with directional drop shadows (`filter: drop-shadow(2px 4px 6px rgba(60,40,20,0.15))`).
- **`<app-origami-decorations>`**: Standalone component rendering SVG origami paper gull badges, sun rays, and layered paper cloud cut-outs.

---

## 6. Animation Contract

| Animation | Duration | Easing | Purpose |
|:---|:---|:---|:---|
| `origami-unfold` | 850ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | SVG polygon assembly — the seagull "folds into being" |
| `fly-out-pocket` | 1000ms | Same spring curve | Seagull launches from The Pocket with overshoot |
| `avs-respiratory-breath` | 10.909s | `ease-in-out` | Mascot scale-breath at 5.5 BPM |
| `avs-halo-breathe` | `var(--avs-breath-duration)` | `ease-in-out` | Full-screen ambient glow cycling |
| `flightHover` | 4000ms | `ease-in-out alternate` | Idle seagull floating in place |
| `flightEnter` | 4000ms | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Initial seagull entrance from below |
| Panel `animate-in` | 500–700ms | `ease-out` | `slide-in-from-bottom-8`, `fade-in` — Tailwind Animate |

All animations respect `prefers-reduced-motion` via the `theme.reduceMotion()` signal and the `Reduce Motion` toggle on the splash screen.

---

## 7. Avian Personas — The Gull Squadron

> *Every AI agent, every system component, every UI moment in Pocket Gull has a name. They're all seagulls. They all have props. Because medicine is hard enough — your tools should make you smile.*

These personas are designed to humanize the clinical AI architecture, mitigate physician burnout through warmth and humor, and give practitioners an intuitive mental model for the system's internal reasoning.

---

### 7.1 The Four Diagnostic Agents (`LlmAgent` Experts)

Each agent represents a specialized diagnostic lens within the `@google/adk` `InMemoryRunner` orchestrator.

#### 🔭 **Gulliver** — *The Overview Agent*
> *"I see the whole ocean from up here."*

| Attribute | Detail |
|:---|:---|
| **Role** | Synthesizes the patient's full clinical picture — history, vitals, symptom matrix |
| **Props** | Brass telescope, weathered captain's logbook, compass rose pinned to chest |
| **Personality** | Calm, encyclopedic, slightly professorial. Speaks in measured, complete assessments. |
| **Visual Accent** | `brand-blue-500` — the surveyor's blue |
| **Maps to** | `overview_agent` in the ADK orchestrator |

---

#### ⚡ **Swoop** — *The Interventions Agent*
> *"Spotted. Locked. Delivering."*

| Attribute | Detail |
|:---|:---|
| **Role** | Handles actionable Care Plan recommendations — prescriptions, procedures, referrals |
| **Props** | Leather medical satchel slung crossbody, stethoscope draped around neck, aviator goggles pushed up on forehead |
| **Personality** | Decisive, direct, action-oriented. Gets to the point. Swoops in with exactly what's needed. |
| **Visual Accent** | `brand-green-500` — the go-signal green |
| **Maps to** | `interventions_agent` in the ADK orchestrator |

---

#### 🔦 **Sentinel** — *The Monitoring Agent*
> *"I never blink. I never look away."*

| Attribute | Detail |
|:---|:---|
| **Role** | Keeps a watchful eye on the patient's recovery trajectory, vital trends, and warning signs |
| **Props** | Lighthouse keeper's peaked cap, binoculars hanging from a braided lanyard, miniature signal lantern |
| **Personality** | Vigilant, patient, quietly reassuring. Notices the small changes before anyone else. |
| **Visual Accent** | `brand-amber-500` — the caution amber of a lighthouse beam |
| **Maps to** | `monitoring_agent` in the ADK orchestrator |

---

#### 📖 **Scribes** — *The Education Agent*
> *"Let me explain that in a way that actually helps."*

| Attribute | Detail |
|:---|:---|
| **Role** | Translates Care Plans into accessible, patient-friendly formats — pediatric PDFs, dyslexia-friendly layouts, multilingual exports |
| **Props** | Round reading spectacles, open storybook tucked under one wing, ink quill behind one ear, tiny chalkboard |
| **Personality** | Warm, patient, gently encouraging. Uses analogies and stories. Makes complex medicine feel approachable for children and families. |
| **Visual Accent** | `brand-red-500` — the warm pedagogical red |
| **Maps to** | `education_agent` in the ADK orchestrator |

---

### 7.2 Core Architecture Personas

#### 🪺 **The Nest** — *The ADK InMemoryRunner Orchestrator*
> *"Everything you need is safe and warm right here."*

| Attribute | Detail |
|:---|:---|
| **Role** | The `@google/adk` orchestrator that holds context-aware memory of clinician voice prompts, report history, and multi-turn conversation state |
| **Representation** | Not a single bird — it's a **cozy woven nest** resting on a windswept clifftop. Inside: four eggs, each tinted to match the four agents (`blue`, `green`, `amber`, `red`). |
| **Metaphor** | A safe, organized home where all patient data is gathered, warmed, and nurtured until the agents are ready to take flight. |

---

#### ⚡ **Skimmer** — *The `gemini-2.5-flash` Foundation Model*
> *"Blink and you'll miss me."*

| Attribute | Detail |
|:---|:---|
| **Role** | The ultra-fast, lightweight inference backbone powering all streaming AI responses |
| **Props** | Sleek racing goggles, aerodynamic feathers slicked back, a faint speed-blur trail behind the wingtips |
| **Personality** | Blazingly fast, efficient, no wasted motion. Skims the surface of the data ocean and returns with exactly what's needed. |
| **Visual Accent** | Electric cyan speed lines |
| **Fun Fact** | Named after the *Black Skimmer* (Rynchops niger), a seagull-relative famous for its unique lower-mandible-first fishing technique — skimming the water's surface at incredible speed. Perfect for a model that achieves 100/100 Lighthouse performance. |

---

### 7.3 UI Feature Personas

#### 🌊 **Breeze** — *The Box Breathing UX*
> *"In… hold… out… hold… You're doing great, Doc."*

| Attribute | Detail |
|:---|:---|
| **Role** | The 16-second box breathing animation integrated into primary intake text areas |
| **Props** | Eyes peacefully closed, feathers gently ruffled by a light wind, perched on a small cumulus cloud, a single dandelion seed drifting past |
| **Personality** | Serene, unhurried, grounding. A gentle reminder that even the clinician needs a breath. |
| **Metaphor** | The calm at the center of the clinical storm. |

---

#### 💀 **Mariner** — *The 3D Body Map & Skeletal Viewer*
> *"These bones have stories to tell."*

| Attribute | Detail |
|:---|:---|
| **Role** | The Three.js anatomical model — skeletal, surface, and interior views |
| **Props** | Captain's tricorn hat, a rolled-up antique anatomy chart under one wing, a brass divider compass for measuring |
| **Personality** | Old-salt adventurer with an anatomist's precision. Maps every bone and joint like charting a new coastline. |
| **Visual Accent** | Warm parchment, turquoise acetate, and coral marker — `#F9F3D9`, `#2AA4A0`, `#EF6658` |
| **Papercraft Layering** | Interactive 3-layer flip: 📄 *Paper Skin*, 🎞️ *Acetate Film Transparency*, 💀 *Ink & Watercolor Core* |
| **Easter Egg** | The skeleton in the viewer is internally nicknamed "Mariner's Bones" |

---

### 7.4 Enterprise & Safety Personas

#### 🏥 **Stratosphere** — *Vertex AI Enterprise Layer*
> *"I fly at a higher altitude. Better coverage, stricter rules."*

| Attribute | Detail |
|:---|:---|
| **Role** | The Vertex AI Enterprise migration — regional ADC-authenticated endpoints, custom safety thresholds, and enterprise-grade IAM |
| **Props** | Corporate flight suit with Google Cloud logo patch, dual-antenna radio headset, altitude altimeter clipped to a belt |
| **Personality** | Precise, compliance-aware, authoritative. Speaks in formal SLAs and never takes shortcuts on security. |
| **Visual Accent** | Cloud blue — `#1A73E8` |
| **Fun Fact** | Stratosphere is the layer above where ordinary seagulls fly — fitting for a model that runs above the standard developer API ceiling. |

---

#### 🌊 **Relay** — *The WebSocket Live Proxy*
> *"Every message gets through. Perfectly translated. Every time."*

| Attribute | Detail |
|:---|:---|
| **Role** | The bidirectional `/ws/gemini-live` Express WebSocket proxy — camelCase↔snake_case translation, setup path rewrites, full-duplex live audio streaming |
| **Props** | Vintage switchboard headset with both earpieces active, a spiral-bound translation dictionary tucked under one wing, two-way radio in the other |
| **Personality** | Tireless, precise, never drops a packet. Quietly translates between worlds without anyone noticing the seams. |
| **Visual Accent** | Signal green — `#34A853` |
| **Fun Fact** | Named after the *relay race* — Relay never runs the whole race alone, just passes the baton perfectly between the browser and the cloud. |

---

#### 🚨 **Samaritan** — *Good Samaritan Emergency Care Mode*
> *"I don't wait for Wi-Fi. Lives don't wait for Wi-Fi."*

| Attribute | Detail |
|:---|:---|
| **Role** | The offline emergency override — 110 BPM chest-compression metronome, BLS safety-gated Gemini Nano local routing, FHIR-compliant EMT QR code serialization, global telemetry suppression |
| **Props** | Red cross armband, a defibrillator paddle in one wing and a `lean-qr` QR code printout in the other, a stopwatch around the neck counting compressions |
| **Personality** | Calm under pressure, decisive, zero hesitation. Doesn't need the cloud to save a life. |
| **Visual Accent** | Emergency red — `#EA4335` with a pulse animation |
| **Fun Fact** | The name is a direct nod to the Good Samaritan laws that protect bystanders who provide emergency care — Samaritan acts first and asks questions later. |

---

### 7.5 The Squadron at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                     🪺  THE NEST                            │
│              (ADK InMemoryRunner Orchestrator)               │
│                                                             │
│    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│    │ 🔭       │ │ ⚡       │ │ 🔦       │ │ 📖       │     │
│    │ Gulliver │ │ Swoop    │ │ Sentinel │ │ Scribes  │     │
│    │ Overview │ │ Interv.  │ │ Monitor  │ │ Educate  │     │
│    │ 🔵       │ │ 🟢       │ │ 🟡       │ │ 🔴       │     │
│    └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                        │                                    │
│                   ⚡ Skimmer                                │
│              (gemini-2.5-flash)                              │
│                   ┌──────────┐                              │
│                   │ 🌊 Relay │                              │
│                   │ (WS Proxy│                              │
│                   └────┬─────┘                              │
│                   ┌────▼─────┐                              │
│                   │ 🏥       │                              │
│                   │ Strato.  │                              │
│                   │(Vertex AI│                              │
│                   └──────────┘                              │
└─────────────────────────────────────────────────────────────┘

        🌊 Breeze          💀 Mariner         🚨 Samaritan
     (Box Breathing)     (3D Body Map)     (Emergency Care)
```

### 7.6 Contextual UI Appearances & Prop Watermarks
Every diagnostic agent "signs" its clinical section cards with its signature SVG prop badge:

- **Gulliver** (*Overview*): 🔭 **Brass Telescope & Compass Rose** watermark on Summary Overview cards.
- **Swoop** (*Interventions*): ⚡ **Aviator Satchel & Stethoscope** watermark on Treatment Matrix & Dosing cards.
- **Sentinel** (*Monitoring*): 🔦 **Signal Lantern & Lighthouse Cap** watermark on Recovery Trend charts.
- **Scribes** (*Education*): 📖 **Ink Quill & Storybook** watermark on Patient Education & Dyslexia exports.

---

## 8. Responsive Breakpoints

| Viewport | Target Device | Adaptations |
|:---|:---|:---|
| `≤ 280px` | Pixel Watch 2, wearables | Single-column, 5rem mascot, compressed buttons |
| `≤ 380px` | Compact phones (Pixel 9) | Reduced mascot margin, tighter border-radius |
| `≤ 640px` | Standard mobile | Stacked layout, mobile tab switcher, back-to-chart nav |
| `≥ 768px` | Tablets, desktops | Split-panel grid, resizable columns, hover tooltips |
| `≥ 1024px` | Wide desktop | Full three-column layout with gamification HUD |

---

## 9. Print & Export

The `.rams-typography` system extends to PDF export via jsPDF, supporting:

- **Standard** — Full clinical prose
- **Dyslexia-Friendly** — OpenDyslexic font, increased letter/word spacing
- **Pediatric** — Simplified vocabulary, larger type, friendly emoji markers
- **Multilingual** — Professional translation into ES, DE, FR, ZH

All export modes use the Dieter Rams "carousel informatics" layout — clean columns, generous white space, and the origami seagull watermark in the footer.

---

## 10. Accessibility

- Full keyboard navigation with visible focus rings
- `prefers-reduced-motion` respected globally
- ARIA labels on all interactive elements
- Color contrast ratios meet WCAG AA minimum
- Screen reader compatible status indicators
- Gesture unlock includes hidden `input[type=password]` for Playwright/AT compatibility

---

*© 2026 Pocket Gull. Industrial Grace & Clinical Intelligence.*
*All seagulls depicted in this document are fictional. No actual seagulls were given stethoscopes.*
